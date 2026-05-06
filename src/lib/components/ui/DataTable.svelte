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

<div
	class="overflow-x-auto rounded-none border-2 border-slate-700 bg-slate-900/40 backdrop-blur-sm"
>
	<table class="w-full text-left text-sm text-slate-400">
		<thead
			class="border-b-2 border-slate-700 bg-slate-950/80 text-label font-bold tracking-widest text-slate-300 uppercase"
		>
			<tr>
				{#each columns as col (col)}
					<th scope="col" class="px-6 py-4">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-800/50">
			{#each data as row, idx (idx)}
				<tr
					class="border-b border-slate-700/50 transition-all duration-200 last:border-0 hover:bg-slate-800/80 hover:shadow-inset-accent"
				>
					{@render rowSnippet(row)}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if data.length === 0}
		<div class="py-8 text-center text-sm text-slate-500">No data available</div>
	{/if}
</div>
