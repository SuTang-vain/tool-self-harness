# Q3 方差控制设计（冻结，待执行）

Status: 2026-08-15 冻结。目的：闭合效率轨的「Q3 不可测」边界（15 次尝试粒度下
±10-20% 的尝试间方差淹没编辑效应，−16% 未复现）。

- 设计：配对种子（h0 与候选同日、同 seed、交错执行）× 5 重复/变体 × editing
  全套件 official-full（25 次尝试/臂 × 2 臂）；
- 分层比较：按步骤数（steps）与 loaded_skill 分层后比较 mean tokens/attempt；
- 判据（预注册）：分层后至少一层内 h0−c2 的 token 差 ≥ 该层内标准差 × 1.5
  → 「效应可测（正/负）」；否则正式把「小套件 Q3 = not-measurable-by-design」
  写入 charter 作为条款；
- 执行模型：GLM（08-17 后）或 DeepSeek（均可；记录模型）。
