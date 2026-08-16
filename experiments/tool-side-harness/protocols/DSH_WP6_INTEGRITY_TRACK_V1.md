# DSH WP6 · 运行时完整性跟踪 V1（M6）

Status: 2026-08-16 预注册冻结（设计 + T1 执行协议）。对应 Cordis 论文 §6.7
（runtime-guaranteed integrity / 语言-OS 共设计）的程序级对应物。

## 两层交付

- **T1 原型仪表（本程序执行）**：把 M3 的三条观测边界发现转成可运行仪表——
  1) 注册表探针：Inspect 通道（Tool / Service / plugins / Slots）作为 fiber 效果登记表的读侧；
  2) 进程资源探针：DSH 宿主进程 RSS / VSZ / 线程 / fd 的周期边界采样
     （macOS: ps + lsof；Linux 部署可换 /proc）；
  3) 泄漏判据：资源轨迹单调性 + 周期末注册表还原。
  T1 数据源 = M5 压力周期（协议见 DSH_WP5_SELF_EVOLUTION_STRESS_V1）。
- **T2 产品级工程设计（文档交付，不在本程序实现）**：动态插件运行时内置
  「效果账本」——per-plugin 登记 tool/service/listener/timer/slot/RPC-handle 的
  注册与 disposer 配对，stop 时做 expected==actual 校验，泄漏即在 stop 审计中报错；
  加上 OS 级探针隔离（插件代码运行于可度量子进程/探针上下文的规范）。
  T2 设计要点与入口条件记录在本协议 §T2。

## T1 判定

- 每个 M5 周期末：注册表逐项还原（复用 H5.1）+ 资源采样无单调增长（复用 H5.3）。
- 观测边界升级项（如可行）：用工具见证通道把 listener/timer 的死后状态转为可观测；
  若实现成功，M3 对 E3/E4 的机制推断升级为直接观测。

## §T2 设计要点（入口条件，未实现）

1. 效果账本 API：`ctx.effect` 包装器在注册时记账（类别、key、disposer），
   stop 审计输出 {registered, disposed, leaked}；leaked>0 视为 stop 失败。
2. 诊断面：Inspect 增加 `Fiber.listFiberEffects(pluginId)` 读侧，
   弥补 M3 发现 2（listener/timer 无死后通道）。
3. OS 级探针隔离：插件宿主进程与其探针进程分离，资源归属可归因到 pluginId。
4. 入口条件：产品级 DSH 代码库内实现，需上游评审；本程序只交付设计。

## Claim level

T1: E2；T2: 设计文档（E0-methodological），实现列为 future work。
