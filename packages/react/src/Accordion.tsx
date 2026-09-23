import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import {
  Disclosure,
  type DisclosureOverridableBinding,
  type DisclosureToggleReason,
} from './Disclosure';
import { Divider, type DividerOverridableBinding } from './Divider';
import './Accordion.css';

/** One section. `content` is the panel body. */
export type AccordionItem = { id: string; summary: string; content: ReactNode; disabled?: boolean | undefined };

/** Accepts the schema's string values and their numeric equivalents. */
export type AccordionHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/**
 * Why a section's open state changed: `trigger` (activated by pointer), `keyboard` (toggled from the keyboard, as
 * Disclosure reports it), `exclusive` (another section opened and closed this one), `controlled` (the `value` prop
 * changed to a set the accordion did not itself just emit).
 */
export type AccordionOpenChangeReason = 'trigger' | 'keyboard' | 'exclusive' | 'controlled';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type AccordionOverridableBinding =
  | 'divider'
  | 'dividerWidth'
  | 'itemGap'
  | 'triggerPaddingBlock'
  | 'fontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight';

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** An empty array or an empty string means nothing is open. */
function toIdArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value === '' ? [] : [value];
}

/** Under `exclusive` only the first id opens; the rest are reported by a development warning. */
function limitExclusive(ids: string[], exclusive: boolean): string[] {
  return exclusive && ids.length > 1 ? ids.slice(0, 1) : ids;
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

export interface AccordionProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'defaultValue' | 'className' | 'style'> {
  /**
   * The sections in order. `content` is the panel body; on Lit it is dropped from the item type and the body is a
   * light-DOM child slotted by the item id (`<div slot="faq-1">`).
   */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /**
   * Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a
   * common frustration. Turning it on while several sections are open trims the open set to the first open id
   * without firing any event. "First" is array order: the order of `value`/`defaultValue`, and for uncontrolled
   * state the order the sections were opened. Uncontrolled, the trim is permanent; controlled, it only affects what
   * is shown, so turning `exclusive` off shows the full `value` again, still without events. A declared set of
   * several ids warns in development, once per distinct id list.
   */
  exclusive?: boolean | undefined;
  /**
   * Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty
   * string means nothing is open. Events always report an array, with zero or one entry when `exclusive`.
   */
  value?: string | string[] | undefined;
  /** Initially open ids; the same shapes as `value`. Given both, `value` controls and `defaultValue` is ignored. */
  defaultValue?: string | string[] | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. Accordion-wide, like `headingLevel`. */
  keepMounted?: boolean | undefined;
  /**
   * Per-instance style overrides. `itemGap` sets the root hook; the trigger bindings are forwarded to each composed
   * Disclosure's `overrides`, `divider`/`dividerWidth` to each Divider's `color`/`thickness`.
   */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where
   * it carries zero or one entry.
   */
  onChange?: ((openIds: string[]) => void) | undefined;
  /**
   * Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content,
   * or scrolling the opened section into view; `onChange` remains the set-level event for state.
   */
  onOpenChange?: ((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined;
}

/**
 * Accordion — Design Schema, category: container.
 *
 * When to use:
 * Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a
 * settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page
 * outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose
 * one plan to see details").
 *
 * Each item is a Disclosure (the `item` part is its root, a direct child of this `<div>`); Dividers sit between them.
 */
export function Accordion({
  ref,
  items,
  headingLevel = '3',
  exclusive = false,
  value,
  defaultValue,
  divided = true,
  keepMounted = false,
  overrides,
  onChange,
  onOpenChange,
  onKeyDown,
  ...rest
}: AccordionProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const setTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const isControlled = value !== undefined;
  const [internalOpenIds, setInternalOpenIds] = useState<string[]>(() =>
    limitExclusive(toIdArray(defaultValue) ?? [], exclusive),
  );
  // Turning `exclusive` on while several sections are open trims the set to the first open id, firing nothing.
  if (!isControlled && exclusive && internalOpenIds.length > 1) {
    setInternalOpenIds(internalOpenIds.slice(0, 1));
  }
  const openIds = limitExclusive(isControlled ? (toIdArray(value) ?? []) : internalOpenIds, exclusive);
  const valueKey = isControlled ? JSON.stringify(toIdArray(value) ?? []) : null;

  // Development warning: a declared `value`/`defaultValue` holding several ids under `exclusive` opens only the first.
  // Warned once per distinct id list; the trim of sections a user opened while uncontrolled never warns.
  const requestedIds = toIdArray(isControlled ? value : defaultValue) ?? [];
  const warnedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!isDev || !exclusive || requestedIds.length <= 1) return;
    const key = JSON.stringify(requestedIds);
    if (warnedRef.current.has(key)) return;
    warnedRef.current.add(key);
    const source = isControlled ? 'value' : 'defaultValue';
    console.warn(
      `Accordion: \`exclusive\` opens one section, but \`${source}\` has ${requestedIds.length} ids. Opening "${requestedIds[0]}"; ignoring ${requestedIds.slice(1).join(', ')}.`,
    );
  });

  // `controlled`: a `value` change to a set the accordion did not itself just emit reports each section that changed,
  // in item order. Only a change of the `value` prop reports; an `exclusive` trim of the same value changes the set
  // silently. The just-emitted set is compared with the next `value` change only, then cleared.
  const previousRef = useRef<{ valueKey: string | null; openIds: string[] }>({ valueKey, openIds });
  const lastEmittedRef = useRef<string[] | null>(null);
  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = { valueKey, openIds };
    if (!isControlled) {
      lastEmittedRef.current = null;
      return;
    }
    if (previous.valueKey === valueKey) return;
    const emitted = lastEmittedRef.current;
    lastEmittedRef.current = null;
    if (emitted !== null && sameSet(emitted, requestedIds)) return;
    for (const item of items) {
      const was = previous.openIds.includes(item.id);
      const is = openIds.includes(item.id);
      if (was !== is) onOpenChange?.(item.id, is, 'controlled');
    }
  });

  const handleToggle = (id: string, open: boolean, toggleReason: DisclosureToggleReason) => {
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
    const reason: AccordionOpenChangeReason = toggleReason === 'keyboard' ? 'keyboard' : 'trigger';

    if (isControlled) lastEmittedRef.current = next;
    else setInternalOpenIds(next);

    onChange?.(next);
    onOpenChange?.(id, open, reason);
    if (open && exclusive) {
      // One report per section `exclusive` closed, in item order.
      for (const item of items) {
        if (item.id !== id && previous.includes(item.id)) onOpenChange?.(item.id, false, 'exclusive');
      }
    }
  };

  // ArrowUp/Down wrap, Home/End jump; disabled sections are skipped. Every trigger stays an ordinary tab stop.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const { key } = event;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
    const current = items.findIndex((item) => triggerRefs.current.get(item.id) === event.target);
    if (current === -1) return;

    const count = items.length;
    const step = (from: number, delta: number): number => {
      let index = from;
      for (let i = 0; i < count; i += 1) {
        index = (index + delta + count) % count;
        if (!items[index]!.disabled) return index;
      }
      return -1;
    };

    let next = -1;
    if (key === 'ArrowDown') next = step(current, 1);
    else if (key === 'ArrowUp') next = step(current, -1);
    else if (key === 'Home') next = step(count - 1, 1);
    else next = step(0, -1);

    if (next === -1) return;
    event.preventDefault();
    triggerRefs.current.get(items[next]!.id)?.focus();
  };

  // Every forward carries the resolved token — the consumer's override, else the Accordion default — even when it
  // equals the child's own default, so the accordion's value always wins over the child's.
  const disclosureOverrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> = {
    triggerPaddingBlock: overrides?.triggerPaddingBlock ?? 'space.md',
    triggerFontFamily: overrides?.fontFamily ?? 'font.family.body',
    triggerFontSize: overrides?.triggerFontSize ?? 'font.size.md',
    triggerFontWeight: overrides?.triggerFontWeight ?? 'font.weight.medium',
  };

  const dividerOverrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> = {
    color: overrides?.divider ?? 'color.border',
    thickness: overrides?.dividerWidth ?? 'border.width.thin',
  };

  const rootStyle: CSSProperties | undefined = overrides?.itemGap
    ? ({ '--ds-accordion-item-gap': cssVar(overrides.itemGap) } as CSSProperties)
    : undefined;

  const children: ReactNode[] = [];
  items.forEach((item, index) => {
    if (divided && index > 0) {
      children.push(<Divider key={`divider-${item.id}`} overrides={dividerOverrides} />);
    }
    children.push(
      <Disclosure
        key={item.id}
        ref={setTriggerRef(item.id)}
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
    <div
      {...rest}
      ref={ref}
      data-ds="Accordion"
      data-part="list"
      className="ds-accordion"
      style={rootStyle}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
