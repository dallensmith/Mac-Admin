import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { USERS_COLLECTION } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const users = await locals.adminPb
		.collection(USERS_COLLECTION)
		.getFullList({ sort: '-created' });

	return { users };
};
