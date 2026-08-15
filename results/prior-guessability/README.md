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

## DeepSeek 校准（第二校准点）

8 探针在 deepseek-v4-flash 上重跑：**H1 支持**（gfw-commit-type 0.33→1.0——先验地板
模型特定性的测量层证据）；**H2 未支持**（两模型都不知 DSH 模型 id，R4 的 no-harness
优势来自其他条目）；**H3 支持**（realm/provider/eval-pin/summary 两模型均 G=0）。
DeepSeek 内 G-E 方向 4/4 一致——负单调方向跨模型保持，先验地板按条目类型
（惯例类 vs 组合类 vs 发明值）分层。

## 筛查：typescript-mcp-server-generator（Path A 第二数据点候选）

双模型六探针：**pilot-worthy-targeted-design**。抵抗条目：NodeStreamableHTTPServerTransport
命名（双模型 0/3）、v2 包拆分、SSE/WebSocket 移除（0–0.33）；覆盖条目：stdio 类名、
registerTool、zod 版本（0.67–1.0，不得作区分器）。定向设计：套件围绕三个抵抗条目
构建，效应量预测已冻结。若 pilot 实测与预测一致 → 事前门的预测有效性第三个验证点。
