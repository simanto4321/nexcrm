# Waits for Ollama zip download, extracts, starts server, pulls model, tests chatbot.
$ErrorActionPreference = "Stop"
$ROOT = "D:\NexCRM"
$ZIP = "$ROOT\.cache\ollama-windows-amd64.zip"
$OLLAMA_DIR = "$ROOT\ollama"
$EXPECTED = 1497028570
$env:OLLAMA_MODELS = "$ROOT\.ollama\models"
$env:OLLAMA_HOST = "127.0.0.1:11434"
$env:TEMP = "$ROOT\.cache\temp"
$env:TMP = "$ROOT\.cache\temp"

Write-Host "=== Waiting for Ollama download to finish ==="
while ($true) {
    if (Test-Path $ZIP) {
        $size = (Get-Item $ZIP).Length
        $pct = [math]::Round(100 * $size / $EXPECTED, 1)
        Write-Host "$(Get-Date -Format HH:mm:ss) Download: $pct% ($size bytes)"
        if ($size -ge $EXPECTED) { break }
    }
    Start-Sleep -Seconds 15
}

Write-Host "Extracting to $OLLAMA_DIR ..."
New-Item -ItemType Directory -Force -Path $OLLAMA_DIR, $env:OLLAMA_MODELS | Out-Null
$preExtracted = "$ROOT\.cache\ollama-windows-amd64\ollama.exe"
if (Test-Path $preExtracted) {
    Copy-Item -Path "$ROOT\.cache\ollama-windows-amd64\*" -Destination $OLLAMA_DIR -Recurse -Force
} else {
    Expand-Archive -Path $ZIP -DestinationPath $OLLAMA_DIR -Force
}

if (-not (Test-Path "$OLLAMA_DIR\ollama.exe")) {
    Write-Error "ollama.exe not found after extract"
}

Write-Host "Pulling model llama3.2:1b (small, ~1.3GB)..."
& "$OLLAMA_DIR\ollama.exe" pull llama3.2:1b

Write-Host "Starting Ollama server..."
Start-Process -FilePath "$OLLAMA_DIR\ollama.exe" -ArgumentList "serve" -WindowStyle Minimized -Environment @{
    OLLAMA_MODELS = $env:OLLAMA_MODELS
    OLLAMA_HOST = $env:OLLAMA_HOST
}

Start-Sleep -Seconds 5

Write-Host "Testing Ollama API..."
$tags = Invoke-RestMethod "http://localhost:11434/api/tags" -TimeoutSec 10
Write-Host "Models:" ($tags.models | ForEach-Object { $_.name })

Write-Host "Testing NexCRM chatbot..."
$login = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/auth/login" `
    -ContentType "application/json" `
    -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }
$body = '{"message":"How do I add a contact?","conversation_history":[]}'
$result = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/chatbot/message" `
    -Headers $h -ContentType "application/json" -Body $body
$result | ConvertTo-Json

Write-Host "`n=== Ollama setup complete ==="
