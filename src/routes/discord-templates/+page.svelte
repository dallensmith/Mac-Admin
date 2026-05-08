<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import DiscordTemplatePreview from '$lib/components/ui/DiscordTemplatePreview.svelte';
	import TemplateVariableList from '$lib/components/ui/TemplateVariableList.svelte';
	import TemplateFieldToggle from '$lib/components/ui/TemplateFieldToggle.svelte';
	import TemplatePresetCard from '$lib/components/ui/TemplatePresetCard.svelte';
	import {
		mockTemplates,
		mockVariables,
		mockPresets,
		discordLimits,
		defaultTemplateData
	} from '$lib/mock/templates';

	let selectedTemplateId = $state(mockTemplates[0].id);

	// Create a reactive state copy so the UI updates the preview
	let currentTemplateData = $state({ ...defaultTemplateData });

	function loadPreset(presetId: string) {
		// Mock loading preset logic
		if (presetId === 'compact-movie') {
			currentTemplateData.titleFormat = '{{movie.title}}';
			currentTemplateData.descriptionFormat = '';
			currentTemplateData.thumbnailEnabled = false;
			currentTemplateData.imageEnabled = false;
			currentTemplateData.showActors = false;
			currentTemplateData.showDirector = false;
			currentTemplateData.showGenres = false;
		} else if (presetId === 'minimal-result') {
			currentTemplateData.thumbnailEnabled = false;
			currentTemplateData.imageEnabled = false;
			currentTemplateData.buttonsEnabled = false;
			currentTemplateData.showActors = false;
			currentTemplateData.showDirector = false;
			currentTemplateData.showRating = false;
		} else {
			// Full reset
			currentTemplateData = { ...defaultTemplateData };
		}
	}
</script>

<PageHeader
	title="Discord Templates"
	description="Customize the appearance of bot messages and embeds."
/>

<div class="grid gap-6 xl:grid-cols-12">
	<!-- Left Side: Editor -->
	<div class="space-y-6 xl:col-span-7">
		<SectionCard title="Template Selection">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="templateSelect" class="label-caps">Edit Template</label>
					<select id="templateSelect" bind:value={selectedTemplateId} class="input-dark">
						{#each mockTemplates as template (template.id)}
							<option value={template.id}>{template.name}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col justify-end">
					<p class="text-xs text-slate-500">
						{mockTemplates.find((t) => t.id === selectedTemplateId)?.description}
					</p>
				</div>
			</div>
		</SectionCard>

		<SectionCard title="Content Formatting">
			<div class="space-y-4">
				<div>
					<label for="titleFormat" class="label-caps">Embed Title</label>
					<input
						id="titleFormat"
						type="text"
						bind:value={currentTemplateData.titleFormat}
						class="input-dark"
					/>
				</div>

				<div>
					<label for="descFormat" class="label-caps">Description Body</label>
					<textarea
						id="descFormat"
						rows="3"
						bind:value={currentTemplateData.descriptionFormat}
						class="input-dark"
					></textarea>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="accentColor" class="label-caps">Accent Color (Hex)</label>
						<div class="mt-2 flex gap-2">
							<input
								id="accentColor"
								type="color"
								bind:value={currentTemplateData.accentColor}
								class="h-9 w-9 cursor-pointer rounded border border-slate-800/80 bg-slate-950"
							/>
							<input
								type="text"
								bind:value={currentTemplateData.accentColor}
								class="block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 uppercase shadow-inset-form transition-all duration-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none"
							/>
						</div>
					</div>
					<div>
						<label for="footerText" class="label-caps">Footer Text</label>
						<input
							id="footerText"
							type="text"
							bind:value={currentTemplateData.footerText}
							class="input-dark"
						/>
					</div>
				</div>
			</div>
		</SectionCard>

		<SectionCard title="Visibility Toggles">
			<div class="grid gap-y-4 sm:grid-cols-2">
				<TemplateFieldToggle
					id="toggle-thumbnail"
					label="Show Thumbnail"
					checked={currentTemplateData.thumbnailEnabled}
					onChange={(val) => (currentTemplateData.thumbnailEnabled = val)}
				/>
				<TemplateFieldToggle
					id="toggle-image"
					label="Show Large Image"
					checked={currentTemplateData.imageEnabled}
					onChange={(val) => (currentTemplateData.imageEnabled = val)}
				/>
				<TemplateFieldToggle
					id="toggle-timestamp"
					label="Show Timestamp"
					checked={currentTemplateData.timestampEnabled}
					onChange={(val) => (currentTemplateData.timestampEnabled = val)}
				/>
				<TemplateFieldToggle
					id="toggle-director"
					label="Show Director Field"
					checked={currentTemplateData.showDirector}
					onChange={(val) => (currentTemplateData.showDirector = val)}
				/>
				<TemplateFieldToggle
					id="toggle-actors"
					label="Show Cast Field"
					checked={currentTemplateData.showActors}
					onChange={(val) => (currentTemplateData.showActors = val)}
				/>
				<TemplateFieldToggle
					id="toggle-rating"
					label="Show Rating Field"
					checked={currentTemplateData.showRating}
					onChange={(val) => (currentTemplateData.showRating = val)}
				/>
				<TemplateFieldToggle
					id="toggle-genres"
					label="Show Genres Field"
					checked={currentTemplateData.showGenres}
					onChange={(val) => (currentTemplateData.showGenres = val)}
				/>
				<TemplateFieldToggle
					id="toggle-buttons"
					label="Show Action Buttons"
					checked={currentTemplateData.buttonsEnabled}
					onChange={(val) => (currentTemplateData.buttonsEnabled = val)}
				/>
			</div>
		</SectionCard>

		<div class="flex justify-end gap-3">
			<button class="btn-ghost" onclick={() => loadPreset('full-archive')}> Reset Defaults </button>
			<button class="btn-cyan"> Save Template </button>
		</div>

		<SectionCard title="Variables & References">
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<TemplateVariableList title="Movie Variables" variables={mockVariables['Movie Lookup']} />
				</div>
				<div>
					<TemplateVariableList
						title="Experiment Variables"
						variables={mockVariables['Experiment Lookup']}
					/>
				</div>
			</div>
		</SectionCard>
	</div>

	<!-- Right Side: Live Preview & Limits -->
	<div class="space-y-6 xl:col-span-5">
		<SectionCard title="Live Preview">
			<div class="rounded-lg bg-slate-950 p-2 shadow-inset-form-deep">
				<DiscordTemplatePreview templateData={currentTemplateData} />
			</div>
		</SectionCard>

		<SectionCard title="Presets">
			<div class="grid gap-3 sm:grid-cols-2">
				{#each mockPresets as preset (preset.id)}
					<TemplatePresetCard {preset} onClick={() => loadPreset(preset.id)} />
				{/each}
			</div>
		</SectionCard>

		<SectionCard title="Discord Limits">
			<ul class="space-y-2">
				{#each discordLimits as limit (limit.limit)}
					<li
						class="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0"
					>
						<span class="text-xs font-bold text-slate-300">{limit.limit}</span>
						<span class="text-xs text-fuchsia-400">{limit.max}</span>
					</li>
				{/each}
			</ul>
		</SectionCard>
	</div>
</div>
