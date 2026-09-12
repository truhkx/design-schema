"""
generate.py — turn a component doc into platform code, with the model in one place and
deterministic gates everywhere else.

    python3 tools/generate.py --platform web --component Icon           # one component, one platform
    python3 tools/generate.py --platform web,lit,rn --component Icon    # three platforms, sequentially
    python3 tools/generate.py --stale                                   # everything whose prompt changed
    python3 tools/generate.py --check                                   # list stale entries, generate nothing
    python3 tools/generate.py ... --runner api                          # Messages API instead of Claude Code
    python3 tools/generate.py ... --skip typecheck                      # when node_modules is not available

How it works
  1. The prompt is generated/prompts/<Name>.<platform>.md (tools/parse.ts builds it from the doc).
     Its sha256 is the identity of the spec. generated/generate.lock.<platform>.json remembers the hash
     that produced the committed code, so generation only runs when the doc changed.
  2. Round 1: the model gets the prompt plus a short task wrapper (read these files for
     conventions, write these files, report gaps as JSON). Runner `cli` drives Claude Code
     headless (`claude -p`, tools enabled, cwd = repo); runner `api` calls the Messages API and
     expects files back in a fenced format, which this script writes.
  3. Gates (tools/checks.ts): parse, contrast, literals, typecheck. Failures are handed back to
     the model verbatim as a fix round, up to --max-rounds. The model never sees the gate code.
  4. Gaps the model reported land in generated/gaps/<Name>.<platform>.md for the doc pass.
     The lockfile records hash, files, rounds, gate results and cost.

Generation is a code-mod, not a compile step: run it, review the diff, commit. The deploy
build never calls a model; it runs the same gates on committed code.
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROMPTS = ROOT / "generated" / "prompts"
LOCK_DIR = ROOT / "generated"
LEGACY_LOCK = LOCK_DIR / "generate.lock.json"  # the single file used before the per-platform split; migrated on first load
LOGS = ROOT / "logs"
GAPS = ROOT / "generated" / "gaps"
PKG = {"web": "react", "lit": "lit", "rn": "rn"}
PLATFORM_LABEL = {"web": "React (web)", "lit": "Lit web components", "rn": "React Native"}
DEFAULT_MODEL = os.environ.get("DS_MODEL", "sonnet")  # a precise spec + hard gates is where a cheaper model is enough; --model fable for the hard ones

CONVENTIONS = ROOT / "prompts" / "conventions"  # one-page digest per platform, inlined into the task prompt

# Files the model MAY open if the digest leaves a detail out. Reading all of these every run was ~40% of
# the tokens of a generation, so the digest replaces them and these are the fallback for the api runner.
CONVENTION_FILES = {
    "web": ["packages/react/src/index.ts", "packages/react/src/Button.tsx", "packages/react/src/Button.css",
            "packages/react/src/Button.stories.tsx", "packages/react/src/Input.tsx", "packages/react/src/FormContext.ts",
            "packages/react/src/css.d.ts", "packages/tokens/dist/calm-precise/css/tokens.css"],
    "lit": ["packages/lit/src/index.ts", "packages/lit/src/Button.ts", "packages/lit/src/Button.stories.ts",
            "packages/lit/src/Input.ts", "packages/lit/src/Form.ts", "packages/lit/tsconfig.json",
            "packages/tokens/dist/calm-precise/css/tokens.css"],
    "rn": ["packages/rn/src/index.ts", "packages/rn/src/Button.tsx", "packages/rn/src/Button.stories.tsx",
           "packages/rn/src/Input.tsx", "packages/rn/src/FormContext.ts", "packages/rn/src/theme.tsx",
           "packages/rn/src/decorators.tsx", "packages/tokens/dist/calm-precise/rn/tokens.light.d.ts"],
}

REPORT_INSTRUCTIONS = """
## Reporting (mandatory)

When the files are written, end your reply with exactly one fenced block:

```json
{"files": ["packages/<pkg>/src/<Name>.<ext>", "..."], "gaps": ["<component>: <what was ambiguous, missing or contradictory, and what you chose>", "..."]}
```

`gaps` is the most valuable output: every place the spec made you guess. Be specific. An empty list means the doc was complete.
Do not edit anything under site/, schema/, prompts/ or generated/ — the docs are fixed from your gap list by a separate pass.
Do not add dependencies. Do not write README files.
"""


@dataclass
class GateResult:
    name: str
    ok: bool
    output: str


def run_gates(platform: str, skip: set[str] | None = None, verbose: bool = True, extra: set[str] | None = None) -> list[GateResult]:
    """The gates, run by tools/checks.ts.

    The gate table lives in TypeScript now (job 303); `--json` hands back one object per gate so this
    runner can print and hand back failures exactly as the in-process Python version did. Step 5 of
    process/typescript-and-currency.md ports this file and the bridge goes with it.
    """
    node = shutil.which("node") or shutil.which("node.exe") or "node"
    argv = [node, "--import", "tsx", str(ROOT / "tools" / "checks.ts"), "--platform", platform, "--json"]
    for name in sorted(skip or set()):
        argv += ["--skip", name]
    for name in sorted(extra or set()):
        argv += ["--with", name]
    p = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       env={**os.environ, "FORCE_COLOR": "0"})
    try:
        results = [GateResult(r["name"], r["ok"], r["output"]) for r in json.loads(p.stdout)]
    except (json.JSONDecodeError, KeyError, TypeError):  # the gate runner itself failed: one failing gate says so
        results = [GateResult("checks", False, ((p.stdout or "") + (p.stderr or "")).strip() or "tools/checks.ts produced no output")]
    if verbose:
        for r in results:
            tail = r.output.splitlines()[-1] if r.output else ""
            print(f"  {'✔' if r.ok else '✖'} {r.name:<10} {tail[:110]}")
    return results


def failures_as_prompt(results: list[GateResult], limit: int = 6000) -> str:
    """The text handed back to the model: only failing gates, trimmed."""
    parts = []
    for r in results:
        if r.ok:
            continue
        out = r.output
        if len(out) > limit:
            out = out[-limit:]
        parts.append(f"### Gate `{r.name}` FAILED\n```\n{out}\n```")
    return "\n\n".join(parts)


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def lock_path(platform: str) -> Path:
    """One lockfile per platform, so three generators (one per platform) never write the same file."""
    return LOCK_DIR / f"generate.lock.{platform}.json"


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def _write_json(path: Path, data: dict) -> None:
    """Atomic: write beside the target, then replace, so a reader never sees a half-written file."""
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(dict(sorted(data.items())), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


RUNNING_LOG_MAX_AGE_S = 30 * 60  # a log without its end marker that has not moved in half an hour was abandoned, not paused


def _generator_running() -> bool:
    """True while another generator run appears to be in progress: a tier2.ps1 / regen.ps1 log without its end
    marker that was written to recently. A killed window leaves a log without the marker forever; its age tells."""
    import time

    for log in list(LOGS.glob("tier2.log")) + list(LOGS.glob("regen*.log")):
        try:
            text = log.read_text(encoding="utf-8", errors="replace")
            age = time.time() - log.stat().st_mtime
        except OSError:
            continue
        if "== done ==" not in text and "queue complete" not in text and age < RUNNING_LOG_MAX_AGE_S:
            return True
    return False


def migrate_legacy_lock() -> None:
    """Split generated/generate.lock.json into the per-platform files. Entries already in a per-platform
    file win (they were written by the new code). The legacy file is deleted afterwards unless another
    generator run still appears to be active — an older process would rewrite it at its next save — in
    which case it is left in place and merged on every load until the run ends."""
    if not LEGACY_LOCK.exists():
        return
    legacy = _read_json(LEGACY_LOCK)
    for platform in PKG:
        current = _read_json(lock_path(platform))
        merged = {**{k: v for k, v in legacy.items() if k.endswith(f".{platform}")}, **current}
        if merged != current or not lock_path(platform).exists():
            _write_json(lock_path(platform), merged)
    if _generator_running():
        print(f"  note: {LEGACY_LOCK.name} kept — a generator run is still active; it is merged on load and removed on the next run after it finishes")
        return
    LEGACY_LOCK.unlink()


def load_lock() -> dict:
    """The merged view over every platform's lockfile (plus the legacy file while it still exists)."""
    migrate_legacy_lock()
    lock: dict = {}
    if LEGACY_LOCK.exists():
        lock.update(_read_json(LEGACY_LOCK))
    for platform in PKG:
        lock.update(_read_json(lock_path(platform)))
    return lock


def save_lock(lock: dict, platform: str) -> None:
    """Write only this platform's entries, merged over what is on disk for it, so concurrent runs of the
    other platforms are never overwritten and a stale in-memory copy never drops a newer entry."""
    on_disk = _read_json(lock_path(platform))
    mine = {k: v for k, v in lock.items() if k.endswith(f".{platform}")}
    _write_json(lock_path(platform), {**on_disk, **mine})


def prompt_path(name: str, platform: str) -> Path:
    return PROMPTS / f"{name}.{platform}.md"


def all_targets() -> list[tuple[str, str]]:
    out = []
    for p in sorted(PROMPTS.glob("*.md")):
        if p.name.startswith("theme."):
            continue
        name, platform = p.stem.rsplit(".", 1)  # `Pattern.<Name>.<platform>` keeps its dot in the name
        if platform in PKG:
            out.append((name, platform))
    return out


def stale_targets(lock: dict) -> list[tuple[str, str]]:
    return [(n, p) for n, p in all_targets() if lock.get(f"{n}.{p}", {}).get("hash") != sha(prompt_path(n, p).read_text(encoding="utf-8"))]


# ---------------------------------------------------------------- task prompts

def feel_only(skill: str) -> str:
    """The generator needs the theme's judgment sections, not its resolved token table (the tokens file is on disk
    and the literal gate enforces names). Keep from 'How to make decisions' up to 'When to use'."""
    start = skill.find("## How to make decisions")
    end = skill.find("## When to use")
    if start == -1:
        return skill
    return skill[start : end if end > start else None].strip()


def task_prompt(name: str, platform: str) -> str:
    spec = prompt_path(name, platform).read_text(encoding="utf-8")
    theme = (PROMPTS / "theme.calm-precise.md").read_text(encoding="utf-8") if (PROMPTS / "theme.calm-precise.md").exists() else ""
    theme = feel_only(theme)
    digest = (CONVENTIONS / f"{platform}.md").read_text(encoding="utf-8") if (CONVENTIONS / f"{platform}.md").exists() else ""
    exemplar = CONVENTION_FILES[platform][1]
    if name.startswith("Pattern."):
        short = name.split(".", 1)[1]
        task = (f"Then generate the pattern page **{short}** from the specification below into `packages/{PKG[platform]}/demo/` "
                f"(the page and its `Patterns/{short}` story). Do not touch `src/index.ts`; compose only the package's existing "
                f"components and never re-implement or restyle them.")
    else:
        task = (f"Then generate **{name}** from the specification below. Also add the export(s) to the package's `index.ts` in its "
                f"existing style. If the spec's Related section names components that exist in the package, compose them; never "
                f"re-implement or restyle them.")
    return f"""You are the {PLATFORM_LABEL[platform]} generator for the Design Schema repository (cwd is the repo root).

The package conventions are summarised below; follow them exactly. Do not read the whole package — open `{CONVENTION_FILES[platform][0]}` to add the export, and at most one existing component (`{exemplar}` or the one closest to what you are writing) if the digest leaves a detail out.

{digest}

{task}

{REPORT_INSTRUCTIONS}

---

{spec}

---

## Theme feel (for judgment calls the spec leaves open)

{theme}
"""


def fix_prompt(name: str, platform: str, failures: str, round_no: int) -> str:
    return f"""Round {round_no}: the build gates rejected the generated **{name}** for {PLATFORM_LABEL[platform]}. Fix the code so every gate passes. Do not weaken the spec to make a gate pass; if a gate and the spec conflict, fix the code to the spec and report the conflict as a gap.

{failures}

Rules reminder: tokens only (no hex/px/ms/font literals — mark a sanctioned one with `literal-ok: <reason>`), no new dependencies, do not edit docs.
{REPORT_INSTRUCTIONS}"""


# ---------------------------------------------------------------- runners

# A runner failure is the API or the CLI, not the spec, so it never counts against the target's rounds. An API
# hiccup (`is_error` with an empty result, a rate limit, an overload, a dropped connection) is retried with a
# backoff; any other runner error gets one retry; an error the model itself reported is recorded straight away.
TRANSIENT = re.compile(r"rate.?limit|overloaded|\b529\b|ECONNRESET", re.I)
TRANSIENT_BACKOFF_S = (30, 90)
RUNNER_RETRY_S = (30,)
RUNNER_ERRORS = (RuntimeError, subprocess.SubprocessError, OSError)


class ModelError(RuntimeError):
    """`claude -p` returned is_error. Empty text or a rate-limit / overload message is the API failing, not the task."""

    def __init__(self, result: str):
        result = result or ""
        self.transient = not result.strip() or bool(TRANSIENT.search(result))
        super().__init__(f"claude reported an error: {result.strip()[:500] or '(empty result)'}")


def retry_schedule(exc: BaseException) -> tuple[int, ...]:
    """Seconds to wait before each further attempt at the same round; empty means record and move on."""
    if isinstance(exc, ModelError):
        return TRANSIENT_BACKOFF_S if exc.transient else ()
    return TRANSIENT_BACKOFF_S if TRANSIENT.search(str(exc)) else RUNNER_RETRY_S


def run_with_retry(runner: "Runner", prompt: str, resume: str | None, key: str, round_no: int) -> tuple[str, str | None, float]:
    """One model call, repeated on the schedule its error earns. Re-raises the last error once that is exhausted."""
    attempt = 0
    while True:
        try:
            return runner.run(prompt, resume)
        except RUNNER_ERRORS as e:
            delays = retry_schedule(e)
            if attempt >= len(delays):
                raise
            wait = delays[attempt]
            attempt += 1
            print(f"  round {round_no}: runner error — {error_line(e)} — retrying {key} in {wait} s ({attempt}/{len(delays)})", flush=True)
            time.sleep(wait)


def error_line(exc: BaseException) -> str:
    text = str(exc).strip()
    return (text.splitlines()[0][:300] if text else type(exc).__name__)


class Runner:
    def run(self, prompt: str, resume: str | None) -> tuple[str, str | None, float]:
        """→ (result_text, session_id, cost_usd)"""
        raise NotImplementedError


class CliRunner(Runner):
    """Claude Code headless. Tools on, edits auto-accepted, cwd = repo root."""

    def __init__(self, model: str, max_turns: int):
        self.model, self.max_turns = model, max_turns
        self.exe = shutil.which("claude") or shutil.which("claude.cmd")
        if not self.exe:
            sys.exit("✖ `claude` CLI not found on PATH — install Claude Code, or use --runner api")

    def run(self, prompt, resume):
        argv = [self.exe, "-p", "--output-format", "json", "--permission-mode", "acceptEdits",
                "--model", self.model, "--max-turns", str(self.max_turns),
                "--allowedTools", "Read,Write,Edit,MultiEdit,Glob,Grep,Bash(pnpm *),Bash(npm run *),Bash(npx tsc *),Bash(npx vitest *),Bash(npx jest *),Bash(npx eslint *),Bash(node tools/*),Bash(python3 *),Bash(python *),Bash(py *),Bash(grep *),Bash(find *),Bash(cat *),Bash(head *),Bash(tail *),Bash(awk *),Bash(which *),Bash(where *),PowerShell(pnpm *),PowerShell(npm run *),PowerShell(npx *),PowerShell(py *),PowerShell(node tools/*),mcp__design-schema__*"]
        if resume:
            argv += ["--resume", resume]
        env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
        p = subprocess.run(argv, input=prompt, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           env=env, timeout=3600)
        if p.returncode != 0 and not p.stdout.strip():
            raise RuntimeError(f"claude exited {p.returncode}: {p.stderr[-2000:]}")
        try:
            data = json.loads(p.stdout.strip().splitlines()[-1])
        except json.JSONDecodeError:
            raise RuntimeError(f"unexpected claude output: {p.stdout[-2000:]}\n{p.stderr[-1000:]}")
        if data.get("is_error"):
            raise ModelError(str(data.get("result") or ""))
        if data.get("permission_denials"):
            print(f"  ! {len(data['permission_denials'])} tool call(s) were denied — widen --allowedTools if the model needed them:")
            for d in data["permission_denials"][:8]:
                inp = d.get("tool_input") or {}
                what = inp.get("command") or inp.get("file_path") or inp.get("pattern") or json.dumps(inp)[:120]
                print(f"      {d.get('tool_name')}: {str(what)[:140]}")
        if data.get("terminal_reason") not in (None, "success", "end_turn"):
            print(f"  ! run ended with terminal_reason={data.get('terminal_reason')} after {data.get('num_turns')} turns")
        return data.get("result", ""), data.get("session_id"), float(data.get("total_cost_usd") or 0)


FILE_BLOCK = re.compile(r"^===== FILE: (.+?) =====\n(.*?)(?=^===== (?:FILE|END) )", re.S | re.M)


class ApiRunner(Runner):
    """Anthropic Messages API. No tools: convention files are inlined and files come back in a fenced format."""

    def __init__(self, model: str, platform: str):
        try:
            import anthropic  # noqa: F401
        except ImportError:
            sys.exit("✖ pip install anthropic  (or use --runner cli)")
        self.model, self.platform = model, platform
        self.messages: list[dict] = []

    def run(self, prompt, resume):
        import anthropic
        client = anthropic.Anthropic()
        if not self.messages:  # first round: inline the conventions, since there is no Read tool
            ctx = []
            for f in CONVENTION_FILES[self.platform]:
                fp = ROOT / f
                if fp.exists():
                    ctx.append(f"===== {f} =====\n{fp.read_text(encoding='utf-8')[:12000]}")
            prompt = ("Repository files for conventions (read-only):\n\n" + "\n\n".join(ctx) + "\n\n" + prompt)
        prompt += ("\n\n## Output format (no tools available)\nFor every file, emit:\n===== FILE: packages/<pkg>/src/<Name>.<ext> =====\n<full file content>\n"
                   "and after the last file a line `===== END =====`. For `index.ts`, emit the complete new file. Then the JSON report block.")
        self.messages.append({"role": "user", "content": prompt})
        r = client.messages.create(model=self.model, max_tokens=32000, messages=self.messages,
                                   system="You write production TypeScript for a design system. Follow the specification exactly.")
        text = "".join(getattr(b, "text", "") for b in r.content)
        self.messages.append({"role": "assistant", "content": text})
        written = 0
        for m in FILE_BLOCK.finditer(text + "\n===== END =====\n"):
            rel, body = m.group(1).strip(), m.group(2)
            if not rel.startswith("packages/"):
                continue
            (ROOT / rel).parent.mkdir(parents=True, exist_ok=True)
            (ROOT / rel).write_text(body.rstrip("\n") + "\n", encoding="utf-8")
            written += 1
        print(f"  api runner wrote {written} file(s)")
        cost = 0.0
        return text, None, cost


# ---------------------------------------------------------------- report parsing

REPORT = re.compile(r"```json\s*(\{.*?\})\s*```", re.S)


NO_REPORT = "(model did not return the JSON report block)"
REPORT_NUDGE = """Your reply did not end with the JSON report block. Do not change any file. Reply with only that block now:

```json
{"files": ["<every file you wrote or edited, repo-relative>"], "gaps": ["<every place the spec made you guess>"]}
```"""


def parse_report(text: str) -> dict:
    blocks = REPORT.findall(text)
    for b in reversed(blocks):
        try:
            d = json.loads(b)
            if isinstance(d, dict) and "files" in d:
                return {"files": [str(f) for f in d.get("files", [])], "gaps": [str(g) for g in d.get("gaps", [])]}
        except json.JSONDecodeError:
            continue
    return {"files": [], "gaps": [NO_REPORT]}


def custom_dir(platform: str) -> Path:
    return ROOT / "packages" / PKG[platform] / "src" / "custom"


def custom_snapshot(platform: str) -> dict[str, bytes]:
    """Every file under packages/<pkg>/src/custom/ with its content. The folder is hand-written (extension modules);
    the model may import from it but never write there, and allowedTools cannot express a deny, so the run is
    checked against this snapshot afterwards."""
    d = custom_dir(platform)
    if not d.exists():
        return {}
    return {f.relative_to(d).as_posix(): f.read_bytes() for f in sorted(d.rglob("*")) if f.is_file()}


def restore_custom(platform: str, snapshot: dict[str, bytes]) -> list[str]:
    """Put custom/ back exactly as snapshotted; returns the files that had been changed, added or removed."""
    d = custom_dir(platform)
    now = custom_snapshot(platform)
    changed = sorted(set(k for k in set(snapshot) | set(now) if snapshot.get(k) != now.get(k)))
    for rel in changed:
        f = d / rel
        if rel in snapshot:
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(snapshot[rel])
        elif f.exists():
            f.unlink()
    return changed


def record_gaps(name: str, platform: str, gaps: list[str], round_no: int) -> None:
    if not gaps:
        return
    GAPS.mkdir(parents=True, exist_ok=True)
    f = GAPS / f"{name}.{platform}.md"
    stamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    body = f"\n## {stamp} — round {round_no}\n\n" + "\n".join(f"- {g}" for g in gaps) + "\n"
    if not f.exists():
        f.write_text(f"# Gaps reported while generating {name} for {platform}\n\nEach entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.\n", encoding="utf-8")
    with f.open("a", encoding="utf-8") as fh:
        fh.write(body)


# ---------------------------------------------------------------- main loop

def generate_one(name: str, platform: str, args, lock: dict) -> bool:
    key = f"{name}.{platform}"
    pp = prompt_path(name, platform)
    if not pp.exists():
        print(f"✖ {key}: no prompt at {pp.relative_to(ROOT)} (run tools/parse.ts)")
        return False
    h = sha(pp.read_text(encoding="utf-8"))
    if not args.force and lock.get(key, {}).get("hash") == h:
        print(f"= {key}: up to date ({h})")
        return True
    print(f"\n== {key}  prompt {h}  model {args.model}  runner {args.runner}")
    if args.dry_run:
        print(task_prompt(name, platform)[:1500] + "\n…")
        return True

    skip = set(args.skip)
    # Preflight: gates that do not depend on the generated code must already pass, or every fix round
    # would be spent on something the model cannot change (a doc elsewhere failing to parse, a contrast
    # pair in another component). Costs nothing; saves the whole run when the docs are the problem.
    pre = [r for r in run_gates(platform, skip | {"typecheck", "literals", "keyboard", "keyboard-run", "axe"}, verbose=False) if not r.ok]
    if pre:
        print(f"  ✖ {key}: preflight failed before any model call — fix the docs and re-run tools/parse.ts:")
        for r in pre:
            print("    " + "\n    ".join(r.output.strip().splitlines()[-6:]))
        return False

    runner: Runner = CliRunner(args.model, args.max_turns) if args.runner == "cli" else ApiRunner(args.model, platform)
    session, cost, files, all_gaps, results = None, 0.0, [], [], []
    prompt = task_prompt(name, platform)
    for round_no in range(1, args.max_rounds + 1):
        print(f"  round {round_no}: model …", flush=True)
        custom_before = custom_snapshot(platform)
        try:
            text, session, c = run_with_retry(runner, prompt, session if args.runner == "cli" else None, key, round_no)
            custom_changed = restore_custom(platform, custom_before)
            cost += c
            rep = parse_report(text)
            if not rep["files"] and NO_REPORT in rep["gaps"] and args.runner == "cli" and session:
                # The model finished without the trailing report (Text.lit did). One cheap resumed turn asks for it, so
                # the files it touched reach the lock; the original gap line stays if the second reply has none either.
                print(f"  round {round_no}: no JSON report — asking once more for it", flush=True)
                text2, session, c2 = run_with_retry(runner, REPORT_NUDGE, session, key, round_no)
                cost += c2
                rep2 = parse_report(text2)
                if rep2["files"] or NO_REPORT not in rep2["gaps"]:
                    rep = {"files": rep2["files"], "gaps": rep2["gaps"] + ["(report recovered after a second request)"]}
        except RUNNER_ERRORS as e:
            # The runner, not the spec, gave up: no hash (stays stale for the next pass), the message in the lock,
            # and on to the next target — one dead API call must not abort the phase.
            restore_custom(platform, custom_before)
            message = error_line(e)
            lock[key] = {
                "hash": None, "lastAttemptHash": h, "error": message,
                "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                "model": args.model, "runner": args.runner, "rounds": round_no, "costUsd": round(cost, 4),
                "files": files, "gaps": len(all_gaps), "gates": {},
            }
            save_lock(lock, platform)
            print(f"  ? {key}: runner error, will retry on the next pass\n    {message}", flush=True)
            return False
        files = sorted(set(files) | set(rep["files"]))  # union across rounds: fix rounds often touch other files
        all_gaps += rep["gaps"]
        record_gaps(name, platform, rep["gaps"], round_no)
        print(f"  round {round_no}: {len(rep['files'])} file(s), {len(rep['gaps'])} gap(s), ${c:.3f}")
        results = run_gates(platform, skip, extra=set(args.extra))
        if custom_changed:
            results.append(GateResult("custom", False,
                "packages/" + PKG[platform] + "/src/custom/ is hand-written and never the generator's to change; these files were "
                "restored: " + ", ".join(custom_changed) + ". Import the modules the Extensions section names and call them where "
                "`wire` says; do not create, edit or copy anything under custom/."))
            print("  ✖ custom     restored " + ", ".join(custom_changed))
        bad = [r for r in results if not r.ok]
        if not bad:
            break
        if round_no == args.max_rounds:
            print(f"  ✖ gates still failing after {round_no} round(s): {', '.join(r.name for r in bad)}")
            break
        prompt = fix_prompt(name, platform, failures_as_prompt(results), round_no + 1)

    ok = all(r.ok for r in results)
    lock[key] = {
        "hash": h if ok else lock.get(key, {}).get("hash"),  # a failed run does not claim the hash → stays stale
        "lastAttemptHash": h,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "model": args.model, "runner": args.runner, "rounds": round_no, "costUsd": round(cost, 4),
        "files": files, "gaps": len(all_gaps),
        "gates": {r.name: r.ok for r in results},
    }
    save_lock(lock, platform)
    print(f"  {'✔' if ok else '✖'} {key}: {len(files)} file(s), {len(all_gaps)} gap(s), {round_no} round(s), ${cost:.3f}")
    return ok


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--platform", default="web,lit,rn", help="comma-separated: web,lit,rn")
    ap.add_argument("--component", help="comma-separated component names (as in the doc frontmatter)")
    ap.add_argument("--pattern", help="comma-separated pattern names (the doc title without spaces, e.g. SettingsPage); targets Pattern.<Name>.<platform>")
    ap.add_argument("--stale", action="store_true", help="generate every target whose prompt hash changed")
    ap.add_argument("--check", action="store_true", help="list stale targets and exit 1 if any")
    ap.add_argument("--adopt", action="store_true", help="record current prompt hashes for targets whose code already exists (hand-written or generated elsewhere), without calling a model")
    ap.add_argument("--force", action="store_true", help="regenerate even when the hash matches")
    ap.add_argument("--runner", choices=["cli", "api"], default="cli")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="alias (fable, opus, sonnet) or full model id; env DS_MODEL")
    ap.add_argument("--max-rounds", type=int, default=3, help="model rounds per target (1 generate + fixes)")
    ap.add_argument("--max-turns", type=int, default=80, help="agent turns per round (cli runner)")
    ap.add_argument("--skip", action="append", default=[], help="gate to skip, e.g. --skip typecheck (repeatable)")
    ap.add_argument("--with", dest="extra", action="append", default=[], help="browser gate to add after the fast ones: keyboard, axe (needs `pnpm exec playwright install chromium`)")
    ap.add_argument("--dry-run", action="store_true", help="print the task prompt head, call nothing")
    args = ap.parse_args()

    lock = load_lock()
    if args.check:
        stale = stale_targets(lock)
        for n, p in stale:
            print(f"stale  {n}.{p}")
        print(f"{len(stale)} stale of {len(all_targets())} targets")
        return 1 if stale else 0

    if args.adopt:
        n_adopted = 0
        for n, p in all_targets():
            folder, stem = (ROOT / "packages" / PKG[p] / "demo", n.split(".", 1)[1]) if n.startswith("Pattern.") else (ROOT / "packages" / PKG[p] / "src", n)
            exists = any(folder.glob(f"{stem}.*"))
            if exists:
                h = sha(prompt_path(n, p).read_text(encoding="utf-8"))
                lock.setdefault(f"{n}.{p}", {}).update({"hash": h, "adoptedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "runner": "adopted"})
                n_adopted += 1
        for platform in PKG:
            save_lock(lock, platform)
        print(f"✔ adopted {n_adopted} target(s) → {LOCK_DIR.relative_to(ROOT)}/generate.lock.<platform>.json")
        return 0

    platforms = [p.strip() for p in args.platform.split(",") if p.strip()]
    for p in platforms:
        if p not in PKG:
            sys.exit(f"unknown platform {p}")
    if args.stale:
        targets = [(n, p) for n, p in stale_targets(lock) if p in platforms]
    elif args.component or args.pattern:
        targets = [(n.strip(), p) for n in (args.component or "").split(",") if n.strip() for p in platforms]
        targets += [(f"Pattern.{n.strip()}", p) for n in (args.pattern or "").split(",") if n.strip() for p in platforms]
    else:
        ap.error("give --component NAME[,NAME], --pattern NAME[,NAME], --stale or --check")
    if not targets:
        print("nothing to do")
        return 0
    print(f"targets: {', '.join(f'{n}.{p}' for n, p in targets)}")
    ok = True
    for n, p in targets:
        ok &= generate_one(n, p, args, lock)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
