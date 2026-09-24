<#
.SYNOPSIS
  Build the website image and (re)start it with the Cloudflare Tunnel. Re-run it to deploy an update.

.DESCRIPTION
  Refuses to build while a job queue is mid-run (a file in jobs/ newer than the last commit), because the
  image validates every doc and a half-applied change fails the parse step. Then runs `pnpm check`,
  `docker compose --profile tunnel up -d --build`, waits for the website's healthcheck, and prints the
  container status and the tunnel's last log lines. README "Self-hosting" has the one-time setup.

.PARAMETER Force
  Build even if jobs/ has a file newer than the last commit.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File apps/website/deploy.ps1
#>
[CmdletBinding()]
param([switch]$Force)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$compose = Join-Path $PSScriptRoot 'compose.yaml'
$envFile = Join-Path $PSScriptRoot '.env'

function Fail([string]$message) {
  Write-Host "deploy: $message" -ForegroundColor Red
  exit 1
}

# 1. The token. Checked here so a missing one fails before a ten-minute build rather than after it.
if (-not (Test-Path $envFile)) {
  Fail "apps/website/.env is missing. Copy apps/website/.env.example to it and set TUNNEL_TOKEN."
}
$token = Get-Content $envFile | Where-Object { $_ -match '^\s*TUNNEL_TOKEN\s*=' } |
  ForEach-Object { ($_ -split '=', 2)[1].Trim().Trim('"', "'") } | Select-Object -Last 1
if ([string]::IsNullOrWhiteSpace($token)) {
  Fail "TUNNEL_TOKEN is empty in apps/website/.env (Zero Trust > Networks > Tunnels > your tunnel)."
}

Push-Location $repo
try {
  # 2. Not mid-queue.
  $lastCommit = [DateTimeOffset]::FromUnixTimeSeconds([long](git log -1 --format=%ct)).LocalDateTime
  $jobsDir = Join-Path $repo 'jobs'
  $newer = @()
  if (Test-Path $jobsDir) {
    $newer = @(Get-ChildItem $jobsDir -File -Recurse | Where-Object { $_.LastWriteTime -gt $lastCommit })
  }
  if ($newer.Count -gt 0 -and -not $Force) {
    $names = ($newer | Select-Object -First 5 | ForEach-Object { $_.Name }) -join ', '
    Fail "jobs/ has $($newer.Count) file(s) newer than the last commit ($names). A job queue may be mid-run; commit first, or pass -Force."
  }

  # 3. The tree parses (the image runs the same check and would fail later and slower).
  Write-Host 'deploy: pnpm check'
  pnpm check
  if ($LASTEXITCODE -ne 0) { Fail 'pnpm check failed; fix the tree before building the image.' }

  # 4. Build and start website + tunnel.
  Write-Host 'deploy: docker compose --profile tunnel up -d --build'
  docker compose -f $compose --profile tunnel up -d --build
  if ($LASTEXITCODE -ne 0) { Fail 'docker compose up failed.' }

  # 5. Wait for the healthcheck (cloudflared itself waits on it through depends_on).
  $id = (docker compose -f $compose ps -q website).Trim()
  $deadline = (Get-Date).AddMinutes(2)
  do {
    $health = (docker inspect --format '{{.State.Health.Status}}' $id).Trim()
    if ($health -eq 'healthy') { break }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  docker compose -f $compose --profile tunnel ps
  Write-Host ''
  Write-Host 'deploy: tunnel log (a "Registered tunnel connection" line means it is live)'
  docker compose -f $compose --profile tunnel logs --tail 20 tunnel

  if ($health -ne 'healthy') { Fail "website is '$health' after 2 minutes; see: docker compose -f apps/website/compose.yaml logs website" }
  Write-Host 'deploy: website healthy' -ForegroundColor Green
}
finally {
  Pop-Location
}
