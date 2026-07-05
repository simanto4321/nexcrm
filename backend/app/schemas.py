"""Pydantic v2 request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class SignupRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2, max_length=255)
    company_code: str = Field(..., min_length=2, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    admin_name: str = Field(..., min_length=2, max_length=255)
    admin_email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    company_code: str = Field(..., description="Tenant company code used at signup")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    tenant_id: int
    role: str
    tenant_name: str


class UserResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Contacts
# ---------------------------------------------------------------------------


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=64)
    email: str | None = Field(None, max_length=255)
    status: str | None = Field("active", max_length=64)
    assigned_to: int | None = None


class ContactUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=64)
    email: str | None = Field(None, max_length=255)
    status: str | None = Field(None, max_length=64)
    assigned_to: int | None = None


class ContactResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    phone: str | None
    email: str | None
    status: str | None
    assigned_to: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Deals
# ---------------------------------------------------------------------------


class DealCreate(BaseModel):
    contact_id: int | None = None
    stage: str = Field("new", pattern=r"^(new|contacted|negotiation|won|lost)$")
    value: float = Field(0.0, ge=0)


class DealUpdate(BaseModel):
    contact_id: int | None = None
    stage: str | None = Field(None, pattern=r"^(new|contacted|negotiation|won|lost)$")
    value: float | None = Field(None, ge=0)


class DealResponse(BaseModel):
    id: int
    tenant_id: int
    contact_id: int | None
    stage: str
    value: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)
    due_date: datetime | None = None
    status: str = Field("pending", pattern=r"^(pending|done)$")
    assigned_to: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=512)
    due_date: datetime | None = None
    status: str | None = Field(None, pattern=r"^(pending|done)$")
    assigned_to: int | None = None


class TaskResponse(BaseModel):
    id: int
    tenant_id: int
    assigned_to: int | None
    title: str
    due_date: datetime | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


class DashboardResponse(BaseModel):
    total_contacts: int
    deals_by_stage: dict[str, int]
    pending_tasks: int


# ---------------------------------------------------------------------------
# Chatbot
# ---------------------------------------------------------------------------


class ChatHistoryItem(BaseModel):
    role: str = Field(..., pattern=r"^(user|assistant)$")
    text: str = Field(..., min_length=1)


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: list[ChatHistoryItem] = Field(default_factory=list)
    session_id: int | None = None


class ChatMessageResponse(BaseModel):
    reply: str
    session_id: int
    source: str = Field(..., description="ollama or faq_fallback")


# ---------------------------------------------------------------------------
# Telegram
# ---------------------------------------------------------------------------


class TelegramRegisterRequest(BaseModel):
    chat_id: str = Field(..., min_length=1, max_length=64, description="Telegram group chat id")
    invite_link: str | None = Field(default=None, max_length=512)


class TelegramStatusResponse(BaseModel):
    connected: bool
    chat_id: str | None = None
    invite_link: str | None = None
    connected_at: datetime | None = None


class TelegramWebhookResponse(BaseModel):
    ok: bool
    handled: bool = False
    source: str | None = None
    reply_sent: bool | None = None
    detail: str | None = None


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------


class EmailConfigRequest(BaseModel):
    team_email: EmailStr | None = None
    notifications_enabled: bool = True


class EmailConfigResponse(BaseModel):
    team_email: str | None = None
    notifications_enabled: bool = True
    smtp_configured: bool = False


class EmailTestResponse(BaseModel):
    sent: bool
    message: str
