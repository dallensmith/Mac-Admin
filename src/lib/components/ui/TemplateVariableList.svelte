<script lang="ts">
	let { variables, title } = $props<{
		variables: { name: string; description: string }[];
		title: string;
	}>();
</script>

<div
	class="mb-6 rounded border border-slate-800/80 bg-slate-900/50 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
>
	<h3 class="mb-3 text-[11px] font-bold tracking-widest text-cyan-400 uppercase drop-shadow-sm">
		{title}
	</h3>
	<ul class="space-y-2">
		{#each variables as v (v.name)}
			<li class="flex items-start gap-2">
				<code class="rounded bg-slate-800/80 px-1.5 py-0.5 text-xs text-fuchsia-400">{v.name}</code>
				<span class="text-xs text-slate-400">{v.description}</span>
			</li>
		{/each}
	</ul>
</div>
