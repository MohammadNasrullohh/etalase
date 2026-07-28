CREATE INDEX "jurnal_public_tanggal_id_idx" ON "jurnal" USING btree ("tanggal_kegiatan" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "jurnal"."is_published" = true;--> statement-breakpoint
CREATE INDEX "jurnal_public_kategori_tanggal_id_idx" ON "jurnal" USING btree ("kategori","tanggal_kegiatan" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "jurnal"."is_published" = true;
--> statement-breakpoint
CREATE INDEX "jurnal_public_tags_idx" ON "jurnal" USING gin ("tags" jsonb_path_ops) WHERE "jurnal"."is_published" = true;
