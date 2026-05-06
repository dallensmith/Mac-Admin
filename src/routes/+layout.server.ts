import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	// Temporarily disabled for UI scaffolding phase
	// if (!locals.user && url.pathname !== '/login') {
	// 	redirect(302, '/login');
	// }
	return { user: locals.user };
};
