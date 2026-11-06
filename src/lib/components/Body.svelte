<script>
	import { file as asset } from '#lib/paths.js';
	import { ASSET_VERSION } from '#lib/config.js';

	/* Zwykłe skrypty (bez frameworka) — strona publiczna nie ładuje JS SvelteKit (csr = false).
	   events.js: ukrywa minione koncerty; main.js: interakcje strony głównej. */
	/** @type {{scripts?: string[]}} */
	let { scripts = ['events', 'main'] } = $props();

	const tags = $derived(scripts.map((s) => `<script src="${asset(`/assets/js/${s}.js`)}?v=${ASSET_VERSION}" defer></` + 'script>').join('\n'));
</script>

{@html tags}
