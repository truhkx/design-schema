import {
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
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import './Expander.css';

/** Accepts the schema's string values and their numeric equivalents. */
export type ExpanderHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/** Why the state changed: a pointer click, a keyboard activation (Enter/Space), or an external `open` prop change. */
export type ExpanderToggleReason = 'pointer' | 'keyboard' | 'controlled';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ExpanderOverridableBinding =
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

const OVERRIDE_HOOK: Record<ExpanderOverridableBinding, string> = {
  triggerPaddingBlock: '--demo-disclosure-trigger-padding-block',
  triggerPaddingInline: '--demo-disclosure-trigger-padding-inline',
  triggerGap: '--demo-disclosure-trigger-gap',
  triggerFontFamily: '--demo-disclosure-trigger-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  triggerFontSize: '--demo-disclosure-trigger-font-size',
  triggerFontWeight: '--demo-disclosure-trigger-font-weight',
  triggerRadius: '--demo-disclosure-trigger-radius',
  panelPaddingBlock: '--demo-disclosure-panel-padding-block',
  panelPaddingInline: '--demo-disclosure-panel-padding-inline',
  disabledOpacity: '--demo-disclosure-disabled-opacity',
  transition: '--demo-disclosure-transition',
};

function overridesToStyle(overrides: Partial<Record<ExpanderOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ExpanderOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface ExpanderProps
  extends Omit<
    ComponentPropsWithoutRef<'button'>,
    'type' | 'disabled' | 'children' | 'aria-expanded' | 'aria-controls' | 'aria-disabled' | 'onToggle' | 'onClick'
  > {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden) unless `keepMounted`. */
  children: ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean | undefined;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean | undefined;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  keepMounted?: boolean | undefined;
  /** When set, the trigger is wrapped in a heading of this level so the disclosure appears in the document outline. */
  headingLevel?: ExpanderHeadingLevel | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ExpanderOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired after the state changes, with the new boolean `open` and a reason: `pointer`,
   * `keyboard`, or `controlled` (Accordion relies on it).
   */
  onToggle?: ((open: boolean, reason: ExpanderToggleReason) => void) | undefined;
}

/**
 * Expander — Design Schema, category: container.
 *
 * When to use:
 * Use a Expander to hide secondary content that some users need and most do not: optional
 * settings, long explanations, a list of details behind a summary count. Stack several to make an
 * accordion — each is independent; nothing in this component closes its siblings. Set
 * `headingLevel` when the summaries are section titles so they appear in the outline and
 * screen-reader heading lists.
 */
export const Expander = function Expander({
  ref,
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
}: ExpanderProps & { ref?: Ref<HTMLButtonElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `demo-expander${generatedId}`;
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

  // Distinguishes an `open` prop change the trigger's own click already reported (reason
  // 'pointer'/'keyboard') from one the consumer made on their own (reason 'controlled').
  const mountedRef = useRef(false);
  const previousOpenRef = useRef(isOpen);
  const selfEmittedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousOpenRef.current = isOpen;
      return;
    }
    if (isControlled && previousOpenRef.current !== isOpen) {
      const wasSelfEcho = selfEmittedRef.current === isOpen;
      if (!wasSelfEcho) onToggle?.(isOpen, 'controlled');
    }
    selfEmittedRef.current = null;
    previousOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isControlled]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    const next = !isOpen;
    if (isControlled) {
      selfEmittedRef.current = next;
    } else {
      setInternalOpen(next);
    }
    // A native button's click event carries `detail: 0` when it was dispatched by a keyboard
    // activation (Enter/Space) rather than a pointing device.
    onToggle?.(next, event.detail === 0 ? 'keyboard' : 'pointer');
  };

  const classes = ['demo-expander', isOpen ? 'demo-expander--open' : null, className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const trigger = (
    <button
      {...rest}
      ref={triggerRef}
      id={id}
      type="button"
      className="demo-expander__trigger"
      aria-expanded={isOpen ? 'true' : 'false'}
      aria-controls={panelExists ? panelId : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
    >
      <span className="demo-expander__icon" data-part="triggerIcon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </span>
      <span className="demo-expander__summary">{summary}</span>
    </button>
  );

  // The heading has no styling of its own; the button carries it.
  const Heading = headingLevel !== undefined ? (`h${headingLevel}` as ElementType) : null;

  return (
    <div className={classes} data-ds="Disclosure" style={mergedStyle}>
      {Heading ? <Heading className="demo-expander__heading">{trigger}</Heading> : trigger}
      {panelExists ? (
        <div
          id={panelId}
          className="demo-expander__panel"
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
};
