# syntax=docker/dockerfile:1
#
# The public website as a self-hosted container: build the static site, then serve it with Caddy.
#
#   docker build -f apps/website/Dockerfile -t design-schema-website .      # from the repo root
#   docker run --rm -p 8080:80 design-schema-website                        # http://localhost:8080
#
# Or `docker compose -f apps/website/compose.yaml up -d --build`, which also keeps Caddy's certificates
# in a volume. Hosting on a real domain with automatic HTTPS: see apps/website/README.md, "Self-hosting".
#
# The build stage follows .github/workflows-pending/deploy-pages.yml step for step, because every input
# the site reads is gitignored build output and has to be derived here rather than copied from a
# working tree: tokens, the built React package, the React Storybook's story-id manifest, the parsed
# schema, the examples, the nav, and the keyboard specs.

# ---------------------------------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS build

ENV CI=true \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    # The site build needs neither a browser nor ONNX Runtime's GPU binaries (root devDependencies used by
    # the gates and the MCP index); skip their downloads.
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    ONNXRUNTIME_NODE_INSTALL_CUDA=skip \
    ASTRO_TELEMETRY_DISABLED=1 \
    STORYBOOK_DISABLE_TELEMETRY=1

# pnpm at exactly the version package.json#packageManager pins; the workspace sets engineStrict.
RUN corepack enable

WORKDIR /repo
COPY . .

# A context sent from a Windows checkout (core.autocrlf=true) carries CRLF text files, and some checks compare
# regenerated LF output byte for byte against committed files (tools/naming_demo.ts --check). Normalise text to
# LF so a build from Windows produces exactly what a build from a Linux clone does. Binary assets are untouched.
RUN find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.mts' -o -name '*.mjs' -o -name '*.cjs' \
      -o -name '*.js' -o -name '*.jsx' -o -name '*.json' -o -name '*.md' -o -name '*.mdx' -o -name '*.yaml' \
      -o -name '*.yml' -o -name '*.css' -o -name '*.html' -o -name '*.astro' -o -name '*.svg' -o -name '*.txt' \
      -o -name '*.swift' -o -name '.nvmrc' -o -name 'LICENSE' -o -name 'Caddyfile' \) \
      -exec sed -i 's/\r$//' {} +

# Only what the site needs: the root project (the tools under tools/ run from its devDependencies) and
# the website with its workspace dependencies (@design-schema/react and @design-schema/tokens, with their
# own devDependencies, which include Storybook). The Expo app, Lit and React Native are never installed.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter design-schema --filter "website..."

# 1. Tokens: `pnpm themes` derives every theme and writes packages/tokens/dist (tokens has no build script).
RUN pnpm themes
# 2. The React package the site imports from dist.
RUN pnpm --filter @design-schema/react build
# 3. The React Storybook, for storybook-static/index.json only: tools/docs_examples.ts reads story ids from it.
RUN pnpm --filter @design-schema/react build-storybook
# 4. The derived tests, before `pnpm check`: its naming-demo step compares packages/react/demo-brand against a
#    rename of generated/behavior, and the component pages' accessibility section reads generated/keyboard/*.json.
#    Neither tool is part of `pnpm check`, so on a checkout without generated/ both would be missing.
RUN node --import tsx tools/parse.ts \
 && node --import tsx tools/behavior_tests.ts \
 && node --import tsx tools/keyboard_tests.ts
# 5. Parse the schema, extract the examples, write the nav (and validate every doc and contrast pair).
RUN pnpm check
# 6. The site, then the deploy gate: every promised route must be a real, non-empty page.
RUN pnpm --filter website build \
 && pnpm site:routes

# ---------------------------------------------------------------------------------------------------------
FROM caddy:2-alpine AS serve

COPY apps/website/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/website/dist /srv

# 80 for HTTP (and the ACME challenge), 443 for HTTPS, 443/udp for HTTP/3. Only 80 is used until
# SITE_ADDRESS names a domain.
EXPOSE 80 443 443/udp
