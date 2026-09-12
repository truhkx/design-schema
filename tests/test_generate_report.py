"""tools/generate.py — a round whose model reply lacks the JSON report gets one more, resumed, request for it."""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

import generate as g

REPORT = '```json\n{"files": ["packages/lit/src/Text.ts"], "gaps": ["Text: guessed the default size"]}\n```'


class FakeRunner:
    """Replies in order; records every prompt and the session it was resumed with."""

    def __init__(self, replies):
        self.replies = list(replies)
        self.calls: list[tuple[str, str | None]] = []

    def run(self, prompt, resume):
        self.calls.append((prompt, resume))
        return self.replies.pop(0), "session-1", 0.01


@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    prompts = tmp_path / "prompts"
    prompts.mkdir()
    (prompts / "Text.lit.md").write_text("spec", encoding="utf-8")
    monkeypatch.setattr(g, "PROMPTS", prompts)
    monkeypatch.setattr(g, "LOCK_DIR", tmp_path)
    monkeypatch.setattr(g, "LEGACY_LOCK", tmp_path / "generate.lock.json")
    monkeypatch.setattr(g, "LOGS", tmp_path / "logs")
    monkeypatch.setattr(g, "GAPS", tmp_path / "gaps")
    monkeypatch.setattr(g, "task_prompt", lambda *a, **k: "task")
    monkeypatch.setattr(g, "fix_prompt", lambda *a, **k: "fix")
    monkeypatch.setattr(g, "custom_snapshot", lambda platform: {})
    monkeypatch.setattr(g, "restore_custom", lambda platform, snap: [])
    monkeypatch.setattr(g, "run_gates", lambda *a, **k: [])

    def make(replies):
        runner = FakeRunner(replies)
        monkeypatch.setattr(g, "CliRunner", lambda model, max_turns: runner)
        return runner

    args = SimpleNamespace(force=False, dry_run=False, model="sonnet", runner="cli", max_turns=1, max_rounds=1, skip=[], extra=[])
    return make, args, tmp_path


class TestMissingReport:
    def test_a_missing_report_is_asked_for_once_and_its_files_reach_the_lock(self, sandbox):
        make, args, tmp = sandbox
        runner = make(["I wrote the component and stories.", "Here you go:\n" + REPORT])
        lock = {}
        assert g.generate_one("Text", "lit", args, lock) is True
        assert len(runner.calls) == 2
        assert runner.calls[1][0] == g.REPORT_NUDGE and runner.calls[1][1] == "session-1", "the nudge resumes the same session"
        assert lock["Text.lit"]["files"] == ["packages/lit/src/Text.ts"]
        gaps = (tmp / "gaps" / "Text.lit.md").read_text(encoding="utf-8")
        assert "Text: guessed the default size" in gaps and "recovered after a second request" in gaps
        assert g.NO_REPORT not in gaps

    def test_a_reply_with_the_report_is_not_nudged(self, sandbox):
        make, args, tmp = sandbox
        runner = make(["Done.\n" + REPORT])
        g.generate_one("Text", "lit", args, {})
        assert len(runner.calls) == 1

    def test_a_second_miss_keeps_the_original_gap_and_no_files(self, sandbox):
        make, args, tmp = sandbox
        runner = make(["no report", "still no report"])
        lock = {}
        g.generate_one("Text", "lit", args, lock)
        assert len(runner.calls) == 2
        assert lock["Text.lit"]["files"] == []
        assert g.NO_REPORT in (tmp / "gaps" / "Text.lit.md").read_text(encoding="utf-8")

    def test_the_api_runner_is_not_nudged(self, sandbox, monkeypatch):
        make, args, tmp = sandbox
        runner = make(["no report"])
        monkeypatch.setattr(g, "ApiRunner", lambda model, platform: runner)
        args.runner = "api"
        g.generate_one("Text", "lit", args, {})
        assert len(runner.calls) == 1, "no session to resume"

    def test_the_nudge_cost_is_counted(self, sandbox):
        make, args, tmp = sandbox
        make(["no report", REPORT])
        lock = {}
        g.generate_one("Text", "lit", args, lock)
        assert lock["Text.lit"]["costUsd"] == pytest.approx(0.02)
