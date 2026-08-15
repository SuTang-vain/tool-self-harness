# 先验距离直接测量 — GLM 校准 v1

8 个探针（无 harness 单发，3 重复，确定性评分）× 冻结效应量 E = full − none：

| 探针 | G | E | 判定 |
|---|---|---|---|
| editing-realm-group | 0.00 | 1.00 | ✓ |
| editing-provider-value | 0.00 | 1.00 | ✓ |
| headless-eval-pin | 0.00 | 1.00 | ✓ |
| headless-models | 0.00 | 1.00 | ✓（GLM 不知 DSH 模型 → 注释修正） |
| wcag-tier-alt | 1.00 | 0.67 | 边界 B1：多条目任务稀释 |
| wcag-tier-title | 1.00 | 0.33 | ✓ |
| gfw-commit-type | 0.33 | 0.33 | ✓ |
| gfw-summary-header | 0.00 | E 混淆 | 边界 B2：精确模板被释义化 |

负单调方向描述性成立（6/8 一致 + 两个已识别边界）。**实用价值已验证**：低 G 探针
准确标记值得 pilot 的任务；高 G 探针标记天花板风险——新目标可先跑探针再决定投入。
