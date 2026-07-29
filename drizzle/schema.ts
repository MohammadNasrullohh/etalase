import { pgTable, uuid, text, date, varchar, jsonb, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const jurnal = pgTable('jurnal', {
  id:               uuid('id').primaryKey().defaultRandom(),
  source_id:        uuid('source_id').notNull().unique(),
  judul:            text('judul').notNull(),
  tanggal_kegiatan: date('tanggal_kegiatan').notNull(),
  kategori:         varchar('kategori', { length: 50 }).notNull(),
  link_publikasi:   text('link_publikasi'),
  dokumentasi:      jsonb('dokumentasi').default([]),
  dokumen_pendukung:jsonb('dokumen_pendukung').default([]),
  pihak_terkait:    jsonb('pihak_terkait').default([]),
  custom_fields:    jsonb('custom_fields').default([]),
  tags:             jsonb('tags').default([]),
  redaksi:          text('redaksi'),
  divisi:           text('divisi'),
  is_published:     boolean('is_published').notNull().default(true),
  synced_at:        timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
  created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('jurnal_public_tanggal_id_idx')
    .on(table.tanggal_kegiatan.desc(), table.id.desc())
    .where(sql`${table.is_published} = true`),
  index('jurnal_public_kategori_tanggal_id_idx')
    .on(table.kategori, table.tanggal_kegiatan.desc(), table.id.desc())
    .where(sql`${table.is_published} = true`),
])

export const pimpinan = pgTable('pimpinan', {
  id:              uuid('id').primaryKey().defaultRandom(),
  source_id:       uuid('source_id').notNull().unique(),
  nama:            text('nama').notNull(),
  jabatan:         text('jabatan').notNull(),
  foto_url:        text('foto_url'),
  bio:             text('bio'),
  periode_mulai:   date('periode_mulai').notNull(),
  periode_selesai: date('periode_selesai'),
  urutan:          integer('urutan').notNull().default(0),
  is_active:       boolean('is_active').notNull().default(true),
  created_at:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Konfigurasi global yang hanya dapat diubah oleh administrator ALAS. */
export const siteSettings = pgTable('site_settings', {
  // Satu record singleton (id = 1), ditegakkan lagi oleh CHECK di migrasi.
  id:              integer('id').primaryKey().default(1),
  hero_image_path: text('hero_image_path'),
  hero_title:      text('hero_title'),
  hero_subtitle:   text('hero_subtitle'),
  updated_at:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
