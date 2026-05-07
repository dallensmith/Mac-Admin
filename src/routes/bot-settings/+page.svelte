<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	let { data, form }: { data: import('./$types').PageData; form: import('./$types').ActionData } =
		$props();

	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	// Reactive mirror of config — used for dirty tracking and two-way binding
	let values = $state({ ...data.config });

	const TRACKED = [
		'bot_name', 'admin_user_ids', 'announcement_channel_names', 'log_level', 'log_dir', 'loki_url',
		'openrouter_base_url', 'openrouter_model', 'openrouter_free_model', 'openrouter_fallback_model',
		'free_model_confidence_threshold', 'ai_daily_budget_usd', 'ai_degraded_threshold',
		'user_cooldown_seconds', 'user_burst_limit', 'instruction_refresh_interval_ms',
		'reviews_channel_id', 'quotes_channel_id', 'reports_channel_id', 'announcement_channel_id',
		'game_leaderboard_channel_id', 'daily_event_check_cron', 'wheel_collection_name',
		'session_inactivity_ms', 'cache_ttl_seconds', 'search_cache_ttl_seconds'
	] as const;

	let isDirty = $derived(
		TRACKED.some(
			(k) =>
				(values as Record<string, unknown>)[k] !== (data.config as Record<string, unknown>)[k]
		)
	);

	function reset() {
		values = { ...data.config };
		errors = {};
	}

	function validate(): Record<string, string> {
		const errs: Record<string, string> = {};

		// URL fields
		for (const key of ['openrouter_base_url', 'loki_url'] as const) {
			const v = String(values[key] ?? '').trim();
			if (v) {
				try {
					new URL(v);
				} catch {
					errs[key] = 'Must be a valid URL (e.g. https://…)';
				}
			}
		}

		// Confidence threshold: 0–1
		const conf = values.free_model_confidence_threshold as number | null;
		if (conf !== null && conf !== undefined && (conf < 0 || conf > 1)) {
			errs['free_model_confidence_threshold'] = 'Must be between 0 and 1';
		}

		// Degraded threshold: 0–100
		const deg = values.ai_degraded_threshold as number | null;
		if (deg !== null && deg !== undefined && (deg < 0 || deg > 100)) {
			errs['ai_degraded_threshold'] = 'Must be between 0 and 100';
		}

		// Non-negative number fields
		for (const key of [
			'ai_daily_budget_usd',
			'user_cooldown_seconds',
			'user_burst_limit',
			'instruction_refresh_interval_ms',
			'session_inactivity_ms',
			'cache_ttl_seconds',
			'search_cache_ttl_seconds'
		] as const) {
			const v = values[key] as number | null;
			if (v !== null && v !== undefined && v < 0) errs[key] = 'Must be 0 or greater';
		}

		// Cron expression: 5 or 6 whitespace-separated tokens
		const cron = String(values.daily_event_check_cron ?? '').trim();
		if (cron) {
			const parts = cron.split(/\s+/);
			if (parts.length < 5 || parts.length > 6) {
				errs['daily_event_check_cron'] = 'Must be a valid cron expression (e.g. 0 8 * * *)';
			}
		}

		return errs;
	}
</script>

{#snippet restartBadge()}
	<span
		class="ml-2 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-label-xs text-amber-400"
		>⚠ restart required</span
	>
{/snippet}

<PageHeader
	title="Bot Settings"
	description="Configure the core behavior and properties of Mac Bot."
/>

{#if form?.error}
	<div class="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
		{form.error}
	</div>
{/if}

{#if form?.success}
	<div class="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
		Settings saved successfully.
	</div>
{/if}

<form
	method="POST"
	action="?/save"
	use:enhance={({ cancel }) => {
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			errors = errs;
			cancel();
			return;
		}
		errors = {};
		saving = true;
		return async ({ update }) => {
			await update();
			saving = false;
			values = { ...data.config };
		};
	}}
>
	<input type="hidden" name="id" value={data.config.id} />

	<div class="space-y-6">
		<!-- ── General Configuration ─────────────────────────── -->
		<SectionCard title="General Configuration">
			<div class="grid gap-6 sm:grid-cols-2">
				<div>
					<label for="bot_name" class="label-caps">Bot Name</label>
					<input
						type="text"
						id="bot_name"
						name="bot_name"
						bind:value={values.bot_name}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="log_level" class="label-caps">Log Level</label>
					<select id="log_level" name="log_level" bind:value={values.log_level} class="input-dark">
						{#each ['debug', 'info', 'warn', 'error'] as level (level)}
							<option value={level}>{level}</option>
						{/each}
					</select>
				</div>
				<div class="sm:col-span-2">
					<label for="admin_user_ids" class="label-caps">Admin User IDs</label>
					<input
						type="text"
						id="admin_user_ids"
						name="admin_user_ids"
						bind:value={values.admin_user_ids}
						placeholder="Comma-separated Discord snowflake IDs"
						class="input-dark"
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="announcement_channel_names" class="label-caps"
						>Announcement Channel Names</label
					>
					<input
						type="text"
						id="announcement_channel_names"
						name="announcement_channel_names"
						bind:value={values.announcement_channel_names}
						placeholder="Comma-separated channel names"
						class="input-dark"
					/>
				</div>
				<div>
					<label for="log_dir" class="label-caps">Log Directory</label>
					<input
						type="text"
						id="log_dir"
						name="log_dir"
						bind:value={values.log_dir}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="loki_url" class="label-caps">Loki URL</label>
					<input
						type="text"
						id="loki_url"
						name="loki_url"
						bind:value={values.loki_url}
						aria-invalid={!!errors.loki_url}
						class="input-dark {errors.loki_url ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.loki_url}<p class="mt-1 text-xs text-rose-400">{errors.loki_url}</p>{/if}
				</div>
			</div>
		</SectionCard>

		<!-- ── AI Models ──────────────────────────────────────── -->
		<SectionCard title="AI Model Settings">
			<div class="grid gap-6 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label for="openrouter_base_url" class="label-caps">OpenRouter Base URL</label>
					<input
						type="text"
						id="openrouter_base_url"
						name="openrouter_base_url"
						bind:value={values.openrouter_base_url}
						aria-invalid={!!errors.openrouter_base_url}
						class="input-dark {errors.openrouter_base_url ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.openrouter_base_url}<p class="mt-1 text-xs text-rose-400">{errors.openrouter_base_url}</p>{/if}
				</div>
				<div>
					<label for="openrouter_model" class="label-caps">Primary Model</label>
					<input
						type="text"
						id="openrouter_model"
						name="openrouter_model"
						bind:value={values.openrouter_model}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="openrouter_free_model" class="label-caps">Free Model</label>
					<input
						type="text"
						id="openrouter_free_model"
						name="openrouter_free_model"
						bind:value={values.openrouter_free_model}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="openrouter_fallback_model" class="label-caps">Fallback Model</label>
					<input
						type="text"
						id="openrouter_fallback_model"
						name="openrouter_fallback_model"
						bind:value={values.openrouter_fallback_model}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="free_model_confidence_threshold" class="label-caps"
						>Free Model Confidence Threshold</label
					>
					<input
						type="number"
						id="free_model_confidence_threshold"
						name="free_model_confidence_threshold"
						bind:value={values.free_model_confidence_threshold}
						step="0.01"
						min="0"
						max="1"
						aria-invalid={!!errors.free_model_confidence_threshold}
						class="input-dark {errors.free_model_confidence_threshold ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.free_model_confidence_threshold}<p class="mt-1 text-xs text-rose-400">{errors.free_model_confidence_threshold}</p>{/if}
				</div>
			</div>
		</SectionCard>

		<!-- ── Budget & Rate Limits ───────────────────────────── -->
		<SectionCard title="Budget & Rate Limits">
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<label for="ai_daily_budget_usd" class="label-caps">Daily Budget (USD)</label>
					<input
						type="number"
						id="ai_daily_budget_usd"
						name="ai_daily_budget_usd"
						bind:value={values.ai_daily_budget_usd}
						step="0.01"
						min="0"
						aria-invalid={!!errors.ai_daily_budget_usd}
						class="input-dark {errors.ai_daily_budget_usd ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.ai_daily_budget_usd}<p class="mt-1 text-xs text-rose-400">{errors.ai_daily_budget_usd}</p>{/if}
				</div>
				<div>
					<label for="ai_degraded_threshold" class="label-caps"
						>Degraded Mode Threshold (%)</label
					>
					<input
						type="number"
						id="ai_degraded_threshold"
						name="ai_degraded_threshold"
						bind:value={values.ai_degraded_threshold}
						min="0"
						max="100"
						aria-invalid={!!errors.ai_degraded_threshold}
						class="input-dark {errors.ai_degraded_threshold ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.ai_degraded_threshold}<p class="mt-1 text-xs text-rose-400">{errors.ai_degraded_threshold}</p>{/if}
				</div>
				<div>
					<label for="user_cooldown_seconds" class="label-caps">User Cooldown (s)</label>
					<input
						type="number"
						id="user_cooldown_seconds"
						name="user_cooldown_seconds"
						bind:value={values.user_cooldown_seconds}
						min="0"
						aria-invalid={!!errors.user_cooldown_seconds}
						class="input-dark {errors.user_cooldown_seconds ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.user_cooldown_seconds}<p class="mt-1 text-xs text-rose-400">{errors.user_cooldown_seconds}</p>{/if}
				</div>
				<div>
					<label for="user_burst_limit" class="label-caps">User Burst Limit</label>
					<input
						type="number"
						id="user_burst_limit"
						name="user_burst_limit"
						bind:value={values.user_burst_limit}
						min="0"
						aria-invalid={!!errors.user_burst_limit}
						class="input-dark {errors.user_burst_limit ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.user_burst_limit}<p class="mt-1 text-xs text-rose-400">{errors.user_burst_limit}</p>{/if}
				</div>
				<div>
					<label for="instruction_refresh_interval_ms" class="label-caps"
						>Instruction Refresh Interval (ms)</label
					>
					<input
						type="number"
						id="instruction_refresh_interval_ms"
						name="instruction_refresh_interval_ms"
						bind:value={values.instruction_refresh_interval_ms}
						min="0"
						aria-invalid={!!errors.instruction_refresh_interval_ms}
						class="input-dark {errors.instruction_refresh_interval_ms ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.instruction_refresh_interval_ms}<p class="mt-1 text-xs text-rose-400">{errors.instruction_refresh_interval_ms}</p>{/if}
				</div>
			</div>
		</SectionCard>

		<!-- ── Channel IDs ───────────────────────────────────── -->
		<SectionCard title="Channel IDs">
			<div class="grid gap-6 sm:grid-cols-2">
				<div>
					<label for="reviews_channel_id" class="label-caps">Reviews Channel ID</label>
					<input
						type="text"
						id="reviews_channel_id"
						name="reviews_channel_id"
						bind:value={values.reviews_channel_id}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="quotes_channel_id" class="label-caps">Quotes Channel ID</label>
					<input
						type="text"
						id="quotes_channel_id"
						name="quotes_channel_id"
						bind:value={values.quotes_channel_id}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="reports_channel_id" class="label-caps">Reports Channel ID</label>
					<input
						type="text"
						id="reports_channel_id"
						name="reports_channel_id"
						bind:value={values.reports_channel_id}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="announcement_channel_id" class="label-caps">Announcement Channel ID</label>
					<input
						type="text"
						id="announcement_channel_id"
						name="announcement_channel_id"
						bind:value={values.announcement_channel_id}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="game_leaderboard_channel_id" class="label-caps">Game Leaderboard Channel ID</label>
					<input
						type="text"
						id="game_leaderboard_channel_id"
						name="game_leaderboard_channel_id"
						bind:value={values.game_leaderboard_channel_id}
						class="input-dark"
					/>
				</div>
			</div>
		</SectionCard>

		<!-- ── Advanced ─────────────────────────────────────── -->
		<SectionCard title="Advanced">
			<p class="mb-4 text-sm text-slate-400">
				Fields marked ⚠ require a bot restart to take effect.
			</p>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<label for="daily_event_check_cron" class="label-caps">Daily Event Check Cron</label>
					<input
						type="text"
						id="daily_event_check_cron"
						name="daily_event_check_cron"
						bind:value={values.daily_event_check_cron}
						placeholder="0 8 * * *"
						aria-invalid={!!errors.daily_event_check_cron}
						class="input-dark {errors.daily_event_check_cron ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.daily_event_check_cron}<p class="mt-1 text-xs text-rose-400">{errors.daily_event_check_cron}</p>{/if}
				</div>
				<div>
					<label for="wheel_collection_name" class="label-caps">
						Wheel Collection Name {@render restartBadge()}
					</label>
					<input
						type="text"
						id="wheel_collection_name"
						name="wheel_collection_name"
						bind:value={values.wheel_collection_name}
						class="input-dark"
					/>
				</div>
				<div>
					<label for="session_inactivity_ms" class="label-caps">
						Session Inactivity (ms) {@render restartBadge()}
					</label>
					<input
						type="number"
						id="session_inactivity_ms"
						name="session_inactivity_ms"
						bind:value={values.session_inactivity_ms}
						min="0"
						aria-invalid={!!errors.session_inactivity_ms}
						class="input-dark {errors.session_inactivity_ms ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.session_inactivity_ms}<p class="mt-1 text-xs text-rose-400">{errors.session_inactivity_ms}</p>{/if}
				</div>
				<div>
					<label for="cache_ttl_seconds" class="label-caps">
						Cache TTL (s) {@render restartBadge()}
					</label>
					<input
						type="number"
						id="cache_ttl_seconds"
						name="cache_ttl_seconds"
						bind:value={values.cache_ttl_seconds}
						min="0"
						aria-invalid={!!errors.cache_ttl_seconds}
						class="input-dark {errors.cache_ttl_seconds ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.cache_ttl_seconds}<p class="mt-1 text-xs text-rose-400">{errors.cache_ttl_seconds}</p>{/if}
				</div>
				<div>
					<label for="search_cache_ttl_seconds" class="label-caps">
						Search Cache TTL (s) {@render restartBadge()}
					</label>
					<input
						type="number"
						id="search_cache_ttl_seconds"
						name="search_cache_ttl_seconds"
						bind:value={values.search_cache_ttl_seconds}
						min="0"
						aria-invalid={!!errors.search_cache_ttl_seconds}
						class="input-dark {errors.search_cache_ttl_seconds ? 'ring-1 ring-rose-500/50 border-rose-500/60' : ''}"
					/>
					{#if errors.search_cache_ttl_seconds}<p class="mt-1 text-xs text-rose-400">{errors.search_cache_ttl_seconds}</p>{/if}
				</div>
			</div>
		</SectionCard>

		<div class="flex justify-end gap-3">
			<button type="button" class="btn-ghost" disabled={!isDirty} onclick={reset}>Cancel</button>
			<button type="submit" class="btn-cyan" disabled={!isDirty || saving}>
				{saving ? 'Saving…' : 'Save Changes'}
			</button>
		</div>
	</div>
</form>
