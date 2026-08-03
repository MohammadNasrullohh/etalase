# Arsitektur ALAS

ALAS adalah aplikasi Next.js 14 dengan App Router yang memisahkan pengalaman arsip publik, panel authoring, API publik, dan Service API integrasi. PostgreSQL adalah penyimpanan lokal untuk data arsip yang diterbitkan.

```mermaid
flowchart LR
    Public[Pengunjung publik] --> Web[Next.js: halaman publik dan API publik]
    Staff[Staf / approver] --> Panel[Next.js: panel authoring]
    Panel -->|cookie bearer server-side| Lawet[Lawet Hub API]
    Lawet --> Outbox[(Transactional outbox)]
    Outbox -->|Bearer + HMAC + event_id| Service[Next.js: Service API]
    Web --> DB[(PostgreSQL)]
    Service --> DB
```

## Batas Sistem

| Area | Lokasi | Tanggung jawab |
| --- | --- | --- |
| Routing dan endpoint | `src/app/` | Page App Router, route handler, dan layout panel. |
| Tampilan halaman | `src/views/`, `src/widgets/` | Susunan UI tingkat halaman dan komposisi multi-entitas. |
| Fitur | `src/features/` | Filter jurnal, autentikasi Lawet Hub, workflow pengajuan/approval, dan sinkronisasi Service API. |
| Entitas | `src/entities/` | Query, model, dan UI untuk `jurnal` serta `pimpinan`. |
| Shared | `src/shared/` | Koneksi basis data dan komponen yang dipakai lintas area. |
| Persistensi | `drizzle/` | Skema Drizzle, migrasi, dan seed data. |

Alias TypeScript `@/*` menunjuk ke `src/*`. Ketergantungan diarahkan dari page/widget/feature ke entity dan shared; shared tidak boleh bergantung pada feature.

## Alur Data

### Arsip publik

Halaman `/` menggunakan `LandingView`, yang membaca endpoint publik. Route handler publik hanya mengembalikan jurnal yang layak tampil, menyaring lampiran berdasarkan `is_public`, dan mengubah foto gambar pertama menjadi `thumbnail_url`.

Endpoint publik yang tersedia:

| Endpoint | Fungsi |
| --- | --- |
| `GET /api/jurnal` | Daftar jurnal dengan pencarian, kategori, tanggal, dan cursor pagination. |
| `GET /api/jurnal/:id` | Detail jurnal publik. |
| `GET /api/jurnal/calendar?month=YYYY-MM` | Tanggal yang memiliki kegiatan. |
| `GET /api/jurnal/stats?year=YYYY` | Rekap kategori dan tahun yang tersedia. |
| `GET /api/jurnal/kategori` | Daftar kategori jurnal. |
| `GET /api/pimpinan?date=YYYY-MM-DD` | Pimpinan aktif untuk suatu tanggal. |
| `GET /api/pimpinan/:id` | Detail pimpinan. |
| `GET /api/health` | Pemeriksaan koneksi database dan uptime proses. |

### Authoring dan approval

Layout grup rute `(authoring)` memanggil `getMeAction`. Token Lawet Hub disimpan sebagai cookie HTTP-only bernama `lawet_token`; token tersebut hanya diteruskan dari Server Action ALAS ke `LAWET_API_URL`. Pengunjung tanpa sesi dialihkan ke `/login`; halaman `/approval` hanya muncul bagi peran dengan `level >= 2`.

Pengajuan dan approval tidak langsung menulis PostgreSQL ALAS. Keduanya memanggil API Lawet Hub. Lawet Hub kemudian bertanggung jawab mengirimkan perubahan publik ke Service API ALAS.

### Service API

Route di `src/app/api/service/` menerima bearer service token. Semua operasi tulis juga wajib membawa `X-ALAS-Event-Id`, `X-ALAS-Timestamp`, dan `X-ALAS-Signature`. Signature HMAC-SHA256 meliputi timestamp, method, path, dan hash body; replay dibatasi oleh `ALAS_REPLAY_WINDOW_SECONDS`. Event diklaim dalam transaksi yang sama dengan mutasi, sehingga retry outbox tidak menerapkan event dua kali. Upsert jurnal/pimpinan memakai `source_id` unik dan `ON CONFLICT` atomik.

Lawet Hub mencatat desired state ke transactional outbox. Worker mengirimnya dengan timeout serta exponential backoff dari env, dan reconciliation berkala mengantrekan ulang proyeksi yang seharusnya published, draft setelah unpublish, atau deleted. Keputusan lengkap ada di [ADR-0001](../adr/0001-direct-service-delivery-guarantees.md).

Kontrak payload dan status respons Service API historis masih dapat ditemukan di README root. Saat kontrak berubah, perbarui dokumen ini dan dokumentasi integrasi dalam perubahan yang sama.

## Konfigurasi dan Infrastruktur

- `DATABASE_URL` menghubungkan aplikasi ke PostgreSQL.
- `ALAS_SERVICE_TOKEN` mengamankan Service API dan harus sama dengan konfigurasi pengirim di Lawet Hub.
- `ALAS_WEBHOOK_SECRET` menandatangani write Direct Service dan harus berbeda dari bearer token.
- `ALAS_REPLAY_WINDOW_SECONDS` menentukan toleransi usia timestamp signature.
- `LAWET_API_URL` hanya dipakai server-side untuk login dan workflow authoring Lawet Hub.
- Docker Compose menjalankan `alas-db`, `alas-app`, dan `alas-nginx` pada jaringan `alas-net`; Nginx adalah reverse proxy untuk aplikasi Next.js.

Panduan operasional ada di [RUNBOOK.md](../ops/RUNBOOK.md), sedangkan struktur data di [ERD.md](ERD.md).
