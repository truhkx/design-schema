// Job 542's guard: an overlay's docs page opens the overlay. On each page the first example's opener —
// the site's trigger harness (tools/docs_examples.ts `harnessOf`), or the component's own trigger
// where the example passes one — opens the component so that its surface is visible, fully opaque and
// inside the viewport; Escape closes it; and focus comes back to the opener.
//
// Before job 542 none of these could run: an open overlay portals into `document`, the build-time
// probe could not render it, and the page showed "This story does not render from its args alone".
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');

const SLUGS = new Map<string, string>(
  (JSON.parse(read('generated/components.json')) as { id: string; component: { name: string } }[]).map((entry) => [
    entry.component.name,
    entry.id,
  ]),
);

interface Example {
  title: string;
  storyId: string;
  args: Record<string, unknown>;
  harness: 'trigger' | null;
}
const examples = (name: string) => (JSON.parse(read(`generated/examples/${name}.json`)) as { examples: Example[] }).examples;

/**
 * Where the overlay stands, measured in the page: the component's `data-ds` root, or a dialog, alert
 * dialog or menu — a sheet presents as a centred Dialog at desktop width and ActionSheet as a Menu, so
 * the root there is another component's — outside the site's own header (the mobile drawer is a
 * SidePanel too). Its `surface` part where it has one: the host of a sheet can be on screen while the
 * panel inside it is parked off-canvas, which is exactly SidePanel's bug in the audit. `shown` is
 * anything visible at all; `open` is visible, opacity 1 all the way up, and wholly inside the viewport.
 */
async function overlayState(page: Page, name: string) {
  return page.evaluate((component) => {
    const state = { shown: false, open: false };
    // `dialog[open]`: a native <dialog> has the dialog role without the attribute.
    const roots = document.querySelectorAll(`[data-ds="${component}"], dialog[open], [role="dialog"], [role="alertdialog"], [role="menu"]`);
    for (const root of roots) {
      if (root.closest('[role="banner"]') !== null) continue;
      const surface = root.matches('[data-part="surface"]') ? root : (root.querySelector('[data-part="surface"]') ?? root);
      if (!surface.checkVisibility({ visibilityProperty: true })) continue;
      const rect = surface.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      let opacity = 1;
      for (let el: Element | null = surface; el !== null; el = el.parentElement) opacity *= Number(getComputedStyle(el).opacity);
      const inViewport =
        rect.left >= -1 && rect.top >= -1 && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1;
      const onScreen = rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
      // Settled: a sheet is at opacity 1 from its first frame while it is still sliding in, and "open"
      // is what a visitor sees once it has arrived — see the first-frame test at the end of this file.
      const settled = root.getAnimations({ subtree: true }).every((animation) => animation.playState !== 'running');
      if (opacity > 0 && onScreen) state.shown = true;
      if (opacity === 1 && inViewport && settled) state.open = true;
    }
    return state;
  }, name);
}

/** How many modal dialogs are open — each one makes the rest of the page inert, visible or not. */
const modalDialogs = (page: Page) => page.evaluate(() => document.querySelectorAll('dialog:modal').length);

const CASES: { name: string; title?: string }[] = [
  { name: 'Dialog' },
  { name: 'AlertDialog' },
  { name: 'BottomSheet' },
  { name: 'SidePanel' },
  { name: 'ActionSheet' },
  { name: 'Popover', title: 'Default' },
];

/** Desktop, where the sheets present as a Dialog and a Menu, and a phone, where they are sheets. */
const VIEWPORTS = [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'phone', width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) test.describe(`an overlay example opens from its trigger (${viewport.label})`, () => {
  test.use({ viewport: { width: viewport.width, height: viewport.height } });

  for (const { name, title } of CASES) {
    test(`${name}: the first example opens, closes on Escape, and returns focus`, async ({ page }) => {
      const example = title === undefined ? examples(name)[0]! : examples(name).find((entry) => entry.title === title)!;
      expect(example, `${name} has the example`).toBeDefined();

      await page.goto(`/docs/components/${SLUGS.get(name)}`);
      await expect(() => page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded({ timeout: 2000 })).toPass();
      await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);

      const card = page.locator(`[data-example="${example.storyId}"]`);
      await expect(card).toBeVisible();
      // Nothing opens over the page on load: the example waits for the visitor.
      expect(await overlayState(page, name)).toEqual({ shown: false, open: false });

      // The harness's own button when the page supplies it, the component's trigger when the example
      // passes one (SidePanel's "Menu", Popover's "Filters") — either way the first button in the card.
      const opener = card.getByRole('button').first();
      if (example.harness === 'trigger' && example.args['trigger'] === undefined) {
        await expect(card).toHaveAttribute('data-example-harness', 'trigger');
        await expect(opener).toHaveText(/^(Open|Show) /);
      }
      await opener.click();
      await expect.poll(() => overlayState(page, name), { message: `${name} opens: visible, opacity 1, in the viewport` }).toEqual({ shown: true, open: true });

      // A non-modal panel leaves focus on its trigger (the disclosure pattern) and closes on Escape
      // "from inside", so step in the way a keyboard user would: Tab from the trigger lands in it. A
      // modal one moves focus in itself, but can be fully opaque a moment before it does — so wait for
      // that move before deciding it is not coming.
      const movedIn = await expect
        .poll(() => opener.evaluate((el) => el !== document.activeElement), { timeout: 1500 })
        .toBe(true)
        .then(
          () => true,
          () => false,
        );
      if (!movedIn) await page.keyboard.press('Tab');
      await page.keyboard.press('Escape');
      await expect.poll(() => overlayState(page, name), { message: `${name} closes on Escape` }).toEqual({ shown: false, open: false });
      // Gone, not just faded: a modal <dialog> left open with an invisible surface keeps the page inert.
      await expect.poll(() => modalDialogs(page), { message: `${name} leaves no modal dialog open` }).toBe(0);
      await expect(opener, 'focus returns to the opener').toBeFocused();
    });
  }
});

/** Every component the pipeline gives a harness, read off generated/examples/ rather than named. */
const HARNESSED = [...SLUGS.keys()]
  .filter((name) => {
    try {
      return examples(name).some((entry) => entry.harness === 'trigger');
    } catch {
      return false; // no story module, so no examples file
    }
  })
  .sort();

/**
 * Every harness example, not just the first: each opens from its opener with content in it. This is
 * the per-story check job 542 asks for — a story whose args alone are not a complete render (say, one
 * that relied on a decorator for its body) would open an empty surface here and fail by name.
 */
test.describe('every harness example opens with content', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const name of HARNESSED) {
    for (const example of examples(name).filter((entry) => entry.harness === 'trigger')) {
      test(`${name} / ${example.title}`, async ({ page }) => {
        await page.goto(`/docs/components/${SLUGS.get(name)}`);
        await expect(() => page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded({ timeout: 2000 })).toPass();
        await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);

        const tab = page.getByRole('tab', { name: example.title, exact: true });
        if ((await tab.count()) === 0) await page.getByRole('button', { name: /^More examples \(\d+\)$/ }).click();
        await page.getByRole('tab', { name: example.title, exact: true }).first().click();

        const card = page.locator(`[data-example="${example.storyId}"]`);
        await expect(card).toHaveAttribute('data-example-harness', 'trigger');
        await card.scrollIntoViewIfNeeded();
        if ((await card.getByRole('button').count()) === 0) {
          // No opener at all: SidePanel's `persistent` examples are a sidebar above their breakpoint,
          // always shown, with the trigger hidden by the component. Shown is the whole assertion.
          await expect.poll(() => overlayState(page, name), { message: `${name} / ${example.title} is a sidebar` }).toMatchObject({ shown: true });
        } else {
          await card.getByRole('button').first().click();
          await expect.poll(() => overlayState(page, name), { message: `${name} / ${example.title} opens` }).toEqual({ shown: true, open: true });
        }

        // Content: the open surface says something beyond nothing — a heading, a body, actions.
        const text = await page.evaluate((component) => {
          const open = [...document.querySelectorAll(`[data-ds="${component}"], dialog[open], [role="dialog"], [role="alertdialog"], [role="menu"]`)]
            .filter((el) => el.closest('[role="banner"]') === null && el.checkVisibility());
          return open.map((el) => (el as HTMLElement).innerText.trim()).join(' ');
        }, name);
        expect(text.length, `${name} / ${example.title} has content`).toBeGreaterThan(0);
      });
    }
  }
});

/**
 * Job 543: SidePanel and ActionSheet chose their presentation (persistent sidebar, sheet vs Menu) and
 * created their portal host from `window`/`document` during render, so the server and the client
 * rendered different trees and React threw its hydration mismatch on their docs pages. Zero console
 * errors on load, at both widths, is the bar.
 */
for (const viewport of VIEWPORTS) test.describe(`an overlay docs page loads with no console errors (${viewport.label})`, () => {
  test.use({ viewport: { width: viewport.width, height: viewport.height } });

  for (const name of ['SidePanel', 'ActionSheet']) {
    test(name, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/docs/components/${SLUGS.get(name)}`);
      await page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded();
      await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});

/**
 * A component bug this harness found, kept runnable but out of the gate: Escape in the first frame
 * after Dialog, AlertDialog or BottomSheet opens (and, intermittently, ActionSheet on a phone) is
 * reported through `onClose`/`onCancel`, the harness sets `open` to false, and the component drops its
 * visible class and waits for a `transitionend` that never comes — the enter transition had not
 * started. The surface goes invisible but the modal <dialog> stays open, so the page is left inert
 * behind nothing (measured: still open 8s later, every run). Found 2026-09-23 by job 542; the fix is in
 * packages/react/src (the exit path needs a fallback when no transition runs), which 542 may not
 * touch. Timing-dependent by nature, so it would flake in the gate; run it with
 * `OVERLAY_FIRST_FRAME=1` and expect it to fail until the components are fixed.
 */
test.describe('Escape in the first frame after opening', () => {
  test.skip(process.env['OVERLAY_FIRST_FRAME'] !== '1', 'opt-in repro of a component bug; see the comment above');

  for (const name of ['Dialog', 'AlertDialog', 'BottomSheet']) {
    test(`${name} closes`, async ({ page }) => {
      await page.goto(`/docs/components/${SLUGS.get(name)}`);
      await expect(() => page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded({ timeout: 2000 })).toPass();
      await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
      await page.locator(`[data-example="${examples(name)[0]!.storyId}"]`).getByRole('button').first().click();
      await page.keyboard.press('Escape');
      await expect.poll(() => overlayState(page, name)).toEqual({ shown: false, open: false });
      await expect.poll(() => modalDialogs(page), { message: `${name} leaves no modal dialog open` }).toBe(0);
    });
  }
});
