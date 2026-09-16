/**
 * The regeneration phases: tools/regen-phases.json, the one list of the order components are generated in.
 *
 * A component is generated only after everything it composes, so the phases are that composition order, and
 * the docs sidebar groups are the same list (tools/site_nav.ts). regen.ps1 reads the file with ConvertFrom-Json
 * and tools/regen.ts through this module, so no tool parses another tool's source to learn the order.
 *
 * The top level is `{ "phases": [...] }`, never a bare array: Windows PowerShell 5.1's ConvertFrom-Json writes
 * a JSON array to the pipeline as one object, so `@(... | ConvertFrom-Json)` would hold the whole list as a
 * single element and regen.ps1's `foreach` would run once.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync } from 'node:fs';
import { isAbsolute, join, relative, sep } from 'node:path';

import { readText } from './py.ts';
import { REPO_ROOT } from './root.ts';

export const PHASES_FILE: string = join(REPO_ROOT, 'tools', 'regen-phases.json');

/** A phase generates either a list of components or one pattern page, never both. */
export type Phase = { name: string; components?: string[]; pattern?: string };

/** Raised for a missing or malformed phases file. Every message starts with `<source>: `. */
export class PhasesError extends Error {}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isName = (value: unknown): value is string => typeof value === 'string' && value !== '';

/** The phases in `text`, validated. `source` names the file in every error message. */
export function parsePhasesJson(text: string, source: string): Phase[] {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^﻿/, ''));
  } catch (e) {
    throw new PhasesError(`${source}: not valid JSON (${(e as Error).message})`);
  }
  if (Array.isArray(data)) {
    throw new PhasesError(
      `${source}: the top level is a bare array; write { "phases": [...] } instead — ` +
        'Windows PowerShell 5.1 ConvertFrom-Json passes a JSON array through as one object, so regen.ps1 would see a single phase',
    );
  }
  if (!isObject(data) || !Array.isArray(data.phases)) {
    throw new PhasesError(`${source}: expected an object with a "phases" array`);
  }

  const phases: Phase[] = [];
  const seen = new Set<string>();
  (data.phases as unknown[]).forEach((raw, index) => {
    const at = `phase ${index + 1}`;
    if (!isObject(raw) || !isName(raw.name)) throw new PhasesError(`${source}: ${at} has no "name" (a non-empty string)`);
    const name = raw.name;
    const hasComponents = raw.components !== undefined;
    const hasPattern = raw.pattern !== undefined;
    if (hasComponents === hasPattern) {
      throw new PhasesError(`${source}: phase ${name} needs exactly one of "components" and "pattern", not ${hasComponents ? 'both' : 'neither'}`);
    }
    if (hasComponents) {
      const components = raw.components;
      if (!Array.isArray(components) || components.length === 0 || !components.every(isName)) {
        throw new PhasesError(`${source}: phase ${name} "components" must be a non-empty array of non-empty strings`);
      }
      phases.push({ name, components: [...components] });
    } else {
      if (!isName(raw.pattern)) throw new PhasesError(`${source}: phase ${name} "pattern" must be a non-empty string`);
      phases.push({ name, pattern: raw.pattern });
    }
    if (seen.has(name)) throw new PhasesError(`${source}: two phases are named ${name}`);
    seen.add(name);
  });
  return phases;
}

/** The phases in `file` (tools/regen-phases.json unless a test points elsewhere). */
export function readPhases(file: string = PHASES_FILE): Phase[] {
  const rel = relative(REPO_ROOT, file);
  const source = rel.startsWith('..') || isAbsolute(rel) ? file : rel.replaceAll(sep, '/');
  if (!existsSync(file)) throw new PhasesError(`${source}: missing — it holds the phase order`);
  return parsePhasesJson(readText(file), source);
}

/** The phases that generate components, in order, as [name, component names]. Pattern phases are left out. */
export function componentPhases(phases: Phase[]): [string, string[]][] {
  const out: [string, string[]][] = [];
  for (const phase of phases) {
    if (phase.components !== undefined) out.push([phase.name, [...phase.components]]);
  }
  return out;
}
