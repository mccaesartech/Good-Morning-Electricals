# Supabase Migrations — Phase A–E (Run Manually)

Run these **in order** in the Supabase SQL Editor after migrations `001`–`009` are applied.

| Order | File | Purpose |
|-------|------|---------|
| 10 | `20250611000010_roles_permissions_enums.sql` | New roles, permissions enum, audit actions |
| 11 | `20250611000011_role_permissions.sql` | Role → permission defaults |
| 12 | `20250611000012_admin_users_enhancements.sql` | `last_login_at`, `custom_permissions` |
| 13 | `20250611000013_contact_enquiries.sql` | Contact submissions table |
| 14 | `20250611000014_enrolments.sql` | Enrolment applications table |
| 15 | `20250611000015_functions.sql` | Permissions, submit RPCs, login tracking |
| 16 | `20250611000016_rls_policies.sql` | RLS for new tables |
| 17 | `20250611000017_grants.sql` | Execute grants |
| 18 | `20250611000018_migrate_editor_users.sql` | `editor` → `content_manager` |

## After SQL

1. Deploy Edge Function: `supabase/functions/send-notification`
2. Create Database Webhooks (Supabase Dashboard → Database → Webhooks):
   - **Table** `contact_enquiries`, event `INSERT` → `send-notification`
   - **Table** `enrolments`, event `INSERT` → `send-notification`
3. Set Edge Function secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`
