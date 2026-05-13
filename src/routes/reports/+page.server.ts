import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const reports = await locals.adminPb
		.collection('sm_bot_reports')
		.getFullList({ sort: '-created_at' });

	return { reports };
};
