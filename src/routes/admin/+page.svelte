<script>
	import { onMount } from 'svelte';
	import { link as resolve } from '#lib/paths.js';
	import { cms } from '#lib/admin/cms.svelte.js';
	import Login from '#lib/admin/Login.svelte';
	import Concerts from '#lib/admin/sections/Concerts.svelte';
	import Texts from '#lib/admin/sections/Texts.svelte';
	import Site from '#lib/admin/sections/Site.svelte';
	import Faq from '#lib/admin/sections/Faq.svelte';
	import Gallery from '#lib/admin/sections/Gallery.svelte';
	import Menus from '#lib/admin/sections/Menus.svelte';
	import Legends from '#lib/admin/sections/Legends.svelte';
	import Partners from '#lib/admin/sections/Partners.svelte';
	import Privacy from '#lib/admin/sections/Privacy.svelte';

	const SECTIONS = [
		{ id: 'koncerty', label: 'Koncerty', keys: ['concerts'], component: Concerts },
		{ id: 'teksty', label: 'Teksty strony', keys: ['texts'], component: Texts },
		{ id: 'kontakt', label: 'Godziny i kontakt', keys: ['site'], component: Site },
		{ id: 'faq', label: 'Pytania (FAQ)', keys: ['faq'], component: Faq },
		{ id: 'galeria', label: 'Galeria', keys: ['gallery'], component: Gallery },
		{ id: 'menu', label: 'Karty menu', keys: ['menus'], component: Menus },
		{ id: 'grali', label: 'Grali u nas', keys: ['legends'], component: Legends },
		{ id: 'partnerzy', label: 'Partnerzy', keys: ['partners'], component: Partners },
		{ id: 'prywatnosc', label: 'Polityka prywatności', keys: ['privacy'], component: Privacy }
	];

	let current = $state('koncerty');
	let starting = $state(true);
	let startError = $state('');
	const section = $derived(SECTIONS.find((s) => s.id === current) ?? SECTIONS[0]);
	const errorKeys = $derived(Object.keys(cms.errors));

	/* sekcje z błędami walidacji (prefiks id pola → zakładka) */
	const PREFIX = { koncerty: 'concert-', teksty: 'texts-', kontakt: 'site-', faq: 'faq-', galeria: 'gallery-', menu: 'menu-', partnerzy: 'partner-', prywatnosc: 'privacy-' };
	const hasErrors = (/** @type {string} */ id) => errorKeys.some((k) => k.startsWith(PREFIX[/** @type {keyof typeof PREFIX} */ (id)] ?? '\0') || (id === 'kontakt' && k.startsWith('hours-')));

	onMount(() => {
		const fromHash = location.hash.slice(1);
		if (SECTIONS.some((s) => s.id === fromHash)) current = fromHash;
		cms
			.restore()
			.catch((e) => (startError = e.message))
			.finally(() => (starting = false));
		const guard = (/** @type {BeforeUnloadEvent} */ e) => {
			if (cms.changeCount) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		addEventListener('beforeunload', guard);
		return () => removeEventListener('beforeunload', guard);
	});

	/** @param {string} id */
	function go(id) {
		current = id;
		history.replaceState(null, '', `#${id}`);
		document.getElementById('content')?.focus({ preventScroll: true });
		scrollTo({ top: 0 });
	}

	async function save() {
		const ok = await cms.save();
		if (ok === false && errorKeys.length) {
			const first = SECTIONS.find((s) => hasErrors(s.id));
			if (first && first.id !== current) go(first.id);
		}
	}

	async function reload() {
		if (cms.changeCount && !confirm('Wczytać treść od nowa? Niezapisane zmiany przepadną.')) return;
		cms.notice = null;
		try {
			await cms.load();
		} catch (e) {
			cms.notice = { type: 'error', text: /** @type {Error} */ (e).message };
		}
	}

	function logout() {
		if (cms.changeCount && !confirm('Wylogować się? Niezapisane zmiany przepadną.')) return;
		cms.logout();
	}
</script>

{#if starting}
	<main class="center-screen"><p class="spinner">Ładowanie panelu…</p></main>
{:else if !cms.user || !cms.loaded}
	{#if cms.busy}
		<main class="center-screen"><p class="spinner">{cms.busy}</p></main>
	{:else}
		{#if startError}<p class="banner banner--error" role="alert">{startError}</p>{/if}
		<Login />
	{/if}
{:else}
	<div class="app">
		<header class="topbar">
			<div class="topbar-brand">
				<strong>Harris</strong> <span>Panel treści</span>
			</div>
			<div class="topbar-actions">
				<a class="btn btn--ghost btn--small" href={resolve('/')} target="_blank" rel="noopener">Zobacz stronę ↗</a>
				<span class="user"><img src={cms.user.avatar} alt="" width="28" height="28" /> {cms.user.login}</span>
				<button type="button" class="btn btn--ghost btn--small" onclick={logout}>Wyloguj</button>
			</div>
		</header>

		<nav class="sidebar" aria-label="Sekcje panelu">
			{#each SECTIONS as s (s.id)}
				{@const dirty = s.keys.some((k) => cms.dirtyKeys.includes(/** @type {any} */ (k))) || (s.id === 'galeria' && cms.uploads.size > 0)}
				<button type="button" class="nav-item" class:is-on={current === s.id} aria-current={current === s.id ? 'page' : undefined} onclick={() => go(s.id)}>
					{s.label}
					{#if hasErrors(s.id)}<span class="dot dot--error" title="Błędy do poprawy">!</span>{:else if dirty}<span class="dot" title="Niezapisane zmiany">•</span>{/if}
				</button>
			{/each}
		</nav>

		<main id="content" class="content" tabindex="-1">
			{#if cms.notice}
				<div class="banner banner--{cms.notice.type}" role={cms.notice.type === 'error' ? 'alert' : 'status'}>
					<p>{cms.notice.text}</p>
					{#if cms.notice.link}
						<p class="banner-links">{#each cms.notice.link as l (l.href)}<a href={l.href} target="_blank" rel="noopener">{l.label} ↗</a>{/each}</p>
					{/if}
					<button type="button" class="banner-close" aria-label="Zamknij komunikat" onclick={() => (cms.notice = null)}>×</button>
				</div>
			{/if}
			{#key section.id}
				<section.component />
			{/key}
		</main>

		<footer class="savebar" class:is-dirty={cms.changeCount > 0}>
			<p class="savebar-status" aria-live="polite">
				{#if cms.busy}{cms.busy}{:else if cms.changeCount}Niezapisane zmiany: {cms.changeCount}{:else}Wszystko zapisane{/if}
			</p>
			<div class="row">
				<button type="button" class="btn btn--ghost" onclick={reload} disabled={!!cms.busy}>Wczytaj ponownie</button>
				<button type="button" class="btn" onclick={save} disabled={!cms.changeCount || !!cms.busy}>{cms.busy ? 'Zapisuję…' : 'Zapisz i opublikuj'}</button>
			</div>
		</footer>
	</div>
{/if}
