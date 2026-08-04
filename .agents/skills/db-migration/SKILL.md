---
name: db-migration
description: Use for Alembic migrations, schema changes, constraints, indexes, and data backfills.
---

# DB Migration

Use a safe sequence: add nullable/defaulted structures, backfill, update application code, enforce constraints, then remove obsolete structures later. Verify heads, upgrade/downgrade behavior, models, schemas, services, seeds, and tests. Update `docs/architecture/ERD.md` through the docs contract when the implemented relationship model changes.
