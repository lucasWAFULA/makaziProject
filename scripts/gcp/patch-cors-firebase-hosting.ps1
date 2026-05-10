# Patch CORS / CSRF on Cloud Run for Firebase Hosting default URLs (and custom domains).
# Requires: Google Cloud SDK, `gcloud auth login`, `gcloud config set project ...`
#
# Usage:
#   .\patch-cors-firebase-hosting.ps1
#   .\patch-cors-firebase-hosting.ps1 -ProjectId "my-gcp-project" -FirebaseHostingHost "makazi240097.web.app"
#
# In --update-env-vars, commas INSIDE a value must be escaped as \,

param(
  [string] $ProjectId = "makazi240097",
  [string] $Region = "europe-west1",
  [string] $Service = "karibumakazi-api",
  [string] $FirebaseHostingHost = "makazi240097.web.app",
  [string] $FirebaseAltHost = "makazi240097.firebaseapp.com",
  [string] $CloudRunApiOrigin = "https://karibumakazi-api-dpifguofja-ew.a.run.app"
)

$ErrorActionPreference = "Stop"

$cors = "https://makazi-plus.com\,https://www.makazi-plus.com\,https://${FirebaseHostingHost}\,https://${FirebaseAltHost}"
$csrf = "https://makazi-plus.com\,https://www.makazi-plus.com\,https://admin.makazi-plus.com\,$CloudRunApiOrigin\,https://${FirebaseHostingHost}\,https://${FirebaseAltHost}"

$pair = "CORS_ORIGINS=$cors,CSRF_TRUSTED_ORIGINS=$csrf"

Write-Host "Updating $Service in $Region (project $ProjectId)..."
Write-Host "CORS_ORIGINS / CSRF_TRUSTED_ORIGINS will be set (merge with existing vars; does not remove other keys)."

& gcloud run services update $Service `
  --project $ProjectId `
  --region $Region `
  --update-env-vars $pair

if ($LASTEXITCODE -ne 0) {
  Write-Error "gcloud run services update failed."
}

Write-Host "Done. Wait for the new revision to become ready, then hard-refresh the web app."
