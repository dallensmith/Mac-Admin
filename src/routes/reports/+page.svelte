<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let selectedCategory = $state('all');
	let expandedId = $state<string | null>(null);

	let filteredReports = $derived(
		selectedCategory === 'all'
			? data.reports
			: data.reports.filter((r: Record<string, unknown>) => r.category === selectedCategory)
	);

	let totalReports = $derived(data.reports.length);
	let wrongInfoCount = $derived(data.reports.filter((r: Record<string, unknown>) => r.category === 'wrong_info').length);
	let rudeCount = $derived(data.reports.filter((r: Record<string, unknown>) => r.category === 'rude').length);
	let offTopicCount = $derived(data.reports.filter((r: Record<string, unknown>) => r.category === 'off_topic').length);

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	function formatDate(ms: number): string {
		return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
	}

	function categoryLabel(cat: string): string {
		const map: Record<string, string> = {
			wrong_info: 'Wrong Info',
			rude: 'Rude',
			off_topic: 'Off Topic',
			other: 'Other'
		};
		return map[cat] ?? cat;
	}

	const categories = ['all', 'wrong_info', 'rude', 'off_topic', 'other'];

	const flagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;

	const alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;

	const messageIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

	const otherIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;

	function categoryIcon(cat: string): string {
		const icons: Record<string, string> = {
			wrong_info: alertIcon,
			rude: flagIcon,
			off_topic: messageIcon,
			other: otherIcon
		};
		return icons[cat] ?? otherIcon;
	}
</script>

<PageHeader
	title="User Reports"
	description="Review user-submitted quality reports on bot responses."
/>

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total Reports" value={totalReports.toString()} icon={flagIcon} />
	<StatCard title="Wrong Info" value={wrongInfoCount.toString()} icon={alertIcon} />
	<StatCard title="Rude" value={rudeCount.toString()} icon={flagIcon} />
	<StatCard title="Off Topic" value={offTopicCount.toString()} icon={messageIcon} />
</div>

<SectionCard title="Reported Responses">
	{#snippet headerAction()}
		<div class="flex flex-wrap gap-2">
			{#each categories as cat}
				<button
					onclick={() => (selectedCategory = cat)}
					class="rounded-none border px-3 py-1.5 text-label font-bold tracking-wider uppercase transition-all duration-300 {selectedCategory === cat
						? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-glow-cyan-xs'
						: 'border-slate-700 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'}"
				>
					{cat === 'all' ? 'All' : categoryLabel(cat)}
				</button>
			{/each}
		</div>
	{/snippet}

	{#if filteredReports.length > 0}
		<div class="space-y-3">
			{#each filteredReports as report (report.id)}
				{@const r = report as Record<string, unknown>}
				{@const isExpanded = expandedId === r.id}
				<div
					class="group relative overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/40 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-glow-cyan-sm"
				>
					<!-- Top glow line -->
					<div
						class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
					></div>

					<!-- Row header (always visible) -->
					<button
						onclick={() => toggleExpand(r.id as string)}
						class="flex w-full items-center gap-4 px-6 py-4 text-left"
					>
						<span class="flex shrink-0 items-center text-slate-400 drop-shadow-glow-cyan-soft transition-transform duration-300 group-hover:scale-110">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html categoryIcon(r.category as string)}
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-3">
								<span class="font-medium text-slate-200">{r.reporter_display_name ?? 'Unknown'}</span>
								<StatusBadge status={categoryLabel(r.category as string)} />
							</div>
							<p class="mt-1 truncate text-xs text-slate-500">
								{(r.notes as string)?.slice(0, 100) ?? 'No notes provided'}
							</p>
						</div>
						<div class="shrink-0 text-right text-xs text-slate-500">
							{formatDate(r.created_at as number)}
						</div>
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
							class="lucide lucide-chevron-down shrink-0 text-slate-500 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					<!-- Expanded detail -->
					{#if isExpanded}
						<div class="border-t-2 border-slate-700 bg-slate-950/60 px-6 py-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">Reporter</h4>
									<p class="mt-1 text-sm text-slate-300">{r.reporter_display_name ?? 'Unknown'}</p>
									<p class="text-xs text-slate-500">ID: {r.reporter_user_id ?? '—'}</p>
								</div>
								<div>
									<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">Location</h4>
									<p class="mt-1 text-sm text-slate-300">Channel: {r.channel_id ?? '—'}</p>
									<p class="text-xs text-slate-500">Guild: {r.guild_id ?? '—'}</p>
								</div>
							</div>

							{#if r.notes}
								<div class="mt-4">
									<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">Reporter Notes</h4>
									<div class="mt-1 rounded-none border border-slate-700 bg-slate-950 p-3">
										<p class="text-sm whitespace-pre-wrap text-slate-300">{r.notes as string}</p>
									</div>
								</div>
							{/if}

							<div class="mt-4">
								<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">Bot Response</h4>
								<div class="mt-1 max-h-48 overflow-y-auto rounded-none border border-slate-700 bg-slate-950 p-3">
									<pre class="text-xs whitespace-pre-wrap text-slate-400">{r.bot_response_content ?? '—'}</pre>
								</div>
							</div>

							<div class="mt-4">
								<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">Conversation Context</h4>
								<div class="mt-1 max-h-48 overflow-y-auto rounded-none border border-slate-700 bg-slate-950 p-3">
									<pre class="text-xs whitespace-pre-wrap text-slate-500">{r.conversation_context ?? '—'}</pre>
								</div>
							</div>

							{#if r.reported_message_id}
								<div class="mt-4">
									<a
										href="https://discord.com/channels/{r.guild_id ?? '@me'}/{r.channel_id ?? '0'}/{r.reported_message_id}"
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="lucide lucide-external-link"
										>
											<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
											<polyline points="15 3 21 3 21 9" />
											<line x1="10" y1="14" x2="21" y2="3" />
										</svg>
										Jump to Discord Message
									</a>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<EmptyState
			title={selectedCategory === 'all' ? 'No reports yet' : 'No reports in this category'}
			message={selectedCategory === 'all'
				? 'User-submitted quality reports will appear here when submitted via Discord.'
				: 'Try selecting a different category filter.'}
		/>
	{/if}
</SectionCard>
