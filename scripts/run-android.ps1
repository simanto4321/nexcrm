# Start NexCRM Android — movable emulator + Expo app
$ErrorActionPreference = "Stop"
$env:ANDROID_HOME = "D:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "D:\Android\Sdk"
$env:ANDROID_USER_HOME = "D:\Android\.android"
$env:ANDROID_AVD_HOME = "D:\Android\.android\avd"
$env:JAVA_HOME = "D:\Android\Android Studio\jbr"
$env:npm_config_cache = "D:\NexCRM\.cache\npm"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
$env:Path = "D:\Android\Sdk\platform-tools;D:\Android\Sdk\emulator;D:\Android\Android Studio\jbr\bin;" + $env:Path

Write-Host "`n=== NexCRM Android (movable emulator) ===" -ForegroundColor Cyan

# Keep window on-screen and draggable
$userIni = "D:\Android\.android\avd\NexCRM_Fast.avd\emulator-user.ini"
@(
  "window.x = 60",
  "window.y = 30",
  "window.scale = 0.32",
  "resizable.config.id = -1",
  "posture = 0",
  "uuid = 0"
) | Set-Content -Path $userIni -Encoding ASCII

$preferred = "NexCRM_Fast"
$avds = @( & emulator -list-avds 2>$null | ForEach-Object { $_.ToString().Trim() } | Where-Object { $_ } )
if ($avds -notcontains $preferred) {
  Write-Host "NexCRM_Fast missing. Available: $($avds -join ', ')" -ForegroundColor Yellow
  if ($avds.Count -eq 0) { exit 1 }
  $preferred = $avds[0]
}

$running = & adb devices 2>$null | Select-String "emulator-"
if (-not $running) {
  Write-Host "Starting $preferred (scale 0.32, title bar visible)..." -ForegroundColor Yellow
  Start-Process -FilePath "emulator" -ArgumentList @(
    "-avd", $preferred,
    "-scale", "0.32",
    "-skin", "360x740",
    "-no-snapshot-load",
    "-no-boot-anim",
    "-gpu", "swiftshader_indirect",
    "-memory", "1536",
    "-cores", "2",
    "-no-audio"
  ) -WindowStyle Normal
  adb wait-for-device
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    $boot = (& adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
    if ($boot -eq "1") { break }
    Write-Host "  booting... ($i)"
  }
} else {
  Write-Host "Emulator already running. If cropped, close it and re-run D:\Android\Start-NexCRM-Emulator.bat" -ForegroundColor Yellow
}

Write-Host "`nDemo: sara@globex.com / secret123 / globex"
Write-Host "Drag the emulator TITLE BAR to move the window.`n"
Set-Location D:\NexCRM\frontend-mobile
npx expo start --android
