/**
 * Applying a theme choice in the browser.
 *
 * A theme's token stylesheet declares its custom properties on `:root`, so two of them loaded at
 * once would simply have the last one win: switching themes means enabling one sheet and disabling
 * the rest, not toggling an attribute the way light/dark mode does. Layout.astro emits one
 * `<link rel="stylesheet">` per published theme, tagged with `THEME_LINK_ATTR`, and everything here
 * flips their `media` between `all` and `not all` — the portable way to disable a sheet that keeps
 * the browser prefetching it, so a switch is instant.
 *
 * Deliberately free of node imports: both the hydrated header island and Layout.astro's
 * `is:inline` <script> need these names. That script cannot import, so it repeats the four lines of
 * `applyTheme` — keep the two in step.
 */

/** Where the chosen theme id is remembered across page loads. */
export const THEME_STORAGE_KEY = 'design-schema:theme';

/** Marks each theme's `<link>` with the theme it carries, and `<html>` with the active one. */
export const THEME_LINK_ATTR = 'data-ds-theme';

/** Enables that theme's stylesheet, disables the others, and remembers the choice. */
export function applyTheme(id: string): void {
  for (const link of document.querySelectorAll<HTMLLinkElement>(`link[${THEME_LINK_ATTR}]`)) {
    link.media = link.getAttribute(THEME_LINK_ATTR) === id ? 'all' : 'not all';
  }
  document.documentElement.setAttribute(THEME_LINK_ATTR, id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Storage denied (private mode, blocked cookies). The switch still works; it just won't persist.
  }
}
