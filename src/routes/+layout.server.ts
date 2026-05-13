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

	// Check access synchronously (whitelist-only), fetch guild stats async
	const accessResult = checkGuildMemberAccess(discordUserId);
	const guildStatsResult = await getGuildStats();

	// Deny if not in ADMIN_DISCORD_USER_IDS whitelist
	if (!accessResult.allowed) {
		console.warn('[layout] Access denied for discordUserId=%s', discordUserId);
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_profile', { path: '/' });
		redirect(302, '/login?error=access_denied');
	}

	return {
		user: locals.user,
		discordRole: accessResult.topRoleName,
		guildStats: guildStatsResult,
		discordUserId
	};
};
