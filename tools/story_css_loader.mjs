/**
 * A module hook that answers a stylesheet import with an empty module, so a story module can be
 * imported by a Node tool.
 *
 * `packages/react/src/<Name>.tsx` opens with `import './<Name>.css'` — the styling contract, and the
 * reason the package ships one stylesheet per component. Node has no loader for `.css`, so importing
 * a story module (which imports the component, which imports its stylesheet) fails on the first one
 * with `Unknown file extension ".css"`. Vite gives Storybook and the website that loader; a tool that
 * only wants the story's `args` needs the stylesheet's *contents* not at all, so this stands in an
 * empty module and lets the import finish.
 *
 * Plain `.mjs` rather than the repo's usual `.ts`: hooks are loaded in Node's own loader thread,
 * before (and independently of) the tsx hooks the tool itself runs under, so this file has to be
 * something Node can load unaided.
 *
 * Registered by tools/story_args.ts, which is the only thing that imports story modules.
 */

/** `./Card.css`, `./Card.css?inline`, and the same for the pre-processor extensions Vite also resolves. */
const STYLESHEET = /\.(?:css|scss|sass|less|styl)(?:[?#][^\\/]*)?$/;

/** An ES module with nothing in it — the shape `import './x.css'` and `import styles from './x.css'` both accept. */
const EMPTY_MODULE = 'data:text/javascript,export default {}';

export async function resolve(specifier, context, nextResolve) {
  if (STYLESHEET.test(specifier)) return { url: EMPTY_MODULE, shortCircuit: true };
  return nextResolve(specifier, context);
}
