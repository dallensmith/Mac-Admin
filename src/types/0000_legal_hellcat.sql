-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "movie_actors" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"character" varchar(255),
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"rating_good" numeric(3, 1) NOT NULL,
	"rating_entertainment" numeric(3, 1) NOT NULL,
	"rating_so_bad_it_is_good" numeric(3, 1) NOT NULL,
	"rating_meme_potential" numeric(3, 1) NOT NULL,
	"body" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiment_movies" (
	"id" serial NOT NULL,
	"experiment_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"tmdb_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"logo_path" varchar(500),
	"origin_country" varchar(2),
	"headquarters" varchar(255),
	"parent_company" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"details" json,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(50),
	"full_name" varchar(255),
	"website" varchar(500),
	"bio" text,
	"avatar_url" varchar(500),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_countries" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"country_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"password_hash" varchar(255),
	"account_status" varchar(20) DEFAULT 'active',
	"last_login_at" timestamp,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"preferences" json,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"special_title" varchar(100),
	"pending_email" varchar(255),
	"pending_email_token" varchar(255),
	"pending_email_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "attempted_streaming_movies" (
	"movie_id" integer NOT NULL,
	"attempted_at" timestamp DEFAULT now(),
	"found_sources" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" serial NOT NULL,
	"list_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"notes" text,
	"order_position" integer DEFAULT 0,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_directors" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_follows" (
	"id" serial NOT NULL,
	"follower_id" integer NOT NULL,
	"list_id" integer NOT NULL,
	"followed_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'approved',
	"user_id" integer,
	"likes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" serial NOT NULL,
	"experiment_number" varchar(10) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"host_user_id" integer NOT NULL,
	"notes" text,
	"banner_path" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" serial NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"tmdb_id" integer,
	"imdb_id" varchar(20),
	"overview" text,
	"release_date" varchar(10),
	"runtime" integer,
	"poster_path" varchar(500),
	"backdrop_path" varchar(500),
	"content_rating" varchar(10),
	"is_3d" boolean DEFAULT false,
	"not_a_bad_movie" boolean DEFAULT false,
	"cult_status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"adult" boolean DEFAULT false,
	"budget" bigint DEFAULT 0,
	"revenue" bigint DEFAULT 0,
	"homepage" text,
	"original_language" varchar(10),
	"original_title" text,
	"popularity" numeric(8, 3) DEFAULT '0',
	"status" varchar(50),
	"tagline" text,
	"video" boolean DEFAULT false,
	"vote_average" numeric(3, 1) DEFAULT '0',
	"vote_count" integer DEFAULT 0,
	"collection_id" integer,
	"awards" text,
	"metascore" integer,
	"imdb_rating" numeric(3, 1),
	"imdb_votes" integer,
	"box_office" varchar(100),
	"dvd_release_date" varchar(10),
	"website" text,
	"advanced_bad" boolean DEFAULT false,
	"exclude_from_enrichment" boolean DEFAULT false,
	"trailer_url" text
);
--> statement-breakpoint
CREATE TABLE "movie_studios" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"studio_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_writers" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"role" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"tmdb_id" integer,
	"imdb_id" varchar(20),
	"bio" text,
	"image_url" varchar(500),
	"known_for" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"biography" text,
	"birthday" varchar(10),
	"deathday" varchar(10),
	"place_of_birth" varchar(255),
	"also_known_as" json,
	"homepage" text,
	"profile_path" varchar(500),
	"popularity" numeric(8, 3) DEFAULT '0',
	"gender" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "trivia" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'approved',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"likes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "streaming_sources" (
	"id" serial NOT NULL,
	"watchmode_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(10) NOT NULL,
	"logo_url" varchar(500),
	"ios_url" varchar(500),
	"android_url" varchar(500),
	"regions" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_streaming_sources" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"region" varchar(2) NOT NULL,
	"web_url" varchar(500),
	"ios_url" varchar(500),
	"android_url" varchar(500),
	"format" varchar(10),
	"price" varchar(20),
	"availability_start" timestamp,
	"availability_end" timestamp,
	"last_checked" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial NOT NULL,
	"iso_3166_1" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" serial NOT NULL,
	"name" varchar(100) NOT NULL,
	"tmdb_id" integer
);
--> statement-breakpoint
CREATE TABLE "movie_languages" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"language_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial NOT NULL,
	"iso_639_1" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"english_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"tmdb_id" integer,
	"poster_path" varchar(500),
	"backdrop_path" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_ratings" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"value" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial NOT NULL,
	"movie_id" integer NOT NULL,
	"user_id" integer,
	"quote" text NOT NULL,
	"character" varchar(255),
	"actor" varchar(255),
	"context" text,
	"timestamp" varchar(20),
	"is_memorable" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'approved',
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_likes" (
	"id" serial NOT NULL,
	"quote_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_likes" (
	"id" serial NOT NULL,
	"game_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_lists" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true,
	"is_favorite_list" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_movies" ADD CONSTRAINT "experiment_movies_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_movies" ADD CONSTRAINT "experiment_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_countries" ADD CONSTRAINT "movie_countries_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_countries" ADD CONSTRAINT "movie_countries_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."user_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_directors" ADD CONSTRAINT "movie_directors_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_directors" ADD CONSTRAINT "movie_directors_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_follows" ADD CONSTRAINT "list_follows_follower_user_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_follows" ADD CONSTRAINT "list_follows_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."user_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_studios" ADD CONSTRAINT "movie_studios_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_studios" ADD CONSTRAINT "movie_studios_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_writers" ADD CONSTRAINT "movie_writers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_writers" ADD CONSTRAINT "movie_writers_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trivia" ADD CONSTRAINT "trivia_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trivia" ADD CONSTRAINT "trivia_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_streaming_sources" ADD CONSTRAINT "movie_streaming_sources_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_streaming_sources" ADD CONSTRAINT "movie_streaming_sources_source_id_streaming_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."streaming_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_languages" ADD CONSTRAINT "movie_languages_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_languages" ADD CONSTRAINT "movie_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_ratings" ADD CONSTRAINT "external_ratings_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_likes" ADD CONSTRAINT "fk_quote_likes_quote_id" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_likes" ADD CONSTRAINT "fk_quote_likes_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_likes" ADD CONSTRAINT "fk_game_likes_game_id" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_likes" ADD CONSTRAINT "fk_game_likes_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_movie_actors_optimized" ON "movie_actors" USING btree ("movie_id" int4_ops,"order" int4_ops) WHERE ("order" IS NOT NULL);--> statement-breakpoint
CREATE INDEX "movie_actors_movie_id_idx" ON "movie_actors" USING btree ("movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_actors_person_id_idx" ON "movie_actors" USING btree ("person_id" int4_ops);--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "reviews_movie_status_idx" ON "reviews" USING btree ("movie_id" int4_ops,"status" int4_ops);--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "reviews_user_movie_idx" ON "reviews" USING btree ("user_id" int4_ops,"movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_experiment_movies_optimized" ON "experiment_movies" USING btree ("experiment_id" int4_ops,"movie_id" int4_ops,"order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_studios_name_search" ON "studios" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_list_items_list_id" ON "list_items" USING btree ("list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_list_items_list_order" ON "list_items" USING btree ("list_id" int4_ops,"order_position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_list_items_movie_id" ON "list_items" USING btree ("movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_list_items_order" ON "list_items" USING btree ("list_id" int4_ops,"order_position" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_directors_movie_id_idx" ON "movie_directors" USING btree ("movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_directors_person_id_idx" ON "movie_directors" USING btree ("person_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_list_follows_follower" ON "list_follows" USING btree ("follower_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_list_follows_list" ON "list_follows" USING btree ("list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "games_movie_id_created_at_idx" ON "games" USING btree ("movie_id" int4_ops,"created_at" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_movies_release_date_title" ON "movies" USING btree ("release_date" text_ops,"title" text_ops) WHERE (release_date IS NOT NULL);--> statement-breakpoint
CREATE INDEX "movie_studios_movie_id_idx" ON "movie_studios" USING btree ("movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_studios_studio_id_idx" ON "movie_studios" USING btree ("studio_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_writers_movie_id_idx" ON "movie_writers" USING btree ("movie_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_writers_person_id_idx" ON "movie_writers" USING btree ("person_id" int4_ops);--> statement-breakpoint
CREATE INDEX "trivia_movie_id_created_at_idx" ON "trivia" USING btree ("movie_id" int4_ops,"created_at" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_movie_source_region_format" ON "movie_streaming_sources" USING btree (movie_id text_ops,source_id int4_ops,region int4_ops,COALESCE(format, 'none'::character varying) int4_ops);--> statement-breakpoint
CREATE INDEX "idx_movie_genres_optimized" ON "movie_genres" USING btree ("movie_id" int4_ops,"genre_id" int4_ops);--> statement-breakpoint
CREATE INDEX "movie_genres_genre_id_idx" ON "movie_genres" USING btree ("genre_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_lists_created_at" ON "user_lists" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_user_lists_favorite" ON "user_lists" USING btree ("user_id" bool_ops,"is_favorite_list" int4_ops) WHERE (is_favorite_list = true);--> statement-breakpoint
CREATE INDEX "idx_user_lists_is_public" ON "user_lists" USING btree ("is_public" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_user_lists_public" ON "user_lists" USING btree ("is_public" bool_ops) WHERE (is_public = true);--> statement-breakpoint
CREATE INDEX "idx_user_lists_user_id" ON "user_lists" USING btree ("user_id" int4_ops);
*/