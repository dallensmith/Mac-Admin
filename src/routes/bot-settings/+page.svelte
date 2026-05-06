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
				<label for="botName" class="block text-sm font-medium text-slate-300">Bot Name</label>
				<input
					type="text"
					id="botName"
					value="Smart Mac"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
			<div>
				<label for="guildId" class="block text-sm font-medium text-slate-300"
					>Primary Guild ID</label
				>
				<input
					type="text"
					id="guildId"
					value="123456789012345678"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="AI Model Settings">
		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label for="provider" class="block text-sm font-medium text-slate-300">Provider</label>
				<select
					id="provider"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				>
					<option>OpenRouter</option>
					<option>OpenAI</option>
					<option>Anthropic</option>
				</select>
			</div>
			<div>
				<label for="model" class="block text-sm font-medium text-slate-300">Model</label>
				<input
					type="text"
					id="model"
					value="google/gemini-pro"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
			<div>
				<label for="temperature" class="block text-sm font-medium text-slate-300">Temperature</label
				>
				<input
					type="number"
					id="temperature"
					value="0.9"
					step="0.1"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="Limits & Budgets">
		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label for="cooldown" class="block text-sm font-medium text-slate-300"
					>Global Cooldown (seconds)</label
				>
				<input
					type="number"
					id="cooldown"
					value="30"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
			<div>
				<label for="budget" class="block text-sm font-medium text-slate-300"
					>Daily Budget Limit ($)</label
				>
				<input
					type="number"
					id="budget"
					value="2.00"
					class="mt-2 block w-full rounded-md border-0 bg-slate-950 py-1.5 text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm sm:leading-6"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<div class="flex justify-end gap-3">
		<button
			class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
			disabled>Cancel</button
		>
		<button
			class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
			disabled>Save Changes</button
		>
	</div>
</div>
