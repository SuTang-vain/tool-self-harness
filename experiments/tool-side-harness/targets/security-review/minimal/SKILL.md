---
name: security-review
summary: Review a codebase for exploitable security vulnerabilities and report precise evidence.
description: Use when asked to audit source code for injection, authorization, secrets, unsafe data flow, vulnerable dependencies, or related security problems.
---

# Security Review

Review only the requested scope. Trace untrusted inputs to dangerous sinks across files, check
whether validation or framework protections make a suspected issue non-exploitable, and avoid
reporting pattern-only false positives. Inspect relevant dependencies and secrets when present.
For every real finding, report its category, severity, file, line, evidence, and remediation. Do
not modify the audited source unless the user explicitly asks for a patch.
