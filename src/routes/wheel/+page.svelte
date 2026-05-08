<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { WheelEntry } from './+page.server';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let searchQuery = $state('');
	let editingId = $state<string | null>(null);
	let editValues = $state<Record<string, string>>({});

	let filteredEntries = $derived(
		data.entries.filter((e: WheelEntry) => {
			const q = searchQuery.toLowerCase();
			return e.title.toLowerCase().includes(q) || e.suggestedBy.toLowerCase().includes(q);
		})
	);

	let totalEntries = $derived(data.entries.length);
	let totalVotes = $derived(
		data.entries.reduce((sum: number, e: WheelEntry) => {
			const ids = e.voters ? e.voters.split(',').filter(Boolean) : [];
			return sum + ids.length;
		}, 0)
	);
	let mostRecent = $derived(
		data.entries.length > 0
			? data.entries
					.reduce((latest: WheelEntry, e: WheelEntry) =>
						e.created > latest.created ? e : latest
					)
					.created.split('T')[0]
			: '—'
	);
	let uniqueSuggesters = $derived(new Set(data.entries.map((e: WheelEntry) => e.suggestedBy)).size);

	function startEdit(entry: WheelEntry) {
		editingId = entry.id;
		editValues = {
			id: entry.id,
			title: entry.title,
			year: entry.year ?? '',
			tmdbId: entry.tmdbId ?? '',
			imdbId: entry.imdbId ?? '',
			suggestedBy: entry.suggestedBy ?? ''
		};
	}

	function startAdd() {
		editingId = 'new';
		editValues = {
			title: '',
			year: '',
			tmdbId: '',
			imdbId: '',
			suggestedBy: data.discordUserId ?? ''
		};
	}

	function cancelEdit() {
		editingId = null;
		editValues = {};
	}

	function voterTooltip(voters: string): string {
		const ids = voters ? voters.split(',').filter(Boolean) : [];
		return ids.join(', ');
	}

	function voterCount(voters: string): number {
		return voters ? voters.split(',').filter(Boolean).length : 0;
	}
</script>

<PageHeader
	title="The Wheel"
	description="Manage community movie wheel candidates synced from Discord."
/>

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total Entries" value={totalEntries.toString()} />
	<StatCard title="Total Votes" value={totalVotes.toString()} />
	<StatCard title="Most Recent" value={mostRecent} />
	<StatCard title="Unique Suggesters" value={uniqueSuggesters.toString()} />
</div>

<!-- Hidden forms -->
<form
	id="create-form"
	method="POST"
	action="?/create"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				await invalidateAll();
				editingId = null;
				editValues = {};
			}
		};
	}}
>
	<input type="hidden" name="title" value={editValues.title ?? ''} />
	<input type="hidden" name="year" value={editValues.year ?? ''} />
	<input type="hidden" name="tmdbId" value={editValues.tmdbId ?? ''} />
	<input type="hidden" name="imdbId" value={editValues.imdbId ?? ''} />
	<input type="hidden" name="suggestedBy" value={editValues.suggestedBy ?? ''} />
</form>

<form
	id="update-form"
	method="POST"
	action="?/update"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				await invalidateAll();
				editingId = null;
				editValues = {};
			}
		};
	}}
>
	<input type="hidden" name="id" value={editValues.id ?? ''} />
	<input type="hidden" name="title" value={editValues.title ?? ''} />
	<input type="hidden" name="year" value={editValues.year ?? ''} />
	<input type="hidden" name="tmdbId" value={editValues.tmdbId ?? ''} />
	<input type="hidden" name="imdbId" value={editValues.imdbId ?? ''} />
	<input type="hidden" name="suggestedBy" value={editValues.suggestedBy ?? ''} />
</form>

<form
	id="delete-form"
	method="POST"
	action="?/delete"
	class="hidden"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				await invalidateAll();
			}
		};
	}}
>
	<input type="hidden" name="id" id="delete-id" value="" />
</form>

<SectionCard title="Wheel Candidates">
	{#snippet headerAction()}
		<div class="flex items-center gap-3">
			<input
				type="text"
				placeholder="Search by title or user..."
				bind:value={searchQuery}
				class="w-56 rounded border border-slate-800/80 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-200 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
			/>
			{#if editingId !== 'new'}
				<button
					onclick={startAdd}
					class="text-label font-bold tracking-wider text-cyan-500 uppercase transition-colors hover:text-cyan-300 hover:drop-shadow-glow-cyan-xl"
				>
					+ Add Entry
				</button>
			{/if}
		</div>
	{/snippet}

	{#if editingId === 'new' || filteredEntries.length > 0}
		<DataTable
			columns={['Title', 'Year', 'Suggested By', 'Date Added', 'Voters', 'TMDb', 'IMDb', 'Actions']}
			data={editingId === 'new'
				? [{} as Record<string, unknown>, ...filteredEntries]
				: filteredEntries}
		>
			{#snippet rowSnippet(row, idx)}
				{@const entry = row as unknown as WheelEntry}
				{@const isNewRow = editingId === 'new' && idx === 0}
				{@const isEditRow = !isNewRow && editingId === entry.id}

				{#if isNewRow || isEditRow}
					<!-- Editable row -->
					<td class="px-4 py-2">
						<input
							type="text"
							placeholder="Title *"
							bind:value={editValues.title}
							class="w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
						/>
					</td>
					<td class="px-4 py-2">
						<input
							type="text"
							placeholder="Year"
							bind:value={editValues.year}
							class="w-20 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
						/>
					</td>
					<td class="px-4 py-2">
						<input
							type="text"
							placeholder="Suggested by"
							bind:value={editValues.suggestedBy}
							class="w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
						/>
					</td>
					<td class="px-4 py-2 text-xs text-slate-500">
						{isNewRow ? new Date().toISOString().split('T')[0] : entry.created.split('T')[0]}
					</td>
					<td class="px-4 py-2 text-xs text-slate-500">
						{isNewRow || voterCount(entry.voters) === 0
							? '—'
							: `${voterCount(entry.voters)} vote${voterCount(entry.voters) === 1 ? '' : 's'}`}
					</td>
					<td class="px-4 py-2">
						<input
							type="text"
							placeholder="TMDb ID"
							bind:value={editValues.tmdbId}
							class="w-24 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
						/>
					</td>
					<td class="px-4 py-2">
						<input
							type="text"
							placeholder="IMDb ID"
							bind:value={editValues.imdbId}
							class="w-28 rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
						/>
					</td>
					<td class="px-4 py-2 text-right whitespace-nowrap">
						<div class="flex justify-end gap-3">
							<button
								type="submit"
								form={isNewRow ? 'create-form' : 'update-form'}
								disabled={!editValues.title?.trim()}
								class="text-label font-bold tracking-wider text-cyan-500 uppercase transition-colors hover:text-cyan-300 hover:drop-shadow-glow-cyan-xl disabled:cursor-not-allowed disabled:opacity-40"
							>
								Save
							</button>
							<button
								onclick={cancelEdit}
								class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-slate-200"
							>
								Cancel
							</button>
						</div>
					</td>
				{:else}
					<!-- Display row -->
					<td class="px-6 py-4 font-medium whitespace-nowrap text-cyan-400">{entry.title}</td>
					<td class="px-6 py-4 whitespace-nowrap text-slate-400">{entry.year || '—'}</td>
					<td class="px-6 py-4 whitespace-nowrap text-slate-300">{entry.suggestedBy || '—'}</td>
					<td class="px-6 py-4 text-xs whitespace-nowrap text-slate-500"
						>{entry.created ? entry.created.split('T')[0] : '—'}</td
					>
					<td class="px-6 py-4 whitespace-nowrap text-slate-400">
						{#if voterCount(entry.voters) > 0}
							<span title={voterTooltip(entry.voters)} class="cursor-default">
								{voterCount(entry.voters)} vote{voterCount(entry.voters) === 1 ? '' : 's'}
							</span>
						{:else}
							<span class="text-slate-600">—</span>
						{/if}
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						{#if entry.tmdbId}
							<a
								href="https://www.themoviedb.org/movie/{entry.tmdbId}"
								target="_blank"
								rel="noopener noreferrer"
								class="font-mono text-xs text-cyan-500 underline underline-offset-2 hover:text-cyan-300"
							>
								{entry.tmdbId}
							</a>
						{:else}
							<span class="text-slate-600">—</span>
						{/if}
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						{#if entry.imdbId}
							<a
								href="https://www.imdb.com/title/{entry.imdbId}"
								target="_blank"
								rel="noopener noreferrer"
								class="font-mono text-xs text-cyan-500 underline underline-offset-2 hover:text-cyan-300"
							>
								{entry.imdbId}
							</a>
						{:else}
							<span class="text-slate-600">—</span>
						{/if}
					</td>
					<td class="px-6 py-4 text-right whitespace-nowrap">
						<div class="flex justify-end gap-3">
							<button
								onclick={() => startEdit(entry)}
								class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-cyan-400"
							>
								Edit
							</button>
							<button
								onclick={() => {
									const input = document.getElementById('delete-id') as HTMLInputElement;
									if (input) input.value = entry.id;
									(document.getElementById('delete-form') as HTMLFormElement).requestSubmit();
								}}
								class="text-label font-bold tracking-wider text-slate-600 uppercase transition-colors hover:text-rose-500"
							>
								Delete
							</button>
						</div>
					</td>
				{/if}
			{/snippet}
		</DataTable>
	{:else}
		<EmptyState
			title="No entries found"
			message={data.entries.length === 0
				? 'No movies in the wheel yet. Add one or wait for the bot to sync from Discord.'
				: 'No entries match your search.'}
		/>
		{#if searchQuery}
			<div class="mt-4 flex justify-center">
				<button
					onclick={() => (searchQuery = '')}
					class="text-sm text-cyan-500 underline underline-offset-2 hover:text-cyan-300"
				>
					Clear Search
				</button>
			</div>
		{/if}
	{/if}
</SectionCard>
