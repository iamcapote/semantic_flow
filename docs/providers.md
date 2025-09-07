# Providers & Models

You bring your own API key. After adding a key you can switch providers at any time. All content stays local to your browser unless you send it to a model by executing or enhancing.

## Core Providers (Built In)
OpenAI
- Typical models: gpt-4o (balanced), gpt-4o-mini (faster, cheaper)
- Good for: structured reasoning, balanced refinement, clean formatting.

OpenRouter
- Aggregates multiple frontier and open models under one key.
- Good for: experimentation and cost‑aware drafts.

Venice
- Includes creative and less filtered variants.
- Good for: expansive or exploratory writing.

Nous
- Hermes model series tuned for instruction following.
- Good for: role shaping and persona clarity.

Morpheus
- Mix of llama / qwen style web-tuned models.
- Good for: quick iterative edits when latency matters.

## Selecting a Provider
1. Open Settings / Provider selector.
2. Paste the key for the provider you want to activate.
3. Choose a default model if offered (fallback is the first listed model).
4. Run a small test (e.g. enhance a short node) to confirm connectivity.

## Switching Models Mid-Session
Change the active provider or model in settings. Your workflow and node content are unaffected. Re-execute to see model differences.

## Choosing the Right Model
Use a larger / more capable model (e.g. gpt-4o, Hermes 405B) for:
- Complex multi-node reasoning
- Dense technical summarization
- Precision formatting across JSON / YAML nodes

Use a lighter / faster model for:
- Quick iteration on titles / labels
- First-pass drafts you will refine
- Large batch enhancement passes

## Keys & Privacy
- Keys are stored locally (session or local storage depending on the modal options) through an internal key manager.
- Removing a key in settings revokes further calls until you re-add it.
- Clearing session does not necessarily delete stored keys—explicitly remove them if needed.

## If Something Fails
- Check the active provider actually has a key entered.
- Try a simpler model (some free endpoints rate limit aggressively).
- Re-run a single small node enhancement to isolate network vs content issues.

Return to: [Getting Started](getting-started.md) · Continue to: [Workflow Execution](features/workflow-execution.md)
