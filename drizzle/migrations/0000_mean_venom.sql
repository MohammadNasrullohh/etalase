CREATE TABLE "jurnal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"tanggal_kegiatan" date NOT NULL,
	"kategori" varchar(50) NOT NULL,
	"link_publikasi" text,
	"dokumentasi" jsonb DEFAULT '[]'::jsonb,
	"dokumen_pendukung" jsonb DEFAULT '[]'::jsonb,
	"pihak_terkait" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb DEFAULT '[]'::jsonb,
	"is_published" boolean DEFAULT true NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jurnal_source_id_unique" UNIQUE("source_id")
);
--> statement-breakpoint
CREATE TABLE "pimpinan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"jabatan" text NOT NULL,
	"foto_url" text,
	"bio" text,
	"periode_mulai" date NOT NULL,
	"periode_selesai" date,
	"urutan" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pimpinan_source_id_unique" UNIQUE("source_id")
);
