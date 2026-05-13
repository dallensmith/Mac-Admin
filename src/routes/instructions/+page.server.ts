import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [templates, sections, discordTemplates] = await Promise.all([
		locals.adminPb.collection('sm_instruction_sets').getFullList({ sort: '-updated' }),
		locals.adminPb
			.collection('sm_prompt_sections')
			.getFullList({ sort: 'instruction_set_id,order' }),
		locals.adminPb.collection('sm_discord_templates').getFullList({ sort: 'name' })
	]);

	return { templates, sections, discordTemplates };
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
			od_verbatim_rule: '',
			od_banned_starters: '',
			od_examples: '',
			od_extra_rules: '',
			addendum: ''
		});
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const record = await locals.adminPb.collection('sm_instruction_sets').getOne(id);
		if (record.is_default) return fail(422, { error: 'Cannot edit the default profile' });

		try {
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
				od_verbatim_rule: data.get('od_verbatim_rule') ?? '',
				od_banned_starters: data.get('od_banned_starters') ?? '',
				od_examples: data.get('od_examples') ?? '',
				od_extra_rules: data.get('od_extra_rules') ?? '',
				addendum: data.get('addendum') ?? ''
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[instructions] update failed:', message);
			return fail(500, { error: `Failed to save profile: ${message}` });
		}
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

		try {
			// Delete all sections for this profile first
			const orphanedSections = await locals.adminPb
				.collection('sm_prompt_sections')
				.getFullList({ filter: `instruction_set_id="${id}"` });
			for (const s of orphanedSections) {
				await locals.adminPb.collection('sm_prompt_sections').delete(s.id);
			}
			await locals.adminPb.collection('sm_instruction_sets').delete(id);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to delete profile: ${message}` });
		}
	},

	setActive: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const all = await locals.adminPb.collection('sm_instruction_sets').getFullList();
		try {
			for (const t of all) {
				if (t.id === id) {
					await locals.adminPb.collection('sm_instruction_sets').update(t.id, { is_active: true });
				} else if (t.is_active) {
					await locals.adminPb.collection('sm_instruction_sets').update(t.id, { is_active: false });
				}
			}
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[instructions] setActive failed:', message);
			return fail(500, {
				error:
					'Failed to update active profile. The bot may be in an inconsistent state — please reload and try again.'
			});
		}
	},

	duplicate: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const source = await locals.adminPb.collection('sm_instruction_sets').getOne(id);
		const newRecord = await locals.adminPb.collection('sm_instruction_sets').create({
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
			od_verbatim_rule: source.od_verbatim_rule ?? '',
			od_banned_starters: source.od_banned_starters ?? '',
			od_examples: source.od_examples ?? '',
			od_extra_rules: source.od_extra_rules ?? '',
			addendum: source.addendum ?? ''
		});

		// Duplicate prompt sections
		const sourceSections = await locals.adminPb
			.collection('sm_prompt_sections')
			.getFullList({ filter: `instruction_set_id="${id}"`, sort: 'order' });
		for (const s of sourceSections) {
			await locals.adminPb.collection('sm_prompt_sections').create({
				instruction_set_id: newRecord.id,
				section_id: s.section_id,
				label: s.label,
				content: s.content,
				order: s.order,
				enabled: s.enabled,
				condition: s.condition
			});
		}
	},

	// ── Prompt section actions ──────────────────────────────────────────────────

	createSection: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const instruction_set_id = data.get('instruction_set_id');
		if (!instruction_set_id || typeof instruction_set_id !== 'string')
			return fail(422, { error: 'instruction_set_id required' });

		const parentRecord = await locals.adminPb
			.collection('sm_instruction_sets')
			.getOne(instruction_set_id);
		if (parentRecord.is_default) return fail(422, { error: 'Cannot edit the default profile' });

		try {
			await locals.adminPb.collection('sm_prompt_sections').create({
				instruction_set_id,
				section_id: data.get('section_id') ?? '',
				label: data.get('label') ?? 'New Section',
				content: data.get('content') ?? '',
				order: Number(data.get('order') ?? 100),
				enabled: data.get('enabled') !== 'false',
				condition: data.get('condition') ?? 'always'
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to create section: ${message}` });
		}
	},

	updateSection: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const section = await locals.adminPb.collection('sm_prompt_sections').getOne(id);
		const parentRecord = await locals.adminPb
			.collection('sm_instruction_sets')
			.getOne(section.instruction_set_id);
		if (parentRecord.is_default) return fail(422, { error: 'Cannot edit the default profile' });

		try {
			await locals.adminPb.collection('sm_prompt_sections').update(id, {
				section_id: data.get('section_id') ?? '',
				label: data.get('label') ?? '',
				content: data.get('content') ?? '',
				order: Number(data.get('order') ?? 100),
				enabled: data.get('enabled') === 'true',
				condition: data.get('condition') ?? 'always'
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to update section: ${message}` });
		}
	},

	deleteSection: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const section = await locals.adminPb.collection('sm_prompt_sections').getOne(id);
		const parentRecord = await locals.adminPb
			.collection('sm_instruction_sets')
			.getOne(section.instruction_set_id);
		if (parentRecord.is_default) return fail(422, { error: 'Cannot edit the default profile' });

		try {
			await locals.adminPb.collection('sm_prompt_sections').delete(id);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to delete section: ${message}` });
		}
	},

	duplicateSectionsFromDefault: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const targetId = data.get('instruction_set_id');
		if (!targetId || typeof targetId !== 'string')
			return fail(422, { error: 'instruction_set_id required' });

		// Find the default profile
		const defaultProfile = await locals.adminPb
			.collection('sm_instruction_sets')
			.getFirstListItem('is_default=true');

		if (!defaultProfile) return fail(404, { error: 'Default profile not found' });

		const sourceSections = await locals.adminPb
			.collection('sm_prompt_sections')
			.getFullList({ filter: `instruction_set_id="${defaultProfile.id}"`, sort: 'order' });

		try {
			for (const s of sourceSections) {
				await locals.adminPb.collection('sm_prompt_sections').create({
					instruction_set_id: targetId,
					section_id: s.section_id,
					label: s.label,
					content: s.content,
					order: s.order,
					enabled: s.enabled,
					condition: s.condition
				});
			}
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { error: `Failed to duplicate sections: ${message}` });
		}
	}
};
