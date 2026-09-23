/**
 * Turning a story's encoded `args` back into React props.
 *
 * `tools/docs_examples.ts` writes `generated/examples/<Name>.json` as JSON, because the website has
 * to be able to render an example with every Storybook instance unreachable. Two shapes in there are
 * not plain data, and this is where both are undone:
 *
 *   - `{ "$element", "props", "children" }` — JSX from the story, rebuilt with `createElement`;
 *   - `{ "$unsupported": "<source>" }` — an arg that was genuinely code (a `render` callback, a
 *     `formatValue`), which is dropped.
 *
 * Dropping is not an error path. It is the same thing the component sees when a consumer omits an
 * optional prop: a Table column renders its raw cell value instead of a formatted one. The source
 * shown beside the example is still the real story, and ./example-probe.ts is what decides whether
 * what is left renders at all.
 *
 * Kept out of ./components/Examples.tsx so the page can use it without pulling the island's module
 * graph, and so ./example-probe.ts — which imports `react-dom/server` — never reaches the browser.
 */
import { Fragment, createElement, type ElementType, type ReactNode } from 'react';
// The whole package: an example renders the component its page is about, and the JSX inside an arg
// can name any other one (`children: <TabPanel>…`, `headerActions: <Button …/>`).
import * as reactPackage from '@design-schema/react';

import type { ElementValue, Example, UnsupportedValue, Value } from './examples';

/** The exports of `@design-schema/react`, by name. */
export const COMPONENTS = reactPackage as unknown as Record<string, unknown>;

/** Returned by `decode` for an arg it cannot rebuild, so callers drop the key rather than the example. */
const DROP = Symbol('unsupported');

function isElement(value: object): value is ElementValue {
  return '$element' in value;
}

function isUnsupported(value: object): value is UnsupportedValue {
  return '$unsupported' in value;
}

/**
 * An element descriptor's tag as something `createElement` can take.
 *
 * Lower-case is an intrinsic (`svg`, `path`) and passes straight through. Capitalised has to be an
 * export of the package — the extractor only ever sees a story module's own imports, and every one
 * of those is a sibling component — so an unknown name means the JSON is ahead of the package, and
 * the element is dropped rather than rendered as a literal `<Foo>` tag.
 */
function resolveTag(tag: string): ElementType | undefined {
  if (tag === 'Fragment') return Fragment;
  // `ElementType` narrows an intrinsic to the known tag names; the extractor only ever emits one it
  // read out of a story's own JSX, which the story compiled with.
  if (tag[0] !== undefined && tag[0] === tag[0].toLowerCase()) return tag as ElementType;
  const component = COMPONENTS[tag];
  return typeof component === 'function' ? (component as ElementType) : undefined;
}

function decode(value: Value): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (Array.isArray(value)) return value.map(decode).filter((item) => item !== DROP);
  if (isUnsupported(value)) return DROP;
  if (isElement(value)) {
    const tag = resolveTag(value.$element);
    if (tag === undefined) return DROP;
    const props = decode(value.props);
    const children = value.children.map(decode).filter((child) => child !== DROP) as ReactNode[];
    return createElement(tag, props as Record<string, unknown>, ...children);
  }
  const object: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, Value>)) {
    const decoded = decode(item);
    if (decoded !== DROP) object[key] = decoded;
  }
  return object;
}

/** One example's args as the props to mount the component with. */
export function decodeArgs(args: Record<string, Value>): Record<string, unknown> {
  return decode(args) as Record<string, unknown>;
}

/**
 * The props an example mounts with on this page, which differ from the story's args in two cases,
 * both about `open` — a story sets it to show an overlay open in a Storybook canvas, and a page
 * cannot open an overlay over itself on load:
 *
 *   - a `trigger` harness example starts shut. `open` is the harness's state from here on, and it is
 *     `false` until the visitor presses the harness's button (./components/Examples.tsx);
 *   - `withoutOpen`: ./example-probe.ts found that the story's `open` is what stops it rendering here
 *     (an open Popover portals into a document the server does not have) on a component that opens
 *     itself from its own trigger. The page renders it the way a visitor first meets it, closed and
 *     uncontrolled, and the trigger opens it. The code panel still shows the story as written.
 */
export function exampleProps(example: Pick<Example, 'args' | 'harness'>, withoutOpen = false): Record<string, unknown> {
  const props = decodeArgs(example.args);
  if (example.harness === 'trigger') return { ...props, open: false };
  if (!withoutOpen) return props;
  const { open: _open, ...rest } = props;
  return rest;
}
