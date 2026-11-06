/* Treść strony wczytywana podczas budowania (prerender). Panel CMS edytuje te same pliki przez GitHub. */
import site from '#content/site.json';
import texts from '#content/texts.json';
import concerts from '#content/concerts.json';
import gallery from '#content/gallery.json';
import menus from '#content/menus.json';
import faq from '#content/faq.json';
import legends from '#content/legends.json';
import partners from '#content/partners.json';
import privacy from '#content/privacy.json';
import { todayInWarsaw } from './text.js';

export { site, texts, gallery, menus, faq, legends, partners, privacy };

/** Wszystkie koncerty posortowane po dacie i godzinie. */
export const allConcerts = [...concerts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

/**
 * Koncerty od dziś (data budowania, czas Krakowa). Strona przebudowuje się codziennie,
 * a main.js dodatkowo ukrywa w przeglądarce koncerty, które już minęły.
 */
export function upcomingConcerts() {
	const today = todayInWarsaw();
	return allConcerts.filter((c) => c.date >= today);
}

/** @param {string} id */
export function photo(id) {
	return gallery.find((g) => g.id === id) ?? gallery[0];
}
