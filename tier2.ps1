# Tier 1.5 + Tier 2 + Tier 3 generation, in dependency order, one batch at a time. Stops at the first batch whose
# gates fail so the docs can be fixed before the components that compose it are generated.
#   powershell -ExecutionPolicy Bypass -File .\tier2.ps1                 # everything below
#   powershell -ExecutionPolicy Bypass -File .\tier2.ps1 -From Dialog    # resume from a batch
#   powershell -ExecutionPolicy Bypass -File .\tier2.ps1 -Gates          # also run the keyboard + axe gates per batch (needs Playwright)
#   powershell -ExecutionPolicy Bypass -File .\tier2.ps1 -DryRun         # print the plan only
# Log: logs\tier2.log (UTF-8). Each batch also appends to logs\generate.log via generate.ps1.
param(
  [string]$From = "",
  [switch]$Gates,
  [switch]$DryRun,
  [string]$Platform = "web,lit,rn"
)
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path logs | Out-Null
$log = "logs\tier2.log"
function Log($line) { Write-Host $line; Add-Content -Path $log -Value $line -Encoding utf8 }
Set-Content -Path $log -Value "== tier2 $(Get-Date -Format s) ==" -Encoding utf8

# Batches: each composes only components from earlier batches (or Tier 0/1).
$batches = @(
  @{ name = "Surfaces";   components = "Box,Card,Container" },
  @{ name = "FocusScope"; components = "FocusScope" },
  @{ name = "Dialog";     components = "Dialog,AlertDialog" },
  @{ name = "Popups";     components = "Menu,Tooltip,Toast" },
  @{ name = "Sheets";     components = "BottomSheet,ActionSheet,SidePanel" },
  # Tier 3. Stack is regenerated first: its gap enum changed (none|tight|normal|loose|section) and
  # Card/Form/Fieldset compose it. Skip with -From Structure if Stack is already current.
  @{ name = "Stack";      components = "Stack" },
  @{ name = "Structure";  components = "Fieldset,Divider" },
  @{ name = "Tabs";       components = "Tabs,SegmentedControl" },
  @{ name = "Lists";      components = "Listbox,Select" },
  @{ name = "Combos";     components = "Combobox,Accordion" },
  @{ name = "Numeric";    components = "Slider,NumberInput,Popover" },
  @{ name = "Feedback";   components = "ProgressBar,Stepper" },
  @{ name = "Rows";       components = "Toolbar,Carousel" },
  @{ name = "Dates";      components = "Search,DatePicker" },
  # Tier 4
  @{ name = "Table";      components = "Table" },
  @{ name = "DataGrid";   components = "DataGrid" },
  @{ name = "Hierarchy";  components = "Tree,TreeGrid" },
  @{ name = "Streams";    components = "Splitter,Feed" }
)

$extra = ""
if ($Gates) { $extra = "--with keyboard --with axe" }

$started = ($From -eq "")
$plan = @()
foreach ($b in $batches) {
  if (-not $started -and ($b.name -eq $From -or $b.components -like "$From*")) { $started = $true }
  if ($started) { $plan += $b }
}
if ($plan.Count -eq 0) { Log "No batch matches -From '$From'. Batches: $($batches.name -join ', ')"; exit 1 }

Log "Plan: $(($plan | ForEach-Object { $_.name }) -join ' -> ')  platforms=$Platform gates=$($Gates.IsPresent)"
if ($DryRun) { $plan | ForEach-Object { Log "  $($_.name): $($_.components)" }; exit 0 }

# One-time preparation: fresh tokens and prompts, Playwright browsers if the browser gates are on.
Log "== pnpm themes =="
pnpm themes 2>&1 | ForEach-Object { Log "$_" }
if ($LASTEXITCODE -ne 0) { Log "themes failed"; exit 1 }
if ($Gates) {
  Log "== playwright install chromium (one-time) =="
  pnpm exec playwright install chromium 2>&1 | ForEach-Object { Log "$_" }
}

foreach ($b in $plan) {
  Log ""
  Log "==== Batch $($b.name): $($b.components) ===="
  $args = @("-Component", $b.components, "-Platform", $Platform)
  if ($extra -ne "") { $args += @("-Extra", $extra) }
  & powershell -ExecutionPolicy Bypass -File .\generate.ps1 @args 2>&1 | ForEach-Object { Log "$_" }
  $code = $LASTEXITCODE
  if ($code -ne 0) {
    Log ""
    Log "Batch $($b.name) failed (exit $code). Fix the docs from generated\gaps\ and rerun:"
    Log "  powershell -ExecutionPolicy Bypass -File .\tier2.ps1 -From $($b.name)"
    exit $code
  }
  Log "Batch $($b.name) passed."
}

Log ""
Log "== all batches passed: re-indexing the MCP =="
node tools/py.mjs mcp/index.py 2>&1 | ForEach-Object { Log "$_" }
Log "== generate:check =="
node tools/py.mjs tools/generate.py --check 2>&1 | ForEach-Object { Log "$_" }
Log "== done =="
exit 0
