# Integration Memo: The Spatiotemporal Composability Paradigm (Cordis) and the DSH Self-Harness Research Program

**Status:** formal memo v1, 2026-08-16. This document is citable from both the
Cordis paper (Y. Shi, W. Zhang, T. Cui, *A Programming Paradigm for
Spatiotemporal Composability*, Peking University & DeepSeek-AI) and
`PAPER_DRAFT_V1.md` in this repository. Every empirical claim cites frozen
records under `experiments/tool-side-harness/`.

## 1. Purpose

The Cordis paper formalizes dynamic composition through revertible effects
(temporal composability) and reactive coeffects (spatial composability), and
explicitly names **self-evolving agent harnesses** as a motivating domain
(§1.2.2) and a future validation direction (conclusion: "a compelling direction
for future validation is self-evolving agent harnesses…"). The DSH self-harness
research program in this repository is precisely such a harness: it runs
bounded self-modification loops (dynamic plugin mount/unmount, preset
authoring, single-surface evolution, Q2-gated lineage promotion) on a
Cordis-based runtime (the DeepSeek Harness). This memo records the
correspondence between the paper's formal guarantees and the program's
measured outcomes, so that (a) the Cordis paper can cite the program as
prospective validation evidence, and (b) `PAPER_DRAFT_V1.md` can anchor its
methodological boundaries in the formal vocabulary.

## 2. Concept-level correspondence

| Cordis concept | Empirical counterpart in this program | Evidence (frozen) |
|---|---|---|
| Revertible effects: every context transformation carries a tracked inverse | `cordis_stop`/`cordis_undefine` full-release discipline; D1-D5 fixture discipline; checker/reference reversibility | `protocols/FIXTURE_AUTHORING_DISCIPLINE_V1.md`; `rounds/dsh-pilot-v1..v3` |
| Reactive coeffects: dependency declarations + notifications on context change | DSH `inject`/`provide`; isolate-realm semantics; the four `standingKeyFor` rejection classes as coeffect-resolution failures | `rounds/dsh-wp4-r2` (realm-rule is causally load-bearing: removal collapses 9/9+6/6 to 3/9+3/6, restore recovers) |
| Unified context + observational equivalence (§3.3) | mount audits; the grader/checker separation enforcing behavior-equivalence under edits | `rounds/dsh-formal-baseline-v1` |
| Calculus of dynamic composition: withdrawal, iteration, asynchrony, failure | workspace-integrity hardening (run_command isolation), Gate 0 abort discipline, Q2 reliable-task-set gate | `rounds/dsh-pilot-v3/integrity-finding-2026-08-14.json`; `rounds/dsh-wp4-r2` |
| §6.1 System boundary / §6.3 sandboxing deferred to a mechanism outside the language | held-out hiding enforced at the runner layer, not the prompt; the "integrity is a runner property" conclusion | same integrity finding; `protocols/PRIOR_DISTANCE_MEASUREMENT_V1.md` B4 |
| §6.6 Nominal linking vs structural linking (interface drift, key collision) | **the prior-distance mechanism**: model priors carry nominal knowledge of interfaces; fixtures whose fix requires names are guessable (B3a/B4b), invented values are resistant | `results/prior-guessability/` calibrations; `rounds/typescript-mcp-server-generator/` |
| §6.7 Language/OS co-design | the recommendation that integrity guarantees move from convention into the runtime | `RESUME_RUNBOOK.md`; `protocols/Q3_VARIANCE_CONTROL_DESIGN.md` |

## 3. Deep overlaps (non-obvious convergences)

1. **Prior distance = the model-side face of nominal linking.** §6.6 identifies
   that key identity alone establishes a dependency link, making wrong-but-
   same-named interfaces undiagnosable. The prior-distance program measures
   the *model's* prior coverage of exactly such nominal knowledge: high
   guessability G (conventional names, tier vocabularies) annihilates harness
   effects, while invented values (`eval-pin-7f3a`) behave like key
   namespacing (§6.6's first remedy) — they eliminate collision with priors
   by construction. Evidence: `results/prior-guessability/calibration-2026-08-14.json`
   (6/8 pairs consistent), `calibration-deepseek-2026-08-14.json` (4/4),
   boundary B3a/B3b/B4 in `protocols/PRIOR_DISTANCE_MEASUREMENT_V1.md`.

2. **Fiber reversibility was empirically exercised, not just assumed.** The
   capability track's degraded-baseline intervention (remove the realm-rule
   section → collapse; condensed rewrite → full recovery, promoted as
   lineage h1 and replicated locally) is a causal test of the paper's
   spatial-composability claim at the content level: dependency-coordination
   knowledge is the component's coeffect specification, and its removal is
   the dependency-change notification the paper models. Evidence:
   `rounds/dsh-wp4-r2/results-2026-08-14.json`,
   `lineages/dsh-capability/editing-cordis-compositions/h1/record.json`.

3. **Failure modes of self-modification were catalogued, matching the
   calculus's transition cases.** Withdrawal (escape attempts, 38 confirmed
   accesses + one `$HOME`-assembly evasion), failure (Gate 0 aborts: quota,
   DeepSeek empty-tool_calls), and confluence (reliability of Q2 gates under
   interleaved edits) each have measured instances. Evidence:
   `rounds/dsh-pilot-v3/integrity-finding-2026-08-14.json`,
   `rounds/typescript-mcp-server-generator/qualification-v1/gate0-abort-2026-08-14.json`.

## 4. What this program does NOT establish (honesty clause)

- The program measures **model-visible behavior**, not the runtime's
  invariants: no theorem is tested; instead, the paper's guarantees are
  exercised as background infrastructure while the foreground measures
  content-level effects.
- Claim levels are E0–E3 and are model/endpoint/suite-bounded; none of the
  program's results should be cited as validation of the calculus itself,
  only as *prospective application evidence* in the sense of the paper's
  conclusion.

## 5. Development roadmap (citable, with entry conditions)

| # | Direction | Cost | Claim potential |
|---|---|---|---|
| M1 | ~~Add a "Correspondence with Cordis" section to `PAPER_DRAFT_V1.md`~~ **done**: `PAPER_DRAFT_V1.md` §5.5 | done | E0-methodological |
| M2 | ~~Offer the DSH program as the paper's §1.2.2 validation case study~~ **done**: `CORDIS_VALIDATION_CASE_STUDY.md` | done | prospective validation evidence for the Cordis paper |
| M3 | ~~Fiber-reversibility benchmark~~ **done** (run v1, 2026-08-16): probe `fibrev-3`/`frslot-4`; E1 tool + E2 service + E3 listener + E4 timer all zero-residue after stop/undefine (E2 direct-witnessed, E3/E4 mechanism-inferred); E5 client Slot deferred (session approval prompts disabled); 3 observability-gap findings for M6. Record: `benchmarks/fiber-reversibility/runs/m3-fiber-reversibility-v1/` | done | E2-methodological |
| M4 | ~~Structural-linking probes (§6.6)~~ **done** (18 calls): judgments ceiling (drift/collision/subtyping 3/3), structure-to-name 0, de-named realm 0 -> B5 de-naming guideline | done | E1; feeds the §6.6 open problem |
| M5 | ~~Continuous self-evolution stress test~~ **pilot done** (3 cycles, in-session): protocol `DSH_WP5_SELF_EVOLUTION_STRESS_V1`; H5.1 pass 3/3, H5.2 pass (0 errors), H5.3 RSS inconclusive (amendment A1: idle controls); record `rounds/dsh-wp5-m5-stress-v1/`. Full = 8 cycles multi-session → E3, entry documented | pilot done; Full large (multi-session) | E2 (pilot); E3 (Full) |
| M6 | ~~Runtime-guaranteed integrity per §6.7~~ **protocol + T1 done**: `DSH_WP6_INTEGRITY_TRACK_V1` — T1 instrumentation (Inspect registry probes + ps/lsof OS probes) executed inside the M5 pilot; T2 design (effect ledger + OS-level probe isolation) documented as §T2; product implementation = future work | protocol+T1 done; product-scale rest = future work | T1 E2; T2 E0-design |

## 6. Records

- Paper: `~/Downloads/A Programming Paradigm for Spatiotemporal Composability.md` (local copy; authors Yifan Shi, Wei Zhang, Tianyi Cui; Peking University & DeepSeek-AI).
- Program evidence: `experiments/tool-side-harness/` (rounds, protocols, registries, lineages, results) — see `EXPERIMENT_ARCHIVE_V1.md`.

## M4 addendum (2026-08-16, frozen before running)

Structural-linking probes (battery `prior-guessability-probes-structural-v1.json`)
operationalize the §6.6 open problem in the measurement frame: H1 structural
probes score lower than nominal probes on the same domains (de-naming removes
nominal recall); H2 the judgment probes (drift, collision, width subtyping)
reflect general structural knowledge; H3 structure-to-name inference ≈ 0
(names are not derivable from structure — validating the invented-value
strategy at a new probe family).
