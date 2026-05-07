import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			pb: PocketBase;
			user: RecordModel | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
