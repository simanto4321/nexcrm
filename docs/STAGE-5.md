# Stage 5 — Telegram Integration

Telegram messages flow through the **same Ollama chat pipeline** as `/chatbot/message`. The backend never receives audio — only text from Telegram.

## Setup

### 1. Create a bot (BotFather)

1. Open Telegram → [@BotFather](https://t.me/BotFather)
2. `/newbot` → follow prompts → copy the **bot token**
3. Add the bot to your company Telegram **group**
4. Get the group **chat_id** (negative number for groups):
   - Add [@userinfobot](https://t.me/userinfobot) to the group, or
   - Send a message and call `getUpdates` on the bot API

### 2. Configure backend

Add to `D:\NexCRM\backend\.env`:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHI...
TELEGRAM_WEBHOOK_SECRET=any-random-string-you-pick
```

Restart the API after editing `.env`.

### 3. Register chat_id (tenant_admin JWT)

```powershell
$login = Invoke-RestMethod -Method POST -Uri http://localhost:8000/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

Invoke-RestMethod -Method POST -Uri http://localhost:8000/telegram/register `
  -Headers $h -ContentType "application/json" `
  -Body '{"chat_id":"-1001234567890","invite_link":"https://t.me/yourgroup"}'
```

### 4. Set webhook (production / ngrok)

Telegram must reach your server over HTTPS. For local dev use [ngrok](https://ngrok.com):

```powershell
ngrok http 8000
# Then set webhook (replace URL and token):
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-NGROK-URL/telegram/webhook&secret_token=YOUR_WEBHOOK_SECRET"
```

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/telegram/status` | tenant_admin | Show linked chat_id |
| POST | `/telegram/register` | tenant_admin | Link group chat_id to tenant |
| POST | `/telegram/webhook` | Telegram (secret header) | Receive messages, reply via Ollama |

## Automated test (no live Telegram)

```powershell
D:\NexCRM\scripts\test-stage5.ps1
```

Simulates webhook with a registered test chat_id.

## Confirm before Stage 6

Send a message in your linked Telegram group and receive an Ollama reply, then continue to email integration (Stage 6).
