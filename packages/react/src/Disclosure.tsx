import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Disclosure.css';

/** Accepts the schema's string values and their numeric equivalents. */
export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type DisclosureOverridableBinding =
  | 'triggerPaddingBlock'
  | 'triggerPaddingInline'
  | 'triggerGap'
  | 'triggerFontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight'
  | 'triggerRadius'
  | 'panelPaddingBlock'
  | 'panelPaddingInline'
  | 'disabledOpacity'
  | 'transition';

const OVERRIDE_HOOK: Record<DisclosureOverridableBinding, string> = {
  triggerPaddingBlock: '--ds-disclosure-trigger-padding-block',
  triggerPaddingInline: '--ds-disclosure-trigger-padding-inline',
  triggerGap: '--ds-disclosure-trigger-gap',
  triggerFontFamily: '--ds-disclosure-trigger-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  triggerFontSize: '--ds-disclosure-trigger-font-size',
  triggerFontWeight: '--ds-disclosure-trigger-font-weight',
  triggerRadius: '--ds-disclosure-trigger-radius',
  panelPaddingBlock: '--ds-disclosure-panel-padding-block',
  panelPaddingInline: '--ds-disclosure-panel-padding-inline',
  disabledOpacity: '--ds-disclosure-disabled-opacity',
  transition: '--ds-disclosure-transition',
};

function overridesToStyle(overrides: Partial<Record<DisclosureOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as DisclosureOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface DisclosureProps
  extends Omit<
    ComponentPropsWithoutRef<'button'>,
    'type' | 'disabled' | 'children' | 'aria-expanded' | 'aria-controls' | 'aria-disabled' | 'onToggle' | 'onClick'
  > {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden) unless `keepMounted`. */
  children: ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  keepMounted?: boolean;
  /** When set, the trigger is wrapped in a heading of this level so the disclosure appears in the document outline. */
  headingLevel?: DisclosureHeadingLevel;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef>>;
  /** Fired after the state changes, with the new boolean `open`. */
  onToggle?: (open: boolean) => void;
}

/**
 * Disclosure — Design Schema, category: container.
 *
 * When to use:
 * Use a Disclosure to hide secondary content that some users need and most do not: optional
 * settings, long explanations, a list of details behind a summary count. Stack several to make an
 * accordion — each is independent; nothing in this component closes its siblings. Set
 * `headingLevel` when the summaries are section titles so they appear in the outline and
 * screen-reader heading lists.
 */
export const Disclosure = forwardRef<HTMLButtonElement, DisclosureProps>(function Disclosure(
  {
    summary,
    children,
    open,
    defaultOpen = false,
    disabled = false,
    keepMounted = false,
    headingLevel,
    overrides,
    onToggle,
    id: idProp,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? `ds-disclosure${generatedId}`;
  const panelId = `${id}-panel`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement, []);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const panelExists = isOpen || keepMounted;

  // Closing unmounts (or hides) the panel; if focus was inside it, it must land on the trigger, not the body.
  const focusWithinPanel = useRef(false);
  useEffect(() => {
    if (!isOpen && focusWithinPanel.current) {
      // Runs for both the trigger's own toggle and a controlled `open` change.
      focusWithinPanel.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onToggle?.(next);
  };

  const classes = ['ds-disclosure', isOpen ? 'ds-disclosure--open' : null, className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const trigger = (
    <button
      {...rest}
      ref={triggerRef}
      id={id}
      type="button"
      className="ds-disclosure__trigger"
      aria-expanded={isOpen ? 'true' : 'false'}
      aria-controls={panelExists ? panelId : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
    >
      <span className="ds-disclosure__icon" data-part="triggerIcon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </span>
      <span className="ds-disclosure__summary">{summary}</span>
    </button>
  );

  // The heading has no styling of its own; the button carries it.
  const Heading = headingLevel !== undefined ? (`h${headingLevel}` as ElementType) : null;

  return (
    <div className={classes} data-ds="Disclosure" style={mergedStyle}>
      {Heading ? <Heading className="ds-disclosure__heading">{trigger}</Heading> : trigger}
      {panelExists ? (
        <div
          id={panelId}
          className="ds-disclosure__panel"
          data-part="panel"
          hidden={!isOpen}
          onFocus={() => {
            focusWithinPanel.current = true;
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusWithinPanel.current = false;
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
});
