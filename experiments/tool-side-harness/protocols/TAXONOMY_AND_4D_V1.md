# Taxonomy and 4D Baseline Protocol v1

Frozen: 2026-07-30. Changes require a new protocol version.

## 1. Purpose

This protocol determines whether a system can enter the tool-side harness study and how its
baseline is represented. It prevents post hoc assignment of a successful edit to a convenient
class or fitting path.

## 2. Unit of analysis

A registered system consists of:

- one tool-side harness and its progressive surfaces;
- a frozen task suite with held-in and held-out partitions;
- hidden verifiers and critical-failure definitions;
- one primary harness class and optional secondary class;
- one intended failure-signature family;
- no-harness, minimal, and official/full baselines when meaningful.

## 3. Taxonomy labels

Primary class must be one of:

- `atomic-validation`
- `multi-step-workflow`
- `knowledge-rule-policy`
- `resource-event-interaction`

Primary fitting path must be one of:

- `A-interface-constraint`
- `B-state-recovery`
- `C-density-pruning`
- `D-progressive-exposure`

A system may have secondary labels, but the primary experiment must preregister one class/path
prediction. Mixed systems are not used as evidence that all of their labels are validated.

## 4. Progressive surface registry

Every target must enumerate surfaces before proposal generation:

| Level | Surface examples | Allowed primary edits |
|---|---|---|
| L0 | frontmatter, trigger description, tool summary | trigger wording, scope clarification |
| L1 | SKILL body, prompt body, schema guidance, command rules | one heading/block rewrite or one bounded instruction |
| L2 | reference file, script, template, resource, sub-tool help | one referenced unit or loading rule |

A surface has a stable ID, file path, level, content hash, allowed edit kinds, and ownership scope.

## 5. Baseline design

Pilot minimum:

- complete frozen held-in and held-out suite;
- at least 3 fresh repeats per task for formal qualification;
- fresh workspace and model call per attempt;
- deterministic task-order seed recorded;
- no cache or checkpoint pooling;
- provider/infrastructure failures aborted, not scored;
- held-out evidence hidden from any proposer or weakness miner.

Run no-harness, minimal, and official/full variants when available. If a baseline is structurally
inapplicable, record the reason rather than inventing an empty comparison.

## 6. 4D record

### Q1 Correctness

Report attempts passed/attempted by split, task, and family. Store critical verifier failures
separately.

### Q2 Reliability

A task is reliable only if all formal repeats pass. Report reliable task sets, gains/losses, task
exchange, and repeat variance.

### Q3 Efficiency

Report usage coverage, tokens, API/tool calls, retries, latency, tokens per success, and tokens per
reliable task. If usage coverage is incomplete, mark affected comparisons as descriptive.

### Q4 Human utility

Allowed values are a preregistered human/expert result or `not_measured`. Automated verifier
success cannot populate Q4.

## 7. Qualification gate

A target is `qualified` only when:

1. the task suite has frozen hashes and hidden verifiers;
2. its primary failure signature occurs without total floor or ceiling saturation;
3. at least one baseline contrast moves the intended outcome or behavioral measure;
4. task-family composition and provisional difficulty are audited;
5. Q3 instrumentation coverage is known;
6. the target's claimed class/path is fixed before evolution candidates are generated.

An outcome-flat target remains `needs-redesign`. It cannot be used to conclude that Self-Harness or
a fitting path failed.

## 8. Taxonomy claim rule

One target can establish only a local observation. A class/path claim requires at least two
qualified implementations in that class, at least one independent replication, reported
counterexamples, and no relabeling after seeing candidate outcomes.
