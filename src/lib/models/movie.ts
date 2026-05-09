export interface NormalizedMovie {
  id?: string;
  slug?: string;
  title: string;
  year: string;
  releaseDate?: string;
  description: string;
  tagline?: string;
  url: string;
  posterUrl?: string;
  trailerUrl?: string;
  budget?: number;
  revenue?: number;
  /** TMDb community vote average (0–10). */
  rating?: string;
  mpaaRating?: string;
  runtime?: string;
  studio?: string;
  /** Populated only by the TMDb/OMDb enrichment clients, not the Postgres DB client. */
  tmdbRating?: string;
  /** Populated only by the TMDb/OMDb enrichment clients, not the Postgres DB client. */
  tmdbVotes?: string;
  /** Numeric TMDb movie ID — present when sourced from BM Postgres or TMDb enrichment. */
  tmdbId?: string;
  imdbId?: string;
  imdbRating?: string;
  imdbVotes?: string;
  director?: string;
  writers?: string;
  actors?: string;
  genres?: string;
  /** Approved review count (populated by DB client only). Used to suppress dead buttons. */
  reviewCount?: number;
  /** Approved quote count (populated by DB client only). Used to suppress dead buttons. */
  quoteCount?: number;
  /** Number of experiments this movie has appeared in (populated by appearances query only). */
  appearances?: number;
  source: 'badmovies' | 'tmdb' | 'omdb';
}

/** A movie entry inside an experiment's lineup. */
export interface ExperimentMovie {
  id: string;
  slug?: string;
  title: string;
  year?: string;
  posterUrl?: string;
}

export interface NormalizedExperiment {
  name: string;
  date: string;
  result: string;
  notes: string;
  movies: ExperimentMovie[];
  bannerUrl?: string;
  host?: string;
  url?: string;
}

export interface NormalizedStats {
  totalMovies: number;
  lastParty: string;
  avgRating: number;
  totalRuntimeMinutes?: number;
  userCount?: number;
  genres?: GenreStat[];
  totalExperiments?: number;
  totalReviews?: number;
  totalBudget?: number;
  totalRevenue?: number;
  topActor?: { name: string; count: number };
  topDirector?: { name: string; count: number };
  latestExperiment?: { number: string; title: string };
  totalQuotes?: number;
  topDecade?: { label: string; count: number };
  mostReviewedMovie?: { title: string; slug: string; count: number };
  mostExperimentedMovie?: { title: string; slug: string; count: number };
  mostQuotedMovie?: { title: string; slug: string; count: number };
  highestRatedMovie?: { title: string; slug: string; score: number };
  longestMovie?: { title: string; slug: string; runtime: number };
}

export interface GenreStat {
  genre: string;
  count: number;
}

/** Simple quote shape used for `get_random_quote`. */
export interface NormalizedQuote {
  text: string;
  movie: string;
  year: string;
  movieSlug?: string;
}

/** Full quote shape including moderation metadata from the `quotes` table. */
export interface NormalizedQuoteDetailed {
  id: string;
  text: string;
  movie: string;
  movieSlug?: string;
  year: string;
  character?: string;
  actor?: string;
  context?: string;
  isMemorable: boolean;
  likes: number;
  status: string;
  createdAt?: string;
}

/** Review with computed weighted score derived from the four rating dimensions. */
export interface NormalizedReview {
  id: string;
  movieTitle: string;
  movieSlug: string;
  movieYear?: string;
  posterUrl?: string;
  reviewerName: string;
  content: string;
  /** Weighted composite: (soBadItsGood×2) + (entertainment×1.2) + (memePotential×0.8) + (good×−0.5) */
  weightedScore: number;
  ratingGood: number;
  ratingEntertainment: number;
  ratingSoBadItsGood: number;
  ratingMemePotential: number;
  status: string;
  createdAt: string;
}

export interface GenericContent {
  content: string;
}
