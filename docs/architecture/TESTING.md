# Arsitektur Pengujian

ALAS menggunakan Vitest dan React Testing Library. Konfigurasi berada di `vitest.config.ts` dengan environment `jsdom` dan alias `@` yang sama seperti aplikasi.

## Penempatan

| Area | Lokasi | Contoh cakupan |
| --- | --- | --- |
| Komponen UI | `tests/*Card.test.tsx`, `tests/SearchBar.test.tsx` | Render, konten, dan interaksi komponen. |
| Endpoint publik | `tests/public_api.test.ts` | Respons jurnal dan kontrak API publik. |
| Service API | `tests/service_*.test.ts` | Autentikasi dan operasi jurnal/pimpinan yang dilindungi token. |

Test baru diletakkan di `tests/` dan dinamai `*.test.ts` atau `*.test.tsx`. Perubahan pada route atau kontrak integrasi harus menambah atau memperbarui test pemiliknya; perubahan tampilan minimal memverifikasi state yang terlihat pengguna.

## Menjalankan

```bash
npx vitest run
npx vitest
```

`package.json` saat ini belum mendefinisikan skrip `test`, `test:watch`, atau `test:coverage`; gunakan perintah di atas sampai skrip tersebut ditambahkan. Untuk validasi produksi, jalankan juga:

```bash
npm run build
```

## Eskalasi Verifikasi

| Perubahan | Verifikasi minimum |
| --- | --- |
| Komponen terisolasi | Test komponen terkait. |
| Route/API | Test endpoint pemilik dan test auth bila boundary token berubah. |
| Skema atau migrasi | Test API yang memakai entitas tersebut, migrasi pada database kosong, lalu build. |
| Docker, environment, atau integrasi Lawet Hub | Build dan smoke test health check setelah container berjalan. |
