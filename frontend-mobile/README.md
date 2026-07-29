# NexCRM Android (Expo)

Premium mobile client for the live NexCRM API.

**API:** `https://nexcrm-api-phi.vercel.app`  
**Demo login:** `sara@globex.com` / `secret123` / company code `globex`

## Android SDK location (this PC)

Everything Android-related is on **D:** only:

| What | Path |
|------|------|
| Android SDK | `D:\Android\Sdk` |
| Emulator AVDs / user data | `D:\Android\.android` |
| Recommended Android Studio install | `D:\Android\Android Studio` |

Do **not** put the SDK back on C: or G: (C: is nearly full).

## Screens

| Tab | Features |
|-----|----------|
| Home | Dashboard stats, pipeline value, won revenue, recent activity |
| Contacts | List + create (with notes) |
| Deals | Filter by stage + move deal stages |
| Tasks | Create, toggle done/pending |
| Alerts | In-app notifications |

## Faculty demo — step by step

### 1. Install / open Android Studio on D: (if needed)

If Android Studio is missing or still pointed at an old drive:

1. Download Android Studio from Google  
2. Install to: `D:\Android\Android Studio`  
3. First run → **More Actions → SDK Manager**  
4. Set Android SDK Location to: `D:\Android\Sdk`  
5. Finish setup (use existing SDK; no need to re-download everything)

### 2. Start the emulator

1. Open **Android Studio**  
2. **Device Manager** → start **`NexCRM_Pixel`** (already on D:)  
3. Wait until the emulator home screen appears  

Or from PowerShell (after closing Cursor terminals that might lock tools):

```powershell
D:\NexCRM\scripts\run-android.ps1
```

### 3. Run the NexCRM app

```powershell
$env:ANDROID_HOME = "D:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "D:\Android\Sdk"
$env:ANDROID_USER_HOME = "D:\Android\.android"
$env:ANDROID_AVD_HOME = "D:\Android\.android\avd"
$env:Path = "D:\Android\Sdk\platform-tools;D:\Android\Sdk\emulator;" + $env:Path

cd D:\NexCRM\frontend-mobile
npm start
```

Press **`a`** to open on the emulator.

### 4. Test part by part

1. Sign in: `sara@globex.com` / `secret123` / `globex`  
2. Home → Contacts → Deals → Tasks → Alerts  
3. Sign out  

## Notes

- Project folder: `D:\NexCRM\frontend-mobile`  
- Web (premium): https://nexcrm-web-gilt.vercel.app  
- Same live API as the web app — no local backend needed  
