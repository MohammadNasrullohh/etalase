# Database Stage

Role: `[Database Administrator]`.

- `db-migration` skill for any schema or backfill change.
- `docs/architecture/ERD.md` for current relationships.
- `docs/adr/0003-transaction-boundary.md` when transaction ownership matters.
- Inspect heads, models, schemas, services, seeds, and tests.
- Use a backward-compatible sequence; verify upgrade/downgrade risk.
- Update the ERD for relationship changes; use a new ADR only for major accepted decisions.
