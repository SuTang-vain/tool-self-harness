# S1 GLM 交叉对照（2026-08-17 配额重置后）

触发条件：GLM plan/v3 周配额 2026-08-17 00:00 +0800 重置（RESUME_RUNBOOK 冻结条件）。
执行时间：2026-08-17 00:04 +0800 探针通过（返回 choices，无 AccountQuotaExceeded）。

## 端点修正（Gate-0 风格：记录，不评分）

探针发现 plan/v3 端点现实际服务 **glm-5.3**：请求 model=glm-5.2 时响应 `model`
字段回显 `glm-5.3`（供应商在配额停机期间升级了 plan/v3 后端模型版本）。
修正：配置 `model: glm-5.2` → `glm-5.3`（gitignored 配置），本交叉对照的
「GLM 臂」= **glm-5.3 via Volcengine Ark plan/v3**。与先例一致（coding/v3 →
plan/v3 的端点修正记录在 `rounds/dsh-pilot-v1/`）。

## 执行（按 RESUME_RUNBOOK §2，全资产冻结复用）

- 套件：`tasks/typescript-mcp-server-generator`（6 任务，v2 套件，B3c 修正锚定）；
- 三变体 × 3 fresh repeats × seed 20260826 × 新 run-id `dsh-s1-tsmcp-v2`；
- 加固 generic-runner（run_command 隔离 + B4a 修复）；
- Gate 0：任何 provider 失败 → 中止、记录、不计分。

## 判定（预注册，RESUME_RUNBOOK §3–4）

- 对账脚本：`scripts/19-reconcile-predictions.js`（screening + 冻结预测 + 三变体结果）；
- 判定：每任务 in-range/out-of-range + 聚合判别；≥3/4 in-range → 前瞻验证支持；
- 逃逸审计：0 成功访问；记录、更新注册表/阶段报告/charter；commit+push。

## 与 DeepSeek 相位（2026-08-15）的对照关系

DeepSeek v2 结果（冻结）：held-out 4/6→0/6→0/6 合格、held-in 11/9/10 噪声主导、
对账 1/4、B3c 部分成功（ts-03b E 0→0.33）、B4a/B4b 边界。GLM 臂回答：
(a) B3c 锚定是否跨模型成立；(b) 对账命中率是否模型特定；(c) held-in 是否同样
噪声主导（先验地板模型特定性的第三数据点）。
