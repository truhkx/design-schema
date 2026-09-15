/**
 * The themes the site offers, and the built stylesheet each one needs.
 *
 * The list comes from `generated/themes.json` (written by `tools/theme.ts`) rather than being typed
 * out here, so a theme that stops being published stops being offered. Only the *sheets* are
 * hand-registered, because Vite needs a literal specifier to emit an asset — and `publishedThemes()`
 * fails the build when a newly published theme has no sheet, instead of quietly dropping it from the
 * switcher.
 *
 * Build-time only. The browser side of theming is ./theme-switch.ts.
 */
// Imported rather than read with node:fs, for the reason ./nav.ts gives: a bundled server module's
// `import.meta.url` no longer points at this directory. Generated and gitignored — `pnpm themes`.
import themesJson from '../../../generated/themes.json';

import calmPreciseCss from '@design-schema/tokens/calm-precise/css?url';
import warmFriendlyCss from '@design-schema/tokens/warm-friendly/css?url';
import calmPreciseLight from '@design-schema/tokens/calm-precise/json/light';
import calmPreciseDark from '@design-schema/tokens/calm-precise/json/dark';
import warmFriendlyLight from '@design-schema/tokens/warm-friendly/json/light';
import warmFriendlyDark from '@design-schema/tokens/warm-friendly/json/dark';

/** A theme as the site needs it: the id the switcher sets, its title, and its stylesheet's URL. */
export type SiteTheme = { id: string; title: string; href: string };

/** The modes every built theme ships, as `data-mode` spells them. */
export const MODES = ['light', 'dark'] as const;
export type Mode = (typeof MODES)[number];

/** A theme's built token values, flat (`"font.size.xl": "23px"`), per mode. */
export type ThemeTokens = { id: string; modes: Record<Mode, Record<string, unknown>> };

/** One built token stylesheet per theme id. Add an entry when a new theme is published. */
const SHEETS: Record<string, string> = {
  'calm-precise': calmPreciseCss,
  'warm-friendly': warmFriendlyCss,
};

/**
 * The same themes' built token JSON — the numbers the stylesheets above hold, readable at build time.
 * The example grid quotes them under each tile (./example-sweep.ts), so a caption is the value the
 * theme actually built, not one worked out by hand. Add an entry beside the sheet.
 */
const TOKENS: Record<string, ThemeTokens['modes']> = {
  'calm-precise': { light: calmPreciseLight, dark: calmPreciseDark },
  'warm-friendly': { light: warmFriendlyLight, dark: warmFriendlyDark },
};

type ThemeEntry = { id?: unknown; title?: unknown; published?: unknown };

/** Every published theme, in themes.json order — the first is the site's default. */
export function publishedThemes(): SiteTheme[] {
  const parsed: unknown = themesJson;
  if (!Array.isArray(parsed)) {
    throw new Error('generated/themes.json should be an array of themes. Re-run `pnpm themes`.');
  }

  const themes: SiteTheme[] = [];
  for (const entry of parsed as ThemeEntry[]) {
    if (entry.published !== true) continue;
    const { id, title } = entry;
    if (typeof id !== 'string' || typeof title !== 'string') {
      throw new Error('Every theme in generated/themes.json needs a string `id` and `title`.');
    }
    const href = SHEETS[id];
    if (!href) {
      throw new Error(
        `Theme "${id}" is published but has no stylesheet registered in apps/website/src/themes.ts. ` +
          `Add \`import x from '@design-schema/tokens/${id}/css?url'\` and an entry in SHEETS.`,
      );
    }
    themes.push({ id, title, href });
  }

  // A SegmentedControl needs at least two options to be a switcher at all.
  if (themes.length < 2) {
    throw new Error(`generated/themes.json has ${themes.length} published theme(s); the theme switcher needs at least two.`);
  }
  return themes;
}

/** Every published theme's token values, in the same order — and a failed build for one with none registered. */
export function publishedThemeTokens(): ThemeTokens[] {
  return publishedThemes().map(({ id }) => {
    const modes = TOKENS[id];
    if (!modes) {
      throw new Error(
        `Theme "${id}" is published but has no token JSON registered in apps/website/src/themes.ts. ` +
          `Add \`import x from '@design-schema/tokens/${id}/json/light'\` (and dark) and an entry in TOKENS.`,
      );
    }
    return { id, modes };
  });
}
