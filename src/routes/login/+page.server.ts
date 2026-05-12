import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { USERS_COLLECTION } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

const CALLBACK_URL = `${env.ORIGIN}/auth/callback`;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(302, '/');

	const error = url.searchParams.get('error');
	const errorMessage =
		error === 'access_denied'
			? 'Access denied. Your Discord account does not have permission to access this panel.'
			: error === 'no_discord_link'
				? 'Could not verify your Discord account. Please try signing in again.'
				: null;

	return { errorMessage };
};

export const actions: Actions = {
	discord: async ({ locals, cookies }) => {
		const methods = await locals.pb.collection(USERS_COLLECTION).listAuthMethods();
		const discord = methods.oauth2?.providers?.find((p) => p.name === 'discord');

		if (!discord) {
			return { error: 'Discord OAuth is not configured in PocketBase.' };
		}

		cookies.set('pb_code_verifier', discord.codeVerifier, {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 60 * 5
		});

		redirect(302, discord.authURL + CALLBACK_URL);
	}
};
