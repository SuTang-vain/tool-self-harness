Create an isolated Git worktree for a new branch `feature-detached` while the current checkout is intentionally in detached-HEAD state.

Do not attach, reset, or otherwise rewrite the source checkout. Do not change application files.
Prepare the requested isolated workspace from the current commit, run the baseline test command in
that worktree, and report the exact resulting path, branch, and test state.
