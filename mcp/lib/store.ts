/**
 * The vector index on disk: `mcp/.chroma/chroma.sqlite3`, in the format the Python indexer's ChromaDB
 * wrote it — the schema in `mcp/chroma-schema.sql` is that database's own DDL, replayed verbatim, and
 * the rows keep Chroma's encodings (`FLOAT32` little-endian vector blobs, the document under the
 * `chroma:document` metadata key, decimal-digit `seq_id` blobs).
 *
 * What is not written is the `hnsw-local-persisted` segment directory beside it: an hnswlib binary plus a
 * Python pickle, holding an *approximate* nearest-neighbour index over the same vectors. There is no
 * embedded Chroma for Node (the `chromadb` npm package is an HTTP client for a running server), so the
 * search below reads the vectors and scans them exactly, which for 1,500 chunks is both faster than the
 * index build and strictly more accurate than the graph it replaces.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { REPO_ROOT } from '../../tools/lib/root.ts';

export const DB_PATH: string = join(REPO_ROOT, 'mcp', '.chroma');
export const DB_FILE: string = join(DB_PATH, 'chroma.sqlite3');
export const SCHEMA_SQL: string = join(REPO_ROOT, 'mcp', 'chroma-schema.sql');
export const COLLECTION = 'design-schema';
export const DIMENSION = 384;

const TENANT = 'default_tenant';
const DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const DOCUMENT_KEY = 'chroma:document';
const METADATA_SEGMENT = 'urn:chroma:segment/metadata/sqlite';
const VECTOR_SEGMENT = 'urn:chroma:segment/vector/hnsw-local-persisted';
const OPERATION_UPSERT = 2; // chromadb's Operation.UPSERT

export type Meta = Record<string, string>;
export type Chunk = { id: string; text: string; meta: Meta };
export type Stored = Chunk & { vector: Float32Array };

/** One `{ "hnsw:space": "cosine" }` collection, described the way Chroma describes its own. */
function schemaStr(keys: string[]): string {
  const hnsw = { ef_construction: 100, max_neighbors: 16, ef_search: 100, num_threads: 32, batch_size: 100, sync_threshold: 1000, resize_factor: 1.2 };
  const known = { type: 'known', name: 'default', config: {} };
  const inverted = { string: { fts_index: { enabled: false, config: {} }, string_inverted_index: { enabled: true, config: {} } } };
  return JSON.stringify({
    defaults: {
      string: inverted.string,
      float_list: { vector_index: { enabled: false, config: { space: 'cosine', embedding_function: known, hnsw } } },
      sparse_vector: { sparse_vector_index: { enabled: false, config: { embedding_function: { type: 'unknown' }, bm25: false } } },
      int: { int_inverted_index: { enabled: true, config: {} } },
      float: { float_inverted_index: { enabled: true, config: {} } },
      bool: { bool_inverted_index: { enabled: true, config: {} } },
    },
    keys: {
      ...Object.fromEntries(keys.map((k) => [k, inverted])),
      '#document': { string: { fts_index: { enabled: true, config: {} }, string_inverted_index: { enabled: false, config: {} } } },
      '#embedding': { float_list: { vector_index: { enabled: true, config: { space: 'cosine', embedding_function: known, source_key: '#document', hnsw } } } },
    },
  });
}

/** Chroma writes a `SeqId` as the decimal digits of the number, as bytes. */
function seqBlob(n: number): Uint8Array {
  return new TextEncoder().encode(String(n));
}

function vectorBlob(v: Float32Array): Uint8Array {
  return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
}

/** Replace the index with `chunks` and their `vectors`. */
export function writeIndex(chunks: Chunk[], vectors: Float32Array[]): void {
  rmSync(DB_PATH, { recursive: true, force: true });
  mkdirSync(DB_PATH, { recursive: true });
  // Python's sqlite3 leaves foreign keys off, and Chroma's schema relies on it: `segments.collection`
  // references a table named `collection`, which its own DDL spells `collections`.
  const db = new DatabaseSync(DB_FILE, { enableForeignKeyConstraints: false });
  try {
    db.exec(readFileSync(SCHEMA_SQL, 'utf8'));
    const collectionId = randomUUID();
    const metadataSegment = randomUUID();
    const vectorSegment = randomUUID();
    const keys = [...new Set(chunks.flatMap((c) => Object.keys(c.meta)))].sort();
    db.exec('BEGIN');
    db.prepare('INSERT INTO tenants (id) VALUES (?)').run(TENANT);
    db.prepare('INSERT INTO databases (id, name, tenant_id) VALUES (?, ?, ?)').run(DATABASE_ID, 'default_database', TENANT);
    db.prepare('INSERT INTO collections (id, name, dimension, database_id, config_json_str, schema_str) VALUES (?, ?, ?, ?, ?, ?)').run(
      collectionId, COLLECTION, DIMENSION, DATABASE_ID, '{}', schemaStr(keys),
    );
    db.prepare('INSERT INTO collection_metadata (collection_id, key, str_value) VALUES (?, ?, ?)').run(collectionId, 'hnsw:space', 'cosine');
    const segment = db.prepare('INSERT INTO segments (id, type, scope, collection) VALUES (?, ?, ?, ?)');
    segment.run(vectorSegment, VECTOR_SEGMENT, 'VECTOR', collectionId);
    segment.run(metadataSegment, METADATA_SEGMENT, 'METADATA', collectionId);
    db.prepare('INSERT INTO embeddings_queue_config (id, config_json_str) VALUES (?, ?)').run(
      // The queue is this index's vector store, so it is never trimmed behind the reader's back.
      1, JSON.stringify({ automatically_purge: false, _type: 'EmbeddingsQueueConfigurationInternal' }),
    );

    const embedding = db.prepare('INSERT INTO embeddings (id, segment_id, embedding_id, seq_id) VALUES (?, ?, ?, ?)');
    const meta = db.prepare('INSERT INTO embedding_metadata (id, key, string_value) VALUES (?, ?, ?)');
    const fulltext = db.prepare('INSERT INTO embedding_fulltext_search (rowid, string_value) VALUES (?, ?)');
    const queue = db.prepare('INSERT INTO embeddings_queue (seq_id, operation, topic, id, vector, encoding, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const topic = `persistent://default/default/${collectionId}`;
    for (const [i, chunk] of chunks.entries()) {
      const seq = i + 1;
      embedding.run(seq, metadataSegment, chunk.id, seqBlob(seq));
      for (const [k, v] of Object.entries(chunk.meta)) meta.run(seq, k, v);
      meta.run(seq, DOCUMENT_KEY, chunk.text);
      fulltext.run(seq, chunk.text);
      queue.run(seq, OPERATION_UPSERT, topic, chunk.id, vectorBlob(vectors[i] as Float32Array), 'FLOAT32', JSON.stringify({ ...chunk.meta, [DOCUMENT_KEY]: chunk.text }));
    }
    const maxSeq = db.prepare('INSERT INTO max_seq_id (segment_id, seq_id) VALUES (?, ?)');
    maxSeq.run(metadataSegment, seqBlob(chunks.length));
    maxSeq.run(vectorSegment, seqBlob(chunks.length));
    db.exec('COMMIT');
  } finally {
    db.close();
  }
}

/** Every chunk with its vector, in insertion order. Throws when the index has not been built. */
export function readIndex(): Stored[] {
  const db = new DatabaseSync(DB_FILE, { readOnly: true });
  try {
    const metas = new Map<number, Meta>();
    for (const row of db.prepare('SELECT id, key, string_value FROM embedding_metadata WHERE string_value IS NOT NULL').all() as { id: number; key: string; string_value: string }[]) {
      let m = metas.get(row.id);
      if (!m) metas.set(row.id, (m = {}));
      m[row.key] = row.string_value;
    }
    const vectors = new Map<string, Float32Array>();
    for (const row of db.prepare('SELECT id, vector FROM embeddings_queue').all() as { id: string; vector: Uint8Array }[]) {
      vectors.set(row.id, new Float32Array(row.vector.buffer.slice(row.vector.byteOffset, row.vector.byteOffset + row.vector.byteLength)));
    }
    const out: Stored[] = [];
    for (const row of db.prepare('SELECT id, embedding_id FROM embeddings ORDER BY id').all() as { id: number; embedding_id: string }[]) {
      const { [DOCUMENT_KEY]: text, ...meta } = metas.get(row.id) ?? {};
      out.push({ id: row.embedding_id, text: text ?? '', meta, vector: vectors.get(row.embedding_id) as Float32Array });
    }
    return out;
  } finally {
    db.close();
  }
}
