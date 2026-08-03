# Alignment of the Two Tool-Side Harness Outlines

Aligned on 2026-07-30 from:

- `tool_side_harness_paper_outline.md` — paper-facing structure and contribution narrative;
- `tool_side_harness_research_outline.md` — research objectives, parameter table, and execution
  sequence.

## Shared commitments adopted

Both outlines agree on the following active commitments:

1. study Skill, MCP, and CLI guidance as tool-side harnesses rather than generic prompts;
2. model progressive structure as L0 trigger, L1 main rules, and L2 deep resources/sub-tools;
3. test four harness classes and four fitting paths;
4. represent outcomes as Q1 correctness, Q2 reliability, Q3 efficiency, and Q4 human utility;
5. generate one-surface patches rather than unrestricted rewrites in the primary method;
6. run at least three fresh repeats and apply Q2 as the hard non-regression gate;
7. promote only passing patches and retain rejected edits in a lineage/conflict record;
8. build the sample pool and calibrate baselines before broad self-evolution claims.

## Formal RQ redirection adopted on 2026-08-03

The paper-facing and research-facing outlines are now operationalized as four hierarchical
questions:

1. **RQ1 — target heterogeneity:** outcomes differ across target skills;
2. **RQ2 — category association:** promotion, stable gain, and task exchange track structural
   category;
3. **RQ3 — structural mechanisms:** rule density, reference depth, verifier observability, task
   coupling, and edit locality explain or mediate those differences;
4. **RQ4 — replication:** the pattern replicates across independent targets and later models.

This redirection changes the analysis unit from pooled tasks/attempts to the frozen target skill.
The existing four classes remain a multi-label hypothesis vocabulary, and market popularity is only
a sampling-frame variable. The full operational rules are in
`protocols/CATEGORY_CONDITIONED_RESEARCH_V1.md` and `protocols/STRUCTURAL_FEATURES_V1.md`.

## Empirical corrections applied

The outlines contain proposed directional priors, not facts already established. The repository
therefore applies these corrections:

### 1. `P_schema` is not assumed low risk

The research outline recommends prioritizing higher schema strictness. The compact GLM MCP result
supports a local benefit, but two expanded GLM evaluations show reliable-task exchange and
non-local state, prompt, pagination, and concurrency regressions. The paper must present
`P_schema -> Q` arrows as testable, context-dependent predictions rather than monotonic effects.

### 2. `P_prune` is not assumed universally beneficial

No completed experiment isolates pruning or progressive loading prospectively. Any positive Q2/Q3
arrow in the conceptual table remains a hypothesis until Path C/D experiments are run.

### 3. Q4 is not an automated verifier score

The outlines combine human usability, maintainability, and engineering value. These may require
separate instruments and raters. Until such a protocol exists, Q4 is `not_measured`; it cannot be
inferred from tokens, pass rate, or author judgment.

### 4. Four classes are a proposed taxonomy

Current evidence contains one substantial MCP-oriented target and one outcome-flat debugging
pilot. This is insufficient to claim stable class-level vulnerability distributions. Two or three
tools are enough for prototype validation, not for a universal taxonomy claim.

### 5. MCP form and Path A evidence must remain distinct

`mcp-builder` is structurally a resource/event-interaction harness, but the completed edit changes
an embedded schema contract and therefore tests Path A, not Path D. A future progressive-loading or
resource-discovery intervention is required before using it as direct Path-D evidence.

### 6. Only Q2 is the unconditional capability gate

The phrase “Q1-Q4 hard gate” is interpreted as automated collection of all available dimensions,
not as requiring every Q to improve. The cascade is lexicographic: integrity, Q2 non-regression,
Q1 classification, then separately preregistered Q3/Q4 claims.

## Unified paper-to-experiment mapping

| Paper section | Required evidence | Current state |
|---|---|---|
| taxonomy | registered multi-form sample pool and replicated failure signatures | pending |
| fitting paths | prospective bounded interventions and ablations | Path A partial; B/C/D pending |
| 4D baseline | complete Q1/Q2/Q3 record and explicit Q4 status | MCP partial/strong; other targets pending |
| progressive loop | attribution, one-surface manifest, cascade, lineage | prototype implemented; new prospective run pending |
| implementation | patch validation, runner, gate, conflict registry | runner/gate plus manifest validator implemented; hot reload pending |
| experiments | qualified Skill + deep reference + MCP + CLI samples | MCP available; remaining forms incomplete |
| discussion | task exchange, non-local effects, context cost, model/distribution boundary | strongly supported by current MCP evidence |

## Immediate priority after redirection

The next formal activity is **category-balanced sample-pool qualification and benchmark
calibration**. The next registered diagnostic target is
`addyosmani/agent-skills/debugging-and-error-recovery`; it is source-frozen but has no model
attempts yet. No cross-model experiment or Q4 study is authorized in this phase.
