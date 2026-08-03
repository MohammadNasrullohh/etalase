# Known Issues

| Status | Masalah | Dampak | Tindakan yang disarankan |
| --- | --- | --- | --- |
| Selesai 2026-08-03 | README root sebelumnya tidak membedakan panel visibilitas dari workflow authoring. | Onboarding dapat salah memahami batas sistem. | README kini menjelaskan bahwa panel ALAS read-only dan workflow tulis berada di Lawet Hub. |
| Selesai 2026-08-03 | README sebelumnya menyebut skrip `test`, `test:watch`, dan `test:coverage` yang tidak tersedia. | Perintah dokumentasi gagal dijalankan. | README dan Testing Architecture kini memakai `npx vitest` serta script architecture yang benar-benar tersedia. |
| Selesai 2026-08-03 | Compose development dan produksi meneruskan `LAWET_API_URL`; produksi juga meneruskan `LAWET_PUBLIC_URL` dan timeout media. | Login dan panel visibilitas memakai URL internal, sedangkan workflow tulis membuka origin publik Lawet Hub. | Pertahankan regression test konfigurasi dan isi kedua URL pada deployment. |
| Selesai 2026-08-03 | Kontrak payload Service API sebelumnya terutama berada di README root. | Perubahan endpoint berisiko memperbarui sumber yang berbeda. | `INTEGRATION.md` kini menjadi sumber kanonis; README hanya memuat ringkasan dan tautan. |
