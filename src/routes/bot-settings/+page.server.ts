import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const config = await locals.adminPb.collection('sm_bot_config').getFirstListItem('');

	return { config };
};

export const actions: Actions = {
	save: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'Config record ID missing' });

		// Only include a field in the PATCH payload if it was actually submitted with a value.
		// Empty string → omit (preserves existing PocketBase value).
		// This prevents blank inputs from silently wiping configured values.
		const payload: Record<string, string | number> = {};

		const addStr = (key: string) => {
			const v = data.get(key);
			// Include even if empty — an empty string explicitly clears the field in PocketBase.
			if (typeof v === 'string') payload[key] = v;
		};

		const addNum = (key: string) => {
			const v = data.get(key);
			if (typeof v === 'string' && v !== '') {
				const n = Number(v);
				if (!Number.isNaN(n)) payload[key] = n;
			}
		};

		// General
		addStr('bot_name');
		addStr('admin_user_ids');
		addStr('announcement_channel_names');
		addStr('log_level');
		addStr('log_dir');
		addStr('loki_url');
		// AI Models
		addStr('openrouter_base_url');
		addStr('openrouter_model');
		addStr('openrouter_free_model');
		addStr('openrouter_fallback_model');
		addNum('free_model_confidence_threshold');
		// Budget & Rate Limits
		addNum('ai_daily_budget_usd');
		addNum('ai_degraded_threshold');
		addNum('user_cooldown_seconds');
		addNum('user_burst_limit');
		addNum('instruction_refresh_interval_ms');
		// Channel IDs (restart required)
		addStr('reviews_channel_id');
		addStr('quotes_channel_id');
		addStr('reports_channel_id');
		addStr('announcement_channel_id');
		addStr('game_leaderboard_channel_id');
		// Advanced (restart required)
		addStr('daily_event_check_cron');
		addStr('wheel_collection_name');
		addNum('session_inactivity_ms');
		addNum('cache_ttl_seconds');
		addNum('search_cache_ttl_seconds');

		if (Object.keys(payload).length === 0) {
			return fail(422, { error: 'No changes to save.' });
		}

		try {
			await locals.adminPb.collection('sm_bot_config').update(id, payload);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.error('[bot-settings] save failed:', message);
			return fail(500, { error: 'Failed to save settings. Please try again.' });
		}

		return { success: true };
	},

	testConnection: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		const start = Date.now();
		try {
			await locals.adminPb.health.check();
			return { testOk: true, testLatencyMs: Date.now() - start };
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Connection failed';
			console.error('[bot-settings] testConnection failed:', message);
			return fail(500, { testError: message });
		}
	}
};
