<script lang="ts">
	let {
		title,
		message,
		actionLabel = undefined
	} = $props<{ title: string; message: string; actionLabel?: string }>();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
	<div class="mb-4 rounded-full bg-slate-800 p-3">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-ghost text-slate-400"
			><path d="M9 10h.01" /><path d="M15 10h.01" /><path
				d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"
			/></svg
		>
	</div>
	<h3 class="text-lg font-medium text-slate-200">{title}</h3>
	<p class="mt-2 text-sm text-slate-400">{message}</p>
	{#if actionLabel}
		<button
			class="mt-6 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
		>
			{actionLabel}
		</button>
	{/if}
</div>
