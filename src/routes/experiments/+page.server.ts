import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	// Use sm_experiments_search_cache from PocketBase for listing
	const experiments = await locals.adminPb
		.collection('sm_experiments_search_cache')
		.getFullList({ sort: '-date' });

	return { experiments };
};
