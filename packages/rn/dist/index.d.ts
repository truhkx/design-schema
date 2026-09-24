import * as React from "react";
import { EasingFunction, GestureResponderEvent, PanResponderInstance, PressableProps, TextInstance, TextStyle, View, ViewInstance } from "react-native";
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
 * Whether the person has asked the OS to reduce motion, so components can skip `Animated`
 * transitions and set their final value directly. On web it is known synchronously for the
 * first render — an entrance animation that plays once before an asynchronous answer arrives
 * is motion the person asked not to see. Native resolves asynchronously (assume `false` until
 * then). Both follow later changes.
 */
export declare function useReducedMotion(): boolean;
//#endregion
//#region src/Button.d.ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ButtonOverridableBinding = "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "inverseBackgroundHover" | "inverseHoverOpacity" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerSize";
interface ButtonProps {
  /**
   * The button's text. Also its accessible name. An empty string is allowed and warns
   * nowhere: it renders a nameless button, and nothing enforces WCAG 4.1.2 at runtime.
   */
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
  /**
   * Prevents activation. The button stays in the focus order and is announced as disabled;
   * a blocked press fires neither `onPress` nor tracking. ORed with the enclosing Form's `disabled`.
   */
  disabled?: boolean | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. Decorative, like `leadingIcon`. */
  trailingIcon?: React.ReactNode;
  /**
   * Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not rendered
   * either. `label` is still required and becomes the accessible name. Padding becomes equal
   * on all sides: paddingInline takes the resolved paddingBlock (`space.sm`), so a
   * `paddingInline` override has no effect while `iconOnly`.
   */
  iconOnly?: boolean | undefined;
  /**
   * Shows a ring spinner in the leading icon slot (whether or not `leadingIcon` is set;
   * for `iconOnly` it replaces the sole glyph), hides `trailingIcon`, keeps the label
   * visible, and blocks repeat activation while an action is pending. `copy.loading` is
   * announced as the accessibility value beside `busy`, never as part of the name.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, tooltip-like panels). Only `ghost`
   * changes its fill there: its text switches to `color.inverse.link` and its pressed
   * fill to `color.inverse.foreground` at `opacity.disabled × 0.25`. Every variant's
   * focus ring switches to `color.inverse.focus`, since that ring must read against the
   * inverse surface regardless of the button's own fill.
   */
  inverse?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort
   * by Amount, ascending" on a header that shows "Amount"). The name must contain the
   * visible label (WCAG 2.5.3 label-in-name); starting with it is preferred. Maps to
   * `accessibilityLabel`.
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
  /** The root `Pressable`, so a parent can measure or focus the button. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Supplementary description, forwarded verbatim to the root; Tooltip sets it when it describes the button. */
  accessibilityHint?: string | undefined;
  /** Set by a parent (Tooltip, when its content *is* the name) to replace the name the label would give. `accessibleName` still wins. */
  accessibilityLabel?: string | undefined;
  /** Fired when the button is activated by touch, keyboard, or assistive technology. */
  onPress?: (() => void) | undefined;
  /** Fired after `onPress` with the `track` name and the button's label, only when `track` is set. */
  onTrack?: ((name: string, label: string) => void) | undefined;
  /** Forwarded to the root so Tooltip can attach to the button; the button's own pressed state is kept alongside. */
  onPressOut?: PressableProps["onPressOut"];
  /** Forwarded to the root so Tooltip can open on long press. */
  onLongPress?: PressableProps["onLongPress"];
  /** Forwarded to the root (react-native-web pointer only). */
  onHoverIn?: PressableProps["onHoverIn"];
  /** Forwarded to the root (react-native-web pointer only). */
  onHoverOut?: PressableProps["onHoverOut"];
  /** Forwarded to the root; the button's own focus-ring state is kept alongside. */
  onFocus?: PressableProps["onFocus"];
  /** Forwarded to the root; the button's own focus-ring state is kept alongside. */
  onBlur?: PressableProps["onBlur"];
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
 * (`accessibleName`, else a name set by a parent, else `label`) and
 * `accessibilityState={{ disabled, busy, expanded }}` (`expanded` omitted unless a
 * disclosing parent sets it), mirrored to `aria-busy`/`aria-expanded` (and, on
 * react-native-web, `aria-disabled` set on the DOM node) because react-native-web renders
 * only the aria-* forms. `disabled` is never passed to `Pressable` itself — that
 * would drop it from the tab order — so a disabled button stays focusable and is
 * announced as disabled while a press guard blocks `onPress`. There is no hover on
 * touch, so `backgroundHover` animates in for the pressed state instead (over
 * `transition`, eased with `motion.easing.standard`, skipped under reduced motion); the
 * focus ring is a border drawn in `color.border.focus` (or `color.inverse.focus` when
 * `inverse`) that is transparent, not absent, so focusing never shifts layout.
 * `loading` puts a `spinnerSize` ring spinner in the leading icon slot that rotates
 * continuously over `loadingSpin` (frozen under reduced motion), hides `trailingIcon`,
 * keeps the label visible, announces `copy.loading` as the button's accessibility
 * value, and blocks repeat activation alongside `disabled`. `inverse` changes only
 * `ghost`'s foreground and pressed fill (`inverseBackgroundHover` at
 * `inverseHoverOpacity`, an alpha of the resolved color); other variants keep their own fills.
 * `type="submit"` calls `submit()` on the nearest Form context, since there is no
 * native form. `track`, when set, calls the hand-written `trackPress(name, label)`
 * after `onPress` and before `onTrack(name, label)` fires with the same pair. When the measured
 * footprint is smaller than the comfortable target, `hitSlop` makes up the difference.
 * `accessibilityHint`, `accessibilityLabel`, `onHoverIn`, `onHoverOut`, `onFocus`,
 * `onBlur`, `onLongPress` and `onPressOut` are forwarded to the root so Tooltip can
 * attach to the button. `leadingIcon`/`trailingIcon` render in decorative wrappers
 * (`accessibilityElementsHidden`, `importantForAccessibility="no"`); there is no
 * cascade, so callers color glyphs with the variant's foreground themselves.
 */
export declare function Button({ label, variant, size, type, expanded, disabled, leadingIcon, trailingIcon, iconOnly, loading, inverse, accessibleName, track, overrides, ref, accessibilityHint, accessibilityLabel, onPress, onTrack, onPressOut, onLongPress, onHoverIn, onHoverOut, onFocus, onBlur }: ButtonProps): React.JSX.Element;
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `color` is locked — the tone colors are contrast-checked against
 * the page background, so it is not overridable and is ignored if passed.
 */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
interface TextProps {
  /** The text content. Inline formatting (nested Text) is allowed; block elements are not. */
  children: React.ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /**
   * Semantic color. `onAction` is only for text placed on an action background. There is no
   * `inverse` tone: a surface with its own foreground provides `TextForegroundContext`, which
   * applies only while `tone` is `default`.
   */
  tone?: TextTone | undefined;
  /**
   * Horizontal alignment. `start`/`end` follow writing direction, resolved through
   * `I18nManager.isRTL` at render; a direction change mid-session does not re-align text
   * already on screen.
   */
  align?: TextAlign | undefined;
  /**
   * Clip to one line with an ellipsis (`numberOfLines={1}`, `ellipsizeMode="tail"`). Screen
   * readers still read the full text; native has no affordance that reveals the rest to
   * sighted users — a known gap.
   */
  truncate?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `Text`, for measurement or accessibility focus. */
  ref?: React.Ref<TextInstance> | undefined;
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
 *
 * `a11y.role: generic` has no native counterpart, so no `accessibilityRole` is
 * set. Weight tokens snap to the nearest hundred and lineHeight × fontSize rounds
 * to a whole pixel, so a theme weight of 550 or a fractional line height lands on
 * the nearest step.
 *
 * Native has no equivalent of web's `title`, so a truncated string has no
 * sighted affordance to reach the rest of it — screen readers still read it in
 * full. Keep truncated copy short enough that the visible line carries the
 * meaning.
 */
export declare function Text({ children, size, weight, tone, align, truncate, overrides, ref }: TextProps): React.JSX.Element;
//#endregion
//#region src/Heading.d.ts
/** Position in the document outline. The canonical values are strings; the `level` prop also accepts the number. */
type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `color` is locked — heading text is contrast-checked at AAA
 * against the page background, so it is not overridable and is ignored if passed.
 */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
interface HeadingProps {
  /**
   * Position in the document outline. On React Native this controls only the default
   * typography — iOS and Android have no heading levels, so the header trait is set
   * regardless of level. Document the outline in the screen's design instead. A missing,
   * out-of-range or non-numeric level is treated as `2` (the 3xl default size) and warns
   * once per element in development.
   */
  level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size, independent of level. Defaults per level: 1 → 4xl, 2 → 3xl, 3 → 2xl, 4 → xl, 5 → lg, 6 → md. */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: React.ReactNode;
  /** Horizontal text alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `Text`, for measurement or accessibility focus. */
  ref?: React.Ref<TextInstance> | undefined;
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
 * Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size
 * only; VoiceOver and TalkBack expose the header trait but not a level, so there is
 * no outline to navigate on native — document it in the screen's design. Do not
 * simulate levels with `accessibilityLabel` prefixes like "Heading level 2"; it is
 * noisy and non-standard.
 *
 * `marginBlockEnd` is the one margin the system allows, because a heading owns the
 * gap to its own first paragraph; it maps to `marginBottom`, since React Native has
 * no logical margins.
 */
export declare function Heading({ level, size, children, align, overrides, ref }: HeadingProps): React.JSX.Element;
//#endregion
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`background`, `foreground`, `placeholder`,
 * `border`, `borderFocus`, `errorText`, `descriptionText`, `minTarget`, `minTargetSm`,
 * `focusRingWidth`) carry contrast or target guarantees and are not in the union.
 */
type InputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "disabledOpacity" | "transition";
interface InputProps {
  /** Visible label (not rendered with `hideLabel`, where it survives only as the accessible name). Never replaced by a placeholder. */
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
  /** Input type. Drives `keyboardType`, `textContentType` and `secureTextEntry`. */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label as `copy.requiredIndicator`, not only by color. */
  required?: boolean | undefined;
  /** Not editable and not submitted. Stays visible and readable; on native it is not focusable (see the component note). */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. An empty string counts as unset. */
  error?: string | undefined;
  /** Do not render the label Text. `label` stays the accessible name. Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: InputSize | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root group `View`, so a parent can measure the field group. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Supplementary description, appended after `description` on the field's hint; Tooltip sets it when it describes the field. */
  accessibilityHint?: string | undefined;
  /** Set by a parent (Tooltip, when its content *is* the name) to replace the name `label` would give. */
  accessibilityLabel?: string | undefined;
  /** Fired on every value change with the new string value, and nothing else. */
  onChangeText?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. Called with no arguments, not the focus event. */
  onFocus?: (() => void) | undefined;
  /** Fired when the field loses focus — the usual moment to validate. Called with no arguments. */
  onBlur?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can attach (react-native-web pointer only; maps to `onPointerEnter`). */
  onHoverIn?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can attach (react-native-web pointer only; maps to `onPointerLeave`). */
  onHoverOut?: (() => void) | undefined;
  /** Forwarded to the field; also cancels a pending synthetic long press. */
  onPressOut?: (() => void) | undefined;
  /** Forwarded to the field so Tooltip can open on long press. TextInput has none, so it is timed from `onPressIn`. */
  onLongPress?: (() => void) | undefined;
}
/**
 * Input — collects a single line of text.
 *
 * When to use: Use Input for names, emails, passwords, search terms, and short
 * free-text values. Choose `type` for the value so the touch keyboard matches.
 * Provide `description` when the format matters ("Use the email you signed up
 * with"). Do not use `placeholder` as the label; it vanishes as soon as the user
 * types.
 *
 * Renders a group `View` (`testID="Input"`) holding the label, description, the
 * `TextInput` and the error message, separated by `partGap`. There is no label
 * element on native: `label` is rendered as the system `Text` at `weight="medium"`
 * and is also the field's `accessibilityLabel`, and `description` becomes its
 * `accessibilityHint` (a hint forwarded by a parent is appended after it, joined
 * with a space; a forwarded `accessibilityLabel` replaces the name outright). A
 * Fieldset legend still prefixes the name ("Shipping address, Street").
 * `hideLabel` drops the label Text entirely, so the `label` part has no native
 * home while hidden and the name lives only in `accessibilityLabel`.
 *
 * `required` appends `copy.requiredIndicator` to the visible label and to the
 * accessible name — there is no required accessibility state on native. The error
 * is announced through `accessibilityLiveRegion` (Android) and
 * `AccessibilityInfo.announceForAccessibility` (iOS) rather than `role="alert"`,
 * and both are suppressed inside a Form that renders its own error summary.
 *
 * `disabled` uses `editable={false}` with `accessibilityState.disabled`: iOS
 * cannot keep a non-editable TextInput focusable, so a disabled field is not
 * focusable on native and the state is announced instead. react-native-web drops
 * `accessibilityState`, so it is mirrored as `aria-disabled` on both the TextInput
 * and the group View that carries `disabledOpacity` — the group is what makes a
 * web accessibility checker treat the dimmed label and value as disabled.
 *
 * The field's border *is* its focus ring: on focus it widens to `focusRingWidth`
 * in `color.border.focus` while the padding shrinks by the difference so nothing
 * shifts, and when the field is both invalid and focused the danger color stays so
 * the error is never hidden by focus. Native swaps the border instantly, so the
 * `transition` binding is accepted for parity with web and has no effect here.
 *
 * Inside a Form the field registers by `name`, submits its string value, and takes
 * `returnKeyType`/`onSubmitEditing` from the Form's field order (next field, or
 * submit on the last). Validation precedence is `error`, then `required`
 * (`copy.required`), then `invalid` (`copy.invalid`); the error slot shows `error`,
 * else the Form's message for this field, else — only while invalid — the derived
 * copy, so an untouched empty required field flags nothing.
 *
 * TextInput has no hover or long-press handlers: `onHoverIn`/`onHoverOut` map to
 * `onPointerEnter`/`onPointerLeave`, and `onLongPress` is timed from `onPressIn`
 * over `longPressDelay` unless `onPressOut` comes first.
 */
export declare function Input({ label, name, value, defaultValue, placeholder, description, type, required, disabled, invalid, error, hideLabel, size, overrides, ref, accessibilityHint, accessibilityLabel, onChangeText, onFocus, onBlur, onHoverIn, onHoverOut, onPressOut, onLongPress }: InputProps): React.JSX.Element;
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
type NumberInputSize = "sm" | "md";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type NumberInputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "stepperGap" | "stepperDivider" | "stepperDividerWidth" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
interface NumberInputProps {
  /** Visible label. Also the field's `accessibilityLabel`. */
  label: string;
  /**
   * Field name for the Form. The value registers as its plain decimal string (`String(value)`: "." decimal,
   * no grouping, symbol or affixes); an empty or disabled field registers nothing. Parse it back with `Number()`.
   */
  name: string;
  /** Controlled numeric value: `null` is a controlled empty field, `undefined` means uncontrolled (`defaultValue` applies). */
  value?: number | null | undefined;
  /** Initial value. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons, arrow keys and accessibility actions. Values never snap to multiples of it. */
  step?: number | undefined;
  /** Decimal places to keep and display (a whole number). Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via `Intl.NumberFormat`. The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour). An unknown unit is shown as `trailingText` when none is given. */
  unit?: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. Ignored under `format: currency`. */
  leadingText?: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit` is not a valid Intl unit. */
  trailingText?: string | undefined;
  /** Hide the increment/decrement buttons. Arrow keys and the accessibility actions work regardless. */
  hideSteppers?: boolean | undefined;
  /** Example value shown while empty. */
  placeholder?: string | undefined;
  /** Helper text. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (label, description, field and error group). */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChangeText?: ((value: number | undefined) => void) | undefined;
}
/**
 * NumberInput — a number people type exactly, with step buttons and adjustable
 * accessibility actions for the small adjustments, and locale formatting so 1,234.5
 * reads the way the user expects.
 *
 * When to use: quantities, amounts, measurements, ages, counts. Choose `format` so
 * the field reads as the thing it holds; set `min`, `max` and `step` whenever they
 * exist. Not for identifiers made of digits (phone numbers, postal codes), which are
 * Input.
 *
 * Renders Input's group (label, description, field, error) where the field is a
 * bordered row: optional leading text, a `TextInput`, optional trailing text and,
 * unless `hideSteppers`, two system `Button`s (ghost, sm, iconOnly, minus/plus) behind a
 * hairline. The `TextInput` has `accessibilityRole="adjustable"`, `accessibilityValue`
 * whose text is the formatted value with its affixes ("2 kg"), and increment/decrement
 * accessibility actions, so the affix parts are hidden from assistive technology; the
 * steppers stay in it, labelled, because hiding a tappable Button is an
 * `aria-hidden-focus` violation. They step once per tap and disable at the bounds. While focused the
 * field shows what was typed; on blur or Enter the value is rounded to `precision`,
 * clamped to `min`/`max` (reporting `copy.outOfRange`, `outOfRangeMin` or `outOfRangeMax`
 * until the next keystroke or step when the clamp changed it) and shown through
 * `Intl.NumberFormat`. Committed text with no digits ("-") reports `copy.invalid`. On a
 * hardware keyboard that reports them (and on react-native-web), ArrowUp/Down step,
 * PageUp/Down step by ten and Home/End jump to a defined bound; iOS generally delivers
 * none of these, and the adjustable actions are the stepping path there. Enter inside a
 * Form submits it. `format: percent` stores the number as typed and divides by 100 for
 * display; `format: currency` without `currency` warns under `__DEV__` and uses USD, and
 * ignores `leadingText`; an unknown `unit` formats as a plain decimal with the unit shown
 * as trailing text. Inside a Fieldset the group's `disabled` and legend apply.
 * `disabled` dims the label, description, input and affixes with `disabledOpacity`; the
 * stepper Buttons dim through their own disabled style.
 */
export declare function NumberInput({ label, name, value, defaultValue, min, max, step, precision, format, currency, unit, leadingText, trailingText, hideSteppers, placeholder, description, required, hideLabel, size, disabled, invalid, error, overrides, ref, onChangeText }: NumberInputProps): React.JSX.Element;
//#endregion
//#region src/FormContext.d.ts
/** When field-level validation runs. Mirrors Form's `validate` prop. */
type FormValidateMode = "submit" | "blur" | "change";
/**
 * What one field contributes on submit: a string (Input, RadioGroup, a checked
 * Checkbox's `value`), a number (NumberInput, Slider), a boolean (Switch), an array
 * of strings (a multi-select Listbox, Select or Combobox), a number pair (a range
 * Slider or DatePicker), or `undefined` for an unchecked Checkbox, an unselected
 * RadioGroup, an empty or a disabled field, which is then left out of the collected values.
 */
type FormFieldValue = string | number | boolean | string[] | [number, number] | undefined;
/** The values `onSubmit` receives, keyed by field name. */
type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;
/** What a field (Input, Checkbox, Switch, RadioGroup) registers with the enclosing Form. */
interface FormFieldHandle {
  /** The field's visible label, which the error summary shows when the field is invalid with an empty message. */
  label?: string | undefined;
  /** Current value of the field. `undefined` means "contributes nothing". */
  getValue(): FormFieldValue;
  /**
   * Whether the field is disabled right now. A disabled field stays registered and reports
   * `true` here; the Form leaves it out of the collected values, out of validation and out
   * of `order`, so the previous field's "next" key skips past it. Absent means enabled.
   */
  isDisabled?(): boolean;
  /** Returns an error message when the field is invalid, otherwise `null`. */
  validate(): string | null;
  /** Moves keyboard and accessibility focus to the field. */
  focus(): void;
}
interface FormContextValue {
  /** Registers a field by `name`. Registration (mount) order is the field order. */
  register(name: string, handle: FormFieldHandle): void;
  /** Removes a field on unmount. A field that is merely disabled stays registered and reports `isDisabled()`. */
  unregister(name: string): void;
  /** Validates every field and fires `onSubmit` or `onInvalid`. */
  submit(): void;
  /** Moves focus to the named field, if registered. Used by the keyboard's "next" key. */
  focusField(name: string): void;
  /** Reports the result of a `blur`/`change` validation run for one field. */
  reportValidity(name: string, error: string | null): void;
  /** `true` when the Form is disabled; every field and action inside follows. */
  disabled: boolean;
  /**
   * The Form's `validate` setting, reported as `change` once a submission has failed so
   * fields that read only this keep re-validating as they are fixed.
   */
  validateMode: FormValidateMode;
  /**
   * `true` from a failed submission until a successful one. A field validates on blur when
   * `validateMode` is `blur` or this is true, and on change when `validateMode` is `change`
   * or this is true.
   */
  submitFailed: boolean;
  /** Whether the Form renders (and announces) its own error summary. */
  errorSummary: boolean;
  /** Errors from the most recent validation, keyed by field name. */
  errors: Readonly<Partial<Record<string, string | undefined>>>;
  /**
   * Field names in registration order, disabled fields left out; the last one gets
   * `returnKeyType="done"` and every earlier one `"next"` (`focusField`).
   */
  order: readonly string[];
}
/** `null` outside of a Form so Button and Input work standalone. */
export declare const FormContext: React.Context<FormContextValue | null>;
export declare function useFormContext(): FormContextValue | null;
//#endregion
//#region src/Form.d.ts
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `errorSummaryText` and `errorSummaryBackground` are locked — they
 * carry the summary's contrast pair — and are not in the union.
 */
type FormOverridableBinding = "gap" | "errorSummaryBorder" | "errorSummaryBorderWidth" | "errorSummaryRadius" | "errorSummaryPadding" | "errorSummaryGap";
interface FormProps {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: React.ReactNode;
  /**
   * The action row: at least one Button with `type: submit`, primary first (Form's
   * action-order rule). Rendered after the fields with the form gap. A single action
   * renders bare; two or more go in a horizontal Stack the consumer supplies. The
   * actions part aligns its content to the inline start, so a single bare action keeps
   * its natural width rather than stretching.
   */
  actions: React.ReactNode;
  /**
   * Identifier for the form, used for analytics and as the base of generated ids. React
   * Native has no ids and focuses by ref, so it is inert here and exists for parity.
   */
  name?: string | undefined;
  /**
   * Accessible name for the form, e.g. "Sign in". Required when a screen has more than one
   * form. Nothing enforces this at runtime and no dev warning is emitted.
   */
  label?: string | undefined;
  /**
   * When field-level validation runs. `submit` is the least noisy; `blur` is the usual
   * choice for longer forms. `change` validates on change only, not also on blur; after a
   * failed submission every mode re-validates on blur and change, until a successful
   * submission resets that state.
   */
  validate?: FormValidateMode | undefined;
  /**
   * Disables every field and action inside. Use while submitting. Each field and action
   * dims itself with its own disabled style; the Form container applies no opacity of its
   * own (it would compound) and only exposes the disabled state.
   */
  disabled?: boolean | undefined;
  /**
   * When submission fails validation, render a summary of errors above the fields that
   * links to each field. Each item's text is the field's own message verbatim; a field that
   * is invalid with an empty message shows its `label` instead, and its `name` when the
   * label is empty too. The summary appears only after a failed submission, shrinks as
   * fields are fixed, and is removed by a successful submission.
   */
  errorSummary?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view, so a parent can measure it. */
  ref?: React.Ref<ViewInstance> | undefined;
  /**
   * Fired when the form is submitted and every field is valid. Receives the collected values
   * keyed by field name: Input and RadioGroup contribute strings, Switch a boolean, Checkbox
   * its `value` when checked, NumberInput and Slider a number, multi-select Listbox, Select
   * and Combobox a string array, a range Slider or DatePicker a pair; an unchecked Checkbox,
   * an unselected RadioGroup, an empty field (a null, empty-string or empty-array value) and
   * a disabled field contribute no key at all.
   */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: Record<string, string>) => void) | undefined;
}
/**
 * Form — the container that makes fields behave as a group.
 *
 * When to use: Use Form whenever two or more fields are submitted together, and for any
 * single field whose submission has consequences (sign-in, search with side effects). Pass
 * the submit and cancel Buttons in `actions`, primary first. Give the form a `label` when
 * the screen contains more than one. Do not use it for instant-apply settings, do not nest
 * forms, and do not use it as a layout container — that is Stack.
 *
 * There is no form element on native. Form renders a `View` with `role="form"` (a landmark
 * only on react-native-web; `accessibilityLabel` is the native alternative) and provides a
 * context: each field calls `register(name, { label, getValue, isDisabled, validate, focus })`
 * in mount order, a Button with `type: submit` calls `submit()`, non-last Inputs get
 * `returnKeyType="next"` and the last one's return key submits. A disabled field is left out
 * of the values, out of validation and out of `order`, so the previous field's "next" key
 * skips past it.
 *
 * On a failed submission `onInvalid` fires, the summary is announced
 * (`accessibilityLiveRegion="assertive"` for Android, `announceForAccessibility` on iOS —
 * the heading followed by each item joined with '. ', once per failed submit) and
 * accessibility focus moves to the summary heading, or to the first invalid field when
 * `errorSummary` is off. Items are in field order at the failed submit; an error a later
 * blur or change finds is appended. Each item is a `Link` (`tone: inherit`, nested in a
 * danger `Text`, which is how the danger color reaches it) that focuses its field and
 * returns `false` so nothing opens; an item whose field has since unmounted stays as plain
 * danger text with no link.
 */
export declare function Form({ children, actions, name: _name, label, validate, disabled, errorSummary, overrides, ref, onSubmit, onInvalid }: FormProps): React.JSX.Element;
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
  /**
   * Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing
   * scale: tight for related controls, normal for fields in a form, loose for groups,
   * section between page sections. The only way to set spacing between siblings.
   */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /**
   * Main-axis distribution. It only shows where the main axis is larger than the content —
   * a vertical Stack needs a bounded height for it to mean anything, and Stack has no size
   * of its own, so that is the caller's to give. `around` and `evenly` are deliberately
   * left out.
   */
  justify?: StackJustify | undefined;
  /**
   * Allow horizontal stacks to wrap onto new lines instead of overflowing. It is set
   * whatever the direction — on a column it is inert unless the height is bounded — rather
   * than being silently ignored on a vertical Stack. Prefer wrapping over horizontal
   * scrolling, so a wrapped row still fits when the platform's text size is turned up.
   */
  wrap?: boolean | undefined;
  /**
   * Replace individual style bindings with a different token from the theme. The only
   * per-instance styling surface — there is no `style` prop. `gap: none` turns the gap
   * off, which makes `overrides.gap` a no-op.
   */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Stack — how things get spaced. Owns the gap between its children using a preset
 * from the theme's layout rhythm, instead of margins on individual components.
 *
 * When to use: Use Stack for any group of siblings that should be evenly spaced:
 * form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout style. Do not use it for two-dimensional layouts
 * or for positioning a single element.
 *
 * Renders a `View` with `flexDirection`, `gap` from the token object, `alignItems`,
 * `justifyContent` and `flexWrap`; children are not wrapped. `element` is not
 * applicable on React Native: a navigation region is `Landmark`, and a list is a
 * plain Stack whose rows carry their own semantics (a native list has no role to claim).
 * Row direction already follows the writing direction under `I18nManager`.
 * Horizontal stacks should `wrap` rather than scroll, so content reflows for large
 * text settings (WCAG 1.4.10).
 */
export declare function Stack({ children, direction, gap, align, justify, wrap, overrides, ref }: StackProps): React.JSX.Element;
//#endregion
//#region src/Fieldset.d.ts
type FieldsetGap = Extract<StackGap, "tight" | "normal" | "loose">;
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "disabledOpacity" | "fontFamily" | "lineHeight";
/** What Fieldset shares with the fields inside it. Input, Checkbox, Switch and RadioGroup read this to prefix the legend into their own `accessibilityLabel` ("Shipping address, Street") and to render disabled with the group. */
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
  /** The fields as direct children, usually Inputs, Checkboxes or Switches. Fieldset renders the `Stack` around them. */
  children: React.ReactNode;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. An empty string counts as unset. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. An empty string counts as unset. */
  error?: string | undefined;
  /** Disables every field inside (through `FieldsetContext`). A field may disable itself in an enabled group, but cannot opt out of a disabled one. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Fieldset — how a form says "these belong together." A screen-reader user moving
 * into "Street" hears "Shipping address, Street" and knows where they are.
 *
 * When to use: Use a Fieldset whenever two or more fields share a name a user would
 * say aloud — an address, a card, a start and end date. Give it a `description` when
 * the group needs a rule, and put cross-field errors on the group rather than on one
 * field. Do not wrap a whole form in it (the Form's `label` names the form), use it
 * for a single field, or nest one inside a RadioGroup, which already is a fieldset.
 *
 * Renders a `View` that is NOT `accessible` (so children stay individually
 * reachable) with `role="group"`, `accessibilityLabel` (the legend, with
 * `copy.requiredIndicator` appended when every direct child field is `required`)
 * and `accessibilityHint={description}`. The legend is plain `Text` — not a header
 * trait, which would put it in the headings rotor. The fields render in a `Stack`
 * that is sized only through its own `overrides.gap` (the override, else
 * `layout.gap.{gap}`); `FieldsetContext` carries the legend and `disabled` to Input,
 * Checkbox, Switch and RadioGroup, which render disabled and prefix the legend into
 * their label. Children are never cloned; a non-field child gets no association.
 * `disabled` dims only the legend and description with `opacity.disabled` — the
 * fields dim themselves, and the group error is never dimmed. Those two dimmed
 * Views also carry `aria-disabled`, which is what reaches the DOM under
 * react-native-web (`accessibilityState` is dropped there) and what stops a
 * checker reading dimmed-because-inapplicable text as failing contrast. The group
 * error is announced as in Input (`accessibilityLiveRegion` on Android,
 * `announceForAccessibility` on iOS), once when it appears, and not at all inside a
 * Form with its own error summary; native has no invalid state, so the error text
 * alone identifies it.
 */
export declare function Fieldset({ legend, children, description, error, disabled, gap, overrides, ref }: FieldsetProps): React.JSX.Element;
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `background` is locked — it carries the contrast the build checks
 * against the foreground tokens — so it is not in the union and is ignored if passed.
 */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "border" | "borderWidth" | "radius";
interface BoxProps {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: React.ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /**
   * Vertical padding, overriding `inset` on that axis. It has no default: unset means
   * `inset` applies, which keeps an explicit `none` distinct from an absent value.
   */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies, as with insetBlock. */
  insetInline?: BoxInset | undefined;
  /**
   * Background. `none` is transparent; `default` is the page background (use to lift
   * content off a subtle parent); `subtle` and `strong` step up.
   */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /**
   * Replace individual style bindings with a different token from the theme. The only
   * per-instance styling surface — there is no `style` prop. Overrides change values,
   * never presence: `border: false` and `radius: none` make the matching entries no-ops.
   */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `View` — the surface itself — for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Box — a surface: padding around a group of content, a background under it, a border,
 * rounded corners. It has no opinions about what is inside and no spacing between its
 * children (that is Stack's job), and it never carries margin of its own.
 *
 * Renders a `View` with paddingVertical/paddingHorizontal from `layout.inset.*`,
 * backgroundColor from `color.background.*` (literal `transparent` for `surface: none`,
 * so the parent's shows through), borderWidth/borderColor when `border`, and borderRadius
 * from `radius.*`. It adds no accessibility role of its own; `radius` does not clip
 * (a child that should be clipped clips itself). The `element` prop is web/Lit only —
 * React Native has no sectioning elements, so the `nav`/`article` semantics those
 * builds render have no counterpart here; use Landmark for a page region.
 */
export declare function Box({ children, inset, insetBlock, insetInline, surface, border, radius, overrides, ref }: BoxProps): React.JSX.Element;
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
  /**
   * Marks a destination outside the product: appends `copy.externalSuffix` to the accessible
   * name, with a decorative trailing icon. `onPress` fires first; the system browser then opens
   * the URL through `Linking` unless the handler returns `false`.
   */
  external?: boolean | undefined;
  /**
   * `default` uses the link colors. `inherit` takes the surrounding text color and relies on
   * the underline alone; rest and pressed both resolve to the inherited color.
   */
  tone?: LinkTone | undefined;
  /**
   * The link points at the screen the user is on, in a navigation list (a SidePanel
   * drawer, a Tree of href nodes): `accessibilityState.selected`, mirrored as
   * `aria-current="page"` for react-native-web. The link stays a link and keeps its
   * colors and underline; how a navigation also marks it visually is that container's to say.
   */
  current?: boolean | undefined;
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
   * Fired when the link is activated, with `href`. On native the consumer's handler is
   * the navigation; when no handler is given the system opens the URL with `Linking`.
   * An `external` link still hands off to `Linking` after the handler, since a
   * consumer-side router cannot open the system browser. Cancelable: return `false`
   * to skip any `Linking` hand-off.
   */
  onPress?: ((href: string) => boolean | void) | undefined;
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
 * `Text`; standalone it is its own line. `accessibilityLabel` is the label plus
 * `copy.externalSuffix` when `external`, or the `accessibilityLabel` prop when a
 * wrapping parent (Tooltip) sets one. `onPress(href)` fires first when provided;
 * returning `false` cancels any `Linking` hand-off. For a non-`external` link the
 * handler is the navigation and `Linking.openURL(href)` is only the fallback without
 * one; an `external` link opens through `Linking` after the handler as well.
 * On react-native-web the Text receives `href` (plus `hrefAttrs` target/rel when
 * `external`) and renders a real anchor: the browser navigates, `Linking` is not
 * called, and a handler returning `false` calls `preventDefault`.
 * `accessibilityHint`, `onFocus`, `onBlur`, `onHoverIn`, `onHoverOut` and `onLongPress`
 * are forwarded to the native element, so a wrapping Tooltip can attach to this Link.
 * Link exposes no `ref`. Standalone, the Link sets the body typography via Text's
 * helpers since there is no cascade; nested in a system `Text` (detected through
 * `TextStyleContext`) it inherits.
 *
 * There is no hover or visited state on native, so `colorHover` styles the pressed
 * state (`colorVisited` unused) and the color crossfades over `transition` (eased
 * with `motion.easing.standard`, skipped under reduced motion). RN cannot set
 * underline offset or thickness, and nested `Text` ignores margins, so
 * `underlineThickness`, `underlineOffset` and `externalIconGap` have no effect on
 * this platform and are excluded from `LinkOverridableBinding`; a literal space
 * separates the label from the external glyph instead. `Text` has no focus events,
 * so the focus ring is the platform's own (`focusRing*` not applied); react-native-web
 * renders a real anchor with the browser's focus outline. The external glyph is the
 * shared `Icon` (`name="external"`, `inline`); with `tone: default` it receives the
 * link color, swapping instantly on press, and with `tone: inherit` it receives no
 * color and resolves the enclosing Text's color itself. The link is never disabled:
 * a destination that is not available is rendered as Text.
 */
export declare function Link({ href, label, external, tone, current, overrides, accessibilityLabel, accessibilityHint, onFocus, onBlur, onHoverIn, onHoverOut, onLongPress, onPress }: LinkProps): React.JSX.Element;
//#endregion
//#region src/Checkbox.d.ts
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface CheckboxProps {
  /** Visible label. Tapping it toggles the control. Also the `accessibilityLabel`. */
  label: string;
  /** Visually hide the label (it remains the accessible name via `accessibilityLabel`): a selection column in a Table, where the row name is the label. */
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** What a native HTML form submits when checked (web and Lit only). The enclosing Form ignores it and collects the boolean `checked`; checkboxes sharing a `name` are not a multi-select, so give each its own name. */
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
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Checkbox — a single yes/no choice that the user makes and then submits, as
 * opposed to a Switch, which takes effect the moment it is flipped.
 *
 * When to use: Use a Checkbox for one independent option ("Remember me"), for terms
 * and consent (`required`), or several, each with its own `name`, when the user may
 * pick any number of items. Use `indeterminate` on a "select all" parent when only some
 * of its children are checked. Do not use it for a setting that applies immediately
 * (Switch) or to pick exactly one option (RadioGroup).
 *
 * There is no checkbox in core React Native. Renders a `Pressable` row with
 * `accessibilityRole="checkbox"`, `accessibilityLabel`, `accessibilityHint={description}`
 * and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`, mirrored
 * to `aria-checked` (and, on react-native-web, `aria-disabled` set on the DOM node) because
 * react-native-web renders only the aria-* forms and `role="checkbox"` requires `aria-checked`.
 * `disabled` is never passed to `Pressable` itself — that would drop the row from the tab order —
 * so a disabled checkbox stays focusable and is announced as disabled while a press guard blocks
 * the toggle. It contains the drawn control (the `check`/`dash` `Icon`) and the label and
 * description, so the whole row — control, label or description — is the hit area and
 * never drops below the comfortable target. The row aligns to the start of the cross
 * axis and pads (minTarget − labelSize × lineHeight) / 2 above and below, so a single
 * line is exactly the comfortable target tall while a wrapping label or a description
 * grows it downwards with the control still centred on the label's first line (as
 * Switch). Space on a hardware keyboard is handled by the platform once the role is
 * set. The fill and border color cross-fade over `transition` with
 * `motion.easing.standard` (skipped under reduced motion); the indicator is not
 * animated — the check and dash Icons are mounted and unmounted, so they appear,
 * disappear and swap instantly. While pressed an unchecked, enabled box shows the
 * selected fill at `pressedOverlay` as an overlay inside the box, so the border does
 * not fade. Border color is invalid, then selected, then rest: focus draws the border
 * at the larger of `focusRingWidth` and `controlBorderWidth` and never hides
 * `controlBorderInvalid`, as in Input. Toggling an indeterminate checkbox clears the
 * mixed state until `indeterminate` changes value again. Inside a Form the control
 * registers by `name` and submits its checked state as a boolean (`value` is not used
 * on native); the error slot shows `error`, else the Form's message, else — only while
 * `invalid` — `copy.required` (required and unchecked) or `copy.invalid`, as in Input,
 * and `validate: blur` means on change. The error sits below the row, outside the hit
 * area, indented by controlSize + gap so it lines up with the label.
 * `disabledOpacity` dims the control and label, not the description or error. Inside a
 * Fieldset the group's `disabled` applies and the legend prefixes the accessibility
 * label. Errors are announced as in Input.
 */
export declare function Checkbox({ label, hideLabel, name, value, checked, defaultChecked, indeterminate, disabled, required, invalid, description, error, overrides, onChange, ref }: CheckboxProps): React.JSX.Element;
//#endregion
//#region src/Switch.d.ts
type SwitchLabelPosition = "start" | "end";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`
 * and `transition` are drawn and animated by the native `Switch` on React Native and are
 * excluded here, since an override on them would be a silent no-op.
 */
type SwitchOverridableBinding = "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity";
interface SwitchProps {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /** Optional field name. When inside a Form the state is collected as a boolean; most switches are not in forms. A Switch never validates. */
  name?: string | undefined;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Cannot be toggled. Stays visible and readable; the native Switch is not focusable while disabled (platform limit). */
  disabled?: boolean | undefined;
  /** Persistent helper text below the label explaining the effect. Also the `accessibilityHint`. */
  description?: string | undefined;
  /** Where the label sits relative to the track. `start` (label, then switch at the row end) is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the state changes, with the new boolean (`events.onChange`). The change is already in effect; there is nothing to submit. */
  onValueChange?: ((checked: boolean) => void) | undefined;
  /** The root view (the row). */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * Uses the native `Switch` with `accessibilityRole="switch"` (native only — on
 * react-native-web the rendered `<input type="checkbox" role="switch">` already carries
 * the role, and a second one on its container would have no state and a focusable
 * descendant), `accessibilityLabel`, `accessibilityHint={description}`,
 * `accessibilityState={{ checked, disabled }}`,
 * `trackColor={{ false: trackOff, true: trackOn }}`, `thumbColor` and
 * `ios_backgroundColor={trackOff}`. The row is a `Pressable` with `accessible={false}`
 * and `tabIndex={-1}` that toggles the value, so label and description are part of the
 * target while the Switch stays the single focusable element; the row is at least the comfortable
 * target tall with no padding, and centres its content in that height, so a one-line
 * row sits in the middle while a wrapping label or a description grows it downwards
 * with the track still on the label's first line. Track and thumb sizes, radius, thumb travel, its animation (and reduced
 * motion) and the focus indicator are the OS values. With `name` inside a Form the
 * switch registers and contributes a boolean; it has no error state by design. Inside
 * a Fieldset the group's `disabled` applies and the legend prefixes the label.
 */
export declare function Switch({ label, name, checked, defaultChecked, disabled, description, labelPosition, overrides, onValueChange, ref }: SwitchProps): React.JSX.Element;
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
type RadioGroupOverridableBinding = "controlBorderWidth" | "indicatorInset" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionPaddingBlock" | "optionTextGap" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
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
  /** The root (group) view. */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * and `accessibilityHint={description}` (not `accessible`, so the radios stay
 * reachable), a `Text` legend, and one `Pressable` per option with
 * `accessibilityRole="radio"`, `accessibilityLabel` (label plus description),
 * `accessibilityState={{ checked, disabled }}` and `copy.position` as its
 * `accessibilityValue`. There is no roving tabindex or arrow movement on native —
 * every radio is its own focus stop, which is the platform convention; Space/Enter on
 * a hardware keyboard activate the focused radio. Individually disabled options stay
 * focus stops but are guarded against press and dimmed; a fully `disabled` group stays
 * reachable but inert. The selected border and dot cross-fade in over `transition`
 * with `motion.easing.standard` (skipped under reduced motion). Inside a Form the
 * group registers by `name` and contributes the selected value (no key when nothing
 * is selected); validation precedence is `error`, then `required` (`copy.required`),
 * then `invalid` (`copy.invalid`), as in Input, and focus moves to the first enabled
 * radio on a failed submit. `validate: blur` runs on change, since a group-level blur
 * does not exist on native. Inside a Fieldset the group's `disabled` applies and the
 * legend prefixes the accessibility label. The group error is announced as in Input.
 */
export declare function RadioGroup({ label, name, options, value, defaultValue, orientation, required, invalid, disabled, description, error, overrides, onChange, ref }: RadioGroupProps): React.JSX.Element;
//#endregion
//#region src/Disclosure.d.ts
/** Heading level for the trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
type DisclosureHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/**
 * Why the state changed. `keyboard` never fires natively — `Pressable` cannot tell a
 * hardware Enter/Space activation from a touch — so a trigger press always reports
 * `pointer`; `controlled` is a consumer-driven `open` prop change.
 */
type DisclosureToggleReason = "pointer" | "keyboard" | "controlled";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerLineHeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
interface DisclosureProps {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden). A plain string is wrapped in the system `Text`. */
  children: React.ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean | undefined;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean | undefined;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields, so the Form still collects them while the disclosure is closed. */
  keepMounted?: boolean | undefined;
  /** The trigger stretches across its container, so the whole row is the hit area (and the hover fill runs edge to edge). The icon and summary stay at the start. */
  fullWidth?: boolean | undefined;
  /**
   * When set, the summary is marked `accessibilityRole="header"` so the disclosure
   * appears in the screen reader's heading list. Native has no heading levels, so the
   * value itself changes nothing beyond that.
   */
  headingLevel?: DisclosureHeadingLevel | undefined;
  /** Fired after the state changes, with the new boolean `open` and a reason. */
  onToggle?: ((open: boolean, reason: DisclosureToggleReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Disclosure — a button that reveals content beneath it. Deliberately plain: no
 * border, no card, no animation of the panel.
 *
 * When to use: hide secondary content that some users need and most do not —
 * optional settings, long explanations, FAQ answers. Stack several to make an
 * accordion; each is independent. Do not hide content most users need, and do not
 * use it as a fake tab set.
 *
 * Renders a `Pressable` trigger with `accessibilityRole="button"`,
 * `accessibilityLabel={summary}` and `accessibilityState={{ expanded, disabled }}`,
 * containing the chevron `Icon` and the summary text (`accessibilityRole="header"`
 * when `headingLevel` is set). The panel renders below only while open, or with
 * `display: 'none'` and hidden from accessibility while closed under `keepMounted`.
 * There is no `aria-controls` equivalent, and focus cannot be handed back to the
 * trigger when the panel closes (native has no focus-within). The chevron mirrors to
 * `chevron-left` under `I18nManager.isRTL` and rotates over `transition`, snapping
 * under reduced motion.
 */
export declare function Disclosure({ summary, children, open, defaultOpen, disabled, keepMounted, fullWidth, headingLevel, onToggle, overrides, ref }: DisclosureProps): React.JSX.Element;
//#endregion
//#region src/Alert.d.ts
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertLive = "status" | "alert" | "off";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type AlertOverridableBinding = "border" | "borderWidth" | "radius" | "padding" | "gap" | "partGap" | "iconSize" | "headingSize" | "headingWeight" | "fontFamily" | "fontSize" | "lineHeight" | "dismissMargin";
interface AlertProps {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. There is deliberately no `neutral` tone. */
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
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Alert — the system speaking to the user inside the page: "this saved", "this
 * failed", "this is about to expire". It stays until dealt with or dismissed; it
 * never auto-dismisses and never animates in.
 *
 * Renders a `View` with `accessibilityRole="alert"` when `live` is `alert`,
 * `accessibilityLiveRegion` `assertive`/`polite` by `live` (neither when `off`),
 * and `accessibilityLabel` = heading + body (when the body is a string; otherwise
 * the heading alone). iOS ignores live regions, so with `live !== 'off'` the
 * message is passed to `AccessibilityInfo.announceForAccessibility` on mount and
 * whenever it changes. The leading glyph is the system `Icon`, colored and sized
 * through its `overrides`; the dismiss button is the system `Button` (`ghost`,
 * `sm`, `iconOnly`, labelled `copy.dismissLabel`), pulled into the corner by
 * `dismissMargin`. Native cannot move focus onward before removal; the Button's
 * removal returns focus to the enclosing screen.
 */
export declare function Alert({ tone, heading, children, live, dismissible, overrides, onDismiss, ref }: AlertProps): React.JSX.Element;
//#endregion
//#region src/Landmark.d.ts
type LandmarkRole = "banner" | "navigation" | "main" | "complementary" | "contentinfo" | "region" | "search" | "form";
interface LandmarkProps {
  /** Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that deserves a jump point), `search`, `form` (a labelled form that is a page-level region). */
  role: LandmarkRole;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Not shown visually. An empty string counts as absent. On React Native it is applied as `accessibilityLabel` only for `navigation`, `region` and `form`; on any other role it is silently dropped, with no warning. */
  label?: string | undefined;
  /** The region's content. String and number children are wrapped in the package `Text`. */
  children: React.ReactNode;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * `accessible`, so its children stay individually reachable. A View cannot hold a
 * raw string, so string and number children are wrapped in `Text`. There is no
 * jump-to-landmark on native — the value is web parity and one structure for the
 * same screen code. In development it warns when `region` or `form` has no `label`.
 */
export declare function Landmark({ role, label, children, ref }: LandmarkProps): React.JSX.Element;
//#endregion
//#region src/Breadcrumb.d.ts
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
/** One item of the trail — the element type of the schema's `items` shape. */
type BreadcrumbItem = {
  label: string;
  href?: string | undefined;
};
interface BreadcrumbProps {
  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`;
   * an ancestor without one, or with an empty-string `href`, renders as plain text (never an
   * empty link). The last is the current page and its `href` is ignored. An empty array
   * renders the named landmark around an empty list; a single item renders only the current
   * page; neither raises a dev warning.
   */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the
   * ellipsis is a button that reveals the rest. The rule is literal: five items hide the second
   * and third. Once revealed the trail stays expanded for the life of the instance, even if
   * `items` changes. Set false for short trails that must always show in full.
   */
  collapse?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when a non-current item is activated, as `(item, index)`; native has no event. The
   * handler is passed to Link as `onPress` and is the navigation, so returning `false` has
   * nothing to cancel (Breadcrumb links are never `external`); without a handler the Link
   * falls back to `Linking.openURL`.
   */
  onNavigate?: ((item: BreadcrumbItem, index: number) => boolean | void) | undefined;
  /** The root `View` (the `nav` and `list` parts). */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Breadcrumb — answers "where am I?" and "how do I go up a level?" in one line. A
 * secondary navigation that shows the hierarchy, not the user's history.
 *
 * When to use: pages three or more levels deep — documentation, catalogues, settings
 * sub-pages — above the page title. Not on top-level pages, not for history, not as a
 * wizard step indicator. Breadcrumbs are rare on native, where the navigation stack does
 * this job; they are provided mainly for tablet and react-native-web layouts.
 *
 * Renders one wrapping row `View` with `role="navigation"` (semantic on react-native-web,
 * ignored on native) and `accessibilityLabel={label}`; it is both the `nav` and `list`
 * parts and spaces items with `columnGap: gap` (no row gap: each item's `minTarget` height
 * spaces wrapped lines). Each item is a row `View` (`Breadcrumb.item`, `minHeight:
 * minTarget`) holding its leading separator and its content `gap` apart, so a wrapped
 * line may start with a separator. Ancestors are the system `Link` (`tone: default`)
 * nested in a system `Text` whose `overrides` receive `fontSize`, `fontFamily`,
 * `fontWeight` and `lineHeight`; `onPress` calls `onNavigate(item, index)`. An ancestor
 * without `href` is plain text in `itemColor`. The current page is `Text` in
 * `currentColor` with `accessibilityState={{ selected: true }}` and `copy.current`
 * appended to its label; separators are decorative `Text` in `separatorColor`. With
 * `collapse` and more than four items the ellipsis is the system `Button` (`ghost`, `sm`,
 * `iconOnly`, labelled `copy.expandLabel`, the `ellipsis` glyph as `leadingIcon`);
 * activating it reveals the hidden items one-way and moves accessibility focus to the
 * first revealed item's `View` (hardware-keyboard focus cannot be moved to a Text link).
 */
export declare function Breadcrumb({ items, label, collapse, overrides, onNavigate, ref }: BreadcrumbProps): React.JSX.Element;
//#endregion
//#region src/Meter.d.ts
type MeterTone = "info" | "success" | "warning" | "danger";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type MeterOverridableBinding = "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition";
interface MeterProps {
  /**
   * The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the
   * clamped number too, exact and unrounded (only the percentage text is rounded). A non-finite
   * `value` is treated as `min`.
   */
  value: number;
  /** Lower bound of the range. A non-finite `min` (NaN, Infinity) is treated as 0. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. A non-finite `max` (NaN, Infinity) is treated as 100. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw
   * number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a
   * whole number ("32%"), from the runtime's default locale.
   */
  valueText?: string | undefined;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns. */
  tone?: MeterTone | undefined;
  /** Hides the visible value text. The accessible value is always exposed. */
  hideValue?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View` (the element carrying `role="meter"`). */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Meter — shows how much of something there is against a known scale. Its shape is
 * a bar because people read fullness at a glance; its meaning is the number.
 *
 * When to use: a measurement with a fixed range — storage or quota used, battery,
 * password strength, a score out of ten. The consumer decides the tone from thresholds
 * it owns; the meter just paints. Not for task progress (ProgressBar).
 *
 * Renders an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and
 * `accessibilityValue={{ min, max, now: clamped, text }}`, where `text` is always set:
 * `valueText`, else the rounded percentage web and Lit announce. Inside: a header row of
 * two composed `Text`s — each in a plain `View` the Meter owns, since `Text` takes no
 * `testID` — and a track `View` (`overflow: 'hidden'`) holding the fill. The track is
 * measured with `onLayout` and the fill's pixel width animates over `transition`
 * (`useNativeDriver: false`); it snaps before the width is known, on first layout, on
 * resize, and under reduced motion. A non-finite `value` counts as `min`, a non-finite
 * `min`/`max` as its default; if `max <= min` the track renders empty, `now` is `min`,
 * "0%" is shown and announced, and development warns once per distinct invalid pair.
 * Nothing here is interactive: no focus, no events, no hover.
 */
export declare function Meter({ value, min, max, label, valueText, tone, hideValue, overrides, ref }: MeterProps): React.JSX.Element;
//#endregion
//#region src/paths.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
//#endregion
//#region src/Icon.d.ts
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `strokeWidth` is locked: line glyphs stay legible at `xs` only
 * because they stroke at the focus width, so it is not overridable.
 */
type IconOverridableBinding = "size" | "color";
interface IconProps {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs
   * a shape; `info`, `success`, `warning` and `danger` are the four status shapes
   * (circle-i, circle-check, triangle-!, octagon-x) so tone is never carried by color
   * alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline,
   * ignoring `size`. For icons inside Text, Link and Button labels. With no enclosing
   * Text the glyph falls back to `font.size.md`, still ignoring `size`.
   */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an
   * image with this name; when omitted or empty, it is decorative and hidden from
   * assistive technology. Most icons sit next to text and should have no label.
   */
  label?: string | undefined;
  /**
   * React Native only: the color the parent passes, because there is no
   * `currentColor`. Falls back to `color.foreground` when the icon is not nested in a
   * `Text` (a nested glyph takes its parent Text's color instead).
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
 * so they stay legible at `xs`; the four status shapes, `ellipsis`, `play` and
 * `pause` fill instead, with no stroke.
 *
 * There is no `currentColor` on native, so `color` is an explicit prop that falls
 * back to `color.foreground` — except inside a system `Text`, where the glyph takes
 * that Text's own resolved color through `TextStyleContext`, and (with `inline`) its
 * font size too, so it matches the surrounding copy exactly.
 *
 * `size` and `overrides.size` are ignored while `inline` is set: the size comes from
 * the enclosing Text, or `font.size.md` when there is none. An Svg inside a Text is
 * centred by the text renderer with no baseline control, so an inline glyph sits
 * slightly higher than on web — a platform limit. The glyph is react-native-svg's
 * `Svg`, whose ref is a class instance, so Icon exposes no ref and no part hook
 * beyond `testID="Icon"`. The accessibility props sit on a View sized to the glyph
 * that wraps the `Svg`, never on the `Svg` itself: react-native-svg's web build
 * spreads every prop onto the DOM `<svg>`, where `importantForAccessibility` is an
 * invalid attribute and `accessibilityElementsHidden` produces no `aria-hidden`.
 * Decorative (no `label`): `aria-hidden`, `accessibilityElementsHidden` and
 * `importantForAccessibility="no"`. Labelled: `accessible`, `accessibilityRole="image"`
 * and `accessibilityLabel`. No interaction, no focus, no animation.
 */
export declare function Icon({ name, size, inline, label, color, overrides }: IconProps): React.JSX.Element;
//#endregion
//#region src/Card.d.ts
/** Heading level for `heading`. The schema declares the values as strings; numbers are accepted too. */
type CardHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
type CardInset = "sm" | "md" | "lg";
type CardSurface = "default" | "subtle";
/** The style bindings a caller may replace with a different token. Locked: background, hoverBackground, focusRing, focusRingWidth. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "transition";
interface CardProps {
  /**
   * The body. Usually a Stack of Text and controls; a plain string is rendered inside
   * the system Text (a bare string cannot sit in a native View).
   */
  children: React.ReactNode;
  /**
   * The card's title, rendered as the system Heading at the card's level and at
   * `size: lg`, so a card heading reads smaller than a page heading. Omit for cards
   * that are a single piece of content; an empty string counts as omitted.
   */
  heading?: string | undefined;
  /**
   * Heading level for `heading`, so cards fit the page outline. Cards in a list share
   * a level. React Native has no heading levels: the heading carries the `header`
   * role, and the level is passed to `Heading` for parity only (its size is `lg`).
   */
  headingLevel?: CardHeadingLevel | undefined;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two (a content guideline, not a runtime check). */
  headerActions?: React.ReactNode;
  /** The action row. Buttons in a row, primary first, following Form's action-order rule. */
  footer?: React.ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one Link or Button
   * among the top-level children of the body (controls nested in a wrapper such as a
   * Stack are not searched; a top-level Fragment is flattened, so its children count
   * as top-level); its action, role and name move onto a wrapping Pressable — the
   * card's single target and single focus stop. With zero or several such children the
   * card stays non-interactive and warns once per mounted card in development. A
   * disabled child disables the card with it. Controls in `headerActions` and `footer`
   * are never the target.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes `tabIndex={-1}` so a container (Feed) can move focus to it by
   * script through `ref`, and draws its own focus ring when focused that way. Not a
   * tab stop; not for making cards clickable (`interactive`). It is a no-op whenever
   * `interactive` is set — even when that card fell back to non-interactive for want of
   * a single target — and a development warning says so.
   * A react-native-web capability: on iOS and Android no container can focus a View by script.
   */
  focusable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view: the surface `View`, or the wrapping `Pressable` when the card is interactive. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Card — frames one thing so it can sit among others: a search result, a plan to
 * choose, a setting group, a dashboard panel.
 *
 * When to use: collections of like items where each needs its own boundary, and a
 * single panel that groups a heading, content and actions. Give it a `heading` when it
 * is a unit in a list and set `headingLevel` to fit the page. Use `interactive` when
 * the entire card leads somewhere and it contains exactly one Link or Button.
 *
 * A `View` with padding, background, border and radius from tokens. The header
 * (`heading` or `headerActions`) and footer are Card's own row Views styled from its
 * gap bindings, not Stack, so they stay overridable per instance. The Heading gets
 * `marginBlockEnd: space.0` so its own margin adds no space inside the header row.
 *
 * `interactive` wraps the content in a `Pressable` that takes the single top-level
 * child's role, accessible name and action; the child is made inert and hidden from
 * assistive technology, so the Pressable is exactly one target and one focus stop —
 * "the card adds no second stop" means exactly one here, not zero. Only `children` is
 * searched, with top-level Fragments flattened; `headerActions` and `footer` controls
 * keep their own targets. A disabled child reports the Pressable disabled, ignores
 * presses and shows no hover background. With zero or several candidates the card
 * renders as a plain View. The ring's width (`border.width.focus`) is always reserved,
 * colored `border` on `surface: default` and transparent on `subtle` until focused, so
 * focus never shifts the layout. Hover and press show `hoverBackground` instantly;
 * native has no continuous hover to animate, so `transition` has no runtime effect.
 *
 * `focusable` sets `tabIndex={-1}` (scriptable, not a tab stop under react-native-web;
 * on native Android `-1` means not focusable) and draws the ring on focus. It is a
 * no-op whenever `interactive` is set, including on the non-interactive fallback.
 */
export declare function Card({ children, heading, headingLevel, headerActions, footer, inset, surface, interactive, focusable, overrides, ref }: CardProps): React.JSX.Element;
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
  /** Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the content width and the wide gutter above the page width. `none` for a nested container inside a padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. `center` maps to `alignSelf: 'center'`, `start` to `alignSelf: 'flex-start'` (there is no margin on native). */
  align?: ContainerAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. An override is a no-op where its binding renders nothing (`width: full`, `gutter: none`). */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Container — decides a screen's horizontal rhythm once: a gutter at the viewport
 * edge and a cap on how wide content can get.
 *
 * Renders a `View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.{width}`
 * (none for `full`), `alignSelf` from `align` and `paddingHorizontal` from
 * `layout.gutter.{gutter}`. The `default` gutter compares `useWindowDimensions().width`
 * with the content and page max-width tokens, with the same inclusive `>=` boundaries
 * as the web media queries — it reads the window, never the parent, so a nested
 * `gutter: default` Container picks its gutter by the window; nest with `gutter: none`.
 * Container belongs in a column-direction parent (a screen, a vertical Stack); inside
 * a row parent `width: '100%'` and `alignSelf` cross axes and that placement is not
 * supported. `element` is web and Lit only, as in Box.
 */
export declare function Container({ children, width, gutter, align, overrides, ref }: ContainerProps): React.JSX.Element;
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
interface DividerProps {
  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row
   * height. They need a row (a horizontal Stack with align stretch) or a parent with a
   * definite height; otherwise a vertical divider has no height and draws nothing.
   */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the
   * divider from decorative into a labelled separator. Ignored on a vertical divider, with
   * a development warning. An empty string is no label.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. React Native has no separator role, so
   * without a `label` this has no observable effect and warns in development.
   */
  semantic?: boolean | undefined;
  /** Space on both sides along the cross axis, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Divider — a line, decorative by default. A `label` centers text between two line
 * segments and makes the line meaningful rather than furniture.
 *
 * The line is an inner `View` `border.width.thin` thick along the cross axis in
 * `color.border`, inside a root `View` that carries `spacing` as padding on that axis;
 * root and line both `alignSelf: 'stretch'` in either orientation, so a divider in a parent
 * that does not stretch its children still draws. `spacing: none` renders no space, so
 * `overrides.spacing` is a no-op there. There is no `separator` role on React Native:
 * a decorative root hides itself and its line (`accessibilityElementsHidden` +
 * `importantForAccessibility="no-hide-descendants"`); a labelled root is a row (`gap` from
 * `labelGap`) of two hidden line Views around `Text size="sm" tone="muted"`, which is read.
 * The label Text sits in a plain unflexed View carrying the `Divider.label` hook, since Text
 * takes no `testID`. `labelSize`/`fontFamily` overrides reach Text's `fontSize`/`fontFamily`.
 */
export declare function Divider({ orientation, label, semantic, spacing, overrides, ref }: DividerProps): React.JSX.Element;
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
type FocusScopeEscapeDirection = "forward" | "backward";
interface FocusScopeProps {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: React.ReactNode;
  /** Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside is pulled back in. `false` turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels. Native has no Tab order to confine; together with `active` this maps to `accessibilityViewIsModal`. */
  trapped?: boolean | undefined;
  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper (for reading-first dialogs), or nowhere. Native has no descendant walker, so `first`, `last` and `container` all focus the wrapper; only `none` differs. */
  autoFocus?: FocusScopeAutoFocus | undefined;
  /** On unmount, focus returns to `returnFocusTo`, or to the `TextInput` that was focused when the scope mounted. */
  restoreFocus?: boolean | undefined;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Required on
   * native when the opener is not a `TextInput` — React Native exposes no generic
   * "currently focused element" — so every overlay passes its trigger ref.
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
  /** The wrapper `View` (the `scope` part). */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * FocusScope — the smallest possible answer to the hardest accessibility bug: focus
 * that escapes a modal, or never comes back from one. It has no appearance and no
 * opinion about what is inside it.
 *
 * When to use: consumers rarely render it directly; Dialog, AlertDialog, BottomSheet
 * and ActionSheet declare it in their composition. Render it yourself only when
 * building a new modal surface the system does not have yet, with `trapped` on and a
 * dismiss control of your own — or with `trapped: false` for a non-modal panel that
 * should still move focus in and restore it on close. Do not trap focus in anything
 * that is not modal, and do not use it for composites (menus, tab lists).
 *
 * Renders a `View` with `accessibilityViewIsModal={trapped && active}` so VoiceOver
 * and TalkBack ignore siblings while the scope is the active one; a paused outer
 * scope therefore does not hide a nested Menu. On react-native-web the prop is
 * omitted: it would render `aria-modal` on a role-less div, and the composing
 * overlay's own dialog carries `aria-modal` there. There is no Tab order to confine
 * on native, so hardware-keyboard Tab is not wrapped (a platform limit, on
 * react-native-web too) and `onEscapeAttempt` never fires; screen-reader users are
 * kept inside by `accessibilityViewIsModal` instead. `autoFocus` runs once after
 * mount and calls `AccessibilityInfo.setAccessibilityFocus` on the wrapper for
 * `first`, `last` and `container` alike — children cannot be walked for a focusable
 * descendant — so the screen reader reads the scope from its top; only `none` skips
 * it. iOS VoiceOver may ignore focus on a non-`accessible` View; that is a platform
 * limit, and `accessibilityViewIsModal` is the accessibility alternative.
 * `restoreFocus` runs once on unmount and focuses `returnFocusTo` when given,
 * otherwise the `TextInput` that was focused when the scope first rendered; there is
 * no document order on native, so when that opener is gone nothing is restored. The
 * wrapper sets no `role`, `accessibilityRole` or `accessibilityLabel`, and never
 * handles Escape or the back button — the overlay owns dismissal.
 */
export declare function FocusScope({ children, trapped, autoFocus, restoreFocus, returnFocusTo, active, onEscapeAttempt, ref }: FocusScopeProps): React.JSX.Element;
//#endregion
//#region src/Dialog.d.ts
type DialogSize = "sm" | "md" | "lg";
type DialogInitialFocus = "first" | "title" | "close";
/** Why `onClose` fired. `action` is never emitted by Dialog itself — it exists for a footer action that reports a close through the same handler. */
type DialogCloseReason = "escape" | "close-button" | "scrim" | "action";
/** The style bindings a caller may replace with a different token; `surface`, `focusRing` and `focusRingWidth` are locked. */
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "gutter" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "widthMd" | "widthLg" | "layer" | "enter" | "exit";
interface DialogProps {
  /** Controlled only — there is no uncontrolled mode. The consumer owns `open`; the dialog never closes itself and requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: React.ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: React.ReactNode | undefined;
  /** Visually hide the heading while it remains the accessible name. RN has no visually hidden primitive, so the Heading is not rendered and the surface's accessibilityLabel stays the name. */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim press all request close. When `false` the close button is not rendered and the scrim does nothing; Escape (Android back, VoiceOver escape) still fires `onClose('escape')`. */
  dismissible?: boolean | undefined;
  /** Where accessibility focus lands on open: the body (default), the title, or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in; on the next frame after focus when there is no transition. */
  onOpened?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Dialog — interrupts for one task and gives the screen back when it is done or
 * abandoned.
 *
 * A native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself, `statusBarTranslucent`) holding a full-screen scrim `Pressable` and, inside
 * a `FocusScope`, the surface `View` with `role="dialog"`, `accessibilityViewIsModal`,
 * `accessibilityLabel={heading}` and `accessibilityHint={description}`. Android back
 * (`onRequestClose`) and the VoiceOver escape gesture (`onAccessibilityEscape`) both
 * report `onClose('escape')`, even when not dismissible. Native has no descendant
 * walker, so `initialFocus` calls `setAccessibilityFocus` on the View wrapping the
 * title, the close button or the body, after the enter animation; there is no visible
 * focus ring on those targets. Scroll lock has no native meaning and is not
 * implemented. The Dialog is rooted in a Modal and exposes no ref.
 *
 * `inset` is applied once each way so nothing doubles between parts: the surface
 * column carries the block padding (top and bottom), the header and footer wrappers
 * the inline padding, and the body `Box` receives it as `overrides.paddingInline`
 * with zero block padding of its own.
 */
export declare function Dialog({ open, heading, description, children, footer, hideHeading, size, dismissible, initialFocus, onClose, onOpened, overrides }: DialogProps): React.JSX.Element | null;
//#endregion
//#region src/AlertDialog.d.ts
type AlertDialogTone = "danger" | "warning" | "info";
/** Why `onCancel` fired: the Cancel button, or Escape (the Android back button, the VoiceOver escape gesture). A scrim tap fires nothing. */
type AlertDialogCancelReason = "cancel" | "escape";
/** The style bindings a caller may replace with a different token; `surface`, `icon`, `focusRing` and `focusRingWidth` are locked. */
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "gutter" | "layer" | "rise" | "enter" | "exit";
interface AlertDialogProps {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). On native `level` only sets the size. */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences, as muted Text. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet, through the confirm Button's own `disabled` (focusable but inert). Cancel always works. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape. A scrim tap does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * AlertDialog — a Dialog with one job: get a considered yes or no before an action
 * that destroys data, spends money, or cannot be undone.
 *
 * A native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself, `statusBarTranslucent`). The scrim is an `Animated.View` with no press handler
 * or responder, so a stray tap reaches nothing, and there is no close button: the
 * only ways out are Cancel and Confirm. Android back (`onRequestClose`) and the
 * VoiceOver escape gesture report `onCancel('escape')`. Inside a `FocusScope`
 * (`trapped`, `restoreFocus`, `autoFocus="none"`) the surface carries
 * `role="alertdialog"`, `accessibilityViewIsModal`, `accessibilityLabel={heading}` and
 * `accessibilityHint={description}`. Accessibility focus is placed on the View
 * wrapping the heading after the enter animation (at once under reduced motion) so
 * the question is read; Cancel precedes Confirm in the accessibility order. The tone
 * Icon is decorative and colored through its own `overrides.color`. Scroll lock has
 * no native meaning and is not implemented. Rooted in a Modal, it exposes no ref.
 *
 * The surface is capped at window height − 2 × gutter and scrolls itself past that (a
 * `ScrollView` holding the whole column), so nothing is pinned. The exit is a fade only;
 * the rise plays on enter. In development an open dialog with an empty `heading`,
 * `description` or `confirmLabel` warns once.
 *
 * `inset` is applied once each way so nothing doubles between parts: the surface column
 * carries the block padding, the icon-and-text row and the footer wrapper the inline
 * padding. `partGap` is the only space between the two. The `footerGap` and `iconSize`
 * bindings always reach the composed Stack and Icon through their own `overrides` — the
 * caller's token when one was passed, the binding's default otherwise.
 */
export declare function AlertDialog({ open, heading, description, tone, confirmLabel, cancelLabel, confirmDisabled, onConfirm, onCancel, overrides }: AlertDialogProps): React.JSX.Element | null;
//#endregion
//#region src/BottomSheet.d.ts
type BottomSheetHeight = "content" | "half" | "full";
/** Why `onClose` fired. `action` is never emitted by BottomSheet itself — it exists for a consumer's footer action reusing the same handler. */
type BottomSheetCloseReason = "escape" | "close-button" | "scrim" | "drag" | "action";
/** The style bindings a caller may replace with a different token; `surface`, `handle`, `maxWidth`, `minTarget`, `focusRing` and `focusRingWidth` are locked. */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "handleRadius" | "headerPaddingTop" | "handleGap" | "headerGap" | "inset" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface BottomSheetProps {
  /** Controlled visibility, as in Dialog. Controlled only — the consumer owns `open` and the sheet requests changes through `onClose`, never changing `open` itself. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode | undefined;
  /** `content` sizes to the body up to 90% of the window; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false the close button and handle are not rendered, a scrim tap and a drag do nothing, and Escape still reports with reason `escape`. */
  dismissible?: boolean | undefined;
  /** Drag the handle or header downward to dismiss: release past 25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive: Escape always exists, and the close button exists whenever the gesture does. */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose('drag')`; carries no payload. */
  onDragDismiss?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps the
 * page visible behind a scrim, and goes away with a swipe, a tap outside, the close
 * button or Escape.
 *
 * One presentation at every window width — never a Dialog: the surface is `width: '100%'`
 * capped at `layout.maxWidth.prose` (locked) with `alignSelf: 'center'`, so a tablet gets
 * a capped, centred sheet at the bottom. A native `Modal` (`transparent`,
 * `animationType="none"` — the component animates itself, `statusBarTranslucent`) holding
 * a scrim `Pressable` and, inside a `FocusScope` (`trapped`, `autoFocus="first"`,
 * `restoreFocus`), an `Animated.View` surface anchored to the bottom with `role="dialog"`,
 * `accessibilityViewIsModal` and `accessibilityLabel={heading}`. It slides up with `enter`
 * and `motion.easing.standard` and down with `exit` and `motion.easing.exit`, instantly
 * under reduced motion. Android back (`onRequestClose`) and the VoiceOver escape gesture
 * report `onClose('escape')`, even when not dismissible. `autoFocus="first"` lands on the
 * scope wrapper rather than a real control — FocusScope's own documented native limit —
 * so the screen reader reads the sheet from the top, which is the intended result.
 *
 * A `PanResponder` on the header (handle and heading row, never the body `ScrollView`,
 * whatever its scroll position) claims a move once it passes `dragSlop` (`space.1`)
 * downward, so a tap on the close button still activates it; the offset counts from where
 * the slop was crossed, so the surface does not jump. It follows the finger even under
 * reduced motion, since the drag is user-driven. On release past `dismissDistance` of the
 * measured sheet height, or faster than `dismissVelocity` between the last two move
 * samples, it fires `onDragDismiss` then `onClose('drag')` and holds the released offset
 * until the consumer's update renders: `open` false plays the normal exit from there,
 * `open` still true springs back over `exit` with `motion.easing.standard`. The handle is
 * decorative, not a focus stop, and rendered only when the gesture is live.
 *
 * `inset` is applied once each way so nothing doubles between parts: the surface column
 * carries the block padding (`headerPaddingTop` at the top when the handle is rendered,
 * `inset` otherwise; `inset` at the bottom), the header and footer wrappers the inline
 * padding, and the body `Box` receives it as `overrides.paddingInline` with zero block
 * padding of its own. The bottom safe-area inset is an empty `SafeAreaView` after the last
 * part, whose column gap is cancelled so the only space it adds is its own inset; RN core
 * has no Android safe-area API, and the Modal is not `navigationBarTranslucent`, so
 * Android adds none.
 *
 * The closeButton part is a View sized to `size.target.comfortable`; the Button's own
 * hitSlop already extends its hit area to that target, so the wrapper's extra area
 * activates it. Scroll lock has no native meaning — a Modal has no page behind it to
 * scroll — and is not implemented. The Modal is its own window, so no ref is exposed; callers ref their trigger.
 */
export declare function BottomSheet({ open, heading, hideHeading, children, footer, height, dismissible, dragToDismiss, onClose, onDragDismiss, overrides }: BottomSheetProps): React.JSX.Element | null;
//#endregion
//#region src/Menu.d.ts
type MenuTriggerVariant = Extract<ButtonVariant, "ghost" | "secondary" | "primary">;
type MenuTriggerIcon = "ellipsis" | "chevron-down" | "none";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
type MenuItemTone = "default" | "danger";
/**
 * Why `onOpenChange` fired. `action` (an item was chosen) always fires before `onAction`.
 * `controlled` is never raised by the menu itself; it exists so a composing component can
 * forward its own reason through. `tab-out` and `focus-out` are part of the shared contract
 * but never fire on native: there is no Tab key event and no focus-out signal.
 */
type MenuOpenChangeReason = "trigger" | "escape" | "outside" | "action" | "controlled" | "tab-out" | "focus-out";
/** A single actionable row. */
type MenuAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: MenuItemTone | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of action items, rendered with a non-interactive heading row. A group inside a group is not drawn. */
type MenuGroup = {
  group: string;
  items: MenuItem[];
};
/** A divider between clusters of items. */
type MenuSeparator = {
  separator: true;
};
type MenuItem = MenuAction | MenuGroup | MenuSeparator;
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `typeaheadReset` is part of the contract but has nothing to reset
 * here: `Pressable` has no key events, so native has no typeahead.
 */
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "gutter" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter" | "enterDistance";
interface MenuProps {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /** Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row and hold action items only. */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant | undefined;
  /** Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the accessible name), `chevron-down` for a labelled dropdown, `none`. */
  triggerIcon?: MenuTriggerIcon | undefined;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. With `triggerIcon: none` this warns in development. */
  iconOnly?: boolean | undefined;
  /**
   * Preferred position of the popup relative to the trigger (or `anchor`). Only the block side
   * flips (bottom and top swap) on overflow; `start` and `end` never flip — they resolve against
   * the layout direction (`I18nManager.isRTL`) and the popup is shifted inline instead so it stays
   * `gutter` away from the side edges.
   */
  placement?: MenuPlacement | undefined;
  /** Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu, which starts closed. A controlled menu hides, and returns focus to the trigger, only when `open` becomes false. */
  open?: boolean | undefined;
  /** Position the popup relative to this element instead of rendering a trigger; the trigger part is omitted and `open` must be controlled. Measured with measureInWindow(). */
  anchor?: React.RefObject<React.ComponentRef<typeof View> | null> | undefined;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: ((id: string) => void) | undefined;
  /** Fired when the menu opens or closes, with the new state and why. */
  onOpenChange?: ((open: boolean, reason: MenuOpenChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Menu — hides a handful of actions behind one button so a toolbar or a row stays
 * quiet. The desktop counterpart of ActionSheet: anchored to the trigger, dismissed
 * by an outside tap or Escape.
 *
 * When to use: secondary actions that do not deserve their own buttons — overflow
 * ("More actions"), sort or view options, account menus. Group related items with a
 * `group` label past about six items; separate a danger action with a `separator`.
 * Not for navigation, for a value that stays selected, or for a single item.
 *
 * At or below `layout.maxWidth.prose` (phones) the popup is the package's `ActionSheet`
 * with the items flattened: group labels, separators and shortcut hints are dropped.
 * Above it (tablets and react-native-web) a transparent `Modal` holds a
 * full-screen transparent backdrop `Pressable` (not a scrim) and a popup `View`
 * (`role="menu"`) positioned from the trigger's (or `anchor`'s) `measureInWindow()` rect:
 * the block side flips on overflow against `useWindowDimensions()`, the inline side never
 * does and is shifted to stay `gutter` from each edge. The popup is capped at `maxHeight`,
 * itself capped at the window height less a `gutter` at each edge, and the list scrolls
 * inside it. The popup is held at opacity 0 until both the anchor and its own layout have
 * been measured, so it never jumps from a placeholder width. It then fades and
 * slides `enterDistance` from the trigger side over `enter`; under reduced motion it
 * appears at once. The Modal is not modal: nothing is trapped, the backdrop closes.
 *
 * Items are `Pressable`s with `role="menuitem"` and `accessibilityState.disabled`;
 * never the native `disabled` prop, which would drop them from the focus order — a
 * press guard makes disabled items inert. Choosing an item fires
 * `onOpenChange(false, 'action')` then `onAction(id)`; an outside tap reports
 * `outside`, `onRequestClose` (Escape on react-native-web, Android back) `escape`.
 * Every close returns accessibility focus to the trigger (or `anchor`). The trigger
 * `Button` receives `expanded`.
 *
 * Acknowledged native limits: `Pressable` has no key events, so there are no arrow
 * keys, Home/End or typeahead (`typeaheadReset` has nothing to reset); each item is
 * its own focus stop, and every open focuses the first enabled item.
 */
export declare function Menu({ label, items, triggerVariant, triggerIcon, iconOnly, placement, open, anchor, onAction, onOpenChange, overrides }: MenuProps): React.JSX.Element;
//#endregion
//#region src/Tooltip.d.ts
type TooltipPlacement = "top" | "bottom" | "start" | "end";
type TooltipDelay = "default" | "none";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TooltipOverridableBinding = "radius" | "paddingBlock" | "paddingInline" | "offset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "shadow" | "layer" | "enter" | "exit";
interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error. */
  children: React.ReactNode;
  /** Preferred side; flips when it would overflow the window (measured with `measureInWindow`). `start`/`end` are logical and mirror in right-to-left. */
  placement?: TooltipPlacement | undefined;
  /** `true`: supplementary, becomes the child's `accessibilityHint`. `false`: it IS the child's name and becomes `accessibilityLabel` instead. */
  describes?: boolean | undefined;
  /** Controlled visibility, for stories and tests only. Product code never sets it: a tooltip is hover, focus and long-press driven. */
  open?: boolean | undefined;
  /** Hover delay before showing (react-native-web): `default` waits `motion.duration.base` × 3; `none` shows instantly. */
  delay?: TooltipDelay | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Tooltip — the smallest overlay: a label that names an icon-only button or adds a
 * short clarification to a control, shown while attention is on it.
 *
 * When to use: attach it to an icon-only Button (`describes={false}`, so the tooltip is
 * the accessible name rather than a second announcement) or to a labelled control that
 * needs one more short phrase. Never put essential information, links or controls in it.
 *
 * There is no hover on touch, so native shows nothing by default: `content` is cloned
 * onto the single child as `accessibilityHint` (or `accessibilityLabel` when `describes`
 * is `false`), so the information is never hover-only. A long-press shows the inverted
 * bubble above the child until the press ends, as a sighted-user aid. On
 * react-native-web hover and focus behave as on web: focus shows it immediately, hover
 * waits `hoverDelay` (none when `delay` is `none` or a sibling hid within `warmWindow`),
 * leaving the trigger hides it after `pointerGrace` unless the pointer reaches the
 * bubble, and Escape hides it without moving focus. The bubble is hidden from
 * accessibility — the hint or label on the trigger already carries the text.
 *
 * An Escape dismissal outlives a re-hover: the tooltip stays hidden until the trigger
 * has lost both hover and focus (or, controlled, until `open` next changes).
 *
 * The bubble is not portaled: it is absolutely positioned inside Tooltip's root on
 * `layer.toast`, placed from the trigger's `measureInWindow` rect and flipped on
 * overflow. An ancestor that clips (`overflow: 'hidden'`) or a sibling stacking context
 * above the root can still cover it — the acknowledged native limit.
 *
 * Tooltip exposes no `ref`: it adds no root a caller needs; a caller that wants the
 * trigger refs its own child. Inside a Toolbar it adds no focus stop and no role.
 */
export declare function Tooltip({ content, children, placement, describes, open: openProp, delay, overrides }: TooltipProps): React.JSX.Element;
//#endregion
//#region src/Popover.d.ts
type PopoverPlacement = "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end" | "start" | "end";
type PopoverHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
type PopoverInitialFocus = "first" | "none";
/** Why `onOpenChange` fired. `tab-out` is part of the contract but never emitted on this platform (Pressable sees no key events). */
type PopoverCloseReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** The style bindings a caller may replace with a different token; `surface`, `breakpoint`, `focusRing` and `focusRingWidth` are locked. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "gutter" | "layer" | "enter" | "enterDistance" | "exit";
interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. It is cloned with the toggle `onPress` and Button's `expanded`, so it is typed as a single element; a fragment or anything else warns in development. */
  trigger: React.ReactElement;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: React.ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger's `accessibleName`, else its `accessibilityLabel`, else its string `label`. */
  heading?: string | undefined;
  /** Heading level of the panel heading. React Native has no heading levels: this only selects the Heading's typography, and has no effect in the phone (BottomSheet) presentation. */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); the uncontrolled popover starts closed. */
  open?: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay in the window. `start`/`end` mirror in right-to-left layouts. */
  placement?: PopoverPlacement | undefined;
  /** False (default): tapping outside closes. True: a small Dialog anchored to the trigger — focus trapped, a press outside does nothing, no scrim. No effect on phones, where the sheet is always modal. */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default. */
  showArrow?: boolean | undefined;
  /** Show the close button. Escape and (non-modal) an outside tap work regardless. No effect on phones, where the sheet always shows it. */
  dismissible?: boolean | undefined;
  /** Where focus goes on open. `first` (default) moves accessibility focus into the panel (its body wrapper — native has no descendant walker); `none` moves none, and the composer must move it. No effect on phones, where the sheet always takes focus. */
  initialFocus?: PopoverInitialFocus | undefined;
  /** Fired when the popover opens or closes, with the new state and a reason. */
  onOpenChange?: ((open: boolean, reason: PopoverCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Popover — a small panel that appears next to the thing you pressed and stays out of
 * the way of everything else: a date picker under a field, a filter panel, a help note
 * with a link. Unlike a Tooltip it can hold controls; unlike a Dialog it does not take
 * over the page.
 *
 * When to use: a compact interactive panel tied to a trigger; `modal` when the panel
 * holds a required step (a short form that must be submitted or cancelled); `heading`
 * when the content is not obvious from the trigger. Not for text-only hints (Tooltip),
 * lists of actions (Menu), options (Select/Combobox), or anything bigger than a small
 * panel (Dialog). Do not nest popovers.
 *
 * The trigger is cloned with the toggle `onPress` and Button's `expanded`, so the
 * state is announced. At or below `layout.maxWidth.prose` (phones) the panel is the
 * package's `BottomSheet` with `height="content"`, titled by `heading`, else the
 * trigger's `accessibleName`, else its `accessibilityLabel`, else its string `label`;
 * there it is always modal and always shows its close button, and it is handed
 * Popover's resolved shadow, radius, inset and partGap, plus layer, enter and exit only
 * when the caller overrode them. The Modal exposes no ref, so Popover takes no `ref`:
 * callers ref their trigger. Above the breakpoint (tablets, react-native-web) a
 * transparent `Modal` holds a full-screen transparent backdrop `Pressable` (no scrim,
 * even when `modal`) and a `role="dialog"` panel positioned from the trigger's
 * `measureInWindow()` rect, flipped and shifted to keep `gutter` from the window edges,
 * its width clamped to `min(maxWidth, window − 2 × gutter)`. The panel
 * composes `FocusScope` (`trapped` when `modal`, `active` following `open`), `Heading`,
 * `Button` for the close control and `Box` for the body. It fades and slides
 * `enterDistance` from the trigger side over `enter` (motion.easing.standard) and fades
 * out over `exit` (motion.easing.exit); instantly under reduced motion.
 *
 * Dismissal: Escape (`onRequestClose`: Android back, Esc on react-native-web) always
 * closes; a backdrop tap closes when not `modal`; the close button when `dismissible`.
 * Closing by the trigger, Escape or the close button returns accessibility focus to the
 * trigger once `open` goes false; an outside tap does not. On open, focus lands on the
 * body wrapper — native has no descendant walker to find the first control — unless
 * `initialFocus` is `none`.
 *
 * Acknowledged native limits: `Modal` intercepts every touch behind it, so non-modal
 * means only "tapping outside closes"; Pressable sees no key events, so Tab never
 * leaves the panel and `tab-out` is never reported; the panel is measured once per
 * open and does not follow a scrolling page; the arrow is centered on the panel edge.
 */
export declare function Popover({ trigger, children, heading, headingLevel, open, placement, modal, showArrow, dismissible, initialFocus, onOpenChange, overrides }: PopoverProps): React.JSX.Element;
//#endregion
//#region src/Toast.d.ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastDuration = "short" | "long" | "persistent";
/**
 * Why the toast left the screen. `escape` belongs to the web keyboard model and is
 * never reported on native (there is no Escape to press inside a toast); it stays in
 * the union so handlers are shared across platforms.
 */
type ToastDismissReason = "timeout" | "dismiss-button" | "escape" | "action" | "replaced" | "programmatic";
/**
 * The style bindings a caller may replace with a different token; see the
 * component's overrides contract. `stackGap`, `regionInset` and `layer` govern the
 * region a `ToastProvider` renders (there is one region, not one per toast) and are
 * no-ops when passed to a standalone `Toast`; every other key is in effect on the
 * toast itself.
 */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "stackGap" | "regionInset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter" | "enterOffset" | "exit";
interface ToastProps {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays until dismissed and pauses while touched. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (`motion.duration.loop` × 6 / × 12, so themes without motion
   * still get sensible times), `persistent` until dismissed. When `actionLabel` is set or `tone` is
   * `danger` the toast is persistent regardless of this prop (a dev warning notes the override only
   * when `duration` was passed explicitly as `short` or `long`). If `motion.duration.loop` is 0,
   * both durations are persistent.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this prop. */
  dismissible?: boolean | undefined;
  /** Stable identity; a `ToastProvider` showing a toast with the same toastId replaces the previous one instead of stacking. Unused by a standalone `Toast`. */
  toastId?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the action button is activated, before `onDismiss('action')`. The toast then dismisses. */
  onAction?: (() => void) | undefined;
  /**
   * Fired when the toast begins to leave, with the reason — synchronously, at the state change
   * that starts the exit transition. The toast is removed once that transition ends.
   */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}
/**
 * Toast — says "done" and gets out of the way. Confirms an action just taken,
 * offers one chance to undo it, and leaves without being asked.
 *
 * When to use: confirm a completed action the user did not have to watch (sent,
 * saved, deleted, copied), offer Undo for a reversible action, or report a
 * background result. Match `tone` to the outcome. Never toast an error that needs
 * fixing (use Alert) or anything requiring more than one action. Show toasts through
 * `ToastProvider` + `useToast()` / `toast()`; a notification is an event, not a place
 * in the tree.
 *
 * Renders a `View` carrying the tone's icon (`neutral` has none), the message, an
 * optional action `Button` and a dismiss `Button` — both `ghost` + `inverse`, so they
 * read against `color.inverse.surface` without Toast restyling them.
 * React Native has no `status` role: `danger` gets `accessibilityRole="alert"` and
 * `accessibilityLiveRegion="assertive"`, every other tone no role and `polite`
 * (Android). iOS ignores live regions, so the message is announced once on mount
 * (queued for polite tones, interrupting for `danger`).
 *
 * The toast rises and fades in over `enter`, and sinks and fades out over `exit`;
 * `onDismiss` fires as the exit begins and the toast renders nothing once it ends. Both
 * are instant under reduced motion. A timer dismisses it after
 * the effective duration unless that is `persistent` — which it always is once
 * `actionLabel` is set or `tone` is `danger` (a `__DEV__` warning flags the mismatch).
 * The timer pauses while the toast is touched and while the app is not in the
 * foreground.
 *
 * Acknowledged native limits: F6 and Escape have no native equivalent, so toasts are
 * reached by swiping through the accessibility order and left through the dismiss
 * button, which is always shown for persistent toasts.
 */
export declare function Toast({ message, tone, actionLabel, duration: durationProp, dismissible, overrides, onAction, onDismiss }: ToastProps): React.JSX.Element | null;
/** Options for the imperative `toast()` call; the same shape as `ToastProps`. */
type ToastOptions = ToastProps;
/** What `toast()` resolves to once the toast begins to leave the screen. */
interface ToastResult {
  reason: ToastDismissReason;
}
interface ToastContextValue {
  /**
   * Shows a toast and resolves with `{ reason }` when it begins to leave. Showing a toast with a
   * `toastId` already on screen replaces it; the replaced toast leaves immediately with
   * reason `replaced`, as does the oldest one when a fourth is shown.
   */
  toast: (options: ToastOptions) => Promise<ToastResult>;
  /**
   * Dismisses the toast with this `toastId`, or every shown toast when called with no id,
   * with reason `programmatic`. Each leaves through its exit transition.
   */
  dismiss: (toastId?: string | undefined) => void;
}
interface ToastProviderProps {
  children?: React.ReactNode;
  /** Region-level overrides (`stackGap`, `regionInset`, `layer`). Bindings for the toasts themselves belong on each `toast()` call's own `overrides`. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ToastProvider — mounted once at the app root. Renders the notification region (an
 * absolutely positioned `View` at `layer.toast` z-index, `regionInset` above the
 * bottom edge, centered, up to three toasts stacked newest-at-the-bottom) and exposes
 * `useToast()` / the module-level `toast()` so any code can show one.
 */
export declare function ToastProvider({ children, overrides }: ToastProviderProps): React.JSX.Element;
/** Returns `{ toast, dismiss }` bound to the nearest `ToastProvider`. Warns and no-ops without one. */
export declare function useToast(): ToastContextValue;
/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` at the app root; warns and never resolves otherwise. */
export declare function toast(options: ToastOptions): Promise<ToastResult>;
/** Dismisses the toast with this `toastId`, or every toast when called with no id, with reason `programmatic`. A no-op without a mounted `ToastProvider`. */
export declare function dismiss(toastId?: string | undefined): void;
//#endregion
//#region src/ActionSheet.d.ts
type ActionSheetActionTone = "default" | "danger";
/**
 * One row. `danger` actions are visually distinct and rendered as a group after the
 * others, whatever their position in the array. Every optional field also accepts an
 * explicit `undefined`, since `Menu` builds these objects that way under
 * `exactOptionalPropertyTypes`.
 */
type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
};
/** Why `onClose` fired. */
type ActionSheetCloseReason = "escape" | "scrim" | "cancel" | "drag";
/** The style bindings a caller may replace with a different token; `surface`, `handle`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `maxWidth`, `focusRing` and `focusRingWidth` are locked. */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "headerPaddingBlock" | "headerGap" | "handleHeight" | "handleWidth" | "handleRadius" | "titleSize" | "fontFamily" | "fontSize" | "itemIconSize" | "lineHeight" | "divider" | "dividerWidth" | "layer" | "enter" | "exit";
interface ActionSheetProps {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a dismissal through `onClose` and reports a choice through `onAction`, and the consumer sets `open` to false for both. */
  open: boolean;
  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; when omitted the name is `copy.defaultLabel`. */
  heading?: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last: the default actions render in the order given, then the danger ones in the order given. The count is guidance, not enforced: no dev warning outside that range. */
  actions: {
    id: string;
    label: string;
    icon?: IconName | undefined;
    tone?: "default" | "danger" | undefined;
    disabled?: boolean | undefined;
  }[];
  /** Escape, the scrim, the cancel row and the drag all request close. When false the Cancel row, the divider above it and the drag handle are not rendered, the scrim and the drag do nothing, and Escape still reports through `onClose`; with no `heading` either, the header is not rendered at all. */
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
 * ActionSheet — "what can I do with this?" A short list of verbs for one item, reached
 * from an overflow button or a long-press, with the dangerous ones grouped last and an
 * explicit Cancel because thumbs miss.
 *
 * When to use: contextual actions on an item — share, rename, duplicate, delete —
 * opened from an overflow `Button` (`iconOnly`, label "More actions") or a long-press.
 * Keep it to what fits without scrolling; more than eight actions means the item needs
 * its own screen. Not for navigation, for settings with state, for choosing a value, or
 * for confirming — a danger row opens an `AlertDialog`, it does not itself confirm.
 *
 * Renders a native `Modal` (`visible`, `transparent`, `onRequestClose`,
 * `statusBarTranslucent`) holding a scrim `Pressable` and, inside a `FocusScope`
 * (`trapped`, `restoreFocus`, `autoFocus="none"`, `active` following `open`), an
 * `Animated.View` surface anchored to the bottom carrying `testID="ActionSheet"` and
 * `accessibilityViewIsModal`. The `list` — the scroll region, so the header and Cancel
 * row stay pinned — carries `role="menu"` and the accessible name
 * (`heading ?? copy.defaultLabel`); the heading and the Cancel row are outside it. The
 * surface slides up with `enter` and `motion.easing.standard` and down with `exit` and
 * `motion.easing.exit`, the scrim fading with the same duration and easing, instantly
 * under reduced motion. Once the enter ends, accessibility focus moves to the first
 * enabled row in display order (the default group, then danger).
 *
 * Rows are `Pressable`s with `role="menuitem"` and `accessibilityState={{ disabled }}`;
 * a press guard, not the native `disabled` prop, makes a disabled row inert so it stays
 * reachable and is announced as disabled. Choosing an action never closes the sheet
 * itself. The danger-group divider sits among the rows as `role="separator"` when both
 * groups exist; the cancel divider sits above the Cancel row and is hidden from
 * assistive technology.
 *
 * A `PanResponder` on the header (handle and heading) claims a move past `dragSlop`
 * (`space.1`) downward; on release past `dismissDistance` of the surface height, or
 * faster than `dismissVelocity` between the last two move samples, it fires
 * `onClose('drag')` and holds the released offset until the consumer's next render:
 * `open` false plays the exit from there, `open` still true springs back over `exit`
 * with `motion.easing.standard`. `onRequestClose` (Android back, a hardware Escape) and
 * the VoiceOver escape gesture always report `onClose('escape')`.
 *
 * Native limits: no arrow keys, Home/End or roving tabindex (`Pressable` has no key
 * events) — each row is its own accessibility focus stop. No wide presentation: `Menu`
 * cannot anchor to an external element, so `maxWidth` has no effect. No ref and no
 * focus restore: the Modal hides the opener from FocusScope, so a caller that needs
 * focus back exactly moves it in its `onClose`.
 */
export declare function ActionSheet({ open, heading, actions, dismissible, cancelLabel, onAction, onClose, overrides }: ActionSheetProps): React.JSX.Element | null;
//#endregion
//#region src/SidePanel.d.ts
type SidePanelSide = "start" | "end";
type SidePanelWidth = "narrow" | "default" | "wide";
type SidePanelPersistent = "never" | "content" | "page";
type SidePanelRole = "complementary" | "navigation";
/**
 * Why `onOpenChange` fired. React Native raises `trigger`, `escape` (the Android back
 * button or the VoiceOver escape gesture), `close-button`, `scrim` and `swipe` only:
 * `outside` never happens — an outside tap lands on the full-screen scrim `Pressable`,
 * transparent when `scrim` is false, and is reported as `scrim` — `navigation` has no
 * router hook to observe, and `action` exists for a consumer's own footer handler
 * reusing this callback. All three stay in the type so the reason is one union across
 * platforms.
 */
type SidePanelCloseReason = "trigger" | "escape" | "close-button" | "scrim" | "outside" | "swipe" | "action" | "navigation";
/**
 * The style bindings a caller may replace with a different token; `surface`, `focusRing`
 * and `focusRingWidth` are accessibility-bearing, so they are locked and ignored if passed.
 */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "headingGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface SidePanelProps {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and
   * a label like "Menu"). It stays a toggle — pressing it again closes — and is cloned to
   * carry the disclosure state as `accessibilityState.expanded`. Omit to control `open`
   * from elsewhere (a Toolbar). Not rendered once `persistent` takes over.
   */
  trigger?: React.ReactNode | undefined;
  /**
   * Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled
   * panel always starts closed and there is no `defaultOpen`, so a panel that must start
   * open is controlled.
   */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). Required regardless of `hideHeading`. */
  heading: string;
  /**
   * Keep the title for assistive technology but do not show it: on native it is the
   * surface's `accessibilityLabel`. When the header would then be empty — no close button,
   * because `dismissible` is false or the panel is persistent — the header part is not
   * rendered at all: no padding, no gap, no height. When the header keeps only the close
   * button, that button is end-aligned in it.
   */
  hideHeading?: boolean | undefined;
  /**
   * The body: a Stack of navigation Links, a Stack of filter controls, a Stack of Cards.
   * Scrolls inside the overlay panel when taller than the window; the persistent sidebar
   * takes its natural height and the screen scrolls instead.
   */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area (a sign-out Button, an "Apply filters" row). */
  footer?: React.ReactNode | undefined;
  /** The edge the panel slides from. `start` is left in left-to-right layouts and right under `I18nManager.isRTL`; `end` the opposite. */
  side?: SidePanelSide | undefined;
  /** `narrow` for a list of links, `wide` for a form or a detail. On phones the panel is the window width minus `edgeGutter`, so a strip of scrim stays visible. */
  width?: SidePanelWidth | undefined;
  /**
   * Above this window width the panel stops being an overlay and becomes a sidebar beside
   * the content: always visible, no Modal, no scrim, no trap, no close button, and the
   * trigger is not rendered. `content` switches at `layout.maxWidth.content`, `page` at
   * `layout.maxWidth.page`; the comparison is `window width > token`, so exactly the token
   * width is still the overlay. It is a width check, not an orientation check.
   */
  persistent?: SidePanelPersistent | undefined;
  /**
   * The landmark the persistent sidebar exposes through the RN `role` prop: `navigation`
   * for a menu of Links, `complementary` for filters, a cart, a detail. React Native has no
   * landmark roles in the overlay presentations, which expose only their label.
   */
  role?: SidePanelRole | undefined;
  /**
   * `false` (the default, the APG disclosure pattern): focus stays on the trigger when the
   * panel opens. `true`: a modal panel at the edge — always a scrim, focus moved in, and
   * screen-reader users confined by `accessibilityViewIsModal` — for a panel that must be
   * finished or dismissed.
   */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too (modal always has one). Turn it off for a panel that should feel like part of the page. */
  scrim?: boolean | undefined;
  /**
   * Escape (the back button), the close button, a scrim tap and the swipe all request
   * close. When false the close button is not rendered and a scrim tap and the swipe do
   * nothing; Escape still reports `onOpenChange(false, 'escape')` — the consumer decides —
   * so an uncontrolled non-dismissible panel reports it and stays open. Only those four are
   * gated: the trigger toggle always closes.
   */
  dismissible?: boolean | undefined;
  /**
   * On touch, a swipe on the header toward the edge dismisses the panel. Purely additive:
   * the trigger and close button always exist (WCAG 2.5.1). The edge-to-open swipe is
   * `useSidePanelEdgeSwipe`, which needs a controlled `open`.
   */
  swipeable?: boolean | undefined;
  /** Fired after the panel opens or closes, with the new state and the reason it changed. */
  onOpenChange?: ((open: boolean, reason: SidePanelCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * SidePanel — the drawer: hidden off the edge until the trigger asks for it, then sliding
 * in beside the page. Non-modal by default (the APG disclosure pattern: the trigger keeps
 * focus and carries the expanded state); `modal` makes it a modal panel at the edge, for
 * content that must be finished or dismissed. Above `persistent`'s breakpoint it stops
 * being an overlay and is simply there, as a sidebar — so a product has one menu, not a
 * phone menu and a desktop one.
 *
 * When to use: primary navigation on phones (`start`), filters, a cart or a detail panel
 * (`end`), a settings drawer. Not for a short list of actions (Menu, ActionSheet), a task
 * with a few fields (Dialog, BottomSheet), or content that is the page's point. Do not
 * stack side panels.
 *
 * Overlay: a native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself — `statusBarTranslucent`) holding a full-screen scrim (`color.overlay.scrim` when
 * `modal` or `scrim`, fully transparent otherwise) with a `Pressable` over it that catches
 * every outside tap and reports `scrim` either way, and an `Animated.View` surface at the
 * `side` edge (`I18nManager.isRTL` flips it) whose width is the width binding capped at the
 * window minus `edgeGutter`. It slides in over `enter` with `motion.easing.standard` and
 * out over `exit` with `motion.easing.exit`, the scrim fading with it, instant under
 * reduced motion. `FocusScope` (`trapped={modal}`, `autoFocus` only when modal, restoring
 * to the trigger) wraps the surface from outside, since its wrapper `View` cannot be styled
 * or height-constrained; inside the surface a `SafeAreaView` holds the parts column, which
 * carries `partGap` and the block padding from `inset` (`SafeAreaView` ignores its own
 * padding) around the header, the scrolling body and the pinned footer.
 *
 * The swipe lives on the header, never on the close button: a touch that starts inside
 * `SidePanel.closeButton` is remembered, so the header's responder declines it and the tap
 * still activates the button. The drag claims a move past `dragSlop` (`space.1`) toward the
 * edge and counts from where the slop was crossed, so the surface does not jump, and it
 * follows the finger even under reduced motion because it is user-driven. Released past
 * `dismissDistance` of the measured surface width, or faster than `dismissVelocity` between
 * the last two move samples, it reports `swipe` and then holds the released offset — there
 * is no momentum or decay — until the consumer's next render: closed, the normal exit plays
 * from there; still open, it springs back over `exit` with `motion.easing.standard`, a
 * timing animation and never a spring, which also finishes an interrupted enter.
 *
 * Persistent (window width > the chosen `layout.maxWidth.*` token): a plain `View` where
 * SidePanel sits, carrying the RN `role` prop and `heading` as its label, the `border` on
 * the edge facing the content, the width binding as its width and its natural height. It
 * pads no safe area — the screen owns that — and renders no Modal, scrim, close button or
 * trigger.
 *
 * Native limits, all accepted by the doc: the non-modal "page stays live" cannot be
 * reproduced under `Modal`, which intercepts every touch, so only tap-outside-to-close is
 * possible; there is no Tab order to stitch or wrap; the Modal window itself stands in for
 * the inert page and scroll lock has no meaning, with `accessibilityViewIsModal` confining
 * screen-reader users. `role` is not exposed in overlay mode (a modal panel is a `dialog`,
 * a non-modal one carries only its label), no ref is exposed at all, and
 * crossing the persistent breakpoint changes the root between `Modal` and `View`, so the
 * children remount and lose their state.
 */
export declare function SidePanel({ trigger, open, heading, hideHeading, children, footer, side, width, persistent, role, modal, scrim, dismissible, swipeable, onOpenChange, overrides }: SidePanelProps): React.JSX.Element;
interface UseSidePanelEdgeSwipeOptions {
  /** Must match the SidePanel's own `side`; the hook flips it for RTL the same way. */
  side?: SidePanelSide | undefined;
  /** Turn the gesture off — while the panel is already open, or on a screen that should not have it. */
  enabled?: boolean | undefined;
  /** Fired when an edge swipe crosses the open threshold. The consumer sets its own controlled `open`; the hook knows nothing about the panel it opens. */
  onOpen: () => void;
}
/**
 * A `PanResponder` for the screen root that opens a controlled `SidePanel` on a swipe from
 * its `side` edge — additive to the trigger, never the only way in (WCAG 2.5.1). The panel
 * has to be controlled: an uncontrolled one exposes nothing to open by hand. Spread the
 * returned `panHandlers` onto the screen's root view; the gesture starts in the `edgeZone`
 * strip (`size.target.comfortable`) at the edge, outside the closed panel's own surface.
 *
 * It follows the same rules as the dismiss swipe, measured toward the content: it claims a
 * move past `dragSlop` (`space.1`), and a release past `dismissDistance` of the window
 * width — the only extent the hook can see, and within a gutter of the panel's own width on
 * a phone — or faster than `dismissVelocity` between the last two move samples opens the
 * panel. The surface itself does not track the finger, since the hook does not own it.
 */
export declare function useSidePanelEdgeSwipe({ side, enabled, onOpen }: UseSidePanelEdgeSwipeOptions): {
  panHandlers: PanResponderInstance["panHandlers"];
};
//#endregion
//#region src/Tabs.d.ts
type TabsActivation = "automatic" | "manual";
type TabsOrientation = "horizontal" | "vertical";
type TabsFit = "start" | "fill";
/**
 * One tab. `badge` is a short count or status shown after the label ("3", "New"). The icon is
 * an Icon at `size: md` in the tab's current foreground color.
 */
type TabsItem = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
};
/** @deprecated Use `TabsItem`. */
type TabsTab = TabsItem;
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeWeight" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
interface TabsProps {
  /** The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). */
  tabs: TabsItem[];
  /** One `TabPanel` per tab, in the same order, each with a matching `id`. Only the selected panel is rendered unless `keepMounted`. */
  children: React.ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it (fine when panels are cheap);
   * `manual` moves focus only and selects on Enter/Space (use when a panel loads data).
   * Arrow keys reach a tab list only through react-native-web or a hardware keyboard;
   * a touch always selects the touched tab.
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  orientation?: TabsOrientation | undefined;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((value: string) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}
interface TabPanelProps {
  /** Must match a `tabs[].id`. */
  id: string;
  children?: React.ReactNode | undefined;
}
/** Wraps one tab's content. Rendered by `Tabs`, never directly. */
export declare function TabPanel({ children }: TabPanelProps): React.JSX.Element;
/**
 * Tabs — one region of a screen showing one of several equal-standing views.
 *
 * When to use: two to about seven alternative views of one region — the sections of a
 * settings page, "Overview / Activity / Files" on a record. `manual` activation when a
 * panel is expensive to show, `vertical` when there are many tabs and horizontal room is
 * short, `fill` on phones for two to four tabs. Not for navigation between pages (a nav
 * Landmark of Links), not for a sequence (Stepper), not for panels the user must compare.
 *
 * Renders a `ScrollView` (fit `start`, and every vertical list: overflowing tabs scroll, the
 * selected tab kept in view) or a row `View` whose tabs share the width (horizontal fit `fill`) of `Pressable`s
 * with `accessibilityRole="tab"`, `accessibilityState={{ selected, disabled }}` and
 * `accessibilityValue` from `copy.position`; the list carries `accessibilityRole="tablist"`
 * and `accessibilityLabel={label}`. The indicator is an `Animated.View` positioned from
 * each tab's measured layout and moved over `transition` with `motion.easing.standard`,
 * snapping under reduced motion. Panels are `View`s; only the selected one renders
 * unless `keepMounted`, when the rest stay mounted with `display: 'none'` and hidden
 * from assistive technology.
 *
 * Keyboard: on react-native-web the list handles `onKeyDown` — arrows along the
 * orientation move focus between enabled tabs and wrap (selecting under `automatic`),
 * Home/End jump, Enter/Space press the focused tab, and only the selected tab is a tab
 * stop (roving). On iOS/Android there is no key event on `View`/`Pressable`, so every
 * tab is its own accessibility stop, as on native, and a press always selects.
 */
export declare function Tabs({ tabs, children, label, value, defaultValue, activation, orientation, fit, keepMounted, onChange, overrides, ref }: TabsProps): React.JSX.Element;
//#endregion
//#region src/SegmentedControl.d.ts
type SegmentedControlSize = "sm" | "md";
/** One option. Labels are one word; with `iconOnly` the label becomes the accessible name. */
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
  /**
   * Two to five options (guidance, not enforced: any count renders, with no warning). Labels
   * are one word; with `iconOnly` the label becomes the accessible name. The icon is an Icon
   * whose `size` is the control's `size`.
   */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /**
   * Initially selected value. Defaults to the first enabled option — a segmented control
   * always has a selection. A `value` or `defaultValue` is taken as given, never corrected:
   * one naming a disabled option keeps that segment checked with the pill under it; one
   * matching no option checks nothing and draws no pill.
   */
  defaultValue?: string | undefined;
  /**
   * Show icons only (every option must have one); labels become accessibility labels. An
   * option without `icon` warns in development (once) and shows its label as text instead.
   */
  iconOnly?: boolean | undefined;
  /** Toolbar (`sm`) or standard (`md`) height. */
  size?: SegmentedControlSize | undefined;
  /** Stretch to the container width with equal segments. */
  fill?: boolean | undefined;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: ((value: string) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View` (the radiogroup). */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * SegmentedControl — switches a mode: list or grid, day or week, metric or imperial.
 * Exactly one segment is always selected and choosing one takes effect at once; there
 * is nothing to submit, which is what separates it from a RadioGroup in a form.
 *
 * When to use: two to five short, parallel options that change what a region shows or
 * how a tool behaves, switched often with the effect seen immediately. `iconOnly` in
 * toolbars where the icons are unambiguous. Not for a value submitted later
 * (RadioGroup), views of content (Tabs), more than five options (Select), or on/off
 * (Switch).
 *
 * Renders a `View` row with `accessibilityRole="radiogroup"` and `accessibilityLabel`,
 * on `groupBackground` with `groupPadding`, holding one `Pressable` per option with
 * `accessibilityRole="radio"` and `accessibilityState={{ checked, disabled }}`; each
 * segment is its own accessibility stop on native. The pill is an `Animated.View`
 * (hidden from assistive technology) positioned from each segment's measured layout
 * and slid over `transition` with `motion.easing.standard`, snapping under reduced
 * motion. Selection is also carried by the stronger, heavier label and the checked
 * state, never by the pill alone. Every segment reaches `size.target.comfortable`
 * (touch), so `size` changes the type and padding, not the target.
 *
 * Keyboard: on react-native-web the group handles `onKeyDown` — ArrowRight/ArrowDown
 * and ArrowLeft/ArrowUp move focus AND selection to the next/previous enabled segment,
 * wrapping; Home/End to the first/last enabled one — and only the selected segment is
 * a tab stop (roving). iOS/Android deliver no key events to `View`/`Pressable`, so a
 * hardware keyboard reaches each segment as its own stop and Enter/Space press it.
 * With `iconOnly` the label is the segment's accessibility label; native has no hover
 * or focus Tooltip, so none is shown.
 */
export declare function SegmentedControl({ label, options, value, defaultValue, iconOnly, size, fill, onChange, overrides, ref }: SegmentedControlProps): React.JSX.Element;
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
/** A labelled cluster of options, rendered with a non-interactive group label row. Groups do not nest. */
type ListboxGroup = {
  group: string;
  options: ListboxOption[];
};
/** One entry of `options`: an option or a group of options. Select and Combobox take the same array. */
type ListboxItem = ListboxOption | ListboxGroup;
/** The selection: a value, or with `multiple` an array of values. */
type ListboxValue = string | string[];
/** Height in rows before the list scrolls; `all` never scrolls. */
type ListboxMaxVisible = 5 | 8 | 12 | "5" | "8" | "12" | "all";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ListboxOverridableBinding = "border" | "borderInvalid" | "partGap" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionWeight" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "typeaheadReset";
interface ListboxProps {
  /** Accessible name of the list; also the `{label}` in `copy.required` and `copy.invalid`. */
  label: string;
  /** Flat or grouped options; groups do not nest. */
  options: ListboxItem[];
  /** Allow any number of selections. The value becomes an array; each option shows a check indicator; selection toggles. */
  multiple?: boolean | undefined;
  /**
   * Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. The shape
   * that does not match the mode is normalised: single-select takes an array's first entry,
   * multi-select reads a bare string as a one-entry array.
   */
  value?: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: on the web keyboard model, arrow keys select as they move.
   * Native rows have no key events, so this is accepted for parity with no runtime effect.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /** Marks the list invalid (`borderInvalid` when not `embedded`) with `copy.invalid`. */
  invalid?: boolean | undefined;
  /** Error message rendered below the list; implies invalid. Not a live region: it reaches the rows as their accessibility hint. */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and
   * radius; the list draws none of its own, and overrides of those bindings are no-ops.
   * It keeps its own `listPadding`.
   */
  embedded?: boolean | undefined;
  /**
   * The option pre-highlighted as active. It wins when it names an enabled option;
   * otherwise the first selected, else the first enabled. Visual only on native: there
   * is no single tab stop to move, and the pre-highlight never fires `onActiveChange`.
   */
  initialActiveValue?: string | undefined;
  /**
   * The active row, driven by a host (Select, Combobox, Search). Set, it wins over
   * `initialActiveValue`: the active background follows it, and `null` means no row is active.
   * Row focus and hover only report through `onActiveChange`; the host passes the value back.
   * Native has no single tab stop, so this pre-highlights a row as `initialActiveValue` does.
   */
  activeValue?: string | null | undefined;
  /** Options are being fetched; shows `copy.loading` in place of the empty message and marks the list busy. */
  loading?: boolean | undefined;
  /** The whole list is inert but readable: rows stay focusable, taps do nothing, and the list dims once. */
  disabled?: boolean | undefined;
  /** Field name for Form collection: a string in single-select, an array with `multiple`; nothing selected submits no key. */
  name?: string | undefined;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls, computed from tokens; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the selection changes, with the new value (array in option order when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the active (focused or hovered) row changes; null when the active row loses focus. Never on mount. */
  onActiveChange?: ((value: string | null) => void) | undefined;
}
/**
 * Listbox — the engine behind a picker: the list a Select's popup or a Combobox's
 * suggestions renders, so all of them behave identically, including for multi-select.
 *
 * Renders a `FlatList` (virtualised) of `Pressable` rows with
 * `accessibilityRole="menuitem"` (native has no listbox/option roles) and
 * `accessibilityState={{ selected, checked, disabled }}` (`checked` only with `multiple`).
 * Find the list by its accessible label, never by role. Groups are plain label rows, not
 * the header trait. `maxVisible` becomes `maxHeight` from the token formula: rows ×
 * (max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock) + 2 × focusRingWidth),
 * plus 2 × listPadding, plus 2 × borderWidth when not `embedded`; never measured. Each row
 * is its own accessibility stop and a tap is the selection: arrows, Home/End, Page keys,
 * typeahead, Shift+Arrow and Ctrl+A have no native form, and `selectionFollowsFocus` and
 * `typeaheadReset` have no runtime effect. The active row (focused, hovered, pre-highlighted,
 * or named by a host's `activeValue`) gets `color.background.subtle`; focus draws a `color.border.focus`
 * border that is always reserved. Selection shows by weight, and with `multiple` by the
 * check (an invisible slot when unselected, so labels align). Inside a Form the list
 * registers by `name`; the message below it follows `error` → Form error →
 * `copy.required` / `copy.invalid`, and a failed submit moves accessibility focus to the
 * first selected row, else the first enabled one.
 */
export declare function Listbox({ label, options, multiple, value, defaultValue, selectionFollowsFocus: _selectionFollowsFocus, required, invalid, error, embedded, initialActiveValue, activeValue: activeValueProp, loading, disabled, name, emptyMessage, maxVisible, overrides, ref, onChange, onActiveChange }: ListboxProps): React.JSX.Element;
//#endregion
//#region src/Select.d.ts
/** Which picker surface to use. See `Select`'s doc for how each maps on this platform. */
type SelectNative = "auto" | "always" | "never";
/** The selection: a value, or with `multiple` an array of values. */
type SelectValue = ListboxValue;
/** `sm` for pickers inside toolbars and calendar headers. */
type SelectSize = "sm" | "md";
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`triggerBackground`, `triggerBorder`,
 * `triggerBorderFocus`, `valueColor`, `placeholderColor`, `chevron`, `descriptionText`,
 * `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`) carry contrast or target
 * guarantees and are not in the union.
 */
type SelectOverridableBinding = "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerGap" | "chevronReserve" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "disabledOpacity" | "enter";
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
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
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
  /** Not openable and not submitted. Stays visible and focusable. Wins over a controlled `open`. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /**
   * `auto` (default) and `always`: a `BottomSheet` on phone-width screens, the positioned
   * popup on tablets and react-native-web. `never`: the popup everywhere. There is no OS
   * picker to force without a dependency the package does not take.
   */
  native?: SelectNative | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: SelectValue) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Select — the field for "one of these" (or "any of these") when the list is longer
 * than a RadioGroup should show and typing is not the natural way in.
 *
 * When to use: a form field with about seven to fifty recognisable options — country,
 * role, status. Use `multiple` for tags or memberships. Use Combobox instead when typing
 * to filter is faster than scrolling, or free text is allowed. Do not use it for two to
 * six options (RadioGroup), for actions (Menu), for modes (SegmentedControl), or for
 * on/off (Switch).
 *
 * Renders a `Pressable` trigger (`accessibilityRole="combobox"`, `accessibilityLabel`,
 * `accessibilityHint`, `accessibilityState={{ expanded, disabled }}`,
 * `accessibilityValue={{ text }}` with the selected label(s), the count, or the
 * placeholder) showing the value and a `chevron-down` `Icon`. A long value is clipped to
 * one line with an ellipsis. Activating the trigger opens an `embedded` `Listbox` (given
 * no `name`, so Select alone is the field, `selectionFollowsFocus: false`, and the first
 * selection as `initialActiveValue`): a `BottomSheet` on phone-width screens
 * (`layout.maxWidth.prose` and narrower) with a `copy.done` footer button for `multiple`,
 * or else a transparent `Modal` whose popup sits below the trigger (flipped above when
 * there is no room), at least as wide as it, on `layer.dropdown`, fading in over `enter`.
 * Closing is instant on every platform, as on web. Escape (the Android back gesture) and
 * an outside tap close without changing the value; focus returns to the trigger by hand
 * (`AccessibilityInfo.setAccessibilityFocus`), since `FocusScope`'s restore only
 * recaptures a `TextInput`. Selecting an option commits and, for a single select, closes;
 * re-picking the selected option closes without firing `onChange`. `Pressable` sees no
 * keys, so Enter-as-press is the only other keyboard rule — Tab-commits-and-closes has no
 * native form.
 *
 * `disabled` wins over a controlled `open`: a disabled Select never shows its popup, is
 * not submitted, and stays visible and focusable (the `disabled` prop is never passed to
 * the `Pressable`, which would take it out of the tab order; react-native-web gets
 * `aria-disabled` on the DOM node instead, and `aria-expanded` is mirrored because
 * react-native-web drops `accessibilityState`).
 *
 * Validation works as `Input`'s: precedence `error`, then `required` (`copy.required`),
 * then `invalid` (`copy.invalid`), registered with the enclosing `FormContext` by `name`
 * with a string value for a single select and a `string[]` with `multiple`.
 */
export declare function Select({ label, name, options, value, defaultValue, placeholder, hideLabel, size, open: openProp, multiple, description, required, disabled, invalid, error, native, overrides, ref, onChange, onOpenChange }: SelectProps): React.JSX.Element;
//#endregion
//#region src/Combobox.d.ts
/** How typing narrows `options`. `none` never filters (type-ahead only); `async` leaves filtering to the consumer. */
type ComboboxFilter = "startsWith" | "contains" | "none" | "async";
/** The selection: a value, or with `multiple` an array of values. An empty string / empty array is "nothing selected". */
type ComboboxValue = string | string[];
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ComboboxOverridableBinding = "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
interface ComboboxProps {
  /** Visible label. Always rendered. Also the input's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxItem[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: string | string[] | undefined;
  /** Initial value(s). */
  defaultValue?: string | string[] | undefined;
  /** Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default. */
  open?: boolean | undefined;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /** Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip. */
  multiple?: boolean | undefined;
  /** Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma commits it; the list shows `copy.addCustom` as a synthetic first row. */
  allowCustom?: boolean | undefined;
  /** How typing narrows `options`: by prefix, by substring (default), not at all (type-ahead), or by the consumer (`async`). */
  filter?: ComboboxFilter | undefined;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string | undefined;
  /** Helper text under the label. Also the input's `accessibilityHint`. */
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
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: ((value: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Combobox — an input that narrows as you type and lets you pick, or, with
 * `allowCustom`, keep what you typed.
 *
 * When to use: long lists (fifty-plus), values typed faster than found, `async`
 * search against a server, and multi-value fields where chips make the selection
 * legible. Use Select for short static lists.
 *
 * Composes the same `Listbox` engine as `Select` (`embedded`). On phones the field is
 * a `Pressable` summary (chips read-only) that opens a `BottomSheet height="full"`
 * with the chips and the `TextInput` at the top of its body, the `Listbox` below and
 * a `copy.done` footer Button; on tablets and react-native-web the field holds the
 * `TextInput` directly and the popup is an absolutely positioned sibling of the field,
 * anchored under it (flipped above when there is no room) on `layer.dropdown`. It is
 * deliberately not a `Modal`: react-native-web's `Modal` always wraps its children in a
 * focus trap, which would pull DOM focus out of the input the moment the list opened —
 * and the APG model keeps focus in the text input while the list is browsed. There is no
 * scrim either: an outside tap blurs the input, and blur is what closes the list.
 * Listbox rows are touch `Pressable`s with no key
 * events, so arrow browsing, Alt+ArrowDown and Tab-without-committing have no native
 * equivalent: a tap commits, Enter or a comma through the `TextInput` commits typed
 * custom text, Escape (hardware keyboard / react-native-web) closes then clears the
 * text, and blurring the anchored field closes the list. Result counts, loading and
 * empty states are announced with `AccessibilityInfo.announceForAccessibility` after
 * `motion.duration.base × 2`. Validation and Form registration work as `Input`'s:
 * `error` prop → `required` → `invalid`.
 */
export declare function Combobox({ label, name, options, value, defaultValue, open: openProp, inputValue, multiple, allowCustom, filter, placeholder, description, required, disabled, invalid, error, loading, clearable, overrides, ref, onChange, onInputChange, onOpenChange }: ComboboxProps): React.JSX.Element;
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
/** Open ids. A bare `string` is shorthand for a one-id array; `[]` or `''` means nothing is open. */
type AccordionValue = string | string[];
/**
 * Why a section's open state changed, passed to `onOpenChange`. React Native cannot tell a
 * hardware Enter/Space activation from a touch on `Pressable`, so `keyboard` never fires here.
 */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type AccordionOverridableBinding = "divider" | "dividerWidth" | "itemGap" | "triggerPaddingBlock" | "fontFamily" | "triggerFontSize" | "triggerFontWeight";
interface AccordionProps {
  /** The sections in order. `content` is the panel body. */
  items: {
    id: string;
    summary: string;
    content: React.ReactNode;
    disabled?: boolean | undefined;
  }[];
  /** Heading level for every trigger, so sections appear in the page outline. Native has no heading levels: every trigger's summary is `accessibilityRole="header"` and the value itself changes nothing else. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /** Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. Turning it on while several sections are open trims the open set to the first open id without firing any event. */
  exclusive?: boolean | undefined;
  /** Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty string means nothing is open. Events always report an array, with zero or one entry when `exclusive`. */
  value?: string | string[] | undefined;
  /** Initially open ids; the same shapes as `value`. */
  defaultValue?: string | string[] | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean | undefined;
  /** Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where it carries zero or one entry. */
  onChange?: ((openIds: string[]) => void) | undefined;
  /** Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content, or scrolling the opened section into view; `onChange` remains the set-level event for state. */
  onOpenChange?: ((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (the `list` part). */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Accordion — a list of Disclosures that know about each other: consistent headings,
 * and optionally the rule that opening one closes the rest.
 *
 * When to use: a series of independent sections a user scans by heading and opens
 * selectively — an FAQ, a settings page grouped by topic, a multi-part form where each
 * part is optional. Leave `exclusive` off unless the panels are heavy or mutually
 * exclusive by nature. Do not use it for content most users need, as navigation, as
 * tabs, nested, or for a single section (that is a Disclosure).
 *
 * Renders the `list` part as a `View` (its `gap` is `itemGap`) of `Disclosure`s — the `item`
 * part is each Disclosure's root, a direct child — with a `Divider` between them when
 * `divided`. The accordion owns the open set (or defers to `value`) and passes
 * `open`/`onToggle`, `headingLevel` and `keepMounted` to each Disclosure, forwarding
 * `triggerPaddingBlock`, `fontFamily` (as `triggerFontFamily`), `triggerFontSize` and
 * `triggerFontWeight` to its `overrides`; `divider`/`dividerWidth` reach each Divider's
 * `color`/`thickness`. Disabled items stay visible and focusable but do not toggle.
 *
 * Acknowledged native limit: `Pressable` has no key events, so ArrowUp/Down/Home/End are
 * not implemented (on react-native-web too); every trigger is an ordinary accessibility
 * stop reached by swipe or Tab, and `onOpenChange` reports `trigger` for every activation.
 * `headingLevel` only marks each summary `accessibilityRole="header"`.
 */
export declare function Accordion({ items, headingLevel, exclusive, value, defaultValue, divided, keepMounted, onChange, onOpenChange, overrides, ref }: AccordionProps): React.JSX.Element;
//#endregion
//#region src/Slider.d.ts
type SliderShowValue = "always" | "hover" | "never";
interface SliderMark {
  value: number;
  label?: string | undefined;
}
type SliderValue = number | [number, number];
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "haloSpread" | "mark" | "markSize" | "markLabelSize" | "markLabelGap" | "valueSize" | "bubblePaddingBlock" | "bubblePaddingInline" | "bubbleOffset" | "bubbleRadius" | "labelWeight" | "partGap" | "labelGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "disabledOpacity" | "transition";
interface SliderProps {
  /** Visible label naming the quantity ("Volume", "Price range"). A range's thumbs are named from `copy.minimumLabel`/`copy.maximumLabel`. */
  label: string;
  /** Field name for the Form: a single value registers as its decimal string, a range as two strings. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the adjustable actions and snapping granularity for drag and press. */
  step?: number | undefined;
  /** With `marks`, snap drag and press to the marks instead of `step` (increment/decrement still move by step; the page actions go to the next mark, and past the last mark to `max`/`min`). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default (`defaultValue`, else `min` or `[min, max]`) to submit (`copy.required`). */
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
  /** Where the value text appears: always beside the label, only while pressed or focused (as a bubble above the thumb), or not at all. */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. Values snap to marks only with `snapToMarks`. */
  marks?: SliderMark[] | undefined;
  /** Not adjustable, still readable: thumbs stay accessible, but gestures and actions are ignored and no value is submitted. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or through an accessibility action (number or pair); only when the value actually changed. */
  onValueChange?: ((value: SliderValue) => void) | undefined;
  /** Fired once when the interaction ends (release, or an accessibility action), and only if that interaction changed the value. */
  onSlidingComplete?: ((value: SliderValue) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Slider — a bounded numeric value (or, with `range`, a minimum and a maximum) chosen by
 * feel: the thumb sits on the value, the fill shows how much, and every value the drag
 * reaches is also reachable through the adjustable accessibility actions.
 *
 * When to use: a bounded value where approximate is fine and the scale has meaning across
 * its whole width — volume, brightness, a price range. Use `range` for "between" filters,
 * `marks` for meaningful stops, and pair with a NumberInput (`showValue: never`) when exact
 * entry also matters. Not for exact values, more than about a hundred steps without marks,
 * or two or three discrete choices.
 *
 * Each thumb is its own adjustable element: increment/decrement move by `step`; PageUp,
 * PageDown, Home and End are custom actions labelled from copy. Dragging a thumb, or
 * pressing and dragging anywhere on the track area (which moves the nearest thumb), snaps to
 * `step`, or to the marks with `snapToMarks`. `onValueChange` fires on every change,
 * `onSlidingComplete` once per interaction (release, or each accessibility action), and
 * neither fires when the value did not change. A range's thumbs cannot cross; each thumb's
 * `accessibilityValue` min/max is the live constraint from the other. `disabled` (or a
 * disabled Form or Fieldset) dims the whole slider with `disabledOpacity` and leaves it
 * readable but inert. Inside a Form the field registers once: its value as a decimal
 * string, or a range as two strings; `validate: blur` runs when an interaction ends.
 * Hardware-keyboard keys are not handled on native; the accessibility actions cover them.
 */
export declare function Slider({ label, name, min, max, step, snapToMarks, required, invalid, value, defaultValue, range, formatValue, showValue, marks, disabled, description, error, overrides, onValueChange, onSlidingComplete, ref }: SliderProps): React.JSX.Element;
//#endregion
//#region src/Toolbar.d.ts
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarOverflow = "wrap" | "menu" | "scroll";
type ToolbarSize = "sm" | "md";
type ToolbarDensity = "compact" | "comfortable";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "groupGap" | "separatorLength" | "fadeWidth";
interface ToolbarProps {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is
   * drawn between two adjacent groups only (a bare control next to a group gets `itemGap`, no
   * Divider), and only between top-level groups — a group nested inside a group takes no
   * separator and no `size` pass. Consumers never place Dividers themselves.
   */
  children: React.ReactNode;
  /** Vertical toolbars sit beside a canvas; the controls stack along the column. */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: `wrap` onto more rows, or `scroll` with the edges
   * faded. `menu` (the default) renders as `scroll` on React Native — children are opaque and
   * nothing measures them; an explicitly passed `menu` warns once in development.
   */
  overflow?: ToolbarOverflow | undefined;
  /**
   * Default for child Buttons, SegmentedControls, Selects and Searches (recognised by component
   * identity) that do not set their own; applied to direct children and to each ToolbarGroup's
   * children. A child's own `size` wins.
   */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}
interface ToolbarGroupProps {
  /** The group's accessible name. */
  label?: string | undefined;
  /** The group's controls, in order. */
  children: React.ReactNode;
  /** The group's `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * ToolbarGroup — related controls inside a Toolbar. A `View` with `role="group"` and
 * `accessibilityLabel` from `label`, laid out along the toolbar axis with `itemGap` between its
 * controls. The Toolbar draws a Divider between two adjacent groups.
 */
export declare function ToolbarGroup({ label, children, ref }: ToolbarGroupProps): React.JSX.Element;
/**
 * Toolbar — keeps a set of related controls together: one labelled `toolbar` container
 * whose controls keep their own roles and names.
 *
 * When to use: controls that act on the same thing and are used together (text formatting,
 * a table's row actions, a filter–sort–export row). Not for page navigation, a form's
 * submit row, a single control, or as a generic horizontal Stack.
 *
 * Renders a `View` with `accessibilityRole="toolbar"` and `accessibilityLabel` carrying
 * `background` (locked), `border`, `borderWidth`, `radius` and `paddingInline`/`paddingBlock`.
 * Direct children (fragments expanded) and `ToolbarGroup`s are laid out along the axis with
 * `itemGap` (by `density`). Between two adjacent groups the Toolbar renders a
 * `Toolbar.separator` wrapper `separatorLength` long across the axis, padded along it by
 * `groupGap − itemGap` (clamped at 0), holding a `Divider` across the axis with `spacing: none`
 * that stretches to fill it. Sized children (Button, SegmentedControl, Select, Search) without
 * their own `size` receive the toolbar's.
 *
 * `overflow: wrap` wraps rows (columns when vertical). `scroll` — and `menu`, which has no
 * native measurement — puts the controls in a `ScrollView` along the toolbar axis with a
 * react-native-svg gradient `fadeWidth` long from `background` to transparent over each edge
 * that has content hidden past it, re-checked on scroll, layout and content size changes.
 *
 * Acknowledged native limits: no roving focus and no arrow/Home/End handling (Pressable has
 * no key events, react-native-web included) — every control is its own accessibility stop,
 * reached by swipe or by Tab with a hardware keyboard; Enter/Space activation is the control's
 * own. `focusRing`/`focusRingWidth` are applied nowhere: each composed control draws its own
 * ring. The `overflowButton`/`overflowMenu` parts have no element on this platform.
 */
export declare function Toolbar({ label, children, orientation, overflow, size, density, overrides, ref }: ToolbarProps): React.JSX.Element;
//#endregion
//#region src/Carousel.d.ts
type CarouselPicker = "dots" | "tabs" | "none";
type CarouselChangeReason = "next" | "prev" | "picker" | "swipe" | "autoplay";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlRadius" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotRadius" | "radius" | "tabFontSize" | "tabFontWeight" | "tabLineHeight" | "tabPaddingBlock" | "tabPaddingInline" | "fontFamily" | "transition";
interface CarouselSlideProps {
  /**
   * The slide's name in a `tabs` picker. A plain string, not read from the content; the slide
   * repeats it visibly in its own heading. It is not part of the slide's accessible name, which
   * is its position ("2 of 4") alone.
   */
  label: string;
  /** The slide's content. Slides should be equal height. */
  children: React.ReactNode;
}
/** One slide. Rendered by `Carousel`, never on its own. */
export declare function CarouselSlide({ children }: CarouselSlideProps): React.JSX.Element;
interface CarouselProps {
  /** What the carousel shows ("Featured products", "Customer stories"). Names the region. */
  label: string;
  /** One `CarouselSlide` per slide. A Card is the usual shape. Slides should be equal height. */
  children: React.ReactNode;
  /** How many slides are visible at once while the viewport is wider than the prose width; one at or below it. Whole numbers. */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /** Rotate automatically every `interval`. Never starts under reduced motion; pauses while touched or a control has focus; stops on the pause button. */
  autoplay?: boolean | undefined;
  /** Milliseconds between automatic advances; values below 5000 are raised to 5000 (with a development warning). */
  interval?: number | undefined;
  /** How slides are chosen directly: dots, tabs with each slide's label, or none (arrows only). */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping snaps to slide boundaries. `false` lets the track scroll freely. */
  snap?: boolean | undefined;
  /** Fired when the current slide changes, with the new index and the reason. Never fired by a change of a controlled `activeIndex`. */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  /** The region View. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Carousel — shows several things in the space of one and lets the user page through them.
 *
 * When to use: a small set (three to eight) of peer items too rich for a grid — featured
 * products, testimonials, a gallery. `picker="tabs"` when slides have meaningful names,
 * `dots` for images. Leave `autoplay` off unless the content is ambient, and keep the pause
 * control visible. Do not hide important content behind slide two.
 *
 * The region is a plain `View` named by `label`, so every control stays individually reachable.
 * In tree order: the play/pause `Button` in its own row (only when `autoplay` and motion is
 * allowed), the previous/next `secondary` icon-only `Button`s overlaid on the viewport inside
 * their `controlSurface` wrappers, a horizontal `FlatList` track of slides, then the picker of
 * Carousel's own `Pressable`s. Each visible slide is an accessible element with
 * `accessibilityRole="adjustable"` and increment/decrement actions mapped to next/previous — the
 * swipe alternative VoiceOver can reach; slides outside the current page are hidden.
 * Previous/Next move one page of `perView` slides, disabled at the ends unless `loop`.
 * User-initiated changes are announced; autoplay changes are not.
 */
export declare function Carousel({ label, children, perView, loop, autoplay, interval, picker, activeIndex, snap, onChange, overrides, ref }: CarouselProps): React.JSX.Element;
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
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
type TableCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A single record. `id` must be stable; it is what selection and keys use. */
type TableRow = {
  id: string;
  [key: string]: unknown;
};
/** One column definition, in display order. */
type TableColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: "start" | "end" | "center";
  sortable?: boolean;
  width?: "auto" | "min" | "fill";
  isRowHeader?: boolean;
  hideBelow?: "prose" | "content";
  render?: (row: TableRow) => React.ReactNode;
};
/** Sort state: which column, and which way. */
type TableSort = {
  column: string;
  direction: "ascending" | "descending";
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "cellPaddingInline" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedBlockGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface TableProps {
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name; never omitted. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /**
   * Content below the table: a row count, pagination, a total. Rendered in the `footer` part; a string
   * renders in Text with the table's `fontFamily`/`fontSize`/`lineHeight`, other content brings its own typography.
   */
  footer?: React.ReactNode | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions in display order. Exactly one column may be `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts the data. */
  sort?: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself by the column value. */
  defaultSort?: TableSort | undefined;
  /** Adds a first column of Checkboxes (radio-like for `single`) and a select-all for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height minus the section rhythm and scrolls the body; `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: `layout.inset.sm` or `layout.inset.md`. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: the list is busy and shows `copy.loading`; existing rows stay visible. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell: Buttons (ghost, sm, iconOnly) or a Menu. */
  rowActions?: ((row: TableRow) => React.ReactNode) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then descending on the same one. */
  onSortChange?: ((column: string, direction: "ascending" | "descending") => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated (its row-header cell), with its id. */
  onRowPress?: ((id: string) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Table — the honest way to show records that share fields: every row the same shape,
 * every column a comparable thing.
 *
 * When to use: a list of records with three or more comparable fields (orders, invoices,
 * members). `responsive: stack` when each row is a thing a person reads, `scroll` when
 * the columns are the point. Not for layout, one- or two-field lists, key–value pairs, or
 * cells edited in place or navigated with arrows (that is DataGrid).
 *
 * There is no table element on native. The layout follows the table's own measured width
 * (a container query, not the window): below `layout.maxWidth.prose` a `stack` table is a
 * `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) of bordered
 * blocks whose accessible summary joins `copy.cellLabel` for every visible column, row
 * header first, with the selected state; the selection Checkbox and `rowActions` are
 * separate stops beside it, and the sort Buttons and the select-all share one `Toolbar`
 * above the list (`copy.sortToolbarLabel`, `size: sm`, the table's own `density`), named
 * for the table even when the Checkbox is all it holds. At or above that width the
 * same list renders a header row (`accessibilityRole="header"` cells) and rows of
 * fixed-width cells: `width: fill` flexes, `auto` and `min` are both `space.20`.
 * `responsive: scroll` keeps the columns at every width inside a horizontal scroll region
 * named by the caption with `copy.scrollHint` as its hint; the row-header cells are
 * translated by the horizontal offset so they stay pinned, and cast `stickyColumnShadow`
 * once scrolled, with a `scrollFade` gradient over each edge that still hides columns
 * (react-native-svg, as Toolbar does; the start fade begins where the pinned column ends).
 * `stickyHeader` pins the list header (`stickyHeaderIndices`), which casts `headerShadow`
 * once the body has scrolled beneath it — only with `maxHeight: viewport`, at every
 * `responsive` value, since with `maxHeight: none` the page scrolls and the header belongs
 * to the page rather than to this list. `abbr` has no effect on native.
 *
 * Sorting with a controlled `sort` leaves ordering to the caller; otherwise the table
 * sorts `data` from its own state (numbers numerically, anything else with
 * `localeCompare`, numeric collation). Sort Buttons show the header text and carry
 * `copy.sortAscending`/`copy.sortDescending` — what the press will do — as their name.
 * `single` selection behaves like radios, and pressing the selected row again clears it;
 * `multiple` adds select-all, indeterminate when some rows are selected. Sort and
 * selection changes post `copy.sortedAnnouncement` / `copy.selectedCount` to a polite
 * live region (Android) and `AccessibilityInfo.announceForAccessibility` (iOS).
 * `onRowPress` turns the row-header cell into the row's Button and tints the whole row on
 * hover over `transition`; it needs an `isRowHeader` column without a custom `render`
 * (a `__DEV__` warning otherwise, and rows stay inert). Arrow-key scrolling of the scroll
 * region is left to the platform: native hardware keyboards have no equivalent.
 */
export declare function Table({ caption, captionLevel, footer, hideCaption, columns, data, sort, defaultSort, selectable, selected, defaultSelected, responsive, stickyHeader, maxHeight, density, striped, emptyMessage, loading, rowActions, overrides, onSortChange, onSelectionChange, onRowPress, ref }: TableProps): React.JSX.Element;
//#endregion
//#region src/DataGrid.d.ts
type DataGridColumnAlign = "start" | "end" | "center";
type DataGridColumnPinned = "start" | "end";
type DataGridEditorKind = "text" | "number" | "select" | "date" | "checkbox";
type DataGridSortDirection = "ascending" | "descending";
type DataGridSelectable = "none" | "row" | "cell" | "range";
type DataGridDensity = "compact" | "comfortable";
type DataGridHeight = "content" | "viewport" | "fixed";
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
type DataGridCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A single record. `id` must be stable; it is what selection and keys use. */
type DataGridRow = {
  id: string;
  [key: string]: unknown;
};
/** One option for a `select` editor. */
type DataGridColumnOption = {
  value: string;
  label: string;
};
/** One column: Table's column model plus grid concerns (width, resizing, pinning, editing). */
type DataGridColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: "start" | "end" | "center";
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  isRowHeader?: boolean;
  pinned?: "start" | "end";
  editable?: boolean;
  editor?: "text" | "number" | "select" | "date" | "checkbox";
  options?: {
    value: string;
    label: string;
  }[];
  render?: (row: DataGridRow) => React.ReactNode;
  validate?: (value: unknown, row: DataGridRow) => string | undefined;
};
/** Sort state: which column, and which way. */
type DataGridSort = {
  column: string;
  direction: "ascending" | "descending";
};
/** One cell, in `selectable="cell"` mode. */
type DataGridCellSelection = {
  rowId: string;
  column: string;
};
/** A rectangle of cells. `selectable="range"` degrades to `row` on this platform, so the grid never reports one here. */
type DataGridRangeSelection = {
  from: {
    rowId: string;
    column: string;
  };
  to: {
    rowId: string;
    column: string;
  };
};
type DataGridSelection = string[] | DataGridCellSelection | DataGridRangeSelection;
/** A cell value as an editor produces it; `undefined` when the cell has none. */
type DataGridCellValue = string | number | boolean | undefined;
/** `{ column, width }` of a finished column resize (kept for TreeGrid, which shares the column model). */
type DataGridColumnResize = {
  column: string;
  width: number;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHover" | "cellPaddingInline" | "columnWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "resizeStep" | "statusBarSize" | "statusBarPadding" | "statusBarGap" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface DataGridProps {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless, as Table. */
  captionLevel?: DataGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. `width` is pixels (the `columnWidth` binding when omitted); exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a prefix of a larger set (server paging); `onEndReached` asks for more. A whole number. */
  rowCount?: number | undefined;
  /** Controlled sort state; the caller sorts `data`. */
  sort?: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the tapped cell. `range` has no touch model here and degrades to `row`. */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` open their editor when tapped. */
  editable?: boolean | undefined;
  /** Row height: `compact` is the minimum target, `comfortable` the touch target. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized (`height` is not `content`). */
  stickyHeader?: boolean | undefined;
  /** `viewport`: window height minus twice the section gap; `content`: grows with rows; `fixed`: `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Marks the grid busy and shows `copy.loading` in the status bar; existing rows stay, their text muted. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then toggling. */
  onSortChange?: ((column: string, direction: "ascending" | "descending") => void) | undefined;
  /** Fired with the selection: row ids (row mode) or one cell (cell mode). */
  onSelectionChange?: ((selection: string[] | {
    rowId: string;
    column: string;
  } | {
    from: {
      rowId: string;
      column: string;
    };
    to: {
      rowId: string;
      column: string;
    };
  }) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the cell shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: DataGridCellValue, previous: DataGridCellValue) => void) | undefined;
  /** Fired before an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** `onRangeNeeded` on this platform: the list came within one page of the end of `data` and `rowCount` says there is more. */
  onEndReached?: ((start: number, end: number) => void) | undefined;
  /** Fired with the column key and its new width when a drag on the header edge ends, or per resize accessibility action. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * DataGrid — for working in data, not reading it: many rows, cell-level selection, values
 * edited in place. Shares Table's column and data model; a different role and contract.
 *
 * When to use: price lists, inventory counts, timesheets, admin views over large sets. Set
 * `editable` and mark the editable columns, each with a `validate`. Not for records read and
 * acted on by row (Table), a handful of fields (Form), or phone-first screens (Table with
 * `responsive: stack`).
 *
 * There is no grid element on native. The caption is a `Heading` at `captionLevel` (visually
 * hidden with `hideCaption`). A horizontal `ScrollView` (the scroll region) holds a `FlatList`
 * with `role="grid"`, the caption followed by `copy.rowCount` as its `accessibilityLabel`
 * (native has no aria-rowcount, so the total is at least spoken on focus), and a fixed `getItemLayout`
 * from the density's row height, so rows virtualize; the header row (`role="rowgroup"` >
 * `row` > `columnheader`) is its sticky list header, sharing the horizontal scroll with the
 * body and casting `headerShadow` once the body scrolls beneath it. `FlatList` gives the body
 * rows no wrapper, so the `body` rowgroup part has no element here. Rows are `role="row"`
 * Views of fixed-width `role="cell"` / `"rowheader"` Pressables named `copy.cellLabel`.
 * Pinned columns keep their place in `columns` and scroll with the rest (native has no
 * `position: sticky`), casting `pinnedShadow` once the region has moved sideways.
 *
 * The web keyboard model has no equivalent in core React Native (View and Pressable have no
 * key events), so touch replaces it: a sortable header is a `Button`; `selectable="row"`
 * (and `range`, which degrades to it with a `__DEV__` warning) adds `Checkbox` cells and a
 * select-all Checkbox that stands in for Ctrl+A; `cell` selects the tapped cell, where selection
 * follows focus and the inset `cellFocusRing` is its only visual. The scroll region draws
 * `focusRing` while a cell inside it reports focus, so the region's overflow never clips it
 * (react-native-web only — core RN gives View and Pressable no focus events). An editable
 * cell opens its editor on tap (`copy.editHint`), after `onEditStart` allows it: `Input`
 * (commits on blur), `NumberInput` and `DatePicker` (commit when another cell or a sort header
 * is pressed, or through the cell's `activate` accessibility action), `Select` (opens at once
 * and commits on change; closing it cancels) and `Checkbox` (commits on change). The `escape`
 * accessibility action cancels. A failing `validate` keeps the editor open with the cell in
 * cellInvalid* and the message in the status bar. Column resize is a `PanResponder` drag on
 * the always-visible header edge plus increment/decrement accessibility actions on the header
 * cell by `resizeStep`. Copying (Ctrl+C) is not offered: core RN has no clipboard API.
 *
 * The status bar holds one polite live region (loading, validation, editing, sort and
 * selection announcements, with `AccessibilityInfo.announceForAccessibility` on iOS) beside
 * the row count, the selection count, `copy.scrollHint` while columns overflow unscrolled, and
 * `copy.position` for the active cell — which is shown but never announced. With
 * `showStatusBar` false the bar is visually hidden and keeps only the live region.
 */
export declare function DataGrid({ caption, captionLevel, hideCaption, columns, data, rowCount, sort, defaultSort, selectable, selected, editable, density, stickyHeader: _stickyHeader, height, loading, emptyMessage, showStatusBar, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onEndReached, onColumnResize, ref }: DataGridProps): React.JSX.Element;
//#endregion
//#region src/TreeGrid.d.ts
type TreeGridSortDirection = "ascending" | "descending";
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
type TreeGridCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
/**
 * A nested record. `id` must be stable; it is what expansion and selection use.
 * `children: "lazy"` marks a subtree loaded on expand through `onExpand`; `children: []`
 * is a leaf (no expand control, no expanded state).
 */
interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | "lazy" | undefined;
  [key: string]: unknown;
}
/** Sort state: which column, and which way. Applies within each level; the hierarchy is kept. */
type TreeGridSort = {
  column: string;
  direction: "ascending" | "descending";
};
/** One cell, in `selectable="cell"` mode. */
type TreeGridCellSelection = {
  rowId: string;
  column: string;
};
/** Row ids, or one cell, matching `selectable`. */
type TreeGridSelection = string[] | TreeGridCellSelection;
/** A cell value as an editor produces it; `undefined` when the cell has none. */
type TreeGridCellValue = string | number | boolean | undefined;
/** The style bindings a caller may replace with a different token; locked bindings are excluded. */
type TreeGridOverridableBinding = "indent" | "expandGap" | "guideLine" | "guideLineWidth" | "cellPaddingInline" | "fixedHeight" | "parentWeight" | "transition";
interface TreeGridProps {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is the caption size regardless, as DataGrid. */
  captionLevel?: TreeGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required — it carries the indent and the expand control — and comes first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` loads on expand through `onExpand`; `children: []` is a leaf. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. `["*"]` is honoured as in `defaultExpanded`. */
  expanded?: string[] | undefined;
  /**
   * Initially expanded ids. `["*"]` expands every row whose `children` is a non-empty array,
   * rows loaded later included, and never a `"lazy"` row (that would fire `onExpand` without a
   * user act); the first user toggle resolves it to the concrete ids `onExpandChange` reports.
   * A lazy id listed explicitly stays collapsed until the user opens it.
   */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort; the caller orders siblings within each level. */
  sort?: TreeGridSort | undefined;
  /** Initial sort when uncontrolled; the grid orders siblings within each level itself. */
  defaultSort?: TreeGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the tapped cell. Select-all covers every loaded row at every level. */
  selectable?: TreeGridSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a row sets or clears its own id and every loaded descendant; a parent's shown state derives from its loaded descendants. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` open their editor when tapped. */
  editable?: boolean | undefined;
  /** Row height: `compact` is the minimum target, `comfortable` the touch target. */
  density?: TreeGridDensity | undefined;
  /** `viewport`: window height minus twice the section gap; `content`: grows with rows; `fixed`: `overrides.fixedHeight`. */
  height?: TreeGridHeight | undefined;
  /** Marks the grid busy and shows `copy.loading` in the status bar; existing rows stay, their text muted. */
  loading?: boolean | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized (`height` is not `content`). */
  stickyHeader?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with every expanded id, as a bare array. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id each time a row whose `children` is still `"lazy"` opens, so a failed load can retry. Precedes the `onExpandChange` of the same act. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then toggling. */
  onSortChange?: ((column: string, direction: "ascending" | "descending") => void) | undefined;
  /** Fired with the selection: row ids (row mode) or one cell (cell mode). */
  onSelectionChange?: ((selection: string[] | {
    rowId: string;
    column: string;
  }) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the cell shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: TreeGridCellValue, previous: TreeGridCellValue) => void) | undefined;
  /** Fired before an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired with the column key and its new width when a drag on the header edge ends, or per resize accessibility action. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * TreeGrid — a DataGrid whose rows have rows inside them. The hierarchy lives in the row-header
 * column (indent, a chevron, an announced level); every other column is DataGrid's, down to the
 * editors, the status bar and the column model.
 *
 * When to use: records that nest and each hold several comparable fields — a chart of accounts
 * with balances, folders with sizes, a bill of materials with quantities. `children: "lazy"`
 * keeps the first paint cheap for deep trees; `selectChildren` makes selecting a row mean "this
 * and everything in it". Not for one field per node (Tree), flat data (DataGrid), or content
 * read row by row (Table).
 *
 * Native structure follows DataGrid: a caption `Heading` at `captionLevel` (clipped but still
 * the accessible name with `hideCaption`), a horizontal `ScrollView` holding a `FlatList` with
 * `role="grid"`, the caption as its `accessibilityLabel` and a fixed `getItemLayout` over the
 * flattened visible rows — a collapsed subtree is absent from that list, which is what gets
 * virtualized. The header row is the sticky list header; pinned columns keep their place in
 * `columns` and cast `pinnedShadow` once the region has moved sideways, as DataGrid.
 *
 * Expansion is the tree part. Each row header is a `Pressable` announcing "{name}, Level {n},
 * {count} items" with `accessibilityState.expanded` and its own `expand`/`collapse` actions when
 * it has children; pressing it toggles, long-pressing edits it when the column is editable. The
 * visible chevron is a ghost, icon-only `Button` at `size.target.min` named with
 * `copy.expand`/`copy.collapse` and rotated over `transition` — it stays in the accessibility
 * tree (a focusable control inside a hidden wrapper is an `aria-hidden-focus` failure on
 * react-native-web, and `Button` has no non-focusable option), with the row header's actions as
 * the other path to the same act. The root view carries `expandAll`/`collapseAll` actions over
 * every loaded row — the native stand-in for `*`, which core React Native cannot reach, along
 * with Shift+Space and Control+A. `indent` is a spacer per level beyond the first, and one guide
 * line per ancestor level runs the full row height, centred on that ancestor's chevron. A
 * `"lazy"` row fires `onExpand` every time it opens while still lazy and shows one busy
 * placeholder row reading `copy.loading` — a row that is navigable but neither selectable nor
 * editable — until `children` arrives. Native has no position in set: only the level and the
 * child count are conveyed.
 *
 * Everything else is DataGrid's model: a sortable header is a `Button` (sorting orders siblings
 * within each level and keeps the tree), `selectable="row"` adds `Checkbox` cells and a select-all
 * that covers every loaded row at every level, `cell` selects the tapped cell, and an editable
 * cell opens `Input`, `NumberInput`, `DatePicker`, `Select` or `Checkbox` after `onEditStart`
 * allows it, with `activate` committing and `escape` cancelling — which is also all
 * `escape-dismiss` asks of a component with no overlay. A failing `validate` keeps the editor
 * open with the cell ringed in danger and the message in the status bar's live region.
 */
export declare function TreeGrid({ caption, captionLevel, hideCaption, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable, selected, defaultSelected, selectChildren, editable, density, height, loading, showStatusBar, stickyHeader, emptyMessage, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize, ref }: TreeGridProps): React.JSX.Element;
//#endregion
//#region src/Tree.d.ts
type TreeSelectable = "none" | "single" | "multiple";
/** Heading level of the visible label. The schema's values are quoted digits; numbers are accepted too. Its size is `headingSize` regardless. */
type TreeHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A hierarchy entry. `href` makes the label a Link; `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`. */
type TreeNode = {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string;
  disabled?: boolean;
  href?: string;
  children?: TreeNode[] | "lazy";
};
/** The style bindings a caller may replace with a different token; locked bindings are excluded. */
type TreeOverridableBinding = "indent" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBorderWidth" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
interface TreeProps {
  /** What the tree lists ("Folders", "Categories"). The accessible name; visible only with `showLabel`. */
  label: string;
  /** Show the label as a Heading above the tree. */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is headingSize regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /** The hierarchy. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a `"lazy"` node; a lazy id listed explicitly stays closed until the user opens it. */
  defaultExpanded?: string[] | undefined;
  /** `single`: one current node. `multiple`: checkbox-like selection, cascading with `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. Always an array, even in `single` mode. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its enabled loaded descendants and parents show indeterminate. */
  selectChildren?: boolean | undefined;
  /** With `single`, focus reaching a node (hardware keyboard, assistive technology) also selects it. */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with every selected id in tree order, as a bare array, and only when the set changes. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Fired with every expanded id, in the order they were opened, as a bare array. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id each time a node whose `children` is still `"lazy"` is opened, so a failed load can retry. It precedes the `onExpandChange` of the same act. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a node is activated, with its id. Nodes with `href` navigate instead. */
  onActivate?: ((id: string) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Tree — a list that knows about nesting: a file browser's sidebar, a category
 * picker, a documentation site's navigation. One field per node.
 *
 * When to use: a hierarchy the user navigates or picks from. `single` with `href`
 * nodes is a navigation tree; `multiple` with `selectChildren` is a picker. Not for
 * one level (Listbox, a list of Links), several fields per node (TreeGrid) or a
 * Menu.
 *
 * Native has no tree role: an optional `Heading` (`showLabel`, at `headingLevel`,
 * sized by headingSize) above a `FlatList` (`accessibilityRole="list"`, labelled by
 * `label`) over the flattened visible nodes — groups have no wrapper, collapsed
 * subtrees are absent. Each node is a row: indent per level with one guide line per
 * open ancestor (`showGuides`), a ghost `Button` chevron as the real expand target,
 * then a `Pressable` (`button`, or `link` for `href`) holding the drawn checkbox in
 * `multiple` mode, the `Icon`, the label `Text` (or `Link`) and the badge `Text`.
 * The row announces "{label}, level {n}" with `accessibilityState` expanded,
 * selected, checked (`mixed` for a partly selected cascading parent), disabled and
 * busy (an open lazy parent), and `expand`/`collapse` accessibility actions.
 *
 * A tap is Enter: it activates (`onActivate`, or opens `href` through `Linking`)
 * and, in `single`, selects. In `multiple` a tap toggles selection and a long press
 * activates; the row carries the standard `longpress` accessibility action so a
 * screen reader can still reach activation. `selectOnFocus` selects from the
 * Pressable's `onFocus`. Selection is reported in tree order and only when the set
 * changes; in `multiple` it announces `copy.selectedCount` (iOS
 * `announceForAccessibility`, an Android live region). A `"lazy"` node opens on a
 * user act only — firing `onExpand` every time it opens while still lazy, so a
 * failed load can retry — and shows a `copy.loading` placeholder while its parent
 * reports busy. No arrow keys, `*` or type-ahead on this platform.
 */
export declare function Tree({ label, showLabel, headingLevel, nodes, expanded, defaultExpanded, selectable, selected, defaultSelected, selectChildren, selectOnFocus, showGuides, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, ref }: TreeProps): React.JSX.Element;
//#endregion
//#region src/Splitter.d.ts
type SplitterOrientation = "horizontal" | "vertical";
type SplitterStackBelow = "prose" | "content" | "never";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "gripRadius" | "collapseButtonOffset" | "transition";
interface SplitterProps {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. A vertical splitter needs a parent with a definite height. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. A string or number is wrapped in `Text`. */
  primary: React.ReactNode;
  /** The second pane, which takes the remaining space. A string or number is wrapped in `Text`, as `primary`. */
  secondary: React.ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. With `collapsible`, a step that would cross it clamps here first and the next shrink step collapses; otherwise it is the hard floor. */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Increment of the increment/decrement accessibility actions, percent. */
  step?: number | undefined;
  /** The primary pane can collapse to nothing: drag past the minimum, the separator's activate action, or the collapse button. Activating again restores the last size. */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. Ignored unless `collapsible`. */
  collapsed?: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean | undefined;
  /** When set, the size and collapsed state are remembered under this key in a module-level memory map: survives remounts, not a restart. */
  persistKey?: string | undefined;
  /** Below this width of the splitter's own box a horizontal splitter stacks its panes and the separator is not rendered. A vertical splitter never stacks. */
  stackBelow?: SplitterStackBelow | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired continuously while dragging and on each step action, with the primary size in percent (unrounded). */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired with the final size once when a drag ends and after each step action that changed the size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}
/**
 * Splitter — a separator that moves the boundary between two panes, reporting how much
 * of the container the primary pane holds.
 *
 * When to use: two regions compete for space and the right split depends on the task
 * (a navigation tree beside content, a list beside a detail view). Set sensible
 * `minSize`/`maxSize`, use `persistKey` so the choice sticks, and `collapsible` for
 * sidebars. Not for phone-only screens (it stacks below `stackBelow`) or static layout.
 *
 * A `View` row (or column): the primary pane at `flexBasis` percent, the separator
 * `View` carrying a `PanResponder` (as Slider's thumb — `panHandlers` on a `Pressable`
 * fight its own responder) with `accessibilityRole="adjustable"`, `accessibilityValue`
 * and `accessibilityActions` — increment/decrement by `step`, setMinimum/setMaximum
 * (Home/End) and, when `collapsible`, activate (Enter) — the gesture alternative; then
 * the secondary pane at `flex: 1`. The collapse `Button` (ghost, sm, iconOnly) is a
 * positioned sibling of the separator, placed from its measured position rather than a
 * child, because Android drops touches outside a parent's bounds. While collapsed the
 * pane is hidden from assistive tech and touch, and drag and the step actions do
 * nothing; only activate or the button restores. Collapse and restore animate over
 * `transition` (skipped under reduced motion); dragging and step actions resize
 * instantly and the separator colour switches instantly.
 *
 * Known platform limits: a `View` has no typed key handler, so hardware arrows, Home,
 * End and Enter do nothing (including on react-native-web) — the accessibility actions
 * and the collapse Button are the keyboard and screen-reader route; the separator is a
 * plain `View`, so it shows no keyboard focus ring (the Button has full focus
 * treatment); and F6 pane cycling has no native equivalent.
 */
export declare function Splitter({ label, orientation, primary, secondary, size, defaultSize, minSize, maxSize, step, collapsible, collapsed, defaultCollapsed, persistKey, stackBelow, overrides, ref, onSizeChange, onSizeChangeEnd, onCollapseChange }: SplitterProps): React.JSX.Element;
//#endregion
//#region src/Feed.d.ts
/** Heading level for each article's heading. The schema declares the values as strings; numbers are accepted too. */
type FeedHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
type FeedItem = {
  id: string;
  heading: string;
  timestamp: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  unread?: boolean;
};
/**
 * The style bindings a caller may replace with a different token. Locked: unreadBorder,
 * unreadBorderWidth, timestampColor, endMessageColor, emptyStateColor, focusRing, focusRingWidth.
 */
type FeedOverridableBinding = "itemGap" | "articleInset" | "articleBodyGap" | "articleRadius" | "timestampSize" | "newItemsOffset" | "newItemsLayer" | "loadingInset" | "endMessageInset" | "endMessageSize" | "emptyStateInset" | "emptyStateSize" | "fontFamily";
interface FeedProps {
  /** What the feed contains ("Activity", "Notifications"). The list's accessible name; an empty or whitespace-only label warns once per mount in development. */
  label: string;
  /**
   * Articles, newest first. `heading` names the article (the Card's heading); `timestamp`
   * is ISO and rendered relative from the copy strings ("3 min ago", the absolute date from
   * seven days on), computed at render and not ticking; `unread` marks items the user has
   * not seen. String or number `content` is wrapped in the package `Text`; other content
   * renders as given. The absolute time is not exposed on native.
   */
  items: FeedItem[];
  /**
   * More items exist beyond the last; the feed asks for them with `onEndReached` as the end
   * approaches, and whenever `items` is empty and not `loading` — on mount and again if the
   * caller clears `items` — so an empty feed fetches its first page itself. While the last
   * article stays in view it asks at most once per change of the last item's id, `hasMore` or
   * `loading`, and never while `loading`; a prepend from `onShowNew` leaves the last id
   * unchanged, so it does not ask again. A `loading` cycle that ends with the same last id
   * re-arms the request, so a page that failed can be asked for again.
   */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the list is marked busy. */
  loading?: boolean | undefined;
  /** Number of newer items available above. The feed does not insert them; it shows a "Show {count} new" button above the list. Whole numbers only. */
  newItemsCount?: number | undefined;
  /** Heading level for article headings. React Native has no heading levels: headings carry the `header` role and this controls only typography. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false and `items` is not empty. Defaults to `copy.end`. */
  endMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Load more (`onLoadMore`): the last article is within one screen of view with `hasMore`, or an empty feed with `hasMore` and not `loading`. */
  onEndReached?: (() => void) | undefined;
  /** The new-items button was pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: (() => void) | undefined;
  /** Item visible (`onItemVisible`): the item has been at least half visible for a second (mark as read). */
  onViewableItemsChanged?: ((id: string) => void) | undefined;
}
/**
 * Feed — a stream of time-ordered articles that grows as the reader nears the end, with
 * newer items offered by a button rather than inserted under the reader.
 *
 * Renders a `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={label}`, busy
 * while `loading`) of `Card`s. Cards are left un-collapsed so action Buttons and Links in
 * an article stay individually focusable; the hidden "unread" word and, when the total
 * is known (`hasMore` false), the "{index} of {total}" position sit before each Card,
 * because Card takes a heading string and a footer slot with nothing between them.
 * `onEndReached` fires with threshold one screen, at most once per change of the last item's
 * id, `hasMore` or `loading`, so a list that keeps reporting the end asks only once;
 * `maintainVisibleContentPosition` keeps the reader's place when the caller prepends after
 * `onShowNew`. The new-items row is a `View` above the list, so it never scrolls away; it is
 * always rendered as `accessibilityLiveRegion="polite"` and padded only while shown — Android
 * announces the count; on iOS VoiceOver users reach the button at the top.
 * While `loading` with no items the indicator shows, not `copy.empty`, so an empty feed
 * about to fetch stays blank rather than flashing it. There is no hardware keyboard feed
 * model on native (no Page or Ctrl keys); screen readers browse with their own gestures.
 * The absolute time is not exposed on native.
 */
export declare function Feed({ label, items, hasMore, loading, newItemsCount, headingLevel, endMessage, overrides, ref, onEndReached, onShowNew, onViewableItemsChanged }: FeedProps): React.JSX.Element;
//#endregion
//#region src/ProgressBar.d.ts
type ProgressBarTone = "neutral" | "success" | "danger";
type ProgressBarAnnounce = "none" | "milestones" | "complete";
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition" | "indeterminateLoop" | "indeterminateReducedOpacity" | "sweepEasing";
interface ProgressBarProps {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`; always the accessible name. */
  label: string;
  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the end is
   * unknown). Clamped to `min`…`max`; a non-finite number is treated as `min`.
   */
  value?: number | null | undefined;
  /** Start of the range. A non-finite number is treated as the default, 0. */
  min?: number | undefined;
  /** End of the range. A non-finite number is treated as the default, 100. */
  max?: number | undefined;
  /**
   * Renders the value text ("42%", "3 of 12 files"), called with the clamped value. Defaults to a whole-number
   * percentage over the whole range — `(value − min) / (max − min)`, the same arithmetic the fill uses.
   */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text at the end of the label row. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening. */
  hideLabel?: boolean | undefined;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal. */
  tone?: ProgressBarTone | undefined;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  announce?: ProgressBarAnnounce | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * Renders an `accessible` `View` with `role="progressbar"`,
 * `accessibilityLabel` (the accessible name even when `hideLabel` hides the visible
 * label) and `accessibilityValue={{ min, max, now, text }}` — an indeterminate bar
 * carries `min` and `max` only and sets `accessibilityState={{ busy: true }}`. The bar
 * is never focusable. The fill's width animates to the value's fraction over
 * `transition`, snapping under reduced motion. Indeterminate: a one-third-width fill
 * sweeps from wholly before the track's inline start to wholly past its inline end
 * (leftward under `I18nManager.isRTL`) over `indeterminateLoop` with `sweepEasing`; under
 * reduced motion no loop starts and the fill is drawn full-width at `indeterminateReducedOpacity`.
 *
 * Announcements (`AccessibilityInfo.announceForAccessibility`): the tier is
 * `floor(fraction × 4)` and is tracked whatever `announce` is. The state at mount is
 * recorded silently, except that a bar mounting indeterminate announces
 * `copy.indeterminate`, as it does each later time it becomes indeterminate.
 * `milestones` announces `copy.progress` once for the highest tier 1–3 entered by an
 * update; reaching `max` announces `copy.complete` (for `milestones` and `complete`).
 * Moving to a lower tier resets the record to that tier, and entering the indeterminate
 * state resets it to tier 0, so the first known value afterwards announces again. With
 * `max <= min` the bar renders empty, reports `now = min`, records no tier, announces no
 * progress or completion, and warns in development; the tier the range arrives at when it
 * becomes valid again is recorded silently, as at mount.
 */
export declare function ProgressBar({ label, value, min, max, formatValue, showValue, hideLabel, tone, announce, overrides, ref }: ProgressBarProps): React.JSX.Element;
//#endregion
//#region src/Stepper.d.ts
type StepperOrientation = "horizontal" | "vertical";
type StepperNavigable = "none" | "completed" | "all";
type StepperStepStatus = "complete" | "current" | "upcoming" | "error";
/**
 * One step. `status` is derived from `current` when omitted: before it complete, the step it names current, after it
 * upcoming. An explicit `status` sets only the indicator, its colours and the status word.
 */
type StepperStep = {
  id: string;
  label: string;
  description?: string;
  status?: "complete" | "current" | "upcoming" | "error";
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorRadius" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "countSize" | "stepHover" | "stepRadius" | "stepPadding" | "stepGap" | "partGap" | "fontFamily" | "transition";
interface StepperProps {
  /**
   * Accessible name of the list (React Native has no navigation landmark, so the name sits on the list View).
   * Defaults to `copy.navLabel`, which an empty string also falls back to.
   */
  label?: string | undefined;
  /**
   * The steps in order. `status` is derived from `current` when omitted. An explicit `status` sets only the
   * indicator, its colours and the status word; position (not status) decides the selected state, navigability,
   * the connector colour and the compact reveal.
   */
  steps: {
    id: string;
    label: string;
    description?: string;
    status?: "complete" | "current" | "upcoming" | "error";
  }[];
  /**
   * The id of the current step. When no id matches, nothing is selected, every step without an explicit status is
   * upcoming, no step is navigable under `completed` (all still are under `all`), the count reads "Step 1 of m",
   * and `__DEV__` logs a warning — an empty `current` is treated as not yet set and does not warn.
   */
  current: string;
  /** Vertical shows descriptions under each label; horizontal renders no descriptions and collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /**
   * Which steps can be activated: `none` (display only), `completed` (every step before the current one by
   * position, including one marked `error`), or `all` (a settings-style flow where order does not matter).
   */
  navigable?: StepperNavigable | undefined;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by hand or
   * automatically when the stepper's own width is below `layout.maxWidth.prose`; does nothing on a vertical stepper.
   */
  compact?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
  /** The root view, which holds the list and the count. */
  ref?: React.Ref<ViewInstance> | undefined;
}
/**
 * Stepper — a map of a journey with a "you are here". It sets expectations, shows progress without a bar, and
 * gives people a way back to a step they finished. Navigation, not a form control (the number-stepping field is
 * NumberInput).
 *
 * Use it for three to about seven ordered steps: vertical with descriptions for flows that need explanation,
 * horizontal for short, familiar ones. Do not use it for two steps, for more than about eight, as Tabs, or to show
 * task progress (ProgressBar).
 *
 * A plain root `View` holds the list `View` (`accessibilityRole="list"`, named by `label` — React Native has no
 * `nav` landmark) and, `stepGap` after it, the `count` Text, so the count is never inside the list. Each step is a
 * `role="listitem"` View — the `<li>` of the web anatomy, and the only child role a list may own — holding a
 * `Pressable` (navigable) or an `accessible` `View` whose `accessibilityLabel` is `copy.stepLabel` plus ", " and
 * the status word, with `accessibilityState.selected` on the step `current` names. An explicit `status: "error"`
 * wins for the indicator and the status word, while selection and the compact reveal still follow the id. The
 * indicator switches between its four states at once; connectors cross-fade to `connectorComplete` over
 * `transition`. Compact is decided by the stepper's own `onLayout` width against `layout.maxWidth.prose`,
 * rendering non-compact until the first layout; the root stretches to its parent, so the measured width is the
 * space offered and switching to compact cannot narrow it further.
 */
export declare function Stepper({ label, steps, current, orientation, navigable, compact, overrides, onStepSelect, ref }: StepperProps): React.JSX.Element;
//#endregion
//#region src/Search.d.ts
/** `lg` for a search page's hero field. */
type SearchSize = "md" | "lg";
/** One row offered under the field while typing. */
type SearchSuggestion = {
  value: string;
  label: string;
  description?: string;
};
/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
type SearchOverridableBinding = "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupRadius" | "popupShadow" | "layer" | "partGap" | "labelWeight" | "disabledOpacity";
interface SearchProps {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /**
   * Field name; the query key when the form submits to a URL. Native has no URL forms, so
   * here it is the key the query registers under in an enclosing Form.
   */
  name?: string | undefined;
  /**
   * Controlled query. When set, it is the query everything reads: submit, a chosen
   * suggestion, the clear button and the Form value all use this prop, never stale typed
   * text; clearing reports `onChangeText("")` and the field empties when the caller passes
   * the new value.
   */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /**
   * URL to submit to with GET (web and Lit). Native has no form navigation: accepted for
   * parity, does nothing, and warns in development. Handle `onSubmitEditing` instead.
   */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one
   * fills the query with the suggestion's `label` — what the user just read — and submits.
   * Provide them from `onChangeText` (debounced by the caller). Setting the prop at all —
   * even to an empty array after a fetch that found nothing, which shows
   * `copy.noSuggestions` — is what turns the field into a combobox; leaving it undefined
   * keeps a plain search field. The list opens on typing and on ArrowDown, never on focus
   * alone, and closes on Escape, blur, a chosen suggestion, clear and submit.
   */
  suggestions?: {
    value: string;
    label: string;
    description?: string;
  }[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /**
   * Give the field the `search` landmark. Turn off when the Search sits inside another
   * search landmark (a filter within a results page). It is `accessibilityRole="search"`
   * on the root View this component already renders, never a composed Landmark.
   */
  landmark?: boolean | undefined;
  /** `lg` for a search page's hero field. */
  size?: SearchSize | undefined;
  /**
   * Not editable, still readable and focusable: the input is read-only with
   * `accessibilityState.disabled`, both Buttons are disabled (the clear Button still renders
   * when there is text), every key is inert, suggestions never open and an open list closes,
   * no event fires, the label, glyph and input dim, and a Form does not register it.
   */
  disabled?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (the `landmark` and `form` part). */
  ref?: React.Ref<ViewInstance> | undefined;
  /**
   * Fired on every keystroke with the query; the caller fetches suggestions here. Also fired
   * whenever Search itself changes the text, so a controlled `value` can follow: with "" before
   * `onClear`, and with a chosen suggestion's `label` before `onSubmitEditing`.
   */
  onChangeText?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. An empty trimmed query does not fire. */
  onSubmitEditing?: ((value: string) => void) | undefined;
  /** Fired when the field is emptied — by the clear button, or by the Escape that clears it when no suggestions are open. */
  onClear?: (() => void) | undefined;
}
/**
 * Search — the field people look for first: a magnifier glyph, a pill, a clear button,
 * and submission on Enter like every search field they have used.
 *
 * When to use: free-text search over a site, an app, or a large dataset. Add
 * `suggestions` when the backend can offer completions; keep `landmark` on for the one
 * primary search. Not for a specific value (Input) or for choosing from a known list
 * (Select, Combobox).
 *
 * Renders a root `View` — the `landmark` and `form` part in one, since native has no form
 * element — carrying `accessibilityRole="search"` when `landmark` and never putting it on
 * the `TextInput`, which on react-native-web would become a second search landmark. Inside
 * it: the optional visible label (hidden from accessibility, because the input already
 * carries `accessibilityLabel`) and a pill row holding a decorative `search` Icon, the
 * `TextInput` (`returnKeyType="search"`, `clearButtonMode="never"` so the system clear
 * `Button` matches across platforms), that clear Button while there is text, and the submit
 * Button, always rendered: Enter is not reachable from every on-screen keyboard.
 *
 * With `suggestions` set, an embedded `Listbox` renders inline below the field — no overlay,
 * since on a phone the list takes the space under the field — opened by typing while the
 * field has focus or by ArrowDown from a hardware keyboard (or react-native-web), never by
 * focus alone, and closed on blur, except while a press is in progress inside the list
 * (react-native-web blurs the input on pointerdown). Listbox rows are touch Pressables with
 * no key events, so there is no arrow-key highlight: a tap fills the query with the row's
 * `label` and submits, and Enter always submits the typed query. The suggestion count,
 * `copy.noSuggestions` or `copy.loading` is announced with
 * `AccessibilityInfo.announceForAccessibility` after `statusDebounce`, there being no
 * visually-hidden primitive to hold a live region.
 *
 * `name` is the Form registration key, as on every platform. `action` is a GET target, which
 * has no meaning on native: it is accepted for parity, does nothing, and warns under `__DEV__`. The caller's
 * ScrollView needs `keyboardShouldPersistTaps="handled"` so a suggestion tap is not
 * swallowed by keyboard dismissal; Search has no ScrollView of its own to set it on.
 */
export declare function Search({ label, showLabel, name, value, defaultValue, placeholder, action, suggestions, loading, landmark, size, disabled, overrides, ref, onChangeText, onSubmitEditing, onClear }: SearchProps): React.JSX.Element;
//#endregion
//#region src/DatePicker.d.ts
type DatePickerSize = "sm" | "md";
/** A single ISO calendar date, or both ends of a range. Never a `Date`: a calendar date has no time zone. */
type DatePickerValue = string | {
  start: string;
  end: string;
};
/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`background`, `foreground`, `placeholder`,
 * `border`, `borderFocus`, `rangeSeparatorColor`, `calendarSurface`, `daySize`,
 * `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`,
 * `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`, `weekdayColor`,
 * `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRing`,
 * `focusRingWidth`) carry contrast or target guarantees and are not in the union.
 */
type DatePickerOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "fontSize" | "calendarInset" | "calendarGap" | "headerGap" | "footerGap" | "dayGap" | "dayRadius" | "dayHover" | "weekdaySize" | "weekdayWeight" | "weekNumberSize" | "weekNumberWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "disabledOpacity" | "transition";
interface DatePickerProps {
  /** Visible label ("Start date", "Date of birth"). Also the input's accessible name and the calendar sheet's heading. */
  label: string;
  /**
   * Field name for the Form. The value is an ISO calendar date string (`2026-09-10`)
   * or, for a range, `{ start, end }` of them. The Form holds strings only, so a range
   * registers two fields, `name` (start) and `name-end` (end).
   */
  name: string;
  /**
   * Controlled value (ISO date, or a range). Pass `''` for a controlled empty field
   * (`{ start: '', end: '' }` for a range). While an input has focus it keeps the typed
   * text; on blur, and at once after a pick or Clear, the inputs show the formatted
   * `value`, so a controlled owner that does not update `value` sees the text revert.
   * In a range the first pick is an internal draft shown only in the calendar.
   */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and tests. Omit for
   * the button-driven default. Every change aims the calendar at the committed value's
   * month (or today's) — its end when opened by ArrowDown in the end input, its start
   * otherwise; uncommitted typed text is ignored.
   */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and can take focus but not be selected. */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /**
   * BCP 47 locale for month and weekday names, the first day of the week, and the typed
   * format. Defaults to the device locale. The typed pattern comes from `formatToParts`
   * with 2-digit month and day and a numeric year, so en-US is MM/DD/YYYY.
   */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. Also the input's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. `copy.requiredIndicator` is appended to the visible label, so it is part of the accessible name. */
  required?: boolean | undefined;
  /** Do not render the label Text; `label` stays the accessible name. Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /**
   * Not editable, still readable. Every user-driven open is blocked (the calendar Button,
   * ArrowDown in the input), but a controlled `open: true` still renders the calendar.
   */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root group `View`, so a parent can measure the field group. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, and with `undefined` on Clear. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * DatePicker — two ways to say the same date: type it, or find it on a calendar. Both
 * produce a plain ISO date (`2026-09-10`), never a timestamp, because a delivery date or
 * a birthday has no time zone to get wrong.
 *
 * When to use: any date the user chooses — due dates, bookings, dates of birth, report
 * periods (`range`). Set `min`, `max` and `isDateDisabled` whenever they exist, so the
 * calendar shows what is possible instead of validating after the fact. Not for a
 * date-and-time, a month or year alone (Select), or relative choices.
 *
 * React Native has no core date picker and the package takes no date dependency (only
 * `react-native-svg`, for Icon), so the calendar is the system's own grid here as on
 * every other platform: a `TextInput` (`keyboardType="number-pad"`) parsed against the
 * locale's pattern, a ghost `Button` with the "calendar" glyph, and a `BottomSheet`
 * (`height="content"`, `heading={label}`) holding the header, the 7-column grid of
 * `daySize` `Pressable` days and the Today/Clear footer. The `popover` part is that
 * sheet: only `calendarInset` is forwarded (to its `inset` override) and `calendarSurface`
 * is realised by the sheet's own locked surface.
 *
 * Native has no grid or gridcell role and `Pressable` sees no keys, so there is no roving
 * tabindex and no Arrow, Page, Home or End handling: every day is its own focus stop
 * reached by swipe, and the prev/next month Buttons stand in for PageUp/PageDown.
 * `TextInputKeyPressEvent` carries no modifier flags, so Alt+ArrowDown cannot be told
 * from ArrowDown and both simply open the calendar. Focus on open lands on the sheet's
 * first focusable element rather than the selected day, and focus on close returns
 * through BottomSheet's own FocusScope, since Button exposes no node handle to focus by
 * hand; only the displayed month follows the value.
 *
 * There is no native invalid state, so the error is appended to the input's
 * `accessibilityHint` after `description` and announced through an assertive live region
 * (Android) with `AccessibilityInfo.announceForAccessibility` on iOS. The label is a
 * `Text` — React Native has no `<label>` — and `hideLabel` drops it, leaving the name in
 * `accessibilityLabel`. Button and Select take no `testID`, so each composed part is
 * wrapped in a `View` this component owns carrying `testID="DatePicker.<part>"`.
 *
 * Inside a Form the field registers by `name` with the start's ISO string; a range adds
 * a second field, `name-end`, holding the end, and only `name` reports the combined
 * message so one message is never read twice.
 */
export declare function DatePicker({ label, name, value, defaultValue, open, range, min, max, isDateDisabled, locale, showWeekNumbers, placeholder, description, required, hideLabel, size, disabled, error, overrides, ref, onChange, onOpenChange }: DatePickerProps): React.JSX.Element;
//#endregion
export type { AccordionHeadingLevel, AccordionItem, AccordionOpenChangeReason, AccordionOverridableBinding, AccordionProps, AccordionValue, ActionSheetAction, ActionSheetActionTone, ActionSheetCloseReason, ActionSheetOverridableBinding, ActionSheetProps, AlertDialogCancelReason, AlertDialogOverridableBinding, AlertDialogProps, AlertDialogTone, AlertLive, AlertOverridableBinding, AlertProps, AlertTone, BottomSheetCloseReason, BottomSheetHeight, BottomSheetOverridableBinding, BottomSheetProps, BoxInset, BoxOverridableBinding, BoxProps, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbOverridableBinding, BreadcrumbProps, ButtonOverridableBinding, ButtonProps, ButtonSize, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardProps, CardSurface, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CarouselProps, CarouselSlideProps, CheckboxOverridableBinding, CheckboxProps, ComboboxFilter, ComboboxOverridableBinding, ComboboxProps, ComboboxValue, ContainerAlign, ContainerGutter, ContainerOverridableBinding, ContainerProps, ContainerWidth, DataGridCaptionLevel, DataGridCellSelection, DataGridCellValue, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridColumnResize, DataGridDensity, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridProps, DataGridRangeSelection, DataGridRow, DataGridSelectable, DataGridSelection, DataGridSort, DataGridSortDirection, DatePickerOverridableBinding, DatePickerProps, DatePickerSize, DatePickerValue, DialogCloseReason, DialogInitialFocus, DialogOverridableBinding, DialogProps, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureProps, DisclosureToggleReason, DividerOrientation, DividerOverridableBinding, DividerProps, DividerSpacing, FeedHeadingLevel, FeedItem, FeedOverridableBinding, FeedProps, FieldsetContextValue, FieldsetGap, FieldsetOverridableBinding, FieldsetProps, FocusScopeAutoFocus, FocusScopeEscapeDirection, FocusScopeProps, FormContextValue, FormFieldHandle, FormFieldValue, FormOverridableBinding, FormProps, FormValidateMode, FormValues, HeadingLevel, HeadingOverridableBinding, HeadingProps, HeadingSize, IconName, IconOverridableBinding, IconProps, IconSize, InputOverridableBinding, InputProps, InputSize, InputType, LandmarkProps, LandmarkRole, LinkOverridableBinding, LinkProps, LinkTone, ListboxGroup, ListboxItem, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxProps, ListboxValue, MenuAction, MenuGroup, MenuItem, MenuItemTone, MenuOpenChangeReason, MenuOverridableBinding, MenuPlacement, MenuProps, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterProps, MeterTone, NumberInputFormat, NumberInputOverridableBinding, NumberInputProps, NumberInputSize, PopoverCloseReason, PopoverHeadingLevel, PopoverInitialFocus, PopoverOverridableBinding, PopoverPlacement, PopoverProps, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarProps, ProgressBarTone, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, RadioGroupProps, SearchOverridableBinding, SearchProps, SearchSize, SearchSuggestion, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlProps, SegmentedControlSize, SelectNative, SelectOverridableBinding, SelectProps, SelectSize, SelectValue, SidePanelCloseReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelProps, SidePanelRole, SidePanelSide, SidePanelWidth, SliderMark, SliderOverridableBinding, SliderProps, SliderShowValue, SliderValue, SplitterOrientation, SplitterOverridableBinding, SplitterProps, SplitterStackBelow, StackAlign, StackDirection, StackGap, StackJustify, StackOverridableBinding, StackProps, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperProps, StepperStep, StepperStepStatus, SwitchLabelPosition, SwitchOverridableBinding, SwitchProps, TabPanelProps, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnWidth, TableDensity, TableHideBelow, TableMaxHeight, TableOverridableBinding, TableProps, TableResponsive, TableRow, TableSelectable, TableSort, TableSortDirection, TabsActivation, TabsFit, TabsItem, TabsOrientation, TabsOverridableBinding, TabsProps, TabsTab, TextAlign, TextOverridableBinding, TextProps, TextSize, TextStyleContextValue, TextTone, TextWeight, Theme, ThemeMode, ThemeModeSetting, ThemeProviderProps, ToastContextValue, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastProps, ToastProviderProps, ToastResult, ToastTone, Tokens, ToolbarDensity, ToolbarGroupProps, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarProps, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TooltipProps, TreeGridCaptionLevel, TreeGridCellSelection, TreeGridCellValue, TreeGridDensity, TreeGridHeight, TreeGridOverridableBinding, TreeGridProps, TreeGridRow, TreeGridSelectable, TreeGridSelection, TreeGridSort, TreeGridSortDirection, TreeHeadingLevel, TreeNode, TreeOverridableBinding, TreeProps, TreeSelectable, UseSidePanelEdgeSwipeOptions };
//# sourceMappingURL=index.d.ts.map