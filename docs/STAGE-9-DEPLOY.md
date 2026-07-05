# Stage 9 — Live hosting

NexCRM is deployed as two services:

| Service | Host | URL pattern |
|---------|------|-------------|
| **Web** | GitHub Pages (auto on push to `main`) | **Live:** [simanto4321.github.io/nexcrm](https://simanto4321.github.io/nexcrm/) |
| **API** | Render (free tier) | `https://nexcrm-api.onrender.com` |

Alternative web host: **Vercel** — run `npx vercel --prod` from `frontend-web/` after `npx vercel login`.

---

## 1. Push code to GitHub

```powershell
cd D:\NexCRM
git init
git add .
git commit -m "Add NexCRM web deployment configs"
gh repo create nexcrm --public --source=. --remote=origin --push
```

---

## 2. Deploy API on Render

1. Open [Render Blueprint deploy](https://dashboard.render.com/select-repo?type=blueprint) and connect the `nexcrm` repo.
2. Set these **environment variables** on the `nexcrm-api` service:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Supabase pooler URL (`postgresql://...`) |
| `JWT_SECRET` | Same as local `backend/.env` |
| `CORS_ORIGINS` | `https://simanto4321.github.io,https://YOUR-VERCEL-URL.vercel.app` |

3. Wait for deploy; note the API URL (e.g. `https://nexcrm-api.onrender.com`).

4. Test: `https://nexcrm-api.onrender.com/health` → `{"status":"ok"}`

> **Note:** Ollama runs locally only. On Render the chatbot uses **FAQ fallback** automatically.

---

## 3. Connect frontend to live API

In GitHub repo **Settings → Secrets and variables → Actions → Variables**, add:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://nexcrm-api.onrender.com` (no trailing slash) |

Re-run the **Deploy Web** workflow (Actions tab → Deploy Web → Run workflow).

---

## 4. Vercel (optional — cleaner URL)

```powershell
cd D:\NexCRM\frontend-web
npx vercel login
npx vercel --prod
# Set VITE_API_URL in Vercel project Environment Variables
```

Use `VITE_BASE_PATH=/` on Vercel (default).

---

## Demo login (live)

- URL: `https://simanto4321.github.io/nexcrm/`
- Email: `sara@globex.com`
- Password: `secret123`
- Company: `globex`

---

## Local dev (unchanged)

```powershell
D:\NexCRM\scripts\run-backend.ps1
D:\NexCRM\scripts\run-frontend.ps1
```

Local frontend uses `/api` proxy to `localhost:8000` via `frontend-web/.env`.
