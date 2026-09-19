/**
 * Shared light/dark toolbar toggle for every Storybook in the monorepo.
 * Web-based stories switch mode by setting data-mode on <html>, which is all
 * the token CSS needs; the React Native Storybook maps the same global onto
 * its ThemeProvider instead.
 */
export const modeGlobal = {
  description: 'Color mode',
  defaultValue: 'light',
  toolbar: {
    title: 'Mode',
    icon: 'mirror',
    items: [
      { value: 'light', title: 'Light' },
      { value: 'dark', title: 'Dark' },
    ],
    dynamicTitle: true,
  },
};

export const withMode = (story: () => unknown, context: { globals: Record<string, unknown> }) => {
  const mode = (context.globals.mode as string) ?? 'light';
  document.documentElement.setAttribute('data-mode', mode);
  document.documentElement.style.background = 'var(--color-background)';
  // `color` as well as `background`, and for the same reason. The token CSS only declares custom
  // properties — it never applies them to a real `color` rule — so an app is expected to set the base
  // text colour itself, which apps/website does. Storybook is that app here, and without this line the
  // preview paints a dark background under the UA's initial black text: every part that inherits its
  // colour rather than setting its own (a TabPanel's content, a Splitter pane, a Card body, a Feed
  // item) renders #000000 on #17181b — 1.18:1, and 87 of the axe gate's dark-mode failures. The chrome
  // components (Dialog, Popover, Menu, SidePanel, DataGrid) each set `color` on their own root, which
  // is why they were never implicated and why this reads as a component bug until you measure it.
  document.documentElement.style.color = 'var(--color-foreground)';
  return story();
};
