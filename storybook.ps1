# Starts the React (6007), Lit (6008), React Native (6009) Storybooks and the composed root at http://localhost:6006
#   powershell -ExecutionPolicy Bypass -File .\storybook.ps1
# Ctrl+C stops all of them. Output streams to logs\storybook.log so Claude can read it.
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
pnpm storybook 2>&1 | Tee-Object -FilePath logs\storybook.log
