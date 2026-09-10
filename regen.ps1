# Full regeneration of every component from the docs, in composition order, with a pause for gap-folding
# between phases. Claude Code runs the jobs queue; this script runs the generator. ASCII only.
#
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1                      # all phases, all platforms, sequential
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -Platform web        # one platform (run three windows for parallel; needs job 100)
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -From Overlays       # resume from a phase
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -Phase Overlays      # exactly one phase
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -NoPause             # do not stop between phases for gap folding
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -Force               # regenerate even targets whose prompt hash is current
# A second pass needs no flag: targets whose gates failed, or whose docs changed, are stale by prompt hash and rerun;
# current ones are skipped in seconds.
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -Gates               # also run keyboard + axe (needs Playwright)
#   powershell -ExecutionPolicy Bypass -File .\regen.ps1 -DryRun              # print the plan
#
# Between phases (unless -NoPause) the script writes generated\gaps\SUMMARY.md (via tools/gap_digest.py when present,
# else a concatenation), commits, and exits with code 3. Fold the gaps into the docs, run `node tools/py.mjs tools/parse.py`,
# then resume with -From <next phase>. Targets whose docs changed become stale automatically (prompt hash), so the
# next phase regenerates only what the folded gaps touched plus its own components.
param(
  [string]$From = "",
  [string]$Phase = "",
  [string]$Platform = "web,lit,rn",
  [switch]$NoPause,
  [switch]$Force,
  [switch]$Gates,
  [switch]$DryRun,
  [string]$Model = ""
)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
$suffix = if ($Platform -ne "web,lit,rn") { "-" + ($Platform -replace ",", "-") } else { "" }
$log = "logs\regen$suffix.log"
function Log($line) { Write-Host $line; Add-Content -Path $log -Value $line -Encoding utf8 }
Set-Content -Path $log -Value "== regen $(Get-Date -Format s) platforms=$Platform ==" -Encoding utf8
if ($Model -ne "") { $env:DS_MODEL = $Model }

# Phases in composition order. A component is generated only after everything it composes.
$phases = @(
  @{ name = "Primitives"; components = "Icon,Text,Heading,Stack,Box" },
  @{ name = "Core";       components = "Button,Link,Input,Form,Container,Card,Divider" },
  @{ name = "Controls";   components = "Checkbox,Switch,RadioGroup,Disclosure,Alert,Landmark,Breadcrumb,Meter,Fieldset" },
  @{ name = "Focus";      components = "FocusScope,Tooltip,Toast" },
  @{ name = "Overlays";   components = "Dialog,AlertDialog,Menu,Popover,BottomSheet,ActionSheet,SidePanel" },
  @{ name = "Selection";  components = "Tabs,SegmentedControl,Listbox,Select,Combobox,Accordion" },
  @{ name = "Numeric";    components = "Slider,NumberInput,ProgressBar,Stepper,Search,DatePicker" },
  @{ name = "Rows";       components = "Toolbar,Carousel,Table" },
  @{ name = "Grids";      components = "DataGrid,TreeGrid,Tree" },
  @{ name = "Streams";    components = "Splitter,Feed" },
  # Pattern pages (site/src/content/docs/patterns) come last: they compose everything above.
  @{ name = "Patterns";   pattern = "SettingsPage" }
)

$plan = @()
if ($Phase -ne "") {
  $plan = @($phases | Where-Object { $_.name -eq $Phase })
  if ($plan.Count -eq 0) { Log "No phase named '$Phase'. Phases: $($phases.name -join ', ')"; exit 1 }
} else {
  $started = ($From -eq "")
  foreach ($p in $phases) {
    if (-not $started -and $p.name -eq $From) { $started = $true }
    if ($started) { $plan += $p }
  }
  if ($plan.Count -eq 0) { Log "No phase matches -From '$From'. Phases: $($phases.name -join ', ')"; exit 1 }
}

Log "Plan: $(($plan | ForEach-Object { $_.name }) -join ' -> ')  platforms=$Platform force=$($Force.IsPresent) gates=$($Gates.IsPresent) pause=$(-not $NoPause.IsPresent)"
if ($DryRun) { $plan | ForEach-Object { Log "  $($_.name): $(if ($_.pattern) { 'pattern ' + $_.pattern } else { $_.components })" }; exit 0 }

# Preparation: tokens, prompts, and a parse that must be clean before any model call.
Log "== pnpm themes =="
pnpm themes 2>&1 | ForEach-Object { Log "$_" }
if ($LASTEXITCODE -ne 0) { Log "themes failed"; exit 1 }
Log "== parse =="
node tools/py.mjs tools/parse.py 2>&1 | ForEach-Object { Log "$_" }
if ($LASTEXITCODE -ne 0) { Log "parse failed: fix the docs above before regenerating"; exit 1 }
if ($Gates) { pnpm exec playwright install chromium 2>&1 | ForEach-Object { Log "$_" } }

function Snapshot($message) {
  if (Test-Path .\commit.ps1) { & powershell -ExecutionPolicy Bypass -File .\commit.ps1 -m $message 2>&1 | ForEach-Object { Log "$_" } }
}

function Write-GapSummary($phaseName) {
  if (Test-Path tools\gap_digest.py) {
    node tools/py.mjs tools/gap_digest.py --phase $phaseName 2>&1 | ForEach-Object { Log "$_" }
  } else {
    $out = "generated\gaps\SUMMARY.md"
    Set-Content -Path $out -Value "# Gaps after phase $phaseName ($(Get-Date -Format s))" -Encoding utf8
    Get-ChildItem generated\gaps\*.md | Where-Object { $_.Name -ne "SUMMARY.md" } | Sort-Object LastWriteTime -Descending | ForEach-Object {
      Add-Content -Path $out -Value "`n## $($_.Name)`n" -Encoding utf8
      Get-Content $_.FullName -Encoding utf8 | Add-Content -Path $out -Encoding utf8
    }
    Log "wrote $out"
  }
}

$i = 0
foreach ($p in $plan) {
  $i++
  Log ""
  $what = if ($p.pattern) { "pattern " + $p.pattern } else { $p.components }
  Log "==== Phase $($p.name) ($i of $($plan.Count)): $what ===="
  $args = @("tools/generate.py", "--platform", $Platform)
  if ($p.pattern) { $args += @("--pattern", $p.pattern) } else { $args += @("--component", $p.components) }
  if ($Force) { $args += "--force" }
  if ($Gates) { $args += @("--with", "keyboard", "--with", "axe") }
  node tools/py.mjs @args 2>&1 | ForEach-Object { Log "$_" }
  $code = $LASTEXITCODE
  Snapshot "regen: phase $($p.name) ($Platform) exit $code"
  if ($code -ne 0) {
    Log "Phase $($p.name) finished with failures (exit $code). Failed targets stay stale; they rerun on the next pass after the gaps are folded (no flag needed)."
  } else {
    Log "Phase $($p.name) passed."
  }
  $last = ($i -eq $plan.Count)
  if (-not $NoPause -and -not $last) {
    Write-GapSummary $p.name
    $next = $plan[$i].name
    Log ""
    Log "Paused for gap folding. Read generated\gaps\SUMMARY.md, fix the docs, run parse, then resume:"
    Log "  powershell -ExecutionPolicy Bypass -File .\regen.ps1 -From $next -Platform $Platform"
    exit 3
  }
}

Log ""
Log "== all phases done: re-index MCP, check =="
node tools/py.mjs mcp/index.py 2>&1 | ForEach-Object { Log "$_" }
node tools/py.mjs tools/generate.py --check 2>&1 | ForEach-Object { Log "$_" }
Write-GapSummary "final"
Snapshot "regen: complete ($Platform)"
Log "== done =="
exit 0
