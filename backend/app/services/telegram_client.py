"""Send outbound messages via the Telegram Bot API."""

import logging

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import TelegramGroup

logger = logging.getLogger(__name__)


def bot_configured() -> bool:
    return bool(settings.telegram_bot_token.strip())


def send_telegram_message(chat_id: str, text: str) -> bool:
    """Post a text message to a Telegram chat. Returns True if sent."""
    token = settings.telegram_bot_token.strip()
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set — skipping outbound Telegram message")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text[:4096]}
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            return True
    except Exception as exc:
        logger.exception("Failed to send Telegram message to %s: %s", chat_id, exc)
        return False


def send_tenant_telegram(db: Session, tenant_id: int, text: str) -> bool:
    """Send a message to the tenant's registered Telegram group, if any."""
    group = db.query(TelegramGroup).filter(TelegramGroup.tenant_id == tenant_id).first()
    if not group or not group.chat_id:
        return False
    return send_telegram_message(group.chat_id, text)


def get_bot_info() -> dict | None:
    """Return Telegram getMe payload or None if bot token missing/invalid."""
    token = settings.telegram_bot_token.strip()
    if not token:
        return None
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(f"https://api.telegram.org/bot{token}/getMe")
            response.raise_for_status()
            data = response.json()
            return data.get("result") if data.get("ok") else None
    except Exception as exc:
        logger.warning("Telegram getMe failed: %s", exc)
        return None
