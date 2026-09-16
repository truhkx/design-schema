/** schema/naming.ts is the single source of truth for a brand's renames: tools/schema.ts derives
 *  schema/naming.schema.json from it, and every themes/<brand>/naming.md parses against it. An omitted
 *  naming.md — the default, unrenamed case — must stay a no-op, so `{}` parses to all defaults. */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { enumValueName, namingDefaults, namingDef, namingFrontmatter, TYPE_PREFIX_PLATFORMS } from '../../schema/naming.ts';
import { readText } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { splitFrontmatter } from '../parse.ts';
import { namingJsonSchema, NAMING_SCHEMA_FILE, renderNamingSchema } from '../schema.ts';

const THEMES = join(REPO_ROOT, 'themes');

/** Every themes/<brand>/naming.md in the tree; the Nimbus fixture is the one committed today. */
function namingDocs(): string[] {
  if (!existsSync(THEMES)) return [];
  return readdirSync(THEMES)
    .map((brand) => join(THEMES, brand, 'naming.md'))
    .filter((file) => existsSync(file) && statSync(file).isFile());
}

describe('derived JSON schema', () => {
  test('the committed naming.schema.json is current', () => {
    expect(existsSync(NAMING_SCHEMA_FILE)).toBe(true);
    expect(readText(NAMING_SCHEMA_FILE), 'run node tools/schema.ts').toBe(renderNamingSchema());
  });

  test('describes the optional keys', () => {
    const schema = namingJsonSchema();
    expect(schema.$id).toBe('https://design-schema.dev/schema/naming.schema.json');
    const defs = schema.$defs as Record<string, Record<string, unknown>>;
    expect(Object.keys(defs.namingDef!.properties as object)).toEqual(['namespace', 'components', 'props', 'events', 'anatomy', 'values', 'aliases', 'tokens']);
    expect(defs.namingDef!.required, 'every key is optional').toBeUndefined();
    expect(defs.namingDef!.additionalProperties).toBe(false);
    expect(Object.keys(defs.namespaceDef!.properties as object)).toEqual(['package', 'cssPrefix', 'typePrefix']);
    expect(schema, 'title/description ride alongside naming').not.toHaveProperty('additionalProperties');
  });
});

describe('the unrenamed case', () => {
  test('an empty naming block parses to all defaults', () => {
    expect(namingDef.parse({})).toEqual({
      namespace: { package: '@design-schema', cssPrefix: 'ds', typePrefix: {} },
      components: {},
      props: {},
      events: {},
      anatomy: {},
      values: {},
      aliases: {},
      tokens: {},
    });
  });

  test('a doc with no naming block at all is valid, and defaults the same way', () => {
    const r = namingFrontmatter.safeParse({ title: 'Some brand' });
    expect(r.success).toBe(true);
    expect(r.data?.naming).toEqual(namingDefaults());
  });

  test('the defaults rename nothing', () => {
    const d = namingDefaults();
    expect(d.components).toEqual({});
    expect(d.props).toEqual({});
    expect(d.events).toEqual({});
    expect(d.anatomy).toEqual({});
    expect(d.values).toEqual({});
    expect(d.namespace.typePrefix).toEqual({});
    expect(d.namespace.package).toBe('@design-schema');
    expect(d.namespace.cssPrefix).toBe('ds');
  });
});

describe('themes/<brand>/naming.md', () => {
  test('the Nimbus fixture exists', () => {
    expect(namingDocs().map((f) => f.replaceAll('\\', '/'))).toContain(`${REPO_ROOT.replaceAll('\\', '/')}/themes/nimbus/naming.md`);
  });

  test.each(namingDocs())('%s parses against schema/naming.ts', (file) => {
    const [fm] = splitFrontmatter(readText(file), file);
    const r = namingFrontmatter.safeParse(fm);
    expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([]);
  });

  test('the fixture round-trips every key', () => {
    const [fm] = splitFrontmatter(readText(join(THEMES, 'nimbus', 'naming.md')), 'nimbus');
    const { naming } = namingFrontmatter.parse(fm);
    expect(naming.namespace).toEqual({ package: '@nimbus', cssPrefix: 'nimbus', typePrefix: { swiftui: 'Nimbus', rn: 'Nimbus' } });
    expect(naming.components.Button).toBe('CtaButton');
    expect(naming.props.tone, 'a bare key renames the prop everywhere').toBe('sentiment');
    expect(naming.props['Alert.tone'], 'a dotted key scopes the rename to one component').toBe('severity');
    expect(naming.events, 'both event forms: exact names per platform, and a neutral name').toEqual({
      'Button.onPress': { web: 'onActivate', lit: 'activate', rn: 'onActivate' },
      'Alert.onDismiss': 'onClose',
    });
    expect(naming.anatomy, 'a part renamed apart from the prop of the same name').toEqual({ 'Button.trailingIcon': 'endIcon' });
    expect(naming.props['Button.trailingIcon']).toBeUndefined();
    expect(naming.tokens, 'a token prefix shared with the namespace, and one token on a brand path').toEqual({
      cssPrefix: 'nimbus',
      rename: { 'color.action.primary.background': 'color.brand.primary' },
    });
    expect(naming.values, 'values in both scopes, keyed by the canonical prop').toEqual({
      'Button.variant': { danger: 'destructive' },
      tone: { danger: 'critical' },
      'Alert.tone': { info: 'notice' },
    });
    expect(naming.aliases, 'all three alias maps, keyed canonically, one entry per platform list').toEqual({
      components: { Disclosure: [{ name: 'Collapsible', since: '3.0.0', platforms: ['web', 'rn', 'swiftui'] }] },
      props: { 'Alert.tone': [{ name: 'level', since: '3.0.0', platforms: ['web', 'rn'], deprecated: { reason: "Nimbus 2 called an alert's severity its level." } }] },
      values: { 'Button.variant': { danger: [{ name: 'negative', since: '3.0.0', platforms: ['web', 'rn'] }] } },
    });
  });
});

describe('what the schema rejects', () => {
  test('an unknown key', () => {
    const r = namingDef.safeParse({ tokens: { 'color.action.primary.background': 'brand' } });
    expect(r.success).toBe(false);
  });

  test('a component rename that is not a type name', () => {
    const r = namingDef.safeParse({ components: { Button: 'cta-button' } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path.join('.')).toBe('components.Button');
  });

  test('a prop key scoped to something that is not a component', () => {
    expect(namingDef.safeParse({ props: { 'button.variant': 'style' } }).success).toBe(false);
    expect(namingDef.safeParse({ props: { 'Button.variant': 'style' } }).success).toBe(true);
  });

  test('a namespace prefix carrying the punctuation the generator adds', () => {
    expect(namingDef.safeParse({ namespace: { cssPrefix: '--acme-' } }).success).toBe(false);
    expect(namingDef.safeParse({ namespace: { package: 'acme' } }).success).toBe(false);
    expect(namingDef.safeParse({ namespace: { package: '@acme', cssPrefix: 'acme' } }).success).toBe(true);
  });

  test('a type prefix for a platform that does not exist', () => {
    expect(namingDef.safeParse({ namespace: { typePrefix: { ios: 'Acme' } } }).success).toBe(false);
    expect(namingDef.safeParse({ namespace: { typePrefix: { swiftui: 'Acme' } } }).success).toBe(true);
  });

  test('a type prefix for a platform without prefixed type names still parses (tools/naming.ts says it renames nothing)', () => {
    expect(TYPE_PREFIX_PLATFORMS).toEqual(['rn', 'swiftui']);
    expect(namingDef.safeParse({ namespace: { typePrefix: { web: 'Acme' } } }).success).toBe(true);
  });

  test('an event rename for SwiftUI', () => {
    const r = namingDef.safeParse({ events: { 'Button.onPress': { web: 'onActivate', swiftui: 'activate' } } });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([
      ['events.Button.onPress.swiftui', "event renames reach web, lit and rn; SwiftUI's emitted names are argument labels the rename cannot scope yet"],
    ]);
  });

  test('an emitted name in the wrong spelling for its platform, or a neutral name that is not one', () => {
    const lit = namingDef.safeParse({ events: { 'Button.onPress': { lit: 'onActivate' } } });
    expect(lit.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([['events.Button.onPress.lit', 'Expected a lowercase kebab event name like open-change']]);
    expect(namingDef.safeParse({ events: { 'Button.onPress': { web: 'on-activate' } } }).success).toBe(false);
    expect(namingDef.safeParse({ events: { 'Button.onPress': 'activate' } }).success).toBe(false);
    expect(namingDef.safeParse({ events: { 'button.onPress': 'onActivate' } }).success).toBe(false);
    expect(namingDef.safeParse({ events: { 'Button.onPress': { ios: 'onActivate' } } }).success).toBe(false);
    expect(namingDef.safeParse({ events: { 'Popover.onOpenChange': { lit: 'toggle-open' }, onPress: 'onActivate' } }).success).toBe(true);
  });

  test('an anatomy rename that is not a camelCase name', () => {
    expect(namingDef.safeParse({ anatomy: { 'Button.trailingIcon': 'end-icon' } }).success).toBe(false);
    expect(namingDef.safeParse({ anatomy: { 'Button.trailingIcon': 'endIcon', label: 'text' } }).success).toBe(true);
  });

  test('two canonical names renamed onto one brand name', () => {
    const r = namingDef.safeParse({ components: { Button: 'Action', Link: 'Action' } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain('both rename to Action');
    // Same brand name in different scopes is fine: it is a different generated identifier.
    expect(namingDef.safeParse({ props: { 'Button.variant': 'style', 'Alert.tone': 'style' } }).success).toBe(true);
    expect(namingDef.safeParse({ props: { 'Button.variant': 'style', 'Button.tone': 'style' } }).success).toBe(false);
  });

  test('two anatomy parts renamed onto one, per scope', () => {
    const r = namingDef.safeParse({ anatomy: { 'Button.leadingIcon': 'icon', 'Button.trailingIcon': 'icon' } });
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([
      ['anatomy.Button.trailingIcon', 'Button.trailingIcon and Button.leadingIcon both rename to icon'],
    ]);
    expect(namingDef.safeParse({ anatomy: { 'Button.leadingIcon': 'icon', 'Alert.dismissButton': 'icon' } }).success).toBe(true);
  });

  test('two neutral event names renamed onto one, per scope', () => {
    const r = namingDef.safeParse({ events: { 'Button.onPress': 'onGo', 'Button.onTrack': 'onGo' } });
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([['events.Button.onTrack', 'Button.onTrack and Button.onPress both rename to onGo']]);
    expect(namingDef.safeParse({ events: { 'Button.onPress': 'onGo', 'Alert.onDismiss': 'onGo' } }).success).toBe(true);
  });

  test('an enum value that would not survive a modifier class or an attribute selector, or a key that is not a prop', () => {
    expect(enumValueName.test('on-action') && enumValueName.test('2xl')).toBe(true);
    const spaced = namingDef.safeParse({ values: { 'Button.variant': { primary: 'call to action' } } });
    expect(spaced.error?.issues.map((i) => i.path.join('.'))).toEqual(['values.Button.variant.primary']);
    expect(namingDef.safeParse({ values: { 'Button.variant': { primary: '-cta' } } }).success).toBe(false);
    expect(namingDef.safeParse({ values: { 'Button.variant': { "primary'": 'cta' } } }).success).toBe(false);
    expect(namingDef.safeParse({ values: { 'button.variant': { primary: 'cta' } } }).success).toBe(false);
    expect(namingDef.safeParse({ values: { 'Button.variant': { primary: 'cta' }, size: { '2xl': 'jumbo' } } }).success).toBe(true);
  });

  test('two values of one key renamed onto one brand value', () => {
    const r = namingDef.safeParse({ values: { 'Button.variant': { primary: 'main', secondary: 'main' } } });
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([
      ['values.Button.variant.secondary', 'Button.variant.secondary and Button.variant.primary both rename to main'],
    ]);
    // One brand value under two keys is two different props.
    expect(namingDef.safeParse({ values: { 'Button.variant': { primary: 'main' }, 'Alert.tone': { info: 'main' } } }).success).toBe(true);
  });

  test("a brand value that is another of the key's canonical values, which rules out a swap", () => {
    const r = namingDef.safeParse({ values: { 'Button.variant': { primary: 'secondary', secondary: 'primary' } } });
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([
      ['values.Button.variant.primary', 'Button.variant.primary renames to secondary, which is already one of its values'],
      ['values.Button.variant.secondary', 'Button.variant.secondary renames to primary, which is already one of its values'],
    ]);
    expect(namingDef.safeParse({ values: { 'Button.variant': { primary: 'primary', danger: 'destructive' } } }).success, 'a value mapped to itself is no swap').toBe(true);
  });

  test('two emitted event names renamed onto one, per scope and platform', () => {
    const r = namingDef.safeParse({ events: { 'Button.onPress': { rn: 'onGo', web: 'onActivate' }, 'Button.onTrack': { rn: 'onGo', web: 'onFollow' } } });
    expect(r.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([['events.Button.onTrack', 'Button.onTrack and Button.onPress both rename to onGo on rn']]);
    // The same emitted name on two platforms is two different names.
    expect(namingDef.safeParse({ events: { 'Button.onPress': { rn: 'onGo' }, 'Button.onTrack': { web: 'onGo' } } }).success).toBe(true);
  });
});
