/**
 * Hand-written module declared by site/src/content/docs/extensions/Button.analytics.md.
 * The generator imports `trackPress` from here and calls it; it never edits this file.
 * Replace the body with the analytics vendor of your choice; keep the signature.
 */
export function trackPress(name: string, label: string): void {
  if (__DEV__) {
    console.debug('[analytics] press', name, label);
  }
}
