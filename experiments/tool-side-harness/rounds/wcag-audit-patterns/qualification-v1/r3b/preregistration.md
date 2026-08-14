# R3b 预注册：wcag 降级 h0 能力轨（R2 跨仓库复制）

Status: preregistered 2026-08-14，先于任何 R3b 模型尝试。

## 1. 动机

R2 在 editing-cordis-compositions（DSH 仓库）上建立了「降级 → 有界单面编辑 →
Q2 硬门恢复」的能力进化结论（h1，本地复现）。本实验在 **独立仓库** 的
wcag-audit-patterns 上复制同一设计，检验该结论的跨仓库可复制性；同时产出
Path C 承重内容在第三个数据点上的因果证据。

## 2. 降级构造（冻结）

h0⁻ = wcag full SKILL.md 移除 `### 3. Common Violations by Impact` 子节
（458 字符，审计任务分层知识的唯一出处）。L2（references/details.md）保留。

**先验假设**：审计任务（wc-01/02/05）崩塌；修复任务（wc-03/04/06）基本不受
影响（其修复知识在 L2 与通用前端知识中）。

## 3. 候选（评估前冻结，绑定 surface `core-concepts`）

| 候选 | 编辑 | 假设 |
|---|---|---|
| c1-restore-core | rewrite（原样恢复） | 恢复到 h0 行为（机制对照） |
| c2-condensed-tiers | rewrite（任务相关子集，458→243 字符：Critical=alt/labels；Serious=title/widgets 无键盘；Moderate=lang/heading） | 只有冻结任务实际用到的违规项承重；未用条目（autoplay、skip links、contrast、landmarks、unclear links）可删 |

## 4. 验证与门（同 R2）

official-full × 全套件 6 任务 × 3 fresh repeat，加固 runner，种子 20260822，
h0⁻/c1/c2 串行跑（端点稳定性）。Gate 1 = reliable-task-set 以 h0⁻ 实测为基准：
至少新增一个可靠任务、零丢失、held-in/held-out 聚合不降。过门 →
`lineages/dsh-capability/wcag-audit-patterns/h1`；不过 → 冲突矩阵。

## 5. 复制判定（预注册）

- **完全复制**：h0⁻ 崩塌 + c1 恢复 + c2 过门（与 R2 三结论一致）；
- **部分复制**：h0⁻ 崩塌 + c1 恢复，但 c2 不过门（任务相关子集不足以恢复——
  跨仓库时承重粒度不同）；
- **不复制**：h0⁻ 崩塌不成立或 c1 未恢复。
