# Stage 2 — Core CRM Endpoints

## What was built

- `GET/POST/PUT/DELETE /contacts` — tenant-scoped; sales_rep sees only assigned contacts
- `GET/POST/PUT/DELETE /deals` — tenant-scoped; sales_rep sees deals for their contacts
- `GET/POST/PUT/DELETE /tasks` — tenant-scoped; sales_rep sees only their tasks
- `GET /dashboard` — `{ total_contacts, deals_by_stage, pending_tasks }`

## Seed data

```powershell
$env:TEMP = "D:\NexCRM\.cache\temp"
cd D:\NexCRM\backend
D:\NexCRM\.venv\Scripts\python.exe scripts\seed_data.py
```

Creates **Acme Corp** (`acme`) and **Globex Industries** (`globex`) with contacts, deals, and tasks.
Skips tenants that already exist.

### Login accounts after seed

| Email | Password | Company code | Role |
|-------|----------|--------------|------|
| jane@acme.com | secret123 | acme | tenant_admin |
| bob@acme.com | secret123 | acme | sales_rep |
| sara@globex.com | secret123 | globex | tenant_admin |
| tom@globex.com | secret123 | globex | sales_rep |

## Test commands

Start server (if not running): `D:\NexCRM\scripts\run-backend.ps1`

```powershell
# Login as Jane (Acme admin)
$login = Invoke-RestMethod -Method POST -Uri http://localhost:8000/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"jane@acme.com","password":"secret123","company_code":"acme"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

# Dashboard
Invoke-RestMethod http://localhost:8000/dashboard -Headers $h | ConvertTo-Json

# List contacts
Invoke-RestMethod http://localhost:8000/contacts -Headers $h | ConvertTo-Json

# Create contact
Invoke-RestMethod -Method POST -Uri http://localhost:8000/contacts -Headers $h `
  -ContentType "application/json" `
  -Body '{"name":"New Lead","email":"lead@example.com","phone":"555-9999"}' | ConvertTo-Json
```

**Expected dashboard (after seed):** `total_contacts: 3`, deals across stages, `pending_tasks: 2`.

## Confirm before Stage 3

Test dashboard + at least one CRUD operation, then reply to continue to AI chatbot (Stage 3).
