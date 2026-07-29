# Verify all NexCRM features against live Vercel API
$base = "https://nexcrm-api-phi.vercel.app"
$fail = 0

function Test-Feature {
  param(
    [string]$Name,
    [scriptblock]$Action
  )
  try {
    & $Action
    Write-Host "  OK  $Name" -ForegroundColor Green
  } catch {
    Write-Host "  FAIL $Name - $($_.Exception.Message)" -ForegroundColor Red
    $script:fail++
  }
}

Write-Host ""
Write-Host "=== NexCRM Live Verification ===" -ForegroundColor Cyan
Write-Host "API: $base"
Write-Host ""

Test-Feature "Health" {
  Invoke-RestMethod "$base/health" | Out-Null
}

Test-Feature "Login (globex)" {
  $script:login = Invoke-RestMethod "$base/auth/login" -Method POST -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
  $script:h = @{ Authorization = "Bearer $($script:login.access_token)" }
}

Test-Feature "Auth /me" {
  Invoke-RestMethod "$base/auth/me" -Headers $script:h | Out-Null
}

Test-Feature "Dashboard" {
  Invoke-RestMethod "$base/dashboard" -Headers $script:h | Out-Null
}

Test-Feature "List contacts" {
  Invoke-RestMethod "$base/contacts" -Headers $script:h | Out-Null
}

Test-Feature "List deals" {
  Invoke-RestMethod "$base/deals" -Headers $script:h | Out-Null
}

Test-Feature "List tasks" {
  Invoke-RestMethod "$base/tasks" -Headers $script:h | Out-Null
}

Test-Feature "Chatbot" {
  Invoke-RestMethod "$base/chatbot/message" -Method POST -Headers $script:h -ContentType "application/json" `
    -Body '{"message":"hello","conversation_history":[]}' | Out-Null
}

Test-Feature "Email config" {
  Invoke-RestMethod "$base/email/config" -Headers $script:h | Out-Null
}

Test-Feature "Email test" {
  Invoke-RestMethod "$base/email/test" -Method POST -Headers $script:h | Out-Null
}

Test-Feature "Telegram status" {
  Invoke-RestMethod "$base/telegram/status" -Headers $script:h | Out-Null
}

Test-Feature "Team members" {
  Invoke-RestMethod "$base/team/members" -Headers $script:h | Out-Null
}

Test-Feature "Notifications list" {
  Invoke-RestMethod "$base/notifications" -Headers $script:h | Out-Null
}

Test-Feature "Notifications unread" {
  Invoke-RestMethod "$base/notifications/unread-count" -Headers $script:h | Out-Null
}

Test-Feature "Signup + CRUD + email test" {
  $code = "verify$(Get-Random -Maximum 999999)"
  $body = @{
    tenant_name = "Verify Co"
    company_code = $code
    admin_name = "Verifier"
    admin_email = "verifier$code@example.com"
    password = "verify1234"
  } | ConvertTo-Json
  $s = Invoke-RestMethod "$base/auth/signup" -Method POST -ContentType "application/json" -Body $body
  $sh = @{ Authorization = "Bearer $($s.access_token)" }
  $c = Invoke-RestMethod "$base/contacts" -Method POST -Headers $sh -ContentType "application/json" `
    -Body '{"name":"V Contact","status":"lead"}'
  $dealBody = @{ contact_id = $c.id; value = 100; stage = "new" } | ConvertTo-Json
  Invoke-RestMethod "$base/deals" -Method POST -Headers $sh -ContentType "application/json" -Body $dealBody | Out-Null
  Invoke-RestMethod "$base/tasks" -Method POST -Headers $sh -ContentType "application/json" `
    -Body '{"title":"V Task","status":"pending"}' | Out-Null
  Invoke-RestMethod "$base/email/test" -Method POST -Headers $sh | Out-Null
}

Test-Feature "Platform admin" {
  $a = Invoke-RestMethod "$base/platform/auth/login" -Method POST -ContentType "application/json" `
    -Body '{"email":"admin@nexcrm.com","password":"admin123"}'
  Invoke-RestMethod "$base/platform/tenants" -Headers @{ Authorization = "Bearer $($a.access_token)" } | Out-Null
}

Write-Host ""
if ($fail -eq 0) {
  Write-Host "All checks passed." -ForegroundColor Green
  Write-Host "Web: https://nexcrm-web-gilt.vercel.app" -ForegroundColor Cyan
} else {
  Write-Host "$fail check(s) failed." -ForegroundColor Red
  exit 1
}
