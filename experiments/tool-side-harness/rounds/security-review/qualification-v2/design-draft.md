# Security Review Path-C Qualification v2 — Design Draft

Status: DRAFT — not frozen, not evaluated
Date: 2026-07-31
Model: GLM-5.2 via Volcengine Ark `coding/v3`

## Research question

Can a bounded knowledge-rule / policy skill change the model's security-review decisions on tasks
that require both vulnerability detection and false-positive pruning, without turning the benchmark
into an outcome-flat ceiling?

This is benchmark qualification, not Self-Harness evolution. No proposer or candidate is run before
qualification passes.

## Default suite proposal

Use a new synthetic fixture suite under a permissively licensed benchmark container. Keep the
upstream `github/awesome-copilot/security-review` skill as the official-full comparator, but do not
expose held-out task names, traces, expected findings, or reference content to any proposer.

Diagnostic pilot: 6 held-in + 3 held-out, one fresh repeat, 27 attempts across no-skill/minimal/official-full.
Formal qualification: 8 held-in + 4 held-out, three fresh repeats, 108 attempts across the same variants.

Task families:

1. cross-file taint and sink tracing;
2. effective validation / authorization versus pattern-only false positives;
3. multi-finding prioritization and evidence completeness;
4. framework or configuration-specific policy checks that benefit from deep references.

The intended outcome is non-ceiling, not universal failure: at least some tasks should be solved by
all variants, some should separate skill-bearing variants, and at least one held-in task should
remain a reliable failure for minimal before any evolution is considered.

## Verifier design

Use a canonical vulnerability ID with an explicit alias table, rather than exact surface category
strings. For each expected finding verify:

- canonical category / accepted aliases;
- minimum severity;
- required source file(s);
- concrete evidence with data-flow or authorization details;
- concrete remediation;
- complete scanned-file set;
- no audited-source modification.

For safe-decoy tasks verify both an empty finding set and the reviewed-file scope. The verifier must
never require a particular wording, and all alias mappings must remain hidden from the model.

Before model evaluation:

- every untouched fixture must fail;
- every external reference repair must pass;
- canonical alias tests must pass;
- verifier must be tested against equivalent report formatting and command forms;
- task tree, verifier, and reference hashes must be frozen.

## Stop/go gates

### Diagnostic gate

Advance only if:

- no verifier or fixture integrity defect is found;
- at least two tasks show a meaningful outcome or process separation between variants;
- no-skill, minimal, and official-full are not all outcome-flat;
- at least one task remains unsolved by minimal, preserving candidate headroom.

Stop and redesign if all variants are at ceiling, all variants fail, or only category aliases create
apparent differences.

### Formal qualification gate

Report Q1 correctness and Q2 reliability separately. A suite is qualified only if:

- at least one skill-bearing variant has a reliable held-in gain over no-skill or minimal;
- the gain is not exchanged for reliable-task loss;
- held-out results do not collapse or regress;
- per-task false-positive behavior is reportable;
- Q3 is complete and descriptive;
- Q4 is `not_measured`.

Do not promote any candidate at this stage. If qualification passes, freeze minimal as Path-C h0 and
only then expose held-in evidence to a single-surface proposer.

## Open decisions requiring confirmation

1. Approve the default 6+3 diagnostic followed by 8+4 formal design?
2. Approve canonical IDs plus hidden alias mapping and explicit false-positive checks?
3. Keep official-full as a static comparator, minimal as future h0, GLM-only, and Q4 not measured?
4. Approve the four task families above, with exact task identities authored only after design freeze?
