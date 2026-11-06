<script>
	import { SvelteSet } from 'svelte/reactivity';
	import { cms } from '../cms.svelte.js';
	import Text from '../ui/Text.svelte';
	import { slugify, todayInWarsaw, parseDay } from '#lib/text.js';

	const today = todayInWarsaw();
	/** slugi koncertów dodanych w tej sesji — tylko one mogą się jeszcze zmieniać (po zapisie są adresem strony) */
	const fresh = new SvelteSet();
	/** stabilne klucze dla listy (slug może się zmieniać przy pisaniu tytułu nowego koncertu) */
	const keys = new WeakMap();
	let nextKey = 0;
	const keyOf = (/** @type {any} */ c) => {
		if (!keys.has(c)) keys.set(c, ++nextKey);
		return keys.get(c);
	};
	let open = $state(/** @type {number|null} */ (null));
	let showPast = $state(false);

	const sorted = $derived([...cms.data.concerts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
	const upcoming = $derived(sorted.filter((c) => !c.date || c.date >= today));
	const past = $derived(sorted.filter((c) => c.date && c.date < today).reverse());

	/** @param {string} base @param {any} self */
	function uniqueSlug(base, self) {
		const taken = new Set(cms.data.concerts.filter((/** @type {any} */ c) => c !== self).map((/** @type {any} */ c) => c.slug));
		const root = base || 'koncert';
		let s = root;
		for (let n = 2; taken.has(s); n++) s = `${root}-${n}`;
		return s;
	}

	/** @param {any} c */
	function onTitle(c) {
		if (!fresh.has(c.slug)) return;
		fresh.delete(c.slug);
		c.slug = uniqueSlug(slugify(c.title), c);
		fresh.add(c.slug);
	}

	/** @param {any} [from] */
	function add(from) {
		const date = from ? shift(from.date, 7) : today;
		const c = from
			? { ...$state.snapshot(from), date, description: { ...$state.snapshot(from.description) } }
			: { slug: '', date, time: '21:30', title: '', priceFrom: null, priceTo: null, description: { pl: '', en: '' } };
		c.slug = uniqueSlug(slugify(c.title) || 'nowy-koncert', null);
		cms.data.concerts.push(c);
		const added = cms.data.concerts[cms.data.concerts.length - 1];
		fresh.add(added.slug);
		open = keyOf(added);
	}

	/** @param {any} c */
	function remove(c) {
		if (!confirm(`Usunąć koncert „${c.title || 'bez nazwy'}” (${c.date})? Jego strona przestanie istnieć.`)) return;
		const i = cms.data.concerts.indexOf(c);
		if (i >= 0) cms.data.concerts.splice(i, 1);
		fresh.delete(c.slug);
	}

	/** @param {string} day @param {number} n */
	function shift(day, n) {
		const d = parseDay(day || today);
		d.setDate(d.getDate() + n);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	const fmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });
	const label = (/** @type {any} */ c) => `${c.date ? fmt.format(parseDay(c.date)) : 'bez daty'} · ${c.time || '--:--'}`;
	const hasError = (/** @type {any} */ c) => Object.keys(cms.errors).some((k) => k.startsWith(`concert-${c.slug}-`));
</script>

<header class="sec-head">
	<div>
		<h2>Koncerty</h2>
		<p>Program na stronie głównej i na stronie „Program koncertów”. Każdy koncert ma też własną stronę. Koncerty, które się odbyły, same znikają z programu.</p>
	</div>
	<button type="button" class="btn" onclick={() => add()}>+ Dodaj koncert</button>
</header>

{#snippet concert(/** @type {any} */ c)}
	{@const k = keyOf(c)}
	<li class="card concert" class:card--error={hasError(c)}>
		<button type="button" class="concert-sum" aria-expanded={open === k} onclick={() => (open = open === k ? null : k)}>
			<span class="concert-date">{label(c)}</span>
			<span class="concert-title">{c.title || 'Nowy koncert — wpisz nazwę'}</span>
			<span class="concert-chev" aria-hidden="true">{open === k ? '▴' : '▾'}</span>
		</button>
		{#if open === k}
			<div class="concert-body">
				<div class="grid grid--concert">
					<div class="span-2">
						<Text id="concert-{c.slug}-title" label="Nazwa koncertu / zespołu" bind:value={c.title} required onchange={() => onTitle(c)} />
					</div>
					<Text id="concert-{c.slug}-date" label="Data" type="date" bind:value={c.date} required />
					<Text id="concert-{c.slug}-time" label="Godzina" type="time" bind:value={c.time} required />
					<Text id="concert-{c.slug}-price" label="Cena od (zł)" type="number" min="0" step="1" bind:value={c.priceFrom} help="Puste = wstęp wolny." />
					<Text id="concert-{c.slug}-priceTo" label="Cena do (zł)" type="number" min="0" step="1" bind:value={c.priceTo} help="Puste = jedna cena." />
				</div>
				<Text id="concert-{c.slug}-desc" label="Opis po polsku" multiline rows={7} bind:value={c.description.pl} required help="Pierwszy akapit pokazuje się na liście koncertów (dobrze sprawdza się tu skład zespołu, każdy muzyk w osobnej linii). Pusta linia = nowy akapit · **tekst** = pogrubienie · [tekst](https://adres) = link." />
				<Text id="concert-{c.slug}-desc-en" label="Opis po angielsku (opcjonalnie)" multiline rows={5} bind:value={c.description.en} lang="en" help="Bez opisu angielskiego na stronie EN pokaże się polski." />
				<p class="f-help">Adres strony koncertu: <code>/koncerty/{c.slug}/</code>{#if fresh.has(c.slug)} — ustali się po zapisaniu{/if}</p>
				<div class="row">
					<button type="button" class="btn btn--ghost" onclick={() => add(c)}>Powiel na następny tydzień</button>
					<button type="button" class="btn btn--danger" onclick={() => remove(c)}>Usuń koncert</button>
				</div>
			</div>
		{/if}
	</li>
{/snippet}

<h3 class="sub">Nadchodzące ({upcoming.length})</h3>
{#if upcoming.length}
	<ol class="cards">
		{#each upcoming as c (keyOf(c))}{@render concert(c)}{/each}
	</ol>
{:else}
	<p class="empty">Brak zaplanowanych koncertów. Strona pokaże komunikat, że program pojawi się wkrótce.</p>
{/if}

<h3 class="sub">
	<button type="button" class="link-btn" aria-expanded={showPast} onclick={() => (showPast = !showPast)}>
		{showPast ? '▾' : '▸'} Minione ({past.length})
	</button>
</h3>
{#if showPast}
	<p class="f-help">Strony minionych koncertów zostają, żeby stare linki działały. Można je usuwać.</p>
	<ol class="cards">
		{#each past as c (keyOf(c))}{@render concert(c)}{/each}
	</ol>
{/if}
