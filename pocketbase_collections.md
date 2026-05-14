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

---

## `sm_embed_templates`

**Purpose:** Fully configurable Discord embed templates used by the bot to compose and render message embeds. Each template maps to a bot command context via its `template_key` field. The bot looks up the active template (`is_active=true`) for each key at runtime and constructs a Discord embed following the [Discord Embed Object specification](https://discord.com/developers/docs/resources/message#embed-object). Polled alongside `sm_instruction_sets` on the `instruction_refresh_interval_ms` cycle for hot-reloading.

**Template resolution:** The bot queries `sm_embed_templates` filtered by `template_key` and `is_active=true`. Only one template per key should be active at a time. The admin panel enforces this via the "Set Active" action (deactivates all other templates sharing the same key). If no active template is found for a key, the bot should fall back to a hardcoded minimal embed.

**Variable substitution:** All text fields support `{{variable.path}}` placeholders. The bot replaces these at runtime with live data before sending the embed. See the Variable Catalog appendix for available variables per template key.

### Metadata Fields

| Field          | Type | Required | Notes                                                                                     |
| -------------- | ---- | -------- | ----------------------------------------------------------------------------------------- |
| `name`         | text | ✅        | Human-readable display name (e.g. "Movie Lookup", "Compact Review")                        |
| `description`  | text |          | Optional notes describing when/how this template is used                                   |
| `template_key` | text | ✅        | Bot command context key (e.g. `movie-lookup`, `experiment-lookup`, `review`, `quote`, `no-results`, `error`, `wheel-spin`, `help`). The bot filters by this key to find the active template for a given command. |
| `is_active`    | bool |          | Only one template per `template_key` should be active. The bot uses the active one.        |

### Author Block

Corresponds to the [Discord Embed Author Object](https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure).

| Field             | Type | Notes                                                                                      |
| ----------------- | ---- | ------------------------------------------------------------------------------------------ |
| `author_enabled`  | bool | When `false`, the entire author row is omitted from the embed                              |
| `author_name`     | text | Display name for the author line. Supports `{{variables}}`                                 |
| `author_url`      | text | URL the author name links to. Supports `{{variables}}`                                     |
| `author_icon_url` | text | Small icon shown left of the author name. Supports `{{variables}}`. Discord requires HTTPS. |

### Content Block

| Field                 | Type   | Notes                                                                                                           |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `title_enabled`       | bool   | When `false`, the embed title is omitted                                                                        |
| `title_text`          | text   | Embed title text. Supports `{{variables}}`. Max 256 characters (Discord limit).                                  |
| `description_enabled` | bool   | When `false`, the embed description is omitted                                                                  |
| `description_text`    | text   | Embed description body. Supports `{{variables}}`. Max 4096 characters (Discord limit). Stored as `longtext`.     |
| `url_enabled`         | bool   | When `true` AND `title_enabled=true`, the title becomes a clickable hyperlink to this URL                       |
| `url_text`            | text   | The URL the title links to. Supports `{{variables}}`. Only used when `url_enabled=true`.                        |

### Color

| Field   | Type | Notes                                                                              |
| ------- | ---- | ---------------------------------------------------------------------------------- |
| `color` | text | Hex color string (e.g. `#5865F2`). Required. This is the left color strip on the embed. Use Discord's `color` field (integer). The bot must convert the hex string to an integer: `parseInt(color.slice(1), 16)`. |

### Timestamp

| Field               | Type | Notes                                                                  |
| ------------------- | ---- | ---------------------------------------------------------------------- |
| `timestamp_enabled` | bool | When `true`, the embed includes a timestamp in the footer area         |

### Footer Block

Corresponds to the [Discord Embed Footer Object](https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure).

| Field             | Type | Notes                                                                                      |
| ----------------- | ---- | ------------------------------------------------------------------------------------------ |
| `footer_enabled`  | bool | When `false`, the entire footer is omitted                                                 |
| `footer_text`     | text | Footer text. Supports `{{variables}}`. Max 2048 characters (Discord limit).                 |
| `footer_icon_url` | text | Small icon shown left of the footer text. Supports `{{variables}}`. Discord requires HTTPS. |

### Media Block

Corresponds to the [Discord Embed Thumbnail](https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure) and [Embed Image](https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure) structures.

| Field               | Type | Notes                                                                     |
| ------------------- | ---- | ------------------------------------------------------------------------- |
| `thumbnail_enabled` | bool | When `false`, the thumbnail is omitted                                    |
| `thumbnail_url`     | text | URL for the thumbnail image (small, right-aligned). Supports `{{variables}}`. Discord requires HTTPS. |
| `image_enabled`     | bool | When `false`, the large image is omitted                                  |
| `image_url`         | text | URL for the large image (full-width below content). Supports `{{variables}}`. Discord requires HTTPS. |

### Inline Fields

Corresponds to the [Discord Embed Field Object](https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure). Up to 25 fields per embed.

| Field         | Type | Notes                                                                                                                               |
| ------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `fields_json` | text | JSON array of field objects: `[{"name":"...","value":"...","inline":true}]`. Stored as `longtext`. Max 25 elements (Discord limit). |

Each field object:
- `name` (string): Field name. Max 256 characters. Supports `{{variables}}`.
- `value` (string): Field value. Max 1024 characters. Supports `{{variables}}`.
- `inline` (boolean): When `true`, the field renders side-by-side with other inline fields. When `false`, it takes the full width.

---

## Variable Catalog

Common variables available in **all** embed templates:

| Variable         | Description                          | Source       |
| ---------------- | ------------------------------------ | ------------ |
| `{{user}}`       | Discord username of the requester    | Discord      |
| `{{user.mention}}` | Discord @mention of the requester  | Discord      |
| `{{server.name}}`  | Discord server name                | Discord      |
| `{{timestamp}}`    | Current ISO 8601 timestamp         | Bot          |

### `movie-lookup`

| Variable                | Description                     | Source        |
| ----------------------- | ------------------------------- | ------------- |
| `{{movie.title}}`       | Movie title                     | BadMovies DB  |
| `{{movie.year}}`        | Release year                    | BadMovies DB  |
| `{{movie.overview}}`    | Short plot summary              | BadMovies DB  |
| `{{movie.releaseDate}}` | Full release date               | BadMovies DB  |
| `{{movie.runtime}}`     | Runtime in minutes              | BadMovies DB  |
| `{{movie.rating}}`      | Content rating (R, PG-13, etc.) | BadMovies DB  |
| `{{movie.imdbRating}}`  | IMDb score out of 10            | BadMovies DB  |
| `{{movie.revenue}}`     | Box office revenue              | BadMovies DB  |
| `{{movie.director}}`    | Director name(s)                | BadMovies DB  |
| `{{movie.writers}}`     | Writer name(s)                  | BadMovies DB  |
| `{{movie.actors}}`      | Lead actors                     | BadMovies DB  |
| `{{movie.genres}}`      | Associated genres               | BadMovies DB  |
| `{{movie.badmoviesUrl}}`| Link to BadMovies.co entry      | BadMovies DB  |
| `{{movie.imdbUrl}}`     | Link to IMDb page               | BadMovies DB  |
| `{{movie.posterUrl}}`   | Poster image URL                | BadMovies DB  |
| `{{movie.tmdbId}}`      | TMDb numeric ID                 | BadMovies DB  |
| `{{movie.slug}}`        | URL slug                        | BadMovies DB  |

### `experiment-lookup`

| Variable                  | Description                  | Source        |
| ------------------------- | ---------------------------- | ------------- |
| `{{experiment.number}}`   | Experiment episode number    | BadMovies DB  |
| `{{experiment.date}}`     | Date of the experiment       | BadMovies DB  |
| `{{experiment.movies}}`   | List of movies watched       | BadMovies DB  |
| `{{experiment.host}}`     | Host of the experiment       | BadMovies DB  |
| `{{experiment.url}}`      | Link to experiment details   | BadMovies DB  |
| `{{experiment.imageUrl}}` | Thumbnail for the experiment | BadMovies DB  |
| `{{experiment.slug}}`     | URL slug                     | BadMovies DB  |

### `review`

| Variable               | Description                     | Source        |
| ---------------------- | ------------------------------- | ------------- |
| `{{review.author}}`    | Review author name              | BadMovies DB  |
| `{{review.rating}}`    | Review rating/score             | BadMovies DB  |
| `{{review.content}}`   | Full review text                | BadMovies DB  |
| `{{review.date}}`      | Review date                     | BadMovies DB  |
| `{{review.movieTitle}}`| Title of the reviewed movie     | BadMovies DB  |
| `{{review.movieUrl}}`  | Link to the movie               | BadMovies DB  |
| `{{review.url}}`       | Link to the review              | BadMovies DB  |

### `quote`

| Variable             | Description                          | Source        |
| -------------------- | ------------------------------------ | ------------- |
| `{{quote.text}}`     | The quote text                       | BadMovies DB  |
| `{{quote.movie}}`    | Movie the quote is from              | BadMovies DB  |
| `{{quote.character}}`| Character who said it                | BadMovies DB  |
| `{{quote.actor}}`    | Actor who played the character       | BadMovies DB  |
| `{{quote.year}}`     | Year of the movie                    | BadMovies DB  |
| `{{quote.url}}`      | Link to the quote                    | BadMovies DB  |

### `wheel-spin`

| Variable                | Description                     | Source        |
| ----------------------- | ------------------------------- | ------------- |
| `{{wheel.title}}`       | Movie title from wheel          | Wheel (PB)    |
| `{{wheel.year}}`        | Release year                    | Wheel (PB)    |
| `{{wheel.tmdbId}}`      | TMDb numeric ID                 | Wheel (PB)    |
| `{{wheel.imdbId}}`      | IMDb tt-ID                      | Wheel (PB)    |
| `{{wheel.suggestedBy}}` | User who added the movie        | Wheel (PB)    |
| `{{wheel.dateAdded}}`   | Date added to the wheel         | Wheel (PB)    |

### `no-results`

| Variable      | Description                              | Source   |
| ------------- | ---------------------------------------- | -------- |
| `{{query}}`   | The search query that returned no results | Discord  |
| `{{source}}`  | Where the search was performed            | Discord  |

### `error`

| Variable            | Description                           | Source   |
| ------------------- | ------------------------------------- | -------- |
| `{{error.message}}` | Error description                     | Bot      |
| `{{error.command}}` | The command that caused the error     | Bot      |
| `{{error.context}}` | Additional error context              | Bot      |

### `help`

| Variable          | Description                  | Source      |
| ----------------- | ---------------------------- | ----------- |
| `{{bot.name}}`    | Bot display name             | Bot Config  |
| `{{bot.commands}}`| Formatted command list       | Bot         |
| `{{bot.prefix}}`  | Command prefix               | Bot Config  |

---

## Discord Embed Limits Reference

The admin panel displays these limits to template authors. The bot should also validate against them when constructing embeds.

| Constraint      | Limit                        |
| --------------- | ---------------------------- |
| Title           | 256 characters               |
| Description     | 4096 characters              |
| Field Name      | 256 characters               |
| Field Value     | 1024 characters              |
| Max Fields      | 25 fields per embed          |
| Footer Text     | 2048 characters              |
| Author Name     | 256 characters               |
| Total Embed     | 6000 characters (all fields combined) |
| Embeds per msg  | 10 embeds maximum            |

> **Note:** All URLs in embeds (author icon, thumbnail, image, footer icon) must use HTTPS. The Discord API rejects non-HTTPS URLs.
