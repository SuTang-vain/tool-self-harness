# 预注册：typescript-mcp-server-generator 资格化（S1，筛查后定向设计）

Status: preregistered 2026-08-14，先于任何模型尝试。

- 目标：typescript-mcp-server-generator（github/awesome-copilot，MIT，冻结 commit
  336af71f，sha 校验通过）；atomic-transform-validation / A-interface-constraint；
  Path A 第二数据点。
- 套件设计来自事前门筛查（`prior-guessability-probes-ts-mcp-v1.json`）：4 held-in
  锚定四个抵抗条目（NodeStreamableHTTPServerTransport 命名、v2 包拆分、SSE/WebSocket
  移除、v2 错误层级）+ 2 held-out（组合迁移、从零生成）；有意回避覆盖条目
  （stdio 类名、registerTool 形态、zod 版本）作为区分器。
- 冻结效应量预测（筛查结论，评估后对账）：
  ts-01（传输类命名）E ≥ 0.5；ts-02（包拆分）E ≥ 0.5（DeepSeek）/ 0.33–0.67（GLM）；
  ts-03（移除传输）E ≥ 0.5（GLM）/ 0.33–0.67（DeepSeek）；ts-04（错误层级）未筛查，
  按抵抗性假设 E ≥ 0.5（事后验证该假设的推广能力）。
- Pilot：GLM-5.2，3 变体 × 3 fresh repeat × 6 任务 = 54 次尝试；加固 runner；
  Gate 0 中止；held-out 隐藏；停止规则同前。
- 主张边界：E0 基线观察；事前门的前瞻验证是本轮的方法学产出。

## 模型修订（2026-08-15，用户授权，冻结于运行前）

GLM plan/v3 周配额阻塞（gate0-abort-2026-08-14.json，连续三轮确认）。经协议持有人
授权，pilot 相位改为 **deepseek-v4-flash**（api.deepseek.com，凭据自 DSH 凭据库）。
依据：筛查电池本就携带 per-model 预测（prior-guessability-probes-ts-mcp-v1.json），
本修订是合法相位切换而非静默换模型。对账改用 DeepSeek 预测集：

- ts-01（传输类命名）：E ≥ 0.5（双模型）；
- ts-02（包拆分）：E ≥ 0.5（DeepSeek）；
- ts-03（移除传输）：E 0.33–0.67（DeepSeek）；
- ts-04（错误层级）：E ≥ 0.5（抵抗性假设，未筛查）。

GLM 相位待其配额重置后作为可选补跑（同一冻结矩阵）。
