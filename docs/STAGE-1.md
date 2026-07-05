# Stage 1 — Backend Foundation

## What was built

- FastAPI app at `backend/app/main.py`
- SQLAlchemy models for **all** schema tables (`backend/app/models.py`)
- Alembic migration `001_initial_schema.py`
- Auth: `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- Reusable tenant dependency: `get_current_tenant_user` in `backend/app/dependencies.py`
- Role-based query helpers (ready for Stage 2): `backend/app/tenant_filters.py`

## Architecture note

Every protected route must use `Depends(get_current_tenant_user)`. The dependency:

1. Decodes JWT → `tenant_id`, `user_id`, `role`
2. Verifies user belongs to tenant and tenant is not suspended
3. Returns a `TenantUserContext` object for downstream filters

Sales-rep row filtering lives in `tenant_filters.py` and will be applied in Stage 2 CRUD routes.

## Setup (PowerShell — run from any directory)

```powershell
# Keep caches on D drive
$env:PIP_CACHE_DIR = "D:\NexCRM\.cache\pip"
$env:TEMP = "D:\NexCRM\.cache\temp"
$env:TMP = "D:\NexCRM\.cache\temp"
New-Item -ItemType Directory -Force -Path D:\NexCRM\.cache\pip, D:\NexCRM\.cache\temp | Out-Null

# Python virtual environment on D drive
cd D:\NexCRM\backend
python -m venv D:\NexCRM\.venv
D:\NexCRM\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure database (use your Supabase connection string — postgresql:// works; driver auto-added)
Copy-Item .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
#   JWT_SECRET=any-long-random-string-at-least-32-chars

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test commands

### 1. Health check

```powershell
curl http://localhost:8000/health
```

**Expected:** `{"status":"ok","service":"nexcrm-backend"}`

### 2. Signup (creates tenant + tenant_admin)

```powershell
curl -X POST http://localhost:8000/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"tenant_name":"Acme Corp","company_code":"acme","admin_name":"Jane Admin","admin_email":"jane@acme.com","password":"secret123"}'
```

**Expected:** HTTP 201 with JSON containing `access_token`, `tenant_id`, `role":"tenant_admin"`.

### 3. Login

```powershell
curl -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"jane@acme.com","password":"secret123","company_code":"acme"}'
```

**Expected:** HTTP 200 with a new `access_token`.

### 4. Protected route (JWT test)

Replace `YOUR_TOKEN` with the token from signup/login:

```powershell
curl http://localhost:8000/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** HTTP 200 with user profile (`id`, `email`, `role`, `tenant_id`).

### 5. Interactive API docs

Open http://localhost:8000/docs in a browser.

## Decision log

- **Email uniqueness:** Enforced per-tenant (`tenant_id + email`) rather than globally, because the same person could theoretically belong to two companies with different emails; global unique on email alone would block multi-tenant signup patterns.

## Confirm before Stage 2

Reply with the results of steps 1–4 (or any errors). Once signup, login, and `/auth/me` work against your Supabase database, I will build Stage 2 (contacts, deals, tasks CRUD + dashboard + seed script).
