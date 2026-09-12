/**
 * What the gates that read `generated/components.json` share: the reader itself, and the "empty the
 * output folder first" step every one of them runs so a component that lost its block loses its file.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import { readText } from './py.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dict = Record<string, any>;

/** One entry of generated/components.json: `{ component, behaviorDerived, sections, … }`. */
export type Entry = Dict;

/** `json.loads((GENERATED / "components.json").read_text(encoding="utf-8"))`. */
export function readComponents(file: string): Entry[] {
  return JSON.parse(readText(file)) as Entry[];
}

/** `OUT.mkdir(parents=True, exist_ok=True)` followed by `for old in OUT.glob(pattern): old.unlink()`. */
export function freshOutDir(dir: string, matches: (name: string) => boolean): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    if (matches(name)) unlinkSync(join(dir, name));
  }
}
