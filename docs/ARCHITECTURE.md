# NexCRM Architecture (Stage 1)

## Stack

| Layer | Technology |
|-------|------------|
| API | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (python-jose) + bcrypt (passlib) |

## Tenant isolation flow

```
Request → Bearer JWT → get_current_tenant_user()
                              │
                              ├─ decode tenant_id, user_id, role
                              ├─ load User WHERE id AND tenant_id
                              ├─ reject if tenant suspended
                              └─ return TenantUserContext
                                        │
                    Stage 2+ routes ────┴── tenant_filters.*_query(ctx)
```

## ER diagram (high level)

See `docs/ER-DIAGRAM.md` (updated each stage).
