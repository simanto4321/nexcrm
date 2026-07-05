# Verify Stage 5 (Telegram) + Stage 6 (Email) API and database rows
$ErrorActionPreference = "Stop"
$base = "http://localhost:8000"

Write-Host "=== DB check (telegram_groups + tenant_email_config) ==="
Set-Location D:\NexCRM\backend
& D:\NexCRM\.venv\Scripts\python.exe scripts\verify_integrations_db.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Running seed_integrations.py to backfill..."
    & D:\NexCRM\.venv\Scripts\python.exe scripts\seed_integrations.py
    & D:\NexCRM\.venv\Scripts\python.exe scripts\verify_integrations_db.py
    if ($LASTEXITCODE -ne 0) { Write-Error "Database integration rows still missing" }
}

Write-Host "`n=== Login globex admin ==="
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

Write-Host "`n=== Stage 5: GET /telegram/status (from DB) ==="
$st = Invoke-RestMethod -Uri "$base/telegram/status" -Headers $h
Write-Host ($st | ConvertTo-Json -Compress)
if (-not $st.connected -or $st.chat_id -ne "-100999888777") {
    Write-Error "Telegram not linked in DB/API"
}

Write-Host "`n=== Stage 5: POST /telegram/webhook ==="
$webhookBody = @{
    update_id = 99
    message = @{
        message_id = 99
        chat = @{ id = "-100999888777"; type = "group" }
        text = "What is on my dashboard?"
    }
} | ConvertTo-Json -Depth 5
$wh = Invoke-RestMethod -Method POST -Uri "$base/telegram/webhook" -ContentType "application/json" -Body $webhookBody
Write-Host ($wh | ConvertTo-Json -Compress)
if (-not $wh.handled) { Write-Error "Telegram webhook not handled" }

Write-Host "`n=== Stage 6: GET /email/config (from DB) ==="
$cfg = Invoke-RestMethod -Uri "$base/email/config" -Headers $h
Write-Host ($cfg | ConvertTo-Json -Compress)
if ($cfg.team_email -ne "team@globex.com") { Write-Error "Email config not loaded from DB" }

Write-Host "`n=== Stage 6: POST /email/test ==="
$test = Invoke-RestMethod -Method POST -Uri "$base/email/test" -Headers $h
Write-Host ($test | ConvertTo-Json -Compress)

Write-Host "`nStage 5 + 6 verification passed (API + database)."
