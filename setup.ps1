# Design Schema - one-shot setup. Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File .\setup.ps1
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null

Write-Host "== 1/4 pnpm ==" -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  npm install -g pnpm@10 2>&1 | Tee-Object -FilePath logs\pnpm-setup.log
}
pnpm --version 2>&1 | Tee-Object -FilePath logs\pnpm-setup.log -Append

Write-Host "== 2/4 pnpm install + rebuild natives ==" -ForegroundColor Cyan
pnpm install 2>&1 | Tee-Object -FilePath logs\install.log
pnpm rebuild 2>&1 | Tee-Object -FilePath logs\install.log -Append

Write-Host "== 3/4 python deps ==" -ForegroundColor Cyan
# Prefer the real Windows launcher; the Store's python3.exe/python.exe aliases are stubs.
$py = $null
foreach ($c in @("py", "python", "python3")) {
  if (Get-Command $c -ErrorAction SilentlyContinue) {
    $probe = & $c -c "print(1)" 2>&1
    if ("$probe" -match "^1") { $py = $c; break }
  }
}
if ($py) {
  & $py -m pip install -r tools\requirements.txt 2>&1 | Tee-Object -FilePath logs\pip.log
  & $py --version 2>&1 | Tee-Object -FilePath logs\pip.log -Append
} else {
  "No working Python found (tried py, python, python3). Install with: winget install Python.Python.3.12  then re-run." | Tee-Object -FilePath logs\pip.log
}

Write-Host "== 4/4 typecheck ==" -ForegroundColor Cyan
pnpm typecheck 2>&1 | Tee-Object -FilePath logs\typecheck.log

Write-Host ""
Write-Host "Done. Logs are in .\logs - tell Claude to read them." -ForegroundColor Green
