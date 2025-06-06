<script lang="ts">
	import { onMount } from 'svelte';
	import type { Column } from '../types/column';

	interface Props {
		columns: Column[];
		position: { top: number; left: number };
		selectedIndex: number;
		searchTerm: string;
		insertedPaths: Set<string>;
		onSelect: (column: Column, subColumn?: Column) => void;
		onClose: () => void;
	}

	let { columns, position, selectedIndex, searchTerm, insertedPaths, onSelect, onClose }: Props =
		$props();

	let dropdownElement = $state<HTMLDivElement | null>(null);
	let expandedColumns = $state<Set<string>>(new Set());

	// Handle click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;

		if (dropdownElement && !dropdownElement.contains(target)) {
			onClose();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	function getColumnIcon(type: string): string {
		switch (type?.toLowerCase()) {
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

	function toggleColumn(columnId: string) {
		const newExpanded = new Set(expandedColumns);
		if (newExpanded.has(columnId)) {
			newExpanded.delete(columnId);
		} else {
			newExpanded.add(columnId);
		}
		expandedColumns = newExpanded;
	}

	function isAvailable(column: Column, subColumn?: Column): boolean {
		const path = subColumn ? `${column.name}.${subColumn.name}` : column.name;
		return !insertedPaths.has(path);
	}

	function getAvailableSubColumnsCount(column: Column): number {
		if (!column.subColumns) return 0;
		return column.subColumns.filter((sub) => isAvailable(column, sub)).length;
	}
</script>

<div
	bind:this={dropdownElement}
	class="absolute z-50 max-h-80 w-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
	style="top: {position.top}px; left: {position.left}px;"
>
	<div class="sticky top-0 border-b border-gray-200 bg-[#EBFFD8] px-3 py-2">
		<div class="text-sm font-medium text-gray-700">
			{#if searchTerm}
				Search: "{searchTerm}" ({columns.length} found)
			{:else}
				Insert column ({columns.length} available)
			{/if}
		</div>
	</div>

	{#if columns.length === 0}
		<div class="p-4 text-center text-gray-500">
			{#if searchTerm}
				No columns match "{searchTerm}"
			{:else}
				No columns available
			{/if}
		</div>
	{:else}
		<div class="py-1">
			{#each columns as column, index}
				<div class="border-b border-gray-100 last:border-b-0">
					<div class="flex items-center">
						<button
							type="button"
							class="flex flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#EBFFD8]/50"
							class:bg-[#C4E1E6]={index === selectedIndex && !column.subColumns}
							class:opacity-50={!isAvailable(column)}
							onclick={() => {
								if (column.subColumns && column.subColumns.length > 0) {
									toggleColumn(column.id);
								} else if (isAvailable(column)) {
									onSelect(column);
								}
							}}
							disabled={!isAvailable(column) &&
								(!column.subColumns || getAvailableSubColumnsCount(column) === 0)}
						>
							<span
								class="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#8DBCC7] text-xs text-white"
							>
								{getColumnIcon(column.type)}
							</span>
							<span class="flex-1 truncate text-sm">{column.name}</span>

							{#if !isAvailable(column)}
								<span class="rounded bg-gray-100 px-1 text-xs text-gray-400">inserted</span>
							{/if}

							{#if column.subColumns && column.subColumns.length > 0}
								<span class="rounded bg-gray-100 px-1 text-xs text-gray-500">
									{getAvailableSubColumnsCount(column)}/{column.subColumns.length}
								</span>
								<span class="text-xs text-gray-400">
									{expandedColumns.has(column.id) ? '▼' : '▶'}
								</span>
							{/if}
						</button>
					</div>

					{#if column.subColumns && expandedColumns.has(column.id)}
						<div class="border-t border-gray-200 bg-gray-50">
							{#each column.subColumns as subColumn}
								<button
									type="button"
									class="flex w-full items-center gap-2 px-6 py-2 text-left transition-colors hover:bg-[#EBFFD8]/50"
									class:opacity-50={!isAvailable(column, subColumn)}
									onclick={() => {
										if (isAvailable(column, subColumn)) {
											onSelect(column, subColumn);
										}
									}}
									disabled={!isAvailable(column, subColumn)}
								>
									<span
										class="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-[#A4CCD9] text-xs text-white"
									>
										{getColumnIcon(subColumn.type)}
									</span>
									<span class="truncate text-sm">{subColumn.name}</span>

									{#if !isAvailable(column, subColumn)}
										<span class="rounded bg-gray-100 px-1 text-xs text-gray-400">inserted</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<div class="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
		<div class="flex items-center justify-between">
			<span>Click to expand • Enter to select</span>
			<span>ESC to close</span>
		</div>
	</div>
</div>
