# Q3 方差控制运行记录（v1）

协议：`protocols/Q3_VARIANCE_CONTROL_DESIGN.md`（2026-08-15 冻结）。
执行计划与冻结分层规则：`execution-plan.md`（2026-08-16，先于数据提交）。
模型：deepseek-v4-flash（用户指示，协议允许集合内，记录在案）。

## 设计

- 双臂：A=h0（`targets/editing-cordis-compositions/full/SKILL.md`，sha256 8e3081ec…），
  B=c2（`targets/editing-cordis-compositions/candidates/c2/SKILL.md`，sha256
  68dc1978…，roster-service 整节删除，−27.3%，此前 Q3 复制失败的撤回候选）；
- 同日、同 seed=20260816、双臂并发启动（尝试级时间交错）、repeats=5 ×
  editing 全套件 5 任务、variant=official-full → 25 次尝试/臂，共 50 次；
- 分层判据（冻结）：loaded_skill(0/1) × steps 桶（≤15 / >15），层内两臂合计
  ≥4 尝试；|meanA−meanB| ≥ 1.5 × 层内 pooled SD → 效应可测；零层达标 →
  charter 条款「小套件 Q3 = not-measurable-by-design」。

## 执行

- 双臂作业：h0=job bash-9，c2=job bash-10（`scripts/06-run-skill-benchmark.js`，
  concurrency=2，maxSteps=30，逐尝试 checkpoint 可续跑）。
- 分析：`scripts/20-analyze-q3-variance.js`（冻结规则实现）。

## 结果

（待双臂完成——见 `results-2026-08-16.json`。）
