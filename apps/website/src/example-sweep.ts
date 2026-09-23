/**
 * The captions under a sweep grid's tiles: which token a tile's prop value reads, and what that token
 * resolves to in every published theme and mode ("23px / 1.4375rem · font.size.xl").
 *
 * Nothing here is a table of values. The token comes from the component's own style bindings in the
 * schema (`fontSize: { token: 'font.size.{size}' }`), with the slot filled from the story's args; the
 * value comes from the theme's built token JSON (./themes.ts). A theme rebuilt with a different type
 * scale changes the caption with the next site build, and a new theme adds its own line.
 *
 * One slot needs more than the args. Heading's `size` has no default in the schema — the component
 * picks it from `level` — so a `Level 3` tile never names a size. Rather than copy the level→size map
 * out of Heading.tsx, the component is asked: render it as the story does, render it again with each
 * candidate size, and the one that changes nothing is the size it chose. That is also why this is
 * server-only (`react-dom/server`), like ./example-probe.ts.
 */
import { createElement, type ElementType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { ComponentDef } from '../../../schema/component';
import { COMPONENTS, decodeArgs } from './example-args';
import type { Example } from './examples';
import { MODES, type ThemeTokens } from './themes';

/**
 * One reading of a caption's value, and the `<theme>/<mode>` pairs it holds in. `variants` is empty
 * when the value is the same everywhere; otherwise CSS from `variantCss` shows the reading for the
 * theme and mode the page is in.
 */
export interface CaptionValue {
  text: string;
  variants: string[];
}

/** One line under a tile: a token path, and what it resolves to. */
export interface Caption {
  token: string;
  values: CaptionValue[];
}

const SLOT = /\{([a-zA-Z]+)\}/g;

/** What `rem` is measured against. The site never sets a root font size, so it is the browser's. */
const ROOT_FONT_SIZE_PX = 16;

function variantId(theme: string, mode: string): string {
  return `${theme}/${mode}`;
}

/** A token value as a caption reads it: a `px` dimension gains its `rem`, anything unprintable is skipped. */
function formatValue(raw: unknown): string | undefined {
  if (typeof raw === 'number') return String(raw);
  if (typeof raw !== 'string') return undefined;
  const px = /^(-?\d*\.?\d+)px$/.exec(raw);
  if (px === null) return raw;
  return `${raw} / ${Number((Number(px[1]) / ROOT_FONT_SIZE_PX).toFixed(4))}rem`;
}

function markup(Component: ElementType, props: Record<string, unknown>): string | undefined {
  try {
    return renderToStaticMarkup(createElement(Component, props));
  } catch {
    return undefined;
  }
}

/** The value a token slot takes for these props: the arg, the schema default, or the one the component derives. */
function slotValue(def: ComponentDef, Component: ElementType, props: Record<string, unknown>, slot: string): string | undefined {
  const given = props[slot];
  if (typeof given === 'string' || typeof given === 'number') return String(given);
  const prop = Object.hasOwn(def.props, slot) ? def.props[slot] : undefined;
  if (prop === undefined) return undefined;
  if (typeof prop.default === 'string' || typeof prop.default === 'number') return String(prop.default);
  const rendered = markup(Component, props);
  if (rendered === undefined) return undefined;
  return prop.values?.find((value) => markup(Component, { ...props, [slot]: value }) === rendered);
}

/**
 * The token path a filled slot actually names. An enum's `default` value binds the base token —
 * `color.foreground.{tone}` at `tone="default"` is `color.foreground`, the same mapping the generated
 * CSS makes — so a `.default` path no theme builds falls back to its parent when a theme builds that.
 */
function builtToken(token: string, themes: ThemeTokens[]): string {
  const built = (path: string) => themes.some((theme) => MODES.some((mode) => theme.modes[mode][path] !== undefined));
  if (built(token) || !token.endsWith('.default')) return token;
  const base = token.slice(0, -'.default'.length);
  return built(base) ? base : token;
}

/** A token's reading in every published theme and mode, collapsed to one line where they agree. */
function caption(slotted: string, themes: ThemeTokens[]): Caption {
  const token = builtToken(slotted, themes);
  const readings = new Map<string, string[]>();
  for (const theme of themes) {
    for (const mode of MODES) {
      const text = formatValue(theme.modes[mode][token]);
      if (text !== undefined) readings.set(text, [...(readings.get(text) ?? []), variantId(theme.id, mode)]);
    }
  }
  const everywhere = themes.length * MODES.length;
  return {
    token,
    values: [...readings].map(([text, variants]) => ({
      text,
      variants: readings.size === 1 && variants.length === everywhere ? [] : variants,
    })),
  };
}

/**
 * Each example's captions, in order.
 *
 * Default gets every templated binding — the component at rest. A step gets the bindings its prop
 * moves: the ones whose token names the prop (`font.size.{size}` under `size`), and the ones whose
 * token changes across the prop's steps without naming it (Heading's size under `level`). A prop no
 * binding reads (`align`) gets no caption line beyond its value.
 */
export function sweepCaptions(def: ComponentDef, examples: Example[], renderable: boolean[], themes: ThemeTokens[]): Caption[][] {
  const Component = COMPONENTS[def.name];
  const templates = [...new Set(Object.values(def.styles).map((binding) => binding.token))].filter((token) => token.includes('{'));

  const tokens = examples.map((example, index) => {
    if (typeof Component !== 'function' || renderable[index] !== true) return templates.map(() => undefined);
    const props = decodeArgs(example.args);
    return templates.map((template) => {
      const slots = [...template.matchAll(SLOT)].map(([, slot]) => slot as string);
      const values = new Map(slots.map((slot) => [slot, slotValue(def, Component as ElementType, props, slot)]));
      if ([...values.values()].some((value) => value === undefined)) return undefined;
      return template.replace(SLOT, (_, slot: string) => values.get(slot) as string);
    });
  });

  return examples.map((example, index) => {
    const own = tokens[index] ?? [];
    const { sweep } = example;
    return templates.flatMap((template, t) => {
      const token = own[t];
      if (token === undefined) return [];
      if (sweep === null || template.includes(`{${sweep.prop}}`)) return [caption(token, themes)];
      const across = new Set(examples.flatMap((other, o) => (other.sweep?.prop === sweep.prop ? [tokens[o]?.[t]] : [])));
      return across.size > 1 ? [caption(token, themes)] : [];
    });
  });
}

/**
 * The rules that show one reading per caption: each is hidden unless the root's `data-ds-theme` and
 * `data-mode` are the pair it holds in. Generated from the published themes, so a new theme needs no
 * CSS here — and a switch of theme or mode swaps the numbers with no script.
 *
 * Light is "not dark" rather than `[data-mode="light"]`: the server emits no `data-mode` (Layout.astro's
 * pre-paint script sets it), and the token sheets are light on a bare `:root`, so a page with scripts
 * off is light and its captions must say so.
 */
export function variantCss(themes: ThemeTokens[]): string {
  const rules = ['[data-sweep-variants] { display: none; }'];
  for (const theme of themes) {
    for (const mode of MODES) {
      const modeSelector = mode === 'light' ? ':not([data-mode="dark"])' : `[data-mode="${mode}"]`;
      rules.push(
        `:root[data-ds-theme="${theme.id}"]${modeSelector} [data-sweep-variants~="${variantId(theme.id, mode)}"] { display: inline; }`,
      );
    }
  }
  return rules.join('\n');
}
