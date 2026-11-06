<script>
	import Text from './Text.svelte';

	/**
	 * Pole w dwóch językach: obiekt {pl, en}. Na komputerze obok siebie, na telefonie jedno pod drugim.
	 * @type {{id: string, label: string, value: {pl: string, en: string}, help?: string, multiline?: boolean, rows?: number, max?: number, requiredEn?: boolean, format?: boolean}}
	 */
	let { id, label, value = $bindable(), help = '', multiline = false, rows = 4, max = 0, requiredEn = true, format = false } = $props();

	const FORMAT = 'Pusta linia = nowy akapit · „- ” na początku linii = punkt listy · **tekst** = pogrubienie · [tekst](https://adres) = link';
</script>

<fieldset class="i18n">
	<legend>{label}</legend>
	<div class="i18n-grid">
		<Text id="{id}-pl" label="Po polsku" bind:value={value.pl} {multiline} {rows} {max} required lang="pl" />
		<Text id="{id}-en" label="Po angielsku" bind:value={value.en} {multiline} {rows} {max} required={requiredEn} lang="en" />
	</div>
	{#if help || format}<p class="f-help">{help}{help && format ? ' ' : ''}{format ? FORMAT : ''}</p>{/if}
</fieldset>
