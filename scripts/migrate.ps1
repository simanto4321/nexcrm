# Run Alembic migrations against DATABASE_URL in backend/.env
$env:PIP_CACHE_DIR = "D:\NexCRM\.cache\pip"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"

Set-Location D:\NexCRM\backend
& D:\NexCRM\.venv\Scripts\Activate.ps1
alembic upgrade head
