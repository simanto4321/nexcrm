# Stage 6 — Email Integration

Outbound notifications via **Gmail SMTP**. Each tenant configures a `team_email` address; the API sends plain-text alerts when CRM events occur.

## Setup

### 1. Gmail app password

1. Use a Google account with 2FA enabled
2. [App passwords](https://myaccount.google.com/apppasswords) → create one for "Mail"
3. Add to `D:\NexCRM\backend\.env`:

```
GMAIL_ADDRESS=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Restart the API after editing `.env`.

### 2. Configure tenant team email (tenant_admin JWT)

```powershell
$login = Invoke-RestMethod -Method POST -Uri http://localhost:8000/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

Invoke-RestMethod -Method PUT -Uri http://localhost:8000/email/config `
  -Headers $h -ContentType "application/json" `
  -Body '{"team_email":"team@globex.com","notifications_enabled":true}'
```

### 3. Send a test email

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:8000/email/test -Headers $h
```

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/email/config` | tenant_admin | Read team_email + notification toggle |
| PUT | `/email/config` | tenant_admin | Set team_email / notifications_enabled |
| POST | `/email/test` | tenant_admin | Send test message to team_email |

## Automatic triggers

| Event | Route | When email sends |
|-------|-------|------------------|
| New contact | `POST /contacts` | Always (if enabled + team_email set) |
| Deal won/lost | `PUT /deals/{id}` | Stage changes to `won` or `lost` |
| Task assigned | `POST /tasks`, `PUT /tasks/{id}` | `assigned_to` set or changed |

Email failures are logged but **do not fail** the CRM API request.

## Automated test (SMTP optional)

```powershell
D:\NexCRM\scripts\test-stage6.ps1
```

Without `GMAIL_*` configured, enable demo mode in `backend\.env`:

```
EMAIL_DEMO_MODE=true
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USE_TLS=false
```

Then run `D:\NexCRM\scripts\run-demo-smtp.ps1` in a separate terminal. Captured mail is written to `D:\NexCRM\.cache\email-demo.log`.

## Confirm before Stage 7

Configure Gmail, set `team_email`, run `/email/test`, create a contact, and confirm the inbox receives the notification — then continue to the React web frontend (Stage 7).
