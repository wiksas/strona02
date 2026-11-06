/* Klient GitHub API dla panelu: logowanie tokenem, odczyt plików treści, zapis jednym commitem.
   Adres API można podmienić WYŁĄCZNIE do testów: localStorage['harris-cms-api'] = 'http://127.0.0.1:8787'
   (lokalny serwer udający GitHub). Domyślnie https://api.github.com. */
import { REPO } from '#lib/config.js';

const TOKEN_KEY = 'harris-cms-token';

export function apiBase() {
	try {
		return localStorage.getItem('harris-cms-api') || 'https://api.github.com';
	} catch {
		return 'https://api.github.com';
	}
}

export class GitHubError extends Error {
	/** @param {string} message @param {number} status */
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}

/* ---------- token ---------- */
export function loadToken() {
	return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
}
/** @param {string} token @param {boolean} remember */
export function saveToken(token, remember) {
	sessionStorage.setItem(TOKEN_KEY, token);
	if (remember) localStorage.setItem(TOKEN_KEY, token);
	else localStorage.removeItem(TOKEN_KEY);
}
export function clearToken() {
	sessionStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(TOKEN_KEY);
}

/* ---------- kodowanie ---------- */
/** @param {string} b64 */
export function decodeBase64Utf8(b64) {
	const bin = atob(b64.replace(/\s/g, ''));
	return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
/** @param {Blob} blob @returns {Promise<string>} base64 bez prefiksu data: */
export function blobToBase64(blob) {
	return new Promise((res, rej) => {
		const r = new FileReader();
		r.onload = () => res(String(r.result).split(',')[1] ?? '');
		r.onerror = () => rej(r.error);
		r.readAsDataURL(blob);
	});
}
/** Ścieżka w repozytorium zakodowana do adresu (z zachowaniem „/”). @param {string} path */
const encPath = (path) => path.split('/').map(encodeURIComponent).join('/');

/* ---------- klient ---------- */
export class GitHub {
	/** @param {string} token */
	constructor(token) {
		this.token = token;
		this.base = apiBase();
		this.repoPath = `/repos/${REPO.owner}/${REPO.name}`;
	}

	/** @param {string} path @param {RequestInit & {json?: any}} [opts] */
	async req(path, opts = {}) {
		const { json, ...init } = opts;
		let res;
		try {
			res = await fetch(this.base + path, {
				...init,
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${this.token}`,
					'X-GitHub-Api-Version': '2022-11-28',
					...(json !== undefined ? { 'Content-Type': 'application/json' } : {})
				},
				body: json !== undefined ? JSON.stringify(json) : init.body,
				cache: 'no-store'
			});
		} catch {
			throw new GitHubError('Brak połączenia z GitHubem. Sprawdź internet i spróbuj ponownie.', 0);
		}
		if (!res.ok) {
			let msg = '';
			try {
				msg = (await res.json()).message || '';
			} catch {
				/* brak treści */
			}
			if (res.status === 401) throw new GitHubError('Token jest nieprawidłowy albo wygasł. Utwórz nowy i zaloguj się ponownie.', 401);
			if (res.status === 403) throw new GitHubError(`Brak uprawnień (${msg || 'odmowa dostępu'}). Token musi mieć uprawnienie „Contents: Read and write” do repozytorium.`, 403);
			if (res.status === 404) throw new GitHubError(`Nie znaleziono: ${path}. Sprawdź, czy token ma dostęp do repozytorium ${REPO.owner}/${REPO.name}.`, 404);
			if (res.status === 409 || res.status === 422) throw new GitHubError(`GitHub odrzucił zmianę: ${msg}`, res.status);
			throw new GitHubError(`Błąd GitHuba (${res.status}): ${msg}`, res.status);
		}
		return res.status === 204 ? null : res.json();
	}

	/** Sprawdza token: zwraca użytkownika; rzuca błąd, gdy brak prawa zapisu. */
	async verify() {
		const [user, repo] = await Promise.all([this.req('/user'), this.req(this.repoPath)]);
		if (!repo.permissions?.push) {
			throw new GitHubError(`Konto ${user.login} widzi repozytorium, ale nie może w nim zapisywać. Nadaj tokenowi uprawnienie „Contents: Read and write”.`, 403);
		}
		return { login: user.login, name: user.name || user.login, avatar: user.avatar_url };
	}

	/** Plik tekstowy z gałęzi. @param {string} path */
	async readText(path) {
		const f = await this.req(`${this.repoPath}/contents/${encPath(path)}?ref=${REPO.branch}`);
		return { text: decodeBase64Utf8(f.content), sha: /** @type {string} */ (f.sha) };
	}

	/** Aktualny sha pliku na gałęzi (null, gdy nie istnieje). @param {string} path */
	async currentSha(path) {
		try {
			const f = await this.req(`${this.repoPath}/contents/${encPath(path)}?ref=${REPO.branch}`);
			return /** @type {string} */ (f.sha);
		} catch (e) {
			if (e instanceof GitHubError && e.status === 404) return null;
			throw e;
		}
	}

	/**
	 * Jeden commit ze wszystkimi zmianami.
	 * @param {{
	 *   files: Array<{path: string, text?: string, base64?: string}>,
	 *   deletions: string[],
	 *   message: string,
	 *   expected?: Record<string, string | null>,
	 *   onProgress?: (msg: string) => void
	 * }} p expected = sha plików w chwili wczytania (ochrona przed nadpisaniem cudzych zmian)
	 */
	async commit({ files, deletions, message, expected = {}, onProgress = () => {} }) {
		onProgress('Sprawdzam, czy nikt w międzyczasie nie zmienił treści…');
		const conflicts = [];
		for (const [path, sha] of Object.entries(expected)) {
			if ((await this.currentSha(path)) !== sha) conflicts.push(path);
		}
		if (conflicts.length) {
			const err = new GitHubError(`Ktoś inny zmienił w międzyczasie: ${conflicts.join(', ')}.`, 409);
			/** @type {any} */ (err).conflicts = conflicts;
			throw err;
		}

		const ref = await this.req(`${this.repoPath}/git/ref/heads/${REPO.branch}`);
		const parent = ref.object.sha;
		const parentCommit = await this.req(`${this.repoPath}/git/commits/${parent}`);

		/** @type {Record<string, string>} */
		const blobShas = {};
		let i = 0;
		for (const f of files) {
			onProgress(`Wysyłam pliki (${++i}/${files.length})…`);
			const blob = await this.req(`${this.repoPath}/git/blobs`, {
				method: 'POST',
				json: f.base64 !== undefined ? { content: f.base64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' }
			});
			blobShas[f.path] = blob.sha;
		}

		onProgress('Tworzę commit…');
		const tree = await this.req(`${this.repoPath}/git/trees`, {
			method: 'POST',
			json: {
				base_tree: parentCommit.tree.sha,
				tree: [
					...files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', sha: blobShas[f.path] })),
					...deletions.map((path) => ({ path, mode: '100644', type: 'blob', sha: null }))
				]
			}
		});
		const commit = await this.req(`${this.repoPath}/git/commits`, {
			method: 'POST',
			json: { message, tree: tree.sha, parents: [parent] }
		});
		onProgress('Zapisuję na gałęzi…');
		await this.req(`${this.repoPath}/git/refs/heads/${REPO.branch}`, { method: 'PATCH', json: { sha: commit.sha, force: false } });
		return { sha: /** @type {string} */ (commit.sha), url: `https://github.com/${REPO.owner}/${REPO.name}/commit/${commit.sha}`, blobShas };
	}
}
