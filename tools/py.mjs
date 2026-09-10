#!/usr/bin/env node
// Cross-platform Python launcher for the package.json scripts: tries python3, python, then the Windows `py` launcher.
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
// Windows first tries the `py` launcher: `python3`/`python` are often Store stubs that print an install hint.
const candidates = process.platform === 'win32' ? [['py', ['-3']], ['python', []], ['python3', []]] : [['python3', []], ['python', []], ['py', ['-3']]];
for (const [cmd, pre] of candidates) {
  const r = spawnSync(cmd, [...pre, ...args], { stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } });
  if (r.error?.code === 'ENOENT') continue;
  if (r.status === 9009) continue; // Windows: command not found
  process.exit(r.status ?? 1);
}
console.error('No Python interpreter found (tried python3, python, py). Install Python 3.10+ from python.org or the Microsoft Store.');
process.exit(1);
