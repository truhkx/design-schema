import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The repository root (tools/lib/../..). */
export const REPO_ROOT: string = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
