# Start Ollama server — models stored on D drive
$env:OLLAMA_MODELS = "D:\NexCRM\.ollama\models"
$env:OLLAMA_HOST = "127.0.0.1:11434"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"

if (-not (Test-Path "D:\NexCRM\ollama\ollama.exe")) {
    Write-Error "ollama.exe not found at D:\NexCRM\ollama\ — run finish-ollama-setup.ps1 first"
}
Write-Host "Starting Ollama (models: $env:OLLAMA_MODELS) ..."
& "D:\NexCRM\ollama\ollama.exe" serve
