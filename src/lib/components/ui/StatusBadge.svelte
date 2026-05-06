<script lang="ts">
	let { status } = $props<{ status: string }>();

	let badgeClass = $derived.by(() => {
		const s = status.toLowerCase();
		if (s === 'online' || s === 'completed' || s === 'active') {
			return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]';
		} else if (s === 'pending' || s === 'in progress') {
			return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]';
		} else if (s === 'error' || s === 'banned') {
			return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
		} else {
			return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
		}
	});
</script>

<span
	class={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}
>
	{status}
</span>
