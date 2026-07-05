@echo off
REM Install and run Ollama with models stored on D drive
set OLLAMA_MODELS=D:\NexCRM\.ollama\models
set OLLAMA_HOST=127.0.0.1:11434

if not exist D:\NexCRM\.ollama\models mkdir D:\NexCRM\.ollama\models

echo.
echo === NexCRM Ollama setup ===
echo Models folder: %OLLAMA_MODELS%
echo.

where ollama >nul 2>&1
if errorlevel 1 (
    echo Ollama is NOT installed yet.
    echo.
    echo 1. Download from https://ollama.com/download/windows
    echo 2. Install it, then run this script again.
    echo.
    echo To keep models on D drive, set user env var before installing:
    echo    OLLAMA_MODELS=D:\NexCRM\.ollama\models
    exit /b 1
)

echo Pulling model llama3.2 ^(small, fast, open-source^)...
ollama pull llama3.2

echo.
echo Starting Ollama server...
echo Backend will use http://localhost:11434
ollama serve
