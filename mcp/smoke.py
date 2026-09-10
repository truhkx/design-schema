"""
Smoke test: call the MCP tool functions directly (no protocol) so the index and
lookups can be checked from a terminal before wiring the server into a client.

Usage: python3 mcp/smoke.py
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import server as s  # noqa: E402


def fn(tool):
    """FastMCP wraps decorated functions; get the callable back in either shape."""
    return getattr(tool, "fn", tool)


def show(title: str, rows):
    print(f"\n=== {title}")
    for r in rows:
        print(f"  {r['score']:.3f}  [{r['platform']:<4}] {r['component'] or r['theme'] or '-':<8} {r['section']:<20} {r['text'][:90].replace(chr(10), ' ')}")


search, lookup, get_component, get_tokens, check_contrast, list_components = (
    fn(s.search_guidance), fn(s.lookup_code), fn(s.get_component), fn(s.get_tokens), fn(s.check_contrast), fn(s.list_components))

print("components:", [c["name"] for c in list_components()])
show("how do I show a validation error on a form field?  (platform=rn)", search("how do I show a validation error on a form field", platform="rn", limit=5))
show("how do I announce a form error to screen readers?  (platform=rn)", search("announce the form error to screen readers", platform="rn", limit=4))
show("same query, platform=lit", search("announce the form error to screen readers", platform="lit", limit=4))
show("which heading level should I use / can I skip levels", search("can I skip heading levels", limit=4))
show("what is the theme's attitude to animation", search("how should motion and animation behave in this design system", limit=4))
show("code search: focus ring implementation (kinds=code, platform=web)", search("focus ring outline on focus-visible", platform="web", kinds=["code"], limit=3))

code = lookup("Button", "rn", include=["source", "notes", "tokens"])
print("\n=== lookup_code Button/rn")
print("  files:", list(code["files"]))
print("  events:", code["events"])
print("  bindings sample:", dict(list(code["tokenBindings"].items())[:3]))
print("  notes:", code["platformNotes"][:160].replace("\n", " "), "...")

comp = get_component("Input", platform="lit")
print("\n=== get_component Input/lit -> events on platform:", {k: v.get("nameOnPlatform") for k, v in comp["schema"]["events"].items()})

tk = get_tokens("calm-precise", "dark", "rn", group="color.action.primary")
print("\n=== get_tokens calm-precise/dark/rn color.action.primary:", {k: v["value"] for k, v in tk["tokens"].items()})

print("\n=== check_contrast color.foreground.muted on color.background (AA):", check_contrast("color.foreground.muted", "color.background"))

get_keyboard_model, get_layout_rules, list_gaps, start_theme, write_theme = (
    fn(s.get_keyboard_model), fn(s.get_layout_rules), fn(s.list_gaps), fn(s.start_theme), fn(s.write_theme))

kb = get_keyboard_model("Dialog")
print("\n=== get_keyboard_model Dialog:", kb["autoTested"], "auto-tested,", kb["manual"], "manual")
for r in kb["rules"][:4]:
    print(f"  {'/'.join(r['keys']):<10} from={r['from']:<8} expect={r['expect']:<22} {r['action'][:60]}")
assert all("from" in r and "expect" in r for r in kb["rules"])
print("  no-keyboard component note:", get_keyboard_model("Text")["note"][:60], "...")

lay = get_layout_rules("calm-precise", "light")
print("\n=== get_layout_rules calm-precise/light:", len(lay["tokens"]), "tokens; rules:", lay["rules"][:80].replace("\n", " "), "...")
print("  gap:", {k.split(".")[-1]: v["value"] for k, v in lay["tokens"].items() if k.startswith("layout.gap.")})
assert "layout.maxWidth.page" in lay["tokens"] and lay["rules"]

gaps = list_gaps()
print("\n=== list_gaps: ", len(gaps), "file(s);", sum(g["total"] for g in gaps), "gap(s)")
for g in gaps[:3]:
    latest = g["rounds"][0] if g["rounds"] else None
    print(f"  {g['component']:<12} {g['platform'] or '-':<4} rounds={len(g['rounds'])} latest={latest['gaps'][0][:70] if latest and latest['gaps'] else '-'}")
if gaps:
    one = list_gaps(gaps[0]["component"])
    assert one and all(g["component"] == gaps[0]["component"] for g in one)

st = start_theme()
print("\n=== start_theme:", len(st["questions"]), "questions; required:", st["required"])
for q in st["questions"]:
    print(f"  {q['id']:<7} {', '.join(q['fields'])}")
assert st["questions"][0]["allowed"]["tone"]["minItems"] == 2
assert st["questions"][3]["allowed"]["radius"]["enum"] == ["none", "sm", "md", "lg", "full"]

bad = write_theme("smoke-test-theme", {"tone": ["one"], "not": "x", "seed": {"color": "#12345"}, "scale": {"base": 16, "ratio": 1.2},
                                        "radius": "md", "density": "comfortable", "modes": {"default": "light", "supports": ["light"]}})
print("\n=== write_theme with invalid answers -> ok:", bad["ok"], "| errors:", len(bad["errors"]))
assert bad["ok"] is False and bad["written"] is None and not (s.THEME_DOCS / "smoke-test-theme.md").exists()

import tempfile
real_docs = s.THEME_DOCS
s.THEME_DOCS = Path(tempfile.mkdtemp(prefix="ds-smoke-themes-"))  # the happy path writes somewhere disposable
try:
    good = write_theme("smoke-test-theme", {
        "title": "Smoke test", "tone": ["warm", "sleek"], "not": "cold",
        "seed": {"color": "#C89A5C", "typeface": "Google Sans"}, "neutralTint": 0.35,
        "scale": {"base": 16, "ratio": 1.25}, "radius": "md", "density": "comfortable",
        "motion": "expressive", "elevation": "pronounced", "layout": {"rhythm": "normal", "contentWidth": 1040},
        "modes": {"default": "light", "supports": ["light", "dark"]},
        "feel": "Cream surfaces and a pale-oak accent.", "whenToUse": "Consumer products."})
    print("\n=== write_theme valid answers ->", "ok" if good["ok"] else "FAILED", "| wrote:", Path(good["written"]).name,
          "| theme.py:", (good["themeOutput"].splitlines() or ["-"])[-1][:70], "| errors:", good["errors"])
    text = (s.THEME_DOCS / "smoke-test-theme.md").read_text(encoding="utf-8")
    assert text.startswith("---\ntitle: Smoke test") and "## Not cold" in text and "### React Native" in text
    again = write_theme("smoke-test-theme", {"tone": ["a", "b"]})
    assert again["ok"] is False, "an existing doc is not overwritten without overwrite=true"
finally:
    s.THEME_DOCS = real_docs

print("\nOK")
