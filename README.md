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
│   ├── documentation-panel/# Panel dokumentasi foto kegiatan + lightbox zoom
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

## API & Integrasi Lengkap

ALAS menyediakan dua kategori API: **API Publik** (untuk konsumsi frontend read-only) dan **Service API** (Bearer-protected untuk sinkronisasi data dari Lawet Hub).

---

## 1. API Publik (Unauthenticated)

Endpoint berikut dapat diakses secara bebas tanpa autentikasi. Seluruh response sukses mengembalikan HTTP `200 OK` dengan format JSON.

### A. Jurnal & Kegiatan

#### 1. List Jurnal
* **Endpoint:** `GET /api/jurnal`
* **Query Params (Opsional):**
  * `q` (string): Pencarian teks pada judul jurnal.
  * `kategori` (string): Filter kategori (`mou`, `audiensi`, `pelaporan`, `sengketa`, `lainnya`).
  * `date` (string, `YYYY-MM-DD`): Filter berdasarkan tanggal kegiatan tertentu.
  * `cursor` (string): ID jurnal terakhir untuk cursor pagination.
  * `limit` (number, default: `10`): Jumlah data per halaman.
* **Contoh Response:**
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "7b89d45e-1234-5678-abcd-ef0123456789",
        "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
        "tanggal_kegiatan": "2026-06-15",
        "kategori": "mou",
        "thumbnail_url": "https://media.domain.com/alas-public-assets/jurnal/uuid/thumb.jpg",
        "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }],
        "tags": ["mou", "kemitraan", "kampus"]
      }
    ],
    "pagination": {
      "next_cursor": "7b89d45e-1234-5678-abcd-ef0123456789",
      "has_more": true
    }
  }
  ```

#### 2. Detail Jurnal
* **Endpoint:** `GET /api/jurnal/:id`
* **Keterangan:** Mengembalikan informasi detail jurnal. File pendukung dalam array `dokumen_pendukung` hanya akan muncul jika memiliki atribut `"is_public": true`.
* **Contoh Response:**
  ```json
  {
    "status": "ok",
    "data": {
      "id": "7b89d45e-1234-5678-abcd-ef0123456789",
      "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
      "tanggal_kegiatan": "2026-06-15",
      "kategori": "mou",
      "link_publikasi": "https://bawaslu.go.id/artikel/123",
      "dokumentasi": [
        { "url": "https://...", "caption": "Serah Terima MoU", "type": "image" }
      ],
      "dokumen_pendukung": [
        { "nama": "Notulen Kesepakatan.pdf", "url": "https://...", "tipe": "pdf", "is_public": true }
      ],
      "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }],
      "custom_fields": [{ "label": "Nomor Nota Dinas", "value": "05/ND/2026" }]
    }
  }
  ```

#### 3. Kalender Kegiatan
* **Endpoint:** `GET /api/jurnal/calendar`
* **Query Params:** `month` (string, format `YYYY-MM`, Wajib).
* **Keterangan:** Mengembalikan daftar tanggal (day of month) yang memiliki kegiatan aktif pada bulan tersebut untuk visualisasi widget kalender.
* **Contoh Response (`GET /api/jurnal/calendar?month=2026-06`):**
  ```json
  {
    "status": "ok",
    "data": {
      "month": "2026-06",
      "dates": [1, 5, 15, 22]
    }
  }
  ```

#### 4. Statistik & Rekapitulasi Tahunan
* **Endpoint:** `GET /api/jurnal/stats`
* **Query Params (Opsional):** `year` (number, format `YYYY`).
* **Keterangan:** Mengembalikan aggregate jumlah kegiatan per kategori dan daftar tahun yang tersedia.
* **Contoh Response:**
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

#### 5. List Kategori Jurnal
* **Endpoint:** `GET /api/jurnal/kategori`
* **Contoh Response:**
  ```json
  {
    "status": "ok",
    "data": ["mou", "audiensi", "pelaporan", "sengketa", "lainnya"]
  }
  ```

---

### B. Profil Pimpinan

#### 1. List Pimpinan Aktif
* **Endpoint:** `GET /api/pimpinan`
* **Keterangan:** Mengembalikan daftar pimpinan yang sedang menjabat (`is_active = true`), diurutkan berdasarkan prioritas `urutan` terkecil.
* **Contoh Response:**
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "uuid-pimpinan",
        "nama": "Agus Widodo, S.H.",
        "jabatan": "Ketua Bawaslu",
        "foto_url": "https://...",
        "periode_mulai": "2023-08-15",
        "periode_selesai": "2028-08-14",
        "urutan": 1
      }
    ]
  }
  ```

#### 2. Detail Profil Pimpinan
* **Endpoint:** `GET /api/pimpinan/:id`

---

### C. System Utility

#### 1. Health Check
* **Endpoint:** `GET /api/health`
* **Response:**
  ```json
  {
    "status": "ok",
    "db_connected": true
  }
  ```

---

## 2. Service API (Bearer-Protected)

Digunakan untuk sinkronisasi real-time dari **Lawet Hub**. Seluruh endpoint di bawah ini mewajibkan header autentikasi:
```http
Authorization: Bearer <ALAS_SERVICE_TOKEN>
Content-Type: application/json
```

### A. Jurnal & Dokumentasi

#### 1. Create atau Upsert Jurnal
* **Endpoint:** `POST /api/service/jurnal`
* **Keterangan:** Membuat jurnal baru atau memperbarui jika `source_id` sudah ada. Dokumen pendukung baru default berstatus `is_public = true`.
* **Request Payload:**
  ```json
  {
    "source_id": "uuid-jurnal-lawethub",
    "judul": "Sosialisasi Pengawasan Pemilu Partisipatif",
    "tanggal_kegiatan": "2026-07-02",
    "kategori": "audiensi",
    "link_publikasi": "https://bawaslu.go.id/artikel/456",
    "dokumentasi": [
      {
        "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/img.jpg",
        "caption": "Penyampaian materi",
        "type": "image"
      }
    ],
    "dokumen_pendukung": [
      {
        "nama": "Materi_Sosialisasi.pdf",
        "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/doc.pdf",
        "tipe": "pdf"
      }
    ],
    "pihak_terkait": [{ "nama": "Kwartir Cabang Pramuka", "instansi": "Pramuka" }],
    "tags": ["sosialisasi", "partisipatif"],
    "custom_fields": []
  }
  ```
* **Response (201 Created / 200 Updated):**
  ```json
  {
    "status": "ok",
    "id": "uuid-internal-alas",
    "source_id": "uuid-jurnal-lawethub",
    "action": "created" // atau "updated"
  }
  ```

#### 2. Update Parsial Jurnal
* **Endpoint:** `PATCH /api/service/jurnal/:source_id`
* **Request Payload:** Mengirim field yang ingin diubah saja (misalnya untuk unpublish/draft):
  ```json
  {
    "is_published": false
  }
  ```

#### 3. Toggle Visibilitas Dokumen Pendukung
* **Endpoint:** `PATCH /api/service/jurnal/:source_id/dokumen`
* **Keterangan:** Digunakan oleh admin Lawet Hub untuk menyembunyikan/menampilkan lampiran dokumen secara spesifik bagi akses publik.
* **Request Payload:**
  ```json
  {
    "dokumen_pendukung": [
      { "nama": "Materi_Sosialisasi.pdf", "url": "https://...", "tipe": "pdf", "is_public": false }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "updated": 1
  }
  ```

#### 4. Detail Jurnal Internal (View Admin)
* **Endpoint:** `GET /api/service/jurnal/:source_id`
* **Keterangan:** Mengembalikan detail jurnal lengkap termasuk file yang disembunyikan (`is_public = false`).

#### 5. List Semua Jurnal (Published & Draft)
* **Endpoint:** `GET /api/service/jurnal`

#### 6. Soft Delete Jurnal
* **Endpoint:** `DELETE /api/service/jurnal/:source_id`
* **Keterangan:** Mengubah status `is_published` menjadi `false`. Data tetap tersimpan di database untuk kebutuhan audit trail.

---

### B. Manajemen Pimpinan

#### 1. Create atau Upsert Pimpinan
* **Endpoint:** `POST /api/service/pimpinan`
* **Request Payload:**
  ```json
  {
    "source_id": "uuid-pimpinan-lawethub",
    "nama": "Agus Widodo, S.H.",
    "jabatan": "Ketua Bawaslu",
    "foto_url": "https://media.domain.com/alas-public-assets/pimpinan/uuid/foto.jpg",
    "bio": "Komisioner Bawaslu Kebumen divisi Hukum...",
    "periode_mulai": "2023-08-15",
    "periode_selesai": "2028-08-14",
    "urutan": 1
  }
  ```

#### 2. Update Profil Pimpinan
* **Endpoint:** `PATCH /api/service/pimpinan/:source_id`

#### 3. Soft Delete Pimpinan
* **Endpoint:** `DELETE /api/service/pimpinan/:source_id`
* **Keterangan:** Mengubah status `is_active` menjadi `false`.

---

## Cara Integrasi Lawet Hub ➔ ALAS

Untuk mensinkronisasi data dari Lawet Hub (FastAPI/Python) ke ALAS (Next.js/Node.js), ikuti langkah-langkah implementasi di bawah ini:

### 1. Sinkronisasi Token Auth
Hasilkan service token yang kuat di server lokal menggunakan CLI:
```bash
openssl rand -hex 32
```
Tambahkan token ini ke `.env` di **kedua** project.

**ALAS side (`.env`):**
```bash
ALAS_SERVICE_TOKEN=8b93f124fa10b93a...
```

**Lawet Hub side (`.env`):**
```bash
ALAS_SERVICE_TOKEN=8b93f124fa10b93a...
ALAS_API_URL=https://alas.bawaslu-kebumen.go.id
```

### 2. Alur Manajemen Aset Media (MinIO)
Sebelum melakukan HTTP request ke ALAS Service API, pastikan aset media (foto dokumentasi, thumbnail, lampiran dokumen PDF) dipromosikan terlebih dahulu dari bucket internal Lawet Hub (`lawet-media`) ke bucket publik ALAS (`alas-public-assets`).

Format URL publik aset wajib mengikuti pola berikut:
```
https://{MINIO_ENDPOINT}/alas-public-assets/jurnal/{source_id}/{nama-file}
https://{MINIO_ENDPOINT}/alas-public-assets/pimpinan/{source_id}/{nama-file}
```

### 3. Implementasi HTTP Client (Python httpx)
Gunakan client class berikut di backend Lawet Hub untuk mengonsumsi Service API ALAS secara terpusat:

```python
import httpx

class ALASServiceClient:
    BASE_URL = settings.ALAS_API_URL
    TOKEN = settings.ALAS_SERVICE_TOKEN

    @classmethod
    def _headers(cls) -> dict:
        return {
            "Authorization": f"Bearer {cls.TOKEN}",
            "Content-Type": "application/json"
        }

    @classmethod
    async def upsert_jurnal(cls, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{cls.BASE_URL}/api/service/jurnal",
                json=payload, headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()

    @classmethod
    async def delete_jurnal(cls, source_id: str) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.delete(
                f"{cls.BASE_URL}/api/service/jurnal/{source_id}",
                headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()
```

### 4. Strategi Penanganan Kegagalan Sync (Resilience)
Integrasi ini menggunakan pendekatan **Data Integrity > Sync Consistency**:
* Jika ALAS Service API mengembalikan error `5xx` atau mengalami *timeout*, data jurnal di Lawet Hub **harus tetap tersimpan dengan status terpublish**.
* Set field `last_synced_at` pada database Lawet Hub ke status `NULL` atau tandai flag `sync_failed = True`.
* Sediakan tombol **"Retry Sync"** di admin dashboard Lawet Hub untuk memicu pemanggilan ulang `ALASServiceClient.upsert_jurnal(payload)` secara manual jika terjadi kegagalan jaringan atau server downtime.

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
