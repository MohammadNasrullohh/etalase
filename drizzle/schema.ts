import { pgTable, uuid, text, date, varchar, jsonb, boolean, timestamp, integer } from 'drizzle-orm/pg-core'

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
  is_published:     boolean('is_published').notNull().default(true),
  synced_at:        timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
  created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

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
