"""
Parse component docs → machine-readable output.

For every site/src/content/docs/components/*.md:
  1. split YAML frontmatter from the Markdown body
  2. validate frontmatter.component against schema/component.schema.json
  3. split the body into sections by `## ` heading and check them against ALLOWED_HEADINGS
  4. emit generated/components.json  (frontmatter + sections, one entry per component)
  5. emit generated/prompts/<Name>.<platform>.md — the generation prompt ("mini-skill")
     for each supported platform: frontmatter + guidance + prompts/templates/<platform>.md

Exit code 1 on any validation error, so this can gate CI and the site build.

Usage: python3 tools/parse.py
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import itertools
import json
import os
import re
import sys
from pathlib import Path

import yaml
try:  # jsonschema ≥4.x
    from jsonschema import Draft202012Validator as Validator
except ImportError:  # older distro packages (3.x): $defs refs still resolve as JSON pointers
    from jsonschema import Draft7Validator as Validator

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "site" / "src" / "content" / "docs" / "components"
THEME_DOCS = ROOT / "site" / "src" / "content" / "docs" / "themes"
SCHEMA = ROOT / "schema" / "component.schema.json"
EXT_DOCS = ROOT / "site" / "src" / "content" / "docs" / "extensions"
EXT_SCHEMA = ROOT / "schema" / "extension.schema.json"
PKG = {"web": "react", "lit": "lit", "rn": "rn"}
TEMPLATES = ROOT / "prompts" / "templates"
OUT = ROOT / "generated"

# The prose body is guidance, not schema. Sections are fixed so the docs site,
# the MCP server, and the prompt builder can address them by name.
THEME_HEADINGS = ["Overview", "Feel", "Not", "References", "When to use", "When not to use", "Accessibility", "Platform notes"]
ALLOWED_HEADINGS = [
    "Overview",
    "When to use",
    "When not to use",
    "Behavior",
    "Content guidelines",
    "Accessibility",
    "Platform notes",
    "Examples",
    "Related",
]
REQUIRED_HEADINGS = ["When to use", "Accessibility"]
FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.S)
STATUS_PUBLISHED = {"review", "stable"}


class DocError(Exception):
    pass


def write_if_changed(path: Path, text: str) -> bool:
    """Atomic write that leaves the file untouched when the content is identical, so concurrent generator
    runs (one per platform) re-parsing the same docs neither race on the file nor bump its mtime.
    Returns True when the file was (re)written."""
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)
    return True


def split_frontmatter(text: str, path: Path) -> tuple[dict, str]:
    m = FRONTMATTER.match(text)
    if not m:
        raise DocError(f"{path.name}: missing YAML frontmatter block")
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        raise DocError(f"{path.name}: invalid YAML frontmatter: {e}") from e
    return fm, m.group(2)


def split_sections(body: str, path: Path, allowed: list[str] = ALLOWED_HEADINGS, required: list[str] = REQUIRED_HEADINGS) -> dict[str, str]:
    """{'When to use': '...markdown...', ...}; text before the first ## goes to 'Overview'."""
    sections: dict[str, str] = {}
    current = "Overview"
    buf: list[str] = []
    in_fence = False
    for line in body.splitlines():
        if line.startswith("```"):
            in_fence = not in_fence
        if not in_fence and line.startswith("## "):
            sections[current] = "\n".join(buf).strip()
            current = line[3:].strip()
            if not any(current == h or current.startswith(h + " ") for h in allowed):
                raise DocError(
                    f"{path.name}: heading '## {current}' is not allowed. Use one of: {', '.join(allowed)}"
                )
            if current in sections:
                raise DocError(f"{path.name}: duplicate section '## {current}'")
            buf = []
        else:
            buf.append(line)
    sections[current] = "\n".join(buf).strip()
    for h in required:
        if not sections.get(h):
            raise DocError(f"{path.name}: required section '## {h}' is missing or empty")
    return {k: v for k, v in sections.items() if v}


# Built token names (public form: a trailing `.default` dropped), for checking that every value an interpolated
# binding can take resolves to a real token. Read from the built JSON when it exists, else from the theme tree.
TOKEN_DIST = ROOT / "packages" / "tokens" / "dist" / "calm-precise" / "json" / "tokens.light.json"
# Enum values that a binding renders as "nothing" instead of a token (the templates say so): `none` for a
# background/border/padding, `full` for a max-width. A missing token for these values is not an error.
NO_TOKEN_VALUES = {"none", "full"}
_token_names: set[str] | None = None


def token_names() -> set[str] | None:
    """Public names of every built token, or None when nothing has been built yet (the check is then skipped)."""
    global _token_names
    if _token_names is not None:
        return _token_names
    names: set[str] | None = None
    if TOKEN_DIST.exists():
        names = set(json.loads(TOKEN_DIST.read_text(encoding="utf-8")))
    else:
        try:
            sys.path.insert(0, str(Path(__file__).resolve().parent))
            from tokens import load_theme, public_name, themes  # noqa: E402

            ids = themes()
            if ids:
                names = {public_name(k) for k in load_theme(ids[0], "light")}
        except Exception:  # no derived themes yet: nothing to check against
            names = None
    _token_names = names
    return names


def validate(fm: dict, validator: Validator, path: Path) -> None:
    errors = sorted(validator.iter_errors(fm), key=lambda e: list(e.path))
    if errors:
        lines = [f"{path.name}: frontmatter failed schema validation:"]
        for e in errors:
            where = ".".join(str(p) for p in e.path) or "(root)"
            lines.append(f"  - {where}: {e.message}")
        raise DocError("\n".join(lines))
    c = fm["component"]
    stem = path.stem.replace("-", "").lower()
    if c["name"].lower() != stem:
        raise DocError(f"{path.name}: component.name '{c['name']}' should match file name")
    # Every prop referenced by a token slot must be an enum prop.
    for prop_name, binding in c.get("styles", {}).items():
        for slot in re.findall(r"\{([a-zA-Z]+)\}", binding["token"]):
            p = c["props"].get(slot)
            if not p or p["type"] != "enum":
                raise DocError(f"{path.name}: styles.{prop_name} interpolates '{{{slot}}}' but '{slot}' is not an enum prop")
    # …and every value the interpolation can take must resolve to a built token (after dropping a trailing
    # `.default`), except the no-op values. Two docs shipped with a value that had no token before this check.
    names = token_names()
    if names is not None:
        for prop_name, binding in c.get("styles", {}).items():
            token = binding["token"]
            slots = re.findall(r"\{([a-zA-Z]+)\}", token)
            if not slots:
                continue
            for combo in itertools.product(*[c["props"][s_]["values"] for s_ in slots]):
                ref = token
                for s_, v in zip(slots, combo):
                    ref = ref.replace("{" + s_ + "}", str(v))
                public = ".".join(ref.split(".")[:-1]) if ref.endswith(".default") else ref
                if public not in names and not (set(combo) & NO_TOKEN_VALUES):
                    raise DocError(f"{path.name}: {c['name']}: styles.{prop_name} '{token}' → '{public}' is not a token")
    # Overrides: a binding is locked when its token carries an accessibility guarantee — it appears in a contrast
    # pair, or it is a focus ring / minimum target. Generators expose every other binding as a per-instance override.
    contrast_tokens = {p[k] for p in c["a11y"].get("contrast", []) for k in ("foreground", "background")}
    for b_name, binding in c.get("styles", {}).items():
        auto = binding["token"] in contrast_tokens or b_name.startswith("focusRing") or b_name in ("minTarget", "dismissTarget")
        binding["locked"] = bool(binding.get("locked", False) or auto)
    # Composition parts must be anatomy parts, and name a component that exists (or is explicitly planned).
    for part, comp in (c.get("composition") or {}).items():
        if part not in c["anatomy"]:
            raise DocError(f"{path.name}: composition.{part} is not in anatomy {c['anatomy']}")
        comp_name = comp.replace("(planned)", "").strip()
        if not (DOCS / f"{comp_name.lower()}.md").exists() and "(planned)" not in comp:
            raise DocError(f"{path.name}: composition.{part} names '{comp}', which has no doc (mark it '(planned)')")
    # Keyboard rules imply keyboard-operable, and Escape implies escape-dismiss.
    kb = c.get("keyboard") or []
    if kb and "keyboard-operable" not in c["a11y"]["requires"]:
        raise DocError(f"{path.name}: has a keyboard block but a11y.requires lacks 'keyboard-operable'")
    if any("Escape" in r["keys"] for r in kb) and "escape-dismiss" not in c["a11y"]["requires"]:
        raise DocError(f"{path.name}: keyboard uses Escape but a11y.requires lacks 'escape-dismiss'")
    # A gesture-triggered event must have a non-gesture alternative (WCAG 2.5.1 / 2.5.7).
    if any(ev.get("gesture") for ev in c.get("events", {}).values()) and "gesture-alternative" not in c["a11y"]["requires"]:
        raise DocError(f"{path.name}: declares a gesture event but a11y.requires lacks 'gesture-alternative'")
    # Every event must map (or be explicitly unsupported) on every platform declared for the component.
    for ev_name, ev in c.get("events", {}).items():
        for platform, notes in c["platforms"].items():
            if notes.get("supported", True) and platform not in ev["platforms"]:
                raise DocError(f"{path.name}: events.{ev_name} has no mapping for platform '{platform}'")
    validate_behavior(c, path)


BEHAVIOR_STATES = {"checked", "expanded", "selected", "disabled", "invalid", "pressed", "open"}
BEHAVIOR_FOCUS_TARGETS = {"none", "moved", "unchanged"}


def validate_behavior(component: dict, path: Path) -> None:
    """Cross-reference each authored `behavior` scenario against the rest of the schema:
    props/anatomy/events/copy it names must exist, and anything React Native's harness
    cannot express (keyboard, focus observation, an `invalid` state) must narrow `platforms`
    to exclude 'rn' rather than leave the generator to guess."""
    anatomy = component.get("anatomy") or []
    props = component.get("props") or {}
    events = component.get("events") or {}
    copy = component.get("copy") or {}
    declared_platforms = set(component.get("platforms") or {})

    seen_names: set[str] = set()
    for sc in component.get("behavior") or []:
        name = sc["name"]
        if name in seen_names:
            raise DocError(f"{path.name}: duplicate behavior scenario '{name}'")
        seen_names.add(name)
        if "derived" in sc:
            raise DocError(f"{path.name}: behavior scenario '{name}' sets 'derived' — only the parser may set that key")

        scenario_platforms = sc.get("platforms")
        if scenario_platforms is not None:
            for plat in scenario_platforms:
                if plat not in declared_platforms:
                    raise DocError(f"{path.name}: scenario '{name}' platforms includes '{plat}', which the component does not declare")

        for prop_name, value in (sc.get("given") or {}).items():
            prop = props.get(prop_name)
            if prop is None:
                raise DocError(f"{path.name}: scenario '{name}' given: unknown prop '{prop_name}'")
            if prop["type"] == "enum" and value not in prop["values"]:
                raise DocError(f"{path.name}: scenario '{name}' given.{prop_name}: '{value}' is not one of {prop['values']}")
            if prop["type"] == "boolean" and not isinstance(value, bool):
                raise DocError(f"{path.name}: scenario '{name}' given.{prop_name} must be a boolean, got {value!r}")

        when = sc.get("when") or {}
        if "click" in when and when["click"] not in anatomy:
            raise DocError(f"{path.name}: scenario '{name}' when.click: unknown anatomy part '{when['click']}'")
        if "focus" in when and when["focus"] not in anatomy:
            raise DocError(f"{path.name}: scenario '{name}' when.focus: unknown anatomy part '{when['focus']}'")
        if "key" in when:
            effective = set(scenario_platforms) if scenario_platforms is not None else declared_platforms
            if "rn" in effective:
                raise DocError(f"{path.name}: scenario '{name}' uses when.key but React Native has no keyboard — narrow platforms to exclude 'rn'")

        for item in sc.get("then") or []:
            if "event" in item:
                ev = item["event"]
                if ev not in events:
                    raise DocError(f"{path.name}: scenario '{name}' then.event: unknown event '{ev}'")
                if item.get("fired") is False and "with" in item:
                    raise DocError(f"{path.name}: scenario '{name}': `with` on an event that must not fire")
            for key in ("focus", "focused"):
                if key in item:
                    target = item[key]
                    if target not in anatomy and target not in BEHAVIOR_FOCUS_TARGETS:
                        raise DocError(f"{path.name}: scenario '{name}' then.{key}: unknown anatomy part '{target}'")
            if "copy" in item and item["copy"] not in copy:
                raise DocError(f"{path.name}: scenario '{name}' then.copy: unknown copy key '{item['copy']}'")
            if "state" in item and item["state"] not in BEHAVIOR_STATES:
                raise DocError(f"{path.name}: scenario '{name}' then.state '{item['state']}' must be one of {sorted(BEHAVIOR_STATES)}")

            item_platforms = item.get("platforms")
            if item_platforms is not None:
                for plat in item_platforms:
                    if plat not in declared_platforms:
                        raise DocError(f"{path.name}: scenario '{name}' then item platforms includes '{plat}', which the component does not declare")
                if scenario_platforms is not None and not set(item_platforms) <= set(scenario_platforms):
                    raise DocError(f"{path.name}: scenario '{name}' then item platforms {item_platforms} outside the scenario's platforms {scenario_platforms}")

            if item_platforms is not None:
                effective = set(item_platforms)
            elif scenario_platforms is not None:
                effective = set(scenario_platforms)
            else:
                effective = declared_platforms
            if "rn" in effective:
                if "focusable" in item:
                    raise DocError(f"{path.name}: scenario '{name}' then.focusable: React Native cannot observe focus — narrow platforms to exclude 'rn'")
                if item.get("state") == "invalid":
                    raise DocError(f"{path.name}: scenario '{name}' then.state invalid: React Native has no invalid accessibility state — narrow platforms to exclude 'rn'")


ACCESSIBLE_NAME_HINTS = ("accessible name", "aria-label", "accessibilitylabel", "accessibility label")
ACCESSIBLE_NAME_PROPS = ("label", "caption", "title")
ACCESSIBLE_NAME_PLACEHOLDER = "Accessible name"


def accessible_name_prop(component: dict) -> str | None:
    """The prop that gives the component its accessible name: the first whose `a11y` note says so, else a
    required `label`/`caption`/`title`. None when the name is intrinsic (children, heading text) or absent."""
    props = component.get("props") or {}
    for name, prop in props.items():
        note = str(prop.get("a11y") or "").lower()
        if any(h in note for h in ACCESSIBLE_NAME_HINTS):
            return name
    for name in ACCESSIBLE_NAME_PROPS:
        if name in props and props[name].get("required"):
            return name
    return None


def accessible_name_given(component: dict) -> dict | None:
    """`given` for the derived has-accessible-name scenario: the naming prop with a value when it is optional
    (Icon's `label`), because the Default story leaves it out and the name would otherwise be empty. A required
    prop is already set by the story; an intrinsic name needs nothing."""
    name = accessible_name_prop(component)
    if name is None:
        return None
    prop = component["props"][name]
    if prop.get("required"):
        return None
    if prop.get("type") == "enum" and prop.get("values"):
        return {name: prop["values"][0]}
    if prop.get("type") in ("string", "content"):
        return {name: ACCESSIBLE_NAME_PLACEHOLDER}
    return None


def derive_behavior(component: dict) -> list[dict]:
    """Scenarios the schema already implies, so authors only write what it cannot infer:
    one render per enum value, an accessible-name check, a focusable check for
    keyboard-operable controls, and an error-identification check when there's an `error` prop."""
    props = component.get("props") or {}
    requires = (component.get("a11y") or {}).get("requires") or []
    declared_platforms = list(component.get("platforms") or {})

    scenarios: list[dict] = [{"name": "renders", "then": [{"renders": True}], "derived": True}]

    for prop_name, prop in props.items():
        if prop.get("type") != "enum":
            continue
        for value in prop.get("values") or []:
            sc = {"name": f"renders-{prop_name}-{value}", "given": {prop_name: value},
                  "then": [{"renders": True}], "derived": True}
            if "platforms" in prop:
                sc["platforms"] = prop["platforms"]
            scenarios.append(sc)

    if "accessible-name" in requires:
        sc = {"name": "has-accessible-name", "then": [{"name": True}], "derived": True}
        given = accessible_name_given(component)
        if given:
            sc["given"] = given
        scenarios.append(sc)

    if "keyboard-operable" in requires:
        scenarios.append({
            "name": "control-is-focusable",
            "then": [{"focusable": True}],
            "platforms": sorted(p for p in declared_platforms if p != "rn"),
            "derived": True,
        })

    if "error-identification" in requires and "error" in props:
        scenarios.append({
            "name": "error-is-identified",
            "given": {"error": "Fix this before continuing."},
            "then": [
                {"text": "Fix this before continuing."},
                {"state": "invalid", "is": True, "platforms": ["web", "lit"]},
            ],
            "derived": True,
        })

    return scenarios


def merged_behavior(component: dict, derived: list[dict]) -> list[dict]:
    """Authored scenarios plus the derived ones, minus any derived scenario whose name an author already used."""
    authored = component.get("behavior") or []
    names = {sc["name"] for sc in authored}
    return list(authored) + [sc for sc in derived if sc["name"] not in names]


def behavior_for(component: dict, derived: list[dict], platform: str) -> list[dict]:
    """The merged scenario list narrowed to one platform: scenarios and `then` items whose
    `platforms` exclude it are dropped (with the now-redundant key stripped from survivors),
    and a scenario left with no applicable expectations is dropped entirely."""
    result = []
    for sc in merged_behavior(component, derived):
        scenario_platforms = sc.get("platforms")
        if scenario_platforms is not None and platform not in scenario_platforms:
            continue
        then_items = []
        for item in sc["then"]:
            item_platforms = item.get("platforms")
            if item_platforms is not None:
                if platform not in item_platforms:
                    continue
                item = {k: v for k, v in item.items() if k != "platforms"}
            then_items.append(item)
        if not then_items:
            continue
        result.append({**sc, "then": then_items})
    return result


# ---------------------------------------------------------------- extensions
# An extension doc (site/src/content/docs/extensions/<Component>.<name>.md) adds to a component's schema at parse
# time — add-only, no collisions, no locked bindings — and declares hand-written modules the generated code must
# call. See site/src/content/docs/process/extending-components.md for the contract.

EXT_SECTIONS = ("props", "events", "styles", "copy")


def extension_validator() -> Validator:
    """The extension schema $refs the component schema across files; resolve both through one registry."""
    from referencing import Registry, Resource

    comp = json.loads(SCHEMA.read_text(encoding="utf-8"))
    ext = json.loads(EXT_SCHEMA.read_text(encoding="utf-8"))
    registry = Registry().with_resources([(comp["$id"], Resource.from_contents(comp)), (ext["$id"], Resource.from_contents(ext))])
    return Validator(ext, registry=registry)


def load_extensions(validator: Validator | None = None) -> tuple[dict[str, list[dict]], list[str]]:
    """{component name: [extension records]} in file order, plus the errors of docs that did not validate.
    A record: file (repo-relative), name, extends, extension (the frontmatter block), body (prose), title."""
    by_component: dict[str, list[dict]] = {}
    errors: list[str] = []
    if not EXT_DOCS.exists():
        return by_component, errors
    validator = validator or extension_validator()
    for path in sorted(EXT_DOCS.glob("*.md")):
        rel = f"extensions/{path.name}"
        try:
            fm, body = split_frontmatter(path.read_text(encoding="utf-8"), path)
            if "extension" not in fm:
                raise DocError(f"{rel}: no `extension:` block in frontmatter")
            problems = sorted(validator.iter_errors(fm), key=lambda e: list(e.path))
            if problems:
                lines = [f"{rel}: frontmatter failed schema validation:"]
                lines += [f"  - {'.'.join(str(x) for x in e.path) or '(root)'}: {e.message}" for e in problems]
                raise DocError("\n".join(lines))
            x = fm["extension"]
            expected = f"{x['extends']}.{x['name']}.md"
            if path.name != expected:
                raise DocError(f"{rel}: file should be named {expected} (extends + name)")
            by_component.setdefault(x["extends"], []).append(
                {"file": rel, "name": x["name"], "extends": x["extends"], "extension": x, "body": body.strip(), "title": fm.get("title", path.stem)})
        except DocError as e:
            errors.append(str(e))
    return by_component, errors


def merge_extensions(c: dict, exts: list[dict]) -> list[tuple[dict, str]]:
    """Merge every extension into the component in place. Add-only: a name that upstream or an earlier extension
    already declares is an error naming the extension file. Returns the merged dict items with the file that added
    them, for stamping `source` after schema validation (the item schemas forbid unknown keys)."""
    added: list[tuple[dict, str]] = []
    owner: dict[tuple[str, str], str] = {}  # (section, key) -> who declared it
    for section in EXT_SECTIONS:
        for key in c.get(section) or {}:
            owner[(section, key)] = f"{c['name']}'s own schema"
    for sc in c.get("behavior") or []:
        owner[("behavior", sc["name"])] = f"{c['name']}'s own schema"
    module_owner: dict[str, str] = {}
    for ext in exts:
        x, file = ext["extension"], ext["file"]
        for section in EXT_SECTIONS:
            for key, value in (x.get(section) or {}).items():
                if (section, key) in owner:
                    raise DocError(f"{file}: {section}.{key} collides with {owner[(section, key)]}")
                if section == "styles" and value.get("locked"):
                    raise DocError(f"{file}: styles.{key} is locked — an extension may add only overridable bindings")
                owner[(section, key)] = file
                c.setdefault(section, {})[key] = value
                if isinstance(value, dict):
                    added.append((value, file))
        for rule in x.get("keyboard") or []:
            c.setdefault("keyboard", []).append(rule)
            added.append((rule, file))
        for sc in x.get("behavior") or []:
            if ("behavior", sc["name"]) in owner:
                raise DocError(f"{file}: behavior scenario '{sc['name']}' collides with {owner[('behavior', sc['name'])]}")
            owner[("behavior", sc["name"])] = file
            c.setdefault("behavior", []).append(sc)
            added.append((sc, file))
        for mod in x.get("modules") or {}:
            if mod in module_owner:
                raise DocError(f"{file}: module '{mod}' collides with {module_owner[mod]}")
            module_owner[mod] = file
    return added


def check_extension_locks(c: dict, added: list[tuple[dict, str]]) -> None:
    """After validate() computed `locked`: an extension binding that ended up locked (its token sits in a contrast
    pair, or it is a focus ring / target) is a claim the extension may not make."""
    for name, binding in (c.get("styles") or {}).items():
        for item, file in added:
            if item is binding and binding.get("locked"):
                raise DocError(f"{file}: styles.{name} binds '{binding['token']}', which is locked (contrast pair, focus ring or target) — an extension may add only overridable bindings")


def stamp_sources(added: list[tuple[dict, str]]) -> None:
    for item, file in added:
        item["source"] = file


def extension_summary(c: dict, exts: list[dict]) -> list[dict]:
    """What goes into generated/components.json next to the component: per extension, what it added and its modules
    (with `platforms` filled in from the component when omitted)."""
    supported = [pl for pl, n in c["platforms"].items() if n.get("supported", True)]
    out = []
    for ext in exts:
        x = ext["extension"]
        modules = {name: {**m, "platforms": list(m.get("platforms") or supported)} for name, m in (x.get("modules") or {}).items()}
        out.append({"name": ext["name"], "file": ext["file"], "title": ext["title"], "description": x.get("description", ""),
                    "adds": {sec: sorted(x[sec]) for sec in EXT_SECTIONS if x.get(sec)},
                    "keyboard": len(x.get("keyboard") or []), "behavior": [sc["name"] for sc in x.get("behavior") or []],
                    "modules": modules})
    return out


def module_import(path: str, platform: str) -> str:
    """packages/<pkg>/src/custom/analytics.ts → './custom/analytics' (Lit imports carry the .js extension)."""
    stem = re.sub(r"\.(ts|tsx)$", "", path)
    return f"./{stem}.js" if platform == "lit" else f"./{stem}"


def extensions_prose(exts: list[dict], platform: str, supported: list[str]) -> str:
    """The `## Extensions` section of a prompt: each extension's prose plus its module contracts as import + call
    instructions. Empty when no extension targets this platform."""
    parts = []
    for ext in exts:
        x = ext["extension"]
        modules = {n: m for n, m in (x.get("modules") or {}).items() if platform in (m.get("platforms") or supported)}
        block = [f"### {ext['name']} — `{ext['file']}`", "", ext["body"] or "(no prose)"]
        if modules:
            block += ["", "**Hand-written modules** — import and call them exactly as stated; never create, edit or copy anything under `src/custom/`:", ""]
            for name, m in modules.items():
                block.append(f"- `import {{ {name} }} from '{module_import(m['path'], platform)}';` — signature `{m['signature']}`. {m['wire']}")
        parts.append("\n".join(block))
    if not parts:
        return ""
    return "## Extensions\n\nThe schema above already includes what these extensions add (items marked `source: extensions/...`). Implement them like any other prop, event, binding, copy string, keyboard rule or scenario.\n\n" + "\n\n".join(parts)


def write_module_stubs(components: list[dict]) -> int:
    """generated/modules/<platform>/<path>.d.ts per declared module, from its signature. The `modules` gate
    (tools/check_modules.py) typechecks the real file against it. Stale stubs are removed."""
    stubs: dict[Path, list[str]] = {}
    for e in components:
        for ext in e.get("extensions") or []:
            for name, m in (ext.get("modules") or {}).items():
                for platform in m["platforms"]:
                    if platform not in PKG:
                        continue
                    f = OUT / "modules" / platform / re.sub(r"\.(ts|tsx)$", ".d.ts", m["path"])
                    stubs.setdefault(f, []).append(f"/** {e['component']['name']}.{ext['name']}: {m['wire']} */\nexport declare const {name}: {m['signature']};")
    for f, lines in stubs.items():
        write_if_changed(f, "// Generated by tools/parse.py from the extension docs' `modules` signatures. Do not edit.\n" + "\n".join(lines) + "\n")
    if (OUT / "modules").exists():
        for old in (OUT / "modules").rglob("*.d.ts"):
            if old not in stubs:
                old.unlink()
    return len(stubs)


def render_prompt(c: dict, sections: dict[str, str], platform: str, fm_yaml: str, extensions: list[dict] | None = None) -> str:
    template = (TEMPLATES / f"{platform}.md").read_text()
    guidance = "\n\n".join(f"## {h}\n\n{sections[h]}" for h in ALLOWED_HEADINGS if h in sections)
    if extensions:
        supported = [pl for pl, n in c["platforms"].items() if n.get("supported", True)]
        prose = extensions_prose(extensions, platform, supported)
        if prose:
            guidance = guidance + "\n\n" + prose
    scenarios = behavior_for(c, derive_behavior(c), platform)
    behavior_yaml = yaml.safe_dump(scenarios, sort_keys=False, allow_unicode=True).strip() if scenarios else "[]"
    return (
        template.replace("{{NAME}}", c["name"])
        .replace("{{PLATFORM}}", platform)
        .replace("{{SCHEMA_YAML}}", fm_yaml.strip())
        .replace("{{GUIDANCE}}", guidance)
        .replace("{{PLATFORM_NOTES}}", yaml.safe_dump(c["platforms"][platform], sort_keys=False).strip())
        .replace("{{OVERRIDABLE}}", ", ".join(f"`{k}`" for k, v in c.get("styles", {}).items() if not v.get("locked")) or "none")
        .replace("{{LOCKED}}", ", ".join(f"`{k}`" for k, v in c.get("styles", {}).items() if v.get("locked")) or "none")
        .replace("{{BEHAVIOR_COUNT}}", str(len(scenarios)))
        .replace("{{BEHAVIOR_YAML}}", behavior_yaml)
    )


def parse_themes() -> tuple[list[dict], list[str]]:
    """Theme docs → generated/themes.json + generated/prompts/theme.<id>.md (the 'feel' skill)."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from tokens import css_name, load_theme, public_name  # noqa: E402

    themes, errors = [], []
    template = (TEMPLATES / "theme.md").read_text()
    for path in sorted(THEME_DOCS.glob("*.md")):
        try:
            fm, body = split_frontmatter(path.read_text(encoding="utf-8"), path)
            if "theme" not in fm:
                continue
            t = fm["theme"]
            sections = split_sections(body, path, THEME_HEADINGS, ["Feel", "When to use"])
            try:
                light = load_theme(t["id"], "light")
            except FileNotFoundError:
                raise DocError(f"{path.name}: tokens/themes/{t['id']} missing — run tools/theme.py first")
            resolved = {public_name(p): e["$value"] for p, e in light.items() if p.startswith("color.") and "palette" not in p}
            tokens_txt = "\n".join(f"{css_name(p):<44} {v}" for p, v in resolved.items())
            guidance = "\n\n".join(f"## {h}\n\n{v}" for h, v in sections.items() if h != "Overview")
            prompt = (template.replace("{{NAME}}", fm.get("title", t["id"]))
                      .replace("{{TONE}}", ", ".join(t["tone"])).replace("{{NOT}}", t["not"])
                      .replace("{{THEME_YAML}}", yaml.safe_dump({"theme": t}, sort_keys=False).strip())
                      .replace("{{TOKENS_LIGHT}}", tokens_txt).replace("{{GUIDANCE}}", guidance))
            write_if_changed(OUT / "prompts" / f"theme.{t['id']}.md", prompt)
            themes.append({"id": t["id"], "title": fm.get("title", t["id"]), "description": fm.get("description", ""),
                           "published": t.get("status", "draft") in STATUS_PUBLISHED, "theme": t, "sections": sections,
                           "source": str(path.relative_to(ROOT))})
        except DocError as e:
            errors.append(str(e))
    write_if_changed(OUT / "themes.json", json.dumps(themes, indent=2, ensure_ascii=False) + "\n")
    return themes, errors


def main() -> int:
    validator = Validator(json.loads(SCHEMA.read_text()))
    (OUT / "prompts").mkdir(parents=True, exist_ok=True)
    components = []
    by_component, errors = load_extensions()
    seen_components: set[str] = set()
    for path in sorted(DOCS.glob("*.md")):
        try:
            text = path.read_text(encoding="utf-8")
            fm, body = split_frontmatter(text, path)
            if "component" not in fm:
                raise DocError(f"{path.name}: no `component:` block in frontmatter")
            c = fm["component"]
            seen_components.add(c.get("name", ""))
            exts = by_component.get(c.get("name", ""), [])
            added = merge_extensions(c, exts)
            validate(fm, validator, path)
            check_extension_locks(c, added)
            stamp_sources(added)
            sections = split_sections(body, path)
            entry = {
                "id": path.stem,
                "title": fm.get("title", c["name"]),
                "description": fm.get("description", ""),
                "published": c.get("status", "draft") in STATUS_PUBLISHED,
                "component": c,
                "behaviorDerived": derive_behavior(c),
                "sections": sections,
                "extensions": extension_summary(c, exts),
                "source": str(path.relative_to(ROOT)),
            }
            components.append(entry)
            fm_yaml = yaml.safe_dump({"component": c}, sort_keys=False, allow_unicode=True)
            for platform, notes in c["platforms"].items():
                if not notes.get("supported", True) or not (TEMPLATES / f"{platform}.md").exists():
                    continue
                write_if_changed(OUT / "prompts" / f"{c['name']}.{platform}.md", render_prompt(c, sections, platform, fm_yaml, exts))
        except DocError as e:
            errors.append(str(e))
    for name, exts in by_component.items():
        if name not in seen_components:
            errors += [f"{ext['file']}: extends '{name}', which has no component doc" for ext in exts]
    write_if_changed(OUT / "components.json", json.dumps(components, indent=2, ensure_ascii=False) + "\n")
    write_module_stubs(components)
    themes, theme_errors = parse_themes()
    errors += theme_errors
    for e in errors:
        print(f"✖ {e}", file=sys.stderr)
    print(f"{'✖' if errors else '✔'} {len(components)} component(s), {len(themes)} theme(s) parsed, {len(errors)} error(s) → {OUT.relative_to(ROOT)}/")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
