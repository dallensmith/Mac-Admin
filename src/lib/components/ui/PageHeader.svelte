<script lang="ts">
	let { title, description = undefined } = $props<{ title: string; description?: string }>();
</script>

<div class="relative mb-8">
	<h1
		class="text-2xl font-black tracking-widest text-slate-100 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
	>
		{title}
	</h1>
	{#if description}
		<p class="mt-2 text-xs font-medium tracking-wider text-cyan-500/70 uppercase">{description}</p>
	{/if}
</div>
