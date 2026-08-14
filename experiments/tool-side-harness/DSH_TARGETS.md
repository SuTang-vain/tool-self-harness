# DSH 目标预注册声明与 pilot 计划

Status: preregistered 2026-08-14（先于任何 held-in 失败观察）。本目录把 DeepSeek
Harness 自身注册为 tool-side-harness 研究的目标——「harness 研究 harness」闭环。

## 声明内容

两个目标按 `TAXONOMY_AND_4D_V1.md` 注册单元要求预注册：

1. **editing-cordis-compositions**（knowledge-rule-policy / C-density-pruning）
   —— 随 cordis（创造模式）预设发布的组合创作技能。Path C 第二数据点。
2. **headless-preset**（atomic-validation / A-interface-constraint）
   —— headless-agent 组合文件本身。第一个以「组合文件」为分析单元的目标：
   L0 = preset.yml description，L1 = composition 行，L2 = 无。

注册表：`registries/sample-pool-dsh-v1.json`（含冻结特征向量）。**不修改**
已冻结的 `sample-pool-v2.json`（frozen_at 2026-08-03）——那是 wave-1 的历史记录。

## 目录布局（与仓库约定对齐）

```
targets/<id>/{full/, surfaces.json, SOURCE.json}   # full/ 为沙箱副本，shipped 原文件只读
tasks/<id>/{held-in,held-out,_shared,suit-manifest.json}
registries/sample-pool-dsh-v1.json
patches/yaml-surface.js                           # patch.js 的 yaml-row surface 扩展
protocols/dsh-pilot-v1.md                         # 本 pilot 计划
```

## 落库动作（人工确认后执行）

1. `cp -r` 本包 `targets/`、`tasks/`、`registries/sample-pool-dsh-v1.json` 到
   `experiments/tool-side-harness/` 对应位置（新文件，不覆盖任何已冻结产物）；
2. 把 `patches/yaml-surface.js` 接入 `scripts/lib/patch.js`（仅新增 surface 类型
   分发，不改既有类型）；
3. 在 `config.yaml` 之外为 headless-preset 目标准备 entry 描述源：runner 的 L0
   读取 `preset.yml` 的 description（见 pilot 计划的 runner 适配）；
4. 提交为一个独立 commit，标注 preregistered。

## 纪律（冻结不变）

- held-out fixture 对任何 proposer / weakness miner 不可见；
- 每个任务正式资格化 ≥3 次 fresh repeat，新工作区 + 新模型调用；
- 结构特征向量先于结果冻结（已冻结于注册表，不得回改）；
- claim 上限：单目标 = 局部观察（E0–E2）；类别级断言需全样本池 + 独立复现；
- 仓库聚类必须报告：两个 DSH 目标共享源码仓库，彼此不是独立类别复本。

## 进度（2026-08-14 更新）

- 注册 ✅（本文件，特征向量冻结）
- pilot v1 ✅（过度指定天花板 → 重设计）— `rounds/dsh-pilot-v1`
- pilot v2 ✅（held-in 区分度 + 两项诊断发现）— `rounds/dsh-pilot-v2`
- pilot v3 ✅（held-out 区分度 + 工作区完整性加固）— `rounds/dsh-pilot-v3`
- 正式 4D 基线 ✅ — `rounds/dsh-formal-baseline-v1`
- 阶段报告：`DSH_STAGE_REPORT_V1.md`
- 状态：两目标 formal-baseline-complete；下一步 WP4 类别条件进化。
