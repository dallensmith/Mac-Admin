export const mockTemplates = [
	{
		id: 'movie-lookup',
		name: 'Movie Lookup',
		description: 'Used when a user searches for a specific movie.'
	},
	{
		id: 'experiment-lookup',
		name: 'Experiment Lookup',
		description: 'Used when a user searches for an experiment.'
	},
	{ id: 'review', name: 'Review', description: 'Used for formatting movie review displays.' },
	{ id: 'quote', name: 'Quote', description: 'Used for displaying memorable quotes.' },
	{ id: 'no-results', name: 'No Results', description: 'Displayed when a search yields nothing.' },
	{
		id: 'error-message',
		name: 'Error Message',
		description: 'Generic error format for bot commands.'
	}
];

export const mockVariables = {
	'Movie Lookup': [
		{ name: '{{movie.title}}', description: 'The title of the movie' },
		{ name: '{{movie.year}}', description: 'Release year' },
		{ name: '{{movie.overview}}', description: 'Short plot summary' },
		{ name: '{{movie.releaseDate}}', description: 'Full release date' },
		{ name: '{{movie.runtime}}', description: 'Runtime in minutes' },
		{ name: '{{movie.rating}}', description: 'Content rating (e.g., R, PG-13)' },
		{ name: '{{movie.imdbRating}}', description: 'IMDb score out of 10' },
		{ name: '{{movie.revenue}}', description: 'Box office revenue' },
		{ name: '{{movie.director}}', description: 'Director name(s)' },
		{ name: '{{movie.writers}}', description: 'Writer name(s)' },
		{ name: '{{movie.actors}}', description: 'Lead actors' },
		{ name: '{{movie.genres}}', description: 'Associated genres' },
		{ name: '{{movie.badmoviesUrl}}', description: 'Link to the BadMovies.co entry' },
		{ name: '{{movie.imdbUrl}}', description: 'Link to IMDb page' },
		{ name: '{{movie.posterUrl}}', description: 'Image URL for the movie poster' }
	],
	'Experiment Lookup': [
		{ name: '{{experiment.number}}', description: 'Experiment episode number' },
		{ name: '{{experiment.date}}', description: 'Date the experiment was conducted' },
		{ name: '{{experiment.movies}}', description: 'List of movies watched' },
		{ name: '{{experiment.host}}', description: 'The host of the experiment' },
		{ name: '{{experiment.url}}', description: 'Link to the experiment details' },
		{ name: '{{experiment.imageUrl}}', description: 'Thumbnail for the experiment' }
	]
};

export const discordLimits = [
	{ limit: 'Title', max: '256 characters' },
	{ limit: 'Description', max: '4096 characters' },
	{ limit: 'Field Name', max: '256 characters' },
	{ limit: 'Field Value', max: '1024 characters' },
	{ limit: 'Max Fields', max: '25 fields per embed' },
	{ limit: 'Footer', max: '2048 characters' },
	{ limit: 'Buttons', max: 'Max 5 buttons per row, keep labels short' }
];

export const mockPresets = [
	{
		id: 'compact-movie',
		name: 'Compact Movie Card',
		description: 'A minimal card with just title, year, and rating.'
	},
	{
		id: 'full-archive',
		name: 'Full Movie Archive Card',
		description: 'Everything including poster, cast, plot, and links.'
	},
	{
		id: 'exp-summary',
		name: 'Experiment Summary Card',
		description: 'A quick overview of what happened in an experiment.'
	},
	{
		id: 'minimal-result',
		name: 'Minimal Result Card',
		description: 'No image, pure text embed.'
	}
];

export const defaultTemplateData = {
	titleFormat: '{{movie.title}} ({{movie.year}})',
	descriptionFormat: '{{movie.overview}}',
	accentColor: '#0ea5e9', // cyan-500
	thumbnailEnabled: true,
	imageEnabled: false,
	footerText: 'Smart Mac Archive Lookup | Requested by {{user}}',
	timestampEnabled: true,
	showDirector: true,
	showActors: true,
	showRating: true,
	showGenres: false,
	buttonLabels: {
		badmovies: 'View on BadMovies.co',
		imdb: 'IMDb Page'
	},
	buttonsEnabled: true
};
