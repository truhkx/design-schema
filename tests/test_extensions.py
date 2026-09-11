"""Extensions: tools/check_modules.py gates the hand-written modules an extension declares. The parser half —
merging site/src/content/docs/extensions/*.md into components and writing the module stubs — is tools/parse.ts,
tested in tools/__tests__/extensions.test.ts. See process/extending-components.md."""
from __future__ import annotations

import json

import pytest

import check_modules as cm


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
        cj = root / "generated" / "components.json"
        if not cj.exists():
            pytest.skip("run tools/parse.ts first")
        entries = json.loads(cj.read_text(encoding="utf-8"))
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
