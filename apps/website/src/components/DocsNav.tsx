import { useEffect, useRef, useState } from 'react';
import { Disclosure, Landmark, Link, Select, Stack, type ListboxOption, type SelectValue } from '@design-schema/react';
import { layoutBreakpointMd } from '@design-schema/tokens/calm-precise/light';

import { componentRoute, type NavGroup, type TopItem } from '../nav';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  navLabel: 'Component docs',
  selectPlaceholder: 'Jump to a page…',
};

export interface DocsNavProps {
  /** Foundations and Patterns, above the phase groups. From `DOCS_SECTIONS`. */
  sections: TopItem[];
  /** The phase groups, from `generated/nav.json`'s `docs` list. Never hand-written. */
  groups: NavGroup[];
  /** The route of the page being rendered, so the current entry is marked. */
  current?: string | undefined;
}

/**
 * The docs navigation, in both of its renderings (website-plan.md, "Docs section").
 *
 * Above `layout.breakpoint.md` it is the sidebar: a `navigation` landmark holding the two section
 * links and one `Disclosure` per roadmap phase, each open by default. Below it the sidebar is
 * replaced by a single `Select` whose options are grouped exactly the same way — and which is *not*
 * a landmark, so a narrow viewport has one docs nav, not two.
 *
 * Both are rendered and ../components/docs-sidebar.css shows exactly one, the same arrangement the
 * header uses: which one a viewport gets is a media query the browser already knows the answer to,
 * so it does not wait on hydration. This is an island because both halves need script to be worth
 * anything — a `Disclosure` that never collapses is a dead button, and the `Select` navigates from
 * `onChange`. Astro still renders the markup at build time, so every link is in view-source and
 * works with the island's JavaScript slow or blocked.
 */
export default function DocsNav({ sections, groups, current }: DocsNavProps) {
  // Controlled only so the popup can be closed when the viewport grows past the breakpoint, the same
  // safety net HeaderNav's drawer carries. The media query takes the whole rendering away with it,
  // so nothing is left on screen either way; what this avoids is the state surviving the trip —
  // a Select that was open on a phone, and is open again the moment the window narrows back.
  const [open, setOpen] = useState(false);
  /**
   * The Select's popup is portaled, and its default target is `document.body` — which is outside
   * every landmark on the page, so an open popup puts content in no landmark at all (axe's `region`
   * rule, one of the ones Lighthouse scores). `container` is the component's own answer to that:
   * the popup is `position: fixed` against the viewport, so where it is in the tree is a semantic
   * choice, not a layout one, and here it belongs inside `main` with the nav that opened it.
   */
  const narrowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia(`(min-width: ${layoutBreakpointMd})`);
    const update = () => {
      if (query.matches) setOpen(false);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const link = (href: string, label: string) => (
    <Link key={href} href={href} label={label} tone="inherit" aria-current={href === current ? 'page' : undefined} />
  );

  /** The same two lists the sidebar renders, as `Select`'s grouped options: sections first, then one
   *  group per phase. Each option's value is the route, which is all `onChange` needs. */
  const options: ListboxOption[] = [
    ...sections.map((section) => ({ value: section.href, label: section.label })),
    ...groups.map((group) => ({
      group: group.phase,
      options: group.components.map((component) => ({ value: componentRoute(component.slug), label: component.name })),
    })),
  ];

  /**
   * The page being read, but only when it is one of the options — the docs section's own landing
   * page is not. A value no option carries would be shown in the trigger as the raw route, so
   * `/docs` gets the placeholder instead, which is what a picker with nothing chosen should say.
   */
  const routes = new Set([
    ...sections.map((section) => section.href),
    ...groups.flatMap((group) => group.components.map((component) => componentRoute(component.slug))),
  ]);
  const chosen = current !== undefined && routes.has(current) ? current : undefined;

  // Cross-page navigation, not in-page state: there is no client-side router on this site, so the
  // chosen route is a plain assignment (website-plan.md, "Sidebar → Select").
  const navigate = (value: SelectValue) => {
    const href = Array.isArray(value) ? value[0] : value;
    if (href && href !== current) window.location.assign(href);
  };

  return (
    <>
      <div className="ds-docs-nav__wide">
        {/*
          The sticky box is ours, not the Landmark: components/landmark.md is explicit that Landmark
          takes no className or style, and that a composite needing its own positioning "renders its
          own styled element and composes Landmark inside it" (SidePanel does the same). Putting
          ds-docs-nav__sidebar back on <Landmark> silently drops it — the class is not in its props —
          which is how the sidebar lost position: sticky and overlapped the footer.
        */}
        <div className="ds-docs-nav__sidebar">
          <Landmark role="navigation" label={COPY.navLabel}>
            <Stack direction="vertical" gap="normal">
              {sections.map((section) => link(section.href, section.label))}
              {groups.map((group) => (
                <Disclosure key={group.phase} summary={group.phase} defaultOpen>
                  <Stack direction="vertical" gap="tight">
                    {group.components.map((component) => link(componentRoute(component.slug), component.name))}
                  </Stack>
                </Disclosure>
              ))}
            </Stack>
          </Landmark>
        </div>
      </div>

      <div className="ds-docs-nav__narrow" ref={narrowRef}>
        <Select
          label={COPY.navLabel}
          name="docs-nav"
          size="sm"
          options={options}
          defaultValue={chosen}
          placeholder={COPY.selectPlaceholder}
          container={narrowRef.current ?? undefined}
          open={open}
          onOpenChange={setOpen}
          onChange={navigate}
        />
      </div>
    </>
  );
}
