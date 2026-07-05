# NexCRM Entity Relationship Overview

```mermaid
erDiagram
    tenants ||--o{ users : has
    tenants ||--o| tenant_settings : has
    tenants ||--o| telegram_groups : has
    tenants ||--o| tenant_email_config : has
    tenants ||--o{ contacts : has
    tenants ||--o{ deals : has
    tenants ||--o{ tasks : has
    tenants ||--o{ chat_sessions : has
    users ||--o{ contacts : assigned
    users ||--o{ tasks : assigned
    contacts ||--o{ deals : linked
    chat_sessions ||--o{ chat_messages : contains
```

All tenant-scoped tables include `tenant_id` FK → `tenants.id`.

Platform-level tables (`platform_admins`, `tenant_usage_logs`) are not tenant-filtered; they are super-admin only (Stage 7).
