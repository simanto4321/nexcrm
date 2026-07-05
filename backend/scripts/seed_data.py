"""
Seed NexCRM with 2 demo tenants, contacts, deals, and tasks.

Run from D:\\NexCRM\\backend:
    D:\\NexCRM\\.venv\\Scripts\\python.exe scripts\\seed_data.py

Skips tenants that already exist (by company_code).
"""

import sys
from datetime import datetime, timedelta
from pathlib import Path

# Allow running as: python scripts/seed_data.py
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.auth_utils import hash_password
from app.database import SessionLocal
from app.models import (
    Contact,
    Deal,
    DealStage,
    Task,
    TaskStatus,
    Tenant,
    TenantEmailConfig,
    TenantSettings,
    TenantStatus,
    TelegramGroup,
    User,
    UserRole,
)

TENANTS = [
    {
        "name": "Acme Corp",
        "company_code": "acme",
        "admin": {"name": "Jane Admin", "email": "jane@acme.com", "password": "secret123"},
        "sales_rep": {"name": "Bob Rep", "email": "bob@acme.com", "password": "secret123"},
        "contacts": [
            {"name": "Alice Johnson", "phone": "+1-555-0101", "email": "alice@techco.com", "status": "active"},
            {"name": "Carlos Mendez", "phone": "+1-555-0102", "email": "carlos@buildit.com", "status": "active"},
            {"name": "Diana Wu", "phone": "+1-555-0103", "email": "diana@startup.io", "status": "lead"},
        ],
        "deals": [
            {"contact_idx": 0, "stage": DealStage.negotiation, "value": 15000},
            {"contact_idx": 1, "stage": DealStage.contacted, "value": 8500},
            {"contact_idx": 2, "stage": DealStage.new, "value": 3200},
        ],
        "tasks": [
            {"title": "Call Alice re: proposal", "days": 2, "status": TaskStatus.pending, "assign": "rep"},
            {"title": "Send contract to Carlos", "days": 5, "status": TaskStatus.pending, "assign": "admin"},
        ],
        "integrations": {
            "team_email": "team@acme.com",
            "telegram_chat_id": "-100777666555",
            "telegram_invite_link": "https://t.me/acme_crm_demo",
        },
    },
    {
        "name": "Globex Industries",
        "company_code": "globex",
        "admin": {"name": "Sara Malik", "email": "sara@globex.com", "password": "secret123"},
        "sales_rep": {"name": "Tom Lee", "email": "tom@globex.com", "password": "secret123"},
        "contacts": [
            {"name": "Elena Petrova", "phone": "+44-20-7946-001", "email": "elena@eurotrade.eu", "status": "active"},
            {"name": "James Okafor", "phone": "+234-803-555-001", "email": "james@lagosbiz.ng", "status": "active"},
            {"name": "Mei Lin", "phone": "+86-10-5555-0001", "email": "mei@shanghaicorp.cn", "status": "inactive"},
        ],
        "deals": [
            {"contact_idx": 0, "stage": DealStage.won, "value": 42000},
            {"contact_idx": 1, "stage": DealStage.negotiation, "value": 12000},
            {"contact_idx": 2, "stage": DealStage.lost, "value": 5000},
        ],
        "tasks": [
            {"title": "Follow up with Elena", "days": 1, "status": TaskStatus.done, "assign": "rep"},
            {"title": "Prepare Q3 pipeline report", "days": 7, "status": TaskStatus.pending, "assign": "admin"},
        ],
        "integrations": {
            "team_email": "team@globex.com",
            "telegram_chat_id": "-100999888777",
            "telegram_invite_link": "https://t.me/globex_crm_demo",
        },
    },
]


def seed():
    db = SessionLocal()
    try:
        for tdata in TENANTS:
            existing = db.query(Tenant).filter(Tenant.company_code == tdata["company_code"]).first()
            if existing:
                print(f"Skip {tdata['company_code']} — already exists (id={existing.id})")
                continue

            tenant = Tenant(
                name=tdata["name"],
                company_code=tdata["company_code"],
                plan="free",
                status=TenantStatus.active,
            )
            db.add(tenant)
            db.flush()
            db.add(TenantSettings(tenant_id=tenant.id))

            admin = User(
                tenant_id=tenant.id,
                name=tdata["admin"]["name"],
                email=tdata["admin"]["email"],
                password_hash=hash_password(tdata["admin"]["password"]),
                role=UserRole.tenant_admin,
            )
            rep = User(
                tenant_id=tenant.id,
                name=tdata["sales_rep"]["name"],
                email=tdata["sales_rep"]["email"],
                password_hash=hash_password(tdata["sales_rep"]["password"]),
                role=UserRole.sales_rep,
            )
            db.add_all([admin, rep])
            db.flush()

            contacts = []
            for i, c in enumerate(tdata["contacts"]):
                contact = Contact(
                    tenant_id=tenant.id,
                    name=c["name"],
                    phone=c["phone"],
                    email=c["email"],
                    status=c["status"],
                    assigned_to=rep.id if i % 2 == 0 else admin.id,
                )
                db.add(contact)
                contacts.append(contact)
            db.flush()

            for d in tdata["deals"]:
                deal = Deal(
                    tenant_id=tenant.id,
                    contact_id=contacts[d["contact_idx"]].id,
                    stage=d["stage"],
                    value=d["value"],
                )
                db.add(deal)

            for t in tdata["tasks"]:
                assignee = rep if t["assign"] == "rep" else admin
                task = Task(
                    tenant_id=tenant.id,
                    title=t["title"],
                    due_date=datetime.utcnow() + timedelta(days=t["days"]),
                    status=t["status"],
                    assigned_to=assignee.id,
                )
                db.add(task)

            integ = tdata.get("integrations")
            if integ:
                db.add(
                    TenantEmailConfig(
                        tenant_id=tenant.id,
                        team_email=integ["team_email"],
                        notifications_enabled=True,
                    )
                )
                db.add(
                    TelegramGroup(
                        tenant_id=tenant.id,
                        chat_id=integ["telegram_chat_id"],
                        invite_link=integ["telegram_invite_link"],
                    )
                )

            db.commit()
            print(f"Created tenant '{tdata['name']}' ({tdata['company_code']}) — admin: {tdata['admin']['email']}")

        print("\nSeed complete. Login examples:")
        print("  jane@acme.com / secret123 / company_code=acme")
        print("  bob@acme.com  / secret123 / company_code=acme  (sales_rep)")
        print("  sara@globex.com / secret123 / company_code=globex")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
