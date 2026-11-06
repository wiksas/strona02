<script>
	import { link as resolve } from '#lib/paths.js';
	import { site, texts, upcomingConcerts } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';
	import { pageGraph, musicEvent } from '#lib/seo.js';
	import { todayInWarsaw } from '#lib/text.js';
	import Head from './Head.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import EventCard from './EventCard.svelte';
	import Body from './Body.svelte';

	/** @type {{lang: 'pl'|'en'}} */
	let { lang } = $props();

	const ui = $derived(UI[lang]);
	const r = $derived(ROUTES[lang]);
	const today = todayInWarsaw();
	const concerts = upcomingConcerts();
	const title = $derived(texts.seo.concertsTitle[lang]);
	const description = $derived(texts.seo.concertsDescription[lang]);
	const tel = `tel:${site.phoneIntl.replace(/\s/g, '')}`;
</script>

<Head
	{lang}
	{title}
	{description}
	path={r.concerts}
	alternates={{ pl: ROUTES.pl.concerts, en: ROUTES.en.concerts }}
	jsonld={pageGraph({ lang, path: r.concerts, title, description, extra: concerts.map((c) => musicEvent(c, lang)) })}
/>

<a class="skip" href="#{r.anchors.content}">{ui.skip}</a>
<Header {lang} alternates={{ pl: ROUTES.pl.concerts, en: ROUTES.en.concerts }} />

<main id={r.anchors.content} class="wrap">
	<p class="kicker">{texts.concerts.kicker[lang]}</p>
	<h1 class="title">{texts.concerts.pageTitle[lang]}</h1>
	<p class="lead page-lead">{texts.concerts.pageLead[lang]}</p>

	<ol class="events events--page" id="events">
		{#each concerts as c (c.slug)}
			<EventCard concert={c} {lang} {today} />
		{/each}
		<li class="events-empty" hidden={concerts.length > 0}>{ui.noConcerts}</li>
	</ol>

	<div class="page-actions">
		<a class="btn btn-red" href="{resolve(r.home)}#{r.anchors.reserve}">{ui.concert.book}</a>
		<a class="btn btn-ghost" href={tel}>{ui.call}: {lang === 'pl' ? site.phone : site.phoneIntl}</a>
		<a class="btn btn-ghost" href={resolve(r.home)}>{ui.home}</a>
	</div>
</main>

<Footer {lang} />
<Body scripts={['events']} />
