import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function wheelCollection(): string {
	return 'sm_wheel';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const runs = await locals.adminPb
		.collection('sm_wheel_cleanup_runs')
		.getFullList({ sort: '-timestamp' });

	// Default to latest run for deletions display
	const selectedRunId = url.searchParams.get('run') ?? (runs.length > 0 ? runs[0].id : null);

	let deletions: Record<string, unknown>[] = [];
	if (selectedRunId) {
		deletions = await locals.adminPb
			.collection('sm_wheel_cleanup_deletions')
			.getFullList({
				filter: `run_id='${selectedRunId}'`,
				sort: '-title'
			});
	}

	return { runs, deletions, selectedRunId };
};

export const actions: Actions = {
	restoreDeletion: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const deletionId = data.get('deletionId');
		if (!deletionId || typeof deletionId !== 'string') {
			return fail(422, { error: 'Deletion ID is required.' });
		}

		try {
			const deletion = await locals.adminPb
				.collection('sm_wheel_cleanup_deletions')
				.getOne(deletionId);

			if (deletion.restored) {
				return fail(400, { error: 'This candidate has already been restored.' });
			}

			// Re-add the candidate to the wheel
			await locals.adminPb.collection(wheelCollection()).create({
				title: deletion.title ?? '',
				year: deletion.year ?? '',
				tmdbId: deletion.tmdb_id ?? '',
				imdbId: deletion.imdb_id ?? '',
				suggestedBy: deletion.added_by ?? '',
				voters: deletion.voters ?? ''
			});

			// Mark as restored
			await locals.adminPb
				.collection('sm_wheel_cleanup_deletions')
				.update(deletionId, { restored: true });

			return { success: true, message: `Restored "${deletion.title}" to the wheel.` };
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[cleanup] restoreDeletion failed:', message);
			return fail(500, { error: 'Failed to restore candidate.' });
		}
	}
};
