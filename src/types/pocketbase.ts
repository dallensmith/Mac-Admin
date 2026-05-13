/**
 * PocketBase type definitions — all collections.
 * PocketBase is the sole persistence layer for bot data.
 * The main BM archive data lives in Postgres (see schema.ts + badmovies-db.ts).
 */

// ─── API response shapes ──────────────────────────────────────────────────────

/** Response from GET /api/collections/{collection}/records */
export interface PocketBaseListResponse<T> {
	items: T[];
	page: number;
	perPage: number;
	totalItems: number;
	totalPages: number;
}

// ─── Wheel candidates ─────────────────────────────────────────────────────────

/** A single record from the PocketBase wheel_candidates collection. */
export interface PocketBaseWheelRecord {
	id: string;
	title: string;
	year: string;
	tmdbId: string;
	imdbId: string;
	suggestedBy: string;
	voters: string;
	dateAdded: string;
	created: string;
	updated: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface PBMessageRecord {
	id: string;
	user_id: string;
	channel_id: string;
	role: string;
	content: string;
	created: string;
	updated: string;
}

export interface PBSessionRecord {
	id: string;
	user_id: string;
	channel_id: string;
	is_terminated: boolean;
	last_active: string;
	conversation_id: string;
	created: string;
	updated: string;
}

export interface PBUsageLogRecord {
	id: string;
	user_id: string;
	model: string;
	tokens: number;
	cost_usd: number;
	created: string;
	updated: string;
}

export interface PBGlobalUsageRecord {
	id: string;
	date: string;
	total_cost: number;
	created: string;
	updated: string;
}

// ─── Search cache ─────────────────────────────────────────────────────────────

export interface PBMovieCacheRecord {
	id: string;
	slug: string;
	title: string;
	year: string;
	tmdb_id: string;
	director: string;
	actors: string;
	genres: string;
	synced_at: string;
	created: string;
	updated: string;
}

export interface PBExperimentCacheRecord {
	id: string;
	slug: string;
	name: string;
	date: string;
	synced_at: string;
	created: string;
	updated: string;
}

export interface PBPersonCacheRecord {
	id: string;
	name: string;
	role: string;
	synced_at: string;
	created: string;
	updated: string;
}

// ─── Bot reports ─────────────────────────────────────────────────────────────

export interface PBBotReportRecord {
	id: string;
	reported_message_id: string;
	reporter_user_id: string;
	reporter_display_name: string;
	channel_id: string;
	guild_id: string;
	category: string;
	notes: string;
	bot_response_content: string;
	conversation_context: string;
	created_at: number;
	created: string;
	updated: string;
}

// ─── Announced events ─────────────────────────────────────────────────────────

export interface PBAnnouncedEventRecord {
	id: string;
	event_id: string;
	event_name: string;
	announced_at: string;
	created: string;
	updated: string;
}

// ─── Game sessions ────────────────────────────────────────────────────────────

export interface PBGameSessionRecord {
	id: string;
	channel_id: string;
	game_type: string;
	state: string;
	data: string;
	started_by: string;
	started_at: number;
	ended_at: number;
	created: string;
	updated: string;
}

export interface PBLeaderboardRecord {
	id: string;
	user_id: string;
	username: string;
	points: number;
	wins: number;
	games_played: number;
	updated_at: number;
	created: string;
	updated: string;
}

// ─── Monitor state ────────────────────────────────────────────────────────────

export interface PBMonitorStateRecord {
	id: string;
	key: string;
	value: string;
	created: string;
	updated: string;
}

// ─── Wheel audit logs ─────────────────────────────────────────────────────────

export interface PBWheelLogRecord {
	id: string;
	timestamp: string;
	action: string;
	candidate_title: string;
	candidate_year: string;
	user_id: string;
	username: string;
	details: string;
	success: boolean;
	created: string;
	updated: string;
}

export interface PBWheelBackupRecord {
	id: string;
	timestamp: string;
	backup_type: string;
	candidate_count: number;
	data: string;
	triggered_by: string;
	created: string;
	updated: string;
}

// ─── Bot config ──────────────────────────────────────────────────────────────

/** Singleton record in the `{prefix}_bot_config` collection. All operational settings live here. */
export interface PBBotConfigRecord {
	id: string;
	// Discord
	bot_name: string;
	admin_user_ids: string; // comma-separated Discord snowflakes
	announcement_channel_names: string; // comma-separated channel names
	// AI
	openrouter_base_url: string;
	openrouter_model: string;
	openrouter_free_model: string;
	free_model_confidence_threshold: number;
	openrouter_fallback_model: string;
	ai_daily_budget_usd: number;
	ai_degraded_threshold: number;
	// Channel IDs (restart-required)
	reviews_channel_id: string;
	quotes_channel_id: string;
	reports_channel_id: string;
	announcement_channel_id: string;
	game_leaderboard_channel_id: string;
	daily_event_check_cron: string;
	// Wheel
	wheel_collection_name: string;
	// Limits
	user_cooldown_seconds: number;
	user_burst_limit: number;
	session_inactivity_ms: number;
	cache_ttl_seconds: number;
	search_cache_ttl_seconds: number;
	instruction_refresh_interval_ms: number;
	// Logging
	log_level: string;
	log_dir: string;
	loki_url: string;
	created: string;
	updated: string;
}

// ─── Instruction sets ─────────────────────────────────────────────────────────

/** A single named instruction set stored in PocketBase. Per-field overrides the file-system defaults. */
export interface PBInstructionSetRecord {
	id: string;
	name: string;
	description: string;
	is_active: boolean;
	is_default: boolean;
	/** Overrides system.md. Empty string = use file fallback. */
	system: string;
	/** Overrides behavior.md. Empty string = use file fallback. */
	behavior: string;
	/** Overrides resources.md. Empty string = use file fallback. */
	resources: string;
	/** JSON string overriding conversation-rules.json. Empty string = use file fallback. */
	conversation_rules: string;
	/** JSON string overriding response-templates.json. Empty string = use file fallback. */
	response_templates: string;
	/** JSON array of {action, group?, examples[], notes?}. Additive — appended to hardcoded trigger phrases. Empty = no additions. */
	trigger_phrases: string;
	/** JSON array of {label, rule}. Replaces file promptRules when non-empty. */
	custom_rules: string;
	/**
	 * Escape hatch — replaces entire OUTPUT DISCIPLINE section when non-empty.
	 * When non-empty, all od_* fields are ignored.
	 */
	output_discipline: string;
	/** Plain text override for the VERBATIM paragraph in OUTPUT DISCIPLINE. Empty = use seeded default. */
	od_verbatim_rule: string;
	/** JSON string[] of banned response opener phrases. Empty = use seeded default. */
	od_banned_starters: string;
	/** JSON {wrong, right}[] illustrative example pairs. Empty = use seeded default. */
	od_examples: string;
	/** JSON {label, rule}[] extra output rules appended after examples. Empty = none appended. */
	od_extra_rules: string;
	/** Free-form text appended at end of prompt when non-empty. */
	addendum: string;
	created: string;
	updated: string;
}

// ─── Prompt sections ─────────────────────────────────────────────────────────

/** A single ordered, condition-aware prompt section for an instruction set. */
export interface PBPromptSectionRecord {
	id: string;
	instruction_set_id: string;
	/** Stable identifier within the profile (e.g. 'first_person', 'trigger_phrases'). */
	section_id: string;
	/** Human-readable label shown in admin. */
	label: string;
	/** Full prompt text for this section. Supports {ANNOUNCEMENT_CHANNELS} token. */
	content: string;
	/** Sort order — lower numbers render first. */
	order: number;
	/** When false, section is excluded from the assembled prompt without deleting it. */
	enabled: boolean;
	/** When this section is injected: 'always' | 'session_active' | 'session_new' */
	condition: 'always' | 'session_active' | 'session_new';
	created: string;
	updated: string;
}

export interface PBWheelCleanupRunRecord {
	id: string;
	timestamp: string;
	run_type: string;
	checked: number;
	created: string;
	updated: string;
}

export interface PBWheelCleanupDeletionRecord {
	id: string;
	run_id: string;
	title: string;
	year: string;
	votes: number;
	voters: string;
	tmdb_id: string;
	imdb_id: string;
	added_by: string;
	date_added: string;
	matched_experiments: string;
	matched_title: string;
	restored: boolean;
	created: string;
	updated: string;
}

// ─── Button interaction templates ───────────────────────────────────────────

/**
 * A single button entry in `sm_discord_templates.buttons` (stored as a JSON array).
 * `type` determines which conditional fields apply:
 * - `link`   → requires `url` (supports `{{token}}` substitution)
 * - `action` → requires `action_key`; optionally `ctx_template`
 */
export interface TemplateButtonConfig {
	type: 'link' | 'action';
	label: string;
	/** Discord button style. `link` type always renders as a link-style button. */
	style: 'primary' | 'secondary' | 'success' | 'danger';
	emoji?: string;
	/** Row index 0–4. Buttons with the same row are grouped in one action row. */
	row: number;
	/** Token key — button is omitted if the resolved token value is empty/missing. */
	condition?: string;
	/** Link button: URL string. Supports `{{token}}` substitution. */
	url?: string;
	/** Action button: references `sm_button_actions.action_key`. */
	action_key?: string;
	/** Action button: token-substituted value encoded in the Discord `customId`. */
	ctx_template?: string;
}

/** A single record from the `sm_button_actions` collection. */
export interface PBButtonActionRecord {
	id: string;
	/** Unique key referenced by `TemplateButtonConfig.action_key`. */
	action_key: string;
	name: string;
	description: string;
	/** The `AIAction.type` value to dispatch (e.g. `find_experiment_by_movie`). */
	action_type: string;
	/** JSON object template. Use `{{button.ctx}}` as a placeholder. */
	params_template: string;
	/** Optional `template_key` override for the bot response. Empty = router default. */
	response_template_key: string;
	enabled: boolean;
	created: string;
	updated: string;
}

// ─── Discord templates ────────────────────────────────────────────────────────

/** A single record from the `sm_discord_templates` collection. One record per named template type. */
export interface PBDiscordTemplateRecord {
	id: string;
	/** Unique machine key used in `sm_instruction_sets.response_templates` JSON array (e.g. 'movie-lookup'). */
	template_key: string;
	/** Human-readable display name (e.g. 'Movie Lookup'). */
	name: string;
	/** Optional description shown in the admin UI. */
	description: string;
	/** Embed title format string. Supports `{{movie.title}}` etc. */
	title_format: string;
	/** Embed description/body format string. */
	description_format: string;
	/** Hex color string for the embed accent bar (e.g. '#0ea5e9'). */
	accent_color: string;
	/** Footer text. Supports `{{user}}` token. */
	footer_text: string;
	thumbnail_enabled: boolean;
	image_enabled: boolean;
	timestamp_enabled: boolean;
	show_director: boolean;
	show_actors: boolean;
	show_rating: boolean;
	show_genres: boolean;
	/** JSON-serialised `TemplateButtonConfig[]`. Empty array = no buttons. */
	buttons: string;
	created: string;
	updated: string;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isPocketBaseWheelRecord(row: unknown): row is PocketBaseWheelRecord {
	if (typeof row !== 'object' || row === null) return false;
	const r = row as Record<string, unknown>;
	return typeof r['id'] === 'string' && typeof r['title'] === 'string';
}
