# Diagnostic decision

Decision: **stop-redesign**.

The fresh fallback cohort completed 27/27 attempts on GLM-5.2 via Volcengine Ark `plan/v3` after
the `coding/v3` cohort was infrastructure-aborted by `AccountQuotaExceeded`. Gate 0 passed.

| Variant | Held-in | Held-out | Test before first edit | Test after last edit | Mean steps |
|---|---:|---:|---:|---:|---:|
| no-skill | 6/6 | 2/3 | 66.7% | 100% | 10.33 |
| minimal | 6/6 | 2/3 | 77.8% | 100% | 11.67 |
| official-full | 6/6 | 2/3 | 100% | 88.9% | 12.33 |

The official skill changes process behavior, especially testing before the first edit, and all
variants are exposed through the expected skill interface. However, the minimal variant reaches
the held-in ceiling (6/6), and all three variants have the identical task pass vector: all six
held-in tasks pass; `condition-wait` and `slice-snapshot` pass held-out; `options-defaults` fails.
Therefore the suite cannot support a formal baseline or Self-Harness evolution: there is no held-in
correctness headroom for a candidate to improve.

The next action is fixture redesign, not candidate generation. At least two held-in tasks must be
replaced or made materially harder, with hidden checks that distinguish root-cause/process quality
from straightforward one-line repairs. The `options-defaults` held-out contract also needs an
explicit semantic audit because the common `??` repair does not satisfy the current hidden null
expectation.
