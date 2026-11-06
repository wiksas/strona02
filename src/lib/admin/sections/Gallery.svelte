<script>
	import { cms } from '../cms.svelte.js';
	import { convertImage } from '../images.js';
	import Text from '../ui/Text.svelte';
	import List from '../ui/List.svelte';
	import Upload from '../ui/Upload.svelte';

	/** Gdzie zdjęcie jest użyte poza galerią (wtedy nie można go usunąć). @param {string} id */
	function usedIn(id) {
		const t = cms.data.texts;
		return [t.hero.image === id && 'zdjęcie w nagłówku strony', t.about.photoA === id && 'pierwsze zdjęcie w „O nas”', t.about.photoB === id && 'drugie zdjęcie w „O nas”'].filter(Boolean);
	}

	/** @param {File[]} files */
	async function addPhotos(files) {
		for (const file of files) {
			const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
			const full = await convertImage(file, { maxWidth: 1600 });
			const small = await convertImage(file, { maxWidth: 480 });
			/* tymczasowa nazwa — przy zapisie plik dostaje nazwę z opisu zdjęcia (lepsze dla Google) */
			const base = `/assets/img/galeria/nowe-${stamp}`;
			cms.data.gallery.push({
				id: `zdjecie-${stamp}`,
				src: cms.addUpload(`${base}-${full.width}.${full.ext}`, full.blob),
				width: full.width,
				height: full.height,
				srcSmall: cms.addUpload(`${base}-${small.width}.${small.ext}`, small.blob),
				widthSmall: small.width,
				heightSmall: small.height,
				alt: { pl: '', en: '' }
			});
		}
	}

	/** @param {any} g */
	function onremove(g) {
		const used = usedIn(g.id);
		if (used.length) {
			alert(`Tego zdjęcia nie można usunąć, bo jest użyte jako: ${used.join(', ')}. Najpierw wybierz inne zdjęcie w „Teksty strony”.`);
			return false;
		}
		cms.removeFile(g.src);
		cms.removeFile(g.srcSmall);
	}
</script>

<header class="sec-head">
	<div>
		<h2>Galeria</h2>
		<p>Zdjęcia w galerii na stronie głównej, w tej kolejności. Nowe zdjęcia są automatycznie zmniejszane i zapisywane w formacie WebP w dwóch rozmiarach.</p>
	</div>
	<Upload label="+ Dodaj zdjęcia" multiple onfiles={addPhotos} />
</header>

<p class="f-help">Opis zdjęcia (po polsku i angielsku) jest wymagany: czytają go osoby niewidome i Google. Napisz, co widać, np. „Saksofonista w niebieskim świetle sceny”.</p>

<List bind:items={cms.data.gallery} keyOf={(g) => g.id} title={(g, i) => `Zdjęcie ${i + 1}${g.alt.pl ? ` — ${g.alt.pl}` : ''}`} onremove={onremove}>
	{#snippet item(g)}
		<div class="photo-row">
			<img class="thumb" src={cms.imgUrl(g.srcSmall)} width={g.widthSmall} height={g.heightSmall} alt="" loading="lazy" />
			<div class="photo-fields">
				<div class="i18n-grid">
					<Text id="gallery-{g.id}-pl" label="Opis zdjęcia po polsku" bind:value={g.alt.pl} required lang="pl" />
					<Text id="gallery-{g.id}-en" label="Opis zdjęcia po angielsku" bind:value={g.alt.en} required lang="en" />
				</div>
				{#if usedIn(g.id).length}<p class="f-help">Użyte też jako: {usedIn(g.id).join(', ')}.</p>{/if}
			</div>
		</div>
	{/snippet}
</List>
