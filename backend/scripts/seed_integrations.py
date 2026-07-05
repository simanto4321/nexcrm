"""
Seed or update tenant integration config (telegram_groups + tenant_email_config).

Run from D:\\NexCRM\\backend:
    D:\\NexCRM\\.venv\\Scripts\\python.exe scripts\\seed_integrations.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.auth_utils import hash_password
from app.database import SessionLocal
from app.models import PlatformAdmin, TelegramGroup, Tenant, TenantEmailConfig

# Demo integration data stored in DB (not .env)
INTEGRATIONS = {
    "globex": {
        "team_email": "team@globex.com",
        "notifications_enabled": True,
        "telegram_chat_id": "-100999888777",
        "telegram_invite_link": "https://t.me/globex_crm_demo",
    },
    "acme": {
        "team_email": "team@acme.com",
        "notifications_enabled": True,
        "telegram_chat_id": "-100777666555",
        "telegram_invite_link": "https://t.me/acme_crm_demo",
    },
}


def upsert_integrations(db, tenant: Tenant, data: dict) -> None:
    email_cfg = db.query(TenantEmailConfig).filter(TenantEmailConfig.tenant_id == tenant.id).first()
    if email_cfg:
        email_cfg.team_email = data["team_email"]
        email_cfg.notifications_enabled = data["notifications_enabled"]
    else:
        db.add(
            TenantEmailConfig(
                tenant_id=tenant.id,
                team_email=data["team_email"],
                notifications_enabled=data["notifications_enabled"],
            )
        )

    tg = db.query(TelegramGroup).filter(TelegramGroup.tenant_id == tenant.id).first()
    if tg:
        tg.chat_id = data["telegram_chat_id"]
        tg.invite_link = data["telegram_invite_link"]
    else:
        db.add(
            TelegramGroup(
                tenant_id=tenant.id,
                chat_id=data["telegram_chat_id"],
                invite_link=data["telegram_invite_link"],
            )
        )


def seed_platform_admin(db) -> None:
    admin = db.query(PlatformAdmin).filter(PlatformAdmin.email == "admin@nexcrm.com").first()
    if admin:
        print("OK platform admin already exists")
        return
    db.add(
        PlatformAdmin(
            name="NexCRM Super Admin",
            email="admin@nexcrm.com",
            password_hash=hash_password("admin123"),
        )
    )
    db.commit()
    print("OK platform admin: admin@nexcrm.com / admin123")


def seed_integrations():
    db = SessionLocal()
    try:
        seed_platform_admin(db)
        for company_code, data in INTEGRATIONS.items():
            tenant = db.query(Tenant).filter(Tenant.company_code == company_code).first()
            if not tenant:
                print(f"Skip {company_code} — tenant not found (run seed_data.py first)")
                continue
            upsert_integrations(db, tenant, data)
            db.commit()
            print(
                f"OK {company_code}: team_email={data['team_email']}, "
                f"telegram chat_id={data['telegram_chat_id']}"
            )
        print("\nIntegration seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_integrations()
