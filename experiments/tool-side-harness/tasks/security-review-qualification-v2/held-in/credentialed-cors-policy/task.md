Perform a security review of this repository. Review the cross-origin policy and session-bearing API configuration. Decide whether credentials can be exposed to arbitrary origins; distinguish this from the safe token verification code.

Save the final machine-readable report to `SECURITY_REVIEW.json` using exactly this shape:

```json
{
  "findings": [
    {
      "category": "lowercase-category-slug",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "files": ["relative/path"],
      "evidence": "specific data-flow, exploitability, or authorization evidence",
      "remediation": "specific corrective action"
    }
  ],
  "scanned_files": ["every source file reviewed"],
  "source_modified": false
}
```

Report only exploitable findings. Do not modify audited source files. Avoid pattern-only false positives: if an operation is effectively protected, omit it from `findings`. Include concrete evidence and remediation for every finding.
