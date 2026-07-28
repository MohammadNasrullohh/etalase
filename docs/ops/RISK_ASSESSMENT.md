# Risk Assessment

| Risiko | Kemungkinan | Dampak | Pengendalian saat ini | Tindak lanjut |
| --- | --- | --- | --- | --- |
| Token Service API bocor atau tidak sinkron | Sedang | Tinggi | Bearer token diverifikasi dengan perbandingan constant-time; token berada di environment. | Rotasi token terkoordinasi di ALAS dan Lawet Hub serta gunakan secret manager deployment. |
| Lampiran sensitif tampil ke publik | Sedang | Tinggi | Endpoint jurnal publik menyaring dokumen dengan `is_public: true`. | Tambahkan test regresi untuk semua bentuk payload lampiran dan review visibilitas saat sync. |
| Gangguan Lawet Hub melumpuhkan authoring | Sedang | Sedang | Akses Lawet Hub hanya dari Server Action; arsip publik tetap membaca database ALAS. | Pantau keterjangkauan `LAWET_API_URL` dan siapkan prosedur retry sinkronisasi di Lawet Hub. |
| Drift data antara Lawet Hub dan ALAS | Sedang | Sedang | Upsert memakai `source_id` unik dan soft delete menjaga jejak lokal. | Catat hasil sync/retry dan lakukan rekonsiliasi berkala berdasarkan `source_id`. |
| Migrasi produksi merusak ketersediaan | Rendah | Tinggi | Drizzle migration bersifat berurutan dan database berada pada volume persisten. | Backup sebelum migrasi, uji pada salinan data, dan jalankan health check sesudah deploy. |
| Dokumentasi tidak selaras dengan implementasi | Sedang | Sedang | `docs/` ditetapkan sebagai sumber aktif dan isu drift dicatat. | Perbarui dokumen pemilik bersamaan dengan perubahan kontrak atau route. |
