---
name: using-git-worktrees
summary: Set up an isolated Git worktree safely before implementation work.
description: Use when a task explicitly requests an isolated Git worktree or when implementation work must not alter the current checkout.
---

# Using Git Worktrees

Before creating a worktree, inspect the repository and confirm whether the current checkout is
already a linked worktree. If a new worktree is required, use a project-local `.worktrees/`
directory, make sure it is ignored by Git, create a new branch and worktree, and run the project's
baseline tests in the new workspace. Do not overwrite an existing branch or worktree.
