<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import { mockUsers } from '$lib/mock/admin';
</script>

<PageHeader
	title="User Management"
	description="Manage Discord users, assign admin roles, and control access."
/>

<SectionCard title="Registered Users">
	<DataTable
		columns={['Discord User', 'Role', 'Status', 'Usage Limits', 'Actions']}
		data={mockUsers}
	>
		{#snippet rowSnippet(row)}
			<td class="flex items-center gap-3 px-6 py-4 font-medium whitespace-nowrap text-slate-200">
				<div
					class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400"
				>
					{row.name.charAt(0)}
				</div>
				{row.name}
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<span
					class="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20 ring-inset"
				>
					{row.role}
				</span>
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<StatusBadge status={row.status} />
			</td>
			<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-400">
				{row.limits}
			</td>
			<td class="space-x-2 px-6 py-4 text-right whitespace-nowrap">
				{#if row.status !== 'Banned'}
					<button class="text-xs font-medium text-red-400 hover:text-red-300" disabled>Ban</button>
				{:else}
					<button class="text-xs font-medium text-emerald-400 hover:text-emerald-300" disabled
						>Unban</button
					>
				{/if}
				<span class="text-slate-700">|</span>
				<button class="text-xs font-medium text-indigo-400 hover:text-indigo-300" disabled
					>Edit Role</button
				>
			</td>
		{/snippet}
	</DataTable>
</SectionCard>
