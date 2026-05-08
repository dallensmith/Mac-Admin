<script lang="ts">
	export interface WheelEntry {
		id: string;
		title: string;
		year: string;
		tmdbId: string;
		imdbId: string;
		suggestedBy: string;
		voters: string;
		created: string;
		updated: string;
	}

	interface MovieSearchResult {
		tmdbId: number;
		title: string;
		year: string;
		overview: string;
		posterPath: string | null;
	}

	let {
		entry = undefined,
		isEditing = false,
		isNew = false,
		editValues = $bindable<Record<string, string>>({}),
		saveFormId,
		onEdit,
		onDelete,
		onCancel
	}: {
		entry?: WheelEntry;
		isEditing?: boolean;
		isNew?: boolean;
		editValues?: Record<string, string>;
		saveFormId: string;
		onEdit?: () => void;
		onDelete?: () => void;
		onCancel?: () => void;
	} = $props();

	// ── Search state ────────────────────────────────────────────────────────────
	let searchResults = $state<MovieSearchResult[]>([]);
	let isSearching = $state(false);
	let showDropdown = $state(false);
	let justSelected = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let titleInputEl = $state<HTMLInputElement | null>(null);
	let dropdownEl = $state<HTMLDivElement | null>(null);

	let inEditMode = $derived(isEditing || isNew);

	// Debounced watch on title
	$effect(() => {
		const title = editValues.title ?? '';

		if (justSelected) {
			justSelected = false;
			return;
		}

		if (debounceTimer) clearTimeout(debounceTimer);

		if (title.trim().length < 2) {
			searchResults = [];
			showDropdown = false;
			return;
		}

		debounceTimer = setTimeout(() => triggerSearch(title), 400);

		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	// Close on outside click
	$effect(() => {
		if (!showDropdown) return;

		function handleClickOutside(e: MouseEvent) {
			const target = e.target as Node;
			if (
				titleInputEl && !titleInputEl.contains(target) &&
				dropdownEl && !dropdownEl.contains(target)
			) {
				showDropdown = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	});

	async function triggerSearch(query?: string) {
		const q = (query ?? editValues.title ?? '').trim();
		if (q.length < 2) return;

		isSearching = true;
		showDropdown = true;

		try {
			const res = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				searchResults = await res.json();
			}
		} finally {
			isSearching = false;
		}
	}

	async function selectResult(result: MovieSearchResult) {
		justSelected = true;
		editValues.title = result.title;
		editValues.year = result.year;
		editValues.tmdbId = String(result.tmdbId);
		showDropdown = false;
		searchResults = [];

		// Fetch IMDb ID
		try {
			const res = await fetch(`/api/movies/${result.tmdbId}`);
			if (res.ok) {
				const data = await res.json();
				editValues.imdbId = data.imdbId ?? '';
			}
		} catch {
			// Non-fatal — user can fill manually
		}
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showDropdown = false;
		}
	}

	// ── Display helpers ─────────────────────────────────────────────────────────
	function voterCount(voters: string): number {
		return voters ? voters.split(',').filter(Boolean).length : 0;
	}

	function voterTooltip(voters: string): string {
		return voters ? voters.split(',').filter(Boolean).join(', ') : '';
	}

	const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';
</script>

{#if inEditMode}
	<!-- Edit / Ghost card -->
	<div
		class="group relative flex flex-col overflow-hidden rounded-none border-2 bg-slate-900/80 shadow-card backdrop-blur-md transition-all duration-300
		{isNew
			? 'border-dashed border-cyan-500/40 hover:border-cyan-500/60'
			: 'border-slate-700 hover:border-cyan-500/50 hover:shadow-card-hover'}"
	>
		<!-- Top glow line -->
		<div
			class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
		></div>

		<div class="flex flex-1 flex-col gap-3 p-4">
			{#if isNew}
				<p class="label-caps text-cyan-500/70">New Entry</p>
			{:else}
				<p class="label-caps text-slate-500">Editing</p>
			{/if}

			<!-- Title row with search button + dropdown -->
			<div class="relative">
				<div class="flex gap-1.5">
					<input
						bind:this={titleInputEl}
						type="text"
						placeholder="Title *"
						bind:value={editValues.title}
						onkeydown={handleTitleKeydown}
						class="input-dark flex-1"
						autocomplete="off"
					/>
					<button
						type="button"
						onclick={() => triggerSearch()}
						title="Search TMDb"
						class="flex shrink-0 items-center justify-center rounded-none border border-slate-700 bg-slate-800/60 px-2 text-slate-400 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
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
							class="lucide lucide-search"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
						</svg>
					</button>
				</div>

				<!-- Search dropdown -->
				{#if showDropdown}
					<div
						bind:this={dropdownEl}
						class="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-none border border-slate-700 bg-slate-900 shadow-card"
					>
						{#if isSearching}
							<div class="flex items-center gap-2 px-3 py-3 text-ui text-slate-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="lucide lucide-loader-2 animate-spin"
								>
									<path d="M21 12a9 9 0 1 1-6.219-8.56" />
								</svg>
								Searching…
							</div>
						{:else if searchResults.length === 0}
							<div class="px-3 py-3 text-ui text-slate-500">No results found</div>
						{:else}
							<ul class="max-h-80 overflow-y-auto">
								{#each searchResults as result (result.tmdbId)}
									<li>
										<button
											type="button"
											onclick={() => selectResult(result)}
											class="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-800/60 hover:shadow-inset-accent"
										>
											<!-- Poster thumbnail -->
											<div
												class="shrink-0 overflow-hidden border border-slate-700 bg-slate-800"
												style="width:40px;height:60px;"
											>
												{#if result.posterPath}
													<img
														src="{TMDB_IMAGE_BASE}{result.posterPath}"
														alt={result.title}
														width="40"
														height="60"
														class="h-full w-full object-cover"
														loading="lazy"
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center">
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
															class="lucide lucide-film text-slate-600"
														>
															<rect width="18" height="18" x="3" y="3" rx="2" />
															<path d="M7 3v18" />
															<path d="M3 7.5h4" />
															<path d="M3 12h18" />
															<path d="M3 16.5h4" />
															<path d="M17 3v18" />
															<path d="M17 7.5h4" />
															<path d="M17 16.5h4" />
														</svg>
													</div>
												{/if}
											</div>

											<!-- Text info -->
											<div class="min-w-0 flex-1">
												<div class="flex items-baseline gap-2">
													<span class="truncate text-sm font-medium text-slate-200">{result.title}</span>
													{#if result.year}
														<span class="shrink-0 font-mono text-ui text-slate-500">{result.year}</span>
													{/if}
												</div>
												{#if result.overview}
													<p class="mt-0.5 line-clamp-2 text-ui text-slate-500">{result.overview}</p>
												{/if}
											</div>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Year"
					bind:value={editValues.year}
					class="input-dark w-24"
				/>
				<input
					type="text"
					placeholder="Suggested by"
					bind:value={editValues.suggestedBy}
					class="input-dark flex-1"
				/>
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="TMDb ID"
					bind:value={editValues.tmdbId}
					class="input-dark flex-1"
				/>
				<input
					type="text"
					placeholder="IMDb ID"
					bind:value={editValues.imdbId}
					class="input-dark flex-1"
				/>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 border-t border-slate-800/60 px-4 py-3">
			<button
				type="submit"
				form={saveFormId}
				disabled={!editValues.title?.trim()}
				class="text-label font-bold tracking-wider uppercase text-cyan-500 transition-colors hover:text-cyan-300 hover:drop-shadow-glow-cyan-xl disabled:cursor-not-allowed disabled:opacity-40"
			>
				Save
			</button>
			<button
				onclick={onCancel}
				class="text-label font-bold tracking-wider uppercase text-slate-400 transition-colors hover:text-slate-200"
			>
				Cancel
			</button>
		</div>
	</div>
{:else if entry}
	<!-- Display card -->
	<div
		class="group relative flex flex-col overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-card-hover"
	>
		<!-- Top glow line -->
		<div
			class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
		></div>

		<div class="flex flex-1 flex-col gap-2 p-4">
			<!-- Title + year badge -->
			<div class="flex items-start justify-between gap-2">
				<h3 class="text-base font-semibold leading-snug text-cyan-400 group-hover:text-cyan-300">
					{entry.title}
				</h3>
				{#if entry.year}
					<span
						class="mt-0.5 shrink-0 rounded-none border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-ui text-slate-400"
					>
						{entry.year}
					</span>
				{/if}
			</div>

			<!-- Suggested by -->
			<p class="text-ui text-slate-400">
				<span class="label-caps mr-1 text-slate-600">By</span>
				{entry.suggestedBy || '—'}
			</p>

			<!-- Votes -->
			<div class="flex items-center gap-1.5">
				{#if voterCount(entry.voters) > 0}
					<!-- Fuchsia vote pill with tooltip -->
					<span
						title={voterTooltip(entry.voters)}
						class="cursor-default rounded-none border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-ui font-medium text-fuchsia-400"
					>
						{voterCount(entry.voters)}
						{voterCount(entry.voters) === 1 ? 'vote' : 'votes'}
					</span>
				{:else}
					<span class="text-ui text-slate-600">No votes yet</span>
				{/if}
			</div>

			<!-- External links -->
			<div class="mt-auto flex flex-wrap gap-2 pt-2">
				{#if entry.tmdbId}
					<a
						href="https://www.themoviedb.org/movie/{entry.tmdbId}"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-none border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-ui text-cyan-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
					>
						TMDb ↗
					</a>
				{/if}
				{#if entry.imdbId}
					<a
						href="https://www.imdb.com/title/{entry.imdbId}"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-none border border-slate-700 bg-slate-800/40 px-2 py-0.5 font-mono text-ui text-cyan-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
					>
						IMDb ↗
					</a>
				{/if}
			</div>
		</div>

		<!-- Footer: date + actions -->
		<div
			class="flex items-center justify-between border-t border-slate-800/60 px-4 py-2.5 transition-colors duration-300 group-hover:border-cyan-500/10"
		>
			<span class="text-ui text-slate-600">
				{entry.created ? entry.created.split('T')[0] : '—'}
			</span>
			<div class="flex gap-3">
				<button
					onclick={onEdit}
					class="text-label font-bold tracking-wider uppercase text-slate-400 transition-colors hover:text-cyan-400"
				>
					Edit
				</button>
				<button
					onclick={onDelete}
					class="text-label font-bold tracking-wider uppercase text-slate-600 transition-colors hover:text-rose-500"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
