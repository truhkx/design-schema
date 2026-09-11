/** tools/parse.ts — the cross-field checks: composition, keyboard, locked bindings, interpolation targets
 *  (port of tests/test_parse_checks.py). */
import { join } from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { dump } from '../lib/pyyaml.ts';
import * as parse from '../parse.ts';
import { component, expectDocError, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();

const check = (c: parse.Dict): void => parse.validate({ component: c }, join(tmp(), 'widget.md'));

describe('composition', () => {
  /** A stand-in docs folder with a few real-looking component docs, for the composition check. */
  beforeEach(() => {
    const d = join(tmp(), 'components');
    for (const n of ['button', 'heading', 'text']) write(join(d, `${n}.md`), '---\n---\n');
    parse.paths.DOCS = d;
  });

  test('a part that names an existing doc passes', () => {
    const c = component();
    c.composition = { label: 'Text' };
    check(c);
  });

  test('the lookup is case insensitive on the file name', () => {
    const c = component();
    c.anatomy.push('closeButton');
    c.composition = { closeButton: 'Button' };
    check(c);
  });

  test('the part must be in anatomy', () => {
    const c = component();
    c.composition = { closeButton: 'Button' };
    expectDocError(() => check(c), 'composition.closeButton is not in anatomy');
  });

  test('a component with no doc is rejected', () => {
    const c = component();
    c.composition = { label: 'Gadget' };
    expectDocError(() => check(c), "names 'Gadget', which has no doc (mark it '(planned)')");
  });

  test('a planned component is allowed without a doc', () => {
    const c = component();
    c.composition = { label: 'Gadget (planned)' };
    check(c);
  });

  test('planned still needs the part in anatomy', () => {
    const c = component();
    c.composition = { icon: 'Icon (planned)' };
    expectDocError(() => check(c), 'is not in anatomy');
  });

  test('no composition block is fine', () => {
    const c = component();
    delete c.composition;
    check(c);
  });
});

describe('keyboard', () => {
  const RULE = { keys: ['ArrowDown'], action: 'Moves to the next item.', expect: 'focus-next' };
  const ESCAPE = { keys: ['Escape'], action: 'Closes.', expect: 'closes' };

  test('a keyboard block requires keyboard operable', () => {
    const c = component();
    c.keyboard = [RULE];
    expectDocError(() => check(c), "has a keyboard block but a11y.requires lacks 'keyboard-operable'");
  });

  test('a keyboard block passes once keyboard operable is declared', () => {
    const c = component();
    c.keyboard = [RULE];
    c.a11y.requires.push('keyboard-operable');
    check(c);
  });

  test('escape requires escape dismiss', () => {
    const c = component();
    c.keyboard = [ESCAPE];
    c.a11y.requires.push('keyboard-operable');
    expectDocError(() => check(c), "keyboard uses Escape but a11y.requires lacks 'escape-dismiss'");
  });

  test('escape passes once escape dismiss is declared', () => {
    const c = component();
    c.keyboard = [ESCAPE];
    c.a11y.requires.push('keyboard-operable', 'escape-dismiss');
    check(c);
  });

  test('escape anywhere in a multi key rule counts', () => {
    const c = component();
    c.keyboard = [{ keys: ['Enter', 'Escape'], action: 'Ends editing.' }];
    c.a11y.requires.push('keyboard-operable');
    expectDocError(() => check(c), 'escape-dismiss');
  });

  test('keyboard operable is checked before escape', () => {
    const c = component();
    c.keyboard = [ESCAPE];
    expectDocError(() => check(c), 'keyboard-operable');
  });

  test('an empty keyboard block needs nothing', () => {
    const c = component();
    c.keyboard = [];
    check(c);
  });

  test('an unknown expect is a schema error', () => {
    const c = component();
    c.keyboard = [{ ...RULE, expect: 'explodes' }];
    c.a11y.requires.push('keyboard-operable');
    expectDocError(() => check(c), 'failed schema validation');
  });
});

describe('locked bindings', () => {
  test('a binding whose token is in a contrast pair is locked', () => {
    // VALID_COMPONENT's contrast pair names color.action.{variant}.background, which `background` binds.
    const c = component();
    check(c);
    expect(c.styles.background.locked).toBe(true);
  });

  test('a binding outside every pair stays overridable', () => {
    const c = component();
    check(c);
    expect(c.styles.radius.locked).toBe(false);
    expect(c.styles.paddingInline.locked).toBe(false);
  });

  test('the foreground side of a pair locks too', () => {
    const c = component();
    c.styles.color = { token: 'color.action.{variant}.foreground' };
    check(c);
    expect(c.styles.color.locked).toBe(true);
  });

  test('the match is on the unexpanded token string', () => {
    // The pair says color.action.{variant}.background; a binding to one concrete step is a different token.
    const c = component();
    c.styles.primaryOnly = { token: 'color.action.primary.background' };
    check(c);
    expect(c.styles.primaryOnly.locked).toBe(false);
  });

  test.each(['focusRing', 'focusRingWidth', 'focusRingOffset', 'minTarget', 'dismissTarget'])('%s locks by name', (name) => {
    const c = component();
    c.styles[name] = { token: 'space.1' };
    check(c);
    expect(c.styles[name].locked).toBe(true);
  });

  test('an explicit lock is kept', () => {
    const c = component();
    c.styles.radius.locked = true;
    check(c);
    expect(c.styles.radius.locked).toBe(true);
  });

  test('an explicit false cannot unlock a contrast bearing binding', () => {
    const c = component();
    c.styles.background.locked = false;
    check(c);
    expect(c.styles.background.locked).toBe(true);
  });

  test('every binding ends up with a boolean locked flag', () => {
    const c = component();
    check(c);
    expect(Object.values(c.styles as parse.Dict).every((b) => typeof (b as parse.Dict).locked === 'boolean')).toBe(true);
  });

  test('no contrast pairs locks only the named bindings', () => {
    const c = component();
    delete c.a11y.contrast;
    c.styles.focusRing = { token: 'color.border.focus' };
    check(c);
    expect(c.styles.background.locked).toBe(false);
    expect(c.styles.focusRing.locked).toBe(true);
  });

  test('the prompt lists locked and overridable bindings separately', () => {
    const c = component();
    check(c);
    const templates = join(tmp(), 'templates');
    write(join(templates, 'web.md'), 'O={{OVERRIDABLE}}\nL={{LOCKED}}');
    parse.paths.TEMPLATES = templates;
    const out = parse.renderPrompt(c, { 'When to use': 'x', Accessibility: 'y' }, 'web', dump({ component: c }));
    expect(out).toContain('L=`background`');
    expect(out).toContain('O=`paddingInline`, `radius`');
  });
});

describe('interpolation targets', () => {
  /** Every value an interpolated binding can take must name a built token (a trailing `.default` dropped). */
  const NAMES = ['font.size.sm', 'font.size.md', 'font.size.lg', 'color.action.primary.background', 'color.action.danger.background',
    'color.background', 'color.background.subtle', 'space.sm', 'space.md', 'radius.md'];

  beforeEach(() => {
    parse.hooks.tokenNames = () => new Set(NAMES);
  });

  test('every enum value resolving passes', () => {
    const c = component();
    c.styles.fontSize = { token: 'font.size.{size}' }; // size: [sm, md]
    check(c);
  });

  test('an enum value with no token is named in the error', () => {
    const c = component();
    c.props.size.values = ['sm', 'huge'];
    c.styles.paddingInline.token = 'space.md'; // the fixture's own {size} binding would trip first
    c.styles.fontSize = { token: 'font.size.{size}' };
    let message = '';
    try {
      check(c);
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message.endsWith("Widget: styles.fontSize 'font.size.{size}' → 'font.size.huge' is not a token")).toBe(true);
  });

  test('a non enum interpolation target is an error', () => {
    const c = component();
    c.styles.fontSize = { token: 'font.size.{label}' };
    expectDocError(() => check(c), "'label' is not an enum prop");
  });

  test('a trailing default segment is dropped before the lookup', () => {
    const c = component();
    c.props.surface = { type: 'enum', values: ['default', 'subtle'], description: 'x' };
    c.styles.background = { token: 'color.background.{surface}' };
    check(c);
  });

  test.each([...parse.NO_TOKEN_VALUES].sort())('the no-op value %s needs no token', (value) => {
    const c = component();
    c.props.surface = { type: 'enum', values: ['subtle', value], description: 'x' };
    c.styles.background = { token: 'color.background.{surface}' };
    check(c);
  });

  test('two slots are checked as a product', () => {
    const c = component();
    c.props.tone = { type: 'enum', values: ['primary', 'danger'], description: 'x' };
    c.styles.bg = { token: 'color.action.{tone}.background' };
    check(c);
    c.props.tone.values.push('info');
    expectDocError(() => check(c), "'color.action.info.background' is not a token");
  });

  test('the check is skipped before tokens are built', () => {
    parse.hooks.tokenNames = () => null;
    const c = component();
    c.props.size.values = ['sm', 'huge'];
    c.styles.fontSize = { token: 'font.size.{size}' };
    check(c);
  });
});
