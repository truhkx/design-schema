import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon, type IconName } from './Icon';
import { Tooltip } from './Tooltip';
import './SegmentedControl.css';

export type SegmentedControlSize = 'sm' | 'md';

/** One segment. `label` is one word; with `iconOnly` it becomes the accessible name and Tooltip text. */
export type SegmentedControlOption = { value: string; label: string; icon?: IconName | undefined; disabled?: boolean | undefined };

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type SegmentedControlOverridableBinding =
  | 'groupPadding'
  | 'groupRadius'
  | 'segmentShadow'
  | 'segmentRadius'
  | 'segmentPaddingInline'
  | 'segmentPaddingBlock'
  | 'segmentGap'
  | 'segmentSpacing'
  | 'selectedWeight'
  | 'paddingBlockSm'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'transition'
  | 'disabledOpacity';

const OVERRIDE_HOOK: Record<SegmentedControlOverridableBinding, string> = {
  groupPadding: '--ds-segmented-control-group-padding',
  groupRadius: '--ds-segmented-control-group-radius',
  segmentShadow: '--ds-segmented-control-segment-shadow',
  segmentRadius: '--ds-segmented-control-segment-radius',
  segmentPaddingInline: '--ds-segmented-control-segment-padding-inline',
  segmentPaddingBlock: '--ds-segmented-control-segment-padding-block',
  segmentGap: '--ds-segmented-control-segment-gap',
  segmentSpacing: '--ds-segmented-control-segment-spacing',
  selectedWeight: '--ds-segmented-control-selected-weight',
  paddingBlockSm: '--ds-segmented-control-padding-block-sm',
  fontFamily: '--ds-segmented-control-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-segmented-control-font-size',
  fontWeight: '--ds-segmented-control-font-weight',
  lineHeight: '--ds-segmented-control-line-height',
  transition: '--ds-segmented-control-transition',
  disabledOpacity: '--ds-segmented-control-disabled-opacity',
};

function overridesToStyle(overrides: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SegmentedControlOverridableBinding[]) {
    // Locked bindings are not in the type; anything passed around it is ignored here.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

function firstEnabledValue(options: SegmentedControlOption[]): string | undefined {
  return options.find((option) => !option.disabled)?.value;
}

type IndicatorRect = { left: number; top: number; width: number; height: number };

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'className' | 'style' | 'role'> {
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  label: string;
  /**
   * Two to five options (guidance, not enforced: any count renders, with no warning). Labels are
   * one word; with `iconOnly` the label becomes the accessible name. The icon is an Icon whose
   * `size` is the control's `size` (`sm` or `md`).
   */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /**
   * Initially selected value. Defaults to the first enabled option — a segmented control always has
   * a selection. A `value` or `defaultValue` is taken as given, never corrected: one naming a
   * disabled option keeps that segment checked with the pill under it (arrows still skip it); one
   * matching no option checks nothing and draws no pill (the pill is unmounted, and the next
   * selection places it instantly rather than sliding it in). In both cases the tab stop is the
   * first enabled segment, and arrows move from there when no segment has focus.
   */
  defaultValue?: string | undefined;
  /**
   * Show icons only (every option must have one); labels become accessible names and Tooltips. An
   * option without `icon` warns in development once per instance (one message listing every option
   * without an icon) and that segment shows its label as text instead, so it never renders empty;
   * that segment gets no Tooltip and no `aria-label`, since its visible text is its name.
   */
  iconOnly?: boolean | undefined;
  /** Toolbar (`sm`) or standard (`md`) height. */
  size?: SegmentedControlSize | undefined;
  /** Stretch to the container width with equal segments. */
  fill?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: ((value: string) => void) | undefined;
}

/**
 * SegmentedControl — Design Schema, category: input.
 *
 * When to use:
 * Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.
 */
export function SegmentedControl({
  ref,
  label,
  options,
  value,
  defaultValue,
  iconOnly = false,
  size = 'md',
  fill = false,
  overrides,
  onChange,
  onKeyDown,
  ...rest
}: SegmentedControlProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = `ds-segmented-control${useId()}`;
  const segmentId = (index: number): string => `${baseId}-segment-${index}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(() => defaultValue ?? firstEnabledValue(options));
  const selected = isControlled ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === selected);

  // One tab stop: the selected segment when it is enabled, otherwise the first enabled one.
  const tabStop =
    selectedIndex >= 0 && !options[selectedIndex]!.disabled ? selected : firstEnabledValue(options);

  const [indicator, setIndicator] = useState<IndicatorRect | undefined>(undefined);
  const lastRect = useRef<IndicatorRect | undefined>(undefined);

  // One message per instance, listing every option that has no icon; those segments fall back to
  // their label as text, so the control never renders an empty segment.
  const warnedMissingIcon = useRef(false);
  const missingIcons = isDev && iconOnly ? options.filter((option) => !option.icon).map((option) => option.value) : [];
  useEffect(() => {
    if (missingIcons.length === 0 || warnedMissingIcon.current) return;
    warnedMissingIcon.current = true;
    console.warn(
      `SegmentedControl: \`iconOnly\` needs an \`icon\` on every option; ${missingIcons
        .map((value) => `"${value}"`)
        .join(', ')} show their label as text instead.`,
    );
    // Warn once per instance, whatever `options` becomes later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingIcons.length]);

  // Segments wrapped by an icon-only Tooltip hand their ref to the Tooltip, so lookups go through ids.
  const getSegmentElement = (index: number): HTMLButtonElement | null =>
    typeof document !== 'undefined' && index >= 0
      ? (document.getElementById(segmentId(index)) as HTMLButtonElement | null)
      : null;

  const optionsKey = options.map((option) => `${option.value} ${option.label} ${option.icon ?? ''}`).join('');

  useLayoutEffect(() => {
    const segmentEl = getSegmentElement(selectedIndex);
    const groupEl = segmentEl?.closest<HTMLElement>('[data-ds="SegmentedControl"]') ?? null;

    // Converges: state is only written when the measured rect differs from the last one seen.
    const measure = () => {
      const next = segmentEl
        ? { left: segmentEl.offsetLeft, top: segmentEl.offsetTop, width: segmentEl.offsetWidth, height: segmentEl.offsetHeight }
        : undefined;
      const prev = lastRect.current;
      const same =
        prev === next ||
        (prev !== undefined &&
          next !== undefined &&
          prev.left === next.left &&
          prev.top === next.top &&
          prev.width === next.width &&
          prev.height === next.height);
      if (same) return;
      lastRect.current = next;
      setIndicator(next);
    };
    measure();

    if (!segmentEl || !groupEl || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(groupEl);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, fill, iconOnly, size, optionsKey]);

  const selectSegment = (optionValue: string) => {
    if (optionValue === selected) return;
    if (!isControlled) setInternalValue(optionValue);
    onChange?.(optionValue);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const enabled = options.flatMap((option, index) => (option.disabled ? [] : [index]));
    if (enabled.length === 0) return;

    const group = event.currentTarget;
    const focusedIndex = options.findIndex((_, index) => getSegmentElement(index) === event.target);
    const tabStopIndex = options.findIndex((option) => option.value === tabStop);
    const current = enabled.indexOf(focusedIndex >= 0 ? focusedIndex : tabStopIndex);
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(group).direction === 'rtl';
    // Inside a toolbar the arrows do not wrap, and Home/End belong to the toolbar.
    const inToolbar = group.parentElement?.closest('[role="toolbar"]') != null;

    let step: 1 | -1 | 'first' | 'last';
    switch (event.key) {
      case 'ArrowDown':
        step = 1;
        break;
      case 'ArrowUp':
        step = -1;
        break;
      case 'ArrowRight':
        step = rtl ? -1 : 1;
        break;
      case 'ArrowLeft':
        step = rtl ? 1 : -1;
        break;
      case 'Home':
        step = 'first';
        break;
      case 'End':
        step = 'last';
        break;
      default:
        return;
    }

    let targetPosition: number;
    if (step === 'first' || step === 'last') {
      if (inToolbar) return;
      targetPosition = step === 'first' ? 0 : enabled.length - 1;
    } else if (current < 0) {
      targetPosition = step === 1 ? 0 : enabled.length - 1;
    } else {
      targetPosition = current + step;
      if (targetPosition < 0 || targetPosition >= enabled.length) {
        if (inToolbar) return;
        targetPosition = (targetPosition + enabled.length) % enabled.length;
      }
    }

    const targetIndex = enabled[targetPosition];
    if (targetIndex === undefined) return;
    event.preventDefault();
    getSegmentElement(targetIndex)?.focus();
    selectSegment(options[targetIndex]!.value);
  };

  const classes = ['ds-segmented-control', `ds-segmented-control--${size}`, fill ? 'ds-segmented-control--fill' : null]
    .filter(Boolean)
    .join(' ');

  // offsetLeft/offsetTop are physical, so the pill is placed with physical insets in either direction.
  // A `value` matching no option leaves `indicator` undefined: the pill is unmounted rather than
  // hidden, so the next selection mounts it in place instead of sliding it in from nowhere.
  const indicatorStyle: CSSProperties | undefined = indicator
    ? { left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }
    : undefined;

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={label}
      data-ds="SegmentedControl"
      data-part="group"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        const showsIconOnly = iconOnly && option.icon !== undefined;
        const segment = (
          <button
            key={showsIconOnly ? undefined : option.value}
            id={segmentId(index)}
            type="button"
            role="radio"
            aria-checked={isSelected ? 'true' : 'false'}
            aria-disabled={option.disabled ? 'true' : undefined}
            aria-label={showsIconOnly ? option.label : undefined}
            tabIndex={option.value === tabStop ? 0 : -1}
            data-part="segment"
            className={['ds-segmented-control__segment', option.disabled ? 'ds-segmented-control__segment--disabled' : null]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (!option.disabled) selectSegment(option.value);
            }}
          >
            {option.icon ? (
              <span className="ds-segmented-control__segment-icon" data-part="segmentIcon">
                <Icon name={option.icon} size={size} />
              </span>
            ) : null}
            {showsIconOnly ? null : (
              <span className="ds-segmented-control__segment-label" data-part="segmentLabel">
                {option.label}
              </span>
            )}
          </button>
        );

        return showsIconOnly ? (
          <Tooltip key={option.value} content={option.label} describes={false}>
            {segment}
          </Tooltip>
        ) : (
          segment
        );
      })}
      {indicatorStyle ? (
        <span aria-hidden="true" data-part="indicator" className="ds-segmented-control__indicator" style={indicatorStyle} />
      ) : null}
    </div>
  );
}
