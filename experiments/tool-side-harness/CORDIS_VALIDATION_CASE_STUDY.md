# Cordis Validation Case Study: The DSH Self-Harness Program

**Purpose.** Material for the conclusion of *A Programming Paradigm for
Spatiotemporal Composability* (§1.2.2 "Self-Evolving Agent Harnesses" and the
future-validation paragraph). This note states what the program's frozen
records can support, in the paper's own two guarantee dimensions, without
overclaiming (per `INTEGRATION_MEMO_CORDIS.md` §4).

## Temporal dimension: complete recovery under rapid component replacement

The program repeatedly mounts, edits, and removes harness components
(dynamic plugins via `cordis_define/run/stop/undefine`, preset compositions
via single-surface patches) while a live runtime serves the research loop
itself.

- **Measured outcome 1 (recovery is routine).** 65+ commits of
  mount/edit/unmount cycles with zero residual-effect incidents after the
  runner hardening; the two escape incidents (38 reference-file accesses;
  one `$HOME`-assembly evasion) were *failed withdrawals at the boundary
  between the harness and its host filesystem*, not leaks of the component
  runtime itself. Evidence: `rounds/dsh-pilot-v3/integrity-finding-2026-08-14.json`.
- **Measured outcome 2 (content-level reversibility).** The degraded-baseline
  design applies and reverts a content transformation of a component: removing
  the realm-rule section collapses held-in/held-out from 9/9 + 6/6 to 3/9 + 3/6;
  the verbatim restore and a −44% condensed rewrite both recover 9/9 + 6/6 with
  5/5 reliable tasks, and the recovery replicates in an independent run.
  Evidence: `rounds/dsh-wp4-r2/`, `lineages/dsh-capability/editing-cordis-compositions/h1/`.
- **Measured outcome 5 (runtime-level reversibility, M3).** On the live DSH
  process itself, a dynamic Plugin registering four host effect classes (model
  tool, provided service, `tools/change` listener, 500 ms timer) was mounted,
  snapshotted, updated, stopped and undefined: tool presence reversed exactly
  (36 → 35), the plugin registry returned to `[]`, and an unrelated session's
  Slot occupant was untouched throughout. A fifth class (client Slot) was
  preregistered but deferred by a session policy (approval prompts disabled).
  Evidence: `benchmarks/fiber-reversibility/runs/m3-fiber-reversibility-v1/`.
- **Measured outcome 6 (repeated-cycle stress, M5).** Three full
  define→run→update→stop→undefine cycles across six host plugins (27 lifecycle
  operations, 0 errors): every cycle-end registry snapshot matched baseline
  exactly (H5.1 3/3), with zero error accumulation (H5.2). OS probes showed flat
  fd/thread counts; RSS growth was ambient-confounded and registered as
  inconclusive with an idle-control amendment for the eight-cycle full run.
  Evidence: `rounds/dsh-wp5-m5-stress-v1/`, `protocols/DSH_WP5_SELF_EVOLUTION_STRESS_V1.md`.

What this supports for the paper: prospective, application-level evidence that
a Cordis-based harness sustains bounded self-modification with observable,
revertible, reproducible recovery — the kind of validation the conclusion
calls for, at the content rather than the invariant level. Outcomes 5–6
extend this from the content level to the runtime registry level: the
revertibility guarantee is now directly observed on the live process, and the
observability gaps found along the way (static service catalog; no post-mortem
listener/timer channel) are the recorded entry conditions for the M6-T2
effect-ledger design (`protocols/DSH_WP6_INTEGRITY_TRACK_V1.md`).

## Spatial dimension: dependency coordination under frequent topological change

The program edits exactly the dependency-declaration content of presets
(`inject`/`provide` rows, isolate realms) and measures behavior before and
after each edit.

- **Measured outcome 3 (the coordination spec is load-bearing).** The
  realm-rule section is causally load-bearing: its removal collapses the
  tasks whose fixes require dependency coordination (ec-01/03/06), while
  tasks whose fixes do not consume it survive. Evidence: R2 results (above).
- **Measured outcome 4 (wrong coordination shapes are detectable and
  attributable).** Four rejection classes of the mount audit (loose service
  publisher, consumer outside the provider realm, shared realm label,
  missing required config) serve as the program's fixture anchors, and the
  dose-response gradients (3/3→0/3→0/3 across full/minimal/no-harness)
  isolate exactly the coordination knowledge. Evidence:
  `rounds/dsh-formal-baseline-v1/`.

What this supports for the paper: the coeffect-style dependency declarations
of a harness composition are the empirically active part of its content —
removing or condensing them produces the predicted behavior change, matching
the paper's model in which a component's specification, not its prose, is
what coordination reacts to.

## The nominal-linking observation (§6.6)

A side finding worth citing in §6.6's discussion: model-authored edits are
themselves consumers of nominal links. The prior-distance battery measures
how much interface knowledge a model's priors already contain; conventional
names (package/class/tier vocabularies) make fixes guessable without the
harness (boundaries B3a/B4b), while invented values behave like key
namespacing and preserve measurability. The structural-linking probes (M4)
sharpen this: judgment items (drift/collision/width subtyping) score 3/3 —
structural knowledge is general — while structure-to-name and de-named-realm
items score 0/3, i.e. names are the leak channel, structure alone does not
restore guessability (boundary B5). The model-facing counterpart of
nominal linking is thus measurable and was calibrated on two models (6/8 and
4/4 consistent pairs). Evidence: `results/prior-guessability/`,
`registries/prior-guessability-probes-structural-v1.json`,
`protocols/PRIOR_DISTANCE_MEASUREMENT_V1.md`.

## Honesty clause

None of the above validates the calculus itself — the program measures
model-visible behavior, and its runtime invariants are exercised as
infrastructure, not tested as theorems. Cite as prospective application
evidence only.
