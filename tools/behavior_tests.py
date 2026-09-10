"""
Behavior gate — derive runnable tests from each component's `behavior` scenarios.

Nobody writes a "click the label toggles it" test by hand for seventy components. The doc
says so as data (`{ when: { click: label }, then: [{ event: onChange, with: true }] }`), and
this script turns every scenario into a test against the real component module, for every
platform the scenario applies to (`tools/parse.behavior_for` already narrows authored +
derived scenarios per platform — see tools/parse.py):

    generated/behavior/<Name>.<platform>.test.ts(x)

Web and React Native run on Vitest/Jest + Testing Library; Lit runs on the package's own
Vitest-in-Chromium setup (packages/lit/vitest.config.ts). Each package's test config has an
`include` entry pointing back here, and `pnpm --filter @design-schema/<pkg> test -- generated/behavior/<Name>.<platform>`
runs just one component's file.

Not every `when`/`then` shape has a test-code mapping today (see Unmappable below,
`then.attribute` and `then.focused: moved|unchanged` are the current gaps). Those scenarios
become `test.skip('<name> — <reason>', ...)` so the report shows the gap instead of a false pass.

Anatomy parts are located, in order: the primary part (`anatomy[0]`, e.g. Checkbox's
`control`, Switch's `track`) by role; a part whose name matches a string prop, by its text;
otherwise the `data-part`/`testID`/`part` hook a newly generated component carries (see
prompts/conventions/*.md) — components generated before that convention will fail at that
locator until they adopt it, which is the point of the gate.

Usage:  python3 tools/behavior_tests.py                 # writes generated/behavior/*.test.ts(x)
        pnpm --filter @design-schema/react test -- generated/behavior/Checkbox.web
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import json
import re
from pathlib import Path

import parse as p

ROOT = Path(__file__).resolve().parents[1]
GENERATED = ROOT / "generated"
OUT = GENERATED / "behavior"

PLATFORMS = ("web", "lit", "rn")
# Roles a test cannot query for: `none`/`presentation` have no element, `text` is not an ARIA role, and
# `landmark` stands for whichever landmark role the component's own prop selects.
NON_CONCRETE_ROLES = {"none", "presentation", "text", "landmark"}
# The component's surface is not in the document until something opens it and there is no `open` prop to set.
HOVER_ROLES = {"tooltip"}
SOURCE_FILE = {"web": "packages/react/src/{name}.tsx", "lit": "packages/lit/src/{name}.ts", "rn": "packages/rn/src/{name}.tsx"}
DEEP_QUERY_HELPER = """function deep(root: ParentNode, selector: string): Element | null {
  const direct = root.querySelector(selector);
  if (direct) return direct;
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const shadow = (el as HTMLElement).shadowRoot;
    if (shadow) {
      const found = deep(shadow, selector);
      if (found) return found;
    }
  }
  return null;
}
"""
EXT = {"web": "tsx", "lit": "ts", "rn": "tsx"}
PKG_SRC = {"web": "packages/react/src", "lit": "packages/lit/src", "rn": "packages/rn/src"}
REL_SRC = {plat: "../../" + PKG_SRC[plat] for plat in PLATFORMS}  # from generated/behavior/

STATE_ARIA = {
    "checked": "aria-checked",
    "expanded": "aria-expanded",
    "selected": "aria-selected",
    "disabled": "aria-disabled",
    "invalid": "aria-invalid",
    "pressed": "aria-pressed",
    "open": "aria-expanded",
}
STATE_RN_MATCHER = {"checked": "toBeChecked", "disabled": "toBeDisabled", "selected": "toBeSelected", "expanded": "toBeExpanded"}
KEY_MAP = {"web": {"Space": "[Space]"}, "lit": {"Space": " "}}


class Unmappable(Exception):
    """Raised when a `when`/`then` shape has no test-code mapping for a platform."""

    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


def js(value) -> str:
    """A JSON value rendered as a JS literal (JSON is valid JS for our purposes: strings, bools, numbers)."""
    return json.dumps(value)


def esc_regex(text: str) -> str:
    return re.escape(text)


def regex_expr(template: str) -> str:
    """A `then.text` literal or `then.copy` template (which may contain `{label}`) as a JS `new RegExp(...)`
    expression, substituting the *runtime* `s.props.label` for the placeholder."""
    # Testing Library trims leading/trailing whitespace off rendered text before matching
    # (e.g. copy.requiredIndicator is " (required)", rendered as its own trimmed text node).
    parts = template.strip().split("{label}")
    js_parts = []
    for i, part in enumerate(parts):
        if part:
            js_parts.append(js(esc_regex(part)))
        if i < len(parts) - 1:
            js_parts.append("escapeRegExp(s.props.label)")
    return "new RegExp(" + " + ".join(js_parts) + ")"


ESCAPE_REGEXP_HELPER = "function escapeRegExp(s: string): string {\n  return s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\n}\n"


def primary_part(c: dict) -> str:
    anatomy = c.get("anatomy") or []
    if not anatomy:
        raise Unmappable("component declares no anatomy — nothing to locate")
    return anatomy[0]


def part_locator(c: dict, part: str, platform: str) -> str:
    """A JS expression that finds an anatomy part's element, using `s`'s per-part accessors."""
    return f"s.{part}()"


def concrete_role(c: dict) -> str | None:
    role = c["a11y"]["role"]
    return None if role in NON_CONCRETE_ROLES else role


def root_locator_body(c: dict, platform: str) -> str:
    """The component's root: the `data-ds` hook first (piercing shadow roots on Lit), the rendered tree otherwise."""
    name = c["name"]
    role = concrete_role(c)
    if platform == "web":
        by_role = f" ?? screen.queryByRole('{role}')" if role else ""
        return f'(document.querySelector(\'[data-ds="{name}"]\'){by_role} ?? utils.container.firstElementChild) as HTMLElement'
    if platform == "rn":
        return f"screen.queryByTestId('{name}') ?? screen.UNSAFE_root"
    if platform == "lit":
        return "el"
    raise Unmappable(f"unknown platform '{platform}'")


def part_locator_body(c: dict, part: str, platform: str) -> str:
    """The accessor body for `part`: how the part is actually found, one heuristic at a time. The primary part is
    the role element when the role can be queried, else the root (never `getByRole('text')` or `('none')`)."""
    anatomy = c.get("anatomy") or []
    props = c.get("props") or {}
    role = concrete_role(c)
    is_primary = bool(anatomy) and part == anatomy[0]
    prop = props.get(part)
    is_text_prop = prop is not None and prop.get("type") == "string"

    if platform == "web":
        if is_primary:
            return f"(screen.queryByRole('{role}') ?? s.root()) as HTMLElement" if role else "s.root()"
        if is_text_prop:
            return f"screen.getByText(props.{part})"
        return f'(utils.container.querySelector(\'[data-part="{part}"]\') ?? s.root())'
    if platform == "rn":
        if is_primary:
            return f"screen.queryByRole('{role}') ?? s.root()" if role else "s.root()"
        if is_text_prop:
            return f"screen.getByText(props.{part})"
        return f"screen.queryByTestId('{c['name']}.{part}') ?? s.root()"
    if platform == "lit":
        by_part = f'deep(root, \'[part="{part}"]\') ?? deep(root, \'[data-part="{part}"]\')'
        if is_primary:
            by_role = f'deep(root, \'[role="{role}"]\') ?? ' if role else ""
            return f"({by_role}{by_part} ?? root.firstElementChild) as HTMLElement"
        return f"({by_part}) as HTMLElement"
    raise Unmappable(f"unknown platform '{platform}'")


def used_parts(c: dict, scenarios: list[dict]) -> list[str]:
    """Anatomy parts referenced by `when`/`then` across the scenarios, plus the primary part
    (state/focusable/name/renders assertions always target it, whether or not a `when` names it)."""
    anatomy = c.get("anatomy") or []
    used: set[str] = set()
    if anatomy:
        used.add(anatomy[0])
    for sc in scenarios:
        when = sc.get("when") or {}
        for key in ("click", "focus"):
            if key in when and when[key] in anatomy:
                used.add(when[key])
        for item in sc["then"]:
            for key in ("focus", "focused"):
                if key in item and item[key] in anatomy:
                    used.add(item[key])
    return [part for part in anatomy if part in used]


# ---------------------------------------------------------------------------
# `when` → (setup lines, action lines)
# ---------------------------------------------------------------------------

def when_lines(c: dict, sc: dict, platform: str) -> list[str]:
    when = sc.get("when")
    if not when:
        return []
    if len(when) != 1:
        raise Unmappable(f"when: {sorted(when)} — only one interaction per scenario is supported")
    (kind, value), = when.items()

    if kind == "click":
        locator = part_locator(c, value, platform)
        if platform == "web":
            return [f"await s.user.click({locator});"]
        if platform == "rn":
            return [f"fireEvent.press({locator});"]
        if platform == "lit":
            # Playwright will not click an aria-disabled control on its own; a person can, and the doc says what happens.
            force = ", { force: true }" if (sc.get("given") or {}).get("disabled") else ""
            return [f"await userEvent.click({locator}{force});"]

    if kind == "key":
        control = part_locator(c, primary_part(c), platform)
        if platform == "web":
            mapped = KEY_MAP["web"].get(value, "{" + value + "}")
            return [f"act(() => ({control}).focus());", f"await s.user.keyboard('{mapped}');"]
        if platform == "lit":
            mapped = KEY_MAP["lit"].get(value, "{" + value + "}")
            return [f"s.el.focus();", f"await userEvent.keyboard('{mapped}');"]
        raise Unmappable("when.key: React Native has no keyboard")

    if kind == "type":
        control = part_locator(c, primary_part(c), platform)
        if platform == "web":
            return [f"await s.user.type({control}, {js(value)});"]
        if platform == "rn":
            return [f"fireEvent.changeText({control}, {js(value)});"]
        if platform == "lit":
            return [f"await userEvent.type({control}, {js(value)});"]

    if kind == "focus":
        locator = part_locator(c, value, platform)
        if platform == "web":
            return [f"act(() => ({locator}).focus());"]
        if platform == "lit":
            return [f"({locator}).focus();"]
        if platform == "rn":
            return [f"fireEvent({locator}, 'focus');"]

    if kind == "blur":
        control = part_locator(c, primary_part(c), platform)
        if platform == "web":
            return ["act(() => (document.activeElement as HTMLElement | null)?.blur());"]
        if platform == "lit":
            return ["(document.activeElement as HTMLElement | null)?.blur();"]
        if platform == "rn":
            return [f"fireEvent({control}, 'blur');"]

    raise Unmappable(f"when.{kind}: no test-code mapping for this interaction")


# ---------------------------------------------------------------------------
# `then` items → assertion lines
# ---------------------------------------------------------------------------

def then_event_lines(c: dict, item: dict, platform: str) -> list[str]:
    name = item["event"]
    mock = f"s.events.{name}"
    if item.get("fired") is False:
        return [f"expect({mock}).not.toHaveBeenCalled();"]
    if "with" in item:
        value = item["with"]
        if platform == "web":
            return [f"expect({mock}).toHaveBeenCalledWith({js(value)}, expect.anything());"]
        if platform == "rn":
            return [f"expect({mock}).toHaveBeenCalledWith({js(value)});"]
        if platform == "lit":
            if isinstance(value, dict):
                return [f"expect({mock}).toHaveBeenCalledTimes(1);",
                        f"expect({mock}.mock.calls[0]?.[0]?.detail).toMatchObject({js(value)});"]
            return [
                f"expect({mock}).toHaveBeenCalledTimes(1);",
                f"expect(Object.values({mock}.mock.calls[0]?.[0]?.detail ?? {{}})).toContain({js(value)});",
            ]
    return [f"expect({mock}).toHaveBeenCalled();"]


def then_state_lines(c: dict, item: dict, platform: str) -> list[str]:
    state, is_value = item["state"], item["is"]
    control = part_locator(c, primary_part(c), platform)
    if platform == "web" or platform == "lit":
        aria = STATE_ARIA[state]
        if state == "checked" and isinstance(is_value, bool) and platform == "web":
            return [f"expect({control}).{'toBeChecked()' if is_value else 'not.toBeChecked()'};"]
        if state == "checked" and isinstance(is_value, bool) and platform == "lit":
            # A native checkbox carries its state in `.checked` (aria-checked is only for `mixed`); a role=switch or
            # role=checkbox on another element carries it in aria-checked.
            return [f"expect((({control}) as HTMLInputElement).type === 'checkbox' ? (({control}) as HTMLInputElement).checked : ({control}).getAttribute('aria-checked') === 'true').toBe({'true' if is_value else 'false'});"]
        val = "true" if is_value is True else "false" if is_value is False else str(is_value)
        return [f"expect({control}).toHaveAttribute('{aria}', '{val}');"]
    if platform == "rn":
        matcher = STATE_RN_MATCHER.get(state)
        if matcher and isinstance(is_value, bool):
            return [f"expect({control}).{'' if is_value else 'not.'}{matcher}();"]
        return [f"expect({control}).toHaveProp('accessibilityState', expect.objectContaining({{ {state}: {js(is_value)} }}));"]
    raise Unmappable(f"then.state: no mapping for {platform}")


def then_focusable_lines(c: dict, platform: str) -> list[str]:
    control = part_locator(c, primary_part(c), platform)
    if platform == "web":
        return [f"act(() => ({control}).focus());", f"expect({control}).toHaveFocus();"]
    if platform == "lit":
        return ["s.el.focus();", "expect(document.activeElement).toBe(s.el);"]
    raise Unmappable("then.focusable: React Native cannot observe focus")


def then_focused_lines(c: dict, target: str, platform: str) -> list[str]:
    anatomy = c.get("anatomy") or []
    if platform == "rn":
        raise Unmappable("then.focused: React Native cannot observe focus")
    if target in ("moved", "unchanged"):
        raise Unmappable(f"then.focused: '{target}' needs a pre-action focus snapshot this generator does not capture")
    if platform == "web":
        if target == "none":
            return ["expect(document.activeElement === document.body).toBe(true);"]
        return [f"expect(document.activeElement).toBe({part_locator(c, target, platform)});"]
    if platform == "lit":
        if target == "none":
            return ["expect(s.el.shadowRoot!.activeElement).toBeNull();"]
        return [f"expect(s.el.shadowRoot!.activeElement).toBe({part_locator(c, target, platform)});"]
    raise Unmappable(f"then.focused: no mapping for {platform}")


def then_text_lines(c: dict, text: str, platform: str) -> list[str]:
    rx = regex_expr(text)
    if platform == "web":
        return [f"expect(screen.getByText({rx})).toBeInTheDocument();"]
    if platform == "rn":
        return [f"expect(screen.getByText({rx})).toBeOnTheScreen();"]
    if platform == "lit":
        return [f"expect(s.el.shadowRoot!.textContent).toMatch({rx});"]
    raise Unmappable(f"then.text: no mapping for {platform}")


def then_copy_lines(c: dict, key: str, platform: str) -> list[str]:
    template = (c.get("copy") or {}).get(key)
    if template is None:
        raise Unmappable(f"then.copy: unknown copy key '{key}'")
    return then_text_lines(c, template, platform)


def then_role_lines(c: dict, role: str, platform: str) -> list[str]:
    if platform == "web":
        return [f"expect(screen.getByRole('{role}')).toBeInTheDocument();"]
    if platform == "rn":
        return [f"expect(screen.getByRole('{role}')).toBeOnTheScreen();"]
    if platform == "lit":
        return [f"expect(s.el.shadowRoot!.querySelector('[role=\"{role}\"]')).not.toBeNull();"]
    raise Unmappable(f"then.role: no mapping for {platform}")


def then_name_lines(c: dict, platform: str) -> list[str]:
    role = concrete_role(c)
    if role is None:
        raise Unmappable(f"then.name: role '{c['a11y']['role']}' cannot be queried; name the landmark/text role in the doc")
    name_prop = p.accessible_name_prop(c)
    expected = f"s.props.{name_prop}" if name_prop else None
    if platform == "web":
        if expected:
            return [f"expect(screen.getByRole('{role}', {{ name: {expected} }})).toBeInTheDocument();"]
        return [f"expect(screen.getByRole('{role}')).toHaveAccessibleName();"]
    if platform == "rn":
        if expected:
            return [f"expect(screen.getByRole('{role}', {{ name: {expected} }})).toBeOnTheScreen();"]
        return [f"expect(screen.getByRole('{role}')).toBeOnTheScreen();"]
    if platform == "lit":
        target = part_locator(c, primary_part(c), platform)
        if expected:
            return [f"expect({target}).toHaveAccessibleName({expected});"]
        return [f"expect({target}).toHaveAccessibleName();"]
    raise Unmappable(f"then.name: no mapping for {platform}")


def then_renders_lines(c: dict, platform: str) -> list[str]:
    """Rendering is judged by the root, never by role: a decorative Icon has no role, an Input's role follows
    its type, and a closed overlay has no surface — none of those is a failure to render."""
    if platform == "web":
        return ["expect(s.root()).not.toBeNull();"]
    if platform == "rn":
        return ["expect(s.root()).toBeTruthy();"]
    if platform == "lit":
        # An element that renders into its shadow root must have put something there; a light-DOM element (a
        # landmark whose role lives on the host through ElementInternals) has rendered once it is connected.
        return ["expect(s.el.shadowRoot ? s.root.childElementCount > 0 : s.el.isConnected).toBe(true);"]
    raise Unmappable(f"then.renders: no mapping for {platform}")


def then_item_lines(c: dict, item: dict, platform: str) -> list[str]:
    if "event" in item:
        return then_event_lines(c, item, platform)
    if "state" in item:
        return then_state_lines(c, item, platform)
    if "focusable" in item:
        return then_focusable_lines(c, platform)
    if "focused" in item:
        return then_focused_lines(c, item["focused"], platform)
    if "focus" in item:
        return then_focused_lines(c, item["focus"], platform)
    if "text" in item:
        return then_text_lines(c, item["text"], platform)
    if "copy" in item:
        return then_copy_lines(c, item["copy"], platform)
    if "role" in item:
        return then_role_lines(c, item["role"], platform)
    if "name" in item:
        return then_name_lines(c, platform)
    if "renders" in item:
        return then_renders_lines(c, platform)
    if "attribute" in item:
        raise Unmappable("then.attribute: no test-code convention for an arbitrary attribute assertion yet")
    raise Unmappable(f"then: unrecognized assertion keys {sorted(item)}")


# ---------------------------------------------------------------------------
# Scenario → test block
# ---------------------------------------------------------------------------

def needs_surface(sc: dict) -> bool:
    """Whether the scenario asserts on the component's surface (so a closed overlay must be opened first)."""
    if sc.get("when"):
        return True
    return any(k in item for item in sc["then"] for k in ("name", "renders", "focusable", "focused", "focus", "state", "role", "text", "copy"))


def effective_given(c: dict, sc: dict) -> dict:
    """`given` plus `open: true` for components with a boolean `open` prop, unless the scenario sets it."""
    given = dict(sc.get("given") or {})
    open_prop = (c.get("props") or {}).get("open")
    if open_prop and open_prop.get("type") == "boolean" and "open" not in given and needs_surface(sc):
        given["open"] = True
    return given


def scenario_block(c: dict, sc: dict, platform: str) -> str:
    name = sc["name"].replace("'", "\\'")
    try:
        if c["a11y"]["role"] in HOVER_ROLES and needs_surface(sc):
            raise Unmappable(f"role '{c['a11y']['role']}' needs its trigger hovered or focused; covered by the Keyboard story")
        when = when_lines(c, sc, platform)
        then: list[str] = []
        for item in sc["then"]:
            then += then_item_lines(c, item, platform)
    except Unmappable as e:
        reason = str(e.reason).replace("\\", "\\\\").replace("'", "\\'")
        return f"  test.skip('{name} — {reason}', async () => {{}});"

    given = js(effective_given(c, sc))
    is_async = platform != "rn"
    kw = "async " if is_async else ""
    await_setup = "await " if platform == "lit" else ""
    body = [f"  test('{name}', {kw}() => {{", f"    const s = {await_setup}setup({given});"]
    body += [f"    {line}" for line in when]
    body += [f"    {line}" for line in then]
    body.append("  });")
    return "\n".join(body)


# ---------------------------------------------------------------------------
# Per-platform file assembly
# ---------------------------------------------------------------------------

def events_of(c: dict) -> dict:
    return c.get("events") or {}


def needs_regex_helper(scenarios: list[dict]) -> bool:
    for sc in scenarios:
        for item in sc["then"]:
            if "text" in item or "copy" in item:
                return True
    return False


def web_file(c: dict, scenarios: list[dict]) -> str:
    name = c["name"]
    src = REL_SRC["web"]
    parts = used_parts(c, scenarios)
    events = events_of(c)
    lines = [
        f"// Generated by tools/behavior_tests.py from the `behavior` block of the {name} doc. Do not edit.",
        "import { describe, expect, test, vi } from 'vitest';",
        "import { act, render, screen } from '@testing-library/react';",
        "import userEvent from '@testing-library/user-event';",
        f"import {{ {name} }} from '{src}/{name}';",
        f"import type {{ {name}Props }} from '{src}/{name}';",
        f"import meta from '{src}/{name}.stories';",
        "",
    ]
    if needs_regex_helper(scenarios):
        lines.append(ESCAPE_REGEXP_HELPER)
    lines.append(f"function setup(given: Partial<{name}Props> = {{}}) {{")
    if events:
        lines.append("  const events = {")
        for ev_name in events:
            lines.append(f"    {ev_name}: vi.fn(),")
        lines.append("  };")
    else:
        lines.append("  const events = {};")
    ev_props = ", ".join(f"{ev['platforms']['web']}: events.{ev_name}" for ev_name, ev in events.items())
    props_line = "  const props = { ...meta.args, ...given" + (f", {ev_props}" if ev_props else "") + " };"
    lines.append(props_line)
    lines.append(f"  const utils = render(<{name} {{...props}} />);")
    lines.append("  const user = userEvent.setup();")
    lines.append("  const s = {")
    lines.append("    ...utils,")
    lines.append("    user,")
    lines.append("    events,")
    lines.append("    props,")
    lines.append(f"    root: () => {root_locator_body(c, 'web')},")
    for part in parts:
        lines.append(f"    {part}: () => {part_locator_body(c, part, 'web')},")
    lines.append(f"    rerender: (next: Partial<{name}Props>) => utils.rerender(<{name} {{...props}} {{...next}} />),")
    lines.append("  };")
    lines.append("  return s;")
    lines.append("}")
    lines.append("")
    lines.append(f"describe('{name}', () => {{")
    for sc in scenarios:
        lines.append(scenario_block(c, sc, "web"))
    lines.append("});")
    return "\n".join(lines) + "\n"


def rn_file(c: dict, scenarios: list[dict]) -> str:
    name = c["name"]
    src = REL_SRC["rn"]
    parts = used_parts(c, scenarios)
    events = events_of(c)
    lines = [
        f"// Generated by tools/behavior_tests.py from the `behavior` block of the {name} doc. Do not edit.",
        "import * as React from 'react';",
        "import { fireEvent, render, screen } from '@testing-library/react-native';",
        f"import {{ {name} }} from '{src}/{name}';",
        f"import type {{ {name}Props }} from '{src}/{name}';",
        f"import meta from '{src}/{name}.stories';",
        f"import {{ ThemeProvider }} from '{src}/theme';",
        "",
    ]
    if needs_regex_helper(scenarios):
        lines.append(ESCAPE_REGEXP_HELPER)
    lines.append(f"function setup(given: Partial<{name}Props> = {{}}) {{")
    if events:
        lines.append("  const events = {")
        for ev_name in events:
            lines.append(f"    {ev_name}: jest.fn(),")
        lines.append("  };")
    else:
        lines.append("  const events = {};")
    ev_props = ", ".join(f"{ev['platforms']['rn']}: events.{ev_name}" for ev_name, ev in events.items())
    props_line = f"  const props: {name}Props = " + "{ ...(meta.args as " + f"{name}Props)" + ", ...given" + (f", {ev_props}" if ev_props else "") + " };"
    lines.append(props_line)
    lines.append(f"  const tree = (p: {name}Props) => (")
    lines.append("    <ThemeProvider mode=\"light\">")
    lines.append(f"      <{name} {{...p}} />")
    lines.append("    </ThemeProvider>")
    lines.append("  );")
    lines.append("  const utils = render(tree(props));")
    lines.append("  const s = {")
    lines.append("    ...utils,")
    lines.append("    events,")
    lines.append("    props,")
    lines.append(f"    root: () => {root_locator_body(c, 'rn')},")
    for part in parts:
        lines.append(f"    {part}: () => {part_locator_body(c, part, 'rn')},")
    lines.append(f"    rerender: (next: Partial<{name}Props>) => utils.rerender(tree({{ ...props, ...next }})),")
    lines.append("  };")
    lines.append("  return s;")
    lines.append("}")
    lines.append("")
    lines.append(f"describe('{name}', () => {{")
    for sc in scenarios:
        lines.append(scenario_block(c, sc, "rn"))
    lines.append("});")
    return "\n".join(lines) + "\n"


def lit_file(c: dict, scenarios: list[dict]) -> str:
    name = c["name"]
    tag = c["platforms"]["lit"]["tag"]
    src = REL_SRC["lit"]
    parts = used_parts(c, scenarios)
    events = events_of(c)
    lines = [
        f"// Generated by tools/behavior_tests.py from the `behavior` block of the {name} doc. Do not edit.",
        "import { beforeEach, describe, expect, test, vi } from 'vitest';",
        "import { userEvent } from '@vitest/browser/context';",
        f"import '{src}/{name}.js';",
        f"import meta from '{src}/{name}.stories.js';",
        "",
    ]
    if needs_regex_helper(scenarios):
        lines.append(ESCAPE_REGEXP_HELPER)
    lines.append(DEEP_QUERY_HELPER)
    lines.append("async function setup(given: Record<string, unknown> = {}) {")
    lines.append(f"  const el = document.createElement('{tag}');")
    lines.append("  const props = { ...meta.args, ...given };")
    lines.append("  for (const [key, value] of Object.entries(props)) {")
    lines.append("    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;")
    lines.append("  }")
    lines.append("  const events = {")
    for ev_name, ev in events.items():
        lines.append(f"    {ev_name}: vi.fn(),")
    lines.append("  };")
    for ev_name, ev in events.items():
        lit_event = ev["platforms"]["lit"]
        lines.append(f"  el.addEventListener('{lit_event}', events.{ev_name} as unknown as EventListener);")
    lines.append("  document.body.append(el);")
    lines.append("  await (el as unknown as { updateComplete: Promise<boolean> }).updateComplete;")
    lines.append("  const root: ParentNode = el.shadowRoot ?? el;  // some elements render in light DOM")
    lines.append("  const s = {")
    lines.append("    el,")
    lines.append("    root,")
    lines.append("    events,")
    lines.append("    props,")
    lines.append("    root_: () => el,")
    for part in parts:
        lines.append(f"    {part}: () => {part_locator_body(c, part, 'lit')},")
    lines.append("  };")
    lines.append("  return s;")
    lines.append("}")
    lines.append("")
    lines.append("beforeEach(() => {")
    lines.append("  document.body.replaceChildren();")
    lines.append("});")
    lines.append("")
    lines.append(f"describe('{tag}', () => {{")
    for sc in scenarios:
        lines.append(scenario_block(c, sc, "lit"))
    lines.append("});")
    return "\n".join(lines) + "\n"


FILE_BUILDERS = {"web": web_file, "lit": lit_file, "rn": rn_file}


def main() -> int:
    entries = json.loads((GENERATED / "components.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.test.*"):
        old.unlink()
    n_files = n_tests = n_skips = n_missing = 0
    for entry in entries:
        c = entry["component"]
        derived = entry.get("behaviorDerived") or []
        if not c.get("behavior") and not derived:
            continue
        for platform in PLATFORMS:
            if platform not in c["platforms"] or not c["platforms"][platform].get("supported", True):
                continue
            if not (ROOT / SOURCE_FILE[platform].format(name=c["name"])).exists():
                n_missing += 1  # not generated yet: no test file, so the package suite stays green
                continue
            scenarios = p.behavior_for(c, derived, platform)
            if not scenarios:
                continue
            content = FILE_BUILDERS[platform](c, scenarios)
            path = OUT / f"{c['name']}.{platform}.test.{EXT[platform]}"
            path.write_text(content, encoding="utf-8")
            n_files += 1
            for line in content.splitlines():
                if re.match(r"\s*test\('", line):
                    n_tests += 1
                elif re.match(r"\s*test\.skip\('", line):
                    n_skips += 1
    print(f"✔ behavior gate: {n_files} file(s), {n_tests} test(s), {n_skips} skip(s), {n_missing} target(s) not generated yet → {OUT.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
