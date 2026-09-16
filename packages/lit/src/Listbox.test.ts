/**
 * <ds-listbox> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Listbox.js';
import type { DsListbox, ListboxActiveChangeDetail, ListboxChangeDetail, ListboxMaxVisible } from './Listbox.js';
import meta from './Listbox.stories.js';

type Given = Partial<
  Pick<
    DsListbox,
    'options' | 'selectionFollowsFocus' | 'emptyMessage' | 'loading' | 'invalid' | 'error' | 'maxVisible'
  >
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-listbox');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<ListboxChangeDetail>) => void>();
  const activeChange = vi.fn<(event: CustomEvent<ListboxActiveChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('active-change', activeChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    activeChange,
    props,
    list: () => root.querySelector<HTMLElement>('[data-part=list]')!,
    option: () => root.querySelector<HTMLElement>('[data-part=option]')!,
    text: () => root.textContent ?? '',
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-listbox', () => {
  it('click-on-an-option-selects-it', async () => {
    const s = await setup();
    await userEvent.click(s.option());
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'apple' });
    expect(s.option()).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-selects-as-it-moves-when-selection-follows-focus', async () => {
    const s = await setup({ selectionFollowsFocus: true });
    s.list().focus();
    await userEvent.keyboard('{ArrowDown}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalled();
    expect(s.change.mock.lastCall?.[0].detail).toEqual({ value: 'banana' });
  });

  it('arrows-only-move-when-selection-does-not-follow-focus', async () => {
    const s = await setup({ selectionFollowsFocus: false });
    s.list().focus();
    await userEvent.keyboard('{ArrowDown}');
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
    expect(s.activeChange).toHaveBeenCalled();
    expect(s.activeChange.mock.lastCall?.[0].detail).toEqual({ value: 'banana' });
  });

  it('space-selects-the-active-option', async () => {
    const s = await setup({ selectionFollowsFocus: false });
    s.list().focus();
    await userEvent.keyboard(' ');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'apple' });
  });

  it('a-disabled-option-cannot-be-selected', async () => {
    const s = await setup({
      options: [
        { value: 'apple', label: 'Apple', disabled: true },
        { value: 'banana', label: 'Banana' },
      ],
    });
    // Playwright will not click an aria-disabled option on its own; a person can.
    await userEvent.click(s.option(), { force: true });
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
    expect(s.option()).toHaveAttribute('aria-selected', 'false');
  });

  it('the-empty-message-shows-when-there-are-no-options', async () => {
    const s = await setup({ options: [] });
    expect(s.text()).toContain('No options');
  });

  it('a-custom-empty-message-replaces-the-default', async () => {
    const s = await setup({ options: [], emptyMessage: 'No fruit matches that.' });
    expect(s.text()).toContain('No fruit matches that.');
    expect(s.text()).not.toContain('No options');
  });

  it('loading-replaces-the-empty-message', async () => {
    const s = await setup({ options: [], loading: true });
    expect(s.text()).toContain('Loading…');
    expect(s.text()).not.toContain('No options');
    expect(s.list()).toHaveAttribute('aria-busy', 'true');
  });

  it('invalid-renders-the-invalid-copy', async () => {
    const s = await setup({ invalid: true });
    expect(s.text()).toContain(`${s.props.label} is not valid.`);
    expect(s.el).toHaveAttribute('invalid');
    expect(s.list()).toHaveAttribute('aria-invalid', 'true');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.list()).not.toBeNull();
    expect(s.el.shadowRoot!.querySelectorAll('[data-part=option]')).toHaveLength(3);
  });

  for (const maxVisible of ['5', '8', '12', 'all'] as ListboxMaxVisible[]) {
    it(`renders-max-visible-${maxVisible}`, async () => {
      const s = await setup({ maxVisible });
      expect(s.list()).not.toBeNull();
      expect(s.el).toHaveAttribute('max-visible', maxVisible);
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.list()).toHaveAccessibleName(s.props.label);
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.text()).toContain('Fix this before continuing.');
    expect(s.el).toHaveAttribute('invalid');
    expect(s.list()).toHaveAttribute('aria-invalid', 'true');
    expect(s.list()).toHaveAccessibleDescription('Fix this before continuing.');
  });
});
