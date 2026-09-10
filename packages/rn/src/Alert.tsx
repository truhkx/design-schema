import * as React from 'react';
import { AccessibilityInfo, Platform, Text as RNText, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

export interface AlertProps {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  tone?: AlertTone;
  /** A short bold first line for the message. Optional for one-line messages. Named `heading`, not `title`, because `title` is a native attribute on every platform element. */
  heading?: string;
  /** The message body. Text and Links; no headings or form controls. */
  children: React.ReactNode;
  /** How the alert is announced when it appears. `status` is polite, `alert` interrupts (only for errors that block the user), `off` for alerts already present when the view loads. Never use `alert` for success or info. */
  live?: AlertLive;
  /** Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert. */
  dismissible?: boolean;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: () => void;
}

const COPY = {
  dismissLabel: 'Dismiss',
} as const;

/** Decorative glyph passed to the dismiss Button as `leadingIcon`. */
const DISMISS_GLYPH = '×';

const TONE_TOKENS = {
  info: {
    background: 'colorStatusInfoBackground',
    foreground: 'colorStatusInfoForeground',
    border: 'colorStatusInfoBorder',
    icon: 'colorStatusInfoIcon',
  },
  success: {
    background: 'colorStatusSuccessBackground',
    foreground: 'colorStatusSuccessForeground',
    border: 'colorStatusSuccessBorder',
    icon: 'colorStatusSuccessIcon',
  },
  warning: {
    background: 'colorStatusWarningBackground',
    foreground: 'colorStatusWarningForeground',
    border: 'colorStatusWarningBorder',
    icon: 'colorStatusWarningIcon',
  },
  danger: {
    background: 'colorStatusDangerBackground',
    foreground: 'colorStatusDangerForeground',
    border: 'colorStatusDangerBorder',
    icon: 'colorStatusDangerIcon',
  },
} as const satisfies Record<AlertTone, Record<'background' | 'foreground' | 'border' | 'icon', keyof Tokens>>;

/** Decorative glyphs standing in for the info circle, check circle, warning triangle and error octagon. */
const TONE_GLYPH: Record<AlertTone, string> = {
  info: 'ⓘ',
  success: '✓',
  warning: '▲',
  danger: '⨂',
};

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
 * Colors come from the `color.status.{tone}.*` tokens; the icon is decorative. The
 * dismiss button is the system `Button` (`ghost`, `sm`, `iconOnly`, labelled
 * `copy.dismissLabel`, with a × glyph as `leadingIcon`), pulled into the corner by
 * `dismissMargin`; it fires `onDismiss` only and the consumer removes the alert.
 * Moving focus to the next element before removal is not possible on native.
 */
export function Alert({
  tone = 'info',
  heading,
  children,
  live = 'status',
  dismissible = false,
  onDismiss,
}: AlertProps): React.JSX.Element {
  const { tokens } = useTheme();
  const colors = TONE_TOKENS[tone];
  const background = tokens[colors.background];
  const foreground = tokens[colors.foreground];
  const border = tokens[colors.border];
  const icon = tokens[colors.icon];

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

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space3,
    padding: tokens.spaceMd,
    borderWidth: tokens.borderWidthThin,
    borderColor: border,
    borderRadius: tokens.radiusMd,
    backgroundColor: background,
  };

  const lineHeight = toLineHeight(tokens.fontSizeMd, tokens.fontLineHeightNormal);

  const iconCellStyle: ViewStyle = {
    height: lineHeight,
    justifyContent: 'center',
  };

  const iconStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeLg,
    lineHeight: tokens.fontSizeLg,
    color: icon,
    includeFontPadding: false,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    gap: tokens.space1,
  };

  const headingStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeMd,
    fontWeight: toFontWeight(tokens.fontWeightSemibold),
    lineHeight,
    color: foreground,
  };

  // dismissMargin: a negative block/inline-end margin so the Button's target sits
  // in the corner without enlarging the padding. The Button keeps its own colors,
  // radius and focus ring; only the glyph it is handed is styled here.
  const dismissStyle: ViewStyle = {
    marginTop: -tokens.space1,
    marginRight: -tokens.space1,
  };
  const dismissGlyphStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeLg,
    lineHeight: tokens.fontSizeLg,
    color: tokens.colorActionGhostForeground,
    includeFontPadding: false,
  };

  return (
    <View
      accessibilityRole={live === 'alert' ? 'alert' : undefined}
      accessibilityLiveRegion={live === 'alert' ? 'assertive' : live === 'status' ? 'polite' : undefined}
      accessibilityLabel={announcement !== '' ? announcement : undefined}
      style={containerStyle}
    >
      <View style={iconCellStyle} accessibilityElementsHidden importantForAccessibility="no">
        <RNText allowFontScaling={false} style={iconStyle}>
          {TONE_GLYPH[tone]}
        </RNText>
      </View>
      <View style={contentStyle}>
        {heading !== undefined ? (
          <RNText allowFontScaling style={headingStyle}>
            {heading}
          </RNText>
        ) : null}
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </View>
      {dismissible ? (
        <View style={dismissStyle}>
          <Button
            label={COPY.dismissLabel}
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={
              <RNText allowFontScaling={false} style={dismissGlyphStyle}>
                {DISMISS_GLYPH}
              </RNText>
            }
            onPress={onDismiss}
          />
        </View>
      ) : null}
    </View>
  );
}
