"""Send outbound messages via the Telegram Bot API."""

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


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
