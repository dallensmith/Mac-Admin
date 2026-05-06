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
					class="label-caps"
					>Bot Name</label
				>
				<input
					type="text"
					id="botName"
					value="Smart Mac"
					class="input-dark"
					disabled
				/>
			</div>
			<div>
				<label
					for="guildId"
					class="label-caps"
					>Primary Guild ID</label
				>
				<input
					type="text"
					id="guildId"
					value="123456789012345678"
					class="input-dark"
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
					class="label-caps"
					>Provider</label
				>
				<select
					id="provider"
					class="input-dark"
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
					class="label-caps"
					>Model</label
				>
				<input
					type="text"
					id="model"
					value="google/gemini-pro"
					class="input-dark"
					disabled
				/>
			</div>
			<div>
				<label
					for="temperature"
					class="label-caps"
					>Temperature</label
				>
				<input
					type="number"
					id="temperature"
					value="0.9"
					step="0.1"
					class="input-dark"
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
					class="label-caps"
					>Global Cooldown (seconds)</label
				>
				<input
					type="number"
					id="cooldown"
					value="30"
					class="input-dark"
					disabled
				/>
			</div>
			<div>
				<label
					for="budget"
					class="label-caps"
					>Daily Budget Limit ($)</label
				>
				<input
					type="number"
					id="budget"
					value="2.00"
					class="input-dark"
					disabled
				/>
			</div>
		</div>
	</SectionCard>

	<div class="flex justify-end gap-3">
		<button class="btn-ghost" disabled>Cancel</button>
		<button class="btn-cyan" disabled>Save Changes</button>
	</div>
</div>
