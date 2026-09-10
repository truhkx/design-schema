Make tools/generate.py safe to run in three PowerShell windows at once, one per platform (regen.ps1 -Platform web / lit / rn):

1. The lockfile becomes one file per platform: generated/generate.lock.<platform>.json, each written only by runs of that platform. `--check` and `--stale` read all three and report as today; keep a `load_lock()` that merges them into the in-memory dict the rest of the code uses, and a `save_lock(platform)` that writes only that platform's entries. Migrate the existing generated/generate.lock.json into the three files on first run and delete it.
2. Gap files are already per target (generated/gaps/<Name>.<platform>.md) so they do not collide; confirm record_gaps never writes a shared file.
3. The `parse` and `contrast` gates read docs and write generated/components.json and generated/prompts/*.md. Three concurrent runs could race on those writes. Make the preflight parse in generate.py write to a temp path and compare rather than overwrite when the content is unchanged, and make tools/parse.py's writes atomic (write to <file>.tmp then os.replace).
4. The typecheck gate runs `pnpm --filter @design-schema/<pkg> typecheck`; confirm each package's tsconfig does not include the other packages so the three runs are independent.
5. Add tests in tests/test_generate_lock.py: two platforms saving alternately do not lose each other's entries; `--check` merges.
Run `pytest -q`; do not modify anything under packages/*/src or generated/ except the lock migration.
