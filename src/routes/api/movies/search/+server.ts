import { TMDB_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export interface MovieSearchResult {
	tmdbId: number;
	title: string;
	year: string;
	overview: string;
	posterPath: string | null;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const q = url.searchParams.get('q')?.trim() ?? '';
	if (!q) return json([]);

	const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=en-US&page=1&include_adult=false`;

	const res = await fetch(tmdbUrl);
	if (!res.ok) error(502, 'TMDb search failed');

	const data = await res.json();

	const results: MovieSearchResult[] = (data.results ?? [])
		.slice(0, 8)
		.map((m: Record<string, unknown>) => ({
			tmdbId: m.id as number,
			title: m.title as string,
			year: typeof m.release_date === 'string' && m.release_date.length >= 4
				? m.release_date.slice(0, 4)
				: '',
			overview: typeof m.overview === 'string' ? m.overview : '',
			posterPath: typeof m.poster_path === 'string' ? m.poster_path : null
		}));

	return json(results);
};
