import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const COLLECTION = 'sm_discord_templates';
const ACTIONS_COLLECTION = 'sm_button_actions';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [templates, buttonActions] = await Promise.all([
		locals.adminPb.collection(COLLECTION).getFullList({ sort: 'name' }),
		locals.adminPb.collection(ACTIONS_COLLECTION).getFullList({ sort: 'name' })
	]);

	return { templates, buttonActions };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		try {
			await locals.adminPb.collection(COLLECTION).create({
				template_key: `template_${Date.now()}`,
				name: 'New Template',
				description: '',
				title_format: '{{movie.title}} ({{movie.year}})',
				description_format: '{{movie.overview}}',
				accent_color: '#0ea5e9',
				footer_text: 'Smart Mac Archive Lookup | Requested by {{user}}',
				thumbnail_enabled: true,
				image_enabled: false,
				timestamp_enabled: true,
				show_director: true,
				show_actors: true,
				show_rating: true,
				show_genres: false,
				buttons: '[]'
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to create template: ${message}` });
		}
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		try {
			await locals.adminPb.collection(COLLECTION).update(id, {
				template_key: data.get('template_key') ?? '',
				name: data.get('name') ?? '',
				description: data.get('description') ?? '',
				title_format: data.get('title_format') ?? '',
				description_format: data.get('description_format') ?? '',
				accent_color: data.get('accent_color') ?? '#0ea5e9',
				footer_text: data.get('footer_text') ?? '',
				thumbnail_enabled: data.get('thumbnail_enabled') === 'true',
				image_enabled: data.get('image_enabled') === 'true',
				timestamp_enabled: data.get('timestamp_enabled') === 'true',
				show_director: data.get('show_director') === 'true',
				show_actors: data.get('show_actors') === 'true',
				show_rating: data.get('show_rating') === 'true',
				show_genres: data.get('show_genres') === 'true',
				buttons: data.get('buttons') ?? '[]'
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to save template: ${message}` });
		}
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		try {
			await locals.adminPb.collection(COLLECTION).delete(id);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to delete template: ${message}` });
		}
	}
};
