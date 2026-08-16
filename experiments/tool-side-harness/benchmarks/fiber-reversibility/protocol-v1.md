# 纤维可逆性基准（Fiber-Reversibility Benchmark）v1

Status: 2026-08-16 冻结。目标：给 Cordis 论文的 temporal 保证（可逆效果——组件移除后
上下文完全恢复）提供实测注脚（INTEGRATION_MEMO_CORDIS M3）。

## 程序

1. 基线快照：记录运行时的 tools / services / temporary-plugins 清单；
2. 挂载探针插件（一个动态 Plugin，注册五类效果：一个模型工具、一个 ctx.provide
   服务、一个 ctx.on 事件监听、一个 timer 定时器、一个客户端 Slot UI）；
3. 挂载后快照：五类效果全部可见；
4. cordis_stop 探针插件；
5. 停止后快照：与基线逐项比对——**零残留**（工具消失、服务消失、监听不再触发、
   定时器停止、Slot 注销）；
6. 判定：全部为零 → 通过；任何残留 → 记录类别与复现，作为 temporal 保证的
   反例（一等结果）。

## 执行环境

真实 DSH 进程（本会话运行时），使用 cordis_inspect_* 工具采集快照；
cordis_define/run/stop 驱动插件生命周期。快照与结果存入
`experiments/tool-side-harness/benchmarks/fiber-reversibility/runs/`。
