# Self-Harness Research Charter: Layered Tool Evolution

Status: active direction reset on 2026-07-30.

## Core thesis

Tool self-evolution is not a single-score optimization problem. A candidate can be more capable,
more reliable, cheaper, or more preferred without being better on the other dimensions. The
research therefore reports four separate layers:

1. **Correctness / capability** — can the agent complete the verifier-defined task?
2. **Reliability** — does it complete the same task on every fresh repeat, without breaking tasks
   that were already reliable?
3. **Efficiency / deployability** — how many tokens, tool calls, API calls, and milliseconds are
   spent per attempt, successful attempt, and reliable task?
4. **Human utility / preference** — does the behavior fit a user's workflow, interaction style,
   control expectations, and tolerance for clarification or latency?

The first two layers are hard acceptance constraints for capability evolution. Efficiency and
human utility are separate optimization tracks and must not compensate for a correctness or
reliability regression.

## Research questions

### Q1 — Reliable capability

Does a bounded harness edit increase the reliable task set while preserving all previously
reliable tasks and both held-in/held-out aggregate pass counts?

### Q2 — Generalization

Does the same edit survive a larger task distribution, a fresh task split, and independent model
replication? A result that passes only one model and one compact suite is a **model-specific local
improvement**, not a general Self-Harness claim.

### Q3 — Efficiency

Conditional on Q1 passing, does the candidate reduce resource use or improve the cost of reliable
success? Report tokens, tool calls, API calls, latency, and (when available) provider cost. Do not
trade away reliable capability for efficiency unless an explicitly separate product policy allows
it.

### Q4 — Human utility

Conditional on Q1 passing, does the candidate improve user preference, clarification quality,
control calibration, handoff frequency, completion time, or interaction burden? Human utility is
measured in a separate study; verifier outcomes cannot be used as a proxy for preference.

## Lexicographic evaluation policy

Evaluation proceeds in this order:

### Gate 0 — Safety and protocol integrity

Reject on any critical safety, protocol, data-integrity, or infrastructure violation. API and
infrastructure errors are aborted, not scored as task failures.

### Gate 1 — Reliable capability

Use `reliable-task-set-v1`:

- gain at least one reliable task;
- lose no reliable task;
- held-in aggregate does not decrease;
- held-out aggregate does not decrease;
- no critical verifier failure increases.

This is the only gate that promotes a capability lineage.

### Gate 2 — Efficiency track

An efficiency-only candidate may be reported as an efficiency improvement only when the reliable
task set and aggregate capability are unchanged or improved. It must meet a threshold declared
before evaluation, such as:

- at least 10% lower median total tokens per attempt; or
- at least 10% lower median wall-clock latency; or
- at least 10% fewer tool calls per successful attempt.

No efficiency-only candidate is promoted when it loses a reliable task. Efficiency metrics are
currently instrumentation/reporting targets; thresholds must be preregistered for each future
study.

### Gate 3 — Human utility track

Report preference win rate, clarification count, user takeover rate, completion time, and
interaction burden separately. A preference win is not a capability promotion unless Gates 0–1
also pass.

## Claim levels

Use the narrowest claim supported by evidence:

- **L0 — Aggregate movement:** split-level pass counts changed.
- **L1 — Reliable local promotion:** Gates 0–1 pass on one model and one frozen suite.
- **L2 — Model-replicated promotion:** Gate 1 passes independently on at least two models.
- **L3 — Distribution-general promotion:** Gate 1 passes on an expanded or independent task
  distribution and at least two models.
- **L4 — Product utility improvement:** L3 plus preregistered efficiency and/or human-utility
  evidence with no capability/reliability regression.

The current GLM MCP 12-task result is **L1**. The expanded 36-task result rejects promotion, so
it is not L3. MiniMax and DeepSeek results do not support L2 for the same edit.

## Interpretation of current evidence

- The per-task acceptance rule is a methodological contribution because it rejects aggregate
  task exchanges and variance-based false positives.
- The compact GLM MCP result demonstrates a local reliable promotion.
- The expanded GLM result shows that the promotion is not robust to the current expanded task
  distribution.
- MiniMax and DeepSeek show that the edit is model-specific rather than universal.
- The systematic-debugging pilot is outcome-flat and should be treated as benchmark qualification,
  not Self-Harness evidence.

## Planned research tracks

1. **Capability track:** keep the frozen reliable gate and audit the expanded MCP suite.
2. **Efficiency track:** use the new runner metrics on future fresh evaluations; do not backfill
   old traces as if they had pre-registered usage accounting.
3. **Generalization track:** perform an independent GLM replication of the expanded suite before
   spending more cross-model quota. If it reproduces the rejection, retain the negative result.
4. **Human-utility track:** design a separate human or preference benchmark only after the
   capability protocol is stable.

## Reporting rule

Every result table must label which layer it measures. Never summarize a candidate as “better”
without specifying whether the claim is about correctness, reliability, efficiency, or preference.
A single weighted score is prohibited for the primary research claim because it can hide a
critical reliability regression behind a token or latency reduction.
