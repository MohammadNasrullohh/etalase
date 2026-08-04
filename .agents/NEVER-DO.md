# NEVER-DO.md - Safety

- Commit every verified tracked mutation locally before handoff; include only task-owned changes.
- Never push, checkout, reset, rewrite history, or publish unless explicitly requested.
- Never revert or overwrite unrelated user work.
- Verify resolved paths and authority before deletion or recursive moves.
- Never expose or hardcode secrets, credentials, or production data.
- Require dependency checks and explicit approval for destructive schema/data operations.
- Never edit/delete accepted ADRs or `docs/legacy/`; never archive an actively referenced document.
- Keep durable project facts out of stage and skill files.
- Never claim test, command, deployment, or migration success without actual verification.
