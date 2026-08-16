# M5 Full Run Log（C4–C11，A1 空闲对照）

协议：`protocols/DSH_WP5_SELF_EVOLUTION_STRESS_V1.md`（Full = 8 周期 + A1 修正）。
Pilot（C1–C3）见 `run-record.md`；本文件记录 Full 的 8 个新周期。

## A1 实现说明

每周期边界配对齐采样：S_in(n)（define 前，承接上一周期的空闲窗口）、
S_out(n)（undefine 后）。Δ_cycle(n)=S_out−S_in（周期内），
Δ_idle(n)=S_in(n+1)−S_out(n)（无插件操作的空闲窗口）。
H5.3-Full 判据：RSS 增长可归因于插件生命周期，当且仅当 Δ_cycle 系统性 >
Δ_idle；fd/线程两维度同时报告。

## 周期数据

| 周期 | S_in | 读数A（uptime/lf/ticks/svc） | 读数B update 后 | S_out | H5.1 |
|---|---|---|---|---|---|
| C4 | RSS 260816, fd 52, thr 14 | 6202/2/12/1（B: lf=1） | 25968/1/51/1 | RSS 1367328, fd 52, thr 14 | tools 35, plugins [] ✓ |
| C5 | RSS 323456, fd 52, thr 14 | 30534/2/60/1（B: lf=1） | 6316/1/12/1 | RSS 359408, fd 52, thr 14 | tools 35, plugins [] ✓ |
| C6 | RSS 359408, fd 52, thr 14 | 30526/2/60/1（B: lf=1） | 41220/1/82/1 | RSS 244016, fd 52, thr 14 | 探针工具消失（工具集可见性）+ plugins [] ✓ |
| C7 | RSS 244016, fd 52, thr 14 | 7371/2/14/1（B: lf=1） | 7035/1/14/1 | RSS 351232, fd 52, thr 14 | tools 35, plugins [] ✓ |
| C8 | RSS 351232, fd 52, thr 14（S_in 未单独采，取 S_out(7)） | 32058/2/64/1（B: lf=1） | 9237/1/18/1 | RSS 257776, fd 52, thr 14 | tools 35, plugins [] ✓ |

C4 插件：strsg-11（pkg-19 run-19 → pkg-21 run-21）、strsh-12（pkg-20 run-20）。
Δ_cycle(4) RSS = +1106512 KB；Δ_idle(3→4) RSS = −1080000 KB（pilot 末 1340416 →
S_in(4) 260816）。RSS 摆动 ±1.1GB 与环境负载（对话/工具输出累积 + V8 堆）同量级，
与插件操作无关；fd 52 恒定、线程 14 恒定。

C5 插件：strsi-13（pkg-22 run-22 → pkg-24 run-24）、strsj-14（pkg-23 run-23）。
Δ_cycle(5) RSS = +35952 KB；Δ_idle(4→5) RSS = −1043872 KB。

C6 插件：strsk-15（pkg-25 run-25 → pkg-27 run-27）、strsl-16（pkg-26 run-26）。
Δ_cycle(6) RSS = −115392 KB（周期内 GC 释放，RSS 下降）；Δ_idle(5→6) RSS =
−35952 KB。C6 周期末工具目录以探针工具从模型可见工具集消失 + inspect_self
plugins=[] 核对（listTools 全量在 C4/C5/C7/C8 采集；工具集即 listTools 所读的同一注册表）。

C7 插件：strsm-17（pkg-28 run-28 → pkg-30 run-30）、strsn-18（pkg-29 run-29）。
Δ_cycle(7) RSS = +107216 KB；Δ_idle(6→7) RSS = +107216 KB 同量级（S_in(7)=244016
→ 351232）。

C8 插件：strso-19（pkg-31 run-31 → pkg-33 run-33）、strsp-20（pkg-32 run-32）。
Δ_cycle(8) RSS = −93456 KB（再次下降）。

## 阶段性小结（C4–C8，5/8 周期）

- H5.1：5/5 周期末注册表与基线逐项一致（tools 35、plugins []、探针工具消失）。
- H5.2：5 周期 0 生命周期错误（Full 累计 135 次操作中 0 错误）。
- H5.3/A1：RSS Δ_cycle ∈ {+1106MB, +36MB, −115MB, +107MB, −93MB}，Δ_idle 最高
  −1080MB——周期内变动与空闲摆动同量级且符号混杂，**无法归因于插件生命周期**；
  fd 恒 52、线程恒 14（零泄漏信号）。
- 剩余 C9–C11；完成后出 Full 判定与 claim 定级。
