<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Topbar from '$lib/components/layout/Topbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if page.url.pathname === '/login'}
	<!-- No sidebar/topbar for login -->
	<div class="min-h-screen bg-slate-950 text-slate-300 antialiased selection:bg-indigo-500/30">
		{@render children()}
	</div>
{:else}
	<!-- Admin Dashboard Layout -->
	<div
		class="flex h-screen bg-slate-950 font-sans text-slate-300 antialiased selection:bg-indigo-500/30"
	>
		<Sidebar />
		<div class="flex flex-1 flex-col overflow-hidden">
			<Topbar />
			<main class="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
