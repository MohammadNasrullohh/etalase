# Documentation Contract

Load this file only before creating, editing, moving, or archiving documentation.

## Read Budget

- Read active docs only when relevant to the task.
- Start with one concern file or one specific ADR; never scan all of `docs/` by default.
- Do not use `docs/legacy/` as implementation guidance.
- Use Graphify first when the question is relational or cross-file.

## Taxonomy

| Class | Location | Mutation rule |
| --- | --- | --- |
| Immutable | `docs/adr/` | One accepted decision per `NNNN-short-title.md`; never edit/delete after acceptance. A changed decision gets a new ADR with `Supersedes ADR-NNNN`. |
| Stable | `docs/architecture/`, `docs/product/` | Current snapshot; one file per concern; edit the canonical file directly. |
| Living | `docs/ops/` | Only `RUNBOOK.md`, `KNOWN_ISSUES.md`, and `RISK_ASSESSMENT.md`; direct updates allowed. |
| Legacy | `docs/legacy/` | Read-only archive; move only when inactive and unreferenced by active docs; never delete. |

## When to Write

- Write docs when the user requests it or an implemented change alters a durable architecture, product, design, or operational contract.
- Create an ADR only for an accepted major technical decision, not for routine implementation detail or speculation.
- If code and active docs disagree, report the drift. Update stable/living docs when in scope; never rewrite decision history.
- Do not copy doc content into `.agents`; stage files should point to the canonical concern.

## Move and Link Rules

- Use `git mv` for tracked files; disclose when an untracked file has no history to preserve.
- Use relative links between docs and update every active reference affected by a move.
- Before completion, search for old paths, validate active relative links, and run `git diff --check`.
- Never delete any documentation file without explicit approval.
