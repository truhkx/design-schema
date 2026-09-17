/**
 * tools/naming.ts — the naming-resolution step of job 521: what a brand's naming.md renames in the
 * generated output, what it must never touch, and the two properties the whole design rests on — an
 * absent naming.md is a true no-op, and the rename is exactly invertible, so the model and the gates
 * always work on canonical names.
 *
 * The job's own gate is the last describe: the committed `Button` output, renamed by a naming doc that
 * maps `Button: CtaButton` with namespace `acme` (and by job 520's Nimbus fixture, which maps the same
 * component under its own namespace), in a sandbox copy — the canonical docs are never written to.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { sourceDir } from '../../schema/platforms.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as naming from '../naming.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();
const savedPaths = { ...naming.paths };

let dir = '';

beforeEach(() => {
  dir = tmp();
  Object.assign(naming.paths, { ROOT: dir, THEMES: join(dir, 'themes'), COMPONENTS: join(dir, 'components.json') });
});

afterEach(() => {
  Object.assign(naming.paths, savedPaths);
});

/** A naming doc in the sandbox, as a brand under themes/. */
function doc(brand: string, frontmatter: string): string {
  return write(join(naming.paths.THEMES, brand, 'naming.md'), `---\ntitle: ${brand}\nnaming:\n${frontmatter}---\n\nProse.\n`);
}

/** The job 521 gate's doc: Button → CtaButton, namespace acme. */
const ACME = `  namespace:
    package: '@acme'
    cssPrefix: acme
    typePrefix:
      swiftui: Acme
      rn: Acme
  components:
    Button: CtaButton
  props:
    Button.leadingIcon: startIcon
`;

function acme(): naming.Resolution {
  doc('acme', ACME);
  return naming.resolve('acme');
}

/** `rewrite` with one file's name, for the platform under test. */
function rw(text: string, res: naming.Resolution, platform: string, file: string, direction: naming.Direction = 'brand'): string {
  return naming.rewrite(text, naming.vocab(res, platform, direction, ['Alert', 'AlertDialog', 'Card', 'Stack']), file);
}

describe('resolving a naming doc', () => {
  test('no doc at all is the unrenamed case, and a no-op', () => {
    const res = naming.resolve(null);
    expect(res.source).toBeNull();
    expect(res.components).toEqual({});
    expect(res.cssPrefix).toBe('ds');
    expect(res.package).toBe('@design-schema');
    expect(naming.isNoop(res)).toBe(true);
  });

  test('a brand under themes/, or a path to the doc', () => {
    const file = doc('acme', ACME);
    expect(naming.resolve('acme').source).toBe(file);
    expect(naming.resolve('themes/acme/naming.md').source).toBe(file);
    expect(naming.isNoop(naming.resolve('acme'))).toBe(false);
  });

  test('a ref that names no doc stops the run', () => {
    expect(() => naming.resolve('nope')).toThrow(naming.NamingError);
    expect(() => naming.resolve('nope')).toThrow('themes/nope/naming.md');
  });

  test('a doc that does not match schema/naming.ts stops the run, with the issues', () => {
    doc('bad', '  components:\n    Button: cta-button\n');
    expect(() => naming.resolve('bad')).toThrow(/naming.components.Button: Expected a PascalCase identifier/);
  });

  test('a name mapped to itself is not a rename', () => {
    doc('same', '  components:\n    Button: Button\n  props:\n    variant: variant\n');
    const res = naming.resolve('same');
    expect(res.components).toEqual({});
    expect(res.props).toEqual({});
    expect(naming.isNoop(res)).toBe(true);
  });

  test('a prefix on its own is a rename', () => {
    doc('prefix', "  namespace:\n    cssPrefix: acme\n");
    expect(naming.isNoop(naming.resolve('prefix'))).toBe(false);
  });

  test('a brand name that is already another component is refused', () => {
    writeFileSync(naming.paths.COMPONENTS, JSON.stringify([{ component: { name: 'Alert' } }, { component: { name: 'Card' } }]), 'utf8');
    doc('shadow', '  components:\n    Alert: Card\n');
    expect(() => naming.resolve('shadow')).toThrow(/Alert renames to Card, which is already a component/);
    // Renaming both is fine: the pair is still injective.
    doc('swap', '  components:\n    Alert: Card\n    Card: Panel\n');
    expect(naming.resolve('swap').components).toEqual({ Alert: 'Card', Card: 'Panel' });
  });

  test('a prop rename onto a platform prop is warned about, not refused', () => {
    doc('clash', '  props:\n    variant: style\n');
    const res = naming.resolve('clash');
    expect(naming.collisions(res, 'web')).toEqual(['variant → style collides with web\'s own `style` prop; the renamed output will not typecheck']);
    expect(naming.collisions(res, 'swiftui')).toEqual([]);
  });

  test("job 520's Nimbus fixture resolves against the committed schema", () => {
    Object.assign(naming.paths, savedPaths);
    const res = naming.resolve('nimbus');
    expect(res.components).toEqual({ Button: 'CtaButton', Disclosure: 'Expander', Alert: 'Callout' });
    expect(res.cssPrefix).toBe('nimbus');
    expect(res.typePrefix).toEqual({ swiftui: 'Nimbus', rn: 'Nimbus' });
    expect(res.events, "Button's onPress by exact name per platform; Alert's onDismiss by neutral name, which follows the convention on all three").toEqual({
      web: { Button: { onClick: 'onActivate' }, Alert: { onDismiss: 'onClose' } },
      lit: { Button: { press: 'activate' }, Alert: { dismiss: 'close' } },
      rn: { Button: { onPress: 'onActivate' }, Alert: { onDismiss: 'onClose' } },
    });
    expect(res.anatomy).toEqual({ Button: { trailingIcon: 'endIcon' } });
    expect(res.values, "the bare tone key reaches every tone with a danger, and Alert's dotted key merges with it").toEqual({
      Button: { variant: { danger: 'destructive' } },
      Alert: { tone: { danger: 'critical', info: 'notice' } },
      AlertDialog: { tone: { danger: 'critical' } },
      Meter: { tone: { danger: 'critical' } },
      ProgressBar: { tone: { danger: 'critical' } },
      Text: { tone: { danger: 'critical' } },
      Toast: { tone: { danger: 'critical' } },
    });
    for (const platform of ['web', 'lit', 'rn', 'swiftui']) expect(naming.notices(res, platform), platform).toEqual([]);
    expect(res.canonical, 'the canonical list comes from generated/components.json').toContain('Button');
    expect(naming.unknownKeys(res.naming, naming.canonicalIndex()), 'every key names something real').toEqual([]);
  });
});

/**
 * What an upstream pull can still do to a fork: strand a key. The map's key is always the canonical
 * name, so a component or prop that upstream renamed or removed leaves the doc pointing at nothing —
 * and the honest failure is loud (guides/updating-your-fork.md, "When a pull touches a name you renamed").
 */
describe('a key that no longer matches the canonical schema', () => {
  /** A components.json in the sandbox, in the shape tools/parse.ts writes. */
  function schema(entries: { name: string; props?: string[]; events?: string[]; anatomy?: string[] }[]): void {
    writeFileSync(
      naming.paths.COMPONENTS,
      JSON.stringify(
        entries.map((e) => ({
          component: {
            name: e.name,
            props: Object.fromEntries((e.props ?? []).map((p) => [p, {}])),
            events: Object.fromEntries((e.events ?? []).map((p) => [p, {}])),
            anatomy: e.anatomy ?? [],
          },
        })),
      ),
      'utf8',
    );
  }

  test('a component upstream renamed away', () => {
    schema([{ name: 'Accordion' }, { name: 'Button', props: ['variant'] }]);
    doc('stale', '  components:\n    Disclosure: Expander\n');
    expect(() => naming.resolve('stale')).toThrow(/components.Disclosure: no canonical component is called Disclosure/);
    expect(() => naming.resolve('stale')).toThrow(/A naming map's key is the canonical name/);
  });

  test('a prop upstream renamed away, scoped and global', () => {
    schema([{ name: 'Alert', props: ['tone'], anatomy: ['container'] }]);
    doc('scoped', '  props:\n    Alert.variant: severity\n');
    expect(() => naming.resolve('scoped')).toThrow(/props.Alert.variant: Alert has no prop, event or anatomy part called variant/);
    doc('global', '  props:\n    variant: style\n');
    expect(() => naming.resolve('global')).toThrow(/props.variant: no component has a prop, event or anatomy part called variant/);
    doc('scope-gone', '  props:\n    Disclosure.open: expanded\n');
    expect(() => naming.resolve('scope-gone')).toThrow(/props.Disclosure.open: no canonical component is called Disclosure/);
  });

  test('every stranded key is reported at once, not one per run', () => {
    schema([{ name: 'Alert', props: ['tone'] }]);
    doc('several', '  components:\n    Disclosure: Expander\n    Table: Grid\n  props:\n    variant: style\n');
    expect(() => naming.resolve('several')).toThrow(/3 key\(s\) name nothing in the canonical schema/);
  });

  test('a key that still matches is fine — props, events and anatomy all count', () => {
    schema([{ name: 'Button', props: ['label'], events: ['onPress'], anatomy: ['leadingIcon'] }]);
    doc('live', '  components:\n    Button: CtaButton\n  props:\n    label: text\n    onPress: onTap\n    Button.leadingIcon: startIcon\n');
    expect(naming.resolve('live').components).toEqual({ Button: 'CtaButton' });
  });

  test('no components.json means no check — a fork that has not run `pnpm parse` still resolves', () => {
    expect(existsSync(naming.paths.COMPONENTS)).toBe(false);
    doc('unparsed', '  components:\n    Disclosure: Expander\n');
    expect(naming.resolve('unparsed').components).toEqual({ Disclosure: 'Expander' });
  });
});

/**
 * Job 623: `events` renames what each platform emits and `anatomy` renames a part's own spellings. The
 * components.json below is a slice of the real one: Button's `onPress` breaks the convention on web
 * (`onClick`), Alert's `onDismiss` follows it everywhere, and Button's `trailingIcon` is both a prop and a part.
 */
describe('event and anatomy renames', () => {
  function slice(): void {
    const events = (web: string, lit: string, rn: string, swiftui: string) => ({ platforms: { web, lit, rn, swiftui } });
    writeFileSync(
      naming.paths.COMPONENTS,
      JSON.stringify([
        {
          component: {
            name: 'Button',
            props: { label: {}, leadingIcon: {}, trailingIcon: {} },
            events: { onPress: events('onClick', 'press', 'onPress', 'action'), onTrack: events('onTrack', 'track', 'onTrack', 'onTrack') },
            anatomy: ['container', 'label', 'leadingIcon', 'trailingIcon'],
          },
        },
        {
          component: {
            name: 'Alert',
            props: { tone: {} },
            events: { onDismiss: events('onDismiss', 'dismiss', 'onDismiss', 'onDismiss') },
            anatomy: ['container', 'dismissButton'],
          },
        },
        { component: { name: 'Input', props: {}, events: { onFocus: events('onFocus', 'focus (native, retargeted — no CustomEvent)', 'onFocus', 'onFocus') }, anatomy: [] } },
        { component: { name: 'Card', props: {}, events: {}, anatomy: ['container'] } },
      ]),
      'utf8',
    );
  }

  const OBJECT = '  events:\n    Button.onPress:\n      web: onActivate\n      lit: activate\n      rn: onActivate\n';

  describe('keys that name nothing', () => {
    test('an event the component does not have, scoped and global', () => {
      slice();
      doc('scoped', '  events:\n    Button.onTap: onGo\n');
      expect(() => naming.resolve('scoped')).toThrow(/events.Button.onTap: Button has no event called onTap/);
      doc('global', '  events:\n    onTap: onGo\n');
      expect(() => naming.resolve('global')).toThrow(/events.onTap: no component has an event called onTap/);
      doc('scope-gone', '  events:\n    Disclosure.onToggle: onFlip\n');
      expect(() => naming.resolve('scope-gone')).toThrow(/events.Disclosure.onToggle: no canonical component is called Disclosure/);
    });

    test('an object-form platform the event has no emitted name for', () => {
      writeFileSync(
        naming.paths.COMPONENTS,
        JSON.stringify([{ component: { name: 'Button', props: {}, events: { onPress: { platforms: { web: 'onClick', lit: 'press' } } }, anatomy: [] } }]),
        'utf8',
      );
      doc('no-rn', OBJECT);
      expect(() => naming.resolve('no-rn')).toThrow(/events.Button.onPress.rn: Button's onPress has no rn mapping/);
      slice();
      doc('native', '  events:\n    Input.onFocus:\n      lit: enter\n');
      expect(() => naming.resolve('native'), 'a native event has no CustomEvent name to rename').toThrow(/events.Input.onFocus.lit: Input's onFocus has no lit mapping/);
    });

    test('an anatomy part the component does not have, scoped and global', () => {
      slice();
      doc('part', '  anatomy:\n    Button.foo: bar\n');
      expect(() => naming.resolve('part')).toThrow(/anatomy.Button.foo: Button has no anatomy part called foo/);
      doc('part-global', '  anatomy:\n    foo: bar\n');
      expect(() => naming.resolve('part-global')).toThrow(/anatomy.foo: no component has an anatomy part called foo/);
    });
  });

  describe('resolving', () => {
    test('the object form reaches exactly the platforms it lists', () => {
      slice();
      doc('object', '  events:\n    Button.onPress:\n      web: onActivate\n      rn: onPress\n');
      const res = naming.resolve('object');
      expect(res.events, 'rn is listed but unchanged, so it is not a rename').toEqual({ web: { Button: { onClick: 'onActivate' } } });
      expect(naming.isNoop(res)).toBe(false);
    });

    test('a string reaches the platforms whose emitted name follows the convention', () => {
      slice();
      doc('string', '  events:\n    Button.onPress: onActivate\n    onDismiss: onClose\n');
      expect(naming.resolve('string').events).toEqual({
        lit: { Button: { press: 'activate' }, Alert: { dismiss: 'close' } },
        rn: { Button: { onPress: 'onActivate' }, Alert: { onDismiss: 'onClose' } },
        web: { Alert: { onDismiss: 'onClose' } },
      });
    });

    test('a dotted event key wins over the bare one, and a name mapped to itself renames nothing', () => {
      slice();
      doc('both', '  events:\n    onPress: onTap\n    Button.onPress:\n      rn: onActivate\n  anatomy:\n    container: root\n');
      const res = naming.resolve('both');
      expect(res.events).toEqual({ rn: { Button: { onPress: 'onActivate' } } });
      expect(res.anatomy).toEqual({ '': { container: 'root' } });
      doc('same', '  events:\n    Button.onPress:\n      web: onClick\n  anatomy:\n    Button.label: label\n');
      expect(naming.isNoop(naming.resolve('same'))).toBe(true);
    });

    test('with no components.json the convention is all there is', () => {
      doc('unparsed', '  events:\n    Button.onPress: onActivate\n');
      expect(naming.resolve('unparsed').events).toEqual({
        web: { Button: { onPress: 'onActivate' } },
        lit: { Button: { press: 'activate' } },
        rn: { Button: { onPress: 'onActivate' } },
      });
    });
  });

  describe('collisions the schema cannot see', () => {
    test('two events of one component resolving to one emitted name on a platform', () => {
      slice();
      // Different scopes to the schema — a bare key and a dotted one — but one component on rn.
      doc('twice', '  events:\n    Button.onPress:\n      rn: onGo\n    onTrack:\n      rn: onGo\n');
      expect(() => naming.resolve('twice')).toThrow(naming.NamingError);
      expect(() => naming.resolve('twice')).toThrow(/Button.onTrack and Button.onPress both rename to onGo on rn|Button.onPress and Button.onTrack both rename to onGo on rn/);
    });

    test("a brand emitted name that is another of the component's emitted names", () => {
      slice();
      doc('shadow', '  events:\n    Button.onPress:\n      web: onTrack\n');
      expect(() => naming.resolve('shadow')).toThrow(/Button.onPress renames to onTrack on web, which Button already emits for onTrack — rename onTrack too/);
      doc('swap', '  events:\n    Button.onPress:\n      web: onTrack\n    Button.onTrack:\n      web: onFollow\n');
      expect(naming.resolve('swap').events, 'renaming both keeps it injective').toEqual({ web: { Button: { onClick: 'onTrack', onTrack: 'onFollow' } } });
    });

    test('a brand part that is another unrenamed part of the component', () => {
      slice();
      doc('part-shadow', '  anatomy:\n    Button.trailingIcon: leadingIcon\n');
      expect(() => naming.resolve('part-shadow')).toThrow(/Button.trailingIcon renames to leadingIcon, which is already a Button anatomy part — rename leadingIcon too/);
      doc('part-twice', '  anatomy:\n    label: text\n    Button.container: text\n');
      expect(() => naming.resolve('part-twice')).toThrow(/Button.(container and Button.label|label and Button.container) both rename to text/);
    });
  });

  describe('notices', () => {
    test('a string rename that does not reach a platform', () => {
      slice();
      doc('string', '  events:\n    Button.onPress: onActivate\n');
      const res = naming.resolve('string');
      expect(naming.notices(res, 'web')).toEqual(['Button.onPress → onActivate does not reach web, which emits onClick; use { web: … }']);
      expect(naming.notices(res, 'lit')).toEqual([]);
      expect(naming.notices(res, 'rn')).toEqual([]);
      expect(naming.collisions(res, 'web'), 'notices are their own list').toEqual([]);
    });

    test('a type prefix for a platform without prefixed type names', () => {
      doc('prefix', '  namespace:\n    typePrefix:\n      web: Acme\n      rn: Acme\n');
      const res = naming.resolve('prefix');
      expect(naming.notices(res, 'web')).toEqual(['namespace.typePrefix.web renames nothing: only rn and swiftui have prefixed type names']);
      expect(naming.notices(res, 'rn')).toEqual([]);
    });

    test('a props key that names only an event, or only an anatomy part', () => {
      slice();
      doc('riding', '  props:\n    Button.onPress: onTap\n    container: root\n    Button.leadingIcon: startIcon\n');
      const res = naming.resolve('riding');
      expect(res.props, 'props still renames exactly as it did').toEqual({ 'Button.onPress': 'onTap', container: 'root', 'Button.leadingIcon': 'startIcon' });
      expect(naming.notices(res, 'lit')).toEqual([
        'props.Button.onPress names an event, not a prop: it renames the neutral name, not what each platform emits; move it to events',
        'props.container names an anatomy part, not a prop: it also renames every identifier spelled container; move it to anatomy',
      ]);
    });

    test('the command line prints them beside the collisions, and counts events and parts', () => {
      slice();
      doc('cli', `  components:\n    Button: CtaButton\n${OBJECT}    Alert.onDismiss: onClose\n    Button.onTrack: onFollow\n  anatomy:\n    Button.trailingIcon: endIcon\n  namespace:\n    typePrefix:\n      web: Acme\n`);
      write(join(dir, 'src', 'Button.tsx'), 'export const Button = () => null;\n');
      expect(naming.main(['--naming', 'cli', '--platform', 'web', '--dir', 'src', '--check'])).toBe(0);
      expect(std.out()).toContain('1 component(s), 0 prop(s), 3 event(s), 1 anatomy part(s), 0 value(s), 0 token rename(s), --ds- prefix');
      expect(std.out()).toContain('  ! web: namespace.typePrefix.web renames nothing');
      expect(std.out(), 'the object form reaches web').not.toContain('Button.onPress →');
    });
  });

  describe('rewriting', () => {
    function resolved(frontmatter: string): naming.Resolution {
      slice();
      doc('brand', `  components:\n    Button: CtaButton\n    Alert: Callout\n${frontmatter}`);
      return naming.resolve('brand');
    }

    test("web: the component's own emitted name, but not the intrinsic element's", () => {
      const res = resolved(OBJECT);
      const before = [
        'onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;',
        'export const Button = function Button({ label, onClick, onTrack }: ButtonProps) {',
        '  const handleClick = (event) => { onClick?.(event); };',
        '  return <button type="button" onClick={handleClick}>{label}</button>;',
        '};',
      ].join('\n');
      const after = rw(before, res, 'web', 'Button.tsx');
      expect(after).toBe(
        [
          'onActivate?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;',
          'export const CtaButton = function CtaButton({ label, onActivate, onTrack }: CtaButtonProps) {',
          '  const handleClick = (event) => { onActivate?.(event); };',
          '  return <button type="button" onClick={handleClick}>{label}</button>;',
          '};',
        ].join('\n'),
      );
      expect(rw(after, res, 'web', 'CtaButton.tsx', 'canonical')).toBe(before);
    });

    test("a composite: the attribute on the component's element, even past a nested element, and the file's own names in values", () => {
      const res = resolved(`${OBJECT}    Alert.onDismiss: onClose\n`);
      const before = '<Button leadingIcon={<Icon name="close" />} onPress={onDismiss} />\n<Pressable onPress={onDismiss}><View /></Pressable>';
      const after = rw(before, res, 'rn', 'Alert.tsx');
      expect(after).toBe('<CtaButton leadingIcon={<Icon name="close" />} onActivate={onClose} />\n<Pressable onPress={onClose}><View /></Pressable>');
      expect(rw(after, res, 'rn', 'Callout.tsx', 'canonical')).toBe(before);
      expect(rw('<Card onClick={x} /><div onClick={y} />', res, 'web', 'Alert.tsx'), 'not Button, not renamed').toBe('<Card onClick={x} /><div onClick={y} />');
    });

    test("rn: an imported element's own handler stays", () => {
      const res = resolved(OBJECT);
      const before = "import { Pressable } from 'react-native';\nconst { onPress } = props;\n<Pressable onPress={handlePress} onPressIn={x}>";
      expect(rw(before, res, 'rn', 'Button.tsx')).toBe("import { Pressable } from 'react-native';\nconst { onActivate } = props;\n<Pressable onPress={handlePress} onPressIn={x}>");
    });

    test("lit: dispatched and listened for in the component's own files, bound on its element in a composite", () => {
      const res = resolved(`${OBJECT}    Alert.onDismiss: onClose\n`);
      const own = "this.dispatchEvent(new CustomEvent<ButtonPressDetail>('press', { bubbles: true }));\nel.addEventListener('press', press);\nel.removeEventListener(\"press\", press);\n/** @fires press */";
      const renamed = rw(own, res, 'lit', 'Button.ts');
      expect(renamed).toBe(
        "this.dispatchEvent(new CustomEvent<CtaButtonPressDetail>('activate', { bubbles: true }));\nel.addEventListener('activate', press);\nel.removeEventListener(\"activate\", press);\n/** @fires press */",
      );
      expect(rw(renamed, res, 'lit', 'CtaButton.ts', 'canonical')).toBe(own);
      const composite = "<ds-button @press=${this.handleDismiss} @focus=${f}></ds-button>\nnew CustomEvent('dismiss');\n<form @press=${this.handlePress}>\nthis.addEventListener('press', h);";
      expect(rw(composite, res, 'lit', 'Alert.ts')).toBe(
        // The last two are the stated limit: a listener that is not on the component's element keeps the canonical name.
        "<ds-cta-button @activate=${this.handleDismiss} @focus=${f}></ds-cta-button>\nnew CustomEvent('close');\n<form @press=${this.handlePress}>\nthis.addEventListener('press', h);",
      );
    });

    test('anatomy renames the part and never the prop of the same name', () => {
      const res = resolved('  anatomy:\n    Button.trailingIcon: endIcon\n');
      const before = [
        '.ds-button__trailing-icon {}',
        ":host([loading]) slot[name='trailing-icon'] {}",
        '<slot name="trailing-icon" part="trailing-icon"></slot>',
        '<ds-icon slot="trailing-icon"></ds-icon>',
        "@property({ attribute: 'trailing-icon' }) accessor trailingIcon: string | undefined;",
        '<span data-part="trailingIcon">{trailingIcon}</span>',
      ].join('\n');
      const after = rw(before, res, 'lit', 'Button.ts');
      expect(after).toBe(
        [
          '.ds-cta-button__end-icon {}',
          ":host([loading]) slot[name='end-icon'] {}",
          '<slot name="end-icon" part="trailing-icon"></slot>',
          '<ds-icon slot="end-icon"></ds-icon>',
          "@property({ attribute: 'trailing-icon' }) accessor trailingIcon: string | undefined;",
          '<span data-part="trailingIcon">{trailingIcon}</span>',
        ].join('\n'),
      );
      expect(rw(after, res, 'lit', 'CtaButton.ts', 'canonical')).toBe(before);
    });

    test('a doc without events or anatomy rewrites exactly as before', () => {
      const res = resolved('');
      const text = "<ds-button @press=${h}></ds-button>\nnew CustomEvent('press');\nslot[name='trailing-icon']\n<Button onClick={x} />";
      expect(rw(text, res, 'lit', 'Card.ts')).toBe("<ds-cta-button @press=${h}></ds-cta-button>\nnew CustomEvent('press');\nslot[name='trailing-icon']\n<CtaButton onClick={x} />");
    });
  });
});

/**
 * Job 626: `values` renames a prop's enum values, but only where the code ties a value to one prop, because the same
 * words are canonical token names too (`var(--color-action-primary-background)`). The components.json below is a
 * slice of the real one: Button's variant, size and type, three tones (Link's without a danger, Meter's through
 * `enumRef`), and Tabs, whose size and density share one value set.
 */
describe('enum value renames', () => {
  function slice(): void {
    const e = (...values: string[]) => ({ type: 'enum', values });
    const component = (name: string, props: Record<string, unknown>) => ({ component: { name, props, events: {}, anatomy: [] } });
    writeFileSync(
      naming.paths.COMPONENTS,
      JSON.stringify([
        component('Button', { label: { type: 'string' }, variant: e('primary', 'secondary', 'ghost', 'danger'), size: e('sm', 'md', 'lg'), type: e('button', 'submit') }),
        component('Alert', { tone: e('info', 'success', 'warning', 'danger') }),
        component('Toast', { tone: e('neutral', 'success', 'warning', 'danger') }),
        component('Link', { tone: e('default', 'inherit') }),
        component('Meter', { tone: { type: 'enum', enumRef: 'tone' } }),
        component('Icon', { size: e('sm', 'md', 'lg') }),
        component('Tabs', { size: e('sm', 'md'), density: e('sm', 'md') }),
      ]),
      'utf8',
    );
  }

  describe('keys that name nothing', () => {
    test('a dotted key whose component has no such prop, or whose prop is not an enum', () => {
      slice();
      doc('typo', '  values:\n    Button.varient:\n      primary: cta\n');
      expect(() => naming.resolve('typo')).toThrow(/values.Button.varient: Button has no prop called varient/);
      doc('label', '  values:\n    Button.label:\n      primary: cta\n');
      expect(() => naming.resolve('label')).toThrow(/values.Button.label: Button.label is not an enum prop/);
      doc('gone', '  values:\n    Disclosure.size:\n      sm: small\n');
      expect(() => naming.resolve('gone')).toThrow(/values.Disclosure.size: no canonical component is called Disclosure/);
    });

    test('a value the prop does not have', () => {
      slice();
      doc('primray', '  values:\n    Button.variant:\n      primray: cta\n');
      expect(() => naming.resolve('primray')).toThrow(/values.Button.variant.primray: Button.variant has no value primray/);
    });

    test('a bare key that matches no enum prop, or a value no matching enum prop has', () => {
      slice();
      doc('bare', '  values:\n    label:\n      primary: cta\n');
      expect(() => naming.resolve('bare')).toThrow(/values.label: no component has an enum prop called label/);
      doc('bare-value', '  values:\n    tone:\n      critical: severe\n');
      expect(() => naming.resolve('bare-value')).toThrow(/values.tone.critical: no enum prop called tone has a value critical/);
    });

    test("an enumRef prop with no values in components.json is checked against schema/vocab.ts", () => {
      slice();
      doc('ref', '  values:\n    Meter.tone:\n      info: notice\n');
      expect(naming.resolve('ref').values).toEqual({ Meter: { tone: { info: 'notice' } } });
      doc('ref-miss', '  values:\n    Meter.tone:\n      inherit: plain\n');
      expect(() => naming.resolve('ref-miss')).toThrow(/values.Meter.tone.inherit: Meter.tone has no value inherit/);
    });
  });

  describe('resolving', () => {
    test("a dotted key's entry wins over the bare key's for the same value, and the two merge otherwise", () => {
      slice();
      doc('merge', '  values:\n    tone:\n      danger: critical\n      warning: caution\n    Alert.tone:\n      info: notice\n      warning: heads-up\n');
      expect(naming.resolve('merge').values, "Link's tones have neither value").toEqual({
        Alert: { tone: { danger: 'critical', info: 'notice', warning: 'heads-up' } },
        Toast: { tone: { danger: 'critical', warning: 'caution' } },
        Meter: { tone: { danger: 'critical', warning: 'caution' } },
      });
    });

    test('the map is looked up by the canonical prop even when props renames it; a value mapped to itself renames nothing', () => {
      slice();
      doc('renamed', '  props:\n    Button.variant: kind\n  values:\n    Button.variant:\n      primary: cta\n      ghost: ghost\n');
      const res = naming.resolve('renamed');
      expect(res.values).toEqual({ Button: { variant: { primary: 'cta' } } });
      expect(naming.isNoop({ ...res, props: {} }), 'values alone are a rename').toBe(false);
      doc('same', '  values:\n    Button.variant:\n      primary: primary\n');
      expect(naming.resolve('same').values).toEqual({});
      expect(naming.isNoop(naming.resolve('same'))).toBe(true);
    });

    test('collisions the schema cannot see: two keys merged onto one brand value, or a value the key does not list', () => {
      slice();
      doc('merged', '  values:\n    tone:\n      danger: bad\n    Alert.tone:\n      warning: bad\n');
      expect(() => naming.resolve('merged')).toThrow(/Alert.tone.(danger and Alert.tone.warning|warning and Alert.tone.danger) both rename to bad/);
      doc('shadow', '  values:\n    Button.variant:\n      primary: secondary\n');
      expect(() => naming.resolve('shadow')).toThrow(/Button.variant.primary renames to secondary, which is already one of its values/);
    });

    test('the command line counts values and lists what it left alone', () => {
      slice();
      doc('cli', '  values:\n    Button.variant:\n      primary: cta\n');
      write(join(dir, 'src', 'Button.tsx'), "export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';\nconst fallback = 'primary';\n");
      expect(naming.main(['--naming', 'cli', '--platform', 'web', '--dir', 'src', '--check'])).toBe(0);
      expect(std.out()).toContain('0 anatomy part(s), 1 value(s), 0 token rename(s), --ds- prefix');
      expect(std.out()).toContain("  ! web: ambiguous value src/Button.tsx:2: const fallback = 'primary';");
      expect(std.out()).toContain('would change 1 file(s), 0 move(s)');
    });
  });

  describe('rewriting', () => {
    const TOKEN = 'var(--color-action-primary-background)';

    function resolved(more: string = ''): naming.Resolution {
      slice();
      doc(
        'brand',
        `  components:\n    Button: CtaButton\n  props:\n    Button.variant: kind\n  values:\n    Button.variant:\n      primary: cta\n      danger: destructive\n    Button.size:\n      md: medium\n${more}`,
      );
      return naming.resolve('brand');
    }

    /** Canonical → brand is `after`, and brand → canonical gives back `before`. */
    function both(before: string, after: string, platform: string, file: string, res: naming.Resolution = resolved()): void {
      expect(rw(before, res, platform, file)).toBe(after);
      expect(rw(after, res, platform, file.replace('Button', 'CtaButton'), 'canonical')).toBe(before);
    }

    function hitsOf(text: string, res: naming.Resolution, platform: string, file: string): string[] {
      const hits: string[] = [];
      naming.rewrite(text, naming.vocab(res, platform, 'brand'), file, hits);
      return hits;
    }

    test("an attribute on the component's element, with the prop's brand spelling in the same pass", () => {
      const res = resolved();
      both(
        `<Button variant="primary" size={'md'} style={{ background: '${TOKEN}' }} />\n<Icon size="md" />\n<button type="button" data-ds="Button" />`,
        `<CtaButton kind="cta" size={'medium'} style={{ background: '${TOKEN}' }} />\n<Icon size="md" />\n<button type="button" data-ds="Button" />`,
        'web',
        'Card.tsx',
        res,
      );
      both(
        `<ds-button variant="danger" size="md"></ds-button>\n<ds-icon size="md"></ds-icon>\nbackground: var(--color-action-danger-background);`,
        `<ds-cta-button kind="destructive" size="medium"></ds-cta-button>\n<ds-icon size="md"></ds-icon>\nbackground: var(--color-action-danger-background);`,
        'lit',
        'Card.ts',
        res,
      );
      expect(hitsOf('<Button variant="primary" />\n<Icon size="md" />', res, 'web', 'Card.tsx'), "Icon's size is provably Icon's").toEqual([]);
    });

    test('a Lit attribute selector, on the host or on a named element', () => {
      both(
        `:host([variant='primary']) button { background: ${TOKEN}; }\n:host([size="md"]) {}\nds-icon[size='md'] {}`,
        `:host([kind='cta']) button { background: ${TOKEN}; }\n:host([size="medium"]) {}\nds-icon[size='md'] {}`,
        'lit',
        'Button.ts',
      );
    });

    test('an object property or a JSON key naming the prop', () => {
      both(
        "args: { variant: 'primary', label: 'Save' },\nconst token = { background: 'colorActionPrimaryBackground' };",
        "args: { kind: 'cta', label: 'Save' },\nconst token = { background: 'colorActionPrimaryBackground' };",
        'web',
        'Button.stories.tsx',
      );
      both(
        'const s = setup({"variant": "danger", "size": "md"});\ncolor: var(--color-action-danger-foreground);',
        'const s = setup({"kind": "destructive", "size": "medium"});\ncolor: var(--color-action-danger-foreground);',
        'web',
        'Button.web.test.tsx',
      );
    });

    test('a default, in a destructuring or on an accessor', () => {
      both(
        "function Button({ variant = 'primary', size = 'md' }: ButtonProps) {\n  return t.colorActionPrimaryBackground;\n}",
        "function CtaButton({ kind = 'cta', size = 'medium' }: CtaButtonProps) {\n  return t.colorActionPrimaryBackground;\n}",
        'rn',
        'Button.tsx',
      );
      both(
        `@property({ reflect: true }) accessor variant: ButtonVariant = 'danger';\ncolor: ${TOKEN};`,
        `@property({ reflect: true }) accessor kind: CtaButtonVariant = 'destructive';\ncolor: ${TOKEN};`,
        'lit',
        'Button.ts',
      );
    });

    test('a comparison or a switch on the prop, and not a switch on something else', () => {
      both(
        "if (variant === 'danger' || props.size !== 'md') {}\nswitch (this.variant) {\n  case 'primary':\n    return 'colorActionPrimaryBackground';\n  case 'ghost':\n    return x;\n}\nswitch (other) {\n  case 'primary':\n}",
        "if (kind === 'destructive' || props.size !== 'medium') {}\nswitch (this.kind) {\n  case 'cta':\n    return 'colorActionPrimaryBackground';\n  case 'ghost':\n    return x;\n}\nswitch (other) {\n  case 'primary':\n}",
        'web',
        'Button.tsx',
      );
    });

    test("a union in the <Component><Prop> type, or in the prop's own declaration", () => {
      both(
        "export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';\nexport type ButtonType = 'button' | 'submit';\ninterface ButtonProps {\n  size?: 'sm' | 'md' | 'lg';\n  token: 'colorActionPrimaryBackground';\n}\nexport type IconSize = 'sm' | 'md' | 'lg';",
        "export type CtaButtonVariant = 'cta' | 'secondary' | 'ghost' | 'destructive';\nexport type CtaButtonType = 'button' | 'submit';\ninterface CtaButtonProps {\n  size?: 'sm' | 'medium' | 'lg';\n  token: 'colorActionPrimaryBackground';\n}\nexport type IconSize = 'sm' | 'md' | 'lg';",
        'web',
        'Button.tsx',
      );
    });

    test('a modifier class, in CSS and in TS, renamed in the same match as its stem', () => {
      both(
        `.ds-button--primary { background: ${TOKEN}; }\n.ds-button--md {}\n.ds-button--icon-only {}\n.ds-icon--md {}`,
        `.ds-cta-button--cta { background: ${TOKEN}; }\n.ds-cta-button--medium {}\n.ds-cta-button--icon-only {}\n.ds-icon--md {}`,
        'web',
        'Button.css',
      );
      both("inverse ? 'ds-button--danger' : `ds-button--${variant}`", "inverse ? 'ds-cta-button--destructive' : `ds-cta-button--${kind}`", 'web', 'Button.tsx');
    });

    test("an object literal keyed by the prop's whole value set, unless a sibling prop has the same set", () => {
      both(
        "const VARIANT_TOKENS = {\n  primary: { background: 'colorActionPrimaryBackground' },\n  secondary: { background: 'colorActionSecondaryBackground' },\n  ghost: {},\n  danger: { background: 'colorActionDangerBackground' },\n};",
        "const VARIANT_TOKENS = {\n  cta: { background: 'colorActionPrimaryBackground' },\n  secondary: { background: 'colorActionSecondaryBackground' },\n  ghost: {},\n  destructive: { background: 'colorActionDangerBackground' },\n};",
        'rn',
        'Button.tsx',
      );
      const res = resolved('    Tabs.size:\n      md: medium\n');
      const tabs = "const PADDING = { sm: 'spaceSm', md: 'spaceMd' };\n.ds-tabs--md {}";
      expect(rw(tabs, res, 'web', 'Tabs.tsx'), 'size and density share the set, so neither is provable').toBe(tabs);
      expect(hitsOf(tabs, res, 'web', 'Tabs.tsx')).toEqual(["1: const PADDING = { sm: 'spaceSm', md: 'spaceMd' };", '2: .ds-tabs--md {}']);
    });

    test('SwiftUI: an enum with the whole value set and `case .primary` inside `switch variant`, never a bare `.primary`', () => {
      const res = resolved();
      const before = [
        'public enum ButtonVariant: String {',
        '    case primary, secondary',
        '    case ghost',
        '    case danger = "danger"',
        '}',
        'switch variant {',
        'case .primary, .danger: return TokenRef.colorActionPrimaryBackground',
        'case .ghost: return .colorActionGhostBackground',
        '}',
        'Label("x").foregroundStyle(.primary)',
      ].join('\n');
      const after = [
        'public enum CtaButtonVariant: String {',
        '    case cta, secondary',
        '    case ghost',
        '    case destructive = "destructive"',
        '}',
        'switch kind {',
        'case .cta, .destructive: return TokenRef.colorActionPrimaryBackground',
        'case .ghost: return .colorActionGhostBackground',
        '}',
        'Label("x").foregroundStyle(.primary)',
      ].join('\n');
      both(before, after, 'swiftui', 'Button.swift', res);
      expect(hitsOf(before, res, 'swiftui', 'Button.swift'), '.primary is also a ShapeStyle').toEqual(['10: Label("x").foregroundStyle(.primary)']);
    });

    test('never inside a token reference, a comment or a gate hook', () => {
      const res = resolved();
      const text = [
        "// Use the `primary` variant for the main action: 'primary'",
        "/* color.action.{variant}.* and 'danger' */",
        "const ref = 'color.action.primary.background';",
        `const key = t.colorActionPrimaryBackground; // ${TOKEN}`,
        '<span data-part="primary" part=\'danger\' />',
        "testID={'primary'}",
      ].join('\n');
      expect(rw(text, res, 'web', 'Button.tsx'), 'the prop name in prose moves, as it always has; the values do not').toBe(text.replaceAll('variant', 'kind'));
      expect(hitsOf(text, res, 'web', 'Button.tsx')).toEqual([]);
    });

    test('a literal no context ties to the prop is reported and left alone, in both directions', () => {
      const res = resolved();
      const text = "const fallback = 'primary';\nconst icons = { primary: 'star' };\n<Icon name=\"danger\" />";
      expect(rw(text, res, 'web', 'Button.tsx')).toBe(text);
      expect(hitsOf(text, res, 'web', 'Button.tsx')).toEqual(["1: const fallback = 'primary';", "2: const icons = { primary: 'star' };", '3: <Icon name="danger" />']);
      expect(rw(text, res, 'web', 'CtaButton.tsx', 'canonical')).toBe(text);
    });

    test('a prop interpolated into a token name is reported; a modifier class built the same way is not', () => {
      const res = resolved();
      const text = "const bg = `color.action.${variant}.background`;\nconst fg = `var(--color-action-${this.variant}-foreground)`;\nconst cls = `ds-button--${variant}`;\nconst plain = `${size}`;";
      expect(rw(text, res, 'web', 'Button.tsx')).toBe(text.replaceAll('variant', 'kind').replace('ds-button', 'ds-cta-button'));
      expect(hitsOf(text, res, 'web', 'Button.tsx')).toEqual([
        '1: const bg = `color.action.${variant}.background`;',
        '2: const fg = `var(--color-action-${this.variant}-foreground)`;',
      ]);
    });

    test('a naming doc with no values rewrites the committed files byte for byte as before', () => {
      slice();
      doc('plain', '  components:\n    Button: CtaButton\n  props:\n    Button.variant: kind\n');
      const plain = naming.resolve('plain');
      doc('identity', '  components:\n    Button: CtaButton\n  props:\n    Button.variant: kind\n  values:\n    Button.variant:\n      primary: primary\n');
      const identity = naming.resolve('identity');
      expect(identity.values).toEqual({});
      for (const [platform, file] of [['web', 'Button.tsx'], ['web', 'Button.css'], ['rn', 'Button.tsx'], ['lit', 'Button.ts']] as const) {
        const text = readFileSync(join(sourceDir(REPO_ROOT, platform), file), 'utf8');
        const v = naming.vocab(plain, platform, 'brand');
        expect(v.values.size, 'no value rule is even compiled').toBe(0);
        expect(naming.rewrite(text, naming.vocab(identity, platform, 'brand'), file), `${platform} ${file}`).toBe(naming.rewrite(text, v, file));
      }
      const src = join(dir, 'plain-src');
      mkdirSync(src, { recursive: true });
      cpSync(join(sourceDir(REPO_ROOT, 'web'), 'Button.tsx'), join(src, 'Button.tsx'));
      expect(naming.rename(src, plain, 'brand', 'web'), 'no ambiguous key at all').toEqual({ edited: ['Button.tsx'], renames: [['Button.tsx', 'CtaButton.tsx']] });
    });

    test('round trip: the committed Button on web, rn and lit moves every value context, reverts byte for byte, and reapplies identically', () => {
      const themes = naming.paths.THEMES;
      Object.assign(naming.paths, savedPaths);
      const docFile = write(
        join(dir, 'round-trip.md'),
        '---\ntitle: round trip\nnaming:\n  components:\n    Button: CtaButton\n  props:\n    Button.variant: kind\n  values:\n    Button.variant:\n      primary: cta\n      danger: destructive\n---\n',
      );
      const res = naming.resolve(docFile);
      Object.assign(naming.paths, { ROOT: dir, THEMES: themes, COMPONENTS: join(dir, 'components.json') });

      const trees = [
        ['web', ['Button.tsx', 'Button.css', 'Button.stories.tsx']],
        ['rn', ['Button.tsx']],
        ['lit', ['Button.ts']],
      ] as const;
      const moved: Record<string, string> = {};
      for (const [platform, files] of trees) {
        const src = join(dir, `${platform}-values`);
        mkdirSync(src, { recursive: true });
        for (const f of files) cpSync(join(sourceDir(REPO_ROOT, platform), f), join(src, f));
        const applied = naming.rename(src, res, 'brand', platform);
        expect(applied.ambiguous, `${platform}: every primary and danger in Button is provable`).toBeUndefined();
        const first = snapshot(src);
        for (const [f, text] of Object.entries(first)) {
          moved[`${platform}/${f}`] = text;
          expect(text, `${platform} ${f}: no quoted canonical value is left`).not.toMatch(/['"](?:primary|danger)['"]/);
          expect(text, `${platform} ${f}: no modifier either`).not.toMatch(/--(?:primary|danger)\b/);
        }
        naming.rename(src, res, 'canonical', platform);
        for (const f of files) expect(readFileSync(join(src, f)).equals(readFileSync(join(sourceDir(REPO_ROOT, platform), f))), `${platform} ${f} reverts`).toBe(true);
        naming.rename(src, res, 'brand', platform);
        expect(snapshot(src), `${platform} reapplies`).toEqual(first);
      }

      const web = moved['web/CtaButton.tsx'] as string;
      expect(web).toContain("export type CtaButtonVariant = 'cta' | 'secondary' | 'ghost' | 'destructive';");
      expect(web).toContain("kind = 'cta',");
      expect(web, 'the class follows the value through the prop').toContain('`ds-cta-button--${kind}`');
      expect(web, 'prose keeps the canonical value').toContain('Use the `primary` kind');
      const css = moved['web/CtaButton.css'] as string;
      expect(css).toContain('.ds-cta-button--cta {');
      expect(css).toContain('.ds-cta-button--destructive {');
      expect(css).toContain('--ds-button-background: var(--color-action-primary-background);');
      expect(css).toContain('--ds-button-background: var(--color-action-danger-background);');
      const stories = moved['web/CtaButton.stories.tsx'] as string;
      expect(stories).toContain("export const VariantPrimary: Story = { args: { kind: 'cta' } };");
      expect(stories).toContain("args: { kind: 'destructive', label: 'Delete file' }");
      const rn = moved['rn/CtaButton.tsx'] as string;
      expect(rn).toMatch(/const VARIANT_TOKENS = \{\r?\n {2}cta: \{\r?\n {4}background: 'colorActionPrimaryBackground',/);
      expect(rn).toMatch(/ {2}destructive: \{\r?\n {4}background: 'colorActionDangerBackground',/);
      expect(rn).toContain("kind = 'cta',");
      expect(rn).toContain("kind === 'ghost' && inverse");
      const lit = moved['lit/CtaButton.ts'] as string;
      // The regenerated Lit element sets custom properties on the host, as the `destructive` case below does.
      expect(lit).toMatch(/:host\(\[kind='cta'\]\) \{\s+--ds-button-background: var\(--color-action-primary-background\);/);
      expect(lit).toMatch(/:host\(\[kind='destructive'\]\) \{\s+--ds-button-background: var\(--color-action-danger-background\);/);
      expect(lit).toContain("accessor kind: CtaButtonVariant = 'cta';");
    });
  });
});

describe('what a rename touches', () => {
  test('the exported identifier and everything built on it', () => {
    const res = acme();
    const before = [
      "export type ButtonVariant = 'primary';",
      'export interface ButtonProps { label: string }',
      'export const Button = function Button({ label }: ButtonProps) { return null; };',
    ].join('\n');
    expect(rw(before, res, 'web', 'Button.tsx')).toBe(
      [
        "export type CtaButtonVariant = 'primary';",
        'export interface CtaButtonProps { label: string }',
        'export const CtaButton = function CtaButton({ label }: CtaButtonProps) { return null; };',
      ].join('\n'),
    );
  });

  test('the file name, on every platform', () => {
    const res = acme();
    const v = (platform: string): naming.Vocab => naming.vocab(res, platform, 'brand');
    expect(naming.renameFileName('Button.tsx', v('web'))).toBe('CtaButton.tsx');
    expect(naming.renameFileName('Button.css', v('web'))).toBe('CtaButton.css');
    expect(naming.renameFileName('Button.stories.tsx', v('web'))).toBe('CtaButton.stories.tsx');
    expect(naming.renameFileName('Button.test.tsx', v('web'))).toBe('CtaButton.test.tsx');
    expect(naming.renameFileName('Button.ts', v('lit'))).toBe('CtaButton.ts');
    expect(naming.renameFileName('Button.swift', v('swiftui'))).toBe('CtaButton.swift');
    expect(naming.renameFileName('Gallery+Button.swift', v('swiftui'))).toBe('Gallery+CtaButton.swift');
    expect(naming.renameFileName('index.ts', v('web')), 'the index is not a component').toBe('index.ts');
    expect(naming.renamePath('packages/react/src/Button.tsx', res, 'web')).toBe('packages/react/src/CtaButton.tsx');
  });

  test('the prop in the signature, scoped to the component the doc named', () => {
    const res = acme();
    expect(rw('function Button({ leadingIcon }: ButtonProps) {}', res, 'web', 'Button.tsx')).toBe(
      'function CtaButton({ startIcon }: CtaButtonProps) {}',
    );
    expect(rw('function Card({ leadingIcon }: CardProps) {}', res, 'web', 'Card.tsx'), 'Card keeps its own leadingIcon').toBe(
      'function Card({ leadingIcon }: CardProps) {}',
    );
  });

  test('a global prop rename applies to every component', () => {
    doc('global', '  props:\n    variant: tone\n');
    const res = naming.resolve('global');
    expect(rw('const { variant } = props;', res, 'web', 'Card.tsx')).toBe('const { tone } = props;');
    expect(rw('const { variant } = props;', res, 'web', 'Button.tsx')).toBe('const { tone } = props;');
  });

  test('a dotted rename wins over the global one, and reaches a composite through the element', () => {
    doc('both', '  components:\n    Button: CtaButton\n  props:\n    variant: tone\n    Button.variant: emphasis\n');
    const res = naming.resolve('both');
    expect(rw('const { variant } = props;', res, 'web', 'Button.tsx')).toBe('const { emphasis } = props;');
    expect(rw('<Button variant="ghost" /><Alert variant="info" />', res, 'web', 'Card.tsx')).toBe(
      '<CtaButton emphasis="ghost" /><Alert tone="info" />',
    );
  });

  test('the css custom-property prefix, and nothing else about the hook name', () => {
    const res = acme();
    const css = '.ds-button {\n  --ds-button-background: var(--color-action-primary-background);\n  font-size: var(--ds-button-font-size);\n}';
    expect(rw(css, res, 'web', 'Button.css')).toBe(
      '.acme-cta-button {\n  --acme-button-background: var(--color-action-primary-background);\n  font-size: var(--acme-button-font-size);\n}',
    );
  });

  test('a class name carries the component, and its part', () => {
    const res = acme();
    expect(rw('.ds-button__label, .ds-button--primary, .ds-button__leading-icon {}', res, 'web', 'Button.css')).toBe(
      '.acme-cta-button__label, .acme-cta-button--primary, .acme-cta-button__start-icon {}',
    );
    expect(rw("'ds-button--icon-only'", res, 'web', 'Button.tsx')).toBe("'acme-cta-button--icon-only'");
  });

  test('a token custom property that is not ours is untouched', () => {
    const res = acme();
    expect(rw('color: var(--color-action-primary-foreground); gap: var(--space-2);', res, 'web', 'Button.css')).toBe(
      'color: var(--color-action-primary-foreground); gap: var(--space-2);',
    );
  });

  test('the package scope in a module specifier', () => {
    const res = acme();
    expect(rw("import { cssVar } from '@design-schema/tokens';", res, 'web', 'Button.tsx')).toBe(
      "import { cssVar } from '@acme/tokens';",
    );
    expect(rw("import * as light from '@design-schema/tokens/calm-precise/rn/light';", res, 'rn', 'theme.tsx')).toBe(
      "import * as light from '@acme/tokens/calm-precise/rn/light';",
    );
  });

  test('the lit tag, its attribute spelling and a composite that renders it', () => {
    const res = acme();
    const before = [
      "@customElement('ds-button')",
      "@property({ attribute: 'leading-icon' }) accessor leadingIcon: string | undefined;",
      'export class DsButton extends LitElement {}',
      "'ds-button': DsButton;",
      '<ds-button leading-icon="x" slot="footer"></ds-button>',
    ].join('\n');
    expect(rw(before, res, 'lit', 'Button.ts')).toBe(
      [
        "@customElement('acme-cta-button')",
        "@property({ attribute: 'start-icon' }) accessor startIcon: string | undefined;",
        // the class name carries the namespace prefix, so both halves of it move
        'export class AcmeCtaButton extends LitElement {}',
        "'acme-cta-button': AcmeCtaButton;",
        '<acme-cta-button start-icon="x" slot="footer"></acme-cta-button>',
      ].join('\n'),
    );
  });

  test("a composite's import and element follow the component, on every platform", () => {
    const res = acme();
    expect(rw("import { Button } from './Button';\n<Button label=\"Save\" />", res, 'web', 'Card.tsx')).toBe(
      "import { CtaButton } from './CtaButton';\n<CtaButton label=\"Save\" />",
    );
    expect(rw("import './Button.js';\n<ds-button label=\"Save\"></ds-button>", res, 'lit', 'Card.ts')).toBe(
      "import './CtaButton.js';\n<acme-cta-button label=\"Save\"></acme-cta-button>",
    );
    expect(rw("import { Button } from './Button';\n<Button label=\"Save\" />", res, 'rn', 'Card.tsx')).toBe(
      "import { CtaButton } from './CtaButton';\n<CtaButton label=\"Save\" />",
    );
    expect(rw('Button(label: "Save") { }\nGallery.buttonScreen', res, 'swiftui', 'Card.swift')).toBe(
      'CtaButton(label: "Save") { }\nGallery.ctaButtonScreen',
    );
  });

  test("the platform type prefixes: SwiftUI's token enum, React Native's theme context", () => {
    const res = acme();
    expect(rw('import DesignSchemaTokens\nlet r: TokenRef = .spaceSm\n@Environment(\\.dsTheme) var theme: Theme', res, 'swiftui', 'Button.swift')).toBe(
      // `dsTheme` carries the namespace prefix already: it takes the new one, not a second one
      'import AcmeTokens\nlet r: AcmeTokenRef = .spaceSm\n@Environment(\\.acmeTheme) var theme: AcmeTheme',
    );
    expect(rw("import { useTheme } from './theme';\nconst t: ThemeMode = useTheme();", res, 'rn', 'Button.tsx')).toBe(
      "import { useAcmeTheme } from './theme';\nconst t: AcmeThemeMode = useAcmeTheme();",
    );
    expect(rw("import { useTheme } from './theme';", res, 'web', 'Button.tsx'), 'web has no type prefix').toBe(
      "import { useTheme } from './theme';",
    );
  });
});

describe('what a rename never touches', () => {
  test('the hooks the gates find a component through', () => {
    const res = acme();
    const before = [
      '<button data-ds="Button" data-part="leadingIcon" className="ds-button">',
      "this.setAttribute('data-ds', 'Button');",
      '<View testID="Button" accessibilityRole="button" />',
      '<Text testID="Button.label" />',
      "document.querySelector('[data-ds=\"Button\"]')",
      '<span part="leadingIcon" />',
      '::part(leadingIcon) { color: red; }',
      '.accessibilityIdentifier("Button.label")',
      "testID={isHeader ? 'Button.header' : 'Button.cell'}",
    ].join('\n');
    const after = rw(before, res, 'web', 'Button.tsx');
    expect(after).toBe(before.replace('className="ds-button"', 'className="acme-cta-button"'));
  });

  test('a binding imported from outside the system', () => {
    doc('text', '  components:\n    Text: Body\n    Switch: Toggle\n');
    const res = naming.resolve('text');
    const before = [
      "import { Text as RNText, Switch as RNSwitch, View } from 'react-native';",
      "import type { SwitchInstance, TextStyle } from 'react-native';",
      "import { Text } from './Text';",
      'const style: TextStyle = {};',
      'const ref = React.useRef<SwitchInstance>(null);',
      '<RNText>{label}</RNText>',
      '<Text>{label}</Text>',
    ].join('\n');
    expect(rw(before, res, 'rn', 'Switch.tsx')).toBe(
      [
        "import { Text as RNText, Switch as RNSwitch, View } from 'react-native';",
        "import type { SwitchInstance, TextStyle } from 'react-native';",
        "import { Body } from './Body';",
        'const style: TextStyle = {};',
        'const ref = React.useRef<SwitchInstance>(null);',
        '<RNText>{label}</RNText>',
        '<Body>{label}</Body>',
      ].join('\n'),
    );
  });

  test('a longer component name that merely starts with a renamed one', () => {
    doc('alert', '  components:\n    Alert: Callout\n');
    const res = naming.resolve('alert');
    const before = "import { AlertDialog, type AlertDialogProps } from './AlertDialog';\n.ds-alert-dialog {}\n<Alert /><AlertDialog />";
    expect(rw(before, res, 'web', 'AlertDialog.tsx')).toBe(
      "import { AlertDialog, type AlertDialogProps } from './AlertDialog';\n.ds-alert-dialog {}\n<Callout /><AlertDialog />",
    );
  });

  test('a kebab word that happens to contain a renamed prop', () => {
    doc('sizes', '  props:\n    size: scale\n    gap: spacing\n');
    const res = naming.resolve('sizes');
    expect(rw('font-size: var(--ds-button-font-size);\ngap: var(--space-gap);', res, 'web', 'Button.css')).toBe(
      'font-size: var(--ds-button-font-size);\ngap: var(--space-gap);',
    );
    expect(rw('const { size, gap } = props;', res, 'web', 'Stack.tsx')).toBe('const { scale, spacing } = props;');
  });

  test('the canonical schema words a doc says it leaves alone', () => {
    doc('tokens', '  namespace:\n    cssPrefix: acme\n  props:\n    variant: style\n');
    const res = naming.resolve('tokens');
    const before = "{ token: 'color.action.primary.background' }\nrole: 'button'\nanatomy: ['container', 'label']";
    expect(rw(before, res, 'web', 'Button.tsx')).toBe(before);
  });
});

describe('the two properties the design rests on', () => {
  test('an absent naming.md writes nothing at all', () => {
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    const before = readFileSync(join(src, 'Button.tsx'));
    const applied = naming.rename(src, naming.resolve(null), 'brand', 'web');
    expect(applied).toEqual({ edited: [], renames: [] });
    expect(readdirSync(src)).toEqual(['Button.tsx']);
    expect(readFileSync(join(src, 'Button.tsx')).equals(before)).toBe(true);
  });

  test('brand and canonical are exact inverses, and both are idempotent', () => {
    const res = acme();
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), "import './Button.css';\nexport const Button = ({ leadingIcon }: ButtonProps) => 'ds-button';\n");
    write(join(src, 'Button.css'), '.ds-button { --ds-button-radius: var(--radius-md); }\n');
    write(join(src, 'index.ts'), "export { Button } from './Button';\nexport { Card } from './Card';\n");
    write(join(src, 'custom', 'analytics.ts'), 'export const trackPress = (name: string) => name; // Button\n');
    const original = snapshot(src);

    const forward = naming.rename(src, res, 'brand', 'web');
    expect(forward.renames).toEqual([
      ['Button.css', 'CtaButton.css'],
      ['Button.tsx', 'CtaButton.tsx'],
    ]);
    expect(naming.rename(src, res, 'brand', 'web'), 'twice changes nothing').toEqual({ edited: [], renames: [] });
    expect(snapshot(src)['custom/analytics.ts'], 'custom/ is hand-written').toBe(original['custom/analytics.ts']);

    naming.rename(src, res, 'canonical', 'web');
    expect(snapshot(src)).toEqual(original);
  });

  test('a type prefix that matches the namespace prefix still reverses', () => {
    // `AcmeTheme` reads two ways — the prefixed `Theme`, or the namespace prefix on `Theme` — and a
    // brand's typePrefix usually is its cssPrefix capitalised, so the reverse has to prefer the type.
    const res = acme();
    const before = [
      "import { useTheme, ThemeProvider } from './theme';",
      'const t: ThemeMode = useTheme();',
      '@Environment(\\.dsTheme) var theme: Theme',
      'export class DsButton extends LitElement {}',
    ].join('\n');
    for (const platform of ['rn', 'swiftui', 'lit']) {
      const brand = rw(before, res, platform, 'theme.tsx');
      expect(rw(brand, res, platform, 'theme.tsx', 'canonical'), platform).toBe(before);
    }
  });

  test('the tree a generation hands the gates is the canonical one', () => {
    // What generate.ts does around the round loop, spelled out: normalize, gate, rename.
    const res = acme();
    const src = join(dir, 'src');
    write(join(src, 'CtaButton.tsx'), "export const CtaButton = ({ startIcon }: CtaButtonProps) => 'acme-cta-button';\n");
    naming.rename(src, res, 'canonical', 'web');
    expect(readdirSync(src)).toEqual(['Button.tsx']);
    expect(readFileSync(join(src, 'Button.tsx'), 'utf8')).toBe("export const Button = ({ leadingIcon }: ButtonProps) => 'ds-button';\n");
    naming.rename(src, res, 'brand', 'web');
    expect(readdirSync(src)).toEqual(['CtaButton.tsx']);
  });
});

/** Every file under a folder with its text, for a byte-for-byte comparison. */
function snapshot(dirPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of readdirSync(dirPath, { recursive: true })) {
    const rel = String(f).replaceAll('\\', '/');
    const full = join(dirPath, String(f));
    if (existsSync(full) && !readdirSync(dirPath).includes(`${rel}/`) && !isDir(full)) out[rel] = readFileSync(full, 'utf8');
  }
  return out;
}

function isDir(file: string): boolean {
  try {
    readdirSync(file);
    return true;
  } catch {
    return false;
  }
}

describe("the job's gate: the committed Button output, renamed", () => {
  /** The real generated files, copied into the sandbox — nothing here writes to packages/. */
  function sandbox(platform: string, files: string[], name: string = 'src'): string {
    const src = join(dir, name);
    mkdirSync(src, { recursive: true });
    for (const f of files) cpSync(join(sourceDir(REPO_ROOT, platform), f), join(src, f));
    return src;
  }

  test('CtaButton.tsx exports CtaButton, with --acme- custom properties', () => {
    const res = acme();
    const src = sandbox('web', ['Button.tsx', 'Button.css', 'Card.tsx', 'Card.css']);
    naming.rename(src, res, 'brand', 'web');
    expect(readdirSync(src).sort()).toEqual(['Card.css', 'Card.tsx', 'CtaButton.css', 'CtaButton.tsx']);
    const tsx = readFileSync(join(src, 'CtaButton.tsx'), 'utf8');
    // The regenerated React component is a function declaration, so the rename moves the declared name.
    expect(tsx).toContain('export function CtaButton(');
    expect(tsx).toContain('export interface CtaButtonProps');
    expect(tsx).toContain("import './CtaButton.css'");
    expect(tsx).toContain("import { cssVar, type TokenRef } from '@acme/tokens'");
    expect(tsx, 'the gate hook stays canonical').toContain('data-ds="Button"');
    expect(tsx, 'and so do the part hooks').toContain('data-part="leadingIcon"');
    const css = readFileSync(join(src, 'CtaButton.css'), 'utf8');
    expect(css).toContain('--acme-button-background:');
    expect(css).toContain('.acme-cta-button {');
    expect(css, 'no hook keeps the old prefix').not.toMatch(/--ds-/);
    expect(css, 'token custom properties are not ours to rename').toContain('var(--color-action-primary-background)');
  });

  test('a composite that renders a Button follows it', () => {
    const res = acme();
    const src = sandbox('web', ['Button.tsx', 'Button.css', 'Card.tsx', 'Card.css']);
    naming.rename(src, res, 'brand', 'web');
    const card = readFileSync(join(src, 'Card.tsx'), 'utf8');
    expect(card, 'Card names the component in its headerActions prose and its warning').toContain('CtaButton');
    expect(card).not.toMatch(/(?<![A-Za-z0-9_$-])Button(?![a-z0-9_$])/);
  });

  test("job 520's Nimbus fixture renames the same component under its own namespace", () => {
    const themes = naming.paths.THEMES;
    Object.assign(naming.paths, savedPaths);
    const res = naming.resolve('nimbus');
    Object.assign(naming.paths, { ROOT: dir, THEMES: themes, COMPONENTS: join(dir, 'components.json') });
    const src = sandbox('lit', ['Button.ts', 'Card.ts', 'ActionSheet.ts']);
    naming.rename(src, res, 'brand', 'lit');
    expect(readdirSync(src).sort()).toEqual(['ActionSheet.ts', 'Card.ts', 'CtaButton.ts']);
    const button = readFileSync(join(src, 'CtaButton.ts'), 'utf8');
    expect(button).toContain("@customElement('nimbus-cta-button')");
    expect(button).toContain('export class NimbusCtaButton extends LitElement');
    expect(button).toMatch(/--nimbus-button-background/);
    expect(button).toContain("this.setAttribute('data-ds', 'Button')");
    // Card names the tag in a selector, ActionSheet renders it: both follow the rename.
    const card = readFileSync(join(src, 'Card.ts'), 'utf8');
    expect(card).toContain("'nimbus-link, nimbus-cta-button, a[href], button'");
    const sheet = readFileSync(join(src, 'ActionSheet.ts'), 'utf8');
    expect(sheet).toContain("import './CtaButton.js'");
    expect(sheet).toContain('<nimbus-cta-button');
  });

  test("job 623: Nimbus renames each platform's emitted event and Button's trailingIcon part, and nothing that is the platform's own", () => {
    const themes = naming.paths.THEMES;
    Object.assign(naming.paths, savedPaths);
    const res = naming.resolve('nimbus');
    const index = naming.canonicalIndex();
    const notices = ['web', 'lit', 'rn'].flatMap((platform) => naming.notices(res, platform, index));
    Object.assign(naming.paths, { ROOT: dir, THEMES: themes, COMPONENTS: join(dir, 'components.json') });
    expect(notices.filter((n) => n.includes('Button.onPress')), 'the object form reaches every platform it lists').toEqual([]);

    const trees: Record<'web' | 'lit' | 'rn', string> = {
      web: sandbox('web', ['Button.tsx', 'Alert.tsx'], 'web'),
      lit: sandbox('lit', ['Button.ts', 'Alert.ts'], 'lit'),
      rn: sandbox('rn', ['Button.tsx'], 'rn'),
    };
    for (const [platform, src] of Object.entries(trees)) naming.rename(src, res, 'brand', platform);
    const read = (platform: keyof typeof trees, file: string): string => readFileSync(join(trees[platform], file), 'utf8');

    const webButton = read('web', 'CtaButton.tsx');
    expect(webButton).toContain('onActivate?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;');
    expect(webButton).toContain('onActivate?.(event);');
    expect(webButton, "the native <button>'s own handler").toMatch(/<button\s[^]*?onClick=\{handleClick\}/);
    const webCallout = read('web', 'Callout.tsx');
    expect(webCallout, 'the composite binds the brand name on the element').toContain('onActivate={handleDismiss}');
    expect(webCallout).not.toMatch(/\sonClick=/);
    expect(webCallout, 'the string form reaches web').toContain('onClose?.();');

    const litButton = read('lit', 'CtaButton.ts');
    expect(litButton).toMatch(/new CustomEvent<\w+>\('activate'/);
    expect(litButton).not.toMatch(/new CustomEvent<\w+>\('press'/);
    // The slot name moves; `part` and `data-part` are gate hooks and stay canonical — which the convention
    // spells as the anatomy name verbatim, so camelCase since the regeneration.
    expect(litButton, 'the part moves, its gate hooks do not').toContain('<slot name="end-icon" part="trailingIcon" data-part="trailingIcon"></slot>');
    // No `slot[name=…]` selector to check any more: the regenerated element styles slotted icons through the
    // part hooks instead, so the slot name appears only in the template line asserted above.
    expect(litButton).not.toContain("slot[name='trailing-icon']");
    const litCallout = read('lit', 'Callout.ts');
    expect(litCallout).toContain('@activate=${this.handleDismiss}');
    expect(litCallout).not.toContain('@press=');
    expect(litCallout, 'the string form reaches lit as its kebab name').toMatch(/new CustomEvent<\w+>\('close'/);

    const rnButton = read('rn', 'CtaButton.tsx');
    expect(rnButton).toContain('onActivate?: (() => void) | undefined;');
    expect(rnButton).toContain('onActivate?.();');
    expect(rnButton, "Pressable's own onPress").toMatch(/<Pressable\s[^]*?onPress=\{handlePress\}/);
    expect(rnButton, 'the prop that shares the part name keeps its name').toContain('trailingIcon?: React.ReactNode;');

    // brand → canonical → brand: the trip a fork's committed tree takes, byte for byte
    for (const [platform, src] of Object.entries(trees)) {
      const brand = snapshot(src);
      naming.rename(src, res, 'canonical', platform);
      naming.rename(src, res, 'brand', platform);
      expect(snapshot(src), platform).toEqual(brand);
    }
    // and the event and anatomy maps alone restore the committed files from canonical too: nothing they
    // rename is a word the canonical output already uses
    const mapsOnly: naming.Resolution = { ...res, components: {}, props: {}, typePrefix: {}, cssPrefix: 'ds', package: '@design-schema' };
    for (const [platform, files] of [['web', ['Button.tsx', 'Alert.tsx']], ['lit', ['Button.ts', 'Alert.ts']], ['rn', ['Button.tsx']]] as const) {
      const src = sandbox(platform, [...files], `${platform}-maps`);
      naming.rename(src, mapsOnly, 'brand', platform);
      expect(readFileSync(join(src, 'Button.' + (platform === 'lit' ? 'ts' : 'tsx')), 'utf8'), platform).not.toBe(
        readFileSync(join(sourceDir(REPO_ROOT, platform), 'Button.' + (platform === 'lit' ? 'ts' : 'tsx')), 'utf8'),
      );
      naming.rename(src, mapsOnly, 'canonical', platform);
      for (const f of files) expect(readFileSync(join(src, f)).equals(readFileSync(join(sourceDir(REPO_ROOT, platform), f))), `${platform} ${f}`).toBe(true);
    }
  });

  test('regenerating with no naming.md leaves the committed output byte-identical', () => {
    const src = sandbox('web', ['Button.tsx', 'Button.css']);
    const before = snapshot(src);
    naming.rename(src, naming.resolve(null), 'brand', 'web');
    expect(snapshot(src)).toEqual(before);
    for (const f of ['Button.tsx', 'Button.css']) {
      expect(readFileSync(join(src, f)).equals(readFileSync(join(REPO_ROOT, 'packages', 'react', 'src', f)))).toBe(true);
    }
  });

  test('the canonical docs and schema are never written to', () => {
    const docs = join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'components', 'button.md');
    const before = readFileSync(docs);
    const res = acme();
    naming.rename(sandbox('web', ['Button.tsx', 'Button.css']), res, 'brand', 'web');
    expect(readFileSync(docs).equals(before)).toBe(true);
    expect(readFileSync(join(REPO_ROOT, 'schema', 'component.ts'), 'utf8')).toContain('export const componentDef');
  });
});

describe('the command line', () => {
  test('--check writes nothing and reports what would change', () => {
    doc('acme', ACME);
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--dir', 'src', '--check'])).toBe(0);
    expect(std.out()).toContain('1 component(s), 1 prop(s), 0 event(s), 0 anatomy part(s), 0 value(s), 0 token rename(s), --acme- prefix');
    expect(std.out()).toContain('would change 1 file(s), 1 move(s)');
    expect(std.out()).toContain('Button.tsx → CtaButton.tsx');
    expect(readdirSync(src), 'a check writes nothing').toEqual(['Button.tsx']);
  });

  test('--apply then --revert', () => {
    doc('acme', ACME);
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--dir', 'src', '--apply'])).toBe(0);
    expect(readdirSync(src)).toEqual(['CtaButton.tsx']);
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--dir', 'src', '--revert'])).toBe(0);
    expect(readdirSync(src)).toEqual(['Button.tsx']);
  });

  test('a missing --naming, an unknown platform and --help', () => {
    expect(naming.main([])).toBe(2);
    expect(std.err()).toContain('--naming is required');
    doc('acme', ACME);
    expect(naming.main(['--naming', 'acme', '--platform', 'ios'])).toBe(2);
    expect(std.err()).toContain('unknown platform ios');
    expect(naming.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: naming.ts --naming BRAND|PATH');
  });

  test('a doc that renames nothing says so and stops', () => {
    doc('empty', '  components: {}\n');
    expect(naming.main(['--naming', 'empty'])).toBe(0);
    expect(std.out()).toContain('the doc renames nothing — no-op');
  });
});
