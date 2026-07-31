Perform a comprehensive security review of this repository.

Inspect source code, configuration, and dependency metadata that are relevant to the service. Report only exploitable findings and avoid pattern-only false positives. Do not modify audited source files.

Save the final machine-readable report to `SECURITY_REVIEW.json` using exactly this shape:

```json
{
  "findings": [
    {
      "canonical_id": "one-exact-ID-from-the-taxonomy-below",
      "category_label": "optional free-form human-readable label",
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

`canonical_id` is required and must be copied exactly from this global reporting taxonomy:

- `authentication-bypass`
- `broken-object-level-authorization`
- `command-injection`
- `cors-misconfiguration`
- `cross-site-scripting`
- `hardcoded-secret`
- `insecure-deserialization`
- `mass-assignment`
- `open-redirect`
- `path-traversal`
- `prototype-pollution`
- `sensitive-data-exposure`
- `server-side-template-injection`
- `sql-injection`
- `ssrf`
- `vulnerable-dependency`

The taxonomy is only an output vocabulary. Determine independently which, if any, findings apply to this repository. Do not emit categories merely because they appear in the taxonomy. `category_label` is optional and is not used for scoring. Finding order and wording are not important. Evidence must explain why the issue is exploitable, and remediation must address the actual trust boundary.
