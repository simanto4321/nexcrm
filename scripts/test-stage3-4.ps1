# Test Stage 3 (text chatbot) and Stage 4 (voice demo page)
$ErrorActionPreference = "Stop"
$base = "http://localhost:8000"

Write-Host "=== Health ==="
$h = Invoke-RestMethod "$base/health"
Write-Host ($h | ConvertTo-Json -Compress)

Write-Host "`n=== Ollama ==="
try {
    $tags = Invoke-RestMethod "http://localhost:11434/api/tags" -TimeoutSec 5
    Write-Host "Models:" ($tags.models | ForEach-Object { $_.name }) -Separator ", "
} catch {
    Write-Error "Ollama not running - start D:\NexCRM\scripts\run-ollama.ps1"
}

Write-Host "`n=== Stage 3: POST /chatbot/message ==="
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$headers = @{ Authorization = "Bearer $($login.access_token)" }
$r1 = Invoke-RestMethod -Method POST -Uri "$base/chatbot/message" -Headers $headers -ContentType "application/json" `
    -Body '{"message":"How do I add a contact?","conversation_history":[]}'
Write-Host "source=$($r1.source) session_id=$($r1.session_id)"
if ($r1.source -ne "ollama") { Write-Warning "Expected source=ollama" }

$r2 = Invoke-RestMethod -Method POST -Uri "$base/chatbot/message" -Headers $headers -ContentType "application/json" `
    -Body (@{ message = "What about deals?"; conversation_history = @(); session_id = $r1.session_id } | ConvertTo-Json)
Write-Host "follow-up source=$($r2.source) session_id=$($r2.session_id)"

Write-Host "`n=== Stage 4: voice demo page ==="
$code = (Invoke-WebRequest "$base/voice-demo/" -UseBasicParsing).StatusCode
Write-Host "GET /voice-demo/ -> $code"
if ($code -ne 200) { Write-Error "Voice demo page failed" }

Write-Host "`nAll Stage 3-4 checks passed. Open ${base}/voice-demo/ in Chrome to test mic."
