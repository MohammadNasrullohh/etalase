# CONTEXT.md — Architecture & Synchronization Context (ALAS v1.2)

## 🏗️ Architecture Stack
- **Framework**: Next.js 14 App Router (FSD - Feature Sliced Design)
- **Database**: PostgreSQL 16 (`alas-db` docker container running on host port 5433)
- **ORM**: Drizzle ORM (`drizzle/schema.ts` definition, migrations located in `drizzle/migrations`)
- **Service Security**: Timing-safe Bearer Token verification on Service API routes (`ALAS_SERVICE_TOKEN`)
- **Branding styling**: Dark ember theme (#0C0C0C base), parallelogram 3x4 leader cards, dynamic bezier path SVG futuristic connection lines from active card to calendar date.
- **Testing**: Vitest + React Testing Library (15 tests passing: auth, CRUD, DB, and UI elements)

## 📂 Directories (FSD)
- `src/entities/` -> `jurnal/`, `pimpinan/` (types, API queries, Card primitives)
- `src/features/` -> `service-auth/`, `jurnal-sync/`, `pimpinan-sync/`, `jurnal-filter/` (capability actions/hooks)
- `src/widgets/` -> `jurnal-list/`, `calendar-widget/`, `documentation-panel/` (combined component widgets)
- `src/views/` -> `landing/` (main page entrypoint view)
- `src/shared/` -> DB singleton, futuristic connection line overlay, UI style tokens.
- `src/app/` -> Routing layer. Calls queries and features from `src/`.

## 🔄 Webhook / Sync Contract
Detailed in [INTEGRATION.md](file:///C:/Users/humas/Documents/Python/ALAS/INTEGRATION.md):
- `POST /api/service/jurnal` -> upserts Jurnal based on `source_id`, merges public/private documents.
- `POST /api/service/pimpinan` -> upserts pimpinan komisioner based on `source_id`, manages active date range.
