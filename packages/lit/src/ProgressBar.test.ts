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

/* Package-level coverage the doc assigns here: host values and the announcement state machine. */
describe('ds-progress-bar values', () => {
  it('reports the clamped value and range on the host', async () => {
    const s = await setup({ value: 42 });
    expect(s.el).toHaveAttribute('aria-valuenow', '42');
    expect(s.el).toHaveAttribute('aria-valuemin', '0');
    expect(s.el).toHaveAttribute('aria-valuemax', '100');
    expect(s.el.getAttribute('aria-valuetext')).toBe(new Intl.NumberFormat(undefined, { style: 'percent' }).format(0.42));
  });

  it('is busy with no value while indeterminate', async () => {
    const s = await setup();
    s.el.value = undefined;
    await s.el.updateComplete;
    expect(s.el).toHaveAttribute('aria-busy', 'true');
    expect(s.el).not.toHaveAttribute('aria-valuenow');
    expect(s.el).not.toHaveAttribute('aria-valuetext');
    expect(s.el).toHaveAttribute('aria-valuemin', '0');
  });

  it('exposes min and "0%" for an invalid range, bounds as given', async () => {
    const s = await setup({ min: 10, max: 5, value: 7 });
    expect(s.el).toHaveAttribute('aria-valuenow', '10');
    expect(s.el).toHaveAttribute('aria-valuemin', '10');
    expect(s.el).toHaveAttribute('aria-valuemax', '5');
    expect(s.el.getAttribute('aria-valuetext')).toBe(new Intl.NumberFormat(undefined, { style: 'percent' }).format(0));
  });

  it('keeps the header and label when both label and value are hidden', async () => {
    const s = await setup({ hideLabel: true, showValue: false });
    expect(s.el).toHaveAttribute('hide-value');
    expect(s.el.shadowRoot!.querySelector('[data-part=header] [data-part=label]')).not.toBeNull();
    expect(s.el.shadowRoot!.querySelector('[data-part=valueText]')).toBeNull();
  });
});

describe('ds-progress-bar announcements', () => {
  const live = (el: DsProgressBar) => el.shadowRoot!.querySelector('[role=status]')!.textContent!.trim();
  const set = async (el: DsProgressBar, value: number | undefined) => {
    el.value = value;
    await el.updateComplete;
  };

  it('records the mounted value silently', async () => {
    const s = await setup({ value: 60, announce: 'milestones' });
    expect(live(s.el)).toBe('');
  });

  it('announces the highest crossed milestone once, then completion', async () => {
    const s = await setup({ label: 'Importing contacts', value: 10, announce: 'milestones' });
    await set(s.el, 80);
    expect(live(s.el)).toBe(`Importing contacts: ${s.el.displayText}`);
    await set(s.el, 100);
    expect(live(s.el)).toBe('Importing contacts: complete');
  });

  it('announces only completion under complete', async () => {
    const s = await setup({ label: 'Export', value: 10, announce: 'complete' });
    await set(s.el, 60);
    expect(live(s.el)).toBe('');
    await set(s.el, 100);
    expect(live(s.el)).toBe('Export: complete');
  });

  it('announces nothing under none', async () => {
    const s = await setup({ value: 10, announce: 'none' });
    await set(s.el, 100);
    expect(live(s.el)).toBe('');
  });

  it('announces entering the indeterminate state', async () => {
    const s = await setup({ label: 'Syncing', value: 10 });
    await set(s.el, undefined);
    expect(live(s.el)).toBe('Syncing: in progress');
  });
});
