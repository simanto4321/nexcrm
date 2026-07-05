# Stage 3 — AI Chatbot (Ollama)

## Model: Ollama (local, free, unlimited)

The chatbot uses **Ollama** running on your PC — no API key, no usage limits.

Default model: `llama3.2:1b` (small and fast).

### Automatic setup (recommended)

A download may already be in progress. To finish install + start + test:

```powershell
D:\NexCRM\scripts\finish-ollama-setup.ps1
```

Or first-time full install:

```powershell
D:\NexCRM\scripts\install-ollama.bat
```

Models are stored at `D:\NexCRM\.ollama\models`.

### Manual steps

1. Download: https://ollama.com/download/windows (or use our D-drive installer script)
2. Set user env: `OLLAMA_MODELS=D:\NexCRM\.ollama\models`
3. Run: `ollama pull llama3.2:1b` then `ollama serve`

## Backend config (`backend/.env`)

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT_SECONDS=120
```

Other good models: `phi3`, `mistral`, `llama3.2:1b` (smaller/faster).

## Test

```powershell
$login = Invoke-RestMethod -Method POST -Uri http://localhost:8000/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"sara@globex.com","password":"secret123","company_code":"globex"}'
$h = @{ Authorization = "Bearer $($login.access_token)" }

$body = '{"message":"How do I add a contact?","conversation_history":[]}'
Invoke-RestMethod -Method POST -Uri http://localhost:8000/chatbot/message `
  -Headers $h -ContentType "application/json" -Body $body | ConvertTo-Json
```

**Expected with Ollama running:** `"source": "ollama"` and a natural language reply.

**If Ollama is off:** `"source": "faq_fallback"` with built-in FAQ answers.

## Confirm before Stage 4

Start Ollama, test `/chatbot/message`, then open the voice demo at **http://localhost:8000/voice-demo/** (see `STAGE-4.md`).
