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

- [ ] 核对 generic-runner 是否支持：同日配对 seed、交错执行顺序、per-attempt
      token 计数导出、loaded_skill / steps 分层字段记录；
- [ ] 确认 editing 冻结套件 + official-full 变体在 DeepSeek 上的配置
      （R4 曾跑过 editing 套件，配置应可复用，需核对 seed 参数位）；
- [ ] 确认 h0 与 c2 两个 harness 内容快照的当前文件路径（h0 = 现役
      editing-cordis-compositions SKILL.md；c2 = 撤回候选的补丁快照，若快照不在
      仓库需从 wp4-v1 round 记录重建并冻结哈希）；
- [ ] 50 次尝试的配额/费用预算确认（deepseek-v4-flash）。

## 结果落点

`rounds/dsh-wp4-q3-variance-control/`（run-record.md + results JSON + 分层表）。
