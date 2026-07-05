"""Shared chat session and message persistence for app and Telegram channels."""

from sqlalchemy.orm import Session

from app.models import ChatChannel, ChatMessage, ChatSession, MessageSender


def load_session_history(db: Session, session_id: int, limit: int = 20) -> list[dict[str, str]]:
    """Return recent messages as {role, text} for the AI prompt."""
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.sent_at.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    history: list[dict[str, str]] = []
    for row in rows:
        role = "user" if row.sender == MessageSender.user else "assistant"
        history.append({"role": role, "text": row.text})
    return history


def save_chat_exchange(db: Session, session_id: int, user_message: str, reply: str) -> None:
    db.add(ChatMessage(session_id=session_id, sender=MessageSender.user, text=user_message))
    db.add(ChatMessage(session_id=session_id, sender=MessageSender.bot, text=reply))


def get_or_create_channel_session(
    db: Session,
    *,
    tenant_id: int,
    channel: ChatChannel,
    user_id: int | None = None,
) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.tenant_id == tenant_id,
            ChatSession.channel == channel,
        )
        .order_by(ChatSession.started_at.desc())
        .first()
    )
    if session:
        return session

    session = ChatSession(tenant_id=tenant_id, user_id=user_id, channel=channel)
    db.add(session)
    db.flush()
    return session
