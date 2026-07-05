# Stage 4 — Voice & Media Chat Widget

Floating support bubble (bottom-right) with **text**, **photo attach**, and **voice (mic)**. Speech-to-text and text-to-speech run in the browser; the backend only receives text via `POST /chatbot/message`.

## Demo

Open in **Chrome or Edge**:

**http://localhost:8000/voice-demo/**

1. Click the **blue chat bubble** (bottom-right)
2. Sign in (Globex test user pre-filled)
3. Use the toolbar:
   - **📷 Attach** — pick a photo (JPEG/PNG/GIF/WebP, max 5 MB); shows preview before send
   - **🎤 Mic** — speak; transcript is sent as a message
   - **Text field + send** — type or paste text
4. Bot replies appear in bubbles; toggle **speaker icon** in header for voice readout

Photos are shown in the chat UI; the AI receives a text note about the attachment (vision not enabled on `llama3.2:1b`).

## How it works

| Feature | Where |
|---------|--------|
| Floating UI | `D:\NexCRM\voice-demo\index.html` |
| Speech → text | Browser `SpeechRecognition` |
| Photo preview | Client-side only; caption sent as text |
| AI reply | `POST /chatbot/message` → Ollama |
| Text → speech | Browser `speechSynthesis` (toggle in header) |

Mobile (Stage 8) will reuse the same API with `@react-native-voice/voice` + `expo-speech`.

## Prerequisites

- Backend: `D:\NexCRM\scripts\run-backend.ps1`
- Ollama: `D:\NexCRM\scripts\run-ollama.ps1`

## Test script

```powershell
D:\NexCRM\scripts\test-stage3-4.ps1
```

## Confirm before Stage 5

Test the floating widget in Chrome, then continue to Telegram (`STAGE-5.md`).
