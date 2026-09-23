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
import { AlertDialog } from './AlertDialog';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Combobox } from './Combobox';
import { DatePicker } from './DatePicker';
import { Dialog } from './Dialog';
import { Menu } from './Menu';
import { Popover } from './Popover';
import { Search } from './Search';
import { Select } from './Select';
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

    it(`Dialog (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <Dialog open={open} heading="Rename project">
          <input aria-label="Project name" defaultValue="Q3 roadmap" />
        </Dialog>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Dialog"]') !== null).toBe(open);
    });

    it(`BottomSheet (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <BottomSheet open={open} heading="Filters">
          <input aria-label="Days" defaultValue="30" />
        </BottomSheet>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="BottomSheet"]') !== null).toBe(open);
    });

    it(`AlertDialog (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <AlertDialog
          open={open}
          heading="Delete 3 files?"
          description="They will be removed from all shared folders. This cannot be undone."
          confirmLabel="Delete files"
        />,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="AlertDialog"]') !== null).toBe(open);
    });

    it(`Menu (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(<Menu open={open} label="More actions" items={ACTIONS} />);
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Menu"]')).not.toBeNull();
      expect(document.querySelector('[role="menu"]') !== null).toBe(open);
    });

    it(`Popover (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <Popover open={open} heading="Filters" trigger={<Button label="Filters" />}>
          <a href="#one">One</a>
        </Popover>,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Popover"]') !== null).toBe(open);
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

    it(`Select (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <Select label="Country" name="country" open={open} options={[{ value: 'ca', label: 'Canada' }]} />,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Select"]')).not.toBeNull();
      expect(document.querySelector('[role="listbox"]') !== null).toBe(open);
    });

    it(`Combobox (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(
        <Combobox label="Fruit" name="fruit" open={open} options={[{ value: 'apple', label: 'Apple' }]} />,
      );
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="Combobox"]')).not.toBeNull();
      expect(document.querySelector('[role="listbox"]') !== null).toBe(open);
    });

    it(`DatePicker (open: ${open}) hydrates without a mismatch and portals afterwards`, async () => {
      const errors = await hydrate(<DatePicker label="Due date" name="due" open={open} defaultValue="2026-09-10" />);
      expect(errors).toEqual([]);
      expect(document.querySelector('[data-ds="DatePicker"]')).not.toBeNull();
      expect(document.querySelector('[role="grid"]') !== null).toBe(open);
    });
  }

  it('Search with suggestions hydrates without a mismatch and opens its portaled list afterwards', async () => {
    const errors = await hydrate(
      <Search label="Search products" defaultValue="inv" suggestions={[{ value: 'invoices', label: 'Invoices' }]} />,
    );
    expect(errors).toEqual([]);
    const input = document.querySelector<HTMLInputElement>('[data-ds="Search"] input[type="search"]')!;
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).not.toHaveAttribute('aria-controls');
    act(() => input.focus());
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    });
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    expect(input).toHaveAttribute('aria-controls', document.querySelector('[role="listbox"]')!.id);
  });

  it('ToastRegion hydrates without a mismatch and portals the live region afterwards', async () => {
    const errors = await hydrate(<ToastRegion />);
    expect(errors).toEqual([]);
    const region = document.querySelector('[data-ds="ToastRegion"]');
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
