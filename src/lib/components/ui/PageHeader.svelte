<script lang="ts">
	let { title, description = undefined } = $props<{ title: string; description?: string }>();
</script>

<div class="mb-8">
	<h1 class="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
	{#if description}
		<p class="mt-2 text-sm text-slate-400">{description}</p>
	{/if}
</div>
