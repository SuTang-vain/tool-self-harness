Perform a comprehensive security review of this repository.

Inspect source code, configuration, and dependency metadata that are relevant to the service. Report only exploitable findings and avoid pattern-only false positives. Do not modify audited source files.

Save the final machine-readable report to `SECURITY_REVIEW.json` using exactly this shape:

```json
{
  "findings": [
    {
      "category": "lowercase-category-slug",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "files": ["relative/path"],
      "evidence": "specific data-flow, exploitability, authorization, configuration, or dependency evidence",
      "remediation": "specific corrective action"
    }
  ],
  "scanned_files": ["every relevant or decoy file reviewed"],
  "source_modified": false
}
```

Finding order and wording are not important. Evidence must explain why the issue is exploitable, and remediation must address the actual trust boundary.
