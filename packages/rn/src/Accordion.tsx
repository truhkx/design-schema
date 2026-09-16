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
export type AccordionItem = { id: string; summary: string; content: React.ReactNode; disabled?: boolean };

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
  items: { id: string; summary: string; content: React.ReactNode; disabled?: boolean }[];
  /** Heading level for every trigger, so sections appear in the page outline. Native has no heading levels: every trigger's summary is `accessibilityRole="header"` and the value itself changes nothing else. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /** Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. */
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
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

function toIdArray(value: AccordionValue | undefined): string[] {
  if (value === undefined || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

/** Under `exclusive` only the first id opens; the rest are reported by a development warning. */
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
 * Renders a `View` of `Disclosure`s (the `item` part is each Disclosure's root, a direct
 * child of this view) with a `Divider` between them when `divided`. The accordion owns the
 * open set (or defers to `value`) and passes `open`/`onToggle`, `headingLevel`,
 * `keepMounted` and its `triggerPaddingBlock` to each Disclosure; `divider`/`dividerWidth`
 * reach each Divider's `color`/`thickness`. Disabled items stay visible and focusable but
 * do not toggle.
 *
 * Acknowledged native limit: `Pressable` has no key events, so ArrowUp/Down/Home/End are
 * not implemented; every trigger is an ordinary accessibility stop reached by swipe or
 * Tab, and `onOpenChange` reports `trigger` for every activation.
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
  const openIds = isControlled ? limitExclusive(toIdArray(value), exclusive) : internalOpenIds;
  const openKey = openIds.join(' ');

  // Development warning: several ids under `exclusive` open only the first. Warned once per distinct input.
  const requestedIds = toIdArray(isControlled ? value : defaultValue);
  const warnedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!__DEV__ || !exclusive || requestedIds.length <= 1) return;
    const key = requestedIds.join(' ');
    if (warnedRef.current === key) return;
    warnedRef.current = key;
    const source = isControlled ? 'value' : 'defaultValue';
    console.warn(
      `Accordion: \`exclusive\` opens one section, but \`${source}\` has ${requestedIds.length} ids. Opening "${requestedIds[0]}"; ignoring ${requestedIds.slice(1).join(', ')}.`,
    );
  });

  // `controlled`: a `value` that is not the set the accordion itself just emitted reports each section that changed.
  const previousOpenRef = React.useRef<string[]>(openIds);
  const lastEmittedRef = React.useRef<string[] | null>(null);
  React.useEffect(() => {
    const previous = previousOpenRef.current;
    previousOpenRef.current = openIds;
    if (!isControlled) {
      lastEmittedRef.current = null;
      return;
    }
    const emitted = lastEmittedRef.current;
    lastEmittedRef.current = null;
    if (sameSet(previous, openIds)) return;
    if (emitted !== null && sameSet(emitted, openIds)) return;
    for (const id of openIds) {
      if (!previous.includes(id)) onOpenChange?.(id, true, 'controlled');
    }
    for (const id of previous) {
      if (!openIds.includes(id)) onOpenChange?.(id, false, 'controlled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey, isControlled]);

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
      for (const openId of previous) {
        if (openId !== id) onOpenChange?.(openId, false, 'exclusive');
      }
    }
  };

  const disclosureOverrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> = {
    triggerPaddingBlock: overrides?.triggerPaddingBlock ?? 'space.md',
  };
  if (overrides?.fontFamily) disclosureOverrides.triggerFontFamily = overrides.fontFamily;
  if (overrides?.triggerFontSize) disclosureOverrides.triggerFontSize = overrides.triggerFontSize;
  if (overrides?.triggerFontWeight) disclosureOverrides.triggerFontWeight = overrides.triggerFontWeight;

  const dividerOverrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> = {};
  if (overrides?.divider) dividerOverrides.color = overrides.divider;
  if (overrides?.dividerWidth) dividerOverrides.thickness = overrides.dividerWidth;
  const hasDividerOverrides = Object.keys(dividerOverrides).length > 0;

  const listStyle: ViewStyle = {
    gap: overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNone,
  };

  const children: React.ReactNode[] = [];
  items.forEach((item, index) => {
    if (divided && index > 0) {
      children.push(
        <Divider key={`divider-${item.id}`} overrides={hasDividerOverrides ? dividerOverrides : undefined} />,
      );
    }
    children.push(
      <Disclosure
        key={item.id}
        summary={item.summary}
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
