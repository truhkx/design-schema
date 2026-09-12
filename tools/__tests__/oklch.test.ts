/** tools/oklch.ts — the color math every derived palette and contrast check rests on (port of tests/test_oklch.py). */
import { describe, expect, test } from 'vitest';

import { contrast, hexToOklch, hexToRgb, linearToOklab, luminance, oklabToLinear, oklchToHex, rgbToHex } from '../oklch.ts';

describe('hex ⇄ rgb', () => {
  test('six digits with and without the hash', () => {
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1]);
    expect(hexToRgb('ffffff')).toEqual([1, 1, 1]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  test('three-digit shorthand expands', () => {
    expect(hexToRgb('#abc')).toEqual(hexToRgb('#aabbcc'));
  });

  test('channel order is rgb', () => {
    const [r, g, b] = hexToRgb('#804020');
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
  });

  test('rgbToHex round-trips', () => {
    for (const h of ['#000000', '#ffffff', '#3b5bdb', '#123456']) expect(rgbToHex(hexToRgb(h))).toBe(h);
  });

  test('rgbToHex clamps out-of-gamut channels', () => {
    expect(rgbToHex([1.5, -0.2, 0.5])).toBe('#ff0080');
  });

  test("rounds half to even like Python's round()", () => {
    // 0.5 * 255 = 127.5 → 128 (even); 2.5 / 255 * 255 lands on 2.5 → 2.
    expect(rgbToHex([0.5, 2.5 / 255, 0])).toBe('#800200');
  });

  test('a channel that is not hex is rejected like int(x, 16)', () => {
    expect(() => hexToRgb('#zzzzzz')).toThrow('invalid literal for int() with base 16');
  });
});

describe('oklab', () => {
  test('linear ⇄ oklab round-trip', () => {
    for (const rgb of [[0.1, 0.5, 0.9], [1, 0, 0], [0.5, 0.5, 0.5]] as [number, number, number][]) {
      const back = oklabToLinear(...linearToOklab(...rgb));
      for (let i = 0; i < 3; i++) expect(back[i] as number).toBeCloseTo(rgb[i] as number, 6);
    }
  });

  test('gray has no chroma', () => {
    const [, a, b] = linearToOklab(0.25, 0.25, 0.25);
    expect(Math.hypot(a, b)).toBeCloseTo(0, 6);
  });

  test('negative components keep their sign', () => {
    // The cube root is sign-aware, so a slightly-out-of-gamut negative input must not become NaN
    // (Math.pow(-x, 1/3) is NaN, as Python's (-x) ** (1/3) is complex).
    const out = linearToOklab(-0.01, 0.5, 0.5);
    for (const v of out) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('oklch', () => {
  test.each(['#3b5bdb', '#ff0000', '#123456', '#808080', '#ffffff', '#000000'])('%s: hex → oklch → hex is exact in gamut', (h) => {
    expect(oklchToHex(...hexToOklch(h))).toBe(h);
  });

  test('lightness ordering matches perception', () => {
    expect(hexToOklch('#000000')[0]).toBeCloseTo(0, 6);
    expect(hexToOklch('#ffffff')[0]).toBeCloseTo(1, 6);
    expect(hexToOklch('#111111')[0]).toBeLessThan(hexToOklch('#eeeeee')[0]);
  });

  test('grays have zero chroma', () => {
    expect(hexToOklch('#808080')[1]).toBeCloseTo(0, 6);
  });

  test('hue is degrees in [0, 360)', () => {
    for (const h of ['#ff0000', '#00ff00', '#0000ff', '#3b5bdb']) {
      const hue = hexToOklch(h)[2];
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });

  test('a negative atan2 angle wraps into [0, 360) like Python\'s float modulo', () => {
    expect(hexToOklch('#0000ff')[2]).toBeGreaterThan(180); // blue's oklab b is negative
  });

  test('out-of-gamut chroma is reduced, not rejected', () => {
    // ramp() asks for chroma the sRGB cube cannot hold at some lightnesses; the binary search
    // must still return a usable color.
    const out = oklchToHex(0.5, 5.0, 250);
    expect(out).toHaveLength(7);
    expect(out.startsWith('#')).toBe(true);
    const [L, C] = hexToOklch(out);
    expect(Math.abs(L - 0.5)).toBeLessThan(0.02);
    expect(C).toBeLessThan(5.0);
  });

  test('lightness survives chroma clamping', () => {
    // Hue and lightness are what the ramp promises to preserve.
    for (const hue of [25, 145, 268]) {
      const [L, , H] = hexToOklch(oklchToHex(0.68, 0.4, hue));
      expect(Math.abs(L - 0.68)).toBeLessThan(0.02);
      expect(Math.abs(H - hue)).toBeLessThan(3);
    }
  });

  test('zero-chroma ends are pure black and white', () => {
    expect(oklchToHex(0, 0, 200)).toBe('#000000');
    expect(oklchToHex(1, 0, 200)).toBe('#ffffff');
  });
});

describe('wcag', () => {
  test('luminance endpoints', () => {
    expect(luminance('#ffffff')).toBeCloseTo(1, 6);
    expect(luminance('#000000')).toBeCloseTo(0, 6);
  });

  test('luminance weights green highest', () => {
    expect(luminance('#00ff00')).toBeGreaterThan(luminance('#ff0000'));
    expect(luminance('#ff0000')).toBeGreaterThan(luminance('#0000ff'));
  });

  test('max contrast is 21', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 6);
  });

  test('contrast is symmetric and self is one', () => {
    expect(contrast('#3b5bdb', '#ffffff')).toBeCloseTo(contrast('#ffffff', '#3b5bdb'), 6);
    expect(contrast('#3b5bdb', '#3b5bdb')).toBeCloseTo(1, 6);
  });

  test('known ratio', () => {
    // #767676 on white is the canonical "just passes AA" gray.
    expect(Math.abs(contrast('#767676', '#ffffff') - 4.54)).toBeLessThan(0.01);
  });
});
