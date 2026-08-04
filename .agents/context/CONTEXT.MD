# CONTEXT.md - Stage Router

Choose one primary stage. Priority: failure -> database -> graphify -> release -> domain stage. Only Troubleshooter may consult a second stage after locating the failing surface.

| Scope | Stage |
| --- | --- |
| UI, React, CSS, theme | `.agents/stages/frontend/CONTEXT.md` |
| API, FastAPI, Celery, services | `.agents/stages/backend/CONTEXT.md` |
| Alembic, schema, backfill | `.agents/stages/database/CONTEXT.md` |
| Tests and verification | `.agents/stages/qa/CONTEXT.md` |
| Error or regression | `.agents/stages/troubleshooter/CONTEXT.md` |
| Explanation or tutorial | `.agents/stages/explainer/CONTEXT.md` |
| Version or release | `.agents/stages/release/CONTEXT.md` |
| Docker, Nginx, environment | `.agents/stages/devops/CONTEXT.md` |
| Architecture/dependency map | `.agents/stages/graphify/CONTEXT.md` |

The selected stage owns task-local procedure; shared conditional contracts are routed by `.agents/AGENTS.md`.
