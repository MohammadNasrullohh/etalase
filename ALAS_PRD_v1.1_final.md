# PRD — ALAS (Arsip Langkah Bawaslu Kebumen)
**Versi:** 1.1-final | **Tanggal:** Juli 2026 | **Status:** Final
**Author:** Adh | **Reviewer:** —

---

## 1. Background & Problem Statement

Bawaslu Kebumen tidak memiliki jurnal kegiatan / catatan perjalanan institusi yang terpusat. Akibatnya, institusi kesulitan merekonstruksi histori kegiatan penting (MoU, sengketa, audiensi, pelaporan, dll.) dalam rentang waktu tertentu (mis. "setahun terakhir"). Dokumentasi kegiatan saat ini tersebar di berbagai channel (Instagram, WA, file lokal staff) tanpa indeks kronologis maupun pencarian terstruktur.

**Root cause:** tidak ada *single source of truth* untuk histori kegiatan institusi yang terstruktur secara kronologis dan dapat diakses publik sebagai bentuk transparansi.

---

## 2. Goals & Non-Goals

**Goals**
- Menyediakan arsip kronologis kegiatan institusi yang dapat diakses publik (transparansi).
- Memungkinkan browsing kegiatan berdasarkan rentang waktu via kalender interaktif.
- Zero duplikasi effort: konten kegiatan diisi sekali di Lawet Hub, otomatis tersinkron ke ALAS.
- Read-side terdekopling penuh dari Lawet Hub — ALAS tetap bisa serve traffic publik walau Lawet Hub down.
- Admin dapat mengontrol visibilitas dokumen pendukung (public/private) per-dokumen dari dashboard ALAS, tanpa mengubah data source di Lawet Hub.

**Non-Goals (v1.1)**
- ALAS tidak memiliki fitur authoring jurnal sendiri. Semua input konten terjadi di Lawet Hub.
- ALAS tidak melakukan approval workflow — itu domain Lawet Hub.
- Dashboard ALAS hanya untuk manajemen visibilitas dokumen, bukan CRUD jurnal.
- Tidak ada user-generated content (komentar publik, like, dll.) di v1.1.
- Tidak ada fitur search/filter di v1.1 (roadmap v1.2).

---

## 3. System Architecture

```
┌─────────────────────┐    webhook (push, HMAC-signed)     ┌──────────────────────────┐
│      LAWET HUB       │ ─────────────────────────────────▶ │           ALAS            │
│  (write-side / CMS)  │                                     │     (read-side, public)   │
│                       │ ◀──────────────────────────────── │                            │
│  - Modul Jurnal ALAS  │   reconciliation push             │  Next.js 14 App Router     │
│  - PostgreSQL (lawet) │   (Celery Beat, daily 02:00)      │  ┌──────────────────────┐  │
│  - MinIO (lawet-media)│                                    │  │  Public Landing Page  │  │
│  - Celery + Redis     │                                    │  │  /                   │  │
└──────────┬────────────┘                                    │  ├──────────────────────┤  │
           │ on publish:                                     │  │  Admin Dashboard     │  │
           │ copy final assets                               │  │  /admin/*            │  │
           ▼                                                 │  └──────────────────────┘  │
   ┌────────────────────┐   public-read                      │  PostgreSQL (alas)          │
   │  MinIO (shared)    │ ─────────────────────────────────▶ │  No MinIO credential        │
   │  alas-public-assets│   public asset URL in payload      └──────────────────────────┘
   └────────────────────┘
```

### 3.1 Sync Mechanism — Hybrid Push + Pull

| Mekanisme | Trigger | Tujuan |
|---|---|---|
| **Push (webhook)** | Lawet Hub Celery task on `jurnal.published` / `jurnal.updated` / `jurnal.unpublished` | Real-time, latensi rendah |
| **Pull (reconciliation)** | Celery Beat Lawet Hub, daily `0 2 * * *` | Jaring pengaman — menutup gap webhook gagal terkirim |

Idempotency key: `source_id` (UUID di Lawet Hub). Upsert via `ON CONFLICT (source_id) DO UPDATE`.

**Merge strategy khusus `dokumen_pendukung`:**
Saat upsert, ALAS mencocokkan dokumen incoming by `url`. Dokumen yang sudah ada → preserve nilai `is_public` (ALAS-owned). Dokumen baru dari webhook → default `is_public: true`. Dokumen yang hilang dari payload (dihapus di Lawet Hub) → dihapus dari ALAS.

Ini critical: `is_public` adalah field yang sepenuhnya di-own ALAS-side. Lawet Hub tidak tahu dan tidak perlu tahu nilai ini.

### 3.2 Sequence Flows

**Flow Publish Jurnal:**
```
User (Lawet Hub) → Form Jurnal → Submit →
  1. Save Jurnal ke DB Lawet Hub (status: draft)
  2. Upload assets ke MinIO bucket `lawet-media`
  3. Klik "Publish" →
  4. Celery: promote_jurnal_assets()
     → Copy objek dari lawet-media → alas-public-assets
     → Update URL reference di payload
  5. Celery: sync_jurnal_to_alas()
     → HMAC-sign payload
     → POST webhook ke ALAS /api/webhook/jurnal
  6. ALAS: validasi HMAC → merge upsert ke schema `alas` → return 200
```

**Flow Toggle Visibilitas Dokumen:**
```
Admin ALAS → Dashboard /admin/jurnal/{id}/dokumen →
  1. GET /admin/api/jurnal/{id} (full dengan seluruh dokumen, public+private)
  2. Toggle is_public per dokumen → PATCH /admin/api/jurnal/{id}/dokumen
  3. ALAS DB: UPDATE jurnal SET dokumen_pendukung = :merged_jsonb WHERE id = :id
  4. Public endpoint /api/jurnal/{id} otomatis hanya return dokumen is_public: true
```

**Flow Reconciliation (daily):**
```
Celery Beat (Lawet Hub, 02:00 WIB):
  1. Query semua Jurnal WHERE updated_at > last_successful_reconciliation
  2. For each entry: promote assets → POST webhook ke ALAS
  3. ALAS: merge upsert (preserve is_public per dokumen)
  4. Jika semua sukses → update last_sync timestamp di Redis
  5. Jika ada gagal → retry max 3x (30s, 2m, 5m) → alert Telegram Bot
```

### 3.3 Storage Strategy

- Reuse MinIO instance existing — tidak ada instance baru (efisiensi resource).
- Bucket baru: `alas-public-assets`, **public-read bucket policy**, namespace `jurnal/{source_id}/{filename}`.
- Saat publish di Lawet Hub → Celery **copy** (bukan move) dari `lawet-media` → `alas-public-assets`. `lawet-media` tetap source of truth internal.
- ALAS app **tidak pernah memegang MinIO credential**. URL aset diterima sebagai string dari webhook payload.

---

## 4. Data Model

### 4.1 ALAS — PostgreSQL (schema `alas`)

```sql
CREATE TABLE jurnal (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id           UUID NOT NULL UNIQUE,
    judul               TEXT NOT NULL,
    tanggal_kegiatan    DATE NOT NULL,
    kategori            VARCHAR(50) NOT NULL,             -- mou | sengketa | audiensi | pelaporan | lainnya
    link_publikasi      TEXT,
    dokumentasi         JSONB DEFAULT '[]',
    -- [{ "url": str, "caption": str, "type": "image"|"video" }]
    dokumen_pendukung   JSONB DEFAULT '[]',
    -- [{ "nama": str, "url": str, "tipe": "pdf", "is_public": bool }]  ← is_public: ALAS-owned
    pihak_terkait       JSONB DEFAULT '[]',
    -- [{ "nama": str, "instansi": str|null }]
    custom_fields       JSONB DEFAULT '[]',
    -- [{ "label": str, "value": str }]
    is_published        BOOLEAN NOT NULL DEFAULT true,
    synced_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin session (simple, ALAS-local)
CREATE TABLE admin_session (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  TEXT NOT NULL UNIQUE,                    -- SHA256(jwt_token)
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jurnal_tanggal ON jurnal (tanggal_kegiatan DESC);
CREATE INDEX idx_jurnal_kategori ON jurnal (kategori);
CREATE UNIQUE INDEX idx_jurnal_source_id ON jurnal (source_id);
CREATE INDEX idx_admin_session_token ON admin_session (token_hash);
CREATE INDEX idx_admin_session_expires ON admin_session (expires_at);
```

**Justifikasi field:**
| Field | Justifikasi |
|---|---|
| `tanggal_kegiatan` | Wajib fungsional — basis sort listview dan kalender |
| `kategori` | Problem statement menyebut eksplisit jenis kegiatan; prerequisite filter v1.2 |
| `is_published` | Soft-delete dari Lawet Hub — entry tersembunyi tanpa hard-delete, audit trail tetap utuh |
| `is_public` di `dokumen_pendukung` | Kontrol granular per-dokumen, fully owned ALAS-side, tidak masuk payload webhook |
| `admin_session` | Minimal session store untuk dashboard auth; no ORM overhead |

### 4.2 `dokumen_pendukung` JSONB Item Schema

```json
{
  "nama": "Notulen Rapat",
  "url": "https://minio.bawaslu.go.id/alas-public-assets/jurnal/uuid/notulen.pdf",
  "tipe": "pdf",
  "is_public": true
}
```

`is_public` **tidak dikirim** di webhook payload dari Lawet Hub. Ditambahkan di ALAS saat upsert (default `true` untuk dokumen baru). Toggle via admin dashboard.

### 4.3 Index Strategy

| Index | Alasan |
|---|---|
| `idx_jurnal_tanggal DESC` | Sort utama listview & kalender |
| `idx_jurnal_kategori` | Filter by kategori (v1.2) |
| `idx_jurnal_source_id UNIQUE` | Idempotency key webhook upsert |
| `idx_admin_session_token` | Fast lookup validasi JWT |
| `idx_admin_session_expires` | Cleanup expired sessions |

---

## 5. Integration Contract

### 5.1 Webhook (Lawet Hub → ALAS)

**Endpoint:** `POST {ALAS_API_URL}/api/webhook/jurnal`

**Headers (wajib divalidasi ALAS):**

| Header | Format | Validasi |
|---|---|---|
| `X-ALAS-Signature` | `HMAC-SHA256(ALAS_WEBHOOK_SECRET, timestamp + "." + raw_body)`, hex | Reject 401 jika mismatch |
| `X-ALAS-Timestamp` | Unix timestamp (int) | Reject 408 jika selisih > 300 detik |

**Event `jurnal.published` / `jurnal.updated`:**
```json
{
  "event": "jurnal.published",
  "timestamp": "2026-07-01T08:00:00Z",
  "data": {
    "source_id": "uuid",
    "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
    "tanggal_kegiatan": "2026-06-15",
    "kategori": "mou",
    "link_publikasi": "https://bawaslu.go.id/artikel/123",
    "dokumentasi": [
      { "url": "https://minio.../alas-public-assets/jurnal/uuid/foto1.jpg", "caption": "Penandatanganan MoU", "type": "image" }
    ],
    "dokumen_pendukung": [
      { "nama": "Notulen Rapat", "url": "https://minio.../alas-public-assets/jurnal/uuid/notulen.pdf", "tipe": "pdf" },
      { "nama": "Produk Hukum", "url": "https://minio.../alas-public-assets/jurnal/uuid/sk.pdf", "tipe": "pdf" }
    ],
    "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }],
    "custom_fields": [{ "label": "Nomor Surat", "value": "001/SK/2026" }]
  }
}
```

> Catatan: `dokumen_pendukung` di payload webhook **tidak memiliki field `is_public`** — field itu ditambahkan ALAS saat upsert.

**Event `jurnal.unpublished`:**
```json
{
  "event": "jurnal.unpublished",
  "timestamp": "2026-07-01T10:00:00Z",
  "data": { "source_id": "uuid" }
}
```

**Response ALAS:**

| Status | Kondisi | Body |
|---|---|---|
| 200 OK | Upsert sukses | `{ "status": "ok", "id": "uuid-alas", "source_id": "uuid-lawet" }` |
| 401 Unauthorized | HMAC mismatch | `{ "status": "error", "message": "invalid signature" }` |
| 408 Request Timeout | Timestamp stale | `{ "status": "error", "message": "timestamp expired" }` |
| 422 Unprocessable | Payload invalid | `{ "status": "error", "message": "validation error", "detail": [...] }` |
| 500 Internal | DB error | `{ "status": "error", "message": "internal server error" }` |

ALAS wajib return 200 dalam 10 detik. Timeout dari Lawet Hub: 30 detik → trigger retry.

### 5.2 Public Read API (ALAS)

**Convention:** semua response `{ "status": "ok"|"error", "data": ... }` | ISO 8601 | rate limit 100 req/min per IP

#### `GET /api/jurnal?cursor=&limit=20&kategori=`

List jurnal, sort `tanggal_kegiatan DESC`. Hanya entry `is_published = true`. `dokumen_pendukung` dengan `is_public = false` **tidak muncul** di public endpoint.

**Query params:** `cursor` (UUID, optional), `limit` (int, default 20, max 50), `kategori` (enum, optional)

**Response 200:**
```json
{
  "status": "ok",
  "data": [
    {
      "id": "uuid-alas",
      "source_id": "uuid-lawet",
      "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
      "tanggal_kegiatan": "2026-06-15",
      "kategori": "mou",
      "thumbnail_url": "https://minio.../foto1.jpg",
      "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }],
      "created_at": "2026-07-01T08:00:00Z"
    }
  ],
  "pagination": { "next_cursor": "uuid-item-20", "has_more": true, "total": 142 }
}
```

Query: `WHERE is_published = true AND (id < :cursor OR :cursor IS NULL) ORDER BY tanggal_kegiatan DESC, id DESC LIMIT :limit`

#### `GET /api/jurnal/calendar?month=YYYY-MM`

Tanggal-tanggal di bulan tertentu yang memiliki entry published.

**Response 200:**
```json
{
  "status": "ok",
  "data": { "year": 2026, "month": 6, "dates": [1, 3, 5, 15, 22], "total_entries": 5 }
}
```

#### `GET /api/jurnal/{id}`

Detail lengkap satu entry. `dokumen_pendukung` hanya yang `is_public = true`.

**Response 200:**
```json
{
  "status": "ok",
  "data": {
    "id": "uuid-alas",
    "source_id": "uuid-lawet",
    "judul": "...",
    "tanggal_kegiatan": "2026-06-15",
    "kategori": "mou",
    "link_publikasi": "https://...",
    "dokumentasi": [{ "url": "...", "caption": "...", "type": "image" }],
    "dokumen_pendukung": [
      { "nama": "Notulen Rapat", "url": "...", "tipe": "pdf" }
    ],
    "pihak_terkait": [{ "nama": "...", "instansi": null }],
    "custom_fields": [{ "label": "Nomor Surat", "value": "001/SK/2026" }],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

> `is_public` tidak dikirim ke response publik (internal field). Dokumen private tidak muncul sama sekali.

#### `GET /api/health`

```json
{ "status": "ok", "service": "alas", "version": "1.1.0", "db_connected": true, "uptime_seconds": 3600 }
```

### 5.3 Admin API (ALAS — Protected, JWT)

Semua endpoint `/admin/api/*` wajib header `Authorization: Bearer <jwt_token>`.

| Endpoint | Method | Fungsi |
|---|---|---|
| `/admin/api/auth/login` | POST | Login → return JWT (8h) |
| `/admin/api/auth/logout` | POST | Invalidate token (hapus dari `admin_session`) |
| `/admin/api/jurnal` | GET | List semua jurnal (published + unpublished) |
| `/admin/api/jurnal/{id}` | GET | Detail jurnal + **seluruh dokumen** (public + private) |
| `/admin/api/jurnal/{id}/dokumen` | PATCH | Toggle `is_public` per dokumen |

**`POST /admin/api/auth/login`:**
```json
// Request
{ "username": "admin", "password": "..." }

// Response 200
{ "status": "ok", "token": "jwt...", "expires_at": "2026-07-02T08:00:00Z" }
```

**`PATCH /admin/api/jurnal/{id}/dokumen`:**
```json
// Request — kirim seluruh array dokumen_pendukung dengan nilai is_public terbaru
{
  "dokumen_pendukung": [
    { "nama": "Notulen Rapat", "url": "https://...", "tipe": "pdf", "is_public": true },
    { "nama": "Produk Hukum", "url": "https://...", "tipe": "pdf", "is_public": false }
  ]
}

// Response 200
{ "status": "ok", "updated": 2 }
```

**Auth mechanism:**
- Credential dari env: `ALAS_ADMIN_USERNAME`, `ALAS_ADMIN_PASSWORD_HASH` (bcrypt).
- JWT HS256, secret: `ALAS_JWT_SECRET` (env), TTL 8 jam.
- Token hash (SHA256) disimpan di tabel `admin_session` untuk server-side invalidation (logout).
- Cleanup expired sessions: CRON job sederhana di startup atau triggered by login.

### 5.4 Reconciliation Endpoint (Lawet Hub internal)

`GET {LAWET_HUB_API}/api/internal/jurnal/export?since={last_synced_at}` — dipanggil Celery Beat Lawet Hub sisi push. ALAS tidak pull langsung ke Lawet Hub (zero credential ke Lawet Hub).

---

## 6. Frontend Specification

### 6.1 Design System

**Palette:**

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-ink` | `#0C0C0C` | Background utama landing page, text di atas terang |
| `--color-ember-deep` | `#481E14` | Navbar, sidebar dashboard, card overlay gradient |
| `--color-ember-mid` | `#9B3922` | Hover states, border aktif, dot marker kalender |
| `--color-ember-bright` | `#F2613F` | CTA primary, badge kategori, tanggal aktif kalender, link publikasi |
| `--color-surface` | `#F9F4F1` | Background card/modal (warm off-white, kontras terhadap `--color-ink`) |
| `--color-text-muted` | `#C2A89A` | Timestamp, metadata sekunder |

**Typography:**

| Role | Font | Keterangan |
|---|---|---|
| Display / Logo | `Playfair Display` (Bold 700) | Serif berkarakter, kesan arsip/dokumen resmi |
| Body | `Inter` (Regular 400, Medium 500) | Clean, legible, kompatibel Tailwind |
| Mono / Tanggal | `IBM Plex Mono` (Regular) | Tanggal & kode pada kalender — kesan kronologis/log |

Semua font via Google Fonts CDN.

**Karakteristik visual khas:**
- Latar landing page `#0C0C0C` (near-black), bukan white — membalikkan konvensi government website
- Card jurnal menggunakan `--color-surface` dengan left-border tebal `--color-ember-bright` sebagai timeline axis
- Kalender: background `#481E14`, tanggal aktif dot `#F2613F`
- Tidak ada shadow / rounded besar — tajam, archival, sedikit Bauhaus

### 6.2 Pages & Routes

| Route | Komponen | Auth |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/admin/login` | `AdminLoginPage` | — |
| `/admin/jurnal` | `AdminJurnalListPage` | ✓ Admin JWT |
| `/admin/jurnal/[id]/dokumen` | `AdminDokumenPage` | ✓ Admin JWT |

### 6.3 Landing Page Layout

```
┌──────────────────────────────────────────────┐
│  NAVBAR (sticky, bg: #481E14)                 │
│  [logo ALAS — Playfair Display, center]       │
│                              [Login →]        │
├────────────────────────┬─────────────────────┤
│  LEFT COLUMN (60%)     │  RIGHT COLUMN (40%) │
│                        │  (sticky, top: 80px)│
│  <JurnalCard />        │  <CalendarWidget /> │
│  ─────────────────     │  Bulan: Juni 2026   │
│  <JurnalCard />   ←────┼──● 15              │
│  ─────────────────     │  ● 22              │
│  <JurnalCard />        │                    │
│  (infinite scroll)     │  [< Juni] [Juli >] │
│                        │                    │
└────────────────────────┴─────────────────────┘
```

**JurnalCard anatomy:**
```
┌─ border-left: 4px #F2613F ──────────────────┐
│ [kategori badge — #9B3922]   15 Juni 2026    │
│ Judul Kegiatan Dalam Satu Atau Dua Baris     │
│ Pihak terkait: Universitas Putra Bangsa      │
│                              [Lihat Detail →] │
└──────────────────────────────────────────────┘
```

### 6.4 IntersectionObserver Sync

```typescript
// Implementasi wajib: IO, bukan scroll listener
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const tanggal = entry.target.getAttribute('data-tanggal')
        if (tanggal) setActiveMonth(tanggal.slice(0, 7)) // YYYY-MM
      }
    })
  },
  { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
)
// Setiap JurnalCard: observer.observe(ref.current)
```

Klik tanggal di kalender → `document.getElementById(source_id).scrollIntoView({ behavior: 'smooth' })`.

### 6.5 State Management

Tidak perlu global state library. React hooks cukup:

| Hook | Tanggung Jawab |
|---|---|
| `useJurnalList()` | Fetch pagination, infinite scroll, cursor tracking |
| `useCalendar(month)` | Fetch `/api/jurnal/calendar?month=`, active date state |
| `useJurnalDetail(id)` | Fetch detail by ID, modal open/close |
| `useAdminAuth()` | Login, logout, JWT storage (httpOnly cookie atau memory state) |

Data fetching: **TanStack Query** (SWR/cache, deduplication, background refetch).

### 6.6 Detail Modal

Muncul saat card diklik. Field yang ditampilkan:

1. **Judul** — `Playfair Display`, 24px
2. **Tanggal & Kategori** — badge + `IBM Plex Mono`
3. **Link Publikasi** — anchor, color `#F2613F`, ikon eksternal
4. **Dokumentasi** — image grid (lightbox untuk foto), video embed untuk mp4
5. **Dokumen Pendukung** — list PDF (icon 📄), hanya yang `is_public = true`. Download via URL langsung.
6. **Pihak Terkait** — chip list, bg `#481E14`
7. **Custom Fields** — rendered sebagai key-value tabel tipis

### 6.7 Dashboard Pages

> Styling placeholder — Adh akan menyesuaikan dengan Lawet Hub existing UI kit.

**`/admin/login`:**
```
┌─────────────────────────────────┐
│  Logo ALAS             [Admin]  │
│                                 │
│  Username: [________________]   │
│  Password: [________________]   │
│                                 │
│            [Masuk →]            │
└─────────────────────────────────┘
```

**`/admin/jurnal` — List:**
```
┌─────────────────────────────────────────────────────┐
│ Dashboard ALAS              [Logout]                 │
├─────────────────────────────────────────────────────┤
│ Jurnal                                               │
│ Filter: [Semua ▼]  [Cari judul...]                  │
├──────────────┬──────────┬──────────┬────────────────┤
│ Judul        │ Tanggal  │ Kategori │ Aksi           │
├──────────────┼──────────┼──────────┼────────────────┤
│ MoU dengan.. │ 15/6/26  │ MoU      │ [Kelola Dok]  │
│ Sengketa ..  │ 3/6/26   │ Sengketa │ [Kelola Dok]  │
└──────────────┴──────────┴──────────┴────────────────┘
```

**`/admin/jurnal/[id]/dokumen` — Visibilitas Dokumen:**
```
┌─────────────────────────────────────────────────────┐
│ ← Kembali                                            │
│ Dokumen Pendukung — MoU dengan Universitas Putra     │
│ Bangsa                                               │
├─────────────────────────────┬──────────┬────────────┤
│ Nama Dokumen                │ Tipe     │ Visibilitas │
├─────────────────────────────┼──────────┼────────────┤
│ 📄 Notulen Rapat            │ PDF      │ [● Publik] │
│ 📄 Produk Hukum SK/001/2026 │ PDF      │ [○ Private]│
├─────────────────────────────┴──────────┴────────────┤
│                                     [Simpan Perubahan]│
└─────────────────────────────────────────────────────┘
```

Toggle adalah toggle switch UI. `Publik` = hijau/amber, `Private` = abu. Simpan → `PATCH /admin/api/jurnal/{id}/dokumen`.

### 6.8 Responsive

| Breakpoint | Layout |
|---|---|
| ≥1024px | Two-column: listview (60%) + kalender sticky (40%) |
| <1024px | Single column: kalender jadi accordion collapse di atas, listview di bawah |

### 6.9 Performance Budget

| Metrik | Target |
|---|---|
| TTFB | < 200ms |
| LCP | < 1.5s |
| CLS | < 0.1 |
| JS Bundle | < 150kB gzip |

---

## 7. Companion Module — Lawet Hub "Modul Jurnal ALAS"

### 7.1 Data Model (Lawet Hub — SQLAlchemy)

```python
class JurnalAlas(Base):
    __tablename__ = "jurnal_alas"
    __table_args__ = {"schema": "lawet"}

    id               = Column(UUID, primary_key=True, default=uuid4)
    judul            = Column(Text, nullable=False)
    tanggal_kegiatan = Column(Date, nullable=False)
    kategori         = Column(String(50), nullable=False)   # mou|sengketa|audiensi|pelaporan|lainnya
    link_publikasi   = Column(Text, nullable=True)
    dokumentasi      = Column(JSONB, default=list)           # [{ "file_id": uuid, "caption": str }]
    dokumen_pendukung = Column(JSONB, default=list)          # [{ "file_id": uuid, "nama": str }]
    pihak_terkait    = Column(JSONB, default=list)           # [{ "nama": str, "instansi": str|null }]
    custom_fields    = Column(JSONB, default=list)           # [{ "label": str, "value": str }]

    division_id      = Column(UUID, ForeignKey("divisions.id"), nullable=True)
    created_by_id    = Column(UUID, ForeignKey("users.id"), nullable=False)
    status           = Column(String(20), default="draft")   # draft | published | unpublished
    last_synced_at   = Column(DateTime(timezone=True), nullable=True)

    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

### 7.2 Form Fields

| Field | Input | Required | Validasi |
|---|---|---|---|
| Judul Kegiatan | Text | Yes | Max 255 chars |
| Tanggal Kegiatan | Date picker | Yes | ≤ hari ini |
| Kategori | Select | Yes | Enum: MoU / Sengketa / Audiensi / Pelaporan / Lainnya |
| Link Publikasi | URL | No | Valid URL |
| Dokumentasi | Multi-file + caption per file | No | Max 5 file, jpg/png/mp4, max 10MB/file |
| Dokumen Pendukung | Multi-file + nama | No | Max 3 file, PDF only, max 20MB/file |
| Pihak Terkait | Dynamic list (nama + instansi opsional) | No | Max 10 entries |
| Custom Fields | Dynamic list (label + value) + tombol "+ Tambah Kolom" | No | — |

### 7.3 Routing (Lawet Hub)

| Route | Fungsi |
|---|---|
| `/superadmin/jurnal` | List jurnal, filter by status/division |
| `/superadmin/jurnal/buat` | Form buat baru |
| `/superadmin/jurnal/{id}` | View detail + tombol Edit |
| `/superadmin/jurnal/{id}/edit` | Form edit |

### 7.4 Celery Tasks

**`promote_jurnal_assets(jurnal_id: UUID)`**
```
1. Query JurnalAlas + related File records
2. For each file in dokumentasi + dokumen_pendukung:
   a. Source: lawet-media/jurnal/{id}/{filename}
   b. Dest:   alas-public-assets/jurnal/{id}/{filename}
   c. minio_client.copy_object(dest, source)
   d. Update URL di payload ke alas-public-assets endpoint
3. Return { source_id, updated_asset_urls }
```

**`sync_jurnal_to_alas(event_type: str, payload: dict)`**
```
1. ALAS_WEBHOOK_SECRET dari env
2. timestamp = str(int(time.time()))
3. raw_body = json.dumps(payload, separators=(',',':'))
4. signature = hmac.new(secret.encode(), f"{timestamp}.{raw_body}".encode(), sha256).hexdigest()
5. POST ke {ALAS_API_URL}/api/webhook/jurnal
   headers: X-ALAS-Signature, X-ALAS-Timestamp, Content-Type: application/json
6. Response 200 → update last_synced_at
7. Response != 200 → raise exception → Celery retry (max 3x, backoff: 30s→2m→5m)
8. Gagal permanen → log ERROR + Telegram notif
```

**`reconcile_jurnal()`**
```
1. last_sync = Redis GET "alas:last_reconcile" (default: now()-2d)
2. Query JurnalAlas WHERE updated_at > last_sync AND status = 'published'
3. For each: promote_jurnal_assets() → sync_jurnal_to_alas('jurnal.updated', ...)
4. Query JurnalAlas WHERE updated_at > last_sync AND status = 'unpublished'
5. For each: sync_jurnal_to_alas('jurnal.unpublished', {source_id})
6. Jika semua sukses → Redis SET "alas:last_reconcile" = now()
```

### 7.5 Celery Beat Schedule

```python
CELERY_BEAT_SCHEDULE = {
    "reconcile-jurnal-to-alas": {
        "task": "features.jurnal.tasks.reconcile_jurnal",
        "schedule": crontab(hour=2, minute=0),  # Daily 02:00 WIB
    },
}
```

### 7.6 Permission Model

| Aksi | Role Required |
|---|---|
| Buat / edit draft jurnal | `can_submit` |
| Edit jurnal milik sendiri (masih draft) | Creator |
| Publish / unpublish | Superadmin |
| Hapus (soft, set status=draft) | Superadmin |

---

## 8. Security & Data Integrity

| Concern | Mitigasi |
|---|---|
| Unauthorized write ke ALAS public DB | Webhook endpoint validasi HMAC-SHA256 + timestamp window 300s |
| Replay attack | `X-ALAS-Timestamp` reject jika selisih > 300s |
| Draft content ter-eksposur di bucket publik | Bucket terpisah `alas-public-assets`, promosi eksplisit saat publish |
| Data inconsistency (webhook gagal) | Reconciliation daily, idempotent upsert by `source_id` |
| Overwrite `is_public` saat reconciliation | Merge strategy: match by URL, preserve nilai `is_public` existing |
| Unauthorized access dashboard ALAS | JWT HS256, server-side session table, bcrypt credential |
| Credential sprawl (ALAS ke MinIO) | ALAS zero MinIO credential — hanya terima URL string dari webhook |
| SQL injection | Drizzle ORM parameterized query, no raw string interpolation |
| Rate limit abuse public API | 100 req/min per IP di Nginx level |

---

## 9. Error Handling & Retry Policy

### 9.1 Webhook Error Scenarios

| Skenario | Dampak | Mitigasi |
|---|---|---|
| Network timeout / ALAS down | Webhook gagal | Reconciliation daily menutup gap |
| ALAS return 422 | Payload mismatch schema | Log + Telegram + manual review |
| HMAC mismatch | 401 | Cek shared secret kedua sisi |
| Disk full ALAS | 500 | Monitoring disk + alert |
| Partial fail saat reconciliation | Subset data stale | Per-entry retry, bukan batch all-or-nothing |

### 9.2 Retry Policy (Celery)

| Attempt | Delay |
|---|---|
| 1st retry | 30s |
| 2nd retry | 2m |
| 3rd retry | 5m |
| Permanent fail | Log ERROR + Telegram Bot notif |

### 9.3 Error Response Codes (ALAS)

| Code | HTTP | Penyebab |
|---|---|---|
| `INVALID_SIGNATURE` | 401 | HMAC mismatch |
| `TIMESTAMP_EXPIRED` | 408 | Selisih > 300s |
| `VALIDATION_ERROR` | 422 | Missing field / tipe salah |
| `NOT_FOUND` | 404 | ID tidak ditemukan |
| `UNAUTHORIZED` | 401 | JWT tidak valid / expired (admin endpoint) |
| `INTERNAL_ERROR` | 500 | DB error / unhandled |

---

## 10. Infrastructure & Deployment

### 10.1 Docker Compose (ALAS Stack)

```yaml
# docker-compose.alas.yml
services:
  alas-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${ALAS_DB_NAME}
      POSTGRES_USER: ${ALAS_DB_USER}
      POSTGRES_PASSWORD: ${ALAS_DB_PASSWORD}
    volumes:
      - alas_db_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - alas-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${ALAS_DB_USER} -d ${ALAS_DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  alas-app:
    build: .
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://${ALAS_DB_USER}:${ALAS_DB_PASSWORD}@alas-db:5432/${ALAS_DB_NAME}
      ALAS_WEBHOOK_SECRET: ${ALAS_WEBHOOK_SECRET}
      ALAS_JWT_SECRET: ${ALAS_JWT_SECRET}
      ALAS_ADMIN_USERNAME: ${ALAS_ADMIN_USERNAME}
      ALAS_ADMIN_PASSWORD_HASH: ${ALAS_ADMIN_PASSWORD_HASH}
      LAWET_HUB_ADMIN_URL: ${LAWET_HUB_ADMIN_URL}
      NEXT_PUBLIC_MINIO_PUBLIC_ENDPOINT: ${MINIO_PUBLIC_ENDPOINT}
      NEXT_PUBLIC_ALAS_API_URL: https://alas.bawaslu-kebumen.go.id/api
    depends_on:
      alas-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - alas-net

  alas-nginx:
    image: nginx:1.25-alpine
    ports:
      - "2006:80"
    volumes:
      - ./nginx/alas.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - alas-app
    restart: unless-stopped
    networks:
      - alas-net

networks:
  alas-net:
    driver: bridge

volumes:
  alas_db_data:
```

### 10.2 Nginx Config

```nginx
# nginx/alas.conf
server {
    listen 80;
    server_name alas.bawaslu-kebumen.go.id;

    limit_req_zone $binary_remote_addr zone=alas_public:10m rate=100r/m;

    # Public API
    location /api/ {
        limit_req zone=alas_public burst=20 nodelay;
        proxy_pass http://alas-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }

    # Admin API — no rate limit zone (internal use only)
    location /admin/api/ {
        proxy_pass http://alas-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://alas-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 10.3 Environment Variables

| Variable | Scope | Required | Keterangan |
|---|---|---|---|
| `ALAS_DB_NAME` / `_USER` / `_PASSWORD` | ALAS | Yes | Credentials Postgres standalone |
| `ALAS_WEBHOOK_SECRET` | **kedua sisi** | Yes | Shared HMAC secret. Generate: `openssl rand -hex 32` |
| `ALAS_JWT_SECRET` | ALAS | Yes | JWT signing secret. Generate: `openssl rand -hex 32` |
| `ALAS_ADMIN_USERNAME` | ALAS | Yes | Username single admin |
| `ALAS_ADMIN_PASSWORD_HASH` | ALAS | Yes | bcrypt hash. Generate: `python -c "import bcrypt; print(bcrypt.hashpw(b'pw', bcrypt.gensalt()).decode())"` |
| `ALAS_API_URL` | Lawet Hub | Yes | URL endpoint ingestion ALAS untuk Celery |
| `LAWET_HUB_ADMIN_URL` | ALAS | Yes | Redirect target tombol "Login" di navbar |
| `MINIO_PUBLIC_ENDPOINT` | ALAS | Yes | Base URL untuk render aset dari `alas-public-assets` |
| `NEXT_PUBLIC_ALAS_API_URL` | ALAS | Yes | Public API URL untuk fetch di frontend |
| `ALAS_RECONCILE_LOOKBACK_DAYS` | Lawet Hub | No (default: 2) | Window aman reconciliation |
| `ALAS_RATE_LIMIT_PER_MIN` | ALAS | No (default: 100) | Rate limit public API |

### 10.4 Deployment Topology

```
Cloudflare Tunnel (alas-tunnel, subdomain: alas.bawaslu-kebumen.go.id)
  │
  ▼
Nginx (port 2006, container alas-nginx)
  │
  ▼
Next.js App Router (port 3000, container alas-app)
  │
  ▼
PostgreSQL 16 (port 5432, container alas-db)

MinIO: reuse instance existing (tidak di stack ini)
```

---

## 11. Testing Strategy

### 11.1 Backend — Webhook & API

| Test Case | File |
|---|---|
| HMAC valid → 200; invalid → 401; expired → 408 | `tests/test_webhook.ts` |
| Payload missing field → 422 | `tests/test_webhook.ts` |
| Idempotent upsert (same `source_id` 2x → no duplicate) | `tests/test_webhook.ts` |
| Merge `is_public`: dokumen existing preserve nilai, dokumen baru default true | `tests/test_webhook.ts` |
| List endpoint: pagination, sort, filter kategori | `tests/test_jurnal_api.ts` |
| Calendar endpoint: month boundary, empty month | `tests/test_jurnal_api.ts` |
| Detail endpoint: dokumen private tidak muncul di public response | `tests/test_jurnal_api.ts` |
| Admin login: valid → JWT; invalid cred → 401 | `tests/test_admin_auth.ts` |
| Admin patch dokumen: toggle `is_public`, persist benar | `tests/test_admin_dokumen.ts` |
| Admin endpoints tanpa JWT → 401 | `tests/test_admin_auth.ts` |

### 11.2 Integration Tests

| Test Case |
|---|
| End-to-end publish: Lawet Hub form → Celery → webhook → ALAS DB |
| Unpublish di Lawet Hub → reconciliation → ALAS `is_published = false` |
| Toggle private di ALAS dashboard → tidak overwrite saat reconciliation berikutnya |
| Asset promotion: file di `lawet-media` tercopy ke `alas-public-assets` |
| ALAS down → reconciliation job covers gap (network partition simulation) |

### 11.3 Frontend Tests

| Test Case | File |
|---|---|
| IntersectionObserver: scroll → `activeMonth` update | `tests/LandingPage.test.tsx` |
| Calendar click → scrollIntoView terpanggil dengan benar | `tests/LandingPage.test.tsx` |
| Modal: open on card click, close on backdrop, field render | `tests/JurnalDetail.test.tsx` |
| Admin toggle: PATCH API dipanggil saat Simpan | `tests/AdminDokumen.test.tsx` |
| Responsive: two-column → single-column di bawah 1024px | `tests/LandingPage.test.tsx` |

Framework: **Vitest + React Testing Library** (konsisten Lawet Hub).

---

## 12. Open Questions (Resolved)

| Issue | Keputusan |
|---|---|
| Visibilitas `dokumen_pendukung` | Dikontrol dari ALAS dashboard (toggle per-dokumen). Field `is_public` owned ALAS-side, tidak masuk payload webhook. Merge strategy saat upsert. |
| MinIO instance | Reuse existing. Bucket baru `alas-public-assets` dengan public-read policy. |
| Auth dashboard ALAS | Single admin credential via env vars + JWT HS256. Tidak ada multi-user v1.1. |
| Default `is_public` untuk dokumen baru | `true` — sesuai semangat transparansi ALAS. Admin bisa ubah manual jika perlu. |

---

## 13. Roadmap

| Fase | Scope | Target |
|---|---|---|
| **v1.1** | Modul Jurnal Lawet Hub + sync mechanism + landing page ALAS (listview + kalender) + dashboard visibilitas dokumen | Q3 2026 |
| **v1.2** | Filter by kategori, search by judul/pihak terkait, OpenGraph meta tags per jurnal | Q4 2026 |
| **v1.3** | RSS/export feed publik, statistik tahunan (chart kegiatan per kategori/bulan) | Q1 2027 |
| **v2.0** | Multi-admin, import legacy data (batch dari spreadsheet), API untuk OPD lain | TBD |

---

## 14. Glossary

| Istilah | Definisi |
|---|---|
| **ALAS** | Arsip Langkah Bawaslu Kebumen — sistem rekam jejak kegiatan institusi, public-facing |
| **Lawet Hub** | CMS internal Bawaslu Kebumen (write-side), sumber data jurnal |
| **source_id** | UUID record Jurnal di Lawet Hub, idempotency key di ALAS |
| **Reconciliation** | Sinkronisasi periodik daily untuk menutup gap webhook yang gagal |
| **HMAC** | Hash-based Message Authentication Code — sign webhook payload |
| **is_public** | Flag visibilitas per-item `dokumen_pendukung`, dikontrol dari ALAS dashboard, tidak disync dari Lawet Hub |
| **Merge strategy** | Strategi upsert ALAS yang preserve `is_public` existing saat menerima update dari Lawet Hub |
| **alas-public-assets** | MinIO bucket public-read untuk aset jurnal yang sudah dipublish |
| **promote_jurnal_assets** | Celery task: copy file dari `lawet-media` → `alas-public-assets` saat publish |
