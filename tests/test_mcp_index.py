"""mcp/index.py — the chunker that feeds the vector index."""
from __future__ import annotations

import pytest

import index as ix


class TestParagraphs:
    def test_splits_on_blank_lines(self):
        md = ("First paragraph, comfortably longer than the minimum length.\n\n"
              "Second paragraph, also comfortably longer than the minimum.")
        assert len(ix.paragraphs(md)) == 2

    def test_short_fragments_are_dropped(self):
        md = "Too short.\n\nThis paragraph is definitely longer than forty characters."
        out = ix.paragraphs(md)
        assert len(out) == 1 and out[0].startswith("This paragraph")

    def test_a_fenced_block_stays_one_chunk_despite_blank_lines(self):
        md = "```ts\nconst a = 1;\n\nconst b = 2;\n\nconst c = 3;\n```"
        out = ix.paragraphs(md)
        assert len(out) == 1
        assert "const a" in out[0] and "const c" in out[0]

    def test_prose_around_a_fence_is_kept_separate(self):
        md = ("A sentence of prose that is long enough to survive the filter.\n\n"
              "```ts\nconst reallyLongVariableName = 1234567890;\n```")
        assert len(ix.paragraphs(md)) == 2

    def test_empty_input(self):
        assert ix.paragraphs("") == []


class TestSplitPlatformNotes:
    def test_headings_become_platform_keys(self):
        assert ix.split_platform_notes("### Web\nw\n### Lit\nl") == {"web": "w", "lit": "l"}

    @pytest.mark.parametrize("heading,key", [
        ("Web", "web"), ("React", "web"), ("Lit", "lit"), ("React Native", "rn"),
        ("RN", "rn"), ("SwiftUI", "swiftui"), ("Jetpack Compose", "compose"),
    ])
    def test_the_headings_authors_actually_write_are_recognised(self, heading, key):
        assert list(ix.split_platform_notes(f"### {heading}\nbody")) == [key]

    def test_heading_matching_is_case_insensitive(self):
        assert list(ix.split_platform_notes("### REACT NATIVE\nbody")) == ["rn"]

    def test_an_unknown_heading_is_kept_lowercased(self):
        assert ix.split_platform_notes("### Flutter\nbody") == {"flutter": "body"}

    def test_text_before_the_first_heading_is_discarded(self):
        assert ix.split_platform_notes("preamble\n### Web\nw") == {"web": "w"}

    def test_no_headings_gives_an_empty_mapping(self):
        assert ix.split_platform_notes("just prose") == {}

    def test_multi_line_bodies_are_kept_and_trimmed(self):
        out = ix.split_platform_notes("### Web\n\nline one\nline two\n\n### Lit\nl")
        assert out["web"] == "line one\nline two"


class TestSchemaSummary:
    def test_covers_every_part_of_the_schema(self, component):
        component["apg"] = "button"
        component["copy"] = {"required": "{label} is required."}
        text = ix.schema_summary(component)
        assert "Widget (action)" in text
        assert "anatomy: container, label" in text
        assert "ARIA APG 'button'" in text
        assert "label: string, required" in text
        assert "variant: primary | danger, default primary" in text
        assert "onPress" in text and "web: onClick" in text
        assert "background → color.action.{variant}.background" in text
        assert "Accessibility role button" in text
        assert "requires: accessible-name, focus-visible" in text
        assert "color.action.{variant}.foreground on" in text
        assert "required = '{label} is required.'" in text

    def test_optional_blocks_are_omitted_when_absent(self, component):
        for key in ("events", "styles", "copy"):
            component.pop(key, None)
        component["a11y"].pop("contrast")
        text = ix.schema_summary(component)
        assert "Events:" not in text and "Style bindings" not in text
        assert "Copy templates" not in text and "Contrast pairs" not in text

    def test_prop_platform_restrictions_are_surfaced(self, component):
        component["props"]["variant"]["platforms"] = ["web", "lit"]
        assert "(platforms: web, lit)" in ix.schema_summary(component)

    def test_prop_a11y_notes_are_surfaced(self, component):
        component["props"]["label"]["a11y"] = "Becomes the accessible name."
        assert "Accessibility: Becomes the accessible name." in ix.schema_summary(component)

    def test_an_empty_requires_list_reads_as_none(self, component):
        component["a11y"]["requires"] = []
        assert "requires: none" in ix.schema_summary(component)


class TestSectionChunks:
    META = {"kind": "guidance", "platform": "all", "component": "Widget"}

    def test_a_short_section_produces_one_chunk(self):
        chunks = ix.section_chunks("guidance:Widget:Overview", "Widget", "Overview", "Short.", self.META)
        assert len(chunks) == 1
        assert chunks[0]["id"] == "guidance:Widget:Overview"
        assert chunks[0]["meta"]["granularity"] == "section"
        assert chunks[0]["text"].startswith("Widget — Overview")

    def test_a_long_section_is_also_split_into_paragraphs(self):
        # Only sections longer than PARA_SPLIT earn the extra paragraph-level chunks.
        md = "\n\n".join(f"Paragraph number {i} is long enough to be indexed on its own line."
                         for i in range(7))
        assert len(md) > ix.PARA_SPLIT
        chunks = ix.section_chunks("guidance:Widget:Behavior", "Widget", "Behavior", md, self.META)
        assert len(chunks) == 8
        assert [c["id"] for c in chunks[1:]] == [f"guidance:Widget:Behavior#p{i}" for i in range(7)]
        assert all(c["meta"]["granularity"] == "paragraph" for c in chunks[1:])

    def test_paragraph_chunks_share_the_parent_id_prefix(self):
        md = "x" * 500
        chunks = ix.section_chunks("parent", "Widget", "Behavior", md, self.META)
        assert all(c["id"].split("#")[0] == "parent" for c in chunks)

    def test_section_metadata_is_carried_through(self):
        chunks = ix.section_chunks("id", "Widget", "Accessibility", "Short.", self.META)
        assert chunks[0]["meta"]["section"] == "Accessibility"
        assert chunks[0]["meta"]["component"] == "Widget"


@pytest.fixture(scope="module")
def chunks():
    return ix.all_chunks()


class TestRealChunks:
    """The index is built from the repo's own build outputs."""

    def test_something_is_indexed_from_every_source(self, chunks):
        kinds = {c["meta"]["kind"] for c in chunks}
        assert {"guidance", "schema", "platform-mapping", "theme", "code", "prompt"} <= kinds

    def test_ids_are_unique(self, chunks):
        ids = [c["id"] for c in chunks]
        assert len(ids) == len(set(ids))

    def test_every_chunk_carries_the_metadata_search_filters_on(self, chunks):
        for c in chunks:
            assert {"kind", "platform", "component", "theme", "section", "path"} <= set(c["meta"]), c["id"]

    def test_metadata_values_are_chroma_scalars(self, chunks):
        # ChromaDB rejects None and nested values in metadata.
        for c in chunks:
            for k, v in c["meta"].items():
                assert isinstance(v, (str, int, float, bool)), f"{c['id']}.{k} = {v!r}"

    def test_no_chunk_is_empty_or_over_the_embedding_budget(self, chunks):
        for c in chunks:
            assert c["text"].strip(), c["id"]
            assert len(c["text"]) <= ix.MAX_CHARS + 200, c["id"]

    def test_platform_is_always_a_known_value(self, chunks):
        allowed = {"all", "web", "lit", "rn", "swiftui", "compose"}
        assert {c["meta"]["platform"] for c in chunks} <= allowed

    def test_code_chunks_are_tagged_with_their_platform_and_component(self, chunks):
        code = [c for c in chunks if c["meta"]["kind"] in {"code", "story", "demo"}]
        assert code, "no generated sources were indexed"
        assert {c["meta"]["platform"] for c in code} <= {"web", "lit", "rn"}
        assert any(c["meta"]["component"] == "Button" for c in code)

    def test_component_platform_notes_are_split_per_platform(self, chunks):
        # A component's "Platform notes" is split by its ### sub-headings and each
        # part tagged with that platform, so an RN developer never sees Lit advice.
        # (Theme docs keep their Platform notes whole, tagged "all".)
        notes = [c for c in chunks if c["meta"]["section"] == "Platform notes" and c["meta"]["component"]]
        assert notes
        assert all(c["meta"]["platform"] != "all" for c in notes)
        assert {"web", "lit", "rn"} <= {c["meta"]["platform"] for c in notes}
