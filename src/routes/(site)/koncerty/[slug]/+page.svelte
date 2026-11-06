<script>
	import ConcertPage from '#lib/components/ConcertPage.svelte';

	/** @type {{data: {concert: any}}} */
	let { data } = $props();
</script>

<ConcertPage lang="pl" concert={data.concert} />
