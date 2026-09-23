/**
 * Server render + hydration for the overlays that portal (job 543). Hand-written, not generated: the
 * website renders every example on the server and hydrates it, and a component whose first client
 * render differs from the server's (a portal into a host the server never had, a `matchMedia` read in
 * a `useState` initializer) throws React's hydration mismatch and re-renders the whole island.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, type ReactElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ActionSheet } from './ActionSheet';
import { Button } from './Button';
import { SidePanel } from './SidePanel';
import { ToastRegion } from './Toast';
import { Tooltip } from './Tooltip';

let root: Root | null = null;
let host: HTMLElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  document.body.innerHTML = '';
});

/** Server-renders `element`, hydrates the markup, and returns every error React recovered from. */
async function hydrate(element: ReactElement): Promise<unknown[]> {
  const errors: unknown[] = [];
  host = document.createElement('div');
  host.innerHTML = renderToString(element);
  document.body.appendChild(host);
  await act(async () => {
    root = hydrateRoot(host!, element, {
      onRecoverableError: (error) => errors.push(error),
      onCaughtError: (error) => errors.push(error),
      onUncaughtError: (error) => errors.push(error),
    });
  });
  return errors;
}

const ACTIONS = [
  { id: 'share', label: 'Share' },
  { id: 'delete', label: 'Delete', tone: 'danger' as const },
];

describe('hydration', () => {
  for (const open of [false, true]) {
    it(`SidePanel (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <SidePanel heading="Menu" open={open} trigger={<Button label="Menu" />}>
          <a href="#one">One</a>
        </SidePanel>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="SidePanel"]')).not.toBeNull();
    });

    it(`modal SidePanel (open: ${open}) hydrates without a mismatch`, async () => {
      const errors = await hydrate(
        <SidePanel heading="Menu" modal open={open} trigger={<Button label="Menu" />}>
          <a href="#one">One</a>
        </SidePanel>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="SidePanel"]') !== null).toBe(open);
    });

    it(`ActionSheet (open: ${open}) hydrates without a mismatch`, async () => {
      const errors = await hydrate(<ActionSheet open={open} heading="Photo.jpg" actions={ACTIONS} />);
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="ActionSheet"]') !== null).toBe(open);
    });

    it(`Tooltip (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <Tooltip content="Includes archived items" open={open}>
          <Button label="Items" variant="secondary" />
        </Tooltip>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Tooltip"]')).not.toBeNull();
      expect(document.querySelector('[data-part="popup"]') !== null).toBe(open);
    });
  }

  it('ToastRegion hydrates without a mismatch and portals the live region afterwards', async () => {
    const errors = await hydrate(<ToastRegion />);
    expect(errors).toEqual([]);
    const region = document.querySelector('[data-ds="ToastRegion"]');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
