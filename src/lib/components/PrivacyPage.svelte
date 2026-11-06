<script>
	import { link as resolve } from '#lib/paths.js';
	import { privacy } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';
	import { richText, parseDay } from '#lib/text.js';
	import Head from './Head.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	/** @type {{lang: 'pl'|'en'}} */
	let { lang } = $props();

	const ui = $derived(UI[lang]);
	const r = $derived(ROUTES[lang]);
	const title = $derived(`${ui.privacy} | Harris Piano Jazz Bar, Kraków`);
	const description = $derived(
		lang === 'pl'
			? 'Polityka prywatności strony Harris Piano Jazz Bar w Krakowie: jakie dane zbiera formularz rezerwacji, w jakim celu, jak długo i jakie masz prawa.'
			: 'Privacy policy of the Harris Piano Jazz Bar website in Kraków: what the reservation form collects, why, for how long and what your rights are.'
	);
	const updated = $derived(new Intl.DateTimeFormat(ui.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(parseDay(privacy.updated)));
	const alternates = { pl: ROUTES.pl.privacy, en: ROUTES.en.privacy };
</script>

<Head {lang} {title} {description} path={r.privacy} {alternates} robots="index, follow" />

<a class="skip" href="#{r.anchors.content}">{ui.skip}</a>
<Header {lang} {alternates} />

<main id={r.anchors.content} class="wrap">
	<p class="kicker">Harris Piano Jazz Bar · Kraków</p>
	<h1 class="title">{ui.privacy}</h1>
	<div class="prose">
		<p>{privacy.intro[lang]}</p>
		{#each privacy.sections as s, i (i)}
			<h2>{s.heading[lang]}</h2>
			{@html richText(s.body[lang])}
		{/each}
		<h2>{lang === 'pl' ? 'Zmiany' : 'Changes'}</h2>
		<p>{lang === 'pl' ? 'Aktualna wersja polityki prywatności jest zawsze dostępna na tej stronie.' : 'The current version of this policy is always available on this page.'} {ui.lastUpdate}: {updated}.</p>
	</div>
	<div class="page-actions">
		<a class="btn btn-red" href="{resolve(r.home)}#{r.anchors.reserve}">{ui.backToBooking}</a>
		<a class="btn btn-ghost" href={resolve(r.home)}>{ui.home}</a>
	</div>
</main>

<Footer {lang} />
