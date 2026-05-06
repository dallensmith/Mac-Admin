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
	<div
		class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-300 antialiased selection:bg-indigo-500/30"
	>
		<!-- Background layers -->
		<div
			class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950"
		></div>
		<div
			class="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"
		></div>
		<div class="relative z-10">
			{@render children()}
		</div>
	</div>
{:else}
	<!-- Admin Dashboard Layout -->
	<div
		class="relative flex h-screen overflow-hidden bg-slate-950 text-slate-300 antialiased selection:bg-indigo-500/30"
	>
		<!-- Background layers -->
		<div
			class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950"
		></div>
		<div
			class="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#47556915_1px,transparent_1px),linear-gradient(to_bottom,#47556915_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]"
		></div>

		<div class="relative z-10 flex h-full w-full">
			<Sidebar />
			<div class="flex flex-1 flex-col overflow-hidden">
				<Topbar />
				<main class="flex-1 overflow-y-auto p-6 lg:p-8">
					{@render children()}
				</main>
			</div>
		</div>
	</div>
{/if}
