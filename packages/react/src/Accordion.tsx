import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Disclosure, type DisclosureHeadingLevel, type DisclosureOverridableBinding } from './Disclosure';
import { Divider, type DividerOverridableBinding } from './Divider';
import './Accordion.css';

/** One section. `content` is the panel body. */
export type AccordionItem = { id: string; summary: string; content: ReactNode; disabled?: boolean };

/** Accepts the schema's string values and their numeric equivalents. */
export type AccordionHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/**
 * Why a section's open state changed: `trigger` for a click or Enter/Space activation,
 * `exclusive` for a section closed because another opened, `controlled` for an externally set
 * `value`. `keyboard` is reserved by the schema but unreachable here — Disclosure's trigger is a
 * native button, so Enter/Space activation reaches this component as an ordinary click with no way
 * to tell it apart from a pointer click; see the gap note in the generation report.
 */
export type AccordionOpenChangeReason = 'trigger' | 'keyboard' | 'exclusive' | 'controlled';

/** Detail passed to `onOpenChange` for the one section whose state changed. */
export interface AccordionOpenChangeDetail {
  id: string;
  open: boolean;
  reason: AccordionOpenChangeReason;
}

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type AccordionOverridableBinding =
  | 'divider'
  | 'dividerWidth'
  | 'itemGap'
  | 'triggerPaddingBlock'
  | 'fontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight';

const ROOT_OVERRIDE_HOOK: Partial<Record<AccordionOverridableBinding, string>> = {
  itemGap: '--ds-accordion-item-gap',
};

/** triggerPaddingBlock/fontFamily/triggerFontSize/triggerFontWeight are Disclosure's own bindings; roomier padding than a lone Disclosure, since accordion triggers are section headings. */
const DEFAULT_DISCLOSURE_OVERRIDES: Partial<Record<DisclosureOverridableBinding, TokenRef>> = {
  triggerPaddingBlock: 'space.md',
  triggerFontFamily: 'font.family.body',
  triggerFontSize: 'font.size.md',
  triggerFontWeight: 'font.weight.medium',
};

/** divider/dividerWidth are the composed Divider's own bindings. */
const DEFAULT_DIVIDER_OVERRIDES: Partial<Record<DividerOverridableBinding, TokenRef>> = {
  color: 'color.border',
  thickness: 'border.width.thin',
};

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function toIdArray(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

/** `exclusive` allows at most one open id; several passed via `value`/`defaultValue` keeps the first and warns about the rest. */
function resolveExclusiveIds(ids: string[], exclusive: boolean, source: 'value' | 'defaultValue'): string[] {
  if (!exclusive || ids.length <= 1) return ids;
  if (isDev) {
    console.warn(
      `Accordion: \`exclusive\` allows one open section, but \`${source}\` had ${ids.length}: ${ids.join(', ')}. Opening "${ids[0]}"; the rest are ignored.`,
    );
  }
  return ids.slice(0, 1);
}

function firstEnabledIndex(items: AccordionItem[]): number {
  return items.findIndex((item) => !item.disabled);
}

function lastEnabledIndex(items: AccordionItem[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index].disabled) return index;
  }
  return -1;
}

export interface AccordionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> {
  /** The sections in order. `content` is the panel body (a slot per item on Lit). */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. */
  headingLevel?: AccordionHeadingLevel;
  /**
   * Opening one section closes the others. Off by default: users usually want to compare, and
   * forced-closing is a common frustration.
   */
  exclusive?: boolean;
  /** Controlled open ids (array; a single id when `exclusive`). */
  value?: string | string[];
  /** Initially open ids. */
  defaultValue?: string | string[];
  /** A hairline between items. */
  divided?: boolean;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook, or the composed Disclosure/Divider's own override, to that token. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef>>;
  /** Fired when the set of open sections changes, with the open ids. */
  onChange?: (openIds: string[]) => void;
  /**
   * Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a
   * panel's content, or scrolling the opened section into view; `onChange` remains the set-level
   * event for state.
   */
  onOpenChange?: (detail: AccordionOpenChangeDetail) => void;
}

/**
 * Accordion — Design Schema, category: container.
 *
 * When to use:
 * Use an Accordion for a series of independent sections a user scans by heading and opens
 * selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is
 * optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are
 * heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const setTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const isControlled = value !== undefined;
  const [internalOpenIds, setInternalOpenIds] = useState<string[]>(() =>
    resolveExclusiveIds(toIdArray(defaultValue) ?? [], exclusive, 'defaultValue'),
  );
  const openIds = isControlled ? resolveExclusiveIds(toIdArray(value) ?? [], exclusive, 'value') : internalOpenIds;

  // Distinguishes a `value` change that echoes our own onChange from one the consumer made on
  // their own, so `onOpenChange` reports `controlled` only for the latter.
  const mountedRef = useRef(false);
  const previousExternalRef = useRef<string[]>(openIds);
  const lastEmittedRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousExternalRef.current = openIds;
      return;
    }
    if (!isControlled) return;

    const emitted = lastEmittedRef.current;
    lastEmittedRef.current = null;
    const isSelfEcho = Boolean(emitted) && emitted!.length === openIds.length && emitted!.every((id) => openIds.includes(id));

    if (!isSelfEcho) {
      const previous = previousExternalRef.current;
      for (const id of openIds) {
        if (!previous.includes(id)) onOpenChange?.({ id, open: true, reason: 'controlled' });
      }
      for (const id of previous) {
        if (!openIds.includes(id)) onOpenChange?.({ id, open: false, reason: 'controlled' });
      }
    }
    previousExternalRef.current = openIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIds.join(','), isControlled]);

  const handleToggle = (id: string, open: boolean) => {
    const previous = openIds;
    const next = open
      ? exclusive
        ? [id]
        : previous.includes(id)
          ? previous
          : [...previous, id]
      : previous.filter((openId) => openId !== id);

    if (isControlled) {
      lastEmittedRef.current = next;
    } else {
      setInternalOpenIds(next);
    }

    onOpenChange?.({ id, open, reason: 'trigger' });
    if (open && exclusive) {
      for (const openId of previous) {
        if (openId !== id) onOpenChange?.({ id: openId, open: false, reason: 'exclusive' });
      }
    }
    onChange?.(next);
  };

  // arrow-navigation: ArrowUp/Down, Home and End move focus among triggers and wrap; disabled
  // sections are skipped. Every trigger stays an ordinary tab stop (Disclosure never sets tabIndex).
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    const target = event.target as HTMLElement;
    const currentIndex = items.findIndex((item) => triggerRefs.current.get(item.id) === target);
    if (currentIndex === -1) return;

    const focusAt = (index: number) => triggerRefs.current.get(items[index].id)?.focus();

    const findEnabled = (from: number, step: number): number => {
      let index = from;
      for (let i = 0; i < items.length; i += 1) {
        index = (index + step + items.length) % items.length;
        if (!items[index].disabled) return index;
      }
      return -1;
    };

    let nextIndex = -1;
    switch (key) {
      case 'ArrowDown':
        nextIndex = findEnabled(currentIndex, 1);
        break;
      case 'ArrowUp':
        nextIndex = findEnabled(currentIndex, -1);
        break;
      case 'Home':
        nextIndex = firstEnabledIndex(items);
        break;
      case 'End':
        nextIndex = lastEnabledIndex(items);
        break;
      default:
        break;
    }

    if (nextIndex === -1) return;
    event.preventDefault();
    focusAt(nextIndex);
  };

  const disclosureOverrides: Partial<Record<DisclosureOverridableBinding, TokenRef>> = {
    ...DEFAULT_DISCLOSURE_OVERRIDES,
    ...(overrides?.triggerPaddingBlock ? { triggerPaddingBlock: overrides.triggerPaddingBlock } : null),
    ...(overrides?.fontFamily ? { triggerFontFamily: overrides.fontFamily } : null),
    ...(overrides?.triggerFontSize ? { triggerFontSize: overrides.triggerFontSize } : null),
    ...(overrides?.triggerFontWeight ? { triggerFontWeight: overrides.triggerFontWeight } : null),
  };

  const dividerOverrides: Partial<Record<DividerOverridableBinding, TokenRef>> = {
    ...DEFAULT_DIVIDER_OVERRIDES,
    ...(overrides?.divider ? { color: overrides.divider } : null),
    ...(overrides?.dividerWidth ? { thickness: overrides.dividerWidth } : null),
  };

  const rootOverrideStyle: Record<string, string> = {};
  for (const binding of Object.keys(ROOT_OVERRIDE_HOOK) as AccordionOverridableBinding[]) {
    const ref = overrides?.[binding];
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (ref && hook) rootOverrideStyle[hook] = cssVar(ref);
  }
  const mergedStyle =
    Object.keys(rootOverrideStyle).length || style ? { ...(rootOverrideStyle as CSSProperties), ...style } : undefined;

  const classes = ['ds-accordion', className ?? null].filter(Boolean).join(' ');

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
        headingLevel={headingLevel}
        open={openIds.includes(item.id)}
        disabled={item.disabled}
        keepMounted={keepMounted}
        overrides={disclosureOverrides}
        onToggle={(open) => handleToggle(item.id, open)}
      >
        {item.content}
      </Disclosure>,
    );
  });

  return (
    <div {...rest} ref={ref} data-ds="Accordion" data-part="list" className={classes} style={mergedStyle} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
});
