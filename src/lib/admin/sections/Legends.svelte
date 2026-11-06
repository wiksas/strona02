<script>
	import { cms } from '../cms.svelte.js';
	import List from '../ui/List.svelte';
	import I18n from '../ui/I18n.svelte';

	let name = $state('');
	function add(/** @type {SubmitEvent} */ e) {
		e.preventDefault();
		const v = name.trim();
		if (!v) return;
		cms.data.legends.push(v);
		name = '';
	}
</script>

<header class="sec-head">
	<div>
		<h2>Grali u nas</h2>
		<p>Muzycy, którzy grali w Harrisie — lista na stronie głównej, w tej kolejności.</p>
	</div>
</header>

<div class="card">
	<I18n id="texts-legends-kicker" label="Nadtytuł sekcji" bind:value={cms.data.texts.legends.kicker} />
	<I18n id="texts-legends-title" label="Nagłówek sekcji" bind:value={cms.data.texts.legends.title} />
	<I18n id="texts-legends-foot" label="Zdanie pod listą" bind:value={cms.data.texts.legends.foot} multiline rows={2} />
</div>

<form class="row add-row" onsubmit={add}>
	<label class="sr" for="legend-new">Nowe nazwisko</label>
	<input id="legend-new" bind:value={name} placeholder="Imię i nazwisko muzyka" />
	<button class="btn" type="submit">+ Dodaj</button>
</form>

<List bind:items={cms.data.legends} compact title={(n) => n}>
	{#snippet item(_, i)}
		<label class="sr" for="legend-{i}">Nazwisko {i + 1}</label>
		<input id="legend-{i}" class="inline-input" bind:value={cms.data.legends[i]} />
	{/snippet}
</List>
