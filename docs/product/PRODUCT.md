# Product

## Register

product

## Pengguna

- **Publik**: masyarakat yang mencari arsip kegiatan dan profil pimpinan Bawaslu Kebumen.
- **Staf Lawet Hub**: pengguna terautentikasi yang mengajukan jurnal melalui panel ALAS.
- **Approver Lawet Hub**: pengguna dengan level peran minimal 2 yang meninjau dan menerbitkan pengajuan.
- **Lawet Hub**: sistem induk yang mengautentikasi pengguna, mengelola workflow pengajuan, dan mengirim data terbit ke Service API ALAS.

## Tujuan Produk

ALAS adalah arsip publik kegiatan Bawaslu Kebumen yang menampilkan jurnal kegiatan, dokumentasi, statistik, kalender, dan profil pimpinan. Aplikasi menjaga tampilan publik tetap mudah dibaca, sementara pengajuan serta persetujuan konten mengikuti otorisasi dan workflow Lawet Hub.

## Permukaan Produk

| Permukaan | Rute | Akses | Fungsi |
| --- | --- | --- | --- |
| Arsip publik | `/` | Publik | Menelusuri jurnal, statistik, kalender, dokumentasi, dan pimpinan. |
| Login panel | `/login` | Publik | Mengautentikasi akun melalui API Lawet Hub. |
| Pengajuan | `/pengajuan` | Login | Membuat pengajuan jurnal ke Lawet Hub. |
| Jurnal saya | `/jurnal-saya` | Login | Melihat jurnal milik pengguna pada Lawet Hub. |
| Approval | `/approval` | Peran level >= 2 | Melihat, menyetujui, atau menolak antrean jurnal Lawet Hub. |

## Batasan Produk

- ALAS tidak menjadi sumber otoritas akun, PIN, peran, atau status workflow pengajuan. Hal tersebut berada di Lawet Hub.
- ALAS menyimpan salinan jurnal dan pimpinan yang ditujukan untuk konsumsi publik. Identitas asal Lawet Hub dijaga dengan `source_id` yang unik.
- Service API ALAS hanya untuk integrasi antarsistem; ia bukan API untuk browser publik.
- Lampiran yang tidak diberi `is_public: true` tidak boleh muncul pada respons API publik.

## Posisi dan Prinsip Desain

ALAS merupakan jurnal institusional yang modern, otoritatif, dan bersih. Transparansi adalah prioritas: konten harus kronologis, mudah dipindai, dan tidak terasa seperti portal birokrasi lama atau umpan media sosial yang ramai.

Prinsip desain:

1. Arsip publik dibaca tanpa hambatan autentikasi.
2. Tindakan authoring jelas terpisah dari pengalaman publik.
3. Informasi kegiatan, dokumentasi, dan lampiran dapat dilacak ke sumbernya.
4. Kontras dan keterbacaan memenuhi kebutuhan pengguna umum.
