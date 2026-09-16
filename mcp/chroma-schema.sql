-- The Chroma (chromadb 1.5.9) persistent sqlite schema, dumped from a database the Python
-- indexer built. mcp/lib/store.ts replays it so `pnpm mcp:index` writes the same file format.
-- How it was made: ChromaDB 1.5.9 built an mcp/.chroma/chroma.sqlite3, which was opened with node:sqlite.
-- Every DDL statement came from sqlite_master (skipping the fts5 embedding_fulltext_search_* shadow tables,
-- which the fts5 virtual table creates itself), followed by an INSERT for each row of the migrations table.

CREATE TABLE migrations (
                dir TEXT NOT NULL,
                version INTEGER NOT NULL,
                filename TEXT NOT NULL,
                sql TEXT NOT NULL,
                hash TEXT NOT NULL,
                PRIMARY KEY (dir, version)
            );

CREATE TABLE acquire_write (
                id INTEGER PRIMARY KEY,
                lock_status INTEGER NOT NULL
            );

CREATE TABLE collection_metadata (
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    str_value TEXT,
    int_value INTEGER,
    float_value REAL, bool_value INTEGER,
    PRIMARY KEY (collection_id, key)
);

CREATE TABLE segment_metadata (
    segment_id TEXT  REFERENCES segments(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    str_value TEXT,
    int_value INTEGER,
    float_value REAL, bool_value INTEGER,
    PRIMARY KEY (segment_id, key)
);

CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    UNIQUE (id)
);

CREATE TABLE databases (
    id TEXT PRIMARY KEY, -- unique globally
    name TEXT NOT NULL, -- unique per tenant
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name) -- Ensure that a tenant has only one database with a given name
);

CREATE TABLE "collections" (
    id TEXT PRIMARY KEY, -- unique globally
    name TEXT NOT NULL, -- unique per database
    dimension INTEGER,
    database_id TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE, config_json_str TEXT, schema_str TEXT,
    UNIQUE (name, database_id)
);

CREATE TABLE maintenance_log (
  id INT PRIMARY KEY,
  timestamp INT NOT NULL,
  operation TEXT NOT NULL
);

CREATE TABLE "segments" (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    scope TEXT NOT NULL,
    collection TEXT REFERENCES collection(id) NOT NULL
);

CREATE TABLE embeddings (
    id INTEGER PRIMARY KEY,
    segment_id TEXT NOT NULL,
    embedding_id TEXT NOT NULL,
    seq_id BLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (segment_id, embedding_id)
);

CREATE TABLE embedding_metadata (
    id INTEGER REFERENCES embeddings(id),
    key TEXT NOT NULL,
    string_value TEXT,
    int_value INTEGER,
    float_value REAL, bool_value INTEGER,
    PRIMARY KEY (id, key)
);

CREATE TABLE max_seq_id (
    segment_id TEXT PRIMARY KEY,
    seq_id INTEGER);

CREATE VIRTUAL TABLE embedding_fulltext_search USING fts5(string_value, tokenize='trigram');

CREATE INDEX embedding_metadata_int_value ON embedding_metadata (key, int_value) WHERE int_value IS NOT NULL;

CREATE INDEX embedding_metadata_float_value ON embedding_metadata (key, float_value) WHERE float_value IS NOT NULL;

CREATE INDEX embedding_metadata_string_value ON embedding_metadata (key, string_value) WHERE string_value IS NOT NULL;

CREATE TABLE embedding_metadata_array (
    id INTEGER NOT NULL REFERENCES embeddings(id),
    key TEXT NOT NULL,
    string_value TEXT,
    int_value INTEGER,
    float_value REAL,
    bool_value INTEGER
);

CREATE INDEX embedding_metadata_array_id_key
    ON embedding_metadata_array (id, key);

CREATE INDEX embedding_metadata_array_key_string
    ON embedding_metadata_array (key, string_value) WHERE string_value IS NOT NULL;

CREATE INDEX embedding_metadata_array_key_int
    ON embedding_metadata_array (key, int_value) WHERE int_value IS NOT NULL;

CREATE INDEX embedding_metadata_array_key_float
    ON embedding_metadata_array (key, float_value) WHERE float_value IS NOT NULL;

CREATE TABLE embeddings_queue (
    seq_id INTEGER PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation INTEGER NOT NULL,
    topic TEXT NOT NULL,
    id TEXT NOT NULL,
    vector BLOB,
    encoding TEXT,
    metadata TEXT
);

CREATE TABLE embeddings_queue_config (
    id INTEGER PRIMARY KEY,
    config_json_str TEXT
);

-- The migration rows chromadb checks the schema against.
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('embeddings_queue', 1, '00001-embeddings.sqlite.sql', 'CREATE TABLE embeddings_queue (
    seq_id INTEGER PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation INTEGER NOT NULL,
    topic TEXT NOT NULL,
    id TEXT NOT NULL,
    vector BLOB,
    encoding TEXT,
    metadata TEXT
);
', 'd3755dfd232be8e8301f4d7fcfb3a486');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('embeddings_queue', 2, '00002-embeddings-queue-config.sqlite.sql', 'CREATE TABLE embeddings_queue_config (
    id INTEGER PRIMARY KEY,
    config_json_str TEXT
);
', '8fbfe4ffb3e57f1d8bfdc58510a82e85');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 1, '00001-embedding-metadata.sqlite.sql', 'CREATE TABLE embeddings (
    id INTEGER PRIMARY KEY,
    segment_id TEXT NOT NULL,
    embedding_id TEXT NOT NULL,
    seq_id BLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (segment_id, embedding_id)
);

CREATE TABLE embedding_metadata (
    id INTEGER REFERENCES embeddings(id),
    key TEXT NOT NULL,
    string_value TEXT,
    int_value INTEGER,
    float_value REAL,
    PRIMARY KEY (id, key)
);

CREATE TABLE max_seq_id (
    segment_id TEXT PRIMARY KEY,
    seq_id BLOB NOT NULL
);

CREATE VIRTUAL TABLE embedding_fulltext USING fts5(id, string_value);
', '2b4cf52c4bb2676e21d6860a4409f856');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 2, '00002-embedding-metadata.sqlite.sql', '-- SQLite does not support adding check with alter table, as a result, adding a check
-- involve creating a new table and copying the data over. It is over kill with adding
-- a boolean type column. The application write to the table needs to ensure the data
-- integrity.
ALTER TABLE embedding_metadata ADD COLUMN bool_value INTEGER
', '12a570f7121b3a8ce750a2a7c36da20f');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 3, '00003-full-text-tokenize.sqlite.sql', 'CREATE VIRTUAL TABLE embedding_fulltext_search USING fts5(string_value, tokenize=''trigram'');
INSERT INTO embedding_fulltext_search (rowid, string_value) SELECT rowid, string_value FROM embedding_metadata;
DROP TABLE embedding_fulltext;
', 'f97ad6334aeaa8f419f01110b648b97a');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 4, '00004-metadata-indices.sqlite.sql', 'CREATE INDEX IF NOT EXISTS embedding_metadata_int_value ON embedding_metadata (key, int_value) WHERE int_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS embedding_metadata_float_value ON embedding_metadata (key, float_value) WHERE float_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS embedding_metadata_string_value ON embedding_metadata (key, string_value) WHERE string_value IS NOT NULL;
', 'fb36603a45ee2cd0254cef3ef86585e8');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 5, '00005-max-seq-id-int.sqlite.sql', 'ALTER TABLE max_seq_id ADD COLUMN int_seq_id INTEGER;

-- Convert 8 byte wide big-endian integer as blob to native 64 bit integer.
-- Adapted from https://stackoverflow.com/a/70296198.
UPDATE max_seq_id SET int_seq_id = (
  SELECT (
       (instr(''123456789ABCDEF'', substr(hex(seq_id), -1 , 1)) <<  0)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -2 , 1)) <<  4)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -3 , 1)) <<  8)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -4 , 1)) << 12)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -5 , 1)) << 16)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -6 , 1)) << 20)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -7 , 1)) << 24)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -8 , 1)) << 28)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -9 , 1)) << 32)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -10, 1)) << 36)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -11, 1)) << 40)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -12, 1)) << 44)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -13, 1)) << 48)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -14, 1)) << 52)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -15, 1)) << 56)
     | (instr(''123456789ABCDEF'', substr(hex(seq_id), -16, 1)) << 60)
    )
);

ALTER TABLE max_seq_id DROP COLUMN seq_id;
ALTER TABLE max_seq_id RENAME COLUMN int_seq_id TO seq_id;
', '0e9de46758761b373ce682925edcc326');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('metadb', 6, '00006-metadata-array-support.sqlite.sql', '-- Separate table for exploded array metadata values.
-- Each array element gets its own row, enabling efficient $contains queries.
-- The existing embedding_metadata table (with its PRIMARY KEY (id, key))
-- remains untouched and continues to store scalar metadata values.

CREATE TABLE IF NOT EXISTS embedding_metadata_array (
    id INTEGER NOT NULL REFERENCES embeddings(id),
    key TEXT NOT NULL,
    string_value TEXT,
    int_value INTEGER,
    float_value REAL,
    bool_value INTEGER
);

CREATE INDEX IF NOT EXISTS embedding_metadata_array_id_key
    ON embedding_metadata_array (id, key);
CREATE INDEX IF NOT EXISTS embedding_metadata_array_key_string
    ON embedding_metadata_array (key, string_value) WHERE string_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS embedding_metadata_array_key_int
    ON embedding_metadata_array (key, int_value) WHERE int_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS embedding_metadata_array_key_float
    ON embedding_metadata_array (key, float_value) WHERE float_value IS NOT NULL;
', 'e026f01ea92c1baa1493f4ad5ca7cfe7');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 1, '00001-collections.sqlite.sql', 'CREATE TABLE collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    UNIQUE (name)
);

CREATE TABLE collection_metadata (
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    str_value TEXT,
    int_value INTEGER,
    float_value REAL,
    PRIMARY KEY (collection_id, key)
);
', '38352d725ad1c16074fac420b22b4633');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 2, '00002-segments.sqlite.sql', 'CREATE TABLE segments (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    scope TEXT NOT NULL,
    topic TEXT,
    collection TEXT REFERENCES collection(id)
);

CREATE TABLE segment_metadata (
    segment_id TEXT  REFERENCES segments(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    str_value TEXT,
    int_value INTEGER,
    float_value REAL,
    PRIMARY KEY (segment_id, key)
);
', '2913cb6a503055a95f625448037e8912');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 3, '00003-collection-dimension.sqlite.sql', 'ALTER TABLE collections ADD COLUMN dimension INTEGER;
', '42d22d0574d31d419c2a0e7f625c93aa');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 4, '00004-tenants-databases.sqlite.sql', 'CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS databases (
    id TEXT PRIMARY KEY, -- unique globally
    name TEXT NOT NULL, -- unique per tenant
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name) -- Ensure that a tenant has only one database with a given name
);

CREATE TABLE IF NOT EXISTS collections_tmp (
    id TEXT PRIMARY KEY, -- unique globally
    name TEXT NOT NULL, -- unique per database
    topic TEXT NOT NULL,
    dimension INTEGER,
    database_id TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
    UNIQUE (name, database_id)
);

-- Create default tenant and database
INSERT OR REPLACE INTO tenants (id) VALUES (''default_tenant''); -- The default tenant id is ''default_tenant'' others are UUIDs
INSERT OR REPLACE INTO databases (id, name, tenant_id) VALUES (''00000000-0000-0000-0000-000000000000'', ''default_database'', ''default_tenant'');

INSERT OR REPLACE INTO collections_tmp (id, name, topic, dimension, database_id)
    SELECT id, name, topic, dimension, ''00000000-0000-0000-0000-000000000000'' FROM collections;
DROP TABLE collections;
ALTER TABLE collections_tmp RENAME TO collections;
', '048867ce8fcdefe4023c7110e4433591');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 5, '00005-remove-topic.sqlite.sql', '-- Remove the topic column from the Collections and Segments tables

ALTER TABLE collections DROP COLUMN topic;
ALTER TABLE segments DROP COLUMN topic;
', 'b1367c826b8fba5f96f27befdc1d42d2');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 6, '00006-collection-segment-metadata.sqlite.sql', '-- SQLite does not support adding check with alter table, as a result, adding a check
-- involve creating a new table and copying the data over. It is over kill with adding
-- a boolean type column. The application write to the table needs to ensure the data
-- integrity.
ALTER TABLE collection_metadata ADD COLUMN bool_value INTEGER;
ALTER TABLE segment_metadata ADD COLUMN bool_value INTEGER;
', '4eea7468935bf25d4604a0fed2366116');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 7, '00007-collection-config.sqlite.sql', '-- Stores collection configuration dictionaries.
ALTER TABLE collections ADD COLUMN config_json_str TEXT;
', '1c7e63bba346a42a18b6ab7f1c989bed');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 8, '00008-maintenance-log.sqlite.sql', '-- Records when database maintenance operations are performed.
-- At time of creation, this table is only used to record vacuum operations.
CREATE TABLE maintenance_log (
  id INT PRIMARY KEY,
  timestamp INT NOT NULL,
  operation TEXT NOT NULL
);
', '0a0e7e93111a01789addf64961c6127c');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 9, '00009-segment-collection-not-null.sqlite.sql', '-- This makes segments.collection non-nullable.
CREATE TABLE segments_temp (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    scope TEXT NOT NULL,
    collection TEXT REFERENCES collection(id) NOT NULL
);

INSERT INTO segments_temp SELECT * FROM segments;
DROP TABLE segments;
ALTER TABLE segments_temp RENAME TO segments;
', '054355aef9e63702bf54ea29e61563f1');
INSERT INTO migrations (dir, version, filename, sql, hash) VALUES ('sysdb', 10, '00010-collection-schema.sqlite.sql', '-- Stores collection schema as stringified json
ALTER TABLE collections ADD COLUMN schema_str TEXT;
', '5c3a5ac4b79df76799b4721827ed5e1d');
