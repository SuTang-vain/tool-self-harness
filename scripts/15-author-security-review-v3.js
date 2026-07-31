#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const dst = path.resolve(__dirname, '../experiments/tool-side-harness/tasks/security-review-qualification-v3');
if (fs.existsSync(dst)) throw new Error('destination already exists: ' + dst);

const prompt = [
  'Perform a comprehensive security review of this repository.',
  '',
  'Inspect source code, configuration, and dependency metadata that are relevant to the service. Report only exploitable findings and avoid pattern-only false positives. Do not modify audited source files.',
  '',
  'Save the final machine-readable report to `SECURITY_REVIEW.json` using exactly this shape:',
  '',
  '```json',
  '{',
  '  "findings": [',
  '    {',
  '      "category": "lowercase-category-slug",',
  '      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",',
  '      "files": ["relative/path"],',
  '      "evidence": "specific data-flow, exploitability, authorization, configuration, or dependency evidence",',
  '      "remediation": "specific corrective action"',
  '    }',
  '  ],',
  '  "scanned_files": ["every relevant or decoy file reviewed"],',
  '  "source_modified": false',
  '}',
  '```',
  '',
  'Finding order and wording are not important. Evidence must explain why the issue is exploitable, and remediation must address the actual trust boundary.'
].join('\n') + '\n';

function finding(canonical_id, aliases, minimum_severity, files, evidence_groups, remediation_markers) {
  return { canonical_id, aliases, minimum_severity, files, evidence_groups, remediation_markers };
}
function write(file, content, mode) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  if (mode) fs.chmodSync(file, mode);
}
function json(file, value) { write(file, JSON.stringify(value, null, 2) + '\n'); }
function addTask(split, id, files, findings, protected_decoys) {
  const dir = path.join(dst, split, id);
  write(path.join(dir, 'task.md'), prompt);
  for (const [file, content] of Object.entries(files)) write(path.join(dir, 'input', file), content);
  json(path.join(dir, 'expected.json'), {
    findings,
    scanned_files: Object.keys(files).sort(),
    protected_decoys,
    source_modified: false
  });
  write(path.join(dir, 'verify.sh'), '#!/usr/bin/env bash\nset -euo pipefail\nnode "$(cd "$(dirname "$0")/../.." && pwd)/_shared/verify.js" "$1" "$(dirname "$0")/expected.json"\n', 0o755);
  write(path.join(dir, 'reference.sh'), '#!/usr/bin/env bash\nset -euo pipefail\nnode "$(cd "$(dirname "$0")/../.." && pwd)/_shared/reference.js" "$1" "$(dirname "$0")/expected.json"\n', 0o755);
}

addTask('held-in', 'tenant-boundary-service', {
  'src/app.js': `const express = require('express');\nconst { authenticate } = require('./middleware/authenticate');\nconst invoices = require('./routes/invoices');\nconst profile = require('./routes/profile');\nconst admin = require('./routes/admin');\nconst app = express();\napp.use('/api', authenticate);\napp.use('/api/invoices', invoices);\napp.use('/api/profile', profile);\napp.use('/api/admin', admin);\nmodule.exports = app;\n`,
  'src/middleware/authenticate.js': `function authenticate(req, res, next) {\n  const token = String(req.headers.authorization || '').replace(/^Bearer /, '');\n  const claims = verifyJwt(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });\n  req.user = { id: claims.sub, tenantId: claims.tenant, role: claims.role };\n  next();\n}\nmodule.exports = { authenticate };\n`,
  'src/routes/invoices.js': `const router = require('express').Router();\nconst invoices = require('../repos/invoices');\nrouter.get('/:id', async (req, res) => {\n  const invoice = await invoices.findById(req.params.id);\n  if (!invoice) return res.sendStatus(404);\n  return res.json(invoice);\n});\nmodule.exports = router;\n`,
  'src/repos/invoices.js': `async function findById(id) {\n  return db.oneOrNone('select * from invoices where id = $1', [id]);\n}\nasync function listForTenant(tenantId) {\n  return db.any('select * from invoices where tenant_id = $1', [tenantId]);\n}\nmodule.exports = { findById, listForTenant };\n`,
  'src/routes/profile.js': `const router = require('express').Router();\nconst users = require('../repos/users');\nrouter.patch('/', async (req, res) => {\n  const updated = await users.update(req.user.id, req.body);\n  return res.json(updated);\n});\nmodule.exports = router;\n`,
  'src/repos/users.js': `async function update(id, fields) {\n  return db.users.update({ id }, fields);\n}\nmodule.exports = { update };\n`,
  'src/routes/admin.js': `const router = require('express').Router();\nrouter.use((req, res, next) => req.user.role === 'admin' ? next() : res.sendStatus(403));\nrouter.get('/stats', async (req, res) => res.json(await db.adminStats()));\nmodule.exports = router;\n`,
  'src/security/passwords.js': `const bcrypt = require('bcrypt');\nasync function verifyPassword(password, digest) { return bcrypt.compare(password, digest); }\nmodule.exports = { verifyPassword };\n`,
  'src/routes/avatar.js': `const path = require('path');\nconst ROOT = path.resolve('/srv/avatars');\nfunction avatarPath(name) {\n  const candidate = path.resolve(ROOT, name);\n  if (!candidate.startsWith(ROOT + path.sep)) throw new Error('outside avatar root');\n  return candidate;\n}\nmodule.exports = { avatarPath };\n`,
  'src/db/query.js': `async function byEmail(email) {\n  return db.oneOrNone('select id from users where email = $1', [email]);\n}\nmodule.exports = { byEmail };\n`
}, [
  finding('broken-object-level-authorization', ['idor','insecure-direct-object-reference','object-level-authorization','bola'], 'HIGH', ['src/routes/invoices.js','src/repos/invoices.js'], [['findbyid','find by id'],['tenant','owner','req.user']], ['tenant','owner','authorization','scope']),
  finding('mass-assignment', ['unsafe-mass-assignment','overposting','over-posting'], 'HIGH', ['src/routes/profile.js','src/repos/users.js'], [['req.body','request body'],['update','fields']], ['allowlist','permitted fields','schema','pick'])
], [
  { id:'authenticated-api-mount', files:['src/app.js','src/middleware/authenticate.js'], rationale:'JWT verification and algorithm pinning protect the API mount but do not provide object authorization.' },
  { id:'admin-role-check', files:['src/routes/admin.js'], rationale:'The administrator route has an explicit role check.' },
  { id:'password-hashing', files:['src/security/passwords.js'], rationale:'bcrypt comparison is an appropriate password verification primitive.' },
  { id:'avatar-canonical-boundary', files:['src/routes/avatar.js'], rationale:'The canonical path is constrained to ROOT plus a separator.' },
  { id:'parameterized-email-query', files:['src/db/query.js'], rationale:'The query uses a parameter placeholder.' }
]);

addTask('held-in', 'redirect-fetch-policy', {
  'src/app.js': `const preview = require('./routes/preview');\nconst continuation = require('./routes/continue');\nconst avatar = require('./routes/avatar');\napp.get('/preview', preview);\napp.get('/continue', continuation);\napp.get('/avatar', avatar);\n`,
  'src/routes/preview.js': `const { isAllowed } = require('../policy/outbound');\nconst { get } = require('../http/client');\nmodule.exports = async function preview(req, res) {\n  const url = String(req.query.url || '');\n  if (!isAllowed(url)) return res.sendStatus(400);\n  return res.send(await get(url, { followRedirects: true }));\n};\n`,
  'src/policy/outbound.js': `const { TRUSTED_ORIGIN } = require('../config');\nfunction isAllowed(url) { return url.startsWith(TRUSTED_ORIGIN); }\nmodule.exports = { isAllowed };\n`,
  'src/routes/continue.js': `module.exports = function continuation(req, res) {\n  return res.redirect(String(req.query.returnTo || '/'));\n};\n`,
  'src/policy/origin.js': `function exactTrustedOrigin(value) {\n  const parsed = new URL(value);\n  return parsed.protocol === 'https:' && parsed.hostname === 'images.example.test' && parsed.port === '';\n}\nmodule.exports = { exactTrustedOrigin };\n`,
  'src/routes/avatar.js': `const { exactTrustedOrigin } = require('../policy/origin');\nmodule.exports = async function avatar(req, res) {\n  if (!exactTrustedOrigin(req.query.url)) return res.sendStatus(400);\n  return res.send(await fetch(req.query.url, { redirect: 'manual' }).then(r => r.arrayBuffer()));\n};\n`,
  'src/http/client.js': `async function get(url, options) {\n  return fetch(url, { redirect: options.followRedirects ? 'follow' : 'manual', signal: AbortSignal.timeout(3000) }).then(r => r.text());\n}\nmodule.exports = { get };\n`,
  'src/logging.js': `function logOutbound(url) {\n  const parsed = new URL(url);\n  console.info({ host: parsed.hostname, pathLength: parsed.pathname.length });\n}\nmodule.exports = { logOutbound };\n`,
  'src/commands/thumbnail.js': `const { spawn } = require('child_process');\nfunction thumbnail(input) { return spawn('convert', [input, '-thumbnail', '200x200', 'thumb.png'], { shell: false }); }\nmodule.exports = { thumbnail };\n`,
  'src/config.js': `module.exports = { TRUSTED_ORIGIN: 'https://trusted.example.test' };\n`
}, [
  finding('ssrf', ['server-side-request-forgery','server-side-request-forgery-ssrf'], 'HIGH', ['src/routes/preview.js','src/policy/outbound.js','src/http/client.js'], [['startswith','prefix'],['followredirects','redirect']], ['parse','hostname','origin','redirect']),
  finding('open-redirect', ['unvalidated-redirect','external-redirect'], 'MEDIUM', ['src/routes/continue.js'], [['returnto','redirect']], ['allowlist','relative','same-origin','validate'])
], [
  { id:'exact-avatar-origin', files:['src/policy/origin.js','src/routes/avatar.js'], rationale:'The URL is parsed and exact protocol, hostname, and port are checked; redirects are disabled.' },
  { id:'bounded-http-client', files:['src/http/client.js'], rationale:'Timeout handling is protective but does not repair the vulnerable preview policy.' },
  { id:'metadata-only-logging', files:['src/logging.js'], rationale:'The logger omits credentials, query values, and response bodies.' },
  { id:'argument-array-process', files:['src/commands/thumbnail.js'], rationale:'spawn uses a fixed executable, argument array, and shell false.' },
  { id:'constant-config-origin', files:['src/config.js'], rationale:'The constant itself is not a secret or vulnerability.' }
]);

addTask('held-in', 'archive-extraction-chain', {
  'src/routes/upload.js': `const { extract } = require('../archive/extract');\nmodule.exports = async function upload(req, res) {\n  const destination = await temporaryDirectory();\n  await extract(req.file.path, destination);\n  return res.json({ destination });\n};\n`,
  'src/archive/extract.js': `const path = require('path');\nconst fs = require('fs');\nconst { runHook } = require('./hooks');\nasync function extract(archivePath, destination) {\n  const archive = await openZip(archivePath);\n  for (const entry of archive.entries) {\n    const output = path.join(destination, entry.name);\n    fs.mkdirSync(path.dirname(output), { recursive: true });\n    fs.writeFileSync(output, entry.data);\n  }\n  if (archive.manifest && archive.manifest.postExtract) runHook(archive.manifest.postExtract);\n}\nmodule.exports = { extract };\n`,
  'src/archive/hooks.js': `const { exec } = require('child_process');\nfunction runHook(script) { exec('sh ' + script); }\nmodule.exports = { runHook };\n`,
  'src/archive/safe-extract.js': `const path = require('path');\nfunction safeOutput(root, name) {\n  const candidate = path.resolve(root, name);\n  if (!candidate.startsWith(path.resolve(root) + path.sep)) throw new Error('outside extraction root');\n  return candidate;\n}\nmodule.exports = { safeOutput };\n`,
  'src/archive/limits.js': `function validateArchive(entries) {\n  if (entries.length > 500) throw new Error('too many entries');\n  if (entries.reduce((n, e) => n + e.size, 0) > 50_000_000) throw new Error('archive too large');\n}\nmodule.exports = { validateArchive };\n`,
  'src/archive/extensions.js': `const ALLOWED = new Set(['.txt','.json','.png']);\nfunction allowed(name) { return ALLOWED.has(require('path').extname(name).toLowerCase()); }\nmodule.exports = { allowed };\n`,
  'src/process/safe-hook.js': `const { spawn } = require('child_process');\nfunction runApproved(name) {\n  if (!['index','thumbnail'].includes(name)) throw new Error('unknown hook');\n  return spawn('/usr/local/bin/archive-hook', [name], { shell: false });\n}\nmodule.exports = { runApproved };\n`,
  'src/storage/temp.js': `const fs = require('fs');\nfunction temporaryDirectory() { return fs.promises.mkdtemp('/srv/archive-'); }\nmodule.exports = { temporaryDirectory };\n`,
  'src/routes/status.js': `module.exports = async function status(req, res) { return res.json({ status: 'ready' }); };\n`,
  'src/config.js': `module.exports = { extractionRoot: '/srv/extracted' };\n`
}, [
  finding('path-traversal', ['directory-traversal','zip-slip','archive-path-traversal'], 'HIGH', ['src/routes/upload.js','src/archive/extract.js'], [['entry.name','entry name'],['path.join','destination']], ['resolve','canonical','separator','reject']),
  finding('command-injection', ['os-command-injection','shell-command-injection'], 'CRITICAL', ['src/archive/extract.js','src/archive/hooks.js'], [['postextract','post extract'],['exec','sh']], ['allowlist','spawn','shell false','remove hook'])
], [
  { id:'unused-safe-extractor', files:['src/archive/safe-extract.js'], rationale:'This helper is safe but the vulnerable extraction path does not call it.' },
  { id:'archive-resource-limits', files:['src/archive/limits.js'], rationale:'Entry and size limits are sensible DoS controls.' },
  { id:'extension-allowlist', files:['src/archive/extensions.js'], rationale:'The extension helper is not a substitute for path confinement but is not itself vulnerable.' },
  { id:'approved-process-helper', files:['src/process/safe-hook.js'], rationale:'The separate helper uses an allowlist, fixed executable, argument array, and shell false.' },
  { id:'secure-temp-directory', files:['src/storage/temp.js'], rationale:'mkdtemp provides an isolated temporary directory.' }
]);

addTask('held-in', 'template-rendering-framework', {
  'app/routes.py': `from flask import request\nfrom .rendering import welcome\n\ndef welcome_route():\n    return welcome(request.args.get('name', 'guest'))\n`,
  'app/rendering.py': `from flask import render_template_string\n\ndef welcome(name):\n    return render_template_string('Welcome ' + name)\n`,
  'app/profile.py': `from flask import request, render_template\n\ndef profile():\n    return render_template('profile.html', bio=request.form.get('bio', ''))\n`,
  'templates/profile.html': `<h1>Profile</h1>\n<div class="bio">{{ bio|safe }}</div>\n`,
  'templates/account.html': `<h1>{{ user.name }}</h1>\n<p>{{ user.email }}</p>\n`,
  'static/comment.js': `export function showComment(node, comment) { node.textContent = comment; }\n`,
  'app/redirects.py': `from urllib.parse import urlparse\n\ndef allowed_redirect(url):\n    parsed = urlparse(url)\n    return parsed.scheme == 'https' and parsed.hostname == 'portal.example.test'\n`,
  'app/security.py': `import bleach\n\ndef sanitized_html(value):\n    return bleach.clean(value, tags=['b','i','p'], attributes={}, strip=True)\n`,
  'app/config.py': `import os\nSECRET_KEY = os.environ['FLASK_SECRET_KEY']\nDEBUG = False\n`,
  'app/db.py': `def user_by_email(db, email):\n    return db.execute('select * from users where email = ?', (email,)).fetchone()\n`
}, [
  finding('server-side-template-injection', ['ssti','template-injection','server-side-template-injection-ssti'], 'CRITICAL', ['app/routes.py','app/rendering.py'], [['render_template_string','template string'],['name','request.args']], ['fixed template','context variable','render_template']),
  finding('cross-site-scripting', ['xss','stored-xss','html-injection'], 'HIGH', ['app/profile.py','templates/profile.html'], [['bio','safe'],['request.form','user input']], ['remove safe','autoescape','sanitize','bleach'])
], [
  { id:'jinja-autoescape-account', files:['templates/account.html'], rationale:'Normal Jinja interpolation is autoescaped.' },
  { id:'dom-text-content', files:['static/comment.js'], rationale:'textContent does not interpret HTML.' },
  { id:'exact-redirect-host', files:['app/redirects.py'], rationale:'The parsed scheme and exact hostname are checked.' },
  { id:'bleach-sanitizer', files:['app/security.py'], rationale:'The sanitizer uses an explicit small tag allowlist.' },
  { id:'safe-config-and-query', files:['app/config.py','app/db.py'], rationale:'The secret is environment-only, debug is disabled, and SQL is parameterized.' }
]);

addTask('held-in', 'broad-service-audit', {
  'src/config/payment.js': `module.exports = { paymentKey: 'sk_live_PRODUCTION_FIXTURE_KEY', region: 'us-east-1' };\n`,
  'src/routes/search.js': `const { rawSearch } = require('../db/search');\nmodule.exports = async function search(req, res) { return res.json(await rawSearch(req.query.q)); };\n`,
  'src/db/search.js': `async function rawSearch(q) { return db.query("select * from products where name like '%" + q + "%'"); }\nmodule.exports = { rawSearch };\n`,
  'src/jobs/import.js': `const serialize = require('node-serialize');\nfunction importJob(req) { return serialize.unserialize(req.body.payload); }\nmodule.exports = { importJob };\n`,
  'src/routes/users.js': `const users = require('../db/users');\nmodule.exports = async function user(req, res) {\n  if (req.user.id !== req.params.id) return res.sendStatus(403);\n  return res.json(await users.byId(req.params.id));\n};\n`,
  'src/db/users.js': `async function byId(id) { return db.query('select id, email from users where id = ?', [id]); }\nmodule.exports = { byId };\n`,
  'src/process/image.js': `const { spawn } = require('child_process');\nfunction resize(file) { return spawn('convert', [file, '-resize', '200x200', 'out.png'], { shell: false }); }\nmodule.exports = { resize };\n`,
  'src/files/download.js': `const path = require('path');\nconst ROOT = path.resolve('/srv/public');\nfunction publicFile(name) {\n  const candidate = path.resolve(ROOT, name);\n  if (!candidate.startsWith(ROOT + path.sep)) throw new Error('outside public root');\n  return candidate;\n}\nmodule.exports = { publicFile };\n`,
  'src/logging/redact.js': `function redact(record) { const copy = { ...record }; delete copy.password; delete copy.token; return copy; }\nmodule.exports = { redact };\n`,
  'src/health.js': `module.exports = function health(req, res) { return res.json({ ok: true }); };\n`
}, [
  finding('hardcoded-secret', ['hardcoded-credentials','hardcoded-secrets','embedded-secret','secret-in-source'], 'HIGH', ['src/config/payment.js'], [['sk_live','paymentkey']], ['environment','secret manager','rotate']),
  finding('sql-injection', ['sqli','sql-injection-vulnerability'], 'HIGH', ['src/routes/search.js','src/db/search.js'], [['rawsearch','query.q'],['select','like']], ['parameter','placeholder','prepared']),
  finding('insecure-deserialization', ['unsafe-deserialization','object-deserialization','untrusted-deserialization'], 'CRITICAL', ['src/jobs/import.js'], [['unserialize','payload']], ['json','schema','remove node-serialize','allowlist'])
], [
  { id:'object-authorization-check', files:['src/routes/users.js'], rationale:'The route compares the authenticated user ID before reading the object.' },
  { id:'parameterized-user-query', files:['src/db/users.js'], rationale:'The user query is parameterized.' },
  { id:'safe-image-process', files:['src/process/image.js'], rationale:'The process uses an argument array and shell false.' },
  { id:'canonical-public-path', files:['src/files/download.js'], rationale:'The candidate is resolved and constrained to the public root.' },
  { id:'credential-redaction', files:['src/logging/redact.js'], rationale:'The logger removes password and token fields.' }
]);

addTask('held-in', 'dependency-config-semantics', {
  'package.json': `{"name":"dependency-config-fixture","private":true,"dependencies":{"lodash":"4.17.20","axios":"1.6.0","jsonwebtoken":"9.0.0","express":"4.19.2","cors":"2.8.5","helmet":"7.1.0"}}\n`,
  'package-lock.json': `{"name":"dependency-config-fixture","lockfileVersion":3,"packages":{"":{"dependencies":{"lodash":"4.17.20","axios":"1.6.0","jsonwebtoken":"9.0.0","express":"4.19.2","cors":"2.8.5","helmet":"7.1.0"}},"node_modules/lodash":{"version":"4.17.20"},"node_modules/axios":{"version":"1.6.0"},"node_modules/jsonwebtoken":{"version":"9.0.0"},"node_modules/express":{"version":"4.19.2"}}}\n`,
  'src/app.js': `const cors = require('cors');\nconst helmet = require('helmet');\napp.use(helmet());\napp.use(cors({ origin: true, credentials: true }));\napp.use('/api', api);\n`,
  'src/routes/preferences.js': `const { mergePreferences } = require('../utils/object');\nmodule.exports = function preferences(req, res) { return res.json(mergePreferences(req.user.settings, req.body)); };\n`,
  'src/utils/object.js': `const _ = require('lodash');\nfunction mergePreferences(current, input) { return _.merge({}, current, input); }\nmodule.exports = { mergePreferences };\n`,
  'src/security/tokens.js': `const jwt = require('jsonwebtoken');\nfunction verify(token) { return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }); }\nmodule.exports = { verify };\n`,
  'src/http/client.js': `const axios = require('axios');\nasync function fetchStatus() { return axios.get('https://status.example.test/health', { timeout: 2000 }); }\nmodule.exports = { fetchStatus };\n`,
  'src/proxy.js': `const TRUSTED = new Set(['10.0.0.10','10.0.0.11']);\nfunction trustProxy(address) { return TRUSTED.has(address); }\nmodule.exports = { trustProxy };\n`,
  'src/config.js': `module.exports = { debug: process.env.NODE_ENV !== 'production', cookieSecure: process.env.NODE_ENV === 'production' };\n`,
  'src/headers.js': `module.exports = { contentSecurityPolicy: "default-src 'self'", frameguard: 'deny' };\n`
}, [
  finding('prototype-pollution', ['lodash-prototype-pollution','vulnerable-lodash','vulnerable-dependency','dependency-vulnerability'], 'HIGH', ['package.json','package-lock.json','src/routes/preferences.js','src/utils/object.js'], [['4.17.20','lodash'],['mergepreferences','req.body','input']], ['upgrade','4.17.21','allowlist','schema']),
  finding('cors-misconfiguration', ['cors','insecure-cors','cors-credentials-exposure','cross-origin-policy-bypass'], 'HIGH', ['src/app.js'], [['origin: true','origin true'],['credentials: true','credentials true']], ['allowlist','specific origin','disable credentials'])
], [
  { id:'safe-axios-version-and-fixed-url', files:['package.json','package-lock.json','src/http/client.js'], rationale:'axios 1.6.0 is outside the frozen vulnerable range and the URL is constant.' },
  { id:'safe-jwt-version-and-algorithm', files:['package.json','src/security/tokens.js'], rationale:'jsonwebtoken 9.0.0 and explicit HS256 pinning avoid the referenced confusion issue.' },
  { id:'safe-express-version', files:['package.json','package-lock.json'], rationale:'Express is at the frozen safe version.' },
  { id:'trusted-proxy-function', files:['src/proxy.js'], rationale:'The proxy decision uses a fixed address allowlist rather than trust proxy true.' },
  { id:'production-aware-config', files:['src/config.js','src/headers.js'], rationale:'Debug and secure-cookie behavior are environment-aware and security headers are configured.' }
]);

addTask('held-out', 'signed-job-envelope', {
  'app/routes.py': `from .jobs import process_job\n\ndef submit_job(request):\n    return process_job(request.body, request.headers.get('X-Signature', ''))\n`,
  'app/jobs.py': `import base64\nimport pickle\nfrom .signatures import verify_signature\nfrom .permissions import run_privileged\n\ndef process_job(body, signature):\n    decoded = base64.b64decode(body)\n    job = pickle.loads(decoded)\n    if job.get('role') == 'admin':\n        run_privileged(job)\n    if not verify_signature(decoded, signature):\n        raise PermissionError('invalid signature')\n    return job\n`,
  'app/signatures.py': `import hashlib\nimport hmac\nimport os\nKEY = os.environ['JOB_SIGNING_KEY'].encode()\n\ndef verify_signature(payload, supplied):\n    expected = hmac.new(KEY, payload, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(expected, supplied)\n`,
  'app/permissions.py': `def run_privileged(job):\n    return admin_queue.submit(job['action'], job.get('args', {}))\n`,
  'app/json_jobs.py': `import json\n\ndef load_json_job(body):\n    value = json.loads(body)\n    return {'action': str(value['action']), 'args': dict(value.get('args', {}))}\n`,
  'app/schema.py': `ALLOWED_ACTIONS = {'thumbnail','index'}\ndef valid_action(action): return action in ALLOWED_ACTIONS\n`,
  'app/storage.py': `def save_result(db, job_id, result):\n    return db.execute('insert into results(id, value) values (?, ?)', (job_id, result))\n`,
  'app/logging.py': `def safe_log(job): return {'action': job.get('action'), 'arg_count': len(job.get('args', {}))}\n`,
  'app/config.py': `import os\nQUEUE_NAME = os.environ.get('QUEUE_NAME', 'jobs')\n`,
  'app/worker.py': `def execute_validated(job):\n    if not valid_action(job['action']): raise ValueError('unknown action')\n    return worker.run(job['action'], job.get('args', {}))\n`
}, [
  finding('insecure-deserialization', ['unsafe-deserialization','pickle-deserialization','object-deserialization'], 'CRITICAL', ['app/routes.py','app/jobs.py'], [['pickle.loads','pickle'],['request.body','decoded']], ['json','safe format','remove pickle','schema']),
  finding('authentication-bypass', ['authorization-bypass','signature-verification-bypass','auth-bypass'], 'CRITICAL', ['app/jobs.py','app/signatures.py','app/permissions.py'], [['run_privileged','role'],['verify_signature','after']], ['verify before','signature before','reject before processing'])
], [
  { id:'strong-hmac-primitive', files:['app/signatures.py'], rationale:'HMAC SHA-256 and compare_digest are sound; the vulnerable issue is their ordering.' },
  { id:'safe-json-loader', files:['app/json_jobs.py'], rationale:'JSON loading does not instantiate arbitrary Python objects.' },
  { id:'action-allowlist', files:['app/schema.py','app/worker.py'], rationale:'The separate worker path validates actions against a fixed set.' },
  { id:'parameterized-result-storage', files:['app/storage.py'], rationale:'The insert query uses placeholders.' },
  { id:'metadata-only-logging', files:['app/logging.py','app/config.py'], rationale:'The logger omits secrets and the queue name is not sensitive.' }
]);

addTask('held-out', 'oauth-registration-policy', {
  'src/oauth/register.js': `const clients = require('./client-repo');\nfunction validateRedirect(clientId, redirectUri) {\n  const client = clients.byId(clientId);\n  return redirectUri.startsWith(client.baseUrl);\n}\nmodule.exports = { validateRedirect };\n`,
  'src/oauth/client-repo.js': `const CLIENTS = { portal: { baseUrl: 'https://portal.example.test' } };\nfunction byId(id) { return CLIENTS[id]; }\nmodule.exports = { byId };\n`,
  'src/oauth/token.js': `const { fetchKey } = require('./jwks');\nasync function verifyExternalToken(header, token) {\n  const key = await fetchKey(header.jku);\n  return verifyJwt(token, key, { algorithms: ['RS256'] });\n}\nmodule.exports = { verifyExternalToken };\n`,
  'src/oauth/jwks.js': `async function fetchKey(url) {\n  if (!String(url).startsWith('https://keys.example.test')) throw new Error('unknown key server');\n  return fetch(url, { redirect: 'follow' }).then(r => r.text());\n}\nmodule.exports = { fetchKey };\n`,
  'src/oauth/state.js': `const crypto = require('crypto');\nfunction newState(session) { const value = crypto.randomBytes(32).toString('hex'); session.oauthState = value; return value; }\nfunction verifyState(session, supplied) { return crypto.timingSafeEqual(Buffer.from(session.oauthState), Buffer.from(supplied)); }\nmodule.exports = { newState, verifyState };\n`,
  'src/oauth/pkce.js': `const crypto = require('crypto');\nfunction challenge(verifier) { return crypto.createHash('sha256').update(verifier).digest('base64url'); }\nmodule.exports = { challenge };\n`,
  'src/oauth/exact-redirect.js': `function exactRedirect(registered, supplied) {\n  const a = new URL(registered); const b = new URL(supplied);\n  return a.protocol === b.protocol && a.hostname === b.hostname && a.port === b.port && a.pathname === b.pathname;\n}\nmodule.exports = { exactRedirect };\n`,
  'src/http/safe-jwks.js': `async function fixedJwks() { return fetch('https://keys.example.test/.well-known/jwks.json', { redirect: 'manual' }); }\nmodule.exports = { fixedJwks };\n`,
  'src/config.js': `module.exports = { issuer: 'https://issuer.example.test', algorithms: ['RS256'] };\n`,
  'src/logging.js': `function oauthLog(event) { console.info({ clientId: event.clientId, outcome: event.outcome }); }\nmodule.exports = { oauthLog };\n`
}, [
  finding('open-redirect', ['unvalidated-redirect','oauth-redirect-uri-bypass','redirect-uri-bypass'], 'HIGH', ['src/oauth/register.js','src/oauth/client-repo.js'], [['startswith','baseurl'],['redirecturi','redirect uri']], ['exact match','parse','registered uri']),
  finding('ssrf', ['server-side-request-forgery','jku-ssrf','remote-key-ssrf'], 'CRITICAL', ['src/oauth/token.js','src/oauth/jwks.js'], [['jku','fetchkey'],['startswith','redirect']], ['fixed endpoint','hostname','disable redirects','allowlist'])
], [
  { id:'oauth-state-protection', files:['src/oauth/state.js'], rationale:'State is random and compared with timingSafeEqual.' },
  { id:'pkce-sha256', files:['src/oauth/pkce.js'], rationale:'The PKCE challenge uses SHA-256.' },
  { id:'exact-redirect-helper', files:['src/oauth/exact-redirect.js'], rationale:'This helper compares parsed redirect components exactly, but the vulnerable registration path does not use it.' },
  { id:'fixed-jwks-endpoint', files:['src/http/safe-jwks.js'], rationale:'The separate helper uses a fixed endpoint and disables redirects.' },
  { id:'metadata-only-oauth-log', files:['src/logging.js','src/config.js'], rationale:'The logger omits tokens and secrets, and the issuer config is public metadata.' }
]);

addTask('held-out', 'secret-fallback-logging', {
  'src/config.js': `module.exports = { paymentKey: process.env.PAYMENT_KEY || 'sk_live_FALLBACK_PRODUCTION_KEY' };\n`,
  'src/payments.js': `const { paymentKey } = require('./config');\nfunction client() { return new PaymentClient(paymentKey); }\nmodule.exports = { client };\n`,
  'src/auth/login.js': `const logger = require('../logging/logger');\nasync function login(req, res) {\n  const token = await authenticate(req.body.email, req.body.password);\n  logger.info({ email: req.body.email, password: req.body.password, token });\n  return res.json({ token });\n}\nmodule.exports = { login };\n`,
  'src/logging/logger.js': `function info(record) { process.stdout.write(JSON.stringify(record) + '\\n'); }\nmodule.exports = { info };\n`,
  'src/logging/redact.js': `function redact(record) { const copy = { ...record }; delete copy.password; delete copy.token; return copy; }\nmodule.exports = { redact };\n`,
  'src/test-fixtures.js': `module.exports = { fakeKey: 'sk_test_fixture_only_123', fakeToken: 'test-token-not-valid' };\n`,
  'src/security/hash.js': `const bcrypt = require('bcrypt');\nasync function hash(password) { return bcrypt.hash(password, 12); }\nmodule.exports = { hash };\n`,
  'src/config-safe.js': `function requiredSecret(name) { if (!process.env[name]) throw new Error(name + ' required'); return process.env[name]; }\nmodule.exports = { requiredSecret };\n`,
  'src/routes/health.js': `module.exports = function health(req, res) { return res.json({ status: 'ok', version: 3 }); };\n`,
  'package.json': `{"name":"secret-fallback-fixture","private":true,"dependencies":{"bcrypt":"5.1.1"}}\n`
}, [
  finding('hardcoded-secret', ['hardcoded-credentials','hardcoded-secrets','embedded-secret','secret-fallback'], 'HIGH', ['src/config.js','src/payments.js'], [['sk_live','fallback'],['paymentkey','payment key']], ['remove fallback','environment','secret manager','rotate']),
  finding('sensitive-data-exposure', ['sensitive-information-exposure','credential-logging','secret-logging','cleartext-logging'], 'HIGH', ['src/auth/login.js','src/logging/logger.js'], [['password','token'],['logger.info','stdout']], ['redact','omit','structured logging','never log'])
], [
  { id:'unused-redaction-helper', files:['src/logging/redact.js'], rationale:'The helper is safe but the vulnerable login path does not call it.' },
  { id:'test-only-fake-secret', files:['src/test-fixtures.js'], rationale:'The values are explicitly test-only and use a non-production prefix.' },
  { id:'bcrypt-password-hash', files:['src/security/hash.js'], rationale:'bcrypt with cost 12 is an appropriate password hashing primitive.' },
  { id:'required-environment-secret', files:['src/config-safe.js'], rationale:'The separate helper fails closed when an environment secret is missing.' },
  { id:'non-sensitive-health-metadata', files:['src/routes/health.js','package.json'], rationale:'Health status/version and the bcrypt dependency do not expose credentials.' }
]);

json(path.join(dst, 'suite-manifest.json'), {
  suite: 'security-review-qualification-v3',
  target: 'security-review',
  primary_class: 'knowledge-rule-policy',
  primary_path: 'C-density-pruning',
  tasks: { held_in: 6, held_out: 3 },
  diagnostic_repeats: 1,
  variants: ['no-skill','minimal','official-full'],
  model: 'GLM-5.2 via Volcengine Ark coding/v3',
  held_out_visibility: 'hidden-from-proposer',
  q4: 'not_measured',
  constraints: { input_files_min:8, input_files_max:12, true_findings_min:2, true_findings_max:3, protected_decoys_min:3, protected_decoys_max:5 },
  status: 'fixture-authoring'
});
console.log('created ' + dst);
