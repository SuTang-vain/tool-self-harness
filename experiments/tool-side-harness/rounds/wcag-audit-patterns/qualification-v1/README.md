# wcag-audit-patterns 资格化（R3）

Status: 2026-08-14，qualified-formal-baseline（54 次尝试，加固 runner，0 逃逸）。

## 结果

| 变体 | held-in | held-out |
|---|---|---|
| official-full | 11/12（可靠 3/4） | 4/6（可靠 1/2） |
| minimal | 8/12（可靠 2/4） | 4/6（可靠 1/2） |
| no-harness | 8/12（可靠 2/4） | 3/6（可靠 1/2） |

剂量反应锚点：wc-01（2/3→1/3→0/3）、wc-05（1/3→1/3→0/3）；wc-02 非单调但
full 显著高于 minimal（3/3 vs 1/3）。修复任务（wc-03/04/06）全变体天花板——通用
前端知识即可修复，作为非区分观察保留。

## 三个 fixture 迭代（全部入档）

1. v1：grader 要求技能从未教过的合成键名 → 审计任务全挂（D5 教训，已入纪律文档）；
2. v2：tier_exclusive 跨节惩罚误伤高质量报告（remediation 示例重复关键词）；
3. v3：正向层级放置检查 → 审计任务的 harness 剂量反应浮现。

## 定位

Path C 第三数据点（独立仓库 wshobson/agents；前两个：security-review 安全边界、
editing-cordis-compositions）。主张 E0 基线观察；类别级结论需全样本池 + 独立复现。
