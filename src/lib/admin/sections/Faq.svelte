<script>
	import { cms } from '../cms.svelte.js';
	import I18n from '../ui/I18n.svelte';
	import List from '../ui/List.svelte';
</script>

<header class="sec-head">
	<div>
		<h2>Pytania (FAQ)</h2>
		<p>Pytania i odpowiedzi na stronie głównej. Ta sama treść trafia do Google (dane FAQ), więc pisz prawdę i konkretnie.</p>
	</div>
</header>

<div class="card">
	<I18n id="texts-faq-kicker" label="Nadtytuł sekcji" bind:value={cms.data.texts.faq.kicker} />
	<I18n id="texts-faq-title" label="Nagłówek sekcji" bind:value={cms.data.texts.faq.title} />
</div>

<List bind:items={cms.data.faq} title={(f, i) => f.q.pl || `Pytanie ${i + 1}`} addLabel="Dodaj pytanie" create={() => ({ q: { pl: '', en: '' }, a: { pl: '', en: '' } })}>
	{#snippet item(f, i)}
		<I18n id="faq-{i}-q" label="Pytanie" bind:value={f.q} />
		<I18n id="faq-{i}-a" label="Odpowiedź" bind:value={f.a} multiline rows={3} format />
	{/snippet}
</List>
