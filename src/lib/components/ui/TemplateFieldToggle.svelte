<script lang="ts">
	let { id, label, checked, onChange } = $props<{
		id: string;
		label: string;
		checked: boolean;
		onChange: (checked: boolean) => void;
	}>();
</script>

<div class="flex items-center gap-3">
	<button
		type="button"
		class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 focus:outline-none {checked
			? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
			: 'bg-slate-700'}"
		role="switch"
		aria-checked={checked}
		onclick={() => onChange(!checked)}
	>
		<span class="sr-only">Toggle {label}</span>
		<span
			aria-hidden="true"
			class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {checked
				? 'translate-x-4'
				: 'translate-x-0'}"
		></span>
	</button>
	<label
		for={id}
		class="cursor-pointer text-[11px] font-bold tracking-widest text-slate-300 uppercase"
	>
		{label}
	</label>
</div>
