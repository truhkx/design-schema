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
  function sandbox(platform: string, files: string[]): string {
    const pkg = { web: 'react', lit: 'lit', rn: 'rn' }[platform] as string;
    const src = join(dir, 'src');
    mkdirSync(src, { recursive: true });
    for (const f of files) cpSync(join(REPO_ROOT, 'packages', pkg, 'src', f), join(src, f));
    return src;
  }

  test('CtaButton.tsx exports CtaButton, with --acme- custom properties', () => {
    const res = acme();
    const src = sandbox('web', ['Button.tsx', 'Button.css', 'Card.tsx', 'Card.css']);
    naming.rename(src, res, 'brand', 'web');
    expect(readdirSync(src).sort()).toEqual(['Card.css', 'Card.tsx', 'CtaButton.css', 'CtaButton.tsx']);
    const tsx = readFileSync(join(src, 'CtaButton.tsx'), 'utf8');
    expect(tsx).toContain('export const CtaButton = function CtaButton(');
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
    expect(std.out()).toContain('1 component(s), 1 prop(s), --acme- prefix');
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
