# Workflow Evaluation Contract

Load this file only when closing a completed task. A clarification-only or status-only response is not a completed task.

## Record

Maintain `.agents/WORKFLOW_LOG.md` as ignored local telemetry. Never record prompts, repository facts, code content, secrets, credentials, or personal data.

After each completed task, append one compact entry and increment `tasks_since_audit`. Keep only the latest 10 entries:

```text
last_audit: <commit-or-none>
tasks_since_audit: <0-10>
- <ISO-date> | stage=<stage> | change=<none|tracked|private> | graph=<na|read|read+update|blocked> | check=<none|structural|focused|broad> | memory=<none|global|stage> | issue=<none|overread|route|test|graph|memory|commit|safety|other>
```

This log is workflow telemetry, not global or stage memory. Do not commit it.

## Automatic Audit

- Audit automatically when `tasks_since_audit` reaches 5, or earlier when the same issue appears twice or one safety/data-integrity issue appears.
- If required evidence or tooling is unavailable, record the audit as blocked and retry on the next completed task; never allow more than 10 unevaluated entries.
- Review only available evidence: the latest log entries, Git history/status, Graphify query/update evidence, relevant verification, and current memory files.

Check whether agents selected one correct stage, avoided unnecessary reads, used Graphify around code changes, chose proportional tests, routed memory correctly, preserved unrelated work, and committed every verified tracked mutation. Confirm the mandatory load path remains at most 500 words for every stage.

## Outcome

- Change tracked instructions only for a pattern present in at least two evaluated tasks, or one safety/data-integrity violation. Never add speculative rules.
- Patch the smallest owning contract and remove superseded wording instead of adding duplicates.
- If tracked instructions change, verify and commit them locally. Never push without explicit approval.
- After a completed audit, set `last_audit` to the final local commit, reset `tasks_since_audit` to `0`, and retain only entries useful for the next audit window.
