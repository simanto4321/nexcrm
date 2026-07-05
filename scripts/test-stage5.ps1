# Test Stage 5 Telegram endpoints (webhook simulation — no real Telegram needed)
$ErrorActionPreference = "Stop"
$base = "http://localhost:8000"
$testChatId = "-100999888777"

Write-Host "=== Login (tenant_admin) ==="
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

Write-Host "`n=== Register Telegram chat_id ==="
$reg = Invoke-RestMethod -Method POST -Uri "$base/telegram/register" -Headers $h -ContentType "application/json" `
    -Body (@{ chat_id = $testChatId; invite_link = "https://t.me/test" } | ConvertTo-Json)
Write-Host ($reg | ConvertTo-Json -Compress)
if (-not $reg.connected) { Write-Error "Register failed" }

Write-Host "`n=== GET /telegram/status ==="
$st = Invoke-RestMethod -Uri "$base/telegram/status" -Headers $h
Write-Host ($st | ConvertTo-Json -Compress)

Write-Host "`n=== POST /telegram/webhook (simulated message) ==="
$webhookBody = @{
    update_id = 1
    message = @{
        message_id = 1
        chat = @{ id = $testChatId; type = "group" }
        text = "How do I add a contact?"
    }
} | ConvertTo-Json -Depth 5
$wh = Invoke-RestMethod -Method POST -Uri "$base/telegram/webhook" -ContentType "application/json" -Body $webhookBody
Write-Host ($wh | ConvertTo-Json -Compress)
if (-not $wh.handled) { Write-Error "Webhook was not handled" }
if ($wh.source -ne "ollama") { Write-Warning "Expected source=ollama (got $($wh.source))" }

Write-Host "`nStage 5 API checks passed."
Write-Host "Set TELEGRAM_BOT_TOKEN in backend\.env and configure webhook with BotFather for live Telegram."
