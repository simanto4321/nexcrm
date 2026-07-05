# End-to-end feature test for demo (API + UI checklist)
$ErrorActionPreference = "Stop"
$base = "http://localhost:8000"
$results = @()

function Test-Step($name, { param($script) }) {
    try {
        & $script
        $script:results += [pscustomobject]@{ Feature = $name; Status = "PASS" }
        Write-Host "[PASS] $name" -ForegroundColor Green
    } catch {
        $script:results += [pscustomobject]@{ Feature = $name; Status = "FAIL: $($_.Exception.Message)" }
        Write-Host "[FAIL] $name - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Test-Step "Health check" { Invoke-RestMethod -Uri "$base/health" -TimeoutSec 5 | Out-Null }

Test-Step "Login (globex admin)" {
    $script:login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
        -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
    $script:h = @{ Authorization = "Bearer $($script:login.access_token)" }
}

Test-Step "Dashboard stats" {
    $d = Invoke-RestMethod -Uri "$base/dashboard" -Headers $script:h
    if ($d.total_contacts -lt 1) { throw "No contacts" }
}

Test-Step "List contacts" {
    $c = Invoke-RestMethod -Uri "$base/contacts" -Headers $script:h
    if ($c.Count -lt 1) { throw "Empty contacts" }
}

Test-Step "Create contact (+ email trigger)" {
    $nc = Invoke-RestMethod -Method POST -Uri "$base/contacts" -Headers $script:h -ContentType "application/json" `
        -Body '{"name":"Demo Visitor","email":"demo@test.com","status":"lead"}'
    $script:contactId = $nc.id
}

Test-Step "List deals (pipeline data)" {
    $deals = Invoke-RestMethod -Uri "$base/deals" -Headers $script:h
    if ($deals.Count -lt 1) { throw "No deals" }
    $script:dealId = $deals[0].id
}

Test-Step "Move deal stage (+ email on won/lost)" {
    Invoke-RestMethod -Method PUT -Uri "$base/deals/$($script:dealId)" -Headers $script:h -ContentType "application/json" `
        -Body '{"stage":"negotiation"}' | Out-Null
}

Test-Step "Create task (+ assignment email)" {
    $t = Invoke-RestMethod -Method POST -Uri "$base/tasks" -Headers $script:h -ContentType "application/json" `
        -Body (@{ title = "Demo task from test"; assigned_to = $script:login.user_id; status = "pending" } | ConvertTo-Json)
    $script:taskId = $t.id
}

Test-Step "Chatbot message (Ollama/FAQ)" {
    $chat = Invoke-RestMethod -Method POST -Uri "$base/chatbot/message" -Headers $script:h -ContentType "application/json" `
        -Body '{"message":"How do I add a contact?","conversation_history":[]}'
    if (-not $chat.reply) { throw "No reply" }
}

Test-Step "Email config from DB" {
    $cfg = Invoke-RestMethod -Uri "$base/email/config" -Headers $script:h
    if ($cfg.team_email -ne "team@globex.com") { throw "Wrong team_email" }
}

Test-Step "Email test send (demo SMTP)" {
    $em = Invoke-RestMethod -Method POST -Uri "$base/email/test" -Headers $script:h
    if (-not $em.sent) { throw $em.message }
}

Test-Step "Telegram status from DB" {
    $tg = Invoke-RestMethod -Uri "$base/telegram/status" -Headers $script:h
    if (-not $tg.connected) { throw "Not connected" }
}

Test-Step "Telegram webhook simulation" {
    $wh = Invoke-RestMethod -Method POST -Uri "$base/telegram/webhook" -ContentType "application/json" -Body (@{
        update_id = 500
        message = @{ message_id = 500; chat = @{ id = "-100999888777"; type = "group" }; text = "Hello CRM" }
    } | ConvertTo-Json -Depth 5)
    if (-not $wh.handled) { throw "Webhook not handled" }
}

Test-Step "Platform admin login" {
    $pa = Invoke-RestMethod -Method POST -Uri "$base/platform/auth/login" -ContentType "application/json" `
        -Body '{"email":"admin@nexcrm.com","password":"admin123"}'
    $script:ph = @{ Authorization = "Bearer $($pa.access_token)" }
}

Test-Step "Platform tenant list" {
    $tenants = Invoke-RestMethod -Uri "$base/platform/tenants" -Headers $script:ph
    if ($tenants.Count -lt 2) { throw "Expected 2+ tenants" }
}

Test-Step "Sales rep login (role filter)" {
    $rep = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
        -Body '{"email":"tom@globex.com","password":"secret123","company_code":"globex"}'
    $rh = @{ Authorization = "Bearer $($rep.access_token)" }
    Invoke-RestMethod -Uri "$base/contacts" -Headers $rh | Out-Null
}

Write-Host "`n========== FEATURE TEST SUMMARY ==========" -ForegroundColor Cyan
$results | Format-Table -AutoSize
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
Write-Host "Total: $passed / $($results.Count) passed"
Write-Host "`nOpen the website: http://localhost:5173/login"
Write-Host "Login: sara@globex.com / secret123 / globex"
