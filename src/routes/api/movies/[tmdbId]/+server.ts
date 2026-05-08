import { TMDB_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const { tmdbId } = params;
	if (!tmdbId || !/^\d+$/.test(tmdbId)) error(400, 'Invalid TMDb ID');

	const res = await fetch(
		`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
	);
	if (!res.ok) error(502, 'TMDb movie lookup failed');

	const data = await res.json();

	const imdbId: string | null =
		typeof data.external_ids?.imdb_id === 'string' && data.external_ids.imdb_id.length > 0
			? data.external_ids.imdb_id
			: null;

	const posterPath: string | null =
		typeof data.poster_path === 'string' && data.poster_path.length > 0
			? data.poster_path
			: null;

	return json({ imdbId, posterPath });
};
