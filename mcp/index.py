"""
Build the vector index the MCP server searches.

Everything indexed here is a build output of the docs, so the index can never
say something the docs do not:

  generated/components.json   → one chunk per (component, section); platform notes are split
                                by their ### sub-headings and tagged with that platform
  generated/themes.json       → one chunk per (theme, section)
  schema (frontmatter)        → one "schema summary" chunk per component (props/events/a11y in prose)
  packages/<platform>/src/**  → one chunk per generated source file, tagged with platform + component
  generated/prompts/*         → one chunk per generation prompt (theme skills + per-platform)

Every chunk carries metadata: kind, platform (all | web | lit | rn | …), component, theme, section,
path. `platform` is what lets the search answer "for the platform I'm working on".

Store: ChromaDB (embedded, persistent, local embedding model — no API keys).

Usage:  python3 mcp/index.py            # rebuild mcp/.chroma from scratch
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED = ROOT / "generated"
PACKAGES = ROOT / "packages"
DB_PATH = ROOT / "mcp" / ".chroma"
COLLECTION = "design-schema"

PLATFORM_HEADINGS = {"web": "web", "react": "web", "lit": "lit", "react native": "rn", "rn": "rn",
                     "swiftui": "swiftui", "compose": "compose", "jetpack compose": "compose"}
PLATFORM_DIRS = {"react": "web", "lit": "lit", "rn": "rn"}
MAX_CHARS = 6000  # keep chunks well inside the embedding model's context
PARA_SPLIT = 400  # sections longer than this are also indexed paragraph by paragraph for finer retrieval


def paragraphs(md: str) -> list[str]:
    """Split Markdown into paragraphs (blank-line separated), keeping fenced code blocks intact."""
    out, buf, fence = [], [], False
    for line in md.splitlines():
        if line.startswith("```"):
            fence = not fence
        if not fence and not line.strip():
            if buf:
                out.append("\n".join(buf).strip())
                buf = []
        else:
            buf.append(line)
    if buf:
        out.append("\n".join(buf).strip())
    return [p for p in out if len(p) > 40]


def section_chunks(cid: str, title: str, section: str, md: str, meta: dict) -> list[dict]:
    """One chunk for the whole section plus, when it is long, one per paragraph."""
    chunks = [{"id": cid, "text": f"{title} — {section}\n\n{md}", "meta": {**meta, "section": section, "granularity": "section"}}]
    if len(md) > PARA_SPLIT:
        for i, para in enumerate(paragraphs(md)):
            chunks.append({"id": f"{cid}#p{i}", "text": f"{title} — {section}\n\n{para}", "meta": {**meta, "section": section, "granularity": "paragraph"}})
    return chunks


def split_platform_notes(md: str) -> dict[str, str]:
    """'### Web\\n...\\n### Lit\\n...' → {'web': '...', 'lit': '...'}"""
    out: dict[str, str] = {}
    current, buf = None, []
    for line in md.splitlines():
        m = re.match(r"^###\s+(.+?)\s*$", line)
        if m:
            if current:
                out[current] = "\n".join(buf).strip()
            current = PLATFORM_HEADINGS.get(m.group(1).strip().lower(), m.group(1).strip().lower())
            buf = []
        else:
            buf.append(line)
    if current:
        out[current] = "\n".join(buf).strip()
    return out


def schema_summary(c: dict) -> str:
    """Prose rendering of the frontmatter so 'what props does Button have' embeds well."""
    lines = [f"{c['name']} ({c['category']}) — anatomy: {', '.join(c['anatomy'])}."]
    if c.get("apg"):
        lines.append(f"Implements the ARIA APG '{c['apg']}' pattern.")
    lines.append("Props:")
    for name, p in c["props"].items():
        typ = " | ".join(p["values"]) if p["type"] == "enum" else p.get("shape", p["type"])
        req = ", required" if p.get("required") else ""
        default = f", default {p['default']}" if "default" in p else ""
        plats = f" (platforms: {', '.join(p['platforms'])})" if p.get("platforms") else ""
        lines.append(f"  - {name}: {typ}{req}{default}{plats}. {p['description']}" + (f" Accessibility: {p['a11y']}" if p.get("a11y") else ""))
    if c.get("events"):
        lines.append("Events:")
        for name, e in c["events"].items():
            mapping = ", ".join(f"{k}: {v}" for k, v in e["platforms"].items())
            lines.append(f"  - {name}: {e['description']} Platform names — {mapping}.")
    if c.get("styles"):
        lines.append("Style bindings (token per CSS property): " + "; ".join(f"{k} → {v['token']}" for k, v in c["styles"].items()) + ".")
    a = c["a11y"]
    lines.append(f"Accessibility role {a['role']}; requires: {', '.join(a['requires']) or 'none'}.")
    if a.get("contrast"):
        lines.append("Contrast pairs: " + "; ".join(f"{p['foreground']} on {p['background']} at {p.get('level', 'AA')}" for p in a["contrast"]) + ".")
    if c.get("keyboard"):
        lines.append("Keyboard: " + "; ".join(f"{'/'.join(r['keys'])} → {r['action']}" + (f" (when {r['when']})" if r.get("when") else "") for r in c["keyboard"]) + ".")
    if c.get("composition"):
        lines.append("Composition: " + ", ".join(f"{part} is a {comp}" for part, comp in c["composition"].items()) + ".")
    if c.get("copy"):
        lines.append("Copy templates: " + "; ".join(f"{k} = '{v}'" for k, v in c["copy"].items()) + ".")
    return "\n".join(lines)


def schema_chunks(name: str, summary: str, meta: dict) -> list[dict]:
    """The schema summary as one chunk, or — when a component's props/events/styles outgrow the budget —
    as a run of continuation chunks split at line boundaries, each repeating the header line so it embeds in context."""
    if len(summary) <= MAX_CHARS:
        return [{"id": f"schema:{name}", "text": summary, "meta": meta}]
    header, *lines = summary.split("\n")
    pieces, buf = [], [header]
    for line in lines:
        if len("\n".join(buf + [line])) > MAX_CHARS and len(buf) > 1:
            pieces.append("\n".join(buf))
            buf = [header]
        buf.append(line)
    pieces.append("\n".join(buf))
    return [{"id": f"schema:{name}" + (f"#{i + 1}" if i else ""), "text": text, "meta": meta} for i, text in enumerate(pieces)]


def component_chunks() -> list[dict]:
    chunks = []
    for entry in json.loads((GENERATED / "components.json").read_text(encoding="utf-8")):
        c = entry["component"]
        name = c["name"]
        base = {"kind": "guidance", "component": name, "category": c["category"], "status": c.get("status", "draft"),
                "path": entry["source"], "theme": ""}
        chunks += schema_chunks(name, schema_summary(c),
                                {**base, "kind": "schema", "platform": "all", "section": "Schema", "granularity": "section"})
        for section, md in entry["sections"].items():
            if section == "Platform notes":
                for platform, text in split_platform_notes(md).items():
                    note = c["platforms"].get(platform, {}).get("notes", "")
                    text = (text + ("\n\n" + note if note else "")).strip()
                    chunks.append({"id": f"guidance:{name}:{section}:{platform}", "text": f"{name} — {section} ({platform})\n\n{text}",
                                   "meta": {**base, "platform": platform, "section": section, "granularity": "section"}})
            else:
                chunks += section_chunks(f"guidance:{name}:{section}", name, section, md, {**base, "platform": "all"})
        # Per-platform mapping row as its own small chunk so 'what element does Button render on RN' hits.
        for platform, notes in c["platforms"].items():
            mapping = ", ".join(f"{k}: {v}" for k, v in notes.items() if k != "notes")
            chunks.append({"id": f"platform:{name}:{platform}", "text": f"{name} on {platform}: {mapping}. {notes.get('notes', '')}",
                           "meta": {**base, "kind": "platform-mapping", "platform": platform, "section": "Platform mapping", "granularity": "section"}})
    return chunks


def theme_chunks() -> list[dict]:
    chunks = []
    themes_file = GENERATED / "themes.json"
    if not themes_file.exists():
        return chunks
    for entry in json.loads(themes_file.read_text(encoding="utf-8")):
        t = entry["theme"]
        base = {"kind": "theme", "theme": t["id"], "component": "", "category": "theme", "status": t.get("status", "draft"),
                "path": entry["source"], "platform": "all"}
        decisions = (f"Theme {entry['title']} ({t['id']}): tone {', '.join(t['tone'])}; must never be {t['not']}. "
                     f"Seed color {t['seed']['color']}, typeface {t['seed'].get('typeface', 'system')}, scale {t['scale']['base']}px × {t['scale']['ratio']}, "
                     f"radius {t['radius']}, density {t['density']}, motion {t.get('motion', 'subtle')}, modes {', '.join(t['modes']['supports'])} (default {t['modes']['default']}).")
        chunks.append({"id": f"theme:{t['id']}:decisions", "text": decisions, "meta": {**base, "section": "Decisions", "granularity": "section"}})
        for section, md in entry["sections"].items():
            chunks += section_chunks(f"theme:{t['id']}:{section}", entry["title"], section, md, base)
    return chunks


def code_chunks() -> list[dict]:
    chunks = []
    for pkg, platform in PLATFORM_DIRS.items():
        src = PACKAGES / pkg / "src"
        if not src.exists():
            continue
        for f in sorted(list(src.glob("*")) + list((PACKAGES / pkg / "demo").glob("*"))):
            if not f.is_file() or f.suffix not in {".ts", ".tsx", ".css"}:
                continue
            stem = f.name.split(".")[0]
            component = stem if stem[:1].isupper() else ""
            kind = "story" if ".stories." in f.name else "demo" if f.parent.name == "demo" else "code"
            text = f.read_text(encoding="utf-8")
            chunks.append({"id": f"code:{platform}:{f.relative_to(PACKAGES / pkg)}", "text": f"// {platform} — {f.name}\n{text[:MAX_CHARS]}",
                           "meta": {"kind": kind, "platform": platform, "component": component, "theme": "", "category": "code",
                                    "status": "generated", "section": f.name, "path": str(f.relative_to(ROOT)), "granularity": "file"}})
    return chunks


def prompt_chunks() -> list[dict]:
    chunks = []
    for f in sorted((GENERATED / "prompts").glob("*.md")):
        text = f.read_text(encoding="utf-8")
        if f.name.startswith("theme."):
            theme = f.name[len("theme."):-3]
            meta = {"kind": "prompt", "platform": "all", "component": "", "theme": theme, "category": "prompt", "status": "generated", "section": "Feel skill", "path": str(f.relative_to(ROOT)), "granularity": "file"}
        else:
            name, platform = f.stem.rsplit(".", 1)  # Pattern.<Name>.<platform> keeps its dot in the name
            meta = {"kind": "prompt", "platform": platform, "component": name, "theme": "", "category": "prompt", "status": "generated", "section": "Generation prompt", "path": str(f.relative_to(ROOT)), "granularity": "file"}
        chunks.append({"id": f"prompt:{f.stem}", "text": text[:MAX_CHARS], "meta": meta})
    return chunks


def all_chunks() -> list[dict]:
    return component_chunks() + theme_chunks() + code_chunks() + prompt_chunks()


def build() -> int:
    try:
        import chromadb
    except ImportError:
        print("✖ chromadb is not installed — run: pip install -r tools/requirements.txt", file=sys.stderr)
        return 1
    chunks = all_chunks()
    if DB_PATH.exists():
        shutil.rmtree(DB_PATH)
    client = chromadb.PersistentClient(path=str(DB_PATH))
    col = client.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine"})
    batch = 64
    for i in range(0, len(chunks), batch):
        part = chunks[i : i + batch]
        col.upsert(ids=[c["id"] for c in part], documents=[c["text"] for c in part], metadatas=[c["meta"] for c in part])
        print(f"  indexed {min(i + batch, len(chunks))}/{len(chunks)}", flush=True)
    kinds = {}
    for c in chunks:
        kinds[c["meta"]["kind"]] = kinds.get(c["meta"]["kind"], 0) + 1
    print(f"✔ {len(chunks)} chunks → {DB_PATH.relative_to(ROOT)}  ({', '.join(f'{k}: {v}' for k, v in sorted(kinds.items()))})")
    return 0


if __name__ == "__main__":
    if "--dry-run" in sys.argv:
        for c in all_chunks():
            print(f"{c['id']:<60} {c['meta']['platform']:<6} {len(c['text']):>5} chars")
        sys.exit(0)
    sys.exit(build())
