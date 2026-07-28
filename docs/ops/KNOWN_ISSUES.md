# Known Issues

| Status | Masalah | Dampak | Tindakan yang disarankan |
| --- | --- | --- | --- |
| Terbuka | README root masih menyatakan ALAS tidak memiliki UI authoring, padahal rute `/login`, `/pengajuan`, `/jurnal-saya`, dan `/approval` sudah ada. | Onboarding dapat salah memahami batas sistem. | Gunakan dokumen aktif di `docs/` sebagai rujukan; selaraskan README pada perubahan dokumentasi berikutnya. |
| Terbuka | `package.json` belum memiliki skrip test, walaupun README menyebut `npm run test`, `test:watch`, dan `test:coverage`. | Perintah yang didokumentasikan gagal dijalankan. | Jalankan `npx vitest run` atau tambahkan skrip npm pada perubahan tooling. |
| Perlu konfigurasi | Kedua Docker Compose meneruskan token dan database, tetapi belum mencantumkan `LAWET_API_URL` pada environment `alas-app`. | Login dan action authoring gagal di container kecuali URL tersedia melalui mekanisme lain. | Tambahkan `LAWET_API_URL` ke environment service sebelum memakai panel authoring dalam container. |
| Perlu verifikasi | Dokumentasi kontrak payload Service API masih terutama berada di README root. | Perubahan endpoint berisiko tidak memperbarui sumber dokumentasi yang sama. | Pindahkan atau tulis kontrak endpoint lengkap di dokumen arsitektur saat melakukan perubahan Service API berikutnya. |
