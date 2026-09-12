# Design Schema - one-shot setup. Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File .\setup.ps1
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null

Write-Host "== 1/3 pnpm ==" -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  npm install -g pnpm@10 2>&1 | Tee-Object -FilePath logs\pnpm-setup.log
}
pnpm --version 2>&1 | Tee-Object -FilePath logs\pnpm-setup.log -Append

Write-Host "== 2/3 pnpm install + rebuild natives ==" -ForegroundColor Cyan
pnpm install 2>&1 | Tee-Object -FilePath logs\install.log
pnpm rebuild 2>&1 | Tee-Object -FilePath logs\install.log -Append

# Node is the whole toolchain: every tool under tools/ is TypeScript, run by `node --import tsx`.
Write-Host "== 3/3 typecheck ==" -ForegroundColor Cyan
pnpm typecheck 2>&1 | Tee-Object -FilePath logs\typecheck.log

Write-Host ""
Write-Host "Done. Logs are in .\logs - tell Claude to read them." -ForegroundColor Green
