<script>
	import { file as asset } from '#lib/paths.js';
	import '#lib/admin/admin.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Panel treści — Harris Piano Jazz Bar</title>
	<meta name="robots" content="noindex, nofollow" />
	<link rel="icon" href={asset('/assets/icons/favicon-48.png')} sizes="48x48" type="image/png" />
</svelte:head>

{@render children()}
