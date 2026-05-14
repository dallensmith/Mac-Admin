# Smart Mac — PocketBase Collections Reference

**Collection prefix:** All internal bot collections use the prefix `sm_` (configurable via `POCKETBASE_COLLECTION_PREFIX`). The wheel collection (`thewheel`) predates this prefix and retains its original name.

All collections include automatic `id` (string), `created` (datetime), and `updated` (datetime) fields provided by PocketBase.

---

## Collection Index

| Collection                                                    | Purpose                                               |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| [`thewheel`](#thewheel)                                       | Movie wheel candidates                                |
| [`sm_messages`](#sm_messages)                                 | Per-session conversation history                      |
| [`sm_sessions`](#sm_sessions)                                 | Conversation session state                            |
| [`sm_usage_logs`](#sm_usage_logs)                             | Per-request AI token usage                            |
| [`sm_global_usage`](#sm_global_usage)                         | Daily aggregated AI spending                          |
| [`sm_movies_search_cache`](#sm_movies_search_cache)           | Fuse.js movie index                                   |
| [`sm_experiments_search_cache`](#sm_experiments_search_cache) | Fuse.js experiment index                              |
| [`sm_people_search_cache`](#sm_people_search_cache)           | Fuse.js director/actor index                          |
| [`sm_bot_reports`](#sm_bot_reports)                           | User-submitted response quality reports               |
| [`sm_announced_events`](#sm_announced_events)                 | Dedup log for Discord event announcements             |
| [`sm_game_sessions`](#sm_game_sessions)                       | Community trivia/bracket game sessions                |
| [`sm_game_leaderboard`](#sm_game_leaderboard)                 | Cross-game point leaderboard                          |
| [`sm_monitor_state`](#sm_monitor_state)                       | Key-value store for monitor service cursors           |
| [`sm_wheel_logs`](#sm_wheel_logs)                             | Wheel action audit log                                |
| [`sm_wheel_backups`](#sm_wheel_backups)                       | Full wheel snapshot backups                           |
| [`sm_wheel_cleanup_runs`](#sm_wheel_cleanup_runs)             | Cleanup audit run log                                 |
| [`sm_wheel_cleanup_deletions`](#sm_wheel_cleanup_deletions)   | Per-deletion records with restore support             |
| [`sm_bot_config`](#sm_bot_config)                             | Singleton operational settings (hot-reloadable)       |
| [`sm_instruction_sets`](#sm_instruction_sets)                 | Named AI personality profiles                         |
| [`sm_prompt_sections`](#sm_prompt_sections)                   | Ordered prompt section records per profile            |
| [`sm_discord_templates`](#sm_discord_templates)               | Global Discord embed template designs                 |
| [`sm_button_actions`](#sm_button_actions)                     | Database-driven interactive button action definitions |

---

## `thewheel`

**Purpose:** Movie wheel candidates — the community "spin the wheel" pick list. This collection name is configurable via `sm_bot_config.wheel_collection_name` (default: `thewheel`).

| Field         | Type | Notes                                                                               |
| ------------- | ---- | ----------------------------------------------------------------------------------- |
| `title`       | text | Movie title                                                                         |
| `year`        | text | Release year                                                                        |
| `tmdbId`      | text | TMDb numeric movie ID — used for deterministic archive matching during cleanup      |
| `imdbId`      | text | IMDb tt-ID (e.g. `tt0111161`)                                                       |
| `suggestedBy` | text | Discord snowflake of the user who added it (legacy rows may be a display name)      |
| `voters`      | text | Comma-separated Discord snowflake IDs of users who upvoted (excludes the suggester) |
| `dateAdded`   | text | ISO date string — when the candidate was added                                      |

---

## `sm_messages`

**Purpose:** Per-session conversation history. Filtered by `session_id` when building AI context, so messages from old or terminated sessions never bleed into new ones.

| Field        | Type | Notes                                                                                                                              |
| ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `user_id`    | text | Discord snowflake of the user                                                                                                      |
| `channel_id` | text | Discord snowflake of the channel                                                                                                   |
| `session_id` | text | UUID matching `sm_sessions.conversation_id` at the time the message was stored — scopes context to the current conversation window |
| `role`       | text | `user` or `assistant`                                                                                                              |
| `content`    | text | Message text                                                                                                                       |

---

## `sm_sessions`

**Purpose:** Active/terminated conversation session state per user+channel pair. One record per user+channel combination; updated in-place on each interaction.

| Field             | Type | Notes                                                                                                                                                                                                                         |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_id`         | text | Discord snowflake                                                                                                                                                                                                             |
| `channel_id`      | text | Discord snowflake                                                                                                                                                                                                             |
| `is_terminated`   | bool | `true` when the user explicitly shut the bot down (e.g. "shut up mac")                                                                                                                                                        |
| `last_active`     | text | ISO datetime of the last interaction — used to calculate inactivity timeout                                                                                                                                                   |
| `conversation_id` | text | UUID that resets on every new conversation (termination or inactivity timeout). Messages are keyed to this value via `sm_messages.session_id` — changing it automatically scopes all future context fetches to the new window |

---

## `sm_usage_logs`

**Purpose:** Per-request AI token usage — one record per LLM call.

| Field      | Type   | Notes                                                 |
| ---------- | ------ | ----------------------------------------------------- |
| `user_id`  | text   | Discord snowflake of the requesting user              |
| `model`    | text   | OpenRouter model ID (e.g. `anthropic/claude-3-haiku`) |
| `tokens`   | number | Total tokens consumed                                 |
| `cost_usd` | number | Estimated cost in USD for this call                   |

---

## `sm_global_usage`

**Purpose:** Daily aggregated AI spending — one record per calendar day. Used by the degraded-mode budget gate.

| Field        | Type   | Notes                                     |
| ------------ | ------ | ----------------------------------------- |
| `date`       | text   | `YYYY-MM-DD`                              |
| `total_cost` | number | Sum of all `cost_usd` for that day in USD |

---

## `sm_movies_search_cache`

**Purpose:** Warm Fuse.js fuzzy search index — a denormalized snapshot of movies from the BadMovies.co archive (Postgres). Rebuilt on startup and periodically refreshed.

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
| `ended_at`   | number | Unix ms timestamp — `0` if still active                                               |

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

**Purpose:** Record of every candidate removed during a live cleanup run. Enables restoring false-positive deletions via the Discord report UI.

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

Settings marked **restart-required** are applied only on the next bot restart — the affected services are instantiated once at startup with those values and cannot pick up live changes. All other settings are hot-reloadable: changes are detected on the next polling cycle and applied immediately.

| Field                             | Type   | Restart required? | Notes                                                                 |
| --------------------------------- | ------ | ----------------- | --------------------------------------------------------------------- |
| `bot_name`                        | text   | no                | Display name used in responses (default: `Smart Mac`)                 |
| `admin_user_ids`                  | text   | no                | Comma-separated Discord snowflakes with admin privileges              |
| `announcement_channel_names`      | text   | no                | Comma-separated channel names used for announcement detection         |
| `openrouter_base_url`             | text   | no                | OpenRouter API endpoint                                               |
| `openrouter_model`                | text   | no                | Primary LLM model ID                                                  |
| `openrouter_free_model`           | text   | no                | Zero-cost model for low-confidence responses                          |
| `free_model_confidence_threshold` | number | no                | Confidence floor (0–1) to accept free model result                    |
| `openrouter_fallback_model`       | text   | no                | LLM used in throttled/degraded mode                                   |
| `ai_daily_budget_usd`             | number | no                | Daily spending cap in USD                                             |
| `ai_degraded_threshold`           | number | no                | % of daily budget that triggers degraded mode (0–100)                 |
| `reviews_channel_id`              | text   | no                | Channel ID for automated review posts                                 |
| `quotes_channel_id`               | text   | no                | Channel ID for automated quote posts                                  |
| `reports_channel_id`              | text   | no                | Channel ID for report embeds                                          |
| `announcement_channel_id`         | text   | no                | Channel ID for daily event announcements                              |
| `game_leaderboard_channel_id`     | text   | no                | Channel ID for game leaderboard posts                                 |
| `daily_event_check_cron`          | text   | no                | Cron schedule for EventsMonitor (default: `0 8 * * *`)                |
| `wheel_collection_name`           | text   | **yes**           | PocketBase collection name for wheel candidates (default: `thewheel`) |
| `user_cooldown_seconds`           | number | no                | Minimum seconds between messages per user                             |
| `user_burst_limit`                | number | no                | Max messages allowed in a burst window                                |
| `session_inactivity_ms`           | number | **yes**           | Session expiry after inactivity (ms)                                  |
| `cache_ttl_seconds`               | number | **yes**           | Default in-memory cache TTL                                           |
| `search_cache_ttl_seconds`        | number | **yes**           | Fuse.js fuzzy search cache TTL                                        |
| `instruction_refresh_interval_ms` | number | no                | How often to poll PocketBase for instruction/config changes (ms)      |
| `log_level`                       | text   | no                | Logging verbosity: `debug`, `info`, `warn`, `error`                   |
| `log_dir`                         | text   | no                | Directory for log files                                               |
| `loki_url`                        | text   | no                | Grafana Loki endpoint for log shipping (empty = disabled)             |

> **Secrets never stored here.** API keys (`OPENROUTER_API_KEY`, `TMDB_API_KEY`, `OMDB_API_KEY`, `BRAVE_API_KEY`), Discord token/IDs, Postgres credentials, and PocketBase credentials remain env-only.

---

## `sm_instruction_sets`

**Purpose:** Named AI personality profiles. Exactly one record should have `is_active=true` — the bot loads it on startup and polls for changes every `instruction_refresh_interval_ms` milliseconds. Each field is an optional override: an empty value falls back to the file-system default in `config/instructions/`. The active set's `id` is used to look up its associated prompt sections in `sm_prompt_sections`.

| Field                | Type            | Notes                                                                                                                                                                                                                          |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`               | text            | Human-readable name (e.g. "Default", "Halloween Mode")                                                                                                                                                                         |
| `description`        | text            | Optional notes about what this profile does                                                                                                                                                                                    |
| `is_active`          | bool            | The bot uses the most-recently-updated record where this is `true`. Only one should be active at a time                                                                                                                        |
| `is_default`         | bool            | `true` only on the seeded "Default" record — informational flag only, does not affect runtime behavior                                                                                                                         |
| `system`             | text (longtext) | Overrides `config/instructions/system.md` — persona and identity. **Empty = use file**                                                                                                                                         |
| `behavior`           | text (longtext) | Overrides `config/instructions/behavior.md` — conduct and tone rules. **Empty = use file**                                                                                                                                     |
| `resources`          | text (longtext) | Overrides `config/instructions/resources.md` — injected reference links and material. **Empty = use file**                                                                                                                     |
| `conversation_rules` | text (longtext) | JSON string overriding `conversation-rules.json` (termination signals, name detection). **Empty = use file**                                                                                                                   |
| `response_templates` | text (longtext) | JSON string overriding `response-templates.json` (Discord embed formatting templates). **Empty = use file**                                                                                                                    |
| `trigger_phrases`    | text (longtext) | JSON array of `{action, group?, examples[], notes?}`. **Additive** — these examples are appended to the trigger phrases section (works in both the PB-sections path and the hardcoded fallback path). **Empty = no additions** |
| `rules`              | text (longtext) | JSON array of `{label, rule}` blocks injected before OUTPUT DISCIPLINE. **Empty = use file default** (`rules` in `default_profile.json`)                                                                                       |
| `output_discipline`  | text (longtext) | **Escape hatch** — fully replaces the OUTPUT DISCIPLINE section when non-empty, bypassing all `od_*` fields. **Empty = use granular `od_*` fields**                                                                            |
| `od_verbatim_rule`   | text (longtext) | Plain text override for the "response is sent VERBATIM" paragraph in OUTPUT DISCIPLINE. **Empty = use seeded default**                                                                                                         |
| `od_banned_starters` | text (longtext) | JSON `string[]` of banned response opener phrases (e.g. `["Okay,", "Hmm,"]`). **Empty = use seeded default**                                                                                                                   |
| `od_examples`        | text (longtext) | JSON array of `{wrong, right}` illustrative example pairs. **Empty = use seeded default**                                                                                                                                      |
| `od_extra_rules`     | text (longtext) | JSON array of `{label, rule}` extra output rules appended after the examples. **Empty = none appended**                                                                                                                        |
| `addendum`           | text (longtext) | Free-form text appended at the very end of the assembled prompt. **Empty = nothing appended**                                                                                                                                  |

> **How `output_discipline` vs `od_*` fields interact:**
>
> 1. If `output_discipline` is non-empty → it is used verbatim, all `od_*` fields are ignored.
> 2. If `output_discipline` is empty → the section is composed from `od_verbatim_rule`, `od_banned_starters`, `od_examples`, and `od_extra_rules`, each falling back to its seeded default when empty.

---

## `sm_prompt_sections`

**Purpose:** Ordered, condition-aware prompt section records for a given instruction set. These replace the four hardcoded prompt builders (first-person rule, core routing rule, trigger phrases, response formats) when present — allowing the full AI system prompt to be assembled and edited entirely from the PocketBase admin panel.

Each `sm_instruction_sets` record has zero or more associated sections. **Zero sections = fall back to hardcoded TypeScript builders** (pre-PB behavior, safe for new or minimal profiles). The Default profile is seeded with 5 sections on first boot.

| Field                | Type            | Notes                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instruction_set_id` | text            | FK → `sm_instruction_sets.id` — which profile owns this section                                                                                                                                                                                                                                                                              |
| `section_id`         | text            | Stable identifier for this section within the profile. Used to apply trigger phrase additions (the section with `section_id = 'trigger_phrases'` has additive examples from `sm_instruction_sets.trigger_phrases` appended to it). Seeded values: `first_person`, `core_rule_active`, `core_rule_new`, `trigger_phrases`, `response_formats` |
| `label`              | text            | Human-readable name shown in the admin panel (e.g. "First Person Rule")                                                                                                                                                                                                                                                                      |
| `content`            | text (longtext) | The full prompt text for this section. Supports the `{ANNOUNCEMENT_CHANNELS}` token in the `trigger_phrases` section — replaced at render time with the live channel name list from `sm_bot_config`                                                                                                                                          |
| `order`              | number          | Sort order within the profile — lower numbers render first. Seeded order: `10`, `20`, `20`, `30`, `40`                                                                                                                                                                                                                                       |
| `enabled`            | bool            | When `false`, the section is excluded from the assembled prompt without deleting it                                                                                                                                                                                                                                                          |
| `condition`          | text            | Controls when the section is injected: `always` (every message), `session_active` (only mid-conversation), `session_new` (only when the bot is first addressed). The two `core_rule_*` sections use `session_active` and `session_new` respectively so the correct routing rule is injected based on session state                           |

> **Seeded Default sections:**
>
> | `section_id`       | `condition`      | `order` | Content                                       |
> | ------------------ | ---------------- | ------- | --------------------------------------------- |
> | `first_person`     | `always`         | 10      | CRITICAL RULE — FIRST PERSON ONLY             |
> | `core_rule_active` | `session_active` | 20      | CORE RULE — active session routing            |
> | `core_rule_new`    | `session_new`    | 20      | CORE RULE — new session routing               |
> | `trigger_phrases`  | `always`         | 30      | Full TRIGGER PHRASES block (all action types) |
> | `response_formats` | `always`         | 40      | Full RESPONSE FORMAT OPTIONS block            |

---

## `sm_discord_templates`

**Purpose:** Global Discord embed template designs. One record per named template type (e.g. Movie Lookup, Experiment Lookup). Templates are shared across all instruction set profiles. Each instruction set record's `response_templates` field stores a JSON `string[]` of enabled `template_key` values for that profile — empty array means no templates override hardcoded embeds.

| Field                 | Type            | Notes                                                                                                                                                                          |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | ------------------------------------------------------------------------------------------------------------------------- |
| `template_key`        | text            | Unique machine-readable key (e.g. `movie_result`, `experiment_summary`)                                                                                                        |
| `template_category`   | text            | Dispatch category: `movie`, `experiment`, `wheel`, `stats`, `server`, or `generic`. Determines which renderer builds the embed. Inferred from `template_key` prefix when unset |
| `name`                | text            | Human-readable display name                                                                                                                                                    |
| `description`         | text            | Optional notes                                                                                                                                                                 |
| `title_format`        | text            | Embed title — supports `{{token}}` substitution (e.g. `{{experiment.name}}`)                                                                                                   |
| `description_format`  | text (longtext) | Embed body — supports `{{token}}` substitution. Truncated to 4096 chars                                                                                                        |
| `accent_color`        | text            | Hex color for the embed accent bar (e.g. `#1E90FF`)                                                                                                                            |
| `footer_text`         | text            | Footer line — supports `{{token}}` substitution                                                                                                                                |
| `embed_url_enabled`   | bool            | Make embed title a hyperlink (requires url token)                                                                                                                              |
| `footer_icon_enabled` | bool            | Append BadMovies.co icon to footer                                                                                                                                             |
| `thumbnail_enabled`   | bool            | Show poster/small image thumbnail                                                                                                                                              |
| `image_enabled`       | bool            | Show large banner/backdrop image                                                                                                                                               |
| `timestamp_enabled`   | bool            | Append Discord timestamp to footer                                                                                                                                             |
| `show_tagline`        | bool            | Movie: tagline field. Experiment: result text                                                                                                                                  |
| `show_meta`           | bool            | Movie: Released/Runtime/MPAA row. Experiment: Date + Movie count. Wheel: Date added. Stats: aggregate fields. Server: member count                                             |
| `show_studio`         | bool            | Movie: studio field. Stats: latest experiment                                                                                                                                  |
| `show_budget`         | bool            | Movie: budget/revenue row                                                                                                                                                      |
| `show_director`       | bool            | Movie: director field. Experiment: host. Wheel: suggested by. Stats: top actor + director                                                                                      |
| `show_writers`        | bool            | Movie: writers field                                                                                                                                                           |
| `show_actors`         | bool            | Movie: actors field. Experiment: notes. Server: channel list                                                                                                                   |
| `show_rating`         | bool            | Movie: TMDb rating. Wheel: vote count                                                                                                                                          |
| `show_imdb_rating`    | bool            | Movie: IMDb rating (requires `show_rating`)                                                                                                                                    |
| `show_genres`         | bool            | Movie: genres field. Experiment: movie lineup + buttons. Stats: top decade                                                                                                     |
| `show_external_links` | bool            | Movie: BadMovies.co/TMDb/IMDb links. Experiment: BadMovies.co URL. Wheel: IMDb/TMDb links                                                                                      |
| `buttons`             | text (longtext) | JSON-serialised `TemplateButtonConfig[]` array — see button format docs below                                                                                                  |
| `list_item_format`    | text            | Per-item format for list templates. Split by `                                                                                                                                 |     | `: left=field name, right=field value. Both support `{{token}}` substitution per-item. Max 24 fields + overflow indicator |

> **Button types:**
>
> - **`link`** — opens a URL. Required: `url` (supports `{{token}}` substitution). Renders as a `ButtonStyle.Link` component.
> - **`action`** — dispatches a bot action when clicked. Required: `action_key` (references `sm_button_actions.action_key`). Optional: `ctx_template` (token-substituted value encoded in the Discord `customId` as `tpb_{action_key}|{ctx}`). Handled by `InteractionHandler` → `ButtonActionService` → `ToolRouter`.

> **How `sm_instruction_sets.response_templates` relates:**
>
> - Previously stored the full JSON structure for response templates. Now stores a JSON `string[]` of enabled `template_key` values for that profile.
> - `[]` (empty array) = all global templates are enabled for this profile.
> - `["movie-lookup", "experiment-lookup"]` = only those two templates are active.
> - The bot reads `sm_discord_templates` records at runtime and filters by this list.

---

## `sm_button_actions`

**Purpose:** Definitions for interactive template buttons (type: `action`). Each record maps a unique `action_key` to an `AIAction` type and a parameterised template. When a user clicks an action button on an embed, `InteractionHandler` looks up the `action_key` here, substitutes `{{button.ctx}}` with the value encoded in the button's `customId`, builds the `AIAction`, and routes it through `ToolRouter`. Hot-reloaded via PocketBase realtime subscription — no restart required.

| Field                   | Type            | Notes                                                                                                                                                                     |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action_key`            | text            | Unique key referenced by `TemplateButtonConfig.action_key` (e.g. `show_experiment_for_movie`)                                                                             |
| `name`                  | text            | Human-readable name shown in the admin UI                                                                                                                                 |
| `description`           | text            | Optional notes about what this action does                                                                                                                                |
| `action_type`           | text            | The `AIAction.type` value to dispatch (e.g. `find_experiment_by_movie`, `get_movie_reviews`)                                                                              |
| `params_template`       | text (longtext) | JSON object template for the AIAction params. Use `{{button.ctx}}` as a placeholder for the value encoded in the button's `customId` (e.g. `{"query": "{{button.ctx}}"}`) |
| `response_template_key` | text            | Optional `template_key` override — when set, the result is rendered with this discord template instead of the router's default                                            |
| `enabled`               | bool            | Only enabled actions are loaded into `ButtonActionService`. Disable to deactivate a button without deleting its definition                                                |
