# ADR-0003: Batas FSD untuk Next.js App Router

Status: Accepted
Tanggal: 2026-08-03

## Konteks

ALAS memakai Next.js App Router sekaligus struktur Feature-Sliced Design. Tanpa aturan yang dapat dieksekusi, komponen `shared` pernah mengimpor autentikasi dari `features`, dan penempatan route, komposisi halaman, serta domain mudah bercampur lagi setelah refactor manual.

## Keputusan

1. Urutan layer ALAS adalah `app` → `views` → `widgets` → `features` → `entities` → `shared`.
2. `app` hanya memiliki routing, layout, route handler, dan wiring framework. `views` adalah adaptasi page layer untuk App Router dan menyusun widget/feature tanpa diimpor kembali oleh layer bawah.
3. Dependency hanya boleh mengarah ke layer yang lebih rendah. Circular dependency ditolak.
4. UI yang memiliki dependency autentikasi Lawet Hub adalah bagian dari `features/lawet-auth`, bukan `shared`.
5. Dependency-cruiser menjadi gate pada pull request dan push `main`. Migrasi public API slice dan konvensi nama client component dilakukan per layer dalam commit terpisah; gate diperketat setelah tiap batch tanpa menambahkan allowlist pelanggaran lama.
6. Runtime gate memakai dependency-cruiser 16.x agar tetap kompatibel dengan Node.js 20 yang didukung proyek.

## Konsekuensi

- Import salah arah dan siklus baru gagal di CI sebelum image dibangun.
- `views` tetap dipertahankan sebagai adaptasi eksplisit, bukan digabung ke `app`, sehingga route file tetap tipis.
- Perpindahan dilakukan bertahap per layer agar perubahan dapat direview dan di-rollback secara independen.
- Gate tahap awal menjaga arah layer; aturan public API dan penamaan client component ditambahkan setelah struktur lama pada layer terkait sudah dipindahkan.

## Alternatif yang ditolak

- Mengandalkan review manual: tidak mencegah regresi struktural pada perubahan berikutnya.
- Menaruh seluruh page UI di `app`: membuat route framework kembali memuat komposisi dan detail presentasi.
- Mengaktifkan semua aturan sekaligus dengan daftar pengecualian: pengecualian mudah menjadi permanen dan menyembunyikan utang struktur.
