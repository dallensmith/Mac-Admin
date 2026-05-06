## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, sveltekit-adapter, better-auth, mdsvex, mcp, drizzle

---

# bad-movies-admin

Admin panel for managing bad movies content. Built with **SvelteKit** and **Svelte 5**.

## Tech Stack

- **Framework**: SvelteKit (file-based routing, SSR, form actions)
- **UI**: Svelte 5 with runes mode
- **Language**: TypeScript
- **Styling**: TBD (add after `sv add tailwindcss` or similar)

## Build & Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run lint         # ESLint
npm run format       # Prettier
```

## Svelte 5 Runes (Always Use)

Svelte 5 uses **runes** — always prefer them over legacy Svelte 4 syntax.

| Rune          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `$state()`    | Reactive local state                             |
| `$derived()`  | Computed values (replaces `$:`)                  |
| `$effect()`   | Side effects (replaces `onMount` for most cases) |
| `$props()`    | Component props (replaces `export let`)          |
| `$bindable()` | Two-way bindable props                           |

```svelte
<script lang="ts">
	// Props
	let { title, count = $bindable(0) }: { title: string; count?: number } = $props();

	// State
	let search = $state('');

	// Derived
	let filtered = $derived(items.filter((i) => i.name.includes(search)));

	// Effects (for DOM/third-party only — avoid overusing)
	$effect(() => {
		document.title = title;
	});
</script>
```

**Do NOT use**: `export let`, `$:`, `on:click` (use `onclick`), `<slot>` (use `{@render children()}`).

## SvelteKit Patterns

### Routing

Files in `src/routes/` define pages. Use `+page.svelte`, `+layout.svelte`, `+page.server.ts`, `+layout.server.ts`.

### Data Loading

Load data in `+page.server.ts` via `load()`, access via `$page.data` or the `data` prop.

```ts
// +page.server.ts
export const load = async ({ params, locals }) => {
	return { movie: await db.getMovie(params.id) };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.movie.title}</h1>
```

### Form Actions

Use `+page.server.ts` `actions` for mutations; use `enhance` for progressive enhancement.

### Environment Variables

- Secret/server-only: `$env/static/private` or `$env/dynamic/private`
- Public: `$env/static/public` or `$env/dynamic/public`
- Never import private env modules in `.svelte` files or `+page.ts`

### State Management

- Component-local: `$state()` rune
- Cross-component: Svelte context (`setContext` / `getContext`) or `.svelte.ts` reactive modules
- Avoid `svelte/store` for new code; use runes-based reactive state instead

## Conventions

- All `.svelte` files: `<script lang="ts">`
- Snippets over slots: use `{#snippet foo()}` / `{@render foo()}` for composable markup
- Event handlers: `onclick={handler}` not `on:click={handler}`
- Prefer `$derived` over `$effect` for computed values
- Use `svelte-check` before committing (`npm run check`)

## Key Docs

- [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes)
- [SvelteKit routing](https://svelte.dev/docs/kit/routing)
- [SvelteKit load functions](https://svelte.dev/docs/kit/load)
- [Form actions](https://svelte.dev/docs/kit/form-actions)
- [LLM-friendly full docs](https://svelte.dev/llms-full.txt)
