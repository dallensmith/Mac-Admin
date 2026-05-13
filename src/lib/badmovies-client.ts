import { FetchClient } from './fetch-client.js';
import { CacheManager } from './cache-manager.js';
import { Config } from '../bootstrap/validator.js';
import { NormalizedMovie, NormalizedExperiment, NormalizedStats } from './models/movie.js';
import { logger } from '../utils/logger.js';

export class BadMoviesClient {
	constructor(
		private readonly fetch: FetchClient,
		private readonly cache: CacheManager,
		private readonly config: Config
	) {}

	public async getMovie(idOrSlug: string): Promise<NormalizedMovie | null> {
		const cacheKey = `badmovies:movie:${idOrSlug}`;
		const cached = this.cache.get<NormalizedMovie>(cacheKey);
		if (cached) return cached;

		try {
			const data = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/movies/${idOrSlug}`
			);
			if (!data) throw new Error(`Movie not found: ${idOrSlug}`);

			const rawPoster = data.posterPath as string | undefined;
			const movie: NormalizedMovie = {
				title: (data.title as string | undefined) ?? 'Unknown',
				year: typeof data.releaseDate === 'string' ? data.releaseDate.split('-')[0] : 'Unknown',
				description: (data.overview as string) || '',
				url: `https://badmovies.co/movies/${data.slug as string}`,
				slug: data.slug as string | undefined,
				posterUrl: rawPoster?.startsWith('/') ? `https://badmovies.co${rawPoster}` : rawPoster,
				rating:
					(data.voteAverage as string | undefined) ||
					(data.imdbRating as string | undefined) ||
					'N/A',
				source: 'badmovies' as const
			};
			this.cache.set(cacheKey, movie);
			return movie;
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getMovie failed for "${idOrSlug}": ${error instanceof Error ? error.message : String(error)}`
			);
			return null;
		}
	}

	public async getExperiments(): Promise<NormalizedExperiment[]> {
		const cacheKey = 'badmovies:experiments';
		const cached = this.cache.get<NormalizedExperiment[]>(cacheKey);
		if (cached) return cached;

		try {
			const response = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/experiments`
			);

			// Handle Wrapped Response: { "experiments": [...] }
			if (!response || !Array.isArray(response.experiments)) {
				throw new Error('Malformed experiments response: expected "experiments" array at root');
			}

			const experiments = (response.experiments as unknown[]).map((item) =>
				this.mapExperiment(item)
			);

			this.cache.set(cacheKey, experiments, 600); // 10 min cache
			return experiments;
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getExperiments failed: ${error instanceof Error ? error.message : String(error)}`
			);
			return [];
		}
	}

	public async getExperiment(slug: string): Promise<NormalizedExperiment | null> {
		const cacheKey = `badmovies:experiment:${slug}`;
		const cached = this.cache.get<NormalizedExperiment>(cacheKey);
		if (cached) return cached;

		try {
			const response = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/experiments/${slug}`
			);
			if (!response?.experiment) return null;

			const experiment = this.mapExperiment(response.experiment);
			this.cache.set(cacheKey, experiment, 3600);
			return experiment;
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getExperiment failed for "${slug}": ${error instanceof Error ? error.message : String(error)}`
			);
			return null;
		}
	}

	private mapExperiment(item: unknown): NormalizedExperiment {
		const d = item as Record<string, unknown>;
		let bannerUrl = (d.bannerPath || d.image || d.event_image) as string | undefined;
		if (bannerUrl?.startsWith('/')) {
			bannerUrl = `https://badmovies.co${bannerUrl}`;
		}

		const movies = Array.isArray(d.movies)
			? d.movies.map((m: unknown) => {
					const mv = m as Record<string, unknown>;
					const rawPoster = (mv.posterUrl ?? mv.poster_url ?? mv.posterPath ?? mv.poster_path) as
						| string
						| undefined;
					const posterUrl = rawPoster?.startsWith('/')
						? `https://badmovies.co${rawPoster}`
						: rawPoster;
					return {
						id:
							mv.id?.toString() ??
							mv.Id?.toString() ??
							(mv.slug as string | undefined) ??
							(mv.title as string | undefined) ??
							'',
						title: (mv.title ?? m) as string,
						year: mv.year?.toString() ?? mv.releaseYear?.toString() ?? undefined,
						posterUrl
					};
				})
			: ((d.movieTitles ?? d.lineup ?? []) as string[]).map((t: string) => ({ id: t, title: t }));

		if (movies.length === 0 && !Array.isArray(d.movies) && !d.movieTitles && !d.lineup) {
			logger.warn(
				`[BadMoviesClient] mapExperiment: no movies, movieTitles, or lineup found on item — name: ${String(d.title ?? d.name ?? '(unknown)')}`
			);
		}

		const slug = d.slug as string | undefined;
		const expUrl = slug ? `https://badmovies.co/${slug}` : undefined;

		return {
			name: (d.title || d.name || `Experiment #${d.experimentNumber}`) as string,
			date: (d.date || 'Unknown Date') as string,
			result: (d.result ||
				`${String(d.movieCount ?? (Array.isArray(d.movies) ? d.movies.length : 0))} movies recorded`) as string,
			notes: (d.notes || `Hosted by ${String(d.hostName ?? 'the community')}`) as string,
			movies,
			bannerUrl,
			host: (d.hostName || d.host || undefined) as string | undefined,
			url: expUrl
		};
	}

	public async getStats(): Promise<NormalizedStats | null> {
		const cacheKey = 'badmovies:stats';
		const cached = this.cache.get<NormalizedStats>(cacheKey);
		if (cached) return cached;

		try {
			const response = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/stats/summary`
			);

			// Handle Wrapped Response: { "overview": {...} }
			if (!response?.overview) {
				throw new Error('Malformed stats response: expected "overview" object');
			}

			const overview = response.overview as Record<string, unknown>;
			const stats: NormalizedStats = {
				totalMovies: (overview.totalMovies as number) || 0,
				lastParty: '',
				avgRating: 0 // Not currently provided by the summary stats API
			};

			// Derive lastParty from latest experiment date as fallback
			const experiments = await this.getExperiments();
			if (experiments.length > 0) {
				const sorted = [...experiments].sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
				);
				stats.lastParty = sorted[0].date;
			}

			this.cache.set(cacheKey, stats, 1800); // 30 min cache
			return stats;
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getStats failed: ${error instanceof Error ? error.message : String(error)}`
			);
			return null;
		}
	}

	public async globalSearch(
		query: string
	): Promise<{ movies: NormalizedMovie[]; experiments: NormalizedExperiment[] }> {
		const cacheKey = this.cache.generateKey('badmovies:globalsearch', { query });
		const cached = this.cache.get<{
			movies: NormalizedMovie[];
			experiments: NormalizedExperiment[];
		}>(cacheKey);
		if (cached) return cached;

		try {
			// API search for movies and experiments separately as no combined endpoint exists
			const [movieRes, expRes] = await Promise.all([
				this.fetch.request<Record<string, unknown>>(
					`${this.config.api.badMoviesBaseUrl}/movies?search=${encodeURIComponent(query)}`
				),
				this.fetch.request<Record<string, unknown>>(
					`${this.config.api.badMoviesBaseUrl}/experiments?search=${encodeURIComponent(query)}`
				)
			]);

			const movies = Array.isArray(movieRes?.movies)
				? (movieRes.movies as unknown[]).map((item) => this.mapMovie(item))
				: [];

			const experiments = Array.isArray(expRes?.experiments)
				? (expRes.experiments as unknown[]).map((item) => this.mapExperiment(item))
				: [];

			const result = { movies, experiments };
			this.cache.set(cacheKey, result);
			return result;
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] globalSearch failed for "${query}": ${error instanceof Error ? error.message : String(error)}`
			);
			return { movies: [], experiments: [] };
		}
	}

	public async searchMovies(query: string): Promise<NormalizedMovie[]> {
		const res = await this.globalSearch(query);
		return res.movies;
	}

	public async getRandomMovie(): Promise<NormalizedMovie | null> {
		try {
			const response = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/movies/random?limit=1`
			);
			if (!response || !Array.isArray(response.movies) || response.movies.length === 0) return null;
			return this.mapMovie(response.movies[0]);
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getRandomMovie failed: ${error instanceof Error ? error.message : String(error)}`
			);
			return null;
		}
	}

	public async getRandomQuote(): Promise<{
		text: string;
		movie: string;
		year: string;
		movieSlug?: string;
	} | null> {
		try {
			const response = await this.fetch.request<Record<string, unknown>>(
				`${this.config.api.badMoviesBaseUrl}/quotes/random`
			);
			if (!response?.quote) return null;
			const q = response.quote as Record<string, unknown>;
			const movie = q.movie as Record<string, unknown> | undefined;
			return {
				text: (q.text || q.content) as string,
				movie: (q.movieTitle || movie?.title || 'Unknown Movie') as string,
				year: (q.movieYear || movie?.year || 'N/A') as string,
				movieSlug: (q.movieSlug || movie?.slug || undefined) as string | undefined
			};
		} catch (error: unknown) {
			logger.error(
				`[BadMovies] getRandomQuote failed: ${error instanceof Error ? error.message : String(error)}`
			);
			return null;
		}
	}

	private mapMovie(item: unknown): NormalizedMovie {
		const d = item as Record<string, unknown>;
		const rawPoster = d.posterPath as string | undefined;
		const posterUrl = rawPoster?.startsWith('/') ? `https://badmovies.co${rawPoster}` : rawPoster;
		return {
			id: d.id?.toString() ?? d.Id?.toString() ?? (d.slug as string | undefined) ?? '',
			slug: d.slug as string | undefined,
			title: (d.title as string | undefined) ?? 'Unknown',
			year:
				typeof d.releaseDate === 'string'
					? d.releaseDate.split('-')[0]
					: ((d.year || 'Unknown') as string).toString(),
			description: (d.overview as string) || '',
			url: `https://badmovies.co/movies/${d.slug as string}`,
			posterUrl,
			rating:
				(d.voteAverage as string | undefined) || (d.imdbRating as string | undefined) || 'N/A',
			source: 'badmovies' as const
		};
	}
}
