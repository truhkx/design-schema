/**
 * <ds-tooltip> — behavior scenarios from the component doc, one test each, in the doc's order,
 * plus the keyboard model. Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Tooltip.js';
import './Button.js';
import type { DsTooltip } from './Tooltip.js';
import meta from './Tooltip.stories.js';

type Given = Partial<Pick<DsTooltip, 'content' | 'placement' | 'describes' | 'delay' | 'open'>>;

/** Focus inside nested shadow roots shows up as a chain of hosts. */
function activeChain(): Element[] {
  const chain: Element[] = [];
  let el: Element | null = document.activeElement;
  while (el) {
    chain.push(el);
    el = el.shadowRoot?.activeElement ?? null;
  }
  return chain;
}

/** The Default story's args plus the scenario's `given`, as properties on a fresh element wrapping the Default story's ds-button. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-tooltip');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const trigger = document.createElement('ds-button');
  trigger.setAttribute('label', 'Items');
  el.append(trigger);
  document.body.append(el);
  await el.updateComplete;
  await trigger.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const tooltips = () => [...el.querySelectorAll<HTMLElement>('[role="tooltip"]')].filter((node) => !node.closest('[aria-hidden="true"]'));
  const bubble = () => el.querySelector<HTMLElement>('[data-part="popup"]');
  return { el, trigger, tooltips, bubble, content: props.content ?? '' };
}

function bubbleShown(bubble: HTMLElement | null): boolean {
  return bubble !== null && (bubble.matches(':popover-open') || bubble.hasAttribute('data-open'));
}

/** ds-button keeps its real <button> in a shadow root, so the tooltip text reaches it as aria-description. */
function expectLinked(trigger: HTMLElement, content: string): void {
  expect(trigger).toHaveAttribute('aria-description', content);
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-tooltip', () => {
  it('the-visible-tooltip-carries-the-tooltip-role', async () => {
    const s = await setup({ open: true });
    expect(bubbleShown(s.bubble())).toBe(true);
    const [tooltip, ...rest] = s.tooltips();
    expect(rest).toHaveLength(0);
    expect(tooltip).toHaveTextContent(s.content);
    expectLinked(s.trigger, s.content);
  });

  it('the-text-stays-in-the-tree-while-hidden', async () => {
    const s = await setup({ open: false });
    expect(bubbleShown(s.bubble())).toBe(false);
    const [tooltip] = s.tooltips();
    expect(tooltip).toBeDefined();
    expect(tooltip).toHaveTextContent(s.content);
    expectLinked(s.trigger, s.content);
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el.shadowRoot!.childElementCount).toBeGreaterThan(0);
    expect(s.tooltips()).toHaveLength(1);
  });

  for (const placement of ['top', 'bottom', 'start', 'end'] as const) {
    it(`renders-placement-${placement}`, async () => {
      const s = await setup({ placement });
      expect(s.el.shadowRoot!.childElementCount).toBeGreaterThan(0);
      expect(s.tooltips()).toHaveLength(1);
    });
  }

  for (const delay of ['default', 'none'] as const) {
    it(`renders-delay-${delay}`, async () => {
      const s = await setup({ delay });
      expect(s.el.shadowRoot!.childElementCount).toBeGreaterThan(0);
      expect(s.tooltips()).toHaveLength(1);
    });
  }

  /* keyboard */
  it('Escape hides the tooltip without moving focus', async () => {
    const s = await setup({ open: true });
    s.trigger.focus();
    expect(activeChain()).toContain(s.trigger);
    expect(bubbleShown(s.bubble())).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(bubbleShown(s.bubble())).toBe(false);
    expect(activeChain()).toContain(s.trigger);
  });
});
