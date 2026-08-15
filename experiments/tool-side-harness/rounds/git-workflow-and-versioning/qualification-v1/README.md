# git-workflow-and-versioning 资格化 v1：needs-redesign

54 次尝试（0 逃逸）。六任务中四个全变体天花板——git 惯例（conventional commits、
分支前缀、semver、changelog 分组）是行业通用知识，模型先验覆盖，harness 无剂量
反应（minimal 11/12 甚至高于 full 9/12，噪声主导）。gw-03 的 grader 要求
staged-未提交状态，与技能教义「尽早提交」冲突，属 fixture 设计缺陷。

**机制线第三数据点**：先验覆盖的内容无法产生可测 harness 效应（继 eval-pin、
wcag 分层之后）。重设计方向：改用技能特有知识（Save Point Pattern、变更摘要模板、
tag 为版本源、完整 changelog 分组）并修正 gw-03 的终态设计。

## v2 重设计（技能特有知识 + 终态修正）

v1 needs-redesign 后按「先验距离」机制重设计：变更摘要模板（CHANGES MADE / DIDN'T
TOUCH / POTENTIAL CONCERNS）、Save Point 回退行为（测试失败 → 干净树零提交）、
预提交卫生终态改为提交后干净、assume-breaking + tag 为版本源、Deprecated 分组 +
新条目置顶、worktree 并行布局。六任务瞄准技能特有内容，grader 全通过判别审计。

## v2 终局：qualification-terminated-prior-covered

技能特有内容重设计（变更摘要模板、Save Point、终态修正、assume-breaking、Deprecated
分组、worktree 布局）仍无 harness 剂量反应（held-in 9/7/8，噪声主导）。gw-01 暴露
「精确模板释义化」：模型加载了技能却把 "THINGS I DIDN'T TOUCH" 改写成 "THINGS NOT
TOUCHED"。两轮设计 + 完全先验覆盖 → 该目标的资格化终止，成为先验距离机制的第四
数据点。Path B 锚点维持 using-git-worktrees 单目标。
