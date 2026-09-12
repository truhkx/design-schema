/**
 * Process helpers the tools share: `shutil.which()` and the quoting cmd.exe wants, for the two places
 * a tool has to launch something (tools/checks.ts runs the gates, tools/generate.ts runs `claude`).
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, statSync } from 'node:fs';
import { delimiter, join } from 'node:path';

/** `shutil.which(cmd)`: the first PATH entry that exists, trying every PATHEXT suffix on Windows. */
export function which(cmd: string): string | null {
  const exts = process.platform === 'win32' ? (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';') : [''];
  const dirs = (process.env.PATH ?? '').split(delimiter);
  if (process.platform === 'win32') dirs.unshift(process.cwd());
  for (const dir of dirs) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, cmd + (cmd.toLowerCase().endsWith(ext.toLowerCase()) ? '' : ext));
      try {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
      } catch {
        // an unreadable PATH entry is not a match
      }
    }
  }
  return null;
}

/** cmd.exe needs the quoting `subprocess` does for us on POSIX; the repo path has a space in it. */
export function winQuote(arg: string): string {
  if (arg === '') return '""'; // an unquoted empty argument would vanish on the command line
  return /[\s"^&|<>()]/.test(arg) ? `"${arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1')}"` : arg;
}
