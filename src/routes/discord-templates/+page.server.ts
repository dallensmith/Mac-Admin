import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// ── Variable Catalog ──────────────────────────────────────────────────────────

interface VariableDef {
	name: string;
	description: string;
	source: string;
}

const VARIABLE_CATALOG: Record<string, VariableDef[]> = {
	'movie-lookup': [
		{ name: 'movie.title', description: 'Movie title', source: 'BadMovies DB' },
		{ name: 'movie.year', description: 'Release year', source: 'BadMovies DB' },
		{ name: 'movie.overview', description: 'Short plot summary', source: 'BadMovies DB' },
		{ name: 'movie.tagline', description: 'Movie tagline / slogan', source: 'BadMovies DB' },
		{ name: 'movie.releaseDate', description: 'Full release date', source: 'BadMovies DB' },
		{ name: 'movie.runtime', description: 'Runtime in minutes', source: 'BadMovies DB' },
		{ name: 'movie.rating', description: 'Content rating (e.g. R, PG-13)', source: 'BadMovies DB' },
		{ name: 'movie.mpaaRating', description: 'MPAA rating', source: 'BadMovies DB' },
		{ name: 'movie.imdbRating', description: 'IMDb score out of 10', source: 'BadMovies DB' },
		{ name: 'movie.imdbVotes', description: 'Number of IMDb votes', source: 'BadMovies DB' },
		{ name: 'movie.tmdbRating', description: 'TMDb rating', source: 'BadMovies DB' },
		{ name: 'movie.tmdbVotes', description: 'TMDb vote count', source: 'BadMovies DB' },
		{ name: 'movie.budget', description: 'Production budget', source: 'BadMovies DB' },
		{ name: 'movie.revenue', description: 'Box office revenue', source: 'BadMovies DB' },
		{ name: 'movie.studio', description: 'Production studio', source: 'BadMovies DB' },
		{ name: 'movie.director', description: 'Director name(s)', source: 'BadMovies DB' },
		{ name: 'movie.writers', description: 'Writer name(s)', source: 'BadMovies DB' },
		{ name: 'movie.actors', description: 'Lead actors', source: 'BadMovies DB' },
		{ name: 'movie.genres', description: 'Associated genres', source: 'BadMovies DB' },
		{ name: 'movie.badmoviesUrl', description: 'Link to BadMovies.co entry', source: 'BadMovies DB' },
		{ name: 'movie.imdbUrl', description: 'Link to IMDb page', source: 'BadMovies DB' },
		{ name: 'movie.posterUrl', description: 'Poster image URL', source: 'BadMovies DB' },
		{ name: 'movie.trailerUrl', description: 'YouTube trailer URL', source: 'BadMovies DB' },
		{ name: 'movie.tmdbId', description: 'TMDb numeric ID', source: 'BadMovies DB' },
		{ name: 'movie.imdbId', description: 'IMDb tt-ID', source: 'BadMovies DB' },
		{ name: 'movie.slug', description: 'URL slug', source: 'BadMovies DB' },
		{ name: 'movie.reviewCount', description: 'Number of approved reviews', source: 'BadMovies DB' },
		{ name: 'movie.quoteCount', description: 'Number of approved quotes', source: 'BadMovies DB' },
		{ name: 'movie.appearances', description: 'Number of experiments featuring this movie', source: 'BadMovies DB' }
	],
	'experiment-lookup': [
		{ name: 'experiment.number', description: 'Experiment episode number', source: 'BadMovies DB' },
		{ name: 'experiment.title', description: 'Full experiment title', source: 'BadMovies DB' },
		{ name: 'experiment.date', description: 'Date of the experiment', source: 'BadMovies DB' },
		{ name: 'experiment.host', description: 'Host of the experiment', source: 'BadMovies DB' },
		{ name: 'experiment.totalMovies', description: 'Number of movies watched', source: 'BadMovies DB' },
		{ name: 'experiment.movies', description: 'List of movies watched (comma-separated)', source: 'BadMovies DB' },
		{ name: 'experiment.movieList', description: 'Formatted bullet list of movie titles', source: 'BadMovies DB' },
		{ name: 'experiment.notes', description: 'Experiment notes / description', source: 'BadMovies DB' },
		{ name: 'experiment.url', description: 'Link to experiment details', source: 'BadMovies DB' },
		{ name: 'experiment.imageUrl', description: 'Thumbnail / banner image URL', source: 'BadMovies DB' },
		{ name: 'experiment.bannerUrl', description: 'Banner image URL', source: 'BadMovies DB' },
		{ name: 'experiment.slug', description: 'URL slug', source: 'BadMovies DB' }
	],
	review: [
		{ name: 'review.author', description: 'Review author name', source: 'BadMovies DB' },
		{ name: 'review.rating', description: 'Review rating / score', source: 'BadMovies DB' },
		{ name: 'review.content', description: 'Full review text', source: 'BadMovies DB' },
		{ name: 'review.date', description: 'Review date', source: 'BadMovies DB' },
		{ name: 'review.movieTitle', description: 'Title of the reviewed movie', source: 'BadMovies DB' },
		{ name: 'review.movieUrl', description: 'Link to the movie', source: 'BadMovies DB' },
		{ name: 'review.url', description: 'Link to the review', source: 'BadMovies DB' },
		{ name: 'review.ratingGood', description: 'Rating: Is it good? (0-10)', source: 'BadMovies DB' },
		{ name: 'review.ratingEntertainment', description: 'Rating: Entertainment value (0-10)', source: 'BadMovies DB' },
		{ name: 'review.ratingSoBadItsGood', description: 'Rating: So bad it\'s good (0-10)', source: 'BadMovies DB' },
		{ name: 'review.ratingMemePotential', description: 'Rating: Meme potential (0-10)', source: 'BadMovies DB' },
		{ name: 'review.weightedScore', description: 'Computed weighted score', source: 'BadMovies DB' },
		{ name: 'review.status', description: 'Approval status', source: 'BadMovies DB' }
	],
	quote: [
		{ name: 'quote.text', description: 'The quote text', source: 'BadMovies DB' },
		{ name: 'quote.movie', description: 'Movie the quote is from', source: 'BadMovies DB' },
		{ name: 'quote.character', description: 'Character who said it', source: 'BadMovies DB' },
		{ name: 'quote.actor', description: 'Actor who played the character', source: 'BadMovies DB' },
		{ name: 'quote.year', description: 'Year of the movie', source: 'BadMovies DB' },
		{ name: 'quote.url', description: 'Link to the quote', source: 'BadMovies DB' },
		{ name: 'quote.context', description: 'Quote context / description', source: 'BadMovies DB' },
		{ name: 'quote.likes', description: 'Like count', source: 'BadMovies DB' },
		{ name: 'quote.isMemorable', description: 'Whether marked as memorable', source: 'BadMovies DB' },
		{ name: 'quote.movieSlug', description: 'Movie URL slug', source: 'BadMovies DB' },
		{ name: 'quote.movieUrl', description: 'Full movie page URL', source: 'BadMovies DB' }
	],
	'no-results': [
		{ name: 'query', description: 'The search query that returned nothing', source: 'Discord' },
		{ name: 'source', description: 'Where the search was performed', source: 'Discord' }
	],
	error: [
		{ name: 'error.message', description: 'Error description', source: 'Bot' },
		{ name: 'error.command', description: 'The command that caused the error', source: 'Bot' },
		{ name: 'error.context', description: 'Additional error context', source: 'Bot' }
	],
	'wheel-spin': [
		{ name: 'wheel.title', description: 'Movie title from wheel', source: 'Wheel (PB)' },
		{ name: 'wheel.year', description: 'Release year', source: 'Wheel (PB)' },
		{ name: 'wheel.tmdbId', description: 'TMDb numeric ID', source: 'Wheel (PB)' },
		{ name: 'wheel.imdbId', description: 'IMDb tt-ID', source: 'Wheel (PB)' },
		{ name: 'wheel.suggestedBy', description: 'User who added the movie', source: 'Wheel (PB)' },
		{ name: 'wheel.dateAdded', description: 'Date added to the wheel', source: 'Wheel (PB)' },
		{ name: 'wheel.voters', description: 'Comma-separated voter IDs', source: 'Wheel (PB)' },
		{ name: 'wheel.voteCount', description: 'Number of votes', source: 'Wheel (PB)' }
	],
	help: [
		{ name: 'bot.name', description: 'Bot display name', source: 'Bot Config' },
		{ name: 'bot.commands', description: 'Formatted command list', source: 'Bot' },
		{ name: 'bot.prefix', description: 'Command prefix', source: 'Bot Config' }
	]
};

// Common variables available in all templates
const COMMON_VARIABLES: VariableDef[] = [
	{ name: 'user', description: 'Discord username of the requester', source: 'Discord' },
	{ name: 'user.mention', description: 'Discord @mention of the requester', source: 'Discord' },
	{ name: 'server.name', description: 'Discord server name', source: 'Discord' },
	{ name: 'timestamp', description: 'Current ISO timestamp', source: 'Bot' }
];

// ── Load ─────────────────────────────────────────────────────────────────────

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	// Fetch without sort — PocketBase has a bug where sorting by updated/created
	// returns 400 after a fresh Docker volume creation. Sort client-side instead.
	const result = await locals.adminPb.collection('sm_embed_templates').getList(1, 10000);
	const templates = result.items.sort((a, b) => {
		const au = typeof a.updated === 'string' ? a.updated : '';
		const bu = typeof b.updated === 'string' ? b.updated : '';
		return bu.localeCompare(au);
	});

	return {
		templates,
		variableCatalog: VARIABLE_CATALOG,
		commonVariables: COMMON_VARIABLES
	};
};

// ── Form field helpers ───────────────────────────────────────────────────────

/**
 * Reads a boolean from FormData — treats "true"/"on"/"1" as true.
 */
function getBool(data: FormData, key: string): boolean {
	const val = data.get(key);
	if (val === null) return false;
	if (typeof val === 'string') return val === 'true' || val === 'on' || val === '1';
	return false;
}

/**
 * Reads a string from FormData, coalescing null to ''.
 */
function getStr(data: FormData, key: string): string {
	const val = data.get(key);
	return typeof val === 'string' ? val : '';
}

// ── Actions ──────────────────────────────────────────────────────────────────

export const actions: Actions = {
	create: async ({ locals }) => {
		if (!locals.user) redirect(302, '/login');

		await locals.adminPb.collection('sm_embed_templates').create({
			name: 'New Template',
			description: '',
			template_key: 'custom',
			is_active: false,
			author_enabled: false,
			author_name: '',
			author_url: '',
			author_icon_url: '',
			title_enabled: true,
			title_text: '',
			description_enabled: true,
			description_text: '',
			url_enabled: false,
			url_text: '',
			color: '#5865F2',
			timestamp_enabled: false,
			footer_enabled: false,
			footer_text: '',
			footer_icon_url: '',
			thumbnail_enabled: false,
			thumbnail_url: '',
			image_enabled: false,
			image_url: '',
			fields_json: '[]'
		});
	},

	update: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		await locals.adminPb.collection('sm_embed_templates').update(id, {
			name: getStr(data, 'name'),
			description: getStr(data, 'description'),
			template_key: getStr(data, 'template_key'),
			is_active: getBool(data, 'is_active'),
			// Author
			author_enabled: getBool(data, 'author_enabled'),
			author_name: getStr(data, 'author_name'),
			author_url: getStr(data, 'author_url'),
			author_icon_url: getStr(data, 'author_icon_url'),
			// Content
			title_enabled: getBool(data, 'title_enabled'),
			title_text: getStr(data, 'title_text'),
			description_enabled: getBool(data, 'description_enabled'),
			description_text: getStr(data, 'description_text'),
			url_enabled: getBool(data, 'url_enabled'),
			url_text: getStr(data, 'url_text'),
			// Color
			color: getStr(data, 'color') || '#5865F2',
			// Timestamp
			timestamp_enabled: getBool(data, 'timestamp_enabled'),
			// Footer
			footer_enabled: getBool(data, 'footer_enabled'),
			footer_text: getStr(data, 'footer_text'),
			footer_icon_url: getStr(data, 'footer_icon_url'),
			// Media
			thumbnail_enabled: getBool(data, 'thumbnail_enabled'),
			thumbnail_url: getStr(data, 'thumbnail_url'),
			image_enabled: getBool(data, 'image_enabled'),
			image_url: getStr(data, 'image_url'),
			// Fields
			fields_json: getStr(data, 'fields_json')
		});
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		await locals.adminPb.collection('sm_embed_templates').delete(id);
	},

	duplicate: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const source = await locals.adminPb.collection('sm_embed_templates').getOne(id);
		await locals.adminPb.collection('sm_embed_templates').create({
			name: (source.name ?? 'Template') + ' (Copy)',
			description: source.description ?? '',
			template_key: source.template_key ?? 'custom',
			is_active: false,
			author_enabled: source.author_enabled ?? false,
			author_name: source.author_name ?? '',
			author_url: source.author_url ?? '',
			author_icon_url: source.author_icon_url ?? '',
			title_enabled: source.title_enabled ?? true,
			title_text: source.title_text ?? '',
			description_enabled: source.description_enabled ?? true,
			description_text: source.description_text ?? '',
			url_enabled: source.url_enabled ?? false,
			url_text: source.url_text ?? '',
			color: source.color ?? '#5865F2',
			timestamp_enabled: source.timestamp_enabled ?? false,
			footer_enabled: source.footer_enabled ?? false,
			footer_text: source.footer_text ?? '',
			footer_icon_url: source.footer_icon_url ?? '',
			thumbnail_enabled: source.thumbnail_enabled ?? false,
			thumbnail_url: source.thumbnail_url ?? '',
			image_enabled: source.image_enabled ?? false,
			image_url: source.image_url ?? '',
			fields_json: source.fields_json ?? '[]'
		});
	},

	setActive: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') return fail(422, { error: 'ID required' });

		const target = await locals.adminPb.collection('sm_embed_templates').getOne(id);
		const templateKey = target.template_key as string;

		// Deactivate all other templates with the same key
		const all = await locals.adminPb.collection('sm_embed_templates').getFullList({
			filter: `template_key = "${templateKey}"`
		});
		for (const t of all) {
			if (t.id === id) {
				await locals.adminPb.collection('sm_embed_templates').update(t.id, { is_active: true });
			} else if (t.is_active) {
				await locals.adminPb.collection('sm_embed_templates').update(t.id, { is_active: false });
			}
		}
	}
};
