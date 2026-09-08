import { z } from 'zod'

export const dokumentasiItemSchema = z.object({
  url: z.string().url('URL tidak valid'),
  caption: z.string().optional(),
  type: z.enum(['image', 'video'])
})
export type DokumentasiItem = z.infer<typeof dokumentasiItemSchema>

export const dokumenPendukungItemSchema = z.object({
  nama: z.string().min(1, 'Nama dokumen wajib diisi'),
  url: z.string().url('URL dokumen tidak valid'),
  tipe: z.enum(['pdf']),
  is_public: z.boolean().default(false)
})
export type DokumenPendukungItem = z.infer<typeof dokumenPendukungItemSchema>

export const pihakTerkaitItemSchema = z.object({
  nama: z.string().min(1, 'Nama pihak terkait wajib diisi'),
  instansi: z.string().optional()
})
export type PihakTerkaitItem = z.infer<typeof pihakTerkaitItemSchema>

export const customFieldItemSchema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  value: z.string().min(1, 'Value wajib diisi')
})
export type CustomFieldItem = z.infer<typeof customFieldItemSchema>

export const jurnalSubmissionSchema = z.object({
  judul: z.string().min(3, 'Judul minimal 3 karakter').max(255, 'Judul maksimal 255 karakter'),
  tanggal_kegiatan: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  kategori: z.string().min(1, 'Kategori wajib diisi').max(50, 'Kategori maksimal 50 karakter'),
  dokumentasi: z.array(dokumentasiItemSchema).default([]),
  dokumen_pendukung: z.array(dokumenPendukungItemSchema).default([]),
  pihak_terkait: z.array(pihakTerkaitItemSchema).default([]),
  custom_fields: z.array(customFieldItemSchema).default([]),
  tags: z.array(z.string()).default([]),
  link_publikasi: z.union([z.string().url('Link publikasi tidak valid'), z.literal('')]).optional()
})

export type JurnalSubmissionPayload = z.infer<typeof jurnalSubmissionSchema>
