"""SQLAlchemy ORM models matching the NexCRM schema."""

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class TenantStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"


class UserRole(str, enum.Enum):
    tenant_admin = "tenant_admin"
    sales_rep = "sales_rep"


class InviteStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    expired = "expired"


class DealStage(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    negotiation = "negotiation"
    won = "won"
    lost = "lost"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    done = "done"


class ChatChannel(str, enum.Enum):
    app = "app"
    telegram = "telegram"
    email = "email"


class MessageSender(str, enum.Enum):
    user = "user"
    bot = "bot"
    agent = "agent"


# ---------------------------------------------------------------------------
# Platform-level tables (super admin only)
# ---------------------------------------------------------------------------


class PlatformAdmin(Base):
    __tablename__ = "platform_admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    plan: Mapped[str] = mapped_column(String(64), default="free", nullable=False)
    status: Mapped[TenantStatus] = mapped_column(
        Enum(TenantStatus, name="tenant_status"), default=TenantStatus.active, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    users: Mapped[list["User"]] = relationship("User", back_populates="tenant")
    settings: Mapped["TenantSettings | None"] = relationship("TenantSettings", back_populates="tenant", uselist=False)


class TenantUsageLog(Base):
    __tablename__ = "tenant_usage_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    active_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    storage_used: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


# ---------------------------------------------------------------------------
# Tenant-admin-only tables
# ---------------------------------------------------------------------------


class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    theme_color: Mapped[str | None] = mapped_column(String(32), default="#2563eb", nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), default="UTC", nullable=True)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="settings")


class TelegramGroup(Base):
    __tablename__ = "telegram_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    chat_id: Mapped[str] = mapped_column(String(64), nullable=False)
    invite_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    connected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class TenantEmailConfig(Base):
    __tablename__ = "tenant_email_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    team_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class UserInvite(Base):
    __tablename__ = "user_invites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    invited_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[InviteStatus] = mapped_column(
        Enum(InviteStatus, name="invite_status"), default=InviteStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


# ---------------------------------------------------------------------------
# Shared tenant-scoped tables
# ---------------------------------------------------------------------------


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_users_tenant_email"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role", create_constraint=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str | None] = mapped_column(String(64), default="active", nullable=True)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id: Mapped[int | None] = mapped_column(ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    stage: Mapped[DealStage] = mapped_column(
        Enum(DealStage, name="deal_stage"), default=DealStage.new, nullable=False
    )
    value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status"), default=TaskStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    channel: Mapped[ChatChannel] = mapped_column(
        Enum(ChatChannel, name="chat_channel"), default=ChatChannel.app, nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    messages: Mapped[list["ChatMessage"]] = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender: Mapped[MessageSender] = mapped_column(Enum(MessageSender, name="message_sender"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    voice_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
