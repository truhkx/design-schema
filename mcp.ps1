# Installs the MCP server deps, builds the vector index, and runs the smoke test. Logs to logs\mcp.log.
#   powershell -ExecutionPolicy Bypass -File .\mcp.ps1
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
$py = $null
foreach ($c in @("py", "python", "python3")) {
  if (Get-Command $c -ErrorAction SilentlyContinue) { $probe = & $c -c "print(1)" 2>&1; if ("$probe" -match "^1") { $py = $c; break } }
}
if (-not $py) { "No working Python found. Open a NEW terminal after installing Python, or: winget install Python.Python.3.12" | Tee-Object -FilePath logs\mcp.log; exit 1 }
"Using $py" | Tee-Object -FilePath logs\mcp.log
& $py -m pip install -r tools\requirements.txt 2>&1 | Tee-Object -FilePath logs\mcp.log -Append
& $py mcp\index.py 2>&1 | Tee-Object -FilePath logs\mcp.log -Append
& $py mcp\smoke.py 2>&1 | Tee-Object -FilePath logs\mcp.log -Append
