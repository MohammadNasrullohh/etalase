# Risk Assessment

| Risiko | Kemungkinan | Dampak | Pengendalian saat ini | Tindak lanjut |
| --- | --- | --- | --- | --- |
| Token Service API bocor atau tidak sinkron | Sedang | Tinggi | Bearer diverifikasi constant-time; write juga memerlukan HMAC bertimestamp; kedua secret hanya berasal dari env. | Rotasi kedua secret secara terkoordinasi dan gunakan secret manager deployment. |
| Lampiran sensitif tampil ke publik | Sedang | Tinggi | Endpoint jurnal publik menyaring dokumen dengan `is_public: true`. | Tambahkan test regresi untuk semua bentuk payload lampiran dan review visibilitas saat sync. |
| Gangguan Lawet Hub melumpuhkan authoring | Sedang | Sedang | Akses Lawet Hub hanya dari Server Action; arsip publik tetap membaca database ALAS. | Pantau keterjangkauan `LAWET_API_URL` dan siapkan prosedur retry sinkronisasi di Lawet Hub. |
| Drift data antara Lawet Hub dan ALAS | Rendah | Tinggi | Transactional outbox, event ledger, upsert atomik, retry exponential, dan reconciliation berkala. | Monitor row outbox `failed`, usia event pending, serta pertumbuhan ledger. |
| Migrasi produksi merusak ketersediaan | Rendah | Tinggi | Drizzle migration bersifat berurutan dan database berada pada volume persisten. | Backup sebelum migrasi, uji pada salinan data, dan jalankan health check sesudah deploy. |
| Dokumentasi tidak selaras dengan implementasi | Sedang | Sedang | `docs/` ditetapkan sebagai sumber aktif dan isu drift dicatat. | Perbarui dokumen pemilik bersamaan dengan perubahan kontrak atau route. |
