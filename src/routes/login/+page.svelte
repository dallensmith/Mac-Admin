<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let mode = $state<'signin' | 'register'>('signin');
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-sm space-y-6 p-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold">
				{mode === 'signin' ? 'Welcome Back' : 'Create Account'}
			</h1>
			<p class="text-sm text-gray-500 mt-1">
				{mode === 'signin' ? 'Sign in to access your account' : 'Register a new account'}
			</p>
		</div>

		{#if form?.message}
			<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
				{form.message}
			</p>
		{/if}

		<form
			method="post"
			action={mode === 'signin' ? '?/signIn' : '?/register'}
			use:enhance
			class="space-y-4"
		>
			{#if mode === 'register'}
				<div>
					<label for="name" class="block text-sm font-medium">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
				</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium">Email Address</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="Enter your email address"
					class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					placeholder="Enter your password"
					class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
			>
				{mode === 'signin' ? 'Sign In' : 'Create Account'}
			</button>
		</form>

		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t"></span>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-white px-2 text-gray-400">or continue with</span>
			</div>
		</div>

		<button
			onclick={() => authClient.signIn.social({ provider: 'discord', callbackURL: '/' })}
			class="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
			</svg>
			Continue with Discord
		</button>

		<p class="text-center text-sm text-gray-500">
			{#if mode === 'signin'}
				Don't have an account?
				<button
					onclick={() => (mode = 'register')}
					class="font-medium text-purple-600 hover:underline"
				>
					Create one here
				</button>
			{:else}
				Already have an account?
				<button
					onclick={() => (mode = 'signin')}
					class="font-medium text-purple-600 hover:underline"
				>
					Sign in
				</button>
			{/if}
		</p>

		<p class="text-center text-sm">
			<a href="/" class="text-gray-400 hover:text-gray-600">&larr; Back to home</a>
		</p>
	</div>
</div>
