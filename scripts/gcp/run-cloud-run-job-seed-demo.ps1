# Create or update a Cloud Run Job to run `manage.py seed_demo_data`, then execute it.
# Optional: -Clear wipes demo data first (passes --clear to the command).
#
# Example:
#   .\run-cloud-run-job-seed-demo.ps1 `
#     -ImageUri "europe-west1-docker.pkg.dev/makazi240097/karibumakazi/karibumakazi-api:TAG" `
#     -HostEmail "admin@makazi-plus.com"

param(
  [string] $ProjectId = "makazi240097",
  [Parameter(Mandatory = $true)][string] $ImageUri,
  [string] $CloudSqlInstance = "makazi240097:europe-west1:karibumakazi-db",
  [string] $ServiceAccount = "karibumakazi-cloudrun-sa@makazi240097.iam.gserviceaccount.com",
  [string] $Region = "europe-west1",
  [string] $JobName = "karibumakazi-seed-demo",
  [string] $HostEmail = "",
  [switch] $Clear,
  [string] $EnvVarsFile = ""
)

$ErrorActionPreference = "Stop"

$argsList = @("manage.py", "seed_demo_data")
if ($Clear) { $argsList += "--clear" }
if ($HostEmail) { $argsList += @("--host-email", $HostEmail) }
$argsJoined = $argsList -join ","

$jobExists = $false
& gcloud run jobs describe $JobName --project $ProjectId --region $Region 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { $jobExists = $true }

$baseArgs = @(
  "run", "jobs",
  $(if ($jobExists) { "update" } else { "create" }),
  $JobName,
  "--project", $ProjectId,
  "--region", $Region,
  "--image", $ImageUri,
  "--tasks", "1",
  "--max-retries", "0",
  "--task-timeout", "30m",
  "--set-cloudsql-instances", $CloudSqlInstance,
  "--service-account", $ServiceAccount,
  "--command", "python",
  "--args", $argsJoined
)

if ($EnvVarsFile -and (Test-Path $EnvVarsFile)) {
  $baseArgs += @("--env-vars-file", $EnvVarsFile)
}

Write-Host ($(if ($jobExists) { "Updating" } else { "Creating" }) + " job $JobName...")
& gcloud @baseArgs
if ($LASTEXITCODE -ne 0) { Write-Error "gcloud run jobs create/update failed." }

Write-Host "Executing seed job..."
& gcloud run jobs execute $JobName --project $ProjectId --region $Region --wait
if ($LASTEXITCODE -ne 0) { Write-Error "gcloud run jobs execute failed." }

Write-Host "Seed job finished."
