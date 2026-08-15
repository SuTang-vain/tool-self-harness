# R4 预注册：跨模型复制 v1（DeepSeek V4）

Status: preregistered 2026-08-14，先于任何 R4 模型尝试。

## 设计

- 模型：deepseek-v4-flash（reasoning）via https://api.deepseek.com
  （OpenAI 兼容）；凭据来自 DSH 的 ~/.dsh/.credentials.yaml，不入库；
- 套件：两套 DSH 冻结套件（editing-cordis-compositions、headless-preset），
  冻结任务/grader/checker 与 GLM 基线完全一致；
- 变体：official-full / minimal / no-harness × 3 fresh repeat = 90 次尝试；
  加固 runner；种子 20260825；Gate 0 中止不计分；
- 对比基准：GLM 正式基线（editing 9/3/3 + 6/3/3；headless 9/3/3 + 6/0/1）。

## 假设（预注册）

- H1 梯度方向：四个分区均满足 official-full ≥ no-harness（方向级复制）；
- H2 先验距离跨模型：DeepSeek V4 对 DeepSeek-Harness 内容可能携带更强先验
  （同组织）；预测 headless held-out（eval-pin 为发明值，仍抵抗先验）保持强梯度，
  而 editing held-in（realm 规则）的梯度可能收窄。方向预测不做显著性主张
  （3 重复粒度对小数应已确认噪声受限）。

## 判定

- 每个分区报告：full/minimal/none 通过数、per-task 向量、方向复制（是/否）；
- 全分区方向复制 → RQ4 首批跨模型正证据；部分复制 → 按分区报告边界；
- 不因结果升级任何 E 级主张（本实验为方向级证据）。
