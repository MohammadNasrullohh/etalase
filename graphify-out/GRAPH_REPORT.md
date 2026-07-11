# Graph Report - ALAS  (2026-07-11)

## Corpus Check
- 118 files · ~74,465 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 525 nodes · 651 edges · 61 communities (22 shown, 39 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6a4a3d5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 51
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- rules.md
- graphify.md
- graphify.md

## God Nodes (most connected - your core abstractions)
1. `DB` - 19 edges
2. `authenticateService()` - 18 edges
3. `compilerOptions` - 15 edges
4. `PRD — ALAS (Arsip Langkah Bawaslu Kebumen)` - 15 edges
5. `ALAS — Arsip Langkah Bawaslu Kebumen` - 14 edges
6. `jurnal` - 13 edges
7. `getCategoryLabel()` - 11 edges
8. `rules.md — Frontend Engineer (ALAS)` - 10 edges
9. `6. Frontend Specification` - 10 edges
10. `INTEGRATION.md — Kontrak Integrasi ALAS ↔ Lawet Hub` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DocumentationPanel()` --references--> `react-dom`  [EXTRACTED]
  src/widgets/documentation-panel/ui/index.tsx → package.json
- `PATCH()` --calls--> `authenticateService()`  [EXTRACTED]
  src/app/api/service/jurnal/[sourceId]/dokumen/route.ts → src/features/service-auth/lib/verify-token.ts
- `GET()` --calls--> `authenticateService()`  [EXTRACTED]
  src/app/api/service/jurnal/[sourceId]/route.ts → src/features/service-auth/lib/verify-token.ts
- `PATCH()` --calls--> `authenticateService()`  [EXTRACTED]
  src/app/api/service/jurnal/[sourceId]/route.ts → src/features/service-auth/lib/verify-token.ts
- `DELETE()` --calls--> `authenticateService()`  [EXTRACTED]
  src/app/api/service/jurnal/[sourceId]/route.ts → src/features/service-auth/lib/verify-token.ts

## Import Cycles
- None detected.

## Communities (61 total, 39 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (35): jurnal, pimpinan, db, pool, GET(), GET(), GET(), GET() (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 10.1 Docker Compose (ALAS Stack), 10.2 Nginx Config, 10.3 Environment Variables, 10.4 Deployment Topology, 10. Infrastructure & Deployment, 11.1 Backend — Webhook & API, 11.2 Integration Tests, 11.3 Frontend Tests (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): 1. Arsitektur Komunikasi, 2. Service API Auth, 3. Service API Endpoints (ALAS), 4. Error Responses, 5. MinIO — Setup `alas-public-assets`, 6.1 New Files (Lawet Hub), 6.2 ALAS Service Client, 6.3 Publish Flow (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (18): 5.1 Autentikasi Service API, 5.2 Public Read API, 5.3 Service API — Pimpinan (Lawet Hub → ALAS, Bearer token required), 5.4 Response Error Codes, 5.4 Service API — Jurnal (Lawet Hub → ALAS, Bearer token required), 5. Integration Contract, `DELETE /api/service/jurnal/{source_id}` — Soft Delete, `GET /api/health` (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (37): JurnalCard(), JurnalCardProps, JurnalDetailModal(), JurnalDetailModalProps, useJurnalFilter(), KategoriDropdown(), KategoriDropdownProps, SearchBar() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): 1. API Publik (Unauthenticated), 1. Health Check, 1. List Jurnal, 1. List Pimpinan Aktif, 2. Detail Jurnal, 2. Detail Profil Pimpinan, 3. Kalender Kegiatan, 4. Statistik & Rekapitulasi Tahunan (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (24): devDependencies, drizzle-kit, eslint, eslint-config-next, jsdom, postcss, tailwindcss, @testing-library/jest-dom (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (9): submitJurnalAction(), CustomFieldItem, DokumenPendukungItem, DokumentasiItem, JurnalSubmissionPayload, PihakTerkaitItem, JurnalSubmitForm(), PengajuanView() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (23): 1. Background & Problem Statement, 2. Goals & Non-Goals, 3.1 Sync Mechanism — Direct Service API, 3.2 Sequence Flows, 3.3 Storage Strategy, 3. System Architecture, 4.1 ALAS — PostgreSQL (schema `alas`), 4.2 `pimpinan` Table (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (9): 5.1 Webhook (Lawet Hub → ALAS), 5.2 Public Read API (ALAS), 5.3 Admin API (ALAS — Protected, JWT), 5.4 Reconciliation Endpoint (Lawet Hub internal), 5. Integration Contract, `GET /api/health`, `GET /api/jurnal/calendar?month=YYYY-MM`, `GET /api/jurnal?cursor=&limit=20&kategori=` (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (12): 1. Create atau Upsert Jurnal, 1. Create atau Upsert Pimpinan, 2. Service API (Bearer-Protected), 2. Update Parsial Jurnal, 2. Update Profil Pimpinan, 3. Soft Delete Pimpinan, 3. Toggle Visibilitas Dokumen Pendukung, 4. Detail Jurnal Internal (View Admin) (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): AGENTS.md — Dev Manager Dispatcher (Project: ALAS), 📋 Execution Protocol, 🔄 Manager Self-Updating & Organic Employee Creation Protocol, 🔒 Non-Negotiable Guardrails (spesifik ALAS)

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (5): loginAction(), LoginForm(), FuturisticLine(), FuturisticLineProps, LoginView()

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (29): 1. Clone & Install, 1. Clone repositori ke server, 1. Sinkronisasi Token Auth, 2. Alur Manajemen Aset Media (MinIO), 2. Jalankan Database, 2. Setup Environment Variables, 3. Implementasi HTTP Client (Python httpx), 3. Jalankan Container (+21 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): 1. Root Cause kenapa ini dipaksakan, 2. Struktur Direktori (ALAS-specific), 3. Path Alias (wajib, bukan opsional), 4. Import Boundary — Enforcement, bukan Trust, 5. Server/Client Component Boundary (tidak ada di artikel — spesifik App Router), 6. Public API Pattern — dengan Caveat Bundle Size, 7. Docker Layer Caching — Efek Samping FSD yang Bisa Dieksploitasi, 8. Segment Discipline (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.38
Nodes (6): approveJurnalAction(), fetchWithToken(), getApprovalQueueAction(), rejectJurnalAction(), ApprovalQueue(), ApprovalView()

### Community 19 - "Community 19"
Cohesion: 0.60
Nodes (4): GET(), getJurnalStatsByYear(), getJurnalYears(), JurnalStats

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (4): 🏗️ Architecture Stack, CONTEXT.md — Architecture & Synchronization Context (ALAS v1.2), 📂 Directories (FSD), 🔄 Webhook / Sync Contract

### Community 55 - "Community 55"
Cohesion: 0.12
Nodes (15): dependencies, d3, drizzle-orm, lucide-react, next, pg, react, react-dom (+7 more)

## Knowledge Gaps
- **286 isolated node(s):** `extends`, `pool`, `db`, `nextConfig`, `name` (+281 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 55` to `Community 7`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `DocumentationPanel()` connect `Community 55` to `Community 4`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `extends`, `pool`, `db` to the rest of the system?**
  _286 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07553143374038897 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._