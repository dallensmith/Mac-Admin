import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

export const USERS_COLLECTION = 'ma_users';

/** Create a fresh PocketBase instance. Call once per request. */
export function createPb(): PocketBase {
	return new PocketBase(env.POCKETBASE_URL);
}

// Module-level admin token cache — survives across requests
let _adminToken = '';
let _adminTokenExpiry = 0;

/**
 * Create a PocketBase instance authenticated as superuser.
 * Uses POCKETBASE_SUPERUSER_EMAIL + POCKETBASE_SUPERUSER_PASSWORD env vars.
 * Token is cached for 23 hours to avoid re-authenticating every request.
 */
export async function createAdminPb(): Promise<PocketBase> {
	const email = env.POCKETBASE_SUPERUSER_EMAIL;
	const password = env.POCKETBASE_SUPERUSER_PASSWORD;
	if (!email || !password) {
		throw new Error('POCKETBASE_SUPERUSER_EMAIL and POCKETBASE_SUPERUSER_PASSWORD must be set');
	}
	const pb = new PocketBase(env.POCKETBASE_URL);
	if (_adminToken && Date.now() < _adminTokenExpiry) {
		pb.authStore.save(_adminToken, null);
	} else {
		await pb.collection('_superusers').authWithPassword(email, password);
		_adminToken = pb.authStore.token;
		_adminTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
	}
	return pb;
}
