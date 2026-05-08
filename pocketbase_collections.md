# Smart Mac — PocketBase Collections Reference

**Collection prefix:** All internal bot collections use the prefix `sm_` (configurable via `POCKETBASE_COLLECTION_PREFIX`). The wheel collection (`thewheel`) is an exception — it has no prefix and its name is configurable via `POCKETBASE_WHEEL_COLLECTION`.

All collections include automatic `id` (string), `created` (datetime), and `updated` (datetime) fields provided by PocketBase.

---

## `thewheel`

**Purpose:** Movie wheel candidates — the community "spin the wheel" pick list.

| Field         | Type | Notes                                                                               |
| ------------- | ---- | ----------------------------------------------------------------------------------- |
| `title`       | text | Movie title                                                                         |
| `year`        | text | Release year                                                                        |
| `tmdbId`      | text | TMDb numeric movie ID — used for deterministic archive matching during cleanup      |
| `imdbId`      | text | IMDb tt-ID (e.g. `tt0111161`)                                                       |
| `suggestedBy` | text | Discord snowflake ID of the user who added it (legacy rows may be a display name)   |
| `voters`      | text | Comma-separated Discord snowflake IDs of users who upvoted (excludes the suggester) |
| `dateAdded`   | text | ISO date string — when the candidate was added                                      |

---

## `sm_messages`

**Purpose:** Per-user conversation history used to give the AI context across messages.

| Field        | Type | Notes                            |
| ------------ | ---- | -------------------------------- |
| `user_id`    | text | Discord snowflake of the user    |
| `channel_id` | text | Discord snowflake of the channel |
| `role`       | text | `user` or `assistant`            |
| `content`    | text | Message text                     |

---

## `sm_sessions`

**Purpose:** Active/terminated conversation session state per user+channel pair.

| Field           | Type | Notes                                                                       |
| --------------- | ---- | --------------------------------------------------------------------------- |
| `user_id`       | text | Discord snowflake                                                           |
| `channel_id`    | text | Discord snowflake                                                           |
| `is_terminated` | bool | `true` when the user explicitly shut the bot down (e.g. "shut up mac")      |
| `last_active`   | text | ISO datetime of the last interaction — used to calculate inactivity timeout |

---

## `sm_usage_logs`

**Purpose:** Per-request AI token usage — one record per LLM call.

| Field      | Type   | Notes                                                       |
| ---------- | ------ | ----------------------------------------------------------- |
| `user_id`  | text   | Discord snowflake of the requesting user                    |
| `model`    | text   | OpenRouter model ID (e.g. `deepseek/deepseek-chat-v3-0324`) |
| `tokens`   | number | Total tokens consumed                                       |
| `cost_usd` | number | Estimated cost in USD for this call                         |

---

## `sm_global_usage`

**Purpose:** Daily aggregated AI spending — one record per calendar day. Used by the degraded-mode budget gate.

| Field        | Type   | Notes                                     |
| ------------ | ------ | ----------------------------------------- |
| `date`       | text   | `YYYY-MM-DD`                              |
| `total_cost` | number | Sum of all `cost_usd` for that day in USD |

---

## `sm_movies_search_cache`

**Purpose:** Warm Fuse.js fuzzy search index — a denormalized snapshot of movies from the BadMovies archive (Postgres). Rebuilt on startup and periodically refreshed.

| Field       | Type | Notes                                      |
| ----------- | ---- | ------------------------------------------ |
| `slug`      | text | URL slug — unique identifier for the movie |
| `title`     | text | Movie title                                |
| `year`      | text | Release year                               |
| `tmdb_id`   | text | TMDb numeric ID                            |
| `director`  | text | Director name(s)                           |
| `actors`    | text | Comma-separated actor names                |
| `genres`    | text | Comma-separated genre names                |
| `synced_at` | text | ISO datetime of last cache sync            |

---

## `sm_experiments_search_cache`

**Purpose:** Warm Fuse.js fuzzy search index for Bad Movies VR "experiments" (screening events). Rebuilt from Postgres on startup.

| Field       | Type | Notes                                           |
| ----------- | ---- | ----------------------------------------------- |
| `slug`      | text | URL slug — unique identifier for the experiment |
| `name`      | text | Experiment display name                         |
| `date`      | text | ISO date of the screening                       |
| `synced_at` | text | ISO datetime of last cache sync                 |

---

## `sm_people_search_cache`

**Purpose:** Warm search index for directors and actors — used for filmography and attribute queries.

| Field       | Type | Notes                           |
| ----------- | ---- | ------------------------------- |
| `name`      | text | Person's full name              |
| `role`      | text | `director` or `actor`           |
| `synced_at` | text | ISO datetime of last cache sync |

---

## `sm_bot_reports`

**Purpose:** User-submitted quality reports on bot responses. Submitted via the "Report Response" Discord context menu.

| Field                   | Type   | Notes                                               |
| ----------------------- | ------ | --------------------------------------------------- |
| `reported_message_id`   | text   | Discord snowflake of the bot message being reported |
| `reporter_user_id`      | text   | Discord snowflake of the reporting user             |
| `reporter_display_name` | text   | Display name at time of report                      |
| `channel_id`            | text   | Channel where the report was submitted              |
| `guild_id`              | text   | Guild ID                                            |
| `category`              | text   | `wrong_info`, `rude`, `off_topic`, or `other`       |
| `notes`                 | text   | Optional free-text notes from the reporter          |
| `bot_response_content`  | text   | Full text of the bot message that was reported      |
| `conversation_context`  | text   | Recent conversation context snapshot                |
| `created_at`            | number | Unix ms timestamp                                   |

---

## `sm_announced_events`

**Purpose:** Deduplication log for Discord scheduled events that have already been announced. Prevents the daily cron from double-posting.

| Field          | Type | Notes                               |
| -------------- | ---- | ----------------------------------- |
| `event_id`     | text | Discord scheduled event snowflake   |
| `event_name`   | text | Event title at time of announcement |
| `announced_at` | text | ISO datetime of announcement        |

---

## `sm_game_sessions`

**Purpose:** Active and historical community game sessions (trivia / bracket tournament). One record per game.

| Field        | Type   | Notes                                                                                 |
| ------------ | ------ | ------------------------------------------------------------------------------------- |
| `channel_id` | text   | Discord channel the game is running in                                                |
| `game_type`  | text   | `trivia` or `bracket`                                                                 |
| `state`      | text   | `starting`, `in_progress`, `finished`, `abandoned`                                    |
| `data`       | text   | Full game state as a JSON string (questions, answers, bracket matchups, scores, etc.) |
| `started_by` | text   | Discord snowflake of the user who started the game                                    |
| `started_at` | number | Unix ms timestamp                                                                     |
| `ended_at`   | number | Unix ms timestamp — null if still active                                              |

---

## `sm_game_leaderboard`

**Purpose:** Persistent cross-game leaderboard. One record per Discord user, upserted after each game.

| Field          | Type   | Notes                               |
| -------------- | ------ | ----------------------------------- |
| `user_id`      | text   | Discord snowflake                   |
| `username`     | text   | Display name at time of last update |
| `points`       | number | Total accumulated points            |
| `wins`         | number | Total game wins                     |
| `games_played` | number | Total games participated in         |
| `updated_at`   | number | Unix ms timestamp of last update    |

---

## `sm_monitor_state`

**Purpose:** Key-value store for monitor services (reviews and quotes) to persist their last-seen position — prevents re-posting old content on restart.

| Field   | Type | Notes                                                      |
| ------- | ---- | ---------------------------------------------------------- |
| `key`   | text | Identifier, e.g. `reviews_last_id`, `quotes_last_id`       |
| `value` | text | The stored value (typically a numeric ID or ISO timestamp) |

---

## `sm_wheel_logs`

**Purpose:** Audit log for every wheel action — add, remove, vote, spin, backup, etc.

| Field             | Type | Notes                                                        |
| ----------------- | ---- | ------------------------------------------------------------ |
| `timestamp`       | text | ISO datetime                                                 |
| `action`          | text | Action type (e.g. `add`, `remove`, `vote`, `spin`, `backup`) |
| `candidate_title` | text | Movie title the action applied to                            |
| `candidate_year`  | text | Release year                                                 |
| `user_id`         | text | Discord snowflake of the acting user                         |
| `username`        | text | Display name at time of action                               |
| `details`         | text | Human-readable description of the action                     |
| `success`         | bool | Whether the action succeeded                                 |

---

## `sm_wheel_backups`

**Purpose:** Periodic snapshots of the full wheel candidate list for disaster recovery.

| Field             | Type   | Notes                                      |
| ----------------- | ------ | ------------------------------------------ |
| `timestamp`       | text   | ISO datetime of the backup                 |
| `backup_type`     | text   | `manual` or `automated`                    |
| `candidate_count` | number | Number of candidates at time of backup     |
| `data`            | text   | Full JSON snapshot of all wheel candidates |
| `triggered_by`    | text   | Discord snowflake or system identifier     |

---

## `sm_wheel_cleanup_runs`

**Purpose:** Log of each wheel cleanup audit run (checking candidates against the watched archive).

| Field       | Type   | Notes                        |
| ----------- | ------ | ---------------------------- |
| `timestamp` | text   | ISO datetime the run started |
| `run_type`  | text   | `dry_run` or `live`          |
| `checked`   | number | Number of candidates audited |

---

## `sm_wheel_cleanup_deletions`

**Purpose:** Record of every candidate removed during a cleanup run. Enables restoring false-positive deletions.

| Field                 | Type   | Notes                                                        |
| --------------------- | ------ | ------------------------------------------------------------ |
| `run_id`              | text   | FK → `sm_wheel_cleanup_runs.id`                              |
| `title`               | text   | Candidate title at time of deletion                          |
| `year`                | text   | Release year                                                 |
| `votes`               | number | Vote count at time of deletion                               |
| `voters`              | text   | Comma-separated voter snowflakes                             |
| `tmdb_id`             | text   | TMDb ID                                                      |
| `imdb_id`             | text   | IMDb tt-ID                                                   |
| `added_by`            | text   | Original suggester snowflake                                 |
| `date_added`          | text   | When the candidate was added                                 |
| `matched_experiments` | text   | JSON array of experiment names that matched this movie       |
| `matched_title`       | text   | The specific title from the archive that triggered the match |
| `restored`            | bool   | `true` if this deletion was subsequently restored            |

---

## `sm_bot_config`

**Purpose:** Singleton operational settings record. One record ("Default") holds all bot configuration that can be edited from the admin panel without changing env vars or restarting. Seeded from env defaults on first boot; PocketBase is authoritative on all subsequent starts. Polled every `instruction_refresh_interval_ms` milliseconds for hot-reload.

Settings marked **restart-required** are stored here and applied on the next bot restart — they cannot be hot-reloaded because the affected services (cache, session manager) are instantiated once at startup with those values. All other settings, including channel IDs and cron expressions, are hot-reloadable: changes are detected on the next polling cycle and applied live without a restart.

| Field                             | Type   | Restart required? | Notes                                                         |
| --------------------------------- | ------ | ----------------- | ------------------------------------------------------------- |
| `bot_name`                        | text   | no                | Display name used in responses (default: `Smart Mac`)         |
| `admin_user_ids`                  | text   | no                | Comma-separated Discord snowflakes with admin privileges      |
| `announcement_channel_names`      | text   | no                | Comma-separated channel names used for announcement detection |
| `openrouter_base_url`             | text   | no                | OpenRouter API endpoint                                       |
| `openrouter_model`                | text   | no                | Primary LLM model ID                                          |
| `openrouter_free_model`           | text   | no                | Zero-cost model for low-confidence responses                  |
| `free_model_confidence_threshold` | number | no                | Confidence floor (0–1) to accept free model result            |
| `openrouter_fallback_model`       | text   | no                | LLM used in throttled/degraded mode                           |
| `ai_daily_budget_usd`             | number | no                | Daily spending cap in USD                                     |
| `ai_degraded_threshold`           | number | no                | % of daily budget that triggers degraded mode (0–100)         |
| `reviews_channel_id`              | text   | no                | Channel ID for automated review posts                         |
| `quotes_channel_id`               | text   | no                | Channel ID for automated quote posts                          |
| `reports_channel_id`              | text   | no                | Channel ID for report embeds                                  |
| `announcement_channel_id`         | text   | no                | Channel ID for daily event announcements                      |
| `game_leaderboard_channel_id`     | text   | no                | Channel ID for game leaderboard posts                         |
| `daily_event_check_cron`          | text   | no                | Cron schedule for EventsMonitor (default: `0 8 * * *`)        |
| `wheel_collection_name`           | text   | **yes**           | PocketBase collection name for wheel candidates               |
| `user_cooldown_seconds`           | number | no                | Minimum seconds between messages per user                     |
| `user_burst_limit`                | number | no                | Max messages allowed in a burst window                        |
| `session_inactivity_ms`           | number | **yes**           | Session expiry after inactivity (ms)                          |
| `cache_ttl_seconds`               | number | **yes**           | Default in-memory cache TTL                                   |
| `search_cache_ttl_seconds`        | number | **yes**           | Fuse.js fuzzy search cache TTL                                |
| `instruction_refresh_interval_ms` | number | no                | How often to poll PocketBase for instruction/config changes   |
| `log_level`                       | text   | no                | Logging verbosity: `debug`, `info`, `warn`, `error`           |
| `log_dir`                         | text   | no                | Directory for log files                                       |
| `loki_url`                        | text   | no                | Grafana Loki endpoint for log shipping                        |

> **Secrets never stored here.** API keys (`OPENROUTER_API_KEY`, `TMDB_API_KEY`, `OMDB_API_KEY`, `BRAVE_API_KEY`), Discord token/IDs, Postgres credentials, and PocketBase credentials remain env-only.

---

## `sm_instruction_sets`

**Purpose:** Named AI personality/instruction overrides. The active set (where `is_active=true`) is merged with file-system defaults at runtime, with PocketBase values taking precedence per field. Polled every 15 seconds for hot-reloading without restart.

| Field                | Type | Notes                                                                                                                                         |
| -------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | text | Human-readable name (e.g. "Default", "Halloween Mode")                                                                                        |
| `description`        | text | Optional notes about what this set does                                                                                                       |
| `is_active`          | bool | Only one record should have `true` — the bot uses the most recently updated active record                                                     |
| `is_default`         | bool | `true` only on the seeded "Default" placeholder — signals the bot to use pure file-system fallbacks                                           |
| `system`             | text | Overrides `config/instructions/system.md` — the bot's persona and identity. Empty = use file                                                  |
| `behavior`           | text | Overrides `config/instructions/behavior.md` — conduct and tone rules. Empty = use file                                                        |
| `resources`          | text | Overrides `config/instructions/resources.md` — injected reference material. Empty = use file                                                  |
| `conversation_rules` | text | JSON string overriding `conversation-rules.json`. Empty = use file                                                                            |
| `response_templates` | text | JSON string overriding `response-templates.json` (formatting templates). Empty = use file                                                     |
| `trigger_phrases`    | text | JSON array of `{action, group?, examples[], notes?}`. **Additive** — appended to hardcoded trigger phrase examples. Empty = no additions      |
| `custom_rules`       | text | JSON array of `{label, rule}` blocks injected before OUTPUT DISCIPLINE. Empty = use file default (`promptRules` in `conversation-rules.json`) |
| `output_discipline`  | text | **Replaces** the hardcoded OUTPUT DISCIPLINE section when non-empty. Empty = use hardcoded                                                    |
| `addendum`           | text | Free-form text appended at the very end of the prompt. Empty = nothing appended                                                               |
