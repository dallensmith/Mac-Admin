<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import { mockTemplates, type InstructionTemplate } from '$lib/mock/instructionTemplates';

	// TODO: Persist templates to database
	// TODO: Load active profile into bot runtime
	// TODO: Push instruction changes to bot service
	// TODO: Add audit log for instruction changes
	// TODO: Restrict dangerous template editing to super admins

	// We use deep clones for local mock mutations
	let templates = $state(JSON.parse(JSON.stringify(mockTemplates)) as InstructionTemplate[]);
	let selectedTemplateId = $state(mockTemplates[0].id);

	let selectedTemplate = $derived(templates.find((t) => t.id === selectedTemplateId)!);

	let activeTab = $state<'system.md' | 'behavior.md' | 'tools.md' | 'personality.md'>('system.md');

	function handleNewTemplate() {
		const newId = 'new-template-' + Date.now();
		templates.push({
			id: newId,
			name: 'New Profile',
			description: 'A new instruction profile.',
			tag: 'experimental',
			status: 'draft',
			lastEdited: new Date().toISOString().split('T')[0],
			files: {
				'system.md': '',
				'behavior.md': '',
				'tools.md': '',
				'personality.md': ''
			},
			mockPreview: 'I am a brand new bot profile.'
		});
		selectedTemplateId = newId;
	}

	function handleDuplicate() {
		const newId = selectedTemplate.id + '-copy-' + Date.now();
		templates.push({
			...JSON.parse(JSON.stringify(selectedTemplate)),
			id: newId,
			name: selectedTemplate.name + ' (Copy)',
			status: 'draft',
			lastEdited: new Date().toISOString().split('T')[0]
		});
		selectedTemplateId = newId;
	}

	function handleDelete() {
		if (templates.length <= 1) return;
		const index = templates.findIndex((t) => t.id === selectedTemplateId);
		templates = templates.filter((t) => t.id !== selectedTemplateId);
		selectedTemplateId = templates[Math.max(0, index - 1)].id;
	}

	function handleSetActive() {
		templates.forEach((t) => {
			if (t.id === selectedTemplateId) t.status = 'active';
			else if (t.status === 'active') t.status = 'archived'; // simple mock logic
		});
	}
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

<div class="grid gap-6 xl:grid-cols-12">
	<!-- Left Sidebar: Templates List -->
	<div class="space-y-4 xl:col-span-3">
		<SectionCard title="Bot Profiles">
			{#snippet headerAction()}
				<button
					class="text-label font-bold tracking-widest text-cyan-400 uppercase transition-colors hover:text-cyan-300"
					onclick={handleNewTemplate}
				>
					+ New
				</button>
			{/snippet}

			<div class="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
				{#each templates as t (t.id)}
					<button
						class="group flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-200 {selectedTemplateId ===
						t.id
							? 'border-cyan-500/50 bg-slate-800/80 shadow-glow-cyan-sm'
							: 'border-slate-800/60 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-800/50'}"
						onclick={() => (selectedTemplateId = t.id)}
					>
						<div class="flex w-full items-start justify-between">
							<span
								class="text-ui font-bold tracking-widest uppercase transition-colors {selectedTemplateId ===
								t.id
									? 'text-cyan-400'
									: 'text-slate-300 group-hover:text-cyan-400'}">{t.name}</span
							>
							<StatusBadge status={t.status} />
						</div>
						<span class="line-clamp-2 text-xs text-slate-400">{t.description}</span>
						<span class="text-label-xs font-bold tracking-widest text-slate-500 uppercase"
							>Edited: {t.lastEdited}</span
						>
					</button>
				{/each}
			</div>
		</SectionCard>
	</div>

	<!-- Main Area: Editor -->
	<div class="space-y-6 xl:col-span-6">
		<SectionCard title="Template Metadata">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label
						for="profileName"
						class="label-caps"
						>Profile Name</label
					>
					<input
						id="profileName"
						type="text"
						bind:value={selectedTemplate.name}
						class="input-dark"
					/>
				</div>
				<div>
					<label
						for="profileTag"
						class="label-caps"
						>Mode Tag</label
					>
					<select
						id="profileTag"
						bind:value={selectedTemplate.tag}
						class="input-dark"
					>
						<option value="default">Default</option>
						<option value="evil">Evil</option>
						<option value="sweet">Sweet</option>
						<option value="strict">Strict</option>
						<option value="experimental">Experimental</option>
					</select>
				</div>
				<div class="sm:col-span-2">
					<label
						for="profileDesc"
						class="label-caps"
						>Description</label
					>
					<textarea
						id="profileDesc"
						rows="2"
						bind:value={selectedTemplate.description}
						class="input-dark"
					></textarea>
				</div>
			</div>

			<div class="mt-6 flex flex-wrap gap-3 border-t border-slate-800/50 pt-4">
				{#if selectedTemplate.status !== 'active'}
					<button
						onclick={handleSetActive}
						class="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-label font-bold tracking-widest text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
						>Set Active</button
					>
				{/if}
				<button
					class="rounded border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-label font-bold tracking-widest text-cyan-400 uppercase shadow-glow-cyan-sm-soft transition-colors hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-glow-cyan-sm-hover"
					>Save Draft</button
				>
				<button
					onclick={handleDuplicate}
					class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:bg-slate-700 hover:text-slate-200"
					>Duplicate</button
				>
				<button
					class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:bg-slate-700 hover:text-slate-200"
					>Reload Bot</button
				>
				<div class="flex-1"></div>
				<button
					onclick={handleDelete}
					class="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20 hover:text-rose-300"
					disabled={templates.length <= 1}>Delete</button
				>
			</div>
		</SectionCard>

		<SectionCard title="Instruction Files">
			<div class="mb-4 flex gap-2 border-b border-slate-800/80 pb-px">
				{#each ['system.md', 'behavior.md', 'tools.md', 'personality.md'] as tab (tab)}
					<button
						class="border-b-2 px-4 py-2 text-ui font-bold tracking-widest uppercase transition-all {activeTab ===
						tab
							? 'border-cyan-500 text-cyan-400'
							: 'border-transparent text-slate-500 hover:text-slate-300'}"
						onclick={() =>
							(activeTab = tab as 'system.md' | 'behavior.md' | 'tools.md' | 'personality.md')}
					>
						{tab}
					</button>
				{/each}
			</div>

			<textarea
				class="h-[400px] w-full resize-none rounded border border-slate-800/80 bg-slate-950/50 p-4 font-mono text-sm text-slate-300 shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
				bind:value={selectedTemplate.files[activeTab]}
			></textarea>
		</SectionCard>
	</div>

	<!-- Right Sidebar: Preview & Context -->
	<div class="space-y-6 xl:col-span-3">
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
				<p class="mt-1 text-xs text-slate-400">{selectedTemplate.files['personality.md']}</p>
			</div>

			<div
				class="group relative overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/80 p-4"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
							"{selectedTemplate.mockPreview}"
						</p>
					</div>
				</div>
			</div>
		</SectionCard>
	</div>
</div>
