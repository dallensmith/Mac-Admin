<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	interface SearchResult {
		tmdbId: number;
		title: string;
		year: string;
		overview: string;
		posterPath: string | null;
	}

	interface MovieDetail {
		tmdbId: number;
		title: string;
		year: string;
		overview: string;
		posterPath: string | null;
		imdbId: string | null;
		watched: boolean;
	}

	let searchQuery = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let selectedMovie = $state<MovieDetail | null>(null);
	let detailLoading = $state(false);
	let errorMessage = $state('');

	let hasSearched = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function doSearch() {
		if (!searchQuery.trim()) {
			results = [];
			hasSearched = false;
			return;
		}

		loading = true;
		errorMessage = '';
		hasSearched = true;
		selectedMovie = null;

		fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery.trim())}`)
			.then((res) => {
				if (!res.ok) throw new Error('Search failed');
				return res.json();
			})
			.then((data: SearchResult[]) => {
				results = data;
				loading = false;
			})
			.catch((e) => {
				errorMessage = e.message;
				loading = false;
				results = [];
			});
	}

	function onInput(e: Event) {
		searchQuery = (e.currentTarget as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(doSearch, 400);
	}

	function selectMovie(tmdbId: number) {
		detailLoading = true;
		selectedMovie = null;
		fetch(`/api/movies/${tmdbId}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load movie details');
				return res.json();
			})
			.then((data: MovieDetail) => {
				selectedMovie = data;
				detailLoading = false;
			})
			.catch((e) => {
				errorMessage = e.message;
				detailLoading = false;
			});
	}

	function posterUrl(path: string | null): string | null {
		return path ? `https://image.tmdb.org/t/p/w342${path}` : null;
	}
</script>

<PageHeader
	title="Movies Database"
	description="Search TMDb for movie details and check BadMovies.co archive status."
/>

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
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
		</div>
		<input
			type="text"
			placeholder="Search for a movie..."
			bind:value={searchQuery}
			oninput={onInput}
			class="input-dark block w-full rounded-none border-2 border-slate-700 bg-slate-900/80 py-2.5 pr-3 pl-10 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none sm:text-sm"
		/>
	</div>
</div>

{#if errorMessage}
	<div class="mb-6 border-2 border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
		{errorMessage}
	</div>
{/if}

{#if loading}
	<div class="flex items-center justify-center py-12">
		<div class="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400"></div>
		<span class="ml-3 text-sm text-slate-400">Searching...</span>
	</div>
{:else if hasSearched && results.length === 0}
	<EmptyState
		title="No movies found"
		message="Try a different search term or check your spelling."
	/>
{:else if results.length > 0}
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each results as movie (movie.tmdbId)}
			<button
				onclick={() => selectMovie(movie.tmdbId)}
				class="group relative flex flex-col overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 text-left shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-card-hover {selectedMovie?.tmdbId === movie.tmdbId ? 'border-cyan-500/50 shadow-glow-cyan-sm' : ''}"
			>
				<div
					class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
				></div>
				<div class="relative aspect-[2/3] bg-slate-800">
					{#if movie.posterPath}
						<img
							src={posterUrl(movie.posterPath)}
							alt={movie.title}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center text-slate-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-film"
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
				<div class="flex flex-1 flex-col p-4">
					<h3 class="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{movie.title}</h3>
					<p class="mt-1 text-xs text-slate-500">{movie.year || 'Unknown year'}</p>
					{#if movie.overview}
						<p class="mt-2 line-clamp-3 text-xs text-slate-500">{movie.overview}</p>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- Selected movie detail -->
	{#if detailLoading}
		<div class="mt-6 flex items-center justify-center py-6">
			<div class="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400"></div>
			<span class="ml-3 text-sm text-slate-400">Loading details...</span>
		</div>
	{/if}

	{#if selectedMovie}
		<div class="mt-8 border-t-2 border-slate-700 pt-8">
			<div class="group relative overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 shadow-card backdrop-blur-md">
				<div
					class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent"
				></div>
				<div class="flex flex-col gap-6 p-6 sm:flex-row">
					<div class="w-full shrink-0 sm:w-48">
						<div class="aspect-[2/3] overflow-hidden rounded-none border border-slate-700 bg-slate-800">
							{#if selectedMovie.posterPath}
								<img
									src={posterUrl(selectedMovie.posterPath)}
									alt={selectedMovie.title}
									class="h-full w-full object-cover"
								/>
							{:else}
								<div class="flex h-full items-center justify-center text-slate-600">
									<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
								</div>
							{/if}
						</div>
					</div>
					<div class="flex-1">
						<div class="flex flex-wrap items-center gap-3">
							<h2 class="text-xl font-black tracking-wider text-slate-100 uppercase">{selectedMovie.title}</h2>
							<span class="text-sm text-slate-500">{selectedMovie.year}</span>
						</div>
						<div class="mt-3 flex flex-wrap gap-3">
							<span class="text-label font-bold tracking-wider text-slate-400 uppercase">
								TMDb ID: <span class="text-cyan-400">{selectedMovie.tmdbId}</span>
							</span>
							{#if selectedMovie.imdbId}
								<span class="text-label font-bold tracking-wider text-slate-400 uppercase">
									IMDb: <span class="text-amber-400">{selectedMovie.imdbId}</span>
								</span>
							{/if}
							<span
								class="inline-flex items-center rounded-none border px-2 py-0.5 text-label font-bold tracking-wider uppercase {selectedMovie.watched
									? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
									: 'border-slate-500/30 bg-slate-500/10 text-slate-400'}"
							>
								{selectedMovie.watched ? 'In Archive' : 'Not Watched'}
							</span>
						</div>
						{#if selectedMovie.overview}
							<p class="mt-4 text-sm leading-relaxed text-slate-400">{selectedMovie.overview}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
