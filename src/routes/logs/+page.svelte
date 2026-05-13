<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let wheelLogs = $derived(data.wheelLogs as Record<string, unknown>[]);
	let usageLogs = $derived(data.usageLogs as Record<string, unknown>[]);

	let activeTab = $state<'wheel' | 'usage'>('wheel');

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}
</script>

<PageHeader
	title="System Logs"
	description="Recent wheel actions and AI usage logs."
/>

<!-- Tab switcher -->
<div class="mb-6">
	<nav class="flex gap-1 border-b-2 border-slate-700">
		<button
			onclick={() => (activeTab = 'wheel')}
			class="relative px-5 py-3 text-sm font-bold tracking-wider uppercase transition-all duration-300 {activeTab === 'wheel' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}"
		>
			Wheel Actions ({wheelLogs.length})
			{#if activeTab === 'wheel'}
				<div class="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 shadow-glow-cyan-sm"></div>
			{/if}
		</button>
		<button
			onclick={() => (activeTab = 'usage')}
			class="relative px-5 py-3 text-sm font-bold tracking-wider uppercase transition-all duration-300 {activeTab === 'usage' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}"
		>
			AI Usage ({usageLogs.length})
			{#if activeTab === 'usage'}
				<div class="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 shadow-glow-cyan-sm"></div>
			{/if}
		</button>
	</nav>
</div>

{#if activeTab === 'wheel'}
	<SectionCard title="Recent Wheel Actions">
		{#if wheelLogs.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-slate-400">
					<thead class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase">
						<tr>
							<th scope="col" class="px-3 py-3">Time</th>
							<th scope="col" class="px-3 py-3">Action</th>
							<th scope="col" class="px-3 py-3">Movie</th>
							<th scope="col" class="px-3 py-3">User</th>
							<th scope="col" class="px-3 py-3">Details</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/50">
						{#each wheelLogs as log (log.id)}
							{@const l = log as Record<string, unknown>}
							<tr class="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/80 transition-all duration-200">
								<td class="px-3 py-3 font-mono text-xs whitespace-nowrap text-slate-500">{formatDate(l.timestamp as string)}</td>
								<td class="px-3 py-3 whitespace-nowrap"><StatusBadge status={l.action as string} /></td>
								<td class="px-3 py-3 max-w-40 truncate whitespace-nowrap text-slate-300">{l.candidate_title ?? '—'}</td>
								<td class="px-3 py-3 whitespace-nowrap text-slate-400">{l.username ?? l.user_id ?? '—'}</td>
								<td class="px-3 py-3 max-w-48 truncate whitespace-nowrap text-xs text-slate-500">{l.details ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<EmptyState title="No wheel actions" message="Wheel activity will appear here as it occurs." />
		{/if}
	</SectionCard>
{:else}
	<SectionCard title="Recent AI Usage (LLM Calls)">
		{#if usageLogs.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-slate-400">
					<thead class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase">
						<tr>
							<th scope="col" class="px-3 py-3">Time</th>
							<th scope="col" class="px-3 py-3">User</th>
							<th scope="col" class="px-3 py-3">Model</th>
							<th scope="col" class="px-3 py-3">Tokens</th>
							<th scope="col" class="px-3 py-3">Cost</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/50">
						{#each usageLogs as log (log.id)}
							{@const l = log as Record<string, unknown>}
							<tr class="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/80 transition-all duration-200">
								<td class="px-3 py-3 font-mono text-xs whitespace-nowrap text-slate-500">{formatDate(l.created as string)}</td>
								<td class="px-3 py-3 whitespace-nowrap text-slate-300">{l.user_id ?? '—'}</td>
								<td class="px-3 py-3 max-w-56 truncate whitespace-nowrap text-xs text-slate-400">{l.model ?? '—'}</td>
								<td class="px-3 py-3 whitespace-nowrap text-slate-300">{l.tokens ?? '—'}</td>
								<td class="px-3 py-3 whitespace-nowrap font-mono text-xs text-amber-400">${l.cost_usd ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<EmptyState title="No usage data" message="AI usage logs will appear here as the bot makes LLM calls." />
		{/if}
	</SectionCard>
{/if}
