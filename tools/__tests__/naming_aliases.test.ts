/**
 * Job 627: naming `aliases`, and the compatibility layer tools/naming.ts writes from them into `naming-compat/`.
 *
 * What the schema refuses, what resolution refuses against components.json, the support matrix's empty cells, the
 * text each platform gets, the folder's ownership (a file without the marker stops a revert), and the round trip on
 * the committed Button: apply writes the folder, revert restores the canonical bytes with no folder, and a second
 * apply is byte for byte the first. Everything runs in a sandbox; packages/ is only ever read.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { namingDef } from '../../schema/naming.ts';
import { demoDir, sourceDir } from '../../schema/platforms.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as naming from '../naming.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();
const savedPaths = { ...naming.paths };

let dir = '';

/** A components.json with just enough to check alias keys against: an enum prop, an event, parts, a second component. */
const COMPONENTS = [
  {
    component: {
      name: 'Button',
      props: { label: { type: 'string' }, variant: { type: 'enum', values: ['primary', 'secondary', 'ghost', 'danger'] }, size: { type: 'enum', values: ['sm', 'md', 'lg'] }, leadingIcon: { type: 'content' } },
      events: { onPress: { platforms: { web: 'onClick', lit: 'press', rn: 'onPress' } } },
      anatomy: ['container', 'label', 'leadingIcon'],
    },
  },
  { component: { name: 'Alert', props: { tone: { type: 'enum', values: ['info', 'danger'] } }, events: { onDismiss: { platforms: { web: 'onDismiss', lit: 'dismiss', rn: 'onDismiss' } } }, anatomy: ['container'] } },
  { component: { name: 'Card', props: {}, anatomy: ['container'] } },
];

beforeEach(() => {
  dir = tmp();
  Object.assign(naming.paths, { ROOT: dir, THEMES: join(dir, 'themes'), COMPONENTS: join(dir, 'components.json') });
  write(naming.paths.COMPONENTS, JSON.stringify(COMPONENTS));
});

afterEach(() => {
  Object.assign(naming.paths, savedPaths);
});

/** A naming doc under themes/acme, resolved. */
function doc(frontmatter: string): naming.Resolution {
  write(join(naming.paths.THEMES, 'acme', 'naming.md'), `---\ntitle: acme\nnaming:\n${frontmatter}---\n\nProse.\n`);
  return naming.resolve('acme');
}

function expectNamingError(fn: () => unknown, pattern: string | RegExp): void {
  let caught: unknown;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  expect(caught, 'expected a NamingError').toBeInstanceOf(naming.NamingError);
  expect((caught as Error).message).toMatch(pattern);
}

/** One alias of each kind; the prop and value entries reach web and rn only, so every platform can be emitted. */
const RENAMES = `  namespace:
    cssPrefix: acme
  components:
    Button: CtaButton
  props:
    Button.variant: emphasis
`;

const ALL_KINDS = `${RENAMES}  aliases:
    components:
      Button:
        - name: ActionButton
          since: '2.0.0'
    props:
      Button.variant:
        - name: kind
          since: '2.0.0'
          platforms: [web, rn]
    values:
      Button.variant:
        primary:
          - name: cta
            since: '2.0.0'
            platforms: [web, rn]
`;

/** A doc with a single alias under `aliases:`, written as YAML. */
function oneAlias(map: string, renames: string = RENAMES): string {
  return `${renames}  aliases:\n${map}`;
}

/** Every file under a folder with its bytes, keyed by forward-slash path. */
function snapshot(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (at: string): void => {
    for (const name of readdirSync(at).sort()) {
      const full = join(at, name);
      if (statSync(full).isDirectory()) walk(full);
      else out[relative(root, full).replaceAll('\\', '/')] = readFileSync(full).toString('base64');
    }
  };
  walk(root);
  return out;
}

describe('what the schema refuses', () => {
  const issues = (value: unknown): string[][] => {
    const r = namingDef.safeParse(value);
    return r.success ? [] : r.error.issues.map((i) => [i.path.join('.'), i.message]);
  };

  test('an alias equal to the current name it aliases: the brand name where the doc renames it, the canonical name otherwise', () => {
    expect(issues({ aliases: { components: { Button: [{ name: 'Button' }] } } })).toEqual([
      ['aliases.components.Button.0.name', 'aliases.components.Button[0] is Button, which is already the current name it aliases'],
    ]);
    expect(issues({ components: { Button: 'CtaButton' }, aliases: { components: { Button: [{ name: 'CtaButton' }] } } })).toEqual([
      ['aliases.components.Button.0.name', 'aliases.components.Button[0] is CtaButton, which is already the current name it aliases'],
    ]);
    expect(issues({ props: { 'Button.variant': 'emphasis' }, aliases: { props: { 'Button.variant': [{ name: 'emphasis' }] } } })).toEqual([
      ['aliases.props.Button.variant.0.name', 'aliases.props.Button.variant[0] is emphasis, which is already the current name it aliases'],
    ]);
    expect(issues({ props: { variant: 'emphasis' }, aliases: { props: { 'Button.variant': [{ name: 'emphasis' }] } } }), 'a bare rename reaches a dotted alias').toHaveLength(1);
    expect(issues({ aliases: { values: { 'Button.variant': { primary: [{ name: 'primary' }] } } } })).toEqual([
      ['aliases.values.Button.variant.primary.0.name', 'aliases.values.Button.variant.primary[0] is primary, which is already the current name it aliases'],
    ]);
    expect(issues({ values: { 'Button.variant': { primary: 'cta' } }, aliases: { values: { 'Button.variant': { primary: [{ name: 'cta' }] } } } })).toHaveLength(1);
    expect(issues({ components: { Button: 'CtaButton' }, aliases: { components: { Button: [{ name: 'ActionButton' }] } } }), 'the old spelling is fine').toEqual([]);
  });

  test('two entries with one name in one scope', () => {
    expect(issues({ aliases: { components: { Button: [{ name: 'Action' }], Link: [{ name: 'Action' }] } } }), 'all component aliases are one scope').toEqual([
      ['aliases.components.Link.0.name', 'aliases.components.Link[0] and aliases.components.Button[0] are both called Action'],
    ]);
    expect(issues({ aliases: { props: { 'Button.variant': [{ name: 'kind' }], 'Button.size': [{ name: 'kind' }] } } }), 'prop aliases are scoped per component').toEqual([
      ['aliases.props.Button.size.0.name', 'aliases.props.Button.size[0] and aliases.props.Button.variant[0] are both called kind'],
    ]);
    expect(issues({ aliases: { props: { 'Button.variant': [{ name: 'kind' }], 'Alert.tone': [{ name: 'kind' }] } } })).toEqual([]);
    expect(issues({ aliases: { values: { 'Button.variant': { primary: [{ name: 'cta' }], secondary: [{ name: 'cta' }] } } } }), 'value aliases are scoped per prop').toEqual([
      ['aliases.values.Button.variant.secondary.0.name', 'aliases.values.Button.variant.secondary[0] and aliases.values.Button.variant.primary[0] are both called cta'],
    ]);
    expect(issues({ aliases: { values: { 'Button.variant': { primary: [{ name: 'cta' }] }, 'Alert.tone': { info: [{ name: 'cta' }] } } } })).toEqual([]);
  });

  test("an entry is strict, its name is spelled for its kind, and since, deprecated and platforms are 624's", () => {
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'actionButton' }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { props: { 'Button.variant': [{ name: 'Kind' }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { values: { 'Button.variant': { primary: [{ name: 'call to action' }] } } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', since: 'v2' }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', deprecated: 'old' }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', platforms: [] }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', platforms: ['ios'] }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', label: 'x' }] } } }).success).toBe(false);
    expect(namingDef.safeParse({ aliases: { tokens: {} } }).success).toBe(false);
    expect(
      namingDef.safeParse({ aliases: { components: { Button: [{ name: 'ActionButton', since: '2.0.0', deprecated: { reason: 'Renamed.', since: '2.0.0' }, platforms: ['web', 'swiftui'] }] } } }).success,
    ).toBe(true);
    expect(namingDef.parse({}).aliases, 'optional, and defaults to {}').toEqual({});
  });
});

describe('what resolution refuses against components.json', () => {
  test('a key that names no component, prop or value is a stranded key', () => {
    expectNamingError(() => doc(oneAlias('    components:\n      Nope: [{ name: Old }]\n')), 'aliases.components.Nope: no canonical component is called Nope');
    expectNamingError(() => doc(oneAlias('    props:\n      Button.nope: [{ name: old }]\n')), 'aliases.props.Button.nope: Button has no prop called nope');
    expectNamingError(() => doc(oneAlias('    props:\n      Button.onPress: [{ name: onGo }]\n')), 'aliases.props.Button.onPress: Button has no prop called onPress');
    expectNamingError(() => doc(oneAlias('    props:\n      nope: [{ name: old }]\n')), 'aliases.props.nope: no component has a prop called nope');
    expectNamingError(() => doc(oneAlias('    props:\n      Nope.variant: [{ name: old }]\n')), 'aliases.props.Nope.variant: no canonical component is called Nope');
    expectNamingError(() => doc(oneAlias('    values:\n      Button.variant:\n        nope: [{ name: old }]\n')), 'aliases.values.Button.variant.nope: Button.variant has no value nope');
    expectNamingError(() => doc(oneAlias('    values:\n      Button.label:\n        x: [{ name: y }]\n')), 'aliases.values.Button.label: Button.label is not an enum prop');
    expectNamingError(() => doc(oneAlias('    values:\n      tone:\n        nope: [{ name: old }]\n')), 'aliases.values.tone.nope: no enum prop called tone has a value nope');
  });

  test('a component alias equal to any canonical or brand component name', () => {
    expectNamingError(() => doc(oneAlias('    components:\n      Button: [{ name: Card }]\n')), 'aliases.components.Button[0] (Card) is already a component name, canonical or brand');
    const renames = RENAMES.replace('    Button: CtaButton\n', '    Button: CtaButton\n    Alert: Callout\n');
    expectNamingError(() => doc(oneAlias('    components:\n      Button: [{ name: Callout }]\n', renames)), 'aliases.components.Button[0] (Callout) is already a component name');
  });

  test("a prop alias equal to one of the component's props, events or parts, canonical or brand, or a reserved prop", () => {
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: size }]\n')), 'aliases.props.Button.variant[0] (size) is already a prop, event or anatomy part of Button');
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: onPress }]\n')), '(onPress) is already a prop, event or anatomy part of Button');
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: container }]\n')), '(container) is already a prop, event or anatomy part of Button');
    const brandProp = `${RENAMES}    Button.leadingIcon: startIcon\n`;
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: startIcon }]\n', brandProp)), '(startIcon) is already the brand name of Button.leadingIcon');
    const brandEvent = `${RENAMES}  events:\n    Button.onPress:\n      web: onActivate\n`;
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: onActivate }]\n', brandEvent)), "(onActivate) is already the brand name of Button's onClick event");
    const brandPart = `${RENAMES}  anatomy:\n    Button.label: text\n`;
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: text }]\n', brandPart)), "(text) is already the brand name of Button's label part");
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: className }]\n')), '(className) is already a reserved prop name (RESERVED_WEB, RESERVED_RN)');
    expectNamingError(() => doc(oneAlias('    props:\n      Button.variant: [{ name: testID }]\n')), '(testID) is already a reserved prop name');
  });

  test('a value alias equal to any value of that prop, canonical or brand', () => {
    expectNamingError(() => doc(oneAlias('    values:\n      Button.variant:\n        primary: [{ name: ghost }]\n')), 'aliases.values.Button.variant.primary[0] (ghost) is already a value of Button.variant, canonical or brand');
    const brandValue = `${RENAMES}  values:\n    Button.variant:\n      danger: destructive\n`;
    expectNamingError(() => doc(oneAlias('    values:\n      Button.variant:\n        primary: [{ name: destructive }]\n', brandValue)), '(destructive) is already a value of Button.variant');
  });

  test('a doc that only adds aliases still runs the step, and resolves each alias to current names', () => {
    const res = doc('  aliases:\n    props:\n      variant: [{ name: kind }]\n');
    expect(naming.isNoop(res)).toBe(false);
    expect(res.aliases).toEqual({
      Button: { current: 'Button', components: [], props: [{ prop: 'variant', current: 'variant', aliases: [{ label: 'aliases.props.variant[0]', entry: { name: 'kind' } }] }], values: [] },
    });
    expect(naming.isNoop(doc('  aliases: {}\n'))).toBe(true);
  });
});

describe('the support matrix', () => {
  const unscoped = (map: string): naming.Resolution => doc(oneAlias(map));
  const PROP = '    props:\n      Button.variant:\n        - name: kind\n          since: 2.0.0\n';
  const VALUE = '    values:\n      Button.variant:\n        primary:\n          - name: cta\n            since: 2.0.0\n';

  test('a prop alias on lit', () => {
    expectNamingError(
      () => naming.compatFiles(unscoped(PROP), 'lit'),
      '✖ themes/acme/naming.md: aliases.props.Button.variant[0] (kind): prop aliases are not supported on lit — the compatibility layer cannot add an attribute to a generated element without editing it. Add platforms: [web, rn] to the entry.',
    );
  });

  test('a prop alias on swiftui', () => {
    expectNamingError(() => naming.compatFiles(unscoped(PROP), 'swiftui'), "prop aliases are not supported on swiftui — the compatibility layer cannot add an argument to a generated view's initializer without editing it. Add platforms: [web, rn] to the entry.");
  });

  test('a value alias on lit', () => {
    expectNamingError(() => naming.compatFiles(unscoped(VALUE), 'lit'), 'aliases.values.Button.variant.primary[0] (cta): value aliases are not supported on lit — ');
  });

  test('a value alias on swiftui', () => {
    expectNamingError(() => naming.compatFiles(unscoped(VALUE), 'swiftui'), 'aliases.values.Button.variant.primary[0] (cta): value aliases are not supported on swiftui — the compatibility layer cannot add a case to a generated enum without editing it. Add platforms: [web, rn] to the entry.');
  });

  test('the refusal comes before a single file moves, and platforms lifts it', () => {
    const src = join(dir, 'lit');
    write(join(src, 'Button.ts'), 'export class AcmeButton {}\n');
    expectNamingError(() => naming.rename(src, unscoped(PROP), 'brand', 'lit'), 'prop aliases are not supported on lit');
    expect(readdirSync(src)).toEqual(['Button.ts']);
    const scoped = doc(oneAlias(`${PROP}          platforms: [web, rn]\n`));
    expect(naming.rename(src, scoped, 'brand', 'lit').compat).toBeUndefined();
    expect(readdirSync(src)).toEqual(['CtaButton.ts']);
  });
});

describe('what each platform gets', () => {
  test('web: a wrapper, the dev guard the package uses, extensionless imports, @deprecated with since', () => {
    const files = naming.compatFiles(doc(ALL_KINDS), 'web');
    expect(Object.keys(files).sort()).toEqual(['CtaButton.ts', 'index.ts']);
    const text = files['CtaButton.ts'] as string;
    expect(text.split('\n')[0]).toBe('// Generated by tools/naming.ts from themes/acme/naming.md (aliases). Do not edit; --revert deletes this folder.');
    expect(text).toContain("import { CtaButton as CtaButtonBase } from '../CtaButton';");
    expect(text).toContain("const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';");
    expect(text).toContain('if (!isDev || warned.has(key)) return;');
    // component
    expect(text).toContain('/** @deprecated since 2.0.0; use `CtaButton`. */\nexport const ActionButton: typeof CtaButton = CtaButton;');
    expect(text).toContain('export type ActionButtonProps = CtaButtonProps;');
    // prop
    expect(text).toContain('  /** @deprecated since 2.0.0; use `emphasis`. */\n  kind?: EmphasisValue | \'cta\' | undefined;');
    expect(text).toContain("if (kindValue !== undefined) warnOnce('kind', 'CtaButton: `kind` is deprecated since 2.0.0; use `emphasis`.');");
    expect(text, 'an explicitly passed current prop wins').toContain('const emphasisChosen = emphasisValue ?? kindValue;');
    // value
    expect(text).toContain("if (emphasisChosen === 'cta') warnOnce('emphasis=cta', 'CtaButton: `cta` is deprecated since 2.0.0; use `primary`.');");
    expect(text).toContain("if (emphasisChosen !== undefined) props.emphasis = emphasisChosen === 'cta' ? 'primary' : emphasisChosen;");
    expect(text).toContain('export function CtaButton({ emphasis: emphasisValue, kind: kindValue, ...rest }: CtaButtonProps): ReactElement {');
    expect(text.match(/^export /gm)?.length, 'every export').toBe(4);
    expect(text.match(/@deprecated since 2\.0\.0/g)?.length, 'carries @deprecated with since').toBeGreaterThanOrEqual(4);
    expect(files['index.ts']).toBe("// Generated by tools/naming.ts from themes/acme/naming.md (aliases). Do not edit; --revert deletes this folder.\nexport * from './CtaButton';\n");
  });

  test("rn: the same wrapper under React Native's __DEV__ and its element type", () => {
    const text = naming.compatFiles(doc(ALL_KINDS), 'rn')['CtaButton.ts'] as string;
    expect(text).toContain("import * as React from 'react';\nimport { CtaButton as CtaButtonBase } from '../CtaButton';");
    expect(text).toContain('if (!__DEV__ || warned.has(key)) return;');
    expect(text).not.toContain('isDev');
    expect(text).toContain('type CtaButtonBaseProps = React.ComponentProps<typeof CtaButtonBase>;');
    expect(text).toContain('}: CtaButtonProps): React.JSX.Element {');
    expect(text).toContain('return React.createElement(CtaButtonBase, props);');
    expect(text).toContain('/** @deprecated since 2.0.0; use `emphasis`. */');
    expect(text).toContain("warnOnce('emphasis=cta', 'CtaButton: `cta` is deprecated since 2.0.0; use `primary`.')");
  });

  test('lit: a registered subclass under the old tag, with a .js import and a warning on connect', () => {
    const files = naming.compatFiles(doc(ALL_KINDS), 'lit');
    expect(Object.keys(files).sort()).toEqual(['CtaButton.ts', 'index.ts']);
    const text = files['CtaButton.ts'] as string;
    expect(text).toContain("import { AcmeCtaButton } from '../CtaButton.js';");
    expect(text).toContain(' * @deprecated since 2.0.0; use `<acme-cta-button>` (AcmeCtaButton).\n */\nexport class AcmeActionButton extends AcmeCtaButton {');
    expect(text).toContain('  override connectedCallback(): void {\n    super.connectedCallback();\n    if (import.meta.env.DEV && !warnedActionButton) {');
    expect(text).toContain("console.warn('CtaButton: `<acme-action-button>` is deprecated since 2.0.0; use `<acme-cta-button>`.', this);");
    expect(text).toContain("if (!customElements.get('acme-action-button')) customElements.define('acme-action-button', AcmeActionButton);");
    expect(text).toContain("'acme-action-button': AcmeActionButton;");
    expect(text, 'no prop or value wrapper on lit').not.toContain('kind');
    expect(files['index.ts']).toContain("export * from './CtaButton.js';");
  });

  test('swiftui: a deprecated typealias, and no barrel', () => {
    const files = naming.compatFiles(doc(ALL_KINDS), 'swiftui');
    expect(Object.keys(files)).toEqual(['CtaButton.swift']);
    expect(files['CtaButton.swift']).toBe(
      '// Generated by tools/naming.ts from themes/acme/naming.md (aliases). Do not edit; --revert deletes this folder.\n' +
        '/// `ActionButton`, the old name of `CtaButton`, kept working by themes/acme/naming.md: deprecated since 2.0.0.\n' +
        '@available(*, deprecated, renamed: "CtaButton") public typealias ActionButton = CtaButton\n',
    );
  });

  test("624's deprecation reason is appended; a component alias alone is a const and a props type, no wrapper", () => {
    const res = doc(oneAlias("    components:\n      Button:\n        - name: ActionButton\n          deprecated:\n            reason: Renamed in the v3 audit.\n            since: '2.1.0'\n"));
    const web = naming.compatFiles(res, 'web')['CtaButton.ts'] as string;
    expect(web).toBe(
      '// Generated by tools/naming.ts from themes/acme/naming.md (aliases). Do not edit; --revert deletes this folder.\n' +
        "import type { ComponentProps } from 'react';\n" +
        "import { CtaButton } from '../CtaButton';\n" +
        '\n' +
        '/** @deprecated since 2.1.0; use `CtaButton`. Renamed in the v3 audit. */\n' +
        'export const ActionButton: typeof CtaButton = CtaButton;\n' +
        "/** @deprecated since 2.1.0; use `CtaButton`'s props. Renamed in the v3 audit. */\n" +
        'export type ActionButtonProps = ComponentProps<typeof CtaButton>;\n',
    );
    expect(naming.compatFiles(res, 'lit')['CtaButton.ts']).toContain("is deprecated since 2.1.0; use `<acme-cta-button>`. Renamed in the v3 audit.', this);");
    const prop = doc(oneAlias('    props:\n      Button.size:\n        - name: scale\n          deprecated:\n            reason: Sizes are scales now.\n'));
    const text = naming.compatFiles(prop, 'rn')['CtaButton.ts'] as string;
    expect(text).toContain("warnOnce('scale', 'CtaButton: `scale` is deprecated; use `size`. Sizes are scales now.');");
    expect(text, 'a prop with no value alias is not widened').toContain("export type CtaButtonProps = CtaButtonBaseProps & {\n  /** @deprecated use `size`. Sizes are scales now. */\n  scale?: CtaButtonBaseProps['size'];\n};");
  });

  test('a component whose module is not in the folder gets no compat module', () => {
    expect(naming.compatFiles(doc(ALL_KINDS), 'web', new Set(['Card.tsx']))).toEqual({});
    expect(Object.keys(naming.compatFiles(doc(ALL_KINDS), 'web', new Set(['CtaButton.tsx'])))).toEqual(['CtaButton.ts', 'index.ts']);
  });
});

describe('the folder the codemod owns', () => {
  test('a doc without aliases writes no folder, and the output is byte-identical to a rename without the layer', () => {
    const res = doc(RENAMES);
    const withLayer = join(dir, 'with');
    const without = join(dir, 'without');
    for (const src of [withLayer, without]) write(join(src, 'Button.tsx'), "export const Button = ({ variant }: ButtonProps) => 'ds-button';\n");
    const applied = naming.rename(withLayer, res, 'brand', 'web');
    naming.rename(without, res, 'brand', 'web', false, { compat: false });
    expect(applied).toEqual({ edited: ['Button.tsx'], renames: [['Button.tsx', 'CtaButton.tsx']] });
    expect(Object.hasOwn(applied, 'compat')).toBe(false);
    expect(existsSync(join(withLayer, naming.COMPAT_DIR))).toBe(false);
    expect(snapshot(withLayer)).toEqual(snapshot(without));
  });

  test('a file in naming-compat/ without the marker refuses the revert, and the apply, and nothing is deleted', () => {
    const res = doc(ALL_KINDS);
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    expect(naming.rename(src, res, 'brand', 'web').compat).toEqual(['naming-compat/CtaButton.ts', 'naming-compat/index.ts']);
    write(join(src, naming.COMPAT_DIR, 'Mine.ts'), 'export const mine = 1;\n');
    const before = snapshot(src);
    expectNamingError(() => naming.rename(src, res, 'canonical', 'web'), 'naming-compat/Mine.ts does not start with the "// Generated by tools/naming.ts" marker');
    expectNamingError(() => naming.rename(src, res, 'brand', 'web'), 'never deletes a hand-written file');
    expect(snapshot(src)).toEqual(before);
  });

  test('a dry run lists what it would write or delete, and rewrites never read the folder', () => {
    const res = doc(ALL_KINDS);
    const src = join(dir, 'src');
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    expect(naming.rename(src, res, 'brand', 'web', true)).toEqual({ edited: ['Button.tsx'], renames: [['Button.tsx', 'CtaButton.tsx']], compat: ['naming-compat/CtaButton.ts', 'naming-compat/index.ts'] });
    expect(readdirSync(src)).toEqual(['Button.tsx']);
    naming.rename(src, res, 'brand', 'web');
    const layer = readFileSync(join(src, naming.COMPAT_DIR, 'CtaButton.ts'), 'utf8');
    expect(naming.rename(src, res, 'canonical', 'web', true).compat).toEqual(['naming-compat/CtaButton.ts', 'naming-compat/index.ts']);
    expect(readFileSync(join(src, naming.COMPAT_DIR, 'CtaButton.ts'), 'utf8'), 'the dry run deleted nothing, and the revert did not rewrite it either').toBe(layer);
    expect(naming.rename(src, res, 'canonical', 'web', false, { compat: false }).compat).toBeUndefined();
    expect(existsSync(join(src, naming.COMPAT_DIR)), 'compat: false leaves the folder alone').toBe(true);
    expect(readFileSync(join(src, naming.COMPAT_DIR, 'CtaButton.ts'), 'utf8')).toBe(layer);
  });

  test('the command line lists compat files, and writes them into the package source and never the demo pages', () => {
    doc(ALL_KINDS);
    const src = sourceDir(dir, 'web');
    const demo = demoDir(dir, 'web') as string;
    write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
    write(join(demo, 'Button.tsx'), 'export const Button = () => null;\n');
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--check'])).toBe(0);
    expect(std.out()).toContain('would change 1 file(s), 1 move(s), would write 2 compat file(s)\n      Button.tsx → CtaButton.tsx\n      + naming-compat/CtaButton.ts\n      + naming-compat/index.ts\n');
    expect(existsSync(join(src, naming.COMPAT_DIR))).toBe(false);
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--apply'])).toBe(0);
    expect(readdirSync(join(src, naming.COMPAT_DIR))).toEqual(['CtaButton.ts', 'index.ts']);
    expect(readdirSync(demo)).toEqual(['CtaButton.tsx']);
    expect(naming.main(['--naming', 'acme', '--platform', 'web', '--revert'])).toBe(0);
    expect(std.out()).toContain('deleted 2 compat file(s)');
    expect(std.out()).toContain('      - naming-compat/index.ts\n');
    expect(readdirSync(src)).toEqual(['Button.tsx']);
  });
});

describe('the round trip, on the committed Button', () => {
  test('apply writes naming-compat/, revert restores the canonical bytes with no folder, and a second apply is the first', () => {
    // The real components.json, so the aliases are checked against the real Button.
    Object.assign(naming.paths, { COMPONENTS: savedPaths.COMPONENTS });
    const res = doc(`  components:
    Button: CtaButton
  props:
    Button.variant: treatment
  aliases:
    components:
      Button: [{ name: ActionButton, since: '2.0.0' }]
    props:
      Button.variant: [{ name: kind, since: '2.0.0' }]
    values:
      Button.variant:
        primary: [{ name: cta, since: '2.0.0' }]
`);
    const files = ['Button.tsx', 'Button.css', 'Button.stories.tsx'];
    const src = join(dir, 'src');
    mkdirSync(src, { recursive: true });
    for (const f of files) cpSync(join(sourceDir(REPO_ROOT, 'web'), f), join(src, f));

    const first = naming.rename(src, res, 'brand', 'web');
    expect(first.compat).toEqual(['naming-compat/CtaButton.ts', 'naming-compat/index.ts']);
    expect(existsSync(join(src, naming.COMPAT_DIR, 'CtaButton.ts'))).toBe(true);
    const applied = snapshot(src);
    expect(Object.keys(applied)).toEqual(['CtaButton.css', 'CtaButton.stories.tsx', 'CtaButton.tsx', 'naming-compat/CtaButton.ts', 'naming-compat/index.ts']);

    expect(naming.rename(src, res, 'canonical', 'web').compat).toEqual(['naming-compat/CtaButton.ts', 'naming-compat/index.ts']);
    expect(existsSync(join(src, naming.COMPAT_DIR))).toBe(false);
    expect(readdirSync(src).sort()).toEqual([...files].sort());
    for (const f of files) expect(readFileSync(join(src, f)).equals(readFileSync(join(sourceDir(REPO_ROOT, 'web'), f))), f).toBe(true);

    naming.rename(src, res, 'brand', 'web');
    expect(snapshot(src)).toEqual(applied);
  });
});

// A write the fixtures helper does not cover: a compat file carrying the marker is replaced, not refused.
test('a previous copy whose files all carry the marker is replaced, stale modules included', () => {
  const res = doc(ALL_KINDS);
  const src = join(dir, 'src');
  write(join(src, 'Button.tsx'), 'export const Button = () => null;\n');
  mkdirSync(join(src, naming.COMPAT_DIR), { recursive: true });
  writeFileSync(join(src, naming.COMPAT_DIR, 'Gone.ts'), `${naming.compatMarker('themes/old/naming.md')}\nexport const Gone = 1;\n`);
  naming.rename(src, res, 'brand', 'web');
  expect(readdirSync(join(src, naming.COMPAT_DIR))).toEqual(['CtaButton.ts', 'index.ts']);
});
