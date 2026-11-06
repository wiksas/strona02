import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/* BASE_PATH: pusty dla własnej domeny (harris.krakow.pl), "/strona02" dla adresu github.io */
const base = /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '');

export default defineConfig({
	/* ścieżka bazowa dla stron, które muszą mieć adresy od katalogu głównego (404.html) */
	define: { __BASE_PATH__: JSON.stringify(base) },
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),
			paths: { base, relative: true },
			prerender: {
				entries: ['*', '/404.html', '/sitemap.xml'],
				handleHttpError: 'fail'
			}
		})
	]
});
