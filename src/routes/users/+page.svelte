<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let users = $derived(data.users as Record<string, unknown>[]);

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 10) ?? '—';
	}
</script>

<PageHeader
	title="User Management"
	description="Registered admin users authenticated via Discord OAuth."
/>

<SectionCard title="Registered Users ({users.length})">
	{#if users.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-400">
				<thead
					class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase"
				>
					<tr>
						<th scope="col" class="px-4 py-3">Email</th>
						<th scope="col" class="px-4 py-3">Username</th>
						<th scope="col" class="px-4 py-3">Verified</th>
						<th scope="col" class="px-4 py-3">Created</th>
						<th scope="col" class="px-4 py-3">ID</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/50">
					{#each users as user (user.id)}
						{@const u = user as Record<string, unknown>}
						<tr
							class="border-b border-slate-700/50 transition-all duration-200 last:border-0 hover:bg-slate-800/80"
						>
							<td class="px-4 py-3 font-medium whitespace-nowrap text-slate-200">
								{u.email ?? '—'}
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-slate-300">
								{u.username ?? u.name ?? '—'}
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								{#if u.verified}
									<span class="text-label font-bold tracking-wider text-emerald-400 uppercase">Yes</span>
								{:else}
									<span class="text-label font-bold tracking-wider text-rose-400 uppercase">No</span>
								{/if}
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
								{formatDate(u.created as string)}
							</td>
							<td class="px-4 py-3 max-w-40 truncate whitespace-nowrap font-mono text-xs text-slate-600">
								{u.id as string}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-sm text-slate-500">No users registered yet.</p>
		</div>
	{/if}
</SectionCard>
