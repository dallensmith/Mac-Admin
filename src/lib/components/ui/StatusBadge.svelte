<script lang="ts">
	let { status } = $props<{ status: string }>();

	let badgeClass = $derived.by(() => {
		const s = status.toLowerCase();
		if (s === 'online' || s === 'completed' || s === 'active') {
			return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
		} else if (s === 'pending' || s === 'in progress') {
			return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
		} else if (s === 'error' || s === 'banned') {
			return 'bg-red-500/10 text-red-400 border-red-500/20';
		} else {
			return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
		}
	});
</script>

<span
	class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
>
	{status}
</span>
