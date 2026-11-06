<script>
	import { ASSET_VERSION } from '#lib/config.js';
	import { site } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';

	/* Ta strona może być pokazana pod dowolnym adresem, więc wszystkie ścieżki są od katalogu głównego
	   (z uwzględnieniem ścieżki bazowej), a nie względne. */
	const base = __BASE_PATH__;
	const ui = UI.pl;
	const a = ROUTES.pl.anchors;
	const tel = `tel:${site.phoneIntl.replace(/\s/g, '')}`;
</script>

<svelte:head>
	<title>{ui.notFound.title} | Harris Piano Jazz Bar</title>
	<meta name="robots" content="noindex, follow" />
	<link rel="icon" href="{base}/favicon.ico" sizes="any" />
	<link rel="icon" href="{base}/assets/icons/favicon-48.png" sizes="48x48" type="image/png" />
	<link rel="stylesheet" href="{base}/assets/css/style.css?v={ASSET_VERSION}" />
</svelte:head>

<a class="skip" href="#{a.content}">{ui.skip}</a>
<header class="site-header is-solid">
	<a class="brand" href="{base}/"><img src="{base}/assets/img/harris-piano-jazz-bar-logo.webp" width="274" height="118" alt={ui.brandHomeAlt} /></a>
</header>

<main id={a.content} class="wrap">
	<p class="kicker">{ui.notFound.kicker}</p>
	<h1 class="title">{ui.notFound.heading}</h1>
	<div class="prose">
		<p>{ui.notFound.text}</p>
		<p lang="en">{ui.notFound.en} <a href="{base}/en/">{ui.notFound.enLink}</a>.</p>
	</div>
	<div class="page-actions">
		<a class="btn btn-red" href="{base}/">{ui.home}</a>
		<a class="btn btn-ghost" href="{base}{ROUTES.pl.concerts}">{ui.nav.concerts}</a>
		<a class="btn btn-ghost" href="{base}/#{a.reserve}">{ui.concert.book}</a>
		<a class="btn btn-ghost" href={tel}>{ui.call}: {site.phone}</a>
	</div>
</main>
