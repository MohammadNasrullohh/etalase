CREATE TABLE "service_events" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"resource_type" varchar(30) NOT NULL,
	"source_id" uuid NOT NULL,
	"operation" varchar(30) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "service_events_source_idx" ON "service_events" USING btree ("resource_type","source_id");