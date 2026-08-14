---
name: editing-cordis-compositions
description: Use when creating, changing, or validating a Cordis composition for this harness — writing or editing an agent preset, adding or removing a plugin row, deciding whether something belongs to the host composition or to one session, checking whether a preset you authored actually mounts, or diagnosing a row that mounted but contributed nothing.
---

# Editing Cordis compositions

Every capability in this harness is a plugin row in a `cordis.yml`. There is no separate configuration language: changing what an agent can do means changing which rows are composed for it.

## Off-limits

**Never edit, delete, or overwrite a preset that ships with the deployment** — the `agent-presets` directory beside the deployment's own config, which supplies `standard`, `code`, `minimal`, and `cordis`. Never escalate the sandbox to reach it, even when a change there looks quicker. An upgrade overwrites that install, and corrupting `cordis` disables preset authoring itself. Reading a shipped composition is the intended way to start; writing to one is not, and neither is editing the host composition to work around a preset limitation.

To change what a shipped preset does, copy it and edit the copy. Locally authored presets under the user root are yours to create, edit, and delete.

## Decide the plane first

Two planes, and the choice is not about how "agent-related" something feels — it is about whether the thing must be shared.

**Host composition.** The registries themselves (`tools`, `systemPrompt`, `agents`, `agent-loop`, `sessions`), anything crossing sessions (persistence, session query, storage, settings, credentials, telemetry), the sandbox and approval stack, the model route, and the subagent registry with its spawn/fork backends. One instance for the process.

**Agent preset.** What one session contributes to those registries: its tool plugins, its persona and prompt sections, its compaction policy. One instance per session, mounted under that session's scope and unwound with it.

**A service with a consumer outside the agent plane cannot move into a preset.** `subagents` is the worked example: the registry answers cross-session queries for the host api-proxy, so a per-session copy both starves that host row — it waits forever for a service nothing provides — and collides on the second session, since a provider name registers once. The preset contributes the delegation *tools*; the registry and its backends stay host-side.

A preset is a directory holding one `agent.cordis.yml`, optionally beside a `preset.yml` carrying display metadata — `name` and `description` (and, for shipped presets, a roster `order`). Write the metadata too: a preset without it shows up in every picker as its bare directory name.

Locally authored presets live one directory per preset under `${DSH_HOME:-$HOME/.dsh}/.agent-presets/`, and the shipped set sits beside the deployment's own config. Use those when the user asks where to look. A deployment can configure other roots, so the path you read or edit comes from `list()` or `resolve()` — which is also where `copy()` reports what it just created.

## The rule that catches people

**A row that publishes a service may not sit loose in a preset.** Registering a service without an isolate realm puts it in the process-global realm, so the second session mounting that preset collides with the first. The mount rejects it rather than letting the collision surface later.

Whether a row publishes a service is not visible from its name, and package READMEs are absent from an installed deployment. Read it off the live runtime instead: `cordis_inspect what:"services"` lists every service with the fiber that owns it, so a service attributed to a fiber other than the row you are adding is one that row consumes rather than provides. For a row not in your current composition, mount-validate and read the rejection — it names the offending service.

When a preset genuinely owns a service, wrap the provider **and every consumer that reaches it** in one group carrying an `isolate` realm. The shipped `standard` composition does this for `workflows`, which nothing outside an agent reads — its `delegation` group, with the delegation tools omitted here:

```yaml
- id: delegation
  name: cordis:group
  group: true
  isolate:
    workflows: true
  config:
    - id: workflow-worker-thread
      name: '@deepseek-ai/dsh-workflow-worker-thread'
      config:
        provider: spawn
    - id: tool-workflow
      name: '@deepseek-ai/dsh-tool-workflow'
```

`true` means a realm private to each mounting session. A string label instead joins subtrees into one shared realm; `provide()` still throws on the second registration under that symbol, so a label does not pool instances and is not what a preset needs.

A consumer left outside the group resolves the host's registry, which the preset did not populate, and then contributes nothing. Mount-validation catches that as a row that never activated.

Realms are for services a preset owns, not for every group. A host capability the preset only consumes must stay outside a realm, or the row cannot resolve it: `tool-bash`, `tool-jobs`, and `tool-goal` publish nothing and sit loose in `standard`, which explains in comments which host instance each one resolves and why a realm would break it. Wrapping a consumer row in a realm of its own is the same error as leaving one outside its provider's realm.

## Verifying a change

**`standingKeyFor(id)` is the check.** It composes the preset's plugin subtree for real — the same mount a session start performs, minus the agent — and rejects the four ways a composition fails:

- a row whose package does not resolve (`Cannot find package …`);
- a row whose config is invalid (`invalid config: $.<field> missing required value`);
- a row that never activated (`N row(s) did not activate: <id>: waiting for <service>`);
- a service published into the root realm, which arrives as one of two messages. A name the host does not supply lands in the root realm and the mount audit rejects it: `row(s) published process-global service(s) [<name>]; a preset service must sit behind an isolate realm or move to the host composition` — this is the shape a preset's own forgotten realm takes. A name the host already supplies collides before the audit: `service "<name>" has been registered at <Owner>`. Both name the offending service.

It returns normally when the composition mounts. Run it as the final check on a finished edit rather than after every line: a successful mount installs a standing generation that lives until the process exits, while a failed one disposes its subtree and leaves nothing behind.

**Do not treat the roster's `broken` field as validation.** `list()` reports `broken` from a shape check — the file parses in the loader's YAML dialect and holds named rows — which every failure above passes. It catches a damaged file, not an unusable composition.

`cordis_inspect` reports THIS session's composition, so it confirms what a row does in the runtime you are already in, never what your new preset will do.

After a clean mount-validation, ask the user to start a session on the new preset and confirm the tool list; the preset decides tool schemas and prompt sections, and only a real session shows the agent that composition produces.

`cordis_mount` evaluates JavaScript against the live runtime and disappears on restart. It is for probing, not for shipping a capability: a capability belongs in a composition file.

## Native product subagents

Codex and Claude Code providers already live in the host composition. A preset chooses either product by contributing the same ordinary delegation-tool row used for spawn and fork; never move a product provider into the preset and never add a product-specific settings field.

Copy these disabled templates from a shipped full preset and remove `disabled` only for the products the user requested:

```yaml
- id: tool-subagent-codex
  name: '@deepseek-ai/dsh-tool-subagent'
  disabled: true
  config:
    provider: codex
    toolName: subagent_codex
    enableRunInBackground: false
    maxDepth: provider-managed

- id: tool-subagent-claude-code
  name: '@deepseek-ai/dsh-tool-subagent'
  disabled: true
  config:
    provider: claude-code
    toolName: subagent_claude_code
    enableRunInBackground: false
    maxDepth: provider-managed
```

The two rows are independent. Leaving both disabled preserves the copied preset, enabling one exposes only that product tool, and enabling both exposes both. The host must provide `codex` or `claude` on `PATH`; the preset does not install, authenticate, select a model for, or probe either product.

## What not to move into a preset

`agent-loop` registers the one agent factory and throws on a second. The registries own the per-session layering and cannot themselves be per-session. Session persistence must stay host-side or the session list fragments. The sandbox, approval, and permission rows are a deliberate boundary: a preset is exactly as privileged as the plugins it names, so letting one relax its own confinement would defeat the confinement.
