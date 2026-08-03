# ADR-0001: Direct Service dengan transactional outbox

Status: Accepted
Tanggal: 2026-08-03

## Konteks

Lawet Hub adalah sumber kebenaran, sedangkan ALAS menyimpan proyeksi publik. Pemanggilan HTTP sinkron setelah perubahan jurnal tidak memberi jaminan delivery: crash atau timeout di antara commit lokal dan respons ALAS dapat meninggalkan kedua database berbeda. Retry biasa juga dapat mengirim request yang sama lebih dari sekali.

## Keputusan

Direct Service dipertahankan sebagai transport server-to-server, dengan jaminan berikut:

1. Lawet Hub menulis desired state dan satu row `alas_sync_outbox` dalam transaksi database yang sama.
2. Celery worker mengirim outbox secara asinkron, memakai timeout dan exponential backoff dari env.
3. Setiap write membawa `X-ALAS-Event-Id`, timestamp, dan signature HMAC-SHA256 atas method, path, dan hash body.
4. ALAS mengklaim `event_id` pada tabel `service_events` dalam transaksi yang sama dengan perubahan proyeksi. Replay event yang sama dikembalikan sebagai sukses tanpa memproses ulang.
5. Upsert memakai `INSERT ... ON CONFLICT DO UPDATE`; `source_id` tetap menjadi identitas lintas sistem.
6. Reconciliation berkala membentuk ulang desired state untuk jurnal published, unpublish, dan deleted.
7. `ALAS_SERVICE_TOKEN`, `ALAS_WEBHOOK_SECRET`, URL layanan, timeout, dan retry hanya berasal dari env. Kredensial tidak boleh disimpan di `platform_configs`.

## Konsekuensi

- Respons publish berarti `queued`, bukan bukti proyeksi sudah tersedia di ALAS.
- Status `publish_pending` dan `unpublish_pending` merepresentasikan delivery yang belum selesai.
- Delivery bersifat at-least-once, sedangkan penerapan di ALAS bersifat effectively-once per `event_id`.
- Outbox menambah tabel, worker, observability, dan kebutuhan retensi event ledger.
- HMAC mencegah pemalsuan dan replay di luar window; event ledger menutup replay dalam window.

## Alternatif yang ditolak

- HTTP sinkron tanpa outbox: masih memiliki crash gap.
- Hanya retry Celery tanpa idempotency: dapat mengulang side effect.
- Mengganti transport menjadi webhook terpisah: tidak mengubah kebutuhan outbox dan idempotency, sehingga menambah surface tanpa manfaat jaminan.
