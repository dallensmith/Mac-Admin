<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import { mockDashboardStats, mockRecentActivity } from '$lib/mock/admin';

	let { data } = $props();

	const activityIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`;
	const serverIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`;
	const zapIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`;
	const dollarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
</script>

<PageHeader title="Dashboard" description="Overview of Mac Bot's current status and activity." />

<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard
		title="Bot Status"
		value={mockDashboardStats.botStatus}
		trend="Online"
		icon={activityIcon}
	/>
	<StatCard
		title={data.guildStats?.name ?? 'Guild Members'}
		value={data.guildStats?.memberCount ?? '—'}
		trend={data.guildStats ? `${data.guildStats.onlineCount} online` : undefined}
		icon={serverIcon}
	/>
	<StatCard title="API Latency" value={mockDashboardStats.ping} icon={zapIcon} />
	<StatCard title="Daily API Cost" value={mockDashboardStats.dailyCost} icon={dollarIcon} />
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<SectionCard title="Recent Activity" description="Latest actions from users and system.">
		<div class="space-y-4">
			{#each mockRecentActivity as activity (activity.id)}
				<div
					class="flex items-start gap-4 border-b border-slate-800/40 pb-4 last:border-0 last:pb-0"
				>
					<div
						class="mt-1 rounded border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-cyan-400 shadow-glow-cyan-xs"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-info"
							><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
						>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-200">{activity.action}</p>
						<p class="mt-0.5 text-xs text-slate-500">{activity.user} • {activity.time}</p>
					</div>
				</div>
			{/each}
		</div>
	</SectionCard>

	<SectionCard title="Quick Actions">
		<div class="grid gap-4 sm:grid-cols-2">
			<button
				class="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-glow-cyan-md"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
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
					class="lucide lucide-refresh-cw text-slate-400 transition-colors duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-glow-cyan-md"
					><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg
				>
				<span
					class="text-ui font-bold tracking-wider text-slate-400 uppercase transition-colors duration-300 group-hover:text-slate-200"
					>Restart Bot</span
				>
			</button>
			<button
				class="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:bg-slate-800/80 hover:shadow-glow-fuchsia-md"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-linear-to-b from-fuchsia-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
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
					class="lucide lucide-dices text-slate-400 transition-colors duration-300 group-hover:text-fuchsia-400 group-hover:drop-shadow-glow-fuchsia-lg"
					><rect width="12" height="12" x="2" y="10" rx="2" ry="2" /><path
						d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"
					/><path d="M6 18h.01" /><path d="M10 14h.01" /><path d="M15 6h.01" /><path
						d="M18 9h.01"
					/></svg
				>
				<span
					class="text-ui font-bold tracking-wider text-slate-400 uppercase transition-colors duration-300 group-hover:text-slate-200"
					>Force Spin Wheel</span
				>
			</button>
			<button
				class="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-slate-800/80 hover:shadow-glow-purple-md"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
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
					class="lucide lucide-message-square text-slate-400 transition-colors duration-300 group-hover:text-purple-400 group-hover:drop-shadow-glow-purple-lg"
					><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg
				>
				<span
					class="text-ui font-bold tracking-wider text-slate-400 uppercase transition-colors duration-300 group-hover:text-slate-200"
					>Global Announcement</span
				>
			</button>
			<button
				class="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-glow-cyan-md"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
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
					class="lucide lucide-settings text-slate-400 transition-colors duration-300 group-hover:text-cyan-400 group-hover:drop-shadow-glow-cyan-md"
					><path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/><circle cx="12" cy="12" r="3" /></svg
				>
				<span
					class="text-ui font-bold tracking-wider text-slate-400 uppercase transition-colors duration-300 group-hover:text-slate-200"
					>Sync Configs</span
				>
			</button>
		</div>
	</SectionCard>
</div>
