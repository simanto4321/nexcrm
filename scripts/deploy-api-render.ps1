# Deploy NexCRM API to Render (free tier)
#
# Option A — One-click (recommended, ~3 minutes):
#   1. Run this script:  D:\NexCRM\scripts\deploy-api-render.ps1
#   2. Sign in to Render, connect GitHub repo `simanto4321/nexcrm`
#   3. When prompted for env vars, paste values printed below
#   4. After deploy, test: https://nexcrm-api.onrender.com/health
#
# Option B — API key (fully automated):
#   $env:RENDER_API_KEY = "rnd_..."
#   D:\NexCRM\scripts\deploy-api-render.ps1 -Auto

param(
    [switch]$Auto
)

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/simanto4321/nexcrm"
$deployUrl = "https://dashboard.render.com/select-repo?type=blueprint"
$apiUrl = "https://nexcrm-api.onrender.com"
$webUrl = "https://simanto4321.github.io/nexcrm"

Write-Host "`n=== NexCRM API — Render Deploy ===" -ForegroundColor Cyan
Write-Host "Live web (already up): $webUrl`n"

$envFile = "D:\NexCRM\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Missing $envFile — copy from backend\.env.example first." -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw
function Get-EnvVal($name) {
    if ($envContent -match "(?m)^$name=(.+)$") { return $Matches[1].Trim() }
    return ""
}

$dbUrl = Get-EnvVal "DATABASE_URL"
$jwt = Get-EnvVal "JWT_SECRET"
$cors = "$webUrl,http://localhost:5173"

Write-Host "Set these on Render service 'nexcrm-api':`n" -ForegroundColor Yellow
Write-Host "DATABASE_URL=$dbUrl"
Write-Host "JWT_SECRET=$jwt"
Write-Host "CORS_ORIGINS=$cors"
Write-Host "EMAIL_DEMO_MODE=false"
Write-Host ""

if ($Auto -and $env:RENDER_API_KEY) {
    Write-Host "Auto deploy via Render API is not configured in this script yet." -ForegroundColor Yellow
    Write-Host "Use the dashboard link below.`n"
}

Write-Host "Opening Render Blueprint deploy..." -ForegroundColor Green
Start-Process $deployUrl

Write-Host @"

Steps:
  1. Connect GitHub → select repo 'nexcrm'
  2. Render reads render.yaml and creates 'nexcrm-api'
  3. Paste the env vars above when asked
  4. Wait for green 'Live' status (~5 min first build)
  5. Test: $apiUrl/health

GitHub variable VITE_API_URL is already set to $apiUrl
Re-run Deploy Web workflow if you change the API URL.

"@
