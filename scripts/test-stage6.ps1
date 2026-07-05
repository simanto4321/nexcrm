# Test Stage 6 Email endpoints (SMTP optional - API must respond either way)
$ErrorActionPreference = "Stop"
$base = "http://localhost:8000"

Write-Host "=== Login (tenant_admin) ==="
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

Write-Host "`n=== GET /email/config ==="
$cfg0 = Invoke-RestMethod -Uri "$base/email/config" -Headers $h
Write-Host ($cfg0 | ConvertTo-Json -Compress)

Write-Host "`n=== PUT /email/config ==="
$cfg = Invoke-RestMethod -Method PUT -Uri "$base/email/config" -Headers $h -ContentType "application/json" `
    -Body '{"team_email":"team@globex.com","notifications_enabled":true}'
Write-Host ($cfg | ConvertTo-Json -Compress)
if ($cfg.team_email -ne "team@globex.com") { Write-Error "Config update failed" }

Write-Host "`n=== POST /email/test ==="
$test = Invoke-RestMethod -Method POST -Uri "$base/email/test" -Headers $h
Write-Host ($test | ConvertTo-Json -Compress)
if (-not $cfg.smtp_configured) {
    Write-Warning "GMAIL_* not set in backend .env - test email skipped (expected for local dev)"
}

Write-Host "`n=== POST /contacts (triggers new-contact email) ==="
$newContact = Invoke-RestMethod -Method POST -Uri "$base/contacts" -Headers $h -ContentType "application/json" `
    -Body '{"name":"Stage6 Test Contact","email":"stage6@test.com","status":"lead"}'
Write-Host "Created contact id=$($newContact.id)"

Write-Host "`n=== POST /tasks (triggers assignment email) ==="
$task = Invoke-RestMethod -Method POST -Uri "$base/tasks" -Headers $h -ContentType "application/json" `
    -Body (@{ title = "Stage6 email test task"; assigned_to = $login.user_id; status = "pending" } | ConvertTo-Json)
Write-Host "Created task id=$($task.id)"

Write-Host "`nStage 6 API checks passed."
Write-Host "Set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in backend .env for live delivery."
