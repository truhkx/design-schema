---
title: Two ways in
description: Who Design Schema is for, what each of them gets by default, and what it costs — an adopter who wants a finished system, and an owner who wants to change the rules.
sidebar:
  order: 0
---

Design Schema is open source and built for two people who are often the same small business, a few months apart.

## The adopter: "I have an idea of what I want my site to feel like"

A business owner and the engineer helping them — increasingly an AI engineer working in Claude Code or a similar tool — should be able to go from a description of the feel they want to a complete, accessible, working design system without generating a single component.

That works because of how the pieces divide. The **components** are generated once, here, for React, web components and React Native, and shipped as packages. They contain no colors, sizes or fonts of their own — every visual value is a token reference, and a build gate makes sure of it. The **theme** is a short Markdown doc: a seed color, a typeface, a few decisions (tone words and the word it must never be, radius, density, motion), and `tools/theme.py` derives the whole token set from it deterministically, with contrast checked for every component in light and dark. So an adopter's entire customisation is one document, costs nothing to build, and every component picks it up.

The path, concretely: run the theme interview (the questions in [From vision to system](/process/from-vision-to-system/) — five answers), write or let the AI write `themes/<your-id>.md`, run `pnpm themes`, and start building screens. Point Claude Code at the [MCP server](/process/mcp-server/) and it has the same knowledge the docs site has: which component to use, what its props are, how the theme wants things to feel, and reference code for the platform in hand. The server runs locally with a local embedding model; there is no per-query cost. Nothing about this path calls a model to generate components, so the adopter's cost is their own AI engineer's normal usage and nothing else.

What the adopter gets by default: the full component set on three platforms, tokens in CSS, JS and React Native forms, light and dark, WCAG 2.2 AA verified per theme, Storybook, and a docs site that describes their own system.

## The owner: "I want to change the rules and own it"

A team with the means to go further does not customise the components; it customises the **schema** — the docs the components are generated from — and regenerates. That is the second path, and it is what this repository itself is.

Owning it means: writing or editing component docs under `site/src/content/docs/components/` (frontmatter is the contract, prose is the judgment — see [Authoring a component](/guides/authoring-a-component/)), adding requirements to the accessibility vocabulary, changing copy templates, adding platform targets, or replacing a generation template with one that matches the team's own coding conventions. Then `generate.ps1 -Stale` (or `pnpm generate -- --stale`) regenerates exactly the targets whose docs changed, runs the [gates](/process/generation-pipeline/), and records the result in a lockfile that CI checks.

This path does call a model, and it is the only place in the system that does. Costs, as measured on this repository: roughly $1–3 per component per platform at Fable rates and about a fifth of that on Sonnet, which is the default because a precise spec plus hard gates is exactly where a cheaper model is enough. A complete system of sixty components on three platforms is on the order of a few hundred dollars once, and the lockfile ensures nobody pays again for a component whose doc has not changed. Everything after the model — type checking, the literal gate, contrast, and the planned accessibility and keyboard tests — is deterministic and free.

What the owner gets: the same output as the adopter, plus the ability to add a component that does not exist yet, change what "accessible" means for their organisation, and hand the result to *their* adopters as a finished system.

## What both paths share

The docs are the product. An adopter reads them on the site; an AI engineer reads them through the MCP server; the generator reads them as prompts; the build reads them as constraints. When a decision changes, it changes in one file, and every projection follows. That is the property that keeps this cheap to run and possible to own: there is no second place where the truth lives.
