<script>
	import { file as asset, link as resolve } from '#lib/paths.js';
	import { site, texts, partners } from '#lib/content.js';
	import { UI, ROUTES } from '#lib/i18n.js';

	/** @type {{lang: 'pl'|'en', full?: boolean}} */
	let { lang, full = false } = $props();

	const ui = $derived(UI[lang]);
	const phone = $derived(lang === 'pl' ? site.phone : site.phoneIntl);
	const tel = `tel:${site.phoneIntl.replace(/\s/g, '')}`;
	const year = new Date().getFullYear();
</script>

<footer class="footer" data-hide-callbar={full ? '' : undefined}>
	<div class="wrap" class:footer-bottom={!full}>
		{#if full}
			<p class="kicker center">{ui.friends}</p>
			<ul class="partners">
				{#each partners as p (p.logo.src)}
					<li>
						{#if p.url}
							<a href={p.url} target="_blank" rel="noopener"><img src={asset(p.logo.src)} width={p.logo.width} height={p.logo.height} alt={p.alt[lang]} loading="lazy" /></a>
						{:else}
							<img src={asset(p.logo.src)} width={p.logo.width} height={p.logo.height} alt={p.alt[lang]} loading="lazy" />
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#snippet bottom()}
			<p class="footer-name">{site.name}</p>
			<p class="footer-area">{texts.footer.area[lang]}<br />{site.address.street}, {site.address.postalCode} {site.address.city}{lang === 'en' ? ', Poland' : ''}</p>
			<ul class="footer-links">
				<li><a href={tel}>tel. {phone}</a></li>
				<li><a href="mailto:{site.email}">{site.email}</a></li>
				<li><a href={site.facebook} target="_blank" rel="noopener">Facebook</a></li>
				{#if full}
					<li><a href={site.googleMaps} target="_blank" rel="noopener">{ui.reviews}</a></li>
					<li><a href={resolve(ROUTES[lang].privacy)}>{ui.privacy}</a></li>
				{/if}
			</ul>
			<p class="copy">© 1997–{year} {site.name}{#if full} · {ui.rights}{/if}</p>
		{/snippet}

		{#if full}
			<div class="footer-bottom">
				<img class="footer-logo" src={asset('/assets/img/harris-piano-jazz-bar-logo.webp')} width="274" height="118" alt="" loading="lazy" />
				{@render bottom()}
			</div>
		{:else}
			{@render bottom()}
		{/if}
	</div>
</footer>
