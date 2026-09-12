/**
 * The index's embedding function: all-MiniLM-L6-v2 as ONNX, mean-pooled and L2-normalised — a port of
 * chromadb's `ONNXMiniLM_L6_V2`, down to the archive it downloads, the cache directory it unpacks into,
 * the 256-token window and the batch size, because the vectors have to be the ones the Python index held.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

import * as ort from 'onnxruntime-node';

import { WordPieceTokenizer } from './wordpiece.ts';

export const MODEL_NAME = 'all-MiniLM-L6-v2';
export const DOWNLOAD_PATH: string = join(homedir(), '.cache', 'chroma', 'onnx_models', MODEL_NAME);
export const EXTRACTED_FOLDER_NAME = 'onnx';
export const ARCHIVE_FILENAME = 'onnx.tar.gz';
export const MODEL_DOWNLOAD_URL = `https://chroma-onnx-models.s3.amazonaws.com/${MODEL_NAME}/${ARCHIVE_FILENAME}`;
const MODEL_SHA256 = '913d7300ceae3b2dbc2c50d1de4baacab4be7b9380491c27fab7418616a16ec3';

export const MAX_TOKENS = 256;
const BATCH_SIZE = 32;

/** The two files the archive must yield; `ensureModel` re-downloads when either is missing. */
const MODEL_FILE = 'model.onnx';
const TOKENIZER_FILE = 'tokenizer.json';

export function modelDir(): string {
  return join(DOWNLOAD_PATH, EXTRACTED_FOLDER_NAME);
}

/** Read a ustar archive: `{ name → bytes }` for every regular file in it. */
function untar(buf: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  for (let off = 0; off + 512 <= buf.length; ) {
    const header = buf.subarray(off, off + 512);
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    if (!name) break; // two zero blocks end the archive
    const size = parseInt(header.subarray(124, 136).toString('ascii').replace(/[\0 ].*$/, ''), 8) || 0;
    const type = String.fromCharCode(header[156] as number);
    const start = off + 512;
    if (type === '0' || type === '\0') files.set(name.replace(/^\.\//, ''), buf.subarray(start, start + size));
    off = start + Math.ceil(size / 512) * 512;
  }
  return files;
}

/** Download and unpack the model the first time it is needed, as the Python function did. */
async function ensureModel(log: (line: string) => void): Promise<void> {
  const dir = modelDir();
  if (existsSync(join(dir, MODEL_FILE)) && existsSync(join(dir, TOKENIZER_FILE))) return;
  mkdirSync(DOWNLOAD_PATH, { recursive: true });
  const archive = join(DOWNLOAD_PATH, ARCHIVE_FILENAME);
  let bytes: Buffer;
  if (existsSync(archive) && sha256(readFileSync(archive)) === MODEL_SHA256) {
    bytes = readFileSync(archive);
  } else {
    log(`  downloading ${MODEL_DOWNLOAD_URL}`);
    const res = await fetch(MODEL_DOWNLOAD_URL);
    if (!res.ok) throw new Error(`Could not download the embedding model: ${res.status} ${res.statusText}`);
    bytes = Buffer.from(await res.arrayBuffer());
    if (sha256(bytes) !== MODEL_SHA256) throw new Error(`Downloaded file ${archive} does not match expected SHA256 hash. Corrupted download or malicious file.`);
    writeFileSync(archive, bytes);
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [name, data] of untar(gunzipSync(bytes))) {
    if (!name.startsWith(`${EXTRACTED_FOLDER_NAME}/`)) continue;
    writeFileSync(join(DOWNLOAD_PATH, name), data);
  }
  if (!existsSync(join(dir, MODEL_FILE))) throw new Error(`${MODEL_FILE} is missing from ${ARCHIVE_FILENAME}`);
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export type Embedder = (documents: string[]) => Promise<Float32Array[]>;

/**
 * Load the model (downloading it once) and return the function that embeds a list of documents.
 * `log` receives the download line; nothing else is printed, so a tool's transcript stays its own.
 */
export async function loadEmbedder(log: (line: string) => void = () => {}): Promise<Embedder> {
  await ensureModel(log);
  const tokenizer = new WordPieceTokenizer(join(modelDir(), TOKENIZER_FILE), MAX_TOKENS, MAX_TOKENS);
  const session = await ort.InferenceSession.create(join(modelDir(), MODEL_FILE), { logSeverityLevel: 3 });

  return async function embed(documents: string[]): Promise<Float32Array[]> {
    const out: Float32Array[] = [];
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      const encoded = batch.map((d) => tokenizer.encode(d));
      const width = MAX_TOKENS;
      const ids = new BigInt64Array(batch.length * width);
      const mask = new BigInt64Array(batch.length * width);
      const types = new BigInt64Array(batch.length * width);
      for (const [row, e] of encoded.entries()) {
        for (let t = 0; t < width; t++) {
          ids[row * width + t] = BigInt(e.ids[t] as number);
          mask[row * width + t] = BigInt(e.attentionMask[t] as number);
        }
      }
      const dims = [batch.length, width];
      const result = await session.run({
        input_ids: new ort.Tensor('int64', ids, dims),
        attention_mask: new ort.Tensor('int64', mask, dims),
        token_type_ids: new ort.Tensor('int64', types, dims),
      });
      const hidden = result[session.outputNames[0] as string] as ort.Tensor;
      const [, , depth] = hidden.dims as number[];
      const data = hidden.data as Float32Array;
      for (const [row, e] of encoded.entries()) {
        // Mean over the attended positions, then L2-normalise (pytorch's 1e-12 floor on the norm).
        const sum = new Float64Array(depth as number);
        let kept = 0;
        for (let t = 0; t < width; t++) {
          if (e.attentionMask[t] === 0) continue;
          kept += 1;
          const base = (row * width + t) * (depth as number);
          for (let d = 0; d < (depth as number); d++) sum[d] = (sum[d] as number) + (data[base + d] as number);
        }
        const divisor = Math.max(kept, 1e-9);
        let norm = 0;
        for (let d = 0; d < (depth as number); d++) {
          sum[d] = (sum[d] as number) / divisor;
          norm += (sum[d] as number) ** 2;
        }
        norm = Math.sqrt(norm) || 1e-12;
        const vector = new Float32Array(depth as number);
        for (let d = 0; d < (depth as number); d++) vector[d] = (sum[d] as number) / norm;
        out.push(vector);
      }
    }
    return out;
  };
}
