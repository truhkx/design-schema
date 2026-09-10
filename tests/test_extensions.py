"""Extensions: tools/parse.py merges site/src/content/docs/extensions/*.md into components, writes module stubs,
and tools/check_modules.py gates the hand-written modules. See process/extending-components.md."""
from __future__ import annotations

import json
from pathlib import Path

import pytest
import yaml

import check_modules as cm
import parse as p

BODY = "\n## When to use\n\nUse it.\n\n## Accessibility\n\nFine.\n"

ANALYTICS = {
    "extends": "Widget", "name": "analytics",
    "props": {"track": {"type": "string", "description": "Event name."}},
    "events": {"onTrack": {"description": "After press.", "platforms": {"web": "onTrack", "rn": "onTrack"}}},
    "behavior": [{"name": "press-tracks", "given": {"track": "signup"}, "when": {"click": "container"},
                  "then": [{"event": "onTrack", "with": {"name": "signup"}}]}],
    "modules": {"trackPress": {"path": "custom/analytics.ts", "signature": "(name: string, label: string) => void",
                               "wire": "Called from onPress when `track` is set."}},
}


@pytest.fixture
def sandbox(tmp_path, monkeypatch, component):
    docs, exts, out, templates = (tmp_path / n for n in ("components", "extensions", "generated", "templates"))
    for d in (docs, exts, out, templates):
        d.mkdir()
    for t in ("web", "rn"):
        (templates / f"{t}.md").write_text("{{NAME}}|{{PLATFORM}}\n{{SCHEMA_YAML}}\n{{GUIDANCE}}\n{{PLATFORM_NOTES}}")
    (templates / "theme.md").write_text("{{NAME}}")
    monkeypatch.setattr(p, "DOCS", docs)
    monkeypatch.setattr(p, "EXT_DOCS", exts)
    monkeypatch.setattr(p, "OUT", out)
    monkeypatch.setattr(p, "TEMPLATES", templates)
    monkeypatch.setattr(p, "THEME_DOCS", tmp_path / "no-themes")
    monkeypatch.setattr(p, "ROOT", tmp_path)
    monkeypatch.setattr(p, "token_names", lambda: None)
    (docs / "widget.md").write_text("---\n" + yaml.safe_dump({"title": "Widget", "component": component}, sort_keys=False) + "---\n" + BODY, encoding="utf-8")

    def ext(name: str, block: dict, body: str = "Why this exists.") -> Path:
        f = exts / f"{block['extends']}.{name}.md"
        f.write_text("---\n" + yaml.safe_dump({"title": name, "extension": block}, sort_keys=False) + "---\n\n" + body + "\n", encoding="utf-8")
        return f

    def run(capsys) -> tuple[int, list[dict], str]:
        code = p.main()
        err = capsys.readouterr().err
        entries = json.loads((out / "components.json").read_text(encoding="utf-8")) if (out / "components.json").exists() else []
        return code, entries, err

    return {"docs": docs, "exts": exts, "out": out, "ext": ext, "run": run}


class TestMerge:
    def test_props_events_behavior_and_modules_merge_into_the_component(self, sandbox, capsys):
        sandbox["ext"]("analytics", ANALYTICS)
        code, entries, err = sandbox["run"](capsys)
        assert code == 0, err
        c = entries[0]["component"]
        assert c["props"]["track"]["source"] == "extensions/Widget.analytics.md"
        assert c["events"]["onTrack"]["source"] == "extensions/Widget.analytics.md"
        assert [sc["name"] for sc in c["behavior"]] == ["press-tracks"]
        assert c["behavior"][0]["source"] == "extensions/Widget.analytics.md"
        assert "source" not in c["props"]["label"], "upstream items are not stamped"
        summary = entries[0]["extensions"]
        assert summary[0]["adds"] == {"props": ["track"], "events": ["onTrack"]}
        assert summary[0]["modules"]["trackPress"]["platforms"] == ["web", "rn"], "omitted platforms = the component's"

    def test_the_prompt_carries_the_prose_and_the_module_contract(self, sandbox, capsys):
        sandbox["ext"]("analytics", ANALYTICS, body="Product analytics needs the press.")
        sandbox["run"](capsys)
        web = (sandbox["out"] / "prompts" / "Widget.web.md").read_text(encoding="utf-8")
        assert "## Extensions" in web and "Product analytics needs the press." in web
        assert "import { trackPress } from './custom/analytics';" in web
        assert "(name: string, label: string) => void" in web and "Called from onPress" in web
        assert "source: extensions/Widget.analytics.md" in web, "the schema YAML in the prompt shows the origin"

    def test_lit_imports_carry_the_js_extension(self):
        assert p.module_import("custom/analytics.ts", "lit") == "./custom/analytics.js"
        assert p.module_import("custom/deep/thing.tsx", "web") == "./custom/deep/thing"

    def test_module_stubs_are_written_per_platform(self, sandbox, capsys):
        sandbox["ext"]("analytics", ANALYTICS)
        sandbox["run"](capsys)
        stub = sandbox["out"] / "modules" / "web" / "custom" / "analytics.d.ts"
        assert stub.exists() and "export declare const trackPress: (name: string, label: string) => void;" in stub.read_text()
        assert (sandbox["out"] / "modules" / "rn" / "custom" / "analytics.d.ts").exists()
        assert not (sandbox["out"] / "modules" / "lit").exists(), "the component does not declare lit"

    def test_stale_stubs_are_removed(self, sandbox, capsys):
        stale = sandbox["out"] / "modules" / "web" / "custom" / "old.d.ts"
        stale.parent.mkdir(parents=True)
        stale.write_text("export declare const gone: () => void;")
        sandbox["ext"]("analytics", ANALYTICS)
        sandbox["run"](capsys)
        assert not stale.exists()

    def test_a_component_without_extensions_is_untouched(self, sandbox, capsys):
        code, entries, _ = sandbox["run"](capsys)
        assert code == 0 and entries[0]["extensions"] == []
        assert "## Extensions" not in (sandbox["out"] / "prompts" / "Widget.web.md").read_text(encoding="utf-8")

    def test_extension_scenarios_are_validated_against_the_merged_schema(self, sandbox, capsys):
        bad = {**ANALYTICS, "behavior": [{"name": "x", "given": {"nope": 1}, "then": [{"renders": True}]}]}
        sandbox["ext"]("analytics", bad)
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "unknown prop 'nope'" in err


class TestCollisionsAndForbidden:
    def test_a_prop_upstream_declares(self, sandbox, capsys):
        sandbox["ext"]("dup", {"extends": "Widget", "name": "dup", "props": {"label": {"type": "string", "description": "x"}}})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "extensions/Widget.dup.md: props.label collides with Widget's own schema" in err

    def test_two_extensions_adding_the_same_event(self, sandbox, capsys):
        ev = {"events": {"onTrack": {"description": "x", "platforms": {"web": "onTrack", "rn": "onTrack"}}}}
        sandbox["ext"]("a", {"extends": "Widget", "name": "a", **ev})
        sandbox["ext"]("b", {"extends": "Widget", "name": "b", **ev})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "extensions/Widget.b.md: events.onTrack collides with extensions/Widget.a.md" in err

    def test_a_behavior_name_that_already_exists(self, sandbox, capsys, component):
        component["behavior"] = [{"name": "press-tracks", "then": [{"renders": True}]}]
        (sandbox["docs"] / "widget.md").write_text("---\n" + yaml.safe_dump({"title": "Widget", "component": component}, sort_keys=False) + "---\n" + BODY, encoding="utf-8")
        sandbox["ext"]("analytics", ANALYTICS)
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "behavior scenario 'press-tracks' collides with Widget's own schema" in err

    def test_an_explicitly_locked_binding(self, sandbox, capsys):
        sandbox["ext"]("lock", {"extends": "Widget", "name": "lock", "styles": {"glow": {"token": "space.1", "locked": True}}})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "styles.glow is locked" in err

    def test_a_binding_a_contrast_pair_locks(self, sandbox, capsys):
        # VALID_COMPONENT's contrast pair names color.action.{variant}.background; binding it again is locked by the parser.
        sandbox["ext"]("lock", {"extends": "Widget", "name": "lock", "styles": {"glow": {"token": "color.action.{variant}.background"}}})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "styles.glow binds 'color.action.{variant}.background', which is locked" in err

    def test_a11y_and_anatomy_cannot_be_extended(self, sandbox, capsys):
        sandbox["ext"]("a11y", {"extends": "Widget", "name": "a11y", "a11y": {"requires": ["focus-trap"]}})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "extensions/Widget.a11y.md: frontmatter failed schema validation" in err and "a11y" in err

    def test_two_extensions_declaring_the_same_module(self, sandbox, capsys):
        mod = {"modules": {"trackPress": {"path": "custom/a.ts", "signature": "() => void", "wire": "x"}}}
        sandbox["ext"]("a", {"extends": "Widget", "name": "a", **mod})
        sandbox["ext"]("b", {"extends": "Widget", "name": "b", **mod})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "module 'trackPress' collides with extensions/Widget.a.md" in err

    def test_extending_a_component_that_does_not_exist(self, sandbox, capsys):
        sandbox["ext"]("x", {"extends": "Gadget", "name": "x"})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "extensions/Gadget.x.md: extends 'Gadget', which has no component doc" in err

    def test_the_file_name_must_match_extends_and_name(self, sandbox, capsys):
        (sandbox["exts"] / "Widget.wrong.md").write_text("---\nextension:\n  extends: Widget\n  name: right\n---\n", encoding="utf-8")
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "file should be named Widget.right.md" in err

    def test_a_module_path_outside_custom_is_a_schema_error(self, sandbox, capsys):
        sandbox["ext"]("m", {"extends": "Widget", "name": "m", "modules": {"f": {"path": "utils/f.ts", "signature": "() => void", "wire": "x"}}})
        code, _, err = sandbox["run"](capsys)
        assert code == 1 and "modules.f.path" in err


class TestCheckModules:
    COMPONENTS = [{"component": {"name": "Widget"}, "extensions": [{"name": "analytics", "modules": {
        "trackPress": {"path": "custom/analytics.ts", "signature": "(name: string) => void", "wire": "x", "platforms": ["web", "rn"]}}}]}]

    @pytest.mark.parametrize("src,ok", [
        ("export function trackPress(n: string) {}", True),
        ("export const trackPress = (n: string) => {};", True),
        ("export async function trackPress() {}", True),
        ("function trackPress() {}\nexport { trackPress };", True),
        ("function tp() {}\nexport { tp as trackPress };", True),
        ("export function trackPressed() {}", False),
        ("function trackPress() {}", False),
    ])
    def test_export_detection(self, src, ok):
        assert cm.exports_name(src, "trackPress") is ok

    def test_declared_modules_filters_by_platform(self):
        assert [m["name"] for m in cm.declared_modules(self.COMPONENTS, "web")] == ["trackPress"]
        assert cm.declared_modules(self.COMPONENTS, "lit") == []

    def test_missing_file_and_missing_export_are_findings(self, tmp_path):
        pk = tmp_path / "packages"
        (pk / "react" / "src" / "custom").mkdir(parents=True)
        assert cm.run("web", typecheck=False, components=self.COMPONENTS, packages=pk, generated=tmp_path / "g") == [
            "Widget.analytics: module 'trackPress' expects packages/react/src/custom/analytics.ts, which does not exist"]
        (pk / "react" / "src" / "custom" / "analytics.ts").write_text("export const other = 1;", encoding="utf-8")
        assert cm.run("web", typecheck=False, components=self.COMPONENTS, packages=pk, generated=tmp_path / "g") == [
            "Widget.analytics: packages/react/src/custom/analytics.ts does not export 'trackPress'"]
        (pk / "react" / "src" / "custom" / "analytics.ts").write_text("export function trackPress(n: string) {}", encoding="utf-8")
        assert cm.run("web", typecheck=False, components=self.COMPONENTS, packages=pk, generated=tmp_path / "g") == []

    def test_nothing_declared_means_nothing_to_check(self, tmp_path):
        assert cm.run("lit", components=self.COMPONENTS, packages=tmp_path, generated=tmp_path) == []

    def test_the_check_program_pairs_each_real_export_with_its_stub(self, tmp_path):
        check_dir = tmp_path / "packages" / "react" / ".modules-check"
        stubs = tmp_path / "generated" / "modules" / "web"
        prog = cm.check_program(cm.declared_modules(self.COMPONENTS, "web"), "web", check_dir, stubs)
        assert "import * as real0 from '../src/custom/analytics';" in prog
        assert "import type * as stub0 from '../../../generated/modules/web/custom/analytics';" in prog
        assert "const check0: typeof stub0.trackPress = real0.trackPress;" in prog

    def test_react_native_pulls_in_its_globals(self, tmp_path):
        check_dir = tmp_path / "packages" / "rn" / ".modules-check"
        prog = cm.check_program(cm.declared_modules(self.COMPONENTS, "rn"), "rn", check_dir, tmp_path / "generated" / "modules" / "rn")
        assert prog.splitlines()[1] == "import 'react-native';"

    def test_relative_paths_always_start_with_a_dot(self, tmp_path):
        assert cm.relpath(tmp_path / "a" / "b", tmp_path / "a") == "./b"
        assert cm.relpath(tmp_path / "x", tmp_path / "a" / "b") == "../../x"


class TestTheRepository:
    """The shipped example: Button.analytics.md and the three custom/analytics.ts modules."""

    def test_the_example_extension_parses_into_button(self, root):
        entries = json.loads((root / "generated" / "components.json").read_text(encoding="utf-8"))
        button = next(e for e in entries if e["component"]["name"] == "Button")
        assert button["component"]["props"]["track"]["source"] == "extensions/Button.analytics.md"
        assert "trackPress" in button["extensions"][0]["modules"]

    @pytest.mark.parametrize("pkg", ["react", "lit", "rn"])
    def test_the_example_modules_exist_and_export_track_press(self, root, pkg):
        src = (root / "packages" / pkg / "src" / "custom" / "analytics.ts").read_text(encoding="utf-8")
        assert cm.exports_name(src, "trackPress")

    @pytest.mark.parametrize("platform", ["web", "lit", "rn"])
    def test_the_stub_exists(self, root, platform):
        assert (root / "generated" / "modules" / platform / "custom" / "analytics.d.ts").exists()
