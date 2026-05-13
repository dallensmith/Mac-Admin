<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data, form } = $props<{ data: import('./$types').PageData; form: import('./$types').ActionData }>();

	let runs = $derived(data.runs as Record<string, unknown>[]);
	let deletions = $derived(data.deletions as Record<string, unknown>[]);
	let selectedRunId = $derived(data.selectedRunId as string | null);
	let restoringId = $state<string | null>(null);

	let successMessage = $state('');
	let errorMessage = $state('');

	$effect(() => {
		if (form?.success) {
			successMessage = form.message ?? 'Operation completed.';
			errorMessage = '';
			setTimeout(() => { successMessage = ''; }, 5000);
		}
		if (form?.error) {
			errorMessage = form.error;
			successMessage = '';
			setTimeout(() => { errorMessage = ''; }, 5000);
		}
	});

	function selectRun(runId: string) {
		goto(`/wheel/cleanup?run=${runId}`, { replaceState: true });
	}

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}

	const broomIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-broom"><path d="m7.715 7.615 1.79-1.79a4.37 4.37 0 0 1 6.18 6.18l-1.79 1.79"/><path d="m4.015 12.733 2.001-2.001a4.37 4.37 0 0 1 6.18 6.18l-2.001 2.001"/><path d="M2 22 4.3 19.7"/><path d="M14.5 14.5 2 22"/><path d="M13 2c.5.5 1.5.5 2 1s.5 1.5 1 2 .5 1.5 1 2"/><path d="M14 5c.5.5 1.5.5 2 1s.5 1.5 1 2"/><path d="M15 8c.5.5 1.5.5 2 1"/></svg>`;

	let totalChecked = $derived(runs.reduce((sum, r) => sum + ((r.checked as number) ?? 0), 0));
	let totalDeletions = $derived(deletions.length);
	let restoredCount = $derived(deletions.filter((d) => d.restored === true).length);
</script>

<PageHeader
	title="Cleanup History"
	description="Review automated wheel cleanup runs and restore false-positive deletions."
/>

{#if successMessage}
	<div class="mb-4 border-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
		{successMessage}
	</div>
{/if}
{#if errorMessage}
	<div class="mb-4 border-2 border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
		{errorMessage}
	</div>
{/if}

<!-- Hidden restore form -->
<form
	id="restore-form"
	method="POST"
	action="?/restoreDeletion"
	class="hidden"
	use:enhance={() => {
		return async () => {
			await invalidateAll();
			restoringId = null;
		};
	}}
>
	<input type="hidden" name="deletionId" id="restore-deletion-id" value="" />
</form>

<div class="grid gap-6 lg:grid-cols-3">
	<!-- Left: Run list -->
	<div class="lg:col-span-1">
		<SectionCard title="Cleanup Runs">
			{#if runs.length > 0}
				<div class="space-y-1">
					{#each runs as run (run.id)}
						{@const r = run as Record<string, unknown>}
						<button
							onclick={() => selectRun(r.id as string)}
							class="w-full rounded-none border px-4 py-3 text-left transition-all duration-200 {selectedRunId === r.id
								? 'border-cyan-500/50 bg-cyan-500/10'
								: 'border-slate-700/50 bg-transparent hover:border-slate-600 hover:bg-slate-800/50'}"
						>
							<div class="flex items-center justify-between">
								<span class="text-xs font-mono text-slate-300">{formatDate(r.timestamp as string)}</span>
								<StatusBadge status={r.run_type as string} />
							</div>
							<p class="mt-1 text-xs text-slate-500">{r.checked as number} candidates audited</p>
						</button>
					{/each}
				</div>
			{:else}
				<EmptyState
					title="No cleanup runs"
					message="Automated cleanup runs will appear here as they occur."
				/>
			{/if}
		</SectionCard>
	</div>

	<!-- Right: Deletions for selected run -->
	<div class="lg:col-span-2">
		<SectionCard title={selectedRunId ? 'Deletions for Selected Run' : 'Deletions'}>
			{#snippet headerAction()}
				{#if selectedRunId}
					<div class="flex gap-4 text-xs text-slate-400">
						<span>Total: {totalDeletions}</span>
						<span class="text-emerald-400">Restored: {restoredCount}</span>
						<span class="text-rose-400">Pending: {totalDeletions - restoredCount}</span>
					</div>
				{/if}
			{/snippet}

			{#if !selectedRunId}
				<div class="py-8 text-center text-sm text-slate-500">
					Select a cleanup run from the left to view its deletions.
				</div>
			{:else if deletions.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm text-slate-400">
						<thead
							class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase"
						>
							<tr>
								<th scope="col" class="px-3 py-3">Movie</th>
								<th scope="col" class="px-3 py-3">Matched As</th>
								<th scope="col" class="px-3 py-3">Experiment</th>
								<th scope="col" class="px-3 py-3">Status</th>
								<th scope="col" class="px-3 py-3">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-800/50">
							{#each deletions as deletion (deletion.id)}
								{@const d = deletion as Record<string, unknown>}
								<tr
									class="border-b border-slate-700/50 transition-all duration-200 last:border-0 hover:bg-slate-800/80"
								>
									<td class="px-3 py-3 max-w-40 truncate whitespace-nowrap text-slate-200">
										{d.title ?? '—'}
										{#if d.year}
											<span class="text-slate-500"> ({d.year})</span>
										{/if}
									</td>
									<td class="px-3 py-3 max-w-40 truncate whitespace-nowrap text-xs text-slate-500">
										{d.matched_title ?? '—'}
									</td>
									<td class="px-3 py-3 max-w-32 truncate whitespace-nowrap text-xs text-slate-500">
										{d.matched_experiments ?? '—'}
									</td>
									<td class="px-3 py-3 whitespace-nowrap">
										{#if d.restored === true}
											<span class="text-label font-bold tracking-wider text-emerald-400 uppercase">Restored</span>
										{:else}
											<span class="text-label font-bold tracking-wider text-rose-400 uppercase">Deleted</span>
										{/if}
									</td>
									<td class="px-3 py-3 whitespace-nowrap">
										{#if d.restored !== true}
											<button
												onclick={() => {
													restoringId = d.id as string;
													const input = document.getElementById('restore-deletion-id') as HTMLInputElement;
													if (input) input.value = d.id as string;
													(document.getElementById('restore-form') as HTMLFormElement).requestSubmit();
												}}
												disabled={restoringId === d.id}
												class="rounded-none border border-cyan-500/50 bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-400 uppercase transition-all duration-300 hover:bg-cyan-500/20 disabled:opacity-50"
											>
												{restoringId === d.id ? 'Restoring...' : 'Restore'}
											</button>
										{:else}
											<span class="text-xs text-slate-600">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<EmptyState
					title="No deletions in this run"
					message="This cleanup run found no candidates to remove."
				/>
			{/if}
		</SectionCard>
	</div>
</div>
