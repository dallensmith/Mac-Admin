import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const COLLECTION = 'sm_button_actions';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const buttonActions = await locals.adminPb.collection(COLLECTION).getFullList({ sort: 'name' });

	return { buttonActions };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		try {
			await locals.adminPb.collection(COLLECTION).create({
				action_key: `action_${Date.now()}`,
				name: 'New Button Action',
				description: '',
				action_type: '',
				params_template: '{}',
				response_template_key: '',
				enabled: true
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to create button action: ${message}` });
		}
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		try {
			await locals.adminPb.collection(COLLECTION).update(id, {
				action_key: data.get('action_key') ?? '',
				name: data.get('name') ?? '',
				description: data.get('description') ?? '',
				action_type: data.get('action_type') ?? '',
				params_template: data.get('params_template') ?? '{}',
				response_template_key: data.get('response_template_key') ?? '',
				enabled: data.get('enabled') === 'true'
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to save button action: ${message}` });
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
			return fail(500, { error: `Failed to delete button action: ${message}` });
		}
	}
};
