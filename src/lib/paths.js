import { asset, resolve } from '$app/paths';

/**
 * Adres pliku z katalogu static/. Treść zapisuje ścieżki od katalogu głównego („/assets/…”),
 * a asset() w SvelteKit 3 oczekuje ich bez wiodącego ukośnika.
 * @param {string} path
 */
export const file = (path) => asset(/** @type {any} */ (path.replace(/^\/+/, '')));

/**
 * Adres podstrony z uwzględnieniem ścieżki bazowej. Ścieżki pochodzą z ROUTES (budowane z treści),
 * więc nie da się ich sprawdzić typami tras SvelteKit.
 * @param {string} path
 */
export const link = (path) => resolve(/** @type {any} */ (path));
