# INTEGRATION.md — Kontrak Integrasi ALAS ↔ Lawet Hub

**Versi:** 2.0 | **Tanggal:** Juli 2026
**Changelog dari v1.0:** Arsitektur webhook dihapus. Diganti dengan direct Service API call.
HMAC signing, reconciliation job, dan `admin_session` dihapus dari scope.

---

## 1. Arsitektur Komunikasi

```
Lawet Hub Backend (Python/FastAPI)
    │
    │  HTTPS — Authorization: Bearer ALAS_SERVICE_TOKEN
    │  POST/PATCH/DELETE https://alas.bawaslu-kebumen.go.id/api/service/jurnal/...
    ▼
Cloudflare Tunnel (alas.bawaslu-kebumen.go.id)
    │
    ▼
alas-nginx → alas-app → alas-db
```

**Tidak ada Docker network sharing.** Lawet Hub `lawethub_internal` adalah `internal: true` — tidak accessible dari luar. Komunikasi Lawet Hub → ALAS via public HTTPS (Cloudflare Tunnel).

---

## 2. Service API Auth

### Header Required
```
Authorization: Bearer <ALAS_SERVICE_TOKEN>
Content-Type: application/json
```

### Token Setup
```bash
# Generate sekali, simpan di kedua .env:
openssl rand -hex 32
```

ALAS memvalidasi token dengan `crypto.timingSafeEqual()` untuk mencegah timing attack.

### Rotasi Token
```bash
# 1. Update kedua .env dengan nilai baru
# 2. Restart bersamaan:
docker-compose -f docker-compose.alas.yml restart alas-app
docker-compose restart backend worker
```

---

## 3. Service API Endpoints (ALAS)

Base URL: `https://alas.bawaslu-kebumen.go.id`

### Create / Upsert Jurnal
```
POST /api/service/jurnal
```

**Request Body:**
```json
{
  "source_id": "uuid-dari-lawet-hub",
  "judul": "Bawaslu Kebumen Teken MoU dengan Universitas Putra Bangsa",
  "tanggal_kegiatan": "2026-06-15",
  "kategori": "mou",
  "link_publikasi": "https://bawaslu.go.id/artikel/123",
  "dokumentasi": [
    { "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/foto1.jpg", "caption": "Penandatanganan MoU", "type": "image" }
  ],
  "dokumen_pendukung": [
    { "nama": "Notulen Rapat", "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/notulen.pdf", "tipe": "pdf" },
    { "nama": "Produk Hukum", "url": "https://media.domain.com/alas-public-assets/jurnal/uuid/sk.pdf", "tipe": "pdf" }
  ],
  "pihak_terkait": [{ "nama": "Universitas Putra Bangsa", "instansi": null }],
  "custom_fields": [{ "label": "Nomor Surat", "value": "001/SK/2026" }]
}
```

> **PENTING:** `dokumen_pendukung` tidak memiliki `is_public`. ALAS mengelola field ini secara internal (default `true` untuk dokumen baru, preserved untuk dokumen yang sudah ada).

**Response:**
```json
// 201 Created (jurnal baru)
{ "status": "ok", "id": "uuid-alas", "source_id": "uuid-lawet", "action": "created" }

// 200 OK (upsert — source_id sudah ada)
{ "status": "ok", "id": "uuid-alas", "source_id": "uuid-lawet", "action": "updated" }
```

### Update / Unpublish Jurnal
```
PATCH /api/service/jurnal/{source_id}
```

**Request Body** (partial update, field apapun dari schema di atas):
```json
// Unpublish:
{ "is_published": false }

// Update konten:
{ "judul": "Judul Baru", "dokumen_pendukung": [...] }
```

**Response 200:**
```json
{ "status": "ok", "source_id": "uuid-lawet", "action": "updated" }
```

### Toggle Visibilitas Dokumen
```
PATCH /api/service/jurnal/{source_id}/dokumen
```

**Request Body** — kirim seluruh array dengan nilai `is_public` terbaru:
```json
{
  "dokumen_pendukung": [
    { "nama": "Notulen Rapat", "url": "https://...", "tipe": "pdf", "is_public": true },
    { "nama": "Produk Hukum", "url": "https://...", "tipe": "pdf", "is_public": false }
  ]
}
```

**Response 200:**
```json
{ "status": "ok", "updated": 2 }
```

### Hapus Jurnal (Soft Delete)
```
DELETE /api/service/jurnal/{source_id}
```

**Response 200:**
```json
{ "status": "ok", "source_id": "uuid-lawet" }
```
> Data tidak dihapus dari DB. `is_published` di-set `false`. Audit trail tetap utuh.

### Get Detail (Semua Dokumen)
```
GET /api/service/jurnal/{source_id}
```

Return semua dokumen termasuk yang `is_public = false` — untuk Lawet Hub admin view.

### List All Jurnal
```
GET /api/service/jurnal?limit=50
```

Return semua jurnal (published + unpublished).

---

### Create / Upsert Pimpinan
```
POST /api/service/pimpinan
```

**Request Body:**
```json
{
  "source_id": "uuid-dari-lawet-hub",
  "nama": "Dr. Agus Widodo, S.H., M.H.",
  "jabatan": "Ketua",
  "foto_url": "https://media.domain.com/alas-public-assets/pimpinan/uuid/foto.jpg",
  "bio": "Bergabung sebagai Komisioner Bawaslu Kebumen sejak 2023...",
  "periode_mulai": "2023-08-15",
  "periode_selesai": "2028-08-14",
  "urutan": 1
}
```

**Response:**
```json
// 201 Created
{ "status": "ok", "source_id": "uuid-lawet", "action": "created" }

// 200 OK (upserted)
{ "status": "ok", "source_id": "uuid-lawet", "action": "updated" }
```

### Update Pimpinan
```
PATCH /api/service/pimpinan/{source_id}
```
**Request Body** (partial update):
```json
{
  "jabatan": "Anggota",
  "periode_selesai": "2026-12-31"
}
```

### Soft Delete Pimpinan
```
DELETE /api/service/pimpinan/{source_id}
```
Sets `is_active = false` di ALAS DB.

---

## 4. Error Responses

| HTTP | Kondisi | Body |
|---|---|---|
| 401 | Token missing/invalid | `{"status":"error","message":"unauthorized"}` |
| 404 | source_id tidak ditemukan | `{"status":"error","message":"not found"}` |
| 422 | Payload invalid | `{"status":"error","message":"validation error","detail":[...]}` |
| 500 | DB error | `{"status":"error","message":"internal server error"}` |

### Error Handling di Lawet Hub

```python
try:
    result = await alas_client.upsert_jurnal(payload)
    # Update JurnalAlas.last_synced_at = now()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        # Token salah — log critical, alert Telegram
        pass
    elif e.response.status_code == 422:
        # Payload salah — log error untuk review
        pass
    else:
        # 5xx — ALAS down atau error internal
        # Jurnal tetap tersimpan di Lawet Hub sebagai 'published' di Lawet Hub
        # tapi last_synced_at tidak diupdate → admin tau belum tersync
        pass
except httpx.TimeoutException:
    # ALAS timeout — sama treatment dengan 5xx
    pass
```

---

## 5. MinIO — Setup `alas-public-assets`

### Satu Kali Setup (Sebelum Launch)

MinIO berjalan di Lawet Hub stack:
```
port 2004: API  →  http://localhost:2004
port 2005: Console → http://localhost:2005
```

**Via MinIO Console:**
1. Login ke `http://localhost:2005`
2. Buat bucket: `alas-public-assets`
3. Access Policy: **Public (anonymous GET)**

**Via `mc` CLI:**
```bash
mc alias set lawethub http://localhost:2004 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc mb lawethub/alas-public-assets
mc anonymous set download lawethub/alas-public-assets
```

### URL Format
```
https://media.domain.com/alas-public-assets/jurnal/{source_id}/{filename}
```

---

## 6. Lawet Hub Implementation

### 6.1 New Files (Lawet Hub)

```
backend/app/
├── models/
│   ├── jurnal_alas.py          # SQLAlchemy model JurnalAlas
│   └── pimpinan_alas.py        # [NEW] SQLAlchemy model PimpinanAlas
├── features/
│   ├── jurnal_alas/
│   │   ├── __init__.py
│   │   ├── router.py            # FastAPI routes /api/v1/jurnal-alas/*
│   │   ├── service.py           # Business logic: publish, promote assets
│   │   ├── alas_client.py       # httpx client ke ALAS Service API
│   │   └── schemas.py           # Pydantic schemas
│   └── pimpinan_alas/           # [NEW] Feature pimpinan
│       ├── router.py            # FastAPI routes /api/v1/pimpinan-alas/*
│       └── service.py           # Sync logic pimpinan ke ALAS
```

Frontend routes Lawet Hub (superadmin):
```
/superadmin/jurnal-alas/         → Kelola Jurnal
/superadmin/pimpinan-alas/       → [NEW] Kelola Pimpinan (Urutan, Bio, Foto, Periode)
```

### 6.2 ALAS Service Client

```python
# backend/app/features/jurnal_alas/alas_client.py
import httpx
from app.core.config import settings

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
    async def patch_jurnal(cls, source_id: str, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.patch(
                f"{cls.BASE_URL}/api/service/jurnal/{source_id}",
                json=payload, headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()

    @classmethod
    async def patch_dokumen(cls, source_id: str, dokumen: list) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.patch(
                f"{cls.BASE_URL}/api/service/jurnal/{source_id}/dokumen",
                json={"dokumen_pendukung": dokumen},
                headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()

    @classmethod
    async def get_jurnal(cls, source_id: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{cls.BASE_URL}/api/service/jurnal/{source_id}",
                headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()

    @classmethod
    async def delete_jurnal(cls, source_id: str) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.delete(
                f"{cls.BASE_URL}/api/service/jurnal/{source_id}",
                headers=cls._headers()
            )
            resp.raise_for_status()
            return resp.json()
```

### 6.3 Publish Flow

```python
# backend/app/features/jurnal_alas/service.py
async def publish_jurnal(jurnal_id: str, db: AsyncSession):
    jurnal = await db.get(JurnalAlas, jurnal_id)

    # 1. Promote assets: lawet-media → alas-public-assets
    payload = await promote_jurnal_assets(jurnal)  # return payload dengan alas URLs

    # 2. Call ALAS Service API
    try:
        result = await ALASServiceClient.upsert_jurnal(payload)
        # 3. Update status
        jurnal.status = "published"
        jurnal.last_synced_at = datetime.now(timezone.utc)
        await db.commit()
        return result
    except httpx.HTTPStatusError as e:
        # Jangan update status jika ALAS gagal
        # Return error ke frontend untuk retry manual
        raise HTTPException(status_code=502, detail=f"ALAS sync failed: {e.response.text}")
```

### 6.4 Config Tambahan Lawet Hub

```python
# backend/app/core/config.py — tambahkan:
ALAS_SERVICE_TOKEN: str = ""
ALAS_API_URL: str = ""
```

```bash
# Lawet Hub .env — tambahkan:
ALAS_SERVICE_TOKEN=<SAMA dengan ALAS side>
ALAS_API_URL=https://alas.bawaslu-kebumen.go.id
```

### 6.5 Pimpinan SQLAlchemy Model (Lawet Hub)

File: `backend/app/models/pimpinan_alas.py`
```python
from sqlalchemy import Column, String, Date, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from uuid import uuid4
from app.core.database import Base

class PimpinanAlas(Base):
    __tablename__ = "pimpinan_alas"
    __table_args__ = {"schema": "lawet"}

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    nama            = Column(String(255), nullable=False)
    jabatan         = Column(String(100), nullable=False)
    foto_url        = Column(String(512), nullable=True)
    bio             = Column(String, nullable=True)
    periode_mulai   = Column(Date, nullable=False)
    periode_selesai = Column(Date, nullable=True)
    urutan          = Column(Integer, default=0, nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

> **Catatan:** Ketika pimpinan ditambahkan, diubah, atau dihapus di Dashboard Lawet Hub, backend Lawet Hub harus langsung memanggil `ALASServiceClient` yang relevan untuk mensinkronisasi data ke ALAS secara real-time. Aset foto pimpinan juga dipromote ke bucket `alas-public-assets` sebelum API call.

---

## 7. Environment Variables

### ALAS `.env`
```bash
ALAS_DB_NAME=alas
ALAS_DB_USER=alas_user
ALAS_DB_PASSWORD=<strong password>
DATABASE_URL=postgresql://alas_user:${ALAS_DB_PASSWORD}@alas-db:5432/alas

ALAS_SERVICE_TOKEN=<generate: openssl rand -hex 32>

LAWET_HUB_ADMIN_URL=https://lawethub.pusdakum.web.id/superadmin/jurnal-alas
NEXT_PUBLIC_MINIO_PUBLIC_ENDPOINT=https://media.domain.com
NEXT_PUBLIC_ALAS_API_URL=https://alas.bawaslu-kebumen.go.id/api

SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

### Lawet Hub `.env` (tambahan)
```bash
ALAS_SERVICE_TOKEN=<NILAI IDENTIK dengan ALAS>
ALAS_API_URL=https://alas.bawaslu-kebumen.go.id
```

---

## 8. Sequence Diagrams

### Publish Flow
```
[Admin Lawet Hub] → Klik "Publish" di /superadmin/jurnal-alas/{id}
    ↓
Lawet Hub backend: POST /api/v1/jurnal-alas/{id}/publish
    ↓
promote_jurnal_assets():
    lawet-media/jurnal/{id}/* → alas-public-assets/jurnal/{id}/*
    Return payload dengan alas-public-assets URLs
    ↓
ALASServiceClient.upsert_jurnal(payload)
    POST https://alas.bawaslu-kebumen.go.id/api/service/jurnal
    ↓
ALAS: validasi token → upsert DB → return 201/200
    ↓
Lawet Hub: JurnalAlas.status = "published", last_synced_at = now()
    ↓
[Publik] → GET / → jurnal baru tampil di ALAS landing page
```

### Toggle Visibilitas Dokumen
```
[Admin Lawet Hub] → /superadmin/jurnal-alas/{id}/dokumen
    ↓
GET /api/service/jurnal/{source_id}
    ← ALAS return: seluruh dokumen termasuk is_public=false
    ↓
Admin toggle is_public per dokumen di Lawet Hub UI
    ↓
Klik "Simpan"
    ↓
PATCH /api/service/jurnal/{source_id}/dokumen
    {dokumen_pendukung: [...dengan is_public terbaru]}
    ↓
ALAS: UPDATE jurnal SET dokumen_pendukung = merged_jsonb
    ↓
[Publik] → GET /api/jurnal/{id} → hanya dokumen is_public=true tampil
```

### Update Jurnal
```
[Admin Lawet Hub] → Edit jurnal → Save
    ↓
Lawet Hub backend: PUT /api/v1/jurnal-alas/{id}
    ↓
Jika status === "published":
    promote_jurnal_assets() untuk file baru
    ALASServiceClient.patch_jurnal(source_id, payload)
    ALAS: merge upsert (preserve is_public existing docs)
Jika status === "draft":
    Hanya update di Lawet Hub DB
```

---

## 9. Checklist Pre-Launch

### ALAS Side
- [ ] `docker-compose.alas.yml up` — semua service healthy
- [ ] `GET /api/health` → `{"status":"ok","db_connected":true}`
- [ ] Drizzle migrations applied
- [ ] `.env` lengkap (tidak ada nilai placeholder)
- [ ] Test service token: valid → 200, invalid → 401

### Lawet Hub Side
- [ ] `JurnalAlas` model di-migrate via Alembic
- [ ] `jurnal_alas` feature module terdaftar di `app/features/__init__.py`
- [ ] Env vars `ALAS_SERVICE_TOKEN` dan `ALAS_API_URL` diset
- [ ] Bucket `alas-public-assets` dibuat dengan public-read policy

### End-to-End Verification
- [ ] Buat jurnal di Lawet Hub → Publish → cek ALAS landing page
- [ ] Toggle is_public=false → verify tidak tampil di `/api/jurnal/{id}` publik
- [ ] ALAS down → publish gagal dengan error 502 → jurnal tetap di Lawet Hub
- [ ] ALAS kembali up → retry publish berhasil
