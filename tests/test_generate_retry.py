"""tools/generate.py — a runner failure is retried per round, then recorded in the lock, and the phase goes on."""
from __future__ import annotations

import json
import subprocess
import sys
from types import SimpleNamespace

import pytest

import checks
import generate as g

REPORT = '```json\n{"files": ["packages/lit/src/Text.ts"], "gaps": []}\n```'


class FlakyRunner:
    """Replies in order; an exception instance in the list is raised instead of returned."""

    def __init__(self, replies):
        self.replies = list(replies)
        self.calls: list[tuple[str, str | None]] = []

    def run(self, prompt, resume):
        self.calls.append((prompt, resume))
        reply = self.replies.pop(0)
        if isinstance(reply, BaseException):
            raise reply
        return reply, "session-1", 0.01


@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    prompts = tmp_path / "prompts"
    prompts.mkdir()
    (prompts / "Text.lit.md").write_text("spec", encoding="utf-8")
    (prompts / "Other.lit.md").write_text("other spec", encoding="utf-8")
    monkeypatch.setattr(g, "PROMPTS", prompts)
    monkeypatch.setattr(g, "LOCK_DIR", tmp_path)
    monkeypatch.setattr(g, "LEGACY_LOCK", tmp_path / "generate.lock.json")
    monkeypatch.setattr(g, "LOGS", tmp_path / "logs")
    monkeypatch.setattr(g, "GAPS", tmp_path / "gaps")
    monkeypatch.setattr(g, "task_prompt", lambda *a, **k: "task")
    monkeypatch.setattr(g, "fix_prompt", lambda *a, **k: "fix")
    monkeypatch.setattr(g, "custom_snapshot", lambda platform: {})
    monkeypatch.setattr(g, "restore_custom", lambda platform, snap: [])
    monkeypatch.setattr(checks, "run_all", lambda *a, **k: [])
    slept: list[int] = []
    monkeypatch.setattr(g.time, "sleep", slept.append)

    def make(replies):
        runner = FlakyRunner(replies)
        monkeypatch.setattr(g, "CliRunner", lambda model, max_turns: runner)
        return runner

    args = SimpleNamespace(force=False, dry_run=False, model="sonnet", runner="cli", max_turns=1, max_rounds=2, skip=[], extra=[])
    return make, args, slept


class TestRunnerErrors:
    def test_a_runner_that_raises_once_then_succeeds_passes(self, sandbox):
        make, args, slept = sandbox
        runner = make([RuntimeError("claude exited 1: boom"), "Done.\n" + REPORT])
        lock = {}
        assert g.generate_one("Text", "lit", args, lock) is True
        assert len(runner.calls) == 2 and runner.calls[0][0] == runner.calls[1][0] == "task", "the same round is retried"
        assert slept == [30]
        assert lock["Text.lit"]["hash"] == g.sha("spec") and "error" not in lock["Text.lit"]

    def test_a_runner_that_raises_twice_records_the_failure(self, sandbox, capsys):
        make, args, slept = sandbox
        runner = make([RuntimeError("claude exited 1: boom"), RuntimeError("claude exited 1: boom again")])
        lock = {"Text.lit": {"hash": "previous"}}
        assert g.generate_one("Text", "lit", args, lock) is False
        assert len(runner.calls) == 2 and slept == [30]
        entry = lock["Text.lit"]
        assert entry["hash"] is None and entry["lastAttemptHash"] == g.sha("spec")
        assert entry["error"] == "claude exited 1: boom again"
        assert entry["rounds"] == 1 and entry["gates"] == {}
        assert json.loads(g.lock_path("lit").read_text(encoding="utf-8"))["Text.lit"]["error"] == entry["error"]
        assert "? Text.lit: runner error, will retry on the next pass" in capsys.readouterr().out
        assert ("Text", "lit") in g.stale_targets(lock)

    def test_subprocess_errors_count_as_runner_errors(self, sandbox):
        make, args, slept = sandbox
        make([subprocess.TimeoutExpired("claude", 3600), "Done.\n" + REPORT])
        assert g.generate_one("Text", "lit", args, {}) is True
        assert slept == [30]

    def test_a_failed_target_does_not_abort_the_run(self, sandbox, monkeypatch, capsys):
        make, args, slept = sandbox
        runner = make([RuntimeError("dead"), RuntimeError("dead"), "Done.\n" + REPORT])
        monkeypatch.setattr(sys, "argv", ["generate.py", "--platform", "lit", "--component", "Text,Other"])
        assert g.main() == 1, "the phase still reports a failure"
        assert len(runner.calls) == 3, "Other.lit ran after Text.lit gave up"
        lock = g.load_lock()
        assert lock["Text.lit"]["hash"] is None and lock["Other.lit"]["hash"] == g.sha("other spec")
        out = capsys.readouterr().out
        assert "? Text.lit: runner error" in out and "✔ Other.lit" in out

    def test_a_runner_error_in_a_fix_round_keeps_the_earlier_files(self, sandbox, monkeypatch):
        make, args, slept = sandbox
        # The preflight (verbose=False) passes; the gates after generation fail, so a fix round is requested.
        monkeypatch.setattr(checks, "run_all", lambda *a, **k: [] if "verbose" in k else [checks.GateResult("typecheck", False, "nope")])
        monkeypatch.setattr(checks, "failures_as_prompt", lambda results: "failures")
        make(["Done.\n" + REPORT, RuntimeError("dead"), RuntimeError("dead")])
        lock = {}
        assert g.generate_one("Text", "lit", args, lock) is False
        assert lock["Text.lit"]["files"] == ["packages/lit/src/Text.ts"] and lock["Text.lit"]["rounds"] == 2


class TestTransientModelErrors:
    @pytest.mark.parametrize("result", ["", "   ", None, "Rate limit exceeded", "API overloaded", "Error 529", "read ECONNRESET"])
    def test_empty_or_api_messages_are_transient(self, result):
        assert g.ModelError(result).transient is True

    def test_a_real_model_error_is_not(self):
        assert g.ModelError("Reached max turns without finishing").transient is False

    def test_transient_errors_back_off_twice(self, sandbox):
        make, args, slept = sandbox
        runner = make([g.ModelError(""), g.ModelError("rate limit"), "Done.\n" + REPORT])
        assert g.generate_one("Text", "lit", args, {}) is True
        assert len(runner.calls) == 3 and slept == [30, 90]

    def test_a_third_transient_failure_is_recorded(self, sandbox):
        make, args, slept = sandbox
        make([g.ModelError("overloaded")] * 3)
        lock = {}
        assert g.generate_one("Text", "lit", args, lock) is False
        assert slept == [30, 90] and "overloaded" in lock["Text.lit"]["error"]

    def test_a_non_transient_model_error_is_recorded_without_a_retry(self, sandbox):
        make, args, slept = sandbox
        runner = make([g.ModelError("Reached max turns"), "Done.\n" + REPORT])
        lock = {}
        assert g.generate_one("Text", "lit", args, lock) is False
        assert len(runner.calls) == 1 and slept == []
        assert lock["Text.lit"]["error"] == "claude reported an error: Reached max turns"

    def test_a_transient_message_from_the_cli_exit_path_backs_off_too(self, sandbox):
        make, args, slept = sandbox
        make([RuntimeError("claude exited 1: Error: read ECONNRESET"), "Done.\n" + REPORT])
        assert g.generate_one("Text", "lit", args, {}) is True
        assert slept == [30]

    def test_the_cli_runner_raises_a_model_error_on_is_error(self, monkeypatch):
        monkeypatch.setattr(g.shutil, "which", lambda name: "claude")
        monkeypatch.setattr(g.subprocess, "run", lambda *a, **k: SimpleNamespace(
            returncode=0, stdout=json.dumps({"type": "result", "is_error": True, "result": ""}), stderr=""))
        with pytest.raises(g.ModelError) as info:
            g.CliRunner("sonnet", 1).run("task", None)
        assert info.value.transient is True and "(empty result)" in str(info.value)
