# Graph Report - ALAS  (2026-07-01)

## Corpus Check
- 92 files · ~65,732 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 412 nodes · 462 edges · 56 communities (20 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad1653dc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `DB` - 18 edges
2. `compilerOptions` - 15 edges
3. `PRD — ALAS (Arsip Langkah Bawaslu Kebumen)` - 15 edges
4. `jurnal` - 12 edges
5. `rules.md — Frontend Engineer (ALAS)` - 10 edges
6. `6. Frontend Specification` - 10 edges
7. `INTEGRATION.md — Kontrak Integrasi ALAS ↔ Lawet Hub` - 10 edges
8. `3. Service API Endpoints (ALAS)` - 10 edges
9. `pimpinan` - 8 edges
10. `7. Companion Module — Lawet Hub "Modul Jurnal ALAS"` - 7 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `upsertJurnal()`  [INFERRED]
  src/app/api/service/jurnal/route.ts → src/features/jurnal-sync/lib/upsert-jurnal.ts
- `GET()` --calls--> `getJurnalDetail()`  [INFERRED]
  src/app/api/jurnal/[id]/route.ts → src/entities/jurnal/api/get-jurnal-detail.ts
- `GET()` --calls--> `getJurnalList()`  [INFERRED]
  src/app/api/jurnal/route.ts → src/entities/jurnal/api/get-jurnal-list.ts
- `GET()` --calls--> `getPimpinanDetail()`  [INFERRED]
  src/app/api/pimpinan/[id]/route.ts → src/entities/pimpinan/api/get-pimpinan-detail.ts
- `GET()` --calls--> `getPimpinanList()`  [INFERRED]
  src/app/api/pimpinan/route.ts → src/entities/pimpinan/api/get-pimpinan-list.ts

## Import Cycles
- None detected.

## Communities (56 total, 36 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (20): getJurnalCalendar(), getJurnalDetail(), getJurnalList(), GetJurnalListParams, GET(), DB, pool, jurnal (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): 10.1 Docker Compose (ALAS Stack), 10.2 Nginx Config, 10.3 Environment Variables, 10.4 Deployment Topology, 10. Infrastructure & Deployment, 11.1 Backend — Webhook & API, 11.2 Integration Tests, 11.3 Frontend Tests (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): 1. Arsitektur Komunikasi, 2. Service API Auth, 3. Service API Endpoints (ALAS), 4. Error Responses, 5. MinIO — Setup `alas-public-assets`, 6.1 New Files (Lawet Hub), 6.2 ALAS Service Client, 6.3 Publish Flow (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (31): 1. Background & Problem Statement, 2. Goals & Non-Goals, 3.1 Sync Mechanism — Direct Service API, 3.2 Sequence Flows, 3.3 Storage Strategy, 3. System Architecture, 4.1 ALAS — PostgreSQL (schema `alas`), 4.2 `pimpinan` Table (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (16): LandingView(), queryClient, useJurnalFilter(), FuturisticLine(), FuturisticLineProps, CalendarWidget(), CalendarWidgetProps, JurnalDetailModal() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): dependencies, d3, drizzle-orm, lucide-react, next, pg, react, react-dom (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (24): devDependencies, drizzle-kit, eslint, eslint-config-next, jsdom, postcss, tailwindcss, @testing-library/jest-dom (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (10): 1. Root Cause kenapa ini dipaksakan, 2. Struktur Direktori (ALAS-specific), 3. Path Alias (wajib, bukan opsional), 4. Import Boundary — Enforcement, bukan Trust, 5. Server/Client Component Boundary (tidak ada di artikel — spesifik App Router), 6. Public API Pattern — dengan Caveat Bundle Size, 7. Docker Layer Caching — Efek Samping FSD yang Bisa Dieksploitasi, 8. Segment Discipline (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (10): 6.1 Design System, 6.2 Pages & Routes (ALAS Only), 6.3 Landing Page Layout, 6.4 Leadership Panel, 6.5 Animation Specification, 6. Frontend Specification, Interaction Animations, Opening Animation (page load) (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (9): 5.1 Webhook (Lawet Hub → ALAS), 5.2 Public Read API (ALAS), 5.3 Admin API (ALAS — Protected, JWT), 5.4 Reconciliation Endpoint (Lawet Hub internal), 5. Integration Contract, `GET /api/health`, `GET /api/jurnal/calendar?month=YYYY-MM`, `GET /api/jurnal?cursor=&limit=20&kategori=` (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (7): JurnalList(), JurnalListProps, categoryBorders, categoryLabels, categoryStyles, JurnalCard(), JurnalCardProps

### Community 12 - "Community 12"
Cohesion: 0.38
Nodes (4): LeadershipPanel(), LeadershipPanelProps, LeaderCard(), LeaderCardProps

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): AGENTS.md — Dev Manager Dispatcher (Project: ALAS), 📋 Execution Protocol, 🔄 Manager Self-Updating & Organic Employee Creation Protocol, 🔒 Non-Negotiable Guardrails (spesifik ALAS)

### Community 15 - "Community 15"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (10): BarChart(), BarChartProps, BarData, CATEGORY_COLORS, CATEGORY_LABELS, ALL_CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.60
Nodes (4): getJurnalStatsByYear(), getJurnalYears(), JurnalStats, GET()

## Knowledge Gaps
- **240 isolated node(s):** `extends`, `pool`, `db`, `nextConfig`, `name` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PRD — ALAS (Arsip Langkah Bawaslu Kebumen)` connect `Community 1` to `Community 10`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `PRD — ALAS (Arsip Langkah Bawaslu Kebumen)` connect `Community 3` to `Community 9`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `extends`, `pool`, `db` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08484848484848485 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._