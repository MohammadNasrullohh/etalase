# ADR-0002: JWT panel ALAS dibatasi read-only

Status: Accepted
Tanggal: 2026-08-03

## Konteks

ALAS menyimpan access token Lawet Hub dalam cookie HTTP-only untuk menampilkan identitas, jurnal pengguna, media terlindungi, dan antrean approval. Token yang sama sebelumnya merupakan JWT Lawet Hub generik tanpa scope, sehingga Server Action ALAS juga dapat mengirim pengajuan, mengunggah media, menyetujui, dan menolak jurnal. Pemisahan read-side ALAS dan write-side Lawet Hub hanya berupa konvensi UI, bukan security boundary.

## Keputusan

1. Login server-side ALAS mengirim penanda `X-Lawet-Client: alas-dashboard`.
2. Lawet Hub menerbitkan access token tersebut dengan scope `alas:dashboard:read` dan tidak menerbitkan refresh token atau session refresh.
3. Dependency autentikasi HTTP Lawet Hub menolak token scope itu untuk semua method selain `GET`, `HEAD`, dan `OPTIONS`. Penanda client hanya dapat mempersempit hak akses; ia bukan bukti autentikasi.
4. Server Action mutasi lama di ALAS gagal sebelum melakukan request jaringan. UI pengajuan dan approval mengarahkan tindakan tulis ke Lawet Hub melalui URL publik yang dikonfigurasi.
5. Proxy media ALAS hanya menerima prefix objek jurnal yang diizinkan, meneruskan JWT sebagai Bearer, memakai timeout, dan selalu mengirim `Cache-Control: private, no-store`.

## Konsekuensi

- Cookie `lawet_token` dapat dipakai untuk visibilitas dashboard, tetapi tidak dapat mengubah state Lawet Hub.
- Pengguna tetap dapat membaca antrean dan detail di ALAS; pembuatan, upload, approval, dan rejection dilakukan pada aplikasi sumber.
- Token ALAS tidak dapat ditukar menjadi token penuh melalui refresh flow.
- `LAWET_PUBLIC_URL` diperlukan agar tautan workflow dapat membawa pengguna ke Lawet Hub, sedangkan `LAWET_API_URL` tetap khusus komunikasi server-side.
- Enforcement terpusat pada dependency autentikasi menutup write endpoint saat ini dan endpoint baru yang memakai dependency yang sama.

## Alternatif yang ditolak

- Menyembunyikan tombol saja: tidak mencegah pemanggilan Server Action atau API secara langsung.
- Memberi scope write per fitur kepada ALAS: mempertahankan dua permukaan authoring dan memperbesar dampak kompromi cookie.
- Memakai service token Direct Service untuk sesi pengguna: mencampur identitas manusia dengan kredensial antarsistem dan melanggar batas CQRS-lite.
