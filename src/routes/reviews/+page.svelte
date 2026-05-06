<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
</script>

<PageHeader
	title="Review Queue"
	description="Approve or reject community movie reviews submitted to the bot."
/>

<div class="space-y-6">
	<!-- Placeholder Review Card -->
	{#each [1, 2, 3] as i (i)}
		<div
			class="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm sm:flex-row"
		>
			<div class="flex-1 p-6">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400"
					>
						U{i + 1}
					</div>
					<div>
						<p class="text-sm font-medium text-slate-200">Discord User {100 + i}</p>
						<p class="text-xs text-slate-500">Submitted 2 hours ago</p>
					</div>
				</div>
				<h4 class="mb-2 text-lg font-medium text-slate-200">Review for "Movie Name {i + 1}"</h4>
				<p class="rounded border border-slate-800/50 bg-slate-950 p-3 text-sm text-slate-400">
					This movie was absolutely terrible. The acting was wooden, the plot made no sense, and the
					special effects looked like they were made in MS Paint. I loved it.
				</p>
				<div class="mt-4 flex items-center gap-2">
					<span class="text-xs text-slate-500">Rating given:</span>
					<div class="flex">
						{#each [1, 2, 3, 4, 5] as starIndex (starIndex)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill={starIndex < 4 ? 'currentColor' : 'none'}
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-amber-400"
								><polygon
									points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
								/></svg
							>
						{/each}
					</div>
				</div>
			</div>
			<div
				class="flex w-full justify-center gap-3 border-t border-slate-800 bg-slate-950 p-6 sm:w-48 sm:flex-col sm:border-t-0 sm:border-l"
			>
				<button
					class="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
					disabled
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
					>
					Approve
				</button>
				<button
					class="flex w-full items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
					disabled
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
					>
					Reject
				</button>
			</div>
		</div>
	{/each}

	<div class="mt-8 border-t border-slate-800/50 pt-8">
		<EmptyState title="All caught up!" message="There are no more reviews waiting in the queue." />
	</div>
</div>
