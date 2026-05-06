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
	class="relative flex w-64 flex-col overflow-hidden border-r-2 border-cyan-500 bg-gradient-to-b from-indigo-900 to-slate-900 text-slate-100 shadow-[2px_0_15px_rgba(34,211,238,0.2)] transition-all sm:w-64"
>
	<!-- Right edge subtle glow line -->
	<div
		class="absolute top-0 right-0 bottom-0 w-[1px] bg-cyan-400 opacity-50 shadow-[0_0_8px_rgba(34,211,238,1)]"
	></div>

	<div
		class="relative z-10 flex h-16 items-center border-b-2 border-purple-500/50 bg-indigo-950/50 px-6 shadow-inner"
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
		<nav class="space-y-0.5 px-3">
			{#each navItems as item (item.path)}
				{@const isActive =
					page.url.pathname === item.path ||
					(item.path !== '/' && page.url.pathname.startsWith(item.path))}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={item.path}
					class="group relative flex items-center overflow-hidden rounded-none px-4 py-3 text-sm font-bold transition-all duration-300 {isActive
						? 'bg-indigo-800/80 text-cyan-300 shadow-[inset_4px_0_0_0_rgba(34,211,238,1)]'
						: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
				>
					{#if isActive}
						<div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
					{/if}
					<span
						class="relative z-10 text-[11px] font-black tracking-widest uppercase drop-shadow-md"
						>{item.name}</span
					>
				</a>
			{/each}
		</nav>
	</div>

	<div class="relative z-10 border-t-2 border-purple-500/50 bg-indigo-950/50 p-4">
		<div class="text-xs font-bold tracking-widest text-slate-400 uppercase">
			<p>Mac Bot Admin Panel v0.0.1</p>
			<!-- TODO: Better Auth sign out wiring -->
		</div>
	</div>
</aside>
