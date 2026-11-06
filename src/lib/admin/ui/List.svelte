<script>
	/**
	 * Lista elementów z dodawaniem, usuwaniem i zmianą kolejności.
	 * @type {{
	 *   items: any[], item: import('svelte').Snippet<[any, number]>, title?: (item: any, i: number) => string,
	 *   create?: () => any, addLabel?: string, onremove?: (item: any) => boolean | void, compact?: boolean, keyOf?: (item: any, i: number) => any
	 * }}
	 */
	let { items = $bindable(), item, title = (_, i) => `#${i + 1}`, create = undefined, addLabel = 'Dodaj', onremove = undefined, compact = false, keyOf = (it, i) => i } = $props();

	/** @param {number} i @param {number} d */
	function move(i, d) {
		const j = i + d;
		if (j < 0 || j >= items.length) return;
		[items[i], items[j]] = [items[j], items[i]];
	}
	/** @param {number} i */
	function remove(i) {
		const t = title(items[i], i);
		if (!confirm(`Usunąć „${t}”?`)) return;
		if (onremove && onremove(items[i]) === false) return;
		items.splice(i, 1);
	}
</script>

<ol class="list" class:list--compact={compact}>
	{#each items as it, i (keyOf(it, i))}
		<li class="list-item">
			<div class="list-bar">
				<span class="list-title">{title(it, i)}</span>
				<span class="list-tools">
					<button type="button" class="icon-btn" onclick={() => move(i, -1)} disabled={i === 0} aria-label="Przesuń wyżej: {title(it, i)}">↑</button>
					<button type="button" class="icon-btn" onclick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Przesuń niżej: {title(it, i)}">↓</button>
					<button type="button" class="icon-btn icon-btn--danger" onclick={() => remove(i)} aria-label="Usuń: {title(it, i)}">✕</button>
				</span>
			</div>
			{@render item(it, i)}
		</li>
	{/each}
</ol>
{#if create}
	<button type="button" class="btn btn--ghost" onclick={() => items.push(create())}>+ {addLabel}</button>
{/if}
