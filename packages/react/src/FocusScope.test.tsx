/**
 * FocusScope — behavior scenarios from the doc, then restore-to-opener through a parent that moves focus in its own layout effect.
 * Every overlay composite renders <FocusScope autoFocus="none" restoreFocus> and focuses its own
 * content in useLayoutEffect; the scope must record the opener before that move, or it "restores"
 * to an element inside the overlay that is gone once it unmounts.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { ActionSheet } from './ActionSheet';
import { AlertDialog } from './AlertDialog';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { FocusScope, type FocusScopeProps } from './FocusScope';
import meta from './FocusScope.stories';
import { SidePanel } from './SidePanel';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FocusScopeProps> = {}) {
  const props = { ...meta.args, ...given } as ComponentProps<typeof FocusScope>;
  const utils = render(<FocusScope {...props} />);
  return { ...utils, root: () => utils.container.querySelector<HTMLElement>('[data-ds="FocusScope"]')! };
}

/** Behavior scenarios from the component doc, one test each, in the doc's order. */
describe('FocusScope behavior', () => {
  it('auto-focus-container-focuses-the-wrapper', () => {
    const s = setup({ autoFocus: 'container' });
    expect(s.root()).toHaveAttribute('tabindex', '-1');
    expect(s.root()).toHaveFocus();
  });

  it('auto-focus-none-moves-focus-nowhere', () => {
    const before = document.activeElement;
    const s = setup({ autoFocus: 'none' });
    expect(document.activeElement).toBe(before);
    expect(s.root().contains(document.activeElement)).toBe(false);
  });

  it('the-wrapper-is-not-focusable', () => {
    const s = setup({ autoFocus: 'none' });
    expect(s.root()).not.toHaveAttribute('tabindex');
    s.root().focus();
    expect(s.root()).not.toHaveFocus();
  });

  it('the-scope-adds-no-role', () => {
    const s = setup();
    expect(s.root().getAttribute('role')).toBeNull();
  });

  it('renders', () => {
    expect(setup().root()).toBeInTheDocument();
  });

  it('renders-auto-focus-first', () => {
    expect(setup({ autoFocus: 'first' }).root()).toBeInTheDocument();
  });

  it('renders-auto-focus-last', () => {
    expect(setup({ autoFocus: 'last' }).root()).toBeInTheDocument();
  });

  it('renders-auto-focus-container', () => {
    expect(setup({ autoFocus: 'container' }).root()).toBeInTheDocument();
  });

  it('renders-auto-focus-none', () => {
    expect(setup({ autoFocus: 'none' }).root()).toBeInTheDocument();
  });
});

// jsdom has no matchMedia and never fires transitionend: report reduced motion so exits finish
// synchronously, and no wide viewport so the sheets keep their bottom-edge presentation.
const originalMatchMedia = window.matchMedia;
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

type Overlay = (props: { open: boolean; close: () => void }) => ReactElement;

/** An "Open" button that controls `overlay`; focuses and clicks it, as a user would. */
function openFrom(overlay: Overlay) {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        {/* Focusable content before the opener, so a fallback to "first focusable" can't pass by accident. */}
        <a href="#top">Page header link</a>
        <Button label="Open" onClick={() => setOpen(true)} />
        {overlay({ open, close: () => setOpen(false) })}
      </>
    );
  }
  render(<Harness />);
  const opener = screen.getByRole('button', { name: 'Open' });
  opener.focus();
  fireEvent.click(opener);
  const dialog = document.body.querySelector('dialog') as HTMLDialogElement;
  expect(dialog).not.toBeNull();
  expect(dialog.contains(document.activeElement)).toBe(true);
  return { opener, dialog };
}

const cancel = (dialog: HTMLDialogElement) => fireEvent(dialog, new Event('cancel', { cancelable: true }));

function FocusesChildOnMount({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => inner.current?.focus(), []);
  return (
    <FocusScope trapped autoFocus="none" restoreFocus>
      <button ref={inner}>Inner</button>
      {children}
    </FocusScope>
  );
}

describe('FocusScope', () => {
  it('restores focus to the opener when the parent moved focus in during layout', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <a href="#top">Page header link</a>
          <button onClick={() => setOpen(true)}>Open</button>
          {open ? (
            <FocusesChildOnMount>
              <button onClick={() => setOpen(false)}>Done</button>
            </FocusesChildOnMount>
          ) : null}
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('button', { name: 'Inner' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(opener).toHaveFocus();
  });

  const sentinelTabIndexes = (root: Element) =>
    Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-focus-sentinel]')).map((el) => el.tabIndex);

  it('sentinels are tab stops only while trapped, active and on top', () => {
    const { rerender, container } = render(
      <FocusScope autoFocus="none">
        <button>A</button>
      </FocusScope>,
    );
    const root = () => container.querySelector('[data-ds="FocusScope"]')!;
    expect(sentinelTabIndexes(root())).toEqual([0, 0]);
    rerender(
      <FocusScope autoFocus="none" trapped={false}>
        <button>A</button>
      </FocusScope>,
    );
    expect(sentinelTabIndexes(root())).toEqual([-1, -1]);
    rerender(
      <FocusScope autoFocus="none" active={false}>
        <button>A</button>
      </FocusScope>,
    );
    expect(sentinelTabIndexes(root())).toEqual([-1, -1]);
  });

  it('a nested scope mounted in the same commit owns Tab; the outer takes it back when the inner pauses', () => {
    function Nested({ innerActive }: { innerActive: boolean }) {
      return (
        <FocusScope autoFocus="none" data-testid="outer">
          <button>Outer</button>
          <FocusScope autoFocus="none" active={innerActive} data-testid="inner">
            <button>Inner</button>
          </FocusScope>
        </FocusScope>
      );
    }
    const { rerender, getByTestId } = render(<Nested innerActive />);
    expect(sentinelTabIndexes(getByTestId('outer'))).toEqual([-1, -1]);
    expect(sentinelTabIndexes(getByTestId('inner'))).toEqual([0, 0]);
    rerender(<Nested innerActive={false} />);
    expect(sentinelTabIndexes(getByTestId('outer'))).toEqual([0, 0]);
    expect(sentinelTabIndexes(getByTestId('inner'))).toEqual([-1, -1]);
  });

  it('Shift+Tab from the wrapper wraps to the last descendant and reports backward', () => {
    const attempts: string[] = [];
    render(
      <FocusScope autoFocus="container" onEscapeAttempt={(direction) => attempts.push(direction)}>
        <button>One</button>
        <button>Two</button>
      </FocusScope>,
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    expect(attempts).toEqual(['backward']);
  });

  it('the scope part wins over a composing data-part', () => {
    const { container } = render(
      <FocusScope autoFocus="none" data-part="focusScope">
        <button>A</button>
      </FocusScope>,
    );
    expect(container.querySelector('[data-ds="FocusScope"]')).toHaveAttribute('data-part', 'scope');
  });
});

describe('overlay composites restore focus to their opener', () => {
  const dialog: Overlay = ({ open, close }) => (
    <Dialog open={open} heading="Rename project" onClose={close}>
      <input aria-label="Project name" />
    </Dialog>
  );

  it('Dialog — Escape', () => {
    const { opener, dialog: el } = openFrom(dialog);
    cancel(el);
    expect(opener).toHaveFocus();
  });

  it('Dialog — close button', () => {
    const { opener } = openFrom(dialog);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(opener).toHaveFocus();
  });

  it('Dialog — scrim click', () => {
    const { opener, dialog: el } = openFrom(dialog);
    fireEvent.click(el);
    expect(opener).toHaveFocus();
  });

  const alertDialog: Overlay = ({ open, close }) => (
    <AlertDialog
      open={open}
      heading="Delete 3 files?"
      description="This cannot be undone."
      confirmLabel="Delete files"
      onCancel={close}
      onConfirm={close}
    />
  );

  it('AlertDialog — Escape', () => {
    const { opener, dialog: el } = openFrom(alertDialog);
    cancel(el);
    expect(opener).toHaveFocus();
  });

  it('AlertDialog — confirm', () => {
    const { opener } = openFrom(alertDialog);
    fireEvent.click(screen.getByRole('button', { name: 'Delete files' }));
    expect(opener).toHaveFocus();
  });

  const bottomSheet: Overlay = ({ open, close }) => (
    <BottomSheet open={open} heading="Share" onClose={close}>
      <input aria-label="Recipient" />
    </BottomSheet>
  );

  it('BottomSheet — Escape', () => {
    const { opener, dialog: el } = openFrom(bottomSheet);
    cancel(el);
    expect(opener).toHaveFocus();
  });

  it('BottomSheet — close button', () => {
    const { opener } = openFrom(bottomSheet);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(opener).toHaveFocus();
  });

  const actionSheet: Overlay = ({ open, close }) => (
    <ActionSheet
      open={open}
      heading="Photo.jpg"
      actions={[
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ]}
      onAction={close}
      onClose={close}
    />
  );

  it('ActionSheet — Escape', () => {
    const { opener, dialog: el } = openFrom(actionSheet);
    cancel(el);
    expect(opener).toHaveFocus();
  });

  it('ActionSheet — choosing an action', () => {
    const { opener } = openFrom(actionSheet);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Share' }));
    expect(opener).toHaveFocus();
  });

  const sidePanel: Overlay = ({ open, close }) => (
    <SidePanel modal open={open} heading="Filters" onOpenChange={(next) => (next ? undefined : close())}>
      <input aria-label="Keyword" />
    </SidePanel>
  );

  it('SidePanel (modal) — Escape', () => {
    const { opener, dialog: el } = openFrom(sidePanel);
    cancel(el);
    expect(opener).toHaveFocus();
  });

  it('SidePanel (modal) — close button', () => {
    const { opener } = openFrom(sidePanel);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(opener).toHaveFocus();
  });
});
