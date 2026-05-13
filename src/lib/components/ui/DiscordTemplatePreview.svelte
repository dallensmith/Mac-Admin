<script lang="ts">
	import type { TemplateButtonConfig } from '../../../types/pocketbase.js';

	let { templateData } = $props<{ templateData: Record<string, unknown> }>();

	const buttonStyleClasses: Record<string, string> = {
		primary: 'bg-[#5865F2] hover:bg-[#4752c4]',
		secondary: 'bg-[#4e5058] hover:bg-[#6d6f78]',
		success: 'bg-[#248046] hover:bg-[#1a6334]',
		danger: 'bg-[#d83c3e] hover:bg-[#a12d2f]'
	};

	let buttons = $derived((templateData.buttons as TemplateButtonConfig[] | undefined) ?? []);

	// Group buttons by row number
	let buttonRows = $derived(
		buttons.reduce<Map<number, TemplateButtonConfig[]>>((acc, btn) => {
			const row = btn.row ?? 0;
			if (!acc.has(row)) acc.set(row, []);
			acc.get(row)!.push(btn);
			return acc;
		}, new Map())
	);
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
				<div
					class="w-1 shrink-0"
					style="background-color: {templateData.accentColor || '#5865F2'}"
				></div>

				<div class="flex flex-1 flex-col p-4">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<!-- Author / Title -->
							<div class="mb-1 cursor-pointer text-xs font-bold text-white hover:underline">
								{templateData.titleFormat || 'Untitled Template'}
							</div>

							<!-- Description -->
							<div class="text-[13px] whitespace-pre-wrap text-[#dbdee1]">
								{templateData.descriptionFormat || 'No description provided.'}
							</div>

							<!-- Fake Fields (Controlled by Toggles) -->
							<div class="mt-4 flex flex-wrap gap-x-4 gap-y-3">
								{#if templateData.showDirector}
									<div class="min-w-[45%]">
										<div class="text-[11px] font-bold text-white">Director</div>
										<div class="text-[13px] text-[#dbdee1]">Some Director</div>
									</div>
								{/if}
								{#if templateData.showActors}
									<div class="min-w-[45%]">
										<div class="text-[11px] font-bold text-white">Cast</div>
										<div class="text-[13px] text-[#dbdee1]">Actor 1, Actor 2</div>
									</div>
								{/if}
								{#if templateData.showRating}
									<div class="min-w-[45%]">
										<div class="text-[11px] font-bold text-white">Rating</div>
										<div class="text-[13px] text-[#dbdee1]">PG-13</div>
									</div>
								{/if}
								{#if templateData.showGenres}
									<div class="min-w-[45%]">
										<div class="text-[11px] font-bold text-white">Genres</div>
										<div class="text-[13px] text-[#dbdee1]">Action, Sci-Fi</div>
									</div>
								{/if}
							</div>
						</div>

						<!-- Thumbnail (Right aligned) -->
						{#if templateData.thumbnailEnabled}
							<div class="h-[100px] w-[75px] shrink-0 overflow-hidden rounded bg-[#1e1f22]">
								<img
									src="https://placehold.co/150x200/2b2d31/dbdee1?text=Poster"
									alt="Thumbnail"
									class="h-full w-full object-cover opacity-80"
								/>
							</div>
						{/if}
					</div>

					<!-- Bottom Image -->
					{#if templateData.imageEnabled}
						<div class="mt-4 max-w-[400px] overflow-hidden rounded bg-[#1e1f22]">
							<img
								src="https://placehold.co/600x300/2b2d31/dbdee1?text=Large+Image"
								alt="Embed"
								class="h-auto w-full opacity-80"
							/>
						</div>
					{/if}

					<!-- Footer -->
					<div class="mt-3 flex items-center gap-2">
						<div class="text-[11px] text-[#dbdee1]">
							{templateData.footerText || ''}
							{#if templateData.timestampEnabled}
								{#if templateData.footerText}•{/if} Today at 4:20 PM
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Buttons (grouped by row) -->
			{#if buttons.length > 0}
				<div class="mt-2 flex flex-col gap-1.5">
					{#each [...buttonRows.entries()].sort(([a], [b]) => a - b) as [, rowBtns]}
						<div class="flex flex-wrap gap-2">
							{#each rowBtns as btn}
								<button
									type="button"
									class="flex h-8 items-center gap-1.5 rounded px-4 text-sm font-medium text-white transition-colors {buttonStyleClasses[btn.style] ?? buttonStyleClasses.secondary}"
								>
									{#if btn.type === 'action'}
										<span class="text-xs opacity-75">⚡</span>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
									{/if}
									{btn.emoji ? `${btn.emoji} ` : ''}{btn.label || '(no label)'}
								</button>
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
