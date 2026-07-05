# NexCRM

Multi-tenant CRM capstone project — all project files live on **D:\NexCRM**.

## Folder layout

```
D:\NexCRM\
├── backend/          FastAPI + SQLAlchemy + Alembic
├── frontend-web/     React (Vite) — Stage 7
├── mobile-app/       Expo React Native — Stage 8
└── docs/             Architecture notes
```

## D-drive only policy

All project files, virtualenv, pip/npm caches, and temp files stay on **D:\NexCRM**:

| Path | Purpose |
|------|---------|
| `D:\NexCRM\` | Source code |
| `D:\NexCRM\.venv\` | Python virtual environment |
| `D:\NexCRM\.cache\pip\` | pip download cache |
| `D:\NexCRM\.cache\npm\` | npm cache (Stages 7–8) |
| `D:\NexCRM\.cache\temp\` | TEMP/TMP during installs |

**Before every terminal session**, run:

```powershell
$env:PIP_CACHE_DIR = "D:\NexCRM\.cache\pip"
$env:NPM_CONFIG_CACHE = "D:\NexCRM\.cache\npm"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"
```

Or use `D:\NexCRM\scripts\setup-backend.bat` which sets these automatically.

> **Note:** Your system Python is 3.14 (on C:). The venv at `D:\NexCRM\.venv` uses that interpreter but all *packages* install on D. For faculty compliance with "Python 3.11+", you can optionally install Python 3.12 to `D:\Python312` and recreate the venv with `D:\Python312\python.exe -m venv D:\NexCRM\.venv`.

## Stages

| Stage | Status |
|-------|--------|
| 1 — Backend foundation | ✅ Complete |
| 2 — Core CRM endpoints | ✅ Complete |
| 3 — AI chatbot | ✅ Complete |
| 4 — Voice chatbot | ✅ Complete |
| 5 — Telegram integration | ✅ Complete |
| 6 — Email integration | ✅ Complete |
| 7 — React web frontend | ✅ Complete |
| 8 — Expo mobile app | pending |

See `docs/STAGE-1.md` for setup and test commands.
