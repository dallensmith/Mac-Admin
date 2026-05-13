export type AIAction =
	| ChatAction
	| SearchMoviesAction
	| FindSimilarMoviesAction
	| GetServerInfoAction
	| GetServerEventsAction
	| GetAnnouncementsAction
	| SearchMoviesByAttributeAction
	| FindExperimentByMovieAction
	| GetExperimentsAction
	| GetExperimentsByDateAction
	| GetStatsAction
	| GetRandomMovieAction
	| GetRandomQuoteAction
	| GetMovieReviewsAction
	| GetMovieQuotesAction
	| GetRandomReviewAction
	| GetRecentQuotesAction
	| GetRecentReviewsAction
	| RankMoviesAction
	| GetWheelAction
	| SpinWheelAction
	| VoteWheelAction
	| AddToWheelAction
	| RemoveFromWheelAction
	| CleanWheelAction
	| EditWheelAction
	| GetContributorsAction
	| GetTmdbFilmographyAction
	| GetUnplayedMoviesAction
	| RelayMessageAction
	| GetUptimeAction
	| GetAllPlayedMoviesAction
	| TerminationAction
	| NoneAction
	| SearchGeneralAction;

export interface GetAllPlayedMoviesAction extends BaseAction {
	type: 'get_all_played_movies';
}

export interface GetUnplayedMoviesAction extends BaseAction {
	type: 'get_unplayed_movies';
	limit?: number;
}

export interface GetRandomMovieAction extends BaseAction {
	type: 'get_random_movie';
	attribute?: 'genre' | 'decade' | 'country' | 'budget_tier';
	query?: string;
}

export interface GetRandomQuoteAction extends BaseAction {
	type: 'get_random_quote';
}

export interface BaseAction {
	confidence?: number;
	templateHint?: string;
	needsFollowupOptions?: boolean;
}

export interface ChatAction extends BaseAction {
	type: 'chat';
	response: string;
}

export interface SearchMoviesAction extends BaseAction {
	type: 'search_movies';
	query: string;
	source?: 'tmdb' | 'imdb';
}

export interface SearchMoviesByAttributeAction extends BaseAction {
	type: 'search_movies_by_attribute';
	attribute: 'director' | 'actor' | 'genre' | 'decade' | 'country' | 'budget_tier';
	query: string;
}

export interface FindExperimentByMovieAction extends BaseAction {
	type: 'find_experiment_by_movie';
	query: string;
}

export interface FindSimilarMoviesAction extends BaseAction {
	type: 'find_similar_movies';
	title: string;
}

export interface GetExperimentsByDateAction extends BaseAction {
	type: 'get_experiments_by_date';
	month: number; // 1–12
	day?: number; // 1–31, optional (omit to match the whole month)
	year?: number; // optional, for a specific year
}

export interface GetExperimentsAction extends BaseAction {
	type: 'get_experiments';
	query?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
	order?: 'asc' | 'desc';
}

export interface GetStatsAction extends BaseAction {
	type: 'get_stats';
	category?: 'genre' | 'decade' | 'director' | 'actor' | 'country' | 'total_runtime' | 'budget';
	/** When true, return only the single top result as a direct answer instead of the full list */
	topOnly?: boolean;
	/** 0-based index into the ranked result list (0 = top, 1 = second, etc.) */
	topIndex?: number;
	/** When true (combined with topOnly), pick from the bottom of the ranked list instead of the top */
	bottomOnly?: boolean;
}

export interface GetMovieReviewsAction extends BaseAction {
	type: 'get_movie_reviews';
	query: string;
}

export interface GetMovieQuotesAction extends BaseAction {
	type: 'get_movie_quotes';
	query: string;
}

export interface GetRandomReviewAction extends BaseAction {
	type: 'get_random_review';
}

export interface RankMoviesAction extends BaseAction {
	type: 'rank_movies';
	rankBy: 'budget' | 'revenue' | 'rating' | 'runtime' | 'appearances';
	order: 'desc' | 'asc';
	limit?: number;
}

export interface GetRecentQuotesAction extends BaseAction {
	type: 'get_recent_quotes';
	/** 1 = return only the single most recent quote */
	limit?: number;
}

export interface GetRecentReviewsAction extends BaseAction {
	type: 'get_recent_reviews';
	/** 1 = return only the single most recent review */
	limit?: number;
}

/** Show current wheel candidates list */
export interface GetWheelAction extends BaseAction {
	type: 'get_wheel';
}

/** Pick a random item from the wheel and optionally announce it */
export interface SpinWheelAction extends BaseAction {
	type: 'spin_wheel';
}

/** Submit a vote on a wheel candidate */
export interface VoteWheelAction extends BaseAction {
	type: 'vote_wheel';
	candidateId: string;
	vote: 'up' | 'down';
}

/** Add a movie to the wheel (any user) */
export interface AddToWheelAction extends BaseAction {
	type: 'add_to_wheel';
	title: string;
	year?: string;
}

/** Remove a movie from the wheel by title match (owner-only) */
export interface RemoveFromWheelAction extends BaseAction {
	type: 'remove_from_wheel';
	title: string;
}

/** Get top contributors to the community archive */
export interface GetContributorsAction extends BaseAction {
	type: 'get_contributors';
	showAll?: boolean;
}

/** Remove all watched movies from the wheel (admin-only) */
export interface CleanWheelAction extends BaseAction {
	type: 'clean_wheel';
}

/** Rename or update a wheel candidate (admin-only) */
export interface EditWheelAction extends BaseAction {
	type: 'edit_wheel';
	title: string;
	newTitle?: string;
	newYear?: string;
}

/** Fetch full filmography for a person from TMDb (beyond the local archive) */
export interface GetTmdbFilmographyAction extends BaseAction {
	type: 'get_tmdb_filmography';
	attribute: 'director' | 'actor';
	query: string;
}

/** Admin-only: relay a message from an admin to another guild member in Mac's own voice */
export interface RelayMessageAction extends BaseAction {
	type: 'relay_message';
	/** Display name or username of the target member as mentioned by the admin */
	targetName: string;
	/** The message to relay, rephrased in Mac's own voice */
	message: string;
}

export interface GetUptimeAction extends BaseAction {
	type: 'get_uptime';
}

export interface TerminationAction extends BaseAction {
	type: 'termination';
}

export interface NoneAction extends BaseAction {
	type: 'none';
}

export interface SearchGeneralAction extends BaseAction {
	type: 'search_general';
	query: string;
}

export interface GetServerInfoAction extends BaseAction {
	type: 'get_server_info';
	/** When the user only asked about one aspect, focus on that instead of returning full server info */
	focus?: 'members' | 'channels';
}

export interface GetServerEventsAction extends BaseAction {
	type: 'get_server_events';
	/** 'upcoming' (default), 'active', or 'all' */
	status?: 'upcoming' | 'active' | 'all';
	/** 1 = next single event only; omit for all matching events */
	limit?: number;
}

export interface GetAnnouncementsAction extends BaseAction {
	type: 'get_announcements';
	limit?: number;
	/** Exact channel name from the configured list (e.g. 'bigscreen-updates'). Omit to search all configured channels. */
	channel?: string;
}

export type SystemStatus = 'healthy' | 'throttled' | 'emergency';
