/**
 * Shared value vocabularies for enum props. A prop names one with `enumRef` instead of spelling out its own list,
 * so Search's `md` is Button's `md`, and a composed child accepts its parent's size.
 *
 * The lists follow the theme: `size` is tools/theme.ts `SIZE_NAMES` (the `font.size.*` steps), `tone` the status
 * tones plus `neutral`, and `foregroundTone` the `color.foreground.*` names. tools/__tests__/parse-checks.test.ts
 * holds them to that.
 *
 * Imports only `zod`, because schema/ publishes on its own. Runs under Node's type stripping: annotations only.
 */
import { z } from 'zod';

/** Vocabulary name → its values, in scale order. */
export const VOCAB = Object.freeze({
  size: Object.freeze(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const),
  tone: Object.freeze(['neutral', 'info', 'success', 'warning', 'danger'] as const),
  foregroundTone: Object.freeze(['default', 'strong', 'muted', 'danger', 'onAction'] as const),
});

export type VocabName = keyof typeof VOCAB;

export const VOCAB_NAMES = Object.keys(VOCAB) as [VocabName, ...VocabName[]];

export const vocabName = z.enum(VOCAB_NAMES).meta({ id: 'vocabName', description: 'A shared value vocabulary: size, tone or foregroundTone.' });

/** An enum prop's values: its own `values` when present, else its `enumRef` vocabulary, else none. */
export function enumValues(prop: { values?: readonly string[] | undefined; enumRef?: string | undefined }): readonly string[] {
  if (prop.values !== undefined) return prop.values;
  if (prop.enumRef !== undefined && Object.hasOwn(VOCAB, prop.enumRef)) return VOCAB[prop.enumRef as VocabName];
  return [];
}
