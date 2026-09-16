/** schema/component.ts is the single source of truth: tools/schema.ts derives the JSON schema from it, and the
 *  Zod schema rejects what the hand-written JSON schema used to reject. */
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import { componentFrontmatter } from '../../schema/component.ts';
import { extensionFrontmatter } from '../../schema/extension.ts';
import { readText } from '../lib/py.ts';
import { componentJsonSchema, extensionJsonSchema, renderSchema, SCHEMA_FILE, targets, themeJsonSchema } from '../schema.ts';
import { component } from './fixtures.ts';

describe('derived JSON schema', () => {
  test('the committed component.schema.json is current', () => {
    expect(existsSync(SCHEMA_FILE)).toBe(true);
    expect(readText(SCHEMA_FILE), 'run node tools/schema.ts').toBe(renderSchema());
  });

  test('every derived JSON schema is committed and current', () => {
    const t = targets();
    expect(t.map((x) => x.source)).toEqual(['schema/component.ts', 'schema/naming.ts', 'schema/theme.ts', 'schema/extension.ts']);
    for (const { file, text } of t) expect(readText(file), `${file}: run node tools/schema.ts`).toBe(text);
  });

  test('the theme schema keeps its descriptions, defaults and strict objects', () => {
    const schema = themeJsonSchema();
    const def = (schema.$defs as Record<string, any>).themeDef;
    expect(def.additionalProperties).toBe(false);
    expect(def.properties.seed.additionalProperties).toBe(false);
    expect(def.properties.statusHues.properties.danger.default).toBe(25);
    expect(def.properties.statusHues.properties.info.default).toBe(null);
    expect(def.properties.neutralTint.default).toBe(0.2);
    expect(def.properties.tone.description).toContain('tie-breaker');
    expect(def.required).toEqual(['id', 'tone', 'not', 'seed', 'scale', 'radius', 'density', 'modes']);
  });

  test('the extension schema is self-contained: component shapes are local $defs', () => {
    const text = JSON.stringify(extensionJsonSchema());
    expect(text).not.toContain('component.schema.json#');
    expect((extensionJsonSchema().$defs as Record<string, unknown>)).toHaveProperty('propDef');
  });

  test('keeps the $defs other schemas reuse', () => {
    const schema = componentJsonSchema();
    expect(schema.$id).toBe('https://design-schema.dev/schema/component.schema.json');
    const defs = schema.$defs as Record<string, unknown>;
    for (const id of ['platformId', 'tokenRef', 'propDef', 'eventDef', 'styleBinding', 'contrastPair', 'a11yDef', 'platformNotes', 'behaviorScenario', 'keyboardRule', 'componentDef']) {
      expect(defs, id).toHaveProperty(id);
    }
    expect((defs.propDef as Record<string, unknown>).additionalProperties).toBe(false);
    expect((schema.properties as Record<string, unknown>).component).toEqual({ $ref: '#/$defs/componentDef' });
    expect(schema, 'Starlight fields ride alongside component').not.toHaveProperty('additionalProperties');
  });
});

describe('Zod validation', () => {
  test('a valid component with starlight fields passes', () => {
    expect(componentFrontmatter.safeParse({ title: 'Widget', component: component() }).success).toBe(true);
  });

  test('unknown keys are rejected where the JSON schema forbade them', () => {
    const c = component();
    c.props.label.colour = 'red';
    const r = componentFrontmatter.safeParse({ component: c });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join('.'))).toContain('component.props.label');
  });

  test('an enum prop needs values', () => {
    const c = component();
    delete c.props.size.values;
    delete c.props.size.enumRef;
    const r = componentFrontmatter.safeParse({ component: c });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join('.'))).toContain('component.props.size.values');
  });

  test('platforms and event platforms are partial records keyed by platform id', () => {
    expect(componentFrontmatter.safeParse({ component: component() }).success).toBe(true);
    const c = component();
    c.platforms.ios = { element: 'View' };
    expect(componentFrontmatter.safeParse({ component: c }).success).toBe(false);
  });

  test('an extension may carry a11y.contrast but not a11y.requires', () => {
    const r = extensionFrontmatter.safeParse({ title: 'x', extension: { extends: 'Widget', name: 'a11y', a11y: { requires: ['focus-trap'] } } });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join('.'))).toContain('extension.a11y');
    const pair = { foreground: 'color.foreground.muted', background: 'color.background.subtle' };
    expect(extensionFrontmatter.safeParse({ extension: { extends: 'Widget', name: 'a11y', a11y: { contrast: [pair] } } }).success).toBe(true);
  });
});
