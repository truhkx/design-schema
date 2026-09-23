/**
 * tools/check_hooks.ts — `checkComponent` against a sandbox stylesheet: which locked bindings must declare
 * their `--ds-*` hook on a platform.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { checkComponent, styleFile } from '../check_hooks.ts';

let root = '';
afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = '';
});

const withCss = (css: string): void => {
  root = mkdtempSync(join(tmpdir(), 'check-hooks-'));
  const file = styleFile(root, 'web', 'Button');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, css);
};

describe('checkComponent', () => {
  test('a locked binding without its hook is missing', () => {
    withCss('.ds-button { color: var(--color-foreground); }\n');
    const f = checkComponent(root, 'web', { name: 'Button', styles: { foreground: { token: 'color.foreground', locked: true } } });
    expect(f?.missing).toEqual(['foreground']);
  });

  test('a locked binding scoped to other platforms needs no hook here', () => {
    withCss('.ds-button { color: var(--color-foreground); }\n');
    const styles = { touchTarget: { token: 'size.target.comfortable', platforms: ['rn', 'swiftui'], locked: true } };
    expect(checkComponent(root, 'web', { name: 'Button', styles })).toBeNull();
  });

  test('a locked binding on a composed child\'s part is exempt, like a forward', () => {
    withCss('.ds-button { color: var(--color-foreground); }\n');
    const f = checkComponent(root, 'web', {
      name: 'Button',
      composition: { errorMessage: { component: 'Text', props: { tone: 'danger' } } },
      styles: { errorText: { token: 'color.foreground.danger', part: 'errorMessage', locked: true } },
    });
    expect(f?.missing).toEqual([]);
    expect(f?.forwarded).toEqual(['errorText']);
  });

  test('a locked binding on a part the component draws itself still needs its hook', () => {
    withCss('.ds-button { color: var(--color-foreground); }\n');
    const f = checkComponent(root, 'web', {
      name: 'Button',
      composition: { label: { component: 'Text' } },
      styles: { tickColor: { token: 'color.foreground.muted', part: 'tickMarks', locked: true } },
    });
    expect(f?.missing).toEqual(['tickColor']);
  });

  test('a locked binding scoped to this platform still needs its hook', () => {
    withCss('.ds-button { color: var(--color-foreground); }\n');
    const styles = { outline: { token: 'color.border.focus', platforms: ['web', 'lit'], locked: true } };
    expect(checkComponent(root, 'web', { name: 'Button', styles })?.missing).toEqual(['outline']);
  });
});
