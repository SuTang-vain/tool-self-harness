# Security Review Path-C Qualification v2

Preregistered on 2026-07-31 after user confirmation and before fixture outcomes or model evaluation.
Status: frozen diagnostic design; formal stage is conditional on diagnostic stop/go.

## Research role

- target: `github/awesome-copilot/security-review`
- harness class: knowledge-rule / policy
- fitting path: Path C — density control and pruning
- purpose: benchmark qualification and 4D baseline calibration, not Self-Harness evolution
- model: GLM-5.2 via Volcengine Ark `coding/v3`, temperature 0
- Q4: `not_measured`

## Frozen diagnostic design

- suite: `security-review-qualification-v2`
- held-in: 6 tasks
- held-out: 3 tasks
- variants: `no-skill`, `minimal`, `official-full`
- repeats: 1 fresh repeat per task and variant
- attempts: 27 total
- task-order seed: `2026073101`
- run id: `security-review-glm-qualification-diagnostic-v2`
- held-out task names, traces, expected findings, aliases, and reference repairs remain hidden from
  any future proposer

The task families are:

1. cross-file taint and sink tracing;
2. effective validation / authorization versus pattern-only false positives;
3. multi-finding prioritization and evidence completeness;
4. framework or configuration-specific policy checks.

The suite is intended to be non-ceiling rather than universally difficult: some tasks may be solved
by all variants, some must separate skill-bearing variants, and at least one held-in task should
remain a reliable failure for `minimal` before any candidate generation.

## Report and verifier contract

Reports are JSON at `SECURITY_REVIEW.json` with `findings`, `scanned_files`, and
`source_modified`. Finding categories are mapped to hidden canonical IDs through an alias table in
the verifier. The verifier checks canonical finding set, severity floor, required files, concrete
evidence, concrete remediation, required scanned files, and no audited-source modification.
Safe-decoy tasks require an empty finding set. Surface wording and finding order are not scored.

Before evaluation, fixture validation must establish:

- every untouched fixture fails;
- every external reference repair passes;
- canonical alias and safe-decoy tests pass;
- task, verifier, and reference hashes are frozen;
- no provider or infrastructure error is counted as a task failure.

## Diagnostic stop/go

Advance to formal qualification only if all conditions hold:

1. Gate 0: no fixture, verifier, alias, leakage, or infrastructure defect;
2. at least two task-level outcome or preregistered process separations exist across variants;
3. the three variants are not outcome-flat or universally failing;
4. at least one held-in task remains unsolved by `minimal`, preserving headroom;
5. any category aliases are handled by the verifier and are not the sole source of separation.

Stop and redesign if the suite remains ceiling-flat, universally fails, or only alias wording creates
differences.

## Conditional formal stage

If diagnostic stop/go passes, create a separate preregistration before formal evaluation:

- 8 held-in + 4 held-out;
- 3 fresh repeats per task and variant;
- 108 attempts total;
- new seed distinct from `2026073101`;
- no diagnostic result pooling.

Formal qualification requires Q1/Q2 task-level reporting, at least one reliable skill-bearing gain
without reliable-task loss, no held-out collapse, complete Q3 descriptive metrics, and Q4=`not_measured`.
No candidate is promoted at qualification. Only after formal qualification passes may `minimal` be
frozen as Path-C h0 and held-in evidence be exposed to a single-surface proposer.
