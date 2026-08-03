# Arsitektur Pengujian

ALAS menggunakan Vitest dan React Testing Library. Konfigurasi berada di `vitest.config.ts` dengan environment `jsdom` dan alias `@` yang sama seperti aplikasi.

## Penempatan

| Area | Lokasi | Contoh cakupan |
| --- | --- | --- |
| Komponen UI | `tests/*Card.test.tsx`, `tests/SearchBar.test.tsx` | Render, konten, dan interaksi komponen. |
| Endpoint publik | `tests/public_api.test.ts` | Respons jurnal dan kontrak API publik. |
| Service API | `tests/service_*.test.ts` | Bearer/HMAC, replay protection, idempotency, dan operasi jurnal/pimpinan. |
| Security boundary | `tests/lawet_dashboard_boundary.test.ts` | Scope dashboard read-only, media proxy, dan fail-closed action legacy. |
| Integration data | `tests/*integration*.test.ts`, `tests/*delivery*.test.ts` | Transaksi dan migrasi dengan PostgreSQL Testcontainers. |
| Architecture fitness | `scripts/check-repository-isolation*.mjs`, `.dependency-cruiser.cjs` | Isolasi repository dan arah dependency FSD. |

Test baru diletakkan di `tests/` dan dinamai `*.test.ts` atau `*.test.tsx`. Perubahan pada route atau kontrak integrasi harus menambah atau memperbarui test pemiliknya; perubahan tampilan minimal memverifikasi state yang terlihat pengguna.

## Menjalankan

```bash
npm run boundary:test
npm run arch:check
npx vitest run
npx vitest
```

`boundary:test` menguji positive/negative fixture checker, sedangkan `arch:check` memindai repository aktual lalu menjalankan dependency-cruiser. `package.json` belum mendefinisikan skrip `test`, `test:watch`, atau `test:coverage`; gunakan `npx vitest` sampai alias tersebut ditambahkan. Untuk validasi produksi, jalankan juga:

```bash
npm run build
```

## Eskalasi Verifikasi

| Perubahan | Verifikasi minimum |
| --- | --- |
| Komponen terisolasi | Test komponen terkait. |
| Route/API | Test endpoint pemilik dan test auth bila boundary token berubah. |
| Skema atau migrasi | Test API yang memakai entitas tersebut, migrasi pada database kosong, lalu build. |
| Dependency, FSD, atau struktur repository | `npm run boundary:test` dan `npm run arch:check`. |
| Docker, environment, atau integrasi Lawet Hub | Focused integration test, build, dan smoke test health check setelah container berjalan. |
