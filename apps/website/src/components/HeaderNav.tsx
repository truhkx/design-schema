import { useEffect, useRef, useState } from 'react';
import { Button, Icon, Link, SegmentedControl, SidePanel, Stack } from '@design-schema/react';
import { layoutBreakpointMd } from '@design-schema/tokens/calm-precise/light';

import type { TopItem } from '../nav';
import { applyTheme, THEME_LINK_ATTR } from '../theme-switch';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  navLabel: 'Main',
  menuHeading: 'Menu',
  openMenu: 'Open menu',
  themeLabel: 'Theme',
};

export interface HeaderNavProps {
  /** The top-level links, from `generated/nav.json`'s `top` list. Never hand-written. */
  items: TopItem[];
  /** The published themes, from `generated/themes.json`. The first is the default. */
  themes: { id: string; title: string }[];
}

/**
 * The interactive half of the site header: the nav links, the theme switcher, and — below
 * `layout.breakpoint.md` — the hamburger and its `SidePanel` drawer
 * (site/src/content/docs/process/website-plan.md, "Global chrome").
 *
 * Both shapes are rendered, and Header.astro's media query shows exactly one: the swap is a CSS
 * decision about the viewport, so it happens before hydration and survives with JavaScript slow or
 * broken. The `matchMedia` below is only a safety net — it closes a drawer left open when the
 * window grows past the breakpoint and takes the hamburger away with it.
 */
export default function HeaderNav({ items, themes }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  // The server has no way to know the visitor's remembered theme, so it renders the default and
  // Layout.astro's inline script corrects <html> before first paint; this picks that up on hydration.
  const [theme, setTheme] = useState(() => themes[0]?.id ?? '');

  useEffect(() => {
    const active = document.documentElement.getAttribute(THEME_LINK_ATTR);
    if (active && themes.some((candidate) => candidate.id === active)) setTheme(active);
  }, [themes]);

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

  /**
   * Returning focus to the hamburger when the drawer closes.
   *
   * A modal SidePanel delegates that to FocusScope's `restoreFocus`, but in this composition it
   * does not land: SidePanel moves focus into the panel in a *layout* effect, and FocusScope records
   * the opener in a *passive* one, so the element it remembers to return to is the panel's own first
   * link — already gone by the time it restores. The trigger is SidePanel's own cloned element, so
   * there is no ref to hold; it is the one button inside this wrapper, and it carries the panel's id
   * in `aria-controls`.
   *
   * The timing is the fiddly part, and racing it with a frame or two proved flaky. While the panel
   * is still mounted its focus trap pulls any focus outside it straight back in, so this waits for
   * the panel to leave the DOM; FocusScope's misdirected restore then runs a React tick later and
   * moves focus to the first focusable in the document (the logo link). So rather than guess when
   * that happens, this holds the focus: any focus that lands somewhere else without the visitor
   * having pressed or clicked anything is that restore, and gets taken back. The hold ends at the
   * next real input, or after a moment if none comes.
   */
  const narrowRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return undefined;
    }
    if (!wasOpen.current) return undefined;
    wasOpen.current = false;

    const trigger = narrowRef.current?.querySelector('button');
    if (!trigger) return undefined;
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;

    let release = () => {};

    const holdFocus = () => {
      let timer = 0;
      const reclaim = (event: FocusEvent) => {
        if (event.target !== trigger) trigger.focus();
      };
      const stop = () => {
        document.removeEventListener('focusin', reclaim, true);
        document.removeEventListener('keydown', stop, true);
        document.removeEventListener('pointerdown', stop, true);
        window.clearTimeout(timer);
      };
      document.addEventListener('focusin', reclaim, true);
      document.addEventListener('keydown', stop, true);
      document.addEventListener('pointerdown', stop, true);
      timer = window.setTimeout(stop, 500);
      release = stop;
      trigger.focus();
    };

    if (!panel) {
      holdFocus();
      return () => release();
    }

    const observer = new MutationObserver(() => {
      if (document.contains(panel)) return;
      observer.disconnect();
      holdFocus();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      release();
    };
  }, [open]);

  const chooseTheme = (id: string) => {
    setTheme(id);
    applyTheme(id);
  };

  const links = items.map((item) => (
    <Link key={item.href} href={item.href} label={item.label} external={item.external} tone="inherit" />
  ));

  // One control per layout, both driven by the same state: only one of the two is ever displayed,
  // and whichever the visitor uses, the other agrees when the viewport changes under it.
  const themeControl = (
    <SegmentedControl
      label={COPY.themeLabel}
      size="sm"
      value={theme}
      options={themes.map((entry) => ({ value: entry.id, label: entry.title }))}
      onChange={chooseTheme}
    />
  );

  // `label` is the accessible name of an `iconOnly` Button — `accessibleName` exists only to say
  // *more* than a visible label, and this one has none. SidePanel clones the trigger with
  // `aria-expanded` and `aria-controls`, so the open state is announced without any wiring here.
  const hamburger = <Button variant="ghost" iconOnly label={COPY.openMenu} leadingIcon={<Icon name="menu" inline />} />;

  return (
    <>
      <div className="ds-site-header__wide">
        <Stack direction="horizontal" gap="normal" align="center">
          {/* One group next to the lockup: `gap="loose"` spaces the links, and
              `ds-site-header__links` takes the row's slack so the theme control stays at the end. */}
          <Stack
            element="nav"
            aria-label={COPY.navLabel}
            className="ds-site-header__links"
            direction="horizontal"
            gap="loose"
            align="center"
          >
            {links}
          </Stack>
          {themeControl}
        </Stack>
      </div>

      <div className="ds-site-header__narrow" ref={narrowRef}>
        <SidePanel
          heading={COPY.menuHeading}
          modal
          width="narrow"
          open={open}
          onOpenChange={setOpen}
          footer={themeControl}
          trigger={hamburger}
        >
          <Stack element="nav" aria-label={COPY.navLabel} direction="vertical" gap="normal" align="start">
            {links}
          </Stack>
        </SidePanel>
      </div>
    </>
  );
}
