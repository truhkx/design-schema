/** schema/component.ts — componentDef's cross-field `.check`: one accepted and one rejected fixture per rule, asserting
 *  the issue path and message. The parser, the site's content collection and the website all report these issues. */
import { describe, expect, test } from 'vitest';

import { ARIA_ROLES, componentDef, componentFrontmatter, LANDMARK_ROLES, MODAL_REQUIRES, NON_QUERYABLE_ROLES, resolveRole, roleIn, WIDGET_ROLES } from '../../schema/component.ts';
import { extensionDef } from '../../schema/extension.ts';
import { pyRepr } from '../lib/py.ts';
import type { Dict } from '../parse.ts';
import { component } from './fixtures.ts';

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

/** The fixture plus a Lit platform (so scenarios may narrow to web and lit) and the given scenarios. */
function withBehavior(...scenarios: Dict[]): Dict {
  const c = component();
  c.behavior = scenarios;
  c.platforms.lit = { tag: 'ds-widget' };
  c.events.onPress.platforms.lit = 'press';
  return c;
}

const CLICK = { name: 'click-fires', when: { click: 'container' }, then: [{ event: 'onPress' }] };

describe('the check keeps the object schema intact', () => {
  test('.shape is still there for the extension schema', () => {
    expect(Object.keys(componentDef.shape)).toContain('keyboard');
    expect(extensionDef.safeParse({ extends: 'Widget', name: 'x', keyboard: [{ keys: ['Enter'], action: 'x' }] }).success).toBe(true);
  });

  test('the fixture passes, and frontmatter paths start at component', () => {
    accepts(component());
    const c = component();
    c.composition = { closeButton: 'Button' };
    const r = componentFrontmatter.safeParse({ component: c });
    expect(r.error?.issues.map((i) => i.path)).toEqual([['component', 'composition', 'closeButton']]);
  });

  test('a shape error skips the cross-field rules', () => {
    const c = component();
    c.category = 'vibes';
    c.composition = { closeButton: 'Button' };
    expect(issues(c).map((i) => i.path)).toEqual([['category']]);
  });
});

/** The fixture with its role read from an enum prop, the way Landmark declares it. */
function roleFromProp(): Dict {
  const c = component();
  delete c.a11y.role;
  c.props.kind = { type: 'enum', values: ['navigation', 'region'], default: 'region', description: 'Which landmark.' };
  c.a11y.roleFrom = 'kind';
  return c;
}

describe('roles, APG slugs and key chords', () => {
  test('a11y.role is a WAI-ARIA 1.2 role', () => {
    const c = component();
    c.a11y.role = 'text';
    expect(issues(c).map((i) => i.path)).toEqual([['a11y', 'role']]);
    c.a11y.role = 'generic';
    accepts(c);
  });

  test('roleFrom names an enum prop whose values are roles', () => {
    accepts(roleFromProp());
  });

  test('exactly one of role and roleFrom', () => {
    const both = roleFromProp();
    both.a11y.role = 'region';
    rejects(both, ['a11y'], "a11y needs exactly one of 'role' and 'roleFrom'");
    const neither = component();
    delete neither.a11y.role;
    rejects(neither, ['a11y'], "a11y needs exactly one of 'role' and 'roleFrom'");
  });

  test('roleFrom naming a non-enum prop is rejected', () => {
    const c = roleFromProp();
    c.a11y.roleFrom = 'label';
    rejects(c, ['a11y', 'roleFrom'], "a11y.roleFrom 'label' is not an enum prop");
    c.a11y.roleFrom = 'missing';
    rejects(c, ['a11y', 'roleFrom'], "a11y.roleFrom 'missing' is not an enum prop");
  });

  test('roleFrom naming an enum of non-roles is rejected', () => {
    const c = roleFromProp();
    c.a11y.roleFrom = 'variant';
    rejects(c, ['a11y', 'roleFrom'], "a11y.roleFrom 'variant' has values that are not ARIA roles: ['primary', 'danger']");
  });

  test('apg is a real APG pattern slug', () => {
    const c = component();
    c.apg = 'separator';
    expect(issues(c).map((i) => i.path)).toEqual([['apg']]);
    c.apg = 'windowsplitter';
    accepts(c);
  });

  test('keyboard keys are key chords', () => {
    const c = component();
    c.a11y.requires.push('keyboard-operable');
    c.keyboard = [{ keys: ['Ctrl+A'], action: 'Selects all.' }];
    expect(issues(c)).toEqual([{ path: ['keyboard', 0, 'keys', 0], message: expect.stringContaining('KeyboardEvent.key') }]);
    c.keyboard = [{ keys: ['Control+a', 'Control+Home', 'Space', ' '], action: 'Selects all.' }];
    accepts(c);
  });

  test('the partitions are concrete roles, and abstract roles are not roles', () => {
    for (const role of [...WIDGET_ROLES, ...LANDMARK_ROLES, ...NON_QUERYABLE_ROLES]) expect(roleIn(ARIA_ROLES, role), role).toBe(true);
    for (const role of ['landmark', 'widget', 'section', 'text']) expect(roleIn(ARIA_ROLES, role), role).toBe(false);
  });

  test('resolveRole: the role, the given roleFrom value, its default, or null', () => {
    expect(resolveRole(component())).toBe('button');
    expect(resolveRole(roleFromProp(), { kind: 'navigation' })).toBe('navigation');
    expect(resolveRole(roleFromProp())).toBe('region');
    const noDefault = roleFromProp();
    delete noDefault.props.kind.default;
    expect(resolveRole(noDefault)).toBeNull();
  });
});

describe('union props and checked defaults', () => {
  /** The fixture with one extra prop, and the issues it raises. */
  const withProp = (prop: Dict): Dict => {
    const c = component();
    c.props.extra = { description: 'x', ...prop };
    return c;
  };

  test('a union prop needs a shape', () => {
    accepts(withProp({ type: 'union', shape: 'string | string[]' }));
    rejects(withProp({ type: 'union' }), ['props', 'extra', 'shape'], "a union prop needs 'shape'");
  });

  test('a scalar default has the prop type', () => {
    accepts(withProp({ type: 'boolean', default: false }));
    accepts(withProp({ type: 'number', default: 0 }));
    accepts(withProp({ type: 'string', default: '' }));
    rejects(withProp({ type: 'boolean', default: 'true' }), ['props', 'extra', 'default'], "a boolean prop's default must be a boolean, got 'true'");
    rejects(withProp({ type: 'number', default: '4' }), ['props', 'extra', 'default'], "a number prop's default must be a number, got '4'");
    rejects(withProp({ type: 'string', default: 4 }), ['props', 'extra', 'default'], "a string prop's default must be a string, got 4");
  });

  test('an enum default is one of the values', () => {
    accepts(withProp({ type: 'enum', values: ['a', 'b'], default: 'b' }));
    rejects(withProp({ type: 'enum', values: ['a', 'b'], default: 'c' }), ['props', 'extra', 'default'], "default 'c' is not one of ['a', 'b']");
  });

  test.each(['content', 'array', 'object', 'function', 'union'])('a %s prop takes no default', (type) => {
    rejects(withProp({ type, shape: 'string | string[]', default: 'x' }), ['props', 'extra', 'default'], `a ${type} prop takes no default`);
  });

  test('an enum without values reports the values, not the default', () => {
    expect(issues(withProp({ type: 'enum', default: 'a' }))).toEqual([{ path: ['props', 'extra', 'values'], message: "an enum prop needs 'values'" }]);
  });
});

describe('moved from tools/parse.ts validate', () => {
  test('a token slot names an enum prop', () => {
    accepts(component());
    const c = component();
    c.styles.background = { token: 'color.action.{label}.background' };
    rejects(c, ['styles', 'background', 'token'], "styles.background interpolates '{label}' but 'label' is not an enum prop");
  });

  test('a token slot naming no prop at all', () => {
    const c = component();
    c.styles.background = { token: 'color.action.{tone}.background' };
    rejects(c, ['styles', 'background', 'token'], "styles.background interpolates '{tone}' but 'tone' is not an enum prop");
  });

  test('a composition part is an anatomy part', () => {
    const ok = component();
    ok.composition = { label: 'Text' };
    accepts(ok);
    const c = component();
    c.composition = { closeButton: 'Button' };
    rejects(c, ['composition', 'closeButton'], "composition.closeButton is not in anatomy ['container', 'label']");
  });

  test('a keyboard block requires keyboard-operable', () => {
    const ok = component();
    ok.keyboard = [{ keys: ['Enter'], action: 'Activates.' }];
    ok.a11y.requires.push('keyboard-operable');
    accepts(ok);
    const c = component();
    c.keyboard = [{ keys: ['Enter'], action: 'Activates.' }];
    rejects(c, ['keyboard'], "has a keyboard block but a11y.requires lacks 'keyboard-operable'");
  });

  test('an Escape key requires escape-dismiss', () => {
    const ok = component();
    ok.keyboard = [{ keys: ['Escape'], action: 'Closes.' }];
    ok.a11y.requires.push('keyboard-operable', 'escape-dismiss');
    accepts(ok);
    const c = component();
    c.keyboard = [{ keys: ['Enter'], action: 'Activates.' }, { keys: ['Enter', 'Escape'], action: 'Ends editing.' }];
    c.a11y.requires.push('keyboard-operable');
    rejects(c, ['keyboard', 1, 'keys', 1], "keyboard uses Escape but a11y.requires lacks 'escape-dismiss'");
  });

  test('a gesture event requires gesture-alternative', () => {
    const ok = component();
    ok.events.onSwipe = { description: 'Swiped.', gesture: true, platforms: { web: 'onSwipe', rn: 'onSwipe' } };
    ok.a11y.requires.push('gesture-alternative');
    accepts(ok);
    const c = component();
    c.events.onSwipe = { description: 'Swiped.', gesture: true, platforms: { web: 'onSwipe', rn: 'onSwipe' } };
    rejects(c, ['events', 'onSwipe', 'gesture'], "declares a gesture event but a11y.requires lacks 'gesture-alternative'");
  });

  test('every event maps on every platform not marked unsupported', () => {
    const ok = component();
    ok.platforms.lit = { supported: false, notes: 'Not mapped yet.' };
    accepts(ok);
    const c = component();
    delete c.events.onPress.platforms.rn;
    rejects(c, ['events', 'onPress', 'platforms'], "events.onPress has no mapping for platform 'rn'");
  });
});

describe('moved from tools/parse.ts validateBehavior', () => {
  test('scenario names are unique', () => {
    accepts(withBehavior(CLICK, { ...CLICK, name: 'click-again' }));
    rejects(withBehavior(CLICK, CLICK), ['behavior', 1, 'name'], "duplicate behavior scenario 'click-fires'");
  });

  test('scenario platforms are declared platforms', () => {
    accepts(withBehavior({ ...CLICK, platforms: ['web', 'lit'] }));
    rejects(withBehavior({ ...CLICK, platforms: ['web', 'swiftui'] }), ['behavior', 0, 'platforms', 1], "scenario 'click-fires' platforms includes 'swiftui', which the component does not declare");
  });

  test('item platforms are declared platforms', () => {
    accepts(withBehavior({ ...CLICK, then: [{ event: 'onPress', platforms: ['rn'] }] }));
    rejects(withBehavior({ ...CLICK, then: [{ event: 'onPress', platforms: ['swiftui'] }] }), ['behavior', 0, 'then', 0, 'platforms', 0], "scenario 'click-fires' then item platforms includes 'swiftui', which the component does not declare");
  });

  test('item platforms stay within the scenario', () => {
    accepts(withBehavior({ ...CLICK, platforms: ['web', 'lit'], then: [{ event: 'onPress', platforms: ['web'] }] }));
    rejects(withBehavior({ ...CLICK, platforms: ['web'], then: [{ event: 'onPress', platforms: ['rn'] }] }), ['behavior', 0, 'then', 0, 'platforms'], "scenario 'click-fires' then item platforms ['rn'] outside the scenario's platforms ['web']");
  });

  test('given names a prop', () => {
    accepts(withBehavior({ ...CLICK, given: { label: 'Save' } }));
    rejects(withBehavior({ ...CLICK, given: { colour: 'red' } }), ['behavior', 0, 'given', 'colour'], "scenario 'click-fires' given: unknown prop 'colour'");
  });

  test('an enum given is one of the values', () => {
    accepts(withBehavior({ ...CLICK, given: { variant: 'danger' } }));
    rejects(withBehavior({ ...CLICK, given: { variant: 'tertiary' } }), ['behavior', 0, 'given', 'variant'], "scenario 'click-fires' given.variant: 'tertiary' is not one of ['primary', 'danger']");
  });

  test('a boolean given is a boolean', () => {
    const ok = withBehavior({ ...CLICK, given: { disabled: true } });
    ok.props.disabled = { type: 'boolean', description: 'x' };
    accepts(ok);
    const c = withBehavior({ ...CLICK, given: { disabled: 'yes' } });
    c.props.disabled = { type: 'boolean', description: 'x' };
    rejects(c, ['behavior', 0, 'given', 'disabled'], "scenario 'click-fires' given.disabled must be a boolean, got 'yes'");
  });

  test('a string given is a string', () => {
    accepts(withBehavior({ ...CLICK, given: { label: 'Save' } }));
    rejects(withBehavior({ ...CLICK, given: { label: 3 } }), ['behavior', 0, 'given', 'label'], "scenario 'click-fires' given.label must be a string, got 3");
  });

  test('a number given is a number', () => {
    const ok = withBehavior({ ...CLICK, given: { count: 3 } });
    ok.props.count = { type: 'number', description: 'x' };
    accepts(ok);
    const c = withBehavior({ ...CLICK, given: { count: '3' } });
    c.props.count = { type: 'number', description: 'x' };
    rejects(c, ['behavior', 0, 'given', 'count'], "scenario 'click-fires' given.count must be a number, got '3'");
  });

  test('a union given is any JSON value, whatever the shape says', () => {
    const union = { type: 'union', shape: 'string | string[]', description: 'x' };
    for (const value of ['a', ['a', 'b'], 3, { start: '2026-01-01', end: '2026-01-02' }]) {
      const c = withBehavior({ ...CLICK, given: { value } });
      c.props.value = union;
      accepts(c);
    }
    const c = withBehavior({ ...CLICK, given: { value: new Date(0) } });
    c.props.value = union;
    rejects(c, ['behavior', 0, 'given', 'value'], `scenario 'click-fires' given.value must be a JSON value (string | string[]), got ${pyRepr(new Date(0))}`);
  });

  test('when.set names props and values like given', () => {
    accepts(withBehavior({ ...CLICK, when: { set: { variant: 'danger' } } }));
    rejects(withBehavior({ ...CLICK, when: { set: { colour: 'red' } } }), ['behavior', 0, 'when', 'set', 'colour'], "scenario 'click-fires' when.set: unknown prop 'colour'");
  });

  test.each(['click', 'focus', 'hover'])('when.%s names an anatomy part', (key) => {
    accepts(withBehavior({ ...CLICK, when: { [key]: 'label' } }));
    rejects(withBehavior({ ...CLICK, when: { [key]: 'thumb' } }), ['behavior', 0, 'when', key], `scenario 'click-fires' when.${key}: unknown anatomy part 'thumb'`);
  });

  test('then.focused names an anatomy part or a focus word', () => {
    for (const target of ['container', 'none', 'moved', 'unchanged']) accepts(withBehavior({ ...CLICK, then: [{ focused: target }] }));
    rejects(withBehavior({ ...CLICK, then: [{ focused: 'elsewhere' }] }), ['behavior', 0, 'then', 0, 'focused'], "scenario 'click-fires' then.focused: unknown anatomy part 'elsewhere'");
  });

  test('then.attribute.on names an anatomy part', () => {
    accepts(withBehavior({ ...CLICK, then: [{ attribute: 'aria-busy', is: null, on: 'label' }] }));
    rejects(withBehavior({ ...CLICK, then: [{ attribute: 'aria-busy', is: null, on: 'thumb' }] }), ['behavior', 0, 'then', 0, 'on'], "scenario 'click-fires' then.attribute.on: unknown anatomy part 'thumb'");
  });

  test('then.event names an event', () => {
    accepts(withBehavior(CLICK));
    rejects(withBehavior({ ...CLICK, then: [{ event: 'onToggle' }] }), ['behavior', 0, 'then', 0, 'event'], "scenario 'click-fires' then.event: unknown event 'onToggle'");
  });

  test('then.copy names a copy key', () => {
    const ok = withBehavior({ ...CLICK, then: [{ copy: 'required' }] });
    ok.copy = { required: '{label} is required.' };
    accepts(ok);
    const c = withBehavior({ ...CLICK, then: [{ copy: 'optional' }] });
    c.copy = { required: '{label} is required.' };
    rejects(c, ['behavior', 0, 'then', 0, 'copy'], "scenario 'click-fires' then.copy: unknown copy key 'optional'");
  });

  test('when.key excludes React Native', () => {
    accepts(withBehavior({ ...CLICK, when: { key: 'Space' }, platforms: ['web', 'lit'] }));
    rejects(withBehavior({ ...CLICK, when: { key: 'Space' } }), ['behavior', 0, 'when', 'key'], "scenario 'click-fires' uses when.key but React Native has no keyboard — narrow platforms to exclude 'rn'");
  });

  test('then.focusable excludes React Native', () => {
    accepts(withBehavior({ ...CLICK, then: [{ focusable: true, platforms: ['web'] }] }));
    rejects(withBehavior({ ...CLICK, then: [{ focusable: true }] }), ['behavior', 0, 'then', 0, 'focusable'], "scenario 'click-fires' then.focusable: React Native cannot observe focus — narrow platforms to exclude 'rn'");
  });

  test('then.state invalid excludes React Native', () => {
    accepts(withBehavior({ ...CLICK, then: [{ state: 'invalid', is: true }], platforms: ['web', 'lit'] }));
    rejects(withBehavior({ ...CLICK, then: [{ state: 'invalid', is: true }] }), ['behavior', 0, 'then', 0, 'state'], "scenario 'click-fires' then.state invalid: React Native has no invalid accessibility state — narrow platforms to exclude 'rn'");
  });
});

describe('accessibility invariants', () => {
  test('error-identification requires an error prop', () => {
    const ok = component();
    ok.a11y.requires.push('error-identification');
    ok.props.error = { type: 'string', description: 'Error message.' };
    accepts(ok);
    const c = component();
    c.a11y.requires.push('error-identification');
    rejects(c, ['a11y', 'requires', 3], "a11y.requires has 'error-identification' but props has no 'error'");
  });

  test('contrast pairs require contrast-aa or contrast-aaa', () => {
    const ok = component();
    ok.a11y.requires = ['accessible-name', 'focus-visible', 'contrast-aaa'];
    accepts(ok);
    const c = component();
    c.a11y.requires = ['accessible-name', 'focus-visible'];
    rejects(c, ['a11y', 'contrast'], "has a11y.contrast pairs but a11y.requires lacks 'contrast-aa' or 'contrast-aaa'");
  });

  test('no contrast pairs need no contrast requirement', () => {
    const c = component();
    c.a11y.requires = ['accessible-name', 'focus-visible'];
    c.a11y.contrast = [];
    accepts(c);
  });

  test('a level AAA pair requires contrast-aaa', () => {
    const ok = component();
    ok.a11y.contrast[0].level = 'AAA';
    ok.a11y.requires.push('contrast-aaa');
    accepts(ok);
    const c = component();
    c.a11y.contrast.push({ foreground: 'color.foreground', background: 'color.background', level: 'AAA' });
    rejects(c, ['a11y', 'contrast', 1, 'level'], "a11y.contrast has a level AAA pair but a11y.requires lacks 'contrast-aaa'");
  });

  test.each(['target-24px', 'target-44px'])('%s requires a size.target binding', (req) => {
    const ok = component();
    ok.a11y.requires.push(req);
    ok.styles.minTarget = { token: 'size.target.min' };
    accepts(ok);
    const c = component();
    c.a11y.requires.push(req);
    rejects(c, ['a11y', 'requires', 3], `a11y.requires has '${req}' but no styles binding is on a size.target.* token and composition names no component`);
  });

  test('a target requirement with a composition entry is left to the parser', () => {
    const c = component();
    c.a11y.requires.push('target-24px');
    c.composition = { label: 'Button' };
    accepts(c);
  });

  test('keyboard-operable requires a keyboard block, a widget role or a composition entry', () => {
    const container = (): Dict => {
      const c = component();
      c.a11y.role = 'group';
      c.a11y.requires.push('keyboard-operable');
      return c;
    };
    const withKeyboard = container();
    withKeyboard.keyboard = [{ keys: ['Enter'], action: 'Activates.' }];
    accepts(withKeyboard);
    const composed = container();
    composed.composition = { label: 'Button' };
    accepts(composed);
    const widget = container();
    widget.a11y.role = 'switch';
    accepts(widget);
    rejects(container(), ['a11y', 'requires', 3], "a11y.requires has 'keyboard-operable' but there is no keyboard block, a11y.role 'group' is not a natively focusable widget role, and composition names no component");
  });

  test('WIDGET_ROLES is the one list of natively focusable roles', () => {
    expect(roleIn(WIDGET_ROLES, 'button')).toBe(true);
    expect(roleIn(WIDGET_ROLES, 'radiogroup')).toBe(false);
  });

  test.each(['dialog-modal', 'alertdialog'])('apg %s requires the modal set', (apg) => {
    const ok = component();
    ok.apg = apg;
    ok.a11y.requires.push(...MODAL_REQUIRES);
    accepts(ok);
    const c = component();
    c.apg = apg;
    c.a11y.requires.push('focus-restore');
    rejects(c, ['apg'], `apg '${apg}' is modal but a11y.requires lacks 'focus-trap', 'escape-dismiss', 'inert-background'`);
  });

  test('a non-modal apg needs none of the modal set', () => {
    const c = component();
    c.apg = 'disclosure';
    accepts(c);
  });

  test('an arrow key requires arrow-navigation', () => {
    const ok = component();
    ok.keyboard = [{ keys: ['Home', 'ArrowDown'], action: 'Moves.' }];
    ok.a11y.requires.push('keyboard-operable', 'arrow-navigation');
    accepts(ok);
    const c = component();
    c.keyboard = [{ keys: ['Home', 'Shift+ArrowDown'], action: 'Extends.' }];
    c.a11y.requires.push('keyboard-operable');
    rejects(c, ['keyboard', 0, 'keys', 1], "keyboard uses Shift+ArrowDown but a11y.requires lacks 'arrow-navigation'");
  });
});
