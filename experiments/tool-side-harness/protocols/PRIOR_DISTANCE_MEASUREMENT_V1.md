# PRIOR_DISTANCE_MEASUREMENT_V1 — 先验距离直接测量协议

Status: preregistered 2026-08-14，先于任何探针运行。

## 1. 构造定义

对每个任务的**承重知识项**定义其「先验可猜性」G(item)：
无 harness 条件下（no-harness 单发提示），模型能否产出满足同一 grader 判据的内容。
G = 探针通过率（0–1）。先验距离 = 1 − G。

## 2. 探针电池

每个承重项一个单发探针：提示只陈述情境（与任务一致的行为目标），**不引用任何
harness 内容**；评分为确定性正则/schema 匹配，复用各套件 grader 的判据。
探针电池冻结于 `registries/prior-guessability-probes-v1.json`：
`{id, target, task, prompt, pattern, flags, expected_direction}`。

## 3. 测量协议

- 模型：校准模型 GLM-5.2（Ark plan/v3，无工具、temperature 0）；
- 每探针 3 次 fresh 单发调用；G = 通过数/3；
- 探针不触碰 held-out 内容（探针内容来自已冻结的任务定义，非 held-out 结果）。

## 4. 预测器与校准（先验假设，冻结）

H：效应量 E(task) = official-full 通过率 − no-harness 通过率（GLM 冻结记录）与
G(task) 负单调关联。校准判据（描述性，不做显著性主张）：

- 负单调方向成立：G 高的任务 E=0（天花板）占多数，G 低的承重任务 E≥0.5；
- 排序一致性：G 与 E 的 Spearman 秩相关 < 0（方向性支持即可，n≈10）；
- 反例逐条记录（反例 = 校准的边界条件，不是失败）。

## 5. 事前门规则（前瞻使用）

新目标/新套件在 pilot 之前先跑探针电池：

- 若全部承重项 G ≥ 2/3 → 预注册「效应量低于 3 重复分辨率」，要么重设计瞄准
  低可猜内容（如发明值、仓库特有规则），要么接受地板；
- 若至少一项 G ≤ 1/3 → 预注册预测该任务 E ≥ 0.5，进入常规资格化。

## 6. 范围与局限

- 探针只测「可产出性」，不测「可定位性/可应用性」——G 是效应量的必要条件
  而非充分决定量（校准记录如实报告残差）；
- 先验地板是模型特定的（R4 证据）——G 对每个模型单独测量；
- 本协议不改变任何已冻结结论；只增加测量工具与预测规则。

## DeepSeek 校准附记（2026-08-14，冻结于运行前）

- 运行：同一冻结电池（8 探针 × 3 重复）在 deepseek-v4-flash（api.deepseek.com）上执行；
  评分规则不变；配置 .tmp-config-dsh-deepseek.yaml（凭据不入库）。
- 假设（由 R4 推出）：
  H1 G 是模型特定的：至少一个探针的 G_DeepSeek ≠ G_GLM；
  H2 方向预测：headless-models 的 G_DeepSeek > G_GLM（R4 显示 DeepSeek no-harness
  held-in 地板 5/9 > GLM 3/9，即 DeepSeek 对 DSH 组合惯例先验更强）；
  H3 eval-pin 与 realm 规则在两模型上均 G≈0（R4 中两模型的梯度都保持）。
- 校准：G_DeepSeek 对 E_DeepSeek（R4 冻结记录）做与 GLM 相同的方向对照；跨模型
  G 对比即「先验地板模型特定性」的测量层证据。
