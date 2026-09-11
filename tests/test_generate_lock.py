"""tools/generate.py — one lockfile per platform, so three generators can run at once."""
from __future__ import annotations

import json

import pytest

import generate as g


@pytest.fixture
def lock_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(g, "LOCK_DIR", tmp_path)
    monkeypatch.setattr(g, "LEGACY_LOCK", tmp_path / "generate.lock.json")
    monkeypatch.setattr(g, "LOGS", tmp_path / "logs")
    return tmp_path


def entry(h: str) -> dict:
    return {"hash": h, "runner": "test"}


class TestSaveLock:
    def test_each_platform_writes_only_its_own_file(self, lock_dir):
        g.save_lock({"Button.web": entry("aaa"), "Button.rn": entry("bbb")}, "web")
        assert json.loads((lock_dir / "generate.lock.web.json").read_text()) == {"Button.web": entry("aaa")}
        assert not (lock_dir / "generate.lock.rn.json").exists()

    def test_alternating_saves_from_two_platforms_lose_nothing(self, lock_dir):
        # Two processes, each with its own stale in-memory copy of the merged lock.
        web = g.load_lock()
        rn = g.load_lock()
        web["Button.web"] = entry("w1")
        g.save_lock(web, "web")
        rn["Button.rn"] = entry("r1")
        g.save_lock(rn, "rn")
        web["Input.web"] = entry("w2")
        g.save_lock(web, "web")
        rn["Input.rn"] = entry("r2")
        g.save_lock(rn, "rn")
        merged = g.load_lock()
        assert merged == {"Button.web": entry("w1"), "Input.web": entry("w2"), "Button.rn": entry("r1"), "Input.rn": entry("r2")}

    def test_a_stale_in_memory_copy_does_not_drop_a_newer_entry_on_disk(self, lock_dir):
        g.save_lock({"Button.web": entry("first")}, "web")
        stale = {}  # a process that loaded before Button.web existed
        stale["Input.web"] = entry("x")
        g.save_lock(stale, "web")
        assert set(g.load_lock()) == {"Button.web", "Input.web"}

    def test_writes_are_atomic(self, lock_dir):
        g.save_lock({"Button.web": entry("a")}, "web")
        assert not list(lock_dir.glob("*.tmp"))


class TestLoadLock:
    def test_merges_every_platform_file(self, lock_dir):
        for platform, h in (("web", "w"), ("lit", "l"), ("rn", "r")):
            g._write_json(g.lock_path(platform), {f"Button.{platform}": entry(h)})
        assert set(g.load_lock()) == {"Button.web", "Button.lit", "Button.rn"}

    def test_empty_when_nothing_exists(self, lock_dir):
        assert g.load_lock() == {}


class TestMigration:
    def test_the_legacy_file_is_split_and_removed(self, lock_dir):
        (lock_dir / "generate.lock.json").write_text(json.dumps({
            "Button.web": entry("w"), "Button.lit": entry("l"), "Button.rn": entry("r")}), encoding="utf-8")
        lock = g.load_lock()
        assert set(lock) == {"Button.web", "Button.lit", "Button.rn"}
        assert not (lock_dir / "generate.lock.json").exists()
        for platform in ("web", "lit", "rn"):
            assert json.loads(g.lock_path(platform).read_text()) == {f"Button.{platform}": entry(platform[0])}

    def test_per_platform_entries_win_over_legacy_ones(self, lock_dir):
        (lock_dir / "generate.lock.json").write_text(json.dumps({"Button.web": entry("old")}), encoding="utf-8")
        g._write_json(g.lock_path("web"), {"Button.web": entry("new")})
        assert g.load_lock()["Button.web"] == entry("new")

    def test_the_legacy_file_is_kept_while_a_generator_run_is_active(self, lock_dir, capsys):
        (lock_dir / "logs").mkdir()
        (lock_dir / "logs" / "tier2.log").write_text("== tier2 ==\nround 1: model", encoding="utf-8")
        (lock_dir / "generate.lock.json").write_text(json.dumps({"Button.rn": entry("r")}), encoding="utf-8")
        lock = g.load_lock()
        assert lock["Button.rn"] == entry("r")
        assert (lock_dir / "generate.lock.json").exists(), "an older process would rewrite it; merge instead of delete"
        assert "kept" in capsys.readouterr().out
        (lock_dir / "logs" / "tier2.log").write_text("== tier2 ==\n== done ==", encoding="utf-8")
        g.load_lock()
        assert not (lock_dir / "generate.lock.json").exists()


class TestCheck:
    def test_check_reports_over_the_merged_view(self, lock_dir, tmp_path, monkeypatch, capsys):
        prompts = tmp_path / "prompts"
        prompts.mkdir()
        (prompts / "Button.web.md").write_text("web prompt", encoding="utf-8")
        (prompts / "Button.rn.md").write_text("rn prompt", encoding="utf-8")
        monkeypatch.setattr(g, "PROMPTS", prompts)
        g.save_lock({"Button.web": entry(g.sha("web prompt"))}, "web")
        g.save_lock({"Button.rn": entry("stale")}, "rn")
        monkeypatch.setattr("sys.argv", ["generate.py", "--check"])
        assert g.main() == 1
        out = capsys.readouterr().out
        assert "stale  Button.rn" in out and "Button.web" not in out
        assert "1 stale of 2 targets" in out


class TestGapsAreOwnedPerTarget:
    def test_record_gaps_writes_only_the_target_file(self, tmp_path, monkeypatch):
        monkeypatch.setattr(g, "GAPS", tmp_path)
        g.record_gaps("Button", "web", ["a"], 1)
        g.record_gaps("Button", "rn", ["b"], 1)
        assert sorted(p.name for p in tmp_path.iterdir()) == ["Button.rn.md", "Button.web.md"]


class TestAbandonedRunLogs:
    def test_a_stale_log_without_its_end_marker_does_not_count_as_running(self, lock_dir):
        import os, time
        (lock_dir / "logs").mkdir()
        log = lock_dir / "logs" / "tier2.log"
        log.write_text("== tier2 ==\nround 1: model", encoding="utf-8")
        old = time.time() - g.RUNNING_LOG_MAX_AGE_S - 60
        os.utime(log, (old, old))
        assert g._generator_running() is False
        log.write_text("== tier2 ==\nround 2: model", encoding="utf-8")  # touched now
        assert g._generator_running() is True
