/**
 * PocketBase Collection Setup & Seeding
 *
 * Ensures all required PocketBase collections exist (idempotent creation)
 * and seeds default data for bot_config + instruction_sets on first run.
 *
 * Called once on the first HTTP request via hooks.server.ts.
 */
import { env } from '$env/dynamic/private';
import PocketBase from 'pocketbase';
import { logger } from '$utils/logger';

// ── Prefix helpers ──────────────────────────────────────────────────────────

function getPrefix(): string {
	return env.POCKETBASE_COLLECTION_PREFIX || 'sm_';
}

function getWheelName(): string {
	return env.POCKETBASE_WHEEL_COLLECTION || 'thewheel';
}

function col(name: string): string {
	// The wheel collection is special — no prefix
	if (name === 'wheel') return getWheelName();
	return `${getPrefix()}${name}`;
}

// ── Field type helpers ──────────────────────────────────────────────────────

interface PbField {
	name: string;
	type: 'text' | 'number' | 'bool';
	required?: boolean;
	max?: number;
}

const text = (name: string, required = false): PbField => ({
	name,
	type: 'text',
	required
});

const longtext = (name: string, required = false): PbField => ({
	name,
	type: 'text',
	required,
	max: 200000
});

const num = (name: string, required = false): PbField => ({
	name,
	type: 'number',
	required
});

const bool = (name: string, required = false): PbField => ({
	name,
	type: 'bool',
	required
});

// ── Collection definitions ──────────────────────────────────────────────────

interface CollectionDef {
	name: string;
	fields: PbField[];
}

const collections: CollectionDef[] = [
	// ── Wheel ──────────────────────────────────────────────────────────────
	{
		name: col('wheel'),
		fields: [
			text('title', true),
			text('year', true),
			text('tmdbId'),
			text('imdbId', true),
			text('suggestedBy', true),
			text('voters'),
			text('dateAdded')
		]
	},

	// ── Conversation ───────────────────────────────────────────────────────
	{
		name: col('messages'),
		fields: [
			text('user_id', true),
			text('channel_id', true),
			text('role', true),
			text('content')
		]
	},
	{
		name: col('sessions'),
		fields: [
			text('user_id', true),
			text('channel_id', true),
			bool('is_terminated'),
			text('last_active', true)
		]
	},
	{
		name: col('usage_logs'),
		fields: [text('user_id', true), text('model', true), num('tokens'), num('cost_usd')]
	},
	{
		name: col('global_usage'),
		fields: [text('date', true), num('total_cost')]
	},

	// ── Search caches ─────────────────────────────────────────────────────
	{
		name: col('movies_search_cache'),
		fields: [
			text('slug', true),
			text('title', true),
			text('year'),
			text('tmdb_id'),
			text('director'),
			text('actors'),
			text('genres'),
			text('synced_at')
		]
	},
	{
		name: col('experiments_search_cache'),
		fields: [text('slug', true), text('name', true), text('date'), text('synced_at')]
	},
	{
		name: col('people_search_cache'),
		fields: [text('name', true), text('role', true), text('synced_at')]
	},

	// ── Bot reports ───────────────────────────────────────────────────────
	{
		name: col('bot_reports'),
		fields: [
			text('reported_message_id', true),
			text('reporter_user_id', true),
			text('reporter_display_name', true),
			text('channel_id', true),
			text('guild_id', true),
			text('category', true),
			text('notes'),
			text('bot_response_content'),
			text('conversation_context'),
			num('created_at', true)
		]
	},

	// ── Announced events ──────────────────────────────────────────────────
	{
		name: col('announced_events'),
		fields: [text('event_id', true), text('event_name', true), text('announced_at', true)]
	},

	// ── Games ──────────────────────────────────────────────────────────────
	{
		name: col('game_sessions'),
		fields: [
			text('channel_id', true),
			text('game_type', true),
			text('state', true),
			text('data', true),
			text('started_by', true),
			num('started_at', true),
			num('ended_at')
		]
	},
	{
		name: col('game_leaderboard'),
		fields: [
			text('user_id', true),
			text('username', true),
			num('points'),
			num('wins'),
			num('games_played'),
			num('updated_at', true)
		]
	},

	// ── Monitor state ─────────────────────────────────────────────────────
	{
		name: col('monitor_state'),
		fields: [text('key', true), text('value', true)]
	},

	// ── Wheel audit logs ──────────────────────────────────────────────────
	{
		name: col('wheel_logs'),
		fields: [
			text('timestamp', true),
			text('action', true),
			text('candidate_title'),
			text('candidate_year'),
			text('user_id'),
			text('username'),
			text('details'),
			bool('success')
		]
	},
	{
		name: col('wheel_backups'),
		fields: [
			text('timestamp', true),
			text('backup_type'),
			num('candidate_count'),
			text('data'),
			text('triggered_by')
		]
	},
	{
		name: col('wheel_cleanup_runs'),
		fields: [text('timestamp', true), text('run_type'), num('checked')]
	},
	{
		name: col('wheel_cleanup_deletions'),
		fields: [
			text('run_id', true),
			text('title'),
			text('year'),
			num('votes'),
			text('voters'),
			text('tmdb_id'),
			text('imdb_id'),
			text('added_by'),
			text('date_added'),
			text('matched_experiments'),
			text('matched_title'),
			bool('restored')
		]
	},

	// ── Instruction sets ──────────────────────────────────────────────────
	{
		name: col('instruction_sets'),
		fields: [
			text('name', true),
			text('description'),
			bool('is_active'),
			bool('is_default'),
			longtext('system'),
			longtext('behavior'),
			longtext('resources'),
			longtext('conversation_rules'),
			longtext('response_templates'),
			longtext('trigger_phrases'),
			longtext('custom_rules'),
			longtext('output_discipline'),
			longtext('addendum')
		]
	},

	// ── Bot config (singleton) ────────────────────────────────────────────
	{
		name: col('bot_config'),
		fields: [
			// Discord
			text('bot_name'),
			text('admin_user_ids'),
			text('announcement_channel_names'),
			// AI
			text('openrouter_base_url'),
			text('openrouter_model'),
			text('openrouter_free_model'),
			num('free_model_confidence_threshold'),
			text('openrouter_fallback_model'),
			num('ai_daily_budget_usd'),
			num('ai_degraded_threshold'),
			// Channel IDs
			text('reviews_channel_id'),
			text('quotes_channel_id'),
			text('reports_channel_id'),
			text('announcement_channel_id'),
			text('game_leaderboard_channel_id'),
			text('daily_event_check_cron'),
			// Wheel
			text('wheel_collection_name'),
			// Limits
			num('user_cooldown_seconds'),
			num('user_burst_limit'),
			num('session_inactivity_ms'),
			num('cache_ttl_seconds'),
			num('search_cache_ttl_seconds'),
			num('instruction_refresh_interval_ms'),
			// Logging
			text('log_level'),
			text('log_dir'),
			text('loki_url')
		]
	}
];

// ── ensureAllCollections ────────────────────────────────────────────────────

/**
 * Ensures all required PocketBase collections exist.
 * Creates missing collections idempotently — safe to call on every deploy.
 */
export async function ensureAllCollections(adminPb: PocketBase): Promise<void> {
	logger.info('[pb-setup] Ensuring PocketBase collections exist...');

	// Fetch existing collections once
	let existing: { id: string; name: string }[] = [];
	try {
		const result = await adminPb.collections.getFullList({ fields: 'id,name' });
		existing = result.map((c) => ({ id: c.id, name: c.name }));
	} catch (err) {
		logger.error('[pb-setup] Failed to list existing collections');
		logger.error(err);
		return;
	}

	const existingNames = new Set(existing.map((c) => c.name));

	for (const def of collections) {
		if (existingNames.has(def.name)) {
			logger.debug(`[pb-setup] Collection "${def.name}" already exists — skipping`);
			continue;
		}

		try {
			await adminPb.collections.create({
				name: def.name,
				type: 'base',
				fields: def.fields as Record<string, unknown>[]
			});
			logger.info(`[pb-setup] Created collection "${def.name}" with ${def.fields.length} fields`);
		} catch (err) {
			logger.error(`[pb-setup] Failed to create collection "${def.name}"`);
			logger.error(err);
		}
	}

	logger.info('[pb-setup] Collection check complete');
}

// ── seedDefaultData ─────────────────────────────────────────────────────────

/**
 * Seeds default data for collections that need at least one record to function.
 * Only creates records if the collection is empty — idempotent.
 */
export async function seedDefaultData(adminPb: PocketBase): Promise<void> {
	logger.info('[pb-setup] Checking seed data...');

	await seedBotConfig(adminPb);
	await seedInstructionSets(adminPb);

	logger.info('[pb-setup] Seed check complete');
}

async function seedBotConfig(adminPb: PocketBase): Promise<void> {
	const collectionName = col('bot_config');

	try {
		const records = await adminPb.collection(collectionName).getList(1, 1);
		if (records.totalItems > 0) {
			logger.debug(`[pb-setup] "${collectionName}" already has records — skipping seed`);
			return;
		}
	} catch (err) {
		logger.error(`[pb-setup] Failed to check "${collectionName}" for existing records`);
		logger.error(err);
		return;
	}

	// Create an empty singleton record — the bot will populate values from
	// its own env vars on first boot. All fields are optional.
	try {
		await adminPb.collection(collectionName).create({});
		logger.info(`[pb-setup] Seeded "${collectionName}" with empty singleton record`);
	} catch (err) {
		logger.error(`[pb-setup] Failed to seed "${collectionName}"`);
		logger.error(err);
	}
}

async function seedInstructionSets(adminPb: PocketBase): Promise<void> {
	const collectionName = col('instruction_sets');

	try {
		const records = await adminPb.collection(collectionName).getList(1, 1, {
			filter: 'name = "Default"'
		});
		if (records.totalItems > 0) {
			logger.debug(`[pb-setup] "${collectionName}" already has a "Default" record — skipping seed`);
			return;
		}
	} catch (err) {
		logger.error(`[pb-setup] Failed to check "${collectionName}" for existing records`);
		logger.error(err);
		return;
	}

	// Create the "Default" instruction set with empty content fields.
	// Empty fields mean "fall back to file-system defaults" in the bot.
	try {
		await adminPb.collection(collectionName).create({
			name: 'Default',
			description: 'File-system defaults. Edit fields here to override; empty fields fall back to files.',
			is_active: true,
			is_default: true
		});
		logger.info(`[pb-setup] Seeded "${collectionName}" with "Default" record`);
	} catch (err) {
		logger.error(`[pb-setup] Failed to seed "${collectionName}"`);
		logger.error(err);
	}
}
