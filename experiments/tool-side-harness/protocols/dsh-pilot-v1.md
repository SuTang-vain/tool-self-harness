# DSH 目标难度 pilot 计划（preregistered）

Status: preregistered 2026-08-14。本计划定义两个 DSH 目标通过资格门
（`TAXONOMY_AND_4D_V1.md` §7）所需的最小观察，先于任何模型尝试冻结。

## 目标

1. 校准 fixture 难度：确认每个任务的主失败签名出现在「可测但未饱和」区间
   （禁止地板/天花板饱和；debugging 套件因 minimal 达天花板被标 needs-redesign
   的前车之鉴）。
2. 确认基线对比移动指标：至少一个 harness 变体（no-harness / minimal /
   official-full）移动 Q1 或某个预注册行为指标。
3. 在正式进化循环前确定 runner 的 L0 描述源适配。

## Runner 适配（headless-preset 目标）

runner.js 目前从 `SKILL.md` frontmatter 读 L0 描述。对组合目标：

- L0 = `preset.yml` 的 `description`（roster/picker 展示面）；
- L1 = `agent.cordis.yml` 行（agent 需显式 load 才可见——渐进式披露的 L1）；
- 实现：`config.yaml` 增加 `target.skill_entry: preset.yml`，runner 读该文件的
  `description:` 字段作为系统提示中的技能描述；`load_skill` 返回组合全文。
- editing-cordis-compositions 目标不变（`skill_entry: SKILL.md`）。

## 变体设计

- **no-harness**：系统提示不含任何目标内容（纯任务目标陈述）；
- **minimal**：仅 L0 描述；
- **official-full**：L0 + 完整正文/组合。

## Pilot 协议

- 每任务每变体 3 次 fresh repeat（GLM-5.2，同一 frozen endpoint）；
- 工作区每次全新；`input/` fixture 每次从 frozen 文件重放；
- provider/infra 失败中止不计分（Gate 0）；
- 记录：per-task pass、terminal_cause、implicated_surface、Q3 用量；
- 停止条件：任一 split 的通过率 = 0（地板）或 = 100%（天花板）→ 该任务标
  `needs-redesign`，不进正式基线；
- held-out 结果单独存盘，proposer 侧零可见。

## 资格判定

一个目标 `qualified` 当且仅当：

1. 套件哈希冻结 + verifier 隐藏（held-out 对 proposer）；
2. 主失败签名非饱和出现（0 < 失败率 < 100%）；
3. 至少一个变体对比移动 Q1 或行为指标；
4. 任务族构成与暂定难度已审计；
5. Q3 覆盖已知；
6. 类别/path 声明在候选生成前已固定（已随注册表冻结）。

任一不满足 → `needs-redesign`，不得产出进化候选。
