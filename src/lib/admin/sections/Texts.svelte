<script>
	import { cms } from '../cms.svelte.js';
	import Text from '../ui/Text.svelte';
	import I18n from '../ui/I18n.svelte';
	import List from '../ui/List.svelte';
	import PhotoPicker from '../ui/PhotoPicker.svelte';

	const t = $derived(cms.data.texts);
	const csv = (/** @type {string[]} */ a) => a.join(', ');
	const parse = (/** @type {string} */ s) => s.split(',').map((x) => x.trim()).filter(Boolean);
</script>

<header class="sec-head">
	<div>
		<h2>Teksty strony</h2>
		<p>Napisy w poszczególnych częściach strony głównej, w kolejności od góry. Kliknij nazwę części, żeby ją rozwinąć.</p>
	</div>
</header>

<details class="group" open>
	<summary>Google i udostępnianie (SEO)</summary>
	<p class="f-help">Tytuł i opis, które Google pokazuje w wynikach wyszukiwania. Najważniejsze słowa na początku, nazwa klubu na końcu tytułu.</p>
	<I18n id="texts-seo-title" label="Tytuł strony głównej" bind:value={t.seo.title} max={60} />
	<I18n id="texts-seo-description" label="Opis strony głównej" bind:value={t.seo.description} multiline rows={3} max={160} />
	<I18n id="texts-seo-concertsTitle" label="Tytuł strony „Program koncertów”" bind:value={t.seo.concertsTitle} max={60} />
	<I18n id="texts-seo-concertsDescription" label="Opis strony „Program koncertów”" bind:value={t.seo.concertsDescription} multiline rows={3} max={160} />
	<I18n id="texts-seo-ogImageAlt" label="Opis obrazka przy udostępnianiu linku" bind:value={t.seo.ogImageAlt} multiline rows={2} />
</details>

<details class="group">
	<summary>Nagłówek strony (pierwszy ekran)</summary>
	<PhotoPicker label="Zdjęcie w tle" name="hero-image" bind:value={t.hero.image} help="Wybierz z galerii. Najlepiej poziome, ciemne zdjęcie sceny." />
	<I18n id="texts-hero-kicker" label="Napis pod logo" bind:value={t.hero.kicker} />
	<I18n id="texts-hero-tagline" label="Hasło" bind:value={t.hero.tagline} />
	<Text id="texts-hero-genres" label="Gatunki (oddzielone przecinkami)" value={csv(t.hero.genres)} onchange={(v) => (t.hero.genres = parse(v))} help="Pierwsze pięć dostaje różne kroje pisma." />
	<I18n id="texts-hero-ctaPrimary" label="Przycisk główny" bind:value={t.hero.ctaPrimary} />
	<I18n id="texts-hero-ctaSecondary" label="Przycisk drugi" bind:value={t.hero.ctaSecondary} />
</details>

<details class="group">
	<summary>Przesuwający się pasek</summary>
	<Text id="texts-marquee-row1" label="Górny wiersz (oddzielone przecinkami)" value={csv(t.marquee.row1)} onchange={(v) => (t.marquee.row1 = parse(v))} />
	<div class="i18n-grid">
		<Text id="texts-marquee-row2-pl" label="Dolny wiersz po polsku" value={csv(t.marquee.row2.pl)} onchange={(v) => (t.marquee.row2.pl = parse(v))} />
		<Text id="texts-marquee-row2-en" label="Dolny wiersz po angielsku" value={csv(t.marquee.row2.en)} onchange={(v) => (t.marquee.row2.en = parse(v))} />
	</div>
</details>

<details class="group">
	<summary>Koncerty</summary>
	<I18n id="texts-concerts-kicker" label="Nadtytuł" bind:value={t.concerts.kicker} />
	<I18n id="texts-concerts-title" label="Nagłówek na stronie głównej" bind:value={t.concerts.title} />
	<I18n id="texts-concerts-lead" label="Wstęp na stronie głównej" bind:value={t.concerts.lead} multiline rows={2} />
	<I18n id="texts-concerts-pageTitle" label="Nagłówek strony „Program koncertów”" bind:value={t.concerts.pageTitle} />
	<I18n id="texts-concerts-pageLead" label="Wstęp strony „Program koncertów”" bind:value={t.concerts.pageLead} multiline rows={2} />
</details>

<details class="group">
	<summary>O nas</summary>
	<I18n id="texts-about-kicker" label="Nadtytuł" bind:value={t.about.kicker} />
	<I18n id="texts-about-title" label="Nagłówek" bind:value={t.about.title} />
	<I18n id="texts-about-statement" label="Zdanie główne" bind:value={t.about.statement} multiline rows={3} help="Słowo w gwiazdkach, np. *jedyny*, zostanie wyróżnione na złoto." />
	<h4 class="sub">Akapity</h4>
	<List bind:items={t.about.paragraphs} title={(p, i) => `Akapit ${i + 1}`} addLabel="Dodaj akapit" create={() => ({ pl: '', en: '' })}>
		{#snippet item(_, i)}
			<I18n id="texts-about-p{i}" label="Treść akapitu" bind:value={t.about.paragraphs[i]} multiline rows={4} />
		{/snippet}
	</List>
	<PhotoPicker label="Zdjęcie po lewej" name="about-a" bind:value={t.about.photoA} />
	<PhotoPicker label="Zdjęcie po prawej" name="about-b" bind:value={t.about.photoB} />
</details>

<details class="group">
	<summary>Liczby</summary>
	<p class="f-help">Cztery kafelki pod „O nas”. „Liczy w górę” = liczba animuje się przy przewijaniu (tylko gdy zaczyna się od cyfr, np. 1997, 7/7, 4000+).</p>
	<List bind:items={t.stats} title={(s, i) => s.value.pl || `Kafelek ${i + 1}`} addLabel="Dodaj kafelek" create={() => ({ value: { pl: '', en: '' }, animate: false, label: { pl: '', en: '' }, term: { pl: '', en: '' } })}>
		{#snippet item(s, i)}
			<I18n id="texts-stat{i}-value" label="Liczba / wartość" bind:value={s.value} />
			<I18n id="texts-stat{i}-label" label="Podpis" bind:value={s.label} />
			<I18n id="texts-stat{i}-term" label="Krótka nazwa (dla czytników ekranu)" bind:value={s.term} />
			<label class="check"><input type="checkbox" bind:checked={s.animate} /> Liczy w górę</label>
		{/snippet}
	</List>
</details>

<details class="group">
	<summary>Galeria i menu</summary>
	<I18n id="texts-gallery-kicker" label="Galeria — nadtytuł" bind:value={t.gallery.kicker} />
	<I18n id="texts-gallery-title" label="Galeria — nagłówek" bind:value={t.gallery.title} />
	<I18n id="texts-menu-kicker" label="Menu — nadtytuł" bind:value={t.menu.kicker} />
	<I18n id="texts-menu-title" label="Menu — nagłówek" bind:value={t.menu.title} />
	<I18n id="texts-menu-lead" label="Menu — wstęp" bind:value={t.menu.lead} multiline rows={2} />
</details>

<details class="group">
	<summary>Rezerwacja</summary>
	<I18n id="texts-reservation-kicker" label="Nadtytuł" bind:value={t.reservation.kicker} />
	<I18n id="texts-reservation-title" label="Nagłówek" bind:value={t.reservation.title} />
	<h4 class="sub">Uwagi do rezerwacji</h4>
	<List bind:items={t.reservation.notes} title={(n, i) => n.pl || `Uwaga ${i + 1}`} addLabel="Dodaj uwagę" create={() => ({ pl: '', en: '' })}>
		{#snippet item(_, i)}
			<I18n id="texts-reservation-note{i}" label="Treść" bind:value={t.reservation.notes[i]} multiline rows={2} />
		{/snippet}
	</List>
</details>

<details class="group">
	<summary>Znajdź nas i stopka</summary>
	<I18n id="texts-find-kicker" label="Nadtytuł" bind:value={t.find.kicker} />
	<I18n id="texts-find-title" label="Nagłówek" bind:value={t.find.title} />
	<I18n id="texts-find-mapNote" label="Tekst przy mapie" bind:value={t.find.mapNote} multiline rows={2} />
	<I18n id="texts-footer-area" label="Opis klubu w stopce" bind:value={t.footer.area} multiline rows={2} />
</details>

<p class="f-help">Nagłówki sekcji „Grali u nas” i „Pytania” edytujesz w ich własnych zakładkach.</p>
