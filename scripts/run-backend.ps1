# Start NexCRM backend — keeps temp/cache on D drive
$env:PIP_CACHE_DIR = "D:\NexCRM\.cache\pip"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"

Set-Location D:\NexCRM\backend
& D:\NexCRM\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
