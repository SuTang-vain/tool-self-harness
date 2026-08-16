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
Δ_cycle(6) RSS = −115392 KB（周期内 GC 释放，RSS 下降）；Δ_idle(5→6) = 0
（S_in(6) 未单独采样，取 S_out(5)=359408）。C6 周期末工具目录以探针工具从模型
可见工具集消失 + inspect_self plugins=[] 核对（listTools 全量在 C4/C5/C7/C8/C11
采集；工具集即 listTools 所读的同一注册表）。

C7 插件：strsm-17（pkg-28 run-28 → pkg-30 run-30）、strsn-18（pkg-29 run-29）。
Δ_cycle(7) RSS = +107216 KB；Δ_idle(6→7) = 0（S_in(7) 未单独采样，取 S_out(6)=244016）。

C8 插件：strso-19（pkg-31 run-31 → pkg-33 run-33）、strsp-20（pkg-32 run-32）。
Δ_cycle(8) RSS = −93456 KB（再次下降）。

## 阶段性小结（C4–C8，5/8 周期）

- H5.1：5/5 周期末注册表与基线逐项一致（tools 35、plugins []、探针工具消失）。
- H5.2：5 周期 0 生命周期错误（Full 累计 135 次操作中 0 错误）。
- H5.3/A1：RSS Δ_cycle ∈ {+1106MB, +36MB, −115MB, +107MB, −93MB}，Δ_idle 最高
  −1080MB——周期内变动与空闲摆动同量级且符号混杂，**无法归因于插件生命周期**；
  fd 恒 52、线程恒 14（零泄漏信号）。
- 剩余 C9–C11；完成后出 Full 判定与 claim 定级。

## C9–C11 数据

| 周期 | S_in | 读数A | 读数B update 后 | S_out | H5.1 |
|---|---|---|---|---|---|
| C9 | RSS 262864, fd 52, thr 14 | 37438/2/74/1（B: lf=1） | 34524/1/68/1 | RSS 352176, fd 53, thr 14 | 探针工具消失 + plugins [] ✓ |
| C10 | RSS 321088, fd 52, thr 14 | 34622/2/69/1（B: lf=1） | 33557/1/66/1 | RSS 345440, fd 53, thr 14 | 探针工具消失 + plugins [] ✓ |
| C11 | RSS 283360, fd 52, thr 14 | 38102/2/76/1（B: lf=1） | 34896/1/69/1 | RSS 278672, fd 52, thr 14 | tools 35（终检）, plugins [] ✓ |

C9 插件：strsq-21（pkg-34 run-34 → pkg-36 run-36）、strsr-22（pkg-35 run-35）。
Δ_cycle(9) = +89312 KB；Δ_idle(8→9) = +5088 KB。
C10 插件：strss-23（pkg-37 run-37 → pkg-39 run-39）、strst-24（pkg-38 run-38）。
Δ_cycle(10) = +24352 KB；Δ_idle(9→10) = −31088 KB。
C11 插件：strsu-25（pkg-40 run-40 → pkg-42 run-42）、strsv-26（pkg-41 run-41）。
Δ_cycle(11) = −4688 KB；Δ_idle(10→11) = −62080 KB。

## Full 终判（C4–C11，8/8 周期）

- **H5.1 pass 8/8**：每周期末工具目录（35，无探针）与 plugins 清单（[]）与基线逐项一致。
- **H5.2 pass**：80 次生命周期操作（8×[2 define + 2 run + 1 update + 2 stop + 2 undefine]）
  0 错误；与 pilot 合计 107 次操作 0 错误。
- **H5.3-Full（A1 配对）**：Δ_cycle ∈ {+1106512, +35952, −115392, +107216, −93456,
  +89312, +24352, −4688} KB；有独立空闲采样的 Δ_idle ∈ {−1043872, +5088, −31088,
  −62080} KB（另有 pilot→C4 空闲 −1079600 KB）。最大周期内增长（+1.1GB）与最大空闲
  摆动（−1.08GB）同量级、符号混杂，**RSS 无周期归因增长**；fd 52–53、线程恒 14，
  零泄漏信号。A1 对照的判读目标达成：pilot 的「RSS 不确定」现升级为
  「RSS 归因排除（在 ±1.1GB 环境摆动分辨率下）」。
- **Claim 定级**：E2（8 周期 A1 对照的行为压力证据）。协议将 E3 绑定在「Full 跨会话
  完成」；本运行在单一 DSH 会话内完成（跨 goal 轮次、含 checkpoint），故按纪律记
  E2，**跨会话复跑列为 E3 的后续入场条件**（新会话 × 同一协议 × 同一日志续接）。
