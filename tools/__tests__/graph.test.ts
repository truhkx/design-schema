/**
 * tools/lib/graph.ts — the composition graph and the platform support matrix, over fixtures and over the real
 * generated/components.json.
 */
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { readComponents } from '../lib/components.ts';
import type { Dict } from '../lib/components.ts';
import { componentNeighbours, compositionGraph, supportMatrix } from '../lib/graph.ts';
import { REPO_ROOT } from '../lib/root.ts';

const ALL = { web: {}, lit: { tag: 'ds-x' }, rn: {}, swiftui: {} };

/** A generated/components.json entry with just the fields the graph and matrix read. */
function entry(name: string, component: Dict = {}): Dict {
  return { component: { name, status: 'review', platforms: ALL, props: {}, ...component } };
}

describe('compositionGraph', () => {
  test('edges come from composition, with the (planned) marker read the way the parser reads it', () => {
    const g = compositionGraph([entry('Alert', { composition: { icon: 'Icon', dismissButton: { component: 'Button' }, badge: 'Badge (planned)' } }), entry('Button'), entry('Icon')]);
    expect(g.edges).toEqual([
      { from: 'Alert', part: 'icon', to: 'Icon', planned: false },
      { from: 'Alert', part: 'dismissButton', to: 'Button', planned: false },
      { from: 'Alert', part: 'badge', to: 'Badge', planned: true },
    ]);
    expect(g.order).not.toContain('Badge');
    expect(g.order).toContain('Alert');
  });

  test('order is leaves first, ties broken by name', () => {
    const g = compositionGraph([
      entry('Toolbar', { composition: { overflowButton: 'Button', overflowMenu: 'Menu' } }),
      entry('Menu', { composition: { item: 'Icon' } }),
      entry('Icon'),
      entry('Button', { composition: { icon: 'Icon' } }),
      entry('Divider'),
    ]);
    expect(g.order).toEqual(['Divider', 'Icon', 'Button', 'Menu', 'Toolbar']);
    expect(g.cycles).toEqual([]);
  });

  test('a cycle is reported and its members are left out of order', () => {
    const g = compositionGraph([entry('A', { composition: { b: 'B' } }), entry('B', { composition: { a: 'A' } }), entry('C', { composition: { a: 'A' } }), entry('D'), entry('E', { composition: { self: 'E' } })]);
    expect(g.cycles).toEqual([['A', 'B'], ['E']]);
    expect(g.order).toEqual(['D']);
  });

  test('a node is deprecated by its deprecated block or its status', () => {
    const g = compositionGraph([entry('Old', { status: 'deprecated' }), entry('Older', { deprecated: { reason: 'x', use: 'New' } }), entry('New')]);
    expect(g.nodes).toEqual([
      { name: 'New', status: 'review', deprecated: false },
      { name: 'Old', status: 'deprecated', deprecated: true },
      { name: 'Older', status: 'review', deprecated: true },
    ]);
  });

  test('neighbours: direct edges both ways and transitive closure', () => {
    const g = compositionGraph([entry('Toolbar', { composition: { overflowMenu: 'Menu', later: 'Chip (planned)' } }), entry('Menu', { composition: { item: 'Icon' } }), entry('Icon')]);
    expect(componentNeighbours(g, 'Menu')).toEqual({
      name: 'Menu',
      composes: [{ part: 'item', component: 'Icon', planned: false }],
      composedBy: [{ component: 'Toolbar', part: 'overflowMenu' }],
      transitiveComposes: ['Icon'],
      transitiveComposedBy: ['Toolbar'],
    });
    const toolbar = componentNeighbours(g, 'Toolbar');
    expect(toolbar.composes).toContainEqual({ part: 'later', component: 'Chip', planned: true });
    expect(toolbar.transitiveComposes).toEqual(['Icon', 'Menu']);
  });
});

describe('supportMatrix', () => {
  const fixture = entry('Select', {
    platforms: { web: {}, lit: { tag: 'ds-select' }, rn: { supported: false } },
    props: {
      size: { type: 'enum', values: ['sm', 'md', 'lg'], valueLifecycle: { lg: { deprecated: { reason: 'too big', use: 'md' } } }, valuesOn: { lg: ['web'] } },
      element: { type: 'string', platforms: ['web', 'lit'], deprecated: { reason: 'gone' } },
    },
    events: { onChange: { platforms: { web: 'onChange', lit: 'change', rn: 'onChange' } }, onOpen: { platforms: { web: 'onOpen' }, deprecated: { reason: 'use onOpenChange' } } },
  });
  const rows = supportMatrix([fixture], (component, platform) => component === 'Select' && platform === 'web');
  const row = rows[0] as Dict;

  test('one row per component with every platform', () => {
    expect(rows).toHaveLength(1);
    expect(row.name).toBe('Select');
    expect(row.deprecated).toBe(false);
    expect(Object.keys(row.platforms)).toEqual(['web', 'lit', 'rn', 'swiftui']);
  });

  test('supported, generated, missing props and unmapped events', () => {
    expect(row.platforms.web).toMatchObject({ supported: true, generated: true, missingProps: [], unmappedEvents: [] });
    expect(row.platforms.lit).toMatchObject({ supported: true, generated: false, missingProps: [], unmappedEvents: ['onOpen'] });
    expect(row.platforms.rn).toMatchObject({ supported: false, missingProps: ['element'], unmappedEvents: ['onOpen'] });
    expect(row.platforms.swiftui).toMatchObject({ supported: false, missingProps: ['element'], unmappedEvents: ['onChange', 'onOpen'] });
  });

  test('deprecated members are the props, events and enum values offered on the platform', () => {
    expect(row.platforms.web.deprecatedMembers).toEqual(['props.size.values.lg', 'props.element', 'events.onOpen']);
    expect(row.platforms.lit.deprecatedMembers).toEqual(['props.element']);
    expect(row.platforms.rn.deprecatedMembers).toEqual([]);
  });
});

describe('the real generated/components.json', () => {
  const entries = readComponents(join(REPO_ROOT, 'generated', 'components.json'));
  const graph = compositionGraph(entries);

  test('has no cycles, and orders every component', () => {
    expect(graph.cycles).toEqual([]);
    expect([...graph.order].sort()).toEqual(graph.nodes.map((n) => n.name));
  });

  test('Alert composes Button and Icon, Toolbar composes Menu', () => {
    expect(componentNeighbours(graph, 'Alert').composes.map((e) => e.component).sort()).toEqual(expect.arrayContaining(['Button', 'Icon']));
    expect(componentNeighbours(graph, 'Toolbar').composes.map((e) => e.component)).toContain('Menu');
    expect(graph.order.indexOf('Button')).toBeLessThan(graph.order.indexOf('Alert'));
    expect(graph.order.indexOf('Menu')).toBeLessThan(graph.order.indexOf('Toolbar'));
  });
});
