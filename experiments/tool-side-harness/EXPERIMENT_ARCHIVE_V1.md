# 实验文档索引（EXPERIMENT_ARCHIVE_V1）

Status: 2026-08-16。本文件是 DSH 自指研究程序全部实验文档的导航地图——每条记录
标注其 claim 级别与关键数字，供论文写作、审计与复现使用。所有路径相对仓库根。

## 0. 总纲

| 文档 | 内容 |
|---|---|
| `experiments/tool-side-harness/PAPER_DRAFT_V1.md` | 论文草稿 v1（本文档的上游） |
| `experiments/tool-side-harness/INTEGRATION_MEMO_CORDIS.md` | 与 Cordis 时空可组合性论文的结合性备忘录（供两篇论文引用） |
| `experiments/tool-side-harness/CORDIS_VALIDATION_CASE_STUDY.md` | 供 Cordis 论文结论引用的 validation 案例材料（temporal/spatial 两维 + 诚实条款） |
| `experiments/tool-side-harness/DSH_STAGE_REPORT_V1.md` | 阶段报告（注册→测量的全叙事） |
| `RESEARCH_CHARTER.md` | 研究纲领：RQ1–RQ4、Gate 0–4、claim 分级 E0–E5、WP1–WP6 |

## 1. 协议（preregistered，先于各自实验）

| 协议 | 要点 |
|---|---|
| `protocols/TAXONOMY_AND_4D_V1.md` / `STRUCTURAL_FEATURES_V1.md` / `PROGRESSIVE_EVOLUTION_V1.md` | 资格化与进化基线协议（既有） |
| `protocols/FIXTURE_AUTHORING_DISCIPLINE_V1.md` | D1–D5 fixture 纪律 |
| `protocols/DSH_WP4_EFFICIENCY_TRACK_V1.md` | 效率轨预注册（含两轮附记 + h1 复制附记） |
| `protocols/DSH_WP4_CAPABILITY_TRACK_R2.md` | 降级 h0 能力轨预注册（含 h1 复制附记） |
| `protocols/PRIOR_DISTANCE_MEASUREMENT_V1.md` | 先验距离测量（含 DeepSeek 与 ts-mcp 筛查附记） |

## 2. Round 记录（按时间线）

| Round | 关键数字 | Claim |
|---|---|---|
| `rounds/dsh-pilot-v1/` | 过度指定天花板（headless 全变体 9/9+6/6） | E0 |
| `rounds/dsh-pilot-v2/` | held-in 区分度 + 咨询门控（loaded_skill 0.0→0.8）+ checker 陷阱 | E0 |
| `rounds/dsh-pilot-v3/` | held-out 区分度 + 逃逸审计（38 处）+ runner 加固 | E0 |
| `rounds/dsh-formal-baseline-v1/` | editing 9/3/3+6/3/3；headless 9/3/3+6/0/1；Q4=not_measured | E0 基线 |
| `rounds/dsh-wp4-v1/` | 效率轨：Q3 不可测；h1 晋升→复制失败→撤回 | E1 |
| `rounds/dsh-wp4-r2/` | 降级能力轨：h0⁻ 3/9+3/6 → c2(−44%) 恢复 → **h1 晋升 + 本地复现** | **E2** |
| `rounds/wcag-audit-patterns/` | Path C 第三数据点合格（11/8/8 + 4/4/3；grader 三轮迭代 → D5） | E0 |
| `rounds/wcag-audit-patterns/qualification-v1/r3b/` | R2 跨仓复制：**不复制**（c1 8/12 < h0⁻ 9/12）→ 机制边界 | E1 负复制 |
| `rounds/git-workflow-and-versioning/` | 两轮套件均无剂量反应 → **资格化终止**（先验覆盖第四数据点） | E0 |
| `rounds/r4-cross-model-v1/` | DeepSeek：四分区方向复制；no-harness 地板 5/9 vs 3/9 | **E3-directional** |
| `rounds/typescript-mcp-server-generator/qualification-v1/` | ts-mcp 资格化：GLM 配额 Gate-0 abort → DeepSeek 阶段（B3c 修正锚定）；v2 结果 + RESUME_RUNBOOK | E1 |
| `registries/prior-guessability-probes-structural-v1.json`（M4） | 判断探针 3/3（drift/collision/subtyping）；structure-to-name 0/3；de-named 0/3 → **B5 去名边界** | E1 |
| `benchmarks/fiber-reversibility/`（M3） | 单插件 4/4 效果类零残留（E5 deferral）；3 条观测边界发现（静态服务目录、无死后通道、跨会话隔离对照） | E2 |
| `rounds/dsh-wp5-m5-stress-v1/`（M5 pilot） | 3 周期自演化压力：H5.1 pass 3/3、H5.2 pass（0 错误）、H5.3 RSS 不确定（A1 空闲对照修正）；M6 T1 仪表同步执行 | E2 |

## 3. Lineage 与冲突

| 记录 | 状态 |
|---|---|
| `lineages/dsh-capability/editing-cordis-compositions/h1/` | 唯一能力晋升（c2 浓缩 realm 规则），本地复现，跨仓未复制（已注） |
| `lineages/dsh-efficiency/editing-cordis-compositions/h1-efficiency/` | 撤回（复制失败 −0.1%），保留供溯源 |
| `registries/attention-conflict-matrix-v2.json` | 13 条冲突/拒绝记录（含两个假阳性与机制边界） |

## 4. 注册表

| 注册表 | 状态 |
|---|---|
| `registries/sample-pool-dsh-v1.json` | DSH 双目标：formal-baseline-complete |
| `registries/sample-pool-v2.json` | wcag qualified；gfw terminated；ts-mcp screening-passed |
| `registries/evidence-map-v2.json` | 22 条 E0–E3 证据（每条含 supports/does_not_support/boundary） |
| `registries/prior-guessability-probes-v1.json` | 8 探针电池（四目标承重项） |
| `registries/prior-guessability-probes-ts-mcp-v1.json` | 6 探针筛查电池（ts-mcp） |

## 5. 测量与校准

| 文件 | 内容 |
|---|---|
| `results/prior-guessability/glm-v1.json` + `deepseek-v1.json` | 双模型 8 探针原始结果 |
| `results/prior-guessability/calibration-2026-08-14.json` | GLM 校准：6/8 对一致 + 边界 B1/B2 |
| `results/prior-guessability/calibration-deepseek-2026-08-14.json` | DeepSeek 校准：4/4 内模型一致；H1 支持/H2 拒绝/H3 支持 |
| `results/prior-guessability/tsmcp-screening-2026-08-14.json` | ts-mcp 筛查：pilot-worthy-targeted + 冻结预测 |
| `registries/prior-guessability-probes-ts-mcp-v2-context.json` | ts-mcp v2 上下文探针（B3c 锚定修正后） |
| `registries/prior-guessability-probes-structural-v1.json` | 结构链接探针（M4；见 §2 行） |

## 6. 工具与代码

| 文件 | 作用 |
|---|---|
| `scripts/lib/generic-runner.js` | 加固 runner（preset.yml 入口 + run_command 隔离 + HOME 拒绝） |
| `scripts/lib/yaml-surface.js` | composition 行级单面定界 |
| `scripts/18-probe-prior-guessability.js` | 探针电池运行器（无工具单发 + 确定性评分） |
| `experiments/tool-side-harness/self-check-dsh.sh` | 套件判别自检（broken 必挂/reference 必过/checker 行为） |

## 7. 机制线速查（论文 §4 的引用底座）

先验距离四数据点：eval-pin（发明值）→ R2 realm 规则（抵抗）→ wcag 分层（部分
覆盖）→ git 惯例（完全覆盖）+ 模板释义化。跨模型维度：R4 地板差异 + DeepSeek
校准 H1（commit 格式 G 0.33→1.0）。测量层：协议 + 电池 + 双模型校准 + 事前门
实战（ts-mcp）。运行时层（M3–M6）：纤维可逆性实测零残留 → 3 周期压力零退化
（RSS 待对照）→ T1 仪表可用、T2 设计冻结。

## 8. 未决事项（明确登记的边界，每条均已关闭为带路径的计划）

| 线程 | 关闭方式 | 路径 |
|---|---|---|
| ts-mcp held-in 重设计 | 计划入 round README | 按 B4：锚定迭代不可补偿的条目 + 迭代反馈中性化 |
| GLM 交叉对照 | pending | `RESUME_RUNBOOK.md`（08-17 配额重置触发） |
| Q3 方差控制 | 协议冻结 | `protocols/Q3_VARIANCE_CONTROL_DESIGN.md` |
| Q4 人评 | 协议冻结 | `protocols/Q4_MINI_PROTOCOL.md` |
| RQ2 确认性主张 / Path B 第二锚点 / 第三模型 | 入场条件登记 | 对应 round 记录 |
| M5 Full（8 周期 + A1 空闲对照，多会话 → E3） | 入场条件登记 | `protocols/DSH_WP5_SELF_EVOLUTION_STRESS_V1.md` + `rounds/dsh-wp5-m5-stress-v1/` |
| M6 T2 产品实现（效果账本 + OS 级探针隔离） | 设计冻结为 §T2 | `protocols/DSH_WP6_INTEGRITY_TRACK_V1.md`（需上游评审） |
