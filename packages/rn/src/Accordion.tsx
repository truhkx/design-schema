import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Disclosure } from './Disclosure';
import type { DisclosureOverridableBinding, DisclosureToggleReason } from './Disclosure';
import { Divider } from './Divider';
import type { DividerOverridableBinding } from './Divider';
import { useTheme } from './theme';

/** Heading level for every trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type AccordionHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/** One section. `content` is the panel body. */
export type AccordionItem = { id: string; summary: string; content: React.ReactNode; disabled?: boolean | undefined };

/** Open ids. A bare `string` is shorthand for a one-id array; `[]` or `''` means nothing is open. */
export type AccordionValue = string | string[];

/**
 * Why a section's open state changed, passed to `onOpenChange`. React Native cannot tell a
 * hardware Enter/Space activation from a touch on `Pressable`, so `keyboard` never fires here.
 */
export type AccordionOpenChangeReason = 'trigger' | 'keyboard' | 'exclusive' | 'controlled';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type AccordionOverridableBinding =
  | 'divider'
  | 'dividerWidth'
  | 'itemGap'
  | 'triggerPaddingBlock'
  | 'fontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight';

export interface AccordionProps {
  /** The sections in order. `content` is the panel body. */
  items: { id: string; summary: string; content: React.ReactNode; disabled?: boolean | undefined }[];
  /** Heading level for every trigger, so sections appear in the page outline. Native has no heading levels: every trigger's summary is `accessibilityRole="header"` and the value itself changes nothing else. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /** Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. Turning it on while several sections are open trims the open set to the first open id without firing any event. */
  exclusive?: boolean | undefined;
  /** Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty string means nothing is open. Events always report an array, with zero or one entry when `exclusive`. */
  value?: string | string[] | undefined;
  /** Initially open ids; the same shapes as `value`. */
  defaultValue?: string | string[] | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean | undefined;
  /** Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where it carries zero or one entry. */
  onChange?: ((openIds: string[]) => void) | undefined;
  /** Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content, or scrolling the opened section into view; `onChange` remains the set-level event for state. */
  onOpenChange?: ((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (the `list` part). */
  ref?: React.Ref<ViewInstance> | undefined;
}

/** Each overridable binding's default token, the one place its path is written. */
const DEFAULT_TOKEN = {
  divider: 'color.border',
  dividerWidth: 'border.width.thin',
  itemGap: 'layout.gap.none',
  triggerPaddingBlock: 'space.md',
  fontFamily: 'font.family.body', // literal-ok: a TokenRef path resolved through the theme, not a font stack
  triggerFontSize: 'font.size.md',
  triggerFontWeight: 'font.weight.medium',
} as const satisfies Record<AccordionOverridableBinding, TokenRef>;

function toIdArray(value: AccordionValue | undefined): string[] {
  if (value === undefined || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

/** Under `exclusive` only the first id opens. */
function limitExclusive(ids: string[], exclusive: boolean): string[] {
  return exclusive && ids.length > 1 ? ids.slice(0, 1) : ids;
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/**
 * Accordion — a list of Disclosures that know about each other: consistent headings,
 * and optionally the rule that opening one closes the rest.
 *
 * When to use: a series of independent sections a user scans by heading and opens
 * selectively — an FAQ, a settings page grouped by topic, a multi-part form where each
 * part is optional. Leave `exclusive` off unless the panels are heavy or mutually
 * exclusive by nature. Do not use it for content most users need, as navigation, as
 * tabs, nested, or for a single section (that is a Disclosure).
 *
 * Renders the `list` part as a `View` (its `gap` is `itemGap`) of `Disclosure`s — the `item`
 * part is each Disclosure's root, a direct child — with a `Divider` between them when
 * `divided`. The accordion owns the open set (or defers to `value`) and passes
 * `open`/`onToggle`, `headingLevel` and `keepMounted` to each Disclosure, forwarding
 * `triggerPaddingBlock`, `fontFamily` (as `triggerFontFamily`), `triggerFontSize` and
 * `triggerFontWeight` to its `overrides`; `divider`/`dividerWidth` reach each Divider's
 * `color`/`thickness`. Disabled items stay visible and focusable but do not toggle.
 *
 * Acknowledged native limit: `Pressable` has no key events, so ArrowUp/Down/Home/End are
 * not implemented (on react-native-web too); every trigger is an ordinary accessibility
 * stop reached by swipe or Tab, and `onOpenChange` reports `trigger` for every activation.
 * `headingLevel` only marks each summary `accessibilityRole="header"`.
 */
export function Accordion({
  items,
  headingLevel = '3',
  exclusive = false,
  value,
  defaultValue,
  divided = true,
  keepMounted = false,
  onChange,
  onOpenChange,
  overrides,
  ref,
}: AccordionProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const isControlled = value !== undefined;
  const [internalOpenIds, setInternalOpenIds] = React.useState<string[]>(() =>
    limitExclusive(toIdArray(defaultValue), exclusive),
  );
  const rawOpenIds = isControlled ? toIdArray(value) : internalOpenIds;
  const openIds = limitExclusive(rawOpenIds, exclusive);
  const openKey = openIds.join(' ');
  const valueKey = isControlled ? toIdArray(value).join(' ') : null;

  // Turning `exclusive` on trims the uncontrolled set for good, silently.
  React.useEffect(() => {
    if (!isControlled && exclusive && internalOpenIds.length > 1) {
      setInternalOpenIds(internalOpenIds.slice(0, 1));
    }
  }, [exclusive, isControlled, internalOpenIds]);

  // Development warning: several ids under `exclusive` open only the first. Warned once per distinct
  // id list, so a standing controlled `value` warns again only when it becomes a list not seen before.
  const requestedIds = toIdArray(isControlled ? value : defaultValue);
  const warnedRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    if (!__DEV__ || !exclusive || requestedIds.length <= 1) return;
    const key = requestedIds.join(' ');
    if (warnedRef.current.has(key)) return;
    warnedRef.current.add(key);
    const source = isControlled ? 'value' : 'defaultValue';
    console.warn(
      `Accordion: \`exclusive\` opens one section, but \`${source}\` has ${requestedIds.length} ids. Opening "${requestedIds[0]}"; ignoring ${requestedIds.slice(1).join(', ')}.`,
    );
  });

  // `controlled`: a `value` change to a set the accordion did not itself just emit reports each
  // section that changed. The just-emitted set is compared with the next `value` change only, then
  // cleared. A change caused by `exclusive` trimming (value unchanged) reports nothing.
  const previousOpenRef = React.useRef<string[]>(openIds);
  const previousValueKeyRef = React.useRef<string | null>(valueKey);
  const lastEmittedRef = React.useRef<string[] | null>(null);
  React.useEffect(() => {
    const previous = previousOpenRef.current;
    const valueChanged = previousValueKeyRef.current !== valueKey;
    previousOpenRef.current = openIds;
    previousValueKeyRef.current = valueKey;
    if (!isControlled) {
      lastEmittedRef.current = null;
      return;
    }
    if (!valueChanged) return;
    const emitted = lastEmittedRef.current;
    lastEmittedRef.current = null;
    if (emitted !== null && sameSet(emitted, openIds)) return;
    if (sameSet(previous, openIds)) return;
    // Item order, as for the `exclusive` closes: one pass, opens and closes interleaved.
    for (const item of items) {
      const nowOpen = openIds.includes(item.id);
      if (nowOpen !== previous.includes(item.id)) onOpenChange?.(item.id, nowOpen, 'controlled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey, valueKey, isControlled]);

  const handleToggle = (id: string, open: boolean, toggleReason: DisclosureToggleReason): void => {
    // Disclosure reports `controlled` when the accordion itself changed its `open`; that is not a user toggle.
    if (toggleReason === 'controlled') return;
    const previous = openIds;
    const next = open
      ? exclusive
        ? [id]
        : previous.includes(id)
          ? previous
          : [...previous, id]
      : previous.filter((openId) => openId !== id);

    if (isControlled) lastEmittedRef.current = next;
    else setInternalOpenIds(next);

    onChange?.(next);
    onOpenChange?.(id, open, 'trigger');
    if (open && exclusive) {
      // Item order, not open-set order.
      for (const item of items) {
        if (item.id !== id && previous.includes(item.id)) onOpenChange?.(item.id, false, 'exclusive');
      }
    }
  };

  // Every forward carries the resolved token (the override, else the Accordion default), even when
  // it equals the child's own default.
  const tokenFor = (binding: AccordionOverridableBinding): TokenRef => overrides?.[binding] ?? DEFAULT_TOKEN[binding];
  const paddingToken = tokenFor('triggerPaddingBlock');
  const fontFamilyToken = tokenFor('fontFamily');
  const fontSizeToken = tokenFor('triggerFontSize');
  const fontWeightToken = tokenFor('triggerFontWeight');
  const disclosureOverrides = React.useMemo<Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>>>(
    () => ({
      triggerPaddingBlock: paddingToken,
      triggerFontFamily: fontFamilyToken,
      triggerFontSize: fontSizeToken,
      triggerFontWeight: fontWeightToken,
    }),
    [paddingToken, fontFamilyToken, fontSizeToken, fontWeightToken],
  );

  const dividerColorToken = tokenFor('divider');
  const dividerWidthToken = tokenFor('dividerWidth');
  const dividerOverrides = React.useMemo<Partial<Record<DividerOverridableBinding, TokenRef | undefined>>>(
    () => ({ color: dividerColorToken, thickness: dividerWidthToken }),
    [dividerColorToken, dividerWidthToken],
  );

  const listStyle: ViewStyle = {
    gap: resolveToken(t, tokenFor('itemGap')) as number,
  };

  const children: React.ReactNode[] = [];
  items.forEach((item, index) => {
    if (divided && index > 0) {
      children.push(<Divider key={`divider-${item.id}`} overrides={dividerOverrides} />);
    }
    children.push(
      <Disclosure
        key={item.id}
        summary={item.summary}
        fullWidth
        headingLevel={headingLevel}
        open={openIds.includes(item.id)}
        disabled={item.disabled}
        keepMounted={keepMounted}
        overrides={disclosureOverrides}
        onToggle={(open, reason) => handleToggle(item.id, open, reason)}
      >
        {item.content}
      </Disclosure>,
    );
  });

  return (
    <View ref={ref} testID="Accordion" style={listStyle}>
      {children}
    </View>
  );
}
