# NEVER-DO.md — Safety Guardrails (ALAS)

- Jangan melakukan mutasi database di read-replica / CQRS-lite read side secara manual.
- Jangan melakukan bypass pada token validation/bearer auth di service API.
- Jangan menyimpan MinIO credentials di backend/frontend ALAS.
- Jangan menyimpan raw password di DB, wajib menggunakan bcrypt hashing.
