/**
 * <ds-accordion> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Accordion.js';
import type {
  AccordionChangeDetail,
  AccordionHeadingLevel,
  AccordionOpenChangeDetail,
  DsAccordion,
} from './Accordion.js';
import meta from './Accordion.stories.js';

interface Given {
  headingLevel?: AccordionHeadingLevel;
  exclusive?: boolean;
  defaultValue?: string | string[];
  items?: { id: string; summary: string; content: string; disabled?: boolean | undefined }[];
}

/** The Default story's args plus the scenario's `given`, rendered the way the story renders them. */
async function setup(given: Given = {}) {
  const { items, ...args } = { ...meta.args!, ...given };
  const el = document.createElement('ds-accordion') as DsAccordion;
  el.items = (items ?? []).map(({ id, summary, disabled }) => ({ id, summary, disabled }));
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const item of items ?? []) {
    const body = document.createElement('div');
    body.slot = item.id;
    body.textContent = item.content;
    el.append(body);
  }
  const change = vi.fn<(event: CustomEvent<AccordionChangeDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<AccordionOpenChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('open-change', openChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const disclosures = () => Array.from(el.shadowRoot!.querySelectorAll('ds-disclosure'));
  await Promise.all(disclosures().map((d) => d.updateComplete));
  const settle = async () => {
    await el.updateComplete;
    await Promise.all(disclosures().map((d) => d.updateComplete));
  };
  return {
    el,
    items: items ?? [],
    change,
    openChange,
    settle,
    trigger: (index = 0) =>
      disclosures()[index]!.shadowRoot!.querySelector<HTMLButtonElement>('[data-part=trigger]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-accordion', () => {
  it('click-on-a-trigger-reports-the-open-set', async () => {
    const s = await setup();
    const order: string[] = [];
    s.el.addEventListener('change', () => order.push('change'));
    s.el.addEventListener('open-change', () => order.push('open-change'));
    await userEvent.click(s.trigger());
    await s.settle();
    expect(order).toEqual(['change', 'open-change']);
    const firstId = s.items[0]!.id;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ openIds: [firstId] });
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ id: firstId, open: true, reason: 'trigger' });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('exclusive-still-reports-both-events', async () => {
    const s = await setup({
      exclusive: true,
      defaultValue: 'pro',
      items: [
        { id: 'free', summary: 'Free', content: 'One project and community support.' },
        { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' },
      ],
    });
    const order: string[] = [];
    s.el.addEventListener('change', () => order.push('change'));
    s.el.addEventListener('open-change', () => order.push('open-change'));
    await userEvent.click(s.trigger());
    await s.settle();
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ openIds: ['free'] });
    expect(s.openChange.mock.calls.map(([event]) => event.detail)).toEqual([
      { id: 'free', open: true, reason: 'trigger' },
      { id: 'pro', open: false, reason: 'exclusive' },
    ]);
    expect(order).toEqual(['change', 'open-change', 'open-change']);
    expect(s.trigger(0)).toHaveAttribute('aria-expanded', 'true');
    expect(s.trigger(1)).toHaveAttribute('aria-expanded', 'false');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'Accordion');
    expect(s.trigger()).not.toBeNull();
  });

  for (const level of ['2', '3', '4', '5', '6'] as AccordionHeadingLevel[]) {
    it(`renders-heading-level-${level}`, async () => {
      const s = await setup({ headingLevel: level });
      expect(s.trigger()).not.toBeNull();
      expect(s.trigger().parentElement?.localName).toBe(`h${level}`);
    });
  }
});
