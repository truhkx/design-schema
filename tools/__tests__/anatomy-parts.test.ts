/** anatomy `parts` (job 612): the part checks componentDef runs, `partKind`, `slotName`, and a Card-like doc with slot
 *  parts and an object composition entry parsed against the real Heading doc. */
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { componentDef, partKind, PLATFORMS, slotName } from '../../schema/component.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { component, usePaths, useTmp } from './fixtures.ts';

const tmp = useTmp();
usePaths();

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

/** Card, with card.md's anatomy and content props: the body is the default slot (children), headerActions and footer
 *  are named slots, and the heading is built from Heading with its level passed through. */
function card(): Dict {
  return {
    name: 'Card',
    category: 'container',
    status: 'review',
    anatomy: ['surface', 'header', 'heading', 'headerActions', 'body', 'footer'],
    parts: {
      surface: { kind: 'element' },
      heading: { kind: 'component' },
      body: { kind: 'slot', description: 'The body.', slot: { default: true, required: true } },
      headerActions: { kind: 'slot' },
      footer: { kind: 'slot', slot: { prop: 'footer' } },
    },
    props: {
      children: { type: 'content', required: true, description: 'The body.' },
      heading: { type: 'string', description: "The card's title." },
      headingLevel: { type: 'enum', values: ['2', '3', '4', '5', '6'], default: '3', description: 'Heading level for heading.' },
      headerActions: { type: 'content', description: 'Controls at the end of the header row.' },
      footer: { type: 'content', description: 'The action row.' },
    },
    styles: {
      partGap: { token: 'layout.gap.loose' },
      headingSize: { token: 'font.size.lg' },
    },
    a11y: { role: 'none', requires: ['heading-hierarchy'] },
    composition: { heading: { component: 'Heading', props: { level: { from: 'headingLevel' } }, forwards: { headingSize: 'fontSize' } } },
    platforms: { web: { element: 'article' }, lit: { tag: 'ds-card' }, rn: { element: 'View' }, swiftui: { element: 'VStack' } },
  };
}

const CARD_ANATOMY = "['surface', 'header', 'heading', 'headerActions', 'body', 'footer']";

describe('the Card fixture', () => {
  test('passes the schema', () => {
    accepts(card());
  });

  test('parses against the real Heading doc', () => {
    parse.validate({ component: card() }, join(tmp(), 'card.md'));
  });

  test('slotName resolves each slot four ways', () => {
    const expected: Record<string, string[]> = {
      web: ['children', 'headerActions', 'footer'],
      lit: ['', 'header-actions', 'footer'],
      rn: ['children', 'headerActions', 'footer'],
      swiftui: ['content', 'headerActions', 'footer'],
    };
    for (const platform of PLATFORMS) {
      expect(['body', 'headerActions', 'footer'].map((part) => slotName(card(), part, platform)), platform).toEqual(expected[platform]);
    }
  });

  test('a declared platform name wins', () => {
    const c = card();
    c.parts.footer.slot.platforms = { lit: 'actions', swiftui: 'actions' };
    expect(PLATFORMS.map((platform) => slotName(c, 'footer', platform))).toEqual(['footer', 'actions', 'footer', 'actions']);
    accepts(c);
  });
});

describe('partKind', () => {
  test('the declared kind, else component when composed, else element', () => {
    const c = card();
    expect(partKind(c, 'body')).toBe('slot');
    expect(partKind(c, 'surface')).toBe('element');
    delete c.parts.heading;
    expect(partKind(c, 'heading')).toBe('component');
    expect(partKind(c, 'header')).toBe('element');
    const w = component();
    w.composition = { label: 'Text' };
    expect(partKind(w, 'label')).toBe('component');
    expect(partKind(w, 'container')).toBe('element');
  });
});

describe('the checks', () => {
  test('every parts key is an anatomy part', () => {
    accepts(card());
    const c = card();
    c.parts.aside = { kind: 'element' };
    rejects(c, ['parts', 'aside'], `parts.aside is not in anatomy ${CARD_ANATOMY}`);
  });

  test('kind component needs a composition entry', () => {
    const c = card();
    delete c.composition;
    rejects(c, ['parts', 'heading', 'kind'], "parts.heading is kind 'component' but composition has no entry for 'heading'");
  });

  test('a composed part cannot declare another kind', () => {
    const undeclared = card();
    delete undeclared.parts.heading;
    accepts(undeclared);
    const c = card();
    c.parts.heading.kind = 'element';
    rejects(c, ['parts', 'heading', 'kind'], "parts.heading is kind 'element' but composition builds it from Heading, so its kind is 'component'");
  });

  test('slot needs kind slot', () => {
    const c = card();
    c.parts.surface = { kind: 'element', slot: {} };
    rejects(c, ['parts', 'surface', 'slot'], "parts.surface.slot needs kind 'slot', got 'element'");
  });

  test('slot.prop names a content prop', () => {
    const c = card();
    c.parts.footer.slot.prop = 'heading';
    rejects(c, ['parts', 'footer', 'slot', 'prop'], "parts.footer.slot.prop names 'heading', which is not a content prop");
    c.parts.footer.slot.prop = 'actions';
    rejects(c, ['parts', 'footer', 'slot', 'prop'], "parts.footer.slot.prop names 'actions', which is not a content prop");
  });

  test('without prop, the web and rn name is still a content prop', () => {
    const c = card();
    c.parts.header = { kind: 'slot' };
    rejects(c, ['parts', 'header'], "parts.header resolves to 'header' on web and rn, which is not a content prop (name one with slot.prop)");
    const webOnly = card();
    webOnly.parts.header = { kind: 'slot', slot: { platforms: { rn: 'footer' } } };
    delete webOnly.parts.footer;
    rejects(webOnly, ['parts', 'header', 'slot'], "parts.header resolves to 'header' on web, which is not a content prop (name one with slot.prop)");
    const litOnly = card();
    litOnly.platforms = { lit: { tag: 'ds-card' } };
    litOnly.parts.header = { kind: 'slot' };
    accepts(litOnly);
  });

  test('at most one slot is the default', () => {
    const c = card();
    c.parts.headerActions = { kind: 'slot', slot: { default: true, prop: 'headerActions' } };
    rejects(c, ['parts', 'headerActions', 'slot', 'default'], 'parts.headerActions is a second default slot; parts.body is already the default');
  });

  test('the default slot has no Lit name', () => {
    const c = card();
    c.parts.body.slot.platforms = { lit: 'body' };
    rejects(c, ['parts', 'body', 'slot', 'platforms', 'lit'], 'parts.body is the default slot, which has no Lit name');
  });

  test('slot.platforms names only declared platforms', () => {
    const c = card();
    delete c.platforms.swiftui;
    accepts(c);
    c.parts.footer.slot.platforms = { swiftui: 'actions' };
    rejects(c, ['parts', 'footer', 'slot', 'platforms', 'swiftui'], "parts.footer.slot.platforms has 'swiftui', which the component does not declare");
  });

  test('a Lit name is lowercase with dashes; the other platforms take identifiers', () => {
    const c = card();
    c.parts.headerActions.slot = { platforms: { lit: 'header-actions-2', web: 'headerActions', swiftui: 'header_actions' } };
    accepts(c);
    c.parts.headerActions.slot = { platforms: { lit: 'headerActions' } };
    rejects(c, ['parts', 'headerActions', 'slot', 'platforms', 'lit'], "parts.headerActions.slot.platforms.lit 'headerActions' is not a Lit slot name (lowercase letters, digits and dashes)");
    c.parts.headerActions.slot = { platforms: { swiftui: 'header-actions' } };
    rejects(c, ['parts', 'headerActions', 'slot', 'platforms', 'swiftui'], "parts.headerActions.slot.platforms.swiftui 'header-actions' is not an identifier");
  });

  test('no two slots resolve to the same name on one platform', () => {
    const c = card();
    c.parts.footer.slot.platforms = { lit: 'header-actions' };
    rejects(c, ['parts', 'footer'], "parts.footer resolves to 'header-actions' on lit, as parts.headerActions does");
  });

  describe('behavior may not target a slot', () => {
    const scenario = (when: Dict | null, then: Dict[] = [{ renders: true }]): Dict => {
      const c = card();
      c.behavior = [{ name: 'x', ...(when === null ? {} : { when }), then }];
      return c;
    };
    const SLOT = "'footer' is a slot, which renders no element of its own";

    test('an element part is fine', () => {
      accepts(scenario({ click: 'surface' }, [{ focused: 'surface' }, { attribute: 'data-x', is: true, on: 'surface' }]));
    });

    test.each(['click', 'focus', 'hover'])('when.%s', (key) => {
      rejects(scenario({ [key]: 'footer' }), ['behavior', 0, 'when', key], `scenario 'x' when.${key}: ${SLOT}`);
    });

    test('then.focused', () => {
      rejects(scenario(null, [{ focused: 'footer' }]), ['behavior', 0, 'then', 0, 'focused'], `scenario 'x' then.focused: ${SLOT}`);
    });

    test('then.attribute.on', () => {
      rejects(scenario(null, [{ attribute: 'data-x', is: true, on: 'footer' }]), ['behavior', 0, 'then', 0, 'on'], `scenario 'x' then.attribute.on: ${SLOT}`);
    });
  });
});
