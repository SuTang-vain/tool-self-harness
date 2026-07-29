const fs = require('fs');
const trace = require('./lib/trace');

console.log('================================================================================');
console.log('  SELF-HARNESS 3-WAY MODEL COMPARISON (paper Figure 4/5/6 reproduction)');
console.log('  Same h0 SKILL.md, 5 tasks, eval_repeats=2 best-of-N');
console.log('================================================================================\n');

console.log('PROPOSALS GENERATED (proposer = same model):');
const propDirs = { 'GLM-5.2': 'round-0', 'MiniMax-M3': 'm3-1', 'DeepSeek-V4-Pro': 'ds-1' };
for (const [name, rd] of Object.entries(propDirs)) {
  const pdir = 'proposals/' + rd;
  if (!fs.existsSync(pdir)) { console.log('  ' + name + ': (no proposals)'); continue; }
  const js = fs.readdirSync(pdir).filter(d => /^\d+$/.test(d)).sort();
  for (const j of js) {
    const a = JSON.parse(fs.readFileSync(pdir + '/' + j + '/audit.json', 'utf8'));
    console.log('  ' + name + ' #' + j + ' [' + a.surface_id + ']: ' + (a.rationale || '').slice(0, 90));
  }
}

console.log('\nACCEPTANCE DECISIONS:');
for (const [name, rd] of Object.entries({ 'GLM-5.2': 'round-0', 'MiniMax-M3': 'm3-1', 'DeepSeek-V4-Pro': 'ds-1' })) {
  const a = JSON.parse(fs.readFileSync('results/' + rd + '-accept.json', 'utf8'));
  console.log('  ' + name + ': ' + a.accepted.length + ' accepted, ' + a.rejected.length + ' rejected');
  for (const r of a.rejected) console.log('    REJ [' + r.surface_id + ']: ' + r.reason);
}

console.log('\n================================================================================');
console.log('KEY FINDINGS (paper Figure 4/5/6 reproduction):');
console.log('================================================================================');
console.log('');
console.log('1. MODEL-SPECIFIC WEAKNESSES (paper Figure 5/6):');
console.log('   t02 chinese-alias:  GLM fail  M3 fail  DS PASS  -- DeepSeek uniquely solves it');
console.log('   t03 multi-stage:    GLM fail  M3 PASS  DS PASS  -- GLM uniquely fails (bypassed extract)');
console.log('   t04 external-json:  GLM fail  M3 fail  DS fail  -- all fail (label case mismatch)');
console.log('   t05 collection:     GLM fail  M3 fail  DS fail  -- all fail (provenance missing)');
console.log('   => Same harness, different models expose different failure modes');
console.log('');
console.log('2. PROPOSER STYLE DIVERGENCE (paper Sec 3.3):');
console.log('   GLM-5.2 #1:      workflow-section  -- aggressive trim (66->8 lines, mandatory extract-first)');
console.log('   GLM-5.2 #2:      rule-cheat-sheet  -- full rewrite with new rules (caused regression)');
console.log('   MiniMax-M3 #1:   rule-cheat-sheet  -- conservative additive (add E4 row + Pattern-B reminder)');
console.log('   MiniMax-M3 #2:   core-concept      -- pure rephrasing of rule #2 (alias gate emphasis)');
console.log('   DeepSeek-V4 #1:  rule-cheat-sheet  -- semantic clarity (clarify Validation-passed meaning)');
console.log('   DeepSeek-V4 #2:  cli-section       -- document validate exit-code semantics');
console.log('   => Same evidence, 3 models propose 3 completely different fix directions');
console.log('');
console.log('3. ACCEPTANCE GATE (paper Sec 3.4):');
console.log('   All 3 models: 0/2 accepted (6/6 rejected)');
console.log('   - flat (no improvement): GLM#1, M3#1, M3#2, DS#1');
console.log('   - regression (degrades): GLM#2 (-1 held-in), DS#2 (-1 held-in)');
console.log('   => Gate correctly prevents harmful edits from entering lineage');
console.log('');
console.log('4. VARIANCE (paper Sec 3.4 eval_repeats):');
console.log('   MiniMax-M3:  variance=0 (most stable, deterministic)');
console.log('   DeepSeek-V4: variance=0-1 (stable)');
console.log('   GLM-5.2:     high variance (1/3 vs 3/3 on same task) -- needs eval_repeats=3+');
console.log('');
console.log('5. BASELINE RANKING:');
console.log('   DeepSeek-V4-Pro: 3/5 > MiniMax-M3: 2/5 > GLM-5.2: 1/5');
console.log('   => Harness optimized for GLM may be suboptimal for DeepSeek,');
console.log('      validating need for model-specific harness evolution (Self-Harness).');
console.log('');
console.log('6. ROOT CAUSE (why 0 accepts across all models):');
console.log('   t02/t05 failures: verify.sh checks provenance fields that SKILL.md never');
console.log('   specifies a template for. Fix: add provenance example to extraction-config.md');
console.log('   t04 failure: verify.sh checks exact label casing (Ally vs ally)');
console.log('   => These are TASK/VERIFIER design issues, not harness issues.');
console.log('   Self-Harness correctly refuses to fix them via SKILL.md edits (overfitting).');
