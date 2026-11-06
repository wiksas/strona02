import { gallery, menus, upcomingConcerts } from '#lib/content.js';
import { ROUTES } from '#lib/i18n.js';
import { abs, OG_IMAGE } from '#lib/seo.js';
import { todayInWarsaw } from '#lib/text.js';

export const prerender = true;
export const trailingSlash = 'never';

/* Mapa strony z treści: obie wersje językowe, program, koncerty od dziś, polityka prywatności, zdjęcia. */
export function GET() {
	const lastmod = todayInWarsaw();
	const images = [OG_IMAGE, ...gallery.map((g) => g.src), ...menus.map((m) => m.cover.src)].map(abs);

	/** @param {{pl: string, en: string}} pair @param {string[]} [imgs] */
	const pair = (pair, imgs = []) =>
		/** @type {const} */ (['pl', 'en'])
			.map((l) => {
				const alt = ['pl', 'en'].map((h) => `    <xhtml:link rel="alternate" hreflang="${h}" href="${abs(pair[h])}"/>`);
				alt.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pair.pl)}"/>`);
				const img = imgs.map((i) => `    <image:image><image:loc>${xml(i)}</image:loc></image:image>`);
				return ['  <url>', `    <loc>${abs(pair[l])}</loc>`, `    <lastmod>${lastmod}</lastmod>`, ...alt, ...img, '  </url>'].join('\n');
			})
			.join('\n');

	const urls = [
		pair({ pl: ROUTES.pl.home, en: ROUTES.en.home }, images),
		pair({ pl: ROUTES.pl.concerts, en: ROUTES.en.concerts }),
		...upcomingConcerts().map((c) => pair({ pl: ROUTES.pl.concert(c.slug), en: ROUTES.en.concert(c.slug) })),
		pair({ pl: ROUTES.pl.privacy, en: ROUTES.en.privacy })
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

/** @param {string} s */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
