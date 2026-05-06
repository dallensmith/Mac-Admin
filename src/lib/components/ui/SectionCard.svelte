<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description = undefined,
		headerAction = undefined,
		children
	} = $props<{
		title: string;
		description?: string;
		headerAction?: Snippet;
		children: Snippet;
	}>();
</script>

<div
	class="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-lg backdrop-blur-sm"
>
	<!-- Subtle top glow -->
	<div
		class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-500 group-hover:via-cyan-400/40"
	></div>
	<div
		class="flex items-center justify-between border-b border-slate-800/50 bg-slate-950/40 px-6 py-4"
	>
		<div>
			<h3
				class="text-sm font-bold tracking-wider text-slate-200 uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
			>
				{title}
			</h3>
			{#if description}
				<p class="mt-1 text-xs font-medium tracking-wide text-slate-500">{description}</p>
			{/if}
		</div>
		{#if headerAction}
			<div class="relative z-10">{@render headerAction()}</div>
		{/if}
	</div>
	<div class="relative p-6">
		<!-- Subtle inner glow -->
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
		></div>
		<div class="relative z-10">
			{@render children()}
		</div>
	</div>
</div>
