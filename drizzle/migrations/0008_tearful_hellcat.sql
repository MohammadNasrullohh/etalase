CREATE TABLE "alas_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"operation" varchar(30) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jurnal" ADD COLUMN "workflow_status" varchar(50) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "jurnal" ADD COLUMN "workflow_notes" text;--> statement-breakpoint
ALTER TABLE "jurnal" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "alas_outbox_status_idx" ON "alas_outbox" USING btree ("status");