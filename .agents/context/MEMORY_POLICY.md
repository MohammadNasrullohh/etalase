# Memory Contract

Load this file only when durable preferences may affect the task or before any memory mutation.

## Read

- Default to no memory. Read global memory for cross-stage working preferences and selected-stage memory for stage-specific preferences.
- Read both only when both scopes can materially affect the task.
- Precedence is: current user instruction, selected-stage memory, then global memory. Resolve contradictions by updating or removing the stale entry.

## Autonomous Write Gate

An agent may write memory without confirmation only when the item:

- Is a high-confidence preference or working instruction likely to remain useful across future tasks.
- Changes how agents should work, not what the repository currently contains.
- Is not already present in tracked instructions or canonical documentation.
- Can be expressed as one short imperative sentence.

If durability or scope is ambiguous, do not write it. Persist after the task outcome is clear; apply explicit user corrections immediately.

## Routing and Budget

- Use `.agents/MEMORY.md` when the preference applies across stages or to user interaction generally.
- Use `.agents/stages/<stage>/MEMORY.md` when it applies only to that stage; create the file only on its first valid entry.
- Never duplicate an entry across scopes. Merge or replace overlapping entries before appending.
- Keep at most 12 bullets globally and 8 bullets per stage. Remove obsolete entries instead of preserving history.

## Never Store

Do not store repository facts, architecture decisions, task status, temporary bugs, test results, transcripts, secrets, credentials, production data, sensitive personal data, or content already owned by tracked instructions or active docs.

Memory files are local and ignored by Git. They must never be committed or treated as a substitute for canonical documentation.
