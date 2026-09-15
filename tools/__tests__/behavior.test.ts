/** tools/parse.ts — behavior scenarios: reference validation, platform narrowing, derived scenarios
 *  (port of tests/test_behavior.py). */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { BEHAVIOR_STATES, behaviorScenario, keyChord, normalizeKey } from '../../schema/component.ts';
import { readText } from '../lib/py.ts';
import { dump } from '../lib/pyyaml.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { component, expectDocError } from './fixtures.ts';

const PATH = 'widget.md';

/** The scenario rules are componentDef's `.check` now; the parser reports them through `validate`. */
const check = (c: parse.Dict, file: string): void => parse.validate({ component: c }, file);

function withBehavior(c: parse.Dict, ...scenarios: parse.Dict[]): parse.Dict {
  const out = structuredClone(c);
  out.behavior = scenarios;
  out.platforms.lit = { tag: 'ds-widget' };
  out.events.onPress.platforms.lit = 'press';
  return out;
}

const CLICK = { name: 'click-fires', when: { click: 'container' }, then: [{ event: 'onPress' }] };

describe('validateBehavior', () => {
  test('a valid scenario passes', () => {
    check(withBehavior(component(), CLICK), PATH);
  });

  test('unknown prop in given', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, given: { colour: 'red' } }), PATH), "unknown prop 'colour'");
  });

  test('enum value must be declared', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, given: { variant: 'tertiary' } }), PATH), 'not one of');
  });

  test('boolean prop needs a boolean', () => {
    const c = component();
    c.props.disabled = { type: 'boolean', description: 'x' };
    expectDocError(() => check(withBehavior(c, { ...CLICK, given: { disabled: 'yes' } }), PATH), 'must be a boolean');
  });

  test('unknown anatomy part', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, when: { click: 'thumb' } }), PATH), "unknown anatomy part 'thumb'");
  });

  test('unknown event', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, then: [{ event: 'onToggle' }] }), PATH), "unknown event 'onToggle'");
  });

  test('focused accepts parts and the three words', () => {
    for (const target of ['container', 'none', 'moved', 'unchanged']) {
      check(withBehavior(component(), { ...CLICK, then: [{ focused: target }], platforms: ['web', 'lit'] }), PATH);
    }
    expectDocError(() => check(withBehavior(component(), { ...CLICK, then: [{ focused: 'elsewhere' }], platforms: ['web'] }), PATH), "then.focused: unknown anatomy part 'elsewhere'");
  });

  test('hover and attribute.on name anatomy parts', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, when: { hover: 'thumb' } }), PATH), "when.hover: unknown anatomy part 'thumb'");
    expectDocError(() => check(withBehavior(component(), { ...CLICK, then: [{ attribute: 'aria-busy', is: null, on: 'thumb' }] }), PATH), "then.attribute.on: unknown anatomy part 'thumb'");
    check(withBehavior(component(), { ...CLICK, when: { hover: 'label' }, then: [{ attribute: 'aria-busy', is: null, on: 'label' }] }), PATH);
  });

  test('set names props and values like given', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, when: { set: { colour: 'red' } } }), PATH), "when.set: unknown prop 'colour'");
    expectDocError(() => check(withBehavior(component(), { ...CLICK, when: { set: { variant: 'tertiary' } } }), PATH), 'when.set.variant: \'tertiary\' is not one of');
    check(withBehavior(component(), { ...CLICK, when: { set: { variant: 'danger' } } }), PATH);
  });

  test('unknown copy key', () => {
    const c = component();
    c.copy = { required: '{label} is required.' };
    expectDocError(() => check(withBehavior(c, { ...CLICK, then: [{ copy: 'optional' }] }), PATH), "unknown copy key 'optional'");
  });

  test('undeclared platform', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, platforms: ['swiftui'] }), PATH), 'does not declare');
  });

  test('expectation cannot widen beyond the scenario', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, platforms: ['web'], then: [{ event: 'onPress', platforms: ['rn'] }] }), PATH), "outside the scenario's platforms");
  });

  test('duplicate names', () => {
    expectDocError(() => check(withBehavior(component(), CLICK, CLICK), PATH), 'duplicate behavior scenario');
  });

  test('derived is reserved for the parser', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, derived: true }), PATH), 'only the parser may set');
  });
});

describe('clause schema', () => {
  /** The shapes validateBehavior used to check by hand are schema/component.ts's whenClause and thenClause. */
  const parses = (sc: parse.Dict): boolean => behaviorScenario.safeParse(sc).success;

  test('a valid scenario parses', () => {
    expect(parses(CLICK)).toBe(true);
  });

  test('an unknown when key is rejected', () => {
    expect(parses({ ...CLICK, when: { press: 'container' } })).toBe(false);
  });

  test('two keys in one when are rejected', () => {
    expect(parses({ ...CLICK, when: { click: 'container', key: 'Enter' } })).toBe(false);
  });

  test('with alongside fired: false is rejected', () => {
    expect(parses({ ...CLICK, then: [{ event: 'onPress', fired: false, with: true }] })).toBe(false);
    expect(parses({ ...CLICK, then: [{ event: 'onPress', fired: false }] })).toBe(true);
    expect(parses({ ...CLICK, then: [{ event: 'onPress', with: { name: 'signup' } }] })).toBe(true);
  });

  test('a key outside keyChord is rejected, at when.key', () => {
    const r = behaviorScenario.safeParse({ ...CLICK, when: { key: 'Ctrl+A' } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['when', 'key']);
    for (const key of ['Enter', ' ', 'Space', 'Shift+Tab', 'Alt+ArrowDown', 'Control+a', 'F12', '*', ',', 'a-z']) expect(keyChord.safeParse(key).success, key).toBe(true);
    for (const key of ['Ctrl+A', 'Spacebar', 'F13', 'A', 'Shift+']) expect(keyChord.safeParse(key).success, key).toBe(false);
  });

  test('normalizeKey turns the Space alias into the key it names', () => {
    expect(normalizeKey('Space')).toBe(' ');
    expect(normalizeKey('Shift+Space')).toBe('Shift+ ');
    expect(normalizeKey('Enter')).toBe('Enter');
  });

  test('the focus alias is gone; focused is the assertion', () => {
    expect(parses({ ...CLICK, then: [{ focus: 'none' }] })).toBe(false);
    expect(parses({ ...CLICK, then: [{ focused: 'none' }] })).toBe(true);
  });

  test('state is one of BEHAVIOR_STATES and is is a boolean or mixed', () => {
    for (const state of BEHAVIOR_STATES) expect(parses({ ...CLICK, then: [{ state, is: true }] })).toBe(true);
    expect(parses({ ...CLICK, then: [{ state: 'busy', is: true }] })).toBe(false);
    expect(parses({ ...CLICK, then: [{ state: 'checked', is: 'mixed' }] })).toBe(true);
    expect(parses({ ...CLICK, then: [{ state: 'checked', is: 'on' }] })).toBe(false);
  });

  test('the negative and exact forms, and attribute absence, are allowed', () => {
    for (const item of [{ focusable: false }, { renders: false }, { name: 'Save draft' }, { attribute: 'aria-busy', is: null, on: 'label' }, { attribute: 'aria-busy', is: true }]) {
      expect(parses({ ...CLICK, then: [item] }), JSON.stringify(item)).toBe(true);
    }
    expect(parses({ ...CLICK, then: [{ name: false }] })).toBe(false);
  });

  test('every assertion may carry platforms', () => {
    expect(parses({ ...CLICK, then: [{ text: 'Saved.', platforms: ['web'] }] })).toBe(true);
    expect(parses({ ...CLICK, then: [{ text: 'Saved.', platforms: ['desktop'] }] })).toBe(false);
  });
});

describe('React Native limits', () => {
  /** What the RN harness cannot express must be narrowed away explicitly, not left to the generator. */
  test('key interaction must exclude rn', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, when: { key: 'Space' } }), PATH), 'no keyboard');
    check(withBehavior(component(), { ...CLICK, when: { key: 'Space' }, platforms: ['web', 'lit'] }), PATH);
  });

  test('focus expectations must exclude rn', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, then: [{ focusable: true }] }), PATH), 'cannot observe focus');
    // narrowing the single expectation is enough
    check(withBehavior(component(), { ...CLICK, then: [{ focusable: true, platforms: ['web'] }] }), PATH);
  });

  test('invalid state must exclude rn', () => {
    expectDocError(() => check(withBehavior(component(), { ...CLICK, then: [{ state: 'invalid', is: true }] }), PATH), 'no invalid accessibility state');
  });
});

describe('deriveBehavior', () => {
  test('role enum values and requirements', () => {
    const c = component();
    c.a11y.requires = ['accessible-name', 'keyboard-operable'];
    const names = parse.deriveBehavior(c).map((sc) => sc.name);
    expect(names.slice(0, 1)).toEqual(['renders']);
    for (const n of ['renders-variant-primary', 'renders-variant-danger', 'renders-size-sm', 'renders-size-md']) expect(names).toContain(n);
    expect(names).toContain('has-accessible-name');
    expect(names).toContain('control-is-focusable');
    expect(parse.deriveBehavior(c).every((sc) => sc.derived)).toBe(true);
  });

  test('focusable never targets rn', () => {
    const c = component();
    c.a11y.requires = ['keyboard-operable'];
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'control-is-focusable') as parse.Dict;
    expect(sc.platforms).not.toContain('rn');
  });

  test('roleless components only check rendering', () => {
    const c = component();
    c.a11y = { role: 'none', requires: [] };
    for (const sc of parse.deriveBehavior(c)) expect(sc.then).toEqual([{ renders: true }]);
  });

  test('error identification needs an error prop', () => {
    const c = component();
    c.a11y.requires = ['error-identification'];
    expect(parse.deriveBehavior(c).some((sc) => sc.name === 'error-is-identified')).toBe(false);
    c.props.error = { type: 'string', description: 'x' };
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'error-is-identified') as parse.Dict;
    expect(sc.given).toEqual({ error: 'Fix this before continuing.' });
    expect(sc.then[1].platforms).toEqual(['web', 'lit']);
  });

  test('enum render names are kebab-cased and pass the schema', () => {
    const c = component();
    c.props.headingLevel = { type: 'enum', values: ['2', 'startsWith'], description: 'x' };
    const names = parse.deriveBehavior(c).map((sc) => sc.name);
    expect(names).toContain('renders-heading-level-2');
    expect(names).toContain('renders-heading-level-starts-with');
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'renders-heading-level-2') as parse.Dict;
    expect(sc.given).toEqual({ headingLevel: '2' });
  });

  test('a derived shape the schema rejects fails loudly', () => {
    const c = component();
    c.props.size.values = ['md', 'x.y'];
    expect(() => parse.deriveBehavior(c)).toThrow();
  });

  test('platform limited enum props limit their scenarios', () => {
    const c = component();
    c.props.size.platforms = ['web'];
    const sizes = parse.deriveBehavior(c).filter((sc) => (sc.name as string).startsWith('renders-size-'));
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.every((sc) => JSON.stringify(sc.platforms) === '["web"]')).toBe(true);
  });
});

describe('behaviorFor', () => {
  test('narrows scenarios and expectations to the platform', () => {
    const c = withBehavior(
      component(),
      { ...CLICK, name: 'web-only', platforms: ['web'] },
      { ...CLICK, name: 'mixed', then: [{ event: 'onPress' }, { focusable: true, platforms: ['web', 'lit'] }] },
    );
    const rn = parse.behaviorFor(c, [], 'rn');
    expect(rn.map((sc) => sc.name)).toEqual(['mixed']);
    expect(rn[0]?.then).toEqual([{ event: 'onPress' }]);
    const web = parse.behaviorFor(c, [], 'web');
    expect(web.map((sc) => sc.name)).toEqual(['web-only', 'mixed']);
    expect(web[1]?.then[1]).toEqual({ focusable: true });
  });

  test('authored come before derived', () => {
    const c = withBehavior(component(), CLICK);
    const names = parse.behaviorFor(c, parse.deriveBehavior(c), 'web').map((sc) => sc.name);
    expect(names[0]).toBe('click-fires');
    expect(names.slice(1)).toContain('renders');
  });

  test('a scenario with no applicable expectation is dropped', () => {
    const c = withBehavior(component(), { ...CLICK, then: [{ focusable: true, platforms: ['web'] }] });
    expect(parse.behaviorFor(c, [], 'rn')).toEqual([]);
  });
});

describe('prompt rendering', () => {
  test('prompt carries the scenarios', () => {
    const c = withBehavior(component(), CLICK);
    const out = parse.renderPrompt(c, { 'When to use': 'x', Accessibility: 'y' }, 'web', dump({ component: c }));
    expect(out).toContain('## Behavior scenarios (');
    expect(out).toContain('- name: click-fires');
    expect(out).toContain('- name: renders');
    expect(out).not.toContain('{{BEHAVIOR_YAML}}');
    expect(out).not.toContain('{{BEHAVIOR_COUNT}}');
  });
});

describe('shipped docs', () => {
  /** The two docs that author scenarios today must keep validating, and their tests exist on every platform. */
  test.each(['switch', 'checkbox'])('%s.md declares scenarios', (name) => {
    const path = join(parse.paths.DOCS, `${name}.md`);
    const [fm] = parse.splitFrontmatter(readText(path), path);
    expect(fm.component.behavior, `${name}.md has no behavior block`).toBeTruthy();
    parse.validate(fm, path);
  });

  test.each(['packages/react/src/Switch.test.tsx', 'packages/lit/src/Switch.test.ts', 'packages/rn/src/Switch.test.tsx'])('%s exists', (path) => {
    expect(existsSync(join(REPO_ROOT, path))).toBe(true);
  });
});

describe('accessibleNameGiven', () => {
  /** has-accessible-name must render with the prop that carries the name when that prop is optional. */
  test('an optional prop whose a11y note names the accessible name is supplied', () => {
    const c = component();
    c.a11y.requires = ['accessible-name'];
    c.props.label.required = false;
    c.props.label.a11y = 'The accessible name (aria-label / accessibilityLabel) when there is no visible text.';
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'has-accessible-name') as parse.Dict;
    expect(sc.given).toEqual({ label: parse.ACCESSIBLE_NAME_PLACEHOLDER });
  });

  test('a required label needs no given', () => {
    const c = component();
    c.a11y.requires = ['accessible-name'];
    expect(c.props.label.required).toBe(true);
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'has-accessible-name') as parse.Dict;
    expect(sc).not.toHaveProperty('given');
  });

  test('an intrinsic name is left alone', () => {
    const c = component();
    c.a11y.requires = ['accessible-name'];
    c.props = { children: { type: 'content', required: true, description: 'Heading text.' } };
    c.styles = {};
    c.a11y.contrast = [];
    const sc = parse.deriveBehavior(c).find((s) => s.name === 'has-accessible-name') as parse.Dict;
    expect(sc).not.toHaveProperty('given');
  });

  test('the a11y note wins over a required title', () => {
    const c = component();
    c.props.title = { type: 'string', required: true, description: 'x' };
    c.props.name = { type: 'string', description: 'x', a11y: 'Read as the accessible name.' };
    expect(parse.accessibleNameProp(c)).toBe('name');
  });

  test('a declared a11yRole wins over the heuristic', () => {
    const c = component();
    c.props.name = { type: 'string', description: 'x', a11y: 'Read as the accessible name.' };
    c.props.summary = { type: 'string', required: true, description: 'x', a11yRole: 'accessible-name' };
    expect(parse.accessibleNameProp(c)).toBe('summary');
  });

  test('the shipped disclosure doc declares its naming prop', () => {
    const path = join(parse.paths.DOCS, 'disclosure.md');
    const [fm] = parse.splitFrontmatter(readText(path), path);
    expect(parse.accessibleNameProp(fm.component)).toBe('summary');
  });

  test('an enum naming prop uses its first value', () => {
    const c = component();
    c.props.icon = { type: 'enum', values: ['check', 'close'], description: 'x', a11y: 'Announced as the accessible name.' };
    expect(parse.accessibleNameGiven(c)).toEqual({ icon: 'check' });
  });

  test('the shipped icon doc gets a label', () => {
    const path = join(parse.paths.DOCS, 'icon.md');
    if (!existsSync(path)) return; // no Icon doc
    const [fm] = parse.splitFrontmatter(readText(path), path);
    const sc = parse.deriveBehavior(fm.component).find((s) => s.name === 'has-accessible-name') as parse.Dict;
    expect(sc.given?.label, "Icon's name comes from its optional label").toBeTruthy();
  });
});

describe('focusable derivation', () => {
  /** control-is-focusable only where the role names something that itself takes focus. */
  test.each(['button', 'switch', 'textbox', 'link', 'menuitem'])('widget role %s gets the scenario', (role) => {
    const c = component();
    c.a11y = { role, requires: ['keyboard-operable'] };
    expect(parse.deriveBehavior(c).map((s) => s.name)).toContain('control-is-focusable');
  });

  test.each(['form', 'navigation', 'status', 'dialog', 'menu', 'radiogroup', 'separator', 'none'])('container or region %s does not', (role) => {
    const c = component();
    c.a11y = { role, requires: ['keyboard-operable'] };
    expect(parse.deriveBehavior(c).map((s) => s.name)).not.toContain('control-is-focusable');
  });
});

describe('naming prop must carry text', () => {
  test('a boolean prop that mentions the name is not the naming prop', () => {
    const c = component();
    c.props.hideTitle = { type: 'boolean', description: 'x', a11y: 'The title stays the accessible name even when hidden.' };
    c.props.title = { type: 'string', required: true, description: 'x' };
    expect(parse.accessibleNameProp(c)).not.toBe('hideTitle');
    const given = parse.accessibleNameGiven(c);
    expect(given === null || !('hideTitle' in given)).toBe(true);
  });
});
