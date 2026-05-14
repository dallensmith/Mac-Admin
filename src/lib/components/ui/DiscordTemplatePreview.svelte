<script lang="ts">
	import type { PBEmbedTemplateRecord } from '../../../types/pocketbase';

	let { template } = $props<{ template: PBEmbedTemplateRecord }>();

	// Parse fields JSON for inline fields
	function parseFields(json: string): Array<{ name: string; value: string; inline: boolean }> {
		try {
			const parsed = JSON.parse(json);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	let embedFields = $derived(parseFields(template.fields_json ?? '[]'));

	// Determine accent color — default to Discord blurple
	let accentColor = $derived(template.color || '#5865F2');

	// Build footer display
	let footerParts = $derived.by(() => {
		const parts: string[] = [];
		if (template.footer_enabled && template.footer_text) {
			parts.push(template.footer_text);
		}
		if (template.timestamp_enabled) {
			parts.push('Today at 4:20 PM');
		}
		return parts;
	});
</script>

<!-- Mock Discord Message Layout -->
<div class="rounded-lg bg-[#313338] p-4 font-sans text-sm text-slate-200">
	<!-- Discord Message Header -->
	<div class="mb-1 flex items-start gap-4">
		<!-- Avatar -->
		<div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#2b2d31]">
			<img
				src="https://ui-avatars.com/api/?name=Mac+Bot&background=5865F2&color=fff"
				alt="Bot Avatar"
				class="h-full w-full object-cover"
			/>
		</div>
		<!-- Username and Timestamp -->
		<div class="flex-1">
			<div class="flex items-baseline gap-2">
				<span class="font-medium text-white">Smart Mac</span>
				<span
					class="rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
					>BOT</span
				>
				<span class="text-xs text-[#949ba4]">Today at 4:20 PM</span>
			</div>

			<!-- Discord Embed -->
			<div class="mt-2 flex max-w-lg overflow-hidden rounded border border-[#1e1f22] bg-[#2b2d31]">
				<!-- Left Color Strip -->
				<div class="w-1 shrink-0" style="background-color: {accentColor}"></div>

				<div class="flex flex-1 flex-col p-4">
					<!-- Author Line -->
					{#if template.author_enabled && template.author_name}
						<div class="mb-2 flex items-center gap-2">
							{#if template.author_icon_url}
								<img
									src={template.author_icon_url}
									alt=""
									class="h-5 w-5 rounded-full object-cover"
								/>
							{/if}
							{#if template.author_url}
								<a
									href={template.author_url}
									class="text-xs font-medium text-white hover:underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									{template.author_name}
								</a>
							{:else}
								<span class="text-xs font-medium text-white">{template.author_name}</span>
							{/if}
						</div>
					{/if}

					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 flex-1">
							<!-- Title -->
							{#if template.title_enabled && template.title_text}
								<div class="mb-1 text-xs font-bold">
									{#if template.url_enabled && template.url_text}
										<a
											href={template.url_text}
											class="text-white hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											{template.title_text}
										</a>
									{:else}
										<span class="text-white">{template.title_text}</span>
									{/if}
								</div>
							{/if}

							<!-- Description -->
							{#if template.description_enabled && template.description_text}
								<div class="text-[13px] whitespace-pre-wrap text-[#dbdee1]">
									{template.description_text}
								</div>
							{/if}

							<!-- Inline Fields Grid -->
							{#if embedFields.length > 0}
								<div class="mt-3 flex flex-wrap gap-x-4 gap-y-3">
									{#each embedFields as field (field.name)}
										<div class={field.inline ? 'min-w-[45%]' : 'w-full'}>
											<div class="text-[11px] font-bold text-white">{field.name}</div>
											<div class="text-[13px] text-[#dbdee1]">{field.value}</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Thumbnail (Right aligned) -->
						{#if template.thumbnail_enabled && template.thumbnail_url}
							<div class="h-[100px] w-[75px] shrink-0 overflow-hidden rounded bg-[#1e1f22]">
								<img
									src={template.thumbnail_url}
									alt="Thumbnail"
									class="h-full w-full object-cover"
								/>
							</div>
						{/if}
					</div>

					<!-- Large Image (full-width below content) -->
					{#if template.image_enabled && template.image_url}
						<div class="mt-4 overflow-hidden rounded bg-[#1e1f22]">
							<img
								src={template.image_url}
								alt=""
								class="h-auto max-h-[300px] w-full object-cover"
							/>
						</div>
					{/if}

					<!-- Footer -->
					{#if footerParts.length > 0}
						<div class="mt-3 flex items-center gap-2">
							{#if template.footer_enabled && template.footer_icon_url}
								<img
									src={template.footer_icon_url}
									alt=""
									class="h-4 w-4 rounded-full object-cover"
								/>
							{/if}
							<div class="text-[11px] text-[#dbdee1]">
								{footerParts.join(' • ')}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
