/**
 * <ds-accordion> — behavior scenarios from the component doc, one test each, in the doc's order,
 * followed by the keyboard model and the slotted form the Lit platform notes call primary.
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
import type { DsDisclosure } from './Disclosure.js';
import meta from './Accordion.stories.js';

interface StoryItem {
  id: string;
  summary: string;
  content: string;
  disabled?: boolean | undefined;
}

interface Given {
  headingLevel?: AccordionHeadingLevel;
  exclusive?: boolean;
  defaultValue?: string | string[];
  items?: StoryItem[];
}

/** The deepest focused element, so a trigger inside a shadow root is what `document.activeElement` hides. */
function deepActive(): Element | null {
  let node: Element | null = document.activeElement;
  while (node !== null && node.shadowRoot?.activeElement != null) node = node.shadowRoot.activeElement;
  return node;
}

/** The trigger of a disclosure, wherever the disclosure itself lives. */
function triggerOf(disclosure: DsDisclosure): HTMLButtonElement {
  return disclosure.shadowRoot!.querySelector<HTMLButtonElement>('[data-part=trigger]')!;
}

/**
 * The accordion and its disclosures have settled: the child observer runs as a microtask and
 * feeds `@state`, so a single `updateComplete` can land before the sections exist.
 */
async function settle(el: DsAccordion): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await el.updateComplete;
    const disclosures = [
      ...el.shadowRoot!.querySelectorAll<DsDisclosure>('ds-disclosure'),
      ...el.querySelectorAll<DsDisclosure>('ds-disclosure'),
    ];
    await Promise.all(disclosures.map((disclosure) => disclosure.updateComplete));
  }
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
  await settle(el);
  const disclosures = (): DsDisclosure[] =>
    Array.from(el.shadowRoot!.querySelectorAll<DsDisclosure>('ds-disclosure'));
  return {
    el,
    items: items ?? [],
    change,
    openChange,
    disclosures,
    settle: () => settle(el),
    trigger: (index = 0): HTMLButtonElement => triggerOf(disclosures()[index]!),
  };
}

/** The same accordion authored the Lit way: light-DOM `<ds-disclosure>` children. */
async function setupSlotted(sections: StoryItem[], configure: (el: DsAccordion) => void = () => {}) {
  const el = document.createElement('ds-accordion') as DsAccordion;
  configure(el);
  for (const section of sections) {
    const disclosure = document.createElement('ds-disclosure') as DsDisclosure;
    disclosure.id = section.id;
    disclosure.summary = section.summary;
    const body = document.createElement('p');
    body.textContent = section.content;
    disclosure.append(body);
    el.append(disclosure);
  }
  const change = vi.fn<(event: CustomEvent<AccordionChangeDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<AccordionOpenChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('open-change', openChange as unknown as EventListener);
  document.body.append(el);
  await settle(el);
  const disclosures = (): DsDisclosure[] => Array.from(el.querySelectorAll<DsDisclosure>('ds-disclosure'));
  return {
    el,
    change,
    openChange,
    disclosures,
    settle: () => settle(el),
    trigger: (index = 0): HTMLButtonElement => triggerOf(disclosures()[index]!),
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

/**
 * The `keyboard` block, against the `Keyboard` story's shape (the meta's three enabled sections,
 * nothing open) — the model the generated Playwright gate drives through Storybook.
 */
describe('ds-accordion keyboard', () => {
  it('Enter toggles the focused section and reports reason keyboard', async () => {
    const s = await setup();
    s.trigger(0).focus();
    await userEvent.keyboard('{Enter}');
    await s.settle();
    expect(s.trigger(0)).toHaveAttribute('aria-expanded', 'true');
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ id: 'cancel', open: true, reason: 'keyboard' });
  });

  it('Space toggles the focused section', async () => {
    const s = await setup();
    s.trigger(1).focus();
    await userEvent.keyboard(' ');
    await s.settle();
    expect(s.trigger(1)).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowDown moves to the next trigger and ArrowUp to the previous', async () => {
    const s = await setup();
    s.trigger(0).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(deepActive()).toBe(s.trigger(1));
    await userEvent.keyboard('{ArrowUp}');
    expect(deepActive()).toBe(s.trigger(0));
  });

  it('ArrowDown wraps from the last trigger and ArrowUp wraps from the first', async () => {
    const s = await setup();
    s.trigger(2).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(deepActive()).toBe(s.trigger(0));
    await userEvent.keyboard('{ArrowUp}');
    expect(deepActive()).toBe(s.trigger(2));
  });

  it('Home focuses the first trigger and End the last', async () => {
    const s = await setup();
    s.trigger(1).focus();
    await userEvent.keyboard('{Home}');
    expect(deepActive()).toBe(s.trigger(0));
    await userEvent.keyboard('{End}');
    expect(deepActive()).toBe(s.trigger(2));
  });

  it('never lands on a disabled trigger, but still moves from one', async () => {
    const s = await setup({
      items: [
        { id: 'cancel', summary: 'What happens if I cancel?', content: 'Billing period.' },
        { id: 'plans', summary: 'Can I change plans later?', content: 'Next billing date.', disabled: true },
        { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days.' },
      ],
    });
    s.trigger(0).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(deepActive()).toBe(s.trigger(2));
    // Focus starting on the disabled trigger still moves: it remains a tab stop.
    s.trigger(1).focus();
    await userEvent.keyboard('{End}');
    expect(deepActive()).toBe(s.trigger(2));
    await userEvent.keyboard('{Home}');
    expect(deepActive()).toBe(s.trigger(0));
  });

  it('leaves Tab alone — every trigger is a tab stop', async () => {
    const s = await setup();
    s.trigger(0).focus();
    await userEvent.keyboard('{Tab}');
    expect(deepActive()).toBe(s.trigger(1));
  });
});

/** The slotted form: light-DOM `<ds-disclosure>` children, with the dividers in the shadow root. */
describe('ds-accordion with slotted disclosures', () => {
  const SECTIONS: StoryItem[] = [
    { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' },
    { id: 'plans', summary: 'Can I change plans later?', content: 'Yes. Changes take effect at the next billing date.' },
    { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.' },
  ];

  it('renders every child, one divider between them, at the shared heading level', async () => {
    const s = await setupSlotted(SECTIONS);
    expect(s.disclosures()).toHaveLength(3);
    expect(s.el.shadowRoot!.querySelectorAll('ds-divider')).toHaveLength(2);
    expect(s.disclosures()[0]!.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(s.trigger(0).parentElement?.localName).toBe('h3');
  });

  it('reports the open set and the toggled section, and arrow keys wrap', async () => {
    const s = await setupSlotted(SECTIONS);
    s.disclosures()[2]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(deepActive()).toBe(s.trigger(0));
    await userEvent.click(s.trigger(0));
    await s.settle();
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ openIds: ['cancel'] });
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ id: 'cancel', open: true, reason: 'trigger' });
    expect(s.trigger(0)).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the others under exclusive, reporting each as `exclusive`', async () => {
    const s = await setupSlotted(SECTIONS, (el) => {
      el.exclusive = true;
      el.defaultValue = 'refunds';
    });
    await userEvent.click(s.trigger(0));
    await s.settle();
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ openIds: ['cancel'] });
    expect(s.openChange.mock.calls.map(([event]) => event.detail)).toEqual([
      { id: 'cancel', open: true, reason: 'trigger' },
      { id: 'refunds', open: false, reason: 'exclusive' },
    ]);
    expect(s.trigger(2)).toHaveAttribute('aria-expanded', 'false');
  });

  it('leaves a slotted disclosure’s own `toggle` to reach the page', async () => {
    const s = await setupSlotted(SECTIONS);
    const toggles = vi.fn();
    s.el.addEventListener('toggle', toggles);
    await userEvent.click(s.trigger(0));
    await s.settle();
    expect(toggles).toHaveBeenCalled();
  });
});
