<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TemplateFieldToggle from '$lib/components/ui/TemplateFieldToggle.svelte';

	let { data, form }: { data: import('./$types').PageData; form: import('./$types').ActionData } =
		$props();

	let selectedActionId = $state<string>(
		(data.buttonActions[0] as RecordModel | undefined)?.id ?? ''
	);

	$effect(() => {
		const ids = (data.buttonActions as RecordModel[]).map((a) => a.id);
		if (ids.length > 0 && !ids.includes(selectedActionId)) {
			selectedActionId = ids[0];
		}
	});

	let selectedAction = $derived(
		(data.buttonActions as RecordModel[]).find((a) => a.id === selectedActionId)
	);

	// Editor state
	let actionKey = $state('');
	let actionName = $state('');
	let actionDescription = $state('');
	let actionType = $state('');
	let paramsTemplate = $state('{}');
	let responseTemplateKey = $state('');
	let enabled = $state(true);

	$effect(() => {
		const a = selectedAction;
		if (!a) return;
		actionKey = String(a.action_key ?? '');
		actionName = String(a.name ?? '');
		actionDescription = String(a.description ?? '');
		actionType = String(a.action_type ?? '');
		paramsTemplate = String(a.params_template ?? '{}');
		responseTemplateKey = String(a.response_template_key ?? '');
		enabled = Boolean(a.enabled ?? true);
	});
</script>

<form id="createForm" method="POST" action="?/create" use:enhance></form>
<form id="deleteForm" method="POST" action="?/delete" use:enhance>
	<input type="hidden" name="id" value={selectedAction?.id ?? ''} />
</form>

<PageHeader
	title="Button Actions"
	description="Define interactive button actions that the bot dispatches when users click embed buttons."
/>

{#if form?.error}
	<div class="mb-4 rounded border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
		{form.error}
	</div>
{/if}

<div class="grid gap-6 xl:grid-cols-12">
	<!-- Sidebar list -->
	<div class="xl:col-span-4">
		<SectionCard title="Actions">
			<div class="space-y-1">
				{#each data.buttonActions as action (action.id)}
					{@const rec = action as RecordModel}
					<button
						type="button"
						class="w-full rounded px-3 py-2 text-left text-sm transition-colors {rec.id ===
						selectedActionId
							? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
							: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}"
						onclick={() => (selectedActionId = rec.id)}
					>
						<div class="flex items-center justify-between gap-2">
							<span class="block font-medium">{rec.name}</span>
							{#if rec.enabled}
								<span class="rounded bg-emerald-500/15 px-1.5 py-0.5 font-bold text-emerald-400 uppercase" style="font-size: var(--text-label)">on</span>
							{:else}
								<span class="rounded bg-slate-700/50 px-1.5 py-0.5 font-bold text-slate-500 uppercase" style="font-size: var(--text-label)">off</span>
							{/if}
						</div>
						<span class="mt-0.5 block truncate font-mono text-[10px] opacity-50">{rec.action_key}</span>
					</button>
				{:else}
					<p class="py-2 text-xs text-slate-500">No button actions yet.</p>
				{/each}
			</div>
			<div class="mt-4 border-t border-slate-800/60 pt-4">
				<button form="createForm" type="submit" class="btn-cyan w-full text-sm">
					+ New Action
				</button>
			</div>
		</SectionCard>
	</div>

	<!-- Editor -->
	<div class="xl:col-span-8">
		{#if selectedAction}
			<form method="POST" action="?/update" use:enhance>
				<input type="hidden" name="id" value={selectedAction.id} />
				<input type="hidden" name="enabled" value={String(enabled)} />

				<div class="space-y-6">
					<SectionCard title="Identity">
						<div class="space-y-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="actionName" class="label-caps">Name</label>
									<input
										id="actionName"
										name="name"
										type="text"
										bind:value={actionName}
										class="input-dark"
										placeholder="Show Experiment for Movie"
									/>
								</div>
								<div>
									<label for="actionKey" class="label-caps">Action Key</label>
									<input
										id="actionKey"
										name="action_key"
										type="text"
										bind:value={actionKey}
										class="input-dark font-mono text-xs"
										placeholder="show_experiment_for_movie"
									/>
								</div>
							</div>
							<div>
								<label for="actionDesc" class="label-caps">Description</label>
								<input
									id="actionDesc"
									name="description"
									type="text"
									bind:value={actionDescription}
									class="input-dark"
									placeholder="Optional notes about what this action does"
								/>
							</div>
						</div>
					</SectionCard>

					<SectionCard title="Dispatch Config">
						<div class="space-y-4">
							<div>
								<label for="actionType" class="label-caps">Action Type</label>
								<input
									id="actionType"
									name="action_type"
									type="text"
									bind:value={actionType}
									class="input-dark font-mono text-xs"
									placeholder="find_experiment_by_movie"
								/>
								<p class="mt-1.5 text-xs text-slate-500">The <code class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">AIAction.type</code> value dispatched when this button is clicked.</p>
							</div>
							<div>
								<label for="paramsTemplate" class="label-caps">Params Template <span class="normal-case text-slate-500">(JSON)</span></label>
								<textarea
									id="paramsTemplate"
									name="params_template"
									rows="4"
									bind:value={paramsTemplate}
									class="input-dark font-mono text-xs"
									placeholder={'{"query": "{{button.ctx}}"}'}
								></textarea>
								<p class="mt-1.5 text-xs text-slate-500">JSON object. Use <code class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">{"{{button.ctx}}"}</code> as a placeholder for the value encoded in the button's <code class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">customId</code>.</p>
							</div>
							<div>
								<label for="responseTemplateKey" class="label-caps">Response Template Key <span class="normal-case text-slate-500">(optional)</span></label>
								<input
									id="responseTemplateKey"
									name="response_template_key"
									type="text"
									bind:value={responseTemplateKey}
									class="input-dark font-mono text-xs"
									placeholder="experiment-lookup"
								/>
								<p class="mt-1.5 text-xs text-slate-500">Override the Discord embed template used for this action's response. Leave empty to use the router's default.</p>
							</div>
						</div>
					</SectionCard>

					<SectionCard title="Status">
						<TemplateFieldToggle
							id="toggle-enabled"
							label="Action Enabled"
							checked={enabled}
							onChange={(val) => (enabled = val)}
						/>
						<p class="mt-3 text-xs text-slate-500">Disabled actions are not loaded into the bot's ButtonActionService. Disable to deactivate a button without deleting its definition.</p>
					</SectionCard>

					<div class="flex items-center justify-between gap-3">
						<button type="submit" form="deleteForm" class="btn-ghost">Delete Action</button>
						<button type="submit" class="btn-cyan">Save Action</button>
					</div>
				</div>
			</form>
		{:else}
			<div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 py-16 text-center">
				<p class="text-sm text-slate-400">No action selected.</p>
				<p class="mt-1 text-xs text-slate-500">Create an action to get started.</p>
			</div>
		{/if}
	</div>
</div>
