import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	signOut: async ({ locals, cookies }) => {
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_profile', { path: '/' });
		redirect(302, '/login');
	}
};
