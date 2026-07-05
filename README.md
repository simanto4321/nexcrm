# NexCRM

Multi-tenant CRM capstone — **live demo** + local development.

**Repository:** [github.com/simanto4321/nexcrm](https://github.com/simanto4321/nexcrm)

## Live demo

| | URL |
|---|-----|
| **Web app** | [simanto4321.github.io/nexcrm](https://simanto4321.github.io/nexcrm/) |
| **API** | [nexcrm-api-phi.vercel.app](https://nexcrm-api-phi.vercel.app) |
| **API docs** | [nexcrm-api-phi.vercel.app/docs](https://nexcrm-api-phi.vercel.app/docs) |

### Demo logins

| Role | Email | Password | Company code |
|------|-------|----------|--------------|
| Tenant admin (Globex) | `sara@globex.com` | `secret123` | `globex` |
| Sales rep (Globex) | `tom@globex.com` | `secret123` | `globex` |
| Tenant admin (Acme) | `jane@acme.com` | `secret123` | `acme` |
| Platform super-admin | `admin@nexcrm.com` | `admin123` | — (use [Platform Console](https://simanto4321.github.io/nexcrm/platform-admin)) |

### Integrations (per tenant, in Settings)

| Tenant | Team email | Telegram chat ID |
|--------|------------|------------------|
| Globex | `team@globex.com` | `-100999888777` |
| Acme | `team@acme.com` | `-100777666555` |

Email test works on live API. For Telegram outbound messages, set `TELEGRAM_BOT_TOKEN` on the Vercel API project.

---

## Folder layout

```
D:\NexCRM\
├── backend/          FastAPI + SQLAlchemy + Alembic
├── frontend-web/     React (Vite) — web app
├── mobile-app/       Expo React Native — Stage 8 (planned)
├── docs/             Architecture, stages, proposal
└── scripts/          Run, seed, test scripts
```

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
| 9 — Live hosting | ✅ [Web](https://simanto4321.github.io/nexcrm/) + [API](https://nexcrm-api-phi.vercel.app) |

See `docs/STAGE-9-DEPLOY.md` for deployment details.

---

## Local development

```powershell
D:\NexCRM\scripts\run-backend.ps1      # API :8000
D:\NexCRM\scripts\run-frontend.ps1     # Web :5173
D:\NexCRM\scripts\run-demo-smtp.ps1    # optional email demo
```

Seed database (Supabase):

```powershell
cd D:\NexCRM\backend
D:\NexCRM\.venv\Scripts\python.exe scripts\seed_data.py
D:\NexCRM\.venv\Scripts\python.exe scripts\seed_integrations.py
```

---

## D-drive policy

Project files, venv, and caches stay on **D:\NexCRM**. See `scripts/setup-backend.bat` for env vars.
