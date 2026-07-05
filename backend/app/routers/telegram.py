"""Telegram bot webhook and tenant chat registration."""

import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import TenantUserContext, require_tenant_admin
from app.models import ChatChannel, TelegramGroup, Tenant
from app.schemas import TelegramRegisterRequest, TelegramStatusResponse, TelegramWebhookResponse
from app.services.chat_storage import get_or_create_channel_session, load_session_history, save_chat_exchange
from app.services.chatbot import get_chat_reply
from app.services.telegram_client import send_telegram_message

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telegram", tags=["telegram"])


def _verify_webhook_secret(x_telegram_bot_api_secret_token: str | None) -> None:
    expected = settings.telegram_webhook_secret.strip()
    if not expected:
        return
    if x_telegram_bot_api_secret_token != expected:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid webhook secret")


@router.get("/status", response_model=TelegramStatusResponse)
def telegram_status(
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    """Return whether this tenant has a Telegram group linked."""
    group = db.query(TelegramGroup).filter(TelegramGroup.tenant_id == ctx.tenant_id).first()
    if not group:
        return TelegramStatusResponse(connected=False, chat_id=None, invite_link=None, connected_at=None)
    return TelegramStatusResponse(
        connected=True,
        chat_id=group.chat_id,
        invite_link=group.invite_link,
        connected_at=group.connected_at,
    )


@router.post("/register", response_model=TelegramStatusResponse)
def register_telegram_chat(
    body: TelegramRegisterRequest,
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    """
    Link a Telegram group chat_id to this tenant (tenant_admin only).
    Get chat_id by adding @userinfobot or your bot to the group and reading the id.
    """
    group = db.query(TelegramGroup).filter(TelegramGroup.tenant_id == ctx.tenant_id).first()
    if group:
        group.chat_id = body.chat_id.strip()
        group.invite_link = body.invite_link
    else:
        group = TelegramGroup(
            tenant_id=ctx.tenant_id,
            chat_id=body.chat_id.strip(),
            invite_link=body.invite_link,
        )
        db.add(group)
    db.commit()
    db.refresh(group)
    return TelegramStatusResponse(
        connected=True,
        chat_id=group.chat_id,
        invite_link=group.invite_link,
        connected_at=group.connected_at,
    )


@router.post("/webhook", response_model=TelegramWebhookResponse)
async def telegram_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    """
    Receives Telegram Bot API updates. Looks up tenant by chat_id, stores messages,
    replies via Ollama (same pipeline as /chatbot/message).
    """
    _verify_webhook_secret(x_telegram_bot_api_secret_token)
    update = await request.json()

    message = update.get("message") or update.get("edited_message")
    if not message:
        return TelegramWebhookResponse(ok=True, handled=False)

    chat = message.get("chat") or {}
    chat_id = str(chat.get("id", ""))
    text = (message.get("text") or "").strip()
    if not chat_id:
        return TelegramWebhookResponse(ok=True, handled=False)

    group = db.query(TelegramGroup).filter(TelegramGroup.chat_id == chat_id).first()
    if not group:
        logger.info("Telegram message from unregistered chat_id=%s", chat_id)
        send_telegram_message(
            chat_id,
            "This chat is not linked to a NexCRM tenant. A tenant admin must register the chat_id via POST /telegram/register.",
        )
        return TelegramWebhookResponse(ok=True, handled=False, detail="unregistered_chat")

    tenant = db.query(Tenant).filter(Tenant.id == group.tenant_id).first()
    if not tenant:
        return TelegramWebhookResponse(ok=True, handled=False, detail="tenant_not_found")

    if not text:
        send_telegram_message(chat_id, "Please send a text message. I can help with contacts, deals, and tasks.")
        return TelegramWebhookResponse(ok=True, handled=True, detail="non_text_message")

    session = get_or_create_channel_session(db, tenant_id=tenant.id, channel=ChatChannel.telegram)
    history = load_session_history(db, session.id)
    reply, source = get_chat_reply(
        tenant_name=tenant.name,
        user_message=text,
        conversation_history=history,
    )
    save_chat_exchange(db, session.id, text, reply)
    db.commit()

    sent = send_telegram_message(chat_id, reply)
    return TelegramWebhookResponse(ok=True, handled=True, source=source, reply_sent=sent)
