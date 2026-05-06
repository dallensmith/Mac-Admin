<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Bot Settings', path: '/bot-settings' },
		{ name: 'Instructions', path: '/instructions' },
		{ name: 'Wheel Manager', path: '/wheel' },
		{ name: 'Movies', path: '/movies' },
		{ name: 'Experiments', path: '/experiments' },
		{ name: 'Reviews', path: '/reviews' },
		{ name: 'Users', path: '/users' },
		{ name: 'Logs', path: '/logs' },
		{ name: 'Analytics', path: '/analytics' },
		{ name: 'Settings', path: '/settings' }
	];
</script>

<aside
	class="flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-all sm:w-64"
>
	<div class="flex h-16 items-center border-b border-slate-800 px-6">
		<h1 class="text-xl font-bold text-indigo-400">Mac Admin</h1>
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
					class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive
						? 'bg-indigo-600/10 text-indigo-400'
						: 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}"
				>
					{item.name}
				</a>
			{/each}
		</nav>
	</div>

	<div class="border-t border-slate-800 p-4">
		<div class="text-xs text-slate-500">
			<p>Mac Bot Admin Panel v0.0.1</p>
			<!-- TODO: Better Auth sign out wiring -->
		</div>
	</div>
</aside>
