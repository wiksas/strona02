/* Ustawienia wspólne dla strony i panelu CMS. */

/** Adres docelowy strony — używany w canonical, hreflang, og:url, danych dla Google i sitemapie. */
export const SITE_URL = 'https://harris.krakow.pl';

/** Repozytorium, do którego panel zapisuje zmiany. */
export const REPO = { owner: 'wiksas', name: 'strona02', branch: 'main' };

/** Wersja CSS/JS w adresach (?v=…) — podbij po każdej zmianie plików w static/assets/css lub js. */
export const ASSET_VERSION = '20261106-4';

/** Pliki treści edytowane w panelu (ścieżki w repozytorium). */
export const CONTENT_FILES = {
	site: 'content/site.json',
	texts: 'content/texts.json',
	concerts: 'content/concerts.json',
	gallery: 'content/gallery.json',
	menus: 'content/menus.json',
	faq: 'content/faq.json',
	legends: 'content/legends.json',
	partners: 'content/partners.json',
	privacy: 'content/privacy.json'
};

/** Katalog plików statycznych w repozytorium (obrazy z panelu trafiają do static/assets/img/…). */
export const STATIC_DIR = 'static';
