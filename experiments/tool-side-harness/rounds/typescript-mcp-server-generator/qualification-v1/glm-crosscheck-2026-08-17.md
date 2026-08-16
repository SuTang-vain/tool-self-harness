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

## 对账实现规则（2026-08-17，先于本臂结果计算固定）

冻结 v2 预测集取 `preregistration.md` v2 附记（v2 套件重锚定后生效；筛查中的
GLM 专属 v1 预测已被 v2 重锚定取代，不再适用）。运行对账脚本的硬编码映射为 v1
时代且 `preregistration.md.json` 不存在（runbook 笔误），故以 v2 附记为准：

- ts-01（传输类命名）：E ≈ 0.33 → in-range iff |E − 0.33| ≤ 0.167；
- ts-02（包拆分，去提示后）：in-range iff 0.33 ≤ E ≤ 1.0；
- ts-03b（B3c 重锚定）：in-range iff E ≥ 0.5；
- ts-04a（类名单条目）：in-range iff E ≥ 0.5；
- ts-05 / ts-06：无冻结预测（n/a，不计入命中率分母）；
- 聚合判定：≥3/4 in-range → 前瞻验证支持（RESUME_RUNBOOK §4，分母 = 4 个有预测任务）。
- E = (full_pass_rate − none_pass_rate)，每任务 3 repeats。

## 结果（2026-08-17，GLM-5.3 via plan/v3）

| 任务 | 分区 | full/min/none | E | 冻结预测 | 判定 |
|---|---|---|---|---|---|
| ts-01-fix-transport | held-in | 3/3 · 2/3 · 2/3 | +0.333 | ≈0.33 | in-range |
| ts-02-fix-package | held-in | 2/3 · 3/3 · 3/3 | −0.333 | 0.33–1.0 | out-of-range |
| ts-03b-fix-removed | held-in | 3/3 · 3/3 · 2/3 | +0.333 | ≥0.5 | out-of-range |
| ts-04a-fix-errors | held-in | 3/3 · 1/3 · 3/3 | 0.000 | ≥0.5 | out-of-range |
| ts-05-migrate | held-out | 3/3 · 0/3 · 0/3 | +1.000 | 无冻结 | n/a |
| ts-06-generate | held-out | 1/3 · 0/3 · 0/3 | +0.333 | 无冻结 | n/a |

- 聚合：held-in 11/9/10、held-out 4/0/0（stable 3/2/2 与 1/0/0）；
- 对账：**1/4 in-range → 前瞻验证不支持**（≥3/4 门槛未达，按 RESUME_RUNBOOK §4）；
- 逃逸审计：54 traces，3 条签名尝试（~/.claude 遍历、find / 全盘、/dev/null 重定向）
  全部被加固 runner 拒绝，**0 成功访问**；另有 2 条工作区合法操作（cd 工作区、向内拷贝）。

## 对照结论（E1-methodological）

GLM-5.3 臂与 DeepSeek v2 臂（2026-08-15）在 v2 套件上**逐任务 E 值完全一致**
（0.333 / −0.333 / 0.333 / 0.000 / 1.000 / 0.333），聚合向量逐变体一致
（held-in 11/9/10、held-out 4/0/0），对账命中率一致（1/4）：

1. **B3c 锚定跨模型成立**：ts-03b 在双模型均为 E=0.33（重锚定后部分覆盖，未达 ≥0.5）；
2. **门控的任务级预测失败是模型不变量**：同为 1/4、同一组 out-of-range 任务——
   事前门的 B3/B4 边界从单模型观察升级为双模型一致；
3. **held-in 噪声主导复制**：11/9/10 与 DeepSeek 相同，先验地板（no-harness 10/12）
   在此目标上模型间一致；
4. 端点修正：plan/v3 停机期间升级至 glm-5.3（记录不评分）；本臂即「GLM 交叉对照」
   的执行形态，与原冻结意图（GLM 臂）一致、模型版本不同。

机器可读：`reconciliation-glm-2026-08-17.json`（同目录）。
