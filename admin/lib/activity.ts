import { createClient } from '@/lib/supabase/client';

export type AuditAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'deleted'
  | 'uploaded'
  | 'restored';

export async function logActivity(
  action: AuditAction,
  entity: string,
  summary: string,
  entityId?: string
): Promise<void> {
  const supabase = createClient();
  await supabase.rpc('write_activity_log', {
    p_action: action,
    p_entity: entity,
    p_entity_id: entityId ?? null,
    p_summary: summary,
    p_metadata: {}
  });
}
