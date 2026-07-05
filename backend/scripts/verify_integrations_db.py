"""Verify telegram_groups and tenant_email_config rows exist in the database."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.models import TelegramGroup, Tenant, TenantEmailConfig

REQUIRED = {
    "globex": {
        "team_email": "team@globex.com",
        "telegram_chat_id": "-100999888777",
    },
    "acme": {
        "team_email": "team@acme.com",
        "telegram_chat_id": "-100777666555",
    },
}


def main() -> int:
    db = SessionLocal()
    ok = True
    try:
        for code, expected in REQUIRED.items():
            tenant = db.query(Tenant).filter(Tenant.company_code == code).first()
            if not tenant:
                print(f"FAIL {code}: tenant missing")
                ok = False
                continue

            email = db.query(TenantEmailConfig).filter(TenantEmailConfig.tenant_id == tenant.id).first()
            if not email or email.team_email != expected["team_email"]:
                print(f"FAIL {code}: tenant_email_config missing or wrong (got {email and email.team_email})")
                ok = False
            else:
                print(f"OK {code} email: team_email={email.team_email}, enabled={email.notifications_enabled}")

            tg = db.query(TelegramGroup).filter(TelegramGroup.tenant_id == tenant.id).first()
            if not tg or tg.chat_id != expected["telegram_chat_id"]:
                print(f"FAIL {code}: telegram_groups missing or wrong (got {tg and tg.chat_id})")
                ok = False
            else:
                print(f"OK {code} telegram: chat_id={tg.chat_id}, invite={tg.invite_link}")

        return 0 if ok else 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
