/**
 * mcp/lib/wordpiece.ts — the BERT tokenizer the embedding model wants.
 *
 * The Python server got this from the `tokenizers` library, so there was nothing to test; here it is
 * code, and a wrong tokenization is a wrong embedding. The ids below were produced by that library
 * (`Tokenizer.from_file(tokenizer.json)` with truncation and padding at 256, as chromadb configures it)
 * and are what `pnpm mcp:index` has to reproduce for the index to keep meaning the same thing.
 *
 * The cases that need the real 30,522-entry vocabulary are skipped when the model has not been
 * downloaded yet (`pnpm mcp:index` fetches it); `normalize` and `preTokenize` are covered either way.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { useTmp } from '../../tools/__tests__/fixtures.ts';
import { modelDir } from '../lib/embed.ts';
import { normalize, preTokenize, WordPieceTokenizer } from '../lib/wordpiece.ts';

const tmp = useTmp();
const REAL = join(modelDir(), 'tokenizer.json');

describe('the BertNormalizer', () => {
  test('lowercases', () => {
    expect(normalize('Design SCHEMA')).toBe('design schema');
  });

  test('strips accents', () => {
    expect(normalize('café naïve ÅNGSTRÖM')).toBe('cafe naive angstrom');
  });

  test('tabs and newlines become plain spaces, other controls are dropped', () => {
    expect(normalize('a\tb\nc\u000Bd')).toBe('a b cd');
  });

  test('NUL and the replacement character are dropped', () => {
    expect(normalize('a b\u0000c\uFFFDd')).toBe('a bcd');
  });

  test('CJK characters are padded so each becomes its own token', () => {
    expect(normalize('x漢字y')).toBe('x 漢  字 y');
  });

  test('punctuation and the rest of the text are left alone', () => {
    expect(normalize('--color-action-{variant}-background;')).toBe('--color-action-{variant}-background;');
  });
});

describe('the BertPreTokenizer', () => {
  test('splits on whitespace', () => {
    expect(preTokenize('one two  three')).toEqual(['one', 'two', 'three']);
  });

  test('peels every punctuation character off on its own', () => {
    expect(preTokenize('a.b-c')).toEqual(['a', '.', 'b', '-', 'c']);
  });

  test('leading and trailing punctuation are separate tokens', () => {
    expect(preTokenize('(x)')).toEqual(['(', 'x', ')']);
  });

  test('empty input gives no tokens', () => {
    expect(preTokenize('   ')).toEqual([]);
  });
});

describe('the WordPiece model', () => {
  /** A miniature vocabulary in the tokenizer.json shape, for the cases that do not need the real one. */
  const tiny = (): WordPieceTokenizer => {
    const vocab: Record<string, number> = { '[PAD]': 0, '[UNK]': 1, '[CLS]': 2, '[SEP]': 3, '[MASK]': 4, design: 5, schema: 6, '##ing': 7, token: 8, '##ise': 9, '.': 10, un: 11 };
    const file = join(tmp(), 'tokenizer.json');
    writeFileSync(
      file,
      JSON.stringify({
        added_tokens: [
          { id: 0, content: '[PAD]' }, { id: 1, content: '[UNK]' }, { id: 2, content: '[CLS]' }, { id: 3, content: '[SEP]' }, { id: 4, content: '[MASK]' },
        ],
        model: { vocab, unk_token: '[UNK]', continuing_subword_prefix: '##', max_input_chars_per_word: 100 },
        post_processor: { special_tokens: { '[CLS]': { ids: [2] }, '[SEP]': { ids: [3] } } },
      }),
      'utf8',
    );
    return new WordPieceTokenizer(file, 8, 8);
  };

  const ids = (t: WordPieceTokenizer, text: string): number[] => {
    const e = t.encode(text);
    return e.ids.filter((_, i) => e.attentionMask[i] === 1);
  };

  test('wraps the sequence in [CLS] and [SEP]', () => {
    expect(ids(tiny(), 'design')).toEqual([2, 5, 3]);
  });

  test('continues a word with the ## prefix, longest match first', () => {
    expect(ids(tiny(), 'tokenise')).toEqual([2, 8, 9, 3]);
  });

  test('a word with no covering pieces is [UNK] as a whole', () => {
    expect(ids(tiny(), 'unmatchable')).toEqual([2, 1, 3]);
  });

  test('padding fills to the fixed width and is masked out', () => {
    const e = tiny().encode('design');
    expect(e.ids).toHaveLength(8);
    expect(e.attentionMask).toEqual([1, 1, 1, 0, 0, 0, 0, 0]);
    expect(e.ids.slice(3)).toEqual([0, 0, 0, 0, 0]);
  });

  test('truncation leaves room for both special tokens', () => {
    const e = tiny().encode('design schema design schema design schema');
    expect(e.ids.filter((_, i) => e.attentionMask[i] === 1)).toHaveLength(8);
    expect(e.ids[0]).toBe(2);
    expect(e.ids[7]).toBe(3);
  });

  test('an added token in the text keeps its own id', () => {
    expect(ids(tiny(), 'design [MASK] schema')).toEqual([2, 5, 4, 6, 3]);
  });
});

describe.skipIf(!existsSync(REAL))('against the real vocabulary (needs the model: pnpm mcp:index)', () => {
  const real = (): WordPieceTokenizer => new WordPieceTokenizer(REAL, 256, 256);

  const ids = (text: string): number[] => {
    const e = real().encode(text);
    return e.ids.filter((_, i) => e.attentionMask[i] === 1);
  };

  test.each([
    ['how do I show a validation error on a form field', [101, 2129, 2079, 1045, 2265, 1037, 27354, 7561, 2006, 1037, 2433, 2492, 102]],
    ['Heading — When not to use', [101, 5825, 1517, 2043, 2025, 2000, 2224, 102]],
    ['--color-action-{variant}-background', [101, 1011, 1011, 3609, 1011, 2895, 1011, 1063, 8349, 1065, 1011, 4281, 102]],
  ])('%s', (text, expected) => {
    expect(ids(text)).toEqual(expected);
  });

  test('every document is padded to the model\'s 256-token window', () => {
    const e = real().encode('short');
    expect(e.ids).toHaveLength(256);
    expect(e.attentionMask.reduce((a, b) => a + b, 0)).toBe(3);
  });

  test('a long document is truncated to the window, specials included', () => {
    const e = real().encode('design schema '.repeat(500));
    expect(e.ids).toHaveLength(256);
    expect(e.attentionMask.every((m) => m === 1)).toBe(true);
    expect(e.ids[0]).toBe(101);
    expect(e.ids[255]).toBe(102);
  });
});
