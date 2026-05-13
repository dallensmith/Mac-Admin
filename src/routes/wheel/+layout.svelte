<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const tabs = [
		{ name: 'Wheel', path: '/wheel' },
		{ name: 'Logs', path: '/wheel/logs' },
		{ name: 'Backups', path: '/wheel/backups' },
		{ name: 'Cleanup', path: '/wheel/cleanup' }
	];

	let activeTab = $derived(
		tabs.find((t) => page.url.pathname === t.path || (t.path !== '/wheel' && page.url.pathname.startsWith(t.path)))
			?? tabs[0]
	);
</script>

<div class="mb-6">
	<nav class="flex gap-1 border-b-2 border-slate-700">
		{#each tabs as tab}
			<a
				href={tab.path}
				class="relative px-5 py-3 text-sm font-bold tracking-wider uppercase transition-all duration-300 {activeTab.path === tab.path
					? 'text-cyan-400'
					: 'text-slate-500 hover:text-slate-300'}"
			>
				{tab.name}
				{#if activeTab.path === tab.path}
					<div class="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 shadow-glow-cyan-sm"></div>
				{/if}
			</a>
		{/each}
	</nav>
</div>

{@render children()}
