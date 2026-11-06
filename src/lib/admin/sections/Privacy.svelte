<script>
	import { cms } from '../cms.svelte.js';
	import Text from '../ui/Text.svelte';
	import I18n from '../ui/I18n.svelte';
	import List from '../ui/List.svelte';
</script>

<header class="sec-head">
	<div>
		<h2>Polityka prywatności</h2>
		<p>Strony „Polityka prywatności” (PL) i „Privacy policy” (EN). Po każdej zmianie ustaw datę ostatniej aktualizacji.</p>
	</div>
</header>

<div class="card">
	<Text id="privacy-updated" label="Data ostatniej zmiany" type="date" bind:value={cms.data.privacy.updated} />
	<I18n id="privacy-intro" label="Wstęp" bind:value={cms.data.privacy.intro} multiline rows={3} />
</div>

<List
	bind:items={cms.data.privacy.sections}
	title={(s, i) => s.heading.pl || `Rozdział ${i + 1}`}
	addLabel="Dodaj rozdział"
	create={() => ({ heading: { pl: '', en: '' }, body: { pl: '', en: '' } })}
>
	{#snippet item(s, i)}
		<I18n id="privacy-{i}-heading" label="Tytuł rozdziału" bind:value={s.heading} />
		<I18n id="privacy-{i}-body" label="Treść" bind:value={s.body} multiline rows={8} format />
	{/snippet}
</List>
