<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let events = $derived(data.events as Record<string, unknown>[]);

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}
</script>

<PageHeader
	title="Announced Events"
	description="Deduplication log for Discord scheduled event announcements."
/>

<SectionCard title="Announced Events ({events.length})">
	{#if events.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-400">
				<thead
					class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase"
				>
					<tr>
						<th scope="col" class="px-4 py-3">Event Name</th>
						<th scope="col" class="px-4 py-3">Event ID</th>
						<th scope="col" class="px-4 py-3">Announced At</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/50">
					{#each events as event (event.id)}
						{@const e = event as Record<string, unknown>}
						<tr
							class="border-b border-slate-700/50 transition-all duration-200 last:border-0 hover:bg-slate-800/80"
						>
							<td class="px-4 py-3 font-medium whitespace-nowrap text-slate-200">
								{e.event_name ?? '—'}
							</td>
							<td class="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500">
								{e.event_id ?? '—'}
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
								{formatDate(e.announced_at as string)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<EmptyState
			title="No announced events"
			message="Event announcements will appear here as the monitor service posts them."
		/>
	{/if}
</SectionCard>
