import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import './Disclosure.css';

/** Accepts the schema's string values and their numeric equivalents. */
export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/** Why the state changed: a pointer click, a keyboard activation (Enter/Space), or an external `open` prop change. */
export type DisclosureToggleReason = 'pointer' | 'keyboard' | 'controlled';

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

function overridesToStyle(overrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as DisclosureOverridableBinding[]) {
    // Locked bindings are not in the type; anything passed anyway has no hook and is ignored.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface DisclosureProps
  extends Omit<
    ComponentPropsWithoutRef<'button'>,
    | 'type'
    | 'disabled'
    | 'children'
    | 'className'
    | 'style'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-disabled'
    | 'onToggle'
    | 'onClick'
  > {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden), so heavy content is not laid out until asked for. */
  children: ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean | undefined;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean | undefined;
  /**
   * Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields,
   * so the Form still collects them while the disclosure is closed.
   */
  keepMounted?: boolean | undefined;
  /**
   * When set, the trigger is wrapped in a heading of this level so the disclosure appears in the document outline —
   * use for FAQ and accordion sections.
   */
  headingLevel?: DisclosureHeadingLevel | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired after the state changes, with the new boolean `open` and a reason: `pointer`, `keyboard`, or `controlled`
   * (Accordion relies on it). The activation method is read from the native click (`event.detail === 0` means keyboard).
   */
  onToggle?: ((open: boolean, reason: DisclosureToggleReason) => void) | undefined;
}

/**
 * Disclosure — Design Schema, category: container.
 *
 * When to use:
 * Use a Disclosure to hide secondary content that some users need and most do not: optional settings, long
 * explanations, a list of details behind a summary count. Stack several to make an accordion — each is independent;
 * nothing in this component closes its siblings. Set `headingLevel` when the summaries are section titles so they
 * appear in the outline and screen-reader heading lists.
 *
 * `ref` resolves to the trigger `<button>` (Accordion moves focus between triggers through it); the wrapping `<div>`
 * carries `data-ds="Disclosure"`.
 */
export function Disclosure({
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
  ...rest
}: DisclosureProps & { ref?: Ref<HTMLButtonElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `ds-disclosure${generatedId}`;
  const panelId = `${id}-panel`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement, []);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;
  const panelExists = isOpen || keepMounted;

  // Closing removes (or hides) the panel, so focus inside it is handed to the trigger — whether the close came from
  // the trigger or from a controlled `open` change. Removal can blur without a focusout, so the flag is only cleared
  // when focus demonstrably moved somewhere else.
  const focusWithinPanel = useRef(false);
  useLayoutEffect(() => {
    if (isOpen || !focusWithinPanel.current) return;
    focusWithinPanel.current = false;
    const active = document.activeElement;
    const lost = active === null || active === document.body || (panelRef.current?.contains(active) ?? false);
    if (lost) triggerRef.current?.focus();
  }, [isOpen]);

  // Controlled: a user toggle is reported at once (the state changes only when the consumer echoes it), and an `open`
  // change that echoes that report does not fire again; any other `open` change reports 'controlled'. Uncontrolled:
  // the toggle is reported after the new state has committed. A pending request is cleared at the next `open` change.
  const previousOpenRef = useRef(isOpen);
  const selfEmittedRef = useRef<boolean | null>(null);
  const pendingReasonRef = useRef<DisclosureToggleReason | null>(null);
  useEffect(() => {
    if (previousOpenRef.current === isOpen) return;
    previousOpenRef.current = isOpen;
    const echo = selfEmittedRef.current === isOpen;
    selfEmittedRef.current = null;
    const reason = pendingReasonRef.current;
    pendingReasonRef.current = null;
    if (isControlled) {
      if (!echo) onToggle?.(isOpen, 'controlled');
    } else if (reason !== null) {
      onToggle?.(isOpen, reason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    const next = !isOpen;
    // A native button's click carries `detail: 0` when Enter or Space activated it.
    const reason: DisclosureToggleReason = event.detail === 0 ? 'keyboard' : 'pointer';
    if (isControlled) {
      selfEmittedRef.current = next;
      onToggle?.(next, reason);
    } else {
      pendingReasonRef.current = reason;
      setInternalOpen(next);
    }
  };

  const trigger = (
    <button
      {...rest}
      ref={triggerRef}
      id={id}
      type="button"
      className="ds-disclosure__trigger"
      data-part="trigger"
      aria-expanded={isOpen ? 'true' : 'false'}
      aria-controls={panelExists ? panelId : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
    >
      <span className="ds-disclosure__icon" data-part="triggerIcon">
        <Icon name="chevron-right" inline />
      </span>
      <span className="ds-disclosure__summary">{summary}</span>
    </button>
  );

  // The heading has no styling of its own; the button carries it.
  const HeadingTag = headingLevel !== undefined ? (`h${headingLevel}` as ElementType) : null;

  return (
    <div
      className={isOpen ? 'ds-disclosure ds-disclosure--open' : 'ds-disclosure'}
      data-ds="Disclosure"
      style={overrides ? overridesToStyle(overrides) : undefined}
    >
      {HeadingTag ? <HeadingTag className="ds-disclosure__heading">{trigger}</HeadingTag> : trigger}
      {panelExists ? (
        <div
          ref={panelRef}
          id={panelId}
          className="ds-disclosure__panel"
          data-part="panel"
          hidden={!isOpen}
          onFocus={() => {
            focusWithinPanel.current = true;
          }}
          onBlur={(event) => {
            const to = event.relatedTarget as Node | null;
            if (to !== null && !event.currentTarget.contains(to)) focusWithinPanel.current = false;
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
