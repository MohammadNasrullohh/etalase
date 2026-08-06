# ADR-0004: ALAS Local Write Capabilities & Bidirectional Sync

Status: Accepted
Tanggal: 2026-08-06

## Konteks

Sebelumnya (melalui ADR-0002 dan PRD v1.2), ALAS ditetapkan sebagai sistem *read-only* murni, di mana semua *authoring workflow* (pengajuan, revisi, approval) hanya dapat dilakukan di Lawet Hub. Akses dari ALAS dibatasi melalui JWT *read-only*. 
Namun, terdapat kebutuhan produk baru untuk memungkinkan seluruh *workflow*—mulai dari pengajuan staf, revisi, pengajuan ulang, hingga approve—dapat dilakukan langsung di ALAS dengan memanfaatkan database lokal (`alas-db`) sebagai proksi penulisan (*write proxy*). Hal ini menimbulkan tantangan sinkronisasi dua arah (*bidirectional sync*) dan potensi *race condition* jika data yang sama dimodifikasi baik di ALAS maupun di Lawet Hub.

## Keputusan

1. **Local Write & Optimistic UI:** ALAS diizinkan untuk melakukan mutasi data secara lokal di `alas-db`. ALAS tidak lagi *read-only* untuk domain tertentu (seperti Jurnal). Mutasi seperti membuat pengajuan baru, merevisi, dan menyetujui akan langsung mengubah state di `alas-db`.
2. **Penambahan Field Workflow di Skema ALAS:** Tabel `jurnal` di `drizzle/schema.ts` akan ditambahkan kolom `workflow_status` (misal: `draft`, `submitted`, `revision_required`, `approved`) dan `workflow_notes` untuk mencatat revisi.
3. **Outbox Pattern di ALAS:** Setiap mutasi lokal di ALAS akan dicatat dalam tabel `alas_outbox` lokal. Celery worker atau *background job* di ALAS akan bertugas mengirimkan mutasi ini ke Lawet Hub melalui endpoint khusus (menggunakan *Service Token*).
4. **Penyelesaian Race Condition (LWW & Source of Truth):**
   - Lawet Hub tetap bertindak sebagai *Ultimate Source of Truth*.
   - Menggunakan *Last Write Wins (LWW)* berdasarkan kolom `updated_at`. Jika ALAS mengirimkan mutasi ke Lawet Hub, namun data di Lawet Hub memiliki `updated_at` yang lebih baru, Lawet Hub berhak menolak mutasi (konflik), dan ALAS harus menarik data terbaru (re-sync).
   - Penggunaan `version` field (Optimistic Concurrency Control) akan diterapkan pada entitas yang disinkronisasi untuk menghindari *race condition*.
5. **Pemisahan JWT vs Service Token:** *User* yang melakukan mutasi di ALAS akan diotorisasi secara lokal di ALAS, dan sinkronisasi ke Lawet Hub akan diteruskan *machine-to-machine* menggunakan `ALAS_SERVICE_TOKEN`, bukan meneruskan JWT pengguna.

## Konsekuensi

- **Kompleksitas Sinkronisasi:** Membutuhkan implementasi *worker/outbox* di sisi ALAS untuk sinkronisasi pengiriman data ke Lawet Hub.
- **Perubahan Skema Database:** Membutuhkan migrasi database di sisi ALAS (penambahan field status, dll) dan mungkin di sisi Lawet Hub untuk menerima *write proxy* dari ALAS.
- **Pencabutan Parsial ADR-0002:** ADR-0002 yang menyatakan *"UI pengajuan dan approval mengarahkan tindakan tulis ke Lawet Hub"* tidak lagi berlaku penuh untuk fitur pengajuan Jurnal; ALAS sekarang dapat menanganinya secara mandiri.
- **Duplikasi Logika Validasi:** Validasi kolom (batas char, nullable, dll) harus ditegakkan ketat di ALAS (melalui Zod / Drizzle schema) dan disesuaikan dengan ketentuan yang ada di Lawet Hub agar data tidak ditolak saat proses sinkronisasi.

## Alternatif yang Ditolak

- **Menulis langsung ke database Lawet Hub dari ALAS:** Melanggar batasan arsitektur *repository isolation* dan penggabungan kredensial DB.
- **Proxy Synchronous ke API Lawet Hub saat aksi user:** Berisiko gagal jika Lawet Hub *down*, merusak konsep ALAS sebagai *offline-tolerant write proxy*.
