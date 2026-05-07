<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<PageHeader
	title="System Settings"
	description="Configure environment, integrations, and admin panel properties."
/>

<div class="max-w-4xl space-y-6">
	<SectionCard title="Environment Details">
		<div class="space-y-4">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Current Environment</p>
					<p class="text-xs text-slate-500">Development (Local)</p>
				</div>
				<span
					class="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20 ring-inset"
				>
					development
				</span>
			</div>
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Database Connection</p>
					<p class="text-xs text-slate-500">PocketBase</p>
				</div>
				<span
					class="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20 ring-inset"
				>
					Connected
				</span>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-200">Deployment Status</p>
					<p class="text-xs text-slate-500">Coolify / Docker</p>
				</div>
				<span
					class="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-500/20 ring-inset"
				>
					N/A locally
				</span>
			</div>
		</div>
	</SectionCard>

	<SectionCard title="API Integrations">
		<div class="space-y-4">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Discord Bot Token</p>
					<p class="text-xs text-slate-500">Used for communicating with the Discord API.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<p class="text-sm font-medium text-slate-200">Discord OAuth (PocketBase)</p>
					<p class="text-xs text-slate-500">Used for admin Discord login.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-slate-200">OpenRouter API Key</p>
					<p class="text-xs text-slate-500">Used for LLM inference.</p>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
					<span class="text-sm text-slate-400">Configured</span>
				</div>
			</div>
		</div>
	</SectionCard>
</div>
