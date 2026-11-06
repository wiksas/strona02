/* Dane strukturalne (JSON-LD) budowane z treści. Wszystkie adresy bezwzględne — z domeną docelową. */
import { SITE_URL } from './config.js';
import { site, texts, faq, photo } from './content.js';
import { ROUTES } from './i18n.js';
import { plainText, warsawOffset } from './text.js';

/** @param {string} path ścieżka od katalogu głównego, np. „/en/” */
export const abs = (path) => SITE_URL + path;

export const OG_IMAGE = '/assets/img/harris-piano-jazz-bar-koncert-krakow-og.jpg';
const BAR_ID = abs('/#bar');
const SITE_ID = abs('/#website');

export const venue = () => ({
	'@type': 'BarOrPub',
	name: site.name,
	address: {
		'@type': 'PostalAddress',
		streetAddress: site.address.street,
		postalCode: site.address.postalCode,
		addressLocality: site.address.city,
		addressRegion: site.address.region,
		addressCountry: site.address.country
	}
});

function bar(lang) {
	return {
		'@type': 'BarOrPub',
		'@id': BAR_ID,
		name: site.name,
		url: abs('/'),
		description: plainText(texts.seo.description[lang]),
		telephone: site.phoneIntl,
		email: site.email,
		image: [abs(OG_IMAGE), ...[texts.hero.image, texts.about.photoA, texts.about.photoB].map((id) => abs(photo(id).src))],
		logo: abs('/assets/img/harris-piano-jazz-bar-logo-czarne-tlo.webp'),
		address: venue().address,
		areaServed: { '@type': 'City', name: site.address.city },
		hasMap: site.googleMaps,
		sameAs: [site.facebook],
		openingHoursSpecification: site.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens })),
		foundingDate: site.foundingDate,
		acceptsReservations: true,
		hasMenu: abs(ROUTES[lang].home + '#' + ROUTES[lang].anchors.menu)
	};
}

const website = () => ({ '@type': 'WebSite', '@id': SITE_ID, url: abs('/'), name: site.name, inLanguage: ['pl', 'en'], publisher: { '@id': BAR_ID } });

/** @param {{lang: 'pl'|'en', path: string, title: string, description: string}} p */
function webPage({ lang, path, title, description }) {
	return {
		'@type': 'WebPage',
		'@id': abs(path) + '#webpage',
		url: abs(path),
		name: title,
		description,
		inLanguage: lang,
		isPartOf: { '@id': SITE_ID },
		about: { '@id': BAR_ID },
		primaryImageOfPage: { '@type': 'ImageObject', url: abs(OG_IMAGE), width: 1200, height: 630 }
	};
}

/** Koncert jako MusicEvent. @param {any} c @param {'pl'|'en'} lang */
export function musicEvent(c, lang) {
	const desc = plainText(c.description[lang] || c.description.pl);
	/** @type {Record<string, any>} */
	const node = {
		'@type': 'MusicEvent',
		name: c.title,
		startDate: `${c.date}T${c.time}:00${warsawOffset(c.date)}`,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: venue(),
		organizer: { '@type': 'Organization', name: site.name, url: abs('/') },
		image: [abs(OG_IMAGE)],
		url: abs(ROUTES[lang].concert(c.slug))
	};
	if (desc) node.description = desc.length > 300 ? desc.slice(0, 297) + '…' : desc;
	if (c.priceFrom != null) {
		node.offers =
			c.priceTo != null && c.priceTo !== c.priceFrom
				? { '@type': 'AggregateOffer', lowPrice: c.priceFrom, highPrice: c.priceTo, priceCurrency: 'PLN', url: node.url, availability: 'https://schema.org/InStock' }
				: { '@type': 'Offer', price: c.priceFrom, priceCurrency: 'PLN', url: node.url, availability: 'https://schema.org/InStock' };
	}
	return node;
}

/** Strona główna: WebSite, BarOrPub, WebPage, FAQPage i nadchodzące koncerty. */
export function homeGraph(lang, concerts) {
	const path = ROUTES[lang].home;
	const title = texts.seo.title[lang];
	const description = texts.seo.description[lang];
	return ld([
		website(),
		bar(lang),
		webPage({ lang, path, title, description }),
		{
			'@type': 'FAQPage',
			'@id': abs(path) + '#faq',
			url: abs(path),
			inLanguage: lang,
			isPartOf: { '@id': abs(path) + '#webpage' },
			mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: plainText(f.a[lang]) } }))
		},
		...concerts.map((c) => musicEvent(c, lang))
	]);
}

/** Podstrona: WebSite, BarOrPub, WebPage i opcjonalnie dodatkowe węzły (np. koncerty). */
export function pageGraph({ lang, path, title, description, extra = [] }) {
	return ld([website(), bar(lang), webPage({ lang, path, title, description }), ...extra]);
}

/** Bezpieczne osadzenie w <script> (bez możliwości zamknięcia znacznika z treści). */
function ld(graph) {
	return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
}
