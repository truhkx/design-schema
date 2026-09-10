"""mcp/server.py — get_keyboard_model, get_layout_rules, list_gaps, start_theme, write_theme.

Same approach as test_mcp_server.py: the plain functions behind the FastMCP tools, with the
call log and the on-disk folders redirected to tmp_path where a tool would otherwise write.
"""
from __future__ import annotations

import json
import shutil
import subprocess

import pytest

fastmcp = pytest.importorskip("fastmcp", reason="fastmcp is not installed")
import server as s  # noqa: E402


def fn(tool):
    return getattr(tool, "fn", tool)


get_keyboard_model = fn(s.get_keyboard_model)
get_layout_rules = fn(s.get_layout_rules)
list_gaps = fn(s.list_gaps)
start_theme = fn(s.start_theme)
write_theme = fn(s.write_theme)


@pytest.fixture(autouse=True)
def quiet_call_log(tmp_path, monkeypatch):
    monkeypatch.setattr(s, "CALL_LOG", tmp_path / "mcp-calls.jsonl")


class TestGetKeyboardModel:
    def test_rules_carry_from_and_expect_with_defaults_filled(self):
        kb = get_keyboard_model("Dialog")
        assert kb["rules"], "Dialog documents its keyboard model"
        for r in kb["rules"]:
            assert r["from"] in ("trigger", "first", "last", "inside", "any")
            assert r["expect"]
        assert kb["autoTested"] + kb["manual"] == sum(len(r["keys"]) for r in kb["rules"])

    def test_escape_on_dialog_closes(self):
        kb = get_keyboard_model("dialog")
        escape = next(r for r in kb["rules"] if "Escape" in r["keys"])
        assert escape["expect"] == "closes"
        assert "escape-dismiss" in kb["requires"] and "keyboard-operable" in kb["requires"]

    def test_a_component_without_a_keyboard_block_says_so(self):
        kb = get_keyboard_model("Text")
        assert kb["rules"] == [] and kb["note"]

    def test_defaults_are_applied_without_mutating_the_cached_component(self, monkeypatch):
        entry = {"component": {"name": "Widget", "apg": None, "a11y": {"role": "button", "requires": ["keyboard-operable"]},
                               "keyboard": [{"keys": ["Enter"], "action": "Activates."}]}}
        monkeypatch.setattr(s, "_find_component", lambda name: entry)
        kb = get_keyboard_model("Widget")
        assert kb["rules"] == [{"from": "inside", "expect": "manual", "keys": ["Enter"], "action": "Activates."}]
        assert "from" not in entry["component"]["keyboard"][0]
        assert kb["manual"] == 1 and kb["autoTested"] == 0

    def test_an_unknown_component_raises(self):
        with pytest.raises(ValueError, match="Unknown component"):
            get_keyboard_model("Gadget")


class TestGetLayoutRules:
    def test_returns_every_layout_token_named_for_both_platforms(self):
        out = get_layout_rules("calm-precise", "light")
        names = set(out["tokens"])
        assert {"layout.gap.normal", "layout.section.md", "layout.inset.md", "layout.gutter",  # gutter.default drops its last segment
                "layout.maxWidth.prose", "layout.maxWidth.content", "layout.maxWidth.page"} <= names
        assert all(k.startswith("layout.") for k in names)
        t = out["tokens"]["layout.gap.normal"]
        assert t["css"] == "var(--layout-gap-normal)" and t["rn"] == "layoutGapNormal"
        assert t["value"].endswith("px")

    def test_page_width_is_four_thirds_of_content(self):
        t = get_layout_rules("calm-precise")["tokens"]
        content = int(t["layout.maxWidth.content"]["value"].rstrip("px"))
        page = int(t["layout.maxWidth.page"]["value"].rstrip("px"))
        assert page == round(content * 4 / 3)

    def test_rules_text_comes_from_the_foundations_page(self):
        out = get_layout_rules()
        assert "Siblings are spaced by their parent" in out["rules"]
        assert "The rules" in out["sections"] and out["source"].endswith("foundations/layout.md")

    def test_an_unknown_theme_raises(self):
        with pytest.raises(ValueError, match="Unknown theme"):
            get_layout_rules("no-such-theme")

    def test_an_unsupported_mode_raises(self, monkeypatch):
        monkeypatch.setattr(s, "theme_modes", lambda theme: ["light"])
        with pytest.raises(ValueError, match="has no 'dark' mode"):
            get_layout_rules("calm-precise", "dark")


class TestListGaps:
    GAP_FILE = """# Gaps reported while generating Widget for web

## 2026-09-09 21:07 — round 1

- Widget: first guess.
- Widget: second guess.

## 2026-09-09 21:08 — round 2

- Widget: only guess in round two.
"""

    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch):
        generated = tmp_path / "generated"
        (generated / "gaps").mkdir(parents=True)
        shutil.copy(s.GENERATED / "components.json", generated / "components.json")
        monkeypatch.setattr(s, "GENERATED", generated)
        monkeypatch.setattr(s, "ROOT", tmp_path)
        (generated / "gaps" / "Widget.web.md").write_text(self.GAP_FILE, encoding="utf-8")
        (generated / "gaps" / "Button.rn.md").write_text("# Gaps\n\n## 2026-09-09 10:00 — round 1\n\n- Button: one.\n", encoding="utf-8")
        return generated

    def test_rounds_are_parsed_newest_first_with_their_bullets(self, sandbox):
        widget = next(g for g in list_gaps() if g["component"] == "Widget")
        assert widget["platform"] == "web" and widget["total"] == 3
        assert [r["round"] for r in widget["rounds"]] == [2, 1]
        assert widget["rounds"][0]["gaps"] == ["Widget: only guess in round two."]
        assert widget["source"] == "generated/gaps/Widget.web.md"

    def test_component_filter_is_case_insensitive_and_resolves_known_names(self, sandbox):
        out = list_gaps("button")
        assert [g["component"] for g in out] == ["Button"]

    def test_no_gaps_folder_means_an_empty_list(self, tmp_path, monkeypatch):
        monkeypatch.setattr(s, "GENERATED", tmp_path)
        assert list_gaps() == []


class TestStartTheme:
    def test_five_questions_in_leverage_order_with_allowed_values(self):
        st = start_theme()
        assert [q["id"] for q in st["questions"]] == ["tone", "seed", "type", "shape", "rhythm"]
        allowed = {f: v for q in st["questions"] for f, v in q["allowed"].items()}
        assert allowed["radius"]["enum"] == ["none", "sm", "md", "lg", "full"]
        assert allowed["density"]["enum"] == ["compact", "comfortable", "roomy"]
        assert allowed["scale.ratio"]["minimum"] == 1.1 and allowed["scale.ratio"]["maximum"] == 1.5
        assert allowed["seed.color"]["pattern"].startswith("^#")
        assert allowed["tone"]["minItems"] == 2 and allowed["tone"]["maxItems"] == 5
        assert allowed["modes"]["fields"]["default"]["enum"] == ["light", "dark"]

    def test_carries_the_process_text_and_the_example_doc(self):
        st = start_theme()
        assert "excluded word" in st["process"].lower()
        assert st["example"].startswith("---\ntitle: Calm & precise")
        assert st["required"] == ["id", "tone", "not", "seed", "scale", "radius", "density", "modes"]


GOOD = {
    "title": "Warm test", "description": "A test theme.",
    "tone": ["warm", "sleek"], "not": "cold",
    "seed": {"color": "#C89A5C", "typeface": "Google Sans"}, "neutralTint": 0.35,
    "scale": {"base": 16, "ratio": 1.25}, "radius": "md", "density": "comfortable",
    "motion": "expressive", "elevation": "pronounced", "layout": {"rhythm": "normal", "contentWidth": 1040},
    "modes": {"default": "light", "supports": ["light", "dark"]},
    "feel": "Cream surfaces and a pale-oak accent.", "whenToUse": "Consumer products.",
    "platformNotes": {"web": "Load Google Sans yourself."},
}


class TestWriteTheme:
    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch):
        docs = tmp_path / "themes"
        docs.mkdir()
        monkeypatch.setattr(s, "THEME_DOCS", docs)
        calls = []

        def fake_run(argv, **kw):
            calls.append(argv)
            script = str(argv[1])
            out = "✔ themes: warm-test (light, dark) → tokens/themes/" if script.endswith("theme.py") else "404 pairs checked, 0 failures"
            return subprocess.CompletedProcess(argv, 0, stdout=out, stderr="")

        monkeypatch.setattr(subprocess, "run", fake_run)
        return docs, calls

    def test_writes_the_doc_in_the_calm_precise_shape_and_runs_the_derivation(self, sandbox):
        docs, calls = sandbox
        out = write_theme("warm-test", GOOD)
        assert out["ok"] is True and out["written"].endswith("themes/warm-test.md")
        text = (docs / "warm-test.md").read_text(encoding="utf-8")
        assert text.startswith("---\ntitle: Warm test\ndescription: A test theme.\ntheme:\n  id: warm-test\n  status: draft\n")
        for heading in ("## Feel", "## Not cold", "## References", "## When to use", "## When not to use", "## Accessibility",
                        "## Platform notes", "### Web", "### Lit", "### React Native"):
            assert heading in text, heading
        assert "Cream surfaces and a pale-oak accent." in text and "Load Google Sans yourself." in text
        assert len(calls) == 2, "theme.py, then check_contrast.py"
        assert str(calls[0][1]).endswith("theme.py") and str(calls[1][1]).endswith("check_contrast.py")
        assert out["contrast"]["ok"] is True and out["contrast"]["failures"] == []

    def test_the_frontmatter_round_trips_through_the_theme_schema(self, sandbox, theme_schema):
        import yaml

        docs, _ = sandbox
        write_theme("warm-test", GOOD)
        fm = yaml.safe_load((docs / "warm-test.md").read_text(encoding="utf-8").split("\n---\n")[0].lstrip("-\n"))
        import theme as th

        assert list(th.Validator(theme_schema).iter_errors(fm)) == []
        assert fm["theme"]["layout"] == {"rhythm": "normal", "contentWidth": 1040}

    def test_invalid_answers_write_nothing(self, sandbox):
        docs, calls = sandbox
        out = write_theme("warm-test", {**GOOD, "seed": {"color": "#12345"}, "radius": "round"})
        assert out["ok"] is False and out["written"] is None
        assert any("seed.color" in e for e in out["errors"]) and any("radius" in e for e in out["errors"])
        assert not (docs / "warm-test.md").exists() and calls == []

    def test_an_existing_doc_is_kept_unless_overwrite(self, sandbox):
        docs, _ = sandbox
        (docs / "warm-test.md").write_text("original", encoding="utf-8")
        out = write_theme("warm-test", GOOD)
        assert out["ok"] is False and "overwrite=true" in out["errors"][0]
        assert (docs / "warm-test.md").read_text(encoding="utf-8") == "original"
        assert write_theme("warm-test", GOOD, overwrite=True)["ok"] is True

    @pytest.mark.parametrize("bad_id", ["Warm", "warm test", "1warm", "warm_test", "../x"])
    def test_the_id_must_be_kebab_case(self, sandbox, bad_id):
        with pytest.raises(ValueError, match="kebab-case"):
            write_theme(bad_id, GOOD)

    def test_derivation_errors_are_returned_not_raised(self, sandbox, monkeypatch):
        def failing_run(argv, **kw):
            return subprocess.CompletedProcess(argv, 1, stdout="✖ themes: none", stderr="✖ warm-test.md:\n  - seed.color: bad")

        monkeypatch.setattr(subprocess, "run", failing_run)
        out = write_theme("warm-test", GOOD)
        assert out["ok"] is False and out["errors"] == ["✖ warm-test.md:", "- seed.color: bad"]
        assert "contrast" not in out

    def test_contrast_failures_are_reported_for_the_caller_to_decide(self, sandbox, monkeypatch):
        def run(argv, **kw):
            if str(argv[1]).endswith("theme.py"):
                return subprocess.CompletedProcess(argv, 0, stdout="✔ themes", stderr="")
            return subprocess.CompletedProcess(argv, 1, stdout="✖ Button warm-test/light color.a on color.b: 3.9:1 (needs 4.5 for AA)\n1 failure", stderr="")

        monkeypatch.setattr(subprocess, "run", run)
        out = write_theme("warm-test", GOOD)
        assert out["ok"] is True and out["contrast"]["ok"] is False
        assert out["contrast"]["failures"] == ["✖ Button warm-test/light color.a on color.b: 3.9:1 (needs 4.5 for AA)"]
        assert "seed" in out["next"]
