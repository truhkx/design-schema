/**
 * The token manifest: every token a theme derives, by full DTCG path, with its type and layer. componentDef checks
 * each token a component names against it, so a misspelled token fails the schema without any built output.
 *
 * tools/theme.ts is the authority. Every theme derives exactly these names, whatever its seed, modes or branch (an ink
 * brand, a second neutral seed); only the values differ. tools/__tests__/tokens-manifest.test.ts derives every
 * committed theme and two fixture themes and fails when this file and the derivation drift, and checks the public
 * names against the built JSON.
 *
 * Imports nothing, so schema/ can be published on its own. Runs under Node's type stripping: annotations only.
 */

/** The DTCG `$type`s a theme uses. */
export const TOKEN_TYPES = ['color', 'fontFamily', 'fontWeight', 'dimension', 'number', 'duration', 'cubicBezier', 'shadow'] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

/** `base`: tokens/themes/<id>/base.json, the same in every mode. `mode`: <mode>.json, derived per mode. */
export type TokenLayer = 'base' | 'mode';
export type TokenInfo = { readonly type: TokenType; readonly layer: TokenLayer };

const RAMP = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const STATUS_TONES = ['info', 'success', 'warning', 'danger'];

/** [layer, type, group, the names under it], in derivation order. */
const GROUPS: readonly (readonly [TokenLayer, TokenType, string, readonly string[]])[] = [
  ['base', 'color', 'color.palette.neutral', ['0', ...RAMP, '1000']],
  ...['brand', 'danger', 'success', 'warning', 'info'].map((hue) => ['base', 'color', `color.palette.${hue}`, RAMP] as const),
  ['base', 'fontFamily', 'font.family', ['body', 'heading', 'mono']],
  ['base', 'fontWeight', 'font.weight', ['regular', 'medium', 'semibold', 'bold']],
  ['base', 'dimension', 'font.size', ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']],
  ['base', 'number', 'font.lineHeight', ['tight', 'normal', 'loose']],
  ['base', 'dimension', 'space', ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', 'sm', 'md', 'lg']],
  ['base', 'dimension', 'layout.gutter', ['narrow', 'default', 'wide']],
  ['base', 'dimension', 'layout.section', ['sm', 'md', 'lg']],
  ['base', 'dimension', 'layout.gap', ['none', 'tight', 'normal', 'loose', 'section']],
  ['base', 'dimension', 'layout.inset', ['none', 'sm', 'md', 'lg', 'xl']],
  ['base', 'dimension', 'layout.maxWidth', ['prose', 'content', 'page']],
  ['base', 'dimension', 'layout.breakpoint', ['sm', 'md', 'lg']],
  ['base', 'dimension', 'size.target', ['min', 'comfortable']],
  ['base', 'dimension', 'radius', ['none', 'sm', 'md', 'lg', 'full']],
  ['base', 'dimension', 'border.width', ['thin', 'focus']],
  ['base', 'number', 'opacity', ['disabled']],
  ['base', 'number', 'layer', ['base', 'raised', 'dropdown', 'sheet', 'dialog', 'toast']],
  ['base', 'duration', 'motion.duration', ['fast', 'base', 'loop']],
  ['base', 'cubicBezier', 'motion.easing', ['standard', 'exit']],
  ['mode', 'color', 'color.foreground', ['default', 'strong', 'muted', 'onAction', 'danger']],
  ['mode', 'color', 'color.background', ['default', 'subtle', 'strong']],
  ['mode', 'color', 'color.border', ['default', 'strong', 'focus', 'danger']],
  ['mode', 'color', 'color.link', ['default', 'hover', 'visited']],
  ['mode', 'color', 'color.control', ['background', 'border', 'selectedBackground', 'selectedForeground', 'trackOff']],
  ...STATUS_TONES.map((tone) => ['mode', 'color', `color.status.${tone}`, ['background', 'foreground', 'border', 'icon']] as const),
  ['mode', 'color', 'color.overlay', ['scrim', 'surface']],
  ['mode', 'color', 'color.inverse', ['surface', 'foreground', 'muted', 'link', 'focus']],
  ['mode', 'color', 'color.inverse.status', ['neutral', ...STATUS_TONES]],
  ...['primary', 'secondary', 'ghost', 'danger'].map((action) => ['mode', 'color', `color.action.${action}`, ['background', 'backgroundHover', 'foreground']] as const),
  ['mode', 'shadow', 'shadow', ['raised', 'overlay']],
];

/** Full DTCG path → its type and layer, in derivation order (base.json, then the mode file). */
export const TOKENS: Readonly<Record<string, TokenInfo>> = Object.freeze(
  Object.fromEntries(GROUPS.flatMap(([layer, type, group, names]) => names.map((n) => [`${group}.${n}`, Object.freeze({ type, layer })]))),
);

/** color.foreground.default → color.foreground: the name components and the built JSON use. */
export function tokenPublicName(path: string): string {
  return path.endsWith('.default') ? path.slice(0, -'.default'.length) : path;
}

/** Every public token name. */
export const TOKEN_NAMES: ReadonlySet<string> = new Set(Object.keys(TOKENS).map(tokenPublicName));

/** True for a public name (color.foreground) or a full path (color.foreground.default). */
export function isToken(ref: string): boolean {
  return TOKEN_NAMES.has(ref) || Object.hasOwn(TOKENS, ref);
}

/** Enum values a binding renders as "nothing" instead of a token (the templates say so): `none` for a
 *  background/border/padding, `full` for a max-width. An interpolated value that is one of these needs no token. */
export const NO_TOKEN_VALUES: ReadonlySet<string> = new Set(['none', 'full']);
