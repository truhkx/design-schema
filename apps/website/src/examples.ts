/**
 * The example gallery's data, read from `generated/examples/<Name>.json` at build time.
 *
 * `tools/docs_examples.ts` writes those files from `packages/react/src/*.stories.tsx` and
 * Storybook's own `storybook-static/index.json`, so every example on a component page is a story
 * Storybook already has (site/src/content/docs/process/website-plan.md, "Content pipeline"). The
 * website never authors an example and never fetches one: an `Example` carries everything a panel
 * needs — the args to render with, each platform's code to show, and the id to deep-link with — which
 * is why the gallery keeps working with every Storybook instance unreachable.
 *
 * The file also says how to lay the set out (`layout`, `sweep`, `primary`). That is decided by the
 * tool, from the stories and the schema, so the island renders a layout rather than re-deriving one.
 *
 * Read through `import.meta.glob`, for the reason ./keyboard.ts spells out: a module in this app is
 * bundled before it runs, so a path computed from `import.meta.url` at runtime would be resolved
 * against dist/. A glob is resolved by Vite at build time against *this* file's directory.
 */

/** A JSX element in `args`, rebuilt by the island with `createElement`. Mirrors tools/docs_examples.ts. */
export type ElementValue = { $element: string; props: Record<string, Value>; children: Value[] };
/** An arg the extractor could not turn into data — a callback, a call it cannot evaluate. Dropped when rendering. */
export type UnsupportedValue = { $unsupported: string };
/** Anything an arg can be in the JSON. */
export type Value = string | number | boolean | null | Value[] | { [key: string]: Value } | ElementValue | UnsupportedValue;

/** The one prop a story steps through, and the value it sets. */
export interface Sweep {
  prop: string;
  value: string | boolean;
}

/** `sweep`: one small-multiple grid. `scenarios`: tabs, split behind "More examples" when there are many. */
export type Layout = 'sweep' | 'scenarios';

/** The platforms an example has code for. Mirrors tools/docs_snippets.ts. */
export type Platform = 'react' | 'lit' | 'rn' | 'swift';

/** The order a reader picks between them — the React live render first, then its closest sibling. */
export const PLATFORM_ORDER: readonly Platform[] = ['react', 'rn', 'lit', 'swift'];

/** One example's copy/paste code per platform, or `null` where that platform has no source for it. */
export type Snippets = Record<Platform, string | null>;

/** One story, exactly as `generated/examples/<Name>.json` holds it. */
export interface Example {
  /** Storybook's display name for the story ("Heading Level 2") — the tab's label. */
  title: string;
  /** The story's args merged over its meta's, which is what Storybook renders it with. */
  args: Record<string, Value>;
  /**
   * What a developer would write for this example on each platform — rendered by tools/docs_snippets.ts
   * from that platform's own story (or, for SwiftUI, the generated view's `#Preview`), never authored.
   */
  snippets: Snippets;
  /** The story export (or SwiftUI preview) each snippet came from. */
  stories: Record<Platform, string | null>;
  /** The id Storybook assigned, from its own manifest. The deep link's only moving part. */
  storyId: string;
  /** The single enum or boolean prop the story sets, or `null` for a scenario. */
  sweep: Sweep | null;
  /** Whether the story wraps the component in a decorator this page cannot run. */
  decorated: boolean;
  /** Whether the tab is in the always-visible strip rather than behind "More examples". */
  primary: boolean;
}

/** One component's file. */
export interface ExampleSet {
  layout: Layout;
  /**
   * Whether each platform has source for this component at all. `swift` turns true by itself the day
   * generation writes `packages/swiftui/Sources/DesignSchema/<Name>.swift` and `pnpm docs:examples` runs.
   */
  platforms: Record<Platform, boolean>;
  examples: Example[];
}

/** An example as the island needs it: the snippets arrive highlighted, in their own prop. */
export type ExampleView = Omit<Example, 'snippets' | 'stories'>;

const FILES = import.meta.glob<ExampleSet>('../../../generated/examples/*.json', { eager: true, import: 'default' });

const BY_NAME = new Map<string, ExampleSet>(
  Object.entries(FILES).map(([path, set]) => [path.slice(path.lastIndexOf('/') + 1, -'.json'.length), set]),
);

/**
 * Chromatic's per-package project URLs, written by job 510 into `generated/chromatic.json`.
 *
 * A glob rather than an import so the file being absent is a build-time fact rather than an
 * unresolved module: until that job lands there is no hosted Storybook, and website-plan.md's
 * instruction is to omit the deep link rather than point it at a URL that does not exist.
 */
const CHROMATIC = import.meta.glob<Record<string, string>>('../../../generated/chromatic.json', {
  eager: true,
  import: 'default',
});

/**
 * The examples for a component, in story order, or none when it has no story module.
 *
 * Empty is a real answer, not a failure: a component with no `*.stories.tsx` has no example set to
 * project, and its page shows the schema and the accessibility contract as it always did.
 */
export function examplesFor(name: string): ExampleSet {
  return BY_NAME.get(name) ?? { layout: 'scenarios', platforms: { react: false, lit: false, rn: false, swift: false }, examples: [] };
}

/**
 * Several snippets as one block — a sweep grid shows its whole set's code under the tiles.
 *
 * Each snippet opens with its own import lines; the block keeps each distinct line once, at the top,
 * so twenty `Text` steps read as one import and twenty usages rather than forty lines of repetition.
 */
export function joinSnippets(snippets: readonly (string | null)[]): string | null {
  const present = snippets.filter((snippet): snippet is string => snippet !== null);
  if (present.length === 0) return null;
  const imports: string[] = [];
  const bodies: string[] = [];
  for (const snippet of present) {
    const lines = snippet.split('\n');
    let start = 0;
    for (; start < lines.length && /^import\s/.test(lines[start]!); start++) {
      if (!imports.includes(lines[start]!)) imports.push(lines[start]!);
    }
    bodies.push(lines.slice(start).join('\n').trim());
  }
  return [imports.join('\n'), ...bodies].filter((part) => part !== '').join('\n\n');
}

/**
 * The hosted Storybook for `packages/react`, or `undefined` before job 510 publishes one.
 *
 * `undefined` means the panels omit their "Open in Storybook" link. Nothing else about an example
 * depends on this: the live render and the source come from the JSON.
 */
export function reactStorybookUrl(): string | undefined {
  const urls = Object.values(CHROMATIC)[0];
  const url = urls?.['react'];
  return typeof url === 'string' && url !== '' ? url.replace(/\/+$/, '') : undefined;
}

/**
 * The deep link for one story — the same `?path=/story/<id>` route Storybook's own router uses, so
 * it resolves identically on Chromatic and on any future self-hosted mirror.
 */
export function storybookLink(base: string, storyId: string): string {
  return `${base}/?path=/story/${storyId}`;
}
