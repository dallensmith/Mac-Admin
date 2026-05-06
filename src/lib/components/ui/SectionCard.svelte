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

<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
	<div class="flex items-center justify-between border-b border-slate-800 px-6 py-4">
		<div>
			<h3 class="text-lg font-medium text-slate-100">{title}</h3>
			{#if description}
				<p class="mt-1 text-sm text-slate-400">{description}</p>
			{/if}
		</div>
		{#if headerAction}
			<div>{@render headerAction()}</div>
		{/if}
	</div>
	<div class="p-6">
		{@render children()}
	</div>
</div>
