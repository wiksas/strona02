<script>
	import ConcertPage from '#lib/components/ConcertPage.svelte';

	/** @type {{data: {concert: any}}} */
	let { data } = $props();
</script>

<ConcertPage lang="en" concert={data.concert} />
