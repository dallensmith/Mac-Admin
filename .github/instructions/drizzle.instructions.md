---
description: "Use when writing or editing database schema, Drizzle ORM queries, or migrations. Enforces PostgreSQL table conventions, column typing, relation definitions, and migration workflow."
applyTo: "src/lib/server/db/**/*.ts"
---

# Drizzle ORM Rules

## Setup

The database client and schema are in `src/lib/server/db/`:

```
src/lib/server/db/
  index.ts        ← drizzle client, import `db` from here
  schema.ts       ← re-exports all schema files (entry point)
  auth.schema.ts  ← better-auth managed tables (do not edit manually)
```

Always import `db` from `$lib/server/db` — never instantiate a new client:

```ts
import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
```

## Schema Conventions

Use `pgTable` from `drizzle-orm/pg-core`. Follow these column type rules:

| Data | Type |
|---|---|
| Primary keys | `text('id').primaryKey()` — string IDs (never serial/integer) |
| Timestamps | `timestamp('created_at').defaultNow().notNull()` |
| Auto-updated timestamps | `.defaultNow().$onUpdate(() => new Date()).notNull()` |
| Booleans | `boolean('email_verified').default(false).notNull()` |
| Foreign keys | `text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })` |

```ts
import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const movie = pgTable(
  'movie',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    submittedBy: text('submitted_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (table) => [index('movie_submittedBy_idx').on(table.submittedBy)]
);
```

- Always add an `index()` on foreign key columns
- Column names use `snake_case` in the DB, camelCase in the TypeScript object
- Add `$onUpdate(() => new Date())` to every `updatedAt` column

## Relations

Define relations separately using `relations` from `drizzle-orm`. Keep them in the same file as the table:

```ts
import { relations } from 'drizzle-orm';

export const movieRelations = relations(movie, ({ one, many }) => ({
  submittedBy: one(user, { fields: [movie.submittedBy], references: [user.id] }),
  reviews: many(review)
}));
```

Relations are for query-time joins only — they don't affect the DB schema.

## Querying

Use the `db.query` API (relational query builder) for joined queries; use `db.select` for flat queries:

```ts
// Relational query (uses relations config)
const movies = await db.query.movie.findMany({
  with: { reviews: true },
  where: (movie, { eq }) => eq(movie.id, id)
});

// Flat select
const movies = await db.select().from(movie).where(eq(movie.id, id));
```

Import query helpers from `drizzle-orm`:

```ts
import { eq, and, desc, isNull } from 'drizzle-orm';
```

## Schema File Organisation

- Each domain gets its own `*.schema.ts` file (e.g., `movies.schema.ts`, `reviews.schema.ts`)
- Re-export everything from `schema.ts`: `export * from './movies.schema';`
- **Never edit `auth.schema.ts`** — it is managed by better-auth and will be overwritten

## Migration Workflow

```bash
# Generate SQL migration files (preferred for production)
npx drizzle-kit generate

# Push schema directly to DB (dev only — use for rapid iteration)
npx drizzle-kit push

# Open Drizzle Studio to inspect the DB
npx drizzle-kit studio
```

- Use `drizzle-kit generate` + reviewing the SQL before `drizzle-kit migrate` for any production change
- `drizzle-kit push` is acceptable during local development only
- `drizzle.config.ts` reads `DATABASE_URL` from `process.env` (not SvelteKit's env modules) — this is intentional for CLI usage
