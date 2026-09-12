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
 * Whether each example renders, in the order given.
 *
 * React writes a component stack to `console.error` before rethrowing, and a page with a dozen
 * source-only stories would bury the build log in stacks for failures that are already handled. The
 * probe is the one place that is expected, so it is the one place that quiets it.
 */
export function renderableExamples(name: string, examples: Example[]): boolean[] {
  const Component = COMPONENTS[name];
  if (typeof Component !== 'function') return examples.map(() => false);

  const error = console.error;
  console.error = () => {};
  try {
    return examples.map((example) => {
      try {
        renderToStaticMarkup(createElement(Component as ElementType, decodeArgs(example.args)));
        return true;
      } catch {
        return false;
      }
    });
  } finally {
    console.error = error;
  }
}
