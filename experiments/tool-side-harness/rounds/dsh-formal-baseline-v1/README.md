# DSH 正式 4D 基线 v1

Status: formal baseline executed 2026-08-14（加固 runner、全新工作区与模型调用、
种子 20260815、每任务每变体 3 次 fresh repeat、90 次尝试）。证据级别：E0 基线观察。

## 基线向量 V(h0)（Q1 通过数 / Q2 可靠任务集 / Q4 = not_measured）

| 目标 | official-full | minimal | no-harness |
|---|---|---|---|
| editing held-in | 9/9（可靠 3/3） | 3/9（可靠 1/3） | 3/9（可靠 1/3） |
| editing held-out | 6/6（可靠 2/2） | 3/6（可靠 1/2） | 3/6（可靠 1/2） |
| headless held-in | 9/9（可靠 3/3） | 3/9（可靠 1/3） | 3/9（可靠 1/3） |
| headless held-out | 6/6（可靠 2/2） | 0/6（可靠 0/2） | 0/6（可靠 0/2） |

每变体完整 Q3 指标与 per-task 明细见 `baseline-4d-2026-08-14.json`。

## 基线对照（harness 剂量效应，全部非饱和）

- editing held-in：9/9 → 3/9 → 3/9（锚点 ec-01、ec-03 为 3/3→0/3→0/3；ec-02 全变体
  3/3 保持为通用可解任务）
- editing held-out：6/6 → 3/6 → 3/6（锚点 ec-06）
- headless held-in：9/9 → 3/9 → 3/9（锚点 hp-01、hp-03；本基线 official-full 的
  hp-01 达到 3/3，v2b 的 2/3 为模型方差）
- headless held-out：6/6 → 0/6 → 0/6（锚点 hp-04、hp-05 静默参考还原，修复值仅存在于
  eval-pin 非标准参考）

## 完整性事件（补记）

正式基线中发现一次成功的 `run_command` 逃逸绕过：no-harness 的 hp-05 rep-0 用
`$HOME` 变量拼装路径绕过了绝对路径令牌扫描并读到 reference.sh。处理：runner 增补
HOME 引用拒绝；该单元（hp-05 no-harness × 3）在加固后重跑为 0/3（run id
dsh-baseline-headless-v1b）。基线内其余 89 次尝试经 trace 审计无成功逃逸（10 次
尝试被隔离拦截）。仍遵守既定立场：隔离是研究完整性边界，不是对恶意本地进程的
安全沙箱。

## 判定

两个 DSH 目标在正式基线阶段达标：完整冻结套件、非饱和失败签名、全部四个分区的
移动对比、Q2 可靠任务集可用作进化门、Q3 覆盖、Q4 按预注册 not_measured。下一步为
WP4：类别条件进化（单面定界候选 + Q2 硬门 + lineage）。
