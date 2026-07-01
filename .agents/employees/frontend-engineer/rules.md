# rules.md — Frontend Engineer (ALAS)

Guideline arsitektur: **Feature-Sliced Design (FSD)**, diadaptasi untuk Next.js 14 App Router. Referensi konsep: nderdweik, "Feature Sliced Design" (Medium, 2025) — TAPI struktur di artikel itu untuk SPA React murni. App Router punya file-system routing wajib (`app/`) yang tidak bisa dihindari, jadi mapping-nya beda dari contoh artikel. Ikuti struktur di bawah, bukan struktur di artikel mentah-mentah.

---

## 1. Root Cause kenapa ini dipaksakan

Tanpa boundary layer, App Router mendorong developer nulis data-fetching + business logic langsung di `page.tsx`. Untuk ALAS yang read-only tapi sync-nya kompleks (webhook + reconciliation + CQRS-lite read-replica), setiap `page.tsx` yang gemuk = titik gagal tersembunyi saat reconciliation job berubah shape data. FSD memaksa data access logic hidup di `entities/`, bukan tersebar di route files.

---

## 2. Struktur Direktori (ALAS-specific)

`app/` tetap jadi routing layer Next.js (tidak bisa dipindah — App Router requirement). Semua logic pindah ke `src/`:

```
alas/
├── app/                        # Next.js routing layer — TIPIS. Hanya:
│   ├── (public)/
│   │   ├── arsip/[slug]/page.tsx     # import dari src/views/arsip-detail
│   │   └── berita/page.tsx           # import dari src/views/berita-list
│   ├── dashboard/page.tsx            # JWT visibility dashboard
│   ├── api/
│   │   └── webhook/lawet/route.ts    # HMAC verify → delegasi ke src/features/sync
│   └── layout.tsx
│
├── src/
│   ├── views/                  # setara "Pages Layer" artikel — 1:1 dengan route
│   │   ├── arsip-detail/
│   │   └── berita-list/
│   ├── widgets/                # kombinasi >1 feature, mis. ArchiveFilterPanel
│   ├── features/               # kapabilitas: DocumentSearch, VisibilityToggle
│   ├── entities/                # domain objects: Dokumen, Staff, Kegiatan, SyncStatus
│   │   └── dokumen/
│   │       ├── api/            # Drizzle query functions, BUKAN raw db calls di component
│   │       ├── model/          # types, Zod schema
│   │       └── ui/
│   └── shared/
│       ├── lib/db/             # Drizzle client singleton
│       ├── lib/minio/          # presigned URL helper (alas-public-assets)
│       ├── config/env.ts       # validasi env var (lihat §5)
│       └── ui/                 # design system primitives
│
└── tsconfig.json                # path alias, lihat §3
```

Perbedaan sengaja dari artikel: layer `pages` di-rename `views` supaya tidak bentrok istilah dengan `app/` Next.js — mencegah developer baru salah kira `src/views` adalah routing.

---

## 3. Path Alias (wajib, bukan opsional)

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/views/*":    ["./src/views/*"],
      "@/widgets/*":  ["./src/widgets/*"],
      "@/features/*": ["./src/features/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/shared/*":   ["./src/shared/*"]
    }
  }
}
```

## 4. Import Boundary — Enforcement, bukan Trust

Aturan "hanya boleh import layer di bawahnya" TIDAK bisa dijaga manual di code review jangka panjang. Wajib linter:

```bash
npm install -D @conarti/eslint-plugin-fsd
```

```js
// .eslintrc.js (tambahan)
module.exports = {
  plugins: ['@conarti/fsd'],
  rules: {
    '@conarti/fsd/layers-slices': 'error',
    '@conarti/fsd/public-api': 'error',
  },
};
```

CI wajib gagal jika rule ini violated. Jangan biarkan ini jadi "guideline yang dibaca tapi tidak dipaksa" — root cause dari codebase gemuk di artikel referensi justru karena tidak ada enforcement, bukan karena tidak ada dokumentasi.

---

## 5. Server/Client Component Boundary (tidak ada di artikel — spesifik App Router)

Artikel referensi tidak membahas RSC karena ditulis untuk SPA. Untuk ALAS:

- **Default semua `ui/` segment adalah Server Component.** ALAS 100% read-only public-facing → tidak butuh interaktivitas berat.
- Tambahkan `'use client'` HANYA di leaf component yang benar-benar butuh (filter dropdown, search input). Naming convention: suffix `.client.tsx`.
- `entities/*/api/` HARUS dipanggil dari Server Component atau Route Handler — JANGAN fetch Drizzle query dari client component. Ini bukan gaya preferensi, ini kebocoran koneksi DB ke bundle client jika salah.

```
entities/dokumen/
├── api/
│   └── get-dokumen-by-slug.ts   # server-only, "use server" implicit via tidak ada 'use client'
├── model/
│   └── schema.ts                 # Zod — aman dipakai di client & server
└── ui/
    ├── dokumen-card.tsx           # Server Component (default)
    └── dokumen-filter.client.tsx  # Client Component (eksplisit)
```

---

## 6. Public API Pattern — dengan Caveat Bundle Size

Artikel merekomendasikan barrel `index.ts` di setiap slice. Untuk Next.js App Router ini ADA RISIKO: barrel file bisa merusak tree-shaking RSC bundling jika slice besar (bug dikenal di beberapa versi Next 14 dengan barrel + client boundary).

Mitigasi:
- Barrel HANYA untuk `entities/` dan `shared/` (jarang berubah, aman).
- `features/` dan `widgets/` — import langsung dari file spesifik, TANPA barrel, untuk hindari over-import ke client bundle.

```ts
// entities/dokumen/index.ts — OK, barrel
export { getDokumenBySlug } from './api/get-dokumen-by-slug';
export type { Dokumen } from './model/schema';

// features/document-search/ — TIDAK ada index.ts
// import langsung:
import { DocumentSearchInput } from '@/features/document-search/ui/search-input.client';
```

---

## 7. Docker Layer Caching — Efek Samping FSD yang Bisa Dieksploitasi

Stabilitas layer FSD (shared > entities > features > widgets > views) berbanding lurus dengan frekuensi perubahan. Manfaatkan ini di multi-stage Dockerfile untuk cache hit maksimal:

```dockerfile
# Dockerfile — urutan COPY mengikuti stabilitas layer FSD
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Paling stabil dulu → cache hit paling sering
COPY tsconfig.json next.config.js ./
COPY src/shared ./src/shared
COPY src/entities ./src/entities
COPY src/features ./src/features
COPY src/widgets ./src/widgets
COPY src/views ./src/views
COPY app ./app                  # paling sering berubah → di-copy terakhir
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Efek: perubahan di `app/dashboard/page.tsx` tidak invalidate cache layer `entities`/`shared` di CI build.

---

## 8. Segment Discipline

Jangan buat 5 segmen di semua slice (kesalahan yang eksplisit disebut di artikel referensi). Default minimum:

| Slice type | Segment wajib | Segment opsional |
|---|---|---|
| `entities/*` | `model`, `api` | `ui`, `lib` |
| `features/*` | `ui`, `model` | `api`, `lib`, `config` |
| `widgets/*` | `ui` | `model` |

---

## 9. Update AGENTS.md

Tambahkan skill berikut ke baris **Frontend Engineer** di `AGENTS.md`:

```diff
- | ... | **Frontend Engineer** | ... | `theme`, `image-to-code` |
+ | ... | **Frontend Engineer** | ... | `theme`, `image-to-code`, `fsd-lint` |
```

Skill `fsd-lint` = wrapper task yang menjalankan `eslint --rule '@conarti/fsd/*'` sebelum commit, dipanggil di Self-Updating protocol step 6.
