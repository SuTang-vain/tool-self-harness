# Q3 方差控制执行计划（模型选择冻结）

协议：`protocols/Q3_VARIANCE_CONTROL_DESIGN.md`（2026-08-15 冻结，待执行）。

## 模型选择（2026-08-16 记录）

**执行模型 = deepseek-v4-flash**（用户指示）。该选择落在协议允许集合内
（"GLM（08-17 后）或 DeepSeek（均可；记录模型）"），属模型选择而非协议修订；
本文件即选择记录。端点/凭据：`.tmp-config-dsh-deepseek.yaml`（gitignored）。

## 设计摘要（协议原文）

- 配对种子：h0 与候选（效率轨 c2 = roster-service 整节删除，−27.3%，此前撤回的候选）
  同日、同 seed、交错执行；
- 5 重复/变体 × editing 全套件 official-full → 25 次尝试/臂 × 2 臂 = 50 次尝试；
- 分层比较：按 steps 与 loaded_skill 分层后比较 mean tokens/attempt；
- 判据：至少一层内 |h0 − c2| ≥ 该层标准差 × 1.5 → 效应可测；否则将
  「小套件 Q3 = not-measurable-by-design」写入 charter 条款。

## 执行前核对清单（未完成）

- [x] generic-runner 能力：seed（task_order_seed）、per-attempt token 指标
      （runner.metrics.*_tokens）、behavior.loaded_skill 与 behavior.steps 分层字段、
      逐尝试 checkpoint 续跑 —— 全部具备（06-run-skill-benchmark.js）；
- [x] editing 冻结套件 + official-full 接线：suite=`tasks/editing-cordis-compositions`
      （5 任务 = 3 held-in + 2 held-out），official-full = skillRepo 指向
      `targets/editing-cordis-compositions/full/`；
- [x] h0/c2 快照哈希核对：manifest 值 8e3081ec… / 68dc1978… 与磁盘 shasum 一致；
- [x] 配置与预算：`.tmp-config-dsh-deepseek.yaml`（deepseek-v4-flash），
      50 次尝试 × 单次数千 token 级，费用可忽略。

## 冻结的分层判定规则（2026-08-16，先于数据）

- 双臂：A=h0（full/SKILL.md），B=c2（candidates/c2/SKILL.md）；同日、同 seed
  =20260816、并发启动实现尝试级时间交错；repeats=5、variant=official-full。
- 指标：每尝试 runner.metrics.total_tokens。
- 分层（冻结阈值）：loaded_skill（0/1）× steps 桶（low ≤15 / high >15）；层内
  两臂合计 ≥4 次尝试方可入判，否则并入 "other" 层。
- 层内判据：|meanA − meanB| ≥ 1.5 × 层内 pooled SD（双臂合并方差）。
  任一层达标 → 「效应可测（按观测符号）」；零层达标 → 按协议将
  「小套件 Q3 = not-measurable-by-design」写入 charter。
- 附带报告（不作判据）：不分层总体 |Δ| 与 pooled SD、usage_coverage、loaded_skill_rate。

## 结果落点

`rounds/dsh-wp4-q3-variance-control/`（run-record.md + results JSON + 分层表）。
