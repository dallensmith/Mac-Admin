<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let {
		guildIconUrl,
		guildName
	}: {
		guildIconUrl: string | null;
		guildName: string;
	} = $props();

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Bot Settings', path: '/bot-settings' },
		{ name: 'Instructions', path: '/instructions' },
		{ name: 'The Wheel', path: '/wheel' },
		{ name: 'Movies', path: '/movies' },
		{ name: 'Experiments', path: '/experiments' },
		{ name: 'Reviews', path: '/reviews' },
		{ name: 'Users', path: '/users' },
		{ name: 'Logs', path: '/logs' },
		{ name: 'Analytics', path: '/analytics' },
		{ name: 'Games & Trivia', path: '/games-trivia' },
		{ name: 'Settings', path: '/settings' },
		{ name: 'Discord Templates', path: '/discord-templates' }
	];
</script>

<aside
	class="relative flex w-64 flex-col overflow-hidden border-r-2 border-cyan-500 bg-linear-to-b from-indigo-900 to-slate-900 text-slate-100 shadow-sidebar transition-all sm:w-64"
>
	<!-- Right edge subtle glow line -->
	<div
		class="absolute top-0 right-0 bottom-0 w-px bg-cyan-400 opacity-50 shadow-glow-cyan-icon"
	></div>

	<div
		class="relative z-10 flex h-16 items-center border-b-2 border-purple-500/50 bg-indigo-950/50 px-6 shadow-inner"
	>
		<div class="flex items-center gap-3">
			{#if guildIconUrl}
				<img
					src={guildIconUrl}
					alt={guildName}
					class="h-7 w-7 rounded-full border border-cyan-500/50 object-cover shadow-glow-cyan-xs"
				/>
			{:else}
				<div class="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-glow-cyan-pulse"></div>
			{/if}
			<h1
					class="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-black tracking-widest text-transparent uppercase drop-shadow-glow-purple-sm"
			>
				MAC.ADMIN
			</h1>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-4">
		<nav class="space-y-0.5 px-3">
			{#each navItems as item (item.path)}
				{@const isActive =
					page.url.pathname === item.path ||
					(item.path !== '/' && page.url.pathname.startsWith(item.path))}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={item.path}
					class="group relative flex items-center overflow-hidden rounded-none px-4 py-3 text-sm font-bold transition-all duration-300 {isActive
					? 'bg-indigo-800/80 text-cyan-300 shadow-inset-accent'
						: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
				>
					{#if isActive}
						<div class="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-transparent"></div>
					{/if}
					<span
						class="relative z-10 text-ui font-black tracking-widest uppercase drop-shadow-md"
						>{item.name}</span
					>
				</a>
			{/each}
		</nav>
	</div>

	<div class="relative z-10 border-t-2 border-purple-500/50 bg-indigo-950/50 p-4">
		<p class="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
			Mac Bot Admin Panel v0.0.1
		</p>
		<form method="POST" action="/?/signOut" use:enhance>
			<button
				type="submit"
				class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs font-bold tracking-widest text-slate-500 uppercase transition-colors hover:bg-rose-500/10 hover:text-rose-400"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
				Sign Out
			</button>
		</form>
	</div>
</aside>
