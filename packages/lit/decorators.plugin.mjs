// @ts-check
import { transformAsync } from '@babel/core';
import decorators from '@babel/plugin-proposal-decorators';
import transformRuntime from '@babel/plugin-transform-runtime';
import typescript from '@babel/plugin-transform-typescript';

// The elements use standard (TC39 2023-11) decorators with `accessor` fields, which no browser runs
// natively and which Oxc — the transformer inside Vite 8 and rolldown/tsdown — parses but does not
// lower (only the legacy `experimentalDecorators` flavour is). Babel lowers them; it also strips the
// TypeScript so Oxc has nothing left to do. Used by tsdown.config.ts (the package build),
// vitest.config.ts (the browser tests) and .storybook/main.ts. `import.meta.env` and the token CSS
// import are left for Vite, as before. Plain JavaScript so every config loader can import it.
//
// Plugin order matters: the TypeScript plugin runs first so definite-assignment assertions (`el!:`)
// and type annotations are gone before the decorators plugin rewrites the class. The runtime plugin
// makes every file import Babel's decorator helper from `@babel/runtime` instead of inlining a copy;
// tsdown bundles that helper once into dist/, so `@babel/runtime` stays a dev dependency.
const FILES = /[\\/]packages[\\/]lit[\\/](?:src|demo)[\\/][^?]*\.ts$/;
const USES_DECORATORS = /@(?:customElement|property|state|query|queryAll|queryAsync|queryAssignedElements|queryAssignedNodes|eventOptions)\(/;

/**
 * A Vite / rolldown plugin that lowers the Lit package's standard decorators with Babel.
 * @returns {{ name: string; enforce: 'pre'; transform(code: string, id: string): Promise<{ code: string; map: unknown } | null> }}
 */
export function litDecorators() {
  return {
    name: 'lit-standard-decorators',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0] ?? id;
      if (!FILES.test(file) || file.endsWith('.d.ts') || !USES_DECORATORS.test(code)) return null;
      const result = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceType: 'module',
        sourceMaps: true,
        plugins: [
          [typescript, { onlyRemoveTypeImports: true, allowDeclareFields: true }],
          [decorators, { version: '2023-11' }],
          [transformRuntime, { helpers: true, regenerator: false, version: '^7.29.7' }],
        ],
      });
      return result?.code == null ? null : { code: result.code, map: result.map };
    },
  };
}
