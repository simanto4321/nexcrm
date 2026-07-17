# Deploy NexCRM to Vercel (API + Web)
#
# Prerequisites: npx vercel login
#
# Usage:
#   D:\NexCRM\scripts\deploy-vercel.ps1

$ErrorActionPreference = "Stop"
$apiUrl = "https://nexcrm-api-phi.vercel.app"
$webUrl = "https://nexcrm-web.vercel.app"

Write-Host "`n=== NexCRM Vercel Deploy ===" -ForegroundColor Cyan

# 1. Deploy API
Write-Host "`n[1/2] Deploying API..." -ForegroundColor Yellow
Set-Location D:\NexCRM\backend
npx vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) { throw "API deploy failed" }

# 2. Deploy Web
Write-Host "`n[2/2] Deploying Web..." -ForegroundColor Yellow
Set-Location D:\NexCRM\frontend-web
$env:VITE_API_URL = $apiUrl
$env:VITE_BASE_PATH = "/"
npx vercel deploy --prod --yes
if ($LASTEXITCODE -ne 0) { throw "Web deploy failed" }

Write-Host "`n=== Deploy complete ===" -ForegroundColor Green
Write-Host "Web: $webUrl (or check Vercel dashboard for alias)"
Write-Host "API: $apiUrl"
Write-Host "`nDemo: sara@globex.com / secret123 / globex"
