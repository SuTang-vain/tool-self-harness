# Progressive Single-Surface Evolution Protocol v1

Frozen: 2026-07-30. This protocol extends, rather than replaces, the historical
`experiments/general-skills/protocols/FINAL_ACCEPTANCE.md` Q2 rule.

## 1. Preconditions

- The target is `qualified` under `TAXONOMY_AND_4D_V1.md`.
- Baseline lineage, task-tree hash, verifier hash, model configuration, repeats, and seed are frozen.
- Progressive surfaces are registered before failure mining.
- Held-out tasks, traces, labels, and failure summaries are unavailable to the proposer.

## 2. Attribution record

Each proposal must bind observed held-in evidence to:

- one failure signature;
- one progressive level (`L0`, `L1`, or `L2`);
- one registered `surface_id`;
- one fitting path (`A`-`D`);
- one parameter (`P_schema`, `P_order`, `P_density`, or `P_prune`);
- an expected Q1-Q4 delta and explicit regression mechanism.

Attribution is a hypothesis. Candidate success does not by itself prove causal correctness; path
claims require ablation or replication.

## 3. Patch constraints

Primary candidates must:

- modify exactly one registered surface;
- stay inside one Markdown heading block, one schema node, one prompt block, one CLI help/rule
  block, or one deep-reference unit;
- preserve all unregistered files byte-for-byte;
- include before/after hashes and a machine-readable patch record;
- be frozen before evaluation.

Multi-surface changes are allowed only as separately labeled ablations. They cannot be compared to
bounded candidates as if edit scope were equal.

## 4. Evaluation

- Evaluate baseline and candidate on the complete frozen suite.
- Use at least 3 fresh repeats per task; use more for diagnostic instability studies.
- Record Q1-Q3 for every fresh attempt and Q4 only under a separate protocol.
- Report task-family outcomes as well as overall aggregates.
- Never pool historical attempts into a formal candidate comparison.

## 5. Cascaded decision

1. **Gate 0:** reject/abort protocol, infrastructure, leakage, or critical-integrity violations.
2. **Q2 gate:** reject any reliable-task loss, split aggregate decrease, or critical regression.
3. **Q1 classification:** require at least one new reliable task for capability-lineage promotion.
4. **Q3 classification:** report efficiency only after Q1/Q2 preservation; use preregistered
   thresholds for an efficiency claim.
5. **Q4 classification:** report only from an independent human/expert study.

A candidate that improves an aggregate while exchanging reliable tasks is recorded as a task
exchange. It is never promoted.

## 6. Lineage and conflict update

For every candidate, record:

- parent lineage and candidate hash;
- decision at each gate;
- reliable tasks gained and lost;
- task families helped and harmed;
- observed token/tool/latency movement;
- suspected attention or instruction conflict;
- whether evidence is prospective, diagnostic, or post hoc.

Only a candidate passing the preregistered lineage track becomes the next parent. Rejected patches
remain available as negative mechanism evidence but cannot be silently recombined.

## 7. Required ablations for a path claim

At least one of the following must accompany a fitting-path claim:

- surface placement: L0 vs L1 vs L2;
- direct rule vs checklist/process reminder;
- local rule vs unrestricted rewrite;
- full context vs progressive/deferred loading;
- bounded patch vs combination patch.

The ablation must be selected before its evaluation data are observed to support causal language.
Post hoc diagnostics must be labeled as such.
