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
import type { LayoutChangeEvent, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetAction, ActionSheetCloseReason } from './ActionSheet';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { FocusScope } from './FocusScope';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type MenuTriggerVariant = Extract<ButtonVariant, 'ghost' | 'secondary' | 'primary'>;
export type MenuTriggerIcon = 'ellipsis' | 'chevron-down' | 'none';
export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type MenuItemTone = 'default' | 'danger';
/** Why `onOpenChange` fired. `action` (an item was chosen) always fires before `onAction`. `controlled` is a consumer-driven `open` prop change. */
export type MenuOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'action' | 'controlled';

/** A single actionable row. */
export type MenuAction = {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string;
  tone?: MenuItemTone;
  disabled?: boolean;
};
/** A labelled cluster of items, rendered with a non-interactive heading row. */
export type MenuGroup = { group: string; items: MenuItem[] };
/** A divider between clusters of items. */
export type MenuSeparator = { separator: true };
export type MenuItem = MenuAction | MenuGroup | MenuSeparator;

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type MenuOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'popupPadding'
  | 'popupOffset'
  | 'typeaheadReset'
  | 'maxHeight'
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
  | 'enter';

export interface MenuProps {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /** Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row. */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant;
  /** Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the accessible name), `chevron-down` for a labelled dropdown, `none`. */
  triggerIcon?: MenuTriggerIcon;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  iconOnly?: boolean;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  placement?: MenuPlacement;
  /** Controlled open state. Omit for an uncontrolled menu. */
  open?: boolean;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: (id: string) => void;
  /** Fired when the menu opens or closes, with the new state and why. */
  onOpenChange?: (state: { open: boolean; reason: MenuOpenChangeReason }) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef>>;
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
 * Flattens groups and drops separators for the phone (`ActionSheet`) presentation:
 * `ActionSheet` accepts only a flat action list and has no slot for a group's own
 * label row, so group labels are lost here rather than approximated by disabling a
 * fake row — see the component doc's acknowledged limits.
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

/** `ActionSheet` distinguishes four dismissal paths where `Menu` only has `escape` and `outside`; `cancel` and `drag` both collapse to `outside`. */
function mapActionSheetCloseReason(reason: ActionSheetCloseReason): MenuOpenChangeReason {
  return reason === 'escape' ? 'escape' : 'outside';
}

/** Positions the popup from the trigger's measured rect for `placement`, flipping either axis on overflow. `start`/`end` resolve against the writing direction. */
function computeMenuPosition(
  trigger: Rect,
  popupWidth: number,
  popupHeight: number,
  placement: MenuPlacement,
  windowSize: WindowSize,
  offset: number,
): { top: number; left: number } {
  const [vert, horiz] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];

  let vertical = vert;
  const spaceBelow = windowSize.height - (trigger.y + trigger.height);
  const spaceAbove = trigger.y;
  if (vertical === 'bottom' && spaceBelow < popupHeight + offset && spaceAbove > spaceBelow) {
    vertical = 'top';
  } else if (vertical === 'top' && spaceAbove < popupHeight + offset && spaceBelow > spaceAbove) {
    vertical = 'bottom';
  }

  const rtl = I18nManager.isRTL;
  let alignLeft = rtl ? horiz === 'end' : horiz === 'start';
  const spaceRightOfLeftAlign = windowSize.width - trigger.x;
  const spaceLeftOfRightAlign = trigger.x + trigger.width;
  if (alignLeft && spaceRightOfLeftAlign < popupWidth && spaceLeftOfRightAlign >= popupWidth) {
    alignLeft = false;
  } else if (!alignLeft && spaceLeftOfRightAlign < popupWidth && spaceRightOfLeftAlign >= popupWidth) {
    alignLeft = true;
  }

  return {
    top: vertical === 'bottom' ? trigger.y + trigger.height + offset : trigger.y - offset - popupHeight,
    left: alignLeft ? trigger.x : trigger.x + trigger.width - popupWidth,
  };
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
export function Menu({
  label,
  items,
  triggerVariant = 'ghost',
  triggerIcon = 'chevron-down',
  iconOnly = false,
  placement = 'bottom-start',
  open,
  onAction,
  onOpenChange,
  overrides,
}: MenuProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const windowSize = useWindowDimensions();
  const isPhoneWidth = windowSize.width <= t.layoutMaxWidthProse;

  const triggerRef = React.useRef<View>(null);
  const itemRefs = React.useRef(new Map<string, View>());
  const hasFocusedInitialRef = React.useRef(false);
  const latestItemsRef = React.useRef(items);
  latestItemsRef.current = items;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [popupSize, setPopupSize] = React.useState<{ width: number; height: number } | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  // Distinguishes an `open` prop change one of this component's own handlers already
  // reported from one the consumer made on their own; mirrors `Disclosure`'s self-echo
  // tracking so a standard `open`/`onOpenChange` pairing doesn't double-fire.
  const mountedRef = React.useRef(false);
  const previousOpenRef = React.useRef(isOpen);
  const selfEmittedRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousOpenRef.current = isOpen;
      return;
    }
    if (isControlled && previousOpenRef.current !== isOpen) {
      const wasSelfEcho = selfEmittedRef.current === isOpen;
      if (!wasSelfEcho) onOpenChange?.({ open: isOpen, reason: 'controlled' });
    }
    selfEmittedRef.current = null;
    previousOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isControlled]);

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const popupPadding = overrides?.popupPadding ? (resolveToken(t, overrides.popupPadding) as number) : t.space1;
  const popupOffset = overrides?.popupOffset ? (resolveToken(t, overrides.popupOffset) as number) : t.space1;
  const maxHeightCap = overrides?.maxHeight ? (resolveToken(t, overrides.maxHeight) as number) : t.layoutMaxWidthProse;
  // space.20 × 2.5 per the schema's own description — a multiplier, not a new token.
  const minWidth = overrides?.minWidth ? (resolveToken(t, overrides.minWidth) as number) : t.space20 * 2.5; // literal-ok: schema-specified multiplier
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

  const surfaceColor = t.colorOverlaySurface;
  const itemHoverColor = t.colorBackgroundSubtle;
  const itemColor = t.colorForeground;
  const itemDangerColor = t.colorForegroundDanger;
  const groupLabelColor = t.colorForegroundMuted;
  const shortcutColor = t.colorForegroundMuted;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;
  const triggerIconColor = t[TRIGGER_FOREGROUND[triggerVariant]];

  React.useEffect(() => {
    if (__DEV__ && items.length === 0) {
      console.warn('Menu: `items` is empty; the popup would open with nothing to choose.');
    }
  }, [items]);

  React.useEffect(() => {
    if (__DEV__ && iconOnly && triggerIcon === 'none') {
      console.warn('Menu: `iconOnly` with `triggerIcon` "none" leaves the trigger with no visible glyph.');
    }
  }, [iconOnly, triggerIcon]);

  const registerItemRef = (id: string) => (node: View | null): void => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  const focusFirstEnabledItem = React.useCallback(() => {
    const enabled = flattenActions(latestItemsRef.current).filter((action) => action.disabled !== true);
    const target = enabled[0];
    const node = target ? itemRefs.current.get(target.id) : null;
    const handle = node ? findNodeHandle(node) : null;
    if (handle !== null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, []);

  const focusTrigger = React.useCallback(() => {
    const handle = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
    if (handle !== null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, []);

  const changeOpen = (next: boolean, reason: MenuOpenChangeReason): void => {
    if (!isControlled) {
      setInternalOpen(next);
    } else {
      selfEmittedRef.current = next;
    }
    onOpenChange?.({ open: next, reason });
  };

  const closeMenu = (reason: MenuOpenChangeReason): void => {
    if (!isOpen) {
      return;
    }
    changeOpen(false, reason);
    focusTrigger();
  };

  const handleTriggerPress = (): void => {
    if (isOpen) {
      closeMenu('trigger');
      return;
    }
    changeOpen(true, 'trigger');
  };

  const handleRequestClose = (): void => {
    closeMenu('escape');
  };

  const handleScrimPress = (): void => {
    closeMenu('outside');
  };

  const handleActivate = (action: MenuAction): void => {
    if (action.disabled === true) {
      return;
    }
    closeMenu('action');
    onAction?.(action.id);
  };

  const handleSheetAction = (id: string): void => {
    closeMenu('action');
    onAction?.(id);
  };

  const handleSheetClose = (reason: ActionSheetCloseReason): void => {
    closeMenu(mapActionSheetCloseReason(reason));
  };

  const handlePopupLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setPopupSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // Measure the trigger the moment the menu opens; reset everything the moment it closes.
  React.useEffect(() => {
    if (isPhoneWidth || !isOpen) {
      hasFocusedInitialRef.current = false;
      progress.setValue(0);
      setTriggerRect(null);
      setPopupSize(null);
      return;
    }
    const node = triggerRef.current;
    node?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPhoneWidth]);

  // Once the trigger and the popup's own size are both known, fade/rise the popup in
  // (or snap under reduced motion) and move accessibility focus to the first item.
  React.useEffect(() => {
    if (isPhoneWidth || !isOpen || triggerRect === null || popupSize === null || hasFocusedInitialRef.current) {
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
      if (finished) {
        focusFirstEnabledItem();
      }
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPhoneWidth, triggerRect, popupSize, reducedMotion]);

  const popupWidth = triggerRect ? Math.max(minWidth, triggerRect.width) : minWidth;
  const popupHeight = popupSize?.height ?? 0;
  const position = triggerRect
    ? computeMenuPosition(triggerRect, popupWidth, popupHeight, placement, windowSize, popupOffset)
    : { top: 0, left: 0 };
  const maxListHeight = Math.max(0, Math.min(maxHeightCap, windowSize.height - popupOffset * 2));

  const triggerIconElement =
    triggerIcon !== 'none' ? <Icon name={triggerIcon} color={triggerIconColor} /> : undefined;

  const trigger = (
    <Button
      label={label}
      variant={triggerVariant}
      iconOnly={iconOnly}
      expanded={isOpen}
      leadingIcon={iconOnly ? triggerIconElement : undefined}
      trailingIcon={iconOnly ? undefined : triggerIconElement}
      onPress={handleTriggerPress}
    />
  );

  if (isPhoneWidth) {
    return (
      <View testID="Menu">
        {trigger}
        <ActionSheet
          open={isOpen}
          heading={label}
          actions={toActionSheetActions(items)}
          onAction={handleSheetAction}
          onClose={handleSheetClose}
        />
      </View>
    );
  }

  const hostStyle: ViewStyle = { flex: 1 };

  const popupOuterStyle: Animated.WithAnimatedObject<ViewStyle> = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: popupWidth,
    borderRadius: radius,
    ...shadow,
    zIndex: layer,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [t.space1, 0] }) }],
  };

  const popupInnerStyle: ViewStyle = {
    borderRadius: radius,
    borderWidth,
    borderColor: border,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
  };

  const listContentStyle: ViewStyle = {
    padding: popupPadding,
  };

  const groupLabelRowStyle: ViewStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingTop: t.space1,
    paddingBottom: t.space1,
  };

  const groupLabelStyle: TextStyle = {
    fontFamily,
    fontSize: groupLabelSize,
    fontWeight: toFontWeight(groupLabelWeight),
    lineHeight: toLineHeight(groupLabelSize, t.fontLineHeightNormal),
    color: groupLabelColor,
  };

  const separatorStyle: ViewStyle = {
    marginVertical: separatorMargin,
    borderBottomWidth: t.borderWidthThin,
    borderBottomColor: separatorColor,
  };

  const itemRowStyle = (focused: boolean, disabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: itemGap,
    minHeight: t.sizeTargetMin,
    paddingVertical: itemPaddingBlock,
    paddingHorizontal: itemPaddingInline,
    borderRadius: itemRadius,
    backgroundColor: focused ? itemHoverColor : 'transparent',
    borderWidth: focusRingWidth,
    borderColor: focused ? focusRingColor : 'transparent',
    opacity: disabled ? t.opacityDisabled : 1,
  });

  const itemLabelStyle = (danger: boolean): TextStyle => ({
    flexShrink: 1,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: danger ? itemDangerColor : itemColor,
  });

  const shortcutStyle: TextStyle = {
    marginLeft: 'auto', // literal-ok: flexbox keyword, not a size value
    fontFamily,
    fontSize: shortcutSize,
    lineHeight: toLineHeight(shortcutSize, t.fontLineHeightNormal),
    color: shortcutColor,
  };

  function renderAction(action: MenuAction, path: string): React.JSX.Element {
    const disabled = action.disabled === true;
    const danger = action.tone === 'danger';
    return (
      <MenuActionRow
        key={path}
        action={action}
        disabled={disabled}
        registerRef={registerItemRef(action.id)}
        rowStyle={itemRowStyle}
        labelStyle={itemLabelStyle(danger)}
        shortcutStyle={shortcutStyle}
        iconColor={danger ? itemDangerColor : itemColor}
        onActivate={() => handleActivate(action)}
      />
    );
  }

  function renderNode(node: MenuItem, path: string): React.JSX.Element {
    if ('separator' in node) {
      return <View key={path} style={separatorStyle} testID="Menu.separator" />;
    }
    if ('group' in node) {
      return (
        <View key={path}>
          <View style={groupLabelRowStyle}>
            <RNText style={groupLabelStyle}>{node.group}</RNText>
          </View>
          {node.items.map((child, index) => renderNode(child, `${path}-${index}`))}
        </View>
      );
    }
    return renderAction(node, path);
  }

  return (
    <View testID="Menu">
      {/* `collapsable={false}` keeps this View in the native tree on Android so measureInWindow stays reliable. */}
      <View ref={triggerRef} collapsable={false}>
        {trigger}
      </View>
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleRequestClose} statusBarTranslucent>
        <View style={hostStyle}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleScrimPress}
            accessible={false}
            testID="Menu.scrim"
          />
          {triggerRect !== null ? (
            <FocusScope trapped active={isOpen} autoFocus="none" restoreFocus={false}>
              <Animated.View
                style={popupOuterStyle}
                onLayout={handlePopupLayout}
                accessibilityViewIsModal
                accessibilityRole="menu"
                accessibilityLabel={label}
                testID="Menu.popup"
              >
                <View style={popupInnerStyle}>
                  <ScrollView style={{ maxHeight: maxListHeight }} contentContainerStyle={listContentStyle}>
                    {items.map((item, index) => renderNode(item, String(index)))}
                  </ScrollView>
                </View>
              </Animated.View>
            </FocusScope>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

interface MenuActionRowProps {
  action: MenuAction;
  disabled: boolean;
  registerRef: (node: View | null) => void;
  rowStyle: (focused: boolean, disabled: boolean) => ViewStyle;
  labelStyle: TextStyle;
  shortcutStyle: TextStyle;
  iconColor: string;
  onActivate: () => void;
}

/** One menu row. Its own component so focus/hover state does not re-render the whole list. */
function MenuActionRow({
  action,
  disabled,
  registerRef,
  rowStyle,
  labelStyle,
  shortcutStyle,
  iconColor,
  onActivate,
}: MenuActionRowProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);

  return (
    <Pressable
      ref={registerRef}
      accessibilityRole="menuitem"
      accessibilityLabel={action.label}
      accessibilityState={{ disabled }}
      // Never the native `disabled` prop: it would drop the row from the focus order.
      onPress={() => {
        if (!disabled) {
          onActivate();
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={rowStyle(focused, disabled)}
    >
      {action.icon !== undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={action.icon} color={iconColor} />
        </View>
      ) : null}
      <RNText numberOfLines={1} style={labelStyle}>
        {action.label}
      </RNText>
      {action.shortcut !== undefined ? (
        <RNText style={shortcutStyle} accessibilityElementsHidden importantForAccessibility="no">
          {action.shortcut}
        </RNText>
      ) : null}
    </Pressable>
  );
}
