CREATE TABLE "folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_sets" ADD COLUMN "folder_id" integer;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "folders_user_id_index" ON "folders" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "folders_user_id_lower_name_unique" ON "folders" USING btree ("user_id",lower("name"));--> statement-breakpoint
ALTER TABLE "study_sets" ADD CONSTRAINT "study_sets_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "study_sets_folder_id_index" ON "study_sets" USING btree ("folder_id");