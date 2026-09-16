/**
 * <ds-progress-bar> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './ProgressBar.js';
import type { DsProgressBar } from './ProgressBar.js';
import meta from './ProgressBar.stories.js';

type Given = Partial<
  Pick<DsProgressBar, 'label' | 'value' | 'min' | 'max' | 'showValue' | 'hideLabel' | 'tone' | 'announce'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-progress-bar');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    /** The progressbar role lives on the host. */
    bar: () => (el.getAttribute('role') === 'progressbar' ? el : null),
    label: () => root.querySelector<HTMLElement>('[data-part=label]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-progress-bar', () => {
  it('the-bar-is-never-focusable', async () => {
    const s = await setup();
    const before = document.createElement('button');
    document.body.prepend(before);
    before.focus();
    s.el.focus();
    expect(document.activeElement).not.toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBeNull();
    expect(s.el.tabIndex).toBeLessThan(0);
    const focusable = s.el.shadowRoot!.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])');
    expect(focusable).toHaveLength(0);
  });

  it('the-label-names-the-task', async () => {
    const s = await setup({ label: 'Importing contacts' });
    expect(s.label()).toHaveTextContent('Importing contacts');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.bar()).not.toBeNull();
  });

  it('renders-tone-neutral', async () => {
    const s = await setup({ tone: 'neutral' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'neutral');
  });

  it('renders-tone-success', async () => {
    const s = await setup({ tone: 'success' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'success');
  });

  it('renders-tone-danger', async () => {
    const s = await setup({ tone: 'danger' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'danger');
  });

  it('renders-announce-none', async () => {
    const s = await setup({ announce: 'none' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('announce', 'none');
  });

  it('renders-announce-milestones', async () => {
    const s = await setup({ announce: 'milestones' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('announce', 'milestones');
  });

  it('renders-announce-complete', async () => {
    const s = await setup({ announce: 'complete' });
    expect(s.bar()).not.toBeNull();
    expect(s.el).toHaveAttribute('announce', 'complete');
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.bar()).toHaveAccessibleName(s.props.label);
  });
});
