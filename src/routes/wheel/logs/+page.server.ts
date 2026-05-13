import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const logs = await locals.adminPb
		.collection('sm_wheel_logs')
		.getFullList({ sort: '-timestamp' });

	return { logs };
};
