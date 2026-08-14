# Fixture-Authoring Discipline v1

Status: methodological protocol established 2026-08-14, grounded in the DSH pilot rounds
(`rounds/dsh-pilot-v1`, `rounds/dsh-pilot-v2`) and frozen before any v3 fixture pass.

Scope: rules for authoring task fixtures whose pass probability must be movable by harness
content. They apply to every target in the sample pool; deviations must be preregistered
with a reason.

## D1 — The task text must not contain the fix

A task whose instructions state the exact repair (row names, config fields, expected values)
measures instruction-following, not harness use. Pilot v1 demonstrated the failure: the
headless suite went 9/9 + 6/6 in **every** variant because `task.md` spelled out the fix.

- State the goal behaviorally ("the preset must pass the contract check").
- Any required knowledge must live in the harness content (skill body / reference
  composition), not in the task text.
- Exception: a task may name the failure **class** the agent must diagnose, but never the
  repair it must perform.

## D2 — The task must direct harness consultation

Harness content is consumed only when the task explicitly directs it. Pilot v2 measured
`loaded_skill_rate = 0.0` for headless official-full when the task did not mention the
harness; adding a one-line pointer ("consult the harness documentation available to you
before editing") raised it to 0.8 and recovered held-in from 3/9 to 8/9.

- Every task carries an explicit `list_skills` / `load_skill` pointer.
- The pointer must be variant-neutral: it works for official-full (body available), degrades
  gracefully for minimal (condensed body or none), and points at nothing for no-harness.

## D3 — The agent-facing checker must not create a feedback trap

An agent-facing contract checker that accepts any value within a bound while the hidden
grader demands the exact reference value traps the model: it lands on any in-bounds value
and stops. Pilot v2 observed hp-03 stuck at `thresholdRatio: 0.9` (in bounds, grader
expects 0.8) in all three attempts.

- Checkers report violations without naming fixes (their v2 messages follow this).
- When the grader demands an exact reference value, the checker must direct restoration
  to the harness ("restore the reference value documented in the harness"), never print
  the value itself.
- Prefer corruption shapes where a faithful mount/schema violation is the observable
  failure (out-of-schema values, unresolvable packages, cross-row registry mismatches,
  realm publication), so the checker reports what a real mount would report.

## D4 — A discriminating task needs a measurable, non-saturated dose-response

A task is eligible for the formal baseline only when at least one variant pair moves its
pass rate and no variant hits floor/ceiling saturation for it. The working anchors are:

- `ec-01-realm-missing` (multi-step realm restructure): 3/3 → 1/3 → 0/3.
- `ec-03-invalid-config` (required-field value lives only in the body): 3/3 → 0/3 → 0/3.
- `hp-01-add-row` (whole-row reconstruction from the reference): 2/3 → 0/3 → 0/3.

Tasks whose fix is generically inferable (metadata rewriting, disable-by-convention,
single-value schema bounds) ceiling across all variants; prefer them as held-out
generalization probes only after they demonstrably discriminate, or drop them.

## Evidence

- `rounds/dsh-pilot-v1/pilot-results-2026-08-14.json` — over-specification ceiling (D1).
- `rounds/dsh-pilot-v2/pilot-results-2026-08-14.json` — consultation gating, feedback trap,
  held-in discrimination (D2–D4).
- `registries/evidence-map-v2.json` — entries `dsh-pilot-v1-fixture-overspecification`,
  `dsh-pilot-v2-harness-consultation-gating`, `dsh-pilot-v2-held-in-discrimination`,
  `dsh-pilot-v2-checker-feedback-trap`.

## D5 — Grader assertions may only demand what the harness teaches (added 2026-08-14)

The hidden grader must never require synthetic vocabulary the harness content does not
define. R3 pilot v1 demonstrated the failure: the wcag audit grader demanded literal
keys (`img-missing-alt`) the skill never teaches, so official-full went 0/3 on every
audit task while fix tasks passed 3/3. Graders for report-style tasks must match
content semantically (regex per finding + tier-exclusive placement) so that the
knowledge being tested is exactly what L1/L2 provide.
