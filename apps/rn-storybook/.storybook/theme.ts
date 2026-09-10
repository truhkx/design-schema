// Shared between the on-device "Theme" addon panel and the preview decorator: the current selection
// and the channel event that carries it.
export const THEME_EVENT = 'design-schema/theme';

export const THEMES = ['calm-precise', 'warm-friendly'] as const;
export const MODES = ['system', 'light', 'dark'] as const;

export type ThemeId = (typeof THEMES)[number];
export type ModeSetting = (typeof MODES)[number];

export interface ThemeSelection {
  theme: ThemeId;
  mode: ModeSetting;
}

export const DEFAULT_SELECTION: ThemeSelection = { theme: 'calm-precise', mode: 'system' };

/** The last selection, so a story mounted after the panel changed it starts in the right state. */
export const current: { value: ThemeSelection } = { value: DEFAULT_SELECTION };
