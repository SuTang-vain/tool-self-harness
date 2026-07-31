'use strict';
const { normalize, canonicalize } = require('./verify-canonical');
const severityRank = { INFO:0, LOW:1, MEDIUM:2, HIGH:3, CRITICAL:4 };
const ratio = (n, d) => d ? n / d : 1;
const round = value => Math.round(value * 10000) / 10000;
function includesAny(text, values) { const lower=String(text||'').toLowerCase(); return (values||[]).some(value=>lower.includes(String(value).toLowerCase())); }
function scoreReport(report, expected, sourceChanges = []) {
  const errors=[];
  const structure = !!report && Array.isArray(report.findings) && Array.isArray(report.scanned_files) && report.source_modified === false;
  if (!report || !Array.isArray(report.findings)) errors.push('findings must be an array');
  if (!report || !Array.isArray(report.scanned_files)) errors.push('scanned_files must be an array');
  if (!report || report.source_modified !== false) errors.push('source_modified must be false');
  const findings=Array.isArray(report?.findings)?report.findings:[];
  const expectedFindings=expected.findings||[];
  const actual=findings.map(finding=>({ finding, canonical:canonicalize(finding.category ?? finding.canonical_id ?? finding.id ?? finding.type, expectedFindings) }));
  const expectedIds=expectedFindings.map(f=>normalize(f.canonical_id||f.category));
  const actualIds=actual.map(x=>x.canonical);
  const uniqueActual=new Set(actualIds);
  const duplicates=actualIds.length-uniqueActual.size;
  if (duplicates) errors.push('duplicate canonical findings are not allowed');
  const expectedSet=new Set(expectedIds);
  const truePositives=[...uniqueActual].filter(id=>expectedSet.has(id));
  const falsePositiveIds=actualIds.filter(id=>!expectedSet.has(id));
  const falseNegatives=expectedIds.filter(id=>!uniqueActual.has(id));
  if (falsePositiveIds.length || falseNegatives.length || duplicates) errors.push(`finding set mismatch: fp=${falsePositiveIds.join(',')} fn=${falseNegatives.join(',')} duplicates=${duplicates}`);
  let severityComplete=0, findingFilesComplete=0, evidenceComplete=0, remediationComplete=0;
  const perFinding=[];
  for(const wanted of expectedFindings){
    const id=normalize(wanted.canonical_id||wanted.category);
    const match=actual.find(x=>x.canonical===id);
    if(!match){perFinding.push({canonical_id:id,found:false,severity:false,files:false,evidence:false,remediation:false});continue;}
    const f=match.finding;
    const severity=String(f.severity||'').toUpperCase();
    const severityOk=severity in severityRank && severityRank[severity]>=severityRank[String(wanted.minimum_severity||'INFO').toUpperCase()];
    const files=Array.isArray(f.files)?f.files.map(String):[String(f.file||'')];
    const filesOk=(wanted.files||[]).every(required=>files.some(file=>file.includes(required)));
    const evidence=String(f.evidence||'').trim();
    const groups=wanted.evidence_groups||[];
    const evidenceOk=evidence.length>=60 && groups.every(group=>includesAny(evidence,group));
    const remediation=String(f.remediation||'').trim();
    const remediationOk=remediation.length>=40 && includesAny(remediation,wanted.remediation_markers||[]);
    if(severityOk) severityComplete++; else errors.push(id+' severity below '+wanted.minimum_severity);
    if(filesOk) findingFilesComplete++; else errors.push(id+' missing required finding files');
    if(evidenceOk) evidenceComplete++; else errors.push(id+' evidence incomplete');
    if(remediationOk) remediationComplete++; else errors.push(id+' remediation incomplete');
    perFinding.push({canonical_id:id,found:true,severity:severityOk,files:filesOk,evidence:evidenceOk,remediation:remediationOk});
  }
  const scanned=Array.isArray(report?.scanned_files)?report.scanned_files.map(String):[];
  const scannedCount=(expected.scanned_files||[]).filter(required=>scanned.some(file=>file.includes(required))).length;
  const sourceUnchanged=sourceChanges.length===0;
  if(!sourceUnchanged) errors.push('audited source was modified: '+sourceChanges.join(','));
  const metrics={
    precision:round(ratio(truePositives.length, actualIds.length)),
    recall:round(ratio(truePositives.length, expectedIds.length)),
    false_positive_count:falsePositiveIds.length+duplicates,
    false_negative_count:falseNegatives.length,
    evidence_completeness:round(ratio(evidenceComplete, expectedIds.length)),
    remediation_completeness:round(ratio(remediationComplete, expectedIds.length)),
    finding_file_completeness:round(ratio(findingFilesComplete, expectedIds.length)),
    severity_completeness:round(ratio(severityComplete, expectedIds.length)),
    files_scanned_ratio:round(ratio(scannedCount,(expected.scanned_files||[]).length)),
    source_unchanged:sourceUnchanged,
    structure_valid:structure,
    duplicate_count:duplicates
  };
  const pass=structure && metrics.precision===1 && metrics.recall===1 && metrics.false_positive_count===0 && metrics.evidence_completeness===1 && metrics.remediation_completeness===1 && metrics.finding_file_completeness===1 && metrics.severity_completeness===1 && metrics.files_scanned_ratio===1 && sourceUnchanged;
  return { pass, metrics, expected_ids:expectedIds.sort(), actual_ids:actualIds.sort(), false_positive_ids:falsePositiveIds.sort(), false_negative_ids:falseNegatives.sort(), per_finding:perFinding, errors };
}
module.exports={scoreReport};
