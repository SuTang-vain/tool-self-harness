# DSH WP4 能力轨 R2 预注册（降级 h0）

Status: preregistered 2026-08-14，先于任何 R2 模型尝试。

## 1. 动机

h0 正式基线中 editing-cordis-compositions 的 official-full 为 9/9 + 6/6 全可靠——
能力维满天花板，能力轨在自然 h0 上无失败可修复（见
`protocols/DSH_WP4_EFFICIENCY_TRACK_V1.md` 第 1 节）。本实验构造**降级基线 h0⁻**，
使能力轨在受控降级下重新可操作，检验 Self-Harness 的核心命题：
**有界单面编辑能否恢复被删除的 harness 能力，并经 Q2 硬门晋升。**

## 2. 降级构造（冻结）

h0⁻ = editing full SKILL.md 移除 `## The rule that catches people` 整节
（2304 字符，含 loose-service 规则、delegation 模板、字符串标签警告、组外消费者
警告）。该节是 ec-01（创建 isolate 组）、ec-06（生成式 realm）、ec-07（重复组删除）
的承重内容；ec-02/ec-03 的修复知识来自其他节（fixture 内可见的组结构 / native
product 模板的 `provider: spawn`）。

**先验假设（评估前冻结）**：h0⁻ 的 held-in/held-out 聚合相比 h0 显著下降，失败
集中于 ec-01、ec-06、ec-07；ec-02、ec-03 基本不受影响。

## 3. 候选（评估前冻结，各绑定一个注册 surface `realm-rule`）

| 候选 | 编辑 | 内容 | 假设 |
|---|---|---|---|
| c1-restore-realm | rewrite（原样恢复） | 原文 2304 字符 | 恢复到 h0 行为（机制对照） |
| c2-condensed-realm | rewrite（浓缩等价） | 1292 字符（-44%）：保留规则句、delegation 模板逐字、标签警告与组外警告各一句；删去 cordis_inspect 内省指导与 host-plane 工具段落 | 模板 + 核心规则句即足以恢复能力——若过门则证明等效改写可行，若不过则证明精确表述承重 |

manifest（哈希/尺寸/回归机制声明）冻结于 `rounds/dsh-wp4-r2/manifests/`。

## 4. 验证协议

- runner：加固 generic-runner；official-full；全套件 5 任务 × 3 fresh repeat；
  h0⁻ 基线与两候选并行跑（候选为 operator 预注册冻结，不消费 held-out 结果，
  满足 Gate 0 隐藏纪律）；种子 20260819；
- skill repos：`targets/editing-cordis-compositions/baselines/degraded-realm`、
  `…/candidates/c1-restore-realm`、`…/candidates/c2-condensed-realm`。

## 5. 门（以 h0⁻ 实测为基准）

- **Gate 0**：provider/infra/泄漏中止不计分；
- **Gate 1（Q2 能力硬门，reliable-task-set-v1）**：候选相对 h0⁻ 至少新增一个可靠
  任务（3/3）、不丢失任何 h0⁻ 可靠任务、held-in/held-out 聚合不下降、无关键
  verifier 回归；
- **Gate 2（Q1 分类）**：过门后分类为「局部能力恢复」（若聚合回到 h0 水平）或
  「局部能力增益」；
- **Gate 3（Q3 伴随观察）**：只记录，不作门（测量粒度结论见效率轨）；
- **Gate 4**：not_measured。

## 6. 路由

- 过门 → `lineages/dsh-capability/editing-cordis-compositions/h1`；
- 不过 → `registries/attention-conflict-matrix-v2.json`。

## Replication addendum (2026-08-14, frozen before the replication run)

Target: `lineages/dsh-capability/editing-cordis-compositions/h1` (promoted c2 content).
Independent replication of the local capability recovery:

- runner: hardened generic-runner; official-full; full suite; 3 fresh repeats;
  run id `dsh-wp4-r2-h1-repl1`; seed 20260820 (new);
- skill repo: `lineages/dsh-capability/editing-cordis-compositions/h1`;
- reference: the R2 degraded baseline h0- (3/9 + 3/6, reliable {ec-02, ec-07}) and the
  promotion run (9/9 + 6/6, 5/5 reliable).

Replication criteria (preregistered):

1. full replication: held-in 9/9 AND held-out 6/6 AND 5/5 reliable;
2. partial replication: the Q2 gate vs h0- still passes (>=1 reliable task gained,
   none lost, aggregates >= h0-) but the full recovery is not reproduced;
3. failed replication: the gate vs h0- does not pass.

Outcomes update the lineage record accordingly (replicated / replicated-partial /
replication-failed); no claim upgrade beyond E2 regardless of outcome.
