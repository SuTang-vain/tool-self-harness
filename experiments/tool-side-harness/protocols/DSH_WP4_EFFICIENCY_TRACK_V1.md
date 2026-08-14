# DSH WP4 效率轨预注册（非能力轨）

Status: preregistered 2026-08-14，先于任何候选评估。

## 1. 能力轨关闭声明（charter Gate 1 依据）

h0 正式基线中两个 DSH 目标的 official-full 均为 9/9 + 6/6，5/5 任务全可靠——**能力
维度已满天花板**，不存在可归因的 held-in 失败签名，因此不生成能力候选。按 charter
Gate 1：「不新增可靠任务的结构/效率候选，只能在单独预注册的非能力轨推进，且必须
保持全部可靠任务与聚合计数」。本文件即为该轨道的预注册。

## 2. 候选（评估前冻结）

每个目标一个单面候选，沿其注册的拟合路径：

| 候选 | 目标 | surface（级别） | 拟合路径 | 编辑 | 期望 Q3 方向 |
|---|---|---|---|---|---|
| c1-densify-authoring | editing-cordis-compositions | authoring-preset（L1） | C-density-pruning | rewrite（节 1779→1161 字符，-34.7%） | 每尝试 token 下降 |
| c1-tight-description | headless-preset | preset-description（L0） | A-interface-constraint | rewrite（描述 271→197 字符） | 每尝试 token 下降 |

候选 manifest（含 h0/c1 内容哈希与回归机制声明）冻结于
`rounds/dsh-wp4-v1/manifests/`。候选技能目录冻结于
`targets/<id>/candidates/c1/`。

## 3. 验证协议

- runner：加固版 generic-runner（工作区隔离）；
- 变体：official-full（进化作用于 full harness 本身）；全套件 5 任务 × 3 fresh
  repeat，全新工作区与模型调用，种子记录；
- 对比基准：h0 正式基线 official-full（editing 9/9+6/6 全可靠；headless 9/9+6/6
  全可靠）。

## 4. 门（Gates 0-4 依序）

- **Gate 0**：provider/infra/泄漏失败中止不计分；held-out 结果对任何 proposer 不可见
  （本轨候选为 operator 预注册，评估前不接触 held-out 结果）。
- **Gate 1（Q2 保持门，非能力轨形态）**：候选必须保持 h0 的全部可靠任务（5/5）且
  held-in/held-out 聚合不下降（9/9 + 6/6）。任何一次尝试失败即拒绝。
- **Gate 2（Q1 分类）**：保持后的候选按「局部能力无变化 / 效率候选」分类。
- **Gate 3（Q3）**：对比 h0 与候选的 mean_tokens_per_attempt、total_tokens、
  api_calls；报告差值并注明 15 次尝试量级的噪声范围，不做显著性主张。
- **Gate 4（Q4）**：not_measured（本轨不涉及人评）。

## 5. 记录

- 接受 → `lineages/dsh-efficiency/<target>/h1`（效率 lineage，注明非能力轨）；
- 拒绝 → `registries/attention-conflict-matrix-v2.json` 追加冲突记录；
- 结果摘要入 `rounds/dsh-wp4-v1/`。
