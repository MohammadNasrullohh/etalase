# ALAS — Arsip Langkah Bawaslu Kebumen

> Portal arsip publik **read-only** untuk kegiatan dan pimpinan Bawaslu Kebumen.  
> Ditenagai oleh Next.js 14, PostgreSQL, dan Drizzle ORM.  
> Konten dikelola dari **Lawet Hub** melalui Service API.

---

## Daftar Isi

- [Arsitektur Singkat](#arsitektur-singkat)
- [Tech Stack](#tech-stack)
- [Struktur Direktori](#struktur-direktori)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Environment Variables](#environment-variables)
- [API Publik](#api-publik)
- [Integrasi dengan Lawet Hub](#integrasi-dengan-lawet-hub)
- [Deploy (Docker)](#deploy-docker)

---

## Arsitektur Singkat

```
Lawet Hub (sumber konten)
    │  Bearer Token Auth
    │  POST/PATCH/DELETE
    ▼
ALAS Service API  →  PostgreSQL (alas-db)
    │
    ▼
ALAS Frontend (Next.js App Router)
    └── Disajikan publik via Cloudflare Tunnel
```

**ALAS tidak punya UI authoring.** Semua data masuk melalui Lawet Hub yang memanggil ALAS Service API. ALAS hanya membaca dan menampilkan.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Styling | Tailwind CSS |
| Chart | D3.js (lazy-loaded) |
| State | TanStack Query (React Query) |
| Testing | Vitest + React Testing Library |
| Container | Docker + Nginx |
| Tunnel | Cloudflare Tunnel |

---

## Struktur Direktori

Mengikuti arsitektur **Feature Sliced Design (FSD)**:

```
src/
├── app/                    # Routing layer (Next.js App Router)
│   └── api/
│       ├── jurnal/         # GET /api/jurnal — daftar & detail
│       │   ├── [id]/       # GET /api/jurnal/:id
│       │   ├── calendar/   # GET /api/jurnal/calendar?month=YYYY-MM
│       │   └── stats/      # GET /api/jurnal/stats?year=YYYY
│       ├── pimpinan/       # GET /api/pimpinan
│       └── service/        # Service API (Bearer-protected)
│           ├── jurnal/     # POST, PATCH, DELETE jurnal
│           └── pimpinan/   # POST, PATCH, DELETE pimpinan
│
├── entities/               # Tipe data, query, dan card UI primitif
│   ├── jurnal/
│   └── pimpinan/
│
├── features/               # Fitur-fitur spesifik
│   ├── jurnal-filter/      # SearchBar + KategoriDropdown
│   ├── jurnal-sync/        # Service API handler logic
│   └── pimpinan-sync/
│
├── widgets/                # Komponen gabungan (multi-entity)
│   ├── jurnal-list/        # Daftar jurnal dengan infinite scroll
│   ├── leadership-panel/   # Panel pimpinan aktif + bezier line
│   ├── calendar-widget/    # Kalender kegiatan
│   └── stats-section/      # Chart rekapitulasi tahunan (D3)
│
├── views/
│   └── landing/            # Halaman utama (3-section layout)
│
└── shared/                 # Shared lib, token warna, DB singleton
    ├── lib/db.ts
    └── ui/futuristic-line.tsx

drizzle/
├── schema.ts               # Definisi tabel jurnal & pimpinan
└── migrations/             # File migrasi SQL

tests/                      # Vitest test suites
```

---

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20+
- Docker & Docker Compose (untuk database)

### 1. Clone & Install

```bash
git clone https://github.com/naxprmn/alas.git
cd alas
npm install
```

### 2. Jalankan Database

```bash
# Start PostgreSQL via Docker (port 5433)
docker compose -f docker-compose.alas.yml up alas-db -d
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env — minimal isi DATABASE_URL dan ALAS_SERVICE_TOKEN
```

### 4. Jalankan Migrasi

```bash
npx drizzle-kit migrate
```

### 5. Seed Data (opsional, untuk development)

```bash
npx ts-node scripts/seed.ts
```

### 6. Jalankan Dev Server

```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Salin `.env.example` ke `.env` dan isi nilainya:

```bash
# Database
ALAS_DB_NAME=alas
ALAS_DB_USER=alas_user
ALAS_DB_PASSWORD=<strong-password>
DATABASE_URL=postgresql://alas_user:<password>@alas-db:5432/alas

# Service Auth — HARUS SAMA dengan nilai di Lawet Hub
# Generate: openssl rand -hex 32
ALAS_SERVICE_TOKEN=<generated-token>

# Integration URLs
LAWET_HUB_ADMIN_URL=https://lawethub.pusdakum.web.id/superadmin/jurnal-alas
NEXT_PUBLIC_MINIO_PUBLIC_ENDPOINT=https://media.domain.com
NEXT_PUBLIC_ALAS_API_URL=https://alas.bawaslu-kebumen.go.id/api

# Sentry (opsional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## API Publik

Endpoint berikut dapat diakses siapa saja tanpa autentikasi:

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/jurnal` | Daftar jurnal (cursor pagination, filter q & kategori) |
| `GET` | `/api/jurnal/:id` | Detail jurnal (hanya dokumen `is_public=true`) |
| `GET` | `/api/jurnal/calendar?month=YYYY-MM` | Tanggal kegiatan dalam bulan tertentu |
| `GET` | `/api/jurnal/stats?year=YYYY` | Rekapitulasi per kategori + daftar tahun |
| `GET` | `/api/pimpinan` | Daftar pimpinan aktif |
| `GET` | `/api/pimpinan/:id` | Detail profil pimpinan |
| `GET` | `/api/health` | Health check (`{"status":"ok","db_connected":true}`) |

### Contoh Response `/api/jurnal`

```json
{
  "status": "ok",
  "data": [
    {
      "id": "uuid",
      "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
      "tanggal_kegiatan": "2026-06-15",
      "kategori": "mou",
      "thumbnail_url": "https://media.domain.com/...",
      "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }]
    }
  ],
  "pagination": { "next_cursor": "uuid", "has_more": true }
}
```

### Contoh Response `/api/jurnal/stats`

```json
{
  "status": "ok",
  "years": [2024, 2025, 2026],
  "year": 2026,
  "stats": {
    "mou": 3,
    "audiensi": 8,
    "pelaporan": 5,
    "sengketa": 2,
    "lainnya": 1
  }
}
```

---

## Integrasi dengan Lawet Hub

> Dokumentasi lengkap ada di [INTEGRATION.md](./INTEGRATION.md)

### Konsep Dasar

ALAS adalah **read-replica** yang menerima data dari Lawet Hub via **Service API** yang dilindungi Bearer Token. Lawet Hub adalah satu-satunya yang boleh menulis data ke ALAS.

```
[Admin Lawet Hub] → Klik "Publish"
        ↓
Lawet Hub: promote aset ke MinIO alas-public-assets
        ↓
POST https://alas.bawaslu-kebumen.go.id/api/service/jurnal
Authorization: Bearer <ALAS_SERVICE_TOKEN>
        ↓
ALAS: validasi token → upsert ke PostgreSQL
        ↓
[Publik] → jurnal tampil di landing page ALAS
```

### Service API Endpoints (Bearer-Protected)

Base URL: `https://alas.bawaslu-kebumen.go.id`

**Jurnal:**

| Method | Endpoint | Aksi |
|---|---|---|
| `POST` | `/api/service/jurnal` | Create atau upsert jurnal |
| `PATCH` | `/api/service/jurnal/:source_id` | Update sebagian field jurnal |
| `PATCH` | `/api/service/jurnal/:source_id/dokumen` | Toggle visibilitas dokumen |
| `GET` | `/api/service/jurnal/:source_id` | Detail lengkap (termasuk `is_public=false`) |
| `GET` | `/api/service/jurnal` | List semua jurnal (published + draft) |
| `DELETE` | `/api/service/jurnal/:source_id` | Soft delete (set `is_published=false`) |

**Pimpinan:**

| Method | Endpoint | Aksi |
|---|---|---|
| `POST` | `/api/service/pimpinan` | Create atau upsert pimpinan |
| `PATCH` | `/api/service/pimpinan/:source_id` | Update profil pimpinan |
| `DELETE` | `/api/service/pimpinan/:source_id` | Soft delete (set `is_active=false`) |

### Autentikasi Service API

```bash
# Generate token sekali, simpan di KEDUA .env (ALAS dan Lawet Hub)
openssl rand -hex 32
```

```http
POST /api/service/jurnal
Authorization: Bearer <ALAS_SERVICE_TOKEN>
Content-Type: application/json
```

Token divalidasi menggunakan `crypto.timingSafeEqual()` untuk mencegah timing attack. Request tanpa token atau dengan token salah → `401 Unauthorized`.

### Payload Jurnal (Create/Update)

```json
{
  "source_id": "uuid-dari-lawet-hub",
  "judul": "Sidang Pleno Rekomendasi Hasil Temuan Coklit",
  "tanggal_kegiatan": "2026-06-15",
  "kategori": "sengketa",
  "link_publikasi": "https://bawaslu.go.id/artikel/123",
  "dokumentasi": [
    { "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/foto.jpg",
      "caption": "Sidang berlangsung", "type": "image" }
  ],
  "dokumen_pendukung": [
    { "nama": "Notulen Rapat", "url": "https://media.domain.com/.../notulen.pdf", "tipe": "pdf" }
  ],
  "pihak_terkait": [{ "nama": "KPU Kebumen", "instansi": null }],
  "custom_fields": [{ "label": "Nomor Surat", "value": "001/SK/2026" }]
}
```

> **Catatan:** `dokumen_pendukung` tidak perlu menyertakan `is_public`. ALAS mengelolanya secara internal.

### Kategori yang Didukung

| Nilai | Label |
|---|---|
| `mou` | MoU |
| `audiensi` | Audiensi |
| `pelaporan` | Pelaporan |
| `sengketa` | Sengketa |
| `lainnya` | Lainnya |

### MinIO — Aset Publik

Sebelum memanggil ALAS Service API, Lawet Hub harus **mempromote** aset dari bucket internal (`lawet-media`) ke bucket publik (`alas-public-assets`):

```
https://media.domain.com/alas-public-assets/jurnal/{source_id}/{filename}
https://media.domain.com/alas-public-assets/pimpinan/{source_id}/{filename}
```

Bucket `alas-public-assets` dikonfigurasi dengan **anonymous GET** sehingga dapat diakses langsung oleh browser.

---

## Deploy (Docker)

```bash
# 1. Clone dan setup env
git clone https://github.com/naxprmn/alas.git
cd alas
cp .env.example .env
# Edit .env dengan nilai produksi

# 2. Build dan jalankan semua service
docker compose -f docker-compose.alas.yml up -d --build

# 3. Jalankan migrasi DB
docker exec alas-app npx drizzle-kit migrate
```

**Services yang dijalankan:**

| Container | Port Host | Keterangan |
|---|---|---|
| `alas-app` | 3001 | Next.js app |
| `alas-nginx` | 2006 | Reverse proxy ke alas-app |
| `alas-db` | 5433 | PostgreSQL 16 |

Cloudflare Tunnel mengarah ke `alas-nginx:2006` untuk domain `alas.bawaslu-kebumen.go.id`.

### Health Check

```bash
curl https://alas.bawaslu-kebumen.go.id/api/health
# {"status":"ok","db_connected":true}
```

---

## Testing

```bash
npm run test          # Jalankan semua test
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Test suites mencakup: auth middleware, CRUD jurnal, DB queries, dan komponen UI.

---

## Kontributor

Proyek ini dikelola oleh tim teknis **Bawaslu Kebumen**.  
Untuk pengelolaan konten, gunakan dashboard **Lawet Hub** (akses terbatas).
