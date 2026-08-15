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


## 附：WP4 第一轮（效率轨）

能力轨在 h0 天花板关闭；两个单面效率候选（editing c1 裁剪 authoring-preset 34.7%、
headless c1 收紧 L0 描述 27.3%）经 3 fresh repeat 验证：Q2 完整保持（5/5 可靠、
9/9+6/6），但 Q3 方向未实现（tokens +2.7% / +16%，被尝试间方差淹没）→ 按预注册
路由入冲突矩阵，无 lineage 晋升。E1 局部零结果：<2% 内容的单面编辑在 15 次尝试
粒度下不可测效率增量；下一轮需更大编辑或方差控制设计。详见
`rounds/dsh-wp4-v1/`。


## 附：WP4 第 2 轮（大编辑效率候选）

editing-c2（整节删除 roster-service，-27.3%）首轮显示 Q2 全保持 + tokens -16.1% 并
暂入效率 lineage，但**独立复制验证（seed 20260818）未复现 Q3 方向**（-0.1% vs h0）——
按预注册标准晋升撤回，冲突矩阵记录假阳性。headless-c2（剥注释横幅，-48.5%）：
hp-05 丢 1 次（2/3）→ 硬门拒绝——**注释横幅是静默参考还原的定位路标**。核心结论：
(a) 路径 C 密度裁剪与任务结构交互（非承重散文可剪、路标性注释不可剪，Q2 级结论）；
(b) 15 次尝试粒度下 Q3 效率增量不可测——即使 27.3% 正文编辑也会被尝试间方差淹没，
效率轨后续必须采用方差控制设计。


## 附：WP4 R2（降级 h0 能力轨 — 首个能力 lineage）

预注册移除 editing 的 realm-rule 节作为 h0⁻：基线崩塌至 3/9+3/6（可靠集仅
{ec-02, ec-07}；ec-03 的影响超出预注册假设）。c1 原文恢复全过（机制对照），
**c2 浓缩改写（-44%，模板+四规则句）同样全过 → 晋升
`lineages/dsh-capability/editing-cordis-compositions/h1`（E2 局部可靠进化，受降级
基线设计限定）**。结论：承重节的有效核心小于整节，路径 C 在承重内容内部仍有
保行为的裁剪空间。h1 已本地复制（seed 20260820：9/9+6/6、5/5 可靠）；跨分布/跨模型
复制后才有 E3+ 主张。详见 `rounds/dsh-wp4-r2/`。


## 附：R3（样本池广度 — Path C 第三数据点）

独立仓库目标 `wcag-audit-patterns`（wshobson/agents，MIT）完成资格化：正式基线
held-in 11/8/8、held-out 4/4/3（full/minimal/none），锚点 wc-01（2/1/0）、
wc-05（1/1/0）；修复任务为通用知识天花板。三轮 grader 迭代沉淀纪律 D5（grader
只能要求 harness 教授的内容）。见 `rounds/wcag-audit-patterns/qualification-v1/`。


## 附：R3b（R2 跨仓库复制 — 负结果与边界条件）

wcag 上的降级能力轨未复制 R2 结论：降级效应真实但窄（wc-01 2/3→0/3、wc-05
1/3→0/3；wc-02 靠模型先验幸存），机制对照 c1 未能恢复（8/12 < h0⁻ 9/12），c2 无
可靠任务新增——两候选按预注册入冲突矩阵。**边界条件**：R2 的干净干预依赖
harness 内容抵抗模型先验（DSH 组合规则不在训练知识中）；先验覆盖的内容
（WCAG 严重度分层）效应量低于 3 重复分辨率。与 headless eval-pin 形成同一机制线：
因果效应量 = 内容与模型先验的距离。见 `rounds/wcag-audit-patterns/qualification-v1/r3b/`。


## 附：WP1 广度（Path B 独立目标）— needs-redesign + 机制线第三数据点

git-workflow-and-versioning（addyosmani/agent-skills，MIT）资格化 v1：54 次尝试后
判定 needs-redesign——六任务中四个全变体天花板（git 惯例为行业通用知识，先验覆盖），
gw-03 的 grader 状态设计与技能教义冲突。与 eval-pin、wcag 分层共同构成「先验距离」
机制线的三个数据点：效应量 = 内容与模型先验的距离。见
`rounds/git-workflow-and-versioning/qualification-v1/`。


## 附：Path B 重设计终局 — qualification-terminated-prior-covered

git-workflow v2（技能特有知识）仍无剂量反应（held-in 9/7/8）；gw-01 显示模型即使
加载技能也会把模板头「THINGS I DIDN'T TOUCH」改写为「THINGS NOT TOUCHED」。该目标
资格化终止，成为先验距离机制第四数据点；Path B 锚点维持 using-git-worktrees。


## 附：R4（跨模型复制 — RQ4 首批证据）

DeepSeek V4 flash 重跑两套 DSH 冻结套件（90 次尝试，2 逃逸尝试全被拦截）：梯度
方向四分区全部复制（editing 逐项一致；headless full≥none，no-harness 地板 5/9 高于
GLM 的 3/9）；eval-pin 对 DeepSeek 同样抵抗先验。「先验距离」获得跨模型维度：
先验地板是模型特定的。见 `rounds/r4-cross-model-v1/`。
