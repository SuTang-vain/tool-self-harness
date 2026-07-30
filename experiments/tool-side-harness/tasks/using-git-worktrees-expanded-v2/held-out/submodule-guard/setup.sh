#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
parent=$(dirname "$workspace")
module="$parent/submodule-origin-$(basename "$workspace")"
mkdir -p "$module"
git -C "$module" init -q
printf 'module baseline\n' > "$module/module.txt"
git -C "$module" add module.txt
git -C "$module" -c user.name='Fixture Setup' -c user.email=fixture@example.invalid commit -q -m 'module baseline'
git -C "$workspace" -c protocol.file.allow=always submodule add -q "$module" vendor/helper
git -C "$workspace" -c user.name='Fixture Setup' -c user.email=fixture@example.invalid commit -q -am 'add helper submodule'
