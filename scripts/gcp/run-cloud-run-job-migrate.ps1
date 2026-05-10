# Create or update a one-off Cloud Run Job to run Django migrations, then execute it.
# Fill in parameters (or pass as args). Image URI should match the API service (Artifact Registry).
#
# Example:
#   .\run-cloud-run-job-migrate.ps1 `
#     -ImageUri "europe-west1-docker.pkg.dev/makazi240097/karibumakazi/karibumakazi-api:TAG"
#
# The job needs the same env as the API for DATABASE_URL / SECRET_KEY etc.
# Easiest: after first `gcloud run jobs create`, add env in Console, or use --env-vars-file (see Google docs).

param(
  [string] $ProjectId = "makazi240097",
  [Parameter(Mandatory = $true)][string] $ImageUri,
  [string] $CloudSqlInstance = "makazi240097:europe-west1:karibumakazi-db",
  [string] $ServiceAccount = "karibumakazi-cloudrun-sa@makazi240097.iam.gserviceaccount.com",
  [string] $Region = "europe-west1",
  [string] $JobName = "karibumakazi-migrate",
  [string] $EnvVarsFile = ""  # optional YAML for gcloud --env-vars-file
)

$ErrorActionPreference = "Stop"

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
  "--args", "manage.py,migrate,--noinput"
)

if ($EnvVarsFile -and (Test-Path $EnvVarsFile)) {
  $baseArgs += @("--env-vars-file", $EnvVarsFile)
}

Write-Host ($(if ($jobExists) { "Updating" } else { "Creating" }) + " job $JobName...")
& gcloud @baseArgs
if ($LASTEXITCODE -ne 0) { Write-Error "gcloud run jobs create/update failed." }

Write-Host "Executing job (wait for completion)..."
& gcloud run jobs execute $JobName --project $ProjectId --region $Region --wait
if ($LASTEXITCODE -ne 0) { Write-Error "gcloud run jobs execute failed." }

Write-Host "Migrations job finished."
