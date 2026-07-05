# Local demo SMTP (captures mail to D:\NexCRM\.cache\email-demo.log)
$env:PIP_CACHE_DIR = "D:\NexCRM\.cache\pip"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"
Set-Location D:\NexCRM
& D:\NexCRM\.venv\Scripts\Activate.ps1
D:\NexCRM\.venv\Scripts\python.exe D:\NexCRM\scripts\demo_smtp_server.py
