<script lang="ts">
	import MockDiscordLoginButton from '$lib/components/auth/MockDiscordLoginButton.svelte';
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4"
>
	<!-- Abstract decorative background -->
	<div class="absolute inset-0 z-0">
		<div
			class="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-cyan-600/20 blur-orb-md"
		></div>
		<div
			class="absolute right-0 bottom-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-600/20 blur-orb-lg"
		></div>
	</div>

	<div class="relative z-10 w-full max-w-md">
		<div
			class="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-8 shadow-login-card backdrop-blur-xl"
		>
			<div
				class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"
			></div>
			<div class="relative z-10 mb-8 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/10 shadow-glow-cyan-login"
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
						class="lucide lucide-bot text-cyan-400 drop-shadow-glow-cyan-sm"
						><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path
							d="M2 14h2"
						/><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg
					>
				</div>
				<h1
					class="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-3xl font-black tracking-widest text-transparent uppercase drop-shadow-glow-purple-md"
				>
					MAC.ADMIN
				</h1>
				<p class="mt-2 text-xs font-medium tracking-wider text-cyan-500/70 uppercase">
					Sign in to manage the Smart Mac Discord bot.
				</p>
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
