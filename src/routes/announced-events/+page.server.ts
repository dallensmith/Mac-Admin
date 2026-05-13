import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const events = await locals.adminPb
		.collection('sm_announced_events')
		.getFullList({ sort: '-announced_at' });

	return { events };
};
