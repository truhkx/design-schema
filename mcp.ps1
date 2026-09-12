# Builds the MCP server's vector index and runs the smoke test. Logs to logs\mcp.log.
#   powershell -ExecutionPolicy Bypass -File .\mcp.ps1
# The server, the index and the smoke test are TypeScript (@modelcontextprotocol/sdk + onnxruntime-node),
# run by Node through the package.json scripts; `pnpm install` is the only prerequisite.
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
pnpm mcp:index 2>&1 | Tee-Object -FilePath logs\mcp.log
pnpm mcp:smoke 2>&1 | Tee-Object -FilePath logs\mcp.log -Append
