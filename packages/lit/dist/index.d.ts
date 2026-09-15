import { CSSResult, LitElement, PropertyValues, TemplateResult, nothing } from "lit";
import { TokenRef } from "@design-schema/tokens";
//#region src/Icon.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/** Overridable style hooks; see the `overrides` property. */
type IconOverridableBinding = "size" | "color" | "strokeWidth";
export declare class DsIcon extends LitElement {
  static override styles: CSSResult;
  /**
   * Which glyph. The set is deliberately small and grows only when a component
   * needs a shape; `info`, `success`, `warning` and `danger` are the four status
   * shapes (circle-i, circle-check, triangle-!, octagon-x).
   */
  accessor name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  accessor size: IconSize;
  /** Size the glyph at 1em of the surrounding text and align it to the baseline, ignoring `size`. */
  accessor inline;
  /**
   * Accessible name. When set, the icon is meaningful and exposed as an image
   * with this name; when omitted, it is decorative and hidden from assistive
   * technology. Most icons sit next to text and should have no label.
   */
  accessor label: string | undefined;
  /** Per-instance style overrides: `{ color: 'color.status.danger.icon' }`. */
  accessor overrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  private applyOverrides;
  protected override render(): TemplateResult;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-icon": DsIcon;
  }
}
//#endregion
//#region src/Disclosure.d.ts
type DisclosureHeadingLevel = "2" | "3" | "4" | "5" | "6";
/** Detail carried by the `toggle` CustomEvent. */
interface DisclosureToggleDetail {
  open: boolean;
}
/** Overridable style hooks; see the `overrides` property. `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
export declare class DsDisclosure extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The trigger's label. Also its accessible name. Says what will be revealed. */
  accessor summary;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  accessor open: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  accessor defaultOpen;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled. */
  accessor disabled;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  accessor keepMounted;
  /** When set, the trigger is wrapped in a heading of this level so it appears in the outline. */
  accessor headingLevel: DisclosureHeadingLevel | undefined;
  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state (seeded from `defaultOpen`). */
  private accessor internalOpen;
  private accessor triggerEl;
  /** Whether the panel is currently open. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private handleClick;
  /** Closing removes the panel from the tree, so focus inside it goes to the trigger first. */
  private moveFocusOutOfPanel;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-disclosure": DsDisclosure;
  }
}
//#endregion
//#region src/Accordion.d.ts
type AccordionHeadingLevel = DisclosureHeadingLevel;
/** One section. `id` must be unique and is also used as the slot name for its panel content when using `items`. */
interface AccordionItem {
  id: string;
  summary: string;
  disabled?: boolean | undefined;
}
/** Why a section's open state changed. */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** Detail carried by the `change` CustomEvent. A single id when `exclusive`, otherwise the full open set. */
interface AccordionChangeDetail {
  value: string | string[];
}
/** Detail carried by the `open-change` CustomEvent, fired once per section as it opens or closes. */
interface AccordionOpenChangeDetail {
  id: string;
  open: boolean;
  reason: AccordionOpenChangeReason;
}
/** Overridable style hooks; see the `overrides` property. `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type AccordionOverridableBinding = "divider" | "dividerWidth" | "itemGap" | "triggerPaddingBlock" | "fontFamily" | "triggerFontSize" | "triggerFontWeight";
export declare class DsAccordion extends LitElement {
  static override styles: CSSResult;
  /** Generates a `<ds-disclosure>` per entry instead of reading light-DOM children. Each item's panel content is a slot named after its `id`. */
  accessor items: AccordionItem[] | undefined;
  /** Heading level for every trigger, so sections appear in the page outline. */
  accessor headingLevel: AccordionHeadingLevel;
  /** Opening one section closes the others. */
  accessor exclusive;
  /** Controlled open ids: an array, or a single id when `exclusive`. Omit for uncontrolled. */
  accessor value: string | string[] | undefined;
  /** Initially open ids for an uncontrolled accordion. */
  accessor defaultValue: string | string[] | undefined;
  /** A hairline between items. */
  accessor divided;
  /** Passed to every section; required when panels contain form fields. */
  accessor keepMounted;
  /** Per-instance style overrides: `{ divider: 'color.border.strong' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open ids, seeded from `defaultValue`. */
  private accessor internalOpenIds;
  private accessor defaultSlotEl;
  /** The open ids last dispatched or applied, used to diff a controlled `value` change. */
  private appliedIds;
  private get usesItems();
  /** The open ids right now, controlled or not. */
  get currentOpenIds(): Set<string>;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderItem;
  private readonly handleSlotChange;
  /** Sets heading-level, keep-mounted, open and the toggle listener on every slotted `<ds-disclosure>`. No-op when `items` is set. */
  private syncSlottedItems;
  private slottedDisclosures;
  private itemElements;
  private readonly handleToggle;
  private readonly handleKeydown;
  private focusRelative;
  private focusEdge;
  /** Applies a trigger-originated toggle: updates the open set, closes siblings when `exclusive`, and dispatches events. */
  private setOpen;
  /** Diffs an externally-set `value` against what was last applied and reports the change as `reason: 'controlled'`. */
  private syncControlledChange;
  private dispatchOpenChange;
  private dispatchChange;
  private toValue;
  private toIdSet;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-accordion": DsAccordion;
  }
}
//#endregion
//#region src/Button.d.ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit";
/** Detail carried by the `press` CustomEvent (none). */
type ButtonPressDetail = void;
/** Detail carried by the `track` CustomEvent. */
interface ButtonTrackDetail {
  name: string;
  label: string;
}
/** Overridable style hooks; see the `overrides` property. `background`, `foreground`, `focusRing`, `focusRingWidth`, `inverseForeground`, `inverseFocusRing` and `minTarget` are locked and excluded. */
type ButtonOverridableBinding = "backgroundHover" | "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerStroke";
export declare class DsButton extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The button's text. Also its accessible name. */
  accessor label;
  /** Visual emphasis. One primary button per view. */
  accessor variant: ButtonVariant;
  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  accessor size: ButtonSize;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  accessor type: ButtonType;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel,
   * Disclosure): reflected to the inner button's `aria-expanded`. `undefined`
   * (the default) means this button does not disclose anything, so no
   * `aria-expanded` is rendered. Consumers rarely set it directly.
   */
  accessor expanded: boolean | undefined;
  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  accessor disabled;
  /** Hides the visible label and shows only the icon. `label` is still required and becomes the accessible name. */
  accessor iconOnly;
  /** Shows progress and blocks repeat activation while an action is pending. */
  accessor loading;
  /** The button sits on an inverse surface (Toast, Tooltip-like panels). Only meaningful on `ghost`. */
  accessor inverse;
  /**
   * Overrides the accessible name when it must say more than the visible label
   * ("Sort by Amount, ascending" on a header that shows "Amount"). The visible
   * label must be the start of it. Maps to `aria-label`.
   */
  accessor accessibleName: string | undefined;
  /** Text used for this button when a Toolbar collapses it into its overflow Menu. */
  accessor overflowLabel: string | undefined;
  /** Analytics event name sent on press. Omit for no tracking. */
  accessor track: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private handleClick;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-button": DsButton;
  }
}
//#endregion
//#region src/Heading.d.ts
type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md";
type HeadingAlign = "start" | "center" | "end";
/** Overridable style hooks; see the `overrides` property. `color` is locked and excluded. */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
export declare class DsHeading extends LitElement {
  static override styles: CSSResult;
  /**
   * Position in the document outline. Controls the semantic element, not the
   * visual size. Required; a missing or unknown level falls back to `<h2>`.
   */
  accessor level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  accessor size: HeadingSize | undefined;
  /** Horizontal text alignment. */
  accessor align: HeadingAlign;
  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  accessor overrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-heading": DsHeading;
  }
}
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
type TextElement = "p" | "span";
/** Overridable style hooks; see the `overrides` property. Nothing is locked. */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "color";
export declare class DsText extends LitElement {
  static override styles: CSSResult;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size. */
  accessor size: TextSize;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  accessor weight: TextWeight;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  accessor tone: TextTone;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  accessor align: TextAlign;
  /** Clip to one line with an ellipsis. The full text remains available as `title`. */
  accessor truncate;
  /** The HTML element to render. Choose by meaning, not by layout. */
  accessor element: TextElement;
  /** Per-instance style overrides: `{ color: 'color.foreground.danger' }`. Nothing is locked. */
  accessor overrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  /** Plain-text content of the default slot, used for `title` when truncated. */
  private accessor fullText;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private handleSlotChange;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-text": DsText;
  }
}
//#endregion
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/** Detail carried by the `change` CustomEvent. */
interface InputChangeDetail {
  value: string;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `errorText`, `descriptionText`,
 * `minTarget` and `focusRingWidth` are locked and excluded.
 */
type InputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "minTargetSm" | "disabledOpacity";
export declare class DsInput extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered; never replaced by a placeholder. */
  accessor label;
  /** Field name used by the enclosing Form when collecting values. */
  accessor name;
  /**
   * Controlled value. Omit for an uncontrolled field. Reading it after the user
   * types returns the current value (like a native input's `.value`).
   */
  accessor value: string | undefined;
  /** Initial value for an uncontrolled field. */
  accessor defaultValue: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  accessor placeholder: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. */
  accessor description: string | undefined;
  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  accessor type: InputType;
  /** Visually hide the label (it remains the accessible name via the native `<label for>`). */
  accessor hideLabel;
  /**
   * sm swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the
   * font size to font.size.sm; nothing else changes. Not listed under this
   * component's `platforms.lit.reflect`, but reflected anyway since the size
   * variants are expressed as CSS attribute selectors, matching Search's `size`.
   */
  accessor size: InputSize;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  accessor required;
  /** Not editable and not submitted. Stays visible and readable. */
  accessor disabled;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  private errorValue?;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** HTML autocomplete token (e.g. `email`, `given-name`). */
  accessor autocomplete: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  constructor();
  /** The current string value of the field. */
  get currentValue(): string;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private handleInput;
  private applyOverrides;
  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-input": DsInput;
  }
}
//#endregion
//#region src/Form.d.ts
type FormValidate = "submit" | "blur" | "change";
/** Detail carried by the `submit` CustomEvent. */
interface FormSubmitDetail {
  values: Record<string, string | boolean>;
}
/** Detail carried by the `invalid` CustomEvent. */
interface FormInvalidDetail {
  errors: Record<string, string>;
}
/**
 * The contract a light-DOM element must implement to be collected by
 * `<ds-form>`: `ds-input`, `ds-checkbox`, `ds-switch` and `ds-radio-group` all
 * satisfy it. `error` and `validationMessage` are set by `ds-switch` only in
 * spirit — it never has anything invalid to report, so both stay `undefined`
 * at runtime even though the type says otherwise; Form treats a missing
 * message as `''`.
 */
interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error: string | undefined;
  readonly currentValue: string | boolean | null;
  focus(): void;
  checkValidity(): boolean;
  readonly validationMessage: string;
}
/** Overridable style hooks; see the `overrides` property. `errorSummaryText` and `errorSummaryBackground` are locked and excluded. */
type FormOverridableBinding = "gap" | "errorSummaryBorder";
export declare class DsForm extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Identifier for the form, used for analytics and as the base of generated field ids. */
  accessor name;
  /** Accessible name for the form landmark. Required when a page has more than one form and `labelledBy` is not set. */
  accessor label: string | undefined;
  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  accessor labelledBy: string | undefined;
  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  accessor validate: FormValidate;
  /** Disables every field and action inside. Use while submitting. */
  accessor disabled;
  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  accessor errorSummary;
  /** Per-instance style overrides: `{ gap: 'layout.gap.normal' }`. Locked bindings (errorSummaryText, errorSummaryBackground) are ignored. */
  accessor overrides: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /** Field name -> message, for fields that have failed validation. */
  private accessor errors;
  /** Once a submission has failed, fields re-validate on blur/change even in `submit` mode. */
  private hasFailedSubmission;
  /** Fields and actions this Form disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByForm;
  /** Re-syncs disabled propagation when fields are added or removed anywhere in the subtree. */
  private readonly mutationObserver;
  /** Focus the error summary once it exists, after the render that follows a failed submission. */
  private pendingSummaryFocus;
  private readonly instanceId;
  private readonly internals;
  constructor();
  private get idBase();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** Validate every field and, only if all pass, dispatch `submit` with the collected values. */
  submit(): void;
  private handleKeydown;
  private handlePress;
  private handleFieldChange;
  private handleFieldFocusOut;
  private handleSummaryLinkClick;
  private validateField;
  private isTrackedField;
  /** Fields with a `name`, not inside a closed `ds-disclosure` without `keep-mounted`. */
  private queryFields;
  private isInsideClosedDisclosure;
  /** `name` is the base for a generated id, so an error summary link always has somewhere to point. */
  private assignFieldIds;
  /** Disables every field and `ds-button` inside, remembering which it disabled so re-enabling is exact. */
  private syncDisabled;
  /** Landmark role + accessible name, `labelledBy` winning over `label`, via ElementInternals so it lives in the light DOM. */
  private syncLabelInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-form": DsForm;
  }
}
//#endregion
//#region src/Stack.d.ts
type StackDirection = "vertical" | "horizontal";
type StackGap = "none" | "tight" | "normal" | "loose" | "section";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify = "start" | "center" | "end" | "between";
type StackElement = "div" | "section" | "nav" | "ul" | "ol";
/** Overridable style hooks; see the `overrides` property. */
type StackOverridableBinding = "gap";
export declare class DsStack extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  accessor direction: StackDirection;
  /** Space between children, from the layout rhythm. The only way to set spacing between siblings. */
  accessor gap: StackGap;
  /** Cross-axis alignment. */
  accessor align: StackAlign;
  /** Main-axis distribution. */
  accessor justify: StackJustify;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  accessor wrap;
  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  accessor element: StackElement;
  /** Per-instance style overrides: `{ gap: 'layout.gap.loose' }`. */
  accessor overrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly observer;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  private get items();
  protected override render(): TemplateResult;
  protected override updated(): void;
  /** Assign light-DOM children to the shadow slots (manual slot assignment). */
  private assignSlots;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-stack": DsStack;
  }
}
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
type BoxElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav";
/** Overridable style hooks; see the `overrides` property. */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "background" | "border" | "borderWidth" | "radius";
export declare class DsBox extends LitElement {
  static override styles: CSSResult;
  /** Padding on all sides. Use `insetBlock`/`insetInline` when the axes differ. */
  accessor inset: BoxInset;
  /** Vertical padding, overriding `inset` on that axis. */
  accessor insetBlock: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. */
  accessor insetInline: BoxInset | undefined;
  /** Background. `none` is transparent; `default`/`subtle`/`strong` step up. */
  accessor surface: BoxSurface;
  /** A thin default border. */
  accessor border;
  /** Corner radius from the theme's presets. */
  accessor radius: BoxRadius;
  /**
   * Element to render. The host is always the element in the DOM; sectioning
   * values (`article`, `aside`, `header`, `footer`, `main`, `nav`) set the
   * matching landmark role on the host through `ElementInternals`. `div` and
   * `section` set no role. Prefer Landmark for page regions.
   */
  accessor element: BoxElement;
  /** Per-instance style overrides: `{ background: 'color.status.danger.background' }`. */
  accessor overrides: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-box": DsBox;
  }
}
//#endregion
//#region src/Link.d.ts
type LinkTone = "default" | "inherit";
/** Overridable style hooks; see the `overrides` property. `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth` and `focusRingRadius` are locked and excluded. */
type LinkOverridableBinding = "underlineThickness" | "underlineOffset" | "externalIconGap" | "transition";
export declare class DsLink extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The destination URL. */
  accessor href;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  accessor label;
  /** Opens in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  accessor external;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  accessor tone: LinkTone;
  /** Downloads the resource instead of navigating. */
  accessor download;
  /** Per-instance style overrides: `{ underlineOffset: 'space.2' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-link": DsLink;
  }
}
//#endregion
//#region src/Checkbox.d.ts
/** Detail carried by the `change` CustomEvent. */
interface CheckboxChangeDetail {
  checked: boolean;
}
/** Overridable style hooks; see the `overrides` property. `controlBorder`, `controlSelectedBackground`, `indicator`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "indicatorStroke" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsCheckbox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Clicking or tapping it toggles the control. */
  accessor label;
  /** Field name used by the enclosing Form when collecting values. */
  accessor name;
  /** The value submitted when checked. Lets several checkboxes share a `name`. */
  accessor value;
  /** Controlled checked state. Omit for an uncontrolled control. The attribute is the initial state only; not reflected. */
  accessor checked: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  accessor defaultChecked;
  /** Shows the mixed indicator. Visual and announced only; the submitted value still follows `checked`. */
  accessor indeterminate;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  accessor disabled;
  /** Must be checked to submit. Shown in the label, not only by color. */
  accessor required;
  /** Persistent helper text below the label. */
  accessor description: string | undefined;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  private errorValue?;
  /** The error message. Setting it implies `invalid`. Say what to do. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Uncontrolled checked state (seeded from `defaultChecked`). */
  private accessor internalChecked;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** Whether the control is currently checked. */
  get currentChecked(): boolean;
  /** The value the Form collects: `value` when checked, otherwise `null` (no key). */
  get currentValue(): string | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  /** Clicks on the description (or the row's empty space) toggle the control too. */
  private handleRowClick;
  /** Disabled uses aria-disabled so the control stays focusable; click and change are both guarded. */
  private handleControlClick;
  private handleChange;
  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-checkbox": DsCheckbox;
  }
}
//#endregion
//#region src/Switch.d.ts
type SwitchLabelPosition = "start" | "end";
/** Detail carried by the `change` CustomEvent. */
interface SwitchChangeDetail {
  checked: boolean;
}
/** Overridable style hooks; see the `overrides` property. `trackOff`, `trackOn`, `thumb`, `labelColor`, `descriptionText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type SwitchOverridableBinding = "trackWidth" | "trackHeight" | "thumbSize" | "thumbInset" | "radius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsSwitch extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  accessor label;
  /** Optional field name. When inside a Form the checked state is collected; most switches are not in forms. */
  accessor name;
  /** Controlled state. Omit for an uncontrolled control. The attribute is the initial state only; not reflected. */
  accessor checked: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  accessor defaultChecked;
  /** Cannot be toggled. Stays visible, readable and focusable. */
  accessor disabled;
  /** Persistent helper text below the label explaining the effect. */
  accessor description: string | undefined;
  /** Where the label sits relative to the track. `start` is the settings-list convention. */
  accessor labelPosition: SwitchLabelPosition;
  /** Per-instance style overrides: `{ trackWidth: 'space.12' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled checked state (seeded from `defaultChecked`). */
  private accessor internalChecked;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** Whether the switch is currently on. */
  get currentChecked(): boolean;
  /** The value the Form collects: the checked state as a boolean. */
  get currentValue(): boolean;
  /** A switch has no error state by design; the Form never validates it. */
  readonly required = false;
  /** Always valid: a switch has no error state by design. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues<this>): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  private handleRowClick;
  private handleControlClick;
  private handleChange;
  /** Contribute "on" to an owning form only when the switch has a `name`. */
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-switch": DsSwitch;
  }
}
//#endregion
//#region src/RadioGroup.d.ts
type RadioGroupOrientation = "vertical" | "horizontal";
/** Shape of each entry in `options`. */
interface RadioGroupOption {
  value: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
}
/** Detail carried by the `change` CustomEvent. */
interface RadioGroupChangeDetail {
  value: string;
}
/** Overridable style hooks; see the `overrides` property. `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type RadioGroupOverridableBinding = "controlBorderWidth" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsRadioGroup extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The group's legend — the question the options answer. Always visible. */
  accessor label;
  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  accessor name;
  /** The options in display order. Two to about seven. A property, not an attribute. */
  accessor options: RadioGroupOption[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  accessor value: string | undefined;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  accessor defaultValue: string | undefined;
  /** Layout of the options. Horizontal only for two or three short labels. */
  accessor orientation: RadioGroupOrientation;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  accessor required;
  /** Disables every option. Individual options use `options[].disabled`. */
  accessor disabled;
  /** Persistent helper text under the legend. */
  accessor description: string | undefined;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  private errorValue?;
  /** The group's error message. Setting it implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Uncontrolled selection (seeded from `defaultValue`). */
  private accessor internalValue;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** The currently selected option value, or `null` when nothing is selected (no key in the Form). */
  get currentValue(): string | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  private get radios();
  private isOptionDisabled;
  private handleRowClick;
  /** A disabled group uses aria-disabled so the radios stay focusable; click and change are guarded. */
  private handleRadioClick;
  private handleChange;
  private select;
  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-radio-group": DsRadioGroup;
  }
}
//#endregion
//#region src/Fieldset.d.ts
type FieldsetGap = "tight" | "normal" | "loose";
/** Overridable style hooks; see the `overrides` property. `legendColor`, `descriptionText` and `errorText` are locked and excluded. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "fontFamily" | "lineHeight";
export declare class DsFieldset extends LitElement {
  static override styles: CSSResult;
  /** The group's name — what the fields together describe. Always visible. */
  accessor legend;
  /** Persistent helper text under the legend. Linked with aria-describedby. */
  accessor description: string | undefined;
  /** A group-level error (cross-field validation). Field-level errors stay on the fields. */
  accessor error: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  accessor disabled;
  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  accessor gap: FieldsetGap;
  /** Per-instance style overrides: `{ fieldsGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fields this Fieldset disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByFieldset;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** `overrides.fieldsGap` forwarded to the composed `<ds-stack>`'s own `overrides.gap`; Fieldset never styles the Stack directly. */
  private get stackOverrides();
  /** True once at least one field is found and every one of them is `required`. */
  private get allFieldsRequired();
  private queryFields;
  private handleSlotChange;
  /** Disables every slotted field, remembering which it disabled so re-enabling is exact. */
  private syncDisabled;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-fieldset": DsFieldset;
  }
}
//#endregion
//#region src/Alert.d.ts
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertLive = "status" | "alert" | "off";
/** Detail carried by the `dismiss` CustomEvent (none). */
type AlertDismissDetail = void;
/** Overridable style hooks; see the `overrides` property. `background`, `foreground`, `bodyColor` and `icon` are locked and excluded. */
type AlertOverridableBinding = "border" | "borderWidth" | "radius" | "padding" | "gap" | "partGap" | "iconSize" | "headingSize" | "headingWeight" | "fontFamily" | "fontSize" | "lineHeight" | "dismissMargin";
export declare class DsAlert extends LitElement {
  static override styles: CSSResult;
  /** What kind of message this is. Sets the colors, the icon, and (with `live`) the announcement. */
  accessor tone: AlertTone;
  /** A short bold heading for the message. Optional for one-line messages. Never forwarded as the native `title`. */
  accessor heading: string | undefined;
  /** How the alert is announced when it appears. `status` is polite; `alert` interrupts; `off` for alerts present at load. */
  accessor live: AlertLive;
  /** Shows a dismiss button at the end of the alert. */
  accessor dismissible;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (background, foreground, bodyColor, icon) are ignored. */
  accessor overrides: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /** Light-DOM slot content (heading or body) changed without a property change; re-render to keep `hasHeading` and the accessible name current. */
  private handleContentSlotChange;
  /**
   * The region is named by the heading when present, else by the body (a
   * status region is named by its content) — an Alert always has a name.
   * `ariaLabelledByElements` points cross-root at the shadow-DOM element
   * where supported. Otherwise the target's flattened text becomes a
   * literal `aria-label` attribute, not `internals.ariaLabel`: ARIAMixin
   * values set through ElementInternals aren't visible to the
   * accessible-name computation the test suite uses (only real attributes
   * are), though real assistive tech reads either.
   */
  private syncAccessibleName;
  private handleDismiss;
  /**
   * The consumer will remove the alert, so focus moves onward first: to the
   * next focusable element after the alert in reading order, or to the
   * previous one when there is none, so focus is never lost. Left alone if
   * nothing outside the alert is focusable.
   */
  private moveFocusOnward;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-alert": DsAlert;
  }
}
//#endregion
//#region src/Landmark.d.ts
type LandmarkRole = "banner" | "navigation" | "main" | "complementary" | "contentinfo" | "region" | "search" | "form";
export declare class DsLandmark extends LitElement {
  /**
   * Which landmark this is. Exposed as the host's `role` attribute; the
   * property is named `landmark` because `HTMLElement` already defines `role`.
   */
  accessor landmark: LandmarkRole | undefined;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Reflects to `aria-label`. */
  accessor label: string | undefined;
  /** No shadow root: children stay in the light DOM and the host is the landmark. */
  protected override createRenderRoot(): HTMLElement;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): symbol;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-landmark": DsLandmark;
  }
}
//#endregion
//#region src/Breadcrumb.d.ts
/** Shape of each entry in `items`. */
interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
}
/** Detail carried by the `navigate` CustomEvent. `preventDefault()` on `originalEvent` cancels navigation. */
interface BreadcrumbNavigateDetail {
  item: BreadcrumbItem;
  index: number;
  originalEvent: MouseEvent;
}
/** Overridable style hooks; see the `overrides` property. `currentColor`, `separatorColor` and `minTarget` are locked and excluded. */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
export declare class DsBreadcrumb extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The trail from root to current page, in order. A property, not an attribute. */
  accessor items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  accessor label;
  /** When there are more than four items, show the first, an ellipsis, and the last two. */
  accessor collapse;
  /** Per-instance style overrides: `{ gap: 'space.3' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Whether the user has revealed the collapsed items. */
  private accessor expanded;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private handleNavigate;
  private handleExpand;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-breadcrumb": DsBreadcrumb;
  }
}
//#endregion
//#region src/Meter.d.ts
type MeterTone = "info" | "success" | "warning" | "danger";
/** Overridable style hooks; see the `overrides` property. `track`, `fill`, `labelColor` and `valueColor` are locked and excluded. */
type MeterOverridableBinding = "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition";
export declare class DsMeter extends LitElement {
  static override styles: CSSResult;
  /** The current measurement. Clamped to `min`…`max`. */
  accessor value;
  /** Lower bound of the range. */
  accessor min;
  /** Upper bound of the range. Must be greater than `min`. */
  accessor max;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  accessor label;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number. */
  accessor valueText: string | undefined;
  /** Fill color. `info` is the neutral fill; the consumer sets the others from thresholds it owns. */
  accessor tone: MeterTone;
  /** Hides the visible value text. The accessible value is always exposed. */
  accessor hideValue;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (track, fill, labelColor, valueColor) are ignored. */
  accessor overrides: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  /** `value` clamped to the range (the accessible value). Non-finite values and `max <= min` resolve to `min`. */
  get clampedValue(): number;
  /** Fill percentage, 0–100. */
  get percent(): number;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-meter": DsMeter;
  }
}
//#endregion
//#region src/Card.d.ts
type CardHeadingLevel = "2" | "3" | "4" | "5" | "6";
type CardInset = "sm" | "md" | "lg";
type CardSurface = "default" | "subtle";
/** Overridable style hooks; see the `overrides` property. `background`, `focusRing` and `focusRingWidth` are locked and excluded. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "hoverBackground" | "transition";
export declare class DsCard extends LitElement {
  static override styles: CSSResult;
  /** The card's title, rendered as a Heading at `headingLevel`. Omit for a card that is a single piece of content. */
  accessor heading: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  accessor headingLevel: CardHeadingLevel;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  accessor inset: CardInset;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  accessor surface: CardSurface;
  /**
   * The whole card is one link or button target. Requires exactly one
   * interactive child (a `ds-link` or `ds-button`) whose action the card
   * extends to its full area; the card itself is not focusable.
   */
  accessor interactive;
  /**
   * The card root takes `tabindex="-1"` so a container (Feed) can move focus
   * to it by script, and draws its own focus ring when focused that way. Not
   * a tab stop; not for making cards clickable (`interactive`).
   */
  accessor focusable;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (background, focusRing, focusRingWidth) are ignored. */
  accessor overrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  private hitAreaTarget;
  constructor();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(changed: PropertyValues): void;
  private handleDefaultSlotChange;
  /** Finds the single interactive child and marks it as the card's extending hit area. */
  private syncHitArea;
  /** Article role + best-effort cross-shadow labelling by the heading, when one is set. */
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-card": DsCard;
  }
}
//#endregion
//#region src/Container.d.ts
type ContainerWidth = "prose" | "content" | "page" | "full";
type ContainerGutter = "narrow" | "default" | "wide" | "none";
type ContainerAlign = "center" | "start";
type ContainerElement = "div" | "main" | "section";
/** Overridable style hooks; see the `overrides` property. */
type ContainerOverridableBinding = "maxWidth" | "paddingInline";
export declare class DsContainer extends LitElement {
  static override styles: CSSResult;
  /** `prose` for reading, `content` for most screens, `page` for wide layouts, `full` for no cap. */
  accessor width: ContainerWidth;
  /** Horizontal padding at the viewport edge. `default` is responsive; `none` for a nested container. */
  accessor gutter: ContainerGutter;
  /** Where the capped column sits in a wider viewport. */
  accessor align: ContainerAlign;
  /** Use `main` for the page's main column when no Landmark wraps it. */
  accessor element: ContainerElement;
  /** Per-instance style overrides: `{ maxWidth: 'layout.maxWidth.page' }`. */
  accessor overrides: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-container": DsContainer;
  }
}
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/** Overridable style hooks; see the `overrides` property. `labelColor` is locked and excluded. */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
export declare class DsDivider extends LitElement {
  static override styles: CSSResult;
  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  accessor orientation: DividerOrientation;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier
   * today"). Setting it turns the divider semantic. Ignored on a vertical
   * divider (a dev warning is logged): a vertical line has no room for
   * centered text.
   */
  accessor label: string | undefined;
  /** Expose as role="separator" to assistive technology. Leave false for purely visual lines between list rows. */
  accessor semantic;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  accessor spacing: DividerSpacing;
  /** Per-instance style overrides: `{ spacing: 'layout.gap.tight' }`. `labelColor` is locked and ignored. */
  accessor overrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  /** `label` has no effect on a vertical divider (no room for centered text). */
  private get effectiveLabel();
  protected override render(): TemplateResult;
  /** role=separator + aria-orientation when semantic or labelled; aria-hidden otherwise. */
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-divider": DsDivider;
  }
}
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
/** Detail carried by the `escape-attempt` CustomEvent. */
interface FocusScopeEscapeAttemptDetail {
  direction: "forward" | "backward";
}
export declare class DsFocusScope extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Tab and Shift+Tab wrap within the scope; focus outside is pulled back in. */
  accessor trapped;
  /** Where focus goes on mount. */
  accessor autoFocus: FocusScopeAutoFocus;
  /** On unmount, return focus to the opener (or the next focusable element if it is gone). */
  accessor restoreFocus;
  /** Pauses the scope without unmounting it, so a nested scope can own Tab instead. */
  accessor active;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Not
   * an attribute — set the property directly (there is no React ref concept
   * in Lit; this is a plain element reference).
   */
  accessor returnFocusTo: HTMLElement | null | undefined;
  private accessor anchorEl;
  private accessor startSentinelEl;
  private openerElement;
  private documentFocusableSnapshot;
  private lastFocused;
  private readonly handleKeydown;
  private readonly handleDocumentFocusIn;
  private readonly handleSentinelFocus;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override render(): TemplateResult;
  private applyAutoFocus;
  private restoreFocusOnExit;
  private getFocusableDescendants;
  private scopeContains;
  private isEffectivelyActive;
  private dispatchEscapeAttempt;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-focus-scope": DsFocusScope;
  }
}
//#endregion
//#region src/Dialog.d.ts
type DialogSize = "sm" | "md" | "lg";
type DialogInitialFocus = "first" | "title" | "close";
type DialogCloseReason = "escape" | "close-button" | "scrim" | "action";
/** Detail carried by the `close` CustomEvent. */
interface DialogCloseDetail {
  reason: DialogCloseReason;
}
/** Detail carried by the `opened` CustomEvent (none). */
type DialogOpenedDetail = void;
/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "layer" | "enter" | "exit";
export declare class DsDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `close`. */
  accessor open;
  /**
   * The dialog's title, rendered as a level-2 Heading and used as the
   * accessible name. Named `heading`, not `title` — `HTMLElement` already
   * defines `title` as the tooltip attribute.
   */
  accessor heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  accessor description: string | undefined;
  /** Visually hides the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  accessor hideHeading;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  accessor size: DialogSize;
  /**
   * Escape, the close button and a scrim click all request close. `false` for a dialog
   * that must be answered (then provide the answers in the footer): the close button is
   * not rendered and the scrim does nothing; Escape still reports. Attribute is the
   * negation, `no-dismiss`, because a boolean attribute cannot express `false` for a prop
   * that defaults `true`.
   */
  accessor dismissible;
  /** Where focus lands on open: the first focusable control in the body (default), the title, or the close button. */
  accessor initialFocus: DialogInitialFocus;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  accessor overrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor dialogEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  /** Whether the exit transition is playing (kept open a beat past the `open` flip so it can animate out). */
  private accessor closing;
  private openerElement;
  private closingProgrammatically;
  private suppressCloseSync;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private readonly handleCancel;
  private readonly handleDialogClick;
  private readonly handleCloseButtonPress;
  private readonly handleNativeClose;
  private handleOpen;
  private playExit;
  private applyInitialFocus;
  private findFirstBodyFocusable;
  private restoreFocus;
  private scheduleOpened;
  private dispatchClose;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-dialog": DsDialog;
  }
}
//#endregion
//#region src/AlertDialog.d.ts
type AlertDialogTone = "danger" | "warning" | "info";
type AlertDialogCancelReason = "cancel" | "escape";
/** Detail carried by the `confirm` CustomEvent (none). */
type AlertDialogConfirmDetail = void;
/** Detail carried by the `cancel` CustomEvent. */
interface AlertDialogCancelDetail {
  reason: AlertDialogCancelReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `icon`, `focusRing` and `focusRingWidth` are locked and excluded. */
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "layer" | "enter" | "exit";
export declare class DsAlertDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility, as in Dialog. The consumer owns it. */
  accessor open;
  /**
   * The question or statement, as a level-2 Heading and the accessible name.
   * Named `heading`, not `title` — `HTMLElement` already defines `title` as
   * the tooltip attribute.
   */
  accessor heading: string;
  /** What will happen and whether it can be undone. Becomes the accessible description. */
  accessor description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant. */
  accessor tone: AlertDialogTone;
  /** The confirming action, restating it. Never "OK" or "Yes". */
  accessor confirmLabel: string;
  /** The declining action. Defaults to "Cancel". */
  accessor cancelLabel: string | undefined;
  /** Blocks confirm while a precondition is unmet. Cancel always works. */
  accessor confirmDisabled;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, icon, focusRing, focusRingWidth) are ignored. */
  accessor overrides: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor dialogEl;
  private accessor cancelButtonEl;
  private closing;
  private openerElement;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private readonly handleCancel;
  private readonly handleCancelPress;
  private readonly handleConfirmPress;
  private handleOpen;
  private playExit;
  private restoreFocus;
  private dispatchCancel;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-alert-dialog": DsAlertDialog;
  }
}
//#endregion
//#region src/Menu.d.ts
type MenuTriggerVariant = "ghost" | "secondary" | "primary";
type MenuTriggerIcon = "ellipsis" | "chevron-down" | "none";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
/** A single actionable entry (anatomy: item). */
interface MenuActionItem {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: "default" | "danger" | undefined;
  disabled?: boolean | undefined;
}
/** A labelled group of entries (anatomy: group, groupLabel). */
interface MenuGroup {
  group: string;
  items: MenuItem[];
}
/** A divider between entries (anatomy: separator). */
interface MenuSeparator {
  separator: true;
}
type MenuItem = MenuActionItem | MenuGroup | MenuSeparator;
/** Detail carried by the `action` CustomEvent. */
interface MenuActionDetail {
  id: string;
}
/** Detail carried by the `open-change` CustomEvent. */
interface MenuOpenChangeDetail {
  open: boolean;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter";
export declare class DsMenu extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The trigger's label and the menu's accessible name. */
  accessor label: string;
  /** Actions, optionally grouped with a label or divided by separators. */
  accessor items: MenuItem[];
  /** Variant of the trigger Button. */
  accessor triggerVariant: MenuTriggerVariant;
  /** Trailing icon on the trigger. */
  accessor triggerIcon: MenuTriggerIcon;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  accessor iconOnly;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  accessor placement: MenuPlacement;
  /** Controlled open state. Omit for an uncontrolled menu. */
  accessor open: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a
   * trigger; the trigger part is omitted and `open` must be controlled. Used
   * by ActionSheet above its breakpoint and by context menus. Lit has no ref
   * concept, so this takes the element directly rather than a `RefObject`.
   */
  accessor anchor: HTMLElement | null | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** The item currently carrying the roving tabindex and real focus. */
  private accessor activeId;
  private accessor triggerButtonEl;
  private accessor popupEl;
  private readonly popoverSupported;
  private wasOpen;
  private pendingFocus;
  private typeaheadQuery;
  private typeaheadTimer?;
  /** Whether the menu is currently open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderActionItem;
  private readonly handleTriggerPress;
  private readonly handleTriggerKeydown;
  private readonly handleListKeydown;
  private readonly handleItemClick;
  private readonly handleItemPointerEnter;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private readonly handleWindowBlur;
  private openMenu;
  private closeMenu;
  private setOpen;
  private handleOpened;
  private handleClosed;
  private hidePopupImmediately;
  private addGlobalListeners;
  private removeGlobalListeners;
  private navigableItems;
  private focusItem;
  private moveFocus;
  private activateActiveItem;
  private selectItem;
  private handleTypeahead;
  private updatePosition;
  private dispatchOpenChange;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-menu": DsMenu;
  }
}
//#endregion
//#region src/Tooltip.d.ts
type TooltipPlacement = "top" | "bottom" | "start" | "end";
type TooltipDelay = "default" | "none";
/** Overridable style hooks; see the `overrides` property. `surface` and `text` are locked and excluded. */
type TooltipOverridableBinding = "radius" | "paddingBlock" | "paddingInline" | "offset" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "shadow" | "layer" | "enter" | "exit";
export declare class DsTooltip extends LitElement {
  static override styles: CSSResult;
  /** The tooltip text. One short phrase; no markup, links or line breaks. */
  accessor content: string;
  /** Preferred side; flips when it would overflow the viewport. */
  accessor placement: TooltipPlacement;
  /** `true`: supplementary, linked as the child's `aria-describedby`. `false`: linked as `aria-labelledby` — the tooltip IS the child's name. */
  accessor describes;
  /** Hover delay before showing: `default` (motion.duration.base × 3) or `none` for a warm toolbar item. */
  accessor delay: TooltipDelay;
  /**
   * Controlled visibility, for stories and tests only (the `Keyboard` story
   * renders the tooltip open with it). Product code never sets this: a
   * tooltip is hover and focus driven.
   */
  accessor open: boolean | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
  private popupEl;
  private popupId;
  private triggerEl;
  private visible;
  private pointerOverTrigger;
  private pointerOverPopup;
  private triggerFocused;
  private showTimerId?;
  private hideGraceTimerId?;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private readonly handleSlotChange;
  private attachTrigger;
  private detachTrigger;
  private updateTriggerAria;
  private readonly handleTriggerPointerEnter;
  private readonly handleTriggerPointerLeave;
  private readonly handleTriggerFocus;
  private readonly handleTriggerBlur;
  private readonly handleTriggerKeydown;
  private readonly handlePopupPointerEnter;
  private readonly handlePopupPointerLeave;
  private readonly handleReposition;
  private requestShow;
  private scheduleMaybeHide;
  private computeDelayMs;
  private showPopup;
  private hidePopup;
  private addGlobalListeners;
  private removeGlobalListeners;
  private updatePosition;
  private renderPopupContent;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-tooltip": DsTooltip;
  }
}
//#endregion
//#region src/Toast.d.ts
type ToastTone = "neutral" | "success" | "warning" | "danger";
type ToastDuration = "short" | "long" | "persistent";
type ToastDismissReason = "timeout" | "dismiss-button" | "action" | "replaced";
/** Detail carried by the `action` CustomEvent (none). */
type ToastActionDetail = void;
/** Detail carried by the `dismiss` CustomEvent. */
interface ToastDismissDetail {
  reason: ToastDismissReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "enter" | "exit";
/** Overridable style hooks for `<ds-toast-region>`; see its `overrides` property. `layer` sets the region's stacking context. */
type ToastRegionOverridableBinding = "stackGap" | "regionInset" | "layer";
export declare class DsToast extends LitElement {
  static override styles: CSSResult;
  /** One sentence, past tense, saying what happened ("Message sent", "3 files deleted"). Also the toast's accessible name. */
  accessor message: string;
  /** Sets the leading icon; `neutral` has none. Toasts never use tinted backgrounds — the icon and message carry the tone. */
  accessor tone: ToastTone;
  /** Label for a single action button ("Undo", "View"). Recommended as `persistent` so there is time to use it. */
  accessor actionLabel: string | undefined;
  /** `short` ≈ 5s, `long` ≈ 10s (motion.duration.loop × 6 / × 12), `persistent` until dismissed. */
  accessor duration: ToastDuration;
  /** Stable identity; showing a toast with the same `toastId` replaces this one instead of stacking. Named `toastId` (attribute `toast-id`) so it does not collide with the DOM `id`. */
  accessor toastId: string | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this value. Exposed as the negated `no-dismiss` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  accessor dismissible;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor containerEl;
  private accessor closing;
  private readonly internals;
  private dismissed;
  private timerId?;
  private remainingMs;
  private timerStartedAt;
  private pointerOver;
  private focused;
  constructor();
  private get showDismiss();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private readonly handleActionPress;
  private readonly handleDismissPress;
  private readonly handleKeydown;
  private readonly handlePointerEnter;
  private readonly handlePointerLeave;
  private readonly handleFocusIn;
  private readonly handleFocusOut;
  private readonly handleVisibilityChange;
  /** Dispatches `dismiss` and plays the exit transition; called for every dismissal path, including eviction by `toast()`. */
  requestDismiss(reason: ToastDismissReason): void;
  private computeDurationMs;
  private startTimer;
  private scheduleTimer;
  private pauseTimer;
  private maybeResumeTimer;
  private clearTimer;
  /** Plays the exit transition (instant under reduced motion), then removes the element from the DOM. */
  private playExit;
  private applyOverrides;
  private warnInDev;
}
export declare class DsToastRegion extends LitElement {
  static override styles: CSSResult;
  /** Per-instance style overrides: `{ regionInset: 'layout.gutter.wide' }`. */
  accessor overrides: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly internals;
  /** What had focus before `F6` moved it into the region, restored on the next `F6` or on dismissal. */
  private previouslyFocused;
  constructor();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** Sends focus back to whatever had it before `F6` moved focus in here. Called on the second `F6` and on dismissal. */
  restoreFocus(): void;
  private readonly handleDocumentKeydown;
  private applyOverrides;
}
/** Options for `toast()`. */
interface ToastOptions {
  message: string;
  tone?: ToastTone | undefined;
  actionLabel?: string | undefined;
  duration?: ToastDuration | undefined;
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
}
/** Resolution of the promise `toast()` returns, once the toast leaves the screen. */
interface ToastResult {
  reason: ToastDismissReason;
}
/**
 * Shows a toast, since a notification is an event, not a place in the tree.
 * Returns a promise that resolves once the toast leaves the screen (see
 * `ToastResult.reason`). Showing a toast with the same `toastId` as one
 * already visible replaces it (`reason: 'replaced'` for the old one) instead
 * of stacking; more than `MAX_TOASTS` visible evicts the oldest the same way.
 */
export declare function toast(options: ToastOptions): Promise<ToastResult>;
declare global {
  interface HTMLElementTagNameMap {
    "ds-toast": DsToast;
    "ds-toast-region": DsToastRegion;
  }
}
//#endregion
//#region src/Popover.d.ts
type PopoverHeadingLevel = "2" | "3" | "4";
type PopoverPlacement = "bottom-start" | "bottom" | "bottom-end" | "top-start" | "top" | "top-end" | "start" | "end";
type PopoverCloseReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** Detail carried by the `open-change` CustomEvent. */
interface PopoverOpenChangeDetail {
  open: boolean;
  reason: PopoverCloseReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "layer" | "enter" | "exit";
export declare class DsPopover extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Optional heading at the top of the panel; also the accessible name when set. */
  accessor heading: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline. */
  accessor headingLevel: PopoverHeadingLevel;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  accessor open: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay in the viewport. */
  accessor placement: PopoverPlacement;
  /** `false` (default): the page stays interactive. `true`: a small trapped, inert Dialog anchored to the trigger. */
  accessor modal;
  /** A small pointer toward the trigger. Off by default. */
  accessor showArrow;
  /**
   * Shows the close button. Escape and outside click (non-modal) always
   * close regardless. Attribute is the negation, `no-dismiss`, because a
   * boolean attribute cannot express `false` for a prop that defaults `true`.
   */
  accessor dismissible;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  accessor overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** Whether the modal exit transition is playing. */
  private accessor closing;
  /** Whether the default slot currently has assigned content, for the dev warning. */
  private accessor hasBodyContent;
  private accessor panelEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private accessor arrowEl;
  /** Copied from the trigger's own accessible text, for the panel's `aria-label` fallback when `heading` is unset. */
  private accessor triggerAccessibleName;
  private readonly popoverSupported;
  private triggerEl;
  private wasOpen;
  private pendingReason;
  private focusTriggerOnClose;
  /** Whether the popover is currently open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private readonly handleTriggerSlotChange;
  private attachTrigger;
  private detachTrigger;
  private updateTriggerAccessibleName;
  private updateTriggerExpanded;
  private readonly handleTriggerClick;
  private readonly handleBodySlotChange;
  private readonly handleCloseButtonPress;
  private readonly handleDialogCancel;
  private readonly handlePanelKeydown;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private requestOpenChange;
  private handleOpened;
  private handleClosed;
  private playModalExit;
  private hidePanelImmediately;
  private applyInitialFocus;
  private findFirstBodyFocusable;
  private getPanelFocusables;
  private addGlobalListeners;
  private removeGlobalListeners;
  private updatePosition;
  private updateArrowPosition;
  private dispatchOpenChange;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-popover": DsPopover;
  }
}
//#endregion
//#region src/BottomSheet.d.ts
type BottomSheetHeight = "content" | "half" | "full";
type BottomSheetCloseReason = "escape" | "close-button" | "scrim" | "drag" | "action";
/** Detail carried by the `close` CustomEvent. */
interface BottomSheetCloseDetail {
  reason: BottomSheetCloseReason;
}
/** Detail carried by the `drag-dismiss` CustomEvent (none). */
type BottomSheetDragDismissDetail = void;
/** Overridable style hooks; see the `overrides` property. `surface`, `handle`, `focusRing` and `focusRingWidth` are locked and excluded. */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "inset" | "partGap" | "footerGap" | "maxWidth" | "layer" | "enter" | "exit";
export declare class DsBottomSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility, as in Dialog. */
  accessor open;
  /**
   * The sheet's title and accessible name. Named `heading`, not `title` —
   * `HTMLElement` already defines `title` as the tooltip attribute (see
   * Dialog and AlertDialog).
   */
  accessor heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  accessor hideHeading;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is near-full-screen. */
  accessor height: BottomSheetHeight;
  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. `false` for a
   * sheet that must be answered from its footer actions; Escape still reports. Attribute is the
   * negation, `no-dismiss`, because a boolean attribute cannot express `false` for a prop that
   * defaults `true` (see Dialog).
   */
  accessor dismissible;
  /**
   * Drag the handle (or header) downward to dismiss. Purely additive: the close button and
   * Escape always exist. `platforms.lit.reflect` lists this attribute in its direct (non-negated)
   * form, unlike `dismissible`'s `no-dismiss` — kept literal per the doc; see the generation gap notes.
   */
  accessor dragToDismiss;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, handle, focusRing, focusRingWidth) are ignored. Only applied below the wide-viewport breakpoint; above it the sheet renders as Dialog and uses Dialog's own overrides contract. */
  accessor overrides: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
  /** Above `layout.maxWidth.prose` the sheet renders as a centered `<ds-dialog size="md">` instead. */
  private accessor isWide;
  /** Whether the exit transition is playing (kept open a beat past the `open` flip so it can animate out). */
  private accessor closing;
  private accessor dialogEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private openerElement;
  private closingProgrammatically;
  private suppressCloseSync;
  private wideQuery;
  private dragState;
  private readonly handleWideChange;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderAsDialog;
  private renderAsSheet;
  private bodyOverrides;
  /** Forwards the sheet-and-Dialog-shared bindings to `<ds-dialog>` in the wide presentation; sheet-only bindings (handle, edge radius, drag) have no Dialog equivalent. */
  private dialogOverrides;
  private readonly handleCancel;
  private readonly handleDialogClick;
  private readonly handleCloseButtonPress;
  private readonly handleNativeClose;
  private readonly handleHeaderPointerDown;
  private readonly handleHeaderPointerMove;
  private readonly handleHeaderPointerUp;
  private handleOpen;
  private playExit;
  private applyInitialFocus;
  private findFirstBodyFocusable;
  private restoreFocus;
  private dispatchClose;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-bottom-sheet": DsBottomSheet;
  }
}
//#endregion
//#region src/ActionSheet.d.ts
type ActionSheetActionTone = "default" | "danger";
type ActionSheetCloseReason = "escape" | "scrim" | "cancel" | "drag";
/** A single row (anatomy: item). */
interface ActionSheetAction {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
}
/** Detail carried by the `action` CustomEvent. */
interface ActionSheetActionDetail {
  id: string;
}
/** Detail carried by the `close` CustomEvent. */
interface ActionSheetCloseDetail {
  reason: ActionSheetCloseReason;
}
/**
 * Overridable style hooks; see the `overrides` property. `surface`, `itemHover`, `itemColor`,
 * `itemDangerColor`, `titleColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and
 * excluded. `titleSize` has no host hook of its own — it is forwarded to the composed title
 * `<ds-text>`'s own `overrides` (which already owns font size), along with `fontFamily` and
 * `lineHeight` (also applied to the item rows directly). Only applies to the phone presentation;
 * above the wide breakpoint the sheet renders as `<ds-menu>` and uses Menu's own overrides contract.
 */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "titleSize" | "fontFamily" | "fontSize" | "lineHeight" | "divider" | "dividerWidth" | "maxWidth" | "layer" | "enter" | "exit";
export declare class DsActionSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. */
  accessor open;
  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`. Named `heading`, not `title` — `HTMLElement`
   * already defines `title` as the tooltip attribute.
   */
  accessor heading: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  accessor actions: ActionSheetAction[];
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  accessor cancelLabel: string | undefined;
  /**
   * Escape, the scrim, the cancel row and the drag all request close; Escape still reports
   * through `close` when `false`, as in Dialog and BottomSheet. Attribute is the negation,
   * `no-dismiss`, because a boolean attribute cannot express `false` for a prop that defaults `true`.
   */
  accessor dismissible;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
  /** Above `layout.maxWidth.prose` the sheet renders as `<ds-menu>` anchored to the opener instead. */
  private accessor isWide;
  /** Whether the exit transition is playing (kept present a beat past the `open` flip to animate out). */
  private accessor closing;
  /** The action currently carrying the roving tabindex and real focus (narrow presentation only). */
  private accessor activeId;
  private accessor dialogEl;
  private accessor cancelButtonEl;
  private openerElement;
  private wideQuery;
  private dragState;
  private anchorRect;
  /** Set just before dispatching `action`, so the `<ds-menu>` close that follows selection is not also reported as a dismissal. */
  private menuClosingForAction;
  private readonly handleWideChange;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult | typeof nothing;
  private renderWide;
  private renderNarrow;
  private renderItem;
  private accessibleLabel;
  private partitionedActions;
  private navigableActions;
  private menuItems;
  private titleOverrides;
  private readonly handleListKeydown;
  private readonly handleItemClick;
  private readonly handleItemPointerEnter;
  private readonly handleCancel;
  private readonly handleDialogClick;
  private readonly handleCancelPress;
  private readonly handleMenuAction;
  private readonly handleMenuOpenChange;
  private readonly handleSurfacePointerDown;
  private readonly handleSurfacePointerMove;
  private readonly handleSurfacePointerUp;
  private handleOpen;
  private playExit;
  private applyInitialFocus;
  private focusAction;
  private moveFocus;
  private activateActiveAction;
  private restoreFocus;
  private dispatchAction;
  private dispatchClose;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-action-sheet": DsActionSheet;
  }
}
//#endregion
//#region src/SidePanel.d.ts
type SidePanelSide = "start" | "end";
type SidePanelWidth = "narrow" | "default" | "wide";
type SidePanelPersistent = "never" | "content" | "page";
type SidePanelLandmark = "complementary" | "navigation";
type SidePanelOpenChangeReason = "trigger" | "escape" | "close-button" | "scrim" | "swipe" | "action" | "navigation";
/** Detail carried by the `open-change` CustomEvent. */
interface SidePanelOpenChangeDetail {
  open: boolean;
  reason: SidePanelOpenChangeReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
export declare class DsSidePanel extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  accessor open: boolean | undefined;
  /**
   * The panel's title and accessible name. Named `heading`, not `title` —
   * `HTMLElement` already defines `title` as the tooltip attribute (see
   * Dialog and BottomSheet).
   */
  accessor heading: string;
  /** Keep the title for assistive technology but do not render it. The accessible name is required regardless. */
  accessor hideHeading;
  /** The edge the panel slides from; `start`/`end` follow the writing direction. */
  accessor side: SidePanelSide;
  /** Panel width on wide screens. On phones the panel is the viewport width minus `edgeGutter`. */
  accessor width: SidePanelWidth;
  /** Above this layout width the panel becomes a fixed sidebar: always visible, no scrim, no trap, no trigger. */
  accessor persistent: SidePanelPersistent;
  /**
   * The landmark role the panel exposes, in persistent mode and as the shadow
   * region's role when open. Named `landmark`, not `role` — `Element` already
   * defines `role` via ARIA reflection.
   */
  accessor landmark: SidePanelLandmark;
  /** `false` (default, the disclosure pattern): no trap, focus stays on the trigger. `true`: a modal Dialog at the edge. */
  accessor modal;
  /**
   * Show the scrim in non-modal mode too (modal always has one). Attribute
   * is the negation, `no-scrim`, because a boolean attribute cannot express
   * `false` for a prop that defaults `true`.
   */
  accessor scrim;
  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe
   * gesture all request close. When false, only the trigger and footer
   * actions close it. Attribute is the negation, `no-dismiss`.
   */
  accessor dismissible;
  /**
   * On touch, a swipe toward the edge dismisses (native only — not wired up
   * on the web platform). Attribute is the negation, `no-swipe`.
   */
  accessor swipeable;
  /** Per-instance style overrides: `{ inset: 'layout.inset.md' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  accessor overrides: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** Whether the persistent breakpoint currently matches. */
  private accessor isPersistent;
  /** Whether the exit transition is playing. */
  private accessor closing;
  /** Whether the default slot currently has assigned content, for the dev warning. */
  private accessor hasBodyContent;
  private accessor dialogEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private triggerEl;
  private persistentQuery;
  private wasLogicalOpen;
  private wasOverlayOpen;
  private pendingReason;
  private focusTriggerOnClose;
  private closingProgrammatically;
  /** Whether the panel is currently open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private bodyOverrides;
  private readonly handleTriggerSlotChange;
  private attachTrigger;
  private detachTrigger;
  private updateTriggerExpanded;
  private readonly handleTriggerClick;
  private readonly handleBodySlotChange;
  private readonly handleBodyClick;
  private readonly handleCloseButtonPress;
  private readonly handleCancel;
  private readonly handlePanelKeydown;
  private readonly handleDialogClick;
  private readonly handleScrimPointerDown;
  private readonly handleOutsidePointerDown;
  private readonly handleNativeClose;
  private requestOpenChange;
  private openOverlay;
  private playExitAnimation;
  private finishOverlayClose;
  private applyInitialFocus;
  private findFirstBodyFocusable;
  private addOutsideListener;
  private removeOutsideListener;
  private setupPersistentQuery;
  private readonly handlePersistentChange;
  private dispatchOpenChange;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-side-panel": DsSidePanel;
  }
}
//#endregion
//#region src/Tabs.d.ts
type TabsActivation = "automatic" | "manual";
type TabsOrientation = "horizontal" | "vertical";
type TabsFit = "start" | "fill";
/** Shape of each entry in `tabs`. */
interface TabsTab {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
}
/** Detail carried by the `change` CustomEvent. */
interface TabsChangeDetail {
  value: string;
}
/** Overridable style hooks; see the `overrides` property. `tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `badgeColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "indicatorThickness" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
export declare class DsTabPanel extends LitElement {
  static override styles: CSSResult;
  override connectedCallback(): void;
  protected override render(): TemplateResult;
}
export declare class DsTabs extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The tabs in order. Two to about seven. A property, not an attribute. */
  accessor tabs: TabsTab[];
  /** Accessible name of the tab list. Not shown visually. */
  accessor label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  accessor value: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  accessor defaultValue: string | undefined;
  /** `automatic` selects a tab as arrow keys move to it; `manual` moves focus only, selecting on Enter/Space. */
  accessor activation: TabsActivation;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  accessor orientation: TabsOrientation;
  /** `fill` stretches tabs across the width; `start` packs them at the start. */
  accessor fit: TabsFit;
  /** Keep unselected panels in the light DOM (hidden) so their state survives switching. */
  accessor keepMounted;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled tab) on first update. */
  private accessor internalValue;
  /** The tab currently carrying the roving tabindex and (usually) real focus. */
  private accessor focusedId;
  private accessor tablistEl;
  private accessor indicatorEl;
  /** Panels detached from the light DOM while unselected (default, non-`keepMounted` behaviour). */
  private readonly detachedPanels;
  private resizeObserver?;
  private lastScrolledId;
  /** The currently selected tab id, controlled or not. */
  get currentValue(): string | null;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderTab;
  private readonly handleTabClick;
  private readonly handleKeydown;
  private handleSlotChange;
  private enabledTabs;
  private moveFocus;
  private focusEdge;
  private focusTab;
  private selectTab;
  /** Attaches/detaches and re-labels each `<ds-tab-panel>`, keeping their DOM order in sync with `tabs`. */
  private syncPanels;
  private updateIndicator;
  /** Keeps the selected tab in view when the tab list scrolls (overflowing tabs). */
  private maybeScrollSelectedIntoView;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-tabs": DsTabs;
    "ds-tab-panel": DsTabPanel;
  }
}
//#endregion
//#region src/SegmentedControl.d.ts
type SegmentedControlSize = "sm" | "md";
/** Shape of each entry in `options`. */
interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}
/** Detail carried by the `change` CustomEvent. */
interface SegmentedControlChangeDetail {
  value: string;
}
/** Overridable style hooks; see the `overrides` property. `groupBackground`, `segmentColor`, `segmentSelectedColor`, `segmentSelectedBackground`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type SegmentedControlOverridableBinding = "groupPadding" | "groupRadius" | "segmentShadow" | "segmentRadius" | "segmentPaddingInline" | "segmentPaddingBlock" | "segmentGap" | "segmentSpacing" | "selectedWeight" | "paddingBlockSm" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "transition" | "disabledOpacity";
export declare class DsSegmentedControl extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Accessible name of the control ("View mode"). Not shown. */
  accessor label: string;
  /** Two to five options in display order. A property, not an attribute. */
  accessor options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  accessor value: string | undefined;
  /** Initially selected value. Defaults to the first enabled option. */
  accessor defaultValue: string | undefined;
  /** Show icons only; every option must have one. Labels become accessible names. */
  accessor iconOnly;
  /** Toolbar (`sm`) or standard (`md`) height. */
  accessor size: SegmentedControlSize;
  /** Stretch to the container width with equal segments. */
  accessor fill;
  /** Per-instance style overrides: `{ segmentRadius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled option) on first update. */
  private accessor internalValue;
  /** The segment currently carrying the roving tabindex and (usually) real focus. */
  private accessor focusedValue;
  private accessor groupEl;
  private accessor indicatorEl;
  private resizeObserver?;
  /** The currently selected value, controlled or not. */
  get currentValue(): string | null;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderSegment;
  private readonly handleKeydown;
  private handleSegmentClick;
  private enabledOptions;
  private moveSelection;
  private selectEdge;
  private focusAndSelect;
  private select;
  private updateIndicator;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-segmented-control": DsSegmentedControl;
  }
}
//#endregion
//#region src/Listbox.d.ts
type ListboxMaxVisible = "5" | "8" | "12" | "all";
/** A single selectable entry (anatomy: option, optionLabel, optionDescription, optionIcon). */
interface ListboxItem {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}
/** A labelled group of entries (anatomy: group, groupLabel). */
interface ListboxGroupOption {
  group: string;
  options: ListboxOption[];
}
/** Flat or grouped entry in `options`. */
type ListboxOption = ListboxItem | ListboxGroupOption;
/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. */
type ListboxValue = string | string[];
/** Detail carried by the `change` CustomEvent. */
interface ListboxChangeDetail {
  value: ListboxValue;
}
/** Detail carried by the `active-change` CustomEvent. */
interface ListboxActiveChangeDetail {
  value: string | null;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `optionColor`, `optionDescriptionColor`, `optionActiveBackground`, `optionSelectedCheck`, `groupLabelColor`, `emptyColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type ListboxOverridableBinding = "border" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
export declare class DsListbox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Accessible name of the list. Ignored when `labelledBy` is set. */
  accessor label: string;
  /** Id of a visible element (in this shadow root) that labels the list, taking priority over `label`. */
  accessor labelledBy: string | undefined;
  /** Flat or grouped options in display order. A property, not an attribute. */
  accessor options: ListboxOption[];
  /** Allow any number of selections; the value becomes an array. */
  accessor multiple;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  accessor value: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  accessor defaultValue: ListboxValue | undefined;
  /**
   * Single-select only: arrow keys select as they move. Boolean attributes
   * cannot express `false` while the default is `true`, so the attribute is
   * the negation — `no-selection-follows-focus` present means this is `false`.
   */
  accessor selectionFollowsFocus;
  /** At least one option must be selected to submit when inside a Form. */
  accessor required;
  /**
   * Marks the list invalid. Usually set by the Form; can be set directly.
   * Not listed under this component's `platforms.lit.reflect`, so it is not
   * reflected to a host attribute — style consumers read the `.error` text
   * instead, as the schema defines no invalid-specific style binding.
   */
  accessor invalid;
  private errorValue?;
  /** Error message rendered below the list and linked by aria-describedby. Setting it implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; this list draws none of its own. */
  accessor embedded;
  /** The whole list is inert but readable. Individual options use `options[].disabled`. */
  accessor disabled;
  /** Field name for Form collection. Multiple values are collected as an array. */
  accessor name;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  accessor maxVisible: ListboxMaxVisible;
  /** The option active when the list first receives focus. Defaults to the first selected item, else the first enabled item. */
  accessor defaultActiveValue: string | undefined;
  /** Options are being fetched (async Combobox); shows `copy.loading` in place of the empty message and marks the list aria-busy. */
  accessor loading;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection (seeded from `defaultValue`). */
  private accessor internalValue;
  /**
   * The option currently carrying `aria-activedescendant`, public so a
   * composing `<ds-combobox>` can read it and keep its own activedescendant
   * in sync.
   */
  accessor activeValue: string | null;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor listEl;
  private readonly instanceId;
  private typeaheadQuery;
  private typeaheadTimer?;
  private readonly internals;
  constructor();
  /** Every selectable item, groups flattened, in document order. */
  private get flatItems();
  private get enabledItems();
  private get isDisabled();
  /** The current selection: a value, an array (`multiple`), or `null` when nothing is selected (no key in the Form). */
  get currentValue(): ListboxValue | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validationMessage(): string;
  private get selectedSet();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderOptionList;
  private renderOption;
  /** Public so a composing `<ds-combobox>` can forward its input's keydowns here. */
  readonly handleKey: (event: KeyboardEvent) => void;
  private readonly handleListFocus;
  private handleOptionClick;
  private handleOptionPointerEnter;
  private moveActive;
  private setActiveEdge;
  private pageActive;
  private extendSelection;
  private toggleSelectAll;
  private handleTypeahead;
  private selectActive;
  private orderValues;
  private setActive;
  private scrollActiveIntoView;
  private commitValue;
  /**
   * Mirrors value and validity into ElementInternals. `currentValue` can be
   * an array (`multiple`), which is outside `DsFormField`'s
   * `string | boolean | null` contract — see the generator's gap notes;
   * `<ds-form>` does not currently discover `<ds-listbox>` by tag.
   */
  private syncInternals;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-listbox": DsListbox;
  }
}
//#endregion
//#region src/Select.d.ts
type SelectNative = "auto" | "always" | "never";
type SelectSize = "sm" | "md";
/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. */
type SelectValue = string | string[];
/** Detail carried by the `change` CustomEvent. */
interface SelectChangeDetail {
  value: SelectValue;
}
/** Detail carried by the `open-change` CustomEvent. */
interface SelectOpenChangeDetail {
  open: boolean;
}
/**
 * Overridable style hooks; see the `overrides` property. `triggerBackground`,
 * `triggerBorder`, `valueColor`, `placeholderColor`, `chevron`,
 * `descriptionText`, `errorText`, `minTarget` and `focusRingWidth` are locked
 * and excluded.
 */
type SelectOverridableBinding = "triggerBorderFocus" | "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerPaddingBlockSm" | "triggerGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "lineHeight" | "minTargetSm" | "disabledOpacity" | "enter";
export declare class DsSelect extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered. */
  accessor label: string;
  /** Field name for the Form. */
  accessor name: string;
  /** The options, passed through to the composed Listbox. A property, not an attribute. */
  accessor options: ListboxOption[];
  /** Controlled value (array with `multiple`). Omit for uncontrolled. */
  accessor value: SelectValue | undefined;
  /** Initial value (array with `multiple`) for an uncontrolled field. */
  accessor defaultValue: SelectValue | undefined;
  /** Shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for `label`. */
  accessor placeholder: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  accessor hideLabel;
  /** sm for pickers inside toolbars and calendar headers. Not listed under this component's `platforms.lit.reflect`, but the fontSize/triggerPaddingBlockSm/minTargetSm bindings resolve per value and need an attribute selector, matching Button/Input's reflected `size` in this package — see the generator's gap notes. */
  accessor size: SelectSize;
  /** Controlled popup state, for programmatic opening and for stories and tests. Omit for the trigger-driven default. */
  accessor open: boolean | undefined;
  /** Pick any number. The trigger shows the count (or the labels when two or fewer); the popup stays open while toggling. */
  accessor multiple;
  /** Helper text under the label. */
  accessor description: string | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  accessor required;
  /** Not openable and not submitted. Stays visible and focusable. */
  accessor disabled;
  /** Marks the field invalid. Usually set by the Form. */
  accessor invalid;
  private errorValue?;
  /** Error message. Setting it implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /**
   * `auto` never uses the platform picker on web (the styled popup below is
   * used); `always` forces a native `<select>` (forms that must work without
   * JS); `never` forces the popup everywhere. `auto` and `never` render
   * identically on this platform.
   */
  accessor native: SelectNative;
  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value (seeded from `defaultValue`). */
  private accessor internalValue;
  /** Uncontrolled popup open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor triggerEl;
  private accessor nativeSelectEl;
  private accessor listboxEl;
  private accessor popupEl;
  private readonly popoverSupported;
  private wasOpen;
  private readonly internals;
  constructor();
  /** Every selectable item, groups flattened, in document order. */
  private get flatItems();
  private get isDisabled();
  /** Whether the popup is currently open, controlled or not. */
  get currentOpen(): boolean;
  /** The current selection: a value, an array (`multiple`), or `null` when nothing is selected (no key in the Form). */
  get currentValue(): SelectValue | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validationMessage(): string;
  private get selectedSet();
  /** The value passed to the composed Listbox — always defined, so it always stays controlled by this element. */
  private get listboxValue();
  private get displayLabels();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderNative;
  private renderNativeOptions;
  private readonly handleTriggerClick;
  private readonly handleTriggerKeydown;
  private readonly handleListboxChange;
  private readonly handleNativeChange;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private readonly handleWindowBlur;
  private activeOptionItem;
  private openPopup;
  private closePopup;
  /** Writes to `open` when controlled, else to `internalOpen`. */
  private setOpen;
  private handleOpened;
  private handleClosed;
  private defaultActiveValue;
  private hidePopupImmediately;
  private addGlobalListeners;
  private removeGlobalListeners;
  private updatePosition;
  private commitValue;
  private dispatchOpenChange;
  /** Mirrors value and validity into ElementInternals. */
  private syncInternals;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-select": DsSelect;
  }
}
//#endregion
//#region src/Combobox.d.ts
type ComboboxFilter = "startsWith" | "contains" | "none" | "async";
/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. With `allowCustom`, a value absent from `options` is a custom entry. */
type ComboboxValue = string | string[];
/** Detail carried by the `change` CustomEvent. */
interface ComboboxChangeDetail {
  value: ComboboxValue;
}
/** Detail carried by the `input-change` CustomEvent. */
interface ComboboxInputChangeDetail {
  value: string;
}
/** Detail carried by the `open-change` CustomEvent. */
interface ComboboxOpenChangeDetail {
  open: boolean;
}
/**
 * Overridable style hooks; see the `overrides` property. `fieldBackground`,
 * `fieldBorder`, `inputColor`, `placeholderColor`, `chipBackground`,
 * `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
type ComboboxOverridableBinding = "fieldBorderFocus" | "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
export declare class DsCombobox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered. */
  accessor label: string;
  /** Field name for the Form. */
  accessor name: string;
  /** The full option set, or the current page of results when `filter` is `async`. A property, not an attribute. */
  accessor options: ListboxOption[];
  /** Controlled selected value(s). Omit for uncontrolled. */
  accessor value: ComboboxValue | undefined;
  /** Initial selected value(s) for an uncontrolled field. */
  accessor defaultValue: ComboboxValue | undefined;
  /** Controlled text of the input. Usually uncontrolled; set it to drive `async` filtering. */
  accessor inputValue: string | undefined;
  /** Pick any number. Selections render as removable chips before the input; the list stays open while toggling. */
  accessor multiple;
  /** Typed text matching no option can be committed as a value. Enter or a comma commits it. */
  accessor allowCustom;
  /** How typing narrows `options`. */
  accessor filter: ComboboxFilter;
  /** Example input shown while empty. Never the only description. */
  accessor placeholder: string | undefined;
  /** Helper text under the label. */
  accessor description: string | undefined;
  /** Must have a value to submit. */
  accessor required;
  /** Not editable, not submitted, still readable and focusable. */
  accessor disabled;
  /** Marks the field invalid. Usually set by the Form. */
  accessor invalid;
  private errorValue?;
  /** Error message. Setting it implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** For `async`: show the loading row and announce it. Set by the consumer around its request. */
  accessor loading;
  /**
   * Show a clear button when there is a value or text. Boolean attributes
   * cannot express `false` while the default is `true`, so the attribute is
   * the negation — `no-clear` present means this is `false`.
   */
  accessor clearable;
  /** Per-instance style overrides: `{ fieldRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value (seeded from `defaultValue`). */
  private accessor internalValue;
  /** Uncontrolled input text (seeded from the initial single value's label). */
  private accessor internalText;
  /** Whether the popup is open. Not exposed as a property — see the generator's gap notes. */
  private accessor isOpen;
  /** Set by the toggle button so the list shows every option, ignoring any currently-typed filter query, until the next keystroke. */
  private accessor showAllOnOpen;
  /** Id (within the composed Listbox's own shadow root) of the active option, mirrored onto the input's `aria-activedescendant`. */
  private accessor activeDescendantId;
  /** Debounced text for the `status` live region. */
  private accessor announcedStatus;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private accessor listboxEl;
  private accessor popupEl;
  private readonly popoverSupported;
  private wasOpen;
  private pendingActivate;
  private statusTimer?;
  private readonly internals;
  constructor();
  /** Every selectable item, groups flattened, in document order. */
  private get flatItems();
  private get isDisabled();
  /** The current selection: a value, an array (`multiple`), or `null` when nothing is selected (no key in the Form). */
  get currentValue(): ComboboxValue | null;
  /** The current text of the input. */
  get currentText(): string;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validationMessage(): string;
  private get chipValues();
  private labelForValue;
  /** `options` narrowed per `filter`; `async` and `none` never filter (the consumer or the typeahead does). */
  private get filteredOptions();
  private filterOptions;
  /** The typed text as an `addCustom` row label, or `undefined` when custom entry does not apply. */
  private get customEntryLabel();
  /** Options passed to the composed Listbox: filtered, with the synthetic `addCustom` row first, or empty while `loading`. */
  private get listboxOptions();
  private get listboxValue();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  private computeInitialText;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderChip;
  private readonly handleInput;
  private activateTypeaheadMatch;
  private readonly handleInputKeydown;
  private commitActive;
  private commitOptionValue;
  private commitCustomValue;
  private readonly handleListboxChange;
  private readonly handleListboxActiveChange;
  private readonly handleClearPress;
  private readonly handleTogglePress;
  private handleChipRemovePress;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private readonly handleWindowBlur;
  private setText;
  private clearText;
  private clearAll;
  private setSingleValue;
  private toggleChipValue;
  private addChipValue;
  private removeChipValue;
  private removeLastChip;
  private commitValue;
  private openList;
  private closeList;
  private activateEdge;
  private handleOpened;
  private handleClosed;
  private hidePopupImmediately;
  private addGlobalListeners;
  private removeGlobalListeners;
  private updatePosition;
  private dispatchOpenChange;
  /** Mirrors the active option onto the input's `aria-activedescendant`, using the cross-shadow-root element reflection where the browser supports it (see the generator's gap notes). */
  private syncActiveDescendant;
  private computeStatusText;
  /** Debounces the `status` live region so fast typing announces once it settles. */
  private syncStatus;
  /** Mirrors value and validity into ElementInternals. */
  private syncInternals;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-combobox": DsCombobox;
  }
}
//#endregion
//#region src/Slider.d.ts
type SliderShowValue = "always" | "hover" | "never";
/** Shape of each entry in `marks`. */
interface SliderMark {
  value: number;
  label?: string | undefined;
}
/** A single value, or `[min, max]` for `range`. */
type SliderValue = number | [number, number];
/** Detail carried by the `change` and `change-end` CustomEvents. */
interface SliderChangeDetail {
  value: SliderValue;
}
/**
 * Overridable style hooks; see the `overrides` property. `fill`, `thumbBorder`,
 * `markLabelColor`, `valueColor`, `bubbleSurface`, `bubbleText`,
 * `descriptionText`, `minTarget`, `focusRing` and `focusRingWidth` are locked
 * and excluded.
 */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbBorderWidth" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "mark" | "markSize" | "markLabelSize" | "valueSize" | "labelWeight" | "partGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "errorText" | "disabledOpacity" | "transition";
export declare class DsSlider extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label naming the quantity. Also the accessible name (or its basis, for a range). */
  accessor label;
  /** Field name for the Form. A range contributes two entries under this name. */
  accessor name;
  /** Lower bound. */
  accessor min;
  /** Upper bound. */
  accessor max;
  /** Arrow-key increment and snapping granularity. */
  accessor step;
  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark). */
  accessor snapToMarks;
  /** Must have a value other than the default to submit. */
  accessor required;
  /** Controlled value; for a range, `[min, max]`. Omit for an uncontrolled slider. */
  accessor value: SliderValue | undefined;
  /** Initial value (or pair) for an uncontrolled slider. Defaults to `min` (or `[min, max]`). */
  accessor defaultValue: SliderValue | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  accessor range;
  /** Renders the displayed and announced value. Defaults to the plain number. */
  accessor formatValue: ((value: number) => string) | undefined;
  /** Where the value text appears: beside the label, as a bubble while dragging/focused, or never (visually). */
  accessor showValue: SliderShowValue;
  /** Tick marks on the track, optionally labelled. */
  accessor marks: SliderMark[];
  /** Not adjustable. Stays visible, readable and focusable (WCAG 2.1.1); interaction is guarded, not removed. */
  accessor disabled;
  /** Persistent helper text. */
  accessor description: string | undefined;
  /** Per-instance style overrides: `{ trackRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  private errorValue?;
  /** The error message. Setting it implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Marks the slider as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  /** Uncontrolled value (seeded from `defaultValue`, or the current bounds, when nothing else is set). */
  private accessor internalValue;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  /** Index of the thumb currently being dragged (halo + bubble). */
  private accessor draggingIndex;
  /** Index of the thumb currently focused (bubble in `showValue: hover`). */
  private accessor focusedIndex;
  /** Set by `keydown` so the matching `keyup` knows to fire `change-end`. */
  private pendingEndIndex;
  private readonly instanceId;
  private accessor trackEl;
  private readonly internals;
  constructor();
  /** The current value (or pair), resolved from `value`, `internalValue`, `defaultValue`, then the bounds. */
  get currentValue(): SliderValue;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderMark;
  private renderThumb;
  private get isDisabled();
  private get labelId();
  private get minLabelId();
  private get maxLabelId();
  private get thumbEls();
  private pairValue;
  private thumbValue;
  private formatOne;
  private formatDisplay;
  private percentFor;
  /** Rounds to the nearest `step` from `min`, then clamps to the bounds. */
  private snap;
  private positionToValue;
  /** Nearest `marks` value to `value`, used for drag/click when `snapToMarks` is set. */
  private snapToNearestMark;
  private nearestIndex;
  private readonly handleTrackPointerDown;
  private readonly handleTrackPointerMove;
  private readonly handleTrackPointerUp;
  private handleThumbKeydown;
  private handleThumbKeyup;
  private handleThumbFocus;
  private handleThumbBlur;
  /** PageUp/PageDown: ten steps, or to the next mark when `marks` is set. */
  private page;
  private setThumbValue;
  private commitValue;
  private dispatchChangeEnd;
  private get labelTextOverrides();
  private get valueTextOverrides();
  private get descriptionTextOverrides();
  /** bubbleText: color.inverse.foreground, locked — forwarded as a fixed override, like Tooltip's popup text. */
  private get bubbleTextOverrides();
  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals;
  /** Whether the current value is still the untouched default, for `required`. */
  private get isAtDefault();
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-slider": DsSlider;
  }
}
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
/** Detail carried by the `change` CustomEvent. */
interface NumberInputChangeDetail {
  value: number | undefined;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `affixColor`, `descriptionText`,
 * `errorText`, `minTarget` and `focusRingWidth` are locked and excluded.
 */
type NumberInputOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "stepperGap" | "stepperDivider" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
export declare class DsNumberInput extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label naming the quantity. Its accessible-name basis (via `aria-labelledby`; see class doc). */
  accessor label;
  /** Field name for the Form. The collected value is a number, or undefined when empty. */
  accessor name;
  /** Lower bound. Clamps on blur/Enter; disables the decrement stepper at it. */
  accessor min: number | undefined;
  /** Upper bound. Clamps on blur/Enter; disables the increment stepper at it. */
  accessor max: number | undefined;
  /** Increment for the steppers and arrow keys, and the rounding granularity when `precision` is omitted. */
  accessor step;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  accessor precision: number | undefined;
  /** Locale formatting of the displayed value. The underlying value is always a plain number. */
  accessor format: NumberInputFormat;
  /** ISO 4217 code for `format: currency`. */
  accessor currency: string | undefined;
  /** Intl unit identifier for `format: unit`, or a literal shown as `suffix` when it is not one. */
  accessor unit: string | undefined;
  /**
   * Static text before the value, for cases `format` cannot express. Typed
   * `string | null` (not `| undefined`) because it collides with the native,
   * readonly `Element.prefix` (namespace prefix) that `DsNumberInput`
   * inherits; `null` means no prefix.
   */
  accessor prefix: string | null;
  /** Static text after the value. */
  accessor suffix: string | undefined;
  /** Shows the increment/decrement steppers. Arrow keys work regardless. Exposed as the negated `hide-steppers` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  accessor showSteppers;
  /** Example value shown while empty. */
  accessor placeholder: string | undefined;
  /** Helper text. */
  accessor description: string | undefined;
  /** Controlled numeric value. `undefined` means empty. */
  accessor value: number | undefined;
  /** Initial value for an uncontrolled field. */
  accessor defaultValue: number | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  accessor required;
  /** Not editable, not submitted, still readable. */
  accessor disabled;
  /** Marks the field invalid. Usually set by the Form; can be set directly. */
  accessor invalid;
  private errorValue?;
  /** Error message; implies `invalid`. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value, seeded from `defaultValue` through the `currentValue` fallback chain. */
  private accessor internalValue;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  /** Whether the input currently has focus; drives raw-text vs. formatted display. */
  private accessor isFocused;
  /** The uncommitted, sanitized text shown while focused. */
  private accessor rawText;
  private readonly instanceId;
  private repeatTimeoutId?;
  private repeatIntervalId?;
  private accessor inputEl;
  private readonly internals;
  constructor();
  /** The current value, resolved from `value`, `internalValue`, then `defaultValue`. */
  get currentValue(): number | undefined;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get labelId();
  private get atMin();
  private get atMax();
  private get resolvedPrecision();
  private readonly stopInnerPress;
  private handleFocus;
  private handleBlur;
  private handleInput;
  private handleKeydown;
  private readonly handleStepperPointerDown;
  private clearRepeat;
  private durationMs;
  /** ArrowUp/Down and PageUp/Down by `step` (×10 for Page), and stepper presses. */
  private adjustValue;
  /** Home/End: jump straight to a defined bound. */
  private commitAndSync;
  /** Rounds and clamps the typed value on blur/Enter, reporting `outOfRange` when required and clamped. */
  private commit;
  private commitValue;
  private clampToBounds;
  private roundToPrecision;
  /** Keeps digits, a leading minus, and one decimal separator (the locale's, or a period). */
  private sanitizeInput;
  private parseNumber;
  private plainString;
  private localeDecimalSeparator;
  private formatDisplay;
  private plainFormat;
  private safeFormat;
  private get labelTextOverrides();
  private get descriptionTextOverrides();
  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-number-input": DsNumberInput;
  }
}
//#endregion
//#region src/ProgressBar.d.ts
type ProgressBarTone = "neutral" | "success" | "danger";
type ProgressBarAnnounce = "none" | "milestones" | "complete";
/**
 * Overridable style hooks; see the `overrides` property. `fill`, `fillSuccess`,
 * `fillDanger`, `labelColor` and `valueColor` are locked and excluded.
 */
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "transition" | "indeterminateLoop";
export declare class DsProgressBar extends LitElement {
  static override styles: CSSResult;
  /** What is progressing ("Uploading photos"). The accessible name, visible unless `hideLabel`. */
  accessor label;
  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar. */
  accessor value: number | undefined;
  /** Start of the range. */
  accessor min;
  /** End of the range. */
  accessor max;
  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage of the range. */
  accessor formatValue: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text beside the label. Ignored when indeterminate. Exposed as the negated `hide-value` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  accessor showValue;
  /** Visually hides the label; it remains the accessible name. */
  accessor hideLabel;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. */
  accessor tone: ProgressBarTone;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  accessor announce: ProgressBarAnnounce;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (fill, fillSuccess, fillDanger, labelColor, valueColor) are ignored. */
  accessor overrides: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
  /** Text of the last announcement made to the live region. */
  private accessor liveMessage;
  /** Highest 25%-tier (0/25/50/75/100) already announced, for `announce: milestones`. */
  private announcedMilestone;
  /** Whether `copy.complete` has already been announced for the current run. */
  private announcedComplete;
  /** Whether `copy.indeterminate` has already been announced for the current indeterminate run. */
  private announcedIndeterminate;
  override connectedCallback(): void;
  /** Whether `value` is omitted (the end of the task is unknown). */
  get isIndeterminate(): boolean;
  /** `value` clamped to `min`…`max`. `min` when indeterminate, non-finite, or `max <= min`. */
  get clampedValue(): number;
  /** Fill percentage, 0–100. 0 when indeterminate. */
  get percent(): number;
  /** The formatted value text, from `formatValue` or the default percentage of the range. */
  get displayText(): string;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /** `role`/`aria-value*` as plain host attributes — see the class doc for why not `ElementInternals`. */
  private syncHostAria;
  /** Drives the live region from `announce`, per `copy.progress` / `copy.complete` / `copy.indeterminate`. */
  private updateAnnouncements;
  private get labelTextOverrides();
  private get valueTextOverrides();
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-progress-bar": DsProgressBar;
  }
}
//#endregion
//#region src/Stepper.d.ts
type StepperOrientation = "horizontal" | "vertical";
type StepperNavigable = "none" | "completed" | "all";
type StepperStepStatus = "complete" | "current" | "upcoming" | "error";
/** Shape of each entry in `steps`. */
interface StepperStep {
  id: string;
  label: string;
  description?: string | undefined;
  status?: StepperStepStatus | undefined;
}
/** Detail carried by the `step-select` CustomEvent. */
interface StepperStepSelectDetail {
  id: string;
}
/** Overridable style hooks; see the `overrides` property. `indicatorBorder`, `indicatorCompleteBackground`, `indicatorCompleteForeground`, `indicatorCurrentBorder`, `indicatorErrorBackground`, `indicatorErrorForeground`, `indicatorErrorBorder`, `connectorComplete`, `labelColor`, `labelUpcomingColor`, `descriptionColor`, `indicatorColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorBorderWidth" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "connectorWidth" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "stepHover" | "stepRadius" | "stepGap" | "partGap" | "fontFamily" | "transition";
export declare class DsStepper extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The steps in order. A property, not an attribute. */
  accessor steps: StepperStep[];
  /** The id of the current step. */
  accessor current;
  /** Vertical shows descriptions under each label; horizontal collapses to `compact` below the prose width. */
  accessor orientation: StepperOrientation;
  /** Which steps are focusable controls: `none`, `completed` (the usual — go back, not skip ahead), or `all`. */
  accessor navigable: StepperNavigable;
  /** Show only the current step's label and "Step n of m"; the indicators stay. Automatic on narrow horizontal steppers. */
  accessor compact;
  /** Accessible name of the navigation landmark. */
  accessor label;
  /** Per-instance style overrides: `{ transition: 'motion.duration.slow' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderStep;
  private renderIndicator;
  private isNavigable;
  private handleStepClick;
  /** Forwards this component's own overrides down to a composed `<ds-text>`'s `overrides` property. */
  private textOverrides;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-stepper": DsStepper;
  }
}
//#endregion
//#region src/Search.d.ts
type SearchSize = "md" | "lg";
/** A single suggestion (anatomy: suggestions). */
interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}
/** Detail carried by the `change` CustomEvent. */
interface SearchChangeDetail {
  value: string;
}
/** Detail carried by the `submit` CustomEvent. */
interface SearchSubmitDetail {
  value: string;
}
/** Detail carried by the `clear` CustomEvent (none). */
type SearchClearDetail = void;
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `iconColor`, `border`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
type SearchOverridableBinding = "borderFocus" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockLg" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "disabledOpacity";
export declare class DsSearch extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Accessible name ("Search products"). Visually hidden unless `showLabel`. */
  accessor label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  accessor showLabel;
  /** Field name; the query key when the form submits to a URL. */
  accessor name;
  /** Controlled query. Omit for uncontrolled. */
  accessor value: string | undefined;
  /** Initial query for an uncontrolled field. */
  accessor defaultValue: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  accessor placeholder: string | undefined;
  /** URL to submit to with GET. When omitted, `submit` handles it and nothing navigates. */
  accessor action: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field.
   * Omit entirely for a plain search field; pass an array (even empty, while
   * fetching) to turn the field into a combobox. A property, not an
   * attribute — provide it from `change` (debounced by the caller).
   */
  accessor suggestions: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  accessor loading;
  /**
   * Wrap in the `search` Landmark. Boolean attributes cannot express `false`
   * while the default is `true`, so the attribute is the negation —
   * `no-landmark` present means this is `false`.
   */
  accessor landmark;
  /** `lg` for a search page's hero field. */
  accessor size: SearchSize;
  /** Not editable, still readable. */
  accessor disabled;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Whether the suggestions popup is open. Not exposed as a property — see the generator's gap notes. */
  private accessor isOpen;
  /** Id (within the composed Listbox's own shadow root) of the active suggestion, mirrored onto the input's `aria-activedescendant`. */
  private accessor activeDescendantId;
  /** Debounced text for the `status` live region. */
  private accessor announcedStatus;
  private accessor inputEl;
  private accessor listboxEl;
  private accessor popupEl;
  private readonly popoverSupported;
  private wasOpen;
  private activateFirstOnOpen;
  private statusTimer?;
  /** Light-DOM `<form>` this element creates on demand to navigate to `action` (a shadow-root form does not participate in the page). */
  private navigationForm?;
  /** The current string value of the field. */
  get currentValue(): string;
  /** Whether `suggestions` turns this field into a combobox. */
  private get hasSuggestionsFeature();
  private get listboxOptions();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private readonly handleInput;
  private readonly handleInputKeydown;
  private readonly handleFormSubmit;
  private readonly handleClearPress;
  private readonly handleListboxChange;
  private readonly handleListboxActiveChange;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private readonly handleWindowBlur;
  private clearQuery;
  private commitSuggestion;
  private submitQuery;
  private navigateTo;
  private closeList;
  private moveActiveDown;
  /** From no active suggestion or the first, clears the highlight (back to the input); otherwise moves up one — never wraps to the last. */
  private moveActiveUp;
  private handleOpened;
  private handleClosed;
  private hidePopupImmediately;
  private addGlobalListeners;
  private removeGlobalListeners;
  private updatePosition;
  /** Mirrors the active suggestion onto the input's `aria-activedescendant`, using the cross-shadow-root element reflection where the browser supports it (see the generator's gap notes). */
  private syncActiveDescendant;
  private computeStatusText;
  /** Debounces the `status` live region so fast typing announces once it settles. */
  private syncStatus;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-search": DsSearch;
  }
}
//#endregion
//#region src/DatePicker.d.ts
/** `value`/`defaultValue` shape: an ISO calendar date, or `{ start, end }` of them with `range`. Never a `Date` — a calendar date has no time zone. */
type DatePickerValue = string | {
  start: string;
  end: string;
};
type DatePickerSize = "sm" | "md";
/** Detail carried by the `change` CustomEvent. `undefined` when the value is cleared. */
interface DatePickerChangeDetail {
  value: DatePickerValue | undefined;
}
/** Detail carried by the `open-change` CustomEvent. */
interface DatePickerOpenChangeDetail {
  open: boolean;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `rangeSeparatorColor`,
 * `calendarSurface`, `daySelectedBackground`, `daySelectedForeground`,
 * `dayInRangeBackground`, `dayTodayBorder`, `dayOutsideMonthColor`,
 * `weekdayColor`, `descriptionText`, `errorText`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
type DatePickerOverridableBinding = "borderFocus" | "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "paddingBlockSm" | "paddingInlineSm" | "calendarInset" | "calendarGap" | "daySize" | "dayGap" | "dayRadius" | "dayHover" | "dayTodayBorderWidth" | "weekdaySize" | "weekdayWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "minTargetSm" | "disabledOpacity" | "transition";
export declare class DsDatePicker extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered. */
  accessor label: string;
  /** Field name for the Form. The value is an ISO date string, or (`range`) `{ start, end }` of them. */
  accessor name: string;
  /** Controlled value (ISO date, or a range). Omit for uncontrolled. */
  accessor value: DatePickerValue | undefined;
  /** Initial value for an uncontrolled field. */
  accessor defaultValue: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and
   * tests. Omit for the button-driven default. Not listed under this
   * component's `platforms.lit.reflect`, but reflected anyway, matching
   * Popover's `open`.
   */
  accessor open: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  accessor range;
  /** Earliest selectable date (ISO). Earlier days are disabled; the error uses `copy.tooEarly`. */
  accessor min: string | undefined;
  /** Latest selectable date (ISO). */
  accessor max: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by keyboard movement. */
  accessor isDateDisabled: ((isoDate: string) => boolean) | undefined;
  /** BCP 47 locale for month/weekday names, the first day of the week, and the typed format. Defaults to the device locale. */
  accessor locale: string | undefined;
  /** An ISO week-number column at the start of each row. */
  accessor showWeekNumbers;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  accessor placeholder: string | undefined;
  /** Helper text. */
  accessor description: string | undefined;
  /** Must have a value to submit. */
  accessor required;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it. */
  accessor hideLabel;
  /**
   * `sm` for fields inside grid cells and toolbars: minimum target height,
   * tighter padding, small type. Not listed under this component's
   * `platforms.lit.reflect`, but reflected anyway since the size variant is
   * expressed as a CSS attribute selector, matching Input's `size`.
   */
  accessor size: DatePickerSize;
  /** Not editable, still readable. */
  accessor disabled;
  /** Marks the field invalid. Usually set by the Form. */
  accessor invalid;
  private errorValue?;
  /** Error message; implies invalid. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value / start (seeded from `value` ?? `defaultValue`, and re-seeded whenever a controlled `value` changes). */
  private accessor internalStart;
  /** Uncontrolled range end. Unused outside `range`. */
  private accessor internalEnd;
  /** Raw typed text of the start (or single) input. */
  private accessor textStart;
  /** Raw typed text of the end input. `range` only. */
  private accessor textEnd;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** The visible month, 0-based. */
  private accessor viewYear;
  private accessor viewMonth;
  /** The roving-tabindex day. Cleared on close so the next open recomputes it. */
  private accessor focusedDate;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor startInputEl;
  private accessor endInputEl;
  private accessor popoverEl;
  private accessor calendarButtonEl;
  private wasOpen;
  /** The last value a `change` event was fired for, so a no-op mutation never re-dispatches it. */
  private lastEmittedValue;
  private readonly internals;
  constructor();
  private get isDisabled();
  /** Whether the calendar is currently open, controlled or not. */
  private get isOpen();
  /** Routes an open-state change through the controlled `open` prop or `internalOpen`, and fires `open-change` when it actually changes. */
  private setOpen;
  /** The committed value: the ISO date, `{ start, end }` once both are set (`range`), or `null`. */
  get currentValue(): DatePickerValue | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validationMessage(): string;
  private get monthOptions();
  private get yearRange();
  private get yearOptions();
  private get weekdayLabels();
  private get calendarWeeks();
  override connectedCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  private seedFromValue;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderDay;
  private isDayDisabled;
  private nextEnabledDate;
  private startOfWeek;
  private endOfWeek;
  private moveViewTo;
  private moveFocusTo;
  private readonly handleGridKeydown;
  private handleDayClick;
  private closeCalendar;
  private focusCalendarButton;
  private focusSelectedOrToday;
  private readonly handlePrevMonthPress;
  private readonly handleNextMonthPress;
  private shiftView;
  private readonly handleMonthChange;
  private readonly handleYearChange;
  private readonly handleTodayPress;
  private readonly handleClearPress;
  private handleTextInput;
  private handleInputKeydown;
  private readonly handlePopoverOpenChange;
  private valuesEqual;
  private maybeEmitChange;
  /** Mirrors value and validity into ElementInternals. */
  private syncInternals;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-date-picker": DsDatePicker;
  }
}
//#endregion
//#region src/Toolbar.d.ts
type ToolbarOrientation = "horizontal" | "vertical";
type ToolbarOverflow = "wrap" | "menu" | "scroll";
type ToolbarSize = "sm" | "md";
type ToolbarDensity = "compact" | "comfortable";
/** Overridable style hooks; see the `overrides` property. `background`, `focusRing` and `focusRingWidth` are locked and excluded. */
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "itemGapCompact" | "groupGap" | "separatorLength" | "fadeWidth";
export declare class DsToolbarGroup extends LitElement {
  static override styles: CSSResult;
  override connectedCallback(): void;
  protected override render(): TemplateResult;
}
export declare class DsToolbar extends LitElement {
  static override styles: CSSResult;
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; the toolbar's accessible name. */
  accessor label: string;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  accessor orientation: ToolbarOrientation;
  /** Trailing-control behavior when the toolbar does not fit: wrap onto more rows, collapse into a "More" menu, or scroll with faded edges. */
  accessor overflow: ToolbarOverflow;
  /** Default size passed to child controls that have not set their own `size`. */
  accessor size: ToolbarSize;
  /** Gap between controls: tight (`compact`) or normal (`comfortable`) rhythm. */
  accessor density: ToolbarDensity;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
  /** Controls currently collapsed into the overflow menu, built from their `overflow-label` attribute. */
  private accessor overflowItems;
  private accessor containerEl;
  private accessor overflowMenuEl;
  /** The control that currently carries the roving tabindex (and, usually, real focus). */
  private focusedControl;
  /** In the same order as `overflowItems`, so choosing an item can `click()` the original element. */
  private overflowTargets;
  private resizeObserver?;
  /** Watches the whole light-DOM subtree: a control added inside an existing `<ds-toolbar-group>` does not
	fire the default slot's `slotchange`, since it is assigned to that group's own inner slot instead. */
  private readonly mutationObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /** `role`/`aria-label`/`aria-orientation` as plain host attributes — see the class doc for why not `ElementInternals`. */
  private syncHostAria;
  private readonly handleOverflowAction;
  private readonly handleFocusIn;
  private readonly handleKeydown;
  /** True while focus is inside a control that keeps its own arrow-key model (SegmentedControl, RadioGroup) or
	inside an open overflow Menu, so the toolbar must not steal the key. */
  private shouldDelegateToChild;
  private moveFocus;
  private focusEdge;
  private focusTo;
  private isDisabled;
  /** Every non-decorative control, direct child or one level inside a `<ds-toolbar-group>`; a control's own
	internals (e.g. an icon slotted into it) are never descended into. */
  private topLevelControls;
  /** `topLevelControls()` filtered to what the roving tabindex may land on, plus the overflow trigger when it's showing. */
  private focusableCandidates;
  private syncRovingTabindex;
  private handleChildrenChanged;
  /** Inserts a `<ds-divider>` between adjacent `<ds-toolbar-group>` children and removes one that no longer sits
	between two groups. */
  private syncSeparators;
  /** Perpendicular orientation, and length/spacing forwarded to the Divider's own hooks (never its shadow tree). */
  private applySeparatorGeometry;
  private syncGroupOrientation;
  /** One-time default: a control that has not set its own `size` gets the toolbar's. A later change to the
	toolbar's `size` does not retroactively revisit controls already defaulted. */
  private applyDefaultSizes;
  private resetOverflow;
  /** Measures the top-level controls and, when they do not fit `.container`, hides as many trailing ones as
	needed and rebuilds the overflow menu from their `overflow-label` attribute. */
  private recalcOverflow;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-toolbar": DsToolbar;
    "ds-toolbar-group": DsToolbarGroup;
  }
}
//#endregion
//#region src/Carousel.d.ts
type CarouselPicker = "dots" | "tabs" | "none";
type CarouselChangeReason = "next" | "prev" | "picker" | "swipe" | "autoplay";
/** Detail carried by the `change` CustomEvent. */
interface CarouselChangeDetail {
  index: number;
  reason: CarouselChangeReason;
}
/** Overridable style hooks; see the `overrides` property. `controlBackground`, `dot`, `dotActive`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotTarget" | "radius" | "transition";
export declare class DsCarouselSlide extends LitElement {
  static override styles: CSSResult;
  /** The slide's own name, used in its positional label and as the tabs-picker label. */
  accessor heading: string | undefined;
  override connectedCallback(): void;
  protected override render(): TemplateResult;
}
export declare class DsCarousel extends LitElement {
  static override styles: CSSResult;
  /** What the carousel shows ("Featured products"). Not visible; the region's accessible name. */
  accessor label: string;
  /** Slides visible at once at the widest layout; fewer show as the viewport narrows. */
  accessor perView;
  /** Next from the last slide returns to the first. Off by default so users can tell where the end is. */
  accessor loop;
  /** Rotates every `interval`. Starts only without reduced motion; stops on hover, focus, touch, or pause, and never restarts on its own. */
  accessor autoplay;
  /** Milliseconds between automatic advances. Below 5000 is refused in development. */
  accessor interval;
  /** How slides are chosen directly. */
  accessor picker: CarouselPicker;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  accessor activeIndex: number | undefined;
  /** Swiping or scrolling snaps to slide boundaries. Exposed as the negated `no-snap` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  accessor snap;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled current slide, updated by navigation and by the intersection observer. */
  private accessor internalIndex;
  /** The picker item currently carrying the roving tabindex. */
  private accessor focusedPickerIndex;
  private accessor hovering;
  private accessor focusWithin;
  private accessor touching;
  private accessor userPaused;
  private accessor reducedMotion;
  private accessor announceText;
  private accessor viewportEl;
  private intersectionObserver?;
  private reducedMotionQuery?;
  private timer?;
  private currentIntervalMs?;
  private readonly uid;
  /** Set for a short window after a programmatic scroll, so the intersection observer's own index sync does not re-dispatch a duplicate `change`. */
  private suppressSwipeUntil;
  /** The current slide index, controlled or not. */
  get currentIndex(): number;
  /** Total slotted `<ds-carousel-slide>` children. */
  get total(): number;
  private get isPlaying();
  private get canGoPrev();
  private get canGoNext();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderPicker;
  private renderDotItem;
  private renderTabItem;
  private readonly handlePlayPause;
  private readonly handlePrev;
  private readonly handleNext;
  private handlePickerSelect;
  private readonly handlePickerKeydown;
  private movePickerFocus;
  private selectFromPicker;
  private readonly handlePointerEnter;
  private readonly handlePointerLeave;
  private readonly handleFocusIn;
  private readonly handleFocusOut;
  private readonly handleTouchStart;
  private readonly handleTouchEnd;
  private readonly handleReducedMotionChange;
  private readonly handleSlotChange;
  private readonly handleIntersect;
  private syncActiveFromVisibility;
  private step;
  private clampIndex;
  /** Navigates to `index`, dispatching `change` and announcing the result. `autoplay` always wraps regardless of `loop` — see the generation gap note. */
  private moveTo;
  private tickAutoplay;
  private scrollToIndex;
  private slideElements;
  /** Stamps `role`, `aria-roledescription`, `id` and the positional `aria-label` onto each slide, and (re)registers it with the intersection observer. */
  private syncSlides;
  /** `role`/`aria-roledescription`/`aria-label` as plain host attributes, so the accessible-name tests can read them. */
  private syncHostAria;
  private get effectiveInterval();
  private syncAutoplay;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-carousel": DsCarousel;
    "ds-carousel-slide": DsCarouselSlide;
  }
}
//#endregion
//#region src/Table.d.ts
/** A single record. `id` must be stable across renders; it is what selection and keys use. */
interface TableRow {
  id: string;
  [key: string]: unknown;
}
type TableColumnAlign = "start" | "end" | "center";
type TableColumnWidth = "auto" | "min" | "fill";
type TableColumnHideBelow = "prose" | "content";
/** A column definition. Exactly one column in `columns` should set `isRowHeader`. */
interface TableColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: TableColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: TableColumnWidth | undefined;
  isRowHeader?: boolean | undefined;
  hideBelow?: TableColumnHideBelow | undefined;
  /** Formats the cell. Lit templates (never raw HTML) — e.g. `<ds-text tone="muted">` for a secondary value
	(`cellMutedColor`). Omitted on the row-header column enables the built-in row Button that fires `row-press`. */
  render?: ((row: TableRow) => unknown) | undefined;
}
type TableSortDirection = "ascending" | "descending";
interface TableSort {
  column: string;
  direction: TableSortDirection;
}
type TableCaptionLevel = "2" | "3" | "4";
type TableSelectable = "none" | "single" | "multiple";
type TableResponsive = "stack" | "scroll";
type TableMaxHeight = "none" | "viewport";
type TableDensity = "compact" | "comfortable";
/** Detail carried by the `sort-change` CustomEvent. */
interface TableSortChangeDetail {
  column: string;
  direction: TableSortDirection;
}
/** Detail carried by the `selection-change` CustomEvent. */
interface TableSelectionChangeDetail {
  selected: string[];
}
/** Detail carried by the `row-press` CustomEvent. */
interface TableRowPressDetail {
  id: string;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `headerSurface`, `headerColor`, `rowStripe`,
`rowSelected`, `rowSelectedBorder`, `cellColor`, `cellMutedColor`, `stackedLabelColor`, `minTarget`, `focusRing`
and `focusRingWidth` are locked and excluded. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellPaddingInlineCompact" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
export declare class DsTable extends LitElement {
  static override styles: CSSResult;
  /** What the table lists ("Open invoices"). Rendered as the `<caption>` and the accessible name. */
  accessor caption: string;
  /** Heading level of the caption in the page outline; its size (`captionSize`) is fixed regardless. */
  accessor captionLevel: TableCaptionLevel;
  /** Visually hides the caption; it remains the accessible name. */
  accessor hideCaption;
  /** Column definitions in display order. A property, not an attribute. */
  accessor columns: TableColumn[];
  /** The rows. `id` must be stable. A property, not an attribute. */
  accessor data: TableRow[];
  /** Controlled sort state. When set, the table shows it but never sorts `data` itself. */
  accessor sort: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  accessor defaultSort: TableSort | undefined;
  /** Adds a selection column: a Checkbox per row (radio-like for `single`) and, for `multiple`, a select-all in the header. */
  accessor selectable: TableSelectable;
  /** Controlled selected row ids. */
  accessor selected: string[] | undefined;
  /** Initially selected ids, for uncontrolled use. */
  accessor defaultSelected: string[];
  /** `stack` turns each row into a labelled block below the prose width; `scroll` keeps columns and scrolls horizontally. */
  accessor responsive: TableResponsive;
  /** The header row stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute. */
  accessor stickyHeader;
  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  accessor maxHeight: TableMaxHeight;
  /** Cell padding. */
  accessor density: TableDensity;
  /** Alternate row backgrounds. */
  accessor striped;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** Data is being fetched: the body shows `copy.loading` and `aria-busy` is set. Existing rows stay visible. */
  accessor loading;
  /** Renders a trailing actions cell per row. Kept out of `columns` so the header can be a visually-hidden "Actions". */
  accessor rowActions: ((row: TableRow) => unknown) | undefined;
  /** Per-instance style overrides: `{ captionSize: 'font.size.lg' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled sort state, seeded from `defaultSort`. */
  private accessor internalSort;
  /** Uncontrolled selection, seeded from `defaultSelected`. */
  private accessor internalSelected;
  /** Text announced through the shared live region (sort or selection changes). */
  private accessor liveMessage;
  private accessor sentinelEl;
  private accessor wrapperEl;
  private accessor scrollRegionEl;
  private headerObserver?;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderColgroup;
  private renderSelectionHeaderCell;
  private renderColumnHeader;
  private renderEmptyRow;
  private renderRow;
  private renderSelectionCell;
  private renderCell;
  private headerCellClass;
  private bodyCellClass;
  private sortButtonLabel;
  private currentSort;
  private currentSelected;
  /** Sorted for uncontrolled use only; a controlled `sort` means the caller already sorted `data`. */
  private sortedRows;
  private handleSort;
  private handleSelectAllChange;
  private handleSelectRow;
  private commitSelection;
  private handlePress;
  private handleScrollKeydown;
  private handleScroll;
  /** Toggles `data-header-scrolled` once the body has scrolled beneath the sticky header. */
  private setupHeaderObserver;
  /** `captionSize`/`captionWeight` overrides forwarded to the composed Heading; its own default weight and this
	fixed `size="md"` already match the caption tokens, so nothing is forwarded unless the consumer overrides them. */
  private get captionOverrides();
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-table": DsTable;
  }
}
//#endregion
//#region src/DataGrid.d.ts
/** A single record. `id` must be stable across renders. */
interface DataGridRow {
  id: string;
  [key: string]: unknown;
}
type DataGridColumnAlign = "start" | "end" | "center";
type DataGridColumnPinned = "start" | "end";
type DataGridEditorKind = "text" | "number" | "select" | "date" | "checkbox";
interface DataGridColumnOption {
  value: string;
  label: string;
}
/** A column definition. Exactly one column should set `isRowHeader`. */
interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  /** Pixel width; a multiple of space.1 (e.g. 160). Grid columns do not auto-size. */
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  render?: ((row: DataGridRow) => unknown) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}
type DataGridSortDirection = "ascending" | "descending";
interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}
type DataGridSelectable = "none" | "row" | "cell" | "range";
type DataGridDensity = "compact" | "comfortable";
type DataGridHeight = "content" | "viewport" | "fixed";
interface DataGridCellRef {
  rowId: string;
  column: string;
}
interface DataGridRangeRef {
  from: DataGridCellRef;
  to: DataGridCellRef;
}
/** Detail carried by the `sort-change` CustomEvent. */
interface DataGridSortChangeDetail {
  column: string;
  direction: DataGridSortDirection;
}
/** Detail carried by the `selection-change` CustomEvent; exactly one of `rows`/`cell`/`range` is set, matching `selectable`. */
interface DataGridSelectionChangeDetail {
  rows?: string[] | undefined;
  cell?: DataGridCellRef | null | undefined;
  range?: DataGridRangeRef | null | undefined;
}
/** Detail carried by the `cell-change` CustomEvent. */
interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
/** Detail carried by the `edit-start` CustomEvent. Cancelable: `preventDefault()` refuses the edit. */
interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}
/** Detail carried by the `range-needed` CustomEvent. */
interface DataGridRangeNeededDetail {
  start: number;
  end: number;
}
/** Detail carried by the `column-resize` CustomEvent. */
interface DataGridColumnResizeDetail {
  column: string;
  width: number;
}
/** Overridable style hooks; see the `overrides` property. Accessibility-bearing bindings (`surface`, `headerSurface`,
`headerColor`, `rowSelected`, `rowSelectedBorder`, `cellColor`, `cellMutedColor`, `cellFocusRing`,
`cellEditingBackground`, `cellEditingBorder`, `cellInvalidBorder`, `cellInvalidBackground`,
`cellInvalidForeground`, `rangeBackground`, `rangeBorder`, `statusBarSurface`, `statusBarColor`, `minTarget`,
`focusRing`, `focusRingWidth`) are locked and excluded. */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHeight" | "rowHeightComfortable" | "rowHover" | "rowSelectedBorderWidth" | "cellPaddingInline" | "cellFocusRingWidth" | "rangeBorderWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "statusBarSize" | "statusBarPadding" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
export declare class DsDataGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  accessor caption: string;
  /** Visually hides the caption; it remains the accessible name. */
  accessor hideCaption;
  /** Column definitions in display order. A property, not an attribute. */
  accessor columns: DataGridColumn[];
  /** The rows. `id` must be stable. A property, not an attribute. */
  accessor data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). */
  accessor rowCount: number | undefined;
  /** Controlled sort state. */
  accessor sort: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  accessor defaultSort: DataGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects one cell; `range` allows rectangle selection. */
  accessor selectable: DataGridSelectable;
  /** Controlled selected row ids (row mode). */
  accessor selected: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  accessor editable;
  /** Row height. */
  accessor density: DataGridDensity;
  /** The header stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute;
	always true when `height` is `viewport` or `fixed`. */
  accessor stickyHeader;
  /** `viewport` fills the height under the header and scrolls internally; `content` grows with rows;
	`fixed` uses `overrides.fixedHeight`. */
  accessor height: DataGridHeight;
  /** Data is being fetched: sets `aria-busy` and shows `copy.loading` in the status bar. Existing rows stay. */
  accessor loading;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** A footer line with row count, selection count and validation messages. Exposed as the negated
	`no-status-bar` attribute. */
  accessor showStatusBar;
  /** Per-instance style overrides: `{ captionSize: 'font.size.lg' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalSort;
  private accessor internalSelectedRows;
  private accessor internalSelectedCell;
  private accessor internalRange;
  private accessor activeRowIndex;
  private accessor activeColKey;
  private accessor editing;
  private accessor columnWidths;
  private accessor bodyScrollTop;
  private accessor bodyScrollLeft;
  private accessor viewportPx;
  private accessor liveMessage;
  private readonly instanceId;
  private rowHeightPx;
  private resizeObserver?;
  private lastRequestedEnd;
  private activeDrag?;
  private rangeAnchor?;
  private accessor gridEl;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderSelectAllCell;
  private renderColumnHeader;
  private renderResizeHandle;
  private renderEmptyState;
  private renderRow;
  private renderSelectCell;
  private renderCell;
  private renderEditor;
  private columnWidth;
  private gridTemplate;
  private gridTemplateObj;
  /** Sticky offsets for pinned columns; simplified to ignore the select column's own width when combined with pinning. */
  private pinnedStyle;
  private measureRowHeight;
  private effectiveColumnKeys;
  private sortedRows;
  private currentSort;
  private currentSelectedRows;
  private currentSelectedCell;
  private cellId;
  private rowIdAtActive;
  private activeCellRef;
  private activeDescendantId;
  private positionText;
  private statusText;
  private rangeRect;
  private cellInRange;
  /** Positions the range overlay by measuring the two corner cells; hidden if either is not currently rendered
	(outside the virtualized window). Not the primary visual signal — cells in range also carry `.selected`. */
  private rangeOverlayStyle;
  private sortButtonLabel;
  private handleSort;
  private handleSelectAllChange;
  private handleSelectRowChange;
  private commitRowSelection;
  private commitCellSelection;
  private commitRangeSelection;
  private startEdit;
  private focusEditor;
  private commitEdit;
  private cancelEdit;
  private focusGrid;
  private handleEditorKeydown;
  private handleResizeStart;
  private readonly handleResizeMove;
  private readonly handleResizeEnd;
  private handleScroll;
  private maybeRequestMoreRows;
  private visibleRowRange;
  private ensureRowVisible;
  private handleGridClick;
  private handleGridDblClick;
  private setActive;
  private moveActive;
  private handleGridKeydown;
  private extendRange;
  private handleSpace;
  private selectAll;
  private copyRange;
  private clearSelectionValues;
  /** Best-effort activation of a control rendered by `column.render` (Link, Button, Checkbox); the doc names this
	case but a consumer-rendered cell's DOM shape isn't known ahead of time. */
  private activateCellControl;
  private get captionOverrides();
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-data-grid": DsDataGrid;
  }
}
//#endregion
//#region src/TreeGrid.d.ts
/** A node in the tree. `id` must be stable across renders. `children: "lazy"` marks a node whose children are
loaded on first expand through `onExpand`; the row shows the expand button and a loading state until `data`
is updated with a real array. */
interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | "lazy" | undefined;
  [key: string]: unknown;
}
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
interface TreeGridSort {
  column: string;
  direction: DataGridSortDirection;
}
/** Detail carried by the `selection-change` CustomEvent; exactly one of `rows`/`cell` is set, matching `selectable`. */
interface TreeGridSelectionChangeDetail {
  rows?: string[] | undefined;
  cell?: DataGridCellRef | null | undefined;
}
/** Detail carried by the `cell-change` CustomEvent. */
interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}
/** Detail carried by the `sort-change` CustomEvent. */
type TreeGridSortChangeDetail = TreeGridSort;
/** Detail carried by the `expand-change` CustomEvent: the new array of expanded ids. */
type TreeGridExpandChangeDetail = string[];
/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` row being expanded. */
type TreeGridExpandDetail = string;
/** Detail carried by the `column-resize` CustomEvent. */
interface TreeGridColumnResizeDetail {
  column: string;
  width: number;
}
/** Overridable style hooks; see the `overrides` property. `loadingColor`, `focusRing`, `focusRingWidth` and
`minTarget` are accessibility-bearing and locked (excluded). */
type TreeGridOverridableBinding = "indent" | "expandButtonSize" | "expandGap" | "guideLine" | "guideLineWidth" | "parentWeight" | "transition";
export declare class DsTreeGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  accessor caption: string;
  /** Visually hides the caption; it remains the accessible name. */
  accessor hideCaption;
  /** DataGrid's column model. The `isRowHeader` column is required: it carries the indent and expand button. */
  accessor columns: DataGridColumn[];
  /** Nested rows. A property, not an attribute. */
  accessor data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  accessor expanded: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded row with children. */
  accessor defaultExpanded: string[] | undefined;
  /** Controlled sort; applies within each level, siblings ordered, hierarchy kept. */
  accessor sort: TreeGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `sort` is not supplied. */
  accessor defaultSort: TreeGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects one cell. */
  accessor selectable: TreeGridSelectable;
  /** Controlled selected row ids (row mode). */
  accessor selected: string[] | undefined;
  /** Initially selected row ids (row mode), when `selected` is not supplied. */
  accessor defaultSelected: string[] | undefined;
  /** Selecting a parent row selects its loaded descendants; the parent shows indeterminate when only some are selected. */
  accessor selectChildren;
  /** Master switch: cells whose column is `editable` can be edited. */
  accessor editable;
  /** Row height. */
  accessor density: TreeGridDensity;
  /** The header stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute;
	always true when `height` is `viewport` or `fixed`. */
  accessor stickyHeader;
  /** `viewport` fills the height under the header and scrolls internally; `content` grows with rows; `fixed`
	uses a fixed block size. */
  accessor height: TreeGridHeight;
  /** Data is being fetched: sets `aria-busy` and shows `copy.loading` in the status bar. Existing rows stay. */
  accessor loading;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** A footer line with row count and selection count. Exposed as the negated `no-status-bar` attribute
	(the doc's default is `true`, so per the negated-boolean-attribute convention this can't be a positively
	named attribute — see gaps). */
  accessor showStatusBar;
  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalSelectedRows;
  private accessor internalSelectedCell;
  private accessor internalExpanded;
  private accessor internalSort;
  private accessor activeRowIndex;
  private accessor activeColKey;
  private accessor editing;
  private accessor columnWidths;
  private accessor bodyScrollTop;
  private accessor viewportPx;
  private accessor liveMessage;
  private readonly instanceId;
  private rowHeightPx;
  private resizeObserver?;
  private activeDrag?;
  private selectionAnchorId?;
  private accessor gridEl;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderSelectAllCell;
  private renderColumnHeader;
  private renderResizeHandle;
  private renderEmptyState;
  private renderRow;
  private renderSelectCell;
  private renderCell;
  private renderRowHeaderContent;
  private renderEditor;
  private isExpanded;
  private sortSiblings;
  private flatten;
  private visibleRows;
  private allIdsWithChildren;
  private collectDescendantIds;
  private rowHeaderColumn;
  private rowName;
  private commitExpanded;
  private toggleExpand;
  private expandSiblings;
  private currentSelectedRows;
  private rowCheckedState;
  private toggleRowSelection;
  /** Shift+Space: extends the row selection from the last plain-Space anchor through the focused row, inclusive
	(visible-row order); with `selectChildren` each row added to the range cascades its loaded descendants. */
  private extendRowSelection;
  private commitRowSelection;
  private handleSelectAllChange;
  private handleSelectRowChange;
  private commitCellSelection;
  private sortButtonLabel;
  private handleSort;
  private handleResizeStart;
  private readonly handleResizeMove;
  private readonly handleResizeEnd;
  private startEdit;
  private focusEditor;
  private commitEdit;
  private cancelEdit;
  private focusGrid;
  private handleEditorKeydown;
  private columnWidth;
  private effectiveColumnKeys;
  private gridTemplate;
  private gridTemplateObj;
  private pinnedStyle;
  /** One vertical guide line per ancestor level, aligned to each level's expand-button center. */
  private guideLayers;
  private measureRowHeight;
  private cellId;
  private rowIdAtActive;
  private activeDescendantId;
  private positionText;
  private statusText;
  private handleScroll;
  private visibleRowRange;
  private ensureRowVisible;
  private handleGridClick;
  private handleGridDblClick;
  private setActive;
  private moveActiveRow;
  private moveActiveCol;
  private handleGridKeydown;
  /** Best-effort activation of a control rendered by `column.render` (Link, Button, Checkbox); the doc names this
	case but a consumer-rendered cell's DOM shape isn't known ahead of time. */
  private activateCellControl;
  private get captionOverrides();
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-tree-grid": DsTreeGrid;
  }
}
//#endregion
//#region src/Tree.d.ts
/** A node in the hierarchy. `id` must be stable across renders. `href` makes the node a Link (navigation trees);
`badge` is a short trailing count or status; `children: "lazy"` marks a node whose children load on first
expand through `onExpand` — the row shows the expand button and a loading placeholder until `nodes` is
updated with a real array for that node. */
interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNode[] | "lazy" | undefined;
}
type TreeHeadingLevel = "2" | "3" | "4";
type TreeSelectable = "none" | "single" | "multiple";
/** Detail carried by the `selection-change` CustomEvent: the new array of selected ids. */
type TreeSelectionChangeDetail = string[];
/** Detail carried by the `expand-change` CustomEvent: the new array of expanded ids. */
type TreeExpandChangeDetail = string[];
/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` node being expanded. */
type TreeExpandDetail = string;
/** Detail carried by the `activate` CustomEvent: the id of the activated node (not fired for `href` nodes, which navigate instead). */
type TreeActivateDetail = string;
/** Overridable style hooks; see the `overrides` property. `rowSelected`, `rowSelectedBorder`, `labelColor`,
`iconColor`, `badgeColor`, `checkboxBorder`, `checkboxSelected`, `checkboxMark`, `minTarget`, `focusRing` and
`focusRingWidth` are accessibility-bearing and locked (excluded). */
type TreeOverridableBinding = "indent" | "rowHeight" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "rowSelectedBorderWidth" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "expandButtonSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsTree extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the tree lists ("Folders", "Categories"). The accessible name of the tree; visually hidden unless `showLabel`. */
  accessor label: string;
  /** Shows `label` as a heading above the tree; then the tree is `aria-labelledby` it instead of `aria-label`. */
  accessor showLabel;
  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  accessor headingLevel: TreeHeadingLevel;
  /** The hierarchy. A property, not an attribute. */
  accessor nodes: TreeNode[];
  /** Controlled expanded ids. */
  accessor expanded: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every node with children. */
  accessor defaultExpanded: string[] | undefined;
  /** `single`: one current node. `multiple`: checkbox-like cascading selection. `none`: expand/collapse only. */
  accessor selectable: TreeSelectable;
  /** Controlled selected ids. */
  accessor selected: string[] | undefined;
  /** Initially selected ids. */
  accessor defaultSelected: string[] | undefined;
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  accessor selectChildren;
  /** With `single`, moving focus also selects. Off by default: focus moves, Enter or Space selects. */
  accessor selectOnFocus;
  /** Vertical guide lines under open parents. Exposed as the negated `hide-guides` attribute (the doc's default
	is `true`, so per the negated-boolean-attribute convention this can't be a positively named attribute —
	see gaps: the schema's own `platforms.lit.reflect` list names this `show-guides`, which contradicts that
	convention for a true-default boolean). */
  accessor showGuides;
  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled expanded ids, seeded from `defaultExpanded` on first update. */
  private accessor internalExpanded;
  /** Uncontrolled selected ids, seeded from `defaultSelected` on first update. */
  private accessor internalSelected;
  /** The node currently carrying the roving tabindex and (usually) real focus. */
  private accessor focusedId;
  private accessor liveMessage;
  private readonly instanceId;
  private typeaheadQuery;
  private typeaheadTimer?;
  private get currentExpanded();
  private get currentSelected();
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get headingId();
  private renderNode;
  private isExpanded;
  private isSelected;
  private flatten;
  private visibleEntries;
  /** Visible entries whose node is not disabled: the set keyboard navigation, Home/End, typeahead and
	selection all move across. Disabled nodes stay visible but are skipped. */
  private navigable;
  private entryAt;
  private allIdsWithChildren;
  private collectDescendantIds;
  private commitExpanded;
  private toggleExpand;
  private expandSiblings;
  private checkedState;
  private commitSelected;
  private toggleMultiple;
  private extendSelection;
  private handleActivate;
  private activateNode;
  private handleNodeClick;
  private focusEntry;
  private moveFocus;
  private focusFirst;
  private focusLast;
  private handleTypeahead;
  private readonly handleKeydown;
  /** One vertical guide line per ancestor level, aligned to each level's expand-button center. */
  private guideLayers;
  private itemId;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-tree": DsTree;
  }
}
//#endregion
//#region src/Splitter.d.ts
type SplitterOrientation = "horizontal" | "vertical";
type SplitterStackBelow = "prose" | "content" | "never";
/** Detail carried by the `size-change` and `size-change-end` CustomEvents. */
interface SplitterSizeChangeDetail {
  size: number;
}
/** Detail carried by the `collapse-change` CustomEvent. */
interface SplitterCollapseChangeDetail {
  collapsed: boolean;
}
/** Overridable style hooks; see the `overrides` property. `separatorHover`, `separatorActive`, `grip`, `minTarget`,
`focusRing` and `focusRingWidth` are locked and excluded. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "collapseButtonOffset" | "paneMinTarget" | "transition";
export declare class DsSplitter extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  accessor label;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  accessor orientation: SplitterOrientation;
  /** Controlled size of the primary pane, percent (0-100). Omit for an uncontrolled splitter. */
  accessor size: number | undefined;
  /** Initial primary size, percent, for an uncontrolled splitter. */
  accessor defaultSize;
  /** Smallest primary size, percent. Below this the pane collapses instead, when `collapsible`. */
  accessor minSize;
  /** Largest primary size, percent. */
  accessor maxSize;
  /** Arrow-key increment, percent. */
  accessor step;
  /** The primary pane can collapse to nothing: drag past `minSize`, press Enter on the separator, or use the
	collapse button. Enter again (or the button) restores the last size. */
  accessor collapsible;
  /** Collapsed state. Two-way: set initially to start collapsed, or read/set at any time; the component keeps it
	current as the user drags, presses Enter, or uses the collapse button. */
  accessor collapsed;
  /** When set, the size and collapsed state are remembered in `localStorage` under this key across mounts. */
  accessor persistKey: string | undefined;
  /** Below this layout width a horizontal splitter stacks its panes and the separator becomes inert. */
  accessor stackBelow: SplitterStackBelow;
  /** Per-instance style overrides: `{ separatorSize: 'space.2' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled size (seeded from `defaultSize`, or restored via `persistKey`, when nothing else is set). */
  private accessor internalSize;
  /** Active while the pointer is dragging the separator (drives `separatorActive`). */
  private accessor dragging;
  /** `true` below `stackBelow`, on a horizontal splitter: the separator loses its `tabindex` and `role`. */
  private accessor stacked;
  private readonly instanceId;
  private resizeObserver?;
  private accessor containerEl;
  private accessor separatorEl;
  private accessor primaryPaneEl;
  private accessor secondaryPaneEl;
  private accessor primarySlotEl;
  private accessor secondarySlotEl;
  /** The current primary size (percent), resolved from `size`, `internalSize`, then `defaultSize`, clamped. */
  private get currentSize();
  /** The displayed/reported size: 0 while collapsed, else `currentSize`. */
  private get effectiveSize();
  private get primaryPaneId();
  private clamp;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private readonly handleSeparatorPointerDown;
  private readonly handleSeparatorPointerMove;
  private readonly handleSeparatorPointerUp;
  private updateFromPointer;
  private handleSeparatorKeydown;
  private readonly handleHostKeydown;
  private handleCollapseButtonPress;
  private adjustSize;
  private toggleCollapsed;
  private commitSize;
  private setCollapsed;
  private dispatchSizeChange;
  private dispatchSizeChangeEnd;
  private zoneIndexOf;
  private focusZone;
  /** F6: cycles focus through primary content, the separator, and secondary content (APG convenience). */
  private cycleFocus;
  private updateStacked;
  private get storageKey();
  private loadPersisted;
  private persist;
  private applyOverrides;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-splitter": DsSplitter;
  }
}
//#endregion
//#region src/Feed.d.ts
type FeedHeadingLevel = "2" | "3" | "4";
/**
 * One article. `content` and `actions` are anything `lit-html` can render
 * (a string, a `TemplateResult`, a `Node`) — the platform's stand-in for
 * `ReactNode`. `timestamp` is ISO 8601 and rendered relative, with the
 * absolute time as the `<time>` element's `title`.
 */
interface FeedItem {
  id: string;
  heading: string;
  timestamp: string;
  content: unknown;
  actions?: unknown;
  unread?: boolean | undefined;
}
/** Detail carried by the `item-visible` CustomEvent. */
interface FeedItemVisibleDetail {
  id: string;
}
/** Overridable style hooks; see the `overrides` property. `unreadBorder`, `timestampColor`, `endMessageColor`, `focusRing` and `focusRingWidth` are locked and excluded. */
type FeedOverridableBinding = "itemGap" | "articleInset" | "unreadBorderWidth" | "timestampSize" | "newItemsOffset" | "loadingInset" | "endMessageInset" | "endMessageSize" | "fontFamily";
export declare class DsFeed extends LitElement {
  static override styles: CSSResult;
  /** What the feed contains ("Activity", "Notifications"). The feed's accessible name. */
  accessor label;
  /** Articles, newest first. */
  accessor items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `load-more` as the end approaches. */
  accessor hasMore;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  accessor loading;
  /** Number of newer items available above. Shows a "Show {count} new" button that prepends and scrolls; the feed never inserts them itself. */
  accessor newItemsCount: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  accessor headingLevel: FeedHeadingLevel;
  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
  accessor endMessage: string | undefined;
  /** Per-instance style overrides: `{ itemGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor newItemsButtonEl;
  private loadMoreObserver?;
  private visibilityObserver?;
  private readonly visibilityTimers;
  private pendingShowNewFocus;
  private checkedInitialLoadMore;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(changed: PropertyValues): void;
  private renderArticle;
  private renderLoading;
  private renderEndMessage;
  private getArticles;
  private readonly handleShowNewPress;
  private readonly handleKeydown;
  private focusAdjacentArticle;
  private handleCtrlEnd;
  private handleCtrlHome;
  /** Escapes the feed to the nearest focusable element in document order, before (`-1`) or after (`1`) the host. */
  private focusOutside;
  private syncHostAria;
  /** (Re)builds the load-more and visibility observers against the current articles. */
  private syncObservers;
  private teardownObservers;
  private readonly handleLoadMoreIntersect;
  private readonly handleVisibilityIntersect;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-feed": DsFeed;
  }
}
//#endregion
export type { AccordionChangeDetail, AccordionHeadingLevel, AccordionItem, AccordionOpenChangeDetail, AccordionOpenChangeReason, AccordionOverridableBinding, ActionSheetAction, ActionSheetActionDetail, ActionSheetActionTone, ActionSheetCloseDetail, ActionSheetCloseReason, ActionSheetOverridableBinding, AlertDialogCancelDetail, AlertDialogCancelReason, AlertDialogConfirmDetail, AlertDialogOverridableBinding, AlertDialogTone, AlertDismissDetail, AlertLive, AlertOverridableBinding, AlertTone, BottomSheetCloseDetail, BottomSheetCloseReason, BottomSheetDragDismissDetail, BottomSheetHeight, BottomSheetOverridableBinding, BoxElement, BoxInset, BoxOverridableBinding, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbNavigateDetail, BreadcrumbOverridableBinding, ButtonOverridableBinding, ButtonPressDetail, ButtonSize, ButtonTrackDetail, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardSurface, CarouselChangeDetail, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CheckboxChangeDetail, CheckboxOverridableBinding, ComboboxChangeDetail, ComboboxFilter, ComboboxInputChangeDetail, ComboboxOpenChangeDetail, ComboboxOverridableBinding, ComboboxValue, ContainerAlign, ContainerElement, ContainerGutter, ContainerOverridableBinding, ContainerWidth, DataGridCellChangeDetail, DataGridCellRef, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridColumnResizeDetail, DataGridDensity, DataGridEditStartDetail, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridRangeNeededDetail, DataGridRangeRef, DataGridRow, DataGridSelectable, DataGridSelectionChangeDetail, DataGridSort, DataGridSortChangeDetail, DataGridSortDirection, DatePickerChangeDetail, DatePickerOpenChangeDetail, DatePickerOverridableBinding, DatePickerSize, DatePickerValue, DialogCloseDetail, DialogCloseReason, DialogInitialFocus, DialogOpenedDetail, DialogOverridableBinding, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureToggleDetail, DividerOrientation, DividerOverridableBinding, DividerSpacing, DsFormField, FeedHeadingLevel, FeedItem, FeedItemVisibleDetail, FeedOverridableBinding, FieldsetGap, FieldsetOverridableBinding, FocusScopeAutoFocus, FocusScopeEscapeAttemptDetail, FormInvalidDetail, FormOverridableBinding, FormSubmitDetail, FormValidate, HeadingAlign, HeadingLevel, HeadingOverridableBinding, HeadingSize, IconName, IconOverridableBinding, IconSize, InputChangeDetail, InputOverridableBinding, InputSize, InputType, LandmarkRole, LinkOverridableBinding, LinkTone, ListboxActiveChangeDetail, ListboxChangeDetail, ListboxGroupOption, ListboxItem, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxValue, MenuActionDetail, MenuActionItem, MenuGroup, MenuItem, MenuOpenChangeDetail, MenuOverridableBinding, MenuPlacement, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterTone, NumberInputChangeDetail, NumberInputFormat, NumberInputOverridableBinding, PopoverCloseReason, PopoverHeadingLevel, PopoverOpenChangeDetail, PopoverOverridableBinding, PopoverPlacement, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarTone, RadioGroupChangeDetail, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, SearchChangeDetail, SearchClearDetail, SearchOverridableBinding, SearchSize, SearchSubmitDetail, SearchSuggestion, SegmentedControlChangeDetail, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlSize, SelectChangeDetail, SelectNative, SelectOpenChangeDetail, SelectOverridableBinding, SelectSize, SelectValue, SidePanelLandmark, SidePanelOpenChangeDetail, SidePanelOpenChangeReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelSide, SidePanelWidth, SliderChangeDetail, SliderMark, SliderOverridableBinding, SliderShowValue, SliderValue, SplitterCollapseChangeDetail, SplitterOrientation, SplitterOverridableBinding, SplitterSizeChangeDetail, SplitterStackBelow, StackAlign, StackDirection, StackElement, StackGap, StackJustify, StackOverridableBinding, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperStep, StepperStepSelectDetail, StepperStepStatus, SwitchChangeDetail, SwitchLabelPosition, SwitchOverridableBinding, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnHideBelow, TableColumnWidth, TableDensity, TableMaxHeight, TableOverridableBinding, TableResponsive, TableRow, TableRowPressDetail, TableSelectable, TableSelectionChangeDetail, TableSort, TableSortChangeDetail, TableSortDirection, TabsActivation, TabsChangeDetail, TabsFit, TabsOrientation, TabsOverridableBinding, TabsTab, TextAlign, TextElement, TextOverridableBinding, TextSize, TextTone, TextWeight, ToastActionDetail, ToastDismissDetail, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastRegionOverridableBinding, ToastResult, ToastTone, ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TreeActivateDetail, TreeExpandChangeDetail, TreeExpandDetail, TreeGridCellChangeDetail, TreeGridColumnResizeDetail, TreeGridDensity, TreeGridExpandChangeDetail, TreeGridExpandDetail, TreeGridHeight, TreeGridOverridableBinding, TreeGridRow, TreeGridSelectable, TreeGridSelectionChangeDetail, TreeGridSort, TreeGridSortChangeDetail, TreeHeadingLevel, TreeNode, TreeOverridableBinding, TreeSelectable, TreeSelectionChangeDetail };
//# sourceMappingURL=index.d.ts.map