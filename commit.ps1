# Commit with the session attribution. ASCII only.
#   powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m "regen: phase Core"                      # stage everything
#   powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m "job: 80-rn-svg.md" -Paths tools/x.ts,tools/__tests__/x.test.ts   # only these paths
# regen.ps1 calls the first form to snapshot generated code; the job queue uses -Paths so a job commit never
# sweeps in the generator's in-progress files (its lockfile, gap reports and package sources).
param(
  [Parameter(Mandatory = $true)][string]$m,
  [string[]]$Paths = @()
)
Set-Location $PSScriptRoot
$Paths = @($Paths | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' })
if ($Paths.Count -gt 0) { git add -- $Paths } else { git add -A }
$staged = git diff --cached --name-only
if (-not $staged) { Write-Host "nothing to commit"; exit 0 }
$msg = "$m`n`nCo-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`nClaude-Session: https://claude.ai/code/session_01EY5FxjReyBuoj5YQxZSA6R"
git -c core.safecrlf=false commit -q -m $msg
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git log --oneline -1
