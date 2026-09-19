/**
 * The docs section pages' Markdown pipeline: one `docs` collection entry → the HTML this site shows.
 *
 * The `docs` collection (../../content.config.ts) reads `site/src/content/docs` in place, and Astro's
 * Content Layer renders each Markdown entry to HTML when it loads it, so the prose on
 * /docs/foundations, /docs/foundations/spec-sheet and /docs/patterns is the same Markdown the
 * contributor site serves — never a copy, and nothing on those pages is written twice.
 *
 * Why the rendered HTML is taken as a *string* (`entry.rendered.html`) rather than through
 * `render(entry)`'s `<Content />`: four things have to happen to Markdown written for the Starlight
 * reference site before this app can show it, and all four are edits to the finished HTML.
 *
 *   1. **Headings shift down one level, on a section page.** A doc's body starts at `##` because
 *      Starlight supplies the `<h1>` from frontmatter. A section page supplies the `<h1>` *and* an
 *      `<h2>` per document, so every body heading moves one step down and the outline runs
 *      h1 → h2 → h3 with nothing skipped — `heading-order` is one of the axe rules the site's gates
 *      hold to zero. A page that renders *one* document (the spec sheet) is the h1 and nothing else,
 *      so there the body's own `##` is already the next level and `shiftHeadings: false` leaves it
 *      alone; shifting it there would skip h2 instead.
 *   2. **Links are re-pointed at this site's routes.** The docs link each other as Starlight routes
 *      (`/components/focusscope/`, `/foundations/layout/`), none of which exist here. A component
 *      link becomes that component's page, a link to a document rendered on its section page becomes
 *      an anchor on it, a link to one with a page of its own becomes that page, and an internal link
 *      this site has no page for loses its anchor and keeps its text — a dead link is a defect; the
 *      sentence it sits in is not.
 *   3. **Generated colours are re-bound to tokens.** Shiki highlights a fenced block against its own
 *      bundled palette (`github-dark`, hard-coded hexes) and `tools/spec_sheet.ts` draws its bars in
 *      Starlight's `--sl-*` custom properties. Neither palette exists here, so the code block's
 *      colours come off (../../components/code.css explains at length why a block on this site takes
 *      the theme's own) and the two `--sl-*` names are bound to this system's tokens. The spec
 *      sheet's colour *swatches* keep their inline hex: there the colour is the content — it is the
 *      token's resolved value — not a palette choice.
 *   4. **Every table gets a scroll container.** Markdown emits a bare `<table>`; a wide one in a
 *      narrow column takes the whole page into a horizontal scroll, which is exactly what the phone
 *      layout must not do. The wrapper scrolls instead, and carries `tabindex="0"` so it is
 *      reachable by keyboard (axe's `scrollable-region-focusable`), the same way Shiki marks a code
 *      block wider than its column.
 *
 * Everything here is a pure function on purpose: the pages do the `getCollection` and hand the
 * results in, so the transforms can be exercised without a build.
 */
import type { NavGroup } from '../../nav';

/**
 * The shape of a `docs` entry this module needs — structurally what `getCollection('docs')` returns,
 * named here so the helpers below can be read (and tested) without Astro's generated types.
 */
export interface DocEntry {
  /** The file's basename, the id the collection is keyed by (`tokens`, `spec-sheet`). */
  id: string;
  /** Where the Markdown lives, relative to this app: `../../site/src/content/docs/<folder>/<id>.md`. */
  filePath?: string | undefined;
  data: {
    title: string;
    description: string;
    /** Starlight's frontmatter. Only `order` is read here — it is the contributor site's own ordering. */
    sidebar?: { order?: number | undefined } | undefined;
  };
  /** Astro's rendered Markdown. Present for every `.md` entry the glob loader loads. */
  rendered?: { html: string } | undefined;
}

/** The folders under `site/src/content/docs` that this site renders as docs sections. */
export const SECTION_FOLDERS = ['foundations', 'patterns'] as const;
export type SectionFolder = (typeof SECTION_FOLDERS)[number];

/**
 * Documents that get a route of their own instead of a section on their section's page.
 *
 * One, and it is a size judgement rather than a kind of judgement: `spec-sheet.md` is the generated
 * value-by-value reference for a whole theme — 393 KB of Markdown, roughly ten times the rest of the
 * Foundations folder put together, with a table per component. Inlining it would bury the four
 * written foundations documents under it and make the section page a megabyte to load. Everything
 * else in these folders is a few pages of prose that reads better in one sitting.
 *
 * Adding an id here needs two other edits, both of which say so: `DOCS_SECTIONS` in ../../nav.ts, so
 * the sidebar and the mobile Select reach the page, and `FIXED_ROUTES` in tools/site_routes.ts, so
 * the deploy gate checks it was built.
 */
export const OWN_PAGE_IDS: ReadonlySet<string> = new Set(['spec-sheet']);

/**
 * The documents of one folder under `site/src/content/docs`, in the order the frontmatter asks for.
 *
 * `sidebar.order` is Starlight's ordering key and the docs already carry it (layout 2, styling 3,
 * focus-management 4, spec-sheet 9), so a section page shows its documents in the order their
 * authors put them in rather than in a second order invented here. A document with no `order` sorts
 * first — `tokens.md` is the only one, and it is the one the others build on.
 */
export function sectionDocs(entries: readonly DocEntry[], folder: string): DocEntry[] {
  const prefix = `/docs/${folder}/`;
  return entries
    .filter((entry) => (entry.filePath ?? '').replaceAll('\\', '/').includes(prefix))
    .sort((a, b) => (a.data.sidebar?.order ?? 0) - (b.data.sidebar?.order ?? 0) || a.data.title.localeCompare(b.data.title));
}

/** One document by its collection id, or `undefined` — the caller decides whether that is an error. */
export function docById(entries: readonly DocEntry[], id: string): DocEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

/** Where a document is read on this site: a section of its section page, or a page of its own. */
export function docHref(entry: DocEntry, folder: SectionFolder): string {
  return OWN_PAGE_IDS.has(entry.id) ? `/docs/${folder}/${entry.id}` : `/docs/${folder}#${entry.id}`;
}

/** Every document id that is a section of a section page, so a link to one is an anchor on it. */
export function anchoredIds(entries: readonly DocEntry[]): Set<string> {
  const ids = new Set<string>();
  for (const folder of SECTION_FOLDERS) {
    for (const doc of sectionDocs(entries, folder)) if (!OWN_PAGE_IDS.has(doc.id)) ids.add(doc.id);
  }
  return ids;
}

/** Every component slug in `generated/nav.json` — the pages that exist under /docs/components. */
export function componentSlugs(groups: readonly NavGroup[]): Set<string> {
  return new Set(groups.flatMap((group) => group.components.map((component) => component.slug)));
}

/**
 * Body headings, one level down each: h5 → h6 first so the shift never cascades (an h2 promoted to
 * h3 must not then be caught by the h3 rule). An h6 stays an h6 — six is as deep as HTML goes, and
 * no doc in these folders reaches even h4.
 */
const HEADING_SHIFT: readonly (readonly [RegExp, string])[] = [
  [/<(\/?)h5(\s|>)/g, '<$1h6$2'],
  [/<(\/?)h4(\s|>)/g, '<$1h5$2'],
  [/<(\/?)h3(\s|>)/g, '<$1h4$2'],
  [/<(\/?)h2(\s|>)/g, '<$1h3$2'],
];

/** `<a href="…" …>text</a>`. Markdown links never nest, so one non-greedy match is one whole link. */
const LINK = /<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g;

/** A Starlight component route: `/components/<slug>/`, optionally with a fragment. */
const COMPONENT_LINK = /^\/components\/([^/#?]+)\/?(#[^?]*)?$/;
/** A Starlight route into a folder this site renders as a docs section: `/foundations/<id>/`. */
const SECTION_LINK = /^\/(foundations|patterns)\/([^/#?]+)\/?$/;

/** One Shiki block, from its opening tag to its `</pre>`. */
const CODE_BLOCK = /<pre class="astro-code[^"]*"[\s\S]*?<\/pre>/g;

/** Where a route on the reference site lives here, or `null` for "this site has no such page". */
function retarget(href: string, context: ProseContext): string | null {
  if (href === '' || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  if (href.startsWith('/docs/')) return href;

  const component = COMPONENT_LINK.exec(href);
  if (component?.[1] !== undefined && context.componentSlugs.has(component[1])) {
    return `/docs/components/${component[1]}${component[2] ?? ''}`;
  }

  const section = SECTION_LINK.exec(href);
  if (section?.[1] !== undefined && section[2] !== undefined) {
    return context.anchored.has(section[2]) ? `/docs/${section[1]}#${section[2]}` : `/docs/${section[1]}/${section[2]}`;
  }

  return null;
}

/** What a page knows that this module does not: which routes exist, and which ids are anchors. */
export interface ProseContext {
  /** Every component slug in `generated/nav.json`. See `componentSlugs()`. */
  componentSlugs: ReadonlySet<string>;
  /** Document ids rendered inline on their section page. See `anchoredIds()`. */
  anchored: ReadonlySet<string>;
  /**
   * Whether the body's headings move down a level. True (the default) for a section page, which puts
   * an `<h2>` of its own above each document; false for a page that is one document, where the body
   * already sits directly under the page's `<h1>`. See transform 1 at the top of this file.
   */
  shiftHeadings?: boolean | undefined;
}

/**
 * One document's rendered Markdown, ready for this site — the four transforms at the top of this
 * file, in that order.
 *
 * Throws rather than rendering an empty section when Astro has no HTML for an entry: a section page
 * silently missing a document is exactly the defect these pages exist to fix.
 */
export function proseHtml(entry: DocEntry, context: ProseContext): string {
  const source = entry.rendered?.html;
  if (source === undefined) {
    throw new Error(`The docs collection has no rendered HTML for "${entry.id}" (${entry.filePath ?? 'unknown file'}).`);
  }

  let html = source;
  if (context.shiftHeadings !== false) {
    for (const [pattern, replacement] of HEADING_SHIFT) html = html.replace(pattern, replacement);
  }

  html = html.replace(LINK, (whole, href: string, attrs: string, text: string) => {
    const target = retarget(href, context);
    if (target === null) return text;
    return target === href ? whole : `<a href="${target}"${attrs}>${text}</a>`;
  });

  // Shiki's palette, scoped to the blocks Shiki wrote: its theme name on the <pre> and every inline
  // colour inside it. The markup keeps its `tabindex="0"`, which is what makes a block wider than
  // its column reachable by keyboard; the colours come back from the theme's tokens, in the
  // stylesheet. Nothing outside a code block is touched, so the spec sheet's swatches survive.
  html = html.replace(CODE_BLOCK, (block) =>
    block.replace(/ style="[^"]*"/g, '').replace(/class="astro-code[^"]*"/, 'class="astro-code"'),
  );

  html = html
    // The two Starlight custom properties tools/spec_sheet.ts writes, bound to this system's own
    // tokens instead of falling back to the grey and the generic monospace stack it named.
    .replaceAll('var(--sl-color-accent, #888)', 'var(--color-foreground-muted)')
    .replaceAll('var(--sl-font-mono, monospace)', 'var(--font-family-mono)')
    // Markdown emits a bare table; this is the column it scrolls in.
    .replaceAll('<table>', '<div class="ds-prose__scroll" tabindex="0"><table>')
    .replaceAll('</table>', '</table></div>');

  return html;
}
