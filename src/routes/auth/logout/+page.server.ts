import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, cookies }) => {
	locals.pb.authStore.clear();
	cookies.delete('pb_auth', { path: '/' });
	cookies.delete('pb_profile', { path: '/' });
	redirect(302, '/login');
};
