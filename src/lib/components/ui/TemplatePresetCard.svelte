<script lang="ts">
	let { preset, onClick } = $props<{
		preset: { id: string; name: string; description: string };
		onClick: () => void;
	}>();
</script>

<button
	class="group flex w-full flex-col items-start gap-1 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 text-left transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] focus:ring-1 focus:ring-cyan-500 focus:outline-none"
	onclick={onClick}
>
	<span
		class="text-[11px] font-bold tracking-widest text-cyan-400 uppercase transition-colors group-hover:text-cyan-300"
		>{preset.name}</span
	>
	<span class="text-xs text-slate-400 transition-colors group-hover:text-slate-300"
		>{preset.description}</span
	>
</button>
