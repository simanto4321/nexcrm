# Stage 9 — Live hosting

NexCRM is deployed as two services:

| Service | Host | Live URL |
|---------|------|----------|
| **Web** | GitHub Pages (auto on push to `main`) | [simanto4321.github.io/nexcrm](https://simanto4321.github.io/nexcrm/) |
| **API** | Vercel (serverless FastAPI) | [nexcrm-api-phi.vercel.app](https://nexcrm-api-phi.vercel.app) |

GitHub repo: [github.com/simanto4321/nexcrm](https://github.com/simanto4321/nexcrm)

---

## Auto-deploy (GitHub)

Pushing to `main` triggers the **Deploy Web** workflow (`.github/workflows/deploy-web.yml`).

Required GitHub Actions variable:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://nexcrm-api-phi.vercel.app` |

---

## API on Vercel

```powershell
cd D:\NexCRM\backend
npx vercel login
npx vercel deploy --prod
```

Production env vars on Vercel project `nexcrm-api`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase PostgreSQL pooler URL |
| `JWT_SECRET` | Same as local `backend/.env` |
| `CORS_ORIGINS` | `https://simanto4321.github.io,http://localhost:5173` |
| `EMAIL_SIMULATE_MODE` | `true` — demo emails without Gmail SMTP |
| `TELEGRAM_BOT_TOKEN` | Optional — from [@BotFather](https://t.me/BotFather) |

Health check: `GET /health` → `{"status":"ok","service":"nexcrm-backend"}`

> Ollama runs locally only. On Vercel the chatbot uses **FAQ fallback**.

---

## Demo login (live)

- **Web:** [simanto4321.github.io/nexcrm/login](https://simanto4321.github.io/nexcrm/login)
- Email: `sara@globex.com`
- Password: `secret123`
- Company: `globex`

After login: **Settings** → test Email & Telegram integrations.

---

## Local dev

```powershell
D:\NexCRM\scripts\run-backend.ps1
D:\NexCRM\scripts\run-frontend.ps1
```

Local frontend proxies `/api` → `localhost:8000` via `frontend-web/.env`.

---

## Alternative: Render API

`render.yaml` is included if you prefer Render over Vercel for the API. See `scripts/deploy-api-render.ps1`.
