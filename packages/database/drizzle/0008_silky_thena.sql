CREATE TABLE "set_tags" (
	"set_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "set_tags_set_id_tag_id_pk" PRIMARY KEY("set_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "set_tags" ADD CONSTRAINT "set_tags_set_id_study_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."study_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_tags" ADD CONSTRAINT "set_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "set_tags_tag_id_index" ON "set_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_id_lower_name_unique" ON "tags" USING btree ("user_id",lower("name"));