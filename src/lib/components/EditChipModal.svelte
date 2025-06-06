<script lang="ts">
	import type { ChipData } from '../types/column';

	interface Props {
		chip: ChipData;
		onSave: (value: string) => void;
		onCancel: () => void;
	}

	let { chip, onSave, onCancel }: Props = $props();

	let inputValue = $state(chip.value);
	let inputElement = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (inputElement) {
			inputElement.focus();
			inputElement.select();
		}
	});

	function handleSave() {
		if (inputValue.trim()) {
			onSave(inputValue.trim());
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSave();
		} else if (event.key === 'Escape') {
			onCancel();
		}
	}
</script>

<div
	class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onkeydown={(e) => e.key === 'Escape' && onCancel()}
	onclick={onCancel}
>
	<div
		class="mx-4 w-96 max-w-full rounded-lg bg-white p-6 shadow-xl"
		onclick={(e) => e.stopPropagation()}
	>
		<h3 class="mb-4 text-lg font-semibold text-gray-900">Edit Column Value</h3>

		<div class="mb-4">
			<label for="inputValue" class="mb-2 block text-sm font-medium text-gray-700">
				Column: {chip.subColumn ? `${chip.column.name}.${chip.subColumn.name}` : chip.column.name}
			</label>
			<input
				id="inputValue"
				bind:this={inputElement}
				bind:value={inputValue}
				type="text"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#8DBCC7] focus:outline-none"
				onkeydown={handleKeyDown}
				placeholder="Enter custom value..."
			/>
		</div>

		<div class="flex justify-end gap-3">
			<button
				type="button"
				class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
				onclick={onCancel}
			>
				Cancel
			</button>
			<button
				type="button"
				class="rounded-md bg-[#8DBCC7] px-4 py-2 text-white transition-colors hover:bg-[#7AABB6]"
				onclick={handleSave}
			>
				Save
			</button>
		</div>
	</div>
</div>
