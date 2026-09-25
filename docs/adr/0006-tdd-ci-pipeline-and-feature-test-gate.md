# ADR-0006: Pipeline CI Berbasis Test-Driven Development (TDD) dan Feature Test Coverage Gate

Status: Accepted  
Tanggal: 2026-09-25  

## Konteks

Sebelumnya, repositori ALAS hanya memiliki verifikasi arsitektur dasar (`boundary:test` dan `arch:check`) tanpa pipeline CI yang lengkap, tanpa penegakan budaya *Test-Driven Development* (TDD) untuk fitur-fitur baru, dan tanpa otomatisasi unit test sebelum build aplikasi.

Di sisi lain, Lawet Hub telah menetapkan standar kualitas tinggi dengan mewajibkan pengujian fitur baru (*feature test coverage gate*) pada proses CI. Untuk menjaga kesetaraan standar keandalan, integritas data, dan pencegahan regresi di seluruh ekosistem aplikasi Bawaslu Kebumen, ALAS memerlukan adopsi pipeline CI yang setara dengan Lawet Hub.

## Keputusan

1. **Adopsi Pipeline CI Standar Lawet Hub (`.github/workflows/ci.yml`)**:
   Menggantikan workflow lama dengan pipeline 4 tahap yang komprehensif:
   - **`lint-arch`**: Menjalankan pengujian isolasi modul (`npm run boundary:test`), validasi unit test script penegak TDD (`npm run coverage:test`), dan penegakan arah dependensi FSD (`npm run arch:check`).
   - **`feature-test-coverage`**: Gate penegak TDD yang memvalidasi commit diff terhadap basis (`BASE_SHA`).
   - **`test`**: Menjalankan suite pengujian unit (`npm run test:unit`).
   - **`build`**: Mengompilasi aplikasi Next.js produksi (`npm run build`) setelah ketiga tahap pengujian sebelumnya berhasil.

2. **Penegakan Gate TDD Fitur Baru (`scripts/check-feature-test-coverage.mjs`)**:
   Setiap penambahan atau mutasi direktori fitur baru pada `src/features/` wajib menyertakan file pengujian (`*.test.ts` atau `*.test.tsx`) baik secara *co-located* di dalam direktori fitur terkait maupun terpetakan di `tests/`. Ketiadaan berkas pengujian akan langsung membatalkan pipeline CI (*fail-fast*).

3. **Pemisahan Tingkat Pengujian (*Test Hierarchy*)**:
   - **Unit Test (`test:unit`)**: Berjalan cepat secara deterministik tanpa dependensi database hidup atau container eksternal dengan memanfaatkan isolasi mock untuk state sesi, Next.js cache/headers, dan ORM database.
   - **Integration Test (`test:integration`)**: Menguji transaksi database nyata, migrasi, dan kontrak API publik terhadap instans PostgreSQL lokal atau Testcontainers.

4. **Kepatuhan Tipe Data Pengujian**:
   Seluruh suite pengujian diwajibkan memenuhi verifikasi kompilasi TypeScript murni (`npx tsc --noEmit`) tanpa tipe implisit `any` atau ketidakcocokan properti skema Zod.

## Konsekuensi

- **Kedisiplinan TDD:** Pengembang wajib menuliskan pengujian unit bersamaan atau sebelum mengimplementasikan fitur baru pada `src/features/`.
- **Eksekusi Cepat & Andal:** Pipeline unit test CI dapat berjalan dalam hitungan detik tanpa risiko kegagalan akibat ketiadaan koneksi PostgreSQL eksternal.
- **Pencegahan Regresi:** Build produksi tidak akan dijalankan apabila terdapat kegagalan pada arsitektur, cakupan pengujian fitur, atau unit test.

## Alternatif yang Ditolak

- **Mengandalkan Review Manual Tanpa Otomatisasi CI Gate:** Rentan kelolosan kode tanpa tes dan inkonsisten.
- **Menjalankan Seluruh Integration Test yang Membutuhkan Database Hidup di Setiap Push CI:** Menyebabkan CI lambat, rentan *flaky* akibat latensi jaringan/container, serta mengaburkan batas antara verifikasi logika unit dan pengujian infrastruktur.
