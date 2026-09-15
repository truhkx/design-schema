---
title: MCP server
description: How AI tools query the design system — semantic search over guidance by platform, exact component schemas, generated reference code, themes, tokens, and a contrast check.
sidebar:
  order: 4
---

The MCP server is the design system's API for AI clients (Claude, Cursor, Copilot, anything that speaks the Model Context Protocol). It is built on the official MCP TypeScript SDK and serves nothing it computes on the fly: every answer comes from the same build outputs the site renders — `generated/components.json`, `generated/themes.json`, `generated/prompts/`, the token files, and the generated packages. If the docs change, `pnpm check` regenerates those outputs, `pnpm mcp:index` re-embeds them, and the server is current.

## The index

Guidance is embedded into a local vector database (`mcp/.chroma`, file-based, no API keys; the all-MiniLM-L6-v2 embedding model runs on your machine). The file is the sqlite database ChromaDB wrote when the tools were Python — same schema (`mcp/chroma-schema.sql` is its own DDL), same `FLOAT32` vector blobs — with one thing left out: the hnswlib segment beside it, an *approximate* nearest-neighbour index that only Python can read. At 1,600 chunks the server scans the vectors exactly instead, which is faster than building the graph and strictly more accurate than querying it. Each chunk is a build output tagged with metadata:

| Field | Values | What it does |
| --- | --- | --- |
| `kind` | guidance, schema, platform-mapping, theme, code, story, demo, prompt | Lets a search target prose, schemas, or implementations |
| `platform` | all, web, lit, rn, swiftui | `all` is platform-agnostic guidance; platform notes and code carry their own platform |
| `component` / `theme` | Button, Input… / calm-precise… | Exact filter |
| `section` | When to use, Accessibility, Behavior, Platform notes… | Which part of the doc the chunk came from |

Chunks are one per (component, section); platform notes are split by their `###` sub-headings and tagged with that platform; each component's frontmatter is rendered into a prose "schema summary" so questions like *what props does Input have* embed well; every generated source file and prompt is a chunk too. This is the `platform → component → schema` shape, expressed as filters over one index rather than as folders.

## Tools

**`search_guidance(query, platform?, component?, kinds?, limit?)`** — semantic search. With `platform: "rn"`, results are the platform-agnostic guidance plus the React Native notes and code only, so a developer working in one stack never receives another stack's advice. `kinds: ["code", "story"]` searches implementations instead of prose.

**`lookup_code(component, platform, include?)`** — the deterministic counterpart. Returns the generated reference source (and CSS on web), stories, the platform mapping and notes, the events' names on that platform, the copy templates, the exact generation prompt, and the token names the component's style bindings resolve to on that platform (`var(--space-{size})` on web, `space{Size}` on React Native, with `{slot}` placeholders left visible so the caller knows to interpolate). This is the tool an AI should call before writing component code.

**`get_component(name, platform?)`** — full schema and guidance; with `platform`, the mapping and notes are narrowed and each event is annotated with its platform name.

**`list_components(platform?, status?)`**, **`list_themes()`**, **`get_theme_skill(theme)`** (the "feel" skill — read first), **`get_tokens(theme, mode, platform, group?)`** (resolved values named for the platform), **`check_contrast(foreground, background, level?, large_text?)`** (hex or token paths), and **`get_generation_prompt(component, platform)`**.

Resources: `design-schema://components`, `design-schema://components/{name}`, `design-schema://themes/{id}/skill`, `design-schema://schema/component`.

## Running it

```sh
pnpm install       # @modelcontextprotocol/sdk and onnxruntime-node come with the repo's dev dependencies
pnpm mcp:index     # build mcp/.chroma from the generated outputs (downloads the embedding model once)
pnpm mcp:smoke     # run a few searches and lookups from the terminal
pnpm mcp           # start the server over stdio
```

Register it with a client (paths are absolute):

```sh
# Claude Code
claude mcp add design-schema -- node --import tsx /path/to/design-schema/mcp/server.ts
```

```json
// Claude Desktop (claude_desktop_config.json) or Cursor (.cursor/mcp.json)
{
  "mcpServers": {
    "design-schema": { "command": "node", "args": ["--import", "tsx", "/path/to/design-schema/mcp/server.ts"] }
  }
}
```

## Why this is the payoff of documentation-first

Nothing in the server is hand-maintained. The "when to use" prose, the accessibility rules, the per-platform event names, the reference implementations and the tokens all flow from the same Markdown files, so an AI querying the system gets answers that are consistent with each other and with the site — and when a doc is wrong, fixing it fixes every answer.
