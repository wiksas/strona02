<script>
	import { cms } from '../cms.svelte.js';
	import { convertImage } from '../images.js';
	import { slugify } from '#lib/text.js';
	import Text from '../ui/Text.svelte';
	import I18n from '../ui/I18n.svelte';
	import List from '../ui/List.svelte';
	import Upload from '../ui/Upload.svelte';

	/** @param {any} p @param {File[]} files */
	async function setLogo(p, files) {
		const img = await convertImage(files[0], { maxWidth: 300, quality: 0.9, alpha: true });
		const old = p.logo?.src;
		const name = `partner-${slugify(p.name || 'logo')}-${Date.now().toString(36)}.${img.ext}`;
		p.logo = { src: cms.addUpload(`/assets/img/partnerzy/${name}`, img.blob), width: img.width, height: img.height };
		if (old) cms.removeFile(old);
	}
</script>

<header class="sec-head">
	<div>
		<h2>Partnerzy</h2>
		<p>Logotypy w stopce („Przyjaciele klubu”). Najlepiej logo w PNG z przezroczystym tłem — zostanie zmniejszone do 300 px.</p>
	</div>
</header>

<List
	bind:items={cms.data.partners}
	title={(p, i) => p.name || `Partner ${i + 1}`}
	addLabel="Dodaj partnera"
	create={() => ({ name: '', url: '', logo: null, alt: { pl: '', en: '' } })}
	onremove={(p) => {
		if (p.logo?.src) cms.removeFile(p.logo.src);
	}}
>
	{#snippet item(p, i)}
		<div class="photo-row">
			<div class="logo-box">
				{#if p.logo}<img src={cms.imgUrl(p.logo.src)} width={p.logo.width} height={p.logo.height} alt="" />{:else}<span class="empty">Brak logo</span>{/if}
				<Upload label={p.logo ? 'Zmień logo' : 'Wgraj logo'} onfiles={(f) => setLogo(p, f)} />
				{#if cms.errors[`partner-${i}-logo`]}<p class="f-error">{cms.errors[`partner-${i}-logo`]}</p>{/if}
			</div>
			<div class="photo-fields">
				<div class="i18n-grid">
					<Text id="partner-{i}-name" label="Nazwa" bind:value={p.name} required />
					<Text id="partner-{i}-url" label="Adres strony (opcjonalnie)" type="url" bind:value={p.url} placeholder="https://" />
				</div>
				<I18n id="partner-{i}-alt" label="Opis logo dla niewidomych i Google" bind:value={p.alt} help="Zwykle sama nazwa partnera." />
			</div>
		</div>
	{/snippet}
</List>
