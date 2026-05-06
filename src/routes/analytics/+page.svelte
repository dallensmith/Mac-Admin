<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<PageHeader title="Analytics" description="Usage statistics and metrics for Mac Bot." />

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total Messages" value="14,203" trend="+12% this week" />
	<StatCard title="Total LLM Tokens" value="2.4M" trend="+5% this week" />
	<StatCard title="Avg. Response Time" value="1.2s" trend="-0.1s this week" />
	<StatCard title="Active Users" value="84" trend="+3 this week" />
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<SectionCard title="Token Usage (Past 7 Days)">
		<!-- Placeholder simple chart using Tailwind divs -->
		<div class="flex h-64 items-end gap-2 border-b border-l border-slate-800 p-4 pb-0 pl-0">
			<div class="flex h-full w-full items-end justify-between pt-4">
				{#each [40, 65, 45, 80, 55, 90, 75] as height, idx (idx)}
					<div
						class="group relative w-1/12 rounded-t-sm border-x border-t border-indigo-500/50 bg-indigo-500/20 transition-all hover:bg-indigo-500/40"
						style="height: {height}%"
					>
						<div
							class="absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
						>
							{height * 1000} tokens
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="mt-2 flex justify-between px-2 text-xs text-slate-500">
			<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span
				>Sat</span
			><span>Sun</span>
		</div>
	</SectionCard>

	<SectionCard title="Command Popularity">
		<div class="space-y-6">
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="text-slate-300">/wheel spin</span>
					<span class="text-slate-500">45%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div class="h-full bg-indigo-500" style="width: 45%"></div>
				</div>
			</div>
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="text-slate-300">/roast</span>
					<span class="text-slate-500">30%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div class="h-full bg-purple-500" style="width: 30%"></div>
				</div>
			</div>
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="text-slate-300">/recommend</span>
					<span class="text-slate-500">15%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div class="h-full bg-emerald-500" style="width: 15%"></div>
				</div>
			</div>
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="text-slate-300">/review</span>
					<span class="text-slate-500">10%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
					<div class="h-full bg-amber-500" style="width: 10%"></div>
				</div>
			</div>
		</div>
	</SectionCard>
</div>
