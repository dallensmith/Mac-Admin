import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { USERS_COLLECTION } from '$lib/server/auth';
import { checkGuildMemberAccess, getGuildStats } from '$lib/server/discord';

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
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
	} catch (e) {
		console.error('[layout] listExternalAuths failed:', e);
		discordUserId = null;
	}

	if (!discordUserId) {
		console.warn('[layout] No Discord external auth linked — clearing session');
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_profile', { path: '/' });
		redirect(302, '/login?error=no_discord_link');
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
		const reason =
			accessResult.status === 'rejected'
				? String(accessResult.reason)
				: 'allowed=false (not in whitelist and no ADMINISTRATOR role)';
		console.warn('[layout] Access denied for discordUserId=%s — %s', discordUserId, reason);
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_profile', { path: '/' });
		redirect(302, '/login?error=access_denied');
	}

	const discordRole =
		accessResult.status === 'fulfilled' ? accessResult.value.topRoleName : 'Member';
	const stats = guildStats.status === 'fulfilled' ? guildStats.value : null;

	return { user: locals.user, discordRole, guildStats: stats, discordUserId };
};
