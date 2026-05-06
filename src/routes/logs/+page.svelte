<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<PageHeader title="System Logs" description="Real-time bot logs and system events." />

<SectionCard title="Log Stream">
	{#snippet headerAction()}
		<div class="flex gap-2">
			<button
				class="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-white ring-1 ring-slate-700 ring-inset"
				disabled>All</button
			>
			<button
				class="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800"
				disabled>Info</button
			>
			<button
				class="rounded-md bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 hover:bg-amber-500/20"
				disabled>Warn</button
			>
			<button
				class="rounded-md bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
				disabled>Error</button
			>
			<button
				class="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800"
				disabled>Debug</button
			>
		</div>
	{/snippet}

	<div
		class="flex h-[60vh] flex-col-reverse overflow-y-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-xs"
	>
		<div class="space-y-2">
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 14:32:01]</span>
				<span class="text-emerald-400">[INFO]</span> Connected to Discord gateway.
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 14:32:05]</span>
				<span class="text-emerald-400">[INFO]</span> Registered 12 slash commands.
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 14:45:12]</span>
				<span class="text-slate-500">[DEBUG]</span> Rate limit headers received. Remaining: 49.
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 15:02:33]</span>
				<span class="text-emerald-400">[INFO]</span> Received command /wheel spin from User(ID:1234).
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 15:02:35]</span>
				<span class="text-emerald-400">[INFO]</span> Generated response via OpenRouter (Gemini Pro). Latency:
				1.2s.
			</div>
			<div class="text-amber-400">
				<span class="text-slate-500">[2026-05-05 16:15:00]</span>
				<span class="text-amber-500">[WARN]</span> Approaching daily budget limit (85%).
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 16:18:22]</span>
				<span class="text-red-400">[ERROR]</span> Failed to fetch movie details from TMDb. Timeout.
			</div>
			<div class="text-slate-400">
				<span class="text-slate-500">[2026-05-05 16:18:23]</span>
				<span class="text-emerald-400">[INFO]</span> Falling back to OMDb. Success.
			</div>
		</div>
	</div>
</SectionCard>
