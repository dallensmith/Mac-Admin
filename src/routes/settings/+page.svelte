<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let pbHealth = $derived(data.pbHealth as string);
	let cacheStats = $derived(data.cacheStats as { movies: number | null; experiments: number | null; people: number | null });
</script>

<PageHeader
	title="System Settings"
	description="Environment status, cache health, and deployment info."
/>

<div class="max-w-4xl space-y-6">
	<SectionCard title="Service Health">
		<div class="space-y-4">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">PocketBase Connection</p>
					<p class="text-xs text-slate-500">Admin panel + Bot backend database</p>
				</div>
				{#if pbHealth === 'Connected'}
					<span class="inline-flex items-center rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-label font-bold tracking-wider text-emerald-400 uppercase shadow-glow-cyan-xs">Connected</span>
				{:else}
					<span class="inline-flex items-center rounded-none border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-label font-bold tracking-wider text-rose-400 uppercase">Disconnected</span>
				{/if}
			</div>
		</div>
	</SectionCard>

	<SectionCard title="Search Cache Health">
		<div class="space-y-4">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Movies Cache</p>
					<p class="text-xs text-slate-500">Fuse.js fuzzy search index for movies</p>
				</div>
				<span class="text-sm font-mono text-cyan-400">{cacheStats.movies !== null ? `${cacheStats.movies} records` : '—'}</span>
			</div>
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Experiments Cache</p>
					<p class="text-xs text-slate-500">Fuse.js search index for screening events</p>
				</div>
				<span class="text-sm font-mono text-cyan-400">{cacheStats.experiments !== null ? `${cacheStats.experiments} records` : '—'}</span>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-200">People Cache</p>
					<p class="text-xs text-slate-500">Fuse.js search index for directors/actors</p>
				</div>
				<span class="text-sm font-mono text-cyan-400">{cacheStats.people !== null ? `${cacheStats.people} records` : '—'}</span>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="API Integrations">
		<div class="space-y-4">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Discord Bot Token</p>
					<p class="text-xs text-slate-500">Used for communicating with the Discord API.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Discord OAuth (PocketBase)</p>
					<p class="text-xs text-slate-500">Used for admin Discord login.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-200">OpenRouter API Key</p>
					<p class="text-xs text-slate-500">Used for LLM inference.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
		</div>
	</SectionCard>
</div>
