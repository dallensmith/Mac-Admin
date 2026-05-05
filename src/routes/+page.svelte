<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="p-8">
	<h1 class="text-2xl font-bold">Welcome, {data.user?.name}!</h1>
	<form method="post" action="?/signOut" use:enhance class="mt-4">
		<button type="submit" class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
			Sign out
		</button>
	</form>
</main>
