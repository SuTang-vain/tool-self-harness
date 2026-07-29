# MCP Builder Task Expansion v1

Target suite size: 24 held-in + 12 held-out.

Before evaluating any model on the expanded suite:

1. Add 16 held-in and 8 held-out tasks covering schema composition, resources/prompts, transport
   cleanliness, cancellation/timeouts, pagination/cursors, error mapping, state, and multi-tool
   interactions.
2. Every initial fixture must fail its hidden verifier.
3. Every task must have an independently constructed reference repair that passes; reference
   repairs must not be stored in the model-visible suite.
4. Freeze a task-tree hash and split assignment before model runs.
5. Evaluate `h0-stable` and `h1-stable` with GLM first, 3 repeats per task. Only after that result
   is frozen should MiniMax and DeepSeek be run on the expanded suite.
6. Apply `reliable-task-set-v1` without changing thresholds after results.
