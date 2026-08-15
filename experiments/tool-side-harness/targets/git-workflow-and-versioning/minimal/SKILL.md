---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog.
---

# Git Workflow and Versioning

Commit early and often; each commit does one logical thing (atomic) with a descriptive
message in `<type>: <summary>` form using feat/fix/refactor/test/docs/chore. Keep changes
small and concerns separate. Work on short-lived branches named `feature/<desc>`,
`fix/<desc>`, `chore/<desc>`, or `refactor/<desc>`, branched from main, deleted after merge.
Never commit secrets or environment files; keep a .gitignore covering .env and generated
output. Version with MAJOR.MINOR.PATCH semantics (breaking = MAJOR, feature = MINOR, fix =
PATCH), tag releases, and keep a changelog grouped by Added/Changed/Fixed/Deprecated/
Removed/Security written for consumers.
