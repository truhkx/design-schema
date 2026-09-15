# Runs the prompts in jobs\*.md through Claude Code headlessly, in order, stopping at the first failure.
#   powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1
#   powershell -ExecutionPolicy Bypass -File .\run-jobs.ps1 -Model opus -MaxTurns 250
param(
  [string]$Model = "sonnet",
  [int]$MaxTurns = 250
)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs\jobs, jobs\done, jobs\failed | Out-Null
$log = "logs\jobs\run.log"
function Log($line) { Write-Host $line; Add-Content -Path $log -Value $line -Encoding utf8 }
Set-Content -Path $log -Value "== run-jobs $(Get-Date -Format s) model=$Model ==" -Encoding utf8

$jobs = Get-ChildItem jobs\*.md | Where-Object { $_.Name -ne "README.md" } | Sort-Object Name
if ($jobs.Count -eq 0) { Log "No jobs queued."; exit 0 }
Log "Queue: $(($jobs | ForEach-Object { $_.BaseName }) -join ', ')"

$allowed = "Read,Write,Edit,MultiEdit,Glob,Grep,Bash(pnpm *),Bash(node *),Bash(git status*),Bash(git diff*)"
foreach ($job in $jobs) {
  $name = $job.BaseName
  $jobLog = "logs\jobs\$name.log"
  Log ""
  Log "==== $name  $(Get-Date -Format s) ===="
  $prompt = Get-Content $job.FullName -Raw -Encoding utf8
  $prompt = "You are working in the Design Schema repository (cwd is the repo root). Complete the task below fully, run the checks it names, and end with a short summary of files changed and anything left undone.`n`n" + $prompt
  $result = $prompt | claude -p --output-format json --permission-mode acceptEdits --model $Model --max-turns $MaxTurns --allowedTools $allowed 2>&1
  $code = $LASTEXITCODE
  $result | Out-File -FilePath $jobLog -Encoding utf8
  $ok = $false
  try {
    $json = ($result | Select-Object -Last 1) | ConvertFrom-Json
    $ok = ($code -eq 0) -and (-not $json.is_error)
    Log "  turns=$($json.num_turns) cost=`$$([math]::Round([double]$json.total_cost_usd, 3)) reason=$($json.terminal_reason)"
    Log "  result: $(($json.result -split "`n" | Select-Object -Last 8) -join "`n  ")"
  } catch {
    Log "  could not parse claude output (exit $code); see $jobLog"
  }
  if ($ok) {
    Move-Item $job.FullName "jobs\done\$($job.Name)" -Force
    Log "  -> done"
  } else {
    Move-Item $job.FullName "jobs\failed\$($job.Name)" -Force
    Log "  -> FAILED; stopping. Fix and move the file back into jobs\ to retry."
    exit 1
  }
}
Log ""
Log "== queue complete =="
exit 0
