<script lang="ts">
	import VariableAutocomplete from '$lib/components/ui/VariableAutocomplete.svelte';

	type EmbedField = { name: string; value: string; inline: boolean };

	let {
		fields = $bindable([] as EmbedField[]),
		readonly = false,
		variables = [] as { name: string; description: string; source: string }[]
	} = $props<{
		fields?: EmbedField[];
		readonly?: boolean;
		variables?: { name: string; description: string; source: string }[];
	}>();

	const MAX_FIELDS = 25;

	let fieldCount = $derived(fields.length);
	let atLimit = $derived(fieldCount >= MAX_FIELDS);

	function addField() {
		if (atLimit) return;
		fields = [...fields, { name: '', value: '', inline: true }];
	}

	function removeField(index: number) {
		fields = fields.filter((_: EmbedField, i: number) => i !== index);
	}

	function moveField(index: number, direction: -1 | 1) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= fields.length) return;
		const copy = [...fields];
		[copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
		fields = copy;
	}

	function toggleInline(index: number) {
		fields = fields.map((f: EmbedField, i: number) => (i === index ? { ...f, inline: !f.inline } : f));
	}
</script>

<div class="space-y-3">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="label-caps">Inline Fields</span>
			<span
				class="rounded px-1.5 py-0.5 text-[10px] font-bold {atLimit
					? 'bg-rose-500/20 text-rose-400'
					: 'bg-slate-700 text-slate-400'}"
			>
				{fieldCount}/{MAX_FIELDS}
			</span>
		</div>
		{#if !readonly && !atLimit}
			<button
				type="button"
				class="text-label-xs font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300"
				onclick={addField}
			>
				+ Add Field
			</button>
		{/if}
	</div>

	{#if atLimit}
		<p class="text-xs text-rose-400">Maximum of {MAX_FIELDS} fields reached (Discord limit).</p>
	{/if}

	<!-- Field List -->
	{#if fields.length === 0}
		<p class="rounded border border-slate-800/60 bg-slate-900/40 px-4 py-6 text-center text-xs text-slate-500">
			No inline fields defined. Add fields to display structured data in the embed.
		</p>
	{:else}
		<div class="space-y-2">
			{#each fields as field, i (i)}
				<div class="rounded border border-slate-800/60 bg-slate-900/40 p-3">
					<div class="flex items-start gap-2">
						<!-- Move up/down -->
						<div class="flex shrink-0 flex-col gap-0.5 pt-0.5">
							<button
								type="button"
								disabled={i === 0 || readonly}
								class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
								onclick={() => moveField(i, -1)}
								aria-label="Move field up"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="m18 15-6-6-6 6" /></svg
								>
							</button>
							<button
								type="button"
								disabled={i === fields.length - 1 || readonly}
								class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
								onclick={() => moveField(i, 1)}
								aria-label="Move field down"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="m6 9 6 6 6-6" /></svg
								>
							</button>
						</div>

						<!-- Field inputs -->
						<div class="min-w-0 flex-1 space-y-2">
							<div class="grid gap-2 sm:grid-cols-2">
								<VariableAutocomplete
									bind:value={field.name}
									{variables}
									placeholder="Field name (max 256)"
								/>
								<VariableAutocomplete
									bind:value={field.value}
									{variables}
									placeholder="Field value (max 1024)"
								/>
							</div>
						</div>

						<!-- Inline toggle + remove -->
						<div class="flex shrink-0 items-center gap-2 pt-0.5">
							<button
								type="button"
								disabled={readonly}
								class="rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors {field.inline
									? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
									: 'border-slate-700 bg-slate-800 text-slate-500'} {readonly
									? 'cursor-default opacity-60'
									: 'hover:border-cyan-500/40 hover:text-cyan-300'}"
								onclick={() => toggleInline(i)}
								title={field.inline ? 'Inline (side-by-side)' : 'Block (full width)'}
							>
								{field.inline ? 'Inline' : 'Block'}
							</button>
							{#if !readonly}
								<button
									type="button"
									class="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400"
									onclick={() => removeField(i)}
									aria-label="Remove field"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M3 6h18" /><path
											d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
										/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg
									>
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
