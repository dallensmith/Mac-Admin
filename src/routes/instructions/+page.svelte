<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

	let { data } = $props();

	let selectedTemplateId = $state<string>((data.templates[0] as RecordModel)?.id ?? '');

	let selectedTemplate = $derived<RecordModel>(
		(data.templates as RecordModel[]).find((t) => t.id === selectedTemplateId) ??
			(data.templates[0] as RecordModel)
	);

	const tabs = [
		{ key: 'system.md', field: 'system' },
		{ key: 'behavior.md', field: 'behavior' },
		{ key: 'resources.md', field: 'resources' },
		{ key: 'conversation-rules.json', field: 'conversation_rules' },
		{ key: 'response-templates.json', field: 'response_templates' }
	] as const;

	type TabKey = (typeof tabs)[number]['key'];
	let activeTab = $state<TabKey>('system.md');

	// Local editable state — synced when selected template changes
	let edits = $state<Record<string, string>>({
		name: '',
		description: '',
		system: '',
		behavior: '',
		resources: '',
		conversation_rules: '',
		response_templates: ''
	});

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
			response_templates: t.response_templates ?? ''
		};
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

	function statusFromRecord(t: RecordModel): string {
		if (t.is_active) return 'active';
		if (t.is_default) return 'default';
		return 'inactive';
	}

	function activeTabContent(): string {
		const tab = tabs.find((t) => t.key === activeTab);
		if (!tab) return '';
		return edits[tab.field] ?? '';
	}

	// Is the selected template the bot-managed default (read-only)?
	let isDefaultProfile = $derived((selectedTemplate as RecordModel)?.is_default === true);

	// enhance callbacks
	const enhanceCreate = () =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
			selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
		};

	const enhanceDelete = () =>
		async ({ update }: { update: () => Promise<void> }) => {
			await update();
			selectedTemplateId = (data.templates[0] as RecordModel)?.id ?? '';
		};
</script>

<PageHeader
	title="Instruction Templates"
	description="Manage bot personalities and system profiles."
/>

<div
	class="mb-6 rounded border border-rose-500/30 bg-rose-500/10 p-4 shadow-glow-rose-sm"
>
	<div class="flex items-start gap-3">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-triangle-alert shrink-0 text-rose-400"
			><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path
				d="M12 9v4"
			/><path d="M12 17h.01" /></svg
		>
		<div>
			<h3 class="text-ui font-bold tracking-widest text-rose-400 uppercase drop-shadow-sm">
				Caution
			</h3>
			<ul class="mt-1 list-inside list-disc text-xs text-rose-300/80">
				<li>Changing bot instructions can dramatically affect bot behavior.</li>
				<li>Test profiles using the `experimental` tag before setting them active.</li>
				<li>Do not store API keys or secrets in instruction templates.</li>
			</ul>
		</div>
	</div>
</div>

<!-- Hidden action forms (no nesting — use form= attribute on buttons) -->
<form id="createForm" method="POST" action="?/create" use:enhance={enhanceCreate}></form>
<form id="setActiveForm" method="POST" action="?/setActive" use:enhance>
	<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>
<form id="duplicateForm" method="POST" action="?/duplicate" use:enhance>
	<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>
<form id="deleteForm" method="POST" action="?/delete" use:enhance={enhanceDelete}>
	<input type="hidden" name="id" value={selectedTemplate?.id} />
</form>

<div class="grid gap-6 xl:grid-cols-12">
	<!-- Left Sidebar: Templates List -->
	<div class="space-y-4 xl:col-span-3">
		<SectionCard title="Bot Profiles">
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
					<button
						type="button"
						class="group flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-200 {selectedTemplateId ===
						t.id
							? 'border-cyan-500/50 bg-slate-800/80 shadow-glow-cyan-sm'
							: 'border-slate-800/60 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-800/50'}"
						onclick={() => (selectedTemplateId = t.id)}
					>
					<div class="flex w-full items-start justify-between">
						<div class="flex items-center gap-1.5">
						{#if t.is_default}
						<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-slate-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
						{/if}
								<span
									class="text-ui font-bold tracking-widest uppercase transition-colors {selectedTemplateId ===
									t.id
										? 'text-cyan-400'
										: 'text-slate-300 group-hover:text-cyan-400'}">{t.name}</span
								>
						</div>
							<StatusBadge status={statusFromRecord(t as RecordModel)} />
						</div>
						<span class="line-clamp-2 text-xs text-slate-400">{t.description}</span>
						<span class="text-label-xs font-bold tracking-widest text-slate-500 uppercase"
							>Edited: {(t.updated as string).slice(0, 10)}</span
						>
					</button>
				{/each}
			</div>
		</SectionCard>
	</div>

	<!-- Main Area: Editor -->
	<div class="space-y-6 xl:col-span-6">
		{#if selectedTemplate}
			<form id="updateForm" method="POST" action="?/update" use:enhance>
				<input type="hidden" name="id" value={selectedTemplate.id} />
				{#if isDefaultProfile}
					<div class="mb-4 rounded border border-slate-700/50 bg-slate-800/40 p-4">
						<div class="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
							<div>
								<p class="text-ui font-bold tracking-widest text-slate-300 uppercase">Read-Only — Bot Managed</p>
								<p class="mt-1 text-xs text-slate-500">This profile is populated by the bot from its <code class="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-slate-400">config/instructions/</code> files on startup. No edits can be made here.</p>
							</div>
						</div>
					</div>
				{/if}
				<SectionCard title="Template Metadata">
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="profileName" class="label-caps">Profile Name</label>
							<input
								id="profileName"
								name="name"
								type="text"
								bind:value={edits.name}
								readonly={isDefaultProfile}
								class="input-dark {isDefaultProfile ? 'cursor-default opacity-60' : ''}"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="profileDesc" class="label-caps">Description</label>
							<textarea
								id="profileDesc"
								name="description"
								rows="2"
								bind:value={edits.description}
								readonly={isDefaultProfile}
								class="input-dark {isDefaultProfile ? 'cursor-default opacity-60' : ''}"
							></textarea>
						</div>
					</div>

					<div class="mt-6 flex flex-wrap gap-3 border-t border-slate-800/50 pt-4">
						{#if !selectedTemplate.is_active}
							<button
								type="submit"
								form="setActiveForm"
								class="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-label font-bold tracking-widest text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
							>Set Active</button>
						{/if}
						{#if !isDefaultProfile}
							<button
								type="submit"
								class="rounded border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-label font-bold tracking-widest text-cyan-400 uppercase shadow-glow-cyan-sm-soft transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-glow-cyan-sm-hover"
							>Save</button>
						{/if}
						<button
							type="submit"
							form="duplicateForm"
							class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:bg-slate-700 hover:text-slate-200"
						>Duplicate</button>
						<div class="flex-1"></div>
						<button
							type="submit"
							form="deleteForm"
						disabled={selectedTemplate.is_active || selectedTemplate.is_default || (data.templates as RecordModel[]).length <= 1}
							class="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
						>Delete</button>
					</div>
				</SectionCard>

				<SectionCard title="Instruction Files">
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
								{tab.key}
							</button>
						{/each}
					</div>

					<!-- Render all 5 textareas; hide non-active so all values are included in FormData -->
					{#each tabs as tab (tab.key)}
						<textarea
							name={tab.field}
							bind:value={edits[tab.field]}
							readonly={isDefaultProfile}
							class="h-100 w-full resize-none rounded border border-slate-800/80 bg-slate-950/50 p-4 font-mono text-sm text-slate-300 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none {isDefaultProfile
								? 'cursor-default opacity-70 focus:border-slate-800/80 focus:ring-0'
								: ''} {activeTab !== tab.key ? 'hidden' : ''}"
						></textarea>
					{/each}
				</SectionCard>
			</form>
		{:else}
			<div class="flex h-64 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/40">
				<p class="text-sm text-slate-500">No templates found. Create one to get started.</p>
			</div>
		{/if}
	</div>

	<!-- Right Sidebar: Preview & Context -->
	<div class="space-y-6 xl:col-span-3">
		{#if selectedTemplate}
			<SectionCard title="Bot Preview">
				<div class="mb-4 text-center">
					<div
						class="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 shadow-glow-fuchsia-sm"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-bot text-fuchsia-400 drop-shadow-glow-fuchsia-xl"
							><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path
								d="M2 14h2"
							/><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg
						>
					</div>
					<h4 class="text-sm font-bold tracking-widest text-fuchsia-400 uppercase drop-shadow-sm">
						{selectedTemplate.name}
					</h4>
					<div class="mt-1">
						<StatusBadge status={statusFromRecord(selectedTemplate)} />
					</div>
					{#if selectedTemplate.description}
						<p class="mt-2 text-xs text-slate-400">{selectedTemplate.description}</p>
					{/if}
				</div>

				<div
					class="group relative overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/80 p-4"
				>
					<div
						class="pointer-events-none absolute inset-0 bg-linear-to-b from-fuchsia-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
					<div class="relative z-10 flex items-start gap-3">
						<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-discord">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-white"
								><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path
									d="M2 14h2"
								/><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg
							>
						</div>
						<div>
							<div class="flex items-baseline gap-2">
								<span class="text-ui font-bold text-white">Smart Mac</span>
								<span class="text-label-xs text-discord-muted">Today at 4:20 PM</span>
							</div>
							<p class="mt-1 text-xs text-discord-text italic">
								"{activeTabContent()
									? activeTabContent().slice(0, 160) +
										(activeTabContent().length > 160 ? '…' : '')
									: 'No content on this tab yet.'}"
							</p>
						</div>
					</div>
				</div>
			</SectionCard>
		{/if}
	</div>
</div>
