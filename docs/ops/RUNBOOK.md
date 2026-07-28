# Runbook Operasional

## Prasyarat

- Node.js 20+
- Docker dan Docker Compose untuk PostgreSQL lokal atau deployment container
- Nilai rahasia yang diisi dari pengelola konfigurasi; jangan commit `.env`

## Menjalankan Lokal

```bash
npm install
Copy-Item .env.example .env
docker compose -f docker-compose.alas.yml up alas-db -d
npx drizzle-kit migrate
npm run dev
```

Server pengembangan tersedia di `http://localhost:3000`. Database lokal diekspos ke port host `5433`.

Lengkapi minimal nilai berikut di `.env`:

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL aplikasi. |
| `ALAS_SERVICE_TOKEN` | Token bearer untuk Service API; harus cocok dengan Lawet Hub. |
| `LAWET_API_URL` | URL internal API Lawet Hub untuk login dan workflow panel. |
| `NEXT_PUBLIC_LAWET_HUB_ADMIN_URL` | URL panel Lawet Hub yang boleh diketahui klien. |

## Migrasi Database

Sebelum menjalankan aplikasi dengan perubahan skema:

```bash
npx drizzle-kit migrate
```

Jalankan dari root repositori setelah `DATABASE_URL` menunjuk ke database target. Backup database terlebih dahulu untuk lingkungan produksi. Jangan mengedit migrasi yang sudah diterapkan.

## Deployment Docker

1. Buat `.env` produksi dari `.env.example` dan isi semua rahasia.
2. Tarik image dan jalankan stack:

   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Jalankan migrasi dengan akses jaringan ke `alas-db`.
4. Arahkan reverse proxy/tunnel ke Nginx pada port host `2006`.
5. Verifikasi health check:

   ```bash
   curl http://localhost:2006/api/health
   ```

Stack produksi terdiri dari `alas-db` (PostgreSQL), `alas-app` (Next.js pada port internal 3000/host 3001), dan `alas-nginx` (port host 2006). Workflow GitHub Actions membangun serta mendorong image GHCR ketika ada push ke `main`.

## Pemeriksaan Insiden Singkat

| Gejala | Pemeriksaan awal |
| --- | --- |
| Situs atau API publik gagal | `GET /api/health`, lalu periksa log `alas-nginx` dan `alas-app`. |
| Health check gagal database | Periksa status `alas-db`, `DATABASE_URL`, dan kredensial PostgreSQL. |
| Service API 401 | Pastikan header Bearer dan `ALAS_SERVICE_TOKEN` sama pada pengirim dan ALAS. |
| Panel login/authoring gagal | Pastikan `LAWET_API_URL` dapat dijangkau dari container `alas-app`. |
| Jurnal tidak muncul publik | Periksa status publikasi di Lawet Hub, sinkronisasi Service API, lalu `is_published` di ALAS. |
