/**
 * Shared fixtures for the tools tests (the port of tests/conftest.py): a component that passes the schema and
 * tools/parse.ts's extra rules, a theme, a per-test temp folder, and a way to point the parser at it.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, expect, vi } from 'vitest';

import { dump } from '../lib/pyyaml.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';

// A component that passes schema/component.ts and tools/parse.ts's extra rules. Tests break one rule at a time
// from this baseline.
export const VALID_COMPONENT: Dict = {
  name: 'Widget',
  category: 'action',
  status: 'review',
  anatomy: ['container', 'label'],
  props: {
    label: { type: 'string', required: true, description: 'Visible text.' },
    variant: { type: 'enum', values: ['primary', 'danger'], default: 'primary', description: 'Visual emphasis.' },
    size: { type: 'enum', enumRef: 'size', values: ['sm', 'md'], default: 'md', description: 'Padding scale.' },
  },
  events: {
    onPress: { description: 'Activated.', platforms: { web: 'onClick', rn: 'onPress' } },
  },
  styles: {
    background: { token: 'color.action.{variant}.background' },
    paddingInline: { token: 'space.{size}' },
    radius: { token: 'radius.md' },
  },
  a11y: {
    role: 'button',
    requires: ['accessible-name', 'focus-visible', 'contrast-aa'],
    contrast: [{ foreground: 'color.action.{variant}.foreground', background: 'color.action.{variant}.background', level: 'AA' }],
  },
  platforms: { web: { element: 'button' }, rn: { element: 'Pressable' } },
};

export const VALID_THEME: Dict = {
  id: 'test-theme',
  status: 'review',
  tone: ['calm', 'precise'],
  not: 'playful',
  seed: { color: '#3B5BDB', typeface: 'system', mono: 'system' },
  neutralTint: 0.25,
  scale: { base: 16, ratio: 1.2 },
  radius: 'sm',
  density: 'comfortable',
  motion: 'subtle',
  modes: { default: 'light', supports: ['light', 'dark'] },
};

/** A fresh deep copy per test, so mutations don't leak between tests. */
export function component(): Dict {
  return structuredClone(VALID_COMPONENT);
}

export function theme(): Dict {
  return structuredClone(VALID_THEME);
}

/** `yaml.safe_dump({**top, "component": component}, sort_keys=False, allow_unicode=True)`. */
export function fmText(c: Dict, top: Dict = {}): string {
  return dump({ ...top, component: c }, true);
}

export const BODY = `
Intro prose before any heading.

## When to use

Use it when you need it.

## Accessibility

It is accessible.
`;

export function write(file: string, text: string): string {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text, 'utf8');
  return file;
}

/** A temp folder per test (pytest's `tmp_path`). Call at the top level of a test file. */
export function useTmp(): () => string {
  let dir = '';
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ds-parse-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  return () => dir;
}

/** Restore `parse.paths` and `parse.hooks` after every test (pytest's `monkeypatch`). */
export function usePaths(): void {
  const savedPaths = { ...parse.paths };
  const savedHooks = { ...parse.hooks };
  afterEach(() => {
    Object.assign(parse.paths, savedPaths);
    Object.assign(parse.hooks, savedHooks);
  });
}

/** Capture what the tool writes to stdout/stderr (pytest's `capsys`). */
export function useStd(): { out: () => string; err: () => string } {
  let out = '';
  let err = '';
  beforeEach(() => {
    out = '';
    err = '';
    vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string | Uint8Array) => { out += String(chunk); return true; }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: string | Uint8Array) => { err += String(chunk); return true; }) as typeof process.stderr.write);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  return { out: () => out, err: () => err };
}

/** `pytest.raises(DocError, match=pattern)`: a DocError whose message matches (re.search semantics). */
export function expectDocError(fn: () => unknown, pattern: string | RegExp): void {
  let caught: unknown;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  expect(caught, 'expected a DocError').toBeInstanceOf(parse.DocError);
  expect((caught as Error).message).toMatch(pattern);
}
