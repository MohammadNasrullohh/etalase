# Dokumentasi ALAS

Dokumentasi aktif untuk **ALAS — Arsip Langkah Bawaslu Kebumen**. Dokumen menjelaskan kondisi aplikasi saat ini; implementasi dan pengujian tetap menjadi bukti akhir.

| Area | Dokumen | Kegunaan |
| --- | --- | --- |
| Produk | [PRODUCT.md](product/PRODUCT.md) | Tujuan, pengguna, dan batasan produk. |
| Integrasi | [INTEGRATION.md](architecture/INTEGRATION.md) | Kontrak HTTP, HMAC, outbox, reconciliation, dan dashboard read-only. |
| Desain | [design.md](architecture/design.md) | Spesifikasi design system & glassmorphism. |
| Arsitektur | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Batas modul, alur data, FSD, dan repository isolation. |
| Data | [ERD.md](architecture/ERD.md) | Model PostgreSQL yang dikelola ALAS. |
| Pengujian | [TESTING.md](architecture/TESTING.md) | Penempatan dan perintah verifikasi test. |
| Operasional | [RUNBOOK.md](ops/RUNBOOK.md) | Menjalankan, migration, deploy, dan health check. |
| Operasional | [KNOWN_ISSUES.md](ops/KNOWN_ISSUES.md) | Keterbatasan yang telah diketahui. |
| Operasional | [RISK_ASSESSMENT.md](ops/RISK_ASSESSMENT.md) | Risiko aktif dan pengendaliannya. |

## Konvensi

- `architecture/` dan `product/` adalah snapshot stabil yang diperbarui langsung saat kontrak sistem berubah.
- `ops/` memuat catatan hidup untuk operasi, risiko, dan known issues.
- Kontrak runtime lintas aplikasi berada di [INTEGRATION.md](architecture/INTEGRATION.md), bukan diduplikasi dalam README.
- Keputusan teknis besar yang disetujui dicatat sebagai ADR baru di `adr/NNNN-judul-singkat.md`. ADR yang sudah diterima tidak diubah atau dihapus.
- Dokumen lama yang tidak aktif dipindahkan ke `legacy/`, tidak dihapus, dan tidak dipakai sebagai panduan implementasi.
