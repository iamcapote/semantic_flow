# Providers & Models

Current provider options (example model families; actual availability may vary):

| ID | Models (examples) | Typical Uses |
|----|-------------------|--------------|
| openai | gpt-4o, gpt-4o-mini | General structured reasoning, refinement |
| openrouter | mixed curated set (qwen, dolphin, deepseek) | Exploration, cost‑aware drafts |
| venice | venice-uncensored, mistral variants | Creative or less filtered generation |
| nous | Hermes series | Instruction following, role shaping |
| morpheus | llama / qwen web models | Fast iterative edits |

Selection applies globally until changed. Switching mid‑session affects subsequent executions and chat turns.

## Model Choice Strategy
Use smaller / cheaper models while shaping structure. Switch to higher‑fidelity models for final narrative polish or edge‑case validation (e.g., evaluation criteria precision).

## Chat Injection Modes
None: conversation ignores workflow.
System: workflow appended to the system prompt; best for stable context.
First: workflow added to first user turn only; reduces repeated token cost.

Selection Mode:
Full: includes all node metadata and fields.
Stripped: only essential content (shorter prompts).

## Temperature and Determinism
Lower temperature for refinement, schema stabilization, or evaluation gating. Higher for ideation or creative branching.

## Key Handling
API keys are stored locally in browser storage under provider‑specific keys. Removing them from storage or using the clear session action revokes access. Keys are never transmitted to any other service by the application itself beyond direct provider API calls.


