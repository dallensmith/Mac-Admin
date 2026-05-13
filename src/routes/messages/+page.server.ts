import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const sessions = await locals.adminPb
		.collection('sm_sessions')
		.getFullList({ sort: '-last_active' });

	const selectedSessionId = url.searchParams.get('session') ?? null;

	let messages: Record<string, unknown>[] = [];
	if (selectedSessionId) {
		messages = await locals.adminPb
			.collection('sm_messages')
			.getFullList({
				filter: `session_id='${selectedSessionId}'`,
				sort: '+created'
			});
	}

	return { sessions, messages, selectedSessionId };
};
