"""Initial NexCRM schema

Revision ID: 001_initial
Revises:
Create Date: 2026-07-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "platform_admins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_platform_admins_email"), "platform_admins", ["email"], unique=True)
    op.create_index(op.f("ix_platform_admins_id"), "platform_admins", ["id"], unique=False)

    op.create_table(
        "tenants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("company_code", sa.String(length=64), nullable=False),
        sa.Column("plan", sa.String(length=64), nullable=False),
        sa.Column("status", sa.Enum("active", "suspended", name="tenant_status"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tenants_company_code"), "tenants", ["company_code"], unique=True)
    op.create_index(op.f("ix_tenants_id"), "tenants", ["id"], unique=False)

    op.create_table(
        "tenant_usage_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("active_users", sa.Integer(), nullable=False),
        sa.Column("storage_used", sa.Float(), nullable=False),
        sa.Column("logged_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tenant_usage_logs_id"), "tenant_usage_logs", ["id"], unique=False)
    op.create_index(op.f("ix_tenant_usage_logs_tenant_id"), "tenant_usage_logs", ["tenant_id"], unique=False)

    op.create_table(
        "tenant_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("logo_url", sa.String(length=512), nullable=True),
        sa.Column("theme_color", sa.String(length=32), nullable=True),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tenant_settings_id"), "tenant_settings", ["id"], unique=False)
    op.create_index(op.f("ix_tenant_settings_tenant_id"), "tenant_settings", ["tenant_id"], unique=True)

    op.create_table(
        "telegram_groups",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("chat_id", sa.String(length=64), nullable=False),
        sa.Column("invite_link", sa.String(length=512), nullable=True),
        sa.Column("connected_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_telegram_groups_id"), "telegram_groups", ["id"], unique=False)
    op.create_index(op.f("ix_telegram_groups_tenant_id"), "telegram_groups", ["tenant_id"], unique=True)

    op.create_table(
        "tenant_email_config",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("team_email", sa.String(length=255), nullable=True),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tenant_email_config_id"), "tenant_email_config", ["id"], unique=False)
    op.create_index(op.f("ix_tenant_email_config_tenant_id"), "tenant_email_config", ["tenant_id"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("tenant_admin", "sales_rep", name="user_role"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "email", name="uq_users_tenant_email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_tenant_id"), "users", ["tenant_id"], unique=False)

    op.create_table(
        "user_invites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("tenant_admin", "sales_rep", name="user_role", create_constraint=False), nullable=False),
        sa.Column("invited_by", sa.Integer(), nullable=True),
        sa.Column("status", sa.Enum("pending", "accepted", "expired", name="invite_status"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["invited_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_invites_id"), "user_invites", ["id"], unique=False)
    op.create_index(op.f("ix_user_invites_tenant_id"), "user_invites", ["tenant_id"], unique=False)

    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=True),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contacts_assigned_to"), "contacts", ["assigned_to"], unique=False)
    op.create_index(op.f("ix_contacts_id"), "contacts", ["id"], unique=False)
    op.create_index(op.f("ix_contacts_tenant_id"), "contacts", ["tenant_id"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.Enum("pending", "done", name="task_status"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tasks_assigned_to"), "tasks", ["assigned_to"], unique=False)
    op.create_index(op.f("ix_tasks_id"), "tasks", ["id"], unique=False)
    op.create_index(op.f("ix_tasks_tenant_id"), "tasks", ["tenant_id"], unique=False)

    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("channel", sa.Enum("app", "telegram", "email", name="chat_channel"), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chat_sessions_id"), "chat_sessions", ["id"], unique=False)
    op.create_index(op.f("ix_chat_sessions_tenant_id"), "chat_sessions", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_chat_sessions_user_id"), "chat_sessions", ["user_id"], unique=False)

    op.create_table(
        "deals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("stage", sa.Enum("new", "contacted", "negotiation", "won", "lost", name="deal_stage"), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_deals_contact_id"), "deals", ["contact_id"], unique=False)
    op.create_index(op.f("ix_deals_id"), "deals", ["id"], unique=False)
    op.create_index(op.f("ix_deals_tenant_id"), "deals", ["tenant_id"], unique=False)

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("sender", sa.Enum("user", "bot", "agent", name="message_sender"), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("voice_url", sa.String(length=512), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["chat_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chat_messages_id"), "chat_messages", ["id"], unique=False)
    op.create_index(op.f("ix_chat_messages_session_id"), "chat_messages", ["session_id"], unique=False)


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("deals")
    op.drop_table("chat_sessions")
    op.drop_table("tasks")
    op.drop_table("contacts")
    op.drop_table("user_invites")
    op.drop_table("users")
    op.drop_table("tenant_email_config")
    op.drop_table("telegram_groups")
    op.drop_table("tenant_settings")
    op.drop_table("tenant_usage_logs")
    op.drop_table("tenants")
    op.drop_table("platform_admins")
    op.execute("DROP TYPE IF EXISTS message_sender")
    op.execute("DROP TYPE IF EXISTS chat_channel")
    op.execute("DROP TYPE IF EXISTS deal_stage")
    op.execute("DROP TYPE IF EXISTS task_status")
    op.execute("DROP TYPE IF EXISTS invite_status")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS tenant_status")
