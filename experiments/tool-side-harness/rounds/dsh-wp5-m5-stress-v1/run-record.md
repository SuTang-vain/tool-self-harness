# DSH WP5/WP6 — M5 Self-Evolution Stress Pilot v1（3 周期，2026-08-16）

协议：`protocols/DSH_WP5_SELF_EVOLUTION_STRESS_V1.md`（M5）与
`protocols/DSH_WP6_INTEGRITY_TRACK_V1.md`（M6 T1 仪表）。
执行环境：真实 DSH 进程（PID 23048, `dsh web`）；审批弹窗禁用 →
周期插件全部 host-only（客户端 Slot 类沿用 M3 deferral，本 pilot 不触客户端注册表）。

## 基线

tools 35 / service 目录 55 键 / plugins [] / 客户端 `tool.view.cordis`
占用者 `dyn/evdsh-2`（跨会话对照，本 pilot 未触碰客户端注册表）。
OS t0：RSS 227728 KB、VSZ 424263840 KB、fd 52（线程未采，首采于周期 1 末 = 14）。

## 周期数据

| 周期 | 插件（pkg/run） | 存活读数（uptime_ms/lf/ticks/svc） | update 后读数 | 周期末快照 |
|---|---|---|---|---|
| C1 | strsa-5 pkg-10 run-10 → pkg-12 run-12；strsb-6 pkg-11 run-11 | 11996/2/23/1（B: lf=1） | 12540/1/25/1 | tools 35, plugins [], RSS 252240, fd 56, thr 14 |
| C2 | strsc-7 pkg-13 run-13 → pkg-15 run-15；strsd-8 pkg-14 run-14 | 12875/2/25/1（B: lf=1） | 16677/1/33/1 | tools 35, plugins [], RSS 294336, fd 53, thr 14 |
| C3 | strse-9 pkg-16 run-16 → pkg-18 run-18；strsf-10 pkg-17 run-17 | 4620/2/9/1（B: lf=1） | 14296/1/28/1 | tools 35, plugins [], RSS 1340416, fd 57, thr 14 |

生命周期操作全部干净：6 define / 6 run / 3 update / 6 stop / 6 undefine，0 错误。

## 判定

- **H5.1 pass 3/3**：每周期末注册表维度与基线逐项一致（tools 35、无探针名、
  plugins []）。探针工具消失为直接观测。
- **H5.2 pass**：跨 3 周期 0 生命周期错误，无错误累积。
- **H5.3 不确定（RSS 维度）**：RSS 采样 227728 → 252240 → 294336 → 1340416 KB
  单调上升，但与会话环境负载混淆——pilot 开始前 `ps aux` 即显示过 1.57 GB，
  对话/工具输出的累积与 V8 堆摆动在 ±1 GB 量级，无法归因到插件生命周期。
  fd 52→57 平稳、线程恒 14，无泄漏信号。
  → **Full-run 修正 A1**：每周期前后各加一次空闲对照采样（不执行任何插件操作，
  仅等量时间），把环境漂移与周期归因增长分离。

## M6 T1 仪表验证

注册表探针（Inspect）+ 进程资源探针（ps/lsof）端到端可用；pilot 规模的泄漏判据
= 注册表还原 + fd/线程平稳（pass），RSS 需 A1 对照后才有判定力。

## Claim level

E2（3 周期行为压力证据）。Full（8 周期、多会话、含 A1 对照）→ E3，
续跑入口：本文件 + 两份协议；驱动机制按协议（新鲜轮次，Ralph 工具仅在用户显式要求时启用）。

机器可读摘要：`results-v1.json`（同目录）。
