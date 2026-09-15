import * as React from "react";
import { EasingFunction, GestureResponderEvent, PanResponderInstance, TextInputFocusEvent, TextStyle, ViewInstance } from "react-native";
import * as light from "@design-schema/tokens/calm-precise/rn/light";
import { TokenRef } from "@design-schema/tokens";
//#region src/theme.d.ts
/** The flat React Native token object for one mode (dimensions are numbers, colors are strings). */
type Tokens = typeof light;
/** A resolved color mode. */
type ThemeMode = "light" | "dark";
/** What a consumer may ask for; `system` follows the OS appearance via `useColorScheme()`. */
type ThemeModeSetting = ThemeMode | "system";
interface Theme {
  /** The resolved mode (never `system`). */
  mode: ThemeMode;
  /** The token module for the resolved mode. */
  tokens: Tokens;
}
interface ThemeProviderProps {
  /** Which mode to apply. Defaults to `system`. */
  mode?: ThemeModeSetting | undefined;
  children: React.ReactNode;
}
/**
 * Calm & precise theme provider for React Native.
 *
 * Selects the light or dark token module and exposes it through `useTheme()`.
 * `mode="system"` (the default) resolves through React Native's `useColorScheme()`.
 */
export declare function ThemeProvider({ mode, children }: ThemeProviderProps): React.JSX.Element;
/**
 * Returns the active `{ mode, tokens }`.
 *
 * Works without a provider by following the OS appearance, so components never
 * fall back to hard-coded values.
 */
export declare function useTheme(): Theme;
/**
 * Converts a numeric `font.weight.*` token (400, 500, 600, 700) into React Native's
 * `fontWeight` union. The token module types weights as `number`, which is not
 * assignable to `TextStyle['fontWeight']` under strict mode.
 */
export declare function toFontWeight(value: number): TextStyle["fontWeight"];
/**
 * React Native `lineHeight` is an absolute size, while the `font.lineHeight.*`
 * tokens are unitless multipliers. Resolve them against the font size.
 */
export declare function toLineHeight(fontSize: number, multiplier: number): number;
/**
 * Converts a `motion.easing.*` token (a cubic-bézier as four numbers) into an
 * `Animated` easing function. Anything that is not four numbers falls back to
 * `Easing.linear` rather than a hand-written curve.
 */
export declare function toEasing(value: readonly number[]): EasingFunction;
/**
 * Whether the person has asked the OS to reduce motion. Resolves asynchronously on
 * first render (assume `false` until then) and follows later changes, so components
 * can skip `Animated` transitions and set their final value directly.
 */
export declare function useReducedMotion(): boolean;
//#endregion
//#region src/Button.d.ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ButtonOverridableBinding = "backgroundHover" | "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerStroke";
/** The pair sent to `onTrack` after a tracked press. */
interface ButtonTrackEvent {
  name: string;
  label: string;
}
interface ButtonProps {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant | undefined;
  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize | undefined;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType | undefined;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure):
   * reflected to `accessibilityState.expanded`. `undefined` (the default) means this
   * button does not disclose anything, so `expanded` is omitted from the state object
   * rather than sent as `false`. Consumers rarely set it directly.
   */
  expanded?: boolean | undefined;
  /** Prevents activation. The button stays in the accessibility tree and is announced as disabled. */
  disabled?: boolean | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. Decorative, like `leadingIcon`. */
  trailingIcon?: React.ReactNode;
  /** Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`). */
  iconOnly?: boolean | undefined;
  /** Replaces the icon slot with a ring spinner, keeps the label in place, and blocks repeat activation while an action is pending. */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, tooltip-like panels). Only
   * meaningful on `ghost`, whose text switches to `color.inverse.link`; every
   * variant's focus ring switches to `color.inverse.focus` since that ring must
   * read against the inverse surface regardless of the button's own fill.
   */
  inverse?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort
   * by Amount, ascending" on a header that shows "Amount"). The visible label must be
   * the start of it (WCAG 2.5.3 label-in-name). Maps to `accessibilityLabel`.
   */
  accessibleName?: string | undefined;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow Menu. Not
   * rendered by Button itself — read by the collapsing parent.
   */
  overflowLabel?: string | undefined;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the button is activated by touch, keyboard, or assistive technology. */
  onPress?: (() => void) | undefined;
  /** Fired after `onPress` with the `track` name and the button's label, only when `track` is set. */
  onTrack?: ((event: ButtonTrackEvent) => void) | undefined;
}
/**
 * Button — lets people take an action with a single tap.
 *
 * When to use: Use a Button when the user needs to **do something**: submit, save,
 * confirm, open, add, delete. The label should be a verb or verb phrase that
 * describes the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view. Use
 * `secondary` for the alternatives beside it, `ghost` for low-emphasis actions in
 * dense UI such as toolbars, and `danger` only for destructive, hard-to-undo actions.
 *
 * Renders a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel`
 * (`accessibleName` when set, else `label`) and `accessibilityState={{ disabled, busy,
 * expanded }}` (`expanded` omitted unless a disclosing parent sets it). `disabled` is
 * never passed to `Pressable`
 * itself — that would drop it from the tab order — so a disabled button stays
 * focusable and is announced as disabled while a press guard blocks `onPress`. There
 * is no hover on touch, so `backgroundHover` animates in for the pressed state instead
 * (over `transition`, eased with `motion.easing.standard`, skipped under reduced
 * motion); the focus ring is a border drawn in `color.border.focus` (or
 * `color.inverse.focus` when `inverse`) that is transparent, not absent, so focusing
 * never shifts layout. `loading` replaces the leading icon slot with a ring spinner
 * that rotates continuously over `loadingSpin` (frozen under reduced motion), hides
 * `trailingIcon`, and keeps the label visible; it also blocks repeat activation
 * alongside `disabled`. `inverse` only changes `ghost`'s foreground token; other
 * variants keep their own fills. `type="submit"` calls `submit()` on the nearest Form
 * context. `track`, when set, calls the hand-written `trackPress(name, label)` after
 * `onPress` and before `onTrack` fires with the same pair. When the measured
 * footprint is smaller than the comfortable target, `hitSlop` makes up the
 * difference. `leadingIcon`/`trailingIcon` render in decorative wrappers
 * (`accessibilityElementsHidden`, `importantForAccessibility="no"`); there is no
 * cascade, so callers color glyphs with the variant's foreground themselves.
 */
export declare function Button({ label, variant, size, type, expanded, disabled, leadingIcon, trailingIcon, iconOnly, loading, inverse, accessibleName, track, overrides, onPress, onTrack }: ButtonProps): React.JSX.Element;
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "color";
interface TextProps {
  /** The text content. Inline formatting (nested Text) is allowed; block elements are not. */
  children: React.ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  tone?: TextTone | undefined;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /** Clip to one line with an ellipsis. Screen readers still read the full text. */
  truncate?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * The resolved size and color a system `Text` is rendering with, plus whether
 * anything is nested inside one at all. Inline components such as Icon and Link
 * read this to match the surrounding typography instead of falling back to a
 * default, since React Native has no cascade to inherit it from otherwise.
 */
interface TextStyleContextValue {
  fontSize: number;
  color: string;
  nested: boolean;
}
export declare const TextStyleContext: React.Context<TextStyleContextValue>;
/** Resolves `start`/`end` against the current writing direction, since RN's `textAlign` has no logical values. */
export declare function toTextAlign(align: TextAlign): TextStyle["textAlign"];
/**
 * Text — the default way to put words on a screen.
 *
 * When to use: Use Text for paragraphs, labels, captions, helper text, and any
 * inline copy. Pick `size` from the scale rather than styling a raw element, and use
 * `tone` for meaning: `muted` for secondary information, `danger` for errors,
 * `strong` when a phrase must stand out from surrounding body copy. Use `weight` to
 * create hierarchy inside a size; it is calmer than jumping sizes.
 *
 * Renders React Native `Text`. `truncate` maps to `numberOfLines={1}` with
 * `ellipsizeMode="tail"`; `allowFontScaling` stays on so Dynamic Type / font
 * scaling applies. There is no `element` prop on native. Provides
 * `TextStyleContext` with the resolved `fontSize`/`color` so inline children
 * (Icon, Link) can match this Text instead of falling back to a default.
 */
export declare function Text({ children, size, weight, tone, align, truncate, overrides }: TextProps): React.JSX.Element;
//#endregion
//#region src/Heading.d.ts
/** Position in the document outline. The schema declares the values as strings; numbers are accepted for ergonomics. */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6 | "1" | "2" | "3" | "4" | "5" | "6";
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
interface HeadingProps {
  /**
   * Position in the document outline. On React Native this controls only the default
   * typography — iOS and Android have no heading levels, so the header trait is set
   * regardless of level. Document the outline in the screen's design instead.
   */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: React.ReactNode;
  /** Horizontal text alignment. */
  align?: TextAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Heading — labels a section of content and builds the outline screen-reader users
 * navigate by.
 *
 * When to use: Use a Heading to title a page, a section, or a card that contains its
 * own content. Choose `level` from the document outline — the page title is `1`, its
 * major sections are `2`, their subsections `3` — and then choose `size` separately
 * if the default visual size is wrong for the layout. Decoupling level from size is
 * the whole point of this component: it lets designers pick the right look without
 * breaking the outline.
 *
 * Renders `Text` with `accessibilityRole="header"`. `level` chooses the default
 * size only; VoiceOver and TalkBack expose the header trait but not a level. Do not
 * simulate levels with `accessibilityLabel` prefixes.
 */
export declare function Heading({ level, size, children, align, overrides }: HeadingProps): React.JSX.Element;
//#endregion
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type InputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "minTargetSm" | "disabledOpacity";
interface InputProps {
  /** Visible label. Always rendered; never replaced by a placeholder. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Input type. Drives the keyboard (`keyboardType`, `textContentType`, `secureTextEntry`). */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the field's `accessibilityLabel`). Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: InputSize | undefined;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change with the new string value. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: ((event: TextInputFocusEvent) => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: ((event: TextInputFocusEvent) => void) | undefined;
}
/**
 * Input — collects a single line of text, bundling label, helper text, field and
 * error message so their association is always correct.
 *
 * When to use: Use Input for names, emails, passwords, search terms, and short
 * free-text values. Choose `type` for the value so touch keyboards and browser
 * validation match. Provide `description` when the format matters ("Use the email
 * you signed up with"). Set `autocomplete` on web whenever the value is personal
 * data so browsers and assistive tools can fill it.
 *
 * Renders a `Text` label, optional description, a `TextInput`, and an error `Text`.
 * The label is also passed as `accessibilityLabel`, description as
 * `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to
 * `keyboardType`, `textContentType` and `secureTextEntry`. Inside a Form the field
 * registers `{ getValue, validate, focus }` by `name`; the last field's return key
 * submits the form. The focus ring replaces the border with `focusRingWidth`
 * (locked to `border.width.focus`) and padding shrinks by the same amount so the
 * field never shifts; `disabled` dims the whole label/description/field/error
 * group with `disabledOpacity` rather than inventing a disabled color. Inside a
 * Fieldset, the group's `disabled` applies as if set on the field and the legend
 * prefixes the field's `accessibilityLabel` ("Shipping address, Street"). `size:
 * sm` swaps `paddingBlock`/`paddingInline`/the target height for their `Sm`
 * bindings and the field text to `font.size.sm`; nothing else changes.
 */
export declare function Input({ label, name, value, defaultValue, placeholder, description, type, required, hideLabel, size, disabled, invalid, error, overrides, onChange, onFocus, onBlur }: InputProps): React.JSX.Element;
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
type NumberInputSize = "sm" | "md";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type NumberInputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "affixGap" | "stepperGap" | "stepperDivider" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "minTargetSm" | "disabledOpacity";
interface NumberInputProps {
  /** Visible label. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. The collected value is the number, stringified (`FormFieldValue` has no numeric variant). */
  name: string;
  /** Controlled numeric value. `undefined` means empty. */
  value?: number | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound; the increment button disables at it. */
  max?: number | undefined;
  /** Increment for the buttons and accessibility step actions. Also the rounding granularity when `precision` is omitted. */
  step?: number | undefined;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via `Intl.NumberFormat`. The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as `suffix` when not a valid Intl unit. */
  unit?: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. */
  leadingText?: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit` is not a valid Intl unit. */
  trailingText?: string | undefined;
  /** Hide the increment/decrement buttons. The accessibility step actions still work. */
  hideSteppers?: boolean | undefined;
  /** Example value shown while empty. */
  placeholder?: string | undefined;
  /** Helper text below the label. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the field's `accessibilityLabel`). Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type, `sm` stepper buttons. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChangeText?: ((value: number | undefined) => void) | undefined;
}
/**
 * NumberInput — collects a number people type exactly, with step buttons and
 * accessibility step actions for the small adjustments, and locale formatting so
 * 1,234.5 reads the way the user expects.
 *
 * When to use: Use for quantities, amounts, measurements and other exact numeric
 * values. Choose `format` so the field reads as the thing it holds. Set `min`, `max`
 * and `step` whenever they exist; they drive the buttons, the accessibility step
 * actions and the out-of-range message.
 *
 * Renders a label, optional description, a bordered field row (optional leading
 * text, the `TextInput`, optional trailing text, and — unless `hideSteppers` —
 * two system `Button`s separated from the field by a hairline), and an error
 * message. The field shows the raw typed digits while focused and the
 * `Intl.NumberFormat`-formatted value once blurred, when it is also rounded to
 * `precision` and clamped to `min`/`max` (reporting `copy.outOfRange` when that
 * changed what was typed and both bounds are set). The `TextInput` carries
 * `accessibilityRole="adjustable"`, `accessibilityValue`, and increment/decrement/
 * pageup/pagedown/home/end accessibility actions so a screen reader can step
 * without the buttons; the buttons themselves are hidden from assistive technology
 * (`accessibilityElementsHidden`) since those actions cover the same ground, and
 * disable at `min`/`max`. `format: percent` stores the number as typed and divides
 * by 100 only for display; `format: unit` falls back to a plain number plus
 * `unit` shown as literal trailing text when `unit` is not a valid Intl unit
 * identifier; `format: currency` without `currency` is a dev warning that falls
 * back to USD. `disabled` dims the whole group with `disabledOpacity`. Inside a
 * Form the field registers the number, stringified.
 */
export declare function NumberInput({ label, name, value, defaultValue, min, max, step, precision, format, currency, unit, leadingText, trailingText, hideSteppers, placeholder, description, required, hideLabel, size, disabled, invalid, error, overrides, onChangeText }: NumberInputProps): React.JSX.Element;
//#endregion
//#region src/FormContext.d.ts
/** When field-level validation runs. Mirrors Form's `validate` prop. */
type FormValidateMode = "submit" | "blur" | "change";
/**
 * What one field contributes on submit: a string (Input, RadioGroup, a checked
 * Checkbox's `value`), a boolean (Switch), an array of strings (a `multiple`
 * Listbox), or `undefined` for an unchecked Checkbox or an empty Listbox selection,
 * which is then left out of the collected values.
 */
type FormFieldValue = string | boolean | string[] | undefined;
/** The values `onSubmit` receives, keyed by field name. */
type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;
/** What a field (Input, Checkbox, Switch, RadioGroup) registers with the enclosing Form. */
interface FormFieldHandle {
  /** Current value of the field. `undefined` means "contributes nothing". */
  getValue(): FormFieldValue;
  /** Returns an error message when the field is invalid, otherwise `null`. */
  validate(): string | null;
  /** Moves keyboard and accessibility focus to the field. */
  focus(): void;
}
interface FormContextValue {
  /** Registers a field by `name`. Registration order is the field order. */
  register(name: string, handle: FormFieldHandle): void;
  /** Removes a field on unmount (or when it becomes disabled). */
  unregister(name: string): void;
  /** Validates every field and fires `onSubmit` or `onInvalid`. */
  submit(): void;
  /** Moves focus to the named field, if registered. Used by the keyboard's "next" key. */
  focusField(name: string): void;
  /** Reports the result of a `blur`/`change` validation run for one field. */
  reportValidity(name: string, error: string | null): void;
  /** `true` when the Form is disabled; every field and action inside follows. */
  disabled: boolean;
  /** The Form's `validate` setting. */
  validateMode: FormValidateMode;
  /** Whether the Form renders (and announces) its own error summary. */
  errorSummary: boolean;
  /** Errors from the most recent validation, keyed by field name. */
  errors: Readonly<Partial<Record<string, string | undefined>>>;
  /** Field names in registration order; the last one gets `returnKeyType="done"`. */
  order: readonly string[];
}
/** `null` outside of a Form so Button and Input work standalone. */
export declare const FormContext: React.Context<FormContextValue | null>;
export declare function useFormContext(): FormContextValue | null;
//#endregion
//#region src/Form.d.ts
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type FormOverridableBinding = "gap" | "errorSummaryBorder";
interface FormProps {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: React.ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first. Rendered after the fields with the form gap; the `actions` anatomy part. */
  actions: React.ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form. */
  label?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  errorSummary?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the form is submitted and every field is valid. Receives the collected
   * values keyed by field name: strings from Input, RadioGroup and checked Checkboxes,
   * booleans from Switch. An unchecked Checkbox contributes no key.
   */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: Record<string, string>) => void) | undefined;
}
/**
 * Form — the container that makes fields behave as a group.
 *
 * When to use: Use Form whenever two or more fields are submitted together, and for
 * any single field whose submission has consequences (sign-in, search with side
 * effects). Pass the submit and cancel Buttons in `actions`, primary first. Give
 * the form a `label` when the page contains more than one.
 *
 * React Native has no form element. Form renders a `View` with `role="form"` and
 * `accessibilityLabel` and provides a context; each Input registers
 * `{ getValue, validate, focus }` by name (Checkbox, Switch and RadioGroup register
 * the same way), a Button with `type: submit` calls `submit()`, and the last
 * Input's return key submits. `children` (the fields) and `actions` (the action
 * row) render in separate anatomy parts, both spaced by `gap`. On a failed
 * submission the error summary is announced (`accessibilityLiveRegion="assertive"`
 * on Android, `announceForAccessibility` on iOS) and focus moves to the summary
 * when `errorSummary` is on, otherwise to the first invalid field.
 */
export declare function Form({ children, actions, name, label, validate, disabled, errorSummary, overrides, onSubmit, onInvalid }: FormProps): React.JSX.Element;
//#endregion
//#region src/Stack.d.ts
type StackDirection = "vertical" | "horizontal";
type StackGap = "none" | "tight" | "normal" | "loose" | "section";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify = "start" | "center" | "end" | "between";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type StackOverridableBinding = "gap";
interface StackProps {
  /** Any components. Stack does not style its children; it only positions them. */
  children: React.ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /** Space between children, from the layout rhythm. The only way to set spacing between siblings. */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /** Main-axis distribution. */
  justify?: StackJustify | undefined;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Stack — how things get spaced. Owns the gap between its children using a preset
 * from the theme's layout rhythm, instead of margins on individual components.
 *
 * When to use: Use Stack for any group of siblings that should be evenly spaced:
 * form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout CSS.
 *
 * Renders a `View` with `flexDirection`, `gap` from the token object, `alignItems`,
 * `justifyContent` and `flexWrap`. `element` is not applicable on React Native; put
 * `accessibilityRole` on the content instead. Row direction already follows the
 * writing direction under `I18nManager`.
 */
export declare function Stack({ children, direction, gap, align, justify, wrap, overrides }: StackProps): React.JSX.Element;
//#endregion
//#region src/Fieldset.d.ts
type FieldsetGap = Extract<StackGap, "tight" | "normal" | "loose">;
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "disabledOpacity" | "fontFamily" | "lineHeight";
/** What Fieldset shares with the fields inside it. Input, Checkbox, Switch and RadioGroup read this to prefix the legend into their own `accessibilityLabel` ("Shipping address, Street") and to fold in the group's `disabled`. */
interface FieldsetContextValue {
  legend: string;
  disabled: boolean;
}
/** `null` outside of a Fieldset so every field works standalone. */
export declare const FieldsetContext: React.Context<FieldsetContextValue | null>;
export declare function useFieldsetContext(): FieldsetContextValue | null;
interface FieldsetProps {
  /** The group's name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible. Also the group's `accessibilityLabel`. */
  legend: string;
  /** The fields, usually Inputs, Checkboxes or Switches. Laid out in a `Stack` with `gap`. */
  children: React.ReactNode;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Fieldset — how a form says "these belong together." A screen-reader user tabbing
 * into "Street" hears "Shipping address, Street" and knows where they are.
 *
 * When to use: Use a Fieldset whenever two or more fields share a name a user would
 * say aloud — an address, a card, a start and end date. Give it a `description` when
 * the group needs a rule, and put cross-field errors on the group rather than on one
 * field. Do not wrap a whole form in it (the Form's `label` names the form), use it
 * for a single field, or nest one inside a RadioGroup, which already is a fieldset.
 *
 * Renders a `View` that is NOT `accessible` (so children stay individually
 * reachable) with `role="group"` (RN ≥ 0.74), `accessibilityLabel` (the legend,
 * `copy.requiredIndicator` appended when every direct field is `required`) and
 * `accessibilityHint={description}`. The legend is plain `Text` — not a header
 * trait, which would put it in the headings rotor. The fields render in a `Stack`
 * with `gap`; a `FieldsetContext` carries the legend and `disabled` for Input,
 * Checkbox, Switch and RadioGroup to read. Until those components read it, `disabled`
 * is also applied directly to every direct child field as a fallback so it still
 * takes effect today. The group error is announced as in Input. `disabled` dims the
 * whole group with `opacity.disabled`.
 */
export declare function Fieldset({ legend, children, description, error, disabled, gap, overrides }: FieldsetProps): React.JSX.Element;
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "background" | "border" | "borderWidth" | "radius";
interface BoxProps {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: React.ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /** Vertical padding, overriding `inset` on that axis. */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. */
  insetInline?: BoxInset | undefined;
  /** Background. `none` is transparent; `default` is the page background; `subtle` and `strong` step up. */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Box — a surface: padding, background, border, radius. It spaces nothing between
 * children (put a Stack inside for that) and never carries margin of its own.
 *
 * Renders a `View` with paddingVertical/paddingHorizontal, backgroundColor,
 * borderWidth/borderColor and borderRadius resolved from the token object.
 * `element` does not apply on React Native.
 */
export declare function Box({ children, inset, insetBlock, insetInline, surface, border, radius, overrides }: BoxProps): React.JSX.Element;
//#endregion
//#region src/Link.d.ts
type LinkTone = "default" | "inherit";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type LinkOverridableBinding = "transition";
interface LinkProps {
  /** The destination. A URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Marks a destination outside the product: appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon. `onPress` still fires, but navigation always goes through `Linking`. */
  external?: boolean | undefined;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Overrides the computed accessible name (`label`, plus `copy.externalSuffix` when
   * `external`). Set by a wrapping parent such as Tooltip that needs to fold its own
   * content into this link's name.
   */
  accessibilityLabel?: string | undefined;
  /** Forwarded to the native element untouched — set by a wrapping parent such as Tooltip. */
  accessibilityHint?: string | undefined;
  /** Forwarded to the native element untouched — lets a wrapping parent such as Tooltip attach hover/focus behavior. */
  onFocus?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched — lets a wrapping parent such as Tooltip attach hover/focus behavior. */
  onBlur?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched (react-native-web only — no touch hover). */
  onHoverIn?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched (react-native-web only — no touch hover). */
  onHoverOut?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched — set by a wrapping parent such as Tooltip. */
  onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
  /**
   * Fired when the link is activated, with `href`. On native the consumer's handler
   * is the navigation; when no handler is given the system opens the URL with `Linking`.
   * For `external` links `onPress` fires first but `Linking` always performs the
   * navigation, since a consumer-side router cannot leave the app.
   */
  onPress?: ((href: string) => void) | undefined;
}
/**
 * Link — takes people somewhere. Buttons do things; links navigate.
 *
 * When to use: Use a Link for any navigation: to another screen, to an external
 * site, or inline inside body text. Use `external` whenever the destination leaves
 * the product, so people are warned before they lose their place. Do not use a Link
 * to trigger an action — that is a `ghost` Button.
 *
 * Renders `Text` with `accessibilityRole="link"` so it flows inline inside a parent
 * `Text`; standalone it is its own line. `accessibilityLabel` defaults to the label
 * plus `copy.externalSuffix` when `external`, or the `accessibilityLabel` prop when
 * a wrapping parent (Tooltip) sets one. `onPress(href)` fires first when provided;
 * for a non-`external` link that is the whole navigation, otherwise `Linking.openURL(href)`
 * performs it. `external` always navigates through `Linking`, since a consumer-side
 * router cannot leave the app — `onPress` still fires as a notification. `accessibilityHint`,
 * `onFocus`, `onBlur`, `onHoverIn`, `onHoverOut` and `onLongPress` are forwarded to the
 * native element untouched, so a wrapping Tooltip can attach to this Link the same way
 * it attaches to Button and Input. Standalone, the Link sets the body typography via
 * Text's helpers since there is no cascade; nested in a system `Text` (detected through
 * `TextStyleContext`) it inherits.
 *
 * There is no hover or visited state on native, so `colorHover` styles the pressed
 * state (`colorVisited` unused) and the color crossfades over `transition` (eased
 * with `motion.easing.standard`, skipped under reduced motion) the same way Button
 * animates its background. RN cannot set underline offset or thickness, and nested
 * `Text` ignores margins, so `underlineThickness`, `underlineOffset` and
 * `externalIconGap` have no effect on this platform and are excluded from
 * `LinkOverridableBinding`; a literal space separates the label from the external
 * glyph instead. `Text` has no focus events, so the focus ring (`focusRing*` tokens)
 * cannot be drawn by hand: hardware-keyboard focus relies on the platform's own
 * indicator, and react-native-web renders a real anchor with the browser's focus
 * outline. The external glyph is the shared `Icon` (`name="external"`, `inline`),
 * matching Icon's own documented use for this mark; because Icon has no
 * `currentColor` fallback for animated color, its color swaps instantly with the
 * pressed state rather than crossfading. The link is never disabled: a destination
 * that is not available is rendered as Text.
 */
export declare function Link({ href, label, external, tone, overrides, accessibilityLabel, accessibilityHint, onFocus, onBlur, onHoverIn, onHoverOut, onLongPress, onPress }: LinkProps): React.JSX.Element;
//#endregion
//#region src/Checkbox.d.ts
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "indicatorStroke" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface CheckboxProps {
  /** Visible label. Tapping it toggles the control. Also the `accessibilityLabel`. */
  label: string;
  /** Visually hide the label (it remains the accessible name via `accessibilityLabel`): a selection column in a Table, where the row name is the label. */
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select. */
  value?: string | undefined;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only; the submitted value still follows `checked`. */
  indeterminate?: boolean | undefined;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Persistent helper text below the label. Also the `accessibilityHint`. */
  description?: string | undefined;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: ((checked: boolean) => void) | undefined;
}
/**
 * Checkbox — a single yes/no choice that the user makes and then submits, as
 * opposed to a Switch, which takes effect the moment it is flipped.
 *
 * When to use: Use a Checkbox for one independent option ("Remember me"), for terms
 * and consent (`required`), or several with the same `name` when the user may pick
 * any number of items. Use `indeterminate` on a "select all" parent when only some
 * of its children are checked. Do not use it for a setting that applies immediately
 * (Switch) or to pick exactly one option (RadioGroup).
 *
 * There is no checkbox in core React Native. Renders a `Pressable` with
 * `accessibilityRole="checkbox"`, `accessibilityLabel`, `accessibilityHint` and
 * `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`,
 * containing a drawn control (the `check`/`dash` `Icon`, since native has no
 * `currentColor`) and a `Text` label; the whole row is the hit area and never drops
 * below the comfortable target. The fill, border and indicator cross-fade between
 * unchecked and checked/indeterminate over `transition` with `motion.easing.standard`
 * (skipped under reduced motion); the pressed state shows the selected fill at
 * `pressedOverlay` instantly. Inside a Form the control registers by `name` and
 * contributes `value` when checked, nothing when not; validation precedence is
 * `error`, then `required` (`copy.required`), then `invalid` (`copy.invalid`), same
 * as Input. Inside a Form, `validate: blur` means "on change" — there is no useful
 * blur moment. Errors are announced as in Input.
 */
export declare function Checkbox({ label, hideLabel, name, value, checked, defaultChecked, indeterminate, disabled, required, invalid, description, error, overrides, onChange }: CheckboxProps): React.JSX.Element;
//#endregion
//#region src/Switch.d.ts
type SwitchLabelPosition = "start" | "end";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`
 * and `transition` are OS-controlled by the native `Switch` on React Native and are
 * excluded here since an override on them would be a silent no-op.
 */
type SwitchOverridableBinding = "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity";
interface SwitchProps {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /** Optional field name. When inside a Form the checked state is collected as a boolean; most switches are not in forms. */
  name?: string | undefined;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Cannot be toggled. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Persistent helper text below the label explaining the effect. Also the `accessibilityHint`. */
  description?: string | undefined;
  /** Where the label sits relative to the track. `start` (label, then switch at the row end) is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the state changes, with the new boolean (`events.onChange` → `onValueChange` on React Native, mirroring the native Switch). The change is already in effect; there is nothing to submit. */
  onValueChange?: ((checked: boolean) => void) | undefined;
}
/**
 * Switch — a light switch: flip it and the thing happens. That immediacy separates
 * it from a Checkbox, which records a choice to be submitted later.
 *
 * When to use: Use a Switch for a binary setting that applies as soon as it changes
 * and can be undone by flipping it back: notifications, dark mode, "show archived".
 * Use it in settings lists with `labelPosition: start` so the switches sit at the
 * row end. If a form of switches must have a Save button, they are checkboxes.
 *
 * Uses the native `Switch` for platform-native feel, with `accessibilityRole="switch"`,
 * `accessibilityLabel`, `accessibilityHint={description}`,
 * `accessibilityState={{ checked, disabled }}`, `trackColor={{ false: trackOff, true:
 * trackOn }}`, `thumbColor` and `ios_backgroundColor`. The row is a `Pressable` with
 * `accessible={false}` that toggles the value so the label is part of the target
 * while the Switch stays the single focusable element. Track and thumb sizes are the
 * OS values: the size tokens are documented but not applied, the OS animates the
 * thumb (and honours reduced motion) itself, and it draws its own focus indicator
 * because the native Switch has no focus events. With `name` inside a Form the switch
 * registers and contributes a boolean; it has no error state by design.
 */
export declare function Switch({ label, name, checked, defaultChecked, disabled, description, labelPosition, overrides, onValueChange }: SwitchProps): React.JSX.Element;
//#endregion
//#region src/RadioGroup.d.ts
type RadioGroupOrientation = "vertical" | "horizontal";
/** One option. `value` is a short identifier (letters, digits, dashes). */
type RadioGroupOption = {
  value: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type RadioGroupOverridableBinding = "controlBorderWidth" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface RadioGroupProps {
  /** The group's legend — the question the options answer. Always visible. Also the group's `accessibilityLabel`. */
  label: string;
  /** Field name used by the enclosing Form. */
  name: string;
  /** The options in display order. Two to about seven; more than that is a Select (planned). */
  options: RadioGroupOption[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  value?: string | undefined;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  defaultValue?: string | undefined;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  orientation?: RadioGroupOrientation | undefined;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  required?: boolean | undefined;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Disables every option. Individual options use `options[].disabled`. */
  disabled?: boolean | undefined;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string | undefined;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new option value. */
  onChange?: ((value: string) => void) | undefined;
}
/**
 * RadioGroup — asks one question and takes one answer. Every option is visible at
 * once, so the user can compare before choosing.
 *
 * When to use: Use a RadioGroup when the user must pick exactly one of two to about
 * seven options and seeing them all helps the decision — plan tiers, shipping
 * methods. Give options a `description` when the label alone does not tell them
 * apart. Do not use it for a yes/no (Checkbox or Switch) or for more than about
 * seven options (Select, planned). Once a radio is chosen, one is always chosen.
 *
 * Renders a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel={label}`
 * and `accessibilityHint={description}`, a `Text` legend, and one `Pressable` per
 * option with `accessibilityRole="radio"`, `accessibilityLabel` (label plus
 * description) and `accessibilityState={{ checked, disabled }}`. There is no roving
 * tabindex or arrow movement on native — every radio is its own focus stop, which is
 * the platform convention. Individually disabled options stay focus stops (native
 * `disabled` is reserved for `Switch`) but are guarded against press and dimmed;
 * a fully `disabled` group stays reachable but inert. The selected border and dot
 * cross-fade in over `transition` with `motion.easing.standard` (skipped under
 * reduced motion); the fill never changes, only the border and dot. Inside a Form
 * the group registers by `name` and contributes the selected value (no key when
 * nothing is selected); validation precedence is `error`, then `required`
 * (`copy.required`), then `invalid` (`copy.invalid`), same as Input, and focus moves
 * to the first enabled radio on a failed submit. `validate: blur` runs on change,
 * since a group-level blur does not exist on native. The group error is announced
 * as in Input.
 */
export declare function RadioGroup({ label, name, options, value, defaultValue, orientation, required, invalid, disabled, description, error, overrides, onChange }: RadioGroupProps): React.JSX.Element;
//#endregion
//#region src/Disclosure.d.ts
/** Heading level for the trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
type DisclosureHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/**
 * Why the state changed. `keyboard` never fires natively — `Pressable` has no way to
 * distinguish a hardware Enter/Space activation from a touch (the same limit `Accordion`
 * documents) — so a trigger press always reports `pointer`; `controlled` is a consumer-driven
 * `open` prop change.
 */
type DisclosureToggleReason = "pointer" | "keyboard" | "controlled";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
interface DisclosureProps {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden). */
  children: React.ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean | undefined;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean | undefined;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields, so the Form still collects them while the disclosure is closed. */
  keepMounted?: boolean | undefined;
  /**
   * When set, the summary is marked as a heading so the disclosure appears in the
   * screen reader's heading list. Native has no heading levels, so the value only
   * documents the outline.
   */
  headingLevel?: DisclosureHeadingLevel | undefined;
  /** Fired after the state changes, with the new boolean `open` and a reason. */
  onToggle?: ((open: boolean, reason: DisclosureToggleReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Disclosure — a button that reveals content beneath it. Deliberately plain: no
 * border, no card, no animation of the panel.
 *
 * When to use: Use a Disclosure to hide secondary content that some users need and
 * most do not: optional settings, long explanations, a list of details behind a
 * summary count. Stack several to make an accordion — each is independent. Do not
 * hide content most users need, and do not use it as a fake tab set.
 *
 * Renders a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={summary}`
 * and `accessibilityState={{ expanded: open, disabled }}`, containing the chevron
 * and a `Text` (marked `accessibilityRole="header"` when `headingLevel` is set);
 * the children render in a `View` below only while open, or with `display: 'none'`
 * while closed when `keepMounted` is set. Screen readers read expanded/collapsed
 * from the state; there is no `aria-controls` equivalent, and moving focus back to
 * the trigger on close is not possible on native (no notion of focus-within). The
 * chevron mirrors to `chevron-left` under `I18nManager.isRTL` and rotates toward
 * `chevron-down` with `Animated` over `transition`, or snaps when the OS reduce
 * motion setting is on. `onToggle` reports a reason (`pointer` on every trigger
 * press — see `DisclosureToggleReason` — or `controlled` for an external `open`
 * change). The trigger meets the minimum target and never drops its disabled state
 * from the tree.
 */
export declare function Disclosure({ summary, children, open, defaultOpen, disabled, keepMounted, headingLevel, onToggle, overrides }: DisclosureProps): React.JSX.Element;
//#endregion
//#region src/Alert.d.ts
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertLive = "status" | "alert" | "off";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type AlertOverridableBinding = "border" | "borderWidth" | "radius" | "padding" | "gap" | "partGap" | "iconSize" | "headingSize" | "headingWeight" | "fontFamily" | "fontSize" | "lineHeight" | "dismissMargin";
interface AlertProps {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  tone?: AlertTone | undefined;
  /** A short bold first line for the message. Optional for one-line messages. Named `heading`, not `title`, because `title` is a native attribute on every platform element. */
  heading?: string | undefined;
  /** The message body. Text and Links; no headings or form controls. */
  children: React.ReactNode;
  /** How the alert is announced when it appears. `status` is polite, `alert` interrupts (only for errors that block the user), `off` for alerts already present when the view loads. Never use `alert` for success or info. */
  live?: AlertLive | undefined;
  /** Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert. */
  dismissible?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: (() => void) | undefined;
}
/**
 * Alert — the system speaking to the user inside the page: "this saved", "this
 * failed", "this is about to expire". It stays until dealt with or dismissed.
 *
 * When to use: Use an Alert for a message that relates to the current view and
 * should stay visible: a failed save above the form, an expiring trial, a success
 * confirmation after submit. Choose `tone` by what the user should do: `info` to
 * know, `success` to relax, `warning` to be careful, `danger` to fix something. Do
 * not use it for field-level validation (the controls render their own errors) or
 * for transient confirmations (Toast, planned).
 *
 * Renders a `View` with `accessibilityRole="alert"` when `live` is `alert`,
 * `accessibilityLiveRegion` `assertive`/`polite` by `live` (neither when `off`),
 * and `accessibilityLabel` = heading + body (when the body is a string; otherwise
 * the heading alone) so the whole message is one announcement. iOS ignores live
 * regions, so with `live !== 'off'` the heading and body are passed to
 * `AccessibilityInfo.announceForAccessibility` on mount and whenever they change.
 * Colors come from the `color.status.{tone}.*` tokens; the leading glyph is the
 * system `Icon` (`info`/`success`/`warning`/`danger`, decorative). The dismiss
 * button is the system `Button` (`ghost`, `sm`, `iconOnly`, labelled
 * `copy.dismissLabel`, with `Icon name="close"` as `leadingIcon`), pulled into the
 * corner by `dismissMargin`; it fires `onDismiss` only and the consumer removes the
 * alert. Moving focus to the next element before removal is not possible on native.
 */
export declare function Alert({ tone, heading, children, live, dismissible, overrides, onDismiss }: AlertProps): React.JSX.Element;
//#endregion
//#region src/Landmark.d.ts
type LandmarkRole = "banner" | "navigation" | "main" | "complementary" | "contentinfo" | "region" | "search" | "form";
interface LandmarkProps {
  /** Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that deserves a jump point), `search`, `form`. */
  role: LandmarkRole;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Not shown visually. */
  label?: string | undefined;
  /** The region's content. */
  children: React.ReactNode;
}
/**
 * Landmark — the page's table of contents for assistive technology. Every page
 * gets the same, correct set of regions without anyone remembering which element
 * implies which role.
 *
 * When to use: Wrap the page's major regions: one `banner`, exactly one `main`,
 * `navigation` for each navigation block (labelled when there is more than one),
 * `complementary` for sidebars, `contentinfo` for the footer, `search` around the
 * site search, and `region` for any other section a user might want to jump to. Do
 * not wrap everything, and do not use it to style a region — it has no visual
 * bindings by design.
 *
 * Renders a `View` with the `role` prop, which react-native-web turns into the
 * semantic element (`nav`, `main`, …) and iOS/Android map to the nearest
 * accessibility role or ignore. `search` is the one role missing from RN's `role`
 * union, so it is passed as the legacy `accessibilityRole="search"`, which
 * react-native-web maps to the same ARIA landmark. `label` is applied as `accessibilityLabel` only for
 * `navigation`, `region` and `form`, so the group has a name for TalkBack and
 * VoiceOver without every View announcing a role. The container is not
 * `accessible`, so its children stay individually reachable. There is no
 * jump-to-landmark on native — the value is web parity and one structure for the
 * same screen code. In development it warns when `region` or `form` has no `label`.
 */
export declare function Landmark({ role, label, children }: LandmarkProps): React.JSX.Element;
//#endregion
//#region src/Breadcrumb.d.ts
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
interface BreadcrumbProps {
  /** The trail from root to current page, in order. Every item but the last needs an `href`; an ancestor without one renders as plain text (never an empty link). The last is the current page and its `href` is ignored. */
  items: {
    label: string;
    href?: string | undefined;
  }[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis is a button that reveals the rest. */
  collapse?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a non-current item is activated, as `(item, index)`. On native the handler is the navigation; without one the Link falls back to `Linking.openURL`. */
  onNavigate?: ((item: {
    label: string;
    href?: string | undefined;
  }, index: number) => void) | undefined;
}
/** One item of the trail — the element type of the schema's `items` shape. */
type BreadcrumbItem = BreadcrumbProps["items"][number];
/**
 * Breadcrumb — answers "where am I?" and "how do I go up a level?" in one line. A
 * secondary navigation that shows the hierarchy, not the user's history.
 *
 * When to use: Use a Breadcrumb on pages three or more levels deep — documentation,
 * catalogues, settings sub-pages — above the page title, at the top of `main`. Do
 * not use it on top-level pages, to show history, or as a wizard step indicator.
 * Breadcrumbs are rare on native, where the navigation stack does this job; they are
 * provided mainly for tablet and react-native-web layouts.
 *
 * Renders a wrapping row `View` with `role="navigation"` (semantic on react-native-web,
 * ignored on native) and `accessibilityLabel={label}`. Ancestors are the system
 * `Link` nested in a `Text` at `fontSize` so they inherit it, with `onPress` calling
 * `onNavigate(item, index)`; an ancestor without `href` is plain text. Each item
 * sits in a `View` with `minHeight: minTarget`. The current page is `Text` in
 * `currentColor` with `accessibilityState={{ selected: true }}`; separators are
 * decorative `Text`. With `collapse` and more than four items the ellipsis is the
 * system `Button` (`ghost`, `sm`, `iconOnly`, labelled `copy.expandLabel`, with an
 * ellipsis glyph as `leadingIcon`); activating it reveals the hidden items one-way
 * and moves accessibility focus to the first revealed item (hardware-keyboard focus
 * cannot be moved to a Text link).
 */
export declare function Breadcrumb({ items, label, collapse, overrides, onNavigate }: BreadcrumbProps): React.JSX.Element;
//#endregion
//#region src/Meter.d.ts
type MeterTone = "info" | "success" | "warning" | "danger";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type MeterOverridableBinding = "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition";
interface MeterProps {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB"). Omit to show and announce the percentage. */
  valueText?: string | undefined;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns. */
  tone?: MeterTone | undefined;
  /** Hides the visible value text. The accessible value is always exposed. */
  hideValue?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Meter — shows how much of something there is against a known scale. Its shape is
 * a bar because people read fullness at a glance; its meaning is the number.
 *
 * When to use: Use a Meter for a measurement with a fixed range: storage or quota
 * used, battery, password strength, a score out of ten. Let the consumer decide the
 * tone from thresholds it understands; the meter just paints. Provide `valueText`
 * whenever the raw percentage is not what a person would say. Do not use it for
 * task progress (ProgressBar, planned).
 *
 * Renders an `accessible` `View` with `role="meter"` (RN ≥ 0.73; react-native-web
 * renders the ARIA role, native maps it to the nearest trait), `accessibilityLabel`
 * and `accessibilityValue={{ min, max, now: clamped, text: valueText }}` — `text` only
 * when `valueText` is given, so the platform otherwise announces the percentage.
 * Inside: a label row of two `Text` elements and a track `View` with `overflow:
 * 'hidden'` holding the fill. The track is measured with `onLayout` and the fill's
 * pixel width animates with `Animated` over `transition` (`useNativeDriver: false`),
 * snapping when reduce motion is on. Nothing is interactive. A non-finite `value`
 * counts as `min`; if `max <= min` the track renders empty, `now` is `min`, and a
 * warning is logged in development.
 */
export declare function Meter({ value, min, max, label, valueText, tone, hideValue, overrides }: MeterProps): React.JSX.Element;
//#endregion
//#region src/paths.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
//#endregion
//#region src/Icon.d.ts
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type IconOverridableBinding = "size" | "color" | "strokeWidth";
interface IconProps {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs
   * a shape; `info`, `success`, `warning` and `danger` are the four status shapes so
   * tone is never carried by color alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /** Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring `size`. For icons inside Text, Link and Button labels. */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an
   * image with this name; when omitted or empty, it is decorative and hidden from
   * assistive technology. Most icons sit next to text and should have no label.
   */
  label?: string | undefined;
  /**
   * React Native only: the color the parent passes, because there is no
   * `currentColor`. Falls back to `color.foreground`.
   */
  color?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Icon — a single glyph that takes its size from the type scale and, on this
 * platform, an explicit color from its parent.
 *
 * When to use: Use an Icon wherever a component's anatomy names one: the leading
 * icon in a Button, the chevron in a Disclosure, the status shape in an Alert, the
 * check in a Checkbox, the external mark on a Link. Use `inline` when the icon is
 * inside running text. Give it a `label` only when the icon is the whole message.
 * Never use an Icon as a button; wrap it in a Button with `iconOnly` and a `label`.
 *
 * Renders `Svg`/`Path` from `react-native-svg` (the package's one sanctioned
 * dependency) against the same 16×16 `paths` table as web/Lit, so the glyphs stay
 * visually identical across platforms. Line glyphs stroke at `border.width.focus`
 * with `vectorEffect="non-scaling-stroke"` so they stay legible at `xs`; the four
 * status shapes and `ellipsis` fill instead, with no stroke.
 *
 * There is no `currentColor` on native, so `color` is an explicit prop that falls
 * back to `color.foreground` — except when `inline` and nested inside a system
 * `Text`, where it falls back to that Text's own resolved size and color via
 * `TextStyleContext` instead, so the glyph matches its surrounding copy exactly
 * (`size`, `md` default, and `color.foreground` still apply standalone).
 *
 * `size` is ignored (a no-op) while `inline` is set, since size then comes from the
 * text context instead. `strokeWidth` is a no-op on the four filled glyphs, which
 * have no stroke. Decorative (no `label`): `accessibilityElementsHidden` and
 * `importantForAccessibility="no"`. Labelled: `accessibilityRole="image"` and
 * `accessibilityLabel`. No interaction, no focus, no animation.
 */
export declare function Icon({ name, size, inline, label, color, overrides }: IconProps): React.JSX.Element;
//#endregion
//#region src/Card.d.ts
/** Heading level for `heading`. The schema declares the values as strings; numbers are accepted for ergonomics. */
type CardHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
type CardInset = "sm" | "md" | "lg";
type CardSurface = "default" | "subtle";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "hoverBackground" | "transition";
interface CardProps {
  /** The body. Usually a Stack of Text and controls. */
  children: React.ReactNode;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content. */
  heading?: string | undefined;
  /**
   * Heading level for `heading`, so cards fit the page outline. Cards in a list
   * share a level. Native has no heading levels; this controls only the default
   * typography, and the header trait is set regardless.
   */
  headingLevel?: CardHeadingLevel | undefined;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two. */
  headerActions?: React.ReactNode;
  /** The action row. Buttons in a horizontal row, primary first, following Form's action-order rule. */
  footer?: React.ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one interactive
   * child (a Link or Button) whose action the card extends to its full area; the
   * card itself is not focusable — its single child is the target.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes `tabIndex={-1}` so a container (Feed) can move focus to it
   * by calling `.focus()` on the forwarded ref, and draws its own focus ring when
   * focused that way. Not a tab stop; not for making cards clickable (`interactive`).
   * Has no effect while `interactive` is set — the child link/button is already the
   * sole focus target.
   */
  focusable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Card — frames one thing so it can sit among others: a search result, a plan to
 * choose, a setting group, a dashboard panel.
 *
 * When to use: Use Cards for collections of like items where each needs its own
 * boundary, and for a single panel that groups a heading, content and actions. Give
 * the card a `heading` when it is a unit in a list — it is what a screen reader jumps
 * to — and set `headingLevel` to fit the page. Use `interactive` when the entire card
 * leads somewhere and it contains exactly one Link or Button.
 *
 * Renders a `View` (a `Pressable` when `interactive`) with padding, background,
 * border and radius from tokens. The header and footer are horizontal rows built
 * directly from the `layout.gap.*` tokens rather than the `Stack` component, whose
 * `gap` prop only accepts the `space.*` scale. `interactive` finds the single
 * `Button`/`Link` inside `children`, hides it from touch and assistive technology,
 * and moves its role, accessible name and activation onto the surrounding
 * `Pressable`, so the card adds no separate focus stop. The focus ring's width is
 * always reserved on interactive cards (`border.width.focus`) so it never shifts the
 * layout when focus toggles; its color is the static border color
 * (`overrides.border` / `color.border`) until focused, then `color.border.focus`.
 * There is no pointer hover on native, so `hoverBackground` styles the pressed state
 * instead — the same substitution `Button` and `Link` already make — and `transition`
 * has no visible effect since there is no continuous hover to animate between.
 *
 * `focusable` forwards the root's ref (a plain `View`, or the `Pressable` when
 * `interactive`) so a container can call `.focus()`/`.blur()` on it (RN's
 * `NativeMethods`) and sets `tabIndex={-1}` — a real DOM `tabIndex=-1` under
 * react-native-web (scriptable, no tab stop), though on native Android RN's own
 * `tabIndex` typing treats `-1` as simply not focusable, so scripted focus is a
 * react-native-web-only guarantee here. The ring it draws reads `onFocus`/`onBlur`,
 * which RN core's `View` type omits (see `FocusableViewProps`); no component in this
 * package currently calls the ref (Feed's native list has no analog of the web
 * doc's PageUp/PageDown scripted paging), so this wires up the mechanism for a
 * future caller without one yet.
 */
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<ViewInstance>>;
//#endregion
//#region src/Container.d.ts
type ContainerWidth = "prose" | "content" | "page" | "full";
type ContainerGutter = "narrow" | "default" | "wide" | "none";
type ContainerAlign = "center" | "start";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ContainerOverridableBinding = "maxWidth" | "paddingInline";
interface ContainerProps {
  /** The page or region content, usually a Stack with `gap: section` between regions. */
  children: React.ReactNode;
  /** `prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed layouts with wide grids, `full` for no cap (gutters only). */
  width?: ContainerWidth | undefined;
  /** Horizontal padding at the viewport edge. `default` is responsive: narrow below the content width and wide above the page width. `none` for a nested container inside a padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. */
  align?: ContainerAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Container — decides a screen's horizontal rhythm once: a gutter at the viewport
 * edge and a cap on how wide content can get.
 *
 * Renders a `View` with maxWidth, alignSelf and paddingHorizontal resolved from the
 * token object. `element` does not apply on React Native.
 */
export declare function Container({ children, width, gutter, align, overrides }: ContainerProps): React.JSX.Element;
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
interface DividerProps {
  /** `vertical` sits between inline siblings (toolbar groups) and stretches to the row height. */
  orientation?: DividerOrientation | undefined;
  /** Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the line into a labelled separator. */
  label?: string | undefined;
  /** Expose as a separator to assistive technology. Leave `false` for purely visual lines between list rows. */
  semantic?: boolean | undefined;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Divider — a line, decorative by default. A `label` centers text between two line
 * segments and makes the line meaningful rather than furniture.
 *
 * Renders a `View` sized to `border.width.thin` along the cross axis and colored
 * `color.border`; `spacing` adds symmetric margin for dividers standing outside a
 * Stack. There is no `separator` accessibility role on React Native, so a divider
 * without a `label` stays hidden from assistive technology (`accessibilityElementsHidden`
 * + `importantForAccessibility="no"`) regardless of `semantic` — announcing
 * "separator" has no native idiom. A `label` is read because it renders as `Text`,
 * which needs no special role; `semantic` itself has no further observable effect on
 * this platform.
 */
export declare function Divider({ orientation, label, semantic, spacing, overrides }: DividerProps): React.JSX.Element;
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
type FocusScopeEscapeDirection = "forward" | "backward";
interface FocusScopeProps {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: React.ReactNode;
  /** Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside is pulled back in. `false` turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels. Native has no Tab order to confine; this only maps to `accessibilityViewIsModal`. */
  trapped?: boolean | undefined;
  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper (for reading-first dialogs), or nowhere. Native has no descendant walker, so `first`, `last` and `container` all focus the wrapper; only `none` differs. */
  autoFocus?: FocusScopeAutoFocus | undefined;
  /** On unmount, focus returns to the element that was focused when the scope mounted, if it can still be found. */
  restoreFocus?: boolean | undefined;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Required on
   * native when the opener is not a `TextInput` — RN exposes no generic "currently
   * focused element" — so every overlay passes its trigger ref.
   */
  returnFocusTo?: React.RefObject<ViewInstance | null> | undefined;
  /** Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is open, so the innermost active scope owns modal focus. */
  active?: boolean | undefined;
  /**
   * Fired when trapped focus would have left the scope just before it wraps, with
   * the direction. Diagnostic; components do not need it. Native has no Tab order
   * to confine, so this never fires on this platform.
   */
  onEscapeAttempt?: ((direction: FocusScopeEscapeDirection) => void) | undefined;
}
/**
 * FocusScope — the smallest possible answer to the hardest accessibility bug: focus
 * that escapes a modal, or never comes back from one. It has no appearance and no
 * opinion about what is inside it.
 *
 * When to use: Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet
 * and ActionSheet declare it in their composition. Render it yourself only when
 * building a new modal surface the system does not have yet, with `trapped` on — or
 * with `trapped: false` for a non-modal panel that should still move focus in and
 * restore it on close. Do not trap focus in anything that is not modal, and do not
 * nest it inside a surface that already does the same work.
 *
 * Renders a `View` with `accessibilityViewIsModal={trapped && active}` so VoiceOver
 * and TalkBack ignore siblings while the scope is the active one. There is no Tab
 * order to confine on native: `autoFocus` calls `AccessibilityInfo.setAccessibilityFocus`
 * on the wrapper after mount (RN has no way to walk arbitrary children for the
 * "first" or "last" focusable descendant, so those and `container` all resolve to
 * the wrapper; only `none` skips it). `restoreFocus` refocuses `returnFocusTo` on
 * unmount when given; otherwise it falls back to whatever `TextInput` was focused
 * when the scope mounted — the only "currently focused element" RN exposes without
 * an explicit ref — so an opener that is neither a text input nor passed via
 * `returnFocusTo` cannot be restored, a platform limit. `onEscapeAttempt` never
 * fires on native.
 */
export declare function FocusScope({ children, trapped, autoFocus, restoreFocus, returnFocusTo, active, onEscapeAttempt }: FocusScopeProps): React.JSX.Element;
//#endregion
//#region src/Dialog.d.ts
type DialogSize = "sm" | "md" | "lg";
type DialogInitialFocus = "first" | "title" | "close";
/** Why `onClose` fired. `action` is never emitted by Dialog itself — it exists for a consumer whose footer action also wants to report a close through the same callback. */
type DialogCloseReason = "escape" | "close-button" | "scrim" | "action";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "layer" | "enter" | "exit";
interface DialogProps {
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: React.ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: React.ReactNode;
  /** Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim click all request close. Set `false` for a dialog that must be answered (then provide the answers in the footer); Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Dialog — interrupts for one task and gives the screen back when it's done or
 * abandoned. The scrim, trapped focus, inert background, Escape and focus-restore
 * exist to make that interruption safe and reversible.
 *
 * When to use: Use for a short task that must complete before the user continues:
 * rename, create-with-a-few-fields, choose from options with consequences. Keep it
 * to one screen of content. Do not use it for a message needing no decision (Alert),
 * a destructive confirmation (AlertDialog), or content that benefits from the page
 * staying visible (Popover/Disclosure).
 *
 * Renders a native `Modal` (`transparent`, `animationType="none"` — the component
 * animates itself) containing a full-screen scrim `Pressable` and a centered surface.
 * The surface composes `FocusScope` (`trapped`, `restoreFocus`) for the trap and
 * focus-restore-on-close; on native there is no descendant walker, so `initialFocus`
 * is implemented by hand with `AccessibilityInfo.setAccessibilityFocus` on the title,
 * the close button, or the body, once the enter animation finishes (or immediately
 * under reduced motion). `onRequestClose` (the Android back gesture) always reports
 * `onClose('escape')`, even when `dismissible` is `false` — the consumer decides,
 * because a keyboard/switch-access user must always have a reported way out. The
 * accessible name comes from `accessibilityLabel={heading}` on the modal surface
 * regardless of `hideHeading`, so hiding the heading only removes its visible
 * `Heading`, never the announced name. The surface also carries the RN >= 0.74
 * `role="dialog"` prop alongside `accessibilityViewIsModal`, as Landmark and
 * Fieldset use `role` for their own semantics. The `size` widths and `enter`/`exit`
 * durations are the same tokens as web; `widthSm` is the only overridable width, per
 * the schema. Scroll-lock has no native equivalent — there is no page scroll for a
 * modal window to suppress — so it is not implemented; the acknowledged limit is
 * `initialFocus` targeting a wrapping `View` rather than the first real focusable
 * descendant, the same limit `FocusScope` documents for itself.
 */
export declare function Dialog({ open, heading, description, children, footer, hideHeading, size, dismissible, initialFocus, onClose, onOpened, overrides }: DialogProps): React.JSX.Element;
//#endregion
//#region src/AlertDialog.d.ts
type AlertDialogTone = "danger" | "warning" | "info";
/** Why `onCancel` fired: the Cancel button or Escape/the Android back gesture. A scrim tap does neither — it is inert. */
type AlertDialogCancelReason = "cancel" | "escape";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "layer" | "enter" | "exit";
interface AlertDialogProps {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet. Cancel always works. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape/back. A scrim tap does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * AlertDialog — a Dialog with one job: get a considered yes or no before an action
 * that destroys data, spends money, or cannot be undone.
 *
 * When to use: Use before a destructive, costly or unrecoverable action, and only
 * when undo is not available — `tone: danger` for destruction, `warning` for
 * consequential-but-recoverable, `info` for a no-downside decision that still needs
 * a choice. Do not use it for reversible actions (offer undo instead), to show
 * information (Alert, Dialog), or as a general "are you sure" habit.
 *
 * Renders a native `Modal` (`transparent`, `animationType="none"`) with a plain
 * scrim `View` — unlike Dialog there is no scrim `Pressable`, so a stray tap cannot
 * dismiss a decision — and a centered surface composing `FocusScope` (`trapped`,
 * `restoreFocus`) for the trap and focus-restore. There is no close button: the only
 * ways out are Cancel and Confirm. `onRequestClose` (the Android back gesture)
 * always reports `onCancel('escape')`. Initial accessibility focus lands on the
 * title once the enter animation finishes (or immediately under reduced motion) so
 * the question is read first; Cancel precedes Confirm in the accessibility order so
 * a reflexive Enter cancels rather than confirms. The icon, its color and the
 * confirm button's variant come from the `tone` lookup table. Buttons are the
 * system `Button` (`secondary` for Cancel; `danger` or `primary` for Confirm by
 * tone) — never restyled. The surface also carries the RN >= 0.74
 * `role="alertdialog"` prop alongside `accessibilityViewIsModal`, matching Dialog's
 * `role="dialog"`.
 */
export declare function AlertDialog({ open, heading, description, tone, confirmLabel, cancelLabel, confirmDisabled, onConfirm, onCancel, overrides }: AlertDialogProps): React.JSX.Element;
//#endregion
//#region src/BottomSheet.d.ts
type BottomSheetHeight = "content" | "half" | "full";
/** Why `onClose` fired. `action` is never emitted by BottomSheet itself — it exists for a consumer whose footer action also wants to report a close through the same callback. */
type BottomSheetCloseReason = "escape" | "close-button" | "scrim" | "drag" | "action";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "inset" | "partGap" | "footerGap" | "maxWidth" | "layer" | "enter" | "exit";
interface BottomSheetProps {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean | undefined;
  /** Drag the handle (or the header) downward to dismiss, with a velocity threshold. Purely additive: the close button and Escape always exist. */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. */
  onDragDismiss?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps
 * the page visible behind a scrim, and goes away with a swipe, a tap outside, the
 * close button or Escape.
 *
 * When to use: Use on phones for a task or a set of choices that would otherwise be
 * a Dialog: filters, a short form, details of a selected item, a picker with many
 * options. `height: content` by default; `full` for a task that needs the whole
 * screen but should still feel dismissable; `half` for a browsable list where seeing
 * the page behind matters. Do not use it as a menu (ActionSheet/Menu), a persistent
 * panel (Landmark), or for content the user must read at length (a page). Do not
 * stack sheets or rely on the drag gesture as the only way to dismiss.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * scrim `Pressable` and an `Animated.View` surface anchored to the bottom, sliding up
 * on open (skipped under reduced motion). The surface composes `FocusScope`
 * (`trapped`, `restoreFocus`) for the trap and focus-restore-on-close, `Heading`
 * (level 2) for the heading, `Button` for the close control, `Box` for the scrollable
 * body and `Stack` for the footer row — never restyled directly. A `PanResponder` on
 * the header (handle plus heading row) tracks a downward drag; past 25% of the
 * measured surface height or a fast flick, it fires `onDragDismiss` then
 * `onClose('drag')` and continues the motion off-screen with `Animated.decay` at the
 * release velocity (instant, no decay, under reduced motion); otherwise it springs
 * back. The gesture is additive — the close button and Escape (mapped from the
 * Android back button via `onRequestClose`) always exist and are never gated by
 * `dragToDismiss`, only by `dismissible`. `height` sets the surface's fixed height as
 * a fraction of `useWindowDimensions()` for `half`/`full`, or lets it size to content
 * up to 90% of the viewport (`content`). Bottom padding for the footer uses
 * `SafeAreaView`, the only inset mechanism available without a new dependency. Above
 * `maxWidth`, the component renders `Dialog` directly (composition, not duplication)
 * with the shared bindings forwarded through `overrides`; `hideHeading` maps directly
 * to Dialog's own prop of the same name. Scroll-lock has no native equivalent — there
 * is no page scroll for a modal window to suppress — so it is not implemented, the
 * same acknowledged limit as Dialog.
 */
export declare function BottomSheet({ open, heading, hideHeading, children, footer, height, dismissible, dragToDismiss, onClose, onDragDismiss, overrides }: BottomSheetProps): React.JSX.Element;
//#endregion
//#region src/Menu.d.ts
type MenuTriggerVariant = Extract<ButtonVariant, "ghost" | "secondary" | "primary">;
type MenuTriggerIcon = "ellipsis" | "chevron-down" | "none";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
type MenuItemTone = "default" | "danger";
/** Why `onOpenChange` fired. `action` (an item was chosen) always fires before `onAction`. `controlled` is a consumer-driven `open` prop change. */
type MenuOpenChangeReason = "trigger" | "escape" | "outside" | "action" | "controlled";
/** A single actionable row. */
type MenuAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: MenuItemTone | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of items, rendered with a non-interactive heading row. */
type MenuGroup = {
  group: string;
  items: MenuItem[];
};
/** A divider between clusters of items. */
type MenuSeparator = {
  separator: true;
};
type MenuItem = MenuAction | MenuGroup | MenuSeparator;
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter";
interface MenuProps {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /** Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row. */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant | undefined;
  /** Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the accessible name), `chevron-down` for a labelled dropdown, `none`. */
  triggerIcon?: MenuTriggerIcon | undefined;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  iconOnly?: boolean | undefined;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  placement?: MenuPlacement | undefined;
  /** Controlled open state. Omit for an uncontrolled menu. */
  open?: boolean | undefined;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: ((id: string) => void) | undefined;
  /** Fired when the menu opens or closes, with the new state and why. */
  onOpenChange?: ((state: {
    open: boolean;
    reason: MenuOpenChangeReason;
  }) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Menu — hides a handful of actions behind one button so a toolbar or a row stays
 * quiet. The desktop counterpart of ActionSheet: anchored to the trigger, dismissed
 * by an outside tap or Escape, and driveable from the keyboard.
 *
 * When to use: Use a Menu for secondary actions that do not deserve their own
 * buttons — overflow ("More actions"), sort or view options, account menus. Group
 * related items with a `group` label past about six items; separate a danger action
 * with a `separator`. Do not use it for navigation between pages, to pick a value
 * that stays selected (RadioGroup, or Select when it exists), or for a single item —
 * make that a Button.
 *
 * Below `layout.maxWidth.prose` (phones), renders the trigger `Button` plus the
 * package's own `ActionSheet` with the items flattened to a plain action list —
 * groups become part of that list without their label row and separators are
 * dropped, since `ActionSheet` has no slot for either (an acknowledged gap; see
 * `toActionSheetActions`). `label` becomes `ActionSheet`'s `heading`, so it still
 * reads above the list and still names the accessible name. At or above that width
 * (tablets and react-native-web), renders a transparent `Modal` (`animationType="none"`,
 * self-animated) with a full-screen scrim `Pressable` and a popup `View` absolutely
 * positioned from the trigger's `measureInWindow()` rect for `placement`, flipping
 * either axis on overflow via `useWindowDimensions()`. The list scrolls in a
 * `ScrollView` capped at `maxHeight` (and the viewport minus `popupOffset` on each
 * side) so a long menu never grows past the screen. The popup is measured once with
 * itself (via `onLayout`) before it fades and rises into place, so the flip never
 * visibly jumps; under reduced motion it appears at its final position and opacity
 * immediately. Items are `Pressable`s with `accessibilityRole="menuitem"` and
 * `accessibilityState={{ disabled }}` — never the native `disabled` prop, which
 * would drop them from the focus order; a press guard makes disabled items inert
 * instead. Choosing an item, an outside tap, and `onRequestClose` (Escape on
 * react-native-web, the Android back gesture on native) all close the menu and move
 * accessibility focus back to the trigger. `FocusScope` supplies
 * `accessibilityViewIsModal`; its own `restoreFocus` is skipped, the same convention
 * `Popover`, `Select` and `SidePanel` use for an anchored dropdown, and focus is
 * returned to the trigger by hand instead. The trigger `Button` carries
 * `expanded={isOpen}`, reflected to `accessibilityState.expanded`.
 * `onOpenChange` reports `{ open, reason }`; a controlled `open` prop that changes
 * without a matching internal reason (a consumer toggling it directly) reports
 * `reason: "controlled"`, the same self-echo convention `Disclosure` uses to avoid
 * double-firing a change the trigger itself already reported.
 *
 * Acknowledged native limits: arrow-key movement, Home/End, and typeahead are a web
 * keyboard model with no RN equivalent (no generic key-event API on `Pressable`);
 * each item is instead its own Tab stop, the same convention `RadioGroup` uses, and
 * `typeaheadReset` has no effect since there is no typeahead to reset. Opening with
 * ArrowUp to focus the last item cannot be distinguished from Enter/Space on
 * `Button`, so opening always focuses the first enabled item.
 */
export declare function Menu({ label, items, triggerVariant, triggerIcon, iconOnly, placement, open, onAction, onOpenChange, overrides }: MenuProps): React.JSX.Element;
//#endregion
//#region src/Tooltip.d.ts
type TooltipPlacement = "top" | "bottom" | "start" | "end";
type TooltipDelay = "default" | "none";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TooltipOverridableBinding = "radius" | "paddingBlock" | "paddingInline" | "offset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "shadow" | "layer" | "enter" | "exit";
interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it. */
  children: React.ReactNode;
  /** Preferred side; native has no viewport to flip against, so this is not adjusted automatically. */
  placement?: TooltipPlacement | undefined;
  /** `true`: supplementary, becomes the child's `accessibilityHint`. `false`: it IS the child's name and becomes `accessibilityLabel` instead. */
  describes?: boolean | undefined;
  /** Hover delay (react-native-web only — there is no hover on touch): `default` waits `motion.duration.base` × 3; `none` shows instantly, as does any hover while a sibling tooltip is still "warm". */
  delay?: TooltipDelay | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Tooltip — the smallest overlay: a label that names an icon-only button or adds a
 * short clarification to a control, shown on hover or focus and gone the moment
 * attention moves on.
 *
 * When to use: Attach it to an icon-only Button (`describes={false}` so the tooltip
 * becomes the accessible name instead of a second announcement) or to a labelled
 * control that needs one more short phrase. Never put essential information, links
 * or controls in it — a touch user will never see it.
 *
 * There is no hover on touch, so native shows nothing by default: `content` is
 * cloned onto the single child as `accessibilityHint` (or `accessibilityLabel` when
 * `describes` is `false`), and a long-press reveals a transient inverted-surface
 * `View` above the child, as a sighted-user aid, for the duration of the press. On
 * react-native-web `content` — and the informational content is already covered by
 * that clone regardless of platform — hover and focus behave as on web: focus shows
 * it immediately, hover waits out `delay` (`motion.duration.base` × 3, or instantly
 * when `delay` is `none` or a sibling tooltip's `hide()` left the shared module-level
 * "warm" window still open), and Escape hides it without moving focus via a `window`
 * `keydown` listener (a real browser exists under react-native-web; native has no
 * hardware-keyboard Escape to bind to and the popup is never shown there to begin
 * with). The bubble itself carries `accessibilityElementsHidden` — it is decorative,
 * since the real accessible information is the hint/label on the trigger, per the
 * schema's own "never hover-only" rule.
 *
 * Acknowledged native limits: this package's own `Button`/`Link`/`Input` do not
 * forward unrecognized props, so the `accessibilityHint`/`accessibilityLabel` and
 * the hover/focus/long-press handlers cloned here have no effect when the child is
 * one of those three — only a child that forwards extra props onto a native
 * `Pressable`/`TextInput` (or a raw core-RN element) actually receives them. Making
 * this work for the package's own trigger components requires those components'
 * own schemas to grow a passthrough, which is out of scope here. `top`/`bottom`
 * placement is not flipped on overflow (no window-rect measurement for a
 * non-portaled view); `start`/`end` still resolve against writing direction.
 */
export declare function Tooltip({ content, children, placement, describes, delay, overrides }: TooltipProps): React.JSX.Element;
//#endregion
//#region src/Popover.d.ts
type PopoverPlacement = "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end" | "start" | "end";
type PopoverHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
type PopoverCloseReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "layer" | "enter" | "exit";
interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. */
  trigger: React.ReactNode;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling — the panel does not scroll on this platform. */
  children: React.ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel falls back to the trigger's own `label` when it has one. */
  heading?: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline. RN has no native heading levels — this only controls the `Heading`'s default typographic size. */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay within the window. */
  placement?: PopoverPlacement | undefined;
  /** `false` (default): outside taps and Escape close the panel, focus moves in but is not trapped. `true`: behaves as a small Dialog anchored to the trigger — focus trapped, outside taps do nothing. */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default. */
  showArrow?: boolean | undefined;
  /** Show the close button. Escape and, when not `modal`, an outside tap still close the popover regardless. */
  dismissible?: boolean | undefined;
  /** Fired when the popover opens or closes, with the new state and the reason. */
  onOpenChange?: ((open: boolean, reason: PopoverCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Popover — a small interactive panel anchored to the control that opens it: a date
 * picker under a field, a color swatch, a compact filter panel. It stays out of the
 * way of everything else, unlike Dialog, and can hold controls, unlike Tooltip.
 *
 * When to use: Use for a compact panel tied to a trigger, and `modal` only when the
 * panel holds a required step (a short form that must be submitted or cancelled). Do
 * not use it for a text-only hint (Tooltip), a list of actions (Menu), or content that
 * needs more than a small panel's worth of room (Dialog).
 *
 * Tablets and react-native-web (the only configurations this generator targets, per
 * the schema's own native notes — phones want a `BottomSheet`, which does not exist
 * in this package yet, an acknowledged gap): renders the trigger cloned with an
 * `onPress` toggle, and, while open, a transparent `Modal` (`animationType="none"`,
 * self-animated) containing a full-screen backdrop `Pressable` and a panel `View`
 * absolutely positioned from the trigger's `measureInWindow()` rect, flipping and
 * shifting via `useWindowDimensions()`. The panel composes `FocusScope` (`trapped`
 * only when `modal`), `Heading` for `heading`, `Box` for the body, and `Button` for
 * the close button. `modal` tints the backdrop with `color.overlay.scrim`; non-modal
 * leaves it transparent, though — a native platform limit — the `Modal` still
 * intercepts every touch behind it, so "the page stays interactive" (the web
 * behavior) cannot be reproduced here, only "tapping outside closes it." Escape (the
 * Android back gesture, or `Esc` on react-native-web) always closes and returns focus
 * to the trigger, regardless of `dismissible`. Focus lands on the body wrapper once
 * the enter animation finishes (or immediately under reduced motion) — the same
 * "first focusable descendant" approximation `Dialog`'s `initialFocus` documents,
 * since native has no descendant walker to find a real first control or to detect
 * that the body has none, so the schema's heading fallback is unreachable here.
 *
 * Acknowledged native limits: `Button` does not forward unrecognized props (the same
 * limit `Menu`'s doc records), so the `accessibilityState.expanded` cloned onto a
 * `Button` trigger has no effect when the trigger is this package's own `Button`; the
 * panel's accessible name falls back to the trigger's `label` prop when present, an
 * approximation of the web generator's "aria-labelledby the trigger" since RN cannot
 * read arbitrary rendered text — a trigger that is not a `Button`-shaped element with
 * a string `label` and no `heading` will render with no accessible name for the
 * panel, a dev-mode warning. Tab / Shift+Tab (`tab-out`) has no native key-event API
 * on `Pressable` and is not implemented; the modal Tab-wrap is inherited from
 * `FocusScope`'s own documented native limit (no Tab order to confine). The arrow is
 * centered on the panel's measured edge, not re-aligned to the trigger's center when
 * the panel has been shifted to stay on-screen.
 */
export declare function Popover({ trigger, children, heading, headingLevel, open, placement, modal, showArrow, dismissible, onOpenChange, overrides }: PopoverProps): React.JSX.Element;
//#endregion
//#region src/Toast.d.ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastDuration = "short" | "long" | "persistent";
/** Why the toast left the screen. */
type ToastDismissReason = "timeout" | "dismiss-button" | "action" | "replaced";
/**
 * The style bindings a caller may replace with a different token; see the
 * component's overrides contract. `stackGap`, `regionInset` and `layer` govern the
 * region a `ToastProvider` renders (there is one region, not one per toast) and are
 * no-ops when passed to a standalone `Toast`; every other key is in effect on the
 * toast itself.
 */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "stackGap" | "regionInset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter" | "exit";
interface ToastProps {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (both computed from `motion.duration.loop` so themes without motion
   * still get sensible times), `persistent` until dismissed. When `actionLabel` is set or `tone` is
   * `danger` the toast is persistent regardless of this prop (a dev warning notes the override).
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this prop. */
  dismissible?: boolean | undefined;
  /** Stable identity; a `ToastProvider` showing a toast with the same toastId replaces the previous one instead of stacking. Unused by a standalone `Toast`. */
  toastId?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the action button is activated. The toast then dismisses with reason `action`. */
  onAction?: (() => void) | undefined;
  /** Fired once the toast has finished leaving the screen, with the reason it left. */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}
/**
 * Toast — says "done" and gets out of the way. Confirms an action just taken,
 * offers one chance to undo it, and leaves without being asked.
 *
 * When to use: Use it to confirm a completed action the user did not have to watch
 * (sent, saved, deleted, copied), to offer Undo for a reversible action, or to
 * report a background result. Match `tone` to the outcome; use `duration="persistent"`
 * whenever there is an action, and for `danger`, so nobody misses the one they
 * needed. Never toast an error that needs fixing (use Alert) or anything requiring
 * more than one action.
 *
 * Renders a `View` carrying the message, the tone's icon (`neutral` has none),
 * an optional action `Button` and a dismiss `Button` — both rendered with `inverse`
 * so they read against `color.inverse.surface` without restyling `Button` itself.
 * `accessibilityLiveRegion` is `assertive` for `danger`, `polite` otherwise
 * (Android); `danger` also gets `accessibilityRole="alert"` since native has no
 * `status` role to map the schema's `a11y.role` onto directly. iOS ignores live
 * regions, so `AccessibilityInfo.announceForAccessibility(message)` fires once on
 * mount. The toast fades and rises in over `enter`, and fades out over `exit`
 * before calling `onDismiss` — both skipped (jumping straight to the resting value)
 * under reduced motion. A timer dismisses the toast after the effective duration
 * unless that duration is `persistent` — which it always is once `actionLabel` is
 * set or `tone` is `danger`, regardless of the `duration` prop (a `__DEV__` warning
 * flags the mismatch); touching the toast (`onTouchStart`/`onTouchEnd`) pauses and
 * resumes the timer, since native has no hover and no reliable way to observe focus
 * entering a composed `Button`'s subtree from outside.
 *
 * Acknowledged native limits: `escape-dismiss` and the F6 focus-navigation model
 * describe the web keyboard model and are not implemented here — there is no
 * hardware-keyboard event API comparable to a DOM `keydown` listener, and `Button`
 * does not expose focus events externally, so a toast cannot tell whether focus is
 * "inside" it. Dismissal stays reachable through the always-visible dismiss button
 * (forced on for `persistent`) and the standard `Enter`/native-activation gesture
 * `Pressable` already provides. See `ToastProvider`/`useToast`/`toast` below for the
 * app-root region this component is meant to be shown through.
 */
export declare function Toast({ message, tone, actionLabel, duration, dismissible, overrides, onAction, onDismiss }: ToastProps): React.JSX.Element;
/** Options for the imperative `toast()` call; the same shape as `ToastProps`. */
type ToastOptions = ToastProps;
interface ToastContextValue {
  /** Shows a toast. Returns its id (generated when `options.toastId` is omitted). Showing a toast with the same `toastId` replaces the previous one (`onDismiss('replaced')` on the one it replaces). */
  toast: (options: ToastOptions) => string;
  /** Removes a toast immediately without animating it out or notifying its `onDismiss`. Prefer letting the toast dismiss itself. */
  dismiss: (id: string) => void;
}
interface ToastProviderProps {
  children: React.ReactNode;
  /** Region-level overrides (`stackGap`, `regionInset`, `layer`). Bindings for the toasts themselves belong on each `toast()` call's own `overrides`. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ToastProvider — mounted once at the app root. Renders the notification region (an
 * absolutely positioned `View` above the bottom safe-area inset, `layer.toast`
 * z-index, centered, up to three toasts stacked newest-at-the-bottom) and exposes
 * `useToast()` / the module-level `toast()` so any code can show one. A toast shown
 * with a `toastId` already on screen replaces it (`onDismiss('replaced')` on the
 * replaced one); showing a fourth toast evicts the oldest the same way.
 */
export declare function ToastProvider({ children, overrides }: ToastProviderProps): React.JSX.Element;
/** Returns `{ toast, dismiss }` bound to the nearest `ToastProvider`. Warns and no-ops without one. */
export declare function useToast(): ToastContextValue;
/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` mounted at the app root; warns and no-ops otherwise. */
export declare function toast(options: ToastOptions): string;
//#endregion
//#region src/ActionSheet.d.ts
type ActionSheetActionTone = "default" | "danger";
/** One row. `danger` actions are visually distinct and rendered as a group after the others, regardless of their position in the array. */
type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
};
/** Why `onClose` fired. */
type ActionSheetCloseReason = "escape" | "scrim" | "cancel" | "drag";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "headerPaddingBlock" | "titleSize" | "fontFamily" | "fontSize" | "lineHeight" | "divider" | "dividerWidth" | "maxWidth" | "layer" | "enter" | "exit";
interface ActionSheetProps {
  /** Controlled visibility. */
  open: boolean;
  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; when omitted the name is `copy.defaultLabel`. */
  heading?: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close; Escape still reports through `onClose` when false, as in Dialog. */
  dismissible?: boolean | undefined;
  /** Label of the explicit cancel row. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: ((id: string) => void) | undefined;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: ((reason: ActionSheetCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ActionSheet — "what can I do with this?" A short list of verbs for one item,
 * reached from an overflow button or a long-press, with the dangerous one grouped
 * last and an explicit Cancel because thumbs miss.
 *
 * When to use: Use for contextual actions on an item — share, rename, duplicate,
 * delete — opened from an overflow `Button` (`iconOnly`, label "More actions") or a
 * long-press. Keep it to what fits without scrolling; more than eight actions means
 * the item needs its own screen. Put destructive actions last with `tone: "danger"`.
 * Do not use it for navigation, for settings with state, for choosing a value, or to
 * confirm a decision — its danger row opens an `AlertDialog`, it does not itself
 * confirm.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * scrim `Pressable` and an `Animated.View` surface anchored to the bottom, sliding up
 * on open (skipped under reduced motion). The surface composes `FocusScope`
 * (`trapped`, `restoreFocus`) for the trap and focus-restore-on-close, a handle bar
 * (as `BottomSheet`'s), the system `Text` (`size="sm"`, `tone="muted"`) for the
 * heading, `Icon` for each row's glyph and `Button` (`variant="secondary"`) for the
 * explicit Cancel row — never restyled directly. Rows are `Pressable`s with
 * `accessibilityRole="menuitem"` and `accessibilityState={{ disabled }}` — never the
 * native `disabled` prop, which would drop them from the focus order; a press guard
 * makes disabled rows inert instead. Once the enter animation finishes (or
 * immediately under reduced motion), accessibility focus moves to the first enabled
 * action via `AccessibilityInfo.setAccessibilityFocus`. A `PanResponder` on the
 * header (the handle plus the heading area, always present so there is always a drag
 * target) tracks a downward drag; past 25% of the measured surface height or a fast
 * flick, it fires `onClose('drag')` and continues the motion off-screen with
 * `Animated.decay` at the release velocity (instant, no decay, under reduced
 * motion); otherwise it springs back. `dismissible` (default `true`) gates the
 * scrim, the Cancel row (disabled, not removed, like `BottomSheet`'s close button)
 * and the drag; Escape always reports through `onClose('escape')` regardless, the
 * same convention `Dialog` and `BottomSheet` use. Choosing an action does not close
 * the sheet itself: `onAction` reports the id and the consumer decides, exactly like
 * the web/Lit doc describes ("the consumer performs it and closes").
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * ArrowUp/ArrowDown/Home/End movement and the roving-tabindex model the web doc
 * describes have no equivalent here — each row is instead its own Tab stop, the same
 * convention `Menu` and `RadioGroup` use; Enter/Space activate a focused row through
 * the platform's own accessibility action. The wide-screen presentation ("above
 * `maxWidth`, renders as a `Menu` anchored to the trigger") is not implemented: the
 * package's `Menu` always renders its own trigger `Button` and has no way to anchor
 * to an element rendered elsewhere in the tree, so composing it here would mean
 * duplicating its positioning logic rather than reusing it. ActionSheet therefore
 * always presents as the phone sheet, on tablets too — the mirror image of the limit
 * `Menu`'s own doc comment already acknowledges. The `maxWidth` override is
 * consequently a no-op: the binding governs a breakpoint this platform does not
 * switch on.
 */
export declare function ActionSheet({ open, heading, actions, dismissible, cancelLabel, onAction, onClose, overrides }: ActionSheetProps): React.JSX.Element;
//#endregion
//#region src/SidePanel.d.ts
type SidePanelSide = "start" | "end";
type SidePanelWidth = "narrow" | "default" | "wide";
type SidePanelPersistent = "never" | "content" | "page";
type SidePanelRole = "complementary" | "navigation";
/** Why `onOpenChange` fired. `action` and `navigation` are never emitted by SidePanel itself — they exist for a consumer whose footer action, or a followed Link inside the body, wants to report a close through the same callback (native has no client-router hook to detect a followed Link, unlike the web generator). */
type SidePanelCloseReason = "trigger" | "escape" | "close-button" | "scrim" | "swipe" | "action" | "navigation";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface SidePanelProps {
  /** The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon). It is the APG disclosure button: pressing it again closes the panel. Omit to control `open` from elsewhere (a Toolbar); hidden entirely once `persistent` takes over. */
  trigger?: React.ReactNode;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). Ignored once `persistent` takes over — the panel is then always present. */
  open?: boolean | undefined;
  /** The panel's title and accessible name. May be visually hidden with `hideHeading`. */
  heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the panel when taller than the viewport. */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: React.ReactNode;
  /** The physical edge the panel slides from, flipped by `I18nManager.isRTL`. */
  side?: SidePanelSide | undefined;
  /** Panel width: `narrow` for a list of links, `wide` for a form or detail. Clamped to the viewport minus `edgeGutter` on narrow screens. */
  width?: SidePanelWidth | undefined;
  /** Above the chosen breakpoint the panel renders as a fixed sidebar beside the content instead of an overlay: always visible regardless of `open`, no scrim, no trap, trigger hidden. `content` switches at `layout.maxWidth.content`, `page` at `layout.maxWidth.page`. */
  persistent?: SidePanelPersistent | undefined;
  /** The landmark role the panel exposes as a persistent sidebar: `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. Native has no `<aside>`/landmark equivalent for the overlay surface, so this reaches only the persistent sidebar's `role`. */
  role?: SidePanelRole | undefined;
  /** `false` (default, the disclosure pattern): focus stays on the trigger when it opens, the panel is not trapped. `true`: a modal Dialog at the edge — focus moves in and is trapped, always shows a scrim. */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too. Modal always has one regardless of this prop. */
  scrim?: boolean | undefined;
  /** Escape, the close button, a scrim tap and the swipe gesture all request close. When false, only the trigger and footer actions close it. */
  dismissible?: boolean | undefined;
  /** A swipe toward the edge dismisses the panel. Purely additive: the close button and (when `dismissible`) Escape always exist. Edge-swipe-to-open is not automatic — see `useSidePanelEdgeSwipe`. */
  swipeable?: boolean | undefined;
  /** Fired when the panel opens or closes, with the new state and a reason. */
  onOpenChange?: ((open: boolean, reason: SidePanelCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * SidePanel — the drawer: hidden off the edge until the trigger asks for it, then
 * sliding in beside the page. Non-modal by default (the APG disclosure pattern:
 * focus stays on the trigger, the page stays live); `modal` turns it into a Dialog
 * at the edge for a panel that must be finished or dismissed. Above `persistent`'s
 * breakpoint it stops being an overlay and becomes a fixed sidebar.
 *
 * When to use: primary navigation on phones (`start` edge), filters, a cart or
 * detail panel (`end` edge), a settings drawer. Set `persistent: content` when the
 * same panel should become the permanent desktop sidebar. Do not use it for a short
 * list of actions (Menu/ActionSheet), a small task (Dialog/BottomSheet), or content
 * that is the page's point. Do not stack side panels.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * backdrop `Pressable` — tinted with `color.overlay.scrim` when `modal` or `scrim`,
 * transparent otherwise, though the `Modal` still intercepts every touch behind it on
 * this platform, the same native limit `Popover` documents for its own non-modal
 * mode — and an `Animated.View` surface anchored to `side` (`I18nManager.isRTL`
 * flips it), sliding in on open (skipped under reduced motion). The surface composes
 * `FocusScope` (`trapped={modal}`, `autoFocus={modal ? 'first' : 'none'}`), `Heading`
 * (level 2, hidden with `hideHeading`) for the heading, `Button` for the close control,
 * `Box` for the scrollable body and `Stack` for the footer row — never restyled
 * directly. A `PanResponder` on the surface tracks a drag toward the edge it came
 * from; past 25% of its measured width or a fast flick, it fires `onOpenChange`
 * with reason `swipe` and continues the motion off-screen with `Animated.decay` at
 * the release velocity (instant, no decay, under reduced motion); otherwise it
 * springs back. The gesture is additive — the close button always exists and is
 * gated only by `dismissible`, exactly like Escape (the Android back button via
 * `onRequestClose`), the scrim tap and the swipe: per this component's own prop
 * doc, all four are disabled when `dismissible` is false, unlike `Dialog`'s
 * "Escape always reports" precedent, which does not apply here. `width`'s tokens
 * are clamped to the viewport minus `edgeGutter` so a phone-width panel always
 * leaves a strip of scrim visible. Above the `persistent` breakpoint
 * (`useWindowDimensions` against the chosen `layout.maxWidth.*` token) the panel
 * renders instead as a plain `View` (native `role` set from the `role` prop,
 * labelled by `heading`) with a border on the edge facing the content, always
 * visible regardless of `open`, with the trigger unrendered — the mirror of the web
 * generator's fixed sidebar. Edge-swipe-to-open is not implemented inside the
 * component (it needs a gesture on the screen root, not the panel itself);
 * `useSidePanelEdgeSwipe` is exported for a consumer to wire onto their own root
 * view.
 *
 * Acknowledged native limits: `role` reaches only the persistent sidebar — the
 * overlay surface has no `<aside>`/landmark equivalent on native, so its region role
 * is not exposed while disclosed or modal; there is no page-scroll lock or `inert`
 * background — the same limit `Dialog` and `BottomSheet` document, since there is no
 * page scroll for a modal window to suppress; the modal Tab-wrap and non-modal "Tab
 * flows into the panel" behavior have no native key-event equivalent, the same limit
 * `FocusScope` itself documents; a followed `Link` inside the body cannot close the
 * panel on its own (no client router to observe), so `navigation` is never emitted
 * by this component, only reserved on the type for parity with the web/Lit docs.
 */
export declare function SidePanel({ trigger, open, heading, hideHeading, children, footer, side, width, persistent, role, modal, scrim, dismissible, swipeable, onOpenChange, overrides }: SidePanelProps): React.JSX.Element;
interface UseSidePanelEdgeSwipeOptions {
  /** Must match the SidePanel's own `side`; the hook flips it for RTL the same way. */
  side?: SidePanelSide | undefined;
  /** Turn the gesture off, e.g. while the panel is already open. */
  enabled?: boolean | undefined;
  /** Fired when an edge swipe crosses the open threshold. The consumer sets its own `open` state — this hook has no knowledge of the panel it opens. */
  onOpen: () => void;
}
/**
 * A `PanResponder` for the screen root that opens a `SidePanel` on an edge swipe —
 * additive to the trigger and never the only way in (WCAG 2.5.1). Not part of
 * `SidePanel` itself: the gesture has to start from the edge of the whole screen,
 * outside the panel's own (unmounted-when-closed) surface, so the schema asks for a
 * hook the consumer wires onto their own root view rather than an automatic behavior
 * `SidePanel` could silently opt every screen into.
 */
export declare function useSidePanelEdgeSwipe({ side, enabled, onOpen }: UseSidePanelEdgeSwipeOptions): {
  panHandlers: PanResponderInstance["panHandlers"];
};
//#endregion
//#region src/Tabs.d.ts
type TabsActivation = "automatic" | "manual";
type TabsOrientation = "horizontal" | "vertical";
type TabsFit = "start" | "fill";
/** One tab. `badge` is a short count or status shown after the label ("3", "New"). */
type TabsTab = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "indicatorThickness" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
interface TabsProps {
  /** The tabs in order. */
  tabs: TabsTab[];
  /** One `TabPanel` per tab, in the same order, each with a matching `id`. Only the selected panel is rendered unless `keepMounted`. */
  children: React.ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it; `manual` moves focus only and
   * selects on Enter/Space. Native has no arrow-key focus movement (see the
   * component doc), so this has no observable effect on this platform; it is still
   * accepted and typed for parity with the other platforms.
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows on a hardware keyboard. */
  orientation?: TabsOrientation | undefined;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((id: string) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
}
interface TabPanelProps {
  /** Must match a `tabs[].id`. */
  id: string;
  children: React.ReactNode;
}
/** Wraps one tab's content. Rendered by `Tabs`, never directly. */
export declare function TabPanel({ children }: TabPanelProps): React.JSX.Element;
/**
 * Tabs — one region of a screen showing one of several equal-standing views, with
 * the tab list as a single stop in the accessibility order.
 *
 * When to use: Use Tabs to split a region into two to about seven alternative views
 * — the sections of a settings page, "Overview / Activity / Files" on a record.
 * Use `manual` activation when a panel is expensive to show (native has no
 * arrow-key movement, so this only documents intent — see below). Use `vertical`
 * when there are many tabs and horizontal room is short, `fill` on phones for two
 * to four tabs. Do not use Tabs for navigation between pages (a nav Landmark of
 * Links, styled as tabs if you like) or for a sequence (Stepper, planned).
 *
 * Renders a `ScrollView` (fit `start`, so overflowing tabs scroll, the selected tab
 * kept in view) or a `View` with each tab at `flex: 1` (fit `fill`) of `Pressable`s
 * with `accessibilityRole="tab"` and `accessibilityState={{ selected, disabled }}`,
 * carrying `accessibilityRole="tablist"` and `accessibilityLabel={label}` itself.
 * The indicator is an `Animated.View` positioned from each tab's measured
 * `onLayout` rect and animated between tabs over `transition` with
 * `motion.easing.standard`, snapping instead under reduced motion. Panels are
 * `View`s; only the selected one renders unless `keepMounted`, in which case the
 * others stay in the tree with `display: 'none'` and are hidden from assistive
 * technology.
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * arrow-key/Home/End movement and the automatic/manual distinction are a web
 * keyboard model with no RN equivalent (the same limit `Menu` and `RadioGroup`
 * document) — every tab is its own accessibility stop, and touching one always
 * selects it immediately regardless of `activation`. Tab-from-the-list-into-the-
 * panel and the panel's `tabpanel`/`aria-labelledby` pairing have no native
 * equivalent either; panels are plain `View`s.
 */
export declare function Tabs({ tabs, children, label, value, defaultValue, activation, orientation, fit, keepMounted, onChange, overrides }: TabsProps): React.JSX.Element;
//#endregion
//#region src/SegmentedControl.d.ts
type SegmentedControlSize = "sm" | "md";
/** One option. `value` is a short identifier. */
type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SegmentedControlOverridableBinding = "groupPadding" | "groupRadius" | "segmentShadow" | "segmentRadius" | "segmentPaddingInline" | "segmentPaddingBlock" | "segmentGap" | "segmentSpacing" | "selectedWeight" | "paddingBlockSm" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "transition" | "disabledOpacity";
interface SegmentedControlProps {
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  label: string;
  /** Two to five options. Labels are one word; with `iconOnly` the label becomes the accessible name. */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected value. Defaults to the first enabled option — a segmented control always has a selection. */
  defaultValue?: string | undefined;
  /** Show icons only (every option must have one); labels become accessible names. */
  iconOnly?: boolean | undefined;
  /** Toolbar (`sm`) or standard (`md`) height. */
  size?: SegmentedControlSize | undefined;
  /** Stretch to the container width with equal segments. */
  fill?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: ((value: string) => void) | undefined;
}
/**
 * SegmentedControl — switches a mode: list or grid, day or week, metric or
 * imperial. Exactly one segment is always selected and choosing one takes effect
 * at once; there is nothing to submit, which is what separates it from a
 * RadioGroup borrowing its semantics.
 *
 * When to use: two to five short, parallel options that change what a region
 * shows or how a tool behaves, switched often with the effect seen immediately.
 * Use `iconOnly` in toolbars only when the icons are unambiguous. Do not use it
 * for a value submitted later (RadioGroup), for views of content (Tabs), or with
 * no selection.
 *
 * Renders a `View` with `accessibilityRole="radiogroup"` and `accessibilityLabel`,
 * a background from `groupBackground`, and a row of `Pressable`s with
 * `accessibilityRole="radio"` and `accessibilityState={{ checked, disabled }}` per
 * option. The pill is an `Animated.View` positioned from each segment's measured
 * `onLayout` rect, sliding between segments over `transition` with
 * `motion.easing.standard` and snapping instead under reduced motion. Selection is
 * carried by the checked state plus the stronger, heavier text — never by the
 * pill's low contrast alone.
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * arrow-key/Home/End movement is a web keyboard model with no RN equivalent (the
 * same limit `RadioGroup` and `Tabs` document) — every segment is its own
 * accessibility stop and touching one always selects it immediately.
 */
export declare function SegmentedControl({ label, options, value, defaultValue, iconOnly, size, fill, overrides, onChange }: SegmentedControlProps): React.JSX.Element;
//#endregion
//#region src/Listbox.d.ts
/** One selectable row. `value` is the short identifier submitted with the Form. */
type ListboxOption = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of options, rendered with a non-interactive heading row. */
type ListboxGroup = {
  group: string;
  options: ListboxOption[];
};
type ListboxItem = ListboxOption | ListboxGroup;
/** The selection: a value, or with `multiple` an array of values. */
type ListboxValue = string | string[];
type ListboxMaxVisible = 5 | 8 | 12 | "5" | "8" | "12" | "all";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ListboxOverridableBinding = "border" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
interface ListboxProps {
  /** Accessible name of the list. */
  label: string;
  /** Flat or grouped options. */
  options: ListboxItem[];
  /** Allow any number of selections. The value becomes an array; each option shows a check indicator. */
  multiple?: boolean | undefined;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  value?: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: on the web keyboard model, arrow keys select as they move.
   * Native has no arrow-key browsing to intercept — a `Pressable`'s activation is
   * already the only "move" it gets — so this flag is accepted for API parity but has
   * no runtime effect on this platform.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /**
   * Marks the list invalid. Usually set by the Form. No dedicated border token exists
   * for this component (unlike Input/Select's own bordered fields), so this only feeds
   * the `error` → `required` → `invalid` message precedence; it has no visual
   * treatment of its own.
   */
  invalid?: boolean | undefined;
  /** Error message rendered below the list. Setting it implies `invalid`. */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface
   * and radius; the list draws none of its own.
   */
  embedded?: boolean | undefined;
  /**
   * The option that is active when the list first renders. Defaults to the first
   * selected option, else the first enabled option. Pre-highlights that row's active
   * background; native has no single tab stop to move real accessibility focus onto
   * ahead of the user reaching it, so this is visual only — see the generation gap
   * notes.
   */
  defaultActiveValue?: string | undefined;
  /**
   * Options are being fetched (async Combobox); shows `copy.loading` in place of the
   * empty message and marks the list `accessibilityState.busy`.
   */
  loading?: boolean | undefined;
  /** The whole list is inert but readable. */
  disabled?: boolean | undefined;
  /** Field name for Form collection. Multiple values are collected as an array. */
  name?: string | undefined;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value. */
  onActiveChange?: ((value: string) => void) | undefined;
}
/**
 * Listbox — the engine behind a picker: the list of options a Select's popup or a
 * Combobox's suggestions actually renders, extracted so all three behave identically,
 * including for multi-select.
 *
 * When to use: Use a standalone Listbox when the options should stay visible — a
 * settings picker, a transfer list. Use `multiple` for "pick any". Do not use it for
 * two to seven options that fit without scrolling (RadioGroup or Checkbox) or for
 * actions (Menu).
 *
 * Renders a `FlatList` (virtualised — long option lists are common) of `Pressable`
 * rows with `accessibilityRole="menuitem"` (there is no listbox/option role on
 * native) and `accessibilityState={{ selected, disabled }}` (`checked` instead of
 * `selected` when `multiple`). Groups are plain, non-interactive rows — not the
 * header trait, which would enter the headings rotor. `maxVisible` becomes a
 * `maxHeight` computed from the first row's measured height, so the list scrolls
 * after that many rows; `all` never scrolls. Each row is its own accessibility stop:
 * native has no generic key-event API on `Pressable`, so arrow navigation, Home/End,
 * Page Up/Down, typeahead and the multi-select modifiers (Shift+Arrow, Ctrl/Cmd+A)
 * from the web keyboard model have no equivalent here — the same acknowledged limit
 * `Menu` documents. Enter/Space activation is the native accessibility "activate"
 * action and needs no extra wiring. The check indicator is always rendered (invisible
 * when unselected) so labels align; it and the leading option `Icon` are decorative
 * (hidden from assistive tech) since the row's own accessibility label and state
 * already carry that meaning. Focus is tracked by hand (`onFocus`/`onBlur`) to draw
 * the active background and focus ring and to fire `onActiveChange`. Inside a Form
 * the list registers by `name` (when given) and contributes the selected value, or
 * the array for `multiple` (`undefined`, i.e. no key, when nothing is selected);
 * `required` fails with `copy.required` when nothing is selected, and focus on a
 * failed submit moves to the list itself. `error` (or a Form-derived error) takes
 * precedence over `required`, which takes precedence over the boolean-only `invalid`
 * flag (no dedicated border token exists for this component, so `invalid` alone has
 * no visual treatment). `embedded` drops the list's own border, surface and radius
 * for use inside a popup that already draws them (Select, Combobox). `loading` shows
 * `copy.loading` in place of the empty message and marks the list
 * `accessibilityState.busy`. `defaultActiveValue` (falling back to the first selected
 * option, else the first enabled one) only pre-highlights that row's active
 * background on mount — native has no single tab stop to move real accessibility
 * focus onto ahead of the user reaching it.
 */
export declare function Listbox({ label, options, multiple, value, defaultValue, selectionFollowsFocus, required, invalid, error, embedded, defaultActiveValue, loading, disabled, name, emptyMessage, maxVisible, overrides, onChange, onActiveChange }: ListboxProps): React.JSX.Element;
//#endregion
//#region src/Select.d.ts
/** Which picker surface to use. See `Select`'s doc for how each maps on this platform. */
type SelectNative = "auto" | "always" | "never";
/** The selection: a value, or with `multiple` an array of values. */
type SelectValue = ListboxValue;
/** `sm` for pickers inside toolbars and calendar headers. */
type SelectSize = "sm" | "md";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SelectOverridableBinding = "triggerBorderFocus" | "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerPaddingBlockSm" | "triggerGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "lineHeight" | "minTargetSm" | "disabledOpacity" | "enter";
interface SelectProps {
  /** Visible label. Always rendered. Also the trigger's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The options, passed through to the Listbox. */
  options: ListboxItem[];
  /** Controlled value (array with `multiple`). */
  value?: SelectValue | undefined;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue | undefined;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. */
  placeholder?: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  hideLabel?: boolean | undefined;
  /** `sm` for pickers inside toolbars and calendar headers. */
  size?: SelectSize | undefined;
  /** Controlled popup state, for programmatic opening and for stories and tests. Omit for the trigger-driven default. */
  open?: boolean | undefined;
  /** Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the popup stays open while toggling. */
  multiple?: boolean | undefined;
  /** Helper text under the label. Also the trigger's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Not openable and not submitted. Stays visible and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /**
   * `auto` (default): a `BottomSheet` on phone-width screens, the positioned popup on
   * tablets and react-native-web. `always` and `never` both fall back to that same
   * choice — see the doc comment for why.
   */
  native?: SelectNative | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: SelectValue) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Select — the field for "one of these" (or "any of these") when the list is longer
 * than a RadioGroup should show and typing is not the natural way in.
 *
 * When to use: Use for a form field with about seven to fifty recognisable options —
 * country, role, status. Use `multiple` for tags or memberships. Use Combobox instead
 * when typing to filter is faster than scrolling, or free text is allowed. Do not use
 * it for two to six options (RadioGroup), for actions (Menu), or for on/off (Switch).
 *
 * Renders a `Pressable` trigger (`accessibilityRole="combobox"`, `accessibilityLabel`,
 * `accessibilityHint`, `accessibilityState={{ expanded, disabled }}`,
 * `accessibilityValue={{ text }}` with the selected label(s)) showing the value or
 * `copy.placeholder`, and an `Icon` chevron. Activating it opens a `Listbox` in a
 * popup: a `BottomSheet` on phone-width screens, or a `Modal` positioned below (and
 * flipped above on overflow) the trigger, at least as wide as it, on `layer.dropdown`,
 * elsewhere. Escape (the Android back gesture) and an outside tap close the popup
 * without changing the value and move accessibility focus back to the trigger
 * (`AccessibilityInfo.setAccessibilityFocus`, since `FocusScope`'s own `restoreFocus`
 * only recaptures a `TextInput`, not a `Pressable` — the same limit `Popover`
 * documents). Selecting an option commits and, for a single select, closes the popup;
 * with `multiple` the popup stays open and the `BottomSheet` path gets a footer "Done"
 * button (the plain popup closes on outside tap or Escape instead). Validation,
 * `required`, `disabled` and `error` work as `Input`'s: precedence is `error` prop →
 * `required` → `invalid`, and the field registers `{ getValue, validate, focus }`
 * with the enclosing `FormContext` by `name` directly (no hidden input, and the
 * composed `Listbox` is not itself registered, so the value is not double-counted).
 * `native` only has one real branch point on this platform, since there is no native
 * OS picker without a banned community dependency: `never` always uses the popup;
 * `auto` and `always` both use the phone/tablet split described above. See the
 * generation gap notes for the web-only "native `<select>`" meaning of `always` that
 * has no native equivalent here. `size: sm` swaps the trigger's vertical padding and
 * target height for their `Sm` bindings and the trigger/label/Listbox text to
 * `font.size.sm`; `hideLabel` keeps the label as the trigger's `accessibilityLabel`
 * while dropping its visible `Text`. `open` is a controlled escape hatch for
 * programmatic opening (stories, tests); when omitted the trigger drives it.
 */
export declare function Select({ label, name, options, value, defaultValue, placeholder, hideLabel, size, open: openProp, multiple, description, required, disabled, invalid, error, native, overrides, onChange, onOpenChange }: SelectProps): React.JSX.Element;
//#endregion
//#region src/Combobox.d.ts
/** How typing narrows `options`. `none` never filters; `async` leaves filtering to the consumer. */
type ComboboxFilter = "startsWith" | "contains" | "none" | "async";
/** The selection: a value, or with `multiple` an array of values. An empty string / empty array is "nothing selected". */
type ComboboxValue = string | string[];
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ComboboxOverridableBinding = "fieldBorderFocus" | "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
interface ComboboxProps {
  /** Visible label. Always rendered. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxItem[];
  /** Controlled selected value(s) (array with `multiple`). With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue | undefined;
  /** Initial selected value(s). */
  defaultValue?: ComboboxValue | undefined;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /** Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip. */
  multiple?: boolean | undefined;
  /** Typed text that matches no option can be committed as a value. Enter commits it; the list shows `copy.addCustom` as the first row. */
  allowCustom?: boolean | undefined;
  /** How typing narrows `options`. */
  filter?: ComboboxFilter | undefined;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string | undefined;
  /** Helper text under the label. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Not editable, not submitted, still readable and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  loading?: boolean | undefined;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: ComboboxValue) => void) | undefined;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: ((value: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Combobox — an input that narrows as you type and lets you pick, or, with
 * `allowCustom`, keep what you typed.
 *
 * When to use: Use for long lists (fifty-plus), for values typed faster than found
 * (dates, codes), for `async` search against a server, and for multi-value fields
 * where chips make the selection legible. Use `allowCustom` when new values are
 * legitimate (tags, invitees). Do not use it for short static lists (Select) or to
 * navigate to search results (a search form).
 *
 * Composes the same `Listbox` engine `Select` uses for its popup. On phones the
 * field is a `Pressable` summary (chips read-only, for glanceability) that opens a
 * `BottomSheet` containing the real `TextInput` (autofocused by the sheet's own
 * `FocusScope`) above the `Listbox`, with a `Done` footer action under `multiple`;
 * on tablets and react-native-web the field holds the `TextInput` directly and the
 * popup is an anchored `Modal` positioned below it (flipped above on overflow),
 * deliberately not focus-trapping, since focus must stay in the input while the
 * list is browsed by touch. Typing filters `options` per `filter` and opens the
 * list; selecting a row commits and, single-select, closes the popup, while
 * `multiple` adds a chip, clears the text and stays open. `allowCustom` injects a
 * synthetic first row (`copy.addCustom`) into the Listbox's own `options` when the
 * typed text matches nothing, so committing it needs no engine change. Because
 * `Listbox`'s own rows are touch `Pressable`s with no key-event API, the web
 * keyboard model's arrow-key/Home/End active-option browsing and Tab-does-not-commit
 * behavior have no native equivalent (the same acknowledged limit `Listbox`
 * documents); only Escape (closes, then clears — reachable via a hardware/RNW
 * keyboard), Enter (commits typed custom text via `onSubmitEditing`) and Backspace
 * on an empty `multiple` input (removes the last chip, via `onKeyPress`) are wired.
 * Result counts, loading and empty states are announced with
 * `AccessibilityInfo.announceForAccessibility`, debounced. Validation and Form
 * registration work as `Input`'s: precedence is `error` prop → `required` →
 * `invalid`.
 */
export declare function Combobox({ label, name, options, value, defaultValue, inputValue, multiple, allowCustom, filter, placeholder, description, required, disabled, invalid, error, loading, clearable, overrides, onChange, onInputChange, onOpenChange }: ComboboxProps): React.JSX.Element;
//#endregion
//#region src/Accordion.d.ts
/** Heading level for every trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
type AccordionHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/** One section. `content` is the panel body. */
type AccordionItem = {
  id: string;
  summary: string;
  content: React.ReactNode;
  disabled?: boolean | undefined;
};
/** Controlled/uncontrolled open ids: a single id under `exclusive`, otherwise the full set. */
type AccordionValue = string | string[];
/** Why a section's open state changed, passed to `onOpenChange`. Native has no arrow-key model, so `keyboard` never fires here — see the component doc. */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type AccordionOverridableBinding = "divider" | "dividerWidth" | "itemGap" | "triggerPaddingBlock" | "fontFamily" | "triggerFontSize" | "triggerFontWeight";
interface AccordionProps {
  /** The sections in order. */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. Native has no heading levels; the value only documents the outline (see `Disclosure`). */
  headingLevel?: AccordionHeadingLevel | undefined;
  /** Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. */
  exclusive?: boolean | undefined;
  /** Controlled open ids. Omit for an uncontrolled accordion. */
  value?: AccordionValue | undefined;
  /** Initially open ids. */
  defaultValue?: AccordionValue | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean | undefined;
  /** Fired when the set of open sections changes, with the full list of open ids. */
  onChange?: ((openIds: string[]) => void) | undefined;
  /** Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content, or scrolling the opened section into view; `onChange` remains the set-level event for state. */
  onOpenChange?: ((detail: {
    id: string;
    open: boolean;
    reason: AccordionOpenChangeReason;
  }) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
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
export declare function Accordion({ items, headingLevel, exclusive, value, defaultValue, divided, keepMounted, onChange, onOpenChange, overrides }: AccordionProps): React.JSX.Element;
//#endregion
//#region src/Slider.d.ts
type SliderShowValue = "always" | "hover" | "never";
interface SliderMark {
  value: number;
  label?: string | undefined;
}
type SliderValue = number | [number, number];
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbBorderWidth" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "mark" | "markSize" | "markLabelSize" | "valueSize" | "labelWeight" | "partGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "errorText" | "disabledOpacity" | "transition";
interface SliderProps {
  /** Visible label naming the quantity ("Volume", "Price range"). Named by each thumb via `copy.minimumLabel`/`copy.maximumLabel` in a range. */
  label: string;
  /** Field name for the Form. A range contributes `[min, max]`. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  step?: number | undefined;
  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by `step`, PageUp/Down by mark). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default to submit (`copy.required`). */
  required?: boolean | undefined;
  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  invalid?: boolean | undefined;
  /** Controlled value; for a range, a two-number array. */
  value?: SliderValue | undefined;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  defaultValue?: SliderValue | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  range?: boolean | undefined;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  formatValue?: ((value: number) => string) | undefined;
  /** Where the value text appears: always beside the label, only while dragging (as a bubble above the thumb), or not at all. */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. */
  marks?: SliderMark[] | undefined;
  /** Not adjustable, still readable. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or via an accessibility action (number or pair). */
  onValueChange?: ((value: SliderValue) => void) | undefined;
  /** Fired once when the interaction ends (drag release, accessibility action). Use for expensive effects. */
  onSlidingComplete?: ((value: SliderValue) => void) | undefined;
}
/**
 * Slider — lets people choose a bounded numeric value (or, with `range`, a minimum
 * and a maximum) by feel: the thumb sits on the value, the fill shows how much, and
 * every value the pointer can reach is also reachable by keys and accessibility
 * actions.
 *
 * When to use: Use a Slider for a bounded numeric value where approximate is fine
 * and the scale has meaning across its whole width — volume, brightness, a price
 * range. Use `range` for "between" filters. Add `marks` when a few values are
 * meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry
 * also matters. Do not use it for a value that must be exact, for more than about a
 * hundred steps without marks, or for two or three discrete choices
 * (SegmentedControl).
 *
 * Renders a label row, optional helper text, a track with a fill sized from the
 * value(s), optional tick marks, and one `SliderThumb` (two for `range`, each its
 * own tab stop via `accessibilityActions`). Dragging a thumb sets the value from
 * the pointer's horizontal offset, snapped to `step` or, with `snapToMarks`, to the
 * nearest mark (keys and the increment/decrement accessibility actions always move
 * by `step`); `onValueChange` fires on every change, `onSlidingComplete` once per
 * interaction (drag release or an accessibility action). A range's thumbs
 * cannot cross: each drag clamps against the other thumb's current value. The value
 * text shows beside the label (`showValue: always`), as a bubble above the active
 * thumb while dragging (`hover`), or not at all (`never`) — the accessible value
 * (`formatValue`-formatted) is always exposed regardless. `required` fails
 * validation while the value still equals its initial default; `invalid` fails it
 * unconditionally; `error` overrides both. `disabled` dims the whole control with
 * `disabledOpacity` and blocks both the gesture and the accessibility actions while
 * staying focusable and readable. Inside a Form the field registers as a single
 * entry: a single value as its string, a range as the `[min, max]` pair of strings
 * (`FormFieldValue` has no numeric variant).
 */
export declare function Slider({ label, name, min, max, step, snapToMarks, required, invalid, value, defaultValue, range, formatValue, showValue, marks, disabled, description, error, overrides, onValueChange, onSlidingComplete }: SliderProps): React.JSX.Element;
//#endregion
//#region src/Toolbar.d.ts
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarOverflow = "wrap" | "menu" | "scroll";
type ToolbarSize = "sm" | "md";
type ToolbarDensity = "compact" | "comfortable";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "itemGapCompact" | "groupGap" | "separatorLength" | "fadeWidth";
interface ToolbarProps {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: `Button` (usually `ghost` or `secondary`, `iconOnly` for glyph
   * tools), `SegmentedControl`, `Select`, `Switch`. Place a `Divider` between related
   * clusters — Toolbar gives it extra space on both sides and constrains its length.
   */
  children: React.ReactNode;
  /** Vertical toolbars sit beside a canvas. Arrow-key axis swapping is a web keyboard model; see the component doc. */
  orientation?: ToolbarOrientation | undefined;
  /** What happens when controls do not fit. See the component doc for the native fallback on `menu`. */
  overflow?: ToolbarOverflow | undefined;
  /** Passed to the child controls that accept a `size` prop, unless a child already sets its own. */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Toolbar — keeps a set of related controls together so the keyboard treats them as
 * one stop: Tab reaches the toolbar, and, on a hardware keyboard on
 * react-native-web, arrows move within it.
 *
 * When to use: Use a Toolbar for controls that act on the same thing and are used
 * together — text formatting, a table's row actions, a data page's filter–sort–
 * export row. Group related controls with a `Divider` between clusters. Do not use
 * it for page navigation or a form's submit row, and do not use it as a generic
 * horizontal Stack — it changes how Tab works on web.
 *
 * Renders a `View` with `accessibilityRole="toolbar"` and `accessibilityLabel`
 * carrying `background` (locked), `border`, `radius` and `paddingInline`/
 * `paddingBlock`. Children are wrapped one-by-one, each carrying the trailing
 * margin to its neighbor: `itemGap`/`itemGapCompact` (by `density`) normally,
 * `groupGap` on either side of a `Divider` child. A `Divider` child is additionally
 * wrapped in a `View` constrained to `separatorLength` on the cross axis, so
 * `Divider`'s own `alignSelf: 'stretch'` renders it shorter than the toolbar rather
 * than restyling it. Non-divider children receive `size` by `React.cloneElement`
 * when they do not already set their own — the same fallback pattern `Fieldset`
 * uses for `disabled` — so a caller's explicit choice is never overridden.
 *
 * `overflow: wrap` renders the children in a plain `View` with `flexWrap: 'wrap'`.
 * `scroll` and `menu` render a `ScrollView` (horizontal unless `orientation` is
 * vertical) with a `Svg`/`LinearGradient` fade of `fadeWidth` at each edge, from
 * `background` to transparent — the RN analog of the web `mask-image` gradient.
 *
 * Acknowledged native limits: there is no `ResizeObserver` equivalent and children
 * are opaque `ReactNode`s with no `overflowLabel` metadata, so `overflow: menu`
 * cannot measure and move trailing controls into a "More" `Menu` the way the web
 * implementation does; it renders the same scrollable row as `overflow: scroll`
 * instead (dev warning in `__DEV__`). There is no generic key-event API on
 * `Pressable`, so the roving-tabindex/arrow-key/Home/End model is a web keyboard
 * concern only, reachable through react-native-web — on native every control is its
 * own accessibility stop, reachable by swipe, the same limit `Tabs` and `Menu`
 * document. `ToolbarGroup`, named in the guidance and the web/Lit platform notes,
 * has no schema of its own; grouping on this platform is expressed by placing a
 * `Divider` between clusters of children rather than a dedicated wrapper component.
 */
export declare function Toolbar({ label, children, orientation, overflow, size, density, overrides }: ToolbarProps): React.JSX.Element;
//#endregion
//#region src/Carousel.d.ts
type CarouselPicker = "dots" | "tabs" | "none";
type CarouselChangeReason = "next" | "prev" | "picker" | "swipe" | "autoplay";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotTarget" | "radius" | "transition";
interface CarouselSlideProps {
  /**
   * This slide's heading. Not rendered — used to build the slide's accessible name
   * ("{n} of {total}, {heading}") and, when `picker="tabs"`, that slide's tab label.
   * The visible content still needs its own heading for sighted users (a Card is the
   * usual shape); this mirrors the web platform's separate `aria-label`.
   */
  heading: string;
  /** The slide's content. Slides should be equal height. */
  children: React.ReactNode;
}
/** One slide. Rendered by `Carousel`, never directly. */
export declare function CarouselSlide({ children }: CarouselSlideProps): React.JSX.Element;
interface CarouselProps {
  /** What the carousel shows ("Featured products", "Customer stories"). Names the region. */
  label: string;
  /** One `CarouselSlide` per slide. */
  children: React.ReactNode;
  /** How many slides are visible at once at the widest layout. */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /** Rotate automatically every `interval`. Never starts under reduced motion; stops for good on touch or the pause button. */
  autoplay?: boolean | undefined;
  /** Milliseconds between automatic advances. Below 5000 warns in development. */
  interval?: number | undefined;
  /** How slides are chosen directly. */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping or scrolling snaps to slide boundaries. */
  snap?: boolean | undefined;
  /** Fired when the current slide changes, with the new index and the reason. */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Carousel — shows several things in the space of one and lets the user page
 * through them.
 *
 * When to use: Use for a small set (three to eight) of peer items too rich for a
 * grid — featured products, testimonials, a gallery. Use `picker="tabs"` when
 * slides have meaningful names, `dots` for images. Leave `autoplay` off unless the
 * content is ambient, and even then keep the pause control visible. Do not hide
 * important content behind slide two, and do not autoplay text people need to read.
 *
 * Renders a horizontal `FlatList` (`pagingEnabled` at `perView` 1, `snapToInterval`
 * otherwise) of slide `View`s, each `accessible` with a positional label
 * (`copy.slideLabel` plus its heading) and hidden from assistive technology
 * (`accessibilityElementsHidden`/`importantForAccessibility`) while outside the
 * current window, so off-screen links are not tab stops. The region `View` carries
 * `accessibilityRole="adjustable"` with increment/decrement `accessibilityActions`
 * as the alternative to the swipe gesture. `prevButton`/`nextButton` are composed
 * `Button`s (`variant="ghost"`, chevron `Icon`s) each in a small wrapper `View` that
 * carries `controlBackground`/`controlShadow` — composing rather than restyling
 * Button, whose overridable bindings have no plain "background" slot. The picker
 * (`dots`/`tabs`) and the play/pause `Button` (only rendered while autoplay can
 * possibly run, i.e. `autoplay` is set and reduced motion is not) are hand-built
 * `Pressable`s with their own focus ring, matching the package's focus-visible
 * convention. A hidden `liveRegion` `View` (`accessibilityLiveRegion="polite"`)
 * covers Android; `AccessibilityInfo.announceForAccessibility` covers iOS, firing
 * for every reason except `autoplay` (APG: do not announce automatic changes).
 *
 * Next/Previous/autoplay each move exactly one slide — the spec's "one slide (or
 * one page of `perView`)" does not define page alignment, so `perView` only governs
 * how many slides are visible at once, never the step size. Autoplay stops for good
 * on touch (`onTouchStart` on the region, `onScrollBeginDrag` on the track); pausing
 * on focus could only be wired for the hand-built picker items, since the composed
 * `Button` exposes no `onFocus` prop to observe.
 */
export declare function Carousel({ label, children, perView, loop, autoplay, interval, picker, activeIndex, snap, onChange, overrides }: CarouselProps): React.JSX.Element;
//#endregion
//#region src/Table.d.ts
type TableColumnAlign = "start" | "end" | "center";
type TableColumnWidth = "auto" | "min" | "fill";
type TableHideBelow = "prose" | "content";
type TableSortDirection = "ascending" | "descending";
type TableSelectable = "none" | "single" | "multiple";
type TableResponsive = "stack" | "scroll";
type TableMaxHeight = "none" | "viewport";
type TableDensity = "compact" | "comfortable";
type TableCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A single record. `id` must be stable; it is what selection and keys use. */
interface TableRow {
  id: string;
  [key: string]: unknown;
}
/** One column definition, in display order. */
interface TableColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: TableColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: TableColumnWidth | undefined;
  isRowHeader?: boolean | undefined;
  hideBelow?: TableHideBelow | undefined;
  render?: ((row: TableRow) => React.ReactNode) | undefined;
}
/** Sort state: which column, and which way. */
interface TableSort {
  column: string;
  direction: TableSortDirection;
}
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellPaddingInlineCompact" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface TableProps {
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /** Visually hides the caption; it remains the accessible name. Use when a Heading directly above already says it. */
  hideCaption?: boolean | undefined;
  /** Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font. */
  footer?: React.ReactNode;
  /** Column definitions in display order. Exactly one column may be `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  sort?: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  defaultSort?: TableSort | undefined;
  /** Adds a selection column: a Checkbox per row (radio-like for `single`), plus select-all for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below the prose width: `stack` repeats the column header as a label before each value; `scroll` keeps every column and scrolls horizontally. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: compact or comfortable. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: existing rows stay visible, `copy.loading` is shown when there is nothing yet. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell for each row. */
  rowActions?: ((row: TableRow) => React.ReactNode) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TableSort) => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated (its row-header cell), with its id. */
  onRowPress?: ((id: string) => void) | undefined;
}
/**
 * Table — the honest way to show records that share fields: every row the same
 * shape, every column a comparable thing.
 *
 * When to use: Use a Table for a list of records with three or more comparable
 * fields. Use `responsive: stack` (the default) when each row is a thing a person
 * reads, and `scroll` when the columns are what matters. Do not use it for layout,
 * for one or two fields, or for cell-level editing/arrow navigation — that is
 * DataGrid.
 *
 * There is no table element on native. Below `layout.maxWidth.prose` (treated here
 * as "phone") the table always renders as a virtualised `FlatList` of accessible,
 * card-like blocks — one per row — whose `accessibilityLabel` joins "{header}:
 * {value}" for every visible column, row header first; the selection `Checkbox` and
 * `rowActions` are separate accessibility stops inside the block. Sortable columns
 * render as a `Toolbar` of `Button`s above the list instead of a header row, since
 * there is no room for one. At or above that width (tablets, react-native-web) the
 * table renders a header row plus fixed-width column cells; `stickyHeader` uses
 * `stickyHeaderIndices`, and the header grows `headerShadow` once the body has
 * scrolled beneath it. `responsive: scroll` at that width wraps the table in a
 * horizontal `ScrollView`; the row-header cells grow `stickyColumnShadow` once the
 * region has scrolled horizontally (an approximation of a sticky column: RN has no
 * position-sticky and the package permits no gesture-handler/reanimated dependency
 * for a synced second list, so the whole table scrolls together rather than pinning
 * the row-header column in place). `responsive` has no effect at true phone widths;
 * phones are always stacked (a `__DEV__` warning notes this for `scroll`).
 *
 * Sorting: with a controlled `sort` prop the caller owns ordering (server-side
 * sorting works the same way); otherwise the table sorts `data` itself from
 * `defaultSort` with `localeCompare`/numeric comparison. Selection is row identity:
 * `single` behaves like a set of radios (selecting one clears any other, and
 * re-selecting the same row clears it); `multiple` adds a select-all control
 * (indeterminate when some rows are selected). Both post their new state to a
 * visually-hidden, accessible live region (`copy.sortedAnnouncement` /
 * `copy.selectedCount`), plus `AccessibilityInfo.announceForAccessibility` on iOS.
 */
export declare function Table({ caption, captionLevel, hideCaption, footer, columns, data, sort, defaultSort, selectable, selected, defaultSelected, responsive, stickyHeader, maxHeight, density, striped, emptyMessage, loading, rowActions, overrides, onSortChange, onSelectionChange, onRowPress }: TableProps): React.JSX.Element;
//#endregion
//#region src/DataGrid.d.ts
type DataGridColumnAlign = "start" | "end" | "center";
type DataGridColumnPinned = "start" | "end";
type DataGridEditorKind = "text" | "number" | "select" | "date" | "checkbox";
type DataGridSortDirection = "ascending" | "descending";
type DataGridSelectable = "none" | "row" | "cell" | "range";
type DataGridDensity = "compact" | "comfortable";
type DataGridHeight = "content" | "viewport" | "fixed";
/** A single record. `id` must be stable; it is what selection and keys use. */
interface DataGridRow {
  id: string;
  [key: string]: unknown;
}
/** One option for a `select` editor. */
interface DataGridColumnOption {
  value: string;
  label: string;
}
/** One column definition, in display order (subject to `pinned`). */
interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  /** Pixel width, a multiple of `space.1` (e.g. 160). Columns do not auto-size. */
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  /** Keeps the column in place while the grid scrolls sideways. */
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  render?: ((row: DataGridRow) => React.ReactNode) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}
/** Controlled sort state. */
interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}
/** A single selected cell, in `selectable="cell"` mode. */
interface DataGridCellSelection {
  rowId: string;
  column: string;
}
/** A rectangular selection, in `selectable="range"` mode. Not reachable on this platform; see the generation gap notes. */
interface DataGridRangeSelection {
  from: DataGridCellSelection;
  to: DataGridCellSelection;
}
type DataGridSelection = string[] | DataGridCellSelection | DataGridRangeSelection;
/** Payload of a committed edit. */
interface DataGridCellChange {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
/** The row window the caller should load next, for server paging. */
interface DataGridRangeNeeded {
  start: number;
  end: number;
}
/** Payload fired when a resizable column finishes being dragged. */
interface DataGridColumnResize {
  column: string;
  width: number;
}
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHeight" | "rowHeightComfortable" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellFocusRingWidth" | "rangeBorderWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "statusBarSize" | "statusBarPadding" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface DataGridProps {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions plus grid concerns (width, pinning, editing). Exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Drives `onEndReached`. */
  rowCount?: number | undefined;
  /** Controlled sort state; the caller sorts `data`. */
  sort?: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSort | undefined;
  /**
   * `row` adds a checkbox column and toggles rows; `cell` selects one cell.
   * `range` has no touch or hardware-keyboard equivalent on this platform and degrades to `row`
   * (a `__DEV__` warning notes this); see the generation gap notes.
   */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited by tapping them. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true unless `height="content"`. */
  stickyHeader?: boolean | undefined;
  /**
   * `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization, small grids); `fixed` uses `overrides.fixedHeight`.
   */
  height?: DataGridHeight | undefined;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: DataGridSort) => void) | undefined;
  /** Fired with the new selection: row ids, one cell, or (web/lit only) a range. */
  onSelectionChange?: ((selection: DataGridSelection) => void) | undefined;
  /** Fired when an edit commits, with the new and previous value. The caller updates `data`. */
  onCellChange?: ((change: DataGridCellChange) => void) | undefined;
  /** Fired when an editor is about to open; return `false` to refuse editing that cell. */
  onEditStart?: ((target: DataGridCellSelection) => boolean | void) | undefined;
  /** Fired (as `FlatList`'s `onEndReached`) when the visible window nears the end of `data` and `rowCount` says there is more. */
  onEndReached?: ((range: DataGridRangeNeeded) => void) | undefined;
  /** Fired with the column and its new width when a resizable column finishes being dragged. */
  onColumnResize?: ((resize: DataGridColumnResize) => void) | undefined;
}
/**
 * DataGrid — hundreds or thousands of rows navigated cell by cell, edited in place,
 * selected in blocks; the different-keyboard-model sibling of Table, which shares
 * its column and data model but is for reading and acting on records by row.
 *
 * When to use: Use a DataGrid for price lists, inventory, timesheets and admin
 * views over large sets — anything a spreadsheet would otherwise be used for. Set
 * `editable` and mark the columns that may change; give every editable column a
 * `validate`. Do not use it for content read and acted on by row (Table), a
 * handful of fields (Form), or phone-first screens — its keyboard model has no
 * touch equivalent, which is why `selectable="range"` degrades to `"row"` here.
 *
 * There is no grid element on native. Renders a caption (`Heading`, or hidden when
 * `hideCaption`), then a horizontal `ScrollView` (`role="grid"`, the accessible
 * name from `caption`) containing a `FlatList` whose fixed `getItemLayout` comes
 * from `density`'s row-height token, giving virtualization for free; the header
 * row is its `ListHeaderComponent`, sticky whenever the grid is virtualized
 * (`height` is not `"content"`) and gaining `headerShadow` once the body has
 * scrolled beneath it. `columns` order to `pinned: "start"` first, then unpinned,
 * then `pinned: "end"`; native has no `position: sticky` and the package permits no
 * gesture-handler/reanimated dependency for a second synced list, so — like
 * Table's approximation of a sticky row-header column — pinned columns scroll with
 * the rest and only gain `pinnedShadow` once the region has moved horizontally.
 * Resizable columns drag on core `PanResponder` (an allowed dependency-free API),
 * committing `onColumnResize` on release.
 *
 * Each cell's `accessibilityLabel` is "{column}: {value}"; an editable cell adds
 * the hint "double tap to edit" and opens its editor on a single tap, since native
 * has no double-click and Enter/F2 have no hardware-keyboard equivalent on a
 * touchscreen. `checkbox` editors are always live (no separate edit mode);
 * `select` opens a `BottomSheet` with a `Listbox` of `options`; `text`, `number`
 * and (absent a package `DatePicker` to compose — see the gap notes) `date` open
 * an inline `TextInput`, which commits on blur or the hardware Enter key and
 * cancels on the hardware Escape key where one exists (react-native-web, an
 * attached keyboard). A failed `column.validate` keeps the editor open with the
 * message surfaced in the status bar and `cellInvalidBorder`/`cellInvalidBackground`
 * on the cell; a successful edit fires `onCellChange` and waits for `data` to
 * change, reverting visibly if the caller rejects it.
 *
 * `selectable="row"` adds a `Checkbox` select column with select-all
 * (indeterminate when some rows are selected); `"cell"` tracks one active cell and
 * reports it through `onSelectionChange`. Sorting follows Table: a controlled
 * `sort` leaves ordering to the caller; otherwise the grid sorts `data` itself from
 * `defaultSort`, except when `rowCount` is set (server paging, where only the
 * caller's window is ever shown). `rowCount` beyond `data.length` drives
 * `onEndReached` (the platform name for `onRangeNeeded`) as the list nears its end.
 * The status bar doubles as the polite live region for loading, editing and
 * selection state, matching what is shown; sort changes get their own hidden live
 * region, as in Table.
 */
export declare function DataGrid({ caption, hideCaption, columns, data, rowCount, sort, defaultSort, selectable, selected, editable, density, stickyHeader, height, loading, emptyMessage, showStatusBar, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onEndReached, onColumnResize }: DataGridProps): React.JSX.Element;
//#endregion
//#region src/TreeGrid.d.ts
type TreeGridSortDirection = "ascending" | "descending";
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
/** A nested record. `id` must be stable. `children: "lazy"` marks a subtree not yet loaded. */
interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | "lazy" | undefined;
  [key: string]: unknown;
}
/** Controlled sort state; sorts siblings within each level and keeps the hierarchy. */
interface TreeGridSort {
  column: string;
  direction: TreeGridSortDirection;
}
/** A single selected cell, in `selectable="cell"` mode. */
interface TreeGridCellSelection {
  rowId: string;
  column: string;
}
type TreeGridSelection = string[] | TreeGridCellSelection;
/** Payload of a committed edit. */
interface TreeGridCellChange {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TreeGridOverridableBinding = "indent" | "expandButtonSize" | "expandGap" | "guideLine" | "guideLineWidth" | "parentWeight" | "transition";
interface TreeGridProps {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required and carries the indent and expand button; it must come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row whose children load on first expand through `onExpand`. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded (non-lazy) row with children. */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort state; the caller sorts `data`. Applies within each level. */
  sort?: TreeGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself. */
  defaultSort?: TreeGridSort | undefined;
  /** `row` adds a checkbox column and toggles rows; `cell` selects one cell. */
  selectable?: TreeGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a parent sets or clears its own id and every loaded descendant; a parent's shown state derives from its loaded descendants. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` can be edited by tapping them. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: TreeGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true unless `height="content"`. */
  stickyHeader?: boolean | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows; `fixed` uses a fixed height. */
  height?: TreeGridHeight | undefined;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids. */
  onExpandChange?: ((expanded: string[]) => void) | undefined;
  /** Fired with its id each time a row whose `children` is still `"lazy"` is expanded, so a failed load can retry. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TreeGridSort) => void) | undefined;
  /** Fired with the new selection: row ids or one cell. */
  onSelectionChange?: ((selection: TreeGridSelection) => void) | undefined;
  /** Fired when an edit commits, with the new and previous value. The caller updates `data`. */
  onCellChange?: ((change: TreeGridCellChange) => void) | undefined;
  /** Fired when an editor is about to open; return `false` to refuse editing that cell. */
  onEditStart?: ((target: TreeGridCellSelection) => boolean | void) | undefined;
  /** Fired with the column and its new width when a resizable column finishes being dragged. */
  onColumnResize?: ((resize: DataGridColumnResize) => void) | undefined;
}
/**
 * TreeGrid — a DataGrid whose rows nest, the hierarchy carried entirely in the row
 * header column (indent, an expand control, an announced level) while every other
 * column, cell and interaction behaves as DataGrid.
 *
 * When to use: Use a TreeGrid when records nest and each has several comparable
 * fields — a chart of accounts with balances, a bill of materials with quantities.
 * Use `children: "lazy"` for deep or large trees so the first paint is fast, and
 * `selectChildren` when selecting a row means "this and everything in it." Do not
 * use it for a hierarchy with one field per node (Tree) or flat data (DataGrid).
 *
 * There is no grid element on native, so this follows DataGrid's own approximation:
 * a caption (`Heading`, or hidden when `hideCaption`, though the caption always
 * remains the accessible name via `accessibilityLabel`), a horizontal `ScrollView`
 * (`role="grid"`) containing a `FlatList` over the rows visible after collapsing —
 * collapsed subtrees are simply absent from that list, which is also what gets
 * virtualized, so a large collapsed tree costs nothing. The root view exposes
 * `expandAll`/`collapseAll` accessibility actions named from `copy` (there being no
 * hardware `*` key on a touchscreen); each row header cell carries
 * `accessibilityState.expanded` when it has children, an accessibilityLabel of
 * "{name}, {copy.level}, {copy.childCount}" (the only place those two copy strings
 * are used, since the web platform relies on `aria-level`/`aria-setsize` instead),
 * and its own `expand`/`collapse` accessibility actions; a real, minimum-target
 * `Button` (rotating chevron) sits alongside it as a pointer/touch control, since
 * there are no arrow keys to fall back on. Indent is `space.5` per level as leading
 * padding; one full-height guide line per ancestor level is drawn beside it. A
 * `"lazy"` row fires `onExpand` on every expand while still lazy (so a failed load
 * can retry) and shows one placeholder child row reading `copy.loading` until the
 * caller replaces `children`.
 *
 * Sorting orders siblings within each level and keeps the hierarchy; a controlled
 * `sort` leaves ordering to the caller, otherwise the grid sorts `data` itself from
 * `defaultSort`. `selectable="row"` adds a `Checkbox` column; with `selectChildren`,
 * toggling a parent sets or clears itself and every loaded descendant, and a
 * parent's shown state (checked/indeterminate) is derived live from its loaded
 * descendants each render rather than only from its own stored id. `selectable="cell"`
 * tracks one active cell. `editable` columns open the same editors as DataGrid:
 * `checkbox` commits immediately, `select` opens a `BottomSheet` `Listbox`, `text`/
 * `number`/`date` open an inline `TextInput` committing on blur or hardware Enter
 * and cancelling on hardware Escape. The status bar doubles as the polite live
 * region for loading, editing and selection state; sort changes get their own
 * hidden live region.
 */
export declare function TreeGrid({ caption, hideCaption, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable, selected, defaultSelected, selectChildren, editable, density, stickyHeader, height, loading, emptyMessage, showStatusBar, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize }: TreeGridProps): React.JSX.Element;
//#endregion
//#region src/Tree.d.ts
type TreeSelectable = "none" | "single" | "multiple";
/** Heading level for the visible `label`. The schema declares the values as strings; numbers are accepted for ergonomics. Its size is `headingSize` regardless of level. */
type TreeHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A hierarchy entry. `href` makes the node a link (navigation trees); `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`. */
interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNode[] | "lazy" | undefined;
}
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TreeOverridableBinding = "indent" | "rowHeight" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "rowSelectedBorderWidth" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "expandButtonSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
interface TreeProps {
  /** What the tree lists ("Folders", "Categories"). The accessible name; visible only with `showLabel`. */
  label: string;
  /** Show `label` as a heading above the tree. */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /** The hierarchy. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[] | undefined;
  /** Initially expanded ids; `["*"]` for all. */
  defaultExpanded?: string[] | undefined;
  /** `single`: one current node. `multiple`: checkbox selection, cascading to descendants when `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its (loaded) descendants; parents show indeterminate when only some are selected. */
  selectChildren?: boolean | undefined;
  /** With `single`, moving focus to a node (an external keyboard, or assistive-technology navigation) also selects it. Off by default. */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired with the expanded ids. */
  onExpandChange?: ((expanded: string[]) => void) | undefined;
  /** Fired when a `children: "lazy"` node is expanded for the first time, with its id; the caller loads and replaces `children`. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a node is activated by tap; nodes with `href` navigate instead. */
  onActivate?: ((id: string) => void) | undefined;
}
/**
 * Tree — a list that knows about nesting: a file browser's sidebar, a category
 * picker, a documentation site's navigation. One field per node, a chevron to
 * open it, a tap to act on it.
 *
 * When to use: a hierarchy the user navigates or picks from. `single` selection
 * with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a
 * picker (choose folders to sync). Use `TreeGrid` instead when nodes need
 * several comparable fields.
 *
 * There is no `tree`/`treeitem` role on native. Renders an optional `Heading`
 * (`showLabel`) then a `FlatList` (`accessibilityRole="list"`,
 * `accessibilityLabel={label}`) over the flattened visible nodes — collapsing a
 * parent removes its descendants from the list entirely, keeping deep or wide
 * trees cheap until opened. Each row's indent reserves `indent` per level and
 * draws a vertical guide line (`showGuides`) for every open ancestor, aligned
 * with that ancestor's chevron; a `children: "lazy"` node shows one placeholder
 * child in `copy.loading` (and fires `onExpand`) until the caller replaces its
 * children.
 *
 * Every row is a `Pressable` with `accessibilityRole` `"link"` (nodes with
 * `href`, opened through `Linking`) or `"button"` (everything else, calling
 * `onActivate`) — never the `Checkbox` component, so the row stays one hit
 * target. In `none`/`single` mode a tap activates (and, in `single`, selects);
 * `single` also selects as soon as focus reaches the row when `selectOnFocus`
 * is set, since native has no separate "move" and "activate" keys. In
 * `multiple` mode a tap instead toggles selection and a long press activates,
 * so `href` and `onActivate` remain reachable; the row draws its own checkbox
 * glyph (the `checkbox*` bindings, a `check`/`dash` `Icon`) beside the label
 * and reflects `accessibilityState.checked` (`'mixed'` when only some loaded
 * descendants are selected under `selectChildren`). There are no hardware
 * arrow keys, so the chevron `Button` is a real, always-visible touch target,
 * and each row also exposes `expand`/`collapse` `accessibilityActions` for
 * assistive technology. Selection changes in `multiple` mode announce
 * `copy.selectedCount` (`AccessibilityInfo` on iOS, a hidden polite live
 * region on Android).
 */
export declare function Tree({ label, showLabel, headingLevel, nodes, expanded, defaultExpanded, selectable, selected, defaultSelected, selectChildren, selectOnFocus, showGuides, overrides, onSelectionChange, onExpandChange, onExpand, onActivate }: TreeProps): React.JSX.Element;
//#endregion
//#region src/Splitter.d.ts
type SplitterOrientation = "horizontal" | "vertical";
type SplitterStackBelow = "prose" | "content" | "never";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "collapseButtonOffset" | "paneMinTarget" | "transition";
interface SplitterProps {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. */
  primary: React.ReactNode;
  /** The second pane, which takes the remaining space. */
  secondary: React.ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0-100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. Below this the pane collapses instead (when `collapsible`). */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key (accessibility increment/decrement action) increment, percent. */
  step?: number | undefined;
  /** The primary pane can collapse to nothing: drag past the minimum, the separator's activate action, or the collapse button. Activating again restores the last size. */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** When set, the size and collapsed state are remembered per session under this key, so a sidebar stays where it was left across remounts. */
  persistKey?: string | undefined;
  /** Below this layout width a horizontal splitter stacks its panes and the separator becomes inert (a phone has no room for two panes side by side). Ignored when `orientation` is `vertical`, which is already stacked. */
  stackBelow?: SplitterStackBelow | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each accessibility step action, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired once when a drag ends, with the final size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}
/**
 * Splitter — a separator the keyboard (and a pointer, and assistive tech) can move,
 * dividing two panes and reporting how much of the container the primary pane holds.
 *
 * When to use: Use a Splitter when two regions compete for space and the right split
 * depends on the task — a navigation tree beside content, a list beside a detail
 * view. Set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks.
 * Use `collapsible` for sidebars. Do not use it on phone-width layouts (it stacks
 * below `stackBelow`) or for static content that never needs resizing.
 *
 * Renders a `View` row (or column) with the primary pane sized by `flexBasis`
 * percent, a separator `View` carrying a `PanResponder` plus
 * `accessibilityRole="adjustable"`, `accessibilityValue` and `accessibilityActions`
 * (`increment`/`decrement` mapped to `step`, `setMinimum`/`setMaximum` for the
 * keyboard model's Home/End, and — when `collapsible` — `activate` to toggle
 * collapse), and the secondary pane at `flex: 1`. A visible collapse `Button`
 * (`ghost`, `sm`, `iconOnly`) sits on the separator as the primary, always-reachable
 * way to collapse or restore. Dragging updates the size continuously with no
 * transition; collapsing and restoring (by button, activate action, or dragging past
 * `minSize`) animates the primary pane's `flexBasis` over `transition`, skipped under
 * reduced motion. A pane never shrinks below `paneMinTarget` on the drag axis before
 * collapsing. Below `stackBelow` (only meaningful for `orientation="horizontal"`,
 * which is already side by side) the panes stack in source order at full width and
 * the separator is not rendered, per the platform notes. Tab reaches the two panes'
 * content and the separator normally; there is no native equivalent for the keyboard
 * model's F6 pane-cycling convenience, and Home/End/Enter are exposed only as
 * accessibility actions rather than physical key handlers — acknowledged platform
 * limits.
 */
export declare function Splitter({ label, orientation, primary, secondary, size, defaultSize, minSize, maxSize, step, collapsible, collapsed, persistKey, stackBelow, overrides, onSizeChange, onSizeChangeEnd, onCollapseChange }: SplitterProps): React.JSX.Element;
//#endregion
//#region src/Feed.d.ts
/** Heading level for each article's `Heading`. The schema declares the values as strings; numbers are accepted for ergonomics. */
type FeedHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
interface FeedItem {
  id: string;
  /** Names the article, with the actor first ("Ana commented on Invoice 42"). Rendered as a Heading inside the article's Card. */
  heading: string;
  /** ISO timestamp, rendered relative ("3 min ago"). */
  timestamp: string;
  /** The article's body. Keep it to a few lines with a Link to the full thing. */
  content: React.ReactNode;
  /** At most two Buttons, primary first. */
  actions?: React.ReactNode;
  /** Marks an item the user has not seen: a start-edge bar plus a hidden "unread" word. */
  unread?: boolean | undefined;
}
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type FeedOverridableBinding = "itemGap" | "articleInset" | "unreadBorderWidth" | "timestampSize" | "newItemsOffset" | "loadingInset" | "endMessageInset" | "endMessageSize" | "fontFamily";
interface FeedProps {
  /** What the feed contains ("Activity", "Notifications"). Its accessible name. */
  label: string;
  /** Articles, newest first. The feed renders them in the order given; it never re-sorts. */
  items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `onEndReached` as the end approaches. */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is marked busy. */
  loading?: boolean | undefined;
  /** Number of newer items available above. Shows a "Show {count} new" button at the top; the feed never inserts them itself. */
  newItemsCount?: number | undefined;
  /** Heading level for article headings, matching the page outline. Native has no heading levels; this controls only the default typography. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
  endMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the last rendered article is within one screen of view and `hasMore`
   * is set, and once on mount when `items` is empty and not `loading` (so an empty
   * feed fetches its first page itself).
   */
  onEndReached?: (() => void) | undefined;
  /** Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: (() => void) | undefined;
  /** Fired with an item id once it has been substantially visible for a moment (mark as read). */
  onViewableItemsChanged?: ((itemId: string) => void) | undefined;
}
/**
 * Feed — a list that never quite ends: it grows as the reader nears the bottom, and
 * newer items arrive at the top without moving what is on screen.
 *
 * When to use: Use a Feed for a stream of similar, time-ordered items whose total is
 * unknown or large — activity, notifications, comments, audit events. Use
 * `newItemsCount` with `onShowNew` for live streams rather than inserting items while
 * the reader is looking, and `onViewableItemsChanged` to mark things read.
 *
 * Renders a `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={label}`,
 * `accessibilityState={{ busy: loading }}`) of articles, each a `Card` wrapped in a
 * plain `View` that carries the start-edge unread bar and a visually-hidden
 * "unread"/position hint — the wrapper is not itself `accessible` so a Card's
 * composed action `Button`s and any `Link` in `content` stay individually
 * focusable, unlike the single-node grouping the web `role="article"` achieves.
 * `onEndReached` fires `hasMore`'s load request (guarded against firing while
 * already `loading`), once on mount when `items` is empty (there is no last
 * article for `FlatList` to observe, so the first page has to be asked for
 * directly), and again as the reader nears the bottom; `maintainVisibleContentPosition`
 * keeps the reader's place when `onShowNew`'s caller prepends items. The footer is
 * an indeterminate `ProgressBar` or the end message, from `ListFooterComponent`;
 * `ListEmptyComponent` is suppressed while `loading` so the loading indicator is
 * what shows, not `copy.empty`. `newItemsCount > 0` renders a `secondary`/`sm`
 * `Button` above the list rather than inside it, so it never scrolls away.
 */
export declare function Feed({ label, items, hasMore, loading, newItemsCount, headingLevel, endMessage, overrides, onEndReached, onShowNew, onViewableItemsChanged }: FeedProps): React.JSX.Element;
//#endregion
//#region src/ProgressBar.d.ts
type ProgressBarTone = "neutral" | "success" | "danger";
type ProgressBarAnnounce = "none" | "milestones" | "complete";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "transition" | "indeterminateLoop";
interface ProgressBarProps {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`; always the accessible name. */
  label: string;
  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown). */
  value?: number | undefined;
  /** Start of the range. */
  min?: number | undefined;
  /** End of the range. */
  max?: number | undefined;
  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage. */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text beside the label. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening. */
  hideLabel?: boolean | undefined;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal. */
  tone?: ProgressBarTone | undefined;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  announce?: ProgressBarAnnounce | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ProgressBar — answers "how much longer" for a task the interface started and can
 * see through to the end. Give it `value` whenever the total is known; the
 * indeterminate form (omit `value`) is for the stretch before it is.
 *
 * When to use: uploads, downloads, imports, multi-step processing, a wizard's
 * overall completion. Not a measured quantity that can go up or down (Meter), not a
 * value the user sets (Slider).
 *
 * Renders a `View` with `accessibilityRole="progressbar"`, `accessibilityLabel`
 * (the accessible name even when `hideLabel` hides the visible label) and
 * `accessibilityValue={{ min, max, now, text }}` — `now`/`text` are omitted while
 * indeterminate, and `accessibilityState={{ busy: true }}` is set instead, mirroring
 * the web build's `aria-busy`. Inside: an optional label row (`Text` label and, when
 * determinate and `showValue`, a `Text` value) and a track `View` holding an
 * `Animated.View` fill. The fill's pixel width animates to the value's fraction of
 * the range over `transition` (`useNativeDriver: false`), snapping under reduced
 * motion. Indeterminate: a one-third-width fill sweeps the track on an `Animated.loop`
 * over `indeterminateLoop`; under reduced motion the sweep is replaced by a static,
 * full-width fill at `opacity.disabled`. `AccessibilityInfo.announceForAccessibility`
 * fires `copy.indeterminate` once on becoming indeterminate, `copy.progress` at each
 * 25/50/75% milestone when `announce="milestones"`, and `copy.complete` once on
 * reaching `max`, all gated on `announce !== 'none'`; the milestone and completion
 * state resets whenever the value moves backward, so a retried task announces again.
 * A non-finite `value` counts as `min`; if `max <= min` the track renders empty and a
 * warning is logged in development.
 */
export declare function ProgressBar({ label, value, min, max, formatValue, showValue, hideLabel, tone, announce, overrides }: ProgressBarProps): React.JSX.Element;
//#endregion
//#region src/Stepper.d.ts
type StepperOrientation = "horizontal" | "vertical";
type StepperNavigable = "none" | "completed" | "all";
type StepperStepStatus = "complete" | "current" | "upcoming" | "error";
/** One step. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
type StepperStep = {
  id: string;
  label: string;
  description?: string | undefined;
  status?: StepperStepStatus | undefined;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorBorderWidth" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "connectorWidth" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "stepHover" | "stepRadius" | "stepGap" | "partGap" | "fontFamily" | "transition";
interface StepperProps {
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /** The steps in order. */
  steps: StepperStep[];
  /** The id of the current step. */
  current: string;
  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /** Which steps are Pressables: `none` (display only), `completed` steps (the usual — you can go back, not skip ahead), or `all` (a settings-style flow where order does not matter). */
  navigable?: StepperNavigable | undefined;
  /** Show only the current step's label and "Step 2 of 5"; the indicators stay. Automatic on narrow viewports for horizontal steppers. Has no effect on `vertical`. */
  compact?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
}
/**
 * Stepper — a map of a journey with a "you are here". It sets expectations, shows
 * progress without a bar, and gives people a way back to a step they finished.
 * Navigation, not a form control.
 *
 * When to use: Use a Stepper for a flow with three to about seven ordered steps that
 * each fit on a screen: checkout, account setup, a report builder. Vertical with
 * descriptions for flows that need explanation; horizontal for short, familiar ones.
 * Leave `navigable="completed"` so people can correct earlier answers without losing
 * later ones. Do not use it for two steps, for more than about eight, as Tabs, or to
 * show task progress (ProgressBar).
 *
 * Renders a `View` with `accessibilityRole="list"` and `accessibilityLabel`. Each
 * step is its own `Pressable` (navigable) or `View` (inert) carrying an
 * `accessibilityLabel` built from `copy.stepLabel` plus the status word, and
 * `accessibilityState.selected` for the step whose id matches `current` — not
 * necessarily the one whose derived/overridden `status` is `"current"`, since an
 * explicit `status: "error"` on the current step still needs to read as "here" to
 * assistive technology while showing the danger indicator. Complete steps show the
 * system `Icon` (`check`), error steps show `danger`; both are decorative — the
 * meaning is carried by the accessible name and the visually-adjacent status word.
 * Connectors are separate decorative `View`s between steps that cross-fade from
 * `connector` to `connectorComplete` over `transition` with `motion.easing.standard`
 * (skipped under reduced motion) as the step before them completes; the indicator
 * itself switches instantly since it has four discrete states rather than one
 * progress value. `navigable="completed"` means every step before `current` by
 * position, including one marked `error`. Below `layout.maxWidth.prose` a horizontal
 * stepper automatically behaves as `compact`, same as the explicit prop.
 */
export declare function Stepper({ label, steps, current, orientation, navigable, compact, overrides, onStepSelect }: StepperProps): React.JSX.Element;
//#endregion
//#region src/Search.d.ts
type SearchSize = "md" | "lg";
/** One row offered under the field while typing. */
type SearchSuggestion = {
  value: string;
  label: string;
  description?: string | undefined;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SearchOverridableBinding = "borderFocus" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockLg" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "popupSurface" | "popupBorder" | "popupRadius" | "popupShadow" | "partGap" | "disabledOpacity";
interface SearchProps {
  /** Accessible name ("Search products"). Visually hidden unless `showLabel`. */
  label: string;
  /** Show the label above the field, as on a search page rather than in a header. */
  showLabel?: boolean | undefined;
  /**
   * Field name; the query key a web form submits to `action`. Has no runtime effect
   * on this platform, which has no navigable forms — kept for API parity.
   */
  name?: string | undefined;
  /** Controlled query. */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label. */
  placeholder?: string | undefined;
  /**
   * URL a web form submits to with GET. Has no runtime effect on this
   * platform — there is no navigation to perform — kept for API parity.
   */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field. Provide
   * them from `onChange` (debounced by the caller). Setting this at all — even to an
   * empty array — turns on suggestions mode.
   */
  suggestions?: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /** Wrap in the `search` Landmark. Turn off when nested inside another search landmark. */
  landmark?: boolean | undefined;
  /** `lg` for a search page's hero field. */
  size?: SearchSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every keystroke with the query. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. Never fires for an empty query. */
  onSubmit?: ((value: string) => void) | undefined;
  /** Fired when the clear button, or an Escape that empties the field, clears the query. */
  onClear?: (() => void) | undefined;
}
/**
 * Search — a field shaped so nobody has to read a label: a magnifier glyph, a pill,
 * a clear button, and submission on Enter like every search field people have used.
 *
 * When to use: Use for free-text search over a site, an app, or a large dataset.
 * Add `suggestions` when the backend can offer completions; keep `landmark` on for
 * the one primary search so screen-reader users can jump to it. Do not use it for a
 * field with a specific expected value (Input) or for choosing from a known list
 * (Select, Combobox).
 *
 * Renders a `TextInput` (`returnKeyType="search"`, `accessibilityRole="search"`)
 * preceded by a decorative `search` Icon, with the system clear `Button` shown once
 * there is text and a submit `Button` always rendered. `landmark` wraps the whole
 * field in the composed `Landmark` (`role="search"`) rather than a hand-rolled
 * `accessibilityRole`. Setting `suggestions` — even to an empty array — opens an
 * inline `Listbox` (`embedded`) below the field on focus (there is no overlay on a
 * phone: the list takes the space under the field); choosing a row fills the query
 * with its label and submits it. A debounced, doubly-announced (inline live region
 * for Android, `AccessibilityInfo.announceForAccessibility` for iOS) status reports
 * the suggestion count or `copy.loading`. Escape (reachable via a hardware keyboard
 * or react-native-web; on-screen keyboards do not emit it) closes the suggestions
 * when open, otherwise clears the field and fires `onClear`, matching the clear
 * button's own behavior. The query never submits empty. `disabled` dims the whole
 * group with `disabledOpacity` and blocks the field and both buttons.
 */
export declare function Search({ label, showLabel, name, value, defaultValue, placeholder, action, suggestions, loading, landmark, size, disabled, overrides, onChange, onSubmit, onClear }: SearchProps): React.JSX.Element;
//#endregion
//#region src/DatePicker.d.ts
type DatePickerSize = "sm" | "md";
/** A single ISO date, or a `{ start, end }` pair of them when `range` is set. Never a `Date`: a calendar date has no time zone. */
type DatePickerValue = string | {
  start: string;
  end: string;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DatePickerOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "calendarInset" | "calendarGap" | "daySize" | "dayGap" | "dayRadius" | "dayHover" | "dayTodayBorderWidth" | "weekdaySize" | "weekdayWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "minTargetSm" | "disabledOpacity" | "transition";
interface DatePickerProps {
  /** Visible label ("Start date", "Date of birth"). Also the input's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. A range registers two fields, `name` and `name-end`. */
  name: string;
  /** Controlled value (ISO date, or a range). */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /** Controlled calendar state, for programmatic use and for stories and tests. Omit for the button-driven default. */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden. */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /** BCP 47 locale for month/weekday names, the first day of the week, and the typed format. Defaults to the device locale. */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with `undefined` when cleared. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * DatePicker — two ways to say the same date: type it, or find it on a calendar.
 * Both produce a plain ISO date (or a `{ start, end }` range), never a timestamp.
 *
 * When to use: Use for any date the user chooses — due dates, bookings, dates of
 * birth, report periods (`range`). Set `min`/`max` and `isDateDisabled` whenever they
 * exist so the calendar shows what is possible instead of validating after the fact.
 * Do not use it for a date-and-time, a month/year alone (Select), or relative choices.
 *
 * Renders the `TextInput`(s) (locale pattern, `keyboardType="number-pad"`) and a
 * ghost, icon-only calendar `Button` that opens a `BottomSheet` (there is no core
 * native date picker) holding: a header of prev/next `Button`s and month/year
 * `Select`s (`hideLabel`, `size: sm`); a 7-column grid of day `Pressable`s
 * (`accessibilityRole="button"`, `accessibilityState={{ selected, disabled }}`,
 * `accessibilityLabel` from the full formatted date plus "today"/"selected"); and a
 * footer of Today/Clear `Button`s. The month is announced
 * (`AccessibilityInfo.announceForAccessibility`) when it changes. Typing parses the
 * locale pattern leniently and fires `onChange` only once a value is complete;
 * selecting a day closes the sheet for a single date, or sets the start then the end
 * for a range (picking before the start restarts). Escape and the Android back
 * gesture close the sheet without changing the value (`BottomSheet`'s own
 * `onRequestClose`/dismiss handling); `ArrowDown` opens the calendar from the input
 * when a hardware keyboard or react-native-web supplies key events — on-screen
 * keyboards do not. Validation follows `error` → `required` → unparseable
 * (`copy.invalid`) → `tooEarly` → `tooLate` → `rangeOrder`. `size: sm` swaps padding
 * and the target height floor for their `Sm` bindings and the field text to
 * `font.size.sm`; the calendar `Button` becomes `size: sm` too. `disabled` dims the
 * whole label/description/field/error group with `disabledOpacity`.
 */
export declare function DatePicker({ label, name, value, defaultValue, open: openProp, range, min, max, isDateDisabled, locale, showWeekNumbers, placeholder, description, required, hideLabel, size, disabled, error, overrides, onChange, onOpenChange }: DatePickerProps): React.JSX.Element;
//#endregion
export type { AccordionHeadingLevel, AccordionItem, AccordionOpenChangeReason, AccordionOverridableBinding, AccordionProps, AccordionValue, ActionSheetAction, ActionSheetActionTone, ActionSheetCloseReason, ActionSheetOverridableBinding, ActionSheetProps, AlertDialogCancelReason, AlertDialogOverridableBinding, AlertDialogProps, AlertDialogTone, AlertLive, AlertOverridableBinding, AlertProps, AlertTone, BottomSheetCloseReason, BottomSheetHeight, BottomSheetOverridableBinding, BottomSheetProps, BoxInset, BoxOverridableBinding, BoxProps, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbOverridableBinding, BreadcrumbProps, ButtonOverridableBinding, ButtonProps, ButtonSize, ButtonTrackEvent, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardProps, CardSurface, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CarouselProps, CarouselSlideProps, CheckboxOverridableBinding, CheckboxProps, ComboboxFilter, ComboboxOverridableBinding, ComboboxProps, ComboboxValue, ContainerAlign, ContainerGutter, ContainerOverridableBinding, ContainerProps, ContainerWidth, DataGridCellChange, DataGridCellSelection, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridColumnResize, DataGridDensity, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridProps, DataGridRangeNeeded, DataGridRangeSelection, DataGridRow, DataGridSelectable, DataGridSelection, DataGridSort, DataGridSortDirection, DatePickerOverridableBinding, DatePickerProps, DatePickerSize, DatePickerValue, DialogCloseReason, DialogInitialFocus, DialogOverridableBinding, DialogProps, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureProps, DisclosureToggleReason, DividerOrientation, DividerOverridableBinding, DividerProps, DividerSpacing, FeedHeadingLevel, FeedItem, FeedOverridableBinding, FeedProps, FieldsetContextValue, FieldsetGap, FieldsetOverridableBinding, FieldsetProps, FocusScopeAutoFocus, FocusScopeEscapeDirection, FocusScopeProps, FormContextValue, FormFieldHandle, FormFieldValue, FormOverridableBinding, FormProps, FormValidateMode, FormValues, HeadingLevel, HeadingOverridableBinding, HeadingProps, HeadingSize, IconName, IconOverridableBinding, IconProps, IconSize, InputOverridableBinding, InputProps, InputSize, InputType, LandmarkProps, LandmarkRole, LinkOverridableBinding, LinkProps, LinkTone, ListboxGroup, ListboxItem, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxProps, ListboxValue, MenuAction, MenuGroup, MenuItem, MenuItemTone, MenuOpenChangeReason, MenuOverridableBinding, MenuPlacement, MenuProps, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterProps, MeterTone, NumberInputFormat, NumberInputOverridableBinding, NumberInputProps, NumberInputSize, PopoverCloseReason, PopoverHeadingLevel, PopoverOverridableBinding, PopoverPlacement, PopoverProps, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarProps, ProgressBarTone, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, RadioGroupProps, SearchOverridableBinding, SearchProps, SearchSize, SearchSuggestion, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlProps, SegmentedControlSize, SelectNative, SelectOverridableBinding, SelectProps, SelectSize, SelectValue, SidePanelCloseReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelProps, SidePanelRole, SidePanelSide, SidePanelWidth, SliderMark, SliderOverridableBinding, SliderProps, SliderShowValue, SliderValue, SplitterOrientation, SplitterOverridableBinding, SplitterProps, SplitterStackBelow, StackAlign, StackDirection, StackGap, StackJustify, StackOverridableBinding, StackProps, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperProps, StepperStep, StepperStepStatus, SwitchLabelPosition, SwitchOverridableBinding, SwitchProps, TabPanelProps, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnWidth, TableDensity, TableHideBelow, TableMaxHeight, TableOverridableBinding, TableProps, TableResponsive, TableRow, TableSelectable, TableSort, TableSortDirection, TabsActivation, TabsFit, TabsOrientation, TabsOverridableBinding, TabsProps, TabsTab, TextAlign, TextOverridableBinding, TextProps, TextSize, TextStyleContextValue, TextTone, TextWeight, Theme, ThemeMode, ThemeModeSetting, ThemeProviderProps, ToastContextValue, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastProps, ToastProviderProps, ToastTone, Tokens, ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarProps, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TooltipProps, TreeGridCellChange, TreeGridCellSelection, TreeGridDensity, TreeGridHeight, TreeGridOverridableBinding, TreeGridProps, TreeGridRow, TreeGridSelectable, TreeGridSelection, TreeGridSort, TreeGridSortDirection, TreeHeadingLevel, TreeNode, TreeOverridableBinding, TreeProps, TreeSelectable, UseSidePanelEdgeSwipeOptions };
//# sourceMappingURL=index.d.ts.map