import type { Handle } from '@sveltejs/kit';
import { createPb, createAdminPb, USERS_COLLECTION } from '$lib/server/auth';
import { ensureAllCollections, seedDefaultData } from '$lib/server/pocketbase-setup';

let initialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	const pb = createPb();

	// Load auth from cookie — hook only reads, routes are responsible for writing
	const rawCookie = event.cookies.get('pb_auth');
	if (rawCookie) {
		try {
			const { token, record } = JSON.parse(rawCookie);
			pb.authStore.save(token, record);
		} catch {
			// ignore malformed cookie
		}
	}

	// Attempt to refresh — clears store if token is invalid/expired
	// Note: authRefresh() overwrites pb.authStore.record with the bare PocketBase record,
	// losing any injected fields (name, avatar). We restore them from pb_profile below.
	if (pb.authStore.isValid) {
		try {
			await pb.collection(USERS_COLLECTION).authRefresh();
		} catch {
			pb.authStore.clear();
		}
	}

	event.locals.pb = pb;
	event.locals.adminPb = await createAdminPb();

	// One-time PocketBase collection setup + seeding on first request
	if (!initialized) {
		initialized = true;
		const adminPb = event.locals.adminPb;
		// Fire-and-forget: ensure collections first, then seed (order matters)
		(async () => {
			try {
				await ensureAllCollections(adminPb);
				await seedDefaultData(adminPb);
			} catch (err) {
				console.error('[hooks] PocketBase setup failed:', err);
			}
		})();
	}

	if (pb.authStore.isValid) {
		// Restore display fields from the separate profile cookie
		const rawProfile = event.cookies.get('pb_profile');
		let profile: { name?: string; avatar?: string | null } = {};
		if (rawProfile) {
			try {
				profile = JSON.parse(rawProfile);
			} catch {
				/* ignore */
			}
		}
		event.locals.user = {
			...(pb.authStore.record as App.Locals['user']),
			...profile
		} as App.Locals['user'];
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
