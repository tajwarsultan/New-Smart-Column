<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ColumnDropdown from './ColumnDropdown.svelte';
	import EditChipModal from './EditChipModal.svelte';
	import type { Column, ChipData } from '../types/column';

	let {
		fetchColumns,
		currentRow = {},
		placeholder = 'Type / to insert column data...'
	} = $props<{
		fetchColumns: () => Promise<Column[]>;
		currentRow: Record<string, string>;
		placeholder?: string;
	}>();

	let editor = $state<HTMLDivElement | null>(null);
	let isDropdownOpen = $state(false);
	let columns = $state<Column[]>([]);
	let filteredColumns = $state<Column[]>([]);
	let dropdownPosition = $state({ top: 0, left: 0 });
	let searchTerm = $state('');
	let selectedIndex = $state(0);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let chips = $state<ChipData[]>([]);
	let insertedColumnPaths = $state<Set<string>>(new Set());
	let draggedChip = $state<ChipData | null>(null);
	let editingChip = $state<ChipData | null>(null);
	let showEditModal = $state(false);

	onMount(async () => {
		try {
			loading = true;
			columns = await fetchColumns();
		} catch (err) {
			error = 'Failed to load columns';
			console.error(err);
		} finally {
			loading = false;
		}
	});

	$effect(() => {
		if (columns.length === 0) {
			filteredColumns = [];
			return;
		}

		let filtered = columns;

		if (searchTerm) {
			filtered = filtered.filter(
				(col) =>
					col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(col.subColumns &&
						col.subColumns.some((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase())))
			);
		}

		filtered = filtered.filter((col) => {
			const isMainColumnInserted = insertedColumnPaths.has(col.name);
			const hasAvailableSubColumns =
				col.subColumns &&
				col.subColumns.some((sub) => !insertedColumnPaths.has(`${col.name}.${sub.name}`));

			return !isMainColumnInserted || hasAvailableSubColumns;
		});

		filteredColumns = filtered;
		selectedIndex = 0;
	});

	function handleInput(event: Event) {
		const selection = window.getSelection();
		if (!selection || !editor) return;

		updateInsertedColumnPaths();

		const textBeforeCaret = getTextBeforeCaret();
		const match = textBeforeCaret.match(/\/([^/\s]*)$/);

		if (match) {
			searchTerm = match[1];
			if (!isDropdownOpen) {
				openDropdown();
			}
		} else if (isDropdownOpen) {
			closeDropdown();
		}
	}

	function updateInsertedColumnPaths() {
		if (!editor) return;

		const chipElements = editor.querySelectorAll('[data-column-path]');
		const newInsertedPaths = new Set<string>();

		chipElements.forEach((element) => {
			const columnPath = element.getAttribute('data-column-path');
			if (columnPath) {
				newInsertedPaths.add(columnPath);
			}
		});

		insertedColumnPaths = newInsertedPaths;
	}

	function getTextBeforeCaret(): string {
		const selection = window.getSelection();
		if (!selection || !editor) return '';

		const range = selection.getRangeAt(0).cloneRange();
		range.setStart(editor, 0);
		return range.toString();
	}

	async function openDropdown() {
		if (columns.length === 0) {
			error = 'No columns available to insert';
			setTimeout(() => (error = null), 3000);
			return;
		}

		isDropdownOpen = true;
		await tick();
		positionDropdown();
	}

	function closeDropdown() {
		isDropdownOpen = false;
		searchTerm = '';
		error = null;
	}

	function positionDropdown() {
		const selection = window.getSelection();
		if (!selection || !editor) return;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		const editorRect = editor.getBoundingClientRect();

		dropdownPosition = {
			top: rect.bottom - editorRect.top + 5,
			left: rect.left - editorRect.left
		};
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isDropdownOpen) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredColumns.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredColumns.length > 0 && selectedIndex < filteredColumns.length) {
					const selectedColumn = filteredColumns[selectedIndex];
					if (selectedColumn.subColumns && selectedColumn.subColumns.length > 0) {
						return;
					}
					insertColumn(selectedColumn);
				}
				break;
			case 'Escape':
				event.preventDefault();
				closeDropdown();
				break;
		}
	}

	async function insertColumn(column: Column, subColumn?: Column) {
		if (!editor) return;

		const columnPath = subColumn ? `${column.name}.${subColumn.name}` : column.name;
		const displayName = subColumn ? `${column.name}.${subColumn.name}` : column.name;

		if (insertedColumnPaths.has(columnPath)) {
			error = `"${displayName}" is already inserted`;
			setTimeout(() => (error = null), 3000);
			return;
		}

		const selection = window.getSelection();
		if (!selection) return;

		const range = selection.getRangeAt(0);
		const textBeforeCaret = getTextBeforeCaret();
		const match = textBeforeCaret.match(/\/([^/\s]*)$/);

		if (match) {
			const chipData: ChipData = {
				id: `chip-${Date.now()}-${Math.random()}`,
				column,
				subColumn,
				value: currentRow[columnPath] || `[${displayName}]`,
				path: columnPath
			};

			const chipElement = createChipElement(chipData);

			let textNode = range.startContainer;

			while (textNode && textNode.nodeType !== Node.TEXT_NODE) {
				textNode = textNode.firstChild;
			}

			if (textNode && textNode.nodeType === Node.TEXT_NODE) {
				const textContent = textNode.textContent || '';
				const slashIndex = textContent.lastIndexOf('/' + match[1]);

				if (slashIndex >= 0) {
					const beforeText = textContent.substring(0, slashIndex);
					const afterText = textContent.substring(slashIndex + match[1].length + 1);

					textNode.textContent = beforeText;

					if (textNode.parentNode) {
						textNode.parentNode.insertBefore(chipElement, textNode.nextSibling);

						if (afterText) {
							const afterTextNode = document.createTextNode(afterText);
							textNode.parentNode.insertBefore(afterTextNode, chipElement.nextSibling);
						}

						const spaceNode = document.createTextNode(' ');
						textNode.parentNode.insertBefore(spaceNode, chipElement.nextSibling);

						const newRange = document.createRange();
						newRange.setStartAfter(spaceNode);
						newRange.setEndAfter(spaceNode);
						selection.removeAllRanges();
						selection.addRange(newRange);
					}
				}
			}

			chips = [...chips, chipData];

			updateInsertedColumnPaths();

			closeDropdown();
			editor.focus();
		}
	}

	function createChipElement(chipData: ChipData): HTMLElement {
		const chipElement = document.createElement('span');
		chipElement.setAttribute('data-column-id', chipData.column.id);
		chipElement.setAttribute('data-column-path', chipData.path);
		chipElement.setAttribute('data-chip-id', chipData.id);
		chipElement.setAttribute('contenteditable', 'false');
		chipElement.setAttribute('draggable', 'true');

		chipElement.classList.add(
			'inline-flex',
			'items-center',
			'bg-[#C4E1E6]',
			'text-gray-700',
			'rounded-md',
			'px-2',
			'py-1',
			'mx-1',
			'text-sm',
			'font-medium',
			'border',
			'border-[#A4CCD9]',
			'cursor-pointer',
			'hover:bg-[#A4CCD9]',
			'transition-colors',
			'group'
		);

		const iconSpan = document.createElement('span');
		iconSpan.classList.add(
			'inline-flex',
			'items-center',
			'justify-center',
			'w-5',
			'h-5',
			'mr-1',
			'bg-[#8DBCC7]',
			'rounded-md',
			'text-white',
			'text-xs'
		);
		iconSpan.textContent = getColumnIcon(chipData.subColumn?.type || chipData.column.type);
		chipElement.appendChild(iconSpan);

		const textSpan = document.createElement('span');
		textSpan.textContent = chipData.subColumn
			? `${chipData.column.name}.${chipData.subColumn.name}`
			: chipData.column.name;
		chipElement.appendChild(textSpan);

		const editBtn = document.createElement('button');
		editBtn.innerHTML = '✏️';
		editBtn.classList.add(
			'ml-1',
			'text-gray-500',
			'hover:text-gray-700',
			'opacity-0',
			'group-hover:opacity-100',
			'transition-opacity',
			'text-xs',
			'w-4',
			'h-4',
			'flex',
			'items-center',
			'justify-center'
		);
		editBtn.onclick = (e) => {
			e.stopPropagation();
			editChip(chipData);
		};
		chipElement.appendChild(editBtn);

		const removeBtn = document.createElement('button');
		removeBtn.innerHTML = '×';
		removeBtn.classList.add(
			'ml-1',
			'text-red-500',
			'hover:text-red-700',
			'opacity-0',
			'group-hover:opacity-100',
			'transition-opacity',
			'text-sm',
			'w-4',
			'h-4',
			'flex',
			'items-center',
			'justify-center'
		);
		removeBtn.onclick = (e) => {
			e.stopPropagation();
			removeChip(chipData.id);
		};
		chipElement.appendChild(removeBtn);

		chipElement.ondragstart = (e) => {
			draggedChip = chipData;
			chipElement.classList.add('opacity-50');
			e.dataTransfer?.setData('text/plain', chipData.id);
		};

		chipElement.ondragend = (e) => {
			draggedChip = null;
			chipElement.classList.remove('opacity-50');
		};

		return chipElement;
	}

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

	function removeChip(chipId: string) {
		if (!editor) return;

		const chipElement = editor.querySelector(`[data-chip-id="${chipId}"]`);
		if (chipElement) {
			chipElement.remove();
		}

		chips = chips.filter((chip) => chip.id !== chipId);

		updateInsertedColumnPaths();

		editor.focus();
	}

	function editChip(chipData: ChipData) {
		editingChip = chipData;
		showEditModal = true;
	}

	function saveEditedChip(newValue: string) {
		if (!editingChip || !editor) return;

		chips = chips.map((chip) =>
			chip.id === editingChip!.id ? { ...chip, value: newValue } : chip
		);

		const chipElement = editor.querySelector(`[data-chip-id="${editingChip.id}"]`);
		if (chipElement) {
			const textSpan = chipElement.querySelector('span:nth-child(2)');
			if (textSpan) {
				textSpan.textContent = newValue;
			}
		}

		showEditModal = false;
		editingChip = null;
		editor.focus();
	}

	function handleDragOver(event: DragEvent) {
		if (draggedChip) {
			event.preventDefault();
		}
	}

	function handleDrop(event: DragEvent) {
		if (!draggedChip || !editor) return;

		event.preventDefault();

		const range = document.caretRangeFromPoint(event.clientX, event.clientY);
		if (range) {
			const draggedElement = editor.querySelector(`[data-chip-id="${draggedChip.id}"]`);
			if (draggedElement) {
				draggedElement.remove();
			}

			const newChipElement = createChipElement(draggedChip);
			range.insertNode(newChipElement);

			const spaceNode = document.createTextNode(' ');
			newChipElement.parentNode?.insertBefore(spaceNode, newChipElement.nextSibling);
		}

		draggedChip = null;
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') || '';
		document.execCommand('insertText', false, text);
	}
</script>

<div class="relative">
	<div class="relative">
		<div
			bind:this={editor}
			contenteditable="true"
			role="textbox"
			tabindex="0"
			class="min-h-[120px] rounded-md border border-gray-300 bg-white p-3 text-gray-700 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#8DBCC7] focus:outline-none"
			class:border-red-300={error}
			class:ring-red-500={error}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onpaste={handlePaste}
			ondragover={handleDragOver}
			ondrop={handleDrop}
			data-placeholder={placeholder}
		></div>
	</div>

	{#if isDropdownOpen}
		<ColumnDropdown
			columns={filteredColumns}
			position={dropdownPosition}
			{selectedIndex}
			{searchTerm}
			insertedPaths={insertedColumnPaths}
			onSelect={insertColumn}
			onClose={closeDropdown}
		/>
	{/if}

	{#if showEditModal && editingChip}
		<EditChipModal
			chip={editingChip}
			onSave={saveEditedChip}
			onCancel={() => {
				showEditModal = false;
				editingChip = null;
			}}
		/>
	{/if}

	{#if loading}
		<div class="mt-2 flex items-center gap-2 text-sm text-[#8DBCC7]">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-[#8DBCC7] border-t-transparent"
			></div>
			Loading columns...
		</div>
	{/if}

	{#if error}
		<div
			class="mt-2 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
		>
			<svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
			{error}
		</div>
	{/if}

	<div class="mt-1 flex justify-between">
		<div>
			<small class="pt-2 text-xs text-gray-500">
				Type <span class="bg-[#8dbcc756] px-2 py-1 font-bold text-[#000]">/</span> to insert a Column
			</small>
			<small class="pt-2 text-[10px] text-gray-500">
				{#if insertedColumnPaths.size > 0}
					( <span class="text-[#8DBCC7]">Hover chips to edit/delete • Drag to reorder</span> )
				{/if}
			</small>
		</div>

		<small class="pt-2 text-[10px] text-gray-500">
			{insertedColumnPaths.size} column{insertedColumnPaths.size !== 1 ? 's' : ''} inserted • {columns.length}
			available
		</small>
	</div>
</div>

<style>
	[contenteditable='true']:empty:before {
		content: attr(data-placeholder);
		color: #9ca3af;
		pointer-events: none;
	}
</style>
