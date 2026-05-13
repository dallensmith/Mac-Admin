<script lang="ts">
	let { status } = $props<{ status: string }>();

	let badgeClass = $derived.by(() => {
		const s = status.toLowerCase();
		if (
			s === 'online' ||
			s === 'completed' ||
			s === 'active' ||
			s === 'enabled' ||
			s === 'approved'
		) {
			return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-glow-cyan-xs';
		} else if (s === 'pending' || s === 'in progress') {
			return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-glow-fuchsia-xs';
		} else if (s === 'error' || s === 'banned' || s === 'rejected') {
			return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-glow-rose-xs';
		} else {
			return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
		}
	});
</script>

<span
	class={`inline-flex items-center rounded-none border px-2 py-0.5 text-label font-bold tracking-wider uppercase ${badgeClass}`}
>
	{status}
</span>
