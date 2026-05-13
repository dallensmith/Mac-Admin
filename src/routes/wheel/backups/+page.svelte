<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data, form } = $props<{ data: import('./$types').PageData; form: import('./$types').ActionData }>();

	let expandedId = $state<string | null>(null);
	let restoreConfirmId = $state<string | null>(null);

	let backups = $derived(data.backups as Record<string, unknown>[]);

	let totalBackups = $derived(backups.length);
	let latestBackup = $derived(
		backups.length > 0 ? backups.reduce((latest, b) => (b.timestamp as string) > (latest.timestamp as string) ? b : latest) : null
	);
	let latestCount = $derived(latestBackup ? (latestBackup.candidate_count as number) ?? 0 : 0);

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
		restoreConfirmId = null;
	}

	function confirmRestore(id: string) {
		restoreConfirmId = id;
	}

	const saveIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>`;

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
</script>

<PageHeader
	title="Wheel Backups"
	description="Manage wheel snapshots for disaster recovery."
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

<div class="mb-8 grid gap-6 sm:grid-cols-3">
	<StatCard title="Total Backups" value={totalBackups.toString()} icon={saveIcon} />
	<StatCard title="Latest Backup" value={latestBackup ? formatDate(latestBackup.timestamp as string) : '—'} />
	<StatCard title="Candidates in Latest" value={latestCount.toString()} />
</div>

<!-- Hidden form for manual backup trigger -->
<form
	id="create-backup-form"
	method="POST"
	action="?/createBackup"
	class="hidden"
	use:enhance={() => {
		return async () => {
			await invalidateAll();
		};
	}}
></form>

<!-- Hidden form for restore -->
<form
	id="restore-form"
	method="POST"
	action="?/restore"
	class="hidden"
	use:enhance={() => {
		return async () => {
			await invalidateAll();
			restoreConfirmId = null;
			expandedId = null;
		};
	}}
>
	<input type="hidden" name="backupId" id="restore-backup-id" value="" />
</form>

<SectionCard title="Backup History">
	{#snippet headerAction()}
		<button
			onclick={() => {
				(document.getElementById('create-backup-form') as HTMLFormElement).requestSubmit();
			}}
			class="rounded-none border-2 border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-label font-bold tracking-wider text-cyan-400 uppercase transition-all duration-300 hover:bg-cyan-500/20 hover:shadow-glow-cyan-sm"
		>
			+ Create Backup
		</button>
	{/snippet}

	{#if backups.length > 0}
		<div class="space-y-3">
			{#each backups as backup (backup.id)}
				{@const b = backup as Record<string, unknown>}
				{@const isExpanded = expandedId === b.id}
				<div
					class="group relative overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/40 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-glow-cyan-sm"
				>
					<div
						class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
					></div>

					<button
						onclick={() => toggleExpand(b.id as string)}
						class="flex w-full items-center gap-4 px-6 py-4 text-left"
					>
						<span class="flex shrink-0 items-center text-slate-400 drop-shadow-glow-cyan-soft transition-transform duration-300 group-hover:scale-110">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html saveIcon}
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-3">
								<span class="font-mono text-sm text-slate-200">{formatDate(b.timestamp as string)}</span>
								<span
									class="inline-flex items-center rounded-none border px-2 py-0.5 text-label font-bold tracking-wider uppercase {b.backup_type === 'manual'
										? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
										: 'border-slate-600/30 bg-slate-500/10 text-slate-400'}"
								>
									{b.backup_type as string}
								</span>
							</div>
							<p class="mt-1 text-xs text-slate-500">
								{b.candidate_count as number} candidates · Triggered by: {b.triggered_by ?? '—'}
							</p>
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-chevron-down shrink-0 text-slate-500 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					{#if isExpanded}
						<div class="border-t-2 border-slate-700 bg-slate-950/60 px-6 py-4">
							<div class="mb-3 flex items-center justify-between">
								<h4 class="text-label font-bold tracking-wider text-slate-400 uppercase">
									Backup Data Preview ({b.candidate_count as number} candidates)
								</h4>
								{#if restoreConfirmId === b.id}
									<div class="flex items-center gap-2">
										<span class="text-xs font-bold text-rose-400 uppercase">Confirm restore?</span>
										<button
											onclick={() => {
												const input = document.getElementById('restore-backup-id') as HTMLInputElement;
												if (input) input.value = b.id as string;
												(document.getElementById('restore-form') as HTMLFormElement).requestSubmit();
											}}
											class="rounded-none border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 uppercase hover:bg-rose-500/20"
										>
											Yes, Restore
										</button>
										<button
											onclick={() => (restoreConfirmId = null)}
											class="rounded-none border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-400 uppercase hover:bg-slate-700"
										>
											Cancel
										</button>
									</div>
								{:else}
									<button
										onclick={() => confirmRestore(b.id as string)}
										class="rounded-none border border-amber-500/50 bg-amber-500/10 px-4 py-1.5 text-label font-bold tracking-wider text-amber-400 uppercase transition-all duration-300 hover:bg-amber-500/20"
									>
										Restore from this Backup
									</button>
								{/if}
							</div>
							<div class="max-h-64 overflow-y-auto rounded-none border border-slate-700 bg-slate-950 p-3">
								<pre class="text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(JSON.parse(b.data as string), null, 2).slice(0, 5000)}{(b.data as string)?.length > 5000 ? '\n... (truncated)' : ''}</pre>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="No backups yet"
			message="Create your first backup to protect the wheel against accidental changes."
		/>
	{/if}
</SectionCard>
