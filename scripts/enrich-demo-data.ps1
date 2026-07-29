# Enrich live NexCRM demo data via API (Globex + Acme) and tidy platform tenants.
# Usage:  D:\NexCRM\scripts\enrich-demo-data.ps1

$ErrorActionPreference = "Stop"
$base = "https://nexcrm-api-phi.vercel.app"

function Login-Tenant([string]$email, [string]$password, [string]$code) {
  $body = @{ email = $email; password = $password; company_code = $code } | ConvertTo-Json
  $r = Invoke-RestMethod "$base/auth/login" -Method POST -ContentType "application/json" -Body $body
  return @{ Authorization = "Bearer $($r.access_token)" }
}

function Ensure-Contact($h, $name, $email, $phone, $status, $notes) {
  $existing = Invoke-RestMethod "$base/contacts" -Headers $h
  $hit = $existing | Where-Object { $_.email -eq $email -or $_.name -eq $name } | Select-Object -First 1
  if ($hit) {
    Write-Host "  skip contact $name"
    return $hit
  }
  $body = @{ name = $name; email = $email; phone = $phone; status = $status; notes = $notes } | ConvertTo-Json
  $c = Invoke-RestMethod "$base/contacts" -Method POST -Headers $h -ContentType "application/json" -Body $body
  Write-Host "  + contact $name" -ForegroundColor Green
  return $c
}

function Ensure-Deal($h, $contactId, $stage, $value) {
  $deals = Invoke-RestMethod "$base/deals" -Headers $h
  $hit = $deals | Where-Object { $_.contact_id -eq $contactId -and [math]::Abs($_.value - $value) -lt 0.01 } | Select-Object -First 1
  if ($hit) {
    Write-Host "  skip deal contact=$contactId value=$value"
    return $hit
  }
  $body = @{ contact_id = $contactId; stage = $stage; value = $value } | ConvertTo-Json
  $d = Invoke-RestMethod "$base/deals" -Method POST -Headers $h -ContentType "application/json" -Body $body
  Write-Host "  + deal $stage $value" -ForegroundColor Green
  return $d
}

function Ensure-Task($h, $title, $status) {
  $tasks = Invoke-RestMethod "$base/tasks" -Headers $h
  if ($tasks | Where-Object { $_.title -eq $title }) {
    Write-Host "  skip task $title"
    return
  }
  $due = (Get-Date).AddDays((Get-Random -Minimum 1 -Maximum 14)).ToString("o")
  $body = @{ title = $title; status = $status; due_date = $due } | ConvertTo-Json
  Invoke-RestMethod "$base/tasks" -Method POST -Headers $h -ContentType "application/json" -Body $body | Out-Null
  Write-Host "  + task $title" -ForegroundColor Green
}

function Seed-Tenant([string]$label, [string]$email, [string]$password, [string]$code, $contacts, $tasks) {
  Write-Host "`n=== $label ($code) ===" -ForegroundColor Cyan
  $h = Login-Tenant $email $password $code
  $created = @()
  foreach ($c in $contacts) {
    $row = Ensure-Contact $h $c.name $c.email $c.phone $c.status $c.notes
    $created += $row
  }
  $stages = @("new", "contacted", "negotiation", "won", "lost", "negotiation", "contacted", "new", "won", "contacted")
  $values = @(4500, 12000, 27500, 68000, 3900, 18500, 9200, 6100, 41000, 15500)
  for ($i = 0; $i -lt [Math]::Min(10, $created.Count); $i++) {
    Ensure-Deal $h $created[$i].id $stages[$i] $values[$i] | Out-Null
  }
  foreach ($t in $tasks) {
    Ensure-Task $h $t.title $t.status
  }
  $dash = Invoke-RestMethod "$base/dashboard" -Headers $h
  Write-Host ("  -> contacts={0} pipeline={1} won={2} tasks={3}" -f $dash.total_contacts, $dash.pipeline_value, $dash.won_value, $dash.pending_tasks)
}

$globexContacts = @(
  @{ name = "Priya Sharma"; email = "priya@brightwave.io"; phone = "+91-98765-11001"; status = "active"; notes = "Enterprise SaaS lead. Interested in multi-region CRM." }
  @{ name = "Marcus Reed"; email = "marcus@northline.com"; phone = "+1-415-555-2202"; status = "active"; notes = "Renewal decision in Q3. Prefers Telegram updates." }
  @{ name = "Sofia Alvarez"; email = "sofia@orionlabs.es"; phone = "+34-600-555-3303"; status = "lead"; notes = "Requested demo of AI assistant and pipeline." }
  @{ name = "Kenji Tanaka"; email = "kenji@tokyotech.jp"; phone = "+81-90-5555-4404"; status = "active"; notes = "Pilot with 12 sales seats." }
  @{ name = "Amara Diallo"; email = "amara@sahelmart.sn"; phone = "+221-77-555-5505"; status = "lead"; notes = "Retail chain expansion. Needs mobile CRM." }
  @{ name = "Olivia Chen"; email = "olivia@pacificpeak.au"; phone = "+61-400-555-6606"; status = "active"; notes = "Asking for Telegram and email alerts package." }
  @{ name = "Hassan Rahman"; email = "hassan@deltaforce.bd"; phone = "+880-1711-555707"; status = "active"; notes = "Dhaka HQ. Wants Bangla-friendly onboarding later." }
  @{ name = "Emily Brooks"; email = "emily@harborcrm.uk"; phone = "+44-7700-555808"; status = "inactive"; notes = "Paused budget; nurture monthly." }
  @{ name = "Noah Berg"; email = "noah@fjordsoft.no"; phone = "+47-900-55-909"; status = "lead"; notes = "Nordic reseller interest." }
  @{ name = "Fatima Zahra"; email = "fatima@atlasgroup.ma"; phone = "+212-600-555010"; status = "active"; notes = "Decision maker for 3-country roll-out." }
)

$globexTasks = @(
  @{ title = "Schedule product demo for Sofia"; status = "pending" }
  @{ title = "Send pricing sheet to Marcus"; status = "pending" }
  @{ title = "Prepare onboarding pack for Kenji"; status = "pending" }
  @{ title = "Telegram checkup with Globex ops"; status = "pending" }
  @{ title = "Quarterly pipeline review with Sara"; status = "pending" }
  @{ title = "Close loop with Emily nurture sequence"; status = "done" }
  @{ title = "Collect case study quote from Elena"; status = "pending" }
  @{ title = "Verify email alerts for team@globex.com"; status = "done" }
)

$acmeContacts = @(
  @{ name = "Riley Quinn"; email = "riley@launchpad.co"; phone = "+1-212-555-1001"; status = "active"; notes = "Series A startup. Needs lightweight CRM." }
  @{ name = "Jordan Blake"; email = "jordan@metalworks.us"; phone = "+1-312-555-1002"; status = "active"; notes = "Manufacturing pipeline. About 40 deals/month." }
  @{ name = "Aisha Khan"; email = "aisha@crescentsales.ae"; phone = "+971-50-555-1003"; status = "lead"; notes = "Wants Arabic UI later; English OK now." }
  @{ name = "Lucas Meyer"; email = "lucas@alpinelogic.de"; phone = "+49-170-555-1004"; status = "active"; notes = "EU data residency questions answered." }
  @{ name = "Nina Popov"; email = "nina@eastbridge.ru"; phone = "+7-900-555-1005"; status = "lead"; notes = "Asked for Telegram bot demo." }
  @{ name = "Chris Patel"; email = "chris@sunnydale.ca"; phone = "+1-416-555-1006"; status = "active"; notes = "Canadian expansion partner." }
  @{ name = "Mia Rossi"; email = "mia@vesuvio.it"; phone = "+39-340-555-1007"; status = "active"; notes = "Retail franchise CRM pilot." }
  @{ name = "Omar Haddad"; email = "omar@levanttrade.lb"; phone = "+961-71-555-1008"; status = "lead"; notes = "Import/export contact list migration." }
  @{ name = "Grace Kim"; email = "grace@hanul.kr"; phone = "+82-10-5555-1009"; status = "inactive"; notes = "On hold until next fiscal year." }
  @{ name = "Ethan Wright"; email = "ethan@redrock.io"; phone = "+1-602-555-1010"; status = "active"; notes = "Needs task reminders and team invites." }
)

$acmeTasks = @(
  @{ title = "Demo Kanban pipeline for Jordan"; status = "pending" }
  @{ title = "Invite Bob to Acme workspace checkup"; status = "pending" }
  @{ title = "Configure Telegram for Acme ops"; status = "pending" }
  @{ title = "Send contract draft to Lucas"; status = "pending" }
  @{ title = "Follow up Aisha after trial week"; status = "pending" }
  @{ title = "Archive Grace nurture campaign"; status = "done" }
  @{ title = "Sync email alerts to team@acme.com"; status = "done" }
  @{ title = "Prepare Acme Q3 forecast slide"; status = "pending" }
)

Seed-Tenant "Globex Industries" "sara@globex.com" "secret123" "globex" $globexContacts $globexTasks
Seed-Tenant "Acme Corp" "jane@acme.com" "secret123" "acme" $acmeContacts $acmeTasks

Write-Host "`n=== Platform: suspend junk test tenants ===" -ForegroundColor Cyan
$p = Invoke-RestMethod "$base/platform/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@nexcrm.com","password":"admin123"}'
$ph = @{ Authorization = "Bearer $($p.access_token)" }
$tenants = Invoke-RestMethod "$base/platform/tenants" -Headers $ph
foreach ($t in $tenants) {
  $junk = ($t.company_code -match '^(verify|testco)') -or ($t.name -match '^(Verify Co|Test Co)')
  if ($junk -and $t.status -eq "active") {
    Invoke-RestMethod "$base/platform/tenants/$($t.id)/status" -Method PATCH -Headers $ph -ContentType "application/json" -Body '{"status":"suspended"}' | Out-Null
    Write-Host "  suspended $($t.name) ($($t.company_code))" -ForegroundColor Yellow
  }
}

$tenants2 = Invoke-RestMethod "$base/platform/tenants" -Headers $ph
Write-Host "`nPlatform tenants now:" -ForegroundColor Cyan
$tenants2 | Sort-Object status, name | ForEach-Object {
  Write-Host ("  [{0}] {1} · {2} · {3}" -f $_.status, $_.name, $_.company_code, $_.plan)
}
Write-Host "`nDone. Refresh web dashboard / admin console." -ForegroundColor Green
