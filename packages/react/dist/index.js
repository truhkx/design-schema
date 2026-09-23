import { Children, Fragment, cloneElement, createContext, createElement, isValidElement, use, useCallback, useContext, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cssVar } from "@design-schema/tokens";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { createPortal, flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
//#region src/FormContext.ts
const FormContext = createContext(null);
/** Returns the enclosing Form's context, or `null` outside a Form. */
function useFormContext() {
	return useContext(FormContext);
}
//#endregion
//#region src/custom/analytics.ts
function trackPress(name, label) {
	if (process.env.NODE_ENV !== "production") console.debug("[analytics] press", name, label);
}
//#endregion
//#region src/Button.tsx
/** Copy from the component doc, used verbatim. */
const COPY$33 = { loading: "Loading" };
const OVERRIDE_HOOK$34 = {
	iconGap: "--ds-button-icon-gap",
	paddingInline: "--ds-button-padding-inline",
	paddingBlock: "--ds-button-padding-block",
	radius: "--ds-button-radius",
	fontFamily: "--ds-button-font-family",
	fontWeight: "--ds-button-font-weight",
	fontSize: "--ds-button-font-size",
	inverseBackgroundHover: "--ds-button-inverse-background-hover",
	inverseHoverOpacity: "--ds-button-inverse-hover-opacity",
	disabledOpacity: "--ds-button-disabled-opacity",
	transition: "--ds-button-transition",
	loadingSpin: "--ds-button-loading-spin",
	spinnerSize: "--ds-button-spinner-size"
};
function overridesToStyle$28(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$34[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
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
function Button({ ref, label, variant = "primary", size = "md", leadingIcon, trailingIcon, type = "button", expanded, disabled = false, accessibleName, overflowLabel: _overflowLabel, iconOnly = false, loading = false, inverse = false, track, overrides, onClick, onTrack, "aria-expanded": ariaExpanded, "aria-describedby": describedBy, ...props }) {
	const { className: _className, style: _style, ...rest } = props;
	const form = useFormContext();
	const loadingId = `ds-button${useId()}-loading`;
	const isDisabled = disabled || (form?.disabled ?? false);
	const blocked = isDisabled || loading;
	const handleClick = (event) => {
		if (blocked) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onClick?.(event);
		if (track) {
			trackPress(track, label);
			onTrack?.(track, label);
		}
	};
	const classes = [
		"ds-button",
		`ds-button--${variant}`,
		`ds-button--${size}`,
		iconOnly ? "ds-button--icon-only" : null,
		inverse ? "ds-button--inverse" : null
	].filter(Boolean).join(" ");
	const describedByValue = loading ? [describedBy, loadingId].filter(Boolean).join(" ") : describedBy;
	const hasLeading = leadingIcon !== void 0 && leadingIcon !== null;
	const hasTrailing = trailingIcon !== void 0 && trailingIcon !== null;
	return /* @__PURE__ */ jsxs("button", {
		...rest,
		ref,
		type,
		"data-ds": "Button",
		"data-part": "container",
		className: classes,
		style: overrides ? overridesToStyle$28(overrides) : void 0,
		"aria-disabled": isDisabled ? "true" : void 0,
		"aria-busy": loading ? "true" : void 0,
		"aria-label": accessibleName ?? (iconOnly ? label : void 0),
		"aria-expanded": expanded ?? ariaExpanded,
		"aria-describedby": describedByValue || void 0,
		onClick: handleClick,
		children: [
			loading ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__spinner",
				"aria-hidden": "true"
			}) : hasLeading ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__icon",
				"data-part": "leadingIcon",
				"aria-hidden": "true",
				children: leadingIcon
			}) : null,
			iconOnly ? null : /* @__PURE__ */ jsx("span", {
				className: "ds-button__label",
				"data-part": "label",
				children: label
			}),
			!loading && !iconOnly && hasTrailing ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__icon",
				"data-part": "trailingIcon",
				"aria-hidden": "true",
				children: trailingIcon
			}) : null,
			loading ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__visually-hidden",
				id: loadingId,
				"aria-hidden": "true",
				children: COPY$33.loading
			}) : null
		]
	});
}
//#endregion
//#region src/Heading.tsx
const OVERRIDE_HOOK$33 = {
	fontFamily: "--ds-heading-font-family",
	fontWeight: "--ds-heading-font-weight",
	fontSize: "--ds-heading-font-size",
	lineHeight: "--ds-heading-line-height",
	marginBlockEnd: "--ds-heading-margin-block-end"
};
function overridesToStyle$27(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$33[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
const ELEMENT_BY_LEVEL = {
	"1": "h1",
	"2": "h2",
	"3": "h3",
	"4": "h4",
	"5": "h5",
	"6": "h6"
};
const SIZE_BY_LEVEL = {
	"1": "4xl",
	"2": "3xl",
	"3": "2xl",
	"4": "xl",
	"5": "lg",
	"6": "md"
};
function isLevel(value) {
	return Object.hasOwn(ELEMENT_BY_LEVEL, value);
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
function Heading({ ref, level, size, children, align = "start", overrides, ...rest }) {
	const raw = String(level);
	const valid = isLevel(raw);
	const key = valid ? raw : "2";
	const warnedRef = useRef(false);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !valid && !warnedRef.current) {
			warnedRef.current = true;
			console.warn(`Heading: level ${raw} is not one of 1–6; rendering as level 2.`);
		}
	}, [valid, raw]);
	const Tag = ELEMENT_BY_LEVEL[key];
	const classes = `ds-heading ds-heading--size-${size ?? SIZE_BY_LEVEL[key]} ds-heading--align-${align}`;
	const style = overrides ? overridesToStyle$27(overrides) : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		"data-part": "text",
		...rest,
		ref,
		"data-ds": "Heading",
		className: classes,
		style,
		children
	});
}
//#endregion
//#region src/Text.tsx
const OVERRIDE_HOOK$32 = {
	fontFamily: "--ds-text-font-family",
	fontSize: "--ds-text-font-size",
	fontWeight: "--ds-text-font-weight",
	lineHeight: "--ds-text-line-height"
};
function overridesToStyle$26(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$32[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** tone → color.foreground.{tone}; `default` is the bare `color.foreground` token. */
const TONE_CLASS = {
	default: "ds-text--tone-default",
	strong: "ds-text--tone-strong",
	muted: "ds-text--tone-muted",
	danger: "ds-text--tone-danger",
	onAction: "ds-text--tone-on-action"
};
/**
* Text — Design Schema, category: typography.
*
* When to use:
* Use Text for paragraphs, labels, captions, helper text, and any inline copy. Pick `size` from
* the scale rather than styling a raw element, and use `tone` for meaning: `muted` for secondary
* information, `danger` for errors, `strong` when a phrase must stand out from surrounding body
* copy. Use `weight` to create hierarchy inside a size; it is calmer than jumping sizes.
*/
function Text({ ref, children, size = "md", weight = "regular", tone = "default", align = "start", truncate = false, element = "p", overrides, title, className, style, ...rest }) {
	const Tag = element;
	const resolvedTitle = title ?? (truncate && typeof children === "string" ? children : void 0);
	const classes = [
		"ds-text",
		`ds-text--size-${size}`,
		`ds-text--weight-${weight}`,
		TONE_CLASS[tone],
		`ds-text--align-${align}`,
		truncate ? "ds-text--truncate" : null,
		truncate && element === "span" ? "ds-text--truncate-inline" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$26(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		"data-ds": "Text",
		className: classes,
		style: mergedStyle,
		title: resolvedTitle,
		children
	});
}
//#endregion
//#region src/Input.tsx
/** copy.* — used verbatim; `{label}` is replaced by the visible label. */
const COPY$32 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
/** Hooks on the root. `helperSize` has none: it is forwarded to the description and error Text
* elements' `fontSize`. `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept
* here for the label and the `<input>`, which are not Text. */
const ROOT_OVERRIDE_HOOK$7 = {
	borderInvalid: "--ds-input-border-invalid",
	borderWidth: "--ds-input-border-width",
	radius: "--ds-input-radius",
	paddingInline: "--ds-input-padding-inline",
	paddingBlock: "--ds-input-padding-block",
	partGap: "--ds-input-part-gap",
	fontFamily: "--ds-input-font-family",
	fontSize: "--ds-input-font-size",
	labelWeight: "--ds-input-label-weight",
	lineHeight: "--ds-input-line-height",
	disabledOpacity: "--ds-input-disabled-opacity",
	transition: "--ds-input-transition"
};
function resolveOverrides$11(overrides) {
	const rootStyle = {};
	const helperOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "lineHeight") helperOverrides.lineHeight = ref;
		const hook = ROOT_OVERRIDE_HOOK$7[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		helperOverrides
	};
}
/** Browser/type validity other than our own custom message (email, url, number, pattern, length). */
function failsTypeValidity(el) {
	const v = el.validity;
	return v.typeMismatch || v.badInput || v.patternMismatch || v.rangeOverflow || v.rangeUnderflow || v.stepMismatch || v.tooLong || v.tooShort;
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
function Input({ ref, label, name, value, defaultValue, placeholder, description, type = "text", required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, autocomplete, overrides, onChange, onFocus, onBlur, readOnly, id: idProp, ...props }) {
	const { className: _className, style: _style, ...rest } = props;
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-input${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
	const isControlled = value !== void 0;
	const currentValue = isControlled ? value : uncontrolledValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const withLabel = (message) => message.replace("{label}", label);
	const formError = form?.errors[name];
	const slotMessage = error !== void 0 && error !== "" ? error : formError !== void 0 && formError !== "" ? formError : invalid || formError !== void 0 ? withLabel(required && currentValue === "" ? COPY$32.required : COPY$32.invalid) : void 0;
	const isInvalid = slotMessage !== void 0;
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		invalid,
		error
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		invalid,
		error
	};
	/** The full precedence: `error` → required → invalid → browser/type validity (as copy.invalid). */
	const validationMessage = () => {
		const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
		const el = inputRef.current;
		const fieldValue = el?.value ?? "";
		if (errorProp !== void 0 && errorProp !== "") return errorProp;
		if (isRequired && fieldValue === "") return COPY$32.required.replace("{label}", currentLabel);
		if (isInvalidProp) return COPY$32.invalid.replace("{label}", currentLabel);
		if (el && failsTypeValidity(el)) return COPY$32.invalid.replace("{label}", currentLabel);
		return null;
	};
	const validationRef = useRef(validationMessage);
	validationRef.current = validationMessage;
	useEffect(() => {
		const el = inputRef.current;
		if (!el) return;
		const message = isDisabled ? "" : validationRef.current() ?? "";
		if (el.validationMessage !== message) el.setCustomValidity(message);
	});
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.disabled ? void 0 : inputRef.current?.value ?? "",
			isDisabled: () => latest.current.disabled,
			validate: () => validationRef.current(),
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const describedBy = [description ? descriptionId : null, isInvalid ? errorId : null].filter(Boolean).join(" ");
	const validateMode = form ? form.validateMode ?? form.validate : void 0;
	const afterFailedSubmit = form?.submitFailed ?? false;
	const validatesOnChange = validateMode === "change" || afterFailedSubmit;
	const validatesOnBlur = validateMode === "blur" || validateMode === "change" || afterFailedSubmit;
	const handleChange = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const next = event.target.value;
		if (!isControlled) setUncontrolledValue(next);
		onChange?.(next);
		if (form && validatesOnChange) form.validateField(name);
	};
	const handleBlur = () => {
		onBlur?.();
		if (form && validatesOnBlur) form.validateField(name);
	};
	const classes = [
		"ds-input",
		`ds-input--${size}`,
		isInvalid ? "ds-input--invalid" : null,
		isDisabled ? "ds-input--disabled" : null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-input__label", hideLabel ? "ds-input__visually-hidden" : null].filter(Boolean).join(" ");
	const { rootStyle, helperOverrides } = overrides ? resolveOverrides$11(overrides) : {
		rootStyle: void 0,
		helperOverrides: void 0
	};
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Input",
		"data-ds-field": true,
		style: rootStyle,
		children: [
			/* @__PURE__ */ jsxs("label", {
				className: labelClasses,
				htmlFor: id,
				"data-part": "label",
				children: [label, required ? COPY$32.requiredIndicator : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				overrides: helperOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsx("input", {
				...rest,
				ref: inputRef,
				id,
				name,
				type,
				value: currentValue,
				placeholder,
				autoComplete: autocomplete,
				className: "ds-input__field",
				"data-part": "field",
				"aria-describedby": describedBy || void 0,
				"aria-invalid": isInvalid ? "true" : void 0,
				"aria-required": required ? "true" : void 0,
				"aria-disabled": isDisabled ? "true" : void 0,
				readOnly: isDisabled ? true : readOnly,
				onChange: handleChange,
				onFocus: () => onFocus?.(),
				onBlur: handleBlur
			}),
			isInvalid ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				overrides: helperOverrides,
				children: slotMessage
			}) : null
		]
	});
}
//#endregion
//#region src/Icon.tsx
const OVERRIDE_HOOK$31 = {
	size: "--ds-icon-size",
	color: "--ds-icon-color"
};
function overridesToStyle$25(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$31[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
const isDev$20 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Glyphs drawn on a 16×16 grid, keyed by `name` — one `<path>` each, with the `d` taken verbatim
* from `tools/icon-paths.json`, the one table every platform draws from (the SwiftUI paths and the
* reference PNGs in `tests/icon-snapshots/` are generated from it, and the SwiftUI gate compares
* pixels). To add or redraw a glyph, change that JSON, not this table.
*
* Line glyphs are bare paths and inherit the root `<svg>`'s `fill="none" stroke="currentColor"`;
* `filled` glyphs (the four status shapes, ellipsis, play, pause) carry
* `fill="currentColor" stroke="none" fill-rule="evenodd"` themselves, so a status shape is a single
* path whose inner mark (i, check, !, ×) is a hole and reads on any surface without a second color.
*
* A module export, not re-exported from the package index: other components render `<Icon name>`.
*/
const paths = {
	check: /* @__PURE__ */ jsx("path", { d: "M3 8.5l3.5 3.5L13 5" }),
	dash: /* @__PURE__ */ jsx("path", { d: "M4 8h8" }),
	"chevron-right": /* @__PURE__ */ jsx("path", { d: "M6 3l5 5-5 5" }),
	"chevron-down": /* @__PURE__ */ jsx("path", { d: "M3 6l5 5 5-5" }),
	"chevron-up": /* @__PURE__ */ jsx("path", { d: "M3 10l5-5 5 5" }),
	"chevron-left": /* @__PURE__ */ jsx("path", { d: "M10 3L5 8l5 5" }),
	close: /* @__PURE__ */ jsx("path", { d: "M3 3l10 10M13 3L3 13" }),
	plus: /* @__PURE__ */ jsx("path", { d: "M8 3v10M3 8h10" }),
	minus: /* @__PURE__ */ jsx("path", { d: "M3 8h10" }),
	info: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
	}),
	success: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
	}),
	warning: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
	}),
	danger: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
	}),
	external: /* @__PURE__ */ jsx("path", { d: "M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" }),
	ellipsis: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
	}),
	search: /* @__PURE__ */ jsx("path", { d: "M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" }),
	"arrow-right": /* @__PURE__ */ jsx("path", { d: "M3 8h10M9 4l4 4-4 4" }),
	"arrow-left": /* @__PURE__ */ jsx("path", { d: "M13 8H3M7 4L3 8l4 4" }),
	calendar: /* @__PURE__ */ jsx("path", { d: "M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" }),
	menu: /* @__PURE__ */ jsx("path", { d: "M2 4h12M2 8h12M2 12h12" }),
	list: /* @__PURE__ */ jsx("path", { d: "M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" }),
	grid: /* @__PURE__ */ jsx("path", { d: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" }),
	play: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M4 2l10 6-10 6z"
	}),
	pause: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		fillRule: "evenodd",
		d: "M3 2h3v12H3zM10 2h3v12H10z"
	}),
	folder: /* @__PURE__ */ jsx("path", { d: "M2 13V2h5v2h7v9z" }),
	file: /* @__PURE__ */ jsx("path", { d: "M4 2h5l3 3v9H4zM9 2v3h3" })
};
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
function Icon({ ref, name, size = "md", inline = false, label, overrides, ...rest }) {
	const labelled = label !== void 0 && label !== "";
	const glyph = Object.hasOwn(paths, name) ? paths[name] : void 0;
	if (isDev$20 && !glyph) console.warn(`Icon: unknown name "${String(name)}"`);
	const classes = inline ? `ds-icon ds-icon--${size} ds-icon--inline` : `ds-icon ds-icon--${size}`;
	return /* @__PURE__ */ jsx("svg", {
		...rest,
		ref,
		"data-ds": "Icon",
		"data-part": "glyph",
		className: classes,
		style: overrides ? overridesToStyle$25(overrides) : void 0,
		viewBox: "0 0 16 16",
		width: "1em",
		height: "1em",
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		focusable: "false",
		role: labelled ? "img" : void 0,
		"aria-label": labelled ? label : void 0,
		"aria-hidden": labelled ? void 0 : "true",
		children: glyph
	});
}
//#endregion
//#region src/Link.tsx
/** Copy strings from the schema, used verbatim. `copy.external` is the SwiftUI accessibility label and unused on web. */
const COPY$31 = { externalSuffix: " (opens in new tab)" };
const OVERRIDE_HOOK$30 = {
	underlineThickness: "--ds-link-underline-thickness",
	underlineOffset: "--ds-link-underline-offset",
	externalIconGap: "--ds-link-external-icon-gap",
	transition: "--ds-link-transition"
};
function overridesToStyle$24(overrides, external) {
	const style = {};
	for (const binding of Object.keys(OVERRIDE_HOOK$30)) {
		if (binding === "externalIconGap" && !external) continue;
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$30[binding]] = cssVar(ref);
	}
	return Object.keys(style).length > 0 ? style : void 0;
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
function Link({ ref, href, label, external = false, tone = "default", download = false, overrides, onClick, ...rest }) {
	const classes = [
		"ds-link",
		`ds-link--tone-${tone}`,
		external ? "ds-link--external" : null
	].filter(Boolean).join(" ");
	const handleClick = (event) => {
		if (onClick?.(event) === false) event.preventDefault();
	};
	return /* @__PURE__ */ jsxs("a", {
		...rest,
		ref,
		href,
		"data-ds": "Link",
		"data-part": "anchor",
		className: classes,
		style: overrides ? overridesToStyle$24(overrides, external) : void 0,
		target: external ? "_blank" : void 0,
		rel: external ? "noopener noreferrer" : void 0,
		download: download ? true : void 0,
		onClick: handleClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ds-link__label",
			"data-part": "label",
			children: label
		}), external ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
			className: "ds-link__external-suffix",
			children: COPY$31.externalSuffix
		}), /* @__PURE__ */ jsx("span", {
			className: "ds-link__external-icon",
			"data-part": "externalIcon",
			children: /* @__PURE__ */ jsx(Icon, {
				name: "external",
				inline: true
			})
		})] }) : null]
	});
}
//#endregion
//#region src/Stack.tsx
const OVERRIDE_HOOK$29 = { gap: "--ds-stack-gap" };
function overridesToStyle$23(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$29[binding]] = cssVar(ref);
	}
	return style;
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
function Stack({ ref, children, direction = "vertical", gap = "normal", align = "stretch", justify = "start", wrap = false, element = "div", overrides, className, style, ...rest }) {
	const Tag = element;
	const isList = element === "ul" || element === "ol";
	const classes = [
		"ds-stack",
		`ds-stack--${direction}`,
		`ds-stack--gap-${gap}`,
		`ds-stack--align-${align}`,
		`ds-stack--justify-${justify}`,
		wrap ? "ds-stack--wrap" : null,
		isList ? "ds-stack--list" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$23(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const role = isList ? "list" : rest.role;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		role,
		"data-ds": "Stack",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: isList ? Children.map(children, (child) => child === null || child === void 0 || typeof child === "boolean" ? null : /* @__PURE__ */ jsx("li", {
			role: "listitem",
			"data-part": "item",
			className: "ds-stack__item",
			children: child
		})) : children
	});
}
//#endregion
//#region src/Form.tsx
/**
* copy.* — used verbatim. `summaryHeading` is selected by `Intl.PluralRules` on `count`;
* `summaryHeadingOne` and `invalidSummary` are not rendered on web.
*/
const COPY$30 = {
	summaryHeading: {
		one: "1 problem with this form",
		other: "{count} problems with this form"
	},
	summaryHeadingOne: "1 problem with this form",
	invalidSummary: "This form has errors."
};
/**
* The summary heading, pluralised by `count` in `locale` — the nearest `lang` ancestor at the failed
* submit. A tag `Intl.PluralRules` rejects falls back to the runtime default locale rather than throwing.
*/
function summaryHeading(count, locale) {
	let rules;
	try {
		rules = new Intl.PluralRules(locale);
	} catch {
		rules = new Intl.PluralRules();
	}
	return (rules.select(count) === "one" ? COPY$30.summaryHeading.one : COPY$30.summaryHeading.other).replace("{count}", String(count));
}
/** CSS hooks written inline. `errorSummaryGap` is absent: it is forwarded to the summary's Stack `gap`. */
const OVERRIDE_HOOK$28 = {
	gap: "--ds-form-gap",
	errorSummaryBorder: "--ds-form-error-summary-border",
	errorSummaryBorderWidth: "--ds-form-error-summary-border-width",
	errorSummaryRadius: "--ds-form-error-summary-radius",
	errorSummaryPadding: "--ds-form-error-summary-padding"
};
function overridesToStyle$22(overrides) {
	const style = {};
	for (const binding of Object.keys(OVERRIDE_HOOK$28)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$28[binding]] = cssVar(ref);
	}
	return Object.keys(style).length > 0 ? style : void 0;
}
/** A null, empty-string or empty-array value contributes no key to `onSubmit`; `false` and `0` are values. */
function isEmptyValue(value) {
	return value === null || value === "" || Array.isArray(value) && value.length === 0;
}
function shallowEqual(a, b) {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	return aKeys.every((key) => a[key] === b[key]);
}
/**
* Form — Design Schema, category: container.
*
* When to use:
* Use Form whenever two or more fields are submitted together, and for any single field whose
* submission has consequences (sign-in, search with side effects). Place actions (submit, cancel)
* at the end in a Stack. Give the form a `label` when the page contains more than one.
*/
function Form({ ref, children, actions, name, label, labelledBy, validate = "submit", disabled = false, errorSummary = true, overrides, onSubmit, onInvalid, ...rest }) {
	const formRef = useRef(null);
	useImperativeHandle(ref, () => formRef.current, []);
	const generatedId = useId();
	const idBase = name ?? `ds-form${generatedId}`;
	const summaryId = `${idBase}-error-summary`;
	const fieldsRef = useRef(/* @__PURE__ */ new Map());
	const knownFieldsRef = useRef(/* @__PURE__ */ new Map());
	const [errors, setErrors] = useState({});
	const [failedSubmissions, setFailedSubmissions] = useState(0);
	const submitFailed = failedSubmissions > 0;
	const [locale, setLocale] = useState(void 0);
	const summaryRef = useRef(null);
	const register = useCallback((field) => {
		fieldsRef.current.set(field.name, field);
		knownFieldsRef.current.set(field.name, field);
		return () => {
			if (fieldsRef.current.get(field.name) === field) fieldsRef.current.delete(field.name);
		};
	}, []);
	/**
	* Registered fields in document order, sorted by the position of each field's `data-ds-field`
	* host — `getElementById(id).closest('[data-ds-field]')`. Fields whose host is not found keep
	* their registration order at the end. A field inside a closed Disclosure has unmounted and
	* unregistered, so it is simply absent; Form does no Disclosure check of its own.
	*/
	const orderedFields = useCallback(() => {
		const fields = [...fieldsRef.current.values()];
		const root = formRef.current;
		if (!root) return fields;
		const hosts = [...root.querySelectorAll("[data-ds-field]")];
		const position = /* @__PURE__ */ new Map();
		for (const field of fields) {
			const host = root.ownerDocument.getElementById(field.id)?.closest("[data-ds-field]");
			const index = host ? hosts.indexOf(host) : -1;
			position.set(field, index === -1 ? Number.POSITIVE_INFINITY : index);
		}
		return fields.sort((a, b) => {
			const pa = position.get(a);
			const pb = position.get(b);
			return pa === pb ? 0 : pa < pb ? -1 : 1;
		});
	}, []);
	/** The enabled fields in document order, by name — a disabled field is skipped, so "next" passes it by. */
	const order = useCallback(() => orderedFields().filter((field) => !field.isDisabled()).map((field) => field.name), [orderedFields]);
	/**
	* Validates every enabled field once, collecting its message or its value in the same pass.
	* A disabled field is skipped entirely: no validation, no key in the values.
	*/
	const runValidation = useCallback(() => {
		const nextErrors = {};
		const values = {};
		let firstInvalid = null;
		for (const field of orderedFields()) {
			if (field.isDisabled()) continue;
			const message = field.validate();
			if (message !== null) {
				nextErrors[field.name] = message;
				firstInvalid ??= field;
			} else {
				const fieldValue = field.getValue();
				if (fieldValue !== void 0 && !isEmptyValue(fieldValue)) values[field.name] = fieldValue;
			}
		}
		return {
			errors: nextErrors,
			values,
			firstInvalid
		};
	}, [orderedFields]);
	/** Reports a failed validation: the plural locale, the summary counter, `onInvalid`, then focus. */
	const reportFailure = useCallback((nextErrors, firstInvalid) => {
		const lang = formRef.current?.closest("[lang]")?.getAttribute("lang");
		setLocale(lang ? lang : void 0);
		setFailedSubmissions((count) => count + 1);
		onInvalid?.(nextErrors);
		if (!errorSummary) firstInvalid.focus();
	}, [errorSummary, onInvalid]);
	const reportValidity = useCallback(() => {
		const pass = runValidation();
		setErrors((prev) => shallowEqual(prev, pass.errors) ? prev : pass.errors);
		if (pass.firstInvalid === null) return true;
		reportFailure(pass.errors, pass.firstInvalid);
		return false;
	}, [runValidation, reportFailure]);
	const validateField = useCallback((fieldName) => {
		if (validate === "submit" && !submitFailed) return;
		const field = fieldsRef.current.get(fieldName);
		if (!field) return;
		const message = field.isDisabled() ? null : field.validate();
		setErrors((prev) => {
			const hasPrev = Object.prototype.hasOwnProperty.call(prev, fieldName);
			if (message === null) {
				if (!hasPrev) return prev;
				const next = { ...prev };
				delete next[fieldName];
				return next;
			}
			if (hasPrev && prev[fieldName] === message) return prev;
			return {
				...prev,
				[fieldName]: message
			};
		});
	}, [validate, submitFailed]);
	const handleSubmit = (event) => {
		event.preventDefault();
		if (disabled) return;
		const pass = runValidation();
		setErrors((prev) => shallowEqual(prev, pass.errors) ? prev : pass.errors);
		if (pass.firstInvalid !== null) {
			reportFailure(pass.errors, pass.firstInvalid);
			return;
		}
		setFailedSubmissions(0);
		onSubmit?.(pass.values);
	};
	useEffect(() => {
		if (failedSubmissions > 0 && errorSummary) summaryRef.current?.focus();
	}, [failedSubmissions, errorSummary]);
	const contextValue = useMemo(() => ({
		disabled,
		validateMode: validate,
		submitFailed,
		errorSummary,
		validate,
		idBase,
		errors,
		order,
		register,
		validateField,
		reportValidity
	}), [
		disabled,
		validate,
		submitFailed,
		errorSummary,
		idBase,
		errors,
		order,
		register,
		validateField,
		reportValidity
	]);
	const errorEntries = Object.entries(errors);
	const showSummary = errorSummary && failedSubmissions > 0 && errorEntries.length > 0;
	const summaryGap = overrides?.errorSummaryGap ? { gap: overrides.errorSummaryGap } : void 0;
	return /* @__PURE__ */ jsx(FormContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsxs("form", {
			...rest,
			ref: formRef,
			name,
			"data-ds": "Form",
			"data-part": "container",
			className: "ds-form",
			style: overrides ? overridesToStyle$22(overrides) : void 0,
			noValidate: true,
			"aria-label": labelledBy ? void 0 : label,
			"aria-labelledby": labelledBy,
			onSubmit: handleSubmit,
			children: [
				showSummary ? /* @__PURE__ */ jsx("div", {
					ref: summaryRef,
					id: summaryId,
					"data-part": "errorSummary",
					className: "ds-form__error-summary",
					role: "alert",
					tabIndex: -1,
					children: /* @__PURE__ */ jsxs(Stack, {
						gap: "tight",
						overrides: summaryGap,
						children: [/* @__PURE__ */ jsx(Text, {
							element: "p",
							weight: "semibold",
							tone: "danger",
							children: summaryHeading(errorEntries.length, locale)
						}), /* @__PURE__ */ jsx(Stack, {
							element: "ul",
							gap: "tight",
							overrides: summaryGap,
							children: errorEntries.map(([fieldName, message]) => {
								const field = fieldsRef.current.get(fieldName);
								const known = field ?? knownFieldsRef.current.get(fieldName);
								const text = message !== "" ? message : known?.label ? known.label : fieldName;
								return field ? /* @__PURE__ */ jsx(Link, {
									href: `#${field.id}`,
									label: text,
									tone: "inherit",
									onClick: () => {
										field.focus();
										return false;
									}
								}, fieldName) : /* @__PURE__ */ jsx(Text, {
									element: "span",
									tone: "danger",
									children: text
								}, fieldName);
							})
						})]
					})
				}) : null,
				/* @__PURE__ */ jsx("div", {
					className: "ds-form__fields",
					"data-part": "fields",
					children
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ds-form__actions",
					"data-part": "actions",
					children: actions
				})
			]
		})
	});
}
//#endregion
//#region src/Box.tsx
const OVERRIDE_HOOK$27 = {
	paddingBlock: "--ds-box-padding-block",
	paddingInline: "--ds-box-padding-inline",
	border: "--ds-box-border",
	borderWidth: "--ds-box-border-width",
	radius: "--ds-box-radius"
};
function overridesToStyle$21(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$27[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
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
function Box({ ref, children, inset = "none", insetBlock, insetInline, surface = "none", border = false, radius = "none", element = "div", overrides, className, style, ...rest }) {
	const Tag = element;
	const classes = [
		"ds-box",
		`ds-box--inset-${inset}`,
		insetBlock !== void 0 ? `ds-box--inset-block-${insetBlock}` : null,
		insetInline !== void 0 ? `ds-box--inset-inline-${insetInline}` : null,
		`ds-box--surface-${surface}`,
		border ? "ds-box--border" : null,
		`ds-box--radius-${radius}`,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$21(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		"data-part": "surface",
		...rest,
		ref,
		"data-ds": "Box",
		className: classes,
		style: mergedStyle,
		children
	});
}
//#endregion
//#region src/Checkbox.tsx
/**
* copy.* — used verbatim; `{label}` is replaced by the visible label. `checked`, `unchecked` and
* `mixed` are SwiftUI-only spoken values; on web the native checked state and
* `aria-checked="mixed"` carry the state.
*/
const COPY$29 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)",
	checked: "Checked",
	unchecked: "Unchecked",
	mixed: "Mixed"
};
/** The indicator binding's locked token, reaching the composed Icon only through its `color` override. */
const INDICATOR_COLOR = "color.control.selectedForeground";
/**
* helperSize has no hook: it reaches the description and error Texts only through their `fontSize`
* override. fontFamily and lineHeight are both a hook (the label's own rule) and a forward.
*/
const OVERRIDE_HOOK$26 = {
	controlBackground: "--ds-checkbox-control-background",
	controlBorderWidth: "--ds-checkbox-control-border-width",
	pressedOverlay: "--ds-checkbox-pressed-overlay",
	controlBorderInvalid: "--ds-checkbox-control-border-invalid",
	controlSize: "--ds-checkbox-control-size",
	controlRadius: "--ds-checkbox-control-radius",
	gap: "--ds-checkbox-gap",
	partGap: "--ds-checkbox-part-gap",
	labelSize: "--ds-checkbox-label-size",
	labelWeight: "--ds-checkbox-label-weight",
	fontFamily: "--ds-checkbox-font-family",
	lineHeight: "--ds-checkbox-line-height",
	disabledOpacity: "--ds-checkbox-disabled-opacity",
	transition: "--ds-checkbox-transition"
};
function resolveOverrides$10(overrides) {
	const rootStyle = {};
	const helperOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "lineHeight") helperOverrides.lineHeight = ref;
		const hook = OVERRIDE_HOOK$26[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		helperOverrides
	};
}
/**
* Checkbox — Design Schema, category: input.
*
* When to use:
* Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several, each with its own `name`, when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.
*/
function Checkbox({ ref, label, hideLabel = false, name, value = "on", checked, defaultChecked = false, indeterminate = false, disabled = false, required = false, invalid = false, description, error, overrides, onChange, onClick, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-checkbox${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const inputRef = useRef(null);
	const labelRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isControlled = checked !== void 0;
	const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
	const isChecked = isControlled ? checked : uncontrolledChecked;
	const isDisabled = disabled || (form?.disabled ?? false);
	useEffect(() => {
		const el = inputRef.current;
		if (el && el.checked !== isChecked) el.checked = isChecked;
	}, [isChecked]);
	const [mixedCleared, setMixedCleared] = useState(false);
	const [lastIndeterminate, setLastIndeterminate] = useState(indeterminate);
	if (lastIndeterminate !== indeterminate) {
		setLastIndeterminate(indeterminate);
		setMixedCleared(false);
	}
	const isMixed = indeterminate && !mixedCleared;
	useEffect(() => {
		const el = inputRef.current;
		if (el && el.indeterminate !== isMixed) el.indeterminate = isMixed;
	}, [isMixed]);
	const invalidMessage = invalid ? (required && !isChecked ? COPY$29.required : COPY$29.invalid).replace("{label}", label) : void 0;
	const resolvedError = error ?? form?.errors[name] ?? invalidMessage;
	const isInvalid = invalid || resolvedError !== void 0;
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		invalid,
		error
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		invalid,
		error
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => inputRef.current?.checked ?? false,
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				if (isRequired && !inputRef.current?.checked) return COPY$29.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$29.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const validateMode = form ? form.validateMode ?? form.validate : void 0;
	const validatesOnChange = validateMode === "blur" || validateMode === "change" || (form?.submitFailed ?? false);
	const handleClick = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		onClick?.(event);
	};
	const handleChange = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const next = event.target.checked;
		if (isControlled) event.target.checked = isChecked;
		else setUncontrolledChecked(next);
		if (isMixed) setMixedCleared(true);
		onChange?.(next);
		if (form && validatesOnChange) form.validateField(name);
	};
	const handleRowClick = (event) => {
		const target = event.target;
		if (inputRef.current?.contains(target) || labelRef.current?.contains(target)) return;
		if (!isDisabled) inputRef.current?.click();
	};
	const classes = [
		"ds-checkbox",
		isInvalid ? "ds-checkbox--invalid" : null,
		isDisabled ? "ds-checkbox--disabled" : null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-checkbox__label", hideLabel ? "ds-checkbox__label--hidden" : null].filter(Boolean).join(" ");
	const { rootStyle, helperOverrides } = overrides ? resolveOverrides$10(overrides) : {
		rootStyle: void 0,
		helperOverrides: void 0
	};
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Checkbox",
		"data-ds-field": true,
		style: rootStyle,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ds-checkbox__row",
			onClick: handleRowClick,
			children: [/* @__PURE__ */ jsxs("span", {
				className: "ds-checkbox__box",
				children: [/* @__PURE__ */ jsx("input", {
					...rest,
					ref: inputRef,
					id,
					type: "checkbox",
					name,
					value,
					defaultChecked: isChecked,
					className: "ds-checkbox__control",
					"data-part": "control",
					"aria-describedby": describedBy || void 0,
					"aria-invalid": isInvalid ? "true" : void 0,
					"aria-required": required ? "true" : void 0,
					"aria-checked": isMixed ? "mixed" : void 0,
					"aria-disabled": isDisabled ? "true" : void 0,
					onClick: handleClick,
					onChange: handleChange
				}), /* @__PURE__ */ jsx("span", {
					className: "ds-checkbox__indicator",
					"data-part": "indicator",
					"aria-hidden": "true",
					children: isMixed || isChecked ? /* @__PURE__ */ jsx(Icon, {
						name: isMixed ? "dash" : "check",
						size: "xs",
						overrides: { color: INDICATOR_COLOR }
					}) : null
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "ds-checkbox__text",
				children: [/* @__PURE__ */ jsxs("label", {
					ref: labelRef,
					htmlFor: id,
					className: labelClasses,
					"data-part": "label",
					children: [label, required ? COPY$29.requiredIndicator : null]
				}), description ? /* @__PURE__ */ jsx(Text, {
					element: "p",
					id: descriptionId,
					"data-part": "description",
					size: "sm",
					tone: "muted",
					overrides: helperOverrides,
					children: description
				}) : null]
			})]
		}), resolvedError ? /* @__PURE__ */ jsx("div", {
			className: "ds-checkbox__error",
			children: /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				overrides: helperOverrides,
				children: resolvedError
			})
		}) : null]
	});
}
//#endregion
//#region src/Switch.tsx
/**
* helperSize has no hook: like every binding that is only forwarded to a composed child, it reaches
* the description Text through its `fontSize` override alone. fontFamily and lineHeight are both a
* hook (the label's own rule) and a forward.
*/
const OVERRIDE_HOOK$25 = {
	trackWidth: "--ds-switch-track-width",
	trackHeight: "--ds-switch-track-height",
	thumbSize: "--ds-switch-thumb-size",
	thumbInset: "--ds-switch-thumb-inset",
	radius: "--ds-switch-radius",
	gap: "--ds-switch-gap",
	partGap: "--ds-switch-part-gap",
	labelSize: "--ds-switch-label-size",
	labelWeight: "--ds-switch-label-weight",
	fontFamily: "--ds-switch-font-family",
	lineHeight: "--ds-switch-line-height",
	disabledOpacity: "--ds-switch-disabled-opacity",
	transition: "--ds-switch-transition"
};
function resolveOverrides$9(overrides) {
	const rootStyle = {};
	const helperOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "lineHeight") helperOverrides.lineHeight = ref;
		const hook = OVERRIDE_HOOK$25[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		helperOverrides
	};
}
/**
* Switch — Design Schema, category: input.
*
* When to use:
* Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.
*/
function Switch({ ref, label, name, checked, defaultChecked = false, disabled = false, description, labelPosition = "start", overrides, onChange, onClick, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-switch${generatedId}`);
	const descriptionId = `${id}-description`;
	const inputRef = useRef(null);
	const labelRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isControlled = checked !== void 0;
	const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
	const isChecked = isControlled ? checked : uncontrolledChecked;
	const isDisabled = disabled || (form?.disabled ?? false);
	useEffect(() => {
		const el = inputRef.current;
		if (el && el.checked !== isChecked) el.checked = isChecked;
	}, [isChecked]);
	const latest = useRef({
		label,
		disabled: isDisabled,
		checked: isChecked
	});
	latest.current = {
		label,
		disabled: isDisabled,
		checked: isChecked
	};
	useEffect(() => {
		if (!form || !name || isDisabled) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.checked,
			isDisabled: () => latest.current.disabled,
			validate: () => null,
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id,
		isDisabled
	]);
	const handleClick = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		onClick?.(event);
	};
	const handleChange = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const next = event.target.checked;
		if (isControlled) event.target.checked = isChecked;
		else setUncontrolledChecked(next);
		onChange?.(next);
	};
	const handleRowClick = (event) => {
		const target = event.target;
		if (inputRef.current?.contains(target) || labelRef.current?.contains(target)) return;
		if (!isDisabled) inputRef.current?.click();
	};
	const classes = [
		"ds-switch",
		`ds-switch--label-${labelPosition}`,
		isDisabled ? "ds-switch--disabled" : null
	].filter(Boolean).join(" ");
	const { rootStyle, helperOverrides } = overrides ? resolveOverrides$9(overrides) : {
		rootStyle: void 0,
		helperOverrides: void 0
	};
	return /* @__PURE__ */ jsx("div", {
		className: classes,
		"data-ds": "Switch",
		"data-ds-field": true,
		style: rootStyle,
		onClick: handleRowClick,
		children: /* @__PURE__ */ jsxs("div", {
			className: "ds-switch__row",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ds-switch__text",
				children: [/* @__PURE__ */ jsx("label", {
					ref: labelRef,
					htmlFor: id,
					className: "ds-switch__label",
					"data-part": "label",
					children: label
				}), description ? /* @__PURE__ */ jsx(Text, {
					element: "p",
					id: descriptionId,
					"data-part": "description",
					size: "sm",
					tone: "muted",
					overrides: helperOverrides,
					children: description
				}) : null]
			}), /* @__PURE__ */ jsx("span", {
				className: "ds-switch__slot",
				children: /* @__PURE__ */ jsxs("span", {
					className: "ds-switch__track-wrap",
					children: [/* @__PURE__ */ jsx("input", {
						...rest,
						ref: inputRef,
						id,
						type: "checkbox",
						role: "switch",
						name,
						defaultChecked: isChecked,
						className: "ds-switch__control",
						"data-part": "track",
						"aria-checked": isChecked ? "true" : "false",
						"aria-describedby": description ? descriptionId : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						onClick: handleClick,
						onChange: handleChange
					}), /* @__PURE__ */ jsx("span", {
						className: "ds-switch__thumb",
						"data-part": "thumb",
						"aria-hidden": "true"
					})]
				})
			})]
		})
	});
}
//#endregion
//#region src/RadioGroup.tsx
/**
* copy.* — used verbatim; `{label}` is replaced by the legend. `position` is spoken on native only:
* on web the browser announces "1 of 3" from the radios' shared `name`, so it is not rendered.
*/
const COPY$28 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)",
	position: "{index} of {total}"
};
/** helperSize has no root hook: it reaches the composed Text only through its fontSize override. */
const OVERRIDE_HOOK$24 = {
	controlBorderWidth: "--ds-radio-group-control-border-width",
	indicatorInset: "--ds-radio-group-indicator-inset",
	controlBorderInvalid: "--ds-radio-group-control-border-invalid",
	controlSize: "--ds-radio-group-control-size",
	controlRadius: "--ds-radio-group-control-radius",
	optionPaddingBlock: "--ds-radio-group-option-padding-block",
	optionTextGap: "--ds-radio-group-option-text-gap",
	optionGap: "--ds-radio-group-option-gap",
	listGap: "--ds-radio-group-list-gap",
	partGap: "--ds-radio-group-part-gap",
	legendSize: "--ds-radio-group-legend-size",
	legendWeight: "--ds-radio-group-legend-weight",
	labelSize: "--ds-radio-group-label-size",
	labelWeight: "--ds-radio-group-label-weight",
	fontFamily: "--ds-radio-group-font-family",
	lineHeight: "--ds-radio-group-line-height",
	disabledOpacity: "--ds-radio-group-disabled-opacity",
	transition: "--ds-radio-group-transition"
};
function resolveOverrides$8(overrides) {
	const rootStyle = {};
	const helperOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "lineHeight") helperOverrides.lineHeight = ref;
		const hook = OVERRIDE_HOOK$24[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		helperOverrides
	};
}
/** The keys a native radio group moves and selects with; swallowed while the whole group is disabled. */
const GUARDED_KEYS = /* @__PURE__ */ new Set([
	"ArrowDown",
	"ArrowRight",
	"ArrowUp",
	"ArrowLeft",
	" "
]);
/**
* RadioGroup — Design Schema, category: input.
*
* When to use:
* Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.
*/
function RadioGroup({ ref, label, name, options, value, defaultValue, orientation = "vertical", required = false, invalid = false, disabled = false, description, error, overrides, onChange, onBlur, onKeyDown, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-radio-group${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const fieldsetRef = useRef(null);
	useImperativeHandle(ref, () => fieldsetRef.current, []);
	const radioRefs = useRef(/* @__PURE__ */ new Map());
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selected = isControlled ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const invalidCopy = required && selected === void 0 ? COPY$28.required : COPY$28.invalid;
	const resolvedError = error ?? form?.errors[name] ?? (invalid ? invalidCopy.replace("{label}", label) : void 0);
	const isInvalid = invalid || resolvedError !== void 0;
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		invalid,
		error,
		selected,
		options
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		invalid,
		error,
		selected,
		options
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.selected,
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp, selected: current } = latest.current;
				if (errorProp !== void 0) return errorProp;
				if (isRequired && current === void 0) return COPY$28.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$28.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => {
				const { selected: current, options: currentOptions } = latest.current;
				const target = current ?? currentOptions.find((option) => !option.disabled)?.value;
				if (target !== void 0) radioRefs.current.get(target)?.focus();
			}
		});
	}, [
		form,
		name,
		id
	]);
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const validateMode = form ? form.validateMode ?? form.validate : void 0;
	const validatesOnChange = validateMode === "change" || (form?.submitFailed ?? false);
	const validatesOnBlur = validateMode === "blur" || (form?.submitFailed ?? false);
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (isDisabled && GUARDED_KEYS.has(event.key)) event.preventDefault();
	};
	const handleClick = (event) => {
		if (isDisabled) event.preventDefault();
	};
	const handleChange = (option) => (event) => {
		if (isDisabled || option.disabled) {
			event.preventDefault();
			return;
		}
		if (!isControlled) setInternalValue(option.value);
		onChange?.(option.value);
		if (form && validatesOnChange) form.validateField(name);
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (event.relatedTarget && fieldsetRef.current?.contains(event.relatedTarget)) return;
		if (form && validatesOnBlur) form.validateField(name);
	};
	const handleRowClick = (option) => (event) => {
		if (event.target.closest("input, label")) return;
		if (!isDisabled && !option.disabled) radioRefs.current.get(option.value)?.click();
	};
	const setRadioRef = (optionValue) => (el) => {
		if (el) radioRefs.current.set(optionValue, el);
		else radioRefs.current.delete(optionValue);
	};
	const classes = [
		"ds-radio-group",
		`ds-radio-group--${orientation}`,
		isInvalid ? "ds-radio-group--invalid" : null,
		isDisabled ? "ds-radio-group--disabled" : null
	].filter(Boolean).join(" ");
	const { rootStyle, helperOverrides } = overrides ? resolveOverrides$8(overrides) : {
		rootStyle: void 0,
		helperOverrides: void 0
	};
	return /* @__PURE__ */ jsxs("fieldset", {
		...rest,
		ref: fieldsetRef,
		id,
		role: "radiogroup",
		"data-ds": "RadioGroup",
		"data-ds-field": true,
		"data-part": "group",
		className: classes,
		style: rootStyle,
		"aria-describedby": describedBy || void 0,
		"aria-invalid": isInvalid ? "true" : void 0,
		"aria-required": required ? "true" : void 0,
		"aria-disabled": isDisabled ? "true" : void 0,
		onBlur: handleBlur,
		onKeyDown: handleKeyDown,
		children: [
			/* @__PURE__ */ jsxs("legend", {
				className: "ds-radio-group__legend",
				"data-part": "legend",
				children: [label, required ? COPY$28.requiredIndicator : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-radio-group__description",
				overrides: helperOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "ds-radio-group__list",
				children: options.map((option) => {
					const optionId = `${id}-${option.value}`;
					const optionDescriptionId = `${optionId}-description`;
					const optionClasses = ["ds-radio-group__option", option.disabled ? "ds-radio-group__option--disabled" : null].filter(Boolean).join(" ");
					return /* @__PURE__ */ jsxs("div", {
						className: optionClasses,
						onClick: handleRowClick(option),
						children: [
							/* @__PURE__ */ jsx("input", {
								ref: setRadioRef(option.value),
								id: optionId,
								type: "radio",
								name,
								value: option.value,
								"data-part": "radio",
								checked: selected === option.value,
								className: "ds-radio-group__control",
								disabled: option.disabled === true,
								"aria-describedby": option.description ? optionDescriptionId : void 0,
								"aria-disabled": isDisabled ? "true" : void 0,
								onClick: handleClick,
								onChange: handleChange(option)
							}),
							/* @__PURE__ */ jsx("label", {
								htmlFor: optionId,
								"data-part": "radioLabel",
								className: "ds-radio-group__label",
								children: option.label
							}),
							option.description ? /* @__PURE__ */ jsx(Text, {
								element: "p",
								id: optionDescriptionId,
								"data-part": "radioDescription",
								size: "sm",
								tone: "muted",
								className: "ds-radio-group__option-description",
								overrides: helperOverrides,
								children: option.description
							}) : null
						]
					}, option.value);
				})
			}),
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-radio-group__error",
				overrides: helperOverrides,
				children: resolvedError
			}) : null
		]
	});
}
//#endregion
//#region src/Disclosure.tsx
const OVERRIDE_HOOK$23 = {
	triggerPaddingBlock: "--ds-disclosure-trigger-padding-block",
	triggerPaddingInline: "--ds-disclosure-trigger-padding-inline",
	triggerGap: "--ds-disclosure-trigger-gap",
	triggerFontFamily: "--ds-disclosure-trigger-font-family",
	triggerFontSize: "--ds-disclosure-trigger-font-size",
	triggerFontWeight: "--ds-disclosure-trigger-font-weight",
	triggerLineHeight: "--ds-disclosure-trigger-line-height",
	triggerRadius: "--ds-disclosure-trigger-radius",
	panelPaddingBlock: "--ds-disclosure-panel-padding-block",
	panelPaddingInline: "--ds-disclosure-panel-padding-inline",
	disabledOpacity: "--ds-disclosure-disabled-opacity",
	transition: "--ds-disclosure-transition"
};
function overridesToStyle$20(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$23[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
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
function Disclosure({ ref, summary, children, open, defaultOpen = false, disabled = false, keepMounted = false, headingLevel, overrides, onToggle, id: idProp, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-disclosure${generatedId}`;
	const panelId = `${id}-panel`;
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	useImperativeHandle(ref, () => triggerRef.current, []);
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isOpen = isControlled ? open : internalOpen;
	const panelExists = isOpen || keepMounted;
	const focusWithinPanel = useRef(false);
	useLayoutEffect(() => {
		if (isOpen || !focusWithinPanel.current) return;
		focusWithinPanel.current = false;
		const active = document.activeElement;
		if (active === null || active === document.body || (panelRef.current?.contains(active) ?? false)) triggerRef.current?.focus();
	}, [isOpen]);
	const previousOpenRef = useRef(isOpen);
	const selfEmittedRef = useRef(null);
	const pendingReasonRef = useRef(null);
	useEffect(() => {
		if (previousOpenRef.current === isOpen) return;
		previousOpenRef.current = isOpen;
		const echo = selfEmittedRef.current === isOpen;
		selfEmittedRef.current = null;
		const reason = pendingReasonRef.current;
		pendingReasonRef.current = null;
		if (isControlled) {
			if (!echo) onToggle?.(isOpen, "controlled");
		} else if (reason !== null) onToggle?.(isOpen, reason);
	}, [isOpen]);
	const handleClick = (event) => {
		if (disabled) {
			event.preventDefault();
			return;
		}
		const next = !isOpen;
		const reason = event.detail === 0 ? "keyboard" : "pointer";
		if (isControlled) {
			selfEmittedRef.current = next;
			onToggle?.(next, reason);
		} else {
			pendingReasonRef.current = reason;
			setInternalOpen(next);
		}
	};
	const trigger = /* @__PURE__ */ jsxs("button", {
		...rest,
		ref: triggerRef,
		id,
		type: "button",
		className: "ds-disclosure__trigger",
		"data-part": "trigger",
		"aria-expanded": isOpen ? "true" : "false",
		"aria-controls": panelExists ? panelId : void 0,
		"aria-disabled": disabled ? "true" : void 0,
		onClick: handleClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ds-disclosure__icon",
			"data-part": "triggerIcon",
			children: /* @__PURE__ */ jsx(Icon, {
				name: "chevron-right",
				inline: true
			})
		}), /* @__PURE__ */ jsx("span", {
			className: "ds-disclosure__summary",
			children: summary
		})]
	});
	const HeadingTag = headingLevel !== void 0 ? `h${headingLevel}` : null;
	return /* @__PURE__ */ jsxs("div", {
		className: isOpen ? "ds-disclosure ds-disclosure--open" : "ds-disclosure",
		"data-ds": "Disclosure",
		style: overrides ? overridesToStyle$20(overrides) : void 0,
		children: [HeadingTag ? /* @__PURE__ */ jsx(HeadingTag, {
			className: "ds-disclosure__heading",
			children: trigger
		}) : trigger, panelExists ? /* @__PURE__ */ jsx("div", {
			ref: panelRef,
			id: panelId,
			className: "ds-disclosure__panel",
			"data-part": "panel",
			hidden: !isOpen,
			onFocus: () => {
				focusWithinPanel.current = true;
			},
			onBlur: (event) => {
				const to = event.relatedTarget;
				if (to !== null && !event.currentTarget.contains(to)) focusWithinPanel.current = false;
			},
			children
		}) : null]
	});
}
//#endregion
//#region src/Alert.tsx
const COPY$27 = { dismissLabel: "Dismiss" };
const OVERRIDE_HOOK$22 = {
	border: "--ds-alert-border",
	borderWidth: "--ds-alert-border-width",
	radius: "--ds-alert-radius",
	padding: "--ds-alert-padding",
	gap: "--ds-alert-gap",
	partGap: "--ds-alert-part-gap",
	iconSize: "--ds-alert-icon-size",
	headingSize: "--ds-alert-heading-size",
	headingWeight: "--ds-alert-heading-weight",
	fontFamily: "--ds-alert-font-family",
	fontSize: "--ds-alert-font-size",
	lineHeight: "--ds-alert-line-height",
	dismissMargin: "--ds-alert-dismiss-margin"
};
/** Default token for the `iconSize` binding, forwarded to the Icon as `overrides.size`. */
const ICON_SIZE_TOKEN = "font.size.lg";
function overridesToStyle$19(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$22[binding];
		const ref = overrides[binding];
		if (hook === void 0 || !ref) continue;
		style[hook] = cssVar(ref);
	}
	return style;
}
const FOCUSABLE$1 = "a[href], button, input, select, textarea, [tabindex], [contenteditable]:not([contenteditable=\"false\"])";
/**
* Whether `el` is rendered: neither it nor an ancestor carries `hidden`, `display: none` or
* `visibility: hidden`. Size and layout are not checked — jsdom has none.
*/
function isRendered(el) {
	const view = el.ownerDocument.defaultView;
	for (let node = el; node !== null; node = node.parentElement) {
		if (node.hidden) return false;
		if (view === null) continue;
		const style = view.getComputedStyle(node);
		if (style.display === "none" || style.visibility === "hidden") return false;
	}
	return true;
}
/** A focus candidate outside the alert: not disabled, not inside `inert`, rendered, tabindex ≥ 0 when set. */
function isCandidate(root, el) {
	if (root.contains(el)) return false;
	const tabindex = el.getAttribute("tabindex");
	if (tabindex !== null && Number.parseInt(tabindex, 10) < 0) return false;
	if (el.matches(":disabled") || el.closest("[inert]") !== null) return false;
	return isRendered(el);
}
/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside(root) {
	const candidates = Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE$1)).filter((el) => isCandidate(root, el));
	const isAfter = (el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
	const next = candidates.find(isAfter);
	const previous = next === void 0 ? candidates.filter((el) => !isAfter(el)).pop() : void 0;
	(next ?? previous)?.focus();
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
function Alert({ ref, tone = "info", heading, children, live = "status", dismissible = false, onDismiss, overrides, ...rest }) {
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const headingId = useId();
	const bodyId = useId();
	const hasHeading = heading !== void 0 && heading !== "";
	const handleDismiss = () => {
		if (rootRef.current) focusOutside(rootRef.current);
		onDismiss?.();
	};
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Alert",
		"data-part": "container",
		className: `ds-alert ds-alert--${tone}`,
		"data-has-heading": hasHeading ? "" : void 0,
		style: overrides ? overridesToStyle$19(overrides) : void 0,
		role: live === "off" ? void 0 : live,
		"aria-labelledby": hasHeading ? headingId : bodyId,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "ds-alert__icon",
				"data-part": "icon",
				children: /* @__PURE__ */ jsx(Icon, {
					name: tone,
					overrides: {
						color: `color.status.${tone}.icon`,
						size: overrides?.iconSize ?? ICON_SIZE_TOKEN
					}
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ds-alert__content",
				children: [hasHeading ? /* @__PURE__ */ jsx("p", {
					id: headingId,
					className: "ds-alert__heading",
					"data-part": "heading",
					children: heading
				}) : null, /* @__PURE__ */ jsx("div", {
					id: bodyId,
					className: "ds-alert__body",
					"data-part": "body",
					children
				})]
			}),
			dismissible ? /* @__PURE__ */ jsx("span", {
				className: "ds-alert__dismiss",
				"data-part": "dismissButton",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					label: COPY$27.dismissLabel,
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "close",
						inline: true
					}),
					onClick: handleDismiss
				})
			}) : null
		]
	});
}
//#endregion
//#region src/Landmark.tsx
const isDev$19 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Development warnings, verbatim from the doc. */
const COPY$26 = {
	duplicateMain: "Landmark: role \"main\" appears more than once in this document.",
	missingLabel: "Landmark: role \"{role}\" is only a landmark when it has a label.",
	sharedLabel: "Landmark: two \"{role}\" landmarks share the label \"{label}\"; give each a distinct label.",
	bothUnlabelled: "Landmark: two \"{role}\" landmarks both lack a label; give each a distinct label.",
	labelNotTaken: "Landmark: role \"{role}\" does not take a label; it was not rendered."
};
/** The element each role renders when `as` is not set. */
const DEFAULT_ELEMENT = {
	banner: "header",
	navigation: "nav",
	main: "main",
	complementary: "aside",
	contentinfo: "footer",
	region: "section",
	search: "form",
	form: "form"
};
/** The landmark role an element implies without an explicit `role`. */
const IMPLIED_ROLE = {
	header: "banner",
	nav: "navigation",
	main: "main",
	aside: "complementary",
	footer: "contentinfo",
	section: "region",
	form: "form"
};
/** Roles that never take a label. */
const UNLABELLED_ROLES = /* @__PURE__ */ new Set([
	"banner",
	"main",
	"contentinfo"
]);
/** Roles whose duplicates must be told apart by label. */
const DISTINGUISHED_ROLES = /* @__PURE__ */ new Set([
	"navigation",
	"complementary",
	"region",
	"form"
]);
/** The role a rendered Landmark carries: its `role` attribute, else the role its tag implies. */
function roleOf(el) {
	return el.getAttribute("role") ?? IMPLIED_ROLE[el.tagName.toLowerCase()];
}
/** The name a rendered Landmark carries: `aria-label`, else the text `aria-labelledby` points at. */
function nameOf(el, root) {
	const label = el.getAttribute("aria-label");
	if (label) return label;
	const ids = el.getAttribute("aria-labelledby");
	if (!ids) return null;
	return ids.split(/\s+/).map((id) => root.getElementById?.(id)?.textContent?.trim() ?? "").join(" ").trim() || null;
}
/** Development warnings from the guidance; only the later duplicate warns, so each pair warns once. */
function warn(node, role, labelDropped) {
	if (labelDropped) console.warn(COPY$26.labelNotTaken.replace("{role}", role));
	const root = node.getRootNode();
	if (typeof root.querySelectorAll !== "function") return;
	const own = nameOf(node, root);
	if ((role === "region" || role === "form") && own === null) console.warn(COPY$26.missingLabel.replace("{role}", role));
	if (role !== "main" && !DISTINGUISHED_ROLES.has(role)) return;
	const earlier = Array.from(root.querySelectorAll("[data-ds=\"Landmark\"]")).filter((other) => other !== node && roleOf(other) === role && (other.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
	if (role === "main") {
		if (earlier.length > 0) console.warn(COPY$26.duplicateMain);
		return;
	}
	if (earlier.some((other) => nameOf(other, root) === own)) console.warn(own === null ? COPY$26.bothUnlabelled.replace("{role}", role) : COPY$26.sharedLabel.replace("{role}", role).replace("{label}", own));
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
function Landmark({ ref, role, label, children, as, "aria-labelledby": ariaLabelledBy, ...rest }) {
	const nodeRef = useRef(null);
	useImperativeHandle(ref, () => nodeRef.current, []);
	const tagName = as ?? DEFAULT_ELEMENT[role];
	const explicitRole = tagName === "header" || tagName === "footer" || as !== void 0 && as !== DEFAULT_ELEMENT[role] || IMPLIED_ROLE[tagName] !== role;
	const takesLabel = !UNLABELLED_ROLES.has(role);
	const hasLabel = label !== void 0 && label !== "";
	const hasLabelledBy = ariaLabelledBy !== void 0 && ariaLabelledBy !== "";
	const labelDropped = (hasLabel || hasLabelledBy) && !takesLabel;
	const ariaLabel = takesLabel && hasLabel ? label : void 0;
	const labelledBy = takesLabel && hasLabelledBy ? ariaLabelledBy : void 0;
	useEffect(() => {
		if (!isDev$19 || !nodeRef.current) return;
		warn(nodeRef.current, role, labelDropped);
	}, [
		role,
		ariaLabel,
		labelDropped,
		labelledBy,
		tagName
	]);
	return createElement(tagName, {
		...rest,
		ref: nodeRef,
		className: "ds-landmark",
		"data-ds": "Landmark",
		"data-part": "region",
		role: explicitRole ? role : void 0,
		"aria-label": ariaLabel,
		"aria-labelledby": labelledBy
	}, children);
}
//#endregion
//#region src/Breadcrumb.tsx
/**
* Copy strings from the schema, used verbatim. `copy.current` is not rendered on web: the
* current page carries `aria-current="page"`, which announces it.
*/
const COPY$25 = {
	separator: "/",
	expandLabel: "Show all pages",
	navLabel: "Breadcrumb"
};
/** With `collapse`, trails longer than this show the first item, an ellipsis, and the last two. */
const COLLAPSE_ABOVE = 4;
const OVERRIDE_HOOK$21 = {
	gap: "--ds-breadcrumb-gap",
	fontFamily: "--ds-breadcrumb-font-family",
	fontSize: "--ds-breadcrumb-font-size",
	fontWeight: "--ds-breadcrumb-font-weight",
	lineHeight: "--ds-breadcrumb-line-height"
};
function overridesToStyle$18(overrides) {
	const style = {};
	for (const binding of Object.keys(OVERRIDE_HOOK$21)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$21[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Breadcrumb — Design Schema, category: navigation.
*
* When to use:
* Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
* catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors
* and jumping to any of them. Place it above the page title, at the top of `main`.
*/
function Breadcrumb({ ref, items, label = COPY$25.navLabel, collapse = true, overrides, onNavigate, ...rest }) {
	const [expanded, setExpanded] = useState(false);
	const [focusItemFallback, setFocusItemFallback] = useState(false);
	const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
	const lastIndex = items.length - 1;
	const hiddenEnd = items.length - 2;
	const linkRefs = useRef(/* @__PURE__ */ new Map());
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const revealedEnd = useRef(null);
	useEffect(() => {
		const end = revealedEnd.current;
		if (end === null) return;
		revealedEnd.current = null;
		for (let index = 1; index < end; index++) {
			const link = linkRefs.current.get(index);
			if (link) {
				link.focus();
				return;
			}
		}
		itemRefs.current.get(1)?.focus();
	}, [expanded, focusItemFallback]);
	const handleExpand = () => {
		revealedEnd.current = hiddenEnd;
		const hasRevealedLink = items.slice(1, hiddenEnd).some((item) => item.href !== void 0 && item.href !== "");
		setFocusItemFallback(!hasRevealedLink);
		setExpanded(true);
	};
	const setLinkRef = (index) => (el) => {
		if (el) linkRefs.current.set(index, el);
		else linkRefs.current.delete(index);
	};
	const setItemRef = (index) => (el) => {
		if (el) itemRefs.current.set(index, el);
		else itemRefs.current.delete(index);
	};
	const renderItem = (item, index) => {
		let content;
		if (index === lastIndex) content = /* @__PURE__ */ jsx("span", {
			className: "ds-breadcrumb__current",
			"data-part": "current",
			"aria-current": "page",
			children: item.label
		});
		else if (item.href === void 0 || item.href === "") content = /* @__PURE__ */ jsx("span", {
			className: "ds-breadcrumb__text",
			children: item.label
		});
		else content = /* @__PURE__ */ jsx("span", {
			className: "ds-breadcrumb__link",
			"data-part": "link",
			children: /* @__PURE__ */ jsx(Link, {
				ref: setLinkRef(index),
				href: item.href,
				label: item.label,
				tone: "default",
				onClick: onNavigate ? (event) => onNavigate(item, index, event) : void 0
			})
		});
		return /* @__PURE__ */ jsx("li", {
			ref: setItemRef(index),
			className: "ds-breadcrumb__item",
			"data-part": "item",
			tabIndex: index === 1 && expanded && focusItemFallback ? -1 : void 0,
			children: content
		}, index);
	};
	const first = items[0];
	const list = collapsed && first !== void 0 ? [
		renderItem(first, 0),
		/* @__PURE__ */ jsx("li", {
			className: "ds-breadcrumb__item",
			"data-part": "item",
			children: /* @__PURE__ */ jsx("span", {
				className: "ds-breadcrumb__expand",
				"data-part": "expand",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					label: COPY$25.expandLabel,
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "ellipsis",
						inline: true
					}),
					onClick: handleExpand
				})
			})
		}, "ellipsis"),
		...items.slice(hiddenEnd).map((item, offset) => renderItem(item, hiddenEnd + offset))
	] : items.map(renderItem);
	const style = {
		...overrides ? overridesToStyle$18(overrides) : void 0,
		"--ds-breadcrumb-separator": JSON.stringify(COPY$25.separator)
	};
	return /* @__PURE__ */ jsx("nav", {
		...rest,
		ref,
		"data-ds": "Breadcrumb",
		"data-part": "nav",
		className: "ds-breadcrumb",
		style,
		"aria-label": label,
		children: /* @__PURE__ */ jsx("ol", {
			className: "ds-breadcrumb__list",
			"data-part": "list",
			children: list
		})
	});
}
//#endregion
//#region src/Meter.tsx
/** Bindings realised as hooks on the root. The rest are forwarded to the composed Texts' `overrides`. */
const ROOT_OVERRIDE_HOOK$6 = {
	trackHeight: "--ds-meter-track-height",
	radius: "--ds-meter-radius",
	partGap: "--ds-meter-part-gap",
	labelGap: "--ds-meter-label-gap",
	transition: "--ds-meter-transition"
};
function rootStyle$1(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = ROOT_OVERRIDE_HOOK$6[binding];
		const ref = overrides[binding];
		if (hook === void 0 || !ref) continue;
		style[hook] = cssVar(ref);
	}
	return style;
}
/** Drops unset entries so the Text keeps its own defaults. */
function compact$1(overrides) {
	const out = {};
	for (const key of Object.keys(overrides)) {
		const ref = overrides[key];
		if (ref) out[key] = ref;
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
const isDev$18 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const PERCENT$1 = new Intl.NumberFormat(void 0, {
	style: "percent",
	maximumFractionDigits: 0
});
/** The invalid `min`/`max` pairs already reported, so each distinct one warns once. */
const warnedRanges$1 = /* @__PURE__ */ new Set();
/**
* Meter — Design Schema, category: data.
*
* When to use:
* Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a
* score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands
* ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not
* what a person would say.
*/
function Meter({ ref, value, min = 0, max = 100, label, valueText, tone = "info", hideValue = false, overrides, ...rest }) {
	const { className: _className, style: _style, ...forwarded } = rest;
	const labelId = useId();
	const safeMin = Number.isFinite(min) ? min : 0;
	const safeMax = Number.isFinite(max) ? max : 100;
	const validRange = safeMax > safeMin;
	useEffect(() => {
		if (!isDev$18 || validRange) return;
		const pair = `${safeMin}:${safeMax}`;
		if (warnedRanges$1.has(pair)) return;
		warnedRanges$1.add(pair);
		console.warn(`Meter: \`max\` (${safeMax}) must be greater than \`min\` (${safeMin}).`);
	}, [
		validRange,
		safeMin,
		safeMax
	]);
	const clamped = validRange ? Math.min(Math.max(Number.isFinite(value) ? value : safeMin, safeMin), safeMax) : safeMin;
	const fraction = validRange ? (clamped - safeMin) / (safeMax - safeMin) : 0;
	const resolvedValueText = valueText ?? PERCENT$1.format(fraction);
	const labelOverrides = compact$1({
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	const valueOverrides = compact$1({
		fontSize: overrides?.valueSize,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	return /* @__PURE__ */ jsxs("div", {
		...forwarded,
		ref,
		"data-ds": "Meter",
		"data-part": "container",
		className: `ds-meter ds-meter--${tone}`,
		style: overrides ? rootStyle$1(overrides) : void 0,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ds-meter__header",
			"data-part": "header",
			children: [/* @__PURE__ */ jsx(Text, {
				element: "span",
				size: "sm",
				weight: "medium",
				tone: "default",
				id: labelId,
				"data-part": "label",
				overrides: labelOverrides,
				children: label
			}), hideValue ? null : /* @__PURE__ */ jsx(Text, {
				element: "span",
				size: "sm",
				tone: "muted",
				"data-part": "valueText",
				overrides: valueOverrides,
				children: resolvedValueText
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ds-meter__track",
			"data-part": "track",
			role: "meter",
			"aria-labelledby": labelId,
			"aria-valuenow": clamped,
			"aria-valuemin": safeMin,
			"aria-valuemax": safeMax,
			"aria-valuetext": resolvedValueText,
			children: /* @__PURE__ */ jsx("div", {
				className: "ds-meter__fill",
				"data-part": "fill",
				style: { inlineSize: `${fraction * 100}%` }
			})
		})]
	});
}
//#endregion
//#region src/Card.tsx
const OVERRIDE_HOOK$20 = {
	paddingBlock: "--ds-card-padding-block",
	paddingInline: "--ds-card-padding-inline",
	partGap: "--ds-card-part-gap",
	headerGap: "--ds-card-header-gap",
	footerGap: "--ds-card-footer-gap",
	actionsGap: "--ds-card-actions-gap",
	border: "--ds-card-border",
	borderWidth: "--ds-card-border-width",
	radius: "--ds-card-radius",
	transition: "--ds-card-transition"
};
function overridesToStyle$17(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		if (!(binding in OVERRIDE_HOOK$20)) continue;
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$20[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$17 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Marks the one child an interactive card extends. Link and Button forward data attributes through
* `...rest` but replace a passed className with their own, so the mark is an attribute.
*/
const TARGET_ATTRIBUTE = "data-ds-card-target";
function isTarget(node) {
	if (!isValidElement(node)) return false;
	const { type } = node;
	if (type === Link || type === Button || type === "button") return true;
	return type === "a" && node.props.href !== void 0;
}
/**
* The body's top-level children, with Fragments flattened so a `<>…</>` wrapper does not hide the
* card's single target (and so no clone ever lands on a Fragment, which takes no attributes).
* Each nested `Children.toArray` restarts its keys, so a flattened Fragment's children are re-keyed
* under the Fragment's own key rather than colliding with the siblings they join.
*/
function topLevelChildren(children, prefix = "") {
	const items = [];
	for (const child of Children.toArray(children)) if (isValidElement(child) && child.type === Fragment) items.push(...topLevelChildren(child.props.children, `${prefix}${String(child.key)}`));
	else if (prefix !== "" && isValidElement(child)) items.push(cloneElement(child, { key: `${prefix}${String(child.key)}` }));
	else items.push(child);
	return items;
}
/**
* Card — Design Schema, category: container.
*
* When to use:
* Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
*/
function Card({ ref, children, heading, headingLevel = "3", headerActions, footer, inset = "md", surface = "default", interactive = false, focusable = false, overrides, onFocus, onBlur, onPointerDown, onPointerUp, ...rest }) {
	const headingId = useId();
	const hasHeading = heading !== void 0 && heading !== "";
	const items = topLevelChildren(children);
	const targets = interactive ? items.filter(isTarget) : [];
	const target = targets.length === 1 ? targets[0] : null;
	const hasTarget = target !== null;
	const hasBareText = items.some((item) => typeof item === "string" || typeof item === "number");
	let body = children;
	if (hasTarget || hasBareText) body = items.map((item, index) => {
		if (target !== null && item === target) return cloneElement(target, { [TARGET_ATTRIBUTE]: "" });
		if (typeof item === "string" || typeof item === "number") return /* @__PURE__ */ jsx(Text, { children: item }, `ds-card-text-${index}`);
		return item;
	});
	const isFocusable = focusable && !interactive;
	const [focusRing, setFocusRing] = useState(false);
	const afterPointerDown = useRef(false);
	const handleFocus = (event) => {
		onFocus?.(event);
		if (event.target !== event.currentTarget) return;
		const fromPointer = afterPointerDown.current;
		afterPointerDown.current = false;
		if (isFocusable && !fromPointer) setFocusRing(true);
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (event.target !== event.currentTarget) return;
		setFocusRing(false);
	};
	const handlePointerDown = (event) => {
		onPointerDown?.(event);
		afterPointerDown.current = true;
	};
	const handlePointerUp = (event) => {
		onPointerUp?.(event);
		afterPointerDown.current = false;
	};
	const warnedNoTarget = useRef(false);
	const warnedBoth = useRef(false);
	const warnNoTarget = isDev$17 && interactive && !hasTarget;
	const warnBoth = isDev$17 && interactive && focusable;
	useEffect(() => {
		if (warnNoTarget && !warnedNoTarget.current) {
			warnedNoTarget.current = true;
			console.warn("Card: `interactive` requires exactly one Link or Button among the top-level children; the card stays non-interactive.");
		}
	}, [warnNoTarget]);
	useEffect(() => {
		if (warnBoth && !warnedBoth.current) {
			warnedBoth.current = true;
			console.warn("Card: `focusable` has no effect with `interactive`; the child link or button is the target.");
		}
	}, [warnBoth]);
	const Tag = hasHeading ? "article" : "div";
	const classes = [
		"ds-card",
		`ds-card--inset-${inset}`,
		`ds-card--surface-${surface}`,
		interactive ? "ds-card--interactive" : null,
		hasTarget ? "ds-card--has-target" : null,
		isFocusable ? "ds-card--focusable" : null,
		isFocusable && focusRing ? "ds-card--focus-ring" : null
	].filter(Boolean).join(" ");
	const hasHeaderActions = headerActions !== void 0 && headerActions !== null && headerActions !== false;
	const hasFooter = footer !== void 0 && footer !== null && footer !== false;
	return /* @__PURE__ */ jsxs(Tag, {
		...rest,
		ref,
		"data-ds": "Card",
		"data-part": "surface",
		className: classes,
		style: overrides ? overridesToStyle$17(overrides) : void 0,
		"aria-labelledby": hasHeading ? headingId : void 0,
		tabIndex: isFocusable ? -1 : rest.tabIndex,
		onFocus: handleFocus,
		onBlur: handleBlur,
		onPointerDown: handlePointerDown,
		onPointerUp: handlePointerUp,
		children: [
			hasHeading || hasHeaderActions ? /* @__PURE__ */ jsxs("div", {
				className: "ds-card__header",
				"data-part": "header",
				children: [hasHeading ? /* @__PURE__ */ jsx(Heading, {
					id: headingId,
					level: headingLevel,
					size: "lg",
					overrides: { marginBlockEnd: "space.0" },
					children: heading
				}) : null, hasHeaderActions ? /* @__PURE__ */ jsx("div", {
					className: "ds-card__header-actions",
					"data-part": "headerActions",
					children: headerActions
				}) : null]
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "ds-card__body",
				"data-part": "body",
				children: body
			}),
			hasFooter ? /* @__PURE__ */ jsx("div", {
				className: "ds-card__footer",
				"data-part": "footer",
				children: footer
			}) : null
		]
	});
}
//#endregion
//#region src/Container.tsx
const OVERRIDE_HOOK$19 = {
	maxWidth: "--ds-container-max-width",
	paddingInline: "--ds-container-padding-inline"
};
function overridesToStyle$16(overrides, inEffect) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref && inEffect[binding]) style[OVERRIDE_HOOK$19[binding]] = cssVar(ref);
	}
	return style;
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
function Container({ ref, children, width = "content", gutter = "default", align = "center", element = "div", overrides, ...rest }) {
	const Tag = element;
	const classes = [
		"ds-container",
		`ds-container--width-${width}`,
		`ds-container--gutter-${gutter}`,
		`ds-container--align-${align}`
	].join(" ");
	const style = overrides ? overridesToStyle$16(overrides, {
		maxWidth: width !== "full",
		paddingInline: gutter !== "none"
	}) : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		"data-ds": "Container",
		"data-part": "column",
		className: classes,
		style,
		children
	});
}
//#endregion
//#region src/FocusScope.tsx
const FOCUSABLE_SELECTOR$8 = [
	"a[href]",
	"area[href]",
	"button",
	"input:not([type=\"hidden\"])",
	"select",
	"textarea",
	"summary",
	"iframe",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]"
].join(",");
function isFocusable$2(element) {
	if (!(element instanceof HTMLElement)) return false;
	if (element.hasAttribute("data-focus-sentinel")) return false;
	if (!element.matches(FOCUSABLE_SELECTOR$8)) return false;
	if (element.matches(":disabled")) return false;
	return element.getAttribute("tabindex") !== "-1" && element.tabIndex >= 0;
}
/**
* `inert` and `aria-hidden="true"` subtrees contribute nothing. A `fieldset[disabled]` is *not*
* excluded as a subtree: `:disabled` already removes the form controls inside it (outside its first
* legend), while links and tabindex elements there stay in, as the browser keeps them focusable.
*/
function isExcludedSubtree$1(element) {
	return element.hasAttribute("inert") || element.getAttribute("aria-hidden") === "true";
}
/** Walks DOM order including open shadow roots and assigned slot nodes. Visibility is not tested. */
function collectFocusable$1(root, results = []) {
	for (const child of Array.from(root.children)) {
		if (isExcludedSubtree$1(child)) continue;
		if (child instanceof HTMLSlotElement) {
			for (const assigned of child.assignedElements({ flatten: true })) {
				if (isExcludedSubtree$1(assigned)) continue;
				if (isFocusable$2(assigned)) results.push(assigned);
				if (assigned.shadowRoot) collectFocusable$1(assigned.shadowRoot, results);
				collectFocusable$1(assigned, results);
			}
			continue;
		}
		if (isFocusable$2(child)) results.push(child);
		if (child.shadowRoot) collectFocusable$1(child.shadowRoot, results);
		collectFocusable$1(child, results);
	}
	return results;
}
/** The focused element, descending into open shadow roots. */
function deepActiveElement() {
	let active = document.activeElement;
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
	return active;
}
/** `container.contains(node)`, crossing out of shadow roots through their hosts. */
function containsDeep(container, node) {
	let current = node;
	while (current) {
		if (container.contains(current)) return true;
		const root = current.getRootNode();
		current = root instanceof ShadowRoot ? root.host : null;
	}
	return false;
}
/** First document-order focusable element after `marker`, outside `exclude`, once the opener is gone. */
function findNextFocusableAfter(marker, exclude) {
	for (const element of collectFocusable$1(document.body)) {
		if (element.getRootNode() !== document) continue;
		if (exclude?.contains(element)) continue;
		if (marker.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
	}
	return null;
}
/** Module-level stack of mounted scopes; the topmost active entry is the effective one. */
const scopeStack = [];
/** The enclosing scope in the React tree (portals included), so nesting survives same-commit mounts. */
const ScopeParentContext = createContext(null);
function isAncestorEntry(ancestor, entry) {
	for (let current = entry.parent; current; current = current.parent) if (current === ancestor) return true;
	return false;
}
function pushScope(entry) {
	const index = scopeStack.findIndex((other) => isAncestorEntry(entry, other));
	if (index === -1) scopeStack.push(entry);
	else scopeStack.splice(index, 0, entry);
}
function removeScope(entry) {
	const index = scopeStack.indexOf(entry);
	if (index !== -1) scopeStack.splice(index, 1);
}
/** Only active scopes count when picking the top. */
function topScope() {
	for (let i = scopeStack.length - 1; i >= 0; i--) {
		const entry = scopeStack[i];
		if (entry.active) return entry;
	}
}
function syncScopes() {
	for (const entry of scopeStack) entry.sync();
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
function FocusScope({ ref, children, trapped = true, autoFocus = "first", restoreFocus = true, returnFocusTo, active = true, onEscapeAttempt, ...rest }) {
	const containerRef = useRef(null);
	useImperativeHandle(ref, () => containerRef.current, []);
	const startSentinelRef = useRef(null);
	const endSentinelRef = useRef(null);
	const latest = useRef({
		trapped,
		autoFocus,
		restoreFocus,
		returnFocusTo,
		onEscapeAttempt
	});
	latest.current = {
		trapped,
		autoFocus,
		restoreFocus,
		returnFocusTo,
		onEscapeAttempt
	};
	const parentEntry = useContext(ScopeParentContext);
	const entryRef = useRef(null);
	if (entryRef.current === null) {
		const created = {
			active,
			parent: parentEntry,
			sync: () => {
				const next = latest.current.trapped && created.active && topScope() === created ? 0 : -1;
				for (const sentinel of [startSentinelRef.current, endSentinelRef.current]) if (sentinel && sentinel.tabIndex !== next) sentinel.tabIndex = next;
			}
		};
		entryRef.current = created;
	}
	const entry = entryRef.current;
	const openerRef = useRef(null);
	const markerRef = useRef(null);
	/** The opener's ancestor chain, nearest first: the fallback when the marker went with its parent. */
	const openerAncestorsRef = useRef([]);
	const lastFocusedRef = useRef(null);
	const isEffective = () => latest.current.trapped && entry.active && topScope() === entry;
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return void 0;
		pushScope(entry);
		syncScopes();
		const opener = document.activeElement;
		openerRef.current = opener instanceof HTMLElement && opener !== document.body ? opener : null;
		const marker = document.createComment("ds-focus-scope-restore");
		const openerParent = openerRef.current?.parentNode;
		if (openerParent) openerParent.insertBefore(marker, openerRef.current.nextSibling);
		markerRef.current = openerParent ? marker : null;
		const ancestors = [];
		for (let node = openerRef.current?.parentElement; node; node = node.parentElement) {
			if (containsDeep(container, node)) break;
			ancestors.push(node);
		}
		openerAncestorsRef.current = ancestors;
		const focusables = collectFocusable$1(container);
		if (process.env.NODE_ENV !== "production" && latest.current.trapped && focusables.length === 0) console.warn("FocusScope: a trapped scope has no focusable descendants, so focus inside it cannot move or leave. Add a focusable control (a close Button) or set trapped={false}.");
		let target;
		if (autoFocus === "container") target = container;
		else if (autoFocus === "first") target = focusables[0];
		else if (autoFocus === "last") target = focusables[focusables.length - 1];
		if (target) {
			target.focus();
			if (target !== container) lastFocusedRef.current = target;
		}
		return () => {
			removeScope(entry);
			syncScopes();
			const recorded = openerRef.current;
			const restoreMarker = markerRef.current;
			if (latest.current.restoreFocus) {
				const explicit = latest.current.returnFocusTo?.current;
				if (explicit && explicit.isConnected) explicit.focus();
				else if (recorded && recorded.isConnected) recorded.focus();
				else {
					const anchor = restoreMarker?.isConnected ? restoreMarker : openerAncestorsRef.current.find((node) => node.isConnected);
					if (anchor) findNextFocusableAfter(anchor, container)?.focus();
				}
			}
			restoreMarker?.parentNode?.removeChild(restoreMarker);
			markerRef.current = null;
			openerAncestorsRef.current = [];
		};
	}, []);
	useLayoutEffect(() => {
		if (entry.active === active) return;
		entry.active = active;
		if (active && scopeStack.includes(entry)) {
			removeScope(entry);
			pushScope(entry);
		}
		syncScopes();
	}, [active]);
	useLayoutEffect(() => {
		entry.sync();
	});
	useEffect(() => {
		const handleFocusIn = (event) => {
			const container = containerRef.current;
			const target = event.target;
			if (!container || !(target instanceof Node)) return;
			if (containsDeep(container, target)) {
				const focused = deepActiveElement();
				if (focused instanceof HTMLElement && focused !== container && !focused.hasAttribute("data-focus-sentinel")) lastFocusedRef.current = focused;
				return;
			}
			if (!isEffective()) return;
			const remembered = lastFocusedRef.current;
			let fallback = remembered && remembered.isConnected && containsDeep(container, remembered) ? remembered : collectFocusable$1(container)[0] ?? null;
			if (!fallback && latest.current.autoFocus === "container") fallback = container;
			fallback?.focus();
		};
		document.addEventListener("focusin", handleFocusIn);
		return () => document.removeEventListener("focusin", handleFocusIn);
	}, []);
	const handleKeyDown = (event) => {
		if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || !isEffective()) return;
		const container = containerRef.current;
		if (!container) return;
		const focusables = collectFocusable$1(container);
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (!first || !last) return;
		const focused = deepActiveElement();
		if (focused === container) {
			if (event.shiftKey) latest.current.onEscapeAttempt?.("backward");
			event.preventDefault();
			(event.shiftKey ? last : first).focus();
		} else if (!event.shiftKey && focused === last) {
			latest.current.onEscapeAttempt?.("forward");
			event.preventDefault();
			first.focus();
		} else if (event.shiftKey && focused === first) {
			latest.current.onEscapeAttempt?.("backward");
			event.preventDefault();
			last.focus();
		}
	};
	const handleStartSentinelFocus = () => {
		const container = containerRef.current;
		if (!container || !isEffective()) return;
		collectFocusable$1(container)[0]?.focus();
	};
	const handleEndSentinelFocus = () => {
		const container = containerRef.current;
		if (!container || !isEffective()) return;
		const focusables = collectFocusable$1(container);
		focusables[focusables.length - 1]?.focus();
	};
	return /* @__PURE__ */ jsx(ScopeParentContext.Provider, {
		value: entry,
		children: /* @__PURE__ */ jsxs("div", {
			...rest,
			ref: containerRef,
			tabIndex: autoFocus === "container" ? -1 : void 0,
			"data-focus-scope": "",
			"data-ds": "FocusScope",
			"data-part": "scope",
			className: "ds-focus-scope",
			onKeyDown: handleKeyDown,
			children: [
				/* @__PURE__ */ jsx("span", {
					ref: startSentinelRef,
					tabIndex: -1,
					"data-focus-sentinel": "",
					className: "ds-focus-scope__sentinel",
					onFocus: handleStartSentinelFocus
				}),
				children,
				/* @__PURE__ */ jsx("span", {
					ref: endSentinelRef,
					tabIndex: -1,
					"data-focus-sentinel": "",
					className: "ds-focus-scope__sentinel",
					onFocus: handleEndSentinelFocus
				})
			]
		})
	});
}
//#endregion
//#region src/Dialog.tsx
const OVERRIDE_HOOK$18 = {
	scrim: "--ds-dialog-scrim",
	border: "--ds-dialog-border",
	borderWidth: "--ds-dialog-border-width",
	shadow: "--ds-dialog-shadow",
	radius: "--ds-dialog-radius",
	inset: "--ds-dialog-inset",
	partGap: "--ds-dialog-part-gap",
	gutter: "--ds-dialog-gutter",
	headerGap: "--ds-dialog-header-gap",
	footerGap: "--ds-dialog-footer-gap",
	descriptionGap: "--ds-dialog-description-gap",
	widthSm: "--ds-dialog-width-sm",
	widthMd: "--ds-dialog-width-md",
	widthLg: "--ds-dialog-width-lg",
	layer: "--ds-dialog-layer",
	enter: "--ds-dialog-enter",
	exit: "--ds-dialog-exit"
};
function overridesToStyle$15(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$18[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** copy.* — used verbatim. */
const COPY$24 = { closeLabel: "Close" };
const FOCUSABLE_SELECTOR$7 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled]):not([type=\"hidden\"])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
function firstFocusableIn$1(root) {
	if (!root) return null;
	for (const element of Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR$7))) if (!element.hasAttribute("data-focus-sentinel") && !element.closest("[inert]")) return element;
	return null;
}
/** True when the surface has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition$4(element) {
	const durations = getComputedStyle(element).transitionDuration;
	if (!durations) return true;
	return durations.split(",").every((duration) => parseFloat(duration) === 0);
}
/** Scroll lock is reference-counted so an overlay opened over the dialog cannot release it early. */
let scrollLockCount$3 = 0;
function lockScroll$3() {
	scrollLockCount$3 += 1;
	document.documentElement.classList.add("ds-dialog-lock-scroll");
	return () => {
		scrollLockCount$3 -= 1;
		if (scrollLockCount$3 === 0) document.documentElement.classList.remove("ds-dialog-lock-scroll");
	};
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
function Dialog({ ref, open, heading, description, children, footer, hideHeading = false, size = "md", dismissible = true, initialFocus = "first", onClose, onOpened, container, overrides, className: _className, style: _style, ...rest }) {
	const generatedId = useId();
	const headingId = `ds-dialog${generatedId}-heading`;
	const descriptionId = `ds-dialog${generatedId}-description`;
	const dialogRef = useRef(null);
	const setDialogNode = useCallback((node) => {
		dialogRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const footerRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	/** True from the moment Escape is reported until the end of the task, so the browser's `cancel` and
	* `close` for that same key are not reported a second time. */
	const escapeReportedRef = useRef(false);
	const selfClosingRef = useRef(false);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const latest = useRef({
		open,
		initialFocus,
		dismissible,
		onOpened
	});
	latest.current = {
		open,
		initialFocus,
		dismissible,
		onOpened
	};
	const warnedRef = useRef(false);
	if (process.env.NODE_ENV !== "production" && !heading && !warnedRef.current) {
		warnedRef.current = true;
		console.warn("Dialog: `heading` is required and becomes the accessible name; it must not be empty.");
	}
	if (open && !present) setPresent(true);
	/** Body, footer, close button (unless `close` was asked for and there is none), heading; `title` goes straight to the heading. */
	const placeInitialFocus = () => {
		const { initialFocus: focusTarget } = latest.current;
		const headingElement = headingRef.current;
		const closeButton = closeButtonRef.current;
		let target = null;
		if (focusTarget === "close") target = closeButton;
		if (!target && focusTarget !== "title") target = firstFocusableIn$1(bodyRef.current) ?? firstFocusableIn$1(footerRef.current) ?? closeButton;
		if (target) {
			target.focus();
			return;
		}
		if (!headingElement) return;
		if (headingElement.tabIndex !== -1) headingElement.tabIndex = -1;
		headingElement.focus();
	};
	useLayoutEffect(() => {
		if (!present || !open) return void 0;
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		if (!dialog || !surface) return void 0;
		selfClosingRef.current = false;
		if (!dialog.open) {
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
		}
		placeInitialFocus();
		let fired = false;
		const fireOpened = () => {
			if (fired || !latest.current.open) return;
			fired = true;
			latest.current.onOpened?.();
		};
		const handleEntered = (event) => {
			if (event.target === surface && event.propertyName === "opacity") fireOpened();
		};
		surface.addEventListener("transitionend", handleEntered);
		const frame = requestAnimationFrame(() => {
			setVisible(true);
			if (hasNoTransition$4(surface)) fireOpened();
		});
		return () => {
			cancelAnimationFrame(frame);
			surface.removeEventListener("transitionend", handleEntered);
		};
	}, [present, open]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		const finish = () => {
			if (dialog?.open) {
				selfClosingRef.current = true;
				if (typeof dialog.close === "function") dialog.close();
				else dialog.open = false;
			}
			setPresent(false);
		};
		if (!surface || !dialog?.open || hasNoTransition$4(surface)) {
			finish();
			return;
		}
		const handleExited = (event) => {
			if (event.target === surface && event.propertyName === "opacity") finish();
		};
		surface.addEventListener("transitionend", handleExited);
		return () => surface.removeEventListener("transitionend", handleExited);
	}, [open, present]);
	useEffect(() => {
		if (!present) return void 0;
		return lockScroll$3();
	}, [present]);
	/** Each Escape is reported exactly once, whichever of keydown, `cancel` or `close` reaches us first. */
	const reportEscape = () => {
		escapeReportedRef.current = true;
		setTimeout(() => {
			escapeReportedRef.current = false;
		}, 0);
		onClose?.("escape");
	};
	/** Reopen after a close the component did not ask for, and put focus back in per `initialFocus`. */
	const reopenAfterNativeClose = () => {
		requestAnimationFrame(() => {
			const dialog = dialogRef.current;
			if (!dialog || dialog.open || !latest.current.open) return;
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
			placeInitialFocus();
		});
	};
	const handleKeyDown = (event) => {
		rest.onKeyDown?.(event);
		if (event.key !== "Escape" || event.defaultPrevented || !open) return;
		event.preventDefault();
		if (!escapeReportedRef.current) reportEscape();
	};
	const handleCancel = (event) => {
		event.preventDefault();
		if (escapeReportedRef.current || !open) return;
		reportEscape();
	};
	const handleNativeClose = () => {
		if (selfClosingRef.current) {
			selfClosingRef.current = false;
			return;
		}
		if (!open) return;
		if (!escapeReportedRef.current) reportEscape();
		reopenAfterNativeClose();
	};
	const handleScrimClick = () => {
		if (!open || !dismissible) return;
		onClose?.("scrim");
	};
	if (!present) return null;
	const classes = [
		"ds-dialog",
		`ds-dialog--${size}`,
		visible && open ? "ds-dialog--visible" : null
	].filter(Boolean).join(" ");
	const insetOverride = overrides?.inset;
	const footerGapOverride = overrides?.footerGap;
	const hasFooter = footer !== void 0 && footer !== null && footer !== false;
	const node = /* @__PURE__ */ jsxs("dialog", {
		...rest,
		ref: setDialogNode,
		"data-ds": "Dialog",
		className: classes,
		style: overrides ? overridesToStyle$15(overrides) : void 0,
		"aria-modal": "true",
		"aria-labelledby": headingId,
		"aria-describedby": description ? descriptionId : void 0,
		onKeyDown: handleKeyDown,
		onCancel: handleCancel,
		onClose: handleNativeClose,
		children: [/* @__PURE__ */ jsx("div", {
			className: "ds-dialog__scrim",
			"data-part": "scrim",
			onClick: handleScrimClick
		}), /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			children: /* @__PURE__ */ jsx("div", {
				className: "ds-dialog__scope",
				"data-part": "focusScope",
				children: /* @__PURE__ */ jsxs("div", {
					className: "ds-dialog__surface",
					ref: surfaceRef,
					"data-part": "surface",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "ds-dialog__header",
							"data-part": "header",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "ds-dialog__titles",
								children: [/* @__PURE__ */ jsx("div", {
									className: hideHeading ? "ds-dialog__heading ds-dialog__visually-hidden" : "ds-dialog__heading",
									"data-part": "heading",
									children: /* @__PURE__ */ jsx(Heading, {
										level: "2",
										id: headingId,
										ref: headingRef,
										tabIndex: initialFocus === "title" ? -1 : void 0,
										children: heading
									})
								}), description ? /* @__PURE__ */ jsx(Text, {
									id: descriptionId,
									"data-part": "description",
									tone: "muted",
									children: description
								}) : null]
							}), dismissible ? /* @__PURE__ */ jsx("span", {
								className: "ds-dialog__close",
								"data-part": "closeButton",
								children: /* @__PURE__ */ jsx(Button, {
									ref: closeButtonRef,
									variant: "ghost",
									size: "sm",
									iconOnly: true,
									label: COPY$24.closeLabel,
									leadingIcon: /* @__PURE__ */ jsx(Icon, {
										name: "close",
										inline: true
									}),
									onClick: () => onClose?.("close-button")
								})
							}) : null]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "ds-dialog__body",
							"data-part": "body",
							ref: bodyRef,
							children: /* @__PURE__ */ jsx(Box, {
								overrides: insetOverride ? { paddingInline: insetOverride } : void 0,
								children
							})
						}),
						hasFooter ? /* @__PURE__ */ jsx("div", {
							className: "ds-dialog__footer",
							"data-part": "footer",
							ref: footerRef,
							children: /* @__PURE__ */ jsx(Stack, {
								direction: "horizontal",
								justify: "end",
								wrap: true,
								overrides: footerGapOverride ? { gap: footerGapOverride } : void 0,
								children: footer
							})
						}) : null
					]
				})
			})
		})]
	});
	return createPortal(node, container ?? document.body);
}
//#endregion
//#region src/AlertDialog.tsx
const OVERRIDE_HOOK$17 = {
	scrim: "--ds-alert-dialog-scrim",
	border: "--ds-alert-dialog-border",
	borderWidth: "--ds-alert-dialog-border-width",
	shadow: "--ds-alert-dialog-shadow",
	radius: "--ds-alert-dialog-radius",
	inset: "--ds-alert-dialog-inset",
	partGap: "--ds-alert-dialog-part-gap",
	textGap: "--ds-alert-dialog-text-gap",
	iconGap: "--ds-alert-dialog-icon-gap",
	footerGap: "--ds-alert-dialog-footer-gap",
	iconSize: "--ds-alert-dialog-icon-size",
	width: "--ds-alert-dialog-width",
	gutter: "--ds-alert-dialog-gutter",
	layer: "--ds-alert-dialog-layer",
	rise: "--ds-alert-dialog-rise",
	enter: "--ds-alert-dialog-enter",
	exit: "--ds-alert-dialog-exit"
};
function overridesToStyle$14(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$17[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** copy.* — used verbatim. */
const COPY$23 = { cancelLabel: "Cancel" };
/** tone → confirm Button variant: danger → danger; warning and info → primary. */
const CONFIRM_VARIANT = {
	danger: "danger",
	warning: "primary",
	info: "primary"
};
/** True when the surface has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition$3(element) {
	const durations = getComputedStyle(element).transitionDuration;
	if (!durations) return true;
	return durations.split(",").every((duration) => parseFloat(duration) === 0);
}
/** Scroll lock is reference-counted so an overlay opened over the alert dialog cannot release it early. */
let scrollLockCount$2 = 0;
function lockScroll$2() {
	scrollLockCount$2 += 1;
	document.documentElement.classList.add("ds-alert-dialog-lock-scroll");
	return () => {
		scrollLockCount$2 -= 1;
		if (scrollLockCount$2 === 0) document.documentElement.classList.remove("ds-alert-dialog-lock-scroll");
	};
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
function AlertDialog({ ref, open, heading, description, tone = "danger", confirmLabel, cancelLabel, confirmDisabled = false, onConfirm, onCancel, container, overrides, className: _className, style: _style, ...rest }) {
	const generatedId = useId();
	const headingId = `ds-alert-dialog${generatedId}-heading`;
	const descriptionId = `ds-alert-dialog${generatedId}-description`;
	const dialogRef = useRef(null);
	const setDialogNode = useCallback((node) => {
		dialogRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	const surfaceRef = useRef(null);
	const cancelButtonRef = useRef(null);
	/** True from the moment Escape is reported until the end of the task, so the browser's `cancel`
	* for that same key is not reported a second time. */
	const escapeReportedRef = useRef(false);
	const selfClosingRef = useRef(false);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const latestOpen = useRef(open);
	latestOpen.current = open;
	const warnedRef = useRef(false);
	if (process.env.NODE_ENV !== "production" && !warnedRef.current && (!heading || !description || !confirmLabel)) {
		warnedRef.current = true;
		console.warn("AlertDialog: `heading`, `description` and `confirmLabel` are required; the heading is the accessible name and the description states the consequence.");
	}
	if (open && !present) setPresent(true);
	/** Focus lands on Cancel, so Enter pressed reflexively cancels rather than destroys (WCAG 3.3.4). */
	const focusCancel = () => {
		const cancelButton = cancelButtonRef.current;
		if (cancelButton && document.activeElement !== cancelButton) cancelButton.focus();
	};
	useLayoutEffect(() => {
		if (!present || !open) return void 0;
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		if (!dialog || !surface) return void 0;
		selfClosingRef.current = false;
		if (!dialog.open) {
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
		}
		focusCancel();
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [present, open]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		const finish = () => {
			if (dialog?.open) {
				selfClosingRef.current = true;
				if (typeof dialog.close === "function") dialog.close();
				else dialog.open = false;
			}
			setPresent(false);
		};
		if (!surface || !dialog?.open || hasNoTransition$3(surface)) {
			finish();
			return;
		}
		const handleExited = (event) => {
			if (event.target === surface && event.propertyName === "opacity") finish();
		};
		surface.addEventListener("transitionend", handleExited);
		return () => surface.removeEventListener("transitionend", handleExited);
	}, [open, present]);
	useEffect(() => {
		if (!present) return void 0;
		return lockScroll$2();
	}, [present]);
	/** Each Escape is reported exactly once, whichever of keydown or `cancel` reaches us first. */
	const reportEscape = () => {
		escapeReportedRef.current = true;
		setTimeout(() => {
			escapeReportedRef.current = false;
		}, 0);
		onCancel?.("escape");
	};
	const handleKeyDown = (event) => {
		rest.onKeyDown?.(event);
		if (event.key !== "Escape" || event.defaultPrevented || !open) return;
		event.preventDefault();
		if (!escapeReportedRef.current) reportEscape();
	};
	const handleNativeCancel = (event) => {
		event.preventDefault();
		if (escapeReportedRef.current || !open) return;
		reportEscape();
	};
	const handleNativeClose = () => {
		if (selfClosingRef.current) {
			selfClosingRef.current = false;
			return;
		}
		if (!open) return;
		if (!escapeReportedRef.current) reportEscape();
		requestAnimationFrame(() => {
			const dialog = dialogRef.current;
			if (!dialog || dialog.open || !latestOpen.current) return;
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
			focusCancel();
		});
	};
	if (!present) return null;
	const classes = [
		"ds-alert-dialog",
		`ds-alert-dialog--${tone}`,
		visible && open ? "ds-alert-dialog--visible" : null
	].filter(Boolean).join(" ");
	const iconSizeOverride = overrides?.iconSize;
	const footerGapOverride = overrides?.footerGap;
	const node = /* @__PURE__ */ jsxs("dialog", {
		...rest,
		ref: setDialogNode,
		"data-ds": "AlertDialog",
		className: classes,
		style: overrides ? overridesToStyle$14(overrides) : void 0,
		role: "alertdialog",
		"aria-modal": "true",
		"aria-labelledby": headingId,
		"aria-describedby": descriptionId,
		onKeyDown: handleKeyDown,
		onCancel: handleNativeCancel,
		onClose: handleNativeClose,
		children: [/* @__PURE__ */ jsx("div", {
			className: "ds-alert-dialog__scrim",
			"data-part": "scrim"
		}), /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			children: /* @__PURE__ */ jsx("div", {
				className: "ds-alert-dialog__scope",
				"data-part": "focusScope",
				children: /* @__PURE__ */ jsxs("div", {
					className: "ds-alert-dialog__surface",
					ref: surfaceRef,
					"data-part": "surface",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "ds-alert-dialog__row",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-alert-dialog__icon",
							"data-part": "icon",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx(Icon, {
								name: tone,
								overrides: iconSizeOverride ? { size: iconSizeOverride } : void 0
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "ds-alert-dialog__text",
							children: [/* @__PURE__ */ jsx("div", {
								className: "ds-alert-dialog__heading",
								"data-part": "heading",
								children: /* @__PURE__ */ jsx(Heading, {
									level: "2",
									id: headingId,
									children: heading
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "ds-alert-dialog__description",
								"data-part": "description",
								children: /* @__PURE__ */ jsx(Text, {
									id: descriptionId,
									tone: "muted",
									children: description
								})
							})]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "ds-alert-dialog__footer",
						"data-part": "footer",
						children: /* @__PURE__ */ jsxs(Stack, {
							direction: "horizontal",
							gap: "tight",
							justify: "end",
							overrides: footerGapOverride ? { gap: footerGapOverride } : void 0,
							children: [/* @__PURE__ */ jsx("span", {
								className: "ds-alert-dialog__action",
								"data-part": "cancelButton",
								children: /* @__PURE__ */ jsx(Button, {
									ref: cancelButtonRef,
									variant: "secondary",
									size: "md",
									label: cancelLabel ?? COPY$23.cancelLabel,
									onClick: () => onCancel?.("cancel")
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "ds-alert-dialog__action",
								"data-part": "confirmButton",
								children: /* @__PURE__ */ jsx(Button, {
									variant: CONFIRM_VARIANT[tone],
									size: "md",
									label: confirmLabel,
									disabled: confirmDisabled,
									onClick: () => onConfirm?.()
								})
							})]
						})
					})]
				})
			})
		})]
	});
	return createPortal(node, container ?? document.body);
}
//#endregion
//#region src/Menu.tsx
const OVERRIDE_HOOK$16 = {
	border: "--ds-menu-border",
	borderWidth: "--ds-menu-border-width",
	shadow: "--ds-menu-shadow",
	radius: "--ds-menu-radius",
	popupPadding: "--ds-menu-popup-padding",
	popupOffset: "--ds-menu-popup-offset",
	typeaheadReset: "--ds-menu-typeahead-reset",
	maxHeight: "--ds-menu-max-height",
	gutter: "--ds-menu-gutter",
	minWidth: "--ds-menu-min-width",
	itemPaddingBlock: "--ds-menu-item-padding-block",
	itemPaddingInline: "--ds-menu-item-padding-inline",
	itemGap: "--ds-menu-item-gap",
	itemRadius: "--ds-menu-item-radius",
	groupLabelSize: "--ds-menu-group-label-size",
	groupLabelWeight: "--ds-menu-group-label-weight",
	shortcutSize: "--ds-menu-shortcut-size",
	separator: "--ds-menu-separator",
	separatorMargin: "--ds-menu-separator-margin",
	fontFamily: "--ds-menu-font-family",
	fontSize: "--ds-menu-font-size",
	lineHeight: "--ds-menu-line-height",
	layer: "--ds-menu-layer",
	enter: "--ds-menu-enter",
	enterDistance: "--ds-menu-enter-distance"
};
function overridesToStyle$13(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$16[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
const isDev$16 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$4() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Reads a resolved length custom property in px (`popupOffset`, `gutter`): a rem value is multiplied
* by the root font size. `null` when it cannot be read — no stylesheet loaded, or not a length.
*/
function readLengthVar$1(element, name) {
	const raw = getComputedStyle(element).getPropertyValue(name).trim();
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) return null;
	if (raw.endsWith("rem")) {
		const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		return Number.isFinite(rootSize) ? value * rootSize : null;
	}
	return raw.endsWith("px") || /^[\d.]+$/.test(raw) ? value : null;
}
/** Reads a resolved CSS `<time>` value (`"800ms"`, `"0.8s"`) as milliseconds; 0 when unresolvable. */
function cssTimeToMs(value) {
	const trimmed = value.trim();
	if (trimmed.endsWith("ms")) return parseFloat(trimmed) || 0;
	if (trimmed.endsWith("s")) return (parseFloat(trimmed) || 0) * 1e3;
	return parseFloat(trimmed) || 0;
}
function isSeparator(item) {
	return "separator" in item;
}
function isGroup$3(item) {
	return "group" in item;
}
/** Action items in document order. Groups hold action items only; nested groups and separators are dropped. */
function flattenActions(items) {
	const result = [];
	for (const item of items) {
		if (isSeparator(item)) continue;
		if (isGroup$3(item)) {
			for (const child of item.items) if (!isSeparator(child) && !isGroup$3(child)) result.push(child);
		} else result.push(item);
	}
	return result;
}
function assignRef$2(ref, value) {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
}
const TABBABLE_SELECTOR$1 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/** Whether focus can be parked on this element — an `anchor` is any element, and need not take focus. */
function isFocusable$1(element) {
	return element.matches(TABBABLE_SELECTOR$1) || element.tabIndex >= 0;
}
/**
* Focuses the tabbable element after (or before) `from` in document order, skipping the popup. `from`
* need not be tabbable itself (an `anchor` stands in for the trigger), and its own descendants are
* neither before nor after it.
*/
function focusAdjacent(from, exclude, direction) {
	const all = Array.from(document.querySelectorAll(TABBABLE_SELECTOR$1)).filter((element) => !(exclude && exclude.contains(element)) && !from.contains(element));
	if (direction === "next") all.find((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)?.focus();
	else {
		const preceding = all.filter((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING);
		preceding[preceding.length - 1]?.focus();
	}
}
/** minWidth's runtime floor: the trigger's measured width. `0px` in `anchor` mode, which has no floor. */
const TRIGGER_WIDTH_HOOK = "--ds-menu-trigger-width";
/**
* Places the popup from the anchor rect for `placement`. Only the block side flips (bottom and top
* swap) when the popup would overflow; `start` and `end` never flip — they resolve against the layout
* direction (in right-to-left `start` is the right edge) and the popup is shifted inline instead so it
* stays `gutter` away from the side edges. `offset` (popupOffset, resolved) is part of the flip check;
* the gap itself is the popup's block margin, so a flipped popup keeps it on its new side.
*/
function computePosition$4(anchorRect, popupRect, placement, offset, gutter, rtl) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const [preferredVertical, side] = placement.split("-");
	const needed = popupRect.height + offset;
	let vertical = preferredVertical;
	if (vertical === "bottom" && anchorRect.bottom + needed > viewportHeight && anchorRect.top - needed >= 0) vertical = "top";
	else if (vertical === "top" && anchorRect.top - needed < 0 && anchorRect.bottom + needed <= viewportHeight) vertical = "bottom";
	const preferredLeft = (rtl ? side === "end" : side === "start") ? anchorRect.left : anchorRect.right - popupRect.width;
	const furthestLeft = Math.max(gutter, viewportWidth - gutter - popupRect.width);
	const style = { left: Math.min(Math.max(preferredLeft, gutter), furthestLeft) };
	if (vertical === "bottom") style.top = anchorRect.bottom;
	else style.bottom = viewportHeight - anchorRect.top;
	return {
		style,
		vertical
	};
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
function Menu({ ref, label, items, triggerVariant = "ghost", triggerIcon = "chevron-down", iconOnly = false, placement = "bottom-start", open: openProp, anchor, onAction, onOpenChange, container, overrides, ...rest }) {
	const generatedId = useId();
	const triggerId = `ds-menu${generatedId}-trigger`;
	const listId = `ds-menu${generatedId}-list`;
	const triggerRef = useRef(null);
	const popupRef = useRef(null);
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const pendingFocusRef = useRef("first");
	const openerRef = useRef(null);
	const focusAfterCloseRef = useRef(null);
	const focusInsideRef = useRef(false);
	const closingRef = useRef(false);
	const typeaheadRef = useRef({
		buffer: "",
		timer: null
	});
	const warnedRef = useRef(false);
	const swallowSpaceKeyUpRef = useRef(false);
	const lastPositionRef = useRef("");
	const latest = useRef({
		items,
		placement
	});
	latest.current = {
		items,
		placement
	};
	const isControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? openProp : internalOpen;
	const [activeId, setActiveId] = useState(null);
	const [popupStyle, setPopupStyle] = useState(void 0);
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	useEffect(() => {
		if (!isDev$16 || warnedRef.current) return;
		if (iconOnly && triggerIcon === "none" && !anchor) {
			warnedRef.current = true;
			console.warn("Menu: `iconOnly` with `triggerIcon: none` leaves nothing visible to press; choose `ellipsis` or `chevron-down`.");
		}
	}, [
		iconOnly,
		triggerIcon,
		anchor
	]);
	const setPopupRef = useCallback((element) => {
		popupRef.current = element;
		assignRef$2(ref, element);
	}, [ref]);
	const changeOpen = (value, reason) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.(value, reason);
	};
	const openMenu = (focusTarget, reason) => {
		if (open) return;
		pendingFocusRef.current = focusTarget;
		changeOpen(true, reason);
	};
	/** Requests a close; focus moves only once `open` is actually false (a controlled parent may refuse). */
	const closeMenu = (reason, focusAfter) => {
		if (!open || closingRef.current) return;
		focusAfterCloseRef.current = focusAfter;
		closingRef.current = true;
		try {
			changeOpen(false, reason);
		} finally {
			closingRef.current = false;
		}
	};
	const anchorElement = () => anchor?.current ?? triggerRef.current;
	const setItemRef = (id) => (element) => {
		if (element) itemRefs.current.set(id, element);
		else itemRefs.current.delete(id);
	};
	const focusAction = (id) => {
		setActiveId(id);
		itemRefs.current.get(id)?.focus();
	};
	/**
	* The item that actually holds focus. The menu moves real focus rather than pointing at an item
	* with aria-activedescendant, so focus is the source of truth: it can land on an item without
	* passing through `focusAction` (a click, a screen reader, a consumer calling `focus()`), and the
	* arrows, Home/End and typeahead must all move from wherever it really is, not from the last item
	* this component happened to highlight. `activeId` only backs the roving tabindex.
	*/
	const focusedActionId = () => {
		const active = document.activeElement;
		if (active instanceof HTMLElement) {
			for (const [id, element] of itemRefs.current) if (element === active || element.contains(active)) return id;
		}
		return activeId;
	};
	const activateAction = (action) => {
		if (action.disabled) return;
		closeMenu("action", "opener");
		onAction?.(action.id);
	};
	useLayoutEffect(() => {
		if (!open) {
			const focusAfter = focusAfterCloseRef.current;
			const opener = openerRef.current;
			const from = anchorElement();
			if (opener || from) {
				if (focusAfter === "next" || focusAfter === "previous") {
					if (from) focusAdjacent(from, null, focusAfter);
				} else if (focusAfter === "opener" || focusInsideRef.current) opener?.focus();
			}
			focusAfterCloseRef.current = null;
			focusInsideRef.current = false;
			openerRef.current = null;
			lastPositionRef.current = "";
			setEntered(false);
			return;
		}
		const popup = popupRef.current;
		if (!popup) return void 0;
		focusAfterCloseRef.current = null;
		openerRef.current = triggerRef.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
		const reposition = () => {
			const target = anchor?.current ?? triggerRef.current;
			if (!target) return;
			const triggerWidth = anchor ? "0px" : `${target.getBoundingClientRect().width}px`;
			popup.style.setProperty(TRIGGER_WIDTH_HOOK, triggerWidth);
			const offset = readLengthVar$1(popup, OVERRIDE_HOOK$16.popupOffset) ?? 0;
			const gutter = readLengthVar$1(popup, OVERRIDE_HOOK$16.gutter) ?? 0;
			const rtl = getComputedStyle(target).direction === "rtl";
			const result = computePosition$4(target.getBoundingClientRect(), popup.getBoundingClientRect(), latest.current.placement, offset, gutter, rtl);
			const next = `${result.vertical}|${triggerWidth}|${JSON.stringify(result.style)}`;
			if (next === lastPositionRef.current) return;
			lastPositionRef.current = next;
			setPopupStyle({
				...result.style,
				[TRIGGER_WIDTH_HOOK]: triggerWidth
			});
			setVertical(result.vertical);
		};
		reposition();
		const enabled = flattenActions(latest.current.items).filter((action) => !action.disabled);
		const target = pendingFocusRef.current === "last" ? enabled[enabled.length - 1] : enabled[0];
		pendingFocusRef.current = "first";
		if (target) focusAction(target.id);
		else popup.focus();
		let frame = 0;
		if (prefersReducedMotion$4() || typeof requestAnimationFrame !== "function") setEntered(true);
		else frame = requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open, anchor]);
	const dismissRef = useRef(() => void 0);
	dismissRef.current = (reason) => closeMenu(reason, "none");
	useEffect(() => {
		if (!open) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			const from = anchor?.current ?? triggerRef.current;
			if (target && (popupRef.current?.contains(target) || from?.contains(target))) return;
			dismissRef.current("outside");
		};
		const handleWindowBlur = () => dismissRef.current("focus-out");
		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("blur", handleWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [open, anchor]);
	useEffect(() => () => {
		const timer = typeaheadRef.current.timer;
		if (timer) clearTimeout(timer);
	}, []);
	const handleTriggerClick = () => {
		if (open) closeMenu("trigger", "none");
		else openMenu("first", "trigger");
	};
	const handleTriggerKeyUp = (event) => {
		if (event.key === " " && swallowSpaceKeyUpRef.current) event.preventDefault();
		swallowSpaceKeyUpRef.current = false;
	};
	const handleTriggerKeyDown = (event) => {
		const enabled = flattenActions(items).filter((action) => !action.disabled);
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (!open) openMenu("first", "trigger");
			else if (enabled[0]) focusAction(enabled[0].id);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			if (!open) openMenu("last", "trigger");
			else if (enabled[enabled.length - 1]) focusAction(enabled[enabled.length - 1].id);
		} else if (event.key === "Escape" && open) {
			event.preventDefault();
			event.stopPropagation();
			closeMenu("escape", "none");
		}
	};
	const typeaheadResetMs = () => {
		const popup = popupRef.current;
		return popup ? cssTimeToMs(getComputedStyle(popup).getPropertyValue(OVERRIDE_HOOK$16.typeaheadReset)) : 0;
	};
	const handleTypeahead = (char, enabled, currentIndex) => {
		const state = typeaheadRef.current;
		if (state.timer) clearTimeout(state.timer);
		state.buffer += char.toLowerCase();
		const buffer = state.buffer;
		const resetMs = typeaheadResetMs();
		state.timer = resetMs > 0 ? setTimeout(() => {
			state.buffer = "";
			state.timer = null;
		}, resetMs) : null;
		if (resetMs <= 0) state.buffer = "";
		const start = Math.max(currentIndex, 0);
		const firstOffset = buffer.length > 1 ? 0 : 1;
		for (let offset = firstOffset; offset < enabled.length + firstOffset; offset++) {
			const candidate = enabled[(start + offset) % enabled.length];
			if (candidate && candidate.label.toLowerCase().startsWith(buffer)) {
				focusAction(candidate.id);
				return;
			}
		}
	};
	/**
	* Tab and Shift+Tab close and let the browser carry on. The key is not prevented when there is
	* somewhere to park focus — the trigger, or a focusable `anchor` standing in for it: every item
	* drops to tabindex -1 and focus moves there, so the browser's own Tab continues from that point
	* and a popup a controlled parent still shows holds no tab stop. Only an unfocusable anchor makes
	* the menu move focus itself, to the first tabbable after (Tab) or last before (Shift+Tab) it.
	*/
	const handleTab = (event) => {
		const anchorTarget = anchor?.current ?? null;
		const park = triggerRef.current ?? (anchorTarget && isFocusable$1(anchorTarget) ? anchorTarget : null);
		if (park) {
			for (const element of itemRefs.current.values()) if (element.tabIndex !== -1) element.tabIndex = -1;
			setActiveId(null);
			park.focus();
			closeMenu("tab-out", "none");
			return;
		}
		event.preventDefault();
		closeMenu("tab-out", event.shiftKey ? "previous" : "next");
	};
	const handleListKeyDown = (event) => {
		const enabled = flattenActions(items).filter((action) => !action.disabled);
		const currentIndex = enabled.findIndex((action) => action.id === focusedActionId());
		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();
				const next = enabled[(currentIndex + 1) % enabled.length];
				if (next) focusAction(next.id);
				break;
			}
			case "ArrowUp": {
				event.preventDefault();
				const previous = enabled[currentIndex <= 0 ? enabled.length - 1 : currentIndex - 1];
				if (previous) focusAction(previous.id);
				break;
			}
			case "Home": {
				event.preventDefault();
				const first = enabled[0];
				if (first) focusAction(first.id);
				break;
			}
			case "End": {
				event.preventDefault();
				const last = enabled[enabled.length - 1];
				if (last) focusAction(last.id);
				break;
			}
			case "Enter":
			case " ": {
				event.preventDefault();
				const current = enabled[currentIndex];
				if (!current) break;
				if (event.key === " ") swallowSpaceKeyUpRef.current = true;
				activateAction(current);
				break;
			}
			case "Escape":
				event.preventDefault();
				event.stopPropagation();
				closeMenu("escape", "opener");
				break;
			case "Tab":
				handleTab(event);
				break;
			default: {
				const char = event.key;
				if (char.length === 1 && char !== " " && !event.metaKey && !event.ctrlKey && !event.altKey && enabled.length > 0) {
					event.preventDefault();
					handleTypeahead(char, enabled, currentIndex);
				}
			}
		}
	};
	const handlePopupFocus = () => {
		focusInsideRef.current = true;
	};
	const handlePopupBlur = (event) => {
		const next = event.relatedTarget;
		if (next && popupRef.current?.contains(next)) return;
		focusInsideRef.current = false;
		if (!next) return;
		if (anchorElement()?.contains(next)) return;
		closeMenu("focus-out", "none");
	};
	const handleItemFocus = (action) => {
		if (action.id !== activeId) setActiveId(action.id);
	};
	const handleItemMouseEnter = (action) => {
		if (!action.disabled) focusAction(action.id);
	};
	const handleItemClick = (action) => (event) => {
		if (action.disabled) {
			event.preventDefault();
			return;
		}
		activateAction(action);
	};
	const renderAction = (action) => {
		const classes = [
			"ds-menu__item",
			action.tone === "danger" ? "ds-menu__item--danger" : null,
			action.disabled ? "ds-menu__item--disabled" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("div", {
			ref: setItemRef(action.id),
			role: "menuitem",
			"data-part": "item",
			tabIndex: action.id === activeId ? 0 : -1,
			"aria-disabled": action.disabled ? "true" : void 0,
			className: classes,
			onFocus: () => handleItemFocus(action),
			onMouseEnter: () => handleItemMouseEnter(action),
			onClick: handleItemClick(action),
			children: [
				action.icon ? /* @__PURE__ */ jsx("span", {
					className: "ds-menu__item-icon",
					"data-part": "itemIcon",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: action.icon,
						inline: true
					})
				}) : null,
				/* @__PURE__ */ jsx("span", {
					className: "ds-menu__item-label",
					children: action.label
				}),
				action.shortcut ? /* @__PURE__ */ jsx("span", {
					className: "ds-menu__item-shortcut",
					"data-part": "itemShortcut",
					"aria-hidden": "true",
					children: action.shortcut
				}) : null
			]
		}, action.id);
	};
	const renderNode = (node, index) => {
		if (isSeparator(node)) return /* @__PURE__ */ jsx("div", {
			role: "separator",
			"data-part": "separator",
			className: "ds-menu__separator"
		}, `separator-${index}`);
		if (isGroup$3(node)) {
			const groupLabelId = `${listId}-group-${index}`;
			return /* @__PURE__ */ jsxs("div", {
				role: "group",
				"aria-labelledby": groupLabelId,
				"data-part": "group",
				className: "ds-menu__group",
				children: [/* @__PURE__ */ jsx("div", {
					id: groupLabelId,
					"data-part": "groupLabel",
					className: "ds-menu__group-label",
					children: node.group
				}), node.items.map((child) => isSeparator(child) || isGroup$3(child) ? null : renderAction(child))]
			}, `group-${index}`);
		}
		return renderAction(node);
	};
	const icon = triggerIcon === "none" ? void 0 : /* @__PURE__ */ jsx(Icon, {
		name: triggerIcon,
		inline: true
	});
	const overrideStyle = overrides ? overridesToStyle$13(overrides) : void 0;
	const popupClasses = ["ds-menu__popup", entered ? "ds-menu__popup--entered" : null].filter(Boolean).join(" ");
	const { className: _className, style: _style, ...rootProps } = rest;
	return /* @__PURE__ */ jsxs("div", {
		...rootProps,
		"data-ds": "Menu",
		className: "ds-menu",
		children: [anchor ? null : /* @__PURE__ */ jsx("span", {
			"data-part": "trigger",
			className: "ds-menu__trigger",
			children: /* @__PURE__ */ jsx(Button, {
				ref: triggerRef,
				id: triggerId,
				type: "button",
				variant: triggerVariant,
				label,
				iconOnly,
				leadingIcon: iconOnly ? icon : void 0,
				trailingIcon: iconOnly ? void 0 : icon,
				"aria-haspopup": "menu",
				expanded: open,
				"aria-controls": open ? listId : void 0,
				onClick: handleTriggerClick,
				onKeyDown: handleTriggerKeyDown,
				onKeyUp: handleTriggerKeyUp
			})
		}), open && typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsx("div", {
			ref: setPopupRef,
			role: "menu",
			id: listId,
			tabIndex: -1,
			"aria-labelledby": anchor ? void 0 : triggerId,
			"aria-label": anchor ? label : void 0,
			"data-part": "popup",
			"data-vertical": vertical,
			className: popupClasses,
			style: {
				...popupStyle,
				...overrideStyle
			},
			onKeyDown: handleListKeyDown,
			onFocus: handlePopupFocus,
			onBlur: handlePopupBlur,
			children: items.map((item, index) => renderNode(item, index))
		}), container ?? document.body) : null]
	});
}
//#endregion
//#region src/Tooltip.tsx
const TEXT_DEFAULT = {
	fontFamily: "font.family.body",
	fontSize: "font.size.sm",
	lineHeight: "font.lineHeight.normal"
};
/** Hooks for the bindings the bubble styles itself; the typography three are forwarded instead. */
const OVERRIDE_HOOK$15 = {
	radius: "--ds-tooltip-radius",
	paddingBlock: "--ds-tooltip-padding-block",
	paddingInline: "--ds-tooltip-padding-inline",
	offset: "--ds-tooltip-offset",
	maxWidth: "--ds-tooltip-max-width",
	shadow: "--ds-tooltip-shadow",
	layer: "--ds-tooltip-layer",
	enter: "--ds-tooltip-enter",
	exit: "--ds-tooltip-exit"
};
function overridesToStyle$12(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		if (binding in TEXT_DEFAULT) continue;
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$15[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** hoverDelay: motion.duration.base × 3, when `delay` is `default`. */
const HOVER_DELAY = "calc(var(--motion-duration-base) * 3)";
/** warmWindow: motion.duration.base — after one tooltip hides, the next shows with no delay. */
const WARM_WINDOW = "var(--motion-duration-base)";
/** pointerGrace: motion.duration.fast — the pointer may cross the `offset` gap onto the bubble. */
const POINTER_GRACE = "var(--motion-duration-fast)";
const isDev$15 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Shared "warm until" timestamp: a toolbar's tooltips show instantly while one has just hidden. */
let warmUntil = 0;
function matches(query) {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false;
}
/** `0.6s`, `600ms` → milliseconds; anything unresolved (jsdom has no `var()`) is 0. */
function parseTime$4(value) {
	const first = value.split(",")[0]?.trim() ?? "";
	const amount = Number.parseFloat(first);
	if (Number.isNaN(amount)) return 0;
	return first.endsWith("ms") ? amount : amount * 1e3;
}
/**
* Resolves a CSS expression to its computed value by letting the browser evaluate it on a detached
* probe inside `host`, so logic follows the live tokens (and any hook set on `host`).
*/
function resolveComputed(host, property, expression) {
	const probe = document.createElement("span");
	probe.hidden = true;
	probe.style[property] = expression;
	host.appendChild(probe);
	const value = getComputedStyle(probe)[property];
	probe.remove();
	return value;
}
function resolveMs(host, expression) {
	return parseTime$4(resolveComputed(host, "transitionDuration", expression));
}
function mergeIds(existing, id) {
	return existing ? `${existing} ${id}` : id;
}
function assignRef$1(ref, value) {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
}
/** Positions the bubble `gap` away from the trigger on `placement`, flipping to the opposite side when it would overflow the viewport. */
function computePosition$3(triggerRect, popupRect, placement, rtl, gap) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const style = {};
	if (placement === "top" || placement === "bottom") {
		const fitsAbove = triggerRect.top - gap - popupRect.height >= 0;
		const fitsBelow = triggerRect.bottom + gap + popupRect.height <= viewportHeight;
		let side = placement;
		if (side === "top" && !fitsAbove && fitsBelow) side = "bottom";
		else if (side === "bottom" && !fitsBelow && fitsAbove) side = "top";
		const centerX = triggerRect.left + triggerRect.width / 2;
		style.left = Math.min(Math.max(centerX - popupRect.width / 2, 0), Math.max(viewportWidth - popupRect.width, 0));
		if (side === "top") style.bottom = viewportHeight - triggerRect.top + gap;
		else style.top = triggerRect.bottom + gap;
		return {
			style,
			side
		};
	}
	const fitsLeft = triggerRect.left - gap - popupRect.width >= 0;
	const fitsRight = triggerRect.right + gap + popupRect.width <= viewportWidth;
	let side = placement;
	const wantsLeft = side === "start" !== rtl;
	if (wantsLeft && !fitsLeft && fitsRight || !wantsLeft && !fitsRight && fitsLeft) side = side === "start" ? "end" : "start";
	const onLeft = side === "start" !== rtl;
	const centerY = triggerRect.top + triggerRect.height / 2;
	style.top = Math.min(Math.max(centerY - popupRect.height / 2, 0), Math.max(viewportHeight - popupRect.height, 0));
	if (onLeft) style.right = viewportWidth - triggerRect.left + gap;
	else style.left = triggerRect.right + gap;
	return {
		style,
		side
	};
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
function Tooltip({ content, children, placement = "top", describes = true, open, delay = "default", overrides, container }) {
	const tooltipId = useId();
	const [internalOpen, setInternalOpen] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const isOpen = !dismissed && (open ?? internalOpen);
	const [present, setPresent] = useState(isOpen);
	if (isOpen && !present) setPresent(true);
	const [entered, setEntered] = useState(false);
	const [position, setPosition] = useState();
	const [side, setSide] = useState(placement);
	const triggerRef = useRef(null);
	const popupRef = useRef(null);
	const hoveringTrigger = useRef(false);
	const hoveringPopup = useRef(false);
	const focused = useRef(false);
	const showTimer = useRef(null);
	const hideTimer = useRef(null);
	const portalTarget = () => container ?? document.body;
	const clearShow = () => {
		if (showTimer.current) clearTimeout(showTimer.current);
		showTimer.current = null;
	};
	const clearHide = () => {
		if (hideTimer.current) clearTimeout(hideTimer.current);
		hideTimer.current = null;
	};
	const show = (immediate) => {
		clearHide();
		if (immediate || delay === "none" || Date.now() < warmUntil) {
			clearShow();
			setInternalOpen(true);
			return;
		}
		if (showTimer.current) return;
		showTimer.current = setTimeout(() => {
			showTimer.current = null;
			setInternalOpen(true);
		}, resolveMs(portalTarget(), HOVER_DELAY));
	};
	const scheduleHide = () => {
		clearShow();
		if (hideTimer.current) return;
		hideTimer.current = setTimeout(() => {
			hideTimer.current = null;
			if (hoveringTrigger.current || hoveringPopup.current || focused.current) return;
			setInternalOpen(false);
			if (open === void 0) setDismissed(false);
		}, resolveMs(portalTarget(), POINTER_GRACE));
	};
	useEffect(() => {
		setDismissed(false);
	}, [open]);
	useEffect(() => () => {
		clearShow();
		clearHide();
	}, []);
	useLayoutEffect(() => {
		if (!present) return void 0;
		const trigger = triggerRef.current;
		const popup = popupRef.current;
		if (!trigger || !popup) return void 0;
		const reposition = () => {
			const gap = Number.parseFloat(resolveComputed(popup, "paddingLeft", "var(--ds-tooltip-offset)")) || 0;
			const rtl = getComputedStyle(trigger).direction === "rtl";
			const result = computePosition$3(trigger.getBoundingClientRect(), popup.getBoundingClientRect(), placement, rtl, gap);
			setPosition(result.style);
			setSide(result.side);
		};
		reposition();
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [
		present,
		placement,
		content
	]);
	useEffect(() => {
		if (!present) return void 0;
		const popup = popupRef.current;
		if (isOpen) {
			const frame = requestAnimationFrame(() => setEntered(true));
			return () => cancelAnimationFrame(frame);
		}
		setEntered(false);
		const host = popup ?? portalTarget();
		warmUntil = Date.now() + resolveMs(host, WARM_WINDOW);
		const exit = matches("(prefers-reduced-motion: reduce)") ? 0 : resolveMs(host, "var(--ds-tooltip-exit)");
		const timer = setTimeout(() => setPresent(false), exit);
		return () => clearTimeout(timer);
	}, [isOpen, present]);
	useEffect(() => {
		if (!isOpen) return void 0;
		const handleKeyDown = (event) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			event.preventDefault();
			clearShow();
			setDismissed(true);
		};
		document.addEventListener("keydown", handleKeyDown, true);
		return () => document.removeEventListener("keydown", handleKeyDown, true);
	}, [isOpen]);
	useEffect(() => {
		if (!isDev$15) return;
		if (!content) console.warn("Tooltip: `content` is required; it is the trigger’s accessible description or name.");
		const trigger = triggerRef.current;
		if (!trigger) console.warn("Tooltip: the child must forward `ref` to its focusable element.");
		else if (trigger.tabIndex < 0) console.warn("Tooltip: the child must be focusable, or keyboard users can never see the tooltip.");
	}, [content]);
	if (isDev$15 && Children.count(children) !== 1) console.warn("Tooltip: `children` must be exactly one focusable element.");
	const child = Children.only(children);
	const childRef = child.props.ref;
	const setTriggerRef = useCallback((node) => {
		triggerRef.current = node;
		assignRef$1(childRef, node);
	}, [childRef]);
	const cloned = cloneElement(child, {
		ref: setTriggerRef,
		"aria-describedby": describes ? mergeIds(child.props["aria-describedby"], tooltipId) : child.props["aria-describedby"],
		"aria-labelledby": describes ? child.props["aria-labelledby"] : mergeIds(child.props["aria-labelledby"], tooltipId),
		onPointerEnter: (event) => {
			child.props.onPointerEnter?.(event);
			if (event.pointerType === "touch") return;
			hoveringTrigger.current = true;
			show(false);
		},
		onPointerLeave: (event) => {
			child.props.onPointerLeave?.(event);
			hoveringTrigger.current = false;
			scheduleHide();
		},
		onFocus: (event) => {
			child.props.onFocus?.(event);
			focused.current = true;
			show(true);
		},
		onBlur: (event) => {
			child.props.onBlur?.(event);
			if (event.currentTarget.contains(event.relatedTarget)) return;
			focused.current = false;
			scheduleHide();
		}
	});
	const textOverrides = {};
	for (const binding of Object.keys(TEXT_DEFAULT)) textOverrides[binding] = overrides?.[binding] ?? TEXT_DEFAULT[binding];
	const classes = ["ds-tooltip", entered ? "ds-tooltip--entered" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		cloned,
		/* @__PURE__ */ jsx("span", {
			id: tooltipId,
			role: "tooltip",
			"data-ds": "Tooltip",
			className: "ds-tooltip__description",
			children: content
		}),
		present ? createPortal(/* @__PURE__ */ jsx("div", {
			ref: popupRef,
			"data-part": "popup",
			"data-placement": side,
			"aria-hidden": "true",
			className: classes,
			style: {
				...position,
				...overrides ? overridesToStyle$12(overrides) : void 0
			},
			onPointerEnter: () => {
				hoveringPopup.current = true;
				clearHide();
			},
			onPointerLeave: () => {
				hoveringPopup.current = false;
				scheduleHide();
			},
			children: /* @__PURE__ */ jsx(Text, {
				element: "span",
				size: "sm",
				"data-part": "text",
				overrides: textOverrides,
				children: content
			})
		}), portalTarget()) : null
	] });
}
//#endregion
//#region src/Divider.tsx
const isDev$14 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const ROOT_OVERRIDE_HOOK$5 = {
	color: "--ds-divider-color",
	thickness: "--ds-divider-thickness",
	spacing: "--ds-divider-spacing",
	labelGap: "--ds-divider-label-gap"
};
/**
* Divider — Design Schema, category: layout.
*
* When to use:
* Use a Divider between items in a dense list where whitespace alone does not separate them,
* between groups in a menu (Menu renders its own), between toolbar groups (`vertical`), and with a
* `label` as an "or" between alternatives (sign in with email — or — with a provider) or a date
* heading in a feed. Use `spacing` when the divider stands outside a Stack.
*/
function Divider({ ref, orientation = "horizontal", label, semantic = false, spacing = "none", overrides, ...rest }) {
	const labelId = useId();
	const showLabel = Boolean(label) && orientation === "horizontal";
	const isSemantic = semantic || showLabel;
	useEffect(() => {
		if (isDev$14 && Boolean(label) && orientation === "vertical") console.warn("Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.");
	}, [label, orientation]);
	const rootStyle = {};
	const textOverrides = {};
	if (overrides) for (const binding of Object.keys(overrides)) {
		const token = overrides[binding];
		if (!token) continue;
		if (binding === "spacing" && spacing === "none") continue;
		if (!showLabel && (binding === "labelGap" || binding === "labelSize" || binding === "fontFamily")) continue;
		if (binding === "labelSize") textOverrides.fontSize = token;
		else if (binding === "fontFamily") textOverrides.fontFamily = token;
		else {
			const hook = ROOT_OVERRIDE_HOOK$5[binding];
			if (hook) rootStyle[hook] = cssVar(token);
		}
	}
	const style = Object.keys(rootStyle).length > 0 ? rootStyle : void 0;
	const className = [
		"ds-divider",
		`ds-divider--${orientation}`,
		`ds-divider--spacing-${spacing}`,
		showLabel ? "ds-divider--labelled" : null
	].filter(Boolean).join(" ");
	if (!isSemantic) return /* @__PURE__ */ jsx("hr", {
		...rest,
		ref,
		"data-ds": "Divider",
		className,
		style,
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		"data-ds": "Divider",
		className,
		style,
		role: "separator",
		"aria-orientation": orientation,
		"aria-labelledby": showLabel ? labelId : void 0,
		children: showLabel ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("span", {
				className: "ds-divider__line",
				"data-part": "line",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsx(Text, {
				id: labelId,
				element: "span",
				size: "sm",
				tone: "muted",
				"data-part": "label",
				overrides: Object.keys(textOverrides).length > 0 ? textOverrides : void 0,
				children: label
			}),
			/* @__PURE__ */ jsx("span", {
				className: "ds-divider__line",
				"data-part": "line",
				"aria-hidden": "true"
			})
		] }) : null
	});
}
//#endregion
//#region src/Fieldset.tsx
/** copy.* — used verbatim. */
const COPY$22 = { requiredIndicator: " (required)" };
/** fieldsGap → layout.gap.{gap}, resolved per enum value and sent to the Stack as a token path. */
const FIELDS_GAP_TOKEN = {
	tight: "layout.gap.tight",
	normal: "layout.gap.normal",
	loose: "layout.gap.loose"
};
/**
* Bindings Fieldset's own CSS reads. legendSize, legendWeight, helperSize, fontFamily and lineHeight
* reach the composed Texts only through their `overrides`; fieldsGap reaches the Stack only through its `overrides.gap`.
*/
const OVERRIDE_HOOK$14 = {
	partGap: "--ds-fieldset-part-gap",
	disabledOpacity: "--ds-fieldset-disabled-opacity"
};
function overridesToStyle$11(overrides, disabled) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		if (binding === "disabledOpacity" && !disabled) continue;
		const hook = OVERRIDE_HOOK$14[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return Object.keys(style).length > 0 ? style : void 0;
}
/** Drops undefined entries so a Text receives only the overrides that were passed. */
function defined(overrides) {
	const entries = Object.entries(overrides).filter(([, ref]) => ref !== void 0);
	return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
/** Direct children with fragments flattened, so `<>…</>` children count as direct. */
function directChildren(children) {
	return Children.toArray(children).flatMap((child) => isValidElement(child) && child.type === Fragment ? directChildren(child.props.children) : [child]);
}
const NATIVE_FIELDS = /* @__PURE__ */ new Set([
	"input",
	"select",
	"textarea",
	"button",
	"fieldset"
]);
/** A direct child that can take `disabled`: a component, or a native form control. */
function isField(child) {
	return isValidElement(child) && (typeof child.type !== "string" || NATIVE_FIELDS.has(child.type));
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
function Fieldset({ ref, legend, children, description, error, disabled = false, gap = "normal", overrides, ...rest }) {
	const baseId = useId();
	const descriptionId = `${baseId}-description`;
	const errorId = `${baseId}-error`;
	const direct = directChildren(children);
	const fields = direct.filter(isField);
	const allRequired = fields.length > 0 && fields.every((field) => field.props.required === true);
	const renderedChildren = disabled ? direct.map((child) => isField(child) ? cloneElement(child, { disabled: true }) : child) : children;
	const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ");
	const classes = ["ds-fieldset", disabled ? "ds-fieldset--disabled" : null].filter(Boolean).join(" ");
	const legendOverrides = defined({
		fontSize: overrides?.legendSize,
		fontWeight: overrides?.legendWeight,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	const helperOverrides = defined({
		fontSize: overrides?.helperSize,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	const fieldsGap = overrides?.fieldsGap ?? FIELDS_GAP_TOKEN[gap];
	return /* @__PURE__ */ jsxs("fieldset", {
		...rest,
		ref,
		"data-ds": "Fieldset",
		"data-part": "group",
		className: classes,
		style: overrides ? overridesToStyle$11(overrides, disabled) : void 0,
		"aria-describedby": describedBy || void 0,
		"aria-disabled": disabled ? "true" : void 0,
		"aria-invalid": error ? "true" : void 0,
		children: [
			/* @__PURE__ */ jsx("legend", {
				"data-part": "legend",
				className: "ds-fieldset__legend",
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					tone: "default",
					size: "md",
					weight: "medium",
					overrides: legendOverrides,
					children: allRequired ? `${legend}${COPY$22.requiredIndicator}` : legend
				})
			}),
			description ? /* @__PURE__ */ jsx("div", {
				id: descriptionId,
				"data-part": "description",
				className: "ds-fieldset__description",
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					tone: "muted",
					size: "sm",
					overrides: helperOverrides,
					children: description
				})
			}) : null,
			/* @__PURE__ */ jsx("div", {
				"data-part": "fields",
				className: "ds-fieldset__fields",
				children: /* @__PURE__ */ jsx(Stack, {
					overrides: { gap: fieldsGap },
					children: renderedChildren
				})
			}),
			error ? /* @__PURE__ */ jsx("div", {
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				className: "ds-fieldset__error",
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					tone: "danger",
					size: "sm",
					overrides: helperOverrides,
					children: error
				})
			}) : null
		]
	});
}
//#endregion
//#region src/Toast.tsx
/** Bindings drawn by the toast itself; `fontFamily`, `fontSize` and `lineHeight` are forwarded to Text. */
const OVERRIDE_HOOK$13 = {
	radius: "--ds-toast-radius",
	shadow: "--ds-toast-shadow",
	paddingBlock: "--ds-toast-padding-block",
	paddingInline: "--ds-toast-padding-inline",
	gap: "--ds-toast-gap",
	maxWidth: "--ds-toast-max-width",
	enter: "--ds-toast-enter",
	enterOffset: "--ds-toast-enter-offset",
	exit: "--ds-toast-exit"
};
/** Toast binding → the Text binding it is forwarded to on the `message` part. */
const MESSAGE_FORWARDS = {
	fontFamily: "fontFamily",
	fontSize: "fontSize",
	lineHeight: "lineHeight"
};
const REGION_OVERRIDE_HOOK = {
	stackGap: "--ds-toast-stack-gap",
	regionInset: "--ds-toast-region-inset",
	layer: "--ds-toast-layer"
};
function hooksToStyle(hooks, overrides) {
	if (!overrides) return void 0;
	const style = {};
	for (const binding of Object.keys(hooks)) {
		const ref = overrides[binding];
		if (ref) style[hooks[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$21 = {
	dismissLabel: "Dismiss",
	regionLabel: "Notifications"
};
const isDev$13 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Constants `shortDuration` / `longDuration`: motion.duration.loop × 6 / × 12, in ms. */
const LOOP_MULTIPLIER = {
	short: 6,
	long: 12
};
/** A resolved CSS time (`800ms`, `0.8s`) in ms; `null` when it cannot be read. */
function parseTime$3(value) {
	const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
	if (!match) return null;
	const amount = Number(match[1]);
	return match[2] === "s" ? amount * 1e3 : amount;
}
/** The resolved motion.duration.loop on `el`, or `null` when it is 0 or the theme's tokens are not loaded. */
function resolveLoopMs(el) {
	const ms = parseTime$3(getComputedStyle(el).getPropertyValue("--motion-duration-loop"));
	return ms !== null && ms > 0 ? ms : null;
}
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$3() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
const REGION_SELECTOR = "[data-ds=\"ToastRegion\"]";
/** The focusable selector FocusScope walks with, kept in step with it. */
const FOCUSABLE_SELECTOR$6 = [
	"a[href]",
	"area[href]",
	"button",
	"input:not([type=\"hidden\"])",
	"select",
	"textarea",
	"summary",
	"iframe",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]"
].join(",");
function isFocusable(element) {
	if (!(element instanceof HTMLElement)) return false;
	if (!element.matches(FOCUSABLE_SELECTOR$6)) return false;
	if (element.matches(":disabled")) return false;
	return element.getAttribute("tabindex") !== "-1" && element.tabIndex >= 0;
}
function isExcludedSubtree(element) {
	return element.hasAttribute("inert") || element.getAttribute("aria-hidden") === "true";
}
/**
* FocusScope's focusable walker: document order, descending open shadow roots and assigned slot
* nodes so a focusable inside a custom element counts. F6 and the focus restore both use it.
*/
function collectFocusable(root, results = []) {
	for (const child of Array.from(root.children)) {
		if (isExcludedSubtree(child)) continue;
		if (child instanceof HTMLSlotElement) {
			for (const assigned of child.assignedElements({ flatten: true })) {
				if (isExcludedSubtree(assigned)) continue;
				if (isFocusable(assigned)) results.push(assigned);
				if (assigned.shadowRoot) collectFocusable(assigned.shadowRoot, results);
				collectFocusable(assigned, results);
			}
			continue;
		}
		if (isFocusable(child)) results.push(child);
		if (child.shadowRoot) collectFocusable(child.shadowRoot, results);
		collectFocusable(child, results);
	}
	return results;
}
/** Where focus was before it entered the toast region (by F6 or Tab); Escape and the buttons send it back. */
let returnFocusTarget = null;
/** Moves focus to the element it came from, or else the next focusable element after `root` (the previous one when there is none). */
function returnFocus(root) {
	const target = returnFocusTarget;
	returnFocusTarget = null;
	if (target && target.isConnected && !root.contains(target)) {
		target.focus();
		return;
	}
	const candidates = collectFocusable(root.ownerDocument.body).filter((el) => !root.contains(el));
	const isAfter = (el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
	const next = candidates.find(isAfter);
	const previous = next === void 0 ? candidates.filter((el) => !isAfter(el)).pop() : void 0;
	(next ?? previous)?.focus();
}
const ToastRegionContext = createContext(null);
/** Set by the region when `dismiss(toastId)` or `dismiss()` asked this toast to leave. */
const ToastDismissRequestContext = createContext(false);
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
function Toast({ ref, message, tone = "neutral", actionLabel, duration, dismissible = true, toastId: _toastId, onAction, onDismiss, overrides, ...rest }) {
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const regionTiming = useContext(ToastRegionContext);
	const dismissRequested = useContext(ToastDismissRequestContext);
	const [ownLoopMs, setOwnLoopMs] = useState(void 0);
	const loopMs = regionTiming ? regionTiming.loopMs : ownLoopMs;
	const [visible, setVisible] = useState(false);
	const [gone, setGone] = useState(false);
	const dismissedRef = useRef(false);
	const focusWithinRef = useRef(false);
	const timerRef = useRef(null);
	const exitTimerRef = useRef(null);
	const onDismissLatest = useRef(onDismiss);
	onDismissLatest.current = onDismiss;
	const forcedPersistent = Boolean(actionLabel) || tone === "danger";
	const effectiveDuration = forcedPersistent ? "persistent" : duration ?? "short";
	const showDismiss = dismissible || effectiveDuration === "persistent";
	useEffect(() => {
		if (isDev$13 && forcedPersistent && (duration === "short" || duration === "long")) console.warn(`Toast: \`duration: ${duration}\` is ignored — a toast with an action or \`tone: danger\` is persistent until dismissed.`);
	}, [forcedPersistent, duration]);
	useEffect(() => {
		if (regionTiming || !rootRef.current) return;
		setOwnLoopMs(resolveLoopMs(rootRef.current));
	}, [regionTiming]);
	const dismiss = useCallback((reason) => {
		const node = rootRef.current;
		if (dismissedRef.current || !node) return;
		dismissedRef.current = true;
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (node.contains(node.ownerDocument.activeElement)) returnFocus(node.closest(REGION_SELECTOR) ?? node);
		const finish = () => {
			onDismissLatest.current?.(reason);
			setGone(true);
		};
		const exitMs = prefersReducedMotion$3() ? null : parseTime$3(getComputedStyle(node).getPropertyValue("--ds-toast-exit"));
		if (exitMs === null || exitMs <= 0) {
			finish();
			return;
		}
		setVisible(false);
		exitTimerRef.current = setTimeout(finish, exitMs);
	}, []);
	useEffect(() => () => {
		if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
	}, []);
	useEffect(() => {
		if (dismissRequested) dismiss("programmatic");
	}, [dismissRequested, dismiss]);
	useEffect(() => {
		if (prefersReducedMotion$3() || typeof requestAnimationFrame !== "function") {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, []);
	useEffect(() => {
		const node = rootRef.current;
		if (effectiveDuration === "persistent" || loopMs === void 0 || loopMs === null || !node) return void 0;
		let remaining = loopMs * LOOP_MULTIPLIER[effectiveDuration];
		let startedAt = 0;
		let hovering = false;
		let focused = node.contains(node.ownerDocument.activeElement);
		const start = () => {
			if (timerRef.current || dismissedRef.current || hovering || focused || document.hidden) return;
			startedAt = Date.now();
			timerRef.current = setTimeout(() => dismiss("timeout"), remaining);
		};
		const pause = () => {
			if (!timerRef.current) return;
			clearTimeout(timerRef.current);
			timerRef.current = null;
			remaining -= Date.now() - startedAt;
		};
		const handlePointerEnter = () => {
			hovering = true;
			pause();
		};
		const handlePointerLeave = () => {
			hovering = false;
			start();
		};
		const handleFocusIn = () => {
			focused = true;
			pause();
		};
		const handleFocusOut = (event) => {
			if (node.contains(event.relatedTarget)) return;
			focused = false;
			start();
		};
		const handleVisibilityChange = () => {
			if (document.hidden) pause();
			else start();
		};
		start();
		node.addEventListener("pointerenter", handlePointerEnter);
		node.addEventListener("pointerleave", handlePointerLeave);
		node.addEventListener("focusin", handleFocusIn);
		node.addEventListener("focusout", handleFocusOut);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			node.removeEventListener("pointerenter", handlePointerEnter);
			node.removeEventListener("pointerleave", handlePointerLeave);
			node.removeEventListener("focusin", handleFocusIn);
			node.removeEventListener("focusout", handleFocusOut);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [
		effectiveDuration,
		loopMs,
		dismiss
	]);
	useEffect(() => {
		const node = rootRef.current;
		if (!node) return void 0;
		const region = node.closest(REGION_SELECTOR) ?? node;
		const handleFocusIn = (event) => {
			focusWithinRef.current = true;
			const from = event.relatedTarget;
			if (from instanceof HTMLElement && !region.contains(from)) returnFocusTarget = from;
		};
		const handleFocusOut = (event) => {
			if (!node.contains(event.relatedTarget)) focusWithinRef.current = false;
		};
		const handleKeyDown = (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			dismiss("escape");
		};
		node.addEventListener("focusin", handleFocusIn);
		node.addEventListener("focusout", handleFocusOut);
		node.addEventListener("keydown", handleKeyDown);
		return () => {
			node.removeEventListener("focusin", handleFocusIn);
			node.removeEventListener("focusout", handleFocusOut);
			node.removeEventListener("keydown", handleKeyDown);
			if (!focusWithinRef.current) return;
			const active = node.ownerDocument.activeElement;
			if (active && active !== node.ownerDocument.body && !node.contains(active)) return;
			returnFocus(region);
		};
	}, [dismiss]);
	if (gone) return null;
	const handleActionClick = () => {
		onAction?.();
		dismiss("action");
	};
	const messageOverrides = {};
	if (overrides) for (const binding of Object.keys(MESSAGE_FORWARDS)) {
		const tokenRef = overrides[binding];
		if (tokenRef) messageOverrides[MESSAGE_FORWARDS[binding]] = tokenRef;
	}
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Toast",
		"data-part": "toast",
		className: `ds-toast ds-toast--${tone}${visible ? " ds-toast--entered" : ""}`,
		style: hooksToStyle(OVERRIDE_HOOK$13, overrides),
		role: tone === "danger" ? "alert" : "status",
		children: [
			tone !== "neutral" ? /* @__PURE__ */ jsx(Icon, {
				"data-part": "icon",
				name: tone,
				overrides: { color: `color.inverse.status.${tone}` }
			}) : null,
			/* @__PURE__ */ jsx(Text, {
				element: "span",
				size: "md",
				"data-part": "message",
				overrides: messageOverrides,
				children: message
			}),
			actionLabel ? /* @__PURE__ */ jsx("span", {
				className: "ds-toast__action",
				"data-part": "actionButton",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					inverse: true,
					size: "sm",
					label: actionLabel,
					onClick: handleActionClick
				})
			}) : null,
			showDismiss ? /* @__PURE__ */ jsx("span", {
				className: "ds-toast__dismiss",
				"data-part": "dismissButton",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					inverse: true,
					size: "sm",
					iconOnly: true,
					label: COPY$21.dismissLabel,
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "close",
						inline: true
					}),
					onClick: () => dismiss("dismiss-button")
				})
			}) : null
		]
	});
}
/** "Do not stack more than three; the region replaces the oldest." */
const MAX_STACKED = 3;
let entries = [];
const listeners = /* @__PURE__ */ new Set();
let entryCounter = 0;
let regionMountCount = 0;
let autoRoot = null;
function notify() {
	for (const listener of listeners) listener();
}
function subscribe(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function getSnapshot() {
	return entries;
}
function settle(entry, reason) {
	entry.options.onDismiss?.(reason);
	entry.resolve({ reason });
}
/** A toast finished leaving (timeout, button, Escape, action, programmatic): report, then remove. */
function removeEntry(key, reason) {
	const entry = entries.find((item) => item.key === key);
	if (!entry) return;
	settle(entry, reason);
	entries = entries.filter((item) => item.key !== key);
	notify();
}
/** Adds a toast; one with the same toastId, or the oldest beyond three, leaves immediately as `replaced`. */
function pushEntry(entry) {
	const id = entry.options.toastId;
	const replaced = id === void 0 ? void 0 : entries.find((item) => item.options.toastId === id);
	let next = replaced ? entries.map((item) => item === replaced ? entry : item) : [...entries, entry];
	const evicted = next.length > MAX_STACKED ? next.slice(0, next.length - MAX_STACKED) : [];
	next = next.slice(evicted.length);
	if (replaced) settle(replaced, "replaced");
	for (const item of evicted) settle(item, "replaced");
	entries = next;
	notify();
}
/**
* ToastRegion — the one persistent `role="region"` live region that holds every visible Toast.
*
* Mount it once at the app root, or let `toast()` create it on first use. It exists before any
* toast so announcements fire; F6 moves focus into it from anywhere and back again.
*/
function ToastRegion({ ref, overrides, container }) {
	const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	const regionRef = useRef(null);
	useImperativeHandle(ref, () => regionRef.current, []);
	const [timing, setTiming] = useState({ loopMs: void 0 });
	useEffect(() => {
		regionMountCount += 1;
		return () => {
			regionMountCount -= 1;
		};
	}, []);
	useEffect(() => {
		if (regionRef.current) setTiming({ loopMs: resolveLoopMs(regionRef.current) });
	}, []);
	useEffect(() => {
		if (list.length === 0) return void 0;
		const handleKeyDown = (event) => {
			if (event.key !== "F6") return;
			const region = regionRef.current;
			if (!region) return;
			if (region.contains(document.activeElement)) {
				const target = returnFocusTarget;
				returnFocusTarget = null;
				if (!target || !target.isConnected) return;
				event.preventDefault();
				target.focus();
				return;
			}
			const first = collectFocusable(region)[0];
			if (!first) return;
			event.preventDefault();
			const active = document.activeElement;
			returnFocusTarget = active instanceof HTMLElement && active !== document.body ? active : null;
			first.focus();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [list.length]);
	if (typeof document === "undefined") return null;
	return createPortal(/* @__PURE__ */ jsx("div", {
		ref: regionRef,
		role: "region",
		"aria-label": COPY$21.regionLabel,
		"aria-live": "polite",
		"data-ds": "ToastRegion",
		"data-part": "region",
		className: "ds-toast-region",
		style: hooksToStyle(REGION_OVERRIDE_HOOK, overrides),
		children: /* @__PURE__ */ jsx(ToastRegionContext.Provider, {
			value: timing,
			children: list.map((entry) => /* @__PURE__ */ jsx(ToastDismissRequestContext.Provider, {
				value: entry.dismissRequested,
				children: /* @__PURE__ */ jsx(Toast, {
					message: entry.options.message,
					tone: entry.options.tone,
					actionLabel: entry.options.actionLabel,
					duration: entry.options.duration,
					dismissible: entry.options.dismissible,
					toastId: entry.options.toastId,
					onAction: entry.options.onAction,
					onDismiss: (reason) => removeEntry(entry.key, reason)
				})
			}, entry.key))
		})
	}), container ?? document.body);
}
/**
* Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
* rendered: `toast({ message: 'Link copied' })`. Resolves with `{ reason }` when the toast leaves.
*/
function toast(options) {
	return new Promise((resolve) => {
		const entry = {
			key: ++entryCounter,
			options,
			dismissRequested: false,
			resolve
		};
		if (regionMountCount > 0 || autoRoot || typeof document === "undefined") {
			pushEntry(entry);
			return;
		}
		const host = document.createElement("div");
		document.body.appendChild(host);
		const root = createRoot(host);
		autoRoot = root;
		flushSync(() => root.render(/* @__PURE__ */ jsx(ToastRegion, {})));
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => pushEntry(entry));
		else pushEntry(entry);
	});
}
/**
* Removes the toast shown with `toastId`, or every toast when called with no id; each leaves
* through its exit transition with reason `programmatic`.
*/
function dismiss(toastId) {
	const matches = (entry) => toastId === void 0 || entry.options.toastId === toastId;
	const targets = entries.filter((entry) => matches(entry) && !entry.dismissRequested);
	if (targets.length === 0) return;
	if (regionMountCount === 0) {
		entries = entries.filter((entry) => !targets.includes(entry));
		for (const entry of targets) settle(entry, "programmatic");
		notify();
		return;
	}
	entries = entries.map((entry) => targets.includes(entry) ? {
		...entry,
		dismissRequested: true
	} : entry);
	notify();
}
//#endregion
//#region src/Popover.tsx
const OVERRIDE_HOOK$12 = {
	border: "--ds-popover-border",
	borderWidth: "--ds-popover-border-width",
	shadow: "--ds-popover-shadow",
	radius: "--ds-popover-radius",
	inset: "--ds-popover-inset",
	partGap: "--ds-popover-part-gap",
	offset: "--ds-popover-offset",
	arrowSize: "--ds-popover-arrow-size",
	maxWidth: "--ds-popover-max-width",
	layer: "--ds-popover-layer",
	enter: "--ds-popover-enter",
	enterDistance: "--ds-popover-enter-distance",
	exit: "--ds-popover-exit"
};
function overridesToStyle$10(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$12[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
const COPY$20 = { closeLabel: "Close" };
const TABBABLE_SELECTOR = [
	"a[href]",
	"area[href]",
	"button",
	"input:not([type=\"hidden\"])",
	"select",
	"textarea",
	"summary",
	"iframe",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]"
].join(",");
function tabbablesIn$1(root) {
	return Array.from(root.querySelectorAll(TABBABLE_SELECTOR)).filter((element) => !element.matches(":disabled") && element.tabIndex >= 0 && !element.hasAttribute("data-focus-sentinel") && !element.closest("[inert]"));
}
function supportsPopoverApi() {
	return typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";
}
/** Longest transition on the element in milliseconds; 0 when there is none (reduced motion, jsdom). */
function transitionMs(element) {
	const values = getComputedStyle(element).transitionDuration.split(",");
	let longest = 0;
	for (const value of values) {
		const trimmed = value.trim();
		const amount = parseFloat(trimmed);
		if (Number.isNaN(amount)) continue;
		longest = Math.max(longest, trimmed.endsWith("ms") ? amount : amount * 1e3);
	}
	return longest;
}
function clamp$1(value, min, max) {
	return Math.min(Math.max(value, min), Math.max(min, max));
}
/** Preferred physical side for `placement`; `start`/`end` resolve from the trigger's direction. */
function preferredSide(placement, rtl) {
	if (placement === "start") return rtl ? "right" : "left";
	if (placement === "end") return rtl ? "left" : "right";
	return placement.startsWith("top") ? "top" : "bottom";
}
const OPPOSITE = {
	top: "bottom",
	bottom: "top",
	left: "right",
	right: "left"
};
/**
* Positions the fixed panel from the trigger rect: flips to the opposite side when the preferred
* one overflows and the opposite fits, then shifts along the cross axis to stay in the viewport.
* The offset itself is the panel's margin on the trigger side (CSS, from the `offset` hook).
*/
function positionPanel(trigger, panel, placement) {
	const rtl = getComputedStyle(trigger).direction === "rtl";
	const t = trigger.getBoundingClientRect();
	const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
	const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
	let side = preferredSide(placement, rtl);
	if (panel.dataset.side !== side) panel.dataset.side = side;
	const computed = getComputedStyle(panel);
	const offset = Math.max(parseFloat(computed.marginTop) || 0, parseFloat(computed.marginBottom) || 0, parseFloat(computed.marginLeft) || 0, parseFloat(computed.marginRight) || 0);
	const p = panel.getBoundingClientRect();
	const fits = (candidate) => {
		if (candidate === "bottom") return t.bottom + offset + p.height <= viewportHeight;
		if (candidate === "top") return t.top - offset - p.height >= 0;
		if (candidate === "left") return t.left - offset - p.width >= 0;
		return t.right + offset + p.width <= viewportWidth;
	};
	if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];
	if (panel.dataset.side !== side) panel.dataset.side = side;
	const coords = {
		top: "",
		right: "",
		bottom: "",
		left: ""
	};
	if (side === "top" || side === "bottom") {
		const align = placement.endsWith("-start") ? "start" : placement.endsWith("-end") ? "end" : "center";
		let x = t.left + (t.width - p.width) / 2;
		if (align === "start") x = rtl ? t.right - p.width : t.left;
		if (align === "end") x = rtl ? t.left : t.right - p.width;
		coords.left = `${clamp$1(x, 0, viewportWidth - p.width)}px`;
		coords.top = side === "bottom" ? `${t.bottom}px` : `${t.top - p.height - offset}px`;
	} else {
		coords.top = `${clamp$1(t.top + (t.height - p.height) / 2, 0, viewportHeight - p.height)}px`;
		coords.left = side === "right" ? `${t.right}px` : `${t.left - p.width - offset}px`;
	}
	for (const key of [
		"top",
		"right",
		"bottom",
		"left"
	]) if (panel.style[key] !== coords[key]) panel.style[key] = coords[key];
}
function assignRef(ref, value) {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
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
function Popover({ ref, trigger, children, heading, headingLevel = "3", open: openProp, placement = "bottom", modal = false, showArrow = false, dismissible = true, onOpenChange, container, overrides }) {
	const generatedId = useId();
	const panelId = `ds-popover${generatedId}-panel`;
	const headingId = `ds-popover${generatedId}-heading`;
	const isControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? openProp : internalOpen;
	const [exiting, setExiting] = useState(false);
	const [previousOpen, setPreviousOpen] = useState(open);
	if (previousOpen !== open) {
		setPreviousOpen(open);
		setExiting(!open);
	}
	const mounted = open || exiting;
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const bodyRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	const restoreFocusRef = useRef(true);
	const escapeHandledRef = useRef(false);
	const latest = useRef({
		placement,
		modal
	});
	latest.current = {
		placement,
		modal
	};
	const validTrigger = isValidElement(trigger);
	if (process.env.NODE_ENV !== "production" && !validTrigger) console.warn("Popover: `trigger` must be exactly one element (usually a Button).");
	const changeOpen = (next, reason) => {
		restoreFocusRef.current = next || reason !== "outside" && reason !== "tab-out";
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const setPanelRef = (node) => {
		panelRef.current = node;
		assignRef(ref, node);
	};
	useLayoutEffect(() => {
		const panel = panelRef.current;
		if (!panel) return void 0;
		if (!open) {
			if (panel instanceof HTMLDialogElement) {
				if (typeof panel.close === "function") panel.close();
				else panel.removeAttribute("open");
			} else if (supportsPopoverApi() && panel.matches(":popover-open")) panel.hidePopover();
			document.documentElement.classList.remove("ds-popover-lock-scroll");
			const focusInside = panel.contains(document.activeElement) || document.activeElement === document.body;
			if (restoreFocusRef.current && focusInside) triggerRef.current?.focus();
			let done = false;
			const finish = () => {
				if (done) return;
				done = true;
				setExiting(false);
			};
			const duration = transitionMs(panel);
			if (duration === 0) {
				finish();
				return;
			}
			const handleEnd = (event) => {
				if (event.target === panel) finish();
			};
			panel.addEventListener("transitionend", handleEnd);
			panel.addEventListener("transitioncancel", handleEnd);
			const timer = window.setTimeout(finish, duration);
			return () => {
				panel.removeEventListener("transitionend", handleEnd);
				panel.removeEventListener("transitioncancel", handleEnd);
				window.clearTimeout(timer);
			};
		}
		if (panel instanceof HTMLDialogElement) {
			if (!panel.open) {
				if (typeof panel.showModal === "function") panel.showModal();
				else panel.setAttribute("open", "");
			}
			document.documentElement.classList.add("ds-popover-lock-scroll");
		} else if (supportsPopoverApi() && !panel.matches(":popover-open")) panel.showPopover();
		const reposition = () => {
			const anchor = triggerRef.current;
			if (anchor && panelRef.current) positionPanel(anchor, panelRef.current, latest.current.placement);
		};
		reposition();
		((bodyRef.current ? tabbablesIn$1(bodyRef.current)[0] : void 0) ?? closeButtonRef.current ?? headingRef.current ?? panel).focus();
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
			document.documentElement.classList.remove("ds-popover-lock-scroll");
		};
	}, [open, modal]);
	useLayoutEffect(() => {
		const anchor = triggerRef.current;
		const panel = panelRef.current;
		if (open && anchor && panel) positionPanel(anchor, panel, placement);
	}, [placement, open]);
	useEffect(() => {
		if (!open || modal) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
			changeOpen(false, "outside");
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	});
	const handlePanelKeyDown = (event) => {
		if (!open || event.defaultPrevented) return;
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			escapeHandledRef.current = true;
			setTimeout(() => {
				escapeHandledRef.current = false;
			}, 0);
			changeOpen(false, "escape");
			return;
		}
		if (event.key !== "Tab" || modal || event.altKey || event.ctrlKey || event.metaKey) return;
		const panel = panelRef.current;
		if (!panel) return;
		const focusables = tabbablesIn$1(panel);
		const active = document.activeElement;
		const atStart = focusables.length === 0 || active === focusables[0];
		const atEnd = focusables.length === 0 || active === focusables[focusables.length - 1];
		if (event.shiftKey && atStart) {
			event.preventDefault();
			triggerRef.current?.focus();
			changeOpen(false, "tab-out");
		} else if (!event.shiftKey && atEnd) {
			triggerRef.current?.focus();
			changeOpen(false, "tab-out");
		}
	};
	const handleCloseTargetClick = (event) => {
		const button = closeButtonRef.current;
		if (!button || button.contains(event.target)) return;
		button.click();
	};
	const handleCancel = (event) => {
		event.preventDefault();
		if (escapeHandledRef.current || !open) return;
		changeOpen(false, "escape");
	};
	const triggerElement = validTrigger ? trigger : null;
	const triggerProps = triggerElement?.props ?? {};
	const triggerId = triggerProps.id ?? `ds-popover${generatedId}-trigger`;
	const clonedTrigger = triggerElement ? cloneElement(triggerElement, {
		id: triggerId,
		ref: (node) => {
			triggerRef.current = node;
			assignRef(triggerProps.ref, node);
		},
		"aria-expanded": open ? "true" : "false",
		"aria-controls": mounted ? panelId : void 0,
		onClick: (event) => {
			triggerProps.onClick?.(event);
			changeOpen(!open, "trigger");
		}
	}) : trigger;
	const PanelTag = modal ? "dialog" : "div";
	const panelAttributes = {
		ref: setPanelRef,
		id: panelId,
		role: "dialog",
		"aria-modal": modal ? "true" : void 0,
		"aria-labelledby": heading ? headingId : triggerId,
		"data-ds": "Popover",
		"data-part": "panel",
		"data-state": open ? "open" : "closed",
		className: "ds-popover",
		style: overrides ? overridesToStyle$10(overrides) : void 0,
		tabIndex: -1,
		onKeyDown: handlePanelKeyDown
	};
	const panelNode = mounted ? /* @__PURE__ */ jsxs(PanelTag, {
		...panelAttributes,
		...modal ? { onCancel: handleCancel } : { popover: supportsPopoverApi() ? "manual" : void 0 },
		children: [showArrow ? /* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			className: "ds-popover__arrow",
			"data-part": "arrow"
		}) : null, /* @__PURE__ */ jsx(FocusScope, {
			trapped: modal,
			autoFocus: "none",
			restoreFocus: false,
			active: open,
			"data-part": "focusScope",
			children: /* @__PURE__ */ jsxs("div", {
				className: "ds-popover__content",
				children: [heading || dismissible ? /* @__PURE__ */ jsxs("div", {
					className: "ds-popover__header",
					children: [heading ? /* @__PURE__ */ jsx("div", {
						className: "ds-popover__heading",
						"data-part": "heading",
						children: /* @__PURE__ */ jsx(Heading, {
							level: headingLevel,
							id: headingId,
							ref: headingRef,
							tabIndex: -1,
							children: heading
						})
					}) : null, dismissible ? /* @__PURE__ */ jsx("span", {
						className: "ds-popover__close",
						"data-part": "closeButton",
						onClick: handleCloseTargetClick,
						children: /* @__PURE__ */ jsx(Button, {
							ref: closeButtonRef,
							variant: "ghost",
							size: "sm",
							iconOnly: true,
							label: COPY$20.closeLabel,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "close",
								inline: true
							}),
							onClick: () => changeOpen(false, "close-button")
						})
					}) : null]
				}) : null, /* @__PURE__ */ jsx(Box, {
					"data-part": "body",
					ref: bodyRef,
					children
				})]
			})
		})]
	}) : null;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [clonedTrigger, panelNode ? createPortal(panelNode, container ?? document.body) : null] });
}
//#endregion
//#region src/BottomSheet.tsx
const OVERRIDE_HOOK$11 = {
	scrim: "--ds-bottom-sheet-scrim",
	shadow: "--ds-bottom-sheet-shadow",
	radius: "--ds-bottom-sheet-radius",
	handleHeight: "--ds-bottom-sheet-handle-height",
	handleWidth: "--ds-bottom-sheet-handle-width",
	handleRadius: "--ds-bottom-sheet-handle-radius",
	headerPaddingTop: "--ds-bottom-sheet-header-padding-top",
	handleGap: "--ds-bottom-sheet-handle-gap",
	headerGap: "--ds-bottom-sheet-header-gap",
	inset: "--ds-bottom-sheet-inset",
	partGap: "--ds-bottom-sheet-part-gap",
	footerGap: "--ds-bottom-sheet-footer-gap",
	layer: "--ds-bottom-sheet-layer",
	enter: "--ds-bottom-sheet-enter",
	exit: "--ds-bottom-sheet-exit"
};
/**
* Bindings sharing a name with a Dialog binding; the wide presentation forwards those the caller set
* to Dialog's `overrides`, so Dialog keeps its own tokens (its `layer.dialog` included) otherwise.
* The handle bindings, `headerPaddingTop` and `handleGap` have no counterpart there, and a locked
* binding (`surface`, `maxWidth`, `minTarget`, the focus ring) is never forwarded.
*/
const DIALOG_FORWARDED = [
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
function overridesToStyle$9(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$11[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** copy.* — used verbatim. */
const COPY$19 = { closeLabel: "Close" };
/** constants.dismissDistance — fraction of the sheet height a downward drag must pass to dismiss on release. */
const DISMISS_DISTANCE$1 = .25;
/** constants.dismissVelocity — downward px/ms at release that dismisses whatever the distance travelled. */
const DISMISS_VELOCITY$1 = 1.5;
/** constants.dragSlop — `space.1`, read from the resolved custom property at gesture time. */
const DRAG_SLOP_TOKEN$1 = "--space-1";
/**
* `space.1` in px: the token resolves to a rem length, so it is multiplied by the root font size.
* An unresolvable value (no theme stylesheet, jsdom) counts as 0, as the doc says.
*/
function resolveDragSlop$1(element) {
	const raw = getComputedStyle(element).getPropertyValue(DRAG_SLOP_TOKEN$1).trim();
	const length = parseFloat(raw);
	if (!Number.isFinite(length)) return 0;
	if (!raw.endsWith("rem") && !raw.endsWith("em")) return length;
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	return Number.isFinite(rootFontSize) ? length * rootFontSize : 0;
}
const FOCUSABLE_SELECTOR$5 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled]):not([type=\"hidden\"])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
function firstFocusableIn(root) {
	if (!root) return null;
	for (const element of Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR$5))) if (!element.hasAttribute("data-focus-sentinel") && !element.closest("[inert]")) return element;
	return null;
}
/** True when the surface has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition$2(element) {
	const durations = getComputedStyle(element).transitionDuration;
	if (!durations) return true;
	return durations.split(",").every((duration) => parseFloat(duration) === 0);
}
/** Scroll lock is reference-counted so an overlay opened over the sheet cannot release it early. */
let scrollLockCount$1 = 0;
function lockScroll$1() {
	scrollLockCount$1 += 1;
	document.documentElement.classList.add("ds-bottom-sheet-lock-scroll");
	return () => {
		scrollLockCount$1 -= 1;
		if (scrollLockCount$1 === 0) document.documentElement.classList.remove("ds-bottom-sheet-lock-scroll");
	};
}
/**
* maxWidth — `layout.maxWidth.prose`, read from the loaded theme, since a media query cannot read a
* custom property. Wide is `(width > token)`; exactly the token width is still a sheet. When the token
* does not resolve (no theme stylesheet, jsdom, SSR) the sheet presentation renders.
*/
function wideQuery$1() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
	const breakpoint = getComputedStyle(document.documentElement).getPropertyValue("--layout-max-width-prose").trim();
	if (!breakpoint) return null;
	return window.matchMedia(`(width > ${breakpoint})`);
}
function useIsWideViewport() {
	const [isWide, setIsWide] = useState(() => wideQuery$1()?.matches ?? false);
	useEffect(() => {
		const query = wideQuery$1();
		if (!query) return void 0;
		const update = () => setIsWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return isWide;
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
function BottomSheet({ ref, open, heading, hideHeading = false, children, footer, height = "content", dismissible = true, dragToDismiss = true, onClose, onDragDismiss, container, overrides, className: _className, style: _style, ...rest }) {
	const isWide = useIsWideViewport();
	const headingId = `ds-bottom-sheet${useId()}-heading`;
	const dialogRef = useRef(null);
	const setDialogNode = useCallback((node) => {
		dialogRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const footerRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	/** True from the moment Escape is reported until the end of the task, so the browser's `cancel` and
	* `close` for that same key are not reported a second time. */
	const escapeReportedRef = useRef(false);
	const selfClosingRef = useRef(false);
	const dragRef = useRef(null);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const [dragPhase, setDragPhase] = useState("idle");
	const latest = useRef({ open });
	latest.current = { open };
	const warnedRef = useRef(false);
	if (process.env.NODE_ENV !== "production" && !heading && !warnedRef.current) {
		warnedRef.current = true;
		console.warn("BottomSheet: `heading` is required and becomes the accessible name; it must not be empty.");
	}
	if (isWide ? present !== open : open && !present) setPresent(open);
	/** Initial focus: the body, then the footer, then the close button, then the heading (tabindex -1). */
	const placeInitialFocus = () => {
		const target = firstFocusableIn(bodyRef.current) ?? firstFocusableIn(footerRef.current) ?? closeButtonRef.current;
		if (target) {
			target.focus();
			return;
		}
		const headingElement = headingRef.current;
		if (!headingElement) return;
		if (headingElement.tabIndex !== -1) headingElement.tabIndex = -1;
		headingElement.focus();
	};
	useLayoutEffect(() => {
		if (!present || isWide) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		selfClosingRef.current = false;
		if (!dialog.open) {
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
		}
		placeInitialFocus();
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [present, isWide]);
	useEffect(() => {
		if (open || !present || isWide) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		const finish = () => {
			if (dialog?.open) {
				selfClosingRef.current = true;
				if (typeof dialog.close === "function") dialog.close();
				else dialog.open = false;
			}
			setPresent(false);
		};
		if (!surface || !dialog?.open || hasNoTransition$2(surface)) {
			finish();
			return;
		}
		const handleExited = (event) => {
			if (event.target === surface && event.propertyName === "transform") finish();
		};
		surface.addEventListener("transitionend", handleExited);
		return () => surface.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		isWide
	]);
	useLayoutEffect(() => {
		const surface = surfaceRef.current;
		if (dragPhase === "held") {
			setDragPhase(open ? "settling" : "exiting");
			return;
		}
		if (dragPhase === "exiting") {
			if (open) {
				setDragPhase("settling");
				return;
			}
			if (surface) surface.style.transform = "";
			setDragPhase("idle");
			return;
		}
		if (dragPhase !== "settling") return void 0;
		if (!surface) {
			setDragPhase("idle");
			return;
		}
		surface.style.transform = "";
		if (hasNoTransition$2(surface)) {
			setDragPhase("idle");
			return;
		}
		const handleSettled = (event) => {
			if (event.target === surface && event.propertyName === "transform") setDragPhase("idle");
		};
		surface.addEventListener("transitionend", handleSettled);
		return () => surface.removeEventListener("transitionend", handleSettled);
	}, [dragPhase, open]);
	useEffect(() => {
		if (!present || isWide) return void 0;
		return lockScroll$1();
	}, [present, isWide]);
	/** Each Escape is reported exactly once, whichever of keydown, `cancel` or `close` reaches us first. */
	const reportEscape = () => {
		escapeReportedRef.current = true;
		setTimeout(() => {
			escapeReportedRef.current = false;
		}, 0);
		onClose?.("escape");
	};
	/** Reopen after a close the component did not ask for, and put focus back in. */
	const reopenAfterNativeClose = () => {
		requestAnimationFrame(() => {
			const dialog = dialogRef.current;
			if (!dialog || dialog.open || !latest.current.open) return;
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
			placeInitialFocus();
		});
	};
	const handleKeyDown = (event) => {
		rest.onKeyDown?.(event);
		if (event.key !== "Escape" || event.defaultPrevented || !open) return;
		event.preventDefault();
		if (!escapeReportedRef.current) reportEscape();
	};
	const handleCancel = (event) => {
		event.preventDefault();
		if (escapeReportedRef.current || !open) return;
		reportEscape();
	};
	const handleNativeClose = () => {
		if (selfClosingRef.current) {
			selfClosingRef.current = false;
			return;
		}
		if (!open) return;
		if (!escapeReportedRef.current) reportEscape();
		reopenAfterNativeClose();
	};
	const handleScrimClick = () => {
		if (!open || !dismissible) return;
		onClose?.("scrim");
	};
	const handleCloseTargetClick = (event) => {
		const button = closeButtonRef.current;
		if (button && button.contains(event.target)) return;
		button?.focus();
		onClose?.("close-button");
	};
	const canDrag = dragToDismiss && dismissible;
	const handleHeaderPointerDown = (event) => {
		if (!canDrag || !open || dragRef.current) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		if (!Number.isFinite(event.clientY)) return;
		dragRef.current = {
			pointerId: event.pointerId,
			startY: event.clientY,
			originY: event.clientY,
			claimed: false,
			previous: null,
			last: null
		};
	};
	const handleHeaderPointerMove = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		if (!drag || drag.pointerId !== event.pointerId || !surface) return;
		if (!Number.isFinite(event.clientY)) return;
		if (!drag.claimed) {
			const moved = event.clientY - drag.startY;
			if (moved <= 0 || moved < resolveDragSlop$1(surface)) return;
			drag.claimed = true;
			drag.originY = event.clientY;
			if (typeof event.currentTarget.setPointerCapture === "function") event.currentTarget.setPointerCapture(event.pointerId);
			setDragPhase("dragging");
		}
		drag.previous = drag.last;
		drag.last = {
			y: event.clientY,
			time: event.timeStamp
		};
		surface.style.transform = `translateY(${Math.max(0, event.clientY - drag.originY)}px)`;
	};
	const endDrag = (event, cancelled) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		dragRef.current = null;
		const surface = surfaceRef.current;
		if (!drag.claimed || !surface) return;
		const travelled = Number.isFinite(event.clientY) ? Math.max(0, event.clientY - drag.originY) : 0;
		const sheetHeight = surface.getBoundingClientRect().height;
		const pastDistance = sheetHeight > 0 && travelled > sheetHeight * DISMISS_DISTANCE$1;
		let velocity = 0;
		if (drag.previous && drag.last && drag.last.time > drag.previous.time) velocity = (drag.last.y - drag.previous.y) / (drag.last.time - drag.previous.time);
		if (cancelled || !open || !(pastDistance || velocity > DISMISS_VELOCITY$1)) {
			setDragPhase("settling");
			return;
		}
		setDragPhase("held");
		onDragDismiss?.();
		onClose?.("drag");
	};
	if (isWide) {
		let dialogOverrides;
		for (const binding of DIALOG_FORWARDED) {
			const value = overrides?.[binding];
			if (value) dialogOverrides = {
				...dialogOverrides,
				[binding]: value
			};
		}
		return /* @__PURE__ */ jsx(Dialog, {
			...rest,
			ref,
			open,
			heading,
			hideHeading,
			footer,
			size: "md",
			dismissible,
			onClose,
			container,
			overrides: dialogOverrides,
			children
		});
	}
	if (!present) return null;
	const classes = [
		"ds-bottom-sheet",
		`ds-bottom-sheet--${height}`,
		canDrag ? "ds-bottom-sheet--draggable" : null,
		visible && open ? "ds-bottom-sheet--visible" : null,
		dragPhase === "dragging" ? "ds-bottom-sheet--dragging" : null,
		dragPhase === "settling" ? "ds-bottom-sheet--settling" : null
	].filter(Boolean).join(" ");
	const insetOverride = overrides?.inset;
	const footerGapOverride = overrides?.footerGap;
	const hasFooter = footer !== void 0 && footer !== null && footer !== false;
	const showHandle = canDrag;
	const showClose = dismissible;
	/** A header with no visible heading, no handle and no close button is not rendered. */
	const showHeader = !hideHeading || showHandle || showClose;
	const headingNode = /* @__PURE__ */ jsx("div", {
		className: hideHeading ? "ds-bottom-sheet__heading ds-bottom-sheet__visually-hidden" : "ds-bottom-sheet__heading",
		"data-part": "heading",
		children: /* @__PURE__ */ jsx(Heading, {
			level: "2",
			id: headingId,
			ref: headingRef,
			children: heading
		})
	});
	const node = /* @__PURE__ */ jsxs("dialog", {
		...rest,
		ref: setDialogNode,
		"data-ds": "BottomSheet",
		className: classes,
		style: overrides ? overridesToStyle$9(overrides) : void 0,
		"aria-modal": "true",
		"aria-labelledby": headingId,
		onKeyDown: handleKeyDown,
		onCancel: handleCancel,
		onClose: handleNativeClose,
		children: [/* @__PURE__ */ jsx("div", {
			className: "ds-bottom-sheet__scrim",
			"data-part": "scrim",
			onClick: handleScrimClick
		}), /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			children: /* @__PURE__ */ jsx("div", {
				className: "ds-bottom-sheet__scope",
				"data-part": "focusScope",
				children: /* @__PURE__ */ jsxs("div", {
					className: "ds-bottom-sheet__surface",
					ref: surfaceRef,
					"data-part": "surface",
					children: [
						showHeader ? /* @__PURE__ */ jsxs("div", {
							className: "ds-bottom-sheet__header",
							"data-part": "header",
							onPointerDown: handleHeaderPointerDown,
							onPointerMove: handleHeaderPointerMove,
							onPointerUp: (event) => endDrag(event, false),
							onPointerCancel: (event) => endDrag(event, true),
							children: [showHandle ? /* @__PURE__ */ jsx("span", {
								className: "ds-bottom-sheet__handle",
								"data-part": "handle",
								"aria-hidden": "true"
							}) : null, /* @__PURE__ */ jsxs("div", {
								className: "ds-bottom-sheet__title-row",
								children: [headingNode, showClose ? /* @__PURE__ */ jsx("span", {
									className: "ds-bottom-sheet__close",
									"data-part": "closeButton",
									onClick: handleCloseTargetClick,
									children: /* @__PURE__ */ jsx(Button, {
										ref: closeButtonRef,
										variant: "ghost",
										size: "sm",
										iconOnly: true,
										label: COPY$19.closeLabel,
										leadingIcon: /* @__PURE__ */ jsx(Icon, {
											name: "close",
											inline: true
										}),
										onClick: () => onClose?.("close-button")
									})
								}) : null]
							})]
						}) : headingNode,
						/* @__PURE__ */ jsx("div", {
							className: "ds-bottom-sheet__scroll",
							children: /* @__PURE__ */ jsx(Box, {
								"data-part": "body",
								ref: bodyRef,
								overrides: insetOverride ? { paddingInline: insetOverride } : void 0,
								children
							})
						}),
						hasFooter ? /* @__PURE__ */ jsx("div", {
							className: "ds-bottom-sheet__footer",
							"data-part": "footer",
							ref: footerRef,
							children: /* @__PURE__ */ jsx(Stack, {
								direction: "horizontal",
								justify: "end",
								overrides: footerGapOverride ? { gap: footerGapOverride } : void 0,
								children: footer
							})
						}) : null
					]
				})
			})
		})]
	});
	return createPortal(node, container ?? document.body);
}
//#endregion
//#region src/ActionSheet.tsx
/** Host hooks; the sheet's stylesheet reads each one. */
const OVERRIDE_HOOK$10 = {
	scrim: "--ds-action-sheet-scrim",
	shadow: "--ds-action-sheet-shadow",
	radius: "--ds-action-sheet-radius",
	itemPaddingBlock: "--ds-action-sheet-item-padding-block",
	itemPaddingInline: "--ds-action-sheet-item-padding-inline",
	itemGap: "--ds-action-sheet-item-gap",
	headerPaddingBlock: "--ds-action-sheet-header-padding-block",
	headerGap: "--ds-action-sheet-header-gap",
	handleHeight: "--ds-action-sheet-handle-height",
	handleWidth: "--ds-action-sheet-handle-width",
	handleRadius: "--ds-action-sheet-handle-radius",
	titleSize: "--ds-action-sheet-title-size",
	fontFamily: "--ds-action-sheet-font-family",
	fontSize: "--ds-action-sheet-font-size",
	lineHeight: "--ds-action-sheet-line-height",
	divider: "--ds-action-sheet-divider",
	dividerWidth: "--ds-action-sheet-divider-width",
	layer: "--ds-action-sheet-layer",
	enter: "--ds-action-sheet-enter",
	exit: "--ds-action-sheet-exit"
};
/**
* Bindings forwarded to the composed heading Text, under Text's own binding name. The default value
* reaches Text through its CSS hook (the stylesheet points `--ds-text-*` at the sheet's hooks), so
* `overrides` is passed only for the bindings the caller actually set and consumer CSS on the sheet
* hook keeps working.
*/
const TEXT_FORWARD = {
	titleSize: "fontSize",
	fontFamily: "fontFamily",
	lineHeight: "lineHeight"
};
/**
* Bindings forwarded to the wide Menu: the overridable ones it shares by name, plus divider →
* separator. Locked bindings are never forwarded, and the rest (scrim, header, handle, title,
* dividerWidth, exit) have no effect there.
*/
const MENU_FORWARD = {
	shadow: "shadow",
	radius: "radius",
	itemPaddingBlock: "itemPaddingBlock",
	itemPaddingInline: "itemPaddingInline",
	itemGap: "itemGap",
	fontFamily: "fontFamily",
	fontSize: "fontSize",
	lineHeight: "lineHeight",
	layer: "layer",
	enter: "enter",
	divider: "separator"
};
const COPY$18 = {
	cancelLabel: "Cancel",
	defaultLabel: "Actions"
};
/** constants.dismissDistance — fraction of the sheet height a downward drag must pass to dismiss on release. */
const DISMISS_DISTANCE = .25;
/** constants.dismissVelocity — downward px/ms at release that dismisses whatever the distance travelled. */
const DISMISS_VELOCITY = 1.5;
/** constants.dragSlop — `space.1`, read from the resolved custom property at gesture time, as BottomSheet. */
const DRAG_SLOP_TOKEN = "--space-1";
/**
* `space.1` in px: the token resolves to a rem length, so it is multiplied by the root font size.
* An unresolvable value (no theme stylesheet, jsdom) counts as 0.
*/
function resolveDragSlop(element) {
	const raw = getComputedStyle(element).getPropertyValue(DRAG_SLOP_TOKEN).trim();
	const length = Number.parseFloat(raw);
	if (!Number.isFinite(length)) return 0;
	if (!raw.endsWith("rem") && !raw.endsWith("em")) return length;
	const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
	return Number.isFinite(rootFontSize) ? length * rootFontSize : 0;
}
function hasNoTransition$1(element) {
	return !(getComputedStyle(element).transitionDuration || "").split(",").some((part) => Number.parseFloat(part) > 0);
}
function prefersReducedMotion$2() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/** Wide when the viewport is strictly wider than `layout.maxWidth.prose`, read from the theme stylesheet. */
function wideQuery() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
	const breakpoint = getComputedStyle(document.documentElement).getPropertyValue("--layout-max-width-prose").trim();
	return breakpoint ? window.matchMedia(`(width > ${breakpoint})`) : null;
}
/**
* False on the server and through hydration, true from then on (and from the first render of a
* client-only mount). The portaled sheet and the wide Menu both need `document`, so neither may be in
* the tree before this is true, or the server and client trees differ.
*/
const subscribeNothing$1 = () => () => {};
function useHydrated$1() {
	return useSyncExternalStore(subscribeNothing$1, () => true, () => false);
}
/**
* Starts narrow on the server and during hydration — the viewport is never read during render — and
* settles on the real presentation in a layout effect after mount, before the browser paints.
*/
function useIsWide() {
	const [isWide, setIsWide] = useState(false);
	useLayoutEffect(() => {
		let frame = 0;
		let query = null;
		const onChange = () => setIsWide(query?.matches ?? false);
		const attach = () => {
			query = wideQuery();
			if (query) {
				onChange();
				query.addEventListener("change", onChange);
				return;
			}
			if (typeof document !== "undefined" && document.readyState !== "complete") frame = requestAnimationFrame(attach);
		};
		attach();
		return () => {
			if (frame) cancelAnimationFrame(frame);
			query?.removeEventListener("change", onChange);
		};
	}, []);
	return isWide;
}
/** Danger actions are grouped last, after a divider, in both presentations. */
function partition(actions) {
	return {
		normal: actions.filter((action) => action.tone !== "danger"),
		danger: actions.filter((action) => action.tone === "danger")
	};
}
function toMenuAction(action) {
	return {
		id: action.id,
		label: action.label,
		icon: action.icon,
		tone: action.tone,
		disabled: action.disabled
	};
}
function toMenuItems(actions) {
	const { normal, danger } = partition(actions);
	const items = normal.map(toMenuAction);
	if (normal.length > 0 && danger.length > 0) items.push({ separator: true });
	items.push(...danger.map(toMenuAction));
	return items;
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
function ActionSheet({ ref, open, heading, actions, dismissible = true, cancelLabel, onAction, onClose, container, overrides, ...rest }) {
	const hydrated = useHydrated$1();
	const isWide = useIsWide();
	const dialogRef = useRef(null);
	const surfaceRef = useRef(null);
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const cancelButtonRef = useRef(null);
	const dragRef = useRef(null);
	const openerRef = useRef(null);
	const wasOpenRef = useRef(false);
	const choseRef = useRef(false);
	if (open && !wasOpenRef.current) {
		if (typeof document !== "undefined") {
			const active = document.activeElement;
			openerRef.current = active instanceof HTMLElement ? active : document.body;
		}
		choseRef.current = false;
		wasOpenRef.current = true;
	} else if (!open && wasOpenRef.current) wasOpenRef.current = false;
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const [dragPhase, setDragPhase] = useState("idle");
	const [activeId, setActiveId] = useState(null);
	if (open && !present) setPresent(true);
	useImperativeHandle(ref, () => dialogRef.current, [
		isWide,
		open,
		present
	]);
	const accessibleLabel = heading || COPY$18.defaultLabel;
	const { normal, danger } = partition(actions);
	const enabled = [...normal, ...danger].filter((action) => !action.disabled);
	useLayoutEffect(() => {
		if (!present || isWide || !open || !hydrated) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		if (!dialog.open) {
			let shown = false;
			if (typeof dialog.showModal === "function") try {
				dialog.showModal();
				shown = true;
			} catch {
				shown = false;
			}
			if (!shown) dialog.setAttribute("open", "");
		}
		const first = enabled[0];
		if (first) {
			setActiveId(first.id);
			itemRefs.current.get(first.id)?.focus();
		}
		if (prefersReducedMotion$2()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [
		present,
		isWide,
		open,
		hydrated
	]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const opener = openerRef.current;
		if (opener?.isConnected) opener.focus();
		const dialog = dialogRef.current;
		const surface = surfaceRef.current;
		const finish = () => {
			if (dialog?.open) {
				if (typeof dialog.close === "function") dialog.close();
				else dialog.removeAttribute("open");
			}
			setPresent(false);
		};
		if (isWide || !surface || hasNoTransition$1(surface)) {
			finish();
			return;
		}
		const handleExited = (event) => {
			if (event.target === surface && event.propertyName === "transform") finish();
		};
		surface.addEventListener("transitionend", handleExited);
		return () => surface.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		isWide
	]);
	useLayoutEffect(() => {
		const surface = surfaceRef.current;
		if (dragPhase === "held") {
			setDragPhase(open ? "settling" : "exiting");
			return;
		}
		if (dragPhase === "exiting") {
			if (open) {
				setDragPhase("settling");
				return;
			}
			if (surface) surface.style.transform = "";
			setDragPhase("idle");
			return;
		}
		if (dragPhase !== "settling") return void 0;
		if (!surface) {
			setDragPhase("idle");
			return;
		}
		surface.style.transform = "";
		if (hasNoTransition$1(surface)) {
			setDragPhase("idle");
			return;
		}
		const handleSettled = (event) => {
			if (event.target === surface && event.propertyName === "transform") setDragPhase("idle");
		};
		surface.addEventListener("transitionend", handleSettled);
		return () => surface.removeEventListener("transitionend", handleSettled);
	}, [dragPhase, open]);
	useEffect(() => {
		if (!present || isWide) return void 0;
		document.documentElement.classList.add("ds-action-sheet-lock-scroll");
		return () => document.documentElement.classList.remove("ds-action-sheet-lock-scroll");
	}, [present, isWide]);
	const requestClose = (reason) => {
		if (reason !== "escape" && !dismissible) return;
		onClose?.(reason);
	};
	const handleKeyDown = (event) => {
		if (event.key !== "Escape") return;
		event.preventDefault();
		event.stopPropagation();
		requestClose("escape");
	};
	const handleCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handlePointerDown = (event) => {
		if (!dismissible || !open || dragRef.current) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		if (!Number.isFinite(event.clientY)) return;
		dragRef.current = {
			pointerId: event.pointerId,
			startY: event.clientY,
			originY: event.clientY,
			claimed: false,
			previous: null,
			last: null
		};
	};
	const handlePointerMove = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		if (!drag || drag.pointerId !== event.pointerId || !surface) return;
		if (!Number.isFinite(event.clientY)) return;
		if (!drag.claimed) {
			const moved = event.clientY - drag.startY;
			if (moved <= 0 || moved < resolveDragSlop(surface)) return;
			drag.claimed = true;
			drag.originY = event.clientY;
			if (typeof event.currentTarget.setPointerCapture === "function") event.currentTarget.setPointerCapture(event.pointerId);
			setDragPhase("dragging");
		}
		drag.previous = drag.last;
		drag.last = {
			y: event.clientY,
			time: event.timeStamp
		};
		surface.style.transform = `translateY(${Math.max(0, event.clientY - drag.originY)}px)`;
	};
	const endDrag = (event, cancelled) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		dragRef.current = null;
		const surface = surfaceRef.current;
		if (!drag.claimed || !surface) return;
		const travelled = Number.isFinite(event.clientY) ? Math.max(0, event.clientY - drag.originY) : 0;
		const sheetHeight = surface.getBoundingClientRect().height;
		const pastDistance = sheetHeight > 0 && travelled > sheetHeight * DISMISS_DISTANCE;
		let velocity = 0;
		if (drag.previous && drag.last && drag.last.time > drag.previous.time) velocity = (drag.last.y - drag.previous.y) / (drag.last.time - drag.previous.time);
		if (cancelled || !open || !(pastDistance || velocity > DISMISS_VELOCITY)) {
			setDragPhase("settling");
			return;
		}
		setDragPhase("held");
		requestClose("drag");
	};
	const focusAction = (action) => {
		if (!action) return;
		setActiveId(action.id);
		itemRefs.current.get(action.id)?.focus();
	};
	const handleListKeyDown = (event) => {
		if (enabled.length === 0) return;
		const index = enabled.findIndex((action) => action.id === activeId);
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				focusAction(enabled[(index + 1) % enabled.length]);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusAction(enabled[(index - 1 + enabled.length) % enabled.length]);
				break;
			case "Home":
				event.preventDefault();
				focusAction(enabled[0]);
				break;
			case "End":
				event.preventDefault();
				focusAction(enabled[enabled.length - 1]);
		}
	};
	const choose = (action) => (event) => {
		if (action.disabled) {
			event.preventDefault();
			return;
		}
		onAction?.(action.id);
	};
	const handleMenuOpenChange = (next, reason) => {
		if (next) return;
		if (reason === "action") {
			choseRef.current = true;
			return;
		}
		if (choseRef.current) return;
		if (reason === "escape") onClose?.("escape");
		else if (reason === "outside" || reason === "tab-out" || reason === "focus-out") onClose?.("scrim");
	};
	const handleCancelRowClick = (event) => {
		const button = cancelButtonRef.current;
		if (!button || button.contains(event.target)) return;
		button.click();
	};
	const handleMenuAction = (id) => {
		choseRef.current = true;
		onAction?.(id);
	};
	if (!hydrated) return null;
	if (isWide) {
		if (!open) return null;
		const menuOverrides = {};
		for (const [binding, token] of Object.entries(overrides ?? {})) {
			const forward = MENU_FORWARD[binding];
			if (token && forward) menuOverrides[forward] = token;
		}
		return /* @__PURE__ */ jsx(Menu, {
			label: accessibleLabel,
			items: toMenuItems(actions),
			open: true,
			anchor: openerRef,
			onAction: handleMenuAction,
			onOpenChange: handleMenuOpenChange,
			container,
			overrides: Object.keys(menuOverrides).length > 0 ? menuOverrides : void 0
		});
	}
	if (!present) return null;
	const rootStyle = {};
	const textOverrides = {};
	for (const [binding, token] of Object.entries(overrides ?? {})) {
		if (!token) continue;
		rootStyle[OVERRIDE_HOOK$10[binding]] = cssVar(token);
		const forward = TEXT_FORWARD[binding];
		if (forward) textOverrides[forward] = token;
	}
	const renderItem = (action) => /* @__PURE__ */ jsxs("button", {
		ref: (element) => {
			if (element) itemRefs.current.set(action.id, element);
			else itemRefs.current.delete(action.id);
		},
		type: "button",
		role: "menuitem",
		tabIndex: action.id === (activeId ?? enabled[0]?.id) ? 0 : -1,
		"aria-disabled": action.disabled ? "true" : void 0,
		"data-part": "item",
		className: [
			"ds-action-sheet__item",
			action.tone === "danger" ? "ds-action-sheet__item--danger" : "",
			action.disabled ? "ds-action-sheet__item--disabled" : ""
		].filter(Boolean).join(" "),
		onFocus: () => {
			if (!action.disabled && activeId !== action.id) setActiveId(action.id);
		},
		onClick: choose(action),
		children: [action.icon ? /* @__PURE__ */ jsx("span", {
			className: "ds-action-sheet__icon",
			"data-part": "itemIcon",
			"aria-hidden": "true",
			children: /* @__PURE__ */ jsx(Icon, {
				name: action.icon,
				inline: true
			})
		}) : null, /* @__PURE__ */ jsx("span", {
			className: "ds-action-sheet__label",
			children: action.label
		})]
	}, action.id);
	const className = [
		"ds-action-sheet",
		visible ? "ds-action-sheet--visible" : "",
		dragPhase === "dragging" ? "ds-action-sheet--dragging" : "",
		dragPhase === "settling" ? "ds-action-sheet--settling" : ""
	].filter(Boolean).join(" ");
	return createPortal(/* @__PURE__ */ jsxs("dialog", {
		...rest,
		ref: dialogRef,
		"data-ds": "ActionSheet",
		className,
		style: Object.keys(rootStyle).length > 0 ? rootStyle : void 0,
		"aria-modal": "true",
		"aria-label": accessibleLabel,
		onKeyDown: handleKeyDown,
		onCancel: handleCancel,
		children: [/* @__PURE__ */ jsx("div", {
			className: "ds-action-sheet__scrim",
			"data-part": "scrim",
			"aria-hidden": "true",
			onClick: () => requestClose("scrim")
		}), /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			active: open,
			returnFocusTo: openerRef,
			"data-part": "focusScope",
			children: /* @__PURE__ */ jsxs("div", {
				ref: surfaceRef,
				className: "ds-action-sheet__surface",
				"data-part": "surface",
				children: [
					dismissible || heading ? /* @__PURE__ */ jsxs("div", {
						className: "ds-action-sheet__header",
						"data-part": "header",
						onPointerDown: handlePointerDown,
						onPointerMove: handlePointerMove,
						onPointerUp: (event) => endDrag(event, false),
						onPointerCancel: (event) => endDrag(event, true),
						children: [dismissible ? /* @__PURE__ */ jsx("span", {
							className: "ds-action-sheet__handle",
							"data-part": "handle",
							"aria-hidden": "true"
						}) : null, heading ? /* @__PURE__ */ jsx(Text, {
							element: "p",
							size: "sm",
							tone: "muted",
							"data-part": "heading",
							overrides: Object.keys(textOverrides).length > 0 ? textOverrides : void 0,
							children: heading
						}) : null]
					}) : null,
					/* @__PURE__ */ jsxs("div", {
						role: "menu",
						"aria-label": accessibleLabel,
						"data-part": "list",
						className: "ds-action-sheet__list",
						onKeyDown: handleListKeyDown,
						children: [
							normal.map(renderItem),
							normal.length > 0 && danger.length > 0 ? /* @__PURE__ */ jsx("div", {
								role: "separator",
								className: "ds-action-sheet__divider",
								"data-part": "divider"
							}) : null,
							danger.map(renderItem)
						]
					}),
					dismissible ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
						className: "ds-action-sheet__divider",
						"data-part": "divider",
						"aria-hidden": "true"
					}), /* @__PURE__ */ jsx("div", {
						className: "ds-action-sheet__cancel-row",
						"data-part": "cancelButton",
						onClick: handleCancelRowClick,
						children: /* @__PURE__ */ jsx(Button, {
							ref: cancelButtonRef,
							variant: "secondary",
							label: cancelLabel || COPY$18.cancelLabel,
							onClick: () => requestClose("cancel")
						})
					})] }) : null
				]
			})
		})]
	}), container ?? document.body);
}
//#endregion
//#region src/SidePanel.tsx
const OVERRIDE_HOOK$9 = {
	scrim: "--ds-side-panel-scrim",
	shadow: "--ds-side-panel-shadow",
	border: "--ds-side-panel-border",
	borderWidth: "--ds-side-panel-border-width",
	width: "--ds-side-panel-width",
	widthNarrow: "--ds-side-panel-width-narrow",
	widthWide: "--ds-side-panel-width-wide",
	edgeGutter: "--ds-side-panel-edge-gutter",
	inset: "--ds-side-panel-inset",
	headerGap: "--ds-side-panel-header-gap",
	headingGap: "--ds-side-panel-heading-gap",
	partGap: "--ds-side-panel-part-gap",
	footerGap: "--ds-side-panel-footer-gap",
	layer: "--ds-side-panel-layer",
	enter: "--ds-side-panel-enter",
	exit: "--ds-side-panel-exit"
};
function overridesToStyle$8(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$9[binding];
		if (ref && hook) style[hook] = cssVar(ref);
	}
	return style;
}
/** copy.* — used verbatim. `expanded` is SwiftUI-only; web announces aria-expanded natively. */
const COPY$17 = {
	closeLabel: "Close",
	expanded: "Expanded"
};
/** Reasons `dismissible: false` suppresses. Escape still reports; the trigger, actions and navigation always close. */
const DISMISS_REASONS = /* @__PURE__ */ new Set([
	"close-button",
	"scrim",
	"outside",
	"swipe"
]);
const FOCUSABLE_SELECTOR$4 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled]):not([type=\"hidden\"])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"summary",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]"
].join(",");
function isTabbable(element) {
	if (element.hasAttribute("data-focus-sentinel")) return false;
	if (element.getAttribute("tabindex") === "-1" || element.tabIndex < 0) return false;
	return !element.closest("[hidden], [inert]");
}
function tabbablesIn(root) {
	if (!root) return [];
	return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR$4)).filter(isTabbable);
}
/** The next tabbable element after `anchor` in document order, skipping the portaled panel. */
function nextTabbableAfter(anchor, exclude) {
	for (const element of tabbablesIn(document)) {
		if (element === anchor || anchor.contains(element) || exclude?.contains(element)) continue;
		if (anchor.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
	}
	return null;
}
/** True when the element has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition(element) {
	const durations = getComputedStyle(element).transitionDuration;
	if (!durations) return true;
	return durations.split(",").every((duration) => parseFloat(duration) === 0);
}
/** Scroll lock is reference-counted so an overlay opened over the panel cannot release it early. */
let scrollLockCount = 0;
function lockScroll() {
	scrollLockCount += 1;
	document.documentElement.classList.add("ds-side-panel-lock-scroll");
	return () => {
		scrollLockCount -= 1;
		if (scrollLockCount === 0) document.documentElement.classList.remove("ds-side-panel-lock-scroll");
	};
}
/**
* The breakpoint width in px. A media query cannot read a custom property, and a `rem` breakpoint in a
* media query resolves against the initial font size rather than the one on <html>, so the token's
* resolved value is measured once and handed to matchMedia as px.
*/
function breakpointPx(property) {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
	if (!raw) return null;
	const probe = document.createElement("div");
	probe.setAttribute("aria-hidden", "true");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.inlineSize = raw;
	document.documentElement.appendChild(probe);
	const measured = probe.getBoundingClientRect().width;
	probe.remove();
	return measured > 0 ? `${measured}px` : raw;
}
/**
* persistent — `layout.maxWidth.content` or `layout.maxWidth.page`, read from the loaded token
* stylesheet on <html> when the component mounts. Above it the panel is a sidebar; exactly the token
* width is still the overlay, so the comparison is `(width > token)`.
*/
function persistentQuery(persistent) {
	if (persistent === "never") return null;
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
	const breakpoint = breakpointPx(persistent === "content" ? "--layout-max-width-content" : "--layout-max-width-page");
	if (!breakpoint) return null;
	return window.matchMedia(`(width > ${breakpoint})`);
}
/**
* False on the server and through hydration, true from then on (and from the first render of a
* client-only mount). Nothing that exists only in the browser — the portal host, a media query —
* may shape the markup before this is true, or the server and client trees differ.
*/
const subscribeNothing = () => () => {};
function useHydrated() {
	return useSyncExternalStore(subscribeNothing, () => true, () => false);
}
function useIsPersistent(persistent) {
	const [matches, setMatches] = useState(false);
	useLayoutEffect(() => {
		const query = persistentQuery(persistent);
		if (!query) {
			setMatches(false);
			return;
		}
		const update = () => setMatches(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, [persistent]);
	return matches;
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
function SidePanel({ ref, trigger, open: openProp, heading, hideHeading = false, children, footer, side = "start", width = "default", persistent = "never", role = "complementary", modal = false, scrim = true, dismissible = true, swipeable: _swipeable = true, onOpenChange, container, overrides, className: _className, style: _style, ...rest }) {
	const hydrated = useHydrated();
	const isPersistent = useIsPersistent(persistent);
	const modalActive = modal && !isPersistent;
	const generatedId = useId();
	const panelId = `ds-side-panel${generatedId}-panel`;
	const headingId = `ds-side-panel${generatedId}-heading`;
	const rootRef = useRef(null);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const footerRef = useRef(null);
	const closeButtonRef = useRef(null);
	const headingRef = useRef(null);
	const triggerWrapRef = useRef(null);
	const triggerRef = useRef(null);
	const slotRef = useRef(null);
	const escapeHandledRef = useRef(false);
	const [host] = useState(() => typeof document === "undefined" ? null : document.createElement("div"));
	const isControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = openProp ?? internalOpen;
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const visibleRef = useRef(visible);
	visibleRef.current = visible;
	if (open && !present) setPresent(true);
	const rootShown = isPersistent || present;
	useImperativeHandle(ref, () => rootShown ? rootRef.current : null, [rootShown, modalActive]);
	const warnedRef = useRef(false);
	if (process.env.NODE_ENV !== "production" && !heading && !warnedRef.current) {
		warnedRef.current = true;
		console.warn("SidePanel: `heading` is required and becomes the accessible name; it must not be empty.");
	}
	const changeOpen = (next, reason) => {
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next, reason);
	};
	const requestClose = (reason) => {
		if (!open || isPersistent) return;
		if (DISMISS_REASONS.has(reason) && !dismissible) return;
		if (reason === "escape" && !dismissible) {
			onOpenChange?.(false, "escape");
			return;
		}
		changeOpen(false, reason);
	};
	const latestRequestClose = useRef(requestClose);
	latestRequestClose.current = requestClose;
	useLayoutEffect(() => {
		triggerRef.current = triggerWrapRef.current?.firstElementChild ?? null;
	});
	useLayoutEffect(() => {
		if (!host) return void 0;
		if (host.className !== "ds-side-panel-host") host.className = "ds-side-panel-host";
		const target = isPersistent ? slotRef.current : container ?? document.body;
		if (!target) return void 0;
		target.appendChild(host);
		return () => host.remove();
	}, [
		host,
		isPersistent,
		container
	]);
	useLayoutEffect(() => {
		if (!present || !modalActive || !hydrated) return;
		const dialog = rootRef.current;
		if (!(dialog instanceof HTMLDialogElement)) return;
		if (!dialog.open) {
			if (typeof dialog.showModal === "function" && dialog.isConnected) dialog.showModal();
			else dialog.open = true;
		}
		const target = tabbablesIn(bodyRef.current)[0] ?? tabbablesIn(footerRef.current)[0] ?? closeButtonRef.current;
		if (target) {
			target.focus();
			return;
		}
		headingRef.current?.focus();
	}, [
		present,
		modalActive,
		hydrated
	]);
	useLayoutEffect(() => {
		if (!present || !open || isPersistent || !hydrated) return void 0;
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [
		present,
		open,
		isPersistent,
		hydrated
	]);
	const wasOpenRef = useRef(open);
	useEffect(() => {
		const wasOpen = wasOpenRef.current;
		wasOpenRef.current = open;
		if (!wasOpen || open || isPersistent || modalActive || !host) return;
		const active = document.activeElement;
		if (active && host.contains(active)) triggerRef.current?.focus();
	}, [
		open,
		isPersistent,
		modalActive,
		host
	]);
	useEffect(() => {
		if (open || !present || isPersistent) return void 0;
		const wasVisible = visibleRef.current;
		setVisible(false);
		const surface = surfaceRef.current;
		const finish = () => {
			const root = rootRef.current;
			if (root instanceof HTMLDialogElement && root.open) {
				if (typeof root.close === "function") root.close();
				else root.open = false;
			}
			setPresent(false);
		};
		if (!wasVisible || !surface || hasNoTransition(surface)) {
			finish();
			return;
		}
		const handleExited = (event) => {
			if (event.target === surface && event.propertyName === "transform") finish();
		};
		surface.addEventListener("transitionend", handleExited);
		return () => surface.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		isPersistent
	]);
	useEffect(() => {
		if (!present || !modalActive) return void 0;
		return lockScroll();
	}, [present, modalActive]);
	useEffect(() => {
		if (!open || modalActive || isPersistent || scrim || !dismissible || !host) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (host.contains(target) || triggerWrapRef.current?.contains(target)) return;
			latestRequestClose.current("outside");
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [
		open,
		modalActive,
		isPersistent,
		scrim,
		dismissible,
		host
	]);
	const handleTriggerClick = (event) => {
		trigger?.props.onClick?.(event);
		if (event.defaultPrevented) return;
		changeOpen(!open, "trigger");
	};
	const handleTriggerKeyDown = (event) => {
		if (event.key !== "Tab" || event.shiftKey || event.defaultPrevented) return;
		if (!open || modalActive || isPersistent || event.target !== triggerRef.current) return;
		const first = tabbablesIn(surfaceRef.current)[0];
		if (!first) return;
		event.preventDefault();
		first.focus();
	};
	const handleRootKeyDown = (event) => {
		rest.onKeyDown?.(event);
		if (event.defaultPrevented || isPersistent || !open) return;
		if (event.key === "Escape") {
			event.preventDefault();
			if (modalActive) {
				escapeHandledRef.current = true;
				setTimeout(() => {
					escapeHandledRef.current = false;
				}, 0);
			}
			requestClose("escape");
			return;
		}
		if (event.key !== "Tab" || modalActive) return;
		const triggerElement = triggerRef.current;
		const tabbables = tabbablesIn(surfaceRef.current);
		if (!triggerElement || tabbables.length === 0) return;
		const active = document.activeElement;
		if (event.shiftKey && active === tabbables[0]) {
			event.preventDefault();
			triggerElement.focus();
		} else if (!event.shiftKey && active === tabbables[tabbables.length - 1]) {
			const next = nextTabbableAfter(triggerElement, host);
			if (!next) return;
			event.preventDefault();
			next.focus();
		}
	};
	const handleDialogCancel = (event) => {
		event.preventDefault();
		if (escapeHandledRef.current) return;
		requestClose("escape");
	};
	const handleDialogClose = () => {
		if (!open || !modalActive) return;
		requestAnimationFrame(() => {
			const dialog = rootRef.current;
			if (!(dialog instanceof HTMLDialogElement) || dialog.open || !dialog.isConnected) return;
			if (typeof dialog.showModal === "function") dialog.showModal();
			else dialog.open = true;
		});
	};
	const handleCloseTargetClick = (event) => {
		const button = closeButtonRef.current;
		if (!button || button.contains(event.target)) return;
		button.click();
	};
	const handleContentClick = (event) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const anchor = event.target.closest("a[href]");
		if (!(anchor instanceof HTMLAnchorElement) || !event.currentTarget.contains(anchor)) return;
		if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
		if (!open || isPersistent) return;
		changeOpen(false, "navigation");
	};
	const clonedTrigger = trigger ? cloneElement(trigger, {
		"aria-expanded": open,
		"aria-controls": panelId,
		onClick: handleTriggerClick
	}) : null;
	const hasFooter = footer !== void 0 && footer !== null && footer !== false;
	const closeShown = dismissible && !isPersistent;
	const headerShown = !hideHeading || closeShown;
	const headingPart = /* @__PURE__ */ jsx("div", {
		className: hideHeading ? "ds-side-panel__heading ds-side-panel__visually-hidden" : "ds-side-panel__heading",
		"data-part": "heading",
		children: /* @__PURE__ */ jsx(Heading, {
			level: "2",
			size: "lg",
			id: headingId,
			ref: headingRef,
			tabIndex: modalActive ? -1 : void 0,
			children: heading
		})
	});
	const parts = /* @__PURE__ */ jsxs("div", {
		className: "ds-side-panel__scope",
		"data-part": "focusScope",
		onClick: handleContentClick,
		children: [
			headerShown ? /* @__PURE__ */ jsxs("div", {
				className: "ds-side-panel__header",
				"data-part": "header",
				children: [headingPart, closeShown ? /* @__PURE__ */ jsx("span", {
					className: "ds-side-panel__close",
					"data-part": "closeButton",
					onClick: handleCloseTargetClick,
					children: /* @__PURE__ */ jsx(Button, {
						ref: closeButtonRef,
						variant: "ghost",
						iconOnly: true,
						label: COPY$17.closeLabel,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "close",
							inline: true
						}),
						onClick: () => requestClose("close-button")
					})
				}) : null]
			}) : headingPart,
			/* @__PURE__ */ jsx("div", {
				className: "ds-side-panel__scroll",
				ref: bodyRef,
				children: /* @__PURE__ */ jsx(Box, {
					"data-part": "body",
					inset: "lg",
					insetBlock: "none",
					overrides: overrides?.inset ? { paddingInline: overrides.inset } : void 0,
					children
				})
			}),
			hasFooter ? /* @__PURE__ */ jsx("div", {
				className: "ds-side-panel__footer",
				"data-part": "footer",
				ref: footerRef,
				children: /* @__PURE__ */ jsx(Stack, {
					direction: "horizontal",
					gap: "tight",
					justify: "end",
					overrides: overrides?.footerGap ? { gap: overrides.footerGap } : void 0,
					children: footer
				})
			}) : null
		]
	});
	const shown = visible && open && !isPersistent;
	const hookStyle = overrides ? overridesToStyle$8(overrides) : void 0;
	const rootClasses = [
		"ds-side-panel",
		modalActive ? "ds-side-panel--modal" : null,
		isPersistent ? "ds-side-panel--persistent" : null,
		shown ? "ds-side-panel--visible" : null
	].filter(Boolean).join(" ");
	const surfaceClasses = [
		"ds-side-panel__surface",
		`ds-side-panel__surface--${side}`,
		`ds-side-panel__surface--${width}`,
		isPersistent ? "ds-side-panel__surface--persistent" : null,
		shown ? "ds-side-panel__surface--visible" : null
	].filter(Boolean).join(" ");
	const scrimClasses = shown ? "ds-side-panel__scrim ds-side-panel__scrim--visible" : "ds-side-panel__scrim";
	let panel = null;
	if (modalActive) panel = present ? /* @__PURE__ */ jsxs("dialog", {
		...rest,
		ref: (node) => {
			rootRef.current = node;
		},
		id: panelId,
		"data-ds": "SidePanel",
		className: rootClasses,
		style: hookStyle,
		"aria-modal": "true",
		"aria-labelledby": headingId,
		onKeyDown: handleRootKeyDown,
		onCancel: handleDialogCancel,
		onClose: handleDialogClose,
		children: [/* @__PURE__ */ jsx("div", {
			className: scrimClasses,
			"data-part": "scrim",
			onClick: () => requestClose("scrim")
		}), /* @__PURE__ */ jsx("div", {
			className: surfaceClasses,
			"data-part": "surface",
			ref: (node) => {
				surfaceRef.current = node;
			},
			children: /* @__PURE__ */ jsx(FocusScope, {
				trapped: true,
				autoFocus: "none",
				restoreFocus: true,
				returnFocusTo: triggerRef,
				children: parts
			})
		})]
	}) : null;
	else panel = /* @__PURE__ */ jsxs(Fragment$1, { children: [!isPersistent && scrim ? /* @__PURE__ */ jsx("div", {
		className: scrimClasses,
		style: hookStyle,
		"data-part": "scrim",
		"aria-hidden": "true",
		hidden: !present,
		onClick: () => requestClose("scrim")
	}) : null, /* @__PURE__ */ jsx("div", {
		...rest,
		ref: (node) => {
			rootRef.current = node;
			surfaceRef.current = node;
		},
		id: panelId,
		"data-ds": "SidePanel",
		"data-part": "surface",
		className: `${rootClasses} ${surfaceClasses}`,
		style: hookStyle,
		hidden: !rootShown,
		onKeyDown: handleRootKeyDown,
		children: /* @__PURE__ */ jsx(FocusScope, {
			trapped: false,
			autoFocus: "none",
			restoreFocus: false,
			children: /* @__PURE__ */ jsx(Landmark, {
				role,
				as: role === "navigation" ? "nav" : "aside",
				"aria-labelledby": headingId,
				children: parts
			})
		})
	})] });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		clonedTrigger ? /* @__PURE__ */ jsx("span", {
			ref: triggerWrapRef,
			className: isPersistent ? "ds-side-panel__trigger ds-side-panel__trigger--hidden" : "ds-side-panel__trigger",
			"data-part": "trigger",
			onKeyDown: handleTriggerKeyDown,
			children: clonedTrigger
		}) : null,
		/* @__PURE__ */ jsx("div", {
			ref: slotRef,
			className: "ds-side-panel-slot"
		}),
		hydrated && host && panel ? createPortal(panel, host) : null
	] });
}
//#endregion
//#region src/Tabs.tsx
const OVERRIDE_HOOK$8 = {
	tabPaddingBlock: "--ds-tabs-tab-padding-block",
	tabPaddingInline: "--ds-tabs-tab-padding-inline",
	tabGap: "--ds-tabs-tab-gap",
	listGap: "--ds-tabs-list-gap",
	listBorder: "--ds-tabs-list-border",
	listBorderWidth: "--ds-tabs-list-border-width",
	panelGap: "--ds-tabs-panel-gap",
	badgeWeight: "--ds-tabs-badge-weight",
	badgeSize: "--ds-tabs-badge-size",
	fontFamily: "--ds-tabs-font-family",
	fontSize: "--ds-tabs-font-size",
	fontWeight: "--ds-tabs-font-weight",
	lineHeight: "--ds-tabs-line-height",
	radius: "--ds-tabs-radius",
	transition: "--ds-tabs-transition",
	disabledOpacity: "--ds-tabs-disabled-opacity"
};
function overridesToStyle$7(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$8[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return Object.keys(style).length > 0 ? style : void 0;
}
function firstEnabledId(items) {
	return items.find((item) => !item.disabled)?.id ?? items[0]?.id;
}
/** The list's writing direction: RTL swaps ArrowLeft/ArrowRight and mirrors the indicator's offset. */
function isRtl(el) {
	if (!el || typeof getComputedStyle !== "function") return false;
	return getComputedStyle(el).direction === "rtl";
}
const isDev$12 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Gives each TabPanel its prefixed DOM id, its labelling tab and its hidden state. */
const TabsPanelContext = createContext(null);
/** The wrapper for one tab's content — a child of `Tabs`, one per tab, in the same order. */
function TabPanel({ ref, id, children, ...rest }) {
	const ctx = useContext(TabsPanelContext);
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		id: ctx ? ctx.panelDomId(id) : id,
		role: "tabpanel",
		"aria-labelledby": ctx ? ctx.tabDomId(id) : void 0,
		tabIndex: 0,
		hidden: ctx ? id !== ctx.selected : void 0,
		"data-ds": "TabPanel",
		"data-part": "panel",
		className: "ds-tabs__panel",
		children
	});
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
function Tabs({ ref, tabs, children, label, value, defaultValue, activation = "automatic", orientation = "horizontal", fit = "start", keepMounted = false, overrides, onChange, ...rest }) {
	const baseId = `ds-tabs${useId()}`;
	const tabDomId = (id) => `${baseId}-tab-${id}`;
	const panelDomId = (id) => `${baseId}-panel-${id}`;
	const listRef = useRef(null);
	const tabRefs = useRef(/* @__PURE__ */ new Map());
	const allPanels = Children.toArray(children).filter(isValidElement);
	const panelIds = new Set(allPanels.map((panel) => panel.props.id));
	const tabIds = new Set(tabs.map((tab) => tab.id));
	const panels = allPanels.filter((panel) => tabIds.has(panel.props.id));
	const orphanKey = [...tabs.filter((tab) => !panelIds.has(tab.id)).map((tab) => `tab:${tab.id}`), ...allPanels.filter((panel) => !tabIds.has(panel.props.id)).map((panel) => `panel:${panel.props.id}`)].join("|");
	useEffect(() => {
		if (!isDev$12 || !orphanKey) return;
		for (const entry of orphanKey.split("|")) {
			const kind = entry.slice(0, entry.indexOf(":"));
			const id = entry.slice(entry.indexOf(":") + 1);
			console.warn(kind === "tab" ? `Tabs: tab "${id}" has no matching TabPanel; its panel region is empty.` : `Tabs: TabPanel "${id}" has no matching tab; it is not shown.`);
		}
	}, [orphanKey]);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(() => defaultValue ?? firstEnabledId(tabs));
	const selected = isControlled ? value : internalValue;
	const [activeId, setActiveId] = useState(selected);
	const [indicator, setIndicator] = useState(void 0);
	const placedFor = useRef(void 0);
	useEffect(() => {
		setActiveId(selected);
	}, [selected]);
	const enabled = tabs.filter((tab) => !tab.disabled);
	const tabStopId = enabled.some((tab) => tab.id === activeId) ? activeId : enabled[0]?.id;
	const selectTab = (id) => {
		if (id === selected) return;
		if (!isControlled) setInternalValue(id);
		onChange?.(id);
	};
	useLayoutEffect(() => {
		const list = listRef.current;
		const tabEl = selected ? tabRefs.current.get(selected) : void 0;
		if (!list || !tabEl) {
			placedFor.current = void 0;
			setIndicator(void 0);
			return;
		}
		const moved = placedFor.current !== void 0 && placedFor.current !== selected;
		placedFor.current = selected;
		let last = "";
		const measure = () => {
			const inlineStart = isRtl(list) ? list.clientWidth - tabEl.offsetLeft - tabEl.offsetWidth + list.scrollLeft : tabEl.offsetLeft;
			const next = orientation === "horizontal" ? {
				insetInlineStart: inlineStart,
				inlineSize: tabEl.offsetWidth
			} : {
				insetBlockStart: tabEl.offsetTop,
				blockSize: tabEl.offsetHeight
			};
			const key = JSON.stringify(next);
			if (key === last) return;
			const isFirst = last === "";
			last = key;
			setIndicator({
				style: next,
				animate: moved && isFirst
			});
		};
		if (orientation === "horizontal") {
			const start = tabEl.offsetLeft;
			const end = start + tabEl.offsetWidth;
			if (start < list.scrollLeft) list.scrollLeft = start;
			else if (end > list.scrollLeft + list.clientWidth) list.scrollLeft = end - list.clientWidth;
		} else {
			const start = tabEl.offsetTop;
			const end = start + tabEl.offsetHeight;
			if (start < list.scrollTop) list.scrollTop = start;
			else if (end > list.scrollTop + list.clientHeight) list.scrollTop = end - list.clientHeight;
		}
		measure();
		if (typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(measure);
		observer.observe(list);
		return () => observer.disconnect();
	}, [
		selected,
		orientation,
		fit,
		tabs.length
	]);
	const handleListKeyDown = (event) => {
		if (enabled.length === 0) return;
		const focusedId = event.target.closest("[role=\"tab\"]")?.dataset.tabId ?? tabStopId;
		const currentIndex = enabled.findIndex((tab) => tab.id === focusedId);
		const rtl = orientation === "horizontal" && isRtl(listRef.current);
		const nextKey = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const prevKey = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		const moveTo = (index) => {
			const id = enabled[index].id;
			setActiveId(id);
			tabRefs.current.get(id)?.focus();
			if (activation === "automatic") selectTab(id);
		};
		switch (event.key) {
			case nextKey:
				event.preventDefault();
				moveTo(currentIndex < 0 ? 0 : (currentIndex + 1) % enabled.length);
				break;
			case prevKey:
				event.preventDefault();
				moveTo(currentIndex < 0 ? enabled.length - 1 : (currentIndex - 1 + enabled.length) % enabled.length);
				break;
			case "Home":
				event.preventDefault();
				moveTo(0);
				break;
			case "End":
				event.preventDefault();
				moveTo(enabled.length - 1);
				break;
			case "Enter":
			case " ": if (activation === "manual" && focusedId && currentIndex >= 0) {
				event.preventDefault();
				selectTab(focusedId);
			}
		}
	};
	const handleListBlur = (event) => {
		const next = event.relatedTarget;
		if (!next || !listRef.current?.contains(next)) {
			if (activeId !== selected) setActiveId(selected);
		}
	};
	const mountedPanelIds = new Set(panels.map((panel) => panel.props.id).filter((id) => keepMounted || id === selected));
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Tabs",
		className: `ds-tabs ds-tabs--${orientation} ds-tabs--fit-${fit}`,
		style: overrides ? overridesToStyle$7(overrides) : void 0,
		children: [/* @__PURE__ */ jsxs("div", {
			ref: listRef,
			role: "tablist",
			"aria-label": label,
			"aria-orientation": orientation,
			"data-part": "tablist",
			className: "ds-tabs__tablist",
			onKeyDown: handleListKeyDown,
			onBlur: handleListBlur,
			children: [tabs.map((tab) => {
				const isSelected = tab.id === selected;
				return /* @__PURE__ */ jsxs("button", {
					ref: (el) => {
						if (el) tabRefs.current.set(tab.id, el);
						else tabRefs.current.delete(tab.id);
					},
					type: "button",
					role: "tab",
					id: tabDomId(tab.id),
					"data-tab-id": tab.id,
					"aria-selected": isSelected ? "true" : "false",
					"aria-controls": mountedPanelIds.has(tab.id) ? panelDomId(tab.id) : void 0,
					"aria-disabled": tab.disabled ? "true" : void 0,
					tabIndex: tab.id === tabStopId ? 0 : -1,
					"data-part": "tab",
					className: [
						"ds-tabs__tab",
						isSelected ? "ds-tabs__tab--selected" : null,
						tab.disabled ? "ds-tabs__tab--disabled" : null
					].filter(Boolean).join(" "),
					onClick: () => {
						if (tab.disabled) return;
						setActiveId(tab.id);
						selectTab(tab.id);
					},
					children: [
						tab.icon ? /* @__PURE__ */ jsx("span", {
							className: "ds-tabs__tab-icon",
							"data-part": "tabIcon",
							children: /* @__PURE__ */ jsx(Icon, {
								name: tab.icon,
								size: "md"
							})
						}) : null,
						/* @__PURE__ */ jsx("span", {
							className: "ds-tabs__tab-label",
							"data-part": "tabLabel",
							children: tab.label
						}),
						tab.badge ? /* @__PURE__ */ jsxs("span", {
							className: "ds-tabs__tab-badge",
							"data-part": "tabBadge",
							children: [" ", tab.badge]
						}) : null
					]
				}, tab.id);
			}), /* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				"data-part": "indicator",
				"data-animate": indicator?.animate ? "true" : "false",
				className: "ds-tabs__indicator",
				style: indicator?.style
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ds-tabs__panels",
			children: /* @__PURE__ */ jsx(TabsPanelContext.Provider, {
				value: {
					tabDomId,
					panelDomId,
					selected
				},
				children: panels.filter((panel) => mountedPanelIds.has(panel.props.id))
			})
		})]
	});
}
//#endregion
//#region src/SegmentedControl.tsx
const OVERRIDE_HOOK$7 = {
	groupPadding: "--ds-segmented-control-group-padding",
	groupRadius: "--ds-segmented-control-group-radius",
	segmentShadow: "--ds-segmented-control-segment-shadow",
	segmentRadius: "--ds-segmented-control-segment-radius",
	segmentPaddingInline: "--ds-segmented-control-segment-padding-inline",
	segmentPaddingBlock: "--ds-segmented-control-segment-padding-block",
	segmentGap: "--ds-segmented-control-segment-gap",
	segmentSpacing: "--ds-segmented-control-segment-spacing",
	selectedWeight: "--ds-segmented-control-selected-weight",
	paddingBlockSm: "--ds-segmented-control-padding-block-sm",
	fontFamily: "--ds-segmented-control-font-family",
	fontSize: "--ds-segmented-control-font-size",
	fontWeight: "--ds-segmented-control-font-weight",
	lineHeight: "--ds-segmented-control-line-height",
	transition: "--ds-segmented-control-transition",
	disabledOpacity: "--ds-segmented-control-disabled-opacity"
};
function overridesToStyle$6(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$7[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
function firstEnabledValue(options) {
	return options.find((option) => !option.disabled)?.value;
}
const isDev$11 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* SegmentedControl — Design Schema, category: input.
*
* When to use:
* Use it for two to five short, parallel options that change what a region shows or how a tool behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible Text label when the group's purpose is not obvious.
*/
function SegmentedControl({ ref, label, options, value, defaultValue, iconOnly = false, size = "md", fill = false, overrides, onChange, onKeyDown, ...rest }) {
	const baseId = `ds-segmented-control${useId()}`;
	const segmentId = (index) => `${baseId}-segment-${index}`;
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(() => defaultValue ?? firstEnabledValue(options));
	const selected = isControlled ? value : internalValue;
	const selectedIndex = options.findIndex((option) => option.value === selected);
	const tabStop = selectedIndex >= 0 && !options[selectedIndex].disabled ? selected : firstEnabledValue(options);
	const [indicator, setIndicator] = useState(void 0);
	const lastRect = useRef(void 0);
	const warnedMissingIcon = useRef(false);
	const missingIcons = isDev$11 && iconOnly ? options.filter((option) => !option.icon).map((option) => option.value) : [];
	useEffect(() => {
		if (missingIcons.length === 0 || warnedMissingIcon.current) return;
		warnedMissingIcon.current = true;
		console.warn(`SegmentedControl: \`iconOnly\` needs an \`icon\` on every option; ${missingIcons.map((value) => `"${value}"`).join(", ")} show their label as text instead.`);
	}, [missingIcons.length]);
	const getSegmentElement = (index) => typeof document !== "undefined" && index >= 0 ? document.getElementById(segmentId(index)) : null;
	const optionsKey = options.map((option) => `${option.value} ${option.label} ${option.icon ?? ""}`).join("");
	useLayoutEffect(() => {
		const segmentEl = getSegmentElement(selectedIndex);
		const groupEl = segmentEl?.closest("[data-ds=\"SegmentedControl\"]") ?? null;
		const measure = () => {
			const next = segmentEl ? {
				left: segmentEl.offsetLeft,
				top: segmentEl.offsetTop,
				width: segmentEl.offsetWidth,
				height: segmentEl.offsetHeight
			} : void 0;
			const prev = lastRect.current;
			if (prev === next || prev !== void 0 && next !== void 0 && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height) return;
			lastRect.current = next;
			setIndicator(next);
		};
		measure();
		if (!segmentEl || !groupEl || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(measure);
		observer.observe(groupEl);
		return () => observer.disconnect();
	}, [
		selectedIndex,
		fill,
		iconOnly,
		size,
		optionsKey
	]);
	const selectSegment = (optionValue) => {
		if (optionValue === selected) return;
		if (!isControlled) setInternalValue(optionValue);
		onChange?.(optionValue);
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
		const enabled = options.flatMap((option, index) => option.disabled ? [] : [index]);
		if (enabled.length === 0) return;
		const group = event.currentTarget;
		const focusedIndex = options.findIndex((_, index) => getSegmentElement(index) === event.target);
		const tabStopIndex = options.findIndex((option) => option.value === tabStop);
		const current = enabled.indexOf(focusedIndex >= 0 ? focusedIndex : tabStopIndex);
		const rtl = typeof getComputedStyle === "function" && getComputedStyle(group).direction === "rtl";
		const inToolbar = group.parentElement?.closest("[role=\"toolbar\"]") != null;
		let step;
		switch (event.key) {
			case "ArrowDown":
				step = 1;
				break;
			case "ArrowUp":
				step = -1;
				break;
			case "ArrowRight":
				step = rtl ? -1 : 1;
				break;
			case "ArrowLeft":
				step = rtl ? 1 : -1;
				break;
			case "Home":
				step = "first";
				break;
			case "End":
				step = "last";
				break;
			default: return;
		}
		let targetPosition;
		if (step === "first" || step === "last") {
			if (inToolbar) return;
			targetPosition = step === "first" ? 0 : enabled.length - 1;
		} else if (current < 0) targetPosition = step === 1 ? 0 : enabled.length - 1;
		else {
			targetPosition = current + step;
			if (targetPosition < 0 || targetPosition >= enabled.length) {
				if (inToolbar) return;
				targetPosition = (targetPosition + enabled.length) % enabled.length;
			}
		}
		const targetIndex = enabled[targetPosition];
		if (targetIndex === void 0) return;
		event.preventDefault();
		getSegmentElement(targetIndex)?.focus();
		selectSegment(options[targetIndex].value);
	};
	const classes = [
		"ds-segmented-control",
		`ds-segmented-control--${size}`,
		fill ? "ds-segmented-control--fill" : null
	].filter(Boolean).join(" ");
	const indicatorStyle = indicator ? {
		left: indicator.left,
		top: indicator.top,
		width: indicator.width,
		height: indicator.height
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		role: "radiogroup",
		"aria-label": label,
		"data-ds": "SegmentedControl",
		"data-part": "group",
		className: classes,
		style: overrides ? overridesToStyle$6(overrides) : void 0,
		onKeyDown: handleKeyDown,
		children: [options.map((option, index) => {
			const isSelected = index === selectedIndex;
			const showsIconOnly = iconOnly && option.icon !== void 0;
			const segment = /* @__PURE__ */ jsxs("button", {
				id: segmentId(index),
				type: "button",
				role: "radio",
				"aria-checked": isSelected ? "true" : "false",
				"aria-disabled": option.disabled ? "true" : void 0,
				"aria-label": showsIconOnly ? option.label : void 0,
				tabIndex: option.value === tabStop ? 0 : -1,
				"data-part": "segment",
				className: ["ds-segmented-control__segment", option.disabled ? "ds-segmented-control__segment--disabled" : null].filter(Boolean).join(" "),
				onClick: () => {
					if (!option.disabled) selectSegment(option.value);
				},
				children: [option.icon ? /* @__PURE__ */ jsx("span", {
					className: "ds-segmented-control__segment-icon",
					"data-part": "segmentIcon",
					children: /* @__PURE__ */ jsx(Icon, {
						name: option.icon,
						size
					})
				}) : null, showsIconOnly ? null : /* @__PURE__ */ jsx("span", {
					className: "ds-segmented-control__segment-label",
					"data-part": "segmentLabel",
					children: option.label
				})]
			}, showsIconOnly ? void 0 : option.value);
			return showsIconOnly ? /* @__PURE__ */ jsx(Tooltip, {
				content: option.label,
				describes: false,
				children: segment
			}, option.value) : segment;
		}), indicatorStyle ? /* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			"data-part": "indicator",
			className: "ds-segmented-control__indicator",
			style: indicatorStyle
		}) : null]
	});
}
//#endregion
//#region src/Listbox.tsx
/** copy.* — used verbatim; `{label}` is replaced by the `label` prop. */
const COPY$16 = {
	empty: "No options",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	selectedCount: "{count} selected",
	loading: "Loading…"
};
const OVERRIDE_HOOK$6 = {
	border: "--ds-listbox-border",
	borderInvalid: "--ds-listbox-border-invalid",
	partGap: "--ds-listbox-part-gap",
	borderWidth: "--ds-listbox-border-width",
	radius: "--ds-listbox-radius",
	listPadding: "--ds-listbox-list-padding",
	optionPaddingBlock: "--ds-listbox-option-padding-block",
	optionPaddingInline: "--ds-listbox-option-padding-inline",
	optionGap: "--ds-listbox-option-gap",
	optionRadius: "--ds-listbox-option-radius",
	optionDescriptionSize: "--ds-listbox-option-description-size",
	optionWeight: "--ds-listbox-option-weight",
	optionSelectedWeight: "--ds-listbox-option-selected-weight",
	groupLabelSize: "--ds-listbox-group-label-size",
	groupLabelWeight: "--ds-listbox-group-label-weight",
	groupLabelPaddingBlock: "--ds-listbox-group-label-padding-block",
	fontFamily: "--ds-listbox-font-family",
	fontSize: "--ds-listbox-font-size",
	lineHeight: "--ds-listbox-line-height",
	disabledOpacity: "--ds-listbox-disabled-opacity",
	typeaheadReset: "--ds-listbox-typeahead-reset"
};
/** Surface chrome the host popup owns while `embedded`: overrides change values, never presence. */
const EMBEDDED_NO_OP = /* @__PURE__ */ new Set([
	"border",
	"borderInvalid",
	"borderWidth",
	"radius"
]);
function overridesToStyle$5(overrides, embedded) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		const hook = OVERRIDE_HOOK$6[binding];
		if (!ref || !hook || embedded && EMBEDDED_NO_OP.has(binding)) continue;
		style[hook] = cssVar(ref);
	}
	return style;
}
function isGroup$2(item) {
	return "group" in item;
}
/** Rows in document order, dropping group wrappers — the unit navigation and typeahead move over. */
function flattenRows$2(items) {
	const result = [];
	for (const item of items) if (isGroup$2(item)) result.push(...item.options);
	else result.push(item);
	return result;
}
function toArray$2(value) {
	if (Array.isArray(value)) return value;
	return value === void 0 ? [] : [value];
}
/** A CSS time (`120ms`, `1.2s`) in milliseconds; 0 when it cannot be read (no stylesheet loaded). */
function parseDuration(raw) {
	const match = /^(-?[\d.]+)(ms|s)$/.exec(raw.trim());
	if (!match) return 0;
	const amount = Number(match[1]);
	return match[2] === "s" ? amount * 1e3 : amount;
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
function Listbox({ ref, label, labelledBy, options, multiple = false, value, defaultValue, selectionFollowsFocus = true, required = false, invalid = false, error, embedded = false, initialActiveValue, loading = false, disabled = false, name, emptyMessage, maxVisible = "8", overrides, onChange, onActiveChange, onBlur, onFocus, onKeyDown, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-listbox${generatedId}`);
	const errorId = `${id}-error`;
	const emptyId = `${id}-empty`;
	const listRef = useRef(null);
	const optionRefs = useRef(/* @__PURE__ */ new Map());
	const typeahead = useRef({
		buffer: "",
		timer: null
	});
	useEffect(() => () => {
		if (typeahead.current.timer) clearTimeout(typeahead.current.timer);
	}, []);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !label) console.warn("Listbox: `label` is required, even with `labelledBy` — it is the {label} in the validation copy.");
	}, [label]);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selected = isControlled ? value : internalValue;
	const selectedValues = toArray$2(selected);
	const [activeValue, setActiveValueState] = useState(null);
	const isDisabled = disabled || (form?.disabled ?? false);
	const nothingSelected = selectedValues.length === 0;
	const formError = name ? form?.errors[name] : void 0;
	const isInvalid = invalid || error !== void 0 && error !== "";
	const resolvedError = (error !== void 0 && error !== "" ? error : void 0) ?? formError ?? (isInvalid ? (required && nothingSelected ? COPY$16.required : COPY$16.invalid).replace("{label}", label) : void 0);
	const showsInvalid = isInvalid || resolvedError !== void 0;
	const rows = useMemo(() => flattenRows$2(options), [options]);
	const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
	const maxVisibleKey = String(maxVisible);
	const lastInitialActive = useRef(initialActiveValue);
	useEffect(() => {
		if (lastInitialActive.current === initialActiveValue) return;
		lastInitialActive.current = initialActiveValue;
		const list = listRef.current;
		if (initialActiveValue === void 0 || list !== null && list.contains(document.activeElement)) return;
		if (!enabledRows.some((row) => row.value === initialActiveValue)) return;
		setActiveValueState((current) => current === initialActiveValue ? current : initialActiveValue);
	}, [initialActiveValue, enabledRows]);
	const latest = useRef({
		label,
		required,
		invalid,
		error,
		disabled: isDisabled,
		selected,
		multiple
	});
	latest.current = {
		label,
		required,
		invalid,
		error,
		disabled: isDisabled,
		selected,
		multiple
	};
	useEffect(() => {
		if (!form || !name) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => {
				const values = toArray$2(latest.current.selected);
				if (values.length === 0) return void 0;
				return latest.current.multiple ? values : values[0];
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp, selected: current } = latest.current;
				if (errorProp !== void 0 && errorProp !== "") return errorProp;
				if (isRequired && toArray$2(current).length === 0) return COPY$16.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$16.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => listRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const isSelected = (optionValue) => selectedValues.includes(optionValue);
	const commitValue = (next) => {
		if (!Array.isArray(next) && next === selected) return;
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form && name && form.validate === "change") form.validateField(name);
	};
	/** onChange receives the array in option order. */
	const inOptionOrder = (values) => rows.map((row) => row.value).filter((v) => values.includes(v));
	const setActiveValue = (next) => {
		if (next !== null) optionRefs.current.get(next)?.scrollIntoView?.({ block: "nearest" });
		if (next === activeValue) return;
		setActiveValueState(next);
		onActiveChange?.(next);
	};
	/** Arrows, Home/End, PageUp/PageDown and typeahead all move this way: select too when selection follows focus. */
	const moveActive = (optionValue) => {
		setActiveValue(optionValue);
		if (!multiple && selectionFollowsFocus) commitValue(optionValue);
	};
	const toggle = (optionValue) => {
		commitValue(inOptionOrder(selectedValues.includes(optionValue) ? selectedValues.filter((v) => v !== optionValue) : [...selectedValues, optionValue]));
	};
	const selectRow = (row) => {
		if (isDisabled || row.disabled) return;
		if (multiple) toggle(row.value);
		else commitValue(row.value);
	};
	/** Where focus lands first: `initialActiveValue` when enabled, else the first selected, else the first enabled. */
	const resolveInitialActive = () => {
		if (initialActiveValue !== void 0 && enabledRows.some((row) => row.value === initialActiveValue)) return initialActiveValue;
		return (enabledRows.find((row) => isSelected(row.value)) ?? enabledRows[0])?.value;
	};
	const handleTypeahead = (char, currentIndex) => {
		const state = typeahead.current;
		if (state.timer) clearTimeout(state.timer);
		state.buffer += char.toLowerCase();
		const list = listRef.current;
		const reset = list ? parseDuration(getComputedStyle(list).getPropertyValue("--ds-listbox-typeahead-reset")) : 0;
		state.timer = setTimeout(() => {
			state.buffer = "";
		}, reset);
		const count = enabledRows.length;
		const startOffset = state.buffer.length > 1 || currentIndex === -1 ? 0 : 1;
		const start = currentIndex === -1 ? 0 : currentIndex;
		for (let offset = startOffset; offset < count + startOffset; offset++) {
			const candidate = enabledRows[(start + offset) % count];
			if (candidate && candidate.label.toLowerCase().startsWith(state.buffer)) {
				moveActive(candidate.value);
				return;
			}
		}
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || isDisabled || enabledRows.length === 0) return;
		const currentIndex = activeValue === null ? -1 : enabledRows.findIndex((row) => row.value === activeValue);
		const last = enabledRows.length - 1;
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				const down = event.key === "ArrowDown";
				const targetIndex = currentIndex === -1 ? down ? 0 : last : Math.min(Math.max(currentIndex + (down ? 1 : -1), 0), last);
				const target = enabledRows[targetIndex];
				if (multiple && event.shiftKey) {
					setActiveValue(target.value);
					if (!selectedValues.includes(target.value)) commitValue(inOptionOrder([...selectedValues, target.value]));
				} else moveActive(target.value);
				break;
			}
			case "Home":
				event.preventDefault();
				moveActive(enabledRows[0].value);
				break;
			case "End":
				event.preventDefault();
				moveActive(enabledRows[last].value);
				break;
			case "PageDown":
			case "PageUp": {
				event.preventDefault();
				const down = event.key === "PageDown";
				let targetIndex;
				if (currentIndex === -1) targetIndex = down ? 0 : last;
				else if (maxVisibleKey === "all") targetIndex = down ? last : 0;
				else targetIndex = Math.min(Math.max(currentIndex + (down ? 1 : -1) * Number(maxVisibleKey), 0), last);
				moveActive(enabledRows[targetIndex].value);
				break;
			}
			case " ": {
				event.preventDefault();
				const target = currentIndex === -1 ? resolveInitialActive() : enabledRows[currentIndex].value;
				const row = enabledRows.find((candidate) => candidate.value === target);
				if (!row) break;
				setActiveValue(row.value);
				selectRow(row);
				break;
			}
			case "Enter": {
				if (multiple) break;
				const target = currentIndex === -1 ? resolveInitialActive() : enabledRows[currentIndex].value;
				if (target === void 0) break;
				event.preventDefault();
				setActiveValue(target);
				commitValue(target);
				break;
			}
			default: if (multiple && event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLowerCase() === "a") {
				event.preventDefault();
				const all = enabledRows.map((row) => row.value);
				const allSelected = all.every((v) => selectedValues.includes(v));
				const keep = selectedValues.filter((v) => !all.includes(v));
				commitValue(inOptionOrder(allSelected ? keep : [...keep, ...all]));
			} else if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) handleTypeahead(event.key, currentIndex);
		}
	};
	const handleFocus = (event) => {
		onFocus?.(event);
		if (isDisabled) return;
		if (event.target !== listRef.current && event.target !== event.currentTarget || activeValue !== null) return;
		const initial = resolveInitialActive();
		if (initial !== void 0) setActiveValue(initial);
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (event.target !== listRef.current) return;
		setActiveValue(null);
		if (form && name && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const handleRowPointerMove = (row) => {
		if (isDisabled || row.disabled) return;
		setActiveValue(row.value);
	};
	const handleRowClick = (row) => (event) => {
		if (isDisabled || row.disabled) {
			event.preventDefault();
			return;
		}
		setActiveValue(row.value);
		selectRow(row);
	};
	const setRowRef = (rowValue) => (element) => {
		if (element) optionRefs.current.set(rowValue, element);
		else optionRefs.current.delete(rowValue);
	};
	const renderRow = (row) => {
		const optionId = `${id}-option-${row.value}`;
		const descriptionId = row.description ? `${optionId}-description` : void 0;
		const rowSelected = isSelected(row.value);
		const rowDisabled = isDisabled || row.disabled === true;
		const classes = [
			"ds-listbox__option",
			row.value === activeValue ? "ds-listbox__option--active" : null,
			rowSelected ? "ds-listbox__option--selected" : null,
			row.disabled ? "ds-listbox__option--disabled" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("div", {
			ref: setRowRef(row.value),
			id: optionId,
			role: "option",
			"data-part": "option",
			"aria-selected": rowSelected ? "true" : "false",
			"aria-disabled": rowDisabled ? "true" : void 0,
			"aria-describedby": descriptionId,
			className: classes,
			onPointerMove: () => handleRowPointerMove(row),
			onClick: handleRowClick(row),
			children: [
				multiple ? /* @__PURE__ */ jsx("span", {
					className: "ds-listbox__check",
					"data-part": "optionCheck",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "check",
						size: "sm",
						overrides: { color: "color.control.selectedBackground" }
					})
				}) : null,
				row.icon ? /* @__PURE__ */ jsx("span", {
					className: "ds-listbox__icon",
					"data-part": "optionIcon",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: row.icon,
						size: "sm"
					})
				}) : null,
				/* @__PURE__ */ jsxs("span", {
					className: "ds-listbox__text",
					children: [/* @__PURE__ */ jsx("span", {
						className: "ds-listbox__label",
						"data-part": "optionLabel",
						children: row.label
					}), row.description ? /* @__PURE__ */ jsx("span", {
						id: descriptionId,
						className: "ds-listbox__description",
						"data-part": "optionDescription",
						children: row.description
					}) : null]
				})
			]
		}, row.value);
	};
	const renderItem = (item, index) => {
		if (!isGroup$2(item)) return renderRow(item);
		if (item.options.length === 0) return null;
		const groupLabelId = `${id}-group-${index}`;
		return /* @__PURE__ */ jsxs("div", {
			role: "group",
			"aria-labelledby": groupLabelId,
			"data-part": "group",
			className: "ds-listbox__group",
			children: [/* @__PURE__ */ jsx("div", {
				id: groupLabelId,
				"data-part": "groupLabel",
				className: "ds-listbox__group-label",
				children: item.group
			}), item.options.map(renderRow)]
		}, `group-${index}`);
	};
	const isEmpty = rows.length === 0;
	const describedBy = [isEmpty ? emptyId : null, resolvedError !== void 0 ? errorId : null].filter(Boolean).join(" ") || void 0;
	const classes = [
		"ds-listbox",
		`ds-listbox--max-visible-${maxVisibleKey}`,
		embedded ? "ds-listbox--embedded" : null,
		isDisabled ? "ds-listbox--disabled" : null,
		showsInvalid ? "ds-listbox--invalid" : null
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Listbox",
		"data-ds-field": "",
		className: classes,
		style: overrides ? overridesToStyle$5(overrides, embedded) : void 0,
		onKeyDown: handleKeyDown,
		onFocus: handleFocus,
		onBlur: handleBlur,
		children: [/* @__PURE__ */ jsx("div", {
			ref: listRef,
			id,
			"data-part": "list",
			role: "listbox",
			tabIndex: embedded ? -1 : 0,
			className: "ds-listbox__list",
			"aria-label": label,
			"aria-labelledby": labelledBy,
			"aria-multiselectable": multiple ? "true" : void 0,
			"aria-activedescendant": activeValue !== null ? `${id}-option-${activeValue}` : void 0,
			"aria-invalid": showsInvalid ? "true" : void 0,
			"aria-required": required ? "true" : void 0,
			"aria-describedby": describedBy,
			"aria-busy": loading ? "true" : void 0,
			"aria-disabled": isDisabled ? "true" : void 0,
			children: isEmpty ? /* @__PURE__ */ jsx("div", {
				id: emptyId,
				className: "ds-listbox__empty",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(Text, {
					"data-part": "emptyState",
					tone: "muted",
					children: loading ? COPY$16.loading : emptyMessage ?? COPY$16.empty
				})
			}) : options.map(renderItem)
		}), resolvedError !== void 0 ? /* @__PURE__ */ jsx(Text, {
			id: errorId,
			"data-part": "errorMessage",
			size: "sm",
			tone: "danger",
			children: resolvedError
		}) : null]
	});
}
//#endregion
//#region src/Select.tsx
/** copy.* — used verbatim; `{label}` is replaced by the visible label, `{count}` by the selection count. */
const COPY$15 = {
	placeholder: "Select…",
	selectedCount: "{count} selected",
	done: "Done",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
const ROOT_OVERRIDE_HOOK$4 = {
	triggerBorderInvalid: "--ds-select-trigger-border-invalid",
	triggerBorderWidth: "--ds-select-trigger-border-width",
	triggerRadius: "--ds-select-trigger-radius",
	triggerPaddingInline: "--ds-select-trigger-padding-inline",
	triggerPaddingBlock: "--ds-select-trigger-padding-block",
	triggerGap: "--ds-select-trigger-gap",
	chevronReserve: "--ds-select-chevron-reserve",
	partGap: "--ds-select-part-gap",
	fontFamily: "--ds-select-font-family",
	fontSize: "--ds-select-font-size",
	fontWeight: "--ds-select-font-weight",
	lineHeight: "--ds-select-line-height",
	disabledOpacity: "--ds-select-disabled-opacity"
};
/** The popup is portaled, so it inherits nothing from the root: its bindings are set on the popup node itself. */
const POPUP_OVERRIDE_HOOK = {
	popupSurface: "--ds-select-popup-surface",
	popupBorder: "--ds-select-popup-border",
	popupBorderWidth: "--ds-select-popup-border-width",
	popupShadow: "--ds-select-popup-shadow",
	popupRadius: "--ds-select-popup-radius",
	popupOffset: "--ds-select-popup-offset",
	layer: "--ds-select-layer",
	enter: "--ds-select-enter"
};
/** Splits `overrides` into the root and popup hooks and the forwards into each composed part. */
function resolveOverrides$7(overrides, size) {
	const rootStyle = {};
	const popupStyle = {};
	const given = overrides ?? {};
	for (const binding of Object.keys(given)) {
		const ref = given[binding];
		if (!ref) continue;
		const rootHook = ROOT_OVERRIDE_HOOK$4[binding];
		if (rootHook) rootStyle[rootHook] = cssVar(ref);
		const popupHook = POPUP_OVERRIDE_HOOK[binding];
		if (popupHook) popupStyle[popupHook] = cssVar(ref);
	}
	const fontSize = given.fontSize ?? `font.size.${size}`;
	const shared = {
		fontFamily: given.fontFamily ?? "font.family.body",
		lineHeight: given.lineHeight ?? "font.lineHeight.normal"
	};
	return {
		rootStyle: Object.keys(rootStyle).length > 0 ? rootStyle : void 0,
		popupStyle,
		label: {
			...shared,
			fontSize,
			fontWeight: given.labelWeight ?? "font.weight.medium"
		},
		value: {
			...shared,
			fontSize,
			fontWeight: given.fontWeight ?? "font.weight.regular"
		},
		helper: {
			...shared,
			fontSize: given.helperSize ?? "font.size.sm"
		},
		listbox: shared
	};
}
/** The locked `chevron` binding, realised through the composed Icon's color. */
const CHEVRON_OVERRIDES = { color: "color.foreground.muted" };
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$1() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
function isGroup$1(option) {
	return "group" in option;
}
/** Depth-first rows, dropping group wrappers — used to resolve a value to its label. */
function flattenRows$1(options) {
	const result = [];
	for (const option of options) if (isGroup$1(option)) result.push(...flattenRows$1(option.options));
	else result.push(option);
	return result;
}
function toArray$1(value) {
	if (Array.isArray(value)) return value;
	return value === void 0 || value === "" ? [] : [value];
}
/** Below the trigger (above when it would overflow), start-aligned, kept inside the viewport, at least as wide as the trigger. */
function computePosition$2(triggerRect, popupRect) {
	const viewportHeight = window.innerHeight;
	const viewportWidth = window.innerWidth;
	const vertical = triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0 ? "top" : "bottom";
	const width = Math.max(popupRect.width, triggerRect.width);
	const style = {
		left: Math.max(0, Math.min(triggerRect.left, viewportWidth - width)),
		"--ds-select-trigger-width": `${triggerRect.width}px`
	};
	if (vertical === "bottom") style.top = triggerRect.bottom;
	else style.bottom = viewportHeight - triggerRect.top;
	return {
		style,
		vertical
	};
}
function displayText(selected, rows, multiple, placeholder) {
	const labelFor = (v) => rows.find((row) => row.value === v)?.label ?? v;
	const values = toArray$1(selected);
	if (values.length === 0) return {
		text: placeholder,
		isPlaceholder: true
	};
	if (!multiple) return {
		text: labelFor(values[0]),
		isPlaceholder: false
	};
	if (values.length <= 2) return {
		text: values.map(labelFor).join(", "),
		isPlaceholder: false
	};
	return {
		text: COPY$15.selectedCount.replace("{count}", String(values.length)),
		isPlaceholder: false
	};
}
/** Keys that open the closed popup from the trigger. */
const OPEN_KEYS = /* @__PURE__ */ new Set([
	"Enter",
	" ",
	"ArrowDown",
	"ArrowUp"
]);
/**
* Select — Design Schema, category: input. The APG select-only combobox.
*
* When to use:
* Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.
*/
function Select({ ref, label, name, options, value, defaultValue, placeholder, hideLabel = false, size = "md", open: openProp, multiple = false, description, required = false, disabled = false, invalid = false, error, native = "auto", container, overrides, onChange, onOpenChange, id: idProp, onClick: onClickProp, onKeyDown: onKeyDownProp, onFocus, onBlur, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-select${generatedId}`);
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const listboxId = `${id}-listbox`;
	const triggerRef = useRef(null);
	const selectRef = useRef(null);
	const popupRef = useRef(null);
	const listboxRef = useRef(null);
	const isNativeSelect = native === "always";
	useImperativeHandle(ref, () => isNativeSelect ? selectRef.current : triggerRef.current, [isNativeSelect]);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selected = isControlled ? value : internalValue;
	const selectedValues = toArray$1(selected);
	const isOpenControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = !isNativeSelect && (isOpenControlled ? openProp : internalOpen);
	const openRef = useRef(open);
	openRef.current = open;
	const forwarding = useRef(false);
	const [activeValue, setActiveValue] = useState(null);
	const [popupPosition, setPopupPosition] = useState();
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = (error !== void 0 && error !== "" ? error : void 0) ?? form?.errors[name] ?? (invalid ? COPY$15.invalid.replace("{label}", label) : void 0);
	const isInvalid = invalid || resolvedError !== void 0;
	const rows = flattenRows$1(options);
	const resolvedPlaceholder = placeholder ?? COPY$15.placeholder;
	const { text: triggerText, isPlaceholder } = displayText(selected, rows, multiple, resolvedPlaceholder);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !label) console.warn("Select: `label` is required; it is the trigger’s accessible name.");
	}, [label]);
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		selected,
		multiple,
		invalid,
		error
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		selected,
		multiple,
		invalid,
		error
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => {
				const values = toArray$1(latest.current.selected);
				if (values.length === 0) return void 0;
				return latest.current.multiple ? values : values[0];
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, selected: current, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				if (isRequired && toArray$1(current).length === 0) return COPY$15.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$15.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => isNativeSelect ? selectRef.current?.focus() : triggerRef.current?.focus()
		});
	}, [
		form,
		name,
		id,
		isNativeSelect
	]);
	const commitValue = (next) => {
		if (!Array.isArray(next) && next === selected) return;
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	};
	const changeOpen = (next) => {
		openRef.current = next;
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};
	const openSelect = () => {
		if (openRef.current || isDisabled) return;
		changeOpen(true);
	};
	const closeSelect = (focusTrigger) => {
		if (!openRef.current) return;
		setActiveValue(null);
		if (focusTrigger) triggerRef.current?.focus();
		changeOpen(false);
	};
	/** The option Enter and Tab commit: the active one, else the selected, else the first enabled. */
	const resolveActive = () => activeValue ?? rows.find((row) => !row.disabled && selectedValues.includes(row.value))?.value ?? rows.find((row) => !row.disabled)?.value;
	useLayoutEffect(() => {
		if (!open) {
			setEntered(false);
			return;
		}
		const trigger = triggerRef.current;
		const popup = popupRef.current;
		if (!trigger || !popup) return void 0;
		const reposition = () => {
			const result = computePosition$2(trigger.getBoundingClientRect(), popup.getBoundingClientRect());
			setPopupPosition(result.style);
			setVertical(result.vertical);
		};
		reposition();
		listboxRef.current?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		if (document.activeElement !== trigger) trigger.focus();
		if (prefersReducedMotion$1()) setEntered(true);
		else requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open]);
	const closeRef = useRef(closeSelect);
	closeRef.current = closeSelect;
	useEffect(() => {
		if (!open) return void 0;
		const isOutside = (target) => !target || !popupRef.current?.contains(target) && !triggerRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (isOutside(event.target)) closeRef.current(false);
		};
		const handleFocusOut = (event) => {
			if (isOutside(event.relatedTarget)) closeRef.current(false);
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
		};
	}, [open]);
	/** Select's own keys while open; returns true when the key was handled here. */
	const handleOpenKey = (event) => {
		switch (event.key) {
			case "Escape":
				event.preventDefault();
				closeSelect(true);
				return true;
			case "Tab":
				if (!multiple) {
					const target = resolveActive();
					if (target !== void 0) commitValue(target);
				}
				if (triggerRef.current && document.activeElement !== triggerRef.current) triggerRef.current.focus();
				closeSelect(false);
				return true;
			case "Enter": {
				event.preventDefault();
				const target = resolveActive();
				if (multiple) {
					if (target !== void 0) commitValue(rows.map((row) => row.value).filter((v) => v === target ? !selectedValues.includes(v) : selectedValues.includes(v)));
				} else {
					if (target !== void 0) commitValue(target);
					closeSelect(true);
				}
				return true;
			}
			default: return false;
		}
	};
	const handleTriggerClick = (event) => {
		onClickProp?.(event);
		if (event.defaultPrevented || isDisabled) return;
		if (openRef.current) closeSelect(false);
		else openSelect();
	};
	const handleTriggerKeyDown = (event) => {
		onKeyDownProp?.(event);
		if (event.defaultPrevented) return;
		if (!open) {
			if (!isDisabled && OPEN_KEYS.has(event.key)) {
				event.preventDefault();
				openSelect();
			}
			return;
		}
		if (handleOpenKey(event)) return;
		const list = listboxRef.current;
		if (!list) return;
		const forwarded = new KeyboardEvent("keydown", {
			key: event.key,
			code: event.code,
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey,
			altKey: event.altKey,
			bubbles: true,
			cancelable: true
		});
		forwarding.current = true;
		try {
			list.dispatchEvent(forwarded);
		} finally {
			forwarding.current = false;
		}
		if (forwarded.defaultPrevented) event.preventDefault();
		if (event.key === " " && !multiple) closeSelect(true);
	};
	const handlePopupKeyDown = (event) => {
		if (forwarding.current || event.target === triggerRef.current) return;
		if (event.key === "Enter" && !multiple) {
			closeSelect(true);
			return;
		}
		if (event.key === "Escape" || event.key === "Tab" || event.key === "Enter" && multiple) handleOpenKey(event);
	};
	const handleListboxChange = (next) => {
		commitValue(next);
		if (!multiple) closeSelect(true);
	};
	const handlePopupClick = (event) => {
		if (multiple) return;
		const option = event.target.closest("[role=\"option\"]");
		if (option && option.getAttribute("aria-disabled") !== "true") closeSelect(true);
	};
	const resolved = resolveOverrides$7(overrides, size);
	const classes = [
		"ds-select",
		`ds-select--${size}`,
		isInvalid ? "ds-select--invalid" : null,
		isDisabled ? "ds-select--disabled" : null
	].filter(Boolean).join(" ");
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const handleLabelClick = (event) => {
		if (isNativeSelect) return;
		event.preventDefault();
		triggerRef.current?.focus();
	};
	const labelNode = /* @__PURE__ */ jsx("label", {
		htmlFor: id,
		id: labelId,
		className: ["ds-select__label", hideLabel ? "ds-select__visually-hidden" : null].filter(Boolean).join(" "),
		onClick: handleLabelClick,
		children: /* @__PURE__ */ jsxs(Text, {
			element: "span",
			weight: "medium",
			"data-part": "label",
			overrides: resolved.label,
			children: [label, required ? COPY$15.requiredIndicator : null]
		})
	});
	const descriptionNode = description ? /* @__PURE__ */ jsx(Text, {
		element: "span",
		id: descriptionId,
		size: "sm",
		tone: "muted",
		"data-part": "description",
		overrides: resolved.helper,
		children: description
	}) : null;
	const errorNode = resolvedError ? /* @__PURE__ */ jsx("span", {
		className: "ds-select__error",
		id: errorId,
		role: "alert",
		children: /* @__PURE__ */ jsx(Text, {
			element: "span",
			size: "sm",
			tone: "danger",
			"data-part": "errorMessage",
			overrides: resolved.helper,
			children: resolvedError
		})
	}) : null;
	const chevronNode = /* @__PURE__ */ jsx("span", {
		className: "ds-select__chevron",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx(Icon, {
			name: "chevron-down",
			size: "sm",
			"data-part": "chevron",
			overrides: CHEVRON_OVERRIDES
		})
	});
	if (isNativeSelect) {
		const handleNativeChange = (event) => {
			commitValue(multiple ? Array.from(event.target.selectedOptions, (option) => option.value) : event.target.value);
		};
		const handleNativeBlur = (event) => {
			onBlur?.(event);
			if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
		};
		const renderNativeNode = (node, path) => {
			if (isGroup$1(node)) return /* @__PURE__ */ jsx("optgroup", {
				label: node.group,
				children: node.options.map((child, index) => renderNativeNode(child, `${path}-${index}`))
			}, `${path}-group`);
			return /* @__PURE__ */ jsx("option", {
				value: node.value,
				disabled: node.disabled,
				children: node.label
			}, node.value);
		};
		const nativeValue = multiple ? selectedValues : selectedValues[0] ?? "";
		return /* @__PURE__ */ jsxs("div", {
			"data-ds": "Select",
			"data-ds-field": "",
			className: classes,
			style: resolved.rootStyle,
			children: [
				labelNode,
				descriptionNode,
				/* @__PURE__ */ jsxs("span", {
					className: "ds-select__native-wrap",
					children: [/* @__PURE__ */ jsxs("select", {
						...rest,
						ref: selectRef,
						id,
						name,
						multiple,
						value: nativeValue,
						required,
						disabled: isDisabled,
						className: "ds-select__native",
						"data-part": "trigger",
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						onChange: handleNativeChange,
						onFocus,
						onBlur: handleNativeBlur,
						children: [!multiple ? /* @__PURE__ */ jsx("option", {
							value: "",
							disabled: true,
							children: resolvedPlaceholder
						}) : null, options.map((node, index) => renderNativeNode(node, String(index)))]
					}), !multiple ? chevronNode : null]
				}),
				errorNode
			]
		});
	}
	const initialActive = selectedValues[0];
	return /* @__PURE__ */ jsxs("div", {
		"data-ds": "Select",
		"data-ds-field": "",
		className: classes,
		style: resolved.rootStyle,
		children: [
			labelNode,
			descriptionNode,
			/* @__PURE__ */ jsxs("button", {
				...rest,
				ref: triggerRef,
				type: "button",
				id,
				role: "combobox",
				"aria-haspopup": "listbox",
				"aria-expanded": open ? "true" : "false",
				"aria-controls": open ? listboxId : void 0,
				"aria-activedescendant": open && activeValue !== null ? `${listboxId}-option-${activeValue}` : void 0,
				"aria-labelledby": labelId,
				"aria-describedby": describedBy || void 0,
				"aria-invalid": isInvalid ? "true" : void 0,
				"aria-required": required ? "true" : void 0,
				"aria-disabled": isDisabled ? "true" : void 0,
				"data-part": "trigger",
				className: "ds-select__trigger",
				onClick: handleTriggerClick,
				onKeyDown: handleTriggerKeyDown,
				onFocus,
				onBlur,
				children: [/* @__PURE__ */ jsx("span", {
					className: "ds-select__value",
					children: /* @__PURE__ */ jsx(Text, {
						element: "span",
						"data-part": "value",
						tone: isPlaceholder ? "muted" : "default",
						overrides: resolved.value,
						children: triggerText
					})
				}), chevronNode]
			}),
			isDisabled ? null : selectedValues.map((v) => /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: v
			}, v)),
			errorNode,
			open ? createPortal(/* @__PURE__ */ jsx("div", {
				ref: popupRef,
				"data-part": "popup",
				"data-vertical": vertical,
				className: ["ds-select__popup", entered ? "ds-select__popup--entered" : null].filter(Boolean).join(" "),
				style: {
					...popupPosition,
					...resolved.popupStyle
				},
				onMouseDown: (event) => event.preventDefault(),
				onClick: handlePopupClick,
				onKeyDown: handlePopupKeyDown,
				children: /* @__PURE__ */ jsx(Listbox, {
					ref: listboxRef,
					id: listboxId,
					"data-part": "listbox",
					label,
					labelledBy: labelId,
					options,
					multiple,
					value: multiple ? selectedValues : selectedValues[0] ?? [],
					selectionFollowsFocus: false,
					embedded: true,
					initialActiveValue: initialActive,
					overrides: resolved.listbox,
					onChange: handleListboxChange,
					onActiveChange: setActiveValue
				})
			}), container ?? document.body) : null
		]
	});
}
//#endregion
//#region src/Combobox.tsx
/** copy.* — used verbatim; `{label}`, `{value}` and `{count}` are the only interpolations. */
const COPY$14 = {
	empty: "No matches",
	loading: "Loading…",
	addCustom: "Add \"{value}\"",
	clearLabel: "Clear",
	toggleLabel: "Show options",
	removeChip: "Remove {label}",
	resultCount: {
		one: "{count} result available",
		other: "{count} results available"
	},
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
/** constant `statusDebounce`: motion.duration.base × 2, read from the token at run time. */
const STATUS_DEBOUNCE = {
	token: "--motion-duration-base",
	multiply: 2
};
/** The value of the synthetic `copy.addCustom` row; never a selected value. */
const CUSTOM_ROW_VALUE = "ds-combobox-custom";
/** Hooks on the root. `labelWeight` and `helperSize` are forwarded to the composed Text instead. */
const ROOT_HOOK$2 = {
	fieldBorderInvalid: "--ds-combobox-field-border-invalid",
	fieldBorderWidth: "--ds-combobox-field-border-width",
	fieldRadius: "--ds-combobox-field-radius",
	fieldPaddingInline: "--ds-combobox-field-padding-inline",
	fieldPaddingBlock: "--ds-combobox-field-padding-block",
	fieldGap: "--ds-combobox-field-gap",
	chipRadius: "--ds-combobox-chip-radius",
	chipPaddingInline: "--ds-combobox-chip-padding-inline",
	chipPaddingBlock: "--ds-combobox-chip-padding-block",
	chipGap: "--ds-combobox-chip-gap",
	partGap: "--ds-combobox-part-gap",
	fontFamily: "--ds-combobox-font-family",
	fontSize: "--ds-combobox-font-size",
	chipSize: "--ds-combobox-chip-size",
	lineHeight: "--ds-combobox-line-height",
	disabledOpacity: "--ds-combobox-disabled-opacity"
};
/** Hooks on the portaled popup, which does not inherit from the root. */
const POPUP_HOOK$1 = {
	popupSurface: "--ds-combobox-popup-surface",
	popupBorder: "--ds-combobox-popup-border",
	popupBorderWidth: "--ds-combobox-popup-border-width",
	popupShadow: "--ds-combobox-popup-shadow",
	popupRadius: "--ds-combobox-popup-radius",
	popupOffset: "--ds-combobox-popup-offset",
	layer: "--ds-combobox-layer",
	enter: "--ds-combobox-enter"
};
function resolveOverrides$6(overrides) {
	const root = {};
	const popup = {};
	let label;
	let helper;
	for (const binding of Object.keys(overrides ?? {})) {
		const ref = overrides?.[binding];
		if (!ref) continue;
		if (binding === "labelWeight") label = { fontWeight: ref };
		else if (binding === "helperSize") helper = { fontSize: ref };
		else if (ROOT_HOOK$2[binding]) root[ROOT_HOOK$2[binding]] = cssVar(ref);
		else if (POPUP_HOOK$1[binding]) popup[POPUP_HOOK$1[binding]] = cssVar(ref);
	}
	return {
		root: Object.keys(root).length ? root : void 0,
		popup: Object.keys(popup).length ? popup : void 0,
		label,
		helper
	};
}
function isGroup(option) {
	return "group" in option;
}
function flattenRows(options) {
	const result = [];
	for (const option of options) if (isGroup(option)) result.push(...flattenRows(option.options));
	else result.push(option);
	return result;
}
/** Keeps the rows matching `predicate`, dropping groups left empty. */
function filterTree(options, predicate) {
	const result = [];
	for (const option of options) if (isGroup(option)) {
		const children = option.options.filter(predicate);
		if (children.length > 0) result.push({
			group: option.group,
			options: children
		});
	} else if (predicate(option)) result.push(option);
	return result;
}
const COMBINING_MARKS = /\p{M}/gu;
/** Case- and diacritic-insensitive comparison key. */
function normalize(text) {
	return text.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase();
}
function toArray(value) {
	if (Array.isArray(value)) return value;
	return value === void 0 || value === "" ? [] : [value];
}
/** A resolved CSS time (`320ms`, `0.32s`) in ms; `null` when it cannot be read. */
function parseTime$2(value) {
	const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
	if (!match) return null;
	const amount = Number(match[1]);
	return match[2] === "s" ? amount * 1e3 : amount;
}
/** Below the field, flipped above when it would overflow and there is more room there; never past the inline edge. */
function computePosition$1(field, popup) {
	const viewportHeight = window.innerHeight;
	const vertical = field.bottom + popup.height > viewportHeight && field.top > viewportHeight - field.bottom ? "top" : "bottom";
	const width = Math.max(popup.width, field.width);
	return {
		vertical,
		left: Math.max(0, Math.min(field.left, window.innerWidth - width)),
		top: vertical === "bottom" ? field.bottom : void 0,
		bottom: vertical === "top" ? viewportHeight - field.top : void 0,
		minInlineSize: field.width
	};
}
function samePosition$1(a, b) {
	return a !== null && a.vertical === b.vertical && a.left === b.left && a.top === b.top && a.bottom === b.bottom && a.minInlineSize === b.minInlineSize;
}
/**
* Combobox — Design Schema, category: input.
*
* When to use:
* Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.
*/
function Combobox({ ref, label, name, options, value, defaultValue, open: openProp, inputValue, multiple = false, allowCustom = false, filter = "contains", placeholder, description, required = false, disabled = false, invalid = false, error, loading = false, clearable = true, container, overrides, onChange, onInputChange, onOpenChange, onKeyDown, onClick, onBlur, id: idProp, readOnly, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-combobox${generatedId}`);
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const listboxId = `${id}-listbox`;
	const optionId = (optionValue) => `${listboxId}-option-${optionValue}`;
	const rootRef = useRef(null);
	const fieldRef = useRef(null);
	const inputRef = useRef(null);
	const popupRef = useRef(null);
	const listboxRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !label) console.warn("Combobox: `label` is required; it is the visible label and the accessible name.");
	}, [label]);
	const rows = useMemo(() => flattenRows(options), [options]);
	const labelFor = (optionValue) => rows.find((row) => row.value === optionValue)?.label ?? optionValue;
	const isValueControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selected = isValueControlled ? value : internalValue;
	const selectedValues = toArray(selected);
	const singleValue = multiple ? void 0 : selectedValues[0];
	const isTextControlled = inputValue !== void 0;
	const [internalText, setInternalText] = useState(() => {
		const initial = multiple ? void 0 : toArray(value ?? defaultValue)[0];
		return initial === void 0 ? "" : labelFor(initial);
	});
	const text = isTextControlled ? inputValue : internalText;
	const trimmedText = text.trim();
	const isDisabled = disabled || (form?.disabled ?? false);
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = (openProp ?? internalOpen) && !isDisabled;
	const [showAll, setShowAll] = useState(false);
	const [activeValue, setActiveValue] = useState(null);
	const [openIntent, setOpenIntent] = useState("selectedOrFirst");
	const [activeRequest, setActiveRequest] = useState({
		generation: 0,
		intent: "selectedOrFirst"
	});
	const [seenOpen, setSeenOpen] = useState(isOpen);
	const [position, setPosition] = useState(null);
	const [statusText, setStatusText] = useState("");
	/** Remounts the Listbox with a new starting active option: the only way to reset its internal state. */
	const requestActive = (intent) => {
		setActiveValue(null);
		setActiveRequest((request) => ({
			generation: request.generation + 1,
			intent
		}));
	};
	if (isOpen !== seenOpen) {
		setSeenOpen(isOpen);
		setActiveValue(null);
		if (isOpen) {
			setActiveRequest((request) => ({
				generation: request.generation + 1,
				intent: openIntent
			}));
			setOpenIntent("selectedOrFirst");
		} else setShowAll(false);
	}
	const formError = form?.errors[name];
	const markedInvalid = invalid || formError !== void 0;
	const resolvedError = error !== void 0 && error !== "" ? error : formError !== void 0 && formError !== "" ? formError : markedInvalid ? COPY$14.invalid.replace("{label}", label) : void 0;
	const isInvalid = markedInvalid || resolvedError !== void 0;
	const isLoading = filter === "async" && loading;
	const query = showAll || filter === "none" || filter === "async" ? "" : normalize(trimmedText);
	const filteredOptions = useMemo(() => {
		if (query === "") return options;
		return filterTree(options, (row) => filter === "startsWith" ? normalize(row.label).startsWith(query) : normalize(row.label).includes(query));
	}, [
		options,
		filter,
		query
	]);
	const resultCount = useMemo(() => flattenRows(filteredOptions).length, [filteredOptions]);
	const normalizedText = normalize(trimmedText);
	const showCustomRow = allowCustom && trimmedText !== "" && !rows.some((row) => normalize(row.value) === normalizedText || normalize(row.label) === normalizedText);
	const listOptions = useMemo(() => {
		if (isLoading) return [];
		return showCustomRow ? [{
			value: CUSTOM_ROW_VALUE,
			label: COPY$14.addCustom.replace("{value}", trimmedText)
		}, ...filteredOptions] : filteredOptions;
	}, [
		isLoading,
		showCustomRow,
		trimmedText,
		filteredOptions
	]);
	const enabledRows = useMemo(() => flattenRows(listOptions).filter((row) => !row.disabled), [listOptions]);
	const resolveIntent = (intent) => {
		const selectedRow = enabledRows.find((row) => selectedValues.includes(row.value))?.value;
		if (intent === "none") return void 0;
		if (intent === "selected") return selectedRow;
		if (intent === "selectedOrFirst") return selectedRow ?? enabledRows[0]?.value;
		if (intent === "selectedOrLast") return selectedRow ?? enabledRows[enabledRows.length - 1]?.value;
		if (intent === "typeahead") return normalizedText === "" ? void 0 : enabledRows.find((row) => normalize(row.label).startsWith(normalizedText))?.value;
		return enabledRows.some((row) => row.value === intent.value) ? intent.value : void 0;
	};
	const requestedActive = resolveIntent(activeRequest.intent);
	useLayoutEffect(() => {
		if (!isOpen || requestedActive === void 0) return;
		listboxRef.current?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
	}, [isOpen, activeRequest.generation]);
	useLayoutEffect(() => {
		if (!isOpen) return;
		const input = inputRef.current;
		if (input && !fieldRef.current?.contains(document.activeElement)) input.focus();
	}, [isOpen]);
	const rowSignature = `${isLoading}|${rows.map((row) => row.value).join("\0")}`;
	const lastRowSignature = useRef(rowSignature);
	useEffect(() => {
		if (lastRowSignature.current === rowSignature) return;
		lastRowSignature.current = rowSignature;
		if (isOpen) requestActive("none");
	}, [rowSignature]);
	useEffect(() => {
		if (multiple || isTextControlled || singleValue === void 0) return;
		setInternalText(labelFor(singleValue));
	}, [singleValue]);
	const latest = useRef({
		label,
		required,
		invalid,
		error,
		disabled: isDisabled,
		selected,
		multiple
	});
	latest.current = {
		label,
		required,
		invalid,
		error,
		disabled: isDisabled,
		selected,
		multiple
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => {
				const values = toArray(latest.current.selected);
				if (values.length === 0) return void 0;
				return latest.current.multiple ? values : values[0];
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const current = latest.current;
				if (current.error !== void 0) return current.error;
				if (current.required && toArray(current.selected).length === 0) return COPY$14.required.replace("{label}", current.label);
				if (current.invalid) return COPY$14.invalid.replace("{label}", current.label);
				return null;
			},
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	useEffect(() => {
		if (!isOpen) {
			setStatusText("");
			return;
		}
		let message;
		if (isLoading) message = COPY$14.loading;
		else if (resultCount === 0) message = COPY$14.empty;
		else {
			const locale = rootRef.current?.closest("[lang]")?.getAttribute("lang") || void 0;
			let rules;
			try {
				rules = new Intl.PluralRules(locale);
			} catch {
				rules = new Intl.PluralRules();
			}
			message = (rules.select(resultCount) === "one" ? COPY$14.resultCount.one : COPY$14.resultCount.other).replace("{count}", String(resultCount));
		}
		const base = rootRef.current ? parseTime$2(getComputedStyle(rootRef.current).getPropertyValue(STATUS_DEBOUNCE.token)) : null;
		const timer = setTimeout(() => setStatusText(message), base === null ? 0 : base * STATUS_DEBOUNCE.multiply);
		return () => clearTimeout(timer);
	}, [
		isOpen,
		isLoading,
		resultCount
	]);
	useLayoutEffect(() => {
		if (!isOpen) return void 0;
		const reposition = () => {
			const field = fieldRef.current;
			const popup = popupRef.current;
			if (!field || !popup) return;
			const next = computePosition$1(field.getBoundingClientRect(), popup.getBoundingClientRect());
			setPosition((previous) => samePosition$1(previous, next) ? previous : next);
		};
		reposition();
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [isOpen, listOptions]);
	const setOpenState = (next) => {
		if (next === isOpen || next && isDisabled) return;
		if (openProp === void 0) setInternalOpen(next);
		onOpenChange?.(next);
	};
	const openWith = (intent) => {
		if (isOpen) {
			requestActive(intent);
			return;
		}
		setOpenIntent(intent);
		setOpenState(true);
	};
	const close = () => setOpenState(false);
	const closeRef = useRef(close);
	closeRef.current = close;
	useEffect(() => {
		if (!isOpen) return void 0;
		const isOutside = (target) => !(target instanceof Node) || !fieldRef.current?.contains(target) && !popupRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (isOutside(event.target)) closeRef.current();
		};
		const handleFocusOut = (event) => {
			if (fieldRef.current?.contains(event.target) && isOutside(event.relatedTarget)) closeRef.current();
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
		};
	}, [isOpen]);
	const commitValue = (next) => {
		if (!isValueControlled) setInternalValue(next);
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	};
	const updateText = (next) => {
		if (next === text) return;
		if (!isTextControlled) setInternalText(next);
		onInputChange?.(next);
	};
	/** Commits typed text; text matching an option by value or label commits that option's value, never a custom string. */
	const commitCustom = (raw) => {
		if (raw === "") return;
		const key = normalize(raw);
		const match = rows.find((row) => normalize(row.value) === key || normalize(row.label) === key);
		if (match?.disabled) return;
		const committed = match?.value ?? raw;
		if (multiple) {
			if (!selectedValues.includes(committed)) commitValue([...selectedValues, committed]);
			updateText("");
			requestActive("none");
		} else {
			if (committed !== singleValue) commitValue(committed);
			updateText(match?.label ?? raw);
			close();
		}
	};
	/** Commits one row: single selects and closes; multiple toggles (selection order), clears the text and stays open. */
	const commitRow = (rowValue) => {
		if (rowValue === CUSTOM_ROW_VALUE) {
			commitCustom(trimmedText);
			return;
		}
		if (multiple) {
			commitValue(selectedValues.includes(rowValue) ? selectedValues.filter((v) => v !== rowValue) : [...selectedValues, rowValue]);
			updateText("");
			requestActive({ value: rowValue });
		} else {
			if (rowValue !== singleValue) commitValue(rowValue);
			updateText(labelFor(rowValue));
			close();
		}
	};
	const handleListboxChange = (next) => {
		if (!Array.isArray(next)) {
			commitRow(next);
			return;
		}
		const toggled = next.find((v) => !selectedValues.includes(v)) ?? selectedValues.find((v) => !next.includes(v));
		if (toggled !== void 0) commitRow(toggled);
	};
	const handlePopupClick = (event) => {
		if (multiple || singleValue === void 0) return;
		const option = event.target.closest("[role=\"option\"]");
		if (option && option.id === optionId(singleValue) && option.getAttribute("aria-disabled") !== "true") {
			updateText(labelFor(singleValue));
			close();
		}
	};
	const handleInputChange = (event) => {
		if (isDisabled) return;
		setShowAll(false);
		updateText(event.target.value);
		openWith(filter === "none" ? "typeahead" : "none");
	};
	const handleInputClick = (event) => {
		onClick?.(event);
		if (isDisabled || isOpen) return;
		setShowAll(true);
		openWith("selectedOrFirst");
	};
	const handleInputBlur = (event) => {
		onBlur?.(event);
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const forwardToListbox = (key) => {
		listboxRef.current?.dispatchEvent(new KeyboardEvent("keydown", {
			key,
			bubbles: true,
			cancelable: true
		}));
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented) return;
		if (isDisabled) return;
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				const down = event.key === "ArrowDown";
				if (down && event.altKey) {
					if (!isOpen) openWith("selected");
				} else if (!isOpen) openWith(down ? "selectedOrFirst" : "selectedOrLast");
				else forwardToListbox(event.key);
				break;
			}
			case "Enter":
				if (!isOpen) break;
				event.preventDefault();
				if (activeValue !== null) commitRow(activeValue);
				else if (allowCustom) commitCustom(trimmedText);
				break;
			case ",":
				if (!allowCustom) break;
				event.preventDefault();
				commitCustom(trimmedText);
				break;
			case "Escape":
				if (isOpen) {
					event.preventDefault();
					close();
				} else if (clearable && text !== "") {
					event.preventDefault();
					updateText("");
				}
				break;
			case "Tab":
				if (isOpen) close();
				break;
			case "Backspace": if (multiple && text === "" && selectedValues.length > 0) {
				event.preventDefault();
				commitValue(selectedValues.slice(0, -1));
			}
		}
	};
	const handleClear = () => {
		if (isDisabled) return;
		updateText("");
		if (selectedValues.length > 0) commitValue(multiple ? [] : "");
		inputRef.current?.focus();
	};
	const handleToggle = () => {
		if (isDisabled) return;
		inputRef.current?.focus();
		if (isOpen) {
			close();
			return;
		}
		setShowAll(true);
		openWith("selectedOrFirst");
	};
	const handleRemoveChip = (chipValue) => {
		if (isDisabled) return;
		commitValue(selectedValues.filter((v) => v !== chipValue));
		inputRef.current?.focus();
	};
	const handleFieldMouseDown = (event) => {
		if (event.target === event.currentTarget) {
			event.preventDefault();
			inputRef.current?.focus();
		}
	};
	const resolved = resolveOverrides$6(overrides);
	const describedBy = [description ? descriptionId : null, resolvedError !== void 0 ? errorId : null].filter(Boolean).join(" ");
	const showClear = clearable && !isDisabled && (selectedValues.length > 0 || text !== "");
	const classes = [
		"ds-combobox",
		isInvalid ? "ds-combobox--invalid" : null,
		isDisabled ? "ds-combobox--disabled" : null
	].filter(Boolean).join(" ");
	const popupStyle = {
		...resolved.popup,
		...position ? {
			left: position.left,
			top: position.top,
			bottom: position.bottom,
			minInlineSize: position.minInlineSize
		} : null
	};
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		"data-ds": "Combobox",
		"data-ds-field": "",
		className: classes,
		style: resolved.root,
		children: [
			/* @__PURE__ */ jsx("label", {
				htmlFor: id,
				id: labelId,
				className: "ds-combobox__label",
				"data-part": "label",
				children: /* @__PURE__ */ jsxs(Text, {
					element: "span",
					weight: "medium",
					overrides: resolved.label,
					children: [label, required ? COPY$14.requiredIndicator : null]
				})
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				size: "sm",
				tone: "muted",
				"data-part": "description",
				overrides: resolved.helper,
				children: description
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				ref: fieldRef,
				className: "ds-combobox__field",
				"data-part": "field",
				onMouseDown: handleFieldMouseDown,
				children: [
					multiple && selectedValues.length > 0 ? /* @__PURE__ */ jsx("span", {
						className: "ds-combobox__chips",
						"data-part": "chips",
						children: selectedValues.map((chipValue) => {
							const chipLabel = labelFor(chipValue);
							return /* @__PURE__ */ jsxs("span", {
								className: "ds-combobox__chip",
								"data-part": "chip",
								children: [/* @__PURE__ */ jsx("span", {
									className: "ds-combobox__chip-label",
									children: chipLabel
								}), /* @__PURE__ */ jsx("span", {
									className: "ds-combobox__control",
									"data-part": "chipRemove",
									onClick: () => handleRemoveChip(chipValue),
									children: /* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "sm",
										iconOnly: true,
										label: COPY$14.removeChip.replace("{label}", chipLabel),
										leadingIcon: /* @__PURE__ */ jsx(Icon, {
											name: "close",
											inline: true,
											overrides: { color: "color.foreground.muted" }
										}),
										disabled: isDisabled
									})
								})]
							}, chipValue);
						})
					}) : null,
					/* @__PURE__ */ jsx("input", {
						...rest,
						ref: inputRef,
						id,
						type: "text",
						role: "combobox",
						className: "ds-combobox__input",
						"data-part": "input",
						value: text,
						placeholder,
						readOnly: isDisabled || readOnly,
						autoComplete: "off",
						"aria-autocomplete": "list",
						"aria-haspopup": "listbox",
						"aria-expanded": isOpen ? "true" : "false",
						"aria-controls": listboxId,
						"aria-activedescendant": isOpen && activeValue !== null ? optionId(activeValue) : void 0,
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						onChange: handleInputChange,
						onClick: handleInputClick,
						onKeyDown: handleKeyDown,
						onBlur: handleInputBlur
					}),
					showClear ? /* @__PURE__ */ jsx("span", {
						className: "ds-combobox__control",
						"data-part": "clearButton",
						onClick: handleClear,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							iconOnly: true,
							label: COPY$14.clearLabel,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "close",
								inline: true,
								overrides: { color: "color.foreground.muted" }
							})
						})
					}) : null,
					/* @__PURE__ */ jsx("span", {
						className: "ds-combobox__control",
						"data-part": "toggleButton",
						onClick: handleToggle,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							iconOnly: true,
							label: COPY$14.toggleLabel,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "chevron-down",
								inline: true,
								overrides: { color: "color.foreground.muted" }
							}),
							disabled: isDisabled,
							tabIndex: -1
						})
					})
				]
			}),
			resolvedError !== void 0 ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				size: "sm",
				tone: "danger",
				"data-part": "errorMessage",
				overrides: resolved.helper,
				children: resolvedError
			}) : null,
			/* @__PURE__ */ jsx("div", {
				role: "status",
				"aria-live": "polite",
				className: "ds-combobox__status",
				"data-part": "status",
				children: statusText
			}),
			selectedValues.map((hiddenValue) => /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: hiddenValue,
				disabled: isDisabled
			}, hiddenValue)),
			isOpen && typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsx("div", {
				ref: popupRef,
				className: "ds-combobox__popup",
				"data-part": "popup",
				"data-vertical": position?.vertical ?? "bottom",
				style: popupStyle,
				onMouseDown: (event) => event.preventDefault(),
				onClick: handlePopupClick,
				children: /* @__PURE__ */ jsx(Listbox, {
					ref: listboxRef,
					id: listboxId,
					label,
					labelledBy: labelId,
					options: listOptions,
					multiple,
					value: multiple ? selectedValues : singleValue,
					selectionFollowsFocus: false,
					embedded: true,
					loading: isLoading,
					disabled: isDisabled,
					emptyMessage: COPY$14.empty,
					initialActiveValue: requestedActive,
					onChange: handleListboxChange,
					onActiveChange: setActiveValue
				}, activeRequest.generation)
			}), container ?? document.body) : null
		]
	});
}
//#endregion
//#region src/Accordion.tsx
const isDev$10 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** An empty array or an empty string means nothing is open. */
function toIdArray(value) {
	if (value === void 0) return void 0;
	if (Array.isArray(value)) return value;
	return value === "" ? [] : [value];
}
/** Under `exclusive` only the first id opens; the rest are reported by a development warning. */
function limitExclusive(ids, exclusive) {
	return exclusive && ids.length > 1 ? ids.slice(0, 1) : ids;
}
function sameSet(a, b) {
	return a.length === b.length && a.every((id) => b.includes(id));
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
function Accordion({ ref, items, headingLevel = "3", exclusive = false, value, defaultValue, divided = true, keepMounted = false, overrides, onChange, onOpenChange, onKeyDown, ...rest }) {
	const triggerRefs = useRef(/* @__PURE__ */ new Map());
	const setTriggerRef = (id) => (el) => {
		if (el) triggerRefs.current.set(id, el);
		else triggerRefs.current.delete(id);
	};
	const isControlled = value !== void 0;
	const [internalOpenIds, setInternalOpenIds] = useState(() => limitExclusive(toIdArray(defaultValue) ?? [], exclusive));
	if (!isControlled && exclusive && internalOpenIds.length > 1) setInternalOpenIds(internalOpenIds.slice(0, 1));
	const openIds = limitExclusive(isControlled ? toIdArray(value) ?? [] : internalOpenIds, exclusive);
	const valueKey = isControlled ? JSON.stringify(toIdArray(value) ?? []) : null;
	const requestedIds = toIdArray(isControlled ? value : defaultValue) ?? [];
	const warnedRef = useRef(null);
	useEffect(() => {
		if (!isDev$10 || !exclusive || requestedIds.length <= 1) return;
		const key = requestedIds.join(" ");
		if (warnedRef.current === key) return;
		warnedRef.current = key;
		console.warn(`Accordion: \`exclusive\` opens one section, but \`${isControlled ? "value" : "defaultValue"}\` has ${requestedIds.length} ids. Opening "${requestedIds[0]}"; ignoring ${requestedIds.slice(1).join(", ")}.`);
	});
	const previousRef = useRef({
		valueKey,
		openIds
	});
	const lastEmittedRef = useRef(null);
	useEffect(() => {
		const previous = previousRef.current;
		previousRef.current = {
			valueKey,
			openIds
		};
		if (!isControlled) {
			lastEmittedRef.current = null;
			return;
		}
		if (previous.valueKey === valueKey) return;
		const emitted = lastEmittedRef.current;
		lastEmittedRef.current = null;
		if (emitted !== null && sameSet(emitted, openIds)) return;
		for (const item of items) {
			const was = previous.openIds.includes(item.id);
			const is = openIds.includes(item.id);
			if (was !== is) onOpenChange?.(item.id, is, "controlled");
		}
	});
	const handleToggle = (id, open, toggleReason) => {
		if (toggleReason === "controlled") return;
		const previous = openIds;
		const next = open ? exclusive ? [id] : previous.includes(id) ? previous : [...previous, id] : previous.filter((openId) => openId !== id);
		const reason = toggleReason === "keyboard" ? "keyboard" : "trigger";
		if (isControlled) lastEmittedRef.current = next;
		else setInternalOpenIds(next);
		onChange?.(next);
		onOpenChange?.(id, open, reason);
		if (open && exclusive) {
			for (const item of items) if (item.id !== id && previous.includes(item.id)) onOpenChange?.(item.id, false, "exclusive");
		}
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented) return;
		const { key } = event;
		if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
		const current = items.findIndex((item) => triggerRefs.current.get(item.id) === event.target);
		if (current === -1) return;
		const count = items.length;
		const step = (from, delta) => {
			let index = from;
			for (let i = 0; i < count; i += 1) {
				index = (index + delta + count) % count;
				if (!items[index].disabled) return index;
			}
			return -1;
		};
		let next = -1;
		if (key === "ArrowDown") next = step(current, 1);
		else if (key === "ArrowUp") next = step(current, -1);
		else if (key === "Home") next = step(count - 1, 1);
		else next = step(0, -1);
		if (next === -1) return;
		event.preventDefault();
		triggerRefs.current.get(items[next].id)?.focus();
	};
	const disclosureOverrides = {
		triggerPaddingBlock: overrides?.triggerPaddingBlock ?? "space.md",
		triggerFontFamily: overrides?.fontFamily ?? "font.family.body",
		triggerFontSize: overrides?.triggerFontSize ?? "font.size.md",
		triggerFontWeight: overrides?.triggerFontWeight ?? "font.weight.medium"
	};
	const dividerOverrides = {
		color: overrides?.divider ?? "color.border",
		thickness: overrides?.dividerWidth ?? "border.width.thin"
	};
	const rootStyle = overrides?.itemGap ? { "--ds-accordion-item-gap": cssVar(overrides.itemGap) } : void 0;
	const children = [];
	items.forEach((item, index) => {
		if (divided && index > 0) children.push(/* @__PURE__ */ jsx(Divider, { overrides: dividerOverrides }, `divider-${item.id}`));
		children.push(/* @__PURE__ */ jsx(Disclosure, {
			ref: setTriggerRef(item.id),
			summary: item.summary,
			headingLevel,
			open: openIds.includes(item.id),
			disabled: item.disabled,
			keepMounted,
			overrides: disclosureOverrides,
			onToggle: (open, reason) => handleToggle(item.id, open, reason),
			children: item.content
		}, item.id));
	});
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		"data-ds": "Accordion",
		"data-part": "list",
		className: "ds-accordion",
		style: rootStyle,
		onKeyDown: handleKeyDown,
		children
	});
}
//#endregion
//#region src/Slider.tsx
/** copy.* — used verbatim; `{label}`, `{low}` and `{high}` are the only interpolations. */
const COPY$13 = {
	minimumLabel: "{label} minimum",
	maximumLabel: "{label} maximum",
	rangeText: "{low} – {high}",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	pageUpAction: "Increase by a page",
	pageDownAction: "Decrease by a page",
	homeAction: "Set to minimum",
	endAction: "Set to maximum"
};
/** Hooks the Slider's own CSS reads. Bindings that style a composed Text are forwarded to it instead. */
const ROOT_OVERRIDE_HOOK$3 = {
	track: "--ds-slider-track",
	trackHeight: "--ds-slider-track-height",
	trackRadius: "--ds-slider-track-radius",
	thumb: "--ds-slider-thumb",
	thumbSize: "--ds-slider-thumb-size",
	thumbShadow: "--ds-slider-thumb-shadow",
	thumbActiveScale: "--ds-slider-thumb-active-scale",
	haloSpread: "--ds-slider-halo-spread",
	mark: "--ds-slider-mark",
	markSize: "--ds-slider-mark-size",
	markLabelGap: "--ds-slider-mark-label-gap",
	bubblePaddingBlock: "--ds-slider-bubble-padding-block",
	bubblePaddingInline: "--ds-slider-bubble-padding-inline",
	bubbleOffset: "--ds-slider-bubble-offset",
	bubbleRadius: "--ds-slider-bubble-radius",
	partGap: "--ds-slider-part-gap",
	labelGap: "--ds-slider-label-gap",
	trackPaddingBlock: "--ds-slider-track-padding-block",
	disabledOpacity: "--ds-slider-disabled-opacity",
	transition: "--ds-slider-transition"
};
function resolveOverrides$5(overrides) {
	if (!overrides) return {
		rootStyle: void 0,
		label: void 0,
		value: void 0,
		markLabel: void 0,
		helper: void 0
	};
	const rootStyle = {};
	const label = {};
	const value = {};
	const markLabel = {};
	const helper = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$3[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		switch (binding) {
			case "fontFamily":
				label.fontFamily = ref;
				value.fontFamily = ref;
				markLabel.fontFamily = ref;
				helper.fontFamily = ref;
				break;
			case "fontSize":
				label.fontSize = ref;
				break;
			case "labelWeight":
				label.fontWeight = ref;
				break;
			case "valueSize":
				value.fontSize = ref;
				break;
			case "markLabelSize":
				markLabel.fontSize = ref;
				break;
			case "helperSize": helper.fontSize = ref;
		}
	}
	return {
		rootStyle,
		label,
		value,
		markLabel,
		helper
	};
}
const isDev$9 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function decimalsOf(n) {
	const text = String(n);
	const dot = text.indexOf(".");
	return dot === -1 ? 0 : text.length - dot - 1;
}
function sameValue$1(a, b) {
	if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
	return a === b;
}
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
/**
* Slider — a bounded numeric value, or a range, chosen by dragging a thumb or with the keyboard.
*
* When to use:
* Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.
*/
function Slider({ ref, label, name, min = 0, max = 100, step = 1, snapToMarks = false, required = false, invalid = false, value, defaultValue, range = false, formatValue, showValue = "always", marks, disabled = false, description, error, overrides, onChange, onChangeEnd, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const controlId = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-slider${generatedId}`);
	const labelId = `${controlId}-label`;
	const descriptionId = `${controlId}-description`;
	const errorId = `${controlId}-error`;
	const validBounds = max > min;
	useEffect(() => {
		if (isDev$9 && !validBounds) console.warn(`Slider: \`max\` (${max}) must be greater than \`min\` (${min}).`);
	}, [
		validBounds,
		min,
		max
	]);
	function normalize(candidate) {
		if (range) {
			if (!Array.isArray(candidate)) return [min, max];
			const lo = clamp(candidate[0], min, max);
			return [lo, clamp(Math.max(candidate[1], lo), min, max)];
		}
		if (typeof candidate !== "number") return min;
		return clamp(candidate, min, max);
	}
	const fallback = normalize(defaultValue);
	const [internalValue, setInternalValue] = useState(fallback);
	const current = normalize(value !== void 0 ? value : internalValue);
	const latestValue = useRef(current);
	latestValue.current = current;
	const isDisabled = disabled || (form?.disabled ?? false);
	const errorMessage = error ?? form?.errors[name] ?? (invalid ? COPY$13.invalid.replace("{label}", label) : void 0);
	const isInvalid = invalid || errorMessage !== void 0;
	const validateMode = form ? form.validateMode ?? form.validate : void 0;
	const afterFailedSubmit = form?.submitFailed ?? false;
	const validatesOnChange = validateMode === "change" || afterFailedSubmit;
	const validatesOnInteractionEnd = validateMode === "blur" || validateMode === "change" || afterFailedSubmit;
	const trackRef = useRef(null);
	const thumbRefs = useRef({
		single: null,
		min: null,
		max: null
	});
	const [activeKey, setActiveKey] = useState(null);
	const [focusedKey, setFocusedKey] = useState(null);
	const dragIndex = useRef(void 0);
	const changedInInteraction = useRef(false);
	const format = formatValue ?? ((v) => String(v));
	const latest = useRef({
		label,
		required,
		invalid,
		error,
		fallback,
		disabled: isDisabled,
		range
	});
	latest.current = {
		label,
		required,
		invalid,
		error,
		fallback,
		disabled: isDisabled,
		range
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id: controlId,
			get label() {
				return latest.current.label;
			},
			getValue: () => {
				const v = latestValue.current;
				return Array.isArray(v) ? [String(v[0]), String(v[1])] : String(v);
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const l = latest.current;
				if (l.error !== void 0) return l.error;
				if (l.required && sameValue$1(latestValue.current, l.fallback)) return COPY$13.required.replace("{label}", l.label);
				if (l.invalid) return COPY$13.invalid.replace("{label}", l.label);
				return null;
			},
			focus: () => (latest.current.range ? thumbRefs.current.min : thumbRefs.current.single)?.focus()
		});
	}, [
		form,
		name,
		controlId
	]);
	const precision = Math.max(decimalsOf(step), decimalsOf(min));
	function snapToStep(raw) {
		const clamped = clamp(raw, min, max);
		if (!(step > 0)) return clamped;
		const snapped = min + Math.round((clamped - min) / step) * step;
		return clamp(Number(snapped.toFixed(precision)), min, max);
	}
	const markValues = (marks ?? []).map((m) => m.value).sort((a, b) => a - b);
	const marksSnap = snapToMarks && markValues.length > 0;
	function snapToNearestMark(raw) {
		let nearest = markValues[0];
		if (nearest === void 0) return snapToStep(raw);
		for (const candidate of markValues) if (Math.abs(raw - candidate) < Math.abs(raw - nearest)) nearest = candidate;
		return nearest;
	}
	const snapPointer = (raw) => marksSnap ? snapToNearestMark(raw) : snapToStep(raw);
	function pageFrom(from, direction) {
		if (!marksSnap) return snapToStep(from + direction * step * 10);
		if (direction === 1) return markValues.find((v) => v > from) ?? max;
		return [...markValues].reverse().find((v) => v < from) ?? min;
	}
	const [low, high] = Array.isArray(current) ? current : [min, max];
	const single = typeof current === "number" ? current : min;
	function commit(index, next) {
		const prev = latestValue.current;
		let nextValue;
		if (index === null) nextValue = clamp(next, min, max);
		else {
			const [pLow, pHigh] = Array.isArray(prev) ? prev : [min, max];
			nextValue = index === 0 ? [clamp(Math.min(next, pHigh), min, max), pHigh] : [pLow, clamp(Math.max(next, pLow), min, max)];
		}
		if (sameValue$1(prev, nextValue)) return;
		latestValue.current = nextValue;
		changedInInteraction.current = true;
		if (value === void 0) setInternalValue(nextValue);
		onChange?.(nextValue);
		if (form && validatesOnChange) form.validateField(name);
	}
	function endInteraction() {
		if (!changedInInteraction.current) return;
		changedInInteraction.current = false;
		onChangeEnd?.(latestValue.current);
		if (form && validatesOnInteractionEnd) form.validateField(name);
	}
	const percent = (v) => validBounds ? (clamp(v, min, max) - min) / (max - min) * 100 : 0;
	const isRtl = (el) => typeof getComputedStyle === "function" && getComputedStyle(el).direction === "rtl";
	/** Pointer math is logical: the ratio is mirrored in a right-to-left layout. */
	function valueAt(clientX) {
		const track = trackRef.current;
		if (!track) return min;
		const rect = track.getBoundingClientRect();
		const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
		const logical = isRtl(track) ? 1 - ratio : ratio;
		return min + clamp(logical, 0, 1) * (max - min);
	}
	const keyFor = (index) => index === null ? "single" : index === 0 ? "min" : "max";
	const handlePointerDown = (event) => {
		if (isDisabled || event.button !== 0) return;
		event.preventDefault();
		const raw = valueAt(event.clientX);
		const index = range ? raw > high || raw > low && raw - low > high - raw ? 1 : 0 : null;
		dragIndex.current = index;
		changedInInteraction.current = false;
		setActiveKey(keyFor(index));
		commit(index, snapPointer(raw));
		const target = event.currentTarget;
		if (typeof target.setPointerCapture === "function") target.setPointerCapture(event.pointerId);
		thumbRefs.current[keyFor(index)]?.focus();
	};
	const handlePointerMove = (event) => {
		if (dragIndex.current === void 0) return;
		commit(dragIndex.current, snapPointer(valueAt(event.clientX)));
	};
	const handlePointerUp = (event) => {
		if (dragIndex.current === void 0) return;
		dragIndex.current = void 0;
		setActiveKey(null);
		const target = event.currentTarget;
		if (typeof target.hasPointerCapture === "function" && target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		endInteraction();
	};
	const handleKeyDown = (thumb) => (event) => {
		if (isDisabled) return;
		const rtl = isRtl(event.currentTarget);
		let next;
		switch (event.key) {
			case "ArrowRight":
				next = snapToStep(thumb.value + (rtl ? -step : step));
				break;
			case "ArrowLeft":
				next = snapToStep(thumb.value + (rtl ? step : -step));
				break;
			case "ArrowUp":
				next = snapToStep(thumb.value + step);
				break;
			case "ArrowDown":
				next = snapToStep(thumb.value - step);
				break;
			case "PageUp":
				next = pageFrom(thumb.value, 1);
				break;
			case "PageDown":
				next = pageFrom(thumb.value, -1);
				break;
			case "Home":
				next = thumb.ariaMin;
				break;
			case "End":
				next = thumb.ariaMax;
				break;
			default: return;
		}
		event.preventDefault();
		commit(thumb.index, next);
	};
	const thumbs = range ? [{
		key: "min",
		index: 0,
		value: low,
		ariaMin: min,
		ariaMax: high
	}, {
		key: "max",
		index: 1,
		value: high,
		ariaMin: low,
		ariaMax: max
	}] : [{
		key: "single",
		index: null,
		value: single,
		ariaMin: min,
		ariaMax: max
	}];
	const fillStart = range ? percent(low) : 0;
	const fillEnd = range ? percent(high) : percent(single);
	const describedBy = [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(" ") || void 0;
	const resolved = resolveOverrides$5(overrides);
	const markList = marks ?? [];
	const labelledMarks = markList.some((m) => m.label);
	const classes = [
		"ds-slider",
		isDisabled ? "ds-slider--disabled" : null,
		isInvalid ? "ds-slider--invalid" : null
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Slider",
		"data-ds-field": true,
		"aria-disabled": isDisabled ? "true" : void 0,
		className: classes,
		style: resolved.rootStyle,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-slider__header",
				children: [/* @__PURE__ */ jsx(Text, {
					element: "span",
					id: labelId,
					"data-part": "label",
					size: "md",
					weight: "medium",
					tone: "default",
					overrides: resolved.label,
					children: label
				}), showValue === "always" ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					"data-part": "valueText",
					size: "sm",
					tone: "default",
					overrides: resolved.value,
					children: range ? COPY$13.rangeText.replace("{low}", format(low)).replace("{high}", format(high)) : format(single)
				}) : null]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ds-slider__control",
				children: [/* @__PURE__ */ jsx("div", {
					className: "ds-slider__area",
					onPointerDown: handlePointerDown,
					onPointerMove: handlePointerMove,
					onPointerUp: handlePointerUp,
					onPointerCancel: handlePointerUp,
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-slider__rail",
						children: [
							/* @__PURE__ */ jsx("div", {
								ref: trackRef,
								className: "ds-slider__track",
								"data-part": "track",
								children: /* @__PURE__ */ jsx("div", {
									className: "ds-slider__fill",
									"data-part": "fill",
									style: {
										insetInlineStart: `${fillStart}%`,
										inlineSize: `${fillEnd - fillStart}%`
									}
								})
							}),
							markList.length > 0 ? /* @__PURE__ */ jsx("div", {
								className: "ds-slider__tick-marks",
								"data-part": "tickMarks",
								"aria-hidden": "true",
								children: markList.map((mark) => /* @__PURE__ */ jsx("span", {
									className: "ds-slider__mark",
									style: { insetInlineStart: `${percent(mark.value)}%` }
								}, `dot-${mark.value}`))
							}) : null,
							thumbs.map((thumb) => {
								const bubbleVisible = activeKey === thumb.key || focusedKey === thumb.key;
								return /* @__PURE__ */ jsxs("div", {
									ref: (el) => {
										thumbRefs.current[thumb.key] = el;
									},
									id: thumb.index === 1 ? void 0 : controlId,
									role: "slider",
									tabIndex: 0,
									"data-part": "thumb",
									className: ["ds-slider__thumb", activeKey === thumb.key ? "ds-slider__thumb--active" : null].filter(Boolean).join(" "),
									style: { insetInlineStart: `${percent(thumb.value)}%` },
									"aria-valuenow": thumb.value,
									"aria-valuemin": thumb.ariaMin,
									"aria-valuemax": thumb.ariaMax,
									"aria-valuetext": format(thumb.value),
									"aria-labelledby": thumb.index === null ? labelId : void 0,
									"aria-label": thumb.index === 0 ? COPY$13.minimumLabel.replace("{label}", label) : thumb.index === 1 ? COPY$13.maximumLabel.replace("{label}", label) : void 0,
									"aria-describedby": describedBy,
									"aria-orientation": "horizontal",
									"aria-disabled": isDisabled ? "true" : void 0,
									"aria-invalid": isInvalid ? "true" : void 0,
									"aria-required": required ? "true" : void 0,
									onKeyDown: handleKeyDown(thumb),
									onKeyUp: endInteraction,
									onFocus: () => setFocusedKey(thumb.key),
									onBlur: () => setFocusedKey(null),
									children: [/* @__PURE__ */ jsx("span", {
										className: "ds-slider__knob",
										"aria-hidden": "true"
									}), showValue === "hover" ? /* @__PURE__ */ jsx("span", {
										className: ["ds-slider__bubble", bubbleVisible ? "ds-slider__bubble--visible" : null].filter(Boolean).join(" "),
										"data-part": "bubble",
										"aria-hidden": "true",
										children: /* @__PURE__ */ jsx(Text, {
											element: "span",
											size: "sm",
											tone: "default",
											overrides: resolved.value,
											children: format(thumb.value)
										})
									}) : null]
								}, thumb.key);
							})
						]
					})
				}), labelledMarks ? /* @__PURE__ */ jsx("div", {
					className: "ds-slider__mark-labels",
					"aria-hidden": "true",
					children: markList.map((mark) => mark.label ? /* @__PURE__ */ jsx("span", {
						className: "ds-slider__mark-label",
						style: { insetInlineStart: `${percent(mark.value)}%` },
						children: /* @__PURE__ */ jsx(Text, {
							element: "span",
							size: "xs",
							tone: "muted",
							overrides: resolved.markLabel,
							children: mark.label
						})
					}, `label-${mark.value}`) : null)
				}) : null]
			}),
			range ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(low),
				disabled: isDisabled
			}), /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(high),
				disabled: isDisabled
			})] }) : /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(single),
				disabled: isDisabled
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "span",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				overrides: resolved.helper,
				children: description
			}) : null,
			errorMessage ? /* @__PURE__ */ jsx("div", {
				role: "alert",
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					id: errorId,
					"data-part": "errorMessage",
					size: "sm",
					tone: "danger",
					overrides: resolved.helper,
					children: errorMessage
				})
			}) : null
		]
	});
}
//#endregion
//#region src/NumberInput.tsx
/** copy.* — used verbatim; `{label}`, `{min}` and `{max}` are the only interpolations. */
const COPY$12 = {
	increment: "Increase",
	decrement: "Decrease",
	required: "{label} is required.",
	invalid: "{label} must be a number.",
	outOfRange: "{label} must be between {min} and {max}.",
	outOfRangeMin: "{label} must be {min} or more.",
	outOfRangeMax: "{label} must be {max} or less.",
	currencyMissing: "format \"currency\" needs a currency code.",
	requiredIndicator: " (required)"
};
const isDev$8 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Hooks on the root. `helperSize` has none: it is forwarded to the description and error Text
* elements' `fontSize`. `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept
* here for the label and the `<input>`, which are not Text. */
const ROOT_OVERRIDE_HOOK$2 = {
	borderInvalid: "--ds-number-input-border-invalid",
	borderWidth: "--ds-number-input-border-width",
	radius: "--ds-number-input-radius",
	paddingInline: "--ds-number-input-padding-inline",
	paddingBlock: "--ds-number-input-padding-block",
	affixGap: "--ds-number-input-affix-gap",
	stepperGap: "--ds-number-input-stepper-gap",
	stepperDivider: "--ds-number-input-stepper-divider",
	stepperDividerWidth: "--ds-number-input-stepper-divider-width",
	partGap: "--ds-number-input-part-gap",
	labelWeight: "--ds-number-input-label-weight",
	fontFamily: "--ds-number-input-font-family",
	fontSize: "--ds-number-input-font-size",
	lineHeight: "--ds-number-input-line-height",
	disabledOpacity: "--ds-number-input-disabled-opacity"
};
function resolveOverrides$4(overrides) {
	const rootStyle = {};
	const helperOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "lineHeight") helperOverrides.lineHeight = ref;
		const hook = ROOT_OVERRIDE_HOOK$2[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		helperOverrides
	};
}
/** The environment locale's decimal and group separators. */
function localeSeparators() {
	if (typeof Intl === "undefined") return {
		decimal: ".",
		group: ","
	};
	const parts = new Intl.NumberFormat().formatToParts(12345.6);
	return {
		decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
		group: parts.find((p) => p.type === "group")?.value ?? ","
	};
}
/** Decimal places in `step` (`0.01` → 2), the default `precision`. */
function decimalsInStep(step) {
	if (!Number.isFinite(step)) return 0;
	const str = String(step);
	const exp = /e-(\d+)$/.exec(str);
	if (exp) return Number(exp[1]);
	const dot = str.indexOf(".");
	return dot === -1 ? 0 : str.length - dot - 1;
}
function roundTo(num, digits) {
	const factor = 10 ** digits;
	return Math.round(num * factor) / factor;
}
/**
* Lenient parse of what people type or what the field displays: group separators and any other
* character (currency symbol, percent sign, unit) are ignored; a leading minus and the locale's or
* a period decimal separator are kept. Text with no digits at all is `invalid`.
*/
function parseTyped$1(raw) {
	const trimmed = raw.trim();
	if (trimmed === "") return { kind: "empty" };
	const { decimal } = localeSeparators();
	const periodIsDecimal = decimal === "." || !trimmed.includes(decimal);
	let digits = "";
	let negative = false;
	let seenDecimal = false;
	for (const ch of trimmed) if (ch >= "0" && ch <= "9") digits += ch;
	else if (ch === "-" && digits === "" && !seenDecimal) negative = true;
	else if ((ch === decimal || ch === "." && periodIsDecimal) && !seenDecimal) {
		seenDecimal = true;
		digits += ".";
	}
	if (!/\d/.test(digits)) return { kind: "invalid" };
	const num = Number(`${negative ? "-" : ""}${digits.startsWith(".") ? `0${digits}` : digits}`);
	return Number.isFinite(num) ? {
		kind: "number",
		value: num
	} : { kind: "invalid" };
}
/** Whether Intl knows `unit` as a unit identifier. */
function isIntlUnit(unit) {
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
function formatNumber(num, format, fractionDigits, currency, unit) {
	const base = {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	};
	if (format === "currency") return new Intl.NumberFormat(void 0, {
		...base,
		style: "currency",
		currency: currency || "USD"
	}).format(num);
	if (format === "percent") return new Intl.NumberFormat(void 0, {
		...base,
		style: "percent"
	}).format(num / 100);
	if (format === "unit" && unit && isIntlUnit(unit)) return new Intl.NumberFormat(void 0, {
		...base,
		style: "unit",
		unit
	}).format(num);
	return new Intl.NumberFormat(void 0, base).format(num);
}
/** A resolved CSS time (`200ms`, `0.2s`) in ms; `null` when it cannot be read. */
function parseTime$1(value) {
	const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
	if (!match) return null;
	const amount = Number(match[1]);
	return match[2] === "s" ? amount * 1e3 : amount;
}
/** Hold-to-repeat timings from the resolved theme: `motion.duration.base` delay, `motion.duration.fast`
* interval. `null` when the theme's tokens are not loaded, in which case a press steps once. */
function resolveRepeatTimings(el) {
	const style = getComputedStyle(el);
	const delay = parseTime$1(style.getPropertyValue("--motion-duration-base"));
	const interval = parseTime$1(style.getPropertyValue("--motion-duration-fast"));
	return delay !== null && interval !== null && delay > 0 && interval > 0 ? {
		delay,
		interval
	} : null;
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
function NumberInput({ ref, label, name, value, defaultValue, min, max, step = 1, precision, format = "decimal", currency, unit, leadingText, trailingText, hideSteppers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, onChange, readOnly, onKeyDown, onBlur, id: idProp, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-number-input${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const digits = Math.max(0, Math.trunc(precision ?? decimalsInStep(step)));
	const unitKnown = format === "unit" && unit !== void 0 && unit !== "" && isIntlUnit(unit);
	const resolvedTrailing = trailingText ?? (format === "unit" && unit && !unitKnown ? unit : void 0);
	const resolvedLeading = format === "currency" ? void 0 : leadingText;
	const display = (num) => num === void 0 ? "" : formatNumber(num, format, digits, currency, unit);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const committedValue = isControlled ? value ?? void 0 : internalValue;
	const [text, setText] = useState(() => display(committedValue));
	const [textInvalid, setTextInvalid] = useState(false);
	const [rangeMessage, setRangeMessage] = useState(void 0);
	const isDisabled = disabled || (form?.disabled ?? false);
	/** The shown number, advanced synchronously by `report` so steps and Form submission within the
	* same event see it; a controlled field is re-synced to its prop on every render. */
	const valueRef = useRef(committedValue);
	valueRef.current = committedValue;
	/** Set while the text on screen is what the user typed, so the echo of that number does not reformat it. */
	const typingRef = useRef(false);
	const formatKey = `${format}|${digits}|${currency ?? ""}|${unit ?? ""}`;
	const lastSynced = useRef({
		value: committedValue,
		formatKey
	});
	useEffect(() => {
		const prev = lastSynced.current;
		if (Object.is(prev.value, committedValue) && prev.formatKey === formatKey) return;
		lastSynced.current = {
			value: committedValue,
			formatKey
		};
		if (typingRef.current && prev.formatKey === formatKey) {
			const typed = parseTyped$1(inputRef.current?.value ?? "");
			if (Object.is(typed.kind === "number" ? typed.value : void 0, committedValue)) return;
		}
		typingRef.current = false;
		setText(committedValue === void 0 ? "" : formatNumber(committedValue, format, digits, currency, unit));
		setTextInvalid(false);
	}, [committedValue, formatKey]);
	const warnedCurrency = useRef(false);
	useEffect(() => {
		if (isDev$8 && format === "currency" && !currency && !warnedCurrency.current) {
			warnedCurrency.current = true;
			console.warn(`NumberInput: ${COPY$12.currencyMissing}`);
		}
	}, [format, currency]);
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		invalid,
		error,
		textInvalid,
		rangeMessage
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		invalid,
		error,
		textInvalid,
		rangeMessage
	};
	/** The full precedence: `error` → required (empty) → invalid / non-numeric committed text → range. */
	const validationMessage = () => {
		const current = latest.current;
		if (current.error !== void 0 && current.error !== "") return current.error;
		if (current.required && valueRef.current === void 0 && !current.textInvalid) return COPY$12.required.replace("{label}", current.label);
		if (current.invalid || current.textInvalid) return COPY$12.invalid.replace("{label}", current.label);
		if (current.rangeMessage) return current.rangeMessage;
		return null;
	};
	const validationRef = useRef(validationMessage);
	validationRef.current = validationMessage;
	useEffect(() => {
		const el = inputRef.current;
		if (!el) return;
		const message = isDisabled ? "" : validationRef.current() ?? "";
		if (el.validationMessage !== message) el.setCustomValidity(message);
	});
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.disabled || valueRef.current === void 0 ? void 0 : String(valueRef.current),
			isDisabled: () => latest.current.disabled,
			validate: () => validationRef.current(),
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const validateMode = form ? form.validateMode ?? form.validate : void 0;
	const afterFailedSubmit = form?.submitFailed ?? false;
	const validatesOnChange = validateMode === "change" || afterFailedSubmit;
	const validatesOnBlur = validateMode === "blur" || validateMode === "change" || afterFailedSubmit;
	function report(next) {
		if (Object.is(next, valueRef.current)) return;
		if (!isControlled) {
			valueRef.current = next;
			setInternalValue(next);
		}
		onChange?.(next);
		if (form && validatesOnChange) form.validateField(name);
	}
	function clamp(num) {
		let next = num;
		if (min !== void 0 && next < min) next = min;
		if (max !== void 0 && next > max) next = max;
		return next;
	}
	function stepBy(delta) {
		if (isDisabled || readOnly) return;
		const current = valueRef.current;
		const target = current === void 0 ? delta > 0 ? min ?? 0 : max ?? 0 : current + delta;
		typingRef.current = false;
		setTextInvalid(false);
		setRangeMessage(void 0);
		report(clamp(roundTo(target, digits)));
	}
	function setTo(target) {
		if (isDisabled || readOnly) return;
		typingRef.current = false;
		setTextInvalid(false);
		setRangeMessage(void 0);
		report(roundTo(target, digits));
	}
	/** Blur and Enter: round to precision, clamp, reformat, and report a clamp rather than hide it. */
	function commit() {
		typingRef.current = false;
		const parsed = parseTyped$1(inputRef.current?.value ?? text);
		if (parsed.kind !== "number") {
			setTextInvalid(parsed.kind === "invalid");
			setRangeMessage(void 0);
			report(void 0);
			if (parsed.kind === "empty") setText("");
			return;
		}
		const rounded = roundTo(parsed.value, digits);
		const next = clamp(rounded);
		setTextInvalid(false);
		setRangeMessage(next !== rounded ? rangeCopy() : void 0);
		report(next);
		setText(display(isControlled ? value ?? void 0 : next));
	}
	function rangeCopy() {
		const withLabel = (s) => s.replace("{label}", label);
		if (min !== void 0 && max !== void 0) return withLabel(COPY$12.outOfRange).replace("{min}", display(min)).replace("{max}", display(max));
		if (min !== void 0) return withLabel(COPY$12.outOfRangeMin).replace("{min}", display(min));
		return withLabel(COPY$12.outOfRangeMax).replace("{max}", display(max));
	}
	const handleChange = (event) => {
		if (isDisabled || readOnly) {
			event.preventDefault();
			return;
		}
		const raw = event.target.value;
		typingRef.current = true;
		setText(raw);
		setRangeMessage(void 0);
		const parsed = parseTyped$1(raw);
		if (parsed.kind === "invalid") return;
		setTextInvalid(false);
		report(parsed.kind === "number" ? parsed.value : void 0);
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || isDisabled || readOnly) return;
		switch (event.key) {
			case "ArrowUp":
				event.preventDefault();
				stepBy(step);
				break;
			case "ArrowDown":
				event.preventDefault();
				stepBy(-step);
				break;
			case "PageUp":
				event.preventDefault();
				stepBy(step * 10);
				break;
			case "PageDown":
				event.preventDefault();
				stepBy(-step * 10);
				break;
			case "Home":
				if (min !== void 0) {
					event.preventDefault();
					setTo(min);
				}
				break;
			case "End":
				if (max !== void 0) {
					event.preventDefault();
					setTo(max);
				}
				break;
			case "Enter": commit();
		}
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (!isDisabled && !readOnly) commit();
		if (form && validatesOnBlur) form.validateField(name);
	};
	const repeatTimer = useRef(null);
	const pointerStepped = useRef(false);
	function stopRepeat() {
		if (repeatTimer.current !== null) {
			window.clearTimeout(repeatTimer.current);
			repeatTimer.current = null;
		}
	}
	/** A press that ends without a click (the pointer left the button) must not swallow the next one. */
	function endPointerStep() {
		stopRepeat();
		pointerStepped.current = false;
	}
	useEffect(() => stopRepeat, []);
	const atMin = min !== void 0 && committedValue !== void 0 && committedValue <= min;
	const atMax = max !== void 0 && committedValue !== void 0 && committedValue >= max;
	function stepperPointerDown(event, direction) {
		event.preventDefault();
		stopRepeat();
		pointerStepped.current = true;
		if (isDisabled || readOnly || (direction > 0 ? atMax : atMin)) return;
		stepBy(direction * step);
		const timings = resolveRepeatTimings(event.currentTarget);
		if (!timings) return;
		const tick = () => {
			const current = valueRef.current;
			if (current !== void 0 && (direction > 0 && max !== void 0 && current >= max || direction < 0 && min !== void 0 && current <= min)) {
				stopRepeat();
				return;
			}
			stepBy(direction * step);
			repeatTimer.current = window.setTimeout(tick, timings.interval);
		};
		repeatTimer.current = window.setTimeout(tick, timings.delay);
	}
	function stepperClick(event, direction) {
		event.preventDefault();
		if (pointerStepped.current) {
			pointerStepped.current = false;
			return;
		}
		if (isDisabled || readOnly || (direction > 0 ? atMax : atMin)) return;
		stepBy(direction * step);
	}
	const withLabel = (message) => message.replace("{label}", label);
	const formError = form?.errors[name];
	const slotMessage = error !== void 0 && error !== "" ? error : formError !== void 0 && formError !== "" ? formError : invalid || formError !== void 0 ? withLabel(required && committedValue === void 0 && !textInvalid ? COPY$12.required : COPY$12.invalid) : textInvalid ? withLabel(COPY$12.invalid) : rangeMessage;
	const isInvalid = slotMessage !== void 0;
	const describedBy = [description ? descriptionId : null, isInvalid ? errorId : null].filter(Boolean).join(" ");
	const valueText = committedValue === void 0 ? void 0 : `${resolvedLeading ?? ""}${display(committedValue)}${resolvedTrailing ? ` ${resolvedTrailing}` : ""}`;
	const classes = [
		"ds-number-input",
		`ds-number-input--${size}`,
		isInvalid ? "ds-number-input--invalid" : null,
		isDisabled ? "ds-number-input--disabled" : null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-number-input__label", hideLabel ? "ds-number-input__visually-hidden" : null].filter(Boolean).join(" ");
	const { rootStyle, helperOverrides } = overrides ? resolveOverrides$4(overrides) : {
		rootStyle: void 0,
		helperOverrides: void 0
	};
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "NumberInput",
		"data-ds-field": true,
		style: rootStyle,
		children: [
			/* @__PURE__ */ jsxs("label", {
				className: labelClasses,
				htmlFor: id,
				"data-part": "label",
				children: [label, required ? COPY$12.requiredIndicator : null]
			}),
			description ? /* @__PURE__ */ jsx("div", {
				className: "ds-number-input__description",
				id: descriptionId,
				"data-part": "description",
				children: /* @__PURE__ */ jsx(Text, {
					element: "p",
					size: "sm",
					tone: "muted",
					overrides: helperOverrides,
					children: description
				})
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-number-input__field",
				"data-part": "field",
				children: [
					resolvedLeading ? /* @__PURE__ */ jsx("span", {
						className: "ds-number-input__affix",
						"data-part": "prefix",
						"aria-hidden": "true",
						children: resolvedLeading
					}) : null,
					/* @__PURE__ */ jsx("input", {
						...rest,
						ref: inputRef,
						id,
						name,
						type: "text",
						inputMode: "decimal",
						role: "spinbutton",
						autoComplete: "off",
						value: text,
						placeholder,
						className: "ds-number-input__input",
						"data-part": "input",
						"aria-valuenow": committedValue,
						"aria-valuemin": min,
						"aria-valuemax": max,
						"aria-valuetext": valueText,
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						readOnly: isDisabled ? true : readOnly,
						onChange: handleChange,
						onKeyDown: handleKeyDown,
						onBlur: handleBlur
					}),
					resolvedTrailing ? /* @__PURE__ */ jsx("span", {
						className: "ds-number-input__affix",
						"data-part": "suffix",
						"aria-hidden": "true",
						children: resolvedTrailing
					}) : null,
					hideSteppers ? null : /* @__PURE__ */ jsxs("span", {
						className: "ds-number-input__steppers",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-number-input__stepper",
							"data-part": "decrementButton",
							onPointerDown: (event) => stepperPointerDown(event, -1),
							onPointerUp: stopRepeat,
							onPointerLeave: endPointerStep,
							onPointerCancel: endPointerStep,
							onClick: (event) => stepperClick(event, -1),
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								iconOnly: true,
								label: COPY$12.decrement,
								leadingIcon: /* @__PURE__ */ jsx(Icon, {
									name: "minus",
									inline: true
								}),
								disabled: isDisabled || atMin,
								tabIndex: -1
							})
						}), /* @__PURE__ */ jsx("span", {
							className: "ds-number-input__stepper",
							"data-part": "incrementButton",
							onPointerDown: (event) => stepperPointerDown(event, 1),
							onPointerUp: stopRepeat,
							onPointerLeave: endPointerStep,
							onPointerCancel: endPointerStep,
							onClick: (event) => stepperClick(event, 1),
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								iconOnly: true,
								label: COPY$12.increment,
								leadingIcon: /* @__PURE__ */ jsx(Icon, {
									name: "plus",
									inline: true
								}),
								disabled: isDisabled || atMax,
								tabIndex: -1
							})
						})]
					})
				]
			}),
			isInvalid ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				overrides: helperOverrides,
				children: slotMessage
			}) : null
		]
	});
}
//#endregion
//#region src/ProgressBar.tsx
/** Announcement copy, used verbatim. `{label}` and `{value}` are the only parameters. */
const COPY$11 = {
	progress: "{label}: {value}",
	complete: "{label}: complete",
	indeterminate: "{label}: in progress"
};
/** Bindings realised as hooks on the root. The rest are forwarded to the composed Texts' `overrides`. */
const ROOT_OVERRIDE_HOOK$1 = {
	track: "--ds-progress-bar-track",
	trackHeight: "--ds-progress-bar-track-height",
	radius: "--ds-progress-bar-radius",
	partGap: "--ds-progress-bar-part-gap",
	labelGap: "--ds-progress-bar-label-gap",
	transition: "--ds-progress-bar-transition",
	indeterminateLoop: "--ds-progress-bar-indeterminate-loop",
	sweepEasing: "--ds-progress-bar-sweep-easing"
};
function rootStyle(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = ROOT_OVERRIDE_HOOK$1[binding];
		const ref = overrides[binding];
		if (hook === void 0 || !ref) continue;
		style[hook] = cssVar(ref);
	}
	return style;
}
/** Drops unset entries so the Text keeps its own defaults. */
function compact(overrides) {
	const out = {};
	for (const key of Object.keys(overrides)) {
		const ref = overrides[key];
		if (ref) out[key] = ref;
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
const isDev$7 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const PERCENT = new Intl.NumberFormat(void 0, {
	style: "percent",
	maximumFractionDigits: 0
});
/** The same arithmetic the fill uses, so a non-zero `min` reads correctly without a custom formatter. */
function defaultFormatValue(value, min, max) {
	return PERCENT.format(max > min ? (value - min) / (max - min) : 0);
}
function interpolate$4(template, params) {
	return template.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match);
}
/** The invalid `min`/`max` pairs already reported, so each distinct one warns once. */
const warnedRanges = /* @__PURE__ */ new Set();
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
function ProgressBar({ ref, label, value, min = 0, max = 100, formatValue, showValue = true, hideLabel = false, tone = "neutral", announce = "complete", overrides, ...rest }) {
	const { className: _className, style: _style, tabIndex: _tabIndex, ...forwarded } = rest;
	const labelId = useId();
	const safeMin = Number.isFinite(min) ? min : 0;
	const safeMax = Number.isFinite(max) ? max : 100;
	const validRange = safeMax > safeMin;
	useEffect(() => {
		if (!isDev$7 || validRange) return;
		const pair = `${safeMin}:${safeMax}`;
		if (warnedRanges.has(pair)) return;
		warnedRanges.add(pair);
		console.warn(`ProgressBar: \`max\` (${safeMax}) must be greater than \`min\` (${safeMin}); the bar renders empty.`);
	}, [
		validRange,
		safeMin,
		safeMax
	]);
	const indeterminate = value === void 0 || value === null;
	const clamped = validRange ? Math.min(Math.max(!indeterminate && Number.isFinite(value) ? value : safeMin, safeMin), safeMax) : safeMin;
	const fraction = validRange ? (clamped - safeMin) / (safeMax - safeMin) : 0;
	const valueText = indeterminate ? void 0 : (formatValue ?? defaultFormatValue)(clamped, safeMin, safeMax);
	const tier = Math.floor(fraction * 4);
	const complete = validRange && clamped >= safeMax;
	const [message, setMessage] = useState({
		text: "",
		key: 0
	});
	const latest = useRef({
		label,
		valueText
	});
	latest.current = {
		label,
		valueText
	};
	const record = useRef({
		mounted: false,
		indeterminate: false,
		validRange: false,
		tier: 0,
		complete: false
	});
	const frame = useRef(0);
	useEffect(() => () => cancelAnimationFrame(frame.current), []);
	useEffect(() => {
		const r = record.current;
		const say = (template, defer) => {
			const text = interpolate$4(template, {
				label: latest.current.label,
				value: latest.current.valueText ?? ""
			});
			const emit = () => setMessage((prev) => ({
				text,
				key: prev.key + 1
			}));
			if (defer) frame.current = requestAnimationFrame(emit);
			else emit();
		};
		const firstRun = !r.mounted;
		r.mounted = true;
		if (indeterminate) {
			r.validRange = validRange;
			if (firstRun || !r.indeterminate) {
				r.indeterminate = true;
				r.tier = 0;
				r.complete = false;
				if (announce !== "none") say(COPY$11.indeterminate, firstRun);
			}
			return;
		}
		r.indeterminate = false;
		const enteredRange = validRange && !r.validRange;
		r.validRange = validRange;
		if (!validRange) return;
		if (firstRun || enteredRange) {
			r.tier = tier;
			r.complete = complete;
			return;
		}
		if (tier < r.tier) r.tier = tier;
		if (!complete) r.complete = false;
		if (complete && !r.complete) {
			r.complete = true;
			r.tier = tier;
			if (announce !== "none") say(COPY$11.complete, false);
			return;
		}
		if (tier > r.tier) {
			r.tier = tier;
			if (announce === "milestones") say(COPY$11.progress, false);
		}
	}, [
		announce,
		indeterminate,
		validRange,
		tier,
		complete
	]);
	const labelOverrides = compact({
		fontSize: overrides?.labelSize,
		fontWeight: overrides?.labelWeight,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	const valueOverrides = compact({
		fontSize: overrides?.valueSize,
		fontFamily: overrides?.fontFamily,
		lineHeight: overrides?.lineHeight
	});
	const showValueText = showValue && !indeterminate;
	const labelText = /* @__PURE__ */ jsx(Text, {
		element: "span",
		size: "sm",
		weight: "medium",
		tone: "default",
		id: labelId,
		"data-part": "label",
		overrides: labelOverrides,
		children: label
	});
	const headerClass = hideLabel && !showValueText ? "ds-progress-bar__header ds-progress-bar__visually-hidden" : hideLabel ? "ds-progress-bar__header ds-progress-bar__header--label-hidden" : "ds-progress-bar__header";
	return /* @__PURE__ */ jsxs("div", {
		...forwarded,
		ref,
		"data-ds": "ProgressBar",
		"data-part": "container",
		className: `ds-progress-bar ds-progress-bar--${tone}`,
		style: overrides ? rootStyle(overrides) : void 0,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: headerClass,
				"data-part": "header",
				children: [hideLabel && showValueText ? /* @__PURE__ */ jsx("span", {
					className: "ds-progress-bar__visually-hidden",
					children: labelText
				}) : labelText, showValueText ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					size: "sm",
					tone: "muted",
					"data-part": "valueText",
					overrides: valueOverrides,
					children: valueText
				}) : null]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-progress-bar__track",
				"data-part": "track",
				role: "progressbar",
				"aria-labelledby": labelId,
				"aria-valuemin": safeMin,
				"aria-valuemax": safeMax,
				...indeterminate ? { "aria-busy": true } : {
					"aria-valuenow": clamped,
					"aria-valuetext": valueText
				},
				children: /* @__PURE__ */ jsx("div", {
					className: "ds-progress-bar__fill",
					"data-part": "fill",
					style: indeterminate ? void 0 : { inlineSize: `${fraction * 100}%` }
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-progress-bar__visually-hidden",
				role: "status",
				"aria-live": "polite",
				children: message.text ? /* @__PURE__ */ jsx("span", { children: message.text }, message.key) : null
			})
		]
	});
}
//#endregion
//#region src/Stepper.tsx
const COPY$10 = {
	navLabel: "Progress",
	stepOf: "Step {current} of {total}",
	complete: "completed",
	current: "current step",
	error: "has an error",
	stepLabel: "Step {n}: {label}"
};
const isDev$6 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Hooks owned by the root. Label, description and count typography is forwarded to the composed Text's `overrides`. */
const ROOT_OVERRIDE_HOOK = {
	indicatorSize: "--ds-stepper-indicator-size",
	indicatorBackground: "--ds-stepper-indicator-background",
	indicatorRadius: "--ds-stepper-indicator-radius",
	indicatorFontSize: "--ds-stepper-indicator-font-size",
	indicatorFontWeight: "--ds-stepper-indicator-font-weight",
	connector: "--ds-stepper-connector",
	stepHover: "--ds-stepper-step-hover",
	stepRadius: "--ds-stepper-step-radius",
	stepPadding: "--ds-stepper-step-padding",
	stepGap: "--ds-stepper-step-gap",
	partGap: "--ds-stepper-part-gap",
	fontFamily: "--ds-stepper-font-family",
	transition: "--ds-stepper-transition"
};
/**
* Every forward carries its binding's token, overridden or not — the composed Text's own `weight`
* prop is not set, so the weight has to arrive as an override, and the rest follow the same rule.
*/
const DEFAULT_TOKEN = {
	labelSize: "font.size.sm",
	labelWeight: "font.weight.medium",
	labelCurrentWeight: "font.weight.semibold",
	descriptionSize: "font.size.xs",
	countSize: "font.size.sm",
	fontFamily: "font.family.body",
	indicatorFontSize: "font.size.sm",
	indicatorCompleteForeground: "color.control.selectedForeground",
	indicatorErrorForeground: "color.status.danger.foreground"
};
function resolveOverrides$3(overrides) {
	const rootStyle = {};
	const label = {
		fontSize: DEFAULT_TOKEN.labelSize,
		fontWeight: DEFAULT_TOKEN.labelWeight,
		fontFamily: DEFAULT_TOKEN.fontFamily
	};
	const currentLabel = {
		fontSize: DEFAULT_TOKEN.labelSize,
		fontWeight: DEFAULT_TOKEN.labelCurrentWeight,
		fontFamily: DEFAULT_TOKEN.fontFamily
	};
	const description = {
		fontSize: DEFAULT_TOKEN.descriptionSize,
		fontFamily: DEFAULT_TOKEN.fontFamily
	};
	const count = {
		fontSize: DEFAULT_TOKEN.countSize,
		fontFamily: DEFAULT_TOKEN.fontFamily
	};
	let indicatorFontSize = DEFAULT_TOKEN.indicatorFontSize;
	for (const binding of Object.keys(overrides ?? {})) {
		const ref = overrides?.[binding];
		const hook = ROOT_OVERRIDE_HOOK[binding];
		if (!ref) continue;
		if (hook) rootStyle[hook] = cssVar(ref);
		switch (binding) {
			case "labelSize":
				label.fontSize = ref;
				currentLabel.fontSize = ref;
				break;
			case "labelWeight":
				label.fontWeight = ref;
				break;
			case "labelCurrentWeight":
				currentLabel.fontWeight = ref;
				break;
			case "descriptionSize":
				description.fontSize = ref;
				break;
			case "countSize":
				count.fontSize = ref;
				break;
			case "indicatorFontSize":
				indicatorFontSize = ref;
				break;
			case "fontFamily":
				label.fontFamily = ref;
				currentLabel.fontFamily = ref;
				description.fontFamily = ref;
				count.fontFamily = ref;
		}
	}
	return {
		rootStyle: Object.keys(rootStyle).length > 0 ? rootStyle : void 0,
		label,
		currentLabel,
		description,
		count,
		indicatorFontSize
	};
}
function resolveStatus(step, index, currentIndex) {
	if (step.status) return step.status;
	if (currentIndex === -1 || index > currentIndex) return "upcoming";
	return index < currentIndex ? "complete" : "current";
}
const STATUS_WORD = {
	complete: COPY$10.complete,
	current: COPY$10.current,
	error: COPY$10.error,
	upcoming: void 0
};
/**
* Stepper — Design Schema, category: navigation.
*
* When to use:
* Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).
*/
function Stepper({ ref, label, steps, current, orientation = "horizontal", navigable = "completed", compact = false, overrides, onStepSelect, ...rest }) {
	const baseId = useId();
	const currentIndex = steps.findIndex((step) => step.id === current);
	const resolved = resolveOverrides$3(overrides);
	if (isDev$6 && current !== "" && currentIndex === -1) console.warn(`Stepper: current "${current}" matches no step id — nothing is selected.`);
	const classes = [
		"ds-stepper",
		`ds-stepper--${orientation}`,
		compact && orientation === "horizontal" ? "ds-stepper--compact" : null
	].filter(Boolean).join(" ");
	const stepOf = COPY$10.stepOf.replace("{current}", String(Math.max(currentIndex, 0) + 1)).replace("{total}", String(steps.length));
	return /* @__PURE__ */ jsxs("nav", {
		...rest,
		ref,
		"data-ds": "Stepper",
		className: classes,
		style: resolved.rootStyle,
		"aria-label": label || COPY$10.navLabel,
		children: [/* @__PURE__ */ jsx("ol", {
			className: "ds-stepper__list",
			"data-part": "list",
			children: steps.map((step, index) => {
				const status = resolveStatus(step, index, currentIndex);
				const isCurrent = index === currentIndex;
				const isBefore = currentIndex !== -1 && index < currentIndex;
				const isNavigable = navigable === "all" || navigable === "completed" && isBefore;
				const statusWord = STATUS_WORD[status];
				const hasDescription = orientation === "vertical" && step.description !== void 0 && step.description !== "";
				const descriptionId = hasDescription && isNavigable ? `${baseId}-d${index}` : void 0;
				const isLast = index === steps.length - 1;
				const iconOverrides = (color) => ({
					size: resolved.indicatorFontSize,
					color
				});
				const content = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
					className: "ds-stepper__indicator",
					"data-part": "indicator",
					"aria-hidden": "true",
					children: status === "complete" ? /* @__PURE__ */ jsx(Icon, {
						name: "check",
						size: "sm",
						overrides: iconOverrides(DEFAULT_TOKEN.indicatorCompleteForeground)
					}) : status === "error" ? /* @__PURE__ */ jsx(Icon, {
						name: "danger",
						size: "sm",
						overrides: iconOverrides(DEFAULT_TOKEN.indicatorErrorForeground)
					}) : index + 1
				}), /* @__PURE__ */ jsxs("span", {
					className: "ds-stepper__content",
					children: [
						/* @__PURE__ */ jsx(Text, {
							element: "span",
							size: "sm",
							tone: status === "upcoming" ? "muted" : "default",
							align: orientation === "horizontal" ? "center" : "start",
							"data-part": "label",
							overrides: isCurrent ? resolved.currentLabel : resolved.label,
							children: step.label
						}),
						statusWord ? /* @__PURE__ */ jsx("span", {
							className: "ds-stepper__visually-hidden",
							children: `, ${statusWord}`
						}) : null,
						hasDescription ? /* @__PURE__ */ jsx(Text, {
							element: "span",
							size: "xs",
							tone: "muted",
							id: descriptionId,
							"aria-hidden": descriptionId ? "true" : void 0,
							"data-part": "description",
							overrides: resolved.description,
							children: step.description
						}) : null
					]
				})] });
				return /* @__PURE__ */ jsxs("li", {
					className: [
						"ds-stepper__step",
						`ds-stepper__step--${status}`,
						isCurrent ? "ds-stepper__step--selected" : null
					].filter(Boolean).join(" "),
					"data-part": "step",
					children: [isNavigable ? /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ds-stepper__control ds-stepper__control--navigable",
						"aria-current": isCurrent ? "step" : void 0,
						"aria-describedby": descriptionId,
						onClick: () => onStepSelect?.(step.id),
						children: content
					}) : /* @__PURE__ */ jsx("div", {
						className: "ds-stepper__control",
						"aria-current": isCurrent ? "step" : void 0,
						children: content
					}), isLast ? null : /* @__PURE__ */ jsx("span", {
						className: `ds-stepper__connector${isBefore ? " ds-stepper__connector--complete" : ""}`,
						"data-part": "connector",
						"aria-hidden": "true"
					})]
				}, step.id);
			})
		}), /* @__PURE__ */ jsx(Text, {
			element: "span",
			size: "sm",
			tone: "muted",
			className: "ds-stepper__count",
			"data-part": "count",
			overrides: resolved.count,
			children: stepOf
		})]
	});
}
//#endregion
//#region src/Search.tsx
/** copy.* — used verbatim; `{count}` is the only interpolation. */
const COPY$9 = {
	clear: "Clear search",
	submit: "Search",
	loading: "Loading suggestions",
	suggestionsCount: {
		one: "{count} suggestion available",
		other: "{count} suggestions available"
	},
	noSuggestions: "No suggestions"
};
/** Hooks on the root. `labelWeight` has none: it is forwarded to the label Text. */
const ROOT_HOOK$1 = {
	borderWidth: "--ds-search-border-width",
	radius: "--ds-search-radius",
	paddingInline: "--ds-search-padding-inline",
	paddingBlock: "--ds-search-padding-block",
	affixGap: "--ds-search-affix-gap",
	fontFamily: "--ds-search-font-family",
	fontSize: "--ds-search-font-size",
	lineHeight: "--ds-search-line-height",
	partGap: "--ds-search-part-gap",
	disabledOpacity: "--ds-search-disabled-opacity"
};
/** Hooks on the portaled suggestions popup, which does not inherit from the root. */
const POPUP_HOOK = {
	suggestionsOffset: "--ds-search-suggestions-offset",
	popupSurface: "--ds-search-popup-surface",
	popupBorder: "--ds-search-popup-border",
	popupBorderWidth: "--ds-search-popup-border-width",
	popupRadius: "--ds-search-popup-radius",
	popupShadow: "--ds-search-popup-shadow",
	layer: "--ds-search-layer"
};
function resolveOverrides$2(overrides) {
	const root = {};
	const popup = {};
	for (const binding of Object.keys(overrides ?? {})) {
		const ref = overrides?.[binding];
		if (!ref) continue;
		const rootHook = ROOT_HOOK$1[binding];
		const popupHook = POPUP_HOOK[binding];
		if (rootHook) root[rootHook] = cssVar(ref);
		else if (popupHook) popup[popupHook] = cssVar(ref);
	}
	return {
		root: Object.keys(root).length ? root : void 0,
		popup: Object.keys(popup).length ? popup : void 0
	};
}
/** A CSS time (`200ms`, `0.2s`) in milliseconds; 0 when it cannot be read (no stylesheet loaded). */
function parseTime(raw) {
	const match = /^(-?[\d.]+)(ms|s)$/.exec(raw.trim());
	if (!match) return 0;
	const amount = Number(match[1]);
	return match[2] === "s" ? amount * 1e3 : amount;
}
/** Constant `statusDebounce`: motion.duration.base × 2, in ms, read from the theme on `el`. */
function statusDebounce(el) {
	if (!el || typeof getComputedStyle === "undefined") return 0;
	return parseTime(getComputedStyle(el).getPropertyValue("--motion-duration-base")) * 2;
}
/** Below the field, flipped above when it would overflow and there is more room there; never past the inline edge. */
function computePosition(field, popup) {
	const viewportHeight = window.innerHeight;
	const vertical = field.bottom + popup.height > viewportHeight && field.top > viewportHeight - field.bottom ? "top" : "bottom";
	const width = Math.max(popup.width, field.width);
	return {
		vertical,
		left: Math.max(0, Math.min(field.left, window.innerWidth - width)),
		top: vertical === "bottom" ? field.bottom : void 0,
		bottom: vertical === "top" ? viewportHeight - field.top : void 0,
		minInlineSize: field.width
	};
}
function samePosition(a, b) {
	return a !== null && a.vertical === b.vertical && a.left === b.left && a.top === b.top && a.bottom === b.bottom && a.minInlineSize === b.minInlineSize;
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
function Search({ ref, label, showLabel = false, name = "q", value, defaultValue, placeholder, action, suggestions, loading = false, landmark = true, size = "md", disabled = false, container, overrides, onChange, onSubmit, onClear, onKeyDown, id: idProp, ...rest }) {
	const form = useFormContext();
	const inForm = form !== null;
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-search${generatedId}`);
	const labelId = `${id}-label`;
	const listboxId = `${id}-listbox`;
	const rootRef = useRef(null);
	const fieldRef = useRef(null);
	const inputRef = useRef(null);
	const queryRef = useRef(null);
	const popupRef = useRef(null);
	const listboxRef = useRef(null);
	const pendingForward = useRef(null);
	const pendingQuery = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !label) console.warn("Search: `label` is required; it is the accessible name of the field.");
	}, [label]);
	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && inForm && action !== void 0) console.warn("Search: `action` is ignored inside a Form; the enclosing Form owns submission.");
	}, [inForm, action]);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const text = isControlled ? value : internalValue;
	const isDisabled = disabled || (form?.disabled ?? false);
	const hasSuggestions = suggestions !== void 0;
	const [open, setOpen] = useState(false);
	const [activeValue, setActiveValue] = useState(null);
	const [generation, setGeneration] = useState(0);
	const [position, setPosition] = useState(null);
	const showPopup = open && hasSuggestions && !isDisabled;
	/** Remounts the Listbox with no highlight: the only way to reset its internal active option. */
	const resetHighlight = () => {
		setActiveValue(null);
		setGeneration((g) => g + 1);
	};
	const signature = `${loading}|${(suggestions ?? []).map((row) => row.value).join(" ")}`;
	const lastSignature = useRef(signature);
	useEffect(() => {
		if (lastSignature.current === signature) return;
		lastSignature.current = signature;
		resetHighlight();
	}, [signature]);
	const latest = useRef({
		label,
		text
	});
	latest.current = {
		label,
		text
	};
	useEffect(() => {
		if (!form || isDisabled) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.text.trim(),
			isDisabled: () => false,
			validate: () => null,
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id,
		isDisabled
	]);
	useLayoutEffect(() => {
		if (!showPopup) {
			setPosition(null);
			return;
		}
		const reposition = () => {
			const field = fieldRef.current;
			const popup = popupRef.current;
			if (!field || !popup) return;
			const next = computePosition(field.getBoundingClientRect(), popup.getBoundingClientRect());
			setPosition((previous) => samePosition(previous, next) ? previous : next);
		};
		reposition();
		if (pendingForward.current !== null) {
			const key = pendingForward.current;
			pendingForward.current = null;
			listboxRef.current?.dispatchEvent(new KeyboardEvent("keydown", {
				key,
				bubbles: true,
				cancelable: true
			}));
		}
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [
		showPopup,
		generation,
		signature
	]);
	const closeList = () => {
		if (!open) return;
		setActiveValue(null);
		setOpen(false);
	};
	const closeRef = useRef(closeList);
	closeRef.current = closeList;
	useEffect(() => {
		if (!showPopup) return void 0;
		const outsideOf = (root, target) => !(target instanceof Node) || !root?.contains(target) && !popupRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (outsideOf(fieldRef.current, event.target)) closeRef.current();
		};
		const handleFocusOut = (event) => {
			if (event.relatedTarget === null) return;
			if (rootRef.current?.contains(event.target) && outsideOf(rootRef.current, event.relatedTarget)) closeRef.current();
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
		};
	}, [showPopup]);
	const count = loading ? 0 : suggestions?.length ?? 0;
	const statusText = !showPopup ? "" : loading ? COPY$9.loading : count === 0 ? COPY$9.noSuggestions : COPY$9.suggestionsCount[new Intl.PluralRules(void 0).select(count) === "one" ? "one" : "other"].replace("{count}", String(count));
	const [announced, setAnnounced] = useState("");
	useEffect(() => {
		if (statusText === "") {
			setAnnounced("");
			return;
		}
		const timer = setTimeout(() => setAnnounced(statusText), statusDebounce(rootRef.current));
		return () => clearTimeout(timer);
	}, [statusText]);
	const updateText = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
	};
	/**
	* Submits `raw`. Outside a Form every route goes through the native form, so with `action` it is a
	* GET submit; inside a Form Search fires `onSubmit` itself and never submits the enclosing Form.
	*/
	const submit = (raw) => {
		if (isDisabled) return;
		if (inForm) {
			const query = raw.trim();
			if (query === "") return;
			closeList();
			onSubmit?.(query);
			return;
		}
		pendingQuery.current = raw;
		rootRef.current?.requestSubmit();
	};
	const handleFormSubmit = (event) => {
		const query = (pendingQuery.current ?? text).trim();
		pendingQuery.current = null;
		if (isDisabled || query === "") {
			event.preventDefault();
			return;
		}
		closeList();
		onSubmit?.(query);
		if (action && queryRef.current) queryRef.current.value = query;
		else event.preventDefault();
	};
	const clear = () => {
		if (isDisabled) return;
		updateText("");
		closeList();
		onClear?.();
		inputRef.current?.focus();
	};
	const choose = (rowValue) => {
		const row = suggestions?.find((candidate) => candidate.value === rowValue);
		if (!row || isDisabled) return;
		updateText(row.label);
		closeList();
		inputRef.current?.focus();
		submit(row.label);
	};
	const handleListboxChange = (next) => {
		const chosen = Array.isArray(next) ? next[0] : next;
		if (chosen !== void 0 && chosen !== "") choose(chosen);
	};
	const handleInputChange = (event) => {
		if (isDisabled) return;
		updateText(event.target.value);
		if (hasSuggestions) {
			if (open) resetHighlight();
			else setOpen(true);
		}
	};
	const forwardToListbox = (key) => {
		const target = listboxRef.current;
		if (!target) {
			pendingForward.current = key;
			return;
		}
		target.dispatchEvent(new KeyboardEvent("keydown", {
			key,
			bubbles: true,
			cancelable: true
		}));
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented) return;
		if (isDisabled) {
			if (event.key === "Enter" || event.key === "Escape" || event.key === "ArrowDown" || event.key === "ArrowUp") event.preventDefault();
			return;
		}
		switch (event.key) {
			case "Enter":
				event.preventDefault();
				if (showPopup && activeValue !== null) choose(activeValue);
				else submit(text);
				break;
			case "Escape":
				if (showPopup) {
					event.preventDefault();
					closeList();
				} else if (text !== "") {
					event.preventDefault();
					clear();
				}
				break;
			case "ArrowDown":
				if (!hasSuggestions) break;
				event.preventDefault();
				if (!showPopup) {
					pendingForward.current = "ArrowDown";
					setOpen(true);
				} else forwardToListbox("ArrowDown");
				break;
			case "ArrowUp":
				if (!showPopup || activeValue === null) break;
				event.preventDefault();
				if (activeValue === (loading ? void 0 : suggestions?.[0]?.value)) resetHighlight();
				else forwardToListbox("ArrowUp");
				break;
			case "Tab": closeList();
		}
	};
	const resolved = resolveOverrides$2(overrides);
	const listOptions = loading ? [] : (suggestions ?? []).map((row) => ({
		value: row.value,
		label: row.label,
		description: row.description
	}));
	const classes = [
		"ds-search",
		`ds-search--${size}`,
		isDisabled ? "ds-search--disabled" : null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-search__label", showLabel ? null : "ds-search__label--hidden"].filter(Boolean).join(" ");
	const popupStyle = {
		...resolved.popup,
		...position ? {
			left: position.left,
			top: position.top,
			bottom: position.bottom,
			minInlineSize: position.minInlineSize
		} : null
	};
	const content = /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("label", {
			htmlFor: id,
			id: labelId,
			className: labelClasses,
			"data-part": "label",
			children: /* @__PURE__ */ jsx(Text, {
				element: "span",
				overrides: {
					fontWeight: overrides?.labelWeight ?? "font.weight.medium",
					fontSize: overrides?.fontSize ?? `font.size.${size}`
				},
				children: label
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			ref: fieldRef,
			className: "ds-search__field",
			"data-part": "field",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "ds-search__icon",
					"data-part": "icon",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "search",
						size: size === "lg" ? "md" : "sm",
						overrides: { color: "color.foreground.muted" }
					})
				}),
				/* @__PURE__ */ jsx("input", {
					...rest,
					ref: inputRef,
					id,
					type: "search",
					enterKeyHint: "search",
					autoComplete: "off",
					className: "ds-search__input",
					"data-part": "input",
					value: text,
					placeholder,
					readOnly: isDisabled,
					role: hasSuggestions ? "combobox" : void 0,
					"aria-autocomplete": hasSuggestions ? "list" : void 0,
					"aria-expanded": hasSuggestions ? showPopup ? "true" : "false" : void 0,
					"aria-controls": hasSuggestions ? listboxId : void 0,
					"aria-activedescendant": showPopup && activeValue !== null ? `${listboxId}-option-${activeValue}` : void 0,
					"aria-disabled": isDisabled ? "true" : void 0,
					onChange: handleInputChange,
					onKeyDown: handleKeyDown
				}),
				text !== "" ? /* @__PURE__ */ jsx("span", {
					className: "ds-search__control",
					"data-part": "clearButton",
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$9.clear,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "close",
							inline: true
						}),
						disabled: isDisabled,
						onClick: clear
					})
				}) : null,
				/* @__PURE__ */ jsx("span", {
					className: "ds-search__control",
					"data-part": "submitButton",
					children: /* @__PURE__ */ jsx(Button, {
						type: inForm ? "button" : "submit",
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$9.submit,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "arrow-right",
							inline: true
						}),
						disabled: isDisabled,
						onClick: inForm ? () => submit(text) : void 0
					})
				})
			]
		}),
		action && !inForm ? /* @__PURE__ */ jsx("input", {
			ref: queryRef,
			type: "hidden",
			name
		}) : null,
		/* @__PURE__ */ jsx("div", {
			role: "status",
			"aria-live": "polite",
			className: "ds-search__status",
			children: announced
		}),
		showPopup && typeof document !== "undefined" ? createPortal(/* @__PURE__ */ jsx("div", {
			ref: popupRef,
			className: "ds-search__suggestions",
			"data-part": "suggestions",
			"data-vertical": position?.vertical ?? "bottom",
			style: popupStyle,
			onMouseDown: (event) => event.preventDefault(),
			children: /* @__PURE__ */ jsx(Listbox, {
				ref: listboxRef,
				id: listboxId,
				label,
				embedded: true,
				value: "",
				options: listOptions,
				selectionFollowsFocus: false,
				emptyMessage: listOptions.length === 0 ? loading ? COPY$9.loading : COPY$9.noSuggestions : void 0,
				onChange: handleListboxChange,
				onActiveChange: setActiveValue
			}, generation)
		}), container ?? document.body) : null
	] });
	if (inForm) return /* @__PURE__ */ jsx("div", {
		ref: rootRef,
		"data-ds": "Search",
		"data-ds-field": "",
		"data-part": "form",
		role: landmark ? "search" : void 0,
		className: classes,
		style: resolved.root,
		children: content
	});
	return /* @__PURE__ */ jsx("form", {
		ref: rootRef,
		"data-ds": "Search",
		"data-ds-field": "",
		"data-part": "form",
		role: landmark ? "search" : void 0,
		className: classes,
		style: resolved.root,
		method: action ? "get" : void 0,
		action,
		noValidate: true,
		onSubmit: handleFormSubmit,
		children: content
	});
}
//#endregion
//#region src/DatePicker.tsx
/** copy.* — used verbatim; `{label}`, `{month}`, `{year}`, `{pattern}`, `{min}` and `{max}` are the only interpolations. */
const COPY$8 = {
	open: "Choose date",
	openRange: "Choose dates",
	previousMonth: "Previous month",
	nextMonth: "Next month",
	month: "Month",
	year: "Year",
	today: "Today",
	clear: "Clear",
	weekNumber: "Week",
	gridLabel: "{label}, {month} {year}",
	selected: "selected",
	todayLabel: "today",
	startLabel: "Start date",
	endLabel: "End date",
	required: "{label} is required.",
	invalid: "{label} must be a valid date ({pattern}).",
	tooEarly: "{label} must be on or after {min}.",
	tooLate: "{label} must be on or before {max}.",
	rangeOrder: "End date must be on or after the start date.",
	requiredIndicator: " (required)"
};
function interpolate$3(template, params) {
	return template.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match);
}
const isDev$5 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Hooks set inline on the root and on the portaled calendar (which the root's custom properties
* cannot reach). Not here: `helperSize` (the description and error Text `fontSize`),
* `monthTitleSize`/`monthTitleWeight` (the month and year Selects' `fontSize`/`fontWeight`) and
* `calendarInset` (the composed Popover's `inset`, which pads the calendar panel).
*/
const OVERRIDE_HOOK$5 = {
	borderInvalid: "--ds-date-picker-border-invalid",
	borderWidth: "--ds-date-picker-border-width",
	radius: "--ds-date-picker-radius",
	paddingInline: "--ds-date-picker-padding-inline",
	paddingBlock: "--ds-date-picker-padding-block",
	fontSize: "--ds-date-picker-font-size",
	calendarGap: "--ds-date-picker-calendar-gap",
	headerGap: "--ds-date-picker-header-gap",
	footerGap: "--ds-date-picker-footer-gap",
	dayGap: "--ds-date-picker-day-gap",
	dayRadius: "--ds-date-picker-day-radius",
	dayHover: "--ds-date-picker-day-hover",
	weekdaySize: "--ds-date-picker-weekday-size",
	weekdayWeight: "--ds-date-picker-weekday-weight",
	weekNumberSize: "--ds-date-picker-week-number-size",
	weekNumberWeight: "--ds-date-picker-week-number-weight",
	partGap: "--ds-date-picker-part-gap",
	fieldGap: "--ds-date-picker-field-gap",
	dayFontSize: "--ds-date-picker-day-font-size",
	fontFamily: "--ds-date-picker-font-family",
	lineHeight: "--ds-date-picker-line-height",
	labelWeight: "--ds-date-picker-label-weight",
	disabledOpacity: "--ds-date-picker-disabled-opacity",
	transition: "--ds-date-picker-transition"
};
function resolveOverrides$1(overrides) {
	const style = {};
	const helperOverrides = {};
	const selectOverrides = {};
	let popoverOverrides;
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "helperSize") helperOverrides.fontSize = ref;
		if (binding === "fontFamily") helperOverrides.fontFamily = ref;
		if (binding === "monthTitleSize") selectOverrides.fontSize = ref;
		if (binding === "monthTitleWeight") selectOverrides.fontWeight = ref;
		if (binding === "calendarInset") popoverOverrides = { inset: ref };
		const hook = OVERRIDE_HOOK$5[binding];
		if (hook) style[hook] = cssVar(ref);
	}
	return {
		style,
		helperOverrides,
		selectOverrides,
		popoverOverrides
	};
}
function pad(num, length) {
	return String(num).padStart(length, "0");
}
/** `YYYY-MM-DD` → parts (month 0-based), rejecting dates that do not exist (`2026-02-30`). */
function parseISO(iso) {
	const match = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]) - 1;
	const day = Number(match[3]);
	const check = new Date(Date.UTC(year, month, day));
	if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
	return {
		year,
		month,
		day
	};
}
function toISO(year, month, day) {
	const date = new Date(Date.UTC(year, month, day));
	date.setUTCFullYear(year, month, day);
	return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}`;
}
function partsOf(iso) {
	return parseISO(iso) ?? {
		year: 1970,
		month: 0,
		day: 1
	};
}
function utcDate(iso) {
	const p = partsOf(iso);
	return new Date(Date.UTC(p.year, p.month, p.day));
}
function addDays(iso, delta) {
	const p = partsOf(iso);
	return toISO(p.year, p.month, p.day + delta);
}
function daysInMonth(year, month) {
	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
/** Same day `delta` months away, clamped to the target month's length (Jan 31 → Feb 28). */
function addMonths(iso, delta) {
	const p = partsOf(iso);
	const total = p.month + delta;
	const year = p.year + Math.floor(total / 12);
	const month = (total % 12 + 12) % 12;
	return toISO(year, month, Math.min(p.day, daysInMonth(year, month)));
}
/** The device's calendar date today. */
function todayISO() {
	const now = /* @__PURE__ */ new Date();
	return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}
/** First day of the week as `getUTCDay()` (0 = Sunday): `Intl.Locale.prototype.getWeekInfo()` where available, else Sunday. */
function firstDayOfWeek(locale) {
	try {
		const info = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale);
		const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
		if (typeof firstDay === "number") return firstDay % 7;
	} catch {}
	return 0;
}
/** ISO 8601 week number. */
function isoWeek(iso) {
	const date = utcDate(iso);
	const weekday = (date.getUTCDay() + 6) % 7;
	date.setUTCDate(date.getUTCDate() - weekday + 3);
	const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
	firstThursday.setUTCDate(firstThursday.getUTCDate() - (firstThursday.getUTCDay() + 6) % 7 + 3);
	return 1 + Math.round((date.getTime() - firstThursday.getTime()) / 6048e5);
}
const FIELD_FORMAT = {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	timeZone: "UTC"
};
function localePattern(locale) {
	const order = [];
	let text = "";
	for (const part of new Intl.DateTimeFormat(locale, FIELD_FORMAT).formatToParts(new Date(Date.UTC(2e3, 0, 2)))) if (part.type === "year" || part.type === "month" || part.type === "day") {
		order.push(part.type);
		text += part.type === "year" ? "YYYY" : part.type === "month" ? "MM" : "DD";
	} else if (part.type === "literal") text += part.value;
	return {
		order,
		text
	};
}
function formatField(iso, locale) {
	return iso && parseISO(iso) ? new Intl.DateTimeFormat(locale, FIELD_FORMAT).format(utcDate(iso)) : "";
}
/**
* Lenient parse: any non-digit separates the parts (or none at all, as one run of 8 digits in the
* pattern's order); two-digit years are refused. `undefined` for anything incomplete or not a real date.
*/
function parseTyped(raw, pattern) {
	const groups = raw.split(/\D+/).filter(Boolean);
	const found = {};
	if (groups.length === 3) pattern.order.forEach((segment, i) => {
		const group = groups[i];
		if (group !== void 0) found[segment] = group;
	});
	else if (groups.length === 1 && groups[0].length === 8) {
		let cursor = 0;
		for (const segment of pattern.order) {
			const length = segment === "year" ? 4 : 2;
			found[segment] = groups[0].slice(cursor, cursor + length);
			cursor += length;
		}
	} else return;
	const { year, month, day } = found;
	if (!year || !month || !day || year.length !== 4 || month.length > 2 || day.length > 2) return void 0;
	const parsed = parseISO(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
	return parsed ? toISO(parsed.year, parsed.month, parsed.day) : void 0;
}
/** `''` is a controlled empty field: no date. */
function startOf(value) {
	return value === void 0 || value === "" ? void 0 : typeof value === "string" ? value : value.start || void 0;
}
function endOf(value) {
	return value !== void 0 && typeof value !== "string" ? value.end || void 0 : void 0;
}
function sameValue(a, b) {
	return startOf(a) === startOf(b) && endOf(a) === endOf(b);
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
function DatePicker({ ref, label, name, value, defaultValue, open: openProp, range = false, min, max, isDateDisabled, locale: localeProp, showWeekNumbers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, error, container, overrides, onChange, onOpenChange, id: idProp, onKeyDown, onBlur, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-date-picker${generatedId}`);
	const endId = `${id}-end`;
	const labelId = `${id}-label`;
	const startLabelId = `${id}-start-label`;
	const endLabelId = `${id}-end-label`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const gridLabelId = `${id}-grid-label`;
	const locale = localeProp ?? (typeof document !== "undefined" && document.documentElement.lang ? document.documentElement.lang : void 0);
	const pattern = localePattern(locale);
	const isDisabled = disabled || (form?.disabled ?? false);
	const isValueControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const committed = isValueControlled ? value : internalValue;
	const committedStart = startOf(committed);
	const committedEnd = endOf(committed);
	/** Advanced synchronously by `report`, so Form validation in the same event sees the new value. */
	const valueRef = useRef(committed);
	valueRef.current = committed;
	const [startText, setStartText] = useState(() => formatField(committedStart, locale));
	const [endText, setEndText] = useState(() => formatField(committedEnd, locale));
	const textsRef = useRef({
		start: startText,
		end: endText
	});
	textsRef.current = {
		start: startText,
		end: endText
	};
	const synced = useRef({
		start: committedStart,
		end: committedEnd,
		locale
	});
	useEffect(() => {
		const prev = synced.current;
		if (prev.start === committedStart && prev.end === committedEnd && prev.locale === locale) return;
		synced.current = {
			start: committedStart,
			end: committedEnd,
			locale
		};
		const keep = (text, iso) => prev.locale === locale && iso !== void 0 && parseTyped(text, pattern) === iso;
		setStartText((text) => keep(text, committedStart) ? text : formatField(committedStart, locale));
		setEndText((text) => keep(text, committedEnd) ? text : formatField(committedEnd, locale));
	}, [
		committedStart,
		committedEnd,
		locale
	]);
	function report(next) {
		valueRef.current = next;
		if (!isValueControlled) setInternalValue(next);
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	}
	const dayDisabled = (iso) => min !== void 0 && iso < min || max !== void 0 && iso > max || (isDateDisabled?.(iso) ?? false);
	const isOpenControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isOpenControlled ? openProp : internalOpen;
	const initialFocus = committedStart ?? todayISO();
	const [view, setView] = useState(() => partsOf(initialFocus));
	const [focusedDate, setFocusedDate] = useState(initialFocus);
	/** The first pick of a range, until the second completes it. Not a value: nothing is reported. */
	const [pendingStart, setPendingStart] = useState(void 0);
	/** Set by ArrowDown in the end input, so the calendar opens on the end date; reset after use. */
	const openedFrom = useRef("start");
	const [previousOpen, setPreviousOpen] = useState(open);
	if (previousOpen !== open) {
		setPreviousOpen(open);
		setPendingStart(void 0);
		const fromEnd = range && openedFrom.current === "end";
		openedFrom.current = "start";
		const target = (fromEnd ? committedEnd : void 0) ?? committedStart ?? todayISO();
		const p = partsOf(target);
		setView((prev) => prev.year === p.year && prev.month === p.month ? prev : {
			year: p.year,
			month: p.month
		});
		setFocusedDate(target);
	}
	const calendarRef = useRef(null);
	const calendarButtonRef = useRef(null);
	const focusDayPending = useRef(false);
	const wasOpen = useRef(false);
	useEffect(() => {
		if (open && !wasOpen.current) focusDayPending.current = true;
		wasOpen.current = open;
		if (!open || !focusDayPending.current) return;
		focusDayPending.current = false;
		calendarRef.current?.querySelector("[data-part=\"day\"][tabindex=\"0\"]")?.focus();
	});
	function showDate(iso) {
		const p = partsOf(iso);
		setView((prev) => prev.year === p.year && prev.month === p.month ? prev : {
			year: p.year,
			month: p.month
		});
		setFocusedDate(iso);
	}
	function moveFocusTo(iso) {
		showDate(iso);
		focusDayPending.current = true;
	}
	function requestOpen(next) {
		if (next === open || next && isDisabled) return;
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChange?.(next);
	}
	/** A pick, Today or Clear: reports, and rewrites the inputs even when the value is unchanged. */
	function commitPick(next) {
		if (!isValueControlled || sameValue(next, valueRef.current)) {
			setStartText(formatField(startOf(next), locale));
			setEndText(formatField(endOf(next), locale));
		}
		report(next);
	}
	function showMonth(year, month) {
		setView({
			year,
			month
		});
		setFocusedDate((prev) => toISO(year, month, Math.min(partsOf(prev).day, daysInMonth(year, month))));
	}
	function selectDay(iso) {
		if (isDisabled || dayDisabled(iso)) return;
		if (!range) {
			commitPick(iso);
			requestOpen(false);
			return;
		}
		if (pendingStart === void 0 || iso < pendingStart) {
			setPendingStart(iso);
			moveFocusTo(iso);
			return;
		}
		commitPick({
			start: pendingStart,
			end: iso
		});
		setPendingStart(void 0);
		requestOpen(false);
	}
	/** Empties the value (both ends), fires onChange(undefined) even when already empty, and stays open. */
	function clear() {
		if (isDisabled) return;
		setPendingStart(void 0);
		commitPick(void 0);
	}
	function handleTextChange(which, event) {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const raw = event.target.value;
		if (which === "start") setStartText(raw);
		else setEndText(raw);
		const texts = {
			...textsRef.current,
			[which]: raw
		};
		textsRef.current = texts;
		const current = valueRef.current;
		if (!range) {
			if (raw.trim() === "") {
				if (current !== void 0) report(void 0);
				return;
			}
			const iso = parseTyped(raw, pattern);
			if (iso === void 0 || iso === current) return;
			report(iso);
			showDate(iso);
			return;
		}
		if (texts.start.trim() === "" && texts.end.trim() === "") {
			if (current !== void 0) report(void 0);
			return;
		}
		const start = parseTyped(texts.start, pattern);
		const end = parseTyped(texts.end, pattern);
		const typed = which === "start" ? start : end;
		if (typed !== void 0) showDate(typed);
		if (start === void 0 || end === void 0) return;
		if (startOf(current) === start && endOf(current) === end) return;
		report({
			start,
			end
		});
	}
	function handleInputKeyDown(which, event) {
		onKeyDown?.(event);
		if (event.defaultPrevented || isDisabled || event.key !== "ArrowDown") return;
		event.preventDefault();
		if (open) {
			moveFocusTo(pendingStart ?? (which === "end" ? committedEnd ?? committedStart : committedStart) ?? todayISO());
			return;
		}
		openedFrom.current = which;
		requestOpen(true);
	}
	function handleInputBlur(event) {
		onBlur?.(event);
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	}
	const weekStart = firstDayOfWeek(locale);
	/**
	* Arrow movement: steps by `delta` days until an enabled day, turning pages as needed. `undefined`
	* (stay put) once the step passes min or max; without bounds, after ten years of disabled days.
	*/
	function stepEnabled(from, delta) {
		let candidate = from;
		for (let i = 0; i < 3660; i += 1) {
			candidate = addDays(candidate, delta);
			if (min !== void 0 && candidate < min || max !== void 0 && candidate > max) return void 0;
			if (!dayDisabled(candidate)) return candidate;
		}
	}
	function handleGridKeyDown(event) {
		const iso = event.target.getAttribute("data-date");
		if (!iso || event.altKey || event.ctrlKey || event.metaKey) return;
		const offset = (utcDate(iso).getUTCDay() - weekStart + 7) % 7;
		let next;
		switch (event.key) {
			case "ArrowRight":
				next = stepEnabled(iso, 1);
				break;
			case "ArrowLeft":
				next = stepEnabled(iso, -1);
				break;
			case "ArrowDown":
				next = stepEnabled(iso, 7);
				break;
			case "ArrowUp":
				next = stepEnabled(iso, -7);
				break;
			case "Home":
				next = addDays(iso, -offset);
				break;
			case "End":
				next = addDays(iso, 6 - offset);
				break;
			case "PageUp":
				next = addMonths(iso, event.shiftKey ? -12 : -1);
				break;
			case "PageDown":
				next = addMonths(iso, event.shiftKey ? 12 : 1);
				break;
			default: return;
		}
		event.preventDefault();
		moveFocusTo(next ?? iso);
	}
	function handleCalendarKeyDown(event) {
		if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
		const calendar = calendarRef.current;
		const target = event.target;
		if (!calendar || !(target instanceof HTMLElement) || !calendar.contains(target)) return;
		const stops = Array.from(calendar.querySelectorAll("button, input, select, [tabindex]")).filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && !element.closest("[hidden], [inert]"));
		const first = stops[0];
		const last = stops[stops.length - 1];
		if (!first || !last) return;
		const index = stops.findIndex((element) => element === target || element.contains(target));
		const next = event.shiftKey ? index <= 0 ? last : stops[index - 1] : index === -1 || index === stops.length - 1 ? first : stops[index + 1];
		event.preventDefault();
		next?.focus();
	}
	/**
	* Escape closes the calendar wherever the focus is, and returns it to the calendar button. The
	* Popover only hears the key when focus is inside its portaled panel — from the field itself (the
	* input, or the calendar button, which is the trigger and so never inside the panel) the keydown
	* reaches this root instead. Popover stops propagation on the Escape it handles, so exactly one of
	* the two runs.
	*/
	function handleRootKeyDown(event) {
		if (event.key !== "Escape" || !open || event.defaultPrevented) return;
		event.preventDefault();
		requestOpen(false);
		calendarButtonRef.current?.focus();
	}
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		error,
		min,
		max,
		range,
		locale,
		pattern
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		error,
		min,
		max,
		range,
		locale,
		pattern
	};
	useEffect(() => {
		if (!form) return void 0;
		const unregisterStart = form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latest.current.disabled ? void 0 : startOf(valueRef.current),
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const c = latest.current;
				if (c.error !== void 0 && c.error !== "") return c.error;
				const texts = c.range ? [textsRef.current.start, textsRef.current.end] : [textsRef.current.start];
				const empty = texts.map((text) => text.trim() === "");
				if (empty.every(Boolean)) return c.required ? interpolate$3(COPY$8.required, { label: c.label }) : null;
				if (texts.some((text, i) => !empty[i] && parseTyped(text, c.pattern) === void 0)) return interpolate$3(COPY$8.invalid, {
					label: c.label,
					pattern: c.pattern.text
				});
				if (empty.some(Boolean)) return c.required ? interpolate$3(COPY$8.required, { label: c.label }) : null;
				const current = valueRef.current;
				const start = startOf(current);
				const end = endOf(current);
				if (c.min !== void 0 && (start !== void 0 && start < c.min || end !== void 0 && end < c.min)) return interpolate$3(COPY$8.tooEarly, {
					label: c.label,
					min: formatField(c.min, c.locale)
				});
				if (c.max !== void 0 && (start !== void 0 && start > c.max || end !== void 0 && end > c.max)) return interpolate$3(COPY$8.tooLate, {
					label: c.label,
					max: formatField(c.max, c.locale)
				});
				if (start !== void 0 && end !== void 0 && end < start) return COPY$8.rangeOrder;
				return null;
			},
			focus: () => document.getElementById(id)?.focus()
		});
		const unregisterEnd = range ? form.register({
			name: `${name}-end`,
			id: endId,
			get label() {
				return `${latest.current.label}, ${COPY$8.endLabel}`;
			},
			getValue: () => latest.current.disabled ? void 0 : endOf(valueRef.current),
			isDisabled: () => latest.current.disabled,
			validate: () => null,
			focus: () => document.getElementById(endId)?.focus()
		}) : void 0;
		return () => {
			unregisterStart();
			unregisterEnd?.();
		};
	}, [
		form,
		name,
		id,
		endId,
		range
	]);
	const warnedLabel = useRef(false);
	useEffect(() => {
		if (isDev$5 && !label && !warnedLabel.current) {
			warnedLabel.current = true;
			console.warn("DatePicker: `label` is required; it is the field’s accessible name.");
		}
	}, [label]);
	const resolvedError = error ?? form?.errors[name];
	const hasError = resolvedError !== void 0 && resolvedError !== "";
	const describedBy = [description ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(" ") || void 0;
	const resolved = overrides ? resolveOverrides$1(overrides) : void 0;
	const classes = [
		"ds-date-picker",
		`ds-date-picker--${size}`,
		hasError ? "ds-date-picker--invalid" : null,
		isDisabled ? "ds-date-picker--disabled" : null
	].filter(Boolean).join(" ");
	const today = todayISO();
	const monthNameFormat = new Intl.DateTimeFormat(locale, {
		month: "long",
		timeZone: "UTC"
	});
	const monthNames = Array.from({ length: 12 }, (_, month) => monthNameFormat.format(new Date(Date.UTC(2e3, month, 1))));
	const shortWeekday = new Intl.DateTimeFormat(locale, {
		weekday: "short",
		timeZone: "UTC"
	});
	const longWeekday = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		timeZone: "UTC"
	});
	const weekdays = Array.from({ length: 7 }, (_, i) => {
		const date = new Date(Date.UTC(2e3, 0, 2 + (weekStart + i) % 7));
		return {
			short: shortWeekday.format(date),
			long: longWeekday.format(date)
		};
	});
	const fullDate = new Intl.DateTimeFormat(locale, {
		dateStyle: "full",
		timeZone: "UTC"
	});
	const monthOptions = monthNames.map((monthName, month) => ({
		value: String(month),
		label: monthName
	}));
	const currentYear = partsOf(today).year;
	const minYear = Math.min(min && parseISO(min) ? partsOf(min).year : currentYear - 100, view.year);
	const maxYear = Math.max(max && parseISO(max) ? partsOf(max).year : currentYear + 10, view.year);
	const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
		value: String(minYear + i),
		label: String(minYear + i)
	}));
	const firstOfMonth = toISO(view.year, view.month, 1);
	const gridStart = addDays(firstOfMonth, -((utcDate(firstOfMonth).getUTCDay() - weekStart + 7) % 7));
	const gridDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
	const rovingDate = gridDays.includes(focusedDate) ? focusedDate : firstOfMonth;
	const selectionStart = range ? pendingStart ?? committedStart : committedStart;
	const selectionEnd = range ? pendingStart !== void 0 ? void 0 : committedEnd : void 0;
	const gridLabel = interpolate$3(COPY$8.gridLabel, {
		label,
		month: monthNames[view.month] ?? "",
		year: String(view.year)
	});
	const inputProps = {
		type: "text",
		inputMode: "numeric",
		autoComplete: "off",
		placeholder: placeholder ?? pattern.text,
		className: "ds-date-picker__input",
		"data-part": "input",
		"aria-describedby": describedBy,
		"aria-invalid": hasError ? "true" : void 0,
		"aria-required": required ? "true" : void 0,
		"aria-disabled": isDisabled ? "true" : void 0,
		readOnly: isDisabled,
		onBlur: handleInputBlur
	};
	const calendarButton = /* @__PURE__ */ jsx(Button, {
		ref: calendarButtonRef,
		variant: "ghost",
		size,
		iconOnly: true,
		label: range ? COPY$8.openRange : COPY$8.open,
		leadingIcon: /* @__PURE__ */ jsx(Icon, {
			name: "calendar",
			inline: true
		}),
		disabled: isDisabled
	});
	return /* @__PURE__ */ jsxs("div", {
		ref,
		className: classes,
		"data-ds": "DatePicker",
		"data-ds-field": "",
		style: resolved?.style,
		onKeyDown: handleRootKeyDown,
		children: [
			/* @__PURE__ */ jsxs("label", {
				id: labelId,
				htmlFor: id,
				className: ["ds-date-picker__label", hideLabel ? "ds-date-picker__visually-hidden" : null].filter(Boolean).join(" "),
				"data-part": "label",
				children: [label, required ? COPY$8.requiredIndicator : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				size: "sm",
				tone: "muted",
				"data-part": "description",
				overrides: resolved?.helperOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-date-picker__field",
				"data-part": "field",
				children: [range ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsx("span", {
						id: startLabelId,
						className: "ds-date-picker__visually-hidden",
						children: COPY$8.startLabel
					}),
					/* @__PURE__ */ jsx("input", {
						...rest,
						...inputProps,
						id,
						name,
						value: startText,
						"aria-labelledby": `${labelId} ${startLabelId}`,
						onChange: (event) => handleTextChange("start", event),
						onKeyDown: (event) => handleInputKeyDown("start", event)
					}),
					/* @__PURE__ */ jsx("span", {
						className: "ds-date-picker__separator",
						"aria-hidden": "true",
						children: "–"
					}),
					/* @__PURE__ */ jsx("span", {
						id: endLabelId,
						className: "ds-date-picker__visually-hidden",
						children: COPY$8.endLabel
					}),
					/* @__PURE__ */ jsx("input", {
						...inputProps,
						id: endId,
						name: `${name}-end`,
						value: endText,
						"aria-labelledby": `${labelId} ${endLabelId}`,
						onChange: (event) => handleTextChange("end", event),
						onKeyDown: (event) => handleInputKeyDown("end", event)
					})
				] }) : /* @__PURE__ */ jsx("input", {
					...rest,
					...inputProps,
					id,
					name,
					value: startText,
					onChange: (event) => handleTextChange("start", event),
					onKeyDown: (event) => handleInputKeyDown("start", event)
				}), /* @__PURE__ */ jsx("span", {
					className: "ds-date-picker__calendar-button",
					"data-part": "calendarButton",
					children: /* @__PURE__ */ jsx(Popover, {
						trigger: calendarButton,
						open,
						placement: "bottom-start",
						dismissible: false,
						container,
						overrides: resolved?.popoverOverrides,
						onOpenChange: (next) => requestOpen(next),
						children: /* @__PURE__ */ jsx(FormContext.Provider, {
							value: null,
							children: /* @__PURE__ */ jsxs("div", {
								ref: calendarRef,
								className: "ds-date-picker__calendar",
								"data-part": "popover",
								style: resolved?.style,
								onKeyDown: handleCalendarKeyDown,
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "ds-date-picker__header",
										"data-part": "header",
										children: [
											/* @__PURE__ */ jsx("span", {
												"data-part": "prevMonthButton",
												children: /* @__PURE__ */ jsx(Button, {
													variant: "ghost",
													size: "sm",
													iconOnly: true,
													label: COPY$8.previousMonth,
													leadingIcon: /* @__PURE__ */ jsx(Icon, {
														name: "chevron-left",
														inline: true
													}),
													onClick: () => showMonth(view.month === 0 ? view.year - 1 : view.year, (view.month + 11) % 12)
												})
											}),
											/* @__PURE__ */ jsx("span", {
												className: "ds-date-picker__select",
												"data-part": "monthSelect",
												children: /* @__PURE__ */ jsx(Select, {
													label: COPY$8.month,
													name: `${name}-month`,
													hideLabel: true,
													size: "sm",
													options: monthOptions,
													value: String(view.month),
													overrides: resolved?.selectOverrides,
													onChange: (next) => showMonth(view.year, Number(next))
												})
											}),
											/* @__PURE__ */ jsx("span", {
												className: "ds-date-picker__select",
												"data-part": "yearSelect",
												children: /* @__PURE__ */ jsx(Select, {
													label: COPY$8.year,
													name: `${name}-year`,
													hideLabel: true,
													size: "sm",
													options: yearOptions,
													value: String(view.year),
													overrides: resolved?.selectOverrides,
													onChange: (next) => showMonth(Number(next), view.month)
												})
											}),
											/* @__PURE__ */ jsx("span", {
												"data-part": "nextMonthButton",
												children: /* @__PURE__ */ jsx(Button, {
													variant: "ghost",
													size: "sm",
													iconOnly: true,
													label: COPY$8.nextMonth,
													leadingIcon: /* @__PURE__ */ jsx(Icon, {
														name: "chevron-right",
														inline: true
													}),
													onClick: () => showMonth(view.month === 11 ? view.year + 1 : view.year, (view.month + 1) % 12)
												})
											})
										]
									}),
									/* @__PURE__ */ jsx("span", {
										id: gridLabelId,
										className: "ds-date-picker__visually-hidden",
										children: gridLabel
									}),
									/* @__PURE__ */ jsxs("table", {
										role: "grid",
										"aria-labelledby": gridLabelId,
										className: "ds-date-picker__grid",
										"data-part": "grid",
										onKeyDown: handleGridKeyDown,
										children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [showWeekNumbers ? /* @__PURE__ */ jsx("th", {
											scope: "col",
											abbr: COPY$8.weekNumber,
											className: "ds-date-picker__weekday",
											children: /* @__PURE__ */ jsx("span", {
												className: "ds-date-picker__visually-hidden",
												children: COPY$8.weekNumber
											})
										}) : null, weekdays.map((weekday) => /* @__PURE__ */ jsx("th", {
											scope: "col",
											abbr: weekday.long,
											className: "ds-date-picker__weekday",
											"data-part": "weekdayHeader",
											children: weekday.short
										}, weekday.long))] }) }), /* @__PURE__ */ jsx("tbody", { children: Array.from({ length: 6 }, (_, week) => {
											const days = gridDays.slice(week * 7, week * 7 + 7);
											const firstDay = days[0];
											return /* @__PURE__ */ jsxs("tr", { children: [showWeekNumbers ? /* @__PURE__ */ jsx("th", {
												scope: "row",
												className: "ds-date-picker__week-number",
												"data-part": "weekNumber",
												children: isoWeek(firstDay)
											}) : null, days.map((iso) => {
												const p = partsOf(iso);
												const outside = p.month !== view.month;
												const isToday = iso === today;
												const isEndpoint = iso === selectionStart || iso === selectionEnd;
												const inRange = selectionStart !== void 0 && selectionEnd !== void 0 && iso > selectionStart && iso < selectionEnd;
												const isSelected = isEndpoint || inRange;
												const unavailable = dayDisabled(iso);
												const status = [isToday ? COPY$8.todayLabel : null, isSelected ? COPY$8.selected : null].filter(Boolean).join(", ");
												const dayClasses = [
													"ds-date-picker__day",
													outside ? "ds-date-picker__day--outside" : null,
													isEndpoint ? "ds-date-picker__day--selected" : null,
													inRange ? "ds-date-picker__day--in-range" : null,
													isToday ? "ds-date-picker__day--today" : null
												].filter(Boolean).join(" ");
												return /* @__PURE__ */ jsx("td", {
													role: "gridcell",
													"aria-selected": isSelected ? "true" : void 0,
													children: /* @__PURE__ */ jsx("button", {
														type: "button",
														className: dayClasses,
														"data-part": "day",
														"data-date": iso,
														tabIndex: iso === rovingDate ? 0 : -1,
														"aria-current": isToday ? "date" : void 0,
														"aria-disabled": unavailable ? "true" : void 0,
														"aria-label": status ? `${fullDate.format(utcDate(iso))}, ${status}` : fullDate.format(utcDate(iso)),
														onClick: () => {
															setFocusedDate(iso);
															selectDay(iso);
														},
														children: p.day
													})
												}, iso);
											})] }, firstDay);
										}) })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "ds-date-picker__footer",
										"data-part": "footer",
										children: [/* @__PURE__ */ jsx("span", {
											"data-part": "todayButton",
											children: /* @__PURE__ */ jsx(Button, {
												variant: "ghost",
												size: "sm",
												label: COPY$8.today,
												disabled: dayDisabled(today),
												onClick: () => selectDay(today)
											})
										}), /* @__PURE__ */ jsx("span", {
											"data-part": "clearButton",
											children: /* @__PURE__ */ jsx(Button, {
												variant: "ghost",
												size: "sm",
												label: COPY$8.clear,
												onClick: clear
											})
										})]
									})
								]
							})
						})
					})
				})]
			}),
			hasError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				size: "sm",
				tone: "danger",
				"data-part": "errorMessage",
				overrides: resolved?.helperOverrides,
				children: resolvedError
			}) : null
		]
	});
}
//#endregion
//#region src/Toolbar.tsx
const OVERRIDE_HOOK$4 = {
	border: "--ds-toolbar-border",
	borderWidth: "--ds-toolbar-border-width",
	radius: "--ds-toolbar-radius",
	paddingInline: "--ds-toolbar-padding-inline",
	paddingBlock: "--ds-toolbar-padding-block",
	itemGap: "--ds-toolbar-item-gap",
	groupGap: "--ds-toolbar-group-gap",
	separatorLength: "--ds-toolbar-separator-length",
	fadeWidth: "--ds-toolbar-fade-width"
};
function overridesToStyle$4(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$4[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
const COPY$7 = { more: "More" };
const FOCUSABLE_SELECTOR$3 = [
	"button:not([role=\"radio\"]):not(:disabled)",
	"[role=\"radio\"][aria-checked=\"true\"]:not(:disabled)",
	"select:not(:disabled)",
	"input:not([type=\"hidden\"]):not([type=\"radio\"]):not(:disabled)",
	"input[type=\"radio\"]:checked:not(:disabled)",
	"textarea:not(:disabled)",
	"[tabindex]:not(button):not(input):not(select):not(textarea):not([role=\"radio\"])"
].join(",");
function isControlDisabled(element) {
	return element.getAttribute("aria-disabled") === "true";
}
function getControls(container) {
	return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR$3));
}
function applyRovingTabIndex(controls, current) {
	for (const control of controls) {
		const next = control === current ? 0 : -1;
		if (control.tabIndex !== next) control.tabIndex = next;
	}
}
/** Expands Fragments so `<>…</>` children still yield one entry per control or group. */
function flattenChildren(children) {
	const result = [];
	for (const child of Children.toArray(children)) {
		if (!isValidElement(child)) continue;
		if (child.type === Fragment) result.push(...flattenChildren(child.props.children));
		else result.push(child);
	}
	return result;
}
const SIZED_COMPONENTS = /* @__PURE__ */ new Map([
	[Button, /* @__PURE__ */ new Set(["sm", "md"])],
	[SegmentedControl, /* @__PURE__ */ new Set(["sm", "md"])],
	[Select, /* @__PURE__ */ new Set(["sm", "md"])],
	[Search, /* @__PURE__ */ new Set(["md"])]
]);
/** Applies the toolbar's `size` to a sized package control that did not set its own. */
function withSize(element, size, key) {
	const props = element.props;
	if (!SIZED_COMPONENTS.get(element.type)?.has(size) || props.size !== void 0) return key === void 0 ? element : cloneElement(element, { key });
	return cloneElement(element, key === void 0 ? { size } : {
		size,
		key
	});
}
function buildEntries(children) {
	return flattenChildren(children).map((element, index) => {
		const key = element.key !== null ? String(element.key) : `ds-toolbar-entry-${index}`;
		if (element.type === ToolbarGroup) {
			const groupChildren = flattenChildren(element.props.children);
			return {
				key,
				kind: "group",
				element,
				collapsible: groupChildren.length > 0 && groupChildren.every((child) => child.type === Button)
			};
		}
		return {
			key,
			kind: "control",
			element,
			collapsible: element.type === Button
		};
	});
}
function actionFromButton(element, id, warned) {
	const props = element.props;
	if (props.overflowLabel === void 0 && process.env.NODE_ENV !== "production" && !warned.has(id)) {
		warned.add(id);
		console.warn(`Toolbar: a collapsed Button ("${props.label ?? id}") has no overflowLabel; its label is used in the overflow Menu.`);
	}
	return {
		id,
		label: props.overflowLabel ?? props.label ?? id,
		disabled: props.disabled === true
	};
}
/** A text-entry control keeps ArrowLeft, ArrowRight, Home and End for its caret. */
function isTextEntry(element) {
	if (element instanceof HTMLTextAreaElement || element.isContentEditable) return true;
	if (!(element instanceof HTMLInputElement)) return false;
	return ![
		"button",
		"checkbox",
		"color",
		"file",
		"image",
		"radio",
		"range",
		"reset",
		"submit"
	].includes(element.type);
}
function readPx(value) {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
/** Groups related controls inside a Toolbar; a Divider is drawn between adjacent groups. */
function ToolbarGroup({ ref, label, children, ...rest }) {
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		role: "group",
		"aria-label": label,
		"data-ds": "ToolbarGroup",
		"data-part": "group",
		className: "ds-toolbar__group",
		children
	});
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
function Toolbar({ ref, label, children, orientation = "horizontal", overflow = "menu", size = "md", density = "comfortable", overrides, onFocus, onKeyDown, ...rest }) {
	const containerRef = useRef(null);
	const currentRef = useRef(null);
	const entryNodesRef = useRef(/* @__PURE__ */ new Map());
	const probeRef = useRef(null);
	const observedWidthRef = useRef(null);
	const warnedRef = useRef(/* @__PURE__ */ new Set());
	const [fade, setFade] = useState({
		start: false,
		end: false
	});
	const effectiveOverflow = overflow === "menu" && orientation === "vertical" ? "scroll" : overflow;
	const isMenuOverflow = effectiveOverflow === "menu";
	const [hiddenKeys, setHiddenKeys] = useState(null);
	const setContainerRef = (node) => {
		containerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const entries = buildEntries(children);
	const entriesKey = entries.map((entry) => `${entry.kind}:${entry.key}:${entry.collapsible ? 1 : 0}`).join("|");
	useLayoutEffect(() => {
		if (isMenuOverflow) setHiddenKeys(null);
	}, [
		isMenuOverflow,
		entriesKey,
		size,
		density
	]);
	useLayoutEffect(() => {
		if (!isMenuOverflow) return void 0;
		const container = containerRef.current;
		if (!container) return void 0;
		if (hiddenKeys === null) {
			const computed = getComputedStyle(container);
			const available = container.clientWidth - readPx(computed.paddingInlineStart || computed.paddingLeft) - readPx(computed.paddingInlineEnd || computed.paddingRight);
			const itemGap = readPx(computed.columnGap);
			const widths = /* @__PURE__ */ new Map();
			for (const entry of entries) widths.set(entry.key, entryNodesRef.current.get(entry.key)?.offsetWidth ?? 0);
			const separatorWidth = container.querySelector(":scope > [data-part=\"separator\"]")?.offsetWidth ?? 0;
			const widthOf = (visible) => {
				let total = 0;
				visible.forEach((entry, index) => {
					if (index > 0) total += itemGap;
					const previous = visible[index - 1];
					if (previous && previous.kind === "group" && entry.kind === "group") total += separatorWidth + itemGap;
					total += widths.get(entry.key) ?? 0;
				});
				return total;
			};
			const hidden = /* @__PURE__ */ new Set();
			if (widthOf(entries) > available) {
				const reserve = (probeRef.current?.offsetWidth ?? 0) + itemGap;
				for (let i = entries.length - 1; i >= 0; i--) {
					if (widthOf(entries.filter((entry) => !hidden.has(entry.key))) + reserve <= available) break;
					const entry = entries[i];
					if (entry.collapsible) hidden.add(entry.key);
				}
			}
			setHiddenKeys(entries.filter((entry) => hidden.has(entry.key)).map((entry) => entry.key));
			return;
		}
		if (typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) return;
			const width = entry.contentRect.width;
			if (observedWidthRef.current === width) return;
			const isFirst = observedWidthRef.current === null;
			observedWidthRef.current = width;
			if (!isFirst) setHiddenKeys(null);
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, [isMenuOverflow, hiddenKeys]);
	const isScrollOverflow = effectiveOverflow === "scroll";
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!isScrollOverflow || !container) return void 0;
		const vertical = orientation === "vertical";
		const check = () => {
			const offset = vertical ? container.scrollTop : Math.abs(container.scrollLeft);
			const hiddenLength = vertical ? container.scrollHeight - container.clientHeight : container.scrollWidth - container.clientWidth;
			const start = offset > 0;
			const end = offset < hiddenLength - 1;
			setFade((last) => last.start === start && last.end === end ? last : {
				start,
				end
			});
		};
		check();
		container.addEventListener("scroll", check, { passive: true });
		const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
		observer?.observe(container);
		for (const child of Array.from(container.children)) observer?.observe(child);
		return () => {
			container.removeEventListener("scroll", check);
			observer?.disconnect();
		};
	}, [
		isScrollOverflow,
		orientation,
		entriesKey
	]);
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return void 0;
		const sync = () => {
			const controls = getControls(container);
			if (controls.length === 0) return;
			let current = currentRef.current;
			if (!current || !controls.includes(current)) {
				current = controls.find((control) => !isControlDisabled(control)) ?? controls[0];
				currentRef.current = current;
			}
			applyRovingTabIndex(controls, current);
		};
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(container, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				"disabled",
				"aria-disabled",
				"aria-checked",
				"tabindex"
			]
		});
		return () => observer.disconnect();
	});
	const indexOfTarget = (controls, target) => controls.findIndex((control) => control === target || control.contains(target));
	const handleFocus = (event) => {
		onFocus?.(event);
		const container = containerRef.current;
		if (!container) return;
		const controls = getControls(container);
		const index = indexOfTarget(controls, event.target);
		if (index === -1) return;
		currentRef.current = controls[index];
		applyRovingTabIndex(controls, currentRef.current);
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
		const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
		const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
		if (event.key !== nextKey && event.key !== prevKey && event.key !== "Home" && event.key !== "End") return;
		const container = containerRef.current;
		if (!container) return;
		const controls = getControls(container);
		const currentIndex = indexOfTarget(controls, event.target);
		if (currentIndex === -1) return;
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && isTextEntry(event.target)) return;
		const enabledIndexes = controls.map((control, index) => isControlDisabled(control) ? -1 : index).filter((index) => index !== -1);
		let target;
		if (event.key === nextKey) target = enabledIndexes.find((index) => index > currentIndex);
		else if (event.key === prevKey) target = enabledIndexes.filter((index) => index < currentIndex).pop();
		else if (event.key === "Home") target = enabledIndexes[0];
		else target = enabledIndexes[enabledIndexes.length - 1];
		if (target === void 0 || target === currentIndex) return;
		event.preventDefault();
		const control = controls[target];
		currentRef.current = control;
		applyRovingTabIndex(controls, control);
		control.focus();
	};
	const hidden = new Set(isMenuOverflow && hiddenKeys !== null ? hiddenKeys : []);
	const visibleEntries = entries.filter((entry) => !hidden.has(entry.key));
	const hiddenEntries = entries.filter((entry) => hidden.has(entry.key));
	const overflowButtons = /* @__PURE__ */ new Map();
	const menuItems = [];
	for (const entry of hiddenEntries) if (entry.kind === "group") {
		const groupProps = entry.element.props;
		const actions = flattenChildren(groupProps.children).map((child, index) => {
			const id = `${entry.key}-${index}`;
			overflowButtons.set(id, child);
			return actionFromButton(child, id, warnedRef.current);
		});
		if (groupProps.label) menuItems.push({
			group: groupProps.label,
			items: actions
		});
		else {
			if (menuItems.length > 0) menuItems.push({ separator: true });
			menuItems.push(...actions);
		}
	} else {
		overflowButtons.set(entry.key, entry.element);
		menuItems.push(actionFromButton(entry.element, entry.key, warnedRef.current));
	}
	const handleOverflowAction = (id) => {
		const onClick = (overflowButtons.get(id)?.props)?.onClick;
		onClick?.(void 0);
	};
	const separatorOrientation = orientation === "vertical" ? "horizontal" : "vertical";
	const renderEntry = (entry) => {
		const element = entry.kind === "group" ? cloneElement(entry.element, {
			key: entry.key,
			children: flattenChildren(entry.element.props.children).map((child, index) => withSize(child, size, child.key !== null ? String(child.key) : `ds-toolbar-control-${index}`))
		}) : withSize(entry.element, size, entry.key);
		if (!isMenuOverflow) return element;
		return /* @__PURE__ */ jsx("span", {
			className: "ds-toolbar__entry",
			ref: (node) => {
				if (node) entryNodesRef.current.set(entry.key, node);
				else entryNodesRef.current.delete(entry.key);
			},
			children: element
		}, entry.key);
	};
	const content = [];
	visibleEntries.forEach((entry, index) => {
		const previous = visibleEntries[index - 1];
		if (previous && previous.kind === "group" && entry.kind === "group") content.push(/* @__PURE__ */ jsx("span", {
			className: "ds-toolbar__separator",
			"data-part": "separator",
			children: /* @__PURE__ */ jsx(Divider, {
				orientation: separatorOrientation,
				spacing: "none"
			})
		}, `${entry.key}-separator`));
		content.push(renderEntry(entry));
	});
	const classes = [
		"ds-toolbar",
		`ds-toolbar--${orientation}`,
		`ds-toolbar--overflow-${effectiveOverflow}`,
		`ds-toolbar--${density}`,
		isScrollOverflow && fade.start ? "ds-toolbar--fade-start" : "",
		isScrollOverflow && fade.end ? "ds-toolbar--fade-end" : ""
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: setContainerRef,
		role: "toolbar",
		"aria-label": label,
		"aria-orientation": orientation,
		"data-ds": "Toolbar",
		"data-part": "container",
		className: classes,
		style: overrides ? overridesToStyle$4(overrides) : void 0,
		onFocus: handleFocus,
		onKeyDown: handleKeyDown,
		children: [
			content,
			isMenuOverflow ? /* @__PURE__ */ jsx("span", {
				ref: probeRef,
				className: "ds-toolbar__reserve",
				"aria-hidden": "true"
			}) : null,
			isMenuOverflow && menuItems.length > 0 ? /* @__PURE__ */ jsx(Menu, {
				label: COPY$7.more,
				items: menuItems,
				triggerVariant: "ghost",
				triggerIcon: "ellipsis",
				iconOnly: true,
				"data-part": "overflowMenu",
				onAction: handleOverflowAction
			}) : null
		]
	});
}
//#endregion
//#region src/Carousel.tsx
/** Copy from the component doc, used verbatim. */
const COPY$6 = {
	previous: "Previous slide",
	next: "Next slide",
	play: "Start automatic rotation",
	pause: "Stop automatic rotation",
	slideLabel: "{n} of {total}",
	pickerLabel: "Choose a slide",
	goTo: "Go to slide {n}",
	announce: "Slide {n} of {total}"
};
/** constants.minInterval: the floor `interval` is raised to, so autoplay never outpaces reading. */
const MIN_INTERVAL = 5e3;
/** The share of a slide that must be visible for it to count as visible. */
const VISIBLE_THRESHOLD = .6;
/** layout.maxWidth.prose, read from the token at measurement time rather than its value today. */
const PROSE_WIDTH_VAR = "--layout-max-width-prose";
const OVERRIDE_HOOK$3 = {
	slideGap: "--ds-carousel-slide-gap",
	controlOffset: "--ds-carousel-control-offset",
	controlRadius: "--ds-carousel-control-radius",
	controlShadow: "--ds-carousel-control-shadow",
	pickerGap: "--ds-carousel-picker-gap",
	pickerOffset: "--ds-carousel-picker-offset",
	dotSize: "--ds-carousel-dot-size",
	dotRadius: "--ds-carousel-dot-radius",
	radius: "--ds-carousel-radius",
	tabFontSize: "--ds-carousel-tab-font-size",
	tabFontWeight: "--ds-carousel-tab-font-weight",
	tabLineHeight: "--ds-carousel-tab-line-height",
	tabPaddingBlock: "--ds-carousel-tab-padding-block",
	tabPaddingInline: "--ds-carousel-tab-padding-inline",
	fontFamily: "--ds-carousel-font-family",
	transition: "--ds-carousel-transition"
};
function overridesToStyle$3(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		if (!(binding in OVERRIDE_HOOK$3)) continue;
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$3[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$4 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function fill(template, params) {
	return template.replace(/\{(\w+)\}/g, (match, key) => key in params ? String(params[key]) : match);
}
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange) {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
	const list = window.matchMedia(REDUCED_MOTION_QUERY);
	list.addEventListener("change", onChange);
	return () => list.removeEventListener("change", onChange);
}
/** jsdom (and older browsers) have no `matchMedia`; that is "no preference". */
function getReducedMotion() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false;
}
function useReducedMotion() {
	return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}
/** Resolves a length custom property to pixels (px or rem); null when it cannot be read. */
function readLengthVar(element, name) {
	const raw = getComputedStyle(element).getPropertyValue(name).trim();
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) return null;
	if (raw.endsWith("rem")) {
		const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		return Number.isFinite(rootSize) ? value * rootSize : null;
	}
	return raw.endsWith("px") || /^[\d.]+$/.test(raw) ? value : null;
}
const SlideContext = createContext(null);
/** One slide — a direct child of `Carousel`, one per slide, in order. */
function CarouselSlide({ ref, label: _label, children, ...rest }) {
	const slide = use(SlideContext);
	const setRefs = (node) => {
		slide?.register(node);
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref: setRefs,
		id: slide?.id,
		role: slide?.role ?? "group",
		"aria-roledescription": "slide",
		"aria-label": slide?.label,
		"aria-hidden": slide?.hidden ? "true" : void 0,
		inert: slide?.hidden ?? false,
		"data-ds": "CarouselSlide",
		"data-part": "slide",
		className: "ds-carousel__slide",
		children
	});
}
/** `Children.toArray` keeps fragments whole; slides written inside `<>…</>` are unwrapped here. */
function collectSlides(children) {
	const slides = [];
	Children.forEach(children, (child) => {
		if (!isValidElement(child)) return;
		if (child.type === Fragment) slides.push(...collectSlides(child.props.children));
		else slides.push(child);
	});
	return slides;
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
function Carousel({ ref, label, children, perView = 1, loop = false, autoplay = false, interval = 6e3, picker = "dots", activeIndex, snap = true, overrides, onChange, onPointerEnter, onPointerLeave, onFocus, onBlur, onTouchStart, onTouchEnd, onTouchCancel, ...rest }) {
	const baseId = `ds-carousel${useId()}`;
	const slides = collectSlides(children);
	const total = slides.length;
	const requestedPerView = Math.max(1, Math.floor(perView));
	const [narrow, setNarrow] = useState(null);
	const pageSize = Math.min(narrow ? 1 : requestedPerView, Math.max(total, 1));
	const lastStart = Math.max(total - pageSize, 0);
	const isControlled = activeIndex !== void 0;
	const [internalIndex, setInternalIndex] = useState(0);
	const current = Math.min(Math.max(isControlled ? Math.floor(activeIndex) : internalIndex, 0), lastStart);
	const reducedMotion = useReducedMotion();
	const effectiveInterval = Math.max(interval, MIN_INTERVAL);
	const [stopped, setStopped] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [touched, setTouched] = useState(false);
	const canRotate = autoplay && !reducedMotion;
	const playing = canRotate && !stopped && !(total <= pageSize || !loop && current >= lastStart);
	const rotating = playing && !hovered && !focused && !touched;
	const [announcement, setAnnouncement] = useState("");
	const [pickerFocus, setPickerFocus] = useState(null);
	const [swipeTick, setSwipeTick] = useState(0);
	const rootRef = useRef(null);
	const viewportRef = useRef(null);
	const slideNodes = useRef([]);
	const pickerNodes = useRef([]);
	const prevButtonRef = useRef(null);
	const nextButtonRef = useRef(null);
	const playButtonRef = useRef(null);
	const lastScrolledTo = useRef(null);
	const userScroll = useRef(false);
	const firstVisible = useRef(null);
	const warnedInterval = useRef(false);
	const warnedLabel = useRef(false);
	useEffect(() => {
		if (isDev$4 && autoplay && interval < MIN_INTERVAL && !warnedInterval.current) {
			warnedInterval.current = true;
			console.warn(`Carousel: \`interval\` ${interval}ms is below the ${MIN_INTERVAL}ms minimum; using ${MIN_INTERVAL}ms.`);
		}
	}, [autoplay, interval]);
	const missingLabel = picker === "tabs" && slides.some((slide) => !slide.props.label);
	useEffect(() => {
		if (isDev$4 && missingLabel && !warnedLabel.current) {
			warnedLabel.current = true;
			console.warn("Carousel: every CarouselSlide needs a `label`; the tab falls back to \"Go to slide {n}\".");
		}
	}, [missingLabel]);
	const goTo = (index, reason) => {
		if (total === 0) return;
		const next = Math.min(Math.max(index, 0), lastStart);
		if (next === current) return;
		if (!isControlled) setInternalIndex(next);
		onChange?.(next, reason);
		if (reason !== "autoplay") setAnnouncement(fill(COPY$6.announce, {
			n: next + 1,
			total
		}));
	};
	const latest = useRef({
		goTo,
		current,
		lastStart
	});
	latest.current = {
		goTo,
		current,
		lastStart
	};
	const prevDisabled = total <= pageSize || !loop && current <= 0;
	const nextDisabled = total <= pageSize || !loop && current >= lastStart;
	const handleNext = () => {
		if (nextDisabled) return;
		goTo(current >= lastStart ? 0 : Math.min(current + pageSize, lastStart), "next");
	};
	const handlePrev = () => {
		if (prevDisabled) return;
		goTo(current <= 0 ? lastStart : Math.max(current - pageSize, 0), "prev");
	};
	const forwardClick = (buttonRef) => (event) => {
		const button = buttonRef.current;
		if (!button || button.contains(event.target)) return;
		button.click();
	};
	const togglePlay = () => {
		if (playing) {
			setStopped(true);
			return;
		}
		setStopped(false);
		setHovered(false);
		setFocused(false);
		setTouched(false);
		if (!loop && total > pageSize && current >= lastStart) goTo(0, "autoplay");
	};
	const handlePickerKeyDown = (event) => {
		if (total === 0) return;
		const from = pickerFocus ?? current;
		let target;
		switch (event.key) {
			case "ArrowRight":
				target = (from + 1) % total;
				break;
			case "ArrowLeft":
				target = (from - 1 + total) % total;
				break;
			case "Home":
				target = 0;
				break;
			case "End":
				target = total - 1;
				break;
			default: return;
		}
		event.preventDefault();
		goTo(target, "picker");
		setPickerFocus(target);
		pickerNodes.current[target]?.focus();
	};
	useEffect(() => {
		if (!rotating) return void 0;
		const id = window.setTimeout(() => {
			const { goTo: move, current: from, lastStart: end } = latest.current;
			move(from >= end ? 0 : Math.min(from + pageSize, end), "autoplay");
		}, effectiveInterval);
		return () => window.clearTimeout(id);
	}, [
		rotating,
		effectiveInterval,
		current,
		pageSize
	]);
	useEffect(() => {
		const viewport = viewportRef.current;
		const slide = slideNodes.current[current];
		if (!viewport || !slide) return;
		if (lastScrolledTo.current === current) return;
		const isFirstScroll = lastScrolledTo.current === null;
		lastScrolledTo.current = current;
		if (typeof viewport.scrollBy !== "function") return;
		const viewportRect = viewport.getBoundingClientRect();
		const slideRect = slide.getBoundingClientRect();
		const delta = getComputedStyle(viewport).direction === "rtl" ? slideRect.right - viewportRect.right : slideRect.left - viewportRect.left;
		if (delta === 0) return;
		userScroll.current = false;
		viewport.scrollBy({
			left: delta,
			behavior: reducedMotion || isFirstScroll ? "instant" : "smooth"
		});
	}, [
		current,
		reducedMotion,
		swipeTick
	]);
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return void 0;
		const settle = () => {
			const first = firstVisible.current;
			if (!userScroll.current || first === null) return;
			const { goTo: move, current: from, lastStart: end } = latest.current;
			const index = Math.min(first, end);
			lastScrolledTo.current = index;
			if (index !== from) {
				move(index, "swipe");
				setSwipeTick((tick) => tick + 1);
			}
		};
		const hasScrollEnd = "onscrollend" in viewport;
		if (hasScrollEnd) viewport.addEventListener("scrollend", settle);
		const ratios = /* @__PURE__ */ new Map();
		const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
			for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
			const first = slideNodes.current.findIndex((node) => node !== null && (ratios.get(node) ?? 0) >= VISIBLE_THRESHOLD);
			if (first === -1) return;
			firstVisible.current = first;
			if (!hasScrollEnd) settle();
		}, {
			root: viewport,
			threshold: VISIBLE_THRESHOLD
		});
		if (observer) {
			for (const node of slideNodes.current) if (node) observer.observe(node);
		}
		return () => {
			if (hasScrollEnd) viewport.removeEventListener("scrollend", settle);
			observer?.disconnect();
		};
	}, [total]);
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport || typeof ResizeObserver === "undefined") return void 0;
		let lastWidth = -1;
		const observer = new ResizeObserver(() => {
			const width = viewport.clientWidth;
			if (width === lastWidth || width === 0) return;
			lastWidth = width;
			const prose = readLengthVar(viewport, PROSE_WIDTH_VAR);
			if (prose === null) return;
			const next = width <= prose;
			setNarrow((previous) => previous === next ? previous : next);
		});
		observer.observe(viewport);
		return () => observer.disconnect();
	}, []);
	const setRootRef = (node) => {
		rootRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (!rootRef.current?.contains(event.relatedTarget)) setFocused(false);
	};
	const markUserScroll = () => {
		userScroll.current = true;
	};
	const classes = ["ds-carousel", snap ? null : "ds-carousel--no-snap"].filter(Boolean).join(" ");
	const rootStyle = {
		"--ds-carousel-per-view": requestedPerView,
		...overrides ? overridesToStyle$3(overrides) : null
	};
	const slideId = (index) => `${baseId}-slide-${index}`;
	const tabStop = pickerFocus !== null && pickerFocus >= current && pickerFocus < current + pageSize ? pickerFocus : current;
	const onCurrentPage = (index) => index >= current && index < current + pageSize;
	const pickerItemRef = (index) => (node) => {
		pickerNodes.current[index] = node;
	};
	return /* @__PURE__ */ jsxs("section", {
		...rest,
		ref: setRootRef,
		role: "region",
		"aria-roledescription": "carousel",
		"aria-label": label,
		"data-ds": "Carousel",
		"data-part": "region",
		className: classes,
		style: rootStyle,
		onPointerEnter: (event) => {
			onPointerEnter?.(event);
			if (event.pointerType !== "touch") setHovered(true);
		},
		onPointerLeave: (event) => {
			onPointerLeave?.(event);
			setHovered(false);
		},
		onFocus: (event) => {
			onFocus?.(event);
			setFocused(true);
		},
		onBlur: handleBlur,
		onTouchStart: (event) => {
			onTouchStart?.(event);
			setTouched(true);
		},
		onTouchEnd: (event) => {
			onTouchEnd?.(event);
			setTouched(false);
		},
		onTouchCancel: (event) => {
			onTouchCancel?.(event);
			setTouched(false);
		},
		children: [
			canRotate ? /* @__PURE__ */ jsx("span", {
				className: "ds-carousel__play",
				"data-part": "playButton",
				onClick: forwardClick(playButtonRef),
				children: /* @__PURE__ */ jsx(Button, {
					ref: playButtonRef,
					variant: "secondary",
					label: playing ? COPY$6.pause : COPY$6.play,
					onClick: togglePlay
				})
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-carousel__stage",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ds-carousel__control-surface ds-carousel__control-surface--prev",
						"data-part": "controlSurface",
						children: /* @__PURE__ */ jsx("span", {
							className: "ds-carousel__control",
							"data-part": "prevButton",
							onClick: forwardClick(prevButtonRef),
							children: /* @__PURE__ */ jsx(Button, {
								ref: prevButtonRef,
								variant: "secondary",
								iconOnly: true,
								label: COPY$6.previous,
								leadingIcon: /* @__PURE__ */ jsx(Icon, {
									name: "chevron-left",
									inline: true
								}),
								disabled: prevDisabled,
								"aria-controls": `${baseId}-track`,
								onClick: handlePrev
							})
						})
					}),
					/* @__PURE__ */ jsx("span", {
						className: "ds-carousel__control-surface ds-carousel__control-surface--next",
						"data-part": "controlSurface",
						children: /* @__PURE__ */ jsx("span", {
							className: "ds-carousel__control",
							"data-part": "nextButton",
							onClick: forwardClick(nextButtonRef),
							children: /* @__PURE__ */ jsx(Button, {
								ref: nextButtonRef,
								variant: "secondary",
								iconOnly: true,
								label: COPY$6.next,
								leadingIcon: /* @__PURE__ */ jsx(Icon, {
									name: "chevron-right",
									inline: true
								}),
								disabled: nextDisabled,
								"aria-controls": `${baseId}-track`,
								onClick: handleNext
							})
						})
					}),
					picker === "dots" ? /* @__PURE__ */ jsx("div", {
						role: "group",
						"aria-label": COPY$6.pickerLabel,
						className: "ds-carousel__picker",
						"data-part": "picker",
						onKeyDown: handlePickerKeyDown,
						children: slides.map((slide, index) => /* @__PURE__ */ jsx("button", {
							ref: pickerItemRef(index),
							type: "button",
							"aria-label": fill(COPY$6.goTo, { n: index + 1 }),
							"aria-current": onCurrentPage(index) ? "true" : void 0,
							"aria-controls": slideId(index),
							tabIndex: index === tabStop ? 0 : -1,
							className: "ds-carousel__dot",
							"data-part": "pickerItem",
							onFocus: () => setPickerFocus(index),
							onClick: () => goTo(index, "picker"),
							children: /* @__PURE__ */ jsx("span", {
								className: "ds-carousel__dot-mark",
								"aria-hidden": "true"
							})
						}, slide.key ?? index))
					}) : null,
					picker === "tabs" ? /* @__PURE__ */ jsx("div", {
						role: "tablist",
						"aria-label": COPY$6.pickerLabel,
						className: "ds-carousel__picker",
						"data-part": "picker",
						onKeyDown: handlePickerKeyDown,
						children: slides.map((slide, index) => /* @__PURE__ */ jsx("button", {
							ref: pickerItemRef(index),
							type: "button",
							role: "tab",
							"aria-selected": index === current ? "true" : "false",
							"aria-controls": slideId(index),
							tabIndex: index === tabStop ? 0 : -1,
							className: "ds-carousel__tab",
							"data-part": "pickerItem",
							onFocus: () => setPickerFocus(index),
							onClick: () => goTo(index, "picker"),
							children: slide.props.label || fill(COPY$6.goTo, { n: index + 1 })
						}, slide.key ?? index))
					}) : null,
					/* @__PURE__ */ jsx("div", {
						ref: viewportRef,
						tabIndex: 0,
						className: "ds-carousel__viewport",
						"data-part": "viewport",
						onPointerDown: markUserScroll,
						onTouchStart: markUserScroll,
						onWheel: markUserScroll,
						children: /* @__PURE__ */ jsx("div", {
							id: `${baseId}-track`,
							className: "ds-carousel__track",
							"data-part": "track",
							children: slides.map((slide, index) => /* @__PURE__ */ jsx(SlideContext, {
								value: {
									id: slideId(index),
									role: picker === "tabs" ? "tabpanel" : "group",
									label: fill(COPY$6.slideLabel, {
										n: index + 1,
										total
									}),
									hidden: !onCurrentPage(index),
									register: (node) => {
										slideNodes.current[index] = node;
									}
								},
								children: slide
							}, slide.key ?? index))
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-carousel__live",
				"data-part": "liveRegion",
				"aria-live": rotating ? "off" : "polite",
				"aria-atomic": "true",
				children: announcement
			})
		]
	});
}
//#endregion
//#region src/Table.tsx
/** copy.* — used verbatim. `sortToolbarLabel` and `cellLabel` belong to the native stacked form. */
const COPY$5 = {
	sortAscending: "Sort by {column}, ascending",
	sortDescending: "Sort by {column}, descending",
	sortedAnnouncement: "Sorted by {column}, {direction}",
	selectAll: "Select all rows",
	selectRow: "Select {rowName}",
	selectedCount: "{count} of {total} selected",
	actions: "Actions",
	empty: "Nothing to show.",
	loading: "Loading",
	scrollHint: "Scroll sideways to see more columns",
	rowCount: {
		one: "{count} row",
		other: "{count} rows"
	}
};
/** Root CSS hooks. The caption bindings are forwarded to the composed Heading's own overrides instead. */
const OVERRIDE_HOOK$2 = {
	headerWeight: "--ds-table-header-weight",
	headerSize: "--ds-table-header-size",
	headerBorder: "--ds-table-header-border",
	headerBorderWidth: "--ds-table-header-border-width",
	headerShadow: "--ds-table-header-shadow",
	rowBorder: "--ds-table-row-border",
	rowBorderWidth: "--ds-table-row-border-width",
	rowHover: "--ds-table-row-hover",
	cellPaddingInline: "--ds-table-cell-padding-inline",
	cellPaddingBlock: "--ds-table-cell-padding-block",
	cellGap: "--ds-table-cell-gap",
	stackedRowInset: "--ds-table-stacked-row-inset",
	stackedRowGap: "--ds-table-stacked-row-gap",
	stackedBlockGap: "--ds-table-stacked-block-gap",
	stackedLabelSize: "--ds-table-stacked-label-size",
	stackedLabelWeight: "--ds-table-stacked-label-weight",
	stackedRowRadius: "--ds-table-stacked-row-radius",
	stickyColumnShadow: "--ds-table-sticky-column-shadow",
	scrollFade: "--ds-table-scroll-fade",
	fontFamily: "--ds-table-font-family",
	fontSize: "--ds-table-font-size",
	lineHeight: "--ds-table-line-height",
	numericFont: "--ds-table-numeric-font",
	transition: "--ds-table-transition"
};
function overridesToStyle$2(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$2[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
const warned = /* @__PURE__ */ new Set();
function warnOnce(message) {
	if (process.env.NODE_ENV !== "production" && !warned.has(message)) {
		warned.add(message);
		console.warn(message);
	}
}
/** localeCompare (numeric) for strings, subtraction for numbers; missing values sort last. */
function compareValues$2(a, b) {
	if (a === void 0 || a === null) return b === void 0 || b === null ? 0 : 1;
	if (b === void 0 || b === null) return -1;
	if (typeof a === "number" && typeof b === "number") return a - b;
	return String(a).localeCompare(String(b), void 0, { numeric: true });
}
function textOf$2(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function joinClasses$2(...names) {
	return names.filter(Boolean).join(" ");
}
/** The document language for plural selection; the runtime default when the page declares none. */
function pageLocale() {
	return typeof document !== "undefined" && document.documentElement.lang ? document.documentElement.lang : void 0;
}
/**
* A built length token in pixels. The arrow-key scroll step reads `space.10` from the stylesheet,
* and a theme may build its space scale in either unit, so px and rem are both parsed.
*/
function lengthToPixels(value, element) {
	const text = value.trim();
	const amount = Number.parseFloat(text);
	if (!Number.isFinite(amount)) return NaN;
	if (!text.endsWith("rem")) return amount;
	const root = Number.parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize);
	return Number.isFinite(root) ? amount * root : NaN;
}
/**
* Table — Design Schema, category: data.
*
* When to use:
* Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.
*/
function Table({ ref, caption, captionLevel = "2", footer, hideCaption = false, columns, data, sort, defaultSort, selectable = "none", selected, defaultSelected, responsive = "stack", stickyHeader = true, maxHeight = "none", density = "comfortable", striped = false, emptyMessage, loading = false, rowActions, overrides, onSortChange, onSelectionChange, onRowPress, ...rest }) {
	const id = useId();
	const captionId = `${id}-caption`;
	const rowCountId = `${id}-row-count`;
	const scrollHintId = `${id}-scroll-hint`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const frameRef = useRef(null);
	const sentinelRef = useRef(null);
	const rowHeaderColumn = columns.find((column) => column.isRowHeader);
	if (columns.filter((column) => column.isRowHeader).length > 1) warnOnce("Table: exactly one column may set `isRowHeader`; the first is used.");
	if (onRowPress && !rowHeaderColumn) warnOnce("Table: `onRowPress` needs an `isRowHeader` column; rows stay inert.");
	const rowsInteractive = Boolean(onRowPress && rowHeaderColumn && !rowHeaderColumn.render);
	const [internalSort, setInternalSort] = useState(defaultSort);
	const sortControlled = sort !== void 0;
	const activeSort = sortControlled ? sort : internalSort;
	const rows = useMemo(() => {
		if (sortControlled || !activeSort) return data;
		const factor = activeSort.direction === "ascending" ? 1 : -1;
		return [...data].sort((a, b) => compareValues$2(a[activeSort.column], b[activeSort.column]) * factor);
	}, [
		data,
		sortControlled,
		activeSort
	]);
	const [announcement, setAnnouncement] = useState("");
	const activateSort = (column) => {
		const direction = activeSort?.column === column.key && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (!sortControlled) setInternalSort({
			column: column.key,
			direction
		});
		onSortChange?.(column.key, direction);
		setAnnouncement(COPY$5.sortedAnnouncement.replace("{column}", column.header).replace("{direction}", direction));
	};
	const [internalSelected, setInternalSelected] = useState(defaultSelected ?? []);
	const selectionControlled = selected !== void 0;
	const selectedIds = selectionControlled ? selected : internalSelected;
	const selectedSet = new Set(selectedIds);
	const commitSelection = (next) => {
		if (!selectionControlled) setInternalSelected(next);
		onSelectionChange?.(next);
		setAnnouncement(COPY$5.selectedCount.replace("{count}", String(next.length)).replace("{total}", String(data.length)));
	};
	const toggleRow = (rowId, checked) => {
		if (selectable === "single") commitSelection(checked ? [rowId] : []);
		else commitSelection(checked ? [...selectedIds.filter((x) => x !== rowId), rowId] : selectedIds.filter((x) => x !== rowId));
	};
	const allSelected = data.length > 0 && data.every((row) => selectedSet.has(row.id));
	const someSelected = !allSelected && data.some((row) => selectedSet.has(row.id));
	const toggleAll = () => commitSelection(allSelected ? [] : data.map((row) => row.id));
	const headerSticks = stickyHeader && (responsive !== "scroll" || maxHeight === "viewport");
	const [scrolledUnder, setScrolledUnder] = useState(false);
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!headerSticks || !sentinel || typeof IntersectionObserver === "undefined") {
			setScrolledUnder(false);
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[entries.length - 1];
			if (!entry) return;
			const rootTop = entry.rootBounds?.top ?? 0;
			const next = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
			setScrolledUnder((current) => current === next ? current : next);
		}, { root: maxHeight === "viewport" ? frameRef.current : null });
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [
		headerSticks,
		maxHeight,
		responsive
	]);
	const [fadeStart, setFadeStart] = useState(false);
	const [fadeEnd, setFadeEnd] = useState(false);
	const measureEdges = (region) => {
		const hidden = region.scrollWidth - region.clientWidth;
		const offset = Math.abs(region.scrollLeft);
		const nextStart = offset >= 1;
		const nextEnd = hidden - offset >= 1;
		setFadeStart((current) => current === nextStart ? current : nextStart);
		setFadeEnd((current) => current === nextEnd ? current : nextEnd);
	};
	const onRegionScroll = (event) => measureEdges(event.currentTarget);
	useEffect(() => {
		const region = frameRef.current;
		if (responsive !== "scroll" || !region || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(() => measureEdges(region));
		observer.observe(region);
		const table = region.querySelector("table");
		if (table) observer.observe(table);
		return () => observer.disconnect();
	}, [responsive]);
	const onRegionKeyDown = (event) => {
		if (event.target !== event.currentTarget) return;
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		const region = event.currentTarget;
		const step = lengthToPixels(getComputedStyle(region).getPropertyValue("--space-10"), region);
		if (!Number.isFinite(step)) return;
		event.preventDefault();
		region.scrollBy({ left: event.key === "ArrowRight" ? step : -step });
	};
	const onRowClick = (event, rowId) => {
		if (!rowsInteractive) return;
		const control = event.target.closest("button, a, input, select, textarea, label, [tabindex]");
		if (control && event.currentTarget.contains(control)) return;
		onRowPress?.(rowId);
	};
	const columnCount = (selectable !== "none" ? 1 : 0) + columns.length + (rowActions ? 1 : 0);
	const pluralForm = new Intl.PluralRules(pageLocale()).select(data.length) === "one" ? "one" : "other";
	const rowCountText = COPY$5.rowCount[pluralForm].replace("{count}", String(data.length));
	const cellClasses = (base, column) => joinClasses$2(base, column.align && column.align !== "start" && `ds-table__cell--align-${column.align}`, column.width && column.width !== "auto" && `ds-table__cell--width-${column.width}`, column.hideBelow && `ds-table__cell--hide-below-${column.hideBelow}`, column.isRowHeader && "ds-table__cell--row-header");
	const headerCell = (column) => {
		const sorted = activeSort?.column === column.key ? activeSort.direction : void 0;
		const nextDirection = sorted === "ascending" ? "descending" : "ascending";
		return /* @__PURE__ */ jsx("th", {
			role: "columnheader",
			scope: "col",
			abbr: column.abbr,
			"aria-sort": sorted,
			"data-part": "columnHeader",
			className: cellClasses("ds-table__column-header", column),
			children: column.sortable ? /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				size: "sm",
				label: column.header,
				accessibleName: (nextDirection === "ascending" ? COPY$5.sortAscending : COPY$5.sortDescending).replace("{column}", column.header),
				trailingIcon: sorted ? /* @__PURE__ */ jsx(Icon, {
					name: sorted === "ascending" ? "chevron-up" : "chevron-down",
					inline: true
				}) : void 0,
				overrides: {
					fontWeight: overrides?.headerWeight ?? "font.weight.semibold",
					iconGap: overrides?.cellGap ?? "layout.gap.tight"
				},
				onClick: () => activateSort(column)
			}) : column.header
		}, column.key);
	};
	const bodyRow = (row) => {
		const isSelected = selectedSet.has(row.id);
		const name = rowHeaderColumn ? textOf$2(row[rowHeaderColumn.key]) || row.id : row.id;
		return /* @__PURE__ */ jsxs("tr", {
			role: "row",
			"aria-selected": selectable !== "none" ? isSelected : void 0,
			"data-part": "row",
			className: joinClasses$2("ds-table__row", isSelected && "ds-table__row--selected", rowsInteractive && "ds-table__row--interactive"),
			onClick: rowsInteractive ? (event) => onRowClick(event, row.id) : void 0,
			children: [
				selectable !== "none" ? /* @__PURE__ */ jsx("td", {
					role: "cell",
					"data-part": "selectCell",
					className: "ds-table__select",
					children: /* @__PURE__ */ jsx(Checkbox, {
						label: COPY$5.selectRow.replace("{rowName}", name),
						hideLabel: true,
						name: `${id}-select`,
						value: row.id,
						checked: isSelected,
						onChange: (checked) => toggleRow(row.id, checked)
					})
				}) : null,
				columns.map((column) => {
					if (column === rowHeaderColumn) return /* @__PURE__ */ jsx("th", {
						role: "rowheader",
						scope: "row",
						"data-part": "rowHeader",
						className: cellClasses("ds-table__row-header", column),
						children: rowsInteractive ? /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							label: name,
							onClick: () => onRowPress?.(row.id)
						}) : column.render ? column.render(row) : textOf$2(row[column.key])
					}, column.key);
					return /* @__PURE__ */ jsx("td", {
						role: "cell",
						"data-part": "cell",
						"data-label": column.header,
						className: cellClasses("ds-table__cell", column),
						children: column.render ? column.render(row) : textOf$2(row[column.key])
					}, column.key);
				}),
				rowActions ? /* @__PURE__ */ jsx("td", {
					role: "cell",
					"data-part": "cell",
					"data-label": COPY$5.actions,
					className: "ds-table__cell ds-table__cell--actions",
					children: /* @__PURE__ */ jsx("div", {
						className: "ds-table__actions",
						children: rowActions(row)
					})
				}) : null
			]
		}, row.id);
	};
	const table = /* @__PURE__ */ jsxs("table", {
		role: "table",
		"aria-labelledby": captionId,
		"aria-describedby": rowCountId,
		"aria-rowcount": data.length + 1,
		"aria-colcount": columnCount,
		"aria-busy": loading ? true : void 0,
		"data-part": "table",
		className: "ds-table__table",
		children: [/* @__PURE__ */ jsx("thead", {
			role: "rowgroup",
			"data-part": "header",
			className: "ds-table__header",
			children: /* @__PURE__ */ jsxs("tr", {
				role: "row",
				"data-part": "headerRow",
				className: "ds-table__header-row",
				children: [
					selectable === "multiple" ? /* @__PURE__ */ jsx("th", {
						role: "columnheader",
						scope: "col",
						"data-part": "selectAllCell",
						className: "ds-table__select",
						children: /* @__PURE__ */ jsx(Checkbox, {
							label: COPY$5.selectAll,
							hideLabel: true,
							name: `${id}-select-all`,
							checked: allSelected,
							indeterminate: someSelected,
							onChange: toggleAll
						})
					}) : selectable === "single" ? /* @__PURE__ */ jsx("td", {
						role: "cell",
						className: "ds-table__select"
					}) : null,
					columns.map(headerCell),
					rowActions ? /* @__PURE__ */ jsx("th", {
						role: "columnheader",
						scope: "col",
						"data-part": "columnHeader",
						className: "ds-table__column-header",
						children: /* @__PURE__ */ jsx("span", {
							className: "ds-table__visually-hidden",
							children: COPY$5.actions
						})
					}) : null
				]
			})
		}), /* @__PURE__ */ jsx("tbody", {
			role: "rowgroup",
			"data-part": "body",
			className: "ds-table__body",
			children: rows.length === 0 ? /* @__PURE__ */ jsx("tr", {
				role: "row",
				className: "ds-table__row ds-table__row--empty",
				children: /* @__PURE__ */ jsx("td", {
					role: "cell",
					colSpan: columnCount,
					className: "ds-table__empty",
					children: /* @__PURE__ */ jsx(Text, {
						element: "p",
						tone: "muted",
						"data-part": "emptyState",
						children: loading ? COPY$5.loading : emptyMessage ?? COPY$5.empty
					})
				})
			}) : rows.map(bodyRow)
		})]
	});
	const frameClass = joinClasses$2("ds-table__frame", fadeStart && "ds-table__frame--scrolled");
	const sentinel = /* @__PURE__ */ jsx("div", {
		ref: sentinelRef,
		"aria-hidden": "true",
		className: "ds-table__sentinel"
	});
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Table",
		"data-part": "container",
		className: joinClasses$2("ds-table", `ds-table--${responsive}`, `ds-table--${density}`, `ds-table--max-height-${maxHeight}`, stickyHeader && "ds-table--sticky-header", striped && "ds-table--striped", scrolledUnder && "ds-table--scrolled-under", hideCaption && "ds-table--hide-caption"),
		style: overrides ? overridesToStyle$2(overrides) : void 0,
		children: [
			/* @__PURE__ */ jsx(Heading, {
				id: captionId,
				"data-part": "caption",
				level: captionLevel,
				size: "md",
				overrides: {
					fontSize: overrides?.captionSize ?? "font.size.md",
					fontWeight: overrides?.captionWeight ?? "font.weight.semibold",
					marginBlockEnd: hideCaption ? "space.0" : overrides?.captionGap ?? "space.2"
				},
				children: caption
			}),
			/* @__PURE__ */ jsx("span", {
				id: rowCountId,
				className: "ds-table__visually-hidden",
				children: rowCountText
			}),
			responsive === "scroll" ? /* @__PURE__ */ jsx("div", {
				className: "ds-table__scroll-outline",
				children: /* @__PURE__ */ jsxs("div", {
					ref: frameRef,
					role: "region",
					"aria-labelledby": captionId,
					"aria-describedby": scrollHintId,
					tabIndex: 0,
					"data-part": "scrollRegion",
					className: joinClasses$2(frameClass, "ds-table__scroll-region", fadeStart && "ds-table__scroll-region--fade-start", fadeEnd && "ds-table__scroll-region--fade-end"),
					onScroll: onRegionScroll,
					onKeyDown: onRegionKeyDown,
					children: [sentinel, table]
				})
			}) : /* @__PURE__ */ jsxs("div", {
				ref: frameRef,
				className: frameClass,
				children: [sentinel, table]
			}),
			responsive === "scroll" ? /* @__PURE__ */ jsx("span", {
				id: scrollHintId,
				className: "ds-table__visually-hidden",
				children: COPY$5.scrollHint
			}) : null,
			/* @__PURE__ */ jsx("div", {
				"aria-live": "polite",
				className: "ds-table__loading",
				children: loading && rows.length > 0 ? /* @__PURE__ */ jsx(Text, {
					element: "p",
					tone: "muted",
					size: "sm",
					children: COPY$5.loading
				}) : null
			}),
			footer !== void 0 && footer !== null && footer !== false ? /* @__PURE__ */ jsx("div", {
				"data-part": "footer",
				className: "ds-table__footer",
				children: typeof footer === "string" ? /* @__PURE__ */ jsx(Text, {
					element: "p",
					overrides: {
						fontFamily: overrides?.fontFamily ?? "font.family.body",
						fontSize: overrides?.fontSize ?? "font.size.sm",
						lineHeight: overrides?.lineHeight ?? "font.lineHeight.normal"
					},
					children: footer
				}) : footer
			}) : null,
			/* @__PURE__ */ jsx("div", {
				role: "status",
				"aria-live": "polite",
				className: "ds-table__visually-hidden",
				children: announcement
			})
		]
	});
}
//#endregion
//#region src/DataGrid.tsx
/** Root CSS hooks, one per overridable binding. The bindings a composed child draws are also
* forwarded to its own `overrides`: `captionSize`/`captionWeight` to the caption Heading,
* `statusBarSize` to the status bar Texts, `headerSize`/`headerWeight` to the sort Button. */
const OVERRIDE_HOOKS$1 = {
	headerWeight: "--ds-data-grid-header-weight",
	headerSize: "--ds-data-grid-header-size",
	headerBorder: "--ds-data-grid-header-border",
	headerBorderWidth: "--ds-data-grid-header-border-width",
	headerShadow: "--ds-data-grid-header-shadow",
	gridLine: "--ds-data-grid-grid-line",
	gridLineWidth: "--ds-data-grid-grid-line-width",
	rowHover: "--ds-data-grid-row-hover",
	cellPaddingInline: "--ds-data-grid-cell-padding-inline",
	columnWidth: "--ds-data-grid-column-width",
	pinnedShadow: "--ds-data-grid-pinned-shadow",
	resizeHandle: "--ds-data-grid-resize-handle",
	resizeHandleWidth: "--ds-data-grid-resize-handle-width",
	resizeStep: "--ds-data-grid-resize-step",
	statusBarSize: "--ds-data-grid-status-bar-size",
	statusBarPadding: "--ds-data-grid-status-bar-padding",
	statusBarGap: "--ds-data-grid-status-bar-gap",
	captionSize: "--ds-data-grid-caption-size",
	captionWeight: "--ds-data-grid-caption-weight",
	captionGap: "--ds-data-grid-caption-gap",
	fixedHeight: "--ds-data-grid-fixed-height",
	fontFamily: "--ds-data-grid-font-family",
	fontSize: "--ds-data-grid-font-size",
	lineHeight: "--ds-data-grid-line-height",
	numericFont: "--ds-data-grid-numeric-font",
	transition: "--ds-data-grid-transition"
};
/** copy.* — verbatim. */
const COPY$4 = {
	sortAscending: "Sort by {column}, ascending",
	sortDescending: "Sort by {column}, descending",
	sortedAnnouncement: "Sorted by {column}, {direction}",
	selectAll: "Select all rows",
	selectRow: "Select {rowName}",
	selectedRows: "{count} of {total} rows selected",
	selectedRange: "{rows} rows by {columns} columns selected",
	copied: {
		one: "Copied {cells} cell",
		other: "Copied {cells} cells"
	},
	editing: "Editing {column}. Enter to save, Escape to cancel.",
	invalid: "{message}",
	rowCount: {
		one: "{count} row",
		other: "{count} rows"
	},
	position: "Row {row}, {column}",
	resize: "Resize {column}",
	loading: "Loading",
	empty: "Nothing to show.",
	scrollHint: "Scroll sideways to see more columns"
};
/** The width of a column that sets no `width`: the columnWidth binding, `calc(hook * 2)` in the rule. */
const DEFAULT_COLUMN_SIZE$1 = "var(--ds-data-grid-column-size)";
/** Rows rendered before one row has been measured (a row count, not a size). */
const UNMEASURED_ROW_LIMIT$1 = 50;
/** The selection column: a minimum target plus the cell's own inline padding on both sides. */
const SELECT_COLUMN_SIZE$1 = "calc(var(--size-target-min) + 2 * var(--ds-data-grid-cell-padding-inline))";
/** The row block size, from the locked rowHeight / rowHeightComfortable bindings (set per density in CSS). */
const ROW_SIZE$1 = "var(--ds-data-grid-row-size)";
const FOCUSABLE_SELECTOR$2 = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/** Interactive content a cell's `render` may hold, whatever its tabindex. */
const CONTROL_SELECTOR$1 = "a[href], button, input, select, textarea, [contenteditable=\"true\"]";
const NAVIGATION_KEYS$1 = /* @__PURE__ */ new Set([
	"ArrowRight",
	"ArrowLeft",
	"ArrowDown",
	"ArrowUp",
	"Home",
	"End",
	"PageDown",
	"PageUp"
]);
const isDev$3 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function interpolate$2(template, values) {
	let text = template;
	for (const [key, value] of Object.entries(values)) text = text.replaceAll(`{${key}}`, String(value));
	return text;
}
function pluralForm$1(forms, count) {
	const locale = typeof document !== "undefined" ? document.documentElement.lang || void 0 : void 0;
	return new Intl.PluralRules(locale).select(count) === "one" ? forms.one : forms.other;
}
function compareValues$1(a, b) {
	if (typeof a === "number" && typeof b === "number") return a - b;
	return String(a ?? "").localeCompare(String(b ?? ""), void 0, { numeric: true });
}
function textOf$1(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function toCellValue$1(value) {
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	return value === void 0 || value === null ? void 0 : String(value);
}
function joinClasses$1(...parts) {
	return parts.filter(Boolean).join(" ");
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
function DataGrid({ ref, caption, captionLevel = "2", hideCaption = false, columns, data, rowCount, sort, defaultSort, selectable = "none", selected, editable = false, density = "compact", stickyHeader = true, height = "viewport", loading = false, emptyMessage, showStatusBar = true, container, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onRangeNeeded, onColumnResize, ...rest }) {
	const baseId = `ds-data-grid-${useId()}`;
	const captionId = `${baseId}-caption`;
	const statusId = `${baseId}-status`;
	const cellPrefix = `${baseId}-cell-`;
	const cellId = (row, col) => `${cellPrefix}${row < 0 ? "h" : row}_${col}`;
	const scrollRef = useRef(null);
	const gridRef = useRef(null);
	const stepSizerRef = useRef(null);
	const targetSizerRef = useRef(null);
	const editorRef = useRef(null);
	const warnedRef = useRef(false);
	if (isDev$3 && !warnedRef.current) {
		warnedRef.current = true;
		if (!caption) console.warn("DataGrid: `caption` is required; the grid falls back to an empty caption.");
		const rowHeaders = columns.filter((column) => column.isRowHeader).length;
		if (rowHeaders !== 1) console.warn(`DataGrid: exactly one column may be \`isRowHeader\`; found ${rowHeaders}.`);
		const pins = columns.map((column) => column.pinned);
		if (pins.some((pin, i) => pin === "start" && pins.slice(0, i).some((p) => p !== "start") || pin === "end" && pins.slice(i + 1).some((p) => p !== "end"))) console.warn("DataGrid: pinned columns must be contiguous at the start or end of `columns`.");
	}
	const hasSelectColumn = selectable === "row";
	const colOffset = hasSelectColumn ? 1 : 0;
	const colCount = colOffset + columns.length;
	const dataColumnAt = (col) => col < colOffset ? void 0 : columns[col - colOffset];
	const rowHeaderColumn = columns.find((column) => column.isRowHeader);
	const [resizedWidths, setResizedWidths] = useState({});
	/** The column's width in pixels, or undefined while it takes the columnWidth binding. */
	const widthOf = (column) => resizedWidths[column.key] ?? column.width;
	const widthCss = (column) => {
		const width = widthOf(column);
		return width === void 0 ? DEFAULT_COLUMN_SIZE$1 : `${width}px`;
	};
	/** The width of `columns[from..to)` as one CSS length: the pixel widths plus the default columns. */
	const widthSpan = (from, to) => {
		let pixels = 0;
		let defaults = 0;
		for (let i = from; i < to; i += 1) {
			const width = widthOf(columns[i]);
			if (width === void 0) defaults += 1;
			else pixels += width;
		}
		return defaults === 0 ? `${pixels}px` : `calc(${pixels}px + ${defaults} * ${DEFAULT_COLUMN_SIZE$1})`;
	};
	const gridTemplateColumns = [hasSelectColumn ? SELECT_COLUMN_SIZE$1 : null, ...columns.map(widthCss)].filter(Boolean).join(" ");
	const pinnedStyle = (column, index) => {
		if (column.pinned === "start") {
			const before = widthSpan(0, index);
			return { insetInlineStart: hasSelectColumn ? `calc(${SELECT_COLUMN_SIZE$1} + ${before})` : before };
		}
		if (column.pinned === "end") return { insetInlineEnd: widthSpan(index + 1, columns.length) };
	};
	const sortControlled = sort !== void 0;
	const [internalSort, setInternalSort] = useState(defaultSort);
	const activeSort = sortControlled ? sort : internalSort;
	const rows = useMemo(() => {
		if (sortControlled || !activeSort || rowCount !== void 0) return data;
		const factor = activeSort.direction === "ascending" ? 1 : -1;
		return [...data].sort((a, b) => compareValues$1(a[activeSort.column], b[activeSort.column]) * factor);
	}, [
		data,
		sortControlled,
		activeSort,
		rowCount
	]);
	const loaded = rows.length;
	const total = rowCount !== void 0 ? Math.max(rowCount, loaded) : loaded;
	const rowIndexById = useMemo(() => new Map(rows.map((row, i) => [row.id, i])), [rows]);
	const [announcement, setAnnouncement] = useState("");
	const activateSort = (column) => {
		const direction = activeSort?.column === column.key && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (!sortControlled) setInternalSort({
			column: column.key,
			direction
		});
		onSortChange?.(column.key, direction);
		setAnnouncement(interpolate$2(COPY$4.sortedAnnouncement, {
			column: column.header,
			direction
		}));
	};
	const selectedControlled = selected !== void 0;
	const [internalSelected, setInternalSelected] = useState([]);
	const selectedIds = selectedControlled ? selected : internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const [range, setRange] = useState(null);
	const anchorRef = useRef(null);
	const rowAnchorRef = useRef(null);
	const commitRows = (ids) => {
		if (!selectedControlled) setInternalSelected(ids);
		onSelectionChange?.(ids);
		setAnnouncement(interpolate$2(COPY$4.selectedRows, {
			count: ids.length,
			total
		}));
	};
	const toggleRow = (id) => {
		rowAnchorRef.current = id;
		commitRows(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
	};
	const extendRows = (id) => {
		const anchor = rowAnchorRef.current !== null ? rowIndexById.get(rowAnchorRef.current) : void 0;
		const target = rowIndexById.get(id);
		if (anchor === void 0 || target === void 0) return toggleRow(id);
		const span = rows.slice(Math.min(anchor, target), Math.max(anchor, target) + 1).map((row) => row.id);
		commitRows([...selectedIds.filter((existing) => !span.includes(existing)), ...span]);
	};
	const allIds = rows.map((row) => row.id);
	const allSelected = loaded > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitRows(allSelected ? [] : allIds);
	/** Row/column index bounds of a range, or null when an endpoint is no longer loaded. */
	const rangeBounds = (value) => {
		if (!value) return null;
		const r1 = rowIndexById.get(value.from.rowId);
		const r2 = rowIndexById.get(value.to.rowId);
		const c1 = columns.findIndex((column) => column.key === value.from.column);
		const c2 = columns.findIndex((column) => column.key === value.to.column);
		if (r1 === void 0 || r2 === void 0 || c1 < 0 || c2 < 0) return null;
		return {
			top: Math.min(r1, r2),
			bottom: Math.max(r1, r2),
			left: Math.min(c1, c2),
			right: Math.max(c1, c2)
		};
	};
	const bounds = selectable === "range" ? rangeBounds(range) : null;
	const commitRange = (next) => {
		const b = rangeBounds(next);
		setRange(next);
		onSelectionChange?.(next);
		if (b) setAnnouncement(interpolate$2(COPY$4.selectedRange, {
			rows: b.bottom - b.top + 1,
			columns: b.right - b.left + 1
		}));
	};
	const rowRange = (fromRow, toRow) => {
		const first = columns[0];
		const last = columns[columns.length - 1];
		const a = rows[fromRow];
		const b = rows[toRow];
		if (!first || !last || !a || !b) return null;
		return {
			from: {
				rowId: a.id,
				column: first.key
			},
			to: {
				rowId: b.id,
				column: last.key
			}
		};
	};
	const [rowHeightPx, setRowHeightPx] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [scrolledX, setScrolledX] = useState(false);
	const [overflowX, setOverflowX] = useState(false);
	const virtualize = height !== "content";
	const measured = rowHeightPx > 0 && viewportHeight > 0;
	const pageSize = measured ? Math.max(1, Math.floor(viewportHeight / rowHeightPx) - 1) : 1;
	let windowStart = 0;
	let windowEnd = loaded - 1;
	if (virtualize) {
		if (measured) {
			const first = Math.floor(scrollTop / rowHeightPx);
			windowStart = Math.max(0, Math.min(first, loaded) - pageSize);
			windowEnd = Math.min(loaded - 1, first + 2 * pageSize + 1);
		} else windowEnd = Math.min(loaded, UNMEASURED_ROW_LIMIT$1) - 1;
	}
	useLayoutEffect(() => {
		const region = scrollRef.current;
		if (!region) return void 0;
		const measure = () => {
			const viewport = region.clientHeight;
			setViewportHeight((prev) => prev === viewport ? prev : viewport);
			const rowEl = region.querySelector("[data-part=\"body\"] > [data-part=\"row\"]");
			const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
			if (rowHeight > 0) setRowHeightPx((prev) => prev === rowHeight ? prev : rowHeight);
			const overflow = region.scrollWidth > region.clientWidth;
			setOverflowX((prev) => prev === overflow ? prev : overflow);
		};
		measure();
		if (typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(measure);
		observer.observe(region);
		const rowEl = region.querySelector("[data-part=\"body\"] > [data-part=\"row\"]");
		if (rowEl) observer.observe(rowEl);
		return () => observer.disconnect();
	}, [
		density,
		windowStart,
		loaded === 0,
		height,
		colCount
	]);
	const requestedEndRef = useRef(-1);
	const checkRangeNeeded = (lastVisibleRow) => {
		if (!onRangeNeeded || rowCount === void 0 || rowCount <= loaded) return;
		if (lastVisibleRow < loaded - pageSize) return;
		const end = Math.min(rowCount - 1, loaded + pageSize - 1);
		if (requestedEndRef.current === end) return;
		requestedEndRef.current = end;
		onRangeNeeded(loaded, end);
	};
	const handleScroll = () => {
		const region = scrollRef.current;
		if (!region) return;
		setScrollTop((prev) => prev === region.scrollTop ? prev : region.scrollTop);
		const x = region.scrollLeft !== 0;
		setScrolledX((prev) => prev === x ? prev : x);
		if (measured) checkRangeNeeded(Math.floor((region.scrollTop + viewportHeight) / rowHeightPx));
	};
	const [active, setActive] = useState({
		row: -1,
		col: 0
	});
	const activeRow = Math.min(active.row, loaded - 1);
	const activeCol = Math.min(active.col, colCount - 1);
	const activeRendered = activeRow === -1 || activeRow >= windowStart && activeRow <= windowEnd;
	const keyboardMoveRef = useRef(false);
	useLayoutEffect(() => {
		if (!keyboardMoveRef.current) return;
		keyboardMoveRef.current = false;
		(typeof document !== "undefined" ? document.getElementById(cellId(activeRow, activeCol)) : null)?.scrollIntoView?.({
			block: "nearest",
			inline: "nearest"
		});
	});
	const focusGrid = () => gridRef.current?.focus();
	const moveTo = (row, col, extend = false) => {
		const r = Math.max(-1, Math.min(row, loaded - 1));
		const c = Math.max(0, Math.min(col, colCount - 1));
		const extending = extend && selectable === "range" && activeRow >= 0 && r >= 0 && anchorRef.current !== null;
		keyboardMoveRef.current = true;
		setActive({
			row: r,
			col: c
		});
		setAnnouncement("");
		const region = scrollRef.current;
		if (region && virtualize && rowHeightPx > 0 && r >= 0) {
			const top = r * rowHeightPx;
			if (top < region.scrollTop) region.scrollTop = top;
			else if (top + rowHeightPx > region.scrollTop + viewportHeight - rowHeightPx) region.scrollTop = top + 2 * rowHeightPx - viewportHeight;
		}
		if (r >= 0) checkRangeNeeded(r);
		const column = dataColumnAt(c);
		const rowData = r >= 0 ? rows[r] : void 0;
		if (!column || !rowData) return;
		const ref = {
			rowId: rowData.id,
			column: column.key
		};
		if (selectable === "cell") onSelectionChange?.(ref);
		if (selectable === "range") {
			if (extending) commitRange({
				from: anchorRef.current,
				to: ref
			});
			else {
				anchorRef.current = ref;
				if (range) commitRange({
					from: ref,
					to: ref
				});
			}
		}
	};
	const [editing, setEditingState] = useState(null);
	const editingRef = useRef(null);
	const setEditing = (next) => {
		editingRef.current = next;
		setEditingState(next);
	};
	const editValueRef = useRef(void 0);
	const pickerOpenRef = useRef(false);
	const [editError, setEditError] = useState(void 0);
	const openEditor = (rowIndex, col, seed) => {
		const column = dataColumnAt(col);
		const row = rows[rowIndex];
		if (!editable || !column?.editable || !row) return false;
		if (onEditStart?.(row.id, column.key) === false) return false;
		const kind = column.editor ?? "text";
		const seeded = seed !== void 0 && (kind === "text" || kind === "number");
		editValueRef.current = seeded ? kind === "number" ? Number.isFinite(Number(seed)) ? Number(seed) : void 0 : seed : row[column.key];
		pickerOpenRef.current = false;
		setActive({
			row: rowIndex,
			col
		});
		setEditing({
			rowId: row.id,
			column: column.key,
			seed: seeded ? seed : void 0
		});
		setEditError(void 0);
		setAnnouncement(interpolate$2(COPY$4.editing, { column: column.header }));
		return true;
	};
	const closeEditor = () => {
		setEditing(null);
		setEditError(void 0);
		setAnnouncement("");
	};
	const cancelEdit = () => {
		closeEditor();
		focusGrid();
	};
	/** Validates and commits the open editor; false when validation kept it open. */
	const commitEdit = () => {
		const current = editingRef.current;
		if (!current) return true;
		const rowIndex = rowIndexById.get(current.rowId);
		const row = rowIndex !== void 0 ? rows[rowIndex] : void 0;
		const column = columns.find((entry) => entry.key === current.column);
		if (!row || !column) {
			closeEditor();
			return true;
		}
		const value = editValueRef.current;
		const message = column.validate?.(value, row);
		if (message) {
			setEditError(message);
			setAnnouncement(interpolate$2(COPY$4.invalid, { message }));
			return false;
		}
		const previous = row[column.key];
		closeEditor();
		if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, toCellValue$1(value), toCellValue$1(previous));
		return true;
	};
	const editableCols = () => columns.flatMap((column, i) => column.editable ? [i + colOffset] : []);
	const handleEditorKeyDown = (event, column) => {
		const kind = column.editor ?? "text";
		event.stopPropagation();
		if (event.key === "Escape") {
			if (pickerOpenRef.current) return;
			event.preventDefault();
			cancelEdit();
		} else if (event.key === "Enter") {
			if (kind === "select" || kind === "date" && pickerOpenRef.current) return;
			event.preventDefault();
			if (commitEdit()) {
				focusGrid();
				moveTo(activeRow + 1, activeCol);
			}
		} else if (event.key === "F2") {
			event.preventDefault();
			if (commitEdit()) focusGrid();
		} else if (event.key === "Tab") {
			const row = activeRow;
			const cols = editableCols();
			const next = event.shiftKey ? [...cols].reverse().find((c) => c < activeCol) : cols.find((c) => c > activeCol);
			if (!commitEdit()) {
				event.preventDefault();
				return;
			}
			focusGrid();
			if (next !== void 0) {
				event.preventDefault();
				if (!openEditor(row, next)) setActive({
					row,
					col: next
				});
			}
		}
	};
	const handleEditorBlur = (event, cell) => {
		if (event.currentTarget.contains(event.relatedTarget) || pickerOpenRef.current) return;
		const current = editingRef.current;
		if (!current || current.rowId !== cell.rowId || current.column !== cell.column) return;
		const kind = columns.find((column) => column.key === cell.column)?.editor ?? "text";
		if (kind === "text" || kind === "number" || kind === "date") commitEdit();
	};
	useEffect(() => {
		if (!editing) return;
		const target = editorRef.current?.querySelector("input, button, select, textarea, [tabindex]");
		target?.focus();
		if (target instanceof HTMLInputElement && editing.seed !== void 0) try {
			target.setSelectionRange(target.value.length, target.value.length);
		} catch {}
	}, [editing]);
	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;
		for (const el of grid.querySelectorAll(FOCUSABLE_SELECTOR$2)) {
			if (el === grid || el.closest("[data-part=\"editor\"]")) continue;
			if (el.tabIndex !== -1) el.tabIndex = -1;
		}
	});
	const pendingResizeRef = useRef(null);
	/** The floor for both resize paths: the column's own `minWidth`, never below size.target.min. */
	const minWidthOf = (column) => Math.max(column.minWidth ?? 0, targetSizerRef.current?.getBoundingClientRect().width ?? 0);
	/** Where a resize starts from: the set width, or the rendered width of a default-width column. */
	const currentWidth = (column, index) => {
		const width = widthOf(column);
		if (width !== void 0) return width;
		const header = typeof document !== "undefined" ? document.getElementById(cellId(-1, index + colOffset)) : null;
		return header ? header.getBoundingClientRect().width : 0;
	};
	const resizeTo = (column, width) => {
		const next = Math.round(Math.max(minWidthOf(column), width));
		setResizedWidths((prev) => prev[column.key] === next ? prev : {
			...prev,
			[column.key]: next
		});
		return next;
	};
	const startPointerResize = (event, column, index) => {
		event.preventDefault();
		event.stopPropagation();
		const handle = event.currentTarget;
		const startX = event.clientX;
		const startWidth = currentWidth(column, index);
		const rtl = typeof getComputedStyle === "function" && getComputedStyle(handle).direction === "rtl";
		let width = startWidth;
		handle.setPointerCapture?.(event.pointerId);
		const move = (e) => {
			width = resizeTo(column, startWidth + (rtl ? startX - e.clientX : e.clientX - startX));
		};
		const up = (e) => {
			handle.releasePointerCapture?.(e.pointerId);
			handle.removeEventListener("pointermove", move);
			handle.removeEventListener("pointerup", up);
			handle.removeEventListener("pointercancel", up);
			onColumnResize?.(column.key, width);
		};
		handle.addEventListener("pointermove", move);
		handle.addEventListener("pointerup", up);
		handle.addEventListener("pointercancel", up);
	};
	const copyRange = () => {
		if (!bounds) return;
		const span = columns.slice(bounds.left, bounds.right + 1);
		const lines = [];
		if (bounds.top === 0 && bounds.bottom === loaded - 1) lines.push(span.map((column) => column.header).join("	"));
		for (let r = bounds.top; r <= bounds.bottom; r += 1) {
			const row = rows[r];
			if (row) lines.push(span.map((column) => textOf$1(row[column.key])).join("	"));
		}
		const cells = (bounds.bottom - bounds.top + 1) * span.length;
		navigator.clipboard?.writeText(lines.join("\n")).then(() => setAnnouncement(interpolate$2(pluralForm$1(COPY$4.copied, cells), { cells }))).catch(() => void 0);
	};
	const clearSelection = () => {
		const targets = [];
		if (selectable === "row") {
			for (const row of rows) if (selectedSet.has(row.id)) {
				for (const column of columns) if (column.editable) targets.push([row, column]);
			}
		} else if (selectable === "cell") {
			const row = rows[activeRow];
			const column = dataColumnAt(activeCol);
			if (row && column?.editable) targets.push([row, column]);
		} else if (selectable === "range" && bounds) for (let r = bounds.top; r <= bounds.bottom; r += 1) for (let c = bounds.left; c <= bounds.right; c += 1) {
			const row = rows[r];
			const column = columns[c];
			if (row && column?.editable) targets.push([row, column]);
		}
		for (const [row, column] of targets) onCellChange?.(row.id, column.key, void 0, toCellValue$1(row[column.key]));
		return targets.length > 0;
	};
	const handleKeyDown = (event) => {
		if (editingRef.current) return;
		const grid = gridRef.current;
		if (!grid) return;
		if (event.target !== grid) {
			if (event.key === "Escape" || event.key === "F2") {
				event.preventDefault();
				focusGrid();
				return;
			}
			if (event.key === "Tab" && event.shiftKey) {
				focusGrid();
				return;
			}
			if (!NAVIGATION_KEYS$1.has(event.key)) return;
			focusGrid();
		}
		const row = activeRow;
		const col = activeCol;
		const column = dataColumnAt(col);
		const ctrl = event.ctrlKey || event.metaKey;
		switch (event.key) {
			case "ArrowRight":
			case "ArrowLeft": {
				event.preventDefault();
				const delta = event.key === "ArrowRight" ? 1 : -1;
				if (event.shiftKey && row === -1 && column?.resizable) {
					const step = stepSizerRef.current?.getBoundingClientRect().width ?? 0;
					const rtl = getComputedStyle(grid).direction === "rtl";
					const width = resizeTo(column, currentWidth(column, col - colOffset) + (rtl ? -delta : delta) * step);
					pendingResizeRef.current = {
						column: column.key,
						width
					};
					return;
				}
				moveTo(row, col + delta, event.shiftKey);
				return;
			}
			case "ArrowDown":
				event.preventDefault();
				moveTo(row + 1, col, event.shiftKey);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveTo(row - 1, col, event.shiftKey);
				return;
			case "Home":
				event.preventDefault();
				moveTo(ctrl ? -1 : row, 0);
				return;
			case "End":
				event.preventDefault();
				moveTo(ctrl ? loaded - 1 : row, colCount - 1);
				return;
			case "PageDown":
				event.preventDefault();
				moveTo(row + pageSize, col);
				return;
			case "PageUp":
				event.preventDefault();
				moveTo(row < 0 ? row : Math.max(0, row - pageSize), col);
				return;
			case "Enter": {
				event.preventDefault();
				if (row === -1) {
					if (hasSelectColumn && col === 0) toggleAll();
					else if (column?.sortable) activateSort(column);
					return;
				}
				const rowData = rows[row];
				if (!rowData) return;
				if (hasSelectColumn && col === 0) {
					toggleRow(rowData.id);
					return;
				}
				if (openEditor(row, col)) return;
				const control = document.getElementById(cellId(row, col))?.querySelector(CONTROL_SELECTOR$1);
				if (control) {
					control.focus();
					control.click();
				}
				return;
			}
			case "F2":
				event.preventDefault();
				if (row >= 0) openEditor(row, col);
				return;
			case "Escape":
				if (selectable === "range" && range) {
					event.preventDefault();
					setRange(null);
				}
				return;
			case " ": {
				if (selectable !== "row" && selectable !== "range") break;
				event.preventDefault();
				const rowData = rows[row];
				if (!rowData) return;
				if (selectable === "row") {
					if (event.shiftKey) extendRows(rowData.id);
					else toggleRow(rowData.id);
					return;
				}
				if (ctrl && column && rows[0]) {
					const last = rows[loaded - 1];
					anchorRef.current = {
						rowId: rows[0].id,
						column: column.key
					};
					commitRange({
						from: anchorRef.current,
						to: {
							rowId: last.id,
							column: column.key
						}
					});
					return;
				}
				const anchorRow = event.shiftKey && rowAnchorRef.current !== null ? rowIndexById.get(rowAnchorRef.current) : void 0;
				if (anchorRow === void 0) rowAnchorRef.current = rowData.id;
				const next = rowRange(anchorRow ?? row, row);
				if (next) {
					anchorRef.current = next.from;
					commitRange(next);
				}
				return;
			}
			case "Delete":
			case "Backspace":
				if (editable && clearSelection()) event.preventDefault();
				return;
		}
		if (ctrl && event.code === "KeyA" && (selectable === "row" || selectable === "range")) {
			event.preventDefault();
			if (selectable === "row") commitRows(allIds);
			else {
				const all = rowRange(0, loaded - 1);
				if (all) {
					anchorRef.current = all.from;
					commitRange(all);
				}
			}
			return;
		}
		if (ctrl && event.code === "KeyC" && selectable === "range") {
			event.preventDefault();
			copyRange();
			return;
		}
		if (event.key.length === 1 && event.key !== " " && !ctrl && !event.altKey && row >= 0 && openEditor(row, col, event.key)) event.preventDefault();
	};
	const handleKeyUp = (event) => {
		if (event.key !== "Shift" || !pendingResizeRef.current) return;
		const { column, width } = pendingResizeRef.current;
		pendingResizeRef.current = null;
		onColumnResize?.(column, width);
	};
	const positionOf = (target) => {
		const cell = target instanceof Element ? target.closest("[role=\"gridcell\"], [role=\"rowheader\"], [role=\"columnheader\"]") : null;
		if (!cell || !cell.id.startsWith(cellPrefix) || !gridRef.current?.contains(cell)) return null;
		const [r, c] = cell.id.slice(cellPrefix.length).split("_");
		return {
			row: r === "h" ? -1 : Number(r),
			col: Number(c)
		};
	};
	const draggingRef = useRef(false);
	/** The cell the drag last extended to, so a move within one cell does not re-fire the selection. */
	const lastDragRef = useRef(null);
	const handleMouseDown = (event) => {
		const target = event.target;
		if (target.closest("[data-part=\"editor\"]") || target.closest(CONTROL_SELECTOR$1)) return;
		if (!positionOf(target)) return;
		event.preventDefault();
		focusGrid();
	};
	const handlePointerDown = (event) => {
		if (event.button !== 0) return;
		const target = event.target;
		if (target.closest("[data-part=\"editor\"]")) return;
		const pos = positionOf(target);
		if (!pos) return;
		setActive(pos);
		setAnnouncement("");
		const column = dataColumnAt(pos.col);
		const row = pos.row >= 0 ? rows[pos.row] : void 0;
		if (!row || !column) return;
		const ref = {
			rowId: row.id,
			column: column.key
		};
		const ctrl = event.ctrlKey || event.metaKey;
		if (selectable === "cell") onSelectionChange?.(ref);
		else if (selectable === "row") {
			if (event.shiftKey) extendRows(row.id);
			else if (ctrl) toggleRow(row.id);
		} else if (selectable === "range") {
			if (!(event.shiftKey && anchorRef.current)) anchorRef.current = ref;
			commitRange({
				from: anchorRef.current,
				to: ref
			});
			draggingRef.current = true;
			lastDragRef.current = ref;
			gridRef.current?.setPointerCapture?.(event.pointerId);
		}
	};
	const handlePointerMove = (event) => {
		if (!draggingRef.current || !anchorRef.current || typeof document.elementFromPoint !== "function") return;
		const pos = positionOf(document.elementFromPoint(event.clientX, event.clientY));
		const column = pos ? dataColumnAt(pos.col) : void 0;
		const row = pos && pos.row >= 0 ? rows[pos.row] : void 0;
		if (!pos || !row || !column) return;
		const last = lastDragRef.current;
		if (last && last.rowId === row.id && last.column === column.key) return;
		lastDragRef.current = {
			rowId: row.id,
			column: column.key
		};
		setActive(pos);
		commitRange({
			from: anchorRef.current,
			to: {
				rowId: row.id,
				column: column.key
			}
		});
	};
	const endDrag = (event) => {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		gridRef.current?.releasePointerCapture?.(event.pointerId);
	};
	const handleDoubleClick = (event) => {
		const pos = positionOf(event.target);
		if (pos && pos.row >= 0 && !editingRef.current) openEditor(pos.row, pos.col);
	};
	const rootStyle = {};
	for (const [binding, hook] of Object.entries(OVERRIDE_HOOKS$1)) {
		const token = overrides?.[binding];
		if (token) rootStyle[hook] = cssVar(token);
	}
	const headerTextOverrides = {
		paddingInline: "space.0",
		fontSize: overrides?.headerSize ?? "font.size.sm",
		fontWeight: overrides?.headerWeight ?? "font.weight.semibold"
	};
	const renderEditor = (column, row, cell) => {
		const name = `${baseId}-editor`;
		const current = row[column.key];
		const setValue = (value) => {
			editValueRef.current = value;
		};
		const commitOnChange = (value) => {
			setValue(value);
			if (commitEdit()) focusGrid();
		};
		const zeroInset = {
			paddingInline: "space.0",
			paddingBlock: "space.0"
		};
		switch (column.editor ?? "text") {
			case "number": return /* @__PURE__ */ jsx(NumberInput, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: cell.seed !== void 0 ? editValueRef.current : typeof current === "number" ? current : void 0,
				overrides: zeroInset,
				onChange: setValue
			});
			case "select": return /* @__PURE__ */ jsx(Select, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				options: column.options ?? [],
				defaultValue: textOf$1(current),
				container,
				overrides: {
					triggerPaddingInline: "space.0",
					triggerPaddingBlock: "space.0"
				},
				onOpenChange: (open) => {
					pickerOpenRef.current = open;
				},
				onChange: (value) => commitOnChange(Array.isArray(value) ? value[0] : value)
			});
			case "date": return /* @__PURE__ */ jsx(DatePicker, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: typeof current === "string" ? current : void 0,
				container,
				overrides: zeroInset,
				onOpenChange: (open) => {
					pickerOpenRef.current = open;
				},
				onChange: (value) => setValue(typeof value === "string" ? value : void 0)
			});
			case "checkbox": return /* @__PURE__ */ jsx(Checkbox, {
				label: column.header,
				hideLabel: true,
				name,
				checked: Boolean(current),
				onChange: commitOnChange
			});
			default: return /* @__PURE__ */ jsx(Input, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: cell.seed ?? textOf$1(current),
				overrides: zeroInset,
				onChange: setValue
			});
		}
	};
	const headerCell = (column, index) => {
		const col = index + colOffset;
		const sorted = activeSort?.column === column.key ? activeSort.direction : void 0;
		const next = sorted === "ascending" ? "descending" : "ascending";
		const width = widthOf(column);
		return /* @__PURE__ */ jsxs("div", {
			id: cellId(-1, col),
			role: "columnheader",
			"aria-colindex": col + 1,
			"aria-sort": column.sortable ? sorted : void 0,
			tabIndex: -1,
			"data-part": "columnHeader",
			className: joinClasses$1("ds-data-grid__cell", "ds-data-grid__cell--header", column.align && column.align !== "start" && `ds-data-grid__cell--align-${column.align}`, column.pinned && "ds-data-grid__cell--pinned", activeRow === -1 && activeCol === col && "ds-data-grid__cell--active"),
			style: pinnedStyle(column, index),
			children: [column.sortable ? /* @__PURE__ */ jsx("span", {
				className: "ds-data-grid__sort",
				"data-part": "sortButton",
				onClick: () => activateSort(column),
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					label: column.header,
					accessibleName: interpolate$2(next === "ascending" ? COPY$4.sortAscending : COPY$4.sortDescending, { column: column.header }),
					trailingIcon: sorted ? /* @__PURE__ */ jsx(Icon, {
						name: sorted === "ascending" ? "chevron-up" : "chevron-down",
						inline: true
					}) : void 0,
					overrides: headerTextOverrides,
					tabIndex: -1
				})
			}) : column.abbr ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				children: column.header
			}), /* @__PURE__ */ jsx("span", {
				className: "ds-data-grid__visually-hidden",
				children: column.abbr
			})] }) : column.header, column.resizable ? /* @__PURE__ */ jsx("div", {
				role: "separator",
				"aria-orientation": "vertical",
				"aria-valuenow": width,
				"aria-valuemin": column.minWidth,
				"aria-label": interpolate$2(COPY$4.resize, { column: column.header }),
				"data-part": "resizeHandle",
				className: "ds-data-grid__resize-handle",
				onPointerDown: (event) => startPointerResize(event, column, index)
			}) : null]
		}, column.key);
	};
	const bodyCell = (row, rowIndex, column, index) => {
		const col = index + colOffset;
		const isEditing = editing?.rowId === row.id && editing.column === column.key;
		const inRange = bounds !== null && rowIndex >= bounds.top && rowIndex <= bounds.bottom && index >= bounds.left && index <= bounds.right;
		const cellSelected = selectable === "cell" ? activeRow === rowIndex && activeCol === col : selectable === "range" ? inRange : void 0;
		/** numericFont: cells whose raw value is a number and that have no `render`. */
		const numeric = !column.render && typeof row[column.key] === "number";
		return /* @__PURE__ */ jsx("div", {
			id: cellId(rowIndex, col),
			role: column.isRowHeader ? "rowheader" : "gridcell",
			"aria-colindex": col + 1,
			"aria-selected": cellSelected,
			"aria-readonly": editable && !column.editable ? true : void 0,
			"aria-describedby": isEditing && editError ? statusId : void 0,
			tabIndex: -1,
			"data-part": column.isRowHeader ? "rowHeader" : "cell",
			className: joinClasses$1("ds-data-grid__cell", column.align && column.align !== "start" && `ds-data-grid__cell--align-${column.align}`, numeric && "ds-data-grid__cell--numeric", column.pinned && "ds-data-grid__cell--pinned", activeRow === rowIndex && activeCol === col && "ds-data-grid__cell--active", isEditing && "ds-data-grid__cell--editing", isEditing && editError && "ds-data-grid__cell--invalid"),
			style: pinnedStyle(column, index),
			children: isEditing && editing ? /* @__PURE__ */ jsx("div", {
				ref: editorRef,
				className: "ds-data-grid__editor",
				"data-part": "editor",
				onKeyDown: (event) => handleEditorKeyDown(event, column),
				onBlur: (event) => handleEditorBlur(event, editing),
				children: renderEditor(column, row, editing)
			}) : /* @__PURE__ */ jsx("span", {
				className: "ds-data-grid__cell-content",
				"data-part": "cellContent",
				children: column.render ? column.render(row) : textOf$1(row[column.key])
			})
		}, column.key);
	};
	const bodyRow = (row, rowIndex) => {
		const isSelected = selectedSet.has(row.id);
		const name = rowHeaderColumn ? textOf$1(row[rowHeaderColumn.key]) || row.id : row.id;
		const style = { gridTemplateColumns };
		if (virtualize) style.transform = `translateY(calc(${rowIndex} * ${ROW_SIZE$1}))`;
		return /* @__PURE__ */ jsxs("div", {
			role: "row",
			"aria-rowindex": rowIndex + 2,
			"aria-selected": hasSelectColumn ? isSelected : void 0,
			"data-part": "row",
			className: "ds-data-grid__row",
			style,
			children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
				id: cellId(rowIndex, 0),
				role: "gridcell",
				"aria-colindex": 1,
				tabIndex: -1,
				"data-part": "selectCell",
				className: joinClasses$1("ds-data-grid__cell", "ds-data-grid__cell--select", "ds-data-grid__cell--pinned", activeRow === rowIndex && activeCol === 0 && "ds-data-grid__cell--active"),
				style: { insetInlineStart: 0 },
				onClick: (event) => {
					if (!event.target.closest("[data-ds=\"Checkbox\"]")) toggleRow(row.id);
				},
				children: /* @__PURE__ */ jsx(Checkbox, {
					label: interpolate$2(COPY$4.selectRow, { rowName: name }),
					hideLabel: true,
					name: `${baseId}-select`,
					value: row.id,
					checked: isSelected,
					tabIndex: -1,
					onChange: () => toggleRow(row.id)
				})
			}) : null, columns.map((column, index) => bodyCell(row, rowIndex, column, index))]
		}, row.id);
	};
	const visibleRows = [];
	for (let i = Math.max(0, windowStart); i <= windowEnd; i += 1) {
		const row = rows[i];
		if (row) visibleRows.push(bodyRow(row, i));
	}
	let overlay = null;
	if (bounds) {
		const top = Math.max(bounds.top, windowStart);
		const bottom = Math.min(bounds.bottom, windowEnd);
		if (top <= bottom) {
			const rect = {
				insetBlockStart: `calc(${top} * ${ROW_SIZE$1})`,
				blockSize: `calc(${bottom - top + 1} * ${ROW_SIZE$1})`,
				insetInlineStart: widthSpan(0, bounds.left),
				inlineSize: widthSpan(bounds.left, bounds.right + 1)
			};
			overlay = /* @__PURE__ */ jsxs("div", {
				"aria-hidden": "true",
				className: "ds-data-grid__range-overlay",
				"data-part": "rangeOverlay",
				children: [/* @__PURE__ */ jsx("div", {
					className: "ds-data-grid__range-fill",
					style: rect
				}), /* @__PURE__ */ jsx("div", {
					className: "ds-data-grid__range-border",
					style: rect
				})]
			});
		}
	}
	const liveText = loading ? COPY$4.loading : editError ? interpolate$2(COPY$4.invalid, { message: editError }) : announcement;
	const activeColumn = dataColumnAt(activeCol);
	const position = activeRow >= 0 && activeColumn ? interpolate$2(COPY$4.position, {
		row: activeRow + 1,
		column: activeColumn.header
	}) : "";
	const statusTextOverrides = { fontSize: overrides?.statusBarSize ?? "font.size.xs" };
	/** Beside the live span, in this order and no other: row count, selection count, scroll hint, position. */
	const statusItems = [interpolate$2(pluralForm$1(COPY$4.rowCount, total), { count: total })];
	if (selectable === "row" && selectedIds.length > 0) statusItems.push(interpolate$2(COPY$4.selectedRows, {
		count: selectedIds.length,
		total
	}));
	if (bounds) statusItems.push(interpolate$2(COPY$4.selectedRange, {
		rows: bounds.bottom - bounds.top + 1,
		columns: bounds.right - bounds.left + 1
	}));
	if (overflowX && !scrolledX) statusItems.push(COPY$4.scrollHint);
	if (position) statusItems.push(position);
	const empty = loaded === 0 && !loading;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "DataGrid",
		"data-part": "container",
		className: joinClasses$1("ds-data-grid", `ds-data-grid--density-${density}`, `ds-data-grid--height-${height}`, virtualize && "ds-data-grid--virtual", (stickyHeader || virtualize) && "ds-data-grid--sticky-header", scrollTop > 0 && "ds-data-grid--scrolled-y", scrolledX && "ds-data-grid--scrolled-x", loading && "ds-data-grid--loading"),
		style: rootStyle,
		children: [
			/* @__PURE__ */ jsx("span", {
				ref: stepSizerRef,
				"aria-hidden": "true",
				className: "ds-data-grid__sizer ds-data-grid__sizer--step"
			}),
			/* @__PURE__ */ jsx("span", {
				ref: targetSizerRef,
				"aria-hidden": "true",
				className: "ds-data-grid__sizer ds-data-grid__sizer--target"
			}),
			/* @__PURE__ */ jsx("div", {
				"data-part": "caption",
				className: hideCaption ? "ds-data-grid__visually-hidden" : "ds-data-grid__caption",
				children: /* @__PURE__ */ jsx(Heading, {
					id: captionId,
					level: captionLevel,
					size: "md",
					overrides: {
						marginBlockEnd: "space.0",
						fontSize: overrides?.captionSize ?? "font.size.md",
						fontWeight: overrides?.captionWeight ?? "font.weight.semibold"
					},
					children: caption
				})
			}),
			/* @__PURE__ */ jsx("div", {
				ref: scrollRef,
				"data-part": "scrollRegion",
				className: "ds-data-grid__scroll-region",
				onScroll: handleScroll,
				children: /* @__PURE__ */ jsxs("div", {
					ref: gridRef,
					role: "grid",
					"data-part": "grid",
					className: "ds-data-grid__grid",
					tabIndex: 0,
					"aria-labelledby": captionId,
					"aria-describedby": showStatusBar ? statusId : void 0,
					"aria-rowcount": total + 1,
					"aria-colcount": colCount,
					"aria-multiselectable": selectable === "none" ? void 0 : selectable !== "cell",
					"aria-readonly": !editable,
					"aria-busy": loading ? true : void 0,
					"aria-activedescendant": activeRendered && colCount > 0 ? cellId(activeRow, activeCol) : void 0,
					onKeyDown: handleKeyDown,
					onKeyUp: handleKeyUp,
					onMouseDown: handleMouseDown,
					onPointerDown: handlePointerDown,
					onPointerMove: handlePointerMove,
					onPointerUp: endDrag,
					onPointerCancel: endDrag,
					onDoubleClick: handleDoubleClick,
					children: [/* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "header",
						className: "ds-data-grid__header",
						children: /* @__PURE__ */ jsxs("div", {
							role: "row",
							"aria-rowindex": 1,
							"data-part": "headerRow",
							className: "ds-data-grid__row",
							style: { gridTemplateColumns },
							children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
								id: cellId(-1, 0),
								role: "columnheader",
								"aria-colindex": 1,
								tabIndex: -1,
								"data-part": "selectAllCell",
								className: joinClasses$1("ds-data-grid__cell", "ds-data-grid__cell--header", "ds-data-grid__cell--select", "ds-data-grid__cell--pinned", activeRow === -1 && activeCol === 0 && "ds-data-grid__cell--active"),
								style: { insetInlineStart: 0 },
								onClick: (event) => {
									if (!event.target.closest("[data-ds=\"Checkbox\"]")) toggleAll();
								},
								children: /* @__PURE__ */ jsx(Checkbox, {
									label: COPY$4.selectAll,
									hideLabel: true,
									name: `${baseId}-select-all`,
									checked: allSelected,
									indeterminate: someSelected,
									tabIndex: -1,
									onChange: toggleAll
								})
							}) : null, columns.map(headerCell)]
						})
					}), /* @__PURE__ */ jsxs("div", {
						role: "rowgroup",
						"data-part": "body",
						className: "ds-data-grid__body",
						style: virtualize ? { blockSize: `calc(${empty ? 0 : total} * ${ROW_SIZE$1})` } : void 0,
						children: [overlay, empty ? /* @__PURE__ */ jsx("div", {
							role: "row",
							"aria-rowindex": 2,
							className: "ds-data-grid__empty-row",
							children: /* @__PURE__ */ jsx("div", {
								role: "gridcell",
								"aria-colindex": 1,
								className: "ds-data-grid__empty",
								style: { gridColumn: "1 / -1" },
								children: /* @__PURE__ */ jsx(Text, {
									element: "p",
									tone: "muted",
									"data-part": "emptyState",
									children: emptyMessage ?? COPY$4.empty
								})
							})
						}) : visibleRows]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: showStatusBar ? "ds-data-grid__status-bar" : "ds-data-grid__visually-hidden",
				children: [/* @__PURE__ */ jsx(Text, {
					id: statusId,
					"data-part": "statusBar",
					element: "span",
					size: "xs",
					tone: "muted",
					role: "status",
					"aria-live": "polite",
					overrides: statusTextOverrides,
					children: liveText
				}), showStatusBar ? statusItems.map((text) => /* @__PURE__ */ jsx(Text, {
					element: "span",
					size: "xs",
					tone: "muted",
					overrides: statusTextOverrides,
					children: text
				}, text)) : null]
			})
		]
	});
}
//#endregion
//#region src/TreeGrid.tsx
/** Root CSS hooks, one per overridable binding. DataGrid's own bindings (header, grid lines, row height,
* status bar, caption, resize handle, resizeStep) apply at DataGrid's default tokens and are not
* overridable here — only cellPaddingInline and fixedHeight are. */
const OVERRIDE_HOOKS = {
	indent: "--ds-tree-grid-indent",
	expandGap: "--ds-tree-grid-expand-gap",
	guideLine: "--ds-tree-grid-guide-line",
	cellPaddingInline: "--ds-tree-grid-cell-padding-inline",
	fixedHeight: "--ds-tree-grid-fixed-height",
	guideLineWidth: "--ds-tree-grid-guide-line-width",
	parentWeight: "--ds-tree-grid-parent-weight",
	transition: "--ds-tree-grid-transition"
};
/** copy.* — verbatim. `level`, `childCount`, `expandAll` and `collapseAll` are native-only: the web
* conveys depth through aria-level / aria-setsize / aria-posinset and expand-all through the `*` key. */
const COPY$3 = {
	expand: "Expand {rowName}",
	collapse: "Collapse {rowName}",
	loading: "Loading",
	empty: "Nothing to show.",
	sortAscending: "Sort by {column}, ascending",
	sortDescending: "Sort by {column}, descending",
	sortedAnnouncement: "Sorted by {column}, {direction}",
	selectAll: "Select all rows",
	selectRow: "Select {rowName}",
	selectedRows: "{count} of {total} rows selected",
	editing: "Editing {column}. Enter to save, Escape to cancel.",
	invalid: "{message}",
	rowCount: {
		one: "{count} row",
		other: "{count} rows"
	},
	position: "Row {row}, {column}",
	resize: "Resize {column}",
	scrollHint: "Scroll sideways to see more columns"
};
/** The width of a column that sets no `width`: DataGrid's columnWidth binding at its default token. */
const DEFAULT_COLUMN_SIZE = "var(--ds-tree-grid-column-size)";
/** Rows rendered before one row has been measured (a row count, not a size). */
const UNMEASURED_ROW_LIMIT = 50;
/** The selection column: a minimum target plus the cell's own inline padding on both sides. */
const SELECT_COLUMN_SIZE = "calc(var(--size-target-min) + 2 * var(--ds-tree-grid-cell-padding-inline))";
/** The row block size for the density (set in CSS from size.target.min / size.target.comfortable). */
const ROW_SIZE = "var(--ds-tree-grid-row-size)";
const FOCUSABLE_SELECTOR$1 = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/** Interactive content a cell's `render` may hold, whatever its tabindex. */
const CONTROL_SELECTOR = "a[href], button, input, select, textarea, [contenteditable=\"true\"]";
const NAVIGATION_KEYS = /* @__PURE__ */ new Set([
	"ArrowRight",
	"ArrowLeft",
	"ArrowDown",
	"ArrowUp",
	"Home",
	"End",
	"PageDown",
	"PageUp"
]);
/** The key of the placeholder row rendered under a `"lazy"` row while its children load. */
const PLACEHOLDER_PREFIX = "ds-tree-grid-loading:";
/** `defaultExpanded: ["*"]` — every row whose `children` is a non-empty array, now or once loaded. */
const EXPAND_ALL$1 = "*";
const isDev$2 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function interpolate$1(template, values) {
	let text = template;
	for (const [key, value] of Object.entries(values)) text = text.replaceAll(`{${key}}`, String(value));
	return text;
}
function pluralForm(forms, count) {
	const locale = typeof document !== "undefined" ? document.documentElement.lang || void 0 : void 0;
	return new Intl.PluralRules(locale).select(count) === "one" ? forms.one : forms.other;
}
function compareValues(a, b) {
	if (typeof a === "number" && typeof b === "number") return a - b;
	return String(a ?? "").localeCompare(String(b ?? ""), void 0, { numeric: true });
}
function textOf(value) {
	return value === void 0 || value === null ? "" : String(value);
}
function toCellValue(value) {
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	return value === void 0 || value === null ? void 0 : String(value);
}
function joinClasses(...parts) {
	return parts.filter(Boolean).join(" ");
}
/** A row shows the expand control when its children are lazy or a non-empty loaded list. */
function hasChildren$1(row) {
	return row.children === "lazy" || Array.isArray(row.children) && row.children.length > 0;
}
/** Every loaded descendant id (a `"lazy"` subtree contributes nothing). An O(subtree) walk. */
function descendantIds(row) {
	if (!Array.isArray(row.children)) return [];
	const ids = [];
	const walk = (list) => {
		for (const child of list) {
			ids.push(child.id);
			if (Array.isArray(child.children)) walk(child.children);
		}
	};
	walk(row.children);
	return ids;
}
/**
* TreeGrid — Design Schema, category: data. APG treegrid built on DataGrid's structure.
*
* When to use: Use a TreeGrid when records nest and each record has several comparable fields: a chart of
* accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs,
* an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use
* `selectChildren` when selection means "this and everything in it" (a folder to export).
*/
function TreeGrid({ ref, caption, captionLevel = "2", hideCaption = false, columns, data, expanded, defaultExpanded, sort, defaultSort, selectable = "none", selected, defaultSelected, selectChildren = false, editable = false, density = "compact", height = "viewport", loading = false, showStatusBar = true, stickyHeader = true, emptyMessage, container, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, onEditStart, onColumnResize, ...rest }) {
	const baseId = `ds-tree-grid-${useId()}`;
	const captionId = `${baseId}-caption`;
	const statusId = `${baseId}-status`;
	const cellPrefix = `${baseId}-cell-`;
	const cellId = (row, col) => `${cellPrefix}${row < 0 ? "h" : row}_${col}`;
	const scrollRef = useRef(null);
	const gridRef = useRef(null);
	const stepSizerRef = useRef(null);
	const targetSizerRef = useRef(null);
	const editorRef = useRef(null);
	const warnedRef = useRef(false);
	if (isDev$2 && !warnedRef.current) {
		warnedRef.current = true;
		const rowHeaders = columns.filter((column) => column.isRowHeader).length;
		if (rowHeaders !== 1) console.warn(`TreeGrid: exactly one column must be \`isRowHeader\`; found ${rowHeaders}.`);
		else if (!columns[0]?.isRowHeader) console.warn("TreeGrid: the `isRowHeader` column must come first.");
	}
	const hasSelectColumn = selectable === "row";
	const colOffset = hasSelectColumn ? 1 : 0;
	const colCount = colOffset + columns.length;
	const dataColumnAt = (col) => col < colOffset ? void 0 : columns[col - colOffset];
	const rowHeaderIndex = columns.findIndex((column) => column.isRowHeader);
	const rowHeaderColumn = columns[rowHeaderIndex];
	const rowHeaderCol = rowHeaderIndex < 0 ? -1 : rowHeaderIndex + colOffset;
	const [resizedWidths, setResizedWidths] = useState({});
	/** The column's width in pixels, or undefined while it takes DataGrid's columnWidth default. */
	const widthOf = (column) => resizedWidths[column.key] ?? column.width;
	const widthCss = (column) => {
		const width = widthOf(column);
		return width === void 0 ? DEFAULT_COLUMN_SIZE : `${width}px`;
	};
	/** The width of `columns[from..to)` as one CSS length: the pixel widths plus the default columns. */
	const widthSpan = (from, to) => {
		let pixels = 0;
		let defaults = 0;
		for (let i = from; i < to; i += 1) {
			const width = widthOf(columns[i]);
			if (width === void 0) defaults += 1;
			else pixels += width;
		}
		return defaults === 0 ? `${pixels}px` : `calc(${pixels}px + ${defaults} * ${DEFAULT_COLUMN_SIZE})`;
	};
	const gridTemplateColumns = [hasSelectColumn ? SELECT_COLUMN_SIZE : null, ...columns.map(widthCss)].filter(Boolean).join(" ");
	const pinnedStyle = (column, index) => {
		if (column.pinned === "start") {
			const before = widthSpan(0, index);
			return { insetInlineStart: hasSelectColumn ? `calc(${SELECT_COLUMN_SIZE} + ${before})` : before };
		}
		if (column.pinned === "end") return { insetInlineEnd: widthSpan(index + 1, columns.length) };
	};
	const { rowById, parentById, loadedIds } = useMemo(() => {
		const byId = /* @__PURE__ */ new Map();
		const parents = /* @__PURE__ */ new Map();
		const ids = [];
		const walk = (list, parentId) => {
			for (const row of list) {
				byId.set(row.id, row);
				parents.set(row.id, parentId);
				ids.push(row.id);
				if (Array.isArray(row.children)) walk(row.children, row.id);
			}
		};
		walk(data, null);
		return {
			rowById: byId,
			parentById: parents,
			loadedIds: ids
		};
	}, [data]);
	const total = loadedIds.length;
	const [announcement, setAnnouncement] = useState("");
	const expandedControlled = expanded !== void 0;
	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? []);
	/** Lazy rows a user has opened: a lazy id listed in `expanded` alone never opens on its own. */
	const [openedLazy, setOpenedLazy] = useState([]);
	const rawExpanded = expandedControlled ? expanded : internalExpanded;
	const expandedIds = useMemo(() => {
		const opened = new Set(openedLazy);
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		const add = (id) => {
			if (seen.has(id)) return;
			seen.add(id);
			out.push(id);
		};
		for (const id of rawExpanded) {
			if (id === EXPAND_ALL$1) continue;
			if (rowById.get(id)?.children === "lazy" && !opened.has(id)) continue;
			add(id);
		}
		if (rawExpanded.includes(EXPAND_ALL$1)) {
			const walk = (list) => {
				for (const row of list) {
					if (!Array.isArray(row.children) || row.children.length === 0) continue;
					add(row.id);
					walk(row.children);
				}
			};
			walk(data);
		}
		return out;
	}, [
		rawExpanded,
		openedLazy,
		rowById,
		data
	]);
	const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);
	const sortControlled = sort !== void 0;
	const [internalSort, setInternalSort] = useState(defaultSort);
	const activeSort = sortControlled ? sort : internalSort;
	const activateSort = (column) => {
		const direction = activeSort?.column === column.key && activeSort.direction === "ascending" ? "descending" : "ascending";
		if (!sortControlled) setInternalSort({
			column: column.key,
			direction
		});
		onSortChange?.(column.key, direction);
		setAnnouncement(interpolate$1(COPY$3.sortedAnnouncement, {
			column: column.header,
			direction
		}));
	};
	const visible = useMemo(() => {
		const localSort = sortControlled ? void 0 : activeSort;
		const list = [];
		const walk = (rows, level, parentId) => {
			const siblings = localSort ? [...rows].sort((a, b) => compareValues(a[localSort.column], b[localSort.column]) * (localSort.direction === "ascending" ? 1 : -1)) : rows;
			siblings.forEach((row, index) => {
				const parent = hasChildren$1(row);
				list.push({
					key: row.id,
					row,
					level,
					posinset: index + 1,
					setsize: siblings.length,
					hasChildren: parent,
					parentId,
					placeholder: false
				});
				if (!parent || !expandedSet.has(row.id)) return;
				if (row.children === "lazy") list.push({
					key: `${PLACEHOLDER_PREFIX}${row.id}`,
					row,
					level: level + 1,
					posinset: 1,
					setsize: 1,
					hasChildren: false,
					parentId: row.id,
					placeholder: true
				});
				else if (Array.isArray(row.children)) walk(row.children, level + 1, row.id);
			});
		};
		walk(data, 1, null);
		return list;
	}, [
		data,
		expandedSet,
		sortControlled,
		activeSort
	]);
	const visibleCount = visible.length;
	const indexByKey = useMemo(() => new Map(visible.map((entry, i) => [entry.key, i])), [visible]);
	const [active, setActiveState] = useState({
		key: null,
		col: 0
	});
	const resolveIndex = (key) => {
		let current = key;
		while (current !== null) {
			const index = indexByKey.get(current);
			if (index !== void 0) return index;
			current = current.startsWith(PLACEHOLDER_PREFIX) ? current.slice(21) : parentById.get(current) ?? null;
		}
		return -1;
	};
	const activeRow = Math.min(resolveIndex(active.key), visibleCount - 1);
	const activeCol = Math.max(0, Math.min(active.col, colCount - 1));
	const activeEntry = activeRow >= 0 ? visible[activeRow] : void 0;
	const keyboardMoveRef = useRef(false);
	const commitExpanded = (next, opened) => {
		if (!expandedControlled) setInternalExpanded(next);
		const lazy = opened.filter((id) => rowById.get(id)?.children === "lazy");
		if (lazy.length > 0) setOpenedLazy((prev) => [...prev, ...lazy.filter((id) => !prev.includes(id))]);
		for (const id of lazy) onExpand?.(id);
		onExpandChange?.(next);
	};
	const toggleExpand = (id) => {
		if (!expandedSet.has(id)) {
			commitExpanded([...expandedIds, id], [id]);
			return;
		}
		let current = active.key;
		while (current !== null && current !== id) current = current.startsWith(PLACEHOLDER_PREFIX) ? current.slice(21) : parentById.get(current) ?? null;
		if (current === id && active.key !== id) setActiveState({
			key: id,
			col: active.col
		});
		commitExpanded(expandedIds.filter((existing) => existing !== id), []);
	};
	/** `*`: every row at the focused row's level under the same parent, the focused row included. */
	const expandLevel = (entry) => {
		const siblings = entry.parentId === null ? data : rowById.get(entry.parentId)?.children;
		if (!Array.isArray(siblings)) return;
		const opened = siblings.filter((row) => hasChildren$1(row) && !expandedSet.has(row.id)).map((row) => row.id);
		if (opened.length > 0) commitExpanded([...expandedIds, ...opened], opened);
	};
	const selectedControlled = selected !== void 0;
	const [internalSelected, setInternalSelected] = useState(defaultSelected ?? []);
	const selectedIds = selectedControlled ? selected : internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const rowAnchorRef = useRef(null);
	/** What a row's checkbox shows: derived from its loaded descendants under `selectChildren`. */
	const shownState = (row) => {
		if (selectChildren) {
			const descendants = descendantIds(row);
			if (descendants.length > 0) {
				const count = descendants.filter((id) => selectedSet.has(id)).length;
				if (count === descendants.length) return "checked";
				if (count > 0) return "mixed";
			}
		}
		return selectedSet.has(row.id) ? "checked" : "unchecked";
	};
	const commitRows = (ids) => {
		if (!selectedControlled) setInternalSelected(ids);
		onSelectionChange?.(ids);
		setAnnouncement(interpolate$1(COPY$3.selectedRows, {
			count: ids.length,
			total
		}));
	};
	const toggleRow = (row) => {
		rowAnchorRef.current = row.id;
		const ids = selectChildren ? [row.id, ...descendantIds(row)] : [row.id];
		const drop = new Set(ids);
		const kept = selectedIds.filter((id) => !drop.has(id));
		commitRows(shownState(row) === "checked" ? kept : [...kept, ...ids]);
	};
	/** A plain toggle of one row's own id, with no cascade — what a range act does to its endpoint. */
	const toggleRowPlain = (row) => {
		rowAnchorRef.current = row.id;
		commitRows(selectedSet.has(row.id) ? selectedIds.filter((id) => id !== row.id) : [...selectedIds, row.id]);
	};
	/** Shift+Space / Shift+click: anchor through target over the visible rows; never cascades. */
	const extendRows = (target) => {
		const anchor = rowAnchorRef.current !== null ? indexByKey.get(rowAnchorRef.current) : void 0;
		const entry = visible[target];
		if (!entry || entry.placeholder) return;
		if (anchor === void 0) return toggleRowPlain(entry.row);
		const span = visible.slice(Math.min(anchor, target), Math.max(anchor, target) + 1).filter((item) => !item.placeholder).map((item) => item.key);
		const inSpan = new Set(span);
		commitRows([...selectedIds.filter((id) => !inSpan.has(id)), ...span]);
	};
	const allSelected = total > 0 && loadedIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && loadedIds.some((id) => selectedSet.has(id));
	const toggleAll = () => commitRows(allSelected ? [] : loadedIds);
	const [rowHeightPx, setRowHeightPx] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [scrolledX, setScrolledX] = useState(false);
	const [overflowX, setOverflowX] = useState(false);
	const virtualize = height !== "content";
	const measured = rowHeightPx > 0 && viewportHeight > 0;
	const pageSize = measured ? Math.max(1, Math.floor(viewportHeight / rowHeightPx) - 1) : 1;
	let windowStart = 0;
	let windowEnd = visibleCount - 1;
	if (virtualize) {
		if (measured) {
			const first = Math.floor(scrollTop / rowHeightPx);
			windowStart = Math.max(0, Math.min(first, visibleCount) - pageSize);
			windowEnd = Math.min(visibleCount - 1, first + 2 * pageSize + 1);
		} else windowEnd = Math.min(visibleCount, UNMEASURED_ROW_LIMIT) - 1;
	}
	const activeRendered = activeRow === -1 || activeRow >= windowStart && activeRow <= windowEnd;
	useLayoutEffect(() => {
		const region = scrollRef.current;
		if (!region) return void 0;
		const measure = () => {
			const viewport = region.clientHeight;
			setViewportHeight((prev) => prev === viewport ? prev : viewport);
			const rowEl = region.querySelector("[data-part=\"body\"] > [data-part=\"row\"]");
			const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
			if (rowHeight > 0) setRowHeightPx((prev) => prev === rowHeight ? prev : rowHeight);
			const overflow = region.scrollWidth > region.clientWidth;
			setOverflowX((prev) => prev === overflow ? prev : overflow);
		};
		measure();
		if (typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(measure);
		observer.observe(region);
		const rowEl = region.querySelector("[data-part=\"body\"] > [data-part=\"row\"]");
		if (rowEl) observer.observe(rowEl);
		return () => observer.disconnect();
	}, [
		density,
		windowStart,
		visibleCount === 0,
		height,
		colCount
	]);
	const handleScroll = () => {
		const region = scrollRef.current;
		if (!region) return;
		setScrollTop((prev) => prev === region.scrollTop ? prev : region.scrollTop);
		const x = region.scrollLeft !== 0;
		setScrolledX((prev) => prev === x ? prev : x);
	};
	useLayoutEffect(() => {
		if (!keyboardMoveRef.current) return;
		keyboardMoveRef.current = false;
		(typeof document !== "undefined" ? document.getElementById(cellId(activeRow, activeEntry?.placeholder ? 0 : activeCol)) : null)?.scrollIntoView?.({
			block: "nearest",
			inline: "nearest"
		});
	});
	const focusGrid = () => gridRef.current?.focus();
	const moveTo = (row, col) => {
		const r = Math.max(-1, Math.min(row, visibleCount - 1));
		const c = Math.max(0, Math.min(col, colCount - 1));
		const entry = r >= 0 ? visible[r] : void 0;
		keyboardMoveRef.current = true;
		setActiveState({
			key: entry ? entry.key : null,
			col: c
		});
		setAnnouncement("");
		const region = scrollRef.current;
		if (region && virtualize && rowHeightPx > 0 && r >= 0) {
			const top = r * rowHeightPx;
			if (top < region.scrollTop) region.scrollTop = top;
			else if (top + rowHeightPx > region.scrollTop + viewportHeight - rowHeightPx) region.scrollTop = top + 2 * rowHeightPx - viewportHeight;
		}
		const column = dataColumnAt(c);
		if (selectable === "cell" && column && entry && !entry.placeholder) onSelectionChange?.({
			rowId: entry.key,
			column: column.key
		});
	};
	const [editing, setEditingState] = useState(null);
	const editingRef = useRef(null);
	const setEditing = (next) => {
		editingRef.current = next;
		setEditingState(next);
	};
	const editValueRef = useRef(void 0);
	const pickerOpenRef = useRef(false);
	const [editError, setEditError] = useState(void 0);
	const openEditor = (rowIndex, col, seed) => {
		const column = dataColumnAt(col);
		const entry = visible[rowIndex];
		if (!editable || !column?.editable || !entry || entry.placeholder) return false;
		if (onEditStart?.(entry.key, column.key) === false) return false;
		const kind = column.editor ?? "text";
		const seeded = seed !== void 0 && (kind === "text" || kind === "number");
		editValueRef.current = seeded ? kind === "number" ? Number.isFinite(Number(seed)) ? Number(seed) : void 0 : seed : entry.row[column.key];
		pickerOpenRef.current = false;
		setActiveState({
			key: entry.key,
			col
		});
		setEditing({
			rowId: entry.key,
			column: column.key,
			seed: seeded ? seed : void 0
		});
		setEditError(void 0);
		setAnnouncement(interpolate$1(COPY$3.editing, { column: column.header }));
		return true;
	};
	const closeEditor = () => {
		setEditing(null);
		setEditError(void 0);
		setAnnouncement("");
	};
	const cancelEdit = () => {
		closeEditor();
		focusGrid();
	};
	/** Validates and commits the open editor; false when validation kept it open. */
	const commitEdit = () => {
		const current = editingRef.current;
		if (!current) return true;
		const row = rowById.get(current.rowId);
		const column = columns.find((entry) => entry.key === current.column);
		if (!row || !column) {
			closeEditor();
			return true;
		}
		const value = editValueRef.current;
		const message = column.validate?.(value, row);
		if (message) {
			setEditError(message);
			setAnnouncement(interpolate$1(COPY$3.invalid, { message }));
			return false;
		}
		const previous = row[column.key];
		closeEditor();
		if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, toCellValue(value), toCellValue(previous));
		return true;
	};
	const editableCols = () => columns.flatMap((column, i) => column.editable ? [i + colOffset] : []);
	/** Delete / Backspace: clear the editable cells the selection covers. */
	const clearSelection = () => {
		const targets = [];
		if (selectable === "row") for (const id of loadedIds) {
			const row = selectedSet.has(id) ? rowById.get(id) : void 0;
			if (row) {
				for (const column of columns) if (column.editable) targets.push([row, column]);
			}
		}
		else if (selectable === "cell") {
			const column = dataColumnAt(activeCol);
			if (activeEntry && !activeEntry.placeholder && column?.editable) targets.push([activeEntry.row, column]);
		}
		for (const [row, column] of targets) onCellChange?.(row.id, column.key, void 0, toCellValue(row[column.key]));
		return targets.length > 0;
	};
	const handleEditorKeyDown = (event, column) => {
		const kind = column.editor ?? "text";
		event.stopPropagation();
		if (event.key === "Escape") {
			if (pickerOpenRef.current) return;
			event.preventDefault();
			cancelEdit();
		} else if (event.key === "Enter") {
			if (kind === "select" || kind === "date" && pickerOpenRef.current) return;
			event.preventDefault();
			if (commitEdit()) {
				focusGrid();
				moveTo(activeRow + 1, activeCol);
			}
		} else if (event.key === "F2") {
			event.preventDefault();
			if (commitEdit()) focusGrid();
		} else if (event.key === "Tab") {
			const row = activeRow;
			const cols = editableCols();
			const next = event.shiftKey ? [...cols].reverse().find((c) => c < activeCol) : cols.find((c) => c > activeCol);
			if (!commitEdit()) {
				event.preventDefault();
				return;
			}
			focusGrid();
			if (next !== void 0) {
				event.preventDefault();
				if (!openEditor(row, next)) setActiveState({
					key: visible[row]?.key ?? null,
					col: next
				});
			}
		}
	};
	const handleEditorBlur = (event, cell) => {
		if (event.currentTarget.contains(event.relatedTarget) || pickerOpenRef.current) return;
		const current = editingRef.current;
		if (!current || current.rowId !== cell.rowId || current.column !== cell.column) return;
		const kind = columns.find((column) => column.key === cell.column)?.editor ?? "text";
		if (kind === "text" || kind === "number" || kind === "date") commitEdit();
	};
	useEffect(() => {
		if (!editing) return;
		const target = editorRef.current?.querySelector("input, button, select, textarea, [tabindex]");
		target?.focus();
		if (target instanceof HTMLInputElement && editing.seed !== void 0) try {
			target.setSelectionRange(target.value.length, target.value.length);
		} catch {}
	}, [editing]);
	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;
		for (const el of grid.querySelectorAll(FOCUSABLE_SELECTOR$1)) {
			if (el === grid || el.closest("[data-part=\"editor\"]")) continue;
			if (el.tabIndex !== -1) el.tabIndex = -1;
		}
	});
	const pendingResizeRef = useRef(null);
	/** The floor for both resize paths: the column's own `minWidth`, never below size.target.min. */
	const minWidthOf = (column) => Math.max(column.minWidth ?? 0, targetSizerRef.current?.getBoundingClientRect().width ?? 0);
	/** Where a resize starts from: the set width, or the rendered width of a default-width column. */
	const currentWidth = (column, index) => {
		const width = widthOf(column);
		if (width !== void 0) return width;
		const header = typeof document !== "undefined" ? document.getElementById(cellId(-1, index + colOffset)) : null;
		return header ? header.getBoundingClientRect().width : 0;
	};
	const resizeTo = (column, width) => {
		const next = Math.round(Math.max(minWidthOf(column), width));
		setResizedWidths((prev) => prev[column.key] === next ? prev : {
			...prev,
			[column.key]: next
		});
		return next;
	};
	const startPointerResize = (event, column, index) => {
		event.preventDefault();
		event.stopPropagation();
		const handle = event.currentTarget;
		const startX = event.clientX;
		const startWidth = currentWidth(column, index);
		const rtl = typeof getComputedStyle === "function" && getComputedStyle(handle).direction === "rtl";
		let width = startWidth;
		handle.setPointerCapture?.(event.pointerId);
		const move = (e) => {
			width = resizeTo(column, startWidth + (rtl ? startX - e.clientX : e.clientX - startX));
		};
		const up = (e) => {
			handle.releasePointerCapture?.(e.pointerId);
			handle.removeEventListener("pointermove", move);
			handle.removeEventListener("pointerup", up);
			handle.removeEventListener("pointercancel", up);
			onColumnResize?.(column.key, width);
		};
		handle.addEventListener("pointermove", move);
		handle.addEventListener("pointerup", up);
		handle.addEventListener("pointercancel", up);
	};
	const handleKeyDown = (event) => {
		if (editingRef.current) return;
		const grid = gridRef.current;
		if (!grid) return;
		if (event.target !== grid) {
			if (event.key === "Escape" || event.key === "F2") {
				event.preventDefault();
				focusGrid();
				return;
			}
			if (event.key === "Tab" && event.shiftKey) {
				focusGrid();
				return;
			}
			if (!NAVIGATION_KEYS.has(event.key)) return;
			focusGrid();
		}
		const row = activeRow;
		const col = activeCol;
		const entry = activeEntry;
		const column = dataColumnAt(col);
		const ctrl = event.ctrlKey || event.metaKey;
		const onRowHeader = entry !== void 0 && !entry.placeholder && col === rowHeaderCol;
		switch (event.key) {
			case "ArrowRight":
			case "ArrowLeft": {
				event.preventDefault();
				const delta = event.key === "ArrowRight" ? 1 : -1;
				if (event.shiftKey && row === -1 && column?.resizable) {
					const step = stepSizerRef.current?.getBoundingClientRect().width ?? 0;
					const rtl = getComputedStyle(grid).direction === "rtl";
					const width = resizeTo(column, currentWidth(column, col - colOffset) + (rtl ? -delta : delta) * step);
					pendingResizeRef.current = {
						column: column.key,
						width
					};
					return;
				}
				if (delta === 1) {
					if (onRowHeader && entry.hasChildren && !expandedSet.has(entry.key)) toggleExpand(entry.key);
					else moveTo(row, col + 1);
					return;
				}
				if (onRowHeader && entry.hasChildren && expandedSet.has(entry.key)) {
					toggleExpand(entry.key);
					return;
				}
				if (entry && (onRowHeader || entry.placeholder)) {
					const parent = entry.parentId !== null ? indexByKey.get(entry.parentId) : void 0;
					if (parent !== void 0) moveTo(parent, rowHeaderCol);
					else moveTo(row, col - 1);
					return;
				}
				moveTo(row, col - 1);
				return;
			}
			case "ArrowDown":
				event.preventDefault();
				moveTo(row + 1, col);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveTo(row - 1, col);
				return;
			case "Home":
				event.preventDefault();
				moveTo(ctrl ? -1 : row, 0);
				return;
			case "End":
				event.preventDefault();
				moveTo(ctrl ? visibleCount - 1 : row, colCount - 1);
				return;
			case "PageDown":
				event.preventDefault();
				moveTo(row + pageSize, col);
				return;
			case "PageUp":
				event.preventDefault();
				moveTo(row < 0 ? row : Math.max(0, row - pageSize), col);
				return;
			case "Enter": {
				event.preventDefault();
				if (row === -1) {
					if (hasSelectColumn && col === 0) toggleAll();
					else if (column?.sortable) activateSort(column);
					return;
				}
				if (!entry || entry.placeholder) return;
				if (hasSelectColumn && col === 0) {
					toggleRow(entry.row);
					return;
				}
				if (onRowHeader && entry.hasChildren) {
					toggleExpand(entry.key);
					return;
				}
				if (openEditor(row, col)) return;
				const control = document.getElementById(cellId(row, col))?.querySelector(CONTROL_SELECTOR);
				if (control) {
					control.focus();
					control.click();
				}
				return;
			}
			case "*":
				event.preventDefault();
				if (entry && !entry.placeholder) expandLevel(entry);
				return;
			case "F2":
				event.preventDefault();
				if (row >= 0) openEditor(row, col);
				return;
			case " ":
				if (selectable !== "row") return;
				event.preventDefault();
				if (!entry || entry.placeholder) return;
				if (event.shiftKey) extendRows(row);
				else toggleRow(entry.row);
				return;
			case "Delete":
			case "Backspace":
				if (editable && clearSelection()) event.preventDefault();
				return;
		}
		if (ctrl && event.code === "KeyA" && selectable === "row") {
			event.preventDefault();
			commitRows(loadedIds);
			return;
		}
		if (event.key.length === 1 && event.key !== " " && !ctrl && !event.altKey && row >= 0 && openEditor(row, col, event.key)) event.preventDefault();
	};
	const handleKeyUp = (event) => {
		if (event.key !== "Shift" || !pendingResizeRef.current) return;
		const { column, width } = pendingResizeRef.current;
		pendingResizeRef.current = null;
		onColumnResize?.(column, width);
	};
	const positionOf = (target) => {
		const cell = target instanceof Element ? target.closest("[role=\"gridcell\"], [role=\"rowheader\"], [role=\"columnheader\"]") : null;
		if (!cell || !cell.id.startsWith(cellPrefix) || !gridRef.current?.contains(cell)) return null;
		const [r, c] = cell.id.slice(cellPrefix.length).split("_");
		return {
			row: r === "h" ? -1 : Number(r),
			col: Number(c)
		};
	};
	const handleMouseDown = (event) => {
		const target = event.target;
		if (target.closest("[data-part=\"expandButton\"]")) {
			event.preventDefault();
			focusGrid();
			return;
		}
		if (target.closest("[data-part=\"editor\"]") || target.closest(CONTROL_SELECTOR)) return;
		if (!positionOf(target)) return;
		event.preventDefault();
		focusGrid();
	};
	const handlePointerDown = (event) => {
		if (event.button !== 0) return;
		const target = event.target;
		if (target.closest("[data-part=\"editor\"]")) return;
		const pos = positionOf(target);
		if (!pos) return;
		const entry = pos.row >= 0 ? visible[pos.row] : void 0;
		setActiveState({
			key: entry ? entry.key : null,
			col: pos.col
		});
		setAnnouncement("");
		const column = dataColumnAt(pos.col);
		if (!entry || entry.placeholder || !column) return;
		if (selectable === "cell") onSelectionChange?.({
			rowId: entry.key,
			column: column.key
		});
		else if (selectable === "row") {
			if (event.shiftKey) extendRows(pos.row);
			else if (event.ctrlKey || event.metaKey) toggleRow(entry.row);
		}
	};
	const handleDoubleClick = (event) => {
		if (event.target.closest("[data-part=\"expandButton\"]")) return;
		const pos = positionOf(event.target);
		if (pos && pos.row >= 0 && !editingRef.current) openEditor(pos.row, pos.col);
	};
	const rootStyle = {};
	for (const [binding, hook] of Object.entries(OVERRIDE_HOOKS)) {
		const token = overrides?.[binding];
		if (token) rootStyle[hook] = cssVar(token);
	}
	const headerTextOverrides = {
		paddingInline: "space.0",
		fontSize: "font.size.sm",
		fontWeight: "font.weight.semibold"
	};
	const renderEditor = (column, row, cell) => {
		const name = `${baseId}-editor`;
		const current = row[column.key];
		const setValue = (value) => {
			editValueRef.current = value;
		};
		const commitOnChange = (value) => {
			setValue(value);
			if (commitEdit()) focusGrid();
		};
		const zeroInset = {
			paddingInline: "space.0",
			paddingBlock: "space.0"
		};
		switch (column.editor ?? "text") {
			case "number": return /* @__PURE__ */ jsx(NumberInput, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: cell.seed !== void 0 ? editValueRef.current : typeof current === "number" ? current : void 0,
				overrides: zeroInset,
				onChange: setValue
			});
			case "select": return /* @__PURE__ */ jsx(Select, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				options: column.options ?? [],
				defaultValue: textOf(current),
				container,
				overrides: {
					triggerPaddingInline: "space.0",
					triggerPaddingBlock: "space.0"
				},
				onOpenChange: (open) => {
					pickerOpenRef.current = open;
				},
				onChange: (value) => commitOnChange(Array.isArray(value) ? value[0] : value)
			});
			case "date": return /* @__PURE__ */ jsx(DatePicker, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: typeof current === "string" ? current : void 0,
				container,
				overrides: zeroInset,
				onOpenChange: (open) => {
					pickerOpenRef.current = open;
				},
				onChange: (value) => setValue(typeof value === "string" ? value : void 0)
			});
			case "checkbox": return /* @__PURE__ */ jsx(Checkbox, {
				label: column.header,
				hideLabel: true,
				name,
				checked: Boolean(current),
				onChange: commitOnChange
			});
			default: return /* @__PURE__ */ jsx(Input, {
				label: column.header,
				hideLabel: true,
				size: "sm",
				name,
				defaultValue: cell.seed ?? textOf(current),
				overrides: zeroInset,
				onChange: setValue
			});
		}
	};
	const headerCell = (column, index) => {
		const col = index + colOffset;
		const sorted = activeSort?.column === column.key ? activeSort.direction : void 0;
		const next = sorted === "ascending" ? "descending" : "ascending";
		const width = widthOf(column);
		return /* @__PURE__ */ jsxs("div", {
			id: cellId(-1, col),
			role: "columnheader",
			"aria-colindex": col + 1,
			"aria-sort": column.sortable ? sorted : void 0,
			tabIndex: -1,
			"data-part": "columnHeader",
			className: joinClasses("ds-tree-grid__cell", "ds-tree-grid__cell--header", column.align && column.align !== "start" && `ds-tree-grid__cell--align-${column.align}`, column.pinned && "ds-tree-grid__cell--pinned", activeRow === -1 && activeCol === col && "ds-tree-grid__cell--active"),
			style: pinnedStyle(column, index),
			children: [column.sortable ? /* @__PURE__ */ jsx("span", {
				className: "ds-tree-grid__sort",
				"data-part": "sortButton",
				onClick: () => activateSort(column),
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					label: column.header,
					accessibleName: interpolate$1(next === "ascending" ? COPY$3.sortAscending : COPY$3.sortDescending, { column: column.header }),
					trailingIcon: sorted ? /* @__PURE__ */ jsx(Icon, {
						name: sorted === "ascending" ? "chevron-up" : "chevron-down",
						inline: true
					}) : void 0,
					overrides: headerTextOverrides,
					tabIndex: -1
				})
			}) : column.abbr ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				children: column.header
			}), /* @__PURE__ */ jsx("span", {
				className: "ds-tree-grid__visually-hidden",
				children: column.abbr
			})] }) : column.header, column.resizable ? /* @__PURE__ */ jsx("div", {
				role: "separator",
				"aria-orientation": "vertical",
				"aria-valuenow": width,
				"aria-valuemin": column.minWidth,
				"aria-label": interpolate$1(COPY$3.resize, { column: column.header }),
				className: "ds-tree-grid__resize-handle",
				onPointerDown: (event) => startPointerResize(event, column, index)
			}) : null]
		}, column.key);
	};
	const rowHeaderContent = (entry, column, name) => {
		const isExpanded = expandedSet.has(entry.key);
		return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			className: "ds-tree-grid__indent",
			"data-part": "indent"
		}), /* @__PURE__ */ jsxs("span", {
			className: "ds-tree-grid__row-header",
			children: [entry.hasChildren ? /* @__PURE__ */ jsx("span", {
				className: joinClasses("ds-tree-grid__expand", isExpanded && "ds-tree-grid__expand--expanded"),
				"data-part": "expandButton",
				onClick: () => toggleExpand(entry.key),
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					label: interpolate$1(isExpanded ? COPY$3.collapse : COPY$3.expand, { rowName: name }),
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "chevron-right",
						inline: true
					}),
					overrides: {
						paddingInline: "space.0",
						paddingBlock: "space.0"
					},
					tabIndex: -1
				})
			}) : /* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				className: "ds-tree-grid__expand"
			}), /* @__PURE__ */ jsx("span", {
				className: joinClasses("ds-tree-grid__cell-content", entry.hasChildren && "ds-tree-grid__cell-content--parent"),
				"data-part": "cellContent",
				children: column.render ? column.render(entry.row) : textOf(entry.row[column.key])
			})]
		})] });
	};
	const bodyCell = (entry, rowIndex, column, index, name) => {
		const col = index + colOffset;
		const isEditing = editing?.rowId === entry.key && editing.column === column.key;
		const isActive = activeRow === rowIndex && activeCol === col;
		/** numericFont, as DataGrid: cells whose raw value is a number and that have no `render`. */
		const numeric = !column.render && typeof entry.row[column.key] === "number";
		return /* @__PURE__ */ jsx("div", {
			id: cellId(rowIndex, col),
			role: column.isRowHeader ? "rowheader" : "gridcell",
			"aria-colindex": col + 1,
			"aria-selected": selectable === "cell" ? isActive : void 0,
			"aria-readonly": editable && !column.editable ? true : void 0,
			"aria-describedby": isEditing && editError ? statusId : void 0,
			tabIndex: -1,
			"data-part": column.isRowHeader ? "rowHeader" : "cell",
			className: joinClasses("ds-tree-grid__cell", column.isRowHeader && "ds-tree-grid__cell--row-header", column.align && column.align !== "start" && `ds-tree-grid__cell--align-${column.align}`, numeric && "ds-tree-grid__cell--numeric", column.pinned && "ds-tree-grid__cell--pinned", isActive && "ds-tree-grid__cell--active", isEditing && "ds-tree-grid__cell--editing", isEditing && editError && "ds-tree-grid__cell--invalid"),
			style: pinnedStyle(column, index),
			children: isEditing && editing ? /* @__PURE__ */ jsx("div", {
				ref: editorRef,
				className: "ds-tree-grid__editor",
				"data-part": "editor",
				onKeyDown: (event) => handleEditorKeyDown(event, column),
				onBlur: (event) => handleEditorBlur(event, editing),
				children: renderEditor(column, entry.row, editing)
			}) : column.isRowHeader ? rowHeaderContent(entry, column, name) : /* @__PURE__ */ jsx("span", {
				className: "ds-tree-grid__cell-content",
				"data-part": "cellContent",
				children: column.render ? column.render(entry.row) : textOf(entry.row[column.key])
			})
		}, column.key);
	};
	const bodyRow = (entry, rowIndex) => {
		const style = {
			gridTemplateColumns,
			"--ds-tree-grid-depth": String(entry.level - 1)
		};
		if (virtualize) style.transform = `translateY(calc(${rowIndex} * ${ROW_SIZE}))`;
		const rowClass = joinClasses("ds-tree-grid__row", entry.level > 1 && "ds-tree-grid__row--nested");
		if (entry.placeholder) return /* @__PURE__ */ jsx("div", {
			role: "row",
			"aria-rowindex": rowIndex + 2,
			"aria-level": entry.level,
			"aria-setsize": entry.setsize,
			"aria-posinset": entry.posinset,
			"data-part": "row",
			className: rowClass,
			style,
			children: /* @__PURE__ */ jsxs("div", {
				id: cellId(rowIndex, 0),
				role: "gridcell",
				"aria-colindex": 1,
				tabIndex: -1,
				className: joinClasses("ds-tree-grid__cell", "ds-tree-grid__cell--placeholder", activeRow === rowIndex && "ds-tree-grid__cell--active"),
				style: { gridColumn: "1 / -1" },
				children: [
					hasSelectColumn ? /* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "ds-tree-grid__select-spacer"
					}) : null,
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "ds-tree-grid__indent"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "ds-tree-grid__row-header",
						children: [/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							className: "ds-tree-grid__expand"
						}), /* @__PURE__ */ jsx(Text, {
							element: "span",
							size: "sm",
							tone: "muted",
							children: COPY$3.loading
						})]
					})
				]
			})
		}, entry.key);
		const row = entry.row;
		const name = rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;
		const isExpanded = expandedSet.has(entry.key);
		const state = hasSelectColumn ? shownState(row) : "unchecked";
		return /* @__PURE__ */ jsxs("div", {
			role: "row",
			"aria-rowindex": rowIndex + 2,
			"aria-level": entry.level,
			"aria-setsize": entry.setsize,
			"aria-posinset": entry.posinset,
			"aria-expanded": entry.hasChildren ? isExpanded : void 0,
			"aria-busy": entry.hasChildren && isExpanded && row.children === "lazy" ? true : void 0,
			"aria-selected": hasSelectColumn ? state === "checked" : void 0,
			"data-part": "row",
			className: rowClass,
			style,
			children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
				id: cellId(rowIndex, 0),
				role: "gridcell",
				"aria-colindex": 1,
				tabIndex: -1,
				"data-part": "selectCell",
				className: joinClasses("ds-tree-grid__cell", "ds-tree-grid__cell--select", "ds-tree-grid__cell--pinned", activeRow === rowIndex && activeCol === 0 && "ds-tree-grid__cell--active"),
				style: { insetInlineStart: 0 },
				onClick: (event) => {
					if (!event.target.closest("[data-ds=\"Checkbox\"]")) toggleRow(row);
				},
				children: /* @__PURE__ */ jsx(Checkbox, {
					label: interpolate$1(COPY$3.selectRow, { rowName: name }),
					hideLabel: true,
					name: `${baseId}-select`,
					value: row.id,
					checked: state === "checked",
					indeterminate: state === "mixed",
					tabIndex: -1,
					onChange: () => toggleRow(row)
				})
			}) : null, columns.map((column, index) => bodyCell(entry, rowIndex, column, index, name))]
		}, entry.key);
	};
	const renderedRows = [];
	for (let i = Math.max(0, windowStart); i <= windowEnd; i += 1) {
		const entry = visible[i];
		if (entry) renderedRows.push(bodyRow(entry, i));
	}
	const summary = [interpolate$1(pluralForm(COPY$3.rowCount, total), { count: total })];
	if (selectable === "row" && selectedIds.length > 0) summary.push(interpolate$1(COPY$3.selectedRows, {
		count: selectedIds.length,
		total
	}));
	const liveText = loading ? COPY$3.loading : editError ? interpolate$1(COPY$3.invalid, { message: editError }) : announcement;
	const activeColumn = activeEntry?.placeholder ? rowHeaderColumn : dataColumnAt(activeCol);
	const position = activeRow >= 0 && activeColumn ? interpolate$1(COPY$3.position, {
		row: activeRow + 1,
		column: activeColumn.header
	}) : "";
	const empty = visibleCount === 0 && !loading;
	const activeDescendant = activeRendered && colCount > 0 && !empty ? cellId(activeRow, activeEntry?.placeholder ? 0 : activeCol) : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "TreeGrid",
		"data-part": "container",
		className: joinClasses("ds-tree-grid", `ds-tree-grid--density-${density}`, `ds-tree-grid--height-${height}`, hasSelectColumn && "ds-tree-grid--selectable-row", virtualize && "ds-tree-grid--virtual", (stickyHeader || virtualize) && "ds-tree-grid--sticky-header", scrollTop > 0 && "ds-tree-grid--scrolled-y", scrolledX && "ds-tree-grid--scrolled-x", loading && "ds-tree-grid--loading"),
		style: rootStyle,
		children: [
			/* @__PURE__ */ jsx("span", {
				ref: stepSizerRef,
				"aria-hidden": "true",
				className: "ds-tree-grid__sizer ds-tree-grid__sizer--step"
			}),
			/* @__PURE__ */ jsx("span", {
				ref: targetSizerRef,
				"aria-hidden": "true",
				className: "ds-tree-grid__sizer ds-tree-grid__sizer--target"
			}),
			/* @__PURE__ */ jsx("div", {
				"data-part": "caption",
				className: hideCaption ? "ds-tree-grid__visually-hidden" : "ds-tree-grid__caption",
				children: /* @__PURE__ */ jsx(Heading, {
					id: captionId,
					level: captionLevel,
					size: "md",
					overrides: { marginBlockEnd: "space.0" },
					children: caption
				})
			}),
			/* @__PURE__ */ jsx("div", {
				ref: scrollRef,
				"data-part": "scrollRegion",
				className: "ds-tree-grid__scroll-region",
				onScroll: handleScroll,
				children: /* @__PURE__ */ jsxs("div", {
					ref: gridRef,
					role: "treegrid",
					"data-part": "grid",
					className: "ds-tree-grid__grid",
					tabIndex: 0,
					"aria-labelledby": captionId,
					"aria-describedby": showStatusBar ? statusId : void 0,
					"aria-rowcount": visibleCount + 1,
					"aria-colcount": colCount,
					"aria-multiselectable": selectable === "row" ? true : void 0,
					"aria-readonly": !editable,
					"aria-busy": loading ? true : void 0,
					"aria-activedescendant": activeDescendant,
					onKeyDown: handleKeyDown,
					onKeyUp: handleKeyUp,
					onMouseDown: handleMouseDown,
					onPointerDown: handlePointerDown,
					onDoubleClick: handleDoubleClick,
					children: [/* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "header",
						className: "ds-tree-grid__header",
						children: /* @__PURE__ */ jsxs("div", {
							role: "row",
							"aria-rowindex": 1,
							"data-part": "headerRow",
							className: "ds-tree-grid__row",
							style: { gridTemplateColumns },
							children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
								id: cellId(-1, 0),
								role: "columnheader",
								"aria-colindex": 1,
								tabIndex: -1,
								"data-part": "selectAllCell",
								className: joinClasses("ds-tree-grid__cell", "ds-tree-grid__cell--header", "ds-tree-grid__cell--select", "ds-tree-grid__cell--pinned", activeRow === -1 && activeCol === 0 && "ds-tree-grid__cell--active"),
								style: { insetInlineStart: 0 },
								onClick: (event) => {
									if (!event.target.closest("[data-ds=\"Checkbox\"]")) toggleAll();
								},
								children: /* @__PURE__ */ jsx(Checkbox, {
									label: COPY$3.selectAll,
									hideLabel: true,
									name: `${baseId}-select-all`,
									checked: allSelected,
									indeterminate: someSelected,
									tabIndex: -1,
									onChange: toggleAll
								})
							}) : null, columns.map(headerCell)]
						})
					}), /* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "body",
						className: "ds-tree-grid__body",
						style: virtualize ? { blockSize: `calc(${empty ? 0 : visibleCount} * ${ROW_SIZE})` } : void 0,
						children: empty ? /* @__PURE__ */ jsx("div", {
							role: "row",
							"aria-rowindex": 2,
							className: "ds-tree-grid__empty-row",
							children: /* @__PURE__ */ jsx("div", {
								role: "gridcell",
								"aria-colindex": 1,
								className: "ds-tree-grid__empty",
								style: { gridColumn: "1 / -1" },
								children: /* @__PURE__ */ jsx(Text, {
									element: "p",
									tone: "muted",
									"data-part": "emptyState",
									children: emptyMessage ?? COPY$3.empty
								})
							})
						}) : renderedRows
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: showStatusBar ? "ds-tree-grid__status-bar" : "ds-tree-grid__visually-hidden",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "ds-tree-grid__status-group",
					children: [showStatusBar ? summary.map((text) => /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "xs",
						tone: "muted",
						children: text
					}, text)) : null, /* @__PURE__ */ jsx(Text, {
						id: statusId,
						"data-part": "statusBar",
						element: "span",
						size: "xs",
						tone: "muted",
						role: "status",
						"aria-live": "polite",
						children: liveText
					})]
				}), showStatusBar ? /* @__PURE__ */ jsxs("span", {
					className: "ds-tree-grid__status-group",
					children: [overflowX && !scrolledX ? /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "xs",
						tone: "muted",
						children: COPY$3.scrollHint
					}) : null, position ? /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "xs",
						tone: "muted",
						children: position
					}) : null]
				}) : null]
			})
		]
	});
}
//#endregion
//#region src/Tree.tsx
/** copy.* — used verbatim; `{label}` and `{count}` are replaced with the running values. */
const COPY$2 = {
	expand: "Expand {label}",
	collapse: "Collapse {label}",
	selectedCount: "{count} selected",
	loading: "Loading",
	empty: "Nothing here."
};
/** constants.typeaheadReset — how long typed characters accumulate before the buffer clears. */
const TYPEAHEAD_RESET = 500;
/**
* `defaultExpanded: ["*"]` — every node whose `children` is a non-empty array, now or once loaded, and
* never a `"lazy"` node. Reserved as the sentinel, so a node whose id is literally `"*"` never matches it.
*/
const EXPAND_ALL = "*";
const OVERRIDE_HOOK$1 = {
	indent: "--ds-tree-indent",
	rowPaddingInline: "--ds-tree-row-padding-inline",
	rowRadius: "--ds-tree-row-radius",
	rowGap: "--ds-tree-row-gap",
	rowHover: "--ds-tree-row-hover",
	guideLine: "--ds-tree-guide-line",
	guideLineWidth: "--ds-tree-guide-line-width",
	checkboxGap: "--ds-tree-checkbox-gap",
	checkboxSize: "--ds-tree-checkbox-size",
	checkboxBorderWidth: "--ds-tree-checkbox-border-width",
	checkboxBackground: "--ds-tree-checkbox-background",
	checkboxRadius: "--ds-tree-checkbox-radius",
	fontFamily: "--ds-tree-font-family",
	fontSize: "--ds-tree-font-size",
	lineHeight: "--ds-tree-line-height",
	disabledOpacity: "--ds-tree-disabled-opacity",
	transition: "--ds-tree-transition"
};
function overridesToStyle$1(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const hook = OVERRIDE_HOOK$1[binding];
		const ref = overrides[binding];
		if (hook && ref) style[hook] = cssVar(ref);
	}
	return style;
}
function interpolate(template, values) {
	return template.replace(/\{(\w+)\}/g, (match, key) => key in values ? String(values[key]) : match);
}
function hasChildren(node) {
	return node.children === "lazy" || Array.isArray(node.children) && node.children.length > 0;
}
function loadedChildren(node) {
	return Array.isArray(node.children) ? node.children : [];
}
/** Every node id in document order, expanded or not. */
function allNodes(nodes, out = []) {
	for (const node of nodes) {
		out.push(node);
		allNodes(loadedChildren(node), out);
	}
	return out;
}
/**
* Every enabled loaded descendant. A disabled node is skipped as a target but does not wall off its
* subtree — the walk carries on through it — and a `"lazy"` subtree contributes nothing until loaded.
*/
function enabledDescendants(node) {
	return allNodes(loadedChildren(node)).filter((descendant) => !descendant.disabled);
}
/** The ids a selection toggle touches: the node, plus its enabled loaded descendants when cascading. */
function cascadeIds(node, cascade) {
	if (!cascade) return [node.id];
	return [node.id, ...enabledDescendants(node).map((descendant) => descendant.id)];
}
/**
* With `selectChildren`, a parent's id is in `selected` exactly when all its enabled loaded descendants
* are, so unchecking any descendant removes it and every ancestor id. A parent with no enabled loaded
* descendants at all behaves as a leaf and keeps only whatever its own id already carried.
*/
function normalizeCascade(nodes, set) {
	for (const node of nodes) {
		const children = loadedChildren(node);
		if (children.length === 0) continue;
		normalizeCascade(children, set);
		if (node.disabled) continue;
		const descendants = enabledDescendants(node);
		if (descendants.length === 0) continue;
		if (descendants.every((descendant) => set.has(descendant.id))) set.add(node.id);
		else set.delete(node.id);
	}
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
function Tree({ ref, label, showLabel = false, headingLevel = "2", nodes, expanded, defaultExpanded, selectable = "single", selected, defaultSelected, selectChildren = false, selectOnFocus = false, showGuides = true, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, ...rest }) {
	const baseId = useId();
	const headingId = `${baseId}-heading`;
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const typeahead = useRef({
		buffer: "",
		timer: void 0
	});
	const everyNode = useMemo(() => allNodes(nodes), [nodes]);
	const nodeById = useMemo(() => new Map(everyNode.map((node) => [node.id, node])), [everyNode]);
	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? []);
	/** Lazy ids the user has opened: a lazy id listed in `expanded`/`defaultExpanded` alone never opens itself. */
	const [openedLazy, setOpenedLazy] = useState([]);
	const rawExpanded = expanded ?? internalExpanded;
	/** The caller's list with `"*"` resolved to concrete ids; a held-lazy id stays in it and in what is reported. */
	const expandedIds = useMemo(() => {
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		const add = (id) => {
			if (seen.has(id)) return;
			seen.add(id);
			out.push(id);
		};
		for (const id of rawExpanded) if (id !== EXPAND_ALL) add(id);
		if (rawExpanded.includes(EXPAND_ALL)) {
			const walk = (list) => {
				for (const node of list) {
					if (!Array.isArray(node.children) || node.children.length === 0) continue;
					add(node.id);
					walk(node.children);
				}
			};
			walk(nodes);
		}
		return out;
	}, [rawExpanded, nodes]);
	/** What actually renders open: a still-`"lazy"` id waits for the user act that fires onExpand. */
	const expandedSet = useMemo(() => new Set(expandedIds.filter((id) => nodeById.get(id)?.children !== "lazy" || openedLazy.includes(id))), [
		expandedIds,
		openedLazy,
		nodeById
	]);
	const commitExpanded = (next, opened) => {
		const lazy = opened.filter((id) => nodeById.get(id)?.children === "lazy");
		if (lazy.length > 0) setOpenedLazy((prev) => [...prev, ...lazy.filter((id) => !prev.includes(id))]);
		for (const id of lazy) onExpand?.(id);
		if (expanded === void 0) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpanded = (id) => {
		if (expandedSet.has(id)) {
			commitExpanded(expandedIds.filter((existing) => existing !== id), []);
			return;
		}
		commitExpanded(expandedIds.includes(id) ? expandedIds : [...expandedIds, id], [id]);
	};
	const visible = useMemo(() => {
		const out = [];
		const walk = (list, level, parentId) => {
			for (const node of list) {
				out.push({
					node,
					level,
					parentId,
					siblings: list
				});
				if (expandedSet.has(node.id)) walk(loadedChildren(node), level + 1, node.id);
			}
		};
		walk(nodes, 1, null);
		return out;
	}, [nodes, expandedSet]);
	const navigable = useMemo(() => visible.filter((entry) => !entry.node.disabled), [visible]);
	const [internalSelected, setInternalSelected] = useState(defaultSelected ?? []);
	const selectedIds = selected ?? internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const commitSelection = (nextSet) => {
		if (selectable === "multiple" && selectChildren) normalizeCascade(nodes, nextSet);
		const ordered = everyNode.map((node) => node.id).filter((id) => nextSet.has(id));
		for (const id of nextSet) if (!nodeById.has(id)) ordered.push(id);
		if (ordered.length === selectedIds.length && ordered.every((id) => selectedSet.has(id))) return;
		if (selected === void 0) setInternalSelected(ordered);
		onSelectionChange?.(ordered);
	};
	const selectOnly = (id) => commitSelection(/* @__PURE__ */ new Set([id]));
	const toggleSelection = (node) => {
		const next = new Set(selectedIds);
		const ids = cascadeIds(node, selectChildren);
		if (checkedState(node) === "true") for (const id of ids) next.delete(id);
		else for (const id of ids) next.add(id);
		commitSelection(next);
	};
	const addToSelection = (node) => {
		const next = new Set(selectedIds);
		for (const id of cascadeIds(node, selectChildren)) next.add(id);
		commitSelection(next);
	};
	/** Space and click: select in single, toggle in multiple, nothing in none. */
	const selectAction = (node) => {
		if (node.disabled) return;
		if (selectable === "single") selectOnly(node.id);
		else if (selectable === "multiple") toggleSelection(node);
	};
	/**
	* What a node's checkbox shows. Under `selectChildren` it is derived from the node's enabled loaded
	* descendants (mixed when only some are selected); a node with none of those behaves as a leaf and shows
	* its own id's state.
	*/
	const checkedMemo = /* @__PURE__ */ new Map();
	function checkedState(node) {
		const cached = checkedMemo.get(node.id);
		if (cached) return cached;
		let state = selectedSet.has(node.id) ? "true" : "false";
		if (selectChildren) {
			const descendants = enabledDescendants(node);
			if (descendants.length > 0) {
				const count = descendants.filter((descendant) => selectedSet.has(descendant.id)).length;
				state = count === descendants.length ? "true" : count > 0 ? "mixed" : "false";
			}
		}
		checkedMemo.set(node.id, state);
		return state;
	}
	const [focusedId, setFocusedId] = useState(void 0);
	const tabStopId = (focusedId !== void 0 && navigable.some((entry) => entry.node.id === focusedId) ? focusedId : void 0) ?? navigable.find((entry) => selectedSet.has(entry.node.id))?.node.id ?? navigable[0]?.node.id;
	const focusNode = (id) => {
		setFocusedId(id);
		itemRefs.current.get(id)?.focus();
	};
	/** Keyboard focus movement: with single + selectOnFocus, the node is selected as focus lands. */
	const moveTo = (entry) => {
		if (!entry) return;
		focusNode(entry.node.id);
		if (selectable === "single" && selectOnFocus) selectOnly(entry.node.id);
	};
	const activate = (node) => {
		if (node.disabled) return;
		if (selectable === "single") selectOnly(node.id);
		if (node.href) itemRefs.current.get(node.id)?.querySelector("[data-part=\"link\"] a")?.click();
		else onActivate?.(node.id);
	};
	const handleTypeahead = (char, index) => {
		const state = typeahead.current;
		if (state.timer !== void 0) clearTimeout(state.timer);
		state.timer = setTimeout(() => {
			state.buffer = "";
			state.timer = void 0;
		}, TYPEAHEAD_RESET);
		state.buffer += char.toLowerCase();
		const start = state.buffer.length === 1 ? index + 1 : index;
		for (let offset = 0; offset < navigable.length; offset++) {
			const entry = navigable[(start + offset) % navigable.length];
			if (entry && entry.node.label.toLowerCase().startsWith(state.buffer)) {
				moveTo(entry);
				return;
			}
		}
	};
	const handleKeyDown = (event) => {
		const item = event.target.closest("[role=\"treeitem\"]");
		if (!item) return;
		const index = navigable.findIndex((entry) => itemRefs.current.get(entry.node.id) === item);
		const current = navigable[index];
		if (!current) return;
		const { node } = current;
		const multiple = selectable === "multiple";
		if ((event.ctrlKey || event.metaKey) && !event.altKey && event.code === "KeyA") {
			if (!multiple) return;
			event.preventDefault();
			const next = new Set(selectedIds);
			for (const entry of navigable) next.add(entry.node.id);
			commitSelection(next);
			return;
		}
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				const entry = navigable[event.key === "ArrowDown" ? index + 1 : index - 1];
				if (!entry) return;
				if (multiple && event.shiftKey) {
					focusNode(entry.node.id);
					addToSelection(entry.node);
				} else moveTo(entry);
				return;
			}
			case "ArrowRight":
				event.preventDefault();
				if (!hasChildren(node)) return;
				if (!expandedSet.has(node.id)) toggleExpanded(node.id);
				else {
					const child = loadedChildren(node).find((candidate) => !candidate.disabled);
					if (child) moveTo(navigable.find((entry) => entry.node.id === child.id));
				}
				return;
			case "ArrowLeft":
				event.preventDefault();
				if (hasChildren(node) && expandedSet.has(node.id)) toggleExpanded(node.id);
				else if (current.parentId !== null) moveTo(navigable.find((entry) => entry.node.id === current.parentId));
				return;
			case "Home":
				event.preventDefault();
				moveTo(navigable[0]);
				return;
			case "End":
				event.preventDefault();
				moveTo(navigable[navigable.length - 1]);
				return;
			case "Enter":
				event.preventDefault();
				activate(node);
				return;
			case " ":
				if (selectable === "none") return;
				event.preventDefault();
				selectAction(node);
				return;
			case "*": {
				event.preventDefault();
				const opened = current.siblings.filter((sibling) => !sibling.disabled && hasChildren(sibling) && !expandedSet.has(sibling.id)).map((sibling) => sibling.id);
				if (opened.length > 0) commitExpanded([...expandedIds, ...opened.filter((id) => !expandedIds.includes(id))], opened);
				return;
			}
			default: if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
				event.preventDefault();
				handleTypeahead(event.key, index);
			}
		}
	};
	const handleTreeBlur = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(void 0);
	};
	const labelWeight = overrides?.labelSelectedWeight ?? "font.weight.medium";
	const badgeSize = overrides?.badgeSize ?? "font.size.xs";
	const headingSize = overrides?.headingSize ?? "font.size.md";
	/** fontFamily / fontSize / lineHeight reach the label through the composed Text's own overrides. */
	const labelTextOverrides = {
		fontFamily: overrides?.fontFamily ?? "font.family.body",
		fontSize: overrides?.fontSize ?? "font.size.sm",
		lineHeight: overrides?.lineHeight ?? "font.lineHeight.normal"
	};
	const renderNode = (node, level, posinset, setsize) => {
		const parent = hasChildren(node);
		const isExpanded = parent && expandedSet.has(node.id);
		const checked = selectable === "multiple" ? checkedState(node) : void 0;
		const isSelected = selectable === "single" ? selectedSet.has(node.id) : checked === "true";
		const loading = isExpanded && node.children === "lazy";
		const children = loadedChildren(node);
		const rowClasses = [
			"ds-tree__row",
			isSelected ? "ds-tree__row--selected" : null,
			node.disabled ? "ds-tree__row--disabled" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("li", {
			ref: (el) => {
				if (el) itemRefs.current.set(node.id, el);
				else itemRefs.current.delete(node.id);
			},
			id: `${baseId}-node-${node.id}`,
			role: "treeitem",
			"data-part": "node",
			className: "ds-tree__node",
			style: { "--ds-tree-level": level - 1 },
			"aria-level": level,
			"aria-setsize": setsize,
			"aria-posinset": posinset,
			"aria-expanded": parent ? isExpanded : void 0,
			"aria-selected": selectable === "single" ? isSelected : void 0,
			"aria-checked": checked,
			"aria-disabled": node.disabled ? true : void 0,
			"aria-busy": loading ? true : void 0,
			tabIndex: node.id === tabStopId ? 0 : -1,
			onFocus: (event) => {
				if (event.target === event.currentTarget && !node.disabled) setFocusedId(node.id);
			},
			children: [/* @__PURE__ */ jsxs("div", {
				className: rowClasses,
				"data-part": "nodeRow",
				onMouseDown: (event) => {
					if (node.disabled) event.preventDefault();
				},
				onClick: (event) => {
					if (node.disabled) return;
					focusNode(node.id);
					if (event.detail >= 2) return;
					selectAction(node);
				},
				onDoubleClick: () => activate(node),
				children: [/* @__PURE__ */ jsx("span", {
					className: "ds-tree__indent",
					"data-part": "indent",
					"aria-hidden": "true"
				}), /* @__PURE__ */ jsxs("span", {
					className: "ds-tree__content",
					children: [
						parent ? /* @__PURE__ */ jsx("span", {
							className: "ds-tree__expand",
							"data-part": "expandButton",
							onMouseDown: (event) => event.preventDefault(),
							onClick: (event) => {
								event.stopPropagation();
								if (node.disabled) return;
								toggleExpanded(node.id);
								focusNode(node.id);
							},
							onDoubleClick: (event) => event.stopPropagation(),
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								iconOnly: true,
								label: interpolate(isExpanded ? COPY$2.collapse : COPY$2.expand, { label: node.label }),
								leadingIcon: /* @__PURE__ */ jsx("span", {
									className: isExpanded ? "ds-tree__chevron ds-tree__chevron--expanded" : "ds-tree__chevron",
									children: /* @__PURE__ */ jsx(Icon, {
										name: "chevron-right",
										inline: true
									})
								}),
								disabled: node.disabled ?? false,
								tabIndex: -1
							})
						}) : /* @__PURE__ */ jsx("span", {
							className: "ds-tree__expand",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "ds-tree__main",
							children: [checked !== void 0 ? /* @__PURE__ */ jsx("span", {
								className: checked === "false" ? "ds-tree__checkbox" : "ds-tree__checkbox ds-tree__checkbox--checked",
								"data-part": "checkbox",
								"aria-hidden": "true",
								children: checked === "true" ? /* @__PURE__ */ jsx(Icon, {
									name: "check",
									inline: true
								}) : checked === "mixed" ? /* @__PURE__ */ jsx(Icon, {
									name: "dash",
									inline: true
								}) : null
							}) : null, /* @__PURE__ */ jsxs("span", {
								className: "ds-tree__body",
								children: [node.icon ? /* @__PURE__ */ jsx("span", {
									className: "ds-tree__icon",
									"data-part": "icon",
									children: /* @__PURE__ */ jsx(Icon, {
										name: node.icon,
										inline: true,
										overrides: { color: "color.foreground.muted" }
									})
								}) : null, /* @__PURE__ */ jsx("span", {
									className: "ds-tree__label",
									children: /* @__PURE__ */ jsx(Text, {
										"data-part": "label",
										element: "span",
										truncate: true,
										overrides: isSelected && node.href === void 0 ? {
											...labelTextOverrides,
											fontWeight: labelWeight
										} : labelTextOverrides,
										children: node.href ? /* @__PURE__ */ jsx("span", {
											className: "ds-tree__link",
											"data-part": "link",
											children: /* @__PURE__ */ jsx(Link, {
												href: node.href,
												label: node.label,
												tone: "inherit",
												tabIndex: -1
											})
										}) : node.label
									})
								})]
							})]
						}),
						node.badge ? /* @__PURE__ */ jsx(Text, {
							"data-part": "badge",
							element: "span",
							tone: "muted",
							overrides: { fontSize: badgeSize },
							children: node.badge
						}) : null
					]
				})]
			}), isExpanded ? /* @__PURE__ */ jsx("ul", {
				role: "group",
				"data-part": "group",
				className: "ds-tree__group",
				children: loading ? /* @__PURE__ */ jsx("li", {
					role: "treeitem",
					className: "ds-tree__node",
					style: { "--ds-tree-level": level },
					"aria-level": level + 1,
					"aria-setsize": 1,
					"aria-posinset": 1,
					"aria-disabled": true,
					tabIndex: -1,
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-tree__row ds-tree__row--placeholder",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-tree__indent",
							"aria-hidden": "true"
						}), /* @__PURE__ */ jsxs("span", {
							className: "ds-tree__content",
							children: [/* @__PURE__ */ jsx("span", {
								className: "ds-tree__expand",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx(Text, {
								element: "span",
								tone: "muted",
								children: COPY$2.loading
							})]
						})]
					})
				}) : children.map((child, childIndex) => renderNode(child, level + 1, childIndex + 1, children.length))
			}) : null]
		}, node.id);
	};
	const rootClasses = ["ds-tree", showGuides ? null : "ds-tree--hide-guides"].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Tree",
		"data-part": "container",
		className: rootClasses,
		style: overrides ? overridesToStyle$1(overrides) : void 0,
		children: [
			showLabel ? /* @__PURE__ */ jsx("div", {
				className: "ds-tree__heading",
				"data-part": "heading",
				children: /* @__PURE__ */ jsx(Heading, {
					id: headingId,
					level: headingLevel,
					size: "md",
					overrides: { fontSize: headingSize },
					children: label
				})
			}) : null,
			/* @__PURE__ */ jsx("ul", {
				role: "tree",
				className: "ds-tree__tree",
				"aria-label": showLabel ? void 0 : label,
				"aria-labelledby": showLabel ? headingId : void 0,
				"aria-multiselectable": selectable === "multiple" ? true : void 0,
				onKeyDown: handleKeyDown,
				onBlur: handleTreeBlur,
				children: nodes.map((node, index) => renderNode(node, 1, index + 1, nodes.length))
			}),
			nodes.length === 0 ? /* @__PURE__ */ jsx(Text, {
				"data-part": "emptyState",
				tone: "muted",
				children: COPY$2.empty
			}) : null,
			selectable === "multiple" ? /* @__PURE__ */ jsx("span", {
				className: "ds-tree__visually-hidden",
				role: "status",
				"aria-live": "polite",
				children: interpolate(COPY$2.selectedCount, { count: selectedIds.length })
			}) : null
		]
	});
}
//#endregion
//#region src/Splitter.tsx
/**
* copy.* — used verbatim; `{label}` and `{percent}` are the only substitutions. `setMinimum` and
* `setMaximum` name the Home/End accessibility actions, which only the native platforms expose:
* on web Home and End are the keys themselves and carry no separate label.
*/
const COPY$1 = {
	collapse: "Collapse {label}",
	expand: "Expand {label}",
	setMinimum: "Minimum {label}",
	setMaximum: "Maximum {label}",
	sizeText: "{percent}%"
};
const OVERRIDE_HOOK = {
	separatorSize: "--ds-splitter-separator-size",
	separatorColor: "--ds-splitter-separator-color",
	handleSize: "--ds-splitter-handle-size",
	gripLength: "--ds-splitter-grip-length",
	gripRadius: "--ds-splitter-grip-radius",
	collapseButtonOffset: "--ds-splitter-collapse-button-offset",
	transition: "--ds-splitter-transition"
};
function overridesToStyle(overrides) {
	const style = {};
	for (const binding of Object.keys(OVERRIDE_HOOK)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$1 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** stackBelow → the layout.maxWidth.* token whose resolved length is the breakpoint. */
const BREAKPOINT_TOKEN = {
	prose: "--layout-max-width-prose",
	content: "--layout-max-width-content"
};
const FOCUSABLE_SELECTOR = "a[href], button, input, select, textarea, [contenteditable]:not([contenteditable=\"false\"]), [tabindex]";
/**
* The breakpoint in CSS pixels, read from the loaded token stylesheet (literal-ok: the number is
* the theme's layout.maxWidth.*, never written here). `null` when the tokens are not loaded.
*/
function readBreakpoint(el, stackBelow) {
	const raw = getComputedStyle(el).getPropertyValue(BREAKPOINT_TOKEN[stackBelow]).trim();
	const value = parseFloat(raw);
	if (!Number.isFinite(value) || value <= 0) return null;
	if (raw.endsWith("rem")) return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
	if (raw.endsWith("em")) return value * parseFloat(getComputedStyle(el).fontSize);
	return value;
}
function readPersisted(key) {
	if (!key || typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		const { size, collapsed } = parsed;
		return {
			size: typeof size === "number" && Number.isFinite(size) ? size : void 0,
			collapsed: typeof collapsed === "boolean" ? collapsed : void 0
		};
	} catch {
		return null;
	}
}
function writePersisted(key, value) {
	if (!key || typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
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
function Splitter({ ref, label, orientation = "horizontal", primary, secondary, size, defaultSize = 30, minSize = 10, maxSize = 90, step = 2, collapsible = false, collapsed, defaultCollapsed = false, persistKey, stackBelow = "prose", overrides, onSizeChange, onSizeChangeEnd, onCollapseChange, onKeyDown, ...rest }) {
	const primaryId = `ds-splitter${useId()}-primary`;
	const containerRef = useRef(null);
	const primaryRef = useRef(null);
	const separatorRef = useRef(null);
	const secondaryRef = useRef(null);
	const collapseButtonRef = useRef(null);
	useEffect(() => {
		if (isDev$1 && !label) console.warn("Splitter: `label` is required; it is the separator’s accessible name.");
	}, [label]);
	const clamp = (value) => Math.min(Math.max(value, minSize), maxSize);
	const [internalSize, setInternalSize] = useState(() => clamp(readPersisted(persistKey)?.size ?? defaultSize));
	const current = size !== void 0 ? clamp(size) : internalSize;
	const latestSizeRef = useRef(current);
	latestSizeRef.current = current;
	const [internalCollapsed, setInternalCollapsed] = useState(() => readPersisted(persistKey)?.collapsed ?? defaultCollapsed);
	const collapsedState = collapsible && (collapsed !== void 0 ? collapsed : internalCollapsed);
	const [isRtl, setIsRtl] = useState(false);
	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		setIsRtl(getComputedStyle(el).direction === "rtl");
	}, []);
	const canStack = orientation === "horizontal" && stackBelow !== "never";
	const [isStacked, setIsStacked] = useState(false);
	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!canStack || !el || typeof ResizeObserver === "undefined") {
			setIsStacked(false);
			return;
		}
		const breakpoint = readBreakpoint(el, stackBelow);
		if (breakpoint === null) {
			setIsStacked(false);
			return;
		}
		let lastWidth = -1;
		const measure = (width) => {
			if (width === lastWidth) return;
			lastWidth = width;
			setIsStacked(width < breakpoint);
		};
		measure(el.getBoundingClientRect().width);
		const observer = new ResizeObserver(([entry]) => {
			if (entry) measure(entry.contentRect.width);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [canStack, stackBelow]);
	const effectiveCollapsed = collapsedState && !isStacked;
	const [animateCollapse, setAnimateCollapse] = useState(false);
	const [prevCollapsed, setPrevCollapsed] = useState(effectiveCollapsed);
	if (prevCollapsed !== effectiveCollapsed) {
		setPrevCollapsed(effectiveCollapsed);
		setAnimateCollapse(true);
	}
	useLayoutEffect(() => {
		const node = primaryRef.current;
		if (node && node.inert !== effectiveCollapsed) node.inert = effectiveCollapsed;
	}, [effectiveCollapsed]);
	useEffect(() => {
		writePersisted(persistKey, {
			size: current,
			collapsed: collapsedState
		});
	}, [
		persistKey,
		current,
		collapsedState
	]);
	function changeSize(next) {
		const clamped = clamp(next);
		setAnimateCollapse(false);
		if (clamped === latestSizeRef.current) return false;
		if (size === void 0) setInternalSize(clamped);
		latestSizeRef.current = clamped;
		onSizeChange?.(clamped);
		return true;
	}
	function setCollapsed(next) {
		if (next === collapsedState) return;
		if (collapsed === void 0) setInternalCollapsed(next);
		onCollapseChange?.(next);
	}
	const [isDragging, setIsDragging] = useState(false);
	const draggingRef = useRef(false);
	const movedRef = useRef(false);
	function percentFromPoint(clientX, clientY) {
		const el = containerRef.current;
		if (!el) return latestSizeRef.current;
		const rect = el.getBoundingClientRect();
		if (orientation === "horizontal") {
			if (rect.width === 0) return latestSizeRef.current;
			const ratio = (clientX - rect.left) / rect.width;
			return (isRtl ? 1 - ratio : ratio) * 100;
		}
		if (rect.height === 0) return latestSizeRef.current;
		return (clientY - rect.top) / rect.height * 100;
	}
	function stopDrag(target, pointerId) {
		draggingRef.current = false;
		movedRef.current = false;
		setIsDragging(false);
		if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
	}
	const handlePointerDown = (event) => {
		if (effectiveCollapsed || event.button !== 0) return;
		event.preventDefault();
		event.currentTarget.focus();
		event.currentTarget.setPointerCapture(event.pointerId);
		draggingRef.current = true;
		movedRef.current = false;
		setIsDragging(true);
		setAnimateCollapse(false);
	};
	const handlePointerMove = (event) => {
		if (!draggingRef.current) return;
		const raw = percentFromPoint(event.clientX, event.clientY);
		if (collapsible && raw < minSize) {
			stopDrag(event.currentTarget, event.pointerId);
			onSizeChangeEnd?.(latestSizeRef.current);
			setCollapsed(true);
			return;
		}
		if (changeSize(raw)) movedRef.current = true;
	};
	const handlePointerEnd = (event) => {
		if (!draggingRef.current) return;
		const moved = movedRef.current;
		stopDrag(event.currentTarget, event.pointerId);
		if (moved) onSizeChangeEnd?.(latestSizeRef.current);
	};
	const handleSeparatorKeyDown = (event) => {
		if (event.key === "Enter") {
			if (!collapsible) return;
			event.preventDefault();
			setCollapsed(!collapsedState);
			return;
		}
		const growKey = orientation === "vertical" ? "ArrowDown" : isRtl ? "ArrowLeft" : "ArrowRight";
		const shrinkKey = orientation === "vertical" ? "ArrowUp" : isRtl ? "ArrowRight" : "ArrowLeft";
		let next;
		switch (event.key) {
			case growKey:
				next = latestSizeRef.current + step;
				break;
			case shrinkKey:
				next = latestSizeRef.current - step;
				break;
			case "Home":
				next = minSize;
				break;
			case "End":
				next = maxSize;
				break;
			default: return;
		}
		event.preventDefault();
		if (effectiveCollapsed) return;
		if (collapsible && event.key === shrinkKey && latestSizeRef.current <= minSize) {
			setCollapsed(true);
			return;
		}
		if (changeSize(next)) onSizeChangeEnd?.(latestSizeRef.current);
	};
	const handleContainerKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.key !== "F6" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
		const regions = [
			effectiveCollapsed ? null : primaryRef.current,
			separatorRef.current,
			secondaryRef.current
		];
		const active = document.activeElement;
		const separatorTrack = separatorRef.current?.parentElement ?? null;
		let from = regions.findIndex((region, index) => index === 1 ? separatorTrack?.contains(active) ?? false : region?.contains(active) ?? false);
		if (from === -1) from = regions.length - 1;
		for (let offset = 1; offset <= regions.length; offset += 1) {
			const region = regions[(from + offset) % regions.length];
			if (!region) continue;
			event.preventDefault();
			if (region === separatorRef.current) {
				region.focus();
				return;
			}
			const target = Array.from(region.querySelectorAll(FOCUSABLE_SELECTOR)).find((el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getAttribute("aria-disabled") !== "true");
			if (target) target.focus();
			else {
				if (region.getAttribute("tabindex") !== "-1") region.setAttribute("tabindex", "-1");
				region.focus();
			}
			return;
		}
	};
	const handleCollapseTargetClick = (event) => {
		const button = collapseButtonRef.current;
		if (!button || button.contains(event.target)) return;
		button.click();
	};
	const setContainerRef = (node) => {
		containerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const percent = effectiveCollapsed ? 0 : Math.round(current);
	const valueText = COPY$1.sizeText.replace("{percent}", String(percent));
	const rootStyle = {
		...overrides ? overridesToStyle(overrides) : void 0,
		"--ds-splitter-primary-size": `${effectiveCollapsed ? 0 : current}%`
	};
	const classes = [
		"ds-splitter",
		`ds-splitter--${orientation}`,
		isStacked ? "ds-splitter--stacked" : null,
		effectiveCollapsed ? "ds-splitter--collapsed" : null,
		isDragging ? "ds-splitter--dragging" : null,
		animateCollapse ? "ds-splitter--animate" : null
	].filter(Boolean).join(" ");
	const pointsAtPrimary = !effectiveCollapsed;
	const collapseIcon = orientation === "vertical" ? pointsAtPrimary ? "chevron-up" : "chevron-down" : pointsAtPrimary !== isRtl ? "chevron-left" : "chevron-right";
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: setContainerRef,
		"data-ds": "Splitter",
		"data-part": "container",
		className: classes,
		style: rootStyle,
		onKeyDown: handleContainerKeyDown,
		children: [
			/* @__PURE__ */ jsx("div", {
				ref: primaryRef,
				id: primaryId,
				"data-part": "primaryPane",
				className: "ds-splitter__primary-pane",
				children: primary
			}),
			isStacked ? null : /* @__PURE__ */ jsxs("div", {
				className: "ds-splitter__track",
				children: [/* @__PURE__ */ jsx("div", {
					ref: separatorRef,
					role: "separator",
					tabIndex: 0,
					"data-part": "separator",
					className: "ds-splitter__separator",
					"aria-orientation": orientation === "horizontal" ? "vertical" : "horizontal",
					"aria-valuenow": percent,
					"aria-valuemin": effectiveCollapsed ? 0 : minSize,
					"aria-valuemax": maxSize,
					"aria-valuetext": valueText,
					"aria-label": label,
					"aria-controls": primaryId,
					onPointerDown: handlePointerDown,
					onPointerMove: handlePointerMove,
					onPointerUp: handlePointerEnd,
					onPointerCancel: handlePointerEnd,
					onKeyDown: handleSeparatorKeyDown
				}), collapsible ? /* @__PURE__ */ jsx("span", {
					className: "ds-splitter__collapse-button",
					"data-part": "collapseButton",
					onClick: handleCollapseTargetClick,
					children: /* @__PURE__ */ jsx(Button, {
						ref: collapseButtonRef,
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						expanded: !effectiveCollapsed,
						"aria-controls": primaryId,
						label: (effectiveCollapsed ? COPY$1.expand : COPY$1.collapse).replace("{label}", label),
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: collapseIcon,
							inline: true
						}),
						onClick: () => setCollapsed(!collapsedState)
					})
				}) : null]
			}),
			/* @__PURE__ */ jsx("div", {
				ref: secondaryRef,
				"data-part": "secondaryPane",
				className: "ds-splitter__secondary-pane",
				children: secondary
			})
		]
	});
}
//#endregion
//#region src/Feed.tsx
const COPY = {
	showNew: "Show {count} new",
	loading: "Loading more",
	end: "You are all caught up.",
	unread: "unread",
	position: "{index} of {total}",
	empty: "Nothing here yet.",
	justNow: "just now",
	minutesAgo: "{n} min ago",
	hoursAgo: "{n} hr ago",
	daysAgo: "{n} d ago"
};
/** Bindings Feed owns as hooks on its root. The rest forward to composed children's `overrides`. */
const ROOT_HOOK = {
	itemGap: "--ds-feed-item-gap",
	newItemsOffset: "--ds-feed-new-items-offset",
	newItemsLayer: "--ds-feed-new-items-layer",
	loadingInset: "--ds-feed-loading-inset",
	endMessageInset: "--ds-feed-end-message-inset",
	emptyStateInset: "--ds-feed-empty-state-inset",
	fontFamily: "--ds-feed-font-family"
};
function resolveOverrides(overrides) {
	if (!overrides) return {
		rootStyle: void 0,
		card: void 0,
		articleBody: void 0,
		timestamp: void 0,
		endMessage: void 0,
		emptyState: void 0,
		newItemsButton: void 0
	};
	const rootStyle = {};
	const card = {};
	const articleBody = {};
	const timestamp = {};
	const endMessage = {};
	const emptyState = {};
	const newItemsButton = {};
	for (const binding of Object.keys(overrides)) {
		const tokenRef = overrides[binding];
		if (!tokenRef) continue;
		const hook = ROOT_HOOK[binding];
		if (hook) rootStyle[hook] = cssVar(tokenRef);
		switch (binding) {
			case "articleInset":
				card.paddingBlock = tokenRef;
				card.paddingInline = tokenRef;
				break;
			case "articleBodyGap":
				articleBody.gap = tokenRef;
				break;
			case "timestampSize":
				timestamp.fontSize = tokenRef;
				break;
			case "endMessageSize":
				endMessage.fontSize = tokenRef;
				break;
			case "emptyStateSize":
				emptyState.fontSize = tokenRef;
				break;
			case "fontFamily":
				timestamp.fontFamily = tokenRef;
				endMessage.fontFamily = tokenRef;
				emptyState.fontFamily = tokenRef;
				newItemsButton.fontFamily = tokenRef;
		}
	}
	return {
		rootStyle,
		card,
		articleBody,
		timestamp,
		endMessage,
		emptyState,
		newItemsButton
	};
}
const isDev = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const SECOND = 1e3;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_LIMIT_DAYS = 7;
/** How long an item stays half visible before `onItemVisible` fires. */
const VISIBLE_DWELL = SECOND;
/** Relative time from the copy strings; a week or more (or an unparseable date) falls back to the absolute date. */
function formatRelative(iso, now) {
	const time = new Date(iso).getTime();
	if (Number.isNaN(time)) return iso;
	const elapsed = Math.max(0, now - time);
	if (elapsed < MINUTE) return COPY.justNow;
	if (elapsed < HOUR) return COPY.minutesAgo.replace("{n}", String(Math.floor(elapsed / MINUTE)));
	if (elapsed < DAY) return COPY.hoursAgo.replace("{n}", String(Math.floor(elapsed / HOUR)));
	if (elapsed < RELATIVE_LIMIT_DAYS * DAY) return COPY.daysAgo.replace("{n}", String(Math.floor(elapsed / DAY)));
	return new Intl.DateTimeFormat(void 0, { dateStyle: "medium" }).format(time);
}
function formatAbsolute(iso) {
	const time = new Date(iso).getTime();
	if (Number.isNaN(time)) return void 0;
	return new Intl.DateTimeFormat(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(time);
}
const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]):not([type=\"hidden\"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"]), [contenteditable=\"true\"]";
/** Focusable elements outside `root`, in document order. */
function outsideFocusables(root) {
	return Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE)).filter((el) => !root.contains(el) && !el.closest("[inert]"));
}
function prefersReducedMotion() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Feed — Design Schema, category: container.
*
* When to use:
* Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.
*/
const Feed = function Feed({ ref, label, items, hasMore = false, loading = false, newItemsCount, headingLevel = "3", endMessage, onLoadMore, onShowNew, onItemVisible, overrides, onKeyDown, ...rest }) {
	const baseId = `ds-feed${useId()}`;
	const rootRef = useRef(null);
	const feedRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const articleRefs = useRef(/* @__PURE__ */ new Map());
	const newItemsButtonRef = useRef(null);
	const warnedLabelRef = useRef(false);
	const warnEmptyLabel = isDev && label.trim() === "";
	useEffect(() => {
		if (warnEmptyLabel && !warnedLabelRef.current) {
			warnedLabelRef.current = true;
			console.warn("Feed: `label` is the accessible name of the feed and must not be empty.");
		}
	}, [warnEmptyLabel]);
	const onLoadMoreRef = useRef(onLoadMore);
	const onItemVisibleRef = useRef(onItemVisible);
	useEffect(() => {
		onLoadMoreRef.current = onLoadMore;
		onItemVisibleRef.current = onItemVisible;
	});
	const total = items.length;
	const firstId = items[0]?.id;
	const lastId = items[total - 1]?.id;
	const idsKey = items.map((item) => item.id).join(" ");
	const showNewButton = newItemsCount !== void 0 && newItemsCount > 0;
	const pendingFocusNewRef = useRef(false);
	const lastFirstIdRef = useRef(firstId);
	useEffect(() => {
		const previousFirstId = lastFirstIdRef.current;
		lastFirstIdRef.current = firstId;
		if (!pendingFocusNewRef.current) return;
		pendingFocusNewRef.current = false;
		if (firstId === void 0 || firstId === previousFirstId) return;
		const node = articleRefs.current.get(firstId);
		if (!node) return;
		node.focus({ preventScroll: true });
		if (typeof node.scrollIntoView === "function") node.scrollIntoView({
			behavior: prefersReducedMotion() ? "auto" : "smooth",
			block: "start"
		});
	}, [idsKey, firstId]);
	const firedEmptyLoadRef = useRef(false);
	useEffect(() => {
		if (total > 0) firedEmptyLoadRef.current = false;
		else if (hasMore && !loading && !firedEmptyLoadRef.current) {
			firedEmptyLoadRef.current = true;
			onLoadMoreRef.current?.();
		}
	}, [
		total,
		hasMore,
		loading
	]);
	useEffect(() => {
		if (!hasMore || loading || lastId === void 0 || typeof IntersectionObserver === "undefined") return void 0;
		const node = articleRefs.current.get(lastId);
		if (!node) return void 0;
		let asked = false;
		const observer = new IntersectionObserver((entries) => {
			if (asked || !entries.some((entry) => entry.isIntersecting)) return;
			asked = true;
			onLoadMoreRef.current?.();
		}, { rootMargin: "100% 0px" });
		observer.observe(node);
		return () => observer.disconnect();
	}, [
		lastId,
		hasMore,
		loading
	]);
	const reportedVisibleRef = useRef(/* @__PURE__ */ new Set());
	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return void 0;
		const timers = /* @__PURE__ */ new Map();
		const idByNode = /* @__PURE__ */ new Map();
		articleRefs.current.forEach((node, id) => {
			if (!reportedVisibleRef.current.has(id)) idByNode.set(node, id);
		});
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const id = idByNode.get(entry.target);
				if (id === void 0) continue;
				const pending = timers.get(id);
				if (entry.isIntersecting && entry.intersectionRatio >= .5) {
					if (pending !== void 0) continue;
					timers.set(id, setTimeout(() => {
						timers.delete(id);
						if (reportedVisibleRef.current.has(id)) return;
						reportedVisibleRef.current.add(id);
						observer.unobserve(entry.target);
						onItemVisibleRef.current?.(id);
					}, VISIBLE_DWELL));
				} else if (pending !== void 0) {
					clearTimeout(pending);
					timers.delete(id);
				}
			}
		}, { threshold: .5 });
		idByNode.forEach((_, node) => observer.observe(node));
		return () => {
			observer.disconnect();
			timers.forEach((timer) => clearTimeout(timer));
		};
	}, [idsKey]);
	const handleShowNew = () => {
		pendingFocusNewRef.current = true;
		onShowNew?.();
	};
	const handleKeyDown = (event) => {
		onKeyDown?.(event);
		const root = rootRef.current;
		const feed = feedRef.current;
		if (event.defaultPrevented || !root || !feed) return;
		const article = event.target.closest("[role=\"article\"]");
		if (!article || article.closest("[role=\"feed\"]") !== feed) return;
		if ((event.key === "PageDown" || event.key === "PageUp") && !event.ctrlKey && !event.altKey && !event.metaKey) {
			const articles = Array.from(feed.querySelectorAll("[role=\"article\"]")).filter((el) => el.closest("[role=\"feed\"]") === feed);
			const index = articles.indexOf(article);
			event.preventDefault();
			articles[index + (event.key === "PageDown" ? 1 : -1)]?.focus();
			return;
		}
		if (event.key === "End" && event.ctrlKey) {
			event.preventDefault();
			if (hasMore) {
				if (!loading) onLoadMoreRef.current?.();
			} else outsideFocusables(root).find((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)?.focus();
			return;
		}
		if (event.key === "Home" && event.ctrlKey) {
			event.preventDefault();
			if (showNewButton && newItemsButtonRef.current) newItemsButtonRef.current.focus();
			else outsideFocusables(root).filter((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0).pop()?.focus();
		}
	};
	const resolved = resolveOverrides(overrides);
	const now = Date.now();
	const totalKnown = !hasMore;
	const isFeed = total > 0 || loading;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Feed",
		className: "ds-feed",
		style: resolved.rootStyle,
		onKeyDown: handleKeyDown,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: showNewButton ? "ds-feed__new-items ds-feed__new-items--shown" : "ds-feed__new-items",
				"data-part": showNewButton ? "newItemsButton" : void 0,
				role: "status",
				children: showNewButton ? /* @__PURE__ */ jsx(Button, {
					ref: newItemsButtonRef,
					variant: "secondary",
					size: "sm",
					label: COPY.showNew.replace("{count}", String(newItemsCount)),
					overrides: resolved.newItemsButton,
					onClick: handleShowNew
				}) : null
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: feedRef,
				className: "ds-feed__items",
				"data-part": "container",
				role: isFeed ? "feed" : void 0,
				"aria-label": isFeed ? label : void 0,
				"aria-busy": isFeed ? loading : void 0,
				children: [
					items.map((item, index) => {
						const timestampId = `${baseId}-${index}-time`;
						const absolute = formatAbsolute(item.timestamp);
						return /* @__PURE__ */ jsx("div", {
							className: item.unread ? "ds-feed__item ds-feed__item--unread" : "ds-feed__item",
							"data-part": "article",
							children: /* @__PURE__ */ jsx(Card, {
								ref: (node) => {
									if (node) articleRefs.current.set(item.id, node);
									else articleRefs.current.delete(item.id);
								},
								focusable: true,
								heading: item.heading,
								headingLevel,
								inset: "md",
								overrides: resolved.card,
								role: "article",
								"aria-describedby": timestampId,
								"aria-posinset": index + 1,
								"aria-setsize": totalKnown ? total : -1,
								footer: item.actions !== void 0 && item.actions !== null ? /* @__PURE__ */ jsx("div", {
									className: "ds-feed__part",
									"data-part": "articleActions",
									children: /* @__PURE__ */ jsx(Stack, {
										direction: "horizontal",
										gap: "tight",
										children: item.actions
									})
								}) : void 0,
								children: /* @__PURE__ */ jsx("div", {
									className: "ds-feed__part",
									"data-part": "articleBody",
									children: /* @__PURE__ */ jsxs(Stack, {
										gap: "tight",
										overrides: resolved.articleBody,
										children: [
											item.unread ? /* @__PURE__ */ jsx("span", {
												className: "ds-feed__visually-hidden",
												children: COPY.unread
											}) : null,
											/* @__PURE__ */ jsx(Text, {
												element: "span",
												tone: "muted",
												size: "xs",
												overrides: resolved.timestamp,
												children: /* @__PURE__ */ jsx("time", {
													id: timestampId,
													"data-part": "timestamp",
													dateTime: item.timestamp,
													title: absolute,
													children: formatRelative(item.timestamp, now)
												})
											}),
											totalKnown ? /* @__PURE__ */ jsx("span", {
												className: "ds-feed__visually-hidden",
												children: COPY.position.replace("{index}", String(index + 1)).replace("{total}", String(total))
											}) : null,
											item.content
										]
									})
								})
							})
						}, item.id);
					}),
					!loading && total === 0 && !hasMore ? /* @__PURE__ */ jsx("div", {
						className: "ds-feed__empty-state",
						"data-part": "emptyState",
						children: /* @__PURE__ */ jsx(Text, {
							tone: "muted",
							size: "sm",
							overrides: resolved.emptyState,
							children: COPY.empty
						})
					}) : null,
					!loading && total > 0 && !hasMore ? /* @__PURE__ */ jsx("div", {
						className: "ds-feed__end-message",
						"data-part": "endMessage",
						children: /* @__PURE__ */ jsx(Text, {
							tone: "muted",
							size: "sm",
							overrides: resolved.endMessage,
							children: endMessage ?? COPY.end
						})
					}) : null
				]
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "ds-feed__loading",
				"data-part": "loadingIndicator",
				children: /* @__PURE__ */ jsx(ProgressBar, {
					label: COPY.loading,
					hideLabel: true
				})
			}) : null
		]
	});
};
//#endregion
export { Accordion, ActionSheet, Alert, AlertDialog, BottomSheet, Box, Breadcrumb, Button, Card, Carousel, CarouselSlide, Checkbox, Combobox, Container, DataGrid, DatePicker, Dialog, Disclosure, Divider, Feed, Fieldset, FocusScope, Form, FormContext, Heading, Icon, Input, Landmark, Link, Listbox, Menu, Meter, NumberInput, Popover, ProgressBar, RadioGroup, Search, SegmentedControl, Select, SidePanel, Slider, Splitter, Stack, Stepper, Switch, TabPanel, Table, Tabs, Text, Toast, ToastRegion, Toolbar, ToolbarGroup, Tooltip, Tree, TreeGrid, dismiss, toast, useFormContext };

//# sourceMappingURL=index.js.map