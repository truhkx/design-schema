import {
  forwardRef,
  useId,
  useLayoutEffect,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon, type IconName } from './Icon';
import { Tooltip } from './Tooltip';
import './SegmentedControl.css';

export type SegmentedControlSize = 'sm' | 'md';

/** One segment. `label` is one word; with `iconOnly` it becomes the accessible name and Tooltip text. */
export type SegmentedControlOption = { value: string; label: string; icon?: IconName; disabled?: boolean };

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type SegmentedControlOverridableBinding =
  | 'groupPadding'
  | 'groupRadius'
  | 'segmentShadow'
  | 'segmentRadius'
  | 'segmentPaddingInline'
  | 'segmentPaddingBlock'
  | 'segmentGap'
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
  fontFamily: '--ds-segmented-control-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-segmented-control-font-size',
  fontWeight: '--ds-segmented-control-font-weight',
  lineHeight: '--ds-segmented-control-line-height',
  transition: '--ds-segmented-control-transition',
  disabledOpacity: '--ds-segmented-control-disabled-opacity',
};

function overridesToStyle(overrides: Partial<Record<SegmentedControlOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SegmentedControlOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

function firstEnabledValue(options: SegmentedControlOption[]): string | undefined {
  return options.find((option) => !option.disabled)?.value ?? options[0]?.value;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  label: string;
  /** Two to five options. Labels are one word; with `iconOnly` the label becomes the accessible name. */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string;
  /** Initially selected value. Defaults to the first enabled option — a segmented control always has a selection. */
  defaultValue?: string;
  /** Show icons only (every option must have one); labels become accessible names and Tooltips. */
  iconOnly?: boolean;
  /** Toolbar (`sm`) or standard (`md`) height. */
  size?: SegmentedControlSize;
  /** Stretch to the container width with equal segments. */
  fill?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef>>;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: (value: string) => void;
}

/**
 * SegmentedControl — Design Schema, category: input.
 *
 * When to use:
 * Use it for two to five short, parallel options that change what a region shows or how a tool
 * behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in
 * toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible
 * Text label when the group's purpose is not obvious.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  {
    label,
    options,
    value,
    defaultValue,
    iconOnly = false,
    size = 'md',
    fill = false,
    overrides,
    onChange,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const baseId = `ds-segmented-control${generatedId}`;
  const segmentId = (optionValue: string) => `${baseId}-segment-${optionValue}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    () => defaultValue ?? firstEnabledValue(options),
  );
  const selected = isControlled ? value : internalValue;
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>();

  if (isDev && !label) {
    console.warn('SegmentedControl: `label` is required and becomes the group’s accessible name.');
  }
  if (isDev && (options.length < 2 || options.length > 5)) {
    console.warn('SegmentedControl: `options` should have two to five entries.');
  }
  if (isDev && iconOnly && options.some((option) => !option.icon)) {
    console.warn('SegmentedControl: every option needs an `icon` when `iconOnly` is set.');
  }

  // The segment behind an icon-only Tooltip loses its own ref (Tooltip clones its child with its
  // own trigger ref), so lookups go through the generated id rather than a callback ref.
  const getSegmentElement = (optionValue: string) =>
    typeof document !== 'undefined' ? document.getElementById(segmentId(optionValue)) : null;

  useLayoutEffect(() => {
    const segmentEl = selected ? getSegmentElement(selected) : null;
    if (!segmentEl) {
      setIndicatorStyle(undefined);
      return undefined;
    }

    const measure = () => {
      setIndicatorStyle({
        insetInlineStart: segmentEl.offsetLeft,
        insetBlockStart: segmentEl.offsetTop,
        inlineSize: segmentEl.offsetWidth,
        blockSize: segmentEl.offsetHeight,
      });
    };
    measure();

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, fill, iconOnly, size, options]);

  const selectSegment = (optionValue: string) => {
    if (!isControlled) setInternalValue(optionValue);
    if (optionValue !== selected) onChange?.(optionValue);
  };

  const focusAndSelect = (optionValue: string) => {
    selectSegment(optionValue);
    (getSegmentElement(optionValue) as HTMLButtonElement | null)?.focus();
  };

  const handleSegmentClick = (option: SegmentedControlOption) => {
    if (option.disabled) return;
    selectSegment(option.value);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = options.filter((option) => !option.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((option) => option.value === selected);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusAndSelect(enabled[(currentIndex + 1 + enabled.length) % enabled.length].value);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusAndSelect(enabled[(currentIndex - 1 + enabled.length) % enabled.length].value);
        break;
      case 'Home':
        event.preventDefault();
        focusAndSelect(enabled[0].value);
        break;
      case 'End':
        event.preventDefault();
        focusAndSelect(enabled[enabled.length - 1].value);
        break;
      default:
        break;
    }
  };

  const classes = [
    'ds-segmented-control',
    `ds-segmented-control--${size}`,
    fill ? 'ds-segmented-control--fill' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={label}
      data-ds="SegmentedControl"
      data-part="group"
      className={classes}
      style={mergedStyle}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        const segmentClasses = [
          'ds-segmented-control__segment',
          option.disabled ? 'ds-segmented-control__segment--disabled' : null,
        ]
          .filter(Boolean)
          .join(' ');

        const segment = (
          <button
            key={iconOnly ? undefined : option.value}
            id={segmentId(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected ? 'true' : 'false'}
            aria-disabled={option.disabled ? 'true' : undefined}
            tabIndex={isSelected ? 0 : -1}
            data-part="segment"
            className={segmentClasses}
            onClick={() => handleSegmentClick(option)}
          >
            {option.icon ? (
              <span className="ds-segmented-control__segment-icon" data-part="segmentIcon">
                <Icon name={option.icon} inline />
              </span>
            ) : null}
            {iconOnly ? null : (
              <span className="ds-segmented-control__segment-label" data-part="segmentLabel">
                {option.label}
              </span>
            )}
          </button>
        );

        return iconOnly ? (
          <Tooltip key={option.value} content={option.label} describes={false}>
            {segment}
          </Tooltip>
        ) : (
          segment
        );
      })}
      <span aria-hidden="true" data-part="indicator" className="ds-segmented-control__indicator" style={indicatorStyle} />
    </div>
  );
});
