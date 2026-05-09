import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { badMoviesDb } from '$lib/server/badmovies-db.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [reviews, quotes] = await Promise.all([
		badMoviesDb.getAllReviews(50),
		badMoviesDb.getAllQuotes(50)
	]);

	return { reviews, quotes };
};
