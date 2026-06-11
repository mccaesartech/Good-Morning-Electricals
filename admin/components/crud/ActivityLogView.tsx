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

const ACTION_OPTIONS = [
  'all', 'login', 'logout', 'created', 'updated', 'deleted',
  'published', 'unpublished', 'activated', 'deactivated', 'password_reset', 'uploaded'
];

export default function ActivityLogView() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    let query = supabase
      .from('activity_log')
      .select('id, action, entity, summary, user_email, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (actionFilter !== 'all') query = query.eq('action', actionFilter);
    if (entityFilter.trim()) query = query.ilike('entity', `%${entityFilter.trim()}%`);
    if (userFilter.trim()) query = query.ilike('user_email', `%${userFilter.trim()}%`);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows((data as ActivityRow[]) ?? []);
    }
    setLoading(false);
  }, [actionFilter, entityFilter, userFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Read-only audit trail: logins, content changes, and user management."
        actions={
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
        }
      />

      <div className="filter-bar card">
        <div className="form-field form-field--half">
          <label>Action</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>
            ))}
          </select>
        </div>
        <div className="form-field form-field--half">
          <label>Entity / content</label>
          <input
            type="text"
            placeholder="e.g. programmes"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
        </div>
        <div className="form-field form-field--half">
          <label>User email</label>
          <input
            type="text"
            placeholder="admin@example.com"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
      </div>

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
                <th>Date / Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Content</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>{row.user_email ?? '—'}</td>
                  <td><span className="action-pill">{row.action}</span></td>
                  <td>{row.entity}</td>
                  <td>{row.summary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
