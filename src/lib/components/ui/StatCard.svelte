<script lang="ts">
	let {
		title,
		value,
		icon = undefined,
		trend = undefined
	} = $props<{ title: string; value: string | number; icon?: string; trend?: string }>();
</script>

<div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-slate-400">{title}</h3>
		{#if icon}
			<span class="text-indigo-400">
				<!-- Icon rendering could be better but simplified for scaffold -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html icon}
			</span>
		{/if}
	</div>
	<div class="mt-4 flex items-baseline gap-2">
		<p class="text-3xl font-semibold text-slate-100">{value}</p>
		{#if trend}
			<span class="text-sm font-medium text-emerald-400">{trend}</span>
		{/if}
	</div>
</div>
