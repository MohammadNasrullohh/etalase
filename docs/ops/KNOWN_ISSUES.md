# Known Issues

| Status | Masalah | Dampak | Tindakan yang disarankan |
| --- | --- | --- | --- |
| Selesai 2026-08-03 | README root sebelumnya tidak membedakan panel visibilitas dari workflow authoring. | Onboarding dapat salah memahami batas sistem. | README kini menjelaskan bahwa panel ALAS read-only dan workflow tulis berada di Lawet Hub. |
| Selesai 2026-08-04 | Repository sebelumnya tidak memiliki alias test dan test database diatur terlambat setelah module import. | Perintah sulit diingat dan integration test dapat memakai port database yang salah. | `test`, `test:unit`, `test:integration`, dan `test:watch` tersedia; setup Vitest menetapkan koneksi dari `TEST_DATABASE_URL` sebelum module test dimuat. |
| Selesai 2026-08-03 | Compose development dan produksi meneruskan `LAWET_API_URL`; produksi juga meneruskan `LAWET_PUBLIC_URL` dan timeout media. | Login dan panel visibilitas memakai URL internal, sedangkan workflow tulis membuka origin publik Lawet Hub. | Pertahankan regression test konfigurasi dan isi kedua URL pada deployment. |
| Selesai 2026-08-03 | Kontrak payload Service API sebelumnya terutama berada di README root. | Perubahan endpoint berisiko memperbarui sumber yang berbeda. | `INTEGRATION.md` kini menjadi sumber kanonis; README hanya memuat ringkasan dan tautan. |
