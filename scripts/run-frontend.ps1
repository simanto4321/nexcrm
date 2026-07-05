# Start NexCRM React frontend on http://localhost:5173
$env:NPM_CONFIG_CACHE = "D:\NexCRM\.cache\npm"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"
Set-Location D:\NexCRM\frontend-web
npm run dev -- --host 0.0.0.0
