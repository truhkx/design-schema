"""
Design Schema MCP server (FastMCP).

Serves the design system to AI clients: semantic search over guidance filtered by
platform, exact lookups of component schemas and generated code, theme "feel"
skills, resolved tokens, and a contrast check. Everything comes from build outputs
(generated/, packages/, tokens/) so the server can never disagree with the docs.

Run (stdio):   python3 mcp/server.py
Index first:   python3 mcp/index.py

Claude Code:   claude mcp add design-schema -- python3 /abs/path/mcp/server.py
Claude Desktop / Cursor: see the "MCP server" page on the docs site for the JSON config.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Literal

from fastmcp import FastMCP

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "mcp"))
from oklch import contrast as _contrast  # noqa: E402
from tokens import load_theme, modes as theme_modes, public_name, themes as theme_ids, css_name, camel_name  # noqa: E402
import index as indexer  # noqa: E402

GENERATED = ROOT / "generated"
PACKAGES = ROOT / "packages"
CALL_LOG = ROOT / "logs" / "mcp-calls.jsonl"  # every tool call, for dogfooding: which tools, what args, how big the answer


def _log(tool: str, args: dict, result: object) -> None:
    try:
        import datetime
        CALL_LOG.parent.mkdir(exist_ok=True)
        size = len(json.dumps(result, default=str)) if result is not None else 0
        with CALL_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps({"t": datetime.datetime.now().isoformat(timespec="seconds"), "tool": tool,
                                "args": {k: v for k, v in args.items() if v is not None}, "resultChars": size}) + "\n")
    except Exception:
        pass
Platform = Literal["web", "lit", "rn", "swiftui", "compose"]
PLATFORM_PKG = {"web": "react", "lit": "lit", "rn": "rn"}
PLATFORM_LABEL = {"web": "React (web)", "lit": "Lit web components", "rn": "React Native", "swiftui": "SwiftUI", "compose": "Jetpack Compose"}

mcp = FastMCP(
    "design-schema",
    instructions=(
        "Design Schema is a documentation-first, cross-platform design system. Start with get_theme_skill for the "
        "system's feel, use search_guidance (with your platform) for how/when to use components, get_component for "
        "the exact schema, and lookup_code for generated reference implementations on your platform. Never invent "
        "colors, sizes, or copy — use tokens from get_tokens and copy templates from the component schema. "
        "get_keyboard_model gives the keys a component must handle, get_layout_rules the spacing between components, "
        "list_gaps what the docs left ambiguous. To author a theme, start_theme then write_theme."
    ),
)


# ---------- data access ----------

def _components() -> dict[str, dict]:
    return {e["component"]["name"]: e for e in json.loads((GENERATED / "components.json").read_text(encoding="utf-8"))}


def _themes() -> dict[str, dict]:
    f = GENERATED / "themes.json"
    return {e["theme"]["id"]: e for e in json.loads(f.read_text(encoding="utf-8"))} if f.exists() else {}


def _collection():
    import chromadb

    if not indexer.DB_PATH.exists():
        raise RuntimeError("Index not built. Run: python3 mcp/index.py")
    return chromadb.PersistentClient(path=str(indexer.DB_PATH)).get_collection(indexer.COLLECTION)


def _find_component(name: str) -> dict:
    comps = _components()
    for key in comps:
        if key.lower() == name.lower():
            return comps[key]
    raise ValueError(f"Unknown component '{name}'. Known: {', '.join(sorted(comps))}")


# ---------- tools ----------

def _logged(fn):
    import functools, inspect

    sig = inspect.signature(fn)

    @functools.wraps(fn)
    def wrapper(*a, **kw):
        bound = sig.bind_partial(*a, **kw)
        result = fn(*a, **kw)
        _log(fn.__name__, dict(bound.arguments), result)
        return result

    return wrapper


@mcp.tool
@_logged
def search_guidance(
    query: str,
    platform: Platform | None = None,
    component: str | None = None,
    kinds: list[Literal["guidance", "schema", "platform-mapping", "theme", "code", "story", "demo", "prompt"]] | None = None,
    limit: int = 8,
) -> list[dict]:
    """Semantic search over the design system's guidance, schemas, themes and generated code.

    `platform` narrows results to platform-agnostic content plus the notes/code for that platform
    (so a React Native developer never gets Lit-only advice). `kinds` defaults to guidance, schema,
    platform-mapping and theme — pass ["code", "story"] to search implementations instead.
    Returns ranked chunks with text, metadata and a relevance score (1 = identical).
    """
    col = _collection()
    kinds = kinds or ["guidance", "schema", "platform-mapping", "theme"]
    clauses: list[dict] = [{"kind": {"$in": kinds}}]
    if platform:
        clauses.append({"platform": {"$in": ["all", platform]}})
    if component:
        clauses.append({"component": _find_component(component)["component"]["name"]})
    where = clauses[0] if len(clauses) == 1 else {"$and": clauses}
    n = max(1, min(limit, 25))
    res = col.query(query_texts=[query], n_results=n * 2, where=where, include=["documents", "metadatas", "distances"])
    out, seen = [], set()
    for cid, doc, meta, dist in zip(res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0]):
        # A section and one of its paragraphs can both match; keep whichever ranked first.
        parent = cid.split("#")[0]
        if parent in seen:
            continue
        seen.add(parent)
        out.append({"score": round(1 - dist, 3), "component": meta.get("component") or None, "theme": meta.get("theme") or None,
                    "platform": meta["platform"], "section": meta["section"], "kind": meta["kind"],
                    "granularity": meta.get("granularity", "section"), "source": meta["path"], "text": doc})
        if len(out) >= n:
            break
    return out


@mcp.tool
@_logged
def list_components(platform: Platform | None = None, status: Literal["draft", "review", "stable", "deprecated"] | None = None) -> list[dict]:
    """List components with category, status, APG pattern, and the platforms each supports."""
    out = []
    for name, e in sorted(_components().items()):
        c = e["component"]
        supported = [p for p, n in c["platforms"].items() if n.get("supported", True)]
        if platform and platform not in supported:
            continue
        if status and c.get("status", "draft") != status:
            continue
        out.append({"name": name, "category": c["category"], "status": c.get("status", "draft"), "apg": c.get("apg"),
                    "description": e["description"], "platforms": supported})
    return out


@mcp.tool
@_logged
def get_component(name: str, platform: Platform | None = None) -> dict:
    """Full schema and guidance for one component. With `platform`, only that platform's mapping and
    notes are included and props/events are annotated with their name on that platform. `behavior` is the
    full scenario list (authored + parser-derived) that the component's tests render, narrowed to the platform."""
    e = _find_component(name)
    c = json.loads(json.dumps(e["component"]))
    sections = dict(e["sections"])
    if platform:
        c["platforms"] = {platform: c["platforms"].get(platform, {"supported": False, "notes": "Not mapped for this platform."})}
        for ev in c.get("events", {}).values():
            ev["nameOnPlatform"] = ev["platforms"].get(platform)
        for prop_name, p in list(c["props"].items()):
            if p.get("platforms") and platform not in p["platforms"]:
                p["availableOnPlatform"] = False
        notes = indexer.split_platform_notes(sections.get("Platform notes", ""))
        sections["Platform notes"] = notes.get(platform, "")
    behavior = list(c.get("behavior") or []) + list(e.get("behaviorDerived") or [])
    if platform:
        behavior = [sc for sc in behavior if not sc.get("platforms") or platform in sc["platforms"]]
    return {"name": c["name"], "title": e["title"], "description": e["description"], "status": c.get("status", "draft"),
            "schema": c, "behavior": behavior, "guidance": sections, "source": e["source"]}


@mcp.tool
@_logged
def lookup_code(component: str, platform: Platform, include: list[Literal["source", "styles", "stories", "prompt", "notes", "tokens"]] | None = None) -> dict:
    """Everything needed to implement or use a component on one platform: the generated reference
    source (and its CSS on web), stories, the platform notes, the exact generation prompt, and the
    token names the component's style bindings resolve to on that platform.

    Use this when writing code. The source is the reference implementation produced from the docs;
    match its props, events, accessibility attributes and token usage.
    """
    e = _find_component(component)
    c = e["component"]
    name = c["name"]
    include = include or ["source", "styles", "stories", "notes", "tokens"]
    result: dict = {"component": name, "platform": platform, "platformLabel": PLATFORM_LABEL[platform],
                    "supported": c["platforms"].get(platform, {}).get("supported", platform in c["platforms"])}
    pkg = PLATFORM_PKG.get(platform)
    files: dict[str, str] = {}
    if pkg:
        src = PACKAGES / pkg / "src"
        candidates = {
            "source": [src / f"{name}.tsx", src / f"{name}.ts"],
            "styles": [src / f"{name}.css"],
            "stories": [src / f"{name}.stories.tsx", src / f"{name}.stories.ts"],
        }
        for key, paths in candidates.items():
            if key in include:
                for p in paths:
                    if p.exists():
                        files[str(p.relative_to(ROOT))] = p.read_text(encoding="utf-8")
    result["files"] = files
    if "notes" in include:
        result["platformMapping"] = c["platforms"].get(platform, {})
        result["platformNotes"] = indexer.split_platform_notes(e["sections"].get("Platform notes", "")).get(platform, "")
        result["events"] = {ev: spec["platforms"].get(platform) for ev, spec in c.get("events", {}).items()}
        result["copy"] = c.get("copy", {})
    if "prompt" in include:
        p = GENERATED / "prompts" / f"{name}.{platform}.md"
        result["generationPrompt"] = p.read_text(encoding="utf-8") if p.exists() else None
    if "tokens" in include:
        import re as _re

        bindings = {}
        for prop, b in c.get("styles", {}).items():
            path = b["token"]
            # Keep {slot} placeholders visible in the platform name so the caller knows to interpolate.
            marker = _re.sub(r"\{([a-zA-Z]+)\}", lambda m: f"zz{m.group(1)}zz", path)
            if platform == "rn":
                name = _re.sub(r"Zz([a-zA-Z]+)zz", lambda m: "{" + m.group(1).capitalize() + "}", camel_name(marker))
            else:
                name = "var(" + _re.sub(r"zz([a-zA-Z]+)zz", lambda m: "{" + m.group(1) + "}", css_name(marker)) + ")"
            bindings[prop] = {"token": path, "name": name, "description": b.get("description")}
        result["tokenBindings"] = bindings
        result["tokenNote"] = ("{slot} placeholders take the value of that enum prop, e.g. for variant=primary: "
                               "var(--color-action-{variant}-background) → var(--color-action-primary-background); "
                               "colorAction{Variant}Background → colorActionPrimaryBackground.")
    return result


@mcp.tool
@_logged
def list_themes() -> list[dict]:
    """Themes available in the system with their tone, excluded word, and modes."""
    return [{"id": tid, "title": e["title"], "description": e["description"], "tone": e["theme"]["tone"], "not": e["theme"]["not"],
             "modes": e["theme"]["modes"], "status": e["theme"].get("status", "draft")} for tid, e in _themes().items()]


@mcp.tool
@_logged
def get_theme_skill(theme: str = "calm-precise") -> str:
    """The theme's "feel" skill: identity, the decisions it is derived from, the resolved semantic
    tokens, and the guidance on how to make design decisions in its spirit. Read this before
    designing or generating anything for the theme."""
    p = GENERATED / "prompts" / f"theme.{theme}.md"
    if not p.exists():
        raise ValueError(f"Unknown theme '{theme}'. Known: {', '.join(theme_ids())}")
    return p.read_text(encoding="utf-8")


@mcp.tool
@_logged
def get_tokens(theme: str = "calm-precise", mode: Literal["light", "dark"] = "light", platform: Platform = "web", group: str | None = None) -> dict:
    """Resolved design tokens for a theme and mode, named for the target platform (CSS custom
    properties for web/lit, camelCase keys with numeric dimensions for rn). `group` filters by
    prefix, e.g. "color.action" or "space"."""
    if theme not in theme_ids():
        raise ValueError(f"Unknown theme '{theme}'. Known: {', '.join(theme_ids())}")
    if mode not in theme_modes(theme):
        raise ValueError(f"Theme '{theme}' has no '{mode}' mode.")
    out = {}
    for path, entry in load_theme(theme, mode).items():
        pub = public_name(path)
        if group and not pub.startswith(group):
            continue
        v = entry["$value"]
        if platform == "rn":
            key = camel_name(path)
            if entry["$type"] == "dimension" and isinstance(v, str) and v.endswith("px"):
                v = float(v[:-2]) if "." in v[:-2] else int(v[:-2])
            elif isinstance(v, list) and entry["$type"] == "fontFamily":
                v = {"system-ui": "System", "ui-monospace": "monospace"}.get(v[0], v[0])
        else:
            key = css_name(path)
            if isinstance(v, list) and entry["$type"] == "fontFamily":
                v = ", ".join(f'"{f}"' if " " in f else f for f in v)
            elif entry["$type"] == "cubicBezier":
                v = f"cubic-bezier({', '.join(str(x) for x in v)})"
        out[key] = {"path": pub, "value": v, "type": entry["$type"]}
    return {"theme": theme, "mode": mode, "platform": platform, "count": len(out), "tokens": out}


@mcp.tool
@_logged
def check_contrast(foreground: str, background: str, level: Literal["AA", "AAA"] = "AA", large_text: bool = False,
                   theme: str = "calm-precise", mode: Literal["light", "dark"] = "light") -> dict:
    """WCAG 2.2 contrast check. Arguments may be hex colors or token paths (e.g. color.foreground.muted);
    token paths resolve through the given theme and mode. Returns the ratio and pass/fail."""
    tokens = {public_name(p): e["$value"] for p, e in load_theme(theme, mode).items()} if theme in theme_ids() else {}

    def resolve(v: str) -> str:
        if v.startswith("#"):
            return v
        if v in tokens and isinstance(tokens[v], str) and tokens[v].startswith("#"):
            return tokens[v]
        if v == "transparent" or tokens.get(v) == "transparent":
            return tokens["color.background"]
        raise ValueError(f"'{v}' is neither a hex color nor a known color token in {theme}/{mode}")

    fg, bg = resolve(foreground), resolve(background)
    need = {("AA", False): 4.5, ("AA", True): 3.0, ("AAA", False): 7.0, ("AAA", True): 4.5}[(level, large_text)]
    ratio = _contrast(fg, bg)
    return {"foreground": fg, "background": bg, "ratio": round(ratio, 2), "required": need, "level": level, "largeText": large_text, "passes": ratio >= need}


@mcp.tool
@_logged
def get_generation_prompt(component: str, platform: Platform) -> str:
    """The self-contained prompt used to generate a component for a platform (rules + schema + guidance).
    Run it to (re)generate the component, or read it to understand exactly what the implementation must do."""
    name = _find_component(component)["component"]["name"]
    p = GENERATED / "prompts" / f"{name}.{platform}.md"
    if not p.exists():
        raise ValueError(f"No generation prompt for {name} on {platform}.")
    return p.read_text(encoding="utf-8")


# ---------- keyboard, layout, gaps ----------

def _rel(path: Path) -> str:
    """Repo-relative, forward-slash path for results; absolute when the path lives outside the repo."""
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


KEYBOARD_DEFAULTS = {"from": "inside", "expect": "manual"}


@mcp.tool
@_logged
def get_keyboard_model(component: str) -> dict:
    """The component's keyboard model: every rule from its `keyboard` block with `from` (where focus is
    before the key: trigger | first | last | inside | any) and `expect` (what the keyboard gate asserts
    after it: closes, opens, focus-next, …, or manual when it is documented but not auto-tested) filled
    in with their defaults, plus the APG pattern and the a11y requirements the rules imply."""
    e = _find_component(component)
    c = e["component"]
    rules = [{**KEYBOARD_DEFAULTS, **r} for r in (c.get("keyboard") or [])]
    return {"component": c["name"], "apg": c.get("apg"), "role": c["a11y"]["role"],
            "requires": [r for r in c["a11y"]["requires"] if r in ("keyboard-operable", "escape-dismiss", "arrow-navigation",
                                                                     "roving-tabindex", "focus-trap", "focus-restore")],
            "rules": rules, "autoTested": sum(len(r["keys"]) for r in rules if r["expect"] != "manual"),
            "manual": sum(len(r["keys"]) for r in rules if r["expect"] == "manual"),
            "note": None if rules else "This component declares no keyboard block; it is not keyboard-interactive or its rules are not yet documented."}


def _sections(md: str) -> dict[str, str]:
    """Body of a doc split on `## ` headings; text before the first heading is 'Overview'."""
    out, current, buf = {}, "Overview", []
    body = md.split("\n---\n", 2)[-1] if md.startswith("---") else md
    for line in body.splitlines():
        if line.startswith("## "):
            out[current] = "\n".join(buf).strip()
            current, buf = line[3:].strip(), []
        else:
            buf.append(line)
    out[current] = "\n".join(buf).strip()
    return {k: v for k, v in out.items() if v}


@mcp.tool
@_logged
def get_layout_rules(theme: str = "calm-precise", mode: Literal["light", "dark"] = "light") -> dict:
    """The between-component spacing system: every `layout.*` token (gutter, section, gap, inset, maxWidth)
    resolved for a theme and mode, named for CSS and React Native, plus the rules for using them from the
    Layout and rhythm foundations page (siblings are spaced by their parent, choose gap by relationship,
    surfaces inset / layouts gap, pages have a gutter and a measure, sections not dividers)."""
    if theme not in theme_ids():
        raise ValueError(f"Unknown theme '{theme}'. Known: {', '.join(theme_ids())}")
    if mode not in theme_modes(theme):
        raise ValueError(f"Theme '{theme}' has no '{mode}' mode.")
    tokens = {}
    for path, entry in load_theme(theme, mode).items():
        pub = public_name(path)
        if pub.startswith("layout."):
            tokens[pub] = {"value": entry["$value"], "css": f"var({css_name(path)})", "rn": camel_name(path)}
    doc = ROOT / "site" / "src" / "content" / "docs" / "foundations" / "layout.md"
    sections = _sections(doc.read_text(encoding="utf-8")) if doc.exists() else {}
    return {"theme": theme, "mode": mode, "tokens": tokens, "rules": sections.get("The rules", ""), "sections": sections,
            "source": _rel(doc) if doc.exists() else None}


@mcp.tool
@_logged
def list_gaps(component: str | None = None) -> list[dict]:
    """What the docs left the generator to guess. Every generation run records its gaps in
    generated/gaps/<Name>.<platform>.md; this returns them per component and platform, newest round
    first, so a client can see which parts of a doc are ambiguous before relying on them (and fix the
    doc rather than the code). Without `component`, every component that has gaps."""
    import re as _re

    gaps_dir = GENERATED / "gaps"
    if not gaps_dir.exists():
        return []
    want = _find_component(component)["component"]["name"].lower() if component else None
    out = []
    for f in sorted(gaps_dir.glob("*.md")):
        name, platform = f.stem.rsplit(".", 1) if "." in f.stem else (f.stem, None)
        if want and name.lower() != want:
            continue
        rounds = []
        for m in _re.finditer(r"^## (.+?) — round (\d+)\s*\n(.*?)(?=^## |\Z)", f.read_text(encoding="utf-8"), _re.M | _re.S):
            items = [ln[2:].strip() for ln in m.group(3).splitlines() if ln.startswith("- ")]
            rounds.append({"when": m.group(1).strip(), "round": int(m.group(2)), "gaps": items})
        rounds.sort(key=lambda r: (r["when"], r["round"]), reverse=True)
        out.append({"component": name, "platform": platform, "rounds": rounds,
                    "total": sum(len(r["gaps"]) for r in rounds), "source": _rel(f)})
    return out


# ---------- theme authoring ----------

THEME_DOCS = ROOT / "site" / "src" / "content" / "docs" / "themes"
THEME_SCHEMA = ROOT / "schema" / "theme.schema.json"
PROCESS_DOC = ROOT / "site" / "src" / "content" / "docs" / "process" / "from-vision-to-system.md"

# The five interview questions, in the order of leverage the process doc gives them, each naming the
# theme frontmatter fields it fills in. Allowed values come from the schema at call time.
THEME_QUESTIONS = [
    {"id": "tone", "fields": ["tone", "not"],
     "question": "Two to five adjectives for how the product should feel, and the one word it must never be (the tiebreaker for every borderline decision)."},
    {"id": "seed", "fields": ["seed.color", "neutralTint", "statusHues"],
     "question": "One brand color as a hex value; every ramp is derived from it. How much of its hue should bleed into the grays (neutralTint, 0–1)?"},
    {"id": "type", "fields": ["seed.typeface", "seed.headingTypeface", "seed.mono"],
     "question": "Body typeface ('system' for each platform's own face, or a family name), an optional heading face, and the monospace family."},
    {"id": "shape", "fields": ["scale.base", "scale.ratio", "radius", "density"],
     "question": "Type scale (body size and modular ratio: 1.2 dense/technical, 1.25 balanced, 1.333 editorial), corner radius preset, and spacing density."},
    {"id": "rhythm", "fields": ["motion", "elevation", "layout.rhythm", "layout.contentWidth", "modes"],
     "question": "Motion (none/subtle/expressive), elevation (flat/subtle/pronounced), layout rhythm between sections (tight/normal/loose) with a content width, and which of light/dark to support and which is the default."},
]


def _theme_schema() -> dict:
    return json.loads(THEME_SCHEMA.read_text(encoding="utf-8"))


def _field_spec(schema: dict, path: str) -> dict:
    """Allowed values for a dotted frontmatter path, read from the JSON Schema."""
    node = schema["$defs"]["themeDef"]
    for part in path.split("."):
        node = node.get("properties", {}).get(part)
        if node is None:
            return {}
        if "$ref" in node:
            node = schema["$defs"][node["$ref"].split("/")[-1]]
    spec = {k: node[k] for k in ("type", "enum", "minimum", "maximum", "default", "pattern", "description", "minItems", "maxItems") if k in node}
    if "items" in node and "$ref" in node["items"]:
        spec["items"] = schema["$defs"][node["items"]["$ref"].split("/")[-1]].get("enum")
    if "properties" in node and "enum" not in spec:
        spec["fields"] = {k: _field_spec_at(schema, v) for k, v in node["properties"].items()}
    return spec


def _field_spec_at(schema: dict, node: dict) -> dict:
    if "$ref" in node:
        node = schema["$defs"][node["$ref"].split("/")[-1]]
    return {k: node[k] for k in ("type", "enum", "minimum", "maximum", "default", "pattern", "description") if k in node}


@mcp.tool
@_logged
def start_theme() -> dict:
    """Begin authoring a theme: the five interview questions from the process doc (tone + excluded word,
    seed color, typeface, scale/radius/density, motion/elevation/layout rhythm/modes), each with the
    frontmatter fields it fills and the allowed values from schema/theme.schema.json. Ask them one at a
    time, then call write_theme with the answers. The reference example is the calm-precise theme doc."""
    schema = _theme_schema()
    questions = []
    for q in THEME_QUESTIONS:
        questions.append({**q, "allowed": {f: _field_spec(schema, f) for f in q["fields"]}})
    stage = ""
    if PROCESS_DOC.exists():
        stage = _sections(PROCESS_DOC.read_text(encoding="utf-8")).get("Stage 1 — The theme doc (the first interaction)", "")
    example = THEME_DOCS / "calm-precise.md"
    return {"questions": questions, "required": schema["$defs"]["themeDef"]["required"], "process": stage,
            "example": example.read_text(encoding="utf-8") if example.exists() else None,
            "bodySections": ["Feel", "Not <word>", "References", "When to use", "When not to use", "Accessibility", "Platform notes"],
            "next": "write_theme(id, answers) with answers = { title, description, tone, not, seed, neutralTint, scale, radius, density, motion, elevation, layout, modes, feel, notFeel?, references?, whenToUse, whenNotToUse?, accessibility?, platformNotes? }"}


def _theme_body(t: dict, a: dict) -> str:
    """The prose half of the theme doc in the calm-precise shape; sections the answers leave out get a
    truthful default that names the decisions rather than inventing a feel."""
    tone = ", ".join(t["tone"])
    not_word = t["not"]
    pid = t["id"]
    feel = a.get("feel") or f"{tone}. Surfaces, accent, corners ({t['radius']} radius), type ({t['seed'].get('typeface', 'system')} at a {t['scale']['ratio']} scale) and {t.get('motion', 'subtle')} motion all follow from the decisions in the frontmatter."
    not_feel = a.get("notFeel") or f"When a decision is borderline, this is the tiebreaker: if a choice would make the interface read as {not_word}, make the other choice."
    references = a.get("references") or "Not yet recorded."
    when = a.get("whenToUse") or f"Choose this theme when the product should feel {tone}."
    when_not = a.get("whenNotToUse") or f"Do not use it where the product needs to feel {not_word}; pick or author another theme."
    a11y = a.get("accessibility") or ("Every supported mode is derived to meet WCAG 2.2 AA on every action variant and AAA on headings against the page background; the build proves it with tools/check_contrast.py. "
                                      "The focus ring is the accent at 2px, visible on every surface. The 24px minimum target is enforced in every component; the 44px comfortable target is used on touch platforms.")
    notes = a.get("platformNotes") or {}
    web = notes.get("web") or f"Apply the theme with `data-theme=\"{pid}\"` and switch modes with `data-mode=\"dark\"` on the root element."
    lit = notes.get("lit") or "Token custom properties inherit through shadow roots, so the same root attributes theme every custom element without extra wiring."
    rn = notes.get("rn") or f"Import `packages/tokens/dist/{pid}/rn/tokens.light.js` or `.dark.js` and select with the `useColorScheme` hook."
    overview = a.get("overview") or f"{a.get('title', pid)} is {tone} and never {not_word}."
    return f"""
{overview}

## Feel

{feel}

## Not {not_word}

{not_feel}

## References

{references}

## When to use

{when}

## When not to use

{when_not}

## Accessibility

{a11y}

## Platform notes

### Web
{web}

### Lit
{lit}

### React Native
{rn}
"""


@mcp.tool
@_logged
def write_theme(id: str, answers: dict, overwrite: bool = False) -> dict:
    """Write site/src/content/docs/themes/<id>.md from interview answers in the calm-precise shape, validate the
    frontmatter against schema/theme.schema.json, run tools/theme.py to derive the tokens for every mode, and
    return what happened. `answers` carries the frontmatter decisions (tone, not, seed, neutralTint, scale,
    radius, density, motion, elevation, layout, modes, statusHues?, overrides?) plus prose (title, description,
    feel, notFeel, references, whenToUse, whenNotToUse, accessibility, platformNotes {web, lit, rn}).
    Nothing is written when validation fails; an existing doc is kept unless `overwrite` is true. Derivation
    errors and contrast problems are returned, not fixed: the caller decides which decision to change."""
    import re as _re
    import subprocess
    import yaml

    if not _re.fullmatch(r"[a-z][a-z0-9-]*", id):
        raise ValueError("id must be kebab-case: lowercase letters, digits and hyphens, starting with a letter")
    keys = ("status", "tone", "not", "seed", "neutralTint", "scale", "radius", "density", "motion", "elevation", "layout", "modes", "statusHues", "overrides")
    t = {"id": id, "status": answers.get("status", "draft"), **{k: answers[k] for k in keys if k in answers and k != "status"}}
    try:
        from jsonschema import Draft202012Validator as _V
    except ImportError:  # older jsonschema
        from jsonschema import Draft7Validator as _V
    problems = [f"{'.'.join(str(x) for x in e.path) or '(root)'}: {e.message}"
                for e in sorted(_V(_theme_schema()).iter_errors({"theme": t}), key=lambda e: list(e.path))]
    if problems:
        return {"ok": False, "written": None, "errors": problems, "hint": "Fix the answers; nothing was written."}
    path = THEME_DOCS / f"{id}.md"
    if path.exists() and not overwrite:
        return {"ok": False, "written": None, "errors": [f"{_rel(path)} exists; pass overwrite=true to replace it"]}
    title = answers.get("title") or id.replace("-", " ").capitalize()
    description = answers.get("description") or f"{', '.join(t['tone'])}; never {t['not']}."
    front = yaml.safe_dump({"title": title, "description": description, "theme": t}, sort_keys=False, allow_unicode=True, width=1000)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("---\n" + front + "---\n" + _theme_body(t, {**answers, "title": title}), encoding="utf-8")
    env = {"PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
    import os
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "theme.py")], cwd=ROOT, capture_output=True, text=True,
                         encoding="utf-8", errors="replace", env={**os.environ, **env})
    errors = [ln.strip() for ln in (run.stderr or "").splitlines() if ln.strip()]
    result = {"ok": run.returncode == 0, "written": _rel(path), "themeOutput": (run.stdout or "").strip(), "errors": errors,
              "tokens": _rel(ROOT / "tokens" / "themes" / id) if (ROOT / "tokens" / "themes" / id).exists() else None}
    if run.returncode == 0:
        check = subprocess.run([sys.executable, str(ROOT / "tools" / "check_contrast.py")], cwd=ROOT, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", env={**os.environ, **env})
        failures = [ln.strip() for ln in (check.stdout or "").splitlines() if ln.strip().startswith("✖") and id in ln]
        result["contrast"] = {"ok": check.returncode == 0 and not failures, "failures": failures,
                              "summary": ((check.stdout or "").strip().splitlines() or [""])[-1]}
        result["next"] = ("Contrast failures name a token pair; change the seed's lightness or an override rather than the component. "
                          "Then run tools/parse.ts so generated/prompts/theme.<id>.md exists and get_theme_skill can serve it.")
    return result


# ---------- resources ----------

@mcp.resource("design-schema://components")
def components_resource() -> str:
    return json.dumps(list_components(), indent=2)


@mcp.resource("design-schema://components/{name}")
def component_resource(name: str) -> str:
    return json.dumps(get_component(name), indent=2)


@mcp.resource("design-schema://themes/{theme}/skill")
def theme_skill_resource(theme: str) -> str:
    return get_theme_skill(theme)


@mcp.resource("design-schema://components/{name}/keyboard")
def keyboard_resource(name: str) -> str:
    return json.dumps(get_keyboard_model(name), indent=2)


@mcp.resource("design-schema://schema/component")
def component_schema_resource() -> str:
    return (ROOT / "schema" / "component.schema.json").read_text(encoding="utf-8")


if __name__ == "__main__":
    mcp.run()
