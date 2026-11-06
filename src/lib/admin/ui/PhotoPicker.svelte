<script>
	import { cms } from '../cms.svelte.js';

	/** Wybór zdjęcia z galerii (zapisuje jego identyfikator). @type {{label: string, value: string, name: string, help?: string}} */
	let { label, value = $bindable(), name, help = '' } = $props();
</script>

<fieldset class="picker">
	<legend>{label}</legend>
	{#if help}<p class="f-help">{help}</p>{/if}
	<div class="picker-grid">
		{#each cms.data.gallery as g (g.id)}
			<label class="picker-item" class:is-on={value === g.id}>
				<input type="radio" {name} value={g.id} bind:group={value} class="sr" />
				<img src={cms.imgUrl(g.srcSmall)} width={g.widthSmall} height={g.heightSmall} alt={g.alt.pl || 'Zdjęcie bez opisu'} loading="lazy" />
			</label>
		{/each}
	</div>
</fieldset>
