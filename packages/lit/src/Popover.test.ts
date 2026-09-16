/**
 * <ds-popover> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus, the
 * Popover API and <dialog>.showModal(), none of which jsdom implements.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Popover.js';
import './Button.js';
import './Checkbox.js';
import type { DsPopover, PopoverOpenChangeDetail } from './Popover.js';
import meta from './Popover.stories.js';

type Given = Partial<Pick<DsPopover, 'heading' | 'headingLevel' | 'placement' | 'modal' | 'showArrow' | 'dismissible' | 'open'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with the story's trigger and body. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-popover');
  const props = { ...meta.args, ...given } as Record<string, unknown>;
  for (const key of ['heading', 'headingLevel', 'placement', 'modal', 'showArrow', 'dismissible', 'open']) {
    if (props[key] !== undefined) (el as unknown as Record<string, unknown>)[key] = props[key];
  }

  const trigger = document.createElement('ds-button');
  trigger.slot = 'trigger';
  trigger.label = 'Filters';
  const first = document.createElement('ds-checkbox');
  first.label = 'Open issues';
  const second = document.createElement('ds-checkbox');
  second.label = 'Assigned to me';
  const apply = document.createElement('ds-button');
  apply.label = 'Apply';
  el.append(trigger, first, second, apply);

  const openChange = vi.fn<(event: CustomEvent<PopoverOpenChangeDetail>) => void>();
  el.addEventListener('open-change', ((event: CustomEvent<PopoverOpenChangeDetail>) => openChange(event)) as EventListener);

  document.body.append(el);
  await el.updateComplete;
  await settle();

  const root = el.shadowRoot!;
  return {
    el,
    openChange,
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
    nativeTrigger: () => trigger.shadowRoot!.querySelector<HTMLButtonElement>('button')!,
  };
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-popover', () => {
  it('close-button-fires-on-open-change', async () => {
    const p = await setup({ open: true });
    await userEvent.click(p.part('closeButton')!);
    expect(p.openChange).toHaveBeenCalledTimes(1);
    expect(p.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'close-button' });
  });

  it('escape-closes-a-modal-popover', async () => {
    const p = await setup({ open: true, modal: true });
    await userEvent.keyboard('{Escape}');
    expect(p.openChange).toHaveBeenCalledTimes(1);
    expect(p.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'escape' });
  });

  it('the-panel-is-named-by-its-heading', async () => {
    const p = await setup({ open: true, heading: 'Filters' });
    const panel = p.el.shadowRoot!.querySelector('[role="dialog"]');
    expect(panel).not.toBeNull();
    expect(panel).toHaveAccessibleName('Filters');
  });

  /* derived: anatomy */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.headingLevel */
  for (const headingLevel of ['2', '3', '4'] as const) {
    it(`renders-heading-level-${headingLevel}`, async () => {
      const { el } = await setup({ headingLevel });
      expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
    });
  }

  /* derived: props.placement */
  for (const placement of ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'] as const) {
    it(`renders-placement-${placement}`, async () => {
      const { el } = await setup({ placement });
      expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
    });
  }

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const { nativeTrigger } = await setup();
    expect(nativeTrigger()).toHaveAccessibleName('Filters');
  });

  /* derived: overlay.dismiss escape */
  it('escape-fires-on-open-change', async () => {
    const p = await setup({ open: true });
    await userEvent.keyboard('{Escape}');
    expect(p.openChange).toHaveBeenCalledTimes(1);
    expect(p.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'escape' });
  });
});
