/**
 * Hand-written module declared by site/src/content/docs/extensions/Button.analytics.md.
 * The generator imports `trackPress` from here and calls it; it never edits this file.
 * Replace the body with the analytics vendor of your choice; keep the signature.
 */
declare const process: { env: { NODE_ENV?: string | undefined } };

export function trackPress(name: string, label: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics] press', name, label);
  }
}
