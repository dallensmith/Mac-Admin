<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import type { TemplateButtonConfig } from '../../types/pocketbase.js';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import DiscordTemplatePreview from '$lib/components/ui/DiscordTemplatePreview.svelte';
	import TemplateVariableList from '$lib/components/ui/TemplateVariableList.svelte';
	import TemplateFieldToggle from '$lib/components/ui/TemplateFieldToggle.svelte';
	import { mockVariables, discordLimits, defaultTemplateData } from '$lib/mock/templates';

	let { data, form }: { data: import('./$types').PageData; form: import('./$types').ActionData } =
		$props();

	let selectedTemplateId = $state<string>((data.templates[0] as RecordModel | undefined)?.id ?? '');

	// Auto-select a newly created template when the server returns its id
	$effect(() => {
		const created = (form as Record<string, unknown> | null)?.createdId;
		if (typeof created === 'string') selectedTemplateId = created;
	});

	// If the selected id disappears from the list (e.g. after delete), fall back to first
	$effect(() => {
		const ids = (data.templates as RecordModel[]).map((t) => t.id);
		if (ids.length > 0 && !ids.includes(selectedTemplateId)) {
			selectedTemplateId = ids[0];
		}
	});

	let selectedTemplate = $derived(
		(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId)
	);

	// ── Mutable editing fields (drives live preview) ───────────────────────────
	let templateName = $state('');
	let templateKey = $state('');
	let templateDescription = $state('');
	let titleFormat = $state(defaultTemplateData.titleFormat);
	let descriptionFormat = $state(defaultTemplateData.descriptionFormat);
	let accentColor = $state(defaultTemplateData.accentColor);
	let footerText = $state(defaultTemplateData.footerText);
	let thumbnailEnabled = $state(defaultTemplateData.thumbnailEnabled);
	let imageEnabled = $state(defaultTemplateData.imageEnabled);
	let timestampEnabled = $state(defaultTemplateData.timestampEnabled);
	let showDirector = $state(defaultTemplateData.showDirector);
	let showActors = $state(defaultTemplateData.showActors);
	let showRating = $state(defaultTemplateData.showRating);
	let showGenres = $state(defaultTemplateData.showGenres);
	let buttons = $state<TemplateButtonConfig[]>([]);
	let expandedButtonIdx = $state<number | null>(null);

	// Sync editing fields when the selected template changes
	$effect(() => {
		const t = selectedTemplate;
		if (!t) return;
		templateName = String(t.name ?? '');
		templateKey = String(t.template_key ?? '');
		templateDescription = String(t.description ?? '');
		titleFormat = String(t.title_format ?? defaultTemplateData.titleFormat);
		descriptionFormat = String(t.description_format ?? defaultTemplateData.descriptionFormat);
		accentColor = String(t.accent_color ?? defaultTemplateData.accentColor);
		footerText = String(t.footer_text ?? defaultTemplateData.footerText);
		thumbnailEnabled = Boolean(t.thumbnail_enabled ?? defaultTemplateData.thumbnailEnabled);
		imageEnabled = Boolean(t.image_enabled ?? defaultTemplateData.imageEnabled);
		timestampEnabled = Boolean(t.timestamp_enabled ?? defaultTemplateData.timestampEnabled);
		showDirector = Boolean(t.show_director ?? defaultTemplateData.showDirector);
		showActors = Boolean(t.show_actors ?? defaultTemplateData.showActors);
		showRating = Boolean(t.show_rating ?? defaultTemplateData.showRating);
		showGenres = Boolean(t.show_genres ?? defaultTemplateData.showGenres);
		expandedButtonIdx = null;
		try {
			buttons = JSON.parse(String(t.buttons || '[]'));
		} catch {
			buttons = [];
		}
	});

	// Shape expected by DiscordTemplatePreview (camelCase keys)
	let previewData = $derived({
		titleFormat,
		descriptionFormat,
		accentColor,
		footerText,
		thumbnailEnabled,
		imageEnabled,
		timestampEnabled,
		showDirector,
		showActors,
		showRating,
		showGenres,
		buttons
	});

	// ── Button builder helpers ─────────────────────────────────────────────────
	function addButton() {
		buttons.push({ type: 'link', label: 'New Button', style: 'secondary', row: 0 });
		expandedButtonIdx = buttons.length - 1;
	}

	function removeButton(idx: number) {
		buttons.splice(idx, 1);
		if (expandedButtonIdx === idx) expandedButtonIdx = null;
		else if (expandedButtonIdx !== null && expandedButtonIdx > idx) expandedButtonIdx--;
	}
</script>

<!-- Hoisted forms (cannot be nested inside the editor form) -->
<form id="createForm" method="POST" action="?/create" use:enhance></form>
<form id="deleteForm" method="POST" action="?/delete" use:enhance>
	<input type="hidden" name="id" value={selectedTemplate?.id ?? ''} />
</form>

<PageHeader
	title="Discord Templates"
	description="Customize the appearance of bot messages and embeds."
/>

{#if form?.error}
	<div class="mb-4 rounded border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
		{form.error}
	</div>
{/if}

<div class="grid gap-6 xl:grid-cols-12">
	<!-- ── Template list sidebar ─────────────────────────────────────────────── -->
	<div class="xl:col-span-3">
		<SectionCard title="Templates">
			<div class="space-y-1">
				{#each data.templates as t (t.id)}
					{@const rec = t as RecordModel}
					<button
						type="button"
						class="w-full rounded px-3 py-2 text-left text-sm transition-colors {rec.id ===
						selectedTemplateId
							? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
							: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}"
						onclick={() => (selectedTemplateId = rec.id)}
					>
						<span class="block font-medium">{rec.name}</span>
						<span class="block truncate font-mono text-[10px] opacity-50">{rec.template_key}</span>
					</button>
				{:else}
					<p class="py-2 text-xs text-slate-500">No templates yet.</p>
				{/each}
			</div>
			<div class="mt-4 border-t border-slate-800/60 pt-4">
				<button form="createForm" type="submit" class="btn-cyan w-full text-sm">
					+ New Template
				</button>
			</div>
		</SectionCard>
	</div>

	<!-- ── Main editor ──────────────────────────────────────────────────────── -->
	<div class="space-y-6 xl:col-span-5">
		{#if selectedTemplate}
			<form id="updateForm" method="POST" action="?/update" use:enhance>
				<!-- Hidden id -->
				<input type="hidden" name="id" value={selectedTemplate.id} />
				<!-- Boolean fields as hidden inputs (TemplateFieldToggle is presentational only) -->
				<input type="hidden" name="thumbnail_enabled" value={String(thumbnailEnabled)} />
				<input type="hidden" name="image_enabled" value={String(imageEnabled)} />
				<input type="hidden" name="timestamp_enabled" value={String(timestampEnabled)} />
				<input type="hidden" name="show_director" value={String(showDirector)} />
				<input type="hidden" name="show_actors" value={String(showActors)} />
				<input type="hidden" name="show_rating" value={String(showRating)} />
				<input type="hidden" name="show_genres" value={String(showGenres)} />
				<input type="hidden" name="buttons" value={JSON.stringify(buttons)} />
				<div class="space-y-6">
					<SectionCard title="Template Info">
						<div class="space-y-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="templateName" class="label-caps">Name</label>
									<input
										id="templateName"
										name="name"
										type="text"
										bind:value={templateName}
										class="input-dark"
									/>
								</div>
								<div>
									<label for="templateKey" class="label-caps">Template Key</label>
									<input
										id="templateKey"
										name="template_key"
										type="text"
										bind:value={templateKey}
										class="input-dark font-mono text-xs"
									/>
								</div>
							</div>
							<div>
								<label for="templateDesc" class="label-caps">Description</label>
								<input
									id="templateDesc"
									name="description"
									type="text"
									bind:value={templateDescription}
									class="input-dark"
								/>
							</div>
						</div>
					</SectionCard>

					<SectionCard title="Content Formatting">
						<div class="space-y-4">
							<div>
								<label for="titleFormat" class="label-caps">Embed Title</label>
								<input
									id="titleFormat"
									name="title_format"
									type="text"
									bind:value={titleFormat}
									class="input-dark"
								/>
							</div>
							<div>
								<label for="descFormat" class="label-caps">Description Body</label>
								<textarea
									id="descFormat"
									name="description_format"
									rows="3"
									bind:value={descriptionFormat}
									class="input-dark"
								></textarea>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="accentColor" class="label-caps">Accent Color</label>
									<div class="mt-2 flex gap-2">
										<input
											id="accentColor"
											type="color"
											bind:value={accentColor}
											class="h-9 w-9 cursor-pointer rounded border border-slate-800/80 bg-slate-950"
										/>
										<input
											name="accent_color"
											type="text"
											bind:value={accentColor}
											class="block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 uppercase shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
										/>
									</div>
								</div>
								<div>
									<label for="footerText" class="label-caps">Footer Text</label>
									<input
										id="footerText"
										name="footer_text"
										type="text"
										bind:value={footerText}
										class="input-dark"
									/>
								</div>
							</div>
						</div>
					</SectionCard>

					<SectionCard title="Visibility Toggles">
						<div class="grid gap-y-4 sm:grid-cols-2">
							<TemplateFieldToggle
								id="toggle-thumbnail"
								label="Show Thumbnail"
								checked={thumbnailEnabled}
								onChange={(val) => (thumbnailEnabled = val)}
							/>
							<TemplateFieldToggle
								id="toggle-image"
								label="Show Large Image"
								checked={imageEnabled}
								onChange={(val) => (imageEnabled = val)}
							/>
							<TemplateFieldToggle
								id="toggle-timestamp"
								label="Show Timestamp"
								checked={timestampEnabled}
								onChange={(val) => (timestampEnabled = val)}
							/>
							<TemplateFieldToggle
								id="toggle-director"
								label="Show Director Field"
								checked={showDirector}
								onChange={(val) => (showDirector = val)}
							/>
							<TemplateFieldToggle
								id="toggle-actors"
								label="Show Cast Field"
								checked={showActors}
								onChange={(val) => (showActors = val)}
							/>
							<TemplateFieldToggle
								id="toggle-rating"
								label="Show Rating Field"
								checked={showRating}
								onChange={(val) => (showRating = val)}
							/>
							<TemplateFieldToggle
								id="toggle-genres"
								label="Show Genres Field"
								checked={showGenres}
								onChange={(val) => (showGenres = val)}
							/>
						</div>
					</SectionCard>

					<SectionCard title="Buttons">
						{#if buttons.length === 0}
							<p class="py-1 text-xs text-slate-500">
								No buttons configured. Buttons appear beneath the embed.
							</p>
						{:else}
							<div class="space-y-2">
								{#each buttons as btn, idx (idx)}
									{@const isExpanded = expandedButtonIdx === idx}
									<div
										class="rounded border {isExpanded
											? 'border-cyan-500/30 bg-slate-900/60'
											: 'border-slate-800/60 bg-slate-900/40'} transition-all duration-200"
									>
										<!-- Collapsed row -->
										<div
											role="button"
											tabindex="0"
											class="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5"
											onclick={() => (expandedButtonIdx = isExpanded ? null : idx)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ')
													expandedButtonIdx = isExpanded ? null : idx;
											}}
										>
											<span
												class="shrink-0 rounded px-1.5 py-0.5 font-bold uppercase {btn.type ===
												'link'
													? 'bg-sky-500/15 text-sky-400'
													: 'bg-fuchsia-500/15 text-fuchsia-400'}"
												style="font-size: var(--text-label)">{btn.type}</span
											>
											<span
												class="shrink-0 rounded px-1.5 py-0.5 font-bold uppercase {btn.style ===
												'primary'
													? 'bg-indigo-500/20 text-indigo-300'
													: btn.style === 'success'
														? 'bg-emerald-500/20 text-emerald-400'
														: btn.style === 'danger'
															? 'bg-rose-500/20 text-rose-400'
															: 'bg-slate-700/50 text-slate-400'}"
												style="font-size: var(--text-label)">{btn.style}</span
											>
											<span class="flex-1 truncate text-sm text-slate-200"
												>{btn.emoji ? `${btn.emoji} ` : ''}{btn.label || '(no label)'}</span
											>
											<span class="shrink-0 text-xs text-slate-500">row {btn.row}</span>
											<button
												type="button"
												class="ml-1 shrink-0 rounded p-0.5 text-slate-600 transition-colors hover:text-rose-400"
												onclick={(e) => {
													e.stopPropagation();
													removeButton(idx);
												}}
												aria-label="Remove button"
											>
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'}
											</button>
										</div>
										<!-- Expanded editor -->
										{#if isExpanded}
											<div class="space-y-3 border-t border-slate-800/60 p-3">
												<div class="grid gap-3 sm:grid-cols-3">
													<div>
														<label for="btn-type-{idx}" class="label-caps">Type</label>
														<select
															id="btn-type-{idx}"
															bind:value={buttons[idx].type}
															class="input-dark"
														>
															<option value="link">Link</option>
															<option value="action">Action</option>
														</select>
													</div>
													<div>
														<label for="btn-style-{idx}" class="label-caps">Style</label>
														<select
															id="btn-style-{idx}"
															bind:value={buttons[idx].style}
															class="input-dark"
														>
															<option value="primary">Primary</option>
															<option value="secondary">Secondary</option>
															<option value="success">Success</option>
															<option value="danger">Danger</option>
														</select>
													</div>
													<div>
														<label for="btn-row-{idx}" class="label-caps"
															>Row <span class="text-slate-500 normal-case">(0–4)</span></label
														>
														<input
															id="btn-row-{idx}"
															type="number"
															min="0"
															max="4"
															class="input-dark"
															bind:value={buttons[idx].row}
														/>
													</div>
												</div>
												<div class="grid gap-3 sm:grid-cols-2">
													<div>
														<label for="btn-label-{idx}" class="label-caps">Label</label>
														<input
															id="btn-label-{idx}"
															type="text"
															class="input-dark"
															bind:value={buttons[idx].label}
														/>
													</div>
													<div>
														<label for="btn-emoji-{idx}" class="label-caps"
															>Emoji <span class="text-slate-500 normal-case">(optional)</span
															></label
														>
														<input
															id="btn-emoji-{idx}"
															type="text"
															class="input-dark"
															placeholder="🎬"
															bind:value={buttons[idx].emoji}
														/>
													</div>
												</div>
												<div>
													<label for="btn-condition-{idx}" class="label-caps"
														>Condition <span class="text-slate-500 normal-case"
															>(optional token key)</span
														></label
													>
													<input
														id="btn-condition-{idx}"
														type="text"
														class="input-dark font-mono text-xs"
														placeholder="movie.badmoviesUrl"
														bind:value={buttons[idx].condition}
													/>
													<p class="mt-1.5 text-xs text-slate-500">
														Button is omitted if this token resolves to an empty string.
													</p>
												</div>
												{#if btn.type === 'link'}
													<div>
														<label for="btn-url-{idx}" class="label-caps">URL</label>
														<input
															id="btn-url-{idx}"
															type="text"
															class="input-dark font-mono text-xs"
															placeholder="&#123;&#123;movie.badmoviesUrl&#125;&#125;"
															bind:value={buttons[idx].url}
														/>
													</div>
												{:else}
													<div class="grid gap-3 sm:grid-cols-2">
														<div>
															<label for="btn-actionkey-{idx}" class="label-caps">Action Key</label>
															{#if data.buttonActions.length > 0}
																<select
																	id="btn-actionkey-{idx}"
																	class="input-dark font-mono text-xs"
																	bind:value={buttons[idx].action_key}
																>
																	<option value="">— select action —</option>
																	{#each data.buttonActions as action (action.id)}
																		<option value={action.action_key}>{action.name}</option>
																	{/each}
																</select>
															{:else}
																<p class="mt-2 text-xs text-slate-500 italic">
																	No actions defined yet. Create one on the <a
																		href="/button-actions"
																		class="text-cyan-400 hover:underline">Button Actions</a
																	> page.
																</p>
															{/if}
														</div>
														<div>
															<label for="btn-ctx-{idx}" class="label-caps">Context Template</label>
															<input
																id="btn-ctx-{idx}"
																type="text"
																class="input-dark font-mono text-xs"
																placeholder="&#123;&#123;movie.title&#125;&#125;"
																bind:value={buttons[idx].ctx_template}
															/>
														</div>
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
						<div class="mt-4 border-t border-slate-800/60 pt-4">
							<button type="button" class="btn-cyan w-full text-sm" onclick={addButton}>
								+ Add Button
							</button>
						</div>
					</SectionCard>

					<div class="flex items-center justify-between gap-3">
						<button type="submit" form="deleteForm" class="btn-ghost">Delete Template</button>
						<button type="submit" class="btn-cyan">Save Template</button>
					</div>
				</div>
			</form>

			<SectionCard title="Variables & References">
				<div class="grid gap-6 md:grid-cols-2">
					<TemplateVariableList title="Movie Variables" variables={mockVariables['Movie Lookup']} />
					<TemplateVariableList
						title="Experiment Variables"
						variables={mockVariables['Experiment Lookup']}
					/>
				</div>
			</SectionCard>
		{:else}
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 py-16 text-center"
			>
				<p class="text-sm text-slate-400">No template selected.</p>
				<p class="mt-1 text-xs text-slate-500">Create a template to get started.</p>
			</div>
		{/if}
	</div>

	<!-- ── Right panel: preview & limits ─────────────────────────────────────── -->
	<div class="space-y-6 xl:col-span-4">
		<SectionCard title="Live Preview">
			<div class="rounded-lg bg-slate-950 p-2 shadow-inset-form-deep">
				<DiscordTemplatePreview templateData={previewData} />
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
