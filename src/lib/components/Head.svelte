<script>
	import { file as asset } from '#lib/paths.js';
	import { ASSET_VERSION } from '#lib/config.js';
	import { texts } from '#lib/content.js';
	import { UI } from '#lib/i18n.js';
	import { abs, OG_IMAGE } from '#lib/seo.js';

	/**
	 * @type {{
	 *   lang: 'pl'|'en', title: string, description: string, path: string,
	 *   alternates?: {pl: string, en: string} | null, jsonld?: string, robots?: string,
	 *   preload?: {src: string, srcSmall: string, width: number, widthSmall: number} | null
	 * }}
	 */
	let { lang, title, description, path, alternates = null, jsonld = '', robots = 'index, follow, max-image-preview:large, max-video-preview:-1', preload = null } = $props();

	const other = $derived(lang === 'pl' ? 'en' : 'pl');
	const ui = $derived(UI[lang]);
	const ldTag = $derived(jsonld ? `<script type="application/ld+json">${jsonld}</` + 'script>' : '');
	const indexable = $derived(!robots.startsWith('noindex'));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if indexable}
		<link rel="canonical" href={abs(path)} />
		{#if alternates}
			<link rel="alternate" hreflang="pl" href={abs(alternates.pl)} />
			<link rel="alternate" hreflang="en" href={abs(alternates.en)} />
			<link rel="alternate" hreflang="x-default" href={abs(alternates.pl)} />
		{/if}
	{/if}
	<meta name="robots" content={robots} />

	{#if indexable}
		<meta property="og:type" content="website" />
		<meta property="og:locale" content={ui.ogLocale} />
		{#if alternates}<meta property="og:locale:alternate" content={UI[other].ogLocale} />{/if}
		<meta property="og:site_name" content="Harris Piano Jazz Bar" />
		<meta property="og:title" content={title} />
		<meta property="og:description" content={description} />
		<meta property="og:url" content={abs(path)} />
		<meta property="og:image" content={abs(OG_IMAGE)} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={texts.seo.ogImageAlt[lang]} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}

	<link rel="icon" href={asset('/favicon.ico')} sizes="any" />
	<link rel="icon" href={asset('/assets/icons/favicon-48.png')} sizes="48x48" type="image/png" />
	<link rel="icon" href={asset('/assets/icons/favicon-192.png')} sizes="192x192" type="image/png" />
	<link rel="apple-touch-icon" href={asset('/assets/icons/apple-touch-icon-180.png')} />

	<link rel="preload" href={asset('/assets/fonts/fira-sans-normal-latin-300.woff2')} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={asset('/assets/fonts/cormorant-garamond-italic-latin.woff2')} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={asset('/assets/fonts/fira-sans-normal-latin-500.woff2')} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={asset('/assets/fonts/cinzel-normal-latin.woff2')} as="font" type="font/woff2" crossorigin="anonymous" />
	{#if preload}
		<link rel="preload" as="image" href={asset(preload.src)} imagesrcset="{asset(preload.srcSmall)} {preload.widthSmall}w, {asset(preload.src)} {preload.width}w" imagesizes="100vw" fetchpriority="high" />
	{/if}
	{@html '<script>document.documentElement.classList.add("has-js");</' + 'script>'}
	<link rel="stylesheet" href="{asset('/assets/css/style.css')}?v={ASSET_VERSION}" />
	{@html ldTag}
</svelte:head>
