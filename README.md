# NexCRM

Multi-tenant CRM capstone — **full stack on Vercel** + GitHub Pages mirror.

**Repository:** [github.com/simanto4321/nexcrm](https://github.com/simanto4321/nexcrm)

## Live demo (Vercel — primary)

| | URL |
|---|-----|
| **Web app** | [nexcrm-web.vercel.app](https://nexcrm-web.vercel.app) |
| **API** | [nexcrm-api-phi.vercel.app](https://nexcrm-api-phi.vercel.app) |
| **API docs** | [nexcrm-api-phi.vercel.app/docs](https://nexcrm-api-phi.vercel.app/docs) |

**Mirror (GitHub Pages):** [simanto4321.github.io/nexcrm](https://simanto4321.github.io/nexcrm/)

### Demo logins

| Role | Email | Password | Company code |
|------|-------|----------|--------------|
| Tenant admin (Globex) | `sara@globex.com` | `secret123` | `globex` |
| Sales rep (Globex) | `tom@globex.com` | `secret123` | `globex` |
| Tenant admin (Acme) | `jane@acme.com` | `secret123` | `acme` |
| Platform super-admin | `admin@nexcrm.com` | `admin123` | [Platform Console](https://nexcrm-web.vercel.app/platform-admin) |

### CRM features (web)

- Dashboard — contacts, deals by stage, pending tasks
- **Contacts** — create, edit, delete, search
- **Deals** — Kanban pipeline, drag stages, create/edit/delete
- **Tasks** — create, complete, delete
- **Settings** — email + Telegram (tenant admin)
- **AI chat** — floating bubble with voice (FAQ fallback on Vercel)
- **Platform admin** — suspend/activate tenants

### Integrations (Settings)

| Tenant | Team email | Telegram chat ID |
|--------|------------|------------------|
| Globex | `team@globex.com` | `-100999888777` |
| Acme | `team@acme.com` | `-100777666555` |

Email test works with `EMAIL_SIMULATE_MODE` on Vercel. Add `TELEGRAM_BOT_TOKEN` for live Telegram.

---

## Deploy to Vercel

```powershell
D:\NexCRM\scripts\deploy-vercel.ps1
```

Or manually:

```powershell
cd D:\NexCRM\backend && npx vercel deploy --prod
cd D:\NexCRM\frontend-web && npx vercel deploy --prod
```

**API env vars** (Vercel project `nexcrm-api`): `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `EMAIL_SIMULATE_MODE=true`

**Web env vars** (Vercel project `nexcrm-web`): `VITE_API_URL=https://nexcrm-api-phi.vercel.app`, `VITE_BASE_PATH=/`

> **Database:** If login returns 500, open [Supabase Dashboard](https://supabase.com/dashboard) → restore/unpause project → copy pooler URL → update `DATABASE_URL` on Vercel → redeploy API.

---

## Local development

```powershell
D:\NexCRM\scripts\run-backend.ps1      # :8000
D:\NexCRM\scripts\run-frontend.ps1     # :5173
```

Seed database:

```powershell
cd D:\NexCRM\backend
D:\NexCRM\.venv\Scripts\python.exe scripts\seed_data.py
D:\NexCRM\.venv\Scripts\python.exe scripts\seed_integrations.py
```

---

## Stages

| Stage | Status |
|-------|--------|
| 1–7 Backend + Web CRM | ✅ Complete |
| 8 Mobile (Expo) | pending |
| 9 Live hosting | ✅ Vercel Web + API |

See `docs/STAGE-9-DEPLOY.md` for details.
