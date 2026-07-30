Create an isolated Git worktree for branch `feature-dirty-safe`. The current checkout contains an unrelated uncommitted change in `config.txt` that must remain local and must not be committed, reset, copied, or discarded.

Do not change application files. Preserve the dirty source checkout, prepare the requested isolated
workspace safely, run the baseline test command in the new worktree, and report the exact resulting
path, branch, and test state.
