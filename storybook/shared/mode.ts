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
  return story();
};
