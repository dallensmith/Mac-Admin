<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { wheelSuggestions } from '$lib/mock/admin';

	// TODO: Replace mock data with PocketBase collection
	// TODO: Sync suggestions from Discord bot
	// TODO: Add real-time updates

	let suggestions = $state([...wheelSuggestions]);

	let searchQuery = $state('');
	let filterStatus = $state('All');

	let filteredSuggestions = $derived(
		suggestions.filter((s) => {
			const matchesSearch =
				s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.suggestedBy.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus =
				filterStatus === 'All' || s.status.toLowerCase() === filterStatus.toLowerCase();
			return matchesSearch && matchesStatus;
		})
	);

	let totalSuggestions = $derived(suggestions.length);
	let pendingCount = $derived(suggestions.filter((s) => s.status === 'pending').length);
	let approvedCount = $derived(suggestions.filter((s) => s.status === 'approved').length);
	let watchedCount = $derived(suggestions.filter((s) => s.status === 'watched').length);

	// New Suggestion Form State
	let newTitle = $state('');
	let newYear = $state('');
	let newSuggestedBy = $state('');
	let newNotes = $state('');

	function handleAddSuggestion(e: Event) {
		e.preventDefault();
		if (!newTitle) return;

		suggestions.push({
			id: Math.max(...suggestions.map((s) => s.id), 0) + 1,
			title: newTitle,
			year: newYear ? parseInt(newYear) : undefined,
			suggestedBy: newSuggestedBy || 'Admin',
			date: new Date().toISOString().split('T')[0],
			status: 'pending',
			source: 'manual'
		});

		newTitle = '';
		newYear = '';
		newSuggestedBy = '';
		newNotes = '';
	}

	function updateStatus(id: number, newStatus: string) {
		const index = suggestions.findIndex((s) => s.id === id);
		if (index !== -1) {
			suggestions[index].status = newStatus;
		}
	}

	function removeSuggestion(id: number) {
		suggestions = suggestions.filter((s) => s.id !== id);
	}
</script>

<PageHeader
	title="The Wheel"
	description="Manage and moderate community movie suggestions from Discord."
/>

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total Suggestions" value={totalSuggestions.toString()} />
	<StatCard
		title="Pending"
		value={pendingCount.toString()}
		trend={pendingCount > 0 ? 'Action Required' : 'All Caught Up'}
		trendUp={pendingCount === 0}
	/>
	<StatCard title="Approved" value={approvedCount.toString()} />
	<StatCard title="Watched" value={watchedCount.toString()} />
</div>

<div class="grid gap-6 lg:grid-cols-3">
	<div class="space-y-6 lg:col-span-2">
		<SectionCard title="Filter & Search">
			<div class="flex flex-col gap-4 sm:flex-row">
				<div class="flex-1">
					<input
						type="text"
						placeholder="Search by title or user..."
						bind:value={searchQuery}
						class="block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					/>
				</div>
				<div class="w-full sm:w-48">
					<select
						bind:value={filterStatus}
						class="block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					>
						<option value="All">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="watched">Watched</option>
						<option value="rejected">Rejected</option>
					</select>
				</div>
			</div>
		</SectionCard>

		<SectionCard title="Suggestion Queue">
			{#if filteredSuggestions.length > 0}
				<DataTable
					columns={['Movie Title', 'Year', 'Suggested By', 'Date', 'Source', 'Status', 'Actions']}
					data={filteredSuggestions}
				>
					{#snippet rowSnippet(row)}
						<td class="px-6 py-4 font-medium whitespace-nowrap text-cyan-400">{row.title}</td>
						<td class="px-6 py-4 whitespace-nowrap text-slate-400">{row.year || '—'}</td>
						<td class="px-6 py-4 whitespace-nowrap text-slate-300">{row.suggestedBy}</td>
						<td class="px-6 py-4 text-xs whitespace-nowrap text-slate-500">{row.date}</td>
						<td
							class="px-6 py-4 text-label font-bold tracking-widest whitespace-nowrap text-slate-400 uppercase"
							>{row.source}</td
						>
						<td class="px-6 py-4 whitespace-nowrap">
							<StatusBadge status={row.status} />
						</td>
						<td class="px-6 py-4 text-right whitespace-nowrap">
							<div class="flex justify-end gap-3">
								{#if row.status !== 'approved'}
									<button
										onclick={() => updateStatus(row.id, 'approved')}
										class="text-label font-bold tracking-wider text-cyan-500 uppercase transition-colors hover:text-cyan-300 hover:drop-shadow-glow-cyan-xl"
										>Approve</button
									>
								{/if}
								{#if row.status !== 'rejected'}
									<button
										onclick={() => updateStatus(row.id, 'rejected')}
										class="text-label font-bold tracking-wider text-rose-500 uppercase transition-colors hover:text-rose-400 hover:drop-shadow-glow-rose-lg"
										>Reject</button
									>
								{/if}
								{#if row.status !== 'watched'}
									<button
										onclick={() => updateStatus(row.id, 'watched')}
										class="text-label font-bold tracking-wider text-emerald-500 uppercase transition-colors hover:text-emerald-400 hover:drop-shadow-glow-emerald-lg"
										>Watched</button
									>
								{/if}
								<button
									class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-cyan-400"
									>Edit</button
								>
								<button
									onclick={() => removeSuggestion(row.id)}
									class="text-label font-bold tracking-wider text-slate-600 uppercase transition-colors hover:text-rose-500"
									>Remove</button
								>
							</div>
						</td>
					{/snippet}
				</DataTable>
			{:else}
				<EmptyState
					title="No suggestions found"
					message={suggestions.length === 0
						? "No movies in the wheel yet... the chaos hasn't begun."
						: 'No suggestions match your current filters.'}
					actionLabel="Clear Filters"
					onAction={() => {
						searchQuery = '';
						filterStatus = 'All';
					}}
				/>
			{/if}
		</SectionCard>
	</div>

	<div class="lg:col-span-1">
		<SectionCard title="Add Suggestion">
			<form class="space-y-4" onsubmit={handleAddSuggestion}>
				<div>
					<label
						for="movieTitle"
						class="label-caps"
						>Movie Title <span class="text-rose-500">*</span></label
					>
					<input
						type="text"
						id="movieTitle"
						placeholder="e.g. Sharknado"
						bind:value={newTitle}
						required
						class="input-dark"
					/>
				</div>
				<div>
					<label
						for="movieYear"
						class="label-caps"
						>Year</label
					>
					<input
						type="number"
						id="movieYear"
						placeholder="e.g. 2013"
						bind:value={newYear}
						class="input-dark"
					/>
				</div>
				<div>
					<label
						for="suggestedBy"
						class="label-caps"
						>Suggested By</label
					>
					<input
						type="text"
						id="suggestedBy"
						placeholder="e.g. DiscordUser123"
						bind:value={newSuggestedBy}
						class="input-dark"
					/>
				</div>
				<div>
					<label
						for="notes"
						class="label-caps"
						>Notes</label
					>
					<textarea
						id="notes"
						rows="2"
						placeholder="Optional context..."
						bind:value={newNotes}
						class="input-dark"
					></textarea>
				</div>
			<button type="submit" class="btn-cyan mt-2 w-full">
					Add to Queue
				</button>
			</form>
		</SectionCard>
	</div>
</div>
