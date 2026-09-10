"""Shared fixtures. Puts tools/ and mcp/ on sys.path so the modules import the
same way they do when run as scripts (both use sys.path.insert on themselves)."""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
for d in (ROOT / "tools", ROOT / "mcp"):
    if str(d) not in sys.path:
        sys.path.insert(0, str(d))


@pytest.fixture(scope="session")
def root() -> Path:
    return ROOT


@pytest.fixture(scope="session")
def component_schema() -> dict:
    return json.loads((ROOT / "schema" / "component.schema.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def theme_schema() -> dict:
    return json.loads((ROOT / "schema" / "theme.schema.json").read_text(encoding="utf-8"))


# A component that passes schema/component.schema.json and tools/parse.py's extra
# rules. Tests break one rule at a time from this baseline.
VALID_COMPONENT = {
    "name": "Widget",
    "category": "action",
    "status": "review",
    "anatomy": ["container", "label"],
    "props": {
        "label": {"type": "string", "required": True, "description": "Visible text."},
        "variant": {"type": "enum", "values": ["primary", "danger"], "default": "primary",
                    "description": "Visual emphasis."},
        "size": {"type": "enum", "values": ["sm", "md"], "default": "md", "description": "Padding scale."},
    },
    "events": {
        "onPress": {"description": "Activated.", "platforms": {"web": "onClick", "rn": "onPress"}},
    },
    "styles": {
        "background": {"token": "color.action.{variant}.background"},
        "paddingInline": {"token": "space.{size}"},
        "radius": {"token": "radius.md"},
    },
    "a11y": {
        "role": "button",
        "requires": ["accessible-name", "focus-visible"],
        "contrast": [{"foreground": "color.action.{variant}.foreground",
                      "background": "color.action.{variant}.background", "level": "AA"}],
    },
    "platforms": {"web": {"element": "button"}, "rn": {"element": "Pressable"}},
}

VALID_THEME = {
    "id": "test-theme",
    "status": "review",
    "tone": ["calm", "precise"],
    "not": "playful",
    "seed": {"color": "#3B5BDB", "typeface": "system", "mono": "system"},
    "neutralTint": 0.25,
    "scale": {"base": 16, "ratio": 1.2},
    "radius": "sm",
    "density": "comfortable",
    "motion": "subtle",
    "modes": {"default": "light", "supports": ["light", "dark"]},
}


@pytest.fixture
def component() -> dict:
    """A fresh deep copy per test, so mutations don't leak between tests."""
    return copy.deepcopy(VALID_COMPONENT)


@pytest.fixture
def theme() -> dict:
    return copy.deepcopy(VALID_THEME)


@pytest.fixture
def doc(tmp_path):
    """Write a component/theme doc to a temp file: doc('widget.md', frontmatter, body)."""
    def _write(name: str, frontmatter: str, body: str = "") -> Path:
        p = tmp_path / name
        p.write_text(f"---\n{frontmatter.strip()}\n---\n{body}", encoding="utf-8")
        return p
    return _write
