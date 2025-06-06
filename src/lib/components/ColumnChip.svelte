<script lang="ts">
	let {
		columnName,
		value = null,
		showValue = false,
		onRemove = undefined
	} = $props<{
		columnName: string;
		value?: string | null;
		showValue?: boolean;
		onRemove?: () => void;
	}>();

	const displayText = $derived(showValue && value ? value : `[${columnName}]`);
</script>

<span
	class="mx-0.5 inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-sm font-medium text-blue-800"
>
	{displayText}
	{#if onRemove}
		<button type="button" class="ml-1 text-blue-600 hover:text-blue-800" onclick={onRemove}>
			×
		</button>
	{/if}
</span>
