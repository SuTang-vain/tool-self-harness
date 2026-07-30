Perform a security review of this repository. Trace the requested document name across files into filesystem access.

Do not modify the audited source. Save the final machine-readable report to
`SECURITY_REVIEW.json` using exactly this shape:

```json
{
  "findings": [
    {
      "category": "lowercase-category-slug",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "files": ["relative/path"],
      "evidence": "specific data-flow and exploitability evidence",
      "remediation": "specific corrective action"
    }
  ],
  "scanned_files": ["every source file reviewed"],
  "source_modified": false
}
```

Report only exploitable findings. If the apparent dangerous operation is protected by effective
validation, use an empty `findings` array rather than reporting a pattern-only false positive.
