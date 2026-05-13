import {
	pgTable,
	index,
	foreignKey,
	serial,
	integer,
	varchar,
	numeric,
	text,
	timestamp,
	json,
	boolean,
	bigint,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const movieActors = pgTable(
	'movie_actors',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		personId: integer('person_id').notNull(),
		character: varchar({ length: 255 }),
		order: integer().default(0)
	},
	(table) => [
		index('idx_movie_actors_optimized')
			.using(
				'btree',
				table.movieId.asc().nullsLast().op('int4_ops'),
				table.order.asc().nullsLast().op('int4_ops')
			)
			.where(sql`("order" IS NOT NULL)`),
		index('movie_actors_movie_id_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops')
		),
		index('movie_actors_person_id_idx').using(
			'btree',
			table.personId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_actors_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: 'movie_actors_person_id_people_id_fk'
		}).onDelete('cascade')
	]
);

export const reviews = pgTable(
	'reviews',
	{
		id: serial().notNull(),
		userId: integer('user_id').notNull(),
		movieId: integer('movie_id').notNull(),
		ratingGood: numeric('rating_good', { precision: 3, scale: 1 }).notNull(),
		ratingEntertainment: numeric('rating_entertainment', { precision: 3, scale: 1 }).notNull(),
		ratingSoBadItIsGood: numeric('rating_so_bad_it_is_good', { precision: 3, scale: 1 }).notNull(),
		ratingMemePotential: numeric('rating_meme_potential', { precision: 3, scale: 1 }).notNull(),
		body: text(),
		status: varchar({ length: 20 }).default('pending'),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		index('reviews_created_at_idx').using(
			'btree',
			table.createdAt.asc().nullsLast().op('timestamp_ops')
		),
		index('reviews_movie_status_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops'),
			table.status.asc().nullsLast().op('int4_ops')
		),
		index('reviews_status_idx').using('btree', table.status.asc().nullsLast().op('text_ops')),
		index('reviews_user_movie_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('int4_ops'),
			table.movieId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'reviews_user_id_users_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'reviews_movie_id_movies_id_fk'
		}).onDelete('cascade')
	]
);

export const experimentMovies = pgTable(
	'experiment_movies',
	{
		id: serial().notNull(),
		experimentId: integer('experiment_id').notNull(),
		movieId: integer('movie_id').notNull(),
		order: integer().default(0).notNull()
	},
	(table) => [
		index('idx_experiment_movies_optimized').using(
			'btree',
			table.experimentId.asc().nullsLast().op('int4_ops'),
			table.movieId.asc().nullsLast().op('int4_ops'),
			table.order.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.experimentId],
			foreignColumns: [experiments.id],
			name: 'experiment_movies_experiment_id_experiments_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'experiment_movies_movie_id_movies_id_fk'
		}).onDelete('cascade')
	]
);

export const studios = pgTable(
	'studios',
	{
		id: serial().notNull(),
		name: varchar({ length: 255 }).notNull(),
		tmdbId: integer('tmdb_id'),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
		logoPath: varchar('logo_path', { length: 500 }),
		originCountry: varchar('origin_country', { length: 2 }),
		headquarters: varchar({ length: 255 }),
		parentCompany: varchar('parent_company', { length: 255 })
	},
	(table) => [
		index('idx_studios_name_search').using('btree', table.name.asc().nullsLast().op('text_ops'))
	]
);

export const userActivity = pgTable(
	'user_activity',
	{
		id: serial().notNull(),
		userId: integer('user_id').notNull(),
		action: varchar({ length: 100 }).notNull(),
		details: json(),
		ipAddress: varchar('ip_address', { length: 45 }),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'user_activity_user_id_users_id_fk'
		}).onDelete('cascade')
	]
);

export const profiles = pgTable(
	'profiles',
	{
		id: serial().notNull(),
		userId: integer('user_id').notNull(),
		username: varchar({ length: 50 }),
		fullName: varchar('full_name', { length: 255 }),
		website: varchar({ length: 500 }),
		bio: text(),
		avatarUrl: varchar('avatar_url', { length: 500 }),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'profiles_user_id_users_id_fk'
		}).onDelete('cascade')
	]
);

export const movieCountries = pgTable(
	'movie_countries',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		countryId: integer('country_id').notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_countries_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.countryId],
			foreignColumns: [countries.id],
			name: 'movie_countries_country_id_countries_id_fk'
		}).onDelete('cascade')
	]
);

export const passwordResets = pgTable(
	'password_resets',
	{
		id: serial().notNull(),
		userId: integer('user_id').notNull(),
		token: varchar({ length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
		usedAt: timestamp('used_at', { mode: 'string' }),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'password_resets_user_id_users_id_fk'
		}).onDelete('cascade')
	]
);

export const users = pgTable('users', {
	id: serial().notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user').notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
	passwordHash: varchar('password_hash', { length: 255 }),
	accountStatus: varchar('account_status', { length: 20 }).default('active'),
	lastLoginAt: timestamp('last_login_at', { mode: 'string' }),
	emailVerified: boolean('email_verified').default(false),
	emailVerifiedAt: timestamp('email_verified_at', { mode: 'string' }),
	preferences: json(),
	failedLoginAttempts: integer('failed_login_attempts').default(0),
	lockedUntil: timestamp('locked_until', { mode: 'string' }),
	specialTitle: varchar('special_title', { length: 100 }),
	pendingEmail: varchar('pending_email', { length: 255 }),
	pendingEmailToken: varchar('pending_email_token', { length: 255 }),
	pendingEmailExpiresAt: timestamp('pending_email_expires_at', { mode: 'string' })
});

export const attemptedStreamingMovies = pgTable('attempted_streaming_movies', {
	movieId: integer('movie_id').notNull(),
	attemptedAt: timestamp('attempted_at', { mode: 'string' }).defaultNow(),
	foundSources: boolean('found_sources').default(false)
});

export const listItems = pgTable(
	'list_items',
	{
		id: serial().notNull(),
		listId: integer('list_id').notNull(),
		movieId: integer('movie_id').notNull(),
		notes: text(),
		orderPosition: integer('order_position').default(0),
		addedAt: timestamp('added_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		index('idx_list_items_list_id').using('btree', table.listId.asc().nullsLast().op('int4_ops')),
		index('idx_list_items_list_order').using(
			'btree',
			table.listId.asc().nullsLast().op('int4_ops'),
			table.orderPosition.asc().nullsLast().op('int4_ops')
		),
		index('idx_list_items_movie_id').using('btree', table.movieId.asc().nullsLast().op('int4_ops')),
		index('idx_list_items_order').using(
			'btree',
			table.listId.asc().nullsLast().op('int4_ops'),
			table.orderPosition.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.listId],
			foreignColumns: [userLists.id],
			name: 'list_items_list_id_fkey'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'list_items_movie_id_fkey'
		}).onDelete('cascade')
	]
);

export const movieDirectors = pgTable(
	'movie_directors',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		personId: integer('person_id').notNull()
	},
	(table) => [
		index('movie_directors_movie_id_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops')
		),
		index('movie_directors_person_id_idx').using(
			'btree',
			table.personId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_directors_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: 'movie_directors_person_id_people_id_fk'
		}).onDelete('cascade')
	]
);

export const listFollows = pgTable(
	'list_follows',
	{
		id: serial().notNull(),
		followerId: integer('follower_id').notNull(),
		listId: integer('list_id').notNull(),
		followedAt: timestamp('followed_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_list_follows_follower').using(
			'btree',
			table.followerId.asc().nullsLast().op('int4_ops')
		),
		index('idx_list_follows_list').using('btree', table.listId.asc().nullsLast().op('int4_ops')),
		foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.id],
			name: 'list_follows_follower_user_id_fkey'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.listId],
			foreignColumns: [userLists.id],
			name: 'list_follows_list_id_fkey'
		}).onDelete('cascade')
	]
);

export const games = pgTable(
	'games',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		type: varchar({ length: 50 }).notNull(),
		title: varchar({ length: 255 }).notNull(),
		description: text(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
		status: varchar({ length: 50 }).default('approved'),
		userId: integer('user_id'),
		likes: integer().default(0)
	},
	(table) => [
		index('games_movie_id_created_at_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops'),
			table.createdAt.desc().nullsFirst().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'games_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'games_user_id_users_id_fk'
		}).onDelete('cascade')
	]
);

export const experiments = pgTable(
	'experiments',
	{
		id: serial().notNull(),
		experimentNumber: varchar('experiment_number', { length: 10 }).notNull(),
		title: varchar({ length: 255 }).notNull(),
		slug: varchar({ length: 255 }).notNull(),
		date: timestamp({ mode: 'string' }).notNull(),
		hostUserId: integer('host_user_id').notNull(),
		notes: text(),
		bannerPath: varchar('banner_path', { length: 500 }),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.hostUserId],
			foreignColumns: [users.id],
			name: 'experiments_host_user_id_users_id_fk'
		})
	]
);

export const movies = pgTable(
	'movies',
	{
		id: serial().notNull(),
		title: varchar({ length: 500 }).notNull(),
		slug: varchar({ length: 500 }).notNull(),
		tmdbId: integer('tmdb_id'),
		imdbId: varchar('imdb_id', { length: 20 }),
		overview: text(),
		releaseDate: varchar('release_date', { length: 10 }),
		runtime: integer(),
		posterPath: varchar('poster_path', { length: 500 }),
		backdropPath: varchar('backdrop_path', { length: 500 }),
		contentRating: varchar('content_rating', { length: 10 }),
		is3D: boolean('is_3d').default(false),
		notABadMovie: boolean('not_a_bad_movie').default(false),
		cultStatus: varchar('cult_status', { length: 50 }),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
		adult: boolean().default(false),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		budget: bigint({ mode: 'number' }).default(0),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		revenue: bigint({ mode: 'number' }).default(0),
		homepage: text(),
		originalLanguage: varchar('original_language', { length: 10 }),
		originalTitle: text('original_title'),
		popularity: numeric({ precision: 8, scale: 3 }).default('0'),
		status: varchar({ length: 50 }),
		tagline: text(),
		video: boolean().default(false),
		voteAverage: numeric('vote_average', { precision: 3, scale: 1 }).default('0'),
		voteCount: integer('vote_count').default(0),
		collectionId: integer('collection_id'),
		awards: text(),
		metascore: integer(),
		imdbRating: numeric('imdb_rating', { precision: 3, scale: 1 }),
		imdbVotes: integer('imdb_votes'),
		boxOffice: varchar('box_office', { length: 100 }),
		dvdReleaseDate: varchar('dvd_release_date', { length: 10 }),
		website: text(),
		advancedBad: boolean('advanced_bad').default(false),
		excludeFromEnrichment: boolean('exclude_from_enrichment').default(false),
		trailerUrl: text('trailer_url')
	},
	(table) => [
		index('idx_movies_release_date_title')
			.using(
				'btree',
				table.releaseDate.desc().nullsFirst().op('text_ops'),
				table.title.asc().nullsLast().op('text_ops')
			)
			.where(sql`(release_date IS NOT NULL)`),
		foreignKey({
			columns: [table.collectionId],
			foreignColumns: [collections.id],
			name: 'movies_collection_id_collections_id_fk'
		})
	]
);

export const movieStudios = pgTable(
	'movie_studios',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		studioId: integer('studio_id').notNull()
	},
	(table) => [
		index('movie_studios_movie_id_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops')
		),
		index('movie_studios_studio_id_idx').using(
			'btree',
			table.studioId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_studios_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.studioId],
			foreignColumns: [studios.id],
			name: 'movie_studios_studio_id_studios_id_fk'
		}).onDelete('cascade')
	]
);

export const movieWriters = pgTable(
	'movie_writers',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		personId: integer('person_id').notNull(),
		role: varchar({ length: 100 })
	},
	(table) => [
		index('movie_writers_movie_id_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops')
		),
		index('movie_writers_person_id_idx').using(
			'btree',
			table.personId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_writers_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: 'movie_writers_person_id_people_id_fk'
		}).onDelete('cascade')
	]
);

export const people = pgTable('people', {
	id: serial().notNull(),
	name: varchar({ length: 255 }).notNull(),
	tmdbId: integer('tmdb_id'),
	imdbId: varchar('imdb_id', { length: 20 }),
	bio: text(),
	imageUrl: varchar('image_url', { length: 500 }),
	knownFor: varchar('known_for', { length: 500 }),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
	biography: text(),
	birthday: varchar({ length: 10 }),
	deathday: varchar({ length: 10 }),
	placeOfBirth: varchar('place_of_birth', { length: 255 }),
	alsoKnownAs: json('also_known_as'),
	homepage: text(),
	profilePath: varchar('profile_path', { length: 500 }),
	popularity: numeric({ precision: 8, scale: 3 }).default('0'),
	gender: integer().default(0)
});

export const trivia = pgTable(
	'trivia',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		question: text().notNull(),
		answer: text().notNull(),
		difficulty: varchar({ length: 20 }).notNull(),
		status: varchar({ length: 20 }).default('approved'),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
		userId: integer('user_id'),
		likes: integer().default(0)
	},
	(table) => [
		index('trivia_movie_id_created_at_idx').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops'),
			table.createdAt.desc().nullsFirst().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'trivia_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'trivia_user_id_users_id_fk'
		}).onDelete('cascade')
	]
);

export const streamingSources = pgTable('streaming_sources', {
	id: serial().notNull(),
	watchmodeId: integer('watchmode_id').notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 10 }).notNull(),
	logoUrl: varchar('logo_url', { length: 500 }),
	iosUrl: varchar('ios_url', { length: 500 }),
	androidUrl: varchar('android_url', { length: 500 }),
	regions: json(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
});

export const movieStreamingSources = pgTable(
	'movie_streaming_sources',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		sourceId: integer('source_id').notNull(),
		region: varchar({ length: 2 }).notNull(),
		webUrl: varchar('web_url', { length: 500 }),
		iosUrl: varchar('ios_url', { length: 500 }),
		androidUrl: varchar('android_url', { length: 500 }),
		format: varchar({ length: 10 }),
		price: varchar({ length: 20 }),
		availabilityStart: timestamp('availability_start', { mode: 'string' }),
		availabilityEnd: timestamp('availability_end', { mode: 'string' }),
		lastChecked: timestamp('last_checked', { mode: 'string' }).defaultNow().notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('unique_movie_source_region_format').using(
			'btree',
			sql`movie_id`,
			sql`source_id`,
			sql`region`,
			sql`COALESCE(format, 'none'::character varying)`
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_streaming_sources_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.sourceId],
			foreignColumns: [streamingSources.id],
			name: 'movie_streaming_sources_source_id_streaming_sources_id_fk'
		}).onDelete('cascade')
	]
);

export const countries = pgTable('countries', {
	id: serial().notNull(),
	iso31661: varchar('iso_3166_1', { length: 2 }).notNull(),
	name: varchar({ length: 100 }).notNull()
});

export const movieGenres = pgTable(
	'movie_genres',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		genreId: integer('genre_id').notNull()
	},
	(table) => [
		index('idx_movie_genres_optimized').using(
			'btree',
			table.movieId.asc().nullsLast().op('int4_ops'),
			table.genreId.asc().nullsLast().op('int4_ops')
		),
		index('movie_genres_genre_id_idx').using(
			'btree',
			table.genreId.asc().nullsLast().op('int4_ops')
		),
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_genres_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.genreId],
			foreignColumns: [genres.id],
			name: 'movie_genres_genre_id_genres_id_fk'
		}).onDelete('cascade')
	]
);

export const genres = pgTable('genres', {
	id: serial().notNull(),
	name: varchar({ length: 100 }).notNull(),
	tmdbId: integer('tmdb_id')
});

export const movieLanguages = pgTable(
	'movie_languages',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		languageId: integer('language_id').notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'movie_languages_movie_id_movies_id_fk'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: 'movie_languages_language_id_languages_id_fk'
		}).onDelete('cascade')
	]
);

export const languages = pgTable('languages', {
	id: serial().notNull(),
	iso6391: varchar('iso_639_1', { length: 2 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	englishName: varchar('english_name', { length: 100 })
});

export const collections = pgTable('collections', {
	id: serial().notNull(),
	name: varchar({ length: 255 }).notNull(),
	tmdbId: integer('tmdb_id'),
	posterPath: varchar('poster_path', { length: 500 }),
	backdropPath: varchar('backdrop_path', { length: 500 }),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
});

export const externalRatings = pgTable(
	'external_ratings',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		source: varchar({ length: 50 }).notNull(),
		value: varchar({ length: 20 }).notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'external_ratings_movie_id_movies_id_fk'
		}).onDelete('cascade')
	]
);

export const quotes = pgTable(
	'quotes',
	{
		id: serial().notNull(),
		movieId: integer('movie_id').notNull(),
		userId: integer('user_id'),
		quote: text().notNull(),
		character: varchar({ length: 255 }),
		actor: varchar({ length: 255 }),
		context: text(),
		timestamp: varchar({ length: 20 }),
		isMemorable: boolean('is_memorable').default(false),
		status: varchar({ length: 20 }).default('approved'),
		likes: integer().default(0).notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: 'quotes_movie_id_fkey'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'quotes_user_id_fkey'
		}).onDelete('cascade')
	]
);

export const quoteLikes = pgTable(
	'quote_likes',
	{
		id: serial().notNull(),
		quoteId: integer('quote_id').notNull(),
		userId: integer('user_id').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
	},
	(table) => [
		foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: 'fk_quote_likes_quote_id'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'fk_quote_likes_user_id'
		}).onDelete('cascade')
	]
);

export const gameLikes = pgTable(
	'game_likes',
	{
		id: serial().notNull(),
		gameId: integer('game_id').notNull(),
		userId: integer('user_id').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
	},
	(table) => [
		foreignKey({
			columns: [table.gameId],
			foreignColumns: [games.id],
			name: 'fk_game_likes_game_id'
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'fk_game_likes_user_id'
		}).onDelete('cascade')
	]
);

export const userLists = pgTable(
	'user_lists',
	{
		id: serial().notNull(),
		userId: integer('user_id').notNull(),
		name: varchar({ length: 255 }).notNull(),
		description: text(),
		isPublic: boolean('is_public').default(true),
		isFavoriteList: boolean('is_favorite_list').default(false),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [
		index('idx_user_lists_created_at').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamp_ops')
		),
		index('idx_user_lists_favorite')
			.using(
				'btree',
				table.userId.asc().nullsLast().op('bool_ops'),
				table.isFavoriteList.asc().nullsLast().op('int4_ops')
			)
			.where(sql`(is_favorite_list = true)`),
		index('idx_user_lists_is_public').using(
			'btree',
			table.isPublic.asc().nullsLast().op('bool_ops')
		),
		index('idx_user_lists_public')
			.using('btree', table.isPublic.asc().nullsLast().op('bool_ops'))
			.where(sql`(is_public = true)`),
		index('idx_user_lists_user_id').using('btree', table.userId.asc().nullsLast().op('int4_ops')),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'user_lists_user_id_fkey'
		}).onDelete('cascade')
	]
);
