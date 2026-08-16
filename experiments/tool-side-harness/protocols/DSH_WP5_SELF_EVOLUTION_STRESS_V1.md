# DSH WP5 · 连续自演化压力测试 V1（M5）

Status: 2026-08-16 预注册冻结。目标：给 Cordis 论文 §1.2.2（自演化 agent
harness）提供压力层面的行为证据——agent 驱动的动态插件变更序列在多轮之后，
运行时是否回到逐轮一致的基线（无注册表残留、无错误累积、无资源单调增长）。

## 假设与判定

- H5.1 每周期末注册表维度（tools / services / plugins / slots）与基线逐项一致。
- H5.2 跨周期无错误累积：周期 i 内 stop/undefine/update 的错误数不随 i 增长（理想为 0）。
- H5.3 无资源单调增长：OS 探针（RSS / VSZ / 线程数 / fd 数）跨周期无单调上升趋势。
- 判定：H5.1 逐周期判定；H5.2/H5.3 跨周期判定。任何违背 = 一等结果（记录类别与复现），不是失败。

## 周期定义 C_i

1. define 两个 host-only 探针插件 P_a(i)、P_b(i)
   （P_a：模型工具 + ctx.provide 服务 + tools/change 监听 + 500ms timer；
     P_b：模型工具 + 监听）；
2. run 两者；调用 P_a 工具一次取得存活读数（listenerFires/timerTicks/serviceCalls）；
3. update P_a 一次（v2 包，同源代码）；调用工具一次；
4. stop 两者；undefine 两者；
5. 周期末快照：Tool 目录计数 + 探针名缺失、plugins 清单（[]）、OS 探针采样。

## 仪表

- Inspect 通道：Tool.listTools（周期末计数）、cordis_inspect_self（周期末）。
- M6 OS 探针（周期末）：宿主进程（PID 23048, `dsh web`）的
  `ps -o pid,rss,vsz,nlwp` 与 `lsof -p <pid> | wc -l`（macOS；Linux 部署换 /proc）。
- 存活读数：探针工具自身计数器。

## 环境约束（Gate-0 风格：记录，不评分）

- 本会话审批弹窗禁用 → 客户端包无法激活 → 周期插件全部 host-only；
  Slot 类效果沿用 M3 的 deferral 记录，不在本协议内复测。
- stop/undefine 出现意外错误 → 终止该周期并记录（Gate-0 abort），不计入判定但计入复现材料。
- 服务目录为静态清单（M3 发现 1）：E2 类效果以探针工具 witness 为准，不依赖 Service.listService。

## 规模与驱动

- Pilot（本会话）：3 周期。
- Full（多会话，可续跑）：8 周期；续跑机制 = `runs/` 周期日志 + 本协议。
- 驱动机制：Full 的跨会话部分用新鲜轮次驱动（Ralph 或等价 fresh-round 编排；
  仅在用户显式要求时启用 ralph 工具）。

## Claim level

- Pilot：E2（行为压力证据）。
- Full 跨会话完成：E3。
