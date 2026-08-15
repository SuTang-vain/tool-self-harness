# 预注册：git-workflow-and-versioning 资格化（WP1 广度 / Path B 独立数据点）

Status: preregistered 2026-08-14，先于任何模型尝试。

- 目标：git-workflow-and-versioning（addyosmani/agent-skills，MIT，冻结 commit
  7829ffd，skill sha 与注册表一致）；类别 workflow-state-transition / B-state-recovery；
  仓库独立于 using-git-worktrees（obra）与 DSH —— Path B 第二个独立数据点。
- 套件：4 held-in（原子提交、分支命名、预提交卫生、semver 打标）+ 2 held-out
  （changelog、混合纪律）；确定性 git 状态 grader；D1-D5 纪律（任务文本无修复、
  指引咨询、checker 只报违规）。
- 先验假设：提交消息约定/分支命名/semver/变更日志分组为 harness 承重知识；
  通用 git 操作（add/commit）为通用能力。
- Pilot：3 变体 × 3 fresh repeat × 6 任务 = 54 次尝试；加固 runner；Gate 0 中止；
  held-out 对 proposer 隐藏；停止规则同 DSH/wcag（地板/天花板 → redesign）。
- 主张边界：E0 基线观察；类别级主张需全样本池 + 独立复现。
