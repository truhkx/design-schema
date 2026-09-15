import { ChangeEvent, ComponentPropsWithoutRef, Context, DetailedReactHTMLElement, FocusEvent, HTMLAttributes, MouseEvent, ReactElement, ReactNode, ReactPortal, Ref, RefObject } from "react";
import { TokenRef } from "@design-schema/tokens";
//#region src/Button.d.ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ButtonOverridableBinding = "backgroundHover" | "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerStroke";
interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "disabled" | "children" | "aria-label"> {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant | undefined;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: ReactNode;
  /** Icon after the label. Decorative, like leadingIcon. */
  trailingIcon?: ReactNode;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType | undefined;
  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  disabled?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort by
   * Amount, ascending" on a header that shows "Amount"). The visible label must be the start of
   * it (WCAG 2.5.3 label-in-name). Maps to aria-label.
   */
  accessibleName?: string | undefined;
  /** Text used for this button when a Toolbar collapses it into its overflow Menu. */
  overflowLabel?: string | undefined;
  /**
   * Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes
   * the accessible name. Padding becomes equal on all sides (`space.sm`).
   */
  iconOnly?: boolean | undefined;
  /**
   * Replaces the icon slot with a 1em ring spinner in `currentColor`, keeps the label space so
   * layout does not shift, and blocks repeat activation while an action is pending.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses
   * color.inverse.link and hover uses a translucent inverse foreground; the focus ring uses
   * color.inverse.focus. Only `ghost` is meaningful on inverse surfaces; other variants keep
   * their own fills.
   */
  inverse?: boolean | undefined;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. */
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  /** Fired after onPress with the `track` name and the button's label. */
  onTrack?: ((name: string, label: string) => void) | undefined;
}
/**
 * Button — Design Schema, category: action.
 *
 * When to use:
 * Use a Button when the user needs to **do something**: submit, save, confirm, open, add, delete.
 * The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view. Use `secondary` for
 * the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and
 * `danger` only for destructive, hard-to-undo actions.
 */
export declare const Button: ({ ref, label, variant, size, leadingIcon, trailingIcon, type, disabled, accessibleName, overflowLabel: _overflowLabel, iconOnly, loading, inverse, track, overrides, onClick, onTrack, className, style, ...rest }: ButtonProps & {
  ref?: Ref<HTMLButtonElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Heading.d.ts
/** Position in the document outline. Accepts the schema's string values and their numeric equivalents. */
type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md";
type HeadingAlign = "start" | "center" | "end";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
interface HeadingProps extends Omit<ComponentPropsWithoutRef<"h1">, "children"> {
  /** Position in the document outline. Controls the semantic element, not the visual size. */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: ReactNode;
  /** Horizontal text alignment. */
  align?: HeadingAlign | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Heading — Design Schema, category: typography.
 *
 * When to use:
 * Use a Heading to title a page, a section, or a card that contains its own content. Choose
 * `level` from the document outline — the page title is `1`, its major sections are `2`, their
 * subsections `3` — and then choose `size` separately if the default visual size is wrong for the
 * layout. Decoupling level from size is the whole point of this component: it lets designers pick
 * the right look without breaking the outline.
 */
export declare const Heading: ({ ref, level, size, children, align, overrides, className, style, ...rest }: HeadingProps & {
  ref?: Ref<HTMLHeadingElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
type TextElement = "p" | "span";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "color";
interface TextProps extends Omit<ComponentPropsWithoutRef<"p">, "children"> {
  /** The text content. Inline formatting (emphasis, links) is allowed; block elements are not. */
  children: ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  tone?: TextTone | undefined;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /** Clip to one line with an ellipsis. On web the full text is exposed via `title` when children is a plain string; otherwise the consumer passes `title`. */
  truncate?: boolean | undefined;
  /** The HTML element to render — `p` for a block, `span` for inline. */
  element?: TextElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Text — Design Schema, category: typography.
 *
 * When to use:
 * Use Text for paragraphs, labels, captions, helper text, and any inline copy. Pick `size` from
 * the scale rather than styling a raw element, and use `tone` for meaning: `muted` for secondary
 * information, `danger` for errors, `strong` when a phrase must stand out from surrounding body
 * copy. Use `weight` to create hierarchy inside a size; it is calmer than jumping sizes.
 */
export declare const Text: ({ ref, children, size, weight, tone, align, truncate, element, overrides, title, className, style, ...rest }: TextProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type InputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "minTargetSm" | "disabledOpacity";
interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "size" | "disabled" | "onChange" | "onFocus" | "onBlur" | "autoComplete" | "aria-describedby" | "aria-invalid" | "aria-required" | "children"> {
  /** Visible label. Always rendered; never replaced by a placeholder. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. */
  description?: string | undefined;
  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context
   * already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small
   * type. */
  size?: InputSize | undefined;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string | undefined;
  /** HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG 1.3.5 input-purpose identification. */
  autocomplete?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change with the new string value. */
  onChange?: ((value: string, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: ((event: FocusEvent<HTMLInputElement>) => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: ((event: FocusEvent<HTMLInputElement>) => void) | undefined;
}
/**
 * Input — Design Schema, category: input.
 *
 * When to use:
 * Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type`
 * for the value so touch keyboards and browser validation match. Provide `description` when the
 * format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the
 * value is personal data so browsers and assistive tools can fill it.
 */
export declare const Input: ({ ref, label, name, value, defaultValue, placeholder, description, type, required, hideLabel, size, disabled, invalid, error, autocomplete, overrides, onChange, onFocus, onBlur, id: idProp, className, style, ...rest }: InputProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/FormContext.d.ts
/** When field-level validation runs. Mirrors the Form `validate` prop. */
type FormValidateMode = "submit" | "blur" | "change";
/**
 * What a field contributes to the collected values. Input contributes a string, Switch a
 * boolean, Checkbox its `value` when checked, Listbox an array of values when `multiple`, and
 * `undefined` when not; `undefined` is omitted.
 */
type FormFieldValue = string | string[] | boolean | undefined;
/**
 * What an Input registers with its enclosing Form so the Form can collect
 * values, run validation, and move focus without reaching into the DOM.
 */
interface FormFieldRegistration {
  /** Field name; the key used in `onSubmit(values)` and `onInvalid(errors)`. */
  name: string;
  /** DOM id of the field, used by the error summary links. */
  id: string;
  /** Visible label, repeated in the error summary. */
  label: string;
  /** Current value read from the field. `undefined` leaves the field out of the submitted values. */
  getValue(): FormFieldValue;
  /** Disabled fields are skipped by validation and omitted from values. */
  isDisabled(): boolean;
  /** Returns an error message, or `null` when the field is valid. */
  validate(): string | null;
  /** Moves keyboard focus to the field. */
  focus(): void;
}
interface FormContextValue {
  /** `true` while the Form is disabled; every field and action reflects it. */
  disabled: boolean;
  /** The Form's `validate` mode. */
  validate: FormValidateMode;
  /** Base for generated ids, derived from the Form's `name`. */
  idBase: string | undefined;
  /** Errors currently held by the Form, keyed by field name. */
  errors: Readonly<Record<string, string>>;
  /** Registers a field; returns the matching unregister function. */
  register(field: FormFieldRegistration): () => void;
  /** Re-runs validation for one field and updates `errors`. */
  validateField(name: string): void;
}
export declare const FormContext: Context<FormContextValue | null>;
/** Returns the enclosing Form's context, or `null` outside a Form. */
export declare function useFormContext(): FormContextValue | null;
//#endregion
//#region src/Form.d.ts
/** Collected values keyed by field `name`. Strings from Input, booleans from Switch, `value` from a checked Checkbox. */
type FormValues = Record<string, Exclude<FormFieldValue, undefined>>;
/** Error messages keyed by field `name`. */
type FormErrors = Record<string, string>;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FormOverridableBinding = "gap" | "errorSummaryBorder";
interface FormProps extends Omit<ComponentPropsWithoutRef<"form">, "children" | "name" | "onSubmit" | "onInvalid" | "noValidate" | "aria-label" | "aria-labelledby"> {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order
   * rule). Rendered after the fields with the form gap. */
  actions: ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set. */
  label?: string | undefined;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  labelledBy?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  errorSummary?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the form is submitted and every field is valid. Receives the collected values keyed by field name. */
  onSubmit?: ((values: FormValues) => void) | undefined;
  /** Fired when submission is blocked by validation. Receives the errors keyed by field name. */
  onInvalid?: ((errors: FormErrors) => void) | undefined;
}
/**
 * Form — Design Schema, category: container.
 *
 * When to use:
 * Use Form whenever two or more fields are submitted together, and for any single field whose
 * submission has consequences (sign-in, search with side effects). Place actions (submit, cancel)
 * at the end in a Stack. Give the form a `label` when the page contains more than one.
 */
export declare const Form: ({ ref, children, actions, name, label, labelledBy, validate, disabled, errorSummary, overrides, onSubmit, onInvalid, className, style, ...rest }: FormProps & {
  ref?: Ref<HTMLFormElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Stack.d.ts
type StackDirection = "vertical" | "horizontal";
type StackGap = "none" | "tight" | "normal" | "loose" | "section";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify = "start" | "center" | "end" | "between";
type StackElement = "div" | "section" | "nav" | "ul" | "ol";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type StackOverridableBinding = "gap";
interface StackProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Any components. Stack does not style its children; it only positions them. */
  children: ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /** Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing scale: tight
   * for related controls, normal for fields in a form, loose for groups, section between page sections.
   * The only way to set spacing between siblings. */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /** Main-axis distribution. */
  justify?: StackJustify | undefined;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean | undefined;
  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  element?: StackElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Stack — Design Schema, category: layout.
 *
 * When to use:
 * Use Stack for any group of siblings that should be evenly spaced: form fields, a row of
 * buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS.
 * Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like
 * items — so the structure is exposed to assistive technology.
 */
export declare const Stack: ({ ref, children, direction, gap, align, justify, wrap, element, overrides, className, style, ...rest }: StackProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
type BoxElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "background" | "border" | "borderWidth" | "radius";
interface BoxProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /** Vertical padding, overriding `inset` on that axis. */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. */
  insetInline?: BoxInset | undefined;
  /** Background. `none` is transparent; `default` is the page background (use to lift content off a subtle parent); `subtle` and `strong` step up. */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /** Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark for page regions. */
  element?: BoxElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Box — Design Schema, category: layout.
 *
 * When to use:
 * Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted
 * row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with
 * conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md`
 * for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's
 * rhythm decide the numbers.
 */
export declare const Box: ({ ref, children, inset, insetBlock, insetInline, surface, border, radius, element, overrides, className, style, ...rest }: BoxProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Link.d.ts
type LinkTone = "default" | "inherit";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type LinkOverridableBinding = "underlineThickness" | "underlineOffset" | "externalIconGap" | "transition";
interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "target" | "rel" | "download" | "aria-label" | "onClick"> {
  /** The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  external?: boolean | undefined;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone | undefined;
  /** Downloads the resource instead of navigating. Web only. */
  download?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the link is activated. The default navigation still happens unless the consumer prevents it. */
  onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}
/**
 * Link — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to
 * an external site, or to a downloadable file. Use it inline inside body text (it renders inline
 * by default) and standalone in navigation lists. Use `external` whenever the destination leaves
 * the product, so people are warned before they lose their place.
 */
export declare const Link: ({ ref, href, label, external, tone, download, overrides, onClick, className, style, ...rest }: LinkProps & {
  ref?: Ref<HTMLAnchorElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Checkbox.d.ts
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "indicatorStroke" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "checked" | "defaultChecked" | "required" | "disabled" | "onChange" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-checked" | "children"> {
  /** Visible label. Clicking or tapping it toggles the control. */
  label: string;
  /** Visually hide the label (it remains the accessible name): a selection column in a Table,
   * where the row name is the label. */
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select. */
  value?: string | undefined;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only. */
  indeterminate?: boolean | undefined;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Persistent helper text below the label. */
  description?: string | undefined;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: ((checked: boolean, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
}
/**
 * Checkbox — Design Schema, category: input.
 *
 * When to use:
 * Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`),
 * or several with the same `name` when the user may pick any number of items. Use
 * `indeterminate` on a "select all" parent when only some of its children are checked.
 */
export declare const Checkbox: ({ ref, label, hideLabel, name, value, checked, defaultChecked, indeterminate, disabled, required, invalid, description, error, overrides, onChange, onClick, id: idProp, className, style, ...rest }: CheckboxProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Switch.d.ts
type SwitchLabelPosition = "start" | "end";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SwitchOverridableBinding = "trackWidth" | "trackHeight" | "thumbSize" | "thumbInset" | "radius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface SwitchProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "role" | "name" | "value" | "checked" | "defaultChecked" | "disabled" | "onChange" | "aria-describedby" | "aria-checked" | "children"> {
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
  /** Persistent helper text below the label explaining the effect. */
  description?: string | undefined;
  /** Where the label sits relative to the track. `start` is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the state changes, with the new boolean. The change is already in effect; there is nothing to submit. */
  onChange?: ((checked: boolean, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
}
/**
 * Switch — Design Schema, category: input.
 *
 * When to use:
 * Use a Switch for a binary setting that applies as soon as it changes and can be undone by
 * flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists
 * and preference panels, with `labelPosition: start` so the labels line up and the switches sit
 * at the row end.
 */
export declare const Switch: ({ ref, label, name, checked, defaultChecked, disabled, description, labelPosition, overrides, onChange, onClick, id: idProp, className, style, ...rest }: SwitchProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/RadioGroup.d.ts
type RadioGroupOrientation = "vertical" | "horizontal";
/** One option. `value` is a short identifier (letters, digits, dashes) — it becomes part of an element id. */
type RadioGroupOption = {
  value: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type RadioGroupOverridableBinding = "controlBorderWidth" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "name" | "disabled" | "onChange" | "children" | "aria-describedby" | "aria-invalid" | "aria-required"> {
  /** The group's legend — the question the options answer. Always visible. */
  label: string;
  /** Field name used by the enclosing Form. Also links the radios into one native group. */
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
  /** Persistent helper text under the legend. */
  description?: string | undefined;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new option value. */
  onChange?: ((value: string, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
}
/**
 * RadioGroup — Design Schema, category: input.
 *
 * When to use:
 * Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing
 * them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give
 * options a `description` when the label alone does not tell them apart. Set `defaultValue` when
 * there is a sensible default; leave the group unselected when the choice is consequential and
 * you want a deliberate answer.
 */
export declare const RadioGroup: ({ ref, label, name, options, value, defaultValue, orientation, required, invalid, disabled, description, error, overrides, onChange, onBlur, id: idProp, className, style, ...rest }: RadioGroupProps & {
  ref?: Ref<HTMLFieldSetElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Disclosure.d.ts
/** Accepts the schema's string values and their numeric equivalents. */
type DisclosureHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/** Why the state changed: a pointer click, a keyboard activation (Enter/Space), or an external `open` prop change. */
type DisclosureToggleReason = "pointer" | "keyboard" | "controlled";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
interface DisclosureProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "disabled" | "children" | "aria-expanded" | "aria-controls" | "aria-disabled" | "onToggle" | "onClick"> {
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
  headingLevel?: DisclosureHeadingLevel | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired after the state changes, with the new boolean `open` and a reason: `pointer`,
   * `keyboard`, or `controlled` (Accordion relies on it).
   */
  onToggle?: ((open: boolean, reason: DisclosureToggleReason) => void) | undefined;
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
export declare const Disclosure: ({ ref, summary, children, open, defaultOpen, disabled, keepMounted, headingLevel, overrides, onToggle, id: idProp, className, style, ...rest }: DisclosureProps & {
  ref?: Ref<HTMLButtonElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Alert.d.ts
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertLive = "status" | "alert" | "off";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AlertOverridableBinding = "border" | "borderWidth" | "radius" | "padding" | "gap" | "partGap" | "iconSize" | "headingSize" | "headingWeight" | "fontFamily" | "fontSize" | "lineHeight" | "dismissMargin";
interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "title"> {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  tone?: AlertTone | undefined;
  /** A short bold first line for the message. Optional for one-line messages. Not the native `title` attribute. */
  heading?: string | undefined;
  /** The message body. Text and Links; no headings or form controls. */
  children: ReactNode;
  /** How the alert is announced when it appears. `status` is polite, `alert` interrupts, `off` for alerts present at load. */
  live?: AlertLive | undefined;
  /** Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert. */
  dismissible?: boolean | undefined;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: (() => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Alert — Design Schema, category: feedback.
 *
 * When to use:
 * Use an Alert for a message that relates to the current view and should stay visible: a failed
 * save above the form, an expiring trial at the top of a screen, a success confirmation after
 * submit, a note that some features are unavailable offline. Choose `tone` by what the user
 * should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix
 * something. Use `dismissible` for messages the user can safely put away; leave persistent
 * problems undismissable.
 */
export declare const Alert: ({ ref, tone, heading, children, live, dismissible, onDismiss, overrides, className, style, ...rest }: AlertProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Landmark.d.ts
type LandmarkRole = "banner" | "navigation" | "main" | "complementary" | "contentinfo" | "region" | "search" | "form";
type LandmarkElement = "header" | "nav" | "main" | "aside" | "footer" | "section" | "form" | "div";
interface LandmarkProps extends Omit<HTMLAttributes<HTMLElement>, "role" | "children" | "aria-label"> {
  /** Which landmark this is. `main` exactly once per page; `region` and `form` only with a `label`. */
  role: LandmarkRole;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Not shown visually. */
  label?: string | undefined;
  /** The region's content. */
  children: ReactNode;
  /** Web element override. Set this only when the native element would be wrong, e.g. a `banner` that is not the page header. */
  as?: LandmarkElement | undefined;
}
/**
 * Landmark — Design Schema, category: layout.
 *
 * When to use:
 * Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for
 * the primary content, `navigation` for each navigation block (labelled when there is more than
 * one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site
 * footer, `search` around the site search form, and `region` for any other section a user might
 * want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly
 * one `main`.
 */
export declare const Landmark: ({ ref, role, label, children, as, className, ...rest }: LandmarkProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => DetailedReactHTMLElement<HTMLAttributes<HTMLElement> & {
  "data-ds": string;
}, HTMLElement>;
//#endregion
//#region src/Breadcrumb.d.ts
type BreadcrumbItem = {
  label: string;
  href?: string | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label"> {
  /** The trail from root to current page, in order. An ancestor without `href` renders as plain text; the last is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis reveals the rest. */
  collapse?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a non-current item is activated, with the item, its index and the click event; call `event.preventDefault()` to route client-side. */
  onNavigate?: ((item: BreadcrumbItem, index: number, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}
/**
 * Breadcrumb — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
 * catalogues, settings sub-pages, file browsers — where the user benefits from seeing the
 * ancestors and jumping to any of them. Place it above the page title, at the top of `main`.
 */
export declare const Breadcrumb: ({ ref, items, label, collapse, overrides, onNavigate, className, style, ...rest }: BreadcrumbProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Meter.d.ts
type MeterTone = "info" | "success" | "warning" | "danger";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type MeterOverridableBinding = "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition";
interface MeterProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role"> {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%"). */
  valueText?: string | undefined;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns — the meter does not decide what is "too full". */
  tone?: MeterTone | undefined;
  /** Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding one). The accessible value is always exposed. */
  hideValue?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Meter — Design Schema, category: data.
 *
 * When to use:
 * Use a Meter for a measurement with a fixed range: storage or quota used, battery, password
 * strength, a score out of ten, a budget consumed. Let the consumer decide the tone from
 * thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText`
 * whenever the raw percentage is not what a person would say.
 */
export declare const Meter: ({ ref, value, min, max, label, valueText, tone, hideValue, overrides, id: idProp, className, style, ...rest }: MeterProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Icon.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type IconOverridableBinding = "size" | "color" | "strokeWidth";
interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "name" | "role" | "aria-hidden" | "aria-label" | "viewBox" | "focusable" | "width" | "height" | "children"> {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs a shape;
   * `info`, `success`, `warning` and `danger` are the four status shapes (circle-i, circle-check,
   * triangle-!, octagon-x) so tone is never carried by color alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring
   * `size`. For icons inside Text, Link and Button labels.
   */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an image with
   * this name; when omitted or empty, it is decorative and hidden from assistive technology. Most
   * icons sit next to text and should have no label.
   */
  label?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Icon — Design Schema, category: primitive.
 *
 * When to use:
 * Use an Icon wherever a component's anatomy names one: the leading icon in a Button, the chevron
 * in a Disclosure, the status shape in an Alert, the check in a Checkbox, the external mark on a
 * Link, the ellipsis in a collapsed Breadcrumb. Use `inline` when the icon is inside running text.
 * Give it a `label` only when the icon is the whole message — a lone warning triangle in a table
 * cell, say — and the label is what a screen reader should say instead.
 *
 * Glyphs are drawn in `currentColor`, so a Button, Link or Alert colors them for free; only an
 * icon with no colored ancestor falls back to `color.foreground`. Line glyphs use the focus-ring
 * width as their stroke.
 */
export declare const Icon: ({ ref, name, size, inline, label, overrides, className, style, ...rest }: IconProps & {
  ref?: Ref<SVGSVGElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Card.d.ts
/** Accepts the schema's string values and their numeric equivalents. */
type CardHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
type CardInset = "sm" | "md" | "lg";
type CardSurface = "default" | "subtle";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "hoverBackground" | "transition";
interface CardProps extends Omit<ComponentPropsWithoutRef<"article">, "children" | "aria-labelledby"> {
  /** The body. Usually a Stack of Text and controls. */
  children: ReactNode;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content. */
  heading?: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  headingLevel?: CardHeadingLevel | undefined;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two. */
  headerActions?: ReactNode;
  /** The action row. Buttons in a horizontal Stack, primary first, following Form's action-order rule. */
  footer?: ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one interactive child (a Link
   * or Button) whose action the card extends to its full area; the card itself is not focusable.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it by script, and
   * draws its own focus ring when focused that way. Not a tab stop; not for making cards
   * clickable (`interactive`).
   */
  focusable?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Card — Design Schema, category: container.
 *
 * When to use:
 * Use Cards for collections of like items where each needs its own boundary, and for a single
 * panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in
 * a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page.
 * Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
 */
export declare const Card: ({ ref, children, heading, headingLevel, headerActions, footer, inset, surface, interactive, focusable, overrides, className, style, ...rest }: CardProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Container.d.ts
type ContainerWidth = "prose" | "content" | "page" | "full";
type ContainerGutter = "narrow" | "default" | "wide" | "none";
type ContainerAlign = "center" | "start";
type ContainerElement = "div" | "main" | "section";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ContainerOverridableBinding = "maxWidth" | "paddingInline";
interface ContainerProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** The page or region content, usually a Stack with `gap: section` between regions. */
  children: ReactNode;
  /** `prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed
   * layouts with wide grids, `full` for no cap (gutters only). */
  width?: ContainerWidth | undefined;
  /** Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the
   * content width and the wide gutter above the page width. `none` for a nested container inside a
   * padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. */
  align?: ContainerAlign | undefined;
  /** Use `main` for the page's main column when no Landmark wraps it. */
  element?: ContainerElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Container — Design Schema, category: layout.
 *
 * When to use:
 * Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for
 * application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or
 * side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own
 * inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a
 * narrower measure than the page.
 */
export declare const Container: ({ ref, children, width, gutter, align, element, overrides, className, style, ...rest }: ContainerProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
type FocusScopeEscapeDirection = "forward" | "backward";
interface FocusScopeProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "tabIndex" | "onKeyDown" | "autoFocus"> {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: ReactNode;
  /**
   * Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside
   * is pulled back in. False turns the scope into a plain "move focus in and restore on exit"
   * helper, for non-modal panels.
   */
  trapped?: boolean | undefined;
  /**
   * Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper
   * (made focusable with tabindex -1, for reading-first dialogs), or nowhere.
   */
  autoFocus?: FocusScopeAutoFocus | undefined;
  /**
   * On unmount, focus returns to the element that was focused when the scope mounted, or to the
   * next focusable element in the document if that one is gone.
   */
  restoreFocus?: boolean | undefined;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Required on native when
   * the opener is not a TextInput (React Native exposes no generic "currently focused element"),
   * so every overlay passes its trigger ref.
   */
  returnFocusTo?: RefObject<HTMLElement | null> | undefined;
  /**
   * Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is
   * open, so the innermost active scope owns Tab.
   */
  active?: boolean | undefined;
  /**
   * Fired when trapped focus would have left the scope (Tab from the last element, Shift+Tab from
   * the first) just before it wraps, with the direction. Diagnostic; components do not need it.
   */
  onEscapeAttempt?: ((direction: FocusScopeEscapeDirection) => void) | undefined;
}
/**
 * FocusScope — Design Schema, category: primitive.
 *
 * When to use:
 * Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it
 * in their composition, and that is where it should live. Render it yourself only when building a
 * new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay),
 * with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal
 * panel that should still move focus in and restore it on close (a slide-in filter drawer that
 * keeps the page usable).
 */
export declare const FocusScope: ({ ref, children, trapped, autoFocus, restoreFocus, returnFocusTo, active, onEscapeAttempt, className, ...rest }: FocusScopeProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Dialog.d.ts
type DialogSize = "sm" | "md" | "lg";
type DialogInitialFocus = "first" | "title" | "close";
type DialogCloseReason = "escape" | "close-button" | "scrim" | "action";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "layer" | "enter" | "exit";
interface DialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open"> {
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: ReactNode;
  /** Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer); Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Portal target for the dialog's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Dialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Dialog for a short task that must complete before the user continues and needs its own
 * space: rename, create-with-a-few-fields, choose from options with consequences, confirm
 * something reversible with a form attached. Keep it to one screen of content; a dialog that
 * scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing
 * action first.
 */
export declare const Dialog: ({ ref, open, heading, description, children, footer, hideHeading, size, dismissible, initialFocus, onClose, onOpened, container, overrides, className, style, ...rest }: DialogProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}) => ReactPortal | null;
//#endregion
//#region src/AlertDialog.d.ts
type AlertDialogTone = "danger" | "warning" | "info";
type AlertDialogCancelReason = "cancel" | "escape";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "layer" | "enter" | "exit";
interface AlertDialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open"> {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences. Required: a decision without consequences stated is not a decision. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Portal target for the dialog's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * AlertDialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use an AlertDialog before an action that destroys data, spends money, sends something that
 * cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not
 * available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable,
 * `info` for a decision with no downside that still needs a choice (leave the page with unsaved
 * changes? — that is `warning`).
 *
 * Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is
 * faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to
 * collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you
 * sure" habit — if a team finds itself adding many, the actions need undo.
 */
export declare const AlertDialog: ({ ref, open, heading, description, tone, confirmLabel, cancelLabel, confirmDisabled, onConfirm, onCancel, container, overrides, className, style, ...rest }: AlertDialogProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}) => ReactPortal | null;
//#endregion
//#region src/Menu.d.ts
type MenuTriggerVariant = "ghost" | "secondary" | "primary";
type MenuTriggerIcon = "ellipsis" | "chevron-down" | "none";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
type MenuItemTone = "default" | "danger";
/** Why the menu opened or closed; `action` fires before `onAction`. `controlled` is never emitted
 * by this component — it names the case where the parent flips `open` itself, outside any of the
 * other reasons, and is documented for consumers who forward the reason elsewhere. */
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
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter";
interface MenuProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /** Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row. */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant | undefined;
  /**
   * Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes
   * the accessible name), `chevron-down` for a labelled dropdown, `none`.
   */
  triggerIcon?: MenuTriggerIcon | undefined;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  iconOnly?: boolean | undefined;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  placement?: MenuPlacement | undefined;
  /** Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu. */
  open?: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a trigger; the trigger part
   * is omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by
   * context menus.
   */
  anchor?: RefObject<HTMLElement | null> | undefined;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: ((id: string) => void) | undefined;
  /**
   * Fired when the menu opens or closes, with `{ open, reason }` — reason: `trigger`, `escape`,
   * `outside`, `action` (an item was chosen; fired before onAction), `controlled`.
   */
  onOpenChange?: ((state: {
    open: boolean;
    reason: MenuOpenChangeReason;
  }) => void) | undefined;
  /** Portal target for the popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Menu — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Menu for secondary actions on an item or a view that do not deserve their own buttons:
 * overflow ("More actions"), sort or view options, account menus. Group related items with a
 * `group` label when there are more than about six; separate a danger action with a `separator`.
 * On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is
 * "pick an action" and let the platform decide the surface.
 */
export declare const Menu: ({ ref, label, items, triggerVariant, triggerIcon, iconOnly, placement, open: openProp, anchor, onAction, onOpenChange, container, overrides, className, style, ...rest }: MenuProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Tooltip.d.ts
type TooltipPlacement = "top" | "bottom" | "start" | "end";
type TooltipDelay = "default" | "none";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TooltipOverridableBinding = "radius" | "paddingBlock" | "paddingInline" | "offset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "shadow" | "layer" | "enter" | "exit";
interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error, because keyboard users could never see the tooltip. */
  children: ReactElement<any>;
  /** Preferred side; flips when it would overflow the viewport. */
  placement?: TooltipPlacement | undefined;
  /**
   * `true`: the tooltip is supplementary and becomes the child's accessible description
   * (aria-describedby). `false`: the tooltip IS the child's name (an icon-only button whose label
   * equals the tooltip) and is linked as aria-labelledby instead.
   */
  describes?: boolean | undefined;
  /**
   * Hover delay before showing: `default` uses `motion.duration.base` × 3 (roughly 600ms); `none`
   * for toolbars where a sibling tooltip is already open.
   */
  delay?: TooltipDelay | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Tooltip — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Tooltip on an icon-only Button to show its name on hover and focus (with `describes: false`
 * so it is the accessible name, not a second announcement), or on a labelled control to add a short
 * clarification ("Includes archived items"). Use it in toolbars, table headers and dense UI where
 * visible labels do not fit. Keep it to a phrase.
 *
 * Do not put essential instructions, error messages or any content the user must read in a
 * tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or
 * buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned).
 * Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open
 * it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint
 * and is not visible.
 */
export declare const Tooltip: ({ ref, content, children, placement, describes, delay, overrides }: TooltipProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings (labelColor)
 * are never in this list. `labelSize` and `fontFamily` are forwarded to the composed `Text`
 * label's own `overrides`, since Text already owns those bindings.
 */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
interface DividerProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-orientation"> {
  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider
   * from decorative into a labelled separator. Meaningful on `horizontal` dividers only.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. Leave false for purely visual lines between
   * list rows; set true (or provide a label) when the divider marks a real boundary between
   * sections that a screen-reader user should hear.
   */
  semantic?: boolean | undefined;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or the composed label's own override) to that token. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Divider — Design Schema, category: layout.
 *
 * When to use:
 * Use a Divider between items in a dense list where whitespace alone does not separate them,
 * between groups in a menu (Menu renders its own), between toolbar groups (`vertical`), and with a
 * `label` as an "or" between alternatives (sign in with email — or — with a provider) or a date
 * heading in a feed. Use `spacing` when the divider stands outside a Stack.
 */
export declare const Divider: ({ ref, orientation, label, semantic, spacing, overrides, className, style, ...rest }: DividerProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Fieldset.d.ts
type FieldsetGap = "tight" | "normal" | "loose";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "disabledOpacity" | "fontFamily" | "lineHeight";
interface FieldsetProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "disabled" | "children" | "aria-describedby" | "aria-disabled" | "aria-invalid"> {
  /** The group's name — what the fields together describe ("Shipping address", "Notification
   * preferences"). Always visible. The accessible name of the group; screen readers read it
   * before each field inside. */
  legend: string;
  /** The fields, usually a Stack of Inputs, Checkboxes or Switches. */
  children: ReactNode;
  /** Persistent helper text under the legend. Linked with aria-describedby on the group. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date").
   * Field-level errors stay on the fields. Rendered once under the group with role=alert and
   * linked with aria-describedby. */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Fieldset — Design Schema, category: input.
 *
 * When to use:
 * Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a
 * card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when
 * the group needs a rule ("We only ship within the EU") and put cross-field errors on the group
 * rather than on one field.
 */
export declare const Fieldset: ({ ref, legend, children, description, error, disabled, gap, overrides, id: idProp, className, style, ...rest }: FieldsetProps & {
  ref?: Ref<HTMLFieldSetElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Toast.d.ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastDuration = "short" | "long" | "persistent";
type ToastDismissReason = "timeout" | "dismiss-button" | "action" | "replaced";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "enter" | "exit";
interface ToastProps extends Omit<ComponentPropsWithoutRef<"div">, "id" | "children" | "role" | "onPointerEnter" | "onPointerLeave" | "onFocus" | "onBlur" | "onKeyDown"> {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s, `persistent` until dismissed — required when there is an action
   * the user may need time to take, and for danger tone.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /** The toast left the screen: reason `timeout`, `dismiss-button`, `action`, or `replaced`. */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Toast — Design Schema, category: feedback.
 *
 * When to use:
 * Use a Toast to confirm a completed action that the user did not have to watch (sent, saved,
 * deleted, copied), to offer Undo for a reversible action, or to report a background result
 * ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever
 * there is an action, and for `danger`, so nobody misses the one they needed.
 */
export declare const Toast: ({ ref, message, tone, actionLabel, duration, dismissible, toastId, onAction, onDismiss, overrides, className, style, ...rest }: ToastProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
/** Options for the imperative `toast()` call; the same fields as `ToastProps`, minus what only makes sense on a directly-rendered `<Toast>`. */
interface ToastOptions {
  message: string;
  tone?: ToastTone | undefined;
  actionLabel?: string | undefined;
  duration?: ToastDuration | undefined;
  dismissible?: boolean | undefined;
  toastId?: string | undefined;
  onAction?: (() => void) | undefined;
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ToastRegionOverridableBinding = "regionInset" | "stackGap" | "layer";
interface ToastRegionProps {
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ToastRegion — the one persistent landmark that holds every visible Toast.
 *
 * Mount it once at the app root (or let `toast()` auto-mount it on first use). It exists before
 * any toast so announcements fire, is reachable from anywhere with F6, and stacks up to three
 * toasts above one another, newest last.
 */
export declare const ToastRegion: ({ ref, overrides }: ToastRegionProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactPortal | null;
/**
 * Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
 * rendered: `toast({ message: 'Link copied' })`. Returns the toast's `id`.
 */
export declare function toast(options: ToastOptions): string;
//#endregion
//#region src/Popover.d.ts
type PopoverPlacement = "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end" | "start" | "end";
type PopoverOpenChangeReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** Heading level of the panel heading. Accepts the schema's string values and their numeric equivalents. */
type PopoverHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "layer" | "enter" | "exit";
interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. The popover adds aria-expanded and aria-controls to it. */
  trigger: ReactElement<any>;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger. */
  heading?: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline (a popover usually sits under a level-2 section). */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay in the viewport. */
  placement?: PopoverPlacement | undefined;
  /**
   * False (default): the page stays interactive; clicking outside closes; focus moves in but is
   * not trapped, and Tab out closes. True: behaves as a small Dialog anchored to the trigger —
   * focus trapped, background inert — for content that must be finished (a required form).
   */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default; Calm & precise prefers a plain edge. */
  showArrow?: boolean | undefined;
  /** Show the close button. Escape and outside click work regardless (non-modal). */
  dismissible?: boolean | undefined;
  /**
   * Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `outside`, `close-button`, `tab-out`.
   */
  onOpenChange?: ((open: boolean, reason: PopoverOpenChangeReason) => void) | undefined;
  /** Portal target for the panel's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Popover — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date
 * field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help
 * with a link. Use `modal` when the panel contains a required step (a short form that must be
 * submitted or cancelled). Use `heading` when the content is not obvious from the trigger.
 */
export declare const Popover: ({ ref, trigger, children, heading, headingLevel, open: openProp, placement, modal, showArrow, dismissible, onOpenChange, container, overrides }: PopoverProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/BottomSheet.d.ts
type BottomSheetHeight = "content" | "half" | "full";
type BottomSheetCloseReason = "escape" | "close-button" | "scrim" | "drag" | "action";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "inset" | "partGap" | "footerGap" | "maxWidth" | "layer" | "enter" | "exit";
interface BottomSheetProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open"> {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /** Keep the heading for assistive technology but do not render it (forwarded to Dialog above the breakpoint). The accessible name is required regardless; visually hidden is fine, absent is not. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean | undefined;
  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive: the close
   * button and Escape always exist.
   */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. */
  onDragDismiss?: (() => void) | undefined;
  /** Portal target for the sheet's DOM node. Defaults to `document.body`. Only used below the wide-viewport breakpoint; the Dialog presentation manages its own container. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. Only applied to the bottom-edge presentation; above the wide breakpoint the sheet renders as Dialog and uses Dialog's own overrides contract. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * BottomSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog:
 * filters, a form of a few fields, details of a selected item, a picker with many options. Use
 * `height: content` by default; `full` for a task that needs the whole screen but should still feel
 * dismissable; `half` for a browsable list where seeing the page behind matters (a map with
 * results). For a flat list of actions, ActionSheet is the lighter component.
 */
export declare const BottomSheet: ({ ref, open, heading, hideHeading, children, footer, height, dismissible, dragToDismiss, onClose, onDragDismiss, container, overrides, className, style, ...rest }: BottomSheetProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}) => ReactElement | null;
//#endregion
//#region src/ActionSheet.d.ts
type ActionSheetActionTone = "default" | "danger";
type ActionSheetCloseReason = "escape" | "scrim" | "cancel" | "drag";
/** A single row in the sheet. */
type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
};
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `titleSize`, and `fontFamily`/`lineHeight` for the heading, are forwarded to the
 * composed `Text` heading's own `overrides`, since Text already owns those bindings; `fontFamily`
 * and `lineHeight` are also applied to the item rows directly. Only applies to the phone
 * presentation — above the wide breakpoint the sheet renders as `Menu` and uses Menu's own
 * overrides contract.
 */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "headerPaddingBlock" | "titleSize" | "fontFamily" | "fontSize" | "lineHeight" | "divider" | "dividerWidth" | "maxWidth" | "layer" | "enter" | "exit";
interface ActionSheetProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onClose" | "open"> {
  /** Controlled visibility. */
  open: boolean;
  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`.
   */
  heading?: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close; Escape still reports through onClose when false, as in Dialog. */
  dismissible?: boolean | undefined;
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: ((id: string) => void) | undefined;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: ((reason: ActionSheetCloseReason) => void) | undefined;
  /** Portal target for the sheet's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ActionSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened
 * from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits
 * without scrolling; more than eight actions means the item needs its own screen. Put destructive
 * actions last with `tone: danger`.
 */
export declare const ActionSheet: ({ ref, open, heading, actions, dismissible, cancelLabel, onAction, onClose, container, overrides, className, style, ...rest }: ActionSheetProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}) => ReactElement | null;
//#endregion
//#region src/SidePanel.d.ts
type SidePanelSide = "start" | "end";
type SidePanelWidth = "narrow" | "default" | "wide";
type SidePanelPersistent = "never" | "content" | "page";
type SidePanelRole = "complementary" | "navigation";
type SidePanelOpenChangeReason = "trigger" | "escape" | "close-button" | "scrim" | "swipe" | "action" | "navigation";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface SidePanelProps {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with a label like "Menu"). It is
   * the APG disclosure button: the panel adds aria-expanded and aria-controls to it, and it stays a
   * toggle — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar).
   */
  trigger?: ReactElement<any> | undefined;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`. */
  heading: string;
  /** Keep the title for assistive technology but do not render it (a navigation panel whose List is self-explanatory). The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body: a List or Tree of Links for navigation, a Form of filters, a Stack of Cards. Scrolls inside the panel when taller than the viewport. */
  children: ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: ReactNode;
  /** The edge the panel slides from: `start` is left in left-to-right languages and right in right-to-left; `end` the opposite. */
  side?: SidePanelSide | undefined;
  /** Panel width on wide screens: `narrow` for a list of links, `wide` for a form or a detail. */
  width?: SidePanelWidth | undefined;
  /**
   * Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the
   * content: always visible, no scrim, no trap, part of the page's tab order, and the trigger is
   * hidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page.
   */
  persistent?: SidePanelPersistent | undefined;
  /**
   * The landmark the panel exposes (in persistent mode, and as the region's role while open in
   * non-modal mode): `navigation` for a menu of Links, `complementary` for filters, a cart, a
   * detail. On web this selects the Landmark component's element (`nav` or `aside`). Not used when
   * `modal` — a modal panel is a dialog, not a landmark.
   */
  role?: SidePanelRole | undefined;
  /**
   * False (the default, the disclosure pattern): no scrim by default, the page stays live and in
   * the tab order, focus stays on the trigger when it opens, and Escape or an outside click closes
   * it. True: the panel is a modal Dialog at the edge — scrim, focus trapped, page inert.
   */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too (modal always has one). */
  scrim?: boolean | undefined;
  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe gesture all request
   * close. When false, the close button is not rendered and taps outside do nothing; Escape still
   * reports through `onOpenChange` with reason `escape` (the consumer decides), as in Dialog.
   */
  dismissible?: boolean | undefined;
  /** On touch, a swipe toward the edge dismisses. Purely additive: the trigger and close button always exist. */
  swipeable?: boolean | undefined;
  /**
   * Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `close-button`, `scrim`, `swipe`, `action`, `navigation` (a Link inside was followed).
   */
  onOpenChange?: ((open: boolean, reason: SidePanelOpenChangeReason) => void) | undefined;
  /** Portal target for the panel's DOM node. Defaults to `document.body`. Not used in persistent mode. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * SidePanel — Design Schema, category: overlay.
 *
 * When to use:
 * Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a List or Tree of
 * Links from the `start` edge), for filters beside a results page, for a cart or a detail panel
 * from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should
 * become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary
 * overlay (a cart).
 */
export declare const SidePanel: ({ ref, trigger, open: openProp, heading, hideHeading, children, footer, side, width, persistent, role, modal, scrim, dismissible, swipeable, onOpenChange, container, overrides }: SidePanelProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Tabs.d.ts
type TabsActivation = "automatic" | "manual";
type TabsOrientation = "horizontal" | "vertical";
type TabsFit = "start" | "fill";
/** One tab. `badge` is a short count or status shown after the label ("3", "New"). */
type TabsItem = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "indicatorThickness" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
interface TabPanelProps extends Omit<ComponentPropsWithoutRef<"div">, "id"> {
  /** Matches the `id` of the tab this panel belongs to. */
  id: string;
  children: ReactNode;
}
/** The wrapper for one tab's content — a direct child of `Tabs`, one per tab, in the same order. */
export declare const TabPanel: ({ ref, id, children, className, ...rest }: TabPanelProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
interface TabsProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange"> {
  /** The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). */
  tabs: TabsItem[];
  /**
   * One panel per tab, in the same order, each wrapped in the exported `TabPanel` with a matching
   * `id`. Only the selected panel is rendered unless `keepMounted`.
   */
  children: ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it (fine when panels are cheap); `manual`
   * moves focus only and selects on Enter/Space (use when a panel loads data).
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  orientation?: TabsOrientation | undefined;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((id: string) => void) | undefined;
}
/**
 * Tabs — Design Schema, category: navigation.
 *
 * When to use:
 * Use Tabs to split a region's content into two to about seven views that are alternatives of each
 * other: the sections of a settings page, "Overview / Activity / Files" on a record, code and
 * preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are
 * many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.
 */
export declare const Tabs: ({ ref, tabs, children, label, value, defaultValue, activation, orientation, fit, keepMounted, overrides, onChange, className, style, ...rest }: TabsProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/SegmentedControl.d.ts
type SegmentedControlSize = "sm" | "md";
/** One segment. `label` is one word; with `iconOnly` it becomes the accessible name and Tooltip text. */
type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SegmentedControlOverridableBinding = "groupPadding" | "groupRadius" | "segmentShadow" | "segmentRadius" | "segmentPaddingInline" | "segmentPaddingBlock" | "segmentGap" | "segmentSpacing" | "selectedWeight" | "paddingBlockSm" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "transition" | "disabledOpacity";
interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  label: string;
  /** Two to five options. Labels are one word; with `iconOnly` the label becomes the accessible name. */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected value. Defaults to the first enabled option — a segmented control always has a selection. */
  defaultValue?: string | undefined;
  /** Show icons only (every option must have one); labels become accessible names and Tooltips. */
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
 * Use it for two to five short, parallel options that change what a region shows or how a tool
 * behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in
 * toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible
 * Text label when the group's purpose is not obvious.
 */
export declare const SegmentedControl: ({ ref, label, options, value, defaultValue, iconOnly, size, fill, overrides, onChange, className, style, ...rest }: SegmentedControlProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Listbox.d.ts
/** One selectable row, or a labelled cluster of rows. Export used verbatim from the schema shape. */
type ListboxOption = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
} | {
  group: string;
  options: ListboxOption[];
};
/** A value, or with `multiple` an array of values. */
type ListboxValue = string | string[];
type ListboxMaxVisible = "5" | "8" | "12" | "all" | 5 | 8 | 12;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ListboxOverridableBinding = "border" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
interface ListboxProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange" | "defaultValue"> {
  /** Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` instead and this is ignored. */
  label: string;
  /** Id of a visible element that labels the list. */
  labelledBy?: string | undefined;
  /** Flat or grouped options. */
  options: ListboxOption[];
  /**
   * Allow any number of selections. The value becomes an array; each option shows a check
   * indicator; selection toggles rather than moves. This is the same engine Combobox uses for
   * multi-select.
   */
  multiple?: boolean | undefined;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  value?: ListboxValue | undefined;
  /** Initial selection (or array). */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: arrow keys select as they move (the common picker feel). Set false when
   * selection has side effects, so arrows only move and Space selects.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /** Marks the list invalid (aria-invalid). */
  invalid?: boolean | undefined;
  /** Error message rendered below the list and linked by aria-describedby; implies invalid. */
  error?: string | undefined;
  /** The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; the list draws none of its own. */
  embedded?: boolean | undefined;
  /** The option that is active when the list first receives focus. Defaults to the first selected, else the first enabled option. */
  defaultActiveValue?: string | undefined;
  /** Options are being fetched (async Combobox); the list shows `copy.loading` in place of the empty message and is aria-busy. */
  loading?: boolean | undefined;
  /** The whole list is inert but readable. */
  disabled?: boolean | undefined;
  /** Field name for Form collection. Multiple values are collected as an array. */
  name?: string | undefined;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: ListboxValue) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value. */
  onActiveChange?: ((value: string | null) => void) | undefined;
}
/**
 * Listbox — Design Schema, category: input.
 *
 * When to use:
 * Use a standalone Listbox when the options should stay visible: a settings picker with five to
 * twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick
 * any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side
 * effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use
 * Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a
 * Listbox.
 */
export declare const Listbox: ({ ref, label, labelledBy, options, multiple, value, defaultValue, selectionFollowsFocus, required, invalid, error, embedded, defaultActiveValue, loading, disabled, name, emptyMessage, maxVisible, overrides, onChange, onActiveChange, onBlur, onFocus, id: idProp, className, style, ...rest }: ListboxProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Select.d.ts
type SelectValue = string | string[];
type SelectNative = "auto" | "always" | "never";
type SelectSize = "sm" | "md";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight` and `helperSize` are forwarded to the composed `Text` label/description's
 * own `overrides`, since Text already owns those bindings.
 */
type SelectOverridableBinding = "triggerBorderFocus" | "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerPaddingBlockSm" | "triggerGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "lineHeight" | "minTargetSm" | "disabledOpacity" | "enter";
interface SelectProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "onChange" | "children" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-haspopup" | "aria-expanded" | "aria-controls" | "aria-labelledby"> {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The options, passed through to the Listbox. */
  options: ListboxOption[];
  /** Controlled value (array with `multiple`). */
  value?: SelectValue | undefined;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue | undefined;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  placeholder?: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as
   * DatePicker's month and year. */
  hideLabel?: boolean | undefined;
  /** sm for pickers inside toolbars and calendar headers. */
  size?: SelectSize | undefined;
  /**
   * Controlled popup state, for programmatic opening and for stories and tests (the Keyboard
   * story renders it open). Omit for the trigger-driven default.
   */
  open?: boolean | undefined;
  /**
   * Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer);
   * the popup stays open while toggling and closes on Escape or outside click.
   */
  multiple?: boolean | undefined;
  /** Helper text under the label. */
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
   * Use the platform's own picker instead of the popup Listbox: `auto` never uses a native
   * `<select>` on web (the styled popup); `always` forces a native `<select>` (forms that must
   * work without JS); `never` forces the popup. `auto` and `never` behave identically on web.
   */
  native?: SelectNative | undefined;
  /** Portal target for the popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: SelectValue) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Select — Design Schema, category: input.
 *
 * When to use:
 * Use a Select for a form field with about seven to fifty options that people recognise on sight —
 * country, role, status, time zone from a short list, a category. Use `multiple` for tags or
 * memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms
 * that must work without JavaScript. Use Combobox instead when the list is long enough that typing
 * to filter is faster than scrolling, or when free text is allowed.
 */
export declare const Select: ({ ref, label, name, options, value, defaultValue, placeholder, hideLabel, size, open: openProp, multiple, description, required, disabled, invalid, error, native, container, overrides, onChange, onOpenChange, id: idProp, className, style, onClick: onClickProp, onKeyDown: onKeyDownProp, onFocus, onBlur, ...rest }: SelectProps & {
  ref?: Ref<HTMLButtonElement | HTMLSelectElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Combobox.d.ts
type ComboboxValue = string | string[];
type ComboboxFilter = "startsWith" | "contains" | "none" | "async";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight`/`helperSize` are forwarded to the composed `Text` label/description's
 * own `overrides`, since Text already owns those bindings.
 */
type ComboboxOverridableBinding = "fieldBorderFocus" | "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
interface ComboboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "onChange" | "children" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-haspopup" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "autoComplete"> {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxOption[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue | undefined;
  /** Initial value(s). */
  defaultValue?: ComboboxValue | undefined;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /**
   * Pick many: selected options appear as chips before the input, each removable; the list stays
   * open while toggling; Backspace in an empty input removes the last chip.
   */
  multiple?: boolean | undefined;
  /**
   * Typed text that matches no option can be committed as a value (tags, emails). Enter or a
   * separator (comma) commits it; the list shows `copy.addCustom` as the first row.
   */
  allowCustom?: boolean | undefined;
  /**
   * How typing narrows `options`: by prefix, by substring (default), not at all (the list is a
   * picker; typing only moves the active option), or by the consumer (`async`).
   */
  filter?: ComboboxFilter | undefined;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string | undefined;
  /** Helper text under the label. */
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
  /** Portal target for the popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: ComboboxValue) => void) | undefined;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: ((text: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Combobox — Design Schema, category: input.
 *
 * When to use:
 * Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be
 * typed faster than found (dates, codes), for `async` search against a server, and for multi-value
 * fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when
 * new values are legitimate (tags, invitees by email) and never when the value must exist (a
 * customer id). Use `filter: none` when the list is short but chips are wanted.
 *
 * Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use
 * it as a search box that navigates to results. Do not use it to pick a date. Do not disable
 * typing to get a Select; use Select.
 */
export declare const Combobox: ({ ref, label, name, options, value, defaultValue, inputValue, multiple, allowCustom, filter, placeholder, description, required, disabled, invalid, error, loading, clearable, container, overrides, onChange, onInputChange, onOpenChange, id: idProp, className, style, onFocus, onBlur, ...rest }: ComboboxProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Accordion.d.ts
/** One section. `content` is the panel body. */
type AccordionItem = {
  id: string;
  summary: string;
  content: ReactNode;
  disabled?: boolean | undefined;
};
/** Accepts the schema's string values and their numeric equivalents. */
type AccordionHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/**
 * Why a section's open state changed: `trigger` for a click or Enter/Space activation,
 * `exclusive` for a section closed because another opened, `controlled` for an externally set
 * `value`. `keyboard` is reserved by the schema but unreachable here — Disclosure's trigger is a
 * native button, so Enter/Space activation reaches this component as an ordinary click with no way
 * to tell it apart from a pointer click; see the gap note in the generation report.
 */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** Detail passed to `onOpenChange` for the one section whose state changed. */
interface AccordionOpenChangeDetail {
  id: string;
  open: boolean;
  reason: AccordionOpenChangeReason;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AccordionOverridableBinding = "divider" | "dividerWidth" | "itemGap" | "triggerPaddingBlock" | "fontFamily" | "triggerFontSize" | "triggerFontWeight";
interface AccordionProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange"> {
  /** The sections in order. `content` is the panel body (a slot per item on Lit). */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /**
   * Opening one section closes the others. Off by default: users usually want to compare, and
   * forced-closing is a common frustration.
   */
  exclusive?: boolean | undefined;
  /** Controlled open ids (array; a single id when `exclusive`). */
  value?: string | string[] | undefined;
  /** Initially open ids. */
  defaultValue?: string | string[] | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook, or the composed Disclosure/Divider's own override, to that token. */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the set of open sections changes, with the open ids. */
  onChange?: ((openIds: string[]) => void) | undefined;
  /**
   * Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a
   * panel's content, or scrolling the opened section into view; `onChange` remains the set-level
   * event for state.
   */
  onOpenChange?: ((detail: AccordionOpenChangeDetail) => void) | undefined;
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
export declare const Accordion: ({ ref, items, headingLevel, exclusive, value, defaultValue, divided, keepMounted, overrides, onChange, onOpenChange, className, style, ...rest }: AccordionProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Slider.d.ts
type SliderShowValue = "always" | "hover" | "never";
type SliderValue = number | [number, number];
/** One tick mark. Values snap to `step`; marks are decoration plus PageUp/PageDown stops. */
type SliderMark = {
  value: number;
  label?: string | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbBorderWidth" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "mark" | "markSize" | "markLabelSize" | "valueSize" | "labelWeight" | "partGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "errorText" | "disabledOpacity" | "transition";
interface SliderProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange"> {
  /** Visible label naming the quantity ("Volume", "Price range"). Also the accessible name. */
  label: string;
  /** Field name for the Form. A range contributes `[min, max]`. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Arrow-key increment and snapping granularity. */
  step?: number | undefined;
  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark). */
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
  /** Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it). */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. */
  marks?: SliderMark[] | undefined;
  /** Not adjustable, still readable. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or with keys (number or pair). */
  onChange?: ((value: SliderValue) => void) | undefined;
  /** Fired once when the interaction ends (pointer up, key released). Use for expensive effects. */
  onChangeEnd?: ((value: SliderValue) => void) | undefined;
}
/**
 * Slider — Design Schema, category: input.
 *
 * When to use:
 * Use a Slider for a bounded numeric value where approximate is fine and immediate feedback
 * matters, and where the scale has meaning across its whole width. Use `range` for "between"
 * filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it
 * with a NumberInput (`showValue: never`) when exact entry also matters.
 */
export declare const Slider: ({ ref, label, name, min, max, step, snapToMarks, required, invalid, value, defaultValue, range, formatValue, showValue, marks, disabled, description, error, overrides, onChange, onChangeEnd, id: idProp, className, style, ...rest }: SliderProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
type NumberInputSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type NumberInputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "affixGap" | "stepperGap" | "stepperDivider" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "minTargetSm" | "disabledOpacity";
interface NumberInputProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "min" | "max" | "step" | "required" | "size" | "disabled" | "onChange" | "onFocus" | "onBlur" | "onKeyDown" | "autoComplete" | "aria-describedby" | "aria-invalid" | "aria-required" | "children"> {
  /** Visible label. */
  label: string;
  /** Field name for the Form. The collected value is a number (or undefined when empty). */
  name: string;
  /** Controlled numeric value. Omit for an uncontrolled field. */
  value?: number | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons and arrow keys. Also the rounding granularity when `precision` is omitted. */
  step?: number | undefined;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value: thousands separators, currency symbol (`currency`), percent, or a unit (`unit`). The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as `trailingText`. */
  unit?: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. (Not
   * `prefix`: that name is a native Element member.) */
  leadingText?: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit`
   * is not a valid Intl unit. */
  trailingText?: string | undefined;
  /** Hide the increment/decrement buttons. Arrow keys work regardless. */
  hideSteppers?: boolean | undefined;
  /** Example value shown while empty. */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context
   * already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small
   * type. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChange?: ((value: number | undefined) => void) | undefined;
}
/**
 * NumberInput — Design Schema, category: input.
 *
 * When to use:
 * Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts.
 * Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a
 * `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys
 * and the out-of-range message. Pair with a Slider when a feel for the scale helps.
 */
export declare const NumberInput: ({ ref, label, name, value, defaultValue, min, max, step, precision, format, currency, unit, leadingText, trailingText, hideSteppers, placeholder, description, required, hideLabel, size, disabled, invalid, error, overrides, onChange, id: idProp, className, style, ...rest }: NumberInputProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/ProgressBar.d.ts
type ProgressBarTone = "neutral" | "success" | "danger";
type ProgressBarAnnounce = "none" | "milestones" | "complete";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "transition" | "indeterminateLoop";
interface ProgressBarProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role"> {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`. */
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
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`. */
  announce?: ProgressBarAnnounce | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ProgressBar — Design Schema, category: feedback.
 *
 * When to use:
 * Use a ProgressBar for a task the interface started and can see through to the end: uploads,
 * downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value`
 * whenever the total is known; use the indeterminate form only until the total is known, then
 * switch. Set `announce: milestones` for long tasks the user may leave and come back to;
 * `complete` (the default) is right for anything under a minute.
 */
export declare const ProgressBar: ({ ref, label, value, min, max, formatValue, showValue, hideLabel, tone, announce, overrides, id: idProp, className, style, ...rest }: ProgressBarProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Stepper.d.ts
type StepperStepStatus = "complete" | "current" | "upcoming" | "error";
type StepperStep = {
  id: string;
  label: string;
  description?: string | undefined;
  status?: StepperStepStatus | undefined;
};
type StepperOrientation = "horizontal" | "vertical";
type StepperNavigable = "none" | "completed" | "all";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorBorderWidth" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "connectorWidth" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "stepHover" | "stepRadius" | "stepGap" | "partGap" | "fontFamily" | "transition";
interface StepperProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label"> {
  /** The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
  steps: StepperStep[];
  /** The id of the current step. */
  current: string;
  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /**
   * Which steps are Buttons: none (display only), completed steps (the usual — you can go back,
   * not skip ahead), or all (a settings-style flow where order does not matter).
   */
  navigable?: StepperNavigable | undefined;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Automatic on
   * narrow viewports for horizontal steppers. Has no effect when `orientation` is `vertical`.
   */
  compact?: boolean | undefined;
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook, or the composed Text's own override, to that token. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
}
/**
 * Stepper — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen:
 * checkout, account setup, a report builder, a multi-part application. Vertical with descriptions
 * for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for
 * short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without
 * losing later ones (the container keeps the later steps' state).
 */
export declare const Stepper: ({ ref, steps, current, orientation, navigable, compact, label, overrides, onStepSelect, className, style, ...rest }: StepperProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Search.d.ts
type SearchSize = "md" | "lg";
/** One suggestion row: `value` is what fills the query and submits; `label` (plus optional `description`) is what the Listbox shows. */
interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SearchOverridableBinding = "borderFocus" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockLg" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "disabledOpacity";
interface SearchProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "size" | "value" | "defaultValue" | "placeholder" | "disabled" | "onChange" | "onSubmit" | "children" | "role" | "aria-describedby" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "autoComplete"> {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /** Field name; the query key when the form submits to a URL. */
  name?: string | undefined;
  /** Controlled query. */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /** URL to submit to with GET; when omitted, `onSubmit` handles it and nothing navigates. */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one fills the
   * query and submits. Provide them from `onChange` (debounced by the caller). With suggestions
   * the field becomes a Combobox: same keys, `aria-activedescendant`.
   */
  suggestions?: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /** Wrap in the `search` landmark role. Turn off when the Search sits inside another search landmark. */
  landmark?: boolean | undefined;
  /** lg for a search page's hero field. */
  size?: SearchSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Portal target for the suggestions popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every keystroke with the query; the caller fetches suggestions here. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the (trimmed) query. */
  onSubmit?: ((value: string) => void) | undefined;
  /** Fired when the clear button empties the field. */
  onClear?: (() => void) | undefined;
}
/**
 * Search — Design Schema, category: input.
 *
 * When to use:
 * Use Search for free-text search over a site, an app, or a large dataset: the header search, a
 * search page's main field, a "filter the list" field over more than a couple of dozen rows. Add
 * `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for
 * the one primary search so screen-reader users can jump to it.
 *
 * Do not use Search for a field that takes a specific value (an order number: Input), for choosing
 * from a known list (Select or Combobox), or for a filter that applies instantly to a short list
 * already on screen (an Input labelled "Filter" is honest about what it does). Do not put two
 * search landmarks on a page.
 */
export declare const Search: ({ ref, label, showLabel, name, value, defaultValue, placeholder, action, suggestions, loading, landmark, size, disabled, container, overrides, onChange, onSubmit, onClear, id: idProp, className, style, onFocus, onBlur, ...rest }: SearchProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/DatePicker.d.ts
type DatePickerRangeValue = {
  start: string;
  end: string;
};
type DatePickerValue = string | DatePickerRangeValue;
type DatePickerSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DatePickerOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "calendarInset" | "calendarGap" | "daySize" | "dayGap" | "dayRadius" | "dayHover" | "dayTodayBorderWidth" | "weekdaySize" | "weekdayWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "minTargetSm" | "disabledOpacity" | "transition";
interface DatePickerProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "min" | "max" | "required" | "disabled" | "size" | "onChange" | "onFocus" | "onBlur" | "children" | "aria-describedby" | "aria-invalid" | "aria-required"> {
  /** Visible label ("Start date", "Date of birth"). */
  label: string;
  /** Field name for the Form. The value is an ISO calendar date string, or `{ start, end }` for a range. */
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
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by keyboard movement. */
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
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Portal target for the calendar's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with undefined when cleared. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * DatePicker — Design Schema, category: input.
 *
 * When to use:
 * Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is
 * faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever
 * they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is
 * possible instead of validating after the fact.
 */
export declare const DatePicker: ({ ref, label, name, value, defaultValue, open: openProp, range, min, max, isDateDisabled, locale, showWeekNumbers, placeholder, description, required, hideLabel, size, disabled, error, container, overrides, onChange, onOpenChange, id: idProp, className, style, ...rest }: DatePickerProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Toolbar.d.ts
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarOverflow = "wrap" | "menu" | "scroll";
type ToolbarSize = "sm" | "md";
type ToolbarDensity = "compact" | "comfortable";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "itemGapCompact" | "groupGap" | "separatorLength" | "fadeWidth";
interface ToolbarGroupProps extends Omit<ComponentPropsWithoutRef<"div">, "role"> {
  /** Accessible name for the cluster, when it isn't obvious from its controls alone. Also becomes its heading if the group overflows into the "More" menu. */
  label?: string | undefined;
  /** The group's controls, in order. */
  children: ReactNode;
}
/** Groups related controls inside a Toolbar; a Divider is drawn automatically between adjacent groups. */
export declare const ToolbarGroup: ({ ref, label, children, className, ...rest }: ToolbarGroupProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
interface ToolbarProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-label" | "aria-orientation"> {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is
   * drawn between groups.
   */
  children: ReactNode;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: wrap onto more rows, collapse trailing controls into a
   * "More" Menu (each control must provide `overflowLabel`), or scroll horizontally with the edges
   * faded.
   */
  overflow?: ToolbarOverflow | undefined;
  /** Passed to the child controls that accept it. */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Toolbar — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Toolbar for controls that act on the same thing and are used together: text formatting, a
 * table's row actions, a map's view switches, a data page's filter–sort–export row. Group by
 * purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for
 * toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it
 * reads well as a menu item.
 */
export declare const Toolbar: ({ ref, label, children, orientation, overflow, size, density, overrides, className, style, ...rest }: ToolbarProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Carousel.d.ts
type CarouselPicker = "dots" | "tabs" | "none";
type CarouselChangeReason = "next" | "prev" | "picker" | "swipe" | "autoplay";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotTarget" | "radius" | "transition";
interface CarouselSlideProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Short name for this slide ("Plans", "Pricing"), shown as its tab text when `picker: tabs`.
   * Falls back to the slide's position when omitted.
   */
  label?: string | undefined;
  children: ReactNode;
}
/** One slide's content — a direct child of `Carousel`, one per slide, in the same order. */
export declare const CarouselSlide: ({ ref, label: _label, children, className, ...rest }: CarouselSlideProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
interface CarouselProps extends Omit<ComponentPropsWithoutRef<"section">, "children" | "aria-label" | "onChange" | "role"> {
  /** What the carousel shows ("Featured products", "Customer stories"). */
  label: string;
  /** One `CarouselSlide` per slide. A slide is any content; a Card is the usual shape. Slides should be equal height. */
  children: ReactNode;
  /**
   * How many slides are visible at once at the widest layout; fewer are shown as the viewport
   * narrows (one below the prose width).
   */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /**
   * Rotate automatically every `interval`. Starts only when the user has not asked for reduced
   * motion; stops on hover, focus, touch, or the play/pause button; never restarts on its own
   * after the user pauses it.
   */
  autoplay?: boolean | undefined;
  /** Milliseconds between automatic advances. Below 5000 is refused in development. */
  interval?: number | undefined;
  /**
   * How slides are chosen directly: small dot buttons, tabs with each slide's label (for few,
   * meaningful slides), or none (arrows only).
   */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping or scrolling snaps to slide boundaries. */
  snap?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the current slide changes, with the new index and the reason. */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
}
/**
 * Carousel — Design Schema, category: container.
 *
 * When to use:
 * Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid —
 * featured products with images, testimonials, a gallery — where paging is a reasonable way to
 * see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots`
 * for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even
 * then keep the pause control visible.
 */
export declare const Carousel: ({ ref, label, children, perView, loop, autoplay, interval, picker, activeIndex, snap, overrides, onChange, className, style, ...rest }: CarouselProps & {
  ref?: Ref<HTMLElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Table.d.ts
type TableCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
type TableSelectable = "none" | "single" | "multiple";
type TableResponsive = "stack" | "scroll";
type TableMaxHeight = "none" | "viewport";
type TableDensity = "compact" | "comfortable";
type TableSortDirection = "ascending" | "descending";
type TableColumnAlign = "start" | "end" | "center";
type TableColumnWidth = "auto" | "min" | "fill";
type TableColumnHideBelow = "prose" | "content";
/** A data row. `id` must be stable — selection and React keys use it. */
type TableRow = {
  id: string;
  [key: string]: unknown;
};
/** Controlled or initial sort state; the caller sorts `data` for the controlled form. */
interface TableSortState {
  column: string;
  direction: TableSortDirection;
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
  hideBelow?: TableColumnHideBelow | undefined;
  render?: ((row: TableRow) => ReactNode) | undefined;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellPaddingInlineCompact" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface TableProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** What the table lists ("Open invoices"). Rendered as the `<caption>` and the table's accessible name. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions in display order. Exactly one should set `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  sort?: TableSortState | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  defaultSort?: TableSortState | undefined;
  /** Adds a selection column: `single` (radio-like) or `multiple` (with select-all). */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below the prose width: `stack` turns rows into labelled blocks, `scroll` keeps columns and scrolls horizontally. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height and scrolls the body. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: comfortable or compact. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: the body shows `copy.loading` and `aria-busy` is set. Existing rows stay visible. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell for each row (Buttons or a Menu). */
  rowActions?: ((row: TableRow) => ReactNode) | undefined;
  /** Content below the table (pagination, a summary row). The schema names a `footer` anatomy part
   * without further contract; this is its React slot. */
  footer?: ReactNode;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TableSortState) => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated, with its id. Only when the row-header column has no custom `render`. */
  onRowPress?: ((id: string) => void) | undefined;
}
/**
 * Table — Design Schema, category: data.
 *
 * When to use:
 * Use a Table for a list of records with three or more comparable fields: orders, invoices,
 * members, inventory, results. Use `stack` (the default) when each row is a thing a person reads —
 * a person, an order — and `scroll` when the columns are what matters — figures across months, a
 * comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions
 * exist (put them in a Toolbar above the table that appears with the selection count). Put the
 * row's identity in the `isRowHeader` column, usually as a Link to its detail page.
 */
export declare const Table: ({ ref, caption, captionLevel, hideCaption, columns, data, sort, defaultSort, selectable, selected, defaultSelected, responsive, stickyHeader, maxHeight, density, striped, emptyMessage, loading, rowActions, footer, overrides, onSortChange, onSelectionChange, onRowPress, className, style, ...rest }: TableProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/DataGrid.d.ts
type DataGridSelectable = "none" | "row" | "cell" | "range";
type DataGridDensity = "compact" | "comfortable";
type DataGridHeight = "content" | "viewport" | "fixed";
type DataGridSortDirection = "ascending" | "descending";
type DataGridColumnAlign = "start" | "end" | "center";
type DataGridColumnPinned = "start" | "end";
type DataGridEditorKind = "text" | "number" | "select" | "date" | "checkbox";
/** A data row. `id` must be stable — selection, focus and React keys all use it. */
type DataGridRow = {
  id: string;
  [key: string]: unknown;
};
/** Controlled sort state; the grid sorts `data` itself when `rowCount` is not set. */
interface DataGridSortState {
  column: string;
  direction: DataGridSortDirection;
}
interface DataGridColumnOption {
  value: string;
  label: string;
}
/** One column definition, in display order. Exactly one column should set `isRowHeader`. */
interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  render?: ((row: DataGridRow) => ReactNode) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}
type DataGridCellRef = {
  rowId: string;
  column: string;
};
type DataGridRangeRef = {
  from: DataGridCellRef;
  to: DataGridCellRef;
};
type DataGridSelectionChangeDetail = string[] | DataGridCellRef | DataGridRangeRef;
interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}
interface DataGridRangeNeededDetail {
  start: number;
  end: number;
}
interface DataGridColumnResizeDetail {
  column: string;
  width: number;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHeight" | "rowHeightComfortable" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellFocusRingWidth" | "rangeBorderWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "resizeStep" | "statusBarSize" | "statusBarPadding" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface DataGridProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. Exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount;
   * `onRangeNeeded` asks for more. */
  rowCount?: number | undefined;
  /** Controlled sort state. */
  sort?: DataGridSortState | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSortState | undefined;
  /** `row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects one cell; `range`
   * allows Shift+arrow / drag rectangles (copy as TSV). Selection is separate from focus. */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized. */
  stickyHeader?: boolean | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for editors that open a popup (Select, DatePicker). Defaults to `document.body`.
   * Not part of the schema; added so those composed editors can be portaled per their own contract. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: DataGridSortState) => void) | undefined;
  /** Fired with the selection: row ids, one cell, or a range. */
  onSelectionChange?: ((selection: DataGridSelectionChangeDetail) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((detail: DataGridCellChangeDetail) => void) | undefined;
  /** Fired when an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((detail: DataGridEditStartDetail) => boolean | void) | undefined;
  /** Fired when the visible window approaches the end of `data` and `rowCount` says there is more. */
  onRangeNeeded?: ((range: DataGridRangeNeededDetail) => void) | undefined;
  /** Fired with the new width when the user finishes dragging a resizable column edge. */
  onColumnResize?: ((detail: DataGridColumnResizeDetail) => void) | undefined;
}
/**
 * DataGrid — Design Schema, category: data.
 *
 * When to use:
 * Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll
 * through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin
 * views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and
 * mark the columns that may change; give every editable column a `validate`. Use `height: viewport`
 * (the default) so the grid, not the page, scrolls.
 */
export declare const DataGrid: ({ ref, caption, hideCaption, columns, data, rowCount, sort, defaultSort, selectable, selected, editable, density, stickyHeader, height, loading, emptyMessage, showStatusBar, container, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onRangeNeeded, onColumnResize, className, style, ...rest }: DataGridProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/TreeGrid.d.ts
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
type TreeGridSortDirection = "ascending" | "descending";
/** A row's children: a loaded subtree, `"lazy"` (loaded on first expand through `onExpand`), or
 * absent (a leaf). */
type TreeGridChildren = TreeGridRow[] | "lazy";
/** A nested row. `id` must be stable — expansion, selection and React keys all use it. */
interface TreeGridRow {
  id: string;
  children?: TreeGridChildren | undefined;
  [key: string]: unknown;
}
/** Controlled sort state. Sorting orders siblings within each level; hierarchy is kept. */
interface TreeGridSortState {
  column: string;
  direction: TreeGridSortDirection;
}
/** One cell, referenced by row id and column key. */
interface TreeGridCellRef {
  rowId: string;
  column: string;
}
type TreeGridSelectionChangeDetail = string[] | TreeGridCellRef;
interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TreeGridOverridableBinding = "indent" | "expandButtonSize" | "expandGap" | "guideLine" | "guideLineWidth" | "parentWeight" | "transition";
interface TreeGridProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. The `isRowHeader` column is required: it carries the indent and expand button,
   * and must come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row loaded on first expand through `onExpand`. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded row. */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort state. Sorting orders siblings within each level; hierarchy is kept. */
  sort?: TreeGridSortState | undefined;
  /** `row` adds a checkbox column; `cell` selects one cell. `row` selection of a parent does not
   * select its descendants unless `selectChildren`. */
  selectable?: TreeGridSelectable | undefined;
  /** Selecting a parent row selects its descendants; the parent shows indeterminate when only some
   * are selected. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: TreeGridDensity | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: TreeGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** A footer line with row count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for editors that open a popup (Select, DatePicker). Defaults to `document.body`.
   * Not part of the schema; added so those composed editors can be portaled per their own contract. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids. */
  onExpandChange?: ((expanded: string[]) => void) | undefined;
  /** Fired when a `children: "lazy"` row is expanded for the first time, with its id; the caller
   * loads and replaces `children`. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TreeGridSortState) => void) | undefined;
  /** Fired with the selection: row ids, or one cell. */
  onSelectionChange?: ((selection: TreeGridSelectionChangeDetail) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((detail: TreeGridCellChangeDetail) => void) | undefined;
}
/**
 * TreeGrid — Design Schema, category: data.
 *
 * When to use:
 * Use a TreeGrid when records nest and each record has several comparable fields: a chart of
 * accounts with balances, folders and files with sizes and dates, a bill of materials with
 * quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large
 * trees so the first paint is fast. Use `selectChildren` when selection means "this and everything
 * in it" (a folder to export).
 */
export declare const TreeGrid: ({ ref, caption, hideCaption, columns, data, expanded, defaultExpanded, sort, selectable, selectChildren, editable, density, height, loading, showStatusBar, container, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, className, style, ...rest }: TreeGridProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Tree.d.ts
type TreeSelectable = "none" | "single" | "multiple";
/** Heading level of the visible label. Accepts the schema's string values and their numeric equivalents. */
type TreeHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A node's children: a loaded subtree, `"lazy"` (loaded on first expand through `onExpand`), or absent (a leaf). */
type TreeNodeChildren = TreeNode[] | "lazy";
/** One item in the hierarchy. `id` must be stable — expansion, selection and React keys all use it. */
interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNodeChildren | undefined;
}
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `headingSize` and `badgeSize` are forwarded to the composed `Heading` and badge
 * `Text`'s own `overrides` (as `fontSize`), and `labelSelectedWeight` to the label `Text`'s own
 * `overrides` (as `fontWeight`), since those components already own those bindings.
 */
type TreeOverridableBinding = "indent" | "rowHeight" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "rowSelectedBorderWidth" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "expandButtonSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
interface TreeProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  label: string;
  /** Show the label as a heading above the tree. */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /** The hierarchy. `href` makes a node a Link (navigation trees); `badge` is a short trailing count
   * or status; `children: "lazy"` loads on first expand through `onExpand`. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[] | undefined;
  /** Initially expanded ids; `["*"]` for all. */
  defaultExpanded?: string[] | undefined;
  /** `single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like
   * selection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when
   * `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  selectChildren?: boolean | undefined;
  /** With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).
   * Off by default: focus moves, Enter or Space selects. */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the selected ids. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Fired with the expanded ids. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired when a lazy node is expanded for the first time, with its id. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with
   * `href` navigate instead. */
  onActivate?: ((id: string) => void) | undefined;
}
/**
 * Tree — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product
 * categories, an org's departments. `single` selection with `href` nodes is a navigation tree;
 * `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only
 * when the tree drives a panel beside it and moving through nodes should preview them.
 */
export declare const Tree: ({ ref, label, showLabel, headingLevel, nodes, expanded, defaultExpanded, selectable, selected, defaultSelected, selectChildren, selectOnFocus, showGuides, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, className, style, ...rest }: TreeProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Splitter.d.ts
type SplitterOrientation = "horizontal" | "vertical";
type SplitterStackBelow = "prose" | "content" | "never";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "collapseButtonOffset" | "paneMinTarget" | "transition";
interface SplitterProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. */
  primary: ReactNode;
  /** The second pane, which takes the remaining space. */
  secondary: ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. Below this the pane collapses instead, when `collapsible`. */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key increment, percent. */
  step?: number | undefined;
  /**
   * The primary pane can collapse to nothing: drag past the minimum, press Enter on the
   * separator, or use the collapse button. Enter again restores the last size.
   */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** When set, the size is remembered per user under this key (localStorage) so a sidebar stays where it was left. */
  persistKey?: string | undefined;
  /**
   * Below this layout width a horizontal splitter stacks its panes and the separator becomes
   * inert (a phone has no room for two panes side by side).
   */
  stackBelow?: SplitterStackBelow | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each key press, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired once when a drag ends, with the final size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}
/**
 * Splitter — Design Schema, category: layout.
 *
 * When to use:
 * Use a Splitter when two regions compete for space and the right split depends on the task: a
 * navigation tree beside content, a list beside a detail view, a code editor beside its output, a
 * map beside results. Make the primary pane the one whose size matters (the sidebar), set
 * sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for
 * sidebars.
 */
export declare const Splitter: ({ ref, label, orientation, primary, secondary, size, defaultSize, minSize, maxSize, step, collapsible, collapsed, persistKey, stackBelow, overrides, onSizeChange, onSizeChangeEnd, onCollapseChange, id: idProp, className, style, onKeyDown, ...rest }: SplitterProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
//#region src/Feed.d.ts
/** The schema declares the values as strings; numbers are accepted for ergonomics. */
type FeedHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** One article. `heading` names it (a Heading inside the article's Card); `timestamp` is ISO and
 * rendered relative, with the absolute time as its title; `unread` marks items not yet seen. */
interface FeedItem {
  id: string;
  heading: string;
  timestamp: string;
  content: ReactNode;
  actions?: ReactNode;
  unread?: boolean | undefined;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FeedOverridableBinding = "itemGap" | "articleInset" | "unreadBorderWidth" | "timestampSize" | "newItemsOffset" | "loadingInset" | "endMessageInset" | "endMessageSize" | "fontFamily";
interface FeedProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-label" | "aria-busy"> {
  /** What the feed contains ("Activity", "Notifications"). */
  label: string;
  /** Articles, newest first. */
  items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches. */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  loading?: boolean | undefined;
  /**
   * Number of newer items available above (from polling or a socket). The feed does not insert
   * them — that would shift what the reader is looking at — it shows a "Show {count} new" button
   * at the top which prepends and scrolls.
   */
  newItemsCount?: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
  endMessage?: string | undefined;
  /** Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore`). */
  onLoadMore?: (() => void) | undefined;
  /** Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: (() => void) | undefined;
  /** Fired with an item id when it has been substantially visible for a moment (mark as read). */
  onItemVisible?: ((id: string) => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Feed — Design Schema, category: container.
 *
 * When to use:
 * Use a Feed for a stream of similar, time-ordered items whose total is unknown or large:
 * activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a
 * time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the
 * reader is looking; use `onItemVisible` to mark things read.
 */
export declare const Feed: ({ ref, label, items, hasMore, loading, newItemsCount, headingLevel, endMessage, onLoadMore, onShowNew, onItemVisible, overrides, className, style, ...rest }: FeedProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
export type { AccordionHeadingLevel, AccordionItem, AccordionOpenChangeDetail, AccordionOpenChangeReason, AccordionOverridableBinding, AccordionProps, ActionSheetAction, ActionSheetActionTone, ActionSheetCloseReason, ActionSheetOverridableBinding, ActionSheetProps, AlertDialogCancelReason, AlertDialogOverridableBinding, AlertDialogProps, AlertDialogTone, AlertLive, AlertOverridableBinding, AlertProps, AlertTone, BottomSheetCloseReason, BottomSheetHeight, BottomSheetOverridableBinding, BottomSheetProps, BoxElement, BoxInset, BoxOverridableBinding, BoxProps, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbOverridableBinding, BreadcrumbProps, ButtonOverridableBinding, ButtonProps, ButtonSize, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardProps, CardSurface, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CarouselProps, CarouselSlideProps, CheckboxOverridableBinding, CheckboxProps, ComboboxFilter, ComboboxOverridableBinding, ComboboxProps, ComboboxValue, ContainerAlign, ContainerElement, ContainerGutter, ContainerOverridableBinding, ContainerProps, ContainerWidth, DataGridCellChangeDetail, DataGridCellRef, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridColumnResizeDetail, DataGridDensity, DataGridEditStartDetail, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridProps, DataGridRangeNeededDetail, DataGridRangeRef, DataGridRow, DataGridSelectable, DataGridSelectionChangeDetail, DataGridSortDirection, DataGridSortState, DatePickerOverridableBinding, DatePickerProps, DatePickerRangeValue, DatePickerValue, DialogCloseReason, DialogInitialFocus, DialogOverridableBinding, DialogProps, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureProps, DisclosureToggleReason, DividerOrientation, DividerOverridableBinding, DividerProps, DividerSpacing, FeedHeadingLevel, FeedItem, FeedOverridableBinding, FeedProps, FieldsetGap, FieldsetOverridableBinding, FieldsetProps, FocusScopeAutoFocus, FocusScopeEscapeDirection, FocusScopeProps, FormContextValue, FormErrors, FormFieldRegistration, FormFieldValue, FormOverridableBinding, FormProps, FormValidateMode, FormValues, HeadingAlign, HeadingLevel, HeadingOverridableBinding, HeadingProps, HeadingSize, IconName, IconOverridableBinding, IconProps, IconSize, InputOverridableBinding, InputProps, InputSize, InputType, LandmarkElement, LandmarkProps, LandmarkRole, LinkOverridableBinding, LinkProps, LinkTone, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxProps, ListboxValue, MenuAction, MenuGroup, MenuItem, MenuItemTone, MenuOverridableBinding, MenuPlacement, MenuProps, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterProps, MeterTone, NumberInputFormat, NumberInputOverridableBinding, NumberInputProps, NumberInputSize, PopoverHeadingLevel, PopoverOpenChangeReason, PopoverOverridableBinding, PopoverPlacement, PopoverProps, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarProps, ProgressBarTone, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, RadioGroupProps, SearchOverridableBinding, SearchProps, SearchSize, SearchSuggestion, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlProps, SegmentedControlSize, SelectNative, SelectOverridableBinding, SelectProps, SelectSize, SelectValue, SidePanelOpenChangeReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelProps, SidePanelRole, SidePanelSide, SidePanelWidth, SliderMark, SliderOverridableBinding, SliderProps, SliderShowValue, SliderValue, SplitterOrientation, SplitterOverridableBinding, SplitterProps, SplitterStackBelow, StackAlign, StackDirection, StackElement, StackGap, StackJustify, StackOverridableBinding, StackProps, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperProps, StepperStep, StepperStepStatus, SwitchLabelPosition, SwitchOverridableBinding, SwitchProps, TabPanelProps, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnHideBelow, TableColumnWidth, TableDensity, TableMaxHeight, TableOverridableBinding, TableProps, TableResponsive, TableRow, TableSelectable, TableSortDirection, TableSortState, TabsActivation, TabsFit, TabsItem, TabsOrientation, TabsOverridableBinding, TabsProps, TextAlign, TextElement, TextOverridableBinding, TextProps, TextSize, TextTone, TextWeight, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastProps, ToastRegionOverridableBinding, ToastRegionProps, ToastTone, ToolbarDensity, ToolbarGroupProps, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarProps, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TooltipProps, TreeGridCellChangeDetail, TreeGridCellRef, TreeGridChildren, TreeGridDensity, TreeGridHeight, TreeGridOverridableBinding, TreeGridProps, TreeGridRow, TreeGridSelectable, TreeGridSelectionChangeDetail, TreeGridSortDirection, TreeGridSortState, TreeHeadingLevel, TreeNode, TreeNodeChildren, TreeOverridableBinding, TreeProps, TreeSelectable };
//# sourceMappingURL=index.d.ts.map