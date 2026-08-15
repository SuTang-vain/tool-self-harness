# git-workflow-and-versioning 资格化 v1：needs-redesign

54 次尝试（0 逃逸）。六任务中四个全变体天花板——git 惯例（conventional commits、
分支前缀、semver、changelog 分组）是行业通用知识，模型先验覆盖，harness 无剂量
反应（minimal 11/12 甚至高于 full 9/12，噪声主导）。gw-03 的 grader 要求
staged-未提交状态，与技能教义「尽早提交」冲突，属 fixture 设计缺陷。

**机制线第三数据点**：先验覆盖的内容无法产生可测 harness 效应（继 eval-pin、
wcag 分层之后）。重设计方向：改用技能特有知识（Save Point Pattern、变更摘要模板、
tag 为版本源、完整 changelog 分组）并修正 gw-03 的终态设计。
