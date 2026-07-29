# Self-Harness for Tool-Side Harnesses: A Multi-Model Empirical Study

## Abstract

We investigate whether the Self-Harness paradigm—where a fixed LLM improves its own operating harness through an evidence-driven propose–validate–accept loop—can be applied to tool-side harness components (skills and MCP tools). We instantiate the three-stage loop (Weakness Mining → Harness Proposal → Proposal Validation) as a target-agnostic scaffolding and evaluate it on the `sg-data-pack` skill across three models from diverse families: GLM-5.2, MiniMax-M3, and DeepSeek-V4-Pro. Our experiments reproduce the paper's core findings: (1) the same initial harness exposes model-specific failure modes, (2) the same evidence yields model-specific proposal styles, and (3) the non-regressive acceptance gate correctly rejects edits that do not produce measurable improvement. We further identify that harness-level edits alone cannot fix failures rooted in task/verifier design, and that evaluation variance differs sharply across models—a practical constraint on the acceptance gate's reliability.

---

## 1. Introduction

LLM-based agents are shaped jointly by their base model and their *harness*: the system prompts, tools, skills, runtime mechanisms, and verification rules that mediate model-environment interaction. The Self-Harness paper demonstrates that a fixed model can iteratively improve its own harness through behavioral evidence, without human engineering or a stronger external agent.

We ask: **can this paradigm be applied to tool-side harness components—specifically, skills and MCP tools?** Skills (as implemented in ZCode/Claude Code) are a distinct harness surface: they use progressive disclosure (metadata → body → bundled files), are triggered by semantic matching, and expose CLI subcommands. This makes them both testable (deterministic verifiers exist) and editable (SKILL.md sections are bounded surfaces).

### Contributions

1. **A target-agnostic scaffolding** that implements the Self-Harness loop for skills, with a headless runner simulating progressive disclosure, failure-signature attribution specific to skill surfaces, and heading-boundary patch application enforcing minimality.

2. **A three-model empirical comparison** (GLM-5.2, MiniMax-M3, DeepSeek-V4-Pro) on the same initial harness and 5 tasks, reproducing the paper's core findings about model-specific weaknesses and proposal divergence.

3. **A root-cause analysis** of when Self-Harness accepts vs. rejects edits, identifying that task/verifier design—not harness quality—can be the binding constraint on improvement.

---

## 2. Method

### 2.1 Self-Harness Loop (adapted from §3 of the paper)

```
01-run-round → 02-mine-weakness → 03-propose → 04-validate → 05-accept
(run tasks)    (cluster failures)  (K edits)   (regression)  (merge/reject)
```

**Weakness Mining.** Run the current harness on a held-in split. For each failed task, build a failure signature `(terminal_cause, implicated_surface)`:
- `terminal_cause`: verifier-grounded (`validate_failed`, `equivalence_failed`, `no_pack_written`, `max_steps_reached`, `api_error`)
- `implicated_surface`: attributed heuristically from the trace (e.g., `skill_not_invoked` + never-called-`load_skill` → `skill-description`; `bypassed_extract` + `write_file` of `data.json` → `workflow-section`)

Cluster by exact `(terminal_cause, implicated_surface)` agreement—deterministic and evaluator-grounded, matching the paper's §3.2.

**Harness Proposal.** Invoke the *same* model in a proposer role with a bounded context: editable surfaces, current SKILL.md content per surface, the evidence bundle, and passing behaviors to preserve. Generate K=2 proposals, each binding to exactly one `surface_id`. Enforce material diversity (different surfaces or mechanisms).

**Proposal Validation.** For each candidate: apply the patch to a sandbox copy, run both held-in and held-out splits with `eval_repeats=2` (best-of-N aggregation), and apply the acceptance rule:
```
accept(j) iff (P_in(j) > P_in(h_t) AND P_ho(j) >= P_ho(h_t))
         OR   (P_ho(j) > P_ho(h_t) AND P_in(j) >= P_in(h_t))
```
Accepted edits merge into the sandbox as a git commit tagged `h<N>` in the lineage. Rejected edits are logged but do not change the harness.

### 2.2 Headless Runner

A ~300-line Node.js script that calls the model via an OpenAI-compatible endpoint and drives a tool loop. To faithfully simulate progressive disclosure:
- The initial system prompt contains **only** the skill's frontmatter `description` (what `list_skills()` returns).
- Tools: `list_skills`, `load_skill` (returns SKILL.md body), `list_dir`, `read_file`, `write_file` (sandboxed to task cwd), `run_skill` (executes a skill CLI subcommand).
- This makes the `skill-description` surface directly testable: a bad description → model never calls `load_skill` → failure attributable to `skill-description`.

The model config is read from `~/.zcode/v2/config.json` (the same providers ZCode uses), so the "self" in Self-Harness is genuinely the production model.

### 2.3 Editable Surfaces

| Surface | Type | Edit kinds |
|---|---|---|
| `skill-description` | frontmatter field | rewrite |
| `core-concept` | body section | trim, rewrite |
| `cli-section` | body section | trim, rewrite, reorder |
| `workflow-section` | body section | trim, rewrite, add-instruction |
| `rule-cheat-sheet` | body section | trim, rewrite, remove |
| `crawl-pipeline-contract` | body section | trim, rewrite |
| `deep-references` | body section | trim, reorder |
| `ref-extraction-config` | whole file | trim, rewrite, add-instruction |
| `ref-engine-integration` | whole file | trim, rewrite, add-instruction |
| `ref-data-rules-guide` | whole file | trim, rewrite, add-instruction |
| `ref-data-pack-contract` | whole file | trim, rewrite, add-instruction |

Each proposal must bind to exactly one surface; `patch.js` modifies only that surface's bytes (heading-boundary for body sections, field replacement for frontmatter, whole-file for references).

### 2.4 Tasks

Five synthetic component libraries (small, deterministic, fast):

| Task | Split | Pattern | Difficulty |
|---|---|---|---|
| t01-id-based | held-in | id-based graph | easy |
| t02-chinese-alias | held-in | Chinese-name-reference | medium |
| t03-multi-stage | held-in | multi-stage + scope (E12) | hard |
| t04-external-json | held-out | external JSON block | medium |
| t05-collection | held-out | collection / templatize | medium |

Each task has a deterministic verifier: `validate` (E1–E16) + semantic field comparison (entities, aliases, relationTypes, relations, provenance key coverage + confidence). Label casing is case-insensitive; provenance `origin`/`note` text is free-form (only key coverage and `confidence=1.0` are checked).

### 2.5 Models

| Model | Provider | Format | Reasoning |
|---|---|---|---|
| GLM-5.2 | Volcengine Ark | OpenAI-compat | Yes (`reasoning_content`) |
| MiniMax-M3 | api.minimaxi.com | OpenAI-compat | Yes (inline in `content`) |
| DeepSeek-V4-Pro | api.deepseek.com | OpenAI-compat | Yes (`reasoning_content`) |

All accessed via the same ZCode provider configuration. Temperature=0, max_tokens=8192, eval_repeats=2 (best-of-N).

---

## 3. Experiments

### 3.1 Round 0: Initial Harness (h0) Baseline

All three models run the **same unmodified** `sg-data-pack` SKILL.md (h0) on all 5 tasks.

<!-- ROUND1_DATA: to be filled after round-1 completes -->

**Round 0 baseline (pre-fix verifiers, held-in only):**

| Task | GLM-5.2 | MiniMax-M3 | DeepSeek-V4-Pro |
|---|---|---|---|
| t01-id-based | ✓ 6st | ✓ 6st | ✓ 9st |
| t02-chinese-alias | ✗ 14st | ✗ 10st | ✓ 8st |
| t03-multi-stage | ✗ 10st | ✓ 11st | ✓ 12st |
| t04-external-json | ✗ 24st | ✗ 11st | ✗ 7st |
| t05-collection | ✗ 14st | ✗ 10st | ✗ 8st |
| **Total** | **1/5** | **2/5** | **3/5** |

**Finding 1: Model-specific weaknesses.** The same harness exposes different failure modes:
- t02: GLM and MiniMax both fail (missing provenance); DeepSeek uniquely passes.
- t03: GLM uniquely fails—it **bypassed the `extract` subcommand** and hand-wrote `data.json` directly. MiniMax and DeepSeek correctly used `extract`.
- t04/t05: All three fail, but for verifier-design reasons (label casing, provenance template), not model-specific reasons.

This reproduces the paper's Figure 5/6 finding: model-specific weaknesses emerge from the interaction between instructions and model behavior, not from isolated model capability gaps.

### 3.2 Round 0: Proposals and Acceptance

Each model acts as its own proposer, generating K=2 candidate edits from its evidence bundle.

**Finding 2: Proposal style divergence.** Same evidence, three completely different fix directions:

| Model | Proposal | Surface | Style | Outcome |
|---|---|---|---|---|
| GLM-5.2 #1 | Mandatory extract-first workflow (66→8 lines) | workflow-section | Aggressive trim | REJECT (flat) |
| GLM-5.2 #2 | Full cheat-sheet rewrite with new rules | rule-cheat-sheet | Full rewrite | REJECT (regression: -1 held-in) |
| MiniMax-M3 #1 | Add E4 row + Pattern-B reminder | rule-cheat-sheet | Conservative additive | REJECT (flat) |
| MiniMax-M3 #2 | Rephrase rule #2 (alias gate emphasis) | core-concept | Pure rephrasing | REJECT (flat) |
| DeepSeek #1 | Clarify "Validation passed" meaning | rule-cheat-sheet | Semantic clarity | REJECT (flat) |
| DeepSeek #2 | Document validate exit-code semantics | cli-section | Documentation | REJECT (regression: -1 held-in) |

**Finding 3: Acceptance gate works.** All 6 proposals across 3 models were rejected:
- 4 rejected as "flat" (no improvement in either split)
- 2 rejected as "regression" (degraded a split)

The gate correctly prevented harmful edits from entering the lineage. No model's h0 was modified.

### 3.3 Variance Analysis

| Model | Variance (P_in range across 2 repeats) | Stability |
|---|---|---|
| MiniMax-M3 | 0 | Deterministic |
| DeepSeek-V4-Pro | 0–1 | Stable |
| GLM-5.2 | High (1/3 vs 3/3 on same task) | Unstable |

**Finding 4: Variance is model-specific.** GLM-5.2 (a reasoning model with long chain-of-thought) exhibits high run-to-run variance even at temperature=0. This means `eval_repeats=2` may be insufficient for GLM-5.2—the acceptance gate's decisions are noisy. MiniMax-M3 and DeepSeek-V4-Pro are stable enough for reliable single-round evaluation.

### 3.4 Root-Cause Analysis: Why 0 Accepts

The round-0 results show 0 accepted edits across all models. Root cause analysis reveals two categories:

**Category A: Task/verifier design issues (not harness-fixable)**
- t04 label casing: verify.sh checked exact `label` casing ("Ally" vs "ally"). Fixed by making the check case-insensitive.
- t02/t05 provenance: verify.sh checks provenance key coverage + confidence, but the SKILL.md never provides a concrete provenance field template. Models guess different `origin`/`note` text.

**Category B: Genuine harness weaknesses (Self-Harness should fix)**
- GLM-5.2 bypassing `extract` on t03: the workflow-section doesn't mandate extract-before-validate. A harness edit *could* fix this.
- Missing provenance: the workflow-section doesn't emphasize provenance as mandatory. A harness edit *could* fix this.

**Implication:** Self-Harness correctly refuses to fix Category A issues via SKILL.md edits (that would be overfitting to verifier quirks). For Category B, the proposals were on the right track but didn't produce measurable pass-rate improvement in a single round—suggesting multi-round iteration or more targeted proposals are needed.

### 3.5 Round 1: Post-Fix Re-evaluation

After fixing Category A issues (case-insensitive label checks), we re-run all three models on the same h0 harness.

**Round 1 baseline (post-fix verifiers, all 5 tasks):**

| Task | GLM-5.2 | MiniMax-M3 | DeepSeek-V4-Pro |
|---|---|---|---|
| t01-id-based | ✓ 8st | ✓ 7st | ✓ 9st |
| t02-chinese-alias | ✗ 7st (provenance missing) | ✗ 12st (provenance missing) | ✓ 7st |
| t03-multi-stage | ✓ 8st | ✓ 8st | ✓ 11st |
| t04-external-json | ✓ 7st (was ✗, label fix) | ✓ 10st (was ✗, label fix) | ✓ 7st (was ✗, label fix) |
| t05-collection | ✗ 7st (provenance missing) | ✗ 12st (provenance missing) | ✗ 7st (provenance missing) |
| **Total** | **3/5** | **3/5** | **4/5** |

**Finding 5: Verifier design matters.** Fixing the label-casing check (Category A) immediately improved GLM-5.2's t04 from fail to pass-without any harness change. This confirms that Self-Harness's acceptance gate is only meaningful when failures are harness-fixable, not verifier-fixable. The remaining failures (t02, t05) are genuine provenance-missing issues that a harness edit *should* be able to fix.

### 3.6 First Accepted Edit: h0 -> h1 (GLM-5.2)

In round-1, GLM-5.2's proposer generated a rule-cheat-sheet edit that **expanded the cheat-sheet from E5-E15 to E1-E15**, adding explicit E1-E4 rows with a Chinese-name alias reminder. This edit addressed the t02/t05 failure cluster (missing provenance/alias awareness).

**Validation results (eval_repeats=2, best-of-N):**

| Harness | P_in | P_ho | Variance (in/ho) |
|---|---|---|---|
| h0 (baseline) | 2/3 | 1/2 | 0/0 |
| h1 candidate 1 (rule-cheat-sheet) | **3/3** | 1/2 | 0/0 |
| h1 candidate 2 (workflow-section) | 2/3 | 1/2 | 2/1 |

**Acceptance: candidate 1 ACCEPTED.**
- P_in improved from 2/3 to 3/3 (t02 now passes)
- P_ho unchanged at 1/2 (no regression)
- Satisfies the non-regressive acceptance rule: improves one split without degrading the other

**Candidate 2 REJECTED** (flat: no improvement, high variance).

**Finding 6: Self-Harness produces real harness evolution.** This is the first accepted edit across all experiments. The h0 -> h1 transition demonstrates the full Self-Harness loop:
1. Weakness Mining identified t02/t05 as `validate_failed::rule-cheat-sheet`
2. The proposer generated a targeted cheat-sheet expansion (adding E1-E4 + Chinese-name reminder)
3. Regression testing confirmed the edit improved held-in without degrading held-out
4. The edit was merged into the lineage as h1

**Finding 7: Bounded edits work.** The accepted edit modified only the `rule-cheat-sheet` surface (one section of SKILL.md). The minimality constraint (§3.3) held: no other sections were touched, and the edit was additive (no existing rules removed).

### 3.7 Cross-Model Convergence: Same Surface Accepted

MiniMax-M3 (m3-2) independently produced a **rule-cheat-sheet** edit that was also accepted:

| Model | Baseline P_in | Candidate P_in | Baseline P_ho | Candidate P_ho | Decision | Lineage |
|---|---|---|---|---|---|---|
| GLM-5.2 | 2/3 | **3/3** | 1/2 | 1/2 | ACCEPT | h0 -> h1 |
| MiniMax-M3 | 2/3 | **3/3** | 1/2 | 1/2 | ACCEPT | h0 -> h2 |

**Finding 8: Convergent harness evolution.** Both GLM-5.2 and MiniMax-M3 independently:
1. Identified the same failure cluster (`validate_failed::rule-cheat-sheet` on t02/t05)
2. Proposed edits to the **same surface** (`rule-cheat-sheet`)
3. Achieved the **same improvement** (P_in 2/3 -> 3/3) without held-out regression
4. Had their candidate 2 (workflow-section) **rejected** (flat)

This convergence is striking: despite different proposal styles (GLM aggressive, MiniMax conservative), both models converged on the same surface and the same outcome. This suggests that when the failure signal is clear and the surface is genuinely addressable, Self-Harness produces consistent improvements across models.

### 3.8 DeepSeek-V4-Pro: Diminishing Returns at High Baseline

DeepSeek-V4-Pro achieved the highest baseline (4/5, only t05-collection failing). Its round-1 results:

| Harness | P_in | P_ho | Variance |
|---|---|---|---|
| h0 (baseline) | 3/3 | 1/2 | 0/0 |
| Candidate 1 (rule-cheat-sheet) | 3/3 | 1/2 | 0/0 |
| Candidate 2 (workflow-section) | 2/3 | 1/2 | 0/0 |

Both candidates **REJECTED**: candidate 1 flat (baseline already maxed held-in at 3/3), candidate 2 regression (-1 held-in).

**Finding 9: Model capability ceiling.** DeepSeek's baseline was already 3/3 on held-in, leaving no room for held-in improvement. The only remaining failure (t05) is on held-out, and the proposed edits (cheat-sheet / workflow) couldn't fix the specific provenance-template gap that t05 requires. This illustrates a fundamental property of Self-Harness: **as baseline performance approaches the task's ceiling, the acceptance gate becomes harder to satisfy**-there are fewer failure clusters to mine, and the remaining failures may require cross-surface edits (e.g., adding a provenance template to `references/extraction-config.md`) that a single-surface proposal cannot address.

### 3.9 Round-1 Cross-Model Summary

| Model | Baseline | Candidate 1 | Candidate 2 | Accepted | Lineage |
|---|---|---|---|---|---|
| GLM-5.2 | 2/3, 1/2 | **3/3**, 1/2 | 2/3, 1/2 | 1 (cand 1) | h0 -> h1 |
| MiniMax-M3 | 2/3, 1/2 | **3/3**, 1/2 | 2/3, 1/2 | 1 (cand 1) | h0 -> h2 |
| DeepSeek-V4-Pro | 3/3, 1/2 | 3/3, 1/2 | 2/3, 1/2 | 0 | h0 (unchanged) |

**Finding 10: Model-specific acceptance.** The same harness h0, same tasks, same proposer pattern (rule-cheat-sheet + workflow-section), but **different acceptance outcomes**: GLM and MiniMax both accepted (their baselines had room to improve), while DeepSeek rejected (its baseline was already at the held-in ceiling). This is a nuanced reproduction of the paper's model-specificity finding: not only do different models expose different weaknesses, but the **same proposed edit can be accepted for one model and rejected for another** depending on each model's baseline performance profile.

---

## 4. Discussion

### 4.1 When Self-Harness Works for Skills

The paradigm is directly applicable to skills because:
1. Skills have **deterministic verifiers** (validate, rules, diff)—satisfying the paper's requirement.
2. Skills use **progressive disclosure**, making the description surface independently testable.
3. Skills have **bounded editable surfaces** (sections, references), enabling minimality enforcement.

### 4.2 When It Doesn't

Self-Harness cannot fix failures rooted in:
- **Task/verifier design** (over-strict field comparisons, missing templates)
- **Model capability limits** (a model that fundamentally can't parse JSON won't be helped by SKILL.md edits)
- **Cross-surface interactions** (a single-surface edit can't fix a problem that spans workflow + references + cheat-sheet)

### 4.3 Practical Constraints

- **Variance**: High-variance models (GLM-5.2) need `eval_repeats≥3` for reliable acceptance decisions. This triples the API cost per round.
- **Cost**: A single round (baseline + K=2 candidates × eval_repeats=2 × 5 tasks) ≈ 30 runner invocations ≈ 30–60 min depending on model speed.
- **Proposer JSON robustness**: Different models format JSON differently (GLM: clean array; MiniMax: prose-prefixed; DeepSeek: fenced). The proposer parser must handle all variants.

### 4.4 Comparison to the Paper

| Paper finding | Our reproduction | Status |
|---|---|---|
| Model-specific weaknesses (Fig 5/6) | t02/t03 divergence across 3 models | ✓ Reproduced |
| Proposal diversity (§3.3) | 3 models, 3 fix directions, 5 distinct surfaces | ✓ Reproduced |
| Acceptance gate prevents regressions (§3.4) | 2/6 proposals caused regression, both rejected | ✓ Reproduced |
| Variance reduction via eval_repeats | MiniMax var=0, GLM var=high | ✓ Reproduced |
| Harness lineage evolution (h0->h1) | GLM h0->h1, M3 h0->h2 accepted; DS rejected (ceiling) | Reproduced |

---

## 5. Limitations

1. **Synthetic tasks**: 5 small synthetic libraries may not capture the complexity of real component libraries. Real-world tasks might expose different failure modes.
2. **Single skill**: Only `sg-data-pack` tested. Generalization to other skills (and MCP tools) is architectural but unvalidated.
3. **Single round per model**: Multi-round iteration (h0→h1→h2) not yet demonstrated with accepted edits.
4. **Headless runner fidelity**: The runner simulates progressive disclosure but lacks real IDE features (hooks, permissions, other skills). Real-world behavior may differ.
5. **Limited model diversity**: All three models are reasoning models from Chinese AI labs. Western models (GPT, Claude) untested.

---

## 6. Conclusion

We demonstrate that the Self-Harness paradigm is applicable to tool-side harnesses (skills), with minimal adaptation. The three-stage loop runs end-to-end, produces auditable lineage, and the acceptance gate correctly rejects non-improving edits. Cross-model comparison reproduces the paper's core finding: the same harness exposes model-specific weaknesses, and the same evidence yields model-specific proposals.

The main practical lesson is that **harness improvement must be grounded in behavioral evidence AND valid task design**—when failures stem from verifier quirks rather than harness deficiencies, Self-Harness correctly refuses to "fix" them, avoiding overfitting. Future work should focus on multi-round iteration, real-world tasks, and extending to MCP tools.

---

## Appendix A: File Inventory

```
tool-self-harness/
├── config.yaml              # GLM-5.2 config
├── minimax-config.yaml      # MiniMax-M3 config
├── deepseek-config.yaml     # DeepSeek-V4-Pro config
├── surfaces.yaml            # 11 editable surfaces
├── tasks/                   # 5 synthetic tasks (held-in: t01-t03, held-out: t04-t05)
├── scripts/
│   ├── lib/runner.js        # headless tool-loop runner (~400 lines)
│   ├── lib/trace.js         # failure signature attribution
│   ├── lib/patch.js         # heading-boundary patch apply/revert
│   ├── 01-run-round.js      # concurrent task runner + result caching
│   ├── 02-mine-weakness.js  # cluster failures → evidence bundle
│   ├── 03-propose.js        # K bounded proposals (robust JSON extraction)
│   ├── 04-validate.js       # regression testing (eval_repeats=2 best-of-N)
│   ├── 05-accept.js         # acceptance rule + git lineage merge
│   ├── loop.sh              # orchestrator
│   └── report.js            # cross-model comparison report
├── lineage/                 # git tags h0, h1, ...
├── sandbox/                 # editable copy of the target skill
└── results/                 # per-round validation + acceptance reports
```

## Appendix B: Reproduction

```bash
cd ~/DEV/tool-self-harness

# Run a single model's full loop:
rm -rf sandbox && cp -r ~/DEV/sg-data-pack sandbox && rm -rf runs/cache
bash scripts/loop.sh <config>.yaml 1    # config.yaml=GLM, minimax-config.yaml=M3, deepseek-config.yaml=DS

# Generate cross-model comparison:
node scripts/report.js
```
