import { relations } from "drizzle-orm/relations";
import { movies, movieActors, people, users, reviews, experiments, experimentMovies, userActivity, profiles, movieCountries, countries, passwordResets, userLists, listItems, movieDirectors, listFollows, games, collections, movieStudios, studios, movieWriters, trivia, movieStreamingSources, streamingSources, movieGenres, genres, movieLanguages, languages, externalRatings, quotes, quoteLikes, gameLikes } from "./schema";

export const movieActorsRelations = relations(movieActors, ({one}) => ({
	movie: one(movies, {
		fields: [movieActors.movieId],
		references: [movies.id]
	}),
	person: one(people, {
		fields: [movieActors.personId],
		references: [people.id]
	}),
}));

export const moviesRelations = relations(movies, ({one, many}) => ({
	movieActors: many(movieActors),
	reviews: many(reviews),
	experimentMovies: many(experimentMovies),
	movieCountries: many(movieCountries),
	listItems: many(listItems),
	movieDirectors: many(movieDirectors),
	games: many(games),
	collection: one(collections, {
		fields: [movies.collectionId],
		references: [collections.id]
	}),
	movieStudios: many(movieStudios),
	movieWriters: many(movieWriters),
	trivias: many(trivia),
	movieStreamingSources: many(movieStreamingSources),
	movieGenres: many(movieGenres),
	movieLanguages: many(movieLanguages),
	externalRatings: many(externalRatings),
	quotes: many(quotes),
}));

export const peopleRelations = relations(people, ({many}) => ({
	movieActors: many(movieActors),
	movieDirectors: many(movieDirectors),
	movieWriters: many(movieWriters),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
	movie: one(movies, {
		fields: [reviews.movieId],
		references: [movies.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	reviews: many(reviews),
	userActivities: many(userActivity),
	profiles: many(profiles),
	passwordResets: many(passwordResets),
	listFollows: many(listFollows),
	games: many(games),
	experiments: many(experiments),
	trivias: many(trivia),
	quotes: many(quotes),
	quoteLikes: many(quoteLikes),
	gameLikes: many(gameLikes),
	userLists: many(userLists),
}));

export const experimentMoviesRelations = relations(experimentMovies, ({one}) => ({
	experiment: one(experiments, {
		fields: [experimentMovies.experimentId],
		references: [experiments.id]
	}),
	movie: one(movies, {
		fields: [experimentMovies.movieId],
		references: [movies.id]
	}),
}));

export const experimentsRelations = relations(experiments, ({one, many}) => ({
	experimentMovies: many(experimentMovies),
	user: one(users, {
		fields: [experiments.hostUserId],
		references: [users.id]
	}),
}));

export const userActivityRelations = relations(userActivity, ({one}) => ({
	user: one(users, {
		fields: [userActivity.userId],
		references: [users.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const movieCountriesRelations = relations(movieCountries, ({one}) => ({
	movie: one(movies, {
		fields: [movieCountries.movieId],
		references: [movies.id]
	}),
	country: one(countries, {
		fields: [movieCountries.countryId],
		references: [countries.id]
	}),
}));

export const countriesRelations = relations(countries, ({many}) => ({
	movieCountries: many(movieCountries),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	user: one(users, {
		fields: [passwordResets.userId],
		references: [users.id]
	}),
}));

export const listItemsRelations = relations(listItems, ({one}) => ({
	userList: one(userLists, {
		fields: [listItems.listId],
		references: [userLists.id]
	}),
	movie: one(movies, {
		fields: [listItems.movieId],
		references: [movies.id]
	}),
}));

export const userListsRelations = relations(userLists, ({one, many}) => ({
	listItems: many(listItems),
	listFollows: many(listFollows),
	user: one(users, {
		fields: [userLists.userId],
		references: [users.id]
	}),
}));

export const movieDirectorsRelations = relations(movieDirectors, ({one}) => ({
	movie: one(movies, {
		fields: [movieDirectors.movieId],
		references: [movies.id]
	}),
	person: one(people, {
		fields: [movieDirectors.personId],
		references: [people.id]
	}),
}));

export const listFollowsRelations = relations(listFollows, ({one}) => ({
	user: one(users, {
		fields: [listFollows.followerId],
		references: [users.id]
	}),
	userList: one(userLists, {
		fields: [listFollows.listId],
		references: [userLists.id]
	}),
}));

export const gamesRelations = relations(games, ({one, many}) => ({
	movie: one(movies, {
		fields: [games.movieId],
		references: [movies.id]
	}),
	user: one(users, {
		fields: [games.userId],
		references: [users.id]
	}),
	gameLikes: many(gameLikes),
}));

export const collectionsRelations = relations(collections, ({many}) => ({
	movies: many(movies),
}));

export const movieStudiosRelations = relations(movieStudios, ({one}) => ({
	movie: one(movies, {
		fields: [movieStudios.movieId],
		references: [movies.id]
	}),
	studio: one(studios, {
		fields: [movieStudios.studioId],
		references: [studios.id]
	}),
}));

export const studiosRelations = relations(studios, ({many}) => ({
	movieStudios: many(movieStudios),
}));

export const movieWritersRelations = relations(movieWriters, ({one}) => ({
	movie: one(movies, {
		fields: [movieWriters.movieId],
		references: [movies.id]
	}),
	person: one(people, {
		fields: [movieWriters.personId],
		references: [people.id]
	}),
}));

export const triviaRelations = relations(trivia, ({one}) => ({
	movie: one(movies, {
		fields: [trivia.movieId],
		references: [movies.id]
	}),
	user: one(users, {
		fields: [trivia.userId],
		references: [users.id]
	}),
}));

export const movieStreamingSourcesRelations = relations(movieStreamingSources, ({one}) => ({
	movie: one(movies, {
		fields: [movieStreamingSources.movieId],
		references: [movies.id]
	}),
	streamingSource: one(streamingSources, {
		fields: [movieStreamingSources.sourceId],
		references: [streamingSources.id]
	}),
}));

export const streamingSourcesRelations = relations(streamingSources, ({many}) => ({
	movieStreamingSources: many(movieStreamingSources),
}));

export const movieGenresRelations = relations(movieGenres, ({one}) => ({
	movie: one(movies, {
		fields: [movieGenres.movieId],
		references: [movies.id]
	}),
	genre: one(genres, {
		fields: [movieGenres.genreId],
		references: [genres.id]
	}),
}));

export const genresRelations = relations(genres, ({many}) => ({
	movieGenres: many(movieGenres),
}));

export const movieLanguagesRelations = relations(movieLanguages, ({one}) => ({
	movie: one(movies, {
		fields: [movieLanguages.movieId],
		references: [movies.id]
	}),
	language: one(languages, {
		fields: [movieLanguages.languageId],
		references: [languages.id]
	}),
}));

export const languagesRelations = relations(languages, ({many}) => ({
	movieLanguages: many(movieLanguages),
}));

export const externalRatingsRelations = relations(externalRatings, ({one}) => ({
	movie: one(movies, {
		fields: [externalRatings.movieId],
		references: [movies.id]
	}),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	movie: one(movies, {
		fields: [quotes.movieId],
		references: [movies.id]
	}),
	user: one(users, {
		fields: [quotes.userId],
		references: [users.id]
	}),
	quoteLikes: many(quoteLikes),
}));

export const quoteLikesRelations = relations(quoteLikes, ({one}) => ({
	quote: one(quotes, {
		fields: [quoteLikes.quoteId],
		references: [quotes.id]
	}),
	user: one(users, {
		fields: [quoteLikes.userId],
		references: [users.id]
	}),
}));

export const gameLikesRelations = relations(gameLikes, ({one}) => ({
	game: one(games, {
		fields: [gameLikes.gameId],
		references: [games.id]
	}),
	user: one(users, {
		fields: [gameLikes.userId],
		references: [users.id]
	}),
}));