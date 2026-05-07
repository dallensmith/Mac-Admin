import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const templates = await locals.pb.collection('sm_instruction_sets').getFullList({
		sort: '-updated'
	});

	return { templates };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		await locals.pb.collection('sm_instruction_sets').create({
			name: 'New Profile',
			description: '',
			is_active: false,
			is_default: false,
			system: '',
			behavior: '',
			resources: '',
			conversation_rules: '',
			response_templates: ''
		});
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		await locals.pb.collection('sm_instruction_sets').update(id, {
			name: data.get('name') ?? '',
			description: data.get('description') ?? '',
			system: data.get('system') ?? '',
			behavior: data.get('behavior') ?? '',
			resources: data.get('resources') ?? '',
			conversation_rules: data.get('conversation_rules') ?? '',
			response_templates: data.get('response_templates') ?? ''
		});
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const record = await locals.pb.collection('sm_instruction_sets').getOne(id);
		if (record.is_active) {
			return fail(422, { error: 'Cannot delete the active template' });
		}

		await locals.pb.collection('sm_instruction_sets').delete(id);
	},

	setActive: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const all = await locals.pb.collection('sm_instruction_sets').getFullList();
		for (const t of all) {
			if (t.id === id) {
				await locals.pb.collection('sm_instruction_sets').update(t.id, { is_active: true });
			} else if (t.is_active) {
				await locals.pb.collection('sm_instruction_sets').update(t.id, { is_active: false });
			}
		}
	},

	duplicate: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const source = await locals.pb.collection('sm_instruction_sets').getOne(id);
		await locals.pb.collection('sm_instruction_sets').create({
			name: source.name + ' (Copy)',
			description: source.description ?? '',
			is_active: false,
			is_default: false,
			system: source.system ?? '',
			behavior: source.behavior ?? '',
			resources: source.resources ?? '',
			conversation_rules: source.conversation_rules ?? '',
			response_templates: source.response_templates ?? ''
		});
	}
};
