<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import { mockGameModes, mockTriviaQuestions, mockSources } from '$lib/mock/gamesTrivia';

	// TODO: Connect trivia questions to database
	// TODO: Define game session model
	// TODO: Sync game commands with Discord bot
	// TODO: Add per-guild game settings
	// TODO: Add scoring/leaderboards
	// TODO: Add AI-assisted trivia generation
	// TODO: Require admin approval before AI-generated trivia goes live

	let questions = $state([...mockTriviaQuestions]);

	let totalQuestions = $derived(questions.length);
	let draftQuestions = $derived(questions.filter((q) => q.status === 'Draft').length);
	let needsReviewQuestions = $derived(questions.filter((q) => q.status === 'Needs Review').length);
	let activeGames = $state(2); // Hardcoded mock

	// Form state
	let newQuestion = $state('');
	let newAnswer = $state('');
	let newCategory = $state('Movie Trivia');
	let newDifficulty = $state('Medium');
	let newSource = $state('Manual');

	function handleAddTrivia(e: Event) {
		e.preventDefault();
		if (!newQuestion || !newAnswer) return;

		questions.push({
			id: Math.max(...questions.map((q) => q.id), 0) + 1,
			question: newQuestion,
			answer: newAnswer,
			category: newCategory,
			difficulty: newDifficulty,
			source: newSource,
			status: 'Draft',
			lastUpdated: new Date().toISOString().split('T')[0]
		});

		newQuestion = '';
		newAnswer = '';
	}

	function updateQuestionStatus(id: number, status: string) {
		const index = questions.findIndex((q) => q.id === id);
		if (index !== -1) {
			questions[index].status = status;
		}
	}

	function removeQuestion(id: number) {
		questions = questions.filter((q) => q.id !== id);
	}
</script>

<PageHeader
	title="Games & Trivia"
	description="Configure Discord games, manage the trivia database, and review AI-generated drafts."
/>

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard title="Total Trivia Questions" value={totalQuestions.toString()} />
	<StatCard title="Active Games" value={activeGames.toString()} />
	<StatCard
		title="Draft Questions"
		value={draftQuestions.toString()}
		trend="Incomplete"
		trendUp={false}
	/>
	<StatCard
		title="Needs Review"
		value={needsReviewQuestions.toString()}
		trend={needsReviewQuestions > 0 ? 'Action Required' : 'Caught Up'}
		trendUp={needsReviewQuestions === 0}
	/>
</div>

<div class="grid gap-6 xl:grid-cols-3">
	<!-- Left/Center Column -->
	<div class="space-y-6 xl:col-span-2">
		<!-- Review Queue -->
		{#if needsReviewQuestions > 0}
			<div
				class="group relative overflow-hidden rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/10 p-6 shadow-glow-fuchsia-md"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-fuchsia-900/20 via-transparent to-transparent"
				></div>
				<div class="relative z-10 mb-4 flex items-center gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-clipboard-check text-fuchsia-400 drop-shadow-glow-fuchsia-bright"
						><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path
							d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
						/><path d="m9 14 2 2 4-4" /></svg
					>
					<h3 class="text-sm font-bold tracking-widest text-fuchsia-400 uppercase">
						Review Queue ({needsReviewQuestions})
					</h3>
				</div>
				<div class="relative z-10 space-y-3">
					{#each questions.filter((q) => q.status === 'Needs Review') as q (q.id)}
						<div class="rounded border border-fuchsia-500/30 bg-slate-950/60 p-4">
							<div class="mb-2">
								<span class="text-label font-bold tracking-widest text-slate-400 uppercase"
									>Question:</span
								>
								<p class="text-sm text-slate-200">{q.question}</p>
							</div>
							<div class="mb-3">
								<span class="text-label font-bold tracking-widest text-slate-400 uppercase"
									>Answer:</span
								>
								<p class="text-sm text-emerald-400">{q.answer}</p>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex gap-2">
									<span
										class="rounded bg-slate-800/80 px-2 py-0.5 text-label font-bold tracking-wider text-slate-400 uppercase"
										>{q.category}</span
									>
									<span
										class="rounded bg-slate-800/80 px-2 py-0.5 text-label font-bold tracking-wider text-cyan-400 uppercase"
										>{q.source}</span
									>
								</div>
								<div class="flex gap-2">
									<button
										onclick={() => updateQuestionStatus(q.id, 'Approved')}
										class="rounded border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-label font-bold tracking-widest text-emerald-400 uppercase transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
										>Approve</button
									>
									<button
										onclick={() => updateQuestionStatus(q.id, 'Draft')}
										class="rounded border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-label font-bold tracking-widest text-rose-400 uppercase transition-colors hover:bg-rose-500/20 hover:text-rose-300"
										>Reject to Draft</button
									>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<SectionCard title="Game Modes">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each mockGameModes as mode (mode.id)}
					<div
						class="group relative flex flex-col items-start gap-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 p-5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-glow-cyan-sm-soft"
					>
						<div
								class="pointer-events-none absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<div class="relative z-10 flex w-full items-start justify-between">
							<span
								class="text-ui font-bold tracking-widest text-cyan-400 uppercase drop-shadow-sm"
								>{mode.name}</span
							>
							<span
								class="inline-flex items-center rounded border px-2 py-0.5 text-label-xs font-bold tracking-wider uppercase {mode.status ===
								'enabled'
									? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-glow-emerald-xs'
									: 'border-slate-500/30 bg-slate-500/10 text-slate-400'}">{mode.status}</span
							>
						</div>
						<p class="relative z-10 flex-1 text-xs text-slate-400">{mode.description}</p>
						<div class="relative z-10 mt-2 flex w-full items-center justify-between">
							<span class="text-label-xs font-bold tracking-widest text-fuchsia-400 uppercase"
								>Diff: {mode.difficultyRange}</span
							>
							<button
								class="text-label font-bold tracking-widest text-slate-300 uppercase transition-colors hover:text-cyan-300"
								>Configure</button
							>
						</div>
					</div>
				{/each}
			</div>
		</SectionCard>

		<SectionCard title="Trivia Question Bank">
			<DataTable
				columns={['Question', 'Answer', 'Category', 'Source', 'Status', 'Actions']}
				data={questions}
			>
				{#snippet rowSnippet(row)}
					<td class="max-w-xs truncate px-6 py-4 font-medium text-slate-200" title={row.question}
						>{row.question}</td
					>
					<td class="max-w-xs truncate px-6 py-4 text-emerald-400" title={row.answer}
						>{row.answer}</td
					>
					<td
						class="px-6 py-4 text-label font-bold tracking-widest whitespace-nowrap text-cyan-400 uppercase"
						>{row.category}</td
					>
					<td
						class="px-6 py-4 text-label font-bold tracking-widest whitespace-nowrap text-fuchsia-400 uppercase"
						>{row.source}</td
					>
					<td class="px-6 py-4 whitespace-nowrap">
						<StatusBadge status={row.status} />
					</td>
					<td class="px-6 py-4 text-right whitespace-nowrap">
						<div class="flex justify-end gap-3">
							<button
								class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-cyan-400"
								>Edit</button
							>
							<button
								class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-cyan-400"
								>Duplicate</button
							>
							<button
								onclick={() => updateQuestionStatus(row.id, 'Draft')}
								class="text-label font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-rose-400"
								>Archive</button
							>
							<button
								onclick={() => removeQuestion(row.id)}
								class="text-label font-bold tracking-wider text-slate-600 uppercase transition-colors hover:text-rose-500"
								>Delete</button
							>
						</div>
					</td>
				{/snippet}
			</DataTable>
		</SectionCard>
	</div>

	<!-- Right Column -->
	<div class="space-y-6 xl:col-span-1">
		<SectionCard title="Create Question">
			<form class="space-y-4" onsubmit={handleAddTrivia}>
				<div>
					<label
						for="question"
						class="label-caps"
						>Question <span class="text-rose-500">*</span></label
					>
					<textarea
						id="question"
						rows="3"
						bind:value={newQuestion}
						required
						class="input-dark"
					></textarea>
				</div>
				<div>
					<label
						for="answer"
						class="label-caps"
						>Correct Answer <span class="text-rose-500">*</span></label
					>
					<input
						id="answer"
						type="text"
						bind:value={newAnswer}
						required
						class="mt-2 block w-full rounded border border-emerald-500/30 bg-slate-950/50 px-3 py-2 text-sm text-emerald-400 shadow-inset-form transition-all duration-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="wrongAnswers"
						class="label-caps"
						>Wrong Answers (comma separated)</label
					>
					<input
						id="wrongAnswers"
						type="text"
						placeholder="Optional..."
						class="mt-2 block w-full rounded border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 shadow-inset-form transition-all duration-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 focus:outline-none"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label
							for="category"
							class="label-caps"
							>Category</label
						>
						<select
							id="category"
							bind:value={newCategory}
							class="input-dark"
						>
							<option>Movie Trivia</option>
							<option>Quote Guessing</option>
							<option>Guess the Bad Movie</option>
							<option>Year Guess</option>
						</select>
					</div>
					<div>
						<label
							for="difficulty"
							class="label-caps"
							>Difficulty</label
						>
						<select
							id="difficulty"
							bind:value={newDifficulty}
							class="input-dark"
						>
							<option>Easy</option>
							<option>Medium</option>
							<option>Hard</option>
							<option>Expert</option>
						</select>
					</div>
				</div>
				<div>
					<label
						for="source"
						class="label-caps"
						>Source Type</label
					>
					<select
						id="source"
						bind:value={newSource}
						class="input-dark"
					>
						<option>Manual</option>
						<option>Movie metadata</option>
						<option>Experiment archive</option>
						<option>TMDb / OMDb</option>
						<option>AI Draft</option>
					</select>
				</div>

				<button type="submit" class="btn-cyan mt-4 w-full">
					Save to Drafts
				</button>
			</form>
		</SectionCard>

		<SectionCard title="Trivia Sources">
			<p class="mb-4 text-xs leading-relaxed text-slate-400">
				Trivia and games are fueled by multiple data pipelines. AI-generated questions are
				automatically routed to the Review Queue before entering live games.
			</p>
			<ul class="space-y-4">
				{#each mockSources as src (src.name)}
					<li class="rounded border border-slate-800/60 bg-slate-950/40 p-3">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-ui font-bold tracking-widest text-cyan-400 uppercase"
								>{src.name}</span
							>
							<span
								class="text-label-xs font-bold tracking-widest uppercase {src.status === 'active'
									? 'text-emerald-400'
									: 'text-slate-500'}">{src.status}</span
							>
						</div>
						<p class="text-xs text-slate-400">{src.description}</p>
					</li>
				{/each}
			</ul>
		</SectionCard>
	</div>
</div>
