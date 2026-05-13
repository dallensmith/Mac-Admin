import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [wheelLogs, usageLogs] = await Promise.all([
		locals.adminPb
			.collection('sm_wheel_logs')
			.getFullList({ sort: '-timestamp' }),
		locals.adminPb
			.collection('sm_usage_logs')
			.getFullList({ sort: '-created' })
	]);

	return { wheelLogs, usageLogs };
};
