/** tools/parse.ts — the cross-field checks: composition, keyboard, locked bindings, interpolation targets
 *  (port of tests/test_parse_checks.py). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { VOCAB } from '../../schema/vocab.ts';
import { dump } from '../lib/pyyaml.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { SIZE_NAMES } from '../theme.ts';
import { BODY, component, expectDocError, fmText, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();

const check = (c: parse.Dict): void => parse.validate({ component: c }, join(tmp(), 'widget.md'));

describe('shared vocabularies', () => {
  test('an enumRef prop parses, derives one render per vocabulary value, and its generated entry carries the values', () => {
    const root = tmp();
    const templates = join(root, 'templates');
    write(join(templates, 'web.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'rn.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'theme.md'), '{{NAME}}');
    const c = component();
    c.props.size = { type: 'enum', enumRef: 'size', default: 'md', description: 'Type scale.' };
    c.styles.fontSize = { token: 'font.size.{size}' };
    c.styles.paddingInline.token = 'space.md'; // space.{size} has no token for most of VOCAB.size
    write(join(root, 'components', 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    Object.assign(parse.paths, {
      ROOT: root, DOCS: join(root, 'components'), THEME_DOCS: join(root, 'themes'), OUT: join(root, 'generated'), TEMPLATES: templates,
      EXT_DOCS: join(root, 'extensions'), PATTERN_DOCS: join(root, 'patterns'),
    });

    expect(parse.main()).toBe(0);
    const entry = (JSON.parse(readFileSync(join(root, 'generated', 'components.json'), 'utf8')) as parse.Dict[])[0] as parse.Dict;
    expect(entry.component.props.size.values).toEqual([...VOCAB.size]);
    const renders = (entry.behaviorDerived as parse.Dict[]).filter((sc) => sc.name.startsWith('renders-size-'));
    expect(renders.map((sc) => sc.given.size)).toEqual([...VOCAB.size]);
  });

  test('VOCAB.size is the theme scale, SIZE_NAMES', () => {
    expect([...VOCAB.size]).toEqual(SIZE_NAMES);
  });

  test('every VOCAB.foregroundTone value is a color.foreground token in the built light theme', () => {
    const light = JSON.parse(readFileSync(join(REPO_ROOT, 'tokens', 'themes', 'calm-precise', 'light.json'), 'utf8')) as parse.Dict;
    for (const tone of VOCAB.foregroundTone) expect(light.color.foreground[tone]?.$value, `color.foreground.${tone}`).toBeDefined();
  });
});

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

describe('requirements met through a composed component', () => {
  /** The halves of the target and keyboard-operable rules that read another doc: the schema accepts a composition
   *  entry, and the parser then needs one composed component to declare the requirement itself. */
  const doc = (requires: string[]): string => '---\n' + fmText({ a11y: { role: 'button', requires } }) + '---\n';

  beforeEach(() => {
    const d = join(tmp(), 'components');
    write(join(d, 'button.md'), doc(['keyboard-operable', 'target-24px']));
    write(join(d, 'text.md'), doc([]));
    parse.paths.DOCS = d;
  });

  test('a target requirement is met by a composed component that declares one', () => {
    const c = component();
    c.a11y.requires.push('target-44px');
    c.composition = { label: 'Button' };
    check(c);
  });

  test('a target requirement with no composed target is an error', () => {
    const c = component();
    c.a11y.requires.push('target-24px');
    c.composition = { label: 'Text' };
    expectDocError(() => check(c), "widget.md: a11y.requires has 'target-24px' but no styles binding is on a size.target.* token and no composed component declares a target requirement");
  });

  test('a planned component cannot meet a requirement', () => {
    const c = component();
    c.a11y.requires.push('target-24px');
    c.composition = { label: 'Gadget (planned)' };
    expectDocError(() => check(c), 'no composed component declares a target requirement');
  });

  test('keyboard-operable is met by a composed component that declares it', () => {
    const c = component();
    c.a11y.role = 'group';
    c.a11y.requires.push('keyboard-operable');
    c.composition = { label: 'Button' };
    check(c);
  });

  test('keyboard-operable with no operable composed component is an error', () => {
    const c = component();
    c.a11y.role = 'group';
    c.a11y.requires.push('keyboard-operable');
    c.composition = { label: 'Text' };
    expectDocError(() => check(c), "widget.md: a11y.requires has 'keyboard-operable' but there is no keyboard block, a11y.role 'group' is not a natively focusable widget role, and no composed component declares 'keyboard-operable'");
  });
});

describe('keyboard', () => {
  const RULE = { keys: ['Home'], action: 'Moves to the first item.', expect: 'focus-first' };
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

  test('keyboard operable is reported alongside escape', () => {
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

  test('a literal binding matches a pair written with a slot', () => {
    // The pair says color.action.{variant}.background and variant's enum includes primary.
    const c = component();
    c.styles.primaryOnly = { token: 'color.action.primary.background' };
    check(c);
    expect(c.styles.primaryOnly.locked).toBe(true);
  });

  test('a slot binding matches a literal pair over the enum values', () => {
    const c = component();
    c.a11y.contrast = [{ foreground: 'color.action.danger.foreground', background: 'color.action.danger.background', level: 'AA' }];
    check(c);
    expect(c.styles.background.locked).toBe(true);
  });

  test('a literal outside the enum values stays overridable', () => {
    const c = component();
    c.styles.ghostOnly = { token: 'color.action.ghost.background' };
    check(c);
    expect(c.styles.ghostOnly.locked).toBe(false);
  });

  test.each(['color.border.focus', 'color.inverse.focus', 'border.width.focus', 'size.target.min', 'size.target.comfortable'])('a binding on %s locks under any name', (token) => {
    const c = component();
    c.styles.fieldBorderFocus = { token };
    check(c);
    expect(c.styles.fieldBorderFocus.locked).toBe(true);
  });

  test('a locked token behind interpolation locks', () => {
    const c = component();
    c.props.emphasis = { type: 'enum', values: ['thin', 'focus'], default: 'thin', description: 'Border weight.' };
    c.styles.borderWidth = { token: 'border.width.{emphasis}' };
    check(c);
    expect(c.styles.borderWidth.locked).toBe(true);
  });

  test('an explicit false on a focus token binding is an error', () => {
    const c = component();
    c.styles.borderFocus = { token: 'color.border.focus', locked: false };
    expectDocError(() => check(c), "styles.borderFocus sets locked: false, but 'color.border.focus' must be locked (LOCKED_TOKENS has 'color.border.focus')");
  });

  test('an explicit false on a named focus ring is an error', () => {
    const c = component();
    c.styles.focusRingWidth = { token: 'space.1', locked: false };
    expectDocError(() => check(c), "must be locked (LOCKED_BINDING_NAMES has 'focusRing*')");
  });

  test('an explicit false on an overridable binding is kept', () => {
    const c = component();
    c.styles.radius.locked = false;
    check(c);
    expect(c.styles.radius.locked).toBe(false);
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
    expectDocError(() => check(c), "styles.background sets locked: false, but 'color.action.{variant}.background' must be locked (a11y.contrast pairs 'color.action.{variant}.background')");
  });

  test('an extension adding a focus token binding fails', () => {
    const c = component();
    const ext = { file: 'extensions/Widget.glow.md', name: 'glow', extends: 'Widget', body: '', title: 'glow', extension: { extends: 'Widget', name: 'glow', styles: { glow: { token: 'color.border.focus' } } } };
    const added = parse.mergeExtensions(c, [ext]);
    check(c);
    expectDocError(() => parse.checkExtensionLocks(c, added), "extensions/Widget.glow.md: styles.glow binds 'color.border.focus', which is locked");
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

describe('token existence', () => {
  /** The checks live in componentDef against schema/tokens.ts (component-schema.test.ts has the fixtures); the parser
   *  reports them with no built tokens anywhere under its paths. */
  beforeEach(() => {
    const root = tmp();
    Object.assign(parse.paths, {
      ROOT: root, DOCS: join(root, 'components'), THEME_DOCS: join(root, 'themes'), OUT: join(root, 'generated'), TEMPLATES: join(root, 'templates'),
      EXT_DOCS: join(root, 'extensions'), PATTERN_DOCS: join(root, 'patterns'),
    });
  });

  test('a misspelled token is rejected when nothing has been built', () => {
    expect(existsSync(join(tmp(), 'packages', 'tokens', 'dist'))).toBe(false);
    const c = component();
    c.styles.radius.token = 'radius.mdd';
    expectDocError(() => check(c), "widget.md: frontmatter failed schema validation:\n  - component.styles.radius.token: Widget: styles.radius 'radius.mdd' is not a token");
  });

  test('an enum value with no token is named in the error', () => {
    const c = component();
    delete c.props.size.enumRef; // 'huge' is not in VOCAB.size
    c.props.size.values = ['sm', 'huge'];
    c.props.size.default = 'sm'; // the fixture's 'md' default is no longer one of the values
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

  test('two slots are checked as a product', () => {
    const c = component();
    c.props.tone = { type: 'enum', values: ['primary', 'danger'], description: 'x' };
    c.styles.bg = { token: 'color.action.{tone}.background' };
    check(c);
    c.props.tone.values.push('info');
    expectDocError(() => check(c), "'color.action.info.background' is not a token");
  });
});
