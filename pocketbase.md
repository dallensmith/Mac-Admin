# Smart Mac — PocketBase Schema & Seeding Reference

> All collection names are prefixed with `sm_` by default (configurable via `POCKETBASE_COLLECTION_PREFIX`).  
> Every collection gets `id` (string PK), `created`, `updated` (autodate) automatically from PocketBase.

---

## 1. Collections

### `{prefix}_wheel` — Movie Wheel Candidates

Community "spin the wheel" pick list.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | ✅ | Movie title |
| `year` | text | ✅ | Release year |
| `tmdbId` | text | | TMDb numeric movie ID — deterministic archive matching |
| `imdbId` | text | ✅ | IMDb tt-ID (e.g. `tt0111161`) |
| `suggestedBy` | text | ✅ | Discord snowflake of user who added it |
| `voters` | text | | Comma-separated Discord snowflakes of upvoters |
| `dateAdded` | text | | ISO date string when candidate was added |

**Seed:** None — user-generated data only.

---

### `{prefix}_messages` — Conversation History

Per-user message history for AI context.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | text | ✅ | Discord snowflake |
| `channel_id` | text | ✅ | Discord snowflake |
| `role` | text | ✅ | `user` or `assistant` |
| `content` | text | | Message text |

**Seed:** None — runtime-generated only.

---

### `{prefix}_sessions` — Session State

Active/terminated conversation sessions per user+channel pair.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | text | ✅ | Discord snowflake |
| `channel_id` | text | ✅ | Discord snowflake |
| `is_terminated` | bool | | `true` when user said "shut up mac" |
| `last_active` | text | ✅ | ISO datetime — drives inactivity timeout |

**Seed:** None — runtime-generated only.

---

### `{prefix}_usage_logs` — AI Token Usage

Per-request token consumption for budget tracking.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | text | ✅ | Discord snowflake |
| `model` | text | ✅ | OpenRouter model ID |
| `tokens` | number | | Total tokens consumed |
| `cost_usd` | number | | Estimated cost in USD |

**Seed:** None — runtime-generated only.

---

### `{prefix}_global_usage` — Daily Spending

Daily aggregated AI spending — one record per calendar day.

| Field | Type | Required | Notes |
|---|---|---|---|
| `date` | text | ✅ | `YYYY-MM-DD` |
| `total_cost` | number | | Sum of all `cost_usd` for that day |

**Seed:** None — runtime-generated only.

---

### `{prefix}_movies_search_cache` — Fuse.js Movie Index

Denormalized snapshot of movies from the BadMovies Postgres archive.

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | text | ✅ | URL slug — unique movie identifier |
| `title` | text | ✅ | Movie title |
| `year` | text | | Release year |
| `tmdb_id` | text | | TMDb numeric ID |
| `director` | text | | Director name(s) |
| `actors` | text | | Comma-separated actor names |
| `genres` | text | | Comma-separated genre names |
| `synced_at` | text | | ISO datetime of last cache sync |

**Seed:** Populated at startup from Postgres via `SearchCacheManager.populate()`. Upserted by slug.

---

### `{prefix}_experiments_search_cache` — Fuse.js Experiment Index

Denormalized snapshot of experiments (screening events) from Postgres.

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | text | ✅ | URL slug |
| `name` | text | ✅ | Experiment display name |
| `date` | text | | ISO date of screening |
| `synced_at` | text | | ISO datetime of last sync |

**Seed:** Populated at startup from Postgres via `SearchCacheManager.populate()`. Upserted by slug.

---

### `{prefix}_people_search_cache` — Director/Actor Index

Warm search index for filmography queries.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | ✅ | Person's full name |
| `role` | text | ✅ | `director` or `actor` |
| `synced_at` | text | | ISO datetime of last sync |

**Seed:** Populated at startup from Postgres via `SearchCacheManager.populate()`. Upserted by name.

---

### `{prefix}_bot_reports` — Quality Reports

User-submitted reports on bot responses (via "Report Response" context menu).

| Field | Type | Required | Notes |
|---|---|---|---|
| `reported_message_id` | text | ✅ | Discord snowflake of reported message |
| `reporter_user_id` | text | ✅ | Discord snowflake of reporter |
| `reporter_display_name` | text | ✅ | Display name at report time |
| `channel_id` | text | ✅ | Channel where report was submitted |
| `guild_id` | text | ✅ | Guild ID |
| `category` | text | ✅ | `wrong_info`, `rude`, `off_topic`, `other` |
| `notes` | text | | Optional free-text from reporter |
| `bot_response_content` | text | | Full text of reported bot message |
| `conversation_context` | text | | Recent conversation snapshot |
| `created_at` | number | ✅ | Unix ms timestamp |

**Seed:** None — user-generated only.

---

### `{prefix}_announced_events` — Event Dedup Log

Prevents the daily cron from double-posting scheduled event announcements.

| Field | Type | Required | Notes |
|---|---|---|---|
| `event_id` | text | ✅ | Discord scheduled event snowflake |
| `event_name` | text | ✅ | Event title at announcement time |
| `announced_at` | text | ✅ | ISO datetime of announcement |

**Seed:** None — runtime-generated only.

---

### `{prefix}_game_sessions` — Game State

Active and historical community game sessions.

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel_id` | text | ✅ | Discord channel |
| `game_type` | text | ✅ | `trivia` or `bracket` |
| `state` | text | ✅ | `starting`, `in_progress`, `finished`, `abandoned` |
| `data` | text | ✅ | Full game state as JSON string |
| `started_by` | text | ✅ | Discord snowflake of game initiator |
| `started_at` | number | ✅ | Unix ms timestamp |
| `ended_at` | number | | Unix ms — null if active |

**Seed:** None — runtime-generated only.

---

### `{prefix}_game_leaderboard` — Persistent Leaderboard

Cross-game leaderboard, upserted after each game.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | text | ✅ | Discord snowflake |
| `username` | text | ✅ | Display name at last update |
| `points` | number | | Total accumulated points |
| `wins` | number | | Total game wins |
| `games_played` | number | | Total games participated in |
| `updated_at` | number | ✅ | Unix ms timestamp of last update |

**Seed:** None — runtime-generated only.

---

### `{prefix}_monitor_state` — Monitor KV Store

Key-value persistence for monitor services (reviews & quotes) to track last-seen position.

| Field | Type | Required | Notes |
|---|---|---|---|
| `key` | text | ✅ | e.g. `reviews_last_id`, `quotes_last_id` |
| `value` | text | ✅ | The stored value (numeric ID or ISO timestamp) |

**Seed:** None — runtime-generated only.

---

### `{prefix}_wheel_logs` — Wheel Audit Log

Every wheel action (add, remove, vote, spin, backup).

| Field | Type | Required | Notes |
|---|---|---|---|
| `timestamp` | text | ✅ | ISO datetime |
| `action` | text | ✅ | `add`, `remove`, `vote`, `spin`, `backup`, etc. |
| `candidate_title` | text | | Movie title |
| `candidate_year` | text | | Release year |
| `user_id` | text | | Discord snowflake |
| `username` | text | | Display name |
| `details` | text | | Free-text details |
| `success` | bool | | Whether the operation succeeded |

**Seed:** None — runtime-generated only.

---

### `{prefix}_wheel_backups` — Wheel Snapshots

Periodic backups of the full wheel candidate list.

| Field | Type | Required | Notes |
|---|---|---|---|
| `timestamp` | text | ✅ | ISO datetime |
| `backup_type` | text | | `manual`, `auto_cleanup`, etc. |
| `candidate_count` | number | | Number of candidates in backup |
| `data` | text | | Full JSON snapshot |
| `triggered_by` | text | | Discord snowflake or `system` |

**Seed:** None — runtime-generated only.

---

### `{prefix}_wheel_cleanup_runs` — Cleanup Run Log

Log of automated wheel cleanup executions.

| Field | Type | Required | Notes |
|---|---|---|---|
| `timestamp` | text | ✅ | ISO datetime |
| `run_type` | text | | `dry_run` or `live` |
| `checked` | number | | Number of candidates checked |

**Seed:** None — runtime-generated only.

---

### `{prefix}_wheel_cleanup_deletions` — Cleanup Deletion Log

Individual deletion records for candidates removed during cleanup.

| Field | Type | Required | Notes |
|---|---|---|---|
| `run_id` | text | ✅ | FK to wheel_cleanup_runs |
| `title` | text | | Movie title |
| `year` | text | | Release year |
| `votes` | number | | Vote count at deletion time |
| `voters` | text | | Comma-separated voter snowflakes |
| `tmdb_id` | text | | TMDb ID |
| `imdb_id` | text | | IMDb ID |
| `added_by` | text | | Suggested by |
| `date_added` | text | | ISO date added |
| `matched_experiments` | text | | Comma-separated experiment numbers |
| `matched_title` | text | | Canonical archive title that triggered match |
| `restored` | bool | | Whether candidate was restored |

**Seed:** None — runtime-generated only.

---

### `{prefix}_instruction_sets` — Named Instruction Sets

Personality/behavior overrides. Multiple sets can exist; only `is_active=true` ones are applied.  
Empty string fields = fall back to file-system defaults.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | ✅ | Display name (e.g. "Default", "Angry Mac") |
| `description` | text | | Human-readable description |
| `is_active` | bool | | `true` = this set is applied |
| `is_default` | bool | | `true` = fallback when no active set |
| `system` | text (200k) | | Overrides `system.md` |
| `behavior` | text (200k) | | Overrides `behavior.md` |
| `resources` | text (200k) | | Overrides `resources.md` |
| `conversation_rules` | text (200k) | | JSON — overrides `conversation-rules.json` |
| `response_templates` | text (200k) | | JSON — overrides `response-templates.json` |
| `trigger_phrases` | text (200k) | | JSON array — additive trigger phrase examples |
| `custom_rules` | text (200k) | | JSON array — replaces file promptRules when non-empty |
| `output_discipline` | text (200k) | | Replaces hardcoded OUTPUT DISCIPLINE when non-empty |
| `addendum` | text (200k) | | Free-form text appended at end of prompt |

**Seed:** A "Default" record is synced on first boot from file-system content.  
Only empty fields are populated — admin edits are never overwritten.

---

### `{prefix}_bot_config` — Bot Operational Config (Singleton)

Hot-reloadable operational settings. Single record — seeded once from env vars on first boot, then PB is authoritative.

| Field | Type | Required | Notes |
|---|---|---|---|
| `bot_name` | text | | Display name (default: `Smart Mac`) |
| `admin_user_ids` | text | | Comma-separated Discord snowflakes |
| `announcement_channel_names` | text | | Comma-separated channel names |
| `openrouter_base_url` | text | | OpenRouter endpoint |
| `openrouter_model` | text | | Primary LLM model |
| `openrouter_free_model` | text | | Zero-cost model for chat responses |
| `free_model_confidence_threshold` | number | | Confidence floor for free model (0–1) |
| `openrouter_fallback_model` | text | | Fallback LLM in degraded mode |
| `ai_daily_budget_usd` | number | | Daily spending cap |
| `ai_degraded_threshold` | number | | % of budget triggering degraded mode |
| `reviews_channel_id` | text | | Discord channel for review posts |
| `quotes_channel_id` | text | | Discord channel for quote posts |
| `reports_channel_id` | text | | Discord channel for report embeds |
| `announcement_channel_id` | text | | Discord channel for event announcements |
| `game_leaderboard_channel_id` | text | | Discord channel for leaderboard posts |
| `daily_event_check_cron` | text | | Cron schedule for EventsMonitor |
| `wheel_collection_name` | text | | Override wheel collection name |
| `user_cooldown_seconds` | number | | Min seconds between messages per user |
| `user_burst_limit` | number | | Max messages in burst window |
| `session_inactivity_ms` | number | | Session expiry after inactivity |
| `cache_ttl_seconds` | number | | In-memory cache TTL |
| `search_cache_ttl_seconds` | number | | Fuse.js search cache TTL |
| `instruction_refresh_interval_ms` | number | | Instruction polling interval |
| `log_level` | text | | `debug`, `info`, `warn`, `error` |
| `log_dir` | text | | Log file directory |
| `loki_url` | text | | Grafana Loki endpoint |

**Seed:** Created once on first boot from environment variables. Never overwritten.

---

## 2. Schema Creation Code (TypeScript)

The schema is created idempotently at startup in `PocketBaseClient.ensureAllCollections()`.  
Here is the exact collection definitions array:

```typescript
// ── Field helpers ──────────────────────────────────────────────────────────
const text     = (n: string, req = false) => ({ name: n, type: "text",     required: req });
const longtext = (n: string, req = false) => ({ name: n, type: "text",     required: req, max: 200000 });
const num      = (n: string, req = false) => ({ name: n, type: "number",   required: req });
const bool     = (n: string, req = false) => ({ name: n, type: "bool",     required: req });

// ── Auto-added by ensureOneCollection (PocketBase v2 workaround) ──────────
const autodateFields = [
  { name: "created", type: "autodate", system: true, onCreate: true,  onUpdate: false, presentable: false, hidden: false },
  { name: "updated", type: "autodate", system: true, onCreate: true,  onUpdate: true,  presentable: false, hidden: false },
];

// ── Collection definitions ─────────────────────────────────────────────────
const collectionDefs = [
  // Wheel
  { name: col("wheel"),
    fields: [text("title", true), text("year", true), text("tmdbId"),
             text("imdbId", true), text("suggestedBy", true), text("voters"), text("dateAdded")] },

  // Conversation
  { name: col("messages"),
    fields: [text("user_id", true), text("channel_id", true), text("role", true), text("content")] },
  { name: col("sessions"),
    fields: [text("user_id", true), text("channel_id", true), bool("is_terminated"), text("last_active", true)] },
  { name: col("usage_logs"),
    fields: [text("user_id", true), text("model", true), num("tokens"), num("cost_usd")] },
  { name: col("global_usage"),
    fields: [text("date", true), num("total_cost")] },

  // Search cache (upserted at startup from Postgres)
  { name: col("movies_search_cache"),
    fields: [text("slug", true), text("title", true), text("year"), text("tmdb_id"),
             text("director"), text("actors"), text("genres"), text("synced_at")] },
  { name: col("experiments_search_cache"),
    fields: [text("slug", true), text("name", true), text("date"), text("synced_at")] },
  { name: col("people_search_cache"),
    fields: [text("name", true), text("role", true), text("synced_at")] },

  // Reports
  { name: col("bot_reports"),
    fields: [text("reported_message_id", true), text("reporter_user_id", true),
             text("reporter_display_name", true), text("channel_id", true),
             text("guild_id", true), text("category", true), text("notes"),
             text("bot_response_content"), text("conversation_context"), num("created_at", true)] },

  // Events
  { name: col("announced_events"),
    fields: [text("event_id", true), text("event_name", true), text("announced_at", true)] },

  // Games
  { name: col("game_sessions"),
    fields: [text("channel_id", true), text("game_type", true), text("state", true),
             text("data", true), text("started_by", true), num("started_at", true), num("ended_at")] },
  { name: col("game_leaderboard"),
    fields: [text("user_id", true), text("username", true), num("points"), num("wins"),
             num("games_played"), num("updated_at", true)] },

  // Monitor state
  { name: col("monitor_state"),
    fields: [text("key", true), text("value", true)] },

  // Wheel logs
  { name: col("wheel_logs"),
    fields: [text("timestamp", true), text("action", true), text("candidate_title"),
             text("candidate_year"), text("user_id"), text("username"), text("details"), bool("success")] },
  { name: col("wheel_backups"),
    fields: [text("timestamp", true), text("backup_type"), num("candidate_count"), text("data"), text("triggered_by")] },
  { name: col("wheel_cleanup_runs"),
    fields: [text("timestamp", true), text("run_type"), num("checked")] },
  { name: col("wheel_cleanup_deletions"),
    fields: [text("run_id", true), text("title"), text("year"), num("votes"), text("voters"),
             text("tmdb_id"), text("imdb_id"), text("added_by"), text("date_added"),
             text("matched_experiments"), text("matched_title"), bool("restored")] },

  // Instruction sets
  { name: col("instruction_sets"),
    fields: [text("name", true), text("description"), bool("is_active"), bool("is_default"),
             longtext("system"), longtext("behavior"), longtext("resources"),
             longtext("conversation_rules"), longtext("response_templates"),
             longtext("trigger_phrases"), longtext("custom_rules"),
             longtext("output_discipline"), longtext("addendum")] },

  // Bot config (singleton)
  { name: col("bot_config"),
    fields: [text("bot_name"), text("admin_user_ids"), text("announcement_channel_names"),
             text("openrouter_base_url"), text("openrouter_model"), text("openrouter_free_model"),
             num("free_model_confidence_threshold"), text("openrouter_fallback_model"),
             num("ai_daily_budget_usd"), num("ai_degraded_threshold"),
             text("reviews_channel_id"), text("quotes_channel_id"), text("reports_channel_id"),
             text("announcement_channel_id"), text("game_leaderboard_channel_id"),
             text("daily_event_check_cron"), text("wheel_collection_name"),
             num("user_cooldown_seconds"), num("user_burst_limit"), num("session_inactivity_ms"),
             num("cache_ttl_seconds"), num("search_cache_ttl_seconds"),
             num("instruction_refresh_interval_ms"), text("log_level"), text("log_dir"), text("loki_url")] },
];

// ── Idempotent creation ────────────────────────────────────────────────────
for (const { name, fields } of collectionDefs) {
  await ensureOneCollection(name, fields);  // creates if absent, patches if fields mismatch
}
```

---

## 3. Seeding Logic

### 3a. Bot Config — `ConfigStore.init()` → `PocketBaseClient.seedBotConfig()`

On first boot, if no record exists in `{prefix}_bot_config`, a singleton is created from the current environment-variable-based Config values. On subsequent boots (and every poll), the existing PB record is authoritative.

**Seed payload** (from `ConfigStore.buildSeedFromConfig()`):

```typescript
{
  // Discord
  bot_name:                   config.discord.botName,
  admin_user_ids:             config.discord.adminUserIds.join(","),
  announcement_channel_names: config.discord.announcementChannelNames.join(","),
  // AI
  openrouter_base_url:              config.ai.baseUrl,
  openrouter_model:                 config.ai.model,
  openrouter_free_model:            config.ai.freeModel,
  free_model_confidence_threshold:  config.ai.freeModelConfidenceThreshold,
  openrouter_fallback_model:        config.ai.fallbackModel,
  ai_daily_budget_usd:              config.ai.dailyBudget,
  ai_degraded_threshold:            config.ai.degradedThreshold,
  // Channel IDs
  reviews_channel_id:          config.api.reviewsChannelId,
  quotes_channel_id:           config.api.quotesChannelId,
  reports_channel_id:          config.api.reportsChannelId,
  announcement_channel_id:     config.api.announcementChannelId,
  game_leaderboard_channel_id: config.api.gameLeaderboardChannelId,
  daily_event_check_cron:      config.api.dailyEventCheckCron,
  // Wheel
  wheel_collection_name:       '',  // empty = use prefix default
  // Limits
  user_cooldown_seconds:           config.limits.userCooldown,
  user_burst_limit:                config.limits.userBurstLimit,
  session_inactivity_ms:           config.limits.sessionTimeout,
  cache_ttl_seconds:               config.limits.cacheTtl,
  search_cache_ttl_seconds:        config.limits.searchCacheTtl,
  instruction_refresh_interval_ms: config.limits.instructionRefreshIntervalMs,
  // Logging
  log_level: config.logging.level,
  log_dir:   config.logging.logDir,
  loki_url:  config.logging.lokiUrl,
}
```

**Idempotency:** `getBotConfig()` checks if a record already exists. If yes → skip seed.

---

### 3b. Instruction Sets — `InstructionStore.init()` → `PocketBaseClient.syncDefaultInstructionSet()`

The "Default" instruction set is seeded from the file-system content in `config/instructions/`. On first boot, a record is created. On subsequent boots, **only empty fields are populated** — preserving any admin edits made via the admin panel.

**Seed payload:**

```typescript
{
  name:                "Default",
  is_active:           true,
  is_default:          true,
  description:         "File-system defaults. Edit fields here to override; empty fields fall back to files.",
  system:              <contents of system.md>,
  behavior:            <contents of behavior.md>,
  resources:           <contents of resources.md>,
  conversation_rules:  JSON.stringify(<conversation-rules.json>),
  response_templates:  JSON.stringify(<response-templates.json>),
  trigger_phrases:     "[]",        // empty — file provides hardcoded phrases
  custom_rules:        "[]",        // empty — file provides promptRules
  output_discipline:   <OUTPUT_DISCIPLINE_DEFAULT from prompt-builder.ts>,
  addendum:            "",
}
```

**Idempotency:** Looks up existing record by `name="Default"`. If exists → only PATCH fields that are currently empty/blank in PB.

---

### 3c. Search Caches — `SearchCacheManager.populate()`

Called at startup (and via `/scan-exp`). Reads from Postgres and upserts into PocketBase:

| Collection | Key Field | Source |
|---|---|---|
| `movies_search_cache` | `slug` | `SELECT slug, title, year, tmdb_id, director, actors, genres FROM movies` |
| `experiments_search_cache` | `slug` | Query from experiments table |
| `people_search_cache` | `name` | Extracted from director/actor fields |

Upsert logic: `batchUpsert()` loads all existing records, maps key→PB id, POSTs new, PATCHes existing.

---

## 4. TypeScript Types

All PocketBase record types are in `src/types/pocketbase.ts`. Key types:

| Type | Collection | Notes |
|---|---|---|
| `PocketBaseWheelRecord` | `wheel` | Movie wheel candidate |
| `PBMessageRecord` | `messages` | Conversation message |
| `PBSessionRecord` | `sessions` | Session state |
| `PBUsageLogRecord` | `usage_logs` | AI token usage |
| `PBGlobalUsageRecord` | `global_usage` | Daily spending |
| `PBMovieCacheRecord` | `movies_search_cache` | Movie cache entry |
| `PBExperimentCacheRecord` | `experiments_search_cache` | Experiment cache entry |
| `PBPersonCacheRecord` | `people_search_cache` | Person cache entry |
| `PBBotReportRecord` | `bot_reports` | Quality report |
| `PBAnnouncedEventRecord` | `announced_events` | Event dedup |
| `PBGameSessionRecord` | `game_sessions` | Game state |
| `PBLeaderboardRecord` | `game_leaderboard` | Leaderboard entry |
| `PBMonitorStateRecord` | `monitor_state` | Monitor KV |
| `PBWheelLogRecord` | `wheel_logs` | Wheel audit |
| `PBWheelBackupRecord` | `wheel_backups` | Wheel snapshot |
| `PBWheelCleanupRunRecord` | `wheel_cleanup_runs` | Cleanup run |
| `PBWheelCleanupDeletionRecord` | `wheel_cleanup_deletions` | Cleanup deletion |
| `PBInstructionSetRecord` | `instruction_sets` | Instruction set |
| `PBBotConfigRecord` | `bot_config` | Bot operational config |

---

## 5. PocketBase REST API Summary

All schema management uses these endpoints:

| Operation | Method | URL |
|---|---|---|
| List collections | GET | `/api/collections` |
| Check collection | GET | `/api/collections/{name}` |
| Create collection | POST | `/api/collections` |
| Update collection fields | PATCH | `/api/collections/{name}` |
| List records | GET | `/api/collections/{name}/records` |
| Create record | POST | `/api/collections/{name}/records` |
| Update record | PATCH | `/api/collections/{name}/records/{id}` |
| Delete record | DELETE | `/api/collections/{name}/records/{id}` |
| Auth (superuser) | POST | `/api/admins/auth-with-password` |

Authentication header: `Authorization: Bearer {token}` — token obtained from admin auth endpoint, refreshed on 401.
