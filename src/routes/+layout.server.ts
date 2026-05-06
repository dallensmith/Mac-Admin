import { redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { account } from '$lib/server/db/schema';
import { checkGuildMemberAccess, getGuildStats } from '$lib/server/discord';

export const load: LayoutServerLoad = async ({ locals, url, request }) => {
	if (url.pathname === '/login') {
		return { user: locals.user, discordRole: null, guildStats: null };
	}

	if (!locals.user) {
		redirect(302, '/login');
	}

	// Look up the Discord account ID stored by better-auth
	const discordAccount = await db.query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'discord'))
	});

	if (!discordAccount) {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, '/login');
	}

	// Run access check and guild stats in parallel
	const [accessResult, guildStats] = await Promise.allSettled([
		checkGuildMemberAccess(discordAccount.accountId),
		getGuildStats()
	]);

	// Deny if role check threw or returned allowed = false
	if (
		accessResult.status === 'rejected' ||
		(accessResult.status === 'fulfilled' && !accessResult.value.allowed)
	) {
		await auth.api.signOut({ headers: request.headers });
		redirect(302, '/login');
	}

	const discordRole =
		accessResult.status === 'fulfilled' ? accessResult.value.topRoleName : 'Member';
	const stats = guildStats.status === 'fulfilled' ? guildStats.value : null;

	return { user: locals.user, discordRole, guildStats: stats };
};
