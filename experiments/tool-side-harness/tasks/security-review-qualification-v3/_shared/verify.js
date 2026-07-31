#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const {scoreReport}=require('./score');
const [workspaceArg,expectedArg]=process.argv.slice(2);
if(!workspaceArg||!expectedArg)process.exit(2);
const workspace=path.resolve(workspaceArg);
const expected=JSON.parse(fs.readFileSync(expectedArg,'utf8'));
const reportPath=path.join(workspace,'SECURITY_REVIEW.json');
if(!fs.existsSync(reportPath)){console.error('SECURITY_REVIEW.json missing');process.exit(1);}
let report;
try{report=JSON.parse(fs.readFileSync(reportPath,'utf8'));}catch(error){console.error('invalid report JSON: '+error.message);process.exit(1);}
const status=spawnSync('git',['status','--porcelain'],{cwd:workspace,encoding:'utf8'});
const sourceChanges=status.stdout.split('\n').filter(Boolean).map(line=>line.slice(3).trim()).filter(changed=>changed!=='SECURITY_REVIEW.json');
const score=scoreReport(report,expected,sourceChanges);
console.log('SECURITY_SCORE '+JSON.stringify(score.metrics));
if(!score.pass){console.error(score.errors.join('\n'));process.exit(1);}
console.log('security review verifier passed');
