import * as React from "react";
import { AccessibilityInfo, Animated, Easing, FlatList, I18nManager, KeyboardAvoidingView, Linking, Modal, PanResponder, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch as Switch$1, Text as Text$1, TextInput, View, findNodeHandle, useColorScheme, useWindowDimensions } from "react-native";
import * as light from "@design-schema/tokens/calm-precise/rn/light";
import * as dark from "@design-schema/tokens/calm-precise/rn/dark";
import { resolveToken } from "@design-schema/tokens";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
//#region src/theme.tsx
const THEMES = {
	light: {
		mode: "light",
		tokens: light
	},
	dark: {
		mode: "dark",
		tokens: dark
	}
};
const ThemeContext = React.createContext(null);
/**
* Calm & precise theme provider for React Native.
*
* Selects the light or dark token module and exposes it through `useTheme()`.
* `mode="system"` (the default) resolves through React Native's `useColorScheme()`.
*/
function ThemeProvider({ mode = "system", children }) {
	const scheme = useColorScheme();
	const resolved = mode === "system" ? scheme === "dark" ? "dark" : "light" : mode;
	return /* @__PURE__ */ React.createElement(ThemeContext.Provider, { value: THEMES[resolved] }, children);
}
/**
* Returns the active `{ mode, tokens }`.
*
* Works without a provider by following the OS appearance, so components never
* fall back to hard-coded values.
*/
function useTheme() {
	const context = React.useContext(ThemeContext);
	const scheme = useColorScheme();
	if (context !== null) return context;
	return THEMES[scheme === "dark" ? "dark" : "light"];
}
/**
* Converts a numeric `font.weight.*` token (400, 500, 600, 700) into React Native's
* `fontWeight` union. The token module types weights as `number`, which is not
* assignable to `TextStyle['fontWeight']` under strict mode.
*/
function toFontWeight(value) {
	switch (Math.round(value / 100) * 100) {
		case 100: return "100";
		case 200: return "200";
		case 300: return "300";
		case 400: return "400";
		case 500: return "500";
		case 600: return "600";
		case 700: return "700";
		case 800: return "800";
		case 900: return "900";
		default: return "normal";
	}
}
/**
* React Native `lineHeight` is an absolute size, while the `font.lineHeight.*`
* tokens are unitless multipliers. Resolve them against the font size.
*/
function toLineHeight(fontSize, multiplier) {
	return Math.round(fontSize * multiplier);
}
/**
* Converts a `motion.easing.*` token (a cubic-bézier as four numbers) into an
* `Animated` easing function. Anything that is not four numbers falls back to
* `Easing.linear` rather than a hand-written curve.
*/
function toEasing(value) {
	const [x1, y1, x2, y2] = value;
	if (x1 === void 0 || y1 === void 0 || x2 === void 0 || y2 === void 0) return Easing.linear;
	return Easing.bezier(x1, y1, x2, y2);
}
/**
* Whether the person has asked the OS to reduce motion. Resolves asynchronously on
* first render (assume `false` until then) and follows later changes, so components
* can skip `Animated` transitions and set their final value directly.
*/
function useReducedMotion() {
	const [reduced, setReduced] = React.useState(false);
	React.useEffect(() => {
		let active = true;
		AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
			if (active) setReduced(enabled);
		}).catch(() => void 0);
		const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
		return () => {
			active = false;
			subscription.remove();
		};
	}, []);
	return reduced;
}
//#endregion
//#region src/FormContext.tsx
const FormContext = React.createContext(null);
function useFormContext() {
	return React.useContext(FormContext);
}
//#endregion
//#region src/custom/analytics.ts
/**
* Hand-written module declared by site/src/content/docs/extensions/Button.analytics.md.
* The generator imports `trackPress` from here and calls it; it never edits this file.
* Replace the body with the analytics vendor of your choice; keep the signature.
*/
function trackPress(name, label) {
	if (__DEV__) console.debug("[analytics] press", name, label);
}
//#endregion
//#region src/Button.tsx
const VARIANT_TOKENS = {
	primary: {
		background: "colorActionPrimaryBackground",
		backgroundHover: "colorActionPrimaryBackgroundHover",
		foreground: "colorActionPrimaryForeground"
	},
	secondary: {
		background: "colorActionSecondaryBackground",
		backgroundHover: "colorActionSecondaryBackgroundHover",
		foreground: "colorActionSecondaryForeground"
	},
	ghost: {
		background: "colorActionGhostBackground",
		backgroundHover: "colorActionGhostBackgroundHover",
		foreground: "colorActionGhostForeground"
	},
	danger: {
		background: "colorActionDangerBackground",
		backgroundHover: "colorActionDangerBackgroundHover",
		foreground: "colorActionDangerForeground"
	}
};
const PADDING_INLINE_TOKEN = {
	sm: "spaceSm",
	md: "spaceMd",
	lg: "spaceLg"
};
const FONT_SIZE_TOKEN$5 = {
	sm: "fontSizeSm",
	md: "fontSizeMd",
	lg: "fontSizeLg"
};
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
function Button({ label, variant = "primary", size = "md", type = "button", expanded, disabled = false, leadingIcon, trailingIcon, iconOnly = false, loading = false, inverse = false, accessibleName, track, overrides, onPress, onTrack }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const [focused, setFocused] = React.useState(false);
	const [pressedState, setPressedState] = React.useState(false);
	const [layout, setLayout] = React.useState(null);
	const isDisabled = disabled || (form?.disabled ?? false);
	const colors = VARIANT_TOKENS[variant];
	const background = t[colors.background];
	const backgroundHover = overrides?.backgroundHover ? resolveToken(t, overrides.backgroundHover) : t[colors.backgroundHover];
	const foreground = variant === "ghost" && inverse ? t.colorInverseLink : t[colors.foreground];
	const focusRingColor = inverse ? t.colorInverseFocus : t.colorBorderFocus;
	const iconGap = overrides?.iconGap ? resolveToken(t, overrides.iconGap) : t.space2;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : iconOnly ? t.spaceSm : t[PADDING_INLINE_TOKEN[size]];
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightMedium;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$5[size]];
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const loadingSpinDuration = overrides?.loadingSpin ? resolveToken(t, overrides.loadingSpin) : t.motionDurationLoop;
	const spinnerStroke = overrides?.spinnerStroke ? resolveToken(t, overrides.spinnerStroke) : t.borderWidthFocus;
	const highlight = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		const toValue = pressedState && !isDisabled && !loading ? 1 : 0;
		if (reducedMotion) {
			highlight.setValue(toValue);
			return;
		}
		Animated.timing(highlight, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		pressedState,
		isDisabled,
		loading,
		reducedMotion,
		highlight,
		transitionDuration,
		t.motionEasingStandard
	]);
	const animatedBackground = highlight.interpolate({
		inputRange: [0, 1],
		outputRange: [background, backgroundHover]
	});
	const spin = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		if (!loading || reducedMotion) {
			spin.setValue(0);
			return;
		}
		const loopAnimation = Animated.loop(Animated.timing(spin, {
			toValue: 1,
			duration: loadingSpinDuration,
			easing: Easing.linear,
			useNativeDriver: Platform.OS !== "web"
		}));
		loopAnimation.start();
		return () => loopAnimation.stop();
	}, [
		loading,
		reducedMotion,
		spin,
		loadingSpinDuration
	]);
	const slop = (extent) => Math.max(0, Math.ceil((t.sizeTargetComfortable - (extent ?? t.sizeTargetMin)) / 2));
	const hitSlop = {
		top: slop(layout?.height),
		bottom: slop(layout?.height),
		left: slop(layout?.width),
		right: slop(layout?.width)
	};
	const handleLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setLayout((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	const handlePress = () => {
		if (isDisabled || loading) return;
		onPress?.();
		if (track !== void 0) {
			trackPress(track, label);
			onTrack?.({
				name: track,
				label
			});
		}
		if (type === "submit") form?.submit();
	};
	const containerStyle = {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minWidth: t.sizeTargetMin,
		minHeight: t.sizeTargetMin,
		gap: iconGap,
		paddingHorizontal: paddingInline,
		paddingVertical: paddingBlock,
		borderRadius: radius,
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? focusRingColor : "transparent",
		opacity: isDisabled ? disabledOpacity : 1
	};
	const backgroundFillStyle = {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		borderRadius: radius,
		backgroundColor: animatedBackground
	};
	const labelStyle = {
		fontFamily,
		fontWeight: toFontWeight(fontWeight),
		fontSize,
		color: foreground,
		textAlign: "center"
	};
	const iconSlotStyle = {
		alignItems: "center",
		justifyContent: "center"
	};
	const spinnerStyle = {
		width: fontSize,
		height: fontSize,
		borderRadius: fontSize / 2,
		borderWidth: spinnerStroke,
		borderColor: foreground,
		borderTopColor: "transparent",
		transform: [{ rotate: spin.interpolate({
			inputRange: [0, 1],
			outputRange: ["0deg", "360deg"]
		}) }]
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Button",
		accessibilityRole: "button",
		accessibilityLabel: accessibleName ?? label,
		accessibilityState: expanded === void 0 ? {
			disabled: isDisabled,
			busy: loading
		} : {
			disabled: isDisabled,
			busy: loading,
			expanded
		},
		hitSlop,
		onPress: handlePress,
		onPressIn: () => setPressedState(true),
		onPressOut: () => setPressedState(false),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onLayout: handleLayout,
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: backgroundFillStyle,
		pointerEvents: "none"
	}), loading ? /* @__PURE__ */ React.createElement(View, {
		style: iconSlotStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: spinnerStyle })) : leadingIcon !== void 0 && leadingIcon !== null ? /* @__PURE__ */ React.createElement(View, {
		style: iconSlotStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, leadingIcon) : null, iconOnly ? null : /* @__PURE__ */ React.createElement(Text$1, {
		allowFontScaling: true,
		style: labelStyle
	}, label), !iconOnly && !loading && trailingIcon !== void 0 && trailingIcon !== null ? /* @__PURE__ */ React.createElement(View, {
		style: iconSlotStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, trailingIcon) : null);
}
//#endregion
//#region src/Text.tsx
const SIZE_TOKEN$2 = {
	xs: "fontSizeXs",
	sm: "fontSizeSm",
	md: "fontSizeMd",
	lg: "fontSizeLg",
	xl: "fontSizeXl"
};
const WEIGHT_TOKEN = {
	regular: "fontWeightRegular",
	medium: "fontWeightMedium",
	semibold: "fontWeightSemibold",
	bold: "fontWeightBold"
};
const TONE_TOKEN = {
	default: "colorForeground",
	strong: "colorForegroundStrong",
	muted: "colorForegroundMuted",
	danger: "colorForegroundDanger",
	onAction: "colorForegroundOnAction"
};
const TextStyleContext = React.createContext({
	fontSize: 0,
	color: "",
	nested: false
});
/** Resolves `start`/`end` against the current writing direction, since RN's `textAlign` has no logical values. */
function toTextAlign(align) {
	if (align === "center") return "center";
	const rtl = I18nManager.isRTL;
	if (align === "start") return rtl ? "right" : "left";
	return rtl ? "left" : "right";
}
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
function Text({ children, size = "md", weight = "regular", tone = "default", align = "start", truncate = false, overrides }) {
	const { tokens: t } = useTheme();
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[SIZE_TOKEN$2[size]];
	const color = overrides?.color ? resolveToken(t, overrides.color) : t[TONE_TOKEN[tone]];
	const style = React.useMemo(() => {
		const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
		const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t[WEIGHT_TOKEN[weight]];
		return {
			fontFamily: overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody,
			fontSize,
			fontWeight: toFontWeight(fontWeight),
			lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
			color,
			textAlign: toTextAlign(align)
		};
	}, [
		t,
		weight,
		align,
		overrides,
		fontSize,
		color
	]);
	const contextValue = React.useMemo(() => ({
		fontSize,
		color,
		nested: true
	}), [fontSize, color]);
	return /* @__PURE__ */ React.createElement(Text$1, {
		testID: "Text",
		allowFontScaling: true,
		numberOfLines: truncate ? 1 : void 0,
		ellipsizeMode: truncate ? "tail" : void 0,
		style
	}, /* @__PURE__ */ React.createElement(TextStyleContext.Provider, { value: contextValue }, children));
}
//#endregion
//#region src/Heading.tsx
const LEVEL_SIZE = {
	"1": "4xl",
	"2": "3xl",
	"3": "2xl",
	"4": "xl",
	"5": "lg",
	"6": "md"
};
const SIZE_TOKEN$1 = {
	"4xl": "fontSize4xl",
	"3xl": "fontSize3xl",
	"2xl": "fontSize2xl",
	xl: "fontSizeXl",
	lg: "fontSizeLg",
	md: "fontSizeMd"
};
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
function Heading({ level, size, children, align = "start", overrides }) {
	const { tokens: t } = useTheme();
	const resolvedSize = size ?? LEVEL_SIZE[String(level)];
	const defaultFontSize = t[SIZE_TOKEN$1[resolvedSize]];
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : defaultFontSize;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightTight;
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightSemibold;
	const style = {
		fontFamily: overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyHeading,
		fontWeight: toFontWeight(fontWeight),
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: t.colorForegroundStrong,
		marginBottom: overrides?.marginBlockEnd ? resolveToken(t, overrides.marginBlockEnd) : t.spaceSm,
		textAlign: toTextAlign(align)
	};
	return /* @__PURE__ */ React.createElement(Text$1, {
		accessibilityRole: "header",
		allowFontScaling: true,
		style,
		testID: "Heading"
	}, children);
}
//#endregion
//#region src/Stack.tsx
const GAP_TOKEN = {
	none: "layoutGapNone",
	tight: "layoutGapTight",
	normal: "layoutGapNormal",
	loose: "layoutGapLoose",
	section: "layoutGapSection"
};
const ALIGN = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	stretch: "stretch"
};
const JUSTIFY = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	between: "space-between"
};
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
function Stack({ children, direction = "vertical", gap = "normal", align = "stretch", justify = "start", wrap = false, overrides }) {
	const { tokens: t } = useTheme();
	const style = React.useMemo(() => ({
		flexDirection: direction === "horizontal" ? "row" : "column",
		gap: overrides?.gap ? resolveToken(t, overrides.gap) : t[GAP_TOKEN[gap]],
		alignItems: ALIGN[align],
		justifyContent: JUSTIFY[justify],
		flexWrap: wrap ? "wrap" : "nowrap"
	}), [
		t,
		direction,
		gap,
		align,
		justify,
		wrap,
		overrides
	]);
	return /* @__PURE__ */ React.createElement(View, {
		style,
		testID: "Stack"
	}, children);
}
//#endregion
//#region src/Fieldset.tsx
/** `null` outside of a Fieldset so every field works standalone. */
const FieldsetContext = React.createContext(null);
function useFieldsetContext() {
	return React.useContext(FieldsetContext);
}
const COPY$29 = { requiredIndicator: " (required)" };
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
function Fieldset({ legend, children, description, error, disabled = false, gap = "normal", overrides }) {
	const { tokens: t } = useTheme();
	React.useEffect(() => {
		if (Platform.OS === "ios" && error !== void 0 && error !== "") AccessibilityInfo.announceForAccessibility(error);
	}, [error]);
	const fieldElements = React.Children.toArray(children).filter(React.isValidElement);
	const visibleLegend = fieldElements.length > 0 && fieldElements.every((child) => child.props.required === true) ? `${legend}${COPY$29.requiredIndicator}` : legend;
	const contextValue = React.useMemo(() => ({
		legend,
		disabled
	}), [legend, disabled]);
	const renderedChildren = disabled ? React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child, { disabled: true }) : child) : children;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapTight;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const legendOverrides = {
		...typographyOverrides,
		fontSize: overrides?.legendSize,
		fontWeight: overrides?.legendWeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	const groupStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: disabled ? disabledOpacity : 1
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Fieldset",
		role: "group",
		accessibilityLabel: visibleLegend,
		accessibilityHint: description,
		accessibilityState: { disabled },
		style: groupStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: legendOverrides
	}, visibleLegend), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, /* @__PURE__ */ React.createElement(FieldsetContext.Provider, { value: contextValue }, /* @__PURE__ */ React.createElement(Stack, {
		gap,
		overrides: overrides?.fieldsGap ? { gap: overrides.fieldsGap } : void 0
	}, renderedChildren)), error !== void 0 && error !== "" ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: "assertive" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, error)) : null);
}
//#endregion
//#region src/Input.tsx
const KEYBOARD_TYPE = {
	text: "default",
	email: "email-address",
	password: "default",
	number: "numeric",
	search: "default",
	tel: "phone-pad",
	url: "url"
};
const TEXT_CONTENT_TYPE = {
	text: "none",
	email: "emailAddress",
	password: "password",
	number: "none",
	search: "none",
	tel: "telephoneNumber",
	url: "URL"
};
/** Types whose values must not be auto-capitalized or auto-corrected by the keyboard. */
const VERBATIM_TYPES = /* @__PURE__ */ new Set([
	"email",
	"password",
	"url"
]);
const FONT_SIZE_TOKEN$4 = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
const COPY$28 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)"
};
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
function Input({ label, name, value, defaultValue, placeholder, description, type = "text", required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, onChange, onFocus, onBlur }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const inputRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
	const [focused, setFocused] = React.useState(false);
	const currentValue = value ?? internalValue;
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate.trim() === "") return COPY$28.required(label);
		if (invalid) return COPY$28.invalid(label);
		return null;
	}, [
		required,
		label,
		error,
		invalid
	]);
	const latest = React.useRef({
		currentValue,
		validateValue
	});
	latest.current = {
		currentValue,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.currentValue,
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => {
			const input = inputRef.current;
			if (input === null) return;
			input.focus();
			const node = findNodeHandle(input);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const handleChangeText = (next) => {
		if (value === void 0) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(next));
	};
	const handleFocus = (event) => {
		setFocused(true);
		onFocus?.(event);
	};
	const handleBlur = (event) => {
		setFocused(false);
		onBlur?.(event);
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	const position = form === null ? -1 : form.order.indexOf(name);
	const isLast = form !== null && position !== -1 && position === form.order.length - 1;
	const nextName = form !== null && position !== -1 ? form.order[position + 1] : void 0;
	const returnKeyType = form === null ? void 0 : isLast ? "done" : "next";
	const handleSubmitEditing = () => {
		if (form === null) return;
		if (isLast) form.submit();
		else if (nextName !== void 0) form.focusField(nextName);
	};
	const visibleLabel = required ? `${label}${COPY$28.requiredIndicator}` : label;
	const accessibleLabel = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
	const borderFocusColor = overrides?.borderFocus ? resolveToken(t, overrides.borderFocus) : t.colorBorderFocus;
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = size === "sm" ? overrides?.paddingInlineSm ? resolveToken(t, overrides.paddingInlineSm) : t.space2 : overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const paddingBlock = size === "sm" ? overrides?.paddingBlockSm ? resolveToken(t, overrides.paddingBlockSm) : t.space1 : overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const minTarget = size === "sm" ? overrides?.minTargetSm ? resolveToken(t, overrides.minTargetSm) : t.sizeTargetMin : t.sizeTargetComfortable;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$4[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const inset = t.borderWidthFocus - borderWidth;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldStyle = {
		minHeight: minTarget,
		backgroundColor: t.colorBackground,
		color: t.colorForeground,
		borderWidth: activeBorderWidth,
		borderColor: focused ? borderFocusColor : isInvalid ? borderInvalidColor : t.colorBorderStrong,
		borderRadius: radius,
		paddingHorizontal: paddingInline + inset,
		paddingVertical: paddingBlock + inset,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier)
	};
	const helperOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.helperSize,
		lineHeight: overrides?.lineHeight
	};
	return /* @__PURE__ */ React.createElement(View, {
		style: containerStyle,
		testID: "Input"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: {
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.fontSize,
			fontWeight: overrides?.labelWeight,
			lineHeight: overrides?.lineHeight
		}
	}, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		accessibilityLabel: accessibleLabel,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		keyboardType: KEYBOARD_TYPE[type],
		textContentType: TEXT_CONTENT_TYPE[type],
		secureTextEntry: type === "password",
		autoCapitalize: VERBATIM_TYPES.has(type) ? "none" : "sentences",
		autoCorrect: !VERBATIM_TYPES.has(type),
		allowFontScaling: true,
		editable: !isDisabled,
		value: currentValue,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		returnKeyType,
		blurOnSubmit: isLast,
		onSubmitEditing: handleSubmitEditing,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		style: fieldStyle
	}), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: summarised ? "none" : "assertive" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null);
}
//#endregion
//#region src/paths.ts
/**
* Glyphs drawn on a 16×16 grid, keyed by `name` — the same grid and `d` data as the
* web/Lit `paths` table, so swapping platforms stays visually neutral. Line glyphs
* (check, dash, chevrons, close, plus, minus, external, search, arrows, calendar,
* menu, list, grid, folder, file) inherit the root `<Svg>`'s `fill="none"
* stroke={color}`. Filled glyphs (the four status shapes, ellipsis, play, pause) set
* `fill={color} stroke="none"`; the status shapes are single `fillRule="evenodd"`
* paths whose inner mark (i, check, !, x) is a hole.
*
* Icon renders `<Icon name>`; nothing else should import this table.
*/
const paths = {
	check: { d: "M3 8.5l3.5 3.5L13 5" },
	dash: { d: "M4 8h8" },
	"chevron-right": { d: "M6 3l5 5-5 5" },
	"chevron-down": { d: "M3 6l5 5 5-5" },
	"chevron-up": { d: "M3 10l5-5 5 5" },
	"chevron-left": { d: "M10 3L5 8l5 5" },
	close: { d: "M3 3l10 10M13 3L3 13" },
	plus: { d: "M8 3v10M3 8h10" },
	minus: { d: "M3 8h10" },
	info: {
		filled: true,
		d: "M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
	},
	success: {
		filled: true,
		d: "M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
	},
	warning: {
		filled: true,
		d: "M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
	},
	danger: {
		filled: true,
		d: "M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
	},
	external: { d: "M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" },
	ellipsis: {
		filled: true,
		d: "M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
	},
	search: { d: "M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" },
	"arrow-right": { d: "M3 8h10M9 4l4 4-4 4" },
	"arrow-left": { d: "M13 8H3M7 4L3 8l4 4" },
	calendar: { d: "M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" },
	menu: { d: "M2 4h12M2 8h12M2 12h12" },
	list: { d: "M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" },
	grid: { d: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" },
	play: {
		filled: true,
		d: "M4 2l10 6-10 6z"
	},
	pause: {
		filled: true,
		d: "M3 2h3v12H3zM10 2h3v12H10z"
	},
	folder: { d: "M2 13V2h5v2h7v9z" },
	file: { d: "M4 2h5l3 3v9H4zM9 2v3h3" }
};
//#endregion
//#region src/Icon.tsx
const SIZE_TOKEN = {
	xs: "fontSizeXs",
	sm: "fontSizeSm",
	md: "fontSizeMd",
	lg: "fontSizeLg",
	xl: "fontSizeXl"
};
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
function Icon({ name, size = "md", inline = false, label, color, overrides }) {
	const { tokens: t } = useTheme();
	const textStyle = React.useContext(TextStyleContext);
	const decorative = label === void 0 || label === "";
	const dimension = inline ? textStyle.nested ? textStyle.fontSize : t.fontSizeMd : overrides?.size ? resolveToken(t, overrides.size) : t[SIZE_TOKEN[size]];
	const resolvedColor = color ?? (overrides?.color ? resolveToken(t, overrides.color) : inline && textStyle.nested ? textStyle.color : t.colorForeground);
	const glyph = paths[name];
	if (glyph === void 0) {
		if (__DEV__) console.warn(`Icon: unknown name "${name}"`);
		return /* @__PURE__ */ React.createElement(Svg, {
			testID: "Icon",
			width: dimension,
			height: dimension,
			viewBox: "0 0 16 16"
		});
	}
	const strokeWidth = glyph.filled ? void 0 : overrides?.strokeWidth ? resolveToken(t, overrides.strokeWidth) : t.borderWidthFocus;
	return /* @__PURE__ */ React.createElement(Svg, {
		testID: "Icon",
		width: dimension,
		height: dimension,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: resolvedColor,
		strokeWidth,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		accessibilityRole: decorative ? void 0 : "image",
		accessibilityLabel: decorative ? void 0 : label,
		accessibilityElementsHidden: decorative,
		importantForAccessibility: decorative ? "no" : "auto"
	}, glyph.filled ? /* @__PURE__ */ React.createElement(Path, {
		d: glyph.d,
		fill: resolvedColor,
		stroke: "none",
		fillRule: "evenodd"
	}) : /* @__PURE__ */ React.createElement(Path, {
		d: glyph.d,
		vectorEffect: "non-scaling-stroke"
	}));
}
//#endregion
//#region src/NumberInput.tsx
const FONT_SIZE_TOKEN$3 = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
const COPY$27 = {
	increment: "Increase",
	decrement: "Decrease",
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} must be a number.`,
	outOfRange: (label, min, max) => `${label} must be between ${min} and ${max}.`,
	currencyMissing: "format \"currency\" needs a currency code.",
	requiredIndicator: " (required)"
};
/** Accessibility actions standing in for the keyboard's ArrowUp/Down, PageUp/Down and Home/End, since a hardware keyboard rarely reaches a touch field. */
const STEP_ACTIONS = [
	{
		name: "increment",
		label: "Increment"
	},
	{
		name: "decrement",
		label: "Decrement"
	},
	{
		name: "pageup",
		label: "Increase by ten steps"
	},
	{
		name: "pagedown",
		label: "Decrease by ten steps"
	},
	{
		name: "home",
		label: "Set to minimum"
	},
	{
		name: "end",
		label: "Set to maximum"
	}
];
function decimalPlaces(n) {
	const s = n.toString();
	const i = s.indexOf(".");
	return i === -1 ? 0 : s.length - i - 1;
}
function roundToPrecision(value, precision) {
	const factor = 10 ** precision;
	return Math.round(value * factor) / factor;
}
function clampValue(value, min, max) {
	let v = value;
	if (min !== void 0) v = Math.max(min, v);
	if (max !== void 0) v = Math.min(max, v);
	return v;
}
/** Keeps a leading minus, digits, and a single decimal point; drops everything else, so a locale keyboard's stray characters are ignored rather than rejected loudly. */
function sanitizeTyped(raw) {
	let out = "";
	let seenDot = false;
	for (let i = 0; i < raw.length; i += 1) {
		const ch = raw[i];
		if (ch === "-" && i === 0) out += ch;
		else if (ch === "." && !seenDot) {
			seenDot = true;
			out += ch;
		} else if (ch >= "0" && ch <= "9") out += ch;
	}
	return out;
}
function parseTyped$1(text) {
	if (text === "" || text === "-" || text === "." || text === "-.") return;
	const n = Number(text);
	return Number.isNaN(n) ? void 0 : n;
}
function isValidUnit(unit) {
	try {
		return new Intl.NumberFormat(void 0, {
			style: "unit",
			unit
		}) !== void 0;
	} catch {
		return false;
	}
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
function NumberInput({ label, name, value, defaultValue, min, max, step = 1, precision, format = "decimal", currency, unit, leadingText, trailingText, hideSteppers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, onChangeText }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const inputRef = React.useRef(null);
	const [internalValue, setInternalValueState] = React.useState(defaultValue);
	const [rawText, setRawText] = React.useState("");
	const [focused, setFocused] = React.useState(false);
	const [clampMessage, setClampMessageState] = React.useState(null);
	const isDisabled = disabled || (form?.disabled ?? false);
	const currentValue = value ?? internalValue;
	const resolvedPrecision = precision ?? decimalPlaces(step);
	const latest = React.useRef({
		value: currentValue,
		clampMessage,
		validateValue: (_val, _outOfRangeMessage) => null
	});
	latest.current.value = currentValue;
	latest.current.clampMessage = clampMessage;
	const setUncontrolled = (next) => {
		latest.current.value = next;
		if (value === void 0) setInternalValueState(next);
	};
	const setClampMessage = (next) => {
		latest.current.clampMessage = next;
		setClampMessageState(next);
	};
	const currencyMissing = format === "currency" && (currency === void 0 || currency === "");
	React.useEffect(() => {
		if (__DEV__ && currencyMissing) console.warn(`NumberInput: ${COPY$27.currencyMissing}`);
	}, [currencyMissing]);
	const unitInvalid = format === "unit" && unit !== void 0 && !isValidUnit(unit);
	const formatDisplay = (num) => {
		const digits = {
			minimumFractionDigits: resolvedPrecision,
			maximumFractionDigits: resolvedPrecision
		};
		if (format === "currency") {
			const code = currencyMissing ? "USD" : currency;
			return new Intl.NumberFormat(void 0, {
				style: "currency",
				currency: code,
				...digits
			}).format(num);
		}
		if (format === "percent") return new Intl.NumberFormat(void 0, {
			style: "percent",
			...digits
		}).format(num / 100);
		if (format === "unit" && unit !== void 0 && !unitInvalid) return new Intl.NumberFormat(void 0, {
			style: "unit",
			unit,
			...digits
		}).format(num);
		return new Intl.NumberFormat(void 0, digits).format(num);
	};
	const suffixText = trailingText ?? (unitInvalid ? unit : void 0);
	const validateValue = (val, outOfRangeMessage) => {
		if (error !== void 0 && error !== "") return error;
		if (outOfRangeMessage !== null) return outOfRangeMessage;
		if (required && val === void 0) return COPY$27.required(label);
		if (invalid) return COPY$27.invalid(label);
		return null;
	};
	latest.current.validateValue = validateValue;
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.value !== void 0 ? String(latest.current.value) : void 0,
		validate: () => latest.current.validateValue(latest.current.value, latest.current.clampMessage),
		focus: () => {
			const input = inputRef.current;
			if (input === null) return;
			input.focus();
			const node = findNodeHandle(input);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : clampMessage ?? formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	/** Sets the value, clears any out-of-range message, and syncs the raw text while focused. */
	const commitValue = (next) => {
		setUncontrolled(next);
		setClampMessage(null);
		if (focused) setRawText(String(next));
		onChangeText?.(next);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(next, null));
	};
	/** One `step` (or ten, for Page actions) in `direction`; from an empty field, jumps straight to `min ?? 0` / `max ?? 0` instead. */
	const stepValue = (direction, multiplier = 1) => {
		if (isDisabled) return;
		if (currentValue === void 0) {
			commitValue(clampValue(roundToPrecision(direction === 1 ? min ?? 0 : max ?? 0, resolvedPrecision), min, max));
			return;
		}
		const next = clampValue(roundToPrecision(currentValue + step * multiplier * direction, resolvedPrecision), min, max);
		commitValue(next);
	};
	/** Rounds and clamps the typed text on blur/Enter, reporting `copy.outOfRange` when a clamp changed what was typed and both bounds are set. */
	const commitTyped = () => {
		const parsed = parseTyped$1(rawText);
		let final;
		let outOfRangeMessage = null;
		if (parsed === void 0) final = void 0;
		else {
			const rounded = roundToPrecision(parsed, resolvedPrecision);
			const clamped = clampValue(rounded, min, max);
			if (clamped !== rounded && min !== void 0 && max !== void 0) outOfRangeMessage = COPY$27.outOfRange(label, min, max);
			final = clamped;
		}
		setUncontrolled(final);
		setClampMessage(outOfRangeMessage);
		onChangeText?.(final);
		return validateValue(final, outOfRangeMessage);
	};
	const handleChangeText = (raw) => {
		const sanitized = sanitizeTyped(raw);
		setRawText(sanitized);
		setClampMessage(null);
		const parsed = parseTyped$1(sanitized);
		setUncontrolled(parsed);
		onChangeText?.(parsed);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(parsed, null));
	};
	const handleFocus = () => {
		setFocused(true);
		setRawText(currentValue !== void 0 ? String(currentValue) : "");
	};
	const handleBlur = () => {
		setFocused(false);
		const message = commitTyped();
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, message);
	};
	const position = form === null ? -1 : form.order.indexOf(name);
	const isLast = form !== null && position !== -1 && position === form.order.length - 1;
	const nextName = form !== null && position !== -1 ? form.order[position + 1] : void 0;
	const returnKeyType = form === null ? void 0 : isLast ? "done" : "next";
	const handleSubmitEditing = () => {
		commitTyped();
		if (form === null) return;
		if (isLast) form.submit();
		else if (nextName !== void 0) form.focusField(nextName);
	};
	const handleAccessibilityAction = (event) => {
		if (isDisabled) return;
		switch (event.nativeEvent.actionName) {
			case "increment":
				stepValue(1);
				break;
			case "decrement":
				stepValue(-1);
				break;
			case "pageup":
				stepValue(1, 10);
				break;
			case "pagedown":
				stepValue(-1, 10);
				break;
			case "home":
				if (min !== void 0) commitValue(min);
				break;
			case "end": if (max !== void 0) commitValue(max);
		}
	};
	const visibleLabel = required ? `${label}${COPY$27.requiredIndicator}` : label;
	const borderFocusColor = overrides?.borderFocus ? resolveToken(t, overrides.borderFocus) : t.colorBorderFocus;
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = size === "sm" ? overrides?.paddingInlineSm ? resolveToken(t, overrides.paddingInlineSm) : t.space2 : overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const paddingBlock = size === "sm" ? overrides?.paddingBlockSm ? resolveToken(t, overrides.paddingBlockSm) : t.space1 : overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const minTarget = size === "sm" ? overrides?.minTargetSm ? resolveToken(t, overrides.minTargetSm) : t.sizeTargetMin : t.sizeTargetComfortable;
	const affixGap = overrides?.affixGap ? resolveToken(t, overrides.affixGap) : t.layoutGapTight;
	const stepperGap = overrides?.stepperGap ? resolveToken(t, overrides.stepperGap) : t.layoutGapNone;
	const stepperDividerColor = overrides?.stepperDivider ? resolveToken(t, overrides.stepperDivider) : t.colorBorder;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$3[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const inset = t.borderWidthFocus - borderWidth;
	const allowsNegative = min === void 0 || min < 0;
	const keyboardType = Platform.OS === "ios" && allowsNegative ? "numbers-and-punctuation" : "decimal-pad";
	const atMin = currentValue !== void 0 && min !== void 0 && currentValue <= min;
	const atMax = currentValue !== void 0 && max !== void 0 && currentValue >= max;
	const displayValue = focused ? rawText : currentValue !== void 0 ? formatDisplay(currentValue) : "";
	const accessibilityValueText = currentValue !== void 0 ? formatDisplay(currentValue) : void 0;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		minHeight: minTarget,
		backgroundColor: t.colorBackground,
		borderWidth: activeBorderWidth,
		borderColor: focused ? borderFocusColor : isInvalid ? borderInvalidColor : t.colorBorderStrong,
		borderRadius: radius
	};
	const contentRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		gap: affixGap,
		paddingHorizontal: paddingInline + inset,
		paddingVertical: paddingBlock + inset
	};
	const textInputStyle = {
		flex: 1,
		padding: 0,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: t.colorForeground
	};
	const stepperRowStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		gap: stepperGap,
		borderLeftWidth: t.borderWidthThin,
		borderLeftColor: stepperDividerColor
	};
	const typographyOverrides = { fontFamily: overrides?.fontFamily };
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	return /* @__PURE__ */ React.createElement(View, {
		style: containerStyle,
		testID: "NumberInput"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.label" }, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.fontSize,
			fontWeight: overrides?.labelWeight,
			lineHeight: overrides?.lineHeight
		}
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, {
		style: fieldStyle,
		testID: "NumberInput.field"
	}, /* @__PURE__ */ React.createElement(View, { style: contentRowStyle }, leadingText !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.prefix" }, /* @__PURE__ */ React.createElement(Text, {
		tone: "muted",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.fontSize
		}
	}, leadingText)) : null, /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		testID: "NumberInput.input",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityRole: "adjustable",
		accessibilityState: { disabled: isDisabled },
		accessibilityValue: {
			min,
			max,
			now: currentValue,
			text: accessibilityValueText
		},
		accessibilityActions: STEP_ACTIONS,
		onAccessibilityAction: handleAccessibilityAction,
		keyboardType,
		allowFontScaling: true,
		editable: !isDisabled,
		value: displayValue,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		returnKeyType,
		blurOnSubmit: isLast,
		onSubmitEditing: handleSubmitEditing,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		style: textInputStyle
	}), suffixText !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.suffix" }, /* @__PURE__ */ React.createElement(Text, {
		tone: "muted",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.fontSize
		}
	}, suffixText)) : null), hideSteppers ? null : /* @__PURE__ */ React.createElement(View, { style: stepperRowStyle }, /* @__PURE__ */ React.createElement(View, {
		testID: "NumberInput.decrementButton",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$27.decrement,
		variant: "ghost",
		size,
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "minus",
			color: t.colorActionGhostForeground
		}),
		disabled: isDisabled || atMin,
		onPress: () => stepValue(-1)
	})), /* @__PURE__ */ React.createElement(View, {
		testID: "NumberInput.incrementButton",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$27.increment,
		variant: "ghost",
		size,
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "plus",
			color: t.colorActionGhostForeground
		}),
		disabled: isDisabled || atMax,
		onPress: () => stepValue(1)
	})))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "NumberInput.errorMessage",
		accessibilityLiveRegion: summarised ? "none" : "assertive"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null);
}
//#endregion
//#region src/Form.tsx
function summaryTitle(count) {
	return count === 1 ? "1 problem with this form" : `${count} problems with this form`;
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
function Form({ children, actions, name, label, validate = "submit", disabled = false, errorSummary = true, overrides, onSubmit, onInvalid }) {
	const { tokens } = useTheme();
	const handles = React.useRef(/* @__PURE__ */ new Map());
	const orderRef = React.useRef([]);
	const [order, setOrder] = React.useState([]);
	const [errors, setErrors] = React.useState({});
	const [submissionAttempt, setSubmissionAttempt] = React.useState(0);
	const summaryRef = React.useRef(null);
	const latest = React.useRef({
		disabled,
		errorSummary,
		onSubmit,
		onInvalid
	});
	latest.current = {
		disabled,
		errorSummary,
		onSubmit,
		onInvalid
	};
	const register = React.useCallback((fieldName, handle) => {
		handles.current.set(fieldName, handle);
		if (!orderRef.current.includes(fieldName)) {
			orderRef.current = [...orderRef.current, fieldName];
			setOrder(orderRef.current);
		}
	}, []);
	const unregister = React.useCallback((fieldName) => {
		handles.current.delete(fieldName);
		if (orderRef.current.includes(fieldName)) {
			orderRef.current = orderRef.current.filter((n) => n !== fieldName);
			setOrder(orderRef.current);
		}
		setErrors((prev) => {
			if (!(fieldName in prev)) return prev;
			const next = { ...prev };
			delete next[fieldName];
			return next;
		});
	}, []);
	const reportValidity = React.useCallback((fieldName, error) => {
		setErrors((prev) => {
			if (error === null) {
				if (!(fieldName in prev)) return prev;
				const next = { ...prev };
				delete next[fieldName];
				return next;
			}
			return prev[fieldName] === error ? prev : {
				...prev,
				[fieldName]: error
			};
		});
	}, []);
	const submit = React.useCallback(() => {
		if (latest.current.disabled) return;
		const nextErrors = {};
		const values = {};
		let firstInvalid = null;
		for (const fieldName of orderRef.current) {
			const handle = handles.current.get(fieldName);
			if (handle === void 0) continue;
			const error = handle.validate();
			if (error !== null) {
				nextErrors[fieldName] = error;
				if (firstInvalid === null) firstInvalid = handle;
			}
			const value = handle.getValue();
			if (value !== void 0) values[fieldName] = value;
		}
		setErrors(nextErrors);
		if (firstInvalid !== null) {
			latest.current.onInvalid?.(nextErrors);
			if (latest.current.errorSummary) setSubmissionAttempt((attempt) => attempt + 1);
			else firstInvalid.focus();
			return;
		}
		latest.current.onSubmit?.(values);
	}, []);
	React.useEffect(() => {
		if (submissionAttempt === 0) return;
		const node = findNodeHandle(summaryRef.current);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, [submissionAttempt]);
	const focusField = React.useCallback((fieldName) => {
		handles.current.get(fieldName)?.focus();
	}, []);
	const contextValue = React.useMemo(() => ({
		register,
		unregister,
		submit,
		focusField,
		reportValidity,
		disabled,
		validateMode: validate,
		errorSummary,
		errors,
		order
	}), [
		register,
		unregister,
		submit,
		focusField,
		reportValidity,
		disabled,
		validate,
		errorSummary,
		errors,
		order
	]);
	const errorEntries = order.filter((fieldName) => fieldName in errors).map((fieldName) => [fieldName, errors[fieldName] ?? ""]);
	const announcement = errorSummary && errorEntries.length > 0 ? [summaryTitle(errorEntries.length), ...errorEntries.map(([, message]) => message)].join(". ") : "";
	React.useEffect(() => {
		if (Platform.OS === "ios" && announcement !== "") AccessibilityInfo.announceForAccessibility(announcement);
	}, [announcement]);
	const gap = overrides?.gap ? resolveToken(tokens, overrides.gap) : tokens.layoutGapLoose;
	const errorSummaryBorderColor = overrides?.errorSummaryBorder ? resolveToken(tokens, overrides.errorSummaryBorder) : tokens.colorBorderDanger;
	const containerStyle = {
		flexDirection: "column",
		gap
	};
	const fieldsStyle = {
		flexDirection: "column",
		gap
	};
	const summaryStyle = {
		borderWidth: tokens.borderWidthThin,
		borderColor: errorSummaryBorderColor,
		borderRadius: tokens.radiusMd,
		backgroundColor: tokens.colorBackgroundSubtle,
		paddingHorizontal: tokens.spaceMd,
		paddingVertical: tokens.spaceSm,
		gap: tokens.spaceSm
	};
	const summaryItemStyle = {
		minHeight: tokens.sizeTargetMin,
		justifyContent: "center"
	};
	return /* @__PURE__ */ React.createElement(FormContext.Provider, { value: contextValue }, /* @__PURE__ */ React.createElement(View, {
		testID: "Form",
		role: "form",
		accessibilityLabel: label,
		style: containerStyle
	}, errorSummary && errorEntries.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		ref: summaryRef,
		testID: "Form.errorSummary",
		accessibilityLiveRegion: "assertive",
		style: summaryStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "danger",
		weight: "semibold"
	}, summaryTitle(errorEntries.length)), errorEntries.map(([fieldName, message]) => /* @__PURE__ */ React.createElement(Pressable, {
		key: fieldName,
		accessibilityRole: "link",
		accessibilityLabel: message,
		style: summaryItemStyle,
		onPress: () => handles.current.get(fieldName)?.focus()
	}, /* @__PURE__ */ React.createElement(Text, { tone: "danger" }, message)))) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Form.fields",
		style: fieldsStyle
	}, children), /* @__PURE__ */ React.createElement(View, { testID: "Form.actions" }, actions)));
}
//#endregion
//#region src/Box.tsx
const INSET_TOKEN$1 = {
	none: "layoutInsetNone",
	sm: "layoutInsetSm",
	md: "layoutInsetMd",
	lg: "layoutInsetLg",
	xl: "layoutInsetXl"
};
const SURFACE_TOKEN = {
	default: "colorBackground",
	subtle: "colorBackgroundSubtle",
	strong: "colorBackgroundStrong"
};
const RADIUS_TOKEN = {
	none: "radiusNone",
	sm: "radiusSm",
	md: "radiusMd",
	lg: "radiusLg",
	full: "radiusFull"
};
/**
* Box — a surface: padding, background, border, radius. It spaces nothing between
* children (put a Stack inside for that) and never carries margin of its own.
*
* Renders a `View` with paddingVertical/paddingHorizontal, backgroundColor,
* borderWidth/borderColor and borderRadius resolved from the token object.
* `element` does not apply on React Native.
*/
function Box({ children, inset = "none", insetBlock, insetInline, surface = "none", border = false, radius = "none", overrides }) {
	const { tokens: t } = useTheme();
	const style = React.useMemo(() => {
		const blockInset = insetBlock ?? inset;
		const inlineInset = insetInline ?? inset;
		const next = {
			paddingVertical: overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[INSET_TOKEN$1[blockInset]],
			paddingHorizontal: overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[INSET_TOKEN$1[inlineInset]],
			borderRadius: radius !== "none" && overrides?.radius ? resolveToken(t, overrides.radius) : t[RADIUS_TOKEN[radius]]
		};
		if (surface !== "none") next.backgroundColor = overrides?.background ? resolveToken(t, overrides.background) : t[SURFACE_TOKEN[surface]];
		if (border) {
			next.borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
			next.borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
		}
		return next;
	}, [
		t,
		inset,
		insetBlock,
		insetInline,
		surface,
		border,
		radius,
		overrides
	]);
	return /* @__PURE__ */ React.createElement(View, {
		style,
		testID: "Box"
	}, children);
}
//#endregion
//#region src/Link.tsx
const COPY$26 = { externalSuffix: " (opens in new tab)" };
/** `copy.externalSuffix`, exposed so composites (e.g. `Card`) can reproduce a Link's accessible name when they move it onto a wrapping element. */
const LINK_EXTERNAL_SUFFIX = COPY$26.externalSuffix;
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
function Link({ href, label, external = false, tone = "default", overrides, accessibilityLabel, accessibilityHint, onFocus, onBlur, onHoverIn, onHoverOut, onLongPress, onPress }) {
	const { tokens: t } = useTheme();
	const { nested } = React.useContext(TextStyleContext);
	const reducedMotion = useReducedMotion();
	const [pressed, setPressed] = React.useState(false);
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const highlight = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		if (tone === "inherit") return;
		const toValue = pressed ? 1 : 0;
		if (reducedMotion) {
			highlight.setValue(toValue);
			return;
		}
		const animation = Animated.timing(highlight, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, [
		pressed,
		reducedMotion,
		highlight,
		transitionDuration,
		t.motionEasingStandard,
		tone
	]);
	const animatedColor = highlight.interpolate({
		inputRange: [0, 1],
		outputRange: [t.colorLink, t.colorLinkHover]
	});
	const iconColor = tone === "inherit" ? void 0 : pressed ? t.colorLinkHover : t.colorLink;
	const handlePress = () => {
		onPress?.(href);
		if (external || onPress === void 0) Linking.openURL(href).catch(() => void 0);
	};
	const forwardedProps = {
		onFocus,
		onBlur,
		onHoverIn,
		onHoverOut
	};
	const style = {
		...nested ? {} : {
			fontFamily: t.fontFamilyBody,
			fontWeight: toFontWeight(t.fontWeightRegular),
			fontSize: t.fontSizeMd,
			lineHeight: toLineHeight(t.fontSizeMd, t.fontLineHeightNormal)
		},
		textDecorationLine: "underline"
	};
	return /* @__PURE__ */ React.createElement(Animated.Text, {
		testID: "Link",
		accessibilityRole: "link",
		accessibilityLabel: accessibilityLabel ?? (external ? `${label}${COPY$26.externalSuffix}` : label),
		accessibilityHint,
		allowFontScaling: true,
		onPress: handlePress,
		onPressIn: () => setPressed(true),
		onPressOut: () => setPressed(false),
		onLongPress,
		...forwardedProps,
		style: [style, tone === "inherit" ? null : {
			color: animatedColor,
			textDecorationColor: animatedColor
		}]
	}, label, external ? " " : null, external ? /* @__PURE__ */ React.createElement(Icon, {
		name: "external",
		inline: true,
		color: iconColor
	}) : null);
}
//#endregion
//#region src/Checkbox.tsx
const COPY$25 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)"
};
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
function Checkbox({ label, hideLabel = false, name, value = "on", checked, defaultChecked = false, indeterminate = false, disabled = false, required = false, invalid = false, description, error, overrides, onChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const pressableRef = React.useRef(null);
	const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
	const [focused, setFocused] = React.useState(false);
	const isChecked = checked ?? internalChecked;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && !candidate) return COPY$25.required(label);
		if (invalid) return COPY$25.invalid(label);
		return null;
	}, [
		error,
		required,
		invalid,
		label
	]);
	const latest = React.useRef({
		isChecked,
		value,
		validateValue
	});
	latest.current = {
		isChecked,
		value,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.isChecked ? latest.current.value : void 0,
		validate: () => latest.current.validateValue(latest.current.isChecked),
		focus: () => {
			const node = pressableRef.current === null ? null : findNodeHandle(pressableRef.current);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const handlePress = () => {
		if (isDisabled) return;
		const next = !isChecked;
		if (checked === void 0) setInternalChecked(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const visibleLabel = required ? `${label}${COPY$25.requiredIndicator}` : label;
	const filled = isChecked || indeterminate;
	const controlBackground = overrides?.controlBackground ? resolveToken(t, overrides.controlBackground) : t.colorControlBackground;
	const controlBorderWidth = overrides?.controlBorderWidth ? resolveToken(t, overrides.controlBorderWidth) : t.borderWidthThin;
	const pressedOverlay = overrides?.pressedOverlay ? resolveToken(t, overrides.pressedOverlay) : t.opacityDisabled;
	const controlBorderInvalid = overrides?.controlBorderInvalid ? resolveToken(t, overrides.controlBorderInvalid) : t.colorBorderDanger;
	const controlSize = overrides?.controlSize ? resolveToken(t, overrides.controlSize) : t.space5;
	const controlRadius = overrides?.controlRadius ? resolveToken(t, overrides.controlRadius) : t.radiusSm;
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.space2;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const fillAnim = React.useRef(new Animated.Value(filled ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = filled ? 1 : 0;
		if (reducedMotion) {
			fillAnim.setValue(toValue);
			return;
		}
		Animated.timing(fillAnim, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		filled,
		reducedMotion,
		fillAnim,
		transitionDuration,
		t.motionEasingStandard
	]);
	const animatedBackground = fillAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [controlBackground, t.colorControlSelectedBackground]
	});
	const animatedBorderColor = fillAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [t.colorControlBorder, t.colorControlSelectedBackground]
	});
	const rowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap,
		minHeight: t.sizeTargetComfortable,
		paddingVertical: t.space1,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const boxStyle = ({ pressed }) => ({
		width: controlSize,
		height: controlSize,
		borderRadius: controlRadius,
		borderWidth: focused ? t.borderWidthFocus : controlBorderWidth,
		borderColor: focused ? t.colorBorderFocus : isInvalid ? controlBorderInvalid : animatedBorderColor,
		backgroundColor: pressed && !isDisabled ? t.colorControlSelectedBackground : animatedBackground,
		opacity: pressed && !isDisabled ? pressedOverlay : 1,
		alignItems: "center",
		justifyContent: "center"
	});
	const indicatorStyle = { opacity: fillAnim };
	const textColumnStyle = {
		flex: 1,
		flexDirection: "column",
		gap: partGap
	};
	const errorStyle = { marginTop: partGap };
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	return /* @__PURE__ */ React.createElement(View, { testID: "Checkbox" }, /* @__PURE__ */ React.createElement(Pressable, {
		ref: pressableRef,
		accessibilityRole: "checkbox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			checked: indeterminate ? "mixed" : isChecked,
			disabled: isDisabled
		},
		onPress: handlePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: rowStyle
	}, (state) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Animated.View, {
		style: boxStyle(state),
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: indicatorStyle }, /* @__PURE__ */ React.createElement(Icon, {
		name: indeterminate ? "dash" : "check",
		size: "xs",
		color: t.colorControlSelectedForeground,
		overrides: { strokeWidth: overrides?.indicatorStroke }
	}))), /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, hideLabel ? null : /* @__PURE__ */ React.createElement(Text, { overrides: {
		...typographyOverrides,
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight
	} }, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		style: errorStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null);
}
//#endregion
//#region src/Switch.tsx
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
function Switch({ label, name, checked, defaultChecked = false, disabled = false, description, labelPosition = "start", overrides, onValueChange }) {
	const { tokens } = useTheme();
	const form = useFormContext();
	const switchRef = React.useRef(null);
	const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
	const isChecked = checked ?? internalChecked;
	const isDisabled = disabled || (form?.disabled ?? false);
	const latest = React.useRef({ isChecked });
	latest.current = { isChecked };
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.isChecked,
		validate: () => null,
		focus: () => {
			const node = switchRef.current === null ? null : findNodeHandle(switchRef.current);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || name === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	const setValue = (next) => {
		if (isDisabled || next === isChecked) return;
		if (checked === void 0) setInternalChecked(next);
		onValueChange?.(next);
	};
	const gap = overrides?.gap ? resolveToken(tokens, overrides.gap) : tokens.space3;
	const partGap = overrides?.partGap ? resolveToken(tokens, overrides.partGap) : tokens.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(tokens, overrides.disabledOpacity) : tokens.opacityDisabled;
	const rowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap,
		minHeight: tokens.sizeTargetComfortable,
		paddingVertical: tokens.space1,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const textColumnStyle = {
		flex: 1,
		flexDirection: "column",
		gap: partGap
	};
	const trackFrameStyle = {
		padding: tokens.space1,
		borderRadius: tokens.radiusFull
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	const labelColumn = /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, /* @__PURE__ */ React.createElement(Text, { overrides: {
		...typographyOverrides,
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight
	} }, label), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null);
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Switch",
		accessible: false,
		onPress: () => setValue(!isChecked),
		style: rowStyle
	}, labelPosition === "start" ? labelColumn : null, /* @__PURE__ */ React.createElement(View, { style: trackFrameStyle }, /* @__PURE__ */ React.createElement(Switch$1, {
		ref: switchRef,
		accessibilityRole: "switch",
		accessibilityLabel: label,
		accessibilityHint: description,
		accessibilityState: {
			checked: isChecked,
			disabled: isDisabled
		},
		value: isChecked,
		disabled: isDisabled,
		trackColor: {
			false: tokens.colorControlTrackOff,
			true: tokens.colorControlSelectedBackground
		},
		thumbColor: tokens.colorControlSelectedForeground,
		ios_backgroundColor: tokens.colorControlTrackOff,
		onValueChange: setValue
	})), labelPosition === "end" ? labelColumn : null);
}
//#endregion
//#region src/RadioGroup.tsx
const COPY$24 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)"
};
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
function RadioGroup({ label, name, options, value, defaultValue, orientation = "vertical", required = false, invalid = false, disabled = false, description, error, overrides, onChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const groupRef = React.useRef(null);
	const firstEnabledRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [focusedValue, setFocusedValue] = React.useState(null);
	const currentValue = value ?? internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate === void 0) return COPY$24.required(label);
		if (invalid) return COPY$24.invalid(label);
		return null;
	}, [
		error,
		required,
		invalid,
		label
	]);
	const latest = React.useRef({
		currentValue,
		validateValue
	});
	latest.current = {
		currentValue,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.currentValue,
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => {
			const target = firstEnabledRef.current ?? groupRef.current;
			const node = target === null ? null : findNodeHandle(target);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const select = (next) => {
		if (isDisabled || next === currentValue) return;
		if (value === void 0) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const visibleLabel = required ? `${label}${COPY$24.requiredIndicator}` : label;
	const firstEnabledValue = options.find((option) => option.disabled !== true)?.value;
	const controlBorderWidth = overrides?.controlBorderWidth ? resolveToken(t, overrides.controlBorderWidth) : t.borderWidthThin;
	const controlBorderInvalid = overrides?.controlBorderInvalid ? resolveToken(t, overrides.controlBorderInvalid) : t.colorBorderDanger;
	const controlSize = overrides?.controlSize ? resolveToken(t, overrides.controlSize) : t.space5;
	const controlRadius = overrides?.controlRadius ? resolveToken(t, overrides.controlRadius) : t.radiusFull;
	const optionGap = overrides?.optionGap ? resolveToken(t, overrides.optionGap) : t.space2;
	const listGap = overrides?.listGap ? resolveToken(t, overrides.listGap) : t.space2;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const dotSize = controlSize - 2 * t.space1;
	const fillAnimsRef = React.useRef(/* @__PURE__ */ new Map());
	const getFillAnim = (optionValue, selected) => {
		let anim = fillAnimsRef.current.get(optionValue);
		if (anim === void 0) {
			anim = new Animated.Value(selected ? 1 : 0);
			fillAnimsRef.current.set(optionValue, anim);
		}
		return anim;
	};
	const optionValues = React.useMemo(() => options.map((option) => option.value), [options]);
	React.useEffect(() => {
		optionValues.forEach((optionValue) => {
			const selected = optionValue === currentValue;
			const anim = getFillAnim(optionValue, selected);
			const toValue = selected ? 1 : 0;
			if (reducedMotion) {
				anim.setValue(toValue);
				return;
			}
			Animated.timing(anim, {
				toValue,
				duration: transitionDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			}).start();
		});
	}, [
		currentValue,
		optionValues,
		reducedMotion,
		transitionDuration,
		t.motionEasingStandard
	]);
	const groupStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const listStyle = {
		flexDirection: orientation === "horizontal" ? "row" : "column",
		flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
		gap: listGap
	};
	const optionStyle = (optionDisabled) => ({
		flexDirection: "row",
		alignItems: "flex-start",
		gap: optionGap,
		minHeight: t.sizeTargetComfortable,
		paddingVertical: t.space1,
		opacity: optionDisabled && !isDisabled ? disabledOpacity : 1
	});
	const controlStyle = (anim, focused) => ({
		width: controlSize,
		height: controlSize,
		borderRadius: controlRadius,
		borderWidth: focused ? t.borderWidthFocus : controlBorderWidth,
		borderColor: focused ? t.colorBorderFocus : isInvalid ? controlBorderInvalid : anim.interpolate({
			inputRange: [0, 1],
			outputRange: [t.colorControlBorder, t.colorControlSelectedBackground]
		}),
		backgroundColor: t.colorControlBackground,
		alignItems: "center",
		justifyContent: "center"
	});
	const dotStyle = (anim) => ({
		width: dotSize,
		height: dotSize,
		borderRadius: controlRadius,
		backgroundColor: t.colorControlSelectedBackground,
		opacity: anim
	});
	const textColumnStyle = {
		flexShrink: 1,
		flexDirection: "column",
		gap: t.space1
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const legendOverrides = {
		...typographyOverrides,
		fontSize: overrides?.legendSize,
		fontWeight: overrides?.legendWeight
	};
	const labelOverrides = {
		...typographyOverrides,
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "RadioGroup",
		ref: groupRef,
		accessibilityRole: "radiogroup",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		style: groupStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: legendOverrides
	}, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, /* @__PURE__ */ React.createElement(View, { style: listStyle }, options.map((option) => {
		const selected = option.value === currentValue;
		const optionDisabled = isDisabled || option.disabled === true;
		const focused = focusedValue === option.value;
		const anim = getFillAnim(option.value, selected);
		const optionName = option.description !== void 0 ? `${option.label}. ${option.description}` : option.label;
		return /* @__PURE__ */ React.createElement(Pressable, {
			key: option.value,
			ref: option.value === firstEnabledValue ? firstEnabledRef : void 0,
			accessibilityRole: "radio",
			accessibilityLabel: optionName,
			accessibilityState: {
				checked: selected,
				disabled: optionDisabled
			},
			onPress: () => {
				if (!optionDisabled) select(option.value);
			},
			onFocus: () => setFocusedValue(option.value),
			onBlur: () => setFocusedValue((prev) => prev === option.value ? null : prev),
			style: optionStyle(optionDisabled)
		}, /* @__PURE__ */ React.createElement(Animated.View, {
			style: controlStyle(anim, focused),
			accessibilityElementsHidden: true,
			importantForAccessibility: "no"
		}, /* @__PURE__ */ React.createElement(Animated.View, { style: dotStyle(anim) })), /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, /* @__PURE__ */ React.createElement(Text, { overrides: labelOverrides }, option.label), option.description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			tone: "muted",
			overrides: helperOverrides
		}, option.description) : null));
	})), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: summarised ? "none" : "assertive" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null);
}
//#endregion
//#region src/Disclosure.tsx
/** Chevron rotation in degrees: pointing right when closed, down when open. */
const CHEVRON_CLOSED = "0deg";
const CHEVRON_OPEN = "90deg";
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
function Disclosure({ summary, children, open, defaultOpen = false, disabled = false, keepMounted = false, headingLevel, onToggle, overrides }) {
	const { tokens } = useTheme();
	const reducedMotion = useReducedMotion();
	const rtl = I18nManager.isRTL;
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const [focused, setFocused] = React.useState(false);
	const isOpen = isControlled ? open : internalOpen;
	const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
	const mountedRef = React.useRef(false);
	const previousOpenRef = React.useRef(isOpen);
	const selfEmittedRef = React.useRef(null);
	React.useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			previousOpenRef.current = isOpen;
			return;
		}
		if (isControlled && previousOpenRef.current !== isOpen) {
			if (!(selfEmittedRef.current === isOpen)) onToggle?.(isOpen, "controlled");
		}
		selfEmittedRef.current = null;
		previousOpenRef.current = isOpen;
	}, [isOpen, isControlled]);
	const triggerPaddingBlock = overrides?.triggerPaddingBlock ? resolveToken(tokens, overrides.triggerPaddingBlock) : tokens.spaceSm;
	const triggerPaddingInline = overrides?.triggerPaddingInline ? resolveToken(tokens, overrides.triggerPaddingInline) : tokens.spaceSm;
	const triggerGap = overrides?.triggerGap ? resolveToken(tokens, overrides.triggerGap) : tokens.space2;
	const triggerFontFamily = overrides?.triggerFontFamily ? resolveToken(tokens, overrides.triggerFontFamily) : tokens.fontFamilyBody;
	const triggerFontSize = overrides?.triggerFontSize ? resolveToken(tokens, overrides.triggerFontSize) : tokens.fontSizeMd;
	const triggerFontWeight = overrides?.triggerFontWeight ? resolveToken(tokens, overrides.triggerFontWeight) : tokens.fontWeightMedium;
	const triggerRadius = overrides?.triggerRadius ? resolveToken(tokens, overrides.triggerRadius) : tokens.radiusMd;
	const panelPaddingBlock = overrides?.panelPaddingBlock ? resolveToken(tokens, overrides.panelPaddingBlock) : tokens.spaceSm;
	const panelPaddingInline = overrides?.panelPaddingInline ? resolveToken(tokens, overrides.panelPaddingInline) : tokens.spaceSm;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(tokens, overrides.disabledOpacity) : tokens.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(tokens, overrides.transition) : tokens.motionDurationBase;
	React.useEffect(() => {
		const toValue = isOpen ? 1 : 0;
		if (reducedMotion) {
			rotation.setValue(toValue);
			return;
		}
		Animated.timing(rotation, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(tokens.motionEasingStandard),
			useNativeDriver: Platform.OS !== "web"
		}).start();
	}, [
		isOpen,
		reducedMotion,
		rotation,
		transitionDuration,
		tokens.motionEasingStandard
	]);
	const handlePress = () => {
		if (disabled) return;
		const next = !isOpen;
		if (isControlled) selfEmittedRef.current = next;
		else setInternalOpen(next);
		onToggle?.(next, "pointer");
	};
	const triggerStyle = ({ pressed }) => ({
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: triggerGap,
		minHeight: tokens.sizeTargetMin,
		minWidth: tokens.sizeTargetMin,
		paddingVertical: triggerPaddingBlock,
		paddingHorizontal: triggerPaddingInline,
		borderRadius: triggerRadius,
		backgroundColor: pressed && !disabled ? tokens.colorBackgroundSubtle : "transparent",
		borderWidth: tokens.borderWidthFocus,
		borderColor: focused ? tokens.colorBorderFocus : "transparent",
		opacity: disabled ? disabledOpacity : 1
	});
	const summaryStyle = {
		fontFamily: triggerFontFamily,
		fontSize: triggerFontSize,
		fontWeight: toFontWeight(triggerFontWeight),
		lineHeight: toLineHeight(triggerFontSize, tokens.fontLineHeightNormal),
		color: tokens.colorForeground,
		flexShrink: 1
	};
	const chevronName = rtl ? "chevron-left" : "chevron-right";
	const chevronOpenAngle = rtl ? "-90deg" : CHEVRON_OPEN;
	const chevronFrameStyle = { transform: [{ rotate: rotation.interpolate({
		inputRange: [0, 1],
		outputRange: [CHEVRON_CLOSED, chevronOpenAngle]
	}) }] };
	const panelStyle = {
		paddingVertical: panelPaddingBlock,
		paddingHorizontal: panelPaddingInline,
		display: isOpen ? "flex" : "none"
	};
	return /* @__PURE__ */ React.createElement(View, { testID: "Disclosure" }, /* @__PURE__ */ React.createElement(Pressable, {
		accessibilityRole: "button",
		accessibilityLabel: summary,
		accessibilityState: {
			expanded: isOpen,
			disabled
		},
		onPress: handlePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: triggerStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: chevronFrameStyle }, /* @__PURE__ */ React.createElement(Icon, {
		name: chevronName,
		size: "md",
		color: tokens.colorForegroundMuted,
		overrides: overrides?.triggerFontSize ? { size: overrides.triggerFontSize } : void 0
	})), /* @__PURE__ */ React.createElement(Text$1, {
		accessibilityRole: headingLevel !== void 0 ? "header" : void 0,
		allowFontScaling: true,
		style: summaryStyle
	}, summary)), isOpen || keepMounted ? /* @__PURE__ */ React.createElement(View, {
		style: panelStyle,
		accessibilityElementsHidden: !isOpen,
		importantForAccessibility: isOpen ? "auto" : "no-hide-descendants"
	}, children) : null);
}
//#endregion
//#region src/Alert.tsx
const COPY$23 = { dismissLabel: "Dismiss" };
const TONE_TOKENS = {
	info: {
		background: "colorStatusInfoBackground",
		foreground: "colorStatusInfoForeground",
		border: "colorStatusInfoBorder",
		icon: "colorStatusInfoIcon"
	},
	success: {
		background: "colorStatusSuccessBackground",
		foreground: "colorStatusSuccessForeground",
		border: "colorStatusSuccessBorder",
		icon: "colorStatusSuccessIcon"
	},
	warning: {
		background: "colorStatusWarningBackground",
		foreground: "colorStatusWarningForeground",
		border: "colorStatusWarningBorder",
		icon: "colorStatusWarningIcon"
	},
	danger: {
		background: "colorStatusDangerBackground",
		foreground: "colorStatusDangerForeground",
		border: "colorStatusDangerBorder",
		icon: "colorStatusDangerIcon"
	}
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
* Colors come from the `color.status.{tone}.*` tokens; the leading glyph is the
* system `Icon` (`info`/`success`/`warning`/`danger`, decorative). The dismiss
* button is the system `Button` (`ghost`, `sm`, `iconOnly`, labelled
* `copy.dismissLabel`, with `Icon name="close"` as `leadingIcon`), pulled into the
* corner by `dismissMargin`; it fires `onDismiss` only and the consumer removes the
* alert. Moving focus to the next element before removal is not possible on native.
*/
function Alert({ tone = "info", heading, children, live = "status", dismissible = false, overrides, onDismiss }) {
	const { tokens: t } = useTheme();
	const colors = TONE_TOKENS[tone];
	const background = t[colors.background];
	const foreground = t[colors.foreground];
	const icon = t[colors.icon];
	const border = overrides?.border ? resolveToken(t, overrides.border) : t[colors.border];
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const padding = overrides?.padding ? resolveToken(t, overrides.padding) : t.spaceMd;
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.space3;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const headingSize = overrides?.headingSize ? resolveToken(t, overrides.headingSize) : t.fontSizeMd;
	const headingWeight = overrides?.headingWeight ? resolveToken(t, overrides.headingWeight) : t.fontWeightSemibold;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const dismissMargin = overrides?.dismissMargin ? resolveToken(t, overrides.dismissMargin) : t.space1;
	const announcement = [heading, typeof children === "string" ? children : void 0].filter((part) => part !== void 0 && part !== "").join(". ");
	React.useEffect(() => {
		if (Platform.OS === "ios" && live !== "off" && announcement !== "") AccessibilityInfo.announceForAccessibility(announcement);
	}, [announcement, live]);
	const containerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap,
		padding,
		borderWidth,
		borderColor: border,
		borderRadius: radius,
		backgroundColor: background
	};
	const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const headingLineHeight = toLineHeight(headingSize, lineHeightMultiplier);
	const iconCellStyle = {
		height: heading !== void 0 ? headingLineHeight : lineHeight,
		justifyContent: "center"
	};
	const contentStyle = {
		flex: 1,
		flexDirection: "column",
		gap: partGap
	};
	const headingStyle = {
		fontFamily,
		fontSize: headingSize,
		fontWeight: toFontWeight(headingWeight),
		lineHeight: headingLineHeight,
		color: foreground
	};
	const bodyOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const dismissStyle = {
		marginTop: -dismissMargin,
		marginRight: -dismissMargin
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Alert",
		accessibilityRole: live === "alert" ? "alert" : void 0,
		accessibilityLiveRegion: live === "alert" ? "assertive" : live === "status" ? "polite" : void 0,
		accessibilityLabel: announcement !== "" ? announcement : void 0,
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(View, {
		style: iconCellStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: tone,
		size: "lg",
		color: icon,
		overrides: overrides?.iconSize ? { size: overrides.iconSize } : void 0
	})), /* @__PURE__ */ React.createElement(View, { style: contentStyle }, heading !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		allowFontScaling: true,
		style: headingStyle
	}, heading) : null, typeof children === "string" ? /* @__PURE__ */ React.createElement(Text, { overrides: bodyOverrides }, children) : children), dismissible ? /* @__PURE__ */ React.createElement(View, { style: dismissStyle }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$23.dismissLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: onDismiss
	})) : null);
}
//#endregion
//#region src/Landmark.tsx
/** Roles whose `label` becomes the group's `accessibilityLabel` on iOS and Android. */
const LABELLED_ROLES = /* @__PURE__ */ new Set([
	"navigation",
	"region",
	"form"
]);
/** Roles that are only landmarks when they carry a name. */
const NAME_REQUIRED_ROLES = /* @__PURE__ */ new Set(["region", "form"]);
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
function Landmark({ role, label, children }) {
	React.useEffect(() => {
		if (__DEV__ && NAME_REQUIRED_ROLES.has(role) && (label === void 0 || label === "")) console.warn(`Landmark: role "${role}" is only a landmark when it has a label.`);
	}, [role, label]);
	const nativeRole = role === "search" ? void 0 : role;
	const legacyRole = role === "search" ? "search" : void 0;
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Landmark",
		role: nativeRole,
		accessibilityRole: legacyRole,
		accessibilityLabel: LABELLED_ROLES.has(role) ? label : void 0
	}, children);
}
//#endregion
//#region src/Breadcrumb.tsx
const COPY$22 = {
	separator: "/",
	expandLabel: "Show all pages"
};
/** Trails longer than this collapse (when `collapse` is on). */
const COLLAPSE_ABOVE = 4;
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
function Breadcrumb({ items, label = "Breadcrumb", collapse = true, overrides, onNavigate }) {
	const { tokens } = useTheme();
	const [expanded, setExpanded] = React.useState(false);
	const firstRevealedRef = React.useRef(null);
	const [pendingFocus, setPendingFocus] = React.useState(false);
	const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
	const firstHiddenIndex = 1;
	React.useEffect(() => {
		if (!pendingFocus) return;
		setPendingFocus(false);
		const node = firstRevealedRef.current === null ? null : findNodeHandle(firstRevealedRef.current);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, [pendingFocus]);
	const gap = overrides?.gap ? resolveToken(tokens, overrides.gap) : tokens.space2;
	const fontFamily = overrides?.fontFamily ? resolveToken(tokens, overrides.fontFamily) : tokens.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(tokens, overrides.fontSize) : tokens.fontSizeSm;
	const fontWeightToken = overrides?.fontWeight ? resolveToken(tokens, overrides.fontWeight) : tokens.fontWeightRegular;
	const lineHeight = toLineHeight(fontSize, overrides?.lineHeight ? resolveToken(tokens, overrides.lineHeight) : tokens.fontLineHeightNormal);
	const navStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center"
	};
	const itemStyle = {
		minHeight: tokens.sizeTargetMin,
		justifyContent: "center"
	};
	const textStyle = {
		fontFamily,
		fontSize,
		fontWeight: toFontWeight(fontWeightToken),
		lineHeight
	};
	const currentStyle = {
		...textStyle,
		color: tokens.colorForeground
	};
	const itemStyleText = {
		...textStyle,
		color: tokens.colorForegroundMuted
	};
	const separatorStyle = {
		...textStyle,
		color: tokens.colorForegroundMuted,
		marginHorizontal: gap
	};
	const separator = (key) => /* @__PURE__ */ React.createElement(Text$1, {
		key,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		allowFontScaling: true,
		style: separatorStyle
	}, COPY$22.separator);
	const lastIndex = items.length - 1;
	const visible = items.map((item, index) => ({
		item,
		index
	})).filter(({ index }) => !collapsed || index === 0 || index >= items.length - 2);
	const nodes = [];
	visible.forEach(({ item, index }, position) => {
		if (position > 0) nodes.push(separator(`sep-${index}`));
		if (collapsed && position === 1) nodes.push(/* @__PURE__ */ React.createElement(View, {
			key: "ellipsis",
			style: itemStyle
		}, /* @__PURE__ */ React.createElement(Button, {
			label: COPY$22.expandLabel,
			variant: "ghost",
			size: "sm",
			iconOnly: true,
			leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
				name: "ellipsis",
				color: tokens.colorActionGhostForeground
			}),
			onPress: () => {
				setExpanded(true);
				setPendingFocus(true);
			}
		})), separator(`sep-ellipsis`));
		if (index === lastIndex) {
			nodes.push(/* @__PURE__ */ React.createElement(View, {
				key: `item-${index}`,
				style: itemStyle
			}, /* @__PURE__ */ React.createElement(Text$1, {
				accessibilityState: { selected: true },
				allowFontScaling: true,
				style: currentStyle
			}, item.label)));
			return;
		}
		const href = item.href;
		nodes.push(/* @__PURE__ */ React.createElement(View, {
			key: `item-${index}`,
			ref: index === firstHiddenIndex ? firstRevealedRef : void 0,
			style: itemStyle
		}, href === void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
			allowFontScaling: true,
			style: itemStyleText
		}, item.label) : /* @__PURE__ */ React.createElement(Text, { overrides: { fontSize: overrides?.fontSize ?? "font.size.sm" } }, /* @__PURE__ */ React.createElement(Link, {
			href,
			label: item.label,
			onPress: onNavigate === void 0 ? void 0 : () => onNavigate(item, index)
		}))));
	});
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Breadcrumb",
		role: "navigation",
		accessibilityLabel: label,
		style: navStyle
	}, nodes);
}
//#endregion
//#region src/Meter.tsx
const FILL_TOKEN$1 = {
	info: "colorStatusInfoIcon",
	success: "colorStatusSuccessIcon",
	warning: "colorStatusWarningIcon",
	danger: "colorStatusDangerIcon"
};
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
function Meter({ value, min = 0, max = 100, label, valueText, tone = "info", hideValue = false, overrides }) {
	const { tokens } = useTheme();
	const reducedMotion = useReducedMotion();
	const validRange = max > min;
	React.useEffect(() => {
		if (__DEV__ && !validRange) console.warn(`Meter: max (${max}) must be greater than min (${min}).`);
	}, [
		validRange,
		min,
		max
	]);
	const clamped = validRange ? Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)) : min;
	const fraction = validRange ? (clamped - min) / (max - min) : 0;
	const percent = Math.round(fraction * 100);
	const displayedValue = valueText ?? `${percent}%`;
	const trackHeight = overrides?.trackHeight ? resolveToken(tokens, overrides.trackHeight) : tokens.space2;
	const radius = overrides?.radius ? resolveToken(tokens, overrides.radius) : tokens.radiusFull;
	const labelSize = overrides?.labelSize ? resolveToken(tokens, overrides.labelSize) : tokens.fontSizeSm;
	const labelWeight = overrides?.labelWeight ? resolveToken(tokens, overrides.labelWeight) : tokens.fontWeightMedium;
	const valueSize = overrides?.valueSize ? resolveToken(tokens, overrides.valueSize) : tokens.fontSizeSm;
	const fontFamily = overrides?.fontFamily ? resolveToken(tokens, overrides.fontFamily) : tokens.fontFamilyBody;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(tokens, overrides.lineHeight) : tokens.fontLineHeightNormal;
	const partGap = overrides?.partGap ? resolveToken(tokens, overrides.partGap) : tokens.space1;
	const labelGap = overrides?.labelGap ? resolveToken(tokens, overrides.labelGap) : tokens.space2;
	const transitionDuration = overrides?.transition ? resolveToken(tokens, overrides.transition) : tokens.motionDurationBase;
	const [trackWidth, setTrackWidth] = React.useState(0);
	const fillWidth = React.useRef(new Animated.Value(0)).current;
	const laidOutWidth = React.useRef(0);
	React.useEffect(() => {
		const toValue = trackWidth * fraction;
		const resized = laidOutWidth.current !== trackWidth;
		laidOutWidth.current = trackWidth;
		if (reducedMotion || resized) {
			fillWidth.setValue(toValue);
			return;
		}
		Animated.timing(fillWidth, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(tokens.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		fraction,
		trackWidth,
		reducedMotion,
		fillWidth,
		transitionDuration,
		tokens.motionEasingStandard
	]);
	const handleTrackLayout = (event) => {
		const { width } = event.nativeEvent.layout;
		setTrackWidth((prev) => prev === width ? prev : width);
	};
	const containerStyle = {
		flexDirection: "column",
		gap: partGap
	};
	const labelRowStyle = {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
		gap: labelGap
	};
	const labelStyle = {
		fontFamily,
		fontSize: labelSize,
		fontWeight: toFontWeight(labelWeight),
		lineHeight: toLineHeight(labelSize, lineHeightMultiplier),
		color: tokens.colorForeground,
		flexShrink: 1
	};
	const valueStyle = {
		fontFamily,
		fontSize: valueSize,
		fontWeight: toFontWeight(tokens.fontWeightRegular),
		lineHeight: toLineHeight(valueSize, lineHeightMultiplier),
		color: tokens.colorForegroundMuted
	};
	const trackStyle = {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: tokens.colorBackgroundStrong,
		overflow: "hidden"
	};
	const fillStyle = {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: tokens[FILL_TOKEN$1[tone]],
		width: fillWidth,
		alignSelf: "flex-start"
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Meter",
		accessible: true,
		role: "meter",
		accessibilityLabel: label,
		accessibilityValue: {
			min,
			max,
			now: clamped,
			text: valueText
		},
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(View, { style: labelRowStyle }, /* @__PURE__ */ React.createElement(Text$1, {
		allowFontScaling: true,
		style: labelStyle
	}, label), hideValue ? null : /* @__PURE__ */ React.createElement(Text$1, {
		allowFontScaling: true,
		style: valueStyle
	}, displayedValue)), /* @__PURE__ */ React.createElement(View, {
		style: trackStyle,
		onLayout: handleTrackLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: fillStyle })));
}
//#endregion
//#region src/Card.tsx
const INSET_TOKEN = {
	sm: "layoutInsetSm",
	md: "layoutInsetMd",
	lg: "layoutInsetLg"
};
const SURFACE_BACKGROUND_TOKEN = {
	default: "colorBackground",
	subtle: "colorBackgroundSubtle"
};
const SURFACE_HOVER_TOKEN = {
	default: "colorBackgroundSubtle",
	subtle: "colorBackgroundStrong"
};
const FocusableView = View;
/**
* Walks `children`, wraps the single `Button`/`Link` it finds in an inert, hidden
* `View` (`pointerEvents="none"`, `accessibilityElementsHidden`) so it collapses into
* the surrounding Pressable for both touch and assistive technology, and records how
* to activate it. Only called for `interactive` cards.
*/
function extendInteractiveChild(node, state) {
	if (Array.isArray(node)) return node.map((child, index) => /* @__PURE__ */ React.createElement(React.Fragment, { key: index }, extendInteractiveChild(child, state)));
	if (!React.isValidElement(node)) return node;
	const element = node;
	if (element.type === Button) {
		const props = element.props;
		state.count += 1;
		state.target = {
			activate: () => props.onPress?.(),
			role: "button",
			label: props.label,
			disabled: props.disabled ?? false
		};
		return /* @__PURE__ */ React.createElement(View, {
			pointerEvents: "none",
			accessibilityElementsHidden: true,
			importantForAccessibility: "no"
		}, element);
	}
	if (element.type === Link) {
		const props = element.props;
		state.count += 1;
		state.target = {
			activate: () => {
				if (props.onPress) props.onPress(props.href);
				else Linking.openURL(props.href).catch(() => void 0);
			},
			role: "link",
			label: props.external ? `${props.label}${LINK_EXTERNAL_SUFFIX}` : props.label,
			disabled: false
		};
		return /* @__PURE__ */ React.createElement(View, {
			pointerEvents: "none",
			accessibilityElementsHidden: true,
			importantForAccessibility: "no"
		}, element);
	}
	const childProps = element.props;
	if (childProps.children === void 0) return element;
	return React.cloneElement(element, void 0, extendInteractiveChild(childProps.children, state));
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
const Card = React.forwardRef(function Card({ children, heading, headingLevel = "3", headerActions, footer, inset = "md", surface = "default", interactive = false, focusable = false, overrides }, ref) {
	const { tokens: t } = useTheme();
	const [focused, setFocused] = React.useState(false);
	const [scriptFocused, setScriptFocused] = React.useState(false);
	if (__DEV__ && interactive && focusable) console.warn("Card: `focusable` has no effect while `interactive` is set; the child Link/Button is already the sole focus target.");
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[INSET_TOKEN[inset]];
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[INSET_TOKEN[inset]];
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapNormal;
	const footerGap = overrides?.footerGap ? resolveToken(t, overrides.footerGap) : t.layoutGapTight;
	const actionsGap = overrides?.actionsGap ? resolveToken(t, overrides.actionsGap) : t.layoutGapTight;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const background = t[SURFACE_BACKGROUND_TOKEN[surface]];
	const hoverBackground = overrides?.hoverBackground ? resolveToken(t, overrides.hoverBackground) : t[SURFACE_HOVER_TOKEN[surface]];
	const showHeader = heading !== void 0 || headerActions !== void 0;
	const showFooter = footer !== void 0;
	const interactiveResult = React.useMemo(() => {
		if (!interactive) return {
			content: children,
			target: null
		};
		const state = {
			target: null,
			count: 0
		};
		const content = extendInteractiveChild(children, state);
		if (__DEV__ && state.count !== 1) console.warn(`Card: interactive requires exactly one Link or Button child; found ${state.count}.`);
		return {
			content,
			target: state.target
		};
	}, [interactive, children]);
	const surfaceStyle = {
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		gap: partGap,
		borderRadius: radius,
		backgroundColor: background
	};
	if (focusable && !interactive) {
		surfaceStyle.borderWidth = t.borderWidthFocus;
		surfaceStyle.borderColor = scriptFocused ? t.colorBorderFocus : surface === "default" ? borderColor : "transparent";
	} else if (surface === "default" && !interactive) {
		surfaceStyle.borderWidth = borderWidth;
		surfaceStyle.borderColor = borderColor;
	}
	const headerStyle = {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: heading !== void 0 && headerActions !== void 0 ? "space-between" : headerActions !== void 0 ? "flex-end" : "flex-start",
		gap: headerGap
	};
	const headerActionsStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: actionsGap
	};
	const headingCellStyle = { flexShrink: 1 };
	const footerStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: footerGap
	};
	const content = /* @__PURE__ */ React.createElement(React.Fragment, null, showHeader ? /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "card-header"
	}, heading !== void 0 ? /* @__PURE__ */ React.createElement(View, { style: headingCellStyle }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel }, heading)) : null, headerActions !== void 0 ? /* @__PURE__ */ React.createElement(View, { style: headerActionsStyle }, headerActions) : null) : null, /* @__PURE__ */ React.createElement(View, { testID: "card-body" }, interactive ? interactiveResult.content : children), showFooter ? /* @__PURE__ */ React.createElement(View, {
		style: footerStyle,
		testID: "card-footer"
	}, footer) : null);
	if (!interactive) return /* @__PURE__ */ React.createElement(FocusableView, {
		ref,
		style: surfaceStyle,
		testID: "Card",
		...focusable ? {
			tabIndex: -1,
			onFocus: () => setScriptFocused(true),
			onBlur: () => setScriptFocused(false)
		} : {}
	}, content);
	const target = interactiveResult.target;
	const pressableStyle = ({ pressed }) => ({
		...surfaceStyle,
		backgroundColor: pressed ? hoverBackground : background,
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : surface === "default" ? borderColor : "transparent"
	});
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref,
		accessibilityRole: target?.role ?? "button",
		accessibilityLabel: target?.label,
		accessibilityState: { disabled: target?.disabled ?? false },
		onPress: () => {
			if (target !== null && !target.disabled) target.activate();
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: pressableStyle,
		testID: "Card"
	}, content);
});
//#endregion
//#region src/Container.tsx
const MAX_WIDTH_TOKEN = {
	prose: "layoutMaxWidthProse",
	content: "layoutMaxWidthContent",
	page: "layoutMaxWidthPage"
};
/**
* Container — decides a screen's horizontal rhythm once: a gutter at the viewport
* edge and a cap on how wide content can get.
*
* Renders a `View` with maxWidth, alignSelf and paddingHorizontal resolved from the
* token object. `element` does not apply on React Native.
*/
function Container({ children, width = "content", gutter = "default", align = "center", overrides }) {
	const { tokens: t } = useTheme();
	const { width: viewportWidth } = useWindowDimensions();
	const style = React.useMemo(() => {
		const next = {
			width: "100%",
			alignSelf: align === "start" ? "flex-start" : "center"
		};
		if (overrides?.maxWidth) next.maxWidth = resolveToken(t, overrides.maxWidth);
		else if (width !== "full") next.maxWidth = t[MAX_WIDTH_TOKEN[width]];
		if (overrides?.paddingInline) next.paddingHorizontal = resolveToken(t, overrides.paddingInline);
		else if (gutter === "none") next.paddingHorizontal = 0;
		else if (gutter === "narrow") next.paddingHorizontal = t.layoutGutterNarrow;
		else if (gutter === "wide") next.paddingHorizontal = t.layoutGutterWide;
		else if (viewportWidth < t.layoutMaxWidthContent) next.paddingHorizontal = t.layoutGutterNarrow;
		else if (viewportWidth > t.layoutMaxWidthPage) next.paddingHorizontal = t.layoutGutterWide;
		else next.paddingHorizontal = t.layoutGutter;
		return next;
	}, [
		t,
		width,
		gutter,
		align,
		overrides,
		viewportWidth
	]);
	return /* @__PURE__ */ React.createElement(View, {
		style,
		testID: "Container"
	}, children);
}
//#endregion
//#region src/Divider.tsx
const SPACING_TOKEN = {
	none: "layoutGapNone",
	tight: "layoutGapTight",
	normal: "layoutGapNormal",
	loose: "layoutGapLoose"
};
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
function Divider({ orientation = "horizontal", label, semantic = false, spacing = "none", overrides }) {
	const { tokens: t } = useTheme();
	if (__DEV__ && semantic && label === void 0) console.warn("Divider: `semantic` has no observable effect on React Native without a `label` — there is no native separator role, so the divider stays hidden from assistive technology.");
	const thickness = overrides?.thickness ? resolveToken(t, overrides.thickness) : t.borderWidthThin;
	const color = overrides?.color ? resolveToken(t, overrides.color) : t.colorBorder;
	const labelGap = overrides?.labelGap ? resolveToken(t, overrides.labelGap) : t.layoutGapNormal;
	const spacingValue = spacing !== "none" ? overrides?.spacing ? resolveToken(t, overrides.spacing) : t[SPACING_TOKEN[spacing]] : 0;
	if (label !== void 0 && orientation === "horizontal") {
		const containerStyle = {
			flexDirection: "row",
			alignItems: "center",
			marginVertical: spacingValue
		};
		const segmentStyle = {
			flex: 1,
			height: thickness,
			backgroundColor: color
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: containerStyle,
			testID: "Divider"
		}, /* @__PURE__ */ React.createElement(View, { style: segmentStyle }), /* @__PURE__ */ React.createElement(View, { style: { marginHorizontal: labelGap } }, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			tone: "muted",
			overrides: {
				fontSize: overrides?.labelSize,
				fontFamily: overrides?.fontFamily
			}
		}, label)), /* @__PURE__ */ React.createElement(View, { style: segmentStyle }));
	}
	const rootStyle = orientation === "vertical" ? {
		width: thickness,
		alignSelf: "stretch",
		backgroundColor: color,
		marginHorizontal: spacingValue
	} : {
		height: thickness,
		width: "100%",
		backgroundColor: color,
		marginVertical: spacingValue
	};
	return /* @__PURE__ */ React.createElement(View, {
		style: rootStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "Divider"
	});
}
//#endregion
//#region src/FocusScope.tsx
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
function FocusScope({ children, trapped = true, autoFocus = "first", restoreFocus = true, returnFocusTo, active = true, onEscapeAttempt }) {
	const wrapperRef = React.useRef(null);
	const capturedOpenerRef = React.useRef(null);
	React.useEffect(() => {
		if (restoreFocus && returnFocusTo === void 0) try {
			capturedOpenerRef.current = TextInput.State.currentlyFocusedInput();
		} catch {
			capturedOpenerRef.current = null;
		}
		if (autoFocus !== "none") {
			const node = wrapperRef.current === null ? null : findNodeHandle(wrapperRef.current);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
		return () => {
			if (!restoreFocus) return;
			const opener = returnFocusTo !== void 0 ? returnFocusTo.current : capturedOpenerRef.current;
			const node = opener === null || opener === void 0 ? null : findNodeHandle(opener);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		};
	}, []);
	return /* @__PURE__ */ React.createElement(View, {
		ref: wrapperRef,
		accessibilityViewIsModal: trapped && active,
		testID: "FocusScope"
	}, children);
}
//#endregion
//#region src/Dialog.tsx
const COPY$21 = { closeLabel: "Close" };
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
function Dialog({ open, heading, description, children, footer, hideHeading = false, size = "md", dismissible = true, initialFocus = "first", onClose, onOpened, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [mounted, setMounted] = React.useState(open);
	const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
	const titleGroupRef = React.useRef(null);
	const closeButtonRef = React.useRef(null);
	const bodyRef = React.useRef(null);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const surfaceColor = t.colorOverlaySurface;
	const borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapNormal;
	const descriptionGap = overrides?.descriptionGap ? resolveToken(t, overrides.descriptionGap) : t.layoutGapTight;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDialog;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const sizeWidth = {
		sm: overrides?.widthSm ? resolveToken(t, overrides.widthSm) : t.layoutMaxWidthProse,
		md: t.layoutMaxWidthContent * .75,
		lg: t.layoutMaxWidthContent
	};
	const focusInitial = React.useCallback(() => {
		const targetRef = initialFocus === "title" ? titleGroupRef : initialFocus === "close" ? closeButtonRef : bodyRef;
		const node = targetRef.current ? findNodeHandle(targetRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, [initialFocus]);
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			if (reducedMotion) {
				progress.setValue(1);
				onOpened?.();
				focusInitial();
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) {
					onOpened?.();
					focusInitial();
				}
			});
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		mounted,
		reducedMotion
	]);
	React.useEffect(() => {
		if (__DEV__ && footer === void 0 && !dismissible) console.warn("Dialog: with no footer and dismissible={false}, provide a way to close the dialog in its body.");
	}, [footer, dismissible]);
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCloseButtonPress = () => {
		onClose?.("close-button");
	};
	const handleRequestClose = () => {
		onClose?.("escape");
	};
	const hostStyle = { flex: 1 };
	const scrimStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: scrimColor,
		opacity: progress
	};
	const centerStyle = {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: t.layoutGutter,
		zIndex: layer
	};
	const outerSurfaceStyle = {
		width: "100%",
		maxWidth: sizeWidth[size],
		maxHeight: "90%",
		borderRadius: radius,
		...shadow,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.space2, 0]
		}) }]
	};
	const innerSurfaceStyle = {
		flexShrink: 1,
		borderRadius: radius,
		borderWidth,
		borderColor,
		backgroundColor: surfaceColor,
		overflow: "hidden",
		gap: partGap
	};
	const headerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: headerGap,
		paddingHorizontal: inset,
		paddingTop: inset
	};
	const titleGroupStyle = {
		flexShrink: 1,
		gap: descriptionGap
	};
	const bodyFlexStyle = { flexShrink: 1 };
	const bodyContentStyle = { flexGrow: 1 };
	const footerStyle = {
		paddingHorizontal: inset,
		paddingBottom: inset
	};
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		animationType: "none",
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, { style: scrimStyle }), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "Dialog.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: centerStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: mounted,
		autoFocus: "none",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: outerSurfaceStyle,
		role: "dialog",
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		accessibilityHint: description,
		testID: "Dialog"
	}, /* @__PURE__ */ React.createElement(View, { style: innerSurfaceStyle }, /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "Dialog.header"
	}, /* @__PURE__ */ React.createElement(View, {
		ref: titleGroupRef,
		style: titleGroupStyle
	}, !hideHeading ? /* @__PURE__ */ React.createElement(Heading, { level: 2 }, heading) : null, description !== void 0 ? /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, description) : null), /* @__PURE__ */ React.createElement(View, { ref: closeButtonRef }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$21.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: !dismissible,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	}))), /* @__PURE__ */ React.createElement(KeyboardAvoidingView, {
		behavior: Platform.OS === "ios" ? "padding" : void 0,
		style: bodyFlexStyle
	}, /* @__PURE__ */ React.createElement(ScrollView, {
		ref: bodyRef,
		testID: "Dialog.body",
		style: bodyFlexStyle,
		contentContainerStyle: bodyContentStyle,
		keyboardShouldPersistTaps: "handled"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: overrides?.inset ? {
			paddingBlock: overrides.inset,
			paddingInline: overrides.inset
		} : void 0
	}, children))), footer !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: footerStyle,
		testID: "Dialog.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0
	}, footer)) : null))))));
}
//#endregion
//#region src/AlertDialog.tsx
const COPY$20 = { cancelLabel: "Cancel" };
const TONE = {
	danger: {
		icon: "colorStatusDangerIcon",
		glyph: "danger",
		confirmVariant: "danger"
	},
	warning: {
		icon: "colorStatusWarningIcon",
		glyph: "warning",
		confirmVariant: "primary"
	},
	info: {
		icon: "colorStatusInfoIcon",
		glyph: "info",
		confirmVariant: "primary"
	}
};
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
function AlertDialog({ open, heading, description, tone = "danger", confirmLabel, cancelLabel, confirmDisabled = false, onConfirm, onCancel, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const resolvedCancelLabel = cancelLabel ?? COPY$20.cancelLabel;
	const toneTokens = TONE[tone];
	const [mounted, setMounted] = React.useState(open);
	const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
	const titleRef = React.useRef(null);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const surfaceColor = t.colorOverlaySurface;
	const borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const textGap = overrides?.textGap ? resolveToken(t, overrides.textGap) : t.layoutGapTight;
	const iconGap = overrides?.iconGap ? resolveToken(t, overrides.iconGap) : t.layoutGapNormal;
	const width = overrides?.width ? resolveToken(t, overrides.width) : t.layoutMaxWidthProse;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDialog;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const iconColor = t[toneTokens.icon];
	const focusTitle = React.useCallback(() => {
		const node = titleRef.current ? findNodeHandle(titleRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, []);
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			if (reducedMotion) {
				progress.setValue(1);
				focusTitle();
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) focusTitle();
			});
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		mounted,
		reducedMotion
	]);
	const handleRequestClose = () => {
		onCancel?.("escape");
	};
	const handleCancelPress = () => {
		onCancel?.("cancel");
	};
	const handleConfirmPress = () => {
		onConfirm?.();
	};
	const hostStyle = { flex: 1 };
	const scrimStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: scrimColor,
		opacity: progress
	};
	const centerStyle = {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: t.layoutGutter,
		zIndex: layer
	};
	const outerSurfaceStyle = {
		width: "100%",
		maxWidth: width,
		maxHeight: "90%",
		borderRadius: radius,
		...shadow,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.space2, 0]
		}) }]
	};
	const innerSurfaceStyle = {
		borderRadius: radius,
		borderWidth,
		borderColor,
		backgroundColor: surfaceColor,
		overflow: "hidden",
		padding: inset,
		gap: partGap
	};
	const iconRowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: iconGap
	};
	const titleGroupStyle = {
		flexShrink: 1,
		gap: textGap
	};
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		animationType: "none",
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, {
		style: scrimStyle,
		testID: "AlertDialog.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: centerStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: mounted,
		autoFocus: "none",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: outerSurfaceStyle,
		role: "alertdialog",
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		accessibilityHint: description,
		testID: "AlertDialog"
	}, /* @__PURE__ */ React.createElement(View, { style: innerSurfaceStyle }, /* @__PURE__ */ React.createElement(View, { style: iconRowStyle }, /* @__PURE__ */ React.createElement(Icon, {
		name: toneTokens.glyph,
		size: "lg",
		color: iconColor,
		overrides: overrides?.iconSize ? { size: overrides.iconSize } : void 0
	}), /* @__PURE__ */ React.createElement(View, {
		ref: titleRef,
		style: titleGroupStyle
	}, /* @__PURE__ */ React.createElement(Heading, { level: 2 }, heading), /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, description))), /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0
	}, /* @__PURE__ */ React.createElement(Button, {
		label: resolvedCancelLabel,
		variant: "secondary",
		onPress: handleCancelPress
	}), /* @__PURE__ */ React.createElement(Button, {
		label: confirmLabel,
		variant: toneTokens.confirmVariant,
		disabled: confirmDisabled,
		onPress: handleConfirmPress
	}))))))));
}
//#endregion
//#region src/BottomSheet.tsx
const COPY$19 = { closeLabel: "Close" };
const SHARED_DIALOG_BINDING = {
	scrim: "scrim",
	shadow: "shadow",
	radius: "radius",
	inset: "inset",
	partGap: "partGap",
	footerGap: "footerGap",
	layer: "layer",
	enter: "enter",
	exit: "exit"
};
const DRAG_DISMISS_RATIO$2 = .25;
const DRAG_DISMISS_VELOCITY$2 = 1.5;
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
function BottomSheet({ open, heading, hideHeading = false, children, footer, height = "content", dismissible = true, dragToDismiss = true, onClose, onDragDismiss, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const [mounted, setMounted] = React.useState(open);
	const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
	const dragY = React.useRef(new Animated.Value(0)).current;
	const surfaceHeightRef = React.useRef(0);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const surfaceColor = t.colorOverlaySurface;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const handleHeight = overrides?.handleHeight ? resolveToken(t, overrides.handleHeight) : t.space1;
	const handleWidth = overrides?.handleWidth ? resolveToken(t, overrides.handleWidth) : t.space10;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.layoutMaxWidthProse;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const isWide = windowWidth > maxWidth;
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			dragY.setValue(0);
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start();
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		mounted,
		reducedMotion
	]);
	React.useEffect(() => {
		if (__DEV__ && footer === void 0 && !dismissible) console.warn("BottomSheet: with no footer and dismissible={false}, provide a way to close the sheet in its body.");
	}, [footer, dismissible]);
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCloseButtonPress = () => {
		onClose?.("close-button");
	};
	const handleRequestClose = () => {
		onClose?.("escape");
	};
	const handleSurfaceLayout = (event) => {
		surfaceHeightRef.current = event.nativeEvent.layout.height;
	};
	const panResponder = React.useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: () => false,
		onMoveShouldSetPanResponder: (_, gestureState) => dragToDismiss && dismissible && gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
		onPanResponderMove: (_, gestureState) => {
			if (gestureState.dy > 0) dragY.setValue(gestureState.dy);
		},
		onPanResponderRelease: (_, gestureState) => {
			const threshold = (surfaceHeightRef.current || windowHeight * .5) * DRAG_DISMISS_RATIO$2;
			if (gestureState.dy > threshold || gestureState.vy > DRAG_DISMISS_VELOCITY$2) {
				onDragDismiss?.();
				onClose?.("drag");
				if (reducedMotion) dragY.setValue(windowHeight);
				else Animated.decay(dragY, {
					velocity: Math.max(gestureState.vy, .5),
					deceleration: .998,
					useNativeDriver: false
				}).start();
				return;
			}
			if (reducedMotion) {
				dragY.setValue(0);
				return;
			}
			Animated.timing(dragY, {
				toValue: 0,
				duration: exitDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			}).start();
		},
		onPanResponderTerminate: () => {
			if (reducedMotion) {
				dragY.setValue(0);
				return;
			}
			Animated.timing(dragY, {
				toValue: 0,
				duration: exitDuration,
				useNativeDriver: false
			}).start();
		}
	}), [
		dragToDismiss,
		dismissible,
		dragY,
		windowHeight,
		onDragDismiss,
		onClose,
		reducedMotion,
		exitDuration,
		t.motionEasingStandard
	]);
	if (isWide) {
		const dialogOverrides = overrides ? Object.fromEntries(Object.entries(overrides).map(([key, value]) => [SHARED_DIALOG_BINDING[key], value]).filter((entry) => entry[0] !== void 0)) : void 0;
		return /* @__PURE__ */ React.createElement(Dialog, {
			open,
			heading,
			hideHeading,
			size: "md",
			dismissible,
			footer,
			onClose,
			overrides: dialogOverrides
		}, children);
	}
	const hostStyle = { flex: 1 };
	const scrimStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: scrimColor,
		opacity: progress
	};
	const anchorStyle = {
		flex: 1,
		justifyContent: "flex-end",
		zIndex: layer
	};
	const entryTranslateY = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [windowHeight, 0]
	});
	const surfaceStyle = {
		width: "100%",
		height: height === "half" ? windowHeight * .5 : height === "full" ? windowHeight - t.layoutGutter : void 0,
		maxHeight: height === "content" ? windowHeight * .9 : void 0,
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
		...shadow,
		backgroundColor: surfaceColor,
		overflow: "hidden",
		gap: partGap,
		transform: [{ translateY: Animated.add(entryTranslateY, dragY) }]
	};
	const headerStyle = {
		paddingHorizontal: inset,
		paddingTop: t.spaceSm,
		gap: t.layoutGapTight
	};
	const handleStyle = {
		alignSelf: "center",
		width: handleWidth,
		height: handleHeight,
		borderRadius: t.radiusFull,
		backgroundColor: t.colorForegroundMuted
	};
	const headingRowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: t.layoutGapNormal
	};
	const bodyFlexStyle = { flexShrink: 1 };
	const bodyContentStyle = { flexGrow: 1 };
	const footerStyle = {
		paddingHorizontal: inset,
		paddingBottom: inset
	};
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, { style: scrimStyle }), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "BottomSheet.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: anchorStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: mounted,
		autoFocus: "first",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: surfaceStyle,
		onLayout: handleSurfaceLayout,
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		testID: "BottomSheet"
	}, /* @__PURE__ */ React.createElement(View, {
		...dragToDismiss && dismissible ? panResponder.panHandlers : null,
		style: headerStyle,
		testID: "BottomSheet.header"
	}, /* @__PURE__ */ React.createElement(View, {
		style: handleStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "BottomSheet.handle"
	}), /* @__PURE__ */ React.createElement(View, { style: headingRowStyle }, !hideHeading ? /* @__PURE__ */ React.createElement(Heading, { level: 2 }, heading) : null, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$19.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: !dismissible,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	}))), /* @__PURE__ */ React.createElement(ScrollView, {
		testID: "BottomSheet.body",
		style: bodyFlexStyle,
		contentContainerStyle: bodyContentStyle,
		keyboardShouldPersistTaps: "handled"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: overrides?.inset ? {
			paddingBlock: overrides.inset,
			paddingInline: overrides.inset
		} : void 0
	}, children)), footer !== void 0 ? /* @__PURE__ */ React.createElement(SafeAreaView, {
		style: footerStyle,
		testID: "BottomSheet.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0
	}, footer)) : null)))));
}
//#endregion
//#region src/ActionSheet.tsx
const COPY$18 = {
	cancelLabel: "Cancel",
	defaultLabel: "Actions"
};
const DRAG_DISMISS_RATIO$1 = .25;
const DRAG_DISMISS_VELOCITY$1 = 1.5;
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
function ActionSheet({ open, heading, actions, dismissible = true, cancelLabel, onAction, onClose, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { height: windowHeight } = useWindowDimensions();
	const resolvedCancelLabel = cancelLabel ?? COPY$18.cancelLabel;
	const accessibleName = heading ?? COPY$18.defaultLabel;
	const [mounted, setMounted] = React.useState(open);
	const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
	const dragY = React.useRef(new Animated.Value(0)).current;
	const surfaceHeightRef = React.useRef(0);
	const itemRefs = React.useRef(/* @__PURE__ */ new Map());
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const surfaceColor = t.colorOverlaySurface;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const itemPaddingBlock = overrides?.itemPaddingBlock ? resolveToken(t, overrides.itemPaddingBlock) : t.spaceSm;
	const itemPaddingInline = overrides?.itemPaddingInline ? resolveToken(t, overrides.itemPaddingInline) : t.layoutInsetMd;
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNormal;
	const headerPaddingBlock = overrides?.headerPaddingBlock ? resolveToken(t, overrides.headerPaddingBlock) : t.spaceSm;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const dividerColor = overrides?.divider ? resolveToken(t, overrides.divider) : t.colorBorder;
	const dividerWidth = overrides?.dividerWidth ? resolveToken(t, overrides.dividerWidth) : t.borderWidthThin;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const minTarget = t.sizeTargetComfortable;
	const itemHoverColor = t.colorBackgroundSubtle;
	const itemColor = t.colorForeground;
	const itemDangerColor = t.colorForegroundDanger;
	const focusRingColor = t.colorBorderFocus;
	const focusRingWidth = t.borderWidthFocus;
	const normalActions = actions.filter((action) => action.tone !== "danger");
	const dangerActions = actions.filter((action) => action.tone === "danger");
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	const registerItemRef = (id) => (node) => {
		if (node) itemRefs.current.set(id, node);
		else itemRefs.current.delete(id);
	};
	const focusFirstEnabledAction = React.useCallback(() => {
		const target = actions.find((action) => action.disabled !== true);
		const node = target ? itemRefs.current.get(target.id) : null;
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, [actions]);
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			dragY.setValue(0);
			if (reducedMotion) {
				progress.setValue(1);
				focusFirstEnabledAction();
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) focusFirstEnabledAction();
			});
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		mounted,
		reducedMotion
	]);
	React.useEffect(() => {
		if (__DEV__ && actions.length === 0) console.warn("ActionSheet: `actions` is empty; the sheet would open with nothing to choose.");
		else if (__DEV__ && actions.length > 8) console.warn("ActionSheet: more than eight actions; consider giving this item its own screen instead.");
	}, [actions]);
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCancelPress = () => {
		onClose?.("cancel");
	};
	const handleRequestClose = () => {
		onClose?.("escape");
	};
	const handleSurfaceLayout = (event) => {
		surfaceHeightRef.current = event.nativeEvent.layout.height;
	};
	const handleActionPress = (action) => {
		if (action.disabled === true) return;
		onAction?.(action.id);
	};
	const panResponder = React.useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: () => false,
		onMoveShouldSetPanResponder: (_, gestureState) => dismissible && gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
		onPanResponderMove: (_, gestureState) => {
			if (gestureState.dy > 0) dragY.setValue(gestureState.dy);
		},
		onPanResponderRelease: (_, gestureState) => {
			const threshold = (surfaceHeightRef.current || windowHeight * .5) * DRAG_DISMISS_RATIO$1;
			if (gestureState.dy > threshold || gestureState.vy > DRAG_DISMISS_VELOCITY$1) {
				onClose?.("drag");
				if (reducedMotion) dragY.setValue(windowHeight);
				else Animated.decay(dragY, {
					velocity: Math.max(gestureState.vy, .5),
					deceleration: .998,
					useNativeDriver: false
				}).start();
				return;
			}
			if (reducedMotion) {
				dragY.setValue(0);
				return;
			}
			Animated.timing(dragY, {
				toValue: 0,
				duration: exitDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			}).start();
		},
		onPanResponderTerminate: () => {
			if (reducedMotion) {
				dragY.setValue(0);
				return;
			}
			Animated.timing(dragY, {
				toValue: 0,
				duration: exitDuration,
				useNativeDriver: false
			}).start();
		}
	}), [
		dismissible,
		dragY,
		windowHeight,
		onClose,
		reducedMotion,
		exitDuration,
		t.motionEasingStandard
	]);
	const hostStyle = { flex: 1 };
	const scrimStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: scrimColor,
		opacity: progress
	};
	const anchorStyle = {
		flex: 1,
		justifyContent: "flex-end",
		zIndex: layer
	};
	const entryTranslateY = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [windowHeight, 0]
	});
	const surfaceStyle = {
		width: "100%",
		maxHeight: windowHeight * .9,
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
		...shadow,
		backgroundColor: surfaceColor,
		overflow: "hidden",
		transform: [{ translateY: Animated.add(entryTranslateY, dragY) }]
	};
	const headerStyle = {
		paddingHorizontal: itemPaddingInline,
		paddingVertical: headerPaddingBlock,
		gap: t.layoutGapTight
	};
	const handleStyle = {
		alignSelf: "center",
		width: t.space10,
		height: t.space1,
		borderRadius: t.radiusFull,
		backgroundColor: t.colorForegroundMuted
	};
	const dividerStyle = {
		borderBottomWidth: dividerWidth,
		borderBottomColor: dividerColor
	};
	const cancelRowStyle = {
		paddingHorizontal: itemPaddingInline,
		paddingVertical: headerPaddingBlock
	};
	const itemRowStyle = (focused, disabled) => ({
		flexDirection: "row",
		alignItems: "center",
		gap: itemGap,
		minHeight: minTarget,
		paddingVertical: itemPaddingBlock,
		paddingHorizontal: itemPaddingInline,
		backgroundColor: focused ? itemHoverColor : "transparent",
		borderWidth: focusRingWidth,
		borderColor: focused ? focusRingColor : "transparent",
		opacity: disabled ? t.opacityDisabled : 1
	});
	const itemLabelStyle = (danger) => ({
		flexShrink: 1,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: danger ? itemDangerColor : itemColor
	});
	function renderAction(action) {
		const danger = action.tone === "danger";
		return /* @__PURE__ */ React.createElement(ActionSheetItemRow, {
			key: action.id,
			action,
			registerRef: registerItemRef(action.id),
			rowStyle: itemRowStyle,
			labelStyle: itemLabelStyle(danger),
			iconColor: danger ? itemDangerColor : itemColor,
			onActivate: () => handleActionPress(action)
		});
	}
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, { style: scrimStyle }), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "ActionSheet.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: anchorStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: mounted,
		autoFocus: "none",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: surfaceStyle,
		onLayout: handleSurfaceLayout,
		accessibilityViewIsModal: true,
		accessibilityRole: "menu",
		accessibilityLabel: accessibleName,
		testID: "ActionSheet"
	}, /* @__PURE__ */ React.createElement(View, {
		...panResponder.panHandlers,
		style: headerStyle,
		testID: "ActionSheet.header"
	}, /* @__PURE__ */ React.createElement(View, {
		style: handleStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "ActionSheet.handle"
	}), heading !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: {
			fontSize: overrides?.titleSize,
			fontFamily: overrides?.fontFamily
		}
	}, heading) : null), /* @__PURE__ */ React.createElement(View, { testID: "ActionSheet.list" }, normalActions.map((action) => renderAction(action)), dangerActions.length > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(View, { style: dividerStyle }), dangerActions.map((action) => renderAction(action))) : null), /* @__PURE__ */ React.createElement(View, { style: dividerStyle }), /* @__PURE__ */ React.createElement(View, { style: cancelRowStyle }, /* @__PURE__ */ React.createElement(Button, {
		label: resolvedCancelLabel,
		variant: "secondary",
		disabled: !dismissible,
		onPress: handleCancelPress
	})))))));
}
/** One action row. Its own component so focus state does not re-render the whole list. */
function ActionSheetItemRow({ action, registerRef, rowStyle, labelStyle, iconColor, onActivate }) {
	const [focused, setFocused] = React.useState(false);
	const disabled = action.disabled === true;
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: registerRef,
		accessibilityRole: "menuitem",
		accessibilityLabel: action.label,
		accessibilityState: { disabled },
		onPress: () => {
			if (!disabled) onActivate();
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: rowStyle(focused, disabled),
		testID: "ActionSheet.item"
	}, action.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: action.icon,
		color: iconColor
	})) : null, /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle
	}, action.label));
}
//#endregion
//#region src/Menu.tsx
const TRIGGER_FOREGROUND = {
	ghost: "colorActionGhostForeground",
	secondary: "colorActionSecondaryForeground",
	primary: "colorActionPrimaryForeground"
};
function flattenActions(items) {
	const result = [];
	for (const item of items) {
		if ("separator" in item) continue;
		if ("group" in item) result.push(...flattenActions(item.items));
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
function toActionSheetActions(items) {
	return flattenActions(items).map((action) => ({
		id: action.id,
		label: action.label,
		icon: action.icon,
		tone: action.tone,
		disabled: action.disabled
	}));
}
/** `ActionSheet` distinguishes four dismissal paths where `Menu` only has `escape` and `outside`; `cancel` and `drag` both collapse to `outside`. */
function mapActionSheetCloseReason(reason) {
	return reason === "escape" ? "escape" : "outside";
}
/** Positions the popup from the trigger's measured rect for `placement`, flipping either axis on overflow. `start`/`end` resolve against the writing direction. */
function computeMenuPosition(trigger, popupWidth, popupHeight, placement, windowSize, offset) {
	const [vert, horiz] = placement.split("-");
	let vertical = vert;
	const spaceBelow = windowSize.height - (trigger.y + trigger.height);
	const spaceAbove = trigger.y;
	if (vertical === "bottom" && spaceBelow < popupHeight + offset && spaceAbove > spaceBelow) vertical = "top";
	else if (vertical === "top" && spaceAbove < popupHeight + offset && spaceBelow > spaceAbove) vertical = "bottom";
	let alignLeft = I18nManager.isRTL ? horiz === "end" : horiz === "start";
	const spaceRightOfLeftAlign = windowSize.width - trigger.x;
	const spaceLeftOfRightAlign = trigger.x + trigger.width;
	if (alignLeft && spaceRightOfLeftAlign < popupWidth && spaceLeftOfRightAlign >= popupWidth) alignLeft = false;
	else if (!alignLeft && spaceLeftOfRightAlign < popupWidth && spaceRightOfLeftAlign >= popupWidth) alignLeft = true;
	return {
		top: vertical === "bottom" ? trigger.y + trigger.height + offset : trigger.y - offset - popupHeight,
		left: alignLeft ? trigger.x : trigger.x + trigger.width - popupWidth
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
function Menu({ label, items, triggerVariant = "ghost", triggerIcon = "chevron-down", iconOnly = false, placement = "bottom-start", open, onAction, onOpenChange, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const windowSize = useWindowDimensions();
	const isPhoneWidth = windowSize.width <= t.layoutMaxWidthProse;
	const triggerRef = React.useRef(null);
	const itemRefs = React.useRef(/* @__PURE__ */ new Map());
	const hasFocusedInitialRef = React.useRef(false);
	const latestItemsRef = React.useRef(items);
	latestItemsRef.current = items;
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = isControlled ? open : internalOpen;
	const [triggerRect, setTriggerRect] = React.useState(null);
	const [popupSize, setPopupSize] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
	const mountedRef = React.useRef(false);
	const previousOpenRef = React.useRef(isOpen);
	const selfEmittedRef = React.useRef(null);
	React.useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			previousOpenRef.current = isOpen;
			return;
		}
		if (isControlled && previousOpenRef.current !== isOpen) {
			if (!(selfEmittedRef.current === isOpen)) onOpenChange?.({
				open: isOpen,
				reason: "controlled"
			});
		}
		selfEmittedRef.current = null;
		previousOpenRef.current = isOpen;
	}, [isOpen, isControlled]);
	const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const popupPadding = overrides?.popupPadding ? resolveToken(t, overrides.popupPadding) : t.space1;
	const popupOffset = overrides?.popupOffset ? resolveToken(t, overrides.popupOffset) : t.space1;
	const maxHeightCap = overrides?.maxHeight ? resolveToken(t, overrides.maxHeight) : t.layoutMaxWidthProse;
	const minWidth = overrides?.minWidth ? resolveToken(t, overrides.minWidth) : t.space20 * 2.5;
	const itemPaddingBlock = overrides?.itemPaddingBlock ? resolveToken(t, overrides.itemPaddingBlock) : t.spaceSm;
	const itemPaddingInline = overrides?.itemPaddingInline ? resolveToken(t, overrides.itemPaddingInline) : t.spaceMd;
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNormal;
	const itemRadius = overrides?.itemRadius ? resolveToken(t, overrides.itemRadius) : t.radiusSm;
	const groupLabelSize = overrides?.groupLabelSize ? resolveToken(t, overrides.groupLabelSize) : t.fontSizeXs;
	const groupLabelWeight = overrides?.groupLabelWeight ? resolveToken(t, overrides.groupLabelWeight) : t.fontWeightSemibold;
	const shortcutSize = overrides?.shortcutSize ? resolveToken(t, overrides.shortcutSize) : t.fontSizeSm;
	const separatorColor = overrides?.separator ? resolveToken(t, overrides.separator) : t.colorBorder;
	const separatorMargin = overrides?.separatorMargin ? resolveToken(t, overrides.separatorMargin) : t.space1;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDropdown;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast;
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
		if (__DEV__ && items.length === 0) console.warn("Menu: `items` is empty; the popup would open with nothing to choose.");
	}, [items]);
	React.useEffect(() => {
		if (__DEV__ && iconOnly && triggerIcon === "none") console.warn("Menu: `iconOnly` with `triggerIcon` \"none\" leaves the trigger with no visible glyph.");
	}, [iconOnly, triggerIcon]);
	const registerItemRef = (id) => (node) => {
		if (node) itemRefs.current.set(id, node);
		else itemRefs.current.delete(id);
	};
	const focusFirstEnabledItem = React.useCallback(() => {
		const target = flattenActions(latestItemsRef.current).filter((action) => action.disabled !== true)[0];
		const node = target ? itemRefs.current.get(target.id) : null;
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	const focusTrigger = React.useCallback(() => {
		const handle = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	const changeOpen = (next, reason) => {
		if (!isControlled) setInternalOpen(next);
		else selfEmittedRef.current = next;
		onOpenChange?.({
			open: next,
			reason
		});
	};
	const closeMenu = (reason) => {
		if (!isOpen) return;
		changeOpen(false, reason);
		focusTrigger();
	};
	const handleTriggerPress = () => {
		if (isOpen) {
			closeMenu("trigger");
			return;
		}
		changeOpen(true, "trigger");
	};
	const handleRequestClose = () => {
		closeMenu("escape");
	};
	const handleScrimPress = () => {
		closeMenu("outside");
	};
	const handleActivate = (action) => {
		if (action.disabled === true) return;
		closeMenu("action");
		onAction?.(action.id);
	};
	const handleSheetAction = (id) => {
		closeMenu("action");
		onAction?.(id);
	};
	const handleSheetClose = (reason) => {
		closeMenu(mapActionSheetCloseReason(reason));
	};
	const handlePopupLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setPopupSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	React.useEffect(() => {
		if (isPhoneWidth || !isOpen) {
			hasFocusedInitialRef.current = false;
			progress.setValue(0);
			setTriggerRect(null);
			setPopupSize(null);
			return;
		}
		triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({
			x,
			y,
			width,
			height
		}));
	}, [isOpen, isPhoneWidth]);
	React.useEffect(() => {
		if (isPhoneWidth || !isOpen || triggerRect === null || popupSize === null || hasFocusedInitialRef.current) return;
		hasFocusedInitialRef.current = true;
		if (reducedMotion) {
			progress.setValue(1);
			focusFirstEnabledItem();
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 1,
			duration: enterDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) focusFirstEnabledItem();
		});
		return () => animation.stop();
	}, [
		isOpen,
		isPhoneWidth,
		triggerRect,
		popupSize,
		reducedMotion
	]);
	const popupWidth = triggerRect ? Math.max(minWidth, triggerRect.width) : minWidth;
	const popupHeight = popupSize?.height ?? 0;
	const position = triggerRect ? computeMenuPosition(triggerRect, popupWidth, popupHeight, placement, windowSize, popupOffset) : {
		top: 0,
		left: 0
	};
	const maxListHeight = Math.max(0, Math.min(maxHeightCap, windowSize.height - popupOffset * 2));
	const triggerIconElement = triggerIcon !== "none" ? /* @__PURE__ */ React.createElement(Icon, {
		name: triggerIcon,
		color: triggerIconColor
	}) : void 0;
	const trigger = /* @__PURE__ */ React.createElement(Button, {
		label,
		variant: triggerVariant,
		iconOnly,
		expanded: isOpen,
		leadingIcon: iconOnly ? triggerIconElement : void 0,
		trailingIcon: iconOnly ? void 0 : triggerIconElement,
		onPress: handleTriggerPress
	});
	if (isPhoneWidth) return /* @__PURE__ */ React.createElement(View, { testID: "Menu" }, trigger, /* @__PURE__ */ React.createElement(ActionSheet, {
		open: isOpen,
		heading: label,
		actions: toActionSheetActions(items),
		onAction: handleSheetAction,
		onClose: handleSheetClose
	}));
	const hostStyle = { flex: 1 };
	const popupOuterStyle = {
		position: "absolute",
		top: position.top,
		left: position.left,
		width: popupWidth,
		borderRadius: radius,
		...shadow,
		zIndex: layer,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.space1, 0]
		}) }]
	};
	const popupInnerStyle = {
		borderRadius: radius,
		borderWidth,
		borderColor: border,
		backgroundColor: surfaceColor,
		overflow: "hidden"
	};
	const listContentStyle = { padding: popupPadding };
	const groupLabelRowStyle = {
		paddingHorizontal: itemPaddingInline,
		paddingTop: t.space1,
		paddingBottom: t.space1
	};
	const groupLabelStyle = {
		fontFamily,
		fontSize: groupLabelSize,
		fontWeight: toFontWeight(groupLabelWeight),
		lineHeight: toLineHeight(groupLabelSize, t.fontLineHeightNormal),
		color: groupLabelColor
	};
	const separatorStyle = {
		marginVertical: separatorMargin,
		borderBottomWidth: t.borderWidthThin,
		borderBottomColor: separatorColor
	};
	const itemRowStyle = (focused, disabled) => ({
		flexDirection: "row",
		alignItems: "center",
		gap: itemGap,
		minHeight: t.sizeTargetMin,
		paddingVertical: itemPaddingBlock,
		paddingHorizontal: itemPaddingInline,
		borderRadius: itemRadius,
		backgroundColor: focused ? itemHoverColor : "transparent",
		borderWidth: focusRingWidth,
		borderColor: focused ? focusRingColor : "transparent",
		opacity: disabled ? t.opacityDisabled : 1
	});
	const itemLabelStyle = (danger) => ({
		flexShrink: 1,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: danger ? itemDangerColor : itemColor
	});
	const shortcutStyle = {
		marginLeft: "auto",
		fontFamily,
		fontSize: shortcutSize,
		lineHeight: toLineHeight(shortcutSize, t.fontLineHeightNormal),
		color: shortcutColor
	};
	function renderAction(action, path) {
		const disabled = action.disabled === true;
		const danger = action.tone === "danger";
		return /* @__PURE__ */ React.createElement(MenuActionRow, {
			key: path,
			action,
			disabled,
			registerRef: registerItemRef(action.id),
			rowStyle: itemRowStyle,
			labelStyle: itemLabelStyle(danger),
			shortcutStyle,
			iconColor: danger ? itemDangerColor : itemColor,
			onActivate: () => handleActivate(action)
		});
	}
	function renderNode(node, path) {
		if ("separator" in node) return /* @__PURE__ */ React.createElement(View, {
			key: path,
			style: separatorStyle,
			testID: "Menu.separator"
		});
		if ("group" in node) return /* @__PURE__ */ React.createElement(View, { key: path }, /* @__PURE__ */ React.createElement(View, { style: groupLabelRowStyle }, /* @__PURE__ */ React.createElement(Text$1, { style: groupLabelStyle }, node.group)), node.items.map((child, index) => renderNode(child, `${path}-${index}`)));
		return renderAction(node, path);
	}
	return /* @__PURE__ */ React.createElement(View, { testID: "Menu" }, /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false
	}, trigger), /* @__PURE__ */ React.createElement(Modal, {
		visible: isOpen,
		transparent: true,
		animationType: "none",
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "Menu.scrim"
	}), triggerRect !== null ? /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: isOpen,
		autoFocus: "none",
		restoreFocus: false
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: popupOuterStyle,
		onLayout: handlePopupLayout,
		accessibilityViewIsModal: true,
		accessibilityRole: "menu",
		accessibilityLabel: label,
		testID: "Menu.popup"
	}, /* @__PURE__ */ React.createElement(View, { style: popupInnerStyle }, /* @__PURE__ */ React.createElement(ScrollView, {
		style: { maxHeight: maxListHeight },
		contentContainerStyle: listContentStyle
	}, items.map((item, index) => renderNode(item, String(index))))))) : null)));
}
/** One menu row. Its own component so focus/hover state does not re-render the whole list. */
function MenuActionRow({ action, disabled, registerRef, rowStyle, labelStyle, shortcutStyle, iconColor, onActivate }) {
	const [focused, setFocused] = React.useState(false);
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: registerRef,
		accessibilityRole: "menuitem",
		accessibilityLabel: action.label,
		accessibilityState: { disabled },
		onPress: () => {
			if (!disabled) onActivate();
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: rowStyle(focused, disabled)
	}, action.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: action.icon,
		color: iconColor
	})) : null, /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle
	}, action.label), action.shortcut !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		style: shortcutStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, action.shortcut) : null);
}
//#endregion
//#region src/Tooltip.tsx
/** Module-level "warm until" timestamp, shared by every Tooltip: moving the pointer from one just-hidden tooltip's trigger to the next shows it instantly instead of waiting out `delay`, the same toolbar behavior the web platform implements. */
let warmUntil = 0;
/** Positions the bubble from the trigger's own measured size — there is no portal, so this is relative to the shared parent rather than the window — flipping `start`/`end` against the writing direction. Does not flip `top`/`bottom` on overflow: unlike Menu's dropdown, native has no window-rect measurement wired up for this transient, non-portaled view. */
function computeBubbleOffset(placement, trigger, bubble, offset) {
	switch (placement) {
		case "top": return {
			bottom: trigger.height + offset,
			left: (trigger.width - bubble.width) / 2
		};
		case "bottom": return {
			top: trigger.height + offset,
			left: (trigger.width - bubble.width) / 2
		};
		case "start": return I18nManager.isRTL ? {
			left: trigger.width + offset,
			top: (trigger.height - bubble.height) / 2
		} : {
			right: trigger.width + offset,
			top: (trigger.height - bubble.height) / 2
		};
		case "end": return I18nManager.isRTL ? {
			right: trigger.width + offset,
			top: (trigger.height - bubble.height) / 2
		} : {
			left: trigger.width + offset,
			top: (trigger.height - bubble.height) / 2
		};
	}
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
function Tooltip({ content, children, placement = "top", describes = true, delay = "default", overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [open, setOpen] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);
	const [triggerSize, setTriggerSize] = React.useState(null);
	const [bubbleSize, setBubbleSize] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
	const hoverTimer = React.useRef(null);
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusSm;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.space1;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.space2;
	const offset = overrides?.offset ? resolveToken(t, overrides.offset) : t.space1;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.space20 * 3;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowRaised;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerToast;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const clearHoverTimer = React.useCallback(() => {
		if (hoverTimer.current !== null) {
			clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}
	}, []);
	React.useEffect(() => clearHoverTimer, [clearHoverTimer]);
	const show = React.useCallback(() => {
		clearHoverTimer();
		setOpen(true);
	}, [clearHoverTimer]);
	const hide = React.useCallback(() => {
		clearHoverTimer();
		setOpen((wasOpen) => {
			if (wasOpen) warmUntil = Date.now() + t.motionDurationBase;
			return false;
		});
	}, [clearHoverTimer, t.motionDurationBase]);
	const handleHoverIn = React.useCallback(() => {
		clearHoverTimer();
		if (delay === "none" || Date.now() < warmUntil) {
			show();
			return;
		}
		hoverTimer.current = setTimeout(show, t.motionDurationBase * 3);
	}, [
		clearHoverTimer,
		delay,
		show,
		t.motionDurationBase
	]);
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start();
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		mounted,
		reducedMotion
	]);
	React.useEffect(() => {
		if (Platform.OS !== "web" || !open) return;
		const globalWindow = globalThis.window;
		if (globalWindow === void 0) return;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") hide();
		};
		globalWindow.addEventListener("keydown", handleKeyDown);
		return () => globalWindow.removeEventListener("keydown", handleKeyDown);
	}, [open, hide]);
	const isElement = React.isValidElement(children);
	React.useEffect(() => {
		if (__DEV__ && (!isElement || React.Children.count(children) !== 1)) console.warn("Tooltip: `children` must be exactly one focusable element (Button, Link, or Input).");
	}, [isElement, children]);
	const child = isElement ? children : null;
	const childProps = child?.props ?? {};
	const trigger = child !== null ? React.cloneElement(child, {
		...describes ? { accessibilityHint: content } : { accessibilityLabel: content },
		onLongPress: (event) => {
			childProps.onLongPress?.(event);
			show();
		},
		onPressOut: (event) => {
			childProps.onPressOut?.(event);
			hide();
		},
		...Platform.OS === "web" ? {
			onHoverIn: (event) => {
				childProps.onHoverIn?.(event);
				handleHoverIn();
			},
			onHoverOut: (event) => {
				childProps.onHoverOut?.(event);
				hide();
			},
			onFocus: (event) => {
				childProps.onFocus?.(event);
				show();
			},
			onBlur: (event) => {
				childProps.onBlur?.(event);
				hide();
			}
		} : {}
	}) : children;
	const handleTriggerLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setTriggerSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	const handleBubbleLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setBubbleSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	const hostStyle = {
		position: "relative",
		alignSelf: "flex-start"
	};
	const bubbleStyle = {
		position: "absolute",
		...triggerSize !== null ? computeBubbleOffset(placement, triggerSize, bubbleSize ?? {
			width: 0,
			height: 0
		}, offset) : {},
		maxWidth,
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		borderRadius: radius,
		backgroundColor: t.colorInverseSurface,
		zIndex: layer,
		opacity: progress,
		...shadow
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Tooltip",
		style: hostStyle
	}, /* @__PURE__ */ React.createElement(View, { onLayout: handleTriggerLayout }, trigger), mounted && triggerSize !== null ? /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Tooltip.popup",
		onLayout: handleBubbleLayout,
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		style: bubbleStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: {
			color: "color.inverse.foreground",
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.fontSize,
			lineHeight: overrides?.lineHeight
		}
	}, content)) : null);
}
//#endregion
//#region src/Popover.tsx
const COPY$17 = { closeLabel: "Close" };
function clamp$3(value, min, max) {
	return Math.min(Math.max(value, min), Math.max(min, max));
}
/**
* Positions the panel from the trigger's measured window rect for `placement`,
* flipping the primary axis on overflow and shifting the cross axis to stay within
* the window — the closest native equivalent of the web generator's flip/shift. Also
* reports which panel edge faces the trigger, used for the optional arrow and for the
* enter animation's slide direction.
*/
function computePopoverPosition(trigger, panelWidth, panelHeight, placement, windowSize, offset) {
	const rtl = I18nManager.isRTL;
	if (placement === "start" || placement === "end") {
		let onPhysicalLeft = rtl ? placement === "end" : placement === "start";
		const spaceLeft = trigger.x;
		const spaceRight = windowSize.width - (trigger.x + trigger.width);
		if (onPhysicalLeft && spaceLeft < panelWidth + offset && spaceRight >= panelWidth + offset) onPhysicalLeft = false;
		else if (!onPhysicalLeft && spaceRight < panelWidth + offset && spaceLeft >= panelWidth + offset) onPhysicalLeft = true;
		const left = onPhysicalLeft ? trigger.x - offset - panelWidth : trigger.x + trigger.width + offset;
		return {
			top: clamp$3(trigger.y + trigger.height / 2 - panelHeight / 2, offset, windowSize.height - panelHeight - offset),
			left,
			arrowEdge: onPhysicalLeft ? "right" : "left"
		};
	}
	const [vertRaw, horiz] = placement.split("-");
	let vertical = vertRaw;
	const spaceBelow = windowSize.height - (trigger.y + trigger.height);
	const spaceAbove = trigger.y;
	if (vertical === "bottom" && spaceBelow < panelHeight + offset && spaceAbove > spaceBelow) vertical = "top";
	else if (vertical === "top" && spaceAbove < panelHeight + offset && spaceBelow > spaceAbove) vertical = "bottom";
	let left;
	if (horiz === void 0) left = trigger.x + trigger.width / 2 - panelWidth / 2;
	else left = (rtl ? horiz === "end" : horiz === "start") ? trigger.x : trigger.x + trigger.width - panelWidth;
	left = clamp$3(left, offset, windowSize.width - panelWidth - offset);
	return {
		top: vertical === "bottom" ? trigger.y + trigger.height + offset : trigger.y - offset - panelHeight,
		left,
		arrowEdge: vertical === "bottom" ? "top" : "bottom"
	};
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
function Popover({ trigger, children, heading, headingLevel = "3", open, placement = "bottom", modal = false, showArrow = false, dismissible = true, onOpenChange, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const windowSize = useWindowDimensions();
	const triggerRef = React.useRef(null);
	const bodyRef = React.useRef(null);
	const hasFocusedInitialRef = React.useRef(false);
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = isControlled ? open : internalOpen;
	const [mounted, setMounted] = React.useState(isOpen);
	const [triggerRect, setTriggerRect] = React.useState(null);
	const [panelSize, setPanelSize] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
	const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetMd;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapNormal;
	const offset = overrides?.offset ? resolveToken(t, overrides.offset) : t.space2;
	const arrowSize = overrides?.arrowSize ? resolveToken(t, overrides.arrowSize) : t.space2;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.layoutMaxWidthProse;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDropdown;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const surfaceColor = t.colorOverlaySurface;
	const scrimColor = t.colorOverlayScrim;
	const isTriggerElement = React.isValidElement(trigger);
	const triggerChild = isTriggerElement ? trigger : null;
	const triggerChildProps = triggerChild?.props ?? {};
	const triggerLabel = typeof triggerChildProps.label === "string" ? triggerChildProps.label : void 0;
	const accessibleName = heading ?? triggerLabel;
	React.useEffect(() => {
		if (__DEV__ && !isTriggerElement) console.warn("Popover: `trigger` must be exactly one focusable element (usually a Button).");
	}, [isTriggerElement]);
	React.useEffect(() => {
		if (__DEV__ && accessibleName === void 0) console.warn("Popover: no `heading` and the trigger has no string `label` to fall back to; the panel needs an accessible name.");
	}, [accessibleName]);
	const focusTrigger = React.useCallback(() => {
		const handle = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	const focusBody = React.useCallback(() => {
		const handle = bodyRef.current ? findNodeHandle(bodyRef.current) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	const changeOpen = (next, reason) => {
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const closePopover = (reason) => {
		if (!isOpen) return;
		changeOpen(false, reason);
		focusTrigger();
	};
	const handleTriggerPress = () => {
		if (isOpen) {
			closePopover("trigger");
			return;
		}
		changeOpen(true, "trigger");
	};
	const handleRequestClose = () => {
		closePopover("escape");
	};
	const handleBackdropPress = () => {
		if (modal) return;
		closePopover("outside");
	};
	const handleCloseButtonPress = () => {
		closePopover("close-button");
	};
	const handlePanelLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setPanelSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	React.useEffect(() => {
		if (isOpen) setMounted(true);
	}, [isOpen]);
	React.useEffect(() => {
		if (!isOpen) {
			hasFocusedInitialRef.current = false;
			setTriggerRect(null);
			setPanelSize(null);
			return;
		}
		triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({
			x,
			y,
			width,
			height
		}));
	}, [isOpen]);
	const position = triggerRect !== null ? computePopoverPosition(triggerRect, panelSize?.width ?? maxWidth, panelSize?.height ?? 0, placement, windowSize, offset) : null;
	React.useEffect(() => {
		if (!mounted) return;
		if (isOpen) {
			if (position === null || panelSize === null || hasFocusedInitialRef.current) return;
			hasFocusedInitialRef.current = true;
			if (reducedMotion) {
				progress.setValue(1);
				focusBody();
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) focusBody();
			});
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		isOpen,
		mounted,
		position,
		panelSize,
		reducedMotion
	]);
	const clonedTrigger = triggerChild !== null ? React.cloneElement(triggerChild, {
		onPress: (event) => {
			triggerChildProps.onPress?.(event);
			handleTriggerPress();
		},
		accessibilityState: { expanded: isOpen }
	}) : trigger;
	const hostStyle = { flex: 1 };
	const backdropStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: modal ? scrimColor : "transparent"
	};
	const slideDistance = t.space1;
	const translateAxis = position?.arrowEdge === "left" || position?.arrowEdge === "right" ? "translateX" : "translateY";
	const slideFrom = (() => {
		switch (position?.arrowEdge) {
			case "top": return -slideDistance;
			case "bottom": return slideDistance;
			case "left": return -slideDistance;
			case "right": return slideDistance;
			default: return 0;
		}
	})();
	const slideInterpolation = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [slideFrom, 0]
	});
	const panelOuterStyle = {
		position: "absolute",
		top: position?.top ?? 0,
		left: position?.left ?? 0,
		maxWidth,
		borderRadius: radius,
		zIndex: layer,
		opacity: progress,
		...shadow,
		transform: translateAxis === "translateX" ? [{ translateX: slideInterpolation }] : [{ translateY: slideInterpolation }]
	};
	const panelInnerStyle = {
		borderRadius: radius,
		borderWidth,
		borderColor: border,
		backgroundColor: surfaceColor,
		overflow: "hidden"
	};
	const contentStyle = { gap: partGap };
	const showHeader = heading !== void 0 || dismissible;
	const headerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: t.layoutGapNormal,
		paddingHorizontal: inset,
		paddingTop: inset
	};
	const headingWrapStyle = { flexShrink: 1 };
	const arrowStyle = {
		position: "absolute",
		width: arrowSize,
		height: arrowSize,
		backgroundColor: surfaceColor,
		borderWidth,
		borderColor: border,
		transform: [{ rotate: "45deg" }],
		...(() => {
			const size = arrowSize;
			switch (position?.arrowEdge) {
				case "top": return {
					top: -size / 2,
					left: (panelSize?.width ?? size * 2) / 2 - size / 2
				};
				case "bottom": return {
					bottom: -size / 2,
					left: (panelSize?.width ?? size * 2) / 2 - size / 2
				};
				case "left": return {
					left: -size / 2,
					top: (panelSize?.height ?? size * 2) / 2 - size / 2
				};
				default: return {
					right: -size / 2,
					top: (panelSize?.height ?? size * 2) / 2 - size / 2
				};
			}
		})()
	};
	return /* @__PURE__ */ React.createElement(View, { testID: "Popover" }, /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false
	}, clonedTrigger), /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		animationType: "none",
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Pressable, {
		style: backdropStyle,
		onPress: handleBackdropPress,
		accessible: false,
		testID: "Popover.backdrop"
	}), position !== null ? /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: modal,
		active: mounted,
		autoFocus: "none",
		restoreFocus: false
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: panelOuterStyle,
		onLayout: handlePanelLayout,
		accessibilityViewIsModal: modal,
		accessibilityLabel: accessibleName,
		testID: "Popover.panel"
	}, showArrow ? /* @__PURE__ */ React.createElement(View, {
		style: arrowStyle,
		testID: "Popover.arrow"
	}) : null, /* @__PURE__ */ React.createElement(View, { style: panelInnerStyle }, /* @__PURE__ */ React.createElement(View, { style: contentStyle }, showHeader ? /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "Popover.header"
	}, /* @__PURE__ */ React.createElement(View, { style: headingWrapStyle }, heading !== void 0 ? /* @__PURE__ */ React.createElement(Heading, { level: headingLevel }, heading) : null), dismissible ? /* @__PURE__ */ React.createElement(Button, {
		label: COPY$17.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	}) : null) : null, /* @__PURE__ */ React.createElement(View, {
		ref: bodyRef,
		testID: "Popover.body"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "md",
		overrides: overrides?.inset ? {
			paddingBlock: overrides.inset,
			paddingInline: overrides.inset
		} : void 0
	}, children)))))) : null)));
}
//#endregion
//#region src/Toast.tsx
const COPY$16 = {
	dismissLabel: "Dismiss",
	regionLabel: "Notifications"
};
const TONE_ICON = {
	neutral: null,
	success: "success",
	warning: "warning",
	danger: "danger"
};
const TONE_COLOR_TOKEN = {
	neutral: "colorInverseStatusNeutral",
	success: "colorInverseStatusSuccess",
	warning: "colorInverseStatusWarning",
	danger: "colorInverseStatusDanger"
};
const DURATION_LOOPS = {
	short: 6,
	long: 12
};
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
function Toast({ message, tone = "neutral", actionLabel, duration = "short", dismissible = true, overrides, onAction, onDismiss }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.layoutGapNormal;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.layoutMaxWidthProse;
	overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerToast;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const forcedPersistent = actionLabel !== void 0 || tone === "danger";
	const effectiveDuration = forcedPersistent ? "persistent" : duration;
	const isDismissible = effectiveDuration === "persistent" ? true : dismissible;
	const iconName = TONE_ICON[tone];
	const iconColor = t[TONE_COLOR_TOKEN[tone]];
	const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const [dismissReason, setDismissReason] = React.useState(null);
	const requestDismiss = React.useCallback((reason) => {
		setDismissReason((prev) => prev ?? reason);
	}, []);
	React.useEffect(() => {
		if (__DEV__ && duration !== "persistent" && forcedPersistent) console.warn("Toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.");
	}, []);
	React.useEffect(() => {
		if (Platform.OS === "ios" && message !== "") AccessibilityInfo.announceForAccessibility(message);
	}, []);
	const totalDuration = effectiveDuration === "persistent" ? null : t.motionDurationLoop * DURATION_LOOPS[effectiveDuration];
	const remainingRef = React.useRef(totalDuration ?? 0);
	const timerStartRef = React.useRef(0);
	const timerRef = React.useRef(null);
	const clearTimer = React.useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);
	const startTimer = React.useCallback(() => {
		if (totalDuration === null || dismissReason !== null) return;
		clearTimer();
		timerStartRef.current = Date.now();
		timerRef.current = setTimeout(() => requestDismiss("timeout"), remainingRef.current);
	}, [
		totalDuration,
		dismissReason,
		clearTimer,
		requestDismiss
	]);
	const pauseTimer = React.useCallback(() => {
		if (totalDuration === null) return;
		clearTimer();
		remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - timerStartRef.current));
	}, [totalDuration, clearTimer]);
	React.useEffect(() => {
		startTimer();
		return clearTimer;
	}, []);
	const progress = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		if (reducedMotion) {
			progress.setValue(1);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 1,
			duration: enterDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, []);
	React.useEffect(() => {
		if (dismissReason === null) return;
		clearTimer();
		if (reducedMotion) {
			onDismiss?.(dismissReason);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) onDismiss?.(dismissReason);
		});
		return () => animation.stop();
	}, [dismissReason]);
	const handleAction = () => {
		onAction?.();
		requestDismiss("action");
	};
	const containerStyle = {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap,
		maxWidth,
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		borderRadius: radius,
		backgroundColor: t.colorInverseSurface,
		zIndex: layer,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.space2, 0]
		}) }],
		...shadow
	};
	const iconCellStyle = {
		height: lineHeight,
		justifyContent: "center"
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Toast",
		accessibilityRole: tone === "danger" ? "alert" : void 0,
		accessibilityLiveRegion: tone === "danger" ? "assertive" : "polite",
		accessibilityLabel: message,
		onTouchStart: pauseTimer,
		onTouchEnd: startTimer,
		onTouchCancel: startTimer
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: containerStyle }, iconName !== null ? /* @__PURE__ */ React.createElement(View, {
		style: iconCellStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: iconName,
		color: iconColor
	})) : null, /* @__PURE__ */ React.createElement(View, { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Text, { overrides: {
		color: "color.inverse.foreground",
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	} }, message)), actionLabel !== void 0 ? /* @__PURE__ */ React.createElement(Button, {
		label: actionLabel,
		variant: "ghost",
		size: "sm",
		inverse: true,
		onPress: handleAction
	}) : null, isDismissible ? /* @__PURE__ */ React.createElement(Button, {
		label: COPY$16.dismissLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		inverse: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorInverseForeground
		}),
		onPress: () => requestDismiss("dismiss-button")
	}) : null));
}
const ToastContext = React.createContext(null);
/** The most recently mounted `ToastProvider`'s dispatcher, so the module-level `toast()` works outside React. Only one provider is expected to be mounted at a time, per the schema's "one ToastProvider mounted once at the app root". */
let activeDispatch = null;
const MAX_TOASTS = 3;
/**
* ToastProvider — mounted once at the app root. Renders the notification region (an
* absolutely positioned `View` above the bottom safe-area inset, `layer.toast`
* z-index, centered, up to three toasts stacked newest-at-the-bottom) and exposes
* `useToast()` / the module-level `toast()` so any code can show one. A toast shown
* with a `toastId` already on screen replaces it (`onDismiss('replaced')` on the
* replaced one); showing a fourth toast evicts the oldest the same way.
*/
function ToastProvider({ children, overrides }) {
	const { tokens: t } = useTheme();
	const [entries, setEntries] = React.useState([]);
	const entriesRef = React.useRef([]);
	const counterRef = React.useRef(0);
	const dismiss = React.useCallback((id) => {
		entriesRef.current = entriesRef.current.filter((entry) => entry.id !== id);
		setEntries(entriesRef.current);
	}, []);
	const toast = React.useCallback((options) => {
		const id = options.toastId ?? `toast-${counterRef.current += 1}`;
		const current = entriesRef.current;
		current.find((entry) => entry.id === id)?.onDismiss?.("replaced");
		const next = [...current.filter((entry) => entry.id !== id), {
			...options,
			id
		}];
		(next.length > MAX_TOASTS ? next.shift() : void 0)?.onDismiss?.("replaced");
		entriesRef.current = next;
		setEntries(next);
		return id;
	}, []);
	const value = React.useMemo(() => ({
		toast,
		dismiss
	}), [toast, dismiss]);
	React.useEffect(() => {
		activeDispatch = value;
		return () => {
			if (activeDispatch === value) activeDispatch = null;
		};
	}, [value]);
	const regionStyle = {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: overrides?.regionInset ? resolveToken(t, overrides.regionInset) : t.layoutGutter,
		alignItems: "center",
		gap: overrides?.stackGap ? resolveToken(t, overrides.stackGap) : t.layoutGapTight,
		zIndex: overrides?.layer ? resolveToken(t, overrides.layer) : t.layerToast
	};
	return /* @__PURE__ */ React.createElement(ToastContext.Provider, { value }, children, /* @__PURE__ */ React.createElement(View, {
		testID: "Toast.region",
		style: regionStyle,
		pointerEvents: "box-none",
		accessibilityLabel: COPY$16.regionLabel
	}, entries.map((entry) => /* @__PURE__ */ React.createElement(Toast, {
		...entry,
		key: entry.id,
		onDismiss: (reason) => {
			entry.onDismiss?.(reason);
			dismiss(entry.id);
		}
	}))));
}
/** Returns `{ toast, dismiss }` bound to the nearest `ToastProvider`. Warns and no-ops without one. */
function useToast() {
	const context = React.useContext(ToastContext);
	if (context === null) {
		if (__DEV__) console.warn("useToast: no ToastProvider is mounted. Wrap the app root in <ToastProvider>.");
		return {
			toast: () => "",
			dismiss: () => void 0
		};
	}
	return context;
}
/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` mounted at the app root; warns and no-ops otherwise. */
function toast(options) {
	if (activeDispatch === null) {
		if (__DEV__) console.warn("toast(): no ToastProvider is mounted. Wrap the app root in <ToastProvider>.");
		return "";
	}
	return activeDispatch.toast(options);
}
//#endregion
//#region src/SidePanel.tsx
const COPY$15 = {
	closeLabel: "Close",
	openLabel: "Open menu"
};
const DRAG_DISMISS_RATIO = .25;
const DRAG_DISMISS_VELOCITY = 1.5;
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
function SidePanel({ trigger, open, heading, hideHeading = false, children, footer, side = "start", width = "default", persistent = "never", role = "complementary", modal = false, scrim = true, dismissible = true, swipeable = true, onOpenChange, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth } = useWindowDimensions();
	const triggerRef = React.useRef(null);
	const surfaceWidthRef = React.useRef(0);
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = isControlled ? open : internalOpen;
	const [mounted, setMounted] = React.useState(isOpen);
	const progress = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
	const dragX = React.useRef(new Animated.Value(0)).current;
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const surfaceColor = t.colorOverlaySurface;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const widthDefault = overrides?.width ? resolveToken(t, overrides.width) : t.layoutMaxWidthProse;
	const widthNarrow = overrides?.widthNarrow ? resolveToken(t, overrides.widthNarrow) : t.space20 * 3;
	const widthWide = overrides?.widthWide ? resolveToken(t, overrides.widthWide) : t.layoutMaxWidthContent;
	const edgeGutter = overrides?.edgeGutter ? resolveToken(t, overrides.edgeGutter) : t.space12;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapNormal;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const persistentBreakpoint = persistent === "content" ? t.layoutMaxWidthContent : persistent === "page" ? t.layoutMaxWidthPage : null;
	const isPersistentActive = persistentBreakpoint !== null && windowWidth >= persistentBreakpoint;
	const isPhysicalLeft = I18nManager.isRTL ? side === "end" : side === "start";
	const showScrim = modal || scrim;
	const widthToken = width === "narrow" ? widthNarrow : width === "wide" ? widthWide : widthDefault;
	const overlayPanelWidth = Math.min(widthToken, windowWidth - edgeGutter);
	React.useEffect(() => {
		if (isOpen) setMounted(true);
	}, [isOpen]);
	React.useEffect(() => {
		if (isPersistentActive || !mounted) return;
		if (isOpen) {
			dragX.setValue(0);
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start();
			return () => animation.stop();
		}
		if (reducedMotion) {
			progress.setValue(0);
			setMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		isOpen,
		mounted,
		reducedMotion,
		isPersistentActive
	]);
	React.useEffect(() => {
		if (__DEV__ && footer === void 0 && !dismissible) console.warn("SidePanel: with no footer and dismissible={false}, provide a way to close the panel in its body.");
	}, [footer, dismissible]);
	React.useEffect(() => {
		if (__DEV__ && trigger === void 0 && !isControlled) console.warn("SidePanel: no `trigger` and no `open` — the panel has no way to open. Pass `open` and control it from elsewhere (a Toolbar), or provide a `trigger`.");
	}, [trigger, isControlled]);
	const focusTrigger = React.useCallback(() => {
		const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, []);
	const changeOpen = (next, reason) => {
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const requestClose = (reason) => {
		if (!isOpen) return;
		changeOpen(false, reason);
		focusTrigger();
	};
	const handleTriggerPress = () => {
		if (isOpen) {
			requestClose("trigger");
			return;
		}
		changeOpen(true, "trigger");
	};
	const handleScrimPress = () => {
		if (dismissible) requestClose("scrim");
	};
	const handleCloseButtonPress = () => {
		requestClose("close-button");
	};
	const handleRequestClose = () => {
		if (dismissible) requestClose("escape");
	};
	const handleSurfaceLayout = (event) => {
		surfaceWidthRef.current = event.nativeEvent.layout.width;
	};
	const panResponder = React.useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: () => false,
		onMoveShouldSetPanResponder: (_, gestureState) => {
			if (!swipeable || !dismissible) return false;
			return (isPhysicalLeft ? -gestureState.dx : gestureState.dx) > 4 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
		},
		onPanResponderMove: (_, gestureState) => {
			if ((isPhysicalLeft ? -gestureState.dx : gestureState.dx) > 0) dragX.setValue(gestureState.dx);
		},
		onPanResponderRelease: (_, gestureState) => {
			const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
			const awayVx = isPhysicalLeft ? -gestureState.vx : gestureState.vx;
			if (awayDx > (surfaceWidthRef.current || overlayPanelWidth) * DRAG_DISMISS_RATIO || awayVx > DRAG_DISMISS_VELOCITY) {
				requestClose("swipe");
				if (reducedMotion) dragX.setValue(isPhysicalLeft ? -windowWidth : windowWidth);
				else {
					const decayVelocity = isPhysicalLeft ? -Math.max(awayVx, .5) : Math.max(awayVx, .5);
					Animated.decay(dragX, {
						velocity: decayVelocity,
						deceleration: .998,
						useNativeDriver: false
					}).start();
				}
				return;
			}
			if (reducedMotion) {
				dragX.setValue(0);
				return;
			}
			Animated.timing(dragX, {
				toValue: 0,
				duration: exitDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			}).start();
		},
		onPanResponderTerminate: () => {
			if (reducedMotion) {
				dragX.setValue(0);
				return;
			}
			Animated.timing(dragX, {
				toValue: 0,
				duration: exitDuration,
				useNativeDriver: false
			}).start();
		}
	}), [
		swipeable,
		dismissible,
		isPhysicalLeft,
		dragX,
		windowWidth,
		overlayPanelWidth,
		reducedMotion,
		exitDuration,
		t.motionEasingStandard
	]);
	const isTriggerElement = React.isValidElement(trigger);
	const triggerChild = isTriggerElement ? trigger : null;
	const triggerChildProps = triggerChild?.props ?? {};
	const triggerHasLabel = typeof triggerChildProps.label === "string";
	React.useEffect(() => {
		if (__DEV__ && trigger !== void 0 && !isTriggerElement) console.warn("SidePanel: `trigger` must be exactly one focusable element (usually a Button).");
	}, [trigger, isTriggerElement]);
	const clonedTrigger = triggerChild !== null ? React.cloneElement(triggerChild, {
		onPress: (event) => {
			triggerChildProps.onPress?.(event);
			handleTriggerPress();
		},
		accessibilityState: { expanded: isOpen },
		...triggerHasLabel ? null : { accessibilityLabel: COPY$15.openLabel }
	}) : trigger;
	if (isPersistentActive) {
		const sidebarStyle = {
			width: widthToken,
			height: "100%",
			backgroundColor: surfaceColor,
			gap: partGap,
			...isPhysicalLeft ? {
				borderRightWidth: borderWidth,
				borderRightColor: borderColor
			} : {
				borderLeftWidth: borderWidth,
				borderLeftColor: borderColor
			}
		};
		const headerStyle = {
			paddingHorizontal: inset,
			paddingTop: inset
		};
		const bodyFlexStyle = { flexShrink: 1 };
		const bodyContentStyle = { flexGrow: 1 };
		const footerStyle = {
			paddingHorizontal: inset,
			paddingBottom: inset
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: sidebarStyle,
			role,
			accessibilityLabel: heading,
			testID: "SidePanel"
		}, !hideHeading ? /* @__PURE__ */ React.createElement(View, {
			style: headerStyle,
			testID: "SidePanel.header"
		}, /* @__PURE__ */ React.createElement(Heading, { level: 2 }, heading)) : null, /* @__PURE__ */ React.createElement(ScrollView, {
			testID: "SidePanel.body",
			style: bodyFlexStyle,
			contentContainerStyle: bodyContentStyle
		}, /* @__PURE__ */ React.createElement(Box, {
			inset: "lg",
			overrides: overrides?.inset ? {
				paddingBlock: overrides.inset,
				paddingInline: overrides.inset
			} : void 0
		}, children)), footer !== void 0 ? /* @__PURE__ */ React.createElement(SafeAreaView, {
			style: footerStyle,
			testID: "SidePanel.footer"
		}, /* @__PURE__ */ React.createElement(Stack, {
			direction: "horizontal",
			gap: "tight",
			justify: "end",
			overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0
		}, footer)) : null);
	}
	const hostStyle = { flex: 1 };
	const scrimStyle = {
		...StyleSheet.absoluteFill,
		backgroundColor: scrimColor,
		opacity: showScrim ? progress : 0
	};
	const anchorStyle = {
		flex: 1,
		flexDirection: "row",
		justifyContent: isPhysicalLeft ? "flex-start" : "flex-end",
		zIndex: layer
	};
	const entryTranslateX = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [isPhysicalLeft ? -overlayPanelWidth : overlayPanelWidth, 0]
	});
	const surfaceStyle = {
		width: overlayPanelWidth,
		height: "100%",
		...shadow,
		backgroundColor: surfaceColor,
		overflow: "hidden",
		gap: partGap,
		transform: [{ translateX: Animated.add(entryTranslateX, dragX) }]
	};
	const headerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: headerGap,
		paddingHorizontal: inset,
		paddingTop: inset
	};
	const bodyFlexStyle = { flexShrink: 1 };
	const bodyContentStyle = { flexGrow: 1 };
	const footerStyle = {
		paddingHorizontal: inset,
		paddingBottom: inset
	};
	return /* @__PURE__ */ React.createElement(View, { testID: "SidePanel" }, trigger !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false,
		testID: "SidePanel.trigger"
	}, clonedTrigger) : null, /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		onRequestClose: handleRequestClose,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, { style: scrimStyle }), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "SidePanel.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: anchorStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: modal,
		active: mounted,
		autoFocus: modal ? "first" : "none",
		restoreFocus: false
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		...swipeable && dismissible ? panResponder.panHandlers : null,
		style: surfaceStyle,
		onLayout: handleSurfaceLayout,
		accessibilityViewIsModal: modal,
		accessibilityLabel: heading,
		testID: "SidePanel.surface"
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "SidePanel.header"
	}, !hideHeading ? /* @__PURE__ */ React.createElement(Heading, { level: 2 }, heading) : null, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$15.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: !dismissible,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	})), /* @__PURE__ */ React.createElement(ScrollView, {
		testID: "SidePanel.body",
		style: bodyFlexStyle,
		contentContainerStyle: bodyContentStyle,
		keyboardShouldPersistTaps: "handled"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: overrides?.inset ? {
			paddingBlock: overrides.inset,
			paddingInline: overrides.inset
		} : void 0
	}, children)), footer !== void 0 ? /* @__PURE__ */ React.createElement(SafeAreaView, {
		style: footerStyle,
		testID: "SidePanel.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0
	}, footer)) : null))))));
}
/**
* A `PanResponder` for the screen root that opens a `SidePanel` on an edge swipe —
* additive to the trigger and never the only way in (WCAG 2.5.1). Not part of
* `SidePanel` itself: the gesture has to start from the edge of the whole screen,
* outside the panel's own (unmounted-when-closed) surface, so the schema asks for a
* hook the consumer wires onto their own root view rather than an automatic behavior
* `SidePanel` could silently opt every screen into.
*/
function useSidePanelEdgeSwipe({ side = "start", enabled = true, onOpen }) {
	const { tokens: t } = useTheme();
	const { width: windowWidth } = useWindowDimensions();
	const isPhysicalLeft = I18nManager.isRTL ? side === "end" : side === "start";
	const edgeZone = t.sizeTargetComfortable;
	return { panHandlers: React.useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: (_, gestureState) => {
			if (!enabled) return false;
			return isPhysicalLeft ? gestureState.x0 <= edgeZone : gestureState.x0 >= windowWidth - edgeZone;
		},
		onMoveShouldSetPanResponder: (_, gestureState) => {
			if (!enabled) return false;
			return (isPhysicalLeft ? gestureState.dx : -gestureState.dx) > 4 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
		},
		onPanResponderRelease: (_, gestureState) => {
			if ((isPhysicalLeft ? gestureState.dx : -gestureState.dx) > edgeZone / 2) onOpen();
		}
	}), [
		enabled,
		isPhysicalLeft,
		windowWidth,
		edgeZone,
		onOpen
	]).panHandlers };
}
//#endregion
//#region src/Tabs.tsx
/** Wraps one tab's content. Rendered by `Tabs`, never directly. */
function TabPanel({ children }) {
	return /* @__PURE__ */ React.createElement(React.Fragment, null, children);
}
function collectPanels(children) {
	const panels = /* @__PURE__ */ new Map();
	React.Children.forEach(children, (child) => {
		if (React.isValidElement(child) && child.type === TabPanel) {
			const props = child.props;
			panels.set(props.id, props.children);
		}
	});
	return panels;
}
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
function Tabs({ tabs, children, label, value, defaultValue, activation = "automatic", orientation = "horizontal", fit = "start", keepMounted = false, onChange, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const isHorizontal = orientation === "horizontal";
	const rtl = I18nManager.isRTL;
	const firstEnabledId = tabs.find((tab) => tab.disabled !== true)?.id;
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledId);
	const currentValue = isControlled ? value : internalValue;
	const panelsById = React.useMemo(() => collectPanels(children), [children]);
	React.useEffect(() => {
		if (__DEV__) {
			tabs.forEach((tab) => {
				if (!panelsById.has(tab.id)) console.warn(`Tabs: no TabPanel with id "${tab.id}" matching tabs[].id.`);
			});
			panelsById.forEach((_panel, id) => {
				if (!tabs.some((tab) => tab.id === id)) console.warn(`Tabs: TabPanel id "${id}" has no matching entry in tabs[].`);
			});
		}
	}, [tabs, panelsById]);
	const tabPaddingBlock = overrides?.tabPaddingBlock ? resolveToken(t, overrides.tabPaddingBlock) : t.spaceSm;
	const tabPaddingInline = overrides?.tabPaddingInline ? resolveToken(t, overrides.tabPaddingInline) : t.spaceMd;
	const tabGap = overrides?.tabGap ? resolveToken(t, overrides.tabGap) : t.layoutGapTight;
	const listGap = overrides?.listGap ? resolveToken(t, overrides.listGap) : t.layoutGapNone;
	const indicatorThickness = overrides?.indicatorThickness ? resolveToken(t, overrides.indicatorThickness) : t.borderWidthFocus;
	const listBorderColor = overrides?.listBorder ? resolveToken(t, overrides.listBorder) : t.colorBorder;
	const listBorderWidth = overrides?.listBorderWidth ? resolveToken(t, overrides.listBorderWidth) : t.borderWidthThin;
	const panelGap = overrides?.panelGap ? resolveToken(t, overrides.panelGap) : t.layoutGapLoose;
	const badgeSize = overrides?.badgeSize ? resolveToken(t, overrides.badgeSize) : t.fontSizeXs;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightMedium;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusSm;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const tabColor = t.colorForegroundMuted;
	const tabSelectedColor = t.colorForegroundStrong;
	const tabHoverBackground = t.colorBackgroundSubtle;
	const indicatorColor = t.colorControlSelectedBackground;
	const badgeColor = t.colorForegroundMuted;
	const minTarget = t.sizeTargetComfortable;
	const focusRingColor = t.colorBorderFocus;
	const focusRingWidth = t.borderWidthFocus;
	const tabLayoutsRef = React.useRef(/* @__PURE__ */ new Map());
	const hasMeasuredIndicatorRef = React.useRef(false);
	const indicatorOffset = React.useRef(new Animated.Value(0)).current;
	const indicatorExtent = React.useRef(new Animated.Value(0)).current;
	const scrollRef = React.useRef(null);
	const scrollOffsetRef = React.useRef(0);
	const viewportSizeRef = React.useRef(0);
	const updateIndicator = React.useCallback((id) => {
		const layout = tabLayoutsRef.current.get(id);
		if (!layout) return;
		const offset = isHorizontal ? layout.x : layout.y;
		const extent = isHorizontal ? layout.width : layout.height;
		if (reducedMotion || !hasMeasuredIndicatorRef.current) {
			indicatorOffset.setValue(offset);
			indicatorExtent.setValue(extent);
			hasMeasuredIndicatorRef.current = true;
			return;
		}
		Animated.parallel([Animated.timing(indicatorOffset, {
			toValue: offset,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}), Animated.timing(indicatorExtent, {
			toValue: extent,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		})]).start();
	}, [
		isHorizontal,
		reducedMotion,
		transitionDuration,
		t.motionEasingStandard,
		indicatorOffset,
		indicatorExtent
	]);
	const scrollSelectedIntoView = React.useCallback((id) => {
		if (fit !== "start") return;
		const layout = tabLayoutsRef.current.get(id);
		const scrollView = scrollRef.current;
		if (!layout || !scrollView) return;
		const start = isHorizontal ? layout.x : layout.y;
		const end = start + (isHorizontal ? layout.width : layout.height);
		const viewStart = scrollOffsetRef.current;
		const viewEnd = viewStart + viewportSizeRef.current;
		let target = null;
		if (start < viewStart) target = start;
		else if (end > viewEnd) target = end - viewportSizeRef.current;
		if (target !== null) {
			const animated = !reducedMotion;
			if (isHorizontal) scrollView.scrollTo({
				x: Math.max(0, target),
				animated
			});
			else scrollView.scrollTo({
				y: Math.max(0, target),
				animated
			});
		}
	}, [
		fit,
		isHorizontal,
		reducedMotion
	]);
	React.useEffect(() => {
		if (currentValue === void 0) return;
		updateIndicator(currentValue);
		scrollSelectedIntoView(currentValue);
	}, [
		currentValue,
		updateIndicator,
		scrollSelectedIntoView
	]);
	const handleTabLayout = (id, event) => {
		const { x, y, width, height } = event.nativeEvent.layout;
		tabLayoutsRef.current.set(id, {
			x,
			y,
			width,
			height
		});
		if (id === currentValue) updateIndicator(id);
	};
	const handleScroll = (event) => {
		const { x, y } = event.nativeEvent.contentOffset;
		scrollOffsetRef.current = isHorizontal ? x : y;
	};
	const handleViewportLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		viewportSizeRef.current = isHorizontal ? width : height;
	};
	const selectTab = (id) => {
		const tab = tabs.find((candidate) => candidate.id === id);
		if (!tab || tab.disabled === true || id === currentValue) return;
		if (!isControlled) setInternalValue(id);
		onChange?.(id);
	};
	const outerStyle = { flexDirection: isHorizontal ? "column" : "row" };
	const listContentStyle = {
		flexDirection: isHorizontal ? "row" : "column",
		alignItems: isHorizontal ? "center" : "stretch",
		gap: listGap,
		position: "relative",
		borderBottomWidth: isHorizontal ? listBorderWidth : 0,
		borderRightWidth: !isHorizontal && !rtl ? listBorderWidth : 0,
		borderLeftWidth: !isHorizontal && rtl ? listBorderWidth : 0,
		borderColor: listBorderColor
	};
	const indicatorStyle = isHorizontal ? {
		position: "absolute",
		bottom: 0,
		left: 0,
		height: indicatorThickness,
		width: indicatorExtent,
		backgroundColor: indicatorColor,
		transform: [{ translateX: indicatorOffset }]
	} : {
		position: "absolute",
		top: 0,
		...rtl ? { left: 0 } : { right: 0 },
		width: indicatorThickness,
		height: indicatorExtent,
		backgroundColor: indicatorColor,
		transform: [{ translateY: indicatorOffset }]
	};
	const panelContainerStyle = {
		flex: 1,
		marginTop: isHorizontal ? panelGap : 0,
		...!isHorizontal ? rtl ? { marginRight: panelGap } : { marginLeft: panelGap } : null
	};
	const styleTokens = {
		paddingBlock: tabPaddingBlock,
		paddingInline: tabPaddingInline,
		gap: tabGap,
		minTarget,
		radius,
		hoverBackground: tabHoverBackground,
		disabledOpacity,
		focusRingColor,
		focusRingWidth,
		fontFamily,
		fontSize,
		fontWeight,
		lineHeightMultiplier,
		color: tabColor,
		selectedColor: tabSelectedColor,
		badgeColor,
		badgeSize
	};
	const tabButtons = tabs.map((tab) => /* @__PURE__ */ React.createElement(TabButton, {
		key: tab.id,
		tab,
		selected: tab.id === currentValue,
		fill: fit === "fill",
		styleTokens,
		onSelect: selectTab,
		onMeasured: handleTabLayout
	}));
	const list = fit === "start" ? /* @__PURE__ */ React.createElement(ScrollView, {
		ref: scrollRef,
		horizontal: isHorizontal,
		showsHorizontalScrollIndicator: false,
		showsVerticalScrollIndicator: false,
		onScroll: handleScroll,
		scrollEventThrottle: 16,
		onLayout: handleViewportLayout,
		accessibilityRole: "tablist",
		accessibilityLabel: label,
		testID: "Tabs.tablist"
	}, /* @__PURE__ */ React.createElement(View, { style: listContentStyle }, tabButtons, /* @__PURE__ */ React.createElement(Animated.View, {
		style: indicatorStyle,
		testID: "Tabs.indicator"
	}))) : /* @__PURE__ */ React.createElement(View, {
		onLayout: handleViewportLayout,
		accessibilityRole: "tablist",
		accessibilityLabel: label,
		testID: "Tabs.tablist",
		style: listContentStyle
	}, tabButtons, /* @__PURE__ */ React.createElement(Animated.View, {
		style: indicatorStyle,
		testID: "Tabs.indicator"
	}));
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Tabs",
		style: outerStyle
	}, list, /* @__PURE__ */ React.createElement(View, { style: panelContainerStyle }, tabs.map((tab) => {
		const selected = tab.id === currentValue;
		if (!selected && !keepMounted) return null;
		return /* @__PURE__ */ React.createElement(View, {
			key: tab.id,
			testID: "Tabs.panel",
			style: { display: selected ? "flex" : "none" },
			accessibilityElementsHidden: !selected,
			importantForAccessibility: selected ? "auto" : "no-hide-descendants"
		}, panelsById.get(tab.id));
	})));
}
/** One tab. Its own component so focus/press state does not re-render the whole list. */
function TabButton({ tab, selected, fill, styleTokens: s, onSelect, onMeasured }) {
	const [focused, setFocused] = React.useState(false);
	const disabled = tab.disabled === true;
	const foreground = selected ? s.selectedColor : s.color;
	const rowStyle = ({ pressed }) => ({
		flexDirection: "row",
		alignItems: "center",
		flexGrow: fill ? 1 : 0,
		flexBasis: fill ? 0 : void 0,
		justifyContent: fill ? "center" : "flex-start",
		gap: s.gap,
		minHeight: s.minTarget,
		minWidth: s.minTarget,
		paddingVertical: s.paddingBlock,
		paddingHorizontal: s.paddingInline,
		borderRadius: s.radius,
		backgroundColor: pressed && !disabled ? s.hoverBackground : "transparent",
		borderWidth: s.focusRingWidth,
		borderColor: focused ? s.focusRingColor : "transparent",
		opacity: disabled ? s.disabledOpacity : 1
	});
	const labelStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.fontSize,
		fontWeight: toFontWeight(s.fontWeight),
		lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
		color: foreground
	};
	const badgeStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.badgeSize,
		lineHeight: toLineHeight(s.badgeSize, s.lineHeightMultiplier),
		color: s.badgeColor
	};
	const accessibleName = tab.badge !== void 0 ? `${tab.label}, ${tab.badge}` : tab.label;
	return /* @__PURE__ */ React.createElement(Pressable, {
		accessibilityRole: "tab",
		accessibilityLabel: accessibleName,
		accessibilityState: {
			selected,
			disabled
		},
		onPress: () => {
			if (!disabled) onSelect(tab.id);
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onLayout: (event) => onMeasured(tab.id, event),
		style: rowStyle,
		testID: "Tabs.tab"
	}, tab.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Tabs.tabIcon",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: tab.icon,
		size: "sm",
		color: foreground
	})) : null, /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle,
		testID: "Tabs.tabLabel"
	}, tab.label), tab.badge !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		testID: "Tabs.tabBadge",
		style: badgeStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, tab.badge) : null);
}
//#endregion
//#region src/SegmentedControl.tsx
const FONT_SIZE_TOKEN$2 = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
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
function SegmentedControl({ label, options, value, defaultValue, iconOnly = false, size = "md", fill = false, overrides, onChange }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const firstEnabledValue = options.find((option) => option.disabled !== true)?.value ?? options[0]?.value;
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledValue);
	const currentValue = isControlled ? value : internalValue;
	React.useEffect(() => {
		if (__DEV__ && iconOnly) options.forEach((option) => {
			if (option.icon === void 0) console.warn(`SegmentedControl: option "${option.value}" has no icon, but iconOnly is set.`);
		});
	}, [iconOnly, options]);
	const groupPadding = overrides?.groupPadding ? resolveToken(t, overrides.groupPadding) : t.space1;
	const groupRadius = overrides?.groupRadius ? resolveToken(t, overrides.groupRadius) : t.radiusMd;
	const segmentShadow = overrides?.segmentShadow ? resolveToken(t, overrides.segmentShadow) : t.shadowRaised;
	const segmentRadius = overrides?.segmentRadius ? resolveToken(t, overrides.segmentRadius) : t.radiusSm;
	const segmentPaddingInline = overrides?.segmentPaddingInline ? resolveToken(t, overrides.segmentPaddingInline) : t.spaceMd;
	const paddingBlockMd = overrides?.segmentPaddingBlock ? resolveToken(t, overrides.segmentPaddingBlock) : t.space1;
	const paddingBlockSm = overrides?.paddingBlockSm ? resolveToken(t, overrides.paddingBlockSm) : t.space1;
	const segmentPaddingBlock = size === "sm" ? paddingBlockSm : paddingBlockMd;
	const segmentGap = overrides?.segmentGap ? resolveToken(t, overrides.segmentGap) : t.layoutGapTight;
	const segmentSpacing = overrides?.segmentSpacing ? resolveToken(t, overrides.segmentSpacing) : t.space0;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$2[size]];
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightMedium;
	const selectedWeight = overrides?.selectedWeight ? resolveToken(t, overrides.selectedWeight) : t.fontWeightSemibold;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const groupBackground = t.colorBackgroundStrong;
	const segmentColor = t.colorForegroundMuted;
	const segmentSelectedColor = t.colorForegroundStrong;
	const segmentSelectedBackground = t.colorBackground;
	const minTarget = t.sizeTargetComfortable;
	const focusRingColor = t.colorBorderFocus;
	const focusRingWidth = t.borderWidthFocus;
	const segmentLayoutsRef = React.useRef(/* @__PURE__ */ new Map());
	const hasMeasuredRef = React.useRef(false);
	const indicatorOffset = React.useRef(new Animated.Value(0)).current;
	const indicatorWidth = React.useRef(new Animated.Value(0)).current;
	const updateIndicator = React.useCallback((optionValue) => {
		const layout = segmentLayoutsRef.current.get(optionValue);
		if (!layout) return;
		if (reducedMotion || !hasMeasuredRef.current) {
			indicatorOffset.setValue(layout.x);
			indicatorWidth.setValue(layout.width);
			hasMeasuredRef.current = true;
			return;
		}
		Animated.parallel([Animated.timing(indicatorOffset, {
			toValue: layout.x,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}), Animated.timing(indicatorWidth, {
			toValue: layout.width,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		})]).start();
	}, [
		reducedMotion,
		transitionDuration,
		t.motionEasingStandard,
		indicatorOffset,
		indicatorWidth
	]);
	React.useEffect(() => {
		if (currentValue === void 0) return;
		updateIndicator(currentValue);
	}, [currentValue, updateIndicator]);
	const handleSegmentLayout = (optionValue, event) => {
		const { x, width } = event.nativeEvent.layout;
		segmentLayoutsRef.current.set(optionValue, {
			x,
			width
		});
		if (optionValue === currentValue) updateIndicator(optionValue);
	};
	const select = (optionValue) => {
		const option = options.find((candidate) => candidate.value === optionValue);
		if (!option || option.disabled === true || optionValue === currentValue) return;
		if (!isControlled) setInternalValue(optionValue);
		onChange?.(optionValue);
	};
	const groupStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		alignSelf: fill ? "stretch" : "flex-start",
		position: "relative",
		gap: segmentSpacing,
		backgroundColor: groupBackground,
		borderRadius: groupRadius,
		padding: groupPadding
	};
	const indicatorStyle = {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		width: indicatorWidth,
		backgroundColor: segmentSelectedBackground,
		borderRadius: segmentRadius,
		transform: [{ translateX: indicatorOffset }],
		...segmentShadow
	};
	const styleTokens = {
		paddingInline: segmentPaddingInline,
		paddingBlock: segmentPaddingBlock,
		gap: segmentGap,
		minTarget,
		disabledOpacity,
		focusRingColor,
		focusRingWidth,
		fontFamily,
		fontSize,
		fontWeight,
		selectedWeight,
		lineHeightMultiplier,
		color: segmentColor,
		selectedColor: segmentSelectedColor
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "SegmentedControl",
		accessibilityRole: "radiogroup",
		accessibilityLabel: label,
		style: groupStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: indicatorStyle,
		testID: "SegmentedControl.indicator",
		pointerEvents: "none"
	}), options.map((option) => /* @__PURE__ */ React.createElement(Segment, {
		key: option.value,
		option,
		selected: option.value === currentValue,
		iconOnly,
		fill,
		styleTokens,
		onSelect: select,
		onMeasured: handleSegmentLayout
	})));
}
/** One segment. Its own component so focus/press state does not re-render the whole group. */
function Segment({ option, selected, iconOnly, fill, styleTokens: s, onSelect, onMeasured }) {
	const [focused, setFocused] = React.useState(false);
	const disabled = option.disabled === true;
	const foreground = selected ? s.selectedColor : s.color;
	const rowStyle = (_state) => ({
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		flexGrow: fill ? 1 : 0,
		flexBasis: fill ? 0 : void 0,
		gap: s.gap,
		minWidth: s.minTarget,
		minHeight: s.minTarget,
		paddingHorizontal: s.paddingInline,
		paddingVertical: s.paddingBlock,
		borderWidth: s.focusRingWidth,
		borderColor: focused ? s.focusRingColor : "transparent",
		opacity: disabled ? s.disabledOpacity : 1
	});
	const labelStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.fontSize,
		fontWeight: toFontWeight(selected ? s.selectedWeight : s.fontWeight),
		lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
		color: foreground
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		accessibilityRole: "radio",
		accessibilityLabel: option.label,
		accessibilityState: {
			checked: selected,
			disabled
		},
		onPress: () => {
			if (!disabled) onSelect(option.value);
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onLayout: (event) => onMeasured(option.value, event),
		style: rowStyle,
		testID: "SegmentedControl.segment"
	}, option.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: option.icon,
		size: "sm",
		color: foreground
	})) : null, iconOnly ? null : /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle,
		testID: "SegmentedControl.segmentLabel"
	}, option.label));
}
//#endregion
//#region src/Listbox.tsx
const COPY$14 = {
	empty: "No options",
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	selectedCount: (count) => `${count} selected`,
	loading: "Loading…"
};
function isGroup$2(item) {
	return "group" in item;
}
function flattenRows(items) {
	const rows = [];
	items.forEach((item, itemIndex) => {
		if (isGroup$2(item)) {
			rows.push({
				kind: "group",
				key: `group-${itemIndex}`,
				label: item.group
			});
			item.options.forEach((option, optionIndex) => {
				rows.push({
					kind: "option",
					key: `${itemIndex}-${optionIndex}-${option.value}`,
					option
				});
			});
		} else rows.push({
			kind: "option",
			key: `${itemIndex}-${item.value}`,
			option: item
		});
	});
	return rows;
}
function flattenOptions$2(items) {
	const options = [];
	items.forEach((item) => {
		if (isGroup$2(item)) options.push(...item.options);
		else options.push(item);
	});
	return options;
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
function Listbox({ label, options, multiple = false, value, defaultValue, selectionFollowsFocus = true, required = false, invalid = false, error, embedded = false, defaultActiveValue, loading = false, disabled = false, name, emptyMessage, maxVisible = "8", overrides, onChange, onActiveChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const listRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [focusedValue, setFocusedValue] = React.useState(() => {
		if (defaultActiveValue !== void 0) return defaultActiveValue;
		const initialValue = value ?? defaultValue;
		const initiallySelected = multiple ? Array.isArray(initialValue) && initialValue.length > 0 ? initialValue[0] : void 0 : typeof initialValue === "string" ? initialValue : void 0;
		if (initiallySelected !== void 0) return initiallySelected;
		return flattenOptions$2(options).find((option) => option.disabled !== true)?.value ?? null;
	});
	const [rowHeight, setRowHeight] = React.useState(null);
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const orderedOptions = React.useMemo(() => flattenOptions$2(options), [options]);
	const orderedValues = React.useMemo(() => orderedOptions.map((option) => option.value), [orderedOptions]);
	const rows = React.useMemo(() => flattenRows(options), [options]);
	const hasOptions = rows.some((row) => row.kind === "option");
	const selectedValues = multiple && Array.isArray(currentValue) ? currentValue : [];
	const selectedValue = !multiple && typeof currentValue === "string" ? currentValue : void 0;
	const formError = name !== void 0 ? form?.errors[name] : void 0;
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const summarised = form !== null && form.errorSummary;
	React.useEffect(() => {
		if (__DEV__ && multiple && !selectionFollowsFocus) console.warn("Listbox: `selectionFollowsFocus` only applies to single-select lists.");
	}, [multiple, selectionFollowsFocus]);
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required) {
			if (multiple ? !Array.isArray(candidate) || candidate.length === 0 : candidate === void 0) return COPY$14.required(label);
		}
		if (invalid) return COPY$14.invalid(label);
		return null;
	}, [
		required,
		multiple,
		label,
		error,
		invalid
	]);
	const latest = React.useRef({
		currentValue,
		validateValue
	});
	latest.current = {
		currentValue,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => {
			const current = latest.current.currentValue;
			if (multiple) return Array.isArray(current) && current.length > 0 ? current : void 0;
			return typeof current === "string" ? current : void 0;
		},
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => {
			const node = listRef.current === null ? null : findNodeHandle(listRef.current);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), [multiple]);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || name === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const commit = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && name !== void 0 && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const selectOption = (option) => {
		if (isDisabled || option.disabled === true) return;
		if (multiple) {
			const nextSet = new Set(selectedValues);
			if (nextSet.has(option.value)) nextSet.delete(option.value);
			else nextSet.add(option.value);
			commit(orderedValues.filter((v) => nextSet.has(v)));
			return;
		}
		if (option.value === selectedValue) return;
		commit(option.value);
	};
	const handleFocusOption = (optionValue) => {
		setFocusedValue(optionValue);
		onActiveChange?.(optionValue);
	};
	const handleBlurOption = (optionValue) => {
		setFocusedValue((prev) => prev === optionValue ? null : prev);
	};
	const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorderStrong;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const listPadding = overrides?.listPadding ? resolveToken(t, overrides.listPadding) : t.space1;
	const optionPaddingBlock = overrides?.optionPaddingBlock ? resolveToken(t, overrides.optionPaddingBlock) : t.spaceSm;
	const optionPaddingInline = overrides?.optionPaddingInline ? resolveToken(t, overrides.optionPaddingInline) : t.spaceMd;
	const optionGap = overrides?.optionGap ? resolveToken(t, overrides.optionGap) : t.layoutGapNormal;
	const optionRadius = overrides?.optionRadius ? resolveToken(t, overrides.optionRadius) : t.radiusSm;
	const optionDescriptionSize = overrides?.optionDescriptionSize ? resolveToken(t, overrides.optionDescriptionSize) : t.fontSizeSm;
	const optionSelectedWeight = overrides?.optionSelectedWeight ? resolveToken(t, overrides.optionSelectedWeight) : t.fontWeightMedium;
	const groupLabelSize = overrides?.groupLabelSize ? resolveToken(t, overrides.groupLabelSize) : t.fontSizeXs;
	const groupLabelWeight = overrides?.groupLabelWeight ? resolveToken(t, overrides.groupLabelWeight) : t.fontWeightSemibold;
	const groupLabelPaddingBlock = overrides?.groupLabelPaddingBlock ? resolveToken(t, overrides.groupLabelPaddingBlock) : t.space1;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const placeholderText = loading ? COPY$14.loading : emptyMessage ?? COPY$14.empty;
	const rowCount = maxVisible === "all" ? null : Number(maxVisible);
	const maxHeight = rowCount !== null && rowHeight !== null ? rowCount * rowHeight : void 0;
	const handleFirstRowLayout = (event) => {
		if (rowHeight === null) setRowHeight(event.nativeEvent.layout.height);
	};
	const containerStyle = {
		...embedded ? null : {
			borderWidth,
			borderColor: border,
			borderRadius: radius,
			backgroundColor: t.colorBackground
		},
		opacity: isDisabled ? disabledOpacity : 1,
		overflow: "hidden"
	};
	const listStyle = {
		padding: listPadding,
		...maxHeight !== void 0 ? { maxHeight } : null
	};
	const groupLabelRowStyle = {
		paddingHorizontal: optionPaddingInline,
		paddingTop: groupLabelPaddingBlock,
		paddingBottom: groupLabelPaddingBlock
	};
	const groupLabelStyle = {
		fontFamily,
		fontSize: groupLabelSize,
		fontWeight: toFontWeight(groupLabelWeight),
		lineHeight: toLineHeight(groupLabelSize, lineHeightMultiplier),
		color: t.colorForegroundMuted
	};
	const optionRowStyle = (focused, optionDisabled) => ({
		flexDirection: "row",
		alignItems: "flex-start",
		gap: optionGap,
		minHeight: t.sizeTargetMin,
		paddingVertical: optionPaddingBlock,
		paddingHorizontal: optionPaddingInline,
		borderRadius: optionRadius,
		backgroundColor: focused ? t.colorBackgroundSubtle : "transparent",
		borderWidth: focused ? t.borderWidthFocus : 0,
		borderColor: focused ? t.colorBorderFocus : "transparent",
		opacity: optionDisabled && !isDisabled ? disabledOpacity : 1
	});
	const optionLabelStyle = (selected) => ({
		flexShrink: 1,
		fontFamily,
		fontSize,
		fontWeight: toFontWeight(selected ? optionSelectedWeight : t.fontWeightRegular),
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: t.colorForeground
	});
	const optionDescriptionStyle = {
		flexShrink: 1,
		fontFamily,
		fontSize: optionDescriptionSize,
		lineHeight: toLineHeight(optionDescriptionSize, lineHeightMultiplier),
		color: t.colorForegroundMuted
	};
	const optionTextColumnStyle = {
		flexShrink: 1,
		flexDirection: "column",
		gap: t.space1
	};
	const checkSlotStyle = (selected) => ({ opacity: selected ? 1 : 0 });
	const emptyRowStyle = {
		paddingVertical: optionPaddingBlock,
		paddingHorizontal: optionPaddingInline
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const renderItem = ({ item, index }) => {
		const onLayout = index === 0 ? handleFirstRowLayout : void 0;
		if (item.kind === "group") return /* @__PURE__ */ React.createElement(View, {
			onLayout,
			style: groupLabelRowStyle,
			testID: "Listbox.groupLabel"
		}, /* @__PURE__ */ React.createElement(Text$1, { style: groupLabelStyle }, item.label));
		const option = item.option;
		const selected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
		const optionDisabled = isDisabled || option.disabled === true;
		const focused = focusedValue === option.value;
		const accessibleLabel = option.description !== void 0 ? `${option.label}. ${option.description}` : option.label;
		return /* @__PURE__ */ React.createElement(Pressable, {
			onLayout,
			accessibilityRole: "menuitem",
			accessibilityLabel: accessibleLabel,
			accessibilityState: {
				selected: multiple ? void 0 : selected,
				checked: multiple ? selected : void 0,
				disabled: optionDisabled
			},
			onPress: () => selectOption(option),
			onFocus: () => handleFocusOption(option.value),
			onBlur: () => handleBlurOption(option.value),
			style: optionRowStyle(focused, optionDisabled),
			testID: "Listbox.option"
		}, /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			style: checkSlotStyle(selected)
		}, /* @__PURE__ */ React.createElement(Icon, {
			name: "check",
			size: "sm",
			color: t.colorControlSelectedBackground
		})), option.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no"
		}, /* @__PURE__ */ React.createElement(Icon, {
			name: option.icon,
			size: "sm",
			color: t.colorForeground
		})) : null, /* @__PURE__ */ React.createElement(View, { style: optionTextColumnStyle }, /* @__PURE__ */ React.createElement(Text$1, {
			numberOfLines: 1,
			style: optionLabelStyle(selected)
		}, option.label), option.description !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
			numberOfLines: 1,
			style: optionDescriptionStyle
		}, option.description) : null));
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Listbox",
		style: containerStyle
	}, hasOptions ? /* @__PURE__ */ React.createElement(FlatList, {
		ref: listRef,
		data: rows,
		keyExtractor: (row) => row.key,
		renderItem,
		style: listStyle,
		accessibilityRole: "list",
		accessibilityLabel: label,
		accessibilityState: {
			disabled: isDisabled,
			busy: loading
		},
		accessibilityValue: multiple && selectedValues.length > 0 ? { text: COPY$14.selectedCount(selectedValues.length) } : void 0,
		testID: "Listbox.list"
	}) : /* @__PURE__ */ React.createElement(View, {
		accessible: true,
		accessibilityRole: "list",
		accessibilityLabel: `${label}. ${placeholderText}`,
		accessibilityState: { busy: loading },
		style: emptyRowStyle,
		testID: "Listbox.emptyState"
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "muted",
		overrides: typographyOverrides
	}, placeholderText)), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		style: {
			paddingHorizontal: optionPaddingInline,
			paddingBottom: t.space1
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger"
	}, displayedError)) : null);
}
//#endregion
//#region src/Select.tsx
const COPY$13 = {
	placeholder: "Select…",
	selectedCount: (count) => `${count} selected`,
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)",
	done: "Done"
};
function isGroup$1(item) {
	return "group" in item;
}
function flattenOptions$1(items) {
	const options = [];
	items.forEach((item) => {
		if (isGroup$1(item)) options.push(...item.options);
		else options.push(item);
	});
	return options;
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
function Select({ label, name, options, value, defaultValue, placeholder, hideLabel = false, size = "md", open: openProp, multiple = false, description, required = false, disabled = false, invalid = false, error, native = "auto", overrides, onChange, onOpenChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const triggerRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [focused, setFocused] = React.useState(false);
	const [internalOpen, setInternalOpen] = React.useState(false);
	const [popupMounted, setPopupMounted] = React.useState(false);
	const [triggerRect, setTriggerRect] = React.useState(null);
	const [popupHeight, setPopupHeight] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : internalValue;
	const isOpenControlled = openProp !== void 0;
	const open = isOpenControlled ? openProp : internalOpen;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const isPhoneWidth = windowWidth <= t.layoutMaxWidthProse;
	const usesSheet = native !== "never" && isPhoneWidth;
	const flatOptions = React.useMemo(() => flattenOptions$1(options), [options]);
	const labelFor = React.useCallback((optionValue) => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue, [flatOptions]);
	const selectedValues = multiple && Array.isArray(currentValue) ? currentValue : [];
	const selectedValue = !multiple && typeof currentValue === "string" ? currentValue : void 0;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required) {
			if (multiple ? !Array.isArray(candidate) || candidate.length === 0 : candidate === void 0) return COPY$13.required(label);
		}
		if (invalid) return COPY$13.invalid(label);
		return null;
	}, [
		required,
		multiple,
		label,
		error,
		invalid
	]);
	const focusTriggerA11y = React.useCallback(() => {
		const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, []);
	const latest = React.useRef({
		currentValue,
		validateValue
	});
	latest.current = {
		currentValue,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => {
			const current = latest.current.currentValue;
			if (multiple) return Array.isArray(current) && current.length > 0 ? current : void 0;
			return typeof current === "string" ? current : void 0;
		},
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: focusTriggerA11y
	}), [multiple, focusTriggerA11y]);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const changeOpen = (next) => {
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};
	const closePopup = () => {
		if (!open) return;
		changeOpen(false);
		focusTriggerA11y();
	};
	const handleTriggerPress = () => {
		if (isDisabled) return;
		if (open) {
			closePopup();
			return;
		}
		changeOpen(true);
	};
	const commit = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const handleListboxChange = (next) => {
		commit(next);
		if (!multiple) closePopup();
	};
	React.useEffect(() => {
		if (open) setPopupMounted(true);
	}, [open]);
	React.useEffect(() => {
		if (usesSheet || !popupMounted) return;
		if (open) {
			triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({
				x,
				y,
				width,
				height
			}));
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start();
			return () => animation.stop();
		}
		setTriggerRect(null);
		setPopupHeight(null);
		if (reducedMotion) {
			progress.setValue(0);
			setPopupMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setPopupMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		popupMounted,
		reducedMotion,
		usesSheet
	]);
	const handlePopupLayout = (event) => {
		setPopupHeight(event.nativeEvent.layout.height);
	};
	const triggerBorderFocusColor = overrides?.triggerBorderFocus ? resolveToken(t, overrides.triggerBorderFocus) : t.colorBorderFocus;
	const triggerBorderInvalidColor = overrides?.triggerBorderInvalid ? resolveToken(t, overrides.triggerBorderInvalid) : t.colorBorderDanger;
	const triggerBorderWidth = overrides?.triggerBorderWidth ? resolveToken(t, overrides.triggerBorderWidth) : t.borderWidthThin;
	const triggerRadius = overrides?.triggerRadius ? resolveToken(t, overrides.triggerRadius) : t.radiusMd;
	const triggerPaddingInline = overrides?.triggerPaddingInline ? resolveToken(t, overrides.triggerPaddingInline) : t.spaceMd;
	const triggerPaddingBlock = size === "sm" ? overrides?.triggerPaddingBlockSm ? resolveToken(t, overrides.triggerPaddingBlockSm) : t.space1 : overrides?.triggerPaddingBlock ? resolveToken(t, overrides.triggerPaddingBlock) : t.spaceSm;
	const triggerGap = overrides?.triggerGap ? resolveToken(t, overrides.triggerGap) : t.layoutGapNormal;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	overrides?.labelWeight ? resolveToken(t, overrides.labelWeight) : t.fontWeightMedium;
	const popupSurface = overrides?.popupSurface ? resolveToken(t, overrides.popupSurface) : t.colorOverlaySurface;
	const popupBorder = overrides?.popupBorder ? resolveToken(t, overrides.popupBorder) : t.colorBorder;
	const popupShadow = overrides?.popupShadow ? resolveToken(t, overrides.popupShadow) : t.shadowOverlay;
	const popupRadius = overrides?.popupRadius ? resolveToken(t, overrides.popupRadius) : t.radiusMd;
	const popupOffset = overrides?.popupOffset ? resolveToken(t, overrides.popupOffset) : t.space1;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDropdown;
	const minTarget = size === "sm" ? overrides?.minTargetSm ? resolveToken(t, overrides.minTargetSm) : t.sizeTargetMin : t.sizeTargetComfortable;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const visibleLabel = required ? `${label}${COPY$13.requiredIndicator}` : label;
	let valueText;
	if (multiple) valueText = selectedValues.length === 0 ? placeholder ?? COPY$13.placeholder : selectedValues.length <= 2 ? selectedValues.map(labelFor).join(", ") : COPY$13.selectedCount(selectedValues.length);
	else valueText = selectedValue !== void 0 ? labelFor(selectedValue) : placeholder ?? COPY$13.placeholder;
	const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== void 0;
	const insetShrink = t.borderWidthFocus - triggerBorderWidth;
	const activeTriggerBorderWidth = focused ? t.borderWidthFocus : triggerBorderWidth;
	const triggerBorderColor = focused ? triggerBorderFocusColor : isInvalid ? triggerBorderInvalidColor : t.colorBorderStrong;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const triggerStyle = {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: triggerGap,
		minHeight: minTarget,
		backgroundColor: t.colorBackground,
		borderWidth: activeTriggerBorderWidth,
		borderColor: triggerBorderColor,
		borderRadius: triggerRadius,
		paddingHorizontal: triggerPaddingInline + insetShrink,
		paddingVertical: triggerPaddingBlock + insetShrink
	};
	const valueTextStyle = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const labelOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		fontWeight: overrides?.labelWeight,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.helperSize,
		lineHeight: overrides?.lineHeight
	};
	const listboxOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize ?? (size === "sm" ? "font.size.sm" : void 0),
		lineHeight: overrides?.lineHeight,
		disabledOpacity: overrides?.disabledOpacity
	};
	const listbox = /* @__PURE__ */ React.createElement(Listbox, {
		label,
		options,
		multiple,
		value: currentValue,
		disabled: isDisabled,
		embedded: true,
		onChange: handleListboxChange,
		overrides: listboxOverrides
	});
	const spaceBelow = triggerRect !== null ? windowHeight - (triggerRect.y + triggerRect.height) : 0;
	const spaceAbove = triggerRect !== null ? triggerRect.y : 0;
	const measuredPopupHeight = popupHeight ?? 0;
	const flipAbove = triggerRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
	const popupTop = triggerRect === null ? 0 : flipAbove ? triggerRect.y - popupOffset - measuredPopupHeight : triggerRect.y + triggerRect.height + popupOffset;
	const popupLeft = triggerRect?.x ?? 0;
	const popupWidth = triggerRect?.width;
	const hostStyle = { flex: 1 };
	const popupOuterStyle = {
		position: "absolute",
		top: popupTop,
		left: popupLeft,
		width: popupWidth,
		borderRadius: popupRadius,
		zIndex: layer,
		opacity: progress,
		...popupShadow
	};
	const popupInnerStyle = {
		borderRadius: popupRadius,
		borderWidth: t.borderWidthThin,
		borderColor: popupBorder,
		backgroundColor: popupSurface,
		overflow: "hidden"
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Select",
		style: containerStyle
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(Text, {
		size,
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, /* @__PURE__ */ React.createElement(Pressable, {
		ref: triggerRef,
		accessibilityRole: "combobox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			expanded: open,
			disabled: isDisabled
		},
		accessibilityValue: hasSelection ? { text: valueText } : void 0,
		onPress: handleTriggerPress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: triggerStyle,
		testID: "Select.trigger"
	}, /* @__PURE__ */ React.createElement(Text, {
		size,
		tone: hasSelection ? "default" : "muted",
		overrides: valueTextStyle
	}, valueText), /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-down",
		size: "sm",
		color: t.colorForegroundMuted
	})), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: summarised ? "none" : "assertive" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null, usesSheet ? /* @__PURE__ */ React.createElement(BottomSheet, {
		open,
		heading: label,
		onClose: closePopup,
		footer: multiple ? /* @__PURE__ */ React.createElement(Button, {
			label: COPY$13.done,
			onPress: closePopup
		}) : void 0
	}, listbox) : /* @__PURE__ */ React.createElement(Modal, {
		visible: popupMounted,
		transparent: true,
		animationType: "none",
		onRequestClose: closePopup,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: closePopup,
		accessible: false,
		testID: "Select.scrim"
	}), triggerRect !== null ? /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: popupMounted,
		autoFocus: "first",
		restoreFocus: false
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: popupOuterStyle,
		onLayout: handlePopupLayout,
		accessibilityViewIsModal: true,
		accessibilityLabel: label,
		testID: "Select.popup"
	}, /* @__PURE__ */ React.createElement(View, { style: popupInnerStyle }, listbox))) : null)));
}
//#endregion
//#region src/Combobox.tsx
const COPY$12 = {
	empty: "No matches",
	loading: "Loading…",
	addCustom: (value) => `Add "${value}"`,
	clearLabel: "Clear",
	toggleLabel: "Show options",
	removeChip: (label) => `Remove ${label}`,
	resultCount: (count) => `${count} results available`,
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)",
	done: "Done"
};
const CUSTOM_PREFIX = "__ds_combobox_custom__:";
function isGroup(item) {
	return "group" in item;
}
function flattenOptions(items) {
	const result = [];
	items.forEach((item) => {
		if (isGroup(item)) result.push(...item.options);
		else result.push(item);
	});
	return result;
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
function Combobox({ label, name, options, value, defaultValue, inputValue, multiple = false, allowCustom = false, filter = "contains", placeholder, description, required = false, disabled = false, invalid = false, error, loading = false, clearable = true, overrides, onChange, onInputChange, onOpenChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const fieldRef = React.useRef(null);
	const inputRef = React.useRef(null);
	const emptyValue = multiple ? [] : "";
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? emptyValue);
	const [internalInputText, setInternalInputText] = React.useState("");
	const [focused, setFocused] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [popupMounted, setPopupMounted] = React.useState(false);
	const [fieldRect, setFieldRect] = React.useState(null);
	const [popupHeight, setPopupHeight] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
	const isValueControlled = value !== void 0;
	const currentValue = isValueControlled ? value : internalValue;
	const isInputControlled = inputValue !== void 0;
	const currentInputText = isInputControlled ? inputValue : internalInputText;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const usesSheet = windowWidth <= t.layoutMaxWidthProse;
	const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
	const labelFor = React.useCallback((optionValue) => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue, [flatOptions]);
	const selectedValues = multiple && Array.isArray(currentValue) ? currentValue : [];
	const selectedValue = !multiple && typeof currentValue === "string" && currentValue !== "" ? currentValue : void 0;
	const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== void 0;
	const trimmedInput = currentInputText.trim();
	const filteredItems = React.useMemo(() => {
		if (filter === "none" || filter === "async" || trimmedInput === "") return options;
		const needle = trimmedInput.toLowerCase();
		const matches = (option) => filter === "startsWith" ? option.label.toLowerCase().startsWith(needle) : option.label.toLowerCase().includes(needle);
		return options.reduce((acc, item) => {
			if (isGroup(item)) {
				const groupMatches = item.options.filter(matches);
				if (groupMatches.length > 0) acc.push({
					group: item.group,
					options: groupMatches
				});
			} else if (matches(item)) acc.push(item);
			return acc;
		}, []);
	}, [
		options,
		filter,
		trimmedInput
	]);
	const hasExactMatch = flatOptions.some((option) => option.label.toLowerCase() === trimmedInput.toLowerCase() || option.value.toLowerCase() === trimmedInput.toLowerCase());
	const customOption = allowCustom && trimmedInput !== "" && !hasExactMatch ? {
		value: `${CUSTOM_PREFIX}${trimmedInput}`,
		label: COPY$12.addCustom(trimmedInput)
	} : null;
	const listboxItems = customOption !== null ? [customOption, ...filteredItems] : filteredItems;
	const resultCount = flattenOptions(filteredItems).length;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required) {
			if (multiple ? !Array.isArray(candidate) || candidate.length === 0 : candidate === "") return COPY$12.required(label);
		}
		if (invalid) return COPY$12.invalid(label);
		return null;
	}, [
		required,
		multiple,
		label,
		error,
		invalid
	]);
	const focusFieldA11y = React.useCallback(() => {
		const node = fieldRef.current ? findNodeHandle(fieldRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, []);
	const latest = React.useRef({
		currentValue,
		validateValue
	});
	latest.current = {
		currentValue,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => {
			const current = latest.current.currentValue;
			if (multiple) return Array.isArray(current) && current.length > 0 ? current : void 0;
			return typeof current === "string" && current !== "" ? current : void 0;
		},
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => {
			if (usesSheet) {
				setOpen(true);
				onOpenChange?.(true);
				return;
			}
			const input = inputRef.current;
			if (input === null) return;
			input.focus();
			const node = findNodeHandle(input);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), [
		multiple,
		usesSheet,
		onOpenChange
	]);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	React.useEffect(() => {
		if (!open) return;
		const text = filter === "async" && loading ? COPY$12.loading : resultCount === 0 ? COPY$12.empty : COPY$12.resultCount(resultCount);
		const timeout = setTimeout(() => {
			AccessibilityInfo.announceForAccessibility(text);
		}, t.motionDurationBase * 2);
		return () => clearTimeout(timeout);
	}, [
		open,
		filter,
		loading,
		resultCount,
		t.motionDurationBase
	]);
	const changeOpen = (next) => {
		setOpen(next);
		onOpenChange?.(next);
	};
	const closePopup = (refocus) => {
		if (!open) return;
		changeOpen(false);
		if (refocus) focusFieldA11y();
	};
	const commitValue = (next) => {
		if (!isValueControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const commitInputText = (next) => {
		if (!isInputControlled) setInternalInputText(next);
		onInputChange?.(next);
	};
	const resolveCustom = (raw) => raw.startsWith(CUSTOM_PREFIX) ? raw.slice(23) : raw;
	const handleListboxChange = (next) => {
		if (multiple) {
			const resolved = (Array.isArray(next) ? next : [next]).map(resolveCustom);
			commitValue(resolved);
			commitInputText("");
			return;
		}
		const raw = Array.isArray(next) ? next[0] : next;
		const resolved = raw === void 0 ? "" : resolveCustom(raw);
		commitValue(resolved);
		commitInputText(resolved === "" ? "" : labelFor(resolved));
		closePopup(false);
	};
	const handleTogglePress = () => {
		if (isDisabled) return;
		if (open) closePopup(true);
		else changeOpen(true);
	};
	const handleClear = () => {
		if (isDisabled) return;
		commitInputText("");
		commitValue(multiple ? [] : "");
	};
	const handleRemoveChip = (chipValue) => {
		if (isDisabled) return;
		commitValue(selectedValues.filter((v) => v !== chipValue));
	};
	const handleChangeText = (text) => {
		commitInputText(text);
		if (!open) changeOpen(true);
	};
	const commitCustomFromText = () => {
		if (!allowCustom || trimmedInput === "") return;
		if (multiple) {
			if (!selectedValues.includes(trimmedInput)) commitValue([...selectedValues, trimmedInput]);
			commitInputText("");
		} else {
			commitValue(trimmedInput);
			commitInputText(trimmedInput);
			closePopup(false);
		}
	};
	const handleSubmitEditing = () => {
		commitCustomFromText();
	};
	const handleKeyPress = (event) => {
		const key = event.nativeEvent.key;
		if (key === "Backspace" && multiple && currentInputText === "" && selectedValues.length > 0) {
			commitValue(selectedValues.slice(0, -1));
			return;
		}
		if (key === "Escape") {
			if (open) closePopup(true);
			else if (clearable) handleClear();
		}
	};
	const handleFocus = () => {
		setFocused(true);
		if (!open) changeOpen(true);
	};
	const handleBlur = () => {
		setFocused(false);
		closePopup(false);
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	React.useEffect(() => {
		if (open) setPopupMounted(true);
	}, [open]);
	const handlePopupLayout = (event) => {
		setPopupHeight(event.nativeEvent.layout.height);
	};
	const fieldBorderFocusColor = overrides?.fieldBorderFocus ? resolveToken(t, overrides.fieldBorderFocus) : t.colorBorderFocus;
	const fieldBorderInvalidColor = overrides?.fieldBorderInvalid ? resolveToken(t, overrides.fieldBorderInvalid) : t.colorBorderDanger;
	const fieldBorderWidth = overrides?.fieldBorderWidth ? resolveToken(t, overrides.fieldBorderWidth) : t.borderWidthThin;
	const fieldRadius = overrides?.fieldRadius ? resolveToken(t, overrides.fieldRadius) : t.radiusMd;
	const fieldPaddingInline = overrides?.fieldPaddingInline ? resolveToken(t, overrides.fieldPaddingInline) : t.spaceMd;
	const fieldPaddingBlock = overrides?.fieldPaddingBlock ? resolveToken(t, overrides.fieldPaddingBlock) : t.spaceSm;
	const fieldGap = overrides?.fieldGap ? resolveToken(t, overrides.fieldGap) : t.layoutGapTight;
	const chipRadius = overrides?.chipRadius ? resolveToken(t, overrides.chipRadius) : t.radiusFull;
	const chipPaddingInline = overrides?.chipPaddingInline ? resolveToken(t, overrides.chipPaddingInline) : t.space2;
	const chipPaddingBlock = overrides?.chipPaddingBlock ? resolveToken(t, overrides.chipPaddingBlock) : t.space0;
	const chipGap = overrides?.chipGap ? resolveToken(t, overrides.chipGap) : t.layoutGapTight;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	overrides?.labelWeight ? resolveToken(t, overrides.labelWeight) : t.fontWeightMedium;
	const popupSurface = overrides?.popupSurface ? resolveToken(t, overrides.popupSurface) : t.colorOverlaySurface;
	const popupBorder = overrides?.popupBorder ? resolveToken(t, overrides.popupBorder) : t.colorBorder;
	const popupShadow = overrides?.popupShadow ? resolveToken(t, overrides.popupShadow) : t.shadowOverlay;
	const popupRadius = overrides?.popupRadius ? resolveToken(t, overrides.popupRadius) : t.radiusMd;
	const popupOffset = overrides?.popupOffset ? resolveToken(t, overrides.popupOffset) : t.space1;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDropdown;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast;
	const iconColor = t.colorForegroundMuted;
	React.useEffect(() => {
		if (usesSheet || !popupMounted) return;
		if (open) {
			fieldRef.current?.measureInWindow((x, y, width, height) => setFieldRect({
				x,
				y,
				width,
				height
			}));
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start();
			return () => animation.stop();
		}
		setFieldRect(null);
		setPopupHeight(null);
		if (reducedMotion) {
			progress.setValue(0);
			setPopupMounted(false);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: enterDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setPopupMounted(false);
		});
		return () => animation.stop();
	}, [
		open,
		popupMounted,
		reducedMotion,
		usesSheet
	]);
	const visibleLabel = required ? `${label}${COPY$12.requiredIndicator}` : label;
	const showClear = clearable && !isDisabled && (hasSelection || currentInputText !== "");
	const singleSummaryText = selectedValue !== void 0 ? labelFor(selectedValue) : placeholder ?? "";
	const summaryIsPlaceholder = selectedValue === void 0 && !hasSelection;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const insetShrink = t.borderWidthFocus - fieldBorderWidth;
	const activeFieldBorderWidth = focused ? t.borderWidthFocus : fieldBorderWidth;
	const fieldBorderColor = focused ? fieldBorderFocusColor : isInvalid ? fieldBorderInvalidColor : t.colorBorderStrong;
	const fieldRowStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: fieldGap,
		minHeight: t.sizeTargetComfortable,
		backgroundColor: t.colorBackground,
		borderWidth: activeFieldBorderWidth,
		borderColor: fieldBorderColor,
		borderRadius: fieldRadius,
		paddingHorizontal: fieldPaddingInline + insetShrink,
		paddingVertical: fieldPaddingBlock + insetShrink
	};
	const chipStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: chipGap,
		backgroundColor: t.colorBackgroundStrong,
		borderRadius: chipRadius,
		paddingHorizontal: chipPaddingInline,
		paddingVertical: chipPaddingBlock
	};
	const inputTextStyle = {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		fontFamily: overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody,
		fontSize: overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd,
		color: t.colorForeground
	};
	const labelOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		fontWeight: overrides?.labelWeight,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.helperSize,
		lineHeight: overrides?.lineHeight
	};
	const chipTextOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.chipSize,
		lineHeight: overrides?.lineHeight
	};
	const fieldTextOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const listboxOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight,
		disabledOpacity: overrides?.disabledOpacity
	};
	const emptyMessage = filter === "async" && loading ? COPY$12.loading : COPY$12.empty;
	const renderChip = (chipValue, interactive) => {
		const chipLabel = labelFor(chipValue);
		return /* @__PURE__ */ React.createElement(View, {
			key: chipValue,
			style: chipStyle,
			testID: "Combobox.chip"
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			overrides: chipTextOverrides
		}, chipLabel), interactive ? /* @__PURE__ */ React.createElement(Button, {
			label: COPY$12.removeChip(chipLabel),
			variant: "ghost",
			size: "sm",
			iconOnly: true,
			disabled: isDisabled,
			leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
				name: "close",
				size: "xs",
				color: iconColor
			}),
			onPress: () => handleRemoveChip(chipValue)
		}) : null);
	};
	const textInput = /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		accessibilityRole: "combobox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			disabled: isDisabled,
			expanded: open
		},
		editable: !isDisabled,
		value: currentInputText,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		autoCapitalize: "none",
		autoCorrect: false,
		allowFontScaling: true,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onKeyPress: handleKeyPress,
		onSubmitEditing: handleSubmitEditing,
		style: inputTextStyle,
		testID: "Combobox.input"
	});
	const listbox = /* @__PURE__ */ React.createElement(Listbox, {
		label,
		options: listboxItems,
		multiple,
		value: currentValue,
		disabled: isDisabled,
		embedded: true,
		emptyMessage,
		onChange: handleListboxChange,
		overrides: listboxOverrides
	});
	const statusText = filter === "async" && loading ? COPY$12.loading : resultCount === 0 ? COPY$12.empty : COPY$12.resultCount(resultCount);
	const status = open ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		importantForAccessibility: "yes",
		testID: "Combobox.status"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: helperOverrides
	}, statusText)) : null;
	const spaceBelow = fieldRect !== null ? windowHeight - (fieldRect.y + fieldRect.height) : 0;
	const spaceAbove = fieldRect !== null ? fieldRect.y : 0;
	const measuredPopupHeight = popupHeight ?? 0;
	const flipAbove = fieldRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
	const popupTop = fieldRect === null ? 0 : flipAbove ? fieldRect.y - popupOffset - measuredPopupHeight : fieldRect.y + fieldRect.height + popupOffset;
	const popupLeft = fieldRect?.x ?? 0;
	const popupWidth = fieldRect?.width;
	const hostStyle = { flex: 1 };
	const popupOuterStyle = {
		position: "absolute",
		top: popupTop,
		left: popupLeft,
		width: popupWidth,
		borderRadius: popupRadius,
		zIndex: layer,
		opacity: progress,
		...popupShadow
	};
	const popupInnerStyle = {
		borderRadius: popupRadius,
		borderWidth: t.borderWidthThin,
		borderColor: popupBorder,
		backgroundColor: popupSurface,
		overflow: "hidden"
	};
	const sheetChipsRowStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: fieldGap,
		marginBottom: t.space2
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Combobox",
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, usesSheet ? /* @__PURE__ */ React.createElement(Pressable, {
		ref: fieldRef,
		accessibilityRole: "combobox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			disabled: isDisabled,
			expanded: open
		},
		accessibilityValue: !multiple && hasSelection ? { text: singleSummaryText } : void 0,
		onPress: handleTogglePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: fieldRowStyle,
		testID: "Combobox.field"
	}, multiple ? selectedValues.map((v) => renderChip(v, false)) : null, !multiple || selectedValues.length === 0 ? /* @__PURE__ */ React.createElement(Text, {
		tone: summaryIsPlaceholder ? "muted" : "default",
		overrides: fieldTextOverrides
	}, singleSummaryText) : null, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-down",
		size: "xs",
		color: iconColor
	})) : /* @__PURE__ */ React.createElement(View, {
		ref: fieldRef,
		style: fieldRowStyle,
		testID: "Combobox.field"
	}, multiple ? selectedValues.map((v) => renderChip(v, true)) : null, textInput, showClear ? /* @__PURE__ */ React.createElement(Button, {
		label: COPY$12.clearLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			size: "xs",
			color: iconColor
		}),
		onPress: handleClear
	}) : null, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$12.toggleLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-down",
			size: "xs",
			color: iconColor
		}),
		onPress: handleTogglePress
	})), status, displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "Combobox.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null, usesSheet ? /* @__PURE__ */ React.createElement(BottomSheet, {
		open,
		heading: label,
		onClose: () => closePopup(true),
		footer: multiple ? /* @__PURE__ */ React.createElement(Button, {
			label: COPY$12.done,
			onPress: () => closePopup(true)
		}) : void 0
	}, /* @__PURE__ */ React.createElement(React.Fragment, null, multiple && selectedValues.length > 0 ? /* @__PURE__ */ React.createElement(View, { style: sheetChipsRowStyle }, selectedValues.map((v) => renderChip(v, true))) : null, textInput), listbox) : /* @__PURE__ */ React.createElement(Modal, {
		visible: popupMounted,
		transparent: true,
		animationType: "none",
		onRequestClose: () => closePopup(true),
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: () => closePopup(true),
		accessible: false,
		testID: "Combobox.scrim"
	}), fieldRect !== null ? /* @__PURE__ */ React.createElement(Animated.View, {
		style: popupOuterStyle,
		onLayout: handlePopupLayout,
		testID: "Combobox.popup"
	}, /* @__PURE__ */ React.createElement(View, { style: popupInnerStyle }, listbox)) : null)));
}
//#endregion
//#region src/Accordion.tsx
function normalizeIds(value) {
	if (value === void 0) return [];
	return Array.isArray(value) ? value : [value];
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
function Accordion({ items, headingLevel = "3", exclusive = false, value, defaultValue, divided = true, keepMounted = false, onChange, onOpenChange, overrides }) {
	const { tokens: t } = useTheme();
	const isControlled = value !== void 0;
	const [internalIds, setInternalIds] = React.useState(() => normalizeIds(defaultValue));
	const openIds = isControlled ? normalizeIds(value) : internalIds;
	const prevOpenIdsRef = React.useRef(openIds);
	React.useEffect(() => {
		if (!isControlled) {
			prevOpenIdsRef.current = openIds;
			return;
		}
		const prev = prevOpenIdsRef.current;
		if (prev.length !== openIds.length || prev.some((id, index) => id !== openIds[index])) {
			const opened = openIds.filter((id) => !prev.includes(id));
			const closed = prev.filter((id) => !openIds.includes(id));
			opened.forEach((id) => onOpenChange?.({
				id,
				open: true,
				reason: "controlled"
			}));
			closed.forEach((id) => onOpenChange?.({
				id,
				open: false,
				reason: "controlled"
			}));
		}
		prevOpenIdsRef.current = openIds;
	}, [
		openIds,
		isControlled,
		onOpenChange
	]);
	if (__DEV__ && exclusive && !isControlled && normalizeIds(defaultValue).length > 1) console.warn("Accordion: `defaultValue` has more than one id while `exclusive` is set — only the first will open.");
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNone;
	const disclosureOverrides = { triggerPaddingBlock: overrides?.triggerPaddingBlock ?? "space.md" };
	if (overrides?.fontFamily) disclosureOverrides.triggerFontFamily = overrides.fontFamily;
	if (overrides?.triggerFontSize) disclosureOverrides.triggerFontSize = overrides.triggerFontSize;
	if (overrides?.triggerFontWeight) disclosureOverrides.triggerFontWeight = overrides.triggerFontWeight;
	const dividerOverrides = overrides?.divider || overrides?.dividerWidth ? {
		color: overrides?.divider,
		thickness: overrides?.dividerWidth
	} : void 0;
	const handleToggle = (item, open) => {
		const nextIds = exclusive ? open ? [item.id] : [] : open ? [...openIds, item.id] : openIds.filter((id) => id !== item.id);
		if (!isControlled) {
			setInternalIds(nextIds);
			prevOpenIdsRef.current = nextIds;
		}
		onOpenChange?.({
			id: item.id,
			open,
			reason: "trigger"
		});
		if (exclusive && open) openIds.filter((id) => id !== item.id).forEach((id) => onOpenChange?.({
			id,
			open: false,
			reason: "exclusive"
		}));
		onChange?.(nextIds);
	};
	const listStyle = { gap: itemGap };
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Accordion",
		style: listStyle
	}, items.map((item, index) => /* @__PURE__ */ React.createElement(React.Fragment, { key: item.id }, /* @__PURE__ */ React.createElement(Disclosure, {
		summary: item.summary,
		open: openIds.includes(item.id),
		disabled: item.disabled,
		keepMounted,
		headingLevel,
		onToggle: (open) => handleToggle(item, open),
		overrides: disclosureOverrides
	}, item.content), divided && index < items.length - 1 ? /* @__PURE__ */ React.createElement(Divider, { overrides: dividerOverrides }) : null)));
}
//#endregion
//#region src/Slider.tsx
const COPY$11 = {
	minimumLabel: (label) => `${label} minimum`,
	maximumLabel: (label) => `${label} maximum`,
	rangeText: (low, high) => `${low} – ${high}`,
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`
};
const THUMB_ACTIONS = [
	{
		name: "increment",
		label: "Increment"
	},
	{
		name: "decrement",
		label: "Decrement"
	},
	{
		name: "home",
		label: "Set to minimum"
	},
	{
		name: "end",
		label: "Set to maximum"
	},
	{
		name: "pageup",
		label: "Increase by ten steps"
	},
	{
		name: "pagedown",
		label: "Decrease by ten steps"
	}
];
function clamp$2(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function percentOf(value, min, max) {
	if (max <= min) return 0;
	return clamp$2((value - min) / (max - min), 0, 1);
}
function isSameSliderValue(a, b) {
	return Array.isArray(a) && Array.isArray(b) ? a[0] === b[0] && a[1] === b[1] : a === b;
}
/** Snaps a drag/click position: to the nearest mark when `snapToMarks` is set, otherwise to the step grid. */
function snapValue(raw, min, max, step, snapToMarks, marks) {
	const clamped = clamp$2(raw, min, max);
	if (snapToMarks && marks !== void 0 && marks.length > 0) {
		let nearest = marks[0].value;
		let nearestDistance = Math.abs(clamped - nearest);
		for (const mark of marks) {
			const distance = Math.abs(clamped - mark.value);
			if (distance < nearestDistance) {
				nearest = mark.value;
				nearestDistance = distance;
			}
		}
		return clamp$2(nearest, min, max);
	}
	if (step <= 0) return clamped;
	return clamp$2(min + Math.round((clamped - min) / step) * step, min, max);
}
/** One `step` in `direction` — keys (and the increment/decrement accessibility actions) always move by `step`, even when `snapToMarks` is set. */
function steppedValue(current, direction, min, max, step) {
	return clamp$2(current + direction * step, min, max);
}
/** Ten steps in `direction` (PageUp/PageDown), or to the next/previous mark when `snapToMarks` is set. */
function pagedValue(current, direction, min, max, step, snapToMarks, marks) {
	if (snapToMarks && marks !== void 0 && marks.length > 0) {
		const sorted = marks.map((mark) => mark.value).sort((a, b) => a - b);
		return clamp$2((direction > 0 ? sorted.filter((v) => v > current) : sorted.filter((v) => v < current).reverse())[0] ?? current, min, max);
	}
	return clamp$2(current + direction * step * 10, min, max);
}
/**
* One thumb: a `View` (not `Pressable`) carrying a `PanResponder`'s handlers directly,
* since spreading `PanResponder.panHandlers` onto `Pressable` fights that component's
* own gesture responder. `accessible`/`focusable` plus `accessibilityRole="adjustable"`,
* `accessibilityValue` and the `accessibilityActions` are the non-gesture path:
* `increment`/`decrement` reach the native swipe-up/down (VoiceOver) and volume-key
* (TalkBack) gestures directly, while `home`/`end`/`pageup`/`pagedown` — standing in
* for the keyboard's Home/End/PageUp/PageDown — surface in the platform's custom
* actions menu (VoiceOver rotor "Actions", TalkBack local context menu). The drag
* gesture is additive. A `latest` ref keeps the responder's closures current across
* re-renders without recreating the `PanResponder` (which must stay stable for a
* gesture in progress).
*/
const SliderThumb = React.forwardRef(function SliderThumb({ kind, value, min, max, step, snapToMarks, marks, disabled, accessibilityLabel, formatValue, showBubble, reducedMotion, trackWidthRef, onDrag, onDragEnd, styleTokens: st }, ref) {
	const [dragging, setDragging] = React.useState(false);
	const dragStartValue = React.useRef(value);
	const latest = React.useRef({
		value,
		min,
		max,
		step,
		snapToMarks,
		marks,
		disabled,
		onDrag,
		onDragEnd
	});
	latest.current = {
		value,
		min,
		max,
		step,
		snapToMarks,
		marks,
		disabled,
		onDrag,
		onDragEnd
	};
	const panResponder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => !latest.current.disabled,
		onMoveShouldSetPanResponder: (_evt, gesture) => !latest.current.disabled && Math.abs(gesture.dx) > 2,
		onPanResponderGrant: () => {
			dragStartValue.current = latest.current.value;
			setDragging(true);
		},
		onPanResponderMove: (_evt, gesture) => {
			const width = trackWidthRef.current;
			if (width <= 0) return;
			const { min: curMin, max: curMax, step: curStep, snapToMarks: curSnapToMarks, marks: curMarks } = latest.current;
			const raw = dragStartValue.current + gesture.dx / width * (curMax - curMin);
			latest.current.onDrag(kind, snapValue(raw, curMin, curMax, curStep, curSnapToMarks, curMarks));
		},
		onPanResponderRelease: () => {
			setDragging(false);
			latest.current.onDragEnd();
		},
		onPanResponderTerminate: () => {
			setDragging(false);
			latest.current.onDragEnd();
		}
	})).current;
	const handleAccessibilityAction = (event) => {
		const { disabled: curDisabled, value: curValue, min: curMin, max: curMax, step: curStep, snapToMarks: curSnapToMarks, marks: curMarks } = latest.current;
		if (curDisabled) return;
		let next;
		switch (event.nativeEvent.actionName) {
			case "increment":
				next = steppedValue(curValue, 1, curMin, curMax, curStep);
				break;
			case "decrement":
				next = steppedValue(curValue, -1, curMin, curMax, curStep);
				break;
			case "pageup":
				next = pagedValue(curValue, 1, curMin, curMax, curStep, curSnapToMarks, curMarks);
				break;
			case "pagedown":
				next = pagedValue(curValue, -1, curMin, curMax, curStep, curSnapToMarks, curMarks);
				break;
			case "home":
				next = curMin;
				break;
			case "end":
				next = curMax;
				break;
			default: return;
		}
		latest.current.onDrag(kind, next);
		latest.current.onDragEnd();
	};
	const activeAnim = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		const toValue = dragging ? 1 : 0;
		if (reducedMotion) {
			activeAnim.setValue(toValue);
			return;
		}
		Animated.timing(activeAnim, {
			toValue,
			duration: st.transitionDuration,
			easing: toEasing(st.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		dragging,
		reducedMotion,
		activeAnim,
		st.transitionDuration,
		st.motionEasingStandard
	]);
	const percent = percentOf(value, min, max);
	const haloSize = st.thumbSize + st.haloInset * 2;
	const hitStyle = {
		position: "absolute",
		left: `${percent * 100}%`,
		top: "50%",
		width: st.minTarget,
		height: st.minTarget,
		marginLeft: -(st.minTarget / 2),
		marginTop: -(st.minTarget / 2),
		alignItems: "center",
		justifyContent: "center"
	};
	const haloStyle = {
		position: "absolute",
		width: haloSize,
		height: haloSize,
		borderRadius: haloSize / 2,
		backgroundColor: st.fillColor,
		opacity: activeAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, st.haloOpacity]
		})
	};
	const thumbStyle = {
		width: st.thumbSize,
		height: st.thumbSize,
		borderRadius: st.thumbSize / 2,
		backgroundColor: st.thumbColor,
		borderWidth: st.thumbBorderWidth,
		borderColor: st.thumbBorderColor,
		...st.thumbShadow
	};
	const bubbleStyle = {
		position: "absolute",
		bottom: st.minTarget,
		paddingVertical: st.haloInset / 2,
		paddingHorizontal: st.haloInset,
		borderRadius: st.haloInset,
		backgroundColor: st.bubbleSurface
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Slider.thumb",
		accessible: true,
		focusable: !disabled,
		accessibilityRole: "adjustable",
		accessibilityLabel,
		accessibilityValue: {
			min,
			max,
			now: value,
			text: formatValue(value)
		},
		accessibilityState: { disabled },
		accessibilityActions: THUMB_ACTIONS,
		onAccessibilityAction: handleAccessibilityAction,
		...panResponder.panHandlers,
		style: hitStyle
	}, showBubble && dragging ? /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		style: bubbleStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: { color: "color.inverse.foreground" }
	}, formatValue(value))) : null, /* @__PURE__ */ React.createElement(Animated.View, {
		pointerEvents: "none",
		style: haloStyle
	}), /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		style: thumbStyle
	}));
});
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
function Slider({ label, name, min = 0, max = 100, step = 1, snapToMarks = false, required = false, invalid = false, value, defaultValue, range = false, formatValue = (v) => String(v), showValue = "always", marks, disabled = false, description, error, overrides, onValueChange, onSlidingComplete }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const initialValue = React.useRef(defaultValue ?? (range ? [min, max] : min)).current;
	const [internalValue, setInternalValue] = React.useState(initialValue);
	const isDisabled = disabled || (form?.disabled ?? false);
	const currentValue = value ?? internalValue;
	const validRange = max > min;
	React.useEffect(() => {
		if (__DEV__ && !validRange) console.warn(`Slider: max (${max}) must be greater than min (${min}).`);
	}, [
		validRange,
		min,
		max
	]);
	const singleValue = !range && typeof currentValue === "number" ? clamp$2(currentValue, min, max) : min;
	const [rangeMinRaw, rangeMaxRaw] = range && Array.isArray(currentValue) ? currentValue : [min, max];
	const rangeMin = clamp$2(Math.min(rangeMinRaw, rangeMaxRaw), min, max);
	const rangeMax = clamp$2(Math.max(rangeMinRaw, rangeMaxRaw), min, max);
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && isSameSliderValue(candidate, initialValue)) return COPY$11.required(label);
		if (invalid) return COPY$11.invalid(label);
		return null;
	}, [
		required,
		label,
		error,
		invalid,
		initialValue
	]);
	const commit = (next, end) => {
		if (value === void 0) setInternalValue(next);
		onValueChange?.(next);
		if (end) onSlidingComplete?.(next);
		if (form !== null && (form.validateMode === "change" || form.validateMode === "blur" && end)) form.reportValidity(name, validateValue(next));
	};
	const handleDrag = (kind, nextValue) => {
		if (range) {
			if (kind === "min") commit([Math.min(nextValue, rangeMax), rangeMax], false);
			else if (kind === "max") commit([rangeMin, Math.max(nextValue, rangeMin)], false);
		} else commit(nextValue, false);
	};
	const handleDragEnd = () => {
		commit(range ? [rangeMin, rangeMax] : singleValue, true);
	};
	const trackWidthRef = React.useRef(0);
	const handleTrackLayout = (event) => {
		trackWidthRef.current = event.nativeEvent.layout.width;
	};
	const minThumbRef = React.useRef(null);
	const maxThumbRef = React.useRef(null);
	const singleThumbRef = React.useRef(null);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const summarised = form !== null && form.errorSummary;
	const latestForm = React.useRef({
		singleValue,
		rangeMin,
		rangeMax,
		displayedError,
		validateValue
	});
	latestForm.current = {
		singleValue,
		rangeMin,
		rangeMax,
		displayedError,
		validateValue
	};
	const handle = React.useMemo(() => ({
		getValue: () => range ? [String(latestForm.current.rangeMin), String(latestForm.current.rangeMax)] : String(latestForm.current.singleValue),
		validate: () => {
			const current = range ? [latestForm.current.rangeMin, latestForm.current.rangeMax] : latestForm.current.singleValue;
			return latestForm.current.validateValue(current);
		},
		focus: () => {
			const node = range ? minThumbRef.current : singleThumbRef.current;
			const handleNode = node === null ? null : findNodeHandle(node);
			if (handleNode != null) AccessibilityInfo.setAccessibilityFocus(handleNode);
		}
	}), [range]);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		register(name, handle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		handle,
		isDisabled
	]);
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const trackColor = overrides?.track ? resolveToken(t, overrides.track) : t.colorBackgroundStrong;
	const trackHeight = overrides?.trackHeight ? resolveToken(t, overrides.trackHeight) : t.space1;
	const trackRadius = overrides?.trackRadius ? resolveToken(t, overrides.trackRadius) : t.radiusFull;
	const thumbColor = overrides?.thumb ? resolveToken(t, overrides.thumb) : t.colorControlBackground;
	const thumbBorderWidth = overrides?.thumbBorderWidth ? resolveToken(t, overrides.thumbBorderWidth) : t.borderWidthFocus;
	const thumbSize = overrides?.thumbSize ? resolveToken(t, overrides.thumbSize) : t.space5;
	const thumbShadow = overrides?.thumbShadow ? resolveToken(t, overrides.thumbShadow) : t.shadowRaised;
	const thumbActiveScale = overrides?.thumbActiveScale ? resolveToken(t, overrides.thumbActiveScale) : t.opacityDisabled;
	const markColor = overrides?.mark ? resolveToken(t, overrides.mark) : t.colorBorderStrong;
	const markSize = overrides?.markSize ? resolveToken(t, overrides.markSize) : t.space1;
	const markLabelSize = overrides?.markLabelSize ? resolveToken(t, overrides.markLabelSize) : t.fontSizeXs;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const trackPaddingBlock = overrides?.trackPaddingBlock ? resolveToken(t, overrides.trackPaddingBlock) : t.space3;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const controlSelected = t.colorControlSelectedBackground;
	const thumbStyleTokens = {
		thumbSize,
		thumbBorderWidth,
		thumbColor,
		thumbBorderColor: controlSelected,
		thumbShadow,
		fillColor: controlSelected,
		haloInset: t.space2,
		haloOpacity: thumbActiveScale,
		minTarget: t.sizeTargetComfortable,
		bubbleSurface: t.colorInverseSurface,
		motionEasingStandard: t.motionEasingStandard,
		transitionDuration
	};
	const displayValueText = range ? COPY$11.rangeText(formatValue(rangeMin), formatValue(rangeMax)) : formatValue(singleValue);
	const markList = marks ?? [];
	const markLabels = markList.filter((mark) => mark.label !== void 0);
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const labelRowStyle = {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
		gap: t.space2
	};
	const trackRowStyle = {
		position: "relative",
		justifyContent: "center",
		paddingVertical: trackPaddingBlock
	};
	const trackStyle = {
		height: trackHeight,
		borderRadius: trackRadius,
		backgroundColor: trackColor,
		overflow: "hidden"
	};
	const fillStyle = range ? {
		position: "absolute",
		left: `${percentOf(rangeMin, min, max) * 100}%`,
		right: `${(1 - percentOf(rangeMax, min, max)) * 100}%`,
		height: trackHeight,
		borderRadius: trackRadius,
		backgroundColor: controlSelected
	} : {
		position: "absolute",
		left: 0,
		width: `${percentOf(singleValue, min, max) * 100}%`,
		height: trackHeight,
		borderRadius: trackRadius,
		backgroundColor: controlSelected
	};
	const markDotStyle = (markValue) => ({
		position: "absolute",
		left: `${percentOf(markValue, min, max) * 100}%`,
		top: "50%",
		width: markSize,
		height: markSize,
		marginLeft: -(markSize / 2),
		marginTop: -(markSize / 2),
		borderRadius: markSize / 2,
		backgroundColor: markColor
	});
	const markLabelRowStyle = {
		position: "relative",
		minHeight: toLineHeight(markLabelSize, t.fontLineHeightNormal)
	};
	const markLabelStyle = (markValue) => ({
		position: "absolute",
		left: `${percentOf(markValue, min, max) * 100}%`,
		transform: [{ translateX: "-50%" }]
	});
	const typographyOverrides = { fontFamily: overrides?.fontFamily };
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Slider",
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(View, { style: labelRowStyle }, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.fontSize,
			fontWeight: overrides?.labelWeight
		}
	}, label), showValue === "always" ? /* @__PURE__ */ React.createElement(View, { testID: "Slider.valueText" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.valueSize
		}
	}, displayValueText)) : null), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Slider.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, {
		style: trackRowStyle,
		onLayout: handleTrackLayout
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.track",
		style: trackStyle
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.fill",
		style: fillStyle
	})), markList.map((mark) => /* @__PURE__ */ React.createElement(View, {
		key: mark.value,
		testID: "Slider.tickMarks",
		pointerEvents: "none",
		style: markDotStyle(mark.value)
	})), range ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SliderThumb, {
		ref: minThumbRef,
		kind: "min",
		value: rangeMin,
		min,
		max,
		step,
		snapToMarks,
		marks,
		disabled: isDisabled,
		accessibilityLabel: COPY$11.minimumLabel(label),
		formatValue,
		showBubble: showValue === "hover",
		reducedMotion,
		trackWidthRef,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
		styleTokens: thumbStyleTokens
	}), /* @__PURE__ */ React.createElement(SliderThumb, {
		ref: maxThumbRef,
		kind: "max",
		value: rangeMax,
		min,
		max,
		step,
		snapToMarks,
		marks,
		disabled: isDisabled,
		accessibilityLabel: COPY$11.maximumLabel(label),
		formatValue,
		showBubble: showValue === "hover",
		reducedMotion,
		trackWidthRef,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
		styleTokens: thumbStyleTokens
	})) : /* @__PURE__ */ React.createElement(SliderThumb, {
		ref: singleThumbRef,
		kind: "single",
		value: singleValue,
		min,
		max,
		step,
		snapToMarks,
		marks,
		disabled: isDisabled,
		accessibilityLabel: label,
		formatValue,
		showBubble: showValue === "hover",
		reducedMotion,
		trackWidthRef,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
		styleTokens: thumbStyleTokens
	})), markLabels.length > 0 ? /* @__PURE__ */ React.createElement(View, { style: markLabelRowStyle }, markLabels.map((mark) => /* @__PURE__ */ React.createElement(View, {
		key: mark.value,
		style: markLabelStyle(mark.value)
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.markLabelSize
		}
	}, mark.label)))) : null, displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.errorMessage",
		accessibilityLiveRegion: summarised ? "none" : "assertive"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: {
			...helperOverrides,
			color: overrides?.errorText
		}
	}, displayedError)) : null);
}
//#endregion
//#region src/Toolbar.tsx
function isDividerElement(node) {
	return React.isValidElement(node) && node.type === Divider;
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
function Toolbar({ label, children, orientation = "horizontal", overflow = "menu", size = "md", density = "comfortable", overrides }) {
	const { tokens: t } = useTheme();
	const isVertical = orientation === "vertical";
	React.useEffect(() => {
		if (__DEV__ && overflow === "menu") console.warn("Toolbar: `overflow=\"menu\"` has no React Native equivalent — there is no way to measure opaque children and move them into a \"More\" Menu, so it renders the same scrollable row as `overflow=\"scroll\"`.");
	}, [overflow]);
	const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.space2;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.space1;
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNormal;
	const itemGapCompact = overrides?.itemGapCompact ? resolveToken(t, overrides.itemGapCompact) : t.layoutGapTight;
	const groupGap = overrides?.groupGap ? resolveToken(t, overrides.groupGap) : t.layoutGapNormal;
	const separatorLength = overrides?.separatorLength ? resolveToken(t, overrides.separatorLength) : t.space5;
	const fadeWidth = overrides?.fadeWidth ? resolveToken(t, overrides.fadeWidth) : t.space6;
	const background = t.colorBackgroundSubtle;
	const gap = density === "compact" ? itemGapCompact : itemGap;
	const childArray = React.Children.toArray(children);
	const items = childArray.map((child, index) => {
		const key = React.isValidElement(child) && child.key !== null ? child.key : index;
		const isLast = index === childArray.length - 1;
		const currentIsDivider = isDividerElement(child);
		const nextIsDivider = !isLast && isDividerElement(childArray[index + 1]);
		const marginAfter = isLast ? 0 : currentIsDivider || nextIsDivider ? groupGap : gap;
		const marginStyle = isVertical ? { marginBottom: marginAfter } : { marginEnd: marginAfter };
		let content = child;
		if (currentIsDivider) {
			const lengthStyle = isVertical ? {
				width: separatorLength,
				alignItems: "center"
			} : {
				height: separatorLength,
				justifyContent: "center"
			};
			content = /* @__PURE__ */ React.createElement(View, { style: lengthStyle }, child);
		} else if (React.isValidElement(child)) {
			const element = child;
			if (element.props.size === void 0) content = React.cloneElement(element, { size });
		}
		return /* @__PURE__ */ React.createElement(View, {
			key,
			style: marginStyle
		}, content);
	});
	const contentContainerStyle = {
		flexDirection: isVertical ? "column" : "row",
		alignItems: isVertical ? "stretch" : "center",
		flexWrap: overflow === "wrap" ? "wrap" : "nowrap"
	};
	const outerStyle = {
		backgroundColor: background,
		borderWidth,
		borderColor: border,
		borderRadius: radius,
		paddingHorizontal: paddingInline,
		paddingVertical: paddingBlock
	};
	const body = overflow === "wrap" ? /* @__PURE__ */ React.createElement(View, { style: contentContainerStyle }, items) : /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(ScrollView, {
		horizontal: !isVertical,
		showsHorizontalScrollIndicator: false,
		showsVerticalScrollIndicator: false,
		contentContainerStyle
	}, items), /* @__PURE__ */ React.createElement(ToolbarFade, {
		edge: "start",
		vertical: isVertical,
		width: fadeWidth,
		color: background
	}), /* @__PURE__ */ React.createElement(ToolbarFade, {
		edge: "end",
		vertical: isVertical,
		width: fadeWidth,
		color: background
	}));
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Toolbar",
		accessibilityRole: "toolbar",
		accessibilityLabel: label,
		style: outerStyle
	}, body);
}
/** One edge fade over the scrollable row/column, from `background` to transparent. */
function ToolbarFade({ edge, vertical, width, color }) {
	const gradientId = React.useId();
	const positionStyle = vertical ? {
		position: "absolute",
		left: 0,
		right: 0,
		height: width,
		[edge === "start" ? "top" : "bottom"]: 0
	} : {
		position: "absolute",
		top: 0,
		bottom: 0,
		width,
		[edge === "start" ? "left" : "right"]: 0
	};
	const [x1, y1, x2, y2] = vertical ? edge === "start" ? [
		"0%",
		"0%",
		"0%",
		"100%"
	] : [
		"0%",
		"100%",
		"0%",
		"0%"
	] : edge === "start" ? [
		"0%",
		"0%",
		"100%",
		"0%"
	] : [
		"100%",
		"0%",
		"0%",
		"0%"
	];
	return /* @__PURE__ */ React.createElement(View, {
		style: positionStyle,
		pointerEvents: "none",
		testID: `Toolbar.fade-${edge}`
	}, /* @__PURE__ */ React.createElement(Svg, {
		width: "100%",
		height: "100%"
	}, /* @__PURE__ */ React.createElement(Defs, null, /* @__PURE__ */ React.createElement(LinearGradient, {
		id: gradientId,
		x1,
		y1,
		x2,
		y2
	}, /* @__PURE__ */ React.createElement(Stop, {
		offset: "0",
		stopColor: color,
		stopOpacity: 1
	}), /* @__PURE__ */ React.createElement(Stop, {
		offset: "1",
		stopColor: color,
		stopOpacity: 0
	}))), /* @__PURE__ */ React.createElement(Rect, {
		width: "100%",
		height: "100%",
		fill: `url(#${gradientId})`
	})));
}
//#endregion
//#region src/Carousel.tsx
/** One slide. Rendered by `Carousel`, never directly. */
function CarouselSlide({ children }) {
	return /* @__PURE__ */ React.createElement(React.Fragment, null, children);
}
function collectSlides(children) {
	const slides = [];
	React.Children.forEach(children, (child, index) => {
		if (React.isValidElement(child) && child.type === CarouselSlide) {
			const props = child.props;
			slides.push({
				key: child.key ?? String(index),
				heading: props.heading,
				content: props.children
			});
		}
	});
	return slides;
}
const COPY$10 = {
	previous: "Previous slide",
	next: "Next slide",
	play: "Start automatic rotation",
	pause: "Stop automatic rotation",
	slideLabel: (n, total) => `${n} of ${total}`,
	goTo: (n) => `Go to slide ${n}`,
	announce: (n, total) => `Slide ${n} of ${total}`
};
const REGION_ACTIONS = [{
	name: "increment",
	label: "Next slide"
}, {
	name: "decrement",
	label: "Previous slide"
}];
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
function Carousel({ label, children, perView = 1, loop = false, autoplay = false, interval = 6e3, picker = "dots", activeIndex, snap = true, onChange, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const slides = React.useMemo(() => collectSlides(children), [children]);
	React.useEffect(() => {
		if (__DEV__) React.Children.forEach(children, (child) => {
			if (!React.isValidElement(child) || child.type !== CarouselSlide) console.warn("Carousel: children must be CarouselSlide elements.");
		});
	}, [children]);
	React.useEffect(() => {
		if (__DEV__ && interval < 5e3) console.warn("Carousel: interval below the 5-second minimum does not give people enough time to read a slide before it advances; raised to the minimum.");
	}, [interval]);
	const effectiveInterval = Math.max(interval, 5e3);
	const perViewClamped = Math.max(1, Math.round(perView));
	const isControlled = activeIndex !== void 0;
	const [internalIndex, setInternalIndex] = React.useState(0);
	const currentIndex = Math.min(isControlled ? activeIndex : internalIndex, Math.max(0, slides.length - 1));
	const [viewportWidth, setViewportWidth] = React.useState(0);
	const slideGap = overrides?.slideGap ? resolveToken(t, overrides.slideGap) : t.layoutGapNormal;
	const itemWidth = viewportWidth > 0 ? (viewportWidth - slideGap * (perViewClamped - 1)) / perViewClamped : viewportWidth;
	const controlOffset = overrides?.controlOffset ? resolveToken(t, overrides.controlOffset) : t.space2;
	const controlShadow = overrides?.controlShadow ? resolveToken(t, overrides.controlShadow) : t.shadowRaised;
	const pickerGap = overrides?.pickerGap ? resolveToken(t, overrides.pickerGap) : t.layoutGapTight;
	const pickerOffset = overrides?.pickerOffset ? resolveToken(t, overrides.pickerOffset) : t.space3;
	const dotSize = overrides?.dotSize ? resolveToken(t, overrides.dotSize) : t.space2;
	const dotTarget = overrides?.dotTarget ? resolveToken(t, overrides.dotTarget) : t.sizeTargetMin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const controlBackground = t.colorOverlaySurface;
	const dotColor = t.colorBorderStrong;
	const dotActiveColor = t.colorControlSelectedBackground;
	const minTarget = t.sizeTargetComfortable;
	const focusRingColor = t.colorBorderFocus;
	const focusRingWidth = t.borderWidthFocus;
	const [announcement, setAnnouncement] = React.useState("");
	React.useEffect(() => {
		if (Platform.OS === "ios" && announcement !== "") AccessibilityInfo.announceForAccessibility(announcement);
	}, [announcement]);
	const clampIndex = React.useCallback((index) => {
		const total = slides.length;
		if (total === 0) return 0;
		if (loop) return (index % total + total) % total;
		const maxIndex = Math.max(0, total - perViewClamped);
		return Math.min(Math.max(index, 0), maxIndex);
	}, [
		slides.length,
		loop,
		perViewClamped
	]);
	const flatListRef = React.useRef(null);
	const goTo = React.useCallback((index, reason) => {
		const clamped = clampIndex(index);
		if (clamped === currentIndex) return;
		if (!isControlled) setInternalIndex(clamped);
		onChange?.(clamped, reason);
		flatListRef.current?.scrollToOffset({
			offset: clamped * (itemWidth + slideGap),
			animated: !reducedMotion
		});
		if (reason !== "autoplay") setAnnouncement(COPY$10.announce(clamped + 1, slides.length));
	}, [
		clampIndex,
		currentIndex,
		isControlled,
		onChange,
		itemWidth,
		slideGap,
		reducedMotion,
		slides.length
	]);
	const latest = React.useRef({
		currentIndex,
		goTo
	});
	latest.current = {
		currentIndex,
		goTo
	};
	const [playing, setPlaying] = React.useState(autoplay && !reducedMotion);
	React.useEffect(() => {
		if (!autoplay || reducedMotion) setPlaying(false);
	}, [autoplay, reducedMotion]);
	React.useEffect(() => {
		if (!playing) return;
		const id = setInterval(() => {
			latest.current.goTo(latest.current.currentIndex + 1, "autoplay");
		}, effectiveInterval);
		return () => clearInterval(id);
	}, [playing, effectiveInterval]);
	const pauseAutoplay = () => setPlaying(false);
	const handleViewportLayout = (event) => {
		setViewportWidth(event.nativeEvent.layout.width);
	};
	const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;
	const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
		const first = viewableItems.find((entry) => entry.isViewable);
		if (!first || first.index === null || first.index === void 0 || first.index === latest.current.currentIndex) return;
		latest.current.goTo(first.index, "swipe");
	}).current;
	const handleRegionAccessibilityAction = (event) => {
		if (event.nativeEvent.actionName === "increment") goTo(currentIndex + 1, "next");
		else if (event.nativeEvent.actionName === "decrement") goTo(currentIndex - 1, "prev");
	};
	const prevDisabled = !loop && currentIndex <= 0;
	const nextDisabled = !loop && currentIndex >= Math.max(0, slides.length - perViewClamped);
	const renderItem = ({ item, index }) => {
		const visible = Math.min(Math.abs(index - currentIndex), slides.length - Math.abs(index - currentIndex)) < perViewClamped;
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Carousel.slide",
			accessible: true,
			accessibilityLabel: `${COPY$10.slideLabel(index + 1, slides.length)}, ${item.heading}`,
			accessibilityElementsHidden: !visible,
			importantForAccessibility: visible ? "auto" : "no-hide-descendants",
			style: { width: itemWidth > 0 ? itemWidth : void 0 }
		}, item.content);
	};
	const viewportStyle = {
		position: "relative",
		borderRadius: radius,
		overflow: "hidden"
	};
	const controlsOverlayStyle = {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: controlOffset,
		zIndex: 1
	};
	const arrowBackdropStyle = {
		borderRadius: t.radiusFull,
		backgroundColor: controlBackground,
		...controlShadow
	};
	const pickerRowStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
		gap: pickerGap,
		marginTop: pickerOffset
	};
	const pickerStyleTokens = {
		dotSize,
		dotTarget,
		dotColor,
		dotActiveColor,
		minTarget,
		focusRingColor,
		focusRingWidth,
		fontFamily: t.fontFamilyBody,
		fontSize: t.fontSizeSm,
		fontWeight: t.fontWeightRegular,
		fontWeightSelected: t.fontWeightSemibold,
		tabPaddingInline: t.spaceSm,
		tabColor: t.colorForegroundMuted,
		tabSelectedColor: t.colorForegroundStrong
	};
	const showPlayButton = autoplay && !reducedMotion;
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel",
		accessibilityRole: "adjustable",
		accessibilityLabel: label,
		accessibilityActions: REGION_ACTIONS,
		onAccessibilityAction: handleRegionAccessibilityAction,
		onTouchStart: pauseAutoplay
	}, showPlayButton ? /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.playButton",
		style: {
			marginBottom: t.layoutGapTight,
			alignSelf: "flex-start"
		}
	}, /* @__PURE__ */ React.createElement(Button, {
		label: playing ? COPY$10.pause : COPY$10.play,
		variant: "secondary",
		size: "sm",
		onPress: () => setPlaying((prev) => !prev)
	})) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.viewport",
		onLayout: handleViewportLayout,
		style: viewportStyle
	}, /* @__PURE__ */ React.createElement(View, {
		style: controlsOverlayStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.prevButton",
		style: arrowBackdropStyle
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$10.previous,
		variant: "ghost",
		iconOnly: true,
		disabled: prevDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-left",
			color: t.colorActionGhostForeground
		}),
		onPress: () => goTo(currentIndex - 1, "prev")
	})), /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.nextButton",
		style: arrowBackdropStyle
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$10.next,
		variant: "ghost",
		iconOnly: true,
		disabled: nextDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-right",
			color: t.colorActionGhostForeground
		}),
		onPress: () => goTo(currentIndex + 1, "next")
	}))), /* @__PURE__ */ React.createElement(FlatList, {
		ref: flatListRef,
		testID: "Carousel.track",
		data: slides,
		keyExtractor: (item) => item.key,
		renderItem,
		horizontal: true,
		pagingEnabled: snap && perViewClamped === 1,
		snapToInterval: snap && perViewClamped > 1 ? itemWidth + slideGap : void 0,
		snapToAlignment: "start",
		decelerationRate: "fast",
		showsHorizontalScrollIndicator: false,
		onScrollBeginDrag: pauseAutoplay,
		viewabilityConfig,
		onViewableItemsChanged,
		ItemSeparatorComponent: () => /* @__PURE__ */ React.createElement(View, { style: { width: slideGap } })
	})), picker !== "none" ? /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.picker",
		accessibilityRole: picker === "tabs" ? "tablist" : void 0,
		style: pickerRowStyle
	}, slides.map((slide, index) => /* @__PURE__ */ React.createElement(CarouselPickerItem, {
		key: slide.key,
		picker,
		heading: slide.heading,
		index,
		selected: index === currentIndex,
		styleTokens: pickerStyleTokens,
		onSelect: () => goTo(index, "picker")
	}))) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.liveRegion",
		accessibilityLiveRegion: "polite",
		importantForAccessibility: "yes",
		style: {
			position: "absolute",
			width: 1,
			height: 1,
			overflow: "hidden"
		}
	}, /* @__PURE__ */ React.createElement(Text$1, null, announcement)));
}
/** One dot or tab in the picker. Its own component so focus state does not re-render the whole row. */
function CarouselPickerItem({ picker, heading, index, selected, styleTokens: s, onSelect }) {
	const [focused, setFocused] = React.useState(false);
	const isTabs = picker === "tabs";
	const hitStyle = {
		minWidth: isTabs ? s.minTarget : s.dotTarget,
		minHeight: isTabs ? s.minTarget : s.dotTarget,
		paddingHorizontal: isTabs ? s.tabPaddingInline : 0,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: s.focusRingWidth,
		borderColor: focused ? s.focusRingColor : "transparent"
	};
	const dotVisualStyle = {
		width: s.dotSize,
		height: s.dotSize,
		borderRadius: s.dotSize / 2,
		backgroundColor: selected ? s.dotActiveColor : s.dotColor
	};
	const tabLabelStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.fontSize,
		fontWeight: toFontWeight(selected ? s.fontWeightSelected : s.fontWeight),
		color: selected ? s.tabSelectedColor : s.tabColor
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Carousel.pickerItem",
		accessibilityRole: isTabs ? "tab" : "button",
		accessibilityLabel: isTabs ? heading : COPY$10.goTo(index + 1),
		accessibilityState: { selected },
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onPress: onSelect,
		style: hitStyle
	}, isTabs ? /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: tabLabelStyle
	}, heading) : /* @__PURE__ */ React.createElement(View, { style: dotVisualStyle }));
}
//#endregion
//#region src/Table.tsx
const COPY$9 = {
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedCount: (count, total) => `${count} of ${total} selected`,
	actions: "Actions",
	empty: "Nothing to show.",
	loading: "Loading",
	scrollHint: "Scroll sideways to see more columns",
	rowCount: (count) => `${count} rows`
};
/** Visually clips content to 1x1 while keeping it in the accessibility tree, for live-region announcements. */
const HIDDEN_STYLE$4 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
function cellValue$2(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function compareRows$2(a, b, column, direction) {
	const factor = direction === "ascending" ? 1 : -1;
	const av = a[column];
	const bv = b[column];
	if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv, void 0, { numeric: true }) * factor;
	const an = Number(av);
	const bn = Number(bv);
	if (Number.isNaN(an) || Number.isNaN(bn)) return 0;
	return (an - bn) * factor;
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
function Table({ caption, captionLevel = "2", hideCaption = false, footer, columns, data, sort, defaultSort, selectable = "none", selected, defaultSelected, responsive = "stack", stickyHeader = true, maxHeight = "none", density = "comfortable", striped = false, emptyMessage, loading = false, rowActions, overrides, onSortChange, onSelectionChange, onRowPress }) {
	const { tokens: t } = useTheme();
	const { width, height } = useWindowDimensions();
	const isCompact = width < t.layoutMaxWidthProse;
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const activeSort = sort ?? internalSort;
	const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? []);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const [headerScrolled, setHeaderScrolled] = React.useState(false);
	const [columnScrolled, setColumnScrolled] = React.useState(false);
	const [sortAnnouncement, setSortAnnouncement] = React.useState("");
	const [selectionAnnouncement, setSelectionAnnouncement] = React.useState("");
	const isFirstSort = React.useRef(true);
	React.useEffect(() => {
		if (isFirstSort.current) {
			isFirstSort.current = false;
			return;
		}
		if (activeSort === void 0) return;
		const column = columns.find((c) => c.key === activeSort.column);
		const message = COPY$9.sortedAnnouncement(column?.header ?? activeSort.column, activeSort.direction);
		setSortAnnouncement(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	}, [activeSort?.column, activeSort?.direction]);
	const isFirstSelection = React.useRef(true);
	React.useEffect(() => {
		if (isFirstSelection.current) {
			isFirstSelection.current = false;
			return;
		}
		if (selectable === "none") return;
		const message = COPY$9.selectedCount(selectedIds.length, data.length);
		setSelectionAnnouncement(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	}, [selectedIds.length]);
	React.useEffect(() => {
		if (__DEV__ && isCompact && responsive === "scroll") console.warn("Table: `responsive=\"scroll\"` has no effect at phone widths — there is no room for columns, so the table always renders the stacked form there.");
	}, [isCompact, responsive]);
	const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
	const visibleColumns = React.useMemo(() => columns.filter((column) => {
		if (column.hideBelow === "prose") return width >= t.layoutMaxWidthProse;
		if (column.hideBelow === "content") return width >= t.layoutMaxWidthContent;
		return true;
	}), [
		columns,
		width,
		t.layoutMaxWidthProse,
		t.layoutMaxWidthContent
	]);
	const orderedColumns = React.useMemo(() => rowHeaderColumn ? [rowHeaderColumn, ...visibleColumns.filter((c) => c !== rowHeaderColumn)] : visibleColumns, [rowHeaderColumn, visibleColumns]);
	const sortedData = React.useMemo(() => {
		if (sort !== void 0 || internalSort === void 0) return data;
		return [...data].sort((a, b) => compareRows$2(a, b, internalSort.column, internalSort.direction));
	}, [
		data,
		sort,
		internalSort
	]);
	const commitSort = (next) => {
		if (sort === void 0) setInternalSort(next);
		onSortChange?.(next);
	};
	const handleSortPress = (columnKey) => {
		const next = activeSort?.column === columnKey ? {
			column: columnKey,
			direction: activeSort.direction === "ascending" ? "descending" : "ascending"
		} : {
			column: columnKey,
			direction: "ascending"
		};
		commitSort(next);
	};
	const commitSelection = (next) => {
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
	};
	const toggleRow = (id) => {
		if (selectable === "single") commitSelection(selectedSet.has(id) ? [] : [id]);
		else if (selectable === "multiple") {
			const next = new Set(selectedSet);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			commitSelection(Array.from(next));
		}
	};
	const allIds = sortedData.map((row) => row.id);
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const toggleAll = () => {
		commitSelection(allSelected ? [] : allIds);
	};
	const rowName = (row) => rowHeaderColumn ? cellValue$2(row, rowHeaderColumn.key) || row.id : row.id;
	const cellPaddingInline = density === "compact" ? overrides?.cellPaddingInlineCompact ? resolveToken(t, overrides.cellPaddingInlineCompact) : t.layoutInsetSm : overrides?.cellPaddingInline ? resolveToken(t, overrides.cellPaddingInline) : t.layoutInsetMd;
	const cellPaddingBlock = overrides?.cellPaddingBlock ? resolveToken(t, overrides.cellPaddingBlock) : t.spaceSm;
	const cellGap = overrides?.cellGap ? resolveToken(t, overrides.cellGap) : t.layoutGapTight;
	const headerBorderColor = overrides?.headerBorder ? resolveToken(t, overrides.headerBorder) : t.colorBorderStrong;
	const headerBorderWidth = overrides?.headerBorderWidth ? resolveToken(t, overrides.headerBorderWidth) : t.borderWidthThin;
	const headerShadow = overrides?.headerShadow ? resolveToken(t, overrides.headerShadow) : t.shadowRaised;
	const rowBorderColor = overrides?.rowBorder ? resolveToken(t, overrides.rowBorder) : t.colorBorder;
	const rowBorderWidth = overrides?.rowBorderWidth ? resolveToken(t, overrides.rowBorderWidth) : t.borderWidthThin;
	const rowHover = overrides?.rowHover ? resolveToken(t, overrides.rowHover) : t.colorActionGhostBackgroundHover;
	const rowSelectedBorderWidth = overrides?.rowSelectedBorderWidth ? resolveToken(t, overrides.rowSelectedBorderWidth) : t.borderWidthFocus;
	const stackedRowInset = overrides?.stackedRowInset ? resolveToken(t, overrides.stackedRowInset) : t.layoutInsetMd;
	const stackedRowGap = overrides?.stackedRowGap ? resolveToken(t, overrides.stackedRowGap) : t.layoutGapTight;
	const stackedRowRadius = overrides?.stackedRowRadius ? resolveToken(t, overrides.stackedRowRadius) : t.radiusMd;
	const stickyColumnShadow = overrides?.stickyColumnShadow ? resolveToken(t, overrides.stickyColumnShadow) : t.shadowRaised;
	const scrollFade = overrides?.scrollFade ? resolveToken(t, overrides.scrollFade) : t.space6;
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const headerTypographyOverrides = {
		...typographyOverrides,
		fontWeight: overrides?.headerWeight,
		fontSize: overrides?.headerSize
	};
	const cellTypographyOverrides = (align) => ({
		...typographyOverrides,
		fontFamily: align === "end" ? overrides?.numericFont ?? "font.family.mono" : overrides?.fontFamily,
		fontSize: overrides?.fontSize
	});
	const viewportMaxHeight = maxHeight === "viewport" ? Math.max(0, height - t.layoutSectionMd) : void 0;
	const showEmpty = sortedData.length === 0;
	const emptyText = loading ? COPY$9.loading : emptyMessage ?? COPY$9.empty;
	const columnStyle = (column) => column.width === "fill" ? {
		flex: 1,
		flexShrink: 1
	} : {
		flexGrow: 0,
		flexShrink: 0,
		width: t.space20
	};
	const cellStyle = {
		paddingHorizontal: cellPaddingInline,
		paddingVertical: cellPaddingBlock,
		justifyContent: "center"
	};
	const selectCellStyle = {
		width: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: cellPaddingBlock
	};
	const footerStyle = {
		paddingHorizontal: cellPaddingInline,
		paddingVertical: cellPaddingBlock
	};
	const actionsCellStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: cellGap,
		paddingHorizontal: cellPaddingInline,
		paddingVertical: cellPaddingBlock
	};
	function renderCellText(row, column) {
		if (column.render) return column.render(row);
		return /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			align: column.align ?? "start",
			truncate: true,
			overrides: cellTypographyOverrides(column.align)
		}, cellValue$2(row, column.key));
	}
	const handleHeaderScroll = (event) => {
		setHeaderScrolled(event.nativeEvent.contentOffset.y > 0);
	};
	const handleColumnScroll = (event) => {
		setColumnScrolled(event.nativeEvent.contentOffset.x > 0);
	};
	const headerRowStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		backgroundColor: t.colorBackgroundSubtle,
		borderBottomWidth: headerBorderWidth,
		borderBottomColor: headerBorderColor,
		...stickyHeader && headerScrolled ? headerShadow : null
	};
	const renderWideHeader = () => /* @__PURE__ */ React.createElement(View, {
		style: headerRowStyle,
		testID: "Table.headerRow"
	}, selectable === "multiple" ? /* @__PURE__ */ React.createElement(View, {
		style: selectCellStyle,
		testID: "Table.selectAllCell"
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$9.selectAll,
		name: "table-select-all",
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : selectable === "single" ? /* @__PURE__ */ React.createElement(View, { style: selectCellStyle }) : null, visibleColumns.map((column) => {
		const active = activeSort?.column === column.key;
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: [cellStyle, columnStyle(column)],
			accessibilityRole: "header",
			testID: "Table.columnHeader"
		}, column.sortable ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, {
			label: column.header,
			variant: "ghost",
			size: "sm",
			trailingIcon: active ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorForeground
			}) : void 0,
			overrides: {
				fontWeight: overrides?.headerWeight ?? "font.weight.semibold",
				fontSize: overrides?.headerSize,
				iconGap: overrides?.cellGap
			},
			onPress: () => handleSortPress(column.key)
		}), active ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE$4 }, /* @__PURE__ */ React.createElement(Text, null, activeSort.direction === "ascending" ? COPY$9.sortAscending(column.header) : COPY$9.sortDescending(column.header))) : null) : /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			truncate: true,
			overrides: headerTypographyOverrides
		}, column.header));
	}), rowActions ? /* @__PURE__ */ React.createElement(View, {
		style: [cellStyle, actionsCellStyle],
		accessibilityRole: "header",
		testID: "Table.columnHeader"
	}, /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE$4 }, /* @__PURE__ */ React.createElement(Text, null, COPY$9.actions))) : null);
	const renderWideRow = ({ item: row, index }) => {
		const isSelected = selectable !== "none" && selectedSet.has(row.id);
		const isStriped = striped && index % 2 === 1;
		const rowStyle = {
			flexDirection: "row",
			alignItems: "stretch",
			borderBottomWidth: rowBorderWidth,
			borderBottomColor: rowBorderColor,
			backgroundColor: isSelected || isStriped ? t.colorBackgroundSubtle : t.colorBackground,
			borderLeftWidth: isSelected ? rowSelectedBorderWidth : 0,
			borderLeftColor: isSelected ? t.colorControlSelectedBackground : "transparent"
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: rowStyle,
			accessibilityState: selectable !== "none" ? { selected: isSelected } : void 0,
			testID: "Table.row"
		}, selectable !== "none" ? /* @__PURE__ */ React.createElement(View, {
			style: selectCellStyle,
			testID: "Table.selectCell"
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$9.selectRow(rowName(row)),
			name: `table-row-${row.id}`,
			checked: isSelected,
			onChange: () => toggleRow(row.id)
		})) : null, visibleColumns.map((column) => {
			const isHeaderCell = column.isRowHeader === true;
			if (isHeaderCell && onRowPress) return /* @__PURE__ */ React.createElement(Pressable, {
				key: column.key,
				style: ({ pressed }) => [
					cellStyle,
					columnStyle(column),
					{ backgroundColor: pressed ? rowHover : "transparent" }
				],
				accessibilityRole: "button",
				accessibilityLabel: rowName(row),
				onPress: () => onRowPress(row.id),
				testID: "Table.rowHeader"
			}, renderCellText(row, column));
			return /* @__PURE__ */ React.createElement(View, {
				key: column.key,
				style: [
					cellStyle,
					columnStyle(column),
					isHeaderCell && columnScrolled && responsive === "scroll" ? stickyColumnShadow : null
				],
				testID: isHeaderCell ? "Table.rowHeader" : "Table.cell"
			}, renderCellText(row, column));
		}), rowActions ? /* @__PURE__ */ React.createElement(View, {
			style: [cellStyle, actionsCellStyle],
			testID: "Table.cell"
		}, rowActions(row)) : null);
	};
	const wideList = /* @__PURE__ */ React.createElement(FlatList, {
		data: sortedData,
		keyExtractor: (row) => row.id,
		renderItem: renderWideRow,
		ListHeaderComponent: renderWideHeader,
		stickyHeaderIndices: stickyHeader ? [0] : void 0,
		onScroll: handleHeaderScroll,
		scrollEventThrottle: 16,
		scrollEnabled: maxHeight === "viewport",
		style: { maxHeight: viewportMaxHeight },
		accessibilityRole: "list",
		accessibilityLabel: caption,
		accessibilityHint: COPY$9.rowCount(data.length),
		accessibilityState: { busy: loading },
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			style: cellStyle,
			accessible: true,
			accessibilityLabel: emptyText,
			testID: "Table.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, emptyText)),
		testID: "Table.table"
	});
	const wideBody = responsive === "scroll" ? /* @__PURE__ */ React.createElement(ScrollView, {
		horizontal: true,
		showsHorizontalScrollIndicator: true,
		onScroll: handleColumnScroll,
		scrollEventThrottle: 16,
		contentContainerStyle: {
			paddingHorizontal: scrollFade,
			minWidth: orderedColumns.length * t.space20 + (selectable !== "none" ? t.sizeTargetComfortable : 0)
		},
		accessibilityLabel: caption,
		accessibilityHint: COPY$9.scrollHint,
		testID: "Table.scrollRegion"
	}, /* @__PURE__ */ React.createElement(View, { style: { flex: 1 } }, wideList)) : wideList;
	const sortableColumns = visibleColumns.filter((column) => column.sortable === true);
	const stackedRowStyle = {
		marginBottom: stackedRowGap,
		borderRadius: stackedRowRadius,
		padding: stackedRowInset
	};
	const stackedPairStyle = { marginBottom: stackedRowGap };
	const renderStackedRow = ({ item: row, index }) => {
		const isSelected = selectable !== "none" && selectedSet.has(row.id);
		const isStriped = striped && index % 2 === 1;
		const blockStyle = {
			...stackedRowStyle,
			backgroundColor: isSelected || isStriped ? t.colorBackgroundSubtle : t.colorBackground,
			borderLeftWidth: isSelected ? rowSelectedBorderWidth : 0,
			borderLeftColor: isSelected ? t.colorControlSelectedBackground : "transparent"
		};
		const summaryLabel = orderedColumns.map((column) => `${column.header}: ${cellValue$2(row, column.key)}`).join(". ");
		const pairs = /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no"
		}, orderedColumns.map((column) => /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: stackedPairStyle
		}, /* @__PURE__ */ React.createElement(View, { testID: "Table.stackedLabel" }, /* @__PURE__ */ React.createElement(Text, {
			size: "xs",
			weight: "medium",
			tone: "muted",
			overrides: {
				...typographyOverrides,
				fontSize: overrides?.stackedLabelSize,
				fontWeight: overrides?.stackedLabelWeight
			}
		}, column.header)), renderCellText(row, column))));
		return /* @__PURE__ */ React.createElement(View, {
			style: {
				flexDirection: "row",
				alignItems: "flex-start"
			},
			testID: "Table.row"
		}, selectable !== "none" ? /* @__PURE__ */ React.createElement(View, {
			style: selectCellStyle,
			testID: "Table.selectCell"
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$9.selectRow(rowName(row)),
			name: `table-row-${row.id}`,
			checked: isSelected,
			onChange: () => toggleRow(row.id)
		})) : null, onRowPress ? /* @__PURE__ */ React.createElement(Pressable, {
			style: [blockStyle, { flex: 1 }],
			accessibilityRole: "button",
			accessibilityLabel: summaryLabel,
			accessibilityState: { selected: selectable !== "none" ? isSelected : void 0 },
			onPress: () => onRowPress(row.id)
		}, pairs) : /* @__PURE__ */ React.createElement(View, {
			style: [blockStyle, { flex: 1 }],
			accessible: true,
			accessibilityLabel: summaryLabel,
			accessibilityState: { selected: selectable !== "none" ? isSelected : void 0 }
		}, pairs), rowActions ? /* @__PURE__ */ React.createElement(View, {
			style: actionsCellStyle,
			testID: "Table.cell"
		}, rowActions(row)) : null);
	};
	const compactHeader = /* @__PURE__ */ React.createElement(View, { testID: "Table.header" }, selectable === "multiple" ? /* @__PURE__ */ React.createElement(View, {
		style: {
			paddingHorizontal: cellPaddingInline,
			paddingBottom: cellPaddingBlock
		},
		testID: "Table.selectAllCell"
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$9.selectAll,
		name: "table-select-all",
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : null, sortableColumns.length > 0 ? /* @__PURE__ */ React.createElement(Toolbar, {
		label: `Sort ${caption}`,
		density
	}, sortableColumns.map((column) => {
		const active = activeSort?.column === column.key;
		return /* @__PURE__ */ React.createElement(Button, {
			key: column.key,
			label: column.header,
			variant: "ghost",
			size: "sm",
			trailingIcon: active ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorForeground
			}) : void 0,
			onPress: () => handleSortPress(column.key)
		});
	})) : null);
	const compactList = /* @__PURE__ */ React.createElement(FlatList, {
		data: sortedData,
		keyExtractor: (row) => row.id,
		renderItem: renderStackedRow,
		ListHeaderComponent: compactHeader,
		scrollEnabled: maxHeight === "viewport",
		style: { maxHeight: viewportMaxHeight },
		accessibilityRole: "list",
		accessibilityLabel: caption,
		accessibilityHint: COPY$9.rowCount(data.length),
		accessibilityState: { busy: loading },
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			accessible: true,
			accessibilityLabel: emptyText,
			style: { padding: stackedRowInset },
			testID: "Table.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, emptyText)),
		testID: "Table.table"
	});
	return /* @__PURE__ */ React.createElement(View, { testID: "Table" }, !hideCaption ? /* @__PURE__ */ React.createElement(View, { testID: "Table.caption" }, /* @__PURE__ */ React.createElement(Heading, {
		level: captionLevel,
		overrides: {
			fontSize: overrides?.captionSize,
			fontWeight: overrides?.captionWeight,
			marginBlockEnd: overrides?.captionGap ?? "space.2"
		}
	}, caption)) : null, /* @__PURE__ */ React.createElement(View, { testID: "Table.container" }, loading && !showEmpty ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: "polite" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted"
	}, COPY$9.loading)) : null, isCompact ? compactList : wideBody), footer !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: footerStyle,
		testID: "Table.footer"
	}, footer) : null, /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$4
	}, /* @__PURE__ */ React.createElement(Text, null, sortAnnouncement)), /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$4
	}, /* @__PURE__ */ React.createElement(Text, null, selectionAnnouncement)));
}
//#endregion
//#region src/DataGrid.tsx
const COPY$8 = {
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedRows: (count, total) => `${count} of ${total} rows selected`,
	editing: (column) => `Editing ${column}. Enter to save, Escape to cancel.`,
	invalid: (message) => message,
	rowCount: (count) => `${count} rows`,
	position: (row, column) => `Row ${row}, ${column}`,
	resize: (column) => `Resize ${column}`,
	loading: "Loading",
	empty: "Nothing to show.",
	scrollHint: "Scroll sideways to see more columns"
};
/**
* Visually clips content to 1x1 while keeping it in the accessibility tree, for
* live-region announcements.
*/
const HIDDEN_STYLE$3 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
/** Rows requested from the caller each time the visible window nears the end of `data`. */
const DEFAULT_PAGE_SIZE = 50;
function cellValue$1(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function compareRows$1(a, b, column, direction) {
	const factor = direction === "ascending" ? 1 : -1;
	const av = a[column];
	const bv = b[column];
	if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv, void 0, { numeric: true }) * factor;
	const an = Number(av);
	const bn = Number(bv);
	if (Number.isNaN(an) || Number.isNaN(bn)) return 0;
	return (an - bn) * factor;
}
/**
* The draggable edge of a resizable column header. Built on core `PanResponder`
* (the package permits no gesture-handler dependency); reads and reports width
* through refs so dragging never lags behind the parent's re-renders.
*/
function DataGridResizeHandle({ width, minWidth, color, handleWidth, label, onResize, onResizeEnd }) {
	const widthRef = React.useRef(width);
	widthRef.current = width;
	const startWidthRef = React.useRef(width);
	const responder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderGrant: () => {
			startWidthRef.current = widthRef.current;
		},
		onPanResponderMove: (_event, gesture) => {
			onResize(Math.max(minWidth, startWidthRef.current + gesture.dx));
		},
		onPanResponderRelease: () => {
			onResizeEnd(widthRef.current);
		},
		onPanResponderTerminate: () => {
			onResizeEnd(widthRef.current);
		}
	})).current;
	const style = {
		width: handleWidth,
		alignSelf: "stretch",
		backgroundColor: color
	};
	return /* @__PURE__ */ React.createElement(View, {
		...responder.panHandlers,
		role: "separator",
		accessibilityRole: "adjustable",
		accessibilityLabel: label,
		style,
		testID: "DataGrid.resizeHandle"
	});
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
function DataGrid({ caption, hideCaption = false, columns, data, rowCount, sort, defaultSort, selectable = "none", selected, editable = false, density = "compact", stickyHeader = true, height = "viewport", loading = false, emptyMessage, showStatusBar = true, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onEndReached, onColumnResize }) {
	const { tokens: t } = useTheme();
	const effectiveSelectable = selectable === "range" ? "row" : selectable;
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const activeSort = sort ?? internalSort;
	const [internalSelectedRows, setInternalSelectedRows] = React.useState([]);
	const selectedRowIds = selected ?? internalSelectedRows;
	const selectedSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
	const [activeCell, setActiveCell] = React.useState(null);
	const [focusedCellKey, setFocusedCellKey] = React.useState(null);
	const [editingCell, setEditingCell] = React.useState(null);
	const [editingValue, setEditingValue] = React.useState("");
	const [editingError, setEditingError] = React.useState(void 0);
	const [selectEditorTarget, setSelectEditorTarget] = React.useState(null);
	const [columnWidths, setColumnWidths] = React.useState({});
	const [headerScrolled, setHeaderScrolled] = React.useState(false);
	const [bodyScrolledX, setBodyScrolledX] = React.useState(false);
	const [sortAnnouncement, setSortAnnouncement] = React.useState("");
	React.useEffect(() => {
		if (__DEV__ && selectable === "range") console.warn("DataGrid: `selectable=\"range\"` has no touch or hardware-keyboard equivalent on React Native and degrades to `\"row\"`.");
	}, [selectable]);
	const isFirstSort = React.useRef(true);
	React.useEffect(() => {
		if (isFirstSort.current) {
			isFirstSort.current = false;
			return;
		}
		if (activeSort === void 0) return;
		const column = columns.find((c) => c.key === activeSort.column);
		const message = COPY$8.sortedAnnouncement(column?.header ?? activeSort.column, activeSort.direction);
		setSortAnnouncement(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	}, [activeSort?.column, activeSort?.direction]);
	const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
	const orderedColumns = React.useMemo(() => {
		const pinnedStart = columns.filter((c) => c.pinned === "start");
		const pinnedEnd = columns.filter((c) => c.pinned === "end");
		const middle = columns.filter((c) => c.pinned !== "start" && c.pinned !== "end");
		return [
			...pinnedStart,
			...middle,
			...pinnedEnd
		];
	}, [columns]);
	const columnByKey = React.useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);
	const sortedData = React.useMemo(() => {
		if (sort !== void 0 || rowCount !== void 0 || internalSort === void 0) return data;
		return [...data].sort((a, b) => compareRows$1(a, b, internalSort.column, internalSort.direction));
	}, [
		data,
		sort,
		rowCount,
		internalSort
	]);
	const commitSort = (next) => {
		if (sort === void 0) setInternalSort(next);
		onSortChange?.(next);
	};
	const handleSort = (columnKey) => {
		const next = activeSort?.column === columnKey ? {
			column: columnKey,
			direction: activeSort.direction === "ascending" ? "descending" : "ascending"
		} : {
			column: columnKey,
			direction: "ascending"
		};
		commitSort(next);
	};
	const commitRowSelection = (next) => {
		if (selected === void 0) setInternalSelectedRows(next);
		onSelectionChange?.(next);
	};
	const toggleRow = (id) => {
		const next = new Set(selectedSet);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		commitRowSelection(Array.from(next));
	};
	const allIds = sortedData.map((row) => row.id);
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const toggleAll = () => {
		commitRowSelection(allSelected ? [] : allIds);
	};
	const selectCellTarget = (rowId, column) => {
		const next = {
			rowId,
			column
		};
		setActiveCell(next);
		onSelectionChange?.(next);
	};
	const rowName = (row) => rowHeaderColumn ? cellValue$1(row, rowHeaderColumn.key) || row.id : row.id;
	const startEdit = (row, column) => {
		if (!editable || column.editable !== true) return;
		if (onEditStart?.({
			rowId: row.id,
			column: column.key
		}) === false) return;
		if (column.editor === "checkbox") {
			commitEdit(row, column, !row[column.key]);
			return;
		}
		if (column.editor === "select") {
			setSelectEditorTarget({
				rowId: row.id,
				column: column.key
			});
			return;
		}
		setEditingCell({
			rowId: row.id,
			column: column.key
		});
		setEditingValue(cellValue$1(row, column.key));
		setEditingError(void 0);
	};
	const commitEdit = (row, column, value) => {
		const validationError = column.validate?.(value, row);
		if (validationError !== void 0) {
			setEditingError(validationError);
			if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(COPY$8.invalid(validationError));
			return;
		}
		const previous = row[column.key];
		onCellChange?.({
			rowId: row.id,
			column: column.key,
			value,
			previous
		});
		setEditingCell(null);
		setEditingError(void 0);
		setSelectEditorTarget(null);
	};
	const cancelEdit = () => {
		setEditingCell(null);
		setEditingError(void 0);
	};
	const headerBorderColor = overrides?.headerBorder ? resolveToken(t, overrides.headerBorder) : t.colorBorderStrong;
	const headerBorderWidth = overrides?.headerBorderWidth ? resolveToken(t, overrides.headerBorderWidth) : t.borderWidthThin;
	const headerShadow = overrides?.headerShadow ? resolveToken(t, overrides.headerShadow) : t.shadowRaised;
	const gridLineColor = overrides?.gridLine ? resolveToken(t, overrides.gridLine) : t.colorBorder;
	const gridLineWidth = overrides?.gridLineWidth ? resolveToken(t, overrides.gridLineWidth) : t.borderWidthThin;
	const rowHeightValue = overrides?.rowHeight ? resolveToken(t, overrides.rowHeight) : t.sizeTargetMin;
	const rowHeightComfortableValue = overrides?.rowHeightComfortable ? resolveToken(t, overrides.rowHeightComfortable) : t.sizeTargetComfortable;
	const activeRowHeight = density === "compact" ? rowHeightValue : rowHeightComfortableValue;
	const rowSelectedBorderWidth = overrides?.rowSelectedBorderWidth ? resolveToken(t, overrides.rowSelectedBorderWidth) : t.borderWidthFocus;
	const cellPaddingInline = overrides?.cellPaddingInline ? resolveToken(t, overrides.cellPaddingInline) : t.space2;
	const cellFocusRingWidth = overrides?.cellFocusRingWidth ? resolveToken(t, overrides.cellFocusRingWidth) : t.borderWidthFocus;
	const pinnedShadow = overrides?.pinnedShadow ? resolveToken(t, overrides.pinnedShadow) : t.shadowRaised;
	const resizeHandleColor = overrides?.resizeHandle ? resolveToken(t, overrides.resizeHandle) : t.colorBorderStrong;
	const resizeHandleWidth = overrides?.resizeHandleWidth ? resolveToken(t, overrides.resizeHandleWidth) : t.space1;
	const statusBarPadding = overrides?.statusBarPadding ? resolveToken(t, overrides.statusBarPadding) : t.space2;
	const fixedHeightValue = overrides?.fixedHeight ? resolveToken(t, overrides.fixedHeight) : t.space20;
	const editorFontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const editorFontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeSm;
	const editorLineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightTight;
	const numericFontFamily = overrides?.numericFont ? resolveToken(t, overrides.numericFont) : t.fontFamilyMono;
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const headerTypographyOverrides = {
		...typographyOverrides,
		fontWeight: overrides?.headerWeight,
		fontSize: overrides?.headerSize
	};
	const cellTypographyOverrides = (align) => ({
		...typographyOverrides,
		fontFamily: align === "end" ? overrides?.numericFont ?? "font.family.mono" : overrides?.fontFamily,
		fontSize: overrides?.fontSize
	});
	const widthFor = (column) => columnWidths[column.key] ?? column.width ?? column.minWidth ?? t.space20;
	const minWidthFor = (column) => column.minWidth ?? t.sizeTargetMin;
	const showEmpty = sortedData.length === 0;
	const emptyText = loading && showEmpty ? COPY$8.loading : emptyMessage ?? COPY$8.empty;
	const selectCellStyle = {
		width: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center"
	};
	const handleHeaderScroll = (event) => {
		setHeaderScrolled(event.nativeEvent.contentOffset.y > 0);
	};
	const stickyHeaderEffective = height === "content" ? stickyHeader : true;
	const renderColumnHeader = (column) => {
		const width = widthFor(column);
		const isSorted = activeSort?.column === column.key;
		const headerCellStyle = {
			width,
			paddingHorizontal: cellPaddingInline,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			borderRightWidth: gridLineWidth,
			borderRightColor: gridLineColor,
			backgroundColor: t.colorBackgroundSubtle,
			...column.pinned === "start" && bodyScrolledX ? pinnedShadow : null
		};
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: headerCellStyle,
			role: "columnheader",
			accessibilityRole: "header",
			testID: "DataGrid.columnHeader"
		}, column.sortable ? /* @__PURE__ */ React.createElement(View, {
			style: { flex: 1 },
			testID: "DataGrid.sortButton"
		}, /* @__PURE__ */ React.createElement(Button, {
			label: column.abbr ?? column.header,
			variant: "ghost",
			size: "sm",
			trailingIcon: isSorted ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorForeground
			}) : void 0,
			overrides: {
				fontWeight: overrides?.headerWeight ?? "font.weight.semibold",
				fontSize: overrides?.headerSize
			},
			onPress: () => handleSort(column.key)
		}), isSorted ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE$3 }, /* @__PURE__ */ React.createElement(Text, null, activeSort.direction === "ascending" ? COPY$8.sortAscending(column.header) : COPY$8.sortDescending(column.header))) : null) : /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			truncate: true,
			overrides: headerTypographyOverrides
		}, column.header), column.resizable ? /* @__PURE__ */ React.createElement(DataGridResizeHandle, {
			width,
			minWidth: minWidthFor(column),
			color: resizeHandleColor,
			handleWidth: resizeHandleWidth,
			label: COPY$8.resize(column.header),
			onResize: (next) => setColumnWidths((prev) => ({
				...prev,
				[column.key]: next
			})),
			onResizeEnd: (next) => onColumnResize?.({
				column: column.key,
				width: next
			})
		}) : null);
	};
	const headerRowStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		backgroundColor: t.colorBackgroundSubtle,
		borderBottomWidth: headerBorderWidth,
		borderBottomColor: headerBorderColor,
		...stickyHeaderEffective && headerScrolled ? headerShadow : null
	};
	const renderHeader = () => /* @__PURE__ */ React.createElement(View, {
		role: "rowgroup",
		testID: "DataGrid.header"
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerRowStyle,
		role: "row",
		testID: "DataGrid.headerRow"
	}, effectiveSelectable === "row" ? /* @__PURE__ */ React.createElement(View, {
		style: selectCellStyle,
		testID: "DataGrid.selectAllCell"
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$8.selectAll,
		name: "data-grid-select-all",
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : null, orderedColumns.map((column) => renderColumnHeader(column))));
	const renderEditor = (row, column) => {
		const editorStyle = {
			minHeight: t.sizeTargetMin,
			color: t.colorForeground,
			fontFamily: column.editor === "number" ? numericFontFamily : editorFontFamily,
			fontSize: editorFontSize,
			lineHeight: toLineHeight(editorFontSize, editorLineHeightMultiplier),
			paddingVertical: t.space1
		};
		const handleKeyPress = (event) => {
			if (event.nativeEvent.key === "Enter") commitEdit(row, column, editingValue);
			else if (event.nativeEvent.key === "Escape") cancelEdit();
		};
		return /* @__PURE__ */ React.createElement(TextInput, {
			autoFocus: true,
			value: editingValue,
			onChangeText: setEditingValue,
			onKeyPress: handleKeyPress,
			onBlur: () => commitEdit(row, column, editingValue),
			keyboardType: column.editor === "number" ? "numeric" : "default",
			accessibilityLabel: COPY$8.editing(column.header),
			accessibilityHint: editingError,
			style: editorStyle,
			testID: "DataGrid.editor"
		});
	};
	const renderBodyCell = (row, column) => {
		const width = widthFor(column);
		const isHeaderCell = column.isRowHeader === true;
		const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
		const cellKey = `${row.id}:${column.key}`;
		const isFocused = focusedCellKey === cellKey;
		const isCellSelected = effectiveSelectable === "cell" && activeCell?.rowId === row.id && activeCell.column === column.key;
		const hasError = isEditingThis && editingError !== void 0;
		const canEdit = editable && column.editable === true;
		const isCheckboxEditor = canEdit && column.editor === "checkbox";
		const cellOuterStyle = {
			width,
			paddingHorizontal: cellPaddingInline,
			justifyContent: "center",
			borderRightWidth: gridLineWidth,
			borderRightColor: gridLineColor,
			backgroundColor: hasError ? t.colorStatusDangerBackground : isEditingThis ? t.colorControlBackground : isCellSelected ? t.colorBackgroundSubtle : "transparent",
			borderWidth: isFocused ? cellFocusRingWidth : hasError ? gridLineWidth : 0,
			borderColor: isFocused ? t.colorBorderFocus : hasError ? t.colorBorderDanger : "transparent",
			...column.pinned === "start" && bodyScrolledX ? pinnedShadow : null
		};
		let content;
		if (isEditingThis) content = renderEditor(row, column);
		else if (isCheckboxEditor) content = /* @__PURE__ */ React.createElement(Checkbox, {
			label: `${column.header}: ${row[column.key] ? "checked" : "unchecked"}`,
			name: `data-grid-${row.id}-${column.key}`,
			checked: Boolean(row[column.key]),
			onChange: (next) => commitEdit(row, column, next)
		});
		else if (column.render) content = column.render(row);
		else content = /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			align: column.align ?? "start",
			truncate: true,
			overrides: cellTypographyOverrides(column.align)
		}, cellValue$1(row, column.key));
		const testId = isHeaderCell ? "DataGrid.rowHeader" : "DataGrid.cell";
		const role = isHeaderCell ? "rowheader" : "cell";
		if (isEditingThis || isCheckboxEditor) return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: cellOuterStyle,
			role,
			testID: testId
		}, content);
		return /* @__PURE__ */ React.createElement(Pressable, {
			key: column.key,
			style: cellOuterStyle,
			onPress: () => {
				if (canEdit) startEdit(row, column);
				else if (effectiveSelectable === "cell") selectCellTarget(row.id, column.key);
			},
			onFocus: () => setFocusedCellKey(cellKey),
			onBlur: () => setFocusedCellKey((prev) => prev === cellKey ? null : prev),
			accessibilityLabel: `${column.header}: ${cellValue$1(row, column.key)}`,
			accessibilityHint: canEdit ? "double tap to edit" : void 0,
			accessibilityState: isCellSelected ? { selected: true } : void 0,
			role,
			testID: testId
		}, content);
	};
	const renderRow = ({ item: row }) => {
		const isRowSelected = effectiveSelectable === "row" && selectedSet.has(row.id);
		const rowStyle = {
			flexDirection: "row",
			alignItems: "stretch",
			minHeight: activeRowHeight,
			borderBottomWidth: gridLineWidth,
			borderBottomColor: gridLineColor,
			backgroundColor: isRowSelected ? t.colorBackgroundSubtle : t.colorBackground,
			borderLeftWidth: isRowSelected ? rowSelectedBorderWidth : 0,
			borderLeftColor: isRowSelected ? t.colorControlSelectedBackground : "transparent"
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: rowStyle,
			role: "row",
			accessibilityState: effectiveSelectable !== "none" ? { selected: isRowSelected } : void 0,
			testID: "DataGrid.row"
		}, effectiveSelectable === "row" ? /* @__PURE__ */ React.createElement(View, {
			style: selectCellStyle,
			testID: "DataGrid.selectCell"
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$8.selectRow(rowName(row)),
			name: `data-grid-row-${row.id}`,
			checked: isRowSelected,
			onChange: () => toggleRow(row.id)
		})) : null, orderedColumns.map((column) => renderBodyCell(row, column)));
	};
	const getItemLayout = (_listData, index) => ({
		length: activeRowHeight,
		offset: activeRowHeight * index,
		index
	});
	const handleEndReached = () => {
		if (rowCount === void 0 || rowCount <= sortedData.length) return;
		const start = sortedData.length;
		const end = Math.min(rowCount, start + DEFAULT_PAGE_SIZE);
		onEndReached?.({
			start,
			end
		});
	};
	const containerHeightStyle = height === "fixed" ? { height: fixedHeightValue } : height === "viewport" ? { flex: 1 } : {};
	const totalContentWidth = orderedColumns.reduce((sum, column) => sum + widthFor(column), 0) + (effectiveSelectable === "row" ? t.sizeTargetComfortable : 0);
	const grid = /* @__PURE__ */ React.createElement(FlatList, {
		data: sortedData,
		keyExtractor: (row) => row.id,
		renderItem: renderRow,
		ListHeaderComponent: renderHeader,
		stickyHeaderIndices: stickyHeaderEffective ? [0] : void 0,
		getItemLayout,
		onScroll: handleHeaderScroll,
		scrollEventThrottle: 16,
		scrollEnabled: height !== "content",
		style: height === "content" ? void 0 : { flex: 1 },
		onEndReached: rowCount !== void 0 ? handleEndReached : void 0,
		onEndReachedThreshold: .5,
		accessibilityState: { busy: loading },
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			style: { padding: cellPaddingInline },
			accessible: true,
			accessibilityLabel: emptyText,
			testID: "DataGrid.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, emptyText)),
		testID: "DataGrid.grid"
	});
	const scrollRegion = /* @__PURE__ */ React.createElement(ScrollView, {
		horizontal: true,
		showsHorizontalScrollIndicator: true,
		onScroll: (event) => setBodyScrolledX(event.nativeEvent.contentOffset.x > 0),
		scrollEventThrottle: 16,
		contentContainerStyle: {
			minWidth: totalContentWidth,
			flexGrow: 1
		},
		accessibilityLabel: caption,
		accessibilityHint: COPY$8.scrollHint,
		accessibilityState: { busy: loading },
		role: "grid",
		testID: "DataGrid.scrollRegion"
	}, /* @__PURE__ */ React.createElement(View, { style: [{ flex: 1 }, containerHeightStyle] }, grid));
	let statusText;
	if (loading) statusText = COPY$8.loading;
	else if (editingError !== void 0) statusText = COPY$8.invalid(editingError);
	else if (editingCell !== null) statusText = COPY$8.editing(columnByKey.get(editingCell.column)?.header ?? editingCell.column);
	else if (effectiveSelectable === "row" && selectedRowIds.length > 0) statusText = COPY$8.selectedRows(selectedRowIds.length, sortedData.length);
	else if (effectiveSelectable === "cell" && activeCell !== null) {
		const activeRowIndex = sortedData.findIndex((row) => row.id === activeCell.rowId);
		const activeColumn = columnByKey.get(activeCell.column);
		statusText = COPY$8.position(activeRowIndex + 1, activeColumn?.header ?? activeCell.column);
	} else statusText = COPY$8.rowCount(rowCount ?? sortedData.length);
	const selectEditorRow = selectEditorTarget ? sortedData.find((row) => row.id === selectEditorTarget.rowId) ?? null : null;
	const selectEditorColumn = selectEditorTarget ? columnByKey.get(selectEditorTarget.column) ?? null : null;
	return /* @__PURE__ */ React.createElement(View, { testID: "DataGrid" }, !hideCaption ? /* @__PURE__ */ React.createElement(View, { testID: "DataGrid.caption" }, /* @__PURE__ */ React.createElement(Heading, {
		level: "2",
		overrides: {
			fontSize: overrides?.captionSize,
			fontWeight: overrides?.captionWeight,
			marginBlockEnd: overrides?.captionGap ?? "space.2"
		}
	}, caption)) : null, /* @__PURE__ */ React.createElement(View, {
		style: containerHeightStyle,
		testID: "DataGrid.container"
	}, scrollRegion), /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$3
	}, /* @__PURE__ */ React.createElement(Text, null, sortAnnouncement)), showStatusBar ? /* @__PURE__ */ React.createElement(View, {
		style: {
			paddingHorizontal: statusBarPadding,
			paddingVertical: statusBarPadding,
			backgroundColor: t.colorBackgroundSubtle
		},
		role: "status",
		accessibilityLiveRegion: "polite",
		testID: "DataGrid.statusBar"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.statusBarSize
		}
	}, statusText)) : null, /* @__PURE__ */ React.createElement(BottomSheet, {
		open: selectEditorTarget !== null,
		heading: selectEditorColumn?.header ?? "",
		onClose: () => setSelectEditorTarget(null)
	}, selectEditorColumn && selectEditorRow ? /* @__PURE__ */ React.createElement(Listbox, {
		label: selectEditorColumn.header,
		options: (selectEditorColumn.options ?? []).map((option) => ({
			value: option.value,
			label: option.label
		})),
		value: cellValue$1(selectEditorRow, selectEditorColumn.key),
		onChange: (value) => commitEdit(selectEditorRow, selectEditorColumn, value)
	}) : null));
}
//#endregion
//#region src/TreeGrid.tsx
const COPY$7 = {
	expand: (rowName) => `Expand ${rowName}`,
	collapse: (rowName) => `Collapse ${rowName}`,
	level: (level) => `Level ${level}`,
	childCount: (count) => `${count} items`,
	loading: "Loading",
	expandAll: "Expand all",
	collapseAll: "Collapse all",
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedRows: (count, total) => `${count} of ${total} rows selected`,
	editing: (column) => `Editing ${column}. Enter to save, Escape to cancel.`,
	invalid: (message) => message,
	rowCount: (count) => `${count} rows`,
	position: (row, column) => `Row ${row}, ${column}`,
	resize: (column) => `Resize ${column}`,
	empty: "Nothing to show.",
	scrollHint: "Scroll sideways to see more columns"
};
const HIDDEN_STYLE$2 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
function cellValue(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function compareRows(a, b, column, direction) {
	const factor = direction === "ascending" ? 1 : -1;
	const av = a[column];
	const bv = b[column];
	if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv, void 0, { numeric: true }) * factor;
	const an = Number(av);
	const bn = Number(bv);
	if (Number.isNaN(an) || Number.isNaN(bn)) return 0;
	return (an - bn) * factor;
}
function sortTree(rows, sort) {
	return [...rows].sort((a, b) => compareRows(a, b, sort.column, sort.direction)).map((row) => Array.isArray(row.children) ? {
		...row,
		children: sortTree(row.children, sort)
	} : row);
}
function rowHasChildren(row) {
	return row.children === "lazy" || Array.isArray(row.children) && row.children.length > 0;
}
function flattenTree(rows, expandedSet, level) {
	const out = [];
	for (const row of rows) {
		const hasChildren = rowHasChildren(row);
		out.push({
			key: row.id,
			level,
			hasChildren,
			row
		});
		if (hasChildren && expandedSet.has(row.id)) {
			if (row.children === "lazy") out.push({
				key: `${row.id}::loading`,
				level: level + 1,
				hasChildren: false,
				loading: true
			});
			else if (Array.isArray(row.children)) out.push(...flattenTree(row.children, expandedSet, level + 1));
		}
	}
	return out;
}
/** Every row that has loaded (array) children, at any depth — used for `["*"]` and expand-all. */
function collectExpandableIds(rows) {
	const ids = [];
	for (const row of rows) if (Array.isArray(row.children) && row.children.length > 0) {
		ids.push(row.id);
		ids.push(...collectExpandableIds(row.children));
	}
	return ids;
}
/** Every loaded row id at any depth — used by select-all. */
function collectAllLoadedIds(rows) {
	const ids = [];
	for (const row of rows) {
		ids.push(row.id);
		if (Array.isArray(row.children)) ids.push(...collectAllLoadedIds(row.children));
	}
	return ids;
}
function collectLoadedDescendantIds$1(row) {
	if (!Array.isArray(row.children)) return [];
	const ids = [];
	for (const child of row.children) {
		ids.push(child.id);
		ids.push(...collectLoadedDescendantIds$1(child));
	}
	return ids;
}
function computeRowCheckState(row, selectedSet) {
	const descendantIds = collectLoadedDescendantIds$1(row);
	if (descendantIds.length === 0) return selectedSet.has(row.id) ? "checked" : "unchecked";
	if (descendantIds.every((id) => selectedSet.has(id))) return "checked";
	if (descendantIds.every((id) => !selectedSet.has(id))) return selectedSet.has(row.id) ? "checked" : "unchecked";
	return "indeterminate";
}
/** The row header's expand control, rotating a chevron over `transition`, skipped under reduced motion. */
function TreeGridChevron({ expanded, color, duration, easing }) {
	const reducedMotion = useReducedMotion();
	const rotate = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = expanded ? 1 : 0;
		if (reducedMotion) {
			rotate.setValue(toValue);
			return;
		}
		Animated.timing(rotate, {
			toValue,
			duration,
			easing: toEasing(easing),
			useNativeDriver: false
		}).start();
	}, [
		expanded,
		reducedMotion,
		rotate,
		duration,
		easing
	]);
	const style = { transform: [{ rotate: rotate.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "90deg"]
	}) }] };
	return /* @__PURE__ */ React.createElement(Animated.View, { style }, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-right",
		size: "sm",
		color
	}));
}
/** The draggable edge of a resizable column header, built on core `PanResponder` (the package permits no gesture-handler dependency). */
function TreeGridResizeHandle({ width, minWidth, color, handleWidth, label, onResize, onResizeEnd }) {
	const widthRef = React.useRef(width);
	widthRef.current = width;
	const startWidthRef = React.useRef(width);
	const responder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderGrant: () => {
			startWidthRef.current = widthRef.current;
		},
		onPanResponderMove: (_event, gesture) => {
			onResize(Math.max(minWidth, startWidthRef.current + gesture.dx));
		},
		onPanResponderRelease: () => onResizeEnd(widthRef.current),
		onPanResponderTerminate: () => onResizeEnd(widthRef.current)
	})).current;
	return /* @__PURE__ */ React.createElement(View, {
		...responder.panHandlers,
		role: "separator",
		accessibilityRole: "adjustable",
		accessibilityLabel: label,
		style: {
			width: handleWidth,
			alignSelf: "stretch",
			backgroundColor: color
		},
		testID: "TreeGrid.resizeHandle"
	});
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
function TreeGrid({ caption, hideCaption = false, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable = "none", selected, defaultSelected, selectChildren = false, editable = false, density = "compact", stickyHeader = true, height = "viewport", loading = false, emptyMessage, showStatusBar = true, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize }) {
	const { tokens: t } = useTheme();
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const activeSort = sort ?? internalSort;
	const sortedData = React.useMemo(() => {
		if (sort !== void 0 || internalSort === void 0) return data;
		return sortTree(data, internalSort);
	}, [
		data,
		sort,
		internalSort
	]);
	const commitSort = (next) => {
		if (sort === void 0) setInternalSort(next);
		onSortChange?.(next);
	};
	const handleSort = (columnKey) => {
		const next = activeSort?.column === columnKey ? {
			column: columnKey,
			direction: activeSort.direction === "ascending" ? "descending" : "ascending"
		} : {
			column: columnKey,
			direction: "ascending"
		};
		commitSort(next);
	};
	const [sortAnnouncement, setSortAnnouncement] = React.useState("");
	const columnByKey = React.useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);
	const isFirstSort = React.useRef(true);
	React.useEffect(() => {
		if (isFirstSort.current) {
			isFirstSort.current = false;
			return;
		}
		if (activeSort === void 0) return;
		setSortAnnouncement(COPY$7.sortedAnnouncement(columnByKey.get(activeSort.column)?.header ?? activeSort.column, activeSort.direction));
	}, [activeSort?.column, activeSort?.direction]);
	const [internalExpanded, setInternalExpanded] = React.useState(() => defaultExpanded?.includes("*") ? collectExpandableIds(data) : defaultExpanded ?? []);
	const expandedIds = expanded ?? internalExpanded;
	const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);
	const commitExpanded = (next) => {
		if (expanded === void 0) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (row) => {
		const isExpanded = expandedSet.has(row.id);
		if (!isExpanded && row.children === "lazy") onExpand?.(row.id);
		commitExpanded(isExpanded ? expandedIds.filter((id) => id !== row.id) : [...expandedIds, row.id]);
	};
	const effectiveSelectable = selectable;
	const [internalSelectedRows, setInternalSelectedRows] = React.useState(defaultSelected ?? []);
	const selectedRowIds = selected ?? internalSelectedRows;
	const selectedSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
	const [activeCell, setActiveCell] = React.useState(null);
	const [focusedCellKey, setFocusedCellKey] = React.useState(null);
	const commitRowSelection = (next) => {
		if (selected === void 0) setInternalSelectedRows(next);
		onSelectionChange?.(next);
	};
	const toggleRow = (row) => {
		if (selectChildren) {
			const ids = [row.id, ...collectLoadedDescendantIds$1(row)];
			const checked = computeRowCheckState(row, selectedSet) === "checked";
			const next = new Set(selectedSet);
			ids.forEach((id) => checked ? next.delete(id) : next.add(id));
			commitRowSelection(Array.from(next));
			return;
		}
		const next = new Set(selectedSet);
		if (next.has(row.id)) next.delete(row.id);
		else next.add(row.id);
		commitRowSelection(Array.from(next));
	};
	const allLoadedIds = React.useMemo(() => collectAllLoadedIds(sortedData), [sortedData]);
	const allSelected = allLoadedIds.length > 0 && allLoadedIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allLoadedIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitRowSelection(allSelected ? [] : allLoadedIds);
	const selectCellTarget = (rowId, column) => {
		const next = {
			rowId,
			column
		};
		setActiveCell(next);
		onSelectionChange?.(next);
	};
	const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
	const rowName = (row) => rowHeaderColumn ? cellValue(row, rowHeaderColumn.key) || row.id : row.id;
	const [editingCell, setEditingCell] = React.useState(null);
	const [editingValue, setEditingValue] = React.useState("");
	const [editingError, setEditingError] = React.useState(void 0);
	const [selectEditorTarget, setSelectEditorTarget] = React.useState(null);
	const startEdit = (row, column) => {
		if (!editable || column.editable !== true) return;
		if (onEditStart?.({
			rowId: row.id,
			column: column.key
		}) === false) return;
		if (column.editor === "checkbox") {
			commitEdit(row, column, !row[column.key]);
			return;
		}
		if (column.editor === "select") {
			setSelectEditorTarget({
				rowId: row.id,
				column: column.key
			});
			return;
		}
		setEditingCell({
			rowId: row.id,
			column: column.key
		});
		setEditingValue(cellValue(row, column.key));
		setEditingError(void 0);
	};
	const commitEdit = (row, column, value) => {
		const validationError = column.validate?.(value, row);
		if (validationError !== void 0) {
			setEditingError(validationError);
			return;
		}
		const previous = row[column.key];
		onCellChange?.({
			rowId: row.id,
			column: column.key,
			value,
			previous
		});
		setEditingCell(null);
		setEditingError(void 0);
		setSelectEditorTarget(null);
	};
	const cancelEdit = () => {
		setEditingCell(null);
		setEditingError(void 0);
	};
	const gridLineColor = t.colorBorder;
	const gridLineWidth = t.borderWidthThin;
	const headerBorderColor = t.colorBorderStrong;
	const headerBorderWidth = t.borderWidthThin;
	const cellPaddingInline = t.space2;
	const cellFocusRingWidth = t.borderWidthFocus;
	const rowHeightValue = t.sizeTargetMin;
	const rowHeightComfortableValue = t.sizeTargetComfortable;
	const activeRowHeight = density === "compact" ? rowHeightValue : rowHeightComfortableValue;
	const fixedHeightValue = t.space20;
	const indentSize = overrides?.indent ? resolveToken(t, overrides.indent) : t.space5;
	const expandButtonSize = overrides?.expandButtonSize ? resolveToken(t, overrides.expandButtonSize) : t.sizeTargetMin;
	const expandGap = overrides?.expandGap ? resolveToken(t, overrides.expandGap) : t.layoutGapTight;
	const guideLineColor = overrides?.guideLine ? resolveToken(t, overrides.guideLine) : t.colorBorder;
	const guideLineWidth = overrides?.guideLineWidth ? resolveToken(t, overrides.guideLineWidth) : t.borderWidthThin;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const parentWeightRef = overrides?.parentWeight ?? "font.weight.medium";
	const widthFor = (column) => columnWidths[column.key] ?? column.width ?? column.minWidth ?? t.space20;
	const minWidthFor = (column) => column.minWidth ?? t.sizeTargetMin;
	const [columnWidths, setColumnWidths] = React.useState({});
	const orderedColumns = React.useMemo(() => {
		const pinnedStart = columns.filter((c) => c.pinned === "start");
		const pinnedEnd = columns.filter((c) => c.pinned === "end");
		const middle = columns.filter((c) => c.pinned !== "start" && c.pinned !== "end");
		return [
			...pinnedStart,
			...middle,
			...pinnedEnd
		];
	}, [columns]);
	const flatRows = React.useMemo(() => flattenTree(sortedData, expandedSet, 1), [sortedData, expandedSet]);
	const visibleRowCount = flatRows.filter((r) => !r.loading).length;
	const selectCellStyle = {
		width: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center"
	};
	const showEmpty = flatRows.length === 0;
	const emptyText = loading && showEmpty ? COPY$7.loading : emptyMessage ?? COPY$7.empty;
	const stickyHeaderEffective = height === "content" ? stickyHeader : true;
	const renderColumnHeader = (column) => {
		const width = widthFor(column);
		const isSorted = activeSort?.column === column.key;
		const headerCellStyle = {
			width,
			paddingHorizontal: cellPaddingInline,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			borderRightWidth: gridLineWidth,
			borderRightColor: gridLineColor,
			backgroundColor: t.colorBackgroundSubtle
		};
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: headerCellStyle,
			role: "columnheader",
			accessibilityRole: "header",
			testID: "TreeGrid.columnHeader"
		}, column.sortable ? /* @__PURE__ */ React.createElement(View, {
			style: { flex: 1 },
			testID: "TreeGrid.sortButton"
		}, /* @__PURE__ */ React.createElement(Button, {
			label: column.abbr ?? column.header,
			variant: "ghost",
			size: "sm",
			trailingIcon: isSorted ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorForeground
			}) : void 0,
			onPress: () => handleSort(column.key)
		}), isSorted ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE$2 }, /* @__PURE__ */ React.createElement(Text, null, activeSort.direction === "ascending" ? COPY$7.sortAscending(column.header) : COPY$7.sortDescending(column.header))) : null) : /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			truncate: true
		}, column.header), column.resizable ? /* @__PURE__ */ React.createElement(TreeGridResizeHandle, {
			width,
			minWidth: minWidthFor(column),
			color: t.colorBorderStrong,
			handleWidth: t.space1,
			label: COPY$7.resize(column.header),
			onResize: (next) => setColumnWidths((prev) => ({
				...prev,
				[column.key]: next
			})),
			onResizeEnd: (next) => onColumnResize?.({
				column: column.key,
				width: next
			})
		}) : null);
	};
	const headerRowStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		backgroundColor: t.colorBackgroundSubtle,
		borderBottomWidth: headerBorderWidth,
		borderBottomColor: headerBorderColor
	};
	const renderHeader = () => /* @__PURE__ */ React.createElement(View, {
		role: "rowgroup",
		testID: "TreeGrid.header"
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerRowStyle,
		role: "row",
		testID: "TreeGrid.headerRow"
	}, effectiveSelectable === "row" ? /* @__PURE__ */ React.createElement(View, {
		style: selectCellStyle,
		testID: "TreeGrid.selectAllCell"
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$7.selectAll,
		name: "tree-grid-select-all",
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : null, orderedColumns.map((column) => renderColumnHeader(column))));
	const renderEditor = (row, column) => {
		const editorStyle = {
			minHeight: t.sizeTargetMin,
			color: t.colorForeground,
			fontFamily: column.editor === "number" ? t.fontFamilyMono : t.fontFamilyBody,
			fontSize: t.fontSizeSm,
			lineHeight: toLineHeight(t.fontSizeSm, t.fontLineHeightTight),
			paddingVertical: t.space1
		};
		const handleKeyPress = (event) => {
			if (event.nativeEvent.key === "Enter") commitEdit(row, column, editingValue);
			else if (event.nativeEvent.key === "Escape") cancelEdit();
		};
		return /* @__PURE__ */ React.createElement(TextInput, {
			autoFocus: true,
			value: editingValue,
			onChangeText: setEditingValue,
			onKeyPress: handleKeyPress,
			onBlur: () => commitEdit(row, column, editingValue),
			keyboardType: column.editor === "number" ? "numeric" : "default",
			accessibilityLabel: COPY$7.editing(column.header),
			accessibilityHint: editingError,
			style: editorStyle,
			testID: "TreeGrid.editor"
		});
	};
	const renderDataCell = (flatRow, column) => {
		const row = flatRow.row;
		const width = widthFor(column);
		const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
		const cellKey = `${row.id}:${column.key}`;
		const isFocused = focusedCellKey === cellKey;
		const isCellSelected = effectiveSelectable === "cell" && activeCell?.rowId === row.id && activeCell.column === column.key;
		const hasError = isEditingThis && editingError !== void 0;
		const canEdit = editable && column.editable === true;
		const isCheckboxEditor = canEdit && column.editor === "checkbox";
		const cellOuterStyle = {
			width,
			paddingHorizontal: cellPaddingInline,
			justifyContent: "center",
			borderRightWidth: gridLineWidth,
			borderRightColor: gridLineColor,
			backgroundColor: hasError ? t.colorStatusDangerBackground : isEditingThis ? t.colorControlBackground : isCellSelected ? t.colorBackgroundSubtle : "transparent",
			borderWidth: isFocused ? cellFocusRingWidth : hasError ? gridLineWidth : 0,
			borderColor: isFocused ? t.colorBorderFocus : hasError ? t.colorBorderDanger : "transparent"
		};
		let content;
		if (isEditingThis) content = renderEditor(row, column);
		else if (isCheckboxEditor) content = /* @__PURE__ */ React.createElement(Checkbox, {
			label: `${column.header}: ${row[column.key] ? "checked" : "unchecked"}`,
			name: `tree-grid-${row.id}-${column.key}`,
			checked: Boolean(row[column.key]),
			onChange: (next) => commitEdit(row, column, next)
		});
		else if (column.render) content = column.render(row);
		else content = /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			align: column.align ?? "start",
			truncate: true
		}, cellValue(row, column.key));
		if (isEditingThis || isCheckboxEditor) return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: cellOuterStyle,
			role: "cell",
			testID: "TreeGrid.cell"
		}, content);
		return /* @__PURE__ */ React.createElement(Pressable, {
			key: column.key,
			style: cellOuterStyle,
			onPress: () => {
				if (canEdit) startEdit(row, column);
				else if (effectiveSelectable === "cell") selectCellTarget(row.id, column.key);
			},
			onFocus: () => setFocusedCellKey(cellKey),
			onBlur: () => setFocusedCellKey((prev) => prev === cellKey ? null : prev),
			accessibilityLabel: `${column.header}: ${cellValue(row, column.key)}`,
			accessibilityHint: canEdit ? "double tap to edit" : void 0,
			accessibilityState: isCellSelected ? { selected: true } : void 0,
			role: "cell",
			testID: "TreeGrid.cell"
		}, content);
	};
	const renderGuideLines = (level) => Array.from({ length: level - 1 }, (_, index) => /* @__PURE__ */ React.createElement(View, {
		key: index,
		style: {
			width: indentSize,
			alignSelf: "stretch",
			alignItems: "center"
		},
		testID: "TreeGrid.indent"
	}, /* @__PURE__ */ React.createElement(View, { style: {
		width: guideLineWidth,
		flex: 1,
		backgroundColor: guideLineColor
	} })));
	const renderRowHeaderCell = (flatRow, column) => {
		const row = flatRow.row;
		const width = widthFor(column);
		const isExpanded = expandedSet.has(row.id);
		const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
		const canEdit = editable && column.editable === true;
		const name = rowName(row);
		const childCount = Array.isArray(row.children) ? row.children.length : void 0;
		const label = flatRow.hasChildren ? `${name}, ${COPY$7.level(flatRow.level)}${childCount !== void 0 ? `, ${COPY$7.childCount(childCount)}` : ""}` : `${name}, ${COPY$7.level(flatRow.level)}`;
		const handleAction = (event) => {
			if (event.nativeEvent.actionName === "expand" && !isExpanded) toggleExpand(row);
			else if (event.nativeEvent.actionName === "collapse" && isExpanded) toggleExpand(row);
		};
		const cellOuterStyle = {
			width,
			paddingHorizontal: cellPaddingInline,
			flexDirection: "row",
			alignItems: "center",
			borderRightWidth: gridLineWidth,
			borderRightColor: gridLineColor
		};
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			style: cellOuterStyle,
			role: "rowheader",
			accessible: true,
			accessibilityLabel: label,
			accessibilityState: flatRow.hasChildren ? { expanded: isExpanded } : void 0,
			accessibilityActions: flatRow.hasChildren ? [{
				name: "expand",
				label: COPY$7.expand(name)
			}, {
				name: "collapse",
				label: COPY$7.collapse(name)
			}] : void 0,
			onAccessibilityAction: flatRow.hasChildren ? handleAction : void 0,
			testID: "TreeGrid.rowHeader"
		}, renderGuideLines(flatRow.level), /* @__PURE__ */ React.createElement(View, {
			style: {
				width: expandButtonSize,
				alignItems: "center",
				justifyContent: "center"
			},
			testID: "TreeGrid.expandButton"
		}, flatRow.hasChildren ? /* @__PURE__ */ React.createElement(Button, {
			label: isExpanded ? COPY$7.collapse(name) : COPY$7.expand(name),
			variant: "ghost",
			size: "sm",
			iconOnly: true,
			expanded: isExpanded,
			leadingIcon: /* @__PURE__ */ React.createElement(TreeGridChevron, {
				expanded: isExpanded,
				color: t.colorForeground,
				duration: transitionDuration,
				easing: t.motionEasingStandard
			}),
			onPress: () => toggleExpand(row)
		}) : null), /* @__PURE__ */ React.createElement(View, { style: { width: expandGap } }), /* @__PURE__ */ React.createElement(View, {
			style: { flex: 1 },
			testID: "TreeGrid.cellContent"
		}, isEditingThis ? renderEditor(row, column) : canEdit ? /* @__PURE__ */ React.createElement(Pressable, {
			onPress: () => startEdit(row, column),
			accessibilityHint: "double tap to edit"
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			overrides: flatRow.hasChildren ? { fontWeight: parentWeightRef } : void 0
		}, name)) : /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			overrides: flatRow.hasChildren ? { fontWeight: parentWeightRef } : void 0
		}, name)));
	};
	const renderLoadingRow = (flatRow) => {
		const rowStyle = {
			flexDirection: "row",
			alignItems: "center",
			minHeight: activeRowHeight,
			borderBottomWidth: gridLineWidth,
			borderBottomColor: gridLineColor,
			backgroundColor: t.colorBackground,
			paddingHorizontal: cellPaddingInline
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: rowStyle,
			role: "row",
			accessibilityState: { busy: true },
			testID: "TreeGrid.row"
		}, effectiveSelectable === "row" ? /* @__PURE__ */ React.createElement(View, { style: selectCellStyle }) : null, renderGuideLines(flatRow.level), /* @__PURE__ */ React.createElement(View, { style: { width: expandButtonSize } }), /* @__PURE__ */ React.createElement(View, { style: { width: expandGap } }), /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			tone: "muted"
		}, COPY$7.loading));
	};
	const renderRow = ({ item: flatRow }) => {
		if (flatRow.loading) return renderLoadingRow(flatRow);
		const row = flatRow.row;
		const checkState = selectChildren ? computeRowCheckState(row, selectedSet) : selectedSet.has(row.id) ? "checked" : "unchecked";
		const isRowSelected = effectiveSelectable === "row" && checkState === "checked";
		const rowStyle = {
			flexDirection: "row",
			alignItems: "stretch",
			minHeight: activeRowHeight,
			borderBottomWidth: gridLineWidth,
			borderBottomColor: gridLineColor,
			backgroundColor: isRowSelected ? t.colorBackgroundSubtle : t.colorBackground
		};
		return /* @__PURE__ */ React.createElement(View, {
			style: rowStyle,
			role: "row",
			accessibilityState: effectiveSelectable !== "none" ? { selected: isRowSelected } : void 0,
			testID: "TreeGrid.row"
		}, effectiveSelectable === "row" ? /* @__PURE__ */ React.createElement(View, {
			style: selectCellStyle,
			testID: "TreeGrid.selectCell"
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$7.selectRow(rowName(row)),
			name: `tree-grid-row-${row.id}`,
			checked: checkState === "checked",
			indeterminate: checkState === "indeterminate",
			onChange: () => toggleRow(row)
		})) : null, orderedColumns.map((column) => column.isRowHeader ? renderRowHeaderCell(flatRow, column) : renderDataCell(flatRow, column)));
	};
	const getItemLayout = (_listData, index) => ({
		length: activeRowHeight,
		offset: activeRowHeight * index,
		index
	});
	const containerHeightStyle = height === "fixed" ? { height: fixedHeightValue } : height === "viewport" ? { flex: 1 } : {};
	const totalContentWidth = orderedColumns.reduce((sum, column) => sum + widthFor(column), 0) + (effectiveSelectable === "row" ? t.sizeTargetComfortable : 0);
	const grid = /* @__PURE__ */ React.createElement(FlatList, {
		data: flatRows,
		keyExtractor: (item) => item.key,
		renderItem: renderRow,
		extraData: [
			expandedIds,
			selectedRowIds,
			activeCell,
			editingCell,
			editingError,
			columnWidths,
			focusedCellKey,
			activeSort
		],
		ListHeaderComponent: renderHeader,
		stickyHeaderIndices: stickyHeaderEffective ? [0] : void 0,
		getItemLayout,
		scrollEnabled: height !== "content",
		style: height === "content" ? void 0 : { flex: 1 },
		accessibilityState: { busy: loading },
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			style: { padding: cellPaddingInline },
			accessible: true,
			accessibilityLabel: emptyText,
			testID: "TreeGrid.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, emptyText)),
		testID: "TreeGrid.grid"
	});
	const scrollRegion = /* @__PURE__ */ React.createElement(ScrollView, {
		horizontal: true,
		showsHorizontalScrollIndicator: true,
		contentContainerStyle: {
			minWidth: totalContentWidth,
			flexGrow: 1
		},
		accessibilityLabel: caption,
		accessibilityHint: COPY$7.scrollHint,
		accessibilityState: { busy: loading },
		role: "grid",
		testID: "TreeGrid.scrollRegion"
	}, /* @__PURE__ */ React.createElement(View, { style: [{ flex: 1 }, containerHeightStyle] }, grid));
	let statusText;
	if (loading) statusText = COPY$7.loading;
	else if (editingError !== void 0) statusText = COPY$7.invalid(editingError);
	else if (editingCell !== null) statusText = COPY$7.editing(columnByKey.get(editingCell.column)?.header ?? editingCell.column);
	else if (effectiveSelectable === "row" && selectedRowIds.length > 0) statusText = COPY$7.selectedRows(selectedRowIds.length, visibleRowCount);
	else if (effectiveSelectable === "cell" && activeCell !== null) {
		const activeRowIndex = flatRows.findIndex((fr) => !fr.loading && fr.row?.id === activeCell.rowId);
		const activeColumn = columnByKey.get(activeCell.column);
		statusText = COPY$7.position(activeRowIndex + 1, activeColumn?.header ?? activeCell.column);
	} else statusText = COPY$7.rowCount(visibleRowCount);
	const findRow = (rows, id) => {
		for (const row of rows) {
			if (row.id === id) return row;
			if (Array.isArray(row.children)) {
				const found = findRow(row.children, id);
				if (found !== null) return found;
			}
		}
		return null;
	};
	const selectEditorRow = selectEditorTarget ? findRow(sortedData, selectEditorTarget.rowId) : null;
	const selectEditorColumn = selectEditorTarget ? columnByKey.get(selectEditorTarget.column) ?? null : null;
	const handleRootAction = (event) => {
		if (event.nativeEvent.actionName === "expandAll") commitExpanded(collectExpandableIds(sortedData));
		else if (event.nativeEvent.actionName === "collapseAll") commitExpanded([]);
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid",
		accessibilityActions: [{
			name: "expandAll",
			label: COPY$7.expandAll
		}, {
			name: "collapseAll",
			label: COPY$7.collapseAll
		}],
		onAccessibilityAction: handleRootAction
	}, !hideCaption ? /* @__PURE__ */ React.createElement(View, { testID: "TreeGrid.caption" }, /* @__PURE__ */ React.createElement(Heading, { level: "2" }, caption)) : null, /* @__PURE__ */ React.createElement(View, {
		style: containerHeightStyle,
		testID: "TreeGrid.container"
	}, scrollRegion), /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$2
	}, /* @__PURE__ */ React.createElement(Text, null, sortAnnouncement)), showStatusBar ? /* @__PURE__ */ React.createElement(View, {
		style: {
			paddingHorizontal: t.space2,
			paddingVertical: t.space2,
			backgroundColor: t.colorBackgroundSubtle
		},
		role: "status",
		accessibilityLiveRegion: "polite",
		testID: "TreeGrid.statusBar"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted"
	}, statusText)) : null, /* @__PURE__ */ React.createElement(BottomSheet, {
		open: selectEditorTarget !== null,
		heading: selectEditorColumn?.header ?? "",
		onClose: () => setSelectEditorTarget(null)
	}, selectEditorColumn && selectEditorRow ? /* @__PURE__ */ React.createElement(Listbox, {
		label: selectEditorColumn.header,
		options: (selectEditorColumn.options ?? []).map((option) => ({
			value: option.value,
			label: option.label
		})),
		value: cellValue(selectEditorRow, selectEditorColumn.key),
		onChange: (value) => commitEdit(selectEditorRow, selectEditorColumn, value)
	}) : null));
}
//#endregion
//#region src/Tree.tsx
const COPY$6 = {
	expand: (label) => `Expand ${label}`,
	collapse: (label) => `Collapse ${label}`,
	selectedCount: (count) => `${count} selected`,
	loading: "Loading",
	empty: "Nothing here."
};
/** Visually clips content to 1x1 while keeping it in the accessibility tree, for live-region announcements. */
const HIDDEN_STYLE$1 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
function collectAllIds(nodes) {
	const ids = [];
	for (const node of nodes) {
		ids.push(node.id);
		if (node.children !== void 0 && node.children !== "lazy") ids.push(...collectAllIds(node.children));
	}
	return ids;
}
function collectLoadedDescendantIds(node) {
	if (node.children === void 0 || node.children === "lazy") return [];
	const ids = [];
	for (const child of node.children) {
		ids.push(child.id);
		ids.push(...collectLoadedDescendantIds(child));
	}
	return ids;
}
/** Flattens the tree into the visible-row list: what gets rendered, virtualized and counted. Collapsed descendants are not rendered at all. */
function flattenNodes(nodes, expandedSet, level) {
	const result = [];
	for (const node of nodes) {
		const hasChildren = node.children !== void 0 && (node.children === "lazy" || node.children.length > 0);
		const isExpanded = hasChildren && expandedSet.has(node.id);
		result.push({
			key: node.id,
			node,
			level,
			hasChildren,
			isExpanded,
			placeholder: false
		});
		if (isExpanded) {
			if (node.children === "lazy") result.push({
				key: `${node.id}::loading`,
				node: {
					id: `${node.id}::loading`,
					label: COPY$6.loading
				},
				level: level + 1,
				hasChildren: false,
				isExpanded: false,
				placeholder: true
			});
			else if (node.children !== void 0) result.push(...flattenNodes(node.children, expandedSet, level + 1));
		}
	}
	return result;
}
/** The expand/collapse control for a node row. Its own component so the chevron rotation can hold an `Animated.Value` per node. */
function TreeExpandButton({ expanded, label, transitionDuration, color, onPress }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = expanded ? 1 : 0;
		if (reducedMotion) {
			rotation.setValue(toValue);
			return;
		}
		Animated.timing(rotation, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		expanded,
		reducedMotion,
		rotation,
		transitionDuration,
		t.motionEasingStandard
	]);
	const rotate = rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "90deg"]
	});
	return /* @__PURE__ */ React.createElement(Button, {
		label,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Animated.View, { style: { transform: [{ rotate }] } }, /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-right",
			inline: true,
			color
		})),
		onPress
	});
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
function Tree({ label, showLabel = false, headingLevel = "2", nodes, expanded, defaultExpanded, selectable = "single", selected, defaultSelected, selectChildren = false, selectOnFocus = false, showGuides = true, overrides, onSelectionChange, onExpandChange, onExpand, onActivate }) {
	const { tokens: t } = useTheme();
	const indentValue = overrides?.indent ? resolveToken(t, overrides.indent) : t.space5;
	const rowHeightValue = overrides?.rowHeight ? resolveToken(t, overrides.rowHeight) : t.sizeTargetMin;
	const rowPaddingInlineValue = overrides?.rowPaddingInline ? resolveToken(t, overrides.rowPaddingInline) : t.space2;
	const rowRadiusValue = overrides?.rowRadius ? resolveToken(t, overrides.rowRadius) : t.radiusSm;
	const rowGapValue = overrides?.rowGap ? resolveToken(t, overrides.rowGap) : t.layoutGapTight;
	const rowHoverColor = overrides?.rowHover ? resolveToken(t, overrides.rowHover) : t.colorActionGhostBackgroundHover;
	const rowSelectedBorderWidthValue = overrides?.rowSelectedBorderWidth ? resolveToken(t, overrides.rowSelectedBorderWidth) : t.borderWidthFocus;
	const badgeSizeRef = overrides?.badgeSize ?? "font.size.xs";
	const labelSelectedWeightRef = overrides?.labelSelectedWeight ?? "font.weight.medium";
	const headingSizeRef = overrides?.headingSize ?? "font.size.md";
	const expandButtonSizeValue = overrides?.expandButtonSize ? resolveToken(t, overrides.expandButtonSize) : t.sizeTargetMin;
	const guideLineColor = overrides?.guideLine ? resolveToken(t, overrides.guideLine) : t.colorBorder;
	const guideLineWidthValue = overrides?.guideLineWidth ? resolveToken(t, overrides.guideLineWidth) : t.borderWidthThin;
	const checkboxGapValue = overrides?.checkboxGap ? resolveToken(t, overrides.checkboxGap) : t.layoutGapTight;
	const checkboxSizeValue = overrides?.checkboxSize ? resolveToken(t, overrides.checkboxSize) : t.space4;
	const checkboxBackgroundColor = overrides?.checkboxBackground ? resolveToken(t, overrides.checkboxBackground) : t.colorControlBackground;
	const checkboxRadiusValue = overrides?.checkboxRadius ? resolveToken(t, overrides.checkboxRadius) : t.radiusSm;
	const disabledOpacityValue = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const badgeOverrides = {
		...typographyOverrides,
		fontSize: badgeSizeRef
	};
	const effectiveRowHeight = Math.max(rowHeightValue, t.sizeTargetMin);
	const targetDeficit = Math.max(0, t.sizeTargetMin - rowHeightValue) / 2;
	const rowHitSlop = targetDeficit > 0 ? {
		top: targetDeficit,
		bottom: targetDeficit
	} : void 0;
	const [internalExpanded, setInternalExpanded] = React.useState(() => defaultExpanded?.includes("*") ? collectAllIds(nodes) : defaultExpanded ?? []);
	const expandedIds = expanded ?? internalExpanded;
	const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);
	const commitExpanded = (next) => {
		if (expanded === void 0) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (node) => {
		const isExpandedNow = expandedSet.has(node.id);
		const next = isExpandedNow ? expandedIds.filter((id) => id !== node.id) : [...expandedIds, node.id];
		commitExpanded(next);
		if (!isExpandedNow && node.children === "lazy") onExpand?.(node.id);
	};
	const nodeAccessibilityAction = (node, isExpanded) => (event) => {
		if (event.nativeEvent.actionName === "expand" && !isExpanded) toggleExpand(node);
		else if (event.nativeEvent.actionName === "collapse" && isExpanded) toggleExpand(node);
	};
	const visibleNodes = React.useMemo(() => flattenNodes(nodes, expandedSet, 1), [nodes, expandedSet]);
	const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? []);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const commitSelection = (next) => {
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
	};
	const selectSingle = (id) => commitSelection([id]);
	const toggleMultiple = (node) => {
		const next = new Set(selectedSet);
		const ids = selectChildren ? [node.id, ...collectLoadedDescendantIds(node)] : [node.id];
		const willSelect = !next.has(node.id);
		ids.forEach((id) => {
			if (willSelect) next.add(id);
			else next.delete(id);
		});
		commitSelection(Array.from(next));
	};
	const checkState = (node, hasChildren) => {
		const isSelected = selectedSet.has(node.id);
		if (!selectChildren || !hasChildren) return {
			checked: isSelected,
			indeterminate: false
		};
		const descendantIds = collectLoadedDescendantIds(node);
		if (descendantIds.length === 0) return {
			checked: isSelected,
			indeterminate: false
		};
		const selectedDescendants = descendantIds.filter((id) => selectedSet.has(id)).length;
		const allSelected = isSelected && selectedDescendants === descendantIds.length;
		return {
			checked: allSelected,
			indeterminate: !allSelected && (isSelected || selectedDescendants > 0)
		};
	};
	const isFirstSelection = React.useRef(true);
	React.useEffect(() => {
		if (selectable !== "multiple") return;
		if (isFirstSelection.current) {
			isFirstSelection.current = false;
			return;
		}
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(COPY$6.selectedCount(selectedIds.length));
	}, [selectedIds.length, selectable]);
	const [focusedId, setFocusedId] = React.useState(null);
	const handleActivate = (node) => {
		if (node.href !== void 0) Linking.openURL(node.href).catch(() => void 0);
		else onActivate?.(node.id);
	};
	const handleRowPress = (node) => {
		if (node.disabled) return;
		if (selectable === "single") selectSingle(node.id);
		handleActivate(node);
	};
	const handleMultiplePress = (node) => {
		if (node.disabled) return;
		toggleMultiple(node);
	};
	const handleMultipleLongPress = (node) => {
		if (node.disabled) return;
		handleActivate(node);
	};
	const handleRowFocus = (node) => {
		setFocusedId(node.id);
		if (selectOnFocus && selectable === "single" && !node.disabled) selectSingle(node.id);
	};
	const handleRowBlur = (id) => {
		setFocusedId((prev) => prev === id ? null : prev);
	};
	const renderIndent = (visible) => {
		const { node, level, hasChildren, isExpanded } = visible;
		const guideOffsets = showGuides ? Array.from({ length: level - 1 }, (_, i) => indentValue * i + expandButtonSizeValue / 2) : [];
		const indentContainerWidth = indentValue * (level - 1) + expandButtonSizeValue;
		return /* @__PURE__ */ React.createElement(View, {
			style: {
				width: indentContainerWidth,
				height: effectiveRowHeight,
				marginRight: rowGapValue
			},
			testID: "Tree.indent"
		}, guideOffsets.map((offset) => /* @__PURE__ */ React.createElement(View, {
			key: offset,
			style: {
				position: "absolute",
				left: offset,
				top: 0,
				bottom: 0,
				width: guideLineWidthValue,
				backgroundColor: guideLineColor
			}
		})), hasChildren ? /* @__PURE__ */ React.createElement(View, {
			style: {
				position: "absolute",
				left: indentValue * (level - 1),
				top: 0,
				bottom: 0,
				justifyContent: "center"
			},
			testID: "Tree.expandButton"
		}, /* @__PURE__ */ React.createElement(TreeExpandButton, {
			expanded: isExpanded,
			label: isExpanded ? COPY$6.collapse(node.label) : COPY$6.expand(node.label),
			transitionDuration,
			color: t.colorForegroundMuted,
			onPress: () => toggleExpand(node)
		})) : null);
	};
	const renderIcon = (node) => node.icon ? /* @__PURE__ */ React.createElement(View, {
		style: { marginRight: rowGapValue },
		testID: "Tree.icon"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: node.icon,
		inline: true,
		color: t.colorForegroundMuted
	})) : null;
	/** The drawn checkbox glyph for `multiple` mode — not the `Checkbox` component, so the row stays one hit target (a tap toggles, a long press activates). */
	const renderCheckboxGlyph = (checked, indeterminate) => {
		const filled = checked || indeterminate;
		return /* @__PURE__ */ React.createElement(View, {
			style: {
				width: checkboxSizeValue,
				height: checkboxSizeValue,
				borderRadius: checkboxRadiusValue,
				borderWidth: t.borderWidthThin,
				borderColor: t.colorControlBorder,
				backgroundColor: filled ? t.colorControlSelectedBackground : checkboxBackgroundColor,
				alignItems: "center",
				justifyContent: "center"
			},
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			testID: "Tree.checkbox"
		}, filled ? /* @__PURE__ */ React.createElement(Icon, {
			name: indeterminate ? "dash" : "check",
			size: "xs",
			color: t.colorControlSelectedForeground
		}) : null);
	};
	const renderBadge = (node) => node.badge !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: { marginLeft: rowGapValue },
		testID: "Tree.badge"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: badgeOverrides
	}, node.badge)) : null;
	const renderNode = ({ item }) => {
		if (item.placeholder) {
			const placeholderIndent = indentValue * (item.level - 1) + expandButtonSizeValue;
			return /* @__PURE__ */ React.createElement(View, {
				style: {
					flexDirection: "row",
					alignItems: "center",
					gap: rowGapValue,
					minHeight: effectiveRowHeight,
					paddingHorizontal: rowPaddingInlineValue,
					paddingLeft: placeholderIndent + rowPaddingInlineValue
				},
				accessibilityState: { busy: true },
				testID: "Tree.node"
			}, /* @__PURE__ */ React.createElement(Text, {
				size: "sm",
				tone: "muted"
			}, COPY$6.loading));
		}
		const { node, level, hasChildren, isExpanded } = item;
		const isSelected = selectable !== "none" && selectedSet.has(node.id);
		const isFocused = focusedId === node.id;
		const nodeCheckState = selectable === "multiple" ? checkState(node, hasChildren) : null;
		const accessibleLabel = `${node.label}, level ${level}`;
		const contentStyle = {
			justifyContent: "center",
			minHeight: effectiveRowHeight,
			paddingHorizontal: rowPaddingInlineValue,
			borderRadius: rowRadiusValue,
			opacity: node.disabled ? disabledOpacityValue : 1,
			borderLeftWidth: isSelected ? rowSelectedBorderWidthValue : 0,
			borderLeftColor: isSelected ? t.colorControlSelectedBackground : "transparent",
			backgroundColor: isSelected ? t.colorBackgroundStrong : "transparent"
		};
		const isMultiple = selectable === "multiple";
		return /* @__PURE__ */ React.createElement(View, {
			style: contentStyle,
			testID: "Tree.node"
		}, /* @__PURE__ */ React.createElement(Pressable, {
			onPress: () => isMultiple ? handleMultiplePress(node) : handleRowPress(node),
			onLongPress: isMultiple ? () => handleMultipleLongPress(node) : void 0,
			onFocus: () => handleRowFocus(node),
			onBlur: () => handleRowBlur(node.id),
			accessibilityRole: node.href !== void 0 ? "link" : "button",
			accessibilityLabel: accessibleLabel,
			accessibilityState: {
				disabled: node.disabled,
				selected: selectable === "single" ? isSelected : void 0,
				checked: isMultiple ? nodeCheckState?.indeterminate ? "mixed" : nodeCheckState?.checked ?? false : void 0,
				expanded: hasChildren ? isExpanded : void 0
			},
			accessibilityActions: hasChildren ? [{
				name: "expand",
				label: COPY$6.expand(node.label)
			}, {
				name: "collapse",
				label: COPY$6.collapse(node.label)
			}] : void 0,
			onAccessibilityAction: hasChildren ? nodeAccessibilityAction(node, isExpanded) : void 0,
			hitSlop: rowHitSlop,
			style: ({ pressed }) => [
				{
					flexDirection: "row",
					alignItems: "center"
				},
				pressed && !node.disabled ? { backgroundColor: rowHoverColor } : null,
				isFocused ? {
					borderWidth: t.borderWidthFocus,
					borderColor: t.colorBorderFocus,
					borderRadius: rowRadiusValue
				} : null
			],
			testID: "Tree.nodeRow"
		}, renderIndent(item), renderIcon(node), isMultiple ? /* @__PURE__ */ React.createElement(View, {
			style: { marginRight: checkboxGapValue },
			testID: "Tree.checkboxSlot"
		}, renderCheckboxGlyph(nodeCheckState?.checked ?? false, nodeCheckState?.indeterminate ?? false)) : null, /* @__PURE__ */ React.createElement(View, {
			style: { flex: 1 },
			testID: "Tree.label"
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			weight: isSelected ? "medium" : "regular",
			overrides: isSelected ? {
				...typographyOverrides,
				fontWeight: labelSelectedWeightRef
			} : typographyOverrides
		}, node.label)), renderBadge(node)));
	};
	const getItemLayout = (_data, index) => ({
		length: effectiveRowHeight,
		offset: effectiveRowHeight * index,
		index
	});
	return /* @__PURE__ */ React.createElement(View, { testID: "Tree" }, showLabel ? /* @__PURE__ */ React.createElement(Heading, {
		level: headingLevel,
		overrides: { fontSize: headingSizeRef }
	}, label) : null, /* @__PURE__ */ React.createElement(FlatList, {
		data: visibleNodes,
		keyExtractor: (item) => item.key,
		renderItem: renderNode,
		getItemLayout,
		accessibilityRole: "list",
		accessibilityLabel: label,
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			style: { padding: rowPaddingInlineValue },
			accessible: true,
			accessibilityLabel: COPY$6.empty,
			testID: "Tree.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, COPY$6.empty)),
		testID: "Tree.list"
	}), selectable === "multiple" ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$1
	}, /* @__PURE__ */ React.createElement(Text, null, COPY$6.selectedCount(selectedIds.length))) : null);
}
//#endregion
//#region src/Splitter.tsx
const COPY$5 = {
	collapse: (label) => `Collapse ${label}`,
	expand: (label) => `Expand ${label}`,
	sizeText: (percent) => `${Math.round(percent)}%`
};
/** Per-`persistKey` memory. `AsyncStorage` is not a permitted runtime dependency for
* this package (see the package's dependency rule), so persistence is in-memory only
* — it survives a remount but not an app restart. */
const persistedSizes = /* @__PURE__ */ new Map();
function clamp$1(value, min, max) {
	return Math.min(max, Math.max(min, value));
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
function Splitter({ label, orientation = "horizontal", primary, secondary, size, defaultSize = 30, minSize = 10, maxSize = 90, step = 2, collapsible = false, collapsed, persistKey, stackBelow = "prose", overrides, onSizeChange, onSizeChangeEnd, onCollapseChange }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth } = useWindowDimensions();
	const persisted = persistKey !== void 0 ? persistedSizes.get(persistKey) : void 0;
	const [internalSize, setInternalSize] = React.useState(() => clamp$1(persisted?.size ?? defaultSize, minSize, maxSize));
	const [internalCollapsed, setInternalCollapsed] = React.useState(() => persisted?.collapsed ?? false);
	const [dragging, setDragging] = React.useState(false);
	const lastSizeRef = React.useRef(persisted?.size ?? defaultSize);
	const isCollapsed = collapsed ?? internalCollapsed;
	const baseSize = clamp$1(size ?? internalSize, minSize, maxSize);
	const effectiveSize = isCollapsed ? 0 : baseSize;
	React.useEffect(() => {
		if (__DEV__ && minSize >= maxSize) console.warn(`Splitter: minSize (${minSize}) must be less than maxSize (${maxSize}).`);
	}, [minSize, maxSize]);
	const persist = (nextSize, nextCollapsed) => {
		if (persistKey !== void 0) persistedSizes.set(persistKey, {
			size: nextSize,
			collapsed: nextCollapsed
		});
	};
	const commitSize = (raw, dragActive, end) => {
		if (dragActive) skipAnimationRef.current = true;
		if (collapsible && raw < minSize) {
			if (!isCollapsed) {
				if (collapsed === void 0) setInternalCollapsed(true);
				onCollapseChange?.(true);
				persist(lastSizeRef.current, true);
			}
			onSizeChange?.(0);
			if (end) onSizeChangeEnd?.(0);
			return;
		}
		const clamped = clamp$1(raw, minSize, maxSize);
		if (isCollapsed) {
			if (collapsed === void 0) setInternalCollapsed(false);
			onCollapseChange?.(false);
		}
		if (size === void 0) setInternalSize(clamped);
		lastSizeRef.current = clamped;
		persist(clamped, false);
		onSizeChange?.(clamped);
		if (end) onSizeChangeEnd?.(clamped);
	};
	const toggleCollapse = () => {
		if (!collapsible) return;
		const next = !isCollapsed;
		if (collapsed === void 0) setInternalCollapsed(next);
		onCollapseChange?.(next);
		onSizeChange?.(next ? 0 : lastSizeRef.current);
		persist(lastSizeRef.current, next);
	};
	const commitSizeRef = React.useRef(commitSize);
	commitSizeRef.current = commitSize;
	const latest = React.useRef({
		baseSize,
		minSize,
		isCollapsed,
		orientation
	});
	latest.current = {
		baseSize,
		minSize,
		isCollapsed,
		orientation
	};
	const containerExtentRef = React.useRef(0);
	const handleContainerLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		containerExtentRef.current = orientation === "horizontal" ? width : height;
	};
	const dragStartRef = React.useRef(baseSize);
	const panResponder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(latest.current.orientation === "horizontal" ? gesture.dx : gesture.dy) > 2,
		onPanResponderGrant: () => {
			dragStartRef.current = latest.current.isCollapsed ? latest.current.minSize : latest.current.baseSize;
			setDragging(true);
		},
		onPanResponderMove: (_evt, gesture) => {
			const extent = containerExtentRef.current;
			if (extent <= 0) return;
			const delta = latest.current.orientation === "horizontal" ? gesture.dx : gesture.dy;
			const raw = dragStartRef.current + delta / extent * 100;
			commitSizeRef.current(raw, true, false);
		},
		onPanResponderRelease: (_evt, gesture) => {
			setDragging(false);
			const extent = containerExtentRef.current;
			const delta = latest.current.orientation === "horizontal" ? gesture.dx : gesture.dy;
			const raw = extent > 0 ? dragStartRef.current + delta / extent * 100 : dragStartRef.current;
			commitSizeRef.current(raw, true, true);
		},
		onPanResponderTerminate: () => {
			setDragging(false);
		}
	})).current;
	const handleSeparatorAction = (event) => {
		const name = event.nativeEvent.actionName;
		const current = isCollapsed ? minSize : baseSize;
		if (name === "increment") commitSize(current + step, false, true);
		else if (name === "decrement") commitSize(current - step, false, true);
		else if (name === "setMinimum") commitSize(minSize, false, true);
		else if (name === "setMaximum") commitSize(maxSize, false, true);
		else if (name === "activate" && collapsible) toggleCollapse();
	};
	const separatorSize = overrides?.separatorSize ? resolveToken(t, overrides.separatorSize) : t.space1;
	const separatorColor = overrides?.separatorColor ? resolveToken(t, overrides.separatorColor) : t.colorBorder;
	const handleSize = overrides?.handleSize ? resolveToken(t, overrides.handleSize) : t.space3;
	const gripLength = overrides?.gripLength ? resolveToken(t, overrides.gripLength) : t.space6;
	const collapseButtonOffset = overrides?.collapseButtonOffset ? resolveToken(t, overrides.collapseButtonOffset) : t.space2;
	const paneMinTarget = overrides?.paneMinTarget ? resolveToken(t, overrides.paneMinTarget) : t.sizeTargetComfortable;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const separatorActiveColor = t.colorControlSelectedBackground;
	const gripColor = t.colorBorderStrong;
	const minTarget = t.sizeTargetMin;
	const skipAnimationRef = React.useRef(false);
	const sizeAnim = React.useRef(new Animated.Value(effectiveSize)).current;
	React.useEffect(() => {
		const immediate = skipAnimationRef.current || reducedMotion;
		skipAnimationRef.current = false;
		if (immediate) {
			sizeAnim.setValue(effectiveSize);
			return;
		}
		const animation = Animated.timing(sizeAnim, {
			toValue: effectiveSize,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, [
		effectiveSize,
		reducedMotion,
		sizeAnim,
		transitionDuration,
		t.motionEasingStandard
	]);
	const stackThreshold = stackBelow === "prose" ? t.layoutMaxWidthProse : stackBelow === "content" ? t.layoutMaxWidthContent : null;
	const stacked = orientation === "horizontal" && stackThreshold !== null && windowWidth < stackThreshold;
	const containerStyle = {
		flexDirection: stacked ? "column" : orientation === "horizontal" ? "row" : "column",
		flex: 1
	};
	if (stacked) return /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter",
		style: containerStyle,
		onLayout: handleContainerLayout
	}, /* @__PURE__ */ React.createElement(View, { testID: "Splitter.primaryPane" }, primary), /* @__PURE__ */ React.createElement(View, { testID: "Splitter.secondaryPane" }, secondary));
	const primaryPaneStyle = {
		flexBasis: sizeAnim.interpolate({
			inputRange: [0, 100],
			outputRange: ["0%", "100%"]
		}),
		flexGrow: 0,
		flexShrink: 0,
		minWidth: orientation === "horizontal" && !isCollapsed ? paneMinTarget : void 0,
		minHeight: orientation === "vertical" && !isCollapsed ? paneMinTarget : void 0,
		overflow: "hidden"
	};
	const secondaryPaneStyle = { flex: 1 };
	const separatorLineStyle = orientation === "horizontal" ? {
		width: separatorSize,
		height: "100%",
		backgroundColor: dragging ? separatorActiveColor : separatorColor,
		position: "relative"
	} : {
		width: "100%",
		height: separatorSize,
		backgroundColor: dragging ? separatorActiveColor : separatorColor,
		position: "relative"
	};
	const hitAreaSize = Math.max(handleSize, minTarget);
	const hitExtra = Math.max(0, Math.ceil((hitAreaSize - separatorSize) / 2));
	const dragHitSlop = orientation === "horizontal" ? {
		left: hitExtra,
		right: hitExtra,
		top: 0,
		bottom: 0
	} : {
		top: hitExtra,
		bottom: hitExtra,
		left: 0,
		right: 0
	};
	const handleOverlayStyle = orientation === "horizontal" ? {
		position: "absolute",
		left: "50%",
		top: 0,
		bottom: 0,
		width: hitAreaSize,
		marginLeft: -(hitAreaSize / 2)
	} : {
		position: "absolute",
		top: "50%",
		left: 0,
		right: 0,
		height: hitAreaSize,
		marginTop: -(hitAreaSize / 2)
	};
	const gripStyle = orientation === "horizontal" ? {
		position: "absolute",
		left: "50%",
		top: "50%",
		width: separatorSize,
		height: gripLength,
		marginLeft: -(separatorSize / 2),
		marginTop: -(gripLength / 2),
		backgroundColor: gripColor
	} : {
		position: "absolute",
		left: "50%",
		top: "50%",
		width: gripLength,
		height: separatorSize,
		marginLeft: -(gripLength / 2),
		marginTop: -(separatorSize / 2),
		backgroundColor: gripColor
	};
	const collapseButtonPositionStyle = orientation === "horizontal" ? {
		position: "absolute",
		top: collapseButtonOffset,
		left: "50%",
		transform: [{ translateX: -(minTarget / 2) }]
	} : {
		position: "absolute",
		left: collapseButtonOffset,
		top: "50%",
		transform: [{ translateY: -(minTarget / 2) }]
	};
	const collapseIconName = orientation === "horizontal" ? isCollapsed ? "chevron-right" : "chevron-left" : isCollapsed ? "chevron-down" : "chevron-up";
	const separatorActions = [
		{
			name: "increment",
			label: "Increment"
		},
		{
			name: "decrement",
			label: "Decrement"
		},
		{
			name: "setMinimum",
			label: "Set to minimum"
		},
		{
			name: "setMaximum",
			label: "Set to maximum"
		},
		...collapsible ? [{
			name: "activate",
			label: isCollapsed ? COPY$5.expand(label) : COPY$5.collapse(label)
		}] : []
	];
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter",
		style: containerStyle,
		onLayout: handleContainerLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Splitter.primaryPane",
		style: primaryPaneStyle,
		accessibilityElementsHidden: isCollapsed,
		importantForAccessibility: isCollapsed ? "no-hide-descendants" : "auto",
		pointerEvents: isCollapsed ? "none" : "auto"
	}, primary), /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.separator",
		accessible: true,
		focusable: true,
		accessibilityRole: "adjustable",
		accessibilityLabel: label,
		accessibilityValue: {
			min: minSize,
			max: maxSize,
			now: effectiveSize,
			text: COPY$5.sizeText(effectiveSize)
		},
		accessibilityActions: separatorActions,
		onAccessibilityAction: handleSeparatorAction,
		hitSlop: dragHitSlop,
		...panResponder.panHandlers,
		style: separatorLineStyle
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.handle",
		pointerEvents: "none",
		style: handleOverlayStyle
	}), /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		style: gripStyle
	}), collapsible ? /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.collapseButton",
		style: collapseButtonPositionStyle
	}, /* @__PURE__ */ React.createElement(Button, {
		label: isCollapsed ? COPY$5.expand(label) : COPY$5.collapse(label),
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: collapseIconName,
			color: t.colorForegroundMuted
		}),
		onPress: toggleCollapse
	})) : null), /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.secondaryPane",
		style: secondaryPaneStyle
	}, secondary));
}
//#endregion
//#region src/ProgressBar.tsx
const FILL_TOKEN = {
	neutral: "colorControlSelectedBackground",
	success: "colorStatusSuccessIcon",
	danger: "colorStatusDangerIcon"
};
const COPY$4 = {
	progress: (label, value) => `${label}: ${value}`,
	complete: (label) => `${label}: complete`,
	indeterminate: (label) => `${label}: in progress`
};
const MILESTONES = [
	25,
	50,
	75
];
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function defaultFormatValue(value, min, max) {
	return `${max > min ? Math.round((value - min) / (max - min) * 100) : 0}%`;
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
function ProgressBar({ label, value, min = 0, max = 100, formatValue = defaultFormatValue, showValue = true, hideLabel = false, tone = "neutral", announce = "complete", overrides }) {
	const { tokens } = useTheme();
	const reducedMotion = useReducedMotion();
	const indeterminate = value === void 0;
	const validRange = max > min;
	React.useEffect(() => {
		if (__DEV__ && !validRange) console.warn(`ProgressBar: max (${max}) must be greater than min (${min}).`);
	}, [
		validRange,
		min,
		max
	]);
	const clamped = validRange ? clamp(!indeterminate && Number.isFinite(value) ? value : min, min, max) : min;
	const fraction = validRange ? (clamped - min) / (max - min) : 0;
	const displayedValueText = formatValue(clamped, min, max);
	const trackColor = overrides?.track ? resolveToken(tokens, overrides.track) : tokens.colorBackgroundStrong;
	const trackHeight = overrides?.trackHeight ? resolveToken(tokens, overrides.trackHeight) : tokens.space2;
	const radius = overrides?.radius ? resolveToken(tokens, overrides.radius) : tokens.radiusFull;
	const partGap = overrides?.partGap ? resolveToken(tokens, overrides.partGap) : tokens.space1;
	const transitionDuration = overrides?.transition ? resolveToken(tokens, overrides.transition) : tokens.motionDurationBase;
	const indeterminateLoopDuration = overrides?.indeterminateLoop ? resolveToken(tokens, overrides.indeterminateLoop) : tokens.motionDurationLoop;
	const fillColor = tokens[FILL_TOKEN[tone]];
	const labelTextOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight,
		lineHeight: overrides?.lineHeight
	};
	const valueTextOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.valueSize,
		lineHeight: overrides?.lineHeight
	};
	const [trackWidth, setTrackWidth] = React.useState(0);
	const fillWidth = React.useRef(new Animated.Value(0)).current;
	const laidOutWidth = React.useRef(0);
	React.useEffect(() => {
		if (indeterminate) return;
		const toValue = trackWidth * fraction;
		const resized = laidOutWidth.current !== trackWidth;
		laidOutWidth.current = trackWidth;
		if (reducedMotion || resized) {
			fillWidth.setValue(toValue);
			return;
		}
		Animated.timing(fillWidth, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(tokens.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		indeterminate,
		fraction,
		trackWidth,
		reducedMotion,
		fillWidth,
		transitionDuration,
		tokens.motionEasingStandard
	]);
	const sweepX = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		if (!indeterminate || reducedMotion || trackWidth <= 0) return;
		const sweepWidth = trackWidth / 3;
		sweepX.setValue(-sweepWidth);
		const animation = Animated.loop(Animated.timing(sweepX, {
			toValue: trackWidth,
			duration: indeterminateLoopDuration,
			easing: Easing.linear,
			useNativeDriver: false
		}));
		animation.start();
		return () => {
			animation.stop();
		};
	}, [
		indeterminate,
		reducedMotion,
		trackWidth,
		indeterminateLoopDuration,
		sweepX
	]);
	const handleTrackLayout = (event) => {
		const { width } = event.nativeEvent.layout;
		setTrackWidth((prev) => prev === width ? prev : width);
	};
	const prevIndeterminateRef = React.useRef(indeterminate);
	const prevPercentRef = React.useRef(null);
	const announcedMilestoneRef = React.useRef(0);
	const completedAnnouncedRef = React.useRef(false);
	React.useEffect(() => {
		if (announce === "none") return;
		const wasIndeterminate = prevIndeterminateRef.current;
		prevIndeterminateRef.current = indeterminate;
		if (indeterminate) {
			if (!wasIndeterminate) {
				announcedMilestoneRef.current = 0;
				completedAnnouncedRef.current = false;
				prevPercentRef.current = null;
				AccessibilityInfo.announceForAccessibility(COPY$4.indeterminate(label));
			}
			return;
		}
		const percent = Math.round(fraction * 100);
		const prevPercent = prevPercentRef.current;
		if (prevPercent !== null && percent < prevPercent) {
			announcedMilestoneRef.current = 0;
			completedAnnouncedRef.current = false;
		}
		prevPercentRef.current = percent;
		if (percent >= 100) {
			if (!completedAnnouncedRef.current) {
				completedAnnouncedRef.current = true;
				announcedMilestoneRef.current = 100;
				AccessibilityInfo.announceForAccessibility(COPY$4.complete(label));
			}
			return;
		}
		if (announce === "milestones") {
			for (const milestone of MILESTONES) if (percent >= milestone && announcedMilestoneRef.current < milestone) {
				announcedMilestoneRef.current = milestone;
				AccessibilityInfo.announceForAccessibility(COPY$4.progress(label, formatValue(clamped, min, max)));
			}
		}
	}, [
		announce,
		indeterminate,
		fraction,
		label,
		formatValue,
		clamped,
		min,
		max
	]);
	const containerStyle = {
		flexDirection: "column",
		gap: partGap
	};
	const labelRowStyle = {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline"
	};
	const trackStyle = {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: trackColor,
		overflow: "hidden"
	};
	const fillStyle = indeterminate ? reducedMotion ? {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: "100%",
		opacity: tokens.opacityDisabled
	} : {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: trackWidth / 3,
		transform: [{ translateX: sweepX }]
	} : {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: fillWidth,
		alignSelf: "flex-start"
	};
	const showValueText = showValue && !indeterminate;
	const showLabelRow = !hideLabel || showValueText;
	return /* @__PURE__ */ React.createElement(View, {
		testID: "ProgressBar",
		accessible: true,
		accessibilityRole: "progressbar",
		accessibilityLabel: label,
		accessibilityValue: indeterminate ? {
			min,
			max
		} : {
			min,
			max,
			now: clamped,
			text: displayedValueText
		},
		accessibilityState: indeterminate ? { busy: true } : void 0,
		style: containerStyle
	}, showLabelRow ? /* @__PURE__ */ React.createElement(View, { style: labelRowStyle }, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "ProgressBar.label" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		weight: "medium",
		overrides: labelTextOverrides
	}, label)), showValueText ? /* @__PURE__ */ React.createElement(View, { testID: "ProgressBar.valueText" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: valueTextOverrides
	}, displayedValueText)) : null) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "ProgressBar.track",
		style: trackStyle,
		onLayout: handleTrackLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "ProgressBar.fill",
		style: fillStyle
	})));
}
//#endregion
//#region src/Feed.tsx
const COPY$3 = {
	showNew: (count) => `Show ${count} new`,
	loading: "Loading more",
	end: "You are all caught up.",
	unread: "unread",
	position: (index, total) => `${index} of ${total}`,
	empty: "Nothing here yet."
};
/** A View clipped to a point but still exposed to assistive technology, for text that has no visible slot. */
const HIDDEN_STYLE = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
const VIEWABILITY_CONFIG = {
	itemVisiblePercentThreshold: 50,
	minimumViewTime: 1e3
};
/** Renders "3 min ago" style relative time. Falls back to the raw string when `timestamp` does not parse. */
function formatRelativeTime(timestamp, now) {
	const then = new Date(timestamp).getTime();
	if (!Number.isFinite(then)) return timestamp;
	const diffSeconds = Math.round(Math.abs(now - then) / 1e3);
	if (diffSeconds < 60) return "just now";
	const diffMinutes = Math.round(diffSeconds / 60);
	if (diffMinutes < 60) return `${diffMinutes} min ago`;
	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours} hr ago`;
	return `${Math.round(diffHours / 24)} d ago`;
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
function Feed({ label, items, hasMore = false, loading = false, newItemsCount, headingLevel = "3", endMessage, overrides, onEndReached, onShowNew, onViewableItemsChanged }) {
	const { tokens: t } = useTheme();
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNormal;
	const unreadBorderWidth = overrides?.unreadBorderWidth ? resolveToken(t, overrides.unreadBorderWidth) : t.borderWidthFocus;
	const newItemsOffset = overrides?.newItemsOffset ? resolveToken(t, overrides.newItemsOffset) : t.space3;
	const loadingInset = overrides?.loadingInset ? resolveToken(t, overrides.loadingInset) : t.layoutInsetMd;
	const endMessageInset = overrides?.endMessageInset ? resolveToken(t, overrides.endMessageInset) : t.layoutInsetMd;
	const cardOverrides = overrides?.articleInset ? {
		paddingBlock: overrides.articleInset,
		paddingInline: overrides.articleInset
	} : void 0;
	const timestampTextOverrides = overrides?.timestampSize || overrides?.fontFamily ? {
		...overrides?.timestampSize ? { fontSize: overrides.timestampSize } : {},
		...overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : {}
	} : void 0;
	const endMessageTextOverrides = overrides?.endMessageSize || overrides?.fontFamily ? {
		...overrides?.endMessageSize ? { fontSize: overrides.endMessageSize } : {},
		...overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : {}
	} : void 0;
	const newItemsButtonOverrides = overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : void 0;
	const showNewItemsButton = newItemsCount !== void 0 && newItemsCount > 0;
	const handleEndReached = () => {
		if (hasMore && !loading) onEndReached?.();
	};
	React.useEffect(() => {
		if (items.length === 0 && hasMore && !loading) onEndReached?.();
	}, []);
	const latestOnViewable = React.useRef(onViewableItemsChanged);
	React.useEffect(() => {
		latestOnViewable.current = onViewableItemsChanged;
	}, [onViewableItemsChanged]);
	const handleViewableItemsChanged = React.useRef(({ viewableItems }) => {
		for (const entry of viewableItems) if (entry.isViewable && entry.item) latestOnViewable.current?.(entry.item.id);
	}).current;
	const renderItem = React.useCallback(({ item, index }) => {
		const now = Date.now();
		const relative = formatRelativeTime(item.timestamp, now);
		const wrapperStyle = item.unread ? {
			borderStartWidth: unreadBorderWidth,
			borderStartColor: t.colorControlSelectedBackground
		} : {};
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Feed.article",
			style: wrapperStyle
		}, item.unread ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE }, /* @__PURE__ */ React.createElement(Text, { size: "xs" }, COPY$3.unread)) : null, !hasMore ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE }, /* @__PURE__ */ React.createElement(Text, { size: "xs" }, COPY$3.position(index + 1, items.length))) : null, /* @__PURE__ */ React.createElement(Card, {
			heading: item.heading,
			headingLevel,
			footer: item.actions ? /* @__PURE__ */ React.createElement(View, { testID: "Feed.articleActions" }, item.actions) : void 0,
			overrides: cardOverrides
		}, /* @__PURE__ */ React.createElement(View, {
			testID: "Feed.articleBody",
			style: { gap: t.layoutGapTight }
		}, /* @__PURE__ */ React.createElement(View, { testID: "Feed.timestamp" }, /* @__PURE__ */ React.createElement(Text, {
			size: "xs",
			tone: "muted",
			overrides: timestampTextOverrides
		}, relative)), item.content)));
	}, [
		cardOverrides,
		hasMore,
		headingLevel,
		items.length,
		t.colorControlSelectedBackground,
		t.layoutGapTight,
		timestampTextOverrides,
		unreadBorderWidth
	]);
	const footer = loading ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.loadingIndicator",
		style: {
			paddingHorizontal: loadingInset,
			paddingVertical: loadingInset
		}
	}, /* @__PURE__ */ React.createElement(ProgressBar, { label: COPY$3.loading })) : !hasMore && items.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.endMessage",
		style: {
			paddingHorizontal: endMessageInset,
			paddingVertical: endMessageInset
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: endMessageTextOverrides
	}, endMessage ?? COPY$3.end)) : void 0;
	const empty = loading ? void 0 : /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.emptyState",
		style: { padding: t.layoutInsetMd }
	}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, COPY$3.empty));
	return /* @__PURE__ */ React.createElement(View, { testID: "Feed.container" }, showNewItemsButton ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.newItemsButton",
		style: {
			alignSelf: "flex-start",
			paddingTop: newItemsOffset
		}
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$3.showNew(newItemsCount),
		variant: "secondary",
		size: "sm",
		overrides: newItemsButtonOverrides,
		onPress: onShowNew
	})) : null, /* @__PURE__ */ React.createElement(FlatList, {
		testID: "Feed",
		accessibilityRole: "list",
		accessibilityLabel: label,
		accessibilityState: { busy: loading },
		data: items,
		keyExtractor: (item) => item.id,
		renderItem,
		contentContainerStyle: { gap: itemGap },
		onEndReached: handleEndReached,
		onEndReachedThreshold: 1,
		viewabilityConfig: VIEWABILITY_CONFIG,
		onViewableItemsChanged: handleViewableItemsChanged,
		maintainVisibleContentPosition: { minIndexForVisible: 0 },
		ListFooterComponent: footer,
		ListEmptyComponent: empty
	}));
}
//#endregion
//#region src/Stepper.tsx
const COPY$2 = {
	navLabel: "Progress",
	stepOf: (n, total) => `Step ${n} of ${total}`,
	complete: "completed",
	current: "current step",
	error: "has an error",
	stepLabel: (n, stepLabelText) => `Step ${n}: ${stepLabelText}`
};
/** Resolves a step's displayed status: an explicit `status` wins, otherwise position relative to `currentIndex` decides. */
function statusFor(step, index, currentIndex) {
	if (step.status !== void 0) return step.status;
	if (currentIndex === -1) return "upcoming";
	if (index < currentIndex) return "complete";
	if (index === currentIndex) return "current";
	return "upcoming";
}
function indicatorColorsFor(status, t, indicatorBackground) {
	switch (status) {
		case "complete": return {
			background: t.colorControlSelectedBackground,
			borderColor: t.colorBorderStrong
		};
		case "current": return {
			background: indicatorBackground,
			borderColor: t.colorControlSelectedBackground
		};
		case "error": return {
			background: t.colorStatusDangerBackground,
			borderColor: t.colorStatusDangerIcon
		};
		default: return {
			background: indicatorBackground,
			borderColor: t.colorBorderStrong
		};
	}
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
function Stepper({ label, steps, current, orientation = "horizontal", navigable = "completed", compact = false, overrides, onStepSelect }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth } = useWindowDimensions();
	const currentIndex = steps.findIndex((step) => step.id === current);
	const isHorizontal = orientation === "horizontal";
	const isCompact = isHorizontal && (compact || windowWidth < t.layoutMaxWidthProse);
	const total = steps.length;
	const indicatorSize = overrides?.indicatorSize ? resolveToken(t, overrides.indicatorSize) : t.space6;
	const indicatorBackground = overrides?.indicatorBackground ? resolveToken(t, overrides.indicatorBackground) : t.colorControlBackground;
	const indicatorBorderWidth = overrides?.indicatorBorderWidth ? resolveToken(t, overrides.indicatorBorderWidth) : t.borderWidthFocus;
	const indicatorFontSize = overrides?.indicatorFontSize ? resolveToken(t, overrides.indicatorFontSize) : t.fontSizeSm;
	const indicatorFontWeight = overrides?.indicatorFontWeight ? resolveToken(t, overrides.indicatorFontWeight) : t.fontWeightSemibold;
	const connectorColor = overrides?.connector ? resolveToken(t, overrides.connector) : t.colorBorder;
	const connectorWidth = overrides?.connectorWidth ? resolveToken(t, overrides.connectorWidth) : t.borderWidthFocus;
	const stepHoverColor = overrides?.stepHover ? resolveToken(t, overrides.stepHover) : t.colorActionGhostBackgroundHover;
	const stepRadius = overrides?.stepRadius ? resolveToken(t, overrides.stepRadius) : t.radiusSm;
	const stepGap = overrides?.stepGap ? resolveToken(t, overrides.stepGap) : t.layoutGapNormal;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space2;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const styleTokens = {
		indicatorSize,
		indicatorBackground,
		indicatorBorderWidth,
		indicatorFontSize,
		indicatorFontSizeRef: overrides?.indicatorFontSize,
		indicatorFontWeight,
		stepHoverColor,
		stepRadius,
		partGap,
		fontFamily,
		fontFamilyRef: overrides?.fontFamily,
		minTarget: t.sizeTargetMin,
		focusRingColor: t.colorBorderFocus,
		focusRingWidth: t.borderWidthFocus,
		labelWeightRef: overrides?.labelWeight,
		labelCurrentWeightRef: overrides?.labelCurrentWeight,
		labelSizeRef: overrides?.labelSize,
		descriptionSizeRef: overrides?.descriptionSize
	};
	const rootStyle = isHorizontal ? {
		flexDirection: "row",
		alignItems: "flex-start"
	} : { flexDirection: "column" };
	const nodes = [];
	steps.forEach((step, index) => {
		const status = statusFor(step, index, currentIndex);
		const isCurrentPosition = step.id === current;
		const isNavigable = navigable === "all" ? true : navigable === "completed" ? index < currentIndex : false;
		nodes.push(/* @__PURE__ */ React.createElement(StepControl, {
			key: step.id,
			step,
			index,
			total,
			status,
			isCurrentPosition,
			isNavigable,
			compact: isCompact,
			isHorizontal,
			t,
			s: styleTokens,
			onSelect: (id) => onStepSelect?.(id)
		}));
		if (index < steps.length - 1) nodes.push(/* @__PURE__ */ React.createElement(Connector, {
			key: `connector-${step.id}`,
			isHorizontal,
			complete: status === "complete",
			color: connectorColor,
			completeColor: t.colorControlSelectedBackground,
			width: connectorWidth,
			gap: stepGap,
			indicatorSize,
			reducedMotion,
			transitionDuration,
			t
		}));
	});
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Stepper",
		accessibilityRole: "list",
		accessibilityLabel: label ?? COPY$2.navLabel,
		style: rootStyle
	}, nodes);
}
/** One step's indicator, label and description. Its own component so focus/press state does not re-render the whole list. */
function StepControl({ step, index, total, status, isCurrentPosition, isNavigable, compact, isHorizontal, t, s, onSelect }) {
	const [focused, setFocused] = React.useState(false);
	const colors = indicatorColorsFor(status, t, s.indicatorBackground);
	const stepNumber = index + 1;
	const stepName = COPY$2.stepLabel(stepNumber, step.label);
	const statusWord = status === "error" ? COPY$2.error : isCurrentPosition ? COPY$2.current : status === "complete" ? COPY$2.complete : void 0;
	const accessibleName = statusWord !== void 0 ? `${stepName}, ${statusWord}` : stepName;
	const indicatorStyle = {
		width: s.indicatorSize,
		height: s.indicatorSize,
		borderRadius: s.indicatorSize / 2,
		borderWidth: s.indicatorBorderWidth,
		borderColor: colors.borderColor,
		backgroundColor: colors.background,
		alignItems: "center",
		justifyContent: "center"
	};
	const numeralStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.indicatorFontSize,
		fontWeight: toFontWeight(s.indicatorFontWeight),
		color: t.colorForeground
	};
	const indicatorContent = status === "complete" ? /* @__PURE__ */ React.createElement(Icon, {
		name: "check",
		size: "sm",
		color: t.colorControlSelectedForeground,
		overrides: s.indicatorFontSizeRef ? { size: s.indicatorFontSizeRef } : void 0
	}) : status === "error" ? /* @__PURE__ */ React.createElement(Icon, {
		name: "danger",
		size: "sm",
		color: t.colorStatusDangerForeground,
		overrides: s.indicatorFontSizeRef ? { size: s.indicatorFontSizeRef } : void 0
	}) : /* @__PURE__ */ React.createElement(Text$1, {
		allowFontScaling: true,
		style: numeralStyle
	}, stepNumber);
	const showLabel = !compact || isCurrentPosition;
	const labelWeight = isCurrentPosition ? "semibold" : "medium";
	const labelWeightRef = isCurrentPosition ? s.labelCurrentWeightRef : s.labelWeightRef;
	const labelTone = status === "upcoming" ? "muted" : "default";
	const textAlign = isHorizontal ? "center" : "start";
	const textBlock = showLabel ? /* @__PURE__ */ React.createElement(View, { style: isHorizontal ? styles.textColumnHorizontal : styles.textColumnVertical }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		weight: labelWeight,
		tone: labelTone,
		align: textAlign,
		overrides: {
			fontSize: s.labelSizeRef,
			fontWeight: labelWeightRef,
			fontFamily: s.fontFamilyRef
		}
	}, step.label), compact && isCurrentPosition ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		align: textAlign,
		overrides: { fontFamily: s.fontFamilyRef }
	}, COPY$2.stepOf(stepNumber, total)) : step.description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		align: textAlign,
		overrides: {
			fontSize: s.descriptionSizeRef,
			fontFamily: s.fontFamilyRef
		}
	}, step.description) : null) : null;
	const contentStyle = isHorizontal ? {
		alignItems: "center",
		gap: s.partGap
	} : {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: s.partGap,
		flex: 1
	};
	const containerStyle = (pressed) => ({
		...contentStyle,
		minWidth: s.minTarget,
		minHeight: s.minTarget,
		borderRadius: s.stepRadius,
		backgroundColor: pressed ? s.stepHoverColor : "transparent",
		borderWidth: s.focusRingWidth,
		borderColor: focused ? s.focusRingColor : "transparent"
	});
	const indicator = /* @__PURE__ */ React.createElement(View, {
		style: indicatorStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, indicatorContent);
	if (!isNavigable) return /* @__PURE__ */ React.createElement(View, {
		testID: "Stepper.step",
		accessible: true,
		accessibilityLabel: accessibleName,
		accessibilityState: { selected: isCurrentPosition },
		style: containerStyle(false)
	}, indicator, textBlock);
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Stepper.step",
		accessibilityRole: "button",
		accessibilityLabel: accessibleName,
		accessibilityState: { selected: isCurrentPosition },
		onPress: () => onSelect(step.id),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: ({ pressed }) => containerStyle(pressed)
	}, indicator, textBlock);
}
/** The decorative line between two steps. Cross-fades to `connectorComplete` as the step before it completes. */
function Connector({ isHorizontal, complete, color, completeColor, width, gap, indicatorSize, reducedMotion, transitionDuration, t }) {
	const anim = React.useRef(new Animated.Value(complete ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = complete ? 1 : 0;
		if (reducedMotion) {
			anim.setValue(toValue);
			return;
		}
		Animated.timing(anim, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		complete,
		reducedMotion,
		transitionDuration,
		anim,
		t.motionEasingStandard
	]);
	const backgroundColor = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [color, completeColor]
	});
	const offset = indicatorSize / 2 - width / 2;
	const style = isHorizontal ? {
		width: gap,
		height: width,
		backgroundColor,
		marginTop: offset
	} : {
		width,
		height: gap,
		backgroundColor,
		marginLeft: offset
	};
	return /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Stepper.connector",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		style
	});
}
const styles = {
	textColumnHorizontal: { alignItems: "center" },
	textColumnVertical: { flex: 1 }
};
//#endregion
//#region src/Search.tsx
const COPY$1 = {
	clear: "Clear search",
	submit: "Search",
	loading: "Loading suggestions",
	suggestionsCount: (count) => `${count} suggestions available`,
	noSuggestions: "No suggestions"
};
const FONT_SIZE_TOKEN$1 = {
	md: "fontSizeMd",
	lg: "fontSizeLg"
};
const ICON_SIZE = {
	md: "sm",
	lg: "md"
};
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
function Search({ label, showLabel = false, name = "q", value, defaultValue, placeholder, action, suggestions, loading = false, landmark = true, size = "md", disabled = false, overrides, onChange, onSubmit, onClear }) {
	const { tokens: t } = useTheme();
	const inputRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
	const [open, setOpen] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const isValueControlled = value !== void 0;
	const currentValue = isValueControlled ? value : internalValue;
	const isDisabled = disabled;
	const hasSuggestions = suggestions !== void 0;
	const commitValue = (next) => {
		if (!isValueControlled) setInternalValue(next);
		onChange?.(next);
	};
	const commitSubmit = (raw) => {
		const trimmed = raw.trim();
		if (trimmed === "") return;
		onSubmit?.(trimmed);
	};
	const focusFieldA11y = () => {
		const node = inputRef.current ? findNodeHandle(inputRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
	const handleChangeText = (text) => {
		commitValue(text);
		if (hasSuggestions) setOpen(true);
	};
	const handleFocus = () => {
		setFocused(true);
		if (hasSuggestions) setOpen(true);
	};
	const handleBlur = () => {
		setFocused(false);
		setOpen(false);
	};
	const handleSubmitEditing = () => {
		commitSubmit(currentValue);
		setOpen(false);
	};
	const handleSubmitPress = () => {
		commitSubmit(currentValue);
		setOpen(false);
	};
	const handleClear = () => {
		if (isDisabled) return;
		commitValue("");
		onClear?.();
		inputRef.current?.focus();
	};
	const handleKeyPress = (event) => {
		if (event.nativeEvent.key !== "Escape") return;
		if (open) {
			setOpen(false);
			focusFieldA11y();
			return;
		}
		if (currentValue !== "") {
			commitValue("");
			onClear?.();
		}
	};
	const handleSuggestionChange = (next) => {
		const raw = Array.isArray(next) ? next[0] : next;
		if (raw === void 0) return;
		const nextValue = (suggestions?.find((suggestion) => suggestion.value === raw))?.label ?? raw;
		commitValue(nextValue);
		setOpen(false);
		commitSubmit(nextValue);
	};
	const resultCount = suggestions?.length ?? 0;
	const statusText = loading ? COPY$1.loading : resultCount === 0 ? COPY$1.noSuggestions : COPY$1.suggestionsCount(resultCount);
	React.useEffect(() => {
		if (!open || !hasSuggestions) return;
		const timeout = setTimeout(() => {
			AccessibilityInfo.announceForAccessibility(statusText);
		}, t.motionDurationBase * 2);
		return () => clearTimeout(timeout);
	}, [
		open,
		hasSuggestions,
		statusText,
		t.motionDurationBase
	]);
	React.useEffect(() => {
		if (__DEV__ && action !== void 0 && action !== "") console.warn("Search: `action` has no effect on React Native; handle `onSubmit` instead.");
	}, [action]);
	const borderFocusColor = overrides?.borderFocus ? resolveToken(t, overrides.borderFocus) : t.colorBorderFocus;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusFull;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const paddingBlock = size === "lg" ? overrides?.paddingBlockLg ? resolveToken(t, overrides.paddingBlockLg) : t.spaceMd : overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const affixGap = overrides?.affixGap ? resolveToken(t, overrides.affixGap) : t.layoutGapTight;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$1[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const suggestionsOffset = overrides?.suggestionsOffset ? resolveToken(t, overrides.suggestionsOffset) : t.space1;
	const popupSurface = overrides?.popupSurface ? resolveToken(t, overrides.popupSurface) : t.colorOverlaySurface;
	const popupBorder = overrides?.popupBorder ? resolveToken(t, overrides.popupBorder) : t.colorBorder;
	const popupRadius = overrides?.popupRadius ? resolveToken(t, overrides.popupRadius) : t.radiusMd;
	const popupShadow = overrides?.popupShadow ? resolveToken(t, overrides.popupShadow) : t.shadowOverlay;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const inset = t.borderWidthFocus - borderWidth;
	const showClear = !isDisabled && currentValue !== "";
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: affixGap,
		minHeight: t.sizeTargetComfortable,
		backgroundColor: t.colorControlBackground,
		borderWidth: activeBorderWidth,
		borderColor: focused ? borderFocusColor : t.colorBorderStrong,
		borderRadius: radius,
		paddingHorizontal: paddingInline + inset,
		paddingVertical: paddingBlock + inset
	};
	const inputTextStyle = {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: t.colorForeground
	};
	const popupOuterStyle = {
		marginTop: suggestionsOffset,
		borderWidth: t.borderWidthThin,
		borderColor: popupBorder,
		borderRadius: popupRadius,
		backgroundColor: popupSurface,
		overflow: "hidden",
		...popupShadow
	};
	const listboxOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight,
		disabledOpacity: overrides?.disabledOpacity
	};
	const labelOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const content = /* @__PURE__ */ React.createElement(View, {
		testID: "Search",
		style: containerStyle
	}, showLabel ? /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: labelOverrides
	}, label) : null, /* @__PURE__ */ React.createElement(View, {
		style: fieldRowStyle,
		testID: "Search.field"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: "search",
		size: ICON_SIZE[size],
		color: t.colorForegroundMuted
	}), /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		accessibilityRole: "search",
		accessibilityLabel: label,
		accessibilityState: { disabled: isDisabled },
		editable: !isDisabled,
		value: currentValue,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		returnKeyType: "search",
		autoCapitalize: "none",
		autoCorrect: false,
		allowFontScaling: true,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onKeyPress: handleKeyPress,
		onSubmitEditing: handleSubmitEditing,
		style: inputTextStyle,
		testID: "Search.input"
	}), showClear ? /* @__PURE__ */ React.createElement(Button, {
		label: COPY$1.clear,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			size: "xs",
			color: t.colorForegroundMuted
		}),
		onPress: handleClear
	}) : null, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$1.submit,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "search",
			size: "xs",
			color: t.colorForegroundMuted
		}),
		onPress: handleSubmitPress
	})), open && hasSuggestions ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		importantForAccessibility: "yes",
		testID: "Search.status"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted"
	}, statusText)) : null, open && hasSuggestions ? /* @__PURE__ */ React.createElement(View, {
		style: popupOuterStyle,
		testID: "Search.suggestions"
	}, /* @__PURE__ */ React.createElement(Listbox, {
		label: `${label}: ${COPY$1.suggestionsCount(resultCount)}`,
		options: loading ? [] : suggestions ?? [],
		embedded: true,
		emptyMessage: loading ? COPY$1.loading : COPY$1.noSuggestions,
		onChange: handleSuggestionChange,
		overrides: listboxOverrides
	})) : null);
	return landmark ? /* @__PURE__ */ React.createElement(Landmark, {
		role: "search",
		label
	}, content) : content;
}
//#endregion
//#region src/DatePicker.tsx
const COPY = {
	open: "Choose date",
	openRange: "Choose dates",
	previousMonth: "Previous month",
	nextMonth: "Next month",
	month: "Month",
	year: "Year",
	today: "Today",
	clear: "Clear",
	weekNumber: "Week",
	gridLabel: (label, month, year) => `${label}, ${month} ${year}`,
	selected: "selected",
	todayLabel: "today",
	startLabel: "Start date",
	endLabel: "End date",
	required: (label) => `${label} is required.`,
	invalid: (label, pattern) => `${label} must be a valid date (${pattern}).`,
	tooEarly: (label, min) => `${label} must be on or after ${min}.`,
	tooLate: (label, max) => `${label} must be on or before ${max}.`,
	rangeOrder: "End date must be after the start date.",
	requiredIndicator: " (required)"
};
const WEEKDAYS_PER_ROW = 7;
const MS_PER_DAY = 864e5;
const MS_PER_WEEK = MS_PER_DAY * 7;
function pad2(n) {
	return n < 10 ? `0${n}` : String(n);
}
function toISO(y, m, d) {
	return `${y.toString().padStart(4, "0")}-${pad2(m)}-${pad2(d)}`;
}
function parseISO(iso) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (match === null || match[1] === void 0 || match[2] === void 0 || match[3] === void 0) return null;
	const y = Number(match[1]);
	const m = Number(match[2]);
	const d = Number(match[3]);
	const date = new Date(Date.UTC(y, m - 1, d));
	if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
	return {
		y,
		m,
		d
	};
}
function todayISO() {
	const now = /* @__PURE__ */ new Date();
	return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
function addMonths(y, m, delta) {
	const total = y * 12 + (m - 1) + delta;
	return {
		y: Math.floor(total / 12),
		m: (total % 12 + 12) % 12 + 1
	};
}
function getISOWeek(y, m, d) {
	const date = new Date(Date.UTC(y, m - 1, d));
	const weekday = (date.getUTCDay() + 6) % 7;
	date.setUTCDate(date.getUTCDate() - weekday + 3);
	const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
	const firstWeekday = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstWeekday + 3);
	return 1 + Math.round((date.getTime() - firstThursday.getTime()) / MS_PER_WEEK);
}
function getLocaleFirstDay(locale) {
	try {
		const info = new Intl.Locale(locale ?? "en-US").getWeekInfo?.();
		if (info) return info.firstDay % 7;
	} catch {}
	return 0;
}
function monthName(locale, month, format) {
	return new Intl.DateTimeFormat(locale, {
		month: format,
		timeZone: "UTC"
	}).format(new Date(Date.UTC(2020, month - 1, 1)));
}
function weekdayName(locale, weekday, format) {
	return new Intl.DateTimeFormat(locale, {
		weekday: format,
		timeZone: "UTC"
	}).format(new Date(Date.UTC(2023, 0, 1 + weekday)));
}
function formatDisplay(iso, locale) {
	const parsed = parseISO(iso);
	if (parsed === null) return "";
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)));
}
function formatFull(iso, locale) {
	const parsed = parseISO(iso);
	if (parsed === null) return iso;
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)));
}
function getPatternOrder(locale) {
	const order = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		timeZone: "UTC"
	}).formatToParts(new Date(Date.UTC(2020, 0, 1))).map((part) => part.type).filter((type) => type === "year" || type === "month" || type === "day");
	return order.length === 3 ? order : [
		"month",
		"day",
		"year"
	];
}
function getPatternPlaceholder(locale) {
	const tokens = {
		year: "YYYY",
		month: "MM",
		day: "DD"
	};
	return getPatternOrder(locale).map((part) => tokens[part]).join("/");
}
function parseTyped(text, locale) {
	const digitGroups = text.match(/\d+/g);
	if (digitGroups === null) return null;
	const digits = digitGroups.join("");
	if (digits.length !== 8) return null;
	const order = getPatternOrder(locale);
	const values = {};
	let cursor = 0;
	for (const part of order) {
		const length = part === "year" ? 4 : 2;
		values[part] = Number(digits.slice(cursor, cursor + length));
		cursor += length;
	}
	if (values.year === void 0 || values.month === void 0 || values.day === void 0) return null;
	const parsed = parseISO(toISO(values.year, values.month, values.day));
	return parsed === null ? null : toISO(parsed.y, parsed.m, parsed.d);
}
const FONT_SIZE_TOKEN = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
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
function DatePicker({ label, name, value, defaultValue, open: openProp, range = false, min, max, isDateDisabled, locale, showWeekNumbers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, error, overrides, onChange, onOpenChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const singleInputRef = React.useRef(null);
	const startInputRef = React.useRef(null);
	const endInputRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : internalValue;
	const currentSingle = !range && typeof currentValue === "string" ? currentValue : void 0;
	const currentStart = range && typeof currentValue === "object" ? currentValue.start : void 0;
	const currentEnd = range && typeof currentValue === "object" ? currentValue.end : void 0;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const summarised = form !== null && form.errorSummary;
	const patternPlaceholder = React.useMemo(() => getPatternPlaceholder(locale), [locale]);
	const [singleText, setSingleText] = React.useState(currentSingle !== void 0 ? formatDisplay(currentSingle, locale) : "");
	const [startText, setStartText] = React.useState(currentStart !== void 0 ? formatDisplay(currentStart, locale) : "");
	const [endText, setEndText] = React.useState(currentEnd !== void 0 ? formatDisplay(currentEnd, locale) : "");
	React.useEffect(() => {
		setSingleText(currentSingle !== void 0 ? formatDisplay(currentSingle, locale) : "");
	}, [currentSingle, locale]);
	React.useEffect(() => {
		setStartText(currentStart !== void 0 ? formatDisplay(currentStart, locale) : "");
	}, [currentStart, locale]);
	React.useEffect(() => {
		setEndText(currentEnd !== void 0 ? formatDisplay(currentEnd, locale) : "");
	}, [currentEnd, locale]);
	const [singleFocused, setSingleFocused] = React.useState(false);
	const [startFocused, setStartFocused] = React.useState(false);
	const [endFocused, setEndFocused] = React.useState(false);
	const isOpenControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = isOpenControlled ? openProp : internalOpen;
	const [pendingStart, setPendingStart] = React.useState(void 0);
	const anchorDate = () => {
		const anchorIso = range ? currentEnd ?? currentStart : currentSingle;
		return (anchorIso !== void 0 ? parseISO(anchorIso) : null) ?? parseISO(todayISO());
	};
	const initialAnchor = anchorDate();
	const [viewYear, setViewYear] = React.useState(initialAnchor.y);
	const [viewMonth, setViewMonth] = React.useState(initialAnchor.m);
	const prevOpenRef = React.useRef(isOpen);
	React.useEffect(() => {
		if (isOpen && !prevOpenRef.current) {
			const anchor = anchorDate();
			setViewYear(anchor.y);
			setViewMonth(anchor.m);
			setPendingStart(void 0);
		}
		prevOpenRef.current = isOpen;
	}, [isOpen]);
	const changeOpen = (next) => {
		if (isDisabled) return;
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};
	const isDayDisabled = React.useCallback((iso) => {
		if (min !== void 0 && iso < min) return true;
		if (max !== void 0 && iso > max) return true;
		return isDateDisabled?.(iso) ?? false;
	}, [
		min,
		max,
		isDateDisabled
	]);
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate === void 0) return COPY.required(label);
		if (candidate === void 0) return null;
		const isos = typeof candidate === "string" ? [candidate] : [candidate.start, candidate.end];
		for (const iso of isos) if (parseISO(iso) === null) return COPY.invalid(label, patternPlaceholder);
		if (min !== void 0 && isos.some((iso) => iso < min)) return COPY.tooEarly(label, formatDisplay(min, locale));
		if (max !== void 0 && isos.some((iso) => iso > max)) return COPY.tooLate(label, formatDisplay(max, locale));
		if (typeof candidate === "object" && candidate.end < candidate.start) return COPY.rangeOrder;
		return null;
	}, [
		error,
		required,
		label,
		min,
		max,
		locale,
		patternPlaceholder
	]);
	const commitValue = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const latest = React.useRef({
		currentValue,
		currentSingle,
		currentStart,
		currentEnd,
		validateValue
	});
	latest.current = {
		currentValue,
		currentSingle,
		currentStart,
		currentEnd,
		validateValue
	};
	const focusInput = (ref) => {
		const input = ref.current;
		if (input === null) return;
		input.focus();
		const node = findNodeHandle(input);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
	const singleHandle = React.useMemo(() => ({
		getValue: () => latest.current.currentSingle,
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => focusInput(singleInputRef)
	}), []);
	const startHandle = React.useMemo(() => ({
		getValue: () => latest.current.currentStart,
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => focusInput(startInputRef)
	}), []);
	const endHandle = React.useMemo(() => ({
		getValue: () => latest.current.currentEnd,
		validate: () => null,
		focus: () => focusInput(endInputRef)
	}), []);
	const register = form?.register;
	const unregister = form?.unregister;
	React.useEffect(() => {
		if (register === void 0 || unregister === void 0 || isDisabled) return;
		if (range) {
			register(name, startHandle);
			register(`${name}-end`, endHandle);
			return () => {
				unregister(name);
				unregister(`${name}-end`);
			};
		}
		register(name, singleHandle);
		return () => unregister(name);
	}, [
		register,
		unregister,
		name,
		range,
		singleHandle,
		startHandle,
		endHandle,
		isDisabled
	]);
	React.useEffect(() => {
		if (!summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const handleSingleChangeText = (text) => {
		setSingleText(text);
		if (text === "") {
			commitValue(void 0);
			return;
		}
		const parsed = parseTyped(text, locale);
		if (parsed !== null) {
			commitValue(parsed);
			const anchor = parseISO(parsed);
			setViewYear(anchor.y);
			setViewMonth(anchor.m);
		}
	};
	const handleSingleBlur = () => {
		setSingleFocused(false);
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	const handleStartChangeText = (text) => {
		setStartText(text);
		if (text === "") {
			if (currentEnd === void 0) commitValue(void 0);
			return;
		}
		const parsed = parseTyped(text, locale);
		if (parsed === null) return;
		if (currentEnd !== void 0) commitValue({
			start: parsed,
			end: currentEnd
		});
	};
	const handleEndChangeText = (text) => {
		setEndText(text);
		if (text === "") {
			if (currentStart === void 0) commitValue(void 0);
			return;
		}
		const parsed = parseTyped(text, locale);
		if (parsed === null) return;
		if (currentStart !== void 0) commitValue({
			start: currentStart,
			end: parsed
		});
	};
	const handleRangeBlur = () => {
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	const handleInputKeyPress = (event) => {
		if (event.nativeEvent.key === "ArrowDown") changeOpen(true);
	};
	const handleSheetClose = () => {
		changeOpen(false);
	};
	const handleDaySelect = (iso) => {
		if (isDayDisabled(iso)) return;
		if (!range) {
			commitValue(iso);
			changeOpen(false);
			return;
		}
		if (pendingStart === void 0) {
			setPendingStart(iso);
			return;
		}
		if (iso < pendingStart) {
			setPendingStart(iso);
			return;
		}
		setPendingStart(void 0);
		commitValue({
			start: pendingStart,
			end: iso
		});
		changeOpen(false);
	};
	const handleTodayPress = () => {
		handleDaySelect(todayISO());
	};
	const handleClearPress = () => {
		setPendingStart(void 0);
		commitValue(void 0);
		changeOpen(false);
	};
	const handlePrevMonth = () => {
		const next = addMonths(viewYear, viewMonth, -1);
		setViewYear(next.y);
		setViewMonth(next.m);
	};
	const handleNextMonth = () => {
		const next = addMonths(viewYear, viewMonth, 1);
		setViewYear(next.y);
		setViewMonth(next.m);
	};
	const handleMonthChange = (next) => {
		if (typeof next === "string") setViewMonth(Number(next));
	};
	const handleYearChange = (next) => {
		if (typeof next === "string") setViewYear(Number(next));
	};
	const monthOptions = React.useMemo(() => Array.from({ length: 12 }, (_, i) => ({
		value: String(i + 1),
		label: monthName(locale, i + 1, "long")
	})), [locale]);
	const yearOptions = React.useMemo(() => {
		const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
		const minYear = min !== void 0 ? parseISO(min)?.y ?? currentYear - 100 : currentYear - 100;
		const maxYear = max !== void 0 ? parseISO(max)?.y ?? currentYear + 10 : currentYear + 10;
		return Array.from({ length: Math.max(1, maxYear - minYear + 1) }, (_, i) => {
			const y = minYear + i;
			return {
				value: String(y),
				label: String(y)
			};
		});
	}, [min, max]);
	const firstDay = React.useMemo(() => getLocaleFirstDay(locale), [locale]);
	const gridDays = React.useMemo(() => {
		const leading = (new Date(Date.UTC(viewYear, viewMonth - 1, 1)).getUTCDay() - firstDay + 7) % 7;
		const gridStart = Date.UTC(viewYear, viewMonth - 1, 1 - leading);
		return Array.from({ length: 42 }, (_, i) => {
			const date = new Date(gridStart + i * MS_PER_DAY);
			const y = date.getUTCFullYear();
			const m = date.getUTCMonth() + 1;
			const d = date.getUTCDate();
			return {
				iso: toISO(y, m, d),
				y,
				m,
				d,
				outsideMonth: m !== viewMonth || y !== viewYear
			};
		});
	}, [
		viewYear,
		viewMonth,
		firstDay
	]);
	const weeks = React.useMemo(() => {
		const rows = [];
		for (let i = 0; i < gridDays.length; i += WEEKDAYS_PER_ROW) rows.push(gridDays.slice(i, i + WEEKDAYS_PER_ROW));
		return rows;
	}, [gridDays]);
	const weekdayLabels = React.useMemo(() => Array.from({ length: WEEKDAYS_PER_ROW }, (_, i) => weekdayName(locale, (firstDay + i) % 7, "short")), [locale, firstDay]);
	const todayIso = todayISO();
	const displayStart = range ? pendingStart ?? currentStart : void 0;
	const displayEnd = range ? pendingStart !== void 0 ? void 0 : currentEnd : void 0;
	const isSelected = (iso) => range ? iso === displayStart || iso === displayEnd : iso === currentSingle;
	const isInRange = (iso) => range && displayStart !== void 0 && displayEnd !== void 0 ? iso > displayStart && iso < displayEnd : false;
	const dayAccessibilityLabel = (iso) => {
		const bits = [formatFull(iso, locale)];
		if (iso === todayIso) bits.push(COPY.todayLabel);
		if (isSelected(iso)) bits.push(COPY.selected);
		return bits.join(", ");
	};
	const monthLabel = monthName(locale, viewMonth, "long");
	const gridLabel = COPY.gridLabel(label, monthLabel, String(viewYear));
	const prevGridLabelRef = React.useRef(gridLabel);
	React.useEffect(() => {
		if (isOpen && gridLabel !== prevGridLabelRef.current) AccessibilityInfo.announceForAccessibility(gridLabel);
		prevGridLabelRef.current = gridLabel;
	}, [gridLabel, isOpen]);
	const borderFocusColor = overrides?.borderFocus ? resolveToken(t, overrides.borderFocus) : t.colorBorderFocus;
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = size === "sm" ? overrides?.paddingInlineSm ? resolveToken(t, overrides.paddingInlineSm) : t.space2 : overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const paddingBlock = size === "sm" ? overrides?.paddingBlockSm ? resolveToken(t, overrides.paddingBlockSm) : t.space1 : overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const minTarget = size === "sm" ? overrides?.minTargetSm ? resolveToken(t, overrides.minTargetSm) : t.sizeTargetMin : t.sizeTargetComfortable;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const fieldGap = overrides?.fieldGap ? resolveToken(t, overrides.fieldGap) : t.space2;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = t[FONT_SIZE_TOKEN[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const calendarInset = overrides?.calendarInset ?? "layout.inset.md";
	const daySize = overrides?.daySize ? resolveToken(t, overrides.daySize) : t.sizeTargetComfortable;
	const dayGap = overrides?.dayGap ? resolveToken(t, overrides.dayGap) : t.space0;
	const dayRadius = overrides?.dayRadius ? resolveToken(t, overrides.dayRadius) : t.radiusMd;
	const dayHoverColor = overrides?.dayHover ? resolveToken(t, overrides.dayHover) : t.colorActionGhostBackgroundHover;
	const dayTodayBorderWidth = overrides?.dayTodayBorderWidth ? resolveToken(t, overrides.dayTodayBorderWidth) : t.borderWidthFocus;
	const daySlop = Math.max(0, Math.ceil((t.sizeTargetMin - daySize) / 2));
	const dayHitSlop = {
		top: daySlop,
		bottom: daySlop,
		left: daySlop,
		right: daySlop
	};
	const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: fieldGap
	};
	const fieldTextStyle = (focused, invalid) => {
		const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
		const inset = t.borderWidthFocus - borderWidth;
		return {
			flexGrow: 1,
			flexShrink: 1,
			flexBasis: 0,
			minHeight: minTarget,
			backgroundColor: t.colorBackground,
			color: t.colorForeground,
			borderWidth: activeBorderWidth,
			borderColor: focused ? borderFocusColor : invalid ? borderInvalidColor : t.colorBorderStrong,
			borderRadius: radius,
			paddingHorizontal: paddingInline + inset,
			paddingVertical: paddingBlock + inset,
			fontFamily,
			fontSize,
			lineHeight: toLineHeight(fontSize, lineHeightMultiplier)
		};
	};
	const helperOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.helperSize,
		lineHeight: overrides?.lineHeight
	};
	const labelOverrides = {
		fontFamily: overrides?.fontFamily,
		fontWeight: overrides?.labelWeight,
		lineHeight: overrides?.lineHeight
	};
	const headerRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: t.space1
	};
	const weekdayRowStyle = {
		flexDirection: "row",
		gap: dayGap
	};
	const weekRowStyle = {
		flexDirection: "row",
		gap: dayGap
	};
	const weekCellStyle = {
		width: daySize,
		alignItems: "center",
		justifyContent: "center"
	};
	const dayCellStyle = (cell, pressed) => {
		const selected = isSelected(cell.iso);
		const inRange = isInRange(cell.iso);
		const today = cell.iso === todayIso;
		const dis = isDayDisabled(cell.iso);
		return {
			width: daySize,
			height: daySize,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: dayRadius,
			backgroundColor: selected ? t.colorControlSelectedBackground : inRange ? t.colorBackgroundStrong : pressed && !dis ? dayHoverColor : "transparent",
			borderWidth: today && !selected ? dayTodayBorderWidth : 0,
			borderColor: t.colorControlSelectedBackground,
			opacity: dis ? disabledOpacity : 1
		};
	};
	const dayTextColor = (cell) => {
		if (isSelected(cell.iso)) return "color.control.selectedForeground";
		if (cell.outsideMonth) return "color.foreground.muted";
	};
	const field = range ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(TextInput, {
		ref: startInputRef,
		accessibilityLabel: `${visibleLabel}, ${COPY.startLabel}`,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		keyboardType: "number-pad",
		editable: !isDisabled,
		value: startText,
		placeholder: placeholder ?? patternPlaceholder,
		placeholderTextColor: t.colorForegroundMuted,
		onChangeText: handleStartChangeText,
		onFocus: () => setStartFocused(true),
		onBlur: () => {
			setStartFocused(false);
			handleRangeBlur();
		},
		onKeyPress: handleInputKeyPress,
		style: fieldTextStyle(startFocused, displayedError !== void 0),
		testID: "DatePicker.input"
	}), /* @__PURE__ */ React.createElement(Text, { overrides: { color: "color.foreground.muted" } }, "–"), /* @__PURE__ */ React.createElement(TextInput, {
		ref: endInputRef,
		accessibilityLabel: `${visibleLabel}, ${COPY.endLabel}`,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		keyboardType: "number-pad",
		editable: !isDisabled,
		value: endText,
		placeholder: placeholder ?? patternPlaceholder,
		placeholderTextColor: t.colorForegroundMuted,
		onChangeText: handleEndChangeText,
		onFocus: () => setEndFocused(true),
		onBlur: () => {
			setEndFocused(false);
			handleRangeBlur();
		},
		onKeyPress: handleInputKeyPress,
		style: fieldTextStyle(endFocused, displayedError !== void 0),
		testID: "DatePicker.input"
	})) : /* @__PURE__ */ React.createElement(TextInput, {
		ref: singleInputRef,
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		keyboardType: "number-pad",
		editable: !isDisabled,
		value: singleText,
		placeholder: placeholder ?? patternPlaceholder,
		placeholderTextColor: t.colorForegroundMuted,
		onChangeText: handleSingleChangeText,
		onFocus: () => setSingleFocused(true),
		onBlur: handleSingleBlur,
		onKeyPress: handleInputKeyPress,
		style: fieldTextStyle(singleFocused, displayedError !== void 0),
		testID: "DatePicker.input"
	});
	return /* @__PURE__ */ React.createElement(View, {
		style: containerStyle,
		testID: "DatePicker"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel), description !== void 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description) : null, /* @__PURE__ */ React.createElement(View, {
		style: fieldRowStyle,
		testID: "DatePicker.field"
	}, field, /* @__PURE__ */ React.createElement(Button, {
		label: range ? COPY.openRange : COPY.open,
		variant: "ghost",
		size,
		iconOnly: true,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "calendar",
			color: t.colorActionGhostForeground
		}),
		onPress: () => changeOpen(!isOpen)
	})), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, { accessibilityLiveRegion: summarised ? "none" : "assertive" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null, /* @__PURE__ */ React.createElement(BottomSheet, {
		open: isOpen,
		heading: gridLabel,
		height: "content",
		onClose: handleSheetClose,
		overrides: { inset: calendarInset },
		footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, {
			label: COPY.today,
			variant: "ghost",
			size: "sm",
			onPress: handleTodayPress
		}), /* @__PURE__ */ React.createElement(Button, {
			label: COPY.clear,
			variant: "ghost",
			size: "sm",
			onPress: handleClearPress
		}))
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "vertical",
		gap: "normal",
		overrides: { gap: overrides?.calendarGap }
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerRowStyle,
		testID: "DatePicker.header"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY.previousMonth,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-left",
			size: "sm",
			color: t.colorActionGhostForeground
		}),
		onPress: handlePrevMonth
	}), /* @__PURE__ */ React.createElement(Select, {
		label: COPY.month,
		name: `${name}-month`,
		hideLabel: true,
		size: "sm",
		options: monthOptions,
		value: String(viewMonth),
		onChange: handleMonthChange,
		overrides: { fontSize: overrides?.monthTitleSize ?? "font.size.md" }
	}), /* @__PURE__ */ React.createElement(Select, {
		label: COPY.year,
		name: `${name}-year`,
		hideLabel: true,
		size: "sm",
		options: yearOptions,
		value: String(viewYear),
		onChange: handleYearChange,
		overrides: { fontSize: overrides?.monthTitleSize ?? "font.size.md" }
	}), /* @__PURE__ */ React.createElement(Button, {
		label: COPY.nextMonth,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-right",
			size: "sm",
			color: t.colorActionGhostForeground
		}),
		onPress: handleNextMonth
	})), /* @__PURE__ */ React.createElement(View, {
		testID: "DatePicker.grid",
		accessibilityLabel: gridLabel
	}, /* @__PURE__ */ React.createElement(View, {
		style: weekdayRowStyle,
		testID: "DatePicker.weekdayHeader"
	}, showWeekNumbers ? /* @__PURE__ */ React.createElement(View, { style: weekCellStyle }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			fontSize: overrides?.weekdaySize,
			fontWeight: overrides?.weekdayWeight
		}
	}, COPY.weekNumber)) : null, weekdayLabels.map((wd, i) => /* @__PURE__ */ React.createElement(View, {
		key: i,
		style: weekCellStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			fontSize: overrides?.weekdaySize,
			fontWeight: overrides?.weekdayWeight
		}
	}, wd)))), weeks.map((week, wi) => /* @__PURE__ */ React.createElement(View, {
		key: wi,
		style: weekRowStyle
	}, showWeekNumbers && week[0] !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: weekCellStyle,
		testID: "DatePicker.weekNumber"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: { fontSize: overrides?.weekdaySize }
	}, getISOWeek(week[0].y, week[0].m, week[0].d))) : null, week.map((cell) => /* @__PURE__ */ React.createElement(Pressable, {
		key: cell.iso,
		accessibilityRole: "button",
		accessibilityLabel: dayAccessibilityLabel(cell.iso),
		accessibilityState: {
			selected: isSelected(cell.iso),
			disabled: isDayDisabled(cell.iso)
		},
		hitSlop: dayHitSlop,
		onPress: () => handleDaySelect(cell.iso),
		style: ({ pressed }) => dayCellStyle(cell, pressed),
		testID: "DatePicker.day"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: {
			fontSize: overrides?.dayFontSize,
			color: dayTextColor(cell)
		}
	}, cell.d)))))))));
}
//#endregion
export { Accordion, ActionSheet, Alert, AlertDialog, BottomSheet, Box, Breadcrumb, Button, Card, Carousel, CarouselSlide, Checkbox, Combobox, Container, DataGrid, DatePicker, Dialog, Disclosure, Divider, Feed, Fieldset, FieldsetContext, FocusScope, Form, FormContext, Heading, Icon, Input, Landmark, Link, Listbox, Menu, Meter, NumberInput, Popover, ProgressBar, RadioGroup, Search, SegmentedControl, Select, SidePanel, Slider, Splitter, Stack, Stepper, Switch, TabPanel, Table, Tabs, Text, TextStyleContext, ThemeProvider, Toast, ToastProvider, Toolbar, Tooltip, Tree, TreeGrid, toEasing, toFontWeight, toLineHeight, toTextAlign, toast, useFieldsetContext, useFormContext, useReducedMotion, useSidePanelEdgeSwipe, useTheme, useToast };

//# sourceMappingURL=index.js.map