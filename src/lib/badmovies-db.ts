import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, sql, desc, asc, gt, and, inArray, isNotNull } from 'drizzle-orm';
import { CacheManager } from './cache-manager.js';
import * as schema from '../types/schema.js';
import type {
	NormalizedMovie,
	NormalizedExperiment,
	NormalizedStats,
	GenreStat,
	NormalizedReview,
	NormalizedQuoteDetailed
} from './models/movie.js';
import { logger } from '../utils/logger.js';

// --- Helpers -----------------------------------------------------------------

/**
 * Extracts the richest possible diagnostic string from a database error.
 * The `pg` driver surfaces PostgreSQL server fields (code, detail, hint,
 * position, constraint, table, column, routine) directly on the Error object.
 * Drizzle re-throws those same Error instances, so this helper works for
 * both raw pool queries and Drizzle ORM calls.
 */
function formatDbError(error: unknown): string {
	if (!(error instanceof Error)) return String(error);
	const e = error as Error & {
		code?: string;
		detail?: string;
		hint?: string;
		position?: string;
		where?: string;
		constraint?: string;
		table?: string;
		column?: string;
		routine?: string;
		cause?: unknown;
	};
	const parts: string[] = [e.message];
	if (e.code) parts.push(`pgCode=${e.code}`);
	if (e.detail) parts.push(`detail: ${e.detail}`);
	if (e.hint) parts.push(`hint: ${e.hint}`);
	if (e.position) parts.push(`position=${e.position}`);
	if (e.constraint) parts.push(`constraint=${e.constraint}`);
	if (e.table) parts.push(`table=${e.table}`);
	if (e.column) parts.push(`column=${e.column}`);
	if (e.routine) parts.push(`routine=${e.routine}`);
	if (e.where) parts.push(`where: ${e.where}`);
	if (e.cause instanceof Error) parts.push(`cause: ${e.cause.message}`);
	return parts.join(' | ');
}

function prefixUrl(path: string | null | undefined): string | undefined {
	if (!path) return undefined;
	return path.startsWith('/') ? `https://badmovies.co${path}` : path;
}

/** Constructs the BadMovies.co Next.js image-optimised URL for an experiment banner.
 *  Uses the stored bannerPath when available; falls back to the known file-naming
 *  convention (experiment-{number}-{id}.webp) so nearly all experiments have an image. */
function experimentBannerUrl(row: {
	id: number;
	experimentNumber: string | null;
	bannerPath: string | null;
}): string | undefined {
	const proxyPath =
		row.bannerPath ??
		`/api/images/proxy?path=experiments%2Fexperiment-${row.experimentNumber ?? row.id}-${row.id}.webp`;
	return `https://badmovies.co/_next/image?url=${proxyPath}&w=1920&q=75`;
}

function computeWeightedScore(row: {
	ratingGood: string | number | null;
	ratingEntertainment: string | number | null;
	ratingSoBadItsGood: string | number | null;
	ratingMemePotential: string | number | null;
}): number {
	const g = Number(row.ratingGood ?? 0);
	const e = Number(row.ratingEntertainment ?? 0);
	const sb = Number(row.ratingSoBadItsGood ?? 0);
	const mp = Number(row.ratingMemePotential ?? 0);
	return sb * 2.0 + e * 1.2 + mp * 0.8 + g * -0.5;
}

// --- Typed row interfaces ----------------------------------------------------

interface MovieRow {
	id: number;
	slug: string | null;
	title: string;
	year: string | null;
	description: string | null;
	posterPath: string | null;
	voteAverage: string | null;
	imdbRating: string | null;
	budget?: string | number | null;
	revenue?: string | number | null;
	runtime?: number | null;
}

interface FullMovieRow extends MovieRow {
	releaseDate: string | null;
	tagline: string | null;
	trailerUrl: string | null;
	tmdbId: number | null;
	imdbId: string | null;
	imdbVotes: number | null;
	contentRating: string | null;
	genres: string | null;
	studio: string | null;
	director: string | null;
	actors: string | null;
	writers: string | null;
	reviewCount: number | null;
	quoteCount: number | null;
}

interface ExperimentRow {
	id: number;
	experimentNumber: string | null;
	slug: string | null;
	title: string | null;
	date: string | null;
	bannerPath: string | null;
	host: string | null;
}

interface ExperimentMovieRow {
	experimentId: number;
	id: number;
	slug: string | null;
	title: string;
	year: string | null;
	posterPath: string | null;
}

interface QuoteRow {
	id: number;
	text: string | null;
	movie: string;
	movieSlug: string | null;
	year: string | null;
	character: string | null;
	actor: string | null;
	context: string | null;
	isMemorable: boolean | null;
	likes: number | null;
	status: string | null;
	createdAt: string | null;
}

interface ReviewRow {
	id: number;
	movieTitle: string;
	movieSlug: string;
	movieYear: string | null;
	posterPath: string | null;
	reviewerName: string | null;
	content: string | null;
	ratingGood: string | null;
	ratingEntertainment: string | null;
	ratingSoBadItsGood: string | null;
	ratingMemePotential: string | null;
	status: string | null;
	createdAt: string | null;
}

// --- Client ------------------------------------------------------------------

export class BadMoviesDbClient {
	private pool: Pool;
	private db: NodePgDatabase<typeof schema>;
	private _connected = false;

	constructor(
		pgConfig: {
			host: string;
			port: number;
			database: string;
			user: string;
			password: string;
			ssl: boolean;
		},
		private cache: CacheManager
	) {
		const config: PoolConfig = {
			host: pgConfig.host,
			port: pgConfig.port,
			database: pgConfig.database,
			user: pgConfig.user,
			password: pgConfig.password,
			max: 5,
			ssl: pgConfig.ssl ? { rejectUnauthorized: false } : false
		};
		this.pool = new Pool(config);
		this.pool.on('error', (err) => {
			logger.error(`[BadMoviesDb] Idle client error: ${err.message}`);
		});
		this.db = drizzle(this.pool, { schema });
	}

	/**
	 * Verify the PostgreSQL connection by running a cheap query.
	 * Sets the internal `connected` flag so the startup banner can report accurate status.
	 * Returns true on success, false on failure (never throws).
	 */
	public async testConnection(): Promise<boolean> {
		try {
			await this.pool.query('SELECT 1');
			this._connected = true;
			return true;
		} catch (err: unknown) {
			this._connected = false;
			logger.error(`[BadMoviesDb] Connection test failed: ${formatDbError(err)}`);
			return false;
		}
	}

	/** True only after a successful testConnection() call. */
	public get connected(): boolean {
		return this._connected;
	}

	// --- Movie Queries ----------------------------------------------------------

	public async getMovie(slugOrId: string): Promise<NormalizedMovie | null> {
		const cacheKey = `db:movie:${slugOrId}`;
		const cached = this.cache.get<NormalizedMovie>(cacheKey);
		if (cached) return cached;

		try {
			const isNumeric = /^\d+$/.test(slugOrId);
			const whereClause = isNumeric
				? sql`m.id = ${parseInt(slugOrId, 10)}`
				: sql`m.slug = ${slugOrId}`;

			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)                             AS year,
          m.release_date                                       AS "releaseDate",
          m.overview                                           AS description,
          m.tagline,
          m.poster_path                                        AS "posterPath",
          m.trailer_url                                        AS "trailerUrl",
          m.budget,
          m.revenue,
          m.tmdb_id                                            AS "tmdbId",
          m.imdb_id                                            AS "imdbId",
          m.imdb_rating                                        AS "imdbRating",
          m.imdb_votes                                         AS "imdbVotes",
          m.vote_average                                       AS "voteAverage",
          m.content_rating                                     AS "contentRating",
          m.runtime,
          STRING_AGG(DISTINCT g.name, ', ' ORDER BY g.name)   AS genres,
          STRING_AGG(DISTINCT s.name, ', ')                   AS studio,
          (SELECT STRING_AGG(p.name, ', ')
             FROM people p
             JOIN movie_directors md ON md.person_id = p.id
            WHERE md.movie_id = m.id)                         AS director,
          (SELECT STRING_AGG(p.name, ', ')
             FROM people p
             JOIN movie_actors ma ON ma.person_id = p.id
            WHERE ma.movie_id = m.id)                         AS actors,
          (SELECT STRING_AGG(p.name, ', ')
             FROM people p
             JOIN movie_writers mw ON mw.person_id = p.id
            WHERE mw.movie_id = m.id)                         AS writers,
          (SELECT COUNT(*)::int FROM reviews r
            WHERE r.movie_id = m.id AND r.status = 'approved') AS "reviewCount",
          (SELECT COUNT(*)::int FROM quotes  q
            WHERE q.movie_id = m.id AND q.status = 'approved') AS "quoteCount"
        FROM movies m
        LEFT JOIN movie_genres  mg ON mg.movie_id  = m.id
        LEFT JOIN genres         g ON g.id          = mg.genre_id
        LEFT JOIN movie_studios ms ON ms.movie_id  = m.id
        LEFT JOIN studios        s ON s.id          = ms.studio_id
        WHERE ${whereClause}
        GROUP BY m.id
      `);

			if (!result.rows.length) return null;
			const movie = this.mapFullMovieRow(result.rows[0] as unknown as FullMovieRow);
			this.cache.set(cacheKey, movie);
			return movie;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getMovie failed for "${slugOrId}": ${formatDbError(error)}`);
			return null;
		}
	}

	public async searchMovies(query: string): Promise<NormalizedMovie[]> {
		const cacheKey = `db:searchMovies:${query}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			// 1. Full-phrase ILIKE (fastest, most precise)
			const rows = await this.db
				.select({
					id: schema.movies.id,
					slug: schema.movies.slug,
					title: schema.movies.title,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					description: schema.movies.overview,
					posterPath: schema.movies.posterPath,
					voteAverage: schema.movies.voteAverage,
					imdbRating: schema.movies.imdbRating
				})
				.from(schema.movies)
				.where(ilike(schema.movies.title, `%${query}%`))
				.orderBy(asc(schema.movies.title))
				.limit(25);

			if (rows.length > 0) {
				const movies = rows.map((r) => this.mapMovieRow(r));
				this.cache.set(cacheKey, movies, 300);
				return movies;
			}

			// 2. Multi-token fallback: split on whitespace, match each significant word
			const tokens = query
				.split(/\s+/)
				.map((t) => t.trim())
				.filter((t) => t.length > 2); // skip short stop-words

			if (tokens.length > 1) {
				// Build AND conditions: every token must appear somewhere in the title
				const conditions = tokens.map((t) => ilike(schema.movies.title, `%${t}%`));
				const tokenRows = await this.db
					.select({
						id: schema.movies.id,
						slug: schema.movies.slug,
						title: schema.movies.title,
						year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
						description: schema.movies.overview,
						posterPath: schema.movies.posterPath,
						voteAverage: schema.movies.voteAverage,
						imdbRating: schema.movies.imdbRating
					})
					.from(schema.movies)
					.where(and(...conditions))
					.orderBy(asc(schema.movies.title))
					.limit(25);

				if (tokenRows.length > 0) {
					const movies = tokenRows.map((r) => this.mapMovieRow(r));
					this.cache.set(cacheKey, movies, 300);
					return movies;
				}
			}

			// 3. Description keyword fallback: match significant tokens against the movie overview.
			//    Triggered only when title searches find nothing — useful for queries like
			//    "movies about killer robots" or "that movie with the girl with superpowers".
			const descTokens = (
				tokens.length > 0 ? tokens : query.split(/\s+/).map((t) => t.trim())
			).filter((t) => t.length > 3);

			if (descTokens.length > 0) {
				const descConditions = descTokens.map((t) => ilike(schema.movies.overview, `%${t}%`));
				const descRows = await this.db
					.select({
						id: schema.movies.id,
						slug: schema.movies.slug,
						title: schema.movies.title,
						year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
						description: schema.movies.overview,
						posterPath: schema.movies.posterPath,
						voteAverage: schema.movies.voteAverage,
						imdbRating: schema.movies.imdbRating
					})
					.from(schema.movies)
					.where(and(...descConditions))
					.orderBy(asc(schema.movies.title))
					.limit(15);

				if (descRows.length > 0) {
					const movies = descRows.map((r) => this.mapMovieRow(r));
					this.cache.set(cacheKey, movies, 300);
					return movies;
				}
			}

			return [];
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] searchMovies failed for "${query}": ${formatDbError(error)}`);
			return [];
		}
	}

	/** Fetches fields needed to populate the local fuzzy search cache.
	 *  Returns every movie with title, year, director, top actors, and genres
	 *  so the Fuse index can match on all of those signals. */
	public async getMoviesForSearchCache(): Promise<
		{
			id: string;
			slug: string;
			title: string;
			year: string;
			tmdbId?: string;
			director: string;
			actors: string;
			genres: string;
		}[]
	> {
		const cacheKey = 'db:movies:searchcache';
		const cached =
			this.cache.get<
				{
					id: string;
					slug: string;
					title: string;
					year: string;
					tmdbId?: string;
					director: string;
					actors: string;
					genres: string;
				}[]
			>(cacheKey);
		if (cached) return cached;

		try {
			const result = await this.db.execute(sql`
        SELECT
          m.id::text                                           AS id,
          COALESCE(m.slug, m.id::text)                        AS slug,
          m.title,
          COALESCE(LEFT(m.release_date, 4), '')               AS year,
          m.tmdb_id::text                                      AS "tmdbId",
          COALESCE(
            (SELECT STRING_AGG(p.name, ', ')
               FROM people p
               JOIN movie_directors md ON md.person_id = p.id
              WHERE md.movie_id = m.id), ''
          )                                                    AS director,
          COALESCE(
            (SELECT STRING_AGG(top_actors.name, ', ')
               FROM (
                 SELECT p2.name
                   FROM people p2
                   JOIN movie_actors ma ON ma.person_id = p2.id
                  WHERE ma.movie_id = m.id
                  ORDER BY ma.id
                  LIMIT 4
               ) top_actors), ''
          )                                                    AS actors,
          COALESCE(
            STRING_AGG(DISTINCT g.name, ', ' ORDER BY g.name), ''
          )                                                    AS genres
        FROM movies m
        LEFT JOIN movie_genres mg ON mg.movie_id = m.id
        LEFT JOIN genres        g  ON g.id        = mg.genre_id
        GROUP BY m.id
        ORDER BY m.title
      `);

			const rows = result.rows as Array<{
				id: string;
				slug: string;
				title: string;
				year: string;
				tmdbId: string | null;
				director: string;
				actors: string;
				genres: string;
			}>;
			const mapped = rows.map((r) => ({
				id: r.id,
				slug: r.slug,
				title: r.title,
				year: r.year ?? '',
				tmdbId: r.tmdbId ?? undefined,
				director: r.director ?? '',
				actors: r.actors ?? '',
				genres: r.genres ?? ''
			}));

			this.cache.set(cacheKey, mapped, 3600);
			return mapped;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getMoviesForSearchCache failed: ${formatDbError(error)}`);
			return [];
		}
	}

	/**
	 * Fetches all unique people (directors + actors) for the local Fuse person index.
	 * Each person appears once per role they hold; a person who directs and acts will have two rows.
	 */
	public async getPeopleForSearchCache(): Promise<
		Array<{ id: string; name: string; role: 'director' | 'actor' }>
	> {
		const cacheKey = 'db:people:searchcache';
		const cached =
			this.cache.get<Array<{ id: string; name: string; role: 'director' | 'actor' }>>(cacheKey);
		if (cached) return cached;

		try {
			const result = await this.db.execute(sql`
        SELECT DISTINCT p.id::text AS id, p.name, 'director' AS role
        FROM people p
        JOIN movie_directors md ON md.person_id = p.id
        UNION
        SELECT DISTINCT p.id::text AS id, p.name, 'actor' AS role
        FROM people p
        JOIN movie_actors ma ON ma.person_id = p.id
        ORDER BY name
      `);

			const people = (result.rows as Array<{ id: string; name: string; role: string }>).map(
				(r) => ({
					id: r.id,
					name: r.name,
					role: r.role as 'director' | 'actor'
				})
			);

			this.cache.set(cacheKey, people, 3600);
			return people;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getPeopleForSearchCache failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async globalSearch(
		query: string
	): Promise<{ movies: NormalizedMovie[]; experiments: NormalizedExperiment[] }> {
		try {
			const [movies, experiments] = await Promise.all([
				this.searchMovies(query),
				this.searchExperiments(query)
			]);
			return { movies, experiments };
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] globalSearch failed for "${query}": ${formatDbError(error)}`);
			return { movies: [], experiments: [] };
		}
	}

	public async getRandomMovie(): Promise<NormalizedMovie | null> {
		try {
			const rows = await this.db
				.select({
					id: schema.movies.id,
					slug: schema.movies.slug,
					title: schema.movies.title,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					description: schema.movies.overview,
					posterPath: schema.movies.posterPath,
					voteAverage: schema.movies.voteAverage,
					imdbRating: schema.movies.imdbRating
				})
				.from(schema.movies)
				.orderBy(sql`RANDOM()`)
				.limit(1);

			if (!rows.length) return null;
			return this.mapMovieRow(rows[0]);
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getRandomMovie failed: ${formatDbError(error)}`);
			return null;
		}
	}

	public async getRankedMovies(
		rankBy: 'budget' | 'revenue' | 'rating' | 'runtime' | 'appearances',
		order: 'desc' | 'asc',
		limit = 10
	): Promise<NormalizedMovie[]> {
		const cacheKey = `db:ranked:${rankBy}:${order}:${limit}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			if (rankBy === 'appearances') {
				const rows = await this.db.execute(sql`
          SELECT
            m.id,
            m.slug,
            m.title,
            LEFT(m.release_date, 4)   AS year,
            m.overview                AS description,
            m.poster_path             AS "posterPath",
            m.vote_average            AS "voteAverage",
            m.imdb_rating             AS "imdbRating",
            COUNT(em.experiment_id)::int AS appearances
          FROM movies m
          JOIN experiment_movies em ON em.movie_id = m.id
          GROUP BY m.id
          ORDER BY appearances ${order === 'desc' ? sql`DESC` : sql`ASC`}, m.title ASC
          LIMIT ${limit}
        `);
				const movies = rows.rows.map((r: unknown) => ({
					...this.mapMovieRow(r as MovieRow),
					appearances: (r as { appearances: number }).appearances
				}));
				this.cache.set(cacheKey, movies, 600);
				return movies;
			}

			const rankCol =
				rankBy === 'budget'
					? schema.movies.budget
					: rankBy === 'revenue'
						? schema.movies.revenue
						: rankBy === 'rating'
							? schema.movies.voteAverage
							: schema.movies.runtime;

			const orderDir = order === 'desc' ? desc(rankCol) : asc(rankCol);

			const rows = await this.db
				.select({
					id: schema.movies.id,
					slug: schema.movies.slug,
					title: schema.movies.title,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					description: schema.movies.overview,
					posterPath: schema.movies.posterPath,
					voteAverage: schema.movies.voteAverage,
					imdbRating: schema.movies.imdbRating,
					budget: schema.movies.budget,
					revenue: schema.movies.revenue,
					runtime: schema.movies.runtime
				})
				.from(schema.movies)
				.where(and(isNotNull(rankCol), gt(rankCol, sql`0`)))
				.orderBy(orderDir, asc(schema.movies.title))
				.limit(limit);

			const movies = rows.map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getRankedMovies failed (${rankBy} ${order}): ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getPersonMovies(
		name: string,
		role: 'director' | 'actor'
	): Promise<NormalizedMovie[]> {
		const cacheKey = `db:person:${role}:${name}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			const joinTable = role === 'director' ? sql`movie_directors` : sql`movie_actors`;

			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)   AS year,
          m.overview                AS description,
          m.poster_path             AS "posterPath",
          m.vote_average            AS "voteAverage",
          m.imdb_rating             AS "imdbRating"
        FROM movies m
        JOIN ${joinTable} mp ON mp.movie_id = m.id
        JOIN people        p  ON p.id        = mp.person_id
        WHERE p.name ILIKE ${`%${name}%`}
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT 25
      `);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getPersonMovies failed for "${name}" (${role}): ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getMoviesByGenre(genre: string): Promise<NormalizedMovie[]> {
		const cacheKey = `db:genre:${genre.toLowerCase()}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)   AS year,
          m.overview                AS description,
          m.poster_path             AS "posterPath",
          m.vote_average            AS "voteAverage",
          m.imdb_rating             AS "imdbRating"
        FROM movies m
        JOIN movie_genres mg ON mg.movie_id = m.id
        JOIN genres        g  ON g.id        = mg.genre_id
        WHERE g.name ILIKE ${`%${genre}%`}
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT 25
      `);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getMoviesByGenre failed for "${genre}": ${formatDbError(error)}`);
			return [];
		}
	}

	public async getMoviesByDecade(decade: string): Promise<NormalizedMovie[]> {
		const cacheKey = `db:decade:${decade.toLowerCase()}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			// Accept "1990s", "1990", "90s" etc. — extract the 4-digit base year
			const match = decade.match(/(\d{3,4})s?/);
			if (!match) return [];
			const rawYear = match[1]!;
			// Normalise 3-digit shorthand ("990" → 1990, "000" → 2000)
			const startYear = rawYear.length === 3 ? parseInt(`1${rawYear}`, 10) : parseInt(rawYear, 10);
			const endYear = startYear + 9;

			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)   AS year,
          m.overview                AS description,
          m.poster_path             AS "posterPath",
          m.vote_average            AS "voteAverage",
          m.imdb_rating             AS "imdbRating"
        FROM movies m
        WHERE m.release_date IS NOT NULL
          AND LENGTH(m.release_date) >= 4
          AND CAST(LEFT(m.release_date, 4) AS integer) BETWEEN ${startYear} AND ${endYear}
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT 25
      `);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getMoviesByDecade failed for "${decade}": ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getMoviesByCountry(country: string): Promise<NormalizedMovie[]> {
		const cacheKey = `db:country:${country.toLowerCase()}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)   AS year,
          m.overview                AS description,
          m.poster_path             AS "posterPath",
          m.vote_average            AS "voteAverage",
          m.imdb_rating             AS "imdbRating"
        FROM movies m
        JOIN movie_countries mc ON mc.movie_id = m.id
        JOIN countries        c  ON c.id        = mc.country_id
        WHERE c.name ILIKE ${`%${country}%`}
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT 25
      `);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getMoviesByCountry failed for "${country}": ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getMoviesByBudgetTier(tier: string): Promise<NormalizedMovie[]> {
		const cacheKey = `db:budget_tier:${tier.toLowerCase()}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		// These ranges must exactly match the labels produced by getStatsByCategory('budget')
		const tierRanges: Record<string, { min: number; max: number | null }> = {
			'Under $1M': { min: 1, max: 999_999 },
			'$1M–$10M': { min: 1_000_000, max: 9_999_999 },
			'$10M–$50M': { min: 10_000_000, max: 49_999_999 },
			'$50M–$100M': { min: 50_000_000, max: 99_999_999 },
			'Over $100M': { min: 100_000_000, max: null }
		};

		const range = tierRanges[tier];
		if (!range) return [];

		try {
			const result = await this.db.execute(
				range.max !== null
					? sql`
          SELECT
            m.id,
            m.slug,
            m.title,
            LEFT(m.release_date, 4)   AS year,
            m.overview                AS description,
            m.poster_path             AS "posterPath",
            m.vote_average            AS "voteAverage",
            m.imdb_rating             AS "imdbRating",
            m.budget,
            m.revenue
          FROM movies m
          WHERE m.budget BETWEEN ${range.min} AND ${range.max}
          ORDER BY m.budget DESC NULLS LAST
          LIMIT 25
        `
					: sql`
          SELECT
            m.id,
            m.slug,
            m.title,
            LEFT(m.release_date, 4)   AS year,
            m.overview                AS description,
            m.poster_path             AS "posterPath",
            m.vote_average            AS "voteAverage",
            m.imdb_rating             AS "imdbRating",
            m.budget,
            m.revenue
          FROM movies m
          WHERE m.budget >= ${range.min}
          ORDER BY m.budget DESC NULLS LAST
          LIMIT 25
        `
			);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 600);
			return movies;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getMoviesByBudgetTier failed for "${tier}": ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getUnplayedMovies(limit = 25): Promise<NormalizedMovie[]> {
		const cacheKey = `db:unplayed:${limit}`;
		const cached = this.cache.get<NormalizedMovie[]>(cacheKey);
		if (cached) return cached;

		try {
			const result = await this.db.execute(sql`
        SELECT
          m.id,
          m.slug,
          m.title,
          LEFT(m.release_date, 4)   AS year,
          m.overview                AS description,
          m.poster_path             AS "posterPath",
          m.vote_average            AS "voteAverage",
          m.imdb_rating             AS "imdbRating"
        FROM movies m
        WHERE m.id NOT IN (
          SELECT DISTINCT em.movie_id FROM experiment_movies em
        )
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT ${limit}
      `);

			const movies = (result.rows as unknown as MovieRow[]).map((r) => this.mapMovieRow(r));
			this.cache.set(cacheKey, movies, 300);
			return movies;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getUnplayedMovies failed: ${formatDbError(error)}`);
			return [];
		}
	}

	// --- Experiment Queries -----------------------------------------------------

	public async getExperiments(): Promise<NormalizedExperiment[]> {
		const cacheKey = 'db:experiments';
		const cached = this.cache.get<NormalizedExperiment[]>(cacheKey);
		if (cached) return cached;

		try {
			const expRows = await this.db
				.select({
					id: schema.experiments.id,
					experimentNumber: schema.experiments.experimentNumber,
					slug: schema.experiments.slug,
					title: schema.experiments.title,
					date: schema.experiments.date,
					bannerPath: schema.experiments.bannerPath,
					host: sql<string | null>`COALESCE(${schema.profiles.username}, ${schema.users.name})`
				})
				.from(schema.experiments)
				.leftJoin(schema.users, eq(schema.users.id, schema.experiments.hostUserId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.experiments.hostUserId!))
				.orderBy(desc(schema.experiments.date));

			const experimentIds = expRows.map((r) => r.id);
			const moviesByExp = new Map<
				number,
				{ id: string; slug?: string; title: string; year?: string; posterUrl?: string }[]
			>();

			if (experimentIds.length > 0) {
				const movieRows = await this.db
					.select({
						experimentId: schema.experimentMovies.experimentId,
						id: schema.movies.id,
						slug: schema.movies.slug,
						title: schema.movies.title,
						year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
						posterPath: schema.movies.posterPath
					})
					.from(schema.experimentMovies)
					.innerJoin(schema.movies, eq(schema.movies.id, schema.experimentMovies.movieId))
					.where(inArray(schema.experimentMovies.experimentId, experimentIds))
					.orderBy(asc(schema.experimentMovies.experimentId), asc(schema.experimentMovies.order!));

				for (const row of movieRows as ExperimentMovieRow[]) {
					const list = moviesByExp.get(row.experimentId) ?? [];
					list.push({
						id: String(row.id),
						slug: row.slug ?? undefined,
						title: row.title,
						year: row.year ?? undefined,
						posterUrl: prefixUrl(row.posterPath)
					});
					moviesByExp.set(row.experimentId, list);
				}
			}

			const experiments = (expRows as ExperimentRow[]).map((row) =>
				this.mapExperimentRow(row, moviesByExp.get(row.id) ?? [])
			);

			this.cache.set(cacheKey, experiments, 600);
			return experiments;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getExperiments failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async getExperiment(slug: string): Promise<NormalizedExperiment | null> {
		const cacheKey = `db:experiment:${slug}`;
		const cached = this.cache.get<NormalizedExperiment>(cacheKey);
		if (cached) return cached;

		try {
			const expRows = await this.db
				.select({
					id: schema.experiments.id,
					experimentNumber: schema.experiments.experimentNumber,
					slug: schema.experiments.slug,
					title: schema.experiments.title,
					date: schema.experiments.date,
					bannerPath: schema.experiments.bannerPath,
					host: sql<string | null>`COALESCE(${schema.profiles.username}, ${schema.users.name})`
				})
				.from(schema.experiments)
				.leftJoin(schema.users, eq(schema.users.id, schema.experiments.hostUserId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.experiments.hostUserId!))
				.where(eq(schema.experiments.slug!, slug))
				.limit(1);

			if (!expRows.length) return null;
			const row = expRows[0] as ExperimentRow;

			const movieRows = await this.db
				.select({
					experimentId: schema.experimentMovies.experimentId,
					id: schema.movies.id,
					slug: schema.movies.slug,
					title: schema.movies.title,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.experimentMovies)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.experimentMovies.movieId))
				.where(eq(schema.experimentMovies.experimentId, row.id))
				.orderBy(asc(schema.experimentMovies.order!));

			const movies = (movieRows as ExperimentMovieRow[]).map((m) => ({
				id: String(m.id),
				slug: m.slug ?? undefined,
				title: m.title,
				year: m.year ?? undefined,
				posterUrl: prefixUrl(m.posterPath)
			}));

			const experiment = this.mapExperimentRow(row, movies);
			this.cache.set(cacheKey, experiment, 3600);
			return experiment;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getExperiment failed for "${slug}": ${formatDbError(error)}`);
			return null;
		}
	}

	// --- Stats ------------------------------------------------------------------

	public async getStats(): Promise<NormalizedStats | null> {
		const cacheKey = 'db:stats';
		const cached = this.cache.get<NormalizedStats>(cacheKey);
		if (cached) return cached;

		try {
			const [
				statsRows,
				lastPartyRows,
				genreRows,
				runtimeRows,
				userCountRows,
				expCountRows,
				reviewCountRows,
				budgetRevenueRows,
				topActorRows,
				topDirectorRows,
				avgReviewRatingRows,
				mostReviewedRows,
				mostExperimentedRows,
				mostQuotedRows,
				highestRatedRows,
				longestMovieRows,
				totalQuotesRows,
				topDecadeRows
			] = await Promise.all([
				this.db
					.select({
						totalMovies: sql<number>`COUNT(*)::int`
					})
					.from(schema.movies),

				this.db
					.select({
						date: schema.experiments.date,
						experimentNumber: schema.experiments.experimentNumber,
						title: schema.experiments.title
					})
					.from(schema.experiments)
					.orderBy(desc(schema.experiments.date))
					.limit(1),

				this.db
					.select({
						genre: schema.genres.name,
						count: sql<number>`COUNT(*)::int`
					})
					.from(schema.movieGenres)
					.innerJoin(schema.genres, eq(schema.genres.id, schema.movieGenres.genreId))
					.groupBy(schema.genres.name)
					.orderBy(sql`COUNT(*) DESC`)
					.limit(10),

				this.db
					.select({ totalRuntime: sql<number>`COALESCE(SUM(${schema.movies.runtime}), 0)::int` })
					.from(schema.movies)
					.where(isNotNull(schema.movies.runtime)),

				this.db.select({ count: sql<number>`COUNT(*)::int` }).from(schema.users),

				this.db.select({ count: sql<number>`COUNT(*)::int` }).from(schema.experiments),

				this.db.select({ count: sql<number>`COUNT(*)::int` }).from(schema.reviews),

				this.db
					.select({
						totalBudget: sql<number>`COALESCE(SUM(CASE WHEN ${schema.movies.budget}  > 0 THEN ${schema.movies.budget}  ELSE 0 END), 0)::float8`,
						totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${schema.movies.revenue} > 0 THEN ${schema.movies.revenue} ELSE 0 END), 0)::float8`
					})
					.from(schema.movies),

				this.db
					.select({ name: schema.people.name, count: sql<number>`COUNT(*)::int` })
					.from(schema.movieActors)
					.innerJoin(schema.people, eq(schema.people.id, schema.movieActors.personId))
					.groupBy(schema.people.name)
					.orderBy(sql`COUNT(*) DESC`)
					.limit(1),

				this.db
					.select({ name: schema.people.name, count: sql<number>`COUNT(*)::int` })
					.from(schema.movieDirectors)
					.innerJoin(schema.people, eq(schema.people.id, schema.movieDirectors.personId))
					.groupBy(schema.people.name)
					.orderBy(sql`COUNT(*) DESC`)
					.limit(1),

				// Average community weighted score from approved reviews
				this.db
					.select({
						avgRating: sql<number>`ROUND(AVG(
              (${schema.reviews.ratingSoBadItIsGood}::float * 2.0) +
              (${schema.reviews.ratingEntertainment}::float * 1.2) +
              (${schema.reviews.ratingMemePotential}::float * 0.8) +
              (${schema.reviews.ratingGood}::float * -0.5)
            )::numeric, 2)::float`
					})
					.from(schema.reviews)
					.where(eq(schema.reviews.status!, 'approved')),

				// Most reviewed movie (by approved review count)
				this.db.execute(sql`
          SELECT m.title, COALESCE(m.slug, m.id::text) AS slug, COUNT(r.id)::int AS count
          FROM ${schema.reviews} r
          JOIN ${schema.movies} m ON m.id = r.movie_id
          WHERE r.status = 'approved'
          GROUP BY m.id, m.title, m.slug
          ORDER BY count DESC
          LIMIT 1
        `),

				// Most appeared in experiments
				this.db.execute(sql`
          SELECT m.title, COALESCE(m.slug, m.id::text) AS slug, COUNT(em.experiment_id)::int AS count
          FROM ${schema.experimentMovies} em
          JOIN ${schema.movies} m ON m.id = em.movie_id
          GROUP BY m.id, m.title, m.slug
          ORDER BY count DESC
          LIMIT 1
        `),

				// Most quoted movie (by approved quote count)
				this.db.execute(sql`
          SELECT m.title, COALESCE(m.slug, m.id::text) AS slug, COUNT(q.id)::int AS count
          FROM ${schema.quotes} q
          JOIN ${schema.movies} m ON m.id = q.movie_id
          WHERE q.status = 'approved'
          GROUP BY m.id, m.title, m.slug
          ORDER BY count DESC
          LIMIT 1
        `),

				// Highest community-rated movie (min 2 approved reviews)
				this.db.execute(sql`
          SELECT m.title, COALESCE(m.slug, m.id::text) AS slug,
            ROUND(AVG(
              (r.rating_so_bad_it_is_good::float * 2.0) +
              (r.rating_entertainment::float * 1.2) +
              (r.rating_meme_potential::float * 0.8) +
              (r.rating_good::float * -0.5)
            )::numeric, 2)::float AS score
          FROM ${schema.reviews} r
          JOIN ${schema.movies} m ON m.id = r.movie_id
          WHERE r.status = 'approved'
          GROUP BY m.id, m.title, m.slug
          HAVING COUNT(r.id) >= 2
          ORDER BY score DESC
          LIMIT 1
        `),

				// Longest movie in the archive
				this.db
					.select({
						title: schema.movies.title,
						slug: schema.movies.slug,
						runtime: schema.movies.runtime
					})
					.from(schema.movies)
					.where(isNotNull(schema.movies.runtime))
					.orderBy(desc(schema.movies.runtime))
					.limit(1),

				// Total approved quotes
				this.db
					.select({ count: sql<number>`COUNT(*)::int` })
					.from(schema.quotes)
					.where(eq(schema.quotes.status!, 'approved')),

				// Top decade by movie count
				this.db
					.select({
						label: sql<string>`SUBSTRING(${schema.movies.releaseDate}, 1, 3) || '0s'`,
						count: sql<number>`COUNT(*)::int`
					})
					.from(schema.movies)
					.where(sql`LENGTH(${schema.movies.releaseDate}) >= 4`)
					.groupBy(sql`SUBSTRING(${schema.movies.releaseDate}, 1, 3) || '0s'`)
					.orderBy(sql`COUNT(*) DESC`)
					.limit(1)
			]);

			const stats: NormalizedStats = {
				totalMovies: statsRows[0]?.totalMovies ?? 0,
				lastParty: lastPartyRows[0]?.date
					? new Date(lastPartyRows[0].date).toISOString().slice(0, 10)
					: '',
				avgRating: avgReviewRatingRows[0]?.avgRating ?? 0,
				totalRuntimeMinutes: runtimeRows[0]?.totalRuntime ?? 0,
				userCount: userCountRows[0]?.count ?? 0,
				genres: genreRows.map((r) => ({ genre: r.genre, count: r.count })) as GenreStat[],
				totalExperiments: expCountRows[0]?.count ?? 0,
				totalReviews: reviewCountRows[0]?.count ?? 0,
				totalBudget: budgetRevenueRows[0]?.totalBudget ?? 0,
				totalRevenue: budgetRevenueRows[0]?.totalRevenue ?? 0,
				topActor: topActorRows[0]
					? { name: topActorRows[0].name, count: topActorRows[0].count }
					: undefined,
				topDirector: topDirectorRows[0]
					? { name: topDirectorRows[0].name, count: topDirectorRows[0].count }
					: undefined,
				latestExperiment: lastPartyRows[0]
					? { number: lastPartyRows[0].experimentNumber, title: lastPartyRows[0].title }
					: undefined,
				mostReviewedMovie: (() => {
					const r = (
						mostReviewedRows.rows as Array<{ title: string; slug: string; count: number }>
					)[0];
					return r ? { title: r.title, slug: r.slug, count: Number(r.count) } : undefined;
				})(),
				mostExperimentedMovie: (() => {
					const r = (
						mostExperimentedRows.rows as Array<{ title: string; slug: string; count: number }>
					)[0];
					return r ? { title: r.title, slug: r.slug, count: Number(r.count) } : undefined;
				})(),
				mostQuotedMovie: (() => {
					const r = (
						mostQuotedRows.rows as Array<{ title: string; slug: string; count: number }>
					)[0];
					return r ? { title: r.title, slug: r.slug, count: Number(r.count) } : undefined;
				})(),
				highestRatedMovie: (() => {
					const r = (
						highestRatedRows.rows as Array<{ title: string; slug: string; score: number }>
					)[0];
					return r ? { title: r.title, slug: r.slug, score: Number(r.score) } : undefined;
				})(),
				longestMovie: longestMovieRows[0]
					? {
							title: longestMovieRows[0].title,
							slug: longestMovieRows[0].slug ?? longestMovieRows[0].title,
							runtime: longestMovieRows[0].runtime!
						}
					: undefined,
				totalQuotes: totalQuotesRows[0]?.count ?? 0,
				topDecade: topDecadeRows[0]
					? { label: topDecadeRows[0].label, count: topDecadeRows[0].count }
					: undefined
			};

			this.cache.set(cacheKey, stats, 1800);
			return stats;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getStats failed: ${formatDbError(error)}`);
			return null;
		}
	}

	public async getStatsByCategory(
		category: 'genre' | 'decade' | 'director' | 'actor' | 'country' | 'budget'
	): Promise<Array<{ label: string; count: number }>> {
		try {
			switch (category) {
				case 'genre': {
					return this.db
						.select({ label: schema.genres.name, count: sql<number>`COUNT(*)::int` })
						.from(schema.movieGenres)
						.innerJoin(schema.genres, eq(schema.genres.id, schema.movieGenres.genreId))
						.groupBy(schema.genres.name)
						.orderBy(sql`COUNT(*) DESC`)
						.limit(15);
				}
				case 'decade': {
					const decadeExpr = sql<string>`SUBSTRING(${schema.movies.releaseDate}, 1, 3) || '0s'`;
					return this.db
						.select({ label: decadeExpr, count: sql<number>`COUNT(*)::int` })
						.from(schema.movies)
						.where(sql`LENGTH(${schema.movies.releaseDate}) >= 4`)
						.groupBy(decadeExpr)
						.orderBy(sql`COUNT(*) DESC`);
				}
				case 'director': {
					return this.db
						.select({ label: schema.people.name, count: sql<number>`COUNT(*)::int` })
						.from(schema.movieDirectors)
						.innerJoin(schema.people, eq(schema.people.id, schema.movieDirectors.personId))
						.groupBy(schema.people.name)
						.orderBy(sql`COUNT(*) DESC`)
						.limit(15);
				}
				case 'actor': {
					return this.db
						.select({ label: schema.people.name, count: sql<number>`COUNT(*)::int` })
						.from(schema.movieActors)
						.innerJoin(schema.people, eq(schema.people.id, schema.movieActors.personId))
						.groupBy(schema.people.name)
						.orderBy(sql`COUNT(*) DESC`)
						.limit(15);
				}
				case 'country': {
					return this.db
						.select({ label: schema.countries.name, count: sql<number>`COUNT(*)::int` })
						.from(schema.movieCountries)
						.innerJoin(schema.countries, eq(schema.countries.id, schema.movieCountries.countryId))
						.groupBy(schema.countries.name)
						.orderBy(sql`COUNT(*) DESC`)
						.limit(15);
				}
				case 'budget': {
					const rows = await this.db.execute(sql`
            SELECT
              CASE
                WHEN ${schema.movies.budget} IS NULL OR ${schema.movies.budget} = 0 THEN 'Unknown'
                WHEN ${schema.movies.budget} < 1000000             THEN 'Under $1M'
                WHEN ${schema.movies.budget} < 10000000            THEN '$1M–$10M'
                WHEN ${schema.movies.budget} < 50000000            THEN '$10M–$50M'
                WHEN ${schema.movies.budget} < 100000000           THEN '$50M–$100M'
                ELSE 'Over $100M'
              END AS label,
              COUNT(*)::int AS count
            FROM ${schema.movies}
            GROUP BY 1
            ORDER BY
              MIN(CASE
                WHEN ${schema.movies.budget} IS NULL OR ${schema.movies.budget} = 0 THEN 6
                WHEN ${schema.movies.budget} < 1000000             THEN 1
                WHEN ${schema.movies.budget} < 10000000            THEN 2
                WHEN ${schema.movies.budget} < 50000000            THEN 3
                WHEN ${schema.movies.budget} < 100000000           THEN 4
                ELSE 5
              END)
          `);
					return (rows.rows as Array<{ label: string; count: number }>).map((r) => ({
						label: r.label,
						count: Number(r.count)
					}));
				}
				default:
					logger.warn(
						`[BadMoviesDb] getStatsByCategory called with unrecognised category: "${category}"`
					);
					return [];
			}
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getStatsByCategory("${category}") failed: ${formatDbError(error)}`
			);
			return [];
		}
	}

	// --- Quotes -----------------------------------------------------------------

	public async getRandomQuote(): Promise<{
		text: string;
		movie: string;
		year: string;
		movieSlug?: string;
	} | null> {
		try {
			const rows = await this.db
				.select({
					text: schema.quotes.quote,
					movie: schema.movies.title,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					movieSlug: schema.movies.slug
				})
				.from(schema.quotes)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.quotes.movieId!))
				.where(eq(schema.quotes.status!, 'approved'))
				.orderBy(sql`RANDOM()`)
				.limit(1);

			if (!rows.length) return null;
			const r = rows[0];
			return {
				text: r.text ?? '',
				movie: r.movie,
				year: r.year ?? 'N/A',
				movieSlug: r.movieSlug ?? undefined
			};
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getRandomQuote failed: ${formatDbError(error)}`);
			return null;
		}
	}

	public async getMovieQuotes(movieSlug: string): Promise<NormalizedQuoteDetailed[]> {
		const cacheKey = `db:quotes:${movieSlug}`;
		const cached = this.cache.get<NormalizedQuoteDetailed[]>(cacheKey);
		if (cached) return cached;

		try {
			const rows = await this.db
				.select({
					id: schema.quotes.id,
					text: schema.quotes.quote,
					movie: schema.movies.title,
					movieSlug: schema.movies.slug,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					character: schema.quotes.character,
					actor: schema.quotes.actor,
					context: schema.quotes.context,
					isMemorable: schema.quotes.isMemorable,
					likes: schema.quotes.likes
				})
				.from(schema.quotes)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.quotes.movieId!))
				.where(and(eq(schema.movies.slug!, movieSlug), eq(schema.quotes.status!, 'approved')))
				.orderBy(desc(schema.quotes.isMemorable!), desc(schema.quotes.likes!));

			const quotes = (rows as QuoteRow[]).map((r) => this.mapQuoteRow(r));
			this.cache.set(cacheKey, quotes, 300);
			return quotes;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getMovieQuotes failed for "${movieSlug}": ${formatDbError(error)}`
			);
			return [];
		}
	}

	/** Fetch the N most recently added approved quotes (for get_recent_quotes). */
	public async getLatestQuotes(limit: number): Promise<NormalizedQuoteDetailed[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.quotes.id,
					text: schema.quotes.quote,
					movie: schema.movies.title,
					movieSlug: schema.movies.slug,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					character: schema.quotes.character,
					actor: schema.quotes.actor,
					context: schema.quotes.context,
					isMemorable: schema.quotes.isMemorable,
					likes: schema.quotes.likes,
					createdAt: schema.quotes.createdAt
				})
				.from(schema.quotes)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.quotes.movieId!))
				.where(eq(schema.quotes.status!, 'approved'))
				.orderBy(desc(schema.quotes.id))
				.limit(limit);

			return (rows as QuoteRow[]).map((r) => this.mapQuoteRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getLatestQuotes failed: ${formatDbError(error)}`);
			return [];
		}
	}

	/** Fetch the N most recent quotes across all statuses (admin use), newest first. */
	public async getAllQuotes(limit = 50): Promise<NormalizedQuoteDetailed[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.quotes.id,
					text: schema.quotes.quote,
					movie: schema.movies.title,
					movieSlug: schema.movies.slug,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					character: schema.quotes.character,
					actor: schema.quotes.actor,
					context: schema.quotes.context,
					isMemorable: schema.quotes.isMemorable,
					likes: schema.quotes.likes,
					status: schema.quotes.status,
					createdAt: schema.quotes.createdAt
				})
				.from(schema.quotes)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.quotes.movieId!))
				.orderBy(desc(schema.quotes.id))
				.limit(limit);

			return (rows as QuoteRow[]).map((r) => this.mapQuoteRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getAllQuotes failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async getNewQuotesSince(lastId: number): Promise<NormalizedQuoteDetailed[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.quotes.id,
					text: schema.quotes.quote,
					movie: schema.movies.title,
					movieSlug: schema.movies.slug,
					year: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					character: schema.quotes.character,
					actor: schema.quotes.actor,
					context: schema.quotes.context,
					isMemorable: schema.quotes.isMemorable,
					likes: schema.quotes.likes,
					createdAt: schema.quotes.createdAt
				})
				.from(schema.quotes)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.quotes.movieId!))
				.where(and(gt(schema.quotes.id, lastId), eq(schema.quotes.status!, 'approved')))
				.orderBy(asc(schema.quotes.id))
				.limit(20);

			return (rows as QuoteRow[]).map((r) => this.mapQuoteRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getNewQuotesSince failed: ${formatDbError(error)}`);
			return [];
		}
	}

	// --- Reviews ----------------------------------------------------------------

	public async getMovieReviews(movieSlug: string): Promise<NormalizedReview[]> {
		const cacheKey = `db:reviews:${movieSlug}`;
		const cached = this.cache.get<NormalizedReview[]>(cacheKey);
		if (cached) return cached;

		try {
			const rows = await this.db
				.select({
					id: schema.reviews.id,
					movieTitle: schema.movies.title,
					movieSlug: schema.movies.slug,
					reviewerName: sql<
						string | null
					>`COALESCE(${schema.profiles.username}, ${schema.users.name})`,
					content: schema.reviews.body,
					ratingGood: schema.reviews.ratingGood,
					ratingEntertainment: schema.reviews.ratingEntertainment,
					ratingSoBadItsGood: schema.reviews.ratingSoBadItIsGood,
					ratingMemePotential: schema.reviews.ratingMemePotential,
					createdAt: schema.reviews.createdAt,
					movieYear: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.reviews)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.reviews.movieId!))
				.innerJoin(schema.users, eq(schema.users.id, schema.reviews.userId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reviews.userId!))
				.where(and(eq(schema.movies.slug!, movieSlug), eq(schema.reviews.status!, 'approved')))
				.orderBy(desc(schema.reviews.createdAt!));

			const reviews = (rows as unknown as ReviewRow[]).map((r) => this.mapReviewRow(r));
			this.cache.set(cacheKey, reviews, 300);
			return reviews;
		} catch (error: unknown) {
			logger.error(
				`[BadMoviesDb] getMovieReviews failed for "${movieSlug}": ${formatDbError(error)}`
			);
			return [];
		}
	}

	public async getRandomReview(): Promise<NormalizedReview | null> {
		try {
			const rows = await this.db
				.select({
					id: schema.reviews.id,
					movieTitle: schema.movies.title,
					movieSlug: schema.movies.slug,
					reviewerName: sql<
						string | null
					>`COALESCE(${schema.profiles.username}, ${schema.users.name})`,
					content: schema.reviews.body,
					ratingGood: schema.reviews.ratingGood,
					ratingEntertainment: schema.reviews.ratingEntertainment,
					ratingSoBadItsGood: schema.reviews.ratingSoBadItIsGood,
					ratingMemePotential: schema.reviews.ratingMemePotential,
					createdAt: schema.reviews.createdAt,
					movieYear: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.reviews)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.reviews.movieId!))
				.innerJoin(schema.users, eq(schema.users.id, schema.reviews.userId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reviews.userId!))
				.where(eq(schema.reviews.status!, 'approved'))
				.orderBy(sql`RANDOM()`)
				.limit(1);

			if (!rows.length) return null;
			return this.mapReviewRow(rows[0] as unknown as ReviewRow);
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getRandomReview failed: ${formatDbError(error)}`);
			return null;
		}
	}

	public async getNewReviewsSince(lastId: number): Promise<NormalizedReview[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.reviews.id,
					movieTitle: schema.movies.title,
					movieSlug: schema.movies.slug,
					reviewerName: sql<
						string | null
					>`COALESCE(${schema.profiles.username}, ${schema.users.name})`,
					content: schema.reviews.body,
					ratingGood: schema.reviews.ratingGood,
					ratingEntertainment: schema.reviews.ratingEntertainment,
					ratingSoBadItsGood: schema.reviews.ratingSoBadItIsGood,
					ratingMemePotential: schema.reviews.ratingMemePotential,
					createdAt: schema.reviews.createdAt,
					movieYear: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.reviews)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.reviews.movieId!))
				.innerJoin(schema.users, eq(schema.users.id, schema.reviews.userId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reviews.userId!))
				.where(and(gt(schema.reviews.id, lastId), eq(schema.reviews.status!, 'approved')))
				.orderBy(asc(schema.reviews.id))
				.limit(20);

			return (rows as unknown as ReviewRow[]).map((r) => this.mapReviewRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getNewReviewsSince failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async getMaxReviewId(): Promise<number> {
		try {
			const result = await this.db.execute(
				sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM reviews WHERE status = 'approved'`
			);
			return Number((result.rows[0] as { max_id: number }).max_id ?? 0);
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getMaxReviewId failed: ${formatDbError(error)}`);
			return 0;
		}
	}

	/** Return the N most recently approved reviews, newest first. */
	public async getLatestReviews(limit = 10): Promise<NormalizedReview[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.reviews.id,
					movieTitle: schema.movies.title,
					movieSlug: schema.movies.slug,
					reviewerName: sql<
						string | null
					>`COALESCE(${schema.profiles.username}, ${schema.users.name})`,
					content: schema.reviews.body,
					ratingGood: schema.reviews.ratingGood,
					ratingEntertainment: schema.reviews.ratingEntertainment,
					ratingSoBadItsGood: schema.reviews.ratingSoBadItIsGood,
					ratingMemePotential: schema.reviews.ratingMemePotential,
					createdAt: schema.reviews.createdAt,
					movieYear: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.reviews)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.reviews.movieId!))
				.innerJoin(schema.users, eq(schema.users.id, schema.reviews.userId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reviews.userId!))
				.where(eq(schema.reviews.status!, 'approved'))
				.orderBy(desc(schema.reviews.id))
				.limit(limit);

			return (rows as unknown as ReviewRow[]).map((r) => this.mapReviewRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getLatestReviews failed: ${formatDbError(error)}`);
			return [];
		}
	}

	/** Return the N most recent reviews across all statuses (admin use), newest first. */
	public async getAllReviews(limit = 50): Promise<NormalizedReview[]> {
		try {
			const rows = await this.db
				.select({
					id: schema.reviews.id,
					movieTitle: schema.movies.title,
					movieSlug: schema.movies.slug,
					reviewerName: sql<
						string | null
					>`COALESCE(${schema.profiles.username}, ${schema.users.name})`,
					content: schema.reviews.body,
					ratingGood: schema.reviews.ratingGood,
					ratingEntertainment: schema.reviews.ratingEntertainment,
					ratingSoBadItsGood: schema.reviews.ratingSoBadItIsGood,
					ratingMemePotential: schema.reviews.ratingMemePotential,
					status: schema.reviews.status,
					createdAt: schema.reviews.createdAt,
					movieYear: sql<string | null>`LEFT(${schema.movies.releaseDate}, 4)`,
					posterPath: schema.movies.posterPath
				})
				.from(schema.reviews)
				.innerJoin(schema.movies, eq(schema.movies.id, schema.reviews.movieId!))
				.innerJoin(schema.users, eq(schema.users.id, schema.reviews.userId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.reviews.userId!))
				.orderBy(desc(schema.reviews.id))
				.limit(limit);

			return (rows as unknown as ReviewRow[]).map((r) => this.mapReviewRow(r));
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getAllReviews failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async getMaxQuoteId(): Promise<number> {
		try {
			const result = await this.db.execute(
				sql`SELECT COALESCE(MAX(id), 0) AS max_id FROM quotes WHERE status = 'approved'`
			);
			return Number((result.rows[0] as { max_id: number }).max_id ?? 0);
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getMaxQuoteId failed: ${formatDbError(error)}`);
			return 0;
		}
	}

	// --- Lifecycle --------------------------------------------------------------

	public async getContributors(
		limit = 20
	): Promise<Array<{ name: string; reviews: number; experiments: number }>> {
		const cacheKey = `db:contributors:${limit}`;
		const cached =
			this.cache.get<Array<{ name: string; reviews: number; experiments: number }>>(cacheKey);
		if (cached) return cached;

		try {
			const limitClause = limit > 0 ? sql`LIMIT ${limit}` : sql``;
			const rows = await this.db.execute(sql`
        SELECT
          COALESCE(pr.username, u.name, u.email)  AS name,
          COUNT(DISTINCT r.id)::int               AS reviews,
          COUNT(DISTINCT e.id)::int               AS experiments
        FROM users u
        LEFT JOIN profiles    pr ON pr.user_id     = u.id
        LEFT JOIN reviews      r ON r.user_id      = u.id AND r.status = 'approved'
        LEFT JOIN experiments  e ON e.host_user_id = u.id
        GROUP BY u.id, pr.username, u.name, u.email
        HAVING COUNT(DISTINCT r.id) > 0 OR COUNT(DISTINCT e.id) > 0
        ORDER BY reviews DESC, experiments DESC
        ${limitClause}
      `);

			const result = (
				rows.rows as Array<{ name: string; reviews: number; experiments: number }>
			).map((r) => ({ name: r.name, reviews: r.reviews, experiments: r.experiments }));

			this.cache.set(cacheKey, result, 1800);
			return result;
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] getContributors failed: ${formatDbError(error)}`);
			return [];
		}
	}

	public async close(): Promise<void> {
		await this.pool.end();
	}

	// --- Private Helpers --------------------------------------------------------

	private async searchExperiments(query: string): Promise<NormalizedExperiment[]> {
		const selectFields = {
			id: schema.experiments.id,
			experimentNumber: schema.experiments.experimentNumber,
			slug: schema.experiments.slug,
			title: schema.experiments.title,
			date: schema.experiments.date,
			bannerPath: schema.experiments.bannerPath,
			host: sql<string | null>`COALESCE(${schema.profiles.username}, ${schema.users.name})`
		};

		const baseQuery = () =>
			this.db
				.select(selectFields)
				.from(schema.experiments)
				.leftJoin(schema.users, eq(schema.users.id, schema.experiments.hostUserId!))
				.leftJoin(schema.profiles, eq(schema.profiles.userId, schema.experiments.hostUserId!));

		try {
			// 1. Full-phrase ILIKE
			const rows = await baseQuery()
				.where(ilike(schema.experiments.title!, `%${query}%`))
				.orderBy(desc(schema.experiments.date))
				.limit(10);

			if (rows.length > 0) {
				return (rows as ExperimentRow[]).map((row) => this.mapExperimentRow(row, []));
			}

			// 2. Multi-token fallback: every significant word must appear in the title
			const tokens = query
				.split(/\s+/)
				.map((t) => t.trim())
				.filter((t) => t.length > 2);

			if (tokens.length > 1) {
				const conditions = tokens.map((t) => ilike(schema.experiments.title!, `%${t}%`));
				const tokenRows = await baseQuery()
					.where(and(...conditions))
					.orderBy(desc(schema.experiments.date))
					.limit(10);

				if (tokenRows.length > 0) {
					return (tokenRows as ExperimentRow[]).map((row) => this.mapExperimentRow(row, []));
				}
			}

			return [];
		} catch (error: unknown) {
			logger.error(`[BadMoviesDb] searchExperiments failed: ${formatDbError(error)}`);
			return [];
		}
	}

	private mapMovieRow(row: MovieRow): NormalizedMovie {
		return {
			id: String(row.id),
			slug: row.slug ?? undefined,
			title: row.title,
			year: row.year ?? 'Unknown',
			description: row.description ?? '',
			url: `https://badmovies.co/movies/${row.slug}`,
			posterUrl: prefixUrl(row.posterPath),
			rating:
				row.voteAverage != null
					? String(row.voteAverage)
					: row.imdbRating != null
						? String(row.imdbRating)
						: undefined,
			budget: row.budget != null ? Number(row.budget) : undefined,
			revenue: row.revenue != null ? Number(row.revenue) : undefined,
			runtime: row.runtime != null ? String(row.runtime) : undefined,
			source: 'badmovies'
		};
	}

	private mapFullMovieRow(row: FullMovieRow): NormalizedMovie {
		return {
			id: String(row.id),
			slug: row.slug ?? undefined,
			title: row.title,
			year: row.year ?? 'Unknown',
			releaseDate: row.releaseDate ?? undefined,
			description: row.description ?? '',
			tagline: row.tagline ?? undefined,
			url: `https://badmovies.co/movies/${row.slug}`,
			posterUrl: prefixUrl(row.posterPath),
			trailerUrl: row.trailerUrl ?? undefined,
			budget: row.budget != null ? Number(row.budget) : undefined,
			revenue: row.revenue != null ? Number(row.revenue) : undefined,
			imdbId: row.imdbId ?? undefined,
			tmdbId: row.tmdbId != null ? String(row.tmdbId) : undefined,
			imdbRating: row.imdbRating != null ? String(row.imdbRating) : undefined,
			imdbVotes: row.imdbVotes != null ? String(row.imdbVotes) : undefined,
			rating: row.voteAverage != null ? String(row.voteAverage) : undefined,
			mpaaRating: row.contentRating ?? undefined,
			runtime: row.runtime != null ? String(row.runtime) : undefined,
			genres: row.genres ?? undefined,
			studio: row.studio ?? undefined,
			director: row.director ?? undefined,
			actors: row.actors ?? undefined,
			writers: row.writers ?? undefined,
			reviewCount: row.reviewCount ?? 0,
			quoteCount: row.quoteCount ?? 0,
			source: 'badmovies'
		};
	}

	private mapExperimentRow(
		row: ExperimentRow,
		movies: { id: string; title: string; year?: string; posterUrl?: string }[]
	): NormalizedExperiment {
		const dateStr = row.date ? new Date(row.date).toISOString().slice(0, 10) : 'Unknown';
		return {
			name: row.title ?? `Experiment #${row.id}`,
			date: dateStr,
			result: `${movies.length} movie${movies.length !== 1 ? 's' : ''} watched`,
			notes: row.host ? `Hosted by ${row.host}` : 'Community experiment',
			movies,
			bannerUrl: experimentBannerUrl(row),
			host: row.host ?? undefined,
			url: row.slug ? `https://badmovies.co/${row.slug}` : undefined
		};
	}

	private mapReviewRow(row: ReviewRow): NormalizedReview {
		return {
			id: String(row.id),
			movieTitle: row.movieTitle,
			movieSlug: row.movieSlug,
			movieYear: row.movieYear ?? undefined,
			posterUrl: prefixUrl(row.posterPath),
			reviewerName: row.reviewerName ?? 'Anonymous',
			content: row.content ?? '',
			weightedScore: computeWeightedScore(row),
			ratingGood: Number(row.ratingGood ?? 0),
			ratingEntertainment: Number(row.ratingEntertainment ?? 0),
			ratingSoBadItsGood: Number(row.ratingSoBadItsGood ?? 0),
			ratingMemePotential: Number(row.ratingMemePotential ?? 0),
			status: row.status ?? 'pending',
			createdAt: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : ''
		};
	}

	private mapQuoteRow(row: QuoteRow): NormalizedQuoteDetailed {
		return {
			id: String(row.id),
			text: row.text ?? '',
			movie: row.movie,
			movieSlug: row.movieSlug ?? undefined,
			year: row.year ?? 'N/A',
			character: row.character ?? undefined,
			actor: row.actor ?? undefined,
			context: row.context ?? undefined,
			isMemorable: Boolean(row.isMemorable),
			likes: row.likes ?? 0,
			status: row.status ?? 'approved',
			createdAt: row.createdAt ?? undefined
		};
	}
}
