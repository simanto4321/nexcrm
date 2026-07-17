# Stage 9 — Live hosting (Vercel)

| Service | Vercel project | Live URL |
|---------|----------------|----------|
| **Web** | `nexcrm-web` | [nexcrm-web.vercel.app](https://nexcrm-web.vercel.app) |
| **API** | `nexcrm-api` | [nexcrm-api-phi.vercel.app](https://nexcrm-api-phi.vercel.app) |

GitHub mirror: [simanto4321.github.io/nexcrm](https://simanto4321.github.io/nexcrm/) (auto-deploy on push)

---

## One-command deploy

```powershell
D:\NexCRM\scripts\deploy-vercel.ps1
```

---

## API (`nexcrm-api`) — env vars

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Supabase pooler URL (`postgresql://...`) |
| `JWT_SECRET` | Long random secret |
| `CORS_ORIGINS` | `https://nexcrm-web.vercel.app,https://simanto4321.github.io,http://localhost:5173` |
| `EMAIL_SIMULATE_MODE` | `true` (demo emails without Gmail) |
| `TELEGRAM_BOT_TOKEN` | Optional — from [@BotFather](https://t.me/BotFather) |

Webhook URL for Telegram: `https://nexcrm-api-phi.vercel.app/telegram/webhook`

---

## Web (`nexcrm-web`) — env vars

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://nexcrm-api-phi.vercel.app` |
| `VITE_BASE_PATH` | `/` |

---

## Fix database connection (login 500)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. If paused, click **Restore**
3. Settings → Database → copy **Connection string** (pooler, port 6543)
4. Vercel → `nexcrm-api` → Settings → Environment Variables → update `DATABASE_URL`
5. Redeploy: `cd backend && npx vercel deploy --prod`
6. Seed data: `python scripts/seed_data.py` and `seed_integrations.py`

---

## Demo login

- Web: [nexcrm-web.vercel.app/login](https://nexcrm-web.vercel.app/login)
- `sara@globex.com` / `secret123` / `globex`
