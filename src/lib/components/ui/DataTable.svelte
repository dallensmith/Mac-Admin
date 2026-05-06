<script lang="ts">
	import type { Snippet } from 'svelte';

	// T can be any type, but Svelte 5 generics in script lang="ts"
	// can sometimes be tricky without generics="T" attribute.
	// For scaffold, we'll use a simpler approach.

	let { columns, data, rowSnippet } = $props<{
		columns: string[];
		data: Record<string, unknown>[];
		rowSnippet: Snippet<[Record<string, unknown>]>;
	}>();
</script>

<div class="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/50">
	<table class="w-full text-left text-sm text-slate-400">
		<thead class="border-b border-slate-800 bg-slate-800/50 text-xs text-slate-300 uppercase">
			<tr>
				{#each columns as col (col)}
					<th scope="col" class="px-6 py-3 font-medium tracking-wider">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-800/50">
			{#each data as row, idx (idx)}
				<tr class="transition-colors hover:bg-slate-800/20">
					{@render rowSnippet(row)}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if data.length === 0}
		<div class="py-8 text-center text-sm text-slate-500">No data available</div>
	{/if}
</div>
