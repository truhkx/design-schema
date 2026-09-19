import * as React from "react";
import { AccessibilityInfo, Animated, AppState, Easing, FlatList, I18nManager, KeyboardAvoidingView, Linking, Modal, PanResponder, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch as Switch$1, Text as Text$1, TextInput, View, findNodeHandle, useColorScheme, useWindowDimensions } from "react-native";
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
/** The component's user-facing strings, from the doc's `copy` block. */
const COPY$32 = { loading: "Loading" };
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
const PADDING_INLINE_TOKEN$3 = {
	sm: "spaceSm",
	md: "spaceMd",
	lg: "spaceLg"
};
const FONT_SIZE_TOKEN$4 = {
	sm: "fontSizeSm",
	md: "fontSizeMd",
	lg: "fontSizeLg"
};
/** `inverseHoverOpacity` is `opacity.disabled` times this factor (the binding's `computed`). */
const INVERSE_HOVER_OPACITY_FACTOR = .25;
/**
* `color` at `alpha`. The doc's inverse ghost fill is a mix of a token with the surface;
* web and Lit write it as `color-mix`, and native has no such function, so the resolved
* token is re-emitted with an alpha channel. Anything that is not a `#rgb`/`#rrggbb`
* token (a named color, an already-transparent value) is returned untouched.
*/
function withAlpha(color, alpha) {
	const hex = color.startsWith("#") ? color.slice(1) : "";
	const full = hex.length === 3 ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}` : hex;
	if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/u.test(full)) return color;
	const channel = (at) => Number.parseInt(full.slice(at, at + 2), 16);
	return `rgba(${channel(0)}, ${channel(2)}, ${channel(4)}, ${alpha})`;
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
function Button({ label, variant = "primary", size = "md", type = "button", expanded, disabled = false, leadingIcon, trailingIcon, iconOnly = false, loading = false, inverse = false, accessibleName, track, overrides, ref, accessibilityHint, accessibilityLabel, onPress, onTrack, onPressOut, onLongPress, onHoverIn, onHoverOut, onFocus, onBlur }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const [focused, setFocused] = React.useState(false);
	const [pressedState, setPressedState] = React.useState(false);
	const [layout, setLayout] = React.useState(null);
	const isDisabled = disabled || (form?.disabled ?? false);
	const rootRef = React.useRef(null);
	React.useImperativeHandle(ref, () => rootRef.current, []);
	React.useEffect(() => {
		if (Platform.OS !== "web") return;
		const node = rootRef.current;
		if (node === null) return;
		if (isDisabled) node.setAttribute("aria-disabled", "true");
		else node.removeAttribute("aria-disabled");
	}, [isDisabled]);
	const colors = VARIANT_TOKENS[variant];
	const isInverseGhost = variant === "ghost" && inverse;
	const background = t[colors.background];
	const inverseBackgroundHover = overrides?.inverseBackgroundHover ? resolveToken(t, overrides.inverseBackgroundHover) : t.colorInverseForeground;
	const inverseHoverOpacity = (overrides?.inverseHoverOpacity ? resolveToken(t, overrides.inverseHoverOpacity) : t.opacityDisabled) * INVERSE_HOVER_OPACITY_FACTOR;
	const backgroundHover = isInverseGhost ? withAlpha(inverseBackgroundHover, inverseHoverOpacity) : t[colors.backgroundHover];
	const foreground = isInverseGhost ? t.colorInverseLink : t[colors.foreground];
	const focusRingColor = inverse ? t.colorInverseFocus : t.colorBorderFocus;
	const iconGap = overrides?.iconGap ? resolveToken(t, overrides.iconGap) : t.space2;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : iconOnly ? t.spaceSm : t[PADDING_INLINE_TOKEN$3[size]];
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightMedium;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$4[size]];
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const loadingSpinDuration = overrides?.loadingSpin ? resolveToken(t, overrides.loadingSpin) : t.motionDurationLoop;
	const spinnerSize = overrides?.spinnerSize ? resolveToken(t, overrides.spinnerSize) : t[FONT_SIZE_TOKEN$4[size]];
	const spinnerStroke = t.borderWidthFocus;
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
			onTrack?.(track, label);
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
		width: spinnerSize,
		height: spinnerSize,
		borderRadius: spinnerSize / 2,
		borderWidth: spinnerStroke,
		borderColor: foreground,
		borderTopColor: "transparent",
		transform: [{ rotate: spin.interpolate({
			inputRange: [0, 1],
			outputRange: ["0deg", "360deg"]
		}) }]
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: rootRef,
		testID: "Button",
		accessibilityRole: "button",
		accessibilityLabel: accessibleName ?? accessibilityLabel ?? label,
		accessibilityHint,
		accessibilityState: expanded === void 0 ? {
			disabled: isDisabled,
			busy: loading
		} : {
			disabled: isDisabled,
			busy: loading,
			expanded
		},
		"aria-busy": loading,
		"aria-expanded": expanded,
		accessibilityValue: loading ? { text: COPY$32.loading } : void 0,
		hitSlop,
		onPress: handlePress,
		onPressIn: () => setPressedState(true),
		onPressOut: (event) => {
			setPressedState(false);
			onPressOut?.(event);
		},
		onLongPress,
		onHoverIn,
		onHoverOut,
		onFocus: (event) => {
			setFocused(true);
			onFocus?.(event);
		},
		onBlur: (event) => {
			setFocused(false);
			onBlur?.(event);
		},
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
		testID: "Button.leadingIcon",
		style: iconSlotStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, leadingIcon) : null, iconOnly ? null : /* @__PURE__ */ React.createElement(Text$1, {
		testID: "Button.label",
		allowFontScaling: true,
		style: labelStyle
	}, label), !iconOnly && !loading && trailingIcon !== void 0 && trailingIcon !== null ? /* @__PURE__ */ React.createElement(View, {
		testID: "Button.trailingIcon",
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
/**
* The foreground color in force for a subtree, standing in for the CSS cascade.
*
* Text's `color` binding is locked — every tone is contrast-checked against the page
* background — so a component that owns a surface with a foreground of its own (Toast,
* Tooltip, Slider's value bubble, DatePicker's selected day) cannot hand Text a color
* through `overrides`. On web and Lit those components re-scope the `--color-foreground`
* custom property around the composed text; React Native has no cascade to re-scope, so
* they provide the color here instead and keep composing `Text` rather than restyling it
* or drawing their own. A `tone` other than `default` still wins, since it carries
* meaning the surface does not.
*
* Package-internal: it is not re-exported from the package entry point, because a
* consumer's surface should grow a schema binding rather than paint text by hand.
*/
const TextForegroundContext = React.createContext(void 0);
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
function Text({ children, size = "md", weight = "regular", tone = "default", align = "start", truncate = false, overrides, ref }) {
	const { tokens: t } = useTheme();
	const surfaceColor = React.useContext(TextForegroundContext);
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[SIZE_TOKEN$2[size]];
	const color = tone === "default" && surfaceColor !== void 0 ? surfaceColor : t[TONE_TOKEN[tone]];
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
		ref,
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
const LEVELS = Object.keys(LEVEL_SIZE);
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
function Heading({ level, size, children, align = "start", overrides, ref }) {
	const { tokens: t } = useTheme();
	const levelString = String(level);
	const levelValid = LEVELS.includes(levelString);
	const levelKey = levelValid ? levelString : "2";
	const warnedInvalidLevel = React.useRef(false);
	React.useEffect(() => {
		if (__DEV__ && !levelValid && !warnedInvalidLevel.current) {
			warnedInvalidLevel.current = true;
			console.warn(`Heading: level ${JSON.stringify(level)} is not one of 1–6; rendering as level 2.`);
		}
	}, [levelValid, level]);
	const resolvedSize = size ?? LEVEL_SIZE[levelKey];
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[SIZE_TOKEN$1[resolvedSize]];
	const color = t.colorForegroundStrong;
	const style = React.useMemo(() => {
		const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightTight;
		const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightSemibold;
		return {
			fontFamily: overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyHeading,
			fontWeight: toFontWeight(fontWeight),
			fontSize,
			lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
			color,
			marginBottom: overrides?.marginBlockEnd ? resolveToken(t, overrides.marginBlockEnd) : t.spaceSm,
			textAlign: toTextAlign(align)
		};
	}, [
		t,
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
		ref,
		testID: "Heading",
		accessibilityRole: "header",
		allowFontScaling: true,
		style
	}, /* @__PURE__ */ React.createElement(TextStyleContext.Provider, { value: contextValue }, children));
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
const JUSTIFY$3 = {
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
function Stack({ children, direction = "vertical", gap = "normal", align = "stretch", justify = "start", wrap = false, overrides, ref }) {
	const { tokens: t } = useTheme();
	const style = React.useMemo(() => ({
		flexDirection: direction === "horizontal" ? "row" : "column",
		gap: gap !== "none" && overrides?.gap ? resolveToken(t, overrides.gap) : t[GAP_TOKEN[gap]],
		alignItems: ALIGN[align],
		justifyContent: JUSTIFY$3[justify],
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
		ref,
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
const COPY$31 = { requiredIndicator: " (required)" };
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
* with `gap`; `FieldsetContext` carries the legend and `disabled` to Input,
* Checkbox, Switch and RadioGroup, which render disabled and prefix the legend into
* their label. Children are never cloned; a non-field child gets no association.
* `disabled` dims only the legend and description with `opacity.disabled` — the
* fields dim themselves. The group error is announced as in Input
* (`accessibilityLiveRegion` on Android, `announceForAccessibility` on iOS); native
* has no invalid state, so the error text alone identifies it.
*/
function Fieldset({ legend, children, description, error, disabled = false, gap = "normal", overrides, ref }) {
	const { tokens: t } = useTheme();
	const hasError = error !== void 0 && error !== "";
	const hasDescription = description !== void 0 && description !== "";
	React.useEffect(() => {
		if (Platform.OS === "ios" && error !== void 0 && error !== "") AccessibilityInfo.announceForAccessibility(error);
	}, [error]);
	const fieldElements = React.Children.toArray(children).filter(React.isValidElement);
	const visibleLegend = fieldElements.length > 0 && fieldElements.every((child) => child.props.required === true) ? `${legend}${COPY$31.requiredIndicator}` : legend;
	const contextValue = React.useMemo(() => ({
		legend,
		disabled
	}), [legend, disabled]);
	const groupStyle = React.useMemo(() => ({
		flexDirection: "column",
		gap: overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapTight
	}), [t, overrides?.partGap]);
	const dimStyle = React.useMemo(() => disabled ? { opacity: overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled } : void 0, [
		t,
		disabled,
		overrides?.disabledOpacity
	]);
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
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Fieldset",
		role: "group",
		accessibilityLabel: visibleLegend,
		accessibilityHint: hasDescription ? description : void 0,
		style: groupStyle
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Fieldset.legend",
		style: dimStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "default",
		size: "md",
		weight: "medium",
		overrides: legendOverrides
	}, visibleLegend)), hasDescription ? /* @__PURE__ */ React.createElement(View, {
		testID: "Fieldset.description",
		style: dimStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "muted",
		size: "sm",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, { testID: "Fieldset.fields" }, /* @__PURE__ */ React.createElement(FieldsetContext.Provider, { value: contextValue }, /* @__PURE__ */ React.createElement(Stack, {
		gap,
		overrides: overrides?.fieldsGap ? { gap: overrides.fieldsGap } : void 0
	}, children))), hasError ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "assertive",
		testID: "Fieldset.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "danger",
		size: "sm",
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
const FONT_SIZE_TOKEN$3 = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
const PADDING_INLINE_TOKEN$2 = {
	sm: "space2",
	md: "spaceMd"
};
const PADDING_BLOCK_TOKEN$3 = {
	sm: "space1",
	md: "spaceSm"
};
const MIN_TARGET_TOKEN$2 = {
	sm: "sizeTargetMin",
	md: "sizeTargetComfortable"
};
/** The `longPressDelay` constant: TextInput has no long-press event; this matches Pressable's default `delayLongPress`. */
const LONG_PRESS_DELAY_MS = 500;
const COPY$30 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)"
};
/**
* Input — collects a single line of text, bundling label, helper text, field and
* error message so their association is always correct.
*
* When to use: names, emails, passwords, search terms and short free-text values.
* Choose `type` so the touch keyboard matches; provide `description` when the
* format matters. Not for multi-line content, a fixed set of choices, or on/off
* values, and never with `placeholder` standing in for the label.
*
* Renders a `Text` label, optional description, a `TextInput`, and an error `Text`.
* The label is also passed as `accessibilityLabel`, description as
* `accessibilityHint`, and `accessibilityState={{ disabled }}`. `type` maps to
* `keyboardType`, `textContentType` and `secureTextEntry`. Errors are announced
* with `accessibilityLiveRegion` (Android) and
* `AccessibilityInfo.announceForAccessibility` (iOS). Inside a Form the field
* registers `{ getValue, validate, focus }` by `name` (precedence: `error`, then
* `required`, then `invalid`); a disabled field is not registered. The border is
* the focus ring: focus widens it to `focusRingWidth` and padding shrinks by the
* difference so the field never shifts; an invalid field keeps its danger color
* while focused. `disabled` dims the whole group with `disabledOpacity`. Inside a
* Fieldset the group's `disabled` applies as if set on the field and the legend
* prefixes the `accessibilityLabel` ("Shipping address, Street"). `size: sm` swaps
* padding and the target height for their Sm bindings and the type to
* `font.size.sm`. `accessibilityHint`, `accessibilityLabel`, `onHoverIn`,
* `onHoverOut`, `onFocus`, `onBlur`, `onLongPress` and `onPressOut` reach the
* native field so Tooltip can attach to it.
*/
function Input({ label, name, value, defaultValue, placeholder, description, type = "text", required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, ref, accessibilityHint, accessibilityLabel, onChange, onFocus, onBlur, onHoverIn, onHoverOut, onLongPress, onPressOut }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const inputRef = React.useRef(null);
	const longPressTimer = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
	const [focused, setFocused] = React.useState(false);
	const currentValue = value ?? internalValue;
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const formError = form?.errors[name];
	const invalidMessage = invalid ? required && currentValue === "" ? COPY$30.required(label) : COPY$30.invalid(label) : void 0;
	const displayedError = error !== void 0 && error !== "" ? error : formError ?? invalidMessage;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate === "") return COPY$30.required(label);
		if (invalid) return COPY$30.invalid(label);
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
	React.useEffect(() => () => {
		if (longPressTimer.current !== null) clearTimeout(longPressTimer.current);
	}, []);
	const handleChangeText = (next) => {
		if (value === void 0) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(next));
	};
	const handleFocus = () => {
		setFocused(true);
		onFocus?.();
	};
	const handleBlur = () => {
		setFocused(false);
		onBlur?.();
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	const handlePressIn = (event) => {
		if (onLongPress === void 0) return;
		longPressTimer.current = setTimeout(() => {
			longPressTimer.current = null;
			onLongPress(event);
		}, LONG_PRESS_DELAY_MS);
	};
	const handlePressOut = (event) => {
		if (longPressTimer.current !== null) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
		onPressOut?.(event);
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
	const visibleLabel = required ? `${label}${COPY$30.requiredIndicator}` : label;
	const ownName = accessibilityLabel ?? visibleLabel;
	const accessibleName = fieldset !== null ? `${fieldset.legend}, ${ownName}` : ownName;
	const hints = [description, accessibilityHint].filter((part) => part !== void 0 && part !== "");
	const accessibleHint = hints.length > 0 ? hints.join(" ") : void 0;
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[PADDING_INLINE_TOKEN$2[size]];
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[PADDING_BLOCK_TOKEN$3[size]];
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$3[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const inset = activeBorderWidth - borderWidth;
	const borderColor = isInvalid ? borderInvalidColor : focused ? t.colorBorderFocus : t.colorBorderStrong;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldStyle = {
		minHeight: t[MIN_TARGET_TOKEN$2[size]],
		backgroundColor: t.colorBackground,
		color: t.colorForeground,
		borderWidth: activeBorderWidth,
		borderColor,
		borderRadius: radius,
		paddingHorizontal: Math.max(0, paddingInline - inset),
		paddingVertical: Math.max(0, paddingBlock - inset),
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
		ref,
		"aria-disabled": isDisabled || void 0,
		style: containerStyle,
		testID: "Input"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "Input.label" }, /* @__PURE__ */ React.createElement(Text, {
		size,
		weight: "medium",
		overrides: {
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.fontSize,
			fontWeight: overrides?.labelWeight,
			lineHeight: overrides?.lineHeight
		}
	}, visibleLabel)), description !== void 0 && description !== "" ? /* @__PURE__ */ React.createElement(View, { testID: "Input.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		testID: "Input.field",
		accessibilityLabel: accessibleName,
		accessibilityHint: accessibleHint,
		accessibilityState: { disabled: isDisabled },
		"aria-disabled": isDisabled,
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
		submitBehavior: isLast ? "blurAndSubmit" : "submit",
		onSubmitEditing: handleSubmitEditing,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onPointerEnter: onHoverIn,
		onPointerLeave: onHoverOut,
		onPressIn: handlePressIn,
		onPressOut: handlePressOut,
		style: fieldStyle
	}), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "Input.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
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
/** The shared glyph grid every platform draws on: path data is 16×16 and `viewBox` scales it to the rendered box. */
const GRID = 16;
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
* slightly higher than on web — a platform limit. The root is react-native-svg's
* `Svg`, whose ref is a class instance, so Icon exposes no ref and no part hook
* beyond `testID="Icon"`. Decorative (no `label`): `accessibilityElementsHidden`
* and `importantForAccessibility="no"`. Labelled: `accessibilityRole="image"` and
* `accessibilityLabel`. No interaction, no focus, no animation.
*/
function Icon({ name, size = "md", inline = false, label, color, overrides }) {
	const { tokens: t } = useTheme();
	const textStyle = React.useContext(TextStyleContext);
	const decorative = label === void 0 || label === "";
	const dimension = inline ? textStyle.nested ? textStyle.fontSize : t.fontSizeMd : overrides?.size ? resolveToken(t, overrides.size) : t[SIZE_TOKEN[size]];
	const resolvedColor = color ?? (overrides?.color ? resolveToken(t, overrides.color) : textStyle.nested ? textStyle.color : t.colorForeground);
	const glyph = paths[name];
	const a11y = {
		accessibilityRole: decorative ? void 0 : "image",
		accessibilityLabel: decorative ? void 0 : label,
		accessibilityElementsHidden: decorative,
		importantForAccessibility: decorative ? "no" : "auto"
	};
	if (glyph === void 0) {
		if (__DEV__) console.warn(`Icon: unknown name "${name}"`);
		return /* @__PURE__ */ React.createElement(Svg, {
			testID: "Icon",
			width: dimension,
			height: dimension,
			viewBox: "0 0 16 16",
			fill: "none",
			accessibilityRole: a11y.accessibilityRole,
			accessibilityLabel: a11y.accessibilityLabel,
			accessibilityElementsHidden: a11y.accessibilityElementsHidden,
			importantForAccessibility: a11y.importantForAccessibility
		});
	}
	const web = Platform.OS === "web";
	const strokeWidth = glyph.filled ? void 0 : web ? t.borderWidthFocus : t.borderWidthFocus * (GRID / dimension);
	return /* @__PURE__ */ React.createElement(Svg, {
		testID: "Icon",
		width: dimension,
		height: dimension,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: resolvedColor,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		accessibilityRole: a11y.accessibilityRole,
		accessibilityLabel: a11y.accessibilityLabel,
		accessibilityElementsHidden: a11y.accessibilityElementsHidden,
		importantForAccessibility: a11y.importantForAccessibility
	}, glyph.filled ? /* @__PURE__ */ React.createElement(Path, {
		d: glyph.d,
		fill: resolvedColor,
		stroke: "none",
		fillRule: "evenodd"
	}) : web ? /* @__PURE__ */ React.createElement(Path, {
		d: glyph.d,
		strokeWidth,
		vectorEffect: "non-scaling-stroke"
	}) : /* @__PURE__ */ React.createElement(Path, {
		d: glyph.d,
		strokeWidth
	}));
}
//#endregion
//#region src/NumberInput.tsx
const FONT_SIZE_TOKEN$2 = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
const PADDING_INLINE_TOKEN$1 = {
	sm: "space2",
	md: "spaceMd"
};
const PADDING_BLOCK_TOKEN$2 = {
	sm: "space1",
	md: "spaceSm"
};
const MIN_TARGET_TOKEN$1 = {
	sm: "sizeTargetMin",
	md: "sizeTargetComfortable"
};
/** PageUp/PageDown move by this many steps. */
const PAGE_STEPS$1 = 10;
const COPY$29 = {
	increment: "Increase",
	decrement: "Decrease",
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} must be a number.`,
	outOfRange: (label, min, max) => `${label} must be between ${min} and ${max}.`,
	outOfRangeMin: (label, min) => `${label} must be ${min} or more.`,
	outOfRangeMax: (label, max) => `${label} must be ${max} or less.`,
	currencyMissing: "format \"currency\" needs a currency code.",
	requiredIndicator: " (required)"
};
/** Only the two actions the adjustable role defines; their labels are the stepper copy. */
const STEP_ACTIONS = [{
	name: "increment",
	label: COPY$29.increment
}, {
	name: "decrement",
	label: COPY$29.decrement
}];
/** The locale's decimal separator, accepted alongside "." when typing. */
const LOCALE_DECIMAL = (() => {
	try {
		return new Intl.NumberFormat().formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";
	} catch {
		return ".";
	}
})();
function decimalPlaces(n) {
	const s = String(n);
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
/**
* Keeps a leading minus, digits and one decimal separator, dropping everything else rather than
* rejecting it loudly. "." counts as the decimal only when the locale's separator is absent from the
* text, so a grouped "1.234,5" reads as 1234.5 in a comma-decimal locale.
*/
function sanitizeTyped(raw) {
	const decimal = LOCALE_DECIMAL !== "." && raw.includes(LOCALE_DECIMAL) ? LOCALE_DECIMAL : ".";
	let out = "";
	let seenDecimal = false;
	for (const ch of raw) if (ch === "-" && out === "") out += ch;
	else if (ch === decimal && !seenDecimal) {
		seenDecimal = true;
		out += ".";
	} else if (ch >= "0" && ch <= "9") out += ch;
	return out;
}
function hasDigit(text) {
	return /[0-9]/.test(text);
}
/** A number once the text forms one; a lone "-" or "." is not yet a number. */
function parseTyped$1(text) {
	if (!hasDigit(text)) return;
	const n = Number(text);
	return Number.isFinite(n) ? n : void 0;
}
function isValidUnit(unit) {
	try {
		new Intl.NumberFormat(void 0, {
			style: "unit",
			unit
		});
		return true;
	} catch {
		return false;
	}
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
* accessibility actions, so the steppers and affixes are hidden from assistive
* technology; the steppers step once per tap and disable at the bounds. While focused the
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
function NumberInput({ label, name, value, defaultValue, min, max, step = 1, precision, format = "decimal", currency, unit, leadingText, trailingText, hideSteppers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, ref, onChangeText }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const inputRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [rawText, setRawTextState] = React.useState(null);
	const rawRef = React.useRef(null);
	const dirtyRef = React.useRef(false);
	const [focused, setFocused] = React.useState(false);
	const [clampMessage, setClampMessage] = React.useState(null);
	const [textInvalid, setTextInvalid] = React.useState(false);
	const setRawText = (next) => {
		rawRef.current = next;
		setRawTextState(next);
	};
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const controlled = value !== void 0;
	const currentValue = controlled ? value ?? void 0 : internalValue;
	const resolvedPrecision = Math.max(0, Math.round(precision ?? decimalPlaces(step)));
	const currencyMissing = format === "currency" && (currency === void 0 || currency === "");
	React.useEffect(() => {
		if (__DEV__ && currencyMissing) console.warn(`NumberInput: ${COPY$29.currencyMissing}`);
	}, [currencyMissing]);
	const unitValid = React.useMemo(() => format === "unit" && unit !== void 0 && unit !== "" && isValidUnit(unit), [format, unit]);
	const unitFallback = format === "unit" && unit !== void 0 && unit !== "" && !unitValid;
	const formatter = React.useMemo(() => {
		const digits = {
			minimumFractionDigits: resolvedPrecision,
			maximumFractionDigits: resolvedPrecision
		};
		if (format === "currency") return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency: currencyMissing ? "USD" : currency,
			...digits
		});
		if (format === "percent") return new Intl.NumberFormat(void 0, {
			style: "percent",
			...digits
		});
		if (unitValid) return new Intl.NumberFormat(void 0, {
			style: "unit",
			unit,
			...digits
		});
		return new Intl.NumberFormat(void 0, digits);
	}, [
		format,
		currency,
		currencyMissing,
		unit,
		unitValid,
		resolvedPrecision
	]);
	const formatNumber = (num) => formatter.format(format === "percent" ? num / 100 : num);
	const prefixText = format === "currency" || leadingText === "" ? void 0 : leadingText;
	const suffixText = trailingText !== void 0 && trailingText !== "" ? trailingText : unitFallback ? unit : void 0;
	React.useEffect(() => {
		if (typeof value !== "number") return;
		const raw = rawRef.current;
		if (raw !== null && parseTyped$1(raw) !== value) setRawText(null);
	}, [value]);
	const validateValue = (candidate, nonNumeric, rangeMessage) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate === void 0 && !nonNumeric) return COPY$29.required(label);
		if (invalid || nonNumeric) return COPY$29.invalid(label);
		return rangeMessage;
	};
	const latest = React.useRef({
		value: currentValue,
		textInvalid,
		clampMessage,
		validateValue
	});
	latest.current.value = currentValue;
	latest.current.textInvalid = textInvalid;
	latest.current.clampMessage = clampMessage;
	latest.current.validateValue = validateValue;
	const handle = React.useMemo(() => ({
		label,
		getValue: () => latest.current.value === void 0 ? void 0 : String(latest.current.value),
		validate: () => latest.current.validateValue(latest.current.value, latest.current.textInvalid, latest.current.clampMessage),
		focus: () => {
			const input = inputRef.current;
			if (input === null) return;
			input.focus();
			const node = findNodeHandle(input);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), [label]);
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
	const commitMessage = textInvalid ? COPY$29.invalid(label) : clampMessage;
	const displayedError = error !== void 0 && error !== "" ? error : formError ?? commitMessage ?? void 0;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const setNumber = (next, nonNumeric, rangeMessage) => {
		const previous = latest.current.value;
		latest.current.value = next;
		latest.current.textInvalid = nonNumeric;
		latest.current.clampMessage = rangeMessage;
		if (!controlled) setInternalValue(next);
		setTextInvalid(nonNumeric);
		setClampMessage(rangeMessage);
		if (next !== previous) onChangeText?.(next);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(next, nonNumeric, rangeMessage));
	};
	/** Moves to `target` (rounded and clamped); the display then follows the value. */
	const stepTo = (target) => {
		if (isDisabled) return;
		dirtyRef.current = false;
		setNumber(clampValue(roundToPrecision(target, resolvedPrecision), min, max), false, null);
		setRawText(null);
	};
	/** `count` steps in `direction`; from empty, up goes to `min ?? 0` and down to `max ?? 0`. */
	const stepBy = (direction, count = 1) => {
		const from = latest.current.value;
		stepTo(from === void 0 ? direction === 1 ? min ?? 0 : max ?? 0 : from + step * count * direction);
	};
	/** Rounds and clamps what was typed; a clamp that changed it is reported, never silent. */
	const commitTyped = () => {
		if (!dirtyRef.current) return;
		dirtyRef.current = false;
		const raw = rawRef.current ?? "";
		const parsed = parseTyped$1(raw);
		let final;
		let rangeMessage = null;
		if (parsed !== void 0) {
			const rounded = roundToPrecision(parsed, resolvedPrecision);
			final = clampValue(rounded, min, max);
			if (final !== rounded) {
				if (min !== void 0 && max !== void 0) rangeMessage = COPY$29.outOfRange(label, formatNumber(min), formatNumber(max));
				else if (min !== void 0) rangeMessage = COPY$29.outOfRangeMin(label, formatNumber(min));
				else if (max !== void 0) rangeMessage = COPY$29.outOfRangeMax(label, formatNumber(max));
			}
		}
		setNumber(final, raw !== "" && parsed === void 0, rangeMessage);
		setRawText(null);
	};
	const currentMessage = () => latest.current.validateValue(latest.current.value, latest.current.textInvalid, latest.current.clampMessage);
	const handleChangeText = (text) => {
		const sanitized = sanitizeTyped(text);
		dirtyRef.current = true;
		setRawText(sanitized);
		const parsed = parseTyped$1(sanitized);
		if (parsed === void 0 && sanitized !== "") return;
		setNumber(parsed, false, null);
	};
	const handleFocus = () => {
		setFocused(true);
	};
	const handleBlur = () => {
		setFocused(false);
		commitTyped();
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, currentMessage());
	};
	const handleKeyPress = (event) => {
		const key = event.nativeEvent.key;
		if (key === "ArrowUp" || key === "ArrowDown" || key === "PageUp" || key === "PageDown") {
			event.preventDefault();
			stepBy(key === "ArrowUp" || key === "PageUp" ? 1 : -1, key === "PageUp" || key === "PageDown" ? PAGE_STEPS$1 : 1);
			return;
		}
		const bound = key === "Home" ? min : key === "End" ? max : void 0;
		if (bound !== void 0) {
			event.preventDefault();
			stepTo(bound);
		}
	};
	const handleAccessibilityAction = (event) => {
		if (event.nativeEvent.actionName === "increment") stepBy(1);
		else if (event.nativeEvent.actionName === "decrement") stepBy(-1);
	};
	const handleSubmitEditing = () => {
		commitTyped();
		form?.submit();
	};
	const visibleLabel = required ? `${label}${COPY$29.requiredIndicator}` : label;
	const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[PADDING_INLINE_TOKEN$1[size]];
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[PADDING_BLOCK_TOKEN$2[size]];
	const affixGap = overrides?.affixGap ? resolveToken(t, overrides.affixGap) : t.layoutGapTight;
	const stepperGap = overrides?.stepperGap ? resolveToken(t, overrides.stepperGap) : t.layoutGapNone;
	const stepperDividerColor = overrides?.stepperDivider ? resolveToken(t, overrides.stepperDivider) : t.colorBorder;
	const stepperDividerWidth = overrides?.stepperDividerWidth ? resolveToken(t, overrides.stepperDividerWidth) : t.borderWidthThin;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const labelWeight = overrides?.labelWeight ? resolveToken(t, overrides.labelWeight) : t.fontWeightMedium;
	const helperSize = overrides?.helperSize ? resolveToken(t, overrides.helperSize) : t.fontSizeSm;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$2[size]];
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const partOpacity = isDisabled ? disabledOpacity : 1;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const inset = activeBorderWidth - borderWidth;
	const borderColor = isInvalid ? borderInvalidColor : focused ? t.colorBorderFocus : t.colorBorderStrong;
	const allowsNegative = min === void 0 || min < 0;
	const keyboardType = Platform.OS === "ios" && allowsNegative ? "numbers-and-punctuation" : "decimal-pad";
	const atMin = currentValue !== void 0 && min !== void 0 && currentValue <= min;
	const atMax = currentValue !== void 0 && max !== void 0 && currentValue >= max;
	const formattedValue = currentValue === void 0 ? void 0 : formatNumber(currentValue);
	const valueText = formattedValue === void 0 ? void 0 : `${prefixText ?? ""}${formattedValue}${suffixText !== void 0 ? ` ${suffixText}` : ""}`;
	const displayValue = focused ? rawText ?? (currentValue === void 0 ? "" : String(currentValue)) : formattedValue ?? "";
	const containerStyle = {
		flexDirection: "column",
		gap: partGap
	};
	const fieldStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		minHeight: t[MIN_TARGET_TOKEN$1[size]],
		backgroundColor: t.colorBackground,
		borderWidth: activeBorderWidth,
		borderColor,
		borderRadius: radius,
		overflow: "hidden"
	};
	const contentStyle = {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: affixGap,
		paddingStart: Math.max(0, paddingInline - inset),
		paddingEnd: hideSteppers ? Math.max(0, paddingInline - inset) : 0,
		paddingVertical: Math.max(0, paddingBlock - inset),
		opacity: partOpacity
	};
	const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const labelStyle = {
		color: t.colorForeground,
		fontFamily,
		fontSize,
		lineHeight,
		fontWeight: toFontWeight(labelWeight)
	};
	const affixStyle = {
		color: t.colorForegroundMuted,
		fontFamily,
		fontSize,
		lineHeight
	};
	const errorStyle = {
		color: t.colorForegroundDanger,
		fontFamily,
		fontSize: helperSize,
		lineHeight: toLineHeight(helperSize, lineHeightMultiplier)
	};
	const inputStyle = {
		flex: 1,
		padding: 0,
		color: t.colorForeground,
		fontFamily,
		fontSize,
		lineHeight
	};
	const steppersStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		gap: stepperGap,
		borderStartWidth: stepperDividerWidth,
		borderStartColor: stepperDividerColor
	};
	const helperOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.helperSize,
		lineHeight: overrides?.lineHeight
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		style: containerStyle,
		testID: "NumberInput"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(Text$1, {
		testID: "NumberInput.label",
		style: [labelStyle, { opacity: partOpacity }]
	}, visibleLabel), description !== void 0 && description !== "" ? /* @__PURE__ */ React.createElement(View, {
		testID: "NumberInput.description",
		style: { opacity: partOpacity }
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, {
		style: fieldStyle,
		testID: "NumberInput.field"
	}, /* @__PURE__ */ React.createElement(View, { style: contentStyle }, prefixText !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		testID: "NumberInput.prefix",
		style: affixStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, prefixText) : null, /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		testID: "NumberInput.input",
		accessibilityRole: "adjustable",
		accessibilityLabel: accessibleName,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		accessibilityValue: {
			min,
			max,
			now: currentValue,
			text: valueText
		},
		accessibilityActions: STEP_ACTIONS,
		onAccessibilityAction: handleAccessibilityAction,
		keyboardType,
		autoComplete: "off",
		autoCorrect: false,
		allowFontScaling: true,
		editable: !isDisabled,
		value: displayValue,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		returnKeyType: form === null ? void 0 : "done",
		submitBehavior: form === null ? "submit" : "blurAndSubmit",
		onSubmitEditing: handleSubmitEditing,
		onChangeText: handleChangeText,
		onKeyPress: handleKeyPress,
		onFocus: handleFocus,
		onBlur: handleBlur,
		style: inputStyle
	}), suffixText !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		testID: "NumberInput.suffix",
		style: affixStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, suffixText) : null), hideSteppers ? null : /* @__PURE__ */ React.createElement(View, {
		style: steppersStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.decrementButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$29.decrement,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "minus",
			color: t.colorActionGhostForeground
		}),
		disabled: isDisabled || atMin,
		onPress: () => stepBy(-1)
	})), /* @__PURE__ */ React.createElement(View, { testID: "NumberInput.incrementButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$29.increment,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "plus",
			color: t.colorActionGhostForeground
		}),
		disabled: isDisabled || atMax,
		onPress: () => stepBy(1)
	})))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		testID: "NumberInput.errorMessage",
		style: errorStyle,
		accessibilityLiveRegion: summarised ? "none" : "assertive"
	}, displayedError) : null);
}
//#endregion
//#region src/Link.tsx
const COPY$28 = { externalSuffix: " (opens in new tab)" };
/** `copy.externalSuffix`, exposed so composites (e.g. `Card`) can reproduce a Link's accessible name when they move it onto a wrapping element. */
const LINK_EXTERNAL_SUFFIX = COPY$28.externalSuffix;
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
	const handlePress = () => {
		if (onPress?.(href) === false) return;
		if (external || onPress === void 0) Promise.resolve(Linking.openURL(href)).catch(() => void 0);
	};
	const forwardedProps = {
		onFocus,
		onBlur,
		onHoverIn,
		onHoverOut
	};
	const typography = nested ? { textDecorationLine: "underline" } : {
		textDecorationLine: "underline",
		fontFamily: t.fontFamilyBody,
		fontWeight: toFontWeight(t.fontWeightRegular),
		fontSize: t.fontSizeMd,
		lineHeight: toLineHeight(t.fontSizeMd, t.fontLineHeightNormal)
	};
	const colorStyle = tone === "inherit" ? nested ? null : { color: t.colorForeground } : { color: animatedColor };
	return /* @__PURE__ */ React.createElement(Animated.Text, {
		testID: "Link",
		accessibilityRole: "link",
		accessibilityLabel: accessibilityLabel ?? (external ? `${label}${COPY$28.externalSuffix}` : label),
		accessibilityHint,
		allowFontScaling: true,
		onPress: handlePress,
		onPressIn: () => setPressed(true),
		onPressOut: () => setPressed(false),
		onLongPress,
		...forwardedProps,
		style: [typography, colorStyle]
	}, label, external ? " " : null, external ? /* @__PURE__ */ React.createElement(Icon, {
		name: "external",
		inline: true,
		color: tone === "inherit" ? void 0 : pressed ? t.colorLinkHover : t.colorLink
	}) : null);
}
//#endregion
//#region src/Form.tsx
/** copy.* — used verbatim. `summaryHeading` is selected by `Intl.PluralRules` on `count`; `summaryHeadingOne` and `invalidSummary` are not rendered on RN. */
const COPY$27 = {
	summaryHeading: {
		one: "1 problem with this form",
		other: "{count} problems with this form"
	},
	summaryHeadingOne: "1 problem with this form",
	invalidSummary: "This form has errors."
};
function summaryHeading(count, locale) {
	return (new Intl.PluralRules(locale).select(count) === "one" ? COPY$27.summaryHeading.one : COPY$27.summaryHeading.other).replace("{count}", String(count));
}
/** Null, empty-string and empty-array values contribute no key. */
function isEmptyValue(value) {
	return value === void 0 || value === null || value === "" || Array.isArray(value) && value.length === 0;
}
/**
* Form — the container that makes fields behave as a group.
*
* When to use: Use Form whenever two or more fields are submitted together, and for
* any single field whose submission has consequences (sign-in, search with side
* effects). Pass the submit and cancel Buttons in `actions`, primary first. Give
* the form a `label` when the screen contains more than one.
*
* React Native has no form element. Form renders a `View` with `role="form"` (a
* landmark only on react-native-web) and `accessibilityLabel`, and provides a context;
* each field calls `register(name, { label, getValue, validate, focus })` in mount order
* (disabled fields do not register), a Button with `type: submit` calls `submit()`,
* non-last Inputs get `returnKeyType="next"` and the last one's return key submits.
* On a failed submission the error summary is announced (`accessibilityLiveRegion=
* "assertive"` on Android, `announceForAccessibility` on iOS: the heading followed by
* each item) and accessibility focus moves to the summary heading when `errorSummary`
* is on, otherwise to the first invalid field. Each summary item is a `Link`
* (`tone: inherit`, nested in a danger Text) that focuses its field and never navigates.
*/
function Form({ children, actions, name: _name, label, validate = "submit", disabled = false, errorSummary = true, overrides, ref, onSubmit, onInvalid }) {
	const { tokens: t } = useTheme();
	const handles = React.useRef(/* @__PURE__ */ new Map());
	const orderRef = React.useRef([]);
	const [order, setOrder] = React.useState([]);
	const [errors, setErrors] = React.useState({});
	const [submitFailed, setSubmitFailed] = React.useState(false);
	const submitFailedRef = React.useRef(false);
	const [summaryOrder, setSummaryOrder] = React.useState([]);
	const [pluralLocale, setPluralLocale] = React.useState(void 0);
	const [failedAttempt, setFailedAttempt] = React.useState(0);
	const headingRef = React.useRef(null);
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
		if (error !== null && submitFailedRef.current) setSummaryOrder((prev) => prev.includes(fieldName) ? prev : [...prev, fieldName]);
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
			if (!isEmptyValue(value)) values[fieldName] = value;
		}
		setErrors(nextErrors);
		if (firstInvalid !== null) {
			submitFailedRef.current = true;
			setSubmitFailed(true);
			setSummaryOrder(orderRef.current.filter((fieldName) => fieldName in nextErrors));
			setPluralLocale(new Intl.PluralRules().resolvedOptions().locale);
			latest.current.onInvalid?.(nextErrors);
			if (latest.current.errorSummary) setFailedAttempt((attempt) => attempt + 1);
			else firstInvalid.focus();
			return;
		}
		submitFailedRef.current = false;
		setSubmitFailed(false);
		setSummaryOrder([]);
		latest.current.onSubmit?.(values);
	}, []);
	const focusField = React.useCallback((fieldName) => {
		handles.current.get(fieldName)?.focus();
	}, []);
	const validateMode = submitFailed ? "change" : validate;
	const contextValue = React.useMemo(() => ({
		register,
		unregister,
		submit,
		focusField,
		reportValidity,
		disabled,
		validateMode,
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
		validateMode,
		errorSummary,
		errors,
		order
	]);
	const errorEntries = summaryOrder.filter((fieldName) => errors[fieldName] !== void 0 && handles.current.has(fieldName)).map((fieldName) => {
		const message = errors[fieldName] ?? "";
		const fieldLabel = handles.current.get(fieldName)?.label ?? "";
		return [fieldName, message !== "" ? message : fieldLabel !== "" ? fieldLabel : fieldName];
	});
	const showSummary = errorSummary && submitFailed && errorEntries.length > 0;
	const heading = summaryHeading(errorEntries.length, pluralLocale);
	const announcementRef = React.useRef("");
	announcementRef.current = showSummary ? [heading, ...errorEntries.map(([, text]) => text)].join(". ") : "";
	React.useEffect(() => {
		if (failedAttempt === 0) return;
		const node = findNodeHandle(headingRef.current);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		if (Platform.OS === "ios" && announcementRef.current !== "") AccessibilityInfo.announceForAccessibility(announcementRef.current);
	}, [failedAttempt]);
	const styles = React.useMemo(() => {
		const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.layoutGapLoose;
		return {
			container: {
				flexDirection: "column",
				gap
			},
			fields: {
				flexDirection: "column",
				gap
			},
			summary: {
				borderStyle: "solid",
				borderWidth: overrides?.errorSummaryBorderWidth ? resolveToken(t, overrides.errorSummaryBorderWidth) : t.borderWidthThin,
				borderColor: overrides?.errorSummaryBorder ? resolveToken(t, overrides.errorSummaryBorder) : t.colorBorderDanger,
				borderRadius: overrides?.errorSummaryRadius ? resolveToken(t, overrides.errorSummaryRadius) : t.radiusMd,
				backgroundColor: t.colorBackgroundSubtle,
				padding: overrides?.errorSummaryPadding ? resolveToken(t, overrides.errorSummaryPadding) : t.spaceMd
			}
		};
	}, [
		t,
		overrides?.gap,
		overrides?.errorSummaryBorder,
		overrides?.errorSummaryBorderWidth,
		overrides?.errorSummaryRadius,
		overrides?.errorSummaryPadding
	]);
	const summaryGapOverrides = { gap: overrides?.errorSummaryGap };
	return /* @__PURE__ */ React.createElement(FormContext.Provider, { value: contextValue }, /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Form",
		role: "form",
		accessibilityLabel: label,
		accessibilityState: { disabled },
		style: styles.container
	}, showSummary ? /* @__PURE__ */ React.createElement(View, {
		testID: "Form.errorSummary",
		accessibilityLiveRegion: "assertive",
		style: styles.summary
	}, /* @__PURE__ */ React.createElement(Stack, {
		gap: "tight",
		overrides: summaryGapOverrides
	}, /* @__PURE__ */ React.createElement(Text, {
		ref: headingRef,
		tone: "danger",
		weight: "semibold"
	}, heading), /* @__PURE__ */ React.createElement(Stack, {
		gap: "tight",
		overrides: summaryGapOverrides
	}, errorEntries.map(([fieldName, text]) => /* @__PURE__ */ React.createElement(Text, {
		key: fieldName,
		tone: "danger"
	}, /* @__PURE__ */ React.createElement(Link, {
		href: fieldName,
		label: text,
		tone: "inherit",
		onPress: () => {
			handles.current.get(fieldName)?.focus();
			return false;
		}
	})))))) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Form.fields",
		style: styles.fields
	}, children), /* @__PURE__ */ React.createElement(View, { testID: "Form.actions" }, actions)));
}
//#endregion
//#region src/Box.tsx
const INSET_TOKEN = {
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
function Box({ children, inset = "none", insetBlock, insetInline, surface = "none", border = false, radius = "none", overrides, ref }) {
	const { tokens: t } = useTheme();
	const style = React.useMemo(() => {
		const blockInset = insetBlock ?? inset;
		const inlineInset = insetInline ?? inset;
		const next = {
			paddingVertical: overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[INSET_TOKEN[blockInset]],
			paddingHorizontal: overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[INSET_TOKEN[inlineInset]],
			borderRadius: radius !== "none" && overrides?.radius ? resolveToken(t, overrides.radius) : t[RADIUS_TOKEN[radius]]
		};
		next.backgroundColor = surface === "none" ? "transparent" : t[SURFACE_TOKEN[surface]];
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
		ref,
		style,
		testID: "Box"
	}, children);
}
//#endregion
//#region src/Checkbox.tsx
const COPY$26 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)"
};
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
* and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`,
* containing the drawn control (the `check`/`dash` `Icon`) and the label and
* description, so the whole row — control, label or description — is the hit area and
* never drops below the comfortable target. Space on a hardware keyboard is handled by
* the platform once the role is set. The fill, border and indicator cross-fade over
* `transition` with `motion.easing.standard` (skipped under reduced motion); while
* pressed an unchecked, enabled box shows the selected fill at `pressedOverlay`.
* Toggling an indeterminate checkbox clears the mixed state until `indeterminate`
* changes value again. Inside a Form the control registers by `name` and submits its
* checked state as a boolean (`value` is not used on native); the error slot shows
* `error`, else the Form's message, else — only while `invalid` — `copy.required`
* (required and unchecked) or `copy.invalid`, as in Input, and `validate: blur` means
* on change. `disabledOpacity` dims the control and label, not the description or
* error. The row has no vertical padding: it is at least `size.target.comfortable`
* tall and centers the control and text column.
* Inside a Fieldset the group's `disabled` applies and the legend prefixes the
* accessibility label. Errors are announced as in Input.
*/
function Checkbox({ label, hideLabel = false, name, value = "on", checked, defaultChecked = false, indeterminate = false, disabled = false, required = false, invalid = false, description, error, overrides, onChange, ref }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const reducedMotion = useReducedMotion();
	const pressableRef = React.useRef(null);
	const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
	const [mixedCleared, setMixedCleared] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	React.useEffect(() => {
		setMixedCleared(false);
	}, [indeterminate]);
	const isChecked = checked ?? internalChecked;
	const isMixed = indeterminate && !mixedCleared;
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const formError = form?.errors[name];
	const derivedError = invalid ? required && !isChecked ? COPY$26.required(label) : COPY$26.invalid(label) : void 0;
	const displayedError = error !== void 0 && error !== "" ? error : formError ?? derivedError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && !candidate) return COPY$26.required(label);
		if (invalid) return COPY$26.invalid(label);
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
		getValue: () => latest.current.isChecked,
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
		if (isMixed) setMixedCleared(true);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
	};
	const visibleLabel = required ? `${label}${COPY$26.requiredIndicator}` : label;
	const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
	const filled = isChecked || isMixed;
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
	const rootStyle = {
		flexDirection: "column",
		gap: partGap
	};
	const rowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap,
		minHeight: t.sizeTargetComfortable
	};
	const dimStyle = { opacity: isDisabled ? disabledOpacity : 1 };
	const controlStyle = {
		width: controlSize,
		height: controlSize,
		borderRadius: controlRadius,
		borderWidth: focused ? t.borderWidthFocus : controlBorderWidth,
		borderColor: focused ? t.colorBorderFocus : isInvalid ? controlBorderInvalid : animatedBorderColor,
		backgroundColor: animatedBackground,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		opacity: dimStyle.opacity
	};
	const overlayStyle = ({ pressed }) => ({
		...StyleSheet.absoluteFill,
		backgroundColor: t.colorControlSelectedBackground,
		opacity: pressed && !filled && !isDisabled ? pressedOverlay : 0
	});
	const indicatorStyle = { opacity: fillAnim };
	const textColumnStyle = {
		flex: 1,
		flexDirection: "column",
		gap: partGap
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Checkbox",
		style: rootStyle
	}, /* @__PURE__ */ React.createElement(Pressable, {
		ref: pressableRef,
		accessibilityRole: "checkbox",
		accessibilityLabel: accessibleName,
		accessibilityHint: description,
		accessibilityState: {
			checked: isMixed ? "mixed" : isChecked,
			disabled: isDisabled
		},
		onPress: handlePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: rowStyle
	}, (state) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Checkbox.control",
		style: controlStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(View, { style: overlayStyle(state) }), /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Checkbox.indicator",
		style: indicatorStyle
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: isMixed ? "dash" : "check",
		size: "xs",
		color: t.colorControlSelectedForeground
	}))), /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, hideLabel ? null : /* @__PURE__ */ React.createElement(View, {
		testID: "Checkbox.label",
		style: dimStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		weight: "regular",
		tone: "default",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.labelSize,
			fontWeight: overrides?.labelWeight
		}
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Checkbox.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "Checkbox.errorMessage"
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
* Uses the native `Switch` with `accessibilityRole="switch"`, `accessibilityLabel`,
* `accessibilityHint={description}`, `accessibilityState={{ checked, disabled }}`,
* `trackColor={{ false: trackOff, true: trackOn }}`, `thumbColor` and
* `ios_backgroundColor={trackOff}`. The row is a `Pressable` with `accessible={false}`
* that toggles the value, so label and description are part of the target while the
* Switch stays the single focusable element; the row is at least the comfortable
* target tall, with the track at its top, centred on the label's first line. Track and thumb sizes, radius, thumb travel, its animation (and reduced
* motion) and the focus indicator are the OS values. With `name` inside a Form the
* switch registers and contributes a boolean; it has no error state by design. Inside
* a Fieldset the group's `disabled` applies and the legend prefixes the label.
*/
function Switch({ label, name, checked, defaultChecked = false, disabled = false, description, labelPosition = "start", overrides, onValueChange, ref }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const switchRef = React.useRef(null);
	const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
	const isChecked = checked ?? internalChecked;
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const accessibleName = fieldset !== null ? `${fieldset.legend}, ${label}` : label;
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
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.space3;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const labelSize = overrides?.labelSize ? resolveToken(t, overrides.labelSize) : t.fontSizeMd;
	const lineHeight = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const rowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap,
		minHeight: t.sizeTargetComfortable,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const trackSlotStyle = {
		height: toLineHeight(labelSize, lineHeight),
		justifyContent: "center"
	};
	const textColumnStyle = {
		flex: 1,
		flexDirection: "column",
		gap: partGap
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	};
	const helperOverrides = {
		...typographyOverrides,
		fontSize: overrides?.helperSize
	};
	const labelColumn = /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, /* @__PURE__ */ React.createElement(View, { testID: "Switch.label" }, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		weight: "regular",
		tone: "default",
		overrides: {
			...typographyOverrides,
			fontSize: overrides?.labelSize,
			fontWeight: overrides?.labelWeight
		}
	}, label)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Switch.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null);
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref,
		testID: "Switch",
		accessible: false,
		onPress: () => setValue(!isChecked),
		style: rowStyle
	}, labelPosition === "start" ? labelColumn : null, /* @__PURE__ */ React.createElement(View, { style: trackSlotStyle }, /* @__PURE__ */ React.createElement(Switch$1, {
		ref: switchRef,
		testID: "Switch.track",
		accessibilityRole: "switch",
		accessibilityLabel: accessibleName,
		accessibilityHint: description,
		accessibilityState: {
			checked: isChecked,
			disabled: isDisabled
		},
		value: isChecked,
		disabled: isDisabled,
		trackColor: {
			false: t.colorControlTrackOff,
			true: t.colorControlSelectedBackground
		},
		thumbColor: t.colorControlSelectedForeground,
		ios_backgroundColor: t.colorControlTrackOff,
		onValueChange: setValue
	})), labelPosition === "end" ? labelColumn : null);
}
//#endregion
//#region src/RadioGroup.tsx
const COPY$25 = {
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	requiredIndicator: " (required)",
	position: (index, total) => `${index} of ${total}`
};
/** One option row: the whole row is the Pressable, so the control, label and description are all the hit area. */
function Radio({ option, index, total, selected, optionDisabled, invalid, radioRef, onSelect, sizes, labelOverrides, helperOverrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [focused, setFocused] = React.useState(false);
	const selectAnim = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = selected ? 1 : 0;
		if (reducedMotion) {
			selectAnim.setValue(toValue);
			return;
		}
		Animated.timing(selectAnim, {
			toValue,
			duration: sizes.transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		selected,
		reducedMotion,
		selectAnim,
		sizes.transitionDuration,
		t.motionEasingStandard
	]);
	const rowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: sizes.optionGap,
		minHeight: t.sizeTargetComfortable,
		paddingVertical: sizes.optionPaddingBlock,
		opacity: optionDisabled ? sizes.disabledOpacity : 1
	};
	const controlStyle = {
		width: sizes.controlSize,
		height: sizes.controlSize,
		borderRadius: sizes.controlRadius,
		borderWidth: focused ? t.borderWidthFocus : sizes.controlBorderWidth,
		borderColor: focused ? t.colorBorderFocus : invalid ? sizes.controlBorderInvalid : selectAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [t.colorControlBorder, t.colorControlSelectedBackground]
		}),
		backgroundColor: t.colorControlBackground,
		alignItems: "center",
		justifyContent: "center"
	};
	const dotSize = sizes.controlSize - 2 * t.space1;
	const dotStyle = {
		width: dotSize,
		height: dotSize,
		borderRadius: sizes.controlRadius,
		backgroundColor: t.colorControlSelectedBackground,
		opacity: selectAnim
	};
	const textColumnStyle = {
		flexShrink: 1,
		flexDirection: "column",
		gap: sizes.optionTextGap
	};
	const accessibleName = option.description !== void 0 ? `${option.label}, ${option.description}` : option.label;
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: radioRef,
		testID: "RadioGroup.radio",
		accessibilityRole: "radio",
		accessibilityLabel: accessibleName,
		accessibilityState: {
			checked: selected,
			disabled: optionDisabled
		},
		accessibilityValue: { text: COPY$25.position(index, total) },
		onPress: () => {
			if (!optionDisabled) onSelect(option.value);
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: rowStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: controlStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "RadioGroup.radioIndicator",
		style: dotStyle
	})), /* @__PURE__ */ React.createElement(View, { style: textColumnStyle }, /* @__PURE__ */ React.createElement(View, { testID: "RadioGroup.radioLabel" }, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		weight: "regular",
		tone: "default",
		overrides: labelOverrides
	}, option.label)), option.description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "RadioGroup.radioDescription" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, option.description)) : null));
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
function RadioGroup({ label, name, options, value, defaultValue, orientation = "vertical", required = false, invalid = false, disabled = false, description, error, overrides, onChange, ref }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const firstEnabledRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const currentValue = value !== void 0 ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const formError = form?.errors[name];
	const derivedError = invalid ? required && currentValue === void 0 ? COPY$25.required(label) : COPY$25.invalid(label) : void 0;
	const displayedError = error !== void 0 && error !== "" ? error : formError ?? derivedError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && candidate === void 0) return COPY$25.required(label);
		if (invalid) return COPY$25.invalid(label);
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
			const node = firstEnabledRef.current === null ? null : findNodeHandle(firstEnabledRef.current);
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
	const visibleLabel = required ? `${label}${COPY$25.requiredIndicator}` : label;
	const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;
	const firstEnabledValue = options.find((option) => option.disabled !== true)?.value;
	const sizes = {
		controlBorderWidth: overrides?.controlBorderWidth ? resolveToken(t, overrides.controlBorderWidth) : t.borderWidthThin,
		controlBorderInvalid: overrides?.controlBorderInvalid ? resolveToken(t, overrides.controlBorderInvalid) : t.colorBorderDanger,
		controlSize: overrides?.controlSize ? resolveToken(t, overrides.controlSize) : t.space5,
		controlRadius: overrides?.controlRadius ? resolveToken(t, overrides.controlRadius) : t.radiusFull,
		optionPaddingBlock: overrides?.optionPaddingBlock ? resolveToken(t, overrides.optionPaddingBlock) : t.space1,
		optionTextGap: overrides?.optionTextGap ? resolveToken(t, overrides.optionTextGap) : t.space1,
		optionGap: overrides?.optionGap ? resolveToken(t, overrides.optionGap) : t.space2,
		disabledOpacity: overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled,
		transitionDuration: overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast
	};
	const listGap = overrides?.listGap ? resolveToken(t, overrides.listGap) : t.space2;
	const groupStyle = {
		flexDirection: "column",
		gap: overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1
	};
	const listStyle = {
		flexDirection: orientation === "horizontal" ? "row" : "column",
		flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
		gap: listGap
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
		ref,
		testID: "RadioGroup",
		accessibilityRole: "radiogroup",
		accessibilityLabel: accessibleName,
		accessibilityHint: description,
		accessibilityState: { disabled: isDisabled },
		style: groupStyle
	}, /* @__PURE__ */ React.createElement(View, { testID: "RadioGroup.legend" }, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		weight: "medium",
		tone: "default",
		overrides: legendOverrides
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "RadioGroup.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, { style: listStyle }, options.map((option, index) => /* @__PURE__ */ React.createElement(Radio, {
		key: option.value,
		option,
		index: index + 1,
		total: options.length,
		selected: option.value === currentValue,
		optionDisabled: isDisabled || option.disabled === true,
		invalid: isInvalid,
		radioRef: option.value === firstEnabledValue ? firstEnabledRef : void 0,
		onSelect: select,
		sizes,
		labelOverrides,
		helperOverrides
	}))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "RadioGroup.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null);
}
//#endregion
//#region src/Disclosure.tsx
/** Chevron rotation: pointing along the reading direction when closed, down when open. */
const CHEVRON_CLOSED = "0deg";
const CHEVRON_OPEN = "90deg";
/** `chevron-left` points the other way, so it turns the other way to land on the same down-pointing shape. */
const CHEVRON_OPEN_RTL = "-90deg";
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
function Disclosure({ summary, children, open, defaultOpen = false, disabled = false, keepMounted = false, headingLevel, onToggle, overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const rtl = I18nManager.isRTL;
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
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
		if (isControlled && previousOpenRef.current !== isOpen && selfEmittedRef.current !== isOpen) onToggle?.(isOpen, "controlled");
		selfEmittedRef.current = null;
		previousOpenRef.current = isOpen;
	}, [isOpen, isControlled]);
	const triggerPaddingBlock = overrides?.triggerPaddingBlock ? resolveToken(t, overrides.triggerPaddingBlock) : t.spaceSm;
	const triggerPaddingInline = overrides?.triggerPaddingInline ? resolveToken(t, overrides.triggerPaddingInline) : t.spaceSm;
	const triggerGap = overrides?.triggerGap ? resolveToken(t, overrides.triggerGap) : t.space2;
	const triggerFontFamily = overrides?.triggerFontFamily ? resolveToken(t, overrides.triggerFontFamily) : t.fontFamilyBody;
	const triggerFontSize = overrides?.triggerFontSize ? resolveToken(t, overrides.triggerFontSize) : t.fontSizeMd;
	const triggerFontWeight = overrides?.triggerFontWeight ? resolveToken(t, overrides.triggerFontWeight) : t.fontWeightMedium;
	const triggerRadius = overrides?.triggerRadius ? resolveToken(t, overrides.triggerRadius) : t.radiusMd;
	const panelPaddingBlock = overrides?.panelPaddingBlock ? resolveToken(t, overrides.panelPaddingBlock) : t.spaceSm;
	const panelPaddingInline = overrides?.panelPaddingInline ? resolveToken(t, overrides.panelPaddingInline) : t.spaceSm;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationBase;
	const animationReadyRef = React.useRef(false);
	React.useEffect(() => {
		const toValue = isOpen ? 1 : 0;
		if (reducedMotion || !animationReadyRef.current) {
			animationReadyRef.current = true;
			rotation.setValue(toValue);
			return;
		}
		Animated.timing(rotation, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: Platform.OS !== "web"
		}).start();
	}, [
		isOpen,
		reducedMotion,
		rotation,
		transitionDuration,
		t.motionEasingStandard
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
		minHeight: t.sizeTargetMin,
		minWidth: t.sizeTargetMin,
		paddingVertical: triggerPaddingBlock,
		paddingHorizontal: triggerPaddingInline,
		borderRadius: triggerRadius,
		backgroundColor: (pressed || hovered) && !disabled ? t.colorBackgroundSubtle : "transparent",
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : "transparent",
		opacity: disabled ? disabledOpacity : 1
	});
	const summaryStyle = {
		fontFamily: triggerFontFamily,
		fontSize: triggerFontSize,
		fontWeight: toFontWeight(triggerFontWeight),
		lineHeight: toLineHeight(triggerFontSize, t.fontLineHeightNormal),
		color: t.colorForeground,
		flexShrink: 1
	};
	const chevronStyle = { transform: [{ rotate: rotation.interpolate({
		inputRange: [0, 1],
		outputRange: [CHEVRON_CLOSED, rtl ? CHEVRON_OPEN_RTL : CHEVRON_OPEN]
	}) }] };
	const panelStyle = {
		paddingVertical: panelPaddingBlock,
		paddingHorizontal: panelPaddingInline,
		display: isOpen ? "flex" : "none"
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Disclosure"
	}, /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Disclosure.trigger",
		accessibilityRole: "button",
		accessibilityLabel: summary,
		accessibilityState: {
			expanded: isOpen,
			disabled
		},
		onPress: handlePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		style: triggerStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Disclosure.triggerIcon",
		style: chevronStyle
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: rtl ? "chevron-left" : "chevron-right",
		color: t.colorForegroundMuted,
		overrides: { size: overrides?.triggerFontSize ?? "font.size.md" }
	})), /* @__PURE__ */ React.createElement(Text$1, {
		accessibilityRole: headingLevel !== void 0 ? "header" : void 0,
		style: summaryStyle
	}, summary)), isOpen || keepMounted ? /* @__PURE__ */ React.createElement(View, {
		testID: "Disclosure.panel",
		style: panelStyle,
		accessibilityElementsHidden: !isOpen,
		importantForAccessibility: isOpen ? "auto" : "no-hide-descendants"
	}, typeof children === "string" || typeof children === "number" ? /* @__PURE__ */ React.createElement(Text, null, children) : children) : null);
}
//#endregion
//#region src/Alert.tsx
const COPY$24 = { dismissLabel: "Dismiss" };
const TONE_TOKENS = {
	info: {
		background: "colorStatusInfoBackground",
		foreground: "colorStatusInfoForeground",
		border: "colorStatusInfoBorder"
	},
	success: {
		background: "colorStatusSuccessBackground",
		foreground: "colorStatusSuccessForeground",
		border: "colorStatusSuccessBorder"
	},
	warning: {
		background: "colorStatusWarningBackground",
		foreground: "colorStatusWarningForeground",
		border: "colorStatusWarningBorder"
	},
	danger: {
		background: "colorStatusDangerBackground",
		foreground: "colorStatusDangerForeground",
		border: "colorStatusDangerBorder"
	}
};
/** `icon` binding, forwarded to the Icon as `overrides.color`. */
const ICON_COLOR = {
	info: "color.status.info.icon",
	success: "color.status.success.icon",
	warning: "color.status.warning.icon",
	danger: "color.status.danger.icon"
};
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
function Alert({ tone = "info", heading, children, live = "status", dismissible = false, overrides, onDismiss, ref }) {
	const { tokens: t } = useTheme();
	const colors = TONE_TOKENS[tone];
	const border = overrides?.border ? resolveToken(t, overrides.border) : t[colors.border];
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const padding = overrides?.padding ? resolveToken(t, overrides.padding) : t.spaceMd;
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.space3;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const iconSizeRef = overrides?.iconSize ?? "font.size.lg";
	const iconSize = resolveToken(t, iconSizeRef);
	const headingSize = overrides?.headingSize ? resolveToken(t, overrides.headingSize) : t.fontSizeMd;
	const headingWeight = overrides?.headingWeight ? resolveToken(t, overrides.headingWeight) : t.fontWeightSemibold;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const dismissMargin = overrides?.dismissMargin ? resolveToken(t, overrides.dismissMargin) : t.space1;
	const isTextBody = typeof children === "string" || typeof children === "number";
	const announcement = [heading, isTextBody ? String(children) : void 0].filter((part) => part !== void 0 && part !== "").join(". ");
	React.useEffect(() => {
		if (Platform.OS === "ios" && live !== "off" && announcement !== "") AccessibilityInfo.announceForAccessibility(announcement);
	}, [announcement, live]);
	const bodyLineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const headingLineHeight = toLineHeight(headingSize, lineHeightMultiplier);
	const containerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap,
		padding,
		borderWidth,
		borderColor: border,
		borderRadius: radius,
		backgroundColor: t[colors.background]
	};
	const iconCellStyle = {
		height: Math.max(heading !== void 0 ? headingLineHeight : bodyLineHeight, iconSize),
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
		color: t[colors.foreground]
	};
	const bodyOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const dismissStyle = {
		marginTop: -dismissMargin,
		marginEnd: -dismissMargin
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Alert",
		accessibilityRole: live === "alert" ? "alert" : void 0,
		accessibilityLiveRegion: live === "alert" ? "assertive" : live === "status" ? "polite" : void 0,
		accessibilityLabel: announcement !== "" ? announcement : void 0,
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Alert.icon",
		style: iconCellStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: tone,
		overrides: {
			color: ICON_COLOR[tone],
			size: iconSizeRef
		}
	})), /* @__PURE__ */ React.createElement(View, { style: contentStyle }, heading !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		testID: "Alert.heading",
		allowFontScaling: true,
		style: headingStyle
	}, heading) : null, /* @__PURE__ */ React.createElement(View, { testID: "Alert.body" }, isTextBody ? /* @__PURE__ */ React.createElement(Text, { overrides: bodyOverrides }, children) : children)), dismissible ? /* @__PURE__ */ React.createElement(View, {
		testID: "Alert.dismissButton",
		style: dismissStyle
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$24.dismissLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			overrides: { color: "color.action.ghost.foreground" }
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
* `accessible`, so its children stay individually reachable. A View cannot hold a
* raw string, so string and number children are wrapped in `Text`. There is no
* jump-to-landmark on native — the value is web parity and one structure for the
* same screen code. In development it warns when `region` or `form` has no `label`.
*/
function Landmark({ role, label, children, ref }) {
	const name = label === "" ? void 0 : label;
	React.useEffect(() => {
		if (__DEV__ && NAME_REQUIRED_ROLES.has(role) && name === void 0) console.warn(`Landmark: role "${role}" is only a landmark when it has a label.`);
	}, [role, name]);
	const nativeRole = role === "search" ? void 0 : role;
	const legacyRole = role === "search" ? "search" : void 0;
	const content = typeof children === "string" || typeof children === "number" ? /* @__PURE__ */ React.createElement(Text, null, children) : React.Children.map(children, (child) => typeof child === "string" || typeof child === "number" ? /* @__PURE__ */ React.createElement(Text, null, child) : child);
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Landmark",
		role: nativeRole,
		accessibilityRole: legacyRole,
		accessibilityLabel: LABELLED_ROLES.has(role) ? name : void 0
	}, content);
}
//#endregion
//#region src/Breadcrumb.tsx
const COPY$23 = {
	separator: "/",
	expandLabel: "Show all pages",
	navLabel: "Breadcrumb",
	current: "current page"
};
/** Trails longer than this collapse (when `collapse` is on). */
const COLLAPSE_ABOVE = 4;
/** How many trailing items stay visible when collapsed. */
const COLLAPSED_TAIL = 2;
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
function Breadcrumb({ items, label = COPY$23.navLabel, collapse = true, overrides, onNavigate, ref }) {
	const { tokens: t } = useTheme();
	const [expanded, setExpanded] = React.useState(false);
	const firstRevealedRef = React.useRef(null);
	const focusPending = React.useRef(false);
	const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
	const tailStart = items.length - COLLAPSED_TAIL;
	const lastIndex = items.length - 1;
	React.useEffect(() => {
		if (!expanded || !focusPending.current) return;
		focusPending.current = false;
		const node = firstRevealedRef.current === null ? null : findNodeHandle(firstRevealedRef.current);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	}, [expanded]);
	const styles = React.useMemo(() => {
		const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.space2;
		const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
		const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeSm;
		const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightRegular;
		const lineHeight = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
		const text = {
			fontFamily,
			fontSize,
			fontWeight: toFontWeight(fontWeight),
			lineHeight: toLineHeight(fontSize, lineHeight)
		};
		return {
			nav: {
				flexDirection: "row",
				flexWrap: "wrap",
				alignItems: "center",
				columnGap: gap
			},
			item: {
				flexDirection: "row",
				alignItems: "center",
				columnGap: gap,
				minHeight: t.sizeTargetMin
			},
			current: {
				...text,
				color: t.colorForeground
			},
			plain: {
				...text,
				color: t.colorForegroundMuted
			},
			separator: {
				...text,
				color: t.colorForegroundMuted
			}
		};
	}, [
		t,
		overrides?.gap,
		overrides?.fontFamily,
		overrides?.fontSize,
		overrides?.fontWeight,
		overrides?.lineHeight
	]);
	const linkTextOverrides = {
		fontSize: overrides?.fontSize ?? "font.size.sm",
		fontFamily: overrides?.fontFamily ?? "font.family.body",
		fontWeight: overrides?.fontWeight ?? "font.weight.regular",
		lineHeight: overrides?.lineHeight ?? "font.lineHeight.normal"
	};
	const separator = () => /* @__PURE__ */ React.createElement(Text$1, {
		testID: "Breadcrumb.separator",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		style: styles.separator
	}, COPY$23.separator);
	const nodes = [];
	items.forEach((item, index) => {
		if (collapsed && index > 0 && index < tailStart) {
			if (index === 1) nodes.push(/* @__PURE__ */ React.createElement(View, {
				key: "expand",
				testID: "Breadcrumb.item",
				style: styles.item
			}, separator(), /* @__PURE__ */ React.createElement(View, { testID: "Breadcrumb.expand" }, /* @__PURE__ */ React.createElement(Button, {
				label: COPY$23.expandLabel,
				variant: "ghost",
				size: "sm",
				iconOnly: true,
				leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
					name: "ellipsis",
					color: t.colorActionGhostForeground
				}),
				onPress: () => {
					focusPending.current = true;
					setExpanded(true);
				}
			}))));
			return;
		}
		let content;
		if (index === lastIndex) content = /* @__PURE__ */ React.createElement(Text$1, {
			testID: "Breadcrumb.current",
			accessibilityState: { selected: true },
			accessibilityLabel: `${item.label}, ${COPY$23.current}`,
			style: styles.current
		}, item.label);
		else if (item.href === void 0 || item.href === "") content = /* @__PURE__ */ React.createElement(Text$1, { style: styles.plain }, item.label);
		else {
			const href = item.href;
			content = /* @__PURE__ */ React.createElement(View, { testID: "Breadcrumb.link" }, /* @__PURE__ */ React.createElement(Text, { overrides: linkTextOverrides }, /* @__PURE__ */ React.createElement(Link, {
				href,
				label: item.label,
				tone: "default",
				onPress: onNavigate === void 0 ? void 0 : () => onNavigate(item, index)
			})));
		}
		nodes.push(/* @__PURE__ */ React.createElement(View, {
			key: `item-${index}`,
			testID: "Breadcrumb.item",
			ref: index === 1 ? firstRevealedRef : void 0,
			style: styles.item
		}, index > 0 ? separator() : null, content));
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Breadcrumb",
		role: "navigation",
		accessibilityLabel: label,
		style: styles.nav
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
* When to use: a measurement with a fixed range — storage or quota used, battery,
* password strength, a score out of ten. The consumer decides the tone from thresholds
* it owns; the meter just paints. Not for task progress (ProgressBar, planned).
*
* Renders an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and
* `accessibilityValue={{ min, max, now: clamped, text }}`, where `text` is always set:
* `valueText`, else the rounded percentage web and Lit announce. Inside: a header row of
* two composed `Text`s and a track `View` (`overflow: 'hidden'`) holding the fill. The
* track is measured with `onLayout` and the fill's pixel width animates over `transition`
* (`useNativeDriver: false`); it snaps before the width is known, on resize, and under
* reduced motion. A non-finite `value` counts as `min`; if `max <= min` the track renders
* empty, `now` is `min`, "0%" is shown, and a warning is logged in development.
*/
function Meter({ value, min = 0, max = 100, label, valueText, tone = "info", hideValue = false, overrides, ref }) {
	const { tokens: t } = useTheme();
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
	const percentText = new Intl.NumberFormat(void 0, {
		style: "percent",
		maximumFractionDigits: 0
	}).format(fraction);
	const announcedValue = valueText ?? percentText;
	const trackHeight = overrides?.trackHeight ? resolveToken(t, overrides.trackHeight) : t.space2;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusFull;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const labelGap = overrides?.labelGap ? resolveToken(t, overrides.labelGap) : t.space2;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationBase;
	const [trackWidth, setTrackWidth] = React.useState(0);
	const fillWidth = React.useRef(new Animated.Value(0)).current;
	const laidOutWidth = React.useRef(0);
	React.useEffect(() => {
		const toValue = trackWidth * fraction;
		const resized = laidOutWidth.current !== trackWidth;
		laidOutWidth.current = trackWidth;
		if (reducedMotion || resized || trackWidth === 0) {
			fillWidth.setValue(toValue);
			return;
		}
		Animated.timing(fillWidth, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		fraction,
		trackWidth,
		reducedMotion,
		fillWidth,
		transitionDuration,
		t.motionEasingStandard
	]);
	const handleTrackLayout = (event) => {
		const { width } = event.nativeEvent.layout;
		setTrackWidth((prev) => prev === width ? prev : width);
	};
	const styles = React.useMemo(() => {
		return {
			container: {
				flexDirection: "column",
				gap: partGap
			},
			header: {
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "baseline",
				gap: labelGap
			},
			track: {
				height: trackHeight,
				borderRadius: radius,
				backgroundColor: t.colorBackgroundStrong,
				overflow: "hidden"
			}
		};
	}, [
		partGap,
		labelGap,
		trackHeight,
		radius,
		t.colorBackgroundStrong
	]);
	const fillStyle = {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: t[FILL_TOKEN$1[tone]],
		width: fillWidth,
		alignSelf: "flex-start"
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Meter",
		accessible: true,
		role: "meter",
		accessibilityLabel: label,
		accessibilityValue: {
			min,
			max,
			now: clamped,
			text: announcedValue
		},
		style: styles.container
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Meter.header",
		style: styles.header
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		weight: "medium",
		tone: "default",
		overrides: {
			fontSize: overrides?.labelSize,
			fontWeight: overrides?.labelWeight,
			fontFamily: overrides?.fontFamily,
			lineHeight: overrides?.lineHeight
		}
	}, label), hideValue ? null : /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: {
			fontSize: overrides?.valueSize,
			fontFamily: overrides?.fontFamily,
			lineHeight: overrides?.lineHeight
		}
	}, announcedValue)), /* @__PURE__ */ React.createElement(View, {
		testID: "Meter.track",
		style: styles.track,
		onLayout: handleTrackLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Meter.fill",
		style: fillStyle
	})));
}
//#endregion
//#region src/Card.tsx
const INSET = {
	sm: "layoutInsetSm",
	md: "layoutInsetMd",
	lg: "layoutInsetLg"
};
const BACKGROUND = {
	default: "colorBackground",
	subtle: "colorBackgroundSubtle"
};
/** hoverBackground: `color.background.subtle`; subtle cards use `color.background.strong`. */
const HOVER_BACKGROUND = {
	default: "colorBackgroundSubtle",
	subtle: "colorBackgroundStrong"
};
const FocusableView = View;
/** A bare string or number cannot sit in a native View: it goes inside the system Text. */
function wrapText(node, key) {
	return typeof node === "string" || typeof node === "number" ? /* @__PURE__ */ React.createElement(Text, { key }, node) : node;
}
function renderBody(children) {
	return Array.isArray(children) ? children.map((child, index) => wrapText(child, index)) : wrapText(children);
}
function targetOf(node, form) {
	if (!React.isValidElement(node)) return null;
	if (node.type === Button) {
		const props = node.props;
		const disabled = (props.disabled ?? false) || (form?.disabled ?? false);
		return {
			activate: () => {
				if (disabled || props.loading) return;
				props.onPress?.();
				if (props.track !== void 0) {
					trackPress(props.track, props.label);
					props.onTrack?.(props.track, props.label);
				}
				if (props.type === "submit") form?.submit();
			},
			role: "button",
			label: props.accessibleName ?? props.accessibilityLabel ?? props.label,
			disabled
		};
	}
	if (node.type === Link) {
		const props = node.props;
		return {
			activate: () => {
				if (props.onPress?.(props.href) === false) return;
				if (props.external || props.onPress === void 0) Promise.resolve(Linking.openURL(props.href)).catch(() => void 0);
			},
			role: "link",
			label: props.external ? `${props.label}${LINK_EXTERNAL_SUFFIX}` : props.label,
			disabled: false
		};
	}
	return null;
}
/**
* Looks for the single Link or Button among the top-level children of the body only
* (header actions, footer and nested wrappers keep their own targets). With exactly
* one, returns the body with that child made inert and hidden from assistive
* technology, so the wrapping Pressable is the one target and focus stop.
*/
function scanTopLevel(children, form) {
	const items = Array.isArray(children) ? children : [children];
	let target = null;
	let index = -1;
	let count = 0;
	for (const [i, item] of items.entries()) {
		const found = targetOf(item, form);
		if (found !== null) {
			count += 1;
			target = found;
			index = i;
		}
	}
	if (count !== 1) return {
		content: renderBody(children),
		target: null,
		count
	};
	const inert = (element, key) => /* @__PURE__ */ React.createElement(View, {
		key,
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, element);
	return {
		content: Array.isArray(children) ? items.map((item, i) => i === index ? inert(item, i) : wrapText(item, i)) : inert(children),
		target,
		count
	};
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
* assistive technology, so the Pressable is exactly one target and one focus stop. A
* disabled child reports the Pressable disabled, ignores presses and shows no hover
* background. With zero or several candidates the card renders as a plain View. The
* ring's width (`border.width.focus`) is always reserved, colored `border` on
* `surface: default` and transparent on `subtle` until focused, so focus never shifts
* the layout. Hover and press show `hoverBackground` instantly; native has no
* continuous hover to animate, so `transition` has no runtime effect.
*
* `focusable` sets `tabIndex={-1}` (scriptable, not a tab stop under react-native-web;
* on native Android `-1` means not focusable) and draws the ring on focus.
*/
function Card({ children, heading, headingLevel = "3", headerActions, footer, inset = "md", surface = "default", interactive = false, focusable = false, overrides, ref }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
	const [pressed, setPressed] = React.useState(false);
	const token = (override, fallback) => override ? resolveToken(t, override) : fallback;
	const paddingBlock = token(overrides?.paddingBlock, t[INSET[inset]]);
	const paddingInline = token(overrides?.paddingInline, t[INSET[inset]]);
	const partGap = token(overrides?.partGap, t.layoutGapLoose);
	const headerGap = token(overrides?.headerGap, t.layoutGapNormal);
	const footerGap = token(overrides?.footerGap, t.layoutGapTight);
	const actionsGap = token(overrides?.actionsGap, t.layoutGapTight);
	const radius = token(overrides?.radius, t.radiusLg);
	const borderColor = token(overrides?.border, t.colorBorder);
	const borderWidth = token(overrides?.borderWidth, t.borderWidthThin);
	const background = t[BACKGROUND[surface]];
	const hoverBackground = t[HOVER_BACKGROUND[surface]];
	const scanned = React.useMemo(() => interactive ? scanTopLevel(children, form) : {
		content: renderBody(children),
		target: null,
		count: 1
	}, [
		interactive,
		children,
		form
	]);
	const target = scanned.target;
	const isInteractive = target !== null;
	const targetDisabled = target?.disabled ?? false;
	const warnedCount = React.useRef(false);
	const warnedFocusable = React.useRef(false);
	React.useEffect(() => {
		if (!__DEV__) return;
		if (interactive && scanned.count !== 1 && !warnedCount.current) {
			warnedCount.current = true;
			console.warn(`Card: \`interactive\` requires exactly one Link or Button among the top-level children; found ${scanned.count}. The card stays non-interactive.`);
		}
		if (interactive && focusable && !warnedFocusable.current) {
			warnedFocusable.current = true;
			console.warn("Card: `focusable` has no effect while `interactive` is set; the card already has a target.");
		}
	}, [
		interactive,
		focusable,
		scanned.count
	]);
	const hasHeading = heading !== void 0 && heading !== "";
	const hasHeaderActions = headerActions !== void 0 && headerActions !== null;
	const hasFooter = footer !== void 0 && footer !== null;
	const scriptFocusable = focusable && !isInteractive;
	const ringReserved = isInteractive || scriptFocusable;
	const restingBorder = surface === "default" ? borderColor : "transparent";
	const surfaceStyle = {
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		gap: partGap,
		borderRadius: radius,
		backgroundColor: isInteractive && !targetDisabled && (hovered || pressed) ? hoverBackground : background,
		...ringReserved ? {
			borderWidth: t.borderWidthFocus,
			borderColor: focused ? t.colorBorderFocus : restingBorder
		} : surface === "default" ? {
			borderWidth,
			borderColor
		} : {}
	};
	const headerStyle = {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: hasHeading ? "space-between" : "flex-end",
		gap: headerGap
	};
	const actionsStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: actionsGap
	};
	const footerStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: footerGap
	};
	const content = /* @__PURE__ */ React.createElement(React.Fragment, null, hasHeading || hasHeaderActions ? /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "Card.header"
	}, hasHeading ? /* @__PURE__ */ React.createElement(View, { style: { flexShrink: 1 } }, /* @__PURE__ */ React.createElement(Heading, {
		level: headingLevel,
		size: "lg",
		overrides: { marginBlockEnd: "space.0" }
	}, heading)) : null, hasHeaderActions ? /* @__PURE__ */ React.createElement(View, {
		style: actionsStyle,
		testID: "Card.headerActions"
	}, headerActions) : null) : null, /* @__PURE__ */ React.createElement(View, { testID: "Card.body" }, scanned.content), hasFooter ? /* @__PURE__ */ React.createElement(View, {
		style: footerStyle,
		testID: "Card.footer"
	}, footer) : null);
	if (target === null) return /* @__PURE__ */ React.createElement(FocusableView, {
		ref,
		style: surfaceStyle,
		testID: "Card",
		...scriptFocusable ? {
			tabIndex: -1,
			onFocus: () => setFocused(true),
			onBlur: () => setFocused(false)
		} : {}
	}, content);
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref,
		accessibilityRole: target.role,
		accessibilityLabel: target.label,
		accessibilityState: { disabled: target.disabled },
		onPress: () => {
			if (!target.disabled) target.activate();
		},
		onPressIn: () => setPressed(true),
		onPressOut: () => setPressed(false),
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: surfaceStyle,
		testID: "Card"
	}, content);
}
//#endregion
//#region src/Container.tsx
const MAX_WIDTH = {
	prose: "layoutMaxWidthProse",
	content: "layoutMaxWidthContent",
	page: "layoutMaxWidthPage"
};
const GUTTER = {
	narrow: "layoutGutterNarrow",
	wide: "layoutGutterWide"
};
/**
* Container — decides a screen's horizontal rhythm once: a gutter at the viewport
* edge and a cap on how wide content can get.
*
* Renders a `View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.{width}`
* (none for `full`), `alignSelf` from `align` and `paddingHorizontal` from
* `layout.gutter.{gutter}`. The `default` gutter compares `useWindowDimensions().width`
* with the content and page max-width tokens. `element` is web and Lit only.
*/
function Container({ children, width = "content", gutter = "default", align = "center", overrides, ref }) {
	const { tokens: t } = useTheme();
	const { width: viewportWidth } = useWindowDimensions();
	const style = React.useMemo(() => {
		let maxWidth;
		if (width !== "full") maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t[MAX_WIDTH[width]];
		let paddingHorizontal;
		if (gutter === "none") paddingHorizontal = 0;
		else if (overrides?.paddingInline) paddingHorizontal = resolveToken(t, overrides.paddingInline);
		else if (gutter !== "default") paddingHorizontal = t[GUTTER[gutter]];
		else if (viewportWidth >= t.layoutMaxWidthPage) paddingHorizontal = t.layoutGutterWide;
		else if (viewportWidth >= t.layoutMaxWidthContent) paddingHorizontal = t.layoutGutter;
		else paddingHorizontal = t.layoutGutterNarrow;
		return {
			width: "100%",
			maxWidth,
			alignSelf: align === "start" ? "flex-start" : "center",
			paddingHorizontal
		};
	}, [
		t,
		width,
		gutter,
		align,
		overrides,
		viewportWidth
	]);
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		style,
		testID: "Container"
	}, children);
}
//#endregion
//#region src/Divider.tsx
const SPACING_TOKEN = {
	tight: "layoutGapTight",
	normal: "layoutGapNormal",
	loose: "layoutGapLoose"
};
/**
* Divider — a line, decorative by default. A `label` centers text between two line
* segments and makes the line meaningful rather than furniture.
*
* The line is an inner `View` `border.width.thin` thick along the cross axis in
* `color.border` (vertical: `alignSelf: 'stretch'` to the row height), inside a root `View`
* that carries `spacing` as padding on that axis. `spacing: none` renders no space, so
* `overrides.spacing` is a no-op there. There is no `separator` role on React Native:
* a decorative root hides itself and its line (`accessibilityElementsHidden` +
* `importantForAccessibility="no-hide-descendants"`); a labelled root is a row (`gap` from
* `labelGap`) of two hidden line Views around `Text size="sm" tone="muted"`, which is read.
* `labelSize`/`fontFamily` overrides reach Text's `fontSize`/`fontFamily`.
*/
function Divider({ orientation = "horizontal", label, semantic = false, spacing = "none", overrides, ref }) {
	const { tokens: t } = useTheme();
	const hasLabelText = label !== void 0 && label !== "";
	const labelIgnored = hasLabelText && orientation === "vertical";
	const labelled = hasLabelText && orientation === "horizontal";
	React.useEffect(() => {
		if (__DEV__ && labelIgnored) console.warn("Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.");
	}, [
		label,
		orientation,
		labelIgnored
	]);
	React.useEffect(() => {
		if (__DEV__ && semantic && !labelled) console.warn("Divider: `semantic` has no observable effect on React Native without a `label` — there is no native separator role, so the boundary is silent to assistive technology.");
	}, [semantic, labelled]);
	const styles = React.useMemo(() => {
		const thickness = overrides?.thickness ? resolveToken(t, overrides.thickness) : t.borderWidthThin;
		const color = overrides?.color ? resolveToken(t, overrides.color) : t.colorBorder;
		const space = spacing === "none" ? void 0 : overrides?.spacing ? resolveToken(t, overrides.spacing) : t[SPACING_TOKEN[spacing]];
		const vertical = orientation === "vertical";
		const gap = overrides?.labelGap ? resolveToken(t, overrides.labelGap) : t.layoutGapNormal;
		return {
			root: vertical ? {
				flexDirection: "row",
				alignSelf: "stretch",
				paddingHorizontal: space
			} : {
				alignSelf: "stretch",
				paddingVertical: space
			},
			labelledRoot: {
				alignSelf: "stretch",
				paddingVertical: space,
				flexDirection: "row",
				alignItems: "center",
				gap
			},
			line: vertical ? {
				width: thickness,
				alignSelf: "stretch",
				backgroundColor: color
			} : {
				height: thickness,
				backgroundColor: color
			},
			segment: {
				flex: 1,
				height: thickness,
				backgroundColor: color
			}
		};
	}, [
		t,
		orientation,
		spacing,
		overrides
	]);
	if (labelled) return /* @__PURE__ */ React.createElement(View, {
		ref,
		style: styles.labelledRoot,
		testID: "Divider"
	}, /* @__PURE__ */ React.createElement(View, {
		style: styles.segment,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "Divider.line"
	}), /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: {
			fontSize: overrides?.labelSize,
			fontFamily: overrides?.fontFamily
		}
	}, label), /* @__PURE__ */ React.createElement(View, {
		style: styles.segment,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "Divider.line"
	}));
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		style: styles.root,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		testID: "Divider"
	}, /* @__PURE__ */ React.createElement(View, {
		style: styles.line,
		testID: "Divider.line"
	}));
}
//#endregion
//#region src/FocusScope.tsx
/** Whatever `TextInput` is focused right now — the one "what is focused" React Native exposes. */
function currentlyFocusedInput() {
	try {
		return TextInput.State.currentlyFocusedInput() ?? null;
	} catch {
		return null;
	}
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
* scope therefore does not hide a nested Menu. There is no Tab order to confine on
* native, so hardware-keyboard Tab is not wrapped (a platform limit) and
* `onEscapeAttempt` never fires. `autoFocus` runs once after mount and calls
* `AccessibilityInfo.setAccessibilityFocus` on the wrapper for `first`, `last` and
* `container` alike — children cannot be walked for a focusable descendant — so the
* screen reader reads the scope from its top; only `none` skips it. `restoreFocus`
* runs once on unmount and focuses `returnFocusTo` when given, otherwise the
* `TextInput` that was focused when the scope first rendered; an opener that is
* neither cannot be restored. The wrapper sets no `role`, `accessibilityRole` or
* `accessibilityLabel`, and never handles Escape or the back button — the overlay
* owns dismissal.
*/
function FocusScope({ children, trapped = true, autoFocus = "first", restoreFocus = true, returnFocusTo, active = true, onEscapeAttempt, ref }) {
	const wrapperRef = React.useRef(null);
	React.useImperativeHandle(ref, () => wrapperRef.current, []);
	const [capturedOpener] = React.useState(() => restoreFocus && returnFocusTo === void 0 ? currentlyFocusedInput() : null);
	React.useEffect(() => {
		if (autoFocus !== "none") {
			const node = wrapperRef.current === null ? null : findNodeHandle(wrapperRef.current);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
		return () => {
			if (!restoreFocus) return;
			const opener = returnFocusTo !== void 0 ? returnFocusTo.current : capturedOpener;
			const node = opener == null ? null : findNodeHandle(opener);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		};
	}, []);
	return /* @__PURE__ */ React.createElement(View, {
		ref: wrapperRef,
		collapsable: false,
		accessibilityViewIsModal: trapped && active,
		testID: "FocusScope"
	}, children);
}
//#endregion
//#region src/Dialog.tsx
const COPY$22 = { closeLabel: "Close" };
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
*/
function Dialog({ open, heading, description, children, footer, hideHeading = false, size = "md", dismissible = true, initialFocus = "first", onClose, onOpened, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [mounted, setMounted] = React.useState(open);
	if (open && !mounted) setMounted(true);
	const progress = React.useRef(new Animated.Value(0)).current;
	const surfaceRef = React.useRef(null);
	const titleGroupRef = React.useRef(null);
	const closeButtonRef = React.useRef(null);
	const bodyRef = React.useRef(null);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
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
	const widthSm = overrides?.widthSm ? resolveToken(t, overrides.widthSm) : t.layoutMaxWidthProse;
	const widthMdBase = overrides?.widthMd ? resolveToken(t, overrides.widthMd) : t.layoutMaxWidthContent;
	const widthLg = overrides?.widthLg ? resolveToken(t, overrides.widthLg) : t.layoutMaxWidthContent;
	const sizeWidth = {
		sm: widthSm,
		md: widthMdBase * .75,
		lg: widthLg
	};
	const focusInitial = () => {
		let target;
		if (initialFocus === "title") target = hideHeading ? surfaceRef.current : titleGroupRef.current;
		else if (initialFocus === "close" && dismissible) target = closeButtonRef.current;
		else target = bodyRef.current;
		const node = target ? findNodeHandle(target) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			if (reducedMotion || enterDuration === 0) {
				progress.setValue(1);
				focusInitial();
				const frame = requestAnimationFrame(() => onOpened?.());
				return () => cancelAnimationFrame(frame);
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) {
					focusInitial();
					onOpened?.();
				}
			});
			return () => animation.stop();
		}
		if (reducedMotion || exitDuration === 0) {
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
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCloseButtonPress = () => {
		onClose?.("close-button");
	};
	const handleEscape = () => {
		onClose?.("escape");
	};
	if (!mounted) return null;
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
	const motionStyle = {
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
	const surfaceStyle = {
		flexShrink: 1,
		borderRadius: radius,
		borderWidth,
		borderColor,
		backgroundColor: t.colorOverlaySurface,
		overflow: "hidden",
		gap: partGap
	};
	const headerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: headerGap,
		padding: inset
	};
	const titleGroupStyle = {
		flexShrink: 1,
		gap: descriptionGap
	};
	const bodyStyle = { flexShrink: 1 };
	const footerStyle = { padding: inset };
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	const footerOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : void 0;
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: true,
		transparent: true,
		animationType: "none",
		onRequestClose: handleEscape,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, {
		style: scrimStyle,
		pointerEvents: "none"
	}), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "Dialog.scrim"
	}), /* @__PURE__ */ React.createElement(KeyboardAvoidingView, {
		behavior: Platform.OS === "ios" ? "padding" : void 0,
		style: centerStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: open,
		autoFocus: "none",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: motionStyle }, /* @__PURE__ */ React.createElement(View, {
		ref: surfaceRef,
		style: surfaceStyle,
		role: "dialog",
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		accessibilityHint: description,
		onAccessibilityEscape: handleEscape,
		testID: "Dialog"
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerStyle,
		testID: "Dialog.header"
	}, /* @__PURE__ */ React.createElement(View, {
		ref: titleGroupRef,
		style: titleGroupStyle
	}, !hideHeading ? /* @__PURE__ */ React.createElement(Heading, { level: "2" }, heading) : null, description !== void 0 ? /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, description) : null), dismissible ? /* @__PURE__ */ React.createElement(View, { ref: closeButtonRef }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$22.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	})) : null), /* @__PURE__ */ React.createElement(View, {
		ref: bodyRef,
		style: bodyStyle,
		testID: "Dialog.body"
	}, /* @__PURE__ */ React.createElement(ScrollView, {
		style: bodyStyle,
		keyboardShouldPersistTaps: "handled"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: bodyOverrides
	}, children))), footer !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: footerStyle,
		testID: "Dialog.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: footerOverrides
	}, footer)) : null))))));
}
//#endregion
//#region src/AlertDialog.tsx
const COPY$21 = { cancelLabel: "Cancel" };
const TONE = {
	danger: {
		icon: "color.status.danger.icon",
		glyph: "danger",
		confirmVariant: "danger"
	},
	warning: {
		icon: "color.status.warning.icon",
		glyph: "warning",
		confirmVariant: "primary"
	},
	info: {
		icon: "color.status.info.icon",
		glyph: "info",
		confirmVariant: "primary"
	}
};
/**
* AlertDialog — a Dialog with one job: get a considered yes or no before an action
* that destroys data, spends money, or cannot be undone.
*
* A native `Modal` (`transparent`, `animationType="none"` — the component animates
* itself, `statusBarTranslucent`). The scrim is a plain `View` with no press handler
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
*/
function AlertDialog({ open, heading, description, tone = "danger", confirmLabel, cancelLabel, confirmDisabled = false, onConfirm, onCancel, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { height: windowHeight } = useWindowDimensions();
	const toneEntry = TONE[tone];
	const [mounted, setMounted] = React.useState(open);
	if (open && !mounted) setMounted(true);
	const progress = React.useRef(new Animated.Value(0)).current;
	const headingRef = React.useRef(null);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const borderColor = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const textGap = overrides?.textGap ? resolveToken(t, overrides.textGap) : t.layoutGapTight;
	const iconGap = overrides?.iconGap ? resolveToken(t, overrides.iconGap) : t.layoutGapNormal;
	const width = overrides?.width ? resolveToken(t, overrides.width) : t.layoutMaxWidthProse;
	const gutter = overrides?.gutter ? resolveToken(t, overrides.gutter) : t.layoutGutter;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerDialog;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const focusHeading = () => {
		const node = headingRef.current ? findNodeHandle(headingRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			if (reducedMotion || enterDuration === 0) {
				progress.setValue(1);
				focusHeading();
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) focusHeading();
			});
			return () => animation.stop();
		}
		if (reducedMotion || exitDuration === 0) {
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
	const handleEscape = () => {
		onCancel?.("escape");
	};
	const handleCancelPress = () => {
		onCancel?.("cancel");
	};
	const handleConfirmPress = () => {
		onConfirm?.();
	};
	if (!mounted) return null;
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
		paddingHorizontal: gutter,
		zIndex: layer
	};
	const motionStyle = {
		width: "100%",
		maxWidth: width,
		maxHeight: windowHeight - 2 * gutter,
		borderRadius: radius,
		...shadow,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.space2, 0]
		}) }]
	};
	const surfaceStyle = {
		flexShrink: 1,
		borderRadius: radius,
		borderWidth,
		borderColor,
		backgroundColor: t.colorOverlaySurface,
		overflow: "hidden",
		padding: inset,
		gap: partGap
	};
	const contentRowStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: iconGap
	};
	const textGroupStyle = {
		flexShrink: 1,
		gap: textGap
	};
	const iconOverrides = {
		color: toneEntry.icon,
		size: overrides?.iconSize ?? "font.size.lg"
	};
	const footerOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : void 0;
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: true,
		transparent: true,
		animationType: "none",
		onRequestClose: handleEscape,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, {
		style: hostStyle,
		testID: "AlertDialog"
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: scrimStyle,
		testID: "AlertDialog.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: centerStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: open,
		autoFocus: "none",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: motionStyle }, /* @__PURE__ */ React.createElement(View, {
		style: surfaceStyle,
		role: "alertdialog",
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		accessibilityHint: description,
		onAccessibilityEscape: handleEscape,
		testID: "AlertDialog.surface"
	}, /* @__PURE__ */ React.createElement(View, { style: contentRowStyle }, /* @__PURE__ */ React.createElement(View, {
		testID: "AlertDialog.icon",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: toneEntry.glyph,
		overrides: iconOverrides
	})), /* @__PURE__ */ React.createElement(View, { style: textGroupStyle }, /* @__PURE__ */ React.createElement(View, {
		ref: headingRef,
		testID: "AlertDialog.heading"
	}, /* @__PURE__ */ React.createElement(Heading, { level: "2" }, heading)), /* @__PURE__ */ React.createElement(View, { testID: "AlertDialog.description" }, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, description)))), /* @__PURE__ */ React.createElement(View, { testID: "AlertDialog.footer" }, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: footerOverrides
	}, /* @__PURE__ */ React.createElement(View, { testID: "AlertDialog.cancelButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: cancelLabel ?? COPY$21.cancelLabel,
		variant: "secondary",
		size: "md",
		onPress: handleCancelPress
	})), /* @__PURE__ */ React.createElement(View, { testID: "AlertDialog.confirmButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: confirmLabel,
		variant: toneEntry.confirmVariant,
		size: "md",
		disabled: confirmDisabled,
		onPress: handleConfirmPress
	}))))))))));
}
//#endregion
//#region src/BottomSheet.tsx
const COPY$20 = { closeLabel: "Close" };
/** Schema constants without a token; `dragSlop` is read from `space.1` at render time. */
const CONSTANTS$1 = {
	dismissDistance: .25,
	dismissVelocity: 1.5
};
const DIALOG_BINDINGS = [
	"scrim",
	"shadow",
	"radius",
	"inset",
	"partGap",
	"headerGap",
	"footerGap",
	"layer",
	"enter",
	"exit"
];
/**
* BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps the
* page visible behind a scrim, and goes away with a swipe, a tap outside, the close
* button or Escape.
*
* At window width <= `layout.maxWidth.prose`: a native `Modal` (`transparent`,
* `animationType="none"`, `statusBarTranslucent`) holding a scrim that fades with the
* surface, a full-screen scrim `Pressable`, and inside a `FocusScope` (`trapped`,
* `autoFocus="first"`, `restoreFocus`) an `Animated.View` surface anchored to the bottom
* with `role="dialog"`, `accessibilityViewIsModal` and `accessibilityLabel={heading}`.
* It slides up with `enter` and `motion.easing.standard` and down with `exit` and
* `motion.easing.exit`, instantly under reduced motion. Android back (`onRequestClose`)
* and the VoiceOver escape gesture report `onClose('escape')`, even when not dismissible.
*
* A `PanResponder` on the header (handle and heading row, never the body `ScrollView`)
* claims a move once it passes `space.1` downward, follows the finger (also under reduced
* motion), and on release past `dismissDistance` of the measured sheet height, or faster
* than `dismissVelocity` between the last two move samples, fires `onDragDismiss` then
* `onClose('drag')`. The sheet holds the release position until the consumer's update
* renders: `open` false plays the exit from there; `open` still true springs back with
* `exit` and `motion.easing.standard`. The handle is decorative and rendered only when
* the gesture is live.
*
* The closeButton part is a View sized to `size.target.comfortable` around a ghost icon
* Button, whose own hitSlop covers the extra area. The bottom inset comes from
* `SafeAreaView` (iOS only; Android adds none). Scroll lock has no native meaning and is
* not implemented. Above the breakpoint the component renders `Dialog size="md"` alone
* with the same props and the shared overrides. The Modal is its own window, so no ref
* is exposed.
*/
function BottomSheet({ open, heading, hideHeading = false, children, footer, height = "content", dismissible = true, dragToDismiss = true, onClose, onDragDismiss, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const [mounted, setMounted] = React.useState(open);
	if (open && !mounted) setMounted(true);
	const [dragReleases, setDragReleases] = React.useState(0);
	const progress = React.useRef(new Animated.Value(0)).current;
	const dragY = React.useRef(new Animated.Value(0)).current;
	const sheetHeightRef = React.useRef(0);
	const samplesRef = React.useRef([]);
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const handleHeight = overrides?.handleHeight ? resolveToken(t, overrides.handleHeight) : t.space1;
	const handleWidth = overrides?.handleWidth ? resolveToken(t, overrides.handleWidth) : t.space10;
	const handleRadius = overrides?.handleRadius ? resolveToken(t, overrides.handleRadius) : t.radiusFull;
	const headerPaddingTop = overrides?.headerPaddingTop ? resolveToken(t, overrides.headerPaddingTop) : t.spaceSm;
	const handleGap = overrides?.handleGap ? resolveToken(t, overrides.handleGap) : t.layoutGapTight;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapNormal;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const dragSlop = t.space1;
	const isWide = windowWidth > t.layoutMaxWidthProse;
	const canDrag = dragToDismiss && dismissible;
	const springBack = () => {
		if (reducedMotion || exitDuration === 0) {
			dragY.setValue(0);
			return;
		}
		Animated.timing(dragY, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	};
	React.useEffect(() => {
		if (!mounted) return;
		if (open) {
			dragY.setValue(0);
			if (reducedMotion || enterDuration === 0) {
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
		if (reducedMotion || exitDuration === 0) {
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
		if (dragReleases > 0 && open) springBack();
	}, [dragReleases]);
	const latest = React.useRef({
		dragSlop,
		windowHeight,
		onClose,
		onDragDismiss,
		springBack
	});
	latest.current = {
		dragSlop,
		windowHeight,
		onClose,
		onDragDismiss,
		springBack
	};
	const panResponder = React.useRef(null);
	if (panResponder.current === null) {
		const claims = (_, g) => g.dy > latest.current.dragSlop && Math.abs(g.dy) > Math.abs(g.dx);
		panResponder.current = PanResponder.create({
			onMoveShouldSetPanResponderCapture: claims,
			onMoveShouldSetPanResponder: claims,
			onPanResponderGrant: () => {
				samplesRef.current = [];
			},
			onPanResponderMove: (event, g) => {
				dragY.setValue(Math.max(0, g.dy));
				const sample = {
					dy: g.dy,
					time: event.nativeEvent.timestamp
				};
				samplesRef.current = [samplesRef.current[samplesRef.current.length - 1] ?? sample, sample];
			},
			onPanResponderRelease: (_, g) => {
				const [previous, last] = samplesRef.current;
				const elapsed = previous !== void 0 && last !== void 0 ? last.time - previous.time : 0;
				const velocity = previous !== void 0 && last !== void 0 && elapsed > 0 ? Math.max(0, (last.dy - previous.dy) / elapsed) : 0;
				const sheetHeight = sheetHeightRef.current > 0 ? sheetHeightRef.current : latest.current.windowHeight;
				if (!(g.dy > sheetHeight * CONSTANTS$1.dismissDistance || velocity > CONSTANTS$1.dismissVelocity)) {
					latest.current.springBack();
					return;
				}
				latest.current.onDragDismiss?.();
				latest.current.onClose?.("drag");
				setDragReleases((count) => count + 1);
			},
			onPanResponderTerminate: () => latest.current.springBack()
		});
	}
	if (isWide) {
		let dialogOverrides;
		if (overrides) {
			dialogOverrides = {};
			for (const binding of DIALOG_BINDINGS) if (overrides[binding] !== void 0) dialogOverrides[binding] = overrides[binding];
		}
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
	if (!mounted) return null;
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCloseButtonPress = () => {
		onClose?.("close-button");
	};
	const handleEscape = () => {
		onClose?.("escape");
	};
	const handleSurfaceLayout = (event) => {
		sheetHeightRef.current = event.nativeEvent.layout.height;
	};
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
	const surfaceStyle = {
		width: "100%",
		height: {
			content: void 0,
			half: windowHeight * .5,
			full: windowHeight - t.layoutGutter
		}[height],
		maxHeight: height === "content" ? windowHeight * .9 : void 0,
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
		...shadow,
		backgroundColor: t.colorOverlaySurface,
		overflow: "hidden",
		gap: partGap,
		transform: [{ translateY: Animated.add(progress.interpolate({
			inputRange: [0, 1],
			outputRange: [windowHeight, 0]
		}), dragY) }]
	};
	const headerStyle = {
		paddingTop: canDrag ? headerPaddingTop : inset,
		paddingHorizontal: inset,
		gap: handleGap
	};
	const handleStyle = {
		alignSelf: "center",
		width: handleWidth,
		height: handleHeight,
		borderRadius: handleRadius,
		backgroundColor: t.colorForegroundMuted
	};
	const headingRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: hideHeading ? "flex-end" : "space-between",
		gap: headerGap
	};
	const headingStyle = { flexShrink: 1 };
	const closeButtonStyle = {
		minWidth: t.sizeTargetComfortable,
		minHeight: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center"
	};
	const bodyStyle = {
		flexShrink: 1,
		flexGrow: height === "content" ? 0 : 1
	};
	const footerStyle = {
		paddingHorizontal: inset,
		paddingBottom: inset
	};
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	const footerOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : void 0;
	const body = /* @__PURE__ */ React.createElement(ScrollView, {
		style: bodyStyle,
		keyboardShouldPersistTaps: "handled",
		testID: "BottomSheet.body"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: bodyOverrides
	}, children));
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: true,
		transparent: true,
		animationType: "none",
		onRequestClose: handleEscape,
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: hostStyle }, /* @__PURE__ */ React.createElement(Animated.View, {
		style: scrimStyle,
		pointerEvents: "none"
	}), /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: handleScrimPress,
		accessible: false,
		testID: "BottomSheet.scrim"
	}), /* @__PURE__ */ React.createElement(View, {
		style: anchorStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: true,
		active: open,
		autoFocus: "first",
		restoreFocus: true
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: surfaceStyle,
		onLayout: handleSurfaceLayout,
		role: "dialog",
		accessibilityViewIsModal: true,
		accessibilityLabel: heading,
		onAccessibilityEscape: handleEscape,
		testID: "BottomSheet"
	}, /* @__PURE__ */ React.createElement(View, {
		...canDrag ? panResponder.current.panHandlers : void 0,
		style: headerStyle,
		testID: "BottomSheet.header"
	}, canDrag ? /* @__PURE__ */ React.createElement(View, {
		style: handleStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "BottomSheet.handle"
	}) : null, /* @__PURE__ */ React.createElement(View, { style: headingRowStyle }, !hideHeading ? /* @__PURE__ */ React.createElement(View, {
		style: headingStyle,
		testID: "BottomSheet.heading"
	}, /* @__PURE__ */ React.createElement(Heading, { level: "2" }, heading)) : null, dismissible ? /* @__PURE__ */ React.createElement(View, {
		style: closeButtonStyle,
		testID: "BottomSheet.closeButton"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$20.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	})) : null)), footer !== void 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, body, /* @__PURE__ */ React.createElement(SafeAreaView, {
		style: footerStyle,
		testID: "BottomSheet.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: footerOverrides
	}, footer))) : /* @__PURE__ */ React.createElement(SafeAreaView, { style: bodyStyle }, body))))));
}
//#endregion
//#region src/ActionSheet.tsx
const COPY$19 = {
	cancelLabel: "Cancel",
	defaultLabel: "Actions"
};
/** Schema constants: `dismissDistance` (ratio of sheet height) and `dismissVelocity` (px/ms, PanResponder's own unit). */
const CONSTANTS = {
	dismissDistance: .25,
	dismissVelocity: 1.5
};
/**
* ActionSheet — "what can I do with this?" A short list of verbs for one item,
* reached from an overflow button or a long-press, with the dangerous one grouped
* last and an explicit Cancel because thumbs miss.
*
* When to use: contextual actions on an item — share, rename, duplicate, delete —
* opened from an overflow `Button` (`iconOnly`, label "More actions") or a long-press.
* Keep it to what fits without scrolling; more than eight actions means the item
* needs its own screen. Put destructive actions last with `tone: "danger"`. Not for
* navigation, settings with state, choosing a value, or confirming — a danger row
* opens an `AlertDialog`, it does not itself confirm.
*
* Renders a native `Modal` (`visible`, `transparent`, `onRequestClose`,
* `statusBarTranslucent`) with a full-screen scrim `Pressable` and an `Animated.View`
* surface (`testID="ActionSheet"`, `role="menu"`, `accessibilityViewIsModal`,
* `accessibilityLabel={heading ?? copy.defaultLabel}`) anchored to the bottom, sliding
* up with `enter` and `motion.easing.standard` and down with `exit` and
* `motion.easing.exit`, the scrim fading alongside (instant under reduced motion). The
* surface composes `FocusScope` (`trapped`, `restoreFocus`, `autoFocus="none"`), `Text`
* (`size="sm"`, `tone="muted"`, with `fontFamily`, `titleSize` and `lineHeight`
* forwarded as its overrides) for the heading, `Icon` for each row's glyph and `Button`
* (`variant="secondary"`) for the Cancel row — never restyled. Rows are `Pressable`s
* with `role="menuitem"` and `accessibilityState={{ disabled }}`; a press guard, not
* the native `disabled` prop, makes disabled rows inert so they stay reachable and are
* announced as disabled. Once the enter transition ends, accessibility focus moves to
* the first enabled action in display order.
*
* A `PanResponder` on the header (handle plus heading) tracks from the first touch with
* no slop; released past `dismissDistance` of the measured surface height or faster
* than `dismissVelocity` it fires `onClose('drag')`, otherwise it springs back with
* `exit` and `motion.easing.standard` (a tap passes neither threshold, so nothing
* fires). `dismissible={false}` removes the handle, the drag, the Cancel row and its
* divider and makes the scrim inert; `onRequestClose` (Android back, hardware Escape)
* and the VoiceOver escape gesture always report `onClose('escape')`. Choosing an
* action never closes the sheet itself.
*
* Native limits: `Pressable` has no key events, so there are no arrow keys, Home/End
* or roving tabindex — each row is its own accessibility focus stop and Enter/Space
* are the platform's own activation. There is no wide presentation: the package's
* `Menu` renders its own trigger and cannot anchor to an external element, so tablets
* get the sheet too and `maxWidth` has no effect. Rooted in a native `Modal`, the
* sheet exposes no ref; callers ref their opener.
*/
function ActionSheet({ open, heading, actions, dismissible = true, cancelLabel, onAction, onClose, overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const { height: windowHeight } = useWindowDimensions();
	const resolvedCancelLabel = cancelLabel ?? COPY$19.cancelLabel;
	const accessibleName = heading ?? COPY$19.defaultLabel;
	const [mounted, setMounted] = React.useState(open);
	const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
	const dragY = React.useRef(new Animated.Value(0)).current;
	const surfaceHeightRef = React.useRef(0);
	const itemRefs = React.useRef(/* @__PURE__ */ new Map());
	const openRef = React.useRef(open);
	openRef.current = open;
	const scrimColor = overrides?.scrim ? resolveToken(t, overrides.scrim) : t.colorOverlayScrim;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusLg;
	const itemPaddingBlock = overrides?.itemPaddingBlock ? resolveToken(t, overrides.itemPaddingBlock) : t.spaceSm;
	const itemPaddingInline = overrides?.itemPaddingInline ? resolveToken(t, overrides.itemPaddingInline) : t.layoutInsetMd;
	const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNormal;
	const headerPaddingBlock = overrides?.headerPaddingBlock ? resolveToken(t, overrides.headerPaddingBlock) : t.spaceSm;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapTight;
	const handleHeight = overrides?.handleHeight ? resolveToken(t, overrides.handleHeight) : t.space1;
	const handleWidth = overrides?.handleWidth ? resolveToken(t, overrides.handleWidth) : t.space10;
	const handleRadius = overrides?.handleRadius ? resolveToken(t, overrides.handleRadius) : t.radiusFull;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const dividerColor = overrides?.divider ? resolveToken(t, overrides.divider) : t.colorBorder;
	const dividerWidth = overrides?.dividerWidth ? resolveToken(t, overrides.dividerWidth) : t.borderWidthThin;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const normalActions = actions.filter((action) => action.tone !== "danger");
	const dangerActions = actions.filter((action) => action.tone === "danger");
	React.useEffect(() => {
		if (open) setMounted(true);
	}, [open]);
	const focusFirstEnabledAction = () => {
		const target = [...normalActions, ...dangerActions].find((action) => action.disabled !== true);
		const node = target ? itemRefs.current.get(target.id) : void 0;
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	};
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
	const handleScrimPress = () => {
		if (dismissible) onClose?.("scrim");
	};
	const handleCancelPress = () => {
		onClose?.("cancel");
	};
	const handleEscape = () => {
		onClose?.("escape");
	};
	const handleSurfaceLayout = (event) => {
		surfaceHeightRef.current = event.nativeEvent.layout.height;
	};
	const handleActionPress = (id) => {
		onAction?.(id);
	};
	const springBack = () => {
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
	};
	const latest = React.useRef({
		windowHeight,
		onClose,
		springBack
	});
	latest.current = {
		windowHeight,
		onClose,
		springBack
	};
	const panResponder = React.useRef(null);
	if (panResponder.current === null) panResponder.current = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderMove: (_, g) => {
			dragY.setValue(Math.max(0, g.dy));
		},
		onPanResponderRelease: (_, g) => {
			const sheetHeight = surfaceHeightRef.current > 0 ? surfaceHeightRef.current : latest.current.windowHeight;
			if (!(g.dy > sheetHeight * CONSTANTS.dismissDistance || g.vy > CONSTANTS.dismissVelocity)) {
				latest.current.springBack();
				return;
			}
			latest.current.onClose?.("drag");
			setTimeout(() => {
				if (openRef.current) latest.current.springBack();
			}, 0);
		},
		onPanResponderTerminate: () => latest.current.springBack()
	});
	if (!mounted && !open) return null;
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
		backgroundColor: t.colorOverlaySurface,
		overflow: "hidden",
		transform: [{ translateY: Animated.add(entryTranslateY, dragY) }]
	};
	const headerStyle = {
		paddingHorizontal: itemPaddingInline,
		paddingVertical: headerPaddingBlock,
		gap: headerGap
	};
	const handleStyle = {
		alignSelf: "center",
		width: handleWidth,
		height: handleHeight,
		borderRadius: handleRadius,
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
	const itemRowStyle = (highlighted, focused, disabled) => ({
		flexDirection: "row",
		alignItems: "center",
		gap: itemGap,
		minHeight: t.sizeTargetComfortable,
		paddingVertical: itemPaddingBlock,
		paddingHorizontal: itemPaddingInline,
		backgroundColor: highlighted ? t.colorBackgroundSubtle : "transparent",
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : "transparent",
		opacity: disabled ? t.opacityDisabled : 1
	});
	const itemLabelStyle = (danger) => ({
		flexShrink: 1,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
		color: danger ? t.colorForegroundDanger : t.colorForeground
	});
	const registerItemRef = (id) => (node) => {
		if (node) itemRefs.current.set(id, node);
		else itemRefs.current.delete(id);
	};
	function renderAction(action) {
		const danger = action.tone === "danger";
		return /* @__PURE__ */ React.createElement(ActionSheetItemRow, {
			key: action.id,
			action,
			registerRef: registerItemRef(action.id),
			rowStyle: itemRowStyle,
			labelStyle: itemLabelStyle(danger),
			iconColor: danger ? t.colorForegroundDanger : t.colorForeground,
			onActivate: handleActionPress
		});
	}
	let headingOverrides;
	if (overrides?.fontFamily !== void 0 || overrides?.titleSize !== void 0 || overrides?.lineHeight !== void 0) headingOverrides = {
		fontFamily: overrides.fontFamily,
		fontSize: overrides.titleSize,
		lineHeight: overrides.lineHeight
	};
	const showHeader = dismissible || heading !== void 0;
	return /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		animationType: "none",
		onRequestClose: handleEscape,
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
		role: "menu",
		accessibilityViewIsModal: true,
		accessibilityLabel: accessibleName,
		onAccessibilityEscape: handleEscape,
		testID: "ActionSheet"
	}, showHeader ? /* @__PURE__ */ React.createElement(View, {
		...dismissible ? panResponder.current.panHandlers : null,
		style: headerStyle,
		testID: "ActionSheet.header"
	}, dismissible ? /* @__PURE__ */ React.createElement(View, {
		style: handleStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "ActionSheet.handle"
	}) : null, heading !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "ActionSheet.heading" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: headingOverrides
	}, heading)) : null) : null, /* @__PURE__ */ React.createElement(View, { testID: "ActionSheet.list" }, normalActions.map(renderAction), dangerActions.length > 0 && normalActions.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		style: dividerStyle,
		role: "separator",
		testID: "ActionSheet.divider"
	}) : null, dangerActions.map(renderAction)), dismissible ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(View, {
		style: dividerStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "ActionSheet.divider"
	}), /* @__PURE__ */ React.createElement(View, {
		style: cancelRowStyle,
		testID: "ActionSheet.cancelButton"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: resolvedCancelLabel,
		variant: "secondary",
		onPress: handleCancelPress
	}))) : null)))));
}
/** One action row. Its own component so focus and hover state do not re-render the whole list. */
function ActionSheetItemRow({ action, registerRef, rowStyle, labelStyle, iconColor, onActivate }) {
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
	const disabled = action.disabled === true;
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: registerRef,
		role: "menuitem",
		accessibilityLabel: action.label,
		accessibilityState: { disabled },
		onPress: () => {
			if (!disabled) onActivate(action.id);
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		style: ({ pressed }) => rowStyle(!disabled && (hovered || pressed), focused, disabled),
		testID: "ActionSheet.item"
	}, action.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "ActionSheet.itemIcon"
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
* Flattens groups and drops separators and shortcuts for the phone (`ActionSheet`)
* presentation: `ActionSheet` takes a flat action list, and a group heading faked as
* an inert row would misread.
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
/** `escape` stays; `scrim`, `cancel` and `drag` all become `outside`. */
function mapActionSheetCloseReason(reason) {
	return reason === "escape" ? "escape" : "outside";
}
/** Positions the popup from the anchor's measured rect for `placement`, flipping either axis on overflow. `start`/`end` resolve against the writing direction. */
function computeMenuPosition(anchor, popupWidth, popupHeight, placement, windowSize, offset) {
	const [vert, horiz] = placement.split("-");
	let vertical = vert;
	const spaceBelow = windowSize.height - (anchor.y + anchor.height);
	const spaceAbove = anchor.y;
	if (vertical === "bottom" && spaceBelow < popupHeight + offset && spaceAbove > spaceBelow) vertical = "top";
	else if (vertical === "top" && spaceAbove < popupHeight + offset && spaceBelow > spaceAbove) vertical = "bottom";
	let alignLeft = I18nManager.isRTL ? horiz === "end" : horiz === "start";
	const spaceRightOfLeftAlign = windowSize.width - anchor.x;
	const spaceLeftOfRightAlign = anchor.x + anchor.width;
	if (alignLeft && spaceRightOfLeftAlign < popupWidth && spaceLeftOfRightAlign >= popupWidth) alignLeft = false;
	else if (!alignLeft && spaceLeftOfRightAlign < popupWidth && spaceRightOfLeftAlign >= popupWidth) alignLeft = true;
	return {
		top: vertical === "bottom" ? anchor.y + anchor.height + offset : anchor.y - offset - popupHeight,
		left: alignLeft ? anchor.x : anchor.x + anchor.width - popupWidth,
		side: vertical
	};
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
* full-screen scrim `Pressable` and a popup `View` (`role="menu"`) positioned from the
* trigger's (or `anchor`'s) `measureInWindow()` rect, flipped on overflow via
* `useWindowDimensions()`. The list scrolls within `maxHeight`. The popup fades and
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
function Menu({ label, items, triggerVariant = "ghost", triggerIcon = "chevron-down", iconOnly = false, placement = "bottom-start", open, anchor, onAction, onOpenChange, overrides }) {
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
	const [anchorRect, setAnchorRect] = React.useState(null);
	const [popupSize, setPopupSize] = React.useState(null);
	const progress = React.useRef(new Animated.Value(0)).current;
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
	const enterDistance = overrides?.enterDistance ? resolveToken(t, overrides.enterDistance) : t.space1;
	const surfaceColor = t.colorOverlaySurface;
	const itemHoverColor = t.colorBackgroundSubtle;
	const itemColor = t.colorForeground;
	const itemDangerColor = t.colorForegroundDanger;
	const groupLabelColor = t.colorForegroundMuted;
	const shortcutColor = t.colorForegroundMuted;
	const focusRingColor = t.colorBorderFocus;
	const focusRingWidth = t.borderWidthFocus;
	const triggerIconColor = t[TRIGGER_FOREGROUND[triggerVariant]];
	const hasWarnedRef = React.useRef(false);
	React.useEffect(() => {
		if (__DEV__ && iconOnly && triggerIcon === "none" && !hasWarnedRef.current) {
			hasWarnedRef.current = true;
			console.warn("Menu: `iconOnly` with `triggerIcon` \"none\" leaves the trigger with nothing visible to press.");
		}
	}, [iconOnly, triggerIcon]);
	const registerItemRef = (id) => (node) => {
		if (node) itemRefs.current.set(id, node);
		else itemRefs.current.delete(id);
	};
	const focusFirstEnabledItem = React.useCallback(() => {
		const target = flattenActions(latestItemsRef.current).find((action) => action.disabled !== true);
		const node = target ? itemRefs.current.get(target.id) : void 0;
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	const focusReturnTarget = React.useCallback(() => {
		const node = anchor ? anchor.current : triggerRef.current;
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, [anchor]);
	const changeOpen = (next, reason) => {
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const closeMenu = (reason) => {
		if (!isOpen) return;
		changeOpen(false, reason);
	};
	const wasOpenRef = React.useRef(isOpen);
	React.useEffect(() => {
		if (wasOpenRef.current && !isOpen) focusReturnTarget();
		wasOpenRef.current = isOpen;
	}, [isOpen, focusReturnTarget]);
	const handleTriggerPress = () => {
		if (isOpen) closeMenu("trigger");
		else changeOpen(true, "trigger");
	};
	const handleActivate = (id) => {
		closeMenu("action");
		onAction?.(id);
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
			setAnchorRect(null);
			setPopupSize(null);
			return;
		}
		(anchor ? anchor.current : triggerRef.current)?.measureInWindow((x, y, width, height) => setAnchorRect({
			x,
			y,
			width,
			height
		}));
	}, [isOpen, isPhoneWidth]);
	React.useEffect(() => {
		if (isPhoneWidth || !isOpen || anchorRect === null || popupSize === null || hasFocusedInitialRef.current) return;
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
		anchorRect,
		popupSize,
		reducedMotion
	]);
	const triggerIconElement = triggerIcon !== "none" ? /* @__PURE__ */ React.createElement(Icon, {
		name: triggerIcon,
		color: triggerIconColor
	}) : void 0;
	const trigger = anchor === void 0 ? /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false,
		testID: "Menu.trigger"
	}, /* @__PURE__ */ React.createElement(Button, {
		label,
		variant: triggerVariant,
		iconOnly,
		expanded: isOpen,
		leadingIcon: iconOnly ? triggerIconElement : void 0,
		trailingIcon: iconOnly ? void 0 : triggerIconElement,
		onPress: handleTriggerPress
	})) : null;
	if (isPhoneWidth) return /* @__PURE__ */ React.createElement(View, { testID: "Menu" }, trigger, /* @__PURE__ */ React.createElement(ActionSheet, {
		open: isOpen,
		heading: label,
		actions: toActionSheetActions(items),
		onAction: handleActivate,
		onClose: (reason) => closeMenu(mapActionSheetCloseReason(reason))
	}));
	const popupWidth = anchorRect ? Math.max(minWidth, anchorRect.width) : minWidth;
	const position = anchorRect ? computeMenuPosition(anchorRect, popupWidth, popupSize?.height ?? 0, placement, windowSize, popupOffset) : {
		top: 0,
		left: 0,
		side: placement.startsWith("top") ? "top" : "bottom"
	};
	const maxListHeight = Math.max(0, Math.min(maxHeightCap, windowSize.height - popupOffset * 2));
	const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const popupStyle = {
		position: "absolute",
		top: position.top,
		left: position.left,
		width: popupWidth,
		borderRadius: radius,
		borderWidth,
		borderColor: border,
		backgroundColor: surfaceColor,
		...shadow,
		zIndex: layer,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [position.side === "bottom" ? -enterDistance : enterDistance, 0]
		}) }]
	};
	const listContentStyle = { padding: popupPadding };
	const groupLabelStyle = {
		paddingHorizontal: itemPaddingInline,
		paddingVertical: itemPaddingBlock,
		fontFamily,
		fontSize: groupLabelSize,
		fontWeight: toFontWeight(groupLabelWeight),
		lineHeight: toLineHeight(groupLabelSize, lineHeightMultiplier),
		color: groupLabelColor
	};
	const separatorStyle = {
		marginVertical: separatorMargin,
		height: borderWidth,
		backgroundColor: separatorColor
	};
	const itemRowStyle = (highlighted, focused, disabled) => ({
		flexDirection: "row",
		alignItems: "center",
		gap: itemGap,
		minHeight: t.sizeTargetMin,
		paddingVertical: itemPaddingBlock,
		paddingHorizontal: itemPaddingInline,
		borderRadius: itemRadius,
		backgroundColor: highlighted ? itemHoverColor : "transparent",
		borderWidth: focusRingWidth,
		borderColor: focused ? focusRingColor : "transparent",
		opacity: disabled ? t.opacityDisabled : 1
	});
	const itemLabelStyle = (danger) => ({
		flexShrink: 1,
		fontFamily,
		fontSize,
		lineHeight,
		color: danger ? itemDangerColor : itemColor
	});
	const shortcutStyle = {
		marginStart: "auto",
		fontFamily,
		fontSize: shortcutSize,
		lineHeight: toLineHeight(shortcutSize, lineHeightMultiplier),
		color: shortcutColor
	};
	function renderAction(action, key) {
		const danger = action.tone === "danger";
		return /* @__PURE__ */ React.createElement(MenuActionRow, {
			key,
			action,
			registerRef: registerItemRef(action.id),
			rowStyle: itemRowStyle,
			labelStyle: itemLabelStyle(danger),
			shortcutStyle,
			iconColor: danger ? itemDangerColor : itemColor,
			onActivate: handleActivate
		});
	}
	function renderNode(node, key) {
		if ("separator" in node) return /* @__PURE__ */ React.createElement(View, {
			key,
			role: "separator",
			style: separatorStyle,
			testID: "Menu.separator"
		});
		if ("group" in node) return /* @__PURE__ */ React.createElement(View, {
			key,
			role: "group",
			accessibilityLabel: node.group,
			testID: "Menu.group"
		}, /* @__PURE__ */ React.createElement(Text$1, {
			style: groupLabelStyle,
			testID: "Menu.groupLabel"
		}, node.group), node.items.map((child, index) => "id" in child ? renderAction(child, `${key}-${index}`) : null));
		return renderAction(node, key);
	}
	return /* @__PURE__ */ React.createElement(View, { testID: "Menu" }, trigger, /* @__PURE__ */ React.createElement(Modal, {
		visible: isOpen,
		transparent: true,
		animationType: "none",
		onRequestClose: () => closeMenu("escape"),
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: StyleSheet.absoluteFill }, /* @__PURE__ */ React.createElement(Pressable, {
		style: StyleSheet.absoluteFill,
		onPress: () => closeMenu("outside"),
		accessible: false,
		testID: "Menu.scrim"
	}), /* @__PURE__ */ React.createElement(Animated.View, {
		style: popupStyle,
		onLayout: handlePopupLayout,
		role: "menu",
		accessibilityLabel: label,
		testID: "Menu.popup"
	}, /* @__PURE__ */ React.createElement(ScrollView, {
		style: { maxHeight: maxListHeight },
		contentContainerStyle: listContentStyle,
		testID: "Menu.list"
	}, items.map((item, index) => renderNode(item, String(index))))))));
}
/** One menu row. Its own component so focus/hover state does not re-render the whole list. Hover and focus share `itemHover`. */
function MenuActionRow({ action, registerRef, rowStyle, labelStyle, shortcutStyle, iconColor, onActivate }) {
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
	const disabled = action.disabled === true;
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: registerRef,
		role: "menuitem",
		accessibilityLabel: action.label,
		accessibilityState: { disabled },
		onPress: () => {
			if (!disabled) onActivate(action.id);
		},
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		style: ({ pressed }) => rowStyle(!disabled && (focused || pressed || hovered), focused, disabled),
		testID: "Menu.item"
	}, action.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "Menu.itemIcon"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: action.icon,
		color: iconColor
	})) : null, /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle
	}, action.label), action.shortcut !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
		style: shortcutStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		testID: "Menu.itemShortcut"
	}, action.shortcut) : null);
}
//#endregion
//#region src/Tooltip.tsx
const NO_SOURCES = {
	hover: false,
	bubble: false,
	focus: false,
	press: false
};
/** Module-level "warm until" timestamp shared by every Tooltip: after one hides, a sibling hovered within `warmWindow` shows with no delay. */
let warmUntil = 0;
function clamp$3(value, min, max) {
	return Math.max(min, Math.min(value, max));
}
/**
* Positions the bubble from the trigger's window rect for `placement`, flipping to the
* opposite side when the preferred one would overflow the window and shifting the cross
* axis to stay inside it. Returns coordinates relative to the trigger, because the bubble
* is laid out inside Tooltip's own root rather than a portal.
*/
function computeBubblePosition(placement, trigger, bubble, windowSize, offset) {
	if (placement === "start" || placement === "end") {
		let onLeft = I18nManager.isRTL ? placement === "end" : placement === "start";
		const spaceLeft = trigger.x;
		const spaceRight = windowSize.width - (trigger.x + trigger.width);
		if (onLeft && spaceLeft < bubble.width + offset && spaceRight >= bubble.width + offset) onLeft = false;
		else if (!onLeft && spaceRight < bubble.width + offset && spaceLeft >= bubble.width + offset) onLeft = true;
		const left = onLeft ? trigger.x - offset - bubble.width : trigger.x + trigger.width + offset;
		return {
			top: clamp$3(trigger.y + trigger.height / 2 - bubble.height / 2, 0, windowSize.height - bubble.height) - trigger.y,
			left: left - trigger.x
		};
	}
	let below = placement === "bottom";
	const spaceAbove = trigger.y;
	const spaceBelow = windowSize.height - (trigger.y + trigger.height);
	if (below && spaceBelow < bubble.height + offset && spaceAbove > spaceBelow) below = false;
	else if (!below && spaceAbove < bubble.height + offset && spaceBelow > spaceAbove) below = true;
	const top = below ? trigger.y + trigger.height + offset : trigger.y - offset - bubble.height;
	const left = clamp$3(trigger.x + trigger.width / 2 - bubble.width / 2, 0, windowSize.width - bubble.width);
	return {
		top: top - trigger.y,
		left: left - trigger.x
	};
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
* The bubble is not portaled: it is absolutely positioned inside Tooltip's root on
* `layer.toast`, placed from the trigger's `measureInWindow` rect and flipped on
* overflow. An ancestor that clips (`overflow: 'hidden'`) or a sibling stacking context
* above the root can still cover it — the acknowledged native limit.
*
* Tooltip exposes no `ref`: it adds no root a caller needs; a caller that wants the
* trigger refs its own child. Inside a Toolbar it adds no focus stop and no role.
*/
function Tooltip({ content, children, placement = "top", describes = true, open: openProp, delay = "default", overrides }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const windowSize = useWindowDimensions();
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusSm;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.space1;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.space2;
	const offset = overrides?.offset ? resolveToken(t, overrides.offset) : t.space1;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.space20 * 3;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowRaised;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerToast;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationFast;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const hoverDelay = t.motionDurationBase * 3;
	const warmWindow = t.motionDurationBase;
	const pointerGrace = t.motionDurationFast;
	const [sources, setSources] = React.useState(NO_SOURCES);
	const [escaped, setEscaped] = React.useState(false);
	React.useEffect(() => setEscaped(false), [openProp]);
	const visible = openProp !== void 0 ? openProp && !escaped : sources.hover || sources.bubble || sources.focus || sources.press;
	const hoverTimer = React.useRef(null);
	const graceTimer = React.useRef(null);
	const clearTimer = (timer) => {
		if (timer.current !== null) {
			clearTimeout(timer.current);
			timer.current = null;
		}
	};
	React.useEffect(() => () => {
		clearTimer(hoverTimer);
		clearTimer(graceTimer);
	}, []);
	const setSource = React.useCallback((key, value) => {
		setSources((prev) => prev[key] === value ? prev : {
			...prev,
			[key]: value
		});
	}, []);
	const wasVisible = React.useRef(visible);
	React.useEffect(() => {
		if (wasVisible.current && !visible) warmUntil = Date.now() + warmWindow;
		wasVisible.current = visible;
	}, [visible, warmWindow]);
	const handleHoverIn = () => {
		clearTimer(graceTimer);
		clearTimer(hoverTimer);
		if (delay === "none" || visible || Date.now() < warmUntil) {
			setSource("hover", true);
			return;
		}
		hoverTimer.current = setTimeout(() => setSource("hover", true), hoverDelay);
	};
	const handleHoverOut = () => {
		clearTimer(hoverTimer);
		clearTimer(graceTimer);
		graceTimer.current = setTimeout(() => setSource("hover", false), pointerGrace);
	};
	const handleBubbleEnter = () => {
		clearTimer(graceTimer);
		setSource("bubble", true);
	};
	const handleBubbleLeave = () => {
		clearTimer(graceTimer);
		graceTimer.current = setTimeout(() => {
			setSource("bubble", false);
			setSource("hover", false);
		}, pointerGrace);
	};
	const dismiss = React.useCallback(() => {
		clearTimer(hoverTimer);
		clearTimer(graceTimer);
		setSources(NO_SOURCES);
		setEscaped(true);
	}, []);
	React.useEffect(() => {
		if (Platform.OS !== "web" || !visible) return;
		const globalWindow = globalThis.window;
		if (globalWindow === void 0) return;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				event.stopPropagation();
				dismiss();
			}
		};
		globalWindow.addEventListener("keydown", handleKeyDown, true);
		return () => globalWindow.removeEventListener("keydown", handleKeyDown, true);
	}, [visible, dismiss]);
	const isSingleElement = React.isValidElement(children) && React.Children.count(children) === 1;
	React.useEffect(() => {
		if (__DEV__ && !isSingleElement) console.warn("Tooltip: `children` must be exactly one focusable element (a Button, Link or Input).");
	}, [isSingleElement]);
	const child = isSingleElement ? children : null;
	const childProps = child?.props ?? {};
	const chain = (name, own) => (event) => {
		childProps[name]?.(event);
		own();
	};
	const trigger = child !== null ? React.cloneElement(child, {
		...describes ? { accessibilityHint: content } : { accessibilityLabel: content },
		onLongPress: chain("onLongPress", () => setSource("press", true)),
		onPressOut: chain("onPressOut", () => setSource("press", false)),
		...Platform.OS === "web" ? {
			onHoverIn: chain("onHoverIn", handleHoverIn),
			onHoverOut: chain("onHoverOut", handleHoverOut),
			onFocus: chain("onFocus", () => setSource("focus", true)),
			onBlur: chain("onBlur", () => setSource("focus", false))
		} : {}
	}) : children;
	const [mounted, setMounted] = React.useState(visible);
	const progress = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		if (visible) setMounted(true);
	}, [visible]);
	React.useEffect(() => {
		if (!mounted) return;
		const easing = toEasing(t.motionEasingStandard);
		if (visible) {
			if (reducedMotion) {
				progress.setValue(1);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing,
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
			easing,
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) setMounted(false);
		});
		return () => animation.stop();
	}, [
		visible,
		mounted,
		reducedMotion,
		enterDuration,
		exitDuration,
		progress,
		t.motionEasingStandard
	]);
	const triggerRef = React.useRef(null);
	const [triggerRect, setTriggerRect] = React.useState(null);
	const [bubbleSize, setBubbleSize] = React.useState(null);
	const measureTrigger = React.useCallback(() => {
		triggerRef.current?.measureInWindow((x, y, width, height) => {
			setTriggerRect((prev) => prev !== null && prev.x === x && prev.y === y && prev.width === width && prev.height === height ? prev : {
				x,
				y,
				width,
				height
			});
		});
	}, []);
	React.useEffect(() => {
		if (mounted) measureTrigger();
	}, [
		mounted,
		measureTrigger,
		windowSize.width,
		windowSize.height
	]);
	const handleBubbleLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setBubbleSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	const position = triggerRect !== null ? computeBubblePosition(placement, triggerRect, bubbleSize ?? {
		width: 0,
		height: 0
	}, windowSize, offset) : null;
	const bubbleStyle = {
		position: "absolute",
		top: position?.top ?? 0,
		left: position?.left ?? 0,
		maxWidth,
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		borderRadius: radius,
		backgroundColor: t.colorInverseSurface,
		zIndex: layer,
		opacity: position !== null && bubbleSize !== null ? progress : 0,
		...shadow
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Tooltip",
		style: {
			position: "relative",
			alignSelf: "flex-start",
			...mounted ? { zIndex: layer } : {}
		}
	}, /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false
	}, trigger), mounted ? /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Tooltip.popup",
		onLayout: handleBubbleLayout,
		pointerEvents: Platform.OS === "web" ? "auto" : "none",
		onPointerEnter: handleBubbleEnter,
		onPointerLeave: handleBubbleLeave,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		"aria-hidden": true,
		style: bubbleStyle
	}, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: t.colorInverseForeground }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: {
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.fontSize,
			lineHeight: overrides?.lineHeight
		}
	}, content))) : null);
}
//#endregion
//#region src/Popover.tsx
const COPY$18 = { closeLabel: "Close" };
const SHEET_BINDINGS = [
	"shadow",
	"radius",
	"inset",
	"partGap",
	"layer",
	"enter",
	"exit"
];
const SHEET_REASON = {
	escape: "escape",
	"close-button": "close-button",
	scrim: "outside",
	drag: "outside",
	action: "close-button"
};
const RESTORE_REASONS = /* @__PURE__ */ new Set([
	"trigger",
	"escape",
	"close-button"
]);
function clamp$2(value, min, max) {
	return Math.min(Math.max(value, min), Math.max(min, max));
}
/**
* Places the panel from the trigger's window rect for `placement`: flips the main
* axis when the preferred side overflows and shifts along the cross axis to stay in
* the window. Returns the panel edge that faces the trigger (arrow and slide side).
*/
function computePopoverPosition(trigger, panelWidth, panelHeight, placement, windowSize, offset) {
	const rtl = I18nManager.isRTL;
	if (placement === "start" || placement === "end") {
		let onLeft = rtl ? placement === "end" : placement === "start";
		const spaceLeft = trigger.x;
		const spaceRight = windowSize.width - (trigger.x + trigger.width);
		if (onLeft && spaceLeft < panelWidth + offset && spaceRight > spaceLeft) onLeft = false;
		else if (!onLeft && spaceRight < panelWidth + offset && spaceLeft > spaceRight) onLeft = true;
		const left = clamp$2(onLeft ? trigger.x - offset - panelWidth : trigger.x + trigger.width + offset, offset, windowSize.width - panelWidth - offset);
		return {
			top: clamp$2(trigger.y + trigger.height / 2 - panelHeight / 2, offset, windowSize.height - panelHeight - offset),
			left,
			edge: onLeft ? "right" : "left"
		};
	}
	const [side, align] = placement.split("-");
	let vertical = side;
	const spaceBelow = windowSize.height - (trigger.y + trigger.height);
	const spaceAbove = trigger.y;
	if (vertical === "bottom" && spaceBelow < panelHeight + offset && spaceAbove > spaceBelow) vertical = "top";
	else if (vertical === "top" && spaceAbove < panelHeight + offset && spaceBelow > spaceAbove) vertical = "bottom";
	let left;
	if (align === void 0) left = trigger.x + trigger.width / 2 - panelWidth / 2;
	else left = (rtl ? align === "end" : align === "start") ? trigger.x : trigger.x + trigger.width - panelWidth;
	left = clamp$2(left, offset, windowSize.width - panelWidth - offset);
	return {
		top: vertical === "bottom" ? trigger.y + trigger.height + offset : trigger.y - offset - panelHeight,
		left,
		edge: vertical === "bottom" ? "top" : "bottom"
	};
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
* trigger's `accessibleName`, else its string `label`; there it is always modal and
* always shows its close button. Above it (tablets, react-native-web) a transparent
* `Modal` holds a full-screen transparent backdrop `Pressable` (no scrim, even when
* `modal`) and a `role="dialog"` panel positioned from the trigger's
* `measureInWindow()` rect, flipped and shifted to stay in the window. The panel
* composes `FocusScope` (`trapped` when `modal`), `Heading`, `Button` for the close
* control and `Box` for the body. It fades and slides `enterDistance` from the trigger
* side over `enter` (motion.easing.standard) and fades out over `exit`
* (motion.easing.exit); instantly under reduced motion.
*
* Dismissal: Escape (`onRequestClose`: Android back, Esc on react-native-web) always
* closes; a backdrop tap closes when not `modal`; the close button when `dismissible`.
* Closing by the trigger, Escape or the close button returns accessibility focus to the
* trigger once `open` goes false; an outside tap does not. On open, focus lands on the
* body wrapper — native has no descendant walker to find the first control.
*
* Acknowledged native limits: `Modal` intercepts every touch behind it, so non-modal
* means only "tapping outside closes"; Pressable sees no key events, so Tab never
* leaves the panel and `tab-out` is never reported; the panel is measured once per
* open and does not follow a scrolling page; the arrow is centered on the panel edge.
*/
function Popover({ trigger, children, heading, headingLevel = "3", open, placement = "bottom", modal = false, showArrow = false, dismissible = true, onOpenChange, overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const windowSize = useWindowDimensions();
	const isPhoneWidth = windowSize.width <= t.layoutMaxWidthProse;
	const triggerRef = React.useRef(null);
	const bodyRef = React.useRef(null);
	const hasEnteredRef = React.useRef(false);
	const closeReasonRef = React.useRef(null);
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = isControlled ? open : internalOpen;
	const wasOpenRef = React.useRef(isOpen);
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
	const enterDistance = overrides?.enterDistance ? resolveToken(t, overrides.enterDistance) : t.space1;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const surfaceColor = t.colorOverlaySurface;
	const triggerProps = trigger.props;
	const triggerName = typeof triggerProps.accessibleName === "string" ? triggerProps.accessibleName : typeof triggerProps.label === "string" ? triggerProps.label : void 0;
	const accessibleName = heading ?? triggerName;
	React.useEffect(() => {
		if (__DEV__ && accessibleName === void 0) console.warn("Popover: without `heading`, the trigger needs an `accessibleName` or a string `label` to name the panel; the panel has no accessible name.");
	}, [accessibleName]);
	const focusNode = React.useCallback((node) => {
		const handle = node ? findNodeHandle(node) : null;
		if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
	}, []);
	React.useEffect(() => {
		if (wasOpenRef.current && !isOpen) {
			const reason = closeReasonRef.current;
			closeReasonRef.current = null;
			if (reason !== null && RESTORE_REASONS.has(reason)) focusNode(triggerRef.current);
		}
		wasOpenRef.current = isOpen;
	}, [isOpen, focusNode]);
	const changeOpen = (next, reason) => {
		closeReasonRef.current = next ? null : reason;
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const closePopover = (reason) => {
		if (!isOpen) return;
		changeOpen(false, reason);
	};
	const handleTriggerPress = (...args) => {
		triggerProps.onPress?.(...args);
		if (isOpen) closePopover("trigger");
		else changeOpen(true, "trigger");
	};
	const handlePanelLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setPanelSize((prev) => prev !== null && prev.width === width && prev.height === height ? prev : {
			width,
			height
		});
	};
	React.useEffect(() => {
		if (isPhoneWidth || !isOpen) {
			hasEnteredRef.current = false;
			return;
		}
		setMounted(true);
		triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({
			x,
			y,
			width,
			height
		}));
	}, [isOpen, isPhoneWidth]);
	React.useEffect(() => {
		if (isPhoneWidth || !mounted) return void 0;
		if (isOpen) {
			if (triggerRect === null || panelSize === null || hasEnteredRef.current) return void 0;
			hasEnteredRef.current = true;
			if (reducedMotion) {
				progress.setValue(1);
				focusNode(bodyRef.current);
				return;
			}
			const animation = Animated.timing(progress, {
				toValue: 1,
				duration: enterDuration,
				easing: toEasing(t.motionEasingStandard),
				useNativeDriver: false
			});
			animation.start(({ finished }) => {
				if (finished) focusNode(bodyRef.current);
			});
			return () => animation.stop();
		}
		const unmount = () => {
			setMounted(false);
			setTriggerRect(null);
			setPanelSize(null);
		};
		if (reducedMotion) {
			progress.setValue(0);
			unmount();
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: 0,
			duration: exitDuration,
			easing: toEasing(t.motionEasingExit),
			useNativeDriver: false
		});
		animation.start(({ finished }) => {
			if (finished) unmount();
		});
		return () => animation.stop();
	}, [
		isOpen,
		isPhoneWidth,
		mounted,
		triggerRect,
		panelSize,
		reducedMotion
	]);
	const clonedTrigger = React.cloneElement(trigger, {
		onPress: handleTriggerPress,
		expanded: isOpen
	});
	const triggerView = /* @__PURE__ */ React.createElement(View, {
		ref: triggerRef,
		collapsable: false,
		testID: "Popover.trigger"
	}, clonedTrigger);
	if (isPhoneWidth) {
		const sheetOverrides = {};
		for (const binding of SHEET_BINDINGS) if (overrides?.[binding]) sheetOverrides[binding] = overrides[binding];
		return /* @__PURE__ */ React.createElement(View, {
			ref,
			testID: "Popover"
		}, triggerView, /* @__PURE__ */ React.createElement(BottomSheet, {
			open: isOpen,
			heading: accessibleName ?? "",
			height: "content",
			onClose: (reason) => closePopover(SHEET_REASON[reason]),
			overrides: sheetOverrides
		}, children));
	}
	const position = triggerRect !== null ? computePopoverPosition(triggerRect, panelSize?.width ?? maxWidth, panelSize?.height ?? 0, placement, windowSize, offset) : null;
	const edge = position?.edge ?? "top";
	const slideFrom = edge === "top" || edge === "left" ? -enterDistance : enterDistance;
	const slide = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [slideFrom, 0]
	});
	const panelStyle = {
		position: "absolute",
		top: position?.top ?? 0,
		left: position?.left ?? 0,
		maxWidth,
		zIndex: layer,
		borderRadius: radius,
		...shadow,
		opacity: progress,
		transform: edge === "left" || edge === "right" ? [{ translateX: slide }] : [{ translateY: slide }]
	};
	const surfaceStyle = {
		borderRadius: radius,
		borderWidth,
		borderColor: border,
		backgroundColor: surfaceColor,
		padding: inset,
		gap: partGap,
		overflow: "hidden"
	};
	const headerStyle = {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "flex-end",
		gap: partGap
	};
	const arrowAlong = (length) => (length ?? arrowSize * 2) / 2 - arrowSize / 2;
	const arrowStyle = {
		position: "absolute",
		width: arrowSize,
		height: arrowSize,
		backgroundColor: surfaceColor,
		borderWidth,
		borderColor: border,
		transform: [{ rotate: "45deg" }],
		...edge === "top" ? {
			top: -arrowSize / 2,
			left: arrowAlong(panelSize?.width)
		} : edge === "bottom" ? {
			bottom: -arrowSize / 2,
			left: arrowAlong(panelSize?.width)
		} : edge === "left" ? {
			left: -arrowSize / 2,
			top: arrowAlong(panelSize?.height)
		} : {
			right: -arrowSize / 2,
			top: arrowAlong(panelSize?.height)
		}
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Popover"
	}, triggerView, /* @__PURE__ */ React.createElement(Modal, {
		visible: mounted,
		transparent: true,
		animationType: "none",
		onRequestClose: () => closePopover("escape"),
		statusBarTranslucent: true
	}, /* @__PURE__ */ React.createElement(View, { style: styles.host }, /* @__PURE__ */ React.createElement(Pressable, {
		style: styles.backdrop,
		onPress: () => {
			if (!modal) closePopover("outside");
		},
		accessible: false,
		testID: "Popover.backdrop"
	}), /* @__PURE__ */ React.createElement(FocusScope, {
		trapped: modal,
		active: mounted,
		autoFocus: "none",
		restoreFocus: false
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: panelStyle,
		onLayout: handlePanelLayout,
		role: "dialog",
		accessibilityLabel: accessibleName,
		accessibilityViewIsModal: modal,
		testID: "Popover.panel"
	}, showArrow ? /* @__PURE__ */ React.createElement(View, {
		style: arrowStyle,
		testID: "Popover.arrow"
	}) : null, /* @__PURE__ */ React.createElement(View, { style: surfaceStyle }, heading !== void 0 || dismissible ? /* @__PURE__ */ React.createElement(View, { style: headerStyle }, heading !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		style: styles.heading,
		testID: "Popover.heading"
	}, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel }, heading)) : null, dismissible ? /* @__PURE__ */ React.createElement(Button, {
		label: COPY$18.closeLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: () => closePopover("close-button")
	}) : null) : null, /* @__PURE__ */ React.createElement(View, {
		ref: bodyRef,
		testID: "Popover.body"
	}, /* @__PURE__ */ React.createElement(Box, null, children))))))));
}
const styles = StyleSheet.create({
	host: { flex: 1 },
	backdrop: {
		...StyleSheet.absoluteFill,
		backgroundColor: "transparent"
	},
	heading: { flex: 1 }
});
//#endregion
//#region src/Toast.tsx
const COPY$17 = {
	dismissLabel: "Dismiss",
	regionLabel: "Notifications"
};
/** `icon`: Icon `name={tone}` with `color.inverse.status.{tone}` forwarded to Icon's `overrides.color`; `neutral` renders no icon. */
const TONE_ICON = {
	neutral: null,
	success: {
		name: "success",
		color: "color.inverse.status.success"
	},
	warning: {
		name: "warning",
		color: "color.inverse.status.warning"
	},
	danger: {
		name: "danger",
		color: "color.inverse.status.danger"
	}
};
/** constants.shortDuration / longDuration: `motion.duration.loop` × multiplier, in ms. */
const DURATION_MULTIPLIER = {
	short: 6,
	long: 12
};
/**
* Set by a `ToastProvider` when `dismiss()` asks a shown toast to leave, so it runs its
* exit transition before reporting. `null` outside a provider and while the toast stays.
*/
const ToastExitContext = React.createContext(null);
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
* The toast rises and fades in over `enter` and fades out over `exit` before
* `onDismiss` fires; both are instant under reduced motion. A timer dismisses it after
* the effective duration unless that is `persistent` — which it always is once
* `actionLabel` is set or `tone` is `danger` (a `__DEV__` warning flags the mismatch).
* The timer pauses while the toast is touched and while the app is not in the
* foreground.
*
* Acknowledged native limits: F6 and Escape have no native equivalent, so toasts are
* reached by swiping through the accessibility order and left through the dismiss
* button, which is always shown for persistent toasts.
*/
function Toast({ message, tone = "neutral", actionLabel, duration: durationProp, dismissible = true, overrides, onAction, onDismiss }) {
	const duration = durationProp ?? "short";
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const shadow = overrides?.shadow ? resolveToken(t, overrides.shadow) : t.shadowOverlay;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.spaceSm;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const gap = overrides?.gap ? resolveToken(t, overrides.gap) : t.layoutGapNormal;
	const maxWidth = overrides?.maxWidth ? resolveToken(t, overrides.maxWidth) : t.layoutMaxWidthProse;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const enterOffset = overrides?.enterOffset ? resolveToken(t, overrides.enterOffset) : t.space2;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const forcedPersistent = actionLabel !== void 0 || tone === "danger";
	const loopResolved = t.motionDurationLoop > 0;
	const effectiveDuration = forcedPersistent || !loopResolved ? "persistent" : duration;
	const isDismissible = effectiveDuration === "persistent" ? true : dismissible;
	const icon = TONE_ICON[tone];
	const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);
	const [dismissReason, setDismissReason] = React.useState(null);
	const dismissedRef = React.useRef(false);
	const requestDismiss = React.useCallback((reason) => {
		if (dismissedRef.current) return;
		dismissedRef.current = true;
		setDismissReason(reason);
	}, []);
	React.useEffect(() => {
		if (__DEV__ && (durationProp === "short" || durationProp === "long") && forcedPersistent) console.warn(`Toast: duration "${durationProp}" is overridden to "persistent" because ${actionLabel !== void 0 ? "an action is present" : "tone is danger"}.`);
	}, []);
	React.useEffect(() => {
		if (Platform.OS === "ios" && message !== "") {
			if (tone === "danger") AccessibilityInfo.announceForAccessibility(message);
			else AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
		}
	}, []);
	const totalDurationRef = React.useRef(effectiveDuration === "persistent" ? null : t.motionDurationLoop * DURATION_MULTIPLIER[effectiveDuration]);
	const exitSignal = React.useContext(ToastExitContext);
	React.useEffect(() => {
		if (exitSignal !== null) requestDismiss(exitSignal);
	}, [exitSignal, requestDismiss]);
	const remainingRef = React.useRef(totalDurationRef.current ?? 0);
	const timerStartRef = React.useRef(0);
	const timerRef = React.useRef(null);
	const pausedRef = React.useRef(/* @__PURE__ */ new Set());
	const stopTimer = React.useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
			remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - timerStartRef.current));
		}
	}, []);
	const runTimer = React.useCallback(() => {
		if (totalDurationRef.current === null || dismissedRef.current || timerRef.current !== null || pausedRef.current.size > 0) return;
		timerStartRef.current = Date.now();
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			requestDismiss("timeout");
		}, remainingRef.current);
	}, [requestDismiss]);
	const pause = React.useCallback((source) => {
		pausedRef.current.add(source);
		stopTimer();
	}, [stopTimer]);
	const resume = React.useCallback((source) => {
		pausedRef.current.delete(source);
		runTimer();
	}, [runTimer]);
	React.useEffect(() => {
		if (AppState.currentState !== "active" && AppState.currentState != null) pausedRef.current.add("hidden");
		runTimer();
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") resume("hidden");
			else pause("hidden");
		});
		return () => {
			subscription.remove();
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [
		runTimer,
		pause,
		resume
	]);
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
		stopTimer();
		if (reducedMotion || !(exitDuration > 0)) {
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
		if (dismissedRef.current) return;
		onAction?.();
		requestDismiss("action");
	};
	const toastStyle = {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap,
		maxWidth,
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		borderRadius: radius,
		backgroundColor: t.colorInverseSurface,
		opacity: progress,
		transform: [{ translateY: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [enterOffset, 0]
		}) }],
		...shadow
	};
	const iconCellStyle = {
		height: lineHeight,
		justifyContent: "center"
	};
	return /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Toast",
		style: toastStyle,
		accessibilityRole: tone === "danger" ? "alert" : void 0,
		accessibilityLiveRegion: tone === "danger" ? "assertive" : "polite",
		accessibilityLabel: message,
		onTouchStart: () => pause("touch"),
		onTouchEnd: () => resume("touch"),
		onTouchCancel: () => resume("touch")
	}, icon !== null ? /* @__PURE__ */ React.createElement(View, {
		testID: "Toast.icon",
		style: iconCellStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: icon.name,
		overrides: { color: icon.color }
	})) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Toast.message",
		style: {
			flexShrink: 1,
			flexGrow: 1
		}
	}, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: t.colorInverseForeground }, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		overrides: {
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.fontSize,
			lineHeight: overrides?.lineHeight
		}
	}, message))), actionLabel !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Toast.actionButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: actionLabel,
		variant: "ghost",
		size: "sm",
		inverse: true,
		onPress: handleAction
	})) : null, isDismissible ? /* @__PURE__ */ React.createElement(View, { testID: "Toast.dismissButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$17.dismissLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		inverse: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorInverseLink
		}),
		onPress: () => requestDismiss("dismiss-button")
	})) : null);
}
const ToastContext = React.createContext(null);
/** The mounted `ToastProvider`'s dispatcher, so the module-level `toast()` works outside React. */
let activeDispatch = null;
const MAX_TOASTS = 3;
/**
* ToastProvider — mounted once at the app root. Renders the notification region (an
* absolutely positioned `View` at `layer.toast` z-index, `regionInset` above the
* bottom edge, centered, up to three toasts stacked newest-at-the-bottom) and exposes
* `useToast()` / the module-level `toast()` so any code can show one.
*/
function ToastProvider({ children, overrides }) {
	const { tokens: t } = useTheme();
	const [entries, setEntries] = React.useState([]);
	const entriesRef = React.useRef([]);
	const counterRef = React.useRef(0);
	const commit = React.useCallback((next) => {
		entriesRef.current = next;
		setEntries(next);
	}, []);
	/** Removes an entry and reports `reason` to its caller; a no-op when it is already gone. */
	const settle = React.useCallback((id, reason) => {
		const entry = entriesRef.current.find((candidate) => candidate.id === id);
		if (entry === void 0) return;
		commit(entriesRef.current.filter((candidate) => candidate.id !== id));
		entry.options.onDismiss?.(reason);
		entry.resolve({ reason });
	}, [commit]);
	const toast = React.useCallback((options) => new Promise((resolve) => {
		counterRef.current += 1;
		const id = options.toastId ?? `toast-${counterRef.current}`;
		settle(id, "replaced");
		const next = [...entriesRef.current, {
			id,
			options,
			resolve,
			exiting: null
		}];
		const evicted = next.length > MAX_TOASTS ? next.shift() : void 0;
		commit(next);
		if (evicted !== void 0) {
			evicted.options.onDismiss?.("replaced");
			evicted.resolve({ reason: "replaced" });
		}
	}), [commit, settle]);
	const dismiss = React.useCallback((toastId) => {
		commit(entriesRef.current.map((entry) => (toastId === void 0 || entry.id === toastId) && entry.exiting === null ? {
			...entry,
			exiting: "programmatic"
		} : entry));
	}, [commit]);
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
	const regionInset = overrides?.regionInset ? resolveToken(t, overrides.regionInset) : t.layoutGutter;
	const regionStyle = {
		position: "absolute",
		left: regionInset,
		right: regionInset,
		bottom: regionInset,
		alignItems: "center",
		gap: overrides?.stackGap ? resolveToken(t, overrides.stackGap) : t.layoutGapTight,
		zIndex: overrides?.layer ? resolveToken(t, overrides.layer) : t.layerToast
	};
	return /* @__PURE__ */ React.createElement(ToastContext.Provider, { value }, children, /* @__PURE__ */ React.createElement(View, {
		testID: "Toast.region",
		style: regionStyle,
		pointerEvents: "box-none",
		accessibilityLabel: COPY$17.regionLabel
	}, entries.map((entry) => /* @__PURE__ */ React.createElement(ToastExitContext.Provider, {
		key: entry.id,
		value: entry.exiting
	}, /* @__PURE__ */ React.createElement(Toast, {
		...entry.options,
		onDismiss: (reason) => settle(entry.id, reason)
	})))));
}
/** Returns `{ toast, dismiss }` bound to the nearest `ToastProvider`. Warns and no-ops without one. */
function useToast() {
	const context = React.useContext(ToastContext);
	if (context === null) {
		if (__DEV__) console.warn("useToast: no ToastProvider is mounted. Wrap the app root in <ToastProvider>.");
		return {
			toast: () => new Promise(() => void 0),
			dismiss: () => void 0
		};
	}
	return context;
}
/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` at the app root; warns and never resolves otherwise. */
function toast(options) {
	if (activeDispatch === null) {
		if (__DEV__) console.warn("toast(): no ToastProvider is mounted. Wrap the app root in <ToastProvider>.");
		return new Promise(() => void 0);
	}
	return activeDispatch.toast(options);
}
//#endregion
//#region src/SidePanel.tsx
const COPY$16 = { closeLabel: "Close" };
const DRAG_DISMISS_RATIO = .25;
const DRAG_DISMISS_VELOCITY = 1.5;
const DRAG_SLOP = 4;
const DECAY_MIN_VELOCITY = .5;
const DECAY_DECELERATION = .998;
/**
* SidePanel — the drawer: hidden off the edge until the trigger asks for it, then
* sliding in beside the page. Non-modal by default (the APG disclosure pattern);
* `modal` makes it a modal panel at the edge. Above `persistent`'s breakpoint it
* stops being an overlay and becomes a sidebar.
*
* When to use: primary navigation on phones (`start`), filters, a cart or a detail
* panel (`end`), a settings drawer. Not for a short list of actions (Menu,
* ActionSheet), a task with a few fields (Dialog, BottomSheet), or the page's point.
* Do not stack side panels.
*
* Overlay: a native `Modal` (`transparent`, `statusBarTranslucent`) holding a
* full-screen scrim `Pressable` (`color.overlay.scrim` when `modal` or `scrim`,
* transparent otherwise, reported as `scrim` either way) and an `Animated.View`
* surface at the `side` edge (`I18nManager.isRTL` flips it), its width the width
* binding capped at the window minus `edgeGutter`. It slides in over `enter` with
* `motion.easing.standard` and out over `exit` with `motion.easing.exit`, the scrim
* fading with it, instantly under reduced motion. The surface composes `FocusScope`
* (`trapped={modal}`), a header row with `Heading` (level 2, size lg) and the close
* `Button` (ghost, iconOnly), a scrolling `Box` body and a `Stack` footer. A
* `PanResponder` on the header — never on a touch that starts inside the close
* button's wrapping view — drags the surface toward its edge; past a quarter of its
* width or a fast flick it reports `swipe` and continues at the release velocity,
* otherwise it springs back over `exit`. `onRequestClose` (the Android back button)
* is `escape`; with `dismissible` false it reports without closing. Closing moves
* accessibility focus back to the trigger.
*
* Persistent (window width > the chosen `layout.maxWidth.*` token — a width check,
* not an orientation check): a plain `View` where SidePanel sits, with the `role`
* prop and `heading` as its label, the `border` on the edge facing the content, the
* width binding as its width and natural height (the screen scrolls, not the body),
* no Modal, scrim, close button or trigger.
*
* Native limits: the non-modal "page stays live" cannot be reproduced under `Modal`,
* which intercepts every touch; Tab stitching and modal Tab wrap have no native
* key-event equivalent; the inert page is the Modal window itself and scroll lock has
* no meaning. Crossing the persistent breakpoint changes the root, so the children
* remount.
*/
function SidePanel({ trigger, open, heading, hideHeading = false, children, footer, side = "start", width = "default", persistent = "never", role = "complementary", modal = false, scrim = true, dismissible = true, swipeable = true, onOpenChange, overrides, ref }) {
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
	const widthNarrow = (overrides?.widthNarrow ? resolveToken(t, overrides.widthNarrow) : t.space20) * 3;
	const widthWide = overrides?.widthWide ? resolveToken(t, overrides.widthWide) : t.layoutMaxWidthContent;
	const edgeGutter = overrides?.edgeGutter ? resolveToken(t, overrides.edgeGutter) : t.space12;
	const inset = overrides?.inset ? resolveToken(t, overrides.inset) : t.layoutInsetLg;
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapNormal;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.layoutGapLoose;
	const layer = overrides?.layer ? resolveToken(t, overrides.layer) : t.layerSheet;
	const enterDuration = overrides?.enter ? resolveToken(t, overrides.enter) : t.motionDurationBase;
	const exitDuration = overrides?.exit ? resolveToken(t, overrides.exit) : t.motionDurationFast;
	const persistentBreakpoint = persistent === "content" ? t.layoutMaxWidthContent : persistent === "page" ? t.layoutMaxWidthPage : null;
	const isPersistentActive = persistentBreakpoint !== null && windowWidth > persistentBreakpoint;
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
	const focusTrigger = () => {
		const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
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
	const requestCloseRef = React.useRef(requestClose);
	requestCloseRef.current = requestClose;
	const handleScrimPress = () => {
		if (dismissible) requestClose("scrim");
	};
	const handleCloseButtonPress = () => {
		requestClose("close-button");
	};
	const handleRequestClose = () => {
		if (!isOpen) return;
		if (dismissible) {
			requestClose("escape");
			return;
		}
		onOpenChange?.(false, "escape");
	};
	const closeTouchRef = React.useRef(false);
	const handleCloseTouchStart = () => {
		closeTouchRef.current = true;
	};
	const handleHeaderTouchEnd = () => {
		closeTouchRef.current = false;
	};
	const handleSurfaceLayout = (event) => {
		surfaceWidthRef.current = event.nativeEvent.layout.width;
	};
	const panResponder = React.useMemo(() => {
		const springBack = () => {
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
		};
		return PanResponder.create({
			onStartShouldSetPanResponder: () => false,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				if (!swipeable || !dismissible || closeTouchRef.current) return false;
				return (isPhysicalLeft ? -gestureState.dx : gestureState.dx) > DRAG_SLOP && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
			},
			onPanResponderMove: (_, gestureState) => {
				const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
				dragX.setValue(awayDx > 0 ? gestureState.dx : 0);
			},
			onPanResponderRelease: (_, gestureState) => {
				const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
				const awayVx = isPhysicalLeft ? -gestureState.vx : gestureState.vx;
				if (awayDx <= (surfaceWidthRef.current || overlayPanelWidth) * DRAG_DISMISS_RATIO && awayVx <= DRAG_DISMISS_VELOCITY) {
					springBack();
					return;
				}
				requestCloseRef.current("swipe");
				if (reducedMotion) {
					dragX.setValue(isPhysicalLeft ? -windowWidth : windowWidth);
					return;
				}
				const speed = Math.max(awayVx, DECAY_MIN_VELOCITY);
				Animated.decay(dragX, {
					velocity: isPhysicalLeft ? -speed : speed,
					deceleration: DECAY_DECELERATION,
					useNativeDriver: false
				}).start();
			},
			onPanResponderTerminate: springBack
		});
	}, [
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
	const triggerChild = React.isValidElement(trigger) ? trigger : null;
	const clonedTrigger = triggerChild !== null ? React.cloneElement(triggerChild, {
		onPress: (event) => {
			triggerChild.props.onPress?.(event);
			handleTriggerPress();
		},
		expanded: isOpen
	}) : trigger;
	const bodyBoxOverrides = overrides?.inset ? { paddingBlock: overrides.inset } : void 0;
	const footerStackOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : void 0;
	const footerStyle = {
		paddingHorizontal: inset,
		paddingBottom: inset
	};
	const footerPart = footer !== void 0 ? /* @__PURE__ */ React.createElement(SafeAreaView, {
		style: footerStyle,
		testID: "SidePanel.footer"
	}, /* @__PURE__ */ React.createElement(Stack, {
		direction: "horizontal",
		gap: "tight",
		justify: "end",
		overrides: footerStackOverrides
	}, footer)) : null;
	const headingPart = /* @__PURE__ */ React.createElement(Heading, {
		level: 2,
		size: "lg"
	}, heading);
	if (isPersistentActive) {
		const sidebarStyle = {
			width: widthToken,
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
		const sidebarHeaderStyle = {
			paddingHorizontal: inset,
			paddingTop: inset
		};
		return /* @__PURE__ */ React.createElement(View, {
			ref,
			style: sidebarStyle,
			role,
			accessibilityLabel: heading,
			testID: "SidePanel"
		}, !hideHeading ? /* @__PURE__ */ React.createElement(View, {
			style: sidebarHeaderStyle,
			testID: "SidePanel.header"
		}, headingPart) : null, /* @__PURE__ */ React.createElement(View, { testID: "SidePanel.body" }, /* @__PURE__ */ React.createElement(Box, {
			inset: "lg",
			overrides: bodyBoxOverrides
		}, children)), footerPart);
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
		justifyContent: hideHeading ? "flex-end" : "space-between",
		gap: headerGap,
		paddingHorizontal: inset,
		paddingTop: inset
	};
	const bodyFlexStyle = { flexShrink: 1 };
	const bodyContentStyle = { flexGrow: 1 };
	const showHeader = !hideHeading || dismissible;
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
		ref,
		style: surfaceStyle,
		onLayout: handleSurfaceLayout,
		accessibilityViewIsModal: modal,
		accessibilityLabel: heading,
		testID: "SidePanel.surface"
	}, showHeader ? /* @__PURE__ */ React.createElement(View, {
		...swipeable && dismissible ? panResponder.panHandlers : null,
		onTouchEnd: handleHeaderTouchEnd,
		onTouchCancel: handleHeaderTouchEnd,
		style: headerStyle,
		testID: "SidePanel.header"
	}, !hideHeading ? headingPart : null, dismissible ? /* @__PURE__ */ React.createElement(View, {
		onTouchStart: handleCloseTouchStart,
		testID: "SidePanel.closeButton"
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$16.closeLabel,
		variant: "ghost",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleCloseButtonPress
	})) : null) : null, /* @__PURE__ */ React.createElement(ScrollView, {
		testID: "SidePanel.body",
		style: bodyFlexStyle,
		contentContainerStyle: bodyContentStyle,
		keyboardShouldPersistTaps: "handled"
	}, /* @__PURE__ */ React.createElement(Box, {
		inset: "lg",
		overrides: bodyBoxOverrides
	}, children)), footerPart))))));
}
/**
* A `PanResponder` for the screen root that opens a controlled `SidePanel` on a swipe
* from its edge — additive to the trigger, never the only way in (WCAG 2.5.1). The
* gesture has to start at the edge of the whole screen, outside the panel's own
* (unmounted-when-closed) surface, so the consumer spreads `panHandlers` onto their
* root view.
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
			const startsAtEdge = isPhysicalLeft ? gestureState.x0 <= edgeZone : gestureState.x0 >= windowWidth - edgeZone;
			const inwardDx = isPhysicalLeft ? gestureState.dx : -gestureState.dx;
			return startsAtEdge && inwardDx > DRAG_SLOP && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
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
const COPY$15 = { position: (index, total) => "{index} of {total}".replace("{index}", String(index)).replace("{total}", String(total)) };
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
const isWeb$1 = Platform.OS === "web";
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
function Tabs({ tabs, children, label, value, defaultValue, activation = "automatic", orientation = "horizontal", fit = "start", keepMounted = false, onChange, overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const isHorizontal = orientation === "horizontal";
	const fill = fit === "fill" && isHorizontal;
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
				if (!tabs.some((tab) => tab.id === id)) console.warn(`Tabs: TabPanel id "${id}" has no matching entry in tabs[]; it is not rendered.`);
			});
		}
	}, [tabs, panelsById]);
	const tabPaddingBlock = overrides?.tabPaddingBlock ? resolveToken(t, overrides.tabPaddingBlock) : t.spaceSm;
	const tabPaddingInline = overrides?.tabPaddingInline ? resolveToken(t, overrides.tabPaddingInline) : t.spaceMd;
	const tabGap = overrides?.tabGap ? resolveToken(t, overrides.tabGap) : t.layoutGapTight;
	const listGap = overrides?.listGap ? resolveToken(t, overrides.listGap) : t.layoutGapNone;
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
	const indicatorColor = t.colorControlSelectedBackground;
	const indicatorThickness = t.borderWidthFocus;
	const tabLayoutsRef = React.useRef(/* @__PURE__ */ new Map());
	const tabRefs = React.useRef(/* @__PURE__ */ new Map());
	const hasMeasuredIndicatorRef = React.useRef(false);
	const indicatorOffset = React.useRef(new Animated.Value(0)).current;
	const indicatorExtent = React.useRef(new Animated.Value(0)).current;
	const scrollRef = React.useRef(null);
	const scrollOffsetRef = React.useRef(0);
	const viewportSizeRef = React.useRef(0);
	const focusedIdRef = React.useRef(void 0);
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
		const easing = toEasing(t.motionEasingStandard);
		Animated.parallel([Animated.timing(indicatorOffset, {
			toValue: offset,
			duration: transitionDuration,
			easing,
			useNativeDriver: false
		}), Animated.timing(indicatorExtent, {
			toValue: extent,
			duration: transitionDuration,
			easing,
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
		if (fill) return;
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
			scrollView.scrollTo(isHorizontal ? {
				x: Math.max(0, target),
				animated
			} : {
				y: Math.max(0, target),
				animated
			});
		}
	}, [
		fill,
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
	const handleKeyDown = (event) => {
		const key = event.key ?? event.nativeEvent?.key;
		const enabled = tabs.filter((tab) => tab.disabled !== true);
		if (enabled.length === 0 || key === void 0) return;
		const fromId = focusedIdRef.current ?? currentValue;
		const fromIndex = enabled.findIndex((tab) => tab.id === fromId);
		const nextKey = isHorizontal ? rtl ? "ArrowLeft" : "ArrowRight" : "ArrowDown";
		const prevKey = isHorizontal ? rtl ? "ArrowRight" : "ArrowLeft" : "ArrowUp";
		let targetIndex;
		if (key === nextKey) targetIndex = fromIndex < 0 ? 0 : (fromIndex + 1) % enabled.length;
		else if (key === prevKey) targetIndex = fromIndex <= 0 ? enabled.length - 1 : fromIndex - 1;
		else if (key === "Home") targetIndex = 0;
		else if (key === "End") targetIndex = enabled.length - 1;
		else return;
		event.preventDefault?.();
		const target = enabled[targetIndex];
		tabRefs.current.get(target.id)?.focus();
		if (activation === "automatic") selectTab(target.id);
	};
	const keyProps = isWeb$1 ? { onKeyDown: handleKeyDown } : {};
	const styleTokens = {
		paddingBlock: tabPaddingBlock,
		paddingInline: tabPaddingInline,
		gap: tabGap,
		minTarget: t.sizeTargetComfortable,
		radius,
		hoverBackground: t.colorBackgroundSubtle,
		disabledOpacity,
		focusRingColor: t.colorBorderFocus,
		focusRingWidth: t.borderWidthFocus,
		fontFamily,
		fontSize,
		fontWeight,
		lineHeightMultiplier,
		color: t.colorForegroundMuted,
		selectedColor: t.colorForegroundStrong,
		badgeColor: t.colorForegroundMuted,
		badgeSize
	};
	const tabStopId = tabs.some((tab) => tab.id === currentValue && tab.disabled !== true) ? currentValue : firstEnabledId;
	const tabButtons = tabs.map((tab, index) => /* @__PURE__ */ React.createElement(TabButton, {
		key: tab.id,
		tab,
		position: COPY$15.position(index + 1, tabs.length),
		selected: tab.id === currentValue,
		tabStop: tab.id === tabStopId,
		fill,
		horizontal: isHorizontal,
		styleTokens,
		onSelect: selectTab,
		onMeasured: handleTabLayout,
		onFocusChange: (id, focused) => {
			focusedIdRef.current = focused ? id : focusedIdRef.current === id ? void 0 : focusedIdRef.current;
		},
		registerRef: (id, instance) => {
			if (instance) tabRefs.current.set(id, instance);
			else tabRefs.current.delete(id);
		}
	}));
	const listContentStyle = {
		flexDirection: isHorizontal ? "row" : "column",
		alignItems: "stretch",
		flexGrow: fill ? 1 : 0,
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
	const indicator = /* @__PURE__ */ React.createElement(Animated.View, {
		style: indicatorStyle,
		testID: "Tabs.indicator",
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	});
	const list = !fill ? /* @__PURE__ */ React.createElement(ScrollView, {
		ref: scrollRef,
		horizontal: isHorizontal,
		showsHorizontalScrollIndicator: false,
		showsVerticalScrollIndicator: false,
		onScroll: handleScroll,
		scrollEventThrottle: 16,
		onLayout: handleViewportLayout,
		style: { flexGrow: 0 }
	}, /* @__PURE__ */ React.createElement(View, {
		...keyProps,
		accessibilityRole: "tablist",
		accessibilityLabel: label,
		testID: "Tabs.tablist",
		style: listContentStyle
	}, tabButtons, indicator)) : /* @__PURE__ */ React.createElement(View, {
		onLayout: handleViewportLayout,
		...keyProps,
		accessibilityRole: "tablist",
		accessibilityLabel: label,
		testID: "Tabs.tablist",
		style: listContentStyle
	}, tabButtons, indicator);
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Tabs",
		style: {
			flexDirection: isHorizontal ? "column" : "row",
			gap: panelGap
		}
	}, list, /* @__PURE__ */ React.createElement(View, { style: { flex: 1 } }, tabs.map((tab) => {
		const selected = tab.id === currentValue;
		if (!selected && !keepMounted || !panelsById.has(tab.id)) return null;
		return /* @__PURE__ */ React.createElement(View, {
			key: tab.id,
			testID: "Tabs.panel",
			accessibilityLabel: tab.label,
			style: { display: selected ? "flex" : "none" },
			accessibilityElementsHidden: !selected,
			importantForAccessibility: selected ? "auto" : "no-hide-descendants"
		}, panelsById.get(tab.id));
	})));
}
/** One tab. Its own component so focus/hover state does not re-render the whole list. */
function TabButton({ tab, position, selected, tabStop, fill, horizontal, styleTokens: s, onSelect, onMeasured, onFocusChange, registerRef }) {
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
	const disabled = tab.disabled === true;
	const foreground = selected ? s.selectedColor : s.color;
	const rowStyle = ({ pressed }) => ({
		flexDirection: "row",
		alignItems: "center",
		flexGrow: fill ? 1 : 0,
		flexShrink: fill ? 1 : 0,
		flexBasis: fill ? 0 : "auto",
		justifyContent: fill && horizontal ? "center" : "flex-start",
		gap: s.gap,
		minHeight: s.minTarget,
		minWidth: s.minTarget,
		paddingVertical: s.paddingBlock,
		paddingHorizontal: s.paddingInline,
		borderRadius: s.radius,
		backgroundColor: (hovered || pressed) && !disabled ? s.hoverBackground : "transparent",
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
	const accessibleName = tab.badge !== void 0 ? `${tab.label} ${tab.badge}` : tab.label;
	const webFocusProps = Platform.OS === "web" ? { focusable: tabStop && !disabled } : {};
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: (instance) => registerRef(tab.id, instance),
		accessibilityRole: "tab",
		accessibilityLabel: accessibleName,
		accessibilityState: {
			selected,
			disabled
		},
		accessibilityValue: { text: position },
		...webFocusProps,
		onPress: () => {
			if (!disabled) onSelect(tab.id);
		},
		onFocus: () => {
			setFocused(true);
			onFocusChange(tab.id, true);
		},
		onBlur: () => {
			setFocused(false);
			onFocusChange(tab.id, false);
		},
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		onLayout: (event) => onMeasured(tab.id, event),
		style: rowStyle,
		testID: "Tabs.tab"
	}, tab.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Tabs.tabIcon",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: tab.icon,
		size: "md",
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
const FONT_SIZE = {
	sm: "fontSizeSm",
	md: "fontSizeMd"
};
const isWeb = Platform.OS === "web";
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
function SegmentedControl({ label, options, value, defaultValue, iconOnly = false, size = "md", fill = false, onChange, overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const rtl = I18nManager.isRTL;
	const enabledOptions = options.filter((option) => option.disabled !== true);
	const firstEnabledValue = enabledOptions[0]?.value;
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledValue);
	const currentValue = isControlled ? value : internalValue;
	const hasWarnedIconRef = React.useRef(false);
	React.useEffect(() => {
		if (__DEV__ && iconOnly && !hasWarnedIconRef.current) {
			const missing = options.filter((option) => option.icon === void 0).map((option) => `"${option.value}"`);
			if (missing.length > 0) {
				hasWarnedIconRef.current = true;
				console.warn(`SegmentedControl: iconOnly is set but option ${missing.join(", ")} has no icon; its label is shown as text instead.`);
			}
		}
	}, [iconOnly, options]);
	const groupPadding = overrides?.groupPadding ? resolveToken(t, overrides.groupPadding) : t.space1;
	const groupRadius = overrides?.groupRadius ? resolveToken(t, overrides.groupRadius) : t.radiusMd;
	const segmentShadow = overrides?.segmentShadow ? resolveToken(t, overrides.segmentShadow) : t.shadowRaised;
	const segmentRadius = overrides?.segmentRadius ? resolveToken(t, overrides.segmentRadius) : t.radiusSm;
	const segmentPaddingInline = overrides?.segmentPaddingInline ? resolveToken(t, overrides.segmentPaddingInline) : t.spaceMd;
	const paddingBlockMd = overrides?.segmentPaddingBlock ? resolveToken(t, overrides.segmentPaddingBlock) : t.space1;
	const paddingBlockSm = overrides?.paddingBlockSm ? resolveToken(t, overrides.paddingBlockSm) : t.space1;
	const segmentGap = overrides?.segmentGap ? resolveToken(t, overrides.segmentGap) : t.layoutGapTight;
	const segmentSpacing = overrides?.segmentSpacing ? resolveToken(t, overrides.segmentSpacing) : t.space0;
	const selectedWeight = overrides?.selectedWeight ? resolveToken(t, overrides.selectedWeight) : t.fontWeightSemibold;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE[size]];
	const fontWeight = overrides?.fontWeight ? resolveToken(t, overrides.fontWeight) : t.fontWeightMedium;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const segmentLayoutsRef = React.useRef(/* @__PURE__ */ new Map());
	const segmentRefs = React.useRef(/* @__PURE__ */ new Map());
	const focusedValueRef = React.useRef(void 0);
	const hasMeasuredRef = React.useRef(false);
	const pillX = React.useRef(new Animated.Value(0)).current;
	const pillWidth = React.useRef(new Animated.Value(0)).current;
	const pillY = React.useRef(new Animated.Value(0)).current;
	const pillHeight = React.useRef(new Animated.Value(0)).current;
	const updatePill = React.useCallback((optionValue) => {
		const layout = segmentLayoutsRef.current.get(optionValue);
		if (!layout) return;
		pillY.setValue(layout.y);
		pillHeight.setValue(layout.height);
		if (reducedMotion || !hasMeasuredRef.current) {
			pillX.setValue(layout.x);
			pillWidth.setValue(layout.width);
			hasMeasuredRef.current = true;
			return;
		}
		const easing = toEasing(t.motionEasingStandard);
		Animated.parallel([Animated.timing(pillX, {
			toValue: layout.x,
			duration: transitionDuration,
			easing,
			useNativeDriver: false
		}), Animated.timing(pillWidth, {
			toValue: layout.width,
			duration: transitionDuration,
			easing,
			useNativeDriver: false
		})]).start();
	}, [
		reducedMotion,
		transitionDuration,
		t.motionEasingStandard,
		pillX,
		pillWidth,
		pillY,
		pillHeight
	]);
	const hasSelectedOption = options.some((option) => option.value === currentValue);
	React.useEffect(() => {
		if (currentValue !== void 0 && hasSelectedOption) updatePill(currentValue);
		else hasMeasuredRef.current = false;
	}, [
		currentValue,
		hasSelectedOption,
		updatePill
	]);
	const handleSegmentLayout = (optionValue, event) => {
		const { x, y, width, height } = event.nativeEvent.layout;
		segmentLayoutsRef.current.set(optionValue, {
			x,
			y,
			width,
			height
		});
		if (optionValue === currentValue) updatePill(optionValue);
	};
	const select = (optionValue) => {
		const option = options.find((candidate) => candidate.value === optionValue);
		if (!option || option.disabled === true || optionValue === currentValue) return;
		if (!isControlled) setInternalValue(optionValue);
		onChange?.(optionValue);
	};
	const tabStopValue = enabledOptions.some((option) => option.value === currentValue) ? currentValue : firstEnabledValue;
	const handleKeyDown = (event) => {
		const key = event.key ?? event.nativeEvent?.key;
		if (enabledOptions.length === 0 || key === void 0) return;
		const fromValue = focusedValueRef.current ?? tabStopValue;
		const fromIndex = enabledOptions.findIndex((option) => option.value === fromValue);
		const nextKeys = rtl ? ["ArrowLeft", "ArrowDown"] : ["ArrowRight", "ArrowDown"];
		const prevKeys = rtl ? ["ArrowRight", "ArrowUp"] : ["ArrowLeft", "ArrowUp"];
		let targetIndex;
		if (nextKeys.includes(key)) targetIndex = fromIndex < 0 ? 0 : (fromIndex + 1) % enabledOptions.length;
		else if (prevKeys.includes(key)) targetIndex = fromIndex <= 0 ? enabledOptions.length - 1 : fromIndex - 1;
		else if (key === "Home") targetIndex = 0;
		else if (key === "End") targetIndex = enabledOptions.length - 1;
		else return;
		event.preventDefault?.();
		const target = enabledOptions[targetIndex];
		segmentRefs.current.get(target.value)?.focus();
		select(target.value);
	};
	const keyProps = isWeb ? { onKeyDown: handleKeyDown } : {};
	const styleTokens = {
		paddingInline: segmentPaddingInline,
		paddingBlock: size === "sm" ? paddingBlockSm : paddingBlockMd,
		gap: segmentGap,
		minTarget: t.sizeTargetComfortable,
		disabledOpacity,
		focusRingColor: t.colorBorderFocus,
		focusRingWidth: t.borderWidthFocus,
		radius: segmentRadius,
		fontFamily,
		fontSize,
		fontWeight,
		selectedWeight,
		lineHeightMultiplier,
		color: t.colorForegroundMuted,
		selectedColor: t.colorForegroundStrong
	};
	const groupStyle = {
		flexDirection: "row",
		alignItems: "stretch",
		alignSelf: fill ? "stretch" : "flex-start",
		position: "relative",
		gap: segmentSpacing,
		padding: groupPadding,
		borderRadius: groupRadius,
		backgroundColor: t.colorBackgroundStrong
	};
	const pillStyle = {
		position: "absolute",
		left: 0,
		top: pillY,
		width: pillWidth,
		height: pillHeight,
		borderRadius: segmentRadius,
		backgroundColor: t.colorBackground,
		transform: [{ translateX: pillX }],
		...segmentShadow
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		...keyProps,
		testID: "SegmentedControl",
		accessibilityRole: "radiogroup",
		accessibilityLabel: label,
		style: groupStyle
	}, hasSelectedOption ? /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "SegmentedControl.indicator",
		style: pillStyle,
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}) : null, options.map((option) => /* @__PURE__ */ React.createElement(Segment, {
		key: option.value,
		option,
		selected: option.value === currentValue,
		tabStop: option.value === tabStopValue,
		iconOnly,
		fill,
		styleTokens,
		onSelect: select,
		onMeasured: handleSegmentLayout,
		onFocusChange: (optionValue, focused) => {
			focusedValueRef.current = focused ? optionValue : focusedValueRef.current === optionValue ? void 0 : focusedValueRef.current;
		},
		registerRef: (optionValue, instance) => {
			if (instance) segmentRefs.current.set(optionValue, instance);
			else segmentRefs.current.delete(optionValue);
		}
	})));
}
/** One segment. Its own component so focus state does not re-render the whole group. */
function Segment({ option, selected, tabStop, iconOnly, fill, styleTokens: s, onSelect, onMeasured, onFocusChange, registerRef }) {
	const [focused, setFocused] = React.useState(false);
	const disabled = option.disabled === true;
	const foreground = selected ? s.selectedColor : s.color;
	const rowStyle = (_state) => ({
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		flexGrow: fill ? 1 : 0,
		flexShrink: fill ? 1 : 0,
		flexBasis: fill ? 0 : "auto",
		gap: s.gap,
		minWidth: s.minTarget,
		minHeight: s.minTarget,
		paddingHorizontal: s.paddingInline,
		paddingVertical: s.paddingBlock,
		borderWidth: s.focusRingWidth,
		borderColor: focused ? s.focusRingColor : "transparent",
		borderRadius: s.radius,
		opacity: disabled ? s.disabledOpacity : 1
	});
	const showIcon = option.icon !== void 0;
	const showLabel = !iconOnly || !showIcon;
	const labelStyle = {
		fontFamily: s.fontFamily,
		fontSize: s.fontSize,
		fontWeight: toFontWeight(selected ? s.selectedWeight : s.fontWeight),
		lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
		color: foreground
	};
	const webFocusProps = isWeb ? { focusable: tabStop && !disabled } : {};
	return /* @__PURE__ */ React.createElement(Pressable, {
		ref: (instance) => registerRef(option.value, instance),
		testID: "SegmentedControl.segment",
		accessibilityRole: "radio",
		accessibilityLabel: option.label,
		accessibilityState: {
			checked: selected,
			disabled
		},
		...webFocusProps,
		onPress: () => {
			if (!disabled) onSelect(option.value);
		},
		onFocus: () => {
			setFocused(true);
			onFocusChange(option.value, true);
		},
		onBlur: () => {
			setFocused(false);
			onFocusChange(option.value, false);
		},
		onLayout: (event) => onMeasured(option.value, event),
		style: rowStyle
	}, showIcon ? /* @__PURE__ */ React.createElement(View, {
		testID: "SegmentedControl.segmentIcon",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: option.icon,
		size: "sm",
		color: foreground
	})) : null, !showLabel ? null : /* @__PURE__ */ React.createElement(Text$1, {
		numberOfLines: 1,
		style: labelStyle,
		testID: "SegmentedControl.segmentLabel"
	}, option.label));
}
//#endregion
//#region src/Listbox.tsx
const COPY$14 = {
	empty: "No options",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	selectedCount: "{count} selected",
	loading: "Loading…"
};
function withLabel(template, label) {
	return template.replace("{label}", label);
}
function isGroup$3(item) {
	return "group" in item;
}
/** Rows in display order; groups flatten into a label row followed by their options, and empty groups are omitted. */
function flattenRows(items) {
	const rows = [];
	items.forEach((item, itemIndex) => {
		if (isGroup$3(item)) {
			if (item.options.length === 0) return;
			rows.push({
				kind: "group",
				key: `group-${itemIndex}`,
				label: item.group
			});
			item.options.forEach((option, optionIndex) => rows.push({
				kind: "option",
				key: `${itemIndex}-${optionIndex}-${option.value}`,
				option
			}));
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
		if (isGroup$3(item)) options.push(...item.options);
		else options.push(item);
	});
	return options;
}
function toSelectedArray(selection) {
	if (Array.isArray(selection)) return selection;
	return selection !== void 0 && selection !== "" ? [selection] : [];
}
/** `initialActiveValue` when it names an enabled option, else the first selected, else the first enabled. */
function resolveInitialActive(items, initialActiveValue, selection) {
	const enabled = flattenOptions$2(items).filter((option) => option.disabled !== true);
	if (initialActiveValue !== void 0 && enabled.some((option) => option.value === initialActiveValue)) return initialActiveValue;
	const selected = toSelectedArray(selection);
	return enabled.find((option) => selected.includes(option.value))?.value ?? enabled[0]?.value ?? null;
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
* typeahead, Shift+Arrow and Ctrl+A have no native form, and `selectionFollowsFocus` has
* no runtime effect. The active row (focused, hovered, or pre-highlighted) gets
* `color.background.subtle`; focus draws a `color.border.focus` border that is always
* reserved. Selection shows by weight, and with `multiple` by the check (an invisible slot
* when unselected, so labels align). Inside a Form the list registers by `name`; the
* message below it follows `error` → Form error → `copy.required` / `copy.invalid`.
*/
function Listbox({ label, options, multiple = false, value, defaultValue, selectionFollowsFocus: _selectionFollowsFocus = true, required = false, invalid = false, error, embedded = false, initialActiveValue, loading = false, disabled = false, name, emptyMessage, maxVisible = "8", overrides, ref, onChange, onActiveChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const listRef = React.useRef(null);
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [activeValue, setActiveValue] = React.useState(() => resolveInitialActive(options, initialActiveValue, value ?? defaultValue));
	const [focusedValue, setFocusedValue] = React.useState(null);
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const orderedValues = React.useMemo(() => flattenOptions$2(options).map((option) => option.value), [options]);
	const rows = React.useMemo(() => flattenRows(options), [options]);
	const selectedValues = multiple ? toSelectedArray(currentValue) : [];
	const selectedValue = !multiple && typeof currentValue === "string" ? currentValue : void 0;
	const nothingSelected = multiple ? selectedValues.length === 0 : selectedValue === void 0 || selectedValue === "";
	const lastInitialActive = React.useRef(initialActiveValue);
	React.useEffect(() => {
		if (lastInitialActive.current === initialActiveValue) return;
		lastInitialActive.current = initialActiveValue;
		if (focusedValue === null) setActiveValue(resolveInitialActive(options, initialActiveValue, currentValue));
	}, [
		initialActiveValue,
		options,
		currentValue,
		focusedValue
	]);
	const hasError = error !== void 0 && error !== "";
	const formError = name !== void 0 ? form?.errors[name] : void 0;
	const isInvalid = invalid || hasError || formError !== void 0;
	const displayedError = hasError ? error : formError ?? (invalid ? withLabel(required && nothingSelected ? COPY$14.required : COPY$14.invalid, label) : void 0);
	const summarised = form !== null && form.errorSummary;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && toSelectedArray(candidate).length === 0) return withLabel(COPY$14.required, label);
		if (invalid) return withLabel(COPY$14.invalid, label);
		return null;
	}, [
		required,
		label,
		error,
		invalid
	]);
	const latest = React.useRef({
		currentValue,
		validateValue,
		label
	});
	latest.current = {
		currentValue,
		validateValue,
		label
	};
	const handle = React.useMemo(() => ({
		get label() {
			return latest.current.label;
		},
		getValue: () => {
			const current = latest.current.currentValue;
			if (multiple) {
				const selected = toSelectedArray(current);
				return selected.length > 0 ? selected : void 0;
			}
			return typeof current === "string" && current !== "" ? current : void 0;
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
	const activate = (next) => {
		if (next === activeValue) return;
		setActiveValue(next);
		onActiveChange?.(next);
	};
	const handleFocusOption = (optionValue) => {
		setFocusedValue(optionValue);
		if (!isDisabled) activate(optionValue);
	};
	const handleBlurOption = (optionValue) => {
		setFocusedValue((prev) => prev === optionValue ? null : prev);
		if (!isDisabled && activeValue === optionValue) activate(null);
	};
	const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorderStrong;
	const borderInvalid = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
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
	const rowHeight = Math.max(t.sizeTargetMin, toLineHeight(fontSize, lineHeightMultiplier) + 2 * optionPaddingBlock) + 2 * t.borderWidthFocus;
	const rowCount = maxVisible === "all" ? null : Number(maxVisible);
	const maxHeight = rowCount === null ? void 0 : rowCount * rowHeight + 2 * listPadding + (embedded ? 0 : 2 * borderWidth);
	const placeholderText = loading ? COPY$14.loading : emptyMessage ?? COPY$14.empty;
	const rootStyle = {
		flexDirection: "column",
		gap: partGap
	};
	const listStyle = {
		flexGrow: 0,
		...embedded ? null : {
			borderWidth,
			borderColor: isInvalid ? borderInvalid : border,
			borderRadius: radius,
			backgroundColor: t.colorBackground,
			overflow: "hidden"
		},
		...maxHeight !== void 0 ? { maxHeight } : null,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const listContentStyle = { padding: listPadding };
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
	const optionRowStyle = (active, focused, optionDisabled) => ({
		flexDirection: "row",
		alignItems: "flex-start",
		gap: optionGap,
		minHeight: t.sizeTargetMin + 2 * t.borderWidthFocus,
		paddingVertical: optionPaddingBlock,
		paddingHorizontal: optionPaddingInline,
		borderRadius: optionRadius,
		backgroundColor: active && !isDisabled ? t.colorBackgroundSubtle : "transparent",
		borderWidth: t.borderWidthFocus,
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
		flexDirection: "column"
	};
	const emptyRowStyle = {
		paddingVertical: optionPaddingBlock,
		paddingHorizontal: optionPaddingInline
	};
	const typographyOverrides = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const renderItem = ({ item }) => {
		if (item.kind === "group") return /* @__PURE__ */ React.createElement(View, { style: groupLabelRowStyle }, /* @__PURE__ */ React.createElement(Text$1, {
			style: groupLabelStyle,
			testID: "Listbox.groupLabel"
		}, item.label));
		const option = item.option;
		const selected = multiple ? selectedValues.includes(option.value) : option.value === selectedValue;
		const optionDisabled = isDisabled || option.disabled === true;
		const accessibleLabel = option.description !== void 0 ? `${option.label}. ${option.description}` : option.label;
		return /* @__PURE__ */ React.createElement(Pressable, {
			accessibilityRole: "menuitem",
			accessibilityLabel: accessibleLabel,
			accessibilityState: {
				selected,
				checked: multiple ? selected : void 0,
				disabled: optionDisabled
			},
			onPress: () => selectOption(option),
			onFocus: () => handleFocusOption(option.value),
			onBlur: () => handleBlurOption(option.value),
			onHoverIn: () => {
				if (!optionDisabled) activate(option.value);
			},
			style: optionRowStyle(activeValue === option.value, focusedValue === option.value, optionDisabled),
			testID: "Listbox.option"
		}, multiple ? /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			style: { opacity: selected ? 1 : 0 },
			testID: "Listbox.optionCheck"
		}, /* @__PURE__ */ React.createElement(Icon, {
			name: "check",
			size: "sm",
			color: t.colorControlSelectedBackground
		})) : null, option.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			testID: "Listbox.optionIcon"
		}, /* @__PURE__ */ React.createElement(Icon, {
			name: option.icon,
			size: "sm",
			color: t.colorForeground
		})) : null, /* @__PURE__ */ React.createElement(View, { style: optionTextColumnStyle }, /* @__PURE__ */ React.createElement(Text$1, {
			numberOfLines: 1,
			style: optionLabelStyle(selected),
			testID: "Listbox.optionLabel"
		}, option.label), option.description !== void 0 ? /* @__PURE__ */ React.createElement(Text$1, {
			numberOfLines: 1,
			style: optionDescriptionStyle,
			testID: "Listbox.optionDescription"
		}, option.description) : null));
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Listbox",
		style: rootStyle
	}, /* @__PURE__ */ React.createElement(FlatList, {
		ref: listRef,
		data: rows,
		keyExtractor: (row) => row.key,
		renderItem,
		style: listStyle,
		contentContainerStyle: listContentStyle,
		accessibilityRole: "list",
		accessibilityLabel: label,
		accessibilityState: {
			disabled: isDisabled,
			busy: loading
		},
		accessibilityValue: multiple ? { text: COPY$14.selectedCount.replace("{count}", String(selectedValues.length)) } : void 0,
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			style: emptyRowStyle,
			testID: "Listbox.emptyState"
		}, /* @__PURE__ */ React.createElement(Text, {
			tone: "muted",
			overrides: typographyOverrides
		}, placeholderText)),
		testID: "Listbox.list"
	}), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "Listbox.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger"
	}, displayedError)) : null);
}
//#endregion
//#region src/Select.tsx
const COPY$13 = {
	placeholder: "Select…",
	selectedCount: "{count} selected",
	done: "Done",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
function isGroup$2(item) {
	return "group" in item;
}
function flattenOptions$1(items) {
	const options = [];
	items.forEach((item) => {
		if (isGroup$2(item)) options.push(...item.options);
		else options.push(item);
	});
	return options;
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
* `accessibilityValue={{ text }}` with the selected label(s)) showing the value or the
* placeholder, and a `chevron-down` `Icon`. Activating it opens an `embedded` `Listbox`
* (given no `name`, `selectionFollowsFocus: false`, and the first selection
* as `initialActiveValue`): a `BottomSheet` on phone-width screens (`layout.maxWidth.prose`)
* with a `copy.done` footer button for `multiple`, or else a transparent `Modal` whose
* popup sits below the trigger (flipped above on overflow), at least as wide as it, on
* `layer.dropdown`, fading in over `enter`. Escape (the Android back gesture) and an
* outside tap close without changing the value; focus returns to the trigger by hand
* (`AccessibilityInfo.setAccessibilityFocus`), since `FocusScope`'s restore only
* recaptures a `TextInput`. Selecting an option commits and, for a single select,
* closes. Pressable sees no keys, so Enter-as-press is the only other keyboard rule.
* Validation works as `Input`'s: `error` prop → `required` → `invalid`, registered with
* the enclosing `FormContext` by `name`.
*/
function Select({ label, name, options, value, defaultValue, placeholder, hideLabel = false, size = "md", open: openProp, multiple = false, description, required = false, disabled = false, invalid = false, error, native = "auto", overrides, ref, onChange, onOpenChange }) {
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
	const selectedValues = multiple ? Array.isArray(currentValue) ? currentValue : [] : typeof currentValue === "string" ? [currentValue] : [];
	const hasSelection = selectedValues.length > 0;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required) {
			if (Array.isArray(candidate) ? candidate.length === 0 : candidate === void 0 || candidate === "") return COPY$13.required.replace("{label}", label);
		}
		if (invalid) return COPY$13.invalid.replace("{label}", label);
		return null;
	}, [
		required,
		label,
		error,
		invalid
	]);
	const focusTrigger = React.useCallback(() => {
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
		focus: focusTrigger
	}), [multiple, focusTrigger]);
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
		focusTrigger();
	};
	const handleTriggerPress = () => {
		if (isDisabled) return;
		if (open) {
			closePopup();
			return;
		}
		changeOpen(true);
	};
	const handleListboxChange = (next) => {
		if (!multiple && next === currentValue) {
			closePopup();
			return;
		}
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next));
		if (!multiple) closePopup();
	};
	const token = (ref, fallback) => ref ? resolveToken(t, ref) : fallback;
	const enterDuration = token(overrides?.enter, t.motionDurationFast);
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
				duration: enterDuration,
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
	const handlePopupLayout = (event) => {
		setPopupHeight(event.nativeEvent.layout.height);
	};
	const triggerBorderInvalid = token(overrides?.triggerBorderInvalid, t.colorBorderDanger);
	const triggerBorderWidth = token(overrides?.triggerBorderWidth, t.borderWidthThin);
	const triggerRadius = token(overrides?.triggerRadius, t.radiusMd);
	const triggerPaddingInline = token(overrides?.triggerPaddingInline, t.spaceMd);
	const triggerPaddingBlock = token(overrides?.triggerPaddingBlock, size === "sm" ? t.space1 : t.spaceSm);
	const triggerGap = token(overrides?.triggerGap, t.layoutGapNormal);
	const partGap = token(overrides?.partGap, t.space1);
	const popupSurface = token(overrides?.popupSurface, t.colorOverlaySurface);
	const popupBorder = token(overrides?.popupBorder, t.colorBorder);
	const popupBorderWidth = token(overrides?.popupBorderWidth, t.borderWidthThin);
	const popupShadow = token(overrides?.popupShadow, t.shadowOverlay);
	const popupRadius = token(overrides?.popupRadius, t.radiusMd);
	const popupOffset = token(overrides?.popupOffset, t.space1);
	const layer = token(overrides?.layer, t.layerDropdown);
	const disabledOpacity = token(overrides?.disabledOpacity, t.opacityDisabled);
	const minTarget = size === "sm" ? t.sizeTargetMin : t.sizeTargetComfortable;
	const visibleLabel = required ? `${label}${COPY$13.requiredIndicator}` : label;
	const valueText = !hasSelection ? placeholder ?? COPY$13.placeholder : selectedValues.length <= 2 ? selectedValues.map(labelFor).join(", ") : COPY$13.selectedCount.replace("{count}", new Intl.NumberFormat().format(selectedValues.length));
	const borderWidth = focused ? t.borderWidthFocus : triggerBorderWidth;
	const inset = Math.max(0, borderWidth - triggerBorderWidth);
	const triggerBorderColor = isInvalid ? triggerBorderInvalid : focused ? t.colorBorderFocus : t.colorBorderStrong;
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
		borderWidth,
		borderColor: triggerBorderColor,
		borderRadius: triggerRadius,
		paddingHorizontal: Math.max(0, triggerPaddingInline - inset),
		paddingVertical: Math.max(0, triggerPaddingBlock - inset)
	};
	const fontFamilyRef = overrides?.fontFamily ?? "font.family.body";
	const fontSizeRef = overrides?.fontSize ?? `font.size.${size}`;
	const lineHeightRef = overrides?.lineHeight ?? "font.lineHeight.normal";
	const helperSizeRef = overrides?.helperSize ?? "font.size.sm";
	const labelOverrides = {
		fontWeight: overrides?.labelWeight ?? "font.weight.medium",
		fontSize: fontSizeRef,
		fontFamily: fontFamilyRef,
		lineHeight: lineHeightRef
	};
	const valueOverrides = {
		fontSize: fontSizeRef,
		fontWeight: overrides?.fontWeight ?? "font.weight.regular",
		fontFamily: fontFamilyRef,
		lineHeight: lineHeightRef
	};
	const helperOverrides = {
		fontSize: helperSizeRef,
		fontFamily: fontFamilyRef,
		lineHeight: lineHeightRef
	};
	const listboxOverrides = {
		fontFamily: fontFamilyRef,
		lineHeight: lineHeightRef
	};
	const chevronOverrides = { color: "color.foreground.muted" };
	const listbox = /* @__PURE__ */ React.createElement(Listbox, {
		label,
		options,
		multiple,
		value: currentValue,
		embedded: true,
		selectionFollowsFocus: false,
		initialActiveValue: selectedValues[0],
		onChange: handleListboxChange,
		overrides: listboxOverrides
	});
	const spaceBelow = triggerRect !== null ? windowHeight - (triggerRect.y + triggerRect.height) : 0;
	const spaceAbove = triggerRect !== null ? triggerRect.y : 0;
	const measuredPopupHeight = popupHeight ?? 0;
	const flipAbove = triggerRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
	const popupTop = triggerRect === null ? 0 : flipAbove ? triggerRect.y - popupOffset - measuredPopupHeight : triggerRect.y + triggerRect.height + popupOffset;
	const hostStyle = { flex: 1 };
	const valueSlotStyle = { flexShrink: 1 };
	const popupOuterStyle = {
		position: "absolute",
		top: popupTop,
		left: triggerRect?.x ?? 0,
		minWidth: triggerRect?.width,
		borderRadius: popupRadius,
		zIndex: layer,
		opacity: progress,
		...popupShadow
	};
	const popupInnerStyle = {
		borderRadius: popupRadius,
		borderWidth: popupBorderWidth,
		borderColor: popupBorder,
		backgroundColor: popupSurface,
		overflow: "hidden"
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Select",
		style: containerStyle
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "Select.label" }, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Select.description" }, /* @__PURE__ */ React.createElement(Text, {
		tone: "muted",
		size: "sm",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(Pressable, {
		ref: triggerRef,
		accessibilityRole: "combobox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			expanded: open,
			disabled: isDisabled
		},
		accessibilityValue: { text: valueText },
		onPress: handleTriggerPress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: triggerStyle,
		testID: "Select.trigger"
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Select.value",
		style: valueSlotStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: hasSelection ? "default" : "muted",
		overrides: valueOverrides
	}, valueText)), /* @__PURE__ */ React.createElement(View, { testID: "Select.chevron" }, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-down",
		size: "sm",
		overrides: chevronOverrides
	}))), displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Select.errorMessage",
		accessibilityLiveRegion: summarised ? "none" : "assertive"
	}, /* @__PURE__ */ React.createElement(Text, {
		tone: "danger",
		size: "sm",
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
/** copy.* — used verbatim; `{…}` params are interpolated, `resultCount` is selected by `Intl.PluralRules`. */
const COPY$12 = {
	empty: "No matches",
	loading: "Loading…",
	addCustom: "Add \"{value}\"",
	clearLabel: "Clear",
	toggleLabel: "Show options",
	done: "Done",
	removeChip: "Remove {label}",
	resultCount: {
		one: "{count} result available",
		other: "{count} results available"
	},
	activeOption: "{option}",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
function resultCountText(count) {
	return (new Intl.PluralRules(void 0).select(count) === "one" ? COPY$12.resultCount.one : COPY$12.resultCount.other).replace("{count}", String(count));
}
const CUSTOM_PREFIX = "__ds_combobox_custom__:";
function isGroup$1(item) {
	return "group" in item;
}
function flattenOptions(items) {
	const result = [];
	items.forEach((item) => {
		if (isGroup$1(item)) result.push(...item.options);
		else result.push(item);
	});
	return result;
}
/** Case- and diacritic-insensitive comparison key. */
function fold(text) {
	return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
* `TextInput` directly and the popup is an anchored `Modal` below it (flipped above on
* overflow) that does not trap focus. Listbox rows are touch `Pressable`s with no key
* events, so arrow browsing, Alt+ArrowDown and Tab-without-committing have no native
* equivalent: a tap commits, Enter or a comma through the `TextInput` commits typed
* custom text, Escape (hardware keyboard / react-native-web) closes then clears the
* text, and blurring the anchored field closes the list. Result counts, loading and
* empty states are announced with `AccessibilityInfo.announceForAccessibility` after
* `motion.duration.base × 2`. Validation and Form registration work as `Input`'s:
* `error` prop → `required` → `invalid`.
*/
function Combobox({ label, name, options, value, defaultValue, open: openProp, inputValue, multiple = false, allowCustom = false, filter = "contains", placeholder, description, required = false, disabled = false, invalid = false, error, loading = false, clearable = true, overrides, ref, onChange, onInputChange, onOpenChange }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const reducedMotion = useReducedMotion();
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const fieldRef = React.useRef(null);
	const inputRef = React.useRef(null);
	const emptyValue = multiple ? [] : "";
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? emptyValue);
	const [internalInputText, setInternalInputText] = React.useState(() => {
		const initial = value ?? defaultValue;
		if (multiple || typeof initial !== "string" || initial === "") return "";
		return flattenOptions(options).find((option) => option.value === initial)?.label ?? initial;
	});
	const [internalOpen, setInternalOpen] = React.useState(false);
	const [showAll, setShowAll] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const [popupMounted, setPopupMounted] = React.useState(openProp ?? false);
	const [fieldRect, setFieldRect] = React.useState(null);
	const [popupHeight, setPopupHeight] = React.useState(null);
	const [statusText, setStatusText] = React.useState("");
	const progress = React.useRef(new Animated.Value(0)).current;
	const isValueControlled = value !== void 0;
	const currentValue = isValueControlled ? value : internalValue;
	const isInputControlled = inputValue !== void 0;
	const currentInputText = isInputControlled ? inputValue : internalInputText;
	const isOpenControlled = openProp !== void 0;
	const open = isOpenControlled ? openProp : internalOpen;
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = form?.errors[name];
	const displayedError = error !== void 0 && error !== "" ? error : formError;
	const isInvalid = invalid || displayedError !== void 0;
	const summarised = form !== null && form.errorSummary;
	const usesSheet = windowWidth <= t.layoutMaxWidthProse;
	const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
	const labelFor = React.useCallback((optionValue) => flatOptions.find((option) => option.value === optionValue)?.label ?? optionValue, [flatOptions]);
	const selectedValues = multiple ? Array.isArray(currentValue) ? currentValue : currentValue !== "" ? [currentValue] : [] : [];
	const selectedValue = !multiple && typeof currentValue === "string" && currentValue !== "" ? currentValue : void 0;
	const hasSelection = multiple ? selectedValues.length > 0 : selectedValue !== void 0;
	const lastSingleValue = React.useRef(multiple ? void 0 : currentValue);
	React.useEffect(() => {
		if (multiple || isInputControlled || typeof currentValue !== "string" || lastSingleValue.current === currentValue) return;
		lastSingleValue.current = currentValue;
		setInternalInputText(currentValue === "" ? "" : labelFor(currentValue));
	}, [
		multiple,
		isInputControlled,
		currentValue,
		labelFor
	]);
	const trimmedInput = currentInputText.trim();
	const needle = fold(trimmedInput);
	const filteredItems = React.useMemo(() => {
		if (filter === "none" || filter === "async" || showAll || needle === "") return options;
		const matches = (option) => filter === "startsWith" ? fold(option.label).startsWith(needle) : fold(option.label).includes(needle);
		return options.reduce((acc, item) => {
			if (isGroup$1(item)) {
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
		showAll,
		needle
	]);
	const typeAheadValue = filter === "none" && needle !== "" ? flatOptions.find((option) => !option.disabled && fold(option.label).startsWith(needle))?.value : void 0;
	const isLoading = filter === "async" && loading;
	const findExactMatch = (text) => {
		const key = fold(text);
		return flatOptions.find((option) => fold(option.label) === key || fold(option.value) === key);
	};
	const exactMatch = findExactMatch(trimmedInput);
	const customOption = allowCustom && !isLoading && trimmedInput !== "" && exactMatch === void 0 ? {
		value: `${CUSTOM_PREFIX}${trimmedInput}`,
		label: COPY$12.addCustom.replace("{value}", trimmedInput)
	} : null;
	const visibleItems = isLoading ? [] : filteredItems;
	const listboxItems = customOption !== null ? [customOption, ...visibleItems] : visibleItems;
	const resultCount = flattenOptions(visibleItems).length;
	const validateValue = React.useCallback((candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required) {
			if (Array.isArray(candidate) ? candidate.length === 0 : candidate === "") return COPY$12.required.replace("{label}", label);
		}
		if (invalid) return COPY$12.invalid.replace("{label}", label);
		return null;
	}, [
		required,
		label,
		error,
		invalid
	]);
	const changeOpen = (next) => {
		if (next === open) return;
		if (!isOpenControlled) setInternalOpen(next);
		if (!next) setShowAll(false);
		onOpenChange?.(next);
	};
	const latest = React.useRef({
		currentValue,
		validateValue,
		changeOpen
	});
	latest.current = {
		currentValue,
		validateValue,
		changeOpen
	};
	const handle = React.useMemo(() => ({
		getValue: () => {
			const current = latest.current.currentValue;
			if (Array.isArray(current)) return current.length > 0 ? current.join(",") : void 0;
			return current !== "" ? current : void 0;
		},
		validate: () => latest.current.validateValue(latest.current.currentValue),
		focus: () => {
			if (usesSheet) {
				latest.current.changeOpen(true);
				return;
			}
			const input = inputRef.current;
			if (input === null) return;
			input.focus();
			const node = findNodeHandle(input);
			if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
		}
	}), [usesSheet]);
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
	const statusDebounce = t.motionDurationBase * 2;
	React.useEffect(() => {
		if (!open) {
			setStatusText("");
			return;
		}
		const text = isLoading ? COPY$12.loading : resultCount === 0 ? COPY$12.empty : resultCountText(resultCount);
		const timeout = setTimeout(() => {
			setStatusText(text);
			if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(text);
		}, statusDebounce);
		return () => clearTimeout(timeout);
	}, [
		open,
		isLoading,
		resultCount,
		statusDebounce
	]);
	const focusFieldA11y = () => {
		const node = fieldRef.current ? findNodeHandle(fieldRef.current) : null;
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
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
		setShowAll(false);
		if (multiple) {
			const resolved = (Array.isArray(next) ? next : [next]).map(resolveCustom);
			commitValue(Array.from(new Set(resolved)));
			commitInputText("");
			return;
		}
		const raw = Array.isArray(next) ? next[0] : next;
		const resolved = raw === void 0 ? "" : resolveCustom(raw);
		commitValue(resolved);
		commitInputText(resolved === "" ? "" : labelFor(resolved));
		closePopup(!usesSheet);
	};
	const handleTogglePress = () => {
		if (isDisabled) return;
		if (open) closePopup(true);
		else {
			setShowAll(true);
			changeOpen(true);
		}
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
	/**
	* Commits `raw` as typed text: an option it names exactly (its `value`, never a custom string), otherwise
	* (allowCustom) a custom entry. Multiple clears the input and stays open; single shows the committed text and closes.
	* Returns false when nothing was committed.
	*/
	const commitTyped = (raw) => {
		const text = raw.trim();
		if (text === "") return false;
		const match = findExactMatch(text);
		if (match?.disabled === true || match === void 0 && !allowCustom) return false;
		const committed = match?.value ?? text;
		if (multiple) {
			if (!selectedValues.includes(committed)) commitValue([...selectedValues, committed]);
			commitInputText("");
		} else {
			if (committed !== selectedValue) commitValue(committed);
			commitInputText(match?.label ?? text);
			closePopup(false);
		}
		return true;
	};
	const handleChangeText = (text) => {
		setShowAll(false);
		if (allowCustom && text.includes(",")) {
			const before = text.slice(0, text.indexOf(","));
			if (!commitTyped(before)) commitInputText(before.trim() === "" ? "" : before);
			return;
		}
		commitInputText(text);
		if (!open && !isDisabled) changeOpen(true);
	};
	const handleSubmitEditing = () => {
		if (allowCustom) commitTyped(currentInputText);
	};
	const handleKeyPress = (event) => {
		const key = event.nativeEvent.key;
		if (key === "Backspace" && multiple && currentInputText === "" && selectedValues.length > 0) {
			commitValue(selectedValues.slice(0, -1));
			return;
		}
		if (key === "Escape") {
			if (open) closePopup(false);
			else if (clearable && currentInputText !== "") commitInputText("");
		}
	};
	const handleFocus = () => {
		setFocused(true);
	};
	const handleBlur = () => {
		setFocused(false);
		if (!usesSheet) closePopup(false);
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue));
	};
	React.useEffect(() => {
		if (open) setPopupMounted(true);
	}, [open]);
	const handlePopupLayout = (event) => {
		setPopupHeight(event.nativeEvent.layout.height);
	};
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
	const popupSurface = overrides?.popupSurface ? resolveToken(t, overrides.popupSurface) : t.colorOverlaySurface;
	const popupBorder = overrides?.popupBorder ? resolveToken(t, overrides.popupBorder) : t.colorBorder;
	const popupBorderWidth = overrides?.popupBorderWidth ? resolveToken(t, overrides.popupBorderWidth) : t.borderWidthThin;
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
	const summaryIsPlaceholder = !hasSelection;
	const containerStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const activeFieldBorderWidth = focused ? t.borderWidthFocus : fieldBorderWidth;
	const insetShrink = focused ? t.borderWidthFocus - fieldBorderWidth : 0;
	const fieldBorderColor = focused ? t.colorBorderFocus : isInvalid ? fieldBorderInvalidColor : t.colorBorderStrong;
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
		paddingHorizontal: fieldPaddingInline - insetShrink,
		paddingVertical: fieldPaddingBlock - insetShrink
	};
	const chipStyle = {
		flexDirection: "row",
		alignItems: "center",
		flexShrink: 1,
		gap: chipGap,
		backgroundColor: t.colorBackgroundStrong,
		borderRadius: chipRadius,
		paddingHorizontal: chipPaddingInline,
		paddingVertical: chipPaddingBlock
	};
	const inputFontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t.fontSizeMd;
	const inputLineHeight = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const inputTextStyle = {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		minHeight: t.sizeTargetMin,
		fontFamily: overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody,
		fontSize: inputFontSize,
		lineHeight: toLineHeight(inputFontSize, inputLineHeight),
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
	const renderChip = (chipValue, interactive) => {
		const chipLabel = labelFor(chipValue);
		return /* @__PURE__ */ React.createElement(View, {
			key: chipValue,
			style: chipStyle,
			testID: "Combobox.chip"
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			overrides: chipTextOverrides
		}, chipLabel), interactive ? /* @__PURE__ */ React.createElement(View, { testID: "Combobox.chipRemove" }, /* @__PURE__ */ React.createElement(Button, {
			label: COPY$12.removeChip.replace("{label}", chipLabel),
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
		})) : null);
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
		accessibilityValue: !multiple && selectedValue !== void 0 ? { text: labelFor(selectedValue) } : void 0,
		editable: !isDisabled,
		value: currentInputText,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		autoCapitalize: "none",
		autoCorrect: false,
		autoFocus: usesSheet,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onKeyPress: handleKeyPress,
		onSubmitEditing: handleSubmitEditing,
		submitBehavior: multiple ? "submit" : "blurAndSubmit",
		style: inputTextStyle,
		testID: "Combobox.input"
	});
	const listbox = /* @__PURE__ */ React.createElement(View, { testID: "Combobox.listbox" }, /* @__PURE__ */ React.createElement(Listbox, {
		label,
		options: listboxItems,
		multiple,
		value: multiple ? selectedValues : selectedValue ?? "",
		disabled: isDisabled,
		embedded: true,
		loading: isLoading,
		emptyMessage: COPY$12.empty,
		initialActiveValue: typeAheadValue,
		onChange: handleListboxChange,
		overrides: listboxOverrides
	}));
	const status = /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		testID: "Combobox.status"
	}, open && statusText !== "" ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, statusText) : null);
	const spaceBelow = fieldRect !== null ? windowHeight - (fieldRect.y + fieldRect.height) : 0;
	const spaceAbove = fieldRect !== null ? fieldRect.y : 0;
	const measuredPopupHeight = popupHeight ?? 0;
	const flipAbove = fieldRect !== null && spaceBelow < measuredPopupHeight + popupOffset && spaceAbove > spaceBelow;
	const popupTop = fieldRect === null ? 0 : flipAbove ? fieldRect.y - popupOffset - measuredPopupHeight : fieldRect.y + fieldRect.height + popupOffset;
	const hostStyle = { flex: 1 };
	const popupOuterStyle = {
		position: "absolute",
		top: popupTop,
		left: fieldRect?.x ?? 0,
		minWidth: fieldRect?.width ?? 0,
		borderRadius: popupRadius,
		zIndex: layer,
		opacity: progress,
		...popupShadow
	};
	const popupInnerStyle = {
		borderRadius: popupRadius,
		borderWidth: popupBorderWidth,
		borderColor: popupBorder,
		backgroundColor: popupSurface,
		overflow: "hidden"
	};
	const sheetFieldStyle = {
		flexDirection: "column",
		gap: fieldGap
	};
	const sheetChipsRowStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: fieldGap
	};
	const clearButton = showClear ? /* @__PURE__ */ React.createElement(View, { testID: "Combobox.clearButton" }, /* @__PURE__ */ React.createElement(Button, {
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
	})) : null;
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Combobox",
		style: containerStyle
	}, /* @__PURE__ */ React.createElement(View, { testID: "Combobox.label" }, /* @__PURE__ */ React.createElement(Text, {
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Combobox.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, usesSheet ? /* @__PURE__ */ React.createElement(Pressable, {
		ref: fieldRef,
		accessibilityRole: "combobox",
		accessibilityLabel: visibleLabel,
		accessibilityHint: description,
		accessibilityState: {
			disabled: isDisabled,
			expanded: open
		},
		accessibilityValue: hasSelection ? { text: multiple ? selectedValues.map(labelFor).join(", ") : singleSummaryText } : void 0,
		onPress: handleTogglePress,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		style: fieldRowStyle,
		testID: "Combobox.field"
	}, multiple && selectedValues.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		style: sheetChipsRowStyle,
		testID: "Combobox.chips"
	}, selectedValues.map((v) => renderChip(v, false))) : /* @__PURE__ */ React.createElement(Text, {
		tone: summaryIsPlaceholder ? "muted" : "default",
		truncate: true,
		overrides: fieldTextOverrides
	}, singleSummaryText), /* @__PURE__ */ React.createElement(View, {
		testID: "Combobox.toggleButton",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-down",
		size: "xs",
		color: iconColor
	}))) : /* @__PURE__ */ React.createElement(View, {
		ref: fieldRef,
		style: fieldRowStyle,
		testID: "Combobox.field"
	}, multiple && selectedValues.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		style: sheetChipsRowStyle,
		testID: "Combobox.chips"
	}, selectedValues.map((v) => renderChip(v, true))) : null, textInput, clearButton, /* @__PURE__ */ React.createElement(View, { testID: "Combobox.toggleButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$12.toggleLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		expanded: open,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-down",
			size: "xs",
			color: iconColor
		}),
		onPress: handleTogglePress
	}))), usesSheet ? null : status, displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "Combobox.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null, usesSheet ? /* @__PURE__ */ React.createElement(BottomSheet, {
		open,
		heading: label,
		height: "full",
		onClose: () => closePopup(true),
		footer: /* @__PURE__ */ React.createElement(Button, {
			label: COPY$12.done,
			onPress: () => closePopup(true)
		})
	}, /* @__PURE__ */ React.createElement(View, {
		style: sheetFieldStyle,
		testID: "Combobox.popup"
	}, multiple && selectedValues.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		style: sheetChipsRowStyle,
		testID: "Combobox.chips"
	}, selectedValues.map((v) => renderChip(v, true))) : null, /* @__PURE__ */ React.createElement(View, { style: fieldRowStyle }, textInput, clearButton), status, listbox)) : /* @__PURE__ */ React.createElement(Modal, {
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
function toIdArray(value) {
	if (value === void 0 || value === "") return [];
	return Array.isArray(value) ? value : [value];
}
/** Under `exclusive` only the first id opens. */
function limitExclusive(ids, exclusive) {
	return exclusive && ids.length > 1 ? ids.slice(0, 1) : ids;
}
function sameSet(a, b) {
	return a.length === b.length && a.every((id) => b.includes(id));
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
function Accordion({ items, headingLevel = "3", exclusive = false, value, defaultValue, divided = true, keepMounted = false, onChange, onOpenChange, overrides, ref }) {
	const { tokens: t } = useTheme();
	const isControlled = value !== void 0;
	const [internalOpenIds, setInternalOpenIds] = React.useState(() => limitExclusive(toIdArray(defaultValue), exclusive));
	const openIds = limitExclusive(isControlled ? toIdArray(value) : internalOpenIds, exclusive);
	const openKey = openIds.join(" ");
	const valueKey = isControlled ? toIdArray(value).join(" ") : null;
	React.useEffect(() => {
		if (!isControlled && exclusive && internalOpenIds.length > 1) setInternalOpenIds(internalOpenIds.slice(0, 1));
	}, [
		exclusive,
		isControlled,
		internalOpenIds
	]);
	const requestedIds = toIdArray(isControlled ? value : defaultValue);
	const warnedRef = React.useRef(null);
	React.useEffect(() => {
		if (!__DEV__ || !exclusive || requestedIds.length <= 1) return;
		const key = requestedIds.join(" ");
		if (warnedRef.current === key) return;
		warnedRef.current = key;
		console.warn(`Accordion: \`exclusive\` opens one section, but \`${isControlled ? "value" : "defaultValue"}\` has ${requestedIds.length} ids. Opening "${requestedIds[0]}"; ignoring ${requestedIds.slice(1).join(", ")}.`);
	});
	const previousOpenRef = React.useRef(openIds);
	const previousValueKeyRef = React.useRef(valueKey);
	const lastEmittedRef = React.useRef(null);
	React.useEffect(() => {
		const previous = previousOpenRef.current;
		const valueChanged = previousValueKeyRef.current !== valueKey;
		previousOpenRef.current = openIds;
		previousValueKeyRef.current = valueKey;
		if (!isControlled) {
			lastEmittedRef.current = null;
			return;
		}
		if (!valueChanged) return;
		const emitted = lastEmittedRef.current;
		lastEmittedRef.current = null;
		if (emitted !== null && sameSet(emitted, openIds)) return;
		if (sameSet(previous, openIds)) return;
		for (const id of openIds) if (!previous.includes(id)) onOpenChange?.(id, true, "controlled");
		for (const id of previous) if (!openIds.includes(id)) onOpenChange?.(id, false, "controlled");
	}, [
		openKey,
		valueKey,
		isControlled
	]);
	const handleToggle = (id, open, toggleReason) => {
		if (toggleReason === "controlled") return;
		const previous = openIds;
		const next = open ? exclusive ? [id] : previous.includes(id) ? previous : [...previous, id] : previous.filter((openId) => openId !== id);
		if (isControlled) lastEmittedRef.current = next;
		else setInternalOpenIds(next);
		onChange?.(next);
		onOpenChange?.(id, open, "trigger");
		if (open && exclusive) {
			for (const item of items) if (item.id !== id && previous.includes(item.id)) onOpenChange?.(item.id, false, "exclusive");
		}
	};
	const disclosureOverrides = React.useMemo(() => ({
		triggerPaddingBlock: overrides?.triggerPaddingBlock ?? "space.md",
		triggerFontFamily: overrides?.fontFamily ?? "font.family.body",
		triggerFontSize: overrides?.triggerFontSize ?? "font.size.md",
		triggerFontWeight: overrides?.triggerFontWeight ?? "font.weight.medium"
	}), [
		overrides?.triggerPaddingBlock,
		overrides?.fontFamily,
		overrides?.triggerFontSize,
		overrides?.triggerFontWeight
	]);
	const dividerOverrides = React.useMemo(() => ({
		color: overrides?.divider ?? "color.border",
		thickness: overrides?.dividerWidth ?? "border.width.thin"
	}), [overrides?.divider, overrides?.dividerWidth]);
	const listStyle = { gap: overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t.layoutGapNone };
	const children = [];
	items.forEach((item, index) => {
		if (divided && index > 0) children.push(/* @__PURE__ */ React.createElement(Divider, {
			key: `divider-${item.id}`,
			overrides: dividerOverrides
		}));
		children.push(/* @__PURE__ */ React.createElement(Disclosure, {
			key: item.id,
			summary: item.summary,
			headingLevel,
			open: openIds.includes(item.id),
			disabled: item.disabled,
			keepMounted,
			overrides: disclosureOverrides,
			onToggle: (open, reason) => handleToggle(item.id, open, reason)
		}, item.content));
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Accordion",
		style: listStyle
	}, children);
}
//#endregion
//#region src/Slider.tsx
const COPY$11 = {
	minimumLabel: (label) => `${label} minimum`,
	maximumLabel: (label) => `${label} maximum`,
	rangeText: (low, high) => `${low} – ${high}`,
	required: (label) => `${label} is required.`,
	invalid: (label) => `${label} is not valid.`,
	pageUpAction: "Increase by a page",
	pageDownAction: "Decrease by a page",
	homeAction: "Set to minimum",
	endAction: "Set to maximum"
};
/**
* `increment`/`decrement` are the standard adjustable actions (VoiceOver swipe, TalkBack
* volume keys) and take no label. PageUp/PageDown/Home/End have no native gesture, so they
* are custom actions in the platform's Actions menu, labelled from copy.
*/
const THUMB_ACTIONS = [
	{ name: "increment" },
	{ name: "decrement" },
	{
		name: "pageUp",
		label: COPY$11.pageUpAction
	},
	{
		name: "pageDown",
		label: COPY$11.pageDownAction
	},
	{
		name: "home",
		label: COPY$11.homeAction
	},
	{
		name: "end",
		label: COPY$11.endAction
	}
];
/** PageUp/PageDown move by ten steps. */
const PAGE_STEPS = 10;
function clamp$1(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function percentOf(value, min, max) {
	if (max <= min) return 0;
	return clamp$1((value - min) / (max - min), 0, 1);
}
function isSameSliderValue(a, b) {
	if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];
	return a === b;
}
/** Removes floating-point drift from step arithmetic (0.1 + 0.2) so values stay on the step grid. */
function tidy(value) {
	return Math.round(value * 1e9) / 1e9;
}
/** Snaps a pointer position: to the nearest mark with `snapToMarks`, otherwise to the step grid. */
function snapValue(raw, min, max, step, snapMarks) {
	const clamped = clamp$1(raw, min, max);
	if (snapMarks !== void 0 && snapMarks.length > 0) {
		let nearest = snapMarks[0].value;
		for (const mark of snapMarks) if (Math.abs(clamped - mark.value) < Math.abs(clamped - nearest)) nearest = mark.value;
		return clamp$1(nearest, min, max);
	}
	if (step <= 0) return clamped;
	return clamp$1(tidy(min + Math.round((clamped - min) / step) * step), min, max);
}
/** Ten steps in `direction`; with `snapToMarks`, the next mark, and past the last mark the bound. */
function pagedValue(current, direction, min, max, step, snapMarks) {
	if (snapMarks !== void 0 && snapMarks.length > 0) {
		const sorted = snapMarks.map((mark) => mark.value).sort((a, b) => a - b);
		return clamp$1((direction > 0 ? sorted.find((v) => v > current) : sorted.reverse().find((v) => v < current)) ?? (direction > 0 ? max : min), min, max);
	}
	return clamp$1(tidy(current + direction * step * PAGE_STEPS), min, max);
}
function resolveOr(t, ref, fallback) {
	return ref ? resolveToken(t, ref) : fallback;
}
/** Fades `visible` in and out over the `transition` binding, or snaps when motion is reduced. */
function useFade(visible, reducedMotion, duration, easing) {
	const anim = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
	const target = React.useRef(visible ? 1 : 0);
	React.useEffect(() => {
		const toValue = visible ? 1 : 0;
		if (toValue === target.current) return;
		target.current = toValue;
		if (reducedMotion) {
			anim.setValue(toValue);
			return;
		}
		Animated.timing(anim, {
			toValue,
			duration,
			easing: toEasing(easing),
			useNativeDriver: false
		}).start();
	}, [
		visible,
		reducedMotion,
		anim,
		duration,
		easing
	]);
	return anim;
}
/**
* One thumb: a `View` (not `Pressable`) carrying a `PanResponder`'s handlers directly, since
* spreading `panHandlers` onto `Pressable` fights its own responder. The adjustable role and
* accessibility actions are the non-gesture path; the drag is additive. A `latest` ref keeps
* the responder's closures current without recreating the `PanResponder` mid-gesture.
*/
function SliderThumb({ kind, value, fraction, min, max, disabled, pressed, accessibilityLabel, formatValue, showBubble, bubbleTypography, reducedMotion, onGrant, onDrag, onRelease, onAction, styleTokens: st, ref }) {
	const [focused, setFocused] = React.useState(false);
	const latest = React.useRef({
		disabled,
		onGrant,
		onDrag,
		onRelease
	});
	latest.current = {
		disabled,
		onGrant,
		onDrag,
		onRelease
	};
	const panResponder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => !latest.current.disabled,
		onMoveShouldSetPanResponder: () => !latest.current.disabled,
		onPanResponderTerminationRequest: () => false,
		onPanResponderGrant: () => latest.current.onGrant(kind),
		onPanResponderMove: (_evt, gesture) => latest.current.onDrag(gesture.dx),
		onPanResponderRelease: () => latest.current.onRelease(),
		onPanResponderTerminate: () => latest.current.onRelease()
	})).current;
	const handleAccessibilityAction = (event) => {
		if (!latest.current.disabled) onAction(kind, event.nativeEvent.actionName);
	};
	const haloAnim = useFade(pressed, reducedMotion, st.transitionDuration, st.motionEasingStandard);
	const bubbleAnim = useFade(showBubble && (pressed || focused), reducedMotion, st.transitionDuration, st.motionEasingStandard);
	const haloSize = st.thumbSize + st.haloSpread * 2;
	const ringSize = st.thumbSize + (st.focusRingWidth + st.focusRingWidth) * 2;
	const hitStyle = {
		position: "absolute",
		start: `${fraction * 100}%`,
		top: "50%",
		width: st.minTarget,
		height: st.minTarget,
		marginTop: -(st.minTarget / 2),
		marginStart: -(st.minTarget / 2),
		alignItems: "center",
		justifyContent: "center"
	};
	const haloStyle = {
		position: "absolute",
		width: haloSize,
		height: haloSize,
		borderRadius: haloSize / 2,
		backgroundColor: st.haloColor,
		opacity: haloAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, st.haloOpacity]
		})
	};
	const ringStyle = {
		position: "absolute",
		width: ringSize,
		height: ringSize,
		borderRadius: ringSize / 2,
		borderWidth: st.focusRingWidth,
		borderColor: st.focusRing
	};
	const knobStyle = {
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
		bottom: st.minTarget + st.bubbleOffset,
		paddingVertical: st.bubblePaddingBlock,
		paddingHorizontal: st.bubblePaddingInline,
		borderRadius: st.bubbleRadius,
		backgroundColor: st.bubbleSurface,
		opacity: bubbleAnim
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Slider.thumb",
		accessible: true,
		focusable: true,
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
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		...panResponder.panHandlers,
		style: hitStyle
	}, showBubble ? /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Slider.bubble",
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: bubbleStyle
	}, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: st.bubbleText }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "default",
		overrides: bubbleTypography
	}, formatValue(value)))) : null, /* @__PURE__ */ React.createElement(Animated.View, {
		pointerEvents: "none",
		style: haloStyle
	}), focused ? /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		style: ringStyle
	}) : null, /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		style: knobStyle
	}));
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
function Slider({ label, name, min = 0, max = 100, step = 1, snapToMarks = false, required = false, invalid = false, value, defaultValue, range = false, formatValue = String, showValue = "always", marks, disabled = false, description, error, overrides, onValueChange, onSlidingComplete, ref }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const fieldset = useFieldsetContext();
	const reducedMotion = useReducedMotion();
	const rtl = I18nManager.isRTL;
	const snapMarks = snapToMarks && marks !== void 0 && marks.length > 0 ? marks : void 0;
	const [internalValue, setInternalValue] = React.useState(() => defaultValue ?? (range ? [min, max] : min));
	const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
	const currentValue = value ?? internalValue;
	React.useEffect(() => {
		if (__DEV__ && !(max > min)) console.warn(`Slider: max (${max}) must be greater than min (${min}).`);
	}, [min, max]);
	const singleValue = !range && typeof currentValue === "number" ? clamp$1(currentValue, min, max) : min;
	const [rangeLowRaw, rangeHighRaw] = range && Array.isArray(currentValue) ? currentValue : [min, max];
	const rangeLow = clamp$1(Math.min(rangeLowRaw, rangeHighRaw), min, max);
	const rangeHigh = clamp$1(Math.max(rangeLowRaw, rangeHighRaw), min, max);
	const normalized = range ? [rangeLow, rangeHigh] : singleValue;
	const reportedRef = React.useRef(normalized);
	reportedRef.current = normalized;
	const requiredDefault = defaultValue ?? (range ? [min, max] : min);
	const validateValue = (candidate) => {
		if (error !== void 0 && error !== "") return error;
		if (required && isSameSliderValue(candidate, requiredDefault)) return COPY$11.required(label);
		if (invalid) return COPY$11.invalid(label);
		return null;
	};
	/** Bounds for a thumb: the scale, narrowed by the other thumb in a range. */
	const boundsFor = (kind) => {
		const base = reportedRef.current;
		if (!Array.isArray(base)) return [min, max];
		return kind === "min" ? [min, base[1]] : [base[0], max];
	};
	const valueOf = (kind) => {
		const base = reportedRef.current;
		return Array.isArray(base) ? kind === "max" ? base[1] : base[0] : base;
	};
	const report = (kind, next) => {
		const base = reportedRef.current;
		const [lo, hi] = boundsFor(kind);
		const bounded = clamp$1(next, lo, hi);
		const nextValue = Array.isArray(base) ? kind === "min" ? [bounded, base[1]] : [base[0], bounded] : bounded;
		if (isSameSliderValue(nextValue, base)) return;
		reportedRef.current = nextValue;
		if (value === void 0) setInternalValue(nextValue);
		onValueChange?.(nextValue);
		if (form !== null && form.validateMode === "change") form.reportValidity(name, validateValue(nextValue));
	};
	/** Ends an interaction that began at `start`: reports it only if it changed the value. */
	const complete = (start) => {
		const final = reportedRef.current;
		if (isSameSliderValue(start, final)) return;
		onSlidingComplete?.(final);
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(final));
	};
	const [activeKind, setActiveKind] = React.useState(null);
	const gesture = React.useRef(null);
	const trackWidthRef = React.useRef(0);
	const rawFromDx = (origin, dx) => {
		const width = trackWidthRef.current;
		return width <= 0 ? origin : origin + (rtl ? -dx : dx) / width * (max - min);
	};
	const beginGesture = (kind, origin) => {
		gesture.current = {
			kind,
			origin,
			start: reportedRef.current
		};
		setActiveKind(kind);
	};
	const dragGesture = (dx) => {
		const g = gesture.current;
		if (g !== null) report(g.kind, snapValue(rawFromDx(g.origin, dx), min, max, step, snapMarks));
	};
	const endGesture = () => {
		const g = gesture.current;
		gesture.current = null;
		setActiveKind(null);
		if (g !== null) complete(g.start);
	};
	const handleAction = (kind, action) => {
		const current = valueOf(kind);
		const [lo, hi] = boundsFor(kind);
		let next;
		switch (action) {
			case "increment":
				next = tidy(current + step);
				break;
			case "decrement":
				next = tidy(current - step);
				break;
			case "pageUp":
				next = pagedValue(current, 1, min, max, step, snapMarks);
				break;
			case "pageDown":
				next = pagedValue(current, -1, min, max, step, snapMarks);
				break;
			case "home":
				next = lo;
				break;
			case "end":
				next = hi;
				break;
			default: return;
		}
		const start = reportedRef.current;
		report(kind, next);
		complete(start);
	};
	/** The thumb a track press at `raw` moves: in a range, the nearer one (ties go to the low thumb). */
	const nearestKind = (raw) => {
		const base = reportedRef.current;
		if (!Array.isArray(base)) return "single";
		const [low, high] = base;
		if (raw <= low) return "min";
		if (raw >= high) return "max";
		return raw - low <= high - raw ? "min" : "max";
	};
	const latest = React.useRef({
		isDisabled,
		rtl,
		min,
		max,
		nearestKind,
		beginGesture,
		dragGesture,
		endGesture
	});
	latest.current = {
		isDisabled,
		rtl,
		min,
		max,
		nearestKind,
		beginGesture,
		dragGesture,
		endGesture
	};
	const trackResponder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => !latest.current.isDisabled,
		onPanResponderTerminationRequest: () => false,
		onPanResponderGrant: (evt) => {
			const width = trackWidthRef.current;
			if (width <= 0) return;
			const cur = latest.current;
			const x = cur.rtl ? width - evt.nativeEvent.locationX : evt.nativeEvent.locationX;
			const raw = cur.min + x / width * (cur.max - cur.min);
			cur.beginGesture(cur.nearestKind(raw), raw);
			cur.dragGesture(0);
		},
		onPanResponderMove: (_evt, g) => latest.current.dragGesture(g.dx),
		onPanResponderRelease: () => latest.current.endGesture(),
		onPanResponderTerminate: () => latest.current.endGesture()
	})).current;
	const handleTrackLayout = (event) => {
		trackWidthRef.current = event.nativeEvent.layout.width;
	};
	const firstThumbRef = React.useRef(null);
	const latestForm = React.useRef({
		normalized,
		validateValue,
		label
	});
	latestForm.current = {
		normalized,
		validateValue,
		label
	};
	const handle = React.useMemo(() => ({
		get label() {
			return latestForm.current.label;
		},
		getValue: () => {
			const current = latestForm.current.normalized;
			return Array.isArray(current) ? [String(current[0]), String(current[1])] : String(current);
		},
		validate: () => latestForm.current.validateValue(latestForm.current.normalized),
		focus: () => {
			const node = firstThumbRef.current;
			const nodeHandle = node === null ? null : findNodeHandle(node);
			if (nodeHandle != null) AccessibilityInfo.setAccessibilityFocus(nodeHandle);
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
	const displayedError = error !== void 0 && error !== "" ? error : formError !== void 0 ? formError : invalid ? COPY$11.invalid(label) : void 0;
	const summarised = form !== null && form.errorSummary;
	React.useEffect(() => {
		if (Platform.OS === "ios" && !summarised && displayedError !== void 0) AccessibilityInfo.announceForAccessibility(displayedError);
	}, [displayedError, summarised]);
	const trackColor = resolveOr(t, overrides?.track, t.colorBackgroundStrong);
	const trackHeight = resolveOr(t, overrides?.trackHeight, t.space1);
	const trackRadius = resolveOr(t, overrides?.trackRadius, t.radiusFull);
	const markColor = resolveOr(t, overrides?.mark, t.colorBorderStrong);
	const markSize = resolveOr(t, overrides?.markSize, t.space1);
	const markLabelSize = resolveOr(t, overrides?.markLabelSize, t.fontSizeXs);
	const markLabelGap = resolveOr(t, overrides?.markLabelGap, t.space1);
	const partGap = resolveOr(t, overrides?.partGap, t.space1);
	const labelGap = resolveOr(t, overrides?.labelGap, t.space2);
	const trackPaddingBlock = resolveOr(t, overrides?.trackPaddingBlock, t.space3);
	const disabledOpacity = resolveOr(t, overrides?.disabledOpacity, t.opacityDisabled);
	const controlSelected = t.colorControlSelectedBackground;
	const thumbStyleTokens = {
		thumbSize: resolveOr(t, overrides?.thumbSize, t.space5),
		thumbBorderWidth: t.borderWidthFocus,
		thumbColor: resolveOr(t, overrides?.thumb, t.colorControlBackground),
		thumbBorderColor: controlSelected,
		thumbShadow: resolveOr(t, overrides?.thumbShadow, t.shadowRaised),
		haloColor: controlSelected,
		haloSpread: resolveOr(t, overrides?.haloSpread, t.space2),
		haloOpacity: resolveOr(t, overrides?.thumbActiveScale, t.opacityDisabled),
		minTarget: t.sizeTargetComfortable,
		focusRing: t.colorBorderFocus,
		focusRingWidth: t.borderWidthFocus,
		bubbleSurface: t.colorInverseSurface,
		bubbleText: t.colorInverseForeground,
		bubbleRadius: resolveOr(t, overrides?.bubbleRadius, t.radiusSm),
		bubblePaddingBlock: resolveOr(t, overrides?.bubblePaddingBlock, t.space1),
		bubblePaddingInline: resolveOr(t, overrides?.bubblePaddingInline, t.space2),
		bubbleOffset: resolveOr(t, overrides?.bubbleOffset, t.space1),
		motionEasingStandard: t.motionEasingStandard,
		transitionDuration: resolveOr(t, overrides?.transition, t.motionDurationFast)
	};
	const displayValueText = range ? COPY$11.rangeText(formatValue(rangeLow), formatValue(rangeHigh)) : formatValue(singleValue);
	const markList = marks ?? [];
	const markLabels = markList.filter((mark) => mark.label !== void 0);
	const fontFamily = overrides?.fontFamily;
	const helperTypography = {
		fontFamily,
		fontSize: overrides?.helperSize
	};
	const valueTypography = {
		fontFamily,
		fontSize: overrides?.valueSize
	};
	const thumbShared = {
		disabled: isDisabled,
		formatValue,
		showBubble: showValue === "hover",
		bubbleTypography: valueTypography,
		reducedMotion,
		onGrant: (kind) => beginGesture(kind, valueOf(kind)),
		onDrag: dragGesture,
		onRelease: endGesture,
		onAction: handleAction,
		styleTokens: thumbStyleTokens
	};
	const lowFraction = percentOf(rangeLow, min, max);
	const highFraction = percentOf(rangeHigh, min, max);
	const singleFraction = percentOf(singleValue, min, max);
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Slider",
		style: {
			flexDirection: "column",
			gap: partGap,
			opacity: isDisabled ? disabledOpacity : 1
		}
	}, /* @__PURE__ */ React.createElement(View, { style: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
		gap: labelGap
	} }, /* @__PURE__ */ React.createElement(View, { testID: "Slider.label" }, /* @__PURE__ */ React.createElement(Text, {
		size: "md",
		weight: "medium",
		tone: "default",
		overrides: {
			fontFamily,
			fontSize: overrides?.fontSize,
			fontWeight: overrides?.labelWeight
		}
	}, label)), showValue === "always" ? /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.valueText",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "default",
		overrides: valueTypography
	}, displayValueText)) : null), /* @__PURE__ */ React.createElement(View, { style: {
		flexDirection: "column",
		gap: markLabelGap
	} }, /* @__PURE__ */ React.createElement(View, {
		style: {
			justifyContent: "center",
			paddingVertical: trackPaddingBlock
		},
		onLayout: handleTrackLayout,
		...trackResponder.panHandlers
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.track",
		pointerEvents: "none",
		style: {
			height: trackHeight,
			borderRadius: trackRadius,
			backgroundColor: trackColor,
			overflow: "hidden"
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.fill",
		style: {
			position: "absolute",
			start: range ? `${lowFraction * 100}%` : 0,
			width: `${(range ? highFraction - lowFraction : singleFraction) * 100}%`,
			height: trackHeight,
			borderRadius: trackRadius,
			backgroundColor: controlSelected
		}
	})), markList.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.tickMarks",
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: {
			position: "absolute",
			top: 0,
			bottom: 0,
			start: 0,
			end: 0
		}
	}, markList.map((mark) => /* @__PURE__ */ React.createElement(View, {
		key: mark.value,
		style: {
			position: "absolute",
			start: `${percentOf(mark.value, min, max) * 100}%`,
			top: "50%",
			width: markSize,
			height: markSize,
			marginStart: -(markSize / 2),
			marginTop: -(markSize / 2),
			borderRadius: markSize / 2,
			backgroundColor: markColor
		}
	}))) : null, range ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SliderThumb, {
		...thumbShared,
		ref: firstThumbRef,
		kind: "min",
		value: rangeLow,
		fraction: lowFraction,
		min,
		max: rangeHigh,
		pressed: activeKind === "min",
		accessibilityLabel: COPY$11.minimumLabel(label)
	}), /* @__PURE__ */ React.createElement(SliderThumb, {
		...thumbShared,
		kind: "max",
		value: rangeHigh,
		fraction: highFraction,
		min: rangeLow,
		max,
		pressed: activeKind === "max",
		accessibilityLabel: COPY$11.maximumLabel(label)
	})) : /* @__PURE__ */ React.createElement(SliderThumb, {
		...thumbShared,
		ref: firstThumbRef,
		kind: "single",
		value: singleValue,
		fraction: singleFraction,
		min,
		max,
		pressed: activeKind === "single",
		accessibilityLabel: label
	})), markLabels.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: { height: toLineHeight(markLabelSize, t.fontLineHeightNormal) }
	}, markLabels.map((mark) => /* @__PURE__ */ React.createElement(View, {
		key: mark.value,
		style: {
			position: "absolute",
			start: `${percentOf(mark.value, min, max) * 100}%`,
			transform: [{ translateX: rtl ? "50%" : "-50%" }]
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			fontFamily,
			fontSize: overrides?.markLabelSize
		}
	}, mark.label)))) : null), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Slider.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperTypography
	}, description)) : null, displayedError !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Slider.errorMessage",
		accessibilityLiveRegion: summarised ? "none" : "assertive"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperTypography
	}, displayedError)) : null);
}
//#endregion
//#region src/Search.tsx
/** copy.* — used verbatim; `suggestionsCount` is selected by `Intl.PluralRules` on `count`. */
const COPY$10 = {
	clear: "Clear search",
	submit: "Search",
	loading: "Loading suggestions",
	suggestionsCount: {
		one: "{count} suggestion available",
		other: "{count} suggestions available"
	},
	noSuggestions: "No suggestions"
};
function suggestionsCount(count) {
	return (new Intl.PluralRules(void 0).select(count) === "one" ? COPY$10.suggestionsCount.one : COPY$10.suggestionsCount.other).replace("{count}", String(count));
}
const FONT_SIZE_TOKEN$1 = {
	md: "fontSizeMd",
	lg: "fontSizeLg"
};
const FONT_SIZE_REF = {
	md: "font.size.md",
	lg: "font.size.lg"
};
const PADDING_BLOCK_TOKEN$1 = {
	md: "spaceSm",
	lg: "spaceMd"
};
/** The glyph keeps its proportion to the text: `sm` at `md`, `md` at `lg`. */
const ICON_SIZE = {
	md: "sm",
	lg: "md"
};
/**
* Search — the field people look for first: a magnifier glyph, a pill, a clear button,
* and submission on Enter like every search field they have used.
*
* When to use: free-text search over a site, an app, or a large dataset. Add
* `suggestions` when the backend can offer completions; keep `landmark` on for the one
* primary search. Not for a specific value (Input) or choosing from a known list
* (Select, Combobox).
*
* Renders a root `View` (`accessibilityRole="search"` when `landmark`, never on the
* TextInput) holding the optional visible label (hidden from accessibility: the input
* carries `accessibilityLabel`) and a pill row: a decorative `search` Icon, a `TextInput`
* (`returnKeyType="search"`, `clearButtonMode="never"`), the system clear `Button` (ghost,
* sm, iconOnly, `close`) while there is text, and the submit `Button` (ghost, sm,
* iconOnly, `arrow-right`), always rendered. With `suggestions` set, an embedded `Listbox`
* renders inline below the field once the user types (or presses ArrowDown on a hardware
* keyboard) — never on focus alone — and closes on blur, Escape, a choice, clear and
* submit. Listbox rows are touch Pressables with no key events, so there is no arrow-key
* highlight: a tap fills the query with the row's label and submits, and Enter always
* submits the typed query. The suggestion count, `copy.noSuggestions` or `copy.loading`
* is announced with `AccessibilityInfo.announceForAccessibility` after `statusDebounce`.
* `name` and `action` have no native meaning; `action` warns under `__DEV__`. The caller's
* ScrollView needs `keyboardShouldPersistTaps="handled"` so a suggestion tap is not
* swallowed by keyboard dismissal.
*/
function Search({ label, showLabel = false, name = "q", value, defaultValue, placeholder, action, suggestions, loading = false, landmark = true, size = "md", disabled = false, overrides, ref, onChangeText, onSubmitEditing, onClear }) {
	const { tokens: t } = useTheme();
	const form = useFormContext();
	const inputRef = React.useRef(null);
	/** True between a press starting in the list and its release, so the input's blur does not unmount the row being tapped. */
	const pressingList = React.useRef(false);
	const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
	const [open, setOpen] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const hasSuggestions = suggestions !== void 0;
	const showList = open && hasSuggestions && !isDisabled;
	const latest = React.useRef(currentValue);
	latest.current = currentValue;
	const setQuery = (next) => {
		if (!isControlled) {
			latest.current = next;
			setInternalValue(next);
		}
		onChangeText?.(next);
	};
	const submit = (raw) => {
		setOpen(false);
		const trimmed = raw.trim();
		if (trimmed === "") return;
		onSubmitEditing?.(trimmed);
	};
	const clear = () => {
		setOpen(false);
		setQuery("");
		onClear?.();
	};
	React.useEffect(() => {
		if (__DEV__ && action !== void 0) console.warn("Search: `action` has no effect on React Native; handle `onSubmitEditing` instead.");
	}, [action]);
	const handle = React.useMemo(() => ({
		getValue: () => latest.current.trim(),
		validate: () => null,
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
	const handleChangeText = (text) => {
		if (isDisabled) return;
		setQuery(text);
		setOpen(true);
	};
	const handleFocus = () => {
		setFocused(true);
	};
	const handleBlur = () => {
		setFocused(false);
		if (!pressingList.current) setOpen(false);
	};
	const handleListPressStart = () => {
		pressingList.current = true;
	};
	const handleListPressEnd = () => {
		setTimeout(() => {
			pressingList.current = false;
			if (inputRef.current?.isFocused() !== true) setOpen(false);
		}, 0);
	};
	const handleKeyPress = (event) => {
		if (isDisabled) return;
		const key = event.nativeEvent.key;
		if (key === "ArrowDown") {
			if (hasSuggestions) setOpen(true);
			return;
		}
		if (key !== "Escape") return;
		if (showList) {
			setOpen(false);
			return;
		}
		if (latest.current !== "") clear();
	};
	const handleSubmitEditing = () => {
		if (isDisabled) return;
		submit(latest.current);
	};
	const handleClearPress = () => {
		if (isDisabled) return;
		clear();
		inputRef.current?.focus();
	};
	const handleSuggestionChange = (next) => {
		if (isDisabled) return;
		const picked = Array.isArray(next) ? next[0] : next;
		const chosen = suggestions?.find((suggestion) => suggestion.value === picked);
		if (chosen === void 0) return;
		pressingList.current = false;
		setQuery(chosen.label);
		submit(chosen.label);
	};
	const count = suggestions?.length ?? 0;
	const statusText = !showList ? "" : loading ? COPY$10.loading : count === 0 ? COPY$10.noSuggestions : suggestionsCount(count);
	const statusDebounce = t.motionDurationBase * 2;
	React.useEffect(() => {
		if (statusText === "") return;
		const timeout = setTimeout(() => AccessibilityInfo.announceForAccessibility(statusText), statusDebounce);
		return () => clearTimeout(timeout);
	}, [statusText, statusDebounce]);
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusFull;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.spaceMd;
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[PADDING_BLOCK_TOKEN$1[size]];
	const affixGap = overrides?.affixGap ? resolveToken(t, overrides.affixGap) : t.layoutGapTight;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN$1[size]];
	const lineHeight = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const suggestionsOffset = overrides?.suggestionsOffset ? resolveToken(t, overrides.suggestionsOffset) : t.space1;
	const popupSurface = overrides?.popupSurface ? resolveToken(t, overrides.popupSurface) : t.colorOverlaySurface;
	const popupBorder = overrides?.popupBorder ? resolveToken(t, overrides.popupBorder) : t.colorBorder;
	const popupBorderWidth = overrides?.popupBorderWidth ? resolveToken(t, overrides.popupBorderWidth) : t.borderWidthThin;
	const popupRadius = overrides?.popupRadius ? resolveToken(t, overrides.popupRadius) : t.radiusMd;
	const popupShadow = overrides?.popupShadow ? resolveToken(t, overrides.popupShadow) : t.shadowOverlay;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
	const borderCompensation = Math.max(0, Math.max(t.borderWidthFocus, borderWidth) - activeBorderWidth);
	const rootStyle = {
		flexDirection: "column",
		gap: partGap,
		opacity: isDisabled ? disabledOpacity : 1
	};
	const fieldGroupStyle = {
		flexDirection: "column",
		gap: suggestionsOffset
	};
	const fieldStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: affixGap,
		minHeight: t.sizeTargetComfortable,
		backgroundColor: t.colorControlBackground,
		borderWidth: activeBorderWidth,
		borderColor: focused ? t.colorBorderFocus : t.colorBorderStrong,
		borderRadius: radius,
		paddingHorizontal: paddingInline + borderCompensation,
		paddingVertical: paddingBlock + borderCompensation
	};
	const inputStyle = {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		padding: 0,
		fontFamily,
		fontSize,
		lineHeight: toLineHeight(fontSize, lineHeight),
		color: t.colorForeground
	};
	const suggestionsStyle = {
		borderWidth: popupBorderWidth,
		borderColor: popupBorder,
		borderRadius: popupRadius,
		backgroundColor: popupSurface,
		overflow: "hidden",
		...popupShadow
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Search",
		accessibilityRole: landmark ? "search" : void 0,
		style: rootStyle
	}, showLabel ? /* @__PURE__ */ React.createElement(View, {
		testID: "Search.label",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(Text, { overrides: {
		fontWeight: overrides?.labelWeight ?? "font.weight.medium",
		fontSize: overrides?.fontSize ?? FONT_SIZE_REF[size]
	} }, label)) : null, /* @__PURE__ */ React.createElement(View, { style: fieldGroupStyle }, /* @__PURE__ */ React.createElement(View, {
		testID: "Search.field",
		style: fieldStyle
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Search.icon",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants"
	}, /* @__PURE__ */ React.createElement(Icon, {
		name: "search",
		size: ICON_SIZE[size],
		overrides: { color: "color.foreground.muted" }
	})), /* @__PURE__ */ React.createElement(TextInput, {
		ref: inputRef,
		testID: "Search.input",
		accessibilityLabel: label,
		accessibilityState: {
			disabled: isDisabled,
			expanded: hasSuggestions ? showList : void 0
		},
		editable: !isDisabled,
		value: currentValue,
		placeholder,
		placeholderTextColor: t.colorForegroundMuted,
		returnKeyType: "search",
		clearButtonMode: "never",
		autoCapitalize: "none",
		autoCorrect: false,
		onChangeText: handleChangeText,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onKeyPress: handleKeyPress,
		onSubmitEditing: handleSubmitEditing,
		style: inputStyle
	}), currentValue !== "" ? /* @__PURE__ */ React.createElement(View, { testID: "Search.clearButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$10.clear,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "close",
			color: t.colorActionGhostForeground
		}),
		onPress: handleClearPress
	})) : null, /* @__PURE__ */ React.createElement(View, { testID: "Search.submitButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$10.submit,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "arrow-right",
			color: t.colorActionGhostForeground
		}),
		onPress: handleSubmitEditing
	}))), showList ? /* @__PURE__ */ React.createElement(View, {
		testID: "Search.suggestions",
		style: suggestionsStyle,
		onTouchStart: handleListPressStart,
		onTouchEnd: handleListPressEnd,
		onPointerDown: handleListPressStart,
		onPointerUp: handleListPressEnd
	}, /* @__PURE__ */ React.createElement(Listbox, {
		label,
		options: loading ? [] : suggestions ?? [],
		value: "",
		embedded: true,
		emptyMessage: loading ? COPY$10.loading : COPY$10.noSuggestions,
		onChange: handleSuggestionChange
	})) : null));
}
//#endregion
//#region src/Toolbar.tsx
const ITEM_GAP = {
	compact: "layoutGapTight",
	comfortable: "layoutGapNormal"
};
/** Components that take a toolbar `size`, recognised by identity, never by probing for a prop. */
const SIZED_COMPONENTS = /* @__PURE__ */ new Set([
	Button,
	SegmentedControl,
	Select,
	Search
]);
let warnedMenu = false;
const ToolbarLayoutContext = React.createContext(null);
/** Children with fragments expanded, so a fragment of controls counts as its controls. */
function flattenChildren(children, prefix = "") {
	const out = [];
	React.Children.toArray(children).forEach((child) => {
		if (React.isValidElement(child) && child.type === React.Fragment) out.push(...flattenChildren(child.props.children, `${prefix}${String(child.key)}`));
		else if (React.isValidElement(child)) out.push(prefix === "" ? child : React.cloneElement(child, { key: `${prefix}${String(child.key)}` }));
		else out.push(child);
	});
	return out;
}
function withSize(node, size) {
	if (!React.isValidElement(node) || !SIZED_COMPONENTS.has(node.type)) return node;
	if (node.props.size !== void 0) return node;
	if (node.type === Search && size === "sm") return node;
	return React.cloneElement(node, { size });
}
function isGroup(node) {
	return React.isValidElement(node) && node.type === ToolbarGroup;
}
/**
* ToolbarGroup — related controls inside a Toolbar. A `View` with `role="group"` and
* `accessibilityLabel` from `label`, laid out along the toolbar axis with `itemGap` between its
* controls. The Toolbar draws a Divider between two adjacent groups.
*/
function ToolbarGroup({ label, children, ref }) {
	const layout = React.useContext(ToolbarLayoutContext);
	if (__DEV__ && layout === null) console.warn("ToolbarGroup: render it as a direct child of Toolbar; outside one it has no layout.");
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		role: "group",
		accessibilityLabel: label,
		style: layout?.group,
		testID: "Toolbar.group"
	}, children);
}
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
function Toolbar({ label, children, orientation = "horizontal", overflow, size = "md", density = "comfortable", overrides, ref }) {
	const { tokens: t } = useTheme();
	const vertical = orientation === "vertical";
	const mode = overflow === "wrap" ? "wrap" : "scroll";
	React.useEffect(() => {
		if (__DEV__ && overflow === "menu" && !warnedMenu) {
			warnedMenu = true;
			console.warn("Toolbar: `overflow=\"menu\"` renders as `overflow=\"scroll\"` on React Native — children are opaque, so nothing can measure them and move trailing controls into a \"More\" Menu.");
		}
	}, [overflow]);
	const styles = React.useMemo(() => {
		const border = overrides?.border ? resolveToken(t, overrides.border) : t.colorBorder;
		const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
		const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
		const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t.space2;
		const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t.space1;
		const itemGap = overrides?.itemGap ? resolveToken(t, overrides.itemGap) : t[ITEM_GAP[density]];
		const groupGap = overrides?.groupGap ? resolveToken(t, overrides.groupGap) : t.layoutGapNormal;
		const separatorLength = overrides?.separatorLength ? resolveToken(t, overrides.separatorLength) : t.space5;
		const fadeWidth = overrides?.fadeWidth ? resolveToken(t, overrides.fadeWidth) : t.space6;
		const separatorPad = Math.max(0, groupGap - itemGap);
		const wrap = mode === "wrap" ? "wrap" : "nowrap";
		return {
			root: {
				backgroundColor: t.colorBackgroundSubtle,
				borderColor: border,
				borderWidth,
				borderRadius: radius,
				paddingHorizontal: paddingInline,
				paddingVertical: paddingBlock
			},
			row: {
				flexDirection: vertical ? "column" : "row",
				alignItems: vertical ? "stretch" : "center",
				flexWrap: wrap,
				gap: itemGap
			},
			group: {
				flexDirection: vertical ? "column" : "row",
				alignItems: vertical ? "stretch" : "center",
				flexWrap: wrap,
				flexShrink: mode === "wrap" ? 1 : 0,
				gap: itemGap
			},
			separator: vertical ? {
				width: separatorLength,
				paddingVertical: separatorPad,
				alignSelf: "center"
			} : {
				height: separatorLength,
				paddingHorizontal: separatorPad,
				flexDirection: "row",
				alignSelf: "center"
			},
			fadeWidth
		};
	}, [
		t,
		overrides,
		density,
		vertical,
		mode
	]);
	const layout = React.useMemo(() => ({ group: styles.group }), [styles.group]);
	const content = [];
	let previousWasGroup = false;
	flattenChildren(children).forEach((node, index) => {
		if (isGroup(node)) {
			if (previousWasGroup) content.push(/* @__PURE__ */ React.createElement(View, {
				key: `separator-${index}`,
				style: styles.separator,
				testID: "Toolbar.separator"
			}, /* @__PURE__ */ React.createElement(Divider, {
				orientation: vertical ? "horizontal" : "vertical",
				spacing: "none"
			})));
			content.push(React.cloneElement(node, { children: flattenChildren(node.props.children).map((child) => withSize(child, size)) }));
			previousWasGroup = true;
		} else {
			content.push(withSize(node, size));
			previousWasGroup = false;
		}
	});
	const [edges, setEdges] = React.useState({
		start: false,
		end: false
	});
	const metrics = React.useRef({
		offset: 0,
		viewport: 0,
		content: 0
	});
	const updateEdges = () => {
		const { offset, viewport, content: length } = metrics.current;
		const start = offset > 1;
		const end = offset + viewport < length - 1;
		setEdges((prev) => prev.start === start && prev.end === end ? prev : {
			start,
			end
		});
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Toolbar",
		accessibilityRole: "toolbar",
		accessibilityLabel: label,
		style: styles.root
	}, /* @__PURE__ */ React.createElement(ToolbarLayoutContext.Provider, { value: layout }, mode === "wrap" ? /* @__PURE__ */ React.createElement(View, { style: styles.row }, content) : /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(ScrollView, {
		horizontal: !vertical,
		showsHorizontalScrollIndicator: false,
		showsVerticalScrollIndicator: false,
		contentContainerStyle: styles.row,
		scrollEventThrottle: 16,
		onLayout: (event) => {
			const { width, height } = event.nativeEvent.layout;
			metrics.current.viewport = vertical ? height : width;
			updateEdges();
		},
		onContentSizeChange: (width, height) => {
			metrics.current.content = vertical ? height : width;
			updateEdges();
		},
		onScroll: (event) => {
			const { contentOffset } = event.nativeEvent;
			metrics.current.offset = vertical ? contentOffset.y : contentOffset.x;
			updateEdges();
		}
	}, content), edges.start ? /* @__PURE__ */ React.createElement(ToolbarFade, {
		edge: "start",
		vertical,
		length: styles.fadeWidth,
		color: t.colorBackgroundSubtle
	}) : null, edges.end ? /* @__PURE__ */ React.createElement(ToolbarFade, {
		edge: "end",
		vertical,
		length: styles.fadeWidth,
		color: t.colorBackgroundSubtle
	}) : null)));
}
/** One edge fade over the scrolling row, opaque `background` at the edge to transparent inward. */
function ToolbarFade({ edge, vertical, length, color }) {
	const gradientId = `toolbar-fade-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const position = vertical ? {
		position: "absolute",
		left: 0,
		right: 0,
		height: length,
		...edge === "start" ? { top: 0 } : { bottom: 0 }
	} : {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: length,
		...edge === "start" ? { left: 0 } : { right: 0 }
	};
	const from = edge === "start" ? "0%" : "100%";
	const to = edge === "start" ? "100%" : "0%";
	return /* @__PURE__ */ React.createElement(View, {
		style: position,
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Svg, {
		width: "100%",
		height: "100%"
	}, /* @__PURE__ */ React.createElement(Defs, null, /* @__PURE__ */ React.createElement(LinearGradient, {
		id: gradientId,
		x1: vertical ? "0%" : from,
		y1: vertical ? from : "0%",
		x2: vertical ? "0%" : to,
		y2: vertical ? to : "0%"
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
/** One slide. Rendered by `Carousel`, never on its own. */
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
				label: props.label,
				content: props.children
			});
		}
	});
	return slides;
}
const COPY$9 = {
	previous: "Previous slide",
	next: "Next slide",
	play: "Start automatic rotation",
	pause: "Stop automatic rotation",
	slideLabel: (n, total) => `${n} of ${total}`,
	pickerLabel: "Choose a slide",
	goTo: (n) => `Go to slide ${n}`,
	announce: (n, total) => `Slide ${n} of ${total}`
};
/** constant `minInterval`: the floor `interval` is raised to, so autoplay never advances faster than a slide can be read. */
const MIN_INTERVAL = 5e3;
/** `default` of the `interval` prop. */
const DEFAULT_INTERVAL = 6e3;
/** `itemVisiblePercentThreshold` from the platform notes. */
const VISIBLE_THRESHOLD = 60;
const SLIDE_ACTIONS = [{
	name: "increment",
	label: COPY$9.next
}, {
	name: "decrement",
	label: COPY$9.previous
}];
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
function Carousel({ label, children, perView = 1, loop = false, autoplay = false, interval = DEFAULT_INTERVAL, picker = "dots", activeIndex, snap = true, onChange, overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const slides = React.useMemo(() => collectSlides(children), [children]);
	const total = slides.length;
	React.useEffect(() => {
		if (__DEV__) React.Children.forEach(children, (child) => {
			if (!React.isValidElement(child) || child.type !== CarouselSlide) console.warn("Carousel: children must be CarouselSlide elements.");
			else if (!child.props.label) console.warn("Carousel: every CarouselSlide needs a label; the tab falls back to \"Go to slide {n}\".");
		});
	}, [children]);
	const warnedInterval = React.useRef(false);
	React.useEffect(() => {
		if (__DEV__ && autoplay && interval < MIN_INTERVAL && !warnedInterval.current) {
			warnedInterval.current = true;
			console.warn(`Carousel: interval ${interval}ms is below the ${MIN_INTERVAL}ms minimum and was raised to it.`);
		}
	}, [autoplay, interval]);
	const effectiveInterval = Math.max(interval, MIN_INTERVAL);
	const slideGap = overrides?.slideGap ? resolveToken(t, overrides.slideGap) : t.layoutGapNormal;
	const controlOffset = overrides?.controlOffset ? resolveToken(t, overrides.controlOffset) : t.space2;
	const controlRadius = overrides?.controlRadius ? resolveToken(t, overrides.controlRadius) : t.radiusFull;
	const controlShadow = overrides?.controlShadow ? resolveToken(t, overrides.controlShadow) : t.shadowRaised;
	const pickerGap = overrides?.pickerGap ? resolveToken(t, overrides.pickerGap) : t.layoutGapTight;
	const pickerOffset = overrides?.pickerOffset ? resolveToken(t, overrides.pickerOffset) : t.space3;
	const dotSize = overrides?.dotSize ? resolveToken(t, overrides.dotSize) : t.space2;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const tabFontSize = overrides?.tabFontSize ? resolveToken(t, overrides.tabFontSize) : t.fontSizeSm;
	const tabFontWeight = overrides?.tabFontWeight ? resolveToken(t, overrides.tabFontWeight) : t.fontWeightMedium;
	const tabPaddingBlock = overrides?.tabPaddingBlock ? resolveToken(t, overrides.tabPaddingBlock) : t.spaceSm;
	const tabPaddingInline = overrides?.tabPaddingInline ? resolveToken(t, overrides.tabPaddingInline) : t.spaceMd;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const transition = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationBase;
	const [viewportWidth, setViewportWidth] = React.useState(0);
	const pageSize = viewportWidth > 0 && viewportWidth <= t.layoutMaxWidthProse ? 1 : Math.max(1, Math.round(perView));
	const itemWidth = viewportWidth > 0 ? (viewportWidth - slideGap * (pageSize - 1)) / pageSize : 0;
	const maxStart = Math.max(0, total - pageSize);
	const isControlled = activeIndex !== void 0;
	const [internalIndex, setInternalIndex] = React.useState(0);
	const currentIndex = Math.min(Math.max(0, Math.round(isControlled ? activeIndex : internalIndex)), maxStart);
	/** The start index Next/Previous would move to, or `null` when that arrow is disabled. */
	const stepTarget = (from, direction) => {
		if (maxStart === 0) return null;
		if (direction === 1) {
			if (from < maxStart) return Math.min(from + pageSize, maxStart);
			return loop ? 0 : null;
		}
		if (from > 0) return Math.max(from - pageSize, 0);
		return loop ? maxStart : null;
	};
	const [announcement, setAnnouncement] = React.useState("");
	const goTo = (index, reason) => {
		const target = Math.min(Math.max(0, index), maxStart);
		if (target === currentIndex) return;
		if (!isControlled) setInternalIndex(target);
		onChange?.(target, reason);
		if (reason !== "autoplay") {
			const message = COPY$9.announce(target + 1, total);
			setAnnouncement(message);
			if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
		}
	};
	const latest = React.useRef({
		currentIndex,
		goTo,
		stepTarget
	});
	latest.current = {
		currentIndex,
		goTo,
		stepTarget
	};
	const dragging = React.useRef(false);
	const [settleCount, setSettleCount] = React.useState(0);
	const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: VISIBLE_THRESHOLD }).current;
	const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
		if (!dragging.current) return;
		const first = viewableItems.find((entry) => entry.isViewable && entry.index != null);
		if (first?.index != null) latest.current.goTo(first.index, "swipe");
	}).current;
	const trackRef = React.useRef(null);
	const positioned = React.useRef(false);
	React.useEffect(() => {
		if (itemWidth <= 0 || dragging.current) return;
		trackRef.current?.scrollToOffset({
			offset: currentIndex * (itemWidth + slideGap),
			animated: positioned.current && !reducedMotion
		});
		positioned.current = true;
	}, [
		currentIndex,
		itemWidth,
		slideGap,
		reducedMotion,
		settleCount
	]);
	const canRotate = autoplay && !reducedMotion;
	const [playing, setPlaying] = React.useState(autoplay);
	React.useEffect(() => setPlaying(autoplay), [autoplay]);
	const [touching, setTouching] = React.useState(false);
	const [focusCount, setFocusCount] = React.useState(0);
	const rotating = canRotate && playing && !touching && focusCount === 0 && maxStart > 0;
	React.useEffect(() => {
		if (canRotate && playing && !loop && maxStart > 0 && currentIndex === maxStart) setPlaying(false);
	}, [
		canRotate,
		playing,
		loop,
		maxStart,
		currentIndex
	]);
	React.useEffect(() => {
		if (!rotating) return;
		const id = setInterval(() => {
			const { currentIndex: from, goTo: go, stepTarget: step } = latest.current;
			const next = step(from, 1);
			if (next === null) {
				setPlaying(false);
				return;
			}
			go(next, "autoplay");
		}, effectiveInterval);
		return () => clearInterval(id);
	}, [rotating, effectiveInterval]);
	const onControlFocus = () => setFocusCount((n) => n + 1);
	const onControlBlur = () => setFocusCount((n) => Math.max(0, n - 1));
	const handlePlayPress = () => {
		if (playing) {
			setPlaying(false);
			return;
		}
		setTouching(false);
		setFocusCount(0);
		if (!loop && maxStart > 0 && currentIndex === maxStart) goTo(0, "autoplay");
		setPlaying(true);
	};
	const handleViewportLayout = (event) => {
		setViewportWidth(event.nativeEvent.layout.width);
	};
	const prevTarget = stepTarget(currentIndex, -1);
	const nextTarget = stepTarget(currentIndex, 1);
	const handleSlideAccessibilityAction = (event) => {
		if (event.nativeEvent.actionName === "increment" && nextTarget !== null) goTo(nextTarget, "next");
		else if (event.nativeEvent.actionName === "decrement" && prevTarget !== null) goTo(prevTarget, "prev");
	};
	const renderItem = ({ item, index }) => {
		const visible = index >= currentIndex && index < currentIndex + pageSize;
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Carousel.slide",
			accessible: visible,
			accessibilityRole: "adjustable",
			accessibilityLabel: COPY$9.slideLabel(index + 1, total),
			accessibilityActions: SLIDE_ACTIONS,
			onAccessibilityAction: handleSlideAccessibilityAction,
			accessibilityElementsHidden: !visible,
			importantForAccessibility: visible ? "auto" : "no-hide-descendants",
			style: itemWidth > 0 ? { width: itemWidth } : void 0
		}, item.content);
	};
	const usePaging = snap && pageSize === 1 && slideGap === 0;
	const snapInterval = snap && !usePaging && itemWidth > 0 ? itemWidth + slideGap : void 0;
	const viewportStyle = {
		borderRadius: radius,
		overflow: "hidden"
	};
	const controlsStyle = {
		...StyleSheet.absoluteFill,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: controlOffset,
		zIndex: 1
	};
	const controlSurfaceStyle = {
		minWidth: t.sizeTargetComfortable,
		minHeight: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: controlRadius,
		backgroundColor: t.colorOverlaySurface,
		...controlShadow
	};
	const pickerStyle = {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
		gap: pickerGap
	};
	const iconColor = t.colorActionSecondaryForeground;
	const itemTransition = reducedMotion ? 0 : transition;
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Carousel",
		role: "region",
		accessibilityLabel: label,
		onTouchStart: () => setTouching(true),
		onTouchEnd: () => setTouching(false),
		onTouchCancel: () => setTouching(false),
		style: { gap: pickerOffset }
	}, canRotate ? /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.playButton",
		style: { alignSelf: "flex-start" }
	}, /* @__PURE__ */ React.createElement(Button, {
		label: playing ? COPY$9.pause : COPY$9.play,
		variant: "secondary",
		onPress: handlePlayPress,
		onFocus: onControlFocus,
		onBlur: onControlBlur
	})) : null, /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(View, {
		style: controlsStyle,
		pointerEvents: "box-none"
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.controlSurface",
		style: controlSurfaceStyle
	}, /* @__PURE__ */ React.createElement(View, { testID: "Carousel.prevButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$9.previous,
		variant: "secondary",
		iconOnly: true,
		disabled: prevTarget === null,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-left",
			color: iconColor
		}),
		onPress: () => {
			if (prevTarget !== null) goTo(prevTarget, "prev");
		},
		onFocus: onControlFocus,
		onBlur: onControlBlur
	}))), /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.controlSurface",
		style: controlSurfaceStyle
	}, /* @__PURE__ */ React.createElement(View, { testID: "Carousel.nextButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$9.next,
		variant: "secondary",
		iconOnly: true,
		disabled: nextTarget === null,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-right",
			color: iconColor
		}),
		onPress: () => {
			if (nextTarget !== null) goTo(nextTarget, "next");
		},
		onFocus: onControlFocus,
		onBlur: onControlBlur
	})))), /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.viewport",
		onLayout: handleViewportLayout,
		style: viewportStyle
	}, /* @__PURE__ */ React.createElement(FlatList, {
		ref: trackRef,
		testID: "Carousel.track",
		data: slides,
		keyExtractor: (item) => item.key,
		renderItem,
		extraData: `${currentIndex}:${pageSize}:${itemWidth}`,
		horizontal: true,
		pagingEnabled: usePaging,
		snapToInterval: snapInterval,
		snapToAlignment: "start",
		decelerationRate: "fast",
		showsHorizontalScrollIndicator: false,
		contentContainerStyle: { gap: slideGap },
		onScrollBeginDrag: () => {
			dragging.current = true;
		},
		onMomentumScrollEnd: () => {
			if (!dragging.current) return;
			dragging.current = false;
			if (isControlled) setSettleCount((n) => n + 1);
		},
		viewabilityConfig,
		onViewableItemsChanged
	}))), picker !== "none" && total > 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.picker",
		role: picker === "tabs" ? "tablist" : "group",
		accessibilityLabel: COPY$9.pickerLabel,
		style: pickerStyle
	}, slides.map((slide, index) => picker === "tabs" ? /* @__PURE__ */ React.createElement(CarouselTab, {
		key: slide.key,
		label: slide.label || COPY$9.goTo(index + 1),
		selected: index === currentIndex,
		fontSize: tabFontSize,
		fontWeight: tabFontWeight,
		fontFamily,
		paddingBlock: tabPaddingBlock,
		paddingInline: tabPaddingInline,
		transition: itemTransition,
		onSelect: () => goTo(index, "picker"),
		onFocus: onControlFocus,
		onBlur: onControlBlur
	}) : /* @__PURE__ */ React.createElement(CarouselDot, {
		key: slide.key,
		label: COPY$9.goTo(index + 1),
		selected: index >= currentIndex && index < currentIndex + pageSize,
		size: dotSize,
		transition: itemTransition,
		onSelect: () => goTo(index, "picker"),
		onFocus: onControlFocus,
		onBlur: onControlBlur
	}))) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "Carousel.liveRegion",
		accessibilityLiveRegion: rotating ? "none" : "polite",
		style: {
			position: "absolute",
			width: 1,
			height: 1,
			overflow: "hidden",
			opacity: 0
		}
	}, /* @__PURE__ */ React.createElement(Text$1, null, announcement)));
}
/** 0 → 1 as `selected` turns on, over `transition` with the standard easing; jumps when `transition` is 0. */
function useSelectedProgress(selected, transition) {
	const { tokens: t } = useTheme();
	const progress = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
	const wasSelected = React.useRef(selected);
	React.useEffect(() => {
		if (wasSelected.current === selected) return;
		wasSelected.current = selected;
		if (transition === 0) {
			progress.setValue(selected ? 1 : 0);
			return;
		}
		const animation = Animated.timing(progress, {
			toValue: selected ? 1 : 0,
			duration: transition,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, [
		selected,
		transition,
		progress,
		t.motionEasingStandard
	]);
	return progress;
}
/** One dot: Carousel's own Pressable, since no Button variant carries the dot tokens. */
function CarouselDot({ label, selected, size, transition, onSelect, onFocus, onBlur }) {
	const { tokens: t } = useTheme();
	const [focused, setFocused] = React.useState(false);
	const progress = useSelectedProgress(selected, transition);
	const hitStyle = {
		minWidth: t.sizeTargetMin,
		minHeight: t.sizeTargetMin,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : "transparent"
	};
	const dotStyle = {
		width: size,
		height: size,
		borderRadius: t.radiusFull,
		backgroundColor: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.colorBorderStrong, t.colorControlSelectedBackground]
		})
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Carousel.pickerItem",
		accessibilityRole: "button",
		accessibilityLabel: label,
		accessibilityState: { selected },
		onFocus: () => {
			setFocused(true);
			onFocus();
		},
		onBlur: () => {
			setFocused(false);
			onBlur();
		},
		onPress: onSelect,
		style: hitStyle
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		style: dotStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}));
}
/** One tab: Carousel's own Pressable and label, styled from the `tab*` bindings. */
function CarouselTab({ label, selected, fontSize, fontWeight, fontFamily, paddingBlock, paddingInline, transition, onSelect, onFocus, onBlur }) {
	const { tokens: t } = useTheme();
	const [focused, setFocused] = React.useState(false);
	const progress = useSelectedProgress(selected, transition);
	const hitStyle = {
		minHeight: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: paddingBlock,
		paddingHorizontal: paddingInline,
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : "transparent"
	};
	const labelStyle = {
		fontFamily,
		fontSize,
		fontWeight: toFontWeight(fontWeight),
		color: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [t.colorForegroundMuted, t.colorForegroundStrong]
		})
	};
	const indicatorStyle = {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: t.borderWidthFocus,
		backgroundColor: t.colorControlSelectedBackground
	};
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Carousel.pickerItem",
		accessibilityRole: "tab",
		accessibilityLabel: label,
		accessibilityState: { selected },
		onFocus: () => {
			setFocused(true);
			onFocus();
		},
		onBlur: () => {
			setFocused(false);
			onBlur();
		},
		onPress: onSelect,
		style: hitStyle
	}, /* @__PURE__ */ React.createElement(Animated.Text, { style: labelStyle }, label), selected ? /* @__PURE__ */ React.createElement(View, {
		style: indicatorStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}) : null);
}
//#endregion
//#region src/Table.tsx
const COPY$8 = {
	sortToolbarLabel: (caption) => `Sort ${caption}`,
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedCount: (count, total) => `${count} of ${total} selected`,
	cellLabel: (column, value) => `${column}: ${value}`,
	actions: "Actions",
	empty: "Nothing to show.",
	loading: "Loading",
	scrollHint: "Scroll sideways to see more columns",
	rowCount: (count) => {
		return new Intl.PluralRules().select(count) === "one" ? `${count} row` : `${count} rows`;
	}
};
const PADDING_INLINE = {
	compact: "layoutInsetSm",
	comfortable: "layoutInsetMd"
};
const JUSTIFY$2 = {
	start: "flex-start",
	center: "center",
	end: "flex-end"
};
/** Clips content to one point while keeping it in the accessibility tree (visually hidden caption, header text, live regions). */
const HIDDEN_STYLE$4 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
const NUMERIC_FONT$2 = "font.family.mono";
const HEADER_WEIGHT$2 = "font.weight.semibold";
const CELL_GAP = "layout.gap.tight";
const CAPTION_SIZE$2 = "font.size.md";
const CAPTION_WEIGHT$2 = "font.weight.semibold";
const CAPTION_GAP$2 = "space.2";
function tokenOr$3(t, ref, fallback) {
	return ref === void 0 ? fallback : resolveToken(t, ref);
}
function cellValue$2(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function compareRows$2(a, b, sort) {
	const factor = sort.direction === "ascending" ? 1 : -1;
	const av = a[sort.column];
	const bv = b[sort.column];
	if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
	return cellValue$2(a, sort.column).localeCompare(cellValue$2(b, sort.column), void 0, { numeric: true }) * factor;
}
/** The interactive-row hover tint, faded over `transition` (instant under reduced motion). */
function HoverTint({ visible, color, duration }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const opacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = visible ? 1 : 0;
		if (reducedMotion) {
			opacity.setValue(toValue);
			return;
		}
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		visible,
		reducedMotion,
		duration,
		opacity,
		t.motionEasingStandard
	]);
	return /* @__PURE__ */ React.createElement(Animated.View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, {
			backgroundColor: color,
			opacity,
			pointerEvents: "none"
		}]
	});
}
/** One edge fade over the scroll region: opaque `color` at the edge to transparent inward, `scrollFade` long. */
function ScrollFade({ edge, inset, length, color }) {
	const gradientId = `table-fade-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const position = {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: length,
		pointerEvents: "none",
		...edge === "start" ? { start: inset } : { end: inset }
	};
	const from = edge === "start" ? "0%" : "100%";
	const to = edge === "start" ? "100%" : "0%";
	return /* @__PURE__ */ React.createElement(View, {
		style: position,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Svg, {
		width: "100%",
		height: "100%"
	}, /* @__PURE__ */ React.createElement(Defs, null, /* @__PURE__ */ React.createElement(LinearGradient, {
		id: gradientId,
		x1: from,
		y1: "0%",
		x2: to,
		y2: "0%"
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
* separate stops beside it, and sortable columns become a `Toolbar` of Buttons above the
* list (`copy.sortToolbarLabel`). At or above that width (tablets, react-native-web) the
* same list renders a header row (`accessibilityRole="header"` cells) and rows of
* fixed-width cells: `width: fill` flexes, `auto` and `min` are both `space.20`.
* `responsive: scroll` keeps the columns at every width inside a horizontal scroll region
* named by the caption with `copy.scrollHint` as its hint; the row-header cells are
* translated by the horizontal offset so they stay pinned, and cast `stickyColumnShadow`
* once scrolled, with a `scrollFade` gradient over each edge that still hides columns
* (react-native-svg, as Toolbar does; the start fade begins where the pinned column ends). `stickyHeader` pins the list header (`stickyHeaderIndices`), which casts
* `headerShadow` once the body has scrolled beneath it; with `maxHeight: none` the list
* does not scroll itself, so the page does. `abbr` has no effect on native.
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
function Table({ caption, captionLevel = "2", footer, hideCaption = false, columns, data, sort, defaultSort, selectable = "none", selected, defaultSelected, responsive = "stack", stickyHeader = true, maxHeight = "none", density = "comfortable", striped = false, emptyMessage, loading = false, rowActions, overrides, onSortChange, onSelectionChange, onRowPress, ref }) {
	const { tokens: t } = useTheme();
	const viewport = useWindowDimensions();
	const baseId = React.useId();
	const [measuredWidth, setMeasuredWidth] = React.useState(null);
	const width = measuredWidth ?? viewport.width;
	const narrow = width < t.layoutMaxWidthProse;
	const layout = responsive === "scroll" ? "scroll" : narrow ? "stack" : "table";
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const activeSort = sort ?? internalSort;
	const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? []);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const [hoveredId, setHoveredId] = React.useState(null);
	const [focusedId, setFocusedId] = React.useState(null);
	const [headerScrolled, setHeaderScrolled] = React.useState(false);
	const [columnScrolled, setColumnScrolled] = React.useState(false);
	const [sortAnnouncement, setSortAnnouncement] = React.useState("");
	const [selectionAnnouncement, setSelectionAnnouncement] = React.useState("");
	const scrollX = React.useRef(new Animated.Value(0)).current;
	React.useEffect(() => {
		const id = scrollX.addListener(({ value }) => setColumnScrolled(value > 0));
		return () => scrollX.removeListener(id);
	}, [scrollX]);
	const [fadeEdges, setFadeEdges] = React.useState({
		start: false,
		end: false
	});
	const [pinnedEnd, setPinnedEnd] = React.useState(0);
	const scrollMetrics = React.useRef({
		offset: 0,
		viewport: 0,
		content: 0
	});
	const updateFadeEdges = () => {
		const { offset, viewport: visible, content } = scrollMetrics.current;
		const start = offset > 1;
		const end = offset + visible < content - 1;
		setFadeEdges((prev) => prev.start === start && prev.end === end ? prev : {
			start,
			end
		});
	};
	const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
	const rowPressEnabled = onRowPress !== void 0 && rowHeaderColumn !== void 0 && rowHeaderColumn.render === void 0;
	React.useEffect(() => {
		if (!__DEV__) return;
		if (columns.filter((column) => column.isRowHeader === true).length > 1) console.warn("Table: only one column may set `isRowHeader`; the first one is used.");
		if (onRowPress !== void 0 && rowHeaderColumn === void 0) console.warn("Table: `onRowPress` needs an `isRowHeader` column to become the row's Button; rows stay inert.");
		else if (onRowPress !== void 0 && rowHeaderColumn?.render !== void 0) console.warn("Table: `onRowPress` is ignored when the row-header column has a custom `render`; put a Link in it instead.");
	}, [
		columns,
		onRowPress,
		rowHeaderColumn
	]);
	const announce = (message, setMessage) => {
		setMessage(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	};
	const sortKey = activeSort === void 0 ? "" : `${activeSort.column}:${activeSort.direction}`;
	const lastSortKey = React.useRef(sortKey);
	React.useEffect(() => {
		if (lastSortKey.current === sortKey || activeSort === void 0) {
			lastSortKey.current = sortKey;
			return;
		}
		lastSortKey.current = sortKey;
		const header = columns.find((column) => column.key === activeSort.column)?.header ?? activeSort.column;
		announce(COPY$8.sortedAnnouncement(header, activeSort.direction), setSortAnnouncement);
	}, [sortKey]);
	const selectionKey = selectedIds.join("\0");
	const lastSelectionKey = React.useRef(selectionKey);
	React.useEffect(() => {
		if (lastSelectionKey.current === selectionKey || selectable === "none") {
			lastSelectionKey.current = selectionKey;
			return;
		}
		lastSelectionKey.current = selectionKey;
		announce(COPY$8.selectedCount(selectedIds.length, data.length), setSelectionAnnouncement);
	}, [selectionKey]);
	const visibleColumns = columns.filter((column) => {
		if (layout === "scroll" || column.hideBelow === void 0) return true;
		return width >= (column.hideBelow === "prose" ? t.layoutMaxWidthProse : t.layoutMaxWidthContent);
	});
	const summaryColumns = rowHeaderColumn !== void 0 && visibleColumns.includes(rowHeaderColumn) ? [rowHeaderColumn, ...visibleColumns.filter((column) => column !== rowHeaderColumn)] : visibleColumns;
	const rows = React.useMemo(() => sort === void 0 && internalSort !== void 0 ? [...data].sort((a, b) => compareRows$2(a, b, internalSort)) : data, [
		data,
		sort,
		internalSort
	]);
	const handleSortPress = (column) => {
		const direction = activeSort?.column === column && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (sort === void 0) setInternalSort({
			column,
			direction
		});
		onSortChange?.(column, direction);
	};
	const commitSelection = (next) => {
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
	};
	const toggleRow = (id) => {
		if (selectable === "single") commitSelection(selectedSet.has(id) ? [] : [id]);
		else if (selectable === "multiple") commitSelection(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
	};
	const allIds = rows.map((row) => row.id);
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitSelection(allSelected ? [] : allIds);
	const rowName = (row) => rowHeaderColumn === void 0 ? row.id : cellValue$2(row, rowHeaderColumn.key) || row.id;
	const headerBorder = tokenOr$3(t, overrides?.headerBorder, t.colorBorderStrong);
	const headerBorderWidth = tokenOr$3(t, overrides?.headerBorderWidth, t.borderWidthThin);
	const headerShadow = tokenOr$3(t, overrides?.headerShadow, t.shadowRaised);
	const rowBorder = tokenOr$3(t, overrides?.rowBorder, t.colorBorder);
	const rowBorderWidth = tokenOr$3(t, overrides?.rowBorderWidth, t.borderWidthThin);
	const rowHover = tokenOr$3(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
	const cellPaddingInline = tokenOr$3(t, overrides?.cellPaddingInline, t[PADDING_INLINE[density]]);
	const cellPaddingBlock = tokenOr$3(t, overrides?.cellPaddingBlock, t.spaceSm);
	const cellGap = tokenOr$3(t, overrides?.cellGap, t.layoutGapTight);
	const stackedRowInset = tokenOr$3(t, overrides?.stackedRowInset, t.layoutInsetMd);
	const stackedRowGap = tokenOr$3(t, overrides?.stackedRowGap, t.layoutGapTight);
	const stackedBlockGap = tokenOr$3(t, overrides?.stackedBlockGap, t.layoutGapTight);
	const stackedRowRadius = tokenOr$3(t, overrides?.stackedRowRadius, t.radiusMd);
	const scrollFade = tokenOr$3(t, overrides?.scrollFade, t.space6);
	const stickyColumnShadow = tokenOr$3(t, overrides?.stickyColumnShadow, t.shadowRaised);
	const transition = tokenOr$3(t, overrides?.transition, t.motionDurationFast);
	const bodyText = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	const numericText = {
		...bodyText,
		fontFamily: overrides?.numericFont ?? NUMERIC_FONT$2
	};
	const headerText = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight,
		fontSize: overrides?.headerSize,
		fontWeight: overrides?.headerWeight
	};
	const stackedLabelText = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight,
		fontSize: overrides?.stackedLabelSize,
		fontWeight: overrides?.stackedLabelWeight
	};
	const rowBackground = (row, index) => selectable !== "none" && selectedSet.has(row.id) || striped && index % 2 === 1 ? t.colorBackgroundSubtle : t.colorBackground;
	const cellStyle = {
		paddingHorizontal: cellPaddingInline,
		paddingVertical: cellPaddingBlock,
		justifyContent: "center"
	};
	const selectCellStyle = {
		width: t.sizeTargetComfortable,
		alignItems: "center",
		justifyContent: "center"
	};
	const columnBox = (column) => column.width === "fill" ? {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		minWidth: t.space20,
		alignItems: JUSTIFY$2[column.align ?? "start"]
	} : {
		width: t.space20,
		alignItems: JUSTIFY$2[column.align ?? "start"]
	};
	const renderValue = (row, column) => column.render !== void 0 ? column.render(row) : /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		align: column.align ?? "start",
		overrides: column.align === "end" ? numericText : bodyText
	}, cellValue$2(row, column.key));
	const sortIcon = (column) => activeSort?.column === column.key ? /* @__PURE__ */ React.createElement(Icon, {
		name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
		inline: true,
		color: t.colorActionGhostForeground
	}) : void 0;
	const sortButton = (column) => /* @__PURE__ */ React.createElement(Button, {
		key: column.key,
		label: column.header,
		accessibleName: activeSort?.column === column.key && activeSort.direction === "ascending" ? COPY$8.sortDescending(column.header) : COPY$8.sortAscending(column.header),
		variant: "ghost",
		size: "sm",
		trailingIcon: sortIcon(column),
		overrides: {
			fontWeight: overrides?.headerWeight ?? HEADER_WEIGHT$2,
			iconGap: overrides?.cellGap ?? CELL_GAP
		},
		onPress: () => handleSortPress(column.key)
	});
	const selectAll = selectable === "multiple" ? /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$8.selectAll,
		hideLabel: true,
		name: `${baseId}-all`,
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	}) : null;
	const rowCheckbox = (row) => /* @__PURE__ */ React.createElement(View, {
		style: selectCellStyle,
		testID: "Table.selectCell"
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$8.selectRow(rowName(row)),
		hideLabel: true,
		name: `${baseId}-${row.id}`,
		checked: selectedSet.has(row.id),
		onChange: () => toggleRow(row.id)
	}));
	const pinned = (column) => layout === "scroll" && column === rowHeaderColumn;
	const pinnedStyle = (background) => ({
		transform: [{ translateX: scrollX }],
		zIndex: 1,
		backgroundColor: background,
		...columnScrolled ? stickyColumnShadow : null
	});
	const headerRow = /* @__PURE__ */ React.createElement(View, {
		testID: "Table.header",
		style: {
			flexDirection: "row",
			alignItems: "stretch",
			backgroundColor: t.colorBackgroundSubtle,
			borderBottomWidth: headerBorderWidth,
			borderBottomColor: headerBorder,
			...stickyHeader && headerScrolled ? headerShadow : null
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Table.headerRow",
		style: {
			flexDirection: "row",
			alignItems: "stretch",
			flexGrow: 1
		}
	}, selectable !== "none" ? /* @__PURE__ */ React.createElement(View, {
		style: selectCellStyle,
		testID: "Table.selectAllCell"
	}, selectAll) : null, visibleColumns.map((column) => {
		const content = column.sortable === true ? /* @__PURE__ */ React.createElement(View, { testID: "Table.sortButton" }, sortButton(column)) : /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			align: column.align ?? "start",
			overrides: headerText
		}, column.header);
		const style = [cellStyle, columnBox(column)];
		return pinned(column) ? /* @__PURE__ */ React.createElement(Animated.View, {
			key: column.key,
			testID: "Table.columnHeader",
			accessibilityRole: "header",
			onLayout: (event) => {
				const box = event.nativeEvent.layout;
				setPinnedEnd(box.x + box.width);
			},
			style: [...style, pinnedStyle(t.colorBackgroundSubtle)]
		}, content) : /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			testID: "Table.columnHeader",
			accessibilityRole: "header",
			style
		}, content);
	}), rowActions !== void 0 ? /* @__PURE__ */ React.createElement(View, {
		testID: "Table.columnHeader",
		accessibilityRole: "header",
		style: [cellStyle, { flexShrink: 0 }]
	}, /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE$4 }, /* @__PURE__ */ React.createElement(Text, { size: "sm" }, COPY$8.actions))) : null));
	const renderColumnsRow = ({ item: row, index }) => {
		const isSelected = selectable !== "none" && selectedSet.has(row.id);
		const background = rowBackground(row, index);
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Table.row",
			accessibilityState: selectable !== "none" ? { selected: isSelected } : void 0,
			style: {
				flexDirection: "row",
				alignItems: "stretch",
				backgroundColor: background,
				borderBottomWidth: rowBorderWidth,
				borderBottomColor: rowBorder,
				borderStartWidth: t.borderWidthFocus,
				borderStartColor: isSelected ? t.colorControlSelectedBackground : background
			}
		}, rowPressEnabled ? /* @__PURE__ */ React.createElement(HoverTint, {
			visible: hoveredId === row.id,
			color: rowHover,
			duration: transition
		}) : null, selectable !== "none" ? rowCheckbox(row) : null, visibleColumns.map((column) => {
			const isRowHeader = column === rowHeaderColumn;
			const style = [cellStyle, columnBox(column)];
			if (isRowHeader && rowPressEnabled) {
				const focused = focusedId === row.id;
				return /* @__PURE__ */ React.createElement(Pressable, {
					key: column.key,
					testID: "Table.rowHeader",
					accessibilityRole: "button",
					accessibilityLabel: rowName(row),
					accessibilityState: selectable !== "none" ? { selected: isSelected } : void 0,
					onPress: () => onRowPress?.(row.id),
					onHoverIn: () => setHoveredId(row.id),
					onHoverOut: () => setHoveredId((current) => current === row.id ? null : current),
					onFocus: () => setFocusedId(row.id),
					onBlur: () => setFocusedId((current) => current === row.id ? null : current),
					style: [...style, {
						minHeight: t.sizeTargetMin,
						borderWidth: t.borderWidthFocus,
						borderColor: focused ? t.colorBorderFocus : "transparent"
					}]
				}, renderValue(row, column));
			}
			const testID = isRowHeader ? "Table.rowHeader" : "Table.cell";
			return pinned(column) ? /* @__PURE__ */ React.createElement(Animated.View, {
				key: column.key,
				testID,
				style: [...style, pinnedStyle(background)]
			}, renderValue(row, column)) : /* @__PURE__ */ React.createElement(View, {
				key: column.key,
				testID,
				style
			}, renderValue(row, column));
		}), rowActions !== void 0 ? /* @__PURE__ */ React.createElement(View, {
			testID: "Table.cell",
			style: [cellStyle, {
				flexDirection: "row",
				alignItems: "center",
				gap: cellGap,
				flexShrink: 0
			}]
		}, rowActions(row)) : null);
	};
	const sortableColumns = visibleColumns.filter((column) => column.sortable === true);
	const stackedHeader = /* @__PURE__ */ React.createElement(View, {
		testID: "Table.header",
		style: {
			backgroundColor: t.colorBackground,
			paddingBottom: cellPaddingBlock,
			...stickyHeader && headerScrolled ? headerShadow : null
		}
	}, selectAll !== null ? /* @__PURE__ */ React.createElement(View, { testID: "Table.selectAllCell" }, selectAll) : null, sortableColumns.length > 0 ? /* @__PURE__ */ React.createElement(Toolbar, {
		label: COPY$8.sortToolbarLabel(caption),
		density
	}, sortableColumns.map(sortButton)) : null);
	const renderStackedRow = ({ item: row, index }) => {
		const isSelected = selectable !== "none" && selectedSet.has(row.id);
		const background = rowBackground(row, index);
		const summary = summaryColumns.map((column) => COPY$8.cellLabel(column.header, cellValue$2(row, column.key))).join(", ");
		const pairs = summaryColumns.map((column) => /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			testID: column === rowHeaderColumn ? "Table.rowHeader" : "Table.cell"
		}, /* @__PURE__ */ React.createElement(View, { testID: "Table.stackedLabel" }, /* @__PURE__ */ React.createElement(Text, {
			size: "xs",
			weight: "medium",
			tone: "muted",
			overrides: stackedLabelText
		}, column.header)), renderValue(row, column)));
		const summaryStyle = {
			flexGrow: 1,
			flexShrink: 1,
			gap: stackedRowGap
		};
		const focused = focusedId === row.id;
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Table.row",
			style: {
				flexDirection: "row",
				alignItems: "flex-start",
				gap: cellGap,
				padding: stackedRowInset,
				borderRadius: stackedRowRadius,
				overflow: "hidden",
				backgroundColor: background,
				borderWidth: rowBorderWidth,
				borderColor: rowBorder,
				borderStartWidth: t.borderWidthFocus,
				borderStartColor: isSelected ? t.colorControlSelectedBackground : rowBorder
			}
		}, rowPressEnabled ? /* @__PURE__ */ React.createElement(HoverTint, {
			visible: hoveredId === row.id,
			color: rowHover,
			duration: transition
		}) : null, selectable !== "none" ? rowCheckbox(row) : null, rowPressEnabled ? /* @__PURE__ */ React.createElement(Pressable, {
			accessibilityRole: "button",
			accessibilityLabel: summary,
			accessibilityState: selectable !== "none" ? { selected: isSelected } : void 0,
			onPress: () => onRowPress?.(row.id),
			onHoverIn: () => setHoveredId(row.id),
			onHoverOut: () => setHoveredId((current) => current === row.id ? null : current),
			onFocus: () => setFocusedId(row.id),
			onBlur: () => setFocusedId((current) => current === row.id ? null : current),
			style: [summaryStyle, {
				minHeight: t.sizeTargetMin,
				borderWidth: t.borderWidthFocus,
				borderColor: focused ? t.colorBorderFocus : "transparent"
			}]
		}, /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no-hide-descendants",
			style: { gap: stackedRowGap }
		}, pairs)) : /* @__PURE__ */ React.createElement(View, {
			accessible: true,
			accessibilityLabel: summary,
			accessibilityState: selectable !== "none" ? { selected: isSelected } : void 0,
			style: summaryStyle
		}, pairs), rowActions !== void 0 ? /* @__PURE__ */ React.createElement(View, {
			testID: "Table.cell",
			style: {
				flexDirection: "row",
				alignItems: "center",
				gap: cellGap
			}
		}, rowActions(row)) : null);
	};
	const emptyState = /* @__PURE__ */ React.createElement(View, {
		testID: "Table.emptyState",
		style: cellStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: bodyText
	}, loading ? COPY$8.loading : emptyMessage ?? COPY$8.empty));
	const list = /* @__PURE__ */ React.createElement(FlatList, {
		testID: "Table.table",
		data: rows,
		extraData: [
			selectedIds,
			activeSort,
			hoveredId,
			focusedId,
			columnScrolled,
			layout,
			width
		],
		keyExtractor: (row) => row.id,
		renderItem: layout === "stack" ? renderStackedRow : renderColumnsRow,
		ListHeaderComponent: layout === "stack" ? stackedHeader : headerRow,
		ListEmptyComponent: emptyState,
		stickyHeaderIndices: stickyHeader ? [0] : void 0,
		contentContainerStyle: layout === "stack" ? { gap: stackedBlockGap } : void 0,
		scrollEnabled: maxHeight === "viewport",
		style: maxHeight === "viewport" ? { maxHeight: viewport.height - 2 * t.layoutGapSection } : void 0,
		onScroll: (event) => setHeaderScrolled(event.nativeEvent.contentOffset.y > 0),
		scrollEventThrottle: 16,
		accessibilityRole: "list",
		accessibilityLabel: caption,
		accessibilityHint: COPY$8.rowCount(data.length),
		accessibilityState: { busy: loading }
	});
	const handleLayout = (event) => {
		setMeasuredWidth(event.nativeEvent.layout.width);
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Table",
		onLayout: handleLayout,
		style: { backgroundColor: t.colorBackground }
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Table.caption",
		style: hideCaption ? HIDDEN_STYLE$4 : void 0
	}, /* @__PURE__ */ React.createElement(Heading, {
		level: captionLevel,
		size: "md",
		overrides: {
			fontSize: overrides?.captionSize ?? CAPTION_SIZE$2,
			fontWeight: overrides?.captionWeight ?? CAPTION_WEIGHT$2,
			marginBlockEnd: overrides?.captionGap ?? CAPTION_GAP$2
		}
	}, caption)), /* @__PURE__ */ React.createElement(View, { testID: "Table.container" }, layout === "scroll" ? /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(Animated.ScrollView, {
		testID: "Table.scrollRegion",
		horizontal: true,
		accessibilityLabel: caption,
		accessibilityHint: COPY$8.scrollHint,
		onLayout: (event) => {
			scrollMetrics.current.viewport = event.nativeEvent.layout.width;
			updateFadeEdges();
		},
		onContentSizeChange: (contentWidth) => {
			scrollMetrics.current.content = contentWidth;
			updateFadeEdges();
		},
		onScroll: Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
			useNativeDriver: false,
			listener: (event) => {
				scrollMetrics.current.offset = event.nativeEvent.contentOffset.x;
				updateFadeEdges();
			}
		}),
		scrollEventThrottle: 16,
		contentContainerStyle: { flexGrow: 1 }
	}, /* @__PURE__ */ React.createElement(View, { style: { flexGrow: 1 } }, list)), fadeEdges.start ? /* @__PURE__ */ React.createElement(ScrollFade, {
		edge: "start",
		inset: pinnedEnd,
		length: scrollFade,
		color: t.colorBackground
	}) : null, fadeEdges.end ? /* @__PURE__ */ React.createElement(ScrollFade, {
		edge: "end",
		inset: 0,
		length: scrollFade,
		color: t.colorBackground
	}) : null) : list), loading && rows.length > 0 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: cellStyle
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: bodyText
	}, COPY$8.loading)) : null, footer !== void 0 && footer !== null ? /* @__PURE__ */ React.createElement(View, {
		testID: "Table.footer",
		style: cellStyle
	}, typeof footer === "string" ? /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: bodyText
	}, footer) : footer) : null, /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$4
	}, /* @__PURE__ */ React.createElement(Text, { size: "sm" }, sortAnnouncement)), /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$4
	}, /* @__PURE__ */ React.createElement(Text, { size: "sm" }, selectionAnnouncement)));
}
//#endregion
//#region src/DatePicker.tsx
const COPY$7 = {
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
	rangeOrder: "End date must be on or after the start date.",
	requiredIndicator: " (required)"
};
const WEEKDAYS_PER_ROW = 7;
const MS_PER_DAY = 864e5;
const MS_PER_WEEK = MS_PER_DAY * 7;
const YEARS_BACK = 100;
const YEARS_AHEAD = 10;
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
	const names = {
		year: "YYYY",
		month: "MM",
		day: "DD"
	};
	return getPatternOrder(locale).map((part) => names[part]).join("/");
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
const PADDING_INLINE_TOKEN = {
	sm: "space2",
	md: "spaceMd"
};
const PADDING_BLOCK_TOKEN = {
	sm: "space1",
	md: "spaceSm"
};
const MIN_TARGET_TOKEN = {
	sm: "sizeTargetMin",
	md: "sizeTargetComfortable"
};
/**
* One day. The fill cross-fades over the `transition` duration when the day's
* hover/selection state changes (instant under reduced motion). Hover and focus are
* tracked by hand; focus draws the `focusRing` border, today the `dayTodayBorder` ring.
*/
function DayButton({ cell, label, selected, rangeEnd, inRange, today, disabled, size, radius, hoverColor, fontSizeOverride, disabledOpacity, duration, onSelect }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [hovered, setHovered] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const fill = rangeEnd ? t.colorControlSelectedBackground : inRange ? t.colorBackgroundStrong : hovered && !disabled ? hoverColor : "transparent";
	const progress = React.useRef(new Animated.Value(1)).current;
	const [colors, setColors] = React.useState({
		from: fill,
		to: fill
	});
	React.useEffect(() => {
		if (fill === colors.to) return;
		setColors({
			from: colors.to,
			to: fill
		});
		if (reducedMotion) {
			progress.setValue(1);
			return;
		}
		progress.setValue(0);
		Animated.timing(progress, {
			toValue: 1,
			duration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [fill]);
	const backgroundColor = progress.interpolate({
		inputRange: [0, 1],
		outputRange: [colors.from, colors.to]
	});
	const slop = Math.max(0, Math.ceil((t.sizeTargetMin - size) / 2));
	const surfaceStyle = {
		width: size,
		height: size,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: radius,
		backgroundColor,
		borderWidth: focused || today ? t.borderWidthFocus : 0,
		borderColor: focused ? t.colorBorderFocus : t.colorControlSelectedBackground,
		opacity: disabled ? disabledOpacity : 1
	};
	const foreground = rangeEnd ? t.colorControlSelectedForeground : cell.outsideMonth ? t.colorForegroundMuted : void 0;
	return /* @__PURE__ */ React.createElement(Pressable, {
		accessibilityRole: "button",
		accessibilityLabel: label,
		accessibilityState: {
			selected,
			disabled
		},
		hitSlop: {
			top: slop,
			bottom: slop,
			left: slop,
			right: slop
		},
		onPress: () => {
			if (!disabled) onSelect(cell.iso);
		},
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		testID: "DatePicker.day"
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: surfaceStyle }, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: foreground }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		overrides: { fontSize: fontSizeOverride }
	}, cell.d))));
}
/**
* DatePicker — two ways to say the same date: type it, or find it on a calendar.
* Both produce a plain ISO date (or a `{ start, end }` range), never a timestamp.
*
* When to use: any date the user chooses — due dates, bookings, dates of birth, report
* periods (`range`). Set `min`/`max` and `isDateDisabled` whenever they exist so the
* calendar shows what is possible instead of validating after the fact. Not for a
* date-and-time, a month/year alone (Select), or relative choices (SegmentedControl).
*
* Renders the `TextInput`(s) (locale pattern, `keyboardType="number-pad"`) and a ghost,
* icon-only calendar `Button` that opens a `BottomSheet` (`height="content"`; there is no
* core native date picker) holding: a header of prev/next `Button`s and month/year
* `Select`s (`hideLabel`, `size: sm`, outside any Form so they never register); a
* 7-column grid of day `Pressable`s (`accessibilityRole="button"`,
* `accessibilityState={{ selected, disabled }}`, `accessibilityLabel` from the full date
* plus "today"/"selected"); and a footer of Today/Clear `Button`s. The month is announced
* when it changes. Native has no grid role and no key events on `Pressable`, so there is
* no roving tabindex or arrow/Page/Home/End handling: every day is its own focus stop and
* the prev/next month Buttons stand in for PageUp/PageDown. Escape and the Android back
* gesture close the sheet without changing the value through BottomSheet, whose own
* FocusScope returns focus. ArrowDown (and Alt+ArrowDown, indistinguishable here) in the
* input opens the calendar when a hardware keyboard or react-native-web supplies it.
*
* Selecting a day closes for a single date; for a range the first pick sets the start
* (clearing the old range), the second sets the end and closes, and a pick before the
* start restarts. Today acts like pressing today's cell; Clear wipes the value (both
* ends) and leaves the sheet open. Validation: `error` → `required` → unparseable
* (`copy.invalid`) → `tooEarly` → `tooLate` → `rangeOrder`; a range reports its message
* only under `name`, while `name-end` always validates clean.
*/
function DatePicker({ label, name, value, defaultValue, open: openProp, range = false, min, max, isDateDisabled, locale, showWeekNumbers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, error, overrides, ref, onChange, onOpenChange }) {
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
	const openedFromEndRef = React.useRef(false);
	const anchorDate = () => {
		const anchorIso = range ? openedFromEndRef.current ? currentEnd ?? currentStart : currentStart : currentSingle;
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
		if (isDisabled || next === isOpen) return;
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
	const validateValue = React.useCallback((candidate, texts) => {
		if (error !== void 0 && error !== "") return error;
		if (texts.every((text) => text === "")) return required ? COPY$7.required(label) : null;
		if (texts.some((text) => text !== "" && parseTyped(text, locale) === null)) return COPY$7.invalid(label, patternPlaceholder);
		if (texts.some((text) => text === "")) return required ? COPY$7.required(label) : null;
		if (candidate === void 0) return null;
		const isos = typeof candidate === "string" ? [candidate] : [candidate.start, candidate.end];
		if (min !== void 0 && isos.some((iso) => iso < min)) return COPY$7.tooEarly(label, formatDisplay(min, locale));
		if (max !== void 0 && isos.some((iso) => iso > max)) return COPY$7.tooLate(label, formatDisplay(max, locale));
		if (typeof candidate === "object" && candidate.end < candidate.start) return COPY$7.rangeOrder;
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
	const texts = range ? [startText, endText] : [singleText];
	const commitValue = (next, nextTexts) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form !== null && form.validateMode !== "submit") form.reportValidity(name, validateValue(next, nextTexts));
	};
	const latest = React.useRef({
		currentValue,
		currentSingle,
		currentStart,
		currentEnd,
		texts,
		validateValue,
		label
	});
	latest.current = {
		currentValue,
		currentSingle,
		currentStart,
		currentEnd,
		texts,
		validateValue,
		label
	};
	const focusInput = (inputRef) => {
		const input = inputRef.current;
		if (input === null) return;
		input.focus();
		const node = findNodeHandle(input);
		if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
	};
	const singleHandle = React.useMemo(() => ({
		get label() {
			return latest.current.label;
		},
		getValue: () => latest.current.currentSingle,
		validate: () => latest.current.validateValue(latest.current.currentValue, latest.current.texts),
		focus: () => focusInput(singleInputRef)
	}), []);
	const startHandle = React.useMemo(() => ({
		get label() {
			return latest.current.label;
		},
		getValue: () => latest.current.currentStart,
		validate: () => latest.current.validateValue(latest.current.currentValue, latest.current.texts),
		focus: () => focusInput(startInputRef)
	}), []);
	const endHandle = React.useMemo(() => ({
		get label() {
			return latest.current.label;
		},
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
	const showMonthOf = (iso) => {
		const anchor = parseISO(iso);
		if (anchor !== null) {
			setViewYear(anchor.y);
			setViewMonth(anchor.m);
		}
	};
	const handleSingleChangeText = (text) => {
		if (isDisabled) return;
		setSingleText(text);
		if (text === "") {
			if (currentSingle !== void 0) commitValue(void 0, [text]);
			return;
		}
		const parsed = parseTyped(text, locale);
		if (parsed !== null && parsed !== currentSingle) {
			commitValue(parsed, [text]);
			showMonthOf(parsed);
		}
	};
	const handleRangeChangeText = (which, text) => {
		if (isDisabled) return;
		const nextStartText = which === "start" ? text : startText;
		const nextEndText = which === "end" ? text : endText;
		if (which === "start") setStartText(text);
		else setEndText(text);
		if (nextStartText === "" && nextEndText === "") {
			if (currentValue !== void 0) commitValue(void 0, [nextStartText, nextEndText]);
			return;
		}
		const start = parseTyped(nextStartText, locale);
		const end = parseTyped(nextEndText, locale);
		const typed = which === "start" ? start : end;
		if (typed !== null) showMonthOf(typed);
		if (start !== null && end !== null && (start !== currentStart || end !== currentEnd)) commitValue({
			start,
			end
		}, [nextStartText, nextEndText]);
	};
	const handleBlur = () => {
		if (form !== null && form.validateMode === "blur") form.reportValidity(name, validateValue(currentValue, texts));
	};
	const handleInputKeyPress = (event, fromEnd = false) => {
		if (event.nativeEvent.key === "ArrowDown") {
			openedFromEndRef.current = fromEnd;
			changeOpen(true);
		}
	};
	const handleDaySelect = (iso) => {
		if (isDisabled || isDayDisabled(iso)) return;
		if (!range) {
			commitValue(iso, [formatDisplay(iso, locale)]);
			changeOpen(false);
			return;
		}
		if (pendingStart === void 0 || iso < pendingStart) {
			setPendingStart(iso);
			return;
		}
		setPendingStart(void 0);
		commitValue({
			start: pendingStart,
			end: iso
		}, [formatDisplay(pendingStart, locale), formatDisplay(iso, locale)]);
		changeOpen(false);
	};
	const handleTodayPress = () => {
		const today = todayISO();
		showMonthOf(today);
		handleDaySelect(today);
	};
	const handleClearPress = () => {
		if (isDisabled) return;
		setPendingStart(void 0);
		setSingleText("");
		setStartText("");
		setEndText("");
		commitValue(void 0, range ? ["", ""] : [""]);
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
		const minYear = (min !== void 0 ? parseISO(min)?.y : void 0) ?? currentYear - YEARS_BACK;
		const maxYear = (max !== void 0 ? parseISO(max)?.y : void 0) ?? currentYear + YEARS_AHEAD;
		const first = Math.min(minYear, viewYear);
		const last = Math.max(maxYear, viewYear);
		return Array.from({ length: last - first + 1 }, (_, i) => {
			const y = first + i;
			return {
				value: String(y),
				label: String(y)
			};
		});
	}, [
		min,
		max,
		viewYear
	]);
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
	const weekdayLabels = React.useMemo(() => Array.from({ length: WEEKDAYS_PER_ROW }, (_, i) => ({
		short: weekdayName(locale, (firstDay + i) % 7, "short"),
		long: weekdayName(locale, (firstDay + i) % 7, "long")
	})), [locale, firstDay]);
	const todayIso = todayISO();
	const displayStart = range ? pendingStart ?? currentStart : void 0;
	const displayEnd = range ? pendingStart !== void 0 ? void 0 : currentEnd : void 0;
	const todayDisabled = isDisabled || isDayDisabled(todayIso);
	const isRangeEnd = (iso) => range ? iso === displayStart || iso === displayEnd : iso === currentSingle;
	const isInRange = (iso) => range && displayStart !== void 0 && displayEnd !== void 0 ? iso > displayStart && iso < displayEnd : false;
	const isSelected = (iso) => isRangeEnd(iso) || isInRange(iso);
	const dayAccessibilityLabel = (iso) => {
		const bits = [formatFull(iso, locale)];
		if (iso === todayIso) bits.push(COPY$7.todayLabel);
		if (isSelected(iso)) bits.push(COPY$7.selected);
		return bits.join(", ");
	};
	const monthLabel = monthName(locale, viewMonth, "long");
	const gridLabel = COPY$7.gridLabel(label, monthLabel, String(viewYear));
	const prevGridLabelRef = React.useRef(gridLabel);
	React.useEffect(() => {
		if (isOpen && gridLabel !== prevGridLabelRef.current) AccessibilityInfo.announceForAccessibility(gridLabel);
		prevGridLabelRef.current = gridLabel;
	}, [gridLabel, isOpen]);
	const borderInvalidColor = overrides?.borderInvalid ? resolveToken(t, overrides.borderInvalid) : t.colorBorderDanger;
	const borderWidth = overrides?.borderWidth ? resolveToken(t, overrides.borderWidth) : t.borderWidthThin;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusMd;
	const paddingInline = overrides?.paddingInline ? resolveToken(t, overrides.paddingInline) : t[PADDING_INLINE_TOKEN[size]];
	const paddingBlock = overrides?.paddingBlock ? resolveToken(t, overrides.paddingBlock) : t[PADDING_BLOCK_TOKEN[size]];
	const minTarget = t[MIN_TARGET_TOKEN[size]];
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const fieldGap = overrides?.fieldGap ? resolveToken(t, overrides.fieldGap) : t.space2;
	const fontFamily = overrides?.fontFamily ? resolveToken(t, overrides.fontFamily) : t.fontFamilyBody;
	const fontSize = overrides?.fontSize ? resolveToken(t, overrides.fontSize) : t[FONT_SIZE_TOKEN[size]];
	const headerGap = overrides?.headerGap ? resolveToken(t, overrides.headerGap) : t.layoutGapTight;
	const footerGap = overrides?.footerGap ? resolveToken(t, overrides.footerGap) : t.layoutGapTight;
	const lineHeightMultiplier = overrides?.lineHeight ? resolveToken(t, overrides.lineHeight) : t.fontLineHeightNormal;
	const disabledOpacity = overrides?.disabledOpacity ? resolveToken(t, overrides.disabledOpacity) : t.opacityDisabled;
	const calendarInset = overrides?.calendarInset ?? "layout.inset.md";
	const monthTitleSize = overrides?.monthTitleSize ?? "font.size.md";
	const monthTitleWeight = overrides?.monthTitleWeight ?? "font.weight.semibold";
	const dayGap = overrides?.dayGap ? resolveToken(t, overrides.dayGap) : t.space0;
	const dayRadius = overrides?.dayRadius ? resolveToken(t, overrides.dayRadius) : t.radiusMd;
	const dayHoverColor = overrides?.dayHover ? resolveToken(t, overrides.dayHover) : t.colorActionGhostBackgroundHover;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const daySize = t.sizeTargetComfortable;
	const visibleLabel = required ? `${label}${COPY$7.requiredIndicator}` : label;
	const invalid = displayedError !== void 0;
	const hint = [description, displayedError].filter((part) => part !== void 0 && part !== "").join(". ");
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
	const fieldTextStyle = (focused) => {
		const inset = t.borderWidthFocus - borderWidth;
		return {
			flexGrow: 1,
			flexShrink: 1,
			flexBasis: 0,
			minHeight: minTarget,
			backgroundColor: t.colorBackground,
			color: t.colorForeground,
			borderWidth: focused ? t.borderWidthFocus : borderWidth,
			borderColor: focused ? t.colorBorderFocus : invalid ? borderInvalidColor : t.colorBorderStrong,
			borderRadius: radius,
			paddingHorizontal: focused ? paddingInline : paddingInline + inset,
			paddingVertical: focused ? paddingBlock : paddingBlock + inset,
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
		fontSize: overrides?.fontSize,
		fontWeight: overrides?.labelWeight,
		lineHeight: overrides?.lineHeight
	};
	const weekdayOverrides = {
		fontSize: overrides?.weekdaySize,
		fontWeight: overrides?.weekdayWeight
	};
	const headerRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: headerGap
	};
	const footerRowStyle = {
		flexDirection: "row",
		alignItems: "center",
		gap: footerGap
	};
	const rowStyle = {
		flexDirection: "row",
		gap: dayGap
	};
	const gridStyle = {
		flexDirection: "column",
		gap: dayGap
	};
	const headerCellStyle = {
		width: daySize,
		alignItems: "center",
		justifyContent: "center"
	};
	const inputProps = {
		accessibilityHint: hint !== "" ? hint : void 0,
		accessibilityState: { disabled: isDisabled },
		keyboardType: "number-pad",
		editable: !isDisabled,
		placeholder: placeholder ?? patternPlaceholder,
		placeholderTextColor: t.colorForegroundMuted,
		onKeyPress: handleInputKeyPress,
		testID: "DatePicker.input"
	};
	const field = range ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(TextInput, {
		...inputProps,
		ref: startInputRef,
		accessibilityLabel: `${visibleLabel}, ${COPY$7.startLabel}`,
		value: startText,
		onChangeText: (text) => handleRangeChangeText("start", text),
		onFocus: () => setStartFocused(true),
		onBlur: () => {
			setStartFocused(false);
			handleBlur();
		},
		style: fieldTextStyle(startFocused)
	}), /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, /* @__PURE__ */ React.createElement(Text, { tone: "muted" }, "–")), /* @__PURE__ */ React.createElement(TextInput, {
		...inputProps,
		ref: endInputRef,
		accessibilityLabel: `${visibleLabel}, ${COPY$7.endLabel}`,
		value: endText,
		onKeyPress: (event) => handleInputKeyPress(event, true),
		onChangeText: (text) => handleRangeChangeText("end", text),
		onFocus: () => setEndFocused(true),
		onBlur: () => {
			setEndFocused(false);
			handleBlur();
		},
		style: fieldTextStyle(endFocused)
	})) : /* @__PURE__ */ React.createElement(TextInput, {
		...inputProps,
		ref: singleInputRef,
		accessibilityLabel: visibleLabel,
		value: singleText,
		onChangeText: handleSingleChangeText,
		onFocus: () => setSingleFocused(true),
		onBlur: () => {
			setSingleFocused(false);
			handleBlur();
		},
		style: fieldTextStyle(singleFocused)
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		style: containerStyle,
		testID: "DatePicker"
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.label" }, /* @__PURE__ */ React.createElement(Text, {
		size,
		weight: "medium",
		overrides: labelOverrides
	}, visibleLabel)), description !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: helperOverrides
	}, description)) : null, /* @__PURE__ */ React.createElement(View, {
		style: fieldRowStyle,
		testID: "DatePicker.field"
	}, field, /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.calendarButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: range ? COPY$7.openRange : COPY$7.open,
		variant: "ghost",
		size,
		iconOnly: true,
		expanded: isOpen,
		disabled: isDisabled,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "calendar",
			color: t.colorActionGhostForeground
		}),
		onPress: () => changeOpen(!isOpen)
	}))), invalid ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: summarised ? "none" : "assertive",
		testID: "DatePicker.errorMessage"
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "danger",
		overrides: helperOverrides
	}, displayedError)) : null, /* @__PURE__ */ React.createElement(BottomSheet, {
		open: isOpen,
		heading: label,
		height: "content",
		onClose: () => changeOpen(false),
		overrides: { inset: calendarInset },
		footer: /* @__PURE__ */ React.createElement(View, {
			style: footerRowStyle,
			testID: "DatePicker.footer"
		}, /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.todayButton" }, /* @__PURE__ */ React.createElement(Button, {
			label: COPY$7.today,
			variant: "ghost",
			size: "sm",
			disabled: todayDisabled,
			onPress: handleTodayPress
		})), /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.clearButton" }, /* @__PURE__ */ React.createElement(Button, {
			label: COPY$7.clear,
			variant: "ghost",
			size: "sm",
			disabled: isDisabled,
			onPress: handleClearPress
		})))
	}, /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.popover" }, /* @__PURE__ */ React.createElement(Stack, {
		direction: "vertical",
		gap: "normal",
		overrides: { gap: overrides?.calendarGap }
	}, /* @__PURE__ */ React.createElement(View, {
		style: headerRowStyle,
		testID: "DatePicker.header"
	}, /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.prevMonthButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$7.previousMonth,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-left",
			size: "sm",
			color: t.colorActionGhostForeground
		}),
		onPress: handlePrevMonth
	})), /* @__PURE__ */ React.createElement(FormContext.Provider, { value: null }, /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.monthSelect" }, /* @__PURE__ */ React.createElement(Select, {
		label: COPY$7.month,
		name: `${name}-month`,
		hideLabel: true,
		size: "sm",
		options: monthOptions,
		value: String(viewMonth),
		onChange: handleMonthChange,
		overrides: {
			fontSize: monthTitleSize,
			fontWeight: monthTitleWeight
		}
	})), /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.yearSelect" }, /* @__PURE__ */ React.createElement(Select, {
		label: COPY$7.year,
		name: `${name}-year`,
		hideLabel: true,
		size: "sm",
		options: yearOptions,
		value: String(viewYear),
		onChange: handleYearChange,
		overrides: {
			fontSize: monthTitleSize,
			fontWeight: monthTitleWeight
		}
	}))), /* @__PURE__ */ React.createElement(View, { testID: "DatePicker.nextMonthButton" }, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$7.nextMonth,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: "chevron-right",
			size: "sm",
			color: t.colorActionGhostForeground
		}),
		onPress: handleNextMonth
	}))), /* @__PURE__ */ React.createElement(View, {
		style: gridStyle,
		testID: "DatePicker.grid",
		accessibilityLabel: gridLabel
	}, /* @__PURE__ */ React.createElement(View, {
		style: rowStyle,
		testID: "DatePicker.weekdayHeader"
	}, showWeekNumbers ? /* @__PURE__ */ React.createElement(View, { style: headerCellStyle }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: weekdayOverrides
	}, COPY$7.weekNumber)) : null, weekdayLabels.map((weekday) => /* @__PURE__ */ React.createElement(View, {
		key: weekday.long,
		style: headerCellStyle,
		accessibilityLabel: weekday.long
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: weekdayOverrides
	}, weekday.short)))), weeks.map((week) => {
		const first = week[0];
		const weekNumber = getISOWeek(first.y, first.m, first.d);
		return /* @__PURE__ */ React.createElement(View, {
			key: first.iso,
			style: rowStyle
		}, showWeekNumbers ? /* @__PURE__ */ React.createElement(View, {
			style: headerCellStyle,
			accessible: true,
			accessibilityLabel: `${COPY$7.weekNumber} ${weekNumber}`,
			testID: "DatePicker.weekNumber"
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "xs",
			tone: "muted",
			overrides: { fontSize: overrides?.weekNumberSize }
		}, weekNumber)) : null, week.map((cell) => /* @__PURE__ */ React.createElement(DayButton, {
			key: cell.iso,
			cell,
			label: dayAccessibilityLabel(cell.iso),
			selected: isSelected(cell.iso),
			rangeEnd: isRangeEnd(cell.iso),
			inRange: isInRange(cell.iso),
			today: cell.iso === todayIso,
			disabled: isDisabled || isDayDisabled(cell.iso),
			size: daySize,
			radius: dayRadius,
			hoverColor: dayHoverColor,
			fontSizeOverride: overrides?.dayFontSize,
			disabledOpacity,
			duration: transitionDuration,
			onSelect: handleDaySelect
		})));
	}))))));
}
//#endregion
//#region src/DataGrid.tsx
const COPY$6 = {
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedRows: (count, total) => `${count} of ${total} rows selected`,
	editing: (column) => `Editing ${column}. Enter to save, Escape to cancel.`,
	invalid: (message) => `${message}`,
	rowCount: (count) => new Intl.PluralRules().select(count) === "one" ? `${count} row` : `${count} rows`,
	position: (row, column) => `Row ${row}, ${column}`,
	resize: (column) => `Resize ${column}`,
	loading: "Loading",
	empty: "Nothing to show.",
	scrollHint: "Scroll sideways to see more columns",
	cellLabel: (column, value) => `${column}: ${value}`,
	editHint: "Double tap to edit"
};
const JUSTIFY$1 = {
	start: "flex-start",
	center: "center",
	end: "flex-end"
};
/** Clips content to one point while keeping it in the accessibility tree (hidden caption, the live region when the bar is off). */
const HIDDEN_STYLE$3 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
const HEADER_WEIGHT$1 = "font.weight.semibold";
const HEADER_SIZE$1 = "font.size.sm";
const CAPTION_SIZE$1 = "font.size.md";
const CAPTION_WEIGHT$1 = "font.weight.semibold";
const CAPTION_GAP$1 = "space.2";
const LINE_HEIGHT$1 = "font.lineHeight.tight";
const NUMERIC_FONT$1 = "font.family.mono";
const INSET_ZERO$1 = "space.0";
function tokenOr$2(t, ref, fallback) {
	return ref === void 0 ? fallback : resolveToken(t, ref);
}
function cellText$1(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function cellValue$1(row, key) {
	const raw = row[key];
	if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") return raw;
	return raw === void 0 || raw === null ? void 0 : String(raw);
}
function compareRows$1(a, b, sort) {
	const factor = sort.direction === "ascending" ? 1 : -1;
	const av = a[sort.column];
	const bv = b[sort.column];
	if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
	return cellText$1(a, sort.column).localeCompare(cellText$1(b, sort.column), void 0, { numeric: true }) * factor;
}
function sameCell$1(a, rowId, column) {
	return a !== null && a.rowId === rowId && a.column === column;
}
/** The row hover tint, faded over `transition` (instant under reduced motion). */
function RowTint({ visible, color, duration }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const opacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
	React.useEffect(() => {
		const toValue = visible ? 1 : 0;
		if (reducedMotion) {
			opacity.setValue(toValue);
			return;
		}
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		visible,
		reducedMotion,
		duration,
		opacity,
		t.motionEasingStandard
	]);
	return /* @__PURE__ */ React.createElement(Animated.View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, {
			backgroundColor: color,
			opacity,
			pointerEvents: "none"
		}]
	});
}
/** An inset ring drawn over a cell, so neighbours and the scroll region never clip it. */
function CellRing$1({ color, width }) {
	return /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, {
			borderColor: color,
			borderWidth: width,
			pointerEvents: "none"
		}]
	});
}
/**
* The draggable edge of a resizable header cell, on core `PanResponder`. Native has no hover,
* so it is always visible and hit-slopped out to `size.target.min`. Callbacks go through refs
* so the responder is created once.
*/
function ResizeHandle$1({ width, minWidth, color, handleWidth, hitSlop, onResize, onResizeEnd }) {
	const latest = React.useRef({
		width,
		minWidth,
		onResize,
		onResizeEnd
	});
	latest.current = {
		width,
		minWidth,
		onResize,
		onResizeEnd
	};
	const startWidth = React.useRef(width);
	const responder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderTerminationRequest: () => false,
		onPanResponderGrant: () => {
			startWidth.current = latest.current.width;
		},
		onPanResponderMove: (_event, gesture) => {
			latest.current.onResize(Math.max(latest.current.minWidth, Math.round(startWidth.current + gesture.dx)));
		},
		onPanResponderRelease: () => {
			latest.current.onResizeEnd(latest.current.width);
		},
		onPanResponderTerminate: () => {
			latest.current.onResizeEnd(latest.current.width);
		}
	})).current;
	return /* @__PURE__ */ React.createElement(View, {
		...responder.panHandlers,
		testID: "DataGrid.resizeHandle",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		hitSlop: {
			left: hitSlop,
			right: hitSlop
		},
		style: {
			width: handleWidth,
			alignSelf: "stretch",
			backgroundColor: color
		}
	});
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
* with `role="grid"`, the caption as its `accessibilityLabel`, and a fixed `getItemLayout`
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
* select-all Checkbox that stands in for Ctrl+A; `cell` selects the tapped cell. An editable
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
function DataGrid({ caption, captionLevel = "2", hideCaption = false, columns, data, rowCount, sort, defaultSort, selectable = "none", selected, editable = false, density = "compact", stickyHeader = true, height = "viewport", loading = false, emptyMessage, showStatusBar = true, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onEndReached, onColumnResize, ref }) {
	const { tokens: t } = useTheme();
	const viewport = useWindowDimensions();
	const baseId = React.useId();
	const mode = selectable === "range" ? "row" : selectable;
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const activeSort = sort ?? internalSort;
	const [internalSelected, setInternalSelected] = React.useState([]);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const [activeCell, setActiveCell] = React.useState(null);
	const [focusedCell, setFocusedCell] = React.useState(null);
	const [hoveredRow, setHoveredRow] = React.useState(null);
	const [editing, setEditing] = React.useState(null);
	const [draft, setDraft] = React.useState(void 0);
	const [editError, setEditError] = React.useState(void 0);
	const [widths, setWidths] = React.useState({});
	const [headerScrolled, setHeaderScrolled] = React.useState(false);
	const [scrolledX, setScrolledX] = React.useState(false);
	const [regionWidth, setRegionWidth] = React.useState(null);
	const [listHeight, setListHeight] = React.useState(null);
	const [announcement, setAnnouncement] = React.useState("");
	React.useEffect(() => {
		if (!__DEV__) return;
		if (selectable === "range") console.warn("DataGrid: `selectable=\"range\"` has no touch model on React Native and degrades to `\"row\"`.");
		if (columns.filter((column) => column.isRowHeader === true).length > 1) console.warn("DataGrid: only one column may set `isRowHeader`; the first one is used.");
	}, [selectable, columns]);
	/** Puts a message in the status bar's live region, and speaks it on iOS, which has no live regions. */
	const announce = (message) => {
		setAnnouncement(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	};
	const sortKey = activeSort === void 0 ? "" : `${activeSort.column}:${activeSort.direction}`;
	const lastSortKey = React.useRef(sortKey);
	React.useEffect(() => {
		if (lastSortKey.current === sortKey || activeSort === void 0) {
			lastSortKey.current = sortKey;
			return;
		}
		lastSortKey.current = sortKey;
		const header = columns.find((column) => column.key === activeSort.column)?.header ?? activeSort.column;
		announce(COPY$6.sortedAnnouncement(header, activeSort.direction));
	}, [sortKey]);
	const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
	const columnByKey = React.useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns]);
	const rows = React.useMemo(() => sort === void 0 && rowCount === void 0 && internalSort !== void 0 ? [...data].sort((a, b) => compareRows$1(a, b, internalSort)) : data, [
		data,
		sort,
		rowCount,
		internalSort
	]);
	const total = rowCount ?? data.length;
	const headerWeight = overrides?.headerWeight ?? HEADER_WEIGHT$1;
	const headerSize = overrides?.headerSize ?? HEADER_SIZE$1;
	const headerBorder = tokenOr$2(t, overrides?.headerBorder, t.colorBorderStrong);
	const headerBorderWidth = tokenOr$2(t, overrides?.headerBorderWidth, t.borderWidthThin);
	const headerShadow = tokenOr$2(t, overrides?.headerShadow, t.shadowRaised);
	const gridLine = tokenOr$2(t, overrides?.gridLine, t.colorBorder);
	const gridLineWidth = tokenOr$2(t, overrides?.gridLineWidth, t.borderWidthThin);
	const rowHover = tokenOr$2(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
	const cellPaddingInline = tokenOr$2(t, overrides?.cellPaddingInline, t.space2);
	const columnWidth = tokenOr$2(t, overrides?.columnWidth, t.space20) * 2;
	const pinnedShadow = tokenOr$2(t, overrides?.pinnedShadow, t.shadowRaised);
	const resizeHandle = tokenOr$2(t, overrides?.resizeHandle, t.colorBorderStrong);
	const resizeHandleWidth = tokenOr$2(t, overrides?.resizeHandleWidth, t.space1);
	const resizeStep = tokenOr$2(t, overrides?.resizeStep, t.space4);
	const statusBarPadding = tokenOr$2(t, overrides?.statusBarPadding, t.space2);
	const statusBarGap = tokenOr$2(t, overrides?.statusBarGap, t.space2);
	const fixedHeight = tokenOr$2(t, overrides?.fixedHeight, t.space20);
	const transition = tokenOr$2(t, overrides?.transition, t.motionDurationFast);
	const rowHeight = density === "comfortable" ? t.sizeTargetComfortable : t.sizeTargetMin;
	const selectColumnWidth = t.sizeTargetMin + 2 * cellPaddingInline;
	const bodyText = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight ?? LINE_HEIGHT$1
	};
	const numericText = {
		...bodyText,
		fontFamily: overrides?.numericFont ?? NUMERIC_FONT$1
	};
	const headerText = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight ?? LINE_HEIGHT$1,
		fontSize: headerSize,
		fontWeight: headerWeight
	};
	const statusBarText = {
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight ?? LINE_HEIGHT$1,
		fontSize: overrides?.statusBarSize
	};
	const editorInset = {
		paddingInline: INSET_ZERO$1,
		paddingBlock: INSET_ZERO$1
	};
	const widthFor = (column) => widths[column.key] ?? column.width ?? columnWidth;
	const minWidthFor = (column) => column.minWidth ?? t.sizeTargetMin;
	const handleSortPress = (column) => {
		commitOpenEdit();
		const direction = activeSort?.column === column && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (sort === void 0) setInternalSort({
			column,
			direction
		});
		onSortChange?.(column, direction);
	};
	const commitRows = (next) => {
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
		announce(COPY$6.selectedRows(next.length, total));
	};
	const toggleRow = (id) => {
		commitRows(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
	};
	const loadedIds = rows.map((row) => row.id);
	const allSelected = loadedIds.length > 0 && loadedIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && loadedIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitRows(allSelected ? [] : loadedIds);
	const rowName = (row) => rowHeaderColumn === void 0 ? row.id : cellText$1(row, rowHeaderColumn.key) || row.id;
	const closeEditor = () => {
		setEditing(null);
		setDraft(void 0);
		setEditError(void 0);
	};
	const commitEdit = (row, column, value) => {
		const message = column.validate?.(value, row);
		if (message !== void 0) {
			setEditError(message);
			announce(COPY$6.invalid(message));
			return false;
		}
		const previous = cellValue$1(row, column.key);
		closeEditor();
		if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, value, previous);
		return true;
	};
	/** Commits the open draft editor (text, number, date), if any; true when nothing is left open. */
	function commitOpenEdit() {
		if (editing === null) return true;
		const row = rows.find((candidate) => candidate.id === editing.rowId);
		const column = columnByKey.get(editing.column);
		if (row === void 0 || column === void 0) {
			closeEditor();
			return true;
		}
		return commitEdit(row, column, draft);
	}
	const startEdit = (row, column) => {
		if (sameCell$1(editing, row.id, column.key) || !commitOpenEdit()) return;
		if (onEditStart?.(row.id, column.key) === false) return;
		setEditing({
			rowId: row.id,
			column: column.key
		});
		setDraft(cellValue$1(row, column.key));
		setEditError(void 0);
		announce(COPY$6.editing(column.header));
	};
	const editorFor = (row, column) => {
		const label = column.header;
		const name = `${baseId}-${row.id}-${column.key}`;
		switch (column.editor) {
			case "number": return /* @__PURE__ */ React.createElement(NumberInput, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: typeof draft === "number" ? draft : draft === void 0 || draft === "" ? void 0 : Number(draft),
				overrides: editorInset,
				onChangeText: (value) => setDraft(value)
			});
			case "select": return /* @__PURE__ */ React.createElement(Select, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				open: true,
				options: column.options ?? [],
				value: typeof draft === "string" ? draft : void 0,
				overrides: {
					triggerPaddingInline: INSET_ZERO$1,
					triggerPaddingBlock: INSET_ZERO$1
				},
				onChange: (value) => commitEdit(row, column, Array.isArray(value) ? value[0] : value),
				onOpenChange: (open) => {
					if (!open) closeEditor();
				}
			});
			case "date": return /* @__PURE__ */ React.createElement(DatePicker, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: typeof draft === "string" && draft !== "" ? draft : void 0,
				overrides: editorInset,
				onChange: (value) => setDraft(typeof value === "string" ? value : void 0)
			});
			case "checkbox": return /* @__PURE__ */ React.createElement(Checkbox, {
				label,
				hideLabel: true,
				name,
				checked: draft === true,
				onChange: (checked) => commitEdit(row, column, checked)
			});
			default: return /* @__PURE__ */ React.createElement(Input, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: draft === void 0 ? "" : String(draft),
				overrides: editorInset,
				onChange: (value) => setDraft(value),
				onBlur: () => commitEdit(row, column, draft)
			});
		}
	};
	const selectColumnStyle = {
		width: selectColumnWidth,
		alignItems: "center",
		justifyContent: "center"
	};
	const pinnedCellStyle = (column) => scrolledX && (column === null || column.pinned !== void 0) ? {
		zIndex: 1,
		...pinnedShadow
	} : null;
	const resizeTo = (column, width) => {
		setWidths((previous) => ({
			...previous,
			[column.key]: Math.max(minWidthFor(column), width)
		}));
	};
	const headerRow = /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.header",
		role: "rowgroup",
		style: {
			backgroundColor: t.colorBackgroundSubtle,
			...headerScrolled ? headerShadow : null
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.headerRow",
		role: "row",
		style: {
			flexDirection: "row",
			alignItems: "stretch",
			minHeight: rowHeight,
			borderBottomWidth: headerBorderWidth,
			borderBottomColor: headerBorder
		}
	}, mode === "row" ? /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.selectAllCell",
		role: "columnheader",
		style: [
			selectColumnStyle,
			{
				backgroundColor: t.colorBackgroundSubtle,
				borderEndWidth: gridLineWidth,
				borderEndColor: gridLine
			},
			pinnedCellStyle(null)
		]
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$6.selectAll,
		hideLabel: true,
		name: `${baseId}-all`,
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : null, columns.map((column) => {
		const width = widthFor(column);
		const sorted = activeSort?.column === column.key;
		const resizeActions = column.resizable === true ? [{
			name: "increment",
			label: COPY$6.resize(column.header)
		}, {
			name: "decrement",
			label: COPY$6.resize(column.header)
		}] : void 0;
		const handleAction = (event) => {
			const delta = event.nativeEvent.actionName === "increment" ? resizeStep : event.nativeEvent.actionName === "decrement" ? -resizeStep : 0;
			if (delta === 0) return;
			const next = Math.max(minWidthFor(column), width + delta);
			resizeTo(column, next);
			onColumnResize?.(column.key, next);
		};
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			testID: "DataGrid.columnHeader",
			role: "columnheader",
			accessibilityActions: resizeActions,
			onAccessibilityAction: resizeActions !== void 0 ? handleAction : void 0,
			style: [{
				width,
				flexDirection: "row",
				alignItems: "center",
				justifyContent: JUSTIFY$1[column.align ?? "start"],
				paddingStart: cellPaddingInline,
				paddingEnd: column.resizable === true ? 0 : cellPaddingInline,
				backgroundColor: t.colorBackgroundSubtle,
				borderEndWidth: gridLineWidth,
				borderEndColor: gridLine
			}, pinnedCellStyle(column)]
		}, /* @__PURE__ */ React.createElement(View, { style: {
			flexGrow: 1,
			flexShrink: 1,
			alignItems: JUSTIFY$1[column.align ?? "start"]
		} }, column.sortable === true ? /* @__PURE__ */ React.createElement(View, { testID: "DataGrid.sortButton" }, /* @__PURE__ */ React.createElement(Button, {
			label: column.header,
			accessibleName: sorted && activeSort.direction === "ascending" ? COPY$6.sortDescending(column.header) : COPY$6.sortAscending(column.header),
			variant: "ghost",
			size: "sm",
			trailingIcon: sorted ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorActionGhostForeground
			}) : void 0,
			overrides: {
				fontWeight: headerWeight,
				fontSize: headerSize,
				paddingInline: INSET_ZERO$1
			},
			onPress: () => handleSortPress(column.key)
		})) : /* @__PURE__ */ React.createElement(View, {
			accessible: true,
			accessibilityLabel: column.abbr ?? column.header
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			align: column.align ?? "start",
			overrides: headerText
		}, column.header))), column.resizable === true ? /* @__PURE__ */ React.createElement(ResizeHandle$1, {
			width,
			minWidth: minWidthFor(column),
			color: resizeHandle,
			handleWidth: resizeHandleWidth,
			hitSlop: (t.sizeTargetMin - resizeHandleWidth) / 2,
			onResize: (next) => resizeTo(column, next),
			onResizeEnd: (next) => onColumnResize?.(column.key, next)
		}) : null);
	})));
	const renderRow = ({ item: row }) => {
		const rowSelected = mode === "row" && selectedSet.has(row.id);
		const background = rowSelected ? t.colorBackgroundSubtle : t.colorBackground;
		return /* @__PURE__ */ React.createElement(View, {
			testID: "DataGrid.row",
			role: "row",
			accessibilityState: mode === "row" ? { selected: rowSelected } : void 0,
			style: {
				flexDirection: "row",
				alignItems: "stretch",
				height: rowHeight,
				backgroundColor: background,
				borderBottomWidth: gridLineWidth,
				borderBottomColor: gridLine,
				borderStartWidth: t.borderWidthFocus,
				borderStartColor: rowSelected ? t.colorControlSelectedBackground : background
			}
		}, /* @__PURE__ */ React.createElement(RowTint, {
			visible: hoveredRow === row.id,
			color: rowHover,
			duration: transition
		}), mode === "row" ? /* @__PURE__ */ React.createElement(View, {
			testID: "DataGrid.selectCell",
			role: "cell",
			style: [
				selectColumnStyle,
				{
					backgroundColor: background,
					borderEndWidth: gridLineWidth,
					borderEndColor: gridLine
				},
				pinnedCellStyle(null)
			]
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$6.selectRow(rowName(row)),
			hideLabel: true,
			name: `${baseId}-${row.id}`,
			checked: rowSelected,
			onChange: () => toggleRow(row.id)
		})) : null, columns.map((column) => {
			const key = `${row.id} ${column.key}`;
			const isRowHeader = column === rowHeaderColumn;
			const role = isRowHeader ? "rowheader" : "cell";
			const canEdit = editable && column.editable === true;
			const isEditing = sameCell$1(editing, row.id, column.key);
			const invalid = isEditing && editError !== void 0;
			const cellSelected = mode === "cell" && sameCell$1(activeCell, row.id, column.key);
			const cellBackground = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : cellSelected ? t.colorBackgroundSubtle : "transparent";
			const style = [{
				width: widthFor(column),
				paddingHorizontal: cellPaddingInline,
				justifyContent: "center",
				alignItems: isEditing ? "stretch" : JUSTIFY$1[column.align ?? "start"],
				backgroundColor: cellBackground,
				borderEndWidth: gridLineWidth,
				borderEndColor: gridLine
			}];
			const pinned = pinnedCellStyle(column);
			if (pinned !== null) style.push({
				...pinned,
				backgroundColor: cellBackground === "transparent" ? background : cellBackground
			});
			const ring = invalid ? /* @__PURE__ */ React.createElement(CellRing$1, {
				color: t.colorBorderDanger,
				width: t.borderWidthFocus
			}) : isEditing ? /* @__PURE__ */ React.createElement(CellRing$1, {
				color: t.colorBorderFocus,
				width: t.borderWidthFocus
			}) : focusedCell === key || cellSelected ? /* @__PURE__ */ React.createElement(CellRing$1, {
				color: t.colorBorderFocus,
				width: t.borderWidthFocus
			}) : null;
			if (isEditing) {
				const handleEditorAction = (event) => {
					if (event.nativeEvent.actionName === "activate") commitOpenEdit();
					else if (event.nativeEvent.actionName === "escape") closeEditor();
				};
				return /* @__PURE__ */ React.createElement(View, {
					key: column.key,
					testID: isRowHeader ? "DataGrid.rowHeader" : "DataGrid.cell",
					role,
					accessibilityActions: [{ name: "activate" }, { name: "escape" }],
					onAccessibilityAction: handleEditorAction,
					style
				}, /* @__PURE__ */ React.createElement(View, { testID: "DataGrid.editor" }, editorFor(row, column)), ring);
			}
			const value = cellText$1(row, column.key);
			const numeric = typeof row[column.key] === "number";
			const content = column.render !== void 0 ? column.render(row) : /* @__PURE__ */ React.createElement(Text, {
				size: "sm",
				align: column.align ?? "start",
				tone: loading ? "muted" : "default",
				truncate: true,
				overrides: numeric ? numericText : bodyText
			}, value);
			const interactive = canEdit || mode === "cell" || editing !== null;
			return /* @__PURE__ */ React.createElement(Pressable, {
				key: column.key,
				testID: isRowHeader ? "DataGrid.rowHeader" : "DataGrid.cell",
				role,
				accessibilityLabel: COPY$6.cellLabel(column.header, value),
				accessibilityHint: canEdit ? COPY$6.editHint : void 0,
				accessibilityState: mode === "cell" ? { selected: cellSelected } : void 0,
				onPress: interactive ? () => {
					if (mode === "cell" && !cellSelected) {
						const next = {
							rowId: row.id,
							column: column.key
						};
						setActiveCell(next);
						onSelectionChange?.(next);
					}
					if (canEdit) startEdit(row, column);
					else commitOpenEdit();
				} : void 0,
				onFocus: () => setFocusedCell(key),
				onBlur: () => setFocusedCell((current) => current === key ? null : current),
				onHoverIn: () => setHoveredRow(row.id),
				onHoverOut: () => setHoveredRow((current) => current === row.id ? null : current),
				style
			}, /* @__PURE__ */ React.createElement(View, {
				testID: "DataGrid.cellContent",
				style: { alignItems: JUSTIFY$1[column.align ?? "start"] }
			}, content), ring);
		}));
	};
	const requestedEnd = React.useRef(null);
	React.useEffect(() => {
		requestedEnd.current = null;
	}, [data.length]);
	const pageRows = Math.max(1, Math.ceil((listHeight ?? viewport.height) / rowHeight));
	const handleEndReached = () => {
		if (rowCount === void 0 || data.length >= rowCount) return;
		const end = Math.min(rowCount, data.length + pageRows) - 1;
		if (requestedEnd.current === end) return;
		requestedEnd.current = end;
		onEndReached?.(data.length, end);
	};
	const contentWidth = columns.reduce((sum, column) => sum + widthFor(column), mode === "row" ? selectColumnWidth : 0) + t.borderWidthFocus;
	const overflows = regionWidth !== null && contentWidth > regionWidth;
	const bounded = height !== "content";
	const flexStyle = {
		flexGrow: 1,
		flexShrink: 1
	};
	const emptyState = /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.emptyState",
		style: {
			paddingHorizontal: cellPaddingInline,
			minHeight: rowHeight,
			justifyContent: "center"
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: bodyText
	}, emptyMessage ?? COPY$6.empty));
	const live = loading ? COPY$6.loading : editError !== void 0 ? COPY$6.invalid(editError) : editing !== null ? COPY$6.editing(columnByKey.get(editing.column)?.header ?? editing.column) : announcement;
	const activeIndex = activeCell === null ? -1 : rows.findIndex((row) => row.id === activeCell.rowId);
	const list = /* @__PURE__ */ React.createElement(FlatList, {
		testID: "DataGrid.grid",
		role: "grid",
		accessibilityLabel: caption,
		accessibilityState: { busy: loading },
		data: rows,
		extraData: [
			selectedIds,
			activeSort,
			activeCell,
			focusedCell,
			hoveredRow,
			editing,
			draft,
			editError,
			widths,
			scrolledX,
			density,
			loading
		],
		keyExtractor: (row) => row.id,
		renderItem: renderRow,
		getItemLayout: (_items, index) => ({
			length: rowHeight,
			offset: rowHeight * index,
			index
		}),
		ListHeaderComponent: headerRow,
		ListEmptyComponent: emptyState,
		stickyHeaderIndices: stickyHeader || bounded ? [0] : void 0,
		scrollEnabled: bounded,
		initialNumToRender: bounded ? void 0 : data.length,
		onScroll: (event) => setHeaderScrolled(event.nativeEvent.contentOffset.y > 0),
		scrollEventThrottle: 16,
		onEndReached: rowCount !== void 0 ? handleEndReached : void 0,
		onEndReachedThreshold: 1,
		onLayout: (event) => setListHeight(event.nativeEvent.layout.height),
		style: bounded ? flexStyle : void 0
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "DataGrid",
		style: {
			backgroundColor: t.colorBackground,
			...height === "viewport" ? { height: viewport.height - 2 * t.layoutGapSection } : null
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.caption",
		style: hideCaption ? HIDDEN_STYLE$3 : void 0
	}, /* @__PURE__ */ React.createElement(Heading, {
		level: captionLevel,
		size: "md",
		overrides: {
			fontFamily: overrides?.fontFamily,
			fontSize: overrides?.captionSize ?? CAPTION_SIZE$1,
			fontWeight: overrides?.captionWeight ?? CAPTION_WEIGHT$1,
			marginBlockEnd: overrides?.captionGap ?? CAPTION_GAP$1
		}
	}, caption)), /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.container",
		style: {
			borderStartWidth: gridLineWidth,
			borderTopWidth: gridLineWidth,
			borderColor: gridLine,
			...height === "viewport" ? flexStyle : height === "fixed" ? { height: fixedHeight } : null
		}
	}, /* @__PURE__ */ React.createElement(ScrollView, {
		testID: "DataGrid.scrollRegion",
		horizontal: true,
		accessibilityHint: COPY$6.scrollHint,
		onScroll: (event) => setScrolledX(event.nativeEvent.contentOffset.x > 0),
		scrollEventThrottle: 16,
		onLayout: (event) => setRegionWidth(event.nativeEvent.layout.width),
		contentContainerStyle: {
			minWidth: contentWidth,
			flexGrow: 1
		},
		style: bounded ? flexStyle : void 0
	}, /* @__PURE__ */ React.createElement(View, { style: [{ width: contentWidth }, bounded ? flexStyle : null] }, list))), /* @__PURE__ */ React.createElement(View, {
		testID: "DataGrid.statusBar",
		style: showStatusBar ? {
			flexDirection: "row",
			flexWrap: "wrap",
			alignItems: "center",
			gap: statusBarGap,
			padding: statusBarPadding,
			backgroundColor: t.colorBackgroundSubtle
		} : HIDDEN_STYLE$3
	}, /* @__PURE__ */ React.createElement(View, {
		role: "status",
		accessibilityLiveRegion: "polite"
	}, editError !== void 0 && !loading ? /* @__PURE__ */ React.createElement(View, { style: { backgroundColor: t.colorStatusDangerBackground } }, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: t.colorStatusDangerForeground }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		overrides: statusBarText
	}, live))) : /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: statusBarText
	}, live)), showStatusBar ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: statusBarText
	}, COPY$6.rowCount(total)), mode === "row" && selectedIds.length > 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: statusBarText
	}, COPY$6.selectedRows(selectedIds.length, total)) : null, overflows && !scrolledX ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: statusBarText
	}, COPY$6.scrollHint) : null, activeIndex >= 0 && activeCell !== null ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: statusBarText
	}, COPY$6.position(activeIndex + 1, columnByKey.get(activeCell.column)?.header ?? activeCell.column)) : null) : null));
}
//#endregion
//#region src/TreeGrid.tsx
/** The component's user-facing strings, from the doc's `copy` block. */
const COPY$5 = {
	expand: (rowName) => `Expand ${rowName}`,
	collapse: (rowName) => `Collapse ${rowName}`,
	level: (level) => `Level ${level}`,
	childCount: (count) => new Intl.PluralRules().select(count) === "one" ? `${count} item` : `${count} items`,
	loading: "Loading",
	expandAll: "Expand all",
	collapseAll: "Collapse all",
	empty: "Nothing to show.",
	sortAscending: (column) => `Sort by ${column}, ascending`,
	sortDescending: (column) => `Sort by ${column}, descending`,
	sortedAnnouncement: (column, direction) => `Sorted by ${column}, ${direction}`,
	selectAll: "Select all rows",
	selectRow: (rowName) => `Select ${rowName}`,
	selectedRows: (count, total) => `${count} of ${total} rows selected`,
	editing: (column) => `Editing ${column}. Enter to save, Escape to cancel.`,
	invalid: (message) => `${message}`,
	rowCount: (count) => new Intl.PluralRules().select(count) === "one" ? `${count} row` : `${count} rows`,
	position: (row, column) => `Row ${row}, ${column}`,
	resize: (column) => `Resize ${column}`,
	scrollHint: "Scroll sideways to see more columns",
	/** DataGrid's cell name and edit hint: the column model, the editors and the touch affordances are shared. */
	cellLabel: (column, value) => `${column}: ${value}`,
	editHint: "Double tap to edit"
};
const JUSTIFY = {
	start: "flex-start",
	center: "center",
	end: "flex-end"
};
/** Clips content to one point while keeping it in the accessibility tree (hidden caption, the live region when the bar is off). */
const HIDDEN_STYLE$2 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
const PARENT_WEIGHT = "font.weight.medium";
const HEADER_WEIGHT = "font.weight.semibold";
const HEADER_SIZE = "font.size.sm";
const CAPTION_SIZE = "font.size.md";
const CAPTION_WEIGHT = "font.weight.semibold";
const CAPTION_GAP = "space.2";
const LINE_HEIGHT = "font.lineHeight.tight";
const NUMERIC_FONT = "font.family.mono";
const INSET_ZERO = "space.0";
function tokenOr$1(t, ref, fallback) {
	return ref === void 0 ? fallback : resolveToken(t, ref);
}
function cellText(row, key) {
	const raw = row[key];
	return raw === void 0 || raw === null ? "" : String(raw);
}
function cellValue(row, key) {
	const raw = row[key];
	if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") return raw;
	return raw === void 0 || raw === null ? void 0 : String(raw);
}
function compareRows(a, b, sort) {
	const factor = sort.direction === "ascending" ? 1 : -1;
	const av = a[sort.column];
	const bv = b[sort.column];
	if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
	return cellText(a, sort.column).localeCompare(cellText(b, sort.column), void 0, { numeric: true }) * factor;
}
/** Orders siblings within each level and keeps the hierarchy. */
function sortTree(rows, sort) {
	return [...rows].sort((a, b) => compareRows(a, b, sort)).map((row) => Array.isArray(row.children) ? {
		...row,
		children: sortTree(row.children, sort)
	} : row);
}
function hasChildren$1(row) {
	return row.children === "lazy" || Array.isArray(row.children) && row.children.length > 0;
}
/** The visible rows, in order: a collapsed subtree contributes nothing, so it costs nothing. */
function flattenTree(rows, expanded, level, out = []) {
	for (const row of rows) {
		out.push({
			key: row.id,
			level,
			placeholder: false,
			row
		});
		if (!hasChildren$1(row) || !expanded.has(row.id)) continue;
		if (row.children === "lazy") out.push({
			key: `${row.id}::placeholder`,
			level: level + 1,
			placeholder: true,
			row
		});
		else if (Array.isArray(row.children)) flattenTree(row.children, expanded, level + 1, out);
	}
	return out;
}
/** Every loaded row with a non-empty array of children — what `"*"` expands; never a `"lazy"` row. */
function expandableIds$1(rows, out = []) {
	for (const row of rows) if (Array.isArray(row.children) && row.children.length > 0) {
		out.push(row.id);
		expandableIds$1(row.children, out);
	}
	return out;
}
/** Every loaded row that can open, `"lazy"` rows included — what the expandAll action covers. */
function openableIds(rows, out = []) {
	for (const row of rows) {
		if (hasChildren$1(row)) out.push(row.id);
		if (Array.isArray(row.children)) openableIds(row.children, out);
	}
	return out;
}
/** Every row whose children are still `"lazy"`, at any depth. */
function lazyIds$1(rows, out = []) {
	for (const row of rows) if (row.children === "lazy") out.push(row.id);
	else if (Array.isArray(row.children)) lazyIds$1(row.children, out);
	return out;
}
/** Every loaded row id at any depth, expanded or not — the select-all set and `copy.rowCount`. */
function loadedIds(rows, out = []) {
	for (const row of rows) {
		out.push(row.id);
		if (Array.isArray(row.children)) loadedIds(row.children, out);
	}
	return out;
}
/**
* With `selectChildren`, a row's shown state is derived from its loaded descendants: checked when
* all of them are (even if its own id is absent), indeterminate when some are, otherwise its own
* id decides. A `"lazy"` subtree contributes nothing until it loads.
*/
function derivedCheckState(row, selected) {
	const descendants = Array.isArray(row.children) ? loadedIds(row.children) : [];
	const count = descendants.filter((id) => selected.has(id)).length;
	if (descendants.length > 0 && count === descendants.length) return "checked";
	if (count > 0) return "indeterminate";
	return selected.has(row.id) ? "checked" : "unchecked";
}
function sameCell(a, rowId, column) {
	return a !== null && a.rowId === rowId && a.column === column;
}
/** The expand control's chevron, rotated over `transition` with the standard easing; instant under reduced motion. */
function Chevron$1({ expanded, color, duration }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
	const wasExpanded = React.useRef(expanded);
	React.useEffect(() => {
		const toValue = expanded ? 1 : 0;
		const toggled = wasExpanded.current !== expanded;
		wasExpanded.current = expanded;
		if (reducedMotion || !toggled) {
			rotation.setValue(toValue);
			return;
		}
		const animation = Animated.timing(rotation, {
			toValue,
			duration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, [
		expanded,
		reducedMotion,
		duration,
		rotation,
		t.motionEasingStandard
	]);
	const style = { transform: [{ rotate: rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "90deg"]
	}) }] };
	return /* @__PURE__ */ React.createElement(Animated.View, { style }, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-right",
		size: "sm",
		color
	}));
}
/** An inset ring drawn over a cell, so neighbours and the scroll region never clip it. */
function CellRing({ color, width }) {
	return /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, {
			borderColor: color,
			borderWidth: width,
			pointerEvents: "none"
		}]
	});
}
/**
* The draggable edge of a resizable header cell, on core `PanResponder`. Native has no hover,
* so it is always visible and hit-slopped out to `size.target.min`. Callbacks go through refs
* so the responder is created once.
*/
function ResizeHandle({ width, minWidth, color, handleWidth, hitSlop, onResize, onResizeEnd }) {
	const latest = React.useRef({
		width,
		minWidth,
		onResize,
		onResizeEnd
	});
	latest.current = {
		width,
		minWidth,
		onResize,
		onResizeEnd
	};
	const startWidth = React.useRef(width);
	const responder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderTerminationRequest: () => false,
		onPanResponderGrant: () => {
			startWidth.current = latest.current.width;
		},
		onPanResponderMove: (_event, gesture) => {
			latest.current.onResize(Math.max(latest.current.minWidth, Math.round(startWidth.current + gesture.dx)));
		},
		onPanResponderRelease: () => {
			latest.current.onResizeEnd(latest.current.width);
		},
		onPanResponderTerminate: () => {
			latest.current.onResizeEnd(latest.current.width);
		}
	})).current;
	return /* @__PURE__ */ React.createElement(View, {
		...responder.panHandlers,
		testID: "TreeGrid.resizeHandle",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		hitSlop: {
			left: hitSlop,
			right: hitSlop
		},
		style: {
			width: handleWidth,
			alignSelf: "stretch",
			backgroundColor: color
		}
	});
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
* visible chevron is a ghost, icon-only `Button` at `size.target.min`, hidden from assistive
* technology (the row header's actions are the screen-reader path) and rotated over `transition`.
* The root view carries `expandAll`/`collapseAll` actions over every loaded row — the native
* stand-in for `*`, which core React Native cannot reach, along with Shift+Space and Control+A.
* `indent` is a spacer per level beyond the first, and one guide line per ancestor level runs the
* full row height, centred on that ancestor's chevron. A `"lazy"` row fires `onExpand` every time
* it opens while still lazy and shows one busy placeholder row reading `copy.loading` — a row
* that is navigable but neither selectable nor editable — until `children` arrives. Native has no
* position in set: only the level and the child count are conveyed.
*
* Everything else is DataGrid's model: a sortable header is a `Button` (sorting orders siblings
* within each level and keeps the tree), `selectable="row"` adds `Checkbox` cells and a select-all
* that covers every loaded row at every level, `cell` selects the tapped cell, and an editable
* cell opens `Input`, `NumberInput`, `DatePicker`, `Select` or `Checkbox` after `onEditStart`
* allows it, with `activate` committing and `escape` cancelling. A failing `validate` keeps the
* editor open with the cell ringed in danger and the message in the status bar's live region.
*/
function TreeGrid({ caption, captionLevel = "2", hideCaption = false, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable = "none", selected, defaultSelected, selectChildren = false, editable = false, density = "compact", height = "viewport", loading = false, showStatusBar = true, stickyHeader = true, emptyMessage, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize, ref }) {
	const { tokens: t } = useTheme();
	const viewport = useWindowDimensions();
	const baseId = React.useId();
	const [internalSort, setInternalSort] = React.useState(defaultSort);
	const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded ?? []);
	const [openedByUser, setOpenedByUser] = React.useState(() => /* @__PURE__ */ new Set());
	const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? []);
	const [activeCell, setActiveCell] = React.useState(null);
	const [focusedCell, setFocusedCell] = React.useState(null);
	const [editing, setEditing] = React.useState(null);
	const [draft, setDraft] = React.useState(void 0);
	const [editError, setEditError] = React.useState(void 0);
	const [widths, setWidths] = React.useState({});
	const [headerScrolled, setHeaderScrolled] = React.useState(false);
	const [scrolledX, setScrolledX] = React.useState(false);
	const [regionWidth, setRegionWidth] = React.useState(null);
	const [announcement, setAnnouncement] = React.useState("");
	const columnByKey = React.useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns]);
	const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
	React.useEffect(() => {
		if (!__DEV__) return;
		if (rowHeaderColumn === void 0) console.warn("TreeGrid: one column must set `isRowHeader`; it carries the indent and the expand control.");
		else if (columns[0] !== rowHeaderColumn) console.warn("TreeGrid: the `isRowHeader` column must come first, after the selection column.");
	}, [columns, rowHeaderColumn]);
	/** Puts a message in the status bar's live region, and speaks it on iOS, which has no live regions. */
	const announce = (message) => {
		setAnnouncement(message);
		if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
	};
	const indent = tokenOr$1(t, overrides?.indent, t.space5);
	const expandButtonSize = t.sizeTargetMin;
	const expandGap = tokenOr$1(t, overrides?.expandGap, t.layoutGapTight);
	const guideLine = tokenOr$1(t, overrides?.guideLine, t.colorBorder);
	const guideLineWidth = tokenOr$1(t, overrides?.guideLineWidth, t.borderWidthThin);
	const cellPaddingInline = tokenOr$1(t, overrides?.cellPaddingInline, t.space2);
	const fixedHeight = tokenOr$1(t, overrides?.fixedHeight, t.space20);
	const parentWeight = overrides?.parentWeight ?? PARENT_WEIGHT;
	const transition = tokenOr$1(t, overrides?.transition, t.motionDurationFast);
	const gridLine = t.colorBorder;
	const gridLineWidth = t.borderWidthThin;
	const columnWidth = t.space20 * 2;
	const resizeHandleWidth = t.space1;
	const resizeStep = t.space4;
	const rowHeight = density === "comfortable" ? t.sizeTargetComfortable : t.sizeTargetMin;
	const selectColumnWidth = t.sizeTargetMin + 2 * cellPaddingInline;
	const bodyText = { lineHeight: LINE_HEIGHT };
	const numericText = {
		lineHeight: LINE_HEIGHT,
		fontFamily: NUMERIC_FONT
	};
	const headerText = {
		lineHeight: LINE_HEIGHT,
		fontSize: HEADER_SIZE,
		fontWeight: HEADER_WEIGHT
	};
	const editorInset = {
		paddingInline: INSET_ZERO,
		paddingBlock: INSET_ZERO
	};
	const activeSort = sort ?? internalSort;
	const tree = React.useMemo(() => sort === void 0 && internalSort !== void 0 ? sortTree(data, internalSort) : data, [
		data,
		sort,
		internalSort
	]);
	const sortKey = activeSort === void 0 ? "" : `${activeSort.column}:${activeSort.direction}`;
	const lastSortKey = React.useRef(sortKey);
	React.useEffect(() => {
		if (lastSortKey.current === sortKey || activeSort === void 0) {
			lastSortKey.current = sortKey;
			return;
		}
		lastSortKey.current = sortKey;
		const header = columnByKey.get(activeSort.column)?.header ?? activeSort.column;
		announce(COPY$5.sortedAnnouncement(header, activeSort.direction));
	}, [sortKey]);
	const handleSortPress = (column) => {
		commitOpenEdit();
		const direction = activeSort?.column === column.key && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (sort === void 0) setInternalSort({
			column: column.key,
			direction
		});
		onSortChange?.(column.key, direction);
	};
	const lazySet = React.useMemo(() => new Set(lazyIds$1(tree)), [tree]);
	const expandedIds = expanded ?? internalExpanded;
	/** `"*"` resolved against the tree as it stands, so rows loaded later open too. */
	const resolvedExpanded = React.useMemo(() => expandedIds.includes("*") ? Array.from(/* @__PURE__ */ new Set([...expandedIds.filter((id) => id !== "*"), ...expandableIds$1(tree)])) : expandedIds, [expandedIds, tree]);
	/** What is actually open: a lazy row listed by the caller stays shut until the user opens it, so `onExpand` follows a user act. */
	const expandedSet = React.useMemo(() => new Set(resolvedExpanded.filter((id) => !lazySet.has(id) || openedByUser.has(id))), [
		resolvedExpanded,
		lazySet,
		openedByUser
	]);
	const commitExpanded = (next) => {
		if (expanded === void 0) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (row) => {
		if (expandedSet.has(row.id)) {
			setOpenedByUser((previous) => {
				const next = new Set(previous);
				next.delete(row.id);
				return next;
			});
			commitExpanded(resolvedExpanded.filter((id) => id !== row.id));
			return;
		}
		if (row.children === "lazy") onExpand?.(row.id);
		setOpenedByUser((previous) => new Set(previous).add(row.id));
		commitExpanded(resolvedExpanded.includes(row.id) ? resolvedExpanded : [...resolvedExpanded, row.id]);
	};
	const rows = React.useMemo(() => flattenTree(tree, expandedSet, 1), [tree, expandedSet]);
	const allIds = React.useMemo(() => loadedIds(tree), [tree]);
	const total = allIds.length;
	/** The root's stand-in for `*`: every loaded row that can open, one `onExpand` per lazy row, then one `onExpandChange`. */
	const handleRootAction = (event) => {
		const action = event.nativeEvent.actionName;
		if (action === "expandAll") {
			const openable = openableIds(tree);
			const opening = openable.filter((id) => !expandedSet.has(id));
			if (opening.length === 0) return;
			opening.filter((id) => lazySet.has(id)).forEach((id) => onExpand?.(id));
			setOpenedByUser((previous) => {
				const next = new Set(previous);
				opening.forEach((id) => next.add(id));
				return next;
			});
			commitExpanded(Array.from(/* @__PURE__ */ new Set([...resolvedExpanded, ...openable])));
		} else if (action === "collapseAll") {
			if (resolvedExpanded.length === 0) return;
			setOpenedByUser(/* @__PURE__ */ new Set());
			commitExpanded([]);
		}
	};
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const commitRows = (next) => {
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
		announce(COPY$5.selectedRows(next.length, total));
	};
	const checkStateOf = (row) => selectChildren ? derivedCheckState(row, selectedSet) : selectedSet.has(row.id) ? "checked" : "unchecked";
	/** A row's own toggle: with `selectChildren` it carries its loaded descendants; a row shown checked clears, any other state sets. */
	const toggleRow = (row) => {
		const ids = selectChildren && Array.isArray(row.children) ? [row.id, ...loadedIds(row.children)] : [row.id];
		const clear = checkStateOf(row) === "checked";
		const next = new Set(selectedSet);
		ids.forEach((id) => clear ? next.delete(id) : next.add(id));
		commitRows(Array.from(next));
	};
	const allSelected = total > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitRows(allSelected ? [] : allIds);
	const selectCell = (rowId, column) => {
		const next = {
			rowId,
			column
		};
		setActiveCell(next);
		onSelectionChange?.(next);
	};
	const rowName = (row) => rowHeaderColumn === void 0 ? row.id : cellText(row, rowHeaderColumn.key) || row.id;
	const closeEditor = () => {
		setEditing(null);
		setDraft(void 0);
		setEditError(void 0);
	};
	const commitEdit = (row, column, value) => {
		const message = column.validate?.(value, row);
		if (message !== void 0) {
			setEditError(message);
			announce(COPY$5.invalid(message));
			return false;
		}
		const previous = cellValue(row, column.key);
		closeEditor();
		if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, value, previous);
		return true;
	};
	/** Commits the open draft editor (text, number, date), if any; true when nothing is left open. */
	function commitOpenEdit() {
		if (editing === null) return true;
		const row = rows.find((flat) => !flat.placeholder && flat.row.id === editing.rowId)?.row;
		const column = columnByKey.get(editing.column);
		if (row === void 0 || column === void 0) {
			closeEditor();
			return true;
		}
		return commitEdit(row, column, draft);
	}
	const canEdit = (column) => editable && column.editable === true;
	const startEdit = (row, column) => {
		if (sameCell(editing, row.id, column.key) || !commitOpenEdit()) return;
		if (onEditStart?.(row.id, column.key) === false) return;
		setEditing({
			rowId: row.id,
			column: column.key
		});
		setDraft(cellValue(row, column.key));
		setEditError(void 0);
		announce(COPY$5.editing(column.header));
	};
	const editorFor = (row, column) => {
		const label = column.header;
		const name = `${baseId}-${row.id}-${column.key}`;
		switch (column.editor) {
			case "number": return /* @__PURE__ */ React.createElement(NumberInput, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: typeof draft === "number" ? draft : draft === void 0 || draft === "" ? void 0 : Number(draft),
				overrides: editorInset,
				onChangeText: (value) => setDraft(value)
			});
			case "select": return /* @__PURE__ */ React.createElement(Select, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				open: true,
				options: column.options ?? [],
				value: typeof draft === "string" ? draft : void 0,
				overrides: {
					triggerPaddingInline: INSET_ZERO,
					triggerPaddingBlock: INSET_ZERO
				},
				onChange: (value) => commitEdit(row, column, Array.isArray(value) ? value[0] : value),
				onOpenChange: (open) => {
					if (!open) closeEditor();
				}
			});
			case "date": return /* @__PURE__ */ React.createElement(DatePicker, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: typeof draft === "string" && draft !== "" ? draft : void 0,
				overrides: editorInset,
				onChange: (value) => setDraft(typeof value === "string" ? value : void 0)
			});
			case "checkbox": return /* @__PURE__ */ React.createElement(Checkbox, {
				label,
				hideLabel: true,
				name,
				checked: draft === true,
				onChange: (checked) => commitEdit(row, column, checked)
			});
			default: return /* @__PURE__ */ React.createElement(Input, {
				label,
				hideLabel: true,
				name,
				size: "sm",
				value: draft === void 0 ? "" : String(draft),
				overrides: editorInset,
				onChange: (value) => setDraft(value),
				onBlur: () => commitEdit(row, column, draft)
			});
		}
	};
	const widthFor = (column) => widths[column.key] ?? column.width ?? columnWidth;
	const minWidthFor = (column) => column.minWidth ?? t.sizeTargetMin;
	const resizeTo = (column, width) => {
		setWidths((previous) => ({
			...previous,
			[column.key]: Math.max(minWidthFor(column), width)
		}));
	};
	const selectColumnStyle = {
		width: selectColumnWidth,
		alignItems: "center",
		justifyContent: "center"
	};
	const pinnedCellStyle = (column) => scrolledX && (column === null || column.pinned !== void 0) ? {
		zIndex: 1,
		...t.shadowRaised
	} : null;
	const cellFrame = (column) => ({
		width: widthFor(column),
		justifyContent: "center",
		paddingHorizontal: cellPaddingInline,
		borderEndWidth: gridLineWidth,
		borderEndColor: gridLine
	});
	const headerRow = /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.header",
		role: "rowgroup",
		style: {
			backgroundColor: t.colorBackgroundSubtle,
			...headerScrolled ? t.shadowRaised : null
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.headerRow",
		role: "row",
		style: {
			flexDirection: "row",
			alignItems: "stretch",
			minHeight: rowHeight,
			borderBottomWidth: t.borderWidthThin,
			borderBottomColor: t.colorBorderStrong
		}
	}, selectable === "row" ? /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.selectAllCell",
		role: "columnheader",
		style: [
			selectColumnStyle,
			{
				backgroundColor: t.colorBackgroundSubtle,
				borderEndWidth: gridLineWidth,
				borderEndColor: gridLine
			},
			pinnedCellStyle(null)
		]
	}, /* @__PURE__ */ React.createElement(Checkbox, {
		label: COPY$5.selectAll,
		hideLabel: true,
		name: `${baseId}-all`,
		checked: allSelected,
		indeterminate: someSelected,
		onChange: toggleAll
	})) : null, columns.map((column) => {
		const width = widthFor(column);
		const sorted = activeSort?.column === column.key;
		const resizeActions = column.resizable === true ? [{
			name: "increment",
			label: COPY$5.resize(column.header)
		}, {
			name: "decrement",
			label: COPY$5.resize(column.header)
		}] : void 0;
		const handleAction = (event) => {
			const delta = event.nativeEvent.actionName === "increment" ? resizeStep : event.nativeEvent.actionName === "decrement" ? -resizeStep : 0;
			if (delta === 0) return;
			const next = Math.max(minWidthFor(column), width + delta);
			resizeTo(column, next);
			onColumnResize?.(column.key, next);
		};
		return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			testID: "TreeGrid.columnHeader",
			role: "columnheader",
			accessibilityActions: resizeActions,
			onAccessibilityAction: resizeActions !== void 0 ? handleAction : void 0,
			style: [{
				width,
				flexDirection: "row",
				alignItems: "center",
				justifyContent: JUSTIFY[column.align ?? "start"],
				paddingStart: cellPaddingInline,
				paddingEnd: column.resizable === true ? 0 : cellPaddingInline,
				backgroundColor: t.colorBackgroundSubtle,
				borderEndWidth: gridLineWidth,
				borderEndColor: gridLine
			}, pinnedCellStyle(column)]
		}, /* @__PURE__ */ React.createElement(View, { style: {
			flexGrow: 1,
			flexShrink: 1,
			alignItems: JUSTIFY[column.align ?? "start"]
		} }, column.sortable === true ? /* @__PURE__ */ React.createElement(View, { testID: "TreeGrid.sortButton" }, /* @__PURE__ */ React.createElement(Button, {
			label: column.header,
			accessibleName: sorted && activeSort.direction === "ascending" ? COPY$5.sortDescending(column.header) : COPY$5.sortAscending(column.header),
			variant: "ghost",
			size: "sm",
			trailingIcon: sorted ? /* @__PURE__ */ React.createElement(Icon, {
				name: activeSort.direction === "ascending" ? "chevron-up" : "chevron-down",
				inline: true,
				color: t.colorActionGhostForeground
			}) : void 0,
			overrides: {
				fontWeight: HEADER_WEIGHT,
				fontSize: HEADER_SIZE,
				paddingInline: INSET_ZERO
			},
			onPress: () => handleSortPress(column)
		})) : /* @__PURE__ */ React.createElement(View, {
			accessible: true,
			accessibilityLabel: column.abbr ?? column.header
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			weight: "semibold",
			align: column.align ?? "start",
			overrides: headerText
		}, column.header))), column.resizable === true ? /* @__PURE__ */ React.createElement(ResizeHandle, {
			width,
			minWidth: minWidthFor(column),
			color: t.colorBorderStrong,
			handleWidth: resizeHandleWidth,
			hitSlop: (t.sizeTargetMin - resizeHandleWidth) / 2,
			onResize: (next) => resizeTo(column, next),
			onResizeEnd: (next) => onColumnResize?.(column.key, next)
		}) : null);
	})));
	/** One full-height line per ancestor level, centred on that ancestor's expand control. Decorative: the level is announced. */
	const guideLines = (level) => level > 1 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, { pointerEvents: "none" }]
	}, Array.from({ length: level - 1 }, (_unused, ancestor) => /* @__PURE__ */ React.createElement(View, {
		key: ancestor,
		style: {
			position: "absolute",
			top: 0,
			bottom: 0,
			start: cellPaddingInline + ancestor * indent + (expandButtonSize - guideLineWidth) / 2,
			width: guideLineWidth,
			backgroundColor: guideLine
		}
	}))) : null;
	const cellValueNode = (row, column, weight) => {
		if (column.render !== void 0) return column.render(row);
		const numeric = typeof row[column.key] === "number";
		return /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			align: column.align ?? "start",
			tone: loading ? "muted" : "default",
			truncate: true,
			overrides: weight === void 0 ? numeric ? numericText : bodyText : {
				...numeric ? numericText : bodyText,
				fontWeight: weight
			}
		}, cellText(row, column.key));
	};
	const editorActions = (row, column) => (event) => {
		if (event.nativeEvent.actionName === "activate") commitEdit(row, column, draft);
		else if (event.nativeEvent.actionName === "escape") closeEditor();
	};
	const renderDataCell = (row, column) => {
		const key = `${row.id} ${column.key}`;
		const isEditing = sameCell(editing, row.id, column.key);
		const invalid = isEditing && editError !== void 0;
		const cellSelected = selectable === "cell" && sameCell(activeCell, row.id, column.key);
		const background = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : cellSelected ? t.colorBackgroundSubtle : "transparent";
		const style = [cellFrame(column), {
			alignItems: isEditing ? "stretch" : JUSTIFY[column.align ?? "start"],
			backgroundColor: background
		}];
		const pinned = pinnedCellStyle(column);
		if (pinned !== null) style.push({
			...pinned,
			backgroundColor: background === "transparent" ? t.colorBackground : background
		});
		const ring = invalid ? /* @__PURE__ */ React.createElement(CellRing, {
			color: t.colorBorderDanger,
			width: t.borderWidthFocus
		}) : isEditing || focusedCell === key || cellSelected ? /* @__PURE__ */ React.createElement(CellRing, {
			color: t.colorBorderFocus,
			width: t.borderWidthFocus
		}) : null;
		if (isEditing) return /* @__PURE__ */ React.createElement(View, {
			key: column.key,
			testID: "TreeGrid.cell",
			role: "cell",
			accessibilityActions: [{ name: "activate" }, { name: "escape" }],
			onAccessibilityAction: editorActions(row, column),
			style
		}, /* @__PURE__ */ React.createElement(View, { testID: "TreeGrid.editor" }, editorFor(row, column)), ring);
		const editableHere = canEdit(column);
		const interactive = editableHere || selectable === "cell" || editing !== null;
		return /* @__PURE__ */ React.createElement(Pressable, {
			key: column.key,
			testID: "TreeGrid.cell",
			role: "cell",
			accessibilityLabel: COPY$5.cellLabel(column.header, cellText(row, column.key)),
			accessibilityHint: editableHere ? COPY$5.editHint : void 0,
			accessibilityState: selectable === "cell" ? { selected: cellSelected } : void 0,
			onPress: interactive ? () => {
				if (selectable === "cell" && !cellSelected) selectCell(row.id, column.key);
				if (editableHere) startEdit(row, column);
				else commitOpenEdit();
			} : void 0,
			onFocus: () => setFocusedCell(key),
			onBlur: () => setFocusedCell((current) => current === key ? null : current),
			style
		}, /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.cellContent",
			style: { alignItems: JUSTIFY[column.align ?? "start"] }
		}, cellValueNode(row, column)), ring);
	};
	const renderRowHeader = (flat, column) => {
		const { row, level } = flat;
		const name = rowName(row);
		const parent = hasChildren$1(row);
		const isExpanded = parent && expandedSet.has(row.id);
		const key = `${row.id} ${column.key}`;
		const isEditing = sameCell(editing, row.id, column.key);
		const invalid = isEditing && editError !== void 0;
		const cellSelected = selectable === "cell" && sameCell(activeCell, row.id, column.key);
		const editableHere = canEdit(column);
		const childCount = Array.isArray(row.children) ? row.children.length : 0;
		const label = [
			name,
			COPY$5.level(level),
			...childCount > 0 ? [COPY$5.childCount(childCount)] : []
		].join(", ");
		const expandActions = parent ? [{
			name: "expand",
			label: COPY$5.expand(name)
		}, {
			name: "collapse",
			label: COPY$5.collapse(name)
		}] : void 0;
		const handleAction = (event) => {
			const action = event.nativeEvent.actionName;
			if (action === "expand" && !isExpanded || action === "collapse" && isExpanded) toggleExpand(row);
		};
		/** Pressing a parent toggles it; a leaf takes DataGrid's order — edit if editable, else select the cell. */
		const activate = () => {
			if (parent) {
				commitOpenEdit();
				toggleExpand(row);
				return;
			}
			if (selectable === "cell" && !cellSelected) selectCell(row.id, column.key);
			if (editableHere) startEdit(row, column);
			else commitOpenEdit();
		};
		const background = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : cellSelected ? t.colorBackgroundSubtle : "transparent";
		const style = [cellFrame(column), {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: background
		}];
		const pinned = pinnedCellStyle(column);
		if (pinned !== null) style.push({
			...pinned,
			backgroundColor: background === "transparent" ? t.colorBackground : background
		});
		const ring = invalid ? /* @__PURE__ */ React.createElement(CellRing, {
			color: t.colorBorderDanger,
			width: t.borderWidthFocus
		}) : isEditing || focusedCell === key || cellSelected ? /* @__PURE__ */ React.createElement(CellRing, {
			color: t.colorBorderFocus,
			width: t.borderWidthFocus
		}) : null;
		const state = parent ? {
			expanded: isExpanded,
			...selectable === "cell" ? { selected: cellSelected } : null
		} : selectable === "cell" ? { selected: cellSelected } : void 0;
		return /* @__PURE__ */ React.createElement(Pressable, {
			key: column.key,
			testID: "TreeGrid.rowHeader",
			role: "rowheader",
			accessibilityLabel: label,
			accessibilityHint: editableHere ? COPY$5.editHint : void 0,
			accessibilityState: state,
			accessibilityActions: expandActions,
			onAccessibilityAction: expandActions !== void 0 ? handleAction : void 0,
			onPress: activate,
			onLongPress: parent && editableHere ? () => startEdit(row, column) : void 0,
			onFocus: () => setFocusedCell(key),
			onBlur: () => setFocusedCell((current) => current === key ? null : current),
			style
		}, guideLines(level), level > 1 ? /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.indent",
			style: { width: (level - 1) * indent }
		}) : null, /* @__PURE__ */ React.createElement(View, { style: {
			flexGrow: 1,
			flexShrink: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: expandGap
		} }, /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.expandButton",
			accessibilityElementsHidden: true,
			importantForAccessibility: "no-hide-descendants",
			style: {
				width: expandButtonSize,
				minHeight: t.sizeTargetMin,
				alignItems: "center",
				justifyContent: "center"
			}
		}, parent ? /* @__PURE__ */ React.createElement(Button, {
			label: isExpanded ? COPY$5.collapse(name) : COPY$5.expand(name),
			variant: "ghost",
			size: "sm",
			iconOnly: true,
			expanded: isExpanded,
			leadingIcon: /* @__PURE__ */ React.createElement(Chevron$1, {
				expanded: isExpanded,
				color: t.colorActionGhostForeground,
				duration: transition
			}),
			overrides: {
				paddingInline: INSET_ZERO,
				paddingBlock: INSET_ZERO
			},
			onPress: () => toggleExpand(row)
		}) : null), /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.cellContent",
			style: {
				flexGrow: 1,
				flexShrink: 1,
				alignItems: JUSTIFY[column.align ?? "start"]
			}
		}, isEditing ? /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.editor",
			style: { alignSelf: "stretch" }
		}, editorFor(row, column)) : cellValueNode(row, column, parent ? parentWeight : void 0))), ring);
	};
	/** A `"lazy"` row's child while its children load: navigable, one level deeper, neither selectable nor editable. */
	const renderPlaceholder = (flat) => /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.row",
		role: "row",
		accessibilityState: { busy: true },
		style: {
			flexDirection: "row",
			alignItems: "stretch",
			height: rowHeight,
			backgroundColor: t.colorBackground,
			borderBottomWidth: gridLineWidth,
			borderBottomColor: gridLine
		}
	}, selectable === "row" ? /* @__PURE__ */ React.createElement(View, { style: [selectColumnStyle, {
		borderEndWidth: gridLineWidth,
		borderEndColor: gridLine
	}] }) : null, columns.map((column) => column === rowHeaderColumn ? /* @__PURE__ */ React.createElement(View, {
		key: column.key,
		testID: "TreeGrid.rowHeader",
		role: "rowheader",
		accessibilityLabel: [COPY$5.loading, COPY$5.level(flat.level)].join(", "),
		style: [cellFrame(column), {
			flexDirection: "row",
			alignItems: "center"
		}]
	}, guideLines(flat.level), flat.level > 1 ? /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.indent",
		style: { width: (flat.level - 1) * indent }
	}) : null, /* @__PURE__ */ React.createElement(View, { style: {
		flexGrow: 1,
		flexShrink: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: expandGap
	} }, /* @__PURE__ */ React.createElement(View, { style: { width: expandButtonSize } }), /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.cellContent",
		style: {
			flexGrow: 1,
			flexShrink: 1
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: bodyText
	}, COPY$5.loading)))) : /* @__PURE__ */ React.createElement(View, {
		key: column.key,
		testID: "TreeGrid.cell",
		role: "cell",
		style: cellFrame(column)
	})));
	const renderRow = ({ item }) => {
		if (item.placeholder) return renderPlaceholder(item);
		const { row } = item;
		const checkState = checkStateOf(row);
		const rowSelected = selectable === "row" && checkState === "checked";
		const background = rowSelected ? t.colorBackgroundSubtle : t.colorBackground;
		const busy = row.children === "lazy" && expandedSet.has(row.id);
		return /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.row",
			role: "row",
			accessibilityState: selectable === "row" ? {
				selected: rowSelected,
				busy
			} : busy ? { busy } : void 0,
			style: {
				flexDirection: "row",
				alignItems: "stretch",
				height: rowHeight,
				backgroundColor: background,
				borderBottomWidth: gridLineWidth,
				borderBottomColor: gridLine,
				borderStartWidth: t.borderWidthFocus,
				borderStartColor: rowSelected ? t.colorControlSelectedBackground : background
			}
		}, selectable === "row" ? /* @__PURE__ */ React.createElement(View, {
			testID: "TreeGrid.selectCell",
			role: "cell",
			style: [
				selectColumnStyle,
				{
					backgroundColor: background,
					borderEndWidth: gridLineWidth,
					borderEndColor: gridLine
				},
				pinnedCellStyle(null)
			]
		}, /* @__PURE__ */ React.createElement(Checkbox, {
			label: COPY$5.selectRow(rowName(row)),
			hideLabel: true,
			name: `${baseId}-${row.id}`,
			checked: checkState === "checked",
			indeterminate: checkState === "indeterminate",
			onChange: () => toggleRow(row)
		})) : null, columns.map((column) => column === rowHeaderColumn ? renderRowHeader(item, column) : renderDataCell(row, column)));
	};
	const contentWidth = columns.reduce((sum, column) => sum + widthFor(column), selectable === "row" ? selectColumnWidth : 0) + t.borderWidthFocus;
	const overflows = regionWidth !== null && contentWidth > regionWidth;
	const bounded = height !== "content";
	const flexStyle = {
		flexGrow: 1,
		flexShrink: 1
	};
	const emptyState = /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.emptyState",
		style: {
			paddingHorizontal: cellPaddingInline,
			minHeight: rowHeight,
			justifyContent: "center"
		}
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: bodyText
	}, emptyMessage ?? COPY$5.empty));
	const live = loading ? COPY$5.loading : editError !== void 0 ? COPY$5.invalid(editError) : editing !== null ? COPY$5.editing(columnByKey.get(editing.column)?.header ?? editing.column) : announcement;
	const activeIndex = activeCell === null ? -1 : rows.findIndex((flat) => !flat.placeholder && flat.row.id === activeCell.rowId);
	const list = /* @__PURE__ */ React.createElement(FlatList, {
		testID: "TreeGrid.grid",
		role: "grid",
		accessibilityLabel: caption,
		accessibilityState: { busy: loading },
		data: rows,
		extraData: [
			selectedIds,
			resolvedExpanded,
			openedByUser,
			activeSort,
			activeCell,
			focusedCell,
			editing,
			draft,
			editError,
			widths,
			scrolledX,
			density,
			loading
		],
		keyExtractor: (flat) => flat.key,
		renderItem: renderRow,
		getItemLayout: (_items, index) => ({
			length: rowHeight,
			offset: rowHeight * index,
			index
		}),
		ListHeaderComponent: headerRow,
		ListEmptyComponent: emptyState,
		stickyHeaderIndices: stickyHeader || bounded ? [0] : void 0,
		scrollEnabled: bounded,
		initialNumToRender: bounded ? void 0 : rows.length,
		onScroll: (event) => setHeaderScrolled(event.nativeEvent.contentOffset.y > 0),
		scrollEventThrottle: 16,
		style: bounded ? flexStyle : void 0
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "TreeGrid",
		accessibilityActions: [{
			name: "expandAll",
			label: COPY$5.expandAll
		}, {
			name: "collapseAll",
			label: COPY$5.collapseAll
		}],
		onAccessibilityAction: handleRootAction,
		style: {
			backgroundColor: t.colorBackground,
			...height === "viewport" ? { height: viewport.height - 2 * t.layoutGapSection } : null
		}
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.caption",
		style: hideCaption ? HIDDEN_STYLE$2 : void 0
	}, /* @__PURE__ */ React.createElement(Heading, {
		level: captionLevel,
		size: "md",
		overrides: {
			fontSize: CAPTION_SIZE,
			fontWeight: CAPTION_WEIGHT,
			marginBlockEnd: CAPTION_GAP
		}
	}, caption)), /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.container",
		style: {
			borderStartWidth: gridLineWidth,
			borderTopWidth: gridLineWidth,
			borderColor: gridLine,
			...height === "viewport" ? flexStyle : height === "fixed" ? { height: fixedHeight } : null
		}
	}, /* @__PURE__ */ React.createElement(ScrollView, {
		testID: "TreeGrid.scrollRegion",
		horizontal: true,
		accessibilityHint: COPY$5.scrollHint,
		onScroll: (event) => setScrolledX(event.nativeEvent.contentOffset.x > 0),
		scrollEventThrottle: 16,
		onLayout: (event) => setRegionWidth(event.nativeEvent.layout.width),
		contentContainerStyle: {
			minWidth: contentWidth,
			flexGrow: 1
		},
		style: bounded ? flexStyle : void 0
	}, /* @__PURE__ */ React.createElement(View, { style: [{ width: contentWidth }, bounded ? flexStyle : null] }, list))), /* @__PURE__ */ React.createElement(View, {
		testID: "TreeGrid.statusBar",
		style: showStatusBar ? {
			flexDirection: "row",
			flexWrap: "wrap",
			alignItems: "center",
			gap: t.space2,
			padding: t.space2,
			backgroundColor: t.colorBackgroundSubtle
		} : HIDDEN_STYLE$2
	}, /* @__PURE__ */ React.createElement(View, {
		role: "status",
		accessibilityLiveRegion: "polite"
	}, editError !== void 0 && !loading ? /* @__PURE__ */ React.createElement(View, { style: { backgroundColor: t.colorStatusDangerBackground } }, /* @__PURE__ */ React.createElement(TextForegroundContext.Provider, { value: t.colorStatusDangerForeground }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		overrides: bodyText
	}, live))) : /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: bodyText
	}, live)), showStatusBar ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: bodyText
	}, COPY$5.rowCount(total)), selectable === "row" && selectedIds.length > 0 ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: bodyText
	}, COPY$5.selectedRows(selectedIds.length, total)) : null, overflows && !scrolledX ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: bodyText
	}, COPY$5.scrollHint) : null, activeIndex >= 0 && activeCell !== null ? /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: bodyText
	}, COPY$5.position(activeIndex + 1, columnByKey.get(activeCell.column)?.header ?? activeCell.column)) : null) : null));
}
//#endregion
//#region src/Tree.tsx
const COPY$4 = {
	expand: (label) => `Expand ${label}`,
	collapse: (label) => `Collapse ${label}`,
	selectedCount: (count) => `${count} selected`,
	loading: "Loading",
	empty: "Nothing here."
};
const LABEL_SELECTED_WEIGHT = "font.weight.medium";
const HEADING_SIZE = "font.size.md";
const BADGE_SIZE = "font.size.xs";
/** Clips content to one point while keeping it in the accessibility tree (the Android live region). */
const HIDDEN_STYLE$1 = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
function tokenOr(t, ref, fallback) {
	return ref === void 0 ? fallback : resolveToken(t, ref);
}
function hasChildren(node) {
	return node.children === "lazy" || Array.isArray(node.children) && node.children.length > 0;
}
function flattenNodes(nodes, expanded, level, out = []) {
	for (const node of nodes) {
		out.push({
			key: node.id,
			level,
			placeholder: false,
			node
		});
		if (hasChildren(node) && expanded.has(node.id)) {
			if (node.children === "lazy") out.push({
				key: `${node.id}::loading`,
				level: level + 1,
				placeholder: true,
				node
			});
			else if (Array.isArray(node.children)) flattenNodes(node.children, expanded, level + 1, out);
		}
	}
	return out;
}
/** Every loaded parent, at any depth — what `["*"]` expands; never a `"lazy"` node. */
function expandableIds(nodes, out = []) {
	for (const node of nodes) if (Array.isArray(node.children) && node.children.length > 0) {
		out.push(node.id);
		expandableIds(node.children, out);
	}
	return out;
}
/** Every node whose children are still `"lazy"`, at any depth: those open on a user act only, so `onExpand` never fires for a caller's id. */
function lazyIds(nodes, out = []) {
	for (const node of nodes) if (node.children === "lazy") out.push(node.id);
	else if (Array.isArray(node.children)) lazyIds(node.children, out);
	return out;
}
/** Every loaded, enabled descendant id — the reach of a `selectChildren` cascade. A `"lazy"` subtree contributes nothing until it loads. */
function descendantIds(node, out = []) {
	if (Array.isArray(node.children)) for (const child of node.children) {
		if (child.disabled !== true) out.push(child.id);
		descendantIds(child, out);
	}
	return out;
}
function indexNodes(nodes, parent, out) {
	for (const node of nodes) {
		out.set(node.id, {
			node,
			parent,
			order: out.size
		});
		if (Array.isArray(node.children)) indexNodes(node.children, node.id, out);
	}
	return out;
}
/** The expand control's chevron, rotated over `transition`; instant under reduced motion. */
function Chevron({ expanded, color, duration }) {
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
			duration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		expanded,
		reducedMotion,
		duration,
		rotation,
		t.motionEasingStandard
	]);
	const style = { transform: [{ rotate: rotation.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "90deg"]
	}) }] };
	return /* @__PURE__ */ React.createElement(Animated.View, { style }, /* @__PURE__ */ React.createElement(Icon, {
		name: "chevron-right",
		size: "sm",
		color
	}));
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
function Tree({ label, showLabel = false, headingLevel = "2", nodes, expanded, defaultExpanded, selectable = "single", selected, defaultSelected, selectChildren = false, selectOnFocus = false, showGuides = true, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, ref }) {
	const { tokens: t } = useTheme();
	const indent = tokenOr(t, overrides?.indent, t.space5);
	const rowHeight = t.sizeTargetMin;
	const rowPaddingInline = tokenOr(t, overrides?.rowPaddingInline, t.space2);
	const rowRadius = tokenOr(t, overrides?.rowRadius, t.radiusSm);
	const rowGap = tokenOr(t, overrides?.rowGap, t.layoutGapTight);
	const rowHover = tokenOr(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
	const rowSelected = t.colorBackgroundStrong;
	const rowSelectedBorder = t.colorControlSelectedBackground;
	const rowSelectedBorderWidth = t.borderWidthFocus;
	const expandButtonSize = t.sizeTargetMin;
	const guideLine = tokenOr(t, overrides?.guideLine, t.colorBorder);
	const guideLineWidth = tokenOr(t, overrides?.guideLineWidth, t.borderWidthThin);
	const checkboxGap = tokenOr(t, overrides?.checkboxGap, t.layoutGapTight);
	const checkboxSize = tokenOr(t, overrides?.checkboxSize, t.space4);
	const checkboxBorderWidth = tokenOr(t, overrides?.checkboxBorderWidth, t.borderWidthThin);
	const checkboxBackground = tokenOr(t, overrides?.checkboxBackground, t.colorControlBackground);
	const checkboxRadius = tokenOr(t, overrides?.checkboxRadius, t.radiusSm);
	const disabledOpacity = tokenOr(t, overrides?.disabledOpacity, t.opacityDisabled);
	const transition = tokenOr(t, overrides?.transition, t.motionDurationFast);
	const labelSelectedWeight = overrides?.labelSelectedWeight ?? LABEL_SELECTED_WEIGHT;
	const headingSize = overrides?.headingSize ?? HEADING_SIZE;
	const badgeSize = overrides?.badgeSize ?? BADGE_SIZE;
	const labelTypography = {
		fontFamily: overrides?.fontFamily,
		fontSize: overrides?.fontSize,
		lineHeight: overrides?.lineHeight
	};
	/** Parent and tree order for every node, loaded subtrees included. */
	const index = React.useMemo(() => indexNodes(nodes, void 0, /* @__PURE__ */ new Map()), [nodes]);
	const [internalExpanded, setInternalExpanded] = React.useState(() => defaultExpanded?.includes("*") ? expandableIds(nodes) : defaultExpanded ?? []);
	const expandedIds = expanded ?? internalExpanded;
	const [openedLazy, setOpenedLazy] = React.useState([]);
	const lazySet = React.useMemo(() => new Set(lazyIds(nodes)), [nodes]);
	/** What is actually open: a still-lazy id the caller listed stays shut until the user opens it, so `onExpand` follows a user act. */
	const expandedSet = React.useMemo(() => new Set(expandedIds.filter((id) => !lazySet.has(id) || openedLazy.includes(id))), [
		expandedIds,
		lazySet,
		openedLazy
	]);
	const commitExpanded = (next) => {
		if (expanded === void 0) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (node) => {
		if (node.disabled === true) return;
		if (expandedSet.has(node.id)) {
			commitExpanded(expandedIds.filter((id) => id !== node.id));
			return;
		}
		if (node.children === "lazy") {
			setOpenedLazy((prev) => prev.includes(node.id) ? prev : [...prev, node.id]);
			onExpand?.(node.id);
		}
		commitExpanded(expandedIds.includes(node.id) ? expandedIds : [...expandedIds, node.id]);
	};
	const visible = React.useMemo(() => flattenNodes(nodes, expandedSet, 1), [nodes, expandedSet]);
	const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? []);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
	const [announcement, setAnnouncement] = React.useState("");
	/** Selected ids as the event reports them: tree (document) order, unknown ids last. */
	const inTreeOrder = (ids) => Array.from(ids).sort((a, b) => (index.get(a)?.order ?? Number.MAX_SAFE_INTEGER) - (index.get(b)?.order ?? Number.MAX_SAFE_INTEGER));
	const commitSelection = (next) => {
		if (next.length === selectedIds.length && next.every((id) => selectedSet.has(id))) return;
		if (selected === void 0) setInternalSelected(next);
		onSelectionChange?.(next);
		if (selectable === "multiple") {
			const message = COPY$4.selectedCount(next.length);
			setAnnouncement(message);
			if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message);
		}
	};
	const checkStateOf = (node) => {
		const own = selectedSet.has(node.id);
		if (!selectChildren) return own ? "checked" : "unchecked";
		const ids = descendantIds(node);
		if (ids.length === 0) return own ? "checked" : "unchecked";
		const count = ids.filter((id) => selectedSet.has(id)).length;
		if (count === ids.length) return "checked";
		return count > 0 || own ? "mixed" : "unchecked";
	};
	/** A cascading parent's id is in the selection exactly when every enabled loaded descendant is. */
	const syncAncestors = (id, next) => {
		let parent = index.get(id)?.parent;
		while (parent !== void 0) {
			const entry = index.get(parent);
			if (entry === void 0) return;
			const reach = descendantIds(entry.node);
			if (reach.length > 0) {
				if (reach.every((child) => next.has(child))) next.add(parent);
				else next.delete(parent);
			}
			parent = entry.parent;
		}
	};
	const selectNode = (node) => {
		commitSelection([node.id]);
	};
	const toggleNode = (node) => {
		const check = checkStateOf(node) !== "checked";
		const ids = selectChildren ? [node.id, ...descendantIds(node)] : [node.id];
		const next = new Set(selectedSet);
		for (const id of ids) if (check) next.add(id);
		else next.delete(id);
		if (selectChildren) syncAncestors(node.id, next);
		commitSelection(inTreeOrder(next));
	};
	const activate = (node) => {
		if (node.href !== void 0) {
			Promise.resolve(Linking.openURL(node.href)).catch(() => void 0);
			return;
		}
		onActivate?.(node.id);
	};
	/** A tap: toggles in `multiple`; otherwise Enter — selects in `single` and activates. */
	const press = (node) => {
		if (node.disabled === true) return;
		if (selectable === "multiple") {
			toggleNode(node);
			return;
		}
		if (selectable === "single") selectNode(node);
		activate(node);
	};
	const longPress = (node) => {
		if (node.disabled !== true && selectable === "multiple") activate(node);
	};
	const [focusedId, setFocusedId] = React.useState(null);
	const [hoveredId, setHoveredId] = React.useState(null);
	const handleFocus = (node) => {
		setFocusedId(node.id);
		if (selectOnFocus && selectable === "single" && node.disabled !== true) selectNode(node);
	};
	/** One full-height line per open ancestor, centred on that ancestor's expand button. */
	const guides = (level) => showGuides && level > 1 ? /* @__PURE__ */ React.createElement(View, {
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: [StyleSheet.absoluteFill, { pointerEvents: "none" }]
	}, Array.from({ length: level - 1 }, (_, ancestor) => /* @__PURE__ */ React.createElement(View, {
		key: ancestor,
		style: {
			position: "absolute",
			top: 0,
			bottom: 0,
			start: rowPaddingInline + ancestor * indent + (expandButtonSize - guideLineWidth) / 2,
			width: guideLineWidth,
			backgroundColor: guideLine
		}
	}))) : null;
	const checkbox = (state) => /* @__PURE__ */ React.createElement(View, {
		testID: "Tree.checkbox",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no-hide-descendants",
		style: {
			width: checkboxSize,
			height: checkboxSize,
			borderRadius: checkboxRadius,
			borderWidth: checkboxBorderWidth,
			borderColor: state === "unchecked" ? t.colorControlBorder : t.colorControlSelectedBackground,
			backgroundColor: state === "unchecked" ? checkboxBackground : t.colorControlSelectedBackground,
			alignItems: "center",
			justifyContent: "center"
		}
	}, state === "unchecked" ? null : /* @__PURE__ */ React.createElement(Icon, {
		name: state === "mixed" ? "dash" : "check",
		size: "xs",
		color: t.colorControlSelectedForeground
	}));
	const renderPlaceholder = (item) => /* @__PURE__ */ React.createElement(View, {
		testID: "Tree.node",
		style: {
			flexDirection: "row",
			alignItems: "center",
			minHeight: rowHeight,
			paddingHorizontal: rowPaddingInline,
			gap: rowGap
		}
	}, guides(item.level), /* @__PURE__ */ React.createElement(View, {
		testID: "Tree.indent",
		style: { width: (item.level - 1) * indent }
	}), /* @__PURE__ */ React.createElement(View, { style: { width: expandButtonSize } }), /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted"
	}, COPY$4.loading));
	const renderNode = ({ item }) => {
		if (item.placeholder) return renderPlaceholder(item);
		const { node, level } = item;
		const parent = hasChildren(node);
		const isExpanded = parent && expandedSet.has(node.id);
		const disabled = node.disabled === true;
		const checkState = selectable === "multiple" ? checkStateOf(node) : "unchecked";
		const isSelected = selectable === "single" ? selectedSet.has(node.id) : selectable === "multiple" && checkState === "checked";
		const highlighted = !disabled && hoveredId === node.id;
		const actions = [];
		if (parent && !disabled) actions.push({
			name: "expand",
			label: COPY$4.expand(node.label)
		}, {
			name: "collapse",
			label: COPY$4.collapse(node.label)
		});
		if (selectable === "multiple" && !disabled) actions.push({ name: "longpress" });
		const handleAction = (event) => {
			const action = event.nativeEvent.actionName;
			if (action === "expand" && !isExpanded || action === "collapse" && isExpanded) toggleExpand(node);
			else if (action === "longpress") longPress(node);
		};
		return /* @__PURE__ */ React.createElement(View, {
			testID: "Tree.node",
			style: {
				flexDirection: "row",
				alignItems: "center",
				minHeight: rowHeight,
				paddingHorizontal: rowPaddingInline,
				gap: rowGap,
				borderRadius: rowRadius,
				backgroundColor: isSelected ? rowSelected : highlighted ? rowHover : void 0,
				opacity: disabled ? disabledOpacity : 1
			}
		}, guides(level), isSelected ? /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			style: {
				position: "absolute",
				top: 0,
				bottom: 0,
				start: 0,
				width: rowSelectedBorderWidth,
				backgroundColor: rowSelectedBorder,
				pointerEvents: "none"
			}
		}) : null, /* @__PURE__ */ React.createElement(View, {
			testID: "Tree.indent",
			style: { width: (level - 1) * indent }
		}), /* @__PURE__ */ React.createElement(View, {
			testID: "Tree.expandButton",
			style: {
				width: expandButtonSize,
				minHeight: expandButtonSize,
				alignItems: "center",
				justifyContent: "center"
			}
		}, parent ? /* @__PURE__ */ React.createElement(Button, {
			label: isExpanded ? COPY$4.collapse(node.label) : COPY$4.expand(node.label),
			variant: "ghost",
			size: "sm",
			iconOnly: true,
			expanded: isExpanded,
			disabled,
			leadingIcon: /* @__PURE__ */ React.createElement(Chevron, {
				expanded: isExpanded,
				color: t.colorForeground,
				duration: transition
			}),
			onPress: () => toggleExpand(node)
		}) : null), /* @__PURE__ */ React.createElement(Pressable, {
			testID: "Tree.nodeRow",
			accessibilityRole: node.href !== void 0 ? "link" : "button",
			accessibilityLabel: `${node.label}, level ${level}`,
			accessibilityState: {
				disabled,
				expanded: parent ? isExpanded : void 0,
				selected: selectable === "single" ? isSelected : void 0,
				checked: selectable === "multiple" ? checkState === "mixed" ? "mixed" : checkState === "checked" : void 0,
				busy: isExpanded && node.children === "lazy" ? true : void 0
			},
			accessibilityActions: actions.length > 0 ? actions : void 0,
			onAccessibilityAction: actions.length > 0 ? handleAction : void 0,
			onPress: () => press(node),
			onLongPress: selectable === "multiple" ? () => longPress(node) : void 0,
			onFocus: () => handleFocus(node),
			onBlur: () => setFocusedId((prev) => prev === node.id ? null : prev),
			onHoverIn: () => setHoveredId(node.id),
			onHoverOut: () => setHoveredId((prev) => prev === node.id ? null : prev),
			onPressIn: () => setHoveredId(node.id),
			onPressOut: () => setHoveredId((prev) => prev === node.id ? null : prev),
			style: {
				flex: 1,
				flexDirection: "row",
				alignItems: "center",
				alignSelf: "stretch",
				gap: checkboxGap
			}
		}, selectable === "multiple" ? checkbox(checkState) : null, /* @__PURE__ */ React.createElement(View, { style: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: rowGap
		} }, node.icon !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Tree.icon" }, /* @__PURE__ */ React.createElement(Icon, {
			name: node.icon,
			size: "sm",
			color: t.colorForegroundMuted
		})) : null, /* @__PURE__ */ React.createElement(View, { style: { flex: 1 } }, node.href !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Tree.link" }, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			overrides: labelTypography
		}, /* @__PURE__ */ React.createElement(Link, {
			href: node.href,
			label: node.label,
			onPress: () => {
				press(node);
				return false;
			},
			onLongPress: selectable === "multiple" ? () => longPress(node) : void 0
		}))) : /* @__PURE__ */ React.createElement(View, { testID: "Tree.label" }, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			truncate: true,
			overrides: isSelected ? {
				...labelTypography,
				fontWeight: labelSelectedWeight
			} : labelTypography
		}, node.label))), node.badge !== void 0 ? /* @__PURE__ */ React.createElement(View, { testID: "Tree.badge" }, /* @__PURE__ */ React.createElement(Text, {
			size: "xs",
			tone: "muted",
			overrides: { fontSize: badgeSize }
		}, node.badge)) : null)), focusedId === node.id ? /* @__PURE__ */ React.createElement(View, {
			accessibilityElementsHidden: true,
			importantForAccessibility: "no",
			style: [StyleSheet.absoluteFill, {
				borderWidth: t.borderWidthFocus,
				borderColor: t.colorBorderFocus,
				borderRadius: rowRadius,
				pointerEvents: "none"
			}]
		}) : null);
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Tree"
	}, showLabel ? /* @__PURE__ */ React.createElement(View, { testID: "Tree.heading" }, /* @__PURE__ */ React.createElement(Heading, {
		level: headingLevel,
		overrides: { fontSize: headingSize }
	}, label)) : null, /* @__PURE__ */ React.createElement(FlatList, {
		accessibilityRole: "list",
		accessibilityLabel: label,
		data: visible,
		extraData: [
			selectedIds,
			expandedIds,
			focusedId,
			hoveredId,
			selectable,
			selectChildren,
			showGuides
		],
		keyExtractor: (item) => item.key,
		renderItem: renderNode,
		ListEmptyComponent: /* @__PURE__ */ React.createElement(View, {
			testID: "Tree.emptyState",
			style: {
				minHeight: rowHeight,
				paddingHorizontal: rowPaddingInline,
				justifyContent: "center"
			}
		}, /* @__PURE__ */ React.createElement(Text, {
			size: "sm",
			tone: "muted"
		}, COPY$4.empty))
	}), selectable === "multiple" ? /* @__PURE__ */ React.createElement(View, {
		accessibilityLiveRegion: "polite",
		style: HIDDEN_STYLE$1
	}, /* @__PURE__ */ React.createElement(Text, { size: "sm" }, announcement)) : null);
}
//#endregion
//#region src/Splitter.tsx
const COPY$3 = {
	collapse: (label) => `Collapse ${label}`,
	expand: (label) => `Expand ${label}`,
	setMinimum: (label) => `Minimum ${label}`,
	setMaximum: (label) => `Maximum ${label}`,
	sizeText: (percent) => `${percent}%`
};
const STACK_BELOW = {
	prose: "layoutMaxWidthProse",
	content: "layoutMaxWidthContent"
};
/** Per-`persistKey` memory. No storage dependency is permitted in this package, so it
* survives a remount but not an app restart. */
const persisted = /* @__PURE__ */ new Map();
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function renderPane(content) {
	return typeof content === "string" || typeof content === "number" ? /* @__PURE__ */ React.createElement(Text, null, content) : content;
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
function Splitter({ label, orientation = "horizontal", primary, secondary, size, defaultSize = 30, minSize = 10, maxSize = 90, step = 2, collapsible = false, collapsed, defaultCollapsed = false, persistKey, stackBelow = "prose", overrides, ref, onSizeChange, onSizeChangeEnd, onCollapseChange }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const horizontal = orientation === "horizontal";
	const [internalSize, setInternalSize] = React.useState(() => {
		return (persistKey !== void 0 ? persisted.get(persistKey) : void 0)?.size ?? defaultSize;
	});
	const [internalCollapsed, setInternalCollapsed] = React.useState(() => {
		return (persistKey !== void 0 ? persisted.get(persistKey) : void 0)?.collapsed ?? defaultCollapsed;
	});
	const [dragging, setDragging] = React.useState(false);
	const [containerWidth, setContainerWidth] = React.useState(null);
	const [separatorOffset, setSeparatorOffset] = React.useState(0);
	const [buttonExtent, setButtonExtent] = React.useState(0);
	const isCollapsed = collapsible && (collapsed ?? internalCollapsed);
	const baseSize = clamp(size ?? internalSize, minSize, maxSize);
	const effectiveSize = isCollapsed ? 0 : baseSize;
	React.useEffect(() => {
		if (__DEV__ && minSize >= maxSize) console.warn(`Splitter: minSize (${minSize}) must be less than maxSize (${maxSize}).`);
	}, [minSize, maxSize]);
	const persist = (nextSize, nextCollapsed) => {
		if (persistKey !== void 0) persisted.set(persistKey, {
			size: nextSize,
			collapsed: nextCollapsed
		});
	};
	const applySize = (raw, commit) => {
		const next = clamp(raw, minSize, maxSize);
		if (size === void 0) setInternalSize(next);
		persist(next, false);
		onSizeChange?.(next);
		if (commit) onSizeChangeEnd?.(next);
	};
	/** A step action is a complete interaction: it reports the change and the commit, and
	* a step already at a bound (setMaximum at `maxSize`) reports nothing. */
	const stepTo = (raw) => {
		const next = clamp(raw, minSize, maxSize);
		if (next === baseSize) return;
		applySize(next, true);
	};
	const setCollapsedState = (next) => {
		if (collapsed === void 0) setInternalCollapsed(next);
		persist(baseSize, next);
		onCollapseChange?.(next);
	};
	const toggleCollapse = () => {
		if (collapsible) setCollapsedState(!isCollapsed);
	};
	const handleSeparatorAction = (event) => {
		const name = event.nativeEvent.actionName;
		if (name === "activate") {
			toggleCollapse();
			return;
		}
		if (isCollapsed) return;
		if (name === "increment") stepTo(baseSize + step);
		else if (name === "decrement") {
			if (collapsible && baseSize <= minSize) setCollapsedState(true);
			else stepTo(baseSize - step);
		} else if (name === "setMinimum") stepTo(minSize);
		else if (name === "setMaximum") stepTo(maxSize);
	};
	const latest = React.useRef({
		baseSize,
		isCollapsed,
		horizontal,
		collapsible,
		minSize,
		maxSize,
		applySize,
		setCollapsedState,
		onSizeChangeEnd
	});
	latest.current = {
		baseSize,
		isCollapsed,
		horizontal,
		collapsible,
		minSize,
		maxSize,
		applySize,
		setCollapsedState,
		onSizeChangeEnd
	};
	const containerExtentRef = React.useRef(0);
	const dragRef = React.useRef({
		active: false,
		start: 0,
		last: 0
	});
	const panResponder = React.useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => !latest.current.isCollapsed,
		onMoveShouldSetPanResponder: () => !latest.current.isCollapsed,
		onPanResponderGrant: () => {
			dragRef.current = {
				active: true,
				start: latest.current.baseSize,
				last: latest.current.baseSize
			};
			setDragging(true);
		},
		onPanResponderMove: (_event, gesture) => {
			const drag = dragRef.current;
			const extent = containerExtentRef.current;
			if (!drag.active || extent <= 0) return;
			const raw = drag.start + (latest.current.horizontal ? gesture.dx : gesture.dy) / extent * 100;
			if (latest.current.collapsible && raw < latest.current.minSize) {
				drag.active = false;
				setDragging(false);
				latest.current.setCollapsedState(true);
				return;
			}
			drag.last = raw;
			latest.current.applySize(raw, false);
		},
		onPanResponderRelease: () => {
			latest.current.onSizeChangeEnd?.(clamp(dragRef.current.last, latest.current.minSize, latest.current.maxSize));
			dragRef.current.active = false;
			setDragging(false);
		},
		onPanResponderTerminate: () => {
			dragRef.current.active = false;
			setDragging(false);
		}
	})).current;
	const separatorSize = overrides?.separatorSize ? resolveToken(t, overrides.separatorSize) : t.space1;
	const separatorColor = overrides?.separatorColor ? resolveToken(t, overrides.separatorColor) : t.colorBorder;
	const handleSize = overrides?.handleSize ? resolveToken(t, overrides.handleSize) : t.space3;
	const gripLength = overrides?.gripLength ? resolveToken(t, overrides.gripLength) : t.space6;
	const gripRadius = overrides?.gripRadius ? resolveToken(t, overrides.gripRadius) : t.radiusFull;
	const collapseButtonOffset = overrides?.collapseButtonOffset ? resolveToken(t, overrides.collapseButtonOffset) : t.space2;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationFast;
	const separatorActive = t.colorControlSelectedBackground;
	const grip = t.colorBorderStrong;
	const paneMinTarget = t.sizeTargetComfortable;
	const minTarget = t.sizeTargetMin;
	const sizeAnim = React.useRef(new Animated.Value(effectiveSize)).current;
	const previousCollapsed = React.useRef(isCollapsed);
	React.useEffect(() => {
		const toggled = previousCollapsed.current !== isCollapsed;
		previousCollapsed.current = isCollapsed;
		if (!toggled || reducedMotion) {
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
		isCollapsed,
		reducedMotion,
		sizeAnim,
		transitionDuration,
		t.motionEasingStandard
	]);
	const stackThreshold = stackBelow === "never" ? null : t[STACK_BELOW[stackBelow]];
	const stacked = horizontal && stackThreshold !== null && containerWidth !== null && containerWidth < stackThreshold;
	const handleContainerLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		containerExtentRef.current = horizontal ? width : height;
		setContainerWidth(width);
	};
	const handleSeparatorLayout = (event) => {
		const { x, y } = event.nativeEvent.layout;
		setSeparatorOffset(horizontal ? x : y);
	};
	const handleButtonLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		setButtonExtent(horizontal ? width : height);
	};
	const containerStyle = {
		flex: 1,
		flexDirection: horizontal && !stacked ? "row" : "column"
	};
	const primaryPaneStyle = stacked ? {} : {
		flexBasis: sizeAnim.interpolate({
			inputRange: [0, 100],
			outputRange: ["0%", "100%"]
		}),
		flexGrow: 0,
		flexShrink: isCollapsed ? 1 : 0,
		minWidth: horizontal && !isCollapsed ? paneMinTarget : 0,
		minHeight: !horizontal && !isCollapsed ? paneMinTarget : 0,
		overflow: "hidden"
	};
	const secondaryPaneStyle = stacked ? {} : {
		flex: 1,
		minWidth: horizontal ? paneMinTarget : 0,
		minHeight: horizontal ? 0 : paneMinTarget
	};
	const hitExtra = Math.max(0, Math.ceil((Math.max(handleSize, minTarget) - separatorSize) / 2));
	const separatorStyle = {
		width: horizontal ? separatorSize : "100%",
		height: horizontal ? "100%" : separatorSize,
		backgroundColor: dragging ? separatorActive : separatorColor,
		zIndex: 1
	};
	const handleStyle = horizontal ? {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: -hitExtra,
		right: -hitExtra
	} : {
		position: "absolute",
		left: 0,
		right: 0,
		top: -hitExtra,
		bottom: -hitExtra
	};
	const gripStyle = {
		position: "absolute",
		width: horizontal ? separatorSize : gripLength,
		height: horizontal ? gripLength : separatorSize,
		left: horizontal ? 0 : "50%",
		top: horizontal ? "50%" : 0,
		transform: horizontal ? [{ translateY: -gripLength / 2 }] : [{ translateX: -gripLength / 2 }],
		borderRadius: gripRadius,
		backgroundColor: grip
	};
	const buttonCross = isCollapsed ? separatorOffset + separatorSize : separatorOffset + separatorSize / 2 - buttonExtent / 2;
	const collapseButtonStyle = horizontal ? {
		position: "absolute",
		top: collapseButtonOffset,
		left: buttonCross,
		zIndex: 1
	} : {
		position: "absolute",
		left: collapseButtonOffset,
		top: buttonCross,
		zIndex: 1
	};
	const collapseIcon = horizontal ? isCollapsed ? "chevron-right" : "chevron-left" : isCollapsed ? "chevron-down" : "chevron-up";
	const toggleLabel = isCollapsed ? COPY$3.expand(label) : COPY$3.collapse(label);
	const separatorActions = [
		{ name: "increment" },
		{ name: "decrement" },
		{
			name: "setMinimum",
			label: COPY$3.setMinimum(label)
		},
		{
			name: "setMaximum",
			label: COPY$3.setMaximum(label)
		},
		...collapsible ? [{
			name: "activate",
			label: toggleLabel
		}] : []
	];
	const reportedSize = Math.round(effectiveSize);
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Splitter",
		style: containerStyle,
		onLayout: handleContainerLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "Splitter.primaryPane",
		style: primaryPaneStyle,
		accessibilityElementsHidden: isCollapsed && !stacked,
		importantForAccessibility: isCollapsed && !stacked ? "no-hide-descendants" : "auto",
		pointerEvents: isCollapsed && !stacked ? "none" : "auto"
	}, renderPane(primary)), stacked ? null : /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.separator",
		accessible: true,
		focusable: true,
		accessibilityRole: "adjustable",
		accessibilityLabel: label,
		accessibilityValue: {
			min: isCollapsed ? 0 : minSize,
			max: maxSize,
			now: reportedSize,
			text: COPY$3.sizeText(reportedSize)
		},
		accessibilityActions: separatorActions,
		onAccessibilityAction: handleSeparatorAction,
		hitSlop: horizontal ? {
			left: hitExtra,
			right: hitExtra
		} : {
			top: hitExtra,
			bottom: hitExtra
		},
		onLayout: handleSeparatorLayout,
		style: separatorStyle,
		...panResponder.panHandlers
	}, /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.handle",
		style: handleStyle
	}), /* @__PURE__ */ React.createElement(View, {
		pointerEvents: "none",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		style: gripStyle
	})), stacked || !collapsible ? null : /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.collapseButton",
		style: collapseButtonStyle,
		onLayout: handleButtonLayout
	}, /* @__PURE__ */ React.createElement(Button, {
		label: toggleLabel,
		variant: "ghost",
		size: "sm",
		iconOnly: true,
		leadingIcon: /* @__PURE__ */ React.createElement(Icon, {
			name: collapseIcon,
			color: t.colorActionGhostForeground
		}),
		onPress: toggleCollapse
	})), /* @__PURE__ */ React.createElement(View, {
		testID: "Splitter.secondaryPane",
		style: secondaryPaneStyle
	}, renderPane(secondary)));
}
//#endregion
//#region src/ProgressBar.tsx
const FILL_TOKEN = {
	neutral: "colorControlSelectedBackground",
	success: "colorStatusSuccessIcon",
	danger: "colorStatusDangerIcon"
};
const COPY$2 = {
	progress: (label, value) => `${label}: ${value}`,
	complete: (label) => `${label}: complete`,
	indeterminate: (label) => `${label}: in progress`
};
/** Announcement tiers are quarters of the range: 1–3 announce `copy.progress`, 4 is `max` (completion). */
const TIERS = 4;
function defaultFormatValue(value, min, max) {
	const fraction = max > min ? (value - min) / (max - min) : 0;
	return new Intl.NumberFormat(void 0, {
		style: "percent",
		maximumFractionDigits: 0
	}).format(fraction);
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
* Renders an `accessible` `View` with `accessibilityRole="progressbar"`,
* `accessibilityLabel` (the accessible name even when `hideLabel` hides the visible
* label) and `accessibilityValue={{ min, max, now, text }}` — an indeterminate bar
* carries `min` and `max` only and sets `accessibilityState={{ busy: true }}`. The bar
* is never focusable. The fill's width animates to the value's fraction over
* `transition`, snapping under reduced motion. Indeterminate: a one-third-width fill
* sweeps from wholly before the track's inline start to wholly past its inline end
* (leftward under `I18nManager.isRTL`) over `indeterminateLoop` with `sweepEasing`; under
* reduced motion no loop starts and the fill is drawn full-width at `opacity.disabled`.
*
* Announcements (`AccessibilityInfo.announceForAccessibility`): the tier is
* `floor(fraction × 4)` and is tracked whatever `announce` is. The state at mount is
* recorded silently, except that a bar mounting indeterminate announces
* `copy.indeterminate`, as it does each later time it becomes indeterminate.
* `milestones` announces `copy.progress` once for the highest tier 1–3 entered by an
* update; reaching `max` announces `copy.complete` (for `milestones` and `complete`).
* Moving to a lower tier resets the record to that tier. With `max <= min` the bar
* renders empty, reports `now = min`, announces no progress or completion, and warns
* in development.
*/
function ProgressBar({ label, value, min = 0, max = 100, formatValue = defaultFormatValue, showValue = true, hideLabel = false, tone = "neutral", announce = "complete", overrides, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const indeterminate = value === void 0 || value === null;
	const validRange = max > min;
	React.useEffect(() => {
		if (__DEV__ && !validRange) console.warn(`ProgressBar: max (${max}) must be greater than min (${min}); the bar renders empty.`);
	}, [
		validRange,
		min,
		max
	]);
	const clamped = validRange ? Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : min)) : min;
	const fraction = validRange ? (clamped - min) / (max - min) : 0;
	const valueText = formatValue(clamped, min, max);
	const trackColor = overrides?.track ? resolveToken(t, overrides.track) : t.colorBackgroundStrong;
	const trackHeight = overrides?.trackHeight ? resolveToken(t, overrides.trackHeight) : t.space2;
	const radius = overrides?.radius ? resolveToken(t, overrides.radius) : t.radiusFull;
	const partGap = overrides?.partGap ? resolveToken(t, overrides.partGap) : t.space1;
	const labelGap = overrides?.labelGap ? resolveToken(t, overrides.labelGap) : t.space2;
	const transitionDuration = overrides?.transition ? resolveToken(t, overrides.transition) : t.motionDurationBase;
	const loopDuration = overrides?.indeterminateLoop ? resolveToken(t, overrides.indeterminateLoop) : t.motionDurationLoop;
	const sweepEasing = overrides?.sweepEasing ? resolveToken(t, overrides.sweepEasing) : t.motionEasingStandard;
	const fillColor = t[FILL_TOKEN[tone]];
	const [trackWidth, setTrackWidth] = React.useState(0);
	const fillWidth = React.useRef(new Animated.Value(0)).current;
	const laidOutWidth = React.useRef(0);
	React.useEffect(() => {
		if (indeterminate) return;
		const toValue = trackWidth * fraction;
		const resized = laidOutWidth.current !== trackWidth;
		laidOutWidth.current = trackWidth;
		if (reducedMotion || resized || trackWidth === 0) {
			fillWidth.setValue(toValue);
			return;
		}
		Animated.timing(fillWidth, {
			toValue,
			duration: transitionDuration,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		}).start();
	}, [
		indeterminate,
		fraction,
		trackWidth,
		reducedMotion,
		fillWidth,
		transitionDuration,
		t.motionEasingStandard
	]);
	const sweepX = React.useRef(new Animated.Value(0)).current;
	const sweepWidth = trackWidth / 3;
	React.useEffect(() => {
		if (!indeterminate || reducedMotion || trackWidth === 0) return;
		const rtl = I18nManager.isRTL;
		const from = rtl ? sweepWidth : -sweepWidth;
		const to = rtl ? -trackWidth : trackWidth;
		sweepX.setValue(from);
		const animation = Animated.loop(Animated.timing(sweepX, {
			toValue: to,
			duration: loopDuration,
			easing: toEasing(sweepEasing),
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
		sweepWidth,
		loopDuration,
		sweepEasing,
		sweepX
	]);
	const handleTrackLayout = (event) => {
		const { width } = event.nativeEvent.layout;
		setTrackWidth((prev) => prev === width ? prev : width);
	};
	const mounted = React.useRef(false);
	const wasIndeterminate = React.useRef(false);
	const recordedTier = React.useRef(0);
	React.useEffect(() => {
		const isMount = !mounted.current;
		mounted.current = true;
		if (indeterminate) {
			if (!wasIndeterminate.current && announce !== "none") AccessibilityInfo.announceForAccessibility(COPY$2.indeterminate(label));
			wasIndeterminate.current = true;
			return;
		}
		wasIndeterminate.current = false;
		if (!validRange) return;
		const tier = Math.floor(fraction * TIERS);
		if (isMount) {
			recordedTier.current = tier;
			return;
		}
		if (tier < recordedTier.current) {
			recordedTier.current = tier;
			return;
		}
		if (tier === recordedTier.current) return;
		recordedTier.current = tier;
		if (announce === "none") return;
		if (tier >= TIERS) AccessibilityInfo.announceForAccessibility(COPY$2.complete(label));
		else if (announce === "milestones") AccessibilityInfo.announceForAccessibility(COPY$2.progress(label, valueText));
	}, [
		announce,
		indeterminate,
		validRange,
		fraction,
		label,
		valueText
	]);
	const showValueText = showValue && !indeterminate;
	const showHeader = !hideLabel || showValueText;
	const styles = React.useMemo(() => {
		return {
			container: {
				flexDirection: "column",
				gap: partGap
			},
			header: {
				flexDirection: "row",
				justifyContent: hideLabel ? "flex-end" : "space-between",
				alignItems: "baseline",
				gap: labelGap
			},
			track: {
				height: trackHeight,
				borderRadius: radius,
				backgroundColor: trackColor,
				overflow: "hidden"
			}
		};
	}, [
		partGap,
		labelGap,
		hideLabel,
		trackHeight,
		radius,
		trackColor
	]);
	const fillStyle = indeterminate ? reducedMotion ? {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: "100%",
		opacity: t.opacityDisabled
	} : {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: sweepWidth,
		alignSelf: "flex-start",
		transform: [{ translateX: sweepX }]
	} : {
		height: trackHeight,
		borderRadius: radius,
		backgroundColor: fillColor,
		width: fillWidth,
		alignSelf: "flex-start"
	};
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "ProgressBar",
		accessible: true,
		focusable: false,
		accessibilityRole: "progressbar",
		accessibilityLabel: label,
		accessibilityValue: indeterminate ? {
			min,
			max
		} : {
			min,
			max,
			now: clamped,
			text: valueText
		},
		accessibilityState: indeterminate ? { busy: true } : void 0,
		style: styles.container
	}, showHeader ? /* @__PURE__ */ React.createElement(View, {
		testID: "ProgressBar.header",
		style: styles.header
	}, hideLabel ? null : /* @__PURE__ */ React.createElement(View, { testID: "ProgressBar.label" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		weight: "medium",
		tone: "default",
		overrides: {
			fontSize: overrides?.labelSize,
			fontWeight: overrides?.labelWeight,
			fontFamily: overrides?.fontFamily,
			lineHeight: overrides?.lineHeight
		}
	}, label)), showValueText ? /* @__PURE__ */ React.createElement(View, { testID: "ProgressBar.valueText" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: {
			fontSize: overrides?.valueSize,
			fontFamily: overrides?.fontFamily,
			lineHeight: overrides?.lineHeight
		}
	}, valueText)) : null) : null, /* @__PURE__ */ React.createElement(View, {
		testID: "ProgressBar.track",
		style: styles.track,
		onLayout: handleTrackLayout
	}, /* @__PURE__ */ React.createElement(Animated.View, {
		testID: "ProgressBar.fill",
		style: fillStyle
	})));
}
//#endregion
//#region src/Feed.tsx
const COPY$1 = {
	showNew: (count) => `Show ${count} new`,
	loading: "Loading more",
	end: "You are all caught up.",
	unread: "unread",
	position: (index, total) => `${index} of ${total}`,
	empty: "Nothing here yet.",
	justNow: "just now",
	minutesAgo: (n) => `${n} min ago`,
	hoursAgo: (n) => `${n} hr ago`,
	daysAgo: (n) => `${n} d ago`
};
/** Clipped to a point but still exposed to assistive technology: text with no visible slot. */
const HIDDEN_STYLE = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden"
};
/** Half visible for one second, as the schema's platform notes state. */
const VIEWABILITY_CONFIG = {
	itemVisiblePercentThreshold: 50,
	minimumViewTime: 1e3
};
const MINUTE = 6e4;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
/**
* Relative time from the copy strings, floored (90 seconds is "1 min ago"); a future
* timestamp reads as `justNow`; the absolute date in the user's locale from seven days on.
* The raw string when it does not parse.
*/
function formatTimestamp(timestamp, now) {
	const then = new Date(timestamp).getTime();
	if (!Number.isFinite(then)) return timestamp;
	const elapsed = Math.max(0, now - then);
	if (elapsed < MINUTE) return COPY$1.justNow;
	if (elapsed < HOUR) return COPY$1.minutesAgo(Math.floor(elapsed / MINUTE));
	if (elapsed < DAY) return COPY$1.hoursAgo(Math.floor(elapsed / HOUR));
	if (elapsed < WEEK) return COPY$1.daysAgo(Math.floor(elapsed / DAY));
	return new Intl.DateTimeFormat(void 0, { dateStyle: "medium" }).format(then);
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
* `onEndReached` fires with threshold one screen; `maintainVisibleContentPosition` keeps
* the reader's place when the caller prepends after `onShowNew`. The new-items row is a
* `View` above the list, so it never scrolls away, and is `accessibilityLiveRegion="polite"`
* — Android announces the count; on iOS VoiceOver users reach the button at the top.
* While `loading` with no items the indicator shows, not `copy.empty`, so an empty feed
* about to fetch stays blank rather than flashing it. There is no hardware keyboard feed
* model on native (no Page or Ctrl keys); screen readers browse with their own gestures.
* The absolute time is not exposed on native.
*/
function Feed({ label, items, hasMore = false, loading = false, newItemsCount, headingLevel = "3", endMessage, overrides, ref, onEndReached, onShowNew, onViewableItemsChanged }) {
	const { tokens: t } = useTheme();
	const token = (override, fallback) => override ? resolveToken(t, override) : fallback;
	const itemGap = token(overrides?.itemGap, t.layoutGapNormal);
	const newItemsOffset = token(overrides?.newItemsOffset, t.space3);
	const newItemsLayer = token(overrides?.newItemsLayer, t.layerRaised);
	const loadingInset = token(overrides?.loadingInset, t.layoutInsetMd);
	const endMessageInset = token(overrides?.endMessageInset, t.layoutInsetMd);
	const emptyStateInset = token(overrides?.emptyStateInset, t.layoutInsetMd);
	const articleInset = overrides?.articleInset;
	const articleBodyGap = overrides?.articleBodyGap;
	const timestampSize = overrides?.timestampSize;
	const endMessageSize = overrides?.endMessageSize;
	const emptyStateSize = overrides?.emptyStateSize;
	const fontFamily = overrides?.fontFamily;
	const cardOverrides = React.useMemo(() => articleInset ? {
		paddingBlock: articleInset,
		paddingInline: articleInset
	} : void 0, [articleInset]);
	const articleBodyOverrides = React.useMemo(() => ({ gap: articleBodyGap }), [articleBodyGap]);
	const timestampOverrides = React.useMemo(() => ({
		fontSize: timestampSize,
		fontFamily
	}), [timestampSize, fontFamily]);
	const endMessageOverrides = React.useMemo(() => ({
		fontSize: endMessageSize,
		fontFamily
	}), [endMessageSize, fontFamily]);
	const emptyStateOverrides = React.useMemo(() => ({
		fontSize: emptyStateSize,
		fontFamily
	}), [emptyStateSize, fontFamily]);
	const textOverrides = React.useMemo(() => ({ fontFamily }), [fontFamily]);
	const buttonOverrides = React.useMemo(() => ({ fontFamily }), [fontFamily]);
	const warnedLabel = React.useRef(false);
	React.useEffect(() => {
		if (__DEV__ && label === "" && !warnedLabel.current) {
			warnedLabel.current = true;
			console.warn("Feed: `label` is empty; the feed has no accessible name. Say what the feed contains (\"Activity\").");
		}
	}, [label]);
	const requestRef = React.useRef(onEndReached);
	React.useEffect(() => {
		requestRef.current = onEndReached;
	}, [onEndReached]);
	const empty = items.length === 0;
	React.useEffect(() => {
		if (empty && hasMore && !loading) requestRef.current?.();
	}, [
		empty,
		hasMore,
		loading
	]);
	const handleEndReached = () => {
		if (hasMore && !loading && !empty) onEndReached?.();
	};
	const onVisibleRef = React.useRef(onViewableItemsChanged);
	React.useEffect(() => {
		onVisibleRef.current = onViewableItemsChanged;
	}, [onViewableItemsChanged]);
	const announced = React.useRef(/* @__PURE__ */ new Set());
	const handleViewableItemsChanged = React.useRef(({ changed }) => {
		for (const entry of changed) if (entry.isViewable && entry.item != null) {
			const { id } = entry.item;
			if (!announced.current.has(id)) {
				announced.current.add(id);
				onVisibleRef.current?.(id);
			}
		}
	}).current;
	const total = hasMore ? void 0 : items.length;
	const unreadColor = t.colorControlSelectedBackground;
	const unreadWidth = t.borderWidthFocus;
	const renderItem = React.useCallback(({ item, index }) => /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.article",
		style: item.unread ? {
			borderStartWidth: unreadWidth,
			borderStartColor: unreadColor
		} : void 0
	}, item.unread ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE }, /* @__PURE__ */ React.createElement(Text, { overrides: textOverrides }, COPY$1.unread)) : null, total !== void 0 ? /* @__PURE__ */ React.createElement(View, { style: HIDDEN_STYLE }, /* @__PURE__ */ React.createElement(Text, { overrides: textOverrides }, COPY$1.position(index + 1, total))) : null, /* @__PURE__ */ React.createElement(Card, {
		heading: item.heading,
		headingLevel,
		inset: "md",
		overrides: cardOverrides,
		footer: item.actions != null ? /* @__PURE__ */ React.createElement(View, { testID: "Feed.articleActions" }, item.actions) : void 0
	}, /* @__PURE__ */ React.createElement(View, { testID: "Feed.articleBody" }, /* @__PURE__ */ React.createElement(Stack, {
		gap: "tight",
		overrides: articleBodyOverrides
	}, /* @__PURE__ */ React.createElement(View, { testID: "Feed.timestamp" }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: timestampOverrides
	}, formatTimestamp(item.timestamp, Date.now()))), typeof item.content === "string" || typeof item.content === "number" ? /* @__PURE__ */ React.createElement(Text, { overrides: textOverrides }, item.content) : item.content)))), [
		articleBodyOverrides,
		cardOverrides,
		headingLevel,
		textOverrides,
		timestampOverrides,
		total,
		unreadColor,
		unreadWidth
	]);
	const footer = loading ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.loadingIndicator",
		style: { padding: loadingInset }
	}, /* @__PURE__ */ React.createElement(ProgressBar, {
		label: COPY$1.loading,
		hideLabel: true
	})) : !hasMore && !empty ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.endMessage",
		style: { padding: endMessageInset }
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: endMessageOverrides
	}, endMessage ?? COPY$1.end)) : void 0;
	const emptyState = !hasMore && !loading ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.emptyState",
		style: { padding: emptyStateInset }
	}, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: emptyStateOverrides
	}, COPY$1.empty)) : void 0;
	const showNewItems = newItemsCount !== void 0 && newItemsCount > 0;
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Feed"
	}, showNewItems ? /* @__PURE__ */ React.createElement(View, {
		testID: "Feed.newItemsButton",
		accessibilityLiveRegion: "polite",
		style: {
			alignSelf: "flex-start",
			paddingTop: newItemsOffset,
			zIndex: newItemsLayer
		}
	}, /* @__PURE__ */ React.createElement(Button, {
		label: COPY$1.showNew(Math.trunc(newItemsCount)),
		variant: "secondary",
		size: "sm",
		overrides: buttonOverrides,
		onPress: onShowNew
	})) : null, /* @__PURE__ */ React.createElement(FlatList, {
		testID: "Feed.container",
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
		ListEmptyComponent: emptyState
	}));
}
//#endregion
//#region src/Stepper.tsx
const COPY = {
	navLabel: "Progress",
	stepOf: "Step {current} of {total}",
	complete: "completed",
	current: "current step",
	error: "has an error",
	stepLabel: "Step {n}: {label}"
};
function format(template, params) {
	return template.replace(/\{(\w+)\}/g, (match, key) => key in params ? String(params[key]) : match);
}
/** An explicit `status` wins; otherwise position relative to `currentIndex` decides. */
function statusFor(step, index, currentIndex) {
	if (step.status !== void 0) return step.status;
	if (currentIndex === -1 || index > currentIndex) return "upcoming";
	return index < currentIndex ? "complete" : "current";
}
const STATUS_WORD = {
	complete: COPY.complete,
	current: COPY.current,
	error: COPY.error,
	upcoming: void 0
};
/**
* Stepper — a map of a journey with a "you are here". It sets expectations, shows progress without a bar, and
* gives people a way back to a step they finished. Navigation, not a form control (the number-stepping field is
* NumberInput).
*
* Use it for three to about seven ordered steps: vertical with descriptions for flows that need explanation,
* horizontal for short, familiar ones. Do not use it for two steps, for more than about eight, as Tabs, or to show
* task progress (ProgressBar).
*
* Renders a `View` with `accessibilityRole="list"` named by `label` (React Native has no `nav` landmark). Each step
* is a `Pressable` (navigable) or an `accessible` `View` whose `accessibilityLabel` is `copy.stepLabel` plus ", " and
* the status word, with `accessibilityState.selected` on the step `current` names. An explicit `status: "error"`
* wins for the indicator and the status word, while selection and the compact reveal still follow the id. The
* indicator switches between its four states at once; connectors cross-fade to `connectorComplete` over
* `transition`. Compact is decided by the stepper's own `onLayout` width, rendering non-compact until the first
* layout; the `count` Text ("Step n of m") follows the steps only while compact is in effect.
*/
function Stepper({ label, steps, current, orientation = "horizontal", navigable = "completed", compact = false, overrides, onStepSelect, ref }) {
	const { tokens: t } = useTheme();
	const reducedMotion = useReducedMotion();
	const [width, setWidth] = React.useState(void 0);
	const pick = (binding, fallback) => {
		const tokenRef = overrides?.[binding];
		return tokenRef ? resolveToken(t, tokenRef) : fallback;
	};
	const r = {
		indicatorSize: pick("indicatorSize", t.space6),
		indicatorBackground: pick("indicatorBackground", t.colorControlBackground),
		indicatorRadius: pick("indicatorRadius", t.radiusFull),
		indicatorFontSize: pick("indicatorFontSize", t.fontSizeSm),
		indicatorFontWeight: pick("indicatorFontWeight", t.fontWeightSemibold),
		connector: pick("connector", t.colorBorder),
		stepHover: pick("stepHover", t.colorActionGhostBackgroundHover),
		stepRadius: pick("stepRadius", t.radiusSm),
		stepPadding: pick("stepPadding", t.space2),
		stepGap: pick("stepGap", t.layoutGapNormal),
		partGap: pick("partGap", t.space2),
		fontFamily: pick("fontFamily", t.fontFamilyBody),
		transition: pick("transition", t.motionDurationFast)
	};
	const currentIndex = steps.findIndex((step) => step.id === current);
	const isHorizontal = orientation === "horizontal";
	const isCompact = isHorizontal && (compact || width !== void 0 && width < t.layoutMaxWidthProse);
	React.useEffect(() => {
		if (__DEV__ && currentIndex === -1) console.warn(`Stepper: current "${current}" matches no step id; nothing is selected.`);
	}, [current, currentIndex]);
	const onLayout = (event) => {
		const next = event.nativeEvent.layout.width;
		setWidth((previous) => previous === next ? previous : next);
	};
	const nodes = [];
	steps.forEach((step, index) => {
		const isNavigable = navigable === "all" || navigable === "completed" && currentIndex !== -1 && index < currentIndex;
		nodes.push(/* @__PURE__ */ React.createElement(StepControl, {
			key: step.id,
			step,
			index,
			status: statusFor(step, index, currentIndex),
			isCurrent: step.id === current,
			isNavigable,
			compact: isCompact,
			isHorizontal,
			t,
			r,
			overrides,
			onStepSelect
		}));
		if (index < steps.length - 1) nodes.push(/* @__PURE__ */ React.createElement(Connector, {
			key: `connector-${step.id}`,
			isHorizontal,
			complete: currentIndex !== -1 && index < currentIndex,
			reducedMotion,
			t,
			r
		}));
	});
	return /* @__PURE__ */ React.createElement(View, {
		ref,
		testID: "Stepper",
		accessibilityRole: "list",
		accessibilityLabel: label ?? COPY.navLabel,
		onLayout,
		style: {
			flexDirection: "column",
			gap: r.stepGap
		}
	}, /* @__PURE__ */ React.createElement(View, { style: isHorizontal ? {
		flexDirection: "row",
		alignItems: "flex-start"
	} : { flexDirection: "column" } }, nodes), isCompact ? /* @__PURE__ */ React.createElement(View, { testID: "Stepper.count" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: "muted",
		overrides: {
			fontSize: overrides?.countSize,
			fontFamily: overrides?.fontFamily
		}
	}, format(COPY.stepOf, {
		current: currentIndex === -1 ? 1 : currentIndex + 1,
		total: steps.length
	}))) : null);
}
/** One step's indicator, label and description; its own component so focus and hover state stay local. */
function StepControl({ step, index, status, isCurrent, isNavigable, compact, isHorizontal, t, r, overrides, onStepSelect }) {
	const [focused, setFocused] = React.useState(false);
	const [hovered, setHovered] = React.useState(false);
	const n = index + 1;
	const statusWord = STATUS_WORD[status];
	const stepName = format(COPY.stepLabel, {
		n,
		label: step.label
	});
	const accessibleName = statusWord !== void 0 ? `${stepName}, ${statusWord}` : stepName;
	const indicatorStyle = {
		width: r.indicatorSize,
		height: r.indicatorSize,
		borderRadius: r.indicatorRadius,
		borderWidth: t.borderWidthFocus,
		borderColor: status === "error" ? t.colorStatusDangerIcon : status === "complete" || status === "current" ? t.colorControlSelectedBackground : t.colorBorderStrong,
		backgroundColor: status === "error" ? t.colorStatusDangerBackground : status === "complete" ? t.colorControlSelectedBackground : r.indicatorBackground,
		alignItems: "center",
		justifyContent: "center"
	};
	const numeralStyle = {
		fontFamily: r.fontFamily,
		fontSize: r.indicatorFontSize,
		fontWeight: toFontWeight(r.indicatorFontWeight),
		color: t.colorForeground
	};
	const iconSize = overrides?.indicatorFontSize ?? "font.size.sm";
	const indicator = /* @__PURE__ */ React.createElement(View, {
		testID: "Stepper.indicator",
		style: indicatorStyle,
		accessibilityElementsHidden: true,
		importantForAccessibility: "no"
	}, status === "complete" ? /* @__PURE__ */ React.createElement(Icon, {
		name: "check",
		size: "sm",
		overrides: {
			color: "color.control.selectedForeground",
			size: iconSize
		}
	}) : status === "error" ? /* @__PURE__ */ React.createElement(Icon, {
		name: "danger",
		size: "sm",
		overrides: {
			color: "color.status.danger.foreground",
			size: iconSize
		}
	}) : /* @__PURE__ */ React.createElement(Text$1, { style: numeralStyle }, n));
	const showLabel = !compact || isCurrent;
	const showDescription = !isHorizontal && step.description !== void 0;
	const textBlock = showLabel || showDescription ? /* @__PURE__ */ React.createElement(View, { style: isHorizontal ? { alignItems: "center" } : {
		flex: 1,
		gap: r.partGap
	} }, showLabel ? /* @__PURE__ */ React.createElement(View, { testID: "Stepper.label" }, /* @__PURE__ */ React.createElement(Text, {
		size: "sm",
		tone: status === "upcoming" ? "muted" : "default",
		overrides: {
			fontSize: overrides?.labelSize,
			fontWeight: isCurrent ? overrides?.labelCurrentWeight ?? "font.weight.semibold" : overrides?.labelWeight ?? "font.weight.medium",
			fontFamily: overrides?.fontFamily
		}
	}, step.label)) : null, showDescription ? /* @__PURE__ */ React.createElement(View, { testID: "Stepper.description" }, /* @__PURE__ */ React.createElement(Text, {
		size: "xs",
		tone: "muted",
		overrides: {
			fontSize: overrides?.descriptionSize,
			fontFamily: overrides?.fontFamily
		}
	}, step.description)) : null) : null;
	const containerStyle = (active) => ({
		...isHorizontal ? { alignItems: "center" } : {
			flexDirection: "row",
			alignItems: "flex-start",
			paddingVertical: r.stepPadding
		},
		paddingHorizontal: r.stepPadding,
		gap: r.partGap,
		minWidth: t.sizeTargetMin,
		minHeight: t.sizeTargetMin,
		borderRadius: r.stepRadius,
		borderWidth: t.borderWidthFocus,
		borderColor: focused ? t.colorBorderFocus : "transparent",
		backgroundColor: active ? r.stepHover : "transparent"
	});
	if (!isNavigable) return /* @__PURE__ */ React.createElement(View, {
		testID: "Stepper.step",
		accessible: true,
		accessibilityLabel: accessibleName,
		accessibilityState: { selected: isCurrent },
		style: containerStyle(false)
	}, indicator, textBlock);
	return /* @__PURE__ */ React.createElement(Pressable, {
		testID: "Stepper.step",
		accessibilityRole: "button",
		accessibilityLabel: accessibleName,
		accessibilityState: { selected: isCurrent },
		onPress: () => onStepSelect?.(step.id),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		onHoverIn: () => setHovered(true),
		onHoverOut: () => setHovered(false),
		style: ({ pressed }) => containerStyle(pressed || hovered)
	}, indicator, textBlock);
}
/** The decorative line filling `stepGap` between two steps; cross-fades to `connectorComplete` once the step before it is passed. */
function Connector({ isHorizontal, complete, reducedMotion, t, r }) {
	const anim = React.useRef(new Animated.Value(complete ? 1 : 0)).current;
	const previous = React.useRef(complete);
	React.useEffect(() => {
		if (previous.current === complete) return;
		previous.current = complete;
		const toValue = complete ? 1 : 0;
		if (reducedMotion) {
			anim.setValue(toValue);
			return;
		}
		const animation = Animated.timing(anim, {
			toValue,
			duration: r.transition,
			easing: toEasing(t.motionEasingStandard),
			useNativeDriver: false
		});
		animation.start();
		return () => animation.stop();
	}, [
		complete,
		reducedMotion,
		r.transition,
		anim,
		t.motionEasingStandard
	]);
	const backgroundColor = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [r.connector, t.colorControlSelectedBackground]
	});
	const track = isHorizontal ? {
		width: r.stepGap,
		height: r.indicatorSize,
		paddingTop: t.borderWidthFocus,
		boxSizing: "content-box",
		justifyContent: "center"
	} : {
		width: r.indicatorSize,
		height: r.stepGap,
		paddingLeft: t.borderWidthFocus + r.stepPadding,
		boxSizing: "content-box",
		alignItems: "center"
	};
	const line = isHorizontal ? {
		alignSelf: "stretch",
		height: t.borderWidthFocus,
		backgroundColor
	} : {
		flex: 1,
		width: t.borderWidthFocus,
		backgroundColor
	};
	return /* @__PURE__ */ React.createElement(View, {
		testID: "Stepper.connector",
		accessibilityElementsHidden: true,
		importantForAccessibility: "no",
		style: track
	}, /* @__PURE__ */ React.createElement(Animated.View, { style: line }));
}
//#endregion
export { Accordion, ActionSheet, Alert, AlertDialog, BottomSheet, Box, Breadcrumb, Button, Card, Carousel, CarouselSlide, Checkbox, Combobox, Container, DataGrid, DatePicker, Dialog, Disclosure, Divider, Feed, Fieldset, FieldsetContext, FocusScope, Form, FormContext, Heading, Icon, Input, Landmark, Link, Listbox, Menu, Meter, NumberInput, Popover, ProgressBar, RadioGroup, Search, SegmentedControl, Select, SidePanel, Slider, Splitter, Stack, Stepper, Switch, TabPanel, Table, Tabs, Text, TextStyleContext, ThemeProvider, Toast, ToastProvider, Toolbar, ToolbarGroup, Tooltip, Tree, TreeGrid, toEasing, toFontWeight, toLineHeight, toTextAlign, toast, useFieldsetContext, useFormContext, useReducedMotion, useSidePanelEdgeSwipe, useTheme, useToast };

//# sourceMappingURL=index.js.map