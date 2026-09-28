ALTER TABLE "folders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "folders" CASCADE;--> statement-breakpoint
DROP INDEX "study_sets_folder_id_index";--> statement-breakpoint
ALTER TABLE "study_sets" DROP COLUMN "folder_id";
