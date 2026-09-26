CREATE TABLE "user_card_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_card_progress_user_id_card_id_unique" UNIQUE("user_id","card_id")
);
--> statement-breakpoint
ALTER TABLE "user_card_progress" ADD CONSTRAINT "user_card_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_card_progress" ADD CONSTRAINT "user_card_progress_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;