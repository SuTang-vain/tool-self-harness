# R3 预注册：wcag-audit-patterns 资格化

Status: preregistered 2026-08-14，先于任何模型尝试。

## 1. 目标与定位

- 目标：`wcag-audit-patterns`（wshobson/agents，MIT，commit
  c4b82b0ad771190355eb8e204b1329732a18449a，skill sha 与冻结注册表一致）；
- 类别：knowledge-rule-policy / C-density-pruning —— **Path C 第三数据点**
  （前两个：security-review 安全边界、editing-cordis-compositions 已合格）；
  仓库独立于 DSH 与 obra/addyosmani，满足类别复本的独立性要求；
- 渐进结构：L0 = frontmatter 描述；L1 = SKILL.md 正文（违规分层清单）；
  L2 = references/details.md（完整检查清单与示例，9972 字节）。

## 2. 套件（4 held-in + 2 held-out，评估前冻结）

- 审计任务（wc-01/02/05）：产出 audit.md，grader 校验**发现键 + 严重度分层
  归属**——分层知识仅存在于 L1/L2（harness 承重）；
- 修复任务（wc-03/04/06）：修复 page.html，grader 校验 a11y 规则违规清零；
  wc-04 含 L2 细节（表头 th、链接文本）；
- 纪律：任务文本不含修复（D1）；任务指示咨询 harness（D2）；agent-facing
  checker 只报违规/格式不报修复（D3）；fixture 哈希冻结。

## 3. Pilot 协议（与 DSH 目标一致）

3 变体（no-harness / minimal / official-full）× 3 fresh repeat × 6 任务 =
54 次尝试；加固 runner；种子记录；Gate 0 中止不计分；held-out 对 proposer 隐藏
（本阶段无 propose，operator 预注册候选）。

## 4. 停止规则与判定

- 任一任务全变体地板/天花板饱和 → 该任务 needs-redesign；
- 至少一个变体对比在 held-in 与 held-out 均移动 → qualification-candidate；
- 全部平坦 → needs-redesign（回 fixture-authoring）。

## 5. 主张边界

资格化结果最高为 E0 基线观察；类别级主张需 RQ2 的独立复现；单模型（GLM-5.2
via Ark plan/v3）。
