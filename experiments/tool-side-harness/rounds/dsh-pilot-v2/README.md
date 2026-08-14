# DSH Pilot v2 — 重设计后的结果

Status: pilot v2 executed 2026-08-14（同 v1 协议与端点）。v1 的根因（task.md 过度指定）
已按重设计方向消除；本轮判定两个套件**held-in 具备区分度，held-out 仍需 v3 重设计**。
证据级别 E0，未产生正式基线或进化候选。

## Pass 向量

| 目标 | official-full | minimal | no-harness |
|---|---|---|---|
| editing-cordis-compositions | 9/9 + 6/6 | **4/9** + 6/6 | **3/9** + 6/6 |
| headless-preset | **8/9** + 6/6 | **6/9** + 6/6 | **5/9** + 6/6 |

## 剂量反应锚点（held-in）

- editing/ec-01：3/3 → 1/3 → 0/3（v1 与 v2 两轮复现）
- editing/ec-03：3/3 → 0/3 → 0/3（minimal 的浓缩正文不含所需字段值）
- headless/hp-01：2/3 → 0/3 → 0/3（重建整行需要参考组合的包名+config）

## 行为信号

- v2 首版 headless official-full 的 loaded_skill_rate=0（从不加载参考组合，8/9 掉到
  3/9）；task.md 加入 harness 指引（v2b）后升至 0.8，held-in 回到 8/9。**harness 内容
  只有在任务明确指示时才会被模型消费**——这本身是一个可报告的诊断发现。
- editing official-full 的加载率 0.93，无需额外指引。

## 剩余问题（v3 范围）

1. **held-out 两个套件全变体天花板**（ec-04/ec-05/hp-04/hp-05 均 3/3×3 变体）：
   这些修复可被通用推理解决，不测 harness。
2. ec-02、hp-02、hp-03 接近或达到全变体天花板，正式基线前应替换或加固。
3. hp-01 在 official-full 的 2/3（一次未查参考）属于模型级方差，暂不处置。

## 结论

held-in 的基准敏感性（移动对比 + 非饱和锚点 + 剂量梯度）在两个套件均已建立，
达到了 v2 重设计的目标。held-out 需要单独的 v3 重设计（更难 fixture，修复值仅存在于
harness 内容中），之后才可进入正式资格化。
