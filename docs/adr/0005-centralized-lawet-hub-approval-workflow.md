# ADR-0005: Centralized Lawet Hub Approval & Authoring Workflow

Status: Accepted
Tanggal: 2026-09-08
Supersedes: ADR-0004

## Konteks

Sebelumnya, ADR-0004 memperkenalkan kemampuan penulisan lokal (*local write proxy*) di ALAS dengan menyimpan draf jurnal, status persetujuan (*workflow_status*), dan tabel antrean keluar (*outbox*) `alas_outbox` secara lokal di database ALAS untuk sinkronisasi dua arah ke Lawet Hub.

Namun dalam implementasi dan evaluasinya, pendekatan tersebut menimbulkan masalah *split-brain* (sumber data terpecah) dan kompleksitas berlebih (*over-engineering*):
1. **Disparitas Data:** Halaman antrean persetujuan (`/approval`) membaca dari database PostgreSQL lokal ALAS, sementara halaman *workspace* tim/bawahan (`/jurnal-saya`) membaca langsung dari REST API Lawet Hub. Akibatnya, pengajuan staf yang ada di Lawet Hub tidak muncul di antrean `/approval` ALAS, dan sebaliknya.
2. **Inkonsistensi Identitas Record:** Terdapat ketidaksesuaian ID antara Primary Key lokal ALAS (`jurnal.id`) dan ID dari Lawet Hub (`jurnal.source_id`). Tombol telaah dari kartu bawahan yang mengirimkan `source_id` menyebabkan kegagalan pencocokan data pada rute `/approval/[id]`.
3. **Kebutuhan Sistem:** Kebutuhan sistem sesungguhnya adalah menjaga Lawet Hub sebagai *Single Source of Truth* tunggal untuk seluruh siklus hidup data jurnal (draf, pengajuan, telaah, persetujuan, dan penolakan), tanpa memelihara duplikasi database lokal atau *bidirectional sync* yang rentan *race condition*.

## Keputusan

1. **Lawet Hub sebagai Sumber Data Tunggal Workflow:** Seluruh modul antrean persetujuan (`/approval`), telaah detail (`/approval/[id]`), dan *workspace* tim (`/jurnal-saya`) di ALAS berkomunikasi langsung ke REST API Lawet Hub. ALAS tidak lagi menyimpan atau memutasi draf status persetujuan di tabel lokal `jurnal` atau `alas_outbox`.
2. **Pencabutan Scope Read-Only Token ALAS:** Login ALAS tidak lagi menyematkan header pembatas yang memaksa penerbitan token *read-only* (`alas:dashboard:read`). Pengguna berwenang (Kasubag / Approver / Superadmin) yang login di ALAS menerima token autentikasi standar yang memiliki wewenang memanggil endpoint mutasi persetujuan di Lawet Hub.
3. **Pemanggilan Langsung Endpoint Lawet Hub:**
   - Antrean persetujuan: `GET /api/v1/jurnal-alas/approval-queue`
   - Detail telaah jurnal: `GET /api/v1/jurnal-alas/approval-queue/{id}`
   - Persetujuan (Approve & Publish): `POST /api/v1/jurnal-alas/{id}/approve`
   - Permintaan perbaikan (Reject / Revisi): `POST /api/v1/jurnal-alas/{id}/reject`
4. **Peran Database Lokal ALAS:** Database lokal ALAS (`alas-db`) kembali murni ke peran awalnya sebagai *read model* terindeks untuk etalase publik (arsip publik konsumsi warga). Data publik tersebut di-push secara otomatis oleh Lawet Hub melalui *Direct Service API* (`POST /api/service/jurnal`) setelah proses persetujuan selesai di Lawet Hub.

## Konsekuensi

- **Penyederhanaan Arsitektur:** Menghapus kebutuhan tabel `alas_outbox` dan alur *bidirectional sync* dari ALAS ke Lawet Hub.
- **Konsistensi 100%:** Data antrean pada menu `/approval` dan bagian *Jurnal bawahan* pada `/jurnal-saya` selalu identik dan *real-time* karena bersumber dari endpoint yang sama.
- **Pencabutan ADR-0004:** ADR-0004 dinyatakan digantikan (*superseded*).
- **Ketergantungan Jaringan:** Aksi persetujuan di ALAS membutuhkan konektivitas HTTP yang aktif ke `LAWET_API_URL`.

## Alternatif yang Ditolak

- **Melanjutkan Sinkronisasi Dua Arah (ADR-0004):** Memerlukan pembangunan worker penguras *outbox*, manajemen konflik LWW, dan penanganan *race condition* yang tidak diperlukan mengingat Lawet Hub sudah memiliki API persetujuan yang matang.
- **Menggunakan Direct Database Connection (Shared DB):** Menghubungkan ALAS langsung ke PostgreSQL Lawet Hub melanggar prinsip isolasi *boundary* antar-aplikasi dan mengharuskan ALAS mengetahui skema internal Lawet Hub.
