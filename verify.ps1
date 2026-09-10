# Verifies the two builds not yet exercised: Style Dictionary tokens and the Astro docs site. Logs to logs\verify.log
#   powershell -ExecutionPolicy Bypass -File .\verify.ps1
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
"== pnpm tokens (Style Dictionary) ==" | Tee-Object -FilePath logs\verify.log
pnpm tokens 2>&1 | Tee-Object -FilePath logs\verify.log -Append
"== pnpm --filter site build (Astro Starlight) ==" | Tee-Object -FilePath logs\verify.log -Append
pnpm --filter site build 2>&1 | Tee-Object -FilePath logs\verify.log -Append
"== done ==" | Tee-Object -FilePath logs\verify.log -Append
