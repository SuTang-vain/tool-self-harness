# M3 Fiber-Reversibility Benchmark — Run v1 (2026-08-16)

Protocol: `benchmarks/fiber-reversibility/protocol-v1.md` (frozen same day).
Environment: real DSH process (this session). File policy danger-full-access;
**approval prompts disabled in this session** (recorded constraint; affects E5).

Probe Plugins (session-owned, dynamic Cordis):

- `fibrev-3` — host probe. pkg-6 (v1) → pkg-7 (v2, exercised the update path).
- `frslot-4` — client probe. pkg-8 (never mounted; see E5).

## Snapshot A — baseline (pre-mount)

| dimension | value |
|---|---|
| model tools (Tool.listTools) | 35; `m3_probe_snapshot` absent |
| service catalogue (Service.listService) | 55 keys; `m3probe/echo` absent |
| session-owned dynamic plugins (inspect_self) | `[]` |
| client Slot `tool.view.cordis` occupants | 1: `dyn/evdsh-2` (key `evdsh-2.pkg-5`, active) — belongs to another session; kept as non-interference control |

## Snapshot B — mounted

- `fibrev-3/pkg-6` (run-6): `m3_probe_snapshot` appears in Tool.listTools (36 tools).
  - probe reading A: uptime 11.7 s, listenerFires = 1, timerTicks = 21, serviceCalls = 0
  - probe reading B: uptime 43.4 s, listenerFires = 1, timerTicks = 83 (≈ 1.91 Hz ≈ the 500 ms interval)
- `fibrev-3/pkg-7` (run-7, update from pkg-6): fresh fiber —
  - uptime 1.8 s, listenerFires = 1 (its own registration re-fired `tools/change`), timerTicks = 3, **serviceCalls = 1** (each tool invocation calls the probe's own provided service; E2 liveness witnessed through the externally visible tool channel)
- `frslot-4/pkg-8` (run-8): `cordis_run` returned **awaiting user approval**; with approval prompts disabled in this session the client package cannot be mounted. E5 constraint, recorded not scored.

## Snapshot C — after cordis_stop (both plugins)

| dimension | value | vs baseline |
|---|---|---|
| model tools | 35; `m3_probe_snapshot` absent | identical ✓ |
| service catalogue | 55 keys; no probe key | identical ✓ |
| `tool.view.cordis` occupants | `[dyn/evdsh-2]` only | identical ✓ (control undisturbed) |
| plugins | `fibrev-3` stopped (currentPackageId pkg-7 retained); `frslot-4` defined (pending approval cancelled by stop) | definitions retained by design (stop ≠ undefine) |

No errors surfaced in steering context during or after the stops.

## Snapshot D — after cordis_undefine (both plugins)

- plugins: `[]` — full registry restoration to baseline.

## Verdict per effect class

| class | liveness evidence | reversal evidence | verdict |
|---|---|---|---|
| E1 model tool | listed (36) and callable; 3 readings | absent after stop (35) | **zero residue — directly observed** |
| E2 provided service | callable via probe `ctx.get`; serviceCalls 0→1 witnessed through the tool | co-disposed by the same fiber unwind that removed E1; catalogue channel is static (see note 1) | **zero residue — witness + mechanism** |
| E3 event listener | `tools/change` fired on the probe's own registration (listenerFires = 1 in both runs) | fiber-scoped `ctx.on` dispose; no post-mortem Inspect channel exists (note 2) | **zero residue — mechanism-inferred** |
| E4 timer | 500 ms ticks, monotonic (21→83; fresh 3 after update) | fiber-scoped timer dispose; no post-stop tick channel (note 2) | **zero residue — mechanism-inferred** |
| E5 client Slot | **not executable**: awaiting approval, prompts disabled | n/a | **deferred — environment constraint** |

Update-path consistency: pkg-6→pkg-7 produced a fresh fiber (new startedAt, counters reset,
listenerFires = 1 from the new registration) — consistent with orderly disposal of the old
run's effects, though counter state per fiber is not itself a leak detector.

## Observability boundary findings (first-class, feed M6)

1. The Inspect **service catalogue is a static directory**: `ctx.provide`-registered
   services never appear in `Service.listService` (exact query errored with
   "no catalogued Service"). Dynamic services need a witness channel (here: the probe tool
   calling its own service) — a gap the M6 integrity track should close with a runtime hook.
2. Event listeners and timers have **no post-mortem Inspect channel**: their reversal is
   inferred from fiber dispose + zero catalogue residue + clean stop, not directly observed.
   A diagnostics-level counter snapshot would upgrade these two classes to direct observation.
3. **Cross-session isolation control**: `tool.view.cordis` held an active occupant from
   another session's plugin (`dyn/evdsh-2`) before, during, and after our full lifecycle —
   mount/stop/undefine of the probe did not disturb it.

## Judgement

Pass (all executable classes, 4/4) at claim level **E1-methodological-runtime**: registry-visible effects were
restored to baseline exactly; timer/listener reversal is mechanism-inferred (same
fiber-dispose path demonstrably removed the visible classes); E5 deferred by an
environment constraint (approval prompts disabled), not by any observed residue.

Machine-readable summary: `results-v1.json` (same directory).
