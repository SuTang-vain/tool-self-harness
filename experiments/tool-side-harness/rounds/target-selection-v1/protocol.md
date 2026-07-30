# Target Selection Protocol v1

Frozen before local target snapshotting on 2026-07-30.

## Eligibility

A candidate must have a clear permissive license, a fixed public commit, local/offline execution,
replayable hidden verification, a non-trivial progressive surface, and a plausible non-saturated
baseline. Network services, paid APIs, mutable external state, and subjective-only outputs are
excluded from the pilot.

## Scoring

Each criterion is scored 0-2: license clarity, offline determinism, class/path fit, hidden-verifier
feasibility, expected baseline headroom, surface richness, and confound control. Scores select a
pilot target but do not constitute experimental evidence.

## Stop/go

Snapshot a target only if it scores at least 11/14 and has no zero on license, offline determinism,
or verifier feasibility. A snapshotted target still must pass benchmark qualification before any
Self-Harness proposal is generated.
