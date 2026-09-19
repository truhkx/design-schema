/**
 * Which examples can actually be rendered live — decided by rendering them, at build time.
 *
 * Not every story is "the component with these args". A CSF story may define its own `render` and
 * build a demo around the component (a Button that opens the ActionSheet, a Form that holds its own
 * values); those stories pass no args, so there is nothing for a page to mount. Others pass args the
 * extractor could only carry part of — `Feed`'s timestamps come from a helper call it cannot
 * evaluate — and the component needs the part that is missing.
 *
 * Both are the same question, and asking it by guessing (does the schema's required-prop list appear
 * in the args?) gets the second one wrong. So the question is asked directly: render the component
 * with the decoded args once, here in the page's frontmatter, and see whether it throws. A throw in
 * the island itself would be a failed build — static generation has no error boundary — which is
 * exactly what this is for.
 *
 * Server-only. It is imported by `pages/docs/components/[slug].astro`'s frontmatter and by nothing
 * the browser loads, which is why it lives beside ./example-args.ts rather than inside the island:
 * `react-dom/server` must not end up in a client bundle.
 */
import { createElement, type ElementType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { COMPONENTS, decodeArgs } from './example-args';
import type { Example } from './examples';

/**
 * Each example's static markup, in the order given, or `null` where mounting it throws.
 *
 * React writes a component stack to `console.error` before rethrowing, and a page with a dozen
 * source-only stories would bury the build log in stacks for failures that are already handled. The
 * probe is the one place that is expected, so it is the one place that quiets it.
 */
function staticMarkup(name: string, examples: Example[]): (string | null)[] {
  const Component = COMPONENTS[name];
  if (typeof Component !== 'function') return examples.map(() => null);

  const error = console.error;
  console.error = () => {};
  try {
    return examples.map((example) => {
      try {
        return renderToStaticMarkup(createElement(Component as ElementType, decodeArgs(example.args)));
      } catch {
        return null;
      }
    });
  } finally {
    console.error = error;
  }
}

/** Whether each example renders, in the order given. */
export function renderableExamples(name: string, examples: Example[]): boolean[] {
  return staticMarkup(name, examples).map((markup) => markup !== null);
}

/**
 * Whether each example puts an `<h1>` on the page it is embedded in.
 *
 * A component page is a document with one level-1 heading — its title, the component's name. An
 * example that renders a level-1 heading of its own (`Heading` with `level: "1"`, and any component
 * given a `headingLevel` of 1) would make that two, so the page shows such an example as source
 * rather than rendering it, and ./components/Examples.tsx says so where the render would have been.
 *
 * Asked the same way this module asks everything else — by rendering the example and looking
 * at what came out, not by listing the components or the props that could do it. So a level-1
 * `headingLevel` added to any example, on any page, is contained the day it lands, and no component
 * has to render anything other than what its args say: a `Heading` at `level: "1"` still produces a
 * real `<h1>` here, which is exactly why the page cannot embed one.
 */
export function pageHeadingExamples(name: string, examples: Example[]): boolean[] {
  return staticMarkup(name, examples).map((markup) => markup !== null && /<h1[\s/>]/i.test(markup));
}

/**
 * The heading level each example renders, in the order given, or `null` where it renders none.
 *
 * A grid shows every tile at once, so the tiles are neighbours in the page outline in a way tab
 * panels never are: one panel is on screen at a time, and a level-4 specimen beside a level-2 one is
 * two clicks apart rather than two elements apart. Heading's own sweep is the case — `Subsection
 * Sized Up` sets `level: "4"` to make its point, and lands directly after a level-2 tile under the
 * group's own level-3 label, which is a skipped level and a real WCAG 1.3.1 failure on the page,
 * not a quibble of the checker.
 *
 * Asked by rendering, like everything else here, so the answer follows whatever the args actually
 * produce: a component that starts emitting a heading, or stops, needs no list updated anywhere.
 */
export function headingLevelExamples(name: string, examples: Example[]): (number | null)[] {
  return staticMarkup(name, examples).map((markup) => {
    const match = markup === null ? null : /<h([1-6])[\s/>]/i.exec(markup);
    return match === null ? null : Number(match[1]);
  });
}
