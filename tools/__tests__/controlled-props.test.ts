/** propDef.controls (job 611): the checks componentDef runs over it, `controlledPairs`, the orphan-default warning,
 *  and the behavior-test consumers that used to pair props by name. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { componentDef, componentWarnings, controlledPairs } from '../../schema/component.ts';
import type { ComponentDef } from '../../schema/component.ts';
import * as bt from '../behavior_tests.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { BODY, component, fmText, useStd, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();
const std = useStd();

afterEach(() => {
  parse.takeWarnings();
});

type Issue = { path: PropertyKey[]; message: string };

function issues(c: Dict): Issue[] {
  const r = componentDef.safeParse(c);
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
}

const accepts = (c: Dict): void => {
  expect(issues(c)).toEqual([]);
};
const rejects = (c: Dict, path: PropertyKey[], message: string): void => {
  expect(issues(c)).toContainEqual({ path, message });
};

/** The fixture component with these props added, and onChange and onOpenChange mapped on its platforms (web, rn). */
function withProps(props: Dict): Dict {
  const c = component();
  for (const name of ['onChange', 'onOpenChange']) c.events[name] = { description: `${name}.`, platforms: { web: name, rn: name } };
  Object.assign(c.props, props);
  return c;
}

const bool = (extra: Dict = {}): Dict => ({ type: 'boolean', description: 'x', ...extra });

/** Checkbox's `checked`, seeded by `defaultChecked`. */
const CHECKED = {
  checked: bool({ controls: { default: 'defaultChecked', event: 'onChange', state: 'checked' } }),
  defaultChecked: bool({ default: false }),
};

describe('the field', () => {
  test("Combobox's open: controlled, reported by onOpenChange, no default prop", () => {
    accepts(withProps({ open: bool({ controls: { event: 'onOpenChange', state: 'open' } }) }));
  });

  test("Checkbox's checked: seeded by defaultChecked, reported by onChange", () => {
    accepts(withProps(CHECKED));
  });

  test('controls is strict, and state is a behavior state', () => {
    expect(issues(withProps({ open: bool({ controls: { event: 'onOpenChange', seed: 'x' } }) })).map((i) => i.path)).toEqual([['props', 'open', 'controls']]);
    expect(issues(withProps({ open: bool({ controls: { event: 'onOpenChange', state: 'visible' } }) })).map((i) => i.path)).toEqual([['props', 'open', 'controls', 'state']]);
    expect(issues(withProps({ open: bool({ controls: { state: 'open' } }) })).map((i) => i.path)).toEqual([['props', 'open', 'controls', 'event']]);
  });
});

describe('the checks', () => {
  test('controls.event names an event of the component', () => {
    accepts(withProps({ open: bool({ controls: { event: 'onOpenChange' } }) }));
    rejects(withProps({ open: bool({ controls: { event: 'onToggle' } }) }), ['props', 'open', 'controls', 'event'], "props.open.controls.event names 'onToggle', which is not an event of this component");
  });

  test('controls.default names a prop', () => {
    accepts(withProps(CHECKED));
    rejects(withProps({ checked: CHECKED.checked }), ['props', 'checked', 'controls', 'default'], "props.checked.controls.default names 'defaultChecked', which is not a prop");
  });

  test('controls.default names a prop other than this one', () => {
    rejects(withProps({ checked: bool({ controls: { default: 'checked', event: 'onChange' } }) }), ['props', 'checked', 'controls', 'default'], 'props.checked.controls.default names the prop itself');
  });

  test('the default prop has the same type', () => {
    rejects(withProps({ ...CHECKED, defaultChecked: { type: 'string', description: 'x' } }), ['props', 'checked', 'controls', 'default'], "props.checked.controls.default 'defaultChecked' is type 'string', not 'boolean'");
  });

  test('the default prop has the same shape when either has one', () => {
    const value = { type: 'union', shape: 'string | string[]', description: 'x', controls: { default: 'defaultValue', event: 'onChange' } };
    accepts(withProps({ value, defaultValue: { type: 'union', shape: 'string | string[]', description: 'x' } }));
    rejects(withProps({ value, defaultValue: { type: 'union', shape: 'string', description: 'x' } }), ['props', 'value', 'controls', 'default'], "props.value.controls.default 'defaultValue' has shape 'string', not 'string | string[]'");
    const sort = { type: 'object', shape: '{ column: string }', description: 'x', controls: { default: 'defaultSort', event: 'onChange' } };
    rejects(withProps({ sort, defaultSort: { type: 'object', description: 'x' } }), ['props', 'sort', 'controls', 'default'], "props.sort.controls.default 'defaultSort' has shape None, not '{ column: string }'");
  });

  test('an enum default prop has the same values, in any order', () => {
    const tab = { type: 'enum', values: ['a', 'b'], description: 'x', controls: { default: 'defaultTab', event: 'onChange' } };
    accepts(withProps({ tab, defaultTab: { type: 'enum', values: ['b', 'a'], description: 'x' } }));
    rejects(withProps({ tab, defaultTab: { type: 'enum', values: ['a', 'c'], description: 'x' } }), ['props', 'tab', 'controls', 'default'], "props.tab.controls.default 'defaultTab' has values ['a', 'c'], not ['a', 'b']");
  });

  test('the default prop is not required', () => {
    rejects(withProps({ ...CHECKED, defaultChecked: bool({ required: true }) }), ['props', 'checked', 'controls', 'default'], "props.checked.controls.default 'defaultChecked' is required, but it is only read when 'checked' is omitted");
  });

  test('the default prop does not declare controls itself', () => {
    rejects(
      withProps({ ...CHECKED, defaultChecked: bool({ controls: { event: 'onChange' } }) }),
      ['props', 'checked', 'controls', 'default'],
      "props.checked.controls.default 'defaultChecked' declares controls itself",
    );
  });

  test('no two props name the same default', () => {
    const pressed = bool({ controls: { default: 'defaultChecked', event: 'onChange' } });
    accepts(withProps({ ...CHECKED, pressed: bool({ controls: { default: 'defaultPressed', event: 'onChange' } }), defaultPressed: bool() }));
    rejects(withProps({ ...CHECKED, pressed }), ['props', 'pressed', 'controls', 'default'], "props.pressed.controls.default 'defaultChecked' already seeds props.checked");
  });

  test('a controlled prop takes no default', () => {
    rejects(
      withProps({ open: bool({ default: false, controls: { event: 'onOpenChange' } }) }),
      ['props', 'open', 'default'],
      'props.open.controls: a controlled prop takes no default, because a default would make every instance controlled',
    );
  });

  test('controls.state appears only on a boolean prop', () => {
    rejects(withProps({ value: { type: 'string', description: 'x', controls: { event: 'onChange', state: 'selected' } } }), ['props', 'value', 'controls', 'state'], "props.value.controls.state 'selected' needs a boolean prop, got 'string'");
  });

  test("when both narrow platforms, the default prop's are within the controlled prop's", () => {
    accepts(withProps({ checked: { ...CHECKED.checked, platforms: ['web', 'rn'] }, defaultChecked: bool({ platforms: ['web'] }) }));
    accepts(withProps({ checked: CHECKED.checked, defaultChecked: bool({ platforms: ['web'] }) }));
    rejects(
      withProps({ checked: { ...CHECKED.checked, platforms: ['web'] }, defaultChecked: bool({ platforms: ['web', 'rn'] }) }),
      ['props', 'checked', 'controls', 'default'],
      "props.checked.controls.default 'defaultChecked' platforms ['web', 'rn'] are not within ['web']",
    );
  });
});

describe('controlledPairs', () => {
  test('declared pairs come first, then name pairs; a default with no prop to seed is not a pair', () => {
    const c = withProps({
      value: { type: 'string', description: 'x' },
      defaultValue: { type: 'string', description: 'x' },
      defaultActiveValue: { type: 'string', description: 'x' },
      ...CHECKED,
      open: bool({ controls: { event: 'onOpenChange', state: 'open' } }),
    });
    expect(controlledPairs(c)).toEqual([
      { prop: 'checked', default: 'defaultChecked', event: 'onChange', state: 'checked', declared: true },
      { prop: 'open', default: null, event: 'onOpenChange', state: 'open', declared: true },
      { prop: 'value', default: 'defaultValue', event: null, state: null, declared: false },
    ]);
  });

  test('a declared pair replaces the name rule for its props', () => {
    const c = withProps({
      expanded: bool({ controls: { default: 'initiallyExpanded', event: 'onChange', state: 'expanded' } }),
      initiallyExpanded: bool(),
      defaultExpanded: bool(),
    });
    expect(controlledPairs(c)).toEqual([{ prop: 'expanded', default: 'initiallyExpanded', event: 'onChange', state: 'expanded', declared: true }]);
  });
});

// --------------------------------------------------------------------- the corpus

const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as Dict);

describe('generated/components.json', () => {
  test('25 name pairs, none declared, and no pair for Listbox.defaultActiveValue', () => {
    const pairs = generated.flatMap((c) => controlledPairs(c).map((pair) => ({ component: c.name as string, ...pair })));
    expect(pairs).toHaveLength(25);
    expect(pairs.filter((pair) => pair.declared)).toEqual([]);
    expect(pairs.every((pair) => pair.default === `default${pair.prop[0]?.toUpperCase()}${pair.prop.slice(1)}` && pair.event === null)).toBe(true);
    expect(pairs.find((pair) => pair.default === 'defaultActiveValue')).toBeUndefined();
  });

  test('componentWarnings reports exactly one orphan default, Listbox.defaultActiveValue', () => {
    const found = generated.flatMap((c) => componentWarnings(c as ComponentDef).filter((w) => w.path.startsWith('props.') && w.message.startsWith('seeds ')).map((w) => ({ component: c.name, ...w })));
    expect(found).toEqual([{ component: 'Listbox', path: 'props.defaultActiveValue', message: "seeds 'activeValue', which is not a prop" }]);
  });
});

describe('componentWarnings', () => {
  test('a default prop that a controls.default names is not an orphan', () => {
    const c = withProps({ current: bool({ controls: { default: 'defaultActive', event: 'onChange' } }), defaultActive: bool() });
    expect(componentWarnings(c as ComponentDef)).toEqual([]);
    expect(componentWarnings(withProps({ defaultActive: bool() }) as ComponentDef)).toEqual([{ path: 'props.defaultActive', message: "seeds 'active', which is not a prop" }]);
    const named = withProps({ active: bool({ controls: { default: 'defaultActiveValue', event: 'onChange' } }), defaultActiveValue: bool() });
    expect(componentWarnings(named as ComponentDef)).toEqual([]);
  });
});

describe('parse.main', () => {
  test('a doc with an orphan default parses, and the orphan is reported as a warning', () => {
    const root = tmp();
    const templates = join(root, 'templates');
    write(join(templates, 'web.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'rn.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'theme.md'), '{{NAME}}');
    const c = component();
    c.props.defaultActiveValue = { type: 'string', description: 'The option active on first render.' };
    write(join(root, 'components', 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    Object.assign(parse.paths, {
      ROOT: root, DOCS: join(root, 'components'), THEME_DOCS: join(root, 'themes'), OUT: join(root, 'generated'), TEMPLATES: templates,
      EXT_DOCS: join(root, 'extensions'), PATTERN_DOCS: join(root, 'patterns'),
    });
    const warning = { file: 'components/widget.md', message: "props.defaultActiveValue: seeds 'activeValue', which is not a prop" };

    expect(parse.main(), 'a warning never fails the run').toBe(0);
    // main drains the channel into what it reports (job 609): parse-warnings.json is its takeWarnings() result.
    expect(JSON.parse(readFileSync(join(root, 'generated', 'parse-warnings.json'), 'utf8'))).toEqual([warning]);
    expect(std.err()).toBe(`⚠ ${warning.file}: ${warning.message}\n`);

    for (const w of parse.hooks.componentWarnings(c as ComponentDef)) parse.warn('components/widget.md', `${w.path}: ${w.message}`);
    expect(parse.takeWarnings()).toContainEqual(warning);
  });
});

// --------------------------------------------------------------------- the consumers

/** `expanded` seeded by `initiallyExpanded`, and `shown` driving the open state: neither follows the name rule. */
const UNCONVENTIONAL = {
  expanded: bool({ controls: { default: 'initiallyExpanded', event: 'onChange', state: 'expanded' } }),
  initiallyExpanded: bool(),
  shown: bool({ controls: { event: 'onOpenChange', state: 'open' } }),
};

const RENDERS = { name: 'renders', then: [{ renders: true }] };

describe('swiftUncontrolled', () => {
  test('a declared default is where a literal for the controlled prop goes, whatever the names', () => {
    expect(bt.swiftUncontrolled(UNCONVENTIONAL, { expanded: true })).toEqual({ initiallyExpanded: true });
    expect(bt.swiftUncontrolled(UNCONVENTIONAL, { expanded: true, initiallyExpanded: false })).toEqual({ expanded: true, initiallyExpanded: false });
  });

  test('a declared pair without a default, and a default<X> beside a declared pair, are not remapped', () => {
    expect(bt.swiftUncontrolled(UNCONVENTIONAL, { shown: true })).toEqual({ shown: true });
    expect(bt.swiftUncontrolled({ ...UNCONVENTIONAL, defaultExpanded: bool() }, { expanded: true })).toEqual({ initiallyExpanded: true });
  });

  test('the name rule still pairs undeclared props', () => {
    expect(bt.swiftUncontrolled({ open: bool(), defaultOpen: bool() }, { open: true })).toEqual({ defaultOpen: true });
    expect(bt.swiftUncontrolled({ activeValue: bool() }, { activeValue: true })).toEqual({ activeValue: true });
  });
});

describe('effectiveGiven', () => {
  test('the prop whose controls.state is open is set, not a prop named open', () => {
    const c = withProps({ ...UNCONVENTIONAL, open: bool() });
    expect(bt.effectiveGiven(c, RENDERS)).toEqual({ shown: true });
    expect(bt.effectiveGiven(c, { ...RENDERS, given: { shown: false } })).toEqual({ shown: false });
  });

  test('a controlled prop driving another state is not opened', () => {
    const c = withProps({ expanded: UNCONVENTIONAL.expanded, initiallyExpanded: bool() });
    expect(bt.effectiveGiven(c, RENDERS)).toEqual({});
  });

  test('without a declared open state it falls back to a boolean prop named open', () => {
    expect(bt.effectiveGiven(withProps({ open: bool() }), RENDERS)).toEqual({ open: true });
    expect(bt.effectiveGiven(withProps({ open: { type: 'string', description: 'x' } }), RENDERS)).toEqual({});
  });
});
