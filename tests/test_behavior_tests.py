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
    def test_primary_part_is_located_by_role_with_the_root_as_fallback(self):
        assert bt.part_locator_body(WIDGET, "control", "web") == "(screen.queryByRole('button') ?? s.root()) as HTMLElement"
        assert bt.part_locator_body(WIDGET, "control", "rn") == "screen.queryByRole('button') ?? s.root()"

    @pytest.mark.parametrize("role", ["none", "text", "landmark", "presentation"])
    def test_a_role_that_cannot_be_queried_never_reaches_get_by_role(self, role):
        c = {**WIDGET, "a11y": {"role": role, "requires": []}}
        assert bt.part_locator_body(c, "control", "web") == "s.root()"
        assert bt.part_locator_body(c, "control", "rn") == "s.root()"
        assert "role=" not in bt.part_locator_body(c, "control", "lit")

    def test_the_root_is_the_data_ds_hook_first(self):
        web = bt.root_locator_body(WIDGET, "web")
        assert web.startswith("(document.querySelector('[data-ds=\"Widget\"]')"), "the hook is searched document-wide: portals render outside the container"
        assert "screen.queryByRole('button')" in web and web.endswith("utils.container.firstElementChild) as HTMLElement")
        assert "queryByRole" not in bt.root_locator_body({**WIDGET, "a11y": {"role": "none", "requires": []}}, "web")
        assert bt.root_locator_body(WIDGET, "rn") == "screen.queryByTestId('Widget') ?? screen.UNSAFE_root"

    def test_lit_primary_tries_role_then_part_then_first_child_through_shadow_roots(self):
        body = bt.part_locator_body(WIDGET, "control", "lit")
        assert body.index('[role="button"]') < body.index('[part="control"]') < body.index("root.firstElementChild")
        assert body.startswith("(deep(root,")

    def test_a_part_matching_a_string_prop_is_located_by_its_text(self):
        assert bt.part_locator_body(WIDGET, "label", "web") == "screen.getByText(props.label)"
        assert bt.part_locator_body(WIDGET, "label", "rn") == "screen.getByText(props.label)"

    def test_an_unhooked_part_falls_back_to_the_data_part_or_testid_convention(self):
        assert "data-part=\"indicator\"" in bt.part_locator_body(WIDGET, "indicator", "web")
        assert bt.part_locator_body(WIDGET, "indicator", "rn") == "screen.queryByTestId('Widget.indicator') ?? s.root()"

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
        for platform in bt.PLATFORMS:  # the component exists in every package
            src = tmp_path / bt.SOURCE_FILE[platform].format(name="Widget")
            src.parent.mkdir(parents=True, exist_ok=True)
            src.write_text("export {};", encoding="utf-8")

        def write(entries):
            import json
            (generated / "components.json").write_text(json.dumps(entries), encoding="utf-8")
        return generated, write

    def test_a_component_not_generated_yet_gets_no_test_file(self, sandbox, tmp_path, capsys):
        generated, write = sandbox
        (tmp_path / bt.SOURCE_FILE["lit"].format(name="Widget")).unlink()
        write([self.entry(behavior=[CLICK])])
        bt.main()
        names = sorted(p.name for p in (generated / "behavior").glob("*.test.*"))
        assert names == ["Widget.rn.test.tsx", "Widget.web.test.tsx"]
        assert "1 target(s) not generated yet" in capsys.readouterr().out

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


class TestSurfaces:
    OVERLAY = {**WIDGET, "name": "Sheet", "anatomy": ["surface"], "a11y": {"role": "dialog", "requires": []},
               "props": {"open": {"type": "boolean", "description": "x"}, "title": {"type": "string", "required": True, "description": "x"}}}

    def test_a_closed_by_default_overlay_is_opened_for_scenarios_that_need_its_surface(self):
        block = bt.scenario_block(self.OVERLAY, {"name": "renders", "then": [{"renders": True}]}, "web")
        assert "setup({ open: true })" in block or "setup({\"open\": true})" in block or '"open": true' in block

    def test_an_authored_open_value_is_kept(self):
        block = bt.scenario_block(self.OVERLAY, {"name": "closed", "given": {"open": False}, "then": [{"renders": True}]}, "web")
        assert "true" not in block.split("setup(")[1].split(")")[0]

    def test_a_component_without_an_open_prop_is_untouched(self):
        block = bt.scenario_block(WIDGET, {"name": "renders", "then": [{"renders": True}]}, "web")
        assert "open" not in block

    def test_a_hover_surface_is_skipped_with_the_reason(self):
        tip = {**WIDGET, "name": "Tooltip", "a11y": {"role": "tooltip", "requires": []}}
        block = bt.scenario_block(tip, {"name": "renders", "then": [{"renders": True}]}, "web")
        assert block.startswith("  test.skip('renders")
        assert "needs its trigger hovered" in block
        assert "\\'tooltip\\'" in block, "quotes inside the reason are escaped for the JS string literal"



class TestNameAndRenders:
    def test_renders_never_queries_by_role(self):
        for platform in bt.PLATFORMS:
            lines = bt.then_renders_lines(WIDGET, platform)
            assert not any("ByRole" in ln for ln in lines)

    def test_name_uses_the_prop_that_carries_the_accessible_name(self):
        assert bt.then_name_lines(WIDGET, "web") == ["expect(screen.getByRole('button', { name: s.props.label })).toBeInTheDocument();"]
        icon = {**WIDGET, "name": "Icon", "anatomy": ["glyph"], "a11y": {"role": "img", "requires": ["accessible-name"]},
                "props": {"label": {"type": "string", "description": "x", "a11y": "aria-label when set"}}}
        assert "s.props.label" in bt.then_name_lines(icon, "web")[0]

    def test_name_without_a_naming_prop_asserts_a_non_empty_name(self):
        heading = {**WIDGET, "name": "Heading", "anatomy": ["text"], "a11y": {"role": "heading", "requires": ["accessible-name"]},
                   "props": {"children": {"type": "content", "required": True, "description": "x"}}}
        assert bt.then_name_lines(heading, "web") == ["expect(screen.getByRole('heading')).toHaveAccessibleName();"]

    def test_name_on_an_unqueryable_role_is_unmappable(self):
        text = {**WIDGET, "a11y": {"role": "text", "requires": []}}
        with pytest.raises(bt.Unmappable, match="cannot be queried"):
            bt.then_name_lines(text, "web")
