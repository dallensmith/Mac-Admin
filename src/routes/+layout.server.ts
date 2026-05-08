import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { USERS_COLLECTION } from '$lib/server/auth';
import { checkGuildMemberAccess, getGuildStats } from '$lib/server/discord';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (url.pathname === '/login' || url.pathname.startsWith('/auth/')) {
		return { user: locals.user, discordRole: null, guildStats: null };
	}

	if (!locals.user) {
		redirect(302, '/login');
	}

	// Look up the Discord external auth linked to this user
	let discordUserId: string | null = null;
	try {
		const externalAuths = await locals.pb
			.collection(USERS_COLLECTION)
			.listExternalAuths(locals.user.id);
		const discordAuth = externalAuths.find((a) => a.provider === 'discord');
		discordUserId = discordAuth?.providerId ?? null;
	} catch {
		discordUserId = null;
	}

	if (!discordUserId) {
		locals.pb.authStore.clear();
		redirect(302, '/login');
	}

	// Run access check and guild stats in parallel
	const [accessResult, guildStats] = await Promise.allSettled([
		checkGuildMemberAccess(discordUserId),
		getGuildStats()
	]);

	// Deny if role check threw or returned allowed = false
	if (
		accessResult.status === 'rejected' ||
		(accessResult.status === 'fulfilled' && !accessResult.value.allowed)
	) {
		locals.pb.authStore.clear();
		redirect(302, '/login');
	}

	const discordRole =
		accessResult.status === 'fulfilled' ? accessResult.value.topRoleName : 'Member';
	const stats = guildStats.status === 'fulfilled' ? guildStats.value : null;

	return { user: locals.user, discordRole, guildStats: stats, discordUserId };
};
