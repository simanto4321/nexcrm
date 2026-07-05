@echo off
REM Download, install, and run Ollama on D drive for NexCRM
setlocal

set ROOT=D:\NexCRM
set CACHE=%ROOT%\.cache
set OLLAMA_DIR=%ROOT%\ollama
set OLLAMA_MODELS=%ROOT%\.ollama\models
set OLLAMA_HOST=127.0.0.1:11434
set ZIP=%CACHE%\ollama-windows-amd64.zip
set URL=https://github.com/ollama/ollama/releases/download/v0.31.1/ollama-windows-amd64.zip
set EXPECTED=1497028570

if not exist "%CACHE%" mkdir "%CACHE%"
if not exist "%OLLAMA_MODELS%" mkdir "%OLLAMA_MODELS%"
if not exist "%OLLAMA_DIR%" mkdir "%OLLAMA_DIR%"

REM Persist models path for future sessions
setx OLLAMA_MODELS "%OLLAMA_MODELS%" >nul 2>&1

echo === NexCRM Ollama setup (D drive) ===
echo Models: %OLLAMA_MODELS%
echo.

if exist "%OLLAMA_DIR%\ollama.exe" goto :serve

if not exist "%ZIP%" goto :download
for %%A in ("%ZIP%") do set SIZE=%%~zA
if %SIZE% LSS %EXPECTED% goto :download
goto :extract

:download
echo Downloading Ollama (~1.4 GB, resumable)...
curl.exe -L -C - -o "%ZIP%" "%URL%"
if errorlevel 1 (
    echo Download failed. Check internet and run again.
    exit /b 1
)

:extract
echo Extracting to %OLLAMA_DIR% ...
tar -xf "%ZIP%" -C "%OLLAMA_DIR%"
if not exist "%OLLAMA_DIR%\ollama.exe" (
    powershell -Command "Expand-Archive -Path '%ZIP%' -DestinationPath '%OLLAMA_DIR%' -Force"
)

:serve
if not exist "%OLLAMA_DIR%\ollama.exe" (
    echo ollama.exe not found after extract.
    exit /b 1
)

echo Pulling model llama3.2:1b (small, fast)...
"%OLLAMA_DIR%\ollama.exe" pull llama3.2:1b

echo.
echo Starting Ollama server on %OLLAMA_HOST% ...
start "Ollama" /min cmd /c "set OLLAMA_MODELS=%OLLAMA_MODELS%&& set OLLAMA_HOST=%OLLAMA_HOST%&& cd /d %OLLAMA_DIR%&& ollama.exe serve"

echo Done. Ollama should be at http://localhost:11434
echo Update backend .env: OLLAMA_MODEL=llama3.2:1b
