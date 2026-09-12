/**
 * The BERT WordPiece tokenizer the index's embedding model wants, read from the model's own
 * `tokenizer.json` — a port of the pieces of Hugging Face `tokenizers` that file selects:
 * `BertNormalizer` (clean text, pad CJK, strip accents, lowercase), `BertPreTokenizer`
 * (whitespace then punctuation), the `WordPiece` model (greedy longest match, `##` continuations)
 * and `TemplateProcessing` (`[CLS] … [SEP]`), plus the added-token split that runs before all of it.
 *
 * Ported rather than taken from a library because the ids have to be the ones Python produced:
 * a different tokenization is a different embedding, and the smoke transcript's scores would move.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { readFileSync } from 'node:fs';

export type Encoding = { ids: number[]; attentionMask: number[] };

type TokenizerFile = {
  added_tokens: { id: number; content: string }[];
  model: { vocab: Record<string, number>; unk_token: string; continuing_subword_prefix: string; max_input_chars_per_word: number };
  post_processor: { special_tokens: Record<string, { ids: number[] }> };
};

// `char.is_other()` in the Rust normalizer: the C* categories. `\t`, `\n` and `\r` are excluded by
// the caller, and every Z* separator is whitespace below rather than a control character.
const CONTROL = /\p{C}/u;
const WHITESPACE = /\s|\p{Z}/u;
const ACCENT = /\p{Mn}/u;
// `is_bert_punc`: the four ASCII runs BERT calls punctuation whatever their category, plus P*.
const PUNCTUATION = /[!-/:-@[-`{-~]|\p{P}/u;

/** `BertNormalizer::do_handle_chinese_chars` — the CJK blocks each get a space on both sides. */
const CJK: [number, number][] = [
  [0x4e00, 0x9fff],
  [0x3400, 0x4dbf],
  [0x20000, 0x2a6df],
  [0x2a700, 0x2b73f],
  [0x2b740, 0x2b81f],
  [0x2b920, 0x2ceaf],
  [0xf900, 0xfaff],
  [0x2f800, 0x2fa1f],
];

function isCjk(cp: number): boolean {
  return CJK.some(([lo, hi]) => cp >= lo && cp <= hi);
}

/** `BertNormalizer`: clean text, pad CJK, strip accents, lowercase — in that order. */
export function normalize(text: string): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp === 0 || cp === 0xfffd) continue;
    if (ch !== '\t' && ch !== '\n' && ch !== '\r' && CONTROL.test(ch)) continue;
    if (WHITESPACE.test(ch)) out += ' ';
    else if (isCjk(cp)) out += ` ${ch} `;
    else out += ch;
  }
  return out.normalize('NFD').replace(new RegExp(ACCENT, 'gu'), '').toLowerCase();
}

/** `BertPreTokenizer`: split on whitespace, then peel every punctuation character off on its own. */
export function preTokenize(text: string): string[] {
  const words: string[] = [];
  for (const run of text.split(/\s+/)) {
    if (!run) continue;
    let buf = '';
    for (const ch of run) {
      if (PUNCTUATION.test(ch)) {
        if (buf) words.push(buf);
        words.push(ch);
        buf = '';
      } else {
        buf += ch;
      }
    }
    if (buf) words.push(buf);
  }
  return words;
}

export class WordPieceTokenizer {
  readonly vocab: Record<string, number>;
  readonly unkId: number;
  readonly prefix: string;
  readonly maxChars: number;
  readonly clsId: number;
  readonly sepId: number;
  /** The added tokens (`[CLS]`, `[SEP]`, …) are matched in the raw text, before normalization. */
  readonly added: { content: string; id: number }[];
  readonly maxLength: number;
  readonly padTo: number;

  constructor(file: string, maxLength = 256, padTo = 256) {
    const spec = JSON.parse(readFileSync(file, 'utf8')) as TokenizerFile;
    this.vocab = spec.model.vocab;
    this.unkId = spec.model.vocab[spec.model.unk_token] as number;
    this.prefix = spec.model.continuing_subword_prefix;
    this.maxChars = spec.model.max_input_chars_per_word;
    this.clsId = spec.post_processor.special_tokens['[CLS]']?.ids[0] as number;
    this.sepId = spec.post_processor.special_tokens['[SEP]']?.ids[0] as number;
    // Longest first, so `[MASK]` wins over any added token that is a prefix of it.
    this.added = [...spec.added_tokens].sort((a, b) => b.content.length - a.content.length).map((t) => ({ content: t.content, id: t.id }));
    this.maxLength = maxLength;
    this.padTo = padTo;
  }

  /** `WordPieceModel::tokenize` for one pre-token: greedy longest match, `[UNK]` when anything fails. */
  private word(w: string): number[] {
    const chars = [...w];
    if (chars.length > this.maxChars) return [this.unkId];
    const ids: number[] = [];
    let start = 0;
    while (start < chars.length) {
      let end = chars.length;
      let id: number | undefined;
      while (start < end) {
        const piece = (start > 0 ? this.prefix : '') + chars.slice(start, end).join('');
        id = this.vocab[piece];
        if (id !== undefined) break;
        end -= 1;
      }
      if (id === undefined) return [this.unkId];
      ids.push(id);
      start = end;
    }
    return ids;
  }

  /** The ids of one document, without the `[CLS]`/`[SEP]` the template adds. */
  private sequence(text: string): number[] {
    const ids: number[] = [];
    for (const part of this.splitAdded(text)) {
      if (typeof part === 'number') {
        ids.push(part);
        continue;
      }
      for (const w of preTokenize(normalize(part))) ids.push(...this.word(w));
    }
    return ids;
  }

  /** Raw text as a run of added-token ids and the plain stretches between them. */
  private splitAdded(text: string): (string | number)[] {
    const out: (string | number)[] = [];
    let rest = text;
    outer: while (rest) {
      let best: { at: number; token: { content: string; id: number } } | null = null;
      for (const token of this.added) {
        const at = rest.indexOf(token.content);
        if (at !== -1 && (best === null || at < best.at)) best = { at, token };
      }
      if (best === null) break outer;
      if (best.at > 0) out.push(rest.slice(0, best.at));
      out.push(best.token.id);
      rest = rest.slice(best.at + best.token.content.length);
    }
    if (rest) out.push(rest);
    return out;
  }

  /**
   * One document: truncated to `maxLength` including `[CLS]`/`[SEP]` and padded to `padTo`,
   * which is what `enable_truncation(256)` + `enable_padding(length=256)` do in the Python function.
   */
  encode(text: string): Encoding {
    const body = this.sequence(text).slice(0, this.maxLength - 2);
    const ids = [this.clsId, ...body, this.sepId];
    const attentionMask = ids.map(() => 1);
    while (ids.length < this.padTo) {
      ids.push(0);
      attentionMask.push(0);
    }
    return { ids, attentionMask };
  }
}
