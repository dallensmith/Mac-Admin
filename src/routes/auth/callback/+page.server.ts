import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { USERS_COLLECTION } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

const CALLBACK_URL = `${env.ORIGIN}/auth/callback`;

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const codeVerifier = cookies.get('pb_code_verifier');

	if (!code || !state || !codeVerifier) {
		error(400, 'Missing OAuth2 parameters.');
	}

	try {
		const authData = await locals.pb
			.collection(USERS_COLLECTION)
			.authWithOAuth2Code('discord', code, codeVerifier, CALLBACK_URL);

		const name = authData.meta?.name ?? authData.meta?.username ?? '';
		const avatar = authData.meta?.avatarUrl ?? null;

		// pb_auth holds the token + bare PocketBase record
		cookies.set(
			'pb_auth',
			JSON.stringify({ token: authData.token, record: authData.record }),
			{ path: '/', httpOnly: true, secure: false, sameSite: 'lax' }
		);

		// pb_profile holds Discord display info separately — survives authRefresh() overwriting the record
		cookies.set(
			'pb_profile',
			JSON.stringify({ name, avatar }),
			{ path: '/', httpOnly: true, secure: false, sameSite: 'lax' }
		);
	} catch (e) {
		console.error('[callback] authWithOAuth2Code failed:', e);
		redirect(302, '/login');
	}

	cookies.delete('pb_code_verifier', { path: '/' });
	redirect(302, '/');
};
