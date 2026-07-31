#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const [suiteArg,resultDirArg,outputArg]=process.argv.slice(2);
if(!suiteArg||!resultDirArg||!outputArg){console.error('Usage: 16-summarize-security-review-diagnostic.js <suite-dir> <result-dir> <output.json>');process.exit(2);}
const suite=path.resolve(suiteArg),resultDir=path.resolve(resultDirArg),output=path.resolve(outputArg);
const {scoreReport}=require(path.join(suite,'_shared','score.js'));
const variants={};
for(const file of fs.readdirSync(resultDir).filter(x=>x.endsWith('.json')).sort()){
  const record=JSON.parse(fs.readFileSync(path.join(resultDir,file),'utf8'));
  const taskRows=[];
  for(const task of record.per_task||[]){
    for(const row of task.rows||[]){
      const reportPath=path.join(row.workspace,'SECURITY_REVIEW.json');
      const expected=JSON.parse(fs.readFileSync(path.join(suite,task.split,task.task_id,'expected.json'),'utf8'));
      let score;
      if(!fs.existsSync(reportPath)) {
        const expectedIds=(expected.findings||[]).map(x=>x.canonical_id||x.category).sort();
        score={pass:false,metrics:{precision:0,recall:0,false_positive_count:0,false_negative_count:expectedIds.length,evidence_completeness:0,remediation_completeness:0,finding_file_completeness:0,severity_completeness:0,files_scanned_ratio:0,source_unchanged:true,structure_valid:false,canonical_id_validity:0,duplicate_count:0},actual_ids:[],false_positive_ids:[],false_negative_ids:expectedIds};
      } else {
        const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
        const status=spawnSync('git',['status','--porcelain'],{cwd:row.workspace,encoding:'utf8'});
        const changes=status.stdout.split('\n').filter(Boolean).map(line=>line.slice(3).trim()).filter(changed=>changed!=='SECURITY_REVIEW.json');
        score=scoreReport(report,expected,changes);
      }
      taskRows.push({split:task.split,task_id:task.task_id,repeat:row.repeat,pass:score.pass,metrics:score.metrics,actual_ids:score.actual_ids,false_positive_ids:score.false_positive_ids,false_negative_ids:score.false_negative_ids,reference_used:!!row.behavior?.read_skill_reference,loaded_skill:!!row.behavior?.loaded_skill,report_present:fs.existsSync(reportPath)});
    }
  }
  const keys=['precision','recall','evidence_completeness','remediation_completeness','finding_file_completeness','severity_completeness','files_scanned_ratio','canonical_id_validity'];
  const mean=(rows,key)=>rows.length?rows.reduce((sum,row)=>sum+Number(row.metrics[key]||0),0)/rows.length:0;
  const quality=rows=>Object.fromEntries(keys.map(k=>[k,mean(rows,k)]));
  const heldInRows=taskRows.filter(x=>x.split==='held-in'),heldOutRows=taskRows.filter(x=>x.split==='held-out');
  variants[record.variant]={result_path:path.join(resultDir,file),held_in:`${taskRows.filter(x=>x.split==='held-in'&&x.pass).length}/${taskRows.filter(x=>x.split==='held-in').length}`,held_out:`${taskRows.filter(x=>x.split==='held-out'&&x.pass).length}/${taskRows.filter(x=>x.split==='held-out').length}`,task_passes:taskRows.filter(x=>x.pass).length,attempts:taskRows.length,false_positives:taskRows.reduce((s,x)=>s+x.metrics.false_positive_count,0),false_negatives:taskRows.reduce((s,x)=>s+x.metrics.false_negative_count,0),quality:quality(taskRows),quality_by_split:{held_in:quality(heldInRows),held_out:quality(heldOutRows)},reports_present:taskRows.filter(x=>x.report_present).length,structure_valid_attempts:taskRows.filter(x=>x.metrics.structure_valid).length,reference_usage_attempts:taskRows.filter(x=>x.reference_used).length,metrics:record.metrics,per_task:taskRows};
}
const names=Object.keys(variants);
const comparisons=[];
for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
 const a=variants[names[i]],b=variants[names[j]];const byA=new Map(a.per_task.map(x=>[x.split+'/'+x.task_id,x])),byB=new Map(b.per_task.map(x=>[x.split+'/'+x.task_id,x]));const keys=[...byA.keys()].filter(k=>byB.has(k));comparisons.push({baseline:names[i],candidate:names[j],candidate_task_wins:keys.filter(k=>!byA.get(k).pass&&byB.get(k).pass),baseline_task_wins:keys.filter(k=>byA.get(k).pass&&!byB.get(k).pass)});
}
const report={suite,result_dir:resultDir,variants,comparisons,generated_at:new Date().toISOString()};fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({variants:Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,{held_in:v.held_in,held_out:v.held_out,false_positives:v.false_positives,false_negatives:v.false_negatives,quality:v.quality}]))},null,2));
