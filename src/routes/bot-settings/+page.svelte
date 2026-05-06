<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<PageHeader
	title="Bot Settings"
	description="Configure the core behavior and properties of Mac Bot."
/>

<div class="space-y-6">
	<SectionCard title="General Configuration">
		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label
					for="botName"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Bot Name</label
				>
				<input
					type="text"
					id="botName"
					value="Smart Mac"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
			<div>
				<label
					for="guildId"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Primary Guild ID</label
				>
				<input
					type="text"
					id="guildId"
					value="123456789012345678"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="AI Model Settings">
		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label
					for="provider"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Provider</label
				>
				<select
					id="provider"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				>
					<option>OpenRouter</option>
					<option>OpenAI</option>
					<option>Anthropic</option>
				</select>
			</div>
			<div>
				<label
					for="model"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Model</label
				>
				<input
					type="text"
					id="model"
					value="google/gemini-pro"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
			<div>
				<label
					for="temperature"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Temperature</label
				>
				<input
					type="number"
					id="temperature"
					value="0.9"
					step="0.1"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="Limits & Budgets">
		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label
					for="cooldown"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Global Cooldown (seconds)</label
				>
				<input
					type="number"
					id="cooldown"
					value="30"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
			<div>
				<label
					for="budget"
					class="block text-[10px] font-bold tracking-widest text-slate-400 uppercase drop-shadow-sm"
					>Daily Budget Limit ($)</label
				>
				<input
					type="number"
					id="budget"
					value="2.00"
					class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<div class="flex justify-end gap-3">
		<button
			class="rounded border border-slate-800/80 bg-slate-900/50 px-5 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-800 hover:text-slate-200"
			disabled>Cancel</button
		>
		<button
			class="relative rounded border border-cyan-500/50 bg-cyan-500/10 px-5 py-2 text-[10px] font-bold tracking-widest text-cyan-400 uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
			disabled>Save Changes</button
		>
	</div>
</div>
