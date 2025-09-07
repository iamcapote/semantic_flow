# Node Enhancement

Purpose: transform a single node’s content to improve clarity, brevity, depth, or structure without changing its identity or fields.

Available actions (typical effect):
Improve: balanced polish.
Simplify: removes verbosity, keeps core intent.
Elaborate: expands with supporting detail or rationale.
Refactor: restructures into clearer sections or lists.
Optimize: sharpens wording for operational reuse (e.g., system prompts).

Procedure:
1. Select node.
2. Choose action.
3. Inspect proposed revision.
4. Accept if semantic intent is preserved; otherwise adjust manually and rerun or discard.

Selection guidance:
Simplify after Elaborate if expansion overshoots. Prefer a single decisive enhancement over stacking multiple incremental ones, which can introduce drift.

Verification checklist:
Numeric bounds unchanged. Constraints preserved. Role or target audience unaltered. Field references still valid.

Known limits: no built‑in side‑by‑side diff; copy original content first if you need a manual rollback.


