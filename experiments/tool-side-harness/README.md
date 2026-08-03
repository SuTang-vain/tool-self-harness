# Tool-Side Harness Research Program

This directory is the active entry point for the category-conditioned study. The historical
`experiments/general-skills/` tree is preserved as Stage-0 evidence and runner infrastructure; it
is not discarded or relabeled as proof of the full taxonomy.

## Paper argument

The paper should progress in this order:

1. define the tool-side harness and progressive surfaces;
2. answer RQ1 by measuring target-level heterogeneity;
3. answer RQ2 with a category-balanced, target-level sample pool;
4. code RQ3 structural features before candidate outcomes are observed;
5. calibrate four-dimensional baselines and run bounded fitting-path interventions;
6. apply the Q2-first per-task cascaded gate;
7. replicate RQ2/RQ3 across independent targets, then defer RQ4 across models;
8. update lineages, conflict records, and boundary claims.

The project must not start from “Self-Harness works” and search for supporting examples. Existing
positive and negative results are retained as observations to be explained by the framework.

## Work-package status

| WP | Objective | Current status | Exit criterion |
|---|---|---|---|
| WP0 | Lock prior evidence | complete | compact, expanded, replication, and ablation results mapped without overclaiming |
| WP1 | Build category-balanced sample pool | v2 registry frozen; Wave-1 candidates shortlisted | at least 2 qualified independent targets per exploratory category |
| WP2 | Structural feature coding | rubric frozen; historical anchors coded provisionally | feature vectors frozen before new candidate outcomes |
| WP3 | Calibrate 4D baselines | Path B qualified/evolved; Path C formal stopped at per-task safety | diagnostic + formal sensitivity and Q3 coverage |
| WP4 | Run category-conditioned evolution | next target is fixture-authoring only | one frozen bounded lineage per qualified target |
| WP5 | Mechanism and replication | RQ3/RQ4 deferred until independent targets qualify | preselected ablation and category replication |
| WP6 | Evaluate utility | Q4 deferred | independent human/expert protocol |

## Frozen current interpretation

- **Supported:** Q2 hard gating detects task exchange and prevents false lineage promotion.
- **Supported locally:** a strict-schema body patch improves the compact GLM MCP suite, and a bounded
  Path-B edit produces replicated expanded local evolution on Using Git Worktrees.
- **Supported as boundary conditions:** the MCP patch is model/distribution specific; the Path-C
  canonical-ID benchmark is valid and benchmark-sensitive, but official-full loses a reliable
  held-out task despite unchanged aggregate and reliable-task counts.
- **Stopped by protocol:** Path C does not freeze h0 or generate a candidate because per-task held-out
  safety fails (`secret-fallback-logging` 3/3 minimal vs 2/3 official-full).
- **Debugging diagnostic boundary:** the new `debugging-and-error-recovery` suite is process-sensitive
  (official-full tests before first edit in 9/9 attempts versus 7/9 minimal and 6/9 no-skill), but
  minimal reaches the 6/6 held-in ceiling; it stops before formal baseline and candidate generation.
- **Not supported yet:** a universal four-class taxonomy, universal fitting paths, general
  Self-Harness improvement, Path C/D effectiveness, cross-model generality, or human utility.

## Immediate research sequence

### Phase 1 — Sample-pool qualification

1. Freeze inclusion and labeling rules from `protocols/TAXONOMY_AND_4D_V1.md`.
2. Retain `mcp-builder` as the resource/event and schema-contract anchor, with its mixed Path-A/Path-D
   nature explicitly labeled.
3. Redesign the new `debugging-and-error-recovery` suite with harder held-in root-cause fixtures;
   keep the process-sensitive diagnostic as a boundary record, not Self-Harness evidence.
4. Add a real CLI workflow target with state transitions and recovery semantics.
5. Add a knowledge-rule Skill with deep references and measurable context-loading behavior.

### Phase 2 — 4D baseline calibration

For each target, compare no-harness, minimal, and official/full variants with at least three fresh
repeats on a frozen pilot. A target qualifies only when:

- its intended failure signatures occur at a measurable but non-saturated rate;
- hidden verifiers discriminate the relevant behavior;
- at least one harness variant moves Q1, Q2, or a preregistered behavioral metric;
- Q3 usage coverage is reported;
- held-out tasks remain hidden from proposal generation.

Q4 is `not_measured`, not zero, until a human/expert protocol exists.

### Phase 3 — Single-surface path experiments

For every qualified target:

1. attribute held-in failures to one progressive level and fitting path;
2. generate 2-3 candidates, each bound to exactly one registered surface;
3. freeze candidate manifests before evaluation;
4. run the complete suite with at least three fresh repeats;
5. apply Q2 before interpreting Q1/Q3/Q4;
6. promote only a passing candidate and record every rejection in the conflict matrix.

### Phase 4 — Ablations and replication

Run preregistered comparisons of:

- aggregate gate vs Q2 hard gate;
- single-surface vs unrestricted multi-surface edits;
- direct instruction vs checklist vs frontmatter vs deep-reference placement;
- full context vs progressive/deferred loading;
- lineage/conflict-informed proposal vs proposal without that history.

Cross-model or large-suite expansion follows only after a local path effect is repeatable. Negative
replication remains a first-class result.

## Formal RQ framework

- `protocols/CATEGORY_CONDITIONED_RESEARCH_V1.md` — RQ1-RQ4, target-level estimands, staged gates,
  claim levels, and confound controls.
- `protocols/STRUCTURAL_FEATURES_V1.md` — preregistered multi-label structural coding and task-
  exchange metrics.
- `registries/sample-pool-v2.json` — category-balanced target registry; v1 remains historical.
- `registries/market-skill-inventory-v1.json` — popularity/license sampling frame only.
- `rounds/target-selection-v2/protocol.md` — next debugging diagnostic design; no attempts run.

## Files

- `../../RESEARCH_CHARTER.md`: paper-level thesis, questions, outcomes, and claim levels.
- `OUTLINE_ALIGNMENT.md`: reconciliation of both source outlines and empirical corrections.
- `protocols/TAXONOMY_AND_4D_V1.md`: sample selection, labeling, and baseline protocol.
- `protocols/PROGRESSIVE_EVOLUTION_V1.md`: single-surface proposal, gate, and lineage protocol.
- `registries/sample-pool-v1.json`: registered systems and qualification status.
- `registries/evidence-map-v1.json`: mapping from existing results to claims and limitations.
- `registries/attention-conflict-matrix-v1.json`: rejected edits and observed non-local effects.

## Near-term stop/go rule

Do not spend cross-model quota on a new target until its baseline is benchmark-sensitive. Do not
promote a patch until Q2 passes. Do not claim a fitting path beyond the target class represented by
the frozen sample pool.
