# Execution Sequence Detail

Current implementation: strictly sequential.

```
for node in orderedNodes:
  buildNodeContext(node)
  gather upstream outputs
  compose messages
  call provider
  record result
  emit progress event
```

Future (planned):
1. Build dependency graph from edges (target depends on source).
2. Topological sort (Kahn's algorithm) with detection:
   - Cycles → emit error / highlight nodes.
3. Ready queue (all nodes with satisfied deps).
4. Pooled parallel execution with concurrency limit N.
5. Event bus publishes state transitions.
6. Downstream nodes activated as dependencies complete.

Error Strategies:
- Continue (current) → mark failed node, skip output injection.
- Fail-fast → abort workflow, return partial state.
- Retry policy → exponential backoff per node type / provider error class.

Data Integrity:
- Each node state immutable snapshot appended to array (time-series history possible with minimal change).
- Output normalization step could enforce JSON schema per ontology cluster in future.
