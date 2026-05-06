<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { mockWheelEntries } from '$lib/mock/admin';
</script>

<PageHeader title="Wheel Manager" description="Manage the movies on the random selection wheel." />

<div class="mb-8 grid gap-6 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<SectionCard title="Current Wheel Entries">
			{#if mockWheelEntries.length > 0}
				<DataTable
					columns={['Title', 'Added By', 'Date Added', 'Status', 'Actions']}
					data={mockWheelEntries}
				>
					{#snippet rowSnippet(row)}
						<td class="px-6 py-4 font-medium whitespace-nowrap text-slate-200">{row.title}</td>
						<td class="px-6 py-4 whitespace-nowrap text-slate-400">{row.source}</td>
						<td class="px-6 py-4 whitespace-nowrap text-slate-400">{row.added}</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<StatusBadge status={row.status} />
						</td>
						<td class="px-6 py-4 text-right whitespace-nowrap">
							<button class="text-xs font-medium text-red-400 hover:text-red-300" disabled
								>Remove</button
							>
						</td>
					{/snippet}
				</DataTable>
			{:else}
				<EmptyState
					title="Wheel is Empty"
					message="There are currently no movies on the wheel."
					actionLabel="Add Movie"
				/>
			{/if}
		</SectionCard>
	</div>

	<div class="lg:col-span-1">
		<SectionCard title="Add to Wheel">
			<form class="space-y-4">
				<div>
					<label for="movieTitle" class="block text-sm font-medium text-slate-300"
						>Movie Title</label
					>
					<input
						type="text"
						id="movieTitle"
						placeholder="e.g. Sharknado"
						class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
						disabled
					/>
				</div>
				<button
					class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
					disabled
				>
					Add Movie
				</button>
			</form>
		</SectionCard>
	</div>
</div>
