<script>
	import { file as asset, link as resolve } from '#lib/paths.js';
	import { UI, ROUTES } from '#lib/i18n.js';

	/** @type {{lang: 'pl'|'en', home?: boolean, alternates?: {pl: string, en: string} | null}} */
	let { lang, home = false, alternates = null } = $props();

	const ui = $derived(UI[lang]);
	const a = $derived(ROUTES[lang].anchors);
	/* na podstronach linki do sekcji prowadzą na stronę główną */
	const to = $derived((/** @type {string} */ id) => (home ? `#${id}` : `${resolve(ROUTES[lang].home)}#${id}`));
	const logo = asset('/assets/img/harris-piano-jazz-bar-logo.webp');
</script>

<header class="site-header" class:is-solid={!home} id={home ? 'siteHeader' : undefined}>
	{#if home}
		<a class="brand" href="#top"><img src={logo} width="274" height="118" alt={ui.brandAlt} /></a>
		<nav class="nav" id="nav" aria-label={ui.navLabel}>
			<a href={to(a.concerts)}>{ui.nav.concerts}</a>
			<a href={to(a.about)}>{ui.nav.about}</a>
			<a href={to(a.gallery)}>{ui.nav.gallery}</a>
			<a href={to(a.menu)}>{ui.nav.menu}</a>
			<a href={to(a.faq)}>{ui.nav.faq}</a>
			<a href={to(a.find)}>{ui.nav.find}</a>
			<a href={to(a.reserve)} class="nav-cta">{ui.nav.reserve}</a>
		</nav>
	{:else}
		<a class="brand" href={resolve(ROUTES[lang].home)}><img src={logo} width="274" height="118" alt={ui.brandHomeAlt} /></a>
	{/if}
	<div class="header-tools">
		{#if alternates}
			<nav class="lang" aria-label={ui.langLabel}>
				{#each /** @type {const} */ (['pl', 'en']) as l (l)}
					{#if l === lang}
						<a href={resolve(alternates[l])} hreflang={l} lang={l} aria-current="page">{l.toUpperCase()}</a>
					{:else}
						<a href={resolve(alternates[l])} hreflang={l} lang={l} title={ui.otherLangTitle}>{l.toUpperCase()}</a>
					{/if}
				{/each}
			</nav>
		{/if}
		{#if home}
			<button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="nav">
				<span></span><span></span><span class="sr">{ui.menuOpen}</span>
			</button>
		{/if}
	</div>
</header>
