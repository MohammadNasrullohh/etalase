# Known Issues

| Status | Masalah | Dampak | Tindakan yang disarankan |
| --- | --- | --- | --- |
| Terbuka | README root masih menyatakan ALAS tidak memiliki UI authoring, padahal rute `/login`, `/pengajuan`, `/jurnal-saya`, dan `/approval` sudah ada. | Onboarding dapat salah memahami batas sistem. | Gunakan dokumen aktif di `docs/` sebagai rujukan; selaraskan README pada perubahan dokumentasi berikutnya. |
| Terbuka | `package.json` belum memiliki skrip test, walaupun README menyebut `npm run test`, `test:watch`, dan `test:coverage`. | Perintah yang didokumentasikan gagal dijalankan. | Jalankan `npx vitest run` atau tambahkan skrip npm pada perubahan tooling. |
| Selesai 2026-08-03 | Compose development dan produksi meneruskan `LAWET_API_URL`; produksi juga meneruskan `LAWET_PUBLIC_URL` dan timeout media. | Login dan panel visibilitas memakai URL internal, sedangkan workflow tulis membuka origin publik Lawet Hub. | Pertahankan regression test konfigurasi dan isi kedua URL pada deployment. |
| Perlu verifikasi | Dokumentasi kontrak payload Service API masih terutama berada di README root. | Perubahan endpoint berisiko tidak memperbarui sumber dokumentasi yang sama. | Pindahkan atau tulis kontrak endpoint lengkap di dokumen arsitektur saat melakukan perubahan Service API berikutnya. |
