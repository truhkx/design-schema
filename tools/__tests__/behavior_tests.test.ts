/** tools/behavior_tests.ts — tests derived from a component's `behavior` scenarios
 *  (port of tests/test_behavior_tests.py). */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { PLATFORMS, TS_PLATFORMS } from '../../schema/platforms.ts';
import * as bt from '../behavior_tests.ts';
import type { Dict } from '../behavior_tests.ts';
import { pyReEscape } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const WIDGET: Dict = {
  name: 'Widget',
  anatomy: ['control', 'label'],
  props: { label: { type: 'string', required: true, a11yRole: 'accessible-name', description: 'Visible text.' } },
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
const BAD: Dict = { name: 'focus-moves', then: [{ focused: 'moved' }] };
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
    expect(block.startsWith("  test.skip('focus-moves — ")).toBe(true);
    expect(block).toContain('pre-action focus snapshot');
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
    expect(skipsOf(content)[0]).toContain('focus-moves');
  });

  test('web event prop and call signature', () => {
    const content = bt.webFile(WIDGET, SCENARIOS);
    expect(content).toContain('onPress: events.onPress');
    expect(content).toContain('toHaveBeenCalledWith(true);');
    expect(content).not.toContain('expect.anything()');
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

  test("rn queries its own platforms.rn.role; web and Lit keep the ARIA role", () => {
    const c = { ...WIDGET, a11y: { role: 'slider', requires: [] }, platforms: { ...WIDGET.platforms, rn: { element: 'View', role: 'adjustable' } } };
    expect(bt.partLocatorBody(c, 'control', 'rn')).toBe("screen.queryByRole('adjustable') ?? s.root()");
    expect(bt.partLocatorBody(c, 'control', 'web')).toBe("(screen.queryByRole('slider') ?? s.root()) as HTMLElement");
    expect(bt.thenNameLines(c, 'rn').join('\n')).toContain("getByRole('adjustable', { name: s.props.label })");
    expect(bt.thenNameLines(c, 'web').join('\n')).toContain("getByRole('slider', { name: s.props.label })");
  });

  const LANDMARK_PROPS = { role: { type: 'enum', values: ['navigation', 'main'], required: true, description: 'Which landmark.' } };

  test.each([
    ['none', { role: 'none', requires: [] }],
    ['presentation', { role: 'presentation', requires: [] }],
    ['generic', { role: 'generic', requires: [] }],
    ['roleFrom with no default', { roleFrom: 'role', requires: [] }],
  ])('the role %s cannot be queried and never reaches getByRole', (_label, a11y) => {
    const c = { ...WIDGET, props: LANDMARK_PROPS, a11y };
    expect(bt.partLocatorBody(c, 'control', 'web')).toBe('s.root()');
    expect(bt.partLocatorBody(c, 'control', 'rn')).toBe('s.root()');
    expect(bt.partLocatorBody(c, 'control', 'lit')).not.toContain('role=');
  });

  test('a roleFrom prop with a default is queried by that role', () => {
    const props = { role: { ...LANDMARK_PROPS.role, required: false, default: 'navigation' } };
    const c = { ...WIDGET, props, a11y: { roleFrom: 'role', requires: [] } };
    expect(bt.partLocatorBody(c, 'control', 'web')).toBe("(screen.queryByRole('navigation') ?? s.root()) as HTMLElement");
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

  test('lit primary tries role, then part, then first child — each on the host before its shadow roots', () => {
    const body = bt.partLocatorBody(WIDGET, 'control', 'lit');
    expect(body.startsWith('((el.matches(\'[role="button"]\') ? el : null) ?? deep(root, \'[role="button"]\')')).toBe(true);
    expect(body.indexOf('[role="button"]')).toBeLessThan(body.indexOf('[part="control"]'));
    expect(body.indexOf('[part="control"]')).toBeLessThan(body.indexOf('root.firstElementChild'));
  });

  test('lit: a host carrying the part name is the part, before deep() is consulted', () => {
    const body = bt.partLocatorBody(WIDGET, 'label', 'lit');
    expect(body).toBe('((el.matches(\'[part~="label"], [data-part="label"]\') ? el : null) ?? deep(root, \'[part="label"]\') ?? deep(root, \'[data-part="label"]\')) as HTMLElement');
  });

  test('a part matching a string prop is located by its text', () => {
    expect(bt.partLocatorBody(WIDGET, 'label', 'web')).toBe('screen.getByText(props.label)');
    expect(bt.partLocatorBody(WIDGET, 'label', 'rn')).toBe('screen.getByText(props.label)');
  });

  test('a union prop is a text prop only when its shape starts with string', () => {
    const select: Dict = { ...WIDGET, anatomy: ['control', 'value', 'range'], props: {
      value: { type: 'union', shape: 'string | string[]', description: 'x' },
      range: { type: 'union', shape: 'number | [number, number]', description: 'x' },
    } };
    expect(bt.scalarType(select.props.value)).toBe('string');
    expect(bt.partLocatorBody(select, 'value', 'web')).toBe('screen.getByText(props.value)');
    expect(bt.partLocatorBody(select, 'range', 'web')).toContain('data-part="range"');
  });

  test('an integer prop emits exactly what a number prop does', () => {
    const typed = (type: string): Dict => ({ ...WIDGET, props: { ...WIDGET.props, count: { type, required: true, default: 3, description: 'x' } } });
    const scenarios: Dict[] = [{ name: 'renders-count', given: { count: 2 }, then: [{ renders: true }] }, CLICK];
    expect(bt.scalarType(typed('integer').props.count)).toBe('number');
    expect(bt.swiftPropValue('count', typed('integer').props.count, undefined, false)).toBe('3');
    for (const file of [bt.webFile, bt.rnFile, bt.litFile, bt.swiftFile]) {
      expect(file(typed('integer'), scenarios)).toBe(file(typed('number'), scenarios));
    }
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
    for (const platform of PLATFORMS) {
      // the component exists in every package
      write(bt.sourceFile(tmp(), 'Widget', platform), 'export {};');
    }
  });

  test('a component not generated yet gets no test file', () => {
    rmSync(bt.sourceFile(tmp(), 'Widget', 'lit'));
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

  test('a hover surface is skipped with the reason on React Native', () => {
    const tip = { ...WIDGET, name: 'Tooltip', a11y: { role: 'tooltip', requires: [] } };
    const block = bt.scenarioBlock(tip, { name: 'renders', then: [{ renders: true }] }, 'rn');
    expect(block.startsWith("  test.skip('renders")).toBe(true);
    expect(block).toContain('needs its trigger hovered');
    expect(block).toContain("\\'tooltip\\'"); // quotes inside the reason are escaped for the JS string literal
  });
});

describe('name and renders', () => {
  test('renders never queries by role', () => {
    for (const platform of TS_PLATFORMS) {
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
      props: { label: { type: 'string', description: 'x', a11yRole: 'accessible-name', a11y: 'aria-label when set' } },
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
    const text = { ...WIDGET, a11y: { role: 'generic', requires: [] } };
    expect(() => bt.thenNameLines(text, 'web')).toThrow("then.name: role 'generic' cannot be queried");
    const landmark = { ...WIDGET, props: { role: { type: 'enum', values: ['main'], description: 'x' } }, a11y: { roleFrom: 'role', requires: [] } };
    expect(() => bt.thenNameLines(landmark, 'web')).toThrow("then.name: role from prop 'role' cannot be queried");
  });
});

describe('lit focus', () => {
  // Focus inside shadow roots: document.activeElement is the host, so assertions walk the active chain.
  test('focusable checks the host is in the active chain', () => {
    expect(bt.thenFocusableLines(WIDGET, 'lit')).toEqual(['s.el.focus();', 'expect(activeChain()).toContain(s.el);']);
  });

  test('focused part and none use the chain', () => {
    expect(bt.thenFocusedLines(WIDGET, 'label', 'lit')).toEqual(['expect(activeChain()).toContain(focusedPart(s.label(), s.el));']);
    expect(bt.thenFocusedLines(WIDGET, 'none', 'lit')).toEqual(['expect(activeChain()).not.toContain(s.el);']);
  });

  test('the lit file carries the helper', () => {
    const content = bt.litFile(WIDGET, [{ name: 'f', then: [{ focusable: true }] }]);
    expect(content).toContain('function activeChain()');
    expect(content).toContain('expect(activeChain()).toContain(s.el);');
  });
});

// ---------------------------------------------------------------------------
// swiftui
// ---------------------------------------------------------------------------

/** WIDGET as a component the iOS package also ships: a swiftui platform block, a swiftui event name, and
 *  the prop shapes the Swift initializer has to be handed (required string, enum, controlled/uncontrolled
 *  pair, a prop the doc narrows away from this platform). */
const SWIDGET: Dict = {
  ...WIDGET,
  anatomy: ['control', 'label'],
  props: {
    label: { type: 'string', required: true, a11yRole: 'accessible-name', description: 'Visible text.' },
    variant: { type: 'enum', values: ['primary', 'icon-only'], default: 'primary', description: 'Emphasis.' },
    size: { type: 'enum', values: ['sm', '2xl'], default: 'sm', description: 'Scale.' },
    open: { type: 'boolean', description: 'Controlled.', controls: { default: 'defaultOpen', event: 'onPress' } },
    defaultOpen: { type: 'boolean', description: 'Uncontrolled.' },
    loading: { type: 'boolean', description: 'Web only.', platforms: ['web'] },
    default: { type: 'boolean', description: 'A Swift keyword as a prop name.' },
  },
  events: {
    onPress: { description: 'Activated.', platforms: { web: 'onPress', lit: 'press', rn: 'onPress', swiftui: 'action' } },
  },
  platforms: {
    web: { element: 'button' },
    lit: { tag: 'ds-widget' },
    rn: { element: 'Pressable' },
    swiftui: { element: 'Button' },
  },
};

function swiftTitles(content: string): string[] {
  return [...content.matchAll(/^ {4}@Test\("(.*?)"\)$/gm)].map((m) => m[1] as string);
}

function swiftSkips(content: string): string[] {
  return [...content.matchAll(/^ {4}@Test\("(.*?)", \.disabled\("(.*?)"\)\)$/gm)].map((m) => `${m[1] as string} — ${m[2] as string}`);
}

describe('swift names and literals', () => {
  test('a doc enum value becomes the nested case', () => {
    expect(bt.swiftCase('primary')).toBe('.primary');
    expect(bt.swiftCase('icon-only')).toBe('.iconOnly');
  });

  test('quoted digits stay an Int, because the initializer takes one', () => {
    expect(bt.swiftCase('1')).toBe('1');
    expect(bt.swiftCase(3)).toBe('3');
  });

  test('a value that starts with digits moves them to the end — nothing else is a Swift identifier', () => {
    expect(bt.swiftCase('2xl')).toBe('.xl2');
    expect(bt.swiftCase('4xl')).toBe('.xl4');
  });

  test('an argument label that is a Swift keyword is back-ticked', () => {
    expect(bt.swiftLabel('label')).toBe('label');
    expect(bt.swiftLabel('default')).toBe('`default`');
  });

  test('string literals escape what would end them', () => {
    expect(bt.swiftString('say "hi"\\now')).toBe('"say \\"hi\\"\\\\now"');
  });

  test('scenario names become unique camelCase functions', () => {
    const used = new Set<string>();
    expect(bt.swiftFunctionName('renders-variant-primary', used)).toBe('rendersVariantPrimary');
    expect(bt.swiftFunctionName('renders variant primary', used)).toBe('rendersVariantPrimary2');
  });
});

describe('swiftInitArgs', () => {
  test('required props are filled in, optional ones are left to the initializer default', () => {
    expect(bt.swiftInitArgs(SWIDGET, {})).toEqual(['label: "Label"', 'action: events.spy("onPress")']);
  });

  test('a given value is rendered by the prop type', () => {
    expect(bt.swiftInitArgs(SWIDGET, { label: 'Go', variant: 'icon-only', size: '2xl' })).toEqual([
      'label: "Go"',
      'variant: .iconOnly',
      'size: .xl2',
      'action: events.spy("onPress")',
    ]);
  });

  test('a controlled prop with a default sibling is passed as the uncontrolled one', () => {
    // `open` is a Binding<Bool>? in SwiftUI; a literal only typechecks against `defaultOpen`.
    expect(bt.swiftInitArgs(SWIDGET, { open: true })).toContain('defaultOpen: true');
    expect(bt.swiftInitArgs(SWIDGET, { open: true })).not.toContain('open: true');
    // unless the scenario already said what the uncontrolled value is
    expect(bt.swiftInitArgs(SWIDGET, { open: true, defaultOpen: false })).toContain('defaultOpen: false');
  });

  test('a keyword prop name is back-ticked in the call', () => {
    expect(bt.swiftInitArgs(SWIDGET, { default: true })).toContain('`default`: true');
  });

  test('a prop the doc narrows away from swiftui is not a parameter', () => {
    expect(bt.swiftInitArgs(SWIDGET, {}).join(' ')).not.toContain('loading');
    expect(() => bt.swiftInitArgs(SWIDGET, { loading: true })).toThrow(/does not declare this prop for swiftui/);
  });

  test('a given prop the doc never declared is unmappable', () => {
    expect(() => bt.swiftInitArgs(SWIDGET, { nope: 1 })).toThrow(/declares no such prop/);
  });

  test('a required array prop has no literal to synthesize', () => {
    const grid: Dict = { ...SWIDGET, props: { rows: { type: 'array', required: true, description: 'x' } } };
    expect(() => bt.swiftInitArgs(grid, {})).toThrow(/no literal this generator can synthesize/);
  });

  test('a content prop becomes a view builder, given or not', () => {
    const card: Dict = { ...SWIDGET, props: { children: { type: 'content', required: true, description: 'x' } } };
    expect(bt.swiftInitArgs(card, {})).toContain('children: { SwiftUI.Text("Children") }');
    // parse.ts fills the derived accessible-name scenario in with a string even for a content prop
    expect(bt.swiftInitArgs(card, { children: 'Accessible name' })).toContain('children: { SwiftUI.Text("Accessible name") }');
  });

  test('a union prop reads as the scalar its shape starts with, and a given value by its runtime type', () => {
    const picker: Dict = {
      ...SWIDGET,
      props: {
        value: { type: 'union', shape: 'string | string[]', required: true, description: 'x' },
        range: { type: 'union', shape: 'number | [number, number]', required: true, description: 'x' },
      },
    };
    expect(bt.swiftInitArgs(picker, {})).toEqual(['value: "Value"', 'range: 0', 'action: events.spy("onPress")']);
    expect(bt.swiftInitArgs(picker, { value: 'a', range: 4 })).toEqual(['value: "a"', 'range: 4', 'action: events.spy("onPress")']);
    expect(() => bt.swiftInitArgs(picker, { value: ['a', 'b'] })).toThrow(/given.value: no Swift literal/);
    const grid: Dict = { ...SWIDGET, props: { rows: { type: 'union', shape: '{ id: string }[] | "lazy"', required: true, description: 'x' } } };
    expect(() => bt.swiftInitArgs(grid, {})).toThrow(/is required and union: no literal this generator can synthesize/);
  });
});

describe('swift when', () => {
  test('a click is the part\'s activate action, with the root as the fallback identifier', () => {
    expect(bt.swiftWhenLines(SWIDGET, { name: 'x', when: { click: 'control' }, then: [] })).toEqual([
      'try host.activate("Widget.control", or: "Widget")',
    ]);
  });

  test('a key goes through the relay', () => {
    expect(bt.swiftWhenLines(SWIDGET, { name: 'x', when: { key: 'Enter' }, then: [] })).toEqual(['try host.send(key: "Enter")']);
  });

  test.each(['focus', 'blur'])('%s is unmappable: a hosted view cannot move focus', (kind) => {
    expect(() => bt.swiftWhenLines(SWIDGET, { name: 'x', when: { [kind]: 'control' }, then: [] })).toThrow(/keyboard gate/);
  });

  test('typing needs a simulator', () => {
    expect(() => bt.swiftWhenLines(SWIDGET, { name: 'x', when: { type: 'abc' }, then: [] })).toThrow(/needs a UI test on a simulator/);
  });
});

describe('then.copy against an object entry', () => {
  const TYPED: Dict = {
    ...WIDGET,
    copy: {
      saved: { text: '{label} saved.', description: 'Shown after a save.' },
      count: { plural: { by: 'count', one: '{count} item', other: '{count} items' }, params: { count: { type: 'number' } } },
    },
  };

  test('web, lit and rn match the text, never [object Object]', () => {
    for (const platform of ['web', 'lit', 'rn']) {
      const line = bt.thenCopyLines(TYPED, 'saved', platform)[0] as string;
      expect(line).toContain('new RegExp(escapeRegExp(s.props.label) + ');
      expect(line).toContain(' saved');
      expect(line).not.toContain('object Object');
    }
    const plural = bt.thenCopyLines(TYPED, 'count', 'web')[0] as string;
    expect(plural).toContain(' items');
    expect(plural).not.toContain('object Object');
  });

  test('swift reads the text and substitutes the label', () => {
    expect(bt.swiftThenItemLines({ ...SWIDGET, copy: TYPED.copy }, { copy: 'saved' }, { label: 'Go' })).toEqual(['#expect(host.containsText("Go saved."), "\\(host.dump())")']);
  });

  test('an unknown key keeps its Unmappable text', () => {
    expect(() => bt.thenCopyLines(TYPED, 'nope', 'web')).toThrow("then.copy: unknown copy key 'nope'");
    expect(() => bt.swiftThenItemLines({ ...SWIDGET, copy: TYPED.copy }, { copy: 'nope' }, {})).toThrow("then.copy: unknown copy key 'nope'");
  });
});

describe('swift then', () => {
  const then = (item: Dict, given: Dict = {}): string[] => bt.swiftThenItemLines(SWIDGET, item, given);

  test('renders checks the root identifier is in the tree, never a role', () => {
    expect(then({ renders: true })).toEqual(['#expect(host.exists("Widget"), "\\(host.dump())")']);
  });

  test('name compares the root label with the value the scenario passed', () => {
    expect(then({ name: true }, {})).toEqual(['#expect(try host.require("Widget").label == "Label", "\\(host.dump())")']);
    expect(then({ name: true }, { label: 'Go' })[0]).toContain('== "Go"');
  });

  test('a name this generator cannot predict is only asserted to be non-empty', () => {
    const heading: Dict = { ...SWIDGET, props: { children: { type: 'content', required: true, description: 'x' } } };
    expect(bt.swiftThenItemLines(heading, { name: true }, {})).toEqual([
      '#expect(try host.require("Widget").label.isEmpty == false, "\\(host.dump())")',
    ]);
  });

  test('text and copy look through everything the tree says out loud', () => {
    expect(then({ text: 'Saved.' })).toEqual(['#expect(host.containsText("Saved."), "\\(host.dump())")']);
    // WIDGET's copy.required is '{label} is required.' — the label the scenario passes is substituted
    expect(then({ copy: 'required' }, { label: 'Go' })[0]).toContain('"Go is required."');
    expect(() => then({ copy: 'nope' })).toThrow(/unknown copy key/);
  });

  test('the states the conventions give an accessibility spelling', () => {
    expect(then({ state: 'expanded', is: true })[0]).toContain('.value == "expanded"');
    expect(then({ state: 'open', is: false })[0]).toContain('.value == "collapsed"');
    expect(then({ state: 'selected', is: true })[0]).toContain('.traits.contains(.selected) == true');
    expect(then({ state: 'disabled', is: true })[0]).toContain('.isEnabled == false');
    // every state assertion targets the primary part and falls back to the root
    expect(then({ state: 'selected', is: true })[0]).toContain('"Widget.control", or: "Widget"');
  });

  test('a state with no SwiftUI spelling is unmappable rather than a guess', () => {
    expect(() => then({ state: 'checked', is: true })).toThrow(/names no accessibility spelling/);
  });

  test('roles map to traits, and the ones with no trait say so', () => {
    expect(then({ role: 'button' })).toEqual(['#expect(host.containsTrait(.button), "\\(host.dump())")']);
    expect(() => then({ role: 'heading' })).toThrow(/carries no trait for it/);
  });

  test('focus is the standing gap and names the gate that covers it', () => {
    for (const item of [{ focusable: true }, { focusable: false }, { focused: 'control' }, { focused: 'none' }]) {
      expect(() => then(item)).toThrow(/iPad keyboard gate/);
    }
  });

  test('events are checked against the recorded payload', () => {
    expect(then({ event: 'onPress' })[0]).toContain('#expect(events.fired("onPress"), "\\(events.describe("onPress"))")');
    expect(then({ event: 'onPress', fired: false })[0]).toContain('events.count("onPress") == 0');
    // Swift's Bool describes itself as `true`, not Python's `True`
    expect(then({ event: 'onPress', with: true })[0]).toContain('events.fired("onPress", with: "true")');
    expect(then({ event: 'onPress', with: 2 })[0]).toContain('events.fired("onPress", with: "2")');
    expect(then({ event: 'onPress', with: { name: 'signup', all: false } })[0])
      .toContain('events.fired("onPress", with: ["name": "signup", "all": "false"])');
    expect(() => then({ event: 'onPress', with: [1, 2] })).toThrow(/no Swift comparison/);
  });

  test('an event with no swiftui name is unmappable', () => {
    const c: Dict = { ...SWIDGET, events: { onPress: { description: 'x', platforms: { web: 'onPress' } } } };
    expect(() => bt.swiftThenItemLines(c, { event: 'onPress' }, {})).toThrow(/names no swiftui closure/);
  });

  test('an arbitrary attribute has no meaning in an accessibility tree', () => {
    expect(() => then({ attribute: 'data-x', is: 'y' })).toThrow(/attribute/);
  });
});

describe('swiftFile', () => {
  const CLICK_SWIFT: Dict = { name: 'click-fires', when: { click: 'control' }, then: [{ event: 'onPress' }] };

  test('one @Test per scenario, and the unmappable one carries its reason', () => {
    const content = bt.swiftFile(SWIDGET, [CLICK_SWIFT, BAD]);
    expect(swiftTitles(content)).toEqual(['click-fires']);
    expect(swiftSkips(content)).toHaveLength(1);
    expect(swiftSkips(content)[0]).toContain('focus-moves');
  });

  test('the suite is main-actor and the component is module-qualified', () => {
    const content = bt.swiftFile(SWIDGET, [CLICK_SWIFT]);
    expect(content).toContain('@testable import DesignSchema');
    expect(content).toContain('@MainActor\n@Suite("Widget behavior")\nstruct WidgetBehaviorTests {');
    // SwiftUI has a Button too: an unqualified name would be ambiguous in a file that imports both
    expect(content).toContain('DesignSchema.Widget(');
  });

  test('a scenario that never names the host still uses the binding', () => {
    // Swift warns about an unused binding, and a warning in the log is a line in the gate report.
    const content = bt.swiftFile(SWIDGET, [{ name: 'nothing-fires', then: [{ event: 'onPress', fired: false }] }]);
    expect(content).toContain('        _ = host');
  });

  test('a component with no events declares no log', () => {
    const c: Dict = { ...SWIDGET, events: {} };
    expect(bt.swiftFile(c, [{ name: 'renders', then: [{ renders: true }] }])).not.toContain('DSEventLog()');
  });
});

describe('main — swiftui', () => {
  let generated = '';
  let swiftOut = '';

  beforeEach(() => {
    generated = join(tmp(), 'generated');
    swiftOut = join(tmp(), 'packages', 'swiftui', 'Tests', 'DesignSchemaTests', 'Generated');
    mkdirSync(generated, { recursive: true });
    Object.assign(bt.paths, { ROOT: tmp(), GENERATED: generated, OUT: join(generated, 'behavior') });
    for (const platform of PLATFORMS) {
      write(bt.sourceFile(tmp(), 'Widget', platform), 'export {};');
    }
    write(join(generated, 'components.json'), JSON.stringify([{ component: { ...SWIDGET, behavior: [{ name: 'renders', then: [{ renders: true }] }] } }]));
  });

  function swiftFiles(): string[] {
    return readdirSync(swiftOut).filter((n) => n.endsWith('.swift')).sort();
  }

  test('the Swift cases go where SwiftPM looks for them, not into generated/', () => {
    expect(bt.main()).toBe(0);
    expect(bt.swiftOutDir()).toBe(swiftOut);
    expect(swiftFiles()).toEqual(['WidgetBehaviorTests.swift']);
    expect(readFileSync(join(swiftOut, 'WidgetBehaviorTests.swift'), 'utf8')).toContain('@Suite("Widget behavior")');
  });

  test('a component not generated for swiftui yet gets no Swift file', () => {
    rmSync(bt.sourceFile(tmp(), 'Widget', 'swiftui'));
    bt.main();
    expect(swiftFiles()).toEqual([]);
  });

  test('a file no longer derived is removed on the next run', () => {
    mkdirSync(swiftOut, { recursive: true });
    writeFileSync(join(swiftOut, 'GoneBehaviorTests.swift'), '// old', 'utf8');
    bt.main();
    expect(swiftFiles()).toEqual(['WidgetBehaviorTests.swift']);
  });

  test('--check passes on what main just wrote and fails once it drifts', () => {
    bt.main();
    expect(bt.main(['--check'])).toBe(0);
    expect(std.out()).toContain('1 committed file(s) are current');

    writeFileSync(join(swiftOut, 'WidgetBehaviorTests.swift'), '// hand-edited', 'utf8');
    expect(bt.main(['--check'])).toBe(1);
    expect(std.err()).toContain('out of date');
  });

  test('--check reports a file the docs no longer derive, and never writes', () => {
    bt.main();
    writeFileSync(join(swiftOut, 'GoneBehaviorTests.swift'), '// old', 'utf8');
    expect(bt.main(['--check'])).toBe(1);
    expect(std.err()).toContain('no longer derived');
    expect(swiftFiles()).toContain('GoneBehaviorTests.swift'); // --check is read-only
  });
});

// ---------------------------------------------------------------------------
// the typed clauses: set, hover, attribute, the negative and exact forms, keys
// ---------------------------------------------------------------------------

describe('when.set', () => {
  const SET: Dict = { name: 'controlled-updates', given: { open: false }, when: { set: { open: true } }, then: [{ renders: true }] };

  test('web and rn re-render through the harness with the new props merged', () => {
    expect(bt.whenLines(WIDGET, SET, 'web')).toEqual(['s.rerender({"open": true});']);
    expect(bt.whenLines(WIDGET, SET, 'rn')).toEqual(['s.rerender({"open": true});']);
    expect(bt.webFile(WIDGET, [SET])).toContain('rerender: (next: Partial<WidgetProps>) => utils.rerender(<Widget {...props} {...next} />),');
  });

  test('lit assigns the properties and awaits the update', () => {
    expect(bt.whenLines(WIDGET, SET, 'lit')).toEqual(['Object.assign(s.el, {"open": true});', 'await (s.el as unknown as { updateComplete: Promise<boolean> }).updateComplete;']);
  });

  test('swiftui is unmappable: a hosted view is built from literals', () => {
    expect(() => bt.swiftWhenLines(SWIDGET, SET)).toThrow('when.set: a hosted view is built once from literal props; a controlled change needs a Binding the test owns');
  });
});

describe('when.hover', () => {
  const HOVER: Dict = { name: 'hover-label', when: { hover: 'label' }, then: [{ renders: true }] };

  test('web and lit hover the part', () => {
    expect(bt.whenLines(WIDGET, HOVER, 'web')).toEqual(['await s.user.hover(s.label());']);
    expect(bt.whenLines(WIDGET, HOVER, 'lit')).toEqual(['await userEvent.hover(s.label());']);
    expect(bt.usedParts(WIDGET, [HOVER])).toEqual(['control', 'label']);
  });

  test('rn and swiftui are unmappable', () => {
    expect(() => bt.whenLines(WIDGET, HOVER, 'rn')).toThrow('when.hover: React Native has no pointer to hover with');
    expect(() => bt.swiftWhenLines(SWIDGET, HOVER)).toThrow('when.hover: a hosted view has no pointer to hover with');
  });
});

describe('tooltip surfaces', () => {
  const TIP: Dict = { ...WIDGET, name: 'Tooltip', anatomy: ['trigger', 'popup'], a11y: { role: 'tooltip', requires: [] } };
  const RENDERS: Dict = { name: 'renders', then: [{ renders: true }] };

  test('web and lit hover the trigger, the first anatomy part, before asserting', () => {
    const web = bt.scenarioBlock(TIP, RENDERS, 'web');
    expect(web.startsWith("  test('renders',")).toBe(true);
    const hover = web.indexOf('await s.user.hover(s.trigger());');
    expect(hover).toBeGreaterThan(-1);
    expect(hover).toBeLessThan(web.indexOf('expect(s.root())'));
    const lit = bt.scenarioBlock(TIP, RENDERS, 'lit');
    expect(lit.startsWith("  test('renders',")).toBe(true);
    expect(lit).toContain('await userEvent.hover(s.trigger());');
  });

  test('a tooltip its controlled open prop already shows is not hovered', () => {
    const openable: Dict = { ...TIP, props: { ...TIP.props, open: { type: 'boolean', description: 'x' } } };
    for (const platform of ['web', 'lit']) {
      const block = bt.scenarioBlock(openable, RENDERS, platform);
      expect(block).toContain('"open": true');
      expect(block).not.toContain('hover');
    }
    // an authored open: false leaves the surface closed, so the trigger is hovered
    expect(bt.scenarioBlock(openable, { ...RENDERS, given: { open: false } }, 'web')).toContain('await s.user.hover(s.trigger());');
  });

  test('a scenario with its own interaction performs that instead', () => {
    const block = bt.scenarioBlock(TIP, { name: 'focus-shows', when: { focus: 'trigger' }, then: [{ renders: true }] }, 'web');
    expect(block).toContain('act(() => (s.trigger()).focus());');
    expect(block).not.toContain('hover');
  });

  test('swiftui keeps the skip', () => {
    const swift = bt.swiftFile({ ...SWIDGET, name: 'Tooltip', anatomy: ['trigger', 'popup'], a11y: { role: 'tooltip', requires: [] } }, [RENDERS]);
    expect(swiftSkips(swift)[0]).toContain('needs its trigger hovered or focused');
  });
});

describe('then.attribute', () => {
  test('web and lit assert the value as a string, or the absence for null', () => {
    for (const platform of ['web', 'lit']) {
      expect(bt.thenItemLines(WIDGET, { attribute: 'aria-haspopup', is: 'dialog' }, platform)).toEqual(['expect(s.control()).toHaveAttribute("aria-haspopup", "dialog");']);
      expect(bt.thenItemLines(WIDGET, { attribute: 'aria-busy', is: true }, platform)).toEqual(['expect(s.control()).toHaveAttribute("aria-busy", "true");']);
      expect(bt.thenItemLines(WIDGET, { attribute: 'aria-busy', is: null }, platform)).toEqual(['expect(s.control()).not.toHaveAttribute("aria-busy");']);
    }
  });

  test('on targets another part, which the harness then locates', () => {
    expect(bt.thenItemLines(WIDGET, { attribute: 'data-state', is: 'on', on: 'label' }, 'web')).toEqual(['expect(s.label()).toHaveAttribute("data-state", "on");']);
    expect(bt.usedParts(WIDGET, [{ name: 'x', then: [{ attribute: 'data-state', is: 'on', on: 'label' }] }])).toEqual(['control', 'label']);
  });

  test('rn asserts the prop, keeping the value type', () => {
    expect(bt.thenItemLines(WIDGET, { attribute: 'accessibilityHint', is: 'Opens' }, 'rn')).toEqual(['expect(s.control()).toHaveProp("accessibilityHint", "Opens");']);
    expect(bt.thenItemLines(WIDGET, { attribute: 'disabled', is: true }, 'rn')).toEqual(['expect(s.control()).toHaveProp("disabled", true);']);
    expect(bt.thenItemLines(WIDGET, { attribute: 'accessibilityHint', is: null }, 'rn')).toEqual(['expect(s.control()).not.toHaveProp("accessibilityHint");']);
  });

  test('swiftui is unmappable: an accessibility tree has no attributes', () => {
    expect(() => bt.swiftThenItemLines(SWIDGET, { attribute: 'data-x', is: 'y' }, {})).toThrow('then.attribute: an accessibility tree has no attributes; assert the label, value or trait instead');
  });
});

describe('then.event with a declared payload', () => {
  const ONE_FIELD: Dict = {
    ...WIDGET,
    events: { onPress: { description: 'Activated.', platforms: { web: 'onPress', lit: 'press', rn: 'onPress' }, payload: [{ name: 'open', type: 'boolean' }] } },
  };

  test('lit asserts the one payload field against a scalar with', () => {
    expect(bt.thenEventLines(ONE_FIELD, { event: 'onPress', with: true }, 'lit')).toEqual([
      'expect(s.events.onPress).toHaveBeenCalledTimes(1);',
      'expect(s.events.onPress.mock.calls[0]?.[0]?.detail?.open).toEqual(true);',
    ]);
  });

  test("checkbox.md's migrated payload names the detail key its lit test asserts", () => {
    // The real doc as of job 638: one boolean field, which the Lit component emits as detail.checked.
    const checkbox: Dict = {
      ...WIDGET,
      events: { onChange: { description: 'Fired when the checked state changes, with the new boolean.', platforms: { web: 'onChange', lit: 'change', rn: 'onChange' }, payload: [{ name: 'checked', type: 'boolean' }] } },
    };
    expect(bt.thenEventLines(checkbox, { event: 'onChange', with: true }, 'lit')).toEqual([
      'expect(s.events.onChange).toHaveBeenCalledTimes(1);',
      'expect(s.events.onChange.mock.calls[0]?.[0]?.detail?.checked).toEqual(true);',
    ]);
    expect(bt.thenEventLines(checkbox, { event: 'onChange', with: false }, 'lit')[1]).toBe('expect(s.events.onChange.mock.calls[0]?.[0]?.detail?.checked).toEqual(false);');
    expect(bt.thenEventLines(checkbox, { event: 'onChange', fired: false }, 'lit')).toEqual(['expect(s.events.onChange).not.toHaveBeenCalled();']);
  });

  test('without a payload, with an object, and on the other platforms, the lines are unchanged', () => {
    expect(bt.thenEventLines(WIDGET, { event: 'onPress', with: true }, 'lit')).toEqual([
      'expect(s.events.onPress).toHaveBeenCalledTimes(1);',
      'expect(Object.values(s.events.onPress.mock.calls[0]?.[0]?.detail ?? {})).toContain(true);',
    ]);
    expect(bt.thenEventLines(ONE_FIELD, { event: 'onPress', with: { open: true } }, 'lit')).toEqual(bt.thenEventLines(WIDGET, { event: 'onPress', with: { open: true } }, 'lit'));
    for (const platform of ['web', 'rn']) {
      expect(bt.thenEventLines(ONE_FIELD, { event: 'onPress', with: true }, platform)).toEqual(bt.thenEventLines(WIDGET, { event: 'onPress', with: true }, platform));
    }
  });

  test('web and rn assert exactly the declared arguments, with no trailing matcher', () => {
    for (const platform of ['web', 'rn']) {
      expect(bt.thenEventLines(ONE_FIELD, { event: 'onPress', with: true }, platform)).toEqual(['expect(s.events.onPress).toHaveBeenCalledWith(true);']);
    }
  });

  test('a declared two-field payload emits two positional arguments on web and rn', () => {
    const TWO_FIELD: Dict = {
      ...WIDGET,
      events: {
        onTrack: { description: 'Tracked.', platforms: { web: 'onTrack', lit: 'track', rn: 'onTrack' }, payload: [{ name: 'name', type: 'string' }, { name: 'label', type: 'string' }] },
      },
    };
    for (const platform of ['web', 'rn']) {
      expect(bt.thenEventLines(TWO_FIELD, { event: 'onTrack', with: { label: 'Sign up', name: 'signup' } }, platform)).toEqual([
        'expect(s.events.onTrack).toHaveBeenCalledWith("signup", "Sign up");',
      ]);
      expect(bt.thenEventLines(TWO_FIELD, { event: 'onTrack', with: { label: 'Sign up' } }, platform)).toEqual([
        'expect(s.events.onTrack).toHaveBeenCalledTimes(1);',
        'expect(s.events.onTrack.mock.calls[0]).toHaveLength(2);',
        'expect(s.events.onTrack.mock.calls[0]?.[1]).toEqual("Sign up");',
      ]);
    }
    expect(bt.thenEventLines(TWO_FIELD, { event: 'onTrack', with: { name: 'signup', label: 'Sign up' } }, 'lit')[1]).toBe(
      'expect(s.events.onTrack.mock.calls[0]?.[0]?.detail).toMatchObject({"name": "signup", "label": "Sign up"});',
    );
  });
});

describe('negative and exact assertions', () => {
  test('focusable: false asserts focus does not land', () => {
    expect(bt.thenItemLines(WIDGET, { focusable: false }, 'web')).toEqual(['act(() => (s.control()).focus());', 'expect(s.control()).not.toHaveFocus();']);
    expect(bt.thenItemLines(WIDGET, { focusable: false }, 'lit')).toEqual(['s.el.focus();', 'expect(activeChain()).not.toContain(s.el);']);
  });

  test('renders: false asserts nothing rendered', () => {
    expect(bt.thenItemLines(WIDGET, { renders: false }, 'web')).toEqual(['expect(s.root()).toBeNull();']);
    expect(bt.thenItemLines(WIDGET, { renders: false }, 'rn')).toEqual(['expect(screen.toJSON()).toBeNull();']);
    expect(bt.thenItemLines(WIDGET, { renders: false }, 'lit')).toEqual(['expect(s.el.shadowRoot ? s.root.childElementCount > 0 : s.el.isConnected).toBe(false);']);
    expect(bt.swiftThenItemLines(SWIDGET, { renders: false }, {})).toEqual(['#expect(host.exists("Widget") == false, "\\(host.dump())")']);
  });

  test('a string name asserts that exact name', () => {
    expect(bt.thenItemLines(WIDGET, { name: 'Save draft' }, 'web')).toEqual(["expect(screen.getByRole('button', { name: \"Save draft\" })).toBeInTheDocument();"]);
    expect(bt.thenItemLines(WIDGET, { name: 'Save draft' }, 'rn')).toEqual(["expect(screen.getByRole('button', { name: \"Save draft\" })).toBeOnTheScreen();"]);
    expect(bt.thenItemLines(WIDGET, { name: 'Save draft' }, 'lit')).toEqual([
      'if (hostName(s.el) !== null) expect(hostName(s.el)).toBe("Save draft");',
      'else expect(s.control()).toHaveAccessibleName("Save draft");',
    ]);
    expect(bt.swiftThenItemLines(SWIDGET, { name: 'Save draft' }, { label: 'Go' })).toEqual(['#expect(try host.require("Widget").label == "Save draft", "\\(host.dump())")']);
  });

  test('rn reads an open state from expanded, which React Native sets', () => {
    expect(bt.thenItemLines(WIDGET, { state: 'open', is: true }, 'rn')).toEqual(['expect(s.control()).toBeExpanded();']);
    expect(bt.thenItemLines(WIDGET, { state: 'open', is: false }, 'rn')).toEqual(['expect(s.control()).not.toBeExpanded();']);
  });
});

/** The Lit probes run against real shadow roots and slots: the emitted helpers and assertion lines, types
 *  stripped, evaluated in a jsdom window (jsdom resolves through packages/react, which depends on it). */
describe('lit probes look at the host and its flat tree', () => {
  // tools/ has no DOM lib: just the surface these fixtures touch.
  type Host = { shadowRoot: { textContent: string | null } | null };
  type Win = { eval(code: string): unknown; document: { body: { innerHTML: string }; querySelector(selector: string): Host | null } };
  const { JSDOM } = createRequire(join(REPO_ROOT, 'packages', 'react', 'package.json'))('jsdom') as {
    JSDOM: new (html: string, opts: { runScripts: 'outside-only' }) => { window: Win };
  };

  /** A window with `<tag>` defined as a custom element whose open shadow root holds `shadow`. */
  function windowWith(elements: Record<string, string>): Win {
    const win = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' }).window;
    for (const [tag, shadow] of Object.entries(elements)) {
      win.eval(`customElements.define('${tag}', class extends HTMLElement {
        constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = ${JSON.stringify(shadow)}; }
      });`);
    }
    return win;
  }

  /** Run `lines` against the first `<tag>` in the body, as the generated test's `s` sees it. */
  function probe(win: Win, tag: string, lines: string[]): void {
    const helpers = [bt.DEEP_QUERY_HELPER, bt.FLAT_TEXT_HELPER, bt.HOST_NAME_HELPER].join('\n');
    const run = win.eval(stripTypeScriptTypes(`(() => {\n${helpers}\nreturn (s: unknown, expect: unknown) => {\n${lines.join('\n')}\n};\n})()`)) as
      (s: unknown, x: typeof expect) => void;
    const el = win.document.querySelector(tag) as Host;
    run({ el, root: el.shadowRoot ?? el, props: {} }, expect);
  }

  test('then.role passes when the host itself carries the role', () => {
    const win = windowWith({ 'ds-bar': '<div><slot></slot></div>' });
    win.document.body.innerHTML = '<ds-bar role="toolbar"></ds-bar><ds-bar></ds-bar>';
    probe(win, 'ds-bar', bt.thenRoleLines(WIDGET, 'toolbar', 'lit'));
    // The same probe on a host without the role, and nothing inside it, still fails.
    win.document.body.innerHTML = '<ds-bar></ds-bar>';
    expect(() => probe(win, 'ds-bar', bt.thenRoleLines(WIDGET, 'toolbar', 'lit'))).toThrow();
  });

  test('then.role finds slotted light-DOM content (Tooltip\'s bubble)', () => {
    const win = windowWith({ 'ds-tip': '<slot></slot>' });
    win.document.body.innerHTML = '<ds-tip><div role="tooltip">Saves the draft</div></ds-tip>';
    probe(win, 'ds-tip', bt.thenRoleLines(WIDGET, 'tooltip', 'lit'));
  });

  test('then.text passes on text in a slotted child', () => {
    const win = windowWith({ 'ds-card': '<style>.x { color: red }</style><section><slot></slot></section>' });
    win.document.body.innerHTML = '<ds-card><p>Quarterly report</p></ds-card>';
    probe(win, 'ds-card', bt.thenTextLines(WIDGET, 'Quarterly report', 'lit'));
    expect(() => probe(win, 'ds-card', bt.thenTextLines(WIDGET, 'color: red', 'lit'))).toThrow();
  });

  test('then.copy passes on text in a composed ds-button\'s shadow root (ActionSheet\'s cancel row)', () => {
    const win = windowWith({ 'ds-button': '<button>Cancel</button>', 'ds-sheet': '<div role="dialog"><ds-button></ds-button></div>' });
    win.document.body.innerHTML = '<ds-sheet></ds-sheet>';
    const sheet: Dict = { ...WIDGET, copy: { cancel: 'Cancel' } };
    expect(win.document.querySelector('ds-sheet')?.shadowRoot?.textContent).not.toMatch(/Cancel/);
    probe(win, 'ds-sheet', bt.thenCopyLines(sheet, 'cancel', 'lit'));
  });

  test('then.name reads aria-label, then aria-labelledby in the host\'s root, on the host first', () => {
    const win = windowWith({ 'ds-bar': '<div role="toolbar"></div>' });
    win.document.body.innerHTML = '<ds-bar aria-label="Formatting"></ds-bar>';
    probe(win, 'ds-bar', bt.thenNameLines(WIDGET, 'lit', 'Formatting'));
    win.document.body.innerHTML = '<h2 id="t">Text  <b>tools</b></h2><ds-bar aria-labelledby="t"></ds-bar>';
    probe(win, 'ds-bar', bt.thenNameLines(WIDGET, 'lit', 'Text tools'));
    expect(() => probe(win, 'ds-bar', bt.thenNameLines(WIDGET, 'lit', 'Formatting'))).toThrow();
  });
});

describe('clicks land on the control a part wraps (T12)', () => {
  const CLOSE: Dict = { name: 'close', when: { click: 'label' }, then: [{ focused: 'label' }] };

  test('every platform clicks through activatable, and web and lit compare focus through focusedPart', () => {
    expect(bt.whenLines(WIDGET, CLOSE, 'web')).toEqual(['await s.user.click(activatable(s.label(), s.root()));']);
    expect(bt.whenLines(WIDGET, CLOSE, 'lit')).toEqual(['await userEvent.click(...(await pointerAt(activatable(s.label(), s.el), s.label())));']);
    expect(bt.whenLines(WIDGET, CLOSE, 'rn')).toEqual(['fireEvent.press(activatable(s.label(), s.root()));']);
    expect(bt.thenFocusedLines(WIDGET, 'label', 'web')).toEqual(['expect(document.activeElement).toBe(focusedPart(s.label(), s.root()));']);
  });

  test('a file carries its platform\'s helper only when a click or a focused part needs it', () => {
    expect(bt.webFile(WIDGET, [CLOSE])).toContain(bt.WEB_ACTIVATABLE_HELPER);
    expect(bt.litFile(WIDGET, [CLOSE])).toContain(bt.LIT_ACTIVATABLE_HELPER);
    // Lit clicks go through a stamped test id, so the file imports `page` beside `userEvent`.
    expect(bt.litFile(WIDGET, [CLOSE])).toContain("import { page, userEvent } from 'vitest/browser';");
    expect(bt.rnFile(WIDGET, [CLOSE])).toContain(bt.RN_ACTIVATABLE_HELPER);
    const plain = [{ name: 'r', then: [{ renders: true }, { focused: 'none' }] }];
    expect(bt.webFile(WIDGET, plain)).not.toContain('function activatable');
    expect(bt.litFile(WIDGET, plain)).not.toContain('function activatable');
    expect(bt.rnFile(WIDGET, plain)).not.toContain('function activatable');
  });

  test('the interactive set is the native controls plus schema/component.ts\'s widget roles', () => {
    expect(bt.INTERACTIVE_SELECTOR).toContain('[role="option"]');
    expect(bt.INTERACTIVE_SELECTOR).toContain('a[href]');
    expect(bt.INTERACTIVE_SELECTOR).not.toContain('[role="dialog"]');
    expect(bt.INTERACTIVE_SELECTOR).not.toContain('[role="gridcell"]');
  });

  // tools/ has no DOM lib: just the surface these fixtures touch.
  type El = { tagName: string; id: string };
  type Win = { eval(code: string): unknown; document: { body: { innerHTML: string }; querySelector(selector: string): El | null } };
  const { JSDOM } = createRequire(join(REPO_ROOT, 'packages', 'react', 'package.json'))('jsdom') as {
    JSDOM: new (html: string, opts: { runScripts: 'outside-only' }) => { window: Win };
  };
  type Fns = { activatable(el: El | null, root: El | null): El | null; focusedPart(el: El | null, root: El | null): El | null; isDisabled?(el: El | null): boolean };
  function helpers(win: Win, source: string): Fns {
    return win.eval(stripTypeScriptTypes(`(() => {\n${source}\nreturn { activatable, focusedPart, isDisabled: typeof isDisabled === 'function' ? isDisabled : undefined };\n})()`)) as Fns;
  }

  test('web: a wrapper yields the button inside, a control yields itself, a part with no control yields itself', () => {
    const win = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' }).window;
    win.document.body.innerHTML = '<span data-part="closeButton" id="w"><svg></svg><button id="b">Close</button></span>'
      + '<button data-part="trigger" id="t"><span>Open</span></button><div data-part="surface" id="s" tabindex="-1"><button>Inner</button></div>'
      + '<p data-part="note" id="n">Text</p><div data-ds="AlertDialog" id="root"><button id="cancel">Cancel</button></div>';
    const fns = helpers(win, [bt.ACTIVE_CHAIN_HELPER, bt.WEB_ACTIVATABLE_HELPER].join('\n'));
    const $ = (sel: string): El | null => win.document.querySelector(sel);
    const root = $('#root');
    expect(fns.activatable($('#w'), root)?.id).toBe('b');
    expect(fns.activatable($('#t'), root)?.id).toBe('t');
    expect(fns.activatable($('#n'), root)?.id).toBe('n');
    // A part that fell back to the root (the part is not rendered) is the root, not the root's first button.
    expect(fns.activatable(root, root)?.id).toBe('root');
    // A window or composite is not a wrapper (AlertDialog's scrim, located by role, is the alertdialog); a live region is.
    win.document.body.innerHTML += '<div role="alertdialog" id="ad"><button>Cancel</button></div><div role="status" id="pr"><button id="pb">Show 3 new</button></div>';
    expect(fns.activatable($('#ad'), root)?.id).toBe('ad');
    expect(fns.activatable($('#pr'), root)?.id).toBe('pb');
    // A gridcell is a cell: DataGrid's selectCell yields the checkbox it holds, an empty cell yields itself.
    win.document.body.innerHTML += '<div role="gridcell" id="gc"><input type="checkbox" id="gcb"></div><div role="gridcell" id="ge">A-1</div>';
    expect(fns.activatable($('#gc'), root)?.id).toBe('gcb');
    expect(fns.activatable($('#ge'), root)?.id).toBe('ge');
    expect(fns.activatable(null, root)).toBeNull();
    // A focused surface is the part even though its first control is not what has focus.
    win.eval("document.getElementById('s').focus()");
    expect(fns.focusedPart($('#s'), root)?.id).toBe('s');
    expect(fns.focusedPart($('#w'), root)?.id).toBe('b');
  });

  test('lit: the walk crosses a composed ds-button\'s shadow root and a slot\'s assigned nodes', () => {
    const win = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' }).window;
    win.eval(`customElements.define('ds-button', class extends HTMLElement {
      constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<button id="inner">Close</button>'; }
    });
    customElements.define('ds-row', class extends HTMLElement {
      constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<div><slot></slot></div>'; }
    });`);
    win.document.body.innerHTML = '<span id="w"><ds-button></ds-button></span><ds-row id="r"><input type="checkbox" id="c"></ds-row>';
    const fns = helpers(win, [bt.ACTIVE_CHAIN_HELPER, bt.LIT_ACTIVATABLE_HELPER].join('\n'));
    expect(fns.activatable(win.document.querySelector('#w'), null)?.id).toBe('inner');
    expect(fns.activatable(win.document.querySelector('#r'), null)?.id).toBe('c');
    // Disabled the way Playwright reads it: natively, or aria-disabled on the control or an ancestor across a shadow host.
    win.document.body.innerHTML = '<button id="d" disabled></button><div aria-disabled="true"><ds-button id="h"></ds-button></div><ds-button id="e"></ds-button>';
    const inner = (id: string): El | null => fns.activatable(win.document.querySelector(`#${id}`), null);
    expect(fns.isDisabled?.(win.document.querySelector('#d'))).toBe(true);
    expect(fns.isDisabled?.(inner('h'))).toBe(true);
    expect(fns.isDisabled?.(inner('e'))).toBe(false);
  });

  test('rn: a wrapper View yields the host view under its Pressable, never a decorative image first', () => {
    type N = { type: string | (() => null); props: Dict; children: N[]; findAll(p: (n: N) => boolean): N[] };
    const node = (type: N['type'], props: Dict, children: N[] = []): N => ({
      type, props, children,
      findAll(p) { return [...(p(this) ? [this] : []), ...this.children.flatMap((c) => c.findAll(p))]; },
    });
    const Pressable = (): null => null;
    const text = node('Text', {});
    const host = node('View', { role: 'button', testID: 'inner' });
    const wrapper = node('View', { testID: 'Feed.newItemsButton' }, [node('Image', { role: 'image' }), node(Pressable, { onPress: () => {} }, [host])]);
    const run = new Function(`${stripTypeScriptTypes(bt.RN_ACTIVATABLE_HELPER)}\nreturn activatable;`)() as (n: N, root: N) => N;
    expect(run(wrapper, text)).toBe(host);
    // The root fallback is pressed as it is, never its first control.
    expect(run(wrapper, wrapper)).toBe(wrapper);
    expect(run(host, host)).toBe(host);
    expect(run(text, wrapper)).toBe(text);
    const dialog = node('View', { role: 'alertdialog' }, [host]);
    expect(run(dialog, wrapper)).toBe(dialog);
  });
});

describe('clicks force past a disabled target (T16)', () => {
  const MENU: Dict = {
    ...WIDGET,
    anatomy: ['trigger', 'item'],
    props: { items: { type: 'array', shape: '{ id: string; label: string; disabled?: boolean }[]', description: 'Entries.' } },
  };
  const click = (part: string, given: Dict = {}): Dict => ({ name: 'c', given, when: { click: part }, then: [] });

  test('a disabled or loading component forces', () => {
    expect(bt.mayBeDisabled(WIDGET, click('control', { disabled: true }), 'control')).toBe(true);
    expect(bt.mayBeDisabled(WIDGET, click('control', { loading: true }), 'control')).toBe(true);
    expect(bt.mayBeDisabled(WIDGET, click('control'), 'control')).toBe(false);
  });

  test('a given list with a disabled entry forces, even on a component that declares no such shape', () => {
    expect(bt.mayBeDisabled(WIDGET, click('label', { tabs: [{ id: 'a', disabled: true }, { id: 'b' }] }), 'label')).toBe(true);
    expect(bt.mayBeDisabled(WIDGET, click('label', { tabs: [{ id: 'a' }] }), 'label')).toBe(false);
  });

  test('an item part of a component whose entries can be disabled forces; its primary part does not', () => {
    expect(bt.mayBeDisabled(MENU, click('item'), 'item')).toBe(true);
    expect(bt.mayBeDisabled(MENU, click('trigger'), 'trigger')).toBe(false);
  });

  test('otherwise lit decides at click time, from the control it actually clicks', () => {
    expect(bt.whenLines(MENU, click('trigger'), 'lit')).toEqual(['await userEvent.click(...(await pointerAt(activatable(s.trigger(), s.el), s.trigger())));']);
  });

  test('lit adds { force: true } and web skips the pointer-events check; rn has no actionability wait', () => {
    const sc = click('item', { items: [{ id: 'a', label: 'A', disabled: true }] });
    expect(bt.whenLines(MENU, sc, 'lit')).toEqual(['await userEvent.click(located(activatable(s.item(), s.el)), { force: true });']);
    expect(bt.whenLines(MENU, sc, 'web')).toEqual(['await userEvent.setup({ pointerEventsCheck: 0 }).click(activatable(s.item(), s.root()));']);
    expect(bt.whenLines(MENU, sc, 'rn')).toEqual(['fireEvent.press(activatable(s.item(), s.root()));']);
  });
});

describe('keyStroke', () => {
  test('Space is normalized to a space, then spelled per platform', () => {
    expect(bt.keyStroke('Space', 'web')).toBe('[Space]');
    expect(bt.keyStroke(' ', 'web')).toBe('[Space]');
    expect(bt.keyStroke('Space', 'lit')).toBe(' ');
    expect(bt.keyStroke('Enter', 'lit')).toBe('{Enter}');
    expect(bt.keyStroke('a', 'web')).toBe('a');
  });

  test('modifiers are held around the key and released in reverse', () => {
    expect(bt.keyStroke('Shift+Tab', 'web')).toBe('{Shift>}{Tab}{/Shift}');
    expect(bt.keyStroke('Control+Shift+a', 'lit')).toBe('{Control>}{Shift>}a{/Shift}{/Control}');
  });

  test('a typeahead range is not one key press', () => {
    expect(() => bt.keyStroke('a-z', 'web')).toThrow("when.key: 'a-z' is a typeahead range, not one key press");
  });

  test('the when line presses it', () => {
    expect(bt.whenLines(WIDGET, { name: 'k', when: { key: 'Shift+Tab' }, then: [] }, 'web')[1]).toBe("await s.user.keyboard('{Shift>}{Tab}{/Shift}');");
  });
});

describe('js — json.dumps, not JSON.stringify', () => {
  test('the separators and non-ASCII escaping Python used', () => {
    expect(bt.js({ open: true, n: 2 })).toBe('{"open": true, "n": 2}');
    expect(bt.js('an — em dash')).toBe('"an \\u2014 em dash"');
    expect(bt.js([1, 'a'])).toBe('[1, "a"]');
  });
});
