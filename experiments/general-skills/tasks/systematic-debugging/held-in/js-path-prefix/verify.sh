#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from'node:assert/strict';import{resolveWorkspace}from'./paths.js';assert.throws(()=>resolveWorkspace('/tmp/work','..'));assert.throws(()=>resolveWorkspace('/tmp/work','/tmp/work2/x'));assert.equal(resolveWorkspace('/tmp/work','.'),'/tmp/work');
JS
echo 'PASS js-path-prefix'
