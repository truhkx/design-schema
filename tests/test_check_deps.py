"""tools/check_deps.py — the generated packages may not grow runtime dependencies."""
from __future__ import annotations

import json

import pytest

import check_deps as cd


def manifest(**fields) -> dict:
    return {"name": "@design-schema/x", "version": "0.0.1", **fields}


class TestCheckPackage:
    def test_the_allowed_set_passes_for_every_package(self):
        assert cd.check_package("react", manifest(peerDependencies={"react": ">=18", "react-dom": ">=18"})) == []
        assert cd.check_package("lit", manifest(dependencies={"lit": "^3.2.0"}, devDependencies={"vitest": "^3"})) == []
        assert cd.check_package("rn", manifest(dependencies={"react-native-svg": "15.15.5"},
                                               peerDependencies={"react": ">=18", "react-native": ">=0.74"})) == []
        assert cd.check_package("tokens", manifest()) == []

    def test_the_tokens_package_is_allowed_everywhere_but_tokens(self):
        for name in ("react", "lit", "rn"):
            assert cd.check_package(name, manifest(dependencies={"@design-schema/tokens": "workspace:*"})) == []
        assert cd.check_package("tokens", manifest(dependencies={"@design-schema/tokens": "workspace:*"}))

    def test_react_native_svg_is_allowed_only_in_rn(self):
        assert cd.check_package("rn", manifest(dependencies={"react-native-svg": "15.15.5"})) == []
        findings = cd.check_package("react", manifest(dependencies={"react-native-svg": "15.15.5"}))
        assert findings == ["packages/react: dependencies has 'react-native-svg', which is not an allowed runtime dependency "
                            "(allowed: @design-schema/tokens, react, react-dom)"]

    @pytest.mark.parametrize("field", cd.RUNTIME_FIELDS)
    def test_every_runtime_field_is_checked(self, field):
        findings = cd.check_package("lit", manifest(**{field: {"lodash": "^4"}}))
        assert len(findings) == 1 and f"{field} has 'lodash'" in findings[0]

    def test_dev_dependencies_are_free(self):
        assert cd.check_package("rn", manifest(devDependencies={"jest": "^29", "lodash": "^4"})) == []

    def test_findings_are_sorted_and_name_the_package(self):
        findings = cd.check_package("react", manifest(dependencies={"zod": "^3", "axios": "^1"}))
        assert [f.split("'")[1] for f in findings] == ["axios", "zod"]
        assert all(f.startswith("packages/react: ") for f in findings)

    def test_unknown_packages_are_not_checked(self):
        assert cd.check_package("site", manifest(dependencies={"astro": "^5"})) == []


class TestCheckAll:
    @pytest.fixture
    def packages(self, tmp_path):
        def write(name, **fields):
            d = tmp_path / name
            d.mkdir(parents=True, exist_ok=True)
            (d / "package.json").write_text(json.dumps(manifest(**fields)), encoding="utf-8")
        write("react", peerDependencies={"react": ">=18"})
        write("lit", dependencies={"lit": "^3"})
        write("rn", dependencies={"react-native-svg": "15.15.5", "lodash": "^4"})
        write("site", dependencies={"astro": "^5"})
        return tmp_path

    def test_walks_only_the_generated_packages(self, packages):
        findings = cd.check_all(packages)
        assert len(findings) == 1 and "packages/rn: dependencies has 'lodash'" in findings[0]

    def test_only_narrows_to_one_package(self, packages):
        assert cd.check_all(packages, only="rn")
        assert cd.check_all(packages, only="lit") == []

    def test_a_missing_package_is_skipped(self, tmp_path):
        assert cd.check_all(tmp_path) == []

    def test_main_reports_and_exits_nonzero_on_a_finding(self, packages, monkeypatch, capsys):
        monkeypatch.setattr(cd, "PACKAGES", packages)
        monkeypatch.setattr("sys.argv", ["check_deps.py"])
        assert cd.main() == 1
        out = capsys.readouterr().out
        assert "✖ packages/rn: dependencies has 'lodash'" in out and "1 finding(s)" in out
        monkeypatch.setattr("sys.argv", ["check_deps.py", "--platform", "web"])
        assert cd.main() == 0


class TestTheRepository:
    def test_the_real_packages_pass(self):
        assert cd.check_all() == []
