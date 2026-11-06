<script>
	import { cms } from '../cms.svelte.js';
	import Text from '../ui/Text.svelte';
	import I18n from '../ui/I18n.svelte';
	import List from '../ui/List.svelte';

	const DAYS = [
		['Monday', 'Pon'],
		['Tuesday', 'Wt'],
		['Wednesday', 'Śr'],
		['Thursday', 'Czw'],
		['Friday', 'Pt'],
		['Saturday', 'Sob'],
		['Sunday', 'Nd']
	];
	const s = $derived(cms.data.site);

	/** @param {any} h @param {string} day @param {boolean} on */
	function toggle(h, day, on) {
		const set = new Set(h.days);
		on ? set.add(day) : set.delete(day);
		h.days = DAYS.map(([d]) => d).filter((d) => set.has(d));
	}
</script>

<header class="sec-head">
	<div>
		<h2>Godziny i kontakt</h2>
		<p>Te dane pokazują się w kilku miejscach strony naraz (nagłówek, rezerwacja, „Znajdź nas”, stopka) i w danych dla Google — zmieniasz je tylko tutaj.</p>
	</div>
</header>

<section class="card" aria-labelledby="contact-h">
	<h3 class="card-title" id="contact-h">Kontakt</h3>
	<div class="grid">
		<Text id="site-phone" label="Telefon" bind:value={s.phone} required help="Tak, jak ma się wyświetlać, np. 12 421 57 41." />
		<Text id="site-phoneIntl" label="Telefon z numerem kierunkowym" bind:value={s.phoneIntl} help="Np. +48 12 421 57 41 (wersja angielska i Google)." />
		<Text id="site-email" label="E-mail kontaktowy" type="email" bind:value={s.email} required />
		<Text id="site-reservationEmail" label="E-mail do rezerwacji" type="email" bind:value={s.reservationEmail} required help="Na ten adres trafiają wiadomości z formularza rezerwacji." />
		<Text id="site-facebook" label="Facebook" type="url" bind:value={s.facebook} />
		<Text id="site-googleMaps" label="Link do wizytówki / opinii Google" type="url" bind:value={s.googleMaps} />
		<Text id="site-virtualTour" label="Wirtualny spacer (opcjonalnie)" type="url" bind:value={s.virtualTour} help="Puste = przycisk się nie pokaże." />
	</div>
</section>

<section class="card" aria-labelledby="address-h">
	<h3 class="card-title" id="address-h">Adres</h3>
	<div class="grid">
		<Text id="site-street" label="Ulica i numer" bind:value={s.address.street} />
		<Text id="site-postal" label="Kod pocztowy" bind:value={s.address.postalCode} />
		<Text id="site-city" label="Miasto" bind:value={s.address.city} />
	</div>
</section>

<section aria-labelledby="hours-h">
	<h3 class="sub" id="hours-h">Godziny otwarcia</h3>
	<List
		bind:items={s.hours}
		title={(h) => h.label.pl || 'Nowe godziny'}
		addLabel="Dodaj godziny"
		create={() => ({ days: [], opens: '12:00', label: { pl: '', en: '' }, text: { pl: '', en: '' } })}
	>
		{#snippet item(h, i)}
			<fieldset class="days">
				<legend>Dni (dla Google)</legend>
				{#each DAYS as [day, short] (day)}
					<label class="chip">
						<input type="checkbox" checked={h.days.includes(day)} onchange={(e) => toggle(h, day, e.currentTarget.checked)} />
						{short}
					</label>
				{/each}
			</fieldset>
			<Text id="hours-{i}-opens" label="Otwarcie (GG:MM)" type="time" bind:value={h.opens} />
			<I18n id="hours-{i}-label" label="Nazwa dni na stronie" bind:value={h.label} help="Np. „Poniedziałek – Piątek”." />
			<I18n id="hours-{i}-text" label="Godziny na stronie" bind:value={h.text} help="Np. „13:00 – do ostatniego gościa”." />
		{/snippet}
	</List>
</section>
