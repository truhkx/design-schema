/**
 * Accordion — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/accordion.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Accordion.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Accordion, type AccordionProps } from './Accordion';
import meta from './Accordion.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<AccordionProps> = {}) {
  const onChange = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...given, onChange, onOpenChange } as ComponentProps<typeof Accordion>;
  const utils = render(<Accordion {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onOpenChange,
    props,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Accordion"]')!,
    trigger: () => utils.container.querySelector<HTMLElement>('[data-part="trigger"]')!,
  };
}

function rendersWithHeading(level: '2' | '3' | '4' | '5' | '6') {
  const s = setup({ headingLevel: level });
  expect(s.root()).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: Number(level) })).toHaveLength(s.props.items.length);
}

describe('Accordion', () => {
  it('click-on-a-trigger-reports-the-open-set', async () => {
    const s = setup();
    await s.user.click(s.trigger());
    const first = s.props.items[0]!.id;
    expect(s.onChange).toHaveBeenCalledWith([first]);
    expect(s.onOpenChange).toHaveBeenCalledWith(first, true, 'trigger');
    expect(s.onChange.mock.invocationCallOrder[0]!).toBeLessThan(s.onOpenChange.mock.invocationCallOrder[0]!);
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('exclusive-still-reports-both-events', async () => {
    const s = setup({
      exclusive: true,
      defaultValue: 'pro',
      items: [
        { id: 'free', summary: 'Free', content: 'One project and community support.' },
        { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' },
      ],
    });
    await s.user.click(s.trigger());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(['free']);
    expect(s.onOpenChange.mock.calls).toEqual([
      ['free', true, 'trigger'],
      ['pro', false, 'exclusive'],
    ]);
    expect(s.onChange.mock.invocationCallOrder[0]!).toBeLessThan(s.onOpenChange.mock.invocationCallOrder[0]!);
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-heading-level-2', () => rendersWithHeading('2'));
  it('renders-heading-level-3', () => rendersWithHeading('3'));
  it('renders-heading-level-4', () => rendersWithHeading('4'));
  it('renders-heading-level-5', () => rendersWithHeading('5'));
  it('renders-heading-level-6', () => rendersWithHeading('6'));
});
