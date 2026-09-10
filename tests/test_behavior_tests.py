"""tools/behavior_tests.py — tests derived from a component's `behavior` scenarios."""
from __future__ import annotations

import re

import pytest

import behavior_tests as bt


WIDGET = {
    "name": "Widget",
    "anatomy": ["control", "label"],
    "props": {"label": {"type": "string", "required": True, "description": "Visible text."}},
    "events": {
        "onPress": {"description": "Activated.", "platforms": {"web": "onPress", "lit": "press", "rn": "onPress"}},
    },
    "copy": {"required": "{label} is required."},
    "a11y": {"role": "button", "requires": []},
    "platforms": {
        "web": {"element": "button"},
        "lit": {"tag": "ds-widget"},
        "rn": {"element": "Pressable"},
    },
}

CLICK = {"name": "click-fires", "when": {"click": "control"}, "then": [{"event": "onPress", "with": True}]}
BAD = {"name": "has-weird-attr", "then": [{"attribute": "data-x", "is": "y"}]}
SCENARIOS = [CLICK, BAD]


def titles_of(content: str) -> list[str]:
    return re.findall(r"^  test\('(.*?)',", content, re.M)


def skips_of(content: str) -> list[str]:
    return re.findall(r"^  test\.skip\('(.*?)',", content, re.M)


class TestScenarioBlock:
    """One scenario becomes one `test(`, unless the generator has no code-mapping for it."""

    def test_mappable_scenario_becomes_a_test(self):
        block = bt.scenario_block(WIDGET, CLICK, "web")
        assert block.startswith("  test('click-fires',")

    def test_unmappable_assertion_becomes_a_skip_with_its_reason(self):
        block = bt.scenario_block(WIDGET, BAD, "web")
        assert block.startswith("  test.skip('has-weird-attr — ")
        assert "attribute" in block

    def test_unrecognized_then_keys_are_unmappable(self):
        sc = {"name": "mystery", "then": [{"somethingNobodyDeclared": True}]}
        with pytest.raises(bt.Unmappable, match="unrecognized assertion keys"):
            bt.then_item_lines(WIDGET, sc["then"][0], "web")

    def test_focused_moved_and_unchanged_are_unmappable(self):
        with pytest.raises(bt.Unmappable, match="pre-action focus snapshot"):
            bt.then_focused_lines(WIDGET, "moved", "web")
        with pytest.raises(bt.Unmappable, match="pre-action focus snapshot"):
            bt.then_focused_lines(WIDGET, "unchanged", "web")

    def test_multiple_interactions_in_one_when_are_unmappable(self):
        sc = {"name": "two-things", "when": {"click": "control", "key": "Enter"}, "then": [{"renders": True}]}
        with pytest.raises(bt.Unmappable, match="only one interaction"):
            bt.when_lines(WIDGET, sc, "web")


class TestGeneratedFilesContainOneTestPerScenario:
    """A minimal component with two scenarios (one mappable, one not) on every platform."""

    @pytest.mark.parametrize("platform,builder", [("web", bt.web_file), ("rn", bt.rn_file), ("lit", bt.lit_file)])
    def test_one_test_and_one_skip(self, platform, builder):
        content = builder(WIDGET, SCENARIOS)
        assert titles_of(content) == ["click-fires"]
        assert len(skips_of(content)) == 1
        assert "has-weird-attr" in skips_of(content)[0]

    def test_web_event_prop_and_call_signature(self):
        content = bt.web_file(WIDGET, SCENARIOS)
        assert "onPress: events.onPress" in content
        assert "toHaveBeenCalledWith(true, expect.anything());" in content

    def test_rn_event_prop_and_call_signature(self):
        content = bt.rn_file(WIDGET, SCENARIOS)
        assert "onPress: events.onPress" in content
        assert "toHaveBeenCalledWith(true);" in content
        assert "toHaveBeenCalledWith(true, expect.anything())" not in content

    def test_lit_event_uses_the_platforms_lit_dispatch_name(self):
        content = bt.lit_file(WIDGET, SCENARIOS)
        assert "el.addEventListener('press', events.onPress" in content
        assert "toContain(true)" in content


class TestPartLocator:
    def test_primary_part_is_located_by_role(self):
        assert bt.part_locator_body(WIDGET, "control", "web") == "screen.getByRole('button')"
        assert bt.part_locator_body(WIDGET, "control", "rn") == "screen.getByRole('button')"

    def test_a_part_matching_a_string_prop_is_located_by_its_text(self):
        assert bt.part_locator_body(WIDGET, "label", "web") == "screen.getByText(props.label)"
        assert bt.part_locator_body(WIDGET, "label", "rn") == "screen.getByText(props.label)"

    def test_an_unhooked_part_falls_back_to_the_data_part_or_testid_convention(self):
        assert "data-part=\"indicator\"" in bt.part_locator_body(WIDGET, "indicator", "web")
        assert bt.part_locator_body(WIDGET, "indicator", "rn") == "screen.getByTestId('Widget.indicator')"

    def test_lit_tries_the_native_part_attribute_then_data_part(self):
        body = bt.part_locator_body(WIDGET, "label", "lit")
        assert 'part="label"' in body and 'data-part="label"' in body


class TestUsedParts:
    def test_the_primary_part_is_always_included(self):
        sc = {"name": "no-interaction", "then": [{"renders": True}]}
        assert bt.used_parts(WIDGET, [sc]) == ["control"]

    def test_parts_referenced_by_when_or_then_are_added_in_anatomy_order(self):
        sc = {"name": "x", "when": {"click": "label"}, "then": [{"event": "onPress"}]}
        assert bt.used_parts(WIDGET, [sc]) == ["control", "label"]


class TestRegexExpr:
    def test_a_literal_string_is_escaped(self):
        import re as re_

        expr = bt.regex_expr("Accept the (terms).")
        assert expr == f'new RegExp({bt.js(re_.escape("Accept the (terms)."))})'

    def test_a_label_placeholder_becomes_a_runtime_substitution(self):
        import re as re_

        expr = bt.regex_expr("{label} is required.")
        assert expr == f'new RegExp(escapeRegExp(s.props.label) + {bt.js(re_.escape(" is required."))})'

    def test_leading_and_trailing_whitespace_is_trimmed_like_testing_library_does(self):
        import re as re_

        expr = bt.regex_expr(" (required)")
        assert expr == f'new RegExp({bt.js(re_.escape("(required)"))})'


class TestMain:
    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch):
        generated = tmp_path / "generated"
        generated.mkdir()
        monkeypatch.setattr(bt, "ROOT", tmp_path)
        monkeypatch.setattr(bt, "GENERATED", generated)
        monkeypatch.setattr(bt, "OUT", generated / "behavior")

        def write(entries):
            import json
            (generated / "components.json").write_text(json.dumps(entries), encoding="utf-8")
        return generated, write

    def entry(self, behavior=None, derived=None):
        c = dict(WIDGET)
        c["behavior"] = behavior or []
        return {"component": c, "behaviorDerived": derived or []}

    def test_writes_one_file_per_supported_platform(self, sandbox):
        generated, write = sandbox
        write([self.entry(behavior=[CLICK])])
        assert bt.main() == 0
        names = sorted(p.name for p in (generated / "behavior").glob("*.test.*"))
        assert names == ["Widget.lit.test.ts", "Widget.rn.test.tsx", "Widget.web.test.tsx"]

    def test_components_with_no_scenarios_at_all_are_skipped(self, sandbox):
        generated, write = sandbox
        write([self.entry()])
        bt.main()
        assert list((generated / "behavior").glob("*.test.*")) == []

    def test_stale_files_are_removed_on_every_run(self, sandbox):
        generated, write = sandbox
        out = generated / "behavior"
        out.mkdir()
        (out / "Gone.web.test.tsx").write_text("// old", encoding="utf-8")
        write([self.entry(behavior=[CLICK])])
        bt.main()
        assert not (out / "Gone.web.test.tsx").exists()

    def test_derived_scenarios_alone_are_enough_to_write_a_file(self, sandbox):
        generated, write = sandbox
        write([self.entry(derived=[{"name": "renders", "then": [{"renders": True}], "derived": True}])])
        bt.main()
        assert (generated / "behavior" / "Widget.web.test.tsx").exists()
