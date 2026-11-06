<script>
	import { site } from '#lib/content.js';

	/** @type {{lang: 'pl'|'en', plain?: boolean}} */
	let { lang, plain = false } = $props();
</script>

<dl class="hours" class:hours--plain={plain} class:reveal={plain}>
	{#each site.hours as h (h.label.pl)}
		<div>
			<dt>{h.label[lang]}</dt>
			<dd>{h.text[lang]}</dd>
		</div>
	{/each}
</dl>
