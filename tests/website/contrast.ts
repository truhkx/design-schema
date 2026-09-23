// A live WCAG AA text-contrast walk, shared by the website gates. It is the audit's measurement
// (process/website-audit.md, "Contrast") made repeatable: every visible element that directly holds
// text is read with getComputedStyle, its colour composited over the effective background of its
// ancestors, and held to 4.5:1 (3:1 for large text).
//
// Colours are normalised through a 1×1 canvas rather than parsed, so `rgb()`, `color(srgb …)` and
// `color-mix()` results all come out as the same four bytes. The body passed to page.evaluate is
// serialised into the page, so it declares only arrow-function constants and imports nothing.
import type { Page } from '@playwright/test';

export type ContrastFailure = {
  text: string;
  path: string;
  fg: string;
  bg: string;
  ratio: number;
  required: number;
};

/** Every AA text-contrast failure in the page body, as it is painted right now. */
export function contrastFailures(page: Page): Promise<ContrastFailure[]> {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    /** Any CSS colour → [r, g, b, a] with a in 0..1. */
    const rgba = (colour: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255];
    };
    /** `top` painted over an opaque `bottom`. */
    const over = (top: [number, number, number, number], bottom: number[]): number[] =>
      [0, 1, 2].map((i) => top[i]! * top[3] + bottom[i]! * (1 - top[3]));
    const luminance = (c: number[]) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const hex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
    const describePath = (el: Element) => {
      const parts: string[] = [];
      for (let node: Element | null = el; node && node !== document.body && parts.length < 4; node = node.parentElement) {
        const cls = typeof node.className === 'string' ? node.className.trim().split(/\s+/)[0] : '';
        parts.unshift(node.tagName.toLowerCase() + (cls ? `.${cls}` : ''));
      }
      return parts.join(' > ');
    };

    const failures: {
      text: string;
      path: string;
      fg: string;
      bg: string;
      ratio: number;
      required: number;
    }[] = [];

    for (const el of document.body.querySelectorAll('*')) {
      const text = Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? '')
        .join('')
        .trim();
      if (!text) continue;
      if (el.closest('svg, script, style, noscript, template')) continue;
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const box = el.getBoundingClientRect();
      if (box.width <= 1 || box.height <= 1) continue; // visually hidden (sr-only)
      // WCAG 1.4.3 exempts inactive controls and their labels.
      if (el.closest(':disabled, [aria-disabled="true"], [data-disabled]')) continue;
      const label = el.closest('label');
      if (label && label.querySelector(':disabled')) continue;

      // The effective background: every ancestor's background-color, composited from the root down
      // over the canvas white a browser starts from. A background image makes it unknowable, so skip.
      const chain: Element[] = [];
      for (let node: Element | null = el; node; node = node.parentElement) chain.push(node);
      if (chain.some((node) => getComputedStyle(node).backgroundImage !== 'none')) continue;
      let bg: number[] = [255, 255, 255];
      let opacity = 1;
      for (const node of chain.reverse()) {
        const style = getComputedStyle(node);
        bg = over(rgba(style.backgroundColor), bg);
        opacity *= Number(style.opacity);
      }

      const style = getComputedStyle(el);
      const fgRaw = rgba(style.color);
      const fg = over([fgRaw[0], fgRaw[1], fgRaw[2], fgRaw[3] * opacity], bg);
      const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      const ratio = (l1! + 0.05) / (l2! + 0.05);
      const size = parseFloat(style.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
      const required = large ? 3 : 4.5;
      if (ratio + 0.005 < required) {
        failures.push({
          text: text.slice(0, 40),
          path: describePath(el),
          fg: hex(fg),
          bg: hex(bg),
          ratio: Math.round(ratio * 100) / 100,
          required,
        });
      }
    }
    return failures;
  });
}
