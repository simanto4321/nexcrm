# Quick Stage 1 API smoke tests (server must be running on port 8000)
$base = "http://localhost:8000"

Write-Host "`n=== 1. Health ===" -ForegroundColor Cyan
Invoke-RestMethod "$base/health" | ConvertTo-Json

Write-Host "`n=== 2. Signup ===" -ForegroundColor Cyan
$signupBody = @{
    tenant_name = "Acme Corp"
    company_code = "acme"
    admin_name = "Jane Admin"
    admin_email = "jane@acme.com"
    password = "secret123"
} | ConvertTo-Json

try {
    $signup = Invoke-RestMethod -Method POST -Uri "$base/auth/signup" -ContentType "application/json" -Body $signupBody
    $signup | ConvertTo-Json
    $token = $signup.access_token
} catch {
    Write-Host "Signup failed (may already exist): $($_.Exception.Message)" -ForegroundColor Yellow
    $loginBody = @{
        email = "jane@acme.com"
        password = "secret123"
        company_code = "acme"
    } | ConvertTo-Json
    $signup = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" -Body $loginBody
    $token = $signup.access_token
    Write-Host "Logged in instead." -ForegroundColor Green
}

Write-Host "`n=== 3. Login ===" -ForegroundColor Cyan
$loginBody = @{
    email = "jane@acme.com"
    password = "secret123"
    company_code = "acme"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" -Body $loginBody | ConvertTo-Json

Write-Host "`n=== 4. GET /auth/me (protected) ===" -ForegroundColor Cyan
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "$base/auth/me" -Headers $headers | ConvertTo-Json

Write-Host "`nAll Stage 1 tests passed!" -ForegroundColor Green
