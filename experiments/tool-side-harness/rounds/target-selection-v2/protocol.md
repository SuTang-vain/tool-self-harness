# Next Target Diagnostic Design v1 — debugging-and-error-recovery

Status: source and protocol frozen for fixture authoring on 2026-08-03. No GLM attempt has been
run under this design.

## Target

- Repository: `addyosmani/agent-skills`
- Source path: `skills/debugging-and-error-recovery`
- Frozen commit: `7829ffd90d973b6325f5f12f1b1226dcace74443`
- License: MIT, repository-root `LICENSE`
- Local snapshot: `experiments/tool-side-harness/targets/debugging-and-error-recovery/`
- Primary category: `debugging-diagnosis`
- Secondary categories: `knowledge-rule-policy`, `multi-step-workflow`
- Primary path: `B-state-recovery`

## Qualification design

| Item | Frozen value |
|---|---|
| model | GLM-5.2 via Volcengine Ark `coding/v3` |
| variants | `no-skill`, `minimal`, `official-full` |
| held-in | 6 tasks |
| held-out | 3 tasks |
| repeats | 1 diagnostic repeat |
| attempts | 27 |
| task shape | deterministic local repositories/fixtures, no network services |
| proposer visibility | held-in failure notes only; held-out labels/traces hidden |
| Q4 | `not_measured` |

## Fixture requirements

The suite must contain process-sensitive tasks where final patch correctness alone is insufficient.
Each task should encode one or more of:

1. reproducible failure with noisy symptoms;
2. root cause distinct from the first visible symptom;
3. a minimal fix that avoids unrelated changes;
4. a regression guard that should be added or updated;
5. end-to-end verification after the fix;
6. at least one decoy path where guessing or editing before reproduction passes a superficial check
   but fails the hidden verifier.

Suggested held-in families:

- test failure caused by an environment/config mismatch;
- runtime failure caused by a shared-state leak;
- build failure caused by an incorrect dependency boundary;
- flaky/concurrent failure requiring isolation evidence;
- wrong-layer symptom requiring bisection or minimal reproduction;
- regression requiring a focused guard plus full verification.

Suggested held-out families should use different surface details while preserving the same process
constructs. They must not reveal their root-cause labels or expected command sequence to the
proposer.

## Hidden verifier contract

The verifier should score independently:

- task completion/correct patch;
- reproduction evidence before edit;
- root-cause localization;
- minimality/no unrelated edits;
- regression-test or guard presence;
- final focused and full verification;
- protected decoy preservation;
- files changed and unauthorized edits.

A candidate benchmark is not qualified if all variants receive the same task result while process
metrics differ only in traces. Conversely, process metrics may not replace task correctness: they are
secondary dimensions used to establish genuine variant separation and mechanism sensitivity.

## Diagnostic stop/go

Go to formal baseline only if Gate 0 passes, at least one task-level outcome or process metric
separates variants, minimal retains held-in headroom, official-full changes the intended process
behavior, and neither split is floor/ceiling saturated. Stop and redesign otherwise. This diagnostic
cannot freeze h0, establish Q2, or generate a Self-Harness candidate.
