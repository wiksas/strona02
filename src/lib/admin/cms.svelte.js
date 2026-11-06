/* Stan panelu: wczytana treść, wykrywanie niezapisanych zmian, zdjęcia do wysłania/usunięcia, zapis. */
import { file as asset } from '#lib/paths.js';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { CONTENT_FILES, STATIC_DIR, REPO } from '#lib/config.js';
import { slugify } from '#lib/text.js';
import { GitHub, GitHubError, blobToBase64, clearToken, loadToken, saveToken } from './github.js';

/** @typedef {keyof typeof CONTENT_FILES} ContentKey */

export const SECTION_NAMES = /** @type {Record<ContentKey, string>} */ ({
	concerts: 'koncerty',
	texts: 'teksty',
	site: 'godziny i kontakt',
	faq: 'FAQ',
	gallery: 'galeria',
	menus: 'karty menu',
	legends: 'grali u nas',
	partners: 'partnerzy',
	privacy: 'polityka prywatności'
});

/** Tak samo sformatowany JSON jak pliki w repozytorium (2 spacje, znak nowej linii na końcu). */
export const serialize = (/** @type {any} */ v) => JSON.stringify(v, null, 2) + '\n';

class CMS {
	/** @type {{login: string, name: string, avatar: string} | null} */
	user = $state(null);
	/** @type {Record<string, any>} */
	data = $state({});
	loaded = $state(false);
	busy = $state('');
	/** @type {{type: 'ok'|'error', text: string, link?: {href: string, label: string}[]} | null} */
	notice = $state(null);
	/** @type {Record<string, string>} błędy pól (id pola → komunikat) */
	errors = $state({});
	/** zdjęcia przygotowane do wysłania: ścieżka w repo → plik */
	uploads = new SvelteMap();
	/** pliki do usunięcia (ścieżki w repo) */
	deletions = new SvelteSet();

	/** @type {Record<string, string>} */
	#original = $state({});
	/** @type {Record<string, string>} sha plików w chwili wczytania */
	#shas = {};
	/** podglądy zdjęć już wysłanych (do czasu przebudowania strony) */
	#previews = new SvelteMap();
	/** @type {GitHub | null} */
	#gh = null;

	dirtyKeys = $derived(
		/** @type {ContentKey[]} */ (Object.keys(CONTENT_FILES)).filter(
			(k) => this.data[k] !== undefined && serialize($state.snapshot(this.data[k])) !== this.#original[k]
		)
	);
	changeCount = $derived(this.dirtyKeys.length + this.uploads.size + this.deletions.size);

	/* ---------- logowanie ---------- */
	/** @param {string} token @param {boolean} remember */
	async login(token, remember) {
		const gh = new GitHub(token.trim());
		const user = await gh.verify();
		saveToken(token.trim(), remember);
		this.#gh = gh;
		this.user = user;
		await this.load();
	}

	async restore() {
		const token = loadToken();
		if (!token) return false;
		try {
			const gh = new GitHub(token);
			this.user = await gh.verify();
			this.#gh = gh;
			await this.load();
			return true;
		} catch (e) {
			if (e instanceof GitHubError && (e.status === 401 || e.status === 403)) clearToken();
			throw e;
		}
	}

	logout() {
		clearToken();
		this.user = null;
		this.#gh = null;
		this.data = {};
		this.#original = {};
		this.loaded = false;
		this.#discardFiles();
	}

	/* ---------- wczytanie treści ---------- */
	async load() {
		const gh = /** @type {GitHub} */ (this.#gh);
		this.busy = 'Wczytuję treść strony…';
		try {
			const entries = await Promise.all(
				Object.entries(CONTENT_FILES).map(async ([key, path]) => {
					const { text, sha } = await gh.readText(path);
					return /** @type {const} */ ([key, path, JSON.parse(text), sha]);
				})
			);
			/** @type {Record<string, any>} */
			const data = {};
			/** @type {Record<string, string>} */
			const original = {};
			for (const [key, path, value, sha] of entries) {
				data[key] = value;
				original[key] = serialize(value);
				this.#shas[path] = sha;
			}
			this.#discardFiles();
			this.#original = original;
			this.data = data;
			this.errors = {};
			this.loaded = true;
		} finally {
			this.busy = '';
		}
	}

	#discardFiles() {
		for (const u of this.uploads.values()) URL.revokeObjectURL(u.url);
		this.uploads.clear();
		this.deletions.clear();
	}

	/* ---------- zdjęcia ---------- */
	/** Adres podglądu zdjęcia (nowe — z pamięci przeglądarki, istniejące — ze strony). @param {string} src */
	imgUrl(src) {
		const path = STATIC_DIR + src;
		return this.uploads.get(path)?.url ?? this.#previews.get(path) ?? asset(/** @type {any} */ (src));
	}

	/** Dodaje plik do wysłania; zwraca ścieżkę „/assets/…” do zapisania w JSON. @param {string} src @param {Blob} blob */
	addUpload(src, blob) {
		const path = STATIC_DIR + src;
		this.deletions.delete(path);
		this.uploads.set(path, { blob, url: URL.createObjectURL(blob) });
		return src;
	}

	/** Usuwa zdjęcie: nowe po prostu odrzuca, istniejące oznacza do usunięcia z repozytorium. @param {string} src */
	removeFile(src) {
		const path = STATIC_DIR + src;
		const up = this.uploads.get(path);
		if (up) {
			URL.revokeObjectURL(up.url);
			this.uploads.delete(path);
		} else {
			this.deletions.add(path);
		}
	}

	/** Zmienia nazwę zdjęcia, które jeszcze nie zostało wysłane. @param {string} from @param {string} to */
	#renameUpload(from, to) {
		const up = this.uploads.get(STATIC_DIR + from);
		if (!up || from === to) return from;
		this.uploads.delete(STATIC_DIR + from);
		this.uploads.set(STATIC_DIR + to, up);
		return to;
	}

	/** Nowe zdjęcia galerii dostają przed wysłaniem opisowe nazwy plików z polskiego opisu (dla Google). */
	#nameNewPhotos() {
		const used = new Set(this.data.gallery.map((/** @type {any} */ g) => g.src.replace(/-\d+\.\w+$/, '')));
		for (const g of this.data.gallery) {
			const m = g.src.match(/^\/assets\/img\/galeria\/nowe-[a-z0-9]+-\d+\.(\w+)$/);
			if (!m || !this.uploads.has(STATIC_DIR + g.src)) continue;
			const root = `/assets/img/galeria/${slugify(g.alt.pl).slice(0, 60) || 'zdjecie'}-harris-krakow`;
			let stem = root;
			for (let n = 2; used.has(stem); n++) stem = `${root}-${n}`;
			used.add(stem);
			g.src = this.#renameUpload(g.src, `${stem}-${g.width}.${m[1]}`);
			g.srcSmall = this.#renameUpload(g.srcSmall, `${stem}-${g.widthSmall}.${g.srcSmall.split('.').pop()}`);
		}
	}

	/* ---------- walidacja ---------- */
	validate() {
		/** @type {Record<string, string>} */
		const e = {};
		const d = this.data;
		const req = (/** @type {string} */ id, /** @type {any} */ v, /** @type {string} */ msg) => {
			if (v === undefined || v === null || String(v).trim() === '') e[id] = msg;
		};
		d.concerts?.forEach((/** @type {any} */ c) => {
			req(`concert-${c.slug}-title`, c.title, 'Podaj nazwę koncertu.');
			req(`concert-${c.slug}-date`, c.date, 'Podaj datę.');
			if (!/^\d{2}:\d{2}$/.test(c.time ?? '')) e[`concert-${c.slug}-time`] = 'Podaj godzinę w formacie GG:MM.';
			req(`concert-${c.slug}-desc`, c.description?.pl, 'Opis po polsku jest wymagany.');
			if (c.priceFrom != null && c.priceTo != null && c.priceTo < c.priceFrom) e[`concert-${c.slug}-price`] = 'Cena „do” nie może być niższa niż „od”.';
		});
		d.gallery?.forEach((/** @type {any} */ g) => {
			req(`gallery-${g.id}-pl`, g.alt?.pl, 'Opisz zdjęcie po polsku (co na nim widać).');
			req(`gallery-${g.id}-en`, g.alt?.en, 'Opisz zdjęcie po angielsku.');
		});
		d.faq?.forEach((/** @type {any} */ f, /** @type {number} */ i) => {
			req(`faq-${i}-q-pl`, f.q?.pl, 'Podaj pytanie po polsku.');
			req(`faq-${i}-a-pl`, f.a?.pl, 'Podaj odpowiedź po polsku.');
			req(`faq-${i}-q-en`, f.q?.en, 'Podaj pytanie po angielsku.');
			req(`faq-${i}-a-en`, f.a?.en, 'Podaj odpowiedź po angielsku.');
		});
		d.partners?.forEach((/** @type {any} */ p, /** @type {number} */ i) => {
			req(`partner-${i}-name`, p.name, 'Podaj nazwę partnera.');
			req(`partner-${i}-alt-pl`, p.alt?.pl, 'Opisz logo (zwykle: nazwa partnera).');
			req(`partner-${i}-alt-en`, p.alt?.en, 'Opisz logo po angielsku.');
			if (!p.logo) e[`partner-${i}-logo`] = 'Wgraj logo partnera.';
		});
		d.menus?.forEach((/** @type {any} */ m) => {
			if (!m.pages?.length) e[`menu-${m.id}-pages`] = 'Karta musi mieć co najmniej jedną stronę.';
		});
		if (d.texts) {
			for (const l of ['pl', 'en']) {
				req(`texts-seo-title-${l}`, d.texts.seo.title[l], 'Tytuł strony jest wymagany.');
				req(`texts-seo-description-${l}`, d.texts.seo.description[l], 'Opis strony jest wymagany.');
			}
		}
		if (d.site) {
			req('site-phone', d.site.phone, 'Podaj telefon.');
			req('site-email', d.site.email, 'Podaj e-mail.');
			req('site-reservationEmail', d.site.reservationEmail, 'Podaj e-mail do rezerwacji.');
		}
		this.errors = e;
		return Object.keys(e).length === 0;
	}

	/* ---------- zapis ---------- */
	async save() {
		const gh = /** @type {GitHub} */ (this.#gh);
		if (!this.changeCount) return;
		if (!this.validate()) {
			const n = Object.keys(this.errors).length;
			this.notice = { type: 'error', text: `Nie zapisano — ${n === 1 ? 'jedno pole wymaga' : `${n} ${plural(n)} ${plural(n) === 'pola' ? 'wymagają' : 'wymaga'}`} poprawy (oznaczone na czerwono).` };
			return false;
		}
		if (this.data.gallery) this.#nameNewPhotos();
		const keys = [...this.dirtyKeys];
		/** @type {Array<{path: string, text?: string, base64?: string}>} */
		const files = keys.map((k) => ({ path: CONTENT_FILES[k], text: serialize($state.snapshot(this.data[k])) }));
		const uploads = [...this.uploads.entries()];
		for (const [path, u] of uploads) files.push({ path, base64: await blobToBase64(u.blob) });
		const deletions = [...this.deletions];
		/** @type {Record<string, string>} */
		const expected = Object.fromEntries(keys.map((k) => [CONTENT_FILES[k], this.#shas[CONTENT_FILES[k]]]));
		const parts = keys.map((k) => SECTION_NAMES[k]);
		if (uploads.length || deletions.length) parts.push('zdjęcia');
		const message = `CMS: ${[...new Set(parts)].join(', ')} (${this.user?.login})`;

		this.notice = null;
		try {
			const result = await gh.commit({ files, deletions, message, expected, onProgress: (m) => (this.busy = m) });
			for (const k of keys) {
				const path = CONTENT_FILES[k];
				this.#original[k] = serialize($state.snapshot(this.data[k]));
				this.#shas[path] = result.blobShas[path];
			}
			for (const [path, u] of uploads) {
				this.#previews.set(path, u.url);
				this.uploads.delete(path);
			}
			this.deletions.clear();
			this.notice = {
				type: 'ok',
				text: 'Zapisano. Strona zaktualizuje się za około 1–2 minuty.',
				link: [
					{ href: result.url, label: 'Zobacz zmianę' },
					{ href: `https://github.com/${REPO.owner}/${REPO.name}/actions`, label: 'Stan publikacji' }
				]
			};
			return true;
		} catch (e) {
			const conflict = /** @type {any} */ (e).conflicts;
			this.notice = {
				type: 'error',
				text: conflict
					? `${/** @type {Error} */ (e).message} Twoje zmiany NIE zostały zapisane. Skopiuj ważne teksty, kliknij „Wczytaj ponownie” i wprowadź je jeszcze raz.`
					: /** @type {Error} */ (e).message
			};
			return false;
		} finally {
			this.busy = '';
		}
	}
}

/** @param {number} n */
function plural(n) {
	return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'pola' : 'pól';
}

export const cms = new CMS();
