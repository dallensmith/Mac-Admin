import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [leaderboardRecords, sessionsPage] = await Promise.all([
		locals.adminPb.collection('sm_game_leaderboard').getFullList({ sort: '-points' }),
		locals.adminPb.collection('sm_game_sessions').getList(1, 50, { sort: '-started_at' })
	]);

	const activeSessions = leaderboardRecords.length; // players in leaderboard
	const activeSessionCount = sessionsPage.items.filter(
		(s) => s.state === 'starting' || s.state === 'in_progress'
	).length;

	return {
		leaderboard: leaderboardRecords,
		sessions: sessionsPage.items,
		totalPlayers: leaderboardRecords.length,
		activeSessionCount
	};
};
