/** tools/behavior_tests.ts — tests derived from a component's `behavior` scenarios
 *  (port of tests/test_behavior_tests.py). */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as bt from '../behavior_tests.ts';
import type { Dict } from '../behavior_tests.ts';
import { pyReEscape } from '../lib/py.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const WIDGET: Dict = {
  name: 'Widget',
  anatomy: ['control', 'label'],
  props: { label: { type: 'string', required: true, description: 'Visible text.' } },
  events: {
    onPress: { description: 'Activated.', platforms: { web: 'onPress', lit: 'press', rn: 'onPress' } },
  },
  copy: { required: '{label} is required.' },
  a11y: { role: 'button', requires: [] },
  platforms: {
    web: { element: 'button' },
    lit: { tag: 'ds-widget' },
    rn: { element: 'Pressable' },
  },
};

const CLICK: Dict = { name: 'click-fires', when: { click: 'control' }, then: [{ event: 'onPress', with: true }] };
const BAD: Dict = { name: 'has-weird-attr', then: [{ attribute: 'data-x', is: 'y' }] };
const SCENARIOS = [CLICK, BAD];

function titlesOf(content: string): string[] {
  return [...content.matchAll(/^ {2}test\('(.*?)',/gm)].map((m) => m[1] as string);
}

function skipsOf(content: string): string[] {
  return [...content.matchAll(/^ {2}test\.skip\('(.*?)',/gm)].map((m) => m[1] as string);
}

const tmp = useTmp();
const std = useStd();

const savedPaths = { ...bt.paths };
afterEach(() => {
  Object.assign(bt.paths, savedPaths);
});

describe('scenarioBlock', () => {
  test('a mappable scenario becomes a test', () => {
    expect(bt.scenarioBlock(WIDGET, CLICK, 'web').startsWith("  test('click-fires',")).toBe(true);
  });

  test('an unmappable assertion becomes a skip with its reason', () => {
    const block = bt.scenarioBlock(WIDGET, BAD, 'web');
    expect(block.startsWith("  test.skip('has-weird-attr — ")).toBe(true);
    expect(block).toContain('attribute');
  });

  test('unrecognized `then` keys are unmappable', () => {
    const sc: Dict = { name: 'mystery', then: [{ somethingNobodyDeclared: true }] };
    expect(() => bt.thenItemLines(WIDGET, sc.then[0] as Dict, 'web')).toThrow(/unrecognized assertion keys/);
  });

  test("focused 'moved' and 'unchanged' are unmappable", () => {
    expect(() => bt.thenFocusedLines(WIDGET, 'moved', 'web')).toThrow(/pre-action focus snapshot/);
    expect(() => bt.thenFocusedLines(WIDGET, 'unchanged', 'web')).toThrow(/pre-action focus snapshot/);
  });

  test('multiple interactions in one `when` are unmappable', () => {
    const sc: Dict = { name: 'two-things', when: { click: 'control', key: 'Enter' }, then: [{ renders: true }] };
    expect(() => bt.whenLines(WIDGET, sc, 'web')).toThrow(/only one interaction/);
  });
});

describe('generated files contain one test per scenario', () => {
  test.each([
    ['web', bt.webFile],
    ['rn', bt.rnFile],
    ['lit', bt.litFile],
  ])('%s: one test and one skip', (_platform, builder) => {
    const content = (builder as (c: Dict, s: Dict[]) => string)(WIDGET, SCENARIOS);
    expect(titlesOf(content)).toEqual(['click-fires']);
    expect(skipsOf(content)).toHaveLength(1);
    expect(skipsOf(content)[0]).toContain('has-weird-attr');
  });

  test('web event prop and call signature', () => {
    const content = bt.webFile(WIDGET, SCENARIOS);
    expect(content).toContain('onPress: events.onPress');
    expect(content).toContain('toHaveBeenCalledWith(true, expect.anything());');
  });

  test('rn event prop and call signature', () => {
    const content = bt.rnFile(WIDGET, SCENARIOS);
    expect(content).toContain('onPress: events.onPress');
    expect(content).toContain('toHaveBeenCalledWith(true);');
    expect(content).not.toContain('toHaveBeenCalledWith(true, expect.anything())');
  });

  test("lit event uses the platforms' lit dispatch name", () => {
    const content = bt.litFile(WIDGET, SCENARIOS);
    expect(content).toContain("el.addEventListener('press', events.onPress");
    expect(content).toContain('toContain(true)');
  });
});

describe('partLocator', () => {
  test('the primary part is located by role with the root as fallback', () => {
    expect(bt.partLocatorBody(WIDGET, 'control', 'web')).toBe("(screen.queryByRole('button') ?? s.root()) as HTMLElement");
    expect(bt.partLocatorBody(WIDGET, 'control', 'rn')).toBe("screen.queryByRole('button') ?? s.root()");
  });

  test.each(['none', 'text', 'landmark', 'presentation'])('the role %s cannot be queried and never reaches getByRole', (role) => {
    const c = { ...WIDGET, a11y: { role, requires: [] } };
    expect(bt.partLocatorBody(c, 'control', 'web')).toBe('s.root()');
    expect(bt.partLocatorBody(c, 'control', 'rn')).toBe('s.root()');
    expect(bt.partLocatorBody(c, 'control', 'lit')).not.toContain('role=');
  });

  test('the root is the data-ds hook first', () => {
    const web = bt.rootLocatorBody(WIDGET, 'web');
    // the hook is searched document-wide: portals render outside the container
    expect(web.startsWith('(document.querySelector(\'[data-ds="Widget"]\')')).toBe(true);
    expect(web).toContain("screen.queryByRole('button')");
    expect(web.endsWith('utils.container.firstElementChild) as HTMLElement')).toBe(true);
    expect(bt.rootLocatorBody({ ...WIDGET, a11y: { role: 'none', requires: [] } }, 'web')).not.toContain('queryByRole');
    expect(bt.rootLocatorBody(WIDGET, 'rn')).toBe("screen.queryByTestId('Widget') ?? screen.UNSAFE_root");
  });

  test('lit primary tries role, then part, then first child through shadow roots', () => {
    const body = bt.partLocatorBody(WIDGET, 'control', 'lit');
    expect(body.indexOf('[role="button"]')).toBeLessThan(body.indexOf('[part="control"]'));
    expect(body.indexOf('[part="control"]')).toBeLessThan(body.indexOf('root.firstElementChild'));
    expect(body.startsWith('(deep(root,')).toBe(true);
  });

  test('a part matching a string prop is located by its text', () => {
    expect(bt.partLocatorBody(WIDGET, 'label', 'web')).toBe('screen.getByText(props.label)');
    expect(bt.partLocatorBody(WIDGET, 'label', 'rn')).toBe('screen.getByText(props.label)');
  });

  test('an unhooked part falls back to the data-part or testID convention', () => {
    expect(bt.partLocatorBody(WIDGET, 'indicator', 'web')).toContain('data-part="indicator"');
    expect(bt.partLocatorBody(WIDGET, 'indicator', 'rn')).toBe("screen.queryByTestId('Widget.indicator') ?? s.root()");
  });

  test('lit tries the native part attribute then data-part', () => {
    const body = bt.partLocatorBody(WIDGET, 'label', 'lit');
    expect(body).toContain('part="label"');
    expect(body).toContain('data-part="label"');
  });
});

describe('usedParts', () => {
  test('the primary part is always included', () => {
    expect(bt.usedParts(WIDGET, [{ name: 'no-interaction', then: [{ renders: true }] }])).toEqual(['control']);
  });

  test('parts referenced by `when` or `then` are added in anatomy order', () => {
    const sc: Dict = { name: 'x', when: { click: 'label' }, then: [{ event: 'onPress' }] };
    expect(bt.usedParts(WIDGET, [sc])).toEqual(['control', 'label']);
  });
});

describe('regexExpr', () => {
  test('a literal string is escaped', () => {
    expect(bt.regexExpr('Accept the (terms).')).toBe(`new RegExp(${bt.js(pyReEscape('Accept the (terms).'))})`);
  });

  test('a {label} placeholder becomes a runtime substitution', () => {
    expect(bt.regexExpr('{label} is required.')).toBe(`new RegExp(escapeRegExp(s.props.label) + ${bt.js(pyReEscape(' is required.'))})`);
  });

  test('leading and trailing whitespace is trimmed like Testing Library does', () => {
    expect(bt.regexExpr(' (required)')).toBe(`new RegExp(${bt.js(pyReEscape('(required)'))})`);
  });
});

describe('main', () => {
  let generated = '';
  let out = '';

  function entry(behavior: Dict[] = [], derived: Dict[] = []): Dict {
    return { component: { ...WIDGET, behavior }, behaviorDerived: derived };
  }

  function writeEntries(entries: Dict[]): void {
    write(join(generated, 'components.json'), JSON.stringify(entries));
  }

  function files(): string[] {
    return readdirSync(out).filter((n) => n.includes('.test.')).sort();
  }

  beforeEach(() => {
    generated = join(tmp(), 'generated');
    out = join(generated, 'behavior');
    mkdirSync(generated, { recursive: true });
    Object.assign(bt.paths, { ROOT: tmp(), GENERATED: generated, OUT: out });
    for (const platform of bt.PLATFORMS) {
      // the component exists in every package
      write(join(tmp(), (bt.SOURCE_FILE[platform] as string).replace('{name}', 'Widget')), 'export {};');
    }
  });

  test('a component not generated yet gets no test file', () => {
    rmSync(join(tmp(), (bt.SOURCE_FILE.lit as string).replace('{name}', 'Widget')));
    writeEntries([entry([CLICK])]);
    bt.main();
    expect(files()).toEqual(['Widget.rn.test.tsx', 'Widget.web.test.tsx']);
    expect(std.out()).toContain('1 target(s) not generated yet');
  });

  test('writes one file per supported platform', () => {
    writeEntries([entry([CLICK])]);
    expect(bt.main()).toBe(0);
    expect(files()).toEqual(['Widget.lit.test.ts', 'Widget.rn.test.tsx', 'Widget.web.test.tsx']);
  });

  test('components with no scenarios at all are skipped', () => {
    writeEntries([entry()]);
    bt.main();
    expect(files()).toEqual([]);
  });

  test('stale files are removed on every run', () => {
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'Gone.web.test.tsx'), '// old', 'utf8');
    writeEntries([entry([CLICK])]);
    bt.main();
    expect(files()).not.toContain('Gone.web.test.tsx');
  });

  test('derived scenarios alone are enough to write a file', () => {
    writeEntries([entry([], [{ name: 'renders', then: [{ renders: true }], derived: true }])]);
    bt.main();
    expect(files()).toContain('Widget.web.test.tsx');
  });
});

describe('surfaces', () => {
  const OVERLAY: Dict = {
    ...WIDGET,
    name: 'Sheet',
    anatomy: ['surface'],
    a11y: { role: 'dialog', requires: [] },
    props: { open: { type: 'boolean', description: 'x' }, title: { type: 'string', required: true, description: 'x' } },
  };

  test('a closed-by-default overlay is opened for scenarios that need its surface', () => {
    const block = bt.scenarioBlock(OVERLAY, { name: 'renders', then: [{ renders: true }] }, 'web');
    expect(block).toContain('setup({"open": true})');
  });

  test('an authored open value is kept', () => {
    const block = bt.scenarioBlock(OVERLAY, { name: 'closed', given: { open: false }, then: [{ renders: true }] }, 'web');
    expect((block.split('setup(')[1] as string).split(')')[0]).not.toContain('true');
  });

  test('a component without an open prop is untouched', () => {
    expect(bt.scenarioBlock(WIDGET, { name: 'renders', then: [{ renders: true }] }, 'web')).not.toContain('open');
  });

  test('a hover surface is skipped with the reason', () => {
    const tip = { ...WIDGET, name: 'Tooltip', a11y: { role: 'tooltip', requires: [] } };
    const block = bt.scenarioBlock(tip, { name: 'renders', then: [{ renders: true }] }, 'web');
    expect(block.startsWith("  test.skip('renders")).toBe(true);
    expect(block).toContain('needs its trigger hovered');
    expect(block).toContain("\\'tooltip\\'"); // quotes inside the reason are escaped for the JS string literal
  });
});

describe('name and renders', () => {
  test('renders never queries by role', () => {
    for (const platform of bt.PLATFORMS) {
      expect(bt.thenRendersLines(WIDGET, platform).some((ln) => ln.includes('ByRole'))).toBe(false);
    }
  });

  test('name uses the prop that carries the accessible name', () => {
    expect(bt.thenNameLines(WIDGET, 'web')).toEqual(["expect(screen.getByRole('button', { name: s.props.label })).toBeInTheDocument();"]);
    const icon: Dict = {
      ...WIDGET,
      name: 'Icon',
      anatomy: ['glyph'],
      a11y: { role: 'img', requires: ['accessible-name'] },
      props: { label: { type: 'string', description: 'x', a11y: 'aria-label when set' } },
    };
    expect(bt.thenNameLines(icon, 'web')[0]).toContain('s.props.label');
  });

  test('name without a naming prop asserts a non-empty name', () => {
    const heading: Dict = {
      ...WIDGET,
      name: 'Heading',
      anatomy: ['text'],
      a11y: { role: 'heading', requires: ['accessible-name'] },
      props: { children: { type: 'content', required: true, description: 'x' } },
    };
    expect(bt.thenNameLines(heading, 'web')).toEqual(["expect(screen.getByRole('heading')).toHaveAccessibleName();"]);
  });

  test('name on an unqueryable role is unmappable', () => {
    const text = { ...WIDGET, a11y: { role: 'text', requires: [] } };
    expect(() => bt.thenNameLines(text, 'web')).toThrow(/cannot be queried/);
  });
});

describe('lit focus', () => {
  // Focus inside shadow roots: document.activeElement is the host, so assertions walk the active chain.
  test('focusable checks the host is in the active chain', () => {
    expect(bt.thenFocusableLines(WIDGET, 'lit')).toEqual(['s.el.focus();', 'expect(activeChain()).toContain(s.el);']);
  });

  test('focused part and none use the chain', () => {
    expect(bt.thenFocusedLines(WIDGET, 'label', 'lit')).toEqual(['expect(activeChain()).toContain(s.label());']);
    expect(bt.thenFocusedLines(WIDGET, 'none', 'lit')).toEqual(['expect(activeChain()).not.toContain(s.el);']);
  });

  test('the lit file carries the helper', () => {
    const content = bt.litFile(WIDGET, [{ name: 'f', then: [{ focusable: true }] }]);
    expect(content).toContain('function activeChain()');
    expect(content).toContain('expect(activeChain()).toContain(s.el);');
  });
});

describe('js — json.dumps, not JSON.stringify', () => {
  test('the separators and non-ASCII escaping Python used', () => {
    expect(bt.js({ open: true, n: 2 })).toBe('{"open": true, "n": 2}');
    expect(bt.js('an — em dash')).toBe('"an \\u2014 em dash"');
    expect(bt.js([1, 'a'])).toBe('[1, "a"]');
  });
});
