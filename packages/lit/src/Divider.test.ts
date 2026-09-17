/**
 * <ds-divider> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Divider is not interactive: the doc scenarios assert the accessibility attributes on the host
 * and the text that gets read, and every derived scenario asserts render.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Divider.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Divider.js';
import type { DsDivider } from './Divider.js';
import meta from './Divider.stories.js';

type Given = Partial<Pick<DsDivider, 'orientation' | 'label' | 'semantic' | 'spacing'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-divider');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-divider', () => {
  it('decorative-divider-is-hidden-from-assistive-technology', async () => {
    const { el } = await setup();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('semantic-divider-is-a-separator', async () => {
    const { el } = await setup({ semantic: true });
    expect(el).toHaveRole('separator');
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('label-is-read-and-makes-the-divider-semantic', async () => {
    const { el } = await setup({ label: 'or' });
    expect(el.shadowRoot!.textContent).toContain('or');
    expect(el).toHaveRole('separator');
  });

  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expect(el).toHaveAttribute('data-ds', 'Divider');
    expect(el.shadowRoot).not.toBeNull();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', async () => {
    const { el } = await setup({ orientation: 'horizontal' });
    expect(el).toHaveAttribute('orientation', 'horizontal');
  });

  it('renders-orientation-vertical', async () => {
    const { el } = await setup({ orientation: 'vertical' });
    expect(el).toHaveAttribute('orientation', 'vertical');
  });

  /* derived: props.spacing */
  it('renders-spacing-none', async () => {
    const { el } = await setup({ spacing: 'none' });
    expect(el).toHaveAttribute('spacing', 'none');
  });

  it('renders-spacing-tight', async () => {
    const { el } = await setup({ spacing: 'tight' });
    expect(el).toHaveAttribute('spacing', 'tight');
  });

  it('renders-spacing-normal', async () => {
    const { el } = await setup({ spacing: 'normal' });
    expect(el).toHaveAttribute('spacing', 'normal');
  });

  it('renders-spacing-loose', async () => {
    const { el } = await setup({ spacing: 'loose' });
    expect(el).toHaveAttribute('spacing', 'loose');
  });
});
