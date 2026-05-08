<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import WheelCard from '$lib/components/ui/WheelCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { WheelEntry } from '$lib/components/ui/WheelCard.svelte';

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
			posterPath: entry.posterPath ?? '',
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
			posterPath: '',
			suggestedBy: data.discordUserId ?? ''
		};
	}

	function cancelEdit() {
		editingId = null;
		editValues = {};
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
	<input type="hidden" name="posterPath" value={editValues.posterPath ?? ''} />
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
	<input type="hidden" name="posterPath" value={editValues.posterPath ?? ''} />
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
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#if editingId === 'new'}
				<WheelCard
					isNew={true}
					bind:editValues
					saveFormId="create-form"
					onCancel={cancelEdit}
				/>
			{/if}
			{#each filteredEntries as entry (entry.id)}
				<WheelCard
					{entry}
					isEditing={editingId === entry.id}
					bind:editValues
					saveFormId="update-form"
					onEdit={() => startEdit(entry)}
					onDelete={() => {
						const input = document.getElementById('delete-id') as HTMLInputElement;
						if (input) input.value = entry.id;
						(document.getElementById('delete-form') as HTMLFormElement).requestSubmit();
					}}
					onCancel={cancelEdit}
				/>
			{/each}
		</div>
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
