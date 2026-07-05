@echo off
REM NexCRM backend setup — keeps venv and pip cache on D drive
set PIP_CACHE_DIR=D:\NexCRM\.cache\pip
set TEMP=D:\NexCRM\.cache\temp
set TMP=D:\NexCRM\.cache\temp

if not exist D:\NexCRM\.cache\pip mkdir D:\NexCRM\.cache\pip
if not exist D:\NexCRM\.cache\temp mkdir D:\NexCRM\.cache\temp

cd /d D:\NexCRM\backend

if not exist D:\NexCRM\.venv (
    python -m venv D:\NexCRM\.venv
)

call D:\NexCRM\.venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo Setup complete. Next steps:
echo   1. Copy .env.example to .env and set DATABASE_URL
echo   2. alembic upgrade head
echo   3. uvicorn app.main:app --reload --port 8000
