CREATE TABLE "game" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"players" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" text PRIMARY KEY NOT NULL,
	"game_slug" text NOT NULL,
	"mode" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "match_player" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"result" text NOT NULL,
	"score" text
);
--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_game_slug_game_slug_fk" FOREIGN KEY ("game_slug") REFERENCES "public"."game"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_player" ADD CONSTRAINT "match_player_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_player" ADD CONSTRAINT "match_player_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;