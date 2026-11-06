<script>
	import { ACCEPT } from '../images.js';

	/** @type {{label: string, multiple?: boolean, onfiles: (files: File[]) => void | Promise<void>, help?: string}} */
	let { label, multiple = false, onfiles, help = '' } = $props();

	let input = /** @type {HTMLInputElement} */ ($state());
	let working = $state(false);
	let error = $state('');

	/** @param {Event & {currentTarget: HTMLInputElement}} e */
	async function pick(e) {
		const files = [...(e.currentTarget.files ?? [])];
		e.currentTarget.value = '';
		if (!files.length) return;
		working = true;
		error = '';
		try {
			await onfiles(files);
		} catch (err) {
			error = `Nie udało się przygotować zdjęcia: ${/** @type {Error} */ (err).message}`;
		} finally {
			working = false;
		}
	}
</script>

<div class="upload">
	<button type="button" class="btn btn--ghost" onclick={() => input.click()} disabled={working}>
		{working ? 'Przygotowuję zdjęcia…' : label}
	</button>
	<input bind:this={input} type="file" accept={ACCEPT} {multiple} onchange={pick} hidden />
	{#if help}<p class="f-help">{help}</p>{/if}
	{#if error}<p class="f-error" role="alert">{error}</p>{/if}
</div>
