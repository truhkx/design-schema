import { ComponentPropsWithoutRef, Context, HTMLAttributes, MouseEvent, ReactElement, ReactNode, Ref, RefObject } from "react";
import { TokenRef } from "@design-schema/tokens";
//#region src/Button.d.ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ButtonOverridableBinding = "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "inverseBackgroundHover" | "inverseHoverOpacity" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerSize";
interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "disabled" | "children" | "aria-label" | "onClick" | "className" | "style"> {
  /** The button's text. Also its accessible name. */
  label: string;
  /**
   * Visual emphasis. One primary button per view. These four are the whole set: there is no
   * `outline` variant, and a bordered low-fill emphasis would be a new value here with its own
   * colour pair and its own contrast proof, never an alias for `secondary`.
   */
  variant?: ButtonVariant | undefined;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: ReactNode | undefined;
  /** Icon after the label. Decorative, like leadingIcon. */
  trailingIcon?: ReactNode | undefined;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType | undefined;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure): aria-expanded
   * on web. Consumers rarely set it directly. No default, and tri-state: undefined means the button
   * discloses nothing, so no expanded state is reported at all — though an `aria-expanded` arriving
   * through `...rest` still applies.
   */
  expanded?: boolean | undefined;
  /**
   * Prevents activation. The button stays in the tab order and is announced as disabled. A press
   * blocked by `disabled` or `loading` is not a press: onPress does not fire and nothing chained from
   * it (an extension's tracking) runs. Inside a disabled Form the button is disabled whatever this
   * prop says.
   */
  disabled?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort by Amount,
   * ascending" on a header that shows "Amount"). The name must contain the visible label (WCAG 2.5.3
   * label-in-name); starting with it is preferred but not required. Maps to aria-label.
   */
  accessibleName?: string | undefined;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow Menu. Only Buttons
   * collapse; other controls stay visible. Button itself never renders it: Toolbar reads it from the
   * Button element's props (it never reaches the DOM).
   */
  overflowLabel?: string | undefined;
  /**
   * Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not rendered either.
   * `label` is still required and becomes the accessible name. Padding becomes equal on all sides
   * (`space.sm`).
   */
  iconOnly?: boolean | undefined;
  /**
   * Shows a ring spinner (spinnerSize across, spinnerStroke thick, in `currentColor`) in the leading
   * icon slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the sole glyph), hides
   * `trailingIcon`, keeps the label visible and the layout unchanged, and blocks repeat activation
   * while an action is pending. `copy.loading` is announced as a description, never as part of the
   * name.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses
   * color.inverse.link and hover uses inverseBackgroundHover at inverseHoverOpacity over the surface;
   * the focus ring uses color.inverse.focus for every variant while `inverse` is true, since the ring
   * must read against the inverse surface. Only `ghost` changes its fill on inverse surfaces; other
   * variants keep their own fills.
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
export declare function Button({ ref, label, variant, size, leadingIcon, trailingIcon, type, expanded, disabled, accessibleName, overflowLabel: _overflowLabel, iconOnly, loading, inverse, track, overrides, onClick, onTrack, "aria-expanded": ariaExpanded, "aria-describedby": describedBy, ...props }: ButtonProps & {
  ref?: Ref<HTMLButtonElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
type TextElement = "p" | "span";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `color` is locked: every tone is contrast-checked against the page background, so it
 * is not overridable and is ignored if passed.
 */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
interface TextProps extends Omit<ComponentPropsWithoutRef<"p">, "children"> {
  /** The text content. Inline formatting (emphasis, links) is allowed; block elements are not. */
  children: ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /**
   * Semantic color. `onAction` is only for text placed on an action background, and its story paints
   * that background (color.action.primary.background) behind the Text. There is no `inverse` tone: the
   * shared foreground vocabulary has no such name, so an inverse surface re-scopes `--color-foreground`
   * on its own container, which the `default` tone resolves through.
   */
  tone?: TextTone | undefined;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /**
   * Clip to one line with an ellipsis. The full text is exposed via `title` when children is a plain
   * string; otherwise the consumer passes `title`. A consumer `title` always wins and is forwarded
   * unchanged, with or without `truncate`; `title={undefined}` counts as not passed. With `element: span` the clipped box is
   * `display: inline-block; max-inline-size: 100%`, so the width comes from the parent.
   */
  truncate?: boolean | undefined;
  /** The HTML element to render — `p` for a block, `span` for inline. Labels and legends are native elements rendered by Input and Fieldset, which own the association; Text never renders one. */
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
export declare function Text({ ref, children, size, weight, tone, align, truncate, element, overrides, title, className, style, ...rest }: TextProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Heading.d.ts
/** Position in the document outline: the schema's canonical string values. The `level` prop also accepts the number. */
type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";
/** Visual size: the large end of the shared size vocabulary (Text takes the small end). */
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md";
/** Style bindings that can be overridden per instance; the locked `color` binding is not in this list. */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
interface HeadingProps extends Omit<ComponentPropsWithoutRef<"h1">, "children" | "className" | "style"> {
  /**
   * Position in the document outline. Controls the semantic element, not the visual size.
   * Canonical values are strings; the number is accepted too. A missing, out-of-range or
   * non-numeric level is treated as `2` (an <h2> at the 3xl default size) with one development
   * warning per element for its lifetime.
   */
  level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Visual size, independent of level. There is no single default; the default is read from
   * `level` by this exact map — 1 → 4xl, 2 → 3xl, 3 → 2xl, 4 → xl, 5 → lg, 6 → md — and an
   * explicit `size` always wins over it. Web exposes no size attribute, only the
   * `ds-heading--size-*` modifier class, which carries the resolved size.
   */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: ReactNode;
  /**
   * Horizontal text alignment. It has no style binding on purpose — alignment is a layout choice,
   * not a themed value — so it maps straight to text-align. `start` and `end` are logical. The
   * value set is Text's, so the type is Text's `TextAlign`.
   */
  align?: TextAlign | undefined;
  /** Per-instance style overrides: each entry sets the matching `--ds-heading-*` hook to that token, inline. */
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
export declare function Heading({ ref, level, size, children, align, overrides, ...rest }: HeadingProps & {
  ref?: Ref<HTMLHeadingElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type InputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "disabledOpacity" | "transition";
interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "size" | "disabled" | "onChange" | "onFocus" | "onBlur" | "autoComplete" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-disabled" | "className" | "style" | "children"> {
  /** Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder. */
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
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
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
  /** Fired on every value change with the new string value, and nothing else (not the ChangeEvent). */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. Called with no arguments. */
  onFocus?: (() => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. Called with no arguments. */
  onBlur?: (() => void) | undefined;
}
/**
 * Input — Design Schema, category: input. Collects a single line of text, bundling the label,
 * helper text, field and error message so their association is always correct.
 *
 * When to use:
 * Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type`
 * for the value so touch keyboards and browser validation match. Provide `description` when the
 * format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the
 * value is personal data so browsers and assistive tools can fill it.
 *
 * The forwarded `ref` targets the `<input>` (so `focus()` and `select()` work), not the wrapper.
 */
export declare function Input({ ref, label, name, value, defaultValue, placeholder, description, type, required, hideLabel, size, disabled, invalid, error, autocomplete, overrides, onChange, onFocus, onBlur, readOnly, id: idProp, ...props }: InputProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}): ReactElement;
//#endregion
//#region src/FormContext.d.ts
/** When field-level validation runs. Mirrors the Form `validate` prop. */
type FormValidateMode = "submit" | "blur" | "change";
/**
 * What a field contributes to the collected values. Input and RadioGroup contribute a string,
 * Switch a boolean, Checkbox its `value` when checked, NumberInput and Slider a number,
 * multi-select Listbox, Select and Combobox a string array, a range Slider or DatePicker a pair;
 * `undefined` (unchecked, unselected, empty) is omitted.
 */
type FormFieldValue = string | number | boolean | string[] | [number, number] | undefined;
/**
 * What a field registers with its enclosing Form so the Form can collect values, run validation,
 * and move focus without reaching into the DOM.
 */
interface FormFieldRegistration {
  /** Field name; the key used in `onSubmit(values)` and `onInvalid(errors)`. */
  name: string;
  /** DOM id of the field, used by the error summary links. */
  id: string;
  /** Visible label; the error summary shows it when the field is invalid with an empty message. */
  label: string;
  /** Current value read from the field. `undefined` leaves the field out of the submitted values. */
  getValue(): FormFieldValue;
  /** Disabled fields are skipped by validation and omitted from values and from `order`. */
  isDisabled(): boolean;
  /** Returns an error message, or `null` when the field is valid. */
  validate(): string | null;
  /** Moves keyboard focus to the field. */
  focus(): void;
}
interface FormContextValue {
  /** `true` while the Form is disabled; every field and action reflects it. */
  disabled: boolean;
  /**
   * The Form's `validate` mode. A field validates on blur when this is `blur` or `submitFailed` is
   * true, and on change when this is `change` or `submitFailed` is true.
   */
  validateMode: FormValidateMode;
  /** `true` after a failed submission, until a successful one resets it. */
  submitFailed: boolean;
  /**
   * `true` while the Form renders an error summary, so a field can stay silent about its own error
   * while the Form announces every one of them.
   */
  errorSummary: boolean;
  /** Same as `validateMode`; read by fields generated before `submitFailed` existed. */
  validate: FormValidateMode;
  /** Base for generated ids: the Form's `name`, or a generated unique id when it has none. */
  idBase: string | undefined;
  /** Errors currently held by the Form, keyed by field name. */
  errors: Readonly<Record<string, string>>;
  /**
   * Enabled registered fields in document order, by name — what gives a field its "next" key.
   * Web submits with Enter natively, so this is read at call time rather than tracked in state:
   * it reflects the fields registered now, not a value a field can re-render on.
   */
  order(): readonly string[];
  /** Registers a field; returns the matching unregister function. */
  register(field: FormFieldRegistration): () => void;
  /** Re-runs validation for one field and updates `errors`. */
  validateField(name: string): void;
  /**
   * Validates every enabled field, updates `errors`, and reports a failure the way a failed submit
   * does — `onInvalid`, then focus to the summary or to the first invalid field. Returns `true` when
   * every field is valid. A disabled Form has no enabled fields, so it reports valid and fires nothing.
   */
  reportValidity(): boolean;
}
export declare const FormContext: Context<FormContextValue | null>;
/** Returns the enclosing Form's context, or `null` outside a Form. */
export declare function useFormContext(): FormContextValue | null;
//#endregion
//#region src/Form.d.ts
/**
 * Collected values keyed by field `name`: Input and RadioGroup contribute strings, Switch a boolean,
 * Checkbox its `value` when checked, NumberInput and Slider a number, multi-select Listbox, Select and
 * Combobox a string array, a range Slider or DatePicker a pair. Empty, unchecked, unselected and
 * disabled fields contribute no key.
 */
type FormValues = Record<string, string | number | boolean | string[] | [number, number]>;
/** Error messages keyed by field `name`. */
type FormErrors = Record<string, string>;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FormOverridableBinding = "gap" | "errorSummaryBorder" | "errorSummaryBorderWidth" | "errorSummaryRadius" | "errorSummaryPadding" | "errorSummaryGap";
interface FormProps extends Omit<ComponentPropsWithoutRef<"form">, "children" | "name" | "onSubmit" | "onInvalid" | "noValidate" | "action" | "aria-label" | "aria-labelledby" | "aria-disabled" | "style" | "className"> {
  /** Fields (Input etc.) and layout (Stack). The action row goes in `actions`. */
  children: ReactNode;
  /** The action row: at least one Button with `type: submit`, primary first (Form's action-order rule). Rendered after the fields with the form gap. A single action renders bare; two or more go in a horizontal Stack the consumer supplies. */
  actions: ReactNode;
  /** Identifier for the form, used for analytics and as the base of generated ids. An unnamed form bases its ids on a generated unique id; two forms given the same `name` on one page is an authoring error Form does not detect. */
  name?: string | undefined;
  /** Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set. Nothing enforces this at runtime and no dev warning is emitted. */
  label?: string | undefined;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  labelledBy?: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. `change` validates on change only; after a failed submission every mode re-validates on blur and change, until a successful submission resets that state. */
  validate?: FormValidateMode | undefined;
  /** Disables every field and action inside. Use while submitting. Each field and action dims itself with its own disabled style; the Form container applies no opacity of its own and puts no disabled attribute on the form element. */
  disabled?: boolean | undefined;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. Each item's text is the field's own message verbatim; a field invalid with an empty message shows its `label` instead, and its `name` when the label is empty too. */
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
export declare function Form({ ref, children, actions, name, label, labelledBy, validate, disabled, errorSummary, overrides, onSubmit, onInvalid, ...rest }: FormProps & {
  ref?: Ref<HTMLFormElement> | undefined;
}): ReactElement;
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
  /**
   * Any components. Stack does not style its children; it only positions them. Null and boolean
   * children are skipped, as the platform skips them. With `element` `ul`/`ol` each child gets one
   * `li`, as React counts children: a fragment is one child, so pass an array.
   */
  children: ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /**
   * Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing scale: tight
   * for related controls, normal for fields in a form, loose for groups, section between page sections.
   * The only way to set spacing between siblings.
   */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /**
   * Main-axis distribution. It only shows where the main axis is larger than the content — a vertical
   * Stack needs a bounded height for it to mean anything, and Stack has no size of its own, so that is
   * the caller's to give. The four values are the whole set: `around` and `evenly` are deliberately left out.
   */
  justify?: StackJustify | undefined;
  /**
   * Allow horizontal stacks to wrap onto new lines instead of overflowing. It is set whatever the
   * direction — on a column it is inert unless the block size is bounded.
   */
  wrap?: boolean | undefined;
  /**
   * Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an
   * `li` that is `display: contents`, so the children stay the flex items and the gap is unchanged. One
   * `li` per child as React counts children: a fragment holding two elements is one child, so pass an array;
   * null and boolean children get no `li`. The wrapper carries `role="listitem"` and the list `role="list"`,
   * because dropping `list-style` removes list semantics in some browsers. The list role wins over a
   * consumer `role` on `ul`/`ol`; on the other elements a consumer `role` passes through.
   */
  element?: StackElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Stack — Design Schema, category: layout.
 *
 * When to use:
 * Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a
 * list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element`
 * when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is
 * exposed to assistive technology.
 */
export declare function Stack({ ref, children, direction, gap, align, justify, wrap, element, overrides, className, style, ...rest }: StackProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
type BoxElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `background` is locked: the surface colours are the pairs the contrast gate checks.
 * It keeps its `--ds-box-background` hook for the consumer's own CSS.
 */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "border" | "borderWidth" | "radius";
interface BoxProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /**
   * Vertical padding, overriding `inset` on that axis. It has no default: unset means `inset`
   * applies, which keeps an explicit `none` distinct from an absent value.
   */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies, as with insetBlock. */
  insetInline?: BoxInset | undefined;
  /** Background. `none` is transparent; `default` is the page background (use to lift content off a subtle parent); `subtle` and `strong` step up. */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /**
   * Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark
   * for page regions. There is no native counterpart, so a screen that ports to React Native uses
   * Landmark for the region instead of this prop.
   */
  element?: BoxElement | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.
   * Overrides change values, never presence: `border` and `borderWidth` are no-ops without
   * `border`, and `radius` is a no-op at `radius: none`. Padding applies at every value.
   */
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
 *
 * Box adds no role of its own; when `element` is a sectioning element the native element carries
 * the semantics (`nav` → navigation, `article` → article). It never scrolls, never clips and never
 * carries margin.
 */
export declare function Box({ ref, children, inset, insetBlock, insetInline, surface, border, radius, element, overrides, className, style, ...rest }: BoxProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Link.d.ts
/** `default` uses the link colors; `inherit` takes the surrounding text color. */
type LinkTone = "default" | "inherit";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type LinkOverridableBinding = "underlineThickness" | "underlineOffset" | "externalIconGap" | "transition";
interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "target" | "rel" | "download" | "aria-label" | "onClick" | "style" | "className"> {
  /** The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Opens the destination in a new tab or the system browser and appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon. */
  external?: boolean | undefined;
  /**
   * `default` uses the link colors. `inherit` takes the surrounding text color and relies on the
   * underline alone — for links inside muted or on-action text. Under `inherit` the color,
   * colorHover and colorVisited bindings are not applied: rest, hover and visited all resolve to
   * the inherited color, and the underline and the external icon follow it.
   */
  tone?: LinkTone | undefined;
  /** Downloads the resource instead of navigating, under the server's file name (a custom file name is out of scope). Web only. */
  download?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * onPress — fired when the link is activated. The default navigation still happens unless the
   * consumer prevents it: call `preventDefault()` on the event or return `false`.
   */
  onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void | boolean) | undefined;
}
/**
 * Link — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an
 * external site, or to a downloadable file. Use it inline inside body text (it renders inline by
 * default) and standalone in navigation lists. Use `external` whenever the destination leaves the
 * product, so people are warned before they lose their place.
 */
export declare function Link({ ref, href, label, external, tone, download, overrides, onClick, ...rest }: LinkProps & {
  ref?: Ref<HTMLAnchorElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Checkbox.d.ts
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "checked" | "defaultChecked" | "required" | "disabled" | "onChange" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-checked" | "aria-disabled" | "className" | "style" | "children"> {
  /** Visible label. Clicking or tapping it toggles the control. */
  label: string;
  /**
   * Visually hide the label (it remains the accessible name): a selection column in a Table, where
   * the row name is the label.
   */
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /**
   * What a native HTML <form> submits under `name` when checked (web and Lit only). The enclosing Form
   * (React, React Native, ds-form) ignores it and collects the boolean `checked`. Checkboxes sharing a
   * `name` are not a multi-select under Form; give each its own name.
   */
  value?: string | undefined;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /**
   * Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and
   * announced only; the submitted value still follows `checked`.
   */
  indeterminate?: boolean | undefined;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /**
   * Marks the control as failing validation. Usually set by the Form; can be set directly. While true
   * with no `error` (and no Form message), the error slot renders copy.required (required and
   * unchecked) or copy.invalid, with role=alert, so a bare `invalid` always shows a message.
   */
  invalid?: boolean | undefined;
  /** Persistent helper text below the label. */
  description?: string | undefined;
  /**
   * The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to
   * continue").
   */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: ((checked: boolean) => void) | undefined;
}
/**
 * Checkbox — Design Schema, category: input.
 *
 * When to use:
 * Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several, each with its own `name`, when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.
 */
export declare function Checkbox({ ref, label, hideLabel, name, value, checked, defaultChecked, indeterminate, disabled, required, invalid, description, error, overrides, onChange, onClick, id: idProp, ...rest }: CheckboxProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Switch.d.ts
/** Where the label sits relative to the track. */
type SwitchLabelPosition = "start" | "end";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SwitchOverridableBinding = "trackWidth" | "trackHeight" | "thumbSize" | "thumbInset" | "radius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface SwitchProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "role" | "name" | "value" | "checked" | "defaultChecked" | "disabled" | "onChange" | "aria-describedby" | "aria-checked" | "aria-disabled" | "className" | "style" | "children"> {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /**
   * Optional field name. When inside a Form the state is collected as a boolean on every platform;
   * most switches are not in forms. Without `name` a Switch inside a Form does not register (it
   * contributes no key) and its id comes from `useId()`, not the Form's idBase. A Switch never
   * validates and never appears in an error summary.
   */
  name?: string | undefined;
  /**
   * Controlled state: a controlled switch shows a new state only once this prop changes. Omit for an
   * uncontrolled control.
   */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /**
   * Cannot be toggled. Stays visible, readable and focusable. A disabled switch contributes no key
   * to the Form's values: it unregisters while disabled and registers again when re-enabled.
   */
  disabled?: boolean | undefined;
  /** Persistent helper text below the label explaining the effect. */
  description?: string | undefined;
  /**
   * Where the label sits relative to the track. `start` (label, then switch at the row end) is the
   * settings-list convention; `end` matches Checkbox.
   */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the user changes the state, with the new boolean. The change is already in effect;
   * there is nothing to submit. A controlled prop change fires nothing, and nothing fires on mount.
   */
  onChange?: ((checked: boolean) => void) | undefined;
}
/**
 * Switch — Design Schema, category: input.
 *
 * When to use:
 * Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.
 */
export declare function Switch({ ref, label, name, checked, defaultChecked, disabled, description, labelPosition, overrides, onChange, onClick, id: idProp, ...rest }: SwitchProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}): ReactElement;
//#endregion
//#region src/RadioGroup.d.ts
type RadioGroupOrientation = "vertical" | "horizontal";
/** One option. `value` is a short identifier (letters, digits, dashes) — it becomes part of an element id. */
type RadioGroupOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type RadioGroupOverridableBinding = "controlBorderWidth" | "indicatorInset" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionPaddingBlock" | "optionTextGap" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "name" | "disabled" | "onChange" | "children" | "role" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-disabled" | "className" | "style"> {
  /** The group's legend — the question the options answer. Always visible. */
  label: string;
  /** Field name used by the enclosing Form. Also links the radios into one native group on web. */
  name: string;
  /**
   * The options in display order. Two to about seven; more than that is a Select (planned). Values
   * are short identifiers (letters, digits, dashes) — they become element ids.
   */
  options: {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
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
  onChange?: ((value: string) => void) | undefined;
}
/**
 * RadioGroup — Design Schema, category: input.
 *
 * When to use:
 * Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.
 */
export declare function RadioGroup({ ref, label, name, options, value, defaultValue, orientation, required, invalid, disabled, description, error, overrides, onChange, onBlur, onKeyDown, id: idProp, ...rest }: RadioGroupProps & {
  ref?: Ref<HTMLFieldSetElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Disclosure.d.ts
/** Accepts the schema's string values and their numeric equivalents. */
type DisclosureHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
/** Why the state changed: a pointer click, a keyboard activation (Enter/Space), or an external `open` prop change. */
type DisclosureToggleReason = "pointer" | "keyboard" | "controlled";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerLineHeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
interface DisclosureProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "disabled" | "children" | "className" | "style" | "aria-expanded" | "aria-controls" | "aria-disabled" | "onToggle" | "onClick"> {
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
export declare function Disclosure({ ref, summary, children, open, defaultOpen, disabled, keepMounted, headingLevel, overrides, onToggle, id: idProp, ...rest }: DisclosureProps & {
  ref?: Ref<HTMLButtonElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Alert.d.ts
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertLive = "status" | "alert" | "off";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AlertOverridableBinding = "border" | "borderWidth" | "radius" | "padding" | "gap" | "partGap" | "iconSize" | "headingSize" | "headingWeight" | "fontFamily" | "fontSize" | "lineHeight" | "dismissMargin";
interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "title" | "style" | "className" | "aria-label" | "aria-labelledby"> {
  /**
   * What kind of message this is. Sets the colors and the icon, which together convey the tone
   * without relying on color. There is deliberately no `neutral` tone: every value here says
   * something about urgency, and a message that says nothing about urgency is not an Alert.
   */
  tone?: AlertTone | undefined;
  /**
   * A short bold first line for the message. Optional for one-line messages. An empty string is the
   * same as no heading: no heading element is rendered and the name falls back to the body. Named
   * `heading`, not `title`, because `title` is a native attribute (tooltip) on every platform element.
   */
  heading?: string | undefined;
  /** The message body. Text and Links; no headings or form controls. */
  children: ReactNode;
  /**
   * How the alert is announced when it appears. `status` is polite (most messages), `alert`
   * interrupts (only for errors that block the user), `off` for alerts already present when the
   * view loads. Maps to role=status, role=alert, or a plain region. Never use `alert` for success or info.
   */
  live?: AlertLive | undefined;
  /**
   * Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer
   * removes the alert (the component is controlled by its presence in the tree).
   */
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
export declare function Alert({ ref, tone, heading, children, live, dismissible, onDismiss, overrides, ...rest }: AlertProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Landmark.d.ts
/** Which landmark this is. */
type LandmarkRole = "banner" | "navigation" | "main" | "complementary" | "contentinfo" | "region" | "search" | "form";
/** Web element override. */
type LandmarkElement = "header" | "nav" | "main" | "aside" | "footer" | "section" | "form" | "div";
interface LandmarkProps extends Omit<HTMLAttributes<HTMLElement>, "role" | "children" | "aria-label" | "className" | "style"> {
  /**
   * Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page),
   * `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that
   * deserves a jump point), `search`, `form` (a labelled form that is a page-level region).
   */
  role: LandmarkRole;
  /**
   * Accessible name. Required for `region` and `form`, and whenever the page has more than one
   * landmark of the same role (two navigations: "Main" and "Footer"). Not shown visually. An empty
   * string counts as absent. `banner`, `main` and `contentinfo` never take a label: one passed to
   * them is not rendered and a development warning says so.
   */
  label?: string | undefined;
  /** The region's content. */
  children: ReactNode;
  /**
   * Web element override. By default the element is chosen from `role`; set this only when the
   * native element would be wrong, e.g. a `banner` that is not the page header.
   */
  as?: LandmarkElement | undefined;
}
/**
 * Landmark — Design Schema, category: layout. Renders its children inside the element and role
 * of one ARIA landmark, and nothing else: no padding, background or layout.
 *
 * When to use:
 * Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for
 * the primary content, `navigation` for each navigation block (labelled when there is more than
 * one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site
 * footer, `search` around the site search form, and `region` for any other section a user might
 * want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly
 * one `main`.
 */
export declare function Landmark({ ref, role, label, children, as, "aria-labelledby": ariaLabelledBy, ...rest }: LandmarkProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Breadcrumb.d.ts
/** One step of the trail. `href` is ignored on the last item, which is the current page. */
type BreadcrumbItem = {
  label: string;
  href?: string | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label" | "className" | "style"> {
  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`; an
   * ancestor without one, or with an empty-string `href`, renders as plain text (never an empty link).
   * The last is the current page and its `href` is ignored. An empty array renders the named landmark
   * around an empty list; a single item renders only the current page.
   */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis
   * is a button that reveals the rest. The rule is literal: five items hide the second and third. Once
   * revealed the trail stays expanded for the life of the instance, even if `items` changes. Set false
   * for short trails that must always show in full.
   */
  collapse?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when a non-current item is activated, as `(item, index, event)`. The link still navigates
   * unless the handler returns `false` or calls `event.preventDefault()`.
   */
  onNavigate?: ((item: BreadcrumbItem, index: number, event: MouseEvent<HTMLAnchorElement>) => void | boolean) | undefined;
}
/**
 * Breadcrumb — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
 * catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors
 * and jumping to any of them. Place it above the page title, at the top of `main`.
 */
export declare function Breadcrumb({ ref, items, label, collapse, overrides, onNavigate, ...rest }: BreadcrumbProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Meter.d.ts
type MeterTone = "info" | "success" | "warning" | "danger";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type MeterOverridableBinding = "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition";
type MeterOverrides = Partial<Record<MeterOverridableBinding, TokenRef | undefined>>;
interface MeterProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "className" | "style"> {
  /**
   * The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number
   * too, exact and unrounded (`aria-valuenow="3.14159"`) — only the percentage text is rounded.
   */
  value: number;
  /** Lower bound of the range. A non-finite `min` (NaN, Infinity) is treated as 0. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. A non-finite `max` (NaN, Infinity) is treated as 100. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw number
   * ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%").
   * Meter has no locale prop: the percentage uses the runtime's default locale, and the same formatter
   * produces the "0%" of an invalid range. Rounding is for the text only; the fill uses the exact fraction.
   */
  valueText?: string | undefined;
  /**
   * Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from
   * thresholds it owns — the meter does not decide what is "too full".
   */
  tone?: MeterTone | undefined;
  /**
   * Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding
   * one). The accessible value is always exposed.
   */
  hideValue?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: MeterOverrides | undefined;
}
/**
 * Meter — Design Schema, category: data.
 *
 * When to use:
 * Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a
 * score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands
 * ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not
 * what a person would say.
 */
export declare function Meter({ ref, value, min, max, label, valueText, tone, hideValue, overrides, ...rest }: MeterProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Icon.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/**
 * Style bindings that can be overridden per instance. `strokeWidth` is locked: line glyphs stay
 * legible at `xs` because they stroke at the focus-ring width, so it is not in this union (a
 * consumer who must change it sets `--ds-icon-stroke-width` from their own CSS).
 */
type IconOverridableBinding = "size" | "color";
interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "name" | "role" | "aria-hidden" | "aria-label" | "viewBox" | "focusable" | "width" | "height" | "children" | "className" | "style"> {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs a shape;
   * `info`, `success`, `warning` and `danger` are the four status shapes (circle-i, circle-check,
   * triangle-!, octagon-x) so tone is never carried by color alone. `name` has no default; the
   * Default story renders `check`.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring
   * `size`. For icons inside Text, Link and Button labels. On web `font-size: inherit` always has a
   * surrounding size to read, so there is no fallback.
   */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an image with
   * this name; when omitted or empty, it is decorative and hidden from assistive technology — an
   * empty string is the decorative case, not an authoring error. Most icons sit next to text and
   * should have no label.
   */
  label?: string | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook (`--ds-icon-size`,
   * `--ds-icon-color`) to that token, inline. `size` is a no-op while `inline` is set.
   */
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
 * Glyphs are drawn in `currentColor`, so a Button, Link or Alert colors them for free; an icon with
 * no colored ancestor falls back to what the document root resolves, `color.foreground`. Line
 * glyphs use the focus-ring width as their stroke, at every size, so they stay legible at `xs`.
 */
export declare function Icon({ ref, name, size, inline, label, overrides, ...rest }: IconProps & {
  ref?: Ref<SVGSVGElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Card.d.ts
/** Accepts the schema's string values and their numeric equivalents. */
type CardHeadingLevel = "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
type CardInset = "sm" | "md" | "lg";
type CardSurface = "default" | "subtle";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "transition";
interface CardProps extends Omit<ComponentPropsWithoutRef<"article">, "children" | "aria-labelledby" | "className" | "style"> {
  /**
   * The body. Usually a Stack of Text and controls; a plain string or number is rendered inside the
   * system Text with its defaults (a bare string cannot sit in a native View), including each
   * top-level string or number in an array body. Fragments and arrays are flattened before the
   * wrap, exactly as they are when the interactive target is looked for, so a string directly
   * inside a top-level Fragment is wrapped too.
   */
  children: ReactNode;
  /**
   * The card's title, rendered as the system Heading at the card's level and at `size: lg` on every
   * platform, so a card heading reads smaller than a page heading. Omit for cards that are a single
   * piece of content; an empty string counts as omitted (no article, no label) — but the header row
   * still renders when `headerActions` is set, holding the actions alone.
   */
  heading?: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  headingLevel?: CardHeadingLevel | undefined;
  /**
   * Controls at the end of the header row — a ghost icon-only Button, a Link. At most two: a
   * content guideline, not a runtime check, as with every other soft content limit here.
   */
  headerActions?: ReactNode | undefined;
  /** The action row. Buttons in a row, primary first, following Form's action-order rule. */
  footer?: ReactNode | undefined;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one interactive child (a Link or
   * Button) whose action the card extends to its full area; the card itself is not focusable. The
   * child is looked for among the top-level children of the body only (a native a[href] or button
   * is accepted too); controls nested inside a wrapper such as a Stack are not searched, so place
   * the link at the top level beside any Text. A top-level Fragment is flattened, so its children
   * count as top-level. With zero or several such children the card stays non-interactive (no hit
   * area, no hover background, no press) and warns once per mounted card in development — latched
   * for the life of the mount, so a card that goes valid and then invalid again does not warn a
   * second time. If the child is disabled the card is disabled with it: no hover background and
   * pressing does nothing. The card itself never dims; the child renders its own disabled state.
   * Controls in `headerActions` and `footer` are never the target; they sit above the hit area and
   * keep their own targets.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it by script, and
   * draws its own focus ring when focused that way. Not a tab stop; not for making cards
   * clickable (`interactive`). With `interactive` also set, `interactive` wins and this is a
   * no-op — the card already has a target — and a development warning says so. It stays a no-op
   * whenever `interactive` is set, even when that card fell back to non-interactive for want of a
   * single target. The ring is an outline drawn outside the box, so a focusable card reserves no
   * border.
   */
  focusable?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Card — Design Schema, category: container.
 *
 * When to use:
 * Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
 */
export declare function Card({ ref, children, heading, headingLevel, headerActions, footer, inset, surface, interactive, focusable, overrides, onFocus, onBlur, onPointerDown, onPointerUp, ...rest }: CardProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Container.d.ts
type ContainerWidth = "prose" | "content" | "page" | "full";
type ContainerGutter = "narrow" | "default" | "wide" | "none";
type ContainerAlign = "center" | "start";
type ContainerElement = "div" | "main" | "section";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ContainerOverridableBinding = "maxWidth" | "paddingInline";
interface ContainerProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** The page or region content, usually a Stack with `gap: section` between regions. */
  children: ReactNode;
  /** `prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed
   * layouts with wide grids, `full` for no cap (gutters only). */
  width?: ContainerWidth | undefined;
  /** Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the
   * content width and the wide gutter above the page width. `none` for a nested container inside a
   * padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. `start` sets `margin-inline: 0` on both sides,
   * not just the start side, so the column never picks up an asymmetric margin. */
  align?: ContainerAlign | undefined;
  /** Use `main` for the page's main column when no Landmark wraps it. A page has exactly one `main`;
   * that is the author's responsibility, since the component cannot see the rest of the page, so it
   * neither enforces it nor warns. */
  element?: ContainerElement | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.
   * Overrides change values, never presence: `maxWidth` is a no-op at `width: full` and
   * `paddingInline` is a no-op at `gutter: none`, because neither renders a hook at that value.
   * Neither warns. A `paddingInline` override replaces the value at every viewport width, including
   * the whole responsive `default` gutter rather than just its middle band. Consumers may also set
   * `--ds-container-max-width` / `--ds-container-padding-inline` from their own CSS; that is the
   * sanctioned escape hatch.
   */
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
 *
 * Container adds no semantics unless `element: main` is chosen, in which case it is the page's main
 * landmark and there must be exactly one.
 */
export declare function Container({ ref, children, width, gutter, align, element, overrides, ...rest }: ContainerProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
type FocusScopeEscapeDirection = "forward" | "backward";
interface FocusScopeProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "tabIndex" | "onKeyDown" | "autoFocus" | "className" | "style" | "role"> {
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
 * Moves focus in on mount, keeps Tab inside while trapped, and puts focus back on unmount. It never
 * handles Escape and never makes anything inert; the composing overlay owns both.
 *
 * When to use:
 * Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it
 * in their composition, and that is where it should live. Render it yourself only when building a
 * new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay),
 * with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal
 * panel that should still move focus in and restore it on close (a slide-in filter drawer that
 * keeps the page usable).
 */
export declare function FocusScope({ ref, children, trapped, autoFocus, restoreFocus, returnFocusTo, active, onEscapeAttempt, ...rest }: FocusScopeProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Dialog.d.ts
type DialogSize = "sm" | "md" | "lg";
type DialogInitialFocus = "first" | "title" | "close";
type DialogCloseReason = "escape" | "close-button" | "scrim" | "action";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "gutter" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "widthMd" | "widthLg" | "layer" | "enter" | "exit";
interface DialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open"> {
  /** Controlled only — there is no uncontrolled mode and no initial-state prop; the consumer owns `open` and the dialog never closes itself, it requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: ReactNode | undefined;
  /** Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer): the close button is not rendered and the scrim does nothing; Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control (default), the title (for long or reading dialogs), or the close button. `first` looks in the body, then the footer, then the close button, then the heading (tabindex -1); `close` with no close button rendered (not dismissible) takes the same order without the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. When there is no transition to wait for (reduced motion, or a zero computed duration), it fires on the next frame after focus moves in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Dialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Dialog for a short task that must complete before the user continues and needs its own
 * space: rename, create-with-a-few-fields, choose from options with consequences, confirm something
 * reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a
 * page. Give it a `heading` that names the task and a `footer` with the completing action first.
 *
 * The dialog never closes itself: Escape, the close button and a scrim click call `onClose` with a
 * reason and the consumer flips `open`. The ref resolves to the `<dialog>`, null while closed.
 */
export declare function Dialog({ ref, open, heading, description, children, footer, hideHeading, size, dismissible, initialFocus, onClose, onOpened, container, overrides, className: _className, style: _style, ...rest }: DialogProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}): ReactElement | null;
//#endregion
//#region src/AlertDialog.d.ts
type AlertDialogTone = "danger" | "warning" | "info";
type AlertDialogCancelReason = "cancel" | "escape";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "gutter" | "layer" | "rise" | "enter" | "exit";
interface AlertDialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open" | "role"> {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading at the size Heading reads from level 2 (no explicit `size`), and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences, rendered as Text `tone="muted"` at Text's default size (the color.foreground.muted contrast pair). Required: a decision without consequences stated is not a decision. */
  description: string;
  /** The nature of the decision. Sets the status icon (Icon `name` equal to the tone) and the confirm button's variant (danger → danger Button; warning and info → primary). Both buttons are Button size md. */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. Forwarded to the confirm Button's own `disabled` — it stays focusable-but-inert, so Confirm is still the last Tab stop; AlertDialog neither restyles it nor sets aria-disabled itself. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * AlertDialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use an AlertDialog before an action that destroys data, spends money, sends something that cannot
 * be recalled, or leaves a state the user cannot get back to — and only when undo is not available.
 * Use `tone: danger` for destruction, `warning` for consequential-but-recoverable, `info` for a
 * decision with no downside that still needs a choice (leave the page with unsaved changes? — that
 * is `warning`).
 *
 * The alert dialog never closes itself: Cancel and Escape fire `onCancel`, Confirm fires
 * `onConfirm`, a scrim click does nothing, and the consumer flips `open`. Focus starts on Cancel so
 * Enter pressed reflexively cancels rather than destroys. The ref resolves to the `<dialog>`, null
 * while closed.
 */
export declare function AlertDialog({ ref, open, heading, description, tone, confirmLabel, cancelLabel, confirmDisabled, onConfirm, onCancel, container, overrides, className: _className, style: _style, ...rest }: AlertDialogProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}): ReactElement | null;
//#endregion
//#region src/Menu.d.ts
type MenuTriggerVariant = "ghost" | "secondary" | "primary";
type MenuTriggerIcon = "ellipsis" | "chevron-down" | "none";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
type MenuItemTone = "default" | "danger";
/**
 * Why the menu opened or closed: `trigger` (the trigger was activated), `escape` (Escape pressed
 * while open), `outside` (a pointer press landed outside the menu), `action` (an item was chosen;
 * fired before onAction), `controlled` (the consumer changed the open prop — the menu never raises
 * this itself; it exists so a composing component can forward its own reason through), `tab-out`
 * (Tab or Shift+Tab pressed while open), `focus-out` (focus moved outside the menu and trigger by
 * other means, or the window lost focus).
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
/** A labelled cluster of action items, rendered with a non-interactive heading row. */
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
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "gutter" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter" | "enterDistance";
interface MenuProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /**
   * Actions, optionally grouped with a label or divided by separators. Groups render their label as
   * a non-interactive heading row and hold action items only — the shape is recursive but a group
   * inside a group is not a shape this component draws: a nested group or a separator inside a group
   * is dropped without a development warning.
   */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant | undefined;
  /**
   * Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the
   * accessible name), `chevron-down` for a labelled dropdown, `none`. With `iconOnly` the glyph is
   * passed as the Button's `leadingIcon` (an icon-only Button shows only that); otherwise as its
   * `trailingIcon`.
   */
  triggerIcon?: MenuTriggerIcon | undefined;
  /**
   * Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. With
   * `triggerIcon: none` there would be nothing visible to press, so that pairing warns in development
   * (once), unless `anchor` is set (there is no trigger then). It is the only development warning Menu
   * issues — no warning for empty items, a missing label or an uncontrolled anchor.
   */
  iconOnly?: boolean | undefined;
  /**
   * Preferred position of the popup relative to the trigger (or `anchor`). Only the block side flips
   * (bottom and top swap) when the popup would overflow the viewport; `start` and `end` never flip.
   * They resolve against the layout direction (in right-to-left `start` is the right edge), and the
   * popup is shifted inline instead so it stays `gutter` away from the side edges.
   */
  placement?: MenuPlacement | undefined;
  /**
   * Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu, which
   * starts closed; there is no defaultOpen. A controlled menu hides only when `open` becomes false — a
   * parent that never flips it keeps the menu open. Focus on close follows the reason; a close the menu
   * did not request moves focus to the trigger only when focus is inside the popup at that moment.
   */
  open?: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a trigger; the trigger part is
   * omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by context
   * menus. The anchor stands in for the trigger: a pointerdown on it is not `outside` and focus moving
   * onto it is not `focus-out`, and focus that would return to the trigger returns to the element that
   * had focus when the menu opened.
   */
  anchor?: RefObject<HTMLElement | null> | undefined;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: ((id: string) => void) | undefined;
  /**
   * Fired when the menu opens or closes, with `(open, reason)` — reason: `trigger`, `escape`,
   * `outside`, `action` (an item was chosen; fired before onAction), `controlled`, `tab-out`, `focus-out`.
   */
  onOpenChange?: ((open: boolean, reason: MenuOpenChangeReason) => void) | undefined;
  /** Portal target for the popup. Defaults to `document.body`. A platform prop, not a schema prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook on the popup to that token, inline. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Menu — Design Schema, category: overlay (APG menu button).
 *
 * When to use:
 * Use a Menu for secondary actions on an item or a view that do not deserve their own buttons:
 * overflow ("More actions"), sort or view options, account menus. Group related items with a
 * `group` label when there are more than about six; separate a danger action with a `separator`.
 * On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is
 * "pick an action" and let the platform decide the surface.
 *
 * The forwarded `ref` resolves to the popup (`role="menu"`) and is null while closed.
 */
export declare function Menu({ ref, label, items, triggerVariant, triggerIcon, iconOnly, placement, open: openProp, anchor, onAction, onOpenChange, container, overrides, ...rest }: MenuProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Tooltip.d.ts
type TooltipPlacement = "top" | "bottom" | "start" | "end";
type TooltipDelay = "default" | "none";
/** Style bindings that can be overridden per instance; `surface` and `text` are locked and never in this list. */
type TooltipOverridableBinding = "radius" | "paddingBlock" | "paddingInline" | "offset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "shadow" | "layer" | "enter" | "exit";
interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /**
   * Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a
   * non-focusable child is an error, because keyboard users could never see the tooltip.
   */
  children: ReactElement<any>;
  /**
   * Preferred side; flips when it would overflow the viewport. `start`/`end` are logical and
   * mirror in right-to-left writing.
   */
  placement?: TooltipPlacement | undefined;
  /**
   * `true`: the tooltip is supplementary and becomes the child's accessible description
   * (aria-describedby). `false`: the tooltip IS the child's name (an icon-only button whose label
   * equals the tooltip) and is linked as aria-labelledby instead — set this when the child has no
   * visible text and its `label` equals `content`, to avoid announcing it twice.
   */
  describes?: boolean | undefined;
  /**
   * Controlled visibility, for stories and tests only (the Keyboard story renders the tooltip open
   * with it). Product code never sets it: a tooltip is hover and focus driven. There is no change
   * event: Escape still hides a tooltip rendered with `open: true`, and it stays hidden until the
   * `open` prop next changes.
   */
  open?: boolean | undefined;
  /**
   * Hover delay before showing: `default` uses `motion.duration.base` × 3 (roughly 600ms, so casual
   * mouse movement does not flash tooltips); `none` for toolbars where a sibling tooltip is already open.
   * After any tooltip hides, siblings show with no delay for one `motion.duration.base` (the warm window).
   */
  delay?: TooltipDelay | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
  /** Portal target for the bubble. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
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
 * The description lives in two nodes: a visually-hidden `role="tooltip"` span carrying the id and
 * `data-ds="Tooltip"`, always in the accessibility tree, and the positioned bubble
 * (`data-part="popup"`), which is `aria-hidden` and only a visible copy. Tooltip exposes no `ref`:
 * a caller that needs the trigger refs its own child.
 */
export declare function Tooltip({ content, children, placement, describes, open, delay, overrides, container }: TooltipProps): ReactElement;
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/**
 * Style bindings that can be overridden per instance; the accessibility-bearing `labelColor` is
 * never in this list. `labelSize` and `fontFamily` have no `--ds-divider-*` hook: they are
 * forwarded to the composed `Text` label's own `overrides` (as `fontSize` and `fontFamily`), since
 * Divider does not style the Text itself.
 */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
interface DividerProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-orientation" | "aria-hidden" | "className" | "style"> {
  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height:
   * `inline-block` with `block-size: auto; align-self: stretch; min-block-size: 100%` (flex stretch
   * applies only to an auto cross size, and the min fills a parent with a set height). They need a
   * flex or grid row (a horizontal Stack with align stretch) or a parent with a definite height; in
   * plain block flow a vertical divider has no height and draws nothing.
   */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider
   * from decorative into a labelled separator (`semantic` is implied). Ignored on a vertical
   * divider, with a development warning: a vertical line has no room for centered text. An ignored
   * label implies nothing either — a vertical divider is semantic only when `semantic` says so. An
   * empty string is no label: the divider stays decorative and nothing warns. The development
   * warning fires when the ignored combination appears or changes, not on every render. A vertical
   * divider with an ignored label and `semantic: true` is a separator with no accessible name:
   * naming it from text that is not rendered would contradict the label being ignored. When in
   * effect, the label is the separator's accessible name (through `aria-labelledby`, since
   * separator children are presentational), and the two line pieces on either side are hidden from
   * assistive technology.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. Leave false for purely visual lines between
   * list rows; set true (or provide a label) when the divider marks a real boundary between
   * sections that a screen-reader user should hear.
   */
  semantic?: boolean | undefined;
  /**
   * Space on both sides along the cross axis (above and below a horizontal divider, left and right
   * of a vertical one), from the layout rhythm, for dividers used outside a Stack that already
   * spaces them. The space is transparent: `margin-block` horizontally, `margin-inline` vertically.
   * It applies to a labelled divider too, where the root is the row: the space is around the whole
   * divider, label included, not around each line piece.
   */
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
export declare function Divider({ ref, orientation, label, semantic, spacing, overrides, ...rest }: DividerProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Fieldset.d.ts
type FieldsetGap = "tight" | "normal" | "loose";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "disabledOpacity" | "fontFamily" | "lineHeight";
type FieldsetOverrides = Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>>;
interface FieldsetProps extends Omit<ComponentPropsWithoutRef<"fieldset">, "disabled" | "children" | "className" | "style" | "aria-describedby" | "aria-disabled" | "aria-invalid"> {
  /** The group's name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible. */
  legend: string;
  /** The fields as direct children, usually Inputs, Checkboxes or Switches; Fieldset renders the Stack around them. */
  children: ReactNode;
  /** Persistent helper text under the legend. An empty string counts as unset (no part rendered, no link). */
  description?: string | undefined;
  /**
   * A group-level error (cross-field validation such as "End date must be after start date"). Field-level
   * errors stay on the fields. An empty string counts as unset (no part, no aria-invalid, no announcement).
   */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  gap?: FieldsetGap | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline, or reaches the composed Text/Stack through its `overrides`. */
  overrides?: FieldsetOverrides | undefined;
}
/**
 * Fieldset — Design Schema, category: input.
 *
 * When to use:
 * Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a
 * card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the
 * group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather
 * than on one field.
 */
export declare function Fieldset({ ref, legend, children, description, error, disabled, gap, overrides, ...rest }: FieldsetProps & {
  ref?: Ref<HTMLFieldSetElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Toast.d.ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastDuration = "short" | "long" | "persistent";
type ToastDismissReason = "timeout" | "dismiss-button" | "escape" | "action" | "replaced" | "programmatic";
/**
 * Style bindings that can be overridden on a toast; accessibility-bearing bindings are never in
 * this list. `stackGap`, `regionInset` and `layer` belong to the region: see
 * `ToastRegionOverridableBinding`.
 */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "enter" | "enterOffset" | "exit";
/** Style bindings that can be overridden on the region (ToastRegion). */
type ToastRegionOverridableBinding = "stackGap" | "regionInset" | "layer";
interface ToastProps extends Omit<ComponentPropsWithoutRef<"div">, "id" | "children" | "role" | "style" | "className"> {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop × 6 / × 12 so themes
   * without motion still get sensible times), `persistent` until dismissed. When `actionLabel` is
   * set or `tone` is danger the toast is persistent regardless of this prop (a dev warning notes
   * the override only when `duration` was passed explicitly as `short` or `long`). If
   * motion.duration.loop resolves to 0 or cannot be resolved, both durations are persistent.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /**
   * Stable identity; showing a toast with the same toastId replaces the previous one instead of
   * stacking. It never becomes the DOM `id`; on a directly rendered Toast it has no effect.
   */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /**
   * The toast left the screen: reason `timeout`, `dismiss-button`, `escape`, `action`, `replaced`
   * (left immediately, without its exit transition), or `programmatic`. Fires after the exit
   * transition, just before the toast is removed.
   */
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
 *
 * Toasts are normally shown with `toast({ message })`, which renders them in the one
 * `ToastRegion`; rendering `<Toast>` directly is for previews and custom hosts.
 */
export declare function Toast({ ref, message, tone, actionLabel, duration, dismissible, toastId: _toastId, onAction, onDismiss, overrides, ...rest }: ToastProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement | null;
/** Options for `toast()`: the toast's props, shown in the region. */
interface ToastOptions {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). */
  actionLabel?: string | undefined;
  /** `short` ≈ 5s, `long` ≈ 10s, `persistent` until dismissed. */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /** The toast left the screen. */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}
interface ToastRegionProps {
  /** Per-instance style overrides for the region's own bindings (`stackGap`, `regionInset`, `layer`). */
  overrides?: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
  /** Portal target; defaults to `document.body`. */
  container?: HTMLElement | undefined;
}
/**
 * ToastRegion — the one persistent `role="region"` live region that holds every visible Toast.
 *
 * Mount it once at the app root, or let `toast()` create it on first use. It exists before any
 * toast so announcements fire; F6 moves focus into it from anywhere and back again.
 */
export declare function ToastRegion({ ref, overrides, container }: ToastRegionProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement | null;
/**
 * Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
 * rendered: `toast({ message: 'Link copied' })`. Resolves with `{ reason }` when the toast leaves.
 */
export declare function toast(options: ToastOptions): Promise<{
  reason: ToastDismissReason;
}>;
/**
 * Removes the toast shown with `toastId`, or every toast when called with no id; each leaves
 * through its exit transition with reason `programmatic`.
 */
export declare function dismiss(toastId?: string): void;
//#endregion
//#region src/Popover.d.ts
type PopoverPlacement = "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end" | "start" | "end";
/** Heading level of the panel heading. Accepts the schema's string values and their numeric equivalents. */
type PopoverHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
type PopoverOpenChangeReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** Style bindings that can be overridden per instance; `surface`, `focusRing` and `focusRingWidth` are locked. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "layer" | "enter" | "enterDistance" | "exit";
interface PopoverProps {
  /**
   * Exactly one focusable element — usually a Button — that opens the popover; typed as a single
   * element, since it is cloned with aria-expanded/aria-controls and the toggle handler.
   */
  trigger: ReactElement;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger. */
  heading?: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline (a popover usually sits under a level-2 section). */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); the uncontrolled popover starts closed and there is no defaultOpen. */
  open?: boolean | undefined;
  /**
   * Preferred side and alignment; flips and shifts to stay in the viewport. All eight values are
   * logical: `start`/`end` and the `-start`/`-end` alignments mirror in right-to-left writing.
   */
  placement?: PopoverPlacement | undefined;
  /**
   * False (default): the page stays interactive; clicking outside closes; focus moves in but is not
   * trapped, and Tab out closes. True: behaves as a small Dialog anchored to the trigger — focus
   * trapped, background inert — for content that must be finished (a required form).
   */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default; Calm & precise prefers a plain edge. */
  showArrow?: boolean | undefined;
  /**
   * Show the close button. Escape and outside click work regardless (non-modal), so this is a
   * visibility switch, not Dialog's "must be answered" rule: with it false there is simply no close button.
   */
  dismissible?: boolean | undefined;
  /**
   * Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `outside`, `close-button`, `tab-out`.
   */
  onOpenChange?: ((open: boolean, reason: PopoverOpenChangeReason) => void) | undefined;
  /** Portal target for the panel. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Popover — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date field,
 * a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help with a
 * link. Use `modal` when the panel contains a required step (a short form that must be submitted or
 * cancelled). Use `heading` when the content is not obvious from the trigger.
 *
 * The root (`data-ds="Popover"`, and `ref`) is the panel, which exists only while open or closing;
 * the trigger is rendered in place and the panel through a portal.
 */
export declare function Popover({ ref, trigger, children, heading, headingLevel, open: openProp, placement, modal, showArrow, dismissible, onOpenChange, container, overrides }: PopoverProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/BottomSheet.d.ts
type BottomSheetHeight = "content" | "half" | "full";
type BottomSheetCloseReason = "escape" | "close-button" | "scrim" | "drag" | "action";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "handleRadius" | "headerPaddingTop" | "handleGap" | "headerGap" | "inset" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface BottomSheetProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open"> {
  /** Controlled visibility, as in Dialog. Controlled only — there is no uncontrolled mode; the consumer owns `open` and the sheet requests changes through `onClose`, never changing `open` itself. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /**
   * Keep the heading for assistive technology but do not render it (forwarded to Dialog above the
   * breakpoint). The accessible name is required regardless; visually hidden is fine, absent is not.
   */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: ReactNode | undefined;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the
   * footer actions close it, as in Dialog: the close button and the drag handle are not rendered, a
   * scrim tap and a drag do nothing, and Escape still reports with reason `escape`. The wide Dialog
   * presentation receives the same value.
   */
  dismissible?: boolean | undefined;
  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. The body does not start the
   * gesture whatever its scroll position; only the handle and header do, and only once the pointer has
   * moved `dragSlop` downward, so a tap on the close button still activates it. Purely additive: the
   * handle is rendered only when `dragToDismiss` and `dismissible` are both true, so there is no drag
   * affordance where dragging does nothing. A gesture is never the only way to dismiss (WCAG 2.5.1);
   * the handle is not a focus stop.
   */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. The sheet never raises `action` itself; it exists for a consumer's footer action reusing the same handler. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag, so analytics can distinguish gestures. It carries no payload — the distance and velocity that triggered it are not part of the contract. */
  onDragDismiss?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. Bindings Dialog shares by name are forwarded to it above the breakpoint. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * BottomSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters,
 * a form of a few fields, details of a selected item, a picker with many options. Use `height: content`
 * by default; `full` for a task that needs the whole screen but should still feel dismissable; `half`
 * for a browsable list where seeing the page behind matters (a map with results). For a flat list of
 * actions, ActionSheet is the lighter component.
 *
 * Above the `layout.maxWidth.prose` breakpoint the same props render `Dialog` of size md directly, so
 * the root and `ref` are Dialog's `<dialog>` and `drag` never fires. Below it `ref` resolves to the
 * sheet's `<dialog>`, null while closed. The sheet never closes itself: Escape, the close button, a
 * scrim tap and the drag gesture all call `onClose` with a reason and the consumer flips `open`.
 */
export declare function BottomSheet({ ref, open, heading, hideHeading, children, footer, height, dismissible, dragToDismiss, onClose, onDragDismiss, container, overrides, className: _className, style: _style, ...rest }: BottomSheetProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}): ReactElement | null;
//#endregion
//#region src/ActionSheet.d.ts
type ActionSheetActionTone = "default" | "danger";
type ActionSheetCloseReason = "escape" | "scrim" | "cancel" | "drag";
/** A single row in the sheet. */
type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName;
  tone?: "default" | "danger";
  disabled?: boolean;
};
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings (surface,
 * handle, itemHover, itemColor, itemDangerColor, titleColor, minTarget, maxWidth, focusRing,
 * focusRingWidth) are never in this list.
 */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "headerPaddingBlock" | "headerGap" | "handleHeight" | "handleWidth" | "handleRadius" | "titleSize" | "fontFamily" | "fontSize" | "lineHeight" | "divider" | "dividerWidth" | "layer" | "enter" | "exit";
interface ActionSheetProps extends Omit<ComponentPropsWithoutRef<"dialog">, "children" | "title" | "onCancel" | "onClose" | "open" | "className" | "style"> {
  /**
   * Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a
   * dismissal through `onClose` and reports a choice through `onAction`, and the consumer sets
   * `open` to false for both.
   */
  open: boolean;
  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`.
   */
  heading?: string | undefined;
  /**
   * Two to about eight actions. `danger` actions are visually distinct and grouped last. The count
   * is guidance, not enforced: no dev warning outside that range.
   */
  actions: ActionSheetAction[];
  /**
   * Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the
   * Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim
   * and the drag do nothing, and Escape still reports through onClose; with no `heading` either, the
   * header has nothing to show and is not rendered at all. It gates the sheet presentation only —
   * the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.
   */
  dismissible?: boolean | undefined;
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: ((id: string) => void) | undefined;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: ((reason: ActionSheetCloseReason) => void) | undefined;
  /** Portal target (platform prop, not in the schema). Defaults to `document.body`; forwarded to the wide Menu. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * ActionSheet — contextual actions on an item: a bottom sheet of menu items at or below
 * `layout.maxWidth.prose`, a Menu anchored to the opener above it.
 *
 * When to use: Use an ActionSheet for contextual actions on an item — share, rename, duplicate,
 * delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep
 * it to what fits without scrolling; more than eight actions means the item needs its own screen.
 * Put destructive actions last with `tone: danger`.
 */
export declare function ActionSheet({ ref, open, heading, actions, dismissible, cancelLabel, onAction, onClose, container, overrides, ...rest }: ActionSheetProps & {
  ref?: Ref<HTMLDialogElement> | undefined;
}): ReactElement | null;
//#endregion
//#region src/SidePanel.d.ts
type SidePanelSide = "start" | "end";
type SidePanelWidth = "narrow" | "default" | "wide";
type SidePanelPersistent = "never" | "content" | "page";
type SidePanelRole = "complementary" | "navigation";
type SidePanelOpenChangeReason = "trigger" | "escape" | "close-button" | "scrim" | "outside" | "swipe" | "action" | "navigation";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "headingGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
interface SidePanelProps extends Omit<ComponentPropsWithoutRef<"aside">, "children" | "role" | "hidden"> {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label
   * like "Menu"). It is the APG disclosure button: the panel sets aria-expanded and aria-controls on
   * it, and it stays a toggle — pressing it again closes. Omit to control `open` from elsewhere (a
   * Toolbar). Exactly one element: it is cloned, wrapped in an overlay-owned
   * `<span data-part="trigger">` with display: contents, and that wrapper is what persistent mode hides.
   */
  trigger?: ReactElement<{
    onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  }> | undefined;
  /**
   * Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel
   * always starts closed and there is no defaultOpen, so a panel that must start open is controlled.
   */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`. */
  heading: string;
  /**
   * Keep the title for assistive technology but hide it visually (a navigation panel whose Links are
   * self-explanatory): it stays rendered with the visually-hidden clip pattern so aria-labelledby
   * still resolves. When the header would then be empty (no close button because `dismissible` is
   * false or the panel is persistent), the header part is not rendered: no padding, no gap, no
   * height, and the hidden title moves to the top of the surface. The accessible name is required
   * regardless.
   */
  hideHeading?: boolean | undefined;
  /**
   * The body: a Stack or Tree of Links for navigation, a Stack of filter controls (Checkboxes, a
   * RadioGroup — not a Form, whose own actions would duplicate the footer), a Stack of Cards. Scrolls
   * inside the panel when taller than the viewport.
   */
  children: ReactNode;
  /** Pinned to the bottom of the panel above the safe area (a sign-out Button, a "Apply filters" action row). */
  footer?: ReactNode;
  /**
   * The edge the panel slides from: `start` is left in left-to-right languages and right in
   * right-to-left; `end` the opposite. Navigation comes from the start; contextual panels (a cart, a
   * detail) from the end.
   */
  side?: SidePanelSide | undefined;
  /**
   * Panel width on wide screens: narrow for a list of links, wide for a form or a detail. On phones
   * the panel is the viewport width minus a gutter that keeps the scrim visible.
   */
  width?: SidePanelWidth | undefined;
  /**
   * Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the
   * content: always visible, no scrim, no trap, part of the page's tab order, and the trigger is
   * hidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page; the
   * comparison is `(width > token)`, read from the theme token on <html> when the component mounts.
   * Below it, the overlay behavior applies.
   */
  persistent?: SidePanelPersistent | undefined;
  /**
   * The landmark the panel exposes (in persistent mode and as the region's role when open):
   * `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. This is the
   * composed Landmark's own role, so `navigation` renders a real <nav>; a modal panel is a dialog,
   * not a landmark, and takes none of this.
   */
  role?: SidePanelRole | undefined;
  /**
   * False (the default, the disclosure pattern): the panel is a disclosed region — the page stays
   * live and in the tab order after the panel, focus stays on the trigger when it opens, and Escape
   * from inside or a click outside closes it. True: the panel is a modal Dialog at the edge — scrim,
   * focus moved in and trapped, page inert and scroll-locked — for a panel that must be finished or
   * dismissed (a cart checkout, a required filter).
   */
  modal?: boolean | undefined;
  /**
   * Show the scrim in non-modal mode too (modal always has one). It defaults to true, so turn it off
   * for a panel that should feel like part of the page.
   */
  scrim?: boolean | undefined;
  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe gesture all request close.
   * When false, the close button is not rendered and a scrim tap and an outside press do nothing;
   * Escape still reports through onOpenChange with reason escape (the consumer decides), as in
   * Dialog. Only those are gated: the trigger toggle, a followed Link (`navigation`) and a consumer's
   * `action` always close.
   */
  dismissible?: boolean | undefined;
  /**
   * On touch, a swipe toward the edge dismisses (native only). Purely additive, and accepted here for
   * parity: the web wires no gesture, since dragging a panel with a mouse is not a web idiom. The
   * trigger and close button are always there (WCAG 2.5.1).
   */
  swipeable?: boolean | undefined;
  /**
   * Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `close-button`, `scrim`, `outside`, `swipe`, `action`, `navigation` (a Link inside was followed).
   * `swipe` never comes from the web; `action` is a consumer's own footer handler reusing this.
   */
  onOpenChange?: ((open: boolean, reason: SidePanelOpenChangeReason) => void) | undefined;
  /** Portal target for the overlay. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.
   * `inset` is also forwarded to the body Box's `paddingInline` and `footerGap` to the footer Stack's
   * `gap`, so the composed children follow.
   */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * SidePanel — Design Schema, category: overlay.
 *
 * When to use:
 * Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of
 * Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from
 * the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become
 * the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay
 * (a cart).
 *
 * The panel renders into one stable host node that moves between the portal target (overlay) and
 * the component's place in the page (persistent sidebar), so crossing the breakpoint keeps a
 * non-modal panel's children state. The ref resolves to the root element — the fixed panel, the
 * full-viewport <dialog> when modal, the in-page sidebar when persistent — and is null while closed.
 */
export declare function SidePanel({ ref, trigger, open: openProp, heading, hideHeading, children, footer, side, width, persistent, role, modal, scrim, dismissible, swipeable: _swipeable, onOpenChange, container, overrides, className: _className, style: _style, ...rest }: SidePanelProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
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
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeWeight" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
interface TabPanelProps extends Omit<ComponentPropsWithoutRef<"div">, "id" | "className" | "style" | "hidden"> {
  /** Matches the `id` of the tab this panel belongs to. The DOM id is this value prefixed per Tabs instance. */
  id: string;
  children: ReactNode;
}
/** The wrapper for one tab's content — a child of `Tabs`, one per tab, in the same order. */
export declare function TabPanel({ ref, id, children, ...rest }: TabPanelProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
interface TabsProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange" | "defaultValue" | "className" | "style"> {
  /**
   * The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). The
   * icon is an Icon at `size: md` (the label's size) in the tab's current foreground color. An `id`
   * must be a valid IDREF token (no whitespace), since tab and panel element ids are built from it;
   * the component does not sanitize it.
   */
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
  /**
   * `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four
   * tabs). Horizontal only: vertical tabs always span the list's inline size.
   */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((value: string) => void) | undefined;
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
export declare function Tabs({ ref, tabs, children, label, value, defaultValue, activation, orientation, fit, keepMounted, overrides, onChange, ...rest }: TabsProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
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
interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue" | "className" | "style" | "role"> {
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
export declare function SegmentedControl({ ref, label, options, value, defaultValue, iconOnly, size, fill, overrides, onChange, onKeyDown, ...rest }: SegmentedControlProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Listbox.d.ts
/** One selectable row. */
type ListboxOption = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of rows; groups do not nest. */
type ListboxGroup = {
  group: string;
  options: ListboxOption[];
};
/** The element type of `options`: a row or a group (Select and Combobox take the same `ListboxItem[]`). */
type ListboxItem = ListboxOption | ListboxGroup;
/** A value, or with `multiple` an array of values. */
type ListboxValue = string | string[];
type ListboxMaxVisible = "5" | "8" | "12" | "all" | 5 | 8 | 12;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ListboxOverridableBinding = "border" | "borderInvalid" | "partGap" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionWeight" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "typeaheadReset";
interface ListboxProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange" | "defaultValue" | "role" | "tabIndex" | "className" | "style" | "aria-label" | "aria-labelledby" | "aria-multiselectable" | "aria-activedescendant" | "aria-invalid" | "aria-required" | "aria-describedby" | "aria-busy" | "aria-disabled"> {
  /**
   * Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` as
   * well; on web `aria-labelledby` then wins. Always pass `label` even with `labelledBy`: it is the
   * `{label}` in `copy.required` and `copy.invalid`.
   */
  label: string;
  /** Id of a visible element that labels the list. */
  labelledBy?: string | undefined;
  /** Flat or grouped options; groups do not nest. */
  options: ListboxItem[];
  /**
   * Allow any number of selections. The value becomes an array; each option shows a check
   * indicator; selection toggles rather than moves. This is the same engine Combobox uses for
   * multi-select.
   */
  multiple?: boolean | undefined;
  /** Controlled selection: a value, or with `multiple` the exported `ListboxValue` (`string | string[]`). Omit for uncontrolled. */
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
  /**
   * Marks the list invalid (aria-invalid, and `borderInvalid` when not `embedded`) with
   * `copy.invalid`. The list is invalid while this is true OR `error` is non-empty; clearing
   * `error` never clears an explicitly set `invalid`.
   */
  invalid?: boolean | undefined;
  /**
   * Error message rendered below the list and linked by aria-describedby; implies invalid. The
   * displayed message is `error`, then the Form's message, then while invalid `copy.required`
   * (required and nothing selected) else `copy.invalid`.
   */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; the
   * list draws none of its own. It keeps its own `listPadding`, and an override of `border`,
   * `borderWidth`, `surface` or `radius` is a no-op while it is set. An embedded list is not a tab
   * stop (`tabindex="-1"`): its host keeps focus on the trigger or input and forwards keys.
   */
  embedded?: boolean | undefined;
  /**
   * The option that is active when the list first receives focus (Select opens with the selected
   * option active). It wins when it names an enabled option; otherwise the first selected, else the
   * first enabled.
   */
  initialActiveValue?: string | undefined;
  /** Options are being fetched (async Combobox); the list shows `copy.loading` in place of the empty message and is aria-busy. */
  loading?: boolean | undefined;
  /**
   * The whole list is inert but readable: it stays focusable (tabindex=0, aria-disabled=true), keys,
   * hover and clicks do nothing, and `disabledOpacity` dims the list once.
   */
  disabled?: boolean | undefined;
  /**
   * Field name for Form collection. The submitted value is a string in single-select and an array
   * of strings with `multiple`; nothing selected submits no key.
   */
  name?: string | undefined;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value; null when the list loses focus. */
  onActiveChange?: ((value: string | null) => void) | undefined;
}
/**
 * Listbox — Design Schema, category: input.
 *
 * When to use:
 * Use a standalone Listbox when the options should stay visible: a settings picker with five to twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a Listbox.
 *
 * The root is a wrapper `div` (data-ds, data-ds-field) holding the `role="listbox"` list and the
 * error message. `id` names the list, and option ids are `${id}-option-${value}`. Keyboard and focus
 * handlers sit on the wrapper, so a host (Select) may dispatch `keydown`/`focusin` on the ref.
 */
export declare function Listbox({ ref, label, labelledBy, options, multiple, value, defaultValue, selectionFollowsFocus, required, invalid, error, embedded, initialActiveValue, loading, disabled, name, emptyMessage, maxVisible, overrides, onChange, onActiveChange, onBlur, onFocus, onKeyDown, id: idProp, ...rest }: ListboxProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Select.d.ts
type SelectValue = string | string[];
type SelectNative = "auto" | "always" | "never";
type SelectSize = "sm" | "md";
/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight` and `helperSize` reach only the composed Text parts' own `overrides`
 * (no --ds-select-* hook); `fontFamily`, `fontSize`, `fontWeight` and `lineHeight` are forwarded
 * into the composed parts as the schema lists, and keep a root hook for the native <select>.
 */
type SelectOverridableBinding = "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerGap" | "chevronReserve" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "disabledOpacity" | "enter";
interface SelectProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "onChange" | "children" | "className" | "style" | "role" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-haspopup" | "aria-expanded" | "aria-controls" | "aria-labelledby" | "aria-activedescendant" | "aria-disabled"> {
  /** Visible label. Always rendered. */
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
  /** sm for pickers inside toolbars and calendar headers. */
  size?: SelectSize | undefined;
  /**
   * Controlled popup state, for programmatic opening and for stories and tests (the Keyboard story
   * renders it open). Omit for the trigger-driven default.
   */
  open?: boolean | undefined;
  /**
   * Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the
   * popup stays open while toggling and closes on Escape or outside click.
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
   * Use the platform's own picker instead of the popup Listbox: `auto` means never on web (the
   * styled popup) and always on native phones (the OS wheel/dialog is what users expect); `always`
   * forces a native <select> on web too (forms that must work without JS); `never` forces the popup
   * everywhere.
   */
  native?: SelectNative | undefined;
  /** Portal target for the popup. Defaults to `document.body`. A platform prop, not a schema prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Select — Design Schema, category: input. The APG select-only combobox.
 *
 * When to use:
 * Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.
 */
export declare function Select({ ref, label, name, options, value, defaultValue, placeholder, hideLabel, size, open: openProp, multiple, description, required, disabled, invalid, error, native, container, overrides, onChange, onOpenChange, id: idProp, onClick: onClickProp, onKeyDown: onKeyDownProp, onFocus, onBlur, ...rest }: SelectProps & {
  ref?: Ref<HTMLButtonElement | HTMLSelectElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Combobox.d.ts
/** The selected value, or with `multiple` every selected value. */
type ComboboxValue = string | string[];
type ComboboxFilter = "startsWith" | "contains" | "none" | "async";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ComboboxOverridableBinding = "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
interface ComboboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "onChange" | "children" | "className" | "style" | "role" | "autoComplete" | "aria-autocomplete" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-haspopup" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "aria-disabled"> {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxItem[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue | undefined;
  /** Initial value(s). */
  defaultValue?: ComboboxValue | undefined;
  /** Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default. */
  open?: boolean | undefined;
  /** Controlled text of the input (what the user has typed). Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /**
   * Pick many: selected options appear as chips before the input, each removable; the list stays
   * open while toggling; Backspace in an empty input removes the last chip. Uses the same Listbox
   * engine as Select.
   */
  multiple?: boolean | undefined;
  /**
   * Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma
   * commits it; the list shows `copy.addCustom` as a synthetic first row, suppressed when the
   * trimmed text already matches an existing option by either its `value` or its `label`.
   * Committing text that matches an option that way (Enter or a comma, same case- and
   * diacritic-insensitive match) commits that option's `value`, never a custom string. If the
   * matching option is disabled, the row stays suppressed and the commit does nothing (neither the
   * disabled value nor a custom string). With `multiple`, text matching an already-selected option
   * leaves it selected (no `onChange`, unlike Enter on its row, which toggles) and clears the text.
   * A comma typed when there is nothing to commit (empty text, or only a disabled match) is dropped
   * and the text before it kept.
   */
  allowCustom?: boolean | undefined;
  /**
   * How typing narrows `options`: by prefix, by substring (default), not at all (the list is a
   * picker; typing is type-ahead — it opens the list and moves the active option to the first label
   * starting with the typed characters, without filtering), or by the consumer (`async`: the
   * component shows `copy.loading` and the consumer updates `options` from `onInputChange`).
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
  /** Portal target for the popup. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /**
   * Fired on every text change the user causes — each keystroke, and the text a commit, Escape-to-clear
   * or the clear button leaves behind (so `async` consumers can reset) — with the input text. Not fired
   * when a controlled `value` change rewrites the label, nor when a commit, Escape or the clear button
   * leaves the text unchanged. The hook for `async` filtering.
   */
  onInputChange?: ((value: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * Combobox — Design Schema, category: input.
 *
 * When to use:
 * Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.
 */
export declare function Combobox({ ref, label, name, options, value, defaultValue, open: openProp, inputValue, multiple, allowCustom, filter, placeholder, description, required, disabled, invalid, error, loading, clearable, container, overrides, onChange, onInputChange, onOpenChange, onKeyDown, onClick, onBlur, id: idProp, readOnly, ...rest }: ComboboxProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}): ReactElement;
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
 * Why a section's open state changed: `trigger` (activated by pointer), `keyboard` (toggled from the keyboard, as
 * Disclosure reports it), `exclusive` (another section opened and closed this one), `controlled` (the `value` prop
 * changed to a set the accordion did not itself just emit).
 */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type AccordionOverridableBinding = "divider" | "dividerWidth" | "itemGap" | "triggerPaddingBlock" | "fontFamily" | "triggerFontSize" | "triggerFontWeight";
interface AccordionProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange" | "defaultValue" | "className" | "style"> {
  /**
   * The sections in order. `content` is the panel body; on Lit it is dropped from the item type and the body is a
   * light-DOM child slotted by the item id (`<div slot="faq-1">`).
   */
  items: AccordionItem[];
  /** Heading level for every trigger, so sections appear in the page outline. */
  headingLevel?: AccordionHeadingLevel | undefined;
  /**
   * Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a
   * common frustration. Turning it on while several sections are open trims the open set to the first open id
   * without firing any event (the same as several ids in `value`/`defaultValue`).
   */
  exclusive?: boolean | undefined;
  /**
   * Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty
   * string means nothing is open. Events always report an array, with zero or one entry when `exclusive`.
   */
  value?: string | string[] | undefined;
  /** Initially open ids; the same shapes as `value`. */
  defaultValue?: string | string[] | undefined;
  /** A hairline between items. */
  divided?: boolean | undefined;
  /** Passed to every Disclosure; required when panels contain form fields. */
  keepMounted?: boolean | undefined;
  /**
   * Per-instance style overrides. `itemGap` sets the root hook; the trigger bindings are forwarded to each composed
   * Disclosure's `overrides`, `divider`/`dividerWidth` to each Divider's `color`/`thickness`.
   */
  overrides?: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where
   * it carries zero or one entry.
   */
  onChange?: ((openIds: string[]) => void) | undefined;
  /**
   * Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content,
   * or scrolling the opened section into view; `onChange` remains the set-level event for state.
   */
  onOpenChange?: ((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined;
}
/**
 * Accordion — Design Schema, category: container.
 *
 * When to use:
 * Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a
 * settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page
 * outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose
 * one plan to see details").
 *
 * Each item is a Disclosure (the `item` part is its root, a direct child of this `<div>`); Dividers sit between them.
 */
export declare function Accordion({ ref, items, headingLevel, exclusive, value, defaultValue, divided, keepMounted, overrides, onChange, onOpenChange, onKeyDown, ...rest }: AccordionProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Slider.d.ts
/** Where the value text appears. */
type SliderShowValue = "always" | "hover" | "never";
/** A single value, or the low and high values of a range. */
type SliderValue = number | [number, number];
/** One tick mark on the track, optionally labelled. */
type SliderMark = {
  value: number;
  label?: string | undefined;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "haloSpread" | "mark" | "markSize" | "markLabelSize" | "markLabelGap" | "valueSize" | "bubblePaddingBlock" | "bubblePaddingInline" | "bubbleOffset" | "bubbleRadius" | "labelWeight" | "partGap" | "labelGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "disabledOpacity" | "transition";
interface SliderProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange" | "className" | "style"> {
  /** Visible label naming the quantity ("Volume", "Price range"). */
  label: string;
  /** Field name for the Form. A single value registers as its decimal string, a range as two strings. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  step?: number | undefined;
  /** With `marks`, snap drag and click to the marks instead of `step` (arrow keys still move by step; PageUp/Down go to the next mark, and past the last mark to `max`/`min`). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default to submit (`copy.required`). */
  required?: boolean | undefined;
  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  invalid?: boolean | undefined;
  /** Controlled value; for a range, a two-number array. */
  value?: number | [number, number] | undefined;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  defaultValue?: number | [number, number] | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  range?: boolean | undefined;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  formatValue?: ((value: number) => string) | undefined;
  /** Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it). */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. */
  marks?: {
    value: number;
    label?: string | undefined;
  }[] | undefined;
  /** Not adjustable, still readable: thumbs stay focusable but pointer and keys are ignored, and no value is submitted. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or composed Text override) to that token. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or with keys (number or pair); only when the value actually changed. */
  onChange?: ((value: number | [number, number]) => void) | undefined;
  /** Fired once when the interaction ends (pointer up, key released), and only if that interaction changed the value. */
  onChangeEnd?: ((value: number | [number, number]) => void) | undefined;
}
/**
 * Slider — a bounded numeric value, or a range, chosen by dragging a thumb or with the keyboard.
 *
 * When to use:
 * Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.
 */
export declare function Slider({ ref, label, name, min, max, step, snapToMarks, required, invalid, value, defaultValue, range, formatValue, showValue, marks, disabled, description, error, overrides, onChange, onChangeEnd, id: idProp, ...rest }: SliderProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
type NumberInputSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type NumberInputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "stepperGap" | "stepperDivider" | "stepperDividerWidth" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
interface NumberInputProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "min" | "max" | "step" | "required" | "size" | "disabled" | "onChange" | "inputMode" | "role" | "autoComplete" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax" | "aria-valuetext" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-disabled" | "className" | "style" | "children"> {
  /** Visible label. */
  label: string;
  /** Field name for the Form. The value registers as its plain decimal string (`String(value)`);
   * an empty or disabled field registers nothing. Consumers parse it back with `Number()`. */
  name: string;
  /** Controlled numeric value: `null` is a controlled empty field, `undefined` means uncontrolled
   * (defaultValue applies). While focused the input shows the raw typed text; the value takes over
   * the display on blur/Enter, on every step, and when the prop changes to a different number. */
  value?: number | null | undefined;
  /** Initial value. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons and arrow keys. When `precision` is omitted, values round to the
   * number of decimals in `step`; values never snap to multiples of `step`. */
  step?: number | undefined;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via Intl.NumberFormat: thousands separators, currency
   * symbol (`currency` prop), percent, or a unit (`unit` prop). The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour). A string Intl does not know is
   * shown as `trailingText` (the `suffix` part) when `trailingText` is not given, with plain decimal formatting. */
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
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after
   * clamping/rounding), with the number or undefined. */
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
export declare function NumberInput({ ref, label, name, value, defaultValue, min, max, step, precision, format, currency, unit, leadingText, trailingText, hideSteppers, placeholder, description, required, hideLabel, size, disabled, invalid, error, overrides, onChange, readOnly, onKeyDown, onBlur, id: idProp, ...rest }: NumberInputProps & {
  ref?: Ref<HTMLInputElement> | undefined;
}): ReactElement;
//#endregion
//#region src/ProgressBar.d.ts
type ProgressBarTone = "neutral" | "success" | "danger";
type ProgressBarAnnounce = "none" | "milestones" | "complete";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition" | "indeterminateLoop" | "sweepEasing";
type ProgressBarOverrides = Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>;
interface ProgressBarProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "className" | "style" | "tabIndex"> {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`. */
  label: string;
  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the end is
   * unknown). Clamped to `min`…`max` for the fill, the accessible value, `formatValue`'s argument and the
   * announcement tiers; a non-finite number (NaN, Infinity) is treated as `min`.
   */
  value?: number | null | undefined;
  /** Start of the range. A non-finite number is treated as the default, 0. */
  min?: number | undefined;
  /** End of the range. A non-finite number is treated as the default, 100. */
  max?: number | undefined;
  /**
   * Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range —
   * `(value − min) / (max − min)`, the same arithmetic the fill uses, so a non-zero `min` reads correctly
   * without a custom formatter — rounded to a whole number in the runtime's default locale (there is no locale
   * prop), so 99.5% of the way shows "100%" before completion; completion is only the clamped value reaching
   * `max`. Called with the clamped value. Rounding is for the text only; the fill uses the exact fraction.
   * A `max` at or below `min` is not a range: the bar renders empty, exposes `min` as its value with the given
   * bounds, shows and exposes "0%" unless a custom formatter says otherwise, makes no progress or completion
   * announcements, and warns in development.
   */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text at the end of the label row. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /**
   * Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already
   * says what is happening. The value text, when shown, stays at the inline end of the row; when there is no
   * visible value text either, the label row takes no space and `partGap` is not applied.
   */
  hideLabel?: boolean | undefined;
  /**
   * Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a
   * text status elsewhere: the color is never the only signal.
   */
  tone?: ProgressBarTone | undefined;
  /**
   * What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each
   * announcement uses `copy.progress` / `copy.complete`, and `copy.indeterminate` is announced once each time
   * the bar enters the indeterminate state. A value that moves backward resets the tiers already announced,
   * so a retried task announces its progress again on the way up.
   */
  announce?: ProgressBarAnnounce | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: ProgressBarOverrides | undefined;
}
/**
 * ProgressBar — Design Schema, category: feedback.
 *
 * When to use:
 * Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads,
 * imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is
 * known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones`
 * for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a
 * minute.
 */
export declare function ProgressBar({ ref, label, value, min, max, formatValue, showValue, hideLabel, tone, announce, overrides, ...rest }: ProgressBarProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Stepper.d.ts
type StepperStepStatus = "complete" | "current" | "upcoming" | "error";
/** One step of the flow. */
type StepperStep = {
  id: string;
  label: string;
  description?: string;
  status?: "complete" | "current" | "upcoming" | "error";
};
type StepperOrientation = "horizontal" | "vertical";
type StepperNavigable = "none" | "completed" | "all";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorRadius" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "countSize" | "stepHover" | "stepRadius" | "stepPadding" | "stepGap" | "partGap" | "fontFamily" | "transition";
interface StepperProps extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label" | "className" | "style"> {
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /**
   * The steps in order. `status` is derived from `current` when omitted: before it complete, the step it
   * names current, after it upcoming. An explicit `status` sets only the indicator, its colours and the
   * status word; position (not status) decides the selected state, navigability, the connector colour and
   * the compact reveal.
   */
  steps: {
    id: string;
    label: string;
    description?: string;
    status?: "complete" | "current" | "upcoming" | "error";
  }[];
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
/**
 * Stepper — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).
 */
export declare function Stepper({ ref, label, steps, current, orientation, navigable, compact, overrides, onStepSelect, ...rest }: StepperProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Search.d.ts
type SearchSize = "md" | "lg";
/** One suggestion row: `label` (plus optional `description`) is what the Listbox shows and what fills the query. */
interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type SearchOverridableBinding = "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupRadius" | "popupShadow" | "layer" | "partGap" | "labelWeight" | "disabledOpacity";
interface SearchProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "size" | "value" | "defaultValue" | "placeholder" | "disabled" | "readOnly" | "onChange" | "onSubmit" | "children" | "className" | "style" | "role" | "autoComplete" | "enterKeyHint" | "aria-autocomplete" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "aria-disabled"> {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /** Field name; the query key when the form submits to a URL. */
  name?: string | undefined;
  /**
   * Controlled query. When set, it is the query everything reads: submit, a chosen suggestion, the
   * clear button and the Form value all use this prop, never stale typed text; clearing reports
   * onChange("") and the field empties when the caller passes the new value.
   */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /**
   * URL to submit to with GET; when omitted, `onSubmit` handles it and nothing navigates. The URL
   * carries the same trimmed query `onSubmit` receives: the visible input carries no `name`, and a
   * hidden input named `name` is set to the trimmed query (the controlled value or chosen label,
   * never stale DOM text) in the submit handler. Ignored, with a development warning, when Search
   * sits inside a Form component: the enclosing Form owns submission.
   */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one fills the
   * query with the suggestion's `label` — what the user just read — and submits. Provide them from
   * `onChange` (debounced by the caller). Setting the prop at all is what turns the field into a
   * combobox, including an explicitly empty array after a fetch that found nothing, which shows
   * `copy.noSuggestions`; leaving it undefined keeps a plain search field. The list opens on typing
   * and on ArrowDown — never on focus alone, and an array arriving while the field is focused but
   * untouched does not open it — and closes on Escape, Tab, blur to an element outside Search (a
   * blur with no new focus target, such as a window switch, does not close it), a pointer press
   * outside the field and list, a chosen suggestion, clear, and submit. ArrowDown on the last
   * suggestion stays there, as ArrowUp never wraps.
   */
  suggestions?: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /**
   * Give the field the `search` landmark. Turn off when the Search sits inside another search
   * landmark (a filter within a results page). It is `role="search"` on Search's own form element,
   * not a composed Landmark wrapping it.
   */
  landmark?: boolean | undefined;
  /** lg for a search page's hero field. */
  size?: SearchSize | undefined;
  /**
   * Not editable, still readable and focusable: the input is read-only with aria-disabled, both
   * Buttons are disabled (the clear Button still renders when there is text), every key in the
   * keyboard table is inert, suggestions never open and an open list closes, no event fires, the
   * label, glyph and input dim to `disabledOpacity` (the Buttons dim through their own style and the
   * field frame is not dimmed), and a disabled Search is not registered with (or submitted by) a Form.
   */
  disabled?: boolean | undefined;
  /** Portal target for the suggestions popup. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired on every keystroke with the query; the caller fetches suggestions here. Also fired whenever
   * Search itself changes the text: with "" before `onClear`, and with the suggestion's `label` before
   * `onSubmit` when one is chosen.
   */
  onChange?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. Never with an empty query. */
  onSubmit?: ((value: string) => void) | undefined;
  /** Fired when the field is emptied — by the clear button, or by the Escape that clears it when no suggestions are open. */
  onClear?: (() => void) | undefined;
}
/**
 * Search — Design Schema, category: input.
 *
 * When to use:
 * Use Search for free-text search over a site, an app, or a large dataset: the header search, a search page's main field, a "filter the list" field over more than a couple of dozen rows. Add `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for the one primary search so screen-reader users can jump to it.
 *
 * The root is a `<form>` (role="search" while `landmark`); inside a Form component it is a `<div>`
 * so no form nests in a form, and Search handles Enter and its submit Button itself.
 */
export declare function Search({ ref, label, showLabel, name, value, defaultValue, placeholder, action, suggestions, loading, landmark, size, disabled, container, overrides, onChange, onSubmit, onClear, onKeyDown, id: idProp, ...rest }: SearchProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
//#endregion
//#region src/DatePicker.d.ts
/** A range value: two ISO calendar dates. */
type DatePickerRangeValue = {
  start: string;
  end: string;
};
/** An ISO calendar date (`2026-09-10`), or a range of them. Never a Date object. */
type DatePickerValue = string | DatePickerRangeValue;
type DatePickerSize = "sm" | "md";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type DatePickerOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "fontSize" | "calendarInset" | "calendarGap" | "headerGap" | "footerGap" | "dayGap" | "dayRadius" | "dayHover" | "weekdaySize" | "weekdayWeight" | "weekNumberSize" | "weekNumberWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "disabledOpacity" | "transition";
interface DatePickerProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "name" | "value" | "defaultValue" | "placeholder" | "min" | "max" | "required" | "disabled" | "size" | "onChange" | "inputMode" | "autoComplete" | "readOnly" | "aria-describedby" | "aria-invalid" | "aria-required" | "aria-disabled" | "className" | "style" | "children"> {
  /** Visible label ("Start date", "Date of birth"). */
  label: string;
  /**
   * Field name for the Form. The value is an ISO calendar date string (`2026-09-10`) or, for a
   * range, `{ start, end }` of them in `value` and `onChange`. The Form holds strings only, so a
   * range registers two fields, `name` (start) and `name-end` (end). Never a Date object: a
   * calendar date has no time zone.
   */
  name: string;
  /**
   * Controlled value (ISO date, or a range). Pass `''` for a controlled empty field; `undefined`
   * means uncontrolled. In a range the first pick is an internal draft shown only in the calendar:
   * `value` and the inputs keep showing the old value until the end is picked, then onChange
   * reports the range and the field returns to `value`.
   */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and tests. Omit for the
   * button-driven default. Every change to open, by the user or by the parent, aims the calendar at
   * the value's month (or today's) and focuses the selected day (or today).
   */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /**
   * Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are
   * skipped by the Arrow keys (moving on in the same direction to the next enabled day, turning
   * pages, and staying put when none is left before min/max); Home, End, PageUp and PageDown land on
   * the computed day even when it is disabled. A disabled day can take focus but not be selected.
   */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /**
   * BCP 47 locale for month and weekday names, the first day of the week, and the typed format.
   * Defaults to `document.documentElement.lang` when set, then the
   * `Intl.DateTimeFormat().resolvedOptions().locale` default. The typed pattern comes from
   * `formatToParts` with 2-digit month and day and a numeric year, so en-US is MM/DD/YYYY.
   */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /**
   * Visually hide the label (it remains the accessible name). Only for a field whose context already
   * names it: a DataGrid cell editor, a Search. Hidden with the visually-hidden clip pattern.
   */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type (`fontSize` at font.size.sm). */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Portal target for the calendar. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with undefined when cleared. */
  onChange?: ((value: string | {
    start: string;
    end: string;
  } | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}
/**
 * DatePicker — Design Schema, category: input.
 *
 * When to use:
 * Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is
 * faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever they
 * exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is possible
 * instead of validating after the fact.
 *
 * The root (`data-ds="DatePicker"`, and `ref`) wraps the label, field and error; the calendar is a
 * non-modal Popover portaled to `container`.
 */
export declare function DatePicker({ ref, label, name, value, defaultValue, open: openProp, range, min, max, isDateDisabled, locale: localeProp, showWeekNumbers, placeholder, description, required, hideLabel, size, disabled, error, container, overrides, onChange, onOpenChange, id: idProp, onKeyDown, onBlur, ...rest }: DatePickerProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Toolbar.d.ts
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarOverflow = "wrap" | "menu" | "scroll";
type ToolbarSize = "sm" | "md";
type ToolbarDensity = "compact" | "comfortable";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "groupGap" | "separatorLength" | "fadeWidth";
interface ToolbarGroupProps extends Omit<ComponentPropsWithoutRef<"div">, "role" | "className" | "style"> {
  /** The group's accessible name; also its heading when the group collapses into the "More" Menu. */
  label?: string | undefined;
  /** The group's controls, in order. */
  children: ReactNode;
}
/** Groups related controls inside a Toolbar; a Divider is drawn between adjacent groups. */
export declare function ToolbarGroup({ ref, label, children, ...rest }: ToolbarGroupProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
interface ToolbarProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-label" | "aria-orientation" | "className" | "style"> {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is drawn
   * between two adjacent groups only (a bare control next to a group gets `itemGap`, no Divider).
   * Consumers never place Dividers themselves.
   */
  children: ReactNode;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: wrap onto more rows, collapse trailing controls into a
   * "More" Menu (each collapsible control must provide `overflowLabel`), or scroll horizontally with
   * the edges faded. Collapsing takes whole entries from the end — a group goes into the Menu as a
   * group, never half of one — and the width budget reserves `size.target.min` for the More trigger
   * before it is rendered. `menu` is for horizontal toolbars; a vertical one treats it as `scroll`,
   * since a menu overflow assumes a fixed cross axis. An entry collapses only if every control in it
   * is a Button: walking from the end, an entry holding any other control is skipped and stays
   * visible. Collapsed controls are removed from the render and from the roving list.
   */
  overflow?: ToolbarOverflow | undefined;
  /**
   * Default for the child controls that have a `size` prop — Button, SegmentedControl, Select and
   * Search, recognised by component identity — and do not set their own. Applied to direct children
   * and to the children of each ToolbarGroup; a child's own `size` wins. The overflow Menu's trigger
   * takes no size.
   */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
}
/**
 * Toolbar — Design Schema, category: navigation (APG toolbar).
 *
 * When to use:
 * Use a Toolbar for controls that act on the same thing and are used together: text formatting, a
 * table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose
 * with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose
 * width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a
 * menu item.
 */
export declare function Toolbar({ ref, label, children, orientation, overflow, size, density, overrides, onFocus, onKeyDown, ...rest }: ToolbarProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Carousel.d.ts
type CarouselPicker = "dots" | "tabs" | "none";
type CarouselChangeReason = "next" | "prev" | "picker" | "swipe" | "autoplay";
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlRadius" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotRadius" | "radius" | "tabFontSize" | "tabFontWeight" | "tabLineHeight" | "tabPaddingBlock" | "tabPaddingInline" | "fontFamily" | "transition";
interface CarouselSlideProps extends Omit<ComponentPropsWithoutRef<"div">, "role" | "aria-label" | "className" | "style" | "id" | "children"> {
  /**
   * The slide's name in the tabs picker. A plain string, not read from the rendered content; repeat
   * it visibly as the slide's own heading.
   */
  label: string;
  /** The slide's content; a Card is the usual shape. */
  children: ReactNode;
}
/** One slide — a direct child of `Carousel`, one per slide, in order. */
export declare function CarouselSlide({ ref, label: _label, children, ...rest }: CarouselSlideProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
interface CarouselProps extends Omit<ComponentPropsWithoutRef<"section">, "children" | "aria-label" | "onChange" | "role" | "className" | "style"> {
  /** What the carousel shows ("Featured products", "Customer stories"). */
  label: string;
  /** One `CarouselSlide` per slide. A slide is any content; a Card is the usual shape. Slides should be equal height. */
  children: ReactNode;
  /**
   * How many slides are visible at once at the widest layout. The page size is `perView` while the
   * viewport's own width is above `layout.maxWidth.prose` and 1 at or below it.
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
  /**
   * Milliseconds between automatic advances; values below 5000 are raised to 5000 in every build,
   * with a development warning once per instance while `autoplay` is on.
   */
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
  /**
   * Fired when the current slide changes, with the new index and the reason (`next`, `prev`,
   * `picker`, `swipe`, `autoplay`). A change of a controlled `activeIndex` never fires it.
   */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
}
/**
 * Carousel — Design Schema, category: container.
 *
 * When to use:
 * Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid —
 * featured products with images, testimonials, a gallery — where paging is a reasonable way to see
 * them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots` for
 * images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even then
 * keep the pause control visible.
 */
export declare function Carousel({ ref, label, children, perView, loop, autoplay, interval, picker, activeIndex, snap, overrides, onChange, onPointerEnter, onPointerLeave, onFocus, onBlur, onTouchStart, onTouchEnd, onTouchCancel, ...rest }: CarouselProps & {
  ref?: Ref<HTMLElement> | undefined;
}): ReactElement;
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
/** A data row. `id` must be stable; it is what selection and keys use. */
type TableRow = {
  id: string;
  [key: string]: unknown;
};
/** Sort state: the column key and its direction. */
type TableSortState = {
  column: string;
  direction: TableSortDirection;
};
/** One column definition, in display order. */
type TableColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  width?: TableColumnWidth;
  isRowHeader?: boolean;
  hideBelow?: TableColumnHideBelow;
  render?: (row: TableRow) => ReactNode;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "cellPaddingInline" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedBlockGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
type TableOverrides = Partial<Record<TableOverridableBinding, TokenRef | undefined>>;
interface TableProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name; visually hidden with `hideCaption` when a Heading directly above already says it. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is captionSize regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /** Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font: a string footer renders in Text with the `fontFamily`/`fontSize`/`lineHeight` bindings; other content brings its own typography. */
  footer?: ReactNode;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions in display order. `header` is the visible heading; `align: end` for numbers; `sortable` adds the sort button; exactly one column may be `isRowHeader`; `hideBelow` drops a column below a layout width; `render` formats the cell. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts the data (so server-side sorting works the same way). */
  sort?: TableSortState | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself by the column value (localeCompare for strings, numeric otherwise). */
  defaultSort?: TableSortState | undefined;
  /** Adds a first column of Checkboxes (radio-like behavior for `single`) and a select-all in the header for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally inside a labelled region with the row-header column sticky. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls (the page, or `maxHeight`). */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height minus two `layout.gap.section` and scrolls a frame around the table (the scroll region itself in `responsive: scroll`); `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: layout.inset.sm or layout.inset.md. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. Useful past about eight columns; borders are the default row separator. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: aria-busy is set on the table and `copy.loading` shows — with no rows, in the emptyState; with rows, as muted Text in a polite live region below the table. Existing rows stay visible while re-sorting. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell: Buttons (ghost, sm, iconOnly with Tooltip) or a Menu. */
  rowActions?: ((row: TableRow) => ReactNode) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: TableOverrides | undefined;
  /** Fired when a sortable header is activated (ascending → descending on the same column, ascending on a new one). */
  onSortChange?: ((column: string, direction: TableSortDirection) => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated, with its id. The row-header cell becomes a Button and the row is styled interactive. */
  onRowPress?: ((id: string) => void) | undefined;
}
/**
 * Table — Design Schema, category: data.
 *
 * When to use:
 * Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.
 */
export declare function Table({ ref, caption, captionLevel, footer, hideCaption, columns, data, sort, defaultSort, selectable, selected, defaultSelected, responsive, stickyHeader, maxHeight, density, striped, emptyMessage, loading, rowActions, overrides, onSortChange, onSelectionChange, onRowPress, ...rest }: TableProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/DataGrid.d.ts
type DataGridSelectable = "none" | "row" | "cell" | "range";
type DataGridDensity = "compact" | "comfortable";
type DataGridHeight = "content" | "viewport" | "fixed";
/** Heading level of the caption. Accepts the schema's string values and their numeric equivalents. */
type DataGridCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
type DataGridSortDirection = "ascending" | "descending";
type DataGridColumnAlign = "start" | "end" | "center";
type DataGridColumnPinned = "start" | "end";
type DataGridEditorKind = "text" | "number" | "select" | "date" | "checkbox";
/** A row. `id` must be stable. */
type DataGridRow = {
  id: string;
  [key: string]: unknown;
};
/** `{ column: string; direction: "ascending" | "descending" }` */
interface DataGridSortState {
  column: string;
  direction: DataGridSortDirection;
}
interface DataGridColumnOption {
  value: string;
  label: string;
}
/** One entry of `columns`, in display order. */
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
/** Row ids, one cell, or a range, matching `selectable`. */
type DataGridSelection = string[] | DataGridCellRef | DataGridRangeRef;
/** A committed or previous cell value, as the column editor produces it. */
type DataGridCellValue = string | number | boolean;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are locked. */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHover" | "cellPaddingInline" | "columnWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "resizeStep" | "statusBarSize" | "statusBarPadding" | "statusBarGap" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
interface DataGridProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is captionSize regardless, as Table. */
  captionLevel?: DataGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Table's column model plus grid concerns: pixel `width` (the columnWidth binding when omitted), `resizable`, `pinned`
   * columns (contiguous at the start or end), `editable` with an `editor` kind and `validate`. Exactly
   * one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount;
   * `onRangeNeeded` asks for more. `data` is always a contiguous prefix starting at row 0. */
  rowCount?: number | undefined;
  /** Controlled sort state; as Table. */
  sort?: DataGridSortState | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSortState | undefined;
  /** `row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects the focused cell;
   * `range` allows Shift+arrow / pointer-drag rectangles (copy as TSV). */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited with Enter, F2, typing, or double-click. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized. */
  stickyHeader?: boolean | undefined;
  /** `viewport` sets the grid height to `100vh − 2 × layout.gap.section`; `content` grows with rows
   * (no virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for the composed Select and DatePicker editors (default `document.body`). Platform prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides; each entry sets the matching `--ds-data-grid-*` hook to that token. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** As Table. */
  onSortChange?: ((column: string, direction: DataGridSortDirection) => void) | undefined;
  /** Fired with the selection: row ids, one cell `{ rowId, column }`, or a range `{ from, to }`. */
  onSelectionChange?: ((selection: DataGridSelection) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: DataGridCellValue | undefined, previous: DataGridCellValue | undefined) => void) | undefined;
  /** Fired when an editor opens; return false to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired when the visible window comes within one page of the end of `data` and `rowCount` says there is more. */
  onRangeNeeded?: ((start: number, end: number) => void) | undefined;
  /** Fired when the user finishes resizing a resizable column. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
}
/**
 * DataGrid — Design Schema, category: data. APG grid built from `<div>`s with explicit roles.
 *
 * When to use: Use a DataGrid when people navigate cell by cell, edit values in place, select ranges,
 * or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets,
 * admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and
 * mark the columns that may change; give every editable column a `validate`. Use `height: viewport`
 * (the default) so the grid, not the page, scrolls.
 */
export declare function DataGrid({ ref, caption, captionLevel, hideCaption, columns, data, rowCount, sort, defaultSort, selectable, selected, editable, density, stickyHeader, height, loading, emptyMessage, showStatusBar, container, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onRangeNeeded, onColumnResize, ...rest }: DataGridProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/TreeGrid.d.ts
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
/** Heading level of the caption. Accepts the schema's string values and their numeric equivalents. */
type TreeGridCaptionLevel = "2" | "3" | "4" | 2 | 3 | 4;
type TreeGridSortDirection = "ascending" | "descending";
/** A row's children: a loaded subtree, or `"lazy"` (loaded on expand through `onExpand`). */
type TreeGridChildren = TreeGridRow[] | "lazy";
/** `TreeRow = { id: string; children?: TreeRow[] | "lazy"; [key: string]: unknown }` */
interface TreeGridRow {
  id: string;
  children?: TreeGridChildren | undefined;
  [key: string]: unknown;
}
/** `{ column: string; direction: "ascending" | "descending" }` */
interface TreeGridSortState {
  column: string;
  direction: TreeGridSortDirection;
}
type TreeGridCellRef = {
  rowId: string;
  column: string;
};
/** Row ids, or one cell, matching `selectable`. */
type TreeGridSelection = string[] | TreeGridCellRef;
/** A committed or previous cell value, as the column editor produces it. */
type TreeGridCellValue = string | number | boolean;
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are locked. */
type TreeGridOverridableBinding = "indent" | "expandGap" | "guideLine" | "cellPaddingInline" | "fixedHeight" | "guideLineWidth" | "parentWeight" | "transition";
interface TreeGridProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** What the tree grid holds ("Chart of accounts"). The accessible name. */
  caption: string;
  /** As DataGrid: the caption's heading level in the page outline; its size does not change with it. */
  captionLevel?: TreeGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required here: it carries the indent and the expand
   * button, so it must exist and come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row whose children are loaded on expand through `onExpand`; the row
   * shows the expand button and a loading state until `data` is updated. `children: []` is a leaf (no expand
   * button, no aria-expanded). */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every row whose `children` is a non-empty array, including rows
   * loaded later, and never a `"lazy"` row (that would fire onExpand without a user act); `"*"` is honoured the
   * same way in controlled `expanded`, and the first user toggle resolves it to concrete ids, which is what
   * onExpandChange reports. A lazy id listed explicitly stays collapsed until the user opens it. */
  defaultExpanded?: string[] | undefined;
  /** Sort applies within each level; siblings are ordered, hierarchy is kept. */
  sort?: TreeGridSortState | undefined;
  /** As DataGrid. */
  defaultSort?: TreeGridSortState | undefined;
  /** As DataGrid without `range` (rectangles across levels are not meaningful). `row` selection of a parent does
   * not select its children unless `selectChildren`. Select-all covers every loaded row at every level. */
  selectable?: TreeGridSelectable | undefined;
  /** As DataGrid. */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a parent row sets or clears its own id and every loaded descendant; a parent's shown state is
   * derived from its loaded descendants (checked when all, even if its own id is absent; indeterminate when
   * some; else its own id), and an indeterminate row reports aria-selected="false". Space, Enter on the select
   * cell, a click on its Checkbox and Ctrl/Cmd+click all cascade; only Shift+Space and Shift+click ranges do
   * not. A `"lazy"` subtree contributes nothing until loaded. */
  selectChildren?: boolean | undefined;
  /** As DataGrid. */
  editable?: boolean | undefined;
  /** As DataGrid. */
  density?: TreeGridDensity | undefined;
  /** As DataGrid. */
  height?: TreeGridHeight | undefined;
  /** As DataGrid. */
  loading?: boolean | undefined;
  /** As DataGrid. */
  showStatusBar?: boolean | undefined;
  /** As DataGrid. */
  stickyHeader?: boolean | undefined;
  /** As DataGrid. */
  emptyMessage?: string | undefined;
  /** Portal target for the composed Select and DatePicker editors (default `document.body`). Platform prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides; each entry sets the matching `--ds-tree-grid-*` hook to that token. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids (the bare array, as Tree; not wrapped in an object). */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id (bare string) each time a row whose `children` is still `"lazy"` is expanded, so a failed
   * load can retry; once the caller replaces `children` it never fires again for that row. It fires before the
   * onExpandChange of the same act. */
  onExpand?: ((id: string) => void) | undefined;
  /** As DataGrid. */
  onSortChange?: ((column: string, direction: TreeGridSortDirection) => void) | undefined;
  /** As DataGrid (row ids or one cell). */
  onSelectionChange?: ((selection: TreeGridSelection) => void) | undefined;
  /** As DataGrid. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: TreeGridCellValue | undefined, previous: TreeGridCellValue | undefined) => void) | undefined;
  /** As DataGrid; return false to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** As DataGrid. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
}
/**
 * TreeGrid — Design Schema, category: data. APG treegrid built on DataGrid's structure.
 *
 * When to use: Use a TreeGrid when records nest and each record has several comparable fields: a chart of
 * accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs,
 * an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use
 * `selectChildren` when selection means "this and everything in it" (a folder to export).
 */
export declare function TreeGrid({ ref, caption, captionLevel, hideCaption, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable, selected, defaultSelected, selectChildren, editable, density, height, loading, showStatusBar, stickyHeader, emptyMessage, container, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize, ...rest }: TreeGridProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Tree.d.ts
type TreeSelectable = "none" | "single" | "multiple";
/** Heading level of the visible label. Accepts the schema's string values and their numeric equivalents. */
type TreeHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
/** A node's children: a loaded subtree, or `"lazy"` (loaded on first expand through `onExpand`). */
type TreeNodeChildren = TreeNode[] | "lazy";
/** `TreeNode = { id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | "lazy" }` */
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
 * Style bindings that can be overridden per instance; the accessibility-bearing bindings (rowHeight,
 * rowSelected, rowSelectedBorder, rowSelectedBorderWidth, labelColor, iconColor, badgeColor,
 * expandButtonSize, checkboxBorder, checkboxSelected, checkboxMark, minTarget, focusRing,
 * focusRingWidth) are locked and not in this union. `labelSelectedWeight`, `headingSize` and
 * `badgeSize` are forwarded to the composed Text / Heading `overrides` rather than set as hooks.
 */
type TreeOverridableBinding = "indent" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBorderWidth" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
interface TreeProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  label: string;
  /** Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label). */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is headingSize regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /**
   * The hierarchy. `href` makes a node's label a Link (navigation trees); `icon` is an Icon glyph
   * (`folder` and `file` exist for the usual case); `badge` is a short trailing count or status;
   * `children: "lazy"` loads on first expand through `onExpand`.
   */
  nodes: TreeNode[];
  /**
   * Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in
   * `defaultExpanded` — the id stays in the array the caller passed and in what onExpandChange reports, but
   * the node does not render open and fires no onExpand.
   */
  expanded?: string[] | undefined;
  /**
   * Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a
   * `"lazy"` node; `"*"` is reserved as that sentinel, so a node whose id is literally `"*"` is never matched
   * by it. A lazy id listed explicitly stays closed until the user opens it (onExpand only fires for user
   * acts), and the same rule covers the controlled `expanded`.
   */
  defaultExpanded?: string[] | undefined;
  /**
   * `single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like
   * selection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when
   * `selectChildren`. `none`: expand/collapse only.
   */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. Always an array, even in `single` mode (zero or one element). */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  selectChildren?: boolean | undefined;
  /**
   * With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).
   * Off by default: focus moves, Enter or Space selects.
   */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or composed child override) to that token. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the selected ids. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Fired with the expanded ids. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired when a lazy node is expanded for the first time, with its id. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead. */
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
export declare function Tree({ ref, label, showLabel, headingLevel, nodes, expanded, defaultExpanded, selectable, selected, defaultSelected, selectChildren, selectOnFocus, showGuides, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, ...rest }: TreeProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Splitter.d.ts
type SplitterOrientation = "horizontal" | "vertical";
type SplitterStackBelow = "prose" | "content" | "never";
/** Style bindings that can be overridden per instance; locked (accessibility-bearing) bindings are not in this union. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "gripRadius" | "collapseButtonOffset" | "transition";
interface SplitterProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style"> {
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
  /**
   * Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the
   * pane instead of clamping; otherwise it is the hard floor.
   */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key increment, percent. */
  step?: number | undefined;
  /**
   * The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator,
   * or use the collapse button. Enter again restores the last size.
   */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean | undefined;
  /**
   * When set, the size and collapsed state are remembered per user under this key so a sidebar
   * stays where it was left: localStorage on web (in try/catch).
   */
  persistKey?: string | undefined;
  /**
   * Below this width of the splitter's own box (a container query, not the viewport, so nested
   * splitters work) a horizontal splitter stacks its panes and the separator is not rendered. A
   * vertical splitter never stacks. `content` = layout.maxWidth.content, `never` = no stacking.
   */
  stackBelow?: SplitterStackBelow | undefined;
  /** Per-instance style overrides: each entry sets the matching `--ds-splitter-*` hook to that token. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each key press, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /**
   * Fired with the final size once when a drag ends and after each key press (a key press is a
   * complete interaction), so a caller can persist on it.
   */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}
/**
 * Splitter — Design Schema, category: layout. APG window splitter.
 *
 * When to use:
 * Use a Splitter when two regions compete for space and the right split depends on the task: a
 * navigation tree beside content, a list beside a detail view, a code editor beside its output, a
 * map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible
 * `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.
 */
export declare function Splitter({ ref, label, orientation, primary, secondary, size, defaultSize, minSize, maxSize, step, collapsible, collapsed, defaultCollapsed, persistKey, stackBelow, overrides, onSizeChange, onSizeChangeEnd, onCollapseChange, onKeyDown, ...rest }: SplitterProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}): ReactElement;
//#endregion
//#region src/Feed.d.ts
/** Accepts the schema's string values and their numeric equivalents. */
type FeedHeadingLevel = "2" | "3" | "4" | 2 | 3 | 4;
type FeedItem = {
  id: string;
  heading: string;
  timestamp: string;
  content: ReactNode;
  actions?: ReactNode;
  unread?: boolean;
};
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type FeedOverridableBinding = "itemGap" | "articleInset" | "articleBodyGap" | "timestampSize" | "newItemsOffset" | "newItemsLayer" | "loadingInset" | "endMessageInset" | "endMessageSize" | "emptyStateInset" | "emptyStateSize" | "fontFamily";
interface FeedProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-label" | "aria-busy" | "className" | "style"> {
  /** What the feed contains ("Activity", "Notifications"). */
  label: string;
  /**
   * Articles, newest first. `heading` names the article (a Heading inside the Card); `timestamp` is
   * ISO and rendered relative from the copy strings, with the absolute time as its title; `unread`
   * marks items the user has not seen.
   */
  items: FeedItem[];
  /**
   * More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches,
   * and whenever `items` is empty and not `loading` — on mount and again if the caller clears `items`.
   */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  loading?: boolean | undefined;
  /**
   * Number of newer items available above (from polling or a socket). The feed does not insert
   * them — that would shift what the reader is looking at — it shows a "Show {count} new" button at
   * the top which prepends and scrolls.
   */
  newItemsCount?: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`. */
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
 * Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.
 */
export declare const Feed: ({ ref, label, items, hasMore, loading, newItemsCount, headingLevel, endMessage, onLoadMore, onShowNew, onItemVisible, overrides, onKeyDown, ...rest }: FeedProps & {
  ref?: Ref<HTMLDivElement> | undefined;
}) => ReactElement;
//#endregion
export type { AccordionHeadingLevel, AccordionItem, AccordionOpenChangeReason, AccordionOverridableBinding, AccordionProps, ActionSheetAction, ActionSheetActionTone, ActionSheetCloseReason, ActionSheetOverridableBinding, ActionSheetProps, AlertDialogCancelReason, AlertDialogOverridableBinding, AlertDialogProps, AlertDialogTone, AlertLive, AlertOverridableBinding, AlertProps, AlertTone, BottomSheetCloseReason, BottomSheetHeight, BottomSheetOverridableBinding, BottomSheetProps, BoxElement, BoxInset, BoxOverridableBinding, BoxProps, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbOverridableBinding, BreadcrumbProps, ButtonOverridableBinding, ButtonProps, ButtonSize, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardProps, CardSurface, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CarouselProps, CarouselSlideProps, CheckboxOverridableBinding, CheckboxProps, ComboboxFilter, ComboboxOverridableBinding, ComboboxProps, ComboboxValue, ContainerAlign, ContainerElement, ContainerGutter, ContainerOverridableBinding, ContainerProps, ContainerWidth, DataGridCaptionLevel, DataGridCellRef, DataGridCellValue, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridDensity, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridProps, DataGridRangeRef, DataGridRow, DataGridSelectable, DataGridSelection, DataGridSortDirection, DataGridSortState, DatePickerOverridableBinding, DatePickerProps, DatePickerRangeValue, DatePickerSize, DatePickerValue, DialogCloseReason, DialogInitialFocus, DialogOverridableBinding, DialogProps, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureProps, DisclosureToggleReason, DividerOrientation, DividerOverridableBinding, DividerProps, DividerSpacing, FeedHeadingLevel, FeedItem, FeedOverridableBinding, FeedProps, FieldsetGap, FieldsetOverridableBinding, FieldsetProps, FocusScopeAutoFocus, FocusScopeEscapeDirection, FocusScopeProps, FormContextValue, FormErrors, FormFieldRegistration, FormFieldValue, FormOverridableBinding, FormProps, FormValidateMode, FormValues, HeadingLevel, HeadingOverridableBinding, HeadingProps, HeadingSize, IconName, IconOverridableBinding, IconProps, IconSize, InputOverridableBinding, InputProps, InputSize, InputType, LandmarkElement, LandmarkProps, LandmarkRole, LinkOverridableBinding, LinkProps, LinkTone, ListboxGroup, ListboxItem, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxProps, ListboxValue, MenuAction, MenuGroup, MenuItem, MenuItemTone, MenuOpenChangeReason, MenuOverridableBinding, MenuPlacement, MenuProps, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterProps, MeterTone, NumberInputFormat, NumberInputOverridableBinding, NumberInputProps, NumberInputSize, PopoverHeadingLevel, PopoverOpenChangeReason, PopoverOverridableBinding, PopoverPlacement, PopoverProps, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarProps, ProgressBarTone, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, RadioGroupProps, SearchOverridableBinding, SearchProps, SearchSize, SearchSuggestion, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlProps, SegmentedControlSize, SelectNative, SelectOverridableBinding, SelectProps, SelectSize, SelectValue, SidePanelOpenChangeReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelProps, SidePanelRole, SidePanelSide, SidePanelWidth, SliderMark, SliderOverridableBinding, SliderProps, SliderShowValue, SliderValue, SplitterOrientation, SplitterOverridableBinding, SplitterProps, SplitterStackBelow, StackAlign, StackDirection, StackElement, StackGap, StackJustify, StackOverridableBinding, StackProps, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperProps, StepperStep, StepperStepStatus, SwitchLabelPosition, SwitchOverridableBinding, SwitchProps, TabPanelProps, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnHideBelow, TableColumnWidth, TableDensity, TableMaxHeight, TableOverridableBinding, TableProps, TableResponsive, TableRow, TableSelectable, TableSortDirection, TableSortState, TabsActivation, TabsFit, TabsItem, TabsOrientation, TabsOverridableBinding, TabsProps, TextAlign, TextElement, TextOverridableBinding, TextProps, TextSize, TextTone, TextWeight, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastProps, ToastRegionOverridableBinding, ToastRegionProps, ToastTone, ToolbarDensity, ToolbarGroupProps, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarProps, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TooltipProps, TreeGridCaptionLevel, TreeGridCellRef, TreeGridCellValue, TreeGridChildren, TreeGridDensity, TreeGridHeight, TreeGridOverridableBinding, TreeGridProps, TreeGridRow, TreeGridSelectable, TreeGridSelection, TreeGridSortDirection, TreeGridSortState, TreeHeadingLevel, TreeNode, TreeNodeChildren, TreeOverridableBinding, TreeProps, TreeSelectable };
//# sourceMappingURL=index.d.ts.map