# S1 恢复手册（resume runbook）

冻结于 2026-08-15（配额阻塞期）。GLM plan/v3 周配额 2026-08-17 00:00 +0800 重置；
重置后按以下顺序执行，全部资产已冻结、无需重新准备。

## 1. 探针（确认配额可用）

```bash
curl -s -X POST "https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $(grep api_key .tmp-config-dsh-pilot.yaml | awk '{print $2}')" \
  -d '{"model":"glm-5.2","messages":[{"role":"user","content":"Write a short paragraph about testing."}],"max_tokens":200}'
# 期望：返回 choices（而非 AccountQuotaExceeded）
```

## 2. 三变体验证（加固 runner、seed 20260826、全新 run-id）

```bash
cd ~/DEV/tool-self-harness
node scripts/06-run-skill-benchmark.js .tmp-config-dsh-pilot.yaml \
  experiments/tool-side-harness/tasks/typescript-mcp-server-generator official-full \
  experiments/tool-side-harness/targets/typescript-mcp-server-generator/full \
  dsh-s1-tsmcp-v2 3 2 20260826
# minimal -> .../minimal .../minimal dsh-s1-tsmcp-v2
# no-harness -> none dsh-s1-tsmcp-v2
```

Gate 0：任何 provider 失败 → 中止、记录、不计分。

## 3. 预测对账

```bash
node scripts/19-reconcile-predictions.js \
  results/prior-guessability/tsmcp-screening-2026-08-14.json \
  experiments/tool-side-harness/rounds/typescript-mcp-server-generator/qualification-v1/preregistration.md.json \
  results/general-skills/dsh-s1-tsmcp-v2/official-full.json \
  results/general-skills/dsh-s1-tsmcp-v2/minimal.json \
  results/general-skills/dsh-s1-tsmcp-v2/no-harness.json \
  results/general-skills/dsh-s1-tsmcp-v2/reconciliation.json
```

## 4. 判定与记录

- 每任务 verdict（in-range/out-of-range）+ 聚合判别判定写入 round 目录；
- 事前门的前瞻验证结论：预测对账一致性（≥3/4 in-range → 前瞻验证支持）；
- 逃逸审计（grep 外部路径 → 必须 0 成功）；
- 更新 suite manifest / sample-pool 注册表 / 阶段报告 / charter；commit + push。
