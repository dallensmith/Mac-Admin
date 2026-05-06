<script lang="ts">
	let {
		title,
		value,
		icon = undefined,
		trend = undefined
	} = $props<{ title: string; value: string | number; icon?: string; trend?: string }>();
</script>

<div
	class="group relative overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 p-6 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:bg-slate-800 hover:shadow-card-hover"
>
	<div
		class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/5 blur-orb-sm transition-all duration-500 group-hover:bg-cyan-500/10"
	></div>

	<div class="relative z-10 flex items-center justify-between">
		<h3 class="text-ui font-bold tracking-widest text-slate-400 uppercase">{title}</h3>
		{#if icon}
			<span
				class="text-cyan-400 drop-shadow-glow-cyan-soft transition-transform duration-300 group-hover:scale-110"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html icon}
			</span>
		{/if}
	</div>
	<div class="relative z-10 mt-4 flex items-baseline gap-2">
		<p class="text-3xl font-black tracking-tight text-slate-100 drop-shadow-sm">{value}</p>
		{#if trend}
			<span
				class="text-label font-bold tracking-wider text-fuchsia-400 uppercase drop-shadow-glow-fuchsia-md"
				>{trend}</span
			>
		{/if}
	</div>
</div>
