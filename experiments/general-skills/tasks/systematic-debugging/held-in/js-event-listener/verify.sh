#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import{EventEmitter}from'node:events';import{connect}from'./subscription.js';const e=new EventEmitter();let n=0;for(let i=0;i<4;i++){const off=connect(e,()=>n++);off()}e.emit('data');if(n!==0)throw new Error('listener leak '+n);
JS
echo 'PASS js-event-listener'
