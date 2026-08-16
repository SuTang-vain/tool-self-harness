# Submission Checklist（投稿路径，2026-08-16）

论文：`PAPER_DRAFT_V1.md`（v1 更新至 2026-08-16）。本文件把投稿路径的
核查项、决策点与风险应对固化，供投稿前逐项销账。

## 1. Venue 选项（待用户决策）

| 候选 | 匹配点 | 注意 |
|---|---|---|
| [Agent Behavior Workshop @ COLM 2026](https://www.aclweb.org/portal/content/agent-behavior-workshop-colm-2026) | 行为测量/评估主线最贴合 | 需确认截稿与页数 |
| [Agents in the Wild: Safety, Security, and Beyond](https://agentwild-workshop.github.io/) | §2.2 基准完整性 + 逃逸审计角度 | 主线是安全，prior-distance 需压缩 |
| ICLR 2026 终身智能体 workshop（[二轮征稿](https://www.163.com/dy/article/KL14F16P05568W0A.html)） | 自演化/技能演化角度贴合 M5/Q2 门 | 中文转载源，须以官方页面核实 |
| NeurIPS 2026 workshops | 年度主战场；截至检索未见精确匹配的 agent-evaluation workshop | 持续观察 OpenReview |

决策输入：投稿人是否有目标 venue；主线定位（测量/评估 vs 自演化 vs 安全）。
建议：以 Agent Behavior @ COLM 为一选，Agents in the Wild 为备选。

## 2. 引用版本复查（2026-08-16 已完成一轮）

| 引用 | arXiv 最新状态 | 我们的引法 |
|---|---|---|
| BenchJack 2605.12673 | v1（2026-05-12） | 无需改 |
| Double Ratchet 2607.12790 | **v2**（2026-07-30） | 投稿前在引用处补注 v2 |
| Feedback Dynamics 2608.02636 | v1（2026-07-31） | 无需改 |
| Pre-Commit Gating 2608.05810 | v1（2026-08-06） | 无需改 |
| Princeton reliability 2602.16666 | **v3**（2026-06-02） | 投稿前在引用处补注 v3 |
| Cordis paradigm paper | v1 2026-08-13（repo 最后 commit 08-13） | §5.5 已带版本日期，保持 |

**投稿前须重跑本复查**（preprints 活跃修订期；节号最可能漂移的是 Cordis §1.2.2/§6.6）。

## 3. 披露定稿

§1 的披露句投稿时移至标题脚注：

> This program runs on the DeepSeek Harness, whose runtime realizes the Cordis
> paradigm paper cited in §5.5; both originate from overlapping organizations
> (DeepSeek). The correspondence in §5.5/§5.6 is descriptive and version-dated,
> not an endorsement or validation of that calculus.

待办：作者名单与机构归属由用户确认后定稿。

## 4. 页数适配（workshop 4–6 页预案）

- 主线 = prior-distance（§4 + 边界 B1–B5 + R2/R4 数据）；
- §5.5/§5.6（Cordis 对应 + 运行时实测）压缩为一段 + 附录指针；
- §6 Related Work 压缩为三组划界句；
- 淘汰候选：§3.3/§3.4 细节入附录。

## 5. 对抗性预审（进行中）

独立子代理审稿（NeurIPS 风格）已启动，输出将写入
`retrospective/adversarial-review-v1.md`；审稿重点：n=3 重复的统计表述、
E 级主张越界、主线稀释、单操作员/自指利益、引用划界诚实度、§5.5/§5.6
是否读作验证式过度声称。已知风险与预答：

| 风险 | 预答 |
|---|---|
| n=3 重复无显著性 | 论文从未声称 significance；全部数字以冻结记录引用，claim 分级 E0–E3 |
| 单操作员 + 自指 | 披露句 + 全部协议预注册 + 负结果一等化 + 可复现 runner/checkpoint |
| §5.5/§5.6 验证式读法 | 两节各带 honesty 声明（"descriptive, not validation"） |
| 主线稀释 | 页数预案已把运行时层降为附录指针 |

## 6. 决策点汇总（需用户输入）

1. 目标 venue（及截稿日期）；
2. 作者名单/机构；
3. 页数预算（workshop 4 vs 6 页）→ 决定 §5.5/§5.6 压缩程度；
4. 是否在投稿版保留运行时层（M3/M5）为正文章节还是附录。
