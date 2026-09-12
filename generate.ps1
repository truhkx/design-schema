# Generate platform code from a component doc, gated by the build checks. Logs (UTF-8) to logs\generate.log
#   powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Component Icon                 # web, lit, rn
#   powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Component Icon -Platform web
#   powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Component Button,Icon -Platform swiftui
#     swiftui gates on macOS in GitHub Actions: one branch per component, one round trip for the lot.
#   powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Stale                          # everything whose doc changed
#   powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Check                          # report only
# Extra arguments are passed through, e.g. -Extra "--max-rounds 4 --model opus"
param(
  [string]$Component = "",
  [string]$Platform = "web,lit,rn",
  [switch]$Stale,
  [switch]$Check,
  [switch]$Force,
  [string]$Extra = ""
)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
$log = "logs\generate.log"
function Log($line) { Write-Host $line; Add-Content -Path $log -Value $line -Encoding utf8 }
Set-Content -Path $log -Value "" -Encoding utf8
$known = @("web", "lit", "rn", "swiftui")
$requested = @($Platform.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })
$unknown = @($requested | Where-Object { $known -notcontains $_ })
if ($requested.Count -eq 0 -or $unknown.Count -gt 0) {
  Write-Host "Unknown platform '$($unknown -join ', ')'. Known: $($known -join ', ')"
  exit 1
}
$genargs = @("tools/generate.ts", "--platform", $Platform)
if ($Check) { $genargs += "--check" }
elseif ($Stale) { $genargs += "--stale" }
elseif ($Component -ne "") { $genargs += @("--component", $Component) }
else { Write-Host "Give -Component NAME, -Stale or -Check"; exit 1 }
if ($Force) { $genargs += "--force" }
if ($Extra -ne "") { $genargs += $Extra.Split(" ") }
Log "== parse (refresh prompts from docs) =="
pnpm parse 2>&1 | ForEach-Object { Log "$_" }
if ($LASTEXITCODE -ne 0) {
  Log "== parse failed: nothing generated (a doc that does not parse would fail every gate round). Fix the doc(s) above and rerun. =="
  exit 2
}
Log "== generate $($genargs -join ' ') =="
node @genargs 2>&1 | ForEach-Object { Log "$_" }
Log "== done (exit $LASTEXITCODE) =="
exit $LASTEXITCODE
