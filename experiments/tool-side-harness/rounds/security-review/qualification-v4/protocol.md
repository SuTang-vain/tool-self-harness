# Security Review Path-C Qualification v4 — Integrity-Calibrated Diagnostic

Preregistered on 2026-07-31 after the v3 plan/v3 integrity audit and before any v4 model attempt.

## Reason for v4

The completed v3 plan/v3 run showed a promising official-full held-in advantage, but Gate 0 failed:
archive resource limits were not connected to the extraction path, OAuth state comparison could
throw on length mismatch, and several correct mechanism labels/files were outside the frozen
canonical calibration. No v3 outcome is used as qualification evidence.

V4 preserves the confirmed research design and changes only fixture integrity and hidden scoring:

- archive limits are invoked and upload authorization is explicit;
- OAuth state checks fail closed and exact redirect comparison covers query/fragment;
- task-specific aliases cover observed equivalent mechanism labels;
- signed-envelope authorization severity is HIGH and finding files identify the vulnerable primary
  locations rather than every safe helper in the trace.

## Fresh diagnostic

- model: GLM-5.2 via Volcengine Ark `plan/v3`
- config: `glm-agent-config.yaml`
- variants: no-skill, minimal, official-full
- suite: `security-review-qualification-v4`
- tasks: 6 held-in + 3 held-out
- repeats: 1
- attempts: 27 fresh attempts
- seed: `2026073113`
- run id: `security-review-glm-planv3-qualification-diagnostic-v4`
- no pooling from v1, v2, v3, or any aborted run

All previously confirmed precision/recall, false-positive, evidence, remediation, file-scan,
reference-use, Q3, verifier-integrity, minimal-headroom, and deep-reference-sensitivity gates remain
unchanged. Any new fixture or alias defect stops the stage.
