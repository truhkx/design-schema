/**
 * The platform table: which platforms the system generates for, what each is called, and where its code lives.
 *
 * Every tool that needs a platform list or a platform's folder reads it from here — the parser, the generator,
 * the gates, the behavior and naming tools and the MCP server — so the list cannot disagree with itself.
 * schema/component.ts builds its frontmatter on `platformId` and re-exports `PLATFORMS` and `platformId`.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { join } from 'node:path';

import { z } from 'zod';

export const PLATFORMS = ['web', 'lit', 'rn', 'swiftui'] as const;
export type PlatformId = (typeof PLATFORMS)[number];
export const platformId = z.enum(PLATFORMS).meta({ id: 'platformId' });

/** The platforms whose package is TypeScript: typecheck, dependency, module and Vitest/Jest gates are a
 *  `pnpm --filter` away. `swiftui` is a Swift package, built and tested on the macOS workflow. */
export const TS_PLATFORMS = ['web', 'lit', 'rn'] as const satisfies readonly PlatformId[];

export const PLATFORM_LABEL: Readonly<Record<string, string>> = {
  web: 'React (web)', lit: 'Lit web components', rn: 'React Native', swiftui: 'SwiftUI (iOS)',
} satisfies Record<PlatformId, string>;

/** Platform → its folder under `packages/`. */
export const PACKAGE_DIR: Readonly<Record<string, string>> = {
  web: 'react', lit: 'lit', rn: 'rn', swiftui: 'swiftui',
} satisfies Record<PlatformId, string>;

/** The extension of a component's own source file, `<Name>.<ext>`. */
export const SOURCE_EXT: Readonly<Record<string, string>> = {
  web: 'tsx', lit: 'ts', rn: 'tsx', swiftui: 'swift',
} satisfies Record<PlatformId, string>;

export function isPlatform(value: string): value is PlatformId {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function isTsPlatform(value: string): value is (typeof TS_PLATFORMS)[number] {
  return (TS_PLATFORMS as readonly string[]).includes(value);
}

function packageDir(platform: string): string {
  if (!isPlatform(platform)) throw new Error(`unknown platform '${platform}' (choose from ${PLATFORMS.join(', ')})`);
  return PACKAGE_DIR[platform] as string;
}

/** Where a platform keeps its component sources: `packages/<dir>/src`, and SwiftPM's `Sources/DesignSchema`
 *  for the Swift package (which nests: `Support/` sits under it). */
export function sourceDir(root: string, platform: string): string {
  const dir = packageDir(platform);
  return platform === 'swiftui' ? join(root, 'packages', dir, 'Sources', 'DesignSchema') : join(root, 'packages', dir, 'src');
}

/** Where a platform's pattern demo pages live, or null for a platform that has none (the Swift package). */
export function demoDir(root: string, platform: string): string | null {
  const dir = packageDir(platform);
  return platform === 'swiftui' ? null : join(root, 'packages', dir, 'demo');
}
