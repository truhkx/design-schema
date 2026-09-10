"""tools/gap_digest.py — the between-phases summary of what the generator guessed."""
from __future__ import annotations

import json

import pytest

import gap_digest as gd


BUTTON_WEB = """# Gaps reported while generating Button for web

## 2026-09-10 10:00 — round 1

- Button: the spec does not say whether `loading` disables the button; assumed it does.
- Button: pre-existing bug in FormContext typing, worked around with a cast.
- Button: typecheck could not run (no node_modules), gate skipped.
- Button: no changes were needed to index.ts.

## 2026-09-10 10:20 — round 2

- Button: the spec does not say whether `loading` disables the button; assumed it does.
- Button: chose `aria-busy` for the loading state.
"""

BUTTON_RN = """# Gaps reported while generating Button for rn

## 2026-09-10 09:00 — round 1

- Button: no native equivalent of `type=submit`; ambiguous whether to emit onPress only.
"""


@pytest.fixture
def folder(tmp_path):
    gaps = tmp_path / "gaps"
    gaps.mkdir()
    (gaps / "Button.web.md").write_text(BUTTON_WEB, encoding="utf-8")
    (gaps / "Button.rn.md").write_text(BUTTON_RN, encoding="utf-8")
    (gaps / "Alert.web.md").write_text("# Gaps\n\n## 2026-09-10 11:00 — round 1\n\n- Alert: permission denied writing the story.\n", encoding="utf-8")
    (gaps / "SUMMARY.md").write_text("old digest — must be ignored as input", encoding="utf-8")
    (tmp_path / "generate.lock.web.json").write_text(json.dumps({
        "Button.web": {"hash": "abc", "gates": {"parse": True, "typecheck": False, "tests": False}},
        "Alert.web": {"hash": "def", "gates": {"parse": True, "typecheck": True}},
    }), encoding="utf-8")
    (tmp_path / "generate.lock.rn.json").write_text(json.dumps({
        "Button.rn": {"hash": None, "gates": {"literals": False}},
    }), encoding="utf-8")
    return tmp_path


class TestClassify:
    @pytest.mark.parametrize("line,cat", [
        ("the spec does not say what happens", "DOC"),
        ("value is unspecified in the doc", "DOC"),
        ("ambiguous whether X", "DOC"),
        ("chose aria-busy", "DOC"),
        ("assumed the default", "DOC"),
        ("not stated anywhere", "DOC"),
        ("pre-existing bug in the context", "CODE"),
        ("the helper already existed", "CODE"),
        ("permission denied for Bash", "TOOLING"),
        ("typecheck could not run", "TOOLING"),
        ("no node_modules present", "TOOLING"),
        ("no changes were needed", "NOISE"),
        ("something with no keyword at all", "DOC"),
    ])
    def test_keywords_decide_the_category(self, line, cat):
        assert gd.classify(line, set()) == cat

    def test_a_repeat_in_the_same_file_is_noise_whatever_it_says(self):
        seen: set[str] = set()
        assert gd.classify("the spec does not say X", seen) == "DOC"
        assert gd.classify("The spec does  not say X ", seen) == "NOISE"

    def test_tooling_wins_over_doc_words_in_the_same_line(self):
        assert gd.classify("typecheck could not run, so I assumed it passes", set()) == "TOOLING"


class TestParseGapFile:
    def test_rounds_newest_first_with_classified_lines(self, folder):
        g = gd.parse_gap_file(folder / "gaps" / "Button.web.md")
        assert g["component"] == "Button" and g["platform"] == "web"
        assert [r["round"] for r in g["rounds"]] == [2, 1]
        cats = [c for c, _ in g["rounds"][0]["lines"]]
        assert cats == ["NOISE", "DOC"], "the repeat of round 1's first line is noise; the new choice is a doc gap"
        first = dict((t, c) for c, t in g["rounds"][1]["lines"])
        assert first["Button: pre-existing bug in FormContext typing, worked around with a cast."] == "CODE"
        assert first["Button: typecheck could not run (no node_modules), gate skipped."] == "TOOLING"
        assert first["Button: no changes were needed to index.ts."] == "NOISE"


class TestFailedGates:
    def test_reads_every_lockfile_and_lists_only_false_gates(self, folder):
        assert gd.failed_gates(folder) == [("Button.rn", ["literals"]), ("Button.web", ["tests", "typecheck"])]


class TestDigest:
    def test_shape(self, folder):
        text = gd.build(folder / "gaps", folder, phase="Core", now="2026-09-10T12:00")
        assert text.startswith("# Gap digest — phase Core")
        assert text.index("## Alert") < text.index("## Button"), "one section per component, sorted"
        button = text[text.index("## Button"):text.index("## Totals")]
        assert "Doc: `site/src/content/docs/components/button.md`" in button
        # newest round first, across platforms
        heads = [ln for ln in button.splitlines() if ln.startswith("### ")]
        assert heads == ["### 2026-09-10 10:20 — web round 2", "### 2026-09-10 10:00 — web round 1", "### 2026-09-10 09:00 — rn round 1"]
        round1 = button[button.index("### 2026-09-10 10:00"):button.index("### 2026-09-10 09:00")]
        order = [ln.split("**")[1] for ln in round1.splitlines() if ln.startswith("- **")]
        assert order == ["DOC", "CODE", "TOOLING"], "DOC first, then CODE, then TOOLING"
        assert "→ `site/src/content/docs/components/button.md`" in round1
        assert "NOISE: 1 repeated or empty line(s) collapsed" in round1
        assert "no changes were needed" not in round1, "noise lines are collapsed, not listed"

    def test_checklist_of_failed_targets(self, folder):
        text = gd.build(folder / "gaps", folder)
        tail = text[text.index("## Gates to fix"):]
        assert "- [ ] Button.rn — literals" in tail and "- [ ] Button.web — tests, typecheck" in tail
        assert "Alert.web" not in tail

    def test_no_phase_and_no_failures(self, tmp_path):
        (tmp_path / "gaps").mkdir()
        text = gd.build(tmp_path / "gaps", tmp_path, now="x")
        assert text.startswith("# Gap digest\n") and "- none: every recorded target passed its gates" in text

    def test_the_old_summary_is_not_read_as_input(self, folder):
        text = gd.build(folder / "gaps", folder)
        assert "old digest" not in text and "## SUMMARY" not in text

    def test_main_writes_the_summary(self, folder, monkeypatch, capsys):
        monkeypatch.setattr(gd, "GAPS", folder / "gaps")
        monkeypatch.setattr(gd, "LOCK_DIR", folder)
        monkeypatch.setattr(gd, "ROOT", folder)
        monkeypatch.setattr("sys.argv", ["gap_digest.py", "--phase", "Core"])
        assert gd.main() == 0
        out = (folder / "gaps" / "SUMMARY.md").read_text(encoding="utf-8")
        assert out.startswith("# Gap digest — phase Core")
        assert "DOC line(s), 2 failed target(s)" in capsys.readouterr().out
