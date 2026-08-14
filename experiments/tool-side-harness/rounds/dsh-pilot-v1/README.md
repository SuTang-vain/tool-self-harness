# DSH Pilot v1 — 结果与重设计触发

Status: pilot executed 2026-08-14（glm-5.2 via Ark plan/v3，端点修正见
endpoint-amendment-2026-08-14.json）。**未产生正式基线，未产生任何进化候选**——两个套件
都退回 fixture-authoring。证据级别：E0 观察（pilot/diagnostic）。

## Pass 向量（每变体 15 次尝试 = 5 任务 × 3 重复）

| 目标 | official-full | minimal | no-harness |
|---|---|---|---|
| editing-cordis-compositions | 9/9 + 6/6 | **7/9** + 6/6 | **6/9** + 6/6 |
| headless-preset | 9/9 + 6/6 | 9/9 + 6/6 | 9/9 + 6/6 |

## 剂量反应（唯一有区分度的任务）

`editing/ec-01-realm-missing`（把发布服务的提供者+消费者包进 isolate realm 的多步重构）：

| 变体 | 通过 |
|---|---|
| official-full | 3/3 |
| minimal | 1/3 |
| no-harness | 0/3 |

其余 9 个任务在所有变体下全部 3/3（天花板饱和，无区分度）。

## 判定（按 dsh-pilot-v1.md 停止规则）

- **editing-cordis-compositions → needs-redesign-check**：held-in 有移动对比
  （full→minimal 9→7，full→none 9→6），且 ec-01 是合格锚点；但 4/5 任务与全部
  held-out 全变体饱和，不能进正式基线。
- **headless-preset → needs-redesign**：三变体结果完全平坦，所有任务全变体饱和。

## 重设计触发原因（fixture 自身缺陷，先于任何 harness 结论）

**task.md 过度指定**：两个套件任务里的 "What to produce" 小节写明了确切修复（行名、
config 字段、期望值），等价于把答案发给模型——no-harness 变体照抄即过。ec-01 之所以
仍保持区分度，是因为「包进 isolate realm」的多步 YAML 重构即使在明确指示下也足够难。

Q3 佐证：editing/minimal 每尝试 33.7K tokens / 140s（模型在 ec-01 上挣扎），
official-full 22.2K / 40s（有正文直接做对），no-harness 12.9K / 72s（其余任务速通、
ec-01 快速放弃）。

## 重设计方向（下一工作包，先冻结再执行）

1. **无解任务陈述**：task.md 只给行为目标（如「该预设必须通过挂载校验」），修复所需
   知识必须来自 harness 内容（技能正文 L1 / 组合文件 L1），而不是任务文本；
2. **组合上下文发现**：headless 任务要求从组合文件其余部分推断行形/包名/契约值，
   让 minimal 与 no-harness 因缺 L1 而失败；
3. **更难的 held-out + 行为级 grader**：挂载校验层（standingKeyFor 等价）作为
   held-out 的 verifier tier；
4. 重设计后的套件重新跑 3 变体 × 3 重复 pilot，回到同一停止规则。
