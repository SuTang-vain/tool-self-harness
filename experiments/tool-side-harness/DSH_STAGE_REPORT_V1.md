# DSH 自指目标阶段性研究报告（v1）

Status: 阶段报告 2026-08-14。覆盖从目标注册到正式 4D 基线的全部阶段；全部证据为
E0 级别观察，未生成任何进化候选。所有数字引用 `rounds/dsh-pilot-v1..v3` 与
`rounds/dsh-formal-baseline-v1` 的冻结记录。

## 1. 目标与方法

**研究问题**：Self-Harness 能否应用于 DeepSeek Harness 自身？把 DSH 的 agent preset
与随附技能注册为 tool-side-harness 研究的「工具侧 harness」目标，实现
「harness 研究 harness」的闭环。

**注册目标**（`registries/sample-pool-dsh-v1.json`，特征向量先于结果冻结）：

| 目标 | 类别 / 拟合路径 | 分析单元 |
|---|---|---|
| editing-cordis-compositions | knowledge-rule-policy / C-density-pruning（Path C 第二数据点） | SKILL.md（L0 描述 → L1 正文） |
| headless-preset | atomic-validation / A-interface-constraint | 组合文件（L0 = preset.yml 描述 → L1 = 行） |

**方法**：每套件 5 个冻结任务（3 held-in + 2 held-out），确定性结构化 grader +
任务内 contract checker；3 变体（official-full / minimal / no-harness）× 3 fresh
repeat；模型 glm-5.2 via Volcengine Ark（coding/v3 配额耗尽后经协议持有人授权轮换到
plan/v3，端点修正已记录）。四轮累计约 380 次模型尝试。

## 2. 阶段进展

### 阶段 1：注册（E0 预注册）

两目标注册、surface 注册表、结构特征向量冻结、grader 与 10 个 fixture 冻结，
`12-validate-tool-side-suite.js` 结构审计（untouched 必挂 / reference 必过）全绿。

### 阶段 2：pilot v1 —— 过度指定天花板

headless 套件三变体全部 9/9 + 6/6：task.md 的「What to produce」把确切修复写进了
任务文本，harness 内容对通过概率零贡献。唯一例外 ec-01（多步 realm 重构）即使
指明修复也保持 3/3→1/3→0/3 的剂量反应——由此得到第一课：**区分度来自结构复杂度，
而不是知识保密**。

### 阶段 3：pilot v2 —— held-in 恢复区分度

去答案化 + contract checker + harness 咨询指引后：

- 诊断发现 1：**harness 内容只在任务点名时被消费**——headless official-full 的
  `loaded_skill_rate` 无指引时 0.0，加指引后 0.8，held-in 相应 3/9 → 8/9；
- 诊断发现 2：**checker 反馈陷阱**——只给界值约束时模型停在任意界内值（hp-03 全部
  停在 0.9）；checker 指向参考后 3/3；
- held-in 剂量反应建立（清洗后）：editing 9/9→3/9→3/9（锚点 ec-01、ec-03），
  headless 8/9→3/9→3/9（锚点 hp-01、hp-03）。

### 阶段 4：pilot v3 —— held-out 重设计 + 完整性加固

held-out 两轮重设计后实现区分：editing 换为**生成式修复**（无现成组可挪：创建
isolate realm / 删除重复组）；headless 换为**静默参考还原**（冻结组合新增非标准
`eval-pin` 行，修复值仅存在于参考 body，模型先验不可猜）。

完整性事件（Gate 0）：trace 审计发现 agents 通过 `run_command` 真实 shell 以绝对
路径逃逸工作区、读取参考/评分文件（pilot 中 38 处确认访问；headless v3c minimal
的 6/6 是逃逸假象）。修复：runner 拒绝工作区外绝对路径、父目录穿越、`~` 与
`$HOME` 引用（研究完整性边界，非安全沙箱——基线中仍抓到一次 `$HOME` 变量拼装
绕过，补拒后单元重跑）。全部污染单元在加固 runner 下重跑。

### 阶段 5：正式 4D 基线

完整冻结套件 × 3 变体 × 3 fresh repeat（90 次尝试 + 1 个补跑单元），加固 runner：

| 目标 | official-full | minimal | no-harness |
|---|---|---|---|
| editing held-in | 9/9（可靠 3/3） | 3/9（可靠 1/3） | 3/9（可靠 1/3） |
| editing held-out | 6/6（可靠 2/2） | 3/6（可靠 1/2） | 3/6（可靠 1/2） |
| headless held-in | 9/9（可靠 3/3） | 3/9（可靠 1/3） | 3/9（可靠 1/3） |
| headless held-out | 6/6（可靠 2/2） | 0/6（可靠 0/2） | 0/6（可靠 0/2） |

Q3 用量指标按变体入档；Q4 = not_measured（按预注册）。

## 3. 方法学产出（冻结）

1. `protocols/FIXTURE_AUTHORING_DISCIPLINE_V1.md`：D1 任务文本不得含修复；D2 任务
   必须指示咨询 harness；D3 checker 不得制造反馈陷阱；D4 剂量反应非饱和方可入基线。
2. 工作区完整性是 runner 属性而非 prompt 属性：held-out 隐藏必须在 runner 层强制
   （`rounds/dsh-pilot-v3/integrity-finding-2026-08-14.json`，charter 第 10 条）。
3. 参考值非标准化：可被模型先验猜中的「标准默认值」无法测 harness 泛化
   （headless eval-pin 重冻结）。

## 4. 结论与下一步

- 两个 DSH 目标完成注册 → pilot → **formal-baseline-complete** 全链路，四个分区
  全部具备非饱和的变体对比，可靠任务集已冻结供 Q2 硬门使用；
- 主张纪律：全部 E0 观察；类别级主张需样本池其余目标 + 独立复现；
- 下一步 WP4：类别条件进化——每个合格目标跑一条单面定界 lineage（候选 manifest
  冻结 → 3 重复全量验证 → Q2 硬门 → 接受/拒绝入 lineage）。
