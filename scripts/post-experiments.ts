/**
 * scripts/post-experiments.ts
 *
 * One-off script: fetches every experiment from the BadMovies.co database
 * (oldest → newest) and posts each as a Discord embed into a target channel.
 *
 * Rate limits: discord.js REST handles 429 retries automatically.
 * An additional MIN_DELAY_MS pause between posts keeps the channel bucket healthy.
 *
 * Dedup: posted experiment slugs/URLs are tracked in scripts/.posted-experiments.json.
 * Re-running the script safely skips already-posted experiments and picks up
 * where it left off if a previous run was interrupted.
 *
 * Usage:
 *   npm run script:post-experiments
 *
 * Prerequisites:
 *   - .env file with DISCORD_BOT_TOKEN, BADMOVIES_PGHOST/PORT/DATABASE/USER/PASSWORD
 *   - Set CHANNEL_ID below to the target Discord channel ID
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { REST, Routes, EmbedBuilder } from 'discord.js';
import { BadMoviesDbClient } from '../src/lib/badmovies-db.js';
import { CacheManager } from '../src/lib/cache-manager.js';
import type { NormalizedExperiment } from '../src/lib/models/movie.js';
import { Colors, BADMOVIES_ICON } from '../embed-kit.js';

// ── Configuration ──────────────────────────────────────────────────────────────

/** The Discord channel ID to post experiments into. */
const CHANNEL_ID = '1502439421339893801';

/**
 * Minimum pause in ms between successive posts.
 * Discord allows ~5 messages/s per channel; 1100ms keeps well under that.
 */
const MIN_DELAY_MS = 1100;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEDUP_FILE = join(__dirname, '.posted-experiments.json');

// ── Env helpers ────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
	const val = process.env[name];
	if (!val) throw new Error(`Missing required environment variable: ${name}`);
	return val;
}

// ── Dedup helpers ──────────────────────────────────────────────────────────────

function loadPosted(): Set<string> {
	if (!existsSync(DEDUP_FILE)) return new Set();
	try {
		const data = JSON.parse(readFileSync(DEDUP_FILE, 'utf-8')) as string[];
		return new Set(data);
	} catch {
		return new Set();
	}
}

function savePosted(posted: Set<string>): void {
	writeFileSync(DEDUP_FILE, JSON.stringify([...posted], null, 2));
}

/** Stable key for dedup: prefer the URL (contains slug), fall back to the name. */
function dedupKey(exp: NormalizedExperiment): string {
	return exp.url ?? exp.name;
}

// ── Embed builder ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
	if (!dateStr) return 'Unknown';
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return String(dateStr);
	return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildExperimentEmbed(exp: NormalizedExperiment): {
	embeds: EmbedBuilder[];
} {
	const embed = new EmbedBuilder()
		.setColor(Colors.DodgerBlue)
		.setTitle(exp.name || 'Unknown Experiment')
		.setDescription(exp.result || 'Experiment details available in the archives.');

	// Row 1 — Date / Movie count / Host (all inline)
	const statsRow: { name: string; value: string; inline: boolean }[] = [
		{ name: 'Date', value: formatDate(exp.date), inline: true },
		{ name: 'Movies', value: String(exp.movies?.length ?? 0), inline: true }
	];
	if (exp.host) statsRow.push({ name: 'Host', value: exp.host, inline: true });
	embed.addFields(...statsRow);

	// Featured Movies — numbered list with year, hard capped at Discord's 1024-char field limit
	if (exp.movies && exp.movies.length > 0) {
		const lineup = exp.movies
			.map((m, i) => {
				const yearSuffix = m.year ? ` (${m.year})` : '';
				return `**Movie ${i + 1}:** ${m.title}${yearSuffix}`;
			})
			.join('\n')
			.slice(0, 1024);
		embed.addFields({ name: 'Featured Movies', value: lineup, inline: false });
	}

	// Link field
	if (exp.url) {
		embed.addFields({
			name: 'View on BadMovies.co',
			value: `[${exp.name}](${exp.url})`,
			inline: false
		});
	}

	if (exp.bannerUrl) embed.setImage(exp.bannerUrl);

	embed.setFooter({ text: 'BadMovies.co • Movie Night Experiments', iconURL: BADMOVIES_ICON });

	return { embeds: [embed] };
}

// ── Utilities ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	if (CHANNEL_ID === 'YOUR_CHANNEL_ID_HERE') {
		console.error(
			'ERROR: Set CHANNEL_ID at the top of scripts/post-experiments.ts before running.'
		);
		process.exit(1);
	}

	const DISCORD_BOT_TOKEN = requireEnv('DISCORD_BOT_TOKEN');
	const PG_HOST = requireEnv('BADMOVIES_PGHOST');
	const PG_PORT = Number(requireEnv('BADMOVIES_PGPORT'));
	const PG_DATABASE = requireEnv('BADMOVIES_PGDATABASE');
	const PG_USER = requireEnv('BADMOVIES_PGUSER');
	const PG_PASSWORD = requireEnv('BADMOVIES_PGPASSWORD');
	const PG_SSL = process.env['BADMOVIES_PGSSL'] !== 'false';

	// Connect to the database
	const db = new BadMoviesDbClient(
		{
			host: PG_HOST,
			port: PG_PORT,
			database: PG_DATABASE,
			user: PG_USER,
			password: PG_PASSWORD,
			ssl: PG_SSL
		},
		new CacheManager(3600)
	);

	console.log('Fetching experiments...');
	const experiments = await db.getExperiments();
	console.log(`Found ${experiments.length} experiments.`);

	// Sort oldest → newest
	const sorted = [...experiments].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	// Filter out already-posted entries
	const posted = loadPosted();
	const remaining = sorted.filter((e) => !posted.has(dedupKey(e)));

	console.log(`Already posted: ${posted.size}. Remaining to post: ${remaining.length}.`);

	if (remaining.length === 0) {
		console.log('All experiments already posted. Nothing to do.');
		process.exit(0);
	}

	const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

	for (let i = 0; i < remaining.length; i++) {
		const exp = remaining[i];
		const label = `[${i + 1}/${remaining.length}] ${exp.name} (${exp.date})`;

		console.log(`Posting ${label}...`);

		const { embeds } = buildExperimentEmbed(exp);

		await rest.post(Routes.channelMessages(CHANNEL_ID), {
			body: {
				embeds: embeds.map((e) => e.toJSON())
			}
		});

		// Persist dedup state immediately so a crash mid-run is safely resumable
		posted.add(dedupKey(exp));
		savePosted(posted);

		console.log(`  ✓ Done.`);

		// Pause between posts — skip the delay after the final message
		if (i < remaining.length - 1) {
			await sleep(MIN_DELAY_MS);
		}
	}

	console.log(`\nFinished — posted ${remaining.length} experiment(s) to channel ${CHANNEL_ID}.`);
	process.exit(0);
}

try {
	await main();
} catch (err) {
	console.error('Fatal error:', err);
	process.exit(1);
}
