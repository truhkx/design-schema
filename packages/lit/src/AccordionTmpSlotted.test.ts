import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Accordion.js';

it('slotted mode: renders, arrows wrap, exclusive, keyboard reason', async () => {
  document.body.innerHTML = `<ds-accordion exclusive>
    <ds-disclosure id="a" summary="A"><p>A body</p></ds-disclosure>
    <ds-disclosure id="b" summary="B"><p>B body</p></ds-disclosure>
    <ds-disclosure id="c" summary="C"><p>C body</p></ds-disclosure>
  </ds-accordion>`;
  const el = document.querySelector('ds-accordion')!;
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
  const ds = Array.from(el.querySelectorAll('ds-disclosure'));
  expect(el.shadowRoot!.querySelectorAll('ds-divider')).toHaveLength(2);
  expect(ds[0]!.getBoundingClientRect().height).toBeGreaterThan(0);
  const events: unknown[] = [];
  el.addEventListener('open-change', (e) => events.push((e as CustomEvent).detail));
  const trig = (d: Element) => d.shadowRoot!.querySelector<HTMLButtonElement>('[data-part=trigger]')!;
  expect(trig(ds[0]!).parentElement?.localName).toBe('h3');
  ds[2]!.focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(document.activeElement).toBe(ds[0]);
  await userEvent.keyboard('{End}');
  expect(document.activeElement).toBe(ds[2]);
  await userEvent.keyboard('{Enter}');
  await new Promise((r) => setTimeout(r, 50));
  await userEvent.click(trig(ds[0]!));
  await new Promise((r) => setTimeout(r, 50));
  expect(events).toEqual([
    { id: 'c', open: true, reason: 'keyboard' },
    { id: 'a', open: true, reason: 'trigger' },
    { id: 'c', open: false, reason: 'exclusive' },
  ]);
  expect(trig(ds[2]!).getAttribute('aria-expanded')).toBe('false');
  expect(trig(ds[0]!).getAttribute('aria-expanded')).toBe('true');
  expect(el.hasAttribute('no-divided')).toBe(false);
});
