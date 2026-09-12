/** schema/naming.ts is the single source of truth for a brand's renames: tools/schema.ts derives
 *  schema/naming.schema.json from it, and every themes/<brand>/naming.md parses against it. An omitted
 *  naming.md — the default, unrenamed case — must stay a no-op, so `{}` parses to all defaults. */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { namingDefaults, namingDef, namingFrontmatter } from '../../schema/naming.ts';
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

  test('describes the three optional keys', () => {
    const schema = namingJsonSchema();
    expect(schema.$id).toBe('https://design-schema.dev/schema/naming.schema.json');
    const defs = schema.$defs as Record<string, Record<string, unknown>>;
    expect(Object.keys(defs.namingDef!.properties as object)).toEqual(['namespace', 'components', 'props']);
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

  test('two canonical names renamed onto one brand name', () => {
    const r = namingDef.safeParse({ components: { Button: 'Action', Link: 'Action' } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain('both rename to Action');
    // Same brand name in different scopes is fine: it is a different generated identifier.
    expect(namingDef.safeParse({ props: { 'Button.variant': 'style', 'Alert.tone': 'style' } }).success).toBe(true);
    expect(namingDef.safeParse({ props: { 'Button.variant': 'style', 'Button.tone': 'style' } }).success).toBe(false);
  });
});
