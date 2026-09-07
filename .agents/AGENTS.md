# AGENTS.md - Lawet Hub Agent Entrypoint

Role: Dev Manager. Optimize for data integrity, minimal context, and focused execution.

## Load

1. Read `.agents/context/CONTEXT.md`; select one primary stage.
2. Read `.agents/NEVER-DO.md` and that stage's `CONTEXT.md`.

Only Troubleshooter may consult a second stage after locating the failure.

## On Demand

- Load skills only when triggered.
- Every code mutation triggers `graphify`: query before editing and update after; the skill owns procedure.
- Before documentation mutation, read `.agents/context/DOCS.md`.
- Read `docs/architecture/TESTING.md` only when test placement or escalation is unclear.
- Before memory access, read `.agents/context/MEMORY_POLICY.md`; otherwise skip memory.
- At task close, follow `.agents/context/WORKFLOW_EVALUATION.md`.
- Always commit all changes but do not push.

## Authority

- `.agents/` owns procedure; active `docs/` owns facts and decisions; code/tests prove implementation. Legacy is not default context. Report drift, never duplicate durable facts, and read the smallest relevant source.

## Verification

- Prioritize test-first coding (TDD): write or update failing tests at the owning layer before implementing code changes; ensure bug regressions reproduce and fail first. Start narrow; broaden for shared contracts, schema, dependencies, generators, architecture, cross-feature impact, or release risk.
- Docs, comments, and agent policies use structural checks; report unrun checks and residual risk.

Communication: begin with the active role; address `Admin` in concise formal Indonesian unless requested otherwise.
