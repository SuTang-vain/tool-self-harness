---
name: using-git-worktrees
summary: Set up an isolated Git worktree safely before implementation work.
description: Use when a task explicitly requests an isolated Git worktree or when implementation work must not alter the current checkout.
---

# Using Git Worktrees

Before creating a worktree, inspect the repository and confirm whether the current checkout is
already a linked worktree. If a linked worktree already satisfies the task, do not create another.

If a new worktree is required, follow these steps in order:

1. Choose the project-local directory using existing-directory precedence:
   - if `.worktrees/` already exists and is already ignored, create the requested branch and
     worktree there;
   - else if only `worktrees/` exists, use that directory;
   - else if both `.worktrees/` and `worktrees/` exist, prefer `.worktrees/`;
   - otherwise create and use `.worktrees/`.
2. Before creating any worktree under the chosen directory, record that directory path in the
   repository's tracked `.gitignore` and commit that change at HEAD so the ignore rule is part of
   the committed repository policy. Writing the rule only to `.git/info/exclude` is not
   sufficient because that file is local-only and untracked.
3. Create a new branch and worktree under the chosen directory. Never overwrite an existing
   branch or worktree.
4. Run the project's baseline tests inside the new worktree.

