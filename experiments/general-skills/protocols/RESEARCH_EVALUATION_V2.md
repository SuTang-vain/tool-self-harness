# Research Evaluation Protocol v2: Layered Self-Harness Objectives

This document defines future-study reporting on top of the frozen capability acceptance rule in
`FINAL_ACCEPTANCE.md`. It does not retroactively change any completed experiment.

## Primary capability outcome

Use `reliable-task-set-v1` as the hard promotion gate. Report:

- held-in and held-out attempt pass counts;
- reliable task sets and their gains/losses;
- critical verifier regressions;
- model, suite, repeat count, and fresh-run provenance.

## Secondary efficiency outcome

For every new generic benchmark run, report:

- usage coverage (fraction of attempts with provider token usage);
- prompt, completion, and total tokens;
- API calls and tool calls;
- tool-call retries;
- wall-clock latency;
- tokens per successful attempt;
- tokens per reliable task.

These are descriptive until a study-specific threshold is preregistered. A candidate cannot be
called a capability improvement based on efficiency alone.

## Separate human-utility outcome

Do not infer preference from hidden verifier results. A human-utility study must separately
collect, as applicable:

- pairwise preference win rate;
- clarification count and quality;
- user takeover or correction rate;
- completion time;
- perceived control and interaction burden.

Human-utility results may be reported alongside capability, but cannot offset a capability or
reliability regression.

## Claim discipline

Every conclusion must use one of: aggregate movement, reliable local promotion, model-replicated
promotion, distribution-general promotion, or product utility improvement. The evidence must meet
the corresponding claim level in `RESEARCH_CHARTER.md`.
