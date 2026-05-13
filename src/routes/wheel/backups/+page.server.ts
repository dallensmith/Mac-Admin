import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function wheelCollection(): string {
	return 'sm_wheel';
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const backups = await locals.adminPb
		.collection('sm_wheel_backups')
		.getFullList({ sort: '-timestamp' });

	return { backups };
};

export const actions: Actions = {
	createBackup: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		try {
			const entries = await locals.adminPb
				.collection(wheelCollection())
				.getFullList();

			await locals.adminPb.collection('sm_wheel_backups').create({
				timestamp: new Date().toISOString(),
				backup_type: 'manual',
				candidate_count: entries.length,
				data: JSON.stringify(entries),
				triggered_by: locals.user.id ?? 'admin'
			});

			return { success: true, message: 'Backup created successfully.' };
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[backups] createBackup failed:', message);
			return fail(500, { error: 'Failed to create backup.' });
		}
	},

	restore: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const backupId = data.get('backupId');
		if (!backupId || typeof backupId !== 'string') {
			return fail(422, { error: 'Backup ID is required.' });
		}

		try {
			// Fetch the backup record
			const backup = await locals.adminPb
				.collection('sm_wheel_backups')
				.getOne(backupId);

			const backupData = JSON.parse(backup.data as string) as Record<string, unknown>[];

			// Clear all current wheel entries
			const currentEntries = await locals.adminPb
				.collection(wheelCollection())
				.getFullList();
			for (const entry of currentEntries) {
				await locals.adminPb.collection(wheelCollection()).delete(entry.id);
			}

			// Restore from backup
			for (const entry of backupData) {
				await locals.adminPb.collection(wheelCollection()).create({
					title: entry.title ?? '',
					year: entry.year ?? '',
					tmdbId: entry.tmdbId ?? '',
					imdbId: entry.imdbId ?? '',
					suggestedBy: entry.suggestedBy ?? '',
					voters: entry.voters ?? ''
				});
			}

			return {
				success: true,
				message: `Restored ${backupData.length} candidates from backup.`
			};
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[backups] restore failed:', message);
			return fail(500, { error: 'Failed to restore from backup.' });
		}
	}
};
