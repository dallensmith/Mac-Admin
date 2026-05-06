<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import { mockExperiments } from '$lib/mock/admin';
</script>

<PageHeader
	title="Bot Experiments"
	description="Track and manage specialized AI prompt test runs."
/>

<SectionCard title="Past & Ongoing Experiments">
	{#snippet headerAction()}
		<button
			class="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
			disabled
		>
			New Experiment
		</button>
	{/snippet}

	<DataTable
		columns={['ID', 'Name', 'Date Started', 'Movies Watched', 'Status', 'Results']}
		data={mockExperiments}
	>
		{#snippet rowSnippet(row)}
			<td class="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-400"
				>EXP-{row.id.toString().padStart(3, '0')}</td
			>
			<td class="px-6 py-4 font-medium whitespace-nowrap text-slate-200">{row.name}</td>
			<td class="px-6 py-4 whitespace-nowrap text-slate-400">{row.date}</td>
			<td class="px-6 py-4 whitespace-nowrap text-slate-400">{row.movies}</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<StatusBadge status={row.status} />
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<button
					class="pointer-events-none text-xs font-medium text-cyan-400 opacity-50 hover:text-indigo-300"
					disabled>View Details</button
				>
			</td>
		{/snippet}
	</DataTable>
</SectionCard>
