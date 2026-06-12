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
| 19 | `20250611000019_content_manager_settings_contact.sql` | Contact + settings perms |
| 20 | `20250611000020_contact_map_and_notifications.sql` | Map coordinates |
| 21 | `20250611000021_staff_gallery_permissions.sql` | Staff/gallery perms |
| 22 | `20250611000022_facilities_gallery_sections.sql` | Gallery section singleton + RPC |
| 23 | `20250611000023_staff_section.sql` | Staff section singleton + RPC |
| 24 | `20250611000024_publish_draft_content.sql` | Publish draft rows |
| 25 | `20250611000025_ensure_rpc_grant.sql` | RPC execute grant |

**Quick path:** paste `supabase/RUN_MIGRATIONS_019_TO_024.sql` in SQL Editor if 019–024 were skipped.

## After SQL

1. Deploy Edge Function: `supabase/functions/send-notification`
2. Create Database Webhooks (Supabase Dashboard → Database → Webhooks):
   - **Table** `contact_enquiries`, event `INSERT` → `send-notification`
   - **Table** `enrolments`, event `INSERT` → `send-notification`
3. Set **Vercel** environment variables (Settings → Environment Variables):
   - `SUPABASE_SERVICE_ROLE_KEY` — required for User Management
   - `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL` — enrolment email notifications
   - `AT_USERNAME`, `AT_API_KEY`, `SMS_SENDER_ID` — optional SMS notifications
4. Set Edge Function secrets (backup): same `RESEND_*` and `AT_*` values
