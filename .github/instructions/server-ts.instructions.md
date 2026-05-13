---
description: 'Use when writing or editing SvelteKit server modules: load functions, form actions, API routes, hooks, or any server-side logic. Enforces environment variable safety, auth guards, Drizzle query patterns, and form action conventions.'
applyTo: 'src/**/*.server.ts'
---

# Server Module Rules

## Environment Variables

Always use SvelteKit's env modules — never `process.env` directly.

| Secret / server-only | `$env/static/private` (build-time) or `$env/dynamic/private` (runtime) |
| -------------------- | ---------------------------------------------------------------------- |
| Public / client-safe | `$env/static/public` or `$env/dynamic/public`                          |

```ts
// ✅
import { DATABASE_URL } from '$env/static/private';

// ❌
const url = process.env.DATABASE_URL;
```

**Never** import `$env/static/private` or `$env/dynamic/private` from:

- `.svelte` component files
- `+page.ts` or `+layout.ts` (run on both server and client)
- Any module that may be imported client-side

## Auth Guard (PocketBase)

`locals.user` is set by the PocketBase cookie handler in `hooks.server.ts`. A PocketBase RecordModel is attached to every request via `event.locals.pb` (user-scoped) and `event.locals.adminPb` (superuser-scoped). Check `locals.user` at the top of every `load()` and action that requires authentication.

```ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	// ...
};
```

For admin-only routes, verify the Discord user ID against the `ADMIN_DISCORD_USER_IDS` whitelist using `checkGuildMemberAccess()` from `$lib/server/discord`.

```ts
import { checkGuildMemberAccess } from '$lib/server/discord';

if (!locals.user) redirect(302, '/login');
const discordId = locals.user.discord_id;
if (!discordId || !checkGuildMemberAccess(discordId).allowed) redirect(302, '/');
```

Use `locals.adminPb` for PocketBase admin operations (e.g., managing wheel candidates, bot reports) — it authenticates as the superuser configured in `POCKETBASE_SUPERUSER_EMAIL`/`POCKETBASE_SUPERUSER_PASSWORD`.

## Drizzle Queries (badmovies.co read-only)

Import the `badMoviesDb` singleton from `$lib/server/badmovies-db` and schema tables from `$types/schema`. The badmovies database is **read-only** — only `SELECT` queries are supported.

```ts
import { badMoviesDb } from '$lib/server/badmovies-db';
import * as schema from '$types/schema';
import { eq, ilike, sql } from 'drizzle-orm';

const movie = await badMoviesDb.getMovie(params.slug);
```

- Use the `BadMoviesDbClient` methods (e.g. `getMovie()`, `searchMovies()`, `getExperiments()`) — they include built-in caching
- For direct Drizzle queries, use `badMoviesDb['db']` (the underlying `NodePgDatabase`) with `db.select()`, `db.execute()`, or `db.query.*`
- Schema tables live in `src/types/schema.ts` (28 tables mirroring the badmovies.co archive)
- No write operations, no migrations — the database is frozen and externally managed

## Form Actions

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const title = data.get('title');

		if (!title || typeof title !== 'string') {
			return fail(422, { title, error: 'Title is required' });
		}

		// mutate...
		redirect(303, '/movies');
	}
};
```

- Return `fail(status, data)` for validation/business errors (client sees `form` prop)
- Use `redirect(303, path)` after successful mutations
- Use `error(status, message)` from `@sveltejs/kit` for unexpected/fatal errors

## Types

Always annotate `load` and `actions` with generated types from `./$types`:

```ts
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => { ... };
export const actions: Actions = { ... };
```
