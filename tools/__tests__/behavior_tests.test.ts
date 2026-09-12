/** tools/behavior_tests.ts — tests derived from a component's `behavior` scenarios
 *  (port of tests/test_behavior_tests.py). */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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
    for (const platform of bt.JS_PLATFORMS) {
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
    label: { type: 'string', required: true, description: 'Visible text.' },
    variant: { type: 'enum', values: ['primary', 'icon-only'], default: 'primary', description: 'Emphasis.' },
    size: { type: 'enum', values: ['sm', '2xl'], default: 'sm', description: 'Scale.' },
    open: { type: 'boolean', description: 'Controlled.' },
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
    for (const item of [{ focusable: true }, { focused: 'control' }, { focus: 'none' }]) {
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
    expect(swiftSkips(content)[0]).toContain('has-weird-attr');
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
    for (const platform of bt.PLATFORMS) {
      write(join(tmp(), (bt.SOURCE_FILE[platform] as string).replace('{name}', 'Widget')), 'export {};');
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
    rmSync(join(tmp(), (bt.SOURCE_FILE.swiftui as string).replace('{name}', 'Widget')));
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

describe('js — json.dumps, not JSON.stringify', () => {
  test('the separators and non-ASCII escaping Python used', () => {
    expect(bt.js({ open: true, n: 2 })).toBe('{"open": true, "n": 2}');
    expect(bt.js('an — em dash')).toBe('"an \\u2014 em dash"');
    expect(bt.js([1, 'a'])).toBe('[1, "a"]');
  });
});
