<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { data } = $props<{ data: import('./$types').PageData }>();

	let sessions = $derived(data.sessions as Record<string, unknown>[]);
	let messages = $derived(data.messages as Record<string, unknown>[]);
	let selectedSessionId = $derived(data.selectedSessionId as string | null);

	function selectSession(sessionId: string) {
		goto(`/messages?session=${sessionId}`, { replaceState: true });
	}

	function formatDate(ts: string): string {
		return ts?.replace('T', ' ').slice(0, 19) ?? '—';
	}

	let selectedSession = $derived(
		selectedSessionId ? sessions.find((s) => s.id === selectedSessionId) : null
	);
</script>

<PageHeader
	title="Conversation History"
	description="Browse bot conversations by session for debugging and context review."
/>

<div class="grid gap-6 lg:grid-cols-3">
	<!-- Left: Session list -->
	<div class="lg:col-span-1">
		<SectionCard title="Sessions ({sessions.length})">
			{#if sessions.length > 0}
				<div class="space-y-1 max-h-[70vh] overflow-y-auto">
					{#each sessions as session (session.id)}
						{@const s = session as Record<string, unknown>}
						<button
							onclick={() => selectSession(s.id as string)}
							class="w-full rounded-none border px-3 py-3 text-left transition-all duration-200 {selectedSessionId === s.id
								? 'border-cyan-500/50 bg-cyan-500/10'
								: 'border-slate-700/50 bg-transparent hover:border-slate-600 hover:bg-slate-800/50'}"
						>
							<div class="flex items-center justify-between gap-2">
								<span class="truncate text-xs font-medium text-slate-300">{s.user_id ?? '—'}</span>
								{#if s.is_terminated === true}
									<span class="text-label font-bold tracking-wider text-rose-400 uppercase shrink-0">Ended</span>
								{:else}
									<span class="text-label font-bold tracking-wider text-emerald-400 uppercase shrink-0">Active</span>
								{/if}
							</div>
							<p class="mt-1 truncate text-xs text-slate-500">
								Channel: {s.channel_id ?? '—'}
							</p>
							<p class="mt-0.5 text-xs text-slate-600">
								Last: {formatDate(s.last_active as string)}
							</p>
						</button>
					{/each}
				</div>
			{:else}
				<EmptyState title="No sessions" message="Active bot conversations will appear here." />
			{/if}
		</SectionCard>
	</div>

	<!-- Right: Message thread -->
	<div class="lg:col-span-2">
		<SectionCard title={selectedSession ? 'Conversation Thread' : 'Messages'}>
			{#snippet headerAction()}
				{#if selectedSession}
					{@const s = selectedSession as Record<string, unknown>}
					<div class="text-xs text-slate-400">
						{s.is_terminated ? 'Terminated' : 'Active'} · {messages.length} messages
					</div>
				{/if}
			{/snippet}

			{#if !selectedSessionId}
				<div class="py-8 text-center text-sm text-slate-500">
					Select a session from the left to view its conversation.
				</div>
			{:else if messages.length > 0}
				<div class="max-h-[65vh] overflow-y-auto space-y-3">
					{#each messages as msg (msg.id)}
						{@const m = msg as Record<string, unknown>}
						{@const isUser = m.role === 'user'}
						<div class="flex {isUser ? 'justify-end' : 'justify-start'}">
							<div class="max-w-[80%] rounded-none border-2 px-4 py-3 {isUser
								? 'border-cyan-500/30 bg-cyan-500/10'
								: 'border-slate-700 bg-slate-900/80'}"
							>
								<div class="mb-1 flex items-center gap-2">
									<span class="text-label font-bold tracking-wider uppercase {isUser ? 'text-cyan-400' : 'text-fuchsia-400'}">
										{isUser ? 'User' : 'Bot'}
									</span>
									<span class="text-xs text-slate-600">{formatDate(m.created as string)}</span>
								</div>
								<p class="text-sm whitespace-pre-wrap text-slate-300">{m.content ?? '—'}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<EmptyState
					title="No messages"
					message="This session has no recorded messages."
				/>
			{/if}
		</SectionCard>
	</div>
</div>
