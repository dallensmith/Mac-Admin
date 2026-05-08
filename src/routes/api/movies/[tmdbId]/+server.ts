import { TMDB_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const { tmdbId } = params;
	if (!tmdbId || !/^\d+$/.test(tmdbId)) error(400, 'Invalid TMDb ID');

	const res = await fetch(
		`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
	);
	if (!res.ok) error(502, 'TMDb external_ids lookup failed');

	const data = await res.json();
	const imdbId: string | null =
		typeof data.imdb_id === 'string' && data.imdb_id.length > 0 ? data.imdb_id : null;

	return json({ imdbId });
};
