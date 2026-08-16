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

双臂完成（无 fatal、无逃逸）：h0 25/25（15/15 + 10/10，稳定 3/3 + 2/2），c2 25/25
（15/15 + 10/10，稳定 3/3 + 2/2）——Q2 完全保持，与 c2 的预注册「no movement」预期一致。
usage_coverage 100%、loaded_skill_rate 100%（双臂全部咨询技能，official-full 接线正常）。

冻结分层分析（`scripts/20-analyze-q3-variance.js`）：

- 全部 50 次尝试落入单一层「loaded | steps≤15」（其余三层 0 尝试，无合并）；
- 层内：meanA(h0)=31022.3，meanB(c2)=29187.2，diff=+1835.1（c2 低 5.9%，方向与
  编辑一致），pooled SD=5131.9，1.5×SD=7697.9 → **not-met**（|Δ|=0.36 SD）；
- **verdict: not-measurable-by-design** → 按预注册分支，charter 第 16 条正式登记。

判读：与 2026-08-14 复制失败（−0.1%）同向的正式测量版结论——即便配对 seed、
5 重复、分层比较，−27.3% 内容的单面编辑在 5 任务小套件上的效率增量仍低于
1.5-SD 门槛；attempt 级 token 方差（±16%）主导。效率轨以「框架内不可测」
正式闭合，未来 Q3 主张须换测量框架。机器可读：`results-2026-08-16.json`。
