<script>
	import { cms } from '../cms.svelte.js';

	/**
	 * @type {{
	 *   id: string, label: string, value: any, help?: string, type?: string, multiline?: boolean, rows?: number,
	 *   max?: number, required?: boolean, placeholder?: string, lang?: string, min?: string|number, step?: string|number,
	 *   onchange?: (v: any) => void
	 * }}
	 */
	let { id, label, value = $bindable(), help = '', type = 'text', multiline = false, rows = 4, max = 0, required = false, placeholder = '', lang = undefined, min = undefined, step = undefined, onchange = undefined } = $props();

	const error = $derived(cms.errors[id]);
	const len = $derived(String(value ?? '').length);
	const describedBy = $derived([help && `${id}-help`, max && `${id}-count`, error && `${id}-err`].filter(Boolean).join(' ') || undefined);
	/* błąd znika, gdy tylko użytkownik zacznie poprawiać pole */
	const clear = () => {
		if (cms.errors[id]) delete cms.errors[id];
	};
</script>

<div class="f" class:f--error={!!error}>
	<label for={id}>{label}{#if required}<span class="req" aria-hidden="true"> *</span>{/if}</label>
	{#if multiline}
		<textarea {id} {rows} {placeholder} {lang} bind:value oninput={clear} aria-invalid={!!error} aria-describedby={describedBy} aria-required={required}></textarea>
	{:else if type === 'number'}
		<input
			{id}
			type="number"
			inputmode="numeric"
			{min}
			{step}
			{placeholder}
			value={value ?? ''}
			oninput={(e) => {
				const v = e.currentTarget.value;
				value = v === '' ? null : Number(v);
				onchange?.(value);
			}}
			aria-invalid={!!error}
			aria-describedby={describedBy}
		/>
	{:else}
		<input {id} {type} {placeholder} {lang} {min} {step} bind:value oninput={clear} onchange={() => onchange?.(value)} aria-invalid={!!error} aria-describedby={describedBy} aria-required={required} />
	{/if}
	{#if max}
		<p class="f-count" class:f-count--over={len > max} id="{id}-count">{len} / {max} znaków{len > max ? ' — za długo, Google utnie końcówkę' : ''}</p>
	{/if}
	{#if help}<p class="f-help" id="{id}-help">{help}</p>{/if}
	{#if error}<p class="f-error" id="{id}-err">{error}</p>{/if}
</div>
