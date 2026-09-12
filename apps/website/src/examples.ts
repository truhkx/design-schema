/**
 * The example gallery's data, read from `generated/examples/<Name>.json` at build time.
 *
 * `tools/docs_examples.ts` writes those files from `packages/react/src/*.stories.tsx` and
 * Storybook's own `storybook-static/index.json`, so every example on a component page is a story
 * Storybook already has (site/src/content/docs/process/website-plan.md, "Content pipeline"). The
 * website never authors an example and never fetches one: an `Example` carries everything a panel
 * needs — the args to render with, the source to show, and the id to deep-link with — which is why
 * the gallery keeps working with every Storybook instance unreachable.
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

/** One story, exactly as `generated/examples/<Name>.json` holds it. */
export interface Example {
  /** Storybook's display name for the story ("Heading Level 2") — the tab's label. */
  title: string;
  /** The story's args merged over its meta's, which is what Storybook renders it with. */
  args: Record<string, Value>;
  /** The export's source slice, shown under the live example. */
  sourceText: string;
  /** The id Storybook assigned, from its own manifest. The deep link's only moving part. */
  storyId: string;
}

const FILES = import.meta.glob<Example[]>('../../../generated/examples/*.json', { eager: true, import: 'default' });

const BY_NAME = new Map<string, Example[]>(
  Object.entries(FILES).map(([path, examples]) => [path.slice(path.lastIndexOf('/') + 1, -'.json'.length), examples]),
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
 * The examples for a component, in story order, or `[]` when it has no story module.
 *
 * Empty is a real answer, not a failure: a component with no `*.stories.tsx` has no example set to
 * project, and its page shows the schema and the accessibility contract as it always did.
 */
export function examplesFor(name: string): Example[] {
  return BY_NAME.get(name) ?? [];
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
