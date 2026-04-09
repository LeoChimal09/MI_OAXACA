import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function getStagedFiles() {
  const output = run('git diff --cached --name-only --diff-filter=ACMR');
  if (!output) return [];
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getStagedContent(filePath) {
  try {
    return run(`git show :"${filePath.replace(/"/g, '\\"')}"`);
  } catch {
    return '';
  }
}

const secretPatterns = [
  { name: 'AWS access key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private key block', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Generic API key assignment', regex: /(api[_-]?key|secret|token)\s*[:=]\s*['\"][A-Za-z0-9_\-\/+=]{16,}['\"]/i },
  { name: 'GitHub token', regex: /ghp_[A-Za-z0-9]{36}/ },
  { name: 'Stripe secret key', regex: /sk_(live|test)_[A-Za-z0-9]{16,}/ },
];

const files = getStagedFiles();
if (files.length === 0) {
  process.exit(0);
}

const findings = [];
for (const filePath of files) {
  const content = getStagedContent(filePath);
  if (!content) continue;

  for (const pattern of secretPatterns) {
    if (pattern.regex.test(content)) {
      findings.push({ filePath, pattern: pattern.name });
    }
  }
}

if (findings.length > 0) {
  console.error('Potential secret(s) detected in staged changes:');
  findings.forEach((finding) => {
    console.error(`- ${finding.filePath}: ${finding.pattern}`);
  });
  console.error('Remove or rotate secrets before committing.');
  process.exit(1);
}

process.exit(0);
