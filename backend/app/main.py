"""NexCRM FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, chatbot, contacts, dashboard, deals, email, platform, tasks, telegram

app = FastAPI(
    title="NexCRM API",
    description="Multi-tenant CRM",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(chatbot.router)
app.include_router(telegram.router)
app.include_router(email.router)
app.include_router(platform.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "nexcrm-backend"}


_voice_demo = Path(__file__).resolve().parents[2] / "voice-demo"
if _voice_demo.is_dir():
    app.mount("/voice-demo", StaticFiles(directory=str(_voice_demo), html=True), name="voice-demo")
