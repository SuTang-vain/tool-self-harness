# R4 — 跨模型复制 v1（DeepSeek V4 flash）

第一批 RQ4 证据：GLM-5.2 → DeepSeek V4 的梯度方向复制。

| 分区 | GLM | DeepSeek | 方向复制 |
|---|---|---|---|
| editing held-in | 9/3/3 | 9/3/3 | ✅ 逐项一致 |
| editing held-out | 6/3/3 | 6/3/3 | ✅ 逐项一致 |
| headless held-in | 9/3/3 | 9/3/5 | ✅ full≥none；⚠ no-harness 地板更高（5 vs 3） |
| headless held-out | 6/0/1 | 5/1/1 | ✅ 梯度保持（eval-pin 对 DeepSeek 同样抵抗先验） |

H1 通过（四分区 full ≥ none）。H2 部分成立：held-out 预测 ✓；editing 收窄预测 ✗
（realm 规则对 DeepSeek 同样无先验）；新观察：DeepSeek 对 DSH 组合惯例的通用先验
更强（no-harness hp-03 2/3），与同组织训练一致。「先验距离」获得跨模型维度：
**先验地板是模型特定的**。完整性审计：2 次逃逸尝试全部被拦截。
