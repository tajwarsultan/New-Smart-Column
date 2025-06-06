<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ColumnDropdown from './ColumnDropdown.svelte';
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
	let insertedColumnIds = $state<Set<string>>(new Set());

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
		if (searchTerm) {
			filteredColumns = columns.filter((col) =>
				col.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		} else {
			filteredColumns = columns;
		}
		selectedIndex = 0;
	});

	function handleInput(event: Event) {
		const selection = window.getSelection();
		if (!selection || !editor) return;

		const text = editor.textContent || '';

		updateInsertedColumnIds();

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

	function updateInsertedColumnIds() {
		if (!editor) return;

		const chipElements = editor.querySelectorAll('[data-column-id]');
		const newInsertedIds = new Set<string>();

		chipElements.forEach((element) => {
			const columnId = element.getAttribute('data-column-id');
			if (columnId) {
				newInsertedIds.add(columnId);
			}
		});

		insertedColumnIds = newInsertedIds;
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
			error = 'No columns available';
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
					insertColumn(filteredColumns[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				closeDropdown();
				break;
		}
	}

	async function insertColumn(column: Column) {
		if (!editor) return;

		const selection = window.getSelection();
		if (!selection) return;

		const range = selection.getRangeAt(0);
		const textBeforeCaret = getTextBeforeCaret();
		const match = textBeforeCaret.match(/\/([^/\s]*)$/);

		if (match) {
			const matchStart = textBeforeCaret.lastIndexOf('/' + match[1]);

			const chipData: ChipData = {
				id: `chip-${Date.now()}-${Math.random()}`,
				column,
				value: currentRow[column.name] || `[${column.name}]`
			};

			const chipElement = createChipElement(column);

			let textNode = range.startContainer;
			let offset = range.startOffset;

			while (textNode && textNode.nodeType !== Node.TEXT_NODE) {
				textNode = textNode?.firstChild as Node | null;
				if (!textNode) break;
				offset = 0;
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

			updateInsertedColumnIds();

			closeDropdown();
			editor.focus();
		}
	}

	function createChipElement(column: Column): HTMLElement {
		const chipElement = document.createElement('span');
		chipElement.setAttribute('data-column-id', column.id);
		chipElement.setAttribute('data-column-name', column.name);
		chipElement.setAttribute('contenteditable', 'false');
		chipElement.setAttribute('draggable', 'false');

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
			'cursor-default'
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
		iconSpan.textContent = getColumnIcon(column.type);
		chipElement.appendChild(iconSpan);

		const textSpan = document.createElement('span');
		textSpan.textContent = column.name;
		chipElement.appendChild(textSpan);

		return chipElement;
	}

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

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') || '';
		document.execCommand('insertText', false, text);
	}

	function getContentAsText(): string {
		if (!editor) return '';

		let result = '';
		const walker = document.createTreeWalker(editor, NodeFilter.SHOW_ALL, null);

		let node;
		while ((node = walker.nextNode())) {
			if (node.nodeType === Node.TEXT_NODE) {
				result += node.textContent;
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				if (element.hasAttribute('data-column-name')) {
					const columnName = element.getAttribute('data-column-name');
					result += `[${columnName}]`;
				}
			}
		}

		return result;
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
			data-placeholder={placeholder}
		></div>
	</div>

	{#if isDropdownOpen}
		<ColumnDropdown
			columns={filteredColumns}
			position={dropdownPosition}
			{selectedIndex}
			{searchTerm}
			onSelect={insertColumn}
			onClose={closeDropdown}
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
		<div class="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600">
			{error}
		</div>
	{/if}

	<div class="mt-2 text-xs text-gray-500">
		{insertedColumnIds.size} column{insertedColumnIds.size !== 1 ? 's' : ''} inserted • {columns.length}
		available
	</div>
</div>

<style>
	[contenteditable='true']:empty:before {
		content: attr(data-placeholder);
		color: #9ca3af;
		pointer-events: none;
	}
</style>
