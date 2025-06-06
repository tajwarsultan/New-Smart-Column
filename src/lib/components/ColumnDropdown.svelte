<script lang="ts">
	import { onMount } from 'svelte';
	import type { Column } from '../types/column';

	interface Props {
		columns: Column[];
		position: { top: number; left: number };
		selectedIndex: number;
		searchTerm: string;
		onSelect: (column: Column) => void;
		onClose: () => void;
	}

	let { columns, position, selectedIndex, searchTerm, onSelect, onClose }: Props = $props();

	let dropdownElement = $state<HTMLDivElement | null>(null);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;

		if (dropdownElement && !dropdownElement.contains(target)) {
			onClose();
		}
	}

	$effect(() => {
		if (dropdownElement && selectedIndex >= 0) {
			const selectedElement = dropdownElement.querySelector(`[data-index="${selectedIndex}"]`);
			if (selectedElement) {
				selectedElement.scrollIntoView({ block: 'nearest' });
			}
		}
	});

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const groupedColumns = $derived.by(() => {
		const groups: Record<string, Column[]> = {};

		if (searchTerm) {
			return { 'Matching Columns': columns };
		}

		columns.forEach((column) => {
			const type = column.type || 'other';
			const groupName = type.charAt(0).toUpperCase() + type.slice(1);
			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(column);
		});

		return groups;
	});

	function getColumnIcon(type: string): string {
		switch (type.toLowerCase()) {
			case 'string':
			case 'text':
				return 'T';
			case 'number':
			case 'integer':
				return '#';
			case 'date':
			case 'datetime':
				return 'D';
			case 'email':
				return '@';
			case 'phone':
				return '☎';
			case 'url':
			case 'link':
				return '🔗';
			case 'boolean':
				return '✓';
			default:
				return 'T';
		}
	}
</script>

<div
	bind:this={dropdownElement}
	class="absolute z-50 max-h-80 w-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
	style="top: {position.top}px; left: {position.left}px;"
>
	{#if searchTerm}
		<div class="sticky top-0 border-b border-gray-200 bg-[#EBFFD8] px-3 py-2">
			<div class="text-sm text-gray-700">
				Search: "{searchTerm}" ({columns.length} found)
			</div>
		</div>
	{:else}
		<div class="sticky top-0 border-b border-gray-200 bg-[#EBFFD8] px-3 py-2">
			<div class="text-sm font-medium text-gray-700">
				Insert column ({columns.length} available)
			</div>
		</div>
	{/if}

	{#if columns.length === 0}
		<div class="p-4 text-center text-gray-500">
			{#if searchTerm}
				No columns match "{searchTerm}"
			{:else}
				No columns found
			{/if}
		</div>
	{:else if searchTerm}
		<div class="py-1">
			{#each columns as column, index}
				<button
					type="button"
					data-index={index}
					class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#EBFFD8]/50"
					class:bg-[#C4E1E6]={index === selectedIndex}
					onclick={() => onSelect(column)}
				>
					<span
						class="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#8DBCC7] text-xs text-white"
					>
						{getColumnIcon(column.type)}
					</span>
					<span class="truncate text-sm">{column.name}</span>
				</button>
			{/each}
		</div>
	{:else}
		{#each Object.entries(groupedColumns) as [groupName, groupColumns]}
			<div class="py-1">
				<div class="sticky top-8 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
					{groupName} ({groupColumns.length})
				</div>
				{#each groupColumns as column, groupIndex}
					{@const index = columns.findIndex((c) => c.id === column.id)}
					<button
						type="button"
						data-index={index}
						class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#EBFFD8]/50"
						class:bg-[#C4E1E6]={index === selectedIndex}
						onclick={() => onSelect(column)}
					>
						<span
							class="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#8DBCC7] text-xs text-white"
						>
							{getColumnIcon(column.type)}
						</span>
						<span class="truncate text-sm">{column.name}</span>
					</button>
				{/each}
			</div>
		{/each}
	{/if}

	{#if columns.length > 1 && !searchTerm}
		<div class="border-t border-gray-200">
			<button
				type="button"
				class="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-[#8DBCC7] hover:bg-[#EBFFD8]/50"
				onclick={() => {
					columns.forEach((column, index) => {
						setTimeout(() => onSelect(column), index * 100);
					});
				}}
			>
				<span class="text-sm">Insert all {columns.length} columns</span>
			</button>
		</div>
	{/if}
</div>
