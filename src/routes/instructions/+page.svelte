<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
</script>

<PageHeader
	title="Bot Instructions"
	description="Manage the AI system prompts, behavior guidelines, and tools."
/>

<div class="grid h-[calc(100vh-12rem)] gap-6 lg:grid-cols-4">
	<div class="space-y-2 overflow-y-auto lg:col-span-1">
		<button
			class="w-full rounded-md border border-indigo-500/20 bg-indigo-600/10 px-4 py-3 text-left text-sm font-medium text-indigo-400"
		>
			system.md
		</button>
		<button
			class="w-full rounded-md px-4 py-3 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
		>
			behavior.md
		</button>
		<button
			class="w-full rounded-md px-4 py-3 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
		>
			tools.md
		</button>
		<button
			class="w-full rounded-md px-4 py-3 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
		>
			personality.md
		</button>
	</div>

	<div class="flex h-full flex-col lg:col-span-3">
		<SectionCard title="Editing: system.md" description="Core system instructions for the LLM.">
			{#snippet headerAction()}
				<div class="flex gap-2">
					<button
						class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
						disabled
					>
						Reload Bot Instructions
					</button>
					<button
						class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
						disabled
					>
						Save Draft
					</button>
				</div>
			{/snippet}

			<div class="mt-4 flex-1">
				<textarea
					class="h-96 w-full resize-none rounded-md border-0 bg-slate-950 p-4 font-mono text-sm text-slate-300 shadow-sm ring-1 ring-slate-800 ring-inset focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
					disabled
				>
					You are Smart Mac, a highly opinionated and sarcastic Discord bot that loves bad movies.
					Your primary directive is to judge people's taste in cinema and suggest terrible
					alternatives. Guidelines: 1. Always maintain a slightly condescending tone. 2. Never admit
					a "good" movie is actually good. 3. Use emojis sparingly, only to emphasize sarcasm.
				</textarea>
			</div>
		</SectionCard>
	</div>
</div>
