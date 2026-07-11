export interface DokumentasiItem {
  url: string
  caption?: string
  type: string
}

export interface DokumenPendukungItem {
  nama: string
  url: string
  tipe: string
  is_public?: boolean
}

export interface PihakTerkaitItem {
  nama: string
  instansi?: string
}

export interface CustomFieldItem {
  label: string
  value: string
}

export interface JurnalSubmissionPayload {
  judul: string
  tanggal_kegiatan: string
  kategori: string
  dokumentasi: DokumentasiItem[]
  dokumen_pendukung: DokumenPendukungItem[]
  pihak_terkait: PihakTerkaitItem[]
  custom_fields: CustomFieldItem[]
  tags: string[]
  link_publikasi?: string
}
