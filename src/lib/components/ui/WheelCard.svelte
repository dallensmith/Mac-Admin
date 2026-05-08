<script lang="ts">
	export interface WheelEntry {
		id: string;
		title: string;
		year: string;
		tmdbId: string;
		imdbId: string;
		suggestedBy: string;
		voters: string;
		created: string;
		updated: string;
	}

	let {
		entry = undefined,
		isEditing = false,
		isNew = false,
		editValues = $bindable<Record<string, string>>({}),
		saveFormId,
		onEdit,
		onDelete,
		onSave,
		onCancel
	}: {
		entry?: WheelEntry;
		isEditing?: boolean;
		isNew?: boolean;
		editValues?: Record<string, string>;
		saveFormId: string;
		onEdit?: () => void;
		onDelete?: () => void;
		onSave?: () => void;
		onCancel?: () => void;
	} = $props();

	function voterCount(voters: string): number {
		return voters ? voters.split(',').filter(Boolean).length : 0;
	}

	function voterTooltip(voters: string): string {
		return voters ? voters.split(',').filter(Boolean).join(', ') : '';
	}

	let inEditMode = $derived(isEditing || isNew);
</script>

{#if inEditMode}
	<!-- Edit / Ghost card -->
	<div
		class="group relative flex flex-col overflow-hidden rounded-none border-2 bg-slate-900/80 shadow-card backdrop-blur-md transition-all duration-300
		{isNew
			? 'border-dashed border-cyan-500/40 hover:border-cyan-500/60'
			: 'border-slate-700 hover:border-cyan-500/50 hover:shadow-card-hover'}"
	>
		<!-- Top glow line -->
		<div
			class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
		></div>

		<div class="flex flex-1 flex-col gap-3 p-4">
			{#if isNew}
				<p class="label-caps text-cyan-500/70">New Entry</p>
			{:else}
				<p class="label-caps text-slate-500">Editing</p>
			{/if}

			<input
				type="text"
				placeholder="Title *"
				bind:value={editValues.title}
				class="input-dark"
			/>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Year"
					bind:value={editValues.year}
					class="input-dark w-24"
				/>
				<input
					type="text"
					placeholder="Suggested by"
					bind:value={editValues.suggestedBy}
					class="input-dark flex-1"
				/>
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="TMDb ID"
					bind:value={editValues.tmdbId}
					class="input-dark flex-1"
				/>
				<input
					type="text"
					placeholder="IMDb ID"
					bind:value={editValues.imdbId}
					class="input-dark flex-1"
				/>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 border-t border-slate-800/60 px-4 py-3">
			<button
				type="submit"
				form={saveFormId}
				disabled={!editValues.title?.trim()}
				class="text-label font-bold tracking-wider uppercase text-cyan-500 transition-colors hover:text-cyan-300 hover:drop-shadow-glow-cyan-xl disabled:cursor-not-allowed disabled:opacity-40"
			>
				Save
			</button>
			<button
				onclick={onCancel}
				class="text-label font-bold tracking-wider uppercase text-slate-400 transition-colors hover:text-slate-200"
			>
				Cancel
			</button>
		</div>
	</div>
{:else if entry}
	<!-- Display card -->
	<div
		class="group relative flex flex-col overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-card-hover"
	>
		<!-- Top glow line -->
		<div
			class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
		></div>

		<div class="flex flex-1 flex-col gap-2 p-4">
			<!-- Title + year badge -->
			<div class="flex items-start justify-between gap-2">
				<h3 class="text-base font-semibold leading-snug text-cyan-400 group-hover:text-cyan-300">
					{entry.title}
				</h3>
				{#if entry.year}
					<span
						class="mt-0.5 shrink-0 rounded-none border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-ui text-slate-400"
					>
						{entry.year}
					</span>
				{/if}
			</div>

			<!-- Suggested by -->
			<p class="text-ui text-slate-400">
				<span class="label-caps mr-1 text-slate-600">By</span>
				{entry.suggestedBy || '—'}
			</p>

			<!-- Votes -->
			<div class="flex items-center gap-1.5">
				{#if voterCount(entry.voters) > 0}
					<!-- Fuchsia vote pill with tooltip -->
					<span
						title={voterTooltip(entry.voters)}
						class="cursor-default rounded-none border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-ui font-medium text-fuchsia-400"
					>
						{voterCount(entry.voters)}
						{voterCount(entry.voters) === 1 ? 'vote' : 'votes'}
					</span>
				{:else}
					<span class="text-ui text-slate-600">No votes yet</span>
				{/if}
			</div>

			<!-- External links -->
			<div class="mt-auto flex flex-wrap gap-2 pt-2">
				{#if entry.tmdbId}
					<a
						href="https://www.themoviedb.org/movie/{entry.tmdbId}"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-none border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-ui text-cyan-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
					>
						TMDb ↗
					</a>
				{/if}
				{#if entry.imdbId}
					<a
						href="https://www.imdb.com/title/{entry.imdbId}"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-none border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-ui text-cyan-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
					>
						IMDb ↗
					</a>
				{/if}
			</div>
		</div>

		<!-- Footer: date + actions -->
		<div
			class="flex items-center justify-between border-t border-slate-800/60 px-4 py-2.5 transition-colors duration-300 group-hover:border-cyan-500/10"
		>
			<span class="text-ui text-slate-600">
				{entry.created ? entry.created.split('T')[0] : '—'}
			</span>
			<div class="flex gap-3">
				<button
					onclick={onEdit}
					class="text-label font-bold tracking-wider uppercase text-slate-400 transition-colors hover:text-cyan-400"
				>
					Edit
				</button>
				<button
					onclick={onDelete}
					class="text-label font-bold tracking-wider uppercase text-slate-600 transition-colors hover:text-rose-500"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
