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
import { logger } from '../../utils/logger';

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
		fields: [text('user_id', true), text('channel_id', true), text('role', true), text('content')]
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

	// ── Embed templates ─────────────────────────────────────────────────
	{
		name: col('embed_templates'),
		fields: [
			text('name', true),
			text('description'),
			text('template_key', true),
			bool('is_active'),
			// Author
			bool('author_enabled'),
			text('author_name'),
			text('author_url'),
			text('author_icon_url'),
			// Content
			bool('title_enabled'),
			text('title_text'),
			bool('description_enabled'),
			longtext('description_text'),
			bool('url_enabled'),
			text('url_text'),
			// Color
			text('color', true),
			// Timestamp
			bool('timestamp_enabled'),
			// Footer
			bool('footer_enabled'),
			text('footer_text'),
			text('footer_icon_url'),
			// Media
			bool('thumbnail_enabled'),
			text('thumbnail_url'),
			bool('image_enabled'),
			text('image_url'),
			// Fields
			longtext('fields_json')
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
	let existingNames: Set<string>;
	try {
		const result = await adminPb.collections.getFullList({ fields: 'id,name' });
		existingNames = new Set(result.map((c: { name: string }) => c.name));
	} catch (err) {
		logger.error(
			`[pb-setup] Failed to list existing collections: ${err instanceof Error ? err.message : String(err)}`
		);
		return;
	}

	for (const def of collections) {
		if (existingNames.has(def.name)) {
			logger.debug(`[pb-setup] Collection "${def.name}" already exists — skipping`);
			continue;
		}

		try {
			await adminPb.collections.create({
				name: def.name,
				type: 'base',
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				fields: def.fields as any[]
			});
			logger.info(`[pb-setup] Created collection "${def.name}" with ${def.fields.length} fields`);
		} catch (err) {
			logger.error(
				`[pb-setup] Failed to create collection "${def.name}": ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}

	logger.info('[pb-setup] Collection check complete');
}

// ── Auth collection ────────────────────────────────────────────────────────

/**
 * Ensures the ma_users auth collection exists with Discord OAuth2 configured.
 * Auth-type collection — must be created separately from the base collections above.
 */
export async function ensureAuthCollection(adminPb: PocketBase): Promise<void> {
	const name = 'ma_users';
	const existing = await adminPb.collections.getFullList({ fields: 'id,name,type' });
	const found = existing.find((c: { name: string; type: string }) => c.name === name);

	if (found) {
		// If it already exists as auth, assume it's correctly configured from a prior run
		if (found.type === 'auth') {
			logger.debug(`[pb-setup] Auth collection "${name}" already exists — skipping`);
			return;
		}
		// Exists as the wrong type — delete and recreate below
		logger.warn(
			`[pb-setup] "${name}" exists as type "${found.type}" instead of "auth" — recreating`
		);
		try {
			await adminPb.collections.delete(found.id);
		} catch (err) {
			logger.error(
				`[pb-setup] Failed to delete misconfigured "${name}": ${err instanceof Error ? err.message : String(err)}`
			);
			return;
		}
	}

	const clientId = env.DISCORD_CLIENT_ID;
	const clientSecret = env.DISCORD_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		logger.error(
			'[pb-setup] DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET must be set to create the ma_users auth collection'
		);
		return;
	}

	try {
		await adminPb.collections.create({
			name,
			type: 'auth',
			createRule: '',
			passwordAuth: {
				enabled: false,
				identityFields: []
			},
			oauth2: {
				enabled: true,
				mappedFields: {
					id: '',
					name: 'name',
					username: 'username',
					avatarURL: 'avatarUrl'
				},
				providers: [
					{
						name: 'discord',
						clientId,
						clientSecret,
						authURL: 'https://discord.com/api/oauth2/authorize',
						tokenURL: 'https://discord.com/api/oauth2/token',
						userApiURL: 'https://discord.com/api/users/@me',
						displayName: 'Discord'
					}
				]
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		logger.info(`[pb-setup] Created auth collection "${name}" with Discord OAuth2`);
	} catch (err) {
		logger.error(
			`[pb-setup] Failed to create auth collection "${name}": ${err instanceof Error ? err.message : String(err)}`
		);
	}
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
	await seedEmbedTemplates(adminPb);

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
		logger.error(
			`[pb-setup] Failed to check "${collectionName}" for existing records: ${err instanceof Error ? err.message : String(err)}`
		);
		return;
	}

	// Create an empty singleton record — the bot will populate values from
	// its own env vars on first boot. All fields are optional.
	try {
		await adminPb.collection(collectionName).create({});
		logger.info(`[pb-setup] Seeded "${collectionName}" with empty singleton record`);
	} catch (err) {
		logger.error(
			`[pb-setup] Failed to seed "${collectionName}": ${err instanceof Error ? err.message : String(err)}`
		);
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
		logger.error(
			`[pb-setup] Failed to check "${collectionName}" for existing records: ${err instanceof Error ? err.message : String(err)}`
		);
		return;
	}

	// Create the "Default" instruction set with empty content fields.
	// Empty fields mean "fall back to file-system defaults" in the bot.
	try {
		await adminPb.collection(collectionName).create({
			name: 'Default',
			description:
				'File-system defaults. Edit fields here to override; empty fields fall back to files.',
			is_active: true,
			is_default: true
		});
		logger.info(`[pb-setup] Seeded "${collectionName}" with "Default" record`);
	} catch (err) {
		logger.error(
			`[pb-setup] Failed to seed "${collectionName}": ${err instanceof Error ? err.message : String(err)}`
		);
	}
}

async function seedEmbedTemplates(adminPb: PocketBase): Promise<void> {
	const collectionName = col('embed_templates');

	// Check if any templates already exist — if so, skip seeding entirely
	try {
		const records = await adminPb.collection(collectionName).getList(1, 1);
		if (records.totalItems > 0) {
			logger.debug(`[pb-setup] "${collectionName}" already has records — skipping seed`);
			return;
		}
	} catch (err) {
		logger.error(
			`[pb-setup] Failed to check "${collectionName}" for existing records: ${err instanceof Error ? err.message : String(err)}`
		);
		return;
	}

	const defaults: Array<{
		name: string;
		template_key: string;
		description: string;
		title_enabled: boolean;
		title_text: string;
		description_enabled: boolean;
		description_text: string;
		thumbnail_enabled: boolean;
		image_enabled: boolean;
		fields_json: string;
	}> = [
		{
			name: 'Movie Lookup',
			template_key: 'movie-lookup',
			description: 'Used when a user searches for a specific movie.',
			title_enabled: true,
			title_text: '{{movie.title}} ({{movie.year}})',
			description_enabled: true,
			description_text: '{{movie.overview}}',
			thumbnail_enabled: true,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Director', value: '{{movie.director}}', inline: true },
				{ name: 'Cast', value: '{{movie.actors}}', inline: true },
				{ name: 'Rating', value: '{{movie.rating}}', inline: true },
				{ name: 'Genres', value: '{{movie.genres}}', inline: true },
				{ name: 'IMDb', value: '{{movie.imdbRating}}/10', inline: true },
				{ name: 'Runtime', value: '{{movie.runtime}} min', inline: true }
			])
		},
		{
			name: 'Experiment Lookup',
			template_key: 'experiment-lookup',
			description: 'Used when a user searches for an experiment.',
			title_enabled: true,
			title_text: 'Experiment #{{experiment.number}}',
			description_enabled: true,
			description_text: '{{experiment.movies}}',
			thumbnail_enabled: true,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Date', value: '{{experiment.date}}', inline: true },
				{ name: 'Host', value: '{{experiment.host}}', inline: true }
			])
		},
		{
			name: 'Review',
			template_key: 'review',
			description: 'Used for formatting movie review displays.',
			title_enabled: true,
			title_text: 'Review: {{review.movieTitle}}',
			description_enabled: true,
			description_text: '{{review.content}}',
			thumbnail_enabled: false,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Author', value: '{{review.author}}', inline: true },
				{ name: 'Rating', value: '{{review.rating}}', inline: true },
				{ name: 'Date', value: '{{review.date}}', inline: true }
			])
		},
		{
			name: 'Quote',
			template_key: 'quote',
			description: 'Used for displaying memorable quotes.',
			title_enabled: true,
			title_text: 'Quote from {{quote.movie}} ({{quote.year}})',
			description_enabled: true,
			description_text: '"{{quote.text}}"',
			thumbnail_enabled: false,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Character', value: '{{quote.character}}', inline: true },
				{ name: 'Actor', value: '{{quote.actor}}', inline: true }
			])
		},
		{
			name: 'No Results',
			template_key: 'no-results',
			description: 'Displayed when a search yields nothing.',
			title_enabled: true,
			title_text: 'No Results Found',
			description_enabled: true,
			description_text: 'No results for "{{query}}" in {{source}}.',
			thumbnail_enabled: false,
			image_enabled: false,
			fields_json: '[]'
		},
		{
			name: 'Error Message',
			template_key: 'error',
			description: 'Generic error format for bot commands.',
			title_enabled: true,
			title_text: 'Error',
			description_enabled: true,
			description_text: '{{error.message}}',
			thumbnail_enabled: false,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Command', value: '{{error.command}}', inline: true }
			])
		},
		{
			name: 'Wheel Spin',
			template_key: 'wheel-spin',
			description: 'Displayed when the wheel picks a movie.',
			title_enabled: true,
			title_text: '🎡 The Wheel Has Spoken!',
			description_enabled: true,
			description_text: '**{{wheel.title}}** ({{wheel.year}})',
			thumbnail_enabled: true,
			image_enabled: false,
			fields_json: JSON.stringify([
				{ name: 'Suggested By', value: '{{wheel.suggestedBy}}', inline: true },
				{ name: 'Added', value: '{{wheel.dateAdded}}', inline: true },
				{ name: 'IMDb', value: '{{wheel.imdbId}}', inline: true }
			])
		},
		{
			name: 'Help',
			template_key: 'help',
			description: 'Bot command list and help.',
			title_enabled: true,
			title_text: '{{bot.name}} Commands',
			description_enabled: true,
			description_text: '{{bot.commands}}',
			thumbnail_enabled: false,
			image_enabled: false,
			fields_json: '[]'
		}
	];

	for (const tmpl of defaults) {
		try {
			await adminPb.collection(collectionName).create({
				name: tmpl.name,
				description: tmpl.description,
				template_key: tmpl.template_key,
				is_active: true,
				author_enabled: false,
				author_name: '',
				author_url: '',
				author_icon_url: '',
				title_enabled: tmpl.title_enabled,
				title_text: tmpl.title_text,
				description_enabled: tmpl.description_enabled,
				description_text: tmpl.description_text,
				url_enabled: false,
				url_text: '',
				color: '#5865F2',
				timestamp_enabled: true,
				footer_enabled: true,
				footer_text: '{{bot.name}} | Requested by {{user}}',
				footer_icon_url: '',
				thumbnail_enabled: tmpl.thumbnail_enabled,
				thumbnail_url: '',
				image_enabled: tmpl.image_enabled,
				image_url: '',
				fields_json: tmpl.fields_json
			});
			logger.info(`[pb-setup] Seeded embed template "${tmpl.name}" (key: ${tmpl.template_key})`);
		} catch (err) {
			logger.error(
				`[pb-setup] Failed to seed embed template "${tmpl.name}": ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}

	logger.info(`[pb-setup] Seeded ${defaults.length} default embed templates`);
}
