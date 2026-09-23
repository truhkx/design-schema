import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetAction, ActionSheetCloseReason } from './ActionSheet';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type MenuTriggerVariant = Extract<ButtonVariant, 'ghost' | 'secondary' | 'primary'>;
export type MenuTriggerIcon = 'ellipsis' | 'chevron-down' | 'none';
export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type MenuItemTone = 'default' | 'danger';
/**
 * Why `onOpenChange` fired. `action` (an item was chosen) always fires before `onAction`.
 * `controlled` is never raised by the menu itself; it exists so a composing component can
 * forward its own reason through. `tab-out` and `focus-out` are part of the shared contract
 * but never fire on native: there is no Tab key event and no focus-out signal.
 */
export type MenuOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'action' | 'controlled' | 'tab-out' | 'focus-out';

/** A single actionable row. */
export type MenuAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: MenuItemTone | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of action items, rendered with a non-interactive heading row. A group inside a group is not drawn. */
export type MenuGroup = { group: string; items: MenuItem[] };
/** A divider between clusters of items. */
export type MenuSeparator = { separator: true };
export type MenuItem = MenuAction | MenuGroup | MenuSeparator;

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `typeaheadReset` is part of the contract but has nothing to reset
 * here: `Pressable` has no key events, so native has no typeahead.
 */
export type MenuOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'popupPadding'
  | 'popupOffset'
  | 'typeaheadReset'
  | 'maxHeight'
  | 'gutter'
  | 'minWidth'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'itemRadius'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'shortcutSize'
  | 'separator'
  | 'separatorMargin'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'layer'
  | 'enter'
  | 'enterDistance';

export interface MenuProps {
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

const TRIGGER_FOREGROUND = {
  ghost: 'colorActionGhostForeground',
  secondary: 'colorActionSecondaryForeground',
  primary: 'colorActionPrimaryForeground',
} as const satisfies Record<MenuTriggerVariant, keyof Tokens>;

type Rect = { x: number; y: number; width: number; height: number };
type WindowSize = { width: number; height: number };

function flattenActions(items: MenuItem[]): MenuAction[] {
  const result: MenuAction[] = [];
  for (const item of items) {
    if ('separator' in item) continue;
    if ('group' in item) result.push(...flattenActions(item.items));
    else result.push(item);
  }
  return result;
}

/**
 * Flattens groups and drops separators and shortcuts for the phone (`ActionSheet`)
 * presentation: `ActionSheet` takes a flat action list, and a group heading faked as
 * an inert row would misread.
 */
function toActionSheetActions(items: MenuItem[]): ActionSheetAction[] {
  return flattenActions(items).map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    tone: action.tone,
    disabled: action.disabled,
  }));
}

/** `escape` stays; `scrim`, `cancel` and `drag` all become `outside`. */
function mapActionSheetCloseReason(reason: ActionSheetCloseReason): MenuOpenChangeReason {
  return reason === 'escape' ? 'escape' : 'outside';
}

/**
 * Positions the popup from the anchor's measured rect for `placement`. Only the block side
 * flips on overflow, keeping `popupOffset` on its new side; the inline side never flips —
 * `start`/`end` resolve against the writing direction and the popup is shifted along the
 * inline axis so it stays `gutter` from each viewport edge.
 */
function computeMenuPosition(
  anchor: Rect,
  popupWidth: number,
  popupHeight: number,
  placement: MenuPlacement,
  windowSize: WindowSize,
  offset: number,
  gutter: number,
): { top: number; left: number; side: 'bottom' | 'top' } {
  const [vert, horiz] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];

  let vertical = vert;
  const spaceBelow = windowSize.height - (anchor.y + anchor.height);
  const spaceAbove = anchor.y;
  if (vertical === 'bottom' && spaceBelow < popupHeight + offset && spaceAbove > spaceBelow) {
    vertical = 'top';
  } else if (vertical === 'top' && spaceAbove < popupHeight + offset && spaceBelow > spaceAbove) {
    vertical = 'bottom';
  }

  const rtl = I18nManager.isRTL;
  const alignLeft = rtl ? horiz === 'end' : horiz === 'start';
  const preferredLeft = alignLeft ? anchor.x : anchor.x + anchor.width - popupWidth;
  const maxLeft = windowSize.width - gutter - popupWidth;
  // Too wide for both gutters: the leading edge wins, clamped to `gutter` on the start side.
  const left =
    maxLeft < gutter ? (rtl ? maxLeft : gutter) : Math.min(Math.max(preferredLeft, gutter), maxLeft);

  const preferredTop = vertical === 'bottom' ? anchor.y + anchor.height + offset : anchor.y - offset - popupHeight;
  // `gutter` is kept from the block edges too, so a flipped popup near an edge is clamped.
  const top = Math.max(gutter, Math.min(preferredTop, windowSize.height - gutter - popupHeight));

  return { top, left, side: vertical };
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
export function Menu({
  label,
  items,
  triggerVariant = 'ghost',
  triggerIcon = 'chevron-down',
  iconOnly = false,
  placement = 'bottom-start',
  open,
  anchor,
  onAction,
  onOpenChange,
  overrides,
}: MenuProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const windowSize = useWindowDimensions();
  const isPhoneWidth = windowSize.width <= t.layoutMaxWidthProse;

  const triggerRef = React.useRef<ViewInstance>(null);
  const itemRefs = React.useRef(new Map<string, ViewInstance>());
  const hasFocusedInitialRef = React.useRef(false);
  const latestItemsRef = React.useRef(items);
  latestItemsRef.current = items;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const [anchorRect, setAnchorRect] = React.useState<Rect | null>(null);
  const [popupSize, setPopupSize] = React.useState<{ width: number; height: number } | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const popupPadding = overrides?.popupPadding ? (resolveToken(t, overrides.popupPadding) as number) : t.space1;
  const popupOffset = overrides?.popupOffset ? (resolveToken(t, overrides.popupOffset) as number) : t.space1;
  const maxHeightCap = overrides?.maxHeight ? (resolveToken(t, overrides.maxHeight) as number) : t.layoutMaxWidthProse;
  const gutter = overrides?.gutter ? (resolveToken(t, overrides.gutter) as number) : t.layoutGutter;
  const minWidth = overrides?.minWidth ? (resolveToken(t, overrides.minWidth) as number) : t.space20 * 2.5; // literal-ok: schema-computed multiplier
  const itemPaddingBlock = overrides?.itemPaddingBlock ? (resolveToken(t, overrides.itemPaddingBlock) as number) : t.spaceSm;
  const itemPaddingInline = overrides?.itemPaddingInline ? (resolveToken(t, overrides.itemPaddingInline) as number) : t.spaceMd;
  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const itemRadius = overrides?.itemRadius ? (resolveToken(t, overrides.itemRadius) as number) : t.radiusSm;
  const groupLabelSize = overrides?.groupLabelSize ? (resolveToken(t, overrides.groupLabelSize) as number) : t.fontSizeXs;
  const groupLabelWeight = overrides?.groupLabelWeight
    ? (resolveToken(t, overrides.groupLabelWeight) as number)
    : t.fontWeightSemibold;
  const shortcutSize = overrides?.shortcutSize ? (resolveToken(t, overrides.shortcutSize) as number) : t.fontSizeSm;
  const separatorColor = overrides?.separator ? (resolveToken(t, overrides.separator) as string) : t.colorBorder;
  const separatorMargin = overrides?.separatorMargin ? (resolveToken(t, overrides.separatorMargin) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDropdown;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const enterDistance = overrides?.enterDistance ? (resolveToken(t, overrides.enterDistance) as number) : t.space1;

  const surfaceColor = t.colorOverlaySurface;
  const itemHoverColor = t.colorBackgroundSubtle;
  const itemColor = t.colorForeground;
  const itemDangerColor = t.colorForegroundDanger;
  const groupLabelColor = t.colorForegroundMuted;
  const shortcutColor = t.colorForegroundMuted;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;
  const triggerIconColor = t[TRIGGER_FOREGROUND[triggerVariant]];

  // The only development warning Menu issues, and not when `anchor` is set: there is no trigger then.
  const hasWarnedRef = React.useRef(false);
  React.useEffect(() => {
    if (__DEV__ && iconOnly && triggerIcon === 'none' && anchor === undefined && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      console.warn('Menu: `iconOnly` with `triggerIcon` "none" leaves the trigger with nothing visible to press.');
    }
  }, [iconOnly, triggerIcon, anchor]);

  const registerItemRef = (id: string) => (node: ViewInstance | null): void => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  const focusFirstEnabledItem = React.useCallback(() => {
    const target = flattenActions(latestItemsRef.current).find((action) => action.disabled !== true);
    const node = target ? itemRefs.current.get(target.id) : undefined;
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  }, []);

  const focusReturnTarget = React.useCallback(() => {
    const node = anchor ? anchor.current : triggerRef.current;
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [anchor]);

  const changeOpen = (next: boolean, reason: MenuOpenChangeReason): void => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next, reason);
  };

  const closeMenu = (reason: MenuOpenChangeReason): void => {
    if (!isOpen) return;
    changeOpen(false, reason);
  };

  // Focus returns when the menu actually hides: at once when uncontrolled, and only once
  // the parent flips `open` to false when controlled.
  const wasOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    if (wasOpenRef.current && !isOpen) focusReturnTarget();
    wasOpenRef.current = isOpen;
  }, [isOpen, focusReturnTarget]);

  const handleTriggerPress = (): void => {
    if (isOpen) closeMenu('trigger');
    else changeOpen(true, 'trigger');
  };

  const handleActivate = (id: string): void => {
    closeMenu('action');
    onAction?.(id);
  };

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setPopupSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // Measure the anchor the moment the menu opens, and again whenever the window changes
  // under it (rotation, a resized react-native-web page); reset it all when it closes.
  React.useEffect(() => {
    if (isPhoneWidth || !isOpen) {
      hasFocusedInitialRef.current = false;
      progress.setValue(0);
      setAnchorRect(null);
      setPopupSize(null);
      return;
    }
    const node = anchor ? anchor.current : triggerRef.current;
    node?.measureInWindow((x, y, width, height) => setAnchorRect({ x, y, width, height }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPhoneWidth, windowSize.width, windowSize.height]);

  // Once the anchor and the popup's own size are known, fade/rise the popup in (or
  // snap under reduced motion) and move accessibility focus to the first enabled item.
  React.useEffect(() => {
    if (isPhoneWidth || !isOpen || anchorRect === null || popupSize === null || hasFocusedInitialRef.current) {
      return undefined;
    }
    hasFocusedInitialRef.current = true;
    if (reducedMotion) {
      progress.setValue(1);
      focusFirstEnabledItem();
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: enterDuration,
      easing: toEasing(t.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) focusFirstEnabledItem();
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPhoneWidth, anchorRect, popupSize, reducedMotion]);

  const triggerIconElement = triggerIcon !== 'none' ? <Icon name={triggerIcon} color={triggerIconColor} /> : undefined;

  const trigger =
    anchor === undefined ? (
      // `collapsable={false}` keeps this View in the native tree on Android so measureInWindow stays reliable.
      <View ref={triggerRef} collapsable={false} testID="Menu.trigger">
        <Button
          label={label}
          variant={triggerVariant}
          iconOnly={iconOnly}
          expanded={isOpen}
          leadingIcon={iconOnly ? triggerIconElement : undefined}
          trailingIcon={iconOnly ? undefined : triggerIconElement}
          onPress={handleTriggerPress}
        />
      </View>
    ) : null;

  if (isPhoneWidth) {
    return (
      <View testID="Menu">
        {trigger}
        <ActionSheet
          open={isOpen}
          heading={label}
          actions={toActionSheetActions(items)}
          onAction={handleActivate}
          onClose={(reason) => closeMenu(mapActionSheetCloseReason(reason))}
        />
      </View>
    );
  }

  // The × 2.5 rule is the floor, raised to the trigger's measured width; with `anchor` there
  // is no trigger-width floor. The popup grows past it with its content, so the placed width
  // is the measured one once `onLayout` has run.
  const popupMinWidth = anchorRect && anchor === undefined ? Math.max(minWidth, anchorRect.width) : minWidth;
  const popupWidth = popupSize?.width ?? popupMinWidth;
  const position = anchorRect
    ? computeMenuPosition(anchorRect, popupWidth, popupSize?.height ?? 0, placement, windowSize, popupOffset, gutter)
    : { top: 0, left: 0, side: placement.startsWith('top') ? ('top' as const) : ('bottom' as const) };
  // `gutter` at each viewport edge caps the popup's block size (border and padding included);
  // past it the list scrolls.
  const popupMaxHeight = Math.max(0, Math.min(maxHeightCap, windowSize.height - 2 * gutter));
  const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);

  // Held at opacity 0 (progress starts at 0) until the anchor measurement and the popup's own
  // layout have both reported, so an `end` placement never jumps once its real width is known.
  const popupStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    minWidth: popupMinWidth,
    maxHeight: popupMaxHeight,
    borderRadius: radius,
    borderWidth,
    borderColor: border,
    backgroundColor: surfaceColor,
    ...shadow,
    zIndex: layer,
    opacity: progress,
    // Slides in from the trigger side: downward below the trigger, upward above it.
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [position.side === 'bottom' ? -enterDistance : enterDistance, 0],
        }),
      },
    ],
  };

  // Shrinks inside the capped popup so the list, not the popup, scrolls.
  const listStyle: ViewStyle = { flexGrow: 0, flexShrink: 1 };
  const listContentStyle: ViewStyle = { padding: popupPadding };

  const groupLabelStyle: TextStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingVertical: itemPaddingBlock,
    fontFamily,
    fontSize: groupLabelSize,
    fontWeight: toFontWeight(groupLabelWeight),
    lineHeight: toLineHeight(groupLabelSize, lineHeightMultiplier),
    color: groupLabelColor,
  };

  const separatorStyle: ViewStyle = {
    marginVertical: separatorMargin,
    height: borderWidth,
    backgroundColor: separatorColor,
  };

  const itemRowStyle = (highlighted: boolean, focused: boolean, disabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: itemGap,
    minHeight: t.sizeTargetMin,
    paddingVertical: itemPaddingBlock,
    paddingHorizontal: itemPaddingInline,
    borderRadius: itemRadius,
    backgroundColor: highlighted ? itemHoverColor : 'transparent',
    borderWidth: focusRingWidth,
    borderColor: focused ? focusRingColor : 'transparent',
    opacity: disabled ? t.opacityDisabled : 1,
  });

  const itemLabelStyle = (danger: boolean): TextStyle => ({
    flexShrink: 1,
    fontFamily,
    fontSize,
    lineHeight,
    color: danger ? itemDangerColor : itemColor,
  });

  const shortcutStyle: TextStyle = {
    marginStart: 'auto', // literal-ok: flexbox push to the row's end, not a size
    fontFamily,
    fontSize: shortcutSize,
    lineHeight: toLineHeight(shortcutSize, lineHeightMultiplier),
    color: shortcutColor,
  };

  function renderAction(action: MenuAction, key: string): React.JSX.Element {
    const danger = action.tone === 'danger';
    return (
      <MenuActionRow
        key={key}
        action={action}
        registerRef={registerItemRef(action.id)}
        rowStyle={itemRowStyle}
        labelStyle={itemLabelStyle(danger)}
        shortcutStyle={shortcutStyle}
        iconColor={danger ? itemDangerColor : itemColor}
        onActivate={handleActivate}
      />
    );
  }

  function renderNode(node: MenuItem, key: string): React.JSX.Element | null {
    if ('separator' in node) {
      return <View key={key} role="separator" style={separatorStyle} testID="Menu.separator" />;
    }
    if ('group' in node) {
      return (
        <View key={key} role="group" accessibilityLabel={node.group} aria-label={node.group} testID="Menu.group">
          <RNText style={groupLabelStyle} testID="Menu.groupLabel">
            {node.group}
          </RNText>
          {/* Groups hold action items only; a nested group or separator is not drawn. */}
          {node.items.map((child, index) => ('id' in child ? renderAction(child, `${key}-${index}`) : null))}
        </View>
      );
    }
    return renderAction(node, key);
  }

  return (
    <View testID="Menu">
      {trigger}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={() => closeMenu('escape')} statusBarTranslucent>
        <View style={StyleSheet.absoluteFill}>
          {/* A transparent backdrop, not a scrim: a non-modal menu has no scrim colour. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeMenu('outside')}
            accessible={false}
            testID="Menu.backdrop"
          />
          {/* Non-modal: no FocusScope trap and no accessibilityViewIsModal. */}
          <Animated.View
            style={popupStyle}
            onLayout={handlePopupLayout}
            role="menu"
            accessibilityLabel={label}
            aria-label={label}
            testID="Menu.popup"
          >
            <ScrollView style={listStyle} contentContainerStyle={listContentStyle} testID="Menu.list">
              {items.map((item, index) => renderNode(item, String(index)))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

interface MenuActionRowProps {
  action: MenuAction;
  registerRef: (node: ViewInstance | null) => void;
  rowStyle: (highlighted: boolean, focused: boolean, disabled: boolean) => ViewStyle;
  labelStyle: TextStyle;
  shortcutStyle: TextStyle;
  iconColor: string;
  onActivate: (id: string) => void;
}

/** One menu row. Its own component so focus/hover state does not re-render the whole list. Hover and focus share `itemHover`. */
function MenuActionRow({
  action,
  registerRef,
  rowStyle,
  labelStyle,
  shortcutStyle,
  iconColor,
  onActivate,
}: MenuActionRowProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const disabled = action.disabled === true;

  return (
    <Pressable
      ref={registerRef}
      role="menuitem"
      accessibilityRole="menuitem"
      accessibilityLabel={action.label}
      aria-label={action.label}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      // Never the native `disabled` prop: it would drop the row from the focus order.
      onPress={() => {
        if (!disabled) onActivate(action.id);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => rowStyle(!disabled && (focused || pressed || hovered), focused, disabled)}
      testID="Menu.item"
    >
      {action.icon !== undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no" testID="Menu.itemIcon">
          <Icon name={action.icon} color={iconColor} />
        </View>
      ) : null}
      <RNText numberOfLines={1} style={labelStyle}>
        {action.label}
      </RNText>
      {action.shortcut !== undefined ? (
        <RNText style={shortcutStyle} accessibilityElementsHidden importantForAccessibility="no" testID="Menu.itemShortcut">
          {action.shortcut}
        </RNText>
      ) : null}
    </Pressable>
  );
}
