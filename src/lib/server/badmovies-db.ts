import {
	BADMOVIES_PGHOST,
	BADMOVIES_PGPORT,
	BADMOVIES_PGDATABASE,
	BADMOVIES_PGUSER,
	BADMOVIES_PGPASSWORD,
	BADMOVIES_PGSSL
} from '$env/static/private';
import { Pool } from 'pg';
import { BadMoviesDbClient } from '$lib/badmovies-db.js';
import { CacheManager } from '$lib/cache-manager.js';

const ssl = BADMOVIES_PGSSL !== 'false';

const pool = new Pool({
	host: BADMOVIES_PGHOST,
	port: Number(BADMOVIES_PGPORT),
	database: BADMOVIES_PGDATABASE,
	user: BADMOVIES_PGUSER,
	password: BADMOVIES_PGPASSWORD,
	max: 5,
	ssl: ssl ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
	console.error('[BadMoviesDb] Idle client error:', err.message);
});

export const badMoviesDb = new BadMoviesDbClient(
	{
		host: BADMOVIES_PGHOST,
		port: Number(BADMOVIES_PGPORT),
		database: BADMOVIES_PGDATABASE,
		user: BADMOVIES_PGUSER,
		password: BADMOVIES_PGPASSWORD,
		ssl
	},
	new CacheManager(3600)
);

/**
 * Returns true if the movie (identified by TMDb ID) has appeared in any
 * Bad Movies experiment — i.e. it has already been watched.
 */
export async function isMovieWatched(tmdbId: string): Promise<boolean> {
	const numericId = Number(tmdbId);
	if (!Number.isInteger(numericId) || numericId <= 0) return false;

	try {
		const result = await pool.query<{ exists: boolean }>(
			`SELECT EXISTS (
				SELECT 1
				FROM movies m
				INNER JOIN experiment_movies em ON em.movie_id = m.id
				WHERE m.tmdb_id = $1
			) AS exists`,
			[numericId]
		);
		return result.rows[0]?.exists ?? false;
	} catch (err) {
		console.error('[BadMoviesDb] isMovieWatched error:', err instanceof Error ? err.message : err);
		// Fail open — don't block adds if the DB is unreachable
		return false;
	}
}
