---
name: using-git-worktrees
summary: Set up an isolated Git worktree safely before implementation work.
description: Use when a task explicitly requests an isolated Git worktree or when implementation work must not alter the current checkout.
---

# Using Git Worktrees

Before creating a worktree, inspect the repository and confirm whether the current checkout is
already a linked worktree. If a new worktree is required:

- Select the project-local directory: use `.worktrees/`; if `.worktrees/` already exists and is
  ignored, create the requested branch and worktree there; if only `worktrees/` exists, use that
  directory; if both exist, prefer `.worktrees/`.
- Before anything else, record the chosen directory in the repository's tracked `.gitignore`
  and commit that change at HEAD so the ignore rule is part of committed repository policy. Do
  not rely on `.git/info/exclude`, which is local-only and untracked.
- Then create a new branch and worktree under the chosen directory. Never overwrite an existing
  branch or worktree.
- Run the project's baseline tests inside the new worktree.

