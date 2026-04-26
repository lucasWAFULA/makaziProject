# Build frontend for production. Set VITE_API_URL to your live API base.
# Usage:
#   .\scripts\build-frontend.ps1
#   .\scripts\build-frontend.ps1 -ApiUrl "https://karibumakazi.com/api"

param(
    [string]$ApiUrl = $env:VITE_API_URL
)

$frontendDir = Join-Path $PSScriptRoot ".." "frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Error "Frontend folder not found: $frontendDir"
    exit 1
}

if ($ApiUrl) {
    "VITE_API_URL=$ApiUrl" | Out-File -FilePath (Join-Path $frontendDir ".env") -Encoding utf8
    Write-Host "Set VITE_API_URL=$ApiUrl"
} elseif (-not (Test-Path (Join-Path $frontendDir ".env"))) {
    Write-Warning "No .env and no -ApiUrl. Using default /api (same-origin)."
    "VITE_API_URL=/api" | Out-File -FilePath (Join-Path $frontendDir ".env") -Encoding utf8
}

Push-Location $frontendDir
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Build output: frontend/dist"
} finally {
    Pop-Location
}
