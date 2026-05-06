export const mockGameModes = [
	{
		id: 'movie-trivia',
		name: 'Movie Trivia',
		description: 'General knowledge questions about movies and behind-the-scenes facts.',
		status: 'enabled',
		difficultyRange: 'Easy - Hard'
	},
	{
		id: 'guess-movie',
		name: 'Guess the Bad Movie',
		description: 'Identify the awful film from a vague or absurd plot description.',
		status: 'enabled',
		difficultyRange: 'Medium - Hard'
	},
	{
		id: 'quote-guessing',
		name: 'Quote Guessing',
		description: 'Match the terrible line of dialogue to the movie it came from.',
		status: 'enabled',
		difficultyRange: 'Medium'
	},
	{
		id: 'actor-match',
		name: 'Actor/Director Match',
		description: 'Connect the actor or director to their questionable career choices.',
		status: 'disabled',
		difficultyRange: 'Easy - Medium'
	},
	{
		id: 'year-guess',
		name: 'Year Guess',
		description: 'Guess what year a specific cinematic disaster was unleashed upon the world.',
		status: 'disabled',
		difficultyRange: 'Hard'
	},
	{
		id: 'poster-guess',
		name: 'Poster Guess',
		description: 'Identify the movie from a cropped or blurred section of its poster.',
		status: 'enabled',
		difficultyRange: 'Easy - Hard'
	},
	{
		id: 'lightning-round',
		name: 'Lightning Round',
		description: 'Rapid-fire questions from all categories with a strict time limit.',
		status: 'disabled',
		difficultyRange: 'Expert'
	}
];

export const mockTriviaQuestions = [
	{
		id: 1,
		question:
			'In "The Room", what object does Johnny famously throw during his "You are tearing me apart, Lisa!" scene?',
		answer: 'A water bottle',
		category: 'Movie Trivia',
		difficulty: 'Easy',
		source: 'Manual',
		status: 'Approved',
		lastUpdated: '2026-05-01'
	},
	{
		id: 2,
		question:
			'Which movie features the line "They\'re eating her... and then they\'re going to eat me... OH MY GOOOOOOD!"?',
		answer: 'Troll 2',
		category: 'Quote Guessing',
		difficulty: 'Medium',
		source: 'BadMovies.co',
		status: 'Approved',
		lastUpdated: '2026-04-28'
	},
	{
		id: 3,
		question:
			'In "Birdemic", what do the characters use to defend themselves against the attacking birds?',
		answer: 'Coat hangers',
		category: 'Movie Trivia',
		difficulty: 'Medium',
		source: 'Experiment History',
		status: 'Needs Review',
		lastUpdated: '2026-05-04'
	},
	{
		id: 4,
		question: 'Guess the movie: A sentient tire named Robert goes on a psychic killing spree.',
		answer: 'Rubber',
		category: 'Guess the Bad Movie',
		difficulty: 'Hard',
		source: 'AI Draft',
		status: 'Draft',
		lastUpdated: '2026-05-05'
	},
	{
		id: 5,
		question: 'What year was the notorious "Star Wars Holiday Special" first broadcast?',
		answer: '1978',
		category: 'Year Guess',
		difficulty: 'Medium',
		source: 'TMDb',
		status: 'Approved',
		lastUpdated: '2026-05-02'
	}
];

export const mockSources = [
	{
		name: 'BadMovies.co Archive',
		description:
			'Pulling facts, quotes, and terrible synopses directly from the main site database.',
		status: 'active'
	},
	{
		name: 'Experiment History',
		description:
			'Trivia based on inside jokes and specific events from past community experiments.',
		status: 'active'
	},
	{
		name: 'TMDb / OMDb Integration',
		description:
			'Automated retrieval of cast, crew, and release date information for standard trivia.',
		status: 'configured'
	},
	{
		name: 'AI Generated Drafts',
		description:
			'LLM-generated questions that are placed in the review queue for admin approval before going live.',
		status: 'active'
	},
	{
		name: 'Manual Admin Creation',
		description: 'Questions manually typed out by admins using the creation wizard.',
		status: 'active'
	}
];
