<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import type { PBEmbedTemplateRecord } from '../../types/pocketbase';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import DiscordTemplatePreview from '$lib/components/ui/DiscordTemplatePreview.svelte';
	import TemplateFieldToggle from '$lib/components/ui/TemplateFieldToggle.svelte';
	import EmbedFieldEditor from '$lib/components/ui/EmbedFieldEditor.svelte';

	let { data } = $props();

	let selectedTemplateId = $state<string>((data.templates[0] as RecordModel)?.id ?? '');

	let selectedTemplate = $derived<RecordModel>(
		(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId) ??
			(data.templates[0] as RecordModel)
	);

	// ── Tabs ──────────────────────────────────────────────────────────────
	const tabs = [
		{ key: 'metadata', label: 'Metadata' },
		{ key: 'author', label: 'Author' },
		{ key: 'content', label: 'Content' },
		{ key: 'media', label: 'Media' },
		{ key: 'fields', label: 'Fields' },
		{ key: 'footer', label: 'Footer' }
	] as const;

	type TabKey = (typeof tabs)[number]['key'];
	let activeTab = $state<TabKey>('content');

	// ── Embed fields (separate array for the editor, serialized to JSON) ──
	type EmbedField = { name: string; value: string; inline: boolean };
	let embedFields = $state<EmbedField[]>([]);
	let fieldsJson = $derived(JSON.stringify(embedFields));

	// ── Editable local state ──────────────────────────────────────────────
	let edits = $state({
		name: '',
		description: '',
		template_key: '',
		is_active: false,
		author_enabled: false,
		author_name: '',
		author_url: '',
		author_icon_url: '',
		title_enabled: true,
		title_text: '',
		description_enabled: true,
		description_text: '',
		url_enabled: false,
		url_text: '',
		color: '#5865F2',
		timestamp_enabled: false,
		footer_enabled: false,
		footer_text: '',
		footer_icon_url: '',
		thumbnail_enabled: false,
		thumbnail_url: '',
		image_enabled: false,
		image_url: ''
	});

	// Sync edits when selected template changes
	$effect(() => {
		const t = selectedTemplate;
		if (!t) return;
		edits = {
			name: (t.name as string) ?? '',
			description: (t.description as string) ?? '',
			template_key: (t.template_key as string) ?? '',
			is_active: (t.is_active as boolean) ?? false,
			author_enabled: (t.author_enabled as boolean) ?? false,
			author_name: (t.author_name as string) ?? '',
			author_url: (t.author_url as string) ?? '',
			author_icon_url: (t.author_icon_url as string) ?? '',
			title_enabled: (t.title_enabled as boolean) ?? true,
			title_text: (t.title_text as string) ?? '',
			description_enabled: (t.description_enabled as boolean) ?? true,
			description_text: (t.description_text as string) ?? '',
			url_enabled: (t.url_enabled as boolean) ?? false,
			url_text: (t.url_text as string) ?? '',
			color: (t.color as string) ?? '#5865F2',
			timestamp_enabled: (t.timestamp_enabled as boolean) ?? false,
			footer_enabled: (t.footer_enabled as boolean) ?? false,
			footer_text: (t.footer_text as string) ?? '',
			footer_icon_url: (t.footer_icon_url as string) ?? '',
			thumbnail_enabled: (t.thumbnail_enabled as boolean) ?? false,
			thumbnail_url: (t.thumbnail_url as string) ?? '',
			image_enabled: (t.image_enabled as boolean) ?? false,
			image_url: (t.image_url as string) ?? ''
		};
		// Parse fields JSON
		try {
			const parsed = JSON.parse((t.fields_json as string) || '[]');
			embedFields = Array.isArray(parsed) ? parsed : [];
		} catch {
			embedFields = [];
		}
	});

	// Auto-fix selectedTemplateId if the selected template was deleted
	$effect(() => {
		if (
			(data.templates as RecordModel[]).length > 0 &&
			!(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId)
		) {
			selectedTemplateId = (data.templates[0] as RecordModel).id;
		}
	});

	// ── Build a live preview object from edits ────────────────────────────
	let previewTemplate = $derived<PBEmbedTemplateRecord>({
		...edits,
		id: selectedTemplateId,
		fields_json: fieldsJson,
		created: '',
		updated: ''
	} as PBEmbedTemplateRecord);

	// ── Variables for the selected template key ───────────────────────────
	let templateKeyVars = $derived(
		(data.variableCatalog as Record<string, { name: string; description: string; source: string }[]>)[edits.template_key] ?? []
	);

	// ── Discord limits ────────────────────────────────────────────────────
	const discordLimits = [
		{ limit: 'Title', max: '256 characters' },
		{ limit: 'Description', max: '4096 characters' },
		{ limit: 'Field Name', max: '256 characters' },
		{ limit: 'Field Value', max: '1024 characters' },
		{ limit: 'Max Fields', max: '25 fields per embed' },
		{ limit: 'Footer Text', max: '2048 characters' },
		{ limit: 'Author Name', max: '256 characters' }
	];

	// ── Template key suggestions ──────────────────────────────────────────
	const keySuggestions = [
		'movie-lookup',
		'experiment-lookup',
		'review',
		'quote',
		'no-results',
		'error',
		'wheel-spin',
		'help'
	];

	// ── enhance callbacks ─────────────────────────────────────────────────
	const enhanceCreate =
		() =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
			selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
		};

	let updateNameError = $state('');
	const enhanceUpdate = ({ cancel }: { cancel: () => void }) => {
		if (!edits.name.trim()) {
			updateNameError = 'Template name is required';
			cancel();
			return;
		}
		updateNameError = '';
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
		};
	};

	const enhanceDelete =
		() =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
			selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
		};

	const enhanceSetActive =
		() =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
		};

	const enhanceDuplicate =
		() =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
			selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
		};
</script>

<!-- ── Hidden action forms ─────────────────────────────────────────────── -->
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

<PageHeader
	title="Discord Embed Templates"
	description="Design fully configurable Discord embeds for bot messages."
/>

<div class="grid gap-6 xl:grid-cols-12">
	<!-- ── Left Sidebar: Template List ──────────────────────────────────── -->
	<div class="space-y-4 xl:col-span-3">
		<SectionCard title="Templates">
			{#snippet headerAction()}
				<button
					type="submit"
					form="createForm"
					class="text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300"
				>
					+ New
				</button>
			{/snippet}

			<div class="flex max-h-150 flex-col gap-2 overflow-y-auto pr-1">
				{#each data.templates as t (t.id)}
					{@const rec = t as RecordModel}
					<button
						type="button"
						class="group flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-200 {selectedTemplateId ===
						rec.id
							? 'border-cyan-500/50 bg-slate-800/80 shadow-glow-cyan-sm'
							: 'border-slate-800/60 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-800/50'}"
						onclick={() => (selectedTemplateId = rec.id)}
					>
						<div class="flex w-full items-start justify-between">
							<span
								class="text-ui font-bold tracking-widest uppercase transition-colors {selectedTemplateId ===
								rec.id
									? 'text-cyan-400'
									: 'text-slate-300 group-hover:text-cyan-400'}"
							>
								{rec.name}
							</span>
							<StatusBadge status={rec.is_active ? 'active' : 'inactive'} />
						</div>
						<span class="line-clamp-2 text-xs text-slate-400">{rec.description}</span>
						<div class="flex w-full items-center gap-2">
							<code class="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-cyan-400">{rec.template_key}</code>
							<span class="ml-auto text-label-xs font-bold tracking-widest text-slate-500 uppercase"
								>Edited: {(rec.updated as string).slice(0, 10)}</span
							>
						</div>
					</button>
				{/each}
			</div>
		</SectionCard>
	</div>

	<!-- ── Main Editor ──────────────────────────────────────────────────── -->
	<div class="space-y-6 xl:col-span-5">
		{#if selectedTemplate}
			<form id="updateForm" method="POST" action="?/update" use:enhance={enhanceUpdate}>
				<input type="hidden" name="id" value={selectedTemplate.id} />
				<input type="hidden" name="is_active" value={edits.is_active ? 'true' : 'false'} />
				<input type="hidden" name="fields_json" value={fieldsJson} />

				<!-- Tabs -->
				<SectionCard title="Embed Editor">
					<div class="mb-4 flex flex-wrap gap-1 border-b border-slate-800/80 pb-px">
						{#each tabs as tab (tab.key)}
							<button
								type="button"
								class="border-b-2 px-3 py-2 text-ui font-bold tracking-widest uppercase transition-all {activeTab ===
								tab.key
									? 'border-cyan-500 text-cyan-400'
									: 'border-transparent text-slate-500 hover:text-slate-300'}"
								onclick={() => (activeTab = tab.key)}
							>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- ── Metadata Tab ─────────────────────────────────────── -->
					<div class={activeTab !== 'metadata' ? 'hidden' : ''}>
						<div class="space-y-4">
							<div>
								<label for="tmplName" class="label-caps">Template Name</label>
								<input
									id="tmplName"
									name="name"
									type="text"
									bind:value={edits.name}
									aria-invalid={!!updateNameError}
									class="input-dark {updateNameError ? 'border-rose-500/60 ring-1 ring-rose-500/50' : ''}"
								/>
								{#if updateNameError}<p class="mt-1 text-xs text-rose-400">{updateNameError}</p>{/if}
							</div>
							<div>
								<label for="tmplDesc" class="label-caps">Description</label>
								<textarea
									id="tmplDesc"
									name="description"
									rows="2"
									bind:value={edits.description}
									class="input-dark"
								></textarea>
							</div>
							<div>
								<label for="tmplKey" class="label-caps">Template Key</label>
								<p class="mb-1 text-xs text-slate-500">
									Maps to bot commands. The bot looks up the active template for this key.
								</p>
								<input
									id="tmplKey"
									name="template_key"
									type="text"
									bind:value={edits.template_key}
									list="keySuggestions"
									class="input-dark"
								/>
								<datalist id="keySuggestions">
									{#each keySuggestions as key}
										<option value={key}></option>
									{/each}
								</datalist>
							</div>
						</div>
					</div>

					<!-- ── Author Tab ────────────────────────────────────────── -->
					<div class={activeTab !== 'author' ? 'hidden' : ''}>
						<div class="space-y-4">
							<input type="hidden" name="author_enabled" value={edits.author_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-author"
								label="Show Author"
								checked={edits.author_enabled}
								onChange={(val) => (edits.author_enabled = val)}
							/>
							{#if edits.author_enabled}
								<div>
									<label for="authorName" class="label-caps">Author Name</label>
									<input
										id="authorName"
										name="author_name"
										type="text"
										bind:value={edits.author_name}
										class="input-dark"
										placeholder={'e.g. {{bot.name}}'}
									/>
								</div>
								<div>
									<label for="authorUrl" class="label-caps">Author URL</label>
									<input
										id="authorUrl"
										name="author_url"
										type="text"
										bind:value={edits.author_url}
										class="input-dark"
										placeholder={'e.g. {{movie.badmoviesUrl}}'}
									/>
								</div>
								<div>
									<label for="authorIconUrl" class="label-caps">Author Icon URL</label>
									<input
										id="authorIconUrl"
										name="author_icon_url"
										type="text"
										bind:value={edits.author_icon_url}
										class="input-dark"
										placeholder={'e.g. {{bot.avatarUrl}}'}
									/>
								</div>
							{/if}
						</div>
					</div>

					<!-- ── Content Tab ───────────────────────────────────────── -->
					<div class={activeTab !== 'content' ? 'hidden' : ''}>
						<div class="space-y-4">
							<!-- Title -->
							<input type="hidden" name="title_enabled" value={edits.title_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-title"
								label="Show Title"
								checked={edits.title_enabled}
								onChange={(val) => (edits.title_enabled = val)}
							/>
							{#if edits.title_enabled}
								<div>
									<label for="titleText" class="label-caps">Title Text</label>
									<input
										id="titleText"
										name="title_text"
										type="text"
										bind:value={edits.title_text}
										class="input-dark"
										placeholder={'e.g. {{movie.title}} ({{movie.year}})'}
									/>
									<p class="mt-1 text-xs text-slate-500">Max 256 characters</p>
								</div>
							{/if}

							<!-- Description -->
							<input type="hidden" name="description_enabled" value={edits.description_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-desc"
								label="Show Description"
								checked={edits.description_enabled}
								onChange={(val) => (edits.description_enabled = val)}
							/>
							{#if edits.description_enabled}
								<div>
									<label for="descText" class="label-caps">Description Text</label>
									<textarea
										id="descText"
										name="description_text"
										rows="4"
										bind:value={edits.description_text}
										class="input-dark"
										placeholder={'e.g. {{movie.overview}}'}
									></textarea>
									<p class="mt-1 text-xs text-slate-500">Max 4096 characters</p>
								</div>
							{/if}

							<!-- URL -->
							<input type="hidden" name="url_enabled" value={edits.url_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-url"
								label="Show URL (makes title clickable)"
								checked={edits.url_enabled}
								onChange={(val) => (edits.url_enabled = val)}
							/>
							{#if edits.url_enabled}
								<div>
									<label for="urlText" class="label-caps">Embed URL</label>
									<input
										id="urlText"
										name="url_text"
										type="text"
										bind:value={edits.url_text}
										class="input-dark"
										placeholder={'e.g. {{movie.badmoviesUrl}}'}
									/>
								</div>
							{/if}

							<!-- Color -->
							<div class="border-t border-slate-800/50 pt-4">
								<label for="accentColor" class="label-caps">Accent Color</label>
								<div class="mt-2 flex gap-2">
									<input
										id="accentColor"
										type="color"
										bind:value={edits.color}
										class="h-9 w-9 cursor-pointer rounded border border-slate-800/80 bg-slate-950"
									/>
									<input
										type="text"
										name="color"
										bind:value={edits.color}
										class="input-dark uppercase"
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- ── Media Tab ─────────────────────────────────────────── -->
					<div class={activeTab !== 'media' ? 'hidden' : ''}>
						<div class="space-y-4">
							<!-- Thumbnail -->
							<input type="hidden" name="thumbnail_enabled" value={edits.thumbnail_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-thumbnail"
								label="Show Thumbnail"
								checked={edits.thumbnail_enabled}
								onChange={(val) => (edits.thumbnail_enabled = val)}
							/>
							{#if edits.thumbnail_enabled}
								<div>
									<label for="thumbnailUrl" class="label-caps">Thumbnail URL</label>
									<input
										id="thumbnailUrl"
										name="thumbnail_url"
										type="text"
										bind:value={edits.thumbnail_url}
										class="input-dark"
										placeholder={'e.g. {{movie.posterUrl}}'}
									/>
								</div>
							{/if}

							<!-- Large Image -->
							<input type="hidden" name="image_enabled" value={edits.image_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-image"
								label="Show Large Image"
								checked={edits.image_enabled}
								onChange={(val) => (edits.image_enabled = val)}
							/>
							{#if edits.image_enabled}
								<div>
									<label for="imageUrl" class="label-caps">Image URL</label>
									<input
										id="imageUrl"
										name="image_url"
										type="text"
										bind:value={edits.image_url}
										class="input-dark"
										placeholder={'e.g. {{experiment.imageUrl}}'}
									/>
								</div>
							{/if}
						</div>
					</div>

					<!-- ── Fields Tab ────────────────────────────────────────── -->
					<div class={activeTab !== 'fields' ? 'hidden' : ''}>
						<EmbedFieldEditor bind:fields={embedFields} />
					</div>

					<!-- ── Footer Tab ────────────────────────────────────────── -->
					<div class={activeTab !== 'footer' ? 'hidden' : ''}>
						<div class="space-y-4">
							<input type="hidden" name="footer_enabled" value={edits.footer_enabled ? 'true' : 'false'} />
							<TemplateFieldToggle
								id="toggle-footer"
								label="Show Footer"
								checked={edits.footer_enabled}
								onChange={(val) => (edits.footer_enabled = val)}
							/>
							{#if edits.footer_enabled}
								<div>
									<label for="footerText" class="label-caps">Footer Text</label>
									<input
										id="footerText"
										name="footer_text"
										type="text"
										bind:value={edits.footer_text}
										class="input-dark"
										placeholder={'e.g. {{bot.name}} | Requested by {{user}}'}
									/>
									<p class="mt-1 text-xs text-slate-500">Max 2048 characters</p>
								</div>
								<div>
									<label for="footerIconUrl" class="label-caps">Footer Icon URL</label>
									<input
										id="footerIconUrl"
										name="footer_icon_url"
										type="text"
										bind:value={edits.footer_icon_url}
										class="input-dark"
										placeholder={'e.g. {{bot.avatarUrl}}'}
									/>
								</div>
							{/if}

							<div class="border-t border-slate-800/50 pt-4">
								<input type="hidden" name="timestamp_enabled" value={edits.timestamp_enabled ? 'true' : 'false'} />
								<TemplateFieldToggle
									id="toggle-timestamp"
									label="Show Timestamp"
									checked={edits.timestamp_enabled}
									onChange={(val) => (edits.timestamp_enabled = val)}
								/>
							</div>
						</div>
					</div>
				</SectionCard>

				<!-- Action Buttons -->
				<div class="flex flex-wrap gap-3">
					<button
						type="submit"
						class="rounded border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-label font-bold tracking-widest text-cyan-400 uppercase shadow-glow-cyan-sm-soft transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-glow-cyan-sm-hover"
						>Save</button
					>
					<button
						type="submit"
						form="duplicateForm"
						class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:bg-slate-700 hover:text-slate-200"
						>Duplicate</button
					>
					{#if !edits.is_active}
						<button
							type="submit"
							form="setActiveForm"
							class="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-label font-bold tracking-widest text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
							>Set Active</button
						>
					{/if}
					<div class="flex-1"></div>
					<button
						type="submit"
						form="deleteForm"
						disabled={edits.is_active || (data.templates as RecordModel[]).length <= 1}
						class="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
						>Delete</button
					>
				</div>
			</form>
		{/if}
	</div>

	<!-- ── Right Panel: Preview + Variables ─────────────────────────────── -->
	<div class="space-y-6 xl:col-span-4">
		<SectionCard title="Live Preview">
			<div class="rounded-lg bg-slate-950 p-2 shadow-inset-form-deep">
				<DiscordTemplatePreview template={previewTemplate} />
			</div>
		</SectionCard>

		<SectionCard title="Template Variables">
			<p class="mb-3 text-xs text-slate-500">
				Available variables for the <code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400"
					>{edits.template_key || '...'}</code
				> key. Wrap in <code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400"
					>{'{{ }}'}</code
				>.
			</p>

			{#if templateKeyVars.length > 0}
				<div class="rounded border border-slate-800/80 bg-slate-900/50 p-4">
					<ul class="space-y-2">
						{#each templateKeyVars as v (v.name)}
							<li class="flex items-start gap-2">
								<code class="rounded bg-slate-800/80 px-1.5 py-0.5 text-xs text-fuchsia-400"
									>{'{{' + v.name + '}}'}</code
								>
								<span class="text-xs text-slate-400">{v.description}</span>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="text-xs text-slate-500">
					No predefined variables for this key. You can still use common variables (see below).
				</p>
			{/if}

			<div class="mt-4">
				<h3 class="mb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Common Variables</h3>
				<div class="rounded border border-slate-800/80 bg-slate-900/50 p-4">
					<ul class="space-y-2">
						{#each data.commonVariables as v (v.name)}
							<li class="flex items-start gap-2">
								<code class="rounded bg-slate-800/80 px-1.5 py-0.5 text-xs text-fuchsia-400"
									>{'{{' + v.name + '}}'}</code
								>
								<span class="text-xs text-slate-400">{v.description}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</SectionCard>

		<SectionCard title="Discord Limits">
			<ul class="space-y-2">
				{#each discordLimits as limit (limit.limit)}
					<li
						class="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0"
					>
						<span class="text-xs font-bold text-slate-300">{limit.limit}</span>
						<span class="text-xs text-fuchsia-400">{limit.max}</span>
					</li>
				{/each}
			</ul>
		</SectionCard>
	</div>
</div>
