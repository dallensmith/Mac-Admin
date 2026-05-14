# Continuation Notes — Discord Embed Templates Refactor

*Saved 2026-05-14. Resume here on another PC.*

---

## ✅ Completed

### Data Layer
- `sm_embed_templates` collection — auto-created + seeded (8 default templates)
- `sm_template_variables` collection — auto-created + seeded (87 variables)
- Types added: `PBEmbedTemplateRecord`, `PBTemplateVariableRecord` in `src/types/pocketbase.ts`

### Server Logic (`src/routes/discord-templates/+page.server.ts`)
- Load function: fetches templates from `sm_embed_templates`, fetches variables from `sm_template_variables` (falls back to hardcoded catalog)
- CRUD actions: create, update, delete, duplicate, setActive for templates
- Variable actions: createVariable, updateVariable, deleteVariable

### UI Components
- `DiscordTemplatePreview.svelte` — rewritten, full embed spec rendering
- `EmbedFieldEditor.svelte` — add/remove/reorder inline fields, now supports variable autocomplete
- `VariableAutocomplete.svelte` — new component, detects `{{` typing, shows dropdown of matching variables with arrow-key nav + click-to-insert

### Page (`src/routes/discord-templates/+page.svelte`)
- 3-column layout: template list sidebar, 7-tab editor, live preview + variable reference
- All text inputs use `VariableAutocomplete` with `allVariables` (template key vars + common vars)
- Variables tab: view/edit/add/delete template variables, stored in PocketBase
- Source badges shown in right-panel variable reference

### Documentation
- `pocketbase_collections.md` — full `sm_embed_templates` schema, expanded variable catalog (87 vars), Discord embed limits reference

### Hooks
- `hooks.server.ts` — changed collection setup from fire-and-forget to `await` (race condition fix)

---

## ⚠️ In Progress / Needs Attention

### Tailwind Lint Errors (LAST BLOCKER)
Running `npm run check` shows Tailwind design token violations. Need to replace arbitrary pixel values with design tokens:
- `text-[10px]` → `text-label` (multiple occurrences, most already fixed)
- `text-[9px]` → `text-label-xs` (2 occurrences on lines ~775, ~796 in +page.svelte — right panel source badges)
- `text-[11px]` → `text-ui` (appears in right panel h3 heading)
- `text-xs` is fine (keep as-is)

### PocketBase sort bug
`sort=-updated` returns 400 on ALL collections after `docker compose down -v`. Workaround: use `getList()` without sort, sort client-side by comparing `updated` ISO strings.

### Verify on fresh PocketBase
After `docker compose down -v && docker compose up -d`, both `sm_embed_templates` and `sm_template_variables` should be auto-created and seeded on first request. The `ensureAllCollections` fixup code will detect and recreate broken `sm_embed_templates` collection if needed.

---

## 🔜 Next Steps

1. **Fix remaining Tailwind lint errors** — replace `text-[9px]` → `text-label-xs` and `text-[11px]` → `text-ui` in `+page.svelte`
2. Run `npm run check` — should be clean (only pre-existing errors in unrelated files)
3. Start dev server, navigate to `/discord-templates`, verify:
   - Templates load from PocketBase
   - Create/edit/delete templates works
   - Variable autocomplete appears when typing `{{`
   - Variables tab shows editable variable list
   - Live preview updates in real-time
4. Run `docker compose down -v && docker compose up -d` — verify fresh bootstrap works
5. Update `pocketbase_collections.md` with `sm_template_variables` schema docs

---

## Key Files Modified
- `src/types/pocketbase.ts`
- `src/lib/server/pocketbase-setup.ts`
- `src/hooks.server.ts`
- `src/routes/discord-templates/+page.server.ts`
- `src/routes/discord-templates/+page.svelte`
- `src/routes/instructions/+page.server.ts` (sort fix)
- `src/lib/components/ui/DiscordTemplatePreview.svelte`
- `src/lib/components/ui/EmbedFieldEditor.svelte`
- `src/lib/components/ui/VariableAutocomplete.svelte` (NEW)
- `pocketbase_collections.md`
