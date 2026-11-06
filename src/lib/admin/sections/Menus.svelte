<script>
	import { cms } from '../cms.svelte.js';
	import { convertImage } from '../images.js';
	import I18n from '../ui/I18n.svelte';
	import Upload from '../ui/Upload.svelte';

	const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
	const prefix = (/** @type {any} */ m) => (m.id === 'wino' ? 'karta-win' : `karta-${m.id}`);

	/** @param {any} m @param {File[]} files */
	async function addPages(m, files) {
		for (const file of files) {
			const img = await convertImage(file, { maxWidth: 1400 });
			const src = cms.addUpload(`/assets/img/menu/${prefix(m)}-harris-krakow-${stamp()}.${img.ext}`, img.blob);
			m.pages.push({ src, width: img.width, height: img.height });
		}
	}

	/** @param {any} m @param {File[]} files */
	async function setCover(m, files) {
		const img = await convertImage(files[0], { maxWidth: 600 });
		const old = m.cover.src;
		m.cover = { src: cms.addUpload(`/assets/img/menu/${prefix(m)}-harris-krakow-okladka-${stamp()}.${img.ext}`, img.blob), width: img.width, height: img.height };
		cms.removeFile(old);
	}

	/** @param {any} m @param {number} i @param {number} d */
	function move(m, i, d) {
		const j = i + d;
		if (j < 0 || j >= m.pages.length) return;
		[m.pages[i], m.pages[j]] = [m.pages[j], m.pages[i]];
	}
	/** @param {any} m @param {number} i */
	function removePage(m, i) {
		if (!confirm(`Usunąć stronę ${i + 1} z karty „${m.title.pl}”?`)) return;
		const [p] = m.pages.splice(i, 1);
		cms.removeFile(p.src);
	}
</script>

<header class="sec-head">
	<div>
		<h2>Karty menu</h2>
		<p>Karta i karta win otwierają się na stronie jako przewijany dokument. Wgraj zdjęcia lub skany stron (najlepiej pionowe, wyraźne) — zostaną zmniejszone do 1400 px szerokości.</p>
	</div>
</header>

{#each cms.data.menus as m (m.id)}
	<section class="card" aria-labelledby="menu-{m.id}-h">
		<h3 id="menu-{m.id}-h" class="card-title">{m.title.pl}</h3>
		<div class="menu-head">
			<div class="cover">
				<img src={cms.imgUrl(m.cover.src)} width={m.cover.width} height={m.cover.height} alt="Okładka: {m.title.pl}" />
				<Upload label="Zmień okładkę" onfiles={(f) => setCover(m, f)} />
			</div>
			<div class="grow">
				<I18n id="menu-{m.id}-title" label="Nazwa karty" bind:value={m.title} />
				<I18n id="menu-{m.id}-subtitle" label="Podpis pod nazwą" bind:value={m.subtitle} help="Liczba stron dopisuje się sama." />
			</div>
		</div>

		<h4 class="sub">Strony ({m.pages.length})</h4>
		{#if cms.errors[`menu-${m.id}-pages`]}<p class="f-error" role="alert">{cms.errors[`menu-${m.id}-pages`]}</p>{/if}
		<ol class="pages">
			{#each m.pages as p, i (p.src)}
				<li class="page-tile">
					<img src={cms.imgUrl(p.src)} width={p.width} height={p.height} alt="Strona {i + 1}" loading="lazy" />
					<span class="page-no">{i + 1}</span>
					<span class="page-tools">
						<button type="button" class="icon-btn" onclick={() => move(m, i, -1)} disabled={i === 0} aria-label="Strona {i + 1} wcześniej">←</button>
						<button type="button" class="icon-btn" onclick={() => move(m, i, 1)} disabled={i === m.pages.length - 1} aria-label="Strona {i + 1} dalej">→</button>
						<button type="button" class="icon-btn icon-btn--danger" onclick={() => removePage(m, i)} aria-label="Usuń stronę {i + 1}">✕</button>
					</span>
				</li>
			{/each}
		</ol>
		<Upload label="+ Dodaj strony" multiple onfiles={(f) => addPages(m, f)} help="Nowe strony trafiają na koniec — strzałkami ustawisz kolejność." />
	</section>
{/each}
