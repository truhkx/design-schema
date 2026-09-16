/** schema/component.ts — componentDef's cross-field `.check`: one accepted and one rejected fixture per rule, asserting
 *  the issue path and message. The parser, the site's content collection and the website all report these issues. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { A11Y_REQUIREMENTS, ARIA_ROLES, bindingTokens, componentDef, componentFrontmatter, componentWarnings, copyPlaceholders, copyText, expectList, formDef, KEYBOARD_EXPECTS, LANDMARK_ROLES, lockRule, MODAL_REQUIRES, narrowForPlatform, NON_QUERYABLE_ROLES, overlayDef, reflectEntry, resolveRole, roleIn, WIDGET_ROLES } from '../../schema/component.ts';
import type { ComponentDef } from '../../schema/component.ts';
import { extensionDef } from '../../schema/extension.ts';
import { NO_TOKEN_VALUES } from '../../schema/tokens.ts';
import { VOCAB } from '../../schema/vocab.ts';
import { pyRepr } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
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

  test('the form and overlay blocks are in .shape, and extensionDef still parses without taking them', () => {
    expect(Object.keys(componentDef.shape)).toEqual(expect.arrayContaining(['form', 'overlay']));
    expect(extensionDef.safeParse({ extends: 'Widget', name: 'x', props: { tone: { type: 'string', description: 'x' } }, behavior: [CLICK] }).success).toBe(true);
    expect(extensionDef.safeParse({ extends: 'Widget', name: 'x', overlay: { layer: 'popover' } }).success).toBe(false);
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

/** An Input-shaped field: a string value keyed by name, required and pattern checks with copy for their messages. */
const INPUT_FORM = {
  role: 'field',
  value: 'value',
  valueType: 'string',
  name: 'name',
  validation: ['required', 'pattern', 'custom'],
  messages: { required: 'requiredMessage', pattern: 'patternMessage' },
  discovery: 'context',
};

function inputShaped(): Dict {
  const c = component();
  Object.assign(c, { name: 'Input', category: 'input', anatomy: ['container', 'label', 'input', 'error'] });
  Object.assign(c.props, {
    name: { type: 'string', description: 'Keys the value in the submitted record.' },
    value: { type: 'string', description: 'The text.' },
    tags: { type: 'union', shape: 'string | string[]', description: 'Selected tags.' },
    required: { type: 'boolean', default: false, description: 'Must be filled.' },
    error: { type: 'string', description: 'Validation message.' },
  });
  c.copy = { requiredMessage: '{label} is required.', patternMessage: '{label} is not in the expected format.' };
  c.a11y.role = 'textbox';
  c.form = structuredClone(INPUT_FORM);
  return c;
}

/** A Popover-shaped layer: anchored to its trigger, flipping and shifting, dismissed by Escape, an outside press or
 *  focus leaving it. */
const POPOVER_OVERLAY = {
  layer: 'popover',
  anchor: 'trigger',
  placement: 'placement',
  collision: 'flip-shift',
  open: 'open',
  closeEvent: 'onOpenChange',
  dismiss: ['escape', 'outside-press', 'focus-out'],
  modal: false,
};

function popoverShaped(): Dict {
  const c = component();
  Object.assign(c, { name: 'Popover', category: 'overlay', anatomy: ['trigger', 'popup'] });
  Object.assign(c.props, {
    open: { type: 'boolean', description: 'Whether the popup shows.' },
    placement: { type: 'enum', values: ['top', 'bottom', 'start', 'end'], default: 'bottom', description: 'Preferred side.' },
  });
  c.events.onOpenChange = { description: 'Opened or dismissed.', platforms: { web: 'onOpenChange', rn: 'onOpenChange' } };
  c.a11y.role = 'dialog';
  c.a11y.requires.push('escape-dismiss');
  c.overlay = structuredClone(POPOVER_OVERLAY);
  return c;
}

describe('the form block', () => {
  test('an Input-shaped field parses every field of the block', () => {
    const parsed = componentDef.parse(inputShaped());
    expect(parsed.form).toEqual(INPUT_FORM);
    expect(Object.keys(parsed.form ?? {}).sort()).toEqual(Object.keys(formDef.shape).sort());
  });

  test('a container needs no value', () => {
    const c = component();
    c.form = { role: 'container', discovery: 'attribute' };
    accepts(c);
  });

  test('a field needs value and valueType', () => {
    const c = inputShaped();
    delete c.form.value;
    delete c.form.valueType;
    rejects(c, ['form'], "form.role is 'field' but form has no 'value'");
    rejects(c, ['form'], "form.role is 'field' but form has no 'valueType'");
  });

  test('value names a prop', () => {
    const c = inputShaped();
    c.form.value = 'text';
    rejects(c, ['form', 'value'], "form.value 'text' is not a prop");
  });

  test('name names a prop', () => {
    const c = inputShaped();
    c.form.name = 'field';
    rejects(c, ['form', 'name'], "form.name 'field' is not a prop");
  });

  test('a boolean value type needs a boolean value prop', () => {
    const c = inputShaped();
    c.form.valueType = 'boolean';
    rejects(c, ['form', 'valueType'], "form.valueType 'boolean' needs a boolean value prop, but 'value' is type 'string'");
    c.form.value = 'required';
    accepts(c);
  });

  test('a list or range value type needs a union, array or object value prop', () => {
    const c = inputShaped();
    for (const valueType of ['string[]', 'date-range', 'number-range']) {
      c.form.valueType = valueType;
      c.form.value = 'value';
      rejects(c, ['form', 'valueType'], `form.valueType '${valueType}' needs a union, array or object value prop, but 'value' is type 'string'`);
      c.form.value = 'tags';
      accepts(c);
    }
  });

  test("validation 'required' needs a required prop", () => {
    const c = inputShaped();
    delete c.props.required;
    rejects(c, ['form', 'validation', 0], "form.validation has 'required' but props has no 'required'");
  });

  test('every message names a copy key', () => {
    const c = inputShaped();
    c.form.messages.pattern = 'formatMessage';
    rejects(c, ['form', 'messages', 'pattern'], "form.messages.pattern names 'formatMessage', which is not a copy key");
  });

  test('the block is strict and its enums are closed', () => {
    const c = inputShaped();
    c.form.valueType = 'email';
    expect(issues(c).map((i) => i.path)).toEqual([['form', 'valueType']]);
  });
});

describe('the overlay block', () => {
  test('a Popover-shaped layer parses every field of the block', () => {
    const parsed = componentDef.parse(popoverShaped());
    expect(parsed.overlay).toEqual(POPOVER_OVERLAY);
    expect(Object.keys(parsed.overlay ?? {}).sort()).toEqual(Object.keys(overlayDef.shape).sort());
  });

  test('an unanchored layer needs only its layer', () => {
    const c = component();
    c.overlay = { layer: 'toast' };
    accepts(c);
  });

  test('anchor is an anatomy part', () => {
    const c = popoverShaped();
    c.overlay.anchor = 'button';
    rejects(c, ['overlay', 'anchor'], "overlay.anchor 'button' is not in anatomy ['trigger', 'popup']");
  });

  test('placement is an enum prop', () => {
    const c = popoverShaped();
    c.overlay.placement = 'label';
    rejects(c, ['overlay', 'placement'], "overlay.placement 'label' is not an enum prop");
  });

  test('collision needs anchor', () => {
    const c = popoverShaped();
    delete c.overlay.anchor;
    rejects(c, ['overlay', 'collision'], "overlay.collision 'flip-shift' needs 'anchor'");
  });

  test('open is a boolean prop', () => {
    const c = popoverShaped();
    c.overlay.open = 'placement';
    rejects(c, ['overlay', 'open'], "overlay.open 'placement' is not a boolean prop");
  });

  test('closeEvent is an event', () => {
    const c = popoverShaped();
    c.overlay.closeEvent = 'onClose';
    rejects(c, ['overlay', 'closeEvent'], "overlay.closeEvent 'onClose' is not an event of this component");
  });

  test("dismiss 'escape' needs escape-dismiss", () => {
    const c = popoverShaped();
    c.a11y.requires = c.a11y.requires.filter((r: string) => r !== 'escape-dismiss');
    rejects(c, ['overlay', 'dismiss', 0], "overlay.dismiss has 'escape' but a11y.requires lacks 'escape-dismiss'");
  });

  test('modal needs every MODAL_REQUIRES entry', () => {
    const c = popoverShaped();
    c.overlay.modal = true;
    rejects(c, ['overlay', 'modal'], "overlay.modal is true but a11y.requires lacks 'focus-trap', 'focus-restore', 'inert-background'");
    c.a11y.requires.push(...MODAL_REQUIRES.filter((r) => !c.a11y.requires.includes(r)));
    accepts(c);
  });
});

describe('componentWarnings for the form and overlay blocks', () => {
  const OVERLAY_WARNING = { path: 'category', message: "is 'overlay' but there is no overlay block, so layer, anchor, collision and dismissal live only in prose" };
  const FORM_WARNING = { path: 'props', message: "has 'name' and 'error' but there is no form block, so how the field joins a Form lives only in prose" };

  test('an overlay with no overlay block warns, and one with the block does not', () => {
    expect(componentWarnings(componentDef.parse(popoverShaped()))).not.toContainEqual(OVERLAY_WARNING);
    const c = popoverShaped();
    delete c.overlay;
    expect(componentWarnings(componentDef.parse(c))).toContainEqual(OVERLAY_WARNING);
  });

  test('a component with name and error props and no form block warns, and one with the block does not', () => {
    expect(componentWarnings(componentDef.parse(inputShaped()))).not.toContainEqual(FORM_WARNING);
    const c = inputShaped();
    delete c.form;
    expect(componentWarnings(componentDef.parse(c))).toContainEqual(FORM_WARNING);
    delete c.props.error;
    expect(componentWarnings(componentDef.parse(c))).not.toContainEqual(FORM_WARNING);
  });
});

/** The fixture with the given copy. */
function withCopy(copy: Dict): Dict {
  const c = component();
  c.copy = copy;
  return c;
}

const COUNT_PARAM = { count: { type: 'number', description: 'How many results.' } };
const RESULT_COUNT = { plural: { by: 'count', one: '{count} result', other: '{count} results' }, params: COUNT_PARAM, description: 'Announced as the list filters.' };
const SORTED_BY = { text: '{label} sorted by {column}', params: { column: { type: 'string', description: 'The column header text.' } } };

describe('typed copy', () => {
  test('a string, a text entry with params and a plural entry with params are accepted', () => {
    const c = withCopy({ required: '{label} is required.', sortedBy: SORTED_BY, resultCount: RESULT_COUNT });
    accepts(c);
    const parsed = componentDef.parse(c);
    expect(parsed.copy?.resultCount).toEqual(RESULT_COUNT);
    expect(extensionDef.safeParse({ extends: 'Widget', name: 'x', copy: { resultCount: RESULT_COUNT } }).success).toBe(true);
  });

  test('copyText and copyPlaceholders read every form', () => {
    expect(copyText('{label} is required.')).toBe('{label} is required.');
    expect(copyText({ text: 'Sorted' })).toBe('Sorted');
    expect(copyText({ plural: { by: 'count', one: 'One result', other: '{count} results' } })).toBe('{count} results');
    expect(copyPlaceholders('{label} {label} is {state}')).toEqual(['label', 'state']);
    expect(copyPlaceholders({ plural: { by: 'n', zero: 'None in {list}', one: '{n} in {list}', other: '{n} in {list}' } })).toEqual(['list', 'n']);
    expect(copyPlaceholders({ text: '{label} sorted by {column}' })).toEqual(['label', 'column']);
  });

  test('an entry with both text and plural is rejected', () => {
    const c = withCopy({ both: { text: 'Results', plural: { by: 'count', other: '{count} results' }, params: COUNT_PARAM } });
    expect(issues(c)).toEqual([{ path: ['copy', 'both'], message: "copy.both needs exactly one of 'text' and 'plural'" }]);
  });

  test('an entry with neither text nor plural is rejected', () => {
    const c = withCopy({ neither: { description: 'Nothing to say.' } });
    expect(issues(c)).toEqual([{ path: ['copy', 'neither'], message: "copy.neither needs exactly one of 'text' and 'plural'" }]);
  });

  test('plural.by must name a number param', () => {
    const c = withCopy({ byColumn: { plural: { by: 'column', other: 'Sorted by {column}' }, params: { column: { type: 'string' } } } });
    expect(issues(c)).toEqual([{ path: ['copy', 'byColumn', 'plural', 'by'], message: "copy.byColumn.plural.by names 'column', which is not a number param" }]);
  });

  test('every placeholder is a declared param or a prop', () => {
    const c = withCopy({ sortedBy: { text: '{label} sorted by {column}' } });
    expect(issues(c)).toEqual([{ path: ['copy', 'sortedBy', 'text'], message: "copy.sortedBy uses '{column}', which is not a declared param or a prop" }]);
    const plural = withCopy({ resultCount: { ...RESULT_COUNT, plural: { by: 'count', one: '{count} result', other: '{count} results in {list}' } } });
    expect(issues(plural)).toEqual([{ path: ['copy', 'resultCount', 'plural', 'other'], message: "copy.resultCount uses '{list}', which is not a declared param or a prop" }]);
  });

  test('every declared param is used', () => {
    const c = withCopy({ sortedBy: { text: 'Sorted', params: { column: { type: 'string' } } } });
    expect(issues(c)).toEqual([{ path: ['copy', 'sortedBy', 'params', 'column'], message: 'copy.sortedBy.params.column is declared but no placeholder or plural.by uses it' }]);
    // plural.by is a use: the count picks the form even when no form prints it.
    accepts(withCopy({ items: { plural: { by: 'count', one: 'One item', other: 'Several items' }, params: COUNT_PARAM } }));
  });
});

describe('componentWarnings for copy', () => {
  const copyWarnings = (c: Dict): { path: string; message: string }[] =>
    componentWarnings(componentDef.parse(c)).filter((w) => w.path.startsWith('copy.') || w.message.endsWith('which is not a copy key'));

  test("a string entry's placeholder that names no prop warns; a prop placeholder and the object form do not", () => {
    const c = withCopy({ required: '{label} is required.', sortedBy: 'Sorted by {column}, then {column}', typed: SORTED_BY });
    expect(copyWarnings(c)).toEqual([
      { path: 'copy.sortedBy', message: "'{column}' names no prop, so nothing declares what it holds; use the object form and declare it in params" },
    ]);
  });

  test('a copy.<key> reference that names no copy key warns, on the field that makes it', () => {
    const c = withCopy({ required: '{label} is required.' });
    c.platforms.web.notes = 'Render copy.required under the field and announce copy.loading while it saves.';
    c.props.label.description = 'Visible text; copy.required reads it.';
    expect(copyWarnings(c)).toEqual([{ path: 'platforms.web.notes', message: 'names copy.loading, which is not a copy key' }]);
  });
});

describe('copy in generated/components.json', () => {
  const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as ComponentDef);

  test('componentWarnings reports exactly the 16 copy.<key> references that name no key', () => {
    const found = generated.flatMap((c) =>
      componentWarnings(c).flatMap((w) => {
        const m = /^names copy\.([a-zA-Z0-9]+), which is not a copy key$/.exec(w.message);
        return m === null ? [] : [`${c.name}.${m[1] as string}`];
      }),
    );
    expect(found).toEqual([
      'Breadcrumb.navLabel', 'Breadcrumb.current', 'Button.loading', 'Checkbox.checked', 'Checkbox.unchecked', 'Checkbox.mixed',
      'Combobox.activeOption', 'Disclosure.expanded', 'Disclosure.collapsed', 'Form.invalidSummary', 'Link.external', 'Listbox.invalid',
      'RadioGroup.position', 'SidePanel.expanded', 'Table.cellLabel', 'Tabs.position',
    ]);
  });

  test('every string placeholder that names no prop warns: 65, across 42 component/placeholder pairs in 15 components', () => {
    const found = generated.flatMap((c) => componentWarnings(c).filter((w) => w.path.startsWith('copy.')).map((w) => ({ component: c.name, ...w })));
    expect(found).toHaveLength(65);
    expect(new Set(found.map((w) => `${w.component}.${/'\{(\w+)\}'/.exec(w.message)?.[1]}`)).size).toBe(42);
    expect(new Set(found.map((w) => w.component)).size).toBe(15);
    expect(found).toContainEqual({ component: 'DataGrid', path: 'copy.sortedAnnouncement', message: "'{direction}' names no prop, so nothing declares what it holds; use the object form and declare it in params" });
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

describe('shared vocabularies and integer props', () => {
  const withProp = (prop: Dict): Dict => {
    const c = component();
    c.props.extra = { description: 'x', ...prop };
    return c;
  };
  const SIZES = pyRepr(VOCAB.size);

  test('enumRef: size passes without values, and with values that narrow it', () => {
    accepts(withProp({ type: 'enum', enumRef: 'size' }));
    accepts(withProp({ type: 'enum', enumRef: 'size', default: '4xl' }));
    accepts(withProp({ type: 'enum', enumRef: 'size', values: ['sm', 'md'], default: 'md' }));
  });

  test('enumRef on a string prop', () => {
    rejects(withProp({ type: 'string', enumRef: 'size' }), ['props', 'extra', 'enumRef'], "enumRef needs an enum prop, got 'string'");
  });

  test('a value outside the vocabulary', () => {
    rejects(withProp({ type: 'enum', enumRef: 'size', values: ['sm', 'huge'] }), ['props', 'extra', 'values', 1], `value 'huge' is not one of VOCAB.size ${SIZES}`);
  });

  test('an enumRef default is read from the vocabulary', () => {
    rejects(withProp({ type: 'enum', enumRef: 'size', default: 'huge' }), ['props', 'extra', 'default'], `default 'huge' is not one of ${SIZES}`);
  });

  test('a non-integer default on an integer prop', () => {
    accepts(withProp({ type: 'integer', default: 3 }));
    rejects(withProp({ type: 'integer', default: 1.5 }), ['props', 'extra', 'default'], "an integer prop's default must be an integer, got 1.5");
    rejects(withProp({ type: 'integer', default: '3' }), ['props', 'extra', 'default'], "an integer prop's default must be an integer, got '3'");
  });

  test('a non-integer given value for an integer prop', () => {
    const c = withBehavior({ name: 'renders-per-view', given: { perView: 1.5 }, then: [{ renders: true }] });
    c.props.perView = { type: 'integer', description: 'Slides in view.' };
    rejects(c, ['behavior', 0, 'given', 'perView'], "scenario 'renders-per-view' given.perView must be an integer, got 1.5");
    c.behavior[0].given.perView = 2;
    accepts(c);
  });
});

describe('componentWarnings for vocabulary subsets', () => {
  const vocabWarnings = (size: Dict): { path: string; message: string }[] => {
    const c = component();
    c.props.size = { description: 'Padding scale.', ...size };
    c.styles.paddingInline.token = 'space.md'; // space.{size} would need a token for every value
    return componentWarnings(componentDef.parse(c)).filter((w) => w.path.startsWith('props.'));
  };

  test('values [sm, md] with no enumRef warn', () => {
    expect(vocabWarnings({ type: 'enum', values: ['sm', 'md'] })).toEqual([{ path: 'props.size.values', message: 'values are a subset of VOCAB.size; set enumRef: size' }]);
  });

  test('the same prop with enumRef: size does not warn', () => {
    expect(vocabWarnings({ type: 'enum', enumRef: 'size', values: ['sm', 'md'] })).toEqual([]);
  });

  test('values [sm, huge] belong to no vocabulary and do not warn', () => {
    expect(vocabWarnings({ type: 'enum', values: ['sm', 'huge'] })).toEqual([]);
  });

  test('generated/components.json has 19 enum props whose values are a subset of a vocabulary', () => {
    const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as ComponentDef);
    const warned = generated.flatMap((c) => componentWarnings(c).filter((w) => w.message.startsWith('values are a subset of VOCAB.')));
    expect(warned).toHaveLength(19);
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

describe('token existence against schema/tokens.ts', () => {
  test('a misspelled literal binding token', () => {
    const c = component();
    c.styles.radius = { token: 'radius.mdd' };
    rejects(c, ['styles', 'radius', 'token'], "Widget: styles.radius 'radius.mdd' is not a token");
  });

  test('a misspelled contrast token, on each field', () => {
    const c = component();
    c.a11y.contrast = [
      { foreground: 'color.foregroud.strong', background: 'color.background', level: 'AA' },
      { foreground: 'color.foreground', background: 'color.backgroud', level: 'AA' },
      { foreground: 'color.action.ghost.foreground', background: 'color.action.ghost.background', surface: 'color.overlay.surfase', level: 'AA' },
    ];
    rejects(c, ['a11y', 'contrast', 0, 'foreground'], "Widget: a11y.contrast[0].foreground 'color.foregroud.strong' is not a token");
    rejects(c, ['a11y', 'contrast', 1, 'background'], "Widget: a11y.contrast[1].background 'color.backgroud' is not a token");
    rejects(c, ['a11y', 'contrast', 2, 'surface'], "Widget: a11y.contrast[2].surface 'color.overlay.surfase' is not a token");
  });

  test('an interpolated contrast token is checked after expand, over only', () => {
    const c = component();
    c.props.variant.values = ['primary', 'danger', 'accent'];
    rejects(c, ['a11y', 'contrast', 0, 'foreground'], "Widget: a11y.contrast[0].foreground 'color.action.accent.foreground' is not a token");
    const narrowed = component();
    narrowed.props.variant.values = ['primary', 'danger', 'accent'];
    narrowed.styles.background = { token: 'color.action.primary.background' };
    narrowed.a11y.contrast[0].only = { variant: ['primary', 'danger'] };
    accepts(narrowed);
  });

  test('an interpolated value with no token', () => {
    const c = component();
    delete c.props.size.enumRef;
    c.props.size.values = ['sm', 'huge'];
    c.props.size.default = 'sm';
    c.styles.paddingInline.token = 'space.md';
    c.styles.fontSize = { token: 'font.size.{size}' };
    rejects(c, ['styles', 'fontSize', 'token'], "Widget: styles.fontSize 'font.size.{size}' → 'font.size.huge' is not a token");
  });

  test.each([...NO_TOKEN_VALUES].sort())("'%s' on an interpolated padding needs no token", (value) => {
    const c = component();
    c.props.inset = { type: 'enum', values: [value, 'sm', 'md'], default: 'sm', description: 'Padding.' };
    c.styles.padding = { token: 'space.{inset}' };
    accepts(c);
  });

  test('a full path and a trailing default segment both pass', () => {
    const c = component();
    c.props.surface = { type: 'enum', values: ['default', 'subtle'], default: 'default', description: 'Surface.' };
    c.styles.surface = { token: 'color.background.{surface}' };
    c.styles.text = { token: 'color.foreground.default' };
    accepts(c);
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

/** The fixture with a Lit platform, an `open` prop and the given keyboard rules. */
function withKeyboard(...rules: Dict[]): Dict {
  const c = component();
  c.platforms.lit = { tag: 'ds-widget' };
  c.events.onPress.platforms.lit = 'press';
  c.props.open = { type: 'boolean', description: 'Shows the label.' };
  c.a11y.requires.push('keyboard-operable');
  c.keyboard = rules;
  return c;
}

const TAB = { keys: ['Tab'], action: 'Moves to the next control.', expect: 'focus-next' };
const CLOSE = { keys: ['Enter'], action: 'Closes the label.', expect: 'closes' };

describe('contrast pair kinds', () => {
  /** The fixture plus a second pair on a non-text token. */
  function withPair(pair: Dict): Dict {
    const c = component();
    c.a11y.contrast.push({ foreground: 'color.border.strong', background: 'color.background', ...pair });
    return c;
  }

  test('a pair without the new fields parses to the same keys as before', () => {
    expect(Object.keys(componentDef.parse(component()).a11y.contrast?.[0] ?? {})).toEqual(['foreground', 'background', 'level', 'large']);
  });

  test('a pair can use nonText, state, surface and only together', () => {
    const c = component();
    c.a11y.contrast[0] = { ...c.a11y.contrast[0], nonText: true, state: 'hover', surface: 'color.overlay.surface', only: { variant: ['danger'] } };
    accepts(c);
  });

  test('nonText with large: true is rejected', () => {
    rejects(withPair({ nonText: true, large: true }), ['a11y', 'contrast', 1, 'large'], "a nonText pair has no large-text threshold; remove 'large'");
  });

  test('nonText at level AAA is rejected', () => {
    const c = withPair({ nonText: true, level: 'AAA' });
    c.a11y.requires.push('contrast-aaa');
    rejects(c, ['a11y', 'contrast', 1, 'level'], 'WCAG 1.4.11 has no AAA level; a nonText pair is checked at 3:1 — use level AA');
  });

  test('disabled is not a contrast state', () => {
    expect(issues(withPair({ nonText: true, state: 'disabled' })).map((i) => i.path)).toEqual([['a11y', 'contrast', 1, 'state']]);
  });

  test('an only key that is not a slot of the pair is rejected', () => {
    const c = component();
    c.a11y.contrast[0].only = { size: ['sm'] };
    rejects(c, ['a11y', 'contrast', 0, 'only', 'size'], "a11y.contrast.0.only has 'size', which is not a {slot} in its foreground or background");
  });

  test('an only key on a slot that is not an enum prop is rejected', () => {
    rejects(withPair({ foreground: 'color.{label}.icon', only: { label: ['x'] } }), ['a11y', 'contrast', 1, 'only', 'label'], "a11y.contrast.1.only 'label' is not an enum prop");
  });

  test("an only value that is not one of the prop's values is rejected", () => {
    const c = component();
    c.a11y.contrast[0].only = { variant: ['primary', 'ghost'] };
    rejects(c, ['a11y', 'contrast', 0, 'only', 'variant', 1], "a11y.contrast.0.only.variant has 'ghost', which is not one of ['primary', 'danger']");
  });
});

describe('componentWarnings for large non-text pairs', () => {
  const contrastWarnings = (pair: Dict): { path: string; message: string }[] => {
    const c = component();
    c.a11y.contrast.push({ background: 'color.background', ...pair });
    return componentWarnings(componentDef.parse(c)).filter((w) => w.path.startsWith('a11y.contrast.'));
  };

  test('large: true on color.border.strong warns', () => {
    expect(contrastWarnings({ foreground: 'color.border.strong', large: true })).toEqual([
      { path: 'a11y.contrast.1.large', message: 'large: true on a non-text pair (color.border.strong); WCAG 1.4.11 pairs set nonText: true' },
    ]);
  });

  test('the same pair with nonText: true and no large does not warn', () => {
    expect(contrastWarnings({ foreground: 'color.border.strong', nonText: true })).toEqual([]);
  });

  test('a large: true text pair does not warn', () => {
    expect(contrastWarnings({ foreground: 'color.foreground', large: true })).toEqual([]);
  });

  test('generated/components.json has 45 large non-text pairs; the BottomSheet handle matches no non-text family', () => {
    const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as ComponentDef);
    const warned = generated.flatMap((c) => componentWarnings(c).filter((w) => w.message.startsWith('large: true on a non-text pair')));
    expect(warned).toHaveLength(45);
    const large = generated.flatMap((c) => (c.a11y.contrast ?? []).filter((pair) => pair.large).map((pair) => `${c.name} ${pair.foreground}`));
    expect(large).toHaveLength(46);
    expect(large).toContain('BottomSheet color.foreground.muted');
  });
});

describe('keyboard rule fields for the gate', () => {
  test('a rule using given, target, repeat, platforms, native and an expect list parses, and keeps each field', () => {
    const c = withKeyboard(
      { keys: ['Enter'], action: 'Closes the label and returns focus.', expect: ['closes', 'focus-trigger'], given: { open: true, variant: 'danger', label: 'Two words' }, target: 'label', platforms: ['web', 'lit'], native: false },
      { ...TAB, repeat: 3, native: true },
    );
    accepts(c);
    const rules = componentDef.parse(c).keyboard ?? [];
    expect(rules[0]).toEqual({ keys: ['Enter'], action: 'Closes the label and returns focus.', from: 'inside', expect: ['closes', 'focus-trigger'], given: { open: true, variant: 'danger', label: 'Two words' }, target: 'label', platforms: ['web', 'lit'], native: false });
    expect(rules[1]).toMatchObject({ repeat: 3, native: true });
  });

  test('the old form gains no keys: no new field is defaulted', () => {
    expect(componentDef.parse(withKeyboard({ keys: ['Tab'], action: 'Moves.' })).keyboard).toEqual([{ keys: ['Tab'], action: 'Moves.', from: 'inside', expect: 'manual' }]);
  });

  test('extension rules take the same fields', () => {
    const rule = { keys: ['Enter'], action: 'x', expect: ['closes', 'focus-trigger'], given: { open: true }, target: 'label', repeat: 1, platforms: ['web'], native: true };
    expect(extensionDef.safeParse({ extends: 'Widget', name: 'x', keyboard: [rule] }).success).toBe(true);
  });

  test('expectList reads either form, and KEYBOARD_EXPECTS names every outcome', () => {
    expect(expectList({ expect: 'closes' })).toEqual(['closes']);
    expect(expectList({ expect: ['closes', 'focus-trigger'] })).toEqual(['closes', 'focus-trigger']);
    expect(expectList({})).toEqual(['manual']);
    expect(KEYBOARD_EXPECTS).toContain('manual');
    expect(KEYBOARD_EXPECTS).toContain('focus-wraps-to-last');
  });

  test('an expect list has two or more outcomes and no manual', () => {
    expect(issues(withKeyboard({ ...TAB, expect: ['focus-next'] })).map((i) => i.path)).toEqual([['keyboard', 0, 'expect']]);
    expect(issues(withKeyboard({ ...TAB, expect: ['focus-next', 'manual'] })).map((i) => i.path)).toEqual([['keyboard', 0, 'expect']]);
  });

  test('given names a prop', () => {
    rejects(withKeyboard({ ...TAB, given: { colour: 'red' } }), ['keyboard', 0, 'given', 'colour'], "keyboard rule 0 given: unknown prop 'colour'");
  });

  test('a given value fits its prop type', () => {
    rejects(withKeyboard({ ...TAB, given: { open: 'yes' } }), ['keyboard', 0, 'given', 'open'], "keyboard rule 0 given.open must be a boolean, got 'yes'");
    rejects(withKeyboard({ ...TAB, given: { variant: 'tertiary' } }), ['keyboard', 0, 'given', 'variant'], "keyboard rule 0 given.variant: 'tertiary' is not one of ['primary', 'danger']");
  });

  test('a given value can travel in a Storybook URL', () => {
    rejects(withKeyboard({ ...TAB, given: { label: 'a;b' } }), ['keyboard', 0, 'given', 'label'], "keyboard rule 0 given.label must be a boolean, a number, or a string of letters, digits, spaces, _ and - (it travels in a Storybook URL), got 'a;b'");
  });

  test('target is an anatomy part', () => {
    rejects(withKeyboard({ ...CLOSE, target: 'thumb' }), ['keyboard', 0, 'target'], "keyboard rule 0 target: unknown anatomy part 'thumb'");
  });

  test('target needs closes or opens', () => {
    accepts(withKeyboard({ ...TAB, expect: ['opens', 'focus-next'], target: 'label' }));
    rejects(withKeyboard({ ...TAB, target: 'label' }), ['keyboard', 0, 'target'], "keyboard rule 0 target 'label' needs closes or opens in expect, got ['focus-next']");
  });

  test('platforms are declared platforms', () => {
    rejects(withKeyboard({ ...TAB, platforms: ['web', 'swiftui'] }), ['keyboard', 0, 'platforms', 1], "keyboard rule 0 platforms includes 'swiftui', which the component does not declare");
  });

  test('an expect list has no duplicates', () => {
    rejects(withKeyboard({ ...TAB, expect: ['focus-next', 'focus-next'] }), ['keyboard', 0, 'expect', 1], "keyboard rule 0 expect lists 'focus-next' twice");
  });

  test('an expect list does not both close and open', () => {
    rejects(withKeyboard({ ...CLOSE, expect: ['closes', 'opens'] }), ['keyboard', 0, 'expect'], "keyboard rule 0 expect has both 'closes' and 'opens'");
  });

  test('repeat above 1 needs focus-next or focus-prev', () => {
    accepts(withKeyboard({ ...CLOSE, repeat: 1 }));
    rejects(withKeyboard({ ...CLOSE, repeat: 2 }), ['keyboard', 0, 'repeat'], "keyboard rule 0 repeat 2 needs focus-next or focus-prev in expect, got ['closes']");
  });

  test('componentWarnings flags a closes rule with no target on a combobox, and not one with a target', () => {
    const c = withKeyboard({ ...CLOSE, keys: ['Tab'] }, { ...CLOSE, keys: ['Enter'], expect: ['focus-trigger', 'closes'], target: 'label' }, TAB);
    c.a11y.role = 'combobox';
    const parsed = componentDef.parse(c);
    expect(componentWarnings(parsed).filter((w) => w.path.startsWith('keyboard.'))).toEqual([
      { path: 'keyboard.0.expect', message: "'closes' has no target, so the keyboard gate asserts on the combobox root, which stays visible; name the part that closes in target" },
    ]);
    c.a11y.role = 'dialog';
    expect(componentWarnings(componentDef.parse(c)).filter((w) => w.path.startsWith('keyboard.'))).toEqual([]);
  });
});

/** The fixture on web, rn and lit using every narrowing form: a comfortable target only on rn, a danger variant not
 *  offered on rn, a dismiss string and a target binding narrowed apart, and a Lit reflect list in all three spellings. */
function narrowing(): Dict {
  const c = component();
  c.platforms.lit = { tag: 'ds-widget', reflect: ['variant', 'size', { prop: 'dismissible', attribute: 'no-dismiss' }] };
  c.events.onPress.platforms.lit = 'press';
  c.props.dismissible = { type: 'boolean', default: true, description: 'Shows a dismiss button.' };
  c.props.variant.valuesOn = { danger: ['web', 'lit'] };
  c.a11y.requires.push('target-44px');
  c.a11y.requiresOn = { 'target-44px': ['rn'] };
  c.copy = { close: 'Close', dismiss: { text: 'Dismiss', platforms: ['web', 'lit'] } };
  c.styles.minTarget = { token: 'size.target.comfortable', platforms: ['rn'], locked: true };
  return c;
}

/** The warnings the reflect and slot rules report. */
const reflectWarningsOf = (c: Dict): { path: string; message: string }[] =>
  componentWarnings(componentDef.parse(c)).filter((w) => w.path.startsWith('platforms.') || w.path.startsWith('styles.'));

describe('per-platform narrowing and typed reflect', () => {
  test('requiresOn, valuesOn, a narrowed copy entry, a narrowed binding and an object reflect entry are accepted', () => {
    const c = narrowing();
    accepts(c);
    const parsed = componentDef.parse(c);
    expect(parsed.a11y.requiresOn).toEqual({ 'target-44px': ['rn'] });
    expect(parsed.props.variant?.valuesOn).toEqual({ danger: ['web', 'lit'] });
    expect(parsed.copy?.dismiss).toEqual({ text: 'Dismiss', platforms: ['web', 'lit'] });
    expect(parsed.styles.minTarget?.platforms).toEqual(['rn']);
    expect(parsed.platforms.lit?.reflect).toEqual(['variant', 'size', { prop: 'dismissible', attribute: 'no-dismiss' }]);
    expect(reflectWarningsOf(c)).toEqual([]);
    expect(A11Y_REQUIREMENTS).toContain('target-44px');
  });

  test('narrowForPlatform drops what is narrowed away, keeps the narrowing keys, and leaves the input alone', () => {
    const parsed = componentDef.parse(narrowing());
    const before = structuredClone(parsed);
    const rn = narrowForPlatform(parsed, 'rn');
    expect(rn.a11y.requires).toContain('target-44px');
    expect(rn.props.variant?.values).toEqual(['primary']);
    expect(Object.keys(rn.copy ?? {})).toEqual(['close']);
    expect(Object.keys(rn.styles)).toContain('minTarget');
    const web = narrowForPlatform(parsed, 'web');
    expect(web.a11y.requires).not.toContain('target-44px');
    expect(web.props.variant?.values).toEqual(['primary', 'danger']);
    expect(Object.keys(web.copy ?? {})).toEqual(['close', 'dismiss']);
    expect(Object.keys(web.styles)).not.toContain('minTarget');
    expect(web.a11y.requiresOn).toEqual({ 'target-44px': ['rn'] });
    expect(web.props.variant?.valuesOn).toEqual({ danger: ['web', 'lit'] });
    expect(parsed).toEqual(before);
  });

  test('a narrowed binding locks exactly as it would unnarrowed: lockRule reads tokens, never platforms', () => {
    const binding = { token: 'size.target.comfortable', platforms: ['rn'] as const };
    const { platforms: _, ...unnarrowed } = binding;
    expect(lockRule('minTarget', bindingTokens(binding), [])).toBe("LOCKED_TOKENS has 'size.target.*'");
    expect(lockRule('minTarget', bindingTokens(binding), [])).toBe(lockRule('minTarget', bindingTokens(unnarrowed), []));
    const focus = { token: 'color.border.focus', platforms: ['web'] as const };
    expect(lockRule('outline', bindingTokens(focus), [])).toBe(lockRule('outline', bindingTokens({ token: focus.token }), []));
  });

  test('a requiresOn key must be in requires', () => {
    const c = narrowing();
    c.a11y.requiresOn['scroll-lock'] = ['web'];
    expect(issues(c)).toEqual([{ path: ['a11y', 'requiresOn', 'scroll-lock'], message: "a11y.requiresOn has 'scroll-lock', which a11y.requires does not list" }]);
  });

  test('a requiresOn list stays within the declared platforms', () => {
    const c = narrowing();
    c.a11y.requiresOn['target-44px'] = ['rn', 'swiftui'];
    expect(issues(c)).toEqual([{ path: ['a11y', 'requiresOn', 'target-44px', 1], message: "a11y.requiresOn.target-44px includes 'swiftui', which the component does not declare" }]);
  });

  test('valuesOn is only on an enum prop', () => {
    const c = narrowing();
    c.props.label.valuesOn = { Save: ['web'] };
    expect(issues(c)).toEqual([{ path: ['props', 'label', 'valuesOn'], message: "props.label.valuesOn needs an enum prop, got 'string'" }]);
  });

  test("a valuesOn key must be one of the prop's values", () => {
    const c = narrowing();
    c.props.variant.valuesOn.warning = ['web'];
    expect(issues(c)).toEqual([{ path: ['props', 'variant', 'valuesOn', 'warning'], message: "props.variant.valuesOn has 'warning', which is not one of ['primary', 'danger']" }]);
  });

  test("a valuesOn list stays within the declared platforms, and within the prop's own platforms", () => {
    const c = narrowing();
    c.props.variant.valuesOn.danger = ['web', 'swiftui'];
    expect(issues(c)).toEqual([{ path: ['props', 'variant', 'valuesOn', 'danger', 1], message: "props.variant.valuesOn.danger includes 'swiftui', which the component does not declare" }]);
    const narrowProp = narrowing();
    narrowProp.props.variant.platforms = ['web', 'lit'];
    narrowProp.props.variant.valuesOn.danger = ['web', 'rn'];
    expect(issues(narrowProp)).toEqual([{ path: ['props', 'variant', 'valuesOn', 'danger', 1], message: "props.variant.valuesOn.danger includes 'rn', which props.variant.platforms ['web', 'lit'] does not" }]);
  });

  test("a copy entry's platforms stay within the declared platforms", () => {
    const c = narrowing();
    c.copy.dismiss.platforms = ['swiftui'];
    expect(issues(c)).toEqual([{ path: ['copy', 'dismiss', 'platforms', 0], message: "copy.dismiss platforms includes 'swiftui', which the component does not declare" }]);
  });

  test('an object reflect entry names a prop', () => {
    const c = narrowing();
    c.platforms.lit.reflect[2] = { prop: 'quiet', attribute: 'quiet' };
    expect(issues(c)).toEqual([{ path: ['platforms', 'lit', 'reflect', 2, 'prop'], message: "platforms.lit.reflect.2.prop names 'quiet', which is not a prop" }]);
  });

  test('an object reflect entry for a boolean that defaults to true reflects a negated attribute', () => {
    const c = narrowing();
    c.platforms.lit.reflect[2] = { prop: 'dismissible', attribute: 'dismissible' };
    expect(issues(c)).toEqual([
      { path: ['platforms', 'lit', 'reflect', 2, 'attribute'], message: "platforms.lit.reflect.2 reflects 'dismissible' as 'dismissible', but 'dismissible' defaults to true, so its attribute is the negated form (prompts/conventions/lit.md)" },
    ]);
  });

  test('shape: an empty narrowing list, a camelCase attribute and a stray reflect key are rejected', () => {
    const empty = narrowing();
    empty.a11y.requiresOn['target-44px'] = [];
    expect(issues(empty).map((i) => i.path)).toEqual([['a11y', 'requiresOn', 'target-44px']]);
    const camel = narrowing();
    camel.platforms.lit.reflect[2] = { prop: 'dismissible', attribute: 'noDismiss' };
    expect(issues(camel).length).toBeGreaterThan(0);
    const stray = narrowing();
    stray.platforms.lit.reflect[2] = { prop: 'dismissible', attribute: 'no-dismiss', negated: true };
    expect(issues(stray).length).toBeGreaterThan(0);
    const emptyCopy = narrowing();
    emptyCopy.copy.dismiss.platforms = [];
    expect(issues(emptyCopy).length).toBeGreaterThan(0);
  });

  test('reflectEntry resolves an object as written, a prop name or its kebab-case as that prop, and anything else to null', () => {
    const c = { props: { headingLevel: {}, dismissible: {} } };
    expect(reflectEntry(c, { prop: 'dismissible', attribute: 'no-dismiss' })).toEqual({ prop: 'dismissible', attribute: 'no-dismiss' });
    expect(reflectEntry(c, 'headingLevel')).toEqual({ prop: 'headingLevel', attribute: 'heading-level' });
    expect(reflectEntry(c, 'heading-level')).toEqual({ prop: 'headingLevel', attribute: 'heading-level' });
    expect(reflectEntry(c, 'no-dismiss')).toBeNull();
  });
});

describe('componentWarnings for reflect lists', () => {
  test('a string entry for a boolean that defaults to true warns un-negated', () => {
    const c = narrowing();
    c.platforms.lit.reflect[2] = 'dismissible';
    expect(reflectWarningsOf(c)).toEqual([
      { path: 'platforms.lit.reflect.2', message: "reflects 'dismissible' un-negated, but 'dismissible' defaults to true (prompts/conventions/lit.md: reflect the negated attribute)" },
    ]);
  });

  test('a string entry that resolves to no prop warns', () => {
    const c = narrowing();
    c.platforms.lit.reflect[2] = 'no-dismiss';
    expect(reflectWarningsOf(c)).toEqual([
      { path: 'platforms.lit.reflect.2', message: "reflects 'no-dismiss', which resolves to no prop; write { prop, attribute } to name the prop it reflects" },
    ]);
  });

  test("a token slot the Lit reflect list does not resolve warns, unless the binding is narrowed away from Lit or Lit is unsupported", () => {
    const c = narrowing();
    c.platforms.lit.reflect = ['variant', { prop: 'dismissible', attribute: 'no-dismiss' }];
    const SIZE = { path: 'styles.paddingInline.token', message: "interpolates '{size}', but platforms.lit.reflect does not resolve 'size', so the Lit element has no attribute to select the token by" };
    expect(reflectWarningsOf(c)).toEqual([SIZE]);
    c.styles.paddingInline.platforms = ['web', 'rn'];
    expect(reflectWarningsOf(c)).toEqual([]);
    const unsupported = narrowing();
    unsupported.platforms.lit = { supported: false };
    expect(reflectWarningsOf(unsupported)).toEqual([]);
  });
});

describe('narrowing and reflect in generated/components.json', () => {
  const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as ComponentDef);
  const warned = (pattern: RegExp): string[] =>
    generated.flatMap((c) =>
      componentWarnings(c).flatMap((w) => {
        const m = pattern.exec(w.message);
        return m === null ? [] : [`${c.name}.${m[1] as string}`];
      }),
    );

  test('narrowForPlatform changes nothing today, on any component or declared platform, so no prompt changes', () => {
    for (const c of generated) {
      for (const platform of Object.keys(c.platforms)) expect(narrowForPlatform(c, platform)).toEqual(c);
    }
  });

  test('the un-negated reflect warning names exactly 11 props: the nine the plan found, plus BottomSheet dragToDismiss and Table stickyHeader', () => {
    expect(warned(/^reflects '[a-z-]+' un-negated, but '(\w+)' defaults to true/)).toEqual([
      'Accordion.divided', 'BottomSheet.dragToDismiss', 'Breadcrumb.collapse', 'Carousel.snap', 'FocusScope.trapped', 'FocusScope.active',
      'Search.landmark', 'SidePanel.dismissible', 'SidePanel.swipeable', 'Table.stickyHeader', 'Tooltip.describes',
    ]);
  });

  test('ten string reflect entries resolve to no prop', () => {
    expect(warned(/^reflects '([a-z-]+)', which resolves to no prop/)).toEqual([
      'BottomSheet.no-dismiss', 'DataGrid.no-status-bar', 'DataGrid.no-sticky-header', 'DatePicker.invalid', 'Dialog.no-dismiss',
      'NumberInput.show-steppers', 'Popover.no-dismiss', 'Tree.hide-guides', 'TreeGrid.no-status-bar', 'TreeGrid.no-sticky-header',
    ]);
  });

  test('three token slots have no reflected attribute on Lit', () => {
    expect(warned(/^interpolates '\{(\w+)\}', but platforms\.lit\.reflect/)).toEqual(['Input.size', 'NumberInput.size', 'Select.size']);
  });

  test('narrowing a binding to any one platform leaves its lockRule result unchanged', () => {
    for (const c of generated) {
      const pairs = (c.a11y.contrast ?? []).flatMap((pair) => [pair.foreground, pair.background]);
      for (const [bName, binding] of Object.entries(c.styles ?? {})) {
        const rule = lockRule(bName, bindingTokens(binding), pairs, c.props);
        for (const platform of Object.keys(c.platforms)) {
          const narrowed = { ...binding, platforms: [platform] };
          expect(lockRule(bName, bindingTokens(narrowed), pairs, c.props)).toBe(rule);
        }
      }
    }
  });
});

/** The fixture with a `tone` enum no binding reads and no vocabulary holds, and a `title` string prop. */
function lifecycleShaped(): Dict {
  const c = component();
  c.props.tone = { type: 'enum', values: ['alpha', 'beta', 'gamma'], description: 'A tone no binding reads.' };
  c.props.title = { type: 'string', description: 'A title.' };
  return c;
}

describe('lifecycle: since and deprecated', () => {
  test('a component, a prop, an event and a value each take since and deprecated', () => {
    const c = lifecycleShaped();
    Object.assign(c, { since: '0.1.0', status: 'deprecated', deprecated: { reason: 'Replaced.', since: '0.2.0', use: 'Button' } });
    c.props.label.since = '0.1.0';
    c.props.title.deprecated = { reason: 'Renamed.', since: '0.2.0', use: 'label' };
    c.events.onPress.since = '0.1.0';
    c.events.onActivate = { description: 'Activated.', platforms: { web: 'onActivate', rn: 'onActivate' }, deprecated: { reason: 'Renamed.', use: 'onPress' } };
    c.props.tone.valueLifecycle = { beta: { since: '0.2.0' }, alpha: { deprecated: { reason: 'Renamed.', use: 'beta' } } };
    accepts(c);
    const parsed = componentDef.parse(c);
    expect(parsed.deprecated).toEqual({ reason: 'Replaced.', since: '0.2.0', use: 'Button' });
    expect(parsed.props.tone?.valueLifecycle?.alpha).toEqual({ deprecated: { reason: 'Renamed.', use: 'beta' } });
  });

  test('the old form gains no keys', () => {
    const parsed = componentDef.parse(component());
    for (const key of ['since', 'deprecated', 'examples', 'constants']) expect(parsed).not.toHaveProperty(key);
    expect(parsed.props.label).not.toHaveProperty('valueLifecycle');
  });

  test('since is a package version', () => {
    const c = component();
    c.props.label.since = '1.0';
    rejects(c, ['props', 'label', 'since'], 'Expected a package version like 0.2.0');
  });

  test('valueLifecycle is only for enum props', () => {
    const c = lifecycleShaped();
    c.props.title.valueLifecycle = { alpha: { since: '0.1.0' } };
    rejects(c, ['props', 'title', 'valueLifecycle'], 'valueLifecycle is only for enum props');
  });

  test("a valueLifecycle key is one of the prop's values, including an enumRef's", () => {
    const ok = component();
    delete ok.props.size.values;
    ok.styles.paddingInline.token = 'space.md'; // space.{size} would need a token for every value
    ok.props.size.valueLifecycle = { [VOCAB.size.at(-1) as string]: { since: '0.2.0' } };
    accepts(ok);
    const c = lifecycleShaped();
    c.props.tone.valueLifecycle = { delta: { since: '0.1.0' } };
    rejects(c, ['props', 'tone', 'valueLifecycle', 'delta'], "valueLifecycle.delta is not one of ['alpha', 'beta', 'gamma']");
  });

  test("a value's use names another value of the prop", () => {
    const c = lifecycleShaped();
    c.props.tone.valueLifecycle = { alpha: { deprecated: { reason: 'x', use: 'delta' } }, beta: { deprecated: { reason: 'x', use: 'beta' } } };
    rejects(c, ['props', 'tone', 'valueLifecycle', 'alpha', 'deprecated', 'use'], "valueLifecycle.alpha.deprecated.use names 'delta', which is not another value of this prop");
    rejects(c, ['props', 'tone', 'valueLifecycle', 'beta', 'deprecated', 'use'], "valueLifecycle.beta.deprecated.use names 'beta', which is not another value of this prop");
  });

  test("a prop's or an event's use names another prop or event of the component", () => {
    const ok = lifecycleShaped();
    ok.props.title.deprecated = { reason: 'x', use: 'onPress' };
    accepts(ok);
    const c = lifecycleShaped();
    c.props.title.deprecated = { reason: 'x', use: 'heading' };
    c.events.onPress.deprecated = { reason: 'x', use: 'onPress' };
    rejects(c, ['props', 'title', 'deprecated', 'use'], "props.title.deprecated.use names 'heading', which is not another prop or event of this component");
    rejects(c, ['events', 'onPress', 'deprecated', 'use'], "events.onPress.deprecated.use names 'onPress', which is not another prop or event of this component");
  });

  test('a deprecated block needs status deprecated', () => {
    const c = component();
    c.deprecated = { reason: 'Replaced.' };
    rejects(c, ['deprecated'], "has a deprecated block but status is 'review'");
    c.status = 'deprecated';
    accepts(c);
  });
});

describe('componentWarnings for lifecycle', () => {
  const lifecycleWarnings = (c: Dict): { path: string; message: string }[] => componentWarnings(componentDef.parse(c)).filter((w) => w.message.includes('deprecated'));

  test('a default that is a deprecated value warns', () => {
    const c = component();
    c.props.variant.valueLifecycle = { danger: { deprecated: { reason: 'x' } } };
    expect(lifecycleWarnings(c)).toEqual([]);
    c.props.variant.valueLifecycle = { primary: { deprecated: { reason: 'x', use: 'danger' } } };
    expect(lifecycleWarnings(c)).toEqual([{ path: 'props.variant.default', message: "'primary' is a deprecated value" }]);
  });

  test('a deprecated prop that is still required warns', () => {
    const c = component();
    c.props.label.required = false;
    c.props.label.deprecated = { reason: 'x' };
    expect(lifecycleWarnings(c)).toEqual([]);
    c.props.label.required = true;
    expect(lifecycleWarnings(c)).toEqual([{ path: 'props.label.required', message: 'is required but deprecated, so a caller cannot stop passing it' }]);
  });

  test('status deprecated with no deprecated block warns', () => {
    const c = component();
    c.status = 'deprecated';
    expect(lifecycleWarnings(c)).toEqual([{ path: 'status', message: "is 'deprecated' but there is no deprecated block, so nothing says why or what replaces it" }]);
    c.deprecated = { reason: 'Replaced.' };
    expect(lifecycleWarnings(c)).toEqual([]);
  });

  test('a use that names something itself deprecated warns, for a prop, an event and a value', () => {
    const c = lifecycleShaped();
    c.props.heading = { type: 'string', description: 'x', deprecated: { reason: 'x', use: 'title' } };
    c.events.onActivate = { description: 'x', platforms: { web: 'onActivate', rn: 'onActivate' }, deprecated: { reason: 'x', use: 'onPress' } };
    c.props.tone.valueLifecycle = { alpha: { deprecated: { reason: 'x', use: 'beta' } } };
    expect(lifecycleWarnings(c)).toEqual([]);
    c.props.title.deprecated = { reason: 'x' };
    c.events.onPress.deprecated = { reason: 'x' };
    c.props.tone.valueLifecycle.beta = { deprecated: { reason: 'x' } };
    expect(lifecycleWarnings(c)).toEqual([
      { path: 'props.tone.valueLifecycle.alpha.deprecated.use', message: "names 'beta', which is itself deprecated" },
      { path: 'props.heading.deprecated.use', message: "names 'title', which is itself deprecated" },
      { path: 'events.onActivate.deprecated.use', message: "names 'onPress', which is itself deprecated" },
    ]);
  });

  test("an authored scenario's given that sets a deprecated prop or value warns", () => {
    const c = withBehavior({ ...CLICK, given: { title: 'Old', tone: 'alpha' } });
    Object.assign(c.props, lifecycleShaped().props);
    expect(lifecycleWarnings(c)).toEqual([]);
    c.props.title.deprecated = { reason: 'x' };
    c.props.tone.valueLifecycle = { alpha: { deprecated: { reason: 'x' } } };
    expect(lifecycleWarnings(c)).toEqual([
      { path: 'behavior.0.given.title', message: "scenario 'click-fires' sets 'title', which is deprecated" },
      { path: 'behavior.0.given.tone', message: "scenario 'click-fires' sets 'tone' to 'alpha', which is a deprecated value" },
    ]);
  });

  test("an example's given that sets a deprecated prop or value warns", () => {
    const c = lifecycleShaped();
    c.examples = [{ name: 'old-look', description: 'The old look.', given: { title: 'Old', tone: 'alpha' } }];
    expect(lifecycleWarnings(c)).toEqual([]);
    c.props.title.deprecated = { reason: 'x' };
    c.props.tone.valueLifecycle = { alpha: { deprecated: { reason: 'x' } } };
    expect(lifecycleWarnings(c)).toEqual([
      { path: 'examples.0.given.title', message: "example 'old-look' sets 'title', which is deprecated" },
      { path: 'examples.0.given.tone', message: "example 'old-look' sets 'tone' to 'alpha', which is a deprecated value" },
    ]);
  });

  test('generated/components.json has no lifecycle warning, because no doc uses the fields yet', () => {
    const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as ComponentDef);
    expect(generated.flatMap((c) => componentWarnings(c).filter((w) => w.message.includes('deprecated')))).toEqual([]);
  });
});

describe('examples', () => {
  const DANGER = { name: 'danger-save', description: 'A destructive save.', given: { label: 'Delete', variant: 'danger' } };
  const withExamples = (...examples: Dict[]): Dict => {
    const c = component();
    c.examples = examples;
    return c;
  };

  test('an example with a name, description, given and platforms is accepted and kept', () => {
    const c = withExamples({ ...DANGER, platforms: ['web'] }, { name: 'plain', description: 'The defaults.', given: {} });
    accepts(c);
    expect(componentDef.parse(c).examples).toEqual(c.examples);
  });

  test('examples is non-empty and each example is strict', () => {
    rejects(withExamples(), ['examples'], 'Too small: expected array to have >=1 items');
    expect(issues(withExamples({ ...DANGER, when: { click: 'container' } })).map((i) => i.path)).toEqual([['examples', 0]]);
    expect(issues(withExamples({ ...DANGER, name: 'Danger Save' })).map((i) => i.path)).toEqual([['examples', 0, 'name']]);
  });

  test('example names are unique', () => {
    rejects(withExamples(DANGER, DANGER), ['examples', 1, 'name'], "duplicate example 'danger-save'");
  });

  test('example platforms are declared platforms', () => {
    rejects(withExamples({ ...DANGER, platforms: ['web', 'swiftui'] }), ['examples', 0, 'platforms', 1], "example 'danger-save' platforms includes 'swiftui', which the component does not declare");
  });

  test("given names a prop and fits its type, in the scenario's words", () => {
    rejects(withExamples({ ...DANGER, given: { colour: 'red' } }), ['examples', 0, 'given', 'colour'], "example 'danger-save' given: unknown prop 'colour'");
    rejects(withExamples({ ...DANGER, given: { variant: 'tertiary' } }), ['examples', 0, 'given', 'variant'], "example 'danger-save' given.variant: 'tertiary' is not one of ['primary', 'danger']");
    rejects(withExamples({ ...DANGER, given: { label: 3 } }), ['examples', 0, 'given', 'label'], "example 'danger-save' given.label must be a string, got 3");
  });
});

describe('constants', () => {
  const OPEN_DELAY = { description: 'How long a hover waits before opening.', token: 'motion.duration.base', multiply: 3, unit: 'ms' };
  const withConstants = (constants: Dict): Dict => {
    const c = component();
    c.constants = constants;
    return c;
  };

  test('a token constant and a value constant are accepted and kept', () => {
    const c = withConstants({ openDelay: OPEN_DELAY, dismissVelocity: { description: 'Swipe speed that dismisses.', value: 1.5, unit: 'px/ms' } });
    accepts(c);
    expect(componentDef.parse(c).constants).toEqual(c.constants);
  });

  test("a constant needs exactly one of 'token' and 'value'", () => {
    rejects(withConstants({ openDelay: { ...OPEN_DELAY, multiply: undefined, value: 600 } }), ['constants', 'openDelay'], "a constant needs exactly one of 'token' and 'value'");
    rejects(withConstants({ openDelay: { description: 'x', unit: 'ms' } }), ['constants', 'openDelay'], "a constant needs exactly one of 'token' and 'value'");
  });

  test('multiply is only with token', () => {
    rejects(withConstants({ openDelay: { description: 'x', value: 200, multiply: 3, unit: 'ms' } }), ['constants', 'openDelay', 'multiply'], "multiply needs 'token'");
  });

  test('a constant may not share a name with a styles binding', () => {
    rejects(withConstants({ radius: OPEN_DELAY }), ['constants', 'radius'], 'constants.radius collides with styles.radius');
  });

  test('a token constant names a real token', () => {
    rejects(withConstants({ openDelay: { ...OPEN_DELAY, token: 'motion.duration.bsae' } }), ['constants', 'openDelay', 'token'], "Widget: constants.openDelay 'motion.duration.bsae' is not a token");
  });

  test('names are camelCase, multiply is positive and the unit is closed', () => {
    expect(issues(withConstants({ 'open-delay': OPEN_DELAY })).map((i) => i.path)).toEqual([['constants', 'open-delay']]);
    expect(issues(withConstants({ openDelay: { ...OPEN_DELAY, multiply: 0 } })).map((i) => i.path)).toEqual([['constants', 'openDelay', 'multiply']]);
    expect(issues(withConstants({ openDelay: { ...OPEN_DELAY, unit: 's' } })).map((i) => i.path)).toEqual([['constants', 'openDelay', 'unit']]);
  });
});
