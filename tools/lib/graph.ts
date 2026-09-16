/**
 * The composition graph and the platform support matrix, computed from generated/components.json entries.
 *
 * `composition` names the component each anatomy part is built from; the graph turns those names into edges, a
 * leaves-first build order (what phase 4 regenerates in) and any cycles. The support matrix is the cross-platform
 * view `get_component` gives one platform at a time: per platform, whether the component is supported, whether
 * generated code exists, and which props, events and deprecated members it lacks or carries.
 *
 * Pure: no filesystem access. Whether generated code exists is injected as `hasSource`.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { compositionTarget } from '../../schema/component.ts';
import { PLATFORMS } from '../../schema/platforms.ts';
import type { PlatformId } from '../../schema/platforms.ts';
import type { Dict, Entry } from './components.ts';

export type GraphNode = { name: string; status: string; deprecated: boolean };
export type GraphEdge = { from: string; part: string; to: string; planned: boolean };
export type CompositionGraph = { nodes: GraphNode[]; edges: GraphEdge[]; order: string[]; cycles: string[][] };

export type PlatformSupport = { supported: boolean; generated: boolean; missingProps: string[]; unmappedEvents: string[]; deprecatedMembers: string[] };
export type SupportRow = { name: string; status: string; deprecated: boolean; platforms: Record<string, PlatformSupport> };

const byName = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function status(c: Dict): string {
  return (c.status ?? 'draft') as string;
}

/** Job 624's `deprecated` block, or the older component-level `status: deprecated`. */
export function isDeprecated(c: Dict): boolean {
  return c.deprecated !== undefined || status(c) === 'deprecated';
}

export function compositionGraph(entries: Entry[]): CompositionGraph {
  const comps = entries.map((e) => e.component as Dict).sort((a, b) => byName(a.name as string, b.name as string));
  const nodes: GraphNode[] = comps.map((c) => ({ name: c.name as string, status: status(c), deprecated: isDeprecated(c) }));
  const known = new Set(nodes.map((n) => n.name));
  const edges: GraphEdge[] = [];
  for (const c of comps) {
    for (const [part, entry] of Object.entries((c.composition ?? {}) as Dict)) {
      const target = compositionTarget(entry as string | { component: string });
      edges.push({ from: c.name as string, part, to: target.component, planned: target.planned });
    }
  }

  // What each component is built from, among components that exist: planned targets are not built yet.
  const deps = new Map<string, Set<string>>(nodes.map((n) => [n.name, new Set<string>()]));
  for (const e of edges) if (!e.planned && known.has(e.to)) deps.get(e.from)?.add(e.to);

  // Leaves first: repeatedly take the alphabetically first component whose children are all placed. A component in a
  // cycle, or built from one, never becomes ready and is left out of `order`; `cycles` names the loop.
  const order: string[] = [];
  const placed = new Set<string>();
  let ready = nodes.map((n) => n.name).filter((n) => deps.get(n)?.size === 0);
  while (ready.length) {
    const next = ready.sort(byName).shift() as string;
    order.push(next);
    placed.add(next);
    ready = [...ready, ...nodes.map((n) => n.name).filter((n) => !placed.has(n) && !ready.includes(n) && [...(deps.get(n) ?? [])].every((d) => placed.has(d)))];
  }

  return { nodes, edges, order, cycles: findCycles(nodes.map((n) => n.name), deps) };
}

/** Strongly connected components of more than one node, or one node built from itself (Tarjan). Each cycle's members
 *  are sorted, and the cycles are sorted by their first member. */
function findCycles(names: string[], deps: Map<string, Set<string>>): string[][] {
  let counter = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const out: string[][] = [];

  const visit = (v: string): void => {
    index.set(v, counter);
    low.set(v, counter);
    counter++;
    stack.push(v);
    onStack.add(v);
    for (const w of deps.get(v) ?? []) {
      if (!index.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v) as number, low.get(w) as number));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v) as number, index.get(w) as number));
      }
    }
    if (low.get(v) !== index.get(v)) return;
    const scc: string[] = [];
    let w: string;
    do {
      w = stack.pop() as string;
      onStack.delete(w);
      scc.push(w);
    } while (w !== v);
    if (scc.length > 1 || deps.get(v)?.has(v)) out.push(scc.sort(byName));
  };

  for (const v of names) if (!index.has(v)) visit(v);
  return out.sort((a, b) => byName(a[0] as string, b[0] as string));
}

export type ComponentNeighbours = {
  name: string;
  composes: { part: string; component: string; planned: boolean }[];
  composedBy: { component: string; part: string }[];
  transitiveComposes: string[];
  transitiveComposedBy: string[];
};

/** One component's place in the graph: its direct composition edges both ways, and every existing component it is
 *  built from or is part of, at any depth (planned targets appear only in `composes`). `name` must be a node. */
export function componentNeighbours(graph: CompositionGraph, name: string): ComponentNeighbours {
  const known = new Set(graph.nodes.map((n) => n.name));
  const built = graph.edges.filter((e) => !e.planned && known.has(e.to));
  const reach = (start: string, step: (n: string) => string[]): string[] => {
    const seen = new Set<string>();
    const queue = [start];
    while (queue.length) {
      for (const next of step(queue.shift() as string)) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push(next);
      }
    }
    seen.delete(start);
    return [...seen].sort(byName);
  };
  return {
    name,
    composes: graph.edges.filter((e) => e.from === name).map((e) => ({ part: e.part, component: e.to, planned: e.planned })),
    composedBy: graph.edges.filter((e) => e.to === name && !e.planned).map((e) => ({ component: e.from, part: e.part })),
    transitiveComposes: reach(name, (n) => built.filter((e) => e.from === n).map((e) => e.to)),
    transitiveComposedBy: reach(name, (n) => built.filter((e) => e.to === n).map((e) => e.from)),
  };
}

/** One row per component, sorted by name: for every platform in schema/platforms.ts, whether it is supported (declared
 *  and not `supported: false`), whether `hasSource` finds generated code, the props `propDef.platforms` leaves it out of,
 *  the events `eventDef.platforms` gives no name on it, and the props, events and enum values offered on it that carry
 *  a `deprecated` block, as `props.<prop>`, `events.<event>` and `props.<prop>.values.<value>`. */
export function supportMatrix(entries: Entry[], hasSource: (component: string, platform: PlatformId) => boolean): SupportRow[] {
  const comps = entries.map((e) => e.component as Dict).sort((a, b) => byName(a.name as string, b.name as string));
  return comps.map((c) => {
    const name = c.name as string;
    const props = Object.entries((c.props ?? {}) as Dict);
    const events = Object.entries((c.events ?? {}) as Dict);
    const platforms: Record<string, PlatformSupport> = {};
    for (const platform of PLATFORMS) {
      const mapping = ((c.platforms ?? {}) as Dict)[platform] as Dict | undefined;
      const onProp = (p: Dict): boolean => !Array.isArray(p.platforms) || (p.platforms as string[]).includes(platform);
      const deprecatedMembers: string[] = [];
      for (const [pName, p] of props) {
        if (!onProp(p)) continue;
        if (p.deprecated !== undefined) deprecatedMembers.push(`props.${pName}`);
        for (const [value, life] of Object.entries((p.valueLifecycle ?? {}) as Dict)) {
          const on = (p.valuesOn ?? {}) as Dict;
          const offered = !Object.hasOwn(on, value) || (on[value] as string[]).includes(platform);
          if (offered && (life as Dict).deprecated !== undefined) deprecatedMembers.push(`props.${pName}.values.${value}`);
        }
      }
      for (const [evName, ev] of events) {
        if (Object.hasOwn((ev.platforms ?? {}) as Dict, platform) && ev.deprecated !== undefined) deprecatedMembers.push(`events.${evName}`);
      }
      platforms[platform] = {
        supported: mapping !== undefined && mapping.supported !== false,
        generated: hasSource(name, platform),
        missingProps: props.filter(([, p]) => !onProp(p as Dict)).map(([pName]) => pName),
        unmappedEvents: events.filter(([, ev]) => !Object.hasOwn(((ev as Dict).platforms ?? {}) as Dict, platform)).map(([evName]) => evName),
        deprecatedMembers,
      };
    }
    return { name, status: status(c), deprecated: isDeprecated(c), platforms };
  });
}
