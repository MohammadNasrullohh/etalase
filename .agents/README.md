# .agents

Token-efficient workflow instructions for Lawet Hub agents.

- `AGENTS.md`: the single per-task load protocol and authority split.
- `context/CONTEXT.md`: selects one primary stage.
- `context/DOCS.md`: loaded only before documentation mutation.
- `context/MEMORY_POLICY.md`: loaded only before reading or writing private memory.
- `context/WORKFLOW_EVALUATION.md`: loaded only at task close for lightweight telemetry and periodic audit.
- `stages/*/CONTEXT.md`: procedural stage contracts with on-demand doc pointers.
- `skills/*/SKILL.md`: optional task procedures; no duplicated project facts.
- `MEMORY.md`: lazy, ignored, cross-stage durable preferences.
- `stages/*/MEMORY.md`: lazy, ignored, stage-specific durable preferences.

Mandatory context is the router, safety contract, and one stage. Graphify read/write is mandatory for code mutation; other skills, documentation contracts, testing architecture, memory, and workflow evaluation are conditional. Current project state belongs in active `docs/` and code, not here.
