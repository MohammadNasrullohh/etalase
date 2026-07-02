ALTER TABLE "jurnal" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jurnal" ADD COLUMN "redaksi" text;