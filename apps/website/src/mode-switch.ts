/**
 * Applying a light / dark / system choice in the browser.
 *
 * Unlike a theme, a mode is not a separate stylesheet: every theme's token sheet already declares its
 * whole dark palette on `[data-mode="dark"]`, so switching modes is one attribute on `<html>`. The
 * visitor picks `light`, `dark` or `system`; only the first two are ever written to `data-mode`, and
 * `system` resolves through `prefers-color-scheme`. `system` is the default when nothing is stored.
 *
 * Deliberately free of node imports, like ./theme-switch.ts: both the hydrated header island and
 * Layout.astro's `is:inline` <script> need these names. That script cannot import, so it repeats
 * `resolveMode` and `applyMode` — keep the two in step. It is also what keeps following the media
 * query while `system` is selected, for the page's whole lifetime, so nothing here listens.
 */

/** Where the chosen mode is remembered across page loads. */
export const MODE_STORAGE_KEY = 'design-schema:mode';

/** The choices the header offers, in the order it offers them. */
export const MODE_CHOICES = ['light', 'dark', 'system'] as const;
export type ModeChoice = (typeof MODE_CHOICES)[number];

/** What `data-mode` can actually hold: the two halves of every token sheet. */
export type ResolvedMode = 'light' | 'dark';

/** The media query `system` follows. */
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/** A stored value as a choice: anything unrecognised (or nothing at all) is `system`. */
export function parseMode(stored: string | null | undefined): ModeChoice {
  return (MODE_CHOICES as readonly string[]).includes(stored ?? '') ? (stored as ModeChoice) : 'system';
}

/** The mode a stored choice means right now, given whether the system prefers dark. */
export function resolveMode(stored: string | null | undefined, prefersDark: boolean): ResolvedMode {
  const choice = parseMode(stored);
  if (choice === 'system') return prefersDark ? 'dark' : 'light';
  return choice;
}

/** Sets `data-mode` on `<html>`, and nothing else — the caller decides what to remember. */
export function applyMode(mode: ResolvedMode): void {
  document.documentElement.setAttribute('data-mode', mode);
}

/** The remembered choice, or `system` when storage is empty or denied. */
export function storedMode(): ModeChoice {
  try {
    return parseMode(localStorage.getItem(MODE_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

/** Remembers a choice and applies what it resolves to. */
export function chooseMode(choice: ModeChoice): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, choice);
  } catch {
    // Storage denied. The switch still works for this page; it just won't persist.
  }
  const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia(PREFERS_DARK_QUERY).matches;
  applyMode(resolveMode(choice, prefersDark));
}
