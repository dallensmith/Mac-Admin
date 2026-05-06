<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
</script>

<PageHeader title="Movies Database" description="Search and manage movies known to the bot." />

<div class="mb-6">
	<div class="relative max-w-xl">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-search text-slate-500"
				><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
			>
		</div>
		<input
			type="text"
			placeholder="Search for a movie..."
			class="block w-full rounded-md border-0 bg-slate-900 py-2.5 pr-3 pl-10 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
			disabled
		/>
	</div>
</div>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	<!-- Placeholder Cards -->
	{#each [1, 2, 3, 4] as i (i)}
		<div
			class="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700"
		>
			<div class="relative h-48 bg-slate-800">
				<!-- Placeholder image area -->
				<div class="absolute top-2 right-2 flex gap-1">
					{#if i % 2 === 0}
						<span
							class="rounded border border-indigo-500/20 bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400"
							>BadMovies.co</span
						>
					{:else}
						<span
							class="rounded border border-emerald-500/20 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"
							>TMDb</span
						>
						<span
							class="rounded border border-amber-500/20 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"
							>OMDb</span
						>
					{/if}
				</div>
			</div>
			<div class="flex flex-1 flex-col p-4">
				<h3 class="font-medium text-slate-200">Placeholder Movie {i + 1}</h3>
				<p class="mt-1 text-xs text-slate-500">202{i} • Action, Comedy</p>
				<div class="mt-auto flex items-center justify-between pt-4">
					<span class="text-xs font-medium text-slate-400">Rating: 4.2/10</span>
					<button class="text-xs font-medium text-indigo-400 hover:text-indigo-300" disabled
						>Details</button
					>
				</div>
			</div>
		</div>
	{/each}
</div>

<div class="mt-12 border-t border-slate-800/50 pt-12">
	<EmptyState
		title="No more results"
		message="Try adjusting your search filters to find more movies."
	/>
</div>
