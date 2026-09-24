import { CSSResult, LitElement, PropertyValues, TemplateResult, nothing } from "lit";
import { TokenRef } from "@design-schema/tokens";
import { Ref } from "lit/directives/ref.js";
//#region src/Icon.d.ts
type IconName = "check" | "dash" | "chevron-right" | "chevron-down" | "chevron-up" | "chevron-left" | "close" | "plus" | "minus" | "info" | "success" | "warning" | "danger" | "external" | "ellipsis" | "search" | "arrow-right" | "arrow-left" | "calendar" | "menu" | "list" | "grid" | "play" | "pause" | "folder" | "file";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/**
 * Style bindings that can be overridden per instance. `strokeWidth` is locked: line glyphs stay
 * legible at `xs` because they stroke at the focus-ring width, so it is not in this union (its
 * `--ds-icon-stroke-width` hook still exists, for a consumer who must change it from their own CSS).
 */
type IconOverridableBinding = "size" | "color";
export declare class DsIcon extends LitElement {
  static override styles: CSSResult;
  /**
   * Which glyph. The set is deliberately small and grows only when a component
   * needs a shape; `info`, `success`, `warning` and `danger` are the four status
   * shapes (circle-i, circle-check, triangle-!, octagon-x) so tone is never
   * carried by color alone. `name` has no default; the Default story renders `check`.
   */
  accessor name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  accessor size: IconSize;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text
   * baseline, ignoring `size`. For icons inside Text, Link and Button labels.
   * `font-size: inherit` always has a surrounding size to read, so there is no
   * fallback here (the `font.size.md` fallback is React Native only).
   */
  accessor inline;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as
   * an image with this name; when omitted or empty, it is decorative and hidden
   * from assistive technology — an empty string is the decorative case, not an
   * authoring error. Most icons sit next to text and should have no label.
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
/** Why the disclosure changed state. */
type DisclosureToggleReason = "pointer" | "keyboard" | "controlled";
/** Detail carried by the `toggle` CustomEvent. */
interface DisclosureToggleDetail {
  /** The new state. */
  open: boolean;
  /** `pointer` (clicked or tapped), `keyboard` (Enter or Space), `controlled` (the consumer changed `open`). */
  reason: DisclosureToggleReason;
}
/** Overridable style hooks; see the `overrides` property. `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type DisclosureOverridableBinding = "triggerPaddingBlock" | "triggerPaddingInline" | "triggerGap" | "triggerFontFamily" | "triggerFontSize" | "triggerFontWeight" | "triggerLineHeight" | "triggerRadius" | "panelPaddingBlock" | "panelPaddingInline" | "disabledOpacity" | "transition";
export declare class DsDisclosure extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The trigger's label. Also its accessible name. Says what will be revealed. */
  accessor summary;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  accessor open: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  accessor defaultOpen;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  accessor disabled;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  accessor keepMounted;
  /** The trigger spans the width of its row, so the whole row is the hit area. */
  accessor fullWidth;
  /** When set, the trigger is wrapped in a heading of this level so it appears in the outline. */
  accessor headingLevel: DisclosureHeadingLevel | undefined;
  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state (seeded from `defaultOpen`). */
  private accessor internalOpen;
  private accessor triggerEl;
  /** The resolved state rendered at the last update; `undefined` before the first. */
  private renderedOpen;
  /** The state the last user activation asked for, so the resulting prop change is not re-reported as `controlled`. */
  private requestedOpen;
  /**
   * Focus entered the panel and has not demonstrably moved elsewhere. Unassigning a focused node from the slot can
   * drop focus to the body without a focusout, so the flag is cleared only when focus lands somewhere known.
   */
  private focusWithinPanel;
  /** Set when a close happens while focus is within the panel; resolved after the render that removes it. */
  private restoreFocusPending;
  /** Whether the panel is currently open (controlled `open`, else the uncontrolled state). */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(changed: PropertyValues): void;
  private handleClick;
  private dispatchToggle;
  private handlePanelFocusIn;
  private handlePanelFocusOut;
  /** Focus still inside the closed panel, or dropped to the body when the panel went away, moves to the trigger. */
  private restoreFocus;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-disclosure": DsDisclosure;
  }
}
//#endregion
//#region src/Text.d.ts
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
type TextWeight = "regular" | "medium" | "semibold" | "bold";
type TextTone = "default" | "strong" | "muted" | "danger" | "onAction";
type TextAlign = "start" | "center" | "end";
type TextElement = "p" | "span";
/** Overridable style hooks; see the `overrides` property. `color` is locked and excluded. */
type TextOverridableBinding = "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
export declare class DsText extends LitElement {
  static override styles: CSSResult;
  /**
   * Maps to the font size scale. `md` is body copy; `xs` is the smallest
   * readable size and is reserved for captions and metadata.
   */
  accessor size: TextSize;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  accessor weight: TextWeight;
  /**
   * Semantic color. `onAction` is only for text placed on an action background.
   * There is no `inverse` tone: an inverse surface re-scopes `--color-foreground`
   * on its own container, which the `default` tone resolves through. The colour
   * is locked: not in `overrides`, but it keeps its `--ds-text-color` hook for page CSS.
   */
  accessor tone: TextTone;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  accessor align: TextAlign;
  /**
   * Clip to one line with an ellipsis. The full text is exposed via `title`,
   * taken from the host's flattened, whitespace-collapsed textContent and
   * omitted when that is empty. With `element="span"` the clipped box is
   * `inline-block` with `max-inline-size: 100%`, so the width comes from the
   * parent. Screen readers still read the whole string.
   */
  accessor truncate;
  /**
   * The HTML element to render — `p` for a block, `span` for inline. Labels and
   * legends are rendered by Input and Fieldset, which own the association.
   */
  accessor element: TextElement;
  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  accessor overrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  /** Plain-text content of the default slot, used for `title` when truncated. */
  private accessor fullText;
  /** The consumer's `title` attribute on the host, forwarded to the `text` part unchanged. */
  private accessor consumerTitle;
  /** Text edits inside existing nodes do not fire `slotchange`; this keeps `title` current. */
  private textObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * The host's flattened, whitespace-collapsed textContent (`title` is omitted when it is
   * empty), and the consumer's own `title` attribute on the host.
   */
  private syncFullText;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-text": DsText;
  }
}
//#endregion
//#region src/Divider.d.ts
type DividerOrientation = "horizontal" | "vertical";
type DividerSpacing = "none" | "tight" | "normal" | "loose";
/**
 * Overridable style hooks; see the `overrides` property. The accessibility-bearing `labelColor` is
 * locked and excluded. `labelSize` and `fontFamily` reach the composed label `Text` through its own
 * `overrides` (as `fontSize` and `fontFamily`) rather than a `--ds-divider-*` hook: Divider does not
 * style the Text itself, and page CSS reaches the label through Text's hooks.
 */
type DividerOverridableBinding = "color" | "thickness" | "spacing" | "labelSize" | "labelGap" | "fontFamily";
export declare class DsDivider extends LitElement {
  static override styles: CSSResult;
  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height:
   * `inline-block` with `block-size: auto; align-self: stretch; min-block-size: 100%`. They need a
   * flex or grid row (a horizontal Stack with align stretch) or a parent with a definite height; in
   * plain block flow a vertical divider has no height and draws nothing.
   */
  accessor orientation: DividerOrientation;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier
   * today"). Turns the divider from decorative into a labelled separator
   * (`semantic` is implied). Ignored on a vertical divider, with a development
   * warning: a vertical line has no room for centered text. An ignored label
   * implies nothing either — a vertical divider is semantic only when
   * `semantic` says so. An empty string is no label. When in effect, the label
   * is the separator's accessible name (`aria-label` on the host, since ids do
   * not cross the shadow root) and the two line pieces on either side are
   * hidden from assistive technology.
   */
  accessor label: string | undefined;
  /**
   * Expose as a separator to assistive technology. Leave false for purely visual lines between list
   * rows; set true (or provide a label) when the divider marks a real boundary between sections
   * that a screen-reader user should hear.
   */
  accessor semantic;
  /** Space on both sides along the cross axis, from the layout rhythm, for dividers used outside a Stack. */
  accessor spacing: DividerSpacing;
  /** Per-instance style overrides: `{ color: 'color.border.strong' }`. `labelColor` is locked and ignored. */
  accessor overrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The ignored label last warned about, so the warning fires once per appearance or change. */
  private warnedLabel;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  /** The label in effect: none on a vertical divider, and an empty string is no label. */
  private get effectiveLabel();
  protected override render(): TemplateResult;
  /** `labelSize` → Text `fontSize`, `fontFamily` → Text `fontFamily`; only bindings the author overrode. */
  private labelOverrides;
  /**
   * Decorative → aria-hidden; semantic or labelled → role=separator with
   * aria-orientation (and the label as its name, since a separator's content
   * is presentational). Plain host attributes, not ElementInternals, so that
   * accessible-name readers observe them.
   */
  private syncSemantics;
  private warnIgnoredLabel;
  /**
   * Overrides change values, never presence: `spacing: none` renders no space and takes no hook,
   * and the label bindings apply only while a label is in effect.
   */
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-divider": DsDivider;
  }
}
//#endregion
//#region src/Accordion.d.ts
type AccordionHeadingLevel = DisclosureHeadingLevel;
/**
 * One section. On Lit the schema's `content` is dropped: the panel body is a
 * light-DOM child slotted by the item id (`<div slot="faq-1">…</div>`).
 */
interface AccordionItem {
  id: string;
  summary: string;
  disabled?: boolean | undefined;
}
/** Why a section's open state changed. */
type AccordionOpenChangeReason = "trigger" | "keyboard" | "exclusive" | "controlled";
/** Detail carried by the `change` CustomEvent: every open id, zero or one entry under `exclusive`. */
interface AccordionChangeDetail {
  openIds: string[];
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
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The sections in order. When set, the accordion renders the `<ds-disclosure>` elements itself. */
  accessor items: AccordionItem[] | undefined;
  /** Heading level for every trigger, so sections appear in the page outline. */
  accessor headingLevel: AccordionHeadingLevel;
  /** Opening one section closes the others. */
  accessor exclusive;
  /** Controlled open ids. A bare string is a one-id array; `[]` or `''` means nothing is open. Omit for uncontrolled. */
  accessor value: string | string[] | undefined;
  /** Initially open ids; the same shapes as `value`. */
  accessor defaultValue: string | string[] | undefined;
  /** A hairline between items. Exposed as the negated `no-divided` attribute. */
  accessor divided;
  /** Passed to every Disclosure; required when panels contain form fields. */
  accessor keepMounted;
  /** Per-instance style overrides: `{ divider: 'color.border.strong' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open ids, seeded from `defaultValue`. */
  private accessor internalOpenIds;
  /** Light-DOM `<ds-disclosure>` children, each assigned to its own slot. */
  private accessor slottedItems;
  /** The open set the sections currently show, for diffing a controlled `value`. */
  private renderedIds;
  /** The set last emitted while controlled; a `value` equal to it is not reported as `controlled`. */
  private emittedIds;
  private readonly childObserver;
  /** The open ids right now, controlled or not; the first id only under `exclusive`. */
  get openIds(): string[];
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(): void;
  private renderDivider;
  private renderItem;
  private readChildren;
  /** Assigns each slot its nodes; a slot already holding exactly those nodes is left alone. */
  private assignSlots;
  /** Sets heading-level, keep-mounted and open on every slotted disclosure, writing only what differs. */
  private syncSlottedItems;
  private itemElements;
  private readonly handleToggle;
  private readonly handleKeydown;
  /** Applies a user toggle: computes the next open set, closes the others under `exclusive`, and dispatches the events. */
  private toggleSection;
  /** Reports a `value` change the accordion did not itself just emit as `reason: 'controlled'`, per section. */
  private reportControlledChange;
  /** The given ids sorted by section order; ids naming no section keep their relative order at the end. */
  private inItemOrder;
  private dispatchChange;
  private dispatchOpenChange;
  /** `''` and `[]` are nothing open; a bare string is one id; under `exclusive` only the first id counts. */
  private toOpenIds;
  /** Id lists already warned about, so each distinct list warns once. */
  private readonly warnedIdLists;
  private warnExclusive;
  private warnedMissingId;
  private warnMissingIds;
  private applyOverrides;
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
/** ARIA's own `aria-haspopup` values, without `true` (which means `menu`). */
type ButtonHaspopup = "menu" | "listbox" | "tree" | "grid" | "dialog";
/** Detail carried by the `press` CustomEvent (none). */
type ButtonPressDetail = void;
/** Detail carried by the `track` CustomEvent. */
interface ButtonTrackDetail {
  name: string;
  label: string;
}
/**
 * Overridable style hooks; see the `overrides` property. The accessibility-bearing
 * bindings — `background`, `backgroundHover`, `foreground`, `focusRing`,
 * `focusRingWidth`, `focusRingOffset`, `inverseForeground`, `inverseFocusRing`,
 * `minTarget` and `spinnerStroke` — are locked and excluded, but each keeps its
 * `--ds-button-*` hook on `:host`, so page CSS can still re-theme it.
 */
type ButtonOverridableBinding = "iconGap" | "paddingInline" | "paddingBlock" | "radius" | "fontFamily" | "fontWeight" | "fontSize" | "inverseBackgroundHover" | "inverseHoverOpacity" | "disabledOpacity" | "transition" | "loadingSpin" | "spinnerSize";
export declare class DsButton extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The button's text. Also its accessible name. */
  accessor label;
  /** Visual emphasis. One primary button per view. */
  accessor variant: ButtonVariant;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  accessor size: ButtonSize;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  accessor type: ButtonType;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel,
   * Disclosure): rendered as `aria-expanded` on the inner button. A JS property
   * only, and tri-state — `undefined` (the default) means this button discloses
   * nothing, so no `aria-expanded` is rendered at all. A raw `aria-expanded`
   * attribute on the host does not reach the inner button.
   */
  accessor expanded: boolean | undefined;
  /**
   * Set by a parent whose popup the button opens (Menu's trigger takes `menu`):
   * rendered as `aria-haspopup` on the inner button, the element that carries the
   * button role. A JS property only, like `expanded`; `undefined` (the default)
   * means the button opens nothing and no `aria-haspopup` is written.
   */
  accessor haspopup: ButtonHaspopup | undefined;
  /**
   * Prevents activation. The button stays in the tab order and is announced as
   * disabled. Inside a disabled `ds-form` the form sets this for you.
   */
  accessor disabled;
  /**
   * Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not
   * rendered either. `label` is still required and becomes the accessible name.
   * Padding becomes equal on all sides (`space.sm`).
   */
  accessor iconOnly;
  /**
   * Shows a ring spinner in the leading icon position, hides `trailingIcon`,
   * keeps the label visible and the height unchanged, and blocks repeat
   * activation while an action is pending. Without a `leadingIcon` the spinner
   * and iconGap widen the button. `copy.loading` is the description.
   */
  accessor loading;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost`
   * text and hover change, and the focus ring uses the inverse focus token for
   * every variant.
   */
  accessor inverse;
  /**
   * Overrides the accessible name when it must say more than the visible label
   * ("Sort by Amount, ascending" on a header that shows "Amount"). The name must
   * contain the visible label (WCAG 2.5.3 label-in-name). Maps to `aria-label`.
   */
  accessor accessibleName: string | undefined;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow
   * Menu. Read by Toolbar from the host attribute; the button never renders it.
   */
  accessor overflowLabel: string | undefined;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  accessor track: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Mirror of the host's own `tabindex`, forwarded to the inner `<button>`.
   *
   * `delegatesFocus` makes the host focusable, but it does not make the inner
   * button share the host's tabbability: a composer that writes `tabindex="-1"`
   * on a `<ds-button>` — a roving-focus parent such as `ds-toolbar`, or one that
   * keeps the control out of the tab order because the surrounding decoration is
   * `aria-hidden` (`ds-tree-grid`'s expand chevron, `ds-number-input`'s steppers)
   * — takes the *host* out of the tab order while the shadow `<button>` stays a
   * tab stop of its own. Forwarding the attribute is the only way a composer can
   * express that, since it cannot reach into this shadow root.
   *
   * `null` (no `tabindex` on the host) forwards nothing, so an ordinary button is
   * tabbable exactly as before, and `disabled` still leaves it in the tab order.
   */
  private accessor hostTabIndex;
  /**
   * Watches the host's `tabindex` only. The callback writes to the inner button
   * through `hostTabIndex`, never back to the host, so it cannot re-enter.
   */
  private readonly tabIndexObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private handleClick;
  private readHostTabIndex;
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
/**
 * Overridable style hooks; see the `overrides` property. `color` is locked and excluded here,
 * though it keeps its `--ds-heading-color` hook on `:host`.
 */
type HeadingOverridableBinding = "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "marginBlockEnd";
export declare class DsHeading extends LitElement {
  static override styles: CSSResult;
  /**
   * Position in the document outline. Controls the semantic element, not the
   * visual size — screen-reader users navigate by heading level, so levels must
   * not skip (h1 → h3). Required; the canonical values are the strings `'1'`–
   * `'6'` and the numbers `1`–`6` are accepted too. The property holds
   * `undefined` until set; a missing, out-of-range or non-numeric level renders
   * as `<h2>` at the 3xl size and warns once per element in development.
   */
  accessor level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /**
   * Visual size, independent of level. Defaults per level: 1 → 4xl, 2 → 3xl,
   * 3 → 2xl, 4 → xl, 5 → lg, 6 → md; an explicit size always wins. The resolved
   * default is never written back, so `[size]` matches only an explicit size.
   */
  accessor size: HeadingSize | undefined;
  /** Horizontal text alignment. `start`/`end` follow writing direction. Text's align type. */
  accessor align: TextAlign;
  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  accessor overrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
  /** Development-only: the fallback-level warning is emitted at most once per element, for its lifetime. */
  private warnedMissingLevel;
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
//#region src/Input.d.ts
type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";
type InputSize = "sm" | "md";
/** Detail carried by the `change` CustomEvent. */
interface InputChangeDetail {
  /** The new value. */
  value: string;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`, `errorText`,
 * `descriptionText`, `minTarget`, `minTargetSm` and `focusRingWidth` are
 * locked and excluded.
 */
type InputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "partGap" | "fontFamily" | "fontSize" | "labelWeight" | "helperSize" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsInput extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder. */
  accessor label;
  /** Field name used by the enclosing Form when collecting values. */
  accessor name;
  /** Controlled value. Omit for an uncontrolled field. */
  accessor value: string | undefined;
  /** Initial value for an uncontrolled field. */
  accessor defaultValue: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  accessor placeholder: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. */
  accessor description: string | undefined;
  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  accessor type: InputType;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  accessor required;
  /** Visually hide the label (it remains the accessible name). */
  accessor hideLabel;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  accessor size: InputSize;
  /** Not editable and not submitted. Stays visible, readable and focusable. */
  accessor disabled;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  private errorValue;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** HTML autocomplete token (e.g. `email`, `given-name`). WCAG 1.3.5 input purpose. */
  accessor autocomplete: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The uncontrolled value once the user has edited it; `undefined` until then. */
  private accessor editedValue;
  /** Disabled by an owning native `<form>` / `<fieldset>` (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  /** The current string value: `value` when controlled, the uncontrolled value otherwise. */
  get currentValue(): string;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  /**
   * The message in the error slot, by the doc's precedence: `error`, then
   * copy.required for an empty required field, then copy.invalid. Nothing is
   * shown unless the field is marked invalid.
   */
  private get displayedError();
  /**
   * helperSize, fontFamily and lineHeight forwarded to the description and error
   * Text. The object is always passed, with `undefined` for the keys the consumer
   * did not set, rather than withheld — a no-op for Text and one code path
   * instead of two.
   */
  private get textOverrides();
  private handleInput;
  private applyOverrides;
  /** Mirror value and validity into ElementInternals so an owning form sees them. */
  private syncInternals;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-input": DsInput;
  }
}
//#endregion
//#region src/Link.d.ts
type LinkTone = "default" | "inherit";
/** Overridable style hooks; see the `overrides` property. `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth`, `focusRingRadius` and `focusRingOffset` are locked and excluded. */
type LinkOverridableBinding = "underlineThickness" | "underlineOffset" | "externalIconGap" | "transition";
export declare class DsLink extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The destination. A URL. An empty href still renders `href=""`, so the anchor stays a link in the focus order. */
  accessor href;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  accessor label;
  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  accessor external;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  accessor tone: LinkTone;
  /** Downloads the resource instead of navigating, under the server's file name. */
  accessor download;
  /**
   * The link points at the page the user is on, in a navigation list: `aria-current="page"` on the anchor.
   * The link keeps its colours and underline; how a navigation marks it visually is that container's to say.
   * False writes nothing.
   */
  accessor current;
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
  /**
   * The `<li>` wrappers are one per light-DOM child, so a child added or
   * removed after the first render has to re-render. `childList` only: a
   * callback that watched attributes would see its own `data-ds` write.
   */
  private readonly observer;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  private get items();
  protected override render(): TemplateResult;
  protected override updated(): void;
  /**
   * Assign light-DOM children to the shadow slots. Manual assignment keeps the
   * children where the consumer put them: nothing is reparented, so there is no
   * `slotchange` loop to guard against. Re-assigning the same nodes is a no-op.
   */
  private assignSlots;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-stack": DsStack;
  }
}
//#endregion
//#region src/Form.d.ts
type FormValidate = "submit" | "blur" | "change";
/** Detail carried by the `submit` CustomEvent. */
interface FormSubmitDetail {
  values: Record<string, string | number | boolean | string[] | [number, number]>;
}
/** Detail carried by the `invalid` CustomEvent. */
interface FormInvalidDetail {
  errors: Record<string, string>;
}
/**
 * The contract a light-DOM element must implement to be collected by
 * `<ds-form>`. Form finds fields by the `data-ds-field` attribute on their host,
 * never by tag, so any element that sets it and implements this interface is
 * collected. `error` and `validationMessage` are optional: a field that never
 * validates (Switch) omits them, and Form treats absence as valid.
 * `currentValue` is `null` when the field contributes no key (empty, unchecked,
 * unselected).
 */
interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error?: string | undefined;
  /**
   * Set by Form from the result of `checkValidity()`, which is how the field
   * renders its own message (every field documents `invalid` as "usually set by
   * the Form"). Optional: a field that never validates omits it.
   */
  invalid?: boolean | undefined;
  readonly currentValue: string | number | boolean | string[] | [number, number] | null;
  id: string;
  focus(): void;
  checkValidity(): boolean;
  readonly validationMessage?: string | undefined;
}
/** Overridable style hooks; see the `overrides` property. `errorSummaryText` and `errorSummaryBackground` are locked and excluded. */
type FormOverridableBinding = "gap" | "errorSummaryBorder" | "errorSummaryBorderWidth" | "errorSummaryRadius" | "errorSummaryPadding" | "errorSummaryGap";
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
  /** Disables every field and action inside. Use while submitting. The container applies no opacity of its own. */
  accessor disabled;
  /**
   * When submission fails validation, render a summary of errors above the fields that links to each field.
   * Attribute is the negation, `no-error-summary`, because a boolean attribute cannot express `false` for a
   * prop that defaults `true`.
   */
  accessor errorSummary;
  /** Per-instance style overrides: `{ gap: 'layout.gap.normal' }`. Locked bindings (errorSummaryText, errorSummaryBackground) are ignored. */
  accessor overrides: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Field name -> message for the error summary: document order at the failed submit, with errors that
   * blur or change validation finds later appended at the end. Empty until a submission fails.
   */
  private accessor errors;
  /** Each errored field's `label` as registered, so an entry whose field has since gone keeps its fallback text. */
  private readonly errorLabels;
  /** Once a submission has failed, fields re-validate on blur/change even in `submit` mode; a successful one clears it. */
  private hasFailedSubmission;
  /** The plural locale, read at the failed submit (nearest `lang` ancestor, else the runtime default). */
  private summaryLocale;
  /** Fields and actions this Form disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByForm;
  /** Fields this Form marked invalid, so re-validating never clears one the consumer marked itself. */
  private readonly invalidByForm;
  /** Re-syncs disabled propagation when fields are added or removed; observes `childList` only, never the attributes it writes. */
  private readonly mutationObserver;
  /** Focus the error summary once it exists, after the render that follows a failed submission. */
  private pendingSummaryFocus;
  private readonly instanceId;
  /** The forbidden-nesting dev warning is emitted once per element, not on every reconnection. */
  private warnedAboutNesting;
  constructor();
  private get idBase();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderSummary;
  /**
   * copy.summaryHeading, pluralised by `count` in the locale read at the failed submit. A `lang` tag
   * `Intl.PluralRules` rejects falls back to the runtime default locale rather than throwing.
   */
  private summaryHeading;
  /** Validate every field and, only if all pass, dispatch `submit` with the collected values. */
  submit(): void;
  private handleNativeSubmit;
  private handleKeydown;
  private handlePress;
  private handleFieldChange;
  private handleFieldFocusOut;
  /**
   * Runs the field's own synchronous validation and mirrors the result onto its
   * `invalid` property, which is what makes the field render its own message.
   * Form never composes a message of its own: the text shown is the field's
   * copy, and `validationMessage` is what the summary repeats.
   */
  private runFieldValidation;
  /** A field with no useful blur moment (Checkbox, Switch) declares `data-ds-field="change"`. */
  private validatesOnChange;
  private handleSummaryLinkClick;
  /**
   * Runs the field's own validation (the field shows its error). The summary only tracks it after a failed
   * submission: a fixed field drops out, a still-listed one keeps its place, a newly invalid one is appended.
   */
  private validateField;
  /** The collected field an event came from, or `null`. */
  private fieldFor;
  /** Fields with a `name`, in document order, not inside a closed `ds-disclosure` without `keep-mounted`. */
  private queryFields;
  private isInsideClosedDisclosure;
  /** A field missing an `id` gets `{name}-{field.name}`, so an error summary link always has somewhere to point. */
  private assignFieldIds;
  /** Every `ds-button` slotted into `actions`, including the slotted element itself. */
  private queryActionButtons;
  /** Disables every found field and action button, remembering which it disabled so re-enabling is exact. */
  private syncDisabled;
  /** Accessible name as plain host attributes, `labelledBy` winning over `label`. */
  private syncName;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-form": DsForm;
  }
}
//#endregion
//#region src/Box.d.ts
type BoxInset = "none" | "sm" | "md" | "lg" | "xl";
type BoxSurface = "none" | "default" | "subtle" | "strong";
type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
type BoxElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav";
/** Overridable style hooks; see the `overrides` property. `background` is locked and excluded. */
type BoxOverridableBinding = "paddingBlock" | "paddingInline" | "border" | "borderWidth" | "radius";
export declare class DsBox extends LitElement {
  static override styles: CSSResult;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  accessor inset: BoxInset;
  /**
   * Vertical padding, overriding `inset` on that axis. No default: unset means `inset`
   * applies, which keeps an explicit `none` distinct from an absent value.
   */
  accessor insetBlock: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies. */
  accessor insetInline: BoxInset | undefined;
  /**
   * Background. `none` is transparent; `default` is the page background (use to
   * lift content off a subtle parent); `subtle` and `strong` step up.
   */
  accessor surface: BoxSurface;
  /** A thin default border. */
  accessor border;
  /** Corner radius from the theme's presets. */
  accessor radius: BoxRadius;
  /**
   * Element to render. The host is always the element in the DOM, so this swaps
   * nothing in the shadow root; `article`, `aside`, `main` and `nav` set their
   * implicit role on the host as a plain `role` attribute, and `div`, `section`,
   * `header` and `footer` set none. Sectioning values only when the box is a
   * semantic region; prefer Landmark for page regions.
   */
  accessor element: BoxElement;
  /** Per-instance style overrides: `{ radius: 'radius.lg' }`. The locked `background` is ignored. */
  accessor overrides: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The role this element last wrote, so it never removes a `role` the consumer set. */
  private ownRole;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * Overrides change values, never presence: `border: false` draws no border and
   * `radius: none` rounds nothing, so those bindings are not in effect and their
   * overrides are no-ops.
   */
  private isInEffect;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-box": DsBox;
  }
}
//#endregion
//#region src/Checkbox.d.ts
/** Detail carried by the `change` CustomEvent. */
interface CheckboxChangeDetail {
  /** The new checked state. */
  checked: boolean;
}
/** Overridable style hooks; see the `overrides` property. `controlBorder`, `controlSelectedBackground`, `indicator`, `indicatorStroke`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type CheckboxOverridableBinding = "controlBackground" | "controlBorderWidth" | "pressedOverlay" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "gap" | "partGap" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsCheckbox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Clicking or tapping it toggles the control. */
  accessor label;
  /** Visually hide the label (it remains the accessible name). */
  accessor hideLabel;
  /** Field name used by the enclosing Form when collecting values. */
  accessor name;
  /** What a native `<form>` submits under `name` when checked. ds-form ignores it and collects the boolean. */
  accessor value;
  /** Initial state when the `checked` attribute is absent. */
  accessor defaultChecked;
  /** Shows the mixed indicator. Visual and announced only; the submitted value still follows `checked`. */
  accessor indeterminate;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  accessor disabled;
  /** Must be checked to submit. Shown in the label, not only by color. */
  accessor required;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  /** Persistent helper text below the label. */
  accessor description: string | undefined;
  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  private checkedValue;
  /** The live checked state, like a native input: starts from the `checked` attribute, else `defaultChecked`, and follows every toggle. Not reflected. */
  get checked(): boolean;
  set checked(value: boolean);
  private errorValue;
  /** The error message. Setting it marks the control invalid. Say what to do. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  /** A user toggle clears the mixed indicator locally until `indeterminate` changes value again. */
  private accessor mixedCleared;
  private accessor inputEl;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** The value `<ds-form>` collects: the checked boolean. */
  get currentValue(): boolean;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  /** The field's own copy, in the same order as its validity; empty when valid. */
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  /** Back to the initial state: the `checked` attribute, else `defaultChecked`. */
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  private get showMixed();
  /** Rendered error, as Input: `error`, then — only while invalid — copy.required when required and unchecked, else copy.invalid. */
  private get displayedError();
  /** helperSize, fontFamily and lineHeight forwarded to the description and error Text. */
  private get textOverrides();
  /** Clicks on the description or the gap toggle the control too. */
  private handleRowClick;
  /** Disabled uses aria-disabled so the control stays focusable; click and change are both guarded. */
  private handleControlClick;
  private handleChange;
  /** Mirror value and validity into ElementInternals, in the same order as Input. */
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
/** Where the label sits relative to the track. */
type SwitchLabelPosition = "start" | "end";
/** Detail carried by the `change` CustomEvent. */
interface SwitchChangeDetail {
  /** The new state. */
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
  /** Optional field name. When inside a Form the state is collected as a boolean; most switches are not in forms. Reflected so a name set as a property is still submitted by a native `<form>`. */
  accessor name;
  /** Initial state when neither the `checked` attribute nor property is set. */
  accessor defaultChecked;
  /** Cannot be toggled. Stays visible, readable and focusable, and contributes no key to the Form's values. */
  accessor disabled;
  /** Persistent helper text below the label explaining the effect. */
  accessor description: string | undefined;
  /** Where the label sits relative to the track. `start` is the settings-list convention; `end` matches Checkbox. */
  accessor labelPosition: SwitchLabelPosition;
  /** Per-instance style overrides: `{ trackWidth: 'space.12' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  private checkedValue;
  /** The live state, like a native input: starts from the `checked` attribute, else `defaultChecked`, and follows every toggle. Not reflected; there is no controlled mode. */
  get checked(): boolean;
  set checked(value: boolean);
  /** A switch has no required state: it never validates and never appears in an error summary. Setting it is ignored. */
  get required(): boolean;
  set required(_value: boolean);
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** The value `<ds-form>` collects: the state as a boolean. */
  get currentValue(): boolean;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  /** Always empty: a switch has no error state by design. */
  get validationMessage(): string;
  /** Always valid: a switch has no error state by design. */
  checkValidity(): boolean;
  /** Always valid: a switch has no error state by design. */
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  /** Back to the initial state: the `checked` attribute, else `defaultChecked`. */
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  /** helperSize, fontFamily and lineHeight forwarded to the description Text. */
  private get textOverrides();
  /** Clicks on the description, the text column or the row's gap toggle the switch too. */
  private handleRowClick;
  /** Disabled uses aria-disabled so the switch stays focusable; click and change are both guarded. */
  private handleControlClick;
  private handleChange;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-switch": DsSwitch;
  }
}
//#endregion
//#region src/RadioGroup.d.ts
/** Layout of the options. */
type RadioGroupOrientation = "vertical" | "horizontal";
/** Shape of each entry in `options`. */
interface RadioGroupOption {
  /** Short identifier (letters, digits, dashes); it becomes part of an element id. */
  value: string;
  /** The option's own label. */
  label: string;
  /** One line: price, timing, consequence. */
  description?: string | undefined;
  /** Natively disabled, so arrow movement skips it. */
  disabled?: boolean | undefined;
}
/** Detail carried by the `change` CustomEvent. */
interface RadioGroupChangeDetail {
  /** The value of the selected option. */
  value: string;
}
/** Overridable style hooks; see the `overrides` property. `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
type RadioGroupOverridableBinding = "controlBorderWidth" | "indicatorInset" | "controlBorderInvalid" | "controlSize" | "controlRadius" | "optionPaddingBlock" | "optionTextGap" | "optionGap" | "listGap" | "partGap" | "legendSize" | "legendWeight" | "labelSize" | "labelWeight" | "helperSize" | "fontFamily" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsRadioGroup extends LitElement implements DsFormField {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The group's legend — the question the options answer. Always visible. */
  accessor label;
  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  accessor name;
  /** The options in display order. Two to about seven; more than that is a Select. A property, not an attribute. */
  accessor options: RadioGroupOption[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  accessor value: string | undefined;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  accessor defaultValue: string | undefined;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  accessor orientation: RadioGroupOrientation;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  accessor required;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  accessor invalid;
  /** Disables every option. Individual options use `options[].disabled`. */
  accessor disabled;
  /** Persistent helper text under the legend. */
  accessor description: string | undefined;
  /** Per-instance style overrides: `{ controlSize: 'space.6' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  private errorValue;
  /** The group's error message. Setting it marks the group invalid. Say what to do. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Uncontrolled selection, seeded from `defaultValue`. */
  private accessor internalValue;
  /** `defaultValue` as it stood at first render; what a form reset returns to. */
  private initialValue;
  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`), or by `ds-fieldset`. */
  private accessor formDisabled;
  private readonly internals;
  constructor();
  override connectedCallback(): void;
  /** The value `<ds-form>` collects: the selected option value, or `null` when nothing is selected. */
  get currentValue(): string | null;
  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  /** The field's own copy, in the same order as the displayed error: `error`, then copy.required, then copy.invalid; empty when valid. */
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  /** Focus lands on the selected radio, else the first enabled one — the group's one tab stop. `delegatesFocus` alone would pick the first in tree order. */
  override focus(options?: FocusOptions): void;
  formDisabledCallback(disabled: boolean): void;
  /** Back to the initial selection: `defaultValue` as read at first render, else nothing. */
  formResetCallback(): void;
  formStateRestoreCallback(state: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  private get radios();
  /** The group's one tab stop: the checked radio, else the first enabled one. */
  private get focusTarget();
  /** Rendered error, as Input: `error`, then — only while invalid — copy.required when required and nothing is selected, else copy.invalid. */
  private get displayedError();
  /** helperSize, fontFamily and lineHeight forwarded to the description, radioDescription and error Texts. */
  private get textOverrides();
  /** Clicks on an option's description or empty row space select it too: the whole row is the hit area. */
  private handleRowClick;
  /** A disabled group keeps its radios focusable (aria-disabled); clicks are cancelled on the fieldset so nothing is selected. */
  private handleGroupClick;
  /** A disabled group swallows the native arrow movement and Space selection, which aria-disabled does not stop. */
  private handleKeydown;
  private handleChange;
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
/** Gap between the fields, from the layout rhythm. */
type FieldsetGap = "tight" | "normal" | "loose";
/** Overridable style bindings; see the `overrides` property. `legendColor`, `descriptionText` and `errorText` are locked and excluded. */
type FieldsetOverridableBinding = "legendSize" | "legendWeight" | "helperSize" | "partGap" | "fieldsGap" | "disabledOpacity" | "fontFamily" | "lineHeight";
export declare class DsFieldset extends LitElement {
  static override styles: CSSResult;
  /** The group's name — what the fields together describe ("Shipping address"). Always visible, and the group's accessible name. */
  accessor legend;
  /** Persistent helper text under the legend, linked with aria-describedby. An empty string counts as unset. */
  accessor description: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. An empty string counts as unset. */
  accessor error: string | undefined;
  /** Disables every direct child field. Fields keep their own `disabled` for finer control. */
  accessor disabled;
  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  accessor gap: FieldsetGap;
  /** Per-instance style overrides: `{ fieldsGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
  /** Every direct child field is `required`; derived on slotchange and when a child's `required` attribute changes. */
  private accessor allFieldsRequired;
  /** The fields this Fieldset disabled itself, so clearing `disabled` never enables one disabled on its own. */
  private readonly disabledByFieldset;
  /** Watches the light DOM for `required` attribute changes; the callback writes state only, never an observed attribute, so it cannot re-trigger itself. */
  private readonly requiredObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** fieldsGap → the Stack's own `overrides.gap`, always sent as a token path: the override, else `layout.gap.{gap}`. The Stack gets no `gap` attribute, and Fieldset never sets --ds-stack-gap. */
  private get stackOverrides();
  /** legendSize, legendWeight, fontFamily and lineHeight → the legend Text's overrides. */
  private get legendOverrides();
  /** helperSize, fontFamily and lineHeight → the description and error Texts' overrides. */
  private get helperOverrides();
  private get typeOverrides();
  /** Direct children carrying `data-ds-field`; a field nested deeper is not inspected — put fields directly inside the Fieldset. */
  private directFields;
  private handleSlotChange;
  /** The indicator appears only when every direct child field is required; a group with no fields shows none. */
  private syncRequired;
  /** Sets `disabled` on direct fields, remembering which it set so clearing is exact. */
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
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  accessor tone: AlertTone;
  /** A short bold first line for the message. Optional for one-line messages. Never forwarded as the native `title`. */
  accessor heading: string | undefined;
  /** How the alert is announced when it appears. `status` is polite; `alert` interrupts (blocking errors only); `off` for alerts present at load. */
  accessor live: AlertLive;
  /** Shows a dismiss button at the end of the alert. Activating it fires `dismiss`; the consumer removes the alert. */
  accessor dismissible;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (background, foreground, bodyColor, icon) are not accepted. */
  accessor overrides: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;
  /** Body text edits do not change a property; watch the light DOM to keep the accessible name current. */
  private readonly bodyObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * The region is named by its own content: the heading text when present,
   * else the body text. A plain `aria-label` attribute, since ids never cross
   * the shadow root and tests read the name from the attribute.
   */
  private syncAccessibleName;
  private handleDismiss;
  /**
   * The consumer will remove the alert, so focus moves first to the next
   * focusable element after the alert in reading order, or to the previous
   * one when there is none. Left alone if nothing outside the alert is
   * focusable. Walks the flat tree (open shadow roots and slot assignments)
   * so focusables inside other components count.
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
  /** Which landmark this is. Reflected to the host's `role` attribute; absent exposes no role. */
  accessor landmark: LandmarkRole | undefined;
  /**
   * Accessible name, rendered as `aria-label`. Required for `region` and `form`, and whenever
   * the page has more than one landmark of the same role. An empty string counts as absent.
   */
  accessor label: string | undefined;
  /** Set while the element writes `aria-label` itself, so the write does not feed back into `label`. */
  private syncingLabel;
  /** A (re)connection counts as a mount for the warnings. */
  private warnPending;
  /** No shadow root: children stay in the light DOM and the host is the landmark. */
  protected override createRenderRoot(): HTMLElement;
  override connectedCallback(): void;
  override attributeChangedCallback(name: string, old: string | null, value: string | null): void;
  protected override render(): typeof nothing;
  protected override updated(changed: PropertyValues): void;
  /**
   * Writes `aria-label` from `label`, omitting it when empty or when the role never takes a label,
   * and drops a composite's `aria-labelledby` on those roles too. Returns true when a label — from
   * either source — was passed to a role that never takes one, so it was not rendered.
   */
  private syncName;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-landmark": DsLandmark;
  }
}
//#endregion
//#region src/Breadcrumb.d.ts
/** Shape of each entry in `items`: `{ label: string; href?: string | undefined }`. */
interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
}
/** Detail carried by the `navigate` CustomEvent. `preventDefault()` on `originalEvent` (or on the `navigate` event) cancels navigation. */
interface BreadcrumbNavigateDetail {
  item: BreadcrumbItem;
  index: number;
  originalEvent: MouseEvent;
}
/**
 * Overridable style hooks; see the `overrides` property. `currentColor`, `itemColor`,
 * `separatorColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked: absent from this
 * type, but their `--ds-breadcrumb-*` hooks stay on `:host` for page CSS.
 */
type BreadcrumbOverridableBinding = "gap" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight";
export declare class DsBreadcrumb extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`; an
   * ancestor without one (or with `''`) renders as plain text. The last is the current page and
   * its `href` is ignored. A property, not an attribute.
   */
  accessor items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark (`copy.navLabel` by default). Change it only if the page has another breadcrumb. */
  accessor label: string;
  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the
   * ellipsis reveals the rest. Attribute is the negation, `no-collapse`, because a boolean
   * attribute cannot express `false` for a prop that defaults `true`.
   */
  accessor collapse;
  /** Per-instance style overrides: `{ gap: 'space.3' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Whether the user has revealed the collapsed items: one-way, private, for the life of the instance. */
  private accessor expanded;
  /** Once focus has fallen back to an item, the `<li>` at index 1 keeps `tabindex="-1"`. */
  private accessor fallbackTabindex;
  /** Focus target decided at the press, applied in the update that reveals the items. */
  private pendingFocus;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
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
type MeterOverrides = Partial<Record<MeterOverridableBinding, TokenRef | undefined>>;
export declare class DsMeter extends LitElement {
  static override styles: CSSResult;
  /**
   * The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the
   * clamped number too, exact and unrounded (`aria-valuenow="3.14159"`) — only the percentage
   * text is rounded.
   */
  accessor value: number;
  /** Lower bound of the range. A missing, unparseable or non-finite `min` is treated as 0. */
  accessor min: number;
  /** Upper bound of the range. Must be greater than `min`. A missing, unparseable or non-finite `max` is treated as 100. */
  accessor max: number;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  accessor label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw number
   * ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole
   * number ("32%"). Attribute `value-text`, not reflected.
   */
  accessor valueText: string | undefined;
  /**
   * Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger`
   * from thresholds it owns — the meter does not decide what is "too full".
   */
  accessor tone: MeterTone;
  /**
   * Hides the visible value text (a boolean attribute can only turn things on, so the flag is the
   * hiding one). The accessible value is always exposed. Attribute `hide-value`, not reflected.
   */
  accessor hideValue: boolean;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (track, fill, labelColor, valueColor) are ignored. */
  accessor overrides: MeterOverrides | undefined;
  override connectedCallback(): void;
  /** The exposed range: a non-finite bound is not a range end, so it falls back to the prop's default. */
  private get bounds();
  /** `value` clamped to the range: the accessible value. A non-finite value, and `max ≤ min`, resolve to `min`. */
  get clampedValue(): number;
  /** The filled fraction of the track, 0–1. Exact: the rounding is for the text only. */
  get fraction(): number;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** Developer-facing, never shown to users, and warned once per distinct invalid pair. */
  private warnInvalidRange;
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
/** Overridable style hooks; see the `overrides` property. `background`, `hoverBackground`, `focusRing` and `focusRingWidth` are locked and excluded. */
type CardOverridableBinding = "paddingBlock" | "paddingInline" | "partGap" | "headerGap" | "footerGap" | "actionsGap" | "border" | "borderWidth" | "radius" | "transition";
export declare class DsCard extends LitElement {
  static override styles: CSSResult;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content; an empty string counts as omitted. */
  accessor heading: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  accessor headingLevel: CardHeadingLevel;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  accessor inset: CardInset;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  accessor surface: CardSurface;
  /**
   * The whole card is one link or button target. Requires exactly one
   * interactive child (a Link or Button) at the top level of the body whose
   * action the card extends to its full area; the card itself is not focusable.
   */
  accessor interactive;
  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it
   * by script, and draws its own focus ring when focused that way. Not a tab
   * stop. With `interactive` also set, `interactive` wins and this is a no-op.
   */
  accessor focusable;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor hasHeaderActions;
  private accessor hasFooter;
  private readonly internals;
  private hitAreaTarget;
  private readonly targetObserver;
  /** Host attributes this element wrote, so a consumer's own `role`/`aria-label`/`tabindex` is never removed. */
  private ownsRole;
  private ownsLabel;
  private ownsTabindex;
  private warnedTarget;
  private warnedFocusable;
  /** A focusin that follows a pointerdown on the card is not the scripted focus the ring is for. */
  private afterPointerDown;
  constructor();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(changed: PropertyValues): void;
  private handleHeaderActionsSlotChange;
  private handleFooterSlotChange;
  private handleBodySlotChange;
  /** Finds the single interactive child among the body's top-level elements and marks it as the card's extended hit area. */
  private syncHitArea;
  private syncTargetDisabled;
  private setCustomState;
  /**
   * A click on the extended area lands on the target's own host box (its `::after`), not on the
   * native control inside a `ds-link`/`ds-button` shadow root, so it is forwarded to that control.
   */
  private readonly handleHostClick;
  /**
   * The ring shows only while the target itself has keyboard focus, never for a header-actions or
   * footer control. A focusable card rings whenever it takes focus by script — only a focusin that
   * follows a pointerdown on the card is skipped.
   */
  private readonly handleFocusIn;
  private readonly handleFocusOut;
  private readonly handlePointerDown;
  /** A pointerdown that moved focus nowhere must not suppress the next scripted focus. */
  private readonly handlePointerUp;
  /** `role="article"` named by `aria-label` when a heading is set; plain attributes so accessible-name tests see them. */
  private syncName;
  private syncTabindex;
  /**
   * Overrides change values, never presence. The border is drawn only on `surface="default"`,
   * an interactive card always reserves `border.width.focus` instead of its own width (so a
   * width override only reaches non-interactive cards), and the transition exists only for the
   * interactive hover. Those bindings are not in effect otherwise, so their overrides are no-ops.
   */
  private isInEffect;
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
  /** Where the capped column sits in a wider viewport. `start` sets `margin-inline: 0` on both sides. */
  accessor align: ContainerAlign;
  /**
   * Use `main` for the page's main column when no Landmark wraps it; a page has exactly
   * one, which is the author's responsibility — Container cannot see the rest of the page,
   * so it neither enforces it nor warns. The host is always the element in the DOM, so this
   * swaps no tag: `main` sets the landmark role on the host, and `div` and `section` set
   * none. It changes no styling, so it does not reflect.
   */
  accessor element: ContainerElement;
  /** Per-instance style overrides: `{ maxWidth: 'layout.maxWidth.page' }`. */
  accessor overrides: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * Overrides change values, never presence: `width: full` renders the literal `none` and
   * `gutter: none` a literal 0, neither read through a hook, so those bindings are not in
   * effect and their overrides are no-ops. No dev warning fires for one that has no effect.
   */
  private isInEffect;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-container": DsContainer;
  }
}
//#endregion
//#region src/FocusScope.d.ts
type FocusScopeAutoFocus = "first" | "last" | "container" | "none";
type FocusScopeEscapeAttemptDirection = "forward" | "backward";
/** Detail carried by the `escape-attempt` CustomEvent. */
interface FocusScopeEscapeAttemptDetail {
  direction: FocusScopeEscapeAttemptDirection;
}
/**
 * Where focus is restored instead of the recorded opener: an element, or a Lit
 * `Ref` (`createRef()`), the Lit counterpart of the doc's `RefObject`.
 */
type FocusScopeReturnTarget = HTMLElement | Ref<HTMLElement>;
export declare class DsFocusScope extends LitElement {
  static override styles: CSSResult;
  /**
   * Tab and Shift+Tab wrap within the scope's focusable descendants, and focus
   * that lands outside is pulled back in. False turns the scope into a plain
   * "move focus in and restore on exit" helper. Attribute: `no-trapped`.
   */
  accessor trapped;
  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own anchor, or nowhere. */
  accessor autoFocus: FocusScopeAutoFocus;
  /**
   * On unmount, focus returns to the element that was focused when the scope
   * mounted, or to the next focusable element if that one is gone.
   * Attribute: `no-restore-focus` (not reflected).
   */
  accessor restoreFocus;
  /** Explicit element (or Lit `Ref`) to restore focus to instead of the recorded opener. Property only. */
  accessor returnFocusTo: FocusScopeReturnTarget | undefined;
  /**
   * Pause the scope without unmounting it, so a nested scope can own Tab.
   * Attribute: `no-active`.
   */
  accessor active;
  private accessor anchorEl;
  private accessor startSentinelEl;
  private openerElement;
  /** Marker left beside the opener, so "the next focusable element" survives the opener's removal. */
  private openerMarker;
  /** The opener's ancestors, nearest first: the fallback when the marker went with the opener's parent. */
  private openerAncestors;
  private lastFocused;
  private childrenSettled;
  private readonly handleKeydown;
  private readonly handleDocumentFocusIn;
  private readonly handleSentinelFocus;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override getUpdateComplete(): Promise<boolean>;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * Records the opener, a marker beside it and its ancestor chain, so focus can be restored to its
   * former position even after the opener — or the opener's parent — is removed.
   */
  private recordOpener;
  private applyAutoFocus;
  /** The anchor, only while it is focusable (`autoFocus: container`). */
  private containerTarget;
  private resolveReturnTarget;
  /** `returnFocusTo`, then the recorded opener, then the first focusable after where it used to be. */
  private restoreFocusOnExit;
  /**
   * Waits for the slotted elements and every custom element in their light-DOM subtrees (not
   * elements inside those elements' own shadow roots), so the walker sees their focusable internals.
   */
  private settleChildren;
  private getFocusableDescendants;
  /** Trapped, active, connected, and the top active scope on the stack. */
  private isEffective;
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
type DialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "gutter" | "headerGap" | "footerGap" | "descriptionGap" | "widthSm" | "widthMd" | "widthLg" | "layer" | "enter" | "exit";
export declare class DsDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `close`. */
  accessor open;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. */
  accessor heading;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  accessor description: string | undefined;
  /** Visually hide the heading while it remains the accessible name. */
  accessor hideHeading;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  accessor size: DialogSize;
  /**
   * Escape, the close button and a scrim click all request close. Set false for a dialog that
   * must be answered: the close button is not rendered and the scrim does nothing; Escape still
   * fires `close` with reason `escape`. Attribute: `no-dismiss`.
   */
  accessor dismissible;
  /** Where focus lands on open: the first focusable control, the title, or the close button. */
  accessor initialFocus: DialogInitialFocus;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
  /** The exit transition is playing: the dialog stays rendered a beat past `open` turning false. */
  private accessor closing;
  /** A light-DOM child is assigned to the `footer` slot; the footer wrapper renders only then. */
  private accessor hasFooter;
  /** The heading became the focus fallback of `first` / `close`, so it takes tabindex -1 too. */
  private accessor headingIsFallback;
  private accessor dialogEl;
  private accessor scopeEl;
  private accessor scrimEl;
  private accessor surfaceEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private accessor bodySlotEl;
  private accessor footerSlotEl;
  private scrollLocked;
  private closingProgrammatically;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported;
  /** Watches light-DOM children for `slot="footer"`; the callback only compares and sets state. */
  private readonly footerObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult | typeof nothing;
  private readonly handleCancel;
  private readonly handleNativeClose;
  private readonly handleScrimClick;
  private readonly handleCloseButtonPress;
  /** A slotted form submitted with method="dialog" (or a formmethod="dialog" submitter) asks to close. */
  private readonly handleSubmit;
  private syncHasFooter;
  private handleOpen;
  private handleClose;
  /** Waits for the scrim and surface transitions; resolves with how many were running. */
  private transitionsSettled;
  /**
   * `title` → the heading. `first` → body, footer, close button, heading.
   * `close` → the close button; without one (not dismissible), the `first` order.
   */
  private applyInitialFocus;
  /** Focus rests on something inside the dialog — not on the scrim, and not on the page behind it. */
  private focusIsInside;
  private releaseScroll;
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
type AlertDialogOverridableBinding = "scrim" | "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "textGap" | "iconGap" | "footerGap" | "iconSize" | "width" | "gutter" | "layer" | "rise" | "enter" | "exit";
export declare class DsAlertDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility, as in Dialog. The consumer owns it; the element requests changes through `cancel` and `confirm`. */
  accessor open;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  accessor heading;
  /** What will happen and whether it can be undone, in one or two sentences. Becomes the accessible description. */
  accessor description;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger; warning and info → primary). */
  accessor tone: AlertDialogTone;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  accessor confirmLabel;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  accessor cancelLabel: string | undefined;
  /**
   * Blocks confirm while a precondition is unmet. Forwarded to the confirm Button's own
   * `disabled`, which is focusable-but-inert, so Confirm stays the last Tab stop. Cancel
   * always works.
   */
  accessor confirmDisabled;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
  /** The exit transition is playing: the dialog stays rendered a beat past `open` turning false. */
  private accessor closing;
  private accessor dialogEl;
  private accessor focusScopeEl;
  private accessor scrimEl;
  private accessor surfaceEl;
  private accessor cancelButtonEl;
  private scrollLocked;
  private closingProgrammatically;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported;
  private warnedEmpty;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult | typeof nothing;
  private readonly handleCancel;
  private readonly handleNativeClose;
  private readonly handleCancelPress;
  private readonly handleConfirmPress;
  private handleOpen;
  private handleClose;
  private transitionsSettled;
  private releaseScroll;
  private dispatchCancel;
  private applyOverrides;
  /** Warns once per element, naming all three required strings. */
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
/** A labelled group of entries (anatomy: group, groupLabel). Nested groups and separators inside a group are dropped. */
interface MenuGroup {
  group: string;
  items: MenuItem[];
}
/** A divider between entries (anatomy: separator). */
interface MenuSeparator {
  separator: true;
}
type MenuItem = MenuActionItem | MenuGroup | MenuSeparator;
type MenuOpenChangeReason = "trigger" | "escape" | "outside" | "action" | "controlled" | "tab-out" | "focus-out";
/** Detail carried by the `action` CustomEvent. */
interface MenuActionDetail {
  id: string;
}
/** Detail carried by the `open-change` CustomEvent. */
interface MenuOpenChangeDetail {
  open: boolean;
  reason: MenuOpenChangeReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `phoneBreakpoint`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type MenuOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "popupPadding" | "popupOffset" | "typeaheadReset" | "maxHeight" | "gutter" | "minWidth" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "itemRadius" | "groupLabelSize" | "groupLabelWeight" | "shortcutSize" | "separator" | "separatorMargin" | "fontFamily" | "fontSize" | "lineHeight" | "layer" | "enter" | "enterDistance";
export declare class DsMenu extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  accessor label;
  /** Actions, optionally grouped with a label or divided by separators. */
  accessor items: MenuItem[];
  /** Variant of the trigger Button. */
  accessor triggerVariant: MenuTriggerVariant;
  /** Icon on the trigger: the Button's leading icon with `iconOnly`, its trailing icon otherwise; `none` for no icon. */
  accessor triggerIcon: MenuTriggerIcon;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  accessor iconOnly;
  /**
   * Preferred position of the popup relative to the trigger (or `anchor`). Only
   * the block side flips when the popup would overflow the viewport; `start` and
   * `end` never flip — they resolve against the layout direction (in
   * right-to-left `start` is the right edge) and the popup is shifted inline
   * instead so it stays `gutter` away from the side edges.
   */
  accessor placement: MenuPlacement;
  /**
   * Controlled open state (the parent flips it from `open-change`). Omit for an
   * uncontrolled menu, which starts closed; there is no defaultOpen. A
   * controlled menu hides only when `open` becomes false — a parent that never
   * flips it keeps the menu open.
   */
  accessor open: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a trigger;
   * the trigger part is omitted and `open` must be controlled. The anchor stands
   * in for the trigger: a pointerdown on it is not `outside` and focus moving
   * onto it is not `focus-out`.
   */
  accessor anchor: HTMLElement | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** The item carrying the roving tabindex; `null` puts it on the first enabled item. */
  private accessor activeId;
  /** Set while the popup is shown but must hold no tab stop at all, after Tab moved focus out of it. */
  private accessor tabStopSuppressed;
  private accessor triggerEl;
  private accessor buttonEl;
  private accessor popupEl;
  private wasOpen;
  private pendingFocus;
  private restoreOnClose;
  /** With `anchor` there is no trigger, so focus returns to whatever held it when the menu opened. */
  private opener;
  private typeaheadBuffer;
  private typeaheadTimer;
  /** A window blur and the focusout it causes are one focus loss, and report once. */
  private focusLossReported;
  private warnedNothingToPress;
  /** Whether the menu is open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /** Moves toward `next`: uncontrolled flips internal state first; both modes report it after. */
  private requestOpen;
  private handleOpened;
  private handleClosed;
  private hidePopup;
  /** The element focus goes back to: the trigger, or in `anchor` mode whatever had it when the menu opened. */
  private restoreFocus;
  /** Closes and returns focus to the trigger once the menu actually closes (controlled: when `open` becomes false). */
  private closeAndRestore;
  private readonly handleTriggerPress;
  private readonly handleTriggerKeydown;
  private readonly handleMenuKeydown;
  /**
   * Tab and Shift+Tab close and let the browser carry on. The key is not prevented when there is
   * somewhere to park focus — the trigger, or a focusable `anchor` standing in for it: every item
   * drops to tabindex -1 and focus moves there, so the browser's own Tab continues from that point
   * and a popup a controlled parent still shows holds no tab stop. Only an unfocusable anchor makes
   * the menu move focus itself, to the first tabbable after (Tab) or last before (Shift+Tab) it.
   */
  private handleTab;
  private handleItemClick;
  /**
   * The one roving tabindex follows real focus, however the item got it. Converging write: the
   * guard makes a same-value assignment a no-op, so this cannot loop with the re-render that
   * moves the tabindex.
   */
  private handleItemFocus;
  private handleItemPointerEnter;
  /** The menu, its trigger, and the anchor standing in for a trigger. */
  private isInside;
  private readonly handleOutsidePointerDown;
  private readonly handleFocusOut;
  private readonly handleFocusIn;
  private readonly handleWindowBlur;
  /** One close per focus loss: the window blur and the focusout it causes report once between them. */
  private reportFocusLoss;
  private readonly handleReposition;
  private addGlobalListeners;
  private removeGlobalListeners;
  private navigableItems;
  private itemElements;
  /**
   * The item that actually holds focus. The menu moves real focus rather than pointing at an item
   * with aria-activedescendant, so focus is the source of truth: it can land on an item without
   * passing through `focusItem` (a click, a screen reader, a consumer calling focus()), and the
   * arrows, Home/End and typeahead all move from wherever it really is. `activeId` only backs the
   * roving tabindex.
   */
  private focusedActionId;
  private focusItem;
  private moveFocus;
  private selectItem;
  private typeahead;
  /**
   * Places the popup from the trigger (or `anchor`) rect for `placement`. Only the block side flips;
   * the inline side resolves against the layout direction and is shifted, never flipped, so the popup
   * stays `gutter` from both viewport edges (the leading edge wins when it cannot have both).
   */
  private updatePosition;
  private applyOverrides;
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
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  accessor content: string;
  /** Preferred side; flips when it would overflow the viewport. `start`/`end` are logical and mirror in right-to-left writing. */
  accessor placement: TooltipPlacement;
  /**
   * `true`: supplementary, the child's accessible description. `false`: the tooltip IS the child's name.
   * Defaults to true, so the attribute is the negated `no-describes`.
   */
  accessor describes: boolean;
  /** Hover delay before showing: `default` (motion.duration.base × 3) or `none` for a warm toolbar. */
  accessor delay: TooltipDelay;
  /**
   * Controlled visibility, for stories and tests only (the `Keyboard` story renders the tooltip open with it).
   * Product code never sets it: a tooltip is hover and focus driven. Escape still hides a tooltip rendered
   * with `open`, and it stays hidden until `open` next changes.
   */
  accessor open: boolean | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
  private readonly tooltipId;
  private descriptionEl;
  private bubbleEl;
  private triggerEl;
  private triggerLink;
  private visible;
  /** Escape hides the tooltip until the trigger loses hover and focus, or (controlled) `open` next changes. */
  private dismissed;
  private pointerOverTrigger;
  private pointerOverBubble;
  private triggerFocused;
  private showTimerId;
  private hideGraceTimerId;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** `open` set: visibility follows the property (and Escape), not hover or focus. */
  private get controlled();
  /** Creates the description copy and the bubble once, and appends them only when not already in place. */
  private ensureLightNodes;
  private readonly handleSlotChange;
  private attachTrigger;
  private detachTrigger;
  /**
   * Links the trigger to the tooltip text. ID references do not reach into a trigger's shadow root, so a custom
   * element — one whose tag name contains a hyphen, whether or not it is upgraded or its shadow root is open —
   * gets the text itself (`aria-description`, or `aria-label` when the tooltip is the name), which ds-button,
   * ds-link and ds-input forward to their inner control; a plain light-DOM trigger gets `aria-describedby` /
   * `aria-labelledby` pointing at the description copy.
   */
  private updateTriggerAria;
  private clearTriggerLink;
  private readonly handleTriggerPointerEnter;
  private readonly handleTriggerPointerLeave;
  private readonly handleTriggerFocusIn;
  private readonly handleTriggerFocusOut;
  /**
   * Escape hides the tooltip without moving focus, wherever focus is (WCAG 1.4.13). Attached to the document in
   * the capture phase only while the bubble is visible, and it stops that Escape, so inside a Dialog the first
   * Escape hides the tooltip and the second closes the Dialog.
   */
  private readonly handleDocumentKeydown;
  private readonly handleBubblePointerEnter;
  private readonly handleBubblePointerLeave;
  private readonly handleReposition;
  private requestShow;
  /**
   * Waits one pointerGrace so the pointer can cross the `offset` gap to the bubble, then hides if the trigger
   * has lost hover and focus. Losing both also clears an Escape dismissal, so the next hover shows it again.
   */
  private scheduleMaybeHide;
  private showBubble;
  private hideBubble;
  /**
   * Lets the browser evaluate a token expression by setting it on the always-present, visually-hidden
   * description node — a hidden probe inside this element, so it sees the hooks set on the host — and
   * reading the computed value back. An unresolved value (no theme loaded) computes to 0.
   */
  private resolveComputed;
  /** Resolves a duration token expression in ms; unresolved (no theme) is 0. */
  private resolveMs;
  /** Resolves a length token expression in px through a hidden probe's `padding-left`; unresolved is 0. */
  private resolvePx;
  /** Positions the bubble from the trigger rect at `placement`, resolving start/end from the trigger's direction and flipping on overflow. */
  private updatePosition;
  /** Writes `content` into both copies: plain text in the description, a composed <ds-text data-part="text"> in the bubble. */
  private renderLightContent;
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
type ToastDismissReason = "timeout" | "dismiss-button" | "escape" | "action" | "replaced" | "programmatic";
/** Detail carried by the `action` CustomEvent (none). */
type ToastActionDetail = void;
/** Detail carried by the `dismiss` CustomEvent. */
interface ToastDismissDetail {
  reason: ToastDismissReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse` and `minTarget` are locked and excluded; `stackGap`, `regionInset` and `layer` belong to `<ds-toast-region>`. */
type ToastOverridableBinding = "radius" | "shadow" | "paddingBlock" | "paddingInline" | "gap" | "maxWidth" | "fontFamily" | "fontSize" | "lineHeight" | "enter" | "enterOffset" | "exit";
/** Overridable style hooks for `<ds-toast-region>`; see its `overrides` property. */
type ToastRegionOverridableBinding = "stackGap" | "regionInset" | "layer";
export declare class DsToast extends LitElement {
  /** Focus delegates to the first control, so `toast.focus()` reaches the action or dismiss button. */
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** One sentence saying what happened ("Message sent", "3 files deleted"). Also the toast's accessible name. */
  accessor message;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  accessor tone: ToastTone;
  /** Label for a single action button ("Undo", "View"). When present the toast is persistent and pauses on hover and focus. */
  accessor actionLabel: string | undefined;
  private durationValue;
  private durationAssigned;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (motion.duration.loop × 6 / × 12, resolved at
   * region mount), `persistent` until dismissed. An action or `tone: "danger"`
   * makes the toast persistent regardless; a development warning notes that
   * only when `duration` was assigned.
   */
  get duration(): ToastDuration;
  set duration(value: ToastDuration);
  /** Shows a dismiss button. Persistent toasts are always dismissible. Exposed as the negated `no-dismiss` attribute. */
  accessor dismissible;
  /** Stable identity; showing a toast with the same `toastId` replaces this one instead of stacking. Attribute `toast-id`. No effect outside the region. */
  accessor toastId: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor containerEl;
  private accessor closing;
  private dismissed;
  private wasMoot;
  private timerId;
  private remainingMs;
  private timerStartedAt;
  private pointerOver;
  private focused;
  constructor();
  /** `true` once the toast has started leaving; it no longer counts toward the stack. */
  get dismissing(): boolean;
  /** An action or a danger tone keeps the toast until it is dismissed. */
  private get effectiveDuration();
  private get showDismiss();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** The first focusable control: the action button, else the dismiss button. */
  firstControl(): HTMLElement | null;
  private readonly handleActionPress;
  private readonly handleDismissPress;
  private readonly handleKeydown;
  private readonly handlePointerEnter;
  private readonly handlePointerLeave;
  private readonly handleFocusIn;
  private readonly handleFocusOut;
  private readonly handleVisibilityChange;
  /**
   * Starts the toast leaving. `dismiss` fires synchronously here, while the
   * toast is still connected so it bubbles to the region, and the element is
   * removed once the exit transition ends — at once for `replaced`, under
   * reduced motion, and when the exit time cannot be resolved. A toast holding
   * focus sends it back first; a `replaced` toast restores at unmount, and only
   * while focus is still inside it or has fallen to the body, so no dismissal
   * restores twice.
   */
  requestDismiss(reason: ToastDismissReason): void;
  /** shortDuration / longDuration, from the region's measurement at mount, else measured on this element. */
  private computeDurationMs;
  private restartTimer;
  private pauseTimer;
  private maybeResumeTimer;
  private clearTimer;
  private applyOverrides;
  /**
   * Warns each time a change to `duration`, `actionLabel` or `tone` enters the case where an
   * assigned `short`/`long` is moot — including a `duration` change while the case already held.
   */
  private warnForcedPersistent;
}
export declare class DsToastRegion extends LitElement {
  static override styles: CSSResult;
  /** Per-instance style overrides: `{ regionInset: 'layout.gutter' }`. */
  accessor overrides: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
  /** motion.duration.loop as resolved on the region at mount, in ms; `undefined` before mount, `null` when unresolved. */
  loopMs: number | null | undefined;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * Sends focus back to where it was before it entered the region; if that
   * element is gone, to the next focusable element after the region (the
   * previous one if there is none).
   */
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
  /** Called when the action button is activated, before the toast dismisses. */
  onAction?: (() => void) | undefined;
}
/** Resolution of the promise `toast()` returns, once the toast leaves the screen. */
interface ToastResult {
  reason: ToastDismissReason;
}
/**
 * Shows a toast, since a notification is an event, not a place in the tree.
 * Returns a promise that resolves once the toast leaves the screen. Showing a
 * toast with the same `toastId` as one already visible replaces it (`reason:
 * 'replaced'` for the old one) instead of stacking; a fourth visible toast
 * evicts the oldest the same way.
 */
export declare function toast(options: ToastOptions): Promise<ToastResult>;
/** Dismisses the toast with `toastId`, or every toast when no id is given, with reason `programmatic`. */
export declare function dismiss(toastId?: string): void;
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
/** Where focus goes on open: the first control, or nowhere (the composer moves it). */
type PopoverInitialFocus = "first" | "none";
/** Why `open-change` fired. */
type PopoverCloseReason = "trigger" | "escape" | "outside" | "close-button" | "tab-out";
/** Detail carried by the `open-change` CustomEvent. */
interface PopoverOpenChangeDetail {
  open: boolean;
  reason: PopoverCloseReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `breakpoint`, `focusRing` and `focusRingWidth` are locked and excluded. */
type PopoverOverridableBinding = "border" | "borderWidth" | "shadow" | "radius" | "inset" | "partGap" | "offset" | "arrowSize" | "maxWidth" | "gutter" | "layer" | "enter" | "enterDistance" | "exit";
export declare class DsPopover extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Optional heading at the top of the panel; also the accessible name. Without it, the panel is named by the trigger. */
  accessor heading: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline. */
  accessor headingLevel: PopoverHeadingLevel;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); there is no default-open. */
  accessor open: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay in the viewport. Logical: mirrors in right-to-left. */
  accessor placement: PopoverPlacement;
  /** `false` (default): the page stays interactive. `true`: a small Dialog anchored to the trigger — focus trapped, background inert. */
  accessor modal;
  /** A small pointer toward the trigger. Off by default. */
  accessor showArrow;
  /**
   * Show the close button. Escape and outside click work regardless (non-modal),
   * so this is a visibility switch. Attribute: the negated `no-dismiss`.
   */
  accessor dismissible;
  /**
   * Where focus goes on open. `first` (default): the first control in the body, then the close
   * button, then the heading, then the panel. `none`: no focus move — the composer focuses its own
   * element once the panel is shown (with `modal` that is outside the trap until it does).
   */
  accessor initialFocus: PopoverInitialFocus;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** Whether the panel content is rendered: while open, and through the exit transition. */
  private accessor mounted;
  /** The trigger's name, the panel's `aria-label` when `heading` is unset. */
  private accessor triggerAccessibleName;
  /** Physical side the panel resolved to on the last positioning pass. */
  private accessor side;
  private accessor panelEl;
  /** The `heading` part is the popover-owned wrapper; `tabindex="-1"` sits on the <ds-heading> inside it. */
  private accessor headingEl;
  private accessor headingControlEl;
  private accessor closeButtonControlEl;
  private accessor bodyEl;
  private accessor bodySlotEl;
  private readonly popoverSupported;
  private triggerEl;
  private wasOpen;
  private scrollLocked;
  private request;
  private exitGeneration;
  private warned;
  /** Whether the popover is currently open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * Re-measures and re-places the open panel. For composers whose slotted content lays out after
   * the panel opens, which the scroll and resize listeners never see. A no-op while closed.
   */
  reposition(): void;
  private readonly handleTriggerSlotChange;
  private detachTrigger;
  private updateTriggerAccessibleName;
  private updateTriggerExpanded;
  private readonly handleTriggerClick;
  private readonly handleCloseButtonPress;
  /**
   * The `closeButton` part hook is the popover-owned wrapper, so a press that lands on the
   * wrapper rather than on <ds-button> is forwarded to the button rather than swallowed.
   */
  private readonly handleCloseTargetClick;
  private readonly handleDialogCancel;
  private readonly handleDialogClose;
  private readonly handlePanelKeydown;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  /**
   * Uncontrolled: applies the change, then reports it. Controlled: reports it only;
   * the element follows once the consumer sets `open`.
   */
  private requestOpenChange;
  private handleOpened;
  private handleClosed;
  /** Keeps the content rendered through the exit transition, then drops it. */
  private unmountAfterExit;
  private releaseScrollLock;
  private removeOpenListeners;
  /** The first control in the body, then the close button, then the heading, then the panel itself. */
  private applyInitialFocus;
  /** The controls in the panel body, in flat-tree order. The first is where focus lands on open. */
  private getBodyFocusables;
  /**
   * Tabbable elements in panel DOM order, by FocusScope's walker — the header row (so the close
   * button) comes before the body, which the walker reaches through the `<slot>` assignments.
   */
  private getPanelFocusables;
  /**
   * Focuses the first focusable element after the host, else the trigger. "Focusable" is
   * FocusScope's walker run over the document in DOM order, so the elements inside the host —
   * trigger slot then panel, the panel included wherever the top layer draws it — sit together,
   * and the first one past them is the element a native Tab would have reached.
   */
  private focusAfterHost;
  /** Composed-tree containment: focus inside a child's shadow root counts as inside it. */
  private isWithin;
  private updatePosition;
  /** Resolves a length custom property to pixels through a probe, so rem- and calc-valued tokens work. */
  private readLength;
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
/** Detail carried by the `drag-dismiss` CustomEvent (none: distance and velocity are not part of the contract). */
type BottomSheetDragDismissDetail = void;
/**
 * Overridable style hooks; see the `overrides` property. `surface`, `handle`, `maxWidth`,
 * `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded.
 */
type BottomSheetOverridableBinding = "scrim" | "shadow" | "radius" | "handleHeight" | "handleWidth" | "handleRadius" | "headerPaddingTop" | "handleGap" | "headerGap" | "inset" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
export declare class DsBottomSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /**
   * Controlled visibility, as in Dialog. Controlled only — there is no uncontrolled mode; the
   * consumer owns `open` and the sheet requests changes through `close`, never changing it itself.
   */
  accessor open;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading`. */
  accessor heading;
  /**
   * Keep the heading for assistive technology but do not render it. The accessible name is
   * required regardless. Attribute: `hide-heading`.
   */
  accessor hideHeading;
  /**
   * `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full`
   * is a near-full-screen sheet with the top gutter visible so the scrim still shows.
   */
  accessor height: BottomSheetHeight;
  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. When false, only
   * the footer actions close it: the close button and the drag handle are not rendered, a scrim tap
   * and a drag do nothing, and Escape still reports with reason `escape`. Attribute: `no-dismiss`.
   */
  accessor dismissible;
  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive — Escape
   * always exists and the close button exists whenever the gesture does, so the handle is rendered
   * only when `dragToDismiss` and `dismissible` are both true. Attribute: `no-drag-to-dismiss`.
   */
  accessor dragToDismiss;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
  /** The exit transition is playing: the sheet stays rendered a beat past `open` turning false. */
  private accessor closing;
  /** A light-DOM child is assigned to the `footer` slot; the footer part renders only then. */
  private accessor hasFooter;
  /** Nothing else could take initial focus, so the heading takes tabindex -1 for the purpose. */
  private accessor headingIsFallback;
  private accessor dialogEl;
  private accessor scopeEl;
  private accessor scrimEl;
  private accessor surfaceEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private accessor bodySlotEl;
  private accessor footerSlotEl;
  private scrollLocked;
  private closingProgrammatically;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported;
  private gesture;
  /** Watches light-DOM children for `slot="footer"`; the callback only compares and sets state. */
  private readonly footerObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult | typeof nothing;
  private renderSheet;
  /** Heading writes its own data-part, so the heading part is this sheet-owned wrapper around it. */
  private renderHeading;
  private readonly handleCancel;
  private readonly handleNativeClose;
  private readonly handleScrimClick;
  private readonly handleCloseButtonPress;
  /**
   * The wrapper's extra target area activates the Button: it focuses it and requests close itself,
   * never reaching into the Button's internals or shadow root. A click on the Button is its own.
   */
  private readonly handleCloseWrapperClick;
  /** A slotted form submitted with method="dialog" (or a formmethod="dialog" submitter) asks to close. */
  private readonly handleSubmit;
  private syncHasFooter;
  /**
   * Nothing is claimed on pointerdown, so a tap on the close button still activates it; the drag
   * begins only once the pointer has moved `dragSlop` downward on the handle or header.
   */
  private readonly handlePointerDown;
  private readonly handlePointerMove;
  private readonly handlePointerUp;
  private readonly handlePointerCancel;
  /**
   * After a dismissing release: `updateComplete` after the `close` dispatch plus one animation
   * frame. If `open` is still true then, the sheet springs back; otherwise `handleClose` plays the
   * normal exit from the released offset.
   */
  private settleRelease;
  /** A spring-back also finishes an interrupted enter animation: it returns the surface to rest. */
  private springBack;
  private handleOpen;
  private handleClose;
  private transitionsSettled;
  /** The first focusable in the body, then in the footer, then the close button, then the heading. */
  private applyInitialFocus;
  /** Focus rests on something inside the sheet — not on the scrim, and not on the page behind it. */
  private focusIsInside;
  private releaseScroll;
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
/** One row of the sheet (anatomy: item). */
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
 * Overridable style hooks; see the `overrides` property. `surface`, `handle`, `itemHover`, `itemColor`,
 * `itemDangerColor`, `titleColor`, `minTarget`, `maxWidth`, `focusRing` and `focusRingWidth` are locked
 * and excluded.
 */
type ActionSheetOverridableBinding = "scrim" | "shadow" | "radius" | "itemPaddingBlock" | "itemPaddingInline" | "itemGap" | "headerPaddingBlock" | "headerGap" | "handleHeight" | "handleWidth" | "handleRadius" | "titleSize" | "fontFamily" | "fontSize" | "itemIconSize" | "lineHeight" | "divider" | "dividerWidth" | "layer" | "enter" | "exit";
export declare class DsActionSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. The sheet never closes itself; the consumer flips it from `action` and `close`. */
  accessor open;
  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; defaults to `copy.defaultLabel`. */
  accessor heading: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  accessor actions: ActionSheetAction[];
  /**
   * Escape, the scrim, the cancel row and the drag all request close; Escape still reports through
   * `close` when false. Gates the sheet presentation only. Attribute: `no-dismiss`.
   */
  accessor dismissible;
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. Attribute: `cancel-label`. */
  accessor cancelLabel: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
  /** Above the maxWidth breakpoint the actions present as `<ds-menu>`. */
  private accessor wide;
  /** The exit transition is playing: the sheet stays rendered a beat past `open` turning false. */
  private accessor closing;
  /** The action carrying the roving tabindex. */
  private accessor activeId;
  private accessor dialogEl;
  private accessor scopeEl;
  private accessor scrimEl;
  private accessor surfaceEl;
  private accessor cancelButtonEl;
  /** The element focused when `open` became true: the wide Menu's anchor and the focus-restore target. */
  private opener;
  private restoreAfterWideClose;
  private scrollLocked;
  private closingProgrammatically;
  private focusBeforeCancel;
  private escapeReported;
  private wideQuery;
  private breakpointRetry;
  private gesture;
  /** The wide Menu reported a choice since `open` became true: no later close is a dismissal. */
  private menuChoiceMade;
  /** A wide dismissal is already queued in this task (Menu can follow `outside` with `focus-out`). */
  private menuCloseQueued;
  private readonly handleWideChange;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult | typeof nothing;
  /** Above the breakpoint: Menu, anchored to the opener, with no trigger, scrim, drag or cancel row. */
  private renderMenu;
  private renderSheet;
  private renderItem;
  private accessibleName;
  private navigableActions;
  private menuItems;
  /** fontFamily and lineHeight are forwarded to the heading Text, and titleSize as its fontSize. */
  private headingOverrides;
  /** itemIconSize is forwarded to each row's Icon as its `size`, only when the caller set it. */
  private iconOverrides;
  private menuOverrides;
  private readonly handleListKeydown;
  private moveFocus;
  private focusAction;
  private handleItemClick;
  private readonly handleCancel;
  private readonly handleNativeClose;
  private readonly handleScrimClick;
  private readonly handleCancelPress;
  /**
   * Nothing is claimed on pointerdown, so a tap on the header is not a drag and nothing fires; the
   * drag begins only once the pointer has moved `dragSlop` downward on the handle or header.
   */
  private readonly handlePointerDown;
  private readonly handlePointerMove;
  private readonly handlePointerUp;
  private readonly handlePointerCancel;
  /**
   * After a dismissing release: `updateComplete` after the `close` dispatch plus one animation
   * frame. If `open` is still true then the sheet springs back; otherwise `handleClose` plays the
   * exit from the released offset.
   */
  private settleRelease;
  /**
   * Below the threshold (a tap included): back in place with the exit duration and the standard
   * easing. It also finishes an interrupted enter animation, by returning the surface to rest.
   */
  private springBack;
  private readonly handleMenuAction;
  private readonly handleMenuOpenChange;
  private handleOpen;
  private handleClose;
  private transitionsSettled;
  /** Focus is still inside the closing sheet: hand it back to the opener before the exit plays. */
  private restoreFocusToOpener;
  /** First enabled action; the cancel row when every action is disabled. */
  private applyInitialFocus;
  private watchBreakpoint;
  private readonly handleReadyStateChange;
  private stopBreakpointRetry;
  private unwatchBreakpoint;
  private releaseScroll;
  private dispatchAction;
  private dispatchClose;
  private applyOverrides;
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
type SidePanelOpenChangeReason = "trigger" | "escape" | "close-button" | "scrim" | "outside" | "swipe" | "action" | "navigation";
/** Detail carried by the `open-change` CustomEvent. */
interface SidePanelOpenChangeDetail {
  open: boolean;
  reason: SidePanelOpenChangeReason;
}
/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded, but keep their `:host` hooks. */
type SidePanelOverridableBinding = "scrim" | "shadow" | "border" | "borderWidth" | "width" | "widthNarrow" | "widthWide" | "edgeGutter" | "inset" | "headerGap" | "headingGap" | "partGap" | "footerGap" | "layer" | "enter" | "exit";
export declare class DsSidePanel extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  accessor open: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). */
  accessor heading: string;
  /** Keep the title for assistive technology but do not show it. The accessible name is required regardless. */
  accessor hideHeading;
  /** The edge the panel slides from; `start`/`end` follow the writing direction. */
  accessor side: SidePanelSide;
  /** Panel width on wide screens. On phones the panel is the viewport width minus `edgeGutter`. */
  accessor width: SidePanelWidth;
  /** Above this layout width the panel becomes a fixed sidebar: always visible, no scrim, no trap, no trigger. */
  accessor persistent: SidePanelPersistent;
  /**
   * The doc's `role`: the landmark the panel exposes (persistent, and the
   * non-modal region). Named `landmark` because `Element` already defines `role`.
   */
  accessor landmark: SidePanelLandmark;
  /** `false` (default, the disclosure pattern): a disclosed region. `true`: a modal dialog at the edge. */
  accessor modal;
  /** Show the scrim in non-modal mode too (modal always has one). Attribute `no-scrim` negates it. */
  accessor scrim;
  /**
   * Escape, the close button, a scrim tap / outside click and the swipe request
   * close. When false the close button is not rendered and a scrim tap or an
   * outside press does nothing; Escape still reports `open-change` with reason
   * `escape` and the consumer decides.
   */
  accessor dismissible;
  /** Accepted for parity; the swipe gesture is native only and wires nothing on Lit. Attribute `no-swipeable` negates it. */
  accessor swipeable;
  /** Per-instance style overrides: `{ inset: 'layout.inset.md' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** Whether the persistent breakpoint currently matches. */
  private accessor isPersistent;
  /** Whether the exit transition is playing (the panel stays rendered until it ends). */
  private accessor closing;
  /** Whether the footer slot has assigned content. */
  private accessor hasFooter;
  private accessor surfaceEl;
  private accessor dialogEl;
  private accessor headingEl;
  private accessor closeButtonEl;
  private triggerEl;
  private persistentQuery;
  private overlayShown;
  private overlayModal;
  private holdsScrollLock;
  private openerEl;
  /**
   * Where focus goes when the pending close finishes: `trigger` always, `none`
   * never (a followed Link owns focus; an outside press put it where it is),
   * `auto` only if focus was inside or the panel was modal (a controlled close).
   */
  private closeFocus;
  private exitTimer;
  private warnedHeading;
  /** Whether the panel is currently open, controlled or not. */
  get currentOpen(): boolean;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /** `inset` forwards to the body Box's `paddingInline`, but only when the caller overrode it. */
  private bodyOverrides;
  private headingOverrides;
  private footerOverrides;
  private readonly handleTriggerSlotChange;
  private readonly handleFooterSlotChange;
  private detachTrigger;
  /**
   * `aria-expanded` on the slotted trigger. `aria-controls` is never set: an
   * IDREF in the light DOM cannot address the panel inside the shadow root.
   */
  private updateTriggerExpanded;
  /** The trigger toggle is never gated by `dismissible`. A persistent sidebar has no trigger. */
  private readonly handleTriggerClick;
  /** A followed Link inside the panel closes it, and is never gated by `dismissible`. */
  private readonly handlePanelClick;
  private readonly handleCloseButtonPress;
  private readonly handleSurfaceKeydown;
  /**
   * A `cancel` the keydown handler did not already swallow (a platform back
   * gesture). The browser's own close is non-cancelable in some cases, so the
   * dialog is re-shown when `open` is still true.
   */
  private readonly handleCancel;
  /** A click whose target is the scrim element — modal and non-modal alike. */
  private readonly handleScrimClick;
  /** With no scrim to catch it, a press outside the panel and trigger (both inside the host) closes with `outside`. */
  private readonly handleOutsidePointerDown;
  /** A slotted `<form method="dialog">` submitted inside the panel asks it to close. */
  private readonly handleSubmit;
  /**
   * A user asked for `next`. Uncontrolled (and `apply`): the state changes first,
   * then `open-change` reports it. Controlled: only the event; the panel follows
   * `open` when the consumer sets it.
   */
  private requestOpenChange;
  private openOverlay;
  private startExit;
  private finishClose;
  private releaseScrollLock;
  /** After showModal(): the first focusable in the body, then the footer, then the close button, then the heading. */
  private applyInitialFocus;
  private findFirstFocusable;
  private addOutsideListener;
  private removeOutsideListener;
  /**
   * The breakpoint is read from the theme token on `<html>` when the component
   * connects; a theme change after that takes effect on the next mount. Where
   * `matchMedia` does not exist (jsdom) the overlay presentation renders.
   */
  private setupPersistentQuery;
  private readonly handlePersistentChange;
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
interface TabsItem {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
}
/** @deprecated Use `TabsItem`. */
type TabsTab = TabsItem;
/** Detail carried by the `change` CustomEvent. */
interface TabsChangeDetail {
  value: string;
}
/** Overridable style hooks; see the `overrides` property. Locked bindings (`tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `indicatorThickness`, `badgeColor`, `minTarget`, `focusRing`, `focusRingWidth`) are excluded. */
type TabsOverridableBinding = "tabPaddingBlock" | "tabPaddingInline" | "tabGap" | "listGap" | "listBorder" | "listBorderWidth" | "panelGap" | "badgeWeight" | "badgeSize" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "radius" | "transition" | "disabledOpacity";
export declare class DsTabPanel extends HTMLElement {
  connectedCallback(): void;
}
export declare class DsTabs extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The tabs in order. A property, not an attribute. */
  accessor tabs: TabsItem[];
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  accessor label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  accessor value: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  accessor defaultValue: string | undefined;
  /** `automatic` selects a tab as arrow keys move to it; `manual` moves focus only and selects on Enter/Space. */
  accessor activation: TabsActivation;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  accessor orientation: TabsOrientation;
  /** `start` packs tabs at the start; `fill` stretches them across the width. Horizontal only: vertical tabs always span the list's inline size. */
  accessor fit: TabsFit;
  /**
   * Keep unselected panels in the tree (hidden). On Lit panels are the
   * consumer's light-DOM children and are only ever hidden, never detached, so
   * both values keep them in the tree.
   */
  accessor keepMounted;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled tab). */
  private accessor internalValue;
  /** The tab carrying the roving tabindex. */
  private accessor focusedId;
  private accessor tablistEl;
  private accessor indicatorEl;
  private resizeObserver;
  private lastScrolledId;
  /** The tab the indicator last sat under; `null` when it was at zero size (or never placed). */
  private indicatorId;
  private readonly warned;
  /** The selected tab id, controlled or not. */
  get currentValue(): string | null;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderTab;
  /** The tab that is the list's single tab stop: the focused one, else the selected one, else the first enabled. */
  private rovingId;
  private readonly handleTabClick;
  private readonly handleKeydown;
  /**
   * The roving stop follows the tab that actually has focus, however it got it —
   * Tab into the list, a click, or a programmatic `focus()` — so the next arrow
   * key moves from there rather than from the selected tab.
   */
  private readonly handleFocusIn;
  /** Leaving the list returns the tab stop to the selected tab. */
  private readonly handleFocusOut;
  private handleSlotChange;
  private enabledTabs;
  private moveFocus;
  private focusEdge;
  private focusTab;
  /** Reports a user selection. Uncontrolled selection updates at once; controlled waits for `value` to change. */
  private selectTab;
  private tabElement;
  private panels;
  /**
   * Labels each slotted panel, toggles `hidden` on the unselected ones and points
   * each tab's aria-controls at its panel. Never moves, detaches or re-appends a
   * panel, and writes an attribute only when its value differs.
   */
  private syncPanels;
  /**
   * Places the indicator under the selected tab. It snaps on first placement,
   * when the selected tab first appears and on every resize remeasure
   * (`mayAnimate` false); only a move between two tabs sets `data-animate`.
   * With a selection that matches no tab it collapses to zero size.
   */
  private updateIndicator;
  /**
   * Keeps the selected tab visible when the list overflows, scrolling the list
   * only (never the page, so no scrollIntoView). Measured from the tab's box
   * within the list's client box, not from scrollLeft, so it holds in RTL
   * where scrollLeft is negative. A `fill` list does not scroll.
   */
  private scrollSelectedIntoView;
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
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  accessor label: string;
  /**
   * Two to five options (guidance, not enforced: any count renders, with no warning) in display
   * order. Labels are one word; with `iconOnly` the label becomes the accessible name. The icon is
   * an Icon whose `size` is the control's `size`. A property, not an attribute.
   */
  accessor options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  accessor value: string | undefined;
  /**
   * Initially selected value. Defaults to the first enabled option — a segmented control always has
   * a selection. A `value` or `defaultValue` is taken as given, never corrected: one naming a
   * disabled option keeps that segment checked with the pill under it (arrows still skip it); one
   * matching no option checks nothing and draws no pill. In both cases the tab stop is the first
   * enabled segment. Reads the `default-value` attribute; not reflected.
   */
  accessor defaultValue: string | undefined;
  /**
   * Show icons only (every option must have one); labels become accessible names and Tooltips. An
   * option without `icon` warns in development once per instance and shows its label as text
   * instead, so it never renders empty; that segment gets no Tooltip and no `aria-label`.
   */
  accessor iconOnly;
  /** Toolbar (`sm`) or standard (`md`) height. */
  accessor size: SegmentedControlSize;
  /** Stretch to the container width with equal segments. */
  accessor fill;
  /** Per-instance style overrides: `{ segmentRadius: 'radius.md' }`. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled option). */
  private accessor internalValue;
  private accessor groupEl;
  private accessor indicatorEl;
  private resizeObserver;
  private placedRect;
  private warnedLabel;
  private warnedIcon;
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
  /**
   * Whether a `role="toolbar"` ancestor contains the group, walking `parentElement` and crossing
   * shadow roots through each root's host. Starts at the group's parent, so the group never matches
   * itself.
   */
  private insideToolbar;
  private hostOf;
  private handleSegmentClick;
  private enabledOptions;
  private firstEnabled;
  private segmentElement;
  /** The value of the segment that holds focus right now, or undefined when none does. */
  private focusedValue;
  /** One tab stop: the selected segment when it is enabled, otherwise the first enabled one. */
  private tabStopValue;
  private select;
  private observeGroup;
  /**
   * Place the pill over the selected segment. Writes only when the measured box moved, so the
   * ResizeObserver that feeds it cannot drive itself.
   */
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
interface ListboxOption {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}
/** A labelled group of entries (anatomy: group, groupLabel). Groups do not nest. */
interface ListboxGroup {
  group: string;
  options: ListboxOption[];
}
/** The element type of `options`: a flat option or a group. Select and Combobox take the same `ListboxItem[]`. */
type ListboxItem = ListboxOption | ListboxGroup;
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
/** Overridable style hooks; see the `overrides` property. Locked bindings are excluded. */
type ListboxOverridableBinding = "border" | "borderInvalid" | "partGap" | "borderWidth" | "radius" | "listPadding" | "optionPaddingBlock" | "optionPaddingInline" | "optionGap" | "optionRadius" | "optionDescriptionSize" | "optionWeight" | "optionSelectedWeight" | "groupLabelSize" | "groupLabelWeight" | "groupLabelPaddingBlock" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "typeaheadReset";
export declare class DsListbox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Accessible name of the list, always its `aria-label`, and the `{label}` in `copy.required` / `copy.invalid`. */
  accessor label: string;
  /**
   * Id of a visible element that labels the list. Accepted for parity with web;
   * never resolved, since ids do not cross shadow roots — `label` names the list.
   */
  accessor labelledBy: string | undefined;
  /** Flat or grouped options in display order. A property, not an attribute. */
  accessor options: ListboxItem[];
  /** Allow any number of selections; the value becomes an array and selection toggles. */
  accessor multiple;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  accessor value: ListboxValue | undefined;
  /** Initial selection (or array) for an uncontrolled list. */
  accessor defaultValue: ListboxValue | undefined;
  /**
   * Single-select only: arrow keys, Home/End, PageUp/PageDown and typeahead
   * select as they move. Exposed as the negated attribute
   * `no-selection-follows-focus`.
   */
  accessor selectionFollowsFocus;
  /** At least one option must be selected to submit when inside a Form. */
  accessor required;
  /** Marks the list invalid (aria-invalid, `borderInvalid` when not embedded) with `copy.invalid`. */
  accessor invalid;
  private errorValue;
  private invalidFromError;
  /**
   * Error message rendered below the list and linked by aria-describedby.
   * Implies `invalid`; clearing it never clears an explicitly set `invalid`.
   */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** The list lives inside a popup that owns border, surface and radius; the list draws none of its own. */
  accessor embedded;
  /** The option active when the list first receives focus; wins when it names an enabled option. */
  accessor initialActiveValue: string | undefined;
  /** Options are being fetched: `copy.loading` replaces the empty message and the list is aria-busy. */
  accessor loading;
  /** The whole list is inert but readable: still focusable, aria-disabled, and keys, hover and clicks do nothing. */
  accessor disabled;
  /** Field name for Form collection. Without it nothing is submitted. */
  accessor name;
  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  accessor maxVisible: ListboxMaxVisible;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled selection, seeded from `defaultValue`. */
  private accessor internalValue;
  /**
   * Controlled active option, for a host that keeps focus on its own trigger or
   * input (Select, Combobox, Search). Set, it wins over `initialActiveValue`;
   * `null` means no option is active. Omit (undefined) to let the list own it.
   */
  accessor activeValue: string | null | undefined;
  /** Uncontrolled active option, used while `activeValue` is undefined. */
  private accessor internalActive;
  /** Text overrides forwarded to the emptyState and errorMessage Texts: the root typeface and line height. */
  private textOverrides;
  /** Disabled by an owning native form or fieldset. */
  private accessor formDisabled;
  private accessor listEl;
  private readonly instanceId;
  private readonly errorId;
  private readonly emptyId;
  private typeaheadQuery;
  private typeaheadTimer;
  private warnedMissingLabel;
  private readonly internals;
  constructor();
  private get flatOptions();
  private get enabledOptions();
  private get isDisabled();
  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): ListboxValue | null;
  /** The active option in effect: the controlled `activeValue` when set, else the list's own. */
  private get currentActive();
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  /** The field's own copy string for its current validity, or '' when valid. */
  get validationMessage(): string;
  private get selectedSet();
  /** True only while DOM focus really sits on the list (a host that forwards keys keeps its own focus). */
  private get listHasFocus();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  override focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  /** Forward a keydown from a composing element (Select, Combobox, Search) into the listbox keyboard model. */
  readonly handleKey: (event: KeyboardEvent) => void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /**
   * A listbox owns only options and groups, so the empty/loading row is hidden
   * from the accessibility tree and reaches the user as the list's description
   * instead — `aria-describedby` resolves hidden text, so the still-focusable
   * empty list announces "No options" either way.
   */
  private renderEmpty;
  private renderItems;
  private renderOption;
  /** The displayed message: `error`, else while invalid `copy.required` (required, nothing selected) or `copy.invalid`. */
  private displayedMessage;
  /** `initialActiveValue` when it names an enabled option, else the first selected, else the first enabled. */
  private initialOption;
  /**
   * `initialActiveValue` changed while the list has no focus (a Combobox updates
   * it as the user types): the active option moves to it silently, without
   * firing `active-change`.
   */
  private followInitialActiveValue;
  /**
   * Real focus on the list: the active option (kept when it names an enabled
   * option, else the resolved initial option) is reported every time, even when
   * its value has not changed, so a host always learns where focus went.
   */
  private readonly handleListFocus;
  private readonly handleListBlur;
  private handleOptionClick;
  private handleOptionPointer;
  private activeIndex;
  /** Arrows and Page keys: clamp at the first and last enabled option, never wrap. */
  private moveBy;
  /** Moves the active option and, in single-select with `selectionFollowsFocus`, selects it. */
  private moveToIndex;
  /** The `maxVisible` row count PageUp/PageDown move by; `all` jumps to the ends. */
  private pageSize;
  /** Shift+Arrow with `multiple`: move and add (never remove) the reached option. */
  private extendSelection;
  /** Ctrl/Cmd+A with `multiple`: select every enabled option, or deselect them all; selected disabled options stay. */
  private toggleSelectAll;
  private handleTypeahead;
  /** Space/Enter: act on the active option, or the resolved initial option when none is active yet. */
  private selectActive;
  private selectSingle;
  /** Selected values in option order (selected values not among the options keep their place at the end). */
  private orderValues;
  /**
   * Makes `value` active and reports it. Controlled (`activeValue` set), the
   * list only reports; the host passes the value back. `always` reports an
   * unchanged value too (real focus); every other source is deduped.
   */
  private setActive;
  private scrollActiveIntoView;
  /** Uncontrolled: stores the value. Controlled: only reports it; the list updates when `value` changes. */
  private commitValue;
  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage;
  private syncInternals;
  private applyOverrides;
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
 * `triggerBorder`, `triggerBorderFocus`, `valueColor`, `placeholderColor`,
 * `chevron`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm` and
 * `focusRingWidth` are locked and excluded.
 */
type SelectOverridableBinding = "triggerBorderInvalid" | "triggerBorderWidth" | "triggerRadius" | "triggerPaddingInline" | "triggerPaddingBlock" | "triggerGap" | "chevronReserve" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "disabledOpacity" | "enter";
export declare class DsSelect extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered. */
  accessor label;
  /** Field name for the Form. */
  accessor name;
  /** The options, passed through to the Listbox. A property, not an attribute. */
  accessor options: ListboxItem[];
  /** Controlled value (array with `multiple`). Omit for an uncontrolled field. */
  accessor value: SelectValue | undefined;
  /** Initial value (array with `multiple`). */
  accessor defaultValue: SelectValue | undefined;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  accessor placeholder: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  accessor hideLabel;
  /** sm for pickers inside toolbars and calendar headers. */
  accessor size: SelectSize;
  /** Controlled popup state. Omit for the trigger-driven default. */
  accessor open: boolean | undefined;
  /** Pick any number. The trigger shows the labels (two or fewer) or `copy.selectedCount`; the popup stays open while toggling. */
  accessor multiple;
  /** Helper text under the label. */
  accessor description: string | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  accessor required;
  /** Not openable and not submitted. Stays visible and focusable. */
  accessor disabled;
  /** Marks the field invalid. Usually set by the Form. */
  accessor invalid;
  private errorValue;
  private invalidFromError;
  /** Error message; implies invalid. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** `auto` and `never` render the styled popup on web; `always` renders a native `<select>`. */
  accessor native: SelectNative;
  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value, seeded from `defaultValue`. */
  private accessor internalValue;
  /** Uncontrolled popup state. */
  private accessor internalOpen;
  /** The Listbox's active option while the popup is open. */
  private accessor activeValue;
  /** Disabled by an owning native form or fieldset. */
  private accessor formDisabled;
  private accessor triggerEl;
  private accessor popupEl;
  private accessor listboxEl;
  private readonly internals;
  private shown;
  private warned;
  constructor();
  private get flatItems();
  private get isDisabled();
  private get usesPopup();
  /** Whether the popup is open, controlled or not. */
  get currentOpen(): boolean;
  /** `disabled` wins over a controlled `open`: a disabled Select never shows its popup. */
  private get showsPopup();
  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): SelectValue | null;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  /** The field's own copy string for its current validity, or '' when valid. */
  get validationMessage(): string;
  private get selectedSet();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  override focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderPopupField;
  private renderNativeField;
  private displayLabels;
  private defaultActiveValue;
  /** The label focuses the trigger; it never activates it. */
  private readonly handleLabelClick;
  private readonly handleTriggerClick;
  private readonly handleTriggerKeydown;
  /** Keeps DOM focus on the trigger while the pointer works the list. */
  private readonly handlePopupMouseDown;
  private readonly handlePopupClick;
  private readonly handleListboxChange;
  private readonly handleListboxActiveChange;
  private readonly handleNativeChange;
  private readonly handleOutsidePointerDown;
  /** Focus leaving the element closes the popup. */
  private readonly handleFocusOut;
  private readonly handleReposition;
  /** Single-select: commits the active option. */
  private commitActive;
  /** `multiple`: toggles the active option, keeping the value in option order as the Listbox does. */
  private toggleActive;
  /** Reports the new popup state; only an uncontrolled element applies it. */
  private requestOpen;
  /** Reports a changed value; only an uncontrolled element stores it. */
  private commitValue;
  private showPopup;
  private hidePopup;
  private addGlobalListeners;
  private removeGlobalListeners;
  /** Below the trigger, flipped above when it would overflow the viewport; at least as wide as the trigger. */
  private updatePosition;
  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage;
  private syncInternals;
  private applyOverrides;
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
 * `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`,
 * `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`,
 * `minTarget`, `inputMinTarget` and `focusRingWidth` are locked and excluded
 * (their `--ds-combobox-*` hooks stay themeable from page CSS; `iconColor` is
 * declared for the hooks gate but reaches the icons through each Icon's `overrides.color`).
 */
type ComboboxOverridableBinding = "fieldBorderInvalid" | "fieldBorderWidth" | "fieldRadius" | "fieldPaddingInline" | "fieldPaddingBlock" | "fieldGap" | "chipRadius" | "chipPaddingInline" | "chipPaddingBlock" | "chipGap" | "partGap" | "labelWeight" | "helperSize" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupShadow" | "popupRadius" | "popupOffset" | "layer" | "fontFamily" | "fontSize" | "chipSize" | "lineHeight" | "disabledOpacity" | "enter";
export declare class DsCombobox extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label. Always rendered. */
  accessor label;
  /** Field name for the Form. */
  accessor name;
  /** The full option set, or the current page of results when `filter` is `async`. A property, not an attribute. */
  accessor options: ListboxItem[];
  /** Controlled selected value(s): an array with `multiple`. Omit for an uncontrolled field. */
  accessor value: ComboboxValue | undefined;
  /** Initial value(s). */
  accessor defaultValue: ComboboxValue | undefined;
  /**
   * Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default.
   * The `open` attribute mirrors the effective state (controlled or not); the mirror write does not make the element controlled.
   */
  accessor open: boolean | undefined;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  accessor inputValue: string | undefined;
  /** Pick many: selected options appear as removable chips before the input; the list stays open while toggling. */
  accessor multiple;
  /** Typed text that matches no option can be committed as a value with Enter or a comma. */
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
  /** Marks the field invalid. */
  accessor invalid;
  private errorValue;
  private invalidFromError;
  /** Error message; implies invalid. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  accessor loading;
  /** Show a clear button when there is a value or text. Attribute: `no-clear` turns it off. */
  accessor clearable;
  /** Per-instance style overrides: `{ fieldRadius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled value, seeded from `defaultValue`. */
  private accessor internalValue;
  /** Uncontrolled input text. */
  private accessor internalText;
  /** Uncontrolled popup state. */
  private accessor internalOpen;
  /** The Listbox's active option while the popup is open. */
  private accessor activeValue;
  /** Set by the toggle button: this opening shows the unfiltered list until the next keystroke. */
  private accessor showAll;
  /** Debounced text of the status live region. */
  private accessor statusText;
  /** Disabled by an owning native form or fieldset. */
  private accessor formDisabled;
  private accessor fieldEl;
  private accessor inputEl;
  private accessor popupEl;
  private accessor listboxEl;
  private readonly internals;
  private shown;
  private warned;
  /** Set while the element writes its own `open` attribute, so the mirror is not read back as a controlled `open`. */
  private mirroringOpen;
  private openIntent;
  private pendingStatus;
  private statusTimer;
  /** Labels seen for each value, so a chip keeps its label when async results no longer include it. */
  private readonly labelCache;
  constructor();
  private get isDisabled();
  private get isLoading();
  /** Whether the list is open, controlled or not. */
  get currentOpen(): boolean;
  /** The current text of the input, controlled or not. */
  get currentText(): string;
  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): ComboboxValue | null;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  /** The field's own copy string for its current validity, or '' when valid. */
  get validationMessage(): string;
  /** Selected values in selection order. */
  private get selectedValues();
  /** `options` narrowed per `filter`; `none`, `async` and a toggle-button opening show them all. */
  private get filteredOptions();
  /** The synthetic `copy.addCustom` row applies: custom entry on, text typed, and no option matches it by value or label. */
  private get showsCustomRow();
  /** What the Listbox shows: the filtered options, the custom row first, nothing while loading. */
  private get listOptions();
  private get enabledItems();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  override attributeChangedCallback(name: string, old: string | null, value: string | null): void;
  override focus(options?: FocusOptions): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderChip;
  /**
   * Opening through the `open` property moves DOM focus to the input — `copy.activeOption` and the
   * status region announce nothing otherwise — unless focus is already inside the field, so a
   * focused clear or chip-remove Button keeps it.
   */
  private claimFocus;
  private labelFor;
  private resolveIntent;
  private readonly handleInput;
  /** A click in the input opens the full list, as the toggle does, with the selected option active, else the first. */
  private readonly handleInputClick;
  private readonly handleKeydown;
  private readonly handleClearPress;
  private readonly handleTogglePress;
  private handleChipRemove;
  /** Keeps DOM focus in the input while the pointer works the list. */
  private readonly handlePopupMouseDown;
  /** The Listbox reports no change when the already-selected option is pressed; single-select still closes. */
  private readonly handlePopupClick;
  private readonly handleListboxChange;
  private readonly handleListboxActiveChange;
  private readonly handleOutsidePointerDown;
  /** Focus leaving the element closes the list. */
  private readonly handleFocusOut;
  private readonly handleReposition;
  /** Commits one row: single selects, shows its label and closes; multiple toggles (selection order), clears the text and stays open. */
  private commitRow;
  /** Commits typed text as a custom value, or the value of the option it matches by value or label. */
  private commitCustom;
  /** Reports new input text; only an uncontrolled element stores it. */
  private setText;
  /** Reports the new list state; only an uncontrolled element applies it. An open list moves its active option per `intent`. */
  private requestOpen;
  /** Reports a changed value; only an uncontrolled element stores it. */
  private commitValue;
  private showPopup;
  private hidePopup;
  private addGlobalListeners;
  private removeGlobalListeners;
  private scrollActiveIntoView;
  /** Below the field, flipped above when it would overflow the viewport; at least as wide as the field. */
  private updatePosition;
  /** The status message for the open list: loading, empty, or the plural result count. */
  private computeStatus;
  /** Updates the live region `statusDebounce` after the message last changed. */
  private syncStatus;
  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage;
  private syncInternals;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-combobox": DsCombobox;
  }
}
//#endregion
//#region src/Slider.d.ts
type SliderShowValue = "always" | "hover" | "never";
/** One entry of `marks`: a tick on the track, optionally labelled. */
interface SliderMark {
  value: number;
  label?: string | undefined;
}
/** A single value, or the low and high values of a range. */
type SliderValue = number | [number, number];
/** Detail carried by the `change` and `change-end` CustomEvents. */
interface SliderChangeDetail {
  /** The new value, or the low and high values of a range. */
  value: SliderValue;
}
/**
 * Overridable style hooks; see the `overrides` property. `fill`, `thumbBorder`,
 * `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`,
 * `bubbleText`, `descriptionText`, `errorText`, `minTarget`, `focusRing` and
 * `focusRingWidth` are locked and excluded.
 */
type SliderOverridableBinding = "track" | "trackHeight" | "trackRadius" | "thumb" | "thumbSize" | "thumbShadow" | "thumbActiveScale" | "haloSpread" | "mark" | "markSize" | "markLabelSize" | "markLabelGap" | "valueSize" | "bubblePaddingBlock" | "bubblePaddingInline" | "bubbleOffset" | "bubbleRadius" | "labelWeight" | "partGap" | "labelGap" | "trackPaddingBlock" | "fontFamily" | "fontSize" | "helperSize" | "disabledOpacity" | "transition";
export declare class DsSlider extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label naming the quantity ("Volume", "Price range"); the accessible name of the thumbs. */
  accessor label;
  /** Field name for the Form. A single value submits as one decimal string, a range as two under this name. */
  accessor name;
  /** Lower bound. */
  accessor min;
  /** Upper bound. */
  accessor max;
  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  accessor step;
  /** With `marks`, snap drag and click to the marks instead of `step`. */
  accessor snapToMarks;
  /** Must have a value other than the default to submit. */
  accessor required;
  /** Marks the slider invalid; independent of `error`. */
  accessor invalid;
  /** Controlled value; for a range, a two-number array. */
  accessor value: SliderValue | undefined;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  accessor defaultValue: SliderValue | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  accessor range;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  accessor formatValue: ((value: number) => string) | undefined;
  /** Where the value text appears: beside the label, as a bubble while pressed or focused, or nowhere. */
  accessor showValue: SliderShowValue;
  /** Tick marks on the track, optionally labelled. */
  accessor marks: SliderMark[] | undefined;
  /** Not adjustable, still readable: the thumbs stay focusable and nothing is submitted. */
  accessor disabled;
  /** Helper text. */
  accessor description: string | undefined;
  /** Error message. Setting it never changes the `invalid` prop; both make the slider aria-invalid. */
  accessor error: string | undefined;
  /** Per-instance style overrides: `{ trackHeight: 'space.2' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** The uncontrolled value; `undefined` falls back to `defaultValue`. */
  private accessor internalValue;
  /** The thumb being dragged, for the halo and the bubble. */
  private accessor pressedIndex;
  /** The thumb holding focus (any focus, not only :focus-visible), for the bubble. */
  private accessor focusedIndex;
  /** Disabled by an owning native form / fieldset. */
  private accessor formDisabled;
  private accessor trackEl;
  private readonly internals;
  /** The value last emitted in the running interaction; the comparison baseline within it. */
  private emitted;
  private interactionChanged;
  /** Value distance from the pointer to a grabbed thumb, so a drag starts from where it was. */
  private grabOffset;
  /** The value `<ds-form>` collects: the decimal string, or two strings for a range. */
  get currentValue(): string | string[] | null;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  /** The field's own message, by validation order: error, required, invalid. */
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /**
   * One thumb: the slider element itself, named by the label (single) or by the
   * minimum/maximum copy (range), and bounded by the other thumb in a range.
   */
  private renderThumb;
  /**
   * The value bubble above a thumb under `show-value="hover"`. It stays
   * rendered while inactive so `transition` can fade it, and is always
   * aria-hidden: the thumb's `aria-valuetext` announces the same value.
   */
  private renderBubble;
  private get isDisabled();
  private get minValue();
  private get maxValue();
  private get stepSize();
  /** Mark values, clamped into the bounds and in ascending order. */
  private get markValues();
  /** The displayed value: `value` when controlled, the uncontrolled value otherwise, always normalized. */
  private get resolvedValue();
  /** The value the slider falls back to, which `required` compares against. */
  private get pristineValue();
  /** The value text beside the label: one formatted number, or the range copy. */
  private get valueLabel();
  private format;
  private clamp;
  private percent;
  /**
   * Clamp into the bounds, order a pair, and fill in the fallback for an absent
   * value. Named `normalizeValue` because `normalize` is an HTMLElement member.
   */
  private normalizeValue;
  /** Snap a raw value to the marks (with `snapToMarks`) or to the step grid. */
  private snap;
  /** The first mark past `from` in `direction`; the bound itself past the last one. */
  private markPast;
  /** The live value of one thumb: the last emitted one inside an interaction, the displayed one otherwise. */
  private thumbValue;
  /** Move one thumb, keeping a range ordered: neither thumb may cross the other. */
  private setThumb;
  /**
   * Reports a changed value against the last one emitted in this interaction:
   * an uncontrolled slider shows it at once, a controlled one once `value` is
   * rebound.
   */
  private emit;
  /** Pointer up, key up: `change-end` fires once, and only for an interaction that moved the value. */
  private endInteraction;
  private handleKeydown;
  private handleKeyup;
  private handleThumbFocus;
  private handleThumbBlur;
  /** The thumb the press belongs to: the nearest one, the low thumb on a tie. */
  private nearestThumb;
  /** Pointer position → an unsnapped value; logical, so right-to-left mirrors. */
  private rawFromPointer;
  /**
   * A press on the track area moves the nearest thumb to the press. A press
   * inside a thumb's own hit area grabs that thumb instead and drags it from its
   * current value (so a click on the thumb changes nothing); when both range
   * thumbs share a value, a press before it takes the low thumb, after it the
   * high thumb, and exactly on it the low thumb.
   */
  private handlePointerDown;
  private handlePointerMove;
  private handlePointerUp;
  private thumbAt;
  /** Validity order: `error`, then a required miss, then `invalid`. */
  private get message();
  /** `copy.required` is not rendered standalone: it appears once validation reports it. */
  private get displayedMessage();
  /** A required slider still sitting on its default has no value to submit. */
  private get valueMissing();
  private textOverrides;
  /**
   * A shape mismatch between `range` and `value`/`defaultValue` falls back
   * silently; `max <= min` is the one case the doc asks to warn about.
   */
  private warnInvalidRange;
  private applyOverrides;
  /** Mirror the value and validity into ElementInternals so an owning form sees them. */
  private syncInternals;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-slider": DsSlider;
  }
}
//#endregion
//#region src/NumberInput.d.ts
type NumberInputFormat = "decimal" | "currency" | "percent" | "unit";
type NumberInputSize = "sm" | "md";
/** Detail carried by the `change` CustomEvent. */
interface NumberInputChangeDetail {
  /** The new numeric value; `undefined` when the field is empty. */
  value: number | undefined;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`, `affixColor`,
 * `descriptionText`, `errorText`, `minTarget`, `minTargetSm` and
 * `focusRingWidth` are locked and excluded.
 */
type NumberInputOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "stepperGap" | "stepperDivider" | "stepperDividerWidth" | "partGap" | "labelWeight" | "helperSize" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity";
export declare class DsNumberInput extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label (visually hidden with `hideLabel`); the accessible name. */
  accessor label;
  /** Field name for the Form. The collected value is the number, or nothing when empty. */
  accessor name;
  /** Controlled numeric value. `null` is a controlled empty field; `undefined` leaves the field uncontrolled. */
  accessor value: number | null | undefined;
  /** Initial value. */
  accessor defaultValue: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  accessor min: number | undefined;
  /** Upper bound. */
  accessor max: number | undefined;
  /** Increment for the buttons and arrow keys. Also the rounding granularity when `precision` is omitted. */
  accessor step;
  /** Decimal places to keep and display (a whole number). Defaults to the decimals in `step`. */
  accessor precision: number | undefined;
  /** Locale formatting of the displayed value via Intl.NumberFormat. The underlying value is always a plain number. */
  accessor format: NumberInputFormat;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  accessor currency: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as the suffix. */
  accessor unit: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. Ignored under `format: currency`. */
  accessor leadingText: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). */
  accessor trailingText: string | undefined;
  /** Hide the increment/decrement buttons. Arrow keys work regardless. */
  accessor hideSteppers;
  /** Example value shown while empty. */
  accessor placeholder: string | undefined;
  /** Helper text. */
  accessor description: string | undefined;
  /** Must have a value to submit. */
  accessor required;
  /** Visually hide the label (it remains the accessible name). */
  accessor hideLabel;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  accessor size: NumberInputSize;
  /** Not editable, not submitted, still readable. */
  accessor disabled;
  /** Marks the field invalid. */
  accessor invalid;
  private errorValue;
  /** Error message; implies invalid. */
  get error(): string | undefined;
  set error(value: string | undefined);
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  accessor overrides: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The uncontrolled value, seeded from `defaultValue` on first render. */
  private accessor internalValue;
  /** The text in the input: formatted after a commit or step, what the user typed while typing. */
  private accessor text;
  /** The typed text has no digits ("-", "."): copy.invalid. */
  private accessor textInvalid;
  /** The out-of-range message from the last blur-time clamp; cleared by the next edit. */
  private accessor rangeMessage;
  /** Which bound the last clamp hit, for the validity flag. */
  private rangeSide;
  /** Disabled by an owning native form / fieldset. */
  private accessor formDisabled;
  private accessor inputEl;
  private readonly internals;
  private seeded;
  /** Set while the text on screen is what the user typed, so the echo of that number does not reformat it. */
  private typing;
  private lastSynced;
  private warnedCurrency;
  private repeatTimer;
  private pointerStepped;
  /** The committed number: `value` when controlled, the uncontrolled value otherwise. */
  get valueAsNumber(): number | undefined;
  /** The value `<ds-form>` collects: the plain number as a string, or `null` when empty. */
  get currentValue(): string | null;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  /** The field's own message, by validation order: error, required, invalid, range. */
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private get isDisabled();
  private get digits();
  private get stepSize();
  private get unitKnown();
  /** currency draws its own symbol, so leadingText would show two. */
  private get resolvedLeading();
  /** An unknown unit falls back to decimal formatting and shows the literal as trailingText. */
  private get resolvedTrailing();
  private get atMin();
  private get atMax();
  private display;
  /**
   * Reformat whenever the committed value or its formatting changes, except where the typed text wins:
   * the echo of the user's own typing, a controlled change to `null` mid-typing (kept until blur/Enter),
   * and committed non-numeric text, which stays as typed until the next edit.
   */
  private syncText;
  /** The message by the doc's precedence: error, required, invalid, then a reported clamp. */
  private get message();
  /**
   * The error text drawn, as Input: `error`; else, while invalid, copy.required for an empty required
   * field or copy.invalid for committed text with no number; plus a reported clamp. `invalid` over a
   * valid number draws nothing (aria-invalid and the border carry it), and an empty required field is
   * not flagged until something marks it invalid.
   */
  private get displayedMessage();
  private rangeCopy;
  private clamp;
  /** Reports a changed value: uncontrolled fields show it at once, controlled ones once `value` is rebound. */
  private report;
  private stepBy;
  private setTo;
  /** Blur and Enter: round to precision, clamp, reformat, and report a clamp rather than hide it. */
  private commit;
  private handleInput;
  private handleKeydown;
  private handleBlur;
  private readonly stopInnerPress;
  /** A stepper press leaves focus where it is (the input, or nowhere), so it never triggers a blur commit. */
  private readonly keepFocus;
  private readonly stopRepeat;
  /** A press that ends without a click (the pointer left the button) must not swallow the next one. */
  private readonly endPointerStep;
  /** Hold-to-repeat timings read from the resolved theme at pointerdown; `undefined` steps once. */
  private repeatTimings;
  private handleStepperPointerDown;
  private handleStepperClick;
  /** helperSize, fontFamily and lineHeight forwarded to the description and error Text. */
  private get textOverrides();
  private applyOverrides;
  /** Mirror value and validity into ElementInternals so an owning form sees them. */
  private syncInternals;
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
type ProgressBarOverridableBinding = "track" | "trackHeight" | "radius" | "labelSize" | "labelWeight" | "valueSize" | "fontFamily" | "lineHeight" | "partGap" | "labelGap" | "transition" | "indeterminateLoop" | "indeterminateReducedOpacity" | "sweepEasing";
type ProgressBarOverrides = Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>;
export declare class DsProgressBar extends LitElement {
  static override styles: CSSResult;
  /**
   * What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`, and
   * always the accessible name, mirrored to `aria-label` on the host. An empty label removes
   * `aria-label` and leaves the bar unnamed, with no development warning.
   */
  accessor label: string;
  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the
   * end is unknown). Clamped to `min`…`max` for the fill, the accessible value, `formatValue`'s
   * argument and the announcement tiers; a non-finite number (NaN, Infinity) is treated as `min`.
   */
  accessor value: number | null | undefined;
  /** Start of the range. A non-finite number is treated as the default, 0. */
  accessor min: number;
  /** End of the range. A non-finite number is treated as the default, 100. */
  accessor max: number;
  /**
   * Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range —
   * `(value − min) / (max − min)`, the same arithmetic the fill uses, so a non-zero `min` reads
   * correctly without a custom formatter — rounded to a whole number in the runtime's default locale
   * (there is no locale prop), so 99.5% of the way shows "100%" before completion; completion is only
   * the clamped value reaching `max`. Called with the clamped value. Rounding is for the text only;
   * the fill uses the exact fraction. A `max` at or below `min` is not a range: the bar renders empty,
   * exposes `min` as its value with the given bounds, shows and exposes "0%" (the formatter is not
   * called), makes no progress or completion announcements, and warns in development once per pair.
   */
  accessor formatValue: ((value: number, min: number, max: number) => string) | undefined;
  /**
   * Show the value text at the end of the label row. Ignored when indeterminate. A boolean attribute
   * can only turn things on, so the attribute is the negated `hide-value` (reflected).
   */
  accessor showValue: boolean;
  /**
   * Visually hide the label (it remains the accessible name), for bars inside a Card whose heading
   * already says what is happening. The value text, when shown, stays at the inline end of the row;
   * with no visible value text either the row takes no space, but the header element stays so the
   * `label` part still has a home.
   */
  accessor hideLabel: boolean;
  /**
   * Neutral while running; `success` at completion, `danger` when the task failed part-way. Recolors
   * the fill only — the colour is never the only signal, so pair it with a text status elsewhere.
   */
  accessor tone: ProgressBarTone;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  accessor announce: ProgressBarAnnounce;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  accessor overrides: ProgressBarOverrides | undefined;
  /** Text currently in the live region. */
  private accessor liveMessage;
  /** Bumped per announcement so the message node is replaced, and a repeated text is read again. */
  private accessor liveSeq;
  private record;
  /** An announcement made before the first render, spoken once the live region has rendered empty. */
  private pendingMessage;
  private frame;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  /** Whether `value` is omitted (the end of the task is unknown). */
  get isIndeterminate(): boolean;
  /** The exposed range: a non-finite bound falls back to the prop's default, and `max ≤ min` is not a range. */
  private get bounds();
  /** `value` clamped to `min`…`max`: the accessible value. Indeterminate, non-finite or not a range resolve to `min`. */
  get clampedValue(): number;
  /** The filled fraction, `(value − min) / (max − min)`. Exact: the rounding is for the text only. */
  get fraction(): number;
  /** The value text — the same string as `aria-valuetext` and as `{value}` in an announcement. */
  get displayText(): string;
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  /**
   * `role` and the `aria-*` values as plain host attributes, written only when they change — an
   * unconditional write would queue a mutation record for anything observing the host.
   */
  private syncHostAria;
  private setOrRemove;
  /**
   * The announcement rules. Tiers are `floor(fraction × 4)` (74.6% is tier 2, 75% is tier 3; tier 4
   * is `max`) and recorded for every `announce` value, so switching it mid-task never replays them.
   * The state reached at mount — and the one reached when an invalid range becomes valid — is
   * recorded silently; entering the indeterminate state resets the record and is announced once.
   * `milestones` announces the highest newly entered tier 1–3 with `copy.progress`; reaching `max`
   * announces `copy.complete`, never `copy.progress` with "100%". A lower tier resets the record, so
   * a retried task announces its progress again on the way up.
   */
  private updateAnnouncements;
  /** `{value}` is the formatted value text — the same string as `aria-valuetext` — never the raw number. */
  private say;
  private emit;
  /** Developer-facing, never shown to users, and warned once per distinct invalid pair. */
  private warnInvalidRange;
  private applyOverrides;
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
/** One step of the flow (`steps` shape). */
interface StepperStep {
  id: string;
  label: string;
  description?: string | undefined;
  status?: "complete" | "current" | "upcoming" | "error" | undefined;
}
/** Detail carried by the `step-select` CustomEvent. */
interface StepperStepSelectDetail {
  /** The id of the chosen step. */
  id: string;
}
/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
type StepperOverridableBinding = "indicatorSize" | "indicatorBackground" | "indicatorRadius" | "indicatorFontSize" | "indicatorFontWeight" | "connector" | "labelWeight" | "labelCurrentWeight" | "labelSize" | "descriptionSize" | "countSize" | "stepHover" | "stepRadius" | "stepPadding" | "stepGap" | "partGap" | "fontFamily" | "transition";
export declare class DsStepper extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`, which an empty string also falls back to. */
  accessor label: string | undefined;
  /**
   * The steps in order. `status` is derived from `current` when omitted: before it complete, the step it
   * names current, after it upcoming. An explicit `status` sets only the indicator, its colours and the
   * status word; position (not status) decides the selected state, navigability, the connector colour and
   * the compact reveal.
   */
  accessor steps: StepperStep[];
  /**
   * The id of the current step. The step whose id matches is the selected one (`aria-current="step"`) and
   * the one compact reveals, whatever its `status`. When no id matches, nothing is selected, every step
   * without an explicit status is upcoming, no step is navigable under `completed` (all still are under
   * `all`), the count reads "Step 1 of m", and development builds log a warning. The warning needs a
   * non-empty `current`: an empty one (this property's initial `''`) is treated as not yet set.
   */
  accessor current;
  /**
   * Vertical shows descriptions under each label and suits a side column; horizontal does not render
   * descriptions at all (not clipped, and no aria-describedby) and collapses to `compact` below the
   * prose width.
   */
  accessor orientation: StepperOrientation;
  /**
   * Which steps can be activated: none (display only), completed (any step before the current one by
   * position, including one marked `error`), or all.
   */
  accessor navigable: StepperNavigable;
  /**
   * Show only the current step's label and "Step n of m"; the indicators stay. Horizontal only, set by
   * hand or automatically below the prose width. The other steps' labels, with their status words, are
   * visually clipped, not removed.
   */
  accessor compact;
  /** Per-instance style overrides: each entry sets the matching hook, or the composed Text's or Icon's own override, to that token. */
  accessor overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  override connectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderStep;
  private select;
  /** The check and danger Icons match the numeral: `indicatorFontSize` is their size override. */
  private iconOverrides;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-stepper": DsStepper;
  }
}
//#endregion
//#region src/Search.d.ts
type SearchSize = "md" | "lg";
/** One entry of `suggestions` (anatomy: suggestions). */
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
 * `foreground`, `placeholder`, `iconColor`, `border`, `borderFocus`,
 * `minTarget` and `focusRingWidth` are locked and excluded.
 */
type SearchOverridableBinding = "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "affixGap" | "fontFamily" | "fontSize" | "lineHeight" | "suggestionsOffset" | "popupSurface" | "popupBorder" | "popupBorderWidth" | "popupRadius" | "popupShadow" | "layer" | "partGap" | "labelWeight" | "disabledOpacity";
export declare class DsSearch extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** The accessible name ("Search products"). Visually hidden unless `showLabel`. */
  accessor label;
  /** Show the label above the field, as on a search page rather than in a header. */
  accessor showLabel;
  /** Field name; the query key when the form submits to a URL. */
  accessor name;
  /** Controlled query. Omit for uncontrolled. */
  accessor value: string | undefined;
  /** Initial query for an uncontrolled field. */
  accessor defaultValue: string | undefined;
  /** Example query, not a label. */
  accessor placeholder: string | undefined;
  /**
   * URL to submit to with GET; when omitted, `submit` handles it and nothing
   * navigates. Ignored, with a development warning, inside `<ds-form>`.
   */
  accessor action: string | undefined;
  /**
   * Suggestions for the current query. Setting the property at all (an empty
   * array included) turns the field into a combobox; undefined keeps a plain
   * search field. A property, not an attribute.
   */
  accessor suggestions: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  accessor loading;
  /** Give the form the `search` landmark role. Exposed as the negated attribute `no-landmark`. */
  accessor landmark;
  /** `lg` for a search page's hero field. */
  accessor size: SearchSize;
  /** Not editable, still readable and focusable; inert, fires nothing, and not submitted by a Form. */
  accessor disabled;
  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled query, seeded from `defaultValue`. */
  private accessor internalValue;
  /** Whether the suggestions popup is open. */
  private accessor open;
  /** The highlighted suggestion's value, or null for none (focus is always the input). */
  private accessor activeValue;
  /** The status region's text, updated `statusDebounce` after the wanted text settles. */
  private accessor announcedStatus;
  private accessor inputEl;
  private accessor fieldEl;
  private accessor popupEl;
  private accessor listboxEl;
  /** A shadow-DOM form never navigates the page, so `action` submits this light-DOM one. */
  private navigationForm;
  private readonly internals;
  private shown;
  private warnedLabel;
  private warnedAction;
  private pendingStatus;
  private statusTimer;
  constructor();
  /** The value `<ds-form>` collects: the trimmed query ("" when empty, never omitted). */
  get currentValue(): string;
  /** Search has no required state; present for the `DsFormField` contract. */
  get required(): boolean;
  /** Search never fails validation; present for the `DsFormField` contract. */
  get validationMessage(): string;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  /** The query as shown, controlled or not. */
  private get query();
  private get isCombobox();
  /**
   * Inside `<ds-form>` the enclosing Form owns submission. The walk crosses
   * shadow boundaries through `getRootNode().host`, since a Search composed
   * into another element's shadow root is still inside the light-DOM Form that
   * element sits in, and `closest()` alone stops at the shadow boundary.
   */
  private get insideForm();
  /** What the Listbox shows: nothing while loading, so its empty row carries `copy.loading`. */
  private get listOptions();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  override focus(options?: FocusOptions): void;
  /** Always valid: Search has no required or invalid state. */
  checkValidity(): boolean;
  reportValidity(): boolean;
  formResetCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private readonly handleInput;
  private readonly handleKeydown;
  private readonly handleFormSubmit;
  private readonly handleSubmitPress;
  private readonly handleClearPress;
  private readonly handleListboxChange;
  /** A press on a suggestion keeps focus in the input: focus moves by one route only (clear). */
  private readonly handlePopupMouseDown;
  private readonly stopInternalEvent;
  /** Focus leaving the element (Tab, blur to another control) closes the list. */
  private readonly handleFocusOut;
  private readonly handleOutsidePointerDown;
  private readonly handleReposition;
  private activeItem;
  private emitChange;
  /** Fills the query with the suggestion's label, what the user just read, reports it, and submits it. */
  private chooseSuggestion;
  /** Empties the field: `change("")`, then `clear`. */
  private clearQuery;
  /** Dispatches `submit` with the trimmed query and, with `action` outside `<ds-form>`, submits the light-DOM GET form. Never an empty query. */
  private submitQuery;
  private submitNavigationForm;
  /**
   * Loading whenever `suggestions` is set and `loading` is true, list open or
   * not (a fetch the user triggered is worth hearing about); no suggestions or
   * the plural count only while the list is open.
   */
  private statusText;
  /** The `lang` of the nearest ancestor that sets one, crossing shadow roots. */
  private nearestLang;
  /** Writes the status region `statusDebounce` after the wanted text last changed; clears it at once. */
  private scheduleStatus;
  private showPopup;
  private hidePopup;
  private removeGlobalListeners;
  /** Anchors the popup under the field, flipping above it when it would overflow the viewport. */
  private updatePosition;
  /** Sets each overridden hook; popup bindings apply only while the popup exists. */
  private applyOverrides;
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
  value: string | {
    start: string;
    end: string;
  } | undefined;
}
/** Detail carried by the `open-change` CustomEvent. */
interface DatePickerOpenChangeDetail {
  open: boolean;
}
/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`,
 * `rangeSeparatorColor`, `calendarSurface`, `daySize`,
 * `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`,
 * `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`,
 * `weekdayColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`,
 * `focusRing` and `focusRingWidth` are locked and excluded.
 */
type DatePickerOverridableBinding = "borderInvalid" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "fontSize" | "calendarInset" | "calendarGap" | "headerGap" | "footerGap" | "dayGap" | "dayRadius" | "dayHover" | "weekdaySize" | "weekdayWeight" | "weekNumberSize" | "weekNumberWeight" | "monthTitleSize" | "monthTitleWeight" | "partGap" | "fieldGap" | "dayFontSize" | "fontFamily" | "lineHeight" | "labelWeight" | "helperSize" | "disabledOpacity" | "transition";
export declare class DsDatePicker extends LitElement {
  static formAssociated: boolean;
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** Visible label ("Start date", "Date of birth"). */
  accessor label: string;
  /**
   * Field name for the Form. The value is an ISO date string, or (`range`)
   * `{ start, end }` of them; a range registers `name` (start) and `name-end` (end).
   */
  accessor name: string;
  /** Controlled value (ISO date, or a range). `''` is a controlled empty field; `undefined` means uncontrolled. */
  accessor value: DatePickerValue | undefined;
  /** Initial value. */
  accessor defaultValue: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and tests.
   * Omit for the button-driven default. A property only, not a reflected
   * attribute: bind `.open`; setting it to `false` keeps it controlled.
   */
  accessor open: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  accessor range;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  accessor min: string | undefined;
  /** Latest selectable date (ISO). */
  accessor max: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by the Arrow keys. */
  accessor isDateDisabled: ((isoDate: string) => boolean) | undefined;
  /** BCP 47 locale for month and weekday names, the first day of the week, and the typed format. Defaults to `<html lang>`, then the runtime locale. */
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
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  accessor size: DatePickerSize;
  /** Not editable, still readable. */
  accessor disabled;
  /** Error message; implies invalid. */
  accessor error: string | undefined;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The committed start (or single) date. */
  private accessor internalStart;
  /** The committed range end. Unused outside `range`. */
  private accessor internalEnd;
  /** A range's pending first pick: shown only in the calendar, discarded on close. */
  private accessor draftStart;
  /** Raw text of the start (or single) input. */
  private accessor textStart;
  /** Raw text of the end input (`range`). */
  private accessor textEnd;
  /** Uncontrolled open state, used when `open` is omitted. */
  private accessor internalOpen;
  /** The visible month (0-based) and year. */
  private accessor viewYear;
  private accessor viewMonth;
  /** The roving-tabindex day. Cleared on close so the next open recomputes it. */
  private accessor focusedDate;
  /** Disabled by an owning native form or fieldset. */
  private accessor formDisabled;
  private accessor startInputEl;
  private accessor endInputEl;
  private accessor popoverEl;
  /** The open state the last `willUpdate` saw, so every change aims and focuses the calendar once. */
  private openSeen;
  private focusOnOpen;
  /** The last value a `change` reported (or the seed), so typing the same date never re-dispatches. */
  private lastEmittedValue;
  private readonly internals;
  private readonly endField;
  constructor();
  /** The committed value for `<ds-form>`: the ISO date, or with `range` the start date once both ends are set; `null` when empty. */
  get currentValue(): string | null;
  /** The owning native form, if any. */
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  /** The field's own message by the doc's precedence (combined for a range); empty when valid. */
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(restored: File | string | FormData | null): void;
  override connectedCallback(): void;
  private get isDisabled();
  private get isOpen();
  /** `locale`, else `<html lang>`, else the runtime default (`undefined`). */
  private get resolvedLocale();
  private get committedValue();
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderInput;
  private renderCalendar;
  private renderDay;
  /** The roving stop before any day has had focus: the selected day, else today, else the visible month's first day. */
  private get defaultFocusDate();
  private monthOptions;
  /**
   * The `min`/`max` years when given, else the current year − 100 to + 10, each on its own; always
   * includes the visible year. An unparseable bound is ignored here.
   */
  private get yearOptions();
  private seedFromValue;
  /**
   * Writes the formatted committed value into the inputs. An input that has focus keeps its typed
   * text unless `force` (a pick or Clear, which show the value at once).
   */
  private showCommittedText;
  /**
   * On blur the input shows the formatted committed value, so a controlled owner that did not
   * follow `change` sees the text revert. Unparseable text stays, so the field can report
   * `copy.invalid` for it.
   */
  private handleInputBlur;
  private isDayDisabled;
  /**
   * Applies a new start/end and reports it when it is a complete value (a
   * date, both ends of a range, or empty). `force` reports even an unchanged
   * value (every pick, every Clear). Controlled: the element returns to
   * `value` after reporting, and shows the change once the property follows.
   */
  private commit;
  private selectDay;
  private handleTextInput;
  /** Uncontrolled: applies the change, then reports it. Controlled: reports it only. */
  private requestOpen;
  /**
   * Focus returns on the state change, not on the request: when `open` actually turns false the
   * composed popover moves focus to the calendar button if it was inside the calendar, and leaves
   * it where it is (an input, the button itself) otherwise. A controlled owner that ignores
   * `open-change` keeps the calendar open and focus inside it.
   */
  private closeCalendar;
  private focusDayAfterOpen;
  private readonly handlePopoverOpenChange;
  private readonly stopPress;
  /**
   * Escape closes the calendar wherever the focus is. `ds-popover` only hears
   * the key when focus is inside its panel (and returns focus to the calendar
   * button); from the field itself (an input, or the calendar button, which is
   * the trigger and so outside the panel) the keydown reaches this root
   * instead, and focus stays where it is. The popover stops propagation on the
   * Escape it handles, so exactly one of the two runs.
   */
  private readonly handleRootKeydown;
  private handleInputKeydown;
  private dayButton;
  private moveViewTo;
  private moveFocusTo;
  /**
   * Steps `delta` days at a time from `iso`, skipping disabled days and turning
   * pages as needed; stays put when no enabled day is left before `min`/`max`
   * (or, unbounded, within ten years).
   */
  private stepEnabled;
  private readonly handleGridKeydown;
  /**
   * Tab cycles within the calendar: previous month, month Select, year Select,
   * next month, the grid's one stop, Today, Clear, and back. Tab inside a
   * Select belongs to the Select.
   */
  private readonly handleCalendarKeydown;
  private readonly handlePrevMonthPress;
  private readonly handleNextMonthPress;
  /** A month change keeps the focused day number, clamped into the new month. */
  private shiftView;
  private readonly handleMonthChange;
  private readonly handleYearChange;
  /** Exactly like picking today's cell. */
  private readonly handleTodayPress;
  /** Empties the value (both ends), fires `change` with `undefined` even when already empty, and leaves the calendar open. */
  private readonly handleClearPress;
  /** Keeps the `name-end` Form entry present exactly while `range` is on. Moves only when out of place. */
  private syncEndField;
  /**
   * Mirrors value and validity into ElementInternals. Precedence: `error`;
   * required (every input empty); invalid (a non-empty input does not parse);
   * required (a range with one end empty); tooEarly; tooLate; rangeOrder.
   */
  private syncInternals;
  private applyOverrides;
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
type ToolbarOverridableBinding = "border" | "borderWidth" | "radius" | "paddingInline" | "paddingBlock" | "itemGap" | "groupGap" | "separatorLength" | "fadeWidth";
export declare class DsToolbarGroup extends LitElement {
  static override styles: CSSResult;
  /** The group's accessible name ("Text style", "Alignment"); also the Menu group heading when it collapses. */
  accessor label: string | undefined;
  override connectedCallback(): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
}
export declare class DsToolbar extends LitElement {
  static override styles: CSSResult;
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; the toolbar's accessible name. */
  accessor label: string;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  accessor orientation: ToolbarOrientation;
  /** What happens when controls do not fit: wrap onto more rows, collapse trailing Buttons into a "More" Menu, or scroll with faded edges. */
  accessor overflow: ToolbarOverflow;
  /** Default `size` for child Buttons, SegmentedControls, Selects and Searches that do not set their own. */
  accessor size: ToolbarSize;
  /** Gap between controls: tight or normal rhythm. */
  accessor density: ToolbarDensity;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
  /** One slot per top-level entry, in order, with the separators between adjacent groups. */
  private accessor entrySlots;
  /** The overflow Menu's items, built from the collapsed controls. */
  private accessor overflowItems;
  private accessor containerEl;
  private accessor overflowMenuEl;
  private accessor probeEl;
  /** The control carrying tabindex 0: the last one focused, initially the first. */
  private focusedControl;
  /** Overflow item id → the original control it clicks. */
  private overflowTargets;
  /** Overflow item ids already warned about for a missing `overflow-label`: a control is identified by its place
	in the toolbar (its entry, and its index inside a group) for the life of this toolbar. */
  private readonly warnedOverflowLabel;
  private recalcFrame;
  private resizeObserver;
  /** Watches the whole light-DOM subtree: a control added inside an existing group is assigned to the group's slot, so
	the toolbar's own `slotchange` would not see it. `childList` only, and every write below is an attribute write,
	so the callback can never re-enter itself. */
  private readonly mutationObserver;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override firstUpdated(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  /** `menu` is for horizontal toolbars; a vertical one treats it as `scroll`. */
  private usesMenu;
  private isGroup;
  /** Top-level entries in order. Every element child is one entry, so every one of them gets a slot. */
  private entries;
  /**
   * The focusable control an element stands for: itself when it is a design-system element or natively focusable,
   * otherwise the first such descendant — an arbitrary wrapper, and a group nested inside a group, make what they
   * hold one bare control.
   */
  private controlOf;
  /** The direct children of one entry, exactly one level deep: a group's element children, or the entry itself. */
  private membersOf;
  /** The controls of one entry: each member, or a wrapper member's first focusable descendant. */
  private controlsOf;
  /** Every control, in order, one level into groups; a control's own internals are never descended into. */
  private controls;
  private isDisabled;
  private isShown;
  /** What the roving tabindex may land on: shown, enabled controls, then the More trigger when it is showing. */
  private focusable;
  /** Focusable without a `tabindex` of its own: a native control, or a design-system element that delegates focus. */
  private isNaturallyFocusable;
  /**
   * The one control in the tab sequence carries *no* `tabindex`, the rest carry `-1`.
   * `tabindex="0"` on the host of a composed control would be a second tab stop beside the inner control it
   * forwards its host `tabindex` to (`<ds-button tabindex="0">` renders `<button tabindex="0">`); removing the
   * attribute instead leaves exactly the inner control tabbable. Only an element with no focusability of its
   * own — a consumer's `<div tabindex>` — needs the explicit `0`.
   */
  private setTabStop;
  private syncRovingTabindex;
  private readonly handleFocusIn;
  /** A text input, textarea or editable region, which keeps ArrowLeft, ArrowRight, Home and End for its caret. */
  private isTextEntry;
  private readonly handleKeydown;
  private handleChildrenChanged;
  /**
   * Assigns every entry to its own slot and works out where a separator goes: between two adjacent shown groups.
   * The `slot` attribute is the only thing written to the consumer's markup, and it is written only when it differs,
   * so a pass over settled children is a no-op and the childList observer never sees it.
   */
  private syncEntrySlots;
  /** A Button, SegmentedControl, Select or Search without a `size` attribute when first discovered takes the toolbar's;
	its own `size` wins, and a size the control has no value for leaves it at its own default. */
  private applyDefaultSizes;
  /** Measurement runs a frame later, after child controls have rendered their new size or density. */
  private scheduleRecalc;
  /** An entry collapses only if every member of it is a Button: a wrapper (or nested group) never collapses. */
  private isCollapsible;
  private recalcOverflow;
  /** Which trailing collapsible entries must go so the rest, plus a `size.target.min` More trigger, fit the host.
	Walking from the end, an entry holding any control other than a Button is skipped and stays visible. */
  private measureCollapse;
  private buildOverflowItems;
  private readonly handleOverflowAction;
  /**
   * Marks which physical edge (left/right, top/bottom when vertical) has content hidden past it, by comparing the
   * entries' extent with the row's box — no scroll-offset sign convention, so RTL takes the same path.
   * Re-checked on scroll and after every size or children change.
   */
  private readonly syncFades;
  private applyOverrides;
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
/** Overridable style hooks; see the `overrides` property. Locked bindings (`controlBackground`, `dot`, `dotActive`, `dotTarget`, `tabColor`, `tabSelectedColor`, `tabIndicatorThickness`, `minTarget`, `focusRing`, `focusRingWidth`) are excluded. */
type CarouselOverridableBinding = "slideGap" | "controlOffset" | "controlRadius" | "controlShadow" | "pickerGap" | "pickerOffset" | "dotSize" | "dotRadius" | "radius" | "tabFontSize" | "tabFontWeight" | "tabLineHeight" | "tabPaddingBlock" | "tabPaddingInline" | "fontFamily" | "transition";
export declare class DsCarouselSlide extends LitElement {
  static override styles: CSSResult;
  /**
   * The slide's name in the tabs picker. A plain string, never read from the slide's content. Reflected so the
   * carousel, which observes its slides' `label` attribute, sees a property write too.
   */
  accessor label: string | undefined;
  override connectedCallback(): void;
  protected override render(): TemplateResult;
}
export declare class DsCarousel extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the carousel shows ("Featured products"): the region's accessible name. */
  accessor label;
  /** Slides visible at once at the widest layout; one while the viewport is at or below `layout.maxWidth.prose`. */
  accessor perView;
  /** Next from the last slide returns to the first. */
  accessor loop;
  /** Rotate every `interval`; never under reduced motion. */
  accessor autoplay;
  /** Milliseconds between automatic advances; values below `minInterval` are raised to it. */
  accessor interval;
  /** How slides are chosen directly. */
  accessor picker: CarouselPicker;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  accessor activeIndex: number | undefined;
  /** Swiping or scrolling snaps to slide boundaries; `false` is the `no-snap` attribute. */
  accessor snap;
  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalIndex;
  /** False until the viewport is first measured; `perView` applies until then. */
  private accessor measured;
  private accessor viewportWide;
  private accessor focusedPickerIndex;
  private accessor slideCount;
  private accessor hovering;
  private accessor focusWithin;
  private accessor touching;
  /** Set by the pause button and by autoplay reaching the last slide without `loop`; cleared only by play. */
  private accessor stopped;
  private accessor reducedMotion;
  private accessor announceText;
  private accessor viewportEl;
  private intersectionObserver;
  private resizeObserver;
  /** Watches each slide's `label` attribute, so renaming a slide updates the tabs picker. */
  private labelObserver;
  private reducedMotionQuery;
  private timer;
  private timerInterval;
  /** True after pointerdown, touchstart or wheel on the viewport: the next settled scroll is a swipe. */
  private userScroll;
  /** The first positioning is instant. */
  private positioned;
  /** A user-initiated change in controlled mode is announced once the new `activeIndex` arrives. */
  private announcePending;
  private warnedInterval;
  private readonly warnedSlides;
  /** The current slide index, controlled or not. */
  get currentIndex(): number;
  private get isControlled();
  private get perViewInt();
  /** The page size: `perView` above the prose width, 1 at or below it; `perView` until measured. */
  private get page();
  /** The furthest index a page can start at. */
  private get lastStart();
  /** Rotation is wanted: autoplay on, motion allowed, not stopped. */
  private get rotationOn();
  /** Rotating right now: wanted and not paused by hover, focus or touch. */
  private get rotating();
  private get prevTarget();
  private get nextTarget();
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  private renderPicker;
  private readonly handlePlayPause;
  private readonly handlePrev;
  private readonly handleNext;
  /** A click on a wrapper outside its Button passes through to the Button's action. */
  private readonly handlePrevWrapperClick;
  private readonly handleNextWrapperClick;
  private readonly handlePlayWrapperClick;
  private readonly handlePickerKeydown;
  private selectFromPicker;
  private readonly handlePointerEnter;
  private readonly handlePointerLeave;
  private readonly handleFocusIn;
  private readonly handleFocusOut;
  private readonly handleTouchStart;
  private readonly handleTouchEnd;
  private readonly handleReducedMotionChange;
  private readonly handleSlotChange;
  private readonly armUserScroll;
  /** A scroll the user started has settled: the first visible slide is the new index. Never on a timer. */
  private readonly settleSwipe;
  private readonly handleIntersect;
  private readonly handleResize;
  private readonly handleLabelMutation;
  /** layout.maxWidth.prose from its built custom property on the viewport, px or rem; null when unreadable. */
  private proseBreakpoint;
  private firstVisibleIndex;
  private clamp;
  /** A target past the last page start becomes the last page start. */
  private clampToPage;
  /**
   * Requests slide `index`: dispatches `change`; uncontrolled, it also moves and (for a user change) announces.
   * Controlled, the element waits for `activeIndex` to change before it shows or announces anything, and a swipe the
   * parent does not accept scrolls back.
   */
  private moveTo;
  private announce;
  /** Scrolls the viewport itself (never scrollIntoView, which would also scroll the page); RTL-aware. */
  private scrollToIndex;
  private slideElements;
  /** Stamps each slide's role, roledescription, positional name and part. Every write compares first. */
  private syncSlides;
  /** Before the observer exists, the current page is the visible one. */
  private syncInert;
  private observe;
  private observeSlides;
  private observeLabels;
  private get effectiveInterval();
  private syncAutoplay;
  private clearTimer;
  private readonly tick;
  private warnMissingSlideLabel;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-carousel": DsCarousel;
    "ds-carousel-slide": DsCarouselSlide;
  }
}
//#endregion
//#region src/Table.d.ts
/** A single record. `id` must be stable; it is what selection and keys use. */
interface TableRow {
  id: string;
  [key: string]: unknown;
}
type TableColumnAlign = "start" | "end" | "center";
type TableColumnWidth = "auto" | "min" | "fill";
type TableColumnHideBelow = "prose" | "content";
/** A column definition, in display order. Exactly one column may set `isRowHeader`. */
interface TableColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: TableColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: TableColumnWidth | undefined;
  isRowHeader?: boolean | undefined;
  hideBelow?: TableColumnHideBelow | undefined;
  /** Formats the cell as a lit template (a `ds-text`, `ds-link`, `ds-meter` or `ds-button`), never raw HTML. */
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
/** Detail of the `sort-change` event. */
interface TableSortChangeDetail {
  column: string;
  direction: TableSortDirection;
}
/** Detail of the `selection-change` event. */
interface TableSelectionChangeDetail {
  selected: string[];
}
/** Detail of the `row-press` event. */
interface TableRowPressDetail {
  id: string;
}
/** Overridable bindings; the locked ones (surface, header surface/color, stripe, selection, cell colors, stacked
label color, target size, focus ring) are excluded. */
type TableOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "rowBorder" | "rowBorderWidth" | "rowHover" | "cellPaddingInline" | "cellPaddingBlock" | "cellGap" | "captionSize" | "captionWeight" | "captionGap" | "stackedRowInset" | "stackedRowGap" | "stackedBlockGap" | "stackedLabelSize" | "stackedLabelWeight" | "stackedRowRadius" | "stickyColumnShadow" | "scrollFade" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
export declare class DsTable extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the table lists ("Open invoices"): the caption and the accessible name. */
  accessor caption;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  accessor captionLevel: TableCaptionLevel;
  /** Visually hide the caption; it remains the accessible name. */
  accessor hideCaption;
  /** Column definitions in display order. */
  accessor columns: TableColumn[];
  /** The rows. `id` must be stable. */
  accessor data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  accessor sort: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  accessor defaultSort: TableSort | undefined;
  /** Adds a first column of Checkboxes, and a select-all in the header for `multiple`. */
  accessor selectable: TableSelectable;
  /** Controlled selected row ids. */
  accessor selected: string[] | undefined;
  /** Initially selected ids. */
  accessor defaultSelected: string[] | undefined;
  /** Below `layout.maxWidth.prose`: `stack` turns rows into labelled blocks; `scroll` scrolls the columns. */
  accessor responsive: TableResponsive;
  /** The header row stays visible while the body scrolls. Attribute: `no-sticky-header`. */
  accessor stickyHeader;
  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  accessor maxHeight: TableMaxHeight;
  /** Cell padding: `layout.inset.sm` or `layout.inset.md`. */
  accessor density: TableDensity;
  /** Alternate row backgrounds. */
  accessor striped;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** Data is being fetched: `copy.loading` shows and `aria-busy` is set; existing rows stay visible. */
  accessor loading;
  /** Renders a trailing actions cell (ghost sm icon-only Buttons with Tooltip, or a Menu). */
  accessor rowActions: ((row: TableRow) => unknown) | undefined;
  /**
   * Rows fire `row-press` (the row header becomes a Button and the row is styled interactive). Lit cannot see
   * whether anyone listens, so this is the element's stand-in for `onRowPress` being set.
   */
  accessor pressableRows;
  /** Per-instance token overrides. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalSort;
  private accessor internalSelected;
  private accessor announcement;
  private accessor hasFooter;
  private accessor sentinelEl;
  private accessor frameEl;
  private accessor scrollRegionEl;
  private headerObserver;
  private observedFor;
  private regionObserver;
  private observedRegion;
  private readonly warned;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderSelectionHeader;
  private renderColumnHeader;
  private renderRow;
  private cellClasses;
  private get rowHeaderColumn();
  private get currentSort();
  private get currentSelected();
  /** A controlled `sort` means the caller already sorted `data`. */
  private sortedRows;
  private handleSort;
  private handleSelectAll;
  private handleSelectRow;
  private selectRow;
  private commitSelection;
  private handleRowPress;
  /** Pointer convenience: a press on an interactive row outside its own controls activates it. */
  private handleRowClick;
  private dispatchRowPress;
  private handleRegionScroll;
  /** Marks which physical edges have columns hidden past them, for `scrollFade`. Writes only on a change. */
  private updateScrollEdges;
  private observeScrollRegion;
  /** Arrow keys scroll the focused region by `space.10`. */
  private handleRegionKeydown;
  private handleFooterSlotChange;
  /** `headerShadow` appears once the sentinel above the table has scrolled out past the top of its root. */
  private observeHeader;
  private applyOverrides;
  private warnOnce;
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
/** A column definition. Exactly one column may set `isRowHeader`. */
interface DataGridColumn {
  key: string;
  header: string;
  /** The spoken form of a short header ("Quantity" for "Qty"). */
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  /** Pixel width, a multiple of space.1; 160 when omitted. Grid columns do not auto-size. */
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  /** Pinned columns must be contiguous at the start or end of `columns`. */
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  /** Cell content: a lit `TemplateResult`, string or number. */
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
/** Heading level of the caption in the page outline; its size stays `captionSize` regardless. */
type DataGridCaptionLevel = "2" | "3" | "4";
interface DataGridCellRef {
  rowId: string;
  column: string;
}
interface DataGridRangeRef {
  from: DataGridCellRef;
  to: DataGridCellRef;
}
/** Row ids (`row`), one cell (`cell`) or a range (`range`), matching `selectable`. */
type DataGridSelection = string[] | DataGridCellRef | DataGridRangeRef;
/** A committed cell value; `undefined` when Delete/Backspace clears the cell. */
type DataGridCellValue = string | number | boolean | undefined;
/** Detail carried by the `sort-change` CustomEvent. */
interface DataGridSortChangeDetail {
  column: string;
  direction: DataGridSortDirection;
}
/** Detail carried by the `selection-change` CustomEvent. */
interface DataGridSelectionChangeDetail {
  selection: DataGridSelection;
}
/** Detail carried by the `cell-change` CustomEvent. The caller updates `data`; the grid shows the old value until then. */
interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: DataGridCellValue;
  previous: DataGridCellValue;
}
/** Detail carried by the cancelable `edit-start` CustomEvent: `preventDefault()` refuses the edit. */
interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}
/** Detail carried by the `range-needed` CustomEvent: inclusive row indexes to load. */
interface DataGridRangeNeededDetail {
  start: number;
  end: number;
}
/** Detail carried by the `column-resize` CustomEvent. */
interface DataGridColumnResizeDetail {
  column: string;
  width: number;
}
/**
 * Overridable style hooks; see the `overrides` property. Accessibility-bearing bindings (`surface`, `headerSurface`,
 * `headerColor`, `rowHeight`, `rowHeightComfortable`, `rowSelected*`, `cellColor`, `cellMutedColor`, `cellFocusRing*`,
 * `cellEditing*`, `cellInvalid*`, `range*`, `statusBarSurface`, `statusBarColor`, `minTarget`, `focusRing*`) are locked.
 */
type DataGridOverridableBinding = "headerWeight" | "headerSize" | "headerBorder" | "headerBorderWidth" | "headerShadow" | "gridLine" | "gridLineWidth" | "rowHover" | "cellPaddingInline" | "columnWidth" | "pinnedShadow" | "resizeHandle" | "resizeHandleWidth" | "resizeStep" | "statusBarSize" | "statusBarPadding" | "statusBarGap" | "captionSize" | "captionWeight" | "captionGap" | "fixedHeight" | "fontFamily" | "fontSize" | "lineHeight" | "numericFont" | "transition";
export declare class DsDataGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  accessor caption;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless, as Table. */
  accessor captionLevel: DataGridCaptionLevel;
  /** Visually hide the caption; it remains the accessible name. */
  accessor hideCaption;
  /** The column model. A property, not an attribute. */
  accessor columns: DataGridColumn[];
  /** The rows. `id` must be stable; only visible rows are rendered. A property, not an attribute. */
  accessor data: DataGridRow[];
  /** Total rows when `data` is a contiguous prefix of a larger set (server paging). Sets aria-rowcount. */
  accessor rowCount: number | undefined;
  /** Controlled sort state; the caller sorts `data`. */
  accessor sort: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  accessor defaultSort: DataGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the focused cell; `range` selects rectangles. */
  accessor selectable: DataGridSelectable;
  /** Controlled selected row ids (row mode). */
  accessor selected: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  accessor editable;
  /** Row height. */
  accessor density: DataGridDensity;
  /** The header stays visible while the body scrolls; always true when virtualized. Attribute: `no-sticky-header`. */
  accessor stickyHeader;
  /** `viewport`: 100vh − 2 × layout.gap.section; `content`: grows with rows, not virtualized; `fixed`: `overrides.fixedHeight`. */
  accessor height: DataGridHeight;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  accessor loading;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** The footer status line. Attribute: `no-status-bar`. */
  accessor showStatusBar;
  /** Per-instance style overrides: `{ fixedHeight: 'space.40' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalSort;
  private accessor internalSelected;
  /** The active cell: row -1 is the header row; col 0 is the selection column in row mode. */
  private accessor activeRow;
  private accessor activeCol;
  private accessor range;
  /** The range anchor survives Escape: with the range cleared, plain navigation keys only move it. */
  private accessor rangeAnchor;
  private accessor editing;
  /** A select editor's popup, which the grid opens with the editor. */
  private accessor selectOpen;
  private accessor columnWidths;
  private accessor message;
  private accessor bodyScrollTop;
  private accessor scrolledX;
  private accessor overflowX;
  private accessor viewportHeight;
  private accessor headerHeight;
  private accessor rowHeightPx;
  private accessor draggingColumn;
  private accessor scrollEl;
  private accessor gridEl;
  private accessor probeEl;
  private accessor probeStepEl;
  private sortCache;
  private rowAnchorId;
  private rangeDragging;
  private rangeDragMoved;
  private resizeDrag;
  private keyboardResize;
  private requestedEnds;
  private scrollActivePending;
  private resizeObserver;
  private readonly warned;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderHeader;
  private renderSelectAllCell;
  private renderColumnHeader;
  private renderEmpty;
  private renderRow;
  private renderSelectCell;
  private renderCell;
  private renderEditor;
  private renderRangeOverlay;
  /**
   * The visible counterpart of the live region. Only the leading span is `role="status"`, so the row count, the
   * selection count, `copy.scrollHint` and `copy.position` are shown but never announced — `aria-rowindex` and
   * `aria-colindex` already carry position, and a polite region on every arrow press would be noise.
   *
   * The items follow in this order and no other, with no separator characters between them. With `showStatusBar`
   * false the bar stays in the DOM, visually hidden, holding only the live span.
   */
  private renderStatusBar;
  private get hasSelectColumn();
  private get colOffset();
  private get colCount();
  private get currentSort();
  private get currentSelected();
  /** `data` in display order: sorted here only for an uncontrolled sort over a fully loaded set. */
  private get rows();
  private columnAt;
  /**
   * The column's width in pixels once it has one — an explicit `width` or one the user has resized — floored at
   * its `minWidth`; undefined while it sits at the columnWidth token, whose pixel value is not known at render.
   */
  private pixelWidthOf;
  /** The column's rendered width in pixels: its pixel width, else its header cell measured. */
  private widthOf;
  /** The floor for both resize paths: never below minTarget, which is also the default. */
  private minWidthOf;
  /**
   * The column's track as CSS: its pixel width, else the columnWidth binding (doubled in the internal
   * `--ds-data-grid-column-size`), never below minTarget or its own `minWidth`.
   */
  private trackOf;
  /** The summed width of `columns` as one CSS length, with `lead` (the selection column) first. */
  private sumOf;
  private rowLayout;
  private cellClasses;
  /** Sticky offsets for pinned columns; the selection column counts toward the start offset. */
  private pinStyle;
  private rowName;
  private cellId;
  private isActive;
  private activeDescendantId;
  private get activeCellEl();
  /**
   * rowsPerPage: floor(the scroll region's height ÷ the row height) − 1, the sticky header's row left out, so a
   * paged move or request keeps one row of context.
   */
  private pageRows;
  /** Rendered row indexes: the visible window plus one page of overscan each way, and the active row. */
  private windowIndexes;
  private rangeRect;
  private inRange;
  /** The live region's text: loading, invalid, sort, selection, copy and editing announcements only. */
  private announcement;
  /** The shown selection count; empty when nothing is selected. */
  private selectionText;
  /** `copy.position` for the active body cell; shown, never announced. */
  private positionText;
  private emit;
  private sortBy;
  private commitRows;
  private toggleRow;
  private toggleAll;
  /** Adds every row from the anchor (the last row toggled) through `index`. */
  private extendRows;
  private cellRef;
  /** Sets the range and reports it, but only when the selected rectangle actually changed. */
  private setRange;
  private emitCellSelection;
  /** Moves the active cell (clamped to the loaded rows) and scrolls it into view. */
  private moveTo;
  private startEdit;
  private readEditorValue;
  /** Validates and commits the open edit. Returns false (editor stays open) when `validate` rejects it. */
  private commitEdit;
  private cancelEdit;
  /** Commits, then returns focus to the grid `rowDelta` rows down. */
  private commitAndReturn;
  private handleEditorKeydown;
  private handleEditorFocusout;
  private focusGrid;
  private handleKeydown;
  /** Real focus is on a control inside a cell: Escape hands it back; Shift+Tab leaves the grid. */
  private handleCellControlKeydown;
  private handleKeyup;
  private handleGridFocusout;
  /**
   * A plain navigation key (arrows, Home/End, Page keys). In range mode it collapses the range to the newly focused
   * body cell and makes it the anchor; once Escape has cleared the range, it only moves the anchor.
   */
  private arrowTo;
  private extendRange;
  private activateCell;
  private handleSpace;
  private selectAll;
  private copyRange;
  /** Delete/Backspace: `cell-change` with `value: undefined` for each editable cell in the selection. */
  private clearSelection;
  private cellFromTarget;
  private handlePointerdown;
  private handlePointermove;
  private handlePointerup;
  private handleDblclick;
  private handleResizeDown;
  private readonly handleResizeMove;
  private readonly handleResizeUp;
  private resizeByKey;
  private flushKeyboardResize;
  private handleScroll;
  /** `range-needed` when `index` is within one page of the end of `data` and `rowCount` says there is more. */
  private maybeRequestRange;
  private scrollRowIntoView;
  /** Horizontal (and, for `height: content`, vertical) reveal of the active cell past any pinned columns. */
  private scrollActiveIntoView;
  private measure;
  /** Controls a column's `render` returns are reachable by Enter, not Tab: the grid stays one tab stop. */
  private demoteCellControls;
  private applyOverrides;
  private warnOnce;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-data-grid": DsDataGrid;
  }
}
//#endregion
//#region src/TreeGrid.d.ts
/**
 * A node. `id` must be stable across renders. `children: "lazy"` marks a row whose children are loaded on expand
 * through the `expand` event; the row shows the expand button and a loading row until `data` is updated.
 * `children: []` is a leaf: no expand button and no aria-expanded.
 */
interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | "lazy" | undefined;
  [key: string]: unknown;
}
type TreeGridSortDirection = "ascending" | "descending";
interface TreeGridSort {
  column: string;
  direction: TreeGridSortDirection;
}
type TreeGridSelectable = "none" | "row" | "cell";
type TreeGridDensity = "compact" | "comfortable";
type TreeGridHeight = "content" | "viewport" | "fixed";
/** Heading level of the caption in the page outline; its size stays DataGrid's caption size regardless. */
type TreeGridCaptionLevel = "2" | "3" | "4";
interface TreeGridCellRef {
  rowId: string;
  column: string;
}
/** Row ids (`row`) or one cell (`cell`), matching `selectable`. */
type TreeGridSelection = string[] | TreeGridCellRef;
/** A committed cell value; `undefined` when Delete/Backspace clears the cell or the row had none. */
type TreeGridCellValue = string | number | boolean | undefined;
/** Detail carried by the `expand-change` CustomEvent: every expanded id, as a bare array. */
type TreeGridExpandChangeDetail = string[];
/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` row being expanded, bare. */
type TreeGridExpandDetail = string;
/** Detail carried by the `sort-change` CustomEvent. */
interface TreeGridSortChangeDetail {
  column: string;
  direction: TreeGridSortDirection;
}
/** Detail carried by the `selection-change` CustomEvent. */
interface TreeGridSelectionChangeDetail {
  selection: TreeGridSelection;
}
/** Detail carried by the `cell-change` CustomEvent. The caller updates `data`; the grid shows the old value until then. */
interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: TreeGridCellValue;
  previous: TreeGridCellValue;
}
/** Detail carried by the cancelable `edit-start` CustomEvent: `preventDefault()` refuses the edit. */
interface TreeGridEditStartDetail {
  rowId: string;
  column: string;
}
/** Detail carried by the `column-resize` CustomEvent. */
interface TreeGridColumnResizeDetail {
  column: string;
  width: number;
}
/**
 * Overridable style hooks; see the `overrides` property. `expandButtonSize`, `loadingColor`, `focusRing`,
 * `focusRingWidth` and `minTarget` are accessibility-bearing and locked, and DataGrid's own bindings (header, grid
 * lines, row height, status bar, caption, resize handle, resizeStep) apply at DataGrid's defaults and are not
 * overridable here.
 */
type TreeGridOverridableBinding = "indent" | "expandGap" | "guideLine" | "guideLineWidth" | "cellPaddingInline" | "fixedHeight" | "parentWeight" | "transition";
export declare class DsTreeGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  accessor caption;
  /** Heading level of the caption in the page outline; its size stays the caption size, as DataGrid. */
  accessor captionLevel: TreeGridCaptionLevel;
  /** Visually hide the caption; it remains the accessible name. */
  accessor hideCaption;
  /** DataGrid's column model; the `isRowHeader` column must exist and come first. A property, not an attribute. */
  accessor columns: DataGridColumn[];
  /** Nested rows. A property, not an attribute. */
  accessor data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  accessor expanded: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every row with loaded children, never a `"lazy"` one. */
  accessor defaultExpanded: string[] | undefined;
  /** Controlled sort; applies within each level and the caller orders `data`. */
  accessor sort: TreeGridSort | undefined;
  /** Initial sort; the grid orders siblings itself. */
  accessor defaultSort: TreeGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the focused cell. */
  accessor selectable: TreeGridSelectable;
  /** Controlled selected row ids. */
  accessor selected: string[] | undefined;
  /** Initially selected row ids. */
  accessor defaultSelected: string[] | undefined;
  /** A parent row's checkbox sets or clears it and every loaded descendant; parents show derived state. */
  accessor selectChildren;
  /** Master switch: cells whose column is `editable` can be edited. */
  accessor editable;
  /** Row height. */
  accessor density: TreeGridDensity;
  /** `viewport`: 100vh − 2 × layout.gap.section; `content`: grows with rows, not virtualized; `fixed`: `overrides.fixedHeight`. */
  accessor height: TreeGridHeight;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  accessor loading;
  /** The footer status line. Attribute: `no-status-bar`. */
  accessor showStatusBar;
  /** The header stays visible while the body scrolls; always true when virtualized. Attribute: `no-sticky-header`. */
  accessor stickyHeader;
  /** Shown when there are no rows. Defaults to `copy.empty`. */
  accessor emptyMessage: string | undefined;
  /** Per-instance style overrides: `{ indent: 'space.4' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalExpanded;
  /**
   * The `"lazy"` rows the user has opened. A lazy row cannot be opened programmatically: its id in `expanded` or
   * `defaultExpanded` (or a `"*"` there) is held collapsed until a user act, and the id still travels in the
   * caller's array and in what `expand-change` reports.
   */
  private accessor lazyOpened;
  private accessor internalSort;
  private accessor internalSelected;
  /** The active cell: row -1 is the header row; col 0 is the selection column in row mode. */
  private accessor activeRow;
  private accessor activeCol;
  private accessor editing;
  private accessor columnWidths;
  private accessor message;
  private accessor bodyScrollTop;
  private accessor scrolledX;
  private accessor overflowX;
  private accessor viewportHeight;
  private accessor headerHeight;
  private accessor rowHeightPx;
  private accessor draggingColumn;
  private accessor scrollEl;
  private accessor gridEl;
  private accessor probeEl;
  private accessor probeStepEl;
  private visibleCache;
  private indexCache;
  /** The visible rows of the last render, so the active cell follows its row when the list changes. */
  private renderedRows;
  private rowAnchorId;
  private resizeDrag;
  private keyboardResize;
  private scrollActivePending;
  private resizeObserver;
  private readonly warned;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override firstUpdated(): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private renderHeader;
  /** Select-all covers every loaded row at every level, expanded or not. */
  private renderSelectAllCell;
  private renderColumnHeader;
  private renderEmpty;
  private renderRow;
  private renderSelectCell;
  private renderCell;
  /**
   * The row header's indent spacer, expand button and content. The `expandButton` part is the span this element
   * owns around the composed Button: it is the pointer target, it is `expandButtonSize` on both axes, and it
   * carries the rotation, never the Icon. The guide lines are not drawn here — they hang off the row, whose
   * `::before` is neither clipped by this cell's `overflow: hidden` nor moved by a sticky pinned column.
   *
   * Neither the span nor the Button is `aria-hidden`. The Button is a real, focusable control — `tabindex="-1"`
   * only takes it out of the tab order — so hiding either would be axe's `aria-hidden-focus`. It stays exposed
   * under `copy.expand`/`copy.collapse`; ArrowLeft/Right remain the keyboard path, and the row's own
   * `aria-expanded` is what conveys the state.
   */
  private renderTreeColumn;
  private renderEditor;
  /**
   * The visible counterpart of the live region. Only the leading span is `role="status"`, so the row count,
   * `copy.scrollHint` and `copy.position` are shown but never announced — `aria-rowindex` and `aria-colindex`
   * already carry position, and a polite region on every arrow press would be noise. The selection count is shown
   * here and announced through the live region when it changes, as DataGrid.
   */
  private renderStatusBar;
  private get hasSelectColumn();
  private get colOffset();
  private get colCount();
  /** The grid column of the row header, or -1 when no column is marked. */
  private get rowHeaderCol();
  private get currentSort();
  private get currentSelected();
  private get rawExpanded();
  /** Every loaded row by id with its parent, and all loaded rows in tree order; O(n), cached per `data`. */
  private get index();
  /** The flattened visible rows: siblings ordered by an uncontrolled sort, collapsed subtrees left out. */
  private get visible();
  /** The expanded ids with `"*"` resolved against the loaded rows; the first user toggle commits these. */
  private expandedIds;
  /** Checked/indeterminate per loaded row; with `selectChildren` a parent derives it from its loaded descendants. */
  private selectionStates;
  private columnAt;
  private widthOf;
  /** The floor for both resize paths: never below `size.target.min`. */
  private minWidthOf;
  private rowLayout;
  private cellClasses;
  /** Sticky offsets for pinned columns; the selection column counts toward the start offset. */
  private pinStyle;
  private rowName;
  private cellId;
  private isActive;
  private activeDescendantId;
  private get activeCellEl();
  /** Visible rows per page, excluding the sticky header. */
  private pageRows;
  /** Rendered row indexes: the visible window plus one page of overscan each way, and the active row. */
  private windowIndexes;
  /** The live region's text: loading, invalid, sort, selection and editing announcements only. */
  private announcement;
  /** The shown selection count over every loaded row; empty when nothing is selected. */
  private selectionText;
  /** `copy.position` for the active body cell; shown, never announced. */
  private positionText;
  private emit;
  /**
   * Opens or closes `targets`, from each row's shown state: a lazy row's is `lazyOpened`, so its id already sitting
   * in `expanded` neither opens it nor suppresses this act. Each lazy row that opens from collapsed fires `expand`
   * (every time, so a failed load can retry), then one `expand-change` carries the whole new set of ids.
   */
  private setExpanded;
  /** `*`: every expandable sibling of the focused row under the same parent, the focused row included. */
  private expandSiblings;
  private sortBy;
  private commitRows;
  /** A row's own toggle; with `selectChildren` and `cascade` it sets or clears the row and its loaded descendants. */
  private toggleRow;
  /** Select-all covers every loaded row at every level, with or without `selectChildren`. */
  private toggleAll;
  /** Shift+Space: adds the visible rows from the last plain-Space anchor through `index`; never cascades. */
  private extendRows;
  private emitCellSelection;
  /** Moves the active cell (clamped to the visible rows) and scrolls it into view. */
  private moveTo;
  private startEdit;
  private readEditorValue;
  /** Validates and commits the open edit. Returns false (editor stays open) when `validate` rejects it. */
  private commitEdit;
  private cancelEdit;
  /** Commits, then returns focus to the grid `rowDelta` rows down. */
  private commitAndReturn;
  private handleEditorKeydown;
  private handleEditorFocusout;
  private focusGrid;
  private handleKeydown;
  /** Real focus is on a control inside a cell: Escape hands it back; Shift+Tab leaves the grid. */
  private handleCellControlKeydown;
  private handleKeyup;
  private handleGridFocusout;
  private activateCell;
  private handleSpace;
  /** Delete/Backspace: `cell-change` with `value: undefined` for each editable cell in the selection. */
  private clearSelection;
  private cellFromTarget;
  private handlePointerdown;
  private handleDblclick;
  private handleResizeDown;
  private readonly handleResizeMove;
  private readonly handleResizeUp;
  /** Shift+ArrowRight/Left on a resizable header cell; the step is DataGrid's resizeStep, read as a length. */
  private resizeByKey;
  /** `column-resize` on release of Shift (or when focus leaves the grid), never on every press. */
  private flushKeyboardResize;
  private handleScroll;
  private scrollRowIntoView;
  /** Horizontal (and, for `height: content`, vertical) reveal of the active cell past any pinned columns. */
  private scrollActiveIntoView;
  private measure;
  /** Controls a column's `render` returns are reachable by Enter, not Tab: the grid stays one tab stop. */
  private demoteCellControls;
  private applyOverrides;
  private warnOnce;
  private warnInDev;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-tree-grid": DsTreeGrid;
  }
}
//#endregion
//#region src/Tree.d.ts
/**
 * A node in the hierarchy. `href` makes the node's label a `ds-link` with `tone="inherit"` nested inside the
 * label Text, so it takes the label's font and colour (navigation trees); `icon` is an Icon glyph (`folder`
 * and `file` exist for the usual case); `badge` is a short trailing count or status; `children: "lazy"` loads
 * on first expand through the `expand` event.
 */
interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNode[] | "lazy" | undefined;
}
/** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
type TreeHeadingLevel = "2" | "3" | "4";
type TreeSelectable = "none" | "single" | "multiple";
/** `selection-change` detail: every selected id, in tree (document) order, as a bare array. */
type TreeSelectionChangeDetail = string[];
/** `expand-change` detail: every expanded id, in the order they were opened, as a bare array. */
type TreeExpandChangeDetail = string[];
/** `expand` detail: the id of the still-`"lazy"` node that was opened. */
type TreeExpandDetail = string;
/** `activate` detail: the id of the activated node. */
type TreeActivateDetail = string;
/**
 * Style bindings that can be overridden per instance. The accessibility-bearing bindings (rowHeight,
 * rowSelected, rowSelectedBorder, rowSelectedBorderWidth, labelColor, iconColor, badgeColor,
 * expandButtonSize, checkboxBorder, checkboxSelected, checkboxMark, minTarget, focusRing, focusRingWidth)
 * are locked and not in this union.
 */
type TreeOverridableBinding = "indent" | "rowPaddingInline" | "rowRadius" | "rowGap" | "rowHover" | "labelSelectedWeight" | "headingSize" | "badgeSize" | "guideLine" | "guideLineWidth" | "checkboxGap" | "checkboxSize" | "checkboxBorderWidth" | "checkboxBackground" | "checkboxRadius" | "fontFamily" | "fontSize" | "lineHeight" | "disabledOpacity" | "transition";
export declare class DsTree extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  accessor label;
  /** Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label). */
  accessor showLabel;
  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  accessor headingLevel: TreeHeadingLevel;
  /** The hierarchy. */
  accessor nodes: TreeNode[];
  /**
   * Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in
   * `defaultExpanded` — the id stays in the array the caller passed and in what `expand-change` reports, but
   * the node does not render open and fires no `expand`.
   */
  accessor expanded: string[] | undefined;
  /** Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array, never a lazy one. */
  accessor defaultExpanded: string[] | undefined;
  /** `single`: one current node. `multiple`: checkbox-like selection. `none`: expand/collapse only. */
  accessor selectable: TreeSelectable;
  /** Controlled selected ids. Always an array, even in `single` mode (zero or one element). */
  accessor selected: string[] | undefined;
  /** Initially selected ids. */
  accessor defaultSelected: string[] | undefined;
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  accessor selectChildren;
  /** With `single`, moving focus also selects. Off by default: focus moves, Enter or Space selects. */
  accessor selectOnFocus;
  /** Vertical guide lines under open parents. Defaults true, so the attribute is the negated `hide-guides`. */
  accessor showGuides;
  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are not in the type. */
  accessor overrides: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  private accessor internalExpanded;
  /** Lazy ids the user has opened: a lazy id listed in `expanded`/`defaultExpanded` never opens itself. */
  private accessor openedLazy;
  private accessor internalSelected;
  /** The node the roving tabindex is parked on while focus is inside the tree. */
  private accessor focusedId;
  private readonly instanceId;
  private nodeMapCache;
  /** The node focused when an expansion change began, so `updated` can move focus up if it disappeared. */
  private focusBeforeUpdate;
  private typeaheadBuffer;
  private typeaheadTimer;
  private warnedLabel;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  private get nodeMaps();
  private get nodeById();
  private get parentById();
  /** The caller's list with `"*"` resolved to concrete ids; a held-lazy id stays in it and in what is reported. */
  private get expandedIds();
  /** What actually renders open: a still-`"lazy"` id waits for the user act that fires `expand`. */
  private get expandedSet();
  private get selectedIds();
  private get selectedSet();
  private visible;
  /** Visible, enabled nodes: what the arrows, Home/End, type-ahead and Control+A move across. */
  private navigable;
  /** Tab lands on the selected node (the first in tree order when several are), else the first node. */
  private get tabStopId();
  private itemId;
  private itemEl;
  private nodeIdOf;
  /**
   * `expand` fires each time a still-`"lazy"` node is opened, so a failed load can retry; once the caller
   * replaces `children` it never fires again. It fires before the `expand-change` of the same act.
   */
  private commitExpanded;
  private toggleExpanded;
  /**
   * What a node's checkbox shows. Under `selectChildren` it is derived from the node's enabled loaded
   * descendants (mixed when only some are selected); a node with none of those behaves as a leaf.
   */
  private checkedState;
  /** Fires only when the set actually changes, with the ids in tree (document) order. */
  private commitSelection;
  private selectOnly;
  private toggleSelection;
  /** Shift+ArrowDown/Up only ever add — they never remove a node or an ancestor. */
  private addToSelection;
  /** Space and click: select in single, toggle in multiple, nothing in none. */
  private selectAction;
  private activate;
  private focusNode;
  /** Keyboard movement: with single + selectOnFocus, the node is selected as focus lands. */
  private moveTo;
  /** Leaving the tree resets the tab stop, so Tab back in lands on the selected node, else the first. */
  private readonly handleTreeFocusOut;
  /** Any printable character moves to the next visible node whose label starts with the buffer. */
  private handleTypeahead;
  private readonly handleKeydown;
  protected override render(): TemplateResult;
  private renderNode;
  /**
   * The lazy placeholder: a treeitem the arrows never land on, under an `aria-busy` parent. It is not a node,
   * so it carries no data-part (a part locator never resolves to it) and no tabindex.
   */
  private renderLoading;
  /**
   * The tree is one tab stop. A tabindex on a custom-element host does not reach the child's inner control,
   * so each composed ds-link's `<a>` and ds-button's `<button>` is demoted after every render — otherwise the
   * tree would have a tab stop per node. A same-value write is skipped.
   */
  private demoteComposedControls;
  private applyOverrides;
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
/** Overridable style hooks; see the `overrides` property. `separatorHover`, `separatorActive`,
`grip`, `paneMinTarget`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
type SplitterOverridableBinding = "separatorSize" | "separatorColor" | "handleSize" | "gripLength" | "gripRadius" | "collapseButtonOffset" | "transition";
export declare class DsSplitter extends LitElement {
  static override shadowRootOptions: ShadowRootInit;
  static override styles: CSSResult;
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  accessor label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. The
	splitter fills its parent, so a vertical splitter needs a parent with a definite height. */
  accessor orientation: SplitterOrientation;
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  accessor size: number | undefined;
  /** Initial primary size, percent. */
  accessor defaultSize: number;
  /** Smallest primary size, percent. With `collapsible`, stepping below it collapses the pane
	instead of clamping; otherwise it is the hard floor. */
  accessor minSize: number;
  /** Largest primary size, percent. */
  accessor maxSize: number;
  /** Arrow-key increment, percent. */
  accessor step: number;
  /** The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator,
	or use the collapse button. Enter again restores the last size. */
  accessor collapsible: boolean;
  /** Controlled collapsed state, ignored unless `collapsible`. Reflected when true; an absent
	attribute means uncontrolled, and a controlled `false` is set as a property. */
  accessor collapsed: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  accessor defaultCollapsed: boolean;
  /** When set, the size and collapsed state are remembered in localStorage under this key, so a
	sidebar stays where it was left. */
  accessor persistKey: string | undefined;
  /** Below this width of the splitter's own box a horizontal splitter stacks its panes and renders
	no separator. A vertical splitter never stacks. */
  accessor stackBelow: SplitterStackBelow;
  /** Per-instance style overrides: `{ separatorSize: 'space.2' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Uncontrolled size; undefined until the user moves the separator or a persisted value is read. */
  private accessor internalSize;
  /** Uncontrolled collapsed state; undefined until the user collapses, or a persisted value is read. */
  private accessor internalCollapsed;
  /** True while a pointer drag is in progress (separatorActive). */
  private accessor dragging;
  /** True below `stackBelow` on a horizontal splitter: the separator is not rendered. */
  private accessor stacked;
  /** True for the render that collapses or restores, so only that change transitions the track. */
  private accessor animating;
  /** Writing direction, measured once: a horizontal splitter swaps its arrow keys, its drag axis and
	its chevron in RTL, so the separator always moves the way the arrow points. */
  private accessor rtl;
  private readonly instanceId;
  private resizeObserver;
  private observedWidth;
  /** The last committed expanded size during a drag; the size a collapse keeps for restoring. */
  private dragSize;
  /** True once a drag has actually changed the size. A press that never moved the separator is not
	a drag and fires nothing, so a stray tap on the separator is silent. */
  private dragMoved;
  /** The last record written under `persistKey`, so an unrelated update does not rewrite it. */
  private lastPersisted;
  private accessor containerEl;
  private accessor trackEl;
  private accessor separatorEl;
  private accessor primaryPaneEl;
  private accessor secondaryPaneEl;
  private accessor collapseButtonEl;
  private accessor primarySlotEl;
  private accessor secondarySlotEl;
  /** The primary size (percent) when expanded: `size`, else the uncontrolled value, else
	`defaultSize`, clamped to `minSize`–`maxSize`. */
  private get currentSize();
  /** The collapsed state the props ask for. `collapsed` is ignored unless `collapsible`. */
  private get isCollapsed();
  /** The collapsed state that renders: a stacked splitter shows both panes in full. */
  private get effectiveCollapsed();
  private get primaryPaneId();
  private clamp;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override updated(): void;
  protected override render(): TemplateResult;
  private handlePointerDown;
  private handlePointerMove;
  /** A gesture the platform cancels counts as a release; a press that never moved is silent. */
  private handlePointerEnd;
  private stopDrag;
  /** The pointer as a percentage of the container along the drag axis, mirrored in RTL. */
  private percentFromPoint;
  private handleSeparatorKeydown;
  /** F6 cycles primary pane → separator → secondary pane → primary pane, wrapping. Shift+F6 is not
	handled, and a collapsed (inert) primary pane or an unrendered separator is skipped. */
  private readonly handleHostKeydown;
  private focusZone;
  private handleCollapsePress;
  /** The collapseButton part is a wrapper; a click on it reaches the composed Button. */
  private handleCollapseTargetClick;
  /** Applies a new size and fires `size-change`; returns the committed value, or undefined when the
	size did not change (a key press at a bound fires nothing). */
  private changeSize;
  private setCollapsed;
  private dispatchSize;
  private updateStacked;
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
/**
 * Overridable style hooks; see the `overrides` property. `unreadBorder`,
 * `unreadBorderWidth`, `timestampColor`, `endMessageColor`, `emptyStateColor`,
 * `focusRing` and `focusRingWidth` are locked and excluded.
 */
type FeedOverridableBinding = "itemGap" | "articleInset" | "articleBodyGap" | "articleRadius" | "timestampSize" | "newItemsOffset" | "newItemsLayer" | "loadingInset" | "endMessageInset" | "endMessageSize" | "emptyStateInset" | "emptyStateSize" | "fontFamily";
export declare class DsFeed extends LitElement {
  static override styles: CSSResult;
  /** What the feed contains ("Activity", "Notifications"). The feed's accessible name; an empty label warns in development. */
  accessor label: string;
  /** Articles, newest first. */
  accessor items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `load-more` as the end approaches, and whenever `items` is empty and not `loading`. */
  accessor hasMore;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  accessor loading;
  /** Number of newer items available above. Shows a "Show {count} new" button; the feed never inserts them itself. */
  accessor newItemsCount: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  accessor headingLevel: FeedHeadingLevel;
  /** Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`. */
  accessor endMessage: string | undefined;
  /** Per-instance style overrides: `{ itemGap: 'layout.gap.loose' }`. Locked bindings are not accepted. */
  accessor overrides: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
  private loadMoreObserver;
  /** `lastId|hasMore|loading`: the feed asks at most once per change of these, so a prepend does not re-ask. */
  private loadMoreKey;
  private visibilityObserver;
  private readonly visibilityTimers;
  private readonly reportedVisible;
  /** The joined item ids; a change of this is a change of `items`. */
  private itemsKey;
  private firstItemId;
  /** Armed by `show-new`, spent on the next change of `items` whether or not it moved focus. */
  private pendingShowNewFocus;
  /** An empty feed asks for its first page once, until the caller fills or clears `items` again. */
  private askedForFirstPage;
  private warnedLabel;
  override connectedCallback(): void;
  override disconnectedCallback(): void;
  protected override willUpdate(changed: PropertyValues): void;
  protected override render(): TemplateResult;
  protected override updated(): void;
  private renderArticle;
  /**
   * One slot with a fixed precedence: `loading` wins, then an empty feed with
   * `hasMore` shows nothing (so a feed about to fetch never flashes `copy.empty`),
   * then an empty feed without it shows `copy.empty`, then the end message. Every
   * one of these is a sibling of the `role="feed"` column: a progressbar and a
   * paragraph are not articles, so a feed may not own them.
   */
  private renderFooter;
  /** The `role="article"` wrappers — the focus targets and the observers' targets — in document order. */
  private getArticles;
  private get newItemsButtonEl();
  private dispatchLoadMore;
  private readonly handleShowNewPress;
  private readonly handleKeydown;
  /** Escapes the feed to the nearest focusable element in document order, before (`-1`) or after (`1`) it. */
  private focusOutside;
  /** `label` is the feed's only accessible name; there is no default. */
  private warnMissingLabel;
  /**
   * An empty feed has no last article to observe, so it asks for its first page itself, once per
   * change: filling or clearing `items`, turning `hasMore` on, or a `loading` cycle that ended
   * still empty (a failed page can be asked for again) each re-arm the request.
   */
  private askForFirstPage;
  /**
   * After `show-new` the first new article takes focus and is scrolled into view
   * (instantly under reduced motion — the feed's only motion on this platform).
   * The request lives until the next change of `items` and no further: that change
   * takes it when it puts a new id first, and otherwise drops it, so an unrelated
   * later prepend never steals focus.
   */
  private moveFocusToFirstNewArticle;
  /** Watches the last article, at most one ask per change of its id, `hasMore` or `loading`. */
  private syncLoadMoreObserver;
  /**
   * Watches every article whose id has not reported yet; ids already reported stay reported.
   * A change of `items` keeps the dwell timer of an article that is still rendered, so a
   * prepend during the one-second wait does not restart it; removed ids lose theirs.
   */
  private syncVisibilityObserver;
  private teardownObservers;
  private readonly handleVisibilityIntersect;
  private applyOverrides;
}
declare global {
  interface HTMLElementTagNameMap {
    "ds-feed": DsFeed;
  }
}
//#endregion
export type { AccordionChangeDetail, AccordionHeadingLevel, AccordionItem, AccordionOpenChangeDetail, AccordionOpenChangeReason, AccordionOverridableBinding, ActionSheetAction, ActionSheetActionDetail, ActionSheetActionTone, ActionSheetCloseDetail, ActionSheetCloseReason, ActionSheetOverridableBinding, AlertDialogCancelDetail, AlertDialogCancelReason, AlertDialogConfirmDetail, AlertDialogOverridableBinding, AlertDialogTone, AlertDismissDetail, AlertLive, AlertOverridableBinding, AlertTone, BottomSheetCloseDetail, BottomSheetCloseReason, BottomSheetDragDismissDetail, BottomSheetHeight, BottomSheetOverridableBinding, BoxElement, BoxInset, BoxOverridableBinding, BoxRadius, BoxSurface, BreadcrumbItem, BreadcrumbNavigateDetail, BreadcrumbOverridableBinding, ButtonHaspopup, ButtonOverridableBinding, ButtonPressDetail, ButtonSize, ButtonTrackDetail, ButtonType, ButtonVariant, CardHeadingLevel, CardInset, CardOverridableBinding, CardSurface, CarouselChangeDetail, CarouselChangeReason, CarouselOverridableBinding, CarouselPicker, CheckboxChangeDetail, CheckboxOverridableBinding, ComboboxChangeDetail, ComboboxFilter, ComboboxInputChangeDetail, ComboboxOpenChangeDetail, ComboboxOverridableBinding, ComboboxValue, ContainerAlign, ContainerElement, ContainerGutter, ContainerOverridableBinding, ContainerWidth, DataGridCaptionLevel, DataGridCellChangeDetail, DataGridCellRef, DataGridCellValue, DataGridColumn, DataGridColumnAlign, DataGridColumnOption, DataGridColumnPinned, DataGridColumnResizeDetail, DataGridDensity, DataGridEditStartDetail, DataGridEditorKind, DataGridHeight, DataGridOverridableBinding, DataGridRangeNeededDetail, DataGridRangeRef, DataGridRow, DataGridSelectable, DataGridSelection, DataGridSelectionChangeDetail, DataGridSort, DataGridSortChangeDetail, DataGridSortDirection, DatePickerChangeDetail, DatePickerOpenChangeDetail, DatePickerOverridableBinding, DatePickerSize, DatePickerValue, DialogCloseDetail, DialogCloseReason, DialogInitialFocus, DialogOpenedDetail, DialogOverridableBinding, DialogSize, DisclosureHeadingLevel, DisclosureOverridableBinding, DisclosureToggleDetail, DisclosureToggleReason, DividerOrientation, DividerOverridableBinding, DividerSpacing, DsFormField, FeedHeadingLevel, FeedItem, FeedItemVisibleDetail, FeedOverridableBinding, FieldsetGap, FieldsetOverridableBinding, FocusScopeAutoFocus, FocusScopeEscapeAttemptDetail, FocusScopeEscapeAttemptDirection, FocusScopeReturnTarget, FormInvalidDetail, FormOverridableBinding, FormSubmitDetail, FormValidate, HeadingLevel, HeadingOverridableBinding, HeadingSize, IconName, IconOverridableBinding, IconSize, InputChangeDetail, InputOverridableBinding, InputSize, InputType, LandmarkRole, LinkOverridableBinding, LinkTone, ListboxActiveChangeDetail, ListboxChangeDetail, ListboxGroup, ListboxItem, ListboxMaxVisible, ListboxOption, ListboxOverridableBinding, ListboxValue, MenuActionDetail, MenuActionItem, MenuGroup, MenuItem, MenuOpenChangeDetail, MenuOpenChangeReason, MenuOverridableBinding, MenuPlacement, MenuSeparator, MenuTriggerIcon, MenuTriggerVariant, MeterOverridableBinding, MeterTone, NumberInputChangeDetail, NumberInputFormat, NumberInputOverridableBinding, NumberInputSize, PopoverCloseReason, PopoverHeadingLevel, PopoverInitialFocus, PopoverOpenChangeDetail, PopoverOverridableBinding, PopoverPlacement, ProgressBarAnnounce, ProgressBarOverridableBinding, ProgressBarTone, RadioGroupChangeDetail, RadioGroupOption, RadioGroupOrientation, RadioGroupOverridableBinding, SearchChangeDetail, SearchClearDetail, SearchOverridableBinding, SearchSize, SearchSubmitDetail, SearchSuggestion, SegmentedControlChangeDetail, SegmentedControlOption, SegmentedControlOverridableBinding, SegmentedControlSize, SelectChangeDetail, SelectNative, SelectOpenChangeDetail, SelectOverridableBinding, SelectSize, SelectValue, SidePanelLandmark, SidePanelOpenChangeDetail, SidePanelOpenChangeReason, SidePanelOverridableBinding, SidePanelPersistent, SidePanelSide, SidePanelWidth, SliderChangeDetail, SliderMark, SliderOverridableBinding, SliderShowValue, SliderValue, SplitterCollapseChangeDetail, SplitterOrientation, SplitterOverridableBinding, SplitterSizeChangeDetail, SplitterStackBelow, StackAlign, StackDirection, StackElement, StackGap, StackJustify, StackOverridableBinding, StepperNavigable, StepperOrientation, StepperOverridableBinding, StepperStep, StepperStepSelectDetail, StepperStepStatus, SwitchChangeDetail, SwitchLabelPosition, SwitchOverridableBinding, TableCaptionLevel, TableColumn, TableColumnAlign, TableColumnHideBelow, TableColumnWidth, TableDensity, TableMaxHeight, TableOverridableBinding, TableResponsive, TableRow, TableRowPressDetail, TableSelectable, TableSelectionChangeDetail, TableSort, TableSortChangeDetail, TableSortDirection, TabsActivation, TabsChangeDetail, TabsFit, TabsItem, TabsOrientation, TabsOverridableBinding, TabsTab, TextAlign, TextElement, TextOverridableBinding, TextSize, TextTone, TextWeight, ToastActionDetail, ToastDismissDetail, ToastDismissReason, ToastDuration, ToastOptions, ToastOverridableBinding, ToastRegionOverridableBinding, ToastResult, ToastTone, ToolbarDensity, ToolbarOrientation, ToolbarOverflow, ToolbarOverridableBinding, ToolbarSize, TooltipDelay, TooltipOverridableBinding, TooltipPlacement, TreeActivateDetail, TreeExpandChangeDetail, TreeExpandDetail, TreeGridCaptionLevel, TreeGridCellChangeDetail, TreeGridCellRef, TreeGridCellValue, TreeGridColumnResizeDetail, TreeGridDensity, TreeGridEditStartDetail, TreeGridExpandChangeDetail, TreeGridExpandDetail, TreeGridHeight, TreeGridOverridableBinding, TreeGridRow, TreeGridSelectable, TreeGridSelection, TreeGridSelectionChangeDetail, TreeGridSort, TreeGridSortChangeDetail, TreeGridSortDirection, TreeHeadingLevel, TreeNode, TreeOverridableBinding, TreeSelectable, TreeSelectionChangeDetail };
//# sourceMappingURL=index.d.ts.map