<script>
	import { link as resolve } from '#lib/paths.js';
	import { UI, ROUTES } from '#lib/i18n.js';
	import { formatPrice, parseDay, plainText } from '#lib/text.js';

	/** @type {{concert: any, lang: 'pl'|'en', today: string}} */
	let { concert: c, lang, today } = $props();

	const ui = $derived(UI[lang]);
	const date = $derived(parseDay(c.date));
	const month = $derived(new Intl.DateTimeFormat(ui.locale, { month: 'short' }).format(date).replace('.', ''));
	const weekday = $derived(new Intl.DateTimeFormat(ui.locale, { weekday: 'long' }).format(date));
	const price = $derived(formatPrice(c, lang));
	/* skrót opisu: pierwszy akapit, bez formatowania (pełny opis jest na stronie koncertu) */
	const desc = $derived(plainText(((c.description[lang] || c.description.pl) ?? '').split(/\n\s*\n/)[0] ?? ''));
	const isToday = $derived(c.date === today);
</script>

<li class="event" class:event--today={isToday} data-date={c.date}>
	{#if isToday}<span class="event-stamp">{ui.today}</span>{/if}
	<div class="event-date">
		<time datetime="{c.date}T{c.time}" style="display:contents">
			<span class="event-day">{date.getDate()}</span>
			<span class="event-month">{month}</span>
			<span class="event-weekday">{weekday}</span>
		</time>
	</div>
	<div class="event-body">
		<p class="event-meta"><span>{c.time}</span>{#if price}<span>{price}</span>{/if}</p>
		<h3 class="event-title"><a href={resolve(ROUTES[lang].concert(c.slug))}>{c.title}</a></h3>
		{#if desc}<p class="event-desc">{desc}</p>{/if}
		<span class="event-more">{ui.details}</span>
	</div>
</li>
