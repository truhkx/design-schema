import * as React from 'react';
import { AccessibilityInfo, Platform, Text as RNText, View } from 'react-native';
import type { TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type AlertOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'padding'
  | 'gap'
  | 'partGap'
  | 'iconSize'
  | 'headingSize'
  | 'headingWeight'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'dismissMargin';

export interface AlertProps {
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

const COPY = {
  dismissLabel: 'Dismiss',
} as const;

const TONE_TOKENS = {
  info: {
    background: 'colorStatusInfoBackground',
    foreground: 'colorStatusInfoForeground',
    border: 'colorStatusInfoBorder',
  },
  success: {
    background: 'colorStatusSuccessBackground',
    foreground: 'colorStatusSuccessForeground',
    border: 'colorStatusSuccessBorder',
  },
  warning: {
    background: 'colorStatusWarningBackground',
    foreground: 'colorStatusWarningForeground',
    border: 'colorStatusWarningBorder',
  },
  danger: {
    background: 'colorStatusDangerBackground',
    foreground: 'colorStatusDangerForeground',
    border: 'colorStatusDangerBorder',
  },
} as const satisfies Record<AlertTone, Record<'background' | 'foreground' | 'border', keyof Tokens>>;

/** `icon` binding, forwarded to the Icon as `overrides.color`. */
const ICON_COLOR = {
  info: 'color.status.info.icon',
  success: 'color.status.success.icon',
  warning: 'color.status.warning.icon',
  danger: 'color.status.danger.icon',
} as const satisfies Record<AlertTone, TokenRef>;

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
export function Alert({
  tone = 'info',
  heading,
  children,
  live = 'status',
  dismissible = false,
  overrides,
  onDismiss,
  ref,
}: AlertProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const colors = TONE_TOKENS[tone];

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t[colors.border];
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const padding = overrides?.padding ? (resolveToken(t, overrides.padding) as number) : t.spaceMd;
  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.space3;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const iconSizeRef: TokenRef = overrides?.iconSize ?? 'font.size.lg';
  const iconSize = resolveToken(t, iconSizeRef) as number;
  const headingSize = overrides?.headingSize ? (resolveToken(t, overrides.headingSize) as number) : t.fontSizeMd;
  const headingWeight = overrides?.headingWeight ? (resolveToken(t, overrides.headingWeight) as number) : t.fontWeightSemibold;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const dismissMargin = overrides?.dismissMargin ? (resolveToken(t, overrides.dismissMargin) as number) : t.space1;

  const bodyText = typeof children === 'string' ? children : undefined;
  const announcement = [heading, bodyText]
    .filter((part): part is string => part !== undefined && part !== '')
    .join('. ');

  // iOS has no live regions: announce when the alert enters the tree and whenever
  // the heading or body changes. Android is covered by accessibilityLiveRegion.
  React.useEffect(() => {
    if (Platform.OS === 'ios' && live !== 'off' && announcement !== '') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announcement, live]);

  const bodyLineHeight = toLineHeight(fontSize, lineHeightMultiplier);
  const headingLineHeight = toLineHeight(headingSize, lineHeightMultiplier);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap,
    padding,
    borderWidth,
    borderColor: border,
    borderRadius: radius,
    backgroundColor: t[colors.background],
  };

  // Centre the glyph on the first line of text so it lines up with the heading (or body).
  const iconCellStyle: ViewStyle = {
    height: Math.max(heading !== undefined ? headingLineHeight : bodyLineHeight, iconSize),
    justifyContent: 'center',
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: partGap,
  };

  const headingStyle: TextStyle = {
    fontFamily,
    fontSize: headingSize,
    fontWeight: toFontWeight(headingWeight),
    lineHeight: headingLineHeight,
    color: t[colors.foreground],
  };

  // A string body is the system Text (tone default = color.foreground, the locked
  // bodyColor); the typography bindings reach it through its own overrides.
  const bodyOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };

  // dismissMargin: a negative block/inline-end margin so the Button's target sits in
  // the corner without enlarging the padding. The Button itself is not restyled.
  const dismissStyle: ViewStyle = {
    marginTop: -dismissMargin,
    marginEnd: -dismissMargin,
  };

  return (
    <View
      ref={ref}
      testID="Alert"
      accessibilityRole={live === 'alert' ? 'alert' : undefined}
      accessibilityLiveRegion={live === 'alert' ? 'assertive' : live === 'status' ? 'polite' : undefined}
      accessibilityLabel={announcement !== '' ? announcement : undefined}
      style={containerStyle}
    >
      <View testID="Alert.icon" style={iconCellStyle} accessibilityElementsHidden importantForAccessibility="no">
        <Icon name={tone} overrides={{ color: ICON_COLOR[tone], size: iconSizeRef }} />
      </View>
      <View style={contentStyle}>
        {heading !== undefined ? (
          <RNText testID="Alert.heading" allowFontScaling style={headingStyle}>
            {heading}
          </RNText>
        ) : null}
        <View testID="Alert.body">
          {typeof children === 'string' ? <Text overrides={bodyOverrides}>{children}</Text> : children}
        </View>
      </View>
      {dismissible ? (
        <View testID="Alert.dismissButton" style={dismissStyle}>
          <Button
            label={COPY.dismissLabel}
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
            onPress={onDismiss}
          />
        </View>
      ) : null}
    </View>
  );
}
