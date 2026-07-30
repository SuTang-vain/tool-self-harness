---
name: using-git-worktrees
summary: Set up an isolated Git worktree safely before implementation work.
description: Use when a task explicitly requests an isolated Git worktree or when implementation work must not alter the current checkout.
---

# Using Git Worktrees

Before creating a worktree, inspect the repository and confirm whether the current checkout is
already a linked worktree. If a new worktree is required, use a project-local `.worktrees/`
directory (if `.worktrees/` already exists and is ignored, create the requested branch and
worktree there; if only `worktrees/` exists, use that directory; if both exist, prefer
`.worktrees/`).

Precondition for worktree creation: the chosen project-local directory must be ignored by a rule
recorded in the repository's tracked `.gitignore` and committed at HEAD before `git worktree add`
is run. `.git/info/exclude` does not satisfy this precondition because it is not part of the
committed repository policy. If the rule is missing from tracked `.gitignore`, add it and commit
that change before creating the worktree.

Create a new branch and worktree; never overwrite an existing branch or worktree. Run the
project's baseline tests in the new workspace.

