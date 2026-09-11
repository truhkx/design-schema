/**
 * Minimal sRGB ⇄ OKLCH color math (Björn Ottosson's OKLab), no dependencies. Port of tools/oklch.py.
 *
 * OKLCH is used for ramp generation because equal steps in L look equal to the eye,
 * and hue stays stable as lightness changes — which HSL famously does not.
 *
 * The arithmetic follows the Python line for line (pow, hypot, atan2, Python's float modulo and
 * round-half-to-even) so the two produce the same numbers to well past two decimals.
 *
 * Runs under Node's type stripping: annotations only.
 */

export type RGB = [number, number, number];

// ---------- sRGB <-> linear ----------

export function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function toSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** Python's `round()`: half to even. Only ever called on non-negative values here. */
function pyRound(x: number): number {
  const f = Math.floor(x);
  const diff = x - f;
  if (diff > 0.5) return f + 1;
  if (diff < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

/** Python's `a % b` for floats: the result takes the sign of the divisor. */
function pyMod(a: number, b: number): number {
  const m = a % b;
  return m !== 0 && (m < 0) !== (b < 0) ? m + b : m;
}

export function hexToRgb(h: string): RGB {
  let s = h.replace(/^#+/, '');
  if (s.length === 3) s = [...s].map((ch) => ch + ch).join('');
  const channel = (i: number): number => {
    const pair = s.slice(i, i + 2);
    // `int(h[i:i+2], 16)` accepts one or two hex digits and raises ValueError on anything else.
    if (!/^[0-9a-fA-F]{1,2}$/.test(pair)) throw new Error(`invalid literal for int() with base 16: '${pair}'`);
    return parseInt(pair, 16) / 255;
  };
  return [channel(0), channel(2), channel(4)];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map((c) => pyRound(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('');
}

// ---------- linear sRGB <-> OKLab ----------

function cbrtSigned(x: number): number {
  const r = Math.pow(Math.abs(x), 1 / 3);
  return x < 0 || Object.is(x, -0) ? -r : r;
}

export function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = cbrtSigned(l);
  const m_ = cbrtSigned(m);
  const s_ = cbrtSigned(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

export function oklabToLinear(L: number, a: number, b: number): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = Math.pow(l_, 3);
  const m = Math.pow(m_, 3);
  const s = Math.pow(s_, 3);
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// ---------- OKLCH ----------

export function hexToOklch(h: string): [number, number, number] {
  const [r, g, b] = hexToRgb(h).map(toLinear) as RGB;
  const [L, a, bb] = linearToOklab(r, g, b);
  const C = Math.hypot(a, bb);
  const H = pyMod((Math.atan2(bb, a) * 180) / Math.PI, 360);
  return [L, C, H];
}

/** Convert, reducing chroma until the color fits in sRGB (hue and lightness preserved). */
export function oklchToHex(L: number, C: number, H: number): string {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  let lo = 0.0;
  let hi = 1.0;
  let rgb: RGB | null = null;
  for (let i = 0; i < 24; i++) {
    // binary search on a chroma scale factor
    const k = (lo + hi) / 2;
    const lin = oklabToLinear(L, a * k, b * k);
    if (lin.every((c) => -0.0005 <= c && c <= 1.0005)) {
      rgb = lin;
      lo = k;
    } else {
      hi = k;
    }
  }
  if (rgb === null) rgb = oklabToLinear(L, 0, 0);
  return rgbToHex(rgb.map((c) => toSrgb(Math.min(1, Math.max(0, c)))) as RGB);
}

// ---------- WCAG ----------

export function luminance(h: string): number {
  const [r, g, b] = hexToRgb(h).map(toLinear) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(fg: string, bg: string): number {
  const lf = luminance(fg);
  const lb = luminance(bg);
  const l1 = Math.max(lf, lb);
  const l2 = Math.min(lf, lb);
  return (l1 + 0.05) / (l2 + 0.05);
}
