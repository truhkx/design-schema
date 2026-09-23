import { useEffect, useId, type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { Icon, type IconOverridableBinding } from './Icon';
import './Stepper.css';

export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** One step of the flow. */
export type StepperStep = {
  id: string;
  label: string;
  description?: string;
  status?: 'complete' | 'current' | 'upcoming' | 'error';
};

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';

const COPY = {
  navLabel: 'Progress',
  stepOf: 'Step {current} of {total}',
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
  // Native-only (React Native, SwiftUI): on web the <ol> gives the ordinal.
  stepLabel: 'Step {n}: {label}',
} as const;

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type StepperOverridableBinding =
  | 'indicatorSize'
  | 'indicatorBackground'
  | 'indicatorRadius'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'countSize'
  | 'stepHover'
  | 'stepRadius'
  | 'stepPadding'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

/** Hooks owned by the root. Label, description and count typography is forwarded to the composed Text's `overrides`. */
const ROOT_OVERRIDE_HOOK: Partial<Record<StepperOverridableBinding, string>> = {
  indicatorSize: '--ds-stepper-indicator-size',
  indicatorBackground: '--ds-stepper-indicator-background',
  indicatorRadius: '--ds-stepper-indicator-radius',
  indicatorFontSize: '--ds-stepper-indicator-font-size',
  indicatorFontWeight: '--ds-stepper-indicator-font-weight',
  connector: '--ds-stepper-connector',
  stepHover: '--ds-stepper-step-hover',
  stepRadius: '--ds-stepper-step-radius',
  stepPadding: '--ds-stepper-step-padding',
  stepGap: '--ds-stepper-step-gap',
  partGap: '--ds-stepper-part-gap',
  fontFamily: '--ds-stepper-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-stepper-transition',
};

/**
 * Every forward carries its binding's token, overridden or not — the composed Text's own `weight`
 * prop is not set, so the weight has to arrive as an override, and the rest follow the same rule.
 */
const DEFAULT_TOKEN = {
  labelSize: 'font.size.sm',
  labelWeight: 'font.weight.medium',
  labelCurrentWeight: 'font.weight.semibold',
  descriptionSize: 'font.size.xs',
  countSize: 'font.size.sm',
  fontFamily: 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
  indicatorFontSize: 'font.size.sm',
  indicatorCompleteForeground: 'color.control.selectedForeground',
  indicatorErrorForeground: 'color.status.danger.foreground',
} as const satisfies Record<string, TokenRef>;

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type IconOverrides = Partial<Record<IconOverridableBinding, TokenRef | undefined>>;

interface ResolvedOverrides {
  rootStyle: CSSProperties | undefined;
  label: TextOverrides;
  currentLabel: TextOverrides;
  description: TextOverrides;
  count: TextOverrides;
  indicatorFontSize: TokenRef;
}

function resolveOverrides(
  overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined,
): ResolvedOverrides {
  const rootStyle: Record<string, string> = {};
  const label: TextOverrides = {
    fontSize: DEFAULT_TOKEN.labelSize,
    fontWeight: DEFAULT_TOKEN.labelWeight,
    fontFamily: DEFAULT_TOKEN.fontFamily,
  };
  const currentLabel: TextOverrides = {
    fontSize: DEFAULT_TOKEN.labelSize,
    fontWeight: DEFAULT_TOKEN.labelCurrentWeight,
    fontFamily: DEFAULT_TOKEN.fontFamily,
  };
  const description: TextOverrides = {
    fontSize: DEFAULT_TOKEN.descriptionSize,
    fontFamily: DEFAULT_TOKEN.fontFamily,
  };
  const count: TextOverrides = { fontSize: DEFAULT_TOKEN.countSize, fontFamily: DEFAULT_TOKEN.fontFamily };
  let indicatorFontSize: TokenRef = DEFAULT_TOKEN.indicatorFontSize;

  for (const binding of Object.keys(overrides ?? {}) as StepperOverridableBinding[]) {
    const ref = overrides?.[binding];
    // Locked bindings passed from JavaScript have no hook here and are ignored.
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (!ref) continue;
    if (hook) rootStyle[hook] = cssVar(ref);
    switch (binding) {
      case 'labelSize':
        label.fontSize = ref;
        currentLabel.fontSize = ref;
        break;
      case 'labelWeight':
        label.fontWeight = ref;
        break;
      case 'labelCurrentWeight':
        currentLabel.fontWeight = ref;
        break;
      case 'descriptionSize':
        description.fontSize = ref;
        break;
      case 'countSize':
        count.fontSize = ref;
        break;
      case 'indicatorFontSize':
        indicatorFontSize = ref;
        break;
      case 'fontFamily':
        label.fontFamily = ref;
        currentLabel.fontFamily = ref;
        description.fontFamily = ref;
        count.fontFamily = ref;
        break;
      default:
        break;
    }
  }
  return {
    rootStyle: Object.keys(rootStyle).length > 0 ? (rootStyle as CSSProperties) : undefined,
    label,
    currentLabel,
    description,
    count,
    indicatorFontSize,
  };
}

export interface StepperProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label' | 'className' | 'style'> {
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /**
   * The steps in order. `status` is derived from `current` when omitted: before it complete, the step it
   * names current, after it upcoming. An explicit `status` sets only the indicator, its colours and the
   * status word; position (not status) decides the selected state, navigability, the connector colour and
   * the compact reveal.
   */
  steps: { id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[];
  /**
   * The id of the current step. The step whose id matches is the selected one (`aria-current="step"`) and
   * the one compact reveals, whatever its `status`. When no id matches, nothing is selected, every step
   * without an explicit status is upcoming, no step is navigable under `completed` (all still are under
   * `all`), the count reads "Step 1 of m", and development builds log a warning. The warning needs a
   * non-empty `current`: an empty one is treated as not yet set and does not warn.
   */
  current: string;
  /**
   * Vertical shows descriptions under each label and suits a side column; horizontal does not render
   * descriptions at all (not clipped, and no aria-describedby) and collapses to `compact` below the prose width.
   */
  orientation?: StepperOrientation | undefined;
  /**
   * Which steps can be activated: none (display only), completed steps (the usual — you can go back,
   * not skip ahead), or all (a settings-style flow where order does not matter). "Completed" means
   * visited — any step before the current one by position, including one marked `error`.
   */
  navigable?: StepperNavigable | undefined;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by
   * hand or automatically below the prose width — a vertical stepper has the room, so the prop does nothing
   * there. The other steps' labels, with their status words, are visually clipped, not removed.
   */
  compact?: boolean | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching `--ds-stepper-*` hook, or the composed
   * Text's or Icon's own override, to that token. Consumers may also set the hooks from their own CSS.
   */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
}

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status) return step.status;
  if (currentIndex === -1 || index > currentIndex) return 'upcoming';
  return index < currentIndex ? 'complete' : 'current';
}

const STATUS_WORD: Record<StepperStepStatus, string | undefined> = {
  complete: COPY.complete,
  current: COPY.current,
  error: COPY.error,
  upcoming: undefined,
};

/**
 * Stepper — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).
 */
export function Stepper({
  ref,
  label,
  steps,
  current,
  orientation = 'horizontal',
  navigable = 'completed',
  compact = false,
  overrides,
  onStepSelect,
  ...rest
}: StepperProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const baseId = useId();
  const currentIndex = steps.findIndex((step) => step.id === current);
  // Compact reveals the id match, or the first step when nothing matches, so it is never label-less.
  const revealIndex = Math.max(currentIndex, 0);
  const resolved = resolveOverrides(overrides);

  // An empty `current` is "not yet set", not a mistake, so it does not warn.
  useEffect(() => {
    if (isDev && current !== '' && currentIndex === -1) {
      console.warn(`Stepper: current "${current}" matches no step id; nothing is selected.`);
    }
  }, [current, currentIndex]);

  const classes = [
    'ds-stepper',
    `ds-stepper--${orientation}`,
    compact && orientation === 'horizontal' ? 'ds-stepper--compact' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const stepOf = COPY.stepOf
    .replace('{current}', String(revealIndex + 1))
    .replace('{total}', String(steps.length));

  return (
    <nav
      {...rest}
      ref={ref}
      data-ds="Stepper"
      className={classes}
      style={resolved.rootStyle}
      aria-label={label || COPY.navLabel}
    >
      <ol className="ds-stepper__list" data-part="list">
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex);
          // Selection, navigability, connector and the compact reveal follow position; the indicator,
          // its colours and the status word follow the status.
          const isCurrent = index === currentIndex;
          const isBefore = currentIndex !== -1 && index < currentIndex;
          const isNavigable = navigable === 'all' || (navigable === 'completed' && isBefore);
          const statusWord = STATUS_WORD[status];
          const hasDescription = orientation === 'vertical' && step.description !== undefined && step.description !== '';
          // Only a button computes its name from its content, so only there does the description need
          // hiding and referencing; inside a plain <div> it is read once as ordinary text.
          const descriptionId = hasDescription && isNavigable ? `${baseId}-d${index}` : undefined;
          const isLast = index === steps.length - 1;

          const iconOverrides = (color: TokenRef): IconOverrides => ({ size: resolved.indicatorFontSize, color });

          const content = (
            <>
              <span className="ds-stepper__indicator" data-part="indicator" aria-hidden="true">
                {status === 'complete' ? (
                  <Icon name="check" size="sm" overrides={iconOverrides(DEFAULT_TOKEN.indicatorCompleteForeground)} />
                ) : status === 'error' ? (
                  <Icon name="danger" size="sm" overrides={iconOverrides(DEFAULT_TOKEN.indicatorErrorForeground)} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="ds-stepper__content">
                <Text
                  element="span"
                  size="sm"
                  tone={status === 'upcoming' ? 'muted' : 'default'}
                  align={orientation === 'horizontal' ? 'center' : 'start'}
                  data-part="label"
                  overrides={isCurrent ? resolved.currentLabel : resolved.label}
                >
                  {step.label}
                </Text>
                {/* The status word follows the label directly, so compact clips the two together. */}
                {statusWord ? <span className="ds-stepper__visually-hidden">{`, ${statusWord}`}</span> : null}
                {hasDescription ? (
                  <Text
                    element="span"
                    size="xs"
                    tone="muted"
                    id={descriptionId}
                    aria-hidden={descriptionId ? 'true' : undefined}
                    data-part="description"
                    overrides={resolved.description}
                  >
                    {step.description}
                  </Text>
                ) : null}
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              className={[
                'ds-stepper__step',
                `ds-stepper__step--${status}`,
                isCurrent ? 'ds-stepper__step--selected' : null,
                index === revealIndex ? 'ds-stepper__step--revealed' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              data-part="step"
            >
              {isNavigable ? (
                <button
                  type="button"
                  className="ds-stepper__control ds-stepper__control--navigable"
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-describedby={descriptionId}
                  onClick={() => onStepSelect?.(step.id)}
                >
                  {content}
                </button>
              ) : (
                <div className="ds-stepper__control" aria-current={isCurrent ? 'step' : undefined}>
                  {content}
                </div>
              )}
              {isLast ? null : (
                <span
                  className={`ds-stepper__connector${isBefore ? ' ds-stepper__connector--complete' : ''}`}
                  data-part="connector"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <Text element="span" size="sm" tone="muted" className="ds-stepper__count" data-part="count" overrides={resolved.count}>
        {stepOf}
      </Text>
    </nav>
  );
}
