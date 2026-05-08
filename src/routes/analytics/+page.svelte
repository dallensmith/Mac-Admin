<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	let { data } = $props();

	const barColors = [
		'bg-indigo-500/70',
		'bg-cyan-500/70',
		'bg-purple-500/70',
		'bg-emerald-500/70',
		'bg-amber-500/70',
		'bg-rose-500/70',
		'bg-fuchsia-500/70'
	];

	function formatTokens(n: number): string {
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
		if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
		return n.toString();
	}

	const maxModelTokens = $derived(
		data.modelBreakdown.length > 0 ? data.modelBreakdown[0].tokens : 1
	);
</script>

<PageHeader title="Analytics" description="Usage statistics and metrics for Mac Bot." />

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total LLM Calls" value={data.totalCalls.toLocaleString()} trend="Last 30 days" />
	<StatCard title="Total LLM Tokens" value={formatTokens(data.totalTokens)} trend="Last 30 days" />
	<StatCard title="Avg. Response Time" value="N/A" />
	<StatCard title="Active Users" value={data.activeUsers.toLocaleString()} trend="Last 30 days" />
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<SectionCard title="Daily API Cost (Past 7 Days)">
		<div class="flex h-64 items-end gap-2 border-b border-l border-slate-800 p-4 pb-0 pl-0">
			<div class="flex h-full w-full items-end justify-between pt-4">
				{#each data.chartBars as bar, idx (bar.date)}
					<div
						class="group relative w-1/12 rounded-t-sm border-x border-t border-indigo-500/50 bg-cyan-500/20 transition-all hover:bg-indigo-500/40"
						style="height: {bar.heightPct}%"
					>
						<div
							class="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
						>
							${bar.cost.toFixed(4)}
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="mt-2 flex justify-between px-2 text-xs text-slate-500">
			{#each data.chartBars as bar (bar.date)}
				<span>{bar.date.slice(5)}</span>
			{/each}
		</div>
		<div class="mt-3 border-t border-slate-800/50 pt-3 text-right">
			<span class="text-xs text-slate-500">30-day total: </span>
			<span class="text-sm font-bold text-cyan-400">${data.totalCost.toFixed(4)}</span>
		</div>
	</SectionCard>

	<SectionCard title="Model Breakdown">
		{#if data.modelBreakdown.length === 0}
			<p class="py-8 text-center text-sm text-slate-500">No usage data for the last 30 days.</p>
		{:else}
			<div class="space-y-5">
				{#each data.modelBreakdown as item, idx (item.model)}
					<div>
						<div class="mb-1 flex justify-between text-sm">
							<span class="truncate text-slate-300" title={item.model}
								>{item.model.split('/').pop()}</span
							>
							<span class="ml-2 shrink-0 text-slate-500">{formatTokens(item.tokens)} tokens</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
							<div
								class="h-full {barColors[idx % barColors.length]}"
								style="width: {Math.round((item.tokens / maxModelTokens) * 100)}%"
							></div>
						</div>
						<div class="mt-0.5 text-right text-xs text-slate-600">
							{item.count} calls · ${item.cost.toFixed(4)}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</SectionCard>
</div>
