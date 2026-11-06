<script>
	import { link as resolve } from '#lib/paths.js';
	import { site, texts, upcomingConcerts } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';
	import { pageGraph, musicEvent } from '#lib/seo.js';
	import { formatPrice, parseDay, plainText, richText, todayInWarsaw } from '#lib/text.js';
	import Head from './Head.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import EventCard from './EventCard.svelte';
	import Body from './Body.svelte';

	/** @type {{lang: 'pl'|'en', concert: any}} */
	let { lang, concert: c } = $props();

	const ui = $derived(UI[lang]);
	const r = $derived(ROUTES[lang]);
	const today = todayInWarsaw();
	const date = $derived(parseDay(c.date));
	const longDate = $derived(new Intl.DateTimeFormat(ui.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date));
	const shortDate = $derived(new Intl.DateTimeFormat(ui.locale, { day: 'numeric', month: 'long' }).format(date));
	const price = $derived(formatPrice(c, lang));
	/* opis EN jest opcjonalny — bez niego pokazujemy polski (oznaczony lang="pl") */
	const descLang = $derived(c.description[lang] ? lang : 'pl');
	const desc = $derived(c.description[descLang] ?? '');
	const others = $derived(upcomingConcerts().filter((o) => o.slug !== c.slug).slice(0, 4));
	const tel = `tel:${site.phoneIntl.replace(/\s/g, '')}`;

	/* tytuł ≤ ok. 60 znaków i opis ≤ 160 znaków, budowane z danych koncertu */
	const title = $derived.by(() => {
		const tail = ` – ${shortDate} | Harris Kraków`;
		const name = c.title.length + tail.length > 62 ? c.title.slice(0, 62 - tail.length - 1).trimEnd() + '…' : c.title;
		return name + tail;
	});
	const description = $derived.by(() => {
		const head = lang === 'pl'
			? `${c.title}: koncert na żywo w Harris Piano Jazz Bar, Rynek Główny 28 w Krakowie, ${shortDate}, ${c.time}.`
			: `${c.title}: live concert at Harris Piano Jazz Bar, Rynek Główny 28, Kraków, ${shortDate}, ${c.time}.`;
		const extra = plainText(desc);
		const full = extra ? `${head} ${extra}` : head;
		return full.length > 158 ? full.slice(0, 157).replace(/\s+\S*$/, '') + '…' : full;
	});
	const path = $derived(r.concert(c.slug));
	const alternates = $derived({ pl: ROUTES.pl.concert(c.slug), en: ROUTES.en.concert(c.slug) });
	const isPast = $derived(c.date < today);
</script>

<Head
	{lang}
	{title}
	{description}
	{path}
	{alternates}
	jsonld={pageGraph({ lang, path, title, description, extra: [musicEvent(c, lang)] })}
/>

<a class="skip" href="#{r.anchors.content}">{ui.skip}</a>
<Header {lang} {alternates} />

<main id={r.anchors.content} class="wrap concert-page">
	<p class="kicker"><a href={resolve(r.concerts)}>{ui.concert.backToProgram}</a></p>
	<h1 class="title">{c.title}</h1>

	<dl class="concert-facts">
		<div>
			<dt>{ui.concert.start}</dt>
			<dd><time datetime="{c.date}T{c.time}">{longDate}, {c.time}</time></dd>
		</div>
		<div>
			<dt>{ui.concert.tickets}</dt>
			<dd>{price || ui.concert.free}</dd>
		</div>
		<div>
			<dt>{ui.nav.find}</dt>
			<dd>{site.name}, {site.address.street}, {site.address.city}</dd>
		</div>
	</dl>

	{#if desc}
		<div class="prose concert-desc" lang={descLang === lang ? undefined : descLang}>{@html richText(desc)}</div>
	{/if}

	<div class="page-actions">
		{#if !isPast}<a class="btn btn-red" href="{resolve(r.home)}#{r.anchors.reserve}">{ui.concert.book}</a>{/if}
		<a class="btn btn-ghost" href={tel}>{ui.call}: {lang === 'pl' ? site.phone : site.phoneIntl}</a>
		<a class="btn btn-ghost" href={resolve(r.concerts)}>{ui.programLink}</a>
	</div>

	{#if others.length}
		<section class="concert-more" aria-labelledby="moreTitle">
			<h2 class="concert-more-title" id="moreTitle">{ui.concert.moreConcerts}</h2>
			<ol class="events" id="events" data-limit="4">
				{#each others as o (o.slug)}
					<EventCard concert={o} {lang} {today} />
				{/each}
			</ol>
		</section>
	{/if}
</main>

<Footer {lang} />
<Body scripts={['events']} />
