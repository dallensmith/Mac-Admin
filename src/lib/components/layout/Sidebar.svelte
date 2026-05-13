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

	let collapsed = $state(false);

	const navItems = [
		{
			name: 'Dashboard',
			path: '/',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`
		},
		{
			name: 'Bot Settings',
			path: '/bot-settings',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`
		},
		{
			name: 'Instructions',
			path: '/instructions',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`
		},
		{
			name: 'The Wheel',
			path: '/wheel',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`
		},
		{
			name: 'Movies',
			path: '/movies',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>`
		},
		{
			name: 'Experiments',
			path: '/experiments',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flask-conical"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>`
		},
		{
			name: 'Reviews & Quotes',
			path: '/reviews',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
		},
		{
			name: 'Users',
			path: '/users',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
		},
		{
			name: 'Logs',
			path: '/logs',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>`
		},
		{
			name: 'Analytics',
			path: '/analytics',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`
		},
		{
			name: 'Games & Trivia',
			path: '/games-trivia',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad-2"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="17" x2="17.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>`
		},
		{
			name: 'Settings',
			path: '/settings',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
		},
		{
			name: 'Discord Templates',
			path: '/discord-templates',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
		},
		{
			name: 'Button Actions',
			path: '/button-actions',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-click"><path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/></svg>`
		}
	];
</script>

<aside
	class="relative flex flex-col overflow-hidden border-r-2 border-cyan-500 bg-linear-to-b from-indigo-900 to-slate-900 text-slate-100 shadow-sidebar transition-all duration-300 {collapsed
		? 'w-16'
		: 'w-64'}"
>
	<!-- Right edge subtle glow line -->
	<div
		class="absolute top-0 right-0 bottom-0 w-px bg-cyan-400 opacity-50 shadow-glow-cyan-icon"
	></div>

	<!-- Header -->
	<div
		class="relative z-10 flex h-16 items-center border-b-2 border-purple-500/50 bg-indigo-950/50 shadow-inner transition-all duration-300 {collapsed
			? 'justify-center px-2'
			: 'justify-between px-4'}"
	>
		{#if !collapsed}
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
		{/if}
		<button
			onclick={() => (collapsed = !collapsed)}
			title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
		>
			{#if collapsed}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
				>
			{/if}
		</button>
	</div>

	<!-- Nav -->
	<div class="flex-1 overflow-y-auto py-4">
		<nav class="space-y-0.5 px-3">
			{#each navItems as item (item.path)}
				{@const isActive =
					page.url.pathname === item.path ||
					(item.path !== '/' && page.url.pathname.startsWith(item.path))}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={item.path}
					title={collapsed ? item.name : undefined}
					class="group relative flex items-center overflow-hidden rounded-none py-3 text-sm font-bold transition-all duration-300 {collapsed
						? 'justify-center px-0'
						: 'px-4'} {isActive
						? 'bg-indigo-800/80 text-cyan-300 shadow-inset-accent'
						: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
				>
					{#if isActive}
						<div class="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-transparent"></div>
					{/if}
					<span class="relative z-10 shrink-0">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html item.icon}
					</span>
					{#if !collapsed}
						<span
							class="relative z-10 ml-3 text-ui font-black tracking-widest uppercase drop-shadow-md"
							>{item.name}</span
						>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<!-- Footer -->
	<div
		class="relative z-10 border-t-2 border-purple-500/50 bg-indigo-950/50 p-4 {collapsed
			? 'flex justify-center'
			: ''}"
	>
		{#if !collapsed}
			<p class="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
				Mac Bot Admin Panel v0.0.1
			</p>
		{/if}
		<form method="POST" action="/?/signOut" use:enhance>
			<button
				type="submit"
				title={collapsed ? 'Sign Out' : undefined}
				class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs font-bold tracking-widest text-slate-500 uppercase transition-colors hover:bg-rose-500/10 hover:text-rose-400 {collapsed
					? 'justify-center'
					: 'w-full'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
						points="16 17 21 12 16 7"
					/><line x1="21" x2="9" y1="12" y2="12" /></svg
				>
				{#if !collapsed}Sign Out{/if}
			</button>
		</form>
	</div>
</aside>
