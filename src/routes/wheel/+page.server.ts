import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function wheelCollection(): string {
	return 'sm_wheel';
}

export interface WheelEntry {
	id: string;
	title: string;
	year: string;
	tmdbId: string;
	imdbId: string;
	suggestedBy: string;
	voters: string;
	created: string;
	updated: string;
}

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.user) redirect(302, '/login');

	const { discordUserId } = await parent();

	const entries = await locals.adminPb
		.collection(wheelCollection())
		.getFullList<WheelEntry>({ sort: '-created' });

	return { entries, discordUserId };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const title = data.get('title');
		if (!title || typeof title !== 'string' || !title.trim()) {
			return fail(422, { error: 'Title is required.' });
		}

		const payload = {
			title: title.trim(),
			year: (data.get('year') as string | null)?.trim() ?? '',
			tmdbId: (data.get('tmdbId') as string | null)?.trim() ?? '',
			imdbId: (data.get('imdbId') as string | null)?.trim() ?? '',
			suggestedBy: (data.get('suggestedBy') as string | null)?.trim() ?? '',
			voters: ''
		};

		try {
			await locals.adminPb.collection(wheelCollection()).create(payload);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[wheel] create failed:', message);
			return fail(500, { error: 'Failed to add entry. Please try again.' });
		}

		return { success: true };
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'Entry ID missing.' });

		const title = data.get('title');
		if (!title || typeof title !== 'string' || !title.trim()) {
			return fail(422, { error: 'Title is required.' });
		}

		const payload = {
			title: title.trim(),
			year: (data.get('year') as string | null)?.trim() ?? '',
			tmdbId: (data.get('tmdbId') as string | null)?.trim() ?? '',
			imdbId: (data.get('imdbId') as string | null)?.trim() ?? '',
			suggestedBy: (data.get('suggestedBy') as string | null)?.trim() ?? ''
		};

		try {
			await locals.adminPb.collection(wheelCollection()).update(id, payload);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[wheel] update failed:', message);
			return fail(500, { error: 'Failed to update entry. Please try again.' });
		}

		return { success: true };
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'Entry ID missing.' });

		try {
			await locals.adminPb.collection(wheelCollection()).delete(id);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[wheel] delete failed:', message);
			return fail(500, { error: 'Failed to delete entry. Please try again.' });
		}

		return { success: true };
	}
};
