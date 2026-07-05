# Stage 7 — React Web Frontend

Multi-page CRM UI with **React (Vite) + Tailwind CSS + React Router + Axios**.

## Prerequisites

- Backend running: `D:\NexCRM\scripts\run-backend.ps1`
- Demo email SMTP (optional): `D:\NexCRM\scripts\run-demo-smtp.ps1`
- Integration rows in DB: `D:\NexCRM\backend\scripts\seed_integrations.py`

## Start the web app

```powershell
D:\NexCRM\scripts\run-frontend.ps1
```

Open **http://localhost:5173**

API calls proxy through Vite to `http://localhost:8000` (`/api/*`).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Zoho-style marketing landing page |
| `/login` | Tenant sign in |
| `/signup` | Create tenant (free trial CTA) |
| `/dashboard` | Home — stats & pipeline breakdown |
| `/contacts` | Contact list + create |
| `/pipeline` | Deals Kanban board |
| `/tasks` | Task list |
| `/settings` | Email + Telegram setup (tenant_admin) |
| `/platform-admin` | Super-admin tenant console |

Design follows **Zoho CRM** patterns: red `#e42527` accent, white sidebar, light gray `#f6f7fb` app background, clean tables and cards.

## Demo logins

| Email | Password | Company | Role |
|-------|----------|---------|------|
| sara@globex.com | secret123 | globex | tenant_admin |
| tom@globex.com | secret123 | globex | sales_rep |
| admin@nexcrm.com | admin123 | — | platform admin |

## Floating chat bubble

Mounted on every authenticated page. Uses:

- `POST /chatbot/message` (same Ollama pipeline as Stage 3)
- Web Speech API for mic input and optional TTS

## Settings → database

Settings page reads/writes:

- `tenant_email_config.team_email` via `/email/config`
- `telegram_groups.chat_id` via `/telegram/register`

Run `D:\NexCRM\scripts\verify-stage5-6.ps1` to confirm API + DB rows.

## Build for production

```powershell
cd D:\NexCRM\frontend-web
npm run build
```

Output: `frontend-web/dist/`

## Confirm before Stage 8

Log in as Sara, open Settings and confirm email/Telegram values match DB, drag a deal on Pipeline, send a chat message, then continue to Expo mobile (Stage 8).
