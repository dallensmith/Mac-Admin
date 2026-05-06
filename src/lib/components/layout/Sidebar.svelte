<script lang="ts">
	import { page } from '$app/state';

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
	class="relative flex w-64 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-950 text-slate-300 transition-all sm:w-64"
>
	<!-- Right edge subtle glow line -->
	<div
		class="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
	></div>

	<div
		class="relative z-10 flex h-16 items-center border-b border-slate-800/80 px-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
	>
		<div class="flex items-center gap-3">
			<div
				class="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
			></div>
			<h1
				class="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-black tracking-widest text-transparent uppercase drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]"
			>
				MAC.ADMIN
			</h1>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-4">
		<nav class="space-y-1 px-3">
			{#each navItems as item (item.path)}
				{@const isActive =
					page.url.pathname === item.path ||
					(item.path !== '/' && page.url.pathname.startsWith(item.path))}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={item.path}
					class="group relative flex items-center overflow-hidden rounded-r-full px-4 py-2.5 text-sm font-medium transition-all duration-300 {isActive
						? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]'
						: 'text-slate-400 hover:text-slate-100'}"
				>
					{#if isActive}
						<!-- Active state background and border -->
						<div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
						<div
							class="absolute top-0 bottom-0 left-0 w-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
						></div>
					{/if}
					{#if !isActive}
						<!-- Hover state background -->
						<div
							class="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-slate-800/50 to-transparent transition-transform duration-300 group-hover:translate-x-0"
						></div>
					{/if}
					<span class="relative z-10 text-[11px] font-bold tracking-wider uppercase"
						>{item.name}</span
					>
				</a>
			{/each}
		</nav>
	</div>

	<div class="relative z-10 border-t border-slate-800/80 bg-slate-950/80 p-4 backdrop-blur-sm">
		<div class="text-xs text-slate-500">
			<p>Mac Bot Admin Panel v0.0.1</p>
			<!-- TODO: Better Auth sign out wiring -->
		</div>
	</div>
</aside>
