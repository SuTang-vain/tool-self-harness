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

What this supports for the paper: prospective, application-level evidence that
a Cordis-based harness sustains bounded self-modification with observable,
revertible, reproducible recovery — the kind of validation the conclusion
calls for, at the content rather than the invariant level.

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
namespacing and preserve measurability. The model-facing counterpart of
nominal linking is thus measurable and was calibrated on two models (6/8 and
4/4 consistent pairs). Evidence: `results/prior-guessability/`,
`protocols/PRIOR_DISTANCE_MEASUREMENT_V1.md`.

## Honesty clause

None of the above validates the calculus itself — the program measures
model-visible behavior, and its runtime invariants are exercised as
infrastructure, not tested as theorems. Cite as prospective application
evidence only.
