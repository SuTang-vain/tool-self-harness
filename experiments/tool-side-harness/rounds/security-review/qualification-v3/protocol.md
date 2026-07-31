# Security Review Path-C Qualification v3

Preregistered on 2026-07-31 after explicit user confirmation and before fixture evaluation or model attempts.
Stage: diagnostic qualification only.

## Research role

- target: `github/awesome-copilot/security-review`
- harness class: knowledge-rule / policy
- fitting path: Path C — density control and pruning
- model: GLM-5.2 via Volcengine Ark `coding/v3`, temperature 0
- variants: `no-skill`, `minimal`, `official-full`
- Q4: `not_measured`
- no proposer or candidate generation is permitted in this stage

## Diagnostic design

- 6 held-in + 3 held-out tasks
- 1 fresh repeat per task and variant
- 27 total attempts
- task-order seed: `2026073103`
- run id: `security-review-glm-qualification-diagnostic-v3`
- no pooling with qualification-v1 or qualification-v2
- provider/API/infrastructure failures abort instead of counting as task failures

Each task repository contains 8–12 relevant or decoy files, 2–3 true findings, and 3–5 protected
decoys. Prompts use a generic comprehensive security-review request and do not reveal vulnerability
categories, key files, expected finding count, protected decoys, or reference-sensitive mechanisms.

Frozen task families:

Held-in:

1. tenant authorization and mass-assignment trust boundaries;
2. redirect and outbound-fetch policy chains;
3. archive extraction, filesystem boundaries, and process execution;
4. framework-specific template rendering and output encoding;
5. broad multi-finding service review with protected decoys;
6. dependency and deployment-configuration semantics.

Held-out:

7. signed job-envelope deserialization order;
8. OAuth redirect registration and remote-key retrieval policy;
9. secret fallback, logging, and test-fixture distinction.

## Ground truth and metrics

The hidden expected record defines canonical findings, accepted aliases, severity floors, required
files, evidence markers, remediation markers, required scanned files, and protected decoys.

For every attempt report:

- binary task pass;
- finding precision and recall;
- false-positive count;
- evidence completeness;
- remediation completeness;
- required-files scanned ratio;
- skill and deep-reference usage;
- tokens, tool calls, retries, and elapsed time.

Task pass requires exact canonical finding precision and recall, complete evidence and remediation,
complete required-file scanning, no duplicate findings, and no audited-source modification. Finding
order and surface wording are not scored.

## Gate 0: verifier integrity

Before model evaluation:

- every untouched fixture fails;
- every external reference report passes;
- each task has 8–12 input files, 2–3 findings, and 3–5 protected decoys;
- canonical alias, precision/recall, safe-decoy, evidence, remediation, and scanned-file tests pass;
- task, verifier, and reference hashes are frozen.

Any alias, fixture, leakage, scoring, or infrastructure defect invalidates the diagnostic.

## Diagnostic stop/go

Advance to a separately preregistered formal stage only if all conditions hold:

1. Gate 0 passes;
2. at least two tasks show genuine variant outcome separation, not alias-only differences;
3. `minimal` retains at least one held-in failure and is not at ceiling;
4. no variant universally fails;
5. `official-full` demonstrates measurable deep-reference sensitivity: it reads deep references and
   achieves at least one reference-sensitive task outcome or preregistered quality-metric gain over
   `minimal`, without an offsetting task-pass collapse;
6. false-positive and evidence-quality behavior are reportable at task level.

If these conditions fail, stop and redesign. Do not run formal repeats and do not freeze a Path-C h0.
