import { Children, cloneElement, createContext, createElement, isValidElement, useCallback, useContext, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cssVar } from "@design-schema/tokens";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
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
const OVERRIDE_HOOK$30 = {
	backgroundHover: "--ds-button-background-hover",
	iconGap: "--ds-button-icon-gap",
	paddingInline: "--ds-button-padding-inline",
	paddingBlock: "--ds-button-padding-block",
	radius: "--ds-button-radius",
	fontFamily: "--ds-button-font-family",
	fontWeight: "--ds-button-font-weight",
	fontSize: "--ds-button-font-size",
	disabledOpacity: "--ds-button-disabled-opacity",
	transition: "--ds-button-transition",
	loadingSpin: "--ds-button-loading-spin",
	spinnerStroke: "--ds-button-spinner-stroke"
};
function overridesToStyle$41(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$30[binding]] = cssVar(ref);
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
const Button = function Button({ ref, label, variant = "primary", size = "md", leadingIcon, trailingIcon, type = "button", disabled = false, accessibleName, overflowLabel: _overflowLabel, iconOnly = false, loading = false, inverse = false, track, overrides, onClick, onTrack, className, style, ...rest }) {
	const form = useFormContext();
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
		inverse ? "ds-button--inverse" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$41(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("button", {
		...rest,
		ref,
		type,
		"data-ds": "Button",
		className: classes,
		style: mergedStyle,
		"aria-disabled": isDisabled ? "true" : void 0,
		"aria-busy": loading ? "true" : void 0,
		"aria-label": accessibleName ?? (iconOnly ? label : void 0),
		onClick: handleClick,
		children: [
			loading ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__spinner",
				"data-part": "leadingIcon",
				"aria-hidden": "true"
			}) : leadingIcon !== void 0 && leadingIcon !== null ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__icon",
				"data-part": "leadingIcon",
				"aria-hidden": "true",
				children: leadingIcon
			}) : null,
			iconOnly ? null : /* @__PURE__ */ jsx("span", {
				className: "ds-button__label",
				children: label
			}),
			!loading && trailingIcon !== void 0 && trailingIcon !== null ? /* @__PURE__ */ jsx("span", {
				className: "ds-button__icon",
				"data-part": "trailingIcon",
				"aria-hidden": "true",
				children: trailingIcon
			}) : null
		]
	});
};
//#endregion
//#region src/Heading.tsx
const OVERRIDE_HOOK$29 = {
	fontFamily: "--ds-heading-font-family",
	fontWeight: "--ds-heading-font-weight",
	fontSize: "--ds-heading-font-size",
	lineHeight: "--ds-heading-line-height",
	marginBlockEnd: "--ds-heading-margin-block-end"
};
function overridesToStyle$40(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$29[binding]] = cssVar(ref);
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
const Heading = function Heading({ ref, level, size, children, align = "start", overrides, className, style, ...rest }) {
	const key = String(level);
	const Tag = ELEMENT_BY_LEVEL[key];
	const classes = [
		"ds-heading",
		`ds-heading--size-${size ?? SIZE_BY_LEVEL[key]}`,
		`ds-heading--align-${align}`,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$40(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		"data-ds": "Heading",
		className: classes,
		style: mergedStyle,
		children
	});
};
//#endregion
//#region src/Text.tsx
const OVERRIDE_HOOK$28 = {
	fontFamily: "--ds-text-font-family",
	fontSize: "--ds-text-font-size",
	fontWeight: "--ds-text-font-weight",
	lineHeight: "--ds-text-line-height",
	color: "--ds-text-color"
};
function overridesToStyle$39(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$28[binding]] = cssVar(ref);
	}
	return style;
}
/** tone → color.foreground.{tone}; `default` is the bare `color.foreground` token. */
const TONE_CLASS$1 = {
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
const Text = function Text({ ref, children, size = "md", weight = "regular", tone = "default", align = "start", truncate = false, element = "p", overrides, title, className, style, ...rest }) {
	const Tag = element;
	const resolvedTitle = title ?? (truncate && typeof children === "string" ? children : void 0);
	const classes = [
		"ds-text",
		`ds-text--size-${size}`,
		`ds-text--weight-${weight}`,
		TONE_CLASS$1[tone],
		`ds-text--align-${align}`,
		truncate ? "ds-text--truncate" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$39(overrides) : void 0;
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
};
//#endregion
//#region src/Input.tsx
/** copy.* — used verbatim; `{label}` is replaced by the visible label. */
const COPY$28 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
/** Bindings owned by the root; `helperSize` is forwarded entirely into the composed description/
* error Text elements' own `overrides` instead (they render the helper text, not the root), and
* `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept on the root for the
* label and the raw `<input>`, neither of which is a Text. */
const ROOT_OVERRIDE_HOOK$17 = {
	borderFocus: "--ds-input-border-focus",
	borderInvalid: "--ds-input-border-invalid",
	borderWidth: "--ds-input-border-width",
	radius: "--ds-input-radius",
	paddingInline: "--ds-input-padding-inline",
	paddingBlock: "--ds-input-padding-block",
	paddingBlockSm: "--ds-input-padding-block-sm",
	paddingInlineSm: "--ds-input-padding-inline-sm",
	partGap: "--ds-input-part-gap",
	fontFamily: "--ds-input-font-family",
	fontSize: "--ds-input-font-size",
	labelWeight: "--ds-input-label-weight",
	lineHeight: "--ds-input-line-height",
	minTargetSm: "--ds-input-min-target-sm",
	disabledOpacity: "--ds-input-disabled-opacity"
};
function resolveOverrides$5(overrides) {
	const rootStyle = {};
	const descriptionOverrides = {};
	const errorOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		switch (binding) {
			case "helperSize":
				descriptionOverrides.fontSize = ref;
				errorOverrides.fontSize = ref;
				break;
			case "fontFamily":
				rootStyle["--ds-input-font-family"] = cssVar(ref);
				descriptionOverrides.fontFamily = ref;
				errorOverrides.fontFamily = ref;
				break;
			case "lineHeight":
				rootStyle["--ds-input-line-height"] = cssVar(ref);
				descriptionOverrides.lineHeight = ref;
				errorOverrides.lineHeight = ref;
				break;
			default: {
				const hook = ROOT_OVERRIDE_HOOK$17[binding];
				if (hook) rootStyle[hook] = cssVar(ref);
			}
		}
	}
	return {
		rootStyle,
		descriptionOverrides,
		errorOverrides
	};
}
/**
* Input — Design Schema, category: input.
*
* When to use:
* Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type`
* for the value so touch keyboards and browser validation match. Provide `description` when the
* format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the
* value is personal data so browsers and assistive tools can fill it.
*/
const Input = function Input({ ref, label, name, value, defaultValue, placeholder, description, type = "text", required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, autocomplete, overrides, onChange, onFocus, onBlur, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-input${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
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
			getValue: () => inputRef.current?.value ?? "",
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
				const el = inputRef.current;
				const currentValue = el?.value ?? "";
				if (errorProp !== void 0) return errorProp;
				if (isRequired && currentValue.trim() === "") return COPY$28.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$28.invalid.replace("{label}", currentLabel);
				if (el && currentValue !== "" && !el.validity.valid) return el.validationMessage || COPY$28.invalid.replace("{label}", currentLabel);
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
	const handleChange = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		onChange?.(event.target.value, event);
		if (form && form.validate === "change") form.validateField(name);
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const classes = [
		"ds-input",
		`ds-input--${size}`,
		isInvalid ? "ds-input--invalid" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-input__label", hideLabel ? "ds-input__visually-hidden" : null].filter(Boolean).join(" ");
	const { rootStyle, descriptionOverrides, errorOverrides } = overrides ? resolveOverrides$5(overrides) : {
		rootStyle: void 0,
		descriptionOverrides: void 0,
		errorOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Input",
		"data-ds-field": true,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsxs("label", {
				className: labelClasses,
				htmlFor: id,
				children: [label, required ? /* @__PURE__ */ jsx("span", {
					className: "ds-input__required",
					children: COPY$28.requiredIndicator
				}) : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-input__description",
				overrides: descriptionOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsx("input", {
				...rest,
				ref: inputRef,
				id,
				name,
				type,
				value,
				defaultValue,
				placeholder,
				autoComplete: autocomplete,
				className: "ds-input__field",
				"aria-describedby": describedBy || void 0,
				"aria-invalid": isInvalid ? "true" : void 0,
				"aria-required": required ? "true" : void 0,
				"aria-disabled": isDisabled ? "true" : void 0,
				readOnly: isDisabled ? true : rest.readOnly,
				onChange: handleChange,
				onFocus,
				onBlur: handleBlur
			}),
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-input__error",
				overrides: errorOverrides,
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/Form.tsx
/** copy.* — used verbatim; `{count}` is replaced by the number of errors. */
const COPY$27 = {
	summaryHeading: "{count} problems with this form",
	summaryHeadingOne: "1 problem with this form"
};
const OVERRIDE_HOOK$27 = {
	gap: "--ds-form-gap",
	errorSummaryBorder: "--ds-form-error-summary-border"
};
function overridesToStyle$38(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$27[binding]] = cssVar(ref);
	}
	return style;
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
const Form = function Form({ ref, children, actions, name, label, labelledBy, validate = "submit", disabled = false, errorSummary = true, overrides, onSubmit, onInvalid, className, style, ...rest }) {
	const formRef = useRef(null);
	useImperativeHandle(ref, () => formRef.current, []);
	const generatedId = useId();
	const summaryId = `${name ?? `ds-form${generatedId}`}-error-summary`;
	const fieldsRef = useRef(/* @__PURE__ */ new Map());
	const [errors, setErrors] = useState({});
	const submittedRef = useRef(false);
	const [failedSubmissions, setFailedSubmissions] = useState(0);
	const summaryRef = useRef(null);
	const register = useCallback((field) => {
		fieldsRef.current.set(field.name, field);
		return () => {
			if (fieldsRef.current.get(field.name) === field) fieldsRef.current.delete(field.name);
		};
	}, []);
	const validateField = useCallback((fieldName) => {
		if (validate === "submit" && !submittedRef.current) return;
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
	}, [validate]);
	const handleSubmit = (event) => {
		event.preventDefault();
		if (disabled) return;
		submittedRef.current = true;
		const nextErrors = {};
		const values = {};
		let firstInvalid = null;
		for (const field of fieldsRef.current.values()) {
			if (field.isDisabled()) continue;
			const message = field.validate();
			if (message !== null) {
				nextErrors[field.name] = message;
				if (firstInvalid === null) firstInvalid = field;
			} else {
				const fieldValue = field.getValue();
				if (fieldValue !== void 0) values[field.name] = fieldValue;
			}
		}
		setErrors((prev) => shallowEqual(prev, nextErrors) ? prev : nextErrors);
		if (firstInvalid !== null) {
			onInvalid?.(nextErrors);
			if (errorSummary) setFailedSubmissions((count) => count + 1);
			else firstInvalid.focus();
			return;
		}
		onSubmit?.(values);
	};
	useEffect(() => {
		if (failedSubmissions > 0 && errorSummary) summaryRef.current?.focus();
	}, [failedSubmissions, errorSummary]);
	const contextValue = useMemo(() => ({
		disabled,
		validate,
		idBase: name,
		errors,
		register,
		validateField
	}), [
		disabled,
		validate,
		name,
		errors,
		register,
		validateField
	]);
	const errorEntries = Object.entries(errors);
	const showSummary = errorSummary && errorEntries.length > 0;
	const focusField = (fieldName) => (event) => {
		const field = fieldsRef.current.get(fieldName);
		if (field) {
			event.preventDefault();
			field.focus();
		}
	};
	const classes = ["ds-form", className ?? null].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$38(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(FormContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsxs("form", {
			...rest,
			ref: formRef,
			name,
			"data-ds": "Form",
			"data-part": "container",
			className: classes,
			style: mergedStyle,
			noValidate: true,
			"aria-label": labelledBy ? void 0 : label,
			"aria-labelledby": labelledBy,
			onSubmit: handleSubmit,
			children: [
				showSummary ? /* @__PURE__ */ jsxs("div", {
					ref: summaryRef,
					id: summaryId,
					"data-part": "errorSummary",
					className: "ds-form__error-summary",
					role: "alert",
					tabIndex: -1,
					children: [/* @__PURE__ */ jsx(Text, {
						element: "p",
						weight: "semibold",
						tone: "danger",
						className: "ds-form__error-summary-heading",
						children: errorEntries.length === 1 ? COPY$27.summaryHeadingOne : COPY$27.summaryHeading.replace("{count}", String(errorEntries.length))
					}), /* @__PURE__ */ jsx("ul", {
						className: "ds-form__error-list",
						children: errorEntries.map(([fieldName, message]) => {
							const field = fieldsRef.current.get(fieldName);
							const href = field ? `#${field.id}` : void 0;
							return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
								className: "ds-form__error-link",
								href,
								onClick: focusField(fieldName),
								children: field ? `${field.label}: ${message}` : message
							}) }, fieldName);
						})
					})]
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
};
//#endregion
//#region src/Stack.tsx
const OVERRIDE_HOOK$26 = { gap: "--ds-stack-gap" };
function overridesToStyle$37(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$26[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Stack — Design Schema, category: layout.
*
* When to use:
* Use Stack for any group of siblings that should be evenly spaced: form fields, a row of
* buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS.
* Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like
* items — so the structure is exposed to assistive technology.
*/
const Stack = function Stack({ ref, children, direction = "vertical", gap = "normal", align = "stretch", justify = "start", wrap = false, element = "div", overrides, className, style, ...rest }) {
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
	const overrideStyle = overrides ? overridesToStyle$37(overrides) : void 0;
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
		className: classes,
		style: mergedStyle,
		children: isList ? Children.map(children, (child) => child === null || child === void 0 || typeof child === "boolean" ? null : /* @__PURE__ */ jsx("li", {
			className: "ds-stack__item",
			children: child
		})) : children
	});
};
//#endregion
//#region src/Box.tsx
const OVERRIDE_HOOK$25 = {
	paddingBlock: "--ds-box-padding-block",
	paddingInline: "--ds-box-padding-inline",
	background: "--ds-box-background",
	border: "--ds-box-border",
	borderWidth: "--ds-box-border-width",
	radius: "--ds-box-radius"
};
function overridesToStyle$36(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$25[binding]] = cssVar(ref);
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
*/
const Box = function Box({ ref, children, inset = "none", insetBlock, insetInline, surface = "none", border = false, radius = "none", element = "div", overrides, className, style, ...rest }) {
	const Tag = element;
	const classes = [
		"ds-box",
		`ds-box--inset-${inset}`,
		insetBlock ? `ds-box--inset-block-${insetBlock}` : null,
		insetInline ? `ds-box--inset-inline-${insetInline}` : null,
		surface !== "none" ? `ds-box--surface-${surface}` : null,
		border ? "ds-box--border" : null,
		radius !== "none" ? `ds-box--radius-${radius}` : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$36(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		"data-ds": "Box",
		className: classes,
		style: mergedStyle,
		children
	});
};
//#endregion
//#region src/Icon.tsx
const OVERRIDE_HOOK$24 = {
	size: "--ds-icon-size",
	color: "--ds-icon-color",
	strokeWidth: "--ds-icon-stroke-width"
};
function overridesToStyle$35(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$24[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$26 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Glyphs drawn on a 16×16 grid, keyed by `name`.
*
* Line glyphs (check, dash, chevrons, close, plus, minus, external, search, arrows, calendar,
* menu, list, grid, folder, file) are bare `<path>`/`<rect>` shapes and inherit the root
* `<svg>`'s `fill="none" stroke="currentColor"`. Filled glyphs (the four status shapes, ellipsis,
* play, pause) set `fill="currentColor" stroke="none"` on themselves; the status shapes are
* single `fill-rule="evenodd"` paths whose inner mark (i, check, !, x) is a hole, so they read on
* any surface without a second color. `list`'s bullet dots are filled the same way.
*
* Other components render `<Icon name>`; nothing else should import this table.
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
	ellipsis: /* @__PURE__ */ jsxs("g", {
		fill: "currentColor",
		stroke: "none",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "3",
				cy: "8",
				r: "1.25"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "8",
				cy: "8",
				r: "1.25"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "13",
				cy: "8",
				r: "1.25"
			})
		]
	}),
	search: /* @__PURE__ */ jsx("path", { d: "M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" }),
	"arrow-right": /* @__PURE__ */ jsx("path", { d: "M3 8h10M9 4l4 4-4 4" }),
	"arrow-left": /* @__PURE__ */ jsx("path", { d: "M13 8H3M7 4L3 8l4 4" }),
	calendar: /* @__PURE__ */ jsx("path", { d: "M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" }),
	menu: /* @__PURE__ */ jsx("path", { d: "M2 4h12M2 8h12M2 12h12" }),
	list: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("path", { d: "M5 4h9M5 8h9M5 12h9" }), /* @__PURE__ */ jsxs("g", {
		fill: "currentColor",
		stroke: "none",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "2",
				cy: "4",
				r: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "2",
				cy: "8",
				r: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "2",
				cy: "12",
				r: "1"
			})
		]
	})] }),
	grid: /* @__PURE__ */ jsxs("g", { children: [
		/* @__PURE__ */ jsx("rect", {
			x: "2",
			y: "2",
			width: "5",
			height: "5"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "9",
			y: "2",
			width: "5",
			height: "5"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "2",
			y: "9",
			width: "5",
			height: "5"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "9",
			y: "9",
			width: "5",
			height: "5"
		})
	] }),
	play: /* @__PURE__ */ jsx("path", {
		fill: "currentColor",
		stroke: "none",
		d: "M4 2L14 8L4 14Z"
	}),
	pause: /* @__PURE__ */ jsxs("g", {
		fill: "currentColor",
		stroke: "none",
		children: [/* @__PURE__ */ jsx("rect", {
			x: "3",
			y: "2",
			width: "3",
			height: "12"
		}), /* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "2",
			width: "3",
			height: "12"
		})]
	}),
	folder: /* @__PURE__ */ jsx("path", { d: "M2 13L2 2L7 2L7 4L14 4L14 13Z" }),
	file: /* @__PURE__ */ jsx("path", { d: "M4 2H9L12 5V14H4Z M9 2V5H12" })
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
* Glyphs are drawn in `currentColor`, so a Button, Link or Alert colors them for free; only an
* icon with no colored ancestor falls back to `color.foreground`. Line glyphs use the focus-ring
* width as their stroke.
*/
const Icon = function Icon({ ref, name, size = "md", inline = false, label, overrides, className, style, ...rest }) {
	const labelled = label !== void 0 && label !== "";
	const glyph = paths[name];
	if (isDev$26 && !glyph) console.warn(`Icon: unknown name "${name}"`);
	const classes = [
		"ds-icon",
		inline ? "ds-icon--inline" : `ds-icon--${size}`,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$35(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx("svg", {
		...rest,
		ref,
		"data-ds": "Icon",
		className: classes,
		style: mergedStyle,
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
};
//#endregion
//#region src/Link.tsx
/** copy.externalSuffix — appended to the accessible name of an external link. */
const EXTERNAL_SUFFIX = " (opens in new tab)";
const OVERRIDE_HOOK$23 = {
	underlineThickness: "--ds-link-underline-thickness",
	underlineOffset: "--ds-link-underline-offset",
	externalIconGap: "--ds-link-external-icon-gap",
	transition: "--ds-link-transition"
};
function overridesToStyle$34(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$23[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Link — Design Schema, category: navigation.
*
* When to use:
* Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to
* an external site, or to a downloadable file. Use it inline inside body text (it renders inline
* by default) and standalone in navigation lists. Use `external` whenever the destination leaves
* the product, so people are warned before they lose their place.
*/
const Link = function Link({ ref, href, label, external = false, tone = "default", download = false, overrides, onClick, className, style, ...rest }) {
	const classes = [
		"ds-link",
		`ds-link--tone-${tone}`,
		external ? "ds-link--external" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$34(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("a", {
		...rest,
		ref,
		href,
		"data-ds": "Link",
		className: classes,
		style: mergedStyle,
		target: external ? "_blank" : void 0,
		rel: external ? "noopener noreferrer" : void 0,
		download: download ? true : void 0,
		onClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ds-link__label",
			children: label
		}), external ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
			className: "ds-link__external-suffix",
			children: EXTERNAL_SUFFIX
		}), /* @__PURE__ */ jsx("span", {
			className: "ds-link__external-icon",
			"data-part": "externalIcon",
			"aria-hidden": "true",
			children: /* @__PURE__ */ jsx(Icon, {
				name: "external",
				inline: true
			})
		})] }) : null]
	});
};
//#endregion
//#region src/Checkbox.tsx
/** copy.* — used verbatim; `{label}` is replaced by the visible label. */
const COPY$26 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
const OVERRIDE_HOOK$22 = {
	controlBackground: "--ds-checkbox-control-background",
	controlBorderWidth: "--ds-checkbox-control-border-width",
	indicatorStroke: "--ds-checkbox-indicator-stroke",
	pressedOverlay: "--ds-checkbox-pressed-overlay",
	controlBorderInvalid: "--ds-checkbox-control-border-invalid",
	controlSize: "--ds-checkbox-control-size",
	controlRadius: "--ds-checkbox-control-radius",
	gap: "--ds-checkbox-gap",
	partGap: "--ds-checkbox-part-gap",
	labelSize: "--ds-checkbox-label-size",
	labelWeight: "--ds-checkbox-label-weight",
	helperSize: "--ds-checkbox-helper-size",
	fontFamily: "--ds-checkbox-font-family",
	lineHeight: "--ds-checkbox-line-height",
	disabledOpacity: "--ds-checkbox-disabled-opacity",
	transition: "--ds-checkbox-transition"
};
function overridesToStyle$33(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$22[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Checkbox — Design Schema, category: input.
*
* When to use:
* Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`),
* or several with the same `name` when the user may pick any number of items. Use
* `indeterminate` on a "select all" parent when only some of its children are checked.
*/
const Checkbox = function Checkbox({ ref, label, hideLabel = false, name, value = "on", checked, defaultChecked = false, indeterminate = false, disabled = false, required = false, invalid = false, description, error, overrides, onChange, onClick, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-checkbox${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isInvalid = invalid || resolvedError !== void 0;
	useEffect(() => {
		if (inputRef.current) inputRef.current.indeterminate = indeterminate;
	}, [indeterminate]);
	const latest = useRef({
		label,
		value,
		required,
		disabled: isDisabled,
		invalid,
		error
	});
	latest.current = {
		label,
		value,
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
			getValue: () => inputRef.current?.checked ? latest.current.value : void 0,
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				if (isRequired && !inputRef.current?.checked) return COPY$26.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$26.invalid.replace("{label}", currentLabel);
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
		onChange?.(event.target.checked, event);
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const handleDescriptionClick = () => {
		if (!isDisabled) inputRef.current?.click();
	};
	const classes = [
		"ds-checkbox",
		isInvalid ? "ds-checkbox--invalid" : null,
		isDisabled ? "ds-checkbox--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$33(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const labelClasses = ["ds-checkbox__label", hideLabel ? "ds-checkbox__visually-hidden" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Checkbox",
		"data-ds-field": true,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-checkbox__row",
				children: [/* @__PURE__ */ jsx("input", {
					...rest,
					ref: inputRef,
					id,
					type: "checkbox",
					name,
					value,
					checked,
					defaultChecked: checked === void 0 ? defaultChecked : void 0,
					className: "ds-checkbox__control",
					"aria-describedby": describedBy || void 0,
					"aria-invalid": isInvalid ? "true" : void 0,
					"aria-required": required ? "true" : void 0,
					"aria-checked": indeterminate ? "mixed" : void 0,
					"aria-disabled": isDisabled ? "true" : void 0,
					onClick: handleClick,
					onChange: handleChange
				}), /* @__PURE__ */ jsxs("label", {
					htmlFor: id,
					className: labelClasses,
					children: [label, required ? /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "sm",
						tone: "muted",
						className: "ds-checkbox__required",
						children: COPY$26.requiredIndicator
					}) : null]
				})]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-checkbox__description",
				onClick: handleDescriptionClick,
				children: description
			}) : null,
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-checkbox__error",
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/Switch.tsx
const OVERRIDE_HOOK$21 = {
	trackWidth: "--ds-switch-track-width",
	trackHeight: "--ds-switch-track-height",
	thumbSize: "--ds-switch-thumb-size",
	thumbInset: "--ds-switch-thumb-inset",
	radius: "--ds-switch-radius",
	gap: "--ds-switch-gap",
	partGap: "--ds-switch-part-gap",
	labelSize: "--ds-switch-label-size",
	labelWeight: "--ds-switch-label-weight",
	helperSize: "--ds-switch-helper-size",
	fontFamily: "--ds-switch-font-family",
	lineHeight: "--ds-switch-line-height",
	disabledOpacity: "--ds-switch-disabled-opacity",
	transition: "--ds-switch-transition"
};
function overridesToStyle$32(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$21[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Switch — Design Schema, category: input.
*
* When to use:
* Use a Switch for a binary setting that applies as soon as it changes and can be undone by
* flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists
* and preference panels, with `labelPosition: start` so the labels line up and the switches sit
* at the row end.
*/
const Switch = function Switch({ ref, label, name, checked, defaultChecked = false, disabled = false, description, labelPosition = "start", overrides, onChange, onClick, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-switch${generatedId}`);
	const descriptionId = `${id}-description`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isControlled = checked !== void 0;
	const [internalChecked, setInternalChecked] = useState(defaultChecked);
	const isChecked = isControlled ? checked : internalChecked;
	const isDisabled = disabled || (form?.disabled ?? false);
	const latest = useRef({
		label,
		disabled: isDisabled
	});
	latest.current = {
		label,
		disabled: isDisabled
	};
	useEffect(() => {
		if (!form || !name) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => inputRef.current?.checked ?? false,
			isDisabled: () => latest.current.disabled,
			validate: () => null,
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
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
		if (!isControlled) setInternalChecked(event.target.checked);
		onChange?.(event.target.checked, event);
	};
	const handleDescriptionClick = () => {
		if (!isDisabled) inputRef.current?.click();
	};
	const classes = [
		"ds-switch",
		`ds-switch--label-${labelPosition}`,
		isDisabled ? "ds-switch--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$32(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Switch",
		style: mergedStyle,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ds-switch__text",
			children: [/* @__PURE__ */ jsx("label", {
				htmlFor: id,
				className: "ds-switch__label",
				children: label
			}), description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-switch__description",
				onClick: handleDescriptionClick,
				children: description
			}) : null]
		}), /* @__PURE__ */ jsx("input", {
			...rest,
			ref: inputRef,
			id,
			type: "checkbox",
			role: "switch",
			name,
			checked,
			defaultChecked: isControlled ? void 0 : defaultChecked,
			className: "ds-switch__control",
			"aria-checked": isChecked ? "true" : "false",
			"aria-describedby": description ? descriptionId : void 0,
			"aria-disabled": isDisabled ? "true" : void 0,
			onClick: handleClick,
			onChange: handleChange
		})]
	});
};
//#endregion
//#region src/RadioGroup.tsx
/** copy.* — used verbatim; `{label}` is replaced by the legend. */
const COPY$25 = {
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
const OVERRIDE_HOOK$20 = {
	controlBorderWidth: "--ds-radio-group-control-border-width",
	controlBorderInvalid: "--ds-radio-group-control-border-invalid",
	controlSize: "--ds-radio-group-control-size",
	controlRadius: "--ds-radio-group-control-radius",
	optionGap: "--ds-radio-group-option-gap",
	listGap: "--ds-radio-group-list-gap",
	partGap: "--ds-radio-group-part-gap",
	legendSize: "--ds-radio-group-legend-size",
	legendWeight: "--ds-radio-group-legend-weight",
	labelSize: "--ds-radio-group-label-size",
	labelWeight: "--ds-radio-group-label-weight",
	helperSize: "--ds-radio-group-helper-size",
	fontFamily: "--ds-radio-group-font-family",
	lineHeight: "--ds-radio-group-line-height",
	disabledOpacity: "--ds-radio-group-disabled-opacity",
	transition: "--ds-radio-group-transition"
};
function overridesToStyle$31(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$20[binding]] = cssVar(ref);
	}
	return style;
}
/**
* RadioGroup — Design Schema, category: input.
*
* When to use:
* Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing
* them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give
* options a `description` when the label alone does not tell them apart. Set `defaultValue` when
* there is a sensible default; leave the group unselected when the choice is consequential and
* you want a deliberate answer.
*/
const RadioGroup = function RadioGroup({ ref, label, name, options, value, defaultValue, orientation = "vertical", required = false, invalid = false, disabled = false, description, error, overrides, onChange, onBlur, id: idProp, className, style, ...rest }) {
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
	const resolvedError = error ?? form?.errors[name];
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
				if (isRequired && current === void 0) return COPY$25.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$25.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => {
				const { selected: current, options: currentOptions } = latest.current;
				const target = current !== void 0 ? current : currentOptions.find((option) => !option.disabled)?.value;
				if (target !== void 0) radioRefs.current.get(target)?.focus();
			}
		});
	}, [
		form,
		name,
		id
	]);
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const handleClick = (event) => {
		if (isDisabled) event.preventDefault();
	};
	const handleChange = (option) => (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		if (!isControlled) setInternalValue(option.value);
		onChange?.(option.value, event);
		if (form && form.validate === "change") form.validateField(name);
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (event.relatedTarget && fieldsetRef.current?.contains(event.relatedTarget)) return;
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const setRadioRef = (optionValue) => (el) => {
		if (el) radioRefs.current.set(optionValue, el);
		else radioRefs.current.delete(optionValue);
	};
	const classes = [
		"ds-radio-group",
		`ds-radio-group--${orientation}`,
		isInvalid ? "ds-radio-group--invalid" : null,
		isDisabled ? "ds-radio-group--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$31(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("fieldset", {
		...rest,
		ref: fieldsetRef,
		id,
		"data-ds": "RadioGroup",
		className: classes,
		style: mergedStyle,
		"aria-describedby": describedBy || void 0,
		"aria-invalid": isInvalid ? "true" : void 0,
		"aria-required": required ? "true" : void 0,
		"aria-disabled": isDisabled ? "true" : void 0,
		onBlur: handleBlur,
		children: [
			/* @__PURE__ */ jsxs("legend", {
				className: "ds-radio-group__legend",
				children: [label, required ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					size: "sm",
					tone: "muted",
					weight: "regular",
					className: "ds-radio-group__required",
					children: COPY$25.requiredIndicator
				}) : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-radio-group__description",
				children: description
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "ds-radio-group__list",
				children: options.map((option) => {
					const optionId = `${id}-${option.value}`;
					const optionDescriptionId = `${optionId}-description`;
					const optionClasses = ["ds-radio-group__option", isDisabled || option.disabled === true ? "ds-radio-group__option--disabled" : null].filter(Boolean).join(" ");
					return /* @__PURE__ */ jsxs("div", {
						className: optionClasses,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "ds-radio-group__row",
							children: [/* @__PURE__ */ jsx("input", {
								ref: setRadioRef(option.value),
								id: optionId,
								type: "radio",
								name,
								value: option.value,
								"data-part": "radio",
								checked: isControlled ? value === option.value : void 0,
								defaultChecked: isControlled ? void 0 : defaultValue === option.value,
								className: "ds-radio-group__control",
								disabled: option.disabled === true,
								"aria-describedby": option.description ? optionDescriptionId : void 0,
								"aria-disabled": isDisabled ? "true" : void 0,
								"aria-invalid": isInvalid ? "true" : void 0,
								onClick: handleClick,
								onChange: handleChange(option)
							}), /* @__PURE__ */ jsx("label", {
								htmlFor: optionId,
								"data-part": "radioLabel",
								className: "ds-radio-group__label",
								children: option.label
							})]
						}), option.description ? /* @__PURE__ */ jsx(Text, {
							element: "p",
							id: optionDescriptionId,
							"data-part": "radioDescription",
							size: "sm",
							tone: "muted",
							className: "ds-radio-group__option-description",
							children: option.description
						}) : null]
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
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/Disclosure.tsx
const OVERRIDE_HOOK$19 = {
	triggerPaddingBlock: "--ds-disclosure-trigger-padding-block",
	triggerPaddingInline: "--ds-disclosure-trigger-padding-inline",
	triggerGap: "--ds-disclosure-trigger-gap",
	triggerFontFamily: "--ds-disclosure-trigger-font-family",
	triggerFontSize: "--ds-disclosure-trigger-font-size",
	triggerFontWeight: "--ds-disclosure-trigger-font-weight",
	triggerRadius: "--ds-disclosure-trigger-radius",
	panelPaddingBlock: "--ds-disclosure-panel-padding-block",
	panelPaddingInline: "--ds-disclosure-panel-padding-inline",
	disabledOpacity: "--ds-disclosure-disabled-opacity",
	transition: "--ds-disclosure-transition"
};
function overridesToStyle$30(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$19[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Disclosure — Design Schema, category: container.
*
* When to use:
* Use a Disclosure to hide secondary content that some users need and most do not: optional
* settings, long explanations, a list of details behind a summary count. Stack several to make an
* accordion — each is independent; nothing in this component closes its siblings. Set
* `headingLevel` when the summaries are section titles so they appear in the outline and
* screen-reader heading lists.
*/
const Disclosure = function Disclosure({ ref, summary, children, open, defaultOpen = false, disabled = false, keepMounted = false, headingLevel, overrides, onToggle, id: idProp, className, style, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-disclosure${generatedId}`;
	const panelId = `${id}-panel`;
	const triggerRef = useRef(null);
	useImperativeHandle(ref, () => triggerRef.current, []);
	const isControlled = open !== void 0;
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isOpen = isControlled ? open : internalOpen;
	const panelExists = isOpen || keepMounted;
	const focusWithinPanel = useRef(false);
	useEffect(() => {
		if (!isOpen && focusWithinPanel.current) {
			focusWithinPanel.current = false;
			triggerRef.current?.focus();
		}
	}, [isOpen]);
	const mountedRef = useRef(false);
	const previousOpenRef = useRef(isOpen);
	const selfEmittedRef = useRef(null);
	useEffect(() => {
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
	const handleClick = (event) => {
		if (disabled) {
			event.preventDefault();
			return;
		}
		const next = !isOpen;
		if (isControlled) selfEmittedRef.current = next;
		else setInternalOpen(next);
		onToggle?.(next, event.detail === 0 ? "keyboard" : "pointer");
	};
	const classes = [
		"ds-disclosure",
		isOpen ? "ds-disclosure--open" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$30(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const trigger = /* @__PURE__ */ jsxs("button", {
		...rest,
		ref: triggerRef,
		id,
		type: "button",
		className: "ds-disclosure__trigger",
		"aria-expanded": isOpen ? "true" : "false",
		"aria-controls": panelExists ? panelId : void 0,
		"aria-disabled": disabled ? "true" : void 0,
		onClick: handleClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "ds-disclosure__icon",
			"data-part": "triggerIcon",
			"aria-hidden": "true",
			children: /* @__PURE__ */ jsx("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				focusable: "false",
				children: /* @__PURE__ */ jsx("path", { d: "M6 3l5 5-5 5" })
			})
		}), /* @__PURE__ */ jsx("span", {
			className: "ds-disclosure__summary",
			children: summary
		})]
	});
	const Heading = headingLevel !== void 0 ? `h${headingLevel}` : null;
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "Disclosure",
		style: mergedStyle,
		children: [Heading ? /* @__PURE__ */ jsx(Heading, {
			className: "ds-disclosure__heading",
			children: trigger
		}) : trigger, panelExists ? /* @__PURE__ */ jsx("div", {
			id: panelId,
			className: "ds-disclosure__panel",
			"data-part": "panel",
			hidden: !isOpen,
			onFocus: () => {
				focusWithinPanel.current = true;
			},
			onBlur: (event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) focusWithinPanel.current = false;
			},
			children
		}) : null]
	});
};
//#endregion
//#region src/Alert.tsx
/** copy.dismissLabel */
const DISMISS_LABEL = "Dismiss";
const OVERRIDE_HOOK$18 = {
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
/** `iconSize` also drives the composed Icon's own `size` override, since Icon owns its own sizing hook. */
function overridesToStyle$29(overrides) {
	const style = {};
	let iconSizeRef;
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		style[OVERRIDE_HOOK$18[binding]] = cssVar(ref);
		if (binding === "iconSize") iconSizeRef = ref;
	}
	return {
		rootStyle: style,
		iconSizeRef
	};
}
const FOCUSABLE$1 = "a[href], button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"]), [contenteditable=\"true\"]";
/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside$1(root) {
	const candidates = Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE$1)).filter((el) => !root.contains(el));
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
const Alert = function Alert({ ref, tone = "info", heading, children, live = "status", dismissible = false, onDismiss, overrides, className, style, ...rest }) {
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const headingId = useId();
	const bodyId = useId();
	const handleDismiss = () => {
		if (rootRef.current) focusOutside$1(rootRef.current);
		onDismiss?.();
	};
	const classes = [
		"ds-alert",
		`ds-alert--${tone}`,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, iconSizeRef } = overrides ? overridesToStyle$29(overrides) : {
		rootStyle: void 0,
		iconSizeRef: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Alert",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		role: live === "off" ? void 0 : live,
		"aria-labelledby": heading ? headingId : bodyId,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "ds-alert__icon",
				"data-part": "icon",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(Icon, {
					name: tone,
					size: "lg",
					overrides: {
						color: `color.status.${tone}.icon`,
						...iconSizeRef ? { size: iconSizeRef } : null
					}
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ds-alert__content",
				children: [heading ? /* @__PURE__ */ jsx("p", {
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
					label: DISMISS_LABEL,
					onClick: handleDismiss,
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "close",
						inline: true
					})
				})
			}) : null
		]
	});
};
//#endregion
//#region src/Landmark.tsx
const isDev$25 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Native elements carry the roles; `search` is <form role="search"> (never branch on `document` at render). */
function defaultElement(role) {
	switch (role) {
		case "banner": return "header";
		case "navigation": return "nav";
		case "main": return "main";
		case "complementary": return "aside";
		case "contentinfo": return "footer";
		case "region": return "section";
		case "search": return "form";
		case "form": return "form";
	}
}
/** The roles these elements imply on their own, when not nested in sectioning content. */
const IMPLIED_ROLE = {
	header: "banner",
	nav: "navigation",
	main: "main",
	aside: "complementary",
	footer: "contentinfo",
	section: "region",
	form: "form"
};
/** Roles that take labels and must not be duplicated without distinct ones. */
const LABELLED_ROLES = /* @__PURE__ */ new Set([
	"navigation",
	"complementary",
	"region",
	"form"
]);
/** Development-only bookkeeping for the warnings in the guidance. */
const registry = /* @__PURE__ */ new Map();
/**
* Landmark — Design Schema, category: layout.
*
* When to use:
* Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for
* the primary content, `navigation` for each navigation block (labelled when there is more than
* one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site
* footer, `search` around the site search form, and `region` for any other section a user might
* want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly
* one `main`.
*/
const Landmark = function Landmark({ ref, role, label, children, as, className, ...rest }) {
	const tagName = as ?? defaultElement(role);
	const needsExplicitRole = IMPLIED_ROLE[tagName] !== role || tagName === "header" || tagName === "footer";
	useEffect(() => {
		if (!isDev$25) return void 0;
		if ((role === "region" || role === "form") && !label) console.warn(`Landmark: a "${role}" landmark needs a label; without one it is not exposed as a landmark.`);
		const labels = registry.get(role) ?? /* @__PURE__ */ new Map();
		labels.set(label, (labels.get(label) ?? 0) + 1);
		registry.set(role, labels);
		const total = Array.from(labels.values()).reduce((sum, count) => sum + count, 0);
		if (role === "main" && total > 1) console.warn("Landmark: a document should contain exactly one \"main\" landmark.");
		else if (LABELLED_ROLES.has(role) && (labels.get(label) ?? 0) > 1) console.warn(`Landmark: two "${role}" landmarks in the same document ${label === void 0 ? "both lack a label" : `share the label "${label}"`}; give each a distinct label.`);
		return () => {
			const count = labels.get(label) ?? 0;
			if (count <= 1) labels.delete(label);
			else labels.set(label, count - 1);
		};
	}, [role, label]);
	const classes = ["ds-landmark", className ?? null].filter(Boolean).join(" ");
	return createElement(tagName, {
		...rest,
		ref,
		className: classes,
		"data-ds": "Landmark",
		role: needsExplicitRole ? role : void 0,
		"aria-label": label
	}, children);
};
//#endregion
//#region src/Breadcrumb.tsx
/** copy.separator — drawn by CSS so it is not in the accessibility tree. */
const SEPARATOR = "/";
/** copy.expandLabel */
const EXPAND_LABEL = "Show all pages";
/** With `collapse`, trails longer than this show the first item, an ellipsis, and the last two. */
const COLLAPSE_ABOVE = 4;
const OVERRIDE_HOOK$17 = {
	gap: "--ds-breadcrumb-gap",
	fontFamily: "--ds-breadcrumb-font-family",
	fontSize: "--ds-breadcrumb-font-size",
	fontWeight: "--ds-breadcrumb-font-weight",
	lineHeight: "--ds-breadcrumb-line-height"
};
function overridesToStyle$28(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$17[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Breadcrumb — Design Schema, category: navigation.
*
* When to use:
* Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
* catalogues, settings sub-pages, file browsers — where the user benefits from seeing the
* ancestors and jumping to any of them. Place it above the page title, at the top of `main`.
*/
const Breadcrumb = function Breadcrumb({ ref, items, label = "Breadcrumb", collapse = true, overrides, onNavigate, className, style, ...rest }) {
	const [expanded, setExpanded] = useState(false);
	const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
	const linkRefs = useRef(/* @__PURE__ */ new Map());
	const revealedIndex = useRef(null);
	useEffect(() => {
		if (revealedIndex.current !== null) {
			linkRefs.current.get(revealedIndex.current)?.focus();
			revealedIndex.current = null;
		}
	}, [expanded]);
	const handleExpand = () => {
		revealedIndex.current = 1;
		setExpanded(true);
	};
	const setLinkRef = (index) => (el) => {
		if (el) linkRefs.current.set(index, el);
		else linkRefs.current.delete(index);
	};
	const lastIndex = items.length - 1;
	const hiddenStart = 1;
	const hiddenEnd = items.length - 2;
	const renderItem = (item, index) => {
		if (index === lastIndex) return /* @__PURE__ */ jsx("li", {
			className: "ds-breadcrumb__item",
			"data-part": "item",
			children: /* @__PURE__ */ jsx("span", {
				className: "ds-breadcrumb__current",
				"data-part": "current",
				"aria-current": "page",
				children: item.label
			})
		}, index);
		if (item.href === void 0) return /* @__PURE__ */ jsx("li", {
			className: "ds-breadcrumb__item",
			"data-part": "item",
			children: /* @__PURE__ */ jsx("span", {
				className: "ds-breadcrumb__text",
				children: item.label
			})
		}, index);
		return /* @__PURE__ */ jsx("li", {
			className: "ds-breadcrumb__item",
			"data-part": "item",
			children: /* @__PURE__ */ jsx(Link, {
				ref: setLinkRef(index),
				href: item.href,
				label: item.label,
				tone: "default",
				"data-part": "link",
				onClick: (event) => onNavigate?.(item, index, event)
			})
		}, index);
	};
	const list = collapsed ? [
		...items.slice(0, hiddenStart).map(renderItem),
		/* @__PURE__ */ jsx("li", {
			className: "ds-breadcrumb__item",
			"data-part": "item",
			children: /* @__PURE__ */ jsx(Button, {
				className: "ds-breadcrumb__expand",
				variant: "ghost",
				size: "sm",
				iconOnly: true,
				label: EXPAND_LABEL,
				onClick: handleExpand,
				leadingIcon: /* @__PURE__ */ jsx(Icon, {
					name: "ellipsis",
					inline: true
				})
			})
		}, "ellipsis"),
		...items.slice(hiddenEnd).map((item, offset) => renderItem(item, hiddenEnd + offset))
	] : items.map(renderItem);
	const classes = ["ds-breadcrumb", className ?? null].filter(Boolean).join(" ");
	const mergedStyle = {
		...overrides ? overridesToStyle$28(overrides) : void 0,
		...style,
		"--ds-breadcrumb-separator": `'${SEPARATOR}'`
	};
	return /* @__PURE__ */ jsx("nav", {
		...rest,
		ref,
		"data-ds": "Breadcrumb",
		"data-part": "nav",
		className: classes,
		style: mergedStyle,
		"aria-label": label,
		children: /* @__PURE__ */ jsx("ol", {
			className: "ds-breadcrumb__list",
			"data-part": "list",
			children: list
		})
	});
};
//#endregion
//#region src/Meter.tsx
/** Bindings owned by the root; `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` are forwarded
* into the composed Text elements' own `overrides` contract instead, since Text already exposes them. */
const ROOT_OVERRIDE_HOOK$16 = {
	trackHeight: "--ds-meter-track-height",
	radius: "--ds-meter-radius",
	partGap: "--ds-meter-part-gap",
	labelGap: "--ds-meter-label-gap",
	transition: "--ds-meter-transition"
};
function overridesToStyle$27(overrides) {
	const rootStyle = {};
	const labelTextOverrides = {};
	const valueTextOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const rootHook = ROOT_OVERRIDE_HOOK$16[binding];
		if (rootHook) {
			rootStyle[rootHook] = cssVar(ref);
			continue;
		}
		switch (binding) {
			case "labelSize":
				labelTextOverrides.fontSize = ref;
				break;
			case "labelWeight":
				labelTextOverrides.fontWeight = ref;
				break;
			case "valueSize":
				valueTextOverrides.fontSize = ref;
				break;
			case "fontFamily":
				labelTextOverrides.fontFamily = ref;
				valueTextOverrides.fontFamily = ref;
				break;
			case "lineHeight":
				labelTextOverrides.lineHeight = ref;
				valueTextOverrides.lineHeight = ref;
		}
	}
	return {
		rootStyle,
		labelTextOverrides,
		valueTextOverrides
	};
}
const isDev$24 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Meter — Design Schema, category: data.
*
* When to use:
* Use a Meter for a measurement with a fixed range: storage or quota used, battery, password
* strength, a score out of ten, a budget consumed. Let the consumer decide the tone from
* thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText`
* whenever the raw percentage is not what a person would say.
*/
const Meter = function Meter({ ref, value, min = 0, max = 100, label, valueText, tone = "info", hideValue = false, overrides, id: idProp, className, style, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-meter${generatedId}`;
	const labelId = `${id}-label`;
	const validRange = max > min;
	useEffect(() => {
		if (isDev$24 && !validRange) console.warn(`Meter: \`max\` (${max}) must be greater than \`min\` (${min}).`);
	}, [
		validRange,
		min,
		max
	]);
	const clamped = validRange ? Math.min(Math.max(Number.isFinite(value) ? value : min, min), max) : min;
	const percent = validRange ? (clamped - min) / (max - min) * 100 : 0;
	const resolvedValueText = valueText ?? `${Math.round(percent)}%`;
	const classes = [
		"ds-meter",
		`ds-meter--${tone}`,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, labelTextOverrides, valueTextOverrides } = overrides ? overridesToStyle$27(overrides) : {
		rootStyle: void 0,
		labelTextOverrides: void 0,
		valueTextOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		id,
		"data-ds": "Meter",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ds-meter__header",
			children: [/* @__PURE__ */ jsx(Text, {
				element: "span",
				id: labelId,
				"data-part": "label",
				size: "sm",
				weight: "medium",
				className: "ds-meter__label",
				overrides: labelTextOverrides,
				children: label
			}), hideValue ? null : /* @__PURE__ */ jsx(Text, {
				element: "span",
				"data-part": "valueText",
				size: "sm",
				tone: "muted",
				className: "ds-meter__value",
				overrides: valueTextOverrides,
				children: resolvedValueText
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ds-meter__track",
			"data-part": "track",
			role: "meter",
			"aria-labelledby": labelId,
			"aria-valuenow": clamped,
			"aria-valuemin": min,
			"aria-valuemax": max,
			"aria-valuetext": resolvedValueText,
			children: /* @__PURE__ */ jsx("div", {
				className: "ds-meter__fill",
				"data-part": "fill",
				style: { inlineSize: `${percent}%` }
			})
		})]
	});
};
//#endregion
//#region src/Card.tsx
const OVERRIDE_HOOK$16 = {
	paddingBlock: "--ds-card-padding-block",
	paddingInline: "--ds-card-padding-inline",
	partGap: "--ds-card-part-gap",
	headerGap: "--ds-card-header-gap",
	footerGap: "--ds-card-footer-gap",
	actionsGap: "--ds-card-actions-gap",
	border: "--ds-card-border",
	borderWidth: "--ds-card-border-width",
	radius: "--ds-card-radius",
	hoverBackground: "--ds-card-hover-background",
	transition: "--ds-card-transition"
};
function overridesToStyle$26(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$16[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$23 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Card — Design Schema, category: container.
*
* When to use:
* Use Cards for collections of like items where each needs its own boundary, and for a single
* panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in
* a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page.
* Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
*/
const Card = function Card({ ref, children, heading, headingLevel = "3", headerActions, footer, inset = "md", surface = "default", interactive = false, focusable = false, overrides, className, style, ...rest }) {
	const generatedId = useId();
	const headingId = heading ? `ds-card${generatedId}-heading` : void 0;
	if (isDev$23 && interactive && (!isValidElement(children) || Children.count(children) !== 1)) console.warn("Card: `interactive` requires exactly one interactive child (a Link or Button).");
	const Tag = heading ? "article" : "div";
	const classes = [
		"ds-card",
		`ds-card--inset-${inset}`,
		`ds-card--surface-${surface}`,
		interactive ? "ds-card--interactive" : null,
		focusable ? "ds-card--focusable" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$26(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const showHeader = Boolean(heading) || headerActions !== void 0;
	const showFooter = footer !== void 0;
	const body = interactive && isValidElement(children) ? cloneElement(children, { className: ["ds-card__interactive-target", children.props.className].filter(Boolean).join(" ") }) : children;
	return /* @__PURE__ */ jsxs(Tag, {
		...rest,
		ref,
		"data-ds": "Card",
		"data-part": "surface",
		className: classes,
		style: mergedStyle,
		"aria-labelledby": headingId,
		tabIndex: focusable ? -1 : void 0,
		children: [
			showHeader ? /* @__PURE__ */ jsxs("div", {
				className: "ds-card__header",
				"data-part": "header",
				children: [heading ? /* @__PURE__ */ jsx(Heading, {
					level: headingLevel,
					id: headingId,
					className: "ds-card__heading",
					children: heading
				}) : null, headerActions !== void 0 ? /* @__PURE__ */ jsx("div", {
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
			showFooter ? /* @__PURE__ */ jsx("div", {
				className: "ds-card__footer",
				"data-part": "footer",
				children: footer
			}) : null
		]
	});
};
//#endregion
//#region src/Container.tsx
const OVERRIDE_HOOK$15 = {
	maxWidth: "--ds-container-max-width",
	paddingInline: "--ds-container-padding-inline"
};
function overridesToStyle$25(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$15[binding]] = cssVar(ref);
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
*/
const Container = function Container({ ref, children, width = "content", gutter = "default", align = "center", element = "div", overrides, className, style, ...rest }) {
	const Tag = element;
	const classes = [
		"ds-container",
		`ds-container--width-${width}`,
		`ds-container--gutter-${gutter}`,
		`ds-container--align-${align}`,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$25(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsx(Tag, {
		...rest,
		ref,
		"data-ds": "Container",
		className: classes,
		style: mergedStyle,
		children
	});
};
//#endregion
//#region src/FocusScope.tsx
const FOCUSABLE_SELECTOR$12 = [
	"a[href]",
	"button",
	"input",
	"select",
	"textarea",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]"
].join(",");
function isFocusable(element) {
	if (!(element instanceof HTMLElement)) return false;
	if (element.hasAttribute("data-focus-sentinel")) return false;
	if ("disabled" in element && element.disabled) return false;
	if (element.tabIndex < 0) return false;
	return element.matches(FOCUSABLE_SELECTOR$12);
}
function isHiddenSubtree(element) {
	return element.hasAttribute("inert") || element.getAttribute("aria-hidden") === "true";
}
/** Walks DOM order including open shadow roots and assigned slot nodes, skipping hidden subtrees. */
function collectFocusable(root, results = []) {
	for (const child of Array.from(root.children)) {
		if (isHiddenSubtree(child)) continue;
		if (child instanceof HTMLSlotElement) {
			for (const assigned of child.assignedElements({ flatten: true })) {
				if (isHiddenSubtree(assigned)) continue;
				if (isFocusable(assigned)) results.push(assigned);
				if (assigned.shadowRoot) collectFocusable(assigned.shadowRoot, results);
				collectFocusable(assigned, results);
			}
			continue;
		}
		if (isFocusable(child)) results.push(child);
		if (child instanceof HTMLElement && child.shadowRoot) collectFocusable(child.shadowRoot, results);
		collectFocusable(child, results);
	}
	return results;
}
/** First document-order focusable element after `marker`, for restoring focus once the opener is gone. */
function findNextFocusableAfter(marker) {
	const candidates = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$12));
	for (const element of candidates) {
		if (!isFocusable(element)) continue;
		if (marker.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
	}
	return null;
}
/** Module-level stack of mounted scopes; only the top entry may act as trap/pull-back owner. */
const scopeStack = [];
/**
* FocusScope — Design Schema, category: primitive.
*
* When to use:
* Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it
* in their composition, and that is where it should live. Render it yourself only when building a
* new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay),
* with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal
* panel that should still move focus in and restore it on close (a slide-in filter drawer that
* keeps the page usable).
*/
const FocusScope = function FocusScope({ ref, children, trapped = true, autoFocus = "first", restoreFocus = true, returnFocusTo, active = true, onEscapeAttempt, className, ...rest }) {
	const containerRef = useRef(null);
	useImperativeHandle(ref, () => containerRef.current, []);
	const openerRef = useRef(null);
	const markerRef = useRef(null);
	const lastFocusedRef = useRef(null);
	const entryRef = useRef({ active });
	entryRef.current.active = active;
	const latest = useRef({
		trapped,
		restoreFocus,
		returnFocusTo,
		onEscapeAttempt
	});
	latest.current = {
		trapped,
		restoreFocus,
		returnFocusTo,
		onEscapeAttempt
	};
	const isTop = () => scopeStack.length > 0 && scopeStack[scopeStack.length - 1] === entryRef.current;
	const isEffectivelyActive = () => entryRef.current.active && isTop();
	useEffect(() => {
		scopeStack.push(entryRef.current);
		return () => {
			const index = scopeStack.indexOf(entryRef.current);
			if (index !== -1) scopeStack.splice(index, 1);
		};
	}, []);
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return void 0;
		const opener = document.activeElement;
		openerRef.current = opener instanceof HTMLElement ? opener : null;
		const marker = document.createComment("ds-focus-scope-restore");
		if (openerRef.current?.parentNode) openerRef.current.parentNode.insertBefore(marker, openerRef.current.nextSibling);
		markerRef.current = marker;
		if (autoFocus === "container") container.focus();
		else if (autoFocus !== "none") {
			const focusables = collectFocusable(container);
			((autoFocus === "last" ? focusables[focusables.length - 1] : focusables[0]) ?? container).focus();
		}
		return () => {
			const opener2 = openerRef.current;
			if (latest.current.restoreFocus) {
				const explicit = latest.current.returnFocusTo?.current;
				if (explicit && document.contains(explicit)) explicit.focus();
				else if (opener2 && document.contains(opener2)) opener2.focus();
				else if (markerRef.current) findNextFocusableAfter(markerRef.current)?.focus();
			}
			if (markerRef.current?.parentNode) markerRef.current.parentNode.removeChild(markerRef.current);
		};
	}, []);
	useEffect(() => {
		const handleFocusIn = (event) => {
			if (!latest.current.trapped || !isEffectivelyActive()) return;
			const container = containerRef.current;
			const target = event.target;
			if (!container || !(target instanceof Node)) return;
			if (container.contains(target)) {
				if (target instanceof HTMLElement && !target.hasAttribute("data-focus-sentinel")) lastFocusedRef.current = target;
				return;
			}
			(lastFocusedRef.current ?? collectFocusable(container)[0] ?? container).focus();
		};
		document.addEventListener("focusin", handleFocusIn);
		return () => document.removeEventListener("focusin", handleFocusIn);
	}, []);
	const handleKeyDown = (event) => {
		if (event.key !== "Tab" || !latest.current.trapped || !isEffectivelyActive()) return;
		const container = containerRef.current;
		if (!container) return;
		const focusables = collectFocusable(container);
		if (focusables.length === 0) {
			event.preventDefault();
			return;
		}
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const activeElement = document.activeElement;
		if (!event.shiftKey && activeElement === last) {
			latest.current.onEscapeAttempt?.("forward");
			event.preventDefault();
			first.focus();
		} else if (event.shiftKey && activeElement === first) {
			latest.current.onEscapeAttempt?.("backward");
			event.preventDefault();
			last.focus();
		}
	};
	const handleStartSentinelFocus = () => {
		if (!latest.current.trapped || !isEffectivelyActive()) return;
		const container = containerRef.current;
		if (!container) return;
		(collectFocusable(container)[0] ?? container).focus();
	};
	const handleEndSentinelFocus = () => {
		if (!latest.current.trapped || !isEffectivelyActive()) return;
		const container = containerRef.current;
		if (!container) return;
		const focusables = collectFocusable(container);
		(focusables[focusables.length - 1] ?? container).focus();
	};
	const classes = ["ds-focus-scope", className ?? null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: containerRef,
		tabIndex: -1,
		"data-focus-scope": "",
		"data-ds": "FocusScope",
		className: classes,
		onKeyDown: handleKeyDown,
		children: [
			trapped ? /* @__PURE__ */ jsx("span", {
				tabIndex: 0,
				"data-focus-sentinel": "",
				className: "ds-focus-scope__sentinel",
				onFocus: handleStartSentinelFocus
			}) : null,
			children,
			trapped ? /* @__PURE__ */ jsx("span", {
				tabIndex: 0,
				"data-focus-sentinel": "",
				className: "ds-focus-scope__sentinel",
				onFocus: handleEndSentinelFocus
			}) : null
		]
	});
};
//#endregion
//#region src/Dialog.tsx
const OVERRIDE_HOOK$14 = {
	scrim: "--ds-dialog-scrim",
	border: "--ds-dialog-border",
	borderWidth: "--ds-dialog-border-width",
	shadow: "--ds-dialog-shadow",
	radius: "--ds-dialog-radius",
	inset: "--ds-dialog-inset",
	partGap: "--ds-dialog-part-gap",
	headerGap: "--ds-dialog-header-gap",
	footerGap: "--ds-dialog-footer-gap",
	descriptionGap: "--ds-dialog-description-gap",
	widthSm: "--ds-dialog-width-sm",
	layer: "--ds-dialog-layer",
	enter: "--ds-dialog-enter",
	exit: "--ds-dialog-exit"
};
function overridesToStyle$24(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$14[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$24 = { closeLabel: "Close" };
const FOCUSABLE_SELECTOR$11 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
const isDev$22 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$14() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Dialog — Design Schema, category: overlay.
*
* When to use:
* Use a Dialog for a short task that must complete before the user continues and needs its own
* space: rename, create-with-a-few-fields, choose from options with consequences, confirm
* something reversible with a form attached. Keep it to one screen of content; a dialog that
* scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing
* action first.
*/
const Dialog = function Dialog({ ref, open, heading, description, children, footer, hideHeading = false, size = "md", dismissible = true, initialFocus = "first", onClose, onOpened, container, overrides, className, style, ...rest }) {
	const generatedId = useId();
	const headingId = `ds-dialog${generatedId}-heading`;
	const descriptionId = `ds-dialog${generatedId}-description`;
	const dialogRef = useRef(null);
	useImperativeHandle(ref, () => dialogRef.current, []);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const latest = useRef({
		initialFocus,
		onOpened
	});
	latest.current = {
		initialFocus,
		onOpened
	};
	if (isDev$22 && !heading) console.warn("Dialog: `heading` is required and becomes the accessible name; it must not be empty.");
	useEffect(() => {
		if (open) setPresent(true);
	}, [open]);
	useLayoutEffect(() => {
		if (!present) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		if (!dialog.open) {
			dialog.showModal?.();
			dialog.open = true;
		}
		const { initialFocus: focusTarget } = latest.current;
		if (focusTarget === "title") headingRef.current?.focus();
		else if (focusTarget === "close") closeButtonRef.current?.focus();
		else (bodyRef.current?.querySelector(FOCUSABLE_SELECTOR$11) ?? closeButtonRef.current ?? dialog).focus();
		if (prefersReducedMotion$14()) {
			setVisible(true);
			latest.current.onOpened?.();
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		const surface = surfaceRef.current;
		const handleEntered = (event) => {
			if (event.target !== surface || event.propertyName !== "opacity") return;
			latest.current.onOpened?.();
		};
		surface?.addEventListener("transitionend", handleEntered);
		return () => {
			cancelAnimationFrame(frame);
			surface?.removeEventListener("transitionend", handleEntered);
		};
	}, [present]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const finish = () => {
			setPresent(false);
			dialog?.close?.();
			if (dialog) dialog.open = false;
		};
		if (prefersReducedMotion$14()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "opacity") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [open, present]);
	useEffect(() => {
		if (!present) return void 0;
		document.documentElement.classList.add("ds-dialog-lock-scroll");
		return () => document.documentElement.classList.remove("ds-dialog-lock-scroll");
	}, [present]);
	const requestClose = (reason) => {
		if (reason !== "escape" && !dismissible) return;
		onClose?.(reason);
	};
	const handleCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handleScrimClick = (event) => {
		if (event.target !== dialogRef.current) return;
		requestClose("scrim");
	};
	const handleCloseButtonClick = () => requestClose("close-button");
	if (!present) return null;
	const classes = [
		"ds-dialog",
		`ds-dialog--${size}`,
		visible ? "ds-dialog--visible" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$24(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	const headingClasses = ["ds-dialog__heading", hideHeading ? "ds-dialog__visually-hidden" : null].filter(Boolean).join(" ");
	const node = /* @__PURE__ */ jsx("dialog", {
		...rest,
		ref: dialogRef,
		"data-ds": "Dialog",
		className: classes,
		style: mergedStyle,
		"aria-labelledby": headingId,
		"aria-describedby": description ? descriptionId : void 0,
		onCancel: handleCancel,
		onClick: handleScrimClick,
		children: /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
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
							className: "ds-dialog__heading-group",
							children: [/* @__PURE__ */ jsx(Heading, {
								level: 2,
								id: headingId,
								ref: headingRef,
								tabIndex: -1,
								className: headingClasses,
								"data-part": "heading",
								children: heading
							}), description ? /* @__PURE__ */ jsx(Text, {
								id: descriptionId,
								tone: "muted",
								size: "sm",
								className: "ds-dialog__description",
								"data-part": "description",
								children: description
							}) : null]
						}), dismissible ? /* @__PURE__ */ jsx(Button, {
							ref: closeButtonRef,
							variant: "ghost",
							size: "sm",
							iconOnly: true,
							label: COPY$24.closeLabel,
							className: "ds-dialog__close",
							"data-part": "closeButton",
							onClick: handleCloseButtonClick,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "close",
								inline: true
							})
						}) : null]
					}),
					/* @__PURE__ */ jsx(Box, {
						element: "div",
						inset: "lg",
						overrides: bodyOverrides,
						className: "ds-dialog__body",
						"data-part": "body",
						ref: bodyRef,
						children
					}),
					footer !== void 0 ? /* @__PURE__ */ jsx("div", {
						className: "ds-dialog__footer",
						"data-part": "footer",
						children: /* @__PURE__ */ jsx(Stack, {
							direction: "horizontal",
							gap: "tight",
							justify: "end",
							children: footer
						})
					}) : null
				]
			})
		})
	});
	return createPortal(node, container ?? document.body);
};
//#endregion
//#region src/AlertDialog.tsx
const OVERRIDE_HOOK$13 = {
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
	layer: "--ds-alert-dialog-layer",
	enter: "--ds-alert-dialog-enter",
	exit: "--ds-alert-dialog-exit"
};
/** `iconSize` and `footerGap` also drive the composed Icon's and Stack's own sizing hooks, since each owns its own. */
function overridesToStyle$23(overrides) {
	const style = {};
	let iconSizeRef;
	let footerGapRef;
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		style[OVERRIDE_HOOK$13[binding]] = cssVar(ref);
		if (binding === "iconSize") iconSizeRef = ref;
		if (binding === "footerGap") footerGapRef = ref;
	}
	return {
		rootStyle: style,
		iconSizeRef,
		footerGapRef
	};
}
const COPY$23 = { cancelLabel: "Cancel" };
/** Confirm button variant by tone: danger stays danger, warning and info read as the primary action. */
const CONFIRM_VARIANT = {
	danger: "danger",
	warning: "primary",
	info: "primary"
};
const isDev$21 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$13() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* AlertDialog — Design Schema, category: overlay.
*
* When to use:
* Use an AlertDialog before an action that destroys data, spends money, sends something that
* cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not
* available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable,
* `info` for a decision with no downside that still needs a choice (leave the page with unsaved
* changes? — that is `warning`).
*
* Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is
* faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to
* collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you
* sure" habit — if a team finds itself adding many, the actions need undo.
*/
const AlertDialog = function AlertDialog({ ref, open, heading, description, tone = "danger", confirmLabel, cancelLabel, confirmDisabled = false, onConfirm, onCancel, container, overrides, className, style, ...rest }) {
	const generatedId = useId();
	const headingId = `ds-alert-dialog${generatedId}-heading`;
	const descriptionId = `ds-alert-dialog${generatedId}-description`;
	const dialogRef = useRef(null);
	useImperativeHandle(ref, () => dialogRef.current, []);
	const surfaceRef = useRef(null);
	const cancelButtonRef = useRef(null);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	if (isDev$21 && !heading) console.warn("AlertDialog: `heading` is required and becomes the accessible name; it must not be empty.");
	if (isDev$21 && !description) console.warn("AlertDialog: `description` is required — a decision without stated consequences is not a decision.");
	useEffect(() => {
		if (open) setPresent(true);
	}, [open]);
	useLayoutEffect(() => {
		if (!present) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		if (!dialog.open) {
			dialog.showModal?.();
			dialog.open = true;
		}
		cancelButtonRef.current?.focus();
		if (prefersReducedMotion$13()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [present]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const finish = () => {
			setPresent(false);
			dialog?.close?.();
			if (dialog) dialog.open = false;
		};
		if (prefersReducedMotion$13()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "opacity") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [open, present]);
	useEffect(() => {
		if (!present) return void 0;
		document.documentElement.classList.add("ds-alert-dialog-lock-scroll");
		return () => document.documentElement.classList.remove("ds-alert-dialog-lock-scroll");
	}, [present]);
	const handleNativeCancel = (event) => {
		event.preventDefault();
		onCancel?.("escape");
	};
	const handleCancelClick = () => onCancel?.("cancel");
	const handleConfirmClick = () => onConfirm?.();
	if (!present) return null;
	const classes = [
		"ds-alert-dialog",
		`ds-alert-dialog--tone-${tone}`,
		visible ? "ds-alert-dialog--visible" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, iconSizeRef, footerGapRef } = overrides ? overridesToStyle$23(overrides) : {
		rootStyle: void 0,
		iconSizeRef: void 0,
		footerGapRef: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const node = /* @__PURE__ */ jsx("dialog", {
		...rest,
		ref: dialogRef,
		"data-ds": "AlertDialog",
		className: classes,
		style: mergedStyle,
		role: "alertdialog",
		"aria-modal": "true",
		"aria-labelledby": headingId,
		"aria-describedby": descriptionId,
		onCancel: handleNativeCancel,
		children: /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			"data-part": "focusScope",
			children: /* @__PURE__ */ jsxs("div", {
				className: "ds-alert-dialog__surface",
				ref: surfaceRef,
				"data-part": "surface",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "ds-alert-dialog__content",
					children: [/* @__PURE__ */ jsx("span", {
						className: "ds-alert-dialog__icon",
						"data-part": "icon",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx(Icon, {
							name: tone,
							size: "lg",
							overrides: iconSizeRef ? { size: iconSizeRef } : void 0
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "ds-alert-dialog__text",
						children: [/* @__PURE__ */ jsx(Heading, {
							level: 2,
							id: headingId,
							className: "ds-alert-dialog__heading",
							"data-part": "heading",
							children: heading
						}), /* @__PURE__ */ jsx(Text, {
							id: descriptionId,
							tone: "muted",
							size: "sm",
							className: "ds-alert-dialog__description",
							"data-part": "description",
							children: description
						})]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "ds-alert-dialog__footer",
					"data-part": "footer",
					children: /* @__PURE__ */ jsxs(Stack, {
						direction: "horizontal",
						gap: "tight",
						justify: "end",
						overrides: footerGapRef ? { gap: footerGapRef } : void 0,
						children: [/* @__PURE__ */ jsx(Button, {
							ref: cancelButtonRef,
							variant: "secondary",
							size: "sm",
							label: cancelLabel ?? COPY$23.cancelLabel,
							onClick: handleCancelClick
						}), /* @__PURE__ */ jsx(Button, {
							variant: CONFIRM_VARIANT[tone],
							size: "sm",
							label: confirmLabel,
							disabled: confirmDisabled,
							onClick: handleConfirmClick
						})]
					})
				})]
			})
		})
	});
	return createPortal(node, container ?? document.body);
};
//#endregion
//#region src/Menu.tsx
const OVERRIDE_HOOK$12 = {
	border: "--ds-menu-border",
	borderWidth: "--ds-menu-border-width",
	shadow: "--ds-menu-shadow",
	radius: "--ds-menu-radius",
	popupPadding: "--ds-menu-popup-padding",
	popupOffset: "--ds-menu-popup-offset",
	typeaheadReset: "--ds-menu-typeahead-reset",
	maxHeight: "--ds-menu-max-height",
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
	enter: "--ds-menu-enter"
};
function overridesToStyle$22(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$12[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$20 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$12() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/** Reads a resolved CSS `<time>` custom property (e.g. `"800ms"`, `"0.8s"`) as a millisecond number. */
function cssTimeToMs(value) {
	const trimmed = value.trim();
	if (trimmed.endsWith("ms")) return parseFloat(trimmed);
	if (trimmed.endsWith("s")) return parseFloat(trimmed) * 1e3;
	return parseFloat(trimmed) || 0;
}
const FALLBACK_TYPEAHEAD_RESET_MS = 800;
function flattenActions(items) {
	const result = [];
	for (const item of items) {
		if ("separator" in item) continue;
		if ("group" in item) result.push(...flattenActions(item.items));
		else result.push(item);
	}
	return result;
}
const FOCUSABLE_SELECTOR$10 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/**
* Moves focus to the next (or previous) document-order tabbable element relative to `anchor`,
* ignoring anything inside `exclude` (the menu's own popup, which is about to close).
*/
function focusAdjacent$4(anchor, exclude, direction) {
	const all = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$10)).filter((element) => !exclude || !exclude.contains(element));
	const index = all.indexOf(anchor);
	if (index === -1) return;
	all[index + direction]?.focus();
}
/** Positions the popup from the trigger's rect for `placement`, flipping either axis on overflow. */
function computePosition$5(triggerRect, popupRect, placement) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const [vert, horiz] = placement.split("-");
	let vertical = vert;
	if (vert === "bottom" && triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0) vertical = "top";
	else if (vert === "top" && triggerRect.top - popupRect.height < 0 && triggerRect.bottom + popupRect.height <= viewportHeight) vertical = "bottom";
	let horizontal = horiz;
	if (horiz === "start" && triggerRect.left + popupRect.width > viewportWidth && triggerRect.right - popupRect.width >= 0) horizontal = "end";
	else if (horiz === "end" && triggerRect.right - popupRect.width < 0 && triggerRect.left + popupRect.width <= viewportWidth) horizontal = "start";
	const style = { "--ds-menu-trigger-width": `${triggerRect.width}px` };
	if (vertical === "bottom") style.top = triggerRect.bottom;
	else style.bottom = viewportHeight - triggerRect.top;
	if (horizontal === "start") style.left = triggerRect.left;
	else style.right = viewportWidth - triggerRect.right;
	return {
		style,
		vertical
	};
}
/**
* Menu — Design Schema, category: overlay.
*
* When to use:
* Use a Menu for secondary actions on an item or a view that do not deserve their own buttons:
* overflow ("More actions"), sort or view options, account menus. Group related items with a
* `group` label when there are more than about six; separate a danger action with a `separator`.
* On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is
* "pick an action" and let the platform decide the surface.
*/
const Menu = function Menu({ ref, label, items, triggerVariant = "ghost", triggerIcon = "chevron-down", iconOnly = false, placement = "bottom-start", open: openProp, anchor, onAction, onOpenChange, container, overrides, className, style, ...rest }) {
	const generatedId = useId();
	const triggerId = `ds-menu${generatedId}-trigger`;
	const listId = `ds-menu${generatedId}-list`;
	const triggerRef = useRef(null);
	const popupRef = useRef(null);
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const pendingFocusRef = useRef("first");
	const openerRef = useRef(null);
	const typeaheadRef = useRef({
		buffer: "",
		timer: null
	});
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
	const [popupStyle, setPopupStyle] = useState();
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	if (isDev$20 && !label) console.warn("Menu: `label` is required and becomes the trigger label and the menu’s accessible name.");
	if (isDev$20 && anchor && !isControlled) console.warn("Menu: `anchor` positions the popup instead of rendering a trigger, so `open` must be controlled.");
	const changeOpen = (value, reason) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.({
			open: value,
			reason
		});
	};
	const openMenu = (focusTarget, reason) => {
		if (open) return;
		pendingFocusRef.current = focusTarget;
		changeOpen(true, reason);
	};
	const closeMenu = (reason, focusOpener = false) => {
		if (!open) return;
		if (focusOpener) openerRef.current?.focus();
		changeOpen(false, reason);
	};
	const setItemRef = (id) => (element) => {
		if (element) itemRefs.current.set(id, element);
		else itemRefs.current.delete(id);
	};
	const focusAction = (id) => {
		setActiveId(id);
		itemRefs.current.get(id)?.focus();
	};
	const activateAction = (action) => {
		if (action.disabled) return;
		closeMenu("action", true);
		onAction?.(action.id);
	};
	useLayoutEffect(() => {
		if (!open) {
			setEntered(false);
			openerRef.current = null;
			return;
		}
		const anchorElement = anchor?.current ?? triggerRef.current;
		const popup = popupRef.current;
		if (!anchorElement || !popup) return void 0;
		openerRef.current = triggerRef.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
		const reposition = () => {
			const result = computePosition$5(anchorElement.getBoundingClientRect(), popup.getBoundingClientRect(), latest.current.placement);
			setPopupStyle(result.style);
			setVertical(result.vertical);
		};
		reposition();
		const actions = flattenActions(latest.current.items).filter((action) => !action.disabled);
		const target = pendingFocusRef.current === "last" ? actions[actions.length - 1] : actions[0];
		pendingFocusRef.current = "first";
		if (target) {
			setActiveId(target.id);
			itemRefs.current.get(target.id)?.focus();
		} else popup.focus();
		if (prefersReducedMotion$12()) setEntered(true);
		else requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open, anchor]);
	useEffect(() => {
		if (!open) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			const anchorElement = anchor?.current ?? triggerRef.current;
			if (popupRef.current?.contains(target) || anchorElement?.contains(target)) return;
			closeMenu("outside");
		};
		const handleWindowBlur = () => closeMenu("outside");
		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("blur", handleWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [open]);
	const handleTriggerClick = () => {
		if (open) closeMenu("trigger");
		else openMenu("first", "trigger");
	};
	const handleTriggerKeyDown = (event) => {
		if (open) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			openMenu("first", "trigger");
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			openMenu("last", "trigger");
		}
	};
	const handleTypeahead = (char, enabled, currentIndex) => {
		const state = typeaheadRef.current;
		if (state.timer) clearTimeout(state.timer);
		state.buffer += char.toLowerCase();
		const resetMs = popupRef.current ? cssTimeToMs(getComputedStyle(popupRef.current).getPropertyValue("--ds-menu-typeahead-reset")) || FALLBACK_TYPEAHEAD_RESET_MS : FALLBACK_TYPEAHEAD_RESET_MS;
		state.timer = setTimeout(() => {
			state.buffer = "";
		}, resetMs);
		const startIndex = currentIndex === -1 ? 0 : currentIndex;
		for (let offset = 1; offset <= enabled.length; offset++) {
			const candidate = enabled[(startIndex + offset) % enabled.length];
			if (candidate.label.toLowerCase().startsWith(state.buffer)) {
				focusAction(candidate.id);
				return;
			}
		}
		if (state.buffer.length > 1) {
			const single = state.buffer.slice(-1);
			for (let offset = 0; offset < enabled.length; offset++) {
				const candidate = enabled[(startIndex + offset) % enabled.length];
				if (candidate.label.toLowerCase().startsWith(single)) {
					state.buffer = single;
					focusAction(candidate.id);
					return;
				}
			}
		}
	};
	const handleListKeyDown = (event) => {
		const enabled = flattenActions(items).filter((action) => !action.disabled);
		if (enabled.length === 0) return;
		const currentIndex = enabled.findIndex((action) => action.id === activeId);
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				focusAction(enabled[(currentIndex + 1) % enabled.length].id);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusAction(enabled[(currentIndex - 1 + enabled.length) % enabled.length].id);
				break;
			case "Home":
				event.preventDefault();
				focusAction(enabled[0].id);
				break;
			case "End":
				event.preventDefault();
				focusAction(enabled[enabled.length - 1].id);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				if (currentIndex !== -1) activateAction(enabled[currentIndex]);
				break;
			case "Escape":
				event.preventDefault();
				closeMenu("escape", true);
				break;
			case "Tab": {
				event.preventDefault();
				const anchorElement = triggerRef.current ?? openerRef.current;
				if (anchorElement) focusAdjacent$4(anchorElement, popupRef.current, event.shiftKey ? -1 : 1);
				closeMenu("outside");
				break;
			}
			default: if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) handleTypeahead(event.key, enabled, currentIndex);
		}
	};
	const handleItemMouseEnter = (action) => {
		if (action.disabled) return;
		focusAction(action.id);
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
			id: `${listId}-item-${action.id}`,
			tabIndex: action.id === activeId ? 0 : -1,
			"aria-disabled": action.disabled ? "true" : void 0,
			"aria-keyshortcuts": action.shortcut || void 0,
			className: classes,
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
					children: action.shortcut
				}) : null
			]
		}, action.id);
	};
	const renderNode = (node, path) => {
		if ("separator" in node) return /* @__PURE__ */ jsx("div", {
			role: "separator",
			className: "ds-menu__separator"
		}, `${path}-separator`);
		if ("group" in node) {
			const groupLabelId = `${listId}-group-${path}`;
			return /* @__PURE__ */ jsxs("div", {
				role: "group",
				"aria-labelledby": groupLabelId,
				className: "ds-menu__group",
				children: [/* @__PURE__ */ jsx("div", {
					id: groupLabelId,
					"data-part": "groupLabel",
					className: "ds-menu__group-label",
					children: node.group
				}), /* @__PURE__ */ jsx("div", {
					className: "ds-menu__group-items",
					children: node.items.map((child, index) => renderNode(child, `${path}-${index}`))
				})]
			}, `${path}-group`);
		}
		return renderAction(node);
	};
	const classes = ["ds-menu", className ?? null].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$22(overrides) : void 0;
	const mergedPopupStyle = {
		...popupStyle,
		...overrideStyle
	};
	const popupClasses = ["ds-menu__popup", entered ? "ds-menu__popup--entered" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Menu",
		className: classes,
		style,
		children: [anchor ? null : /* @__PURE__ */ jsx(Button, {
			ref: triggerRef,
			id: triggerId,
			type: "button",
			variant: triggerVariant,
			iconOnly,
			label,
			"aria-haspopup": "menu",
			"aria-expanded": open ? "true" : "false",
			"aria-controls": open ? listId : void 0,
			trailingIcon: triggerIcon !== "none" ? /* @__PURE__ */ jsx(Icon, {
				name: triggerIcon,
				inline: true
			}) : void 0,
			onClick: handleTriggerClick,
			onKeyDown: handleTriggerKeyDown
		}), open ? createPortal(/* @__PURE__ */ jsx("div", {
			ref: popupRef,
			role: "menu",
			id: listId,
			tabIndex: -1,
			"aria-labelledby": anchor ? void 0 : triggerId,
			"aria-label": anchor ? label : void 0,
			"data-part": "popup",
			"data-vertical": vertical,
			className: popupClasses,
			style: mergedPopupStyle,
			onKeyDown: handleListKeyDown,
			children: items.map((item, index) => renderNode(item, String(index)))
		}), container ?? document.body) : null]
	});
};
//#endregion
//#region src/Tooltip.tsx
const OVERRIDE_HOOK$11 = {
	radius: "--ds-tooltip-radius",
	paddingBlock: "--ds-tooltip-padding-block",
	paddingInline: "--ds-tooltip-padding-inline",
	offset: "--ds-tooltip-offset",
	maxWidth: "--ds-tooltip-max-width",
	fontFamily: "--ds-tooltip-font-family",
	fontSize: "--ds-tooltip-font-size",
	lineHeight: "--ds-tooltip-line-height",
	shadow: "--ds-tooltip-shadow",
	layer: "--ds-tooltip-layer",
	enter: "--ds-tooltip-enter",
	exit: "--ds-tooltip-exit"
};
function overridesToStyle$21(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$11[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$19 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$11() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/** No hover surface on touch; the trigger still carries the accessible description/name. */
function hasNoHover() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(hover: none), (pointer: coarse)").matches : false;
}
/** delay.default: motion.duration.base × 3 — the doc calls out ~600ms with `motion.duration.base` at 200ms. */
const DEFAULT_DELAY_MS = 600;
/**
* How long a tooltip stays "warm" after it closes, so the next one in a toolbar opens instantly.
* Not a token: the doc names the effect but not a duration, so this reuses the show delay's length.
*/
const WARM_WINDOW_MS = DEFAULT_DELAY_MS;
/** Grace period before actually hiding, so the pointer can cross the `offset` gap onto the popup itself (WCAG 1.4.13 hoverable). Not specified by the doc. */
const CLOSE_GRACE_MS = 100;
let warmUntil = 0;
function markWarm() {
	warmUntil = Date.now() + WARM_WINDOW_MS;
}
function isWarm() {
	return Date.now() < warmUntil;
}
function mergeIds(existing, id) {
	return existing ? `${existing} ${id}` : id;
}
/** Positions the popup from the trigger's rect for `placement`, flipping when it would overflow the viewport. */
function computePosition$4(triggerRect, popupRect, placement, rtl) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	let resolved = placement;
	if (placement === "top" && triggerRect.top - popupRect.height < 0 && triggerRect.bottom + popupRect.height <= viewportHeight) resolved = "bottom";
	else if (placement === "bottom" && triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0) resolved = "top";
	else if (placement === "start" && (rtl ? triggerRect.right + popupRect.width > viewportWidth : triggerRect.left - popupRect.width < 0) && (rtl ? triggerRect.left - popupRect.width >= 0 : triggerRect.right + popupRect.width <= viewportWidth)) resolved = "end";
	else if (placement === "end" && (rtl ? triggerRect.left - popupRect.width < 0 : triggerRect.right + popupRect.width > viewportWidth) && (rtl ? triggerRect.right + popupRect.width <= viewportWidth : triggerRect.left - popupRect.width >= 0)) resolved = "start";
	const style = {};
	if (resolved === "top" || resolved === "bottom") {
		const centerX = triggerRect.left + triggerRect.width / 2;
		style.left = Math.min(Math.max(centerX - popupRect.width / 2, 0), Math.max(viewportWidth - popupRect.width, 0));
		if (resolved === "top") style.bottom = viewportHeight - triggerRect.top;
		else style.top = triggerRect.bottom;
	} else {
		const centerY = triggerRect.top + triggerRect.height / 2;
		style.top = Math.min(Math.max(centerY - popupRect.height / 2, 0), Math.max(viewportHeight - popupRect.height, 0));
		const startIsLeft = !rtl;
		if (resolved === "start" ? startIsLeft : !startIsLeft) style.right = viewportWidth - triggerRect.left;
		else style.left = triggerRect.right;
	}
	return {
		style,
		resolved
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
* Do not put essential instructions, error messages or any content the user must read in a
* tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or
* buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned).
* Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open
* it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint
* and is not visible.
*/
const Tooltip = function Tooltip({ ref, content, children, placement = "top", describes = true, delay = "default", overrides }) {
	const tooltipId = `ds-tooltip${useId()}`;
	const triggerRef = useRef(null);
	const popupRef = useRef(null);
	useImperativeHandle(ref, () => popupRef.current, []);
	const [present, setPresent] = useState(false);
	const [visible, setVisible] = useState(false);
	const [popupStyle, setPopupStyle] = useState();
	const [resolvedPlacement, setResolvedPlacement] = useState(placement);
	const wantOpenRef = useRef(false);
	const hoveringTriggerRef = useRef(false);
	const hoveringPopupRef = useRef(false);
	const focusedRef = useRef(false);
	const dismissedRef = useRef(false);
	const showTimerRef = useRef(null);
	const hideTimerRef = useRef(null);
	const latest = useRef({
		delay,
		placement
	});
	latest.current = {
		delay,
		placement
	};
	if (isDev$19 && !content) console.warn("Tooltip: `content` is required and becomes the trigger’s accessible description or name; it must not be empty.");
	if (isDev$19 && Children.count(children) !== 1) console.warn("Tooltip: `children` must be exactly one focusable element.");
	const clearShowTimer = () => {
		if (showTimerRef.current) {
			clearTimeout(showTimerRef.current);
			showTimerRef.current = null;
		}
	};
	const clearHideTimer = () => {
		if (hideTimerRef.current) {
			clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
	};
	const open = () => {
		clearShowTimer();
		clearHideTimer();
		if (wantOpenRef.current) return;
		wantOpenRef.current = true;
		markWarm();
		setPresent(true);
	};
	const close = () => {
		clearShowTimer();
		clearHideTimer();
		if (!wantOpenRef.current) return;
		wantOpenRef.current = false;
		markWarm();
		setVisible(false);
	};
	const requestOpen = (immediate) => {
		if (wantOpenRef.current) return;
		clearHideTimer();
		if (immediate || latest.current.delay === "none" || isWarm()) open();
		else if (!showTimerRef.current) showTimerRef.current = setTimeout(() => {
			showTimerRef.current = null;
			open();
		}, DEFAULT_DELAY_MS);
	};
	const requestClose = () => {
		clearShowTimer();
		if (!wantOpenRef.current) return;
		if (hideTimerRef.current) return;
		hideTimerRef.current = setTimeout(() => {
			hideTimerRef.current = null;
			if (!hoveringTriggerRef.current && !hoveringPopupRef.current && !focusedRef.current) close();
		}, CLOSE_GRACE_MS);
	};
	useLayoutEffect(() => {
		if (!present) return void 0;
		const trigger = triggerRef.current;
		const popup = popupRef.current;
		if (!trigger || !popup) return void 0;
		const reposition = () => {
			const triggerRect = trigger.getBoundingClientRect();
			const popupRect = popup.getBoundingClientRect();
			const rtl = getComputedStyle(trigger).direction === "rtl";
			const result = computePosition$4(triggerRect, popupRect, latest.current.placement, rtl);
			setPopupStyle(result.style);
			setResolvedPlacement(result.resolved);
		};
		reposition();
		if (prefersReducedMotion$11()) setVisible(true);
		else requestAnimationFrame(() => setVisible(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [present]);
	useEffect(() => {
		if (wantOpenRef.current || !present) return void 0;
		const popup = popupRef.current;
		if (!popup || prefersReducedMotion$11()) {
			setPresent(false);
			return;
		}
		const handleExited = (event) => {
			if (event.target !== popup || event.propertyName !== "opacity") return;
			setPresent(false);
		};
		popup.addEventListener("transitionend", handleExited);
		return () => popup.removeEventListener("transitionend", handleExited);
	}, [visible, present]);
	useEffect(() => {
		if (!present) return void 0;
		const handleKeyDown = (event) => {
			if (event.key !== "Escape") return;
			dismissedRef.current = true;
			close();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [present]);
	useEffect(() => () => clearShowTimer(), []);
	useEffect(() => () => clearHideTimer(), []);
	const handleTriggerPointerEnter = () => {
		if (hasNoHover()) return;
		hoveringTriggerRef.current = true;
		if (!dismissedRef.current) requestOpen(false);
	};
	const handleTriggerPointerLeave = () => {
		hoveringTriggerRef.current = false;
		dismissedRef.current = false;
		requestClose();
	};
	const handleTriggerFocus = () => {
		focusedRef.current = true;
		if (!dismissedRef.current) requestOpen(true);
	};
	const handleTriggerBlur = (event) => {
		if (event.currentTarget.contains(event.relatedTarget)) return;
		focusedRef.current = false;
		dismissedRef.current = false;
		requestClose();
	};
	const handlePopupPointerEnter = () => {
		hoveringPopupRef.current = true;
		clearHideTimer();
	};
	const handlePopupPointerLeave = () => {
		hoveringPopupRef.current = false;
		requestClose();
	};
	const child = Children.only(children);
	const clonedProps = {
		ref: triggerRef,
		"aria-describedby": describes ? mergeIds(child.props["aria-describedby"], tooltipId) : child.props["aria-describedby"],
		"aria-labelledby": !describes ? mergeIds(child.props["aria-labelledby"], tooltipId) : child.props["aria-labelledby"],
		onPointerEnter: (event) => {
			child.props.onPointerEnter?.(event);
			handleTriggerPointerEnter();
		},
		onPointerLeave: (event) => {
			child.props.onPointerLeave?.(event);
			handleTriggerPointerLeave();
		},
		onFocus: (event) => {
			child.props.onFocus?.(event);
			handleTriggerFocus();
		},
		onBlur: (event) => {
			child.props.onBlur?.(event);
			handleTriggerBlur(event);
		}
	};
	const cloned = cloneElement(child, clonedProps);
	const overrideStyle = overrides ? overridesToStyle$21(overrides) : void 0;
	const mergedStyle = {
		...popupStyle,
		...overrideStyle
	};
	const popupClasses = ["ds-tooltip", visible ? "ds-tooltip--entered" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		cloned,
		/* @__PURE__ */ jsx("span", {
			id: tooltipId,
			role: "tooltip",
			className: "ds-tooltip__visually-hidden",
			"data-part": "text",
			children: content
		}),
		present ? createPortal(/* @__PURE__ */ jsx("div", {
			ref: popupRef,
			"aria-hidden": "true",
			"data-ds": "Tooltip",
			"data-placement": resolvedPlacement,
			className: popupClasses,
			style: mergedStyle,
			onPointerEnter: handlePopupPointerEnter,
			onPointerLeave: handlePopupPointerLeave,
			children: /* @__PURE__ */ jsx("span", {
				className: "ds-tooltip__text",
				"data-part": "text",
				children: content
			})
		}), document.body) : null
	] });
};
//#endregion
//#region src/Divider.tsx
const isDev$18 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const ROOT_OVERRIDE_HOOK$15 = {
	color: "--ds-divider-color",
	thickness: "--ds-divider-thickness",
	spacing: "--ds-divider-spacing",
	labelGap: "--ds-divider-label-gap"
};
function overridesToStyle$20(overrides) {
	const rootStyle = {};
	const textOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$15[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		else if (binding === "labelSize") textOverrides.fontSize = ref;
		else if (binding === "fontFamily") textOverrides.fontFamily = ref;
	}
	return {
		rootStyle,
		textOverrides
	};
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
const Divider = function Divider({ ref, orientation = "horizontal", label, semantic = false, spacing = "none", overrides, className, style, ...rest }) {
	const showLabel = Boolean(label) && orientation === "horizontal";
	const isSemantic = semantic || showLabel;
	if (isDev$18 && label && orientation === "vertical") console.warn("Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.");
	const classes = [
		"ds-divider",
		`ds-divider--${orientation}`,
		`ds-divider--spacing-${spacing}`,
		showLabel ? "ds-divider--labelled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, textOverrides } = overrides ? overridesToStyle$20(overrides) : {
		rootStyle: void 0,
		textOverrides: {}
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	if (showLabel) return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Divider",
		className: classes,
		style: mergedStyle,
		role: "separator",
		"aria-orientation": orientation,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "ds-divider__line",
				"data-part": "line",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "ds-divider__label",
				"data-part": "label",
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					size: "sm",
					tone: "muted",
					overrides: Object.keys(textOverrides).length ? textOverrides : void 0,
					children: label
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "ds-divider__line",
				"data-part": "line",
				"aria-hidden": "true"
			})
		]
	});
	return /* @__PURE__ */ jsx("hr", {
		...rest,
		ref,
		"data-ds": "Divider",
		className: classes,
		style: mergedStyle,
		"aria-hidden": isSemantic ? void 0 : "true",
		role: isSemantic ? "separator" : void 0,
		"aria-orientation": isSemantic ? orientation : void 0
	});
};
//#endregion
//#region src/Fieldset.tsx
/** copy.* — used verbatim. */
const COPY$22 = { requiredIndicator: " (required)" };
const OVERRIDE_HOOK$10 = {
	legendSize: "--ds-fieldset-legend-size",
	legendWeight: "--ds-fieldset-legend-weight",
	helperSize: "--ds-fieldset-helper-size",
	partGap: "--ds-fieldset-part-gap",
	fieldsGap: "--ds-fieldset-fields-gap",
	disabledOpacity: "--ds-fieldset-disabled-opacity",
	fontFamily: "--ds-fieldset-font-family",
	lineHeight: "--ds-fieldset-line-height"
};
function overridesToStyle$19(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$10[binding]] = cssVar(ref);
	}
	return style;
}
/**
* Fieldset — Design Schema, category: input.
*
* When to use:
* Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a
* card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when
* the group needs a rule ("We only ship within the EU") and put cross-field errors on the group
* rather than on one field.
*/
const Fieldset = function Fieldset({ ref, legend, children, description, error, disabled = false, gap = "normal", overrides, id: idProp, className, style, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-fieldset${generatedId}`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const fieldElements = Children.toArray(children).filter(isValidElement);
	const allRequired = fieldElements.length > 0 && fieldElements.every((field) => field.props.required === true);
	const renderedChildren = disabled ? Children.map(children, (child) => isValidElement(child) ? cloneElement(child, { disabled: true }) : child) : children;
	const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ");
	const classes = [
		"ds-fieldset",
		`ds-fieldset--gap-${gap}`,
		disabled ? "ds-fieldset--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$19(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("fieldset", {
		...rest,
		ref,
		id,
		"data-ds": "Fieldset",
		className: classes,
		style: mergedStyle,
		"aria-describedby": describedBy || void 0,
		"aria-disabled": disabled ? "true" : void 0,
		"aria-invalid": error ? "true" : void 0,
		children: [
			/* @__PURE__ */ jsxs("legend", {
				className: "ds-fieldset__legend",
				children: [legend, allRequired ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					size: "sm",
					tone: "muted",
					weight: "regular",
					className: "ds-fieldset__required",
					children: COPY$22.requiredIndicator
				}) : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-fieldset__description",
				children: description
			}) : null,
			/* @__PURE__ */ jsx(Stack, {
				gap,
				"data-part": "fields",
				children: renderedChildren
			}),
			error ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-fieldset__error",
				children: error
			}) : null
		]
	});
};
//#endregion
//#region src/Toast.tsx
const OVERRIDE_HOOK$9 = {
	radius: "--ds-toast-radius",
	shadow: "--ds-toast-shadow",
	paddingBlock: "--ds-toast-padding-block",
	paddingInline: "--ds-toast-padding-inline",
	gap: "--ds-toast-gap",
	maxWidth: "--ds-toast-max-width",
	fontFamily: "--ds-toast-font-family",
	fontSize: "--ds-toast-font-size",
	lineHeight: "--ds-toast-line-height",
	enter: "--ds-toast-enter",
	exit: "--ds-toast-exit"
};
function overridesToStyle$18(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$9[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$21 = {
	dismissLabel: "Dismiss",
	regionLabel: "Notifications"
};
const isDev$17 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$10() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* `short`/`long` in ms. Computed from the doc's stated ~5s/~10s (motion.duration.loop × 6 / × 12);
* hardcoded because a component has no way to read the active theme's resolved token value at
* runtime without measuring the DOM (same reasoning as Tooltip's `DEFAULT_DELAY_MS`), so themes
* with a different `motion.duration.loop` still get exactly these fallback times.
*/
const SHORT_DURATION_MS = 5e3;
const LONG_DURATION_MS = 1e4;
const FOCUSABLE_SELECTOR$9 = "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";
/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside(root) {
	const candidates = Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE_SELECTOR$9)).filter((el) => !root.contains(el));
	const isAfter = (el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
	const next = candidates.find(isAfter);
	const previous = next === void 0 ? candidates.filter((el) => !isAfter(el)).pop() : void 0;
	(next ?? previous)?.focus();
}
/**
* Toast — Design Schema, category: feedback.
*
* When to use:
* Use a Toast to confirm a completed action that the user did not have to watch (sent, saved,
* deleted, copied), to offer Undo for a reversible action, or to report a background result
* ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever
* there is an action, and for `danger`, so nobody misses the one they needed.
*/
const Toast = function Toast({ ref, message, tone = "neutral", actionLabel, duration = "short", dismissible = true, toastId, onAction, onDismiss, overrides, className, style, ...rest }) {
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const [visible, setVisible] = useState(false);
	const dismissedRef = useRef(false);
	const pendingReasonRef = useRef(null);
	const hoveringRef = useRef(false);
	const focusedRef = useRef(false);
	const timerRef = useRef(null);
	const onDismissLatest = useRef(onDismiss);
	onDismissLatest.current = onDismiss;
	const forcedPersistent = Boolean(actionLabel) || tone === "danger";
	const effectiveDuration = forcedPersistent ? "persistent" : duration;
	const showDismiss = dismissible || effectiveDuration === "persistent";
	if (isDev$17 && !message) console.warn("Toast: `message` is required and is the toast’s content; it must not be empty.");
	if (isDev$17 && duration !== "persistent" && forcedPersistent) console.warn("Toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.");
	const dismiss = useCallback((reason) => {
		if (dismissedRef.current) return;
		dismissedRef.current = true;
		pendingReasonRef.current = reason;
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setVisible(false);
	}, []);
	useEffect(() => {
		if (prefersReducedMotion$10()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, []);
	useEffect(() => {
		if (visible || !dismissedRef.current) return void 0;
		const reason = pendingReasonRef.current;
		if (!reason) return void 0;
		if (prefersReducedMotion$10()) {
			onDismissLatest.current?.(reason);
			return;
		}
		const node = rootRef.current;
		if (!node) return void 0;
		const handleTransitionEnd = (event) => {
			if (event.target !== node || event.propertyName !== "opacity") return;
			onDismissLatest.current?.(reason);
		};
		node.addEventListener("transitionend", handleTransitionEnd);
		return () => node.removeEventListener("transitionend", handleTransitionEnd);
	}, [visible]);
	useEffect(() => {
		if (effectiveDuration === "persistent") return void 0;
		let remaining = effectiveDuration === "long" ? LONG_DURATION_MS : SHORT_DURATION_MS;
		let startedAt = Date.now();
		const start = () => {
			startedAt = Date.now();
			timerRef.current = setTimeout(() => dismiss("timeout"), remaining);
		};
		const pause = () => {
			if (!timerRef.current) return;
			clearTimeout(timerRef.current);
			timerRef.current = null;
			remaining -= Date.now() - startedAt;
		};
		const resume = () => {
			if (timerRef.current || dismissedRef.current) return;
			if (hoveringRef.current || focusedRef.current || document.hidden) return;
			start();
		};
		start();
		const node = rootRef.current;
		const handlePointerEnter = () => {
			hoveringRef.current = true;
			pause();
		};
		const handlePointerLeave = () => {
			hoveringRef.current = false;
			resume();
		};
		const handleFocusIn = () => {
			focusedRef.current = true;
			pause();
		};
		const handleFocusOut = (event) => {
			if (node?.contains(event.relatedTarget)) return;
			focusedRef.current = false;
			resume();
		};
		const handleVisibilityChange = () => {
			if (document.hidden) pause();
			else resume();
		};
		node?.addEventListener("pointerenter", handlePointerEnter);
		node?.addEventListener("pointerleave", handlePointerLeave);
		node?.addEventListener("focusin", handleFocusIn);
		node?.addEventListener("focusout", handleFocusOut);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			node?.removeEventListener("pointerenter", handlePointerEnter);
			node?.removeEventListener("pointerleave", handlePointerLeave);
			node?.removeEventListener("focusin", handleFocusIn);
			node?.removeEventListener("focusout", handleFocusOut);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [effectiveDuration, dismiss]);
	useEffect(() => {
		const node = rootRef.current;
		if (!node) return void 0;
		const handleKeyDown = (event) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			focusOutside(node);
			dismiss("dismiss-button");
		};
		node.addEventListener("keydown", handleKeyDown);
		return () => node.removeEventListener("keydown", handleKeyDown);
	}, [dismiss]);
	const handleActionClick = () => {
		onAction?.();
		dismiss("action");
	};
	const handleDismissClick = () => dismiss("dismiss-button");
	const classes = [
		"ds-toast",
		visible ? "ds-toast--entered" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$18(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		id: toastId,
		"data-ds": "Toast",
		"data-part": "toast",
		"data-tone": tone,
		className: classes,
		style: mergedStyle,
		role: tone === "danger" ? "alert" : "status",
		children: [
			tone !== "neutral" ? /* @__PURE__ */ jsx("span", {
				className: "ds-toast__icon",
				"data-part": "icon",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(Icon, {
					name: tone,
					overrides: { color: `color.inverse.status.${tone}` }
				})
			}) : null,
			/* @__PURE__ */ jsx(Text, {
				element: "span",
				"data-part": "message",
				className: "ds-toast__message",
				overrides: {
					color: "color.inverse.foreground",
					...overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : null,
					...overrides?.fontSize ? { fontSize: overrides.fontSize } : null,
					...overrides?.lineHeight ? { lineHeight: overrides.lineHeight } : null
				},
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
					onClick: handleDismissClick
				})
			}) : null
		]
	});
};
const MAX_STACKED = 3;
let entries = [];
const listeners = /* @__PURE__ */ new Set();
let toastCounter = 0;
function notify() {
	for (const listener of listeners) listener();
}
function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function getSnapshot() {
	return entries;
}
/** Called by a Toast's own `onDismiss` once it has finished its exit transition. */
function removeEntry(id, reason) {
	const target = entries.find((entry) => entry.id === id);
	if (!target) return;
	entries = entries.filter((entry) => entry.id !== id);
	notify();
	target.onDismiss?.(reason);
}
function pushEntry(entry) {
	const existingIndex = entries.findIndex((item) => item.id === entry.id);
	if (existingIndex !== -1) {
		const previous = entries[existingIndex];
		const next = entries.slice();
		next[existingIndex] = entry;
		entries = next;
		previous.onDismiss?.("replaced");
	} else {
		let next = [...entries, entry];
		let evicted = null;
		if (next.length > MAX_STACKED) {
			evicted = next[0];
			next = next.slice(1);
		}
		entries = next;
		evicted?.onDismiss?.("replaced");
	}
	notify();
}
const REGION_OVERRIDE_HOOK = {
	regionInset: "--ds-toast-region-inset",
	stackGap: "--ds-toast-region-stack-gap",
	layer: "--ds-toast-region-layer"
};
function regionOverridesToStyle(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[REGION_OVERRIDE_HOOK[binding]] = cssVar(ref);
	}
	return style;
}
let regionMountCount = 0;
/**
* ToastRegion — the one persistent landmark that holds every visible Toast.
*
* Mount it once at the app root (or let `toast()` auto-mount it on first use). It exists before
* any toast so announcements fire, is reachable from anywhere with F6, and stacks up to three
* toasts above one another, newest last.
*/
const ToastRegion = function ToastRegion({ ref, overrides }) {
	const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	const regionRef = useRef(null);
	useImperativeHandle(ref, () => regionRef.current, []);
	const previousFocusRef = useRef(null);
	useEffect(() => {
		regionMountCount += 1;
		return () => {
			regionMountCount -= 1;
		};
	}, []);
	useEffect(() => {
		if (list.length === 0) return void 0;
		const handleKeyDown = (event) => {
			if (event.key !== "F6") return;
			const region = regionRef.current;
			if (!region) return;
			if (region.contains(document.activeElement)) {
				const previous = previousFocusRef.current;
				if (!previous) return;
				event.preventDefault();
				previousFocusRef.current = null;
				previous.focus();
			} else {
				const target = region.querySelector(FOCUSABLE_SELECTOR$9);
				if (!target) return;
				event.preventDefault();
				previousFocusRef.current = document.activeElement;
				target.focus();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [list.length]);
	if (list.length === 0) return null;
	const overrideStyle = overrides ? regionOverridesToStyle(overrides) : void 0;
	return createPortal(/* @__PURE__ */ jsx("div", {
		ref: regionRef,
		role: "region",
		"aria-label": COPY$21.regionLabel,
		"aria-live": "polite",
		"data-ds": "ToastRegion",
		"data-part": "region",
		className: "ds-toast-region",
		style: overrideStyle,
		children: list.map((entry) => /* @__PURE__ */ jsx(Toast, {
			toastId: entry.id,
			message: entry.message,
			tone: entry.tone,
			actionLabel: entry.actionLabel,
			duration: entry.duration,
			dismissible: entry.dismissible,
			onAction: entry.onAction,
			onDismiss: (reason) => removeEntry(entry.id, reason)
		}, entry.id))
	}), document.body);
};
let autoRoot = null;
/** Creates a `<ToastRegion>` in `document.body` the first time `toast()` is called with none mounted. */
function ensureRegionMounted() {
	if (regionMountCount > 0 || autoRoot || typeof document === "undefined") return;
	const container = document.createElement("div");
	document.body.appendChild(container);
	autoRoot = createRoot(container);
	autoRoot.render(/* @__PURE__ */ jsx(ToastRegion, {}));
}
/**
* Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
* rendered: `toast({ message: 'Link copied' })`. Returns the toast's `id`.
*/
function toast(options) {
	const id = options.toastId ?? `ds-toast-${++toastCounter}`;
	const tone = options.tone ?? "neutral";
	const duration = options.duration ?? "short";
	if (isDev$17) {
		if (!options.message) console.warn("toast: `message` is required and is the toast’s content; it must not be empty.");
		if (duration !== "persistent" && (options.actionLabel || tone === "danger")) console.warn("toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.");
	}
	pushEntry({
		id,
		message: options.message,
		tone,
		actionLabel: options.actionLabel,
		duration,
		dismissible: options.dismissible ?? true,
		onAction: options.onAction,
		onDismiss: options.onDismiss
	});
	ensureRegionMounted();
	return id;
}
//#endregion
//#region src/Popover.tsx
const OVERRIDE_HOOK$8 = {
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
	exit: "--ds-popover-exit"
};
function overridesToStyle$17(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$8[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$20 = { closeLabel: "Close" };
const isDev$16 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$9() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
const FOCUSABLE_SELECTOR$8 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/**
* Moves focus to the next document-order tabbable element relative to `anchor`, ignoring anything
* inside `exclude` (the panel that just closed).
*/
function focusAdjacent$3(anchor, exclude) {
	if (!anchor) return;
	const all = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$8)).filter((element) => !exclude || !exclude.contains(element));
	const index = all.indexOf(anchor);
	if (index === -1) return;
	(all[index + 1] ?? anchor).focus();
}
/** Positions the panel from the trigger's rect for `placement`, flipping either axis on overflow. */
function computePosition$3(triggerRect, panelRect, placement, rtl) {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	if (placement === "start" || placement === "end") {
		const startIsLeft = !rtl;
		let side = placement;
		const wantsLeft = side === "start" ? startIsLeft : !startIsLeft;
		const fitsLeft = triggerRect.left - panelRect.width >= 0;
		const fitsRight = triggerRect.right + panelRect.width <= viewportWidth;
		if (wantsLeft && !fitsLeft && fitsRight || !wantsLeft && !fitsRight && fitsLeft) side = side === "start" ? "end" : "start";
		const finalWantsLeft = side === "start" ? startIsLeft : !startIsLeft;
		const centerY = triggerRect.top + triggerRect.height / 2;
		const style = { top: Math.min(Math.max(centerY - panelRect.height / 2, 0), Math.max(viewportHeight - panelRect.height, 0)) };
		if (finalWantsLeft) style.right = viewportWidth - triggerRect.left;
		else style.left = triggerRect.right;
		return {
			style,
			side
		};
	}
	const hasAlign = placement.includes("-");
	const vertRaw = hasAlign ? placement.split("-")[0] : placement;
	const alignRaw = hasAlign ? placement.split("-")[1] : "center";
	let vertical = vertRaw;
	if (vertical === "bottom" && triggerRect.bottom + panelRect.height > viewportHeight && triggerRect.top - panelRect.height >= 0) vertical = "top";
	else if (vertical === "top" && triggerRect.top - panelRect.height < 0 && triggerRect.bottom + panelRect.height <= viewportHeight) vertical = "bottom";
	const style = {};
	if (vertical === "bottom") style.top = triggerRect.bottom;
	else style.bottom = viewportHeight - triggerRect.top;
	if (alignRaw === "center") {
		const centerX = triggerRect.left + triggerRect.width / 2;
		style.left = Math.min(Math.max(centerX - panelRect.width / 2, 0), Math.max(viewportWidth - panelRect.width, 0));
	} else {
		let horizontal = alignRaw;
		if (horizontal === "start" && triggerRect.left + panelRect.width > viewportWidth && triggerRect.right - panelRect.width >= 0) horizontal = "end";
		else if (horizontal === "end" && triggerRect.right - panelRect.width < 0 && triggerRect.left + panelRect.width <= viewportWidth) horizontal = "start";
		if (horizontal === "start") style.left = triggerRect.left;
		else style.right = viewportWidth - triggerRect.right;
	}
	return {
		style,
		side: vertical
	};
}
/**
* Popover — Design Schema, category: overlay.
*
* When to use:
* Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date
* field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help
* with a link. Use `modal` when the panel contains a required step (a short form that must be
* submitted or cancelled). Use `heading` when the content is not obvious from the trigger.
*/
const Popover = function Popover({ ref, trigger, children, heading, headingLevel = "3", open: openProp, placement = "bottom", modal = false, showArrow = false, dismissible = true, onOpenChange, container, overrides }) {
	const generatedId = useId();
	const triggerId = `ds-popover${generatedId}-trigger`;
	const panelId = `ds-popover${generatedId}-panel`;
	const headingId = `ds-popover${generatedId}-heading`;
	const wrapperRef = useRef(null);
	useImperativeHandle(ref, () => wrapperRef.current, []);
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	const isControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? openProp : internalOpen;
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const [panelStyle, setPanelStyle] = useState();
	const [side, setSide] = useState("bottom");
	const closingRef = useRef(false);
	const restoreFocusRef = useRef(true);
	const latest = useRef({ placement });
	latest.current = { placement };
	if (isDev$16 && Children.count(trigger) !== 1) console.warn("Popover: `trigger` must be exactly one focusable element.");
	const changeOpen = (value, reason) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.(value, reason);
	};
	const requestClose = (reason) => {
		if (closingRef.current) return;
		closingRef.current = true;
		changeOpen(false, reason);
	};
	const handleTriggerClick = () => {
		if (open) requestClose("trigger");
		else {
			closingRef.current = false;
			restoreFocusRef.current = true;
			changeOpen(true, "trigger");
		}
	};
	useEffect(() => {
		if (open) {
			closingRef.current = false;
			setPresent(true);
		}
	}, [open]);
	useLayoutEffect(() => {
		if (!present) return void 0;
		const panel = panelRef.current;
		if (!panel) return void 0;
		if (modal && panel instanceof HTMLDialogElement && !panel.open) {
			panel.showModal?.();
			panel.open = true;
		}
		(bodyRef.current?.querySelector(FOCUSABLE_SELECTOR$8) ?? closeButtonRef.current ?? headingRef.current ?? panel).focus();
		const reposition = () => {
			const trigger = triggerRef.current;
			if (!trigger || !panel) return;
			const triggerRect = trigger.getBoundingClientRect();
			const panelRect = panel.getBoundingClientRect();
			const rtl = getComputedStyle(trigger).direction === "rtl";
			const result = computePosition$3(triggerRect, panelRect, latest.current.placement, rtl);
			setPanelStyle(result.style);
			setSide(result.side);
		};
		reposition();
		if (prefersReducedMotion$9()) {
			setVisible(true);
			window.addEventListener("scroll", reposition, true);
			window.addEventListener("resize", reposition);
			return () => {
				window.removeEventListener("scroll", reposition, true);
				window.removeEventListener("resize", reposition);
			};
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [present, modal]);
	useEffect(() => {
		if (open || !present) return void 0;
		setVisible(false);
		const panel = panelRef.current;
		const finish = () => {
			setPresent(false);
			if (modal && panel instanceof HTMLDialogElement) {
				panel.close?.();
				panel.open = false;
			}
		};
		if (prefersReducedMotion$9()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "opacity") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		modal
	]);
	useEffect(() => {
		if (!modal || !present) return void 0;
		document.documentElement.classList.add("ds-popover-lock-scroll");
		return () => document.documentElement.classList.remove("ds-popover-lock-scroll");
	}, [modal, present]);
	useEffect(() => {
		if (modal || !open) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
			requestClose("outside");
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [modal, open]);
	const handleDialogCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handlePanelKeyDown = (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			requestClose("escape");
			return;
		}
		if (event.key !== "Tab") return;
		const panel = panelRef.current;
		if (!panel) return;
		const focusables = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR$8));
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const activeElement = document.activeElement;
		if (!event.shiftKey && activeElement === last) {
			event.preventDefault();
			restoreFocusRef.current = false;
			requestClose("tab-out");
			focusAdjacent$3(triggerRef.current, panel);
		} else if (event.shiftKey && activeElement === first) {
			event.preventDefault();
			requestClose("tab-out");
			triggerRef.current?.focus();
		}
	};
	const handleCloseButtonClick = () => requestClose("close-button");
	const triggerElement = trigger;
	const clonedTrigger = cloneElement(triggerElement, {
		ref: triggerRef,
		id: triggerId,
		"aria-expanded": open ? "true" : "false",
		"aria-controls": open ? panelId : void 0,
		onClick: (event) => {
			triggerElement.props.onClick?.(event);
			handleTriggerClick();
		}
	});
	const overrideStyle = overrides ? overridesToStyle$17(overrides) : void 0;
	const mergedPanelStyle = {
		...panelStyle,
		...overrideStyle
	};
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	const panelClasses = ["ds-popover__panel", visible ? "ds-popover__panel--visible" : null].filter(Boolean).join(" ");
	const panelContent = /* @__PURE__ */ jsxs(Fragment, { children: [showArrow ? /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		"data-part": "arrow",
		className: "ds-popover__arrow"
	}) : null, /* @__PURE__ */ jsx(FocusScope, {
		trapped: modal,
		autoFocus: "none",
		restoreFocus: restoreFocusRef.current,
		children: /* @__PURE__ */ jsxs("div", {
			className: "ds-popover__surface",
			ref: surfaceRef,
			"data-part": "panel",
			children: [heading || dismissible ? /* @__PURE__ */ jsxs("div", {
				className: "ds-popover__header",
				children: [heading ? /* @__PURE__ */ jsx(Heading, {
					level: headingLevel,
					id: headingId,
					ref: headingRef,
					tabIndex: -1,
					"data-part": "heading",
					className: "ds-popover__heading",
					children: heading
				}) : null, dismissible ? /* @__PURE__ */ jsx(Button, {
					ref: closeButtonRef,
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					label: COPY$20.closeLabel,
					"data-part": "closeButton",
					className: "ds-popover__close",
					onClick: handleCloseButtonClick,
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "close",
						inline: true
					})
				}) : null]
			}) : null, /* @__PURE__ */ jsx(Box, {
				element: "div",
				inset: "md",
				overrides: bodyOverrides,
				"data-part": "body",
				className: "ds-popover__body",
				ref: bodyRef,
				children
			})]
		})
	})] });
	const panelNode = present ? modal ? /* @__PURE__ */ jsx("dialog", {
		ref: panelRef,
		id: panelId,
		"data-side": side,
		className: panelClasses,
		style: mergedPanelStyle,
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": heading ? headingId : triggerId,
		onCancel: handleDialogCancel,
		children: panelContent
	}) : /* @__PURE__ */ jsx("div", {
		ref: panelRef,
		id: panelId,
		"data-side": side,
		className: panelClasses,
		style: mergedPanelStyle,
		role: "dialog",
		"aria-modal": "false",
		"aria-labelledby": heading ? headingId : triggerId,
		tabIndex: -1,
		onKeyDown: handlePanelKeyDown,
		children: panelContent
	}) : null;
	return /* @__PURE__ */ jsxs("div", {
		ref: wrapperRef,
		"data-ds": "Popover",
		className: "ds-popover",
		children: [clonedTrigger, panelNode ? createPortal(panelNode, container ?? document.body) : null]
	});
};
//#endregion
//#region src/BottomSheet.tsx
const OVERRIDE_HOOK$7 = {
	scrim: "--ds-bottom-sheet-scrim",
	shadow: "--ds-bottom-sheet-shadow",
	radius: "--ds-bottom-sheet-radius",
	handleHeight: "--ds-bottom-sheet-handle-height",
	handleWidth: "--ds-bottom-sheet-handle-width",
	inset: "--ds-bottom-sheet-inset",
	partGap: "--ds-bottom-sheet-part-gap",
	footerGap: "--ds-bottom-sheet-footer-gap",
	maxWidth: "--ds-bottom-sheet-max-width",
	layer: "--ds-bottom-sheet-layer",
	enter: "--ds-bottom-sheet-enter",
	exit: "--ds-bottom-sheet-exit"
};
function overridesToStyle$16(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$7[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$19 = { closeLabel: "Close" };
const FOCUSABLE_SELECTOR$7 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
const isDev$15 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$8() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Above `layout.maxWidth.prose` (read from the loaded token stylesheet, never hard-coded) the sheet
* presents as a centered Dialog instead of rising from the bottom edge.
*/
function useIsWideViewport$1() {
	const [isWide, setIsWide] = useState(false);
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return void 0;
		const breakpoint = getComputedStyle(document.documentElement).getPropertyValue("--layout-max-width-prose").trim();
		if (!breakpoint) return void 0;
		const query = window.matchMedia(`(min-width: ${breakpoint})`);
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
* Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog:
* filters, a form of a few fields, details of a selected item, a picker with many options. Use
* `height: content` by default; `full` for a task that needs the whole screen but should still feel
* dismissable; `half` for a browsable list where seeing the page behind matters (a map with
* results). For a flat list of actions, ActionSheet is the lighter component.
*/
const BottomSheet = function BottomSheet({ ref, open, heading, hideHeading = false, children, footer, height = "content", dismissible = true, dragToDismiss = true, onClose, onDragDismiss, container, overrides, className, style, ...rest }) {
	const isWide = useIsWideViewport$1();
	const headingId = `ds-bottom-sheet${useId()}-heading`;
	const dialogRef = useRef(null);
	useImperativeHandle(ref, () => dialogRef.current, []);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const headingRef = useRef(null);
	const closeButtonRef = useRef(null);
	const dragRef = useRef(null);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	if (isDev$15 && !heading) console.warn("BottomSheet: `heading` is required and becomes the accessible name; it must not be empty.");
	useEffect(() => {
		if (open) setPresent(true);
	}, [open]);
	useLayoutEffect(() => {
		if (!present || isWide) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		if (!dialog.open) {
			dialog.showModal?.();
			dialog.open = true;
		}
		(bodyRef.current?.querySelector(FOCUSABLE_SELECTOR$7) ?? closeButtonRef.current ?? headingRef.current ?? dialog).focus();
		if (prefersReducedMotion$8()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [present, isWide]);
	useEffect(() => {
		if (open || !present || isWide) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const finish = () => {
			setPresent(false);
			dialog?.close?.();
			if (dialog) dialog.open = false;
		};
		if (prefersReducedMotion$8()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "transform") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		isWide
	]);
	useEffect(() => {
		if (!present || isWide) return void 0;
		document.documentElement.classList.add("ds-bottom-sheet-lock-scroll");
		return () => document.documentElement.classList.remove("ds-bottom-sheet-lock-scroll");
	}, [present, isWide]);
	const requestClose = (reason) => {
		if (reason !== "escape" && !dismissible) return;
		onClose?.(reason);
	};
	const handleCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handleScrimClick = (event) => {
		if (event.target !== dialogRef.current) return;
		requestClose("scrim");
	};
	const handleCloseButtonClick = () => requestClose("close-button");
	const handleHeaderPointerDown = (event) => {
		if (!dragToDismiss) return;
		if (event.target.closest("button")) return;
		const surface = surfaceRef.current;
		if (!surface) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			startY: event.clientY,
			startTime: event.timeStamp
		};
		surface.style.transition = "none";
	};
	const handleHeaderPointerMove = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		if (!drag || !surface) return;
		const deltaY = Math.max(0, event.clientY - drag.startY);
		surface.style.transform = `translateY(${deltaY}px)`;
	};
	const finishDrag = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		dragRef.current = null;
		if (!drag || !surface) return;
		const deltaY = Math.max(0, event.clientY - drag.startY);
		const velocity = deltaY / Math.max(1, event.timeStamp - drag.startTime);
		const pastThreshold = deltaY / (surface.getBoundingClientRect().height || 1) > .25 || velocity > 1.5;
		surface.style.transition = prefersReducedMotion$8() ? "none" : "";
		surface.style.transform = "";
		if (pastThreshold && dismissible) {
			onDragDismiss?.();
			requestClose("drag");
		}
	};
	const overrideStyle = overrides ? overridesToStyle$16(overrides) : void 0;
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	if (isWide) return /* @__PURE__ */ jsx(Dialog, {
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
		className,
		style,
		children
	});
	if (!present) return null;
	const classes = [
		"ds-bottom-sheet",
		`ds-bottom-sheet--height-${height}`,
		visible ? "ds-bottom-sheet--visible" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const headingClasses = ["ds-bottom-sheet__heading", hideHeading ? "ds-bottom-sheet__visually-hidden" : null].filter(Boolean).join(" ");
	const node = /* @__PURE__ */ jsx("dialog", {
		...rest,
		ref: dialogRef,
		"data-ds": "BottomSheet",
		className: classes,
		style: mergedStyle,
		"aria-modal": "true",
		"aria-labelledby": headingId,
		onCancel: handleCancel,
		onClick: handleScrimClick,
		children: /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			"data-part": "focusScope",
			children: /* @__PURE__ */ jsxs("div", {
				className: "ds-bottom-sheet__surface",
				ref: surfaceRef,
				"data-part": "surface",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "ds-bottom-sheet__header",
						"data-part": "header",
						onPointerDown: handleHeaderPointerDown,
						onPointerMove: handleHeaderPointerMove,
						onPointerUp: finishDrag,
						onPointerCancel: finishDrag,
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-bottom-sheet__handle",
							"data-part": "handle",
							"aria-hidden": "true"
						}), /* @__PURE__ */ jsxs("div", {
							className: "ds-bottom-sheet__heading-row",
							children: [/* @__PURE__ */ jsx(Heading, {
								level: 2,
								id: headingId,
								ref: headingRef,
								tabIndex: -1,
								"data-part": "heading",
								className: headingClasses,
								children: heading
							}), /* @__PURE__ */ jsx(Button, {
								ref: closeButtonRef,
								variant: "ghost",
								size: "md",
								iconOnly: true,
								label: COPY$19.closeLabel,
								"data-part": "closeButton",
								className: "ds-bottom-sheet__close",
								onClick: handleCloseButtonClick,
								leadingIcon: /* @__PURE__ */ jsx(Icon, {
									name: "close",
									inline: true
								})
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Box, {
						element: "div",
						inset: "lg",
						overrides: bodyOverrides,
						"data-part": "body",
						className: "ds-bottom-sheet__body",
						ref: bodyRef,
						children
					}),
					footer !== void 0 ? /* @__PURE__ */ jsx("div", {
						className: "ds-bottom-sheet__footer",
						"data-part": "footer",
						children: /* @__PURE__ */ jsx(Stack, {
							direction: "horizontal",
							gap: "tight",
							justify: "end",
							children: footer
						})
					}) : null
				]
			})
		})
	});
	return createPortal(node, container ?? document.body);
};
//#endregion
//#region src/ActionSheet.tsx
const ROOT_OVERRIDE_HOOK$14 = {
	scrim: "--ds-action-sheet-scrim",
	shadow: "--ds-action-sheet-shadow",
	radius: "--ds-action-sheet-radius",
	itemPaddingBlock: "--ds-action-sheet-item-padding-block",
	itemPaddingInline: "--ds-action-sheet-item-padding-inline",
	itemGap: "--ds-action-sheet-item-gap",
	headerPaddingBlock: "--ds-action-sheet-header-padding-block",
	fontFamily: "--ds-action-sheet-font-family",
	fontSize: "--ds-action-sheet-font-size",
	lineHeight: "--ds-action-sheet-line-height",
	divider: "--ds-action-sheet-divider",
	dividerWidth: "--ds-action-sheet-divider-width",
	maxWidth: "--ds-action-sheet-max-width",
	layer: "--ds-action-sheet-layer",
	enter: "--ds-action-sheet-enter",
	exit: "--ds-action-sheet-exit"
};
function overridesToStyle$15(overrides) {
	const rootStyle = {};
	const textOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$14[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		if (binding === "titleSize") textOverrides.fontSize = ref;
		if (binding === "fontFamily") textOverrides.fontFamily = ref;
		if (binding === "lineHeight") textOverrides.lineHeight = ref;
	}
	return {
		rootStyle,
		textOverrides
	};
}
const COPY$18 = {
	cancelLabel: "Cancel",
	defaultLabel: "Actions"
};
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$7() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Above `layout.maxWidth.prose` (read from the loaded token stylesheet, never hard-coded) the sheet
* presents as a Menu anchored to the trigger instead of rising from the bottom edge.
*/
function useIsWideViewport() {
	const [isWide, setIsWide] = useState(false);
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return void 0;
		const breakpoint = getComputedStyle(document.documentElement).getPropertyValue("--layout-max-width-prose").trim();
		if (!breakpoint) return void 0;
		const query = window.matchMedia(`(min-width: ${breakpoint})`);
		const update = () => setIsWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return isWide;
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
/** Danger actions are grouped last, separated from the rest — mirrored for both presentations. */
function partitionActions(actions) {
	return {
		normal: actions.filter((action) => action.tone !== "danger"),
		danger: actions.filter((action) => action.tone === "danger")
	};
}
function toMenuItems(actions) {
	const { normal, danger } = partitionActions(actions);
	const items = normal.map(toMenuAction);
	if (danger.length > 0) {
		items.push({ separator: true });
		items.push(...danger.map(toMenuAction));
	}
	return items;
}
/**
* ActionSheet — Design Schema, category: overlay.
*
* When to use:
* Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened
* from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits
* without scrolling; more than eight actions means the item needs its own screen. Put destructive
* actions last with `tone: danger`.
*/
const ActionSheet = function ActionSheet({ ref, open, heading, actions, dismissible = true, cancelLabel, onAction, onClose, container, overrides, className, style, ...rest }) {
	const isWide = useIsWideViewport();
	const listId = `ds-action-sheet${useId()}-list`;
	const dialogRef = useRef(null);
	useImperativeHandle(ref, () => dialogRef.current, []);
	const surfaceRef = useRef(null);
	const itemRefs = useRef(/* @__PURE__ */ new Map());
	const dragRef = useRef(null);
	const menuAnchorRef = useRef(null);
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const [activeId, setActiveId] = useState(null);
	const accessibleLabel = heading || COPY$18.defaultLabel;
	const { normal: normalActions, danger: dangerActions } = partitionActions(actions);
	useEffect(() => {
		if (open) setPresent(true);
	}, [open]);
	useEffect(() => {
		if (!open || !isWide) return;
		const opener = document.activeElement;
		if (opener instanceof HTMLElement) menuAnchorRef.current = opener;
	}, [open, isWide]);
	useLayoutEffect(() => {
		if (!present || isWide) return void 0;
		const dialog = dialogRef.current;
		if (!dialog) return void 0;
		if (!dialog.open) {
			dialog.showModal?.();
			dialog.open = true;
		}
		const first = actions.find((action) => !action.disabled);
		if (first) {
			setActiveId(first.id);
			itemRefs.current.get(first.id)?.focus();
		} else dialog.focus();
		if (prefersReducedMotion$7()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [present, isWide]);
	useEffect(() => {
		if (open || !present || isWide) return void 0;
		setVisible(false);
		const dialog = dialogRef.current;
		const finish = () => {
			setPresent(false);
			dialog?.close?.();
			if (dialog) dialog.open = false;
		};
		if (prefersReducedMotion$7()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "transform") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		isWide
	]);
	useEffect(() => {
		if (!present || isWide) return void 0;
		document.documentElement.classList.add("ds-action-sheet-lock-scroll");
		return () => document.documentElement.classList.remove("ds-action-sheet-lock-scroll");
	}, [present, isWide]);
	const requestClose = (reason) => {
		if (reason !== "escape" && !dismissible) return;
		onClose?.(reason);
	};
	const handleCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handleScrimClick = (event) => {
		if (event.target !== dialogRef.current) return;
		requestClose("scrim");
	};
	const handleCancelButtonClick = () => requestClose("cancel");
	const handleSurfacePointerDown = (event) => {
		if (event.target.closest("button")) return;
		const surface = surfaceRef.current;
		if (!surface) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			startY: event.clientY,
			startTime: event.timeStamp
		};
		surface.style.transition = "none";
	};
	const handleSurfacePointerMove = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		if (!drag || !surface) return;
		const deltaY = Math.max(0, event.clientY - drag.startY);
		surface.style.transform = `translateY(${deltaY}px)`;
	};
	const finishDrag = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		dragRef.current = null;
		if (!drag || !surface) return;
		const deltaY = Math.max(0, event.clientY - drag.startY);
		const velocity = deltaY / Math.max(1, event.timeStamp - drag.startTime);
		const pastThreshold = deltaY / (surface.getBoundingClientRect().height || 1) > .25 || velocity > .5;
		surface.style.transition = prefersReducedMotion$7() ? "none" : "";
		surface.style.transform = "";
		if (pastThreshold) requestClose("drag");
	};
	const focusAction = (id) => {
		setActiveId(id);
		itemRefs.current.get(id)?.focus();
	};
	const activateAction = (action) => {
		if (action.disabled) return;
		onAction?.(action.id);
	};
	const handleListKeyDown = (event) => {
		const enabled = actions.filter((action) => !action.disabled);
		if (enabled.length === 0) return;
		const currentIndex = enabled.findIndex((action) => action.id === activeId);
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				focusAction(enabled[(currentIndex + 1) % enabled.length].id);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusAction(enabled[(currentIndex - 1 + enabled.length) % enabled.length].id);
				break;
			case "Home":
				event.preventDefault();
				focusAction(enabled[0].id);
				break;
			case "End":
				event.preventDefault();
				focusAction(enabled[enabled.length - 1].id);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				if (currentIndex !== -1) activateAction(enabled[currentIndex]);
		}
	};
	const handleItemMouseEnter = (action) => {
		if (action.disabled) return;
		focusAction(action.id);
	};
	const handleItemClick = (action) => (event) => {
		if (action.disabled) {
			event.preventDefault();
			return;
		}
		activateAction(action);
	};
	const handleMenuOpenChange = ({ open: isOpen, reason }) => {
		if (isOpen || reason === "action") return;
		requestClose(reason === "outside" ? "scrim" : "escape");
	};
	const handleMenuAction = (id) => {
		onAction?.(id);
	};
	const renderItem = (action) => {
		const classes = [
			"ds-action-sheet__item",
			action.tone === "danger" ? "ds-action-sheet__item--danger" : null,
			action.disabled ? "ds-action-sheet__item--disabled" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("button", {
			ref: (element) => {
				if (element) itemRefs.current.set(action.id, element);
				else itemRefs.current.delete(action.id);
			},
			type: "button",
			role: "menuitem",
			id: `${listId}-item-${action.id}`,
			tabIndex: action.id === activeId ? 0 : -1,
			"aria-disabled": action.disabled ? "true" : void 0,
			"data-part": "item",
			className: classes,
			onMouseEnter: () => handleItemMouseEnter(action),
			onClick: handleItemClick(action),
			children: [action.icon ? /* @__PURE__ */ jsx("span", {
				className: "ds-action-sheet__item-icon",
				"data-part": "itemIcon",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(Icon, {
					name: action.icon,
					inline: true
				})
			}) : null, /* @__PURE__ */ jsx("span", {
				className: "ds-action-sheet__item-label",
				children: action.label
			})]
		}, action.id);
	};
	const { rootStyle: overrideStyle, textOverrides } = overrides ? overridesToStyle$15(overrides) : {
		rootStyle: void 0,
		textOverrides: {}
	};
	if (isWide) {
		if (!open) return null;
		return /* @__PURE__ */ jsx(Menu, {
			label: accessibleLabel,
			items: toMenuItems(actions),
			open: true,
			anchor: menuAnchorRef,
			onAction: handleMenuAction,
			onOpenChange: handleMenuOpenChange,
			container
		});
	}
	if (!present) return null;
	const classes = [
		"ds-action-sheet",
		visible ? "ds-action-sheet--visible" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const node = /* @__PURE__ */ jsx("dialog", {
		...rest,
		ref: dialogRef,
		"data-ds": "ActionSheet",
		className: classes,
		style: mergedStyle,
		"aria-modal": "true",
		onCancel: handleCancel,
		onClick: handleScrimClick,
		children: /* @__PURE__ */ jsx(FocusScope, {
			trapped: true,
			autoFocus: "none",
			restoreFocus: true,
			children: /* @__PURE__ */ jsxs("div", {
				className: "ds-action-sheet__surface",
				ref: surfaceRef,
				"data-part": "surface",
				onPointerDown: handleSurfacePointerDown,
				onPointerMove: handleSurfacePointerMove,
				onPointerUp: finishDrag,
				onPointerCancel: finishDrag,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "ds-action-sheet__header",
						"data-part": "header",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-action-sheet__handle",
							"data-part": "handle",
							"aria-hidden": "true"
						}), heading ? /* @__PURE__ */ jsx(Text, {
							size: "sm",
							tone: "muted",
							"data-part": "heading",
							className: "ds-action-sheet__heading",
							overrides: Object.keys(textOverrides).length ? textOverrides : void 0,
							children: heading
						}) : null]
					}),
					/* @__PURE__ */ jsxs("div", {
						role: "menu",
						id: listId,
						"aria-label": accessibleLabel,
						"data-part": "list",
						className: "ds-action-sheet__list",
						onKeyDown: handleListKeyDown,
						children: [
							normalActions.map(renderItem),
							dangerActions.length > 0 ? /* @__PURE__ */ jsx("div", {
								role: "separator",
								className: "ds-action-sheet__divider",
								"aria-hidden": "true"
							}) : null,
							dangerActions.map(renderItem)
						]
					}),
					/* @__PURE__ */ jsx("div", {
						role: "separator",
						className: "ds-action-sheet__divider",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "ds-action-sheet__cancel-row",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							label: cancelLabel || COPY$18.cancelLabel,
							"data-part": "cancelButton",
							className: "ds-action-sheet__cancel",
							onClick: handleCancelButtonClick
						})
					})
				]
			})
		})
	});
	return createPortal(node, container ?? document.body);
};
//#endregion
//#region src/SidePanel.tsx
/**
* Reasons that request close even when `dismissible` is false: the trigger toggle, a footer
* action, and following a Link are the consumer's own deliberate UI, not an incidental dismiss
* affordance; Escape still reports through `onOpenChange` so the consumer can decide, as in Dialog.
*/
const ALWAYS_ALLOWED_REASONS = /* @__PURE__ */ new Set([
	"trigger",
	"escape",
	"action",
	"navigation"
]);
const OVERRIDE_HOOK$6 = {
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
	partGap: "--ds-side-panel-part-gap",
	footerGap: "--ds-side-panel-footer-gap",
	layer: "--ds-side-panel-layer",
	enter: "--ds-side-panel-enter",
	exit: "--ds-side-panel-exit"
};
function overridesToStyle$14(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$6[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$17 = { closeLabel: "Close" };
const FOCUSABLE_SELECTOR$6 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/**
* Moves focus to the next document-order tabbable element relative to `anchor`, ignoring anything
* inside `exclude` (the portaled panel) — used so Tab out of the last panel element continues into
* the page rather than the portal's own position in the DOM.
*/
function focusAdjacent$2(anchor, exclude) {
	if (!anchor) return;
	const all = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$6)).filter((element) => !exclude || !exclude.contains(element));
	const index = all.indexOf(anchor);
	if (index === -1) return;
	(all[index + 1] ?? anchor).focus();
}
const isDev$14 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$6() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/**
* Above the given token custom property's breakpoint (read from the loaded token stylesheet, never
* hard-coded), the panel stops being an overlay and becomes a fixed sidebar. `null` never matches.
*/
function useBreakpoint(cssVarName) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		if (!cssVarName || typeof window === "undefined" || typeof window.matchMedia !== "function") {
			setMatches(false);
			return;
		}
		const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
		if (!value) return void 0;
		const query = window.matchMedia(`(min-width: ${value})`);
		const update = () => setMatches(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, [cssVarName]);
	return matches;
}
/**
* SidePanel — Design Schema, category: overlay.
*
* When to use:
* Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a List or Tree of
* Links from the `start` edge), for filters beside a results page, for a cart or a detail panel
* from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should
* become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary
* overlay (a cart).
*/
const SidePanel = function SidePanel({ ref, trigger, open: openProp, heading, hideHeading = false, children, footer, side = "start", width = "default", persistent = "never", role = "complementary", modal = false, scrim = true, dismissible = true, swipeable = true, onOpenChange, container, overrides }) {
	const isPersistentActive = useBreakpoint(persistent === "content" ? "--layout-max-width-content" : persistent === "page" ? "--layout-max-width-page" : null);
	const generatedId = useId();
	const triggerId = `ds-side-panel${generatedId}-trigger`;
	const panelId = `ds-side-panel${generatedId}-panel`;
	const headingId = `ds-side-panel${generatedId}-heading`;
	const wrapperRef = useRef(null);
	useImperativeHandle(ref, () => wrapperRef.current, []);
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const surfaceRef = useRef(null);
	const bodyRef = useRef(null);
	const closeButtonRef = useRef(null);
	const dragRef = useRef(null);
	const isControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? openProp : internalOpen;
	const [present, setPresent] = useState(open);
	const [visible, setVisible] = useState(false);
	const closingRef = useRef(false);
	if (isDev$14 && !heading) console.warn("SidePanel: `heading` is required and becomes the accessible name; it must not be empty.");
	const changeOpen = (value, reason) => {
		if (!isControlled) setInternalOpen(value);
		onOpenChange?.(value, reason);
	};
	const requestClose = (reason) => {
		if (!dismissible && !ALWAYS_ALLOWED_REASONS.has(reason)) return;
		if (closingRef.current) return;
		closingRef.current = true;
		changeOpen(false, reason);
	};
	const handleTriggerClick = () => {
		if (open) requestClose("trigger");
		else {
			closingRef.current = false;
			changeOpen(true, "trigger");
		}
	};
	useEffect(() => {
		if (open) {
			closingRef.current = false;
			setPresent(true);
		}
	}, [open]);
	useLayoutEffect(() => {
		if (!present || isPersistentActive) return void 0;
		const panel = panelRef.current;
		if (!panel) return void 0;
		if (modal && panel instanceof HTMLDialogElement && !panel.open) {
			panel.showModal?.();
			panel.open = true;
		}
		if (modal) (bodyRef.current?.querySelector(FOCUSABLE_SELECTOR$6) ?? closeButtonRef.current ?? panel).focus();
		if (prefersReducedMotion$6()) {
			setVisible(true);
			return;
		}
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [
		present,
		modal,
		isPersistentActive
	]);
	useEffect(() => {
		if (open || !present || isPersistentActive) return void 0;
		setVisible(false);
		const panel = panelRef.current;
		const finish = () => {
			setPresent(false);
			if (modal && panel instanceof HTMLDialogElement) {
				panel.close?.();
				panel.open = false;
			}
		};
		if (prefersReducedMotion$6()) {
			finish();
			return;
		}
		const surface = surfaceRef.current;
		const handleExited = (event) => {
			if (event.target !== surface || event.propertyName !== "transform") return;
			finish();
		};
		surface?.addEventListener("transitionend", handleExited);
		return () => surface?.removeEventListener("transitionend", handleExited);
	}, [
		open,
		present,
		modal,
		isPersistentActive
	]);
	useEffect(() => {
		if (!modal || !present || isPersistentActive) return void 0;
		document.documentElement.classList.add("ds-side-panel-lock-scroll");
		return () => document.documentElement.classList.remove("ds-side-panel-lock-scroll");
	}, [
		modal,
		present,
		isPersistentActive
	]);
	useEffect(() => {
		if (modal || !open || isPersistentActive) return void 0;
		const handlePointerDown = (event) => {
			const target = event.target;
			if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
			requestClose("scrim");
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [
		modal,
		open,
		isPersistentActive
	]);
	const handleDialogCancel = (event) => {
		event.preventDefault();
		requestClose("escape");
	};
	const handleDialogClick = (event) => {
		if (event.target !== panelRef.current) return;
		requestClose("scrim");
	};
	const handlePanelKeyDown = (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			requestClose("escape");
			triggerRef.current?.focus();
			return;
		}
		if (event.key !== "Tab") return;
		const panel = panelRef.current;
		if (!panel) return;
		const focusables = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR$6));
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const activeElement = document.activeElement;
		if (!event.shiftKey && activeElement === last) {
			event.preventDefault();
			focusAdjacent$2(triggerRef.current, panel);
		} else if (event.shiftKey && activeElement === first) {
			event.preventDefault();
			triggerRef.current?.focus();
		}
	};
	const handleCloseButtonClick = () => requestClose("close-button");
	const handleScrimClick = () => requestClose("scrim");
	const handleBodyClick = (event) => {
		if (!event.target.closest("a[href]")) return;
		requestClose("navigation");
	};
	const swipeDirection = () => {
		const surface = surfaceRef.current;
		const rtl = surface ? getComputedStyle(surface).direction === "rtl" : false;
		return side === "start" && !rtl || side === "end" && rtl ? -1 : 1;
	};
	const handleHeaderPointerDown = (event) => {
		if (!swipeable) return;
		if (event.target.closest("button")) return;
		const surface = surfaceRef.current;
		if (!surface) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			startX: event.clientX,
			startTime: event.timeStamp
		};
		surface.style.transition = "none";
	};
	const handleHeaderPointerMove = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		if (!drag || !surface) return;
		const direction = swipeDirection();
		const deltaOffscreen = Math.max(0, (event.clientX - drag.startX) * direction);
		surface.style.transform = `translateX(${direction * deltaOffscreen}px)`;
	};
	const finishHeaderDrag = (event) => {
		const drag = dragRef.current;
		const surface = surfaceRef.current;
		dragRef.current = null;
		if (!drag || !surface) return;
		const direction = swipeDirection();
		const deltaOffscreen = Math.max(0, (event.clientX - drag.startX) * direction);
		const velocity = deltaOffscreen / Math.max(1, event.timeStamp - drag.startTime);
		const pastThreshold = deltaOffscreen / (surface.getBoundingClientRect().width || 1) > .25 || velocity > .5;
		surface.style.transition = prefersReducedMotion$6() ? "none" : "";
		surface.style.transform = "";
		if (pastThreshold) requestClose("swipe");
	};
	const triggerElement = trigger;
	const clonedTrigger = triggerElement ? cloneElement(triggerElement, {
		ref: triggerRef,
		id: triggerId,
		"aria-expanded": open ? "true" : "false",
		"aria-controls": panelId,
		hidden: isPersistentActive || void 0,
		onClick: (event) => {
			triggerElement.props.onClick?.(event);
			handleTriggerClick();
		}
	}) : null;
	const overrideStyle = overrides ? overridesToStyle$14(overrides) : void 0;
	const bodyOverrides = overrides?.inset ? {
		paddingBlock: overrides.inset,
		paddingInline: overrides.inset
	} : void 0;
	const headingClasses = ["ds-side-panel__heading", hideHeading ? "ds-side-panel__heading--hidden" : null].filter(Boolean).join(" ");
	const header = /* @__PURE__ */ jsxs("div", {
		className: "ds-side-panel__header",
		"data-part": "header",
		onPointerDown: handleHeaderPointerDown,
		onPointerMove: handleHeaderPointerMove,
		onPointerUp: finishHeaderDrag,
		onPointerCancel: finishHeaderDrag,
		children: [/* @__PURE__ */ jsx(Heading, {
			level: 2,
			id: headingId,
			"data-part": "heading",
			className: headingClasses,
			children: heading
		}), !isPersistentActive && dismissible ? /* @__PURE__ */ jsx(Button, {
			ref: closeButtonRef,
			variant: "ghost",
			size: "md",
			iconOnly: true,
			label: COPY$17.closeLabel,
			"data-part": "closeButton",
			className: "ds-side-panel__close",
			onClick: handleCloseButtonClick,
			leadingIcon: /* @__PURE__ */ jsx(Icon, {
				name: "close",
				inline: true
			})
		}) : null]
	});
	const body = /* @__PURE__ */ jsx(Box, {
		element: "div",
		inset: "lg",
		overrides: bodyOverrides,
		"data-part": "body",
		className: "ds-side-panel__body",
		ref: bodyRef,
		onClick: handleBodyClick,
		children
	});
	const footerNode = footer !== void 0 ? /* @__PURE__ */ jsx("div", {
		className: "ds-side-panel__footer",
		"data-part": "footer",
		children: /* @__PURE__ */ jsx(Stack, {
			direction: "horizontal",
			gap: "tight",
			justify: "end",
			children: footer
		})
	}) : null;
	if (isPersistentActive) {
		const persistentClasses = [
			"ds-side-panel__panel",
			`ds-side-panel__panel--${side}`,
			`ds-side-panel__panel--width-${width}`,
			"ds-side-panel__panel--persistent"
		].join(" ");
		return /* @__PURE__ */ jsxs("div", {
			ref: wrapperRef,
			"data-ds": "SidePanel",
			className: "ds-side-panel",
			children: [clonedTrigger, /* @__PURE__ */ jsx(Landmark, {
				role,
				id: panelId,
				"aria-labelledby": headingId,
				className: persistentClasses,
				style: overrideStyle,
				children: /* @__PURE__ */ jsxs("div", {
					className: "ds-side-panel__surface",
					"data-part": "surface",
					children: [
						header,
						body,
						footerNode
					]
				})
			})]
		});
	}
	if (!present) return /* @__PURE__ */ jsx("div", {
		ref: wrapperRef,
		"data-ds": "SidePanel",
		className: "ds-side-panel",
		children: clonedTrigger
	});
	const panelClasses = [
		"ds-side-panel__panel",
		`ds-side-panel__panel--${side}`,
		`ds-side-panel__panel--width-${width}`,
		visible ? "ds-side-panel__panel--visible" : null
	].filter(Boolean).join(" ");
	const scrimClasses = ["ds-side-panel__scrim", visible ? "ds-side-panel__scrim--visible" : null].filter(Boolean).join(" ");
	const panelBody = /* @__PURE__ */ jsx(FocusScope, {
		trapped: modal,
		autoFocus: modal ? "first" : "none",
		restoreFocus: true,
		children: /* @__PURE__ */ jsxs("div", {
			className: "ds-side-panel__surface",
			ref: surfaceRef,
			"data-part": "surface",
			children: [
				header,
				body,
				footerNode
			]
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		ref: wrapperRef,
		"data-ds": "SidePanel",
		className: "ds-side-panel",
		children: [clonedTrigger, createPortal(/* @__PURE__ */ jsxs(Fragment, { children: [!modal && scrim ? /* @__PURE__ */ jsx("div", {
			className: scrimClasses,
			"data-part": "scrim",
			"aria-hidden": "true",
			onClick: handleScrimClick
		}) : null, modal ? /* @__PURE__ */ jsx("dialog", {
			ref: panelRef,
			id: panelId,
			className: panelClasses,
			style: overrideStyle,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": headingId,
			onCancel: handleDialogCancel,
			onClick: handleDialogClick,
			children: panelBody
		}) : /* @__PURE__ */ jsx(Landmark, {
			ref: panelRef,
			role,
			id: panelId,
			className: panelClasses,
			style: overrideStyle,
			"aria-labelledby": headingId,
			onKeyDown: handlePanelKeyDown,
			children: panelBody
		})] }), container ?? document.body)]
	});
};
//#endregion
//#region src/Tabs.tsx
const OVERRIDE_HOOK$5 = {
	tabPaddingBlock: "--ds-tabs-tab-padding-block",
	tabPaddingInline: "--ds-tabs-tab-padding-inline",
	tabGap: "--ds-tabs-tab-gap",
	listGap: "--ds-tabs-list-gap",
	indicatorThickness: "--ds-tabs-indicator-thickness",
	listBorder: "--ds-tabs-list-border",
	listBorderWidth: "--ds-tabs-list-border-width",
	panelGap: "--ds-tabs-panel-gap",
	badgeSize: "--ds-tabs-badge-size",
	fontFamily: "--ds-tabs-font-family",
	fontSize: "--ds-tabs-font-size",
	fontWeight: "--ds-tabs-font-weight",
	lineHeight: "--ds-tabs-line-height",
	radius: "--ds-tabs-radius",
	transition: "--ds-tabs-transition",
	disabledOpacity: "--ds-tabs-disabled-opacity"
};
function overridesToStyle$13(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$5[binding]] = cssVar(ref);
	}
	return style;
}
function firstEnabledId(items) {
	return items.find((item) => !item.disabled)?.id ?? items[0]?.id;
}
const isDev$13 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** The wrapper for one tab's content — a direct child of `Tabs`, one per tab, in the same order. */
const TabPanel = function TabPanel({ ref, id, children, className, ...rest }) {
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		id,
		role: "tabpanel",
		tabIndex: 0,
		"data-ds": "TabPanel",
		"data-part": "panel",
		className: ["ds-tabs__panel", className ?? null].filter(Boolean).join(" "),
		children
	});
};
/**
* Tabs — Design Schema, category: navigation.
*
* When to use:
* Use Tabs to split a region's content into two to about seven views that are alternatives of each
* other: the sections of a settings page, "Overview / Activity / Files" on a record, code and
* preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are
* many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.
*/
const Tabs = function Tabs({ ref, tabs, children, label, value, defaultValue, activation = "automatic", orientation = "horizontal", fit = "start", keepMounted = false, overrides, onChange, className, style, ...rest }) {
	const baseId = `ds-tabs${useId()}`;
	const tabRefs = useRef(/* @__PURE__ */ new Map());
	const allPanels = Children.toArray(children).filter(isValidElement);
	const panelIds = new Set(allPanels.map((panel) => panel.props.id));
	const tabIds = new Set(tabs.map((tab) => tab.id));
	const renderTabs = tabs.filter((tab) => panelIds.has(tab.id));
	const panels = allPanels.filter((panel) => tabIds.has(panel.props.id));
	if (isDev$13 && !label) console.warn("Tabs: `label` is required and becomes the tab list’s accessible name.");
	if (isDev$13) {
		for (const tab of tabs) if (!panelIds.has(tab.id)) console.warn(`Tabs: tab "${tab.id}" has no matching panel; it will not be rendered.`);
		for (const panel of allPanels) if (!tabIds.has(panel.props.id)) console.warn(`Tabs: panel "${panel.props.id}" has no matching tab; it will not be rendered.`);
	}
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(() => defaultValue ?? firstEnabledId(renderTabs));
	const selected = isControlled ? value : internalValue;
	const [activeId, setActiveId] = useState(selected);
	const [indicatorStyle, setIndicatorStyle] = useState();
	useEffect(() => {
		setActiveId(selected);
	}, [selected]);
	const selectTab = (id) => {
		if (!isControlled) setInternalValue(id);
		if (id !== selected) onChange?.(id);
	};
	const setTabRef = (id) => (el) => {
		if (el) tabRefs.current.set(id, el);
		else tabRefs.current.delete(id);
	};
	const focusTab = (id) => {
		setActiveId(id);
		tabRefs.current.get(id)?.focus();
	};
	useLayoutEffect(() => {
		const tabEl = selected ? tabRefs.current.get(selected) : void 0;
		if (!tabEl) return void 0;
		const measure = () => {
			setIndicatorStyle(orientation === "horizontal" ? {
				insetInlineStart: tabEl.offsetLeft,
				inlineSize: tabEl.offsetWidth
			} : {
				insetBlockStart: tabEl.offsetTop,
				blockSize: tabEl.offsetHeight
			});
		};
		measure();
		if (typeof tabEl.scrollIntoView === "function") tabEl.scrollIntoView({
			block: "nearest",
			inline: "nearest"
		});
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [
		selected,
		orientation,
		fit,
		tabs
	]);
	const handleTabClick = (tab) => {
		if (tab.disabled) return;
		setActiveId(tab.id);
		selectTab(tab.id);
	};
	const handleListKeyDown = (event) => {
		const enabled = renderTabs.filter((tab) => !tab.disabled);
		if (enabled.length === 0) return;
		const currentIndex = enabled.findIndex((tab) => tab.id === activeId);
		const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
		const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
		const moveTo = (id) => {
			focusTab(id);
			if (activation === "automatic") selectTab(id);
		};
		switch (event.key) {
			case nextKey:
				event.preventDefault();
				moveTo(enabled[(currentIndex + 1) % enabled.length].id);
				break;
			case prevKey:
				event.preventDefault();
				moveTo(enabled[(currentIndex - 1 + enabled.length) % enabled.length].id);
				break;
			case "Home":
				event.preventDefault();
				moveTo(enabled[0].id);
				break;
			case "End":
				event.preventDefault();
				moveTo(enabled[enabled.length - 1].id);
				break;
			case "Enter":
			case " ": if (activation === "manual" && activeId) {
				event.preventDefault();
				selectTab(activeId);
			}
		}
	};
	const classes = [
		"ds-tabs",
		`ds-tabs--${orientation}`,
		`ds-tabs--fit-${fit}`,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$13(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		"data-ds": "Tabs",
		className: classes,
		style: mergedStyle,
		children: [/* @__PURE__ */ jsxs("div", {
			role: "tablist",
			"aria-label": label,
			"aria-orientation": orientation,
			"data-part": "tablist",
			className: "ds-tabs__list",
			onKeyDown: handleListKeyDown,
			children: [renderTabs.map((tab) => {
				const tabId = `${baseId}-tab-${tab.id}`;
				const isSelected = tab.id === selected;
				const tabClasses = [
					"ds-tabs__tab",
					isSelected ? "ds-tabs__tab--selected" : null,
					tab.disabled ? "ds-tabs__tab--disabled" : null
				].filter(Boolean).join(" ");
				return /* @__PURE__ */ jsxs("button", {
					ref: setTabRef(tab.id),
					type: "button",
					role: "tab",
					id: tabId,
					"aria-selected": isSelected ? "true" : "false",
					"aria-controls": tab.id,
					"aria-disabled": tab.disabled ? "true" : void 0,
					tabIndex: tab.id === activeId ? 0 : -1,
					"data-part": "tab",
					className: tabClasses,
					onClick: () => handleTabClick(tab),
					children: [
						tab.icon ? /* @__PURE__ */ jsx("span", {
							className: "ds-tabs__tab-icon",
							"data-part": "tabIcon",
							children: /* @__PURE__ */ jsx(Icon, {
								name: tab.icon,
								inline: true
							})
						}) : null,
						/* @__PURE__ */ jsx("span", {
							className: "ds-tabs__tab-label",
							"data-part": "tabLabel",
							children: tab.label
						}),
						tab.badge ? /* @__PURE__ */ jsx("span", {
							className: "ds-tabs__badge",
							"data-part": "badge",
							children: tab.badge
						}) : null
					]
				}, tab.id);
			}), /* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				"data-part": "indicator",
				className: "ds-tabs__indicator",
				style: indicatorStyle
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ds-tabs__panels",
			children: panels.map((panel) => {
				const panelId = panel.props.id;
				const isSelected = panelId === selected;
				if (!isSelected && !keepMounted) return null;
				return cloneElement(panel, {
					key: panelId,
					"aria-labelledby": `${baseId}-tab-${panelId}`,
					hidden: !isSelected
				});
			})
		})]
	});
};
//#endregion
//#region src/SegmentedControl.tsx
const OVERRIDE_HOOK$4 = {
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
function overridesToStyle$12(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$4[binding]] = cssVar(ref);
	}
	return style;
}
function firstEnabledValue(options) {
	return options.find((option) => !option.disabled)?.value ?? options[0]?.value;
}
const isDev$12 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* SegmentedControl — Design Schema, category: input.
*
* When to use:
* Use it for two to five short, parallel options that change what a region shows or how a tool
* behaves, where the user switches often and sees the effect immediately. Use `iconOnly` in
* toolbars where the icons are unambiguous (list/grid) and add Tooltips. Pair it with a visible
* Text label when the group's purpose is not obvious.
*/
const SegmentedControl = function SegmentedControl({ ref, label, options, value, defaultValue, iconOnly = false, size = "md", fill = false, overrides, onChange, className, style, ...rest }) {
	const baseId = `ds-segmented-control${useId()}`;
	const segmentId = (optionValue) => `${baseId}-segment-${optionValue}`;
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(() => defaultValue ?? firstEnabledValue(options));
	const selected = isControlled ? value : internalValue;
	const [indicatorStyle, setIndicatorStyle] = useState();
	if (isDev$12 && !label) console.warn("SegmentedControl: `label` is required and becomes the group’s accessible name.");
	if (isDev$12 && (options.length < 2 || options.length > 5)) console.warn("SegmentedControl: `options` should have two to five entries.");
	if (isDev$12 && iconOnly && options.some((option) => !option.icon)) console.warn("SegmentedControl: every option needs an `icon` when `iconOnly` is set.");
	const getSegmentElement = (optionValue) => typeof document !== "undefined" ? document.getElementById(segmentId(optionValue)) : null;
	useLayoutEffect(() => {
		const segmentEl = selected ? getSegmentElement(selected) : null;
		if (!segmentEl) {
			setIndicatorStyle(void 0);
			return;
		}
		const measure = () => {
			setIndicatorStyle({
				insetInlineStart: segmentEl.offsetLeft,
				insetBlockStart: segmentEl.offsetTop,
				inlineSize: segmentEl.offsetWidth,
				blockSize: segmentEl.offsetHeight
			});
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [
		selected,
		fill,
		iconOnly,
		size,
		options
	]);
	const selectSegment = (optionValue) => {
		if (!isControlled) setInternalValue(optionValue);
		if (optionValue !== selected) onChange?.(optionValue);
	};
	const focusAndSelect = (optionValue) => {
		selectSegment(optionValue);
		getSegmentElement(optionValue)?.focus();
	};
	const handleSegmentClick = (option) => {
		if (option.disabled) return;
		selectSegment(option.value);
	};
	const handleKeyDown = (event) => {
		const enabled = options.filter((option) => !option.disabled);
		if (enabled.length === 0) return;
		const currentIndex = enabled.findIndex((option) => option.value === selected);
		switch (event.key) {
			case "ArrowRight":
			case "ArrowDown":
				event.preventDefault();
				focusAndSelect(enabled[(currentIndex + 1 + enabled.length) % enabled.length].value);
				break;
			case "ArrowLeft":
			case "ArrowUp":
				event.preventDefault();
				focusAndSelect(enabled[(currentIndex - 1 + enabled.length) % enabled.length].value);
				break;
			case "Home":
				event.preventDefault();
				focusAndSelect(enabled[0].value);
				break;
			case "End":
				event.preventDefault();
				focusAndSelect(enabled[enabled.length - 1].value);
		}
	};
	const classes = [
		"ds-segmented-control",
		`ds-segmented-control--${size}`,
		fill ? "ds-segmented-control--fill" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$12(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		role: "radiogroup",
		"aria-label": label,
		"data-ds": "SegmentedControl",
		"data-part": "group",
		className: classes,
		style: mergedStyle,
		onKeyDown: handleKeyDown,
		children: [options.map((option) => {
			const isSelected = option.value === selected;
			const segmentClasses = ["ds-segmented-control__segment", option.disabled ? "ds-segmented-control__segment--disabled" : null].filter(Boolean).join(" ");
			const segment = /* @__PURE__ */ jsxs("button", {
				id: segmentId(option.value),
				type: "button",
				role: "radio",
				"aria-checked": isSelected ? "true" : "false",
				"aria-disabled": option.disabled ? "true" : void 0,
				tabIndex: isSelected ? 0 : -1,
				"data-part": "segment",
				className: segmentClasses,
				onClick: () => handleSegmentClick(option),
				children: [option.icon ? /* @__PURE__ */ jsx("span", {
					className: "ds-segmented-control__segment-icon",
					"data-part": "segmentIcon",
					children: /* @__PURE__ */ jsx(Icon, {
						name: option.icon,
						inline: true
					})
				}) : null, iconOnly ? null : /* @__PURE__ */ jsx("span", {
					className: "ds-segmented-control__segment-label",
					"data-part": "segmentLabel",
					children: option.label
				})]
			}, iconOnly ? void 0 : option.value);
			return iconOnly ? /* @__PURE__ */ jsx(Tooltip, {
				content: option.label,
				describes: false,
				children: segment
			}, option.value) : segment;
		}), /* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			"data-part": "indicator",
			className: "ds-segmented-control__indicator",
			style: indicatorStyle
		})]
	});
};
//#endregion
//#region src/Listbox.tsx
/**
* copy.* — used verbatim; `{label}` is replaced by the accessible name. `selectedCount` is shown
* by the surrounding UI, not this component. The schema's `invalid` prop references `copy.invalid`,
* but no such key exists under `copy:` — treated as a state-only flag with no bundled message.
*/
const COPY$16 = {
	empty: "No options",
	required: "{label} is required.",
	loading: "Loading…"
};
const OVERRIDE_HOOK$3 = {
	border: "--ds-listbox-border",
	borderWidth: "--ds-listbox-border-width",
	radius: "--ds-listbox-radius",
	listPadding: "--ds-listbox-list-padding",
	optionPaddingBlock: "--ds-listbox-option-padding-block",
	optionPaddingInline: "--ds-listbox-option-padding-inline",
	optionGap: "--ds-listbox-option-gap",
	optionRadius: "--ds-listbox-option-radius",
	optionDescriptionSize: "--ds-listbox-option-description-size",
	optionSelectedWeight: "--ds-listbox-option-selected-weight",
	groupLabelSize: "--ds-listbox-group-label-size",
	groupLabelWeight: "--ds-listbox-group-label-weight",
	groupLabelPaddingBlock: "--ds-listbox-group-label-padding-block",
	fontFamily: "--ds-listbox-font-family",
	fontSize: "--ds-listbox-font-size",
	lineHeight: "--ds-listbox-line-height",
	disabledOpacity: "--ds-listbox-disabled-opacity"
};
function overridesToStyle$11(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$3[binding]] = cssVar(ref);
	}
	return style;
}
function isGroup$2(option) {
	return "group" in option;
}
/** Depth-first rows in document order, dropping group wrappers — the unit keyboard navigation and typeahead move over. */
function flattenRows$2(options) {
	const result = [];
	for (const option of options) if (isGroup$2(option)) result.push(...flattenRows$2(option.options));
	else result.push(option);
	return result;
}
function toArray$2(value) {
	return Array.isArray(value) ? value : [];
}
/**
* Listbox — Design Schema, category: input.
*
* When to use:
* Use a standalone Listbox when the options should stay visible: a settings picker with five to
* twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick
* any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side
* effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use
* Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a
* Listbox.
*/
const Listbox = function Listbox({ ref, label, labelledBy, options, multiple = false, value, defaultValue, selectionFollowsFocus = true, required = false, invalid = false, error, embedded = false, defaultActiveValue, loading = false, disabled = false, name, emptyMessage, maxVisible = "8", overrides, onChange, onActiveChange, onBlur, onFocus, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-listbox${generatedId}`);
	const errorId = `${id}-error`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const optionRefs = useRef(/* @__PURE__ */ new Map());
	const typeaheadRef = useRef({
		buffer: "",
		timer: null
	});
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue ?? (multiple ? [] : void 0));
	const selected = isControlled ? value : internalValue;
	const [activeValue, setActiveValueState] = useState(null);
	const isDisabled = disabled || (form?.disabled ?? false);
	const formError = name ? form?.errors[name] : void 0;
	const displayError = error ?? formError;
	const isInvalid = invalid || Boolean(displayError);
	const rows = useMemo(() => flattenRows$2(options), [options]);
	const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
	const maxVisibleKey = String(maxVisible);
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		selected,
		multiple
	});
	latest.current = {
		label,
		required,
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
				const { selected: current, multiple: isMultiple } = latest.current;
				if (isMultiple) {
					const values = toArray$2(current);
					return values.length > 0 ? values : void 0;
				}
				return typeof current === "string" ? current : void 0;
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, selected: current, multiple: isMultiple } = latest.current;
				const hasSelection = isMultiple ? toArray$2(current).length > 0 : current !== void 0;
				if (isRequired && !hasSelection) return COPY$16.required.replace("{label}", currentLabel);
				return null;
			},
			focus: () => rootRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const isSelected = (optionValue) => multiple ? toArray$2(selected).includes(optionValue) : selected === optionValue;
	const commitValue = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form && name && form.validate === "change") form.validateField(name);
	};
	const setActiveValue = (next) => {
		setActiveValueState(next);
		onActiveChange?.(next);
		if (next) optionRefs.current.get(next)?.scrollIntoView({ block: "nearest" });
	};
	const moveActive = (optionValue) => {
		setActiveValue(optionValue);
		if (!multiple && selectionFollowsFocus) commitValue(optionValue);
	};
	const toggleSelection = (optionValue) => {
		const current = toArray$2(selected);
		commitValue(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
	};
	const activateRow = (row) => {
		if (isDisabled || row.disabled) return;
		if (multiple) toggleSelection(row.value);
		else commitValue(row.value);
	};
	const handleTypeahead = (char, currentIndex) => {
		if (enabledRows.length === 0) return;
		const state = typeaheadRef.current;
		if (state.timer) clearTimeout(state.timer);
		state.buffer += char.toLowerCase();
		state.timer = setTimeout(() => {
			state.buffer = "";
		}, 500);
		const startIndex = currentIndex === -1 ? 0 : currentIndex;
		for (let offset = 1; offset <= enabledRows.length; offset++) {
			const candidate = enabledRows[(startIndex + offset) % enabledRows.length];
			if (candidate.label.toLowerCase().startsWith(state.buffer)) {
				moveActive(candidate.value);
				return;
			}
		}
		if (state.buffer.length > 1) {
			const single = state.buffer.slice(-1);
			for (let offset = 0; offset < enabledRows.length; offset++) {
				const candidate = enabledRows[(startIndex + offset) % enabledRows.length];
				if (candidate.label.toLowerCase().startsWith(single)) {
					state.buffer = single;
					moveActive(candidate.value);
					return;
				}
			}
		}
	};
	const handleKeyDown = (event) => {
		if (isDisabled || enabledRows.length === 0) return;
		const currentIndex = activeValue ? enabledRows.findIndex((row) => row.value === activeValue) : -1;
		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();
				const target = currentIndex === -1 ? enabledRows[0] : enabledRows[Math.min(currentIndex + 1, enabledRows.length - 1)];
				if (multiple && event.shiftKey) {
					setActiveValue(target.value);
					const current = toArray$2(selected);
					if (!current.includes(target.value)) commitValue([...current, target.value]);
				} else moveActive(target.value);
				break;
			}
			case "ArrowUp": {
				event.preventDefault();
				const target = currentIndex === -1 ? enabledRows[enabledRows.length - 1] : enabledRows[Math.max(currentIndex - 1, 0)];
				if (multiple && event.shiftKey) {
					setActiveValue(target.value);
					const current = toArray$2(selected);
					if (!current.includes(target.value)) commitValue([...current, target.value]);
				} else moveActive(target.value);
				break;
			}
			case "Home":
				event.preventDefault();
				moveActive(enabledRows[0].value);
				break;
			case "End":
				event.preventDefault();
				moveActive(enabledRows[enabledRows.length - 1].value);
				break;
			case " ":
				event.preventDefault();
				if (currentIndex !== -1) activateRow(enabledRows[currentIndex]);
				break;
			case "Enter":
				if (!multiple && currentIndex !== -1) {
					event.preventDefault();
					commitValue(enabledRows[currentIndex].value);
				}
				break;
			case "PageDown":
			case "PageUp": {
				event.preventDefault();
				const pageRows = maxVisibleKey === "all" ? enabledRows.length : Number(maxVisibleKey);
				const direction = event.key === "PageDown" ? 1 : -1;
				const base = currentIndex === -1 ? direction === 1 ? -1 : enabledRows.length : currentIndex;
				const targetIndex = Math.min(Math.max(base + direction * pageRows, 0), enabledRows.length - 1);
				moveActive(enabledRows[targetIndex].value);
				break;
			}
			default: if (multiple && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
				event.preventDefault();
				const allValues = enabledRows.map((row) => row.value);
				const current = toArray$2(selected);
				const allSelected = allValues.length > 0 && allValues.every((v) => current.includes(v));
				commitValue(allSelected ? [] : allValues);
			} else if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) handleTypeahead(event.key, currentIndex);
		}
	};
	const handleBlur = (event) => {
		onBlur?.(event);
		if (form && name && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const handleFocus = (event) => {
		onFocus?.(event);
		if (activeValue !== null) return;
		const selectedRow = enabledRows.find((row) => isSelected(row.value));
		const preferred = defaultActiveValue && enabledRows.some((row) => row.value === defaultActiveValue) ? defaultActiveValue : (selectedRow ?? enabledRows[0])?.value;
		if (preferred) setActiveValue(preferred);
	};
	const handleRowPointerMove = (row) => {
		if (isDisabled || row.disabled || row.value === activeValue) return;
		setActiveValue(row.value);
	};
	const handleRowClick = (row) => (event) => {
		if (isDisabled || row.disabled) {
			event.preventDefault();
			return;
		}
		setActiveValue(row.value);
		activateRow(row);
	};
	const setRowRef = (rowValue) => (element) => {
		if (element) optionRefs.current.set(rowValue, element);
		else optionRefs.current.delete(rowValue);
	};
	const [maxHeight, setMaxHeight] = useState(void 0);
	useLayoutEffect(() => {
		if (maxVisibleKey === "all" || rows.length === 0) {
			setMaxHeight(void 0);
			return;
		}
		const firstRow = optionRefs.current.get(rows[0].value);
		const listEl = rootRef.current;
		if (!firstRow || !listEl) {
			setMaxHeight(void 0);
			return;
		}
		const rowHeight = firstRow.getBoundingClientRect().height;
		const gap = parseFloat(getComputedStyle(listEl).rowGap || "0");
		const visibleRows = Number(maxVisibleKey);
		setMaxHeight(`${visibleRows * rowHeight + Math.max(visibleRows - 1, 0) * gap}px`);
	}, [maxVisibleKey, rows]);
	const renderRow = (row) => {
		const optionId = `${id}-option-${row.value}`;
		const descriptionId = row.description ? `${optionId}-description` : void 0;
		const rowSelected = isSelected(row.value);
		const rowDisabled = isDisabled || row.disabled === true;
		const classes = [
			"ds-listbox__option",
			row.value === activeValue ? "ds-listbox__option--active" : null,
			rowSelected ? "ds-listbox__option--selected" : null,
			rowDisabled ? "ds-listbox__option--disabled" : null
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
				/* @__PURE__ */ jsx("span", {
					className: "ds-listbox__check",
					"data-part": "optionCheck",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "check",
						inline: true,
						overrides: { color: "color.control.selectedBackground" }
					})
				}),
				row.icon ? /* @__PURE__ */ jsx("span", {
					className: "ds-listbox__icon",
					"data-part": "optionIcon",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: row.icon,
						inline: true
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
	const renderNode = (node, path) => {
		if (isGroup$2(node)) {
			const groupLabelId = `${id}-group-${path}`;
			return /* @__PURE__ */ jsxs("div", {
				role: "group",
				"aria-labelledby": groupLabelId,
				"data-part": "group",
				className: "ds-listbox__group",
				children: [/* @__PURE__ */ jsx("div", {
					id: groupLabelId,
					"data-part": "groupLabel",
					className: "ds-listbox__group-label",
					children: node.group
				}), node.options.map((child, index) => renderNode(child, `${path}-${index}`))]
			}, `${path}-group`);
		}
		return renderRow(node);
	};
	const classes = [
		"ds-listbox",
		isDisabled ? "ds-listbox--disabled" : null,
		embedded ? "ds-listbox--embedded" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$11(overrides) : void 0;
	const heightStyle = maxHeight ? { maxBlockSize: maxHeight } : void 0;
	const mergedStyle = overrideStyle || heightStyle || style ? {
		...heightStyle,
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		id,
		"data-ds": "Listbox",
		"data-part": "list",
		role: "listbox",
		tabIndex: 0,
		"data-max-visible": maxVisibleKey,
		className: classes,
		style: mergedStyle,
		"aria-label": labelledBy ? void 0 : label,
		"aria-labelledby": labelledBy,
		"aria-multiselectable": multiple ? "true" : void 0,
		"aria-activedescendant": activeValue ? `${id}-option-${activeValue}` : void 0,
		"aria-invalid": isInvalid ? "true" : void 0,
		"aria-required": required ? "true" : void 0,
		"aria-busy": loading ? "true" : void 0,
		"aria-describedby": displayError ? errorId : void 0,
		onKeyDown: handleKeyDown,
		onBlur: handleBlur,
		onFocus: handleFocus,
		children: [rows.length === 0 ? /* @__PURE__ */ jsx("div", {
			className: "ds-listbox__empty",
			"data-part": "emptyState",
			children: /* @__PURE__ */ jsx(Text, {
				tone: "muted",
				size: "sm",
				children: loading ? COPY$16.loading : emptyMessage ?? COPY$16.empty
			})
		}) : options.map((node, index) => renderNode(node, String(index))), displayError ? /* @__PURE__ */ jsx("div", {
			className: "ds-listbox__error",
			"data-part": "errorMessage",
			children: /* @__PURE__ */ jsx(Text, {
				element: "span",
				id: errorId,
				role: "alert",
				size: "sm",
				tone: "danger",
				children: displayError
			})
		}) : null]
	});
};
//#endregion
//#region src/Select.tsx
/** copy.* — used verbatim; `{label}` is replaced by the visible label, `{count}` by the selection count. */
const COPY$15 = {
	placeholder: "Select…",
	selectedCount: "{count} selected",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
const ROOT_OVERRIDE_HOOK$13 = {
	triggerBorderFocus: "--ds-select-trigger-border-focus",
	triggerBorderInvalid: "--ds-select-trigger-border-invalid",
	triggerBorderWidth: "--ds-select-trigger-border-width",
	triggerRadius: "--ds-select-trigger-radius",
	triggerPaddingInline: "--ds-select-trigger-padding-inline",
	triggerPaddingBlock: "--ds-select-trigger-padding-block",
	triggerPaddingBlockSm: "--ds-select-trigger-padding-block-sm",
	triggerGap: "--ds-select-trigger-gap",
	partGap: "--ds-select-part-gap",
	fontFamily: "--ds-select-font-family",
	fontSize: "--ds-select-font-size",
	lineHeight: "--ds-select-line-height",
	minTargetSm: "--ds-select-min-target-sm",
	disabledOpacity: "--ds-select-disabled-opacity"
};
/**
* The popup is portaled, so its own bindings are set on the popup node itself, not inherited from
* the root. The composed Listbox renders `embedded` (it draws no surface/border/radius of its
* own), so `popupSurface`/`popupBorder`/`popupRadius` are drawn by this wrapper alone.
*/
const POPUP_OVERRIDE_HOOK$1 = {
	popupSurface: "--ds-select-popup-surface",
	popupBorder: "--ds-select-popup-border",
	popupShadow: "--ds-select-popup-shadow",
	popupRadius: "--ds-select-popup-radius",
	popupOffset: "--ds-select-popup-offset",
	layer: "--ds-select-layer",
	enter: "--ds-select-enter"
};
function resolveOverrides$4(overrides) {
	const rootStyle = {};
	const popupStyle = {};
	const labelOverrides = {};
	const descriptionOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "labelWeight") {
			labelOverrides.fontWeight = ref;
			continue;
		}
		if (binding === "helperSize") {
			descriptionOverrides.fontSize = ref;
			continue;
		}
		const rootHook = ROOT_OVERRIDE_HOOK$13[binding];
		if (rootHook) {
			rootStyle[rootHook] = cssVar(ref);
			continue;
		}
		const popupHook = POPUP_OVERRIDE_HOOK$1[binding];
		if (popupHook) popupStyle[popupHook] = cssVar(ref);
	}
	return {
		rootStyle,
		popupStyle,
		labelOverrides,
		descriptionOverrides
	};
}
const isDev$11 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$5() {
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
	return Array.isArray(value) ? value : [];
}
const FOCUSABLE_SELECTOR$5 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/** Moves focus to the next (or previous) document-order tabbable element relative to `anchor`, ignoring `exclude`. */
function focusAdjacent$1(anchor, exclude, direction) {
	if (!anchor) return;
	const all = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$5)).filter((element) => !exclude || !exclude.contains(element));
	const index = all.indexOf(anchor);
	if (index === -1) return;
	all[index + direction]?.focus();
}
/** Positions the popup below (or above, on overflow) the trigger, left-aligned and at least as wide as it. */
function computePosition$2(triggerRect, popupRect) {
	const viewportHeight = window.innerHeight;
	let vertical = "bottom";
	if (triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0) vertical = "top";
	const style = {
		left: triggerRect.left,
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
	if (multiple) {
		const values = toArray$1(selected);
		if (values.length === 0) return {
			text: placeholder,
			isPlaceholder: true
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
	if (typeof selected === "string" && selected !== "") return {
		text: labelFor(selected),
		isPlaceholder: false
	};
	return {
		text: placeholder,
		isPlaceholder: true
	};
}
/**
* Select — Design Schema, category: input.
*
* When to use:
* Use a Select for a form field with about seven to fifty options that people recognise on sight —
* country, role, status, time zone from a short list, a category. Use `multiple` for tags or
* memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms
* that must work without JavaScript. Use Combobox instead when the list is long enough that typing
* to filter is faster than scrolling, or when free text is allowed.
*/
const Select = function Select({ ref, label, name, options, value, defaultValue, placeholder, hideLabel = false, size = "md", open: openProp, multiple = false, description, required = false, disabled = false, invalid = false, error, native = "auto", container, overrides, onChange, onOpenChange, id: idProp, className, style, onClick: onClickProp, onKeyDown: onKeyDownProp, onFocus, onBlur, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-select${generatedId}`);
	const labelId = `${id}-label`;
	const valueId = `${id}-value`;
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
	const [internalValue, setInternalValue] = useState(defaultValue ?? (multiple ? [] : void 0));
	const selected = isControlled ? value : internalValue;
	const isOpenControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isOpenControlled ? openProp : internalOpen;
	const [activeValue, setActiveValue] = useState(null);
	const [popupStyle, setPopupStyle] = useState();
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isInvalid = invalid || resolvedError !== void 0;
	const rows = flattenRows$1(options);
	const resolvedPlaceholder = placeholder ?? COPY$15.placeholder;
	const { text: triggerText, isPlaceholder } = displayText(selected, rows, multiple, resolvedPlaceholder);
	if (isDev$11 && !label) console.warn("Select: `label` is required and becomes the trigger’s accessible name.");
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
				const { selected: current, multiple: isMultiple } = latest.current;
				if (isMultiple) {
					const values = toArray$1(current);
					return values.length > 0 ? values : void 0;
				}
				return typeof current === "string" && current !== "" ? current : void 0;
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, selected: current, multiple: isMultiple, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				const hasSelection = isMultiple ? toArray$1(current).length > 0 : typeof current === "string" && current !== "";
				if (isRequired && !hasSelection) return COPY$15.required.replace("{label}", currentLabel);
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
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	};
	const changeOpen = (next) => {
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};
	const openSelect = () => {
		if (open || isDisabled) return;
		changeOpen(true);
	};
	const closeSelect = (focusTrigger) => {
		if (!open) return;
		setActiveValue(null);
		if (focusTrigger) triggerRef.current?.focus();
		changeOpen(false);
	};
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
			setPopupStyle(result.style);
			setVertical(result.vertical);
		};
		reposition();
		listboxRef.current?.focus();
		if (prefersReducedMotion$5()) setEntered(true);
		else requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open]);
	useEffect(() => {
		if (!open) return void 0;
		const isOutside = (target) => !target || !popupRef.current?.contains(target) && !triggerRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (isOutside(event.target)) closeSelect(false);
		};
		const handleFocusOut = (event) => {
			if (isOutside(event.relatedTarget)) closeSelect(false);
		};
		const handleWindowBlur = () => closeSelect(false);
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		window.addEventListener("blur", handleWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [open]);
	const handleTriggerClick = (event) => {
		onClickProp?.(event);
		if (isDisabled) return;
		if (open) closeSelect(false);
		else openSelect();
	};
	const handleTriggerKeyDown = (event) => {
		onKeyDownProp?.(event);
		if (!open && !isDisabled && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
			event.preventDefault();
			openSelect();
		}
	};
	const handleListboxChange = (next) => {
		commitValue(next);
		if (!multiple) closeSelect(true);
	};
	const handlePopupKeyDown = (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			closeSelect(true);
			return;
		}
		if (event.key === "Tab") {
			event.preventDefault();
			if (!multiple && activeValue) commitValue(activeValue);
			const trigger = triggerRef.current;
			const popup = popupRef.current;
			closeSelect(false);
			focusAdjacent$1(trigger, popup, event.shiftKey ? -1 : 1);
			return;
		}
		if (event.key === "Enter" && multiple && activeValue) {
			event.preventDefault();
			const current = toArray$1(selected);
			commitValue(current.includes(activeValue) ? current.filter((v) => v !== activeValue) : [...current, activeValue]);
		}
	};
	const resolved = overrides ? resolveOverrides$4(overrides) : void 0;
	const mergedStyle = resolved?.rootStyle || style ? {
		...resolved?.rootStyle,
		...style
	} : void 0;
	const mergedPopupStyle = {
		...popupStyle,
		...resolved?.popupStyle
	};
	const classes = [
		"ds-select",
		`ds-select--${size}`,
		isInvalid ? "ds-select--invalid" : null,
		isDisabled ? "ds-select--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const labelClasses = ["ds-select__label", hideLabel ? "ds-select__visually-hidden" : null].filter(Boolean).join(" ");
	const labelNode = /* @__PURE__ */ jsx("label", {
		htmlFor: id,
		id: labelId,
		className: labelClasses,
		"data-part": "label",
		children: /* @__PURE__ */ jsxs(Text, {
			element: "span",
			weight: "medium",
			overrides: Object.keys(resolved?.labelOverrides ?? {}).length ? resolved.labelOverrides : void 0,
			children: [label, required ? /* @__PURE__ */ jsx("span", {
				className: "ds-select__required",
				children: COPY$15.requiredIndicator
			}) : null]
		})
	});
	const descriptionNode = description ? /* @__PURE__ */ jsx(Text, {
		element: "p",
		id: descriptionId,
		size: "sm",
		tone: "muted",
		"data-part": "description",
		overrides: Object.keys(resolved?.descriptionOverrides ?? {}).length ? resolved.descriptionOverrides : void 0,
		children: description
	}) : null;
	const errorNode = resolvedError ? /* @__PURE__ */ jsx(Text, {
		element: "span",
		id: errorId,
		role: "alert",
		size: "sm",
		tone: "danger",
		"data-part": "errorMessage",
		children: resolvedError
	}) : null;
	if (isNativeSelect) {
		const handleNativeChange = (event) => {
			const next = multiple ? Array.from(event.target.selectedOptions).map((option) => option.value) : event.target.value;
			commitValue(next);
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
		return /* @__PURE__ */ jsxs("div", {
			"data-ds": "Select",
			"data-ds-field": true,
			"data-part": "root",
			className: classes,
			style: mergedStyle,
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
						value,
						defaultValue,
						required,
						disabled: isDisabled,
						className: "ds-select__native",
						"data-part": "trigger",
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						onChange: handleNativeChange,
						onFocus,
						onBlur: handleNativeBlur,
						children: [!multiple ? /* @__PURE__ */ jsx("option", {
							value: "",
							disabled: true,
							children: resolvedPlaceholder
						}) : null, options.map((node, index) => renderNativeNode(node, String(index)))]
					}), /* @__PURE__ */ jsx("span", {
						className: "ds-select__chevron",
						"data-part": "chevron",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx(Icon, {
							name: "chevron-down",
							inline: true
						})
					})]
				}),
				errorNode
			]
		});
	}
	const popupClasses = ["ds-select__popup", entered ? "ds-select__popup--entered" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		"data-ds": "Select",
		"data-ds-field": true,
		"data-part": "root",
		className: classes,
		style: mergedStyle,
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
				"aria-labelledby": `${labelId} ${valueId}`,
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
					id: valueId,
					"data-part": "value",
					className: ["ds-select__value", isPlaceholder ? "ds-select__value--placeholder" : null].filter(Boolean).join(" "),
					children: triggerText
				}), /* @__PURE__ */ jsx("span", {
					className: "ds-select__chevron",
					"data-part": "chevron",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "chevron-down",
						inline: true
					})
				})]
			}),
			multiple ? toArray$1(selected).map((v) => /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: v,
				disabled: isDisabled
			}, v)) : typeof selected === "string" && selected !== "" ? /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: selected,
				disabled: isDisabled
			}) : null,
			errorNode,
			open ? createPortal(/* @__PURE__ */ jsx("div", {
				ref: popupRef,
				"data-part": "popup",
				"data-vertical": vertical,
				className: popupClasses,
				style: mergedPopupStyle,
				onKeyDown: handlePopupKeyDown,
				children: /* @__PURE__ */ jsx(Listbox, {
					ref: listboxRef,
					id: listboxId,
					label,
					labelledBy: labelId,
					options,
					multiple,
					value: selected,
					selectionFollowsFocus: false,
					embedded: true,
					defaultActiveValue: typeof selected === "string" ? selected || void 0 : toArray$1(selected)[0],
					disabled: isDisabled,
					onChange: handleListboxChange,
					onActiveChange: setActiveValue
				})
			}), container ?? document.body) : null
		]
	});
};
//#endregion
//#region src/Combobox.tsx
/** copy.* — used verbatim; `{label}`/`{value}`/`{count}` are replaced as noted per string. */
const COPY$14 = {
	empty: "No matches",
	loading: "Loading…",
	addCustom: "Add \"{value}\"",
	clearLabel: "Clear",
	toggleLabel: "Show options",
	removeChip: "Remove {label}",
	resultCount: "{count} results available",
	required: "{label} is required.",
	invalid: "{label} is not valid.",
	requiredIndicator: " (required)"
};
/** debounce for the live status region: `motion.duration.base` × 2 (the doc calls out ~500ms). Not itself a token. */
const STATUS_DEBOUNCE_MS = 500;
const ROOT_OVERRIDE_HOOK$12 = {
	fieldBorderFocus: "--ds-combobox-field-border-focus",
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
/** The popup is portaled, so its own bindings — and the ones its nested Listbox reads via the
* sanctioned CSS custom-property escape hatch — are set on the popup node itself. */
const POPUP_OVERRIDE_HOOK = {
	popupSurface: "--ds-combobox-popup-surface",
	popupBorder: "--ds-combobox-popup-border",
	popupShadow: "--ds-combobox-popup-shadow",
	popupRadius: "--ds-combobox-popup-radius",
	popupOffset: "--ds-combobox-popup-offset",
	layer: "--ds-combobox-layer",
	enter: "--ds-combobox-enter"
};
function resolveOverrides$3(overrides) {
	const rootStyle = {};
	const popupStyle = {};
	const labelOverrides = {};
	const descriptionOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "labelWeight") {
			labelOverrides.fontWeight = ref;
			continue;
		}
		if (binding === "helperSize") {
			descriptionOverrides.fontSize = ref;
			continue;
		}
		const rootHook = ROOT_OVERRIDE_HOOK$12[binding];
		if (rootHook) {
			rootStyle[rootHook] = cssVar(ref);
			continue;
		}
		const popupHook = POPUP_OVERRIDE_HOOK[binding];
		if (popupHook) popupStyle[popupHook] = cssVar(ref);
	}
	return {
		rootStyle,
		popupStyle,
		labelOverrides,
		descriptionOverrides
	};
}
const isDev$10 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$4() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
function isGroup(option) {
	return "group" in option;
}
/** Depth-first rows, dropping group wrappers — used to resolve a value to its label and to filter. */
function flattenRows(options) {
	const result = [];
	for (const option of options) if (isGroup(option)) result.push(...flattenRows(option.options));
	else result.push(option);
	return result;
}
/** Filters a (possibly grouped) option tree by a row predicate, dropping groups left empty. */
function filterTree(options, predicate) {
	const result = [];
	for (const option of options) if (isGroup(option)) {
		const children = filterTree(option.options, predicate);
		if (children.length > 0) result.push({
			group: option.group,
			options: children
		});
	} else if (predicate(option)) result.push(option);
	return result;
}
/** Case- and diacritic-insensitive comparison key. */
const DIACRITIC_MARKS = /* @__PURE__ */ new RegExp("[̀-ͯ]", "g");
function normalize(value) {
	return value.normalize("NFD").replace(DIACRITIC_MARKS, "").toLowerCase();
}
function toArray(value) {
	return Array.isArray(value) ? value : [];
}
function labelFor(value, rows) {
	return rows.find((row) => row.value === value)?.label ?? value;
}
const FOCUSABLE_SELECTOR$4 = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
/** Moves focus to the next (or previous) document-order tabbable element relative to `anchor`, ignoring `exclude`. */
function focusAdjacent(anchor, exclude, direction) {
	if (!anchor) return;
	const all = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR$4)).filter((element) => !exclude || !exclude.contains(element));
	const index = all.indexOf(anchor);
	if (index === -1) return;
	all[index + direction]?.focus();
}
/** Positions the popup below (or above, on overflow) the field, left-aligned and at least as wide as it. */
function computePosition$1(fieldRect, popupRect) {
	const viewportHeight = window.innerHeight;
	let vertical = "bottom";
	if (fieldRect.bottom + popupRect.height > viewportHeight && fieldRect.top - popupRect.height >= 0) vertical = "top";
	const style = {
		left: fieldRect.left,
		"--ds-combobox-field-width": `${fieldRect.width}px`
	};
	if (vertical === "bottom") style.top = fieldRect.bottom;
	else style.bottom = viewportHeight - fieldRect.top;
	return {
		style,
		vertical
	};
}
/**
* Combobox — Design Schema, category: input.
*
* When to use:
* Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be
* typed faster than found (dates, codes), for `async` search against a server, and for multi-value
* fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when
* new values are legitimate (tags, invitees by email) and never when the value must exist (a
* customer id). Use `filter: none` when the list is short but chips are wanted.
*
* Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use
* it as a search box that navigates to results. Do not use it to pick a date. Do not disable
* typing to get a Select; use Select.
*/
const Combobox = function Combobox({ ref, label, name, options, value, defaultValue, inputValue, multiple = false, allowCustom = false, filter = "contains", placeholder, description, required = false, disabled = false, invalid = false, error, loading = false, clearable = true, container, overrides, onChange, onInputChange, onOpenChange, id: idProp, className, style, onFocus, onBlur, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-combobox${generatedId}`);
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const statusId = `${id}-status`;
	const listboxId = `${id}-listbox`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const fieldRef = useRef(null);
	const popupRef = useRef(null);
	const listboxRef = useRef(null);
	const pendingForward = useRef(null);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue ?? (multiple ? [] : void 0));
	const selected = isControlled ? value : internalValue;
	const rows = useMemo(() => flattenRows(options), [options]);
	const isTextControlled = inputValue !== void 0;
	const [internalText, setInternalText] = useState(() => {
		if (multiple) return "";
		const initial = typeof defaultValue === "string" ? defaultValue : typeof value === "string" ? value : void 0;
		return initial ? labelFor(initial, rows) : "";
	});
	const text = isTextControlled ? inputValue : internalText;
	const [open, setOpen] = useState(false);
	const [activeValue, setActiveValue] = useState(null);
	const [forceFullList, setForceFullList] = useState(false);
	const [listboxGeneration, setListboxGeneration] = useState(0);
	const [popupStyle, setPopupStyle] = useState();
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	const [statusText, setStatusText] = useState("");
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isInvalid = invalid || resolvedError !== void 0;
	const isLoading = filter === "async" && loading;
	useEffect(() => {
		if (isTextControlled || multiple) return;
		if (typeof selected === "string" && selected !== "") setInternalText(labelFor(selected, rows));
	}, [selected]);
	if (isDev$10 && !label) console.warn("Combobox: `label` is required and becomes the input’s accessible name.");
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
				const { selected: current, multiple: isMultiple } = latest.current;
				if (isMultiple) {
					const values = toArray(current);
					return values.length > 0 ? values : void 0;
				}
				return typeof current === "string" && current !== "" ? current : void 0;
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, selected: current, multiple: isMultiple, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				const hasSelection = isMultiple ? toArray(current).length > 0 : typeof current === "string" && current !== "";
				if (isRequired && !hasSelection) return COPY$14.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$14.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	const commitValue = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	};
	const updateText = (next) => {
		if (!isTextControlled) setInternalText(next);
		onInputChange?.(next);
	};
	const changeOpen = (next) => {
		setOpen(next);
		onOpenChange?.(next);
	};
	const openList = () => {
		if (open || isDisabled) return;
		changeOpen(true);
	};
	const closeList = () => {
		if (!open) return;
		setActiveValue(null);
		changeOpen(false);
	};
	const normalizedQuery = normalize((forceFullList || filter === "none" ? "" : text).trim());
	const filteredTree = useMemo(() => {
		if (filter === "async" || filter === "none" || normalizedQuery === "") return options;
		const predicate = (row) => {
			const label = normalize(row.label);
			return filter === "startsWith" ? label.startsWith(normalizedQuery) : label.includes(normalizedQuery);
		};
		return filterTree(options, predicate);
	}, [
		options,
		filter,
		normalizedQuery
	]);
	const trimmedText = text.trim();
	const showCustomRow = allowCustom && trimmedText !== "" && !rows.some((row) => normalize(row.label) === normalize(trimmedText) || normalize(row.value) === normalize(trimmedText));
	const displayOptions = useMemo(() => {
		const tree = showCustomRow ? [{
			value: trimmedText,
			label: COPY$14.addCustom.replace("{value}", trimmedText)
		}, ...filteredTree] : filteredTree;
		if (isLoading) return [{
			value: "__loading__",
			label: COPY$14.loading,
			disabled: true
		}, ...tree];
		return tree;
	}, [
		filteredTree,
		showCustomRow,
		trimmedText,
		isLoading
	]);
	const displayRowCount = useMemo(() => flattenRows(filteredTree).length, [filteredTree]);
	useEffect(() => {
		if (!open) {
			setStatusText("");
			return;
		}
		const timer = setTimeout(() => {
			if (isLoading) setStatusText(COPY$14.loading);
			else if (displayRowCount === 0) setStatusText(COPY$14.empty);
			else setStatusText(COPY$14.resultCount.replace("{count}", String(displayRowCount)));
		}, STATUS_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [
		open,
		isLoading,
		displayRowCount
	]);
	useLayoutEffect(() => {
		if (!open) {
			setEntered(false);
			return;
		}
		const field = fieldRef.current;
		const popup = popupRef.current;
		if (!field || !popup) return void 0;
		const reposition = () => {
			const result = computePosition$1(field.getBoundingClientRect(), popup.getBoundingClientRect());
			setPopupStyle(result.style);
			setVertical(result.vertical);
		};
		reposition();
		if (pendingForward.current) {
			const key = pendingForward.current;
			pendingForward.current = null;
			listboxRef.current?.dispatchEvent(new KeyboardEvent("keydown", {
				key,
				bubbles: true,
				cancelable: true
			}));
		}
		if (prefersReducedMotion$4()) setEntered(true);
		else requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open, listboxGeneration]);
	useEffect(() => {
		if (!open) return void 0;
		const isOutside = (target) => !target || !popupRef.current?.contains(target) && !fieldRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (isOutside(event.target)) closeList();
		};
		const handleFocusOut = (event) => {
			if (isOutside(event.relatedTarget)) closeList();
		};
		const handleWindowBlur = () => closeList();
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		window.addEventListener("blur", handleWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [open]);
	/** Dispatches a native, bubbling keydown at the Listbox root so its internal active-option state
	* advances without DOM focus ever leaving the input; queued if the popup has not mounted yet. */
	const dispatchToListbox = (key) => {
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
	const toggleChip = (optionValue) => {
		const current = toArray(selected);
		commitValue(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
	};
	const commitCustomValue = (raw) => {
		if (multiple) {
			const current = toArray(selected);
			if (!current.includes(raw)) commitValue([...current, raw]);
			updateText("");
		} else {
			commitValue(raw);
			updateText(raw);
			closeList();
		}
	};
	const handleListboxChange = (next) => {
		if (multiple) {
			commitValue(next);
			updateText("");
			inputRef.current?.focus();
		} else {
			commitValue(next);
			updateText(labelFor(next, rows));
			closeList();
		}
	};
	const handleInputChange = (event) => {
		const raw = event.target.value;
		setForceFullList(false);
		setActiveValue(null);
		if (filter !== "none") setListboxGeneration((g) => g + 1);
		if (multiple && allowCustom && raw.includes(",")) {
			const parts = raw.split(",");
			const toCommit = parts.slice(0, -1).map((part) => part.trim()).filter(Boolean);
			const remainder = parts[parts.length - 1];
			if (toCommit.length > 0) {
				const next = [...toArray(selected)];
				for (const part of toCommit) if (!next.includes(part)) next.push(part);
				commitValue(next);
			}
			updateText(remainder);
		} else updateText(raw);
		openList();
	};
	const handleInputClick = () => {
		if (isDisabled) return;
		openList();
	};
	const handleFieldMouseDown = (event) => {
		if (event.target === event.currentTarget) inputRef.current?.focus();
	};
	const handleClear = () => {
		updateText("");
		if (multiple) commitValue([]);
		else commitValue("");
		inputRef.current?.focus();
	};
	const handleToggleClick = () => {
		if (isDisabled) return;
		if (open) {
			closeList();
			return;
		}
		setForceFullList(true);
		setListboxGeneration((g) => g + 1);
		openList();
		inputRef.current?.focus();
	};
	const handleRemoveChip = (chipValue) => {
		const current = toArray(selected);
		commitValue(current.filter((v) => v !== chipValue));
		inputRef.current?.focus();
	};
	const handleKeyDown = (event) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				openList();
				if (!event.altKey) dispatchToListbox("ArrowDown");
				break;
			case "ArrowUp":
				event.preventDefault();
				openList();
				dispatchToListbox("ArrowUp");
				break;
			case "Enter":
				if (!open) break;
				event.preventDefault();
				if (activeValue) {
					if (multiple) toggleChip(activeValue);
					else dispatchToListbox("Enter");
				} else if (allowCustom && trimmedText !== "") commitCustomValue(trimmedText);
				break;
			case "Escape":
				if (open) {
					event.preventDefault();
					closeList();
				} else if (clearable && text !== "") {
					event.preventDefault();
					updateText("");
				}
				break;
			case "Tab":
				if (open) {
					event.preventDefault();
					const anchor = inputRef.current;
					const popup = popupRef.current;
					closeList();
					focusAdjacent(anchor, popup, event.shiftKey ? -1 : 1);
				}
				break;
			case "Backspace": if (multiple && text === "") {
				const current = toArray(selected);
				if (current.length > 0) {
					event.preventDefault();
					commitValue(current.slice(0, -1));
				}
			}
		}
	};
	const resolved = overrides ? resolveOverrides$3(overrides) : void 0;
	const mergedStyle = resolved?.rootStyle || style ? {
		...resolved?.rootStyle,
		...style
	} : void 0;
	const mergedPopupStyle = {
		...popupStyle,
		...resolved?.popupStyle
	};
	const classes = [
		"ds-combobox",
		isInvalid ? "ds-combobox--invalid" : null,
		isDisabled ? "ds-combobox--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const describedBy = [
		description ? descriptionId : null,
		resolvedError ? errorId : null,
		statusId
	].filter(Boolean).join(" ");
	const chips = multiple ? toArray(selected).map((v) => ({
		value: v,
		label: labelFor(v, rows)
	})) : [];
	const hasValue = multiple ? chips.length > 0 : typeof selected === "string" && selected !== "";
	const showClear = clearable && !isDisabled && (hasValue || text !== "");
	const labelNode = /* @__PURE__ */ jsx("label", {
		htmlFor: id,
		id: labelId,
		className: "ds-combobox__label",
		"data-part": "label",
		children: /* @__PURE__ */ jsxs(Text, {
			element: "span",
			weight: "medium",
			overrides: Object.keys(resolved?.labelOverrides ?? {}).length ? resolved.labelOverrides : void 0,
			children: [label, required ? /* @__PURE__ */ jsx("span", {
				className: "ds-combobox__required",
				children: COPY$14.requiredIndicator
			}) : null]
		})
	});
	const descriptionNode = description ? /* @__PURE__ */ jsx(Text, {
		element: "p",
		id: descriptionId,
		size: "sm",
		tone: "muted",
		"data-part": "description",
		overrides: Object.keys(resolved?.descriptionOverrides ?? {}).length ? resolved.descriptionOverrides : void 0,
		children: description
	}) : null;
	const errorNode = resolvedError ? /* @__PURE__ */ jsx(Text, {
		element: "span",
		id: errorId,
		role: "alert",
		size: "sm",
		tone: "danger",
		"data-part": "errorMessage",
		children: resolvedError
	}) : null;
	const activeDescendant = open && activeValue ? `${listboxId}-option-${activeValue}` : void 0;
	const popupClasses = ["ds-combobox__popup", entered ? "ds-combobox__popup--entered" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		"data-ds": "Combobox",
		"data-part": "root",
		className: classes,
		style: mergedStyle,
		children: [
			labelNode,
			descriptionNode,
			/* @__PURE__ */ jsxs("div", {
				ref: fieldRef,
				className: "ds-combobox__field",
				"data-part": "field",
				onMouseDown: handleFieldMouseDown,
				children: [
					chips.map((chip) => /* @__PURE__ */ jsxs("span", {
						className: "ds-combobox__chip",
						"data-part": "chip",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ds-combobox__chip-label",
							children: chip.label
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							iconOnly: true,
							label: COPY$14.removeChip.replace("{label}", chip.label),
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "close",
								inline: true
							}),
							disabled: isDisabled,
							"data-part": "chipRemove",
							onClick: () => handleRemoveChip(chip.value)
						})]
					}, chip.value)),
					/* @__PURE__ */ jsx("input", {
						...rest,
						ref: inputRef,
						id,
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-expanded": open ? "true" : "false",
						"aria-controls": open ? listboxId : void 0,
						"aria-activedescendant": activeDescendant,
						"aria-haspopup": "listbox",
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						autoComplete: "off",
						"data-part": "input",
						className: "ds-combobox__input",
						value: text,
						placeholder: chips.length === 0 ? placeholder : void 0,
						readOnly: isDisabled ? true : rest.readOnly,
						onChange: handleInputChange,
						onClick: handleInputClick,
						onKeyDown: handleKeyDown,
						onFocus,
						onBlur
					}),
					showClear ? /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$14.clearLabel,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "close",
							inline: true,
							overrides: { color: "color.foreground.muted" }
						}),
						"data-part": "clearButton",
						onClick: handleClear
					}) : null,
					/* @__PURE__ */ jsx(Button, {
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
						"data-part": "toggleButton",
						onClick: handleToggleClick
					})
				]
			}),
			multiple ? chips.map((chip) => /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: chip.value,
				disabled: isDisabled
			}, chip.value)) : typeof selected === "string" && selected !== "" ? /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: selected,
				disabled: isDisabled
			}) : null,
			errorNode,
			/* @__PURE__ */ jsx("div", {
				id: statusId,
				"data-part": "status",
				role: "status",
				"aria-live": "polite",
				className: "ds-combobox__status",
				children: statusText
			}),
			open ? createPortal(/* @__PURE__ */ jsx("div", {
				ref: popupRef,
				"data-part": "popup",
				"data-vertical": vertical,
				className: popupClasses,
				style: mergedPopupStyle,
				children: /* @__PURE__ */ jsx(Listbox, {
					ref: listboxRef,
					id: listboxId,
					label,
					labelledBy: labelId,
					options: displayOptions,
					multiple,
					value: selected,
					selectionFollowsFocus: false,
					disabled: isDisabled,
					loading: isLoading,
					emptyMessage: isLoading ? COPY$14.loading : COPY$14.empty,
					onChange: handleListboxChange,
					onActiveChange: setActiveValue
				}, listboxGeneration)
			}), container ?? document.body) : null
		]
	});
};
//#endregion
//#region src/Accordion.tsx
const ROOT_OVERRIDE_HOOK$11 = { itemGap: "--ds-accordion-item-gap" };
/** triggerPaddingBlock/fontFamily/triggerFontSize/triggerFontWeight are Disclosure's own bindings; roomier padding than a lone Disclosure, since accordion triggers are section headings. */
const DEFAULT_DISCLOSURE_OVERRIDES = {
	triggerPaddingBlock: "space.md",
	triggerFontFamily: "font.family.body",
	triggerFontSize: "font.size.md",
	triggerFontWeight: "font.weight.medium"
};
/** divider/dividerWidth are the composed Divider's own bindings. */
const DEFAULT_DIVIDER_OVERRIDES = {
	color: "color.border",
	thickness: "border.width.thin"
};
const isDev$9 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function toIdArray(value) {
	if (value === void 0) return void 0;
	return Array.isArray(value) ? value : [value];
}
/** `exclusive` allows at most one open id; several passed via `value`/`defaultValue` keeps the first and warns about the rest. */
function resolveExclusiveIds(ids, exclusive, source) {
	if (!exclusive || ids.length <= 1) return ids;
	if (isDev$9) console.warn(`Accordion: \`exclusive\` allows one open section, but \`${source}\` had ${ids.length}: ${ids.join(", ")}. Opening "${ids[0]}"; the rest are ignored.`);
	return ids.slice(0, 1);
}
function firstEnabledIndex(items) {
	return items.findIndex((item) => !item.disabled);
}
function lastEnabledIndex(items) {
	for (let index = items.length - 1; index >= 0; index -= 1) if (!items[index].disabled) return index;
	return -1;
}
/**
* Accordion — Design Schema, category: container.
*
* When to use:
* Use an Accordion for a series of independent sections a user scans by heading and opens
* selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is
* optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are
* heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").
*/
const Accordion = function Accordion({ ref, items, headingLevel = "3", exclusive = false, value, defaultValue, divided = true, keepMounted = false, overrides, onChange, onOpenChange, className, style, ...rest }) {
	const triggerRefs = useRef(/* @__PURE__ */ new Map());
	const setTriggerRef = (id) => (el) => {
		if (el) triggerRefs.current.set(id, el);
		else triggerRefs.current.delete(id);
	};
	const isControlled = value !== void 0;
	const [internalOpenIds, setInternalOpenIds] = useState(() => resolveExclusiveIds(toIdArray(defaultValue) ?? [], exclusive, "defaultValue"));
	const openIds = isControlled ? resolveExclusiveIds(toIdArray(value) ?? [], exclusive, "value") : internalOpenIds;
	const mountedRef = useRef(false);
	const previousExternalRef = useRef(openIds);
	const lastEmittedRef = useRef(null);
	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			previousExternalRef.current = openIds;
			return;
		}
		if (!isControlled) return;
		const emitted = lastEmittedRef.current;
		lastEmittedRef.current = null;
		if (!(Boolean(emitted) && emitted.length === openIds.length && emitted.every((id) => openIds.includes(id)))) {
			const previous = previousExternalRef.current;
			for (const id of openIds) if (!previous.includes(id)) onOpenChange?.({
				id,
				open: true,
				reason: "controlled"
			});
			for (const id of previous) if (!openIds.includes(id)) onOpenChange?.({
				id,
				open: false,
				reason: "controlled"
			});
		}
		previousExternalRef.current = openIds;
	}, [openIds.join(","), isControlled]);
	const handleToggle = (id, open) => {
		const previous = openIds;
		const next = open ? exclusive ? [id] : previous.includes(id) ? previous : [...previous, id] : previous.filter((openId) => openId !== id);
		if (isControlled) lastEmittedRef.current = next;
		else setInternalOpenIds(next);
		onOpenChange?.({
			id,
			open,
			reason: "trigger"
		});
		if (open && exclusive) {
			for (const openId of previous) if (openId !== id) onOpenChange?.({
				id: openId,
				open: false,
				reason: "exclusive"
			});
		}
		onChange?.(next);
	};
	const handleKeyDown = (event) => {
		const { key } = event;
		if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
		const target = event.target;
		const currentIndex = items.findIndex((item) => triggerRefs.current.get(item.id) === target);
		if (currentIndex === -1) return;
		const focusAt = (index) => triggerRefs.current.get(items[index].id)?.focus();
		const findEnabled = (from, step) => {
			let index = from;
			for (let i = 0; i < items.length; i += 1) {
				index = (index + step + items.length) % items.length;
				if (!items[index].disabled) return index;
			}
			return -1;
		};
		let nextIndex = -1;
		switch (key) {
			case "ArrowDown":
				nextIndex = findEnabled(currentIndex, 1);
				break;
			case "ArrowUp":
				nextIndex = findEnabled(currentIndex, -1);
				break;
			case "Home":
				nextIndex = firstEnabledIndex(items);
				break;
			case "End": nextIndex = lastEnabledIndex(items);
		}
		if (nextIndex === -1) return;
		event.preventDefault();
		focusAt(nextIndex);
	};
	const disclosureOverrides = {
		...DEFAULT_DISCLOSURE_OVERRIDES,
		...overrides?.triggerPaddingBlock ? { triggerPaddingBlock: overrides.triggerPaddingBlock } : null,
		...overrides?.fontFamily ? { triggerFontFamily: overrides.fontFamily } : null,
		...overrides?.triggerFontSize ? { triggerFontSize: overrides.triggerFontSize } : null,
		...overrides?.triggerFontWeight ? { triggerFontWeight: overrides.triggerFontWeight } : null
	};
	const dividerOverrides = {
		...DEFAULT_DIVIDER_OVERRIDES,
		...overrides?.divider ? { color: overrides.divider } : null,
		...overrides?.dividerWidth ? { thickness: overrides.dividerWidth } : null
	};
	const rootOverrideStyle = {};
	for (const binding of Object.keys(ROOT_OVERRIDE_HOOK$11)) {
		const ref = overrides?.[binding];
		const hook = ROOT_OVERRIDE_HOOK$11[binding];
		if (ref && hook) rootOverrideStyle[hook] = cssVar(ref);
	}
	const mergedStyle = Object.keys(rootOverrideStyle).length || style ? {
		...rootOverrideStyle,
		...style
	} : void 0;
	const classes = ["ds-accordion", className ?? null].filter(Boolean).join(" ");
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
			onToggle: (open) => handleToggle(item.id, open),
			children: item.content
		}, item.id));
	});
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		"data-ds": "Accordion",
		"data-part": "list",
		className: classes,
		style: mergedStyle,
		onKeyDown: handleKeyDown,
		children
	});
};
//#endregion
//#region src/Slider.tsx
/** copy.* — used verbatim; `{label}`/`{low}`/`{high}` are replaced as noted. */
const COPY$13 = {
	minimumLabel: "{label} minimum",
	maximumLabel: "{label} maximum",
	rangeText: "{low} – {high}",
	required: "{label} is required.",
	invalid: "{label} is not valid."
};
/** Bindings owned by the root; fontSize/labelWeight/valueSize/helperSize/fontFamily/errorText are
* forwarded into the composed Text elements' own `overrides` contract instead, since Text already
* exposes them (the same split Meter and RadioGroup use). */
const ROOT_OVERRIDE_HOOK$10 = {
	track: "--ds-slider-track",
	trackHeight: "--ds-slider-track-height",
	trackRadius: "--ds-slider-track-radius",
	thumb: "--ds-slider-thumb",
	thumbBorderWidth: "--ds-slider-thumb-border-width",
	thumbSize: "--ds-slider-thumb-size",
	thumbShadow: "--ds-slider-thumb-shadow",
	thumbActiveScale: "--ds-slider-thumb-active-scale",
	mark: "--ds-slider-mark",
	markSize: "--ds-slider-mark-size",
	markLabelSize: "--ds-slider-mark-label-size",
	partGap: "--ds-slider-part-gap",
	trackPaddingBlock: "--ds-slider-track-padding-block",
	disabledOpacity: "--ds-slider-disabled-opacity",
	transition: "--ds-slider-transition"
};
function overridesToStyle$10(overrides) {
	const rootStyle = {};
	const labelTextOverrides = {};
	const descriptionTextOverrides = {};
	const valueTextOverrides = {};
	const errorTextOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const rootHook = ROOT_OVERRIDE_HOOK$10[binding];
		if (rootHook) {
			rootStyle[rootHook] = cssVar(ref);
			continue;
		}
		switch (binding) {
			case "fontFamily":
				labelTextOverrides.fontFamily = ref;
				descriptionTextOverrides.fontFamily = ref;
				valueTextOverrides.fontFamily = ref;
				errorTextOverrides.fontFamily = ref;
				break;
			case "fontSize":
				labelTextOverrides.fontSize = ref;
				break;
			case "labelWeight":
				labelTextOverrides.fontWeight = ref;
				break;
			case "valueSize":
				valueTextOverrides.fontSize = ref;
				break;
			case "helperSize":
				descriptionTextOverrides.fontSize = ref;
				errorTextOverrides.fontSize = ref;
				break;
			case "errorText": errorTextOverrides.color = ref;
		}
	}
	return {
		rootStyle,
		labelTextOverrides,
		descriptionTextOverrides,
		valueTextOverrides,
		errorTextOverrides
	};
}
const isDev$8 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/**
* Slider — Design Schema, category: input.
*
* When to use:
* Use a Slider for a bounded numeric value where approximate is fine and immediate feedback
* matters, and where the scale has meaning across its whole width. Use `range` for "between"
* filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it
* with a NumberInput (`showValue: never`) when exact entry also matters.
*/
const Slider = function Slider({ ref, label, name, min = 0, max = 100, step = 1, snapToMarks = false, required = false, invalid = false, value, defaultValue, range = false, formatValue, showValue = "always", marks, disabled = false, description, error, overrides, onChange, onChangeEnd, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-slider${generatedId}`);
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const minLabelId = `${id}-min-label`;
	const maxLabelId = `${id}-max-label`;
	const trackRef = useRef(null);
	const thumbRefs = useRef({
		single: null,
		min: null,
		max: null
	});
	const validRange = max > min;
	useEffect(() => {
		if (isDev$8 && !validRange) console.warn(`Slider: \`max\` (${max}) must be greater than \`min\` (${min}).`);
	}, [
		validRange,
		min,
		max
	]);
	const effectiveDefault = defaultValue ?? (range ? [min, max] : min);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(effectiveDefault);
	const current = isControlled ? value : internalValue;
	const latestValueRef = useRef(current);
	latestValueRef.current = current;
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isInvalid = invalid || resolvedError !== void 0;
	const [draggingKey, setDraggingKey] = useState(null);
	const [focusedKey, setFocusedKey] = useState(null);
	const draggingRef = useRef(false);
	const activeIndexRef = useRef(null);
	const keyChangedRef = useRef(false);
	const resolvedFormatValue = formatValue ?? ((v) => String(v));
	const latest = useRef({
		label,
		disabled: isDisabled,
		required,
		invalid,
		error,
		effectiveDefault
	});
	latest.current = {
		label,
		disabled: isDisabled,
		required,
		invalid,
		error,
		effectiveDefault
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
				const v = latestValueRef.current;
				return Array.isArray(v) ? [String(v[0]), String(v[1])] : String(v);
			},
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp, effectiveDefault: currentDefault } = latest.current;
				if (errorProp !== void 0) return errorProp;
				const v = latestValueRef.current;
				const atDefault = Array.isArray(v) && Array.isArray(currentDefault) ? v[0] === currentDefault[0] && v[1] === currentDefault[1] : v === currentDefault;
				if (isRequired && atDefault) return COPY$13.required.replace("{label}", currentLabel);
				if (isInvalidProp) return COPY$13.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => (range ? thumbRefs.current.min : thumbRefs.current.single)?.focus()
		});
	}, [
		form,
		name,
		id,
		range
	]);
	function percentFor(v) {
		if (!validRange) return 0;
		return (Math.min(Math.max(v, min), max) - min) / (max - min) * 100;
	}
	function snapValue(raw) {
		const clamped = Math.min(Math.max(raw, min), max);
		if (!(step > 0)) return clamped;
		const steps = Math.round((clamped - min) / step);
		return Math.min(Math.max(min + steps * step, min), max);
	}
	function sortedMarkValues() {
		return marks && marks.length > 0 ? [...marks].map((m) => m.value).sort((a, b) => a - b) : [];
	}
	/** Nearest mark to `raw`; falls back to `step` snapping when there are no marks. */
	function snapToNearestMark(raw) {
		const values = sortedMarkValues();
		if (values.length === 0) return snapValue(raw);
		let nearest = values[0];
		let bestDistance = Math.abs(raw - nearest);
		for (const candidate of values) {
			const distance = Math.abs(raw - candidate);
			if (distance < bestDistance) {
				nearest = candidate;
				bestDistance = distance;
			}
		}
		return nearest;
	}
	/** Drag/click snapping: marks when `snapToMarks`, otherwise `step`. Keys always snap to `step` (see `handleThumbKeyDown`). */
	function snapForPointer(raw) {
		return snapToMarks ? snapToNearestMark(raw) : snapValue(raw);
	}
	function pageStep(from, direction) {
		const values = sortedMarkValues();
		if (values.length === 0) return from + direction * step * 10;
		if (direction === 1) return values.find((v) => v > from) ?? values[values.length - 1];
		return [...values].reverse().find((v) => v < from) ?? values[0];
	}
	function commitValue(next) {
		if (!isControlled) setInternalValue(next);
		latestValueRef.current = next;
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	}
	function updateThumb(index, raw, snap = snapValue) {
		const snapped = snap(raw);
		if (index === null) {
			commitValue(snapped);
			return;
		}
		const [low, high] = Array.isArray(current) ? current : [min, max];
		commitValue(index === 0 ? [Math.min(snapped, high), high] : [low, Math.max(snapped, low)]);
	}
	const [lowValue, highValue] = range && Array.isArray(current) ? current : [min, max];
	const singleValue = !range && typeof current === "number" ? current : min;
	const thumbs = range ? [{
		key: "min",
		index: 0,
		value: lowValue,
		ariaMin: min,
		ariaMax: highValue,
		ariaLabelledBy: minLabelId
	}, {
		key: "max",
		index: 1,
		value: highValue,
		ariaMin: lowValue,
		ariaMax: max,
		ariaLabelledBy: maxLabelId
	}] : [{
		key: "single",
		index: null,
		value: singleValue,
		ariaMin: min,
		ariaMax: max,
		ariaLabelledBy: labelId
	}];
	const fillStartPercent = range ? percentFor(lowValue) : 0;
	const fillEndPercent = range ? percentFor(highValue) : percentFor(singleValue);
	function valueFromClientX(clientX) {
		const rail = trackRef.current;
		if (!rail) return min;
		const rect = rail.getBoundingClientRect();
		const rtl = getComputedStyle(rail).direction === "rtl";
		const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
		return min + Math.min(Math.max(rtl ? 1 - ratio : ratio, 0), 1) * (max - min);
	}
	function nearestThumbIndex(raw) {
		if (!range) return null;
		return Math.abs(raw - lowValue) <= Math.abs(raw - highValue) ? 0 : 1;
	}
	const handleBodyPointerDown = (event) => {
		if (isDisabled || event.button !== 0) return;
		event.preventDefault();
		const raw = valueFromClientX(event.clientX);
		const index = nearestThumbIndex(raw);
		activeIndexRef.current = index;
		draggingRef.current = true;
		const key = index === null ? "single" : index === 0 ? "min" : "max";
		setDraggingKey(key);
		updateThumb(index, raw, snapForPointer);
		event.currentTarget.setPointerCapture(event.pointerId);
		thumbRefs.current[key]?.focus();
	};
	const handleBodyPointerMove = (event) => {
		if (!draggingRef.current) return;
		updateThumb(activeIndexRef.current, valueFromClientX(event.clientX), snapForPointer);
	};
	const handleBodyPointerUp = (event) => {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		setDraggingKey(null);
		onChangeEnd?.(latestValueRef.current);
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
	};
	const handleThumbKeyDown = (descriptor) => (event) => {
		if (isDisabled) return;
		let next;
		switch (event.key) {
			case "ArrowRight":
			case "ArrowUp":
				next = descriptor.value + step;
				break;
			case "ArrowLeft":
			case "ArrowDown":
				next = descriptor.value - step;
				break;
			case "PageUp":
				next = pageStep(descriptor.value, 1);
				break;
			case "PageDown":
				next = pageStep(descriptor.value, -1);
				break;
			case "Home":
				next = min;
				break;
			case "End":
				next = max;
				break;
			default: return;
		}
		event.preventDefault();
		updateThumb(descriptor.index, next);
		keyChangedRef.current = true;
	};
	const handleThumbKeyUp = () => {
		if (keyChangedRef.current) {
			keyChangedRef.current = false;
			onChangeEnd?.(latestValueRef.current);
			if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
		}
	};
	const handleThumbFocus = (key) => () => setFocusedKey(key);
	const handleThumbBlur = () => setFocusedKey(null);
	const setThumbRef = (key) => (el) => {
		thumbRefs.current[key] = el;
	};
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const { rootStyle, labelTextOverrides, descriptionTextOverrides, valueTextOverrides, errorTextOverrides } = overrides ? overridesToStyle$10(overrides) : {
		rootStyle: void 0,
		labelTextOverrides: void 0,
		descriptionTextOverrides: void 0,
		valueTextOverrides: void 0,
		errorTextOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const classes = [
		"ds-slider",
		isDisabled ? "ds-slider--disabled" : null,
		isInvalid ? "ds-slider--invalid" : null,
		className ?? null
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		id,
		"data-ds": "Slider",
		className: classes,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-slider__header",
				children: [/* @__PURE__ */ jsx(Text, {
					element: "span",
					id: labelId,
					"data-part": "label",
					weight: "medium",
					className: "ds-slider__label",
					overrides: labelTextOverrides,
					children: label
				}), showValue === "always" ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					"data-part": "valueText",
					size: "sm",
					className: "ds-slider__value",
					overrides: valueTextOverrides,
					children: range ? COPY$13.rangeText.replace("{low}", resolvedFormatValue(lowValue)).replace("{high}", resolvedFormatValue(highValue)) : resolvedFormatValue(singleValue)
				}) : null]
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-slider__description",
				overrides: descriptionTextOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-slider__body",
				onPointerDown: handleBodyPointerDown,
				onPointerMove: handleBodyPointerMove,
				onPointerUp: handleBodyPointerUp,
				onPointerCancel: handleBodyPointerUp,
				children: [
					/* @__PURE__ */ jsx("div", {
						ref: trackRef,
						className: "ds-slider__track",
						"data-part": "track",
						children: /* @__PURE__ */ jsx("div", {
							className: "ds-slider__fill",
							"data-part": "fill",
							style: {
								insetInlineStart: `${fillStartPercent}%`,
								inlineSize: `${fillEndPercent - fillStartPercent}%`
							}
						})
					}),
					marks && marks.length > 0 ? /* @__PURE__ */ jsx("div", {
						className: "ds-slider__marks",
						"data-part": "tickMarks",
						"aria-hidden": "true",
						children: marks.map((mark) => /* @__PURE__ */ jsx("span", {
							className: "ds-slider__mark",
							style: { insetInlineStart: `${percentFor(mark.value)}%` },
							children: mark.label ? /* @__PURE__ */ jsx("span", {
								className: "ds-slider__mark-label",
								children: mark.label
							}) : null
						}, mark.value))
					}) : null,
					thumbs.map((descriptor) => {
						const showBubble = showValue === "hover" && (draggingKey === descriptor.key || focusedKey === descriptor.key);
						const thumbClasses = ["ds-slider__thumb", draggingKey === descriptor.key ? "ds-slider__thumb--active" : null].filter(Boolean).join(" ");
						return /* @__PURE__ */ jsxs("div", {
							ref: setThumbRef(descriptor.key),
							role: "slider",
							tabIndex: 0,
							"data-part": "thumb",
							className: thumbClasses,
							style: { insetInlineStart: `${percentFor(descriptor.value)}%` },
							"aria-valuenow": descriptor.value,
							"aria-valuemin": descriptor.ariaMin,
							"aria-valuemax": descriptor.ariaMax,
							"aria-valuetext": resolvedFormatValue(descriptor.value),
							"aria-labelledby": descriptor.ariaLabelledBy,
							"aria-orientation": "horizontal",
							"aria-disabled": isDisabled ? "true" : void 0,
							"aria-describedby": describedBy || void 0,
							onKeyDown: handleThumbKeyDown(descriptor),
							onKeyUp: handleThumbKeyUp,
							onFocus: handleThumbFocus(descriptor.key),
							onBlur: handleThumbBlur,
							children: [/* @__PURE__ */ jsx("span", {
								className: "ds-slider__thumb-knob",
								"aria-hidden": "true"
							}), showBubble ? /* @__PURE__ */ jsx("span", {
								className: "ds-slider__bubble",
								"data-part": "valueText",
								children: resolvedFormatValue(descriptor.value)
							}) : null]
						}, descriptor.key);
					})
				]
			}),
			range ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
				id: minLabelId,
				className: "ds-slider__visually-hidden",
				children: COPY$13.minimumLabel.replace("{label}", label)
			}), /* @__PURE__ */ jsx("span", {
				id: maxLabelId,
				className: "ds-slider__visually-hidden",
				children: COPY$13.maximumLabel.replace("{label}", label)
			})] }) : null,
			range ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(lowValue),
				disabled: isDisabled
			}), /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(highValue),
				disabled: isDisabled
			})] }) : /* @__PURE__ */ jsx("input", {
				type: "hidden",
				name,
				value: String(singleValue),
				disabled: isDisabled
			}),
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-slider__error",
				overrides: errorTextOverrides,
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/NumberInput.tsx
/** copy.* — used verbatim; `{label}`/`{min}`/`{max}` are replaced as noted. */
const COPY$12 = {
	increment: "Increase",
	decrement: "Decrease",
	required: "{label} is required.",
	invalid: "{label} must be a number.",
	outOfRange: "{label} must be between {min} and {max}.",
	currencyMissing: "format \"currency\" needs a currency code.",
	requiredIndicator: " (required)"
};
const isDev$7 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** Bindings owned by the root; labelWeight/helperSize are forwarded entirely into the composed
* Text elements' own `overrides` instead (the split Meter, RadioGroup and Slider use), and
* fontFamily/lineHeight are forwarded to Text *and* kept on the root for the raw `<input>`, which
* has no Text of its own. `fontSize` stays root-only: it tracks the field's own `size` prop, not
* the label's. */
const ROOT_OVERRIDE_HOOK$9 = {
	borderFocus: "--ds-number-input-border-focus",
	borderInvalid: "--ds-number-input-border-invalid",
	borderWidth: "--ds-number-input-border-width",
	radius: "--ds-number-input-radius",
	paddingInline: "--ds-number-input-padding-inline",
	paddingBlock: "--ds-number-input-padding-block",
	paddingBlockSm: "--ds-number-input-padding-block-sm",
	paddingInlineSm: "--ds-number-input-padding-inline-sm",
	affixGap: "--ds-number-input-affix-gap",
	stepperGap: "--ds-number-input-stepper-gap",
	stepperDivider: "--ds-number-input-stepper-divider",
	partGap: "--ds-number-input-part-gap",
	minTargetSm: "--ds-number-input-min-target-sm",
	disabledOpacity: "--ds-number-input-disabled-opacity"
};
function resolveOverrides$2(overrides) {
	const rootStyle = {};
	const labelOverrides = {};
	const descriptionOverrides = {};
	const errorOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		switch (binding) {
			case "labelWeight":
				labelOverrides.fontWeight = ref;
				break;
			case "helperSize":
				descriptionOverrides.fontSize = ref;
				errorOverrides.fontSize = ref;
				break;
			case "fontFamily":
				rootStyle["--ds-number-input-font-family"] = cssVar(ref);
				labelOverrides.fontFamily = ref;
				descriptionOverrides.fontFamily = ref;
				errorOverrides.fontFamily = ref;
				break;
			case "fontSize":
				rootStyle["--ds-number-input-font-size"] = cssVar(ref);
				break;
			case "lineHeight":
				rootStyle["--ds-number-input-line-height"] = cssVar(ref);
				labelOverrides.lineHeight = ref;
				descriptionOverrides.lineHeight = ref;
				errorOverrides.lineHeight = ref;
				break;
			default: {
				const hook = ROOT_OVERRIDE_HOOK$9[binding];
				if (hook) rootStyle[hook] = cssVar(ref);
			}
		}
	}
	return {
		rootStyle,
		labelOverrides,
		descriptionOverrides,
		errorOverrides
	};
}
/** The environment's decimal separator, used (alongside a literal `.`) to parse typed input. */
const DECIMAL_SEPARATOR = (() => {
	if (typeof Intl === "undefined") return ".";
	return new Intl.NumberFormat().formatToParts(1.1).find((p) => p.type === "decimal")?.value ?? ".";
})();
/** hold-to-repeat initial delay/interval: `motion.duration.base`/`motion.duration.fast`,
* hardcoded because a component cannot read the active theme's resolved token value at runtime
* without measuring the DOM (same reasoning as Tooltip's DEFAULT_DELAY_MS). */
const REPEAT_START_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 80;
function decimalsInStep(step) {
	if (!Number.isFinite(step)) return 0;
	const str = String(step);
	const dot = str.indexOf(".");
	return dot === -1 ? 0 : str.length - dot - 1;
}
function roundTo(num, digits) {
	const factor = 10 ** Math.max(digits, 0);
	return Math.round(num * factor) / factor;
}
/** Strips everything but digits, a leading minus, and either `.` or the locale's decimal separator. */
function parseTypedValue(raw) {
	const trimmed = raw.trim();
	if (trimmed === "") return void 0;
	let cleaned = "";
	for (const ch of trimmed) if (ch >= "0" && ch <= "9") cleaned += ch;
	else if (ch === "-" && cleaned === "") cleaned += ch;
	else if (ch === "." || ch === DECIMAL_SEPARATOR) cleaned += ".";
	if (cleaned === "" || cleaned === "-") return void 0;
	const num = Number(cleaned);
	return Number.isNaN(num) ? void 0 : num;
}
function formatDisplayValue(num, format, fractionDigits, currency, unit) {
	const base = {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	};
	switch (format) {
		case "currency": return new Intl.NumberFormat(void 0, {
			...base,
			style: "currency",
			currency: currency || "USD"
		}).format(num);
		case "percent": return new Intl.NumberFormat(void 0, {
			...base,
			style: "percent"
		}).format(num / 100);
		case "unit":
			if (unit) try {
				return new Intl.NumberFormat(void 0, {
					...base,
					style: "unit",
					unit,
					unitDisplay: "short"
				}).format(num);
			} catch {}
			return new Intl.NumberFormat(void 0, base).format(num);
		default: return new Intl.NumberFormat(void 0, base).format(num);
	}
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
const NumberInput = function NumberInput({ ref, label, name, value, defaultValue, min, max, step = 1, precision, format = "decimal", currency, unit, leadingText, trailingText, hideSteppers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, invalid = false, error, overrides, onChange, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-number-input${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const resolvedPrecision = precision ?? decimalsInStep(step);
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const committedValue = isControlled ? value : internalValue;
	const [displayText, setDisplayText] = useState(() => committedValue === void 0 ? "" : formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit));
	const [isFocused, setIsFocused] = useState(false);
	const latestValueRef = useRef(committedValue);
	latestValueRef.current = committedValue;
	const wasClampedRef = useRef(false);
	useEffect(() => {
		if (isFocused) return;
		setDisplayText(committedValue === void 0 ? "" : formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit));
	}, [
		committedValue,
		isFocused,
		format,
		resolvedPrecision,
		currency,
		unit
	]);
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
			getValue: () => latestValueRef.current === void 0 ? void 0 : String(latestValueRef.current),
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
				if (errorProp !== void 0) return errorProp;
				if (isRequired && latestValueRef.current === void 0) return COPY$12.required.replace("{label}", currentLabel);
				if (wasClampedRef.current && min !== void 0 && max !== void 0) return COPY$12.outOfRange.replace("{label}", currentLabel).replace("{min}", String(min)).replace("{max}", String(max));
				if (isInvalidProp) return COPY$12.invalid.replace("{label}", currentLabel);
				return null;
			},
			focus: () => inputRef.current?.focus()
		});
	}, [
		form,
		name,
		id,
		min,
		max
	]);
	function applyValue(next, clamped = false) {
		if (!isControlled) setInternalValue(next);
		latestValueRef.current = next;
		wasClampedRef.current = clamped;
		setDisplayText(next === void 0 ? "" : formatDisplayValue(next, format, resolvedPrecision, currency, unit));
		onChange?.(next);
		if (form && form.validate === "change") form.validateField(name);
	}
	function stepBy(delta) {
		if (isDisabled) return;
		let next = latestValueRef.current === void 0 ? roundTo(delta > 0 ? min ?? 0 : max ?? 0, resolvedPrecision) : roundTo(latestValueRef.current + delta, resolvedPrecision);
		if (min !== void 0) next = Math.max(next, min);
		if (max !== void 0) next = Math.min(next, max);
		applyValue(next);
	}
	function setValueTo(target) {
		if (isDisabled) return;
		applyValue(roundTo(target, resolvedPrecision));
	}
	function commit() {
		if (isDisabled) return;
		const raw = latestValueRef.current;
		if (raw === void 0) {
			setDisplayText("");
			wasClampedRef.current = false;
			return;
		}
		let next = roundTo(raw, resolvedPrecision);
		let clamped = false;
		if (min !== void 0 && next < min) {
			next = min;
			clamped = true;
		}
		if (max !== void 0 && next > max) {
			next = max;
			clamped = true;
		}
		applyValue(next, clamped);
	}
	const repeatTimeoutRef = useRef(null);
	const repeatIntervalRef = useRef(null);
	function clearRepeat() {
		if (repeatTimeoutRef.current !== null) {
			window.clearTimeout(repeatTimeoutRef.current);
			repeatTimeoutRef.current = null;
		}
		if (repeatIntervalRef.current !== null) {
			window.clearInterval(repeatIntervalRef.current);
			repeatIntervalRef.current = null;
		}
	}
	useEffect(() => clearRepeat, []);
	function startRepeat(delta) {
		stepBy(delta);
		repeatTimeoutRef.current = window.setTimeout(() => {
			repeatIntervalRef.current = window.setInterval(() => stepBy(delta), REPEAT_INTERVAL_MS);
		}, REPEAT_START_DELAY_MS);
	}
	const handleInputChange = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const raw = event.target.value;
		setDisplayText(raw);
		const parsed = parseTypedValue(raw);
		if (!isControlled) setInternalValue(parsed);
		latestValueRef.current = parsed;
		wasClampedRef.current = false;
		onChange?.(parsed);
		if (form && form.validate === "change") form.validateField(name);
	};
	const handleFocus = (_event) => {
		setIsFocused(true);
	};
	const handleBlur = (_event) => {
		setIsFocused(false);
		commit();
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(name);
	};
	const handleKeyDown = (event) => {
		if (isDisabled) return;
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
					setValueTo(min);
				}
				break;
			case "End":
				if (max !== void 0) {
					event.preventDefault();
					setValueTo(max);
				}
				break;
			case "Enter": commit();
		}
	};
	if (isDev$7 && format === "currency" && !currency) console.warn(`NumberInput: ${COPY$12.currencyMissing}`);
	const atMin = min !== void 0 && committedValue !== void 0 && committedValue <= min;
	const atMax = max !== void 0 && committedValue !== void 0 && committedValue >= max;
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const isInvalid = invalid || resolvedError !== void 0;
	const ariaValueText = committedValue === void 0 ? void 0 : `${leadingText ?? ""}${formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit)}${trailingText ?? ""}`;
	const { rootStyle, labelOverrides, descriptionOverrides, errorOverrides } = overrides ? resolveOverrides$2(overrides) : {
		rootStyle: void 0,
		labelOverrides: void 0,
		descriptionOverrides: void 0,
		errorOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const classes = [
		"ds-number-input",
		`ds-number-input--${size}`,
		isDisabled ? "ds-number-input--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const fieldClasses = [
		"ds-number-input__field",
		isInvalid ? "ds-number-input__field--invalid" : null,
		isDisabled ? "ds-number-input__field--disabled" : null
	].filter(Boolean).join(" ");
	const labelWrapperClasses = ["ds-number-input__label-wrapper", hideLabel ? "ds-number-input__visually-hidden" : null].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "NumberInput",
		"data-ds-field": true,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsx("label", {
				className: labelWrapperClasses,
				htmlFor: id,
				children: /* @__PURE__ */ jsxs(Text, {
					element: "span",
					"data-part": "label",
					weight: "medium",
					className: "ds-number-input__label",
					overrides: labelOverrides,
					children: [label, required ? /* @__PURE__ */ jsx("span", {
						className: "ds-number-input__required",
						children: COPY$12.requiredIndicator
					}) : null]
				})
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				className: "ds-number-input__description",
				overrides: descriptionOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: fieldClasses,
				"data-part": "field",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "ds-number-input__control",
					children: [
						leadingText ? /* @__PURE__ */ jsx("span", {
							className: "ds-number-input__affix",
							"data-part": "prefix",
							"aria-hidden": "true",
							children: leadingText
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
							value: displayText,
							placeholder,
							"data-part": "input",
							className: "ds-number-input__input",
							"aria-valuenow": committedValue,
							"aria-valuemin": min,
							"aria-valuemax": max,
							"aria-valuetext": ariaValueText,
							"aria-describedby": describedBy || void 0,
							"aria-invalid": isInvalid ? "true" : void 0,
							"aria-required": required ? "true" : void 0,
							"aria-disabled": isDisabled ? "true" : void 0,
							readOnly: isDisabled ? true : rest.readOnly,
							onChange: handleInputChange,
							onFocus: handleFocus,
							onBlur: handleBlur,
							onKeyDown: handleKeyDown
						}),
						trailingText ? /* @__PURE__ */ jsx("span", {
							className: "ds-number-input__affix",
							"data-part": "suffix",
							"aria-hidden": "true",
							children: trailingText
						}) : null
					]
				}), !hideSteppers ? /* @__PURE__ */ jsxs("span", {
					className: "ds-number-input__steppers",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$12.decrement,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "minus",
							inline: true
						}),
						disabled: isDisabled || atMin,
						tabIndex: -1,
						"aria-hidden": "true",
						"data-part": "decrementButton",
						onPointerDown: (event) => {
							event.preventDefault();
							if (isDisabled || atMin) return;
							startRepeat(-step);
						},
						onPointerUp: clearRepeat,
						onPointerLeave: clearRepeat,
						onPointerCancel: clearRepeat
					}), /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$12.increment,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "plus",
							inline: true
						}),
						disabled: isDisabled || atMax,
						tabIndex: -1,
						"aria-hidden": "true",
						"data-part": "incrementButton",
						onPointerDown: (event) => {
							event.preventDefault();
							if (isDisabled || atMax) return;
							startRepeat(step);
						},
						onPointerUp: clearRepeat,
						onPointerLeave: clearRepeat,
						onPointerCancel: clearRepeat
					})]
				}) : null]
			}),
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				className: "ds-number-input__error",
				overrides: errorOverrides,
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/ProgressBar.tsx
const COPY$11 = {
	progress: "{label}: {value}",
	complete: "{label}: complete",
	indeterminate: "{label}: in progress"
};
/** Bindings owned by the root; the label/value sizing bindings are forwarded into the composed Text
* elements' own `overrides` contract instead, since Text already exposes them. */
const ROOT_OVERRIDE_HOOK$8 = {
	track: "--ds-progress-bar-track",
	trackHeight: "--ds-progress-bar-track-height",
	radius: "--ds-progress-bar-radius",
	partGap: "--ds-progress-bar-part-gap",
	transition: "--ds-progress-bar-transition",
	indeterminateLoop: "--ds-progress-bar-indeterminate-loop"
};
function overridesToStyle$9(overrides) {
	const rootStyle = {};
	const labelTextOverrides = {};
	const valueTextOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const rootHook = ROOT_OVERRIDE_HOOK$8[binding];
		if (rootHook) {
			rootStyle[rootHook] = cssVar(ref);
			continue;
		}
		switch (binding) {
			case "labelSize":
				labelTextOverrides.fontSize = ref;
				break;
			case "labelWeight":
				labelTextOverrides.fontWeight = ref;
				break;
			case "valueSize":
				valueTextOverrides.fontSize = ref;
				break;
			case "fontFamily":
				labelTextOverrides.fontFamily = ref;
				valueTextOverrides.fontFamily = ref;
				break;
			case "lineHeight":
				labelTextOverrides.lineHeight = ref;
				valueTextOverrides.lineHeight = ref;
		}
	}
	return {
		rootStyle,
		labelTextOverrides,
		valueTextOverrides
	};
}
const TONE_CLASS = {
	neutral: "ds-progress-bar--neutral",
	success: "ds-progress-bar--success",
	danger: "ds-progress-bar--danger"
};
/**
* ProgressBar — Design Schema, category: feedback.
*
* When to use:
* Use a ProgressBar for a task the interface started and can see through to the end: uploads,
* downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value`
* whenever the total is known; use the indeterminate form only until the total is known, then
* switch. Set `announce: milestones` for long tasks the user may leave and come back to;
* `complete` (the default) is right for anything under a minute.
*/
const ProgressBar = function ProgressBar({ ref, label, value, min = 0, max = 100, formatValue, showValue = true, hideLabel = false, tone = "neutral", announce = "complete", overrides, id: idProp, className, style, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-progress-bar${generatedId}`;
	const labelId = `${id}-label`;
	const determinate = typeof value === "number" && Number.isFinite(value);
	const validRange = max > min;
	const clamped = determinate && validRange ? Math.min(Math.max(value, min), max) : min;
	const percent = determinate && validRange ? (clamped - min) / (max - min) * 100 : 0;
	const resolvedFormatValue = formatValue ?? ((v, mn, mx) => `${Math.round((v - mn) / (mx - mn) * 100)}%`);
	const resolvedValueText = determinate ? resolvedFormatValue(clamped, min, max) : void 0;
	const [liveMessage, setLiveMessage] = useState("");
	const indeterminateAnnouncedRef = useRef(false);
	const completeAnnouncedRef = useRef(false);
	const lastMilestoneRef = useRef(0);
	useEffect(() => {
		if (announce === "none") return;
		if (!determinate) {
			if (!indeterminateAnnouncedRef.current) {
				indeterminateAnnouncedRef.current = true;
				setLiveMessage(COPY$11.indeterminate.replace("{label}", label));
			}
			return;
		}
		indeterminateAnnouncedRef.current = false;
		if (clamped >= max) {
			if (!completeAnnouncedRef.current) {
				completeAnnouncedRef.current = true;
				setLiveMessage(COPY$11.complete.replace("{label}", label));
			}
			return;
		}
		completeAnnouncedRef.current = false;
		if (announce === "milestones") {
			const milestone = Math.floor(percent / 25) * 25;
			if (milestone > lastMilestoneRef.current) {
				lastMilestoneRef.current = milestone;
				if (milestone > 0) setLiveMessage(COPY$11.progress.replace("{label}", label).replace("{value}", resolvedFormatValue(clamped, min, max)));
			}
		}
	}, [
		announce,
		determinate,
		clamped,
		min,
		max,
		percent,
		label
	]);
	const classes = [
		"ds-progress-bar",
		TONE_CLASS[tone],
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, labelTextOverrides, valueTextOverrides } = overrides ? overridesToStyle$9(overrides) : {
		rootStyle: void 0,
		labelTextOverrides: void 0,
		valueTextOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref,
		id,
		"data-ds": "ProgressBar",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-progress-bar__header",
				children: [/* @__PURE__ */ jsx(Text, {
					element: "span",
					id: labelId,
					"data-part": "label",
					size: "sm",
					weight: "medium",
					className: hideLabel ? "ds-progress-bar__visually-hidden" : "ds-progress-bar__label",
					overrides: labelTextOverrides,
					children: label
				}), showValue && determinate ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					"data-part": "valueText",
					size: "sm",
					tone: "muted",
					className: "ds-progress-bar__value",
					overrides: valueTextOverrides,
					children: resolvedValueText
				}) : null]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-progress-bar__track",
				"data-part": "track",
				role: "progressbar",
				"aria-labelledby": labelId,
				"aria-valuemin": min,
				"aria-valuemax": max,
				...determinate ? {
					"aria-valuenow": clamped,
					"aria-valuetext": resolvedValueText
				} : { "aria-busy": true },
				children: /* @__PURE__ */ jsx("div", {
					className: "ds-progress-bar__fill",
					"data-part": "fill",
					style: determinate ? { inlineSize: `${percent}%` } : void 0
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-progress-bar__visually-hidden",
				role: "status",
				"aria-live": "polite",
				children: liveMessage
			})
		]
	});
};
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
/** Bindings owned by the root; labelWeight/labelCurrentWeight/labelSize/descriptionSize are forwarded
* into the composed Text elements' own `overrides` instead, since Text already exposes them.
* fontFamily does both: it sets the root hook (for the indicator's own number/glyph) and forwards. */
const ROOT_OVERRIDE_HOOK$7 = {
	indicatorSize: "--ds-stepper-indicator-size",
	indicatorBackground: "--ds-stepper-indicator-background",
	indicatorBorderWidth: "--ds-stepper-indicator-border-width",
	indicatorFontSize: "--ds-stepper-indicator-font-size",
	indicatorFontWeight: "--ds-stepper-indicator-font-weight",
	connector: "--ds-stepper-connector",
	connectorWidth: "--ds-stepper-connector-width",
	stepHover: "--ds-stepper-step-hover",
	stepRadius: "--ds-stepper-step-radius",
	stepGap: "--ds-stepper-step-gap",
	partGap: "--ds-stepper-part-gap",
	transition: "--ds-stepper-transition",
	fontFamily: "--ds-stepper-font-family"
};
function overridesToStyle$8(overrides) {
	const rootStyle = {};
	const labelOverrides = {};
	const currentLabelOverrides = {};
	const descriptionOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const rootHook = ROOT_OVERRIDE_HOOK$7[binding];
		if (rootHook) rootStyle[rootHook] = cssVar(ref);
		switch (binding) {
			case "labelSize":
				labelOverrides.fontSize = ref;
				currentLabelOverrides.fontSize = ref;
				break;
			case "labelWeight":
				labelOverrides.fontWeight = ref;
				break;
			case "labelCurrentWeight":
				currentLabelOverrides.fontWeight = ref;
				break;
			case "descriptionSize":
				descriptionOverrides.fontSize = ref;
				break;
			case "fontFamily":
				labelOverrides.fontFamily = ref;
				currentLabelOverrides.fontFamily = ref;
				descriptionOverrides.fontFamily = ref;
		}
	}
	return {
		rootStyle,
		labelOverrides,
		currentLabelOverrides,
		descriptionOverrides
	};
}
function resolveStatus(step, index, currentIndex) {
	if (step.status) return step.status;
	if (currentIndex === -1) return "upcoming";
	if (index < currentIndex) return "complete";
	if (index === currentIndex) return "current";
	return "upcoming";
}
function isStepNavigable(status, navigable) {
	if (navigable === "none") return false;
	if (navigable === "all") return true;
	return status === "complete";
}
function statusWordFor(status) {
	if (status === "complete") return COPY$10.complete;
	if (status === "current") return COPY$10.current;
	if (status === "error") return COPY$10.error;
}
/**
* Stepper — Design Schema, category: navigation.
*
* When to use:
* Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen:
* checkout, account setup, a report builder, a multi-part application. Vertical with descriptions
* for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for
* short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without
* losing later ones (the container keeps the later steps' state).
*/
const Stepper = function Stepper({ ref, steps, current, orientation = "horizontal", navigable = "completed", compact = false, label = COPY$10.navLabel, overrides, onStepSelect, className, style, ...rest }) {
	const generatedId = useId();
	const currentIndex = steps.findIndex((step) => step.id === current);
	const total = steps.length;
	const classes = [
		"ds-stepper",
		`ds-stepper--${orientation}`,
		compact ? "ds-stepper--compact" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, labelOverrides, currentLabelOverrides, descriptionOverrides } = overrides ? overridesToStyle$8(overrides) : {
		rootStyle: void 0,
		labelOverrides: void 0,
		currentLabelOverrides: void 0,
		descriptionOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("nav", {
		...rest,
		ref,
		"data-ds": "Stepper",
		className: classes,
		style: mergedStyle,
		"aria-label": label,
		children: [/* @__PURE__ */ jsx("ol", {
			className: "ds-stepper__list",
			"data-part": "list",
			children: steps.map((step, index) => {
				const status = resolveStatus(step, index, currentIndex);
				const isCurrent = status === "current";
				const isLast = index === steps.length - 1;
				const stepIsNavigable = isStepNavigable(status, navigable);
				const statusWord = statusWordFor(status);
				const descriptionId = step.description ? `ds-stepper${generatedId}-description-${step.id}` : void 0;
				const statusId = !stepIsNavigable && statusWord ? `ds-stepper${generatedId}-status-${step.id}` : void 0;
				const numberedLabel = COPY$10.stepLabel.replace("{n}", String(index + 1)).replace("{label}", step.label);
				const accessibleLabel = statusWord ? `${numberedLabel}, ${statusWord}` : numberedLabel;
				const indicator = /* @__PURE__ */ jsxs("span", {
					className: "ds-stepper__indicatorWrap",
					children: [/* @__PURE__ */ jsx("span", {
						className: "ds-stepper__indicator",
						"data-part": "indicator",
						"aria-hidden": "true",
						children: status === "complete" ? /* @__PURE__ */ jsx(Icon, {
							name: "check",
							inline: true
						}) : status === "error" ? /* @__PURE__ */ jsx(Icon, {
							name: "danger",
							inline: true
						}) : index + 1
					}), !isLast && /* @__PURE__ */ jsx("span", {
						className: `ds-stepper__connector${status === "complete" ? " ds-stepper__connector--complete" : ""}`,
						"data-part": "connector",
						"aria-hidden": "true"
					})]
				});
				const labelText = /* @__PURE__ */ jsx(Text, {
					element: "span",
					"data-part": "label",
					size: "sm",
					weight: isCurrent ? "semibold" : "medium",
					tone: status === "upcoming" ? "muted" : "default",
					className: "ds-stepper__label",
					overrides: isCurrent ? currentLabelOverrides : labelOverrides,
					children: step.label
				});
				const descriptionText = step.description ? /* @__PURE__ */ jsx(Text, {
					element: "span",
					id: descriptionId,
					"data-part": "description",
					size: "xs",
					tone: "muted",
					className: "ds-stepper__description",
					overrides: descriptionOverrides,
					children: step.description
				}) : null;
				return /* @__PURE__ */ jsx("li", {
					className: `ds-stepper__item ds-stepper__item--${status}`,
					"data-part": "step",
					children: stepIsNavigable ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "ds-stepper__control ds-stepper__control--navigable",
						"aria-label": accessibleLabel,
						"aria-describedby": descriptionId,
						"aria-current": isCurrent ? "step" : void 0,
						onClick: () => onStepSelect?.(step.id),
						children: [indicator, /* @__PURE__ */ jsxs("span", {
							className: "ds-stepper__content",
							children: [labelText, descriptionText]
						})]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "ds-stepper__control",
						"aria-current": isCurrent ? "step" : void 0,
						children: [indicator, /* @__PURE__ */ jsxs("span", {
							className: "ds-stepper__content",
							children: [
								labelText,
								descriptionText,
								statusWord && /* @__PURE__ */ jsx("span", {
									id: statusId,
									className: "ds-stepper__visually-hidden",
									children: statusWord
								})
							]
						})]
					})
				}, step.id);
			})
		}), /* @__PURE__ */ jsx(Text, {
			element: "span",
			className: "ds-stepper__compactStatus",
			size: "sm",
			tone: "muted",
			children: COPY$10.stepOf.replace("{current}", String(Math.max(currentIndex, 0) + 1)).replace("{total}", String(total))
		})]
	});
};
//#endregion
//#region src/Search.tsx
/** copy.* — used verbatim; `{count}` is replaced by the suggestion count. */
const COPY$9 = {
	clear: "Clear search",
	submit: "Search",
	loading: "Loading suggestions",
	suggestionsCount: "{count} suggestions available",
	noSuggestions: "No suggestions"
};
const ROOT_OVERRIDE_HOOK$6 = {
	borderFocus: "--ds-search-border-focus",
	borderWidth: "--ds-search-border-width",
	radius: "--ds-search-radius",
	paddingInline: "--ds-search-padding-inline",
	paddingBlock: "--ds-search-padding-block",
	paddingBlockLg: "--ds-search-padding-block-lg",
	affixGap: "--ds-search-affix-gap",
	fontFamily: "--ds-search-font-family",
	fontSize: "--ds-search-font-size",
	lineHeight: "--ds-search-line-height",
	disabledOpacity: "--ds-search-disabled-opacity"
};
/** The suggestions popup is portaled, so its own hook — read by the sanctioned CSS custom-property escape hatch — is set on the popup node itself. */
function resolveOverrides$1(overrides) {
	const rootStyle = {};
	const popupStyle = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "suggestionsOffset") {
			popupStyle["--ds-search-suggestions-offset"] = cssVar(ref);
			continue;
		}
		rootStyle[ROOT_OVERRIDE_HOOK$6[binding]] = cssVar(ref);
	}
	return {
		rootStyle,
		popupStyle
	};
}
const isDev$6 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$3() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/** Positions the suggestions popup below (or above, on overflow) the field, left-aligned and at least as wide as it. */
function computePosition(fieldRect, popupRect) {
	const viewportHeight = window.innerHeight;
	let vertical = "bottom";
	if (fieldRect.bottom + popupRect.height > viewportHeight && fieldRect.top - popupRect.height >= 0) vertical = "top";
	const style = {
		left: fieldRect.left,
		"--ds-search-field-width": `${fieldRect.width}px`
	};
	if (vertical === "bottom") style.top = fieldRect.bottom;
	else style.bottom = viewportHeight - fieldRect.top;
	return {
		style,
		vertical
	};
}
/**
* Search — Design Schema, category: input.
*
* When to use:
* Use Search for free-text search over a site, an app, or a large dataset: the header search, a
* search page's main field, a "filter the list" field over more than a couple of dozen rows. Add
* `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for
* the one primary search so screen-reader users can jump to it.
*
* Do not use Search for a field that takes a specific value (an order number: Input), for choosing
* from a known list (Select or Combobox), or for a filter that applies instantly to a short list
* already on screen (an Input labelled "Filter" is honest about what it does). Do not put two
* search landmarks on a page.
*/
const Search = function Search({ ref, label, showLabel = false, name = "q", value, defaultValue, placeholder, action, suggestions, loading = false, landmark = true, size = "md", disabled = false, container, overrides, onChange, onSubmit, onClear, id: idProp, className, style, onFocus, onBlur, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-search${generatedId}`;
	const labelId = `${id}-label`;
	const statusId = `${id}-status`;
	const listboxId = `${id}-listbox`;
	const inputRef = useRef(null);
	useImperativeHandle(ref, () => inputRef.current, []);
	const fieldRef = useRef(null);
	const popupRef = useRef(null);
	const listboxRef = useRef(null);
	const pendingForward = useRef(null);
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const text = isControlled ? value : internalValue;
	const hasSuggestions = suggestions !== void 0;
	const suggestionRows = suggestions ?? [];
	const [open, setOpen] = useState(false);
	const [activeValue, setActiveValue] = useState(null);
	const [listboxGeneration, setListboxGeneration] = useState(0);
	const [popupPosition, setPopupPosition] = useState();
	const [vertical, setVertical] = useState("bottom");
	const [entered, setEntered] = useState(false);
	const [statusText, setStatusText] = useState("");
	if (isDev$6 && !label) console.warn("Search: `label` is required and becomes the field’s accessible name.");
	useEffect(() => {
		setActiveValue(null);
		setListboxGeneration((g) => g + 1);
	}, [suggestions]);
	useEffect(() => {
		if (!open || !hasSuggestions) {
			setStatusText("");
			return;
		}
		if (loading) setStatusText(COPY$9.loading);
		else if (suggestionRows.length === 0) setStatusText(COPY$9.noSuggestions);
		else setStatusText(COPY$9.suggestionsCount.replace("{count}", String(suggestionRows.length)));
	}, [
		open,
		hasSuggestions,
		loading,
		suggestionRows.length
	]);
	useLayoutEffect(() => {
		if (!open || !hasSuggestions) {
			setEntered(false);
			return;
		}
		const field = fieldRef.current;
		const popup = popupRef.current;
		if (!field || !popup) return void 0;
		const reposition = () => {
			const result = computePosition(field.getBoundingClientRect(), popup.getBoundingClientRect());
			setPopupPosition(result.style);
			setVertical(result.vertical);
		};
		reposition();
		if (pendingForward.current) {
			const key = pendingForward.current;
			pendingForward.current = null;
			listboxRef.current?.dispatchEvent(new KeyboardEvent("keydown", {
				key,
				bubbles: true,
				cancelable: true
			}));
		}
		if (prefersReducedMotion$3()) setEntered(true);
		else requestAnimationFrame(() => setEntered(true));
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [
		open,
		hasSuggestions,
		listboxGeneration
	]);
	useEffect(() => {
		if (!open) return void 0;
		const isOutside = (target) => !target || !popupRef.current?.contains(target) && !fieldRef.current?.contains(target);
		const handlePointerDown = (event) => {
			if (isOutside(event.target)) closeList();
		};
		const handleFocusOut = (event) => {
			if (isOutside(event.relatedTarget)) closeList();
		};
		const handleWindowBlur = () => closeList();
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusout", handleFocusOut);
		window.addEventListener("blur", handleWindowBlur);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusout", handleFocusOut);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [open]);
	const openList = () => {
		if (open || disabled || !hasSuggestions) return;
		setOpen(true);
	};
	const closeList = () => {
		if (!open) return;
		setActiveValue(null);
		setOpen(false);
	};
	/** Dispatches a native, bubbling keydown at the Listbox root so its internal active-option state
	* advances without DOM focus ever leaving the input; queued if the popup has not mounted yet. */
	const dispatchToListbox = (key) => {
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
	const updateText = (next) => {
		if (!isControlled) setInternalValue(next);
		onChange?.(next);
	};
	const submitQuery = (query) => {
		closeList();
		onSubmit?.(query);
		if (action) {
			const url = new URL(action, window.location.href);
			url.searchParams.set(name, query);
			window.location.assign(url.toString());
		}
	};
	const trySubmit = () => {
		if (disabled) return;
		if (open && activeValue) {
			const target = suggestionRows.find((row) => row.value === activeValue);
			if (target) {
				updateText(target.value);
				submitQuery(target.value);
				return;
			}
		}
		const trimmed = text.trim();
		if (trimmed === "") return;
		submitQuery(trimmed);
	};
	const handleClear = () => {
		updateText("");
		closeList();
		onClear?.();
		inputRef.current?.focus();
	};
	const handleFormSubmit = (event) => {
		event.preventDefault();
		trySubmit();
	};
	const handleInputChange = (event) => {
		updateText(event.target.value);
		setActiveValue(null);
		if (hasSuggestions) openList();
	};
	const handleInputClick = () => {
		if (hasSuggestions) openList();
	};
	const handleFocus = (event) => {
		onFocus?.(event);
		if (hasSuggestions) openList();
	};
	const handleListboxChange = (nextValue) => {
		const chosen = Array.isArray(nextValue) ? nextValue[0] : nextValue;
		if (chosen === void 0) return;
		updateText(chosen);
		submitQuery(chosen);
		inputRef.current?.focus();
	};
	const handleKeyDown = (event) => {
		switch (event.key) {
			case "Enter":
				event.preventDefault();
				trySubmit();
				break;
			case "Escape":
				event.preventDefault();
				if (open) closeList();
				else if (text !== "") handleClear();
				break;
			case "ArrowDown":
				if (!hasSuggestions) break;
				event.preventDefault();
				openList();
				dispatchToListbox("ArrowDown");
				break;
			case "ArrowUp": {
				if (!hasSuggestions || !open) break;
				event.preventDefault();
				const firstValue = suggestionRows[0]?.value;
				if (activeValue !== null && activeValue === firstValue) setActiveValue(null);
				else dispatchToListbox("ArrowUp");
				break;
			}
		}
	};
	const resolved = overrides ? resolveOverrides$1(overrides) : void 0;
	const mergedStyle = resolved?.rootStyle || style ? {
		...resolved?.rootStyle,
		...style
	} : void 0;
	const mergedPopupStyle = {
		...popupPosition,
		...resolved?.popupStyle
	};
	const classes = [
		"ds-search",
		`ds-search--${size}`,
		disabled ? "ds-search--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const showClear = text !== "";
	const showPopup = open && hasSuggestions;
	const activeDescendant = showPopup && activeValue ? `${listboxId}-option-${activeValue}` : void 0;
	const listboxOptions = suggestionRows.map((row) => ({
		value: row.value,
		label: row.label,
		description: row.description
	}));
	const popupClasses = ["ds-search__suggestions", entered ? "ds-search__suggestions--entered" : null].filter(Boolean).join(" ");
	const labelClasses = ["ds-search__label", showLabel ? null : "ds-search__visually-hidden"].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("form", {
		"data-ds": "Search",
		role: landmark ? "search" : void 0,
		className: classes,
		style: mergedStyle,
		onSubmit: handleFormSubmit,
		children: [
			/* @__PURE__ */ jsx("label", {
				htmlFor: id,
				id: labelId,
				"data-part": "label",
				className: labelClasses,
				children: /* @__PURE__ */ jsx(Text, {
					element: "span",
					weight: "medium",
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
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx(Icon, {
							name: "search",
							inline: true
						})
					}),
					/* @__PURE__ */ jsx("input", {
						...rest,
						ref: inputRef,
						id,
						name,
						type: "search",
						enterKeyHint: "search",
						autoComplete: "off",
						role: hasSuggestions ? "combobox" : void 0,
						"aria-autocomplete": hasSuggestions ? "list" : void 0,
						"aria-expanded": hasSuggestions ? showPopup ? "true" : "false" : void 0,
						"aria-controls": hasSuggestions ? listboxId : void 0,
						"aria-activedescendant": activeDescendant,
						"aria-describedby": statusId,
						"aria-disabled": disabled ? "true" : void 0,
						"data-part": "input",
						className: "ds-search__input",
						value: text,
						placeholder,
						readOnly: disabled ? true : rest.readOnly,
						onChange: handleInputChange,
						onClick: handleInputClick,
						onKeyDown: handleKeyDown,
						onFocus: handleFocus,
						onBlur
					}),
					showClear ? /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$9.clear,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "close",
							inline: true,
							overrides: { color: "color.foreground.muted" }
						}),
						disabled,
						"data-part": "clearButton",
						onClick: handleClear
					}) : null,
					action ? /* @__PURE__ */ jsx(Button, {
						type: "submit",
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: COPY$9.submit,
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "arrow-right",
							inline: true,
							overrides: { color: "color.foreground.muted" }
						}),
						disabled,
						"data-part": "submitButton"
					}) : null
				]
			}),
			/* @__PURE__ */ jsx("div", {
				id: statusId,
				"data-part": "status",
				role: "status",
				"aria-live": "polite",
				className: "ds-search__status",
				children: statusText
			}),
			showPopup ? createPortal(/* @__PURE__ */ jsx("div", {
				ref: popupRef,
				"data-part": "suggestions",
				"data-vertical": vertical,
				className: popupClasses,
				style: mergedPopupStyle,
				children: /* @__PURE__ */ jsx(Listbox, {
					ref: listboxRef,
					id: listboxId,
					label,
					labelledBy: labelId,
					options: listboxOptions,
					selectionFollowsFocus: false,
					disabled,
					emptyMessage: loading ? COPY$9.loading : COPY$9.noSuggestions,
					onChange: handleListboxChange,
					onActiveChange: setActiveValue
				}, listboxGeneration)
			}), container ?? document.body) : null
		]
	});
};
//#endregion
//#region src/DatePicker.tsx
/** copy.* — used verbatim; `{label}`/`{month}`/`{year}`/`{pattern}`/`{min}`/`{max}` are replaced as noted. */
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
	rangeOrder: "End date must be after the start date.",
	requiredIndicator: " (required)"
};
function interpolate$3(template, vars) {
	return Object.keys(vars).reduce((acc, key) => acc.split(`{${key}}`).join(vars[key]), template);
}
/**
* labelWeight/helperSize forward into the composed label/description Text's own overrides, like
* Select and NumberInput; monthTitleSize forwards into the composed month/year Select's own
* `fontSize` override — Select has no `fontWeight` override to forward monthTitleWeight into, so
* that binding only ever reaches the (non-rendering) root hook.
*/
const ROOT_OVERRIDE_HOOK$5 = {
	borderFocus: "--ds-date-picker-border-focus",
	borderInvalid: "--ds-date-picker-border-invalid",
	borderWidth: "--ds-date-picker-border-width",
	radius: "--ds-date-picker-radius",
	paddingInline: "--ds-date-picker-padding-inline",
	paddingBlock: "--ds-date-picker-padding-block",
	paddingBlockSm: "--ds-date-picker-padding-block-sm",
	paddingInlineSm: "--ds-date-picker-padding-inline-sm",
	calendarInset: "--ds-date-picker-calendar-inset",
	calendarGap: "--ds-date-picker-calendar-gap",
	daySize: "--ds-date-picker-day-size",
	dayGap: "--ds-date-picker-day-gap",
	dayRadius: "--ds-date-picker-day-radius",
	dayHover: "--ds-date-picker-day-hover",
	dayTodayBorderWidth: "--ds-date-picker-day-today-border-width",
	weekdaySize: "--ds-date-picker-weekday-size",
	weekdayWeight: "--ds-date-picker-weekday-weight",
	monthTitleSize: "--ds-date-picker-month-title-size",
	monthTitleWeight: "--ds-date-picker-month-title-weight",
	partGap: "--ds-date-picker-part-gap",
	fieldGap: "--ds-date-picker-field-gap",
	dayFontSize: "--ds-date-picker-day-font-size",
	minTargetSm: "--ds-date-picker-min-target-sm",
	disabledOpacity: "--ds-date-picker-disabled-opacity",
	transition: "--ds-date-picker-transition"
};
function resolveOverrides(overrides) {
	const rootStyle = {};
	const labelOverrides = {};
	const descriptionOverrides = {};
	const monthSelectOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		if (binding === "labelWeight") {
			labelOverrides.fontWeight = ref;
			continue;
		}
		if (binding === "helperSize") {
			descriptionOverrides.fontSize = ref;
			continue;
		}
		if (binding === "monthTitleSize") {
			monthSelectOverrides.fontSize = ref;
			rootStyle[ROOT_OVERRIDE_HOOK$5.monthTitleSize] = cssVar(ref);
			continue;
		}
		if (binding === "fontFamily") {
			rootStyle["--ds-date-picker-font-family"] = cssVar(ref);
			labelOverrides.fontFamily = ref;
			descriptionOverrides.fontFamily = ref;
			continue;
		}
		if (binding === "lineHeight") {
			rootStyle["--ds-date-picker-line-height"] = cssVar(ref);
			labelOverrides.lineHeight = ref;
			descriptionOverrides.lineHeight = ref;
			continue;
		}
		const hook = ROOT_OVERRIDE_HOOK$5[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
	}
	return {
		rootStyle,
		labelOverrides,
		descriptionOverrides,
		monthSelectOverrides
	};
}
const isDev$5 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function pad(value, length = 2) {
	return String(value).padStart(length, "0");
}
/** Parses `YYYY-MM-DD`, rejecting out-of-range values (e.g. `2026-02-30`). */
function parseISO(iso) {
	if (!iso) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
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
	return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
function addDays(iso, delta) {
	const p = parseISO(iso);
	return toISO(p.year, p.month, p.day + delta);
}
function addMonths(iso, delta) {
	const p = parseISO(iso);
	return toISO(p.year, p.month + delta, p.day);
}
function addYears(iso, delta) {
	const p = parseISO(iso);
	return toISO(p.year + delta, p.month, p.day);
}
function compareISO(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}
function todayISO() {
	const now = /* @__PURE__ */ new Date();
	return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}
function daysInMonth(year, month) {
	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
/** ISO 8601 firstDay (1=Monday…7=Sunday) → JS getDay() convention (0=Sunday…6=Saturday). */
function getFirstDayOfWeek(locale) {
	try {
		const resolvedLocale = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
		const localeObject = new Intl.Locale(resolvedLocale);
		const firstDay = localeObject.getWeekInfo?.().firstDay ?? localeObject.weekInfo?.firstDay;
		if (typeof firstDay === "number") return firstDay % 7;
	} catch {}
	return 0;
}
function getMonthNames(locale) {
	const formatter = new Intl.DateTimeFormat(locale, {
		month: "long",
		timeZone: "UTC"
	});
	return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(Date.UTC(2e3, month, 1))));
}
/** 2000-01-02 is a Sunday (UTC); walking forward from it yields every weekday in order. */
function getWeekdayNames(locale, firstDayOfWeek) {
	const shortFormatter = new Intl.DateTimeFormat(locale, {
		weekday: "short",
		timeZone: "UTC"
	});
	const fullFormatter = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		timeZone: "UTC"
	});
	return Array.from({ length: 7 }, (_, i) => {
		const date = new Date(Date.UTC(2e3, 0, 2 + (firstDayOfWeek + i) % 7));
		return {
			short: shortFormatter.format(date),
			full: fullFormatter.format(date)
		};
	});
}
function isoWeekNumber(iso) {
	const p = parseISO(iso);
	const date = new Date(Date.UTC(p.year, p.month, p.day));
	const dayNum = (date.getUTCDay() + 6) % 7;
	date.setUTCDate(date.getUTCDate() - dayNum + 3);
	const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
	const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
	return 1 + Math.round((date.getTime() - firstThursday.getTime()) / 6048e5);
}
function buildGridDays(year, month, firstDayOfWeek) {
	const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() - firstDayOfWeek + 7) % 7;
	const start = addDays(toISO(year, month, 1), -offset);
	return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
function getPatternTokens(locale) {
	const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2e3, 0, 2));
	const tokens = [];
	for (const part of parts) if (part.type === "month") tokens.push({ kind: "month" });
	else if (part.type === "day") tokens.push({ kind: "day" });
	else if (part.type === "year") tokens.push({ kind: "year" });
	else if (part.type === "literal") tokens.push({
		kind: "literal",
		value: part.value
	});
	return tokens;
}
function tokenText(token) {
	if (token.kind === "literal") return token.value;
	if (token.kind === "month") return "MM";
	if (token.kind === "day") return "DD";
	return "YYYY";
}
function patternPlaceholder(tokens) {
	return tokens.map(tokenText).join("");
}
/**
* Lenient typed-date parsing: separators are optional (either the pattern's own literals, typed
* verbatim, or one unbroken run of digits), and two-digit years are refused. Returns `undefined`
* for anything incomplete or invalid rather than throwing, so callers can treat it as "not yet".
*/
function parseTypedDate(raw, tokens) {
	const order = tokens.filter((t) => t.kind !== "literal");
	const groups = raw.split(/[^0-9]+/).filter(Boolean);
	let month;
	let day;
	let year;
	if (groups.length === order.length) order.forEach((token, i) => {
		if (token.kind === "month") month = groups[i];
		else if (token.kind === "day") day = groups[i];
		else year = groups[i];
	});
	else if (groups.length === 1) {
		const lengths = order.map((t) => t.kind === "year" ? 4 : 2);
		if (groups[0].length !== lengths.reduce((a, b) => a + b, 0)) return void 0;
		let cursor = 0;
		order.forEach((token, i) => {
			const slice = groups[0].slice(cursor, cursor + lengths[i]);
			cursor += lengths[i];
			if (token.kind === "month") month = slice;
			else if (token.kind === "day") day = slice;
			else year = slice;
		});
	} else return;
	if (!month || !day || !year || year.length !== 4) return void 0;
	const parsed = parseISO(`${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
	return parsed ? toISO(parsed.year, parsed.month, parsed.day) : void 0;
}
function formatTypedDate(iso, locale) {
	const p = parseISO(iso);
	return p ? new Intl.DateTimeFormat(locale).format(new Date(Date.UTC(p.year, p.month, p.day))) : "";
}
function formatFullDate(iso, locale) {
	const p = parseISO(iso);
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(p.year, p.month, p.day)));
}
function isDayDisabled(iso, min, max, isDateDisabled) {
	if (min && compareISO(iso, min) < 0) return true;
	if (max && compareISO(iso, max) > 0) return true;
	return isDateDisabled?.(iso) ?? false;
}
/** Steps in `delta`'s direction until an enabled day is found — "disabled days are skipped by keyboard movement". */
function stepToEnabled(from, delta, disabled, maxSteps = 1e3) {
	let candidate = delta(from);
	let steps = 0;
	while (disabled(candidate) && steps < maxSteps) {
		candidate = delta(candidate);
		steps += 1;
	}
	return candidate;
}
/**
* DatePicker — Design Schema, category: input.
*
* When to use:
* Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is
* faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever
* they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is
* possible instead of validating after the fact.
*/
const DatePicker = function DatePicker({ ref, label, name, value, defaultValue, open: openProp, range = false, min, max, isDateDisabled, locale, showWeekNumbers = false, placeholder, description, required = false, hideLabel = false, size = "md", disabled = false, error, container, overrides, onChange, onOpenChange, id: idProp, className, style, ...rest }) {
	const form = useFormContext();
	const generatedId = useId();
	const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-date-picker${generatedId}`);
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;
	const gridLabelId = `${id}-grid-label`;
	const startHiddenLabelId = `${id}-start-label`;
	const endHiddenLabelId = `${id}-end-label`;
	const isDisabled = disabled || (form?.disabled ?? false);
	const resolvedError = error ?? form?.errors[name];
	const isInvalid = resolvedError !== void 0;
	const patternTokens = useMemo(() => getPatternTokens(locale), [locale]);
	const resolvedPlaceholder = placeholder ?? patternPlaceholder(patternTokens);
	const firstDayOfWeek = useMemo(() => getFirstDayOfWeek(locale), [locale]);
	const monthNames = useMemo(() => getMonthNames(locale), [locale]);
	const weekdayNames = useMemo(() => getWeekdayNames(locale, firstDayOfWeek), [locale, firstDayOfWeek]);
	const startInputRef = useRef(null);
	const endInputRef = useRef(null);
	useImperativeHandle(ref, () => startInputRef.current, []);
	const isControlled = value !== void 0;
	const initialStart = defaultValue !== void 0 ? typeof defaultValue === "string" ? defaultValue : defaultValue.start : void 0;
	const initialEnd = defaultValue !== void 0 && typeof defaultValue !== "string" ? defaultValue.end : void 0;
	const [internalStart, setInternalStart] = useState(initialStart);
	const [internalEnd, setInternalEnd] = useState(initialEnd);
	const committedStart = isControlled ? typeof value === "string" ? value : value?.start : internalStart;
	const committedEnd = isControlled ? typeof value === "string" ? void 0 : value?.end : internalEnd;
	const latestStartRef = useRef(committedStart);
	latestStartRef.current = committedStart;
	const latestEndRef = useRef(committedEnd);
	latestEndRef.current = committedEnd;
	function applyStart(next) {
		if (!isControlled) setInternalStart(next);
		latestStartRef.current = next;
	}
	function applyEnd(next) {
		if (!isControlled) setInternalEnd(next);
		latestEndRef.current = next;
	}
	function fireChange() {
		const s = latestStartRef.current;
		const e = latestEndRef.current;
		onChange?.(range ? s && e ? {
			start: s,
			end: e
		} : void 0 : s);
		if (form && form.validate === "change") {
			form.validateField(name);
			if (range) form.validateField(`${name}-end`);
		}
	}
	const isOpenControlled = openProp !== void 0;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isOpenControlled ? openProp : internalOpen;
	const [pendingRangeStart, setPendingRangeStart] = useState(null);
	const [displayedMonth, setDisplayedMonth] = useState(() => {
		const p = parseISO(committedStart) ?? parseISO(todayISO());
		return {
			year: p.year,
			month: p.month
		};
	});
	const [focusedDate, setFocusedDate] = useState(() => committedStart ?? todayISO());
	const dayRefs = useRef(/* @__PURE__ */ new Map());
	const pendingFocusRef = useRef(open);
	function disabledCheck(iso) {
		return isDayDisabled(iso, min, max, isDateDisabled);
	}
	function retargetFocusedDate(nextYear, nextMonth) {
		setDisplayedMonth({
			year: nextYear,
			month: nextMonth
		});
		setFocusedDate((prev) => {
			const p = parseISO(prev);
			return toISO(nextYear, nextMonth, Math.min(p.day, daysInMonth(nextYear, nextMonth)));
		});
	}
	function moveFocusTo(iso) {
		const p = parseISO(iso);
		setFocusedDate(iso);
		setDisplayedMonth((prev) => prev.year === p.year && prev.month === p.month ? prev : {
			year: p.year,
			month: p.month
		});
		pendingFocusRef.current = true;
	}
	useLayoutEffect(() => {
		if (!pendingFocusRef.current) return;
		pendingFocusRef.current = false;
		dayRefs.current.get(focusedDate)?.focus();
	});
	function openCalendar(focusTarget) {
		const p = parseISO(focusTarget ?? committedStart ?? todayISO()) ?? parseISO(todayISO());
		setDisplayedMonth({
			year: p.year,
			month: p.month
		});
		setFocusedDate(toISO(p.year, p.month, p.day));
		pendingFocusRef.current = true;
		setPendingRangeStart(null);
		if (!isOpenControlled) setInternalOpen(true);
		onOpenChange?.(true);
	}
	function closeCalendar() {
		if (!isOpenControlled) setInternalOpen(false);
		setPendingRangeStart(null);
		onOpenChange?.(false);
	}
	function handlePopoverOpenChange(next, _reason) {
		if (next) openCalendar();
		else closeCalendar();
	}
	function handleSelectDay(iso) {
		if (disabledCheck(iso)) return;
		if (!range) {
			applyStart(iso);
			applyEnd(void 0);
			fireChange();
			closeCalendar();
			return;
		}
		if (pendingRangeStart === null) {
			setPendingRangeStart(iso);
			moveFocusTo(iso);
		} else if (compareISO(iso, pendingRangeStart) < 0) {
			setPendingRangeStart(iso);
			moveFocusTo(iso);
		} else {
			applyStart(pendingRangeStart);
			applyEnd(iso);
			fireChange();
			closeCalendar();
		}
	}
	function handleDayClick(iso) {
		moveFocusTo(iso);
		handleSelectDay(iso);
	}
	function handleToday() {
		handleDayClick(todayISO());
	}
	function handleClear() {
		applyStart(void 0);
		applyEnd(void 0);
		setPendingRangeStart(null);
		fireChange();
	}
	function handleDayKeyDown(event, iso) {
		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				moveFocusTo(stepToEnabled(iso, (d) => addDays(d, 1), disabledCheck));
				break;
			case "ArrowLeft":
				event.preventDefault();
				moveFocusTo(stepToEnabled(iso, (d) => addDays(d, -1), disabledCheck));
				break;
			case "ArrowDown":
				event.preventDefault();
				moveFocusTo(stepToEnabled(iso, (d) => addDays(d, 7), disabledCheck));
				break;
			case "ArrowUp":
				event.preventDefault();
				moveFocusTo(stepToEnabled(iso, (d) => addDays(d, -7), disabledCheck));
				break;
			case "Home": {
				event.preventDefault();
				const target = addDays(iso, -((new Date(Date.UTC(parseISO(iso).year, parseISO(iso).month, parseISO(iso).day)).getUTCDay() - firstDayOfWeek + 7) % 7));
				moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, 1), disabledCheck, 6) : target);
				break;
			}
			case "End": {
				event.preventDefault();
				const target = addDays(iso, 6 - (new Date(Date.UTC(parseISO(iso).year, parseISO(iso).month, parseISO(iso).day)).getUTCDay() - firstDayOfWeek + 7) % 7);
				moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, -1), disabledCheck, 6) : target);
				break;
			}
			case "PageUp": {
				event.preventDefault();
				const target = event.shiftKey ? addYears(iso, -1) : addMonths(iso, -1);
				moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, -1), disabledCheck) : target);
				break;
			}
			case "PageDown": {
				event.preventDefault();
				const target = event.shiftKey ? addYears(iso, 1) : addMonths(iso, 1);
				moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, 1), disabledCheck) : target);
				break;
			}
		}
	}
	function handleFieldKeyDown(event) {
		if (isDisabled || open) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			openCalendar();
		}
	}
	const [startText, setStartText] = useState(() => formatTypedDate(committedStart, locale));
	const [endText, setEndText] = useState(() => formatTypedDate(committedEnd, locale));
	const [startFocused, setStartFocused] = useState(false);
	const [endFocused, setEndFocused] = useState(false);
	const startTextInvalidRef = useRef(false);
	const endTextInvalidRef = useRef(false);
	useEffect(() => {
		if (startFocused) return;
		setStartText(formatTypedDate(committedStart, locale));
	}, [
		committedStart,
		locale,
		startFocused
	]);
	useEffect(() => {
		if (endFocused) return;
		setEndText(formatTypedDate(committedEnd, locale));
	}, [
		committedEnd,
		locale,
		endFocused
	]);
	function handleStartTextChange(event) {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const raw = event.target.value;
		setStartText(raw);
		if (raw.trim() === "") {
			startTextInvalidRef.current = false;
			applyStart(void 0);
			fireChange();
			return;
		}
		const parsed = parseTypedDate(raw, patternTokens);
		startTextInvalidRef.current = parsed === void 0;
		if (parsed && !disabledCheck(parsed)) {
			applyStart(parsed);
			if (!range) {
				fireChange();
				if (open) retargetFocusedDate(parseISO(parsed).year, parseISO(parsed).month);
			} else if (committedEnd !== void 0) fireChange();
		}
	}
	function handleEndTextChange(event) {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		const raw = event.target.value;
		setEndText(raw);
		if (raw.trim() === "") {
			endTextInvalidRef.current = false;
			applyEnd(void 0);
			fireChange();
			return;
		}
		const parsed = parseTypedDate(raw, patternTokens);
		endTextInvalidRef.current = parsed === void 0;
		if (parsed && !disabledCheck(parsed) && committedStart !== void 0) {
			applyEnd(parsed);
			fireChange();
			if (open) retargetFocusedDate(parseISO(parsed).year, parseISO(parsed).month);
		}
	}
	function handleStartBlur(event) {
		setStartFocused(false);
		onBlurNative(event, name);
	}
	function handleEndBlur(event) {
		setEndFocused(false);
		onBlurNative(event, `${name}-end`);
	}
	function onBlurNative(_event, fieldName) {
		if (form && (form.validate === "blur" || form.validate === "change")) form.validateField(fieldName);
	}
	const latest = useRef({
		label,
		required,
		disabled: isDisabled,
		error,
		min,
		max
	});
	latest.current = {
		label,
		required,
		disabled: isDisabled,
		error,
		min,
		max
	};
	useEffect(() => {
		if (!form) return void 0;
		return form.register({
			name,
			id,
			get label() {
				return latest.current.label;
			},
			getValue: () => latestStartRef.current,
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, error: errorProp, min: currentMin, max: currentMax } = latest.current;
				if (errorProp !== void 0) return errorProp;
				const current = latestStartRef.current;
				if (isRequired && current === void 0) return interpolate$3(COPY$8.required, { label: currentLabel });
				if (current !== void 0 && startTextInvalidRef.current) return interpolate$3(COPY$8.invalid, {
					label: currentLabel,
					pattern: patternPlaceholder(patternTokens)
				});
				if (current !== void 0 && currentMin && compareISO(current, currentMin) < 0) return interpolate$3(COPY$8.tooEarly, {
					label: currentLabel,
					min: formatTypedDate(currentMin, locale)
				});
				if (current !== void 0 && currentMax && compareISO(current, currentMax) > 0) return interpolate$3(COPY$8.tooLate, {
					label: currentLabel,
					max: formatTypedDate(currentMax, locale)
				});
				return null;
			},
			focus: () => startInputRef.current?.focus()
		});
	}, [
		form,
		name,
		id
	]);
	useEffect(() => {
		if (!form || !range) return void 0;
		return form.register({
			name: `${name}-end`,
			id: `${id}-end`,
			get label() {
				return `${latest.current.label} ${COPY$8.endLabel}`;
			},
			getValue: () => latestEndRef.current,
			isDisabled: () => latest.current.disabled,
			validate: () => {
				const { label: currentLabel, required: isRequired, error: errorProp, max: currentMax } = latest.current;
				if (errorProp !== void 0) return errorProp;
				const current = latestEndRef.current;
				if (isRequired && current === void 0) return interpolate$3(COPY$8.required, { label: currentLabel });
				if (current !== void 0 && endTextInvalidRef.current) return interpolate$3(COPY$8.invalid, {
					label: currentLabel,
					pattern: patternPlaceholder(patternTokens)
				});
				if (current !== void 0 && latestStartRef.current !== void 0 && compareISO(current, latestStartRef.current) < 0) return COPY$8.rangeOrder;
				if (current !== void 0 && currentMax && compareISO(current, currentMax) > 0) return interpolate$3(COPY$8.tooLate, {
					label: currentLabel,
					max: formatTypedDate(currentMax, locale)
				});
				return null;
			},
			focus: () => endInputRef.current?.focus()
		});
	}, [
		form,
		range,
		name,
		id
	]);
	if (isDev$5 && !label) console.warn("DatePicker: `label` is required and becomes the field’s accessible name.");
	const { rootStyle, labelOverrides, descriptionOverrides, monthSelectOverrides } = overrides ? resolveOverrides(overrides) : {
		rootStyle: void 0,
		labelOverrides: void 0,
		descriptionOverrides: void 0,
		monthSelectOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const classes = [
		"ds-date-picker",
		`ds-date-picker--${size}`,
		isDisabled ? "ds-date-picker--disabled" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const labelClasses = ["ds-date-picker__label", hideLabel ? "ds-date-picker__visually-hidden" : null].filter(Boolean).join(" ");
	const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(" ");
	const gridLabelText = interpolate$3(COPY$8.gridLabel, {
		label,
		month: monthNames[displayedMonth.month],
		year: String(displayedMonth.year)
	});
	const monthOptions = monthNames.map((monthName, index) => ({
		value: String(index),
		label: monthName
	}));
	const yearNow = todayISO().slice(0, 4);
	const minYear = min ? parseISO(min).year : Number(yearNow) - 100;
	const maxYear = max ? parseISO(max).year : Number(yearNow) + 50;
	const yearOptions = Array.from({ length: Math.max(maxYear - minYear + 1, 1) }, (_, i) => {
		const y = minYear + i;
		return {
			value: String(y),
			label: String(y)
		};
	});
	const gridDays = buildGridDays(displayedMonth.year, displayedMonth.month, firstDayOfWeek);
	const today = todayISO();
	const rangeStartDisplay = range ? pendingRangeStart ?? committedStart : void 0;
	const rangeEndDisplay = range ? pendingRangeStart ? void 0 : committedEnd : void 0;
	const todayDisabled = disabledCheck(today);
	dayRefs.current.clear();
	const calendarButton = /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size,
		iconOnly: true,
		label: range ? COPY$8.openRange : COPY$8.open,
		leadingIcon: /* @__PURE__ */ jsx(Icon, {
			name: "calendar",
			inline: true
		}),
		disabled: isDisabled,
		"data-part": "calendarButton"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: classes,
		"data-ds": "DatePicker",
		"data-ds-field": true,
		style: mergedStyle,
		children: [
			range ? /* @__PURE__ */ jsx("span", {
				id,
				className: labelClasses,
				"data-part": "label",
				children: /* @__PURE__ */ jsxs(Text, {
					element: "span",
					weight: "medium",
					overrides: labelOverrides,
					children: [label, required ? /* @__PURE__ */ jsx("span", {
						className: "ds-date-picker__required",
						children: COPY$8.requiredIndicator
					}) : null]
				})
			}) : /* @__PURE__ */ jsx("label", {
				htmlFor: id,
				className: labelClasses,
				"data-part": "label",
				children: /* @__PURE__ */ jsxs(Text, {
					element: "span",
					weight: "medium",
					overrides: labelOverrides,
					children: [label, required ? /* @__PURE__ */ jsx("span", {
						className: "ds-date-picker__required",
						children: COPY$8.requiredIndicator
					}) : null]
				})
			}),
			description ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: descriptionId,
				"data-part": "description",
				size: "sm",
				tone: "muted",
				overrides: descriptionOverrides,
				children: description
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-date-picker__field",
				"data-part": "field",
				children: [range ? /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("span", {
						id: startHiddenLabelId,
						className: "ds-date-picker__visually-hidden",
						children: COPY$8.startLabel
					}),
					/* @__PURE__ */ jsx("input", {
						ref: startInputRef,
						id: `${id}-start`,
						name,
						type: "text",
						inputMode: "numeric",
						autoComplete: "off",
						value: startText,
						placeholder: resolvedPlaceholder,
						"data-part": "input",
						className: "ds-date-picker__input",
						"aria-labelledby": `${id} ${startHiddenLabelId}`,
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						readOnly: isDisabled,
						onChange: handleStartTextChange,
						onFocus: () => setStartFocused(true),
						onBlur: handleStartBlur,
						onKeyDown: handleFieldKeyDown
					}),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "ds-date-picker__separator",
						"data-part": "rangeSeparator",
						children: "–"
					}),
					/* @__PURE__ */ jsx("span", {
						id: endHiddenLabelId,
						className: "ds-date-picker__visually-hidden",
						children: COPY$8.endLabel
					}),
					/* @__PURE__ */ jsx("input", {
						ref: endInputRef,
						id: `${id}-end`,
						name: `${name}-end`,
						type: "text",
						inputMode: "numeric",
						autoComplete: "off",
						value: endText,
						placeholder: resolvedPlaceholder,
						"data-part": "input",
						className: "ds-date-picker__input",
						"aria-labelledby": `${id} ${endHiddenLabelId}`,
						"aria-describedby": describedBy || void 0,
						"aria-invalid": isInvalid ? "true" : void 0,
						"aria-required": required ? "true" : void 0,
						"aria-disabled": isDisabled ? "true" : void 0,
						readOnly: isDisabled,
						onChange: handleEndTextChange,
						onFocus: () => setEndFocused(true),
						onBlur: handleEndBlur,
						onKeyDown: handleFieldKeyDown
					})
				] }) : /* @__PURE__ */ jsx("input", {
					...rest,
					ref: startInputRef,
					id,
					name,
					type: "text",
					inputMode: "numeric",
					autoComplete: "off",
					value: startText,
					placeholder: resolvedPlaceholder,
					"data-part": "input",
					className: "ds-date-picker__input",
					"aria-describedby": describedBy || void 0,
					"aria-invalid": isInvalid ? "true" : void 0,
					"aria-required": required ? "true" : void 0,
					"aria-disabled": isDisabled ? "true" : void 0,
					readOnly: isDisabled,
					onChange: handleStartTextChange,
					onFocus: () => setStartFocused(true),
					onBlur: handleStartBlur,
					onKeyDown: handleFieldKeyDown
				}), /* @__PURE__ */ jsx(Popover, {
					trigger: calendarButton,
					open,
					placement: "bottom-start",
					dismissible: false,
					container,
					onOpenChange: handlePopoverOpenChange,
					overrides: { inset: "space.0" },
					children: /* @__PURE__ */ jsx(FormContext.Provider, {
						value: null,
						children: /* @__PURE__ */ jsxs("div", {
							className: "ds-date-picker__calendar",
							"data-part": "popover",
							children: [
								/* @__PURE__ */ jsx("span", {
									id: gridLabelId,
									className: "ds-date-picker__visually-hidden",
									children: gridLabelText
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "ds-date-picker__header",
									"data-part": "header",
									children: [
										/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											iconOnly: true,
											label: COPY$8.previousMonth,
											leadingIcon: /* @__PURE__ */ jsx(Icon, {
												name: "chevron-left",
												inline: true
											}),
											disabled: isDisabled,
											"data-part": "prevMonthButton",
											onClick: () => retargetFocusedDate(displayedMonth.month === 0 ? displayedMonth.year - 1 : displayedMonth.year, (displayedMonth.month + 11) % 12)
										}),
										/* @__PURE__ */ jsx("span", {
											className: "ds-date-picker__header-select",
											"data-part": "monthSelect",
											children: /* @__PURE__ */ jsx(Select, {
												label: COPY$8.month,
												hideLabel: true,
												size: "sm",
												name: `${id}-month`,
												options: monthOptions,
												value: String(displayedMonth.month),
												disabled: isDisabled,
												overrides: monthSelectOverrides,
												onChange: (v) => retargetFocusedDate(displayedMonth.year, Number(v))
											})
										}),
										/* @__PURE__ */ jsx("span", {
											className: "ds-date-picker__header-select",
											"data-part": "yearSelect",
											children: /* @__PURE__ */ jsx(Select, {
												label: COPY$8.year,
												hideLabel: true,
												size: "sm",
												name: `${id}-year`,
												options: yearOptions,
												value: String(displayedMonth.year),
												disabled: isDisabled,
												overrides: monthSelectOverrides,
												onChange: (v) => retargetFocusedDate(Number(v), displayedMonth.month)
											})
										}),
										/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											iconOnly: true,
											label: COPY$8.nextMonth,
											leadingIcon: /* @__PURE__ */ jsx(Icon, {
												name: "chevron-right",
												inline: true
											}),
											disabled: isDisabled,
											"data-part": "nextMonthButton",
											onClick: () => retargetFocusedDate(displayedMonth.month === 11 ? displayedMonth.year + 1 : displayedMonth.year, (displayedMonth.month + 1) % 12)
										})
									]
								}),
								/* @__PURE__ */ jsxs("table", {
									role: "grid",
									"aria-labelledby": gridLabelId,
									className: "ds-date-picker__grid",
									"data-part": "grid",
									children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [showWeekNumbers ? /* @__PURE__ */ jsx("th", {
										scope: "col",
										className: "ds-date-picker__week-number-header",
										children: /* @__PURE__ */ jsx("span", {
											className: "ds-date-picker__visually-hidden",
											children: COPY$8.weekNumber
										})
									}) : null, weekdayNames.map((weekday) => /* @__PURE__ */ jsx("th", {
										scope: "col",
										abbr: weekday.full,
										"data-part": "weekdayHeader",
										className: "ds-date-picker__weekday",
										children: weekday.short
									}, weekday.full))] }) }), /* @__PURE__ */ jsx("tbody", { children: Array.from({ length: 6 }, (_, week) => {
										const weekDays = gridDays.slice(week * 7, week * 7 + 7);
										return /* @__PURE__ */ jsxs("tr", { children: [showWeekNumbers ? /* @__PURE__ */ jsx("td", {
											className: "ds-date-picker__week-number",
											"data-part": "weekNumber",
											children: isoWeekNumber(weekDays[0])
										}) : null, weekDays.map((iso) => {
											const p = parseISO(iso);
											const outsideMonth = p.month !== displayedMonth.month || p.year !== displayedMonth.year;
											const isToday = iso === today;
											const isSelected = iso === rangeStartDisplay || iso === rangeEndDisplay || !range && iso === committedStart;
											const isInRange = range && rangeStartDisplay !== void 0 && rangeEndDisplay !== void 0 && compareISO(iso, rangeStartDisplay) > 0 && compareISO(iso, rangeEndDisplay) < 0;
											const dayDisabled = disabledCheck(iso);
											const dayClasses = [
												"ds-date-picker__day",
												outsideMonth ? "ds-date-picker__day--outside" : null,
												isSelected ? "ds-date-picker__day--selected" : null,
												isInRange ? "ds-date-picker__day--in-range" : null,
												isToday ? "ds-date-picker__day--today" : null
											].filter(Boolean).join(" ");
											const status = [isToday ? COPY$8.todayLabel : null, isSelected ? COPY$8.selected : null].filter(Boolean).join(", ");
											return /* @__PURE__ */ jsx("td", {
												role: "gridcell",
												children: /* @__PURE__ */ jsx("button", {
													ref: (node) => {
														if (node) dayRefs.current.set(iso, node);
													},
													type: "button",
													tabIndex: iso === focusedDate ? 0 : -1,
													className: dayClasses,
													"data-part": "day",
													"aria-selected": isSelected ? "true" : void 0,
													"aria-current": isToday ? "date" : void 0,
													"aria-disabled": dayDisabled ? "true" : void 0,
													"aria-label": status ? `${formatFullDate(iso, locale)}, ${status}` : formatFullDate(iso, locale),
													onClick: () => handleDayClick(iso),
													onKeyDown: (event) => handleDayKeyDown(event, iso),
													children: p.day
												})
											}, iso);
										})] }, weekDays[0]);
									}) }, `${displayedMonth.year}-${displayedMonth.month}`)]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "ds-date-picker__footer",
									"data-part": "footer",
									children: /* @__PURE__ */ jsxs(Stack, {
										direction: "horizontal",
										gap: "tight",
										children: [/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											label: COPY$8.today,
											disabled: isDisabled || todayDisabled,
											"data-part": "todayButton",
											onClick: handleToday
										}), /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											label: COPY$8.clear,
											disabled: isDisabled,
											"data-part": "clearButton",
											onClick: handleClear
										})]
									})
								})
							]
						})
					})
				})]
			}),
			resolvedError ? /* @__PURE__ */ jsx(Text, {
				element: "p",
				id: errorId,
				role: "alert",
				"data-part": "errorMessage",
				size: "sm",
				tone: "danger",
				children: resolvedError
			}) : null
		]
	});
};
//#endregion
//#region src/Toolbar.tsx
const OVERRIDE_HOOK$2 = {
	border: "--ds-toolbar-border",
	borderWidth: "--ds-toolbar-border-width",
	radius: "--ds-toolbar-radius",
	paddingInline: "--ds-toolbar-padding-inline",
	paddingBlock: "--ds-toolbar-padding-block",
	itemGap: "--ds-toolbar-item-gap",
	itemGapCompact: "--ds-toolbar-item-gap-compact",
	groupGap: "--ds-toolbar-group-gap",
	separatorLength: "--ds-toolbar-separator-length",
	fadeWidth: "--ds-toolbar-fade-width"
};
function overridesToStyle$7(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$2[binding]] = cssVar(ref);
	}
	return style;
}
const COPY$7 = { more: "More" };
const FOCUSABLE_SELECTOR$3 = [
	"button:not([role=\"radio\"]):not(:disabled)",
	"[role=\"radio\"][aria-checked=\"true\"]:not(:disabled)",
	"select:not(:disabled)",
	"input:not(:disabled)",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
function isControlDisabled(element) {
	return element.disabled === true || element.getAttribute("aria-disabled") === "true";
}
function getControls(container) {
	return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR$3));
}
function applyRovingTabIndex(controls, currentIndex) {
	controls.forEach((control, index) => {
		control.tabIndex = index === currentIndex ? 0 : -1;
	});
}
/** Best-effort accessible name for a collapsed control, reused as its overflow Menu row label. */
function actionFromElement(element, id) {
	const props = element.props;
	const overflowLabel = props.overflowLabel;
	const ariaLabel = props["aria-label"];
	const label = props.label;
	const childText = props.children;
	return {
		id,
		label: typeof overflowLabel === "string" && overflowLabel || typeof ariaLabel === "string" && ariaLabel || typeof label === "string" && label || typeof childText === "string" && childText || id,
		disabled: props.disabled === true || props["aria-disabled"] === "true" || props["aria-disabled"] === true
	};
}
function buildEntries(children) {
	const elements = Children.toArray(children).filter(isValidElement);
	const entries = [];
	elements.forEach((element, index) => {
		const isGroup = element.type === ToolbarGroup;
		const previous = entries[entries.length - 1];
		if (isGroup && previous && previous.kind === "group") entries.push({
			kind: "separator",
			key: `ds-toolbar-separator-${index}`
		});
		entries.push({
			kind: isGroup ? "group" : "control",
			element,
			key: typeof element.key === "string" ? element.key : `ds-toolbar-item-${index}`
		});
	});
	return entries;
}
/** Groups related controls inside a Toolbar; a Divider is drawn automatically between adjacent groups. */
const ToolbarGroup = function ToolbarGroup({ ref, label, children, className, ...rest }) {
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		role: "group",
		"aria-label": label,
		"data-ds": "ToolbarGroup",
		"data-part": "group",
		className: ["ds-toolbar__group", className ?? null].filter(Boolean).join(" "),
		children
	});
};
/**
* Toolbar — Design Schema, category: navigation.
*
* When to use:
* Use a Toolbar for controls that act on the same thing and are used together: text formatting, a
* table's row actions, a map's view switches, a data page's filter–sort–export row. Group by
* purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for
* toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it
* reads well as a menu item.
*/
const Toolbar = function Toolbar({ ref, label, children, orientation = "horizontal", overflow = "menu", size = "md", density = "comfortable", overrides, className, style, ...rest }) {
	const containerRef = useRef(null);
	const currentIndexRef = useRef(0);
	const itemNodesRef = useRef([]);
	const moreItemRef = useRef(null);
	const overflowElementsRef = useRef(/* @__PURE__ */ new Map());
	const isMenuOverflow = overflow === "menu";
	const [renderCount, setRenderCount] = useState(null);
	const setContainerRef = (node) => {
		containerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const entries = buildEntries(children);
	const entriesKey = entries.map((entry) => `${entry.kind}:${entry.key}`).join("|");
	useLayoutEffect(() => {
		if (!isMenuOverflow) return void 0;
		setRenderCount(null);
	}, [
		isMenuOverflow,
		orientation,
		entriesKey
	]);
	useLayoutEffect(() => {
		if (!isMenuOverflow) return void 0;
		const container = containerRef.current;
		if (!container) return void 0;
		if (renderCount === null) {
			const nodes = itemNodesRef.current.filter((node) => node !== null);
			const total = nodes.length;
			if (total === 0) {
				setRenderCount(0);
				return;
			}
			const moreWidth = moreItemRef.current?.offsetWidth ?? 0;
			const limit = container.clientWidth - moreWidth;
			let fit = total;
			for (let i = 0; i < total; i++) if (nodes[i].offsetLeft + nodes[i].offsetWidth > limit) {
				fit = i;
				break;
			}
			setRenderCount(fit);
			return;
		}
		if (typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(() => setRenderCount(null));
		observer.observe(container);
		return () => observer.disconnect();
	}, [isMenuOverflow, renderCount]);
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return void 0;
		const sync = () => {
			const controls = getControls(container);
			if (controls.length === 0) return;
			if (currentIndexRef.current >= controls.length) currentIndexRef.current = 0;
			if (isControlDisabled(controls[currentIndexRef.current])) {
				const firstEnabled = controls.findIndex((control) => !isControlDisabled(control));
				if (firstEnabled !== -1) currentIndexRef.current = firstEnabled;
			}
			applyRovingTabIndex(controls, currentIndexRef.current);
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
	const handleFocusIn = (event) => {
		const container = containerRef.current;
		if (!container) return;
		const controls = getControls(container);
		const index = controls.indexOf(event.target);
		if (index !== -1) {
			currentIndexRef.current = index;
			applyRovingTabIndex(controls, index);
		}
	};
	const handleKeyDown = (event) => {
		if (event.defaultPrevented) return;
		const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
		const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
		if (event.key !== nextKey && event.key !== prevKey && event.key !== "Home" && event.key !== "End") return;
		const container = containerRef.current;
		if (!container) return;
		const controls = getControls(container);
		if (controls.length === 0) return;
		const currentIndex = controls.indexOf(event.target);
		if (currentIndex === -1) return;
		const moveTo = (index) => {
			currentIndexRef.current = index;
			applyRovingTabIndex(controls, index);
			controls[index].focus();
		};
		if (event.key === nextKey) {
			for (let i = currentIndex + 1; i < controls.length; i++) if (!isControlDisabled(controls[i])) {
				event.preventDefault();
				moveTo(i);
				break;
			}
		} else if (event.key === prevKey) {
			for (let i = currentIndex - 1; i >= 0; i--) if (!isControlDisabled(controls[i])) {
				event.preventDefault();
				moveTo(i);
				break;
			}
		} else if (event.key === "Home") {
			const i = controls.findIndex((control) => !isControlDisabled(control));
			if (i !== -1) {
				event.preventDefault();
				moveTo(i);
			}
		} else if (event.key === "End") {
			for (let i = controls.length - 1; i >= 0; i--) if (!isControlDisabled(controls[i])) {
				event.preventDefault();
				moveTo(i);
				break;
			}
		}
	};
	const handleOverflowAction = (id) => {
		const onClickProp = (overflowElementsRef.current.get(id)?.props)?.onClick;
		onClickProp?.({});
	};
	const separatorOrientation = orientation === "horizontal" ? "vertical" : "horizontal";
	const renderSeparator = (key, ref) => /* @__PURE__ */ jsx("span", {
		ref,
		className: "ds-toolbar__separator",
		"data-part": "separator",
		children: /* @__PURE__ */ jsx(Divider, { orientation: separatorOrientation })
	}, key);
	let visibleEntries = entries;
	if (isMenuOverflow) {
		const count = renderCount === null ? entries.length : Math.min(renderCount, entries.length);
		visibleEntries = entries.slice(0, count);
		while (visibleEntries.length > 0 && visibleEntries[visibleEntries.length - 1].kind === "separator") visibleEntries = visibleEntries.slice(0, -1);
	}
	const hiddenEntries = isMenuOverflow ? entries.slice(visibleEntries.length).filter((entry) => entry.kind !== "separator") : [];
	overflowElementsRef.current.clear();
	const menuItems = hiddenEntries.flatMap((entry) => {
		if (entry.kind === "group") {
			const groupProps = entry.element.props;
			const actions = Children.toArray(groupProps.children).filter(isValidElement).map((child, childIndex) => {
				const id = `${entry.key}-${childIndex}`;
				overflowElementsRef.current.set(id, child);
				return actionFromElement(child, id);
			});
			return groupProps.label ? [{
				group: groupProps.label,
				items: actions
			}] : actions;
		}
		overflowElementsRef.current.set(entry.key, entry.element);
		return [actionFromElement(entry.element, entry.key)];
	});
	const mountMoreButton = isMenuOverflow && (renderCount === null || hiddenEntries.length > 0);
	const moreButtonStyle = isMenuOverflow && hiddenEntries.length === 0 ? {
		visibility: "hidden",
		position: "absolute"
	} : void 0;
	const classes = [
		"ds-toolbar",
		`ds-toolbar--${orientation}`,
		`ds-toolbar--overflow-${overflow}`,
		`ds-toolbar--size-${size}`,
		density === "compact" ? "ds-toolbar--density-compact" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$7(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: setContainerRef,
		role: "toolbar",
		"aria-label": label,
		"aria-orientation": orientation,
		"data-ds": "Toolbar",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		onFocus: handleFocusIn,
		onKeyDown: handleKeyDown,
		children: [isMenuOverflow ? visibleEntries.map((entry, index) => {
			const setItemRef = (node) => {
				itemNodesRef.current[index] = node;
			};
			if (entry.kind === "separator") return renderSeparator(entry.key, setItemRef);
			return /* @__PURE__ */ jsx("span", {
				ref: setItemRef,
				className: "ds-toolbar__item",
				children: entry.element
			}, entry.key);
		}) : entries.map((entry) => entry.kind === "separator" ? renderSeparator(entry.key) : entry.element), mountMoreButton ? /* @__PURE__ */ jsx("span", {
			ref: (node) => {
				moreItemRef.current = node;
			},
			className: "ds-toolbar__item ds-toolbar__more",
			style: moreButtonStyle,
			children: /* @__PURE__ */ jsx(Menu, {
				label: COPY$7.more,
				items: menuItems.length > 0 ? menuItems : [{
					id: "ds-toolbar-more-empty",
					label: COPY$7.more,
					disabled: true
				}],
				triggerVariant: "ghost",
				triggerIcon: "ellipsis",
				iconOnly: true,
				"data-part": "overflowMenu",
				onAction: handleOverflowAction
			})
		}) : null]
	});
};
//#endregion
//#region src/Carousel.tsx
const COPY$6 = {
	previous: "Previous slide",
	next: "Next slide",
	play: "Start automatic rotation",
	pause: "Stop automatic rotation",
	slideLabel: "{n} of {total}",
	goTo: "Go to slide {n}",
	announce: "Slide {n} of {total}"
};
const MIN_INTERVAL = 5e3;
const VISIBLE_THRESHOLD = .6;
const OVERRIDE_HOOK$1 = {
	slideGap: "--ds-carousel-slide-gap",
	controlOffset: "--ds-carousel-control-offset",
	controlShadow: "--ds-carousel-control-shadow",
	pickerGap: "--ds-carousel-picker-gap",
	pickerOffset: "--ds-carousel-picker-offset",
	dotSize: "--ds-carousel-dot-size",
	dotTarget: "--ds-carousel-dot-target",
	radius: "--ds-carousel-radius",
	transition: "--ds-carousel-transition"
};
function overridesToStyle$6(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK$1[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$4 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$2() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
function clampIndex(index, total) {
	if (total === 0) return 0;
	return Math.min(Math.max(index, 0), total - 1);
}
/** Whether `index` is one of the `perView` slides starting at `current` (wrapping when `loop`). */
function isSlideVisible(index, current, perView, total, loop) {
	if (total === 0) return false;
	const span = Math.min(Math.max(perView, 1), total);
	for (let offset = 0; offset < span; offset++) {
		let candidate = current + offset;
		if (loop) candidate = (candidate % total + total) % total;
		else if (candidate >= total) break;
		if (candidate === index) return true;
	}
	return false;
}
/** One slide's content — a direct child of `Carousel`, one per slide, in the same order. */
const CarouselSlide = function CarouselSlide({ ref, label: _label, children, className, ...rest }) {
	return /* @__PURE__ */ jsx("div", {
		...rest,
		ref,
		"data-ds": "CarouselSlide",
		"data-part": "slide",
		className: ["ds-carousel__slide", className ?? null].filter(Boolean).join(" "),
		children
	});
};
/**
* Carousel — Design Schema, category: container.
*
* When to use:
* Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid —
* featured products with images, testimonials, a gallery — where paging is a reasonable way to
* see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots`
* for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even
* then keep the pause control visible.
*/
const Carousel = function Carousel({ ref, label, children, perView = 1, loop = false, autoplay = false, interval = 6e3, picker = "dots", activeIndex, snap = true, overrides, onChange, className, style, ...rest }) {
	const baseId = `ds-carousel${useId()}`;
	const slideElements = Children.toArray(children).filter(isValidElement);
	const total = slideElements.length;
	const isControlled = activeIndex !== void 0;
	const [internalIndex, setInternalIndex] = useState(0);
	const current = clampIndex(isControlled ? activeIndex : internalIndex, total);
	const [playing, setPlaying] = useState(() => autoplay && !prefersReducedMotion$2());
	const [announcement, setAnnouncement] = useState("");
	const viewportRef = useRef(null);
	const slideRefs = useRef([]);
	const pickerRefs = useRef(/* @__PURE__ */ new Map());
	const suppressObserverRef = useRef(false);
	const lastReasonRef = useRef("picker");
	if (isDev$4 && !label) console.warn("Carousel: `label` is required and becomes the region’s accessible name.");
	if (isDev$4 && interval < MIN_INTERVAL) console.warn(`Carousel: \`interval\` below ${MIN_INTERVAL}ms is not allowed; using ${MIN_INTERVAL}ms.`);
	const effectiveInterval = Math.max(interval, MIN_INTERVAL);
	const goTo = (index, reason) => {
		const clamped = clampIndex(index, total);
		lastReasonRef.current = reason;
		if (!isControlled) setInternalIndex(clamped);
		if (clamped !== current) {
			onChange?.(clamped, reason);
			if (reason !== "autoplay") setAnnouncement(COPY$6.announce.replace("{n}", String(clamped + 1)).replace("{total}", String(total)));
		}
	};
	const handlePrev = () => {
		if (total === 0) return;
		goTo(loop ? (current - 1 + total) % total : Math.max(current - 1, 0), "prev");
	};
	const handleNext = () => {
		if (total === 0) return;
		goTo(loop ? (current + 1) % total : Math.min(current + 1, total - 1), "next");
	};
	const togglePlay = () => setPlaying((wasPlaying) => !wasPlaying);
	const pauseForInteraction = () => setPlaying(false);
	const handlePickerKeyDown = (event) => {
		if (total === 0) return;
		const moveTo = (index) => {
			goTo(index, "picker");
			pickerRefs.current.get(index)?.focus();
		};
		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				moveTo((current + 1) % total);
				break;
			case "ArrowLeft":
				event.preventDefault();
				moveTo((current - 1 + total) % total);
				break;
			case "Home":
				event.preventDefault();
				moveTo(0);
				break;
			case "End":
				event.preventDefault();
				moveTo(total - 1);
		}
	};
	const setPickerRef = (index) => (el) => {
		if (el) pickerRefs.current.set(index, el);
		else pickerRefs.current.delete(index);
	};
	useEffect(() => {
		if (!autoplay || !playing || total <= 1) return void 0;
		const id = window.setInterval(() => {
			goTo(loop ? (current + 1) % total : current + 1 >= total ? 0 : current + 1, "autoplay");
		}, effectiveInterval);
		return () => window.clearInterval(id);
	}, [
		autoplay,
		playing,
		effectiveInterval,
		current,
		loop,
		total
	]);
	useEffect(() => {
		if (lastReasonRef.current === "swipe") return void 0;
		const node = slideRefs.current[current];
		if (!node || typeof node.scrollIntoView !== "function") return void 0;
		suppressObserverRef.current = true;
		node.scrollIntoView({
			behavior: prefersReducedMotion$2() ? "auto" : "smooth",
			inline: "start",
			block: "nearest"
		});
		const timeout = window.setTimeout(() => {
			suppressObserverRef.current = false;
		}, 500);
		return () => window.clearTimeout(timeout);
	}, [current]);
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport || typeof IntersectionObserver === "undefined") return void 0;
		const observer = new IntersectionObserver((entries) => {
			if (suppressObserverRef.current) return;
			let bestIndex = -1;
			let bestRatio = 0;
			entries.forEach((entry) => {
				const index = slideRefs.current.findIndex((node) => node === entry.target);
				if (index !== -1 && entry.intersectionRatio > bestRatio) {
					bestRatio = entry.intersectionRatio;
					bestIndex = index;
				}
			});
			if (bestIndex !== -1 && bestRatio >= VISIBLE_THRESHOLD && bestIndex !== current) goTo(bestIndex, "swipe");
		}, {
			root: viewport,
			threshold: VISIBLE_THRESHOLD
		});
		slideRefs.current.forEach((node) => node && observer.observe(node));
		return () => observer.disconnect();
	}, [total, current]);
	useLayoutEffect(() => {
		slideRefs.current.forEach((node, index) => {
			if (node) node.inert = !isSlideVisible(index, current, perView, total, loop);
		});
	});
	const classes = [
		"ds-carousel",
		snap ? null : "ds-carousel--no-snap",
		className ?? null
	].filter(Boolean).join(" ");
	const mergedStyle = {
		"--ds-carousel-per-view": perView,
		...overrides ? overridesToStyle$6(overrides) : void 0,
		...style
	};
	const prevDisabled = total === 0 || !loop && current === 0;
	const nextDisabled = total === 0 || !loop && current === total - 1;
	const showPlayButton = autoplay && !prefersReducedMotion$2();
	return /* @__PURE__ */ jsxs("section", {
		...rest,
		ref,
		role: "region",
		"aria-roledescription": "carousel",
		"aria-label": label,
		"data-ds": "Carousel",
		className: classes,
		style: mergedStyle,
		onMouseEnter: pauseForInteraction,
		onFocus: pauseForInteraction,
		onTouchStart: pauseForInteraction,
		children: [
			showPlayButton ? /* @__PURE__ */ jsx(Button, {
				variant: "secondary",
				label: playing ? COPY$6.pause : COPY$6.play,
				"data-part": "playButton",
				onClick: togglePlay
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "ds-carousel__stage",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ds-carousel__control ds-carousel__control--prev",
						"data-part": "prevButton",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							iconOnly: true,
							label: COPY$6.previous,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "chevron-left",
								inline: true
							}),
							disabled: prevDisabled,
							onClick: handlePrev
						})
					}),
					/* @__PURE__ */ jsx("span", {
						className: "ds-carousel__control ds-carousel__control--next",
						"data-part": "nextButton",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							iconOnly: true,
							label: COPY$6.next,
							leadingIcon: /* @__PURE__ */ jsx(Icon, {
								name: "chevron-right",
								inline: true
							}),
							disabled: nextDisabled,
							onClick: handleNext
						})
					}),
					picker === "tabs" ? /* @__PURE__ */ jsx("div", {
						role: "tablist",
						"aria-label": label,
						className: "ds-carousel__picker",
						"data-part": "picker",
						onKeyDown: handlePickerKeyDown,
						children: slideElements.map((slideElement, index) => {
							const isSelected = index === current;
							return /* @__PURE__ */ jsx("button", {
								ref: setPickerRef(index),
								type: "button",
								role: "tab",
								id: `${baseId}-tab-${index}`,
								"aria-selected": isSelected ? "true" : "false",
								"aria-controls": `${baseId}-slide-${index}`,
								tabIndex: isSelected ? 0 : -1,
								className: ["ds-carousel__tab", isSelected ? "ds-carousel__tab--selected" : null].filter(Boolean).join(" "),
								"data-part": "pickerItem",
								onClick: () => goTo(index, "picker"),
								children: slideElement.props.label ?? String(index + 1)
							}, slideElement.key ?? index);
						})
					}) : null,
					picker === "dots" ? /* @__PURE__ */ jsx("div", {
						role: "group",
						"aria-label": label,
						className: "ds-carousel__picker",
						"data-part": "picker",
						onKeyDown: handlePickerKeyDown,
						children: slideElements.map((slideElement, index) => {
							const isSelected = index === current;
							return /* @__PURE__ */ jsx("span", {
								className: "ds-carousel__pickerItemWrap",
								children: /* @__PURE__ */ jsx(Button, {
									ref: setPickerRef(index),
									variant: "ghost",
									iconOnly: true,
									label: COPY$6.goTo.replace("{n}", String(index + 1)),
									"aria-current": isSelected ? "true" : void 0,
									tabIndex: isSelected ? 0 : -1,
									leadingIcon: /* @__PURE__ */ jsx("span", {
										"aria-hidden": "true",
										className: ["ds-carousel__dot", isSelected ? "ds-carousel__dot--active" : null].filter(Boolean).join(" ")
									}),
									"data-part": "pickerItem",
									onClick: () => goTo(index, "picker")
								})
							}, slideElement.key ?? index);
						})
					}) : null,
					/* @__PURE__ */ jsx("div", {
						ref: viewportRef,
						className: "ds-carousel__viewport",
						"data-part": "viewport",
						children: /* @__PURE__ */ jsx("div", {
							className: "ds-carousel__track",
							"data-part": "track",
							children: slideElements.map((slideElement, index) => cloneElement(slideElement, {
								key: slideElement.key ?? index,
								ref: (node) => {
									slideRefs.current[index] = node;
								},
								id: `${baseId}-slide-${index}`,
								role: "group",
								"aria-roledescription": "slide",
								"aria-label": COPY$6.slideLabel.replace("{n}", String(index + 1)).replace("{total}", String(total)),
								"aria-hidden": isSlideVisible(index, current, perView, total, loop) ? void 0 : true
							}))
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-carousel__visually-hidden",
				"data-part": "liveRegion",
				role: "status",
				"aria-live": playing ? "off" : "polite",
				children: announcement
			})
		]
	});
};
//#endregion
//#region src/Table.tsx
/** copy.* — used verbatim; placeholders are replaced with the running values. */
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
	rowCount: "{count} rows"
};
/** `captionSize`/`captionWeight` are forwarded to the composed caption Heading's own overrides
* (it already owns `fontSize`/`fontWeight`); every other binding is a root CSS hook. */
const ROOT_OVERRIDE_HOOK$4 = {
	headerWeight: "--ds-table-header-weight",
	headerSize: "--ds-table-header-size",
	headerBorder: "--ds-table-header-border",
	headerBorderWidth: "--ds-table-header-border-width",
	headerShadow: "--ds-table-header-shadow",
	rowBorder: "--ds-table-row-border",
	rowBorderWidth: "--ds-table-row-border-width",
	rowHover: "--ds-table-row-hover",
	rowSelectedBorderWidth: "--ds-table-row-selected-border-width",
	cellPaddingInline: "--ds-table-cell-padding-inline",
	cellPaddingInlineCompact: "--ds-table-cell-padding-inline-compact",
	cellPaddingBlock: "--ds-table-cell-padding-block",
	cellGap: "--ds-table-cell-gap",
	captionGap: "--ds-table-caption-gap",
	stackedRowInset: "--ds-table-stacked-row-inset",
	stackedRowGap: "--ds-table-stacked-row-gap",
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
function overridesToStyle$5(overrides) {
	const rootStyle = {};
	const captionOverrides = { marginBlockEnd: "space.0" };
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$4[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		else if (binding === "captionSize") captionOverrides.fontSize = ref;
		else if (binding === "captionWeight") captionOverrides.fontWeight = ref;
	}
	return {
		rootStyle,
		captionOverrides
	};
}
const isDev$3 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion$1() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
/** localeCompare for strings, numeric otherwise — the uncontrolled-sort rule verbatim. */
function compareRowValues$2(a, b) {
	if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, void 0, { numeric: true });
	return Number(a) - Number(b);
}
function cellContent(column, row) {
	if (column.render) return column.render(row);
	const value = row[column.key];
	return value === void 0 || value === null ? "" : String(value);
}
/** Plain-text stand-in for the row header value, for aria-labels that need a string. A custom
* `render` on the row-header column cannot be reduced to text, so this falls back to the raw value. */
function rowName$2(row, rowHeaderColumn) {
	if (!rowHeaderColumn) return row.id;
	const value = row[rowHeaderColumn.key];
	return value === void 0 || value === null ? row.id : String(value);
}
function nextSortDirection$1(activeSort, columnKey) {
	if (activeSort?.column === columnKey) return activeSort.direction === "ascending" ? "descending" : "ascending";
	return "ascending";
}
/** The sort Button's visible label doubles as the action description ("Sort by Amount, ascending"). */
function sortButtonLabel$1(column, activeSort) {
	return (nextSortDirection$1(activeSort, column.key) === "ascending" ? COPY$5.sortAscending : COPY$5.sortDescending).replace("{column}", column.header);
}
function hideBelowClass(column) {
	return column.hideBelow ? `ds-table__cell--hide-below-${column.hideBelow}` : null;
}
function alignClass$1(column) {
	return column.align === "end" ? "ds-table__cell--align-end" : column.align === "center" ? "ds-table__cell--align-center" : null;
}
/**
* Table — Design Schema, category: data.
*
* When to use:
* Use a Table for a list of records with three or more comparable fields: orders, invoices,
* members, inventory, results. Use `stack` (the default) when each row is a thing a person reads —
* a person, an order — and `scroll` when the columns are what matters — figures across months, a
* comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions
* exist (put them in a Toolbar above the table that appears with the selection count). Put the
* row's identity in the `isRowHeader` column, usually as a Link to its detail page.
*/
const Table = function Table({ ref, caption, captionLevel = "2", hideCaption = false, columns, data, sort, defaultSort, selectable = "none", selected, defaultSelected, responsive = "stack", stickyHeader = true, maxHeight = "none", density = "comfortable", striped = false, emptyMessage, loading = false, rowActions, footer, overrides, onSortChange, onSelectionChange, onRowPress, className, style, ...rest }) {
	const baseId = `ds-table${useId()}`;
	const captionId = `${baseId}-caption`;
	const rowCountId = `${baseId}-row-count`;
	const scrollHintId = `${baseId}-scroll-hint`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const sentinelRef = useRef(null);
	const scrollRegionRef = useRef(null);
	const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);
	if (isDev$3) {
		const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
		if (rowHeaderCount !== 1) console.warn(`Table: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
	}
	const isSortControlled = sort !== void 0;
	const [internalSort, setInternalSort] = useState(defaultSort);
	const activeSort = isSortControlled ? sort : internalSort;
	const [liveMessage, setLiveMessage] = useState("");
	const sortedData = useMemo(() => {
		if (isSortControlled || !activeSort) return data;
		const column = activeSort.column;
		const factor = activeSort.direction === "ascending" ? 1 : -1;
		return [...data].sort((a, b) => compareRowValues$2(a[column], b[column]) * factor);
	}, [
		data,
		isSortControlled,
		activeSort
	]);
	const handleSort = (column) => {
		const direction = nextSortDirection$1(activeSort, column.key);
		const next = {
			column: column.key,
			direction
		};
		if (!isSortControlled) setInternalSort(next);
		onSortChange?.(next);
		setLiveMessage(COPY$5.sortedAnnouncement.replace("{column}", column.header).replace("{direction}", direction));
	};
	const isSelectionControlled = selected !== void 0;
	const [internalSelected, setInternalSelected] = useState(defaultSelected ?? []);
	const selectedIds = isSelectionControlled ? selected : internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const commitSelection = (next) => {
		if (!isSelectionControlled) setInternalSelected(next);
		onSelectionChange?.(next);
		setLiveMessage(COPY$5.selectedCount.replace("{count}", String(next.length)).replace("{total}", String(sortedData.length)));
	};
	const handleToggleRow = (id, checked) => {
		if (selectable === "single") {
			commitSelection(checked ? [id] : []);
			return;
		}
		commitSelection(checked ? [...selectedIds, id] : selectedIds.filter((existing) => existing !== id));
	};
	const allIds = useMemo(() => sortedData.map((row) => row.id), [sortedData]);
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const handleToggleAll = () => commitSelection(allSelected ? [] : allIds);
	const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!stickyHeader || !sentinel || typeof IntersectionObserver === "undefined") {
			setScrolledUnderHeader(false);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => setScrolledUnderHeader(!entry.isIntersecting), {
			root: maxHeight === "viewport" ? rootRef.current : null,
			threshold: 0
		});
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [stickyHeader, maxHeight]);
	const [scrolledHorizontally, setScrolledHorizontally] = useState(false);
	const handleScroll = (event) => setScrolledHorizontally(event.currentTarget.scrollLeft > 0);
	const handleScrollKeyDown = (event) => {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		const region = scrollRegionRef.current;
		if (!region) return;
		event.preventDefault();
		region.scrollBy({
			left: event.key === "ArrowRight" ? 40 : -40,
			behavior: prefersReducedMotion$1() ? "auto" : "smooth"
		});
	};
	const totalColumnCount = (selectable !== "none" ? 1 : 0) + columns.length + (rowActions ? 1 : 0);
	const classes = [
		"ds-table",
		`ds-table--${responsive}`,
		`ds-table--density-${density}`,
		stickyHeader ? "ds-table--sticky-header" : null,
		maxHeight === "viewport" ? "ds-table--max-height-viewport" : null,
		striped ? "ds-table--striped" : null,
		scrolledUnderHeader ? "ds-table--scrolled-under-header" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, captionOverrides } = overrides ? overridesToStyle$5(overrides) : {
		rootStyle: void 0,
		captionOverrides: { marginBlockEnd: "space.0" }
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const renderColumnHeaderContent = (column) => {
		if (!column.sortable) return column.header;
		const direction = activeSort?.column === column.key ? activeSort?.direction : void 0;
		return /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			size: "sm",
			label: sortButtonLabel$1(column, activeSort),
			trailingIcon: /* @__PURE__ */ jsx(Icon, {
				name: direction === "descending" ? "chevron-down" : "chevron-up",
				inline: true
			}),
			className: "ds-table__sort-button",
			"data-part": "sortButton",
			onClick: () => handleSort(column)
		});
	};
	const renderRow = (row) => {
		const isSelected = selectedSet.has(row.id);
		const interactive = Boolean(onRowPress) && Boolean(rowHeaderColumn) && !rowHeaderColumn?.render;
		const trClasses = [
			"ds-table__tr",
			interactive ? "ds-table__tr--interactive" : null,
			isSelected ? "ds-table__tr--selected" : null
		].filter(Boolean).join(" ");
		const name = rowName$2(row, rowHeaderColumn);
		return /* @__PURE__ */ jsxs("tr", {
			role: "row",
			className: trClasses,
			"data-part": "row",
			"aria-selected": selectable !== "none" ? isSelected ? "true" : "false" : void 0,
			children: [
				selectable !== "none" ? /* @__PURE__ */ jsx("td", {
					role: "cell",
					className: "ds-table__td ds-table__td--select",
					"data-part": "selectCell",
					children: /* @__PURE__ */ jsx(Checkbox, {
						label: COPY$5.selectRow.replace("{rowName}", name),
						name: `${baseId}-select-${row.id}`,
						checked: isSelected,
						onChange: (checked) => handleToggleRow(row.id, checked)
					})
				}) : null,
				columns.map((column) => {
					const classes = [
						"ds-table__cell",
						alignClass$1(column),
						hideBelowClass(column)
					].filter(Boolean).join(" ");
					if (column.isRowHeader) return /* @__PURE__ */ jsx("th", {
						scope: "row",
						role: "rowheader",
						className: classes,
						"data-part": "rowHeader",
						children: interactive ? /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							label: name,
							className: "ds-table__row-button",
							onClick: () => onRowPress?.(row.id)
						}) : cellContent(column, row)
					}, column.key);
					return /* @__PURE__ */ jsx("td", {
						role: "cell",
						className: classes,
						"data-part": "cell",
						"data-label": column.header,
						children: cellContent(column, row)
					}, column.key);
				}),
				rowActions ? /* @__PURE__ */ jsx("td", {
					role: "cell",
					className: "ds-table__td ds-table__td--actions",
					"data-part": "cell",
					"data-label": COPY$5.actions,
					children: rowActions(row)
				}) : null
			]
		}, row.id);
	};
	const tableElement = /* @__PURE__ */ jsxs("table", {
		className: "ds-table__table",
		"data-part": "table",
		role: "table",
		"aria-rowcount": sortedData.length + 1,
		"aria-colcount": totalColumnCount,
		"aria-busy": loading ? "true" : void 0,
		"aria-describedby": rowCountId,
		children: [
			/* @__PURE__ */ jsx("caption", {
				id: captionId,
				"data-part": "caption",
				className: hideCaption ? "ds-table__visually-hidden" : "ds-table__caption",
				children: /* @__PURE__ */ jsx(Heading, {
					level: captionLevel,
					size: "md",
					overrides: captionOverrides,
					children: caption
				})
			}),
			/* @__PURE__ */ jsxs("colgroup", { children: [
				selectable !== "none" ? /* @__PURE__ */ jsx("col", { style: { inlineSize: "var(--size-target-min)" } }) : null,
				columns.map((column) => /* @__PURE__ */ jsx("col", { style: column.width === "min" ? { inlineSize: "1%" } : column.width === "fill" ? { inlineSize: "100%" } : void 0 }, column.key)),
				rowActions ? /* @__PURE__ */ jsx("col", {}) : null
			] }),
			/* @__PURE__ */ jsx("thead", {
				className: "ds-table__thead",
				role: "rowgroup",
				"data-part": "header",
				children: /* @__PURE__ */ jsxs("tr", {
					role: "row",
					className: "ds-table__tr ds-table__tr--header",
					"data-part": "headerRow",
					children: [
						selectable === "multiple" ? /* @__PURE__ */ jsx("th", {
							scope: "col",
							role: "columnheader",
							className: "ds-table__th ds-table__th--select",
							"data-part": "selectAllCell",
							children: /* @__PURE__ */ jsx(Checkbox, {
								label: COPY$5.selectAll,
								name: `${baseId}-select-all`,
								checked: allSelected,
								indeterminate: someSelected,
								onChange: handleToggleAll
							})
						}) : selectable === "single" ? /* @__PURE__ */ jsx("th", {
							scope: "col",
							role: "columnheader",
							className: "ds-table__th ds-table__th--select",
							"data-part": "selectAllCell"
						}) : null,
						columns.map((column) => /* @__PURE__ */ jsx("th", {
							scope: "col",
							role: "columnheader",
							abbr: column.abbr,
							"aria-sort": column.sortable ? activeSort?.column === column.key ? activeSort.direction : "none" : void 0,
							"data-part": "columnHeader",
							className: [
								"ds-table__th",
								alignClass$1(column),
								hideBelowClass(column)
							].filter(Boolean).join(" "),
							children: renderColumnHeaderContent(column)
						}, column.key)),
						rowActions ? /* @__PURE__ */ jsx("th", {
							scope: "col",
							role: "columnheader",
							className: "ds-table__th ds-table__th--actions",
							"data-part": "columnHeader",
							children: /* @__PURE__ */ jsx("span", {
								className: "ds-table__visually-hidden",
								children: COPY$5.actions
							})
						}) : null
					]
				})
			}),
			/* @__PURE__ */ jsx("tbody", {
				className: "ds-table__tbody",
				role: "rowgroup",
				"data-part": "body",
				children: sortedData.length === 0 ? /* @__PURE__ */ jsx("tr", {
					role: "row",
					className: "ds-table__tr",
					children: /* @__PURE__ */ jsx("td", {
						role: "cell",
						colSpan: totalColumnCount,
						className: "ds-table__empty",
						children: /* @__PURE__ */ jsx(Text, {
							element: "p",
							tone: "muted",
							"data-part": "emptyState",
							children: loading ? COPY$5.loading : emptyMessage ?? COPY$5.empty
						})
					})
				}) : sortedData.map((row) => renderRow(row))
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Table",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsx("div", {
				ref: sentinelRef,
				"aria-hidden": "true",
				className: "ds-table__sentinel"
			}),
			/* @__PURE__ */ jsx("span", {
				id: rowCountId,
				className: "ds-table__visually-hidden",
				children: COPY$5.rowCount.replace("{count}", String(sortedData.length))
			}),
			responsive === "scroll" ? /* @__PURE__ */ jsxs("div", {
				ref: scrollRegionRef,
				className: ["ds-table__scroll-region", scrolledHorizontally ? "ds-table__scroll-region--scrolled" : null].filter(Boolean).join(" "),
				"data-part": "scrollRegion",
				role: "region",
				"aria-labelledby": captionId,
				"aria-describedby": scrollHintId,
				tabIndex: 0,
				onScroll: handleScroll,
				onKeyDown: handleScrollKeyDown,
				children: [tableElement, /* @__PURE__ */ jsx("span", {
					id: scrollHintId,
					className: "ds-table__visually-hidden",
					children: COPY$5.scrollHint
				})]
			}) : tableElement,
			footer !== void 0 ? /* @__PURE__ */ jsx("div", {
				className: "ds-table__footer",
				"data-part": "footer",
				children: footer
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "ds-table__visually-hidden",
				role: "status",
				"aria-live": "polite",
				children: liveMessage
			})
		]
	});
};
//#endregion
//#region src/DataGrid.tsx
/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY$4 = {
	sortAscending: "Sort by {column}, ascending",
	sortDescending: "Sort by {column}, descending",
	sortedAnnouncement: "Sorted by {column}, {direction}",
	selectAll: "Select all rows",
	selectRow: "Select {rowName}",
	selectedRows: "{count} of {total} rows selected",
	selectedRange: "{rows} rows by {columns} columns selected",
	copied: "Copied {cells} cells",
	editing: "Editing {column}. Enter to save, Escape to cancel.",
	invalid: "{message}",
	rowCount: "{count} rows",
	position: "Row {row}, {column}",
	resize: "Resize {column}",
	loading: "Loading",
	empty: "Nothing to show.",
	scrollHint: "Scroll sideways to see more columns"
};
/** A column with no explicit `width`/`minWidth` still needs a pixel size for the CSS-grid layout
* and virtualization math; the schema's own example (160) is the fallback. */
const DEFAULT_COLUMN_WIDTH$1 = 160;
const MIN_COLUMN_WIDTH = 40;
/** Fallback keyboard resize step before the `resizeStep` token (space.4) is measured. */
const DEFAULT_RESIZE_STEP_PX = 16;
/** Announcements revert to the persistent summary after this long. */
const ANNOUNCEMENT_TIMEOUT_MS$1 = 5e3;
/** `captionSize`/`captionWeight` are forwarded to the composed caption Heading's own overrides
* (it already owns `fontSize`/`fontWeight`); every other binding is a root CSS hook. */
const ROOT_OVERRIDE_HOOK$3 = {
	headerWeight: "--ds-data-grid-header-weight",
	headerSize: "--ds-data-grid-header-size",
	headerBorder: "--ds-data-grid-header-border",
	headerBorderWidth: "--ds-data-grid-header-border-width",
	headerShadow: "--ds-data-grid-header-shadow",
	gridLine: "--ds-data-grid-grid-line",
	gridLineWidth: "--ds-data-grid-grid-line-width",
	rowHeight: "--ds-data-grid-row-height",
	rowHeightComfortable: "--ds-data-grid-row-height-comfortable",
	rowHover: "--ds-data-grid-row-hover",
	rowSelectedBorderWidth: "--ds-data-grid-row-selected-border-width",
	cellPaddingInline: "--ds-data-grid-cell-padding-inline",
	cellFocusRingWidth: "--ds-data-grid-cell-focus-ring-width",
	rangeBorderWidth: "--ds-data-grid-range-border-width",
	pinnedShadow: "--ds-data-grid-pinned-shadow",
	resizeHandle: "--ds-data-grid-resize-handle",
	resizeHandleWidth: "--ds-data-grid-resize-handle-width",
	resizeStep: "--ds-data-grid-resize-step",
	statusBarSize: "--ds-data-grid-status-bar-size",
	statusBarPadding: "--ds-data-grid-status-bar-padding",
	captionGap: "--ds-data-grid-caption-gap",
	fixedHeight: "--ds-data-grid-fixed-height",
	fontFamily: "--ds-data-grid-font-family",
	fontSize: "--ds-data-grid-font-size",
	lineHeight: "--ds-data-grid-line-height",
	numericFont: "--ds-data-grid-numeric-font",
	transition: "--ds-data-grid-transition"
};
function overridesToStyle$4(overrides) {
	const rootStyle = {};
	const captionOverrides = { marginBlockEnd: "space.0" };
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$3[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		else if (binding === "captionSize") captionOverrides.fontSize = ref;
		else if (binding === "captionWeight") captionOverrides.fontWeight = ref;
	}
	return {
		rootStyle,
		captionOverrides
	};
}
const isDev$2 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function interpolate$2(template, values) {
	return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}
/** localeCompare for strings, numeric otherwise. */
function compareRowValues$1(a, b) {
	if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, void 0, { numeric: true });
	return Number(a) - Number(b);
}
function cellValue$1(column, row) {
	return row[column.key];
}
function cellText$1(column, row) {
	const value = cellValue$1(column, row);
	return value === void 0 || value === null ? "" : String(value);
}
function rowName$1(row, rowHeaderColumn) {
	if (!rowHeaderColumn) return row.id;
	return cellText$1(rowHeaderColumn, row) || row.id;
}
function nextSortDirection(activeSort, columnKey) {
	if (activeSort?.column === columnKey) return activeSort.direction === "ascending" ? "descending" : "ascending";
	return "ascending";
}
function sortButtonLabel(column, activeSort) {
	return interpolate$2(nextSortDirection(activeSort, column.key) === "ascending" ? COPY$4.sortAscending : COPY$4.sortDescending, { column: column.header });
}
function alignClass(column) {
	return column.align === "end" ? "ds-data-grid__cell--align-end" : column.align === "center" ? "ds-data-grid__cell--align-center" : null;
}
/** Focusable descendants of a cell's custom `render` output (a Link, a Button) — the "focus inside
* the cell" APG mode. */
const FOCUSABLE_SELECTOR$2 = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/**
* DataGrid — Design Schema, category: data.
*
* When to use:
* Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll
* through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin
* views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and
* mark the columns that may change; give every editable column a `validate`. Use `height: viewport`
* (the default) so the grid, not the page, scrolls.
*/
const DataGrid = function DataGrid({ ref, caption, hideCaption = false, columns, data, rowCount, sort, defaultSort, selectable = "none", selected, editable = false, density = "compact", stickyHeader = true, height = "viewport", loading = false, emptyMessage, showStatusBar = true, container, overrides, onSortChange, onSelectionChange, onCellChange, onEditStart, onRangeNeeded, onColumnResize, className, style, ...rest }) {
	const baseId = `ds-data-grid${useId()}`;
	const captionId = `${baseId}-caption`;
	const statusBarId = `${baseId}-status`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const scrollRegionRef = useRef(null);
	const sizerRef = useRef(null);
	const resizeStepSizerRef = useRef(null);
	const cellRefs = useRef(/* @__PURE__ */ new Map());
	const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);
	if (isDev$2) {
		const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
		if (rowHeaderCount !== 1) console.warn(`DataGrid: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
	}
	const isSortControlled = sort !== void 0;
	const [internalSort, setInternalSort] = useState(defaultSort);
	const activeSort = isSortControlled ? sort : internalSort;
	const sortedData = useMemo(() => {
		if (isSortControlled || !activeSort || rowCount !== void 0) return data;
		const column = activeSort.column;
		const factor = activeSort.direction === "ascending" ? 1 : -1;
		return [...data].sort((a, b) => compareRowValues$1(a[column], b[column]) * factor);
	}, [
		data,
		isSortControlled,
		activeSort,
		rowCount
	]);
	const [announcement, setAnnouncement] = useState("");
	const announcementTimer = useRef(void 0);
	const announce = (message, sticky = false) => {
		if (announcementTimer.current) clearTimeout(announcementTimer.current);
		setAnnouncement(message);
		if (!sticky) announcementTimer.current = setTimeout(() => setAnnouncement(""), ANNOUNCEMENT_TIMEOUT_MS$1);
	};
	useEffect(() => () => clearTimeout(announcementTimer.current), []);
	const handleSort = (column) => {
		const direction = nextSortDirection(activeSort, column.key);
		const next = {
			column: column.key,
			direction
		};
		if (!isSortControlled) setInternalSort(next);
		onSortChange?.(next);
		announce(interpolate$2(COPY$4.sortedAnnouncement, {
			column: column.header,
			direction
		}));
	};
	const isSelectionControlled = selected !== void 0;
	const [internalSelected, setInternalSelected] = useState([]);
	const selectedIds = isSelectionControlled ? selected : internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const [cellSelection, setCellSelection] = useState();
	const [rangeSelection, setRangeSelection] = useState();
	const anchorRef = useRef(null);
	const commitRowSelection = (next) => {
		if (!isSelectionControlled) setInternalSelected(next);
		onSelectionChange?.(next);
		announce(interpolate$2(COPY$4.selectedRows, {
			count: next.length,
			total: sortedData.length
		}));
	};
	const toggleRow = (id) => {
		commitRowSelection(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
	};
	const allIds = useMemo(() => sortedData.map((row) => row.id), [sortedData]);
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const handleToggleAll = () => commitRowSelection(allSelected ? [] : allIds);
	const commitRangeSelection = (range) => {
		setRangeSelection(range);
		const fromRow = sortedData.findIndex((row) => row.id === range.from.rowId);
		const toRow = sortedData.findIndex((row) => row.id === range.to.rowId);
		const fromCol = columns.findIndex((column) => column.key === range.from.column);
		const toCol = columns.findIndex((column) => column.key === range.to.column);
		onSelectionChange?.(range);
		announce(interpolate$2(COPY$4.selectedRange, {
			rows: Math.abs(toRow - fromRow) + 1,
			columns: Math.abs(toCol - fromCol) + 1
		}));
	};
	const [editing, setEditing] = useState();
	const [editingValue, setEditingValue] = useState();
	const [editingError, setEditingError] = useState();
	const editingValueRef = useRef(void 0);
	const isEditingRef = useRef(false);
	isEditingRef.current = editing !== void 0;
	const focusGrid = () => scrollRegionRef.current?.focus();
	const openEditor = (rowId, columnKey, seedValue) => {
		const column = columns.find((entry) => entry.key === columnKey);
		const row = sortedData.find((entry) => entry.id === rowId);
		if (!column || !row) return;
		if (onEditStart?.({
			rowId,
			column: columnKey
		}) === false) return;
		const initial = seedValue !== void 0 ? seedValue : cellValue$1(column, row);
		editingValueRef.current = initial;
		setEditing({
			rowId,
			column: columnKey
		});
		setEditingValue(initial);
		setEditingError(void 0);
		announce(interpolate$2(COPY$4.editing, { column: column.header }), true);
	};
	const updateEditingValue = (value) => {
		editingValueRef.current = value;
		setEditingValue(value);
	};
	const cancelEdit = () => {
		isEditingRef.current = false;
		setEditing(void 0);
		setEditingValue(void 0);
		setEditingError(void 0);
		focusGrid();
	};
	const commitEditWithValue = (value, moveDown) => {
		if (!editing) return;
		const column = columns.find((entry) => entry.key === editing.column);
		const row = sortedData.find((entry) => entry.id === editing.rowId);
		if (!column || !row) return;
		const error = column.validate?.(value, row);
		if (error) {
			setEditingError(error);
			announce(interpolate$2(COPY$4.invalid, { message: error }), true);
			return;
		}
		const previous = cellValue$1(column, row);
		isEditingRef.current = false;
		setEditing(void 0);
		setEditingValue(void 0);
		setEditingError(void 0);
		onCellChange?.({
			rowId: editing.rowId,
			column: editing.column,
			value,
			previous
		});
		if (moveDown) moveActiveCell(1, 0);
		focusGrid();
	};
	const [columnWidths, setColumnWidths] = useState(() => {
		const initial = {};
		for (const column of columns) initial[column.key] = column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH$1;
		return initial;
	});
	useEffect(() => {
		setColumnWidths((current) => {
			let changed = false;
			const next = { ...current };
			for (const column of columns) if (next[column.key] === void 0) {
				next[column.key] = column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH$1;
				changed = true;
			}
			return changed ? next : current;
		});
	}, [columns]);
	const hasSelectColumn = selectable === "row";
	const colCount = (hasSelectColumn ? 1 : 0) + columns.length;
	const gridTemplateColumns = [hasSelectColumn ? "var(--size-target-min)" : null, ...columns.map((column) => `${columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH$1}px`)].filter(Boolean).join(" ");
	/** Pinned columns are assumed contiguous from the start/end of `columns`; the auto-added select
	* column never pins (the schema has no such switch for it). */
	const leftOffset = (key) => {
		let sum = 0;
		for (const column of columns) {
			if (column.key === key) break;
			if (column.pinned === "start") sum += columnWidths[column.key] ?? 0;
		}
		return sum;
	};
	const rightOffset = (key) => {
		let sum = 0;
		for (let i = columns.length - 1; i >= 0; i -= 1) {
			const column = columns[i];
			if (column.key === key) break;
			if (column.pinned === "end") sum += columnWidths[column.key] ?? 0;
		}
		return sum;
	};
	const pinnedStyle = (column) => {
		if (!column.pinned) return void 0;
		return column.pinned === "start" ? {
			position: "sticky",
			insetInlineStart: leftOffset(column.key),
			zIndex: "var(--layer-raised)"
		} : {
			position: "sticky",
			insetInlineEnd: rightOffset(column.key),
			zIndex: "var(--layer-raised)"
		};
	};
	const startResize = (column, event) => {
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH$1;
		const handleMove = (moveEvent) => {
			const width = Math.max(column.minWidth ?? MIN_COLUMN_WIDTH, startWidth + (moveEvent.clientX - startX));
			setColumnWidths((current) => ({
				...current,
				[column.key]: width
			}));
		};
		const handleUp = () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseup", handleUp);
			onColumnResize?.({
				column: column.key,
				width: columnWidths[column.key] ?? startWidth
			});
		};
		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);
	};
	const resizeByKeyboard = (column, delta) => {
		const width = Math.max(column.minWidth ?? MIN_COLUMN_WIDTH, (columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH$1) + delta);
		setColumnWidths((current) => ({
			...current,
			[column.key]: width
		}));
		onColumnResize?.({
			column: column.key,
			width
		});
	};
	const [rowHeightPx, setRowHeightPx] = useState(32);
	useLayoutEffect(() => {
		const sizer = sizerRef.current;
		if (!sizer || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => setRowHeightPx(entry.contentRect.height || 32));
		observer.observe(sizer);
		return () => observer.disconnect();
	}, [density]);
	const [resizeStepPx, setResizeStepPx] = useState(DEFAULT_RESIZE_STEP_PX);
	useLayoutEffect(() => {
		const sizer = resizeStepSizerRef.current;
		if (!sizer || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => setResizeStepPx(entry.contentRect.width || DEFAULT_RESIZE_STEP_PX));
		observer.observe(sizer);
		return () => observer.disconnect();
	}, [overrides]);
	const virtualize = height !== "content";
	const totalRows = rowCount ?? sortedData.length;
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	useLayoutEffect(() => {
		const region = scrollRegionRef.current;
		if (!region || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => setViewportHeight(entry.contentRect.height));
		observer.observe(region);
		return () => observer.disconnect();
	}, []);
	const pageSize = Math.max(1, Math.ceil((viewportHeight || rowHeightPx * 10) / rowHeightPx));
	const startIndex = virtualize ? Math.max(0, Math.floor(scrollTop / rowHeightPx) - pageSize) : 0;
	const endIndex = virtualize ? Math.min(sortedData.length - 1, Math.floor(scrollTop / rowHeightPx) + pageSize * 2) : sortedData.length - 1;
	const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
	const [scrolledHorizontally, setScrolledHorizontally] = useState(false);
	const handleScroll = (event) => {
		setScrollTop(event.currentTarget.scrollTop);
		setScrolledUnderHeader(event.currentTarget.scrollTop > 0);
		setScrolledHorizontally(event.currentTarget.scrollLeft > 0);
	};
	const requestedRangeRef = useRef(-1);
	useEffect(() => {
		if (!onRangeNeeded || rowCount === void 0 || rowCount <= sortedData.length) return;
		if (endIndex >= sortedData.length - 1 && requestedRangeRef.current < sortedData.length) {
			requestedRangeRef.current = sortedData.length;
			onRangeNeeded({
				start: sortedData.length,
				end: Math.min(rowCount, sortedData.length + pageSize)
			});
		}
	}, [
		endIndex,
		sortedData.length,
		rowCount,
		pageSize,
		onRangeNeeded
	]);
	const [activeCell, setActiveCell] = useState({
		row: -1,
		col: 0
	});
	const cellId = (row, col) => row === -1 ? `${baseId}-header-cell-${col}` : `${baseId}-cell-${row}-${col}`;
	const activeDescendantId = editing ? void 0 : cellId(activeCell.row, activeCell.col);
	const columnAtIndex = (col) => {
		if (hasSelectColumn && col === 0) return "select";
		return columns[col - (hasSelectColumn ? 1 : 0)];
	};
	const scrollRowIntoView = (rowIndex) => {
		const region = scrollRegionRef.current;
		if (!region || !virtualize) return;
		const top = rowIndex * rowHeightPx;
		const bottom = top + rowHeightPx;
		if (top < region.scrollTop) region.scrollTop = top;
		else if (bottom > region.scrollTop + region.clientHeight) region.scrollTop = bottom - region.clientHeight;
	};
	const applyFocusForSelectable = (row, col) => {
		if (row < 0) return;
		const column = columnAtIndex(col);
		if (!column || column === "select") return;
		const rowId = sortedData[row]?.id;
		if (!rowId) return;
		if (selectable === "cell") {
			const next = {
				rowId,
				column: column.key
			};
			setCellSelection(next);
			onSelectionChange?.(next);
		} else if (selectable === "range") {
			const next = {
				rowId,
				column: column.key
			};
			anchorRef.current = next;
			commitRangeSelection({
				from: next,
				to: next
			});
		}
	};
	const moveActiveCell = (deltaRow, deltaCol, extend = false) => {
		setActiveCell((current) => {
			const nextRow = Math.max(-1, Math.min(sortedData.length - 1, current.row + deltaRow));
			const nextCol = Math.max(0, Math.min(colCount - 1, current.col + deltaCol));
			if (extend && selectable === "range" && anchorRef.current) {
				const column = columnAtIndex(nextCol);
				if (nextRow >= 0 && column && column !== "select") {
					const rowId = sortedData[nextRow]?.id;
					if (rowId) commitRangeSelection({
						from: anchorRef.current,
						to: {
							rowId,
							column: column.key
						}
					});
				}
			} else applyFocusForSelectable(nextRow, nextCol);
			if (nextRow >= 0) scrollRowIntoView(nextRow);
			return {
				row: nextRow,
				col: nextCol
			};
		});
	};
	const setActiveCellTo = (row, col, extend = false) => {
		if (extend && selectable === "range" && anchorRef.current) {
			const column = columnAtIndex(col);
			if (row >= 0 && column && column !== "select") {
				const rowId = sortedData[row]?.id;
				if (rowId) commitRangeSelection({
					from: anchorRef.current,
					to: {
						rowId,
						column: column.key
					}
				});
			}
		} else applyFocusForSelectable(row, col);
		if (row >= 0) scrollRowIntoView(row);
		setActiveCell({
			row,
			col
		});
	};
	const copySelectionAsTsv = async () => {
		if (selectable !== "range" || !rangeSelection) return;
		const fromRow = sortedData.findIndex((row) => row.id === rangeSelection.from.rowId);
		const toRow = sortedData.findIndex((row) => row.id === rangeSelection.to.rowId);
		const fromCol = columns.findIndex((column) => column.key === rangeSelection.from.column);
		const toCol = columns.findIndex((column) => column.key === rangeSelection.to.column);
		const rowStart = Math.min(fromRow, toRow);
		const rowEnd = Math.max(fromRow, toRow);
		const colStart = Math.min(fromCol, toCol);
		const colEnd = Math.max(fromCol, toCol);
		if (rowStart < 0 || colStart < 0) return;
		const spanColumns = columns.slice(colStart, colEnd + 1);
		const wholeColumns = rowStart === 0 && rowEnd === sortedData.length - 1;
		const lines = [];
		if (wholeColumns) lines.push(spanColumns.map((column) => column.header).join("	"));
		for (let r = rowStart; r <= rowEnd; r += 1) {
			const row = sortedData[r];
			if (!row) continue;
			lines.push(spanColumns.map((column) => cellText$1(column, row)).join("	"));
		}
		try {
			await navigator.clipboard.writeText(lines.join("\n"));
		} catch {}
		announce(interpolate$2(COPY$4.copied, { cells: (rowEnd - rowStart + 1) * (colEnd - colStart + 1) }));
	};
	const clearSelectionValues = () => {
		if (!editable) return;
		const targets = [];
		if (selectable === "row") {
			for (const id of selectedIds) for (const column of columns) if (column.editable) targets.push({
				rowId: id,
				column: column.key
			});
		} else if (selectable === "cell" && cellSelection) targets.push(cellSelection);
		else if (selectable === "range" && rangeSelection) {
			const fromRow = sortedData.findIndex((row) => row.id === rangeSelection.from.rowId);
			const toRow = sortedData.findIndex((row) => row.id === rangeSelection.to.rowId);
			const fromCol = columns.findIndex((column) => column.key === rangeSelection.from.column);
			const toCol = columns.findIndex((column) => column.key === rangeSelection.to.column);
			for (let r = Math.min(fromRow, toRow); r <= Math.max(fromRow, toRow); r += 1) for (let c = Math.min(fromCol, toCol); c <= Math.max(fromCol, toCol); c += 1) {
				const column = columns[c];
				const row = sortedData[r];
				if (column?.editable && row) targets.push({
					rowId: row.id,
					column: column.key
				});
			}
		}
		for (const target of targets) {
			const column = columns.find((entry) => entry.key === target.column);
			const row = sortedData.find((entry) => entry.id === target.rowId);
			if (!column || !row) continue;
			onCellChange?.({
				rowId: target.rowId,
				column: target.column,
				value: void 0,
				previous: cellValue$1(column, row)
			});
		}
	};
	const handleKeyDown = (event) => {
		if (editing) return;
		const { row, col } = activeCell;
		const column = columnAtIndex(col);
		switch (event.key) {
			case "ArrowRight":
				event.preventDefault();
				moveActiveCell(0, 1, event.shiftKey);
				return;
			case "ArrowLeft":
				event.preventDefault();
				moveActiveCell(0, -1, event.shiftKey);
				return;
			case "ArrowDown":
				event.preventDefault();
				moveActiveCell(1, 0, event.shiftKey);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveActiveCell(-1, 0, event.shiftKey);
				return;
			case "Home":
				event.preventDefault();
				if (event.ctrlKey) setActiveCellTo(-1, 0);
				else setActiveCellTo(row, 0);
				return;
			case "End":
				event.preventDefault();
				if (event.ctrlKey) setActiveCellTo(sortedData.length - 1, colCount - 1);
				else setActiveCellTo(row, colCount - 1);
				return;
			case "PageDown":
				event.preventDefault();
				moveActiveCell(pageSize, 0);
				return;
			case "PageUp":
				event.preventDefault();
				moveActiveCell(-pageSize, 0);
				return;
			case "Enter":
				event.preventDefault();
				if (row === -1) {
					if (column && column !== "select" && column.sortable) handleSort(column);
					return;
				}
				if (column && column !== "select") {
					if (editable && column.editable) openEditor(sortedData[row].id, column.key);
					else activateCellControl(row, col);
				}
				return;
			case "F2":
				event.preventDefault();
				if (row >= 0 && column && column !== "select" && editable && column.editable) openEditor(sortedData[row].id, column.key);
				return;
			case "Escape":
				if (selectable === "range" && rangeSelection) {
					event.preventDefault();
					setRangeSelection(void 0);
					onSelectionChange?.([]);
				}
				return;
			case " ":
				if (selectable === "row" || selectable === "range") {
					event.preventDefault();
					if (row < 0) return;
					const rowId = sortedData[row]?.id;
					if (!rowId) return;
					if (selectable === "row") {
						if (event.shiftKey && anchorRef.current) {
							const anchorRow = sortedData.findIndex((entry) => entry.id === anchorRef.current.rowId);
							const lo = Math.min(anchorRow, row);
							const hi = Math.max(anchorRow, row);
							commitRowSelection(sortedData.slice(lo, hi + 1).map((entry) => entry.id));
						} else {
							anchorRef.current = {
								rowId,
								column: column && column !== "select" ? column.key : columns[0]?.key ?? ""
							};
							toggleRow(rowId);
						}
					} else if (event.ctrlKey && column && column !== "select") commitRangeSelection({
						from: {
							rowId: sortedData[0].id,
							column: column.key
						},
						to: {
							rowId: sortedData[sortedData.length - 1].id,
							column: column.key
						}
					});
				}
				return;
			case "a":
			case "A":
				if (event.ctrlKey && (selectable === "row" || selectable === "range")) {
					event.preventDefault();
					if (selectable === "row") commitRowSelection(allIds);
					else if (columns.length > 0 && sortedData.length > 0) commitRangeSelection({
						from: {
							rowId: sortedData[0].id,
							column: columns[0].key
						},
						to: {
							rowId: sortedData[sortedData.length - 1].id,
							column: columns[columns.length - 1].key
						}
					});
				}
				return;
			case "c":
			case "C":
				if (event.ctrlKey && selectable === "range") {
					event.preventDefault();
					copySelectionAsTsv();
				}
				return;
			case "Delete":
			case "Backspace":
				if (editable && (selectedIds.length > 0 || cellSelection || rangeSelection)) {
					event.preventDefault();
					clearSelectionValues();
				}
				return;
		}
	};
	const activateCellControl = (row, col) => {
		const control = cellRefs.current.get(`${sortedData[row]?.id}:${columnAtIndex(col) !== "select" ? columnAtIndex(col)?.key : ""}`)?.querySelector(FOCUSABLE_SELECTOR$2);
		control?.focus();
		control?.click();
	};
	const handleEditorWrapperKeyDown = (column) => (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			commitEditWithValue(editingValueRef.current, true);
		} else if (event.key === "F2") {
			event.preventDefault();
			commitEditWithValue(editingValueRef.current, false);
		} else if (event.key === "Escape" && (column.editor === "text" || column.editor === "number" || column.editor === void 0)) {
			event.preventDefault();
			cancelEdit();
		}
		event.stopPropagation();
	};
	const handleEditorBlur = () => {
		if (isEditingRef.current) commitEditWithValue(editingValueRef.current, false);
	};
	const [overlayRect, setOverlayRect] = useState();
	useLayoutEffect(() => {
		if (selectable !== "range" || !rangeSelection) {
			setOverlayRect(void 0);
			return;
		}
		const scrollEl = scrollRegionRef.current;
		const fromEl = cellRefs.current.get(`${rangeSelection.from.rowId}:${rangeSelection.from.column}`);
		const toEl = cellRefs.current.get(`${rangeSelection.to.rowId}:${rangeSelection.to.column}`);
		if (!scrollEl || !fromEl || !toEl) {
			setOverlayRect(void 0);
			return;
		}
		const scrollRect = scrollEl.getBoundingClientRect();
		const a = fromEl.getBoundingClientRect();
		const b = toEl.getBoundingClientRect();
		const left = Math.min(a.left, b.left) - scrollRect.left + scrollEl.scrollLeft;
		const top = Math.min(a.top, b.top) - scrollRect.top + scrollEl.scrollTop;
		const right = Math.max(a.right, b.right) - scrollRect.left + scrollEl.scrollLeft;
		const bottom = Math.max(a.bottom, b.bottom) - scrollRect.top + scrollEl.scrollTop;
		setOverlayRect({
			insetInlineStart: left,
			insetBlockStart: top,
			inlineSize: right - left,
			blockSize: bottom - top
		});
	}, [
		selectable,
		rangeSelection,
		startIndex,
		endIndex,
		scrollTop
	]);
	const draggingRef = useRef(false);
	useEffect(() => {
		const handleUp = () => {
			draggingRef.current = false;
		};
		window.addEventListener("mouseup", handleUp);
		return () => window.removeEventListener("mouseup", handleUp);
	}, []);
	const handleCellMouseDown = (rowIndex, colIndex) => {
		focusGrid();
		setActiveCell({
			row: rowIndex,
			col: colIndex
		});
		const column = columnAtIndex(colIndex);
		if (!column || column === "select") return;
		const rowId = sortedData[rowIndex]?.id;
		if (!rowId) return;
		if (selectable === "cell") {
			const next = {
				rowId,
				column: column.key
			};
			setCellSelection(next);
			onSelectionChange?.(next);
		} else if (selectable === "range") {
			anchorRef.current = {
				rowId,
				column: column.key
			};
			draggingRef.current = true;
			commitRangeSelection({
				from: anchorRef.current,
				to: anchorRef.current
			});
		}
	};
	const handleCellMouseEnter = (rowIndex, colIndex) => {
		if (!draggingRef.current || selectable !== "range" || !anchorRef.current) return;
		const column = columnAtIndex(colIndex);
		if (!column || column === "select") return;
		const rowId = sortedData[rowIndex]?.id;
		if (!rowId) return;
		commitRangeSelection({
			from: anchorRef.current,
			to: {
				rowId,
				column: column.key
			}
		});
	};
	const renderEditor = (column, row) => {
		const editorName = `${baseId}-editor-${row.id}-${column.key}`;
		switch (column.editor) {
			case "number": return /* @__PURE__ */ jsx(NumberInput, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "number" ? editingValue : void 0,
				error: editingError,
				autoFocus: true,
				onChange: (value) => updateEditingValue(value)
			});
			case "select": return /* @__PURE__ */ jsx(Select, {
				label: column.header,
				name: editorName,
				options: column.options ?? [],
				value: typeof editingValue === "string" ? editingValue : "",
				error: editingError,
				container,
				onChange: (value) => {
					updateEditingValue(value);
					commitEditWithValue(value, true);
				}
			});
			case "date": return /* @__PURE__ */ jsx(DatePicker, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "string" ? editingValue : void 0,
				error: editingError,
				container,
				onChange: (value) => {
					updateEditingValue(value);
					if (value !== void 0) commitEditWithValue(value, true);
				}
			});
			case "checkbox": return /* @__PURE__ */ jsx(Checkbox, {
				label: column.header,
				name: editorName,
				checked: Boolean(editingValue),
				onChange: (checked) => {
					updateEditingValue(checked);
					commitEditWithValue(checked, true);
				}
			});
			default: return /* @__PURE__ */ jsx(Input, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "string" ? editingValue : "",
				error: editingError,
				autoFocus: true,
				onChange: (value) => updateEditingValue(value)
			});
		}
	};
	const renderResizeHandle = (column) => /* @__PURE__ */ jsx("div", {
		role: "separator",
		"aria-orientation": "vertical",
		"aria-valuenow": Math.round(columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH$1),
		"aria-label": interpolate$2(COPY$4.resize, { column: column.header }),
		tabIndex: -1,
		className: "ds-data-grid__resize-handle",
		"data-part": "resizeHandle",
		onMouseDown: (event) => startResize(column, event),
		onKeyDown: (event) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				resizeByKeyboard(column, -resizeStepPx);
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				resizeByKeyboard(column, resizeStepPx);
			} else if (event.key === "Escape") focusGrid();
			event.stopPropagation();
		}
	});
	const renderHeaderCell = (column, index) => {
		const colIndex = index + (hasSelectColumn ? 1 : 0);
		const isActive = activeCell.row === -1 && activeCell.col === colIndex;
		const sorted = column.sortable ? activeSort?.column === column.key : void 0;
		const classes = [
			"ds-data-grid__cell",
			"ds-data-grid__cell--header",
			alignClass(column),
			column.pinned ? `ds-data-grid__cell--pinned-${column.pinned}` : null,
			column.pinned && scrolledHorizontally ? "ds-data-grid__cell--pinned-shadow" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("div", {
			id: cellId(-1, colIndex),
			role: "columnheader",
			"aria-colindex": colIndex + 1,
			"aria-sort": column.sortable ? sorted ? activeSort.direction : "none" : void 0,
			"data-part": "columnHeader",
			"data-active": isActive ? "true" : void 0,
			className: classes,
			style: pinnedStyle(column),
			onMouseDown: () => {
				focusGrid();
				setActiveCell({
					row: -1,
					col: colIndex
				});
			},
			children: [column.sortable ? /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				size: "sm",
				label: sortButtonLabel(column, activeSort),
				trailingIcon: /* @__PURE__ */ jsx(Icon, {
					name: sorted && activeSort?.direction === "descending" ? "chevron-down" : "chevron-up",
					inline: true
				}),
				className: "ds-data-grid__sort-button",
				"data-part": "sortButton",
				tabIndex: -1,
				onMouseDown: (event) => event.preventDefault(),
				onClick: () => handleSort(column)
			}) : column.abbr ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				children: column.abbr
			}), /* @__PURE__ */ jsx("span", {
				className: "ds-data-grid__visually-hidden",
				children: column.header
			})] }) : column.header, column.resizable ? renderResizeHandle(column) : null]
		}, column.key);
	};
	const renderCell = (row, rowIndex, column, colIndex) => {
		const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
		const isEditingThis = editing?.rowId === row.id && editing.column === column.key;
		const isSelected = selectable === "cell" ? cellSelection?.rowId === row.id && cellSelection.column === column.key : selectable === "range" && rangeSelection ? isWithinRange(sortedData, columns, rangeSelection, row.id, column.key) : false;
		const classes = [
			"ds-data-grid__cell",
			alignClass(column),
			column.pinned ? `ds-data-grid__cell--pinned-${column.pinned}` : null,
			column.pinned && scrolledHorizontally ? "ds-data-grid__cell--pinned-shadow" : null,
			isSelected ? "ds-data-grid__cell--selected" : null,
			isEditingThis ? "ds-data-grid__cell--editing" : null,
			isEditingThis && editingError ? "ds-data-grid__cell--invalid" : null
		].filter(Boolean).join(" ");
		const role = column.isRowHeader ? "rowheader" : "gridcell";
		return /* @__PURE__ */ jsx("div", {
			id: cellId(rowIndex, colIndex),
			ref: (node) => {
				if (node) cellRefs.current.set(`${row.id}:${column.key}`, node);
				else cellRefs.current.delete(`${row.id}:${column.key}`);
			},
			role,
			"aria-colindex": colIndex + 1,
			"aria-selected": selectable === "cell" || selectable === "range" ? isSelected ? "true" : "false" : void 0,
			tabIndex: -1,
			"data-part": column.isRowHeader ? "rowHeader" : "cell",
			"data-active": isActive ? "true" : void 0,
			className: classes,
			style: pinnedStyle(column),
			onMouseDown: () => handleCellMouseDown(rowIndex, colIndex),
			onMouseEnter: () => handleCellMouseEnter(rowIndex, colIndex),
			onDoubleClick: () => {
				if (editable && column.editable) openEditor(row.id, column.key);
			},
			children: isEditingThis ? /* @__PURE__ */ jsx("div", {
				className: "ds-data-grid__editor",
				"data-part": "editor",
				onKeyDown: handleEditorWrapperKeyDown(column),
				onBlur: (event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) handleEditorBlur();
				},
				children: renderEditor(column, row)
			}) : column.render ? /* @__PURE__ */ jsx("div", {
				className: "ds-data-grid__cell-content",
				"data-part": "cellContent",
				children: column.render(row)
			}) : /* @__PURE__ */ jsx("span", {
				className: "ds-data-grid__cell-content",
				"data-part": "cellContent",
				children: cellText$1(column, row)
			})
		}, column.key);
	};
	const renderRow = (row, rowIndex) => {
		const isSelected = selectable === "row" && selectedSet.has(row.id);
		const style = { gridTemplateColumns };
		if (virtualize) {
			style.position = "absolute";
			style.insetBlockStart = 0;
			style.insetInlineStart = 0;
			style.inlineSize = "100%";
			style.transform = `translateY(${rowIndex * rowHeightPx}px)`;
		}
		return /* @__PURE__ */ jsxs("div", {
			role: "row",
			"aria-rowindex": rowIndex + 2,
			"aria-selected": selectable === "row" ? isSelected ? "true" : "false" : void 0,
			className: ["ds-data-grid__row", isSelected ? "ds-data-grid__row--selected" : null].filter(Boolean).join(" "),
			"data-part": "row",
			style,
			children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
				role: "gridcell",
				"aria-colindex": 1,
				className: "ds-data-grid__cell ds-data-grid__cell--select",
				"data-part": "selectCell",
				children: /* @__PURE__ */ jsx(Checkbox, {
					label: interpolate$2(COPY$4.selectRow, { rowName: rowName$1(row, rowHeaderColumn) }),
					name: `${baseId}-select-${row.id}`,
					checked: isSelected,
					onChange: () => toggleRow(row.id)
				})
			}) : null, columns.map((column, index) => renderCell(row, rowIndex, column, index + (hasSelectColumn ? 1 : 0)))]
		}, row.id);
	};
	const classes = [
		"ds-data-grid",
		`ds-data-grid--density-${density}`,
		`ds-data-grid--height-${height}`,
		stickyHeader ? "ds-data-grid--sticky-header" : null,
		scrolledUnderHeader ? "ds-data-grid--scrolled-under-header" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const { rootStyle, captionOverrides } = overrides ? overridesToStyle$4(overrides) : {
		rootStyle: void 0,
		captionOverrides: { marginBlockEnd: "space.0" }
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const visibleRows = sortedData.slice(startIndex, endIndex + 1);
	const statusText = loading ? COPY$4.loading : editingError ? interpolate$2(COPY$4.invalid, { message: editingError }) : announcement || (selectable === "row" && selectedIds.length > 0 ? interpolate$2(COPY$4.selectedRows, {
		count: selectedIds.length,
		total: sortedData.length
	}) : selectable === "range" && rangeSelection ? announcement : interpolate$2(COPY$4.rowCount, { count: totalRows }));
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "DataGrid",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsx("div", {
				id: captionId,
				"data-part": "caption",
				className: hideCaption ? "ds-data-grid__visually-hidden" : "ds-data-grid__caption",
				children: /* @__PURE__ */ jsx(Heading, {
					level: 2,
					size: "md",
					overrides: captionOverrides,
					children: caption
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: scrollRegionRef,
				role: "grid",
				"data-part": "scrollRegion",
				className: "ds-data-grid__scroll-region",
				"aria-labelledby": captionId,
				"aria-rowcount": totalRows + 1,
				"aria-colcount": colCount,
				"aria-multiselectable": selectable === "row" || selectable === "range" ? "true" : void 0,
				"aria-readonly": !editable ? "true" : void 0,
				"aria-busy": loading ? "true" : void 0,
				"aria-describedby": statusBarId,
				tabIndex: 0,
				"aria-activedescendant": activeDescendantId,
				onKeyDown: handleKeyDown,
				onScroll: handleScroll,
				children: [
					/* @__PURE__ */ jsx("div", {
						ref: sizerRef,
						"aria-hidden": "true",
						className: "ds-data-grid__row-sizer"
					}),
					/* @__PURE__ */ jsx("div", {
						ref: resizeStepSizerRef,
						"aria-hidden": "true",
						className: "ds-data-grid__resize-step-sizer"
					}),
					/* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "header",
						className: stickyHeader ? "ds-data-grid__header ds-data-grid__header--sticky" : "ds-data-grid__header",
						children: /* @__PURE__ */ jsxs("div", {
							role: "row",
							"aria-rowindex": 1,
							className: "ds-data-grid__row ds-data-grid__row--header",
							"data-part": "headerRow",
							style: { gridTemplateColumns },
							children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
								role: "columnheader",
								"aria-colindex": 1,
								id: cellId(-1, 0),
								"data-part": "selectAllCell",
								"data-active": activeCell.row === -1 && activeCell.col === 0 ? "true" : void 0,
								className: "ds-data-grid__cell ds-data-grid__cell--header ds-data-grid__cell--select",
								onMouseDown: () => {
									focusGrid();
									setActiveCell({
										row: -1,
										col: 0
									});
								},
								children: /* @__PURE__ */ jsx(Checkbox, {
									label: COPY$4.selectAll,
									name: `${baseId}-select-all`,
									checked: allSelected,
									indeterminate: someSelected,
									onChange: handleToggleAll
								})
							}) : null, columns.map((column, index) => renderHeaderCell(column, index))]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						role: "rowgroup",
						"data-part": "body",
						className: "ds-data-grid__body",
						children: [sortedData.length === 0 ? /* @__PURE__ */ jsx("div", {
							role: "row",
							className: "ds-data-grid__row",
							children: /* @__PURE__ */ jsx("div", {
								role: "gridcell",
								className: "ds-data-grid__empty",
								style: { gridColumn: `1 / span ${colCount}` },
								children: /* @__PURE__ */ jsx(Text, {
									element: "p",
									tone: "muted",
									"data-part": "emptyState",
									children: loading ? COPY$4.loading : emptyMessage ?? COPY$4.empty
								})
							})
						}) : virtualize ? /* @__PURE__ */ jsx("div", {
							className: "ds-data-grid__spacer",
							style: {
								position: "relative",
								blockSize: totalRows * rowHeightPx
							},
							children: visibleRows.map((row, i) => renderRow(row, startIndex + i))
						}) : visibleRows.map((row, i) => renderRow(row, i)), overlayRect ? /* @__PURE__ */ jsx("div", {
							"aria-hidden": "true",
							className: "ds-data-grid__range-overlay",
							"data-part": "rangeOverlay",
							style: overlayRect
						}) : null]
					})
				]
			}),
			showStatusBar ? /* @__PURE__ */ jsx("div", {
				id: statusBarId,
				role: "status",
				"aria-live": "polite",
				className: "ds-data-grid__status-bar",
				"data-part": "statusBar",
				children: /* @__PURE__ */ jsx(Text, {
					size: "xs",
					tone: "muted",
					children: statusText
				})
			}) : /* @__PURE__ */ jsx("span", {
				id: statusBarId,
				role: "status",
				"aria-live": "polite",
				className: "ds-data-grid__visually-hidden",
				children: announcement
			})
		]
	});
};
function isWithinRange(data, columns, range, rowId, columnKey) {
	const rowIndex = data.findIndex((row) => row.id === rowId);
	const fromRow = data.findIndex((row) => row.id === range.from.rowId);
	const toRow = data.findIndex((row) => row.id === range.to.rowId);
	const colIndex = columns.findIndex((column) => column.key === columnKey);
	const fromCol = columns.findIndex((column) => column.key === range.from.column);
	const toCol = columns.findIndex((column) => column.key === range.to.column);
	if (rowIndex < 0 || fromRow < 0 || toRow < 0 || colIndex < 0 || fromCol < 0 || toCol < 0) return false;
	return rowIndex >= Math.min(fromRow, toRow) && rowIndex <= Math.max(fromRow, toRow) && colIndex >= Math.min(fromCol, toCol) && colIndex <= Math.max(fromCol, toCol);
}
//#endregion
//#region src/TreeGrid.tsx
/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY$3 = {
	expand: "Expand {rowName}",
	collapse: "Collapse {rowName}",
	level: "Level {level}",
	childCount: "{count} items",
	loading: "Loading",
	expandAll: "Expand all",
	collapseAll: "Collapse all"
};
/**
* The schema's own copy block has no strings for the sort button, the selection summary, or the
* empty state — all behaviors this component reuses "as DataGrid" verbatim. Borrowed from
* DataGrid's copy block (see the gap list) rather than invented.
*/
const BORROWED_COPY = {
	sortAscending: "Sort by {column}, ascending",
	sortDescending: "Sort by {column}, descending",
	sortedAnnouncement: "Sorted by {column}, {direction}",
	selectAll: "Select all rows",
	selectRow: "Select {rowName}",
	selectedRows: "{count} of {total} rows selected",
	rowCount: "{count} rows",
	editing: "Editing {column}. Enter to save, Escape to cancel.",
	invalid: "{message}",
	empty: "Nothing to show."
};
const DEFAULT_COLUMN_WIDTH = 160;
const ANNOUNCEMENT_TIMEOUT_MS = 5e3;
const ROOT_OVERRIDE_HOOK$2 = {
	indent: "--ds-tree-grid-indent",
	expandButtonSize: "--ds-tree-grid-expand-button-size",
	expandGap: "--ds-tree-grid-expand-gap",
	guideLine: "--ds-tree-grid-guide-line",
	guideLineWidth: "--ds-tree-grid-guide-line-width",
	parentWeight: "--ds-tree-grid-parent-weight",
	transition: "--ds-tree-grid-transition"
};
function overridesToStyle$3(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[ROOT_OVERRIDE_HOOK$2[binding]] = cssVar(ref);
	}
	return style;
}
const isDev$1 = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
function interpolate$1(template, values) {
	return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}
function compareRowValues(a, b) {
	if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, void 0, { numeric: true });
	return Number(a) - Number(b);
}
function cellValue(column, row) {
	return row[column.key];
}
function cellText(column, row) {
	const value = cellValue(column, row);
	return value === void 0 || value === null ? "" : String(value);
}
function rowName(row, rowHeaderColumn) {
	if (!rowHeaderColumn) return row.id;
	return cellText(rowHeaderColumn, row) || row.id;
}
function hasLoadedOrLazyChildren(row) {
	return row.children === "lazy" || Array.isArray(row.children) && row.children.length > 0;
}
function sortSiblings(rows, sort) {
	if (!sort) return rows;
	const factor = sort.direction === "ascending" ? 1 : -1;
	return [...rows].sort((a, b) => compareRowValues(a[sort.column], b[sort.column]) * factor);
}
function flattenTree$1(rows, expandedSet, sort) {
	const result = [];
	const walk = (list, level, parentId) => {
		const siblings = sortSiblings(list, sort);
		siblings.forEach((row, index) => {
			const hasChildren = hasLoadedOrLazyChildren(row);
			result.push({
				id: row.id,
				row,
				level,
				posinset: index + 1,
				setsize: siblings.length,
				hasChildren,
				parentId
			});
			if (hasChildren && expandedSet.has(row.id)) {
				if (row.children === "lazy") result.push({
					id: `${row.id}__loading`,
					row,
					level: level + 1,
					posinset: 1,
					setsize: 1,
					hasChildren: false,
					parentId: row.id,
					isPlaceholder: true
				});
				else if (Array.isArray(row.children)) walk(row.children, level + 1, row.id);
			}
		});
	};
	walk(rows, 1, null);
	return result;
}
/** O(n) per call — fine for interaction-driven lookups; only rendering is windowed for scale. */
function findRowAndParent(rows, id, parent = null) {
	for (const row of rows) {
		if (row.id === id) return {
			row,
			parent
		};
		if (Array.isArray(row.children)) {
			const found = findRowAndParent(row.children, id, row);
			if (found) return found;
		}
	}
}
function collectDescendantIds$1(row) {
	if (!Array.isArray(row.children)) return [];
	const ids = [];
	for (const child of row.children) ids.push(child.id, ...collectDescendantIds$1(child));
	return ids;
}
function collectAllIds(rows) {
	const ids = [];
	for (const row of rows) {
		ids.push(row.id);
		if (Array.isArray(row.children)) ids.push(...collectAllIds(row.children));
	}
	return ids;
}
function collectExpandableIds$1(rows) {
	const ids = [];
	for (const row of rows) {
		if (hasLoadedOrLazyChildren(row)) ids.push(row.id);
		if (Array.isArray(row.children)) ids.push(...collectExpandableIds$1(row.children));
	}
	return ids;
}
function rowCheckedState(row, selectedSet, selectChildren) {
	if (!selectChildren) return selectedSet.has(row.id) ? "checked" : "unchecked";
	const descendants = collectDescendantIds$1(row);
	if (descendants.length === 0) return selectedSet.has(row.id) ? "checked" : "unchecked";
	const allIds = [row.id, ...descendants];
	const selectedCount = allIds.filter((id) => selectedSet.has(id)).length;
	if (selectedCount === 0) return "unchecked";
	if (selectedCount === allIds.length) return "checked";
	return "indeterminate";
}
const FOCUSABLE_SELECTOR$1 = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/**
* TreeGrid — Design Schema, category: data.
*
* When to use:
* Use a TreeGrid when records nest and each record has several comparable fields: a chart of
* accounts with balances, folders and files with sizes and dates, a bill of materials with
* quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large
* trees so the first paint is fast. Use `selectChildren` when selection means "this and everything
* in it" (a folder to export).
*/
const TreeGrid = function TreeGrid({ ref, caption, hideCaption = false, columns, data, expanded, defaultExpanded, sort, selectable = "none", selectChildren = false, editable = false, density = "compact", height = "viewport", loading = false, showStatusBar = true, container, overrides, onExpandChange, onExpand, onSortChange, onSelectionChange, onCellChange, className, style, ...rest }) {
	const baseId = `ds-tree-grid${useId()}`;
	const captionId = `${baseId}-caption`;
	const statusBarId = `${baseId}-status`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const scrollRegionRef = useRef(null);
	const sizerRef = useRef(null);
	const cellRefs = useRef(/* @__PURE__ */ new Map());
	const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);
	const rowHeaderIndex = useMemo(() => columns.findIndex((column) => column.isRowHeader), [columns]);
	if (isDev$1) {
		const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
		if (rowHeaderCount !== 1) console.warn(`TreeGrid: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
		else if (rowHeaderIndex !== 0) console.warn("TreeGrid: the `isRowHeader` column should come first (immediately after the selection column).");
	}
	const isExpandedControlled = expanded !== void 0;
	const [internalExpanded, setInternalExpanded] = useState(() => defaultExpanded?.includes("*") ? collectExpandableIds$1(data) : defaultExpanded ?? []);
	const expandedIds = isExpandedControlled ? expanded : internalExpanded;
	const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);
	const setExpanded = (next) => {
		if (!isExpandedControlled) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (id) => {
		const next = expandedSet.has(id) ? expandedIds.filter((existing) => existing !== id) : [...expandedIds, id];
		setExpanded(next);
	};
	const expandSiblings = (visRow) => {
		const siblingList = visRow.parentId ? findRowAndParent(data, visRow.parentId)?.row.children : data;
		if (!Array.isArray(siblingList)) return;
		const ids = siblingList.filter(hasLoadedOrLazyChildren).map((sibling) => sibling.id);
		setExpanded(Array.from(/* @__PURE__ */ new Set([...expandedIds, ...ids])));
	};
	const requestedLazyRef = useRef(/* @__PURE__ */ new Set());
	useEffect(() => {
		for (const id of expandedIds) {
			if (requestedLazyRef.current.has(id)) continue;
			if (findRowAndParent(data, id)?.row.children === "lazy") {
				requestedLazyRef.current.add(id);
				onExpand?.(id);
			}
		}
	}, [
		expandedIds,
		data,
		onExpand
	]);
	const visible = useMemo(() => flattenTree$1(data, expandedSet, sort), [
		data,
		expandedSet,
		sort
	]);
	const allIds = useMemo(() => collectAllIds(data), [data]);
	const nextSortDirection = (columnKey) => sort?.column === columnKey && sort.direction === "ascending" ? "descending" : "ascending";
	const handleSort = (column) => {
		const next = {
			column: column.key,
			direction: nextSortDirection(column.key)
		};
		onSortChange?.(next);
		announce(interpolate$1(BORROWED_COPY.sortedAnnouncement, {
			column: column.header,
			direction: next.direction
		}));
	};
	const sortButtonLabel = (column) => {
		return interpolate$1(nextSortDirection(column.key) === "ascending" ? BORROWED_COPY.sortAscending : BORROWED_COPY.sortDescending, { column: column.header });
	};
	const [announcement, setAnnouncement] = useState("");
	const announcementTimer = useRef(void 0);
	const announce = (message, sticky = false) => {
		if (announcementTimer.current) clearTimeout(announcementTimer.current);
		setAnnouncement(message);
		if (!sticky) announcementTimer.current = setTimeout(() => setAnnouncement(""), ANNOUNCEMENT_TIMEOUT_MS);
	};
	useEffect(() => () => clearTimeout(announcementTimer.current), []);
	const [selectedIds, setSelectedIds] = useState([]);
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const [cellSelection, setCellSelection] = useState();
	const anchorRef = useRef(null);
	const commitRowSelection = (next) => {
		setSelectedIds(next);
		onSelectionChange?.(next);
		announce(interpolate$1(BORROWED_COPY.selectedRows, {
			count: next.length,
			total: allIds.length
		}));
	};
	const toggleRowSelection = (row) => {
		const ids = selectChildren ? [row.id, ...collectDescendantIds$1(row)] : [row.id];
		if (rowCheckedState(row, selectedSet, selectChildren) !== "checked") commitRowSelection(Array.from(/* @__PURE__ */ new Set([...selectedIds, ...ids])));
		else {
			const remove = new Set(ids);
			commitRowSelection(selectedIds.filter((id) => !remove.has(id)));
		}
	};
	const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
	const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
	const handleToggleAll = () => commitRowSelection(allSelected ? [] : allIds);
	const [editing, setEditing] = useState();
	const [editingValue, setEditingValue] = useState();
	const [editingError, setEditingError] = useState();
	const editingValueRef = useRef(void 0);
	const isEditingRef = useRef(false);
	isEditingRef.current = editing !== void 0;
	const focusGrid = () => scrollRegionRef.current?.focus();
	const openEditor = (rowId, columnKey) => {
		const column = columns.find((entry) => entry.key === columnKey);
		const found = findRowAndParent(data, rowId);
		if (!column || !found) return;
		const initial = cellValue(column, found.row);
		editingValueRef.current = initial;
		setEditing({
			rowId,
			column: columnKey
		});
		setEditingValue(initial);
		setEditingError(void 0);
		announce(interpolate$1(BORROWED_COPY.editing, { column: column.header }), true);
	};
	const updateEditingValue = (value) => {
		editingValueRef.current = value;
		setEditingValue(value);
	};
	const cancelEdit = () => {
		isEditingRef.current = false;
		setEditing(void 0);
		setEditingValue(void 0);
		setEditingError(void 0);
		focusGrid();
	};
	const commitEditWithValue = (value, moveDown) => {
		if (!editing) return;
		const column = columns.find((entry) => entry.key === editing.column);
		const found = findRowAndParent(data, editing.rowId);
		if (!column || !found) return;
		const error = column.validate?.(value, found.row);
		if (error) {
			setEditingError(error);
			announce(interpolate$1(BORROWED_COPY.invalid, { message: error }), true);
			return;
		}
		const previous = cellValue(column, found.row);
		isEditingRef.current = false;
		setEditing(void 0);
		setEditingValue(void 0);
		setEditingError(void 0);
		onCellChange?.({
			rowId: editing.rowId,
			column: editing.column,
			value,
			previous
		});
		if (moveDown) moveActiveCell(1, 0);
		focusGrid();
	};
	const hasSelectColumn = selectable === "row";
	const colCount = (hasSelectColumn ? 1 : 0) + columns.length;
	const gridTemplateColumns = [hasSelectColumn ? "var(--size-target-min)" : null, ...columns.map((column) => `${column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH}px`)].filter(Boolean).join(" ");
	const [rowHeightPx, setRowHeightPx] = useState(32);
	useLayoutEffect(() => {
		const sizer = sizerRef.current;
		if (!sizer || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => setRowHeightPx(entry.contentRect.height || 32));
		observer.observe(sizer);
		return () => observer.disconnect();
	}, [density]);
	const virtualize = height !== "content";
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	useLayoutEffect(() => {
		const region = scrollRegionRef.current;
		if (!region || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => setViewportHeight(entry.contentRect.height));
		observer.observe(region);
		return () => observer.disconnect();
	}, []);
	const pageSize = Math.max(1, Math.ceil((viewportHeight || rowHeightPx * 10) / rowHeightPx));
	const startIndex = virtualize ? Math.max(0, Math.floor(scrollTop / rowHeightPx) - pageSize) : 0;
	const endIndex = virtualize ? Math.min(visible.length - 1, Math.floor(scrollTop / rowHeightPx) + pageSize * 2) : visible.length - 1;
	const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
	const handleScroll = (event) => {
		setScrollTop(event.currentTarget.scrollTop);
		setScrolledUnderHeader(event.currentTarget.scrollTop > 0);
	};
	const [activeCell, setActiveCell] = useState({
		row: -1,
		col: 0
	});
	const cellId = (row, col) => row === -1 ? `${baseId}-header-cell-${col}` : `${baseId}-cell-${row}-${col}`;
	const activeDescendantId = editing ? void 0 : cellId(activeCell.row, activeCell.col);
	const columnAtIndex = (col) => {
		if (hasSelectColumn && col === 0) return "select";
		return columns[col - (hasSelectColumn ? 1 : 0)];
	};
	const rowHeaderColIndex = rowHeaderIndex + (hasSelectColumn ? 1 : 0);
	const scrollRowIntoView = (rowIndex) => {
		const region = scrollRegionRef.current;
		if (!region || !virtualize) return;
		const top = rowIndex * rowHeightPx;
		const bottom = top + rowHeightPx;
		if (top < region.scrollTop) region.scrollTop = top;
		else if (bottom > region.scrollTop + region.clientHeight) region.scrollTop = bottom - region.clientHeight;
	};
	const applyFocusForSelectable = (row, col) => {
		if (row < 0) return;
		const column = columnAtIndex(col);
		if (!column || column === "select" || selectable !== "cell") return;
		const visRow = visible[row];
		if (!visRow || visRow.isPlaceholder) return;
		const next = {
			rowId: visRow.id,
			column: column.key
		};
		setCellSelection(next);
		onSelectionChange?.(next);
	};
	const setActiveCellTo = (row, col) => {
		const clampedRow = Math.max(-1, Math.min(visible.length - 1, row));
		const clampedCol = Math.max(0, Math.min(colCount - 1, col));
		applyFocusForSelectable(clampedRow, clampedCol);
		if (clampedRow >= 0) scrollRowIntoView(clampedRow);
		setActiveCell({
			row: clampedRow,
			col: clampedCol
		});
	};
	const moveActiveCell = (deltaRow, deltaCol) => {
		setActiveCellTo(activeCell.row + deltaRow, activeCell.col + deltaCol);
	};
	const handleEditorWrapperKeyDown = (column) => (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			commitEditWithValue(editingValueRef.current, true);
		} else if (event.key === "F2") {
			event.preventDefault();
			commitEditWithValue(editingValueRef.current, false);
		} else if (event.key === "Escape" && (column.editor === "text" || column.editor === "number" || column.editor === void 0)) {
			event.preventDefault();
			cancelEdit();
		}
		event.stopPropagation();
	};
	const handleEditorBlur = () => {
		if (isEditingRef.current) commitEditWithValue(editingValueRef.current, false);
	};
	const activateCellControl = (visRow, col) => {
		const column = columnAtIndex(col);
		if (!column || column === "select") return;
		const control = cellRefs.current.get(`${visRow.id}:${column.key}`)?.querySelector(FOCUSABLE_SELECTOR$1);
		control?.focus();
		control?.click();
	};
	const handleKeyDown = (event) => {
		if (editing) return;
		const { row, col } = activeCell;
		const column = columnAtIndex(col);
		const visRow = row >= 0 ? visible[row] : void 0;
		const onRowHeader = col === rowHeaderColIndex && visRow && !visRow.isPlaceholder;
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveActiveCell(1, 0);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveActiveCell(-1, 0);
				return;
			case "ArrowRight":
				event.preventDefault();
				if (onRowHeader && visRow.hasChildren && !expandedSet.has(visRow.id)) toggleExpand(visRow.id);
				else moveActiveCell(0, 1);
				return;
			case "ArrowLeft":
				event.preventDefault();
				if (onRowHeader && visRow.hasChildren && expandedSet.has(visRow.id)) toggleExpand(visRow.id);
				else if (onRowHeader && visRow.parentId) {
					const parentIndex = visible.findIndex((entry) => entry.id === visRow.parentId);
					if (parentIndex >= 0) setActiveCellTo(parentIndex, rowHeaderColIndex);
				} else moveActiveCell(0, -1);
				return;
			case "Home":
				event.preventDefault();
				setActiveCellTo(event.ctrlKey ? 0 : row, 0);
				return;
			case "End":
				event.preventDefault();
				setActiveCellTo(event.ctrlKey ? visible.length - 1 : row, colCount - 1);
				return;
			case "Enter":
				event.preventDefault();
				if (row === -1) {
					if (column && column !== "select" && column.sortable) handleSort(column);
					return;
				}
				if (!visRow || visRow.isPlaceholder) return;
				if (onRowHeader) {
					if (visRow.hasChildren) toggleExpand(visRow.id);
					return;
				}
				if (column && column !== "select") {
					if (editable && column.editable) openEditor(visRow.id, column.key);
					else activateCellControl(visRow, col);
				}
				return;
			case "*":
				event.preventDefault();
				if (visRow && !visRow.isPlaceholder) expandSiblings(visRow);
				return;
			case "F2":
				event.preventDefault();
				if (visRow && !visRow.isPlaceholder && column && column !== "select" && editable && column.editable) openEditor(visRow.id, column.key);
				return;
			case " ":
				if (selectable === "row") {
					event.preventDefault();
					if (!visRow || visRow.isPlaceholder) return;
					if (event.shiftKey && anchorRef.current) {
						const anchorIndex = visible.findIndex((entry) => entry.id === anchorRef.current);
						const lo = Math.min(anchorIndex, row);
						const hi = Math.max(anchorIndex, row);
						commitRowSelection(visible.slice(lo, hi + 1).filter((entry) => !entry.isPlaceholder).map((entry) => entry.id));
					} else {
						anchorRef.current = visRow.id;
						toggleRowSelection(visRow.row);
					}
				}
				return;
			case "a":
			case "A":
				if (event.ctrlKey && selectable === "row") {
					event.preventDefault();
					commitRowSelection(allIds);
				}
				return;
		}
	};
	const renderEditor = (column, row) => {
		const editorName = `${baseId}-editor-${row.id}-${column.key}`;
		switch (column.editor) {
			case "number": return /* @__PURE__ */ jsx(NumberInput, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "number" ? editingValue : void 0,
				error: editingError,
				autoFocus: true,
				onChange: (value) => updateEditingValue(value)
			});
			case "select": return /* @__PURE__ */ jsx(Select, {
				label: column.header,
				name: editorName,
				options: column.options ?? [],
				value: typeof editingValue === "string" ? editingValue : "",
				error: editingError,
				container,
				onChange: (value) => {
					updateEditingValue(value);
					commitEditWithValue(value, true);
				}
			});
			case "date": return /* @__PURE__ */ jsx(DatePicker, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "string" ? editingValue : void 0,
				error: editingError,
				container,
				onChange: (value) => {
					updateEditingValue(value);
					if (value !== void 0) commitEditWithValue(value, true);
				}
			});
			case "checkbox": return /* @__PURE__ */ jsx(Checkbox, {
				label: column.header,
				name: editorName,
				checked: Boolean(editingValue),
				onChange: (checked) => {
					updateEditingValue(checked);
					commitEditWithValue(checked, true);
				}
			});
			default: return /* @__PURE__ */ jsx(Input, {
				label: column.header,
				name: editorName,
				value: typeof editingValue === "string" ? editingValue : "",
				error: editingError,
				autoFocus: true,
				onChange: (value) => updateEditingValue(value)
			});
		}
	};
	const renderHeaderCell = (column, index) => {
		const colIndex = index + (hasSelectColumn ? 1 : 0);
		const isActive = activeCell.row === -1 && activeCell.col === colIndex;
		const sorted = column.sortable ? sort?.column === column.key : void 0;
		const classes = [
			"ds-tree-grid__cell",
			"ds-tree-grid__cell--header",
			column.align === "end" ? "ds-tree-grid__cell--align-end" : column.align === "center" ? "ds-tree-grid__cell--align-center" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsx("div", {
			id: cellId(-1, colIndex),
			role: "columnheader",
			"aria-colindex": colIndex + 1,
			"aria-sort": column.sortable ? sorted ? sort.direction : "none" : void 0,
			"data-part": "columnHeader",
			"data-active": isActive ? "true" : void 0,
			className: classes,
			onMouseDown: () => {
				focusGrid();
				setActiveCell({
					row: -1,
					col: colIndex
				});
			},
			children: column.sortable ? /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				size: "sm",
				label: sortButtonLabel(column),
				trailingIcon: /* @__PURE__ */ jsx(Icon, {
					name: sorted && sort?.direction === "descending" ? "chevron-down" : "chevron-up",
					inline: true
				}),
				className: "ds-tree-grid__sort-button",
				"data-part": "sortButton",
				tabIndex: -1,
				onMouseDown: (event) => event.preventDefault(),
				onClick: () => handleSort(column)
			}) : column.abbr ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				children: column.abbr
			}), /* @__PURE__ */ jsx("span", {
				className: "ds-tree-grid__visually-hidden",
				children: column.header
			})] }) : column.header
		}, column.key);
	};
	const renderRowHeaderContent = (visRow, column) => {
		const expandedState = expandedSet.has(visRow.id);
		const name = rowName(visRow.row, rowHeaderColumn);
		return /* @__PURE__ */ jsxs("div", {
			className: "ds-tree-grid__row-header-inner",
			style: { paddingInlineStart: `calc(var(--ds-tree-grid-indent) * ${visRow.level - 1})` },
			children: [
				Array.from({ length: visRow.level - 1 }).map((_, ancestorIndex) => /* @__PURE__ */ jsx("span", {
					"aria-hidden": "true",
					className: "ds-tree-grid__guide",
					style: { insetInlineStart: `calc(var(--ds-tree-grid-indent) * ${ancestorIndex} + var(--ds-tree-grid-expand-button-size) / 2)` }
				}, ancestorIndex)),
				visRow.hasChildren ? /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					label: interpolate$1(expandedState ? COPY$3.collapse : COPY$3.expand, { rowName: name }),
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: "chevron-right",
						inline: true,
						className: expandedState ? "ds-tree-grid__expand-icon ds-tree-grid__expand-icon--expanded" : "ds-tree-grid__expand-icon"
					}),
					className: "ds-tree-grid__expand-button",
					tabIndex: -1,
					"aria-hidden": "true",
					onMouseDown: (event) => event.preventDefault(),
					onClick: () => toggleExpand(visRow.id)
				}) : /* @__PURE__ */ jsx("span", {
					className: "ds-tree-grid__expand-spacer",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ jsx("span", {
					className: visRow.hasChildren ? "ds-tree-grid__row-header-text ds-tree-grid__row-header-text--parent" : "ds-tree-grid__row-header-text",
					children: column.render ? column.render(visRow.row) : name
				})
			]
		});
	};
	const renderCell = (visRow, rowIndex, column, colIndex) => {
		const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
		const isEditingThis = editing?.rowId === visRow.id && editing.column === column.key;
		const isSelected = selectable === "cell" && cellSelection?.rowId === visRow.id && cellSelection.column === column.key;
		const classes = [
			"ds-tree-grid__cell",
			column.align === "end" ? "ds-tree-grid__cell--align-end" : column.align === "center" ? "ds-tree-grid__cell--align-center" : null,
			isSelected ? "ds-tree-grid__cell--selected" : null,
			isEditingThis ? "ds-tree-grid__cell--editing" : null,
			isEditingThis && editingError ? "ds-tree-grid__cell--invalid" : null
		].filter(Boolean).join(" ");
		const role = column.isRowHeader ? "rowheader" : "gridcell";
		return /* @__PURE__ */ jsx("div", {
			id: cellId(rowIndex, colIndex),
			ref: (node) => {
				if (node) cellRefs.current.set(`${visRow.id}:${column.key}`, node);
				else cellRefs.current.delete(`${visRow.id}:${column.key}`);
			},
			role,
			"aria-colindex": colIndex + 1,
			"aria-selected": selectable === "cell" ? isSelected ? "true" : "false" : void 0,
			tabIndex: -1,
			"data-part": column.isRowHeader ? "rowHeader" : "cell",
			"data-active": isActive ? "true" : void 0,
			className: classes,
			onMouseDown: () => {
				focusGrid();
				setActiveCellTo(rowIndex, colIndex);
			},
			onDoubleClick: () => {
				if (editable && column.editable) openEditor(visRow.id, column.key);
			},
			children: isEditingThis ? /* @__PURE__ */ jsx("div", {
				className: "ds-tree-grid__editor",
				"data-part": "editor",
				onKeyDown: handleEditorWrapperKeyDown(column),
				onBlur: (event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) handleEditorBlur();
				},
				children: renderEditor(column, visRow.row)
			}) : column.isRowHeader ? renderRowHeaderContent(visRow, column) : column.render ? /* @__PURE__ */ jsx("div", {
				className: "ds-tree-grid__cell-content",
				"data-part": "cellContent",
				children: column.render(visRow.row)
			}) : /* @__PURE__ */ jsx("span", {
				className: "ds-tree-grid__cell-content",
				"data-part": "cellContent",
				children: cellText(column, visRow.row)
			})
		}, column.key);
	};
	const renderRow = (visRow, rowIndex) => {
		const style = { gridTemplateColumns };
		if (virtualize) {
			style.position = "absolute";
			style.insetBlockStart = 0;
			style.insetInlineStart = 0;
			style.inlineSize = "100%";
			style.transform = `translateY(${rowIndex * rowHeightPx}px)`;
		}
		if (visRow.isPlaceholder) return /* @__PURE__ */ jsx("div", {
			role: "row",
			"aria-level": visRow.level,
			"aria-rowindex": rowIndex + 2,
			className: "ds-tree-grid__row",
			"data-part": "row",
			style,
			children: /* @__PURE__ */ jsx("div", {
				role: "gridcell",
				className: "ds-tree-grid__cell ds-tree-grid__loading-cell",
				style: {
					gridColumn: `1 / span ${colCount}`,
					paddingInlineStart: `calc(var(--ds-tree-grid-indent) * ${visRow.level - 1})`
				},
				children: /* @__PURE__ */ jsx(Text, {
					size: "sm",
					className: "ds-tree-grid__loading-text",
					children: COPY$3.loading
				})
			})
		}, visRow.id);
		const isSelected = selectable === "row" && selectedSet.has(visRow.id);
		const checkedState = selectable === "row" ? rowCheckedState(visRow.row, selectedSet, selectChildren) : "unchecked";
		return /* @__PURE__ */ jsxs("div", {
			role: "row",
			"aria-level": visRow.level,
			"aria-setsize": visRow.setsize,
			"aria-posinset": visRow.posinset,
			"aria-expanded": visRow.hasChildren ? expandedSet.has(visRow.id) ? "true" : "false" : void 0,
			"aria-busy": visRow.hasChildren && expandedSet.has(visRow.id) && visRow.row.children === "lazy" ? "true" : void 0,
			"aria-rowindex": rowIndex + 2,
			"aria-selected": selectable === "row" ? isSelected ? "true" : "false" : void 0,
			className: ["ds-tree-grid__row", isSelected ? "ds-tree-grid__row--selected" : null].filter(Boolean).join(" "),
			"data-part": "row",
			style,
			children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
				role: "gridcell",
				"aria-colindex": 1,
				className: "ds-tree-grid__cell ds-tree-grid__cell--select",
				"data-part": "selectCell",
				children: /* @__PURE__ */ jsx(Checkbox, {
					label: interpolate$1(BORROWED_COPY.selectRow, { rowName: rowName(visRow.row, rowHeaderColumn) }),
					name: `${baseId}-select-${visRow.id}`,
					checked: checkedState === "checked",
					indeterminate: checkedState === "indeterminate",
					onChange: () => toggleRowSelection(visRow.row)
				})
			}) : null, columns.map((column, index) => renderCell(visRow, rowIndex, column, index + (hasSelectColumn ? 1 : 0)))]
		}, visRow.id);
	};
	const classes = [
		"ds-tree-grid",
		`ds-tree-grid--density-${density}`,
		`ds-tree-grid--height-${height}`,
		scrolledUnderHeader ? "ds-tree-grid--scrolled-under-header" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const overrideStyle = overrides ? overridesToStyle$3(overrides) : void 0;
	const mergedStyle = overrideStyle || style ? {
		...overrideStyle,
		...style
	} : void 0;
	const visibleRows = visible.slice(startIndex, endIndex + 1);
	const statusText = loading ? COPY$3.loading : editingError ? interpolate$1(BORROWED_COPY.invalid, { message: editingError }) : announcement || (selectable === "row" && selectedIds.length > 0 ? interpolate$1(BORROWED_COPY.selectedRows, {
		count: selectedIds.length,
		total: allIds.length
	}) : interpolate$1(BORROWED_COPY.rowCount, { count: visible.length }));
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "TreeGrid",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [
			/* @__PURE__ */ jsx("div", {
				id: captionId,
				"data-part": "caption",
				className: hideCaption ? "ds-tree-grid__visually-hidden" : "ds-tree-grid__caption",
				children: /* @__PURE__ */ jsx(Heading, {
					level: 2,
					size: "md",
					children: caption
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: scrollRegionRef,
				role: "treegrid",
				"data-part": "scrollRegion",
				className: "ds-tree-grid__scroll-region",
				"aria-labelledby": captionId,
				"aria-rowcount": visible.length + 1,
				"aria-colcount": colCount,
				"aria-multiselectable": selectable === "row" ? "true" : void 0,
				"aria-readonly": !editable ? "true" : void 0,
				"aria-busy": loading ? "true" : void 0,
				"aria-describedby": statusBarId,
				tabIndex: 0,
				"aria-activedescendant": activeDescendantId,
				onKeyDown: handleKeyDown,
				onScroll: handleScroll,
				children: [
					/* @__PURE__ */ jsx("div", {
						ref: sizerRef,
						"aria-hidden": "true",
						className: "ds-tree-grid__row-sizer"
					}),
					/* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "header",
						className: "ds-tree-grid__header",
						children: /* @__PURE__ */ jsxs("div", {
							role: "row",
							"aria-rowindex": 1,
							className: "ds-tree-grid__row ds-tree-grid__row--header",
							"data-part": "headerRow",
							style: { gridTemplateColumns },
							children: [hasSelectColumn ? /* @__PURE__ */ jsx("div", {
								role: "columnheader",
								"aria-colindex": 1,
								id: cellId(-1, 0),
								"data-part": "selectAllCell",
								"data-active": activeCell.row === -1 && activeCell.col === 0 ? "true" : void 0,
								className: "ds-tree-grid__cell ds-tree-grid__cell--header ds-tree-grid__cell--select",
								onMouseDown: () => {
									focusGrid();
									setActiveCell({
										row: -1,
										col: 0
									});
								},
								children: /* @__PURE__ */ jsx(Checkbox, {
									label: BORROWED_COPY.selectAll,
									name: `${baseId}-select-all`,
									checked: allSelected,
									indeterminate: someSelected,
									onChange: handleToggleAll
								})
							}) : null, columns.map((column, index) => renderHeaderCell(column, index))]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						role: "rowgroup",
						"data-part": "body",
						className: "ds-tree-grid__body",
						children: visible.length === 0 ? /* @__PURE__ */ jsx("div", {
							role: "row",
							className: "ds-tree-grid__row",
							children: /* @__PURE__ */ jsx("div", {
								role: "gridcell",
								className: "ds-tree-grid__empty",
								style: { gridColumn: `1 / span ${colCount}` },
								children: /* @__PURE__ */ jsx(Text, {
									element: "p",
									tone: "muted",
									"data-part": "emptyState",
									children: loading ? COPY$3.loading : BORROWED_COPY.empty
								})
							})
						}) : virtualize ? /* @__PURE__ */ jsx("div", {
							className: "ds-tree-grid__spacer",
							style: {
								position: "relative",
								blockSize: visible.length * rowHeightPx
							},
							children: visibleRows.map((visRow, i) => renderRow(visRow, startIndex + i))
						}) : visibleRows.map((visRow, i) => renderRow(visRow, i))
					})
				]
			}),
			showStatusBar ? /* @__PURE__ */ jsx("div", {
				id: statusBarId,
				role: "status",
				"aria-live": "polite",
				className: "ds-tree-grid__status-bar",
				"data-part": "statusBar",
				children: /* @__PURE__ */ jsx(Text, {
					size: "xs",
					tone: "muted",
					children: statusText
				})
			}) : /* @__PURE__ */ jsx("span", {
				id: statusBarId,
				role: "status",
				"aria-live": "polite",
				className: "ds-tree-grid__visually-hidden",
				children: announcement
			})
		]
	});
};
//#endregion
//#region src/Tree.tsx
/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY$2 = {
	expand: "Expand {label}",
	collapse: "Collapse {label}",
	selectedCount: "{count} selected",
	loading: "Loading",
	empty: "Nothing here."
};
const ROOT_OVERRIDE_HOOK$1 = {
	indent: "--ds-tree-indent",
	rowHeight: "--ds-tree-row-height",
	rowPaddingInline: "--ds-tree-row-padding-inline",
	rowRadius: "--ds-tree-row-radius",
	rowGap: "--ds-tree-row-gap",
	rowHover: "--ds-tree-row-hover",
	rowSelectedBorderWidth: "--ds-tree-row-selected-border-width",
	expandButtonSize: "--ds-tree-expand-button-size",
	guideLine: "--ds-tree-guide-line",
	guideLineWidth: "--ds-tree-guide-line-width",
	checkboxGap: "--ds-tree-checkbox-gap",
	checkboxSize: "--ds-tree-checkbox-size",
	checkboxBackground: "--ds-tree-checkbox-background",
	checkboxRadius: "--ds-tree-checkbox-radius",
	fontFamily: "--ds-tree-font-family",
	fontSize: "--ds-tree-font-size",
	lineHeight: "--ds-tree-line-height",
	disabledOpacity: "--ds-tree-disabled-opacity",
	transition: "--ds-tree-transition"
};
function overridesToStyle$2(overrides) {
	const rootStyle = {};
	const headingOverrides = {};
	const badgeOverrides = {};
	const labelOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (!ref) continue;
		const hook = ROOT_OVERRIDE_HOOK$1[binding];
		if (hook) rootStyle[hook] = cssVar(ref);
		else if (binding === "headingSize") headingOverrides.fontSize = ref;
		else if (binding === "badgeSize") badgeOverrides.fontSize = ref;
		else if (binding === "labelSelectedWeight") labelOverrides.fontWeight = ref;
	}
	return {
		rootStyle,
		headingOverrides,
		badgeOverrides,
		labelOverrides
	};
}
function interpolate(template, values) {
	return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}
function nodeHasChildren(node) {
	return node.children === "lazy" || Array.isArray(node.children) && node.children.length > 0;
}
function flattenTree(nodes, expandedSet) {
	const result = [];
	const walk = (list, level, parentId) => {
		list.forEach((node, index) => {
			const hasChildren = nodeHasChildren(node);
			result.push({
				id: node.id,
				node,
				level,
				posinset: index + 1,
				setsize: list.length,
				hasChildren,
				parentId
			});
			if (hasChildren && expandedSet.has(node.id)) {
				if (node.children === "lazy") result.push({
					id: `${node.id}__loading`,
					node,
					level: level + 1,
					posinset: 1,
					setsize: 1,
					hasChildren: false,
					parentId: node.id,
					isPlaceholder: true
				});
				else if (Array.isArray(node.children)) walk(node.children, level + 1, node.id);
			}
		});
	};
	walk(nodes, 1, null);
	return result;
}
function collectDescendantIds(node) {
	if (!Array.isArray(node.children)) return [];
	const ids = [];
	for (const child of node.children) ids.push(child.id, ...collectDescendantIds(child));
	return ids;
}
function collectExpandableIds(nodes) {
	const ids = [];
	for (const node of nodes) {
		if (nodeHasChildren(node)) ids.push(node.id);
		if (Array.isArray(node.children)) ids.push(...collectExpandableIds(node.children));
	}
	return ids;
}
/** O(n) per call — fine for interaction-driven lookups over the (typically shallow) tree shape. */
function findNode(nodes, id) {
	for (const node of nodes) {
		if (node.id === id) return node;
		if (Array.isArray(node.children)) {
			const found = findNode(node.children, id);
			if (found) return found;
		}
	}
}
function nodeCheckedState(node, selectedSet, selectChildren) {
	if (!selectChildren) return selectedSet.has(node.id) ? "checked" : "unchecked";
	const descendants = collectDescendantIds(node);
	if (descendants.length === 0) return selectedSet.has(node.id) ? "checked" : "unchecked";
	const allIds = [node.id, ...descendants];
	const selectedCount = allIds.filter((id) => selectedSet.has(id)).length;
	if (selectedCount === 0) return "unchecked";
	if (selectedCount === allIds.length) return "checked";
	return "indeterminate";
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
const Tree = function Tree({ ref, label, showLabel = false, headingLevel = "2", nodes, expanded, defaultExpanded, selectable = "single", selected, defaultSelected, selectChildren = false, selectOnFocus = false, showGuides = true, overrides, onSelectionChange, onExpandChange, onExpand, onActivate, className, style, ...rest }) {
	const baseId = `ds-tree${useId()}`;
	const labelId = `${baseId}-label`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const nodeRefs = useRef(/* @__PURE__ */ new Map());
	const anchorRefs = useRef(/* @__PURE__ */ new Map());
	const typeaheadRef = useRef({
		buffer: "",
		timer: null
	});
	const isExpandedControlled = expanded !== void 0;
	const [internalExpanded, setInternalExpanded] = useState(() => defaultExpanded?.includes("*") ? collectExpandableIds(nodes) : defaultExpanded ?? []);
	const expandedIds = isExpandedControlled ? expanded : internalExpanded;
	const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);
	const setExpanded = (next) => {
		if (!isExpandedControlled) setInternalExpanded(next);
		onExpandChange?.(next);
	};
	const toggleExpand = (id) => {
		const next = expandedSet.has(id) ? expandedIds.filter((existing) => existing !== id) : [...expandedIds, id];
		setExpanded(next);
	};
	const requestedLazyRef = useRef(/* @__PURE__ */ new Set());
	useEffect(() => {
		for (const id of expandedIds) {
			if (requestedLazyRef.current.has(id)) continue;
			if (findNode(nodes, id)?.children === "lazy") {
				requestedLazyRef.current.add(id);
				onExpand?.(id);
			}
		}
	}, [
		expandedIds,
		nodes,
		onExpand
	]);
	const visible = useMemo(() => flattenTree(nodes, expandedSet), [nodes, expandedSet]);
	const navigable = useMemo(() => visible.filter((v) => !v.isPlaceholder && !v.node.disabled), [visible]);
	const isSelectedControlled = selected !== void 0;
	const [internalSelected, setInternalSelected] = useState(defaultSelected ?? []);
	const selectedIds = isSelectedControlled ? selected : internalSelected;
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const commitSelection = (next) => {
		if (!isSelectedControlled) setInternalSelected(next);
		onSelectionChange?.(next);
	};
	const toggleMultipleSelection = (node) => {
		const ids = selectChildren ? [node.id, ...collectDescendantIds(node)] : [node.id];
		if (nodeCheckedState(node, selectedSet, selectChildren) !== "checked") commitSelection(Array.from(/* @__PURE__ */ new Set([...selectedIds, ...ids])));
		else {
			const remove = new Set(ids);
			commitSelection(selectedIds.filter((id) => !remove.has(id)));
		}
	};
	const selectFocused = (v) => {
		if (v.node.disabled) return;
		if (selectable === "single") commitSelection([v.id]);
		else if (selectable === "multiple") toggleMultipleSelection(v.node);
	};
	const [focusedId, setFocusedId] = useState(() => {
		return navigable.find((v) => selectedIds.includes(v.id))?.id ?? navigable[0]?.id;
	});
	const setNodeRef = (nodeId) => (el) => {
		if (el) nodeRefs.current.set(nodeId, el);
		else nodeRefs.current.delete(nodeId);
	};
	const setAnchorRef = (nodeId) => (el) => {
		if (el) anchorRefs.current.set(nodeId, el);
		else anchorRefs.current.delete(nodeId);
	};
	const focusNode = (id) => {
		setFocusedId(id);
		nodeRefs.current.get(id)?.focus();
	};
	const moveFocus = (id) => {
		focusNode(id);
		if (selectable === "single" && selectOnFocus) commitSelection([id]);
	};
	const activateNode = (v) => {
		if (v.node.disabled) return;
		if (selectable === "single") commitSelection([v.id]);
		if (v.node.href) anchorRefs.current.get(v.id)?.click();
		else onActivate?.(v.id);
	};
	const expandSiblings = (v) => {
		const siblingIds = visible.filter((entry) => entry.parentId === v.parentId && entry.hasChildren && !entry.isPlaceholder).map((entry) => entry.id);
		if (siblingIds.length === 0) return;
		setExpanded(Array.from(/* @__PURE__ */ new Set([...expandedIds, ...siblingIds])));
	};
	const handleTypeahead = (char, currentIndex) => {
		if (navigable.length === 0) return;
		const state = typeaheadRef.current;
		if (state.timer) clearTimeout(state.timer);
		state.buffer += char.toLowerCase();
		state.timer = setTimeout(() => {
			state.buffer = "";
		}, 500);
		const startIndex = currentIndex === -1 ? 0 : currentIndex;
		for (let offset = 1; offset <= navigable.length; offset++) {
			const candidate = navigable[(startIndex + offset) % navigable.length];
			if (candidate.node.label.toLowerCase().startsWith(state.buffer)) {
				moveFocus(candidate.id);
				return;
			}
		}
		if (state.buffer.length > 1) {
			const single = state.buffer.slice(-1);
			for (let offset = 0; offset < navigable.length; offset++) {
				const candidate = navigable[(startIndex + offset) % navigable.length];
				if (candidate.node.label.toLowerCase().startsWith(single)) {
					state.buffer = single;
					moveFocus(candidate.id);
					return;
				}
			}
		}
	};
	const handleKeyDown = (event) => {
		if (!focusedId) return;
		const currentIndex = navigable.findIndex((v) => v.id === focusedId);
		if (currentIndex === -1) return;
		const current = navigable[currentIndex];
		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();
				const next = navigable[Math.min(currentIndex + 1, navigable.length - 1)];
				if (selectable === "multiple" && event.shiftKey) {
					focusNode(next.id);
					if (!selectedIds.includes(next.id)) commitSelection([...selectedIds, next.id]);
				} else moveFocus(next.id);
				return;
			}
			case "ArrowUp": {
				event.preventDefault();
				const prev = navigable[Math.max(currentIndex - 1, 0)];
				if (selectable === "multiple" && event.shiftKey) {
					focusNode(prev.id);
					if (!selectedIds.includes(prev.id)) commitSelection([...selectedIds, prev.id]);
				} else moveFocus(prev.id);
				return;
			}
			case "ArrowRight":
				event.preventDefault();
				if (!current.hasChildren) return;
				if (!expandedSet.has(current.id)) toggleExpand(current.id);
				else {
					const child = navigable.find((v, i) => i > currentIndex && v.parentId === current.id);
					if (child) moveFocus(child.id);
				}
				return;
			case "ArrowLeft":
				event.preventDefault();
				if (current.hasChildren && expandedSet.has(current.id)) toggleExpand(current.id);
				else if (current.parentId) moveFocus(current.parentId);
				return;
			case "Home":
				event.preventDefault();
				moveFocus(navigable[0].id);
				return;
			case "End":
				event.preventDefault();
				moveFocus(navigable[navigable.length - 1].id);
				return;
			case "Enter":
				event.preventDefault();
				activateNode(current);
				return;
			case " ":
				if (selectable !== "none") {
					event.preventDefault();
					selectFocused(current);
				}
				return;
			case "*":
				event.preventDefault();
				expandSiblings(current);
				return;
			case "a":
			case "A":
				if (selectable === "multiple" && (event.ctrlKey || event.metaKey)) {
					event.preventDefault();
					commitSelection(navigable.map((v) => v.id));
				}
				return;
			default: if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) handleTypeahead(event.key, currentIndex);
		}
	};
	const handleRowClick = (v) => () => {
		if (v.node.disabled) return;
		focusNode(v.id);
		if (selectable !== "none") selectFocused(v);
	};
	const handleRowDoubleClick = (v) => () => {
		activateNode(v);
	};
	const { rootStyle, headingOverrides, badgeOverrides, labelOverrides } = overrides ? overridesToStyle$2(overrides) : {
		rootStyle: void 0,
		headingOverrides: {},
		badgeOverrides: {},
		labelOverrides: {}
	};
	const renderNode = (node, level, posinset, setsize, parentId) => {
		const hasChildren = nodeHasChildren(node);
		const v = {
			id: node.id,
			node,
			level,
			posinset,
			setsize,
			hasChildren,
			parentId
		};
		const isExpanded = hasChildren && expandedSet.has(node.id);
		const isSelected = selectedSet.has(node.id);
		const checkedState = selectable === "multiple" ? nodeCheckedState(node, selectedSet, selectChildren) : void 0;
		const isRowSelected = selectable === "single" ? isSelected : selectable === "multiple" ? checkedState === "checked" : false;
		const itemId = `${baseId}-item-${node.id}`;
		const rowClasses = [
			"ds-tree__row",
			isRowSelected ? "ds-tree__row--selected" : null,
			node.disabled ? "ds-tree__row--disabled" : null
		].filter(Boolean).join(" ");
		return /* @__PURE__ */ jsxs("li", {
			ref: setNodeRef(node.id),
			id: itemId,
			role: "treeitem",
			"aria-level": level,
			"aria-setsize": setsize,
			"aria-posinset": posinset,
			"aria-expanded": hasChildren ? isExpanded ? "true" : "false" : void 0,
			"aria-selected": selectable === "single" ? isSelected ? "true" : "false" : void 0,
			"aria-checked": selectable === "multiple" ? checkedState === "indeterminate" ? "mixed" : checkedState === "checked" ? "true" : "false" : void 0,
			"aria-disabled": node.disabled ? "true" : void 0,
			"aria-busy": isExpanded && node.children === "lazy" ? "true" : void 0,
			tabIndex: node.id === focusedId ? 0 : -1,
			"data-part": "node",
			className: "ds-tree__node",
			onFocus: () => setFocusedId(node.id),
			children: [/* @__PURE__ */ jsxs("div", {
				className: rowClasses,
				"data-part": "nodeRow",
				onClick: handleRowClick(v),
				onDoubleClick: handleRowDoubleClick(v),
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ds-tree__indent",
						"data-part": "indent",
						"aria-hidden": "true",
						style: { inlineSize: `calc(var(--ds-tree-indent) * ${level - 1})` },
						children: showGuides ? Array.from({ length: level - 1 }).map((_, ancestorIndex) => /* @__PURE__ */ jsx("span", {
							className: "ds-tree__guide",
							style: { insetInlineStart: `calc(var(--ds-tree-indent) * ${ancestorIndex} + var(--ds-tree-expand-button-size) / 2)` }
						}, ancestorIndex)) : null
					}),
					hasChildren ? /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						iconOnly: true,
						label: interpolate(isExpanded ? COPY$2.collapse : COPY$2.expand, { label: node.label }),
						leadingIcon: /* @__PURE__ */ jsx(Icon, {
							name: "chevron-right",
							inline: true,
							className: isExpanded ? "ds-tree__expand-icon ds-tree__expand-icon--expanded" : "ds-tree__expand-icon"
						}),
						className: "ds-tree__expand-button",
						"data-part": "expandButton",
						tabIndex: -1,
						"aria-hidden": "true",
						onMouseDown: (event) => event.preventDefault(),
						onClick: (event) => {
							event.stopPropagation();
							toggleExpand(node.id);
						}
					}) : /* @__PURE__ */ jsx("span", {
						className: "ds-tree__expand-spacer",
						"aria-hidden": "true"
					}),
					selectable === "multiple" ? /* @__PURE__ */ jsx("span", {
						className: checkedState === "unchecked" ? "ds-tree__checkbox" : "ds-tree__checkbox ds-tree__checkbox--filled",
						"data-part": "checkbox",
						"aria-hidden": "true",
						children: checkedState === "checked" ? /* @__PURE__ */ jsx(Icon, {
							name: "check",
							inline: true
						}) : checkedState === "indeterminate" ? /* @__PURE__ */ jsx(Icon, {
							name: "dash",
							inline: true
						}) : null
					}) : null,
					node.icon ? /* @__PURE__ */ jsx("span", {
						className: "ds-tree__icon",
						"data-part": "icon",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx(Icon, {
							name: node.icon,
							inline: true
						})
					}) : null,
					node.href ? /* @__PURE__ */ jsx(Link, {
						ref: setAnchorRef(node.id),
						href: node.href,
						label: node.label,
						tabIndex: -1,
						className: "ds-tree__label",
						"data-part": "label",
						onClick: (event) => {
							if (node.disabled) event.preventDefault();
						}
					}) : /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "sm",
						weight: isRowSelected ? "medium" : void 0,
						className: "ds-tree__label",
						"data-part": "label",
						overrides: isRowSelected && Object.keys(labelOverrides).length ? labelOverrides : void 0,
						children: node.label
					}),
					node.badge ? /* @__PURE__ */ jsx(Text, {
						element: "span",
						size: "xs",
						tone: "muted",
						className: "ds-tree__badge",
						"data-part": "badge",
						overrides: Object.keys(badgeOverrides).length ? badgeOverrides : void 0,
						children: node.badge
					}) : null
				]
			}), isExpanded ? node.children === "lazy" ? /* @__PURE__ */ jsx("ul", {
				role: "group",
				"data-part": "group",
				className: "ds-tree__group",
				children: /* @__PURE__ */ jsx("li", {
					className: "ds-tree__loading",
					"data-part": "node",
					children: /* @__PURE__ */ jsx("div", {
						className: "ds-tree__row",
						style: { paddingInlineStart: `calc(var(--ds-tree-indent) * ${level})` },
						children: /* @__PURE__ */ jsx(Text, {
							size: "sm",
							tone: "muted",
							children: COPY$2.loading
						})
					})
				})
			}) : Array.isArray(node.children) && node.children.length > 0 ? /* @__PURE__ */ jsx("ul", {
				role: "group",
				"data-part": "group",
				className: "ds-tree__group",
				children: node.children.map((child, index) => renderNode(child, level + 1, index + 1, node.children.length, node.id))
			}) : null : null]
		}, node.id);
	};
	const classes = ["ds-tree", className ?? null].filter(Boolean).join(" ");
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Tree",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		children: [
			showLabel ? /* @__PURE__ */ jsx(Heading, {
				id: labelId,
				level: headingLevel,
				size: "md",
				className: "ds-tree__heading",
				overrides: Object.keys(headingOverrides).length ? headingOverrides : void 0,
				children: label
			}) : null,
			/* @__PURE__ */ jsx("ul", {
				id: baseId,
				role: "tree",
				"aria-label": showLabel ? void 0 : label,
				"aria-labelledby": showLabel ? labelId : void 0,
				"aria-multiselectable": selectable === "multiple" ? "true" : void 0,
				"data-part": "tree",
				className: "ds-tree__list",
				onKeyDown: handleKeyDown,
				children: nodes.length === 0 ? /* @__PURE__ */ jsx("li", {
					className: "ds-tree__empty",
					"data-part": "node",
					children: /* @__PURE__ */ jsx(Text, {
						tone: "muted",
						size: "sm",
						children: COPY$2.empty
					})
				}) : nodes.map((node, index) => renderNode(node, 1, index + 1, nodes.length, null))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ds-tree__visually-hidden",
				role: "status",
				"aria-live": "polite",
				children: selectable === "multiple" ? interpolate(COPY$2.selectedCount, { count: selectedIds.length }) : ""
			})
		]
	});
};
//#endregion
//#region src/Splitter.tsx
/** copy.* — used verbatim; `{label}`/`{percent}` are replaced. */
const COPY$1 = {
	collapse: "Collapse {label}",
	expand: "Expand {label}",
	sizeText: "{percent}%"
};
const OVERRIDE_HOOK = {
	separatorSize: "--ds-splitter-separator-size",
	separatorColor: "--ds-splitter-separator-color",
	handleSize: "--ds-splitter-handle-size",
	gripLength: "--ds-splitter-grip-length",
	collapseButtonOffset: "--ds-splitter-collapse-button-offset",
	paneMinTarget: "--ds-splitter-pane-min-target",
	transition: "--ds-splitter-transition"
};
function overridesToStyle$1(overrides) {
	const style = {};
	for (const binding of Object.keys(overrides)) {
		const ref = overrides[binding];
		if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
	}
	return style;
}
const isDev = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable=\"false\"])",
	"[tabindex]:not([tabindex=\"-1\"])"
].join(",");
const BREAKPOINT_VAR = {
	prose: "--layout-max-width-prose",
	content: "--layout-max-width-content"
};
function readPersisted(key) {
	if (!key || typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
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
* Splitter — Design Schema, category: layout.
*
* When to use:
* Use a Splitter when two regions compete for space and the right split depends on the task: a
* navigation tree beside content, a list beside a detail view, a code editor beside its output, a
* map beside results. Make the primary pane the one whose size matters (the sidebar), set
* sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for
* sidebars.
*/
const Splitter = function Splitter({ ref, label, orientation = "horizontal", primary, secondary, size, defaultSize = 30, minSize = 10, maxSize = 90, step = 2, collapsible = false, collapsed, persistKey, stackBelow = "prose", overrides, onSizeChange, onSizeChangeEnd, onCollapseChange, id: idProp, className, style, onKeyDown, ...rest }) {
	const generatedId = useId();
	const id = idProp ?? `ds-splitter${generatedId}`;
	const primaryId = `${id}-primary`;
	const secondaryId = `${id}-secondary`;
	const containerRef = useRef(null);
	const primaryRef = useRef(null);
	const separatorRef = useRef(null);
	const secondaryRef = useRef(null);
	if (isDev && !label) console.warn("Splitter: `label` is required and becomes the separator’s accessible name.");
	const isControlled = size !== void 0;
	const [internalSize, setInternalSize] = useState(() => readPersisted(persistKey)?.size ?? defaultSize);
	const current = isControlled ? size : internalSize;
	const latestSizeRef = useRef(current);
	latestSizeRef.current = current;
	const isCollapsedControlled = collapsed !== void 0;
	const [internalCollapsed, setInternalCollapsed] = useState(() => readPersisted(persistKey)?.collapsed ?? false);
	const collapsedState = isCollapsedControlled ? collapsed : internalCollapsed;
	const lastSizeRef = useRef(current);
	const [isStacked, setIsStacked] = useState(false);
	useEffect(() => {
		if (orientation !== "horizontal" || stackBelow === "never") {
			setIsStacked(false);
			return;
		}
		const el = containerRef.current;
		if (!el || typeof ResizeObserver === "undefined") return void 0;
		const raw = getComputedStyle(document.documentElement).getPropertyValue(BREAKPOINT_VAR[stackBelow]).trim();
		const breakpoint = parseFloat(raw) || 0;
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? el.getBoundingClientRect().width;
			setIsStacked(width < breakpoint);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [orientation, stackBelow]);
	const effectiveCollapsed = collapsedState && !isStacked;
	useLayoutEffect(() => {
		const node = primaryRef.current;
		if (node) node.inert = effectiveCollapsed;
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
	function clamp(value) {
		return Math.min(Math.max(value, minSize), maxSize);
	}
	function commitSize(next) {
		const clamped = clamp(next);
		if (!isControlled) setInternalSize(clamped);
		latestSizeRef.current = clamped;
		onSizeChange?.(clamped);
	}
	function setCollapsed(next) {
		if (!isCollapsedControlled) setInternalCollapsed(next);
		onCollapseChange?.(next);
	}
	function collapse() {
		if (collapsedState) return;
		lastSizeRef.current = current;
		setCollapsed(true);
	}
	function restore() {
		if (!collapsedState) return;
		setCollapsed(false);
		commitSize(lastSizeRef.current);
	}
	function toggleCollapse() {
		if (collapsedState) restore();
		else collapse();
	}
	function percentFromPoint(clientX, clientY) {
		const el = containerRef.current;
		if (!el) return current;
		const rect = el.getBoundingClientRect();
		if (orientation === "horizontal") {
			const rtl = getComputedStyle(el).direction === "rtl";
			const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
			return Math.min(Math.max(rtl ? 1 - ratio : ratio, 0), 1) * 100;
		}
		const ratio = rect.height === 0 ? 0 : (clientY - rect.top) / rect.height;
		return Math.min(Math.max(ratio, 0), 1) * 100;
	}
	const draggingRef = useRef(false);
	const [isDragging, setIsDragging] = useState(false);
	const handleSeparatorPointerDown = (event) => {
		if (isStacked || event.button !== 0) return;
		if (event.target.closest("button")) return;
		event.preventDefault();
		draggingRef.current = true;
		setIsDragging(true);
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	const endDrag = (event) => {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		setIsDragging(false);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
		onSizeChangeEnd?.(latestSizeRef.current);
	};
	const handleSeparatorPointerMove = (event) => {
		if (!draggingRef.current || effectiveCollapsed) return;
		const raw = percentFromPoint(event.clientX, event.clientY);
		if (collapsible && raw < minSize) {
			draggingRef.current = false;
			setIsDragging(false);
			if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
			collapse();
			return;
		}
		commitSize(raw);
	};
	const handleSeparatorPointerUp = (event) => endDrag(event);
	const handleSeparatorPointerCancel = (event) => endDrag(event);
	const keyChangedRef = useRef(false);
	const handleSeparatorKeyDown = (event) => {
		if (isStacked || event.target !== event.currentTarget) return;
		if (effectiveCollapsed) {
			if (event.key === "Enter" && collapsible) {
				event.preventDefault();
				restore();
			}
			return;
		}
		const growKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
		const shrinkKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
		switch (event.key) {
			case growKey:
				event.preventDefault();
				commitSize(current + step);
				keyChangedRef.current = true;
				break;
			case shrinkKey:
				event.preventDefault();
				commitSize(current - step);
				keyChangedRef.current = true;
				break;
			case "Home":
				event.preventDefault();
				commitSize(minSize);
				keyChangedRef.current = true;
				break;
			case "End":
				event.preventDefault();
				commitSize(maxSize);
				keyChangedRef.current = true;
				break;
			case "Enter": if (collapsible) {
				event.preventDefault();
				collapse();
			}
		}
	};
	const handleSeparatorKeyUp = () => {
		if (keyChangedRef.current) {
			keyChangedRef.current = false;
			onSizeChangeEnd?.(latestSizeRef.current);
		}
	};
	const handleContainerKeyDown = (event) => {
		onKeyDown?.(event);
		if (event.key !== "F6" || isStacked) return;
		const active = document.activeElement;
		const regions = [
			primaryRef,
			separatorRef,
			secondaryRef
		];
		const activeIndex = regions.findIndex((r) => r.current === active || (r.current?.contains(active) ?? false));
		const nextRegion = regions[activeIndex === -1 ? 0 : (activeIndex + 1) % regions.length].current;
		if (!nextRegion) return;
		event.preventDefault();
		(nextRegion.querySelector(FOCUSABLE_SELECTOR) ?? nextRegion).focus();
	};
	const handleCollapseButtonClick = () => toggleCollapse();
	const setContainerRef = (node) => {
		containerRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const displayedPercent = effectiveCollapsed ? 0 : Math.round(current);
	const valueText = COPY$1.sizeText.replace("{percent}", String(displayedPercent));
	const rootStyle = {
		...overrides ? overridesToStyle$1(overrides) : void 0,
		...style,
		"--ds-splitter-primary-size": `${effectiveCollapsed ? 0 : current}%`
	};
	const classes = [
		"ds-splitter",
		`ds-splitter--${orientation}`,
		isStacked ? "ds-splitter--stacked" : null,
		effectiveCollapsed ? "ds-splitter--collapsed" : null,
		isDragging ? "ds-splitter--dragging" : null,
		className ?? null
	].filter(Boolean).join(" ");
	const collapseIcon = orientation === "horizontal" ? effectiveCollapsed ? "chevron-right" : "chevron-left" : effectiveCollapsed ? "chevron-down" : "chevron-up";
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: setContainerRef,
		id,
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
				tabIndex: -1,
				children: primary
			}),
			/* @__PURE__ */ jsx("div", {
				ref: separatorRef,
				"data-part": "separator",
				className: "ds-splitter__separator",
				role: isStacked ? "presentation" : "separator",
				tabIndex: isStacked ? void 0 : 0,
				"aria-orientation": isStacked ? void 0 : orientation === "horizontal" ? "vertical" : "horizontal",
				"aria-label": isStacked ? void 0 : label,
				"aria-controls": isStacked ? void 0 : primaryId,
				"aria-valuenow": isStacked ? void 0 : displayedPercent,
				"aria-valuemin": isStacked ? void 0 : minSize,
				"aria-valuemax": isStacked ? void 0 : maxSize,
				"aria-valuetext": isStacked ? void 0 : valueText,
				onPointerDown: handleSeparatorPointerDown,
				onPointerMove: handleSeparatorPointerMove,
				onPointerUp: handleSeparatorPointerUp,
				onPointerCancel: handleSeparatorPointerCancel,
				onKeyDown: handleSeparatorKeyDown,
				onKeyUp: handleSeparatorKeyUp,
				children: collapsible && !isStacked ? /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					iconOnly: true,
					"data-part": "collapseButton",
					className: "ds-splitter__collapse-button",
					label: (effectiveCollapsed ? COPY$1.expand : COPY$1.collapse).replace("{label}", label),
					leadingIcon: /* @__PURE__ */ jsx(Icon, {
						name: collapseIcon,
						inline: true
					}),
					onClick: handleCollapseButtonClick
				}) : null
			}),
			/* @__PURE__ */ jsx("div", {
				ref: secondaryRef,
				id: secondaryId,
				"data-part": "secondaryPane",
				className: "ds-splitter__secondary-pane",
				tabIndex: -1,
				children: secondary
			})
		]
	});
};
//#endregion
//#region src/Feed.tsx
const COPY = {
	showNew: "Show {count} new",
	loading: "Loading more",
	end: "You are all caught up.",
	unread: "unread",
	position: "{index} of {total}",
	empty: "Nothing here yet."
};
/** Bindings owned by the root; `articleInset` forwards to each composed Card's own padding hooks,
* and `timestampSize`/`endMessageSize`/`fontFamily` forward into the composed Text (and, for
* `fontFamily`, the new-items Button) instances' own `overrides`, since those components already
* own that hook. */
const ROOT_OVERRIDE_HOOK = {
	itemGap: "--ds-feed-item-gap",
	unreadBorderWidth: "--ds-feed-unread-border-width",
	newItemsOffset: "--ds-feed-new-items-offset",
	loadingInset: "--ds-feed-loading-inset",
	endMessageInset: "--ds-feed-end-message-inset"
};
function overridesToStyle(overrides) {
	const rootStyle = {};
	const articleOverrides = {};
	const timestampOverrides = {};
	const endMessageOverrides = {};
	const newItemsButtonOverrides = {};
	for (const binding of Object.keys(overrides)) {
		const tokenRef = overrides[binding];
		if (!tokenRef) continue;
		const hook = ROOT_OVERRIDE_HOOK[binding];
		if (hook) {
			rootStyle[hook] = cssVar(tokenRef);
			continue;
		}
		switch (binding) {
			case "articleInset":
				articleOverrides.paddingBlock = tokenRef;
				articleOverrides.paddingInline = tokenRef;
				break;
			case "timestampSize":
				timestampOverrides.fontSize = tokenRef;
				break;
			case "endMessageSize":
				endMessageOverrides.fontSize = tokenRef;
				break;
			case "fontFamily":
				timestampOverrides.fontFamily = tokenRef;
				endMessageOverrides.fontFamily = tokenRef;
				newItemsButtonOverrides.fontFamily = tokenRef;
		}
	}
	return {
		rootStyle,
		articleOverrides,
		timestampOverrides,
		endMessageOverrides,
		newItemsButtonOverrides
	};
}
/** Elements the Ctrl+Home/Ctrl+End feed commands can escape to. */
const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"]), [contenteditable=\"true\"]";
/** Moves focus to the first focusable element after `root` in document order. */
function focusAfter(root) {
	Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE)).filter((el) => !root.contains(el)).find((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)?.focus();
}
/** Moves focus to the last focusable element before `root` in document order. */
function focusBefore(root) {
	Array.from(root.ownerDocument.querySelectorAll(FOCUSABLE)).filter((el) => !root.contains(el)).filter((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0).pop()?.focus();
}
/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const RELATIVE_DIVISIONS = [
	{
		amount: 60,
		unit: "seconds"
	},
	{
		amount: 60,
		unit: "minutes"
	},
	{
		amount: 24,
		unit: "hours"
	},
	{
		amount: 7,
		unit: "days"
	},
	{
		amount: 4.34524,
		unit: "weeks"
	},
	{
		amount: 12,
		unit: "months"
	},
	{
		amount: Number.POSITIVE_INFINITY,
		unit: "years"
	}
];
/** No `copy.*` token covers relative time ("3 min ago"); this leans on the platform's own i18n
* formatting rather than inventing English strings, matching the Lit generation's locale choice. */
function formatRelativeTime(iso) {
	let duration = (new Date(iso).getTime() - Date.now()) / 1e3;
	for (const division of RELATIVE_DIVISIONS) {
		if (Math.abs(duration) < division.amount) return RELATIVE_TIME.format(Math.round(duration), division.unit);
		duration /= division.amount;
	}
	return RELATIVE_TIME.format(Math.round(duration), "years");
}
function formatAbsoluteTime(iso) {
	return new Date(iso).toLocaleString();
}
/**
* Feed — Design Schema, category: container.
*
* When to use:
* Use a Feed for a stream of similar, time-ordered items whose total is unknown or large:
* activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a
* time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the
* reader is looking; use `onItemVisible` to mark things read.
*/
const Feed = function Feed({ ref, label, items, hasMore = false, loading = false, newItemsCount, headingLevel = "3", endMessage, onLoadMore, onShowNew, onItemVisible, overrides, className, style, ...rest }) {
	const baseId = `ds-feed${useId()}`;
	const rootRef = useRef(null);
	useImperativeHandle(ref, () => rootRef.current, []);
	const articleRefs = useRef(/* @__PURE__ */ new Map());
	const newItemsButtonRef = useRef(null);
	const onLoadMoreRef = useRef(onLoadMore);
	const onItemVisibleRef = useRef(onItemVisible);
	useEffect(() => {
		onLoadMoreRef.current = onLoadMore;
		onItemVisibleRef.current = onItemVisible;
	});
	const pendingFocusNewRef = useRef(false);
	const lastFirstIdRef = useRef(items[0]?.id);
	useEffect(() => {
		if (pendingFocusNewRef.current && items[0] && items[0].id !== lastFirstIdRef.current) {
			pendingFocusNewRef.current = false;
			const node = articleRefs.current.get(items[0].id);
			node?.focus();
			node?.scrollIntoView({
				behavior: prefersReducedMotion() ? "auto" : "smooth",
				block: "start"
			});
		}
		lastFirstIdRef.current = items[0]?.id;
	}, [items]);
	const firedInitialLoadRef = useRef(false);
	useEffect(() => {
		if (items.length === 0 && hasMore && !loading && !firedInitialLoadRef.current) {
			firedInitialLoadRef.current = true;
			onLoadMoreRef.current?.();
		} else if (items.length > 0) firedInitialLoadRef.current = false;
	}, [
		items,
		hasMore,
		loading
	]);
	useEffect(() => {
		if (!hasMore || loading || items.length === 0 || typeof IntersectionObserver === "undefined") return void 0;
		const node = articleRefs.current.get(items[items.length - 1].id);
		if (!node) return void 0;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current?.();
		}, { rootMargin: "100% 0px" });
		observer.observe(node);
		return () => observer.disconnect();
	}, [
		items,
		hasMore,
		loading
	]);
	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return void 0;
		const timers = /* @__PURE__ */ new Map();
		const idByNode = /* @__PURE__ */ new Map();
		items.forEach((item) => {
			const node = articleRefs.current.get(item.id);
			if (node) idByNode.set(node, item.id);
		});
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const id = idByNode.get(entry.target);
				if (!id) return;
				const existing = timers.get(id);
				if (existing !== void 0) {
					window.clearTimeout(existing);
					timers.delete(id);
				}
				if (entry.isIntersecting) timers.set(id, window.setTimeout(() => {
					timers.delete(id);
					onItemVisibleRef.current?.(id);
				}, 1e3));
			});
		}, { threshold: .5 });
		idByNode.forEach((_, node) => observer.observe(node));
		return () => {
			observer.disconnect();
			timers.forEach((timer) => window.clearTimeout(timer));
		};
	}, [items]);
	const handleShowNew = () => {
		pendingFocusNewRef.current = true;
		onShowNew?.();
	};
	const handleKeyDown = (event) => {
		if (event.key === "PageDown" || event.key === "PageUp") {
			const articleEl = event.target.closest("[data-ds=\"Card\"]");
			if (!articleEl) return;
			const ids = items.map((item) => item.id);
			const currentIndex = ids.findIndex((id) => articleRefs.current.get(id) === articleEl);
			if (currentIndex === -1) return;
			event.preventDefault();
			const targetId = ids[currentIndex + (event.key === "PageDown" ? 1 : -1)];
			if (targetId) articleRefs.current.get(targetId)?.focus();
		} else if (event.key === "End" && event.ctrlKey) {
			event.preventDefault();
			if (hasMore) onLoadMoreRef.current?.();
			else if (rootRef.current) focusAfter(rootRef.current);
		} else if (event.key === "Home" && event.ctrlKey) {
			event.preventDefault();
			if (newItemsCount) newItemsButtonRef.current?.focus();
			else if (rootRef.current) focusBefore(rootRef.current);
		}
	};
	const classes = ["ds-feed", className ?? null].filter(Boolean).join(" ");
	const { rootStyle, articleOverrides, timestampOverrides, endMessageOverrides, newItemsButtonOverrides } = overrides ? overridesToStyle(overrides) : {
		rootStyle: void 0,
		articleOverrides: void 0,
		timestampOverrides: void 0,
		endMessageOverrides: void 0,
		newItemsButtonOverrides: void 0
	};
	const mergedStyle = rootStyle || style ? {
		...rootStyle,
		...style
	} : void 0;
	const total = items.length;
	const setSize = hasMore ? -1 : total;
	return /* @__PURE__ */ jsxs("div", {
		...rest,
		ref: rootRef,
		"data-ds": "Feed",
		"data-part": "container",
		className: classes,
		style: mergedStyle,
		role: "feed",
		"aria-label": label,
		"aria-busy": loading ? "true" : void 0,
		onKeyDown: handleKeyDown,
		children: [
			newItemsCount ? /* @__PURE__ */ jsx("div", {
				className: "ds-feed__new-items",
				"data-part": "newItemsButton",
				role: "status",
				"aria-live": "polite",
				children: /* @__PURE__ */ jsx(Button, {
					ref: newItemsButtonRef,
					variant: "secondary",
					size: "sm",
					label: COPY.showNew.replace("{count}", String(newItemsCount)),
					overrides: newItemsButtonOverrides,
					onClick: handleShowNew
				})
			}) : null,
			total === 0 && !loading ? /* @__PURE__ */ jsx(Text, {
				tone: "muted",
				className: "ds-feed__empty",
				"data-part": "emptyState",
				children: COPY.empty
			}) : items.map((item, index) => {
				const timestampId = `${`${baseId}-${item.id}`}-time`;
				return /* @__PURE__ */ jsx(Card, {
					ref: (node) => {
						if (node) articleRefs.current.set(item.id, node);
						else articleRefs.current.delete(item.id);
					},
					"data-unread": item.unread || void 0,
					heading: item.heading,
					headingLevel,
					footer: item.actions !== void 0 ? /* @__PURE__ */ jsx("div", {
						"data-part": "articleActions",
						children: item.actions
					}) : void 0,
					overrides: articleOverrides,
					tabIndex: -1,
					"aria-describedby": timestampId,
					"aria-posinset": index + 1,
					"aria-setsize": setSize,
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-feed__article-body",
						"data-part": "articleBody",
						children: [
							item.unread ? /* @__PURE__ */ jsx("span", {
								className: "ds-feed__visually-hidden",
								children: COPY.unread
							}) : null,
							/* @__PURE__ */ jsx("time", {
								className: "ds-feed__timestamp",
								id: timestampId,
								dateTime: item.timestamp,
								title: formatAbsoluteTime(item.timestamp),
								children: /* @__PURE__ */ jsx(Text, {
									element: "span",
									tone: "muted",
									size: "xs",
									overrides: timestampOverrides,
									children: formatRelativeTime(item.timestamp)
								})
							}),
							setSize !== -1 ? /* @__PURE__ */ jsx("span", {
								className: "ds-feed__visually-hidden",
								children: COPY.position.replace("{index}", String(index + 1)).replace("{total}", String(total))
							}) : null,
							item.content
						]
					})
				}, item.id);
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "ds-feed__loading",
				"data-part": "loadingIndicator",
				children: /* @__PURE__ */ jsx(ProgressBar, {
					label: COPY.loading,
					hideLabel: true
				})
			}) : total > 0 && !hasMore ? /* @__PURE__ */ jsx("div", {
				className: "ds-feed__end-message",
				"data-part": "endMessage",
				role: "status",
				"aria-live": "polite",
				children: /* @__PURE__ */ jsx(Text, {
					tone: "muted",
					size: "sm",
					overrides: endMessageOverrides,
					children: endMessage ?? COPY.end
				})
			}) : null
		]
	});
};
//#endregion
export { Accordion, ActionSheet, Alert, AlertDialog, BottomSheet, Box, Breadcrumb, Button, Card, Carousel, CarouselSlide, Checkbox, Combobox, Container, DataGrid, DatePicker, Dialog, Disclosure, Divider, Feed, Fieldset, FocusScope, Form, FormContext, Heading, Icon, Input, Landmark, Link, Listbox, Menu, Meter, NumberInput, Popover, ProgressBar, RadioGroup, Search, SegmentedControl, Select, SidePanel, Slider, Splitter, Stack, Stepper, Switch, TabPanel, Table, Tabs, Text, Toast, ToastRegion, Toolbar, ToolbarGroup, Tooltip, Tree, TreeGrid, toast, useFormContext };

//# sourceMappingURL=index.js.map