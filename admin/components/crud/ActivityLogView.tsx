'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Alert from '@/components/ui/Alert';
import PageHeader from '@/components/ui/PageHeader';

type ActivityRow = {
  id: string;
  action: string;
  entity: string;
  summary: string | null;
  user_email: string | null;
  created_at: string;
};

export default function ActivityLogView() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('activity_log')
      .select('id, action, entity, summary, user_email, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows((data as ActivityRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Audit trail of all admin actions. This log is read-only."
        actions={
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
        }
      />

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading activity…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state"><p>No activity recorded yet.</p></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Summary</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td><span className="action-pill">{row.action}</span></td>
                  <td>{row.entity}</td>
                  <td>{row.summary ?? '—'}</td>
                  <td>{row.user_email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
