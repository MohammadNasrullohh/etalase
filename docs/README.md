# Dokumentasi ALAS

Dokumentasi aktif untuk **ALAS â€” Arsip Langkah Bawaslu Kebumen**. Berkas di sini adalah sumber rujukan untuk kondisi aplikasi saat ini; implementasi dan pengujian tetap menjadi bukti akhir.

| Area | Dokumen | Kegunaan |
| --- | --- | --- |
| Produk | [PRODUCT.md](product/PRODUCT.md) | Tujuan, pengguna, dan batasan produk |
| Arsitektur | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Batas modul, alur data, dan integrasi Lawet Hub |
| Data | [ERD.md](architecture/ERD.md) | Model PostgreSQL yang dikelola ALAS |
| Pengujian | [TESTING.md](architecture/TESTING.md) | Penempatan dan perintah verifikasi test |
| Operasional | [RUNBOOK.md](ops/RUNBOOK.md) | Menjalankan, migrasi, deploy, dan pemeriksaan kesehatan |
| Operasional | [KNOWN_ISSUES.md](ops/KNOWN_ISSUES.md) | Keterbatasan yang telah diketahui |
| Operasional | [RISK_ASSESSMENT.md](ops/RISK_ASSESSMENT.md) | Risiko aktif dan pengendaliannya |

## Konvensi

- `architecture/` dan `product/` adalah snapshot stabil yang diperbarui langsung saat kontrak sistem berubah.
- `ops/` hanya memuat `RUNBOOK.md`, `KNOWN_ISSUES.md`, dan `RISK_ASSESSMENT.md`; ketiganya adalah catatan hidup.
- Keputusan teknis besar yang telah disetujui dicatat sebagai ADR baru di `adr/NNNN-judul-singkat.md`. ADR yang sudah diterima tidak diubah atau dihapus.
- Dokumen lama yang sudah tidak aktif dipindahkan ke `legacy/`, tidak dihapus, dan tidak dipakai sebagai panduan implementasi.
