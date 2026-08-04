---
name: graphify
description: Use for codebase architecture, dependency tracing, file relationships, graph queries, and graph sync when graphify-out exists.
---

# Graphify

Every code mutation requires a focused graph read before editing:

```bash
graphify query "<question>"
```

Use `graphify path "A" "B"` for shortest paths and `graphify explain "X"` for one concept. After any code mutation, update the graph before handoff:

```bash
graphify update .
```

Also update after relevant documentation-path changes. If the graph or CLI is unavailable, report it and fall back to focused file reads; never claim the mandatory graph step succeeded.

Answer only from graph output and cited files.
