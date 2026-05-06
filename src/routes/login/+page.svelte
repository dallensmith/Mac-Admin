<script lang="ts">
	import MockDiscordLoginButton from '$lib/components/auth/MockDiscordLoginButton.svelte';
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4"
>
	<!-- Abstract decorative background -->
	<div class="absolute inset-0 z-0">
		<div
			class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]"
		></div>
		<div
			class="absolute right-0 bottom-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-600/10 blur-[120px]"
		></div>
	</div>

	<div class="relative z-10 w-full max-w-md">
		<div
			class="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl"
		>
			<div class="mb-8 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-bot text-indigo-400"
						><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path
							d="M2 14h2"
						/><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg
					>
				</div>
				<h1 class="text-2xl font-bold tracking-tight text-white">Mac Admin</h1>
				<p class="mt-2 text-sm text-slate-400">Sign in to manage the Smart Mac Discord bot.</p>
			</div>

			<div class="space-y-4">
				<MockDiscordLoginButton />
			</div>

			<p class="mt-6 text-center text-xs text-slate-500">Admin access required.</p>

			<!-- TODO: Add Better Auth wiring note -->
			<div
				class="mt-8 rounded border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-200/80"
			>
				<p class="mb-1 font-semibold text-amber-400">Developer Note:</p>
				<p>
					Authentication will be handled by Better Auth (Discord OAuth only). Once wired, this page
					will redirect authenticated admins to the dashboard.
				</p>
			</div>
		</div>
	</div>
</div>
