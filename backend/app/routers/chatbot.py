"""AI chatbot — text messages via Ollama with FAQ fallback."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, assert_resource_tenant, get_current_tenant_user
from app.models import ChatChannel, ChatSession
from app.schemas import ChatMessageRequest, ChatMessageResponse
from app.services.chat_storage import save_chat_exchange
from app.services.chatbot import get_chat_reply

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


def _get_or_create_session(
    db: Session, ctx: TenantUserContext, session_id: int | None
) -> ChatSession:
    if session_id is not None:
        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id,
                ChatSession.tenant_id == ctx.tenant_id,
                ChatSession.user_id == ctx.user_id,
            )
            .first()
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        assert_resource_tenant(session.tenant_id, ctx)
        return session

    session = ChatSession(
        tenant_id=ctx.tenant_id,
        user_id=ctx.user_id,
        channel=ChatChannel.app,
    )
    db.add(session)
    db.flush()
    return session


@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    body: ChatMessageRequest,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    """
    Send a user message; get an AI reply via local Ollama.
    tenant_id comes from JWT. Stores messages in chat_sessions / chat_messages.
    """
    session = _get_or_create_session(db, ctx, body.session_id)

    history = [{"role": h.role, "text": h.text} for h in body.conversation_history]
    reply, source = get_chat_reply(
        tenant_name=ctx.tenant.name,
        user_message=body.message,
        conversation_history=history,
    )

    save_chat_exchange(db, session.id, body.message, reply)
    db.commit()

    return ChatMessageResponse(reply=reply, session_id=session.id, source=source)
