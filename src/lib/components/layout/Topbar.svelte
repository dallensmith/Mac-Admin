<script lang="ts">
	import { mockUser } from '$lib/mock/admin';
</script>

<header
	class="relative z-20 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md"
>
	<!-- Subtle bottom glow line -->
	<div
		class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
	></div>
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

		<div class="flex items-center gap-3 border-l border-slate-800/60 pl-4">
			<div class="flex flex-col items-end">
				<span class="text-xs font-bold tracking-wider text-slate-200 uppercase drop-shadow-sm"
					>{mockUser.name}</span
				>
				<span class="text-[10px] font-medium tracking-widest text-fuchsia-400 uppercase"
					>{mockUser.role}</span
				>
			</div>
			<div class="relative">
				<div
					class="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 opacity-50 blur-[2px]"
				></div>
				<img
					src={mockUser.avatar}
					alt="Avatar"
					class="relative h-8 w-8 rounded-full border border-slate-950 bg-slate-800"
				/>
			</div>
		</div>
	</div>
</header>
