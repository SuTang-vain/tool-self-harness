#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from'node:assert/strict';import{buildRequest}from'./request.js';assert.deepEqual(buildRequest({verbose:false}),{retries:3,timeout:5000,verbose:false});assert.deepEqual(buildRequest({retries:null}),{retries:null,timeout:5000,verbose:false});
JS
echo 'PASS js-options-default'
