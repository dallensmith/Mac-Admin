import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	// Fetch without sort — PocketBase has a bug where sorting by updated/created
	// returns 400 after a fresh Docker volume creation. Sort client-side instead.
	const result = await locals.adminPb.collection('sm_instruction_sets').getList(1, 10000);
	const templates = result.items.sort((a, b) => {
		const au = typeof a.updated === 'string' ? a.updated : '';
		const bu = typeof b.updated === 'string' ? b.updated : '';
		return bu.localeCompare(au);
	});

	return { templates };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		await locals.adminPb.collection('sm_instruction_sets').create({
			name: 'New Profile',
			description: '',
			is_active: false,
			is_default: false,
			system: '',
			behavior: '',
			resources: '',
			conversation_rules: '',
			response_templates: '',
			trigger_phrases: '',
			custom_rules: '',
			output_discipline: '',
			addendum: ''
		});
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const existing = await locals.adminPb.collection('sm_instruction_sets').getOne(id);
		if (existing.is_default) return fail(403, { error: 'Cannot edit the default profile' });

		await locals.adminPb.collection('sm_instruction_sets').update(id, {
			name: data.get('name') ?? '',
			description: data.get('description') ?? '',
			system: data.get('system') ?? '',
			behavior: data.get('behavior') ?? '',
			resources: data.get('resources') ?? '',
			conversation_rules: data.get('conversation_rules') ?? '',
			response_templates: data.get('response_templates') ?? '',
			trigger_phrases: data.get('trigger_phrases') ?? '',
			custom_rules: data.get('custom_rules') ?? '',
			output_discipline: data.get('output_discipline') ?? '',
			addendum: data.get('addendum') ?? ''
		});
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const record = await locals.adminPb.collection('sm_instruction_sets').getOne(id);
		if (record.is_default) {
			return fail(422, { error: 'Cannot delete the default profile' });
		}
		if (record.is_active) {
			return fail(422, { error: 'Cannot delete the active template' });
		}

		await locals.adminPb.collection('sm_instruction_sets').delete(id);
	},

	setActive: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const all = await locals.adminPb.collection('sm_instruction_sets').getFullList();
		for (const t of all) {
			if (t.id === id) {
				await locals.adminPb.collection('sm_instruction_sets').update(t.id, { is_active: true });
			} else if (t.is_active) {
				await locals.adminPb.collection('sm_instruction_sets').update(t.id, { is_active: false });
			}
		}
	},

	duplicate: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const source = await locals.adminPb.collection('sm_instruction_sets').getOne(id);
		await locals.adminPb.collection('sm_instruction_sets').create({
			name: source.name + ' (Copy)',
			description: source.description ?? '',
			is_active: false,
			is_default: false,
			system: source.system ?? '',
			behavior: source.behavior ?? '',
			resources: source.resources ?? '',
			conversation_rules: source.conversation_rules ?? '',
			response_templates: source.response_templates ?? '',
			trigger_phrases: source.trigger_phrases ?? '',
			custom_rules: source.custom_rules ?? '',
			output_discipline: source.output_discipline ?? '',
			addendum: source.addendum ?? ''
		});
	}
};
