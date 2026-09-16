/** Composition entries (job 612): the object form's checks in componentDef and in tools/parse.ts `validate`,
 *  `compositionTarget`, the target and keyboard requirements through an object entry, and the prose-forward warning. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { componentDef, compositionTarget } from '../../schema/component.ts';
import { readText } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { component, expectDocError, fmText, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();

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

/** The fixture component (Widget) with one more anatomy part, composed as `entry`. */
function composing(entry: unknown, part = 'select'): Dict {
  const c = component();
  c.anatomy.push(part);
  c.composition = { [part]: entry };
  return c;
}

const check = (c: Dict): void => parse.validate({ component: c }, join(tmp(), 'widget.md'));

/** A Select-like child with no fontWeight: one prop of each type, a free binding, and a binding locked each way (by
 *  its contrast pair, its token, its name, and by hand). */
const SELECT: Dict = {
  name: 'Select',
  category: 'input',
  anatomy: ['trigger', 'popup'],
  props: {
    size: { type: 'enum', values: ['sm', 'md'], default: 'md', description: 'Size.' },
    placeholder: { type: 'string', description: 'Placeholder.' },
    disabled: { type: 'boolean', default: false, description: 'Disabled.' },
    count: { type: 'number', description: 'Visible rows.' },
    options: { type: 'array', shape: '{ value: string }[]', description: 'Options.' },
    children: { type: 'content', description: 'Trigger content.' },
    value: { type: 'union', shape: 'string | string[]', description: 'Selected ids.' },
  },
  styles: {
    fontSize: { token: 'font.size.{size}' },
    triggerRadius: { token: 'radius.md' },
    popupSurface: { token: 'color.overlay.surface' },
    focusRingWidth: { token: 'border.width.focus' },
    minTarget: { token: 'space.md' },
    pinned: { token: 'radius.sm', locked: true },
  },
  a11y: { role: 'combobox', requires: ['keyboard-operable', 'target-24px'], contrast: [{ foreground: 'color.foreground', background: 'color.overlay.surface' }] },
  platforms: { web: { element: 'button' } },
};

/** A temp docs folder with the Select-like child and a Text that declares nothing. */
function childDocs(): void {
  const d = join(tmp(), 'components');
  write(join(d, 'select.md'), '---\n' + fmText(SELECT) + '---\n');
  write(join(d, 'text.md'), '---\n' + fmText({ name: 'Text', a11y: { role: 'none', requires: [] } }) + '---\n');
  parse.paths.DOCS = d;
}

describe('the field', () => {
  test('the string form and the object form are both valid', () => {
    accepts(composing('Select'));
    accepts(composing({ component: 'Select' }));
    accepts(composing({ component: 'Gadget (planned)', props: { size: 'sm', open: true, count: 2, placeholder: { from: 'label' } }, forwards: { radius: 'triggerRadius' } }));
  });

  test('the object form is strict, and a prop value is a literal or { from }', () => {
    expect(issues(composing({ component: 'Select', slot: 'x' }))).not.toEqual([]);
    expect(issues(composing({ component: 'Select', props: { size: ['sm'] } }))).not.toEqual([]);
    expect(issues(composing({ component: 'Select', props: { size: { from: 'size', to: 'x' } } }))).not.toEqual([]);
    expect(issues(composing({ props: {} }))).not.toEqual([]);
  });

  test('an object entry still composes, for the target rule', () => {
    const c = composing({ component: 'Select' });
    c.a11y.requires.push('target-24px');
    accepts(c);
  });
});

describe('componentDef checks', () => {
  test('a { from } names a prop of this component', () => {
    accepts(composing({ component: 'Select', props: { placeholder: { from: 'label' } } }));
    rejects(composing({ component: 'Select', props: { placeholder: { from: 'title' } } }), ['composition', 'select', 'props', 'placeholder', 'from'], "composition.select.props.placeholder.from names 'title', which is not a prop of this component");
  });

  test('a forwards key is a styles binding of this component', () => {
    accepts(composing({ component: 'Select', forwards: { radius: 'triggerRadius' } }));
    rejects(composing({ component: 'Select', forwards: { cornerRadius: 'triggerRadius' } }), ['composition', 'select', 'forwards', 'cornerRadius'], 'composition.select.forwards.cornerRadius is not a styles binding of this component');
  });

  test('the string form is not read for either', () => {
    accepts(composing('Select'));
  });
});

describe('validate: the object form against the child doc', () => {
  beforeEach(childDocs);

  test('the anatomy and missing-doc messages are unchanged for the object form', () => {
    const c = component();
    c.composition = { nope: { component: 'Select' } };
    expectDocError(() => check(c), 'composition.nope is not in anatomy');
    expectDocError(() => check(composing({ component: 'Gadget' })), "widget.md: composition.select names 'Gadget', which has no doc (mark it '(planned)')");
    check(composing({ component: 'Gadget (planned)' }));
  });

  test('every props key is a child prop', () => {
    check(composing({ component: 'Select', props: { size: 'sm' } }));
    expectDocError(() => check(composing({ component: 'Select', props: { tone: 'danger' } })), "widget.md: composition.select.props.tone: Select has no prop 'tone'");
  });

  test("a literal fits the child prop's type", () => {
    check(composing({ component: 'Select', props: { placeholder: 'Pick one', disabled: true, count: 5, children: 'Month', value: 'jan' } }));
    expectDocError(() => check(composing({ component: 'Select', props: { disabled: 'yes' } })), "widget.md: composition.select.props.disabled: Select.disabled is type 'boolean', which the literal 'yes' does not fit");
    expectDocError(() => check(composing({ component: 'Select', props: { count: '5' } })), "composition.select.props.count: Select.count is type 'number', which the literal '5' does not fit");
    expectDocError(() => check(composing({ component: 'Select', props: { options: 'jan' } })), "composition.select.props.options: Select.options is type 'array', which the literal 'jan' does not fit");
  });

  test("a literal is one of the child enum's values", () => {
    check(composing({ component: 'Select', props: { size: 'md' } }));
    expectDocError(() => check(composing({ component: 'Select', props: { size: 'lg' } })), "widget.md: composition.select.props.size: 'lg' is not one of Select.size values ['sm', 'md']");
  });

  test("a { from } prop has the child prop's type", () => {
    check(composing({ component: 'Select', props: { placeholder: { from: 'label' } } }));
    expectDocError(() => check(composing({ component: 'Select', props: { disabled: { from: 'label' } } })), "widget.md: composition.select.props.disabled: Widget.label is type 'string', not Select.disabled's 'boolean'");
  });

  test("a { from } enum's values are within the child's", () => {
    check(composing({ component: 'Select', props: { size: { from: 'size' } } }));
    const c = composing({ component: 'Select', props: { size: { from: 'size' } } });
    c.props.size.values = ['sm', 'md', 'lg'];
    expectDocError(() => check(c), "widget.md: composition.select.props.size: Widget.size values ['lg'] are not among Select.size values ['sm', 'md']");
    expectDocError(() => check(composing({ component: 'Select', props: { size: { from: 'variant' } } })), "Widget.variant values ['primary', 'danger'] are not among Select.size values ['sm', 'md']");
  });

  test('every forwards target is a child styles binding', () => {
    check(composing({ component: 'Select', forwards: { radius: 'triggerRadius', paddingInline: 'fontSize' } }));
    expectDocError(() => check(composing({ component: 'Select', forwards: { radius: 'cornerRadius' } })), "widget.md: composition.select.forwards.radius: Select has no styles binding 'cornerRadius'");
  });

  test.each([
    ['popupSurface', 'its token is in a contrast pair'],
    ['focusRingWidth', 'its token is a focus token'],
    ['minTarget', 'its name is locked'],
    ['pinned', 'it sets locked: true'],
  ])('a forward into %s is rejected, because %s', (target) => {
    expectDocError(() => check(composing({ component: 'Select', forwards: { background: target } })), `widget.md: composition.select.forwards.background: Select.${target} is locked, so no override reaches it`);
  });

  test("DatePicker's monthSelect forwarding monthTitleWeight into a Select without fontWeight fails", () => {
    const c = composing({ component: 'Select', forwards: { monthTitleWeight: 'fontWeight' } }, 'monthSelect');
    c.styles.monthTitleWeight = { token: 'font.weight.semibold', description: 'Forwarded to the Selects as `overrides.fontWeight`.' };
    expectDocError(() => check(c), "widget.md: composition.monthSelect.forwards.monthTitleWeight: Select has no styles binding 'fontWeight'");
  });

  test('a planned child skips every check that reads it', () => {
    check(composing({ component: 'Select (planned)', props: { tone: 'danger', size: 'xl' }, forwards: { radius: 'pinned', background: 'nothing' } }));
    check(composing({ component: 'Gadget (planned)', props: { tone: { from: 'label' } }, forwards: { radius: 'nothing' } }));
  });
});

describe('validate: against the real docs', () => {
  beforeEach(() => {
  });

  test("a DatePicker-like entry parses against the real Select and fails into Popover's locked surface", () => {
    const c = composing({ component: 'Select', props: { size: { from: 'size' }, disabled: false }, forwards: { monthTitleSize: 'fontSize' } }, 'monthSelect');
    c.styles.monthTitleSize = { token: 'font.size.md' };
    check(c);
    const locked = composing({ component: 'Popover', forwards: { calendarSurface: 'surface' } }, 'popover');
    locked.styles.calendarSurface = { token: 'color.overlay.surface' };
    expectDocError(() => check(locked), 'widget.md: composition.popover.forwards.calendarSurface: Popover.surface is locked, so no override reaches it');
  });
});

describe('requirements met through an object entry', () => {
  beforeEach(childDocs);

  test('a target requirement is met by a composed object entry that declares one', () => {
    const c = component();
    c.a11y.requires.push('target-44px');
    c.composition = { label: { component: 'Select', forwards: { radius: 'triggerRadius' } } };
    check(c);
    c.composition = { label: { component: 'Text' } };
    expectDocError(() => check(c), 'no composed component declares a target requirement');
  });

  test('keyboard-operable is met by a composed object entry that declares it', () => {
    const c = component();
    c.a11y.role = 'group';
    c.a11y.requires.push('keyboard-operable');
    c.composition = { label: { component: 'Select' } };
    check(c);
    c.composition = { label: { component: 'Text' } };
    expectDocError(() => check(c), "no composed component declares 'keyboard-operable'");
  });
});

describe('the prose-forward warning', () => {
  beforeEach(childDocs);

  /** Widget composing the Select-like child as `monthSelect`, with one more binding described by `description`. */
  function prose(bName: string, description: string, entry: unknown = 'Select'): Dict {
    const c = composing(entry, 'monthSelect');
    c.styles[bName] = { token: 'font.weight.semibold', description };
    return c;
  }

  const file = (): string => parse.docPath(join(tmp(), 'widget.md'));

  test('a forward into a binding the child does not have warns', () => {
    check(prose('monthTitleWeight', 'Forwarded to the Selects as `overrides.fontWeight`.'));
    expect(parse.takeWarnings()).toEqual([{ file: file(), message: "styles.monthTitleWeight: forwarded to Select as overrides.fontWeight, but Select has no 'fontWeight' binding" }]);
  });

  test('a forward into a binding the child locks warns', () => {
    check(prose('calendarSurface', "Realized by the composed Select's popup; forwarded as its `overrides.popupSurface`.", { component: 'Select' }));
    expect(parse.takeWarnings()).toEqual([{ file: file(), message: 'styles.calendarSurface: forwarded to Select as overrides.popupSurface, but Select.popupSurface is locked, so no override reaches it' }]);
  });

  test('no warning for a free child binding, the binding itself, an unnamed child or a planned child', () => {
    check(prose('monthTitleSize', 'Forwarded to the Selects as `overrides.fontSize`.'));
    check(prose('fontWeight', 'An `overrides.fontWeight` on the Select is this binding.'));
    check(prose('monthTitleWeight', 'Forwarded as `overrides.fontWeight`.'));
    check(prose('monthTitleWeight', 'Forwarded to the Gadget as `overrides.fontWeight`.', 'Gadget (planned)'));
    expect(parse.takeWarnings()).toEqual([]);
  });

  test('over the real docs it finds DatePicker.monthTitleWeight and DatePicker.calendarSurface', () => {
    const docs = parse.paths.DOCS = join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'components');
    for (const name of readdirSync(docs).filter((n) => n.endsWith('.md'))) {
      const f = join(docs, name);
      const [fm] = parse.splitFrontmatter(readText(f), f);
      parse.validate(fm, f);
    }
    expect(parse.takeWarnings()).toEqual([
      { file: 'site/src/content/docs/components/datepicker.md', message: 'styles.calendarSurface: forwarded to Popover as overrides.surface, but Popover.surface is locked, so no override reaches it' },
      { file: 'site/src/content/docs/components/datepicker.md', message: "styles.monthTitleWeight: forwarded to Select as overrides.fontWeight, but Select has no 'fontWeight' binding" },
    ]);
  });
});

describe('compositionTarget', () => {
  test('a string and an object give the same target, with the planned suffix split off', () => {
    expect(compositionTarget('Button')).toEqual({ component: 'Button', planned: false });
    expect(compositionTarget({ component: 'Button' })).toEqual({ component: 'Button', planned: false });
    expect(compositionTarget('Toast (planned)')).toEqual({ component: 'Toast', planned: true });
    expect(compositionTarget({ component: 'Toast (planned)' })).toEqual({ component: 'Toast', planned: true });
  });

  test('every composition value in generated/components.json comes back unchanged', () => {
    const entries = JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[];
    const composed = entries.filter((e) => e.component.composition !== undefined);
    expect(composed).toHaveLength(33);
    for (const e of composed) {
      for (const value of Object.values(e.component.composition as Dict)) {
        expect(typeof value).toBe('string');
        expect(compositionTarget(value as string)).toEqual({ component: value, planned: false });
      }
    }
  });
});
