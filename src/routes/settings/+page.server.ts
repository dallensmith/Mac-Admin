import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [moviesCache, experimentsCache, peopleCache] = await Promise.allSettled([
		locals.adminPb.collection('sm_movies_search_cache').getList(1, 1),
		locals.adminPb.collection('sm_experiments_search_cache').getList(1, 1),
		locals.adminPb.collection('sm_people_search_cache').getList(1, 1)
	]);

	let pbHealth = 'Unknown';
	try {
		await locals.adminPb.health.check();
		pbHealth = 'Connected';
	} catch {
		pbHealth = 'Disconnected';
	}

	return {
		pbHealth,
		cacheStats: {
			movies: moviesCache.status === 'fulfilled' ? moviesCache.value.totalItems : null,
			experiments: experimentsCache.status === 'fulfilled' ? experimentsCache.value.totalItems : null,
			people: peopleCache.status === 'fulfilled' ? peopleCache.value.totalItems : null
		}
	};
};
