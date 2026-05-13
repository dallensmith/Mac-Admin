<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let selectedAction = $state('all');
	let showSuccessOnly = $state(false);

	let filteredLogs = $derived.by(() => {
		let logs = data.logs as Record<string, unknown>[];
		if (selectedAction !== 'all') {
			logs = logs.filter((l) => l.action === selectedAction);
		}
		if (showSuccessOnly) {
			logs = logs.filter((l) => l.success === true);
		}
		return logs;
	});

	let actionTypes = $derived([...new Set((data.logs as Record<string, unknown>[]).map((l) => l.action as string))]);

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}

	const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`;
</script>

<PageHeader
	title="Wheel Audit Log"
	description="Track every wheel action — adds, removes, votes, spins, and backups."
/>

<SectionCard title="Action History">
	{#snippet headerAction()}
		<div class="flex flex-wrap items-center gap-3">
			<select
				bind:value={selectedAction}
				class="rounded border border-slate-800/80 bg-slate-950/50 px-3 py-1.5 text-xs text-slate-200 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
			>
				<option value="all">All Actions</option>
				{#each actionTypes as action (action)}
					<option value={action}>{action}</option>
				{/each}
			</select>
			<label class="flex items-center gap-2 text-xs text-slate-400">
				<input
					type="checkbox"
					bind:checked={showSuccessOnly}
					class="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/50"
				/>
				Successful only
			</label>
			<span class="text-xs text-slate-500">
				{filteredLogs.length} of {data.logs.length} entries
			</span>
		</div>
	{/snippet}

	{#if filteredLogs.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-400">
				<thead
					class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase"
				>
					<tr>
						<th scope="col" class="px-4 py-3">Timestamp</th>
						<th scope="col" class="px-4 py-3">Action</th>
						<th scope="col" class="px-4 py-3">Movie</th>
						<th scope="col" class="px-4 py-3">User</th>
						<th scope="col" class="px-4 py-3">Status</th>
						<th scope="col" class="px-4 py-3">Details</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/50">
					{#each filteredLogs as log (log.id)}
						{@const l = log as Record<string, unknown>}
						<tr
							class="border-b border-slate-700/50 transition-all duration-200 last:border-0 hover:bg-slate-800/80"
						>
							<td class="px-4 py-3 font-mono text-xs whitespace-nowrap text-slate-500">
								{formatDate(l.timestamp as string)}
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								<StatusBadge status={l.action as string} />
							</td>
							<td class="px-4 py-3 max-w-48 truncate whitespace-nowrap text-slate-300">
								{l.candidate_title as string ?? '—'}
								{#if l.candidate_year}
									<span class="text-slate-500"> ({l.candidate_year})</span>
								{/if}
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-slate-400">
								{l.username ?? l.user_id ?? '—'}
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								{#if l.success === true}
									<span class="text-label font-bold tracking-wider text-emerald-400 uppercase">OK</span>
								{:else if l.success === false}
									<span class="text-label font-bold tracking-wider text-rose-400 uppercase">FAIL</span>
								{:else}
									<span class="text-slate-500">—</span>
								{/if}
							</td>
							<td class="px-4 py-3 max-w-64 truncate whitespace-nowrap text-xs text-slate-500">
								{l.details ?? '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<EmptyState
			title="No matching log entries"
			message="Try adjusting your filters or check back after wheel actions occur."
		/>
	{/if}
</SectionCard>
