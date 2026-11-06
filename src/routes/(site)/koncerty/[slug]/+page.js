import { error } from '@sveltejs/kit';
import { allConcerts } from '#lib/content.js';

/* Strona każdego koncertu — także minionych, żeby stare linki (np. z Facebooka) dalej działały. */
export const entries = () => allConcerts.map((c) => ({ slug: c.slug }));

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const concert = allConcerts.find((c) => c.slug === params.slug);
	if (!concert) error(404, 'Not found');
	return { concert };
}
