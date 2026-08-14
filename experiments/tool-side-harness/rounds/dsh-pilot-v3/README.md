# DSH Pilot v3 — held-out 重设计与完整性修正后的最终结果

Status: pilot v3 executed 2026-08-14。本轮的产出有两层：(1) held-out 按
FIXTURE_AUTHORING_DISCIPLINE_V1 重设计后，四个分区全部具备区分度；(2) 审计发现
run_command 工作区逃逸污染了部分历史单元，runner 已加固、污染单元已重跑。

## 最终干净向量（每格 = held-in + held-out，15 次尝试）

| 目标 | official-full | minimal | no-harness |
|---|---|---|---|
| editing-cordis-compositions | 9/9 + 6/6 | **3/9** + 3/6 | **3/9** + 3/6 |
| headless-preset | **8/9** + 6/6 | **3/9** + **0/6** | **3/9** + **1/6** |

剂量反应锚点：editing ec-01/ec-03/ec-06（3/3→0/3→0/3）；headless hp-01/hp-03
（3/3→0/3→0/3）、hp-04/hp-05（3/3→0/3→0~1/3）。ec-02、ec-07、hp-02 保持全变体
天花板（通用可解任务，作为非区分观察保留）。

## 完整性事件（Gate 0）

trace 审计发现 agents 通过 `run_command` 的真实 shell 用绝对路径读取工作区外的
参考/评分文件（v3c headless held-out minimal/no-harness 的 6/6 是逃逸假象，v2/v2b
的少量 minimal 单元同样受影响）。修复：runner 现在拒绝 home 展开、父目录穿越与
工作区外绝对路径（研究完整性边界，非安全沙箱）；污染单元全部在加固 runner 下重跑
（run ids 后缀 h/ch）。干净审计与修正表见 `integrity-finding-2026-08-14.json` 和
`pilot-results-2026-08-14.json` 的 corrections 节。

## 判定

两个 DSH 目标均达到 pilot 阶段资格标准（冻结哈希、非饱和失败签名、四个分区的
移动对比、Q3 覆盖、类别/path 声明固定）→ **pilot-qualified**。下一步是正式 4D
基线（完整冻结套件、加固 runner、每任务每变体 3 次 fresh repeat），之后才进入
WP4 的类别条件进化。
