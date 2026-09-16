# Stage and commit through tools/commit.ts. ASCII only.
#   powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m "regen: phase Core"                      # stage everything
#   powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m "fold: Button" -Paths tools/x.ts,tools/__tests__/x.test.ts   # only these paths
# regen.ps1 calls the first form to snapshot generated code after every phase. On any OS the same
# commit is `pnpm commit -m <message> [--paths a,b]`.
# Trailers: none by default, so the commit message is -m alone. To append trailer lines, add one git
# config value per line (git config --local --add ds.commitTrailer "Signed-off-by: Name <email>"),
# or set DS_COMMIT_TRAILERS for a single run. The header of tools/commit.ts documents both.
param(
  [Parameter(Mandatory = $true)][string]$m,
  [string[]]$Paths = @()
)
Set-Location $PSScriptRoot
$Paths = @($Paths | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' })
$argv = @('--import', 'tsx', 'tools/commit.ts', '-m', $m)
if ($Paths.Count -gt 0) { $argv += @('--paths', ($Paths -join ',')) }
node @argv
exit $LASTEXITCODE
