import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

export const USERS_COLLECTION = 'ma_users';

/** Create a fresh PocketBase instance. Call once per request. */
export function createPb(): PocketBase {
	return new PocketBase(env.POCKETBASE_URL);
}
