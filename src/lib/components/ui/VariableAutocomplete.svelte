<script lang="ts">
	interface VariableDef {
		name: string;
		description: string;
		source: string;
	}

	let {
		value = $bindable(''),
		variables = [] as VariableDef[],
		multiline = false,
		rows = 3,
		placeholder = '',
		name = '',
		id = ''
	} = $props<{
		value?: string;
		variables?: VariableDef[];
		multiline?: boolean;
		rows?: number;
		placeholder?: string;
		name?: string;
		id?: string;
	}>();

	let inputEl = $state<HTMLInputElement | HTMLTextAreaElement>();
	let dropdownOpen = $state(false);
	let activeIndex = $state(0);
	let filterText = $state('');
	let dropdownTop = $state(0);
	let dropdownLeft = $state(0);

	// ── Filtered variable list ───────────────────────────────────────────
	let filtered = $derived.by(() => {
		if (!filterText) return variables;
		const q = filterText.toLowerCase();
		return variables.filter(
			(v) =>
				v.name.toLowerCase().includes(q) ||
				v.description.toLowerCase().includes(q)
		);
	});

	// ── Close dropdown ──────────────────────────────────────────────────
	function closeDropdown() {
		dropdownOpen = false;
		activeIndex = 0;
		filterText = '';
	}

	// ── Handle input ────────────────────────────────────────────────────
	function onInput(e: Event) {
		const el = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		const cursor = el.selectionStart ?? 0;
		const text = el.value;

		// Find the last {{ before the cursor
		const searchEnd = cursor;
		const openPos = text.lastIndexOf('{{', searchEnd - 2);
		if (openPos === -1) {
			closeDropdown();
			return;
		}

		// Check there's no }} between the {{ and cursor (already closed)
		const betweenText = text.slice(openPos + 2, cursor);
		if (betweenText.includes('}}')) {
			closeDropdown();
			return;
		}

		// Get the filter text after {{
		filterText = betweenText;
		dropdownOpen = true;
		activeIndex = 0;

		// Position the dropdown below the cursor approximately
		if (el) {
			const rect = el.getBoundingClientRect();
			// Rough position — near the cursor horizontally
			dropdownTop = rect.bottom + 4;
			dropdownLeft = rect.left;
		}
	}

	// ── Insert variable ─────────────────────────────────────────────────
	function insertVariable(variable: VariableDef) {
		const el = inputEl;
		if (!el) return;

		const cursor = el.selectionStart ?? 0;
		const text = el.value;
		const openPos = text.lastIndexOf('{{', cursor - 2);

		if (openPos === -1) return;

		// Replace from {{ to cursor with {{variable}}
		const before = text.slice(0, openPos);
		const after = text.slice(cursor);
		const replacement = `{{${variable.name}}}`;
		value = before + replacement + after;

		// Set cursor after the inserted variable
		const newCursor = before.length + replacement.length;
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(newCursor, newCursor);
		});

		closeDropdown();
	}

	// ── Keyboard navigation ─────────────────────────────────────────────
	function onKeydown(e: KeyboardEvent) {
		if (!dropdownOpen) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === 'Enter' && filtered.length > 0) {
			e.preventDefault();
			insertVariable(filtered[activeIndex]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			closeDropdown();
		}
	}

	// ── Blur handler (delay to allow click) ─────────────────────────────
	let blurTimeout: ReturnType<typeof setTimeout>;
	function onBlur() {
		blurTimeout = setTimeout(() => closeDropdown(), 200);
	}
	function onDropdownMouseDown() {
		clearTimeout(blurTimeout);
	}
</script>

<div class="relative">
	{#if multiline}
		<textarea
			bind:this={inputEl}
			{name}
			{id}
			bind:value
			{placeholder}
			{rows}
			oninput={onInput}
			onkeydown={onKeydown}
			onblur={onBlur}
			class="input-dark w-full resize-y font-mono text-sm"
		></textarea>
	{:else}
		<input
			bind:this={inputEl}
			{name}
			{id}
			type="text"
			bind:value
			{placeholder}
			oninput={onInput}
			onkeydown={onKeydown}
			onblur={onBlur}
			class="input-dark"
		/>
	{/if}

	<!-- Variable Autocomplete Dropdown -->
	{#if dropdownOpen && filtered.length > 0}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute z-50 max-h-48 w-72 overflow-y-auto rounded border border-cyan-500/30 bg-slate-900 shadow-lg shadow-cyan-500/10"
			style="top: {dropdownTop}px; left: {dropdownLeft}px;"
			onmousedown={onDropdownMouseDown}
			role="listbox"
		>
			{#each filtered as v, i (v.name)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex cursor-pointer items-start gap-2 px-3 py-2 text-xs transition-colors {i === activeIndex
						? 'bg-cyan-500/20 text-cyan-300'
						: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}"
					role="option"
					aria-selected={i === activeIndex}
					onclick={() => insertVariable(v)}
				>
					<code class="shrink-0 rounded bg-slate-800/80 px-1 py-0.5 text-[11px] text-fuchsia-400"
						>{'{{' + v.name + '}}'}</code
					>
					<span class="truncate">{v.description}</span>
					<span class="ml-auto shrink-0 text-[10px] text-slate-600">{v.source}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
