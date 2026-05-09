<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

	let { data } = $props();
</script>

<PageHeader
	title="Reviews & Quotes"
	description="Community-submitted reviews and quotes from the bad movies bot."
/>

<div class="space-y-8">
	<!-- ── Reviews ──────────────────────────────────────────────── -->
	<SectionCard title="Reviews ({data.reviews.length})">
		{#if data.reviews.length === 0}
			<EmptyState title="No reviews yet" message="No community reviews have been submitted." />
		{:else}
			<div class="space-y-4">
				{#each data.reviews as review (review.id)}
					<div class="rounded-none border border-slate-800/60 bg-slate-950/50 p-5">
						<!-- Header row -->
						<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400"
								>
									{review.reviewerName.slice(0, 1).toUpperCase()}
								</div>
								<div>
									<p class="text-sm font-medium text-slate-200">{review.reviewerName}</p>
									<p class="text-xs text-slate-500">
										{review.movieTitle}{review.movieYear ? ` (${review.movieYear})` : ''}
										{#if review.createdAt}
											&mdash; {review.createdAt}
										{/if}
									</p>
								</div>
							</div>
							<StatusBadge status={review.status} />
						</div>

						<!-- Body -->
						<p class="rounded-none border border-slate-800/40 bg-slate-900/60 p-3 text-sm leading-relaxed text-slate-300">
							{review.content}
						</p>

						<!-- Ratings -->
						<div class="mt-3 flex flex-wrap gap-2">
							<span class="inline-flex items-center gap-1 rounded-none border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
								<span class="text-slate-500">Good</span>
								<span class="font-medium text-slate-200">{review.ratingGood}</span>
							</span>
							<span class="inline-flex items-center gap-1 rounded-none border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
								<span class="text-slate-500">Entertainment</span>
								<span class="font-medium text-slate-200">{review.ratingEntertainment}</span>
							</span>
							<span class="inline-flex items-center gap-1 rounded-none border border-fuchsia-500/20 bg-fuchsia-500/5 px-2 py-0.5 text-xs text-slate-400">
								<span class="text-slate-500">So Bad It's Good</span>
								<span class="font-medium text-fuchsia-300">{review.ratingSoBadItsGood}</span>
							</span>
							<span class="inline-flex items-center gap-1 rounded-none border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
								<span class="text-slate-500">Meme Potential</span>
								<span class="font-medium text-slate-200">{review.ratingMemePotential}</span>
							</span>
							<span class="ml-auto inline-flex items-center gap-1 rounded-none border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-xs">
								<span class="text-slate-500">Score</span>
								<span class="font-bold text-cyan-400">{review.weightedScore.toFixed(1)}</span>
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</SectionCard>

	<!-- ── Quotes ───────────────────────────────────────────────── -->
	<SectionCard title="Quotes ({data.quotes.length})">
		{#if data.quotes.length === 0}
			<EmptyState title="No quotes yet" message="No community quotes have been submitted." />
		{:else}
			<div class="space-y-4">
				{#each data.quotes as quote (quote.id)}
					<div class="rounded-none border border-slate-800/60 bg-slate-950/50 p-5">
						<!-- Header row -->
						<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
							<div>
								<p class="text-sm font-medium text-slate-200">
									{quote.movie}{quote.year ? ` (${quote.year})` : ''}
								</p>
								{#if quote.createdAt}
									<p class="text-xs text-slate-500">{quote.createdAt}</p>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								{#if quote.isMemorable}
									<span class="inline-flex items-center gap-1 rounded-none border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
										<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
										Memorable
									</span>
								{/if}
								<StatusBadge status={quote.status} />
							</div>
						</div>

						<!-- Quote text -->
						<blockquote class="border-l-2 border-cyan-500/40 pl-4">
							<p class="text-sm leading-relaxed text-slate-300 italic">"{quote.text}"</p>
						</blockquote>

						<!-- Footer -->
						<div class="mt-3 flex flex-wrap items-center justify-between gap-2">
							<div class="flex flex-wrap gap-3 text-xs text-slate-500">
								{#if quote.character}
									<span>Character: <span class="text-slate-300">{quote.character}</span></span>
								{/if}
								{#if quote.actor}
									<span>Actor: <span class="text-slate-300">{quote.actor}</span></span>
								{/if}
								{#if quote.context}
									<span class="text-slate-600">Context: <span class="text-slate-400">{quote.context}</span></span>
								{/if}
							</div>
							{#if quote.likes > 0}
								<span class="inline-flex items-center gap-1 text-xs text-slate-500">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
									{quote.likes}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</SectionCard>
</div>
