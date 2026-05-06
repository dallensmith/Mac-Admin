<script lang="ts">
	import { mockUser } from '$lib/mock/admin';
</script>

<header class="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
	<div class="flex flex-1 items-center">
		<!-- Search or breadcrumbs could go here -->
	</div>

	<div class="flex items-center gap-4">
		<!-- Placeholder Notification Bell -->
		<button class="text-slate-400 hover:text-slate-200" aria-label="Notifications">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-bell"
				><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path
					d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
				/></svg
			>
		</button>

		<div class="flex items-center gap-3 border-l border-slate-800 pl-4">
			<div class="flex flex-col items-end">
				<span class="text-sm font-medium text-slate-200">{mockUser.name}</span>
				<span class="text-xs text-slate-500">{mockUser.role}</span>
			</div>
			<img
				src={mockUser.avatar}
				alt="Avatar"
				class="h-8 w-8 rounded-full border border-slate-700 bg-slate-800"
			/>
		</div>
	</div>
</header>
