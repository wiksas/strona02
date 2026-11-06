<script>
	import { file as asset, link as resolve } from '#lib/paths.js';
	import { site, texts, gallery, menus, faq, legends, photo, upcomingConcerts } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';
	import { homeGraph } from '#lib/seo.js';
	import { richText, highlighted, todayInWarsaw, parseDay } from '#lib/text.js';
	import Head from './Head.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import Hours from './Hours.svelte';
	import EventCard from './EventCard.svelte';
	import Body from './Body.svelte';

	/** @type {{lang: 'pl'|'en'}} */
	let { lang } = $props();

	const ui = $derived(UI[lang]);
	const r = $derived(ROUTES[lang]);
	const a = $derived(r.anchors);
	const t = texts;
	const today = todayInWarsaw();
	const upcoming = upcomingConcerts();
	const shown = upcoming.slice(0, 12);
	const first = upcoming[0];
	const hero = photo(t.hero.image);
	const photoA = photo(t.about.photoA);
	const photoB = photo(t.about.photoB);
	const tel = `tel:${site.phoneIntl.replace(/\s/g, '')}`;
	const phone = $derived(lang === 'pl' ? site.phone : site.phoneIntl);

	const firstDate = first ? parseDay(first.date) : null;
	const billTime = $derived(
		first
			? `${new Intl.DateTimeFormat(ui.locale, first.date === today ? { weekday: 'long' } : { weekday: 'long', day: 'numeric', month: 'long' }).format(firstDate)} · ${first.time}`
			: ''
	);

	/** Liczba z animacją (1997, 7/7, 4000+). @param {string} v */
	function stat(v) {
		const m = v.match(/^(\d+)(.*)$/);
		return m ? { n: m[1], rest: m[2], year: m[2] === '' && /^(19|20)\d\d$/.test(m[1]) } : null;
	}

	/** @param {any} p */
	const srcset = (p) => `${asset(p.srcSmall)} ${p.widthSmall}w, ${asset(p.src)} ${p.width}w`;
	const bookPages = (/** @type {any} */ m) => JSON.stringify(m.pages.map((p) => ({ src: asset(p.src), w: p.width, h: p.height })));
	const mapSrc = $derived(`https://www.google.com/maps?q=Harris+Piano+Jazz+Bar,+Rynek+G%C5%82%C3%B3wny+28,+31-010+Krak%C3%B3w&z=17&hl=${lang}&output=embed`);
	const directions = 'https://www.google.com/maps/dir/?api=1&destination=Harris+Piano+Jazz+Bar%2C+Rynek+G%C5%82%C3%B3wny+28%2C+Krak%C3%B3w';
</script>

<Head
	{lang}
	title={t.seo.title[lang]}
	description={t.seo.description[lang]}
	path={r.home}
	alternates={{ pl: ROUTES.pl.home, en: ROUTES.en.home }}
	jsonld={homeGraph(lang, upcoming.slice(0, 12))}
	preload={hero}
/>

<a class="skip" href="#{a.content}">{ui.skip}</a>
<div class="grain" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"><span></span></div>

<Header {lang} home alternates={{ pl: ROUTES.pl.home, en: ROUTES.en.home }} />

<main id={a.content}>
	<section class="hero" id="top" aria-labelledby="heroTitle" data-hide-callbar>
		<div class="hero-media">
			<img class="hero-img" src={asset(hero.src)} srcset={srcset(hero)} sizes="100vw" width={hero.width} height={hero.height} alt={hero.alt[lang]} fetchpriority="high" />
			<div class="hero-light" aria-hidden="true"></div>
			<div class="smoke smoke-a" aria-hidden="true"></div>
			<div class="smoke smoke-b" aria-hidden="true"></div>
		</div>

		<div class="hero-inner">
			<h1 class="hero-title" id="heroTitle">
				<img class="hero-logo" src={asset('/assets/img/harris-piano-jazz-bar-logo.webp')} width="274" height="118" alt={site.name} />
				<span class="hero-kicker">{t.hero.kicker[lang]}</span>
			</h1>
			<p class="hero-tagline">{t.hero.tagline[lang]}</p>
			<p class="genres">
				{#each t.hero.genres as g, i (g)}
					<span class={['g-jazz', 'g-blues', 'g-funk', 'g-soul', 'g-hh'][i % 5]}>{g}</span>
				{/each}<span class="g-dots" aria-hidden="true">…</span>
			</p>

			<a class="tonight" class:is-empty={!first} id="tonight" href="#{a.concerts}">
				<span class="tonight-label">{first && first.date === today ? ui.tonight : ui.next}</span>
				<strong class="tonight-name">{first?.title ?? ''}</strong>
				<span class="tonight-time">{billTime}</span>
			</a>

			<div class="hero-actions">
				<a class="btn btn-red" href="#{a.reserve}">{t.hero.ctaPrimary[lang]}</a>
				<a class="btn btn-ghost" href="#{a.find}">{t.hero.ctaSecondary[lang]}</a>
			</div>

			<Hours {lang} />
		</div>

		<a class="scroll-cue" href="#{a.concerts}">
			<span>{ui.scroll}<span class="sr">{ui.scrollSr}</span></span>
			<i aria-hidden="true"></i>
		</a>
	</section>

	<div class="marquee" aria-hidden="true">
		<div class="marquee-row">
			{#each [0, 1] as k (k)}
				<div class="marquee-track">
					{#each t.marquee.row1 as w, i (i)}<span>{w}</span><b>✦</b>{/each}
				</div>
			{/each}
		</div>
		<div class="marquee-row marquee-row--alt">
			{#each [0, 1] as k (k)}
				<div class="marquee-track">
					{#each [...t.marquee.row2[lang], ...t.marquee.row2[lang]] as w, i (i)}<span>{w}</span><b>♪</b>{/each}
				</div>
			{/each}
		</div>
	</div>

	<section class="section concerts" id={a.concerts} aria-labelledby="concertsTitle">
		<div class="wrap">
			<header class="section-head">
				<p class="kicker reveal">{t.concerts.kicker[lang]}</p>
				<h2 class="title reveal" id="concertsTitle">{t.concerts.title[lang]}</h2>
				<p class="lead reveal">{t.concerts.lead[lang]}</p>
			</header>

			<ol class="events" id="events" data-limit="8">
				{#each shown as c (c.slug)}
					<EventCard concert={c} {lang} {today} />
				{/each}
				<li class="events-empty" hidden={shown.length > 0}>{ui.noConcerts}</li>
			</ol>

			<div class="center reveal">
				<a class="btn btn-ghost" href={resolve(r.concerts)}>{ui.programLink}</a>
			</div>
		</div>
	</section>

	<section class="section about" id={a.about} aria-labelledby="aboutTitle">
		<div class="wrap about-grid">
			<div class="about-vinyl" aria-hidden="true">
				<div class="vinyl">
					<div class="vinyl-label"><img src={asset('/assets/img/harris-piano-jazz-bar-logo-czarne-tlo.webp')} width="300" height="194" alt="" loading="lazy" /></div>
				</div>
				<div class="tonearm"></div>
			</div>

			<div class="about-copy">
				<p class="kicker reveal">{t.about.kicker[lang]}</p>
				<h2 class="title reveal" id="aboutTitle">{t.about.title[lang]}</h2>
				<p class="statement" id="statement">{@html highlighted(t.about.statement[lang])}</p>
			</div>
		</div>

		<div class="wrap about-story">
			<figure class="story-photo story-photo--a">
				<img src={asset(photoA.src)} srcset={srcset(photoA)} sizes="(min-width: 900px) 30vw, 50vw" width={photoA.width} height={photoA.height} alt={photoA.alt[lang]} loading="lazy" />
			</figure>
			<div class="story-text">
				{#each t.about.paragraphs as p, i (i)}<p class="reveal">{p[lang]}</p>{/each}
			</div>
			<figure class="story-photo story-photo--b">
				<img src={asset(photoB.src)} srcset={srcset(photoB)} sizes="(min-width: 900px) 30vw, 50vw" width={photoB.width} height={photoB.height} alt={photoB.alt[lang]} loading="lazy" />
			</figure>
		</div>

		<dl class="wrap stats">
			{#each t.stats as s, i (i)}
				{@const v = s.value[lang]}
				{@const n = s.animate ? stat(v) : null}
				<div class="stat reveal">
					<dt class="sr">{s.term[lang]}</dt>
					<dd style="display:contents">
						{#if n && n.year}
							<strong data-count={n.n} data-plain>{v}</strong>
						{:else if n && n.rest}
							<strong><span data-count={n.n}>{n.n}</span>{n.rest}</strong>
						{:else if n}
							<strong data-count={n.n}>{v}</strong>
						{:else}
							<strong>{v}</strong>
						{/if}
						<span>{s.label[lang]}</span>
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="section legends" id={a.legends} aria-labelledby="legendsTitle">
		<div class="wrap">
			<header class="section-head section-head--center">
				<p class="kicker reveal">{t.legends.kicker[lang]}</p>
				<h2 class="title reveal" id="legendsTitle">{t.legends.title[lang]}</h2>
			</header>
			<ul class="legend-list reveal">
				{#each legends as name (name)}<li>{name}</li>{/each}
			</ul>
			<p class="legends-foot reveal">{t.legends.foot[lang]}</p>
		</div>
	</section>

	<section class="gallery" id={a.gallery} aria-labelledby="galleryTitle">
		<div class="wrap gallery-head">
			<div>
				<p class="kicker">{t.gallery.kicker[lang]}</p>
				<h2 class="title" id="galleryTitle">{t.gallery.title[lang]}</h2>
			</div>
			<div class="gallery-controls">
				<button class="gal-btn" type="button" data-dir="-1" aria-label={ui.galleryPrev} aria-controls="galleryTrack" disabled>‹</button>
				<p class="gal-count" aria-live="polite"><span id="galPos">1</span> / {gallery.length}</p>
				<button class="gal-btn" type="button" data-dir="1" aria-label={ui.galleryNext} aria-controls="galleryTrack">›</button>
			</div>
		</div>
		<ul class="gallery-track" id="galleryTrack" aria-label={ui.galleryLabel}>
			{#each gallery as g (g.id)}
				<li><button class="shot" type="button" data-full={asset(g.src)} aria-label="{ui.zoom}{g.alt[lang]}"><img src={asset(g.srcSmall)} srcset={srcset(g)} sizes="(max-width: 899px) 84vw, 50vw" width={g.width} height={g.height} alt={g.alt[lang]} loading="lazy" decoding="async" /></button></li>
			{/each}
		</ul>
		<p class="wrap gallery-hint">{ui.galleryHint}</p>
	</section>

	<section class="section menu-sec" id={a.menu} aria-labelledby="menuTitle">
		<div class="wrap">
			<header class="section-head section-head--center">
				<p class="kicker reveal">{t.menu.kicker[lang]}</p>
				<h2 class="title reveal" id="menuTitle">{t.menu.title[lang]}</h2>
				<p class="lead reveal">{t.menu.lead[lang]}</p>
			</header>
			<div class="menu-books">
				{#each menus as m (m.id)}
					<button class="book reveal" type="button" data-book={m.id} data-pages={bookPages(m)}>
						<span class="book-cover"><img src={asset(m.cover.src)} width={m.cover.width} height={m.cover.height} alt="" loading="lazy" /></span>
						<span class="book-label">
							<strong>{m.title[lang]}</strong>
							<small>{m.subtitle[lang]} · {ui.pages(m.pages.length)}</small>
						</span>
					</button>
				{/each}
			</div>
		</div>
	</section>

	<section class="section faq" id={a.faq} aria-labelledby="faqTitle">
		<div class="wrap">
			<header class="section-head">
				<p class="kicker reveal">{t.faq.kicker[lang]}</p>
				<h2 class="title reveal" id="faqTitle">{t.faq.title[lang]}</h2>
			</header>
			<div class="faq-list">
				{#each faq as f (f.q.pl)}
					<details class="faq-item reveal">
						<summary>{f.q[lang]}</summary>
						<div class="faq-a">{@html richText(f.a[lang])}</div>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<section class="section reserve" id={a.reserve} aria-labelledby="reservationTitle" data-hide-callbar>
		<div class="wrap reserve-grid">
			<div class="reserve-info">
				<p class="kicker reveal">{t.reservation.kicker[lang]}</p>
				<h2 class="title reveal" id="reservationTitle">{t.reservation.title[lang]}</h2>
				<a class="phone reveal" href={tel}>{phone}</a>
				<ul class="notes">
					{#each t.reservation.notes as n, i (i)}<li class="reveal">{n[lang]}</li>{/each}
					<li class="reveal">{ui.reservationEmail} <a href="mailto:{site.reservationEmail}">{site.reservationEmail}</a></li>
				</ul>
			</div>

			<form class="reserve-form reveal" id="reserveForm" novalidate data-email={site.reservationEmail} data-phone={phone}>
				<div class="field">
					<label for="f-name">{ui.form.name}</label>
					<input id="f-name" name="name" autocomplete="name" required aria-describedby="f-name-err" />
					<p class="field-error" id="f-name-err" hidden></p>
				</div>
				<div class="field">
					<label for="f-email">{ui.form.email}</label>
					<input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="f-email-err" />
					<p class="field-error" id="f-email-err" hidden></p>
				</div>
				<div class="field">
					<label for="f-phone">{ui.form.phone}</label>
					<input id="f-phone" name="phone" type="tel" autocomplete="tel" required aria-describedby="f-phone-err" />
					<p class="field-error" id="f-phone-err" hidden></p>
				</div>
				<div class="field field--half">
					<label for="f-people">{ui.form.people}</label>
					<input id="f-people" name="people" type="number" min="1" max="40" value="2" inputmode="numeric" required aria-describedby="f-people-err" />
					<p class="field-error" id="f-people-err" hidden></p>
				</div>
				<div class="field field--half field--date">
					<label for="f-date">{ui.form.date}</label>
					<input id="f-date" name="date" type="date" required aria-describedby="f-date-err" />
					<p class="field-error" id="f-date-err" hidden></p>
				</div>
				<div class="field field--half">
					<label for="f-time">{ui.form.time}</label>
					<input id="f-time" name="time" type="time" value="20:00" required aria-describedby="f-time-err" />
					<p class="field-error" id="f-time-err" hidden></p>
				</div>
				<div class="field field--full">
					<label for="f-notes">{ui.form.notes}</label>
					<textarea id="f-notes" name="notes" rows="3"></textarea>
				</div>
				<div class="hp" aria-hidden="true">
					<label for="f-website">{ui.form.honeypot}</label>
					<input id="f-website" name="website" tabindex="-1" autocomplete="off" />
				</div>
				<div class="consent">
					<input id="f-consent" name="consent" type="checkbox" required aria-describedby="f-consent-err" />
					<label for="f-consent">{ui.form.consentBefore}<a href={resolve(r.privacy)}>{ui.form.consentLink}</a>.</label>
					<p class="field-error" id="f-consent-err" hidden></p>
				</div>
				<div class="field--full form-foot">
					<button class="btn btn-red" type="submit">{ui.form.submit}</button>
					<p class="form-hint">{ui.form.hint} <a href={tel}>{phone}</a>.</p>
					<p class="form-status" id="formStatus" role="status" hidden></p>
				</div>
			</form>
		</div>
	</section>

	<section class="section find" id={a.find} aria-labelledby="findTitle" data-hide-callbar>
		<div class="wrap find-grid">
			<div class="find-info">
				<p class="kicker reveal">{t.find.kicker[lang]}</p>
				<h2 class="title reveal" id="findTitle">{t.find.title[lang]}</h2>
				<address class="reveal">
					<strong>{site.name}</strong>
					{site.address.street}<br />{site.address.postalCode} {site.address.city}{lang === 'en' ? ', Poland' : ''}
				</address>
				<Hours {lang} plain />
				<ul class="contact reveal">
					<li><a href={tel}>tel. {phone}</a></li>
					<li><a href="mailto:{site.email}">{site.email}</a></li>
					<li><a href={site.facebook} target="_blank" rel="noopener">{ui.facebookLink}</a></li>
				</ul>
				<div class="find-actions reveal">
					<a class="btn btn-red" href={directions} target="_blank" rel="noopener">{ui.directions}</a>
					{#if site.virtualTour}<a class="btn btn-ghost" href={site.virtualTour} target="_blank" rel="noopener">{ui.tour}</a>{/if}
				</div>
			</div>
			<div class="map" id="map" data-title={ui.mapTitle} data-src={mapSrc}>
				<div class="map-facade">
					<span class="map-pin" aria-hidden="true">⌖</span>
					<p>{t.find.mapNote[lang]}</p>
					<button class="btn btn-ghost" type="button" id="mapLoad">{ui.mapButton}</button>
					<p class="form-hint">{ui.mapPrivacy}</p>
				</div>
			</div>
		</div>
	</section>
</main>

<Footer {lang} full />

<div class="callbar is-hidden" id="callbar">
	<a class="btn btn-ghost" href={tel}>{ui.call}</a>
	<a class="btn btn-red" href="#{a.reserve}">{ui.bookShort}</a>
</div>

<dialog class="lightbox" id="lightbox" aria-label={ui.viewerLabel}>
	<button class="lb-close" type="button" data-lb="close" aria-label={ui.viewerClose}>×</button>
	<button class="lb-nav lb-prev" type="button" data-lb="prev" aria-label={ui.viewerPrev}>‹</button>
	<img id="lbImg" alt="" />
	<div class="lb-pages" id="lbPages"></div>
	<button class="lb-nav lb-next" type="button" data-lb="next" aria-label={ui.viewerNext}>›</button>
	<p class="lb-count" id="lbCount"></p>
</dialog>

<Body />
