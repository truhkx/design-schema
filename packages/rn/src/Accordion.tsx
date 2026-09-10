import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Disclosure } from './Disclosure';
import type { DisclosureOverridableBinding } from './Disclosure';
import { Divider } from './Divider';
import { useTheme } from './theme';

/** Heading level for every trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type AccordionHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/** One section. `content` is the panel body. */
export type AccordionItem = { id: string; summary: string; content: React.ReactNode; disabled?: boolean };

/** Controlled/uncontrolled open ids: a single id under `exclusive`, otherwise the full set. */
export type AccordionValue = string | string[];

/** Why a section's open state changed, passed to `onOpenChange`. Native has no arrow-key model, so `keyboard` never fires here — see the component doc. */
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
  /** The sections in order. */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. Native has no heading levels; the value only documents the outline (see `Disclosure`). */
  headingLevel?: AccordionHeadingLevel;
  /** Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. */
  exclusive?: boolean;
  /** Controlled open ids. Omit for an uncontrolled accordion. */
  value?: AccordionValue;
  /** Initially open ids. */
  defaultValue?: AccordionValue;
  /** A hairline between items. */
  divided?: boolean;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean;
  /** Fired when the set of open sections changes, with the full list of open ids. */
  onChange?: (openIds: string[]) => void;
  /** Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content, or scrolling the opened section into view; `onChange` remains the set-level event for state. */
  onOpenChange?: (detail: { id: string; open: boolean; reason: AccordionOpenChangeReason }) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef>>;
}

function normalizeIds(value: AccordionValue | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Accordion — a list of Disclosures that know about each other: consistent
 * headings, and optionally the rule that opening one closes the rest.
 *
 * When to use: Use an Accordion for a series of independent sections a user scans
 * by heading and opens selectively — an FAQ, a settings page grouped by topic, a
 * multi-part form where each part is optional. Leave `exclusive` off unless the
 * panels are heavy or mutually exclusive by nature. Do not use it for content most
 * users need, as navigation, as tabs, nested, or for a single section (a Disclosure).
 *
 * Renders a `View` of `Disclosure`s, each given `headingLevel`, `keepMounted` and
 * the accordion's own `triggerPaddingBlock`, separated by a `Divider` when
 * `divided`. The accordion owns the open set (or defers to `value`) and passes
 * `open`/`onToggle` to each Disclosure; `exclusive` closes every other id when one
 * opens. Disabled items stay in the Disclosure's disabled state — visible, focusable,
 * not toggleable.
 *
 * Acknowledged native limit: arrow-key/Home/End movement among triggers has no
 * equivalent on `Pressable` (no key-event API — the same limit `Tabs` and
 * `RadioGroup` document), so it is not implemented; every trigger remains its own
 * accessibility stop reachable by ordinary swipe/tab navigation. Because there is
 * no way to distinguish a hardware Enter/Space press from a touch on `Pressable`,
 * `onOpenChange`'s `keyboard` reason never fires natively — toggling always reports
 * `trigger`.
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
}: AccordionProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const isControlled = value !== undefined;
  const [internalIds, setInternalIds] = React.useState<string[]>(() => normalizeIds(defaultValue));
  const openIds = isControlled ? normalizeIds(value) : internalIds;
  const prevOpenIdsRef = React.useRef<string[]>(openIds);

  React.useEffect(() => {
    if (!isControlled) {
      prevOpenIdsRef.current = openIds;
      return;
    }
    const prev = prevOpenIdsRef.current;
    if (prev.length !== openIds.length || prev.some((id, index) => id !== openIds[index])) {
      const opened = openIds.filter((id) => !prev.includes(id));
      const closed = prev.filter((id) => !openIds.includes(id));
      opened.forEach((id) => onOpenChange?.({ id, open: true, reason: 'controlled' }));
      closed.forEach((id) => onOpenChange?.({ id, open: false, reason: 'controlled' }));
    }
    prevOpenIdsRef.current = openIds;
  }, [openIds, isControlled, onOpenChange]);

  if (__DEV__ && exclusive && !isControlled && normalizeIds(defaultValue).length > 1) {
    console.warn('Accordion: `defaultValue` has more than one id while `exclusive` is set — only the first will open.');
  }

  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNone;
  const triggerPaddingBlockRef: TokenRef = overrides?.triggerPaddingBlock ?? 'space.md';

  const disclosureOverrides: Partial<Record<DisclosureOverridableBinding, TokenRef>> = { triggerPaddingBlock: triggerPaddingBlockRef };
  if (overrides?.fontFamily) {
    disclosureOverrides.triggerFontFamily = overrides.fontFamily;
  }
  if (overrides?.triggerFontSize) {
    disclosureOverrides.triggerFontSize = overrides.triggerFontSize;
  }
  if (overrides?.triggerFontWeight) {
    disclosureOverrides.triggerFontWeight = overrides.triggerFontWeight;
  }

  const dividerOverrides =
    overrides?.divider || overrides?.dividerWidth
      ? { color: overrides?.divider, thickness: overrides?.dividerWidth }
      : undefined;

  const handleToggle = (item: AccordionItem, open: boolean): void => {
    const nextIds = exclusive
      ? open
        ? [item.id]
        : []
      : open
        ? [...openIds, item.id]
        : openIds.filter((id) => id !== item.id);

    if (!isControlled) {
      setInternalIds(nextIds);
      prevOpenIdsRef.current = nextIds;
    }

    onOpenChange?.({ id: item.id, open, reason: 'trigger' });
    if (exclusive && open) {
      openIds.filter((id) => id !== item.id).forEach((id) => onOpenChange?.({ id, open: false, reason: 'exclusive' }));
    }
    onChange?.(nextIds);
  };

  const listStyle: ViewStyle = { gap: itemGap };

  return (
    <View testID="Accordion" style={listStyle}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Disclosure
            summary={item.summary}
            open={openIds.includes(item.id)}
            disabled={item.disabled}
            keepMounted={keepMounted}
            headingLevel={headingLevel}
            onToggle={(open) => handleToggle(item, open)}
            overrides={disclosureOverrides}
          >
            {item.content}
          </Disclosure>
          {divided && index < items.length - 1 ? <Divider overrides={dividerOverrides} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}
