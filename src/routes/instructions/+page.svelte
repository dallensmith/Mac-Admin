<script lang="ts">
import { enhance } from '$app/forms';
import type { RecordModel } from 'pocketbase';
import PageHeader from '$lib/components/ui/PageHeader.svelte';
import SectionCard from '$lib/components/ui/SectionCard.svelte';
import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

let { data, form }: { data: import('./$types').PageData; form: import('./$types').ActionData } =
$props();

// ── Template selection ──────────────────────────────────────────────────────

let selectedTemplateId = $state<string>((data.templates[0] as RecordModel)?.id ?? '');

let selectedTemplate = $derived<RecordModel>(
(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId) ??
(data.templates[0] as RecordModel)
);

// Auto-fix selectedTemplateId if the selected template was deleted
$effect(() => {
if (
(data.templates as RecordModel[]).length > 0 &&
!(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId)
) {
selectedTemplateId = (data.templates[0] as RecordModel).id;
}
});

function statusFromRecord(t: RecordModel): string {
if (t.is_active) return 'active';
if (t.is_default) return 'default';
return 'inactive';
}

let isDefaultProfile = $derived((selectedTemplate as RecordModel)?.is_default === true);
let isReadonly = $derived(isDefaultProfile);

// ── Instruction file tabs ───────────────────────────────────────────────────

const tabs = [
{ key: 'system.md', field: 'system' },
{ key: 'behavior.md', field: 'behavior' },
{ key: 'resources.md', field: 'resources' },
{ key: 'conversation-rules.json', field: 'conversation_rules' },
{ key: 'response-templates.json', field: 'response_templates' }
] as const;

type TabKey = (typeof tabs)[number]['key'];
let activeTab = $state<TabKey>('system.md');

// ── Structured field types ──────────────────────────────────────────────────

type TriggerPhrase = { action: string; group: string; examples: string; notes: string };
type CustomRule = { label: string; rule: string };
type OdExample = { wrong: string; right: string };
type OdExtraRule = { label: string; rule: string };

// ── Editable state ──────────────────────────────────────────────────────────

let edits = $state<Record<string, string>>({
name: '',
description: '',
system: '',
behavior: '',
resources: '',
conversation_rules: '',
response_templates: '',
output_discipline: '',
od_verbatim_rule: '',
addendum: ''
});

let triggerPhrases = $state<TriggerPhrase[]>([]);
let customRules = $state<CustomRule[]>([]);
let odBannedStarters = $state<string[]>([]);
let odExamples = $state<OdExample[]>([]);
let odExtraRules = $state<OdExtraRule[]>([]);
let useOdOverride = $state(false);

// Derived JSON strings for hidden inputs
let triggerPhrasesJson = $derived(
JSON.stringify(
triggerPhrases.map((tp) => ({
action: tp.action,
...(tp.group ? { group: tp.group } : {}),
examples: tp.examples
.split('\n')
.map((s) => s.trim())
.filter(Boolean),
...(tp.notes ? { notes: tp.notes } : {})
}))
)
);
let customRulesJson = $derived(JSON.stringify(customRules));
let odBannedStartersJson = $derived(JSON.stringify(odBannedStarters));
let odExamplesJson = $derived(JSON.stringify(odExamples));
let odExtraRulesJson = $derived(JSON.stringify(odExtraRules));

// Sync state when template changes
$effect(() => {
const t = selectedTemplate;
if (!t) return;
edits = {
name: t.name ?? '',
description: t.description ?? '',
system: t.system ?? '',
behavior: t.behavior ?? '',
resources: t.resources ?? '',
conversation_rules: t.conversation_rules ?? '',
response_templates: t.response_templates ?? '',
output_discipline: t.output_discipline ?? '',
od_verbatim_rule: t.od_verbatim_rule ?? '',
addendum: t.addendum ?? ''
};
useOdOverride = !!(t.output_discipline as string);
try {
const rawTriggers = JSON.parse((t.trigger_phrases as string) || '[]') as Array<{
action: string;
group?: string;
examples?: string[];
notes?: string;
}>;
triggerPhrases = rawTriggers.map((tp) => ({
action: tp.action ?? '',
group: tp.group ?? '',
examples: Array.isArray(tp.examples) ? tp.examples.join('\n') : '',
notes: tp.notes ?? ''
}));
} catch {
triggerPhrases = [];
}
try {
customRules = JSON.parse((t.custom_rules as string) || '[]') as CustomRule[];
} catch {
customRules = [];
}
try {
odBannedStarters = JSON.parse((t.od_banned_starters as string) || '[]') as string[];
} catch {
odBannedStarters = [];
}
try {
odExamples = JSON.parse((t.od_examples as string) || '[]') as OdExample[];
} catch {
odExamples = [];
}
try {
odExtraRules = JSON.parse((t.od_extra_rules as string) || '[]') as OdExtraRule[];
} catch {
odExtraRules = [];
}
});

// ── Sections for the selected template ─────────────────────────────────────

let templateSections = $derived(
(data.sections as RecordModel[])
.filter((s) => s.instruction_set_id === selectedTemplateId)
.sort((a, b) => (a.order as number) - (b.order as number))
);

// Inline section editing: map of section id → expanded boolean
let expandedSections = $state<Record<string, boolean>>({});
function toggleSection(id: string) {
expandedSections[id] = !expandedSections[id];
}

// Track local section edits
type SectionEdit = {
section_id: string;
label: string;
content: string;
order: number;
enabled: boolean;
condition: string;
};
let sectionEdits = $state<Record<string, SectionEdit>>({});

$effect(() => {
for (const s of templateSections) {
if (!sectionEdits[s.id]) {
sectionEdits[s.id] = {
section_id: s.section_id as string,
label: s.label as string,
content: s.content as string,
order: s.order as number,
enabled: s.enabled as boolean,
condition: s.condition as string
};
}
}
});

// ── Assembled prompt preview ────────────────────────────────────────────────

let assembledPrompt = $derived.by(() => {
const parts: string[] = [];

if (templateSections.length > 0) {
parts.push('── PROMPT SECTIONS ──');
for (const s of templateSections) {
const sec = sectionEdits[s.id];
const cond = sec?.condition ?? (s.condition as string);
const enabled = sec?.enabled ?? (s.enabled as boolean);
const label = sec?.label ?? (s.label as string);
const content = (sec?.content ?? (s.content as string)).trim();
parts.push(
`[${enabled ? '✓' : '✗'}] ${label} (${cond})\n${content ? content.slice(0, 120) + (content.length > 120 ? '…' : '') : '[empty]'}`
);
}
parts.push('');
}

const sec = (header: string, content: string, fallback: string) => {
parts.push(`## ${header}`);
parts.push(content.trim() || `[${fallback}]`);
parts.push('');
};
sec('SYSTEM', edits.system, 'using file default');
sec('BEHAVIOR', edits.behavior, 'using file default');
sec('RESOURCES', edits.resources, 'using file default');
sec('CONVERSATION RULES', edits.conversation_rules, 'using file default');
sec('RESPONSE TEMPLATES', edits.response_templates, 'using file default');

if (useOdOverride) {
parts.push('## OUTPUT DISCIPLINE [full override]');
parts.push(edits.output_discipline.trim() || '[empty override]');
} else {
parts.push('## OUTPUT DISCIPLINE [granular]');
parts.push(
edits.od_verbatim_rule.trim()
? `verbatim rule: ${edits.od_verbatim_rule.trim()}`
: '[verbatim rule: seeded default]'
);
parts.push(
odBannedStarters.length > 0
? `banned starters (${odBannedStarters.length}): ${odBannedStarters.slice(0, 3).join(', ')}${odBannedStarters.length > 3 ? '…' : ''}`
: '[banned starters: seeded default]'
);
parts.push(
odExamples.length > 0 ? `examples: ${odExamples.length} pair(s)` : '[examples: seeded default]'
);
parts.push(
odExtraRules.length > 0
? `extra rules (${odExtraRules.length}): ${odExtraRules.map((r) => r.label || '—').join(', ')}`
: '[extra rules: none]'
);
}
parts.push('');

if (edits.addendum.trim()) {
parts.push('## ADDENDUM');
parts.push(edits.addendum.trim());
parts.push('');
}
if (customRules.length > 0) {
parts.push(`## CUSTOM RULES (${customRules.length})`);
customRules.forEach((r, i) => parts.push(`${i + 1}. [${r.label || '—'}] ${r.rule}`));
parts.push('');
}
if (triggerPhrases.length > 0) {
parts.push(`## TRIGGER PHRASES (${triggerPhrases.length})`);
triggerPhrases.forEach((tp) =>
parts.push(`[${tp.action || '?'}]${tp.group ? ` @${tp.group}` : ''}`)
);
parts.push('');
}
return parts.join('\n');
});

// ── Field helpers ───────────────────────────────────────────────────────────

function addRule() { customRules = [...customRules, { label: '', rule: '' }]; }
function removeRule(i: number) { customRules = customRules.filter((_, idx) => idx !== i); }
function addTrigger() { triggerPhrases = [...triggerPhrases, { action: '', group: '', examples: '', notes: '' }]; }
function removeTrigger(i: number) { triggerPhrases = triggerPhrases.filter((_, idx) => idx !== i); }
function addBannedStarter() { odBannedStarters = [...odBannedStarters, '']; }
function removeBannedStarter(i: number) { odBannedStarters = odBannedStarters.filter((_, idx) => idx !== i); }
function addOdExample() { odExamples = [...odExamples, { wrong: '', right: '' }]; }
function removeOdExample(i: number) { odExamples = odExamples.filter((_, idx) => idx !== i); }
function addOdExtraRule() { odExtraRules = [...odExtraRules, { label: '', rule: '' }]; }
function removeOdExtraRule(i: number) { odExtraRules = odExtraRules.filter((_, idx) => idx !== i); }

// ── Saving state + enhance callbacks ───────────────────────────────────────

let saving = $state(false);
let updateNameError = $state('');
let deleteSectionId = $state('');

const enhanceCreate = () => {
saving = true;
return async ({ update }: { update: () => Promise<void> }) => {
await update();
saving = false;
selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
};
};

const enhanceUpdate = ({ cancel }: { cancel: () => void }) => {
if (!edits.name.trim()) {
updateNameError = 'Profile name is required';
cancel();
return;
}
updateNameError = '';
saving = true;
return async ({ update }: { update: () => Promise<void> }) => {
await update();
saving = false;
};
};

const enhanceDelete = () => {
saving = true;
return async ({ update }: { update: () => Promise<void> }) => {
await update();
saving = false;
selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
};
};

const enhanceSetActive = () => {
saving = true;
return async ({ update }: { update: () => Promise<void> }) => {
await update();
saving = false;
};
};

const enhanceDuplicate = () => {
saving = true;
return async ({ update }: { update: () => Promise<void> }) => {
await update();
saving = false;
};
};

const enhanceSection = () => {
return async ({ update }: { update: () => Promise<void> }) => {
await update();
};
};
</script>

<PageHeader
title="Instruction Templates"
description="Manage bot personalities and system profiles."
/>

<div class="mb-6 rounded border border-rose-500/30 bg-rose-500/10 p-4 shadow-glow-rose-sm">
<div class="flex items-start gap-3">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert shrink-0 text-rose-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
<div>
<h3 class="text-ui font-bold tracking-widest text-rose-400 uppercase drop-shadow-sm">Caution</h3>
<ul class="mt-1 list-inside list-disc text-xs text-rose-300/80">
<li>Changing bot instructions can dramatically affect bot behavior.</li>
<li>Test profiles using the <code class="font-mono">experimental</code> tag before setting them active.</li>
<li>Do not store API keys or secrets in instruction templates.</li>
</ul>
</div>
</div>
</div>

<form id="createForm" method="POST" action="?/create" use:enhance={enhanceCreate}></form>
<form id="setActiveForm" method="POST" action="?/setActive" use:enhance={enhanceSetActive}>
<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>
<form id="duplicateForm" method="POST" action="?/duplicate" use:enhance={enhanceDuplicate}>
<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>
<form id="deleteForm" method="POST" action="?/delete" use:enhance={enhanceDelete}>
<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>
<form id="deleteSectionForm" method="POST" action="?/deleteSection" use:enhance={enhanceSection}>
<input type="hidden" name="id" value={deleteSectionId} />
</form>

<div class="grid gap-6 xl:grid-cols-12">

<!-- ── Left Sidebar: Templates List ──────────────────────────────────────── -->
<div class="space-y-4 xl:col-span-3">
<SectionCard title="Bot Profiles">
{#snippet headerAction()}
<button type="submit" form="createForm" class="text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">
+ New
</button>
{/snippet}
<div class="flex max-h-150 flex-col gap-2 overflow-y-auto pr-1">
{#each data.templates as t (t.id)}
<button
type="button"
class="group flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-200 {selectedTemplateId === t.id ? 'border-cyan-500/50 bg-slate-800/80 shadow-glow-cyan-sm' : 'border-slate-800/60 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-800/50'}"
onclick={() => (selectedTemplateId = t.id)}
>
<div class="flex w-full items-start justify-between">
<div class="flex items-center gap-1.5">
{#if t.is_default}
<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-slate-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
{/if}
<span class="text-ui font-bold tracking-widest uppercase transition-colors {selectedTemplateId === t.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-cyan-400'}">{t.name}</span>
</div>
<StatusBadge status={statusFromRecord(t as RecordModel)} />
</div>
<span class="line-clamp-2 text-xs text-slate-400">{t.description}</span>
<span class="text-label-xs font-bold tracking-widest text-slate-500 uppercase">Edited: {(t.updated as string).slice(0, 10)}</span>
</button>
{/each}
</div>
</SectionCard>
</div>

<!-- ── Main Area: Editor ──────────────────────────────────────────────────── -->
<div class="space-y-6 xl:col-span-6">
{#if form?.error}
<div class="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{form.error}</div>
{/if}

{#if selectedTemplate}
<!-- Default profile banner -->
{#if isDefaultProfile}
<div class="rounded border border-slate-700/50 bg-slate-800/40 p-4">
<div class="flex items-start gap-3">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
<div>
<p class="text-ui font-bold tracking-widest text-slate-300 uppercase">Read-Only — Bot Managed</p>
<p class="mt-1 text-xs text-slate-500">This profile is populated from the bot's <code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400">config/instructions/</code> files on startup. Changes must be made there and reseeded.</p>
</div>
</div>
</div>
{/if}

<form id="updateForm" method="POST" action="?/update" use:enhance={enhanceUpdate}>
<input type="hidden" name="id" value={selectedTemplate.id} />

<!-- ── Profile Metadata ──────────────────────────────────────────── -->
<SectionCard title="Template Metadata">
<div class="grid gap-4 sm:grid-cols-2">
<div>
<label for="profileName" class="label-caps">Profile Name</label>
<input id="profileName" name="name" type="text" bind:value={edits.name} readonly={isReadonly} aria-invalid={!!updateNameError} class="input-dark {isReadonly ? 'cursor-default opacity-60' : ''} {updateNameError ? 'border-rose-500/60 ring-1 ring-rose-500/50' : ''}" />
{#if updateNameError}<p class="mt-1 text-xs text-rose-400">{updateNameError}</p>{/if}
</div>
<div class="sm:col-span-2">
<label for="profileDesc" class="label-caps">Description</label>
<textarea id="profileDesc" name="description" rows="2" bind:value={edits.description} readonly={isReadonly} class="input-dark {isReadonly ? 'cursor-default opacity-60' : ''}"></textarea>
</div>
</div>
<div class="mt-6 flex flex-wrap gap-3 border-t border-slate-800/50 pt-4">
{#if !selectedTemplate.is_active}
<button type="submit" form="setActiveForm" disabled={saving} class="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-label font-bold tracking-widest text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">Set Active</button>
{/if}
{#if !isReadonly}
<button type="submit" disabled={saving} class="rounded border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-label font-bold tracking-widest text-cyan-400 uppercase shadow-glow-cyan-sm-soft transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-glow-cyan-sm-hover disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
{/if}
<button type="submit" form="duplicateForm" disabled={saving} class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:bg-slate-700 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Duplicate</button>
<div class="flex-1"></div>
<button type="submit" form="deleteForm" disabled={saving || (selectedTemplate.is_active as boolean) || (selectedTemplate.is_default as boolean) || (data.templates as RecordModel[]).length <= 1} class="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40">Delete</button>
</div>
</SectionCard>

<!-- ── Instruction Files ─────────────────────────────────────────── -->
<SectionCard title="Instruction Files">
<p class="mb-4 text-xs text-slate-500">Each file overrides the bot's filesystem default. Leave empty to use the file-based fallback.</p>
<div class="mb-4 flex flex-wrap gap-1 border-b border-slate-800/80 pb-px">
{#each tabs as tab (tab.key)}
<button type="button" class="border-b-2 px-3 py-2 text-ui font-bold tracking-widest uppercase transition-all {activeTab === tab.key ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}" onclick={() => (activeTab = tab.key)}>
{tab.key}
</button>
{/each}
</div>
{#each tabs as tab (tab.key)}
<textarea name={tab.field} bind:value={edits[tab.field]} readonly={isReadonly} class="h-100 w-full resize-none rounded border border-slate-800/80 bg-slate-950/50 p-4 font-mono text-sm text-slate-300 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none {isReadonly ? 'cursor-default opacity-70 focus:border-slate-800/80 focus:ring-0' : ''} {activeTab !== tab.key ? 'hidden' : ''}"></textarea>
{/each}
</SectionCard>

<!-- ── Behavior Extensions ───────────────────────────────────────── -->
<SectionCard title="Behavior Extensions">
<p class="mb-5 text-xs text-slate-500">These fields layer on top of the file-based instructions. Leave any field empty to use the bot's built-in default for that section.</p>

<!-- Output Discipline -->
<div class="mb-6">
<div class="mb-3 flex items-center justify-between">
<div>
<span class="label-caps block">Output Discipline</span>
<p class="mt-0.5 text-xs text-slate-500">Controls how the bot formats its responses.</p>
</div>
<label class="flex cursor-pointer items-center gap-2 rounded border border-slate-700/60 bg-slate-900/40 px-3 py-1.5">
<input type="checkbox" bind:checked={useOdOverride} disabled={isReadonly} class="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
<span class="text-label font-bold tracking-widest text-slate-400 uppercase">Full override</span>
</label>
</div>

{#if useOdOverride}
<div class="rounded border border-amber-500/20 bg-amber-500/5 p-3">
<p class="mb-2 text-xs text-amber-400/70">Replaces the entire OUTPUT DISCIPLINE block. All granular fields are ignored when this is non-empty.</p>
<textarea name="output_discipline" rows="6" bind:value={edits.output_discipline} readonly={isReadonly} class="input-dark h-auto w-full resize-y font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" placeholder="Full OUTPUT DISCIPLINE block text…"></textarea>
</div>
<input type="hidden" name="od_verbatim_rule" value={edits.od_verbatim_rule} />
<input type="hidden" name="od_banned_starters" value={odBannedStartersJson} />
<input type="hidden" name="od_examples" value={odExamplesJson} />
<input type="hidden" name="od_extra_rules" value={odExtraRulesJson} />
{:else}
<input type="hidden" name="output_discipline" value="" />
<div class="space-y-5">
<!-- od_verbatim_rule -->
<div>
<label class="label-caps mb-1 block">Verbatim Rule</label>
<p class="mb-1.5 text-xs text-slate-500">The "response is sent VERBATIM" paragraph. Empty = use seeded default.</p>
<textarea name="od_verbatim_rule" rows="3" bind:value={edits.od_verbatim_rule} readonly={isReadonly} class="input-dark h-auto w-full resize-y font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" placeholder="Your response is sent VERBATIM to Discord…"></textarea>
</div>
<!-- od_banned_starters -->
<div>
<label class="label-caps mb-1 block">Banned Starters</label>
<p class="mb-2 text-xs text-slate-500">Response opener phrases the bot must never begin with. Empty list = use seeded default.</p>
<input type="hidden" name="od_banned_starters" value={odBannedStartersJson} />
<div class="space-y-2">
{#each odBannedStarters as _starter, i (i)}
<div class="flex items-center gap-2">
<input type="text" placeholder={`e.g. "Okay,"`} bind:value={odBannedStarters[i]} readonly={isReadonly} class="input-dark flex-1 font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
{#if !isReadonly}
<button type="button" onclick={() => removeBannedStarter(i)} class="shrink-0 rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400" aria-label="Remove">
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
{/if}
</div>
{/each}
</div>
{#if !isReadonly}
<button type="button" onclick={addBannedStarter} class="mt-2 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Starter</button>
{/if}
</div>
<!-- od_examples -->
<div>
<label class="label-caps mb-1 block">Output Examples</label>
<p class="mb-2 text-xs text-slate-500">Wrong/right illustrative pairs shown to the bot. Empty = use seeded default.</p>
<input type="hidden" name="od_examples" value={odExamplesJson} />
<div class="space-y-3">
{#each odExamples as example, i (i)}
<div class="rounded border border-slate-800/60 bg-slate-900/40 p-3">
<div class="mb-2 flex items-center justify-between">
<span class="text-label-xs font-bold tracking-widest text-slate-500 uppercase">Pair {i + 1}</span>
{#if !isReadonly}
<button type="button" onclick={() => removeOdExample(i)} class="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400" aria-label="Remove pair">
<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
{/if}
</div>
<div class="grid gap-2 sm:grid-cols-2">
<div>
<label class="mb-1 block text-xs text-rose-400/70">Wrong</label>
<textarea rows="2" placeholder="Bad response example…" bind:value={example.wrong} readonly={isReadonly} class="input-dark w-full resize-y text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
<div>
<label class="mb-1 block text-xs text-emerald-400/70">Right</label>
<textarea rows="2" placeholder="Good response example…" bind:value={example.right} readonly={isReadonly} class="input-dark w-full resize-y text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
</div>
</div>
{/each}
</div>
{#if !isReadonly}
<button type="button" onclick={addOdExample} class="mt-2 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Example Pair</button>
{/if}
</div>
<!-- od_extra_rules -->
<div>
<label class="label-caps mb-1 block">Extra Output Rules</label>
<p class="mb-2 text-xs text-slate-500">Additional rules appended after the examples. Empty = none appended.</p>
<input type="hidden" name="od_extra_rules" value={odExtraRulesJson} />
<div class="space-y-3">
{#each odExtraRules as rule, i (i)}
<div class="rounded border border-slate-800/60 bg-slate-900/40 p-3">
<div class="mb-2 flex items-center gap-2">
<input type="text" placeholder="Label (e.g. No asterisks)" bind:value={rule.label} readonly={isReadonly} class="input-dark flex-1 text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
{#if !isReadonly}
<button type="button" onclick={() => removeOdExtraRule(i)} class="shrink-0 rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400" aria-label="Remove rule">
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
{/if}
</div>
<textarea rows="2" placeholder="The rule text…" bind:value={rule.rule} readonly={isReadonly} class="input-dark w-full resize-y text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
{/each}
</div>
{#if !isReadonly}
<button type="button" onclick={addOdExtraRule} class="mt-2 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Rule</button>
{/if}
</div>
</div>
{/if}
</div>

<!-- Addendum -->
<div class="mb-6 border-t border-slate-800/50 pt-6">
<label class="label-caps mb-1 block">Addendum</label>
<p class="mb-2 text-xs text-slate-500">Appended at the very end of the assembled prompt. Empty = nothing added.</p>
<textarea name="addendum" rows="3" bind:value={edits.addendum} readonly={isReadonly} class="input-dark h-auto w-full resize-y font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>

<!-- Custom Rules -->
<div class="mb-6 border-t border-slate-800/50 pt-6">
<label class="label-caps mb-1 block">Custom Rules</label>
<p class="mb-3 text-xs text-slate-500">Injected before OUTPUT DISCIPLINE. Empty list = use file default (<code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400">promptRules</code>).</p>
<input type="hidden" name="custom_rules" value={customRulesJson} />
<div class="space-y-3">
{#each customRules as rule, i (i)}
<div class="rounded border border-slate-800/60 bg-slate-900/40 p-3">
<div class="mb-2 flex items-center gap-2">
<input type="text" placeholder="Label (e.g. No spoilers)" bind:value={rule.label} readonly={isReadonly} class="input-dark flex-1 text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
{#if !isReadonly}
<button type="button" onclick={() => removeRule(i)} class="shrink-0 rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400" aria-label="Remove rule">
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
{/if}
</div>
<textarea rows="2" placeholder="The rule text…" bind:value={rule.rule} readonly={isReadonly} class="input-dark w-full resize-y text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
{/each}
</div>
{#if !isReadonly}
<button type="button" onclick={addRule} class="mt-3 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Rule</button>
{/if}
</div>

<!-- Trigger Phrases -->
<div class="border-t border-slate-800/50 pt-6">
<label class="label-caps mb-1 block">Trigger Phrases</label>
<p class="mb-3 text-xs text-slate-500">Additive — appended to the bot's hardcoded trigger phrase examples. Each entry needs an action and at least one example (one per line).</p>
<input type="hidden" name="trigger_phrases" value={triggerPhrasesJson} />
<div class="space-y-3">
{#each triggerPhrases as tp, i (i)}
<div class="rounded border border-slate-800/60 bg-slate-900/40 p-3">
<div class="mb-2 flex items-start justify-between gap-2">
<div class="grid flex-1 gap-2 sm:grid-cols-2">
<input type="text" placeholder="Action (e.g. recommend_movie)" bind:value={tp.action} readonly={isReadonly} class="input-dark text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
<input type="text" placeholder="Group (optional)" bind:value={tp.group} readonly={isReadonly} class="input-dark text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
</div>
{#if !isReadonly}
<button type="button" onclick={() => removeTrigger(i)} class="mt-1 shrink-0 rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400" aria-label="Remove trigger">
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
{/if}
</div>
<div class="mb-2">
<label class="mb-1 block text-xs text-slate-500">Examples (one per line)</label>
<textarea rows="3" placeholder="can you recommend&#10;what should I watch&#10;suggest something" bind:value={tp.examples} readonly={isReadonly} class="input-dark w-full resize-y font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
<input type="text" placeholder="Notes (optional)" bind:value={tp.notes} readonly={isReadonly} class="input-dark w-full text-sm {isReadonly ? 'cursor-default opacity-70' : ''}" />
</div>
{/each}
</div>
{#if !isReadonly}
<button type="button" onclick={addTrigger} class="mt-3 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Trigger</button>
{/if}
</div>
</SectionCard>
</form>

<!-- ── Prompt Sections ─────────────────────────────────────────────── -->
<SectionCard title="Prompt Sections">
<p class="mb-4 text-xs text-slate-500">Ordered prompt section records that fully replace the hardcoded TypeScript builders when present. Zero sections = fall back to hardcoded behavior.</p>

{#if templateSections.length === 0}
<div class="mb-4 rounded border border-slate-800/50 bg-slate-900/30 p-6 text-center">
<p class="text-sm text-slate-500">No sections — using hardcoded TypeScript builders.</p>
{#if !isReadonly}
<form method="POST" action="?/duplicateSectionsFromDefault" use:enhance={enhanceSection} class="mt-3 inline-block">
<input type="hidden" name="instruction_set_id" value={selectedTemplate.id} />
<button type="submit" class="text-label font-bold tracking-widest text-fuchsia-400 uppercase transition-colors hover:text-fuchsia-300">Duplicate sections from Default →</button>
</form>
{/if}
</div>
{:else}
<div class="space-y-3">
{#each templateSections as section (section.id)}
{@const edit = sectionEdits[section.id]}
{@const isExpanded = !!expandedSections[section.id]}
<div class="rounded border {(edit?.enabled ?? section.enabled) ? 'border-slate-700/60 bg-slate-900/40' : 'border-slate-800/40 bg-slate-900/20 opacity-60'} overflow-hidden">
<!-- Header row -->
<div class="flex items-center gap-3 px-3 py-2.5">
<!-- Enable toggle (submitted as its own mini-form to avoid nesting) -->
{#if !isReadonly}
<form method="POST" action="?/updateSection" use:enhance={enhanceSection} class="contents">
<input type="hidden" name="id" value={section.id} />
<input type="hidden" name="section_id" value={edit?.section_id ?? section.section_id} />
<input type="hidden" name="label" value={edit?.label ?? section.label} />
<input type="hidden" name="content" value={edit?.content ?? section.content} />
<input type="hidden" name="order" value={edit?.order ?? section.order} />
<input type="hidden" name="enabled" value={String(!(edit?.enabled ?? section.enabled))} />
<input type="hidden" name="condition" value={edit?.condition ?? section.condition} />
<button type="submit" class="shrink-0 text-slate-500 transition-colors hover:text-cyan-400" aria-label="Toggle enabled" onclick={() => { if (sectionEdits[section.id]) sectionEdits[section.id].enabled = !sectionEdits[section.id].enabled; }}>
{#if edit?.enabled ?? section.enabled}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
{:else}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
{/if}
</button>
</form>
{:else}
<span class="shrink-0">
{#if edit?.enabled ?? section.enabled}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-400/50"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
{:else}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
{/if}
</span>
{/if}

<div class="min-w-0 flex-1">
<div class="flex items-center gap-2">
<span class="truncate font-mono text-xs font-bold text-slate-300">{edit?.label ?? section.label}</span>
<span class="shrink-0 rounded px-1.5 py-0.5 text-label-xs font-bold tracking-widest uppercase {(edit?.condition ?? section.condition) === 'always' ? 'bg-cyan-500/10 text-cyan-400' : (edit?.condition ?? section.condition) === 'session_active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-fuchsia-500/10 text-fuchsia-400'}">
{edit?.condition ?? section.condition}
</span>
</div>
<span class="font-mono text-xs text-slate-500">{edit?.section_id ?? section.section_id}</span>
</div>

<span class="shrink-0 font-mono text-xs text-slate-600">#{edit?.order ?? section.order}</span>

<button type="button" onclick={() => toggleSection(section.id)} class="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform {isExpanded ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"/></svg>
</button>
</div>

<!-- Inline editor -->
{#if isExpanded && edit}
<div class="border-t border-slate-800/50 p-3">
<form method="POST" action="?/updateSection" use:enhance={enhanceSection}>
<input type="hidden" name="id" value={section.id} />
<input type="hidden" name="enabled" value={String(edit.enabled)} />
<div class="mb-3 grid gap-3 sm:grid-cols-3">
<div>
<label class="label-caps mb-1 block">Section ID</label>
<input type="text" name="section_id" bind:value={edit.section_id} readonly={isReadonly} class="input-dark font-mono text-sm {isReadonly ? 'cursor-default opacity-60' : ''}" placeholder="e.g. first_person" />
</div>
<div>
<label class="label-caps mb-1 block">Label</label>
<input type="text" name="label" bind:value={edit.label} readonly={isReadonly} class="input-dark text-sm {isReadonly ? 'cursor-default opacity-60' : ''}" placeholder="Human-readable name" />
</div>
<div>
<label class="label-caps mb-1 block">Condition</label>
<select name="condition" bind:value={edit.condition} disabled={isReadonly} class="input-dark text-sm {isReadonly ? 'cursor-default opacity-60' : ''}">
<option value="always">always</option>
<option value="session_active">session_active</option>
<option value="session_new">session_new</option>
</select>
</div>
</div>
<div class="mb-3 flex items-center gap-3">
<label class="label-caps">Order</label>
<input type="number" name="order" bind:value={edit.order} readonly={isReadonly} class="input-dark w-24 text-sm {isReadonly ? 'cursor-default opacity-60' : ''}" />
</div>
<div class="mb-3">
<label class="label-caps mb-1 block">Content</label>
<p class="mb-1.5 text-xs text-slate-500">Supports <code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400">{'{ANNOUNCEMENT_CHANNELS}'}</code> token.</p>
<textarea name="content" rows="8" bind:value={edit.content} readonly={isReadonly} class="input-dark h-auto w-full resize-y font-mono text-sm {isReadonly ? 'cursor-default opacity-70' : ''}"></textarea>
</div>
{#if !isReadonly}
<div class="flex items-center justify-between">
<button type="submit" class="rounded border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:bg-cyan-500/20">Save Section</button>
<button type="submit" form="deleteSectionForm" onclick={() => (deleteSectionId = section.id)} class="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20">Delete</button>
</div>
{/if}
</form>
</div>
{/if}
</div>
{/each}
</div>
{/if}

{#if !isReadonly}
<form method="POST" action="?/createSection" use:enhance={enhanceSection} class="mt-4 border-t border-slate-800/50 pt-4">
<input type="hidden" name="instruction_set_id" value={selectedTemplate.id} />
<input type="hidden" name="section_id" value="" />
<input type="hidden" name="content" value="" />
<input type="hidden" name="order" value={templateSections.length > 0 ? Math.max(...templateSections.map((s) => s.order as number)) + 10 : 10} />
<input type="hidden" name="enabled" value="true" />
<input type="hidden" name="condition" value="always" />
<input type="hidden" name="label" value="New Section" />
<button type="submit" class="text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300">+ Add Section</button>
</form>
{/if}
</SectionCard>
{:else}
<div class="flex h-64 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/40">
<p class="text-sm text-slate-500">No templates found. Create one to get started.</p>
</div>
{/if}
</div>

<!-- ── Right Sidebar: Profile Summary & Assembled Prompt ─────────────────── -->
<div class="space-y-6 xl:col-span-3">
{#if selectedTemplate}
<SectionCard title="Profile Summary">
{#if selectedTemplate.is_active}
<div class="mb-4 rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-center text-label font-bold tracking-widest text-cyan-400 uppercase">Active Profile</div>
{:else if selectedTemplate.is_default}
<div class="mb-4 rounded border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-center text-label font-bold tracking-widest text-slate-400 uppercase">Bot-Managed Default</div>
{/if}

<div class="mb-4 space-y-2">
<p class="label-caps text-slate-500">Instruction Files</p>
{#each tabs as tab (tab.key)}
{@const content = edits[tab.field] ?? ''}
<div class="flex items-center justify-between gap-2">
<span class="truncate font-mono text-xs text-slate-400">{tab.key}</span>
{#if content.length > 0}
<span class="shrink-0 text-label-xs font-bold text-cyan-400">{content.length.toLocaleString()}</span>
{:else}
<span class="shrink-0 text-label-xs text-slate-600">empty</span>
{/if}
</div>
{/each}
</div>

<div class="mb-4 border-t border-slate-800/50 pt-4">
<p class="label-caps mb-1 text-slate-500">Output Discipline</p>
{#if useOdOverride}
<p class="text-xs font-bold text-amber-400">Full override active</p>
<p class="mt-0.5 line-clamp-2 font-mono text-xs text-slate-400">{edits.output_discipline.slice(0, 80)}{edits.output_discipline.length > 80 ? '…' : ''}</p>
{:else}
<p class="text-xs text-slate-400">Granular fields</p>
<div class="mt-1 space-y-0.5 text-xs text-slate-500">
<div>{odBannedStarters.length} banned starter{odBannedStarters.length !== 1 ? 's' : ''}</div>
<div>{odExamples.length} example pair{odExamples.length !== 1 ? 's' : ''}</div>
<div>{odExtraRules.length} extra rule{odExtraRules.length !== 1 ? 's' : ''}</div>
</div>
{/if}
</div>

<div class="mb-4 border-t border-slate-800/50 pt-4">
<p class="label-caps mb-1 text-slate-500">Addendum</p>
{#if edits.addendum}
<p class="line-clamp-2 font-mono text-xs text-slate-300">{edits.addendum.slice(0, 80)}{edits.addendum.length > 80 ? '…' : ''}</p>
{:else}
<p class="text-xs italic text-slate-500">None set</p>
{/if}
</div>

<div class="border-t border-slate-800/50 pt-4">
<p class="label-caps mb-1 text-slate-500">Behavior</p>
<div class="space-y-0.5 text-xs text-slate-500">
<div>{templateSections.length} prompt section{templateSections.length !== 1 ? 's' : ''}</div>
<div>{triggerPhrases.length} trigger phrase{triggerPhrases.length !== 1 ? 's' : ''}</div>
<div>{customRules.length} custom rule{customRules.length !== 1 ? 's' : ''}</div>
</div>
</div>
</SectionCard>

<SectionCard title="Assembled Prompt">
<p class="mb-3 text-xs text-slate-500">What the bot receives for this profile. Empty sections fall back to file defaults.</p>
<pre class="max-h-96 overflow-y-auto rounded border border-slate-800/60 bg-slate-950/80 p-3 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{assembledPrompt}</pre>
</SectionCard>
{/if}
</div>
</div>
