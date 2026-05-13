import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const today = new Date().toISOString().slice(0, 10);

	const [dailyCostRecord, botStatusRecord, moviesCache, experimentsCache, peopleCache] =
		await Promise.allSettled([
			locals.adminPb
				.collection('sm_global_usage')
				.getFirstListItem(`date='${today}'`, { requestKey: null }),
			locals.adminPb
				.collection('sm_monitor_state')
				.getFirstListItem("key='status'", { requestKey: null }),
			locals.adminPb.collection('sm_movies_search_cache').getList(1, 1),
			locals.adminPb.collection('sm_experiments_search_cache').getList(1, 1),
			locals.adminPb.collection('sm_people_search_cache').getList(1, 1)
		]);

	return {
		dailyCost:
			dailyCostRecord.status === 'fulfilled' ? (dailyCostRecord.value.total_cost as number) : null,
		botStatus:
			botStatusRecord.status === 'fulfilled' ? (botStatusRecord.value.value as string) : null,
		cacheStats: {
			movies: moviesCache.status === 'fulfilled' ? moviesCache.value.totalItems : null,
			experiments: experimentsCache.status === 'fulfilled' ? experimentsCache.value.totalItems : null,
			people: peopleCache.status === 'fulfilled' ? peopleCache.value.totalItems : null
		}
	};
};

export const actions: Actions = {
	signOut: async ({ locals, cookies }) => {
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_profile', { path: '/' });
		redirect(302, '/login');
	}
};
