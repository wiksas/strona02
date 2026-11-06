/* Pomocnicze funkcje treści — wspólne dla strony (renderowanie) i panelu (podgląd, slugi). */

/** @param {string} s */
function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** @param {string} url */
function safeUrl(url) {
	return /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : '#';
}

/** Formatowanie w jednej linii: **pogrubienie**, [tekst](adres). @param {string} s */
function inline(s) {
	return escapeHtml(s)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
			const href = safeUrl(url.replace(/&amp;/g, '&'));
			const ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
			return `<a href="${escapeHtml(href)}"${ext}>${text}</a>`;
		});
}

/**
 * Prosty format tekstu z panelu: pusta linia = nowy akapit, linie zaczynające się od „- ” = lista,
 * pojedynczy enter = nowa linia, **pogrubienie**, [link](adres). Wynik jest bezpiecznym HTML.
 * @param {string} src
 */
export function richText(src = '') {
	return src
		.trim()
		.split(/\n\s*\n/)
		.filter(Boolean)
		.map((block) => {
			const lines = block.split('\n').map((l) => l.trim());
			if (lines.every((l) => l.startsWith('- '))) {
				return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
			}
			return `<p>${lines.map(inline).join('<br>')}</p>`;
		})
		.join('');
}

/** Usuwa formatowanie (np. do opisów meta i danych dla Google). @param {string} src */
export function plainText(src = '') {
	return src
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/^- /gm, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Zdanie z wyróżnionymi słowami: *słowo* → <span class="hl">słowo</span>.
 * @param {string} src
 */
export function highlighted(src = '') {
	return escapeHtml(src).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');
}

/** Adres URL z tekstu: małe litery, bez polskich znaków, myślniki. @param {string} s */
export function slugify(s) {
	const map = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
	return s
		.toLowerCase()
		.replace(/[ąćęłńóśźż]/g, (c) => map[c])
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/&/g, ' i ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/** Cena koncertu do wyświetlenia. @param {{priceFrom: number|null, priceTo: number|null}} c @param {'pl'|'en'} lang */
export function formatPrice(c, lang) {
	if (c.priceFrom == null) return '';
	const cur = lang === 'pl' ? 'zł' : 'PLN';
	return c.priceTo != null && c.priceTo !== c.priceFrom ? `${c.priceFrom}–${c.priceTo} ${cur}` : `${c.priceFrom} ${cur}`;
}

/** Przesunięcie strefy czasowej Krakowa w danym dniu (czas letni / zimowy), np. „+01:00”. @param {string} day RRRR-MM-DD */
export function warsawOffset(day) {
	const [Y, M, D] = day.split('-').map(Number);
	const probe = new Date(Date.UTC(Y, M - 1, D, 12));
	const local = new Date(probe.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
	const utc = new Date(probe.toLocaleString('en-US', { timeZone: 'UTC' }));
	const h = Math.round((local.getTime() - utc.getTime()) / 3600000);
	return `${h >= 0 ? '+' : '-'}${String(Math.abs(h)).padStart(2, '0')}:00`;
}

/** Dzisiejsza data w Krakowie jako RRRR-MM-DD. */
export function todayInWarsaw() {
	return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
}

/** @param {string} day RRRR-MM-DD */
export function parseDay(day) {
	const [Y, M, D] = day.split('-').map(Number);
	return new Date(Y, M - 1, D);
}
