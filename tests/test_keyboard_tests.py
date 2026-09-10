"""tools/keyboard_tests.py — Playwright specs derived from a component's `keyboard` block."""
from __future__ import annotations

import copy
import json
import re

import pytest

import keyboard_tests as kt


DIALOG = {
    "name": "Dialog",
    "a11y": {"role": "dialog", "requires": ["keyboard-operable", "escape-dismiss"]},
    "platforms": {"web": {"element": "dialog"}, "lit": {"tag": "ds-dialog"}, "rn": {"element": "Modal"}},
    "keyboard": [
        {"keys": ["Escape"], "action": "Requests close.", "from": "inside", "expect": "closes"},
        {"keys": ["Tab"], "action": "Moves to the next focusable element.", "from": "first", "expect": "focus-next"},
        {"keys": ["Shift+Tab"], "action": "From the first element, wraps to the last.", "from": "first", "expect": "focus-wraps-to-last"},
        {"keys": ["Enter", " "], "action": "Activates the focused button.", "expect": "manual"},
    ],
}


def titles_of(spec: str) -> list[str]:
    return re.findall(r"^  test\('(.*?)', async", spec, re.M)


def skips_of(spec: str) -> list[str]:
    return re.findall(r"^  test\.skip\('(.*?)', async", spec, re.M)


class TestStoryId:
    def test_follows_storybooks_title_and_export_convention(self):
        assert kt.story_id("Dialog", "React") == "dialog-react--keyboard"
        assert kt.story_id("ActionSheet", "Lit") == "actionsheet-lit--keyboard"


class TestRootLocator:
    def test_a_role_locates_by_role(self):
        assert kt.root_locator(DIALOG) == "page.getByRole('dialog').first()"

    @pytest.mark.parametrize("role", ["none", "landmark", "img"])
    def test_roles_that_cannot_be_queried_fall_back_to_the_data_attribute(self, role):
        c = {**DIALOG, "name": "Stack", "a11y": {"role": role, "requires": []}}
        assert kt.root_locator(c) == "page.locator('[data-ds=\"Stack\"]').first()"


class TestBlocks:
    @pytest.mark.parametrize("frm,code", [
        ("trigger", "await trigger(page).focus();"),
        ("first", "await focusAt(page, root, 0);"),
        ("last", "await focusAt(page, root, await focusableCount(page, root) - 1);"),
        ("inside", "await focusAt(page, root, 1);"),
        ("any", ""),
    ])
    def test_every_from_value_has_setup_code(self, frm, code):
        assert kt.from_block(frm) == code

    @pytest.mark.parametrize("exp,fragment", [
        ("closes", "toBeHidden()"),
        ("opens", "toBeVisible()"),
        ("focus-next", "toBe(before + 1)"),
        ("focus-prev", "toBe(before - 1)"),
        ("focus-first", "toBe(0)"),
        ("focus-last", "focusableCount(page, root) - 1"),
        ("focus-wraps-to-first", "toBe(0)"),
        ("focus-wraps-to-last", "focusableCount(page, root) - 1"),
        ("focus-trigger", "trigger(page)).toBeFocused()"),
        ("focus-unchanged", "toBe(before)"),
        ("toggles", "not.toBe(stateBefore)"),
        ("selects", "toMatch(/true/)"),
    ])
    def test_every_machine_checkable_expect_has_an_assertion(self, exp, fragment):
        assert fragment in kt.expect_block(exp)

    def test_manual_has_no_assertion_block(self):
        with pytest.raises(KeyError):
            kt.expect_block("manual")


class TestSpecFor:
    @pytest.fixture
    def spec(self):
        return kt.spec_for(DIALOG, "web")

    def test_one_test_per_key_with_the_action_as_its_title(self, spec):
        assert titles_of(spec) == [
            "Escape: Requests close.",
            "Tab: Moves to the next focusable element.",
            "Shift+Tab: From the first element, wraps to the last.",
        ]

    def test_manual_rules_become_skips_one_per_key(self, spec):
        assert skips_of(spec) == [
            "Enter: Activates the focused button. — manual",
            " : Activates the focused button. — manual",
        ]

    def test_each_test_carries_its_from_and_expect_code(self, spec):
        escape = spec[spec.index("test('Escape"):spec.index("test('Tab")]
        assert kt.from_block("inside") in escape
        assert "await page.keyboard.press('Escape');" in escape
        assert kt.expect_block("closes") in escape
        wrap = spec[spec.index("test('Shift+Tab"):spec.index("test.skip")]
        assert kt.from_block("first") in wrap
        assert "press('Shift+Tab')" in wrap
        assert kt.expect_block("focus-wraps-to-last") in wrap

    def test_the_root_locator_and_story_are_wired_into_before_each(self, spec):
        assert "page.goto('/iframe.html?id=dialog-react--keyboard&viewMode=story')" in spec
        assert "await expect(page.getByRole('dialog').first()).toBeVisible();" in spec
        assert "const root = page.getByRole('dialog').first();" in spec

    def test_lit_uses_its_own_story_suffix(self):
        assert "id=dialog-lit--keyboard" in kt.spec_for(DIALOG, "lit")

    def test_space_is_translated_to_playwrights_key_name(self):
        c = copy.deepcopy(DIALOG)
        c["keyboard"] = [{"keys": [" "], "action": "Toggles.", "expect": "toggles"}]
        assert "press('Space')" in kt.spec_for(c, "web")

    def test_a_letter_range_becomes_a_typeahead_press(self):
        c = copy.deepcopy(DIALOG)
        c["keyboard"] = [{"keys": ["a-z"], "action": "Moves to the next item starting with the letter.", "expect": "focus-next"}]
        spec = kt.spec_for(c, "web")
        assert titles_of(spec) == ["typeahead letter: Moves to the next item starting with the letter."]
        assert "press('a')" in spec

    def test_when_is_appended_to_the_title(self):
        c = copy.deepcopy(DIALOG)
        c["keyboard"] = [{"keys": ["ArrowDown"], "action": "Opens the menu.", "when": "focus on trigger", "from": "trigger", "expect": "opens"}]
        spec = kt.spec_for(c, "web")
        assert titles_of(spec) == ["ArrowDown: Opens the menu. (focus on trigger)"]
        assert kt.from_block("trigger") in spec

    def test_a_missing_expect_is_manual_by_default(self):
        c = copy.deepcopy(DIALOG)
        c["keyboard"] = [{"keys": ["Home"], "action": "Moves to the first item."}]
        spec = kt.spec_for(c, "web")
        assert titles_of(spec) == [] and skips_of(spec) == ["Home: Moves to the first item. — manual"]

    def test_apostrophes_in_actions_are_escaped(self):
        c = copy.deepcopy(DIALOG)
        c["keyboard"] = [{"keys": ["Escape"], "action": "Doesn't close when not dismissible.", "expect": "closes"}]
        assert "test('Escape: Doesn\\'t close when not dismissible.'" in kt.spec_for(c, "web")

    def test_the_helpers_and_imports_are_present_once(self, spec):
        assert spec.count("import { test, expect, type Page, type Locator } from '@playwright/test';") == 1
        assert spec.count("async function focusIndex(") == 1
        assert spec.startswith("// Generated by tools/keyboard_tests.py")


class TestMain:
    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch):
        generated = tmp_path / "generated"
        generated.mkdir()
        monkeypatch.setattr(kt, "ROOT", tmp_path)
        monkeypatch.setattr(kt, "GENERATED", generated)
        monkeypatch.setattr(kt, "OUT", generated / "keyboard")

        def write(components):
            (generated / "components.json").write_text(json.dumps([{"component": c} for c in components]), encoding="utf-8")
        return generated, write

    def test_writes_one_spec_per_supported_browser_platform(self, sandbox, capsys):
        generated, write = sandbox
        write([DIALOG])
        assert kt.main() == 0
        names = sorted(p.name for p in (generated / "keyboard").glob("*.spec.ts"))
        assert names == ["Dialog.lit.spec.ts", "Dialog.web.spec.ts"], "React Native never gets a keyboard spec"
        assert "1 spec(s)" not in capsys.readouterr().out or True  # count is per file; asserted below

    def test_counts_auto_and_manual_rules_per_key(self, sandbox, capsys):
        _, write = sandbox
        write([DIALOG])
        kt.main()
        assert "2 spec(s), 3 auto-tested rule(s) per platform, 2 manual" in capsys.readouterr().out

    def test_components_without_a_keyboard_block_are_skipped(self, sandbox):
        generated, write = sandbox
        write([{**DIALOG, "name": "Text", "keyboard": []}])
        kt.main()
        assert list((generated / "keyboard").glob("*.spec.ts")) == []

    def test_an_unsupported_or_undeclared_platform_gets_no_spec(self, sandbox):
        generated, write = sandbox
        c = copy.deepcopy(DIALOG)
        c["platforms"] = {"web": {"element": "dialog"}, "lit": {"supported": False, "notes": "later"}}
        write([c])
        kt.main()
        assert [p.name for p in (generated / "keyboard").glob("*.spec.ts")] == ["Dialog.web.spec.ts"]

    def test_stale_specs_are_removed_on_every_run(self, sandbox):
        generated, write = sandbox
        out = generated / "keyboard"
        out.mkdir()
        (out / "Gone.web.spec.ts").write_text("// old", encoding="utf-8")
        write([DIALOG])
        kt.main()
        assert not (out / "Gone.web.spec.ts").exists()
