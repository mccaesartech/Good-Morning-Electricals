'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/activity';
import { useProfile } from '@/components/ProfileProvider';
import { canManage } from '@/lib/permissions';
import Alert from '@/components/ui/Alert';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { friendlyError } from '@/lib/errors';

type SubmissionType = 'enquiries' | 'enrolments';

type Config = {
  table: 'contact_enquiries' | 'enrolments';
  title: string;
  description: string;
  managePermission: 'manage_enquiries' | 'manage_enrolments';
  statusOptions: { value: string; label: string }[];
  entityLabel: string;
};

const CONFIGS: Record<SubmissionType, Config> = {
  enquiries: {
    table: 'contact_enquiries',
    title: 'Enquiries',
    description: 'Contact form messages from the public website.',
    managePermission: 'manage_enquiries',
    entityLabel: 'enquiry',
    statusOptions: [
      { value: 'all', label: 'All' },
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'archived', label: 'Archived' }
    ]
  },
  enrolments: {
    table: 'enrolments',
    title: 'Enrolments',
    description: 'Online enrolment applications from the public website.',
    managePermission: 'manage_enrolments',
    entityLabel: 'enrolment',
    statusOptions: [
      { value: 'all', label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'admitted', label: 'Admitted' },
      { value: 'archived', label: 'Archived' }
    ]
  }
};

type Row = Record<string, unknown> & { id: string };

export default function SubmissionsManager({ type }: { type: SubmissionType }) {
  const config = CONFIGS[type];
  const profile = useProfile();
  const canEdit = canManage(profile.permissions, config.managePermission);
  const toast = useToast();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    let query = supabase.from(config.table).select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows((data as Row[]) ?? []);
    }
    setLoading(false);
  }, [config.table, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    if (!canEdit || saving) return;
    setSaving(true);
    setError('');
    const supabase = createClient();
    const payload: Record<string, unknown> = { status };
    if (status === 'contacted') payload.contacted_at = new Date().toISOString();
    if (status === 'admitted') payload.admitted_at = new Date().toISOString();

    const { error: updateError } = await supabase.from(config.table).update(payload).eq('id', id);
    if (updateError) {
      const msg = friendlyError(updateError.message, 'Failed to save content');
      setError(msg);
      toast.error(msg);
    } else {
      toast.success('Content saved successfully');
      await logActivity('updated', config.table, `Updated ${config.entityLabel} status to ${status}`, id);
      setSelected(null);
      await load();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !canEdit || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from(config.table).delete().eq('id', deleteTarget.id);
    if (deleteError) {
      const msg = friendlyError(deleteError.message, 'Failed to delete content');
      setError(msg);
      toast.error(msg);
    } else {
      await logActivity('deleted', config.table, `Deleted ${config.entityLabel}`, deleteTarget.id);
      toast.success('Entry deleted successfully');
      setDeleteTarget(null);
      setSelected(null);
      await load();
    }
    setSaving(false);
  }

  return (
    <>
      <PageHeader title={config.title} description={config.description} />

      <div className="filter-bar card">
        <div className="form-field form-field--half">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {config.statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {!canEdit && (
          <p className="read-only-notice">Read-only access — you can view submissions but not change status.</p>
        )}
      </div>

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      {loading ? (
        <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
      ) : rows.length === 0 ? (
        <div className="empty-state"><p>No submissions yet.</p></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(String(row.created_at)).toLocaleDateString()}</td>
                  <td>{String(row.full_name)}</td>
                  <td><a href={`mailto:${row.email}`}>{String(row.email)}</a></td>
                  <td>{String(row.programme ?? '—')}</td>
                  <td><span className="action-pill">{String(row.status)}</span></td>
                  <td className="data-table__actions">
                    <button type="button" className="btn btn-ghost-dark btn-sm" onClick={() => setSelected(row)}>
                      View
                    </button>
                    {canEdit && type === 'enquiries' && row.status === 'new' && (
                      <button type="button" className="btn btn-secondary btn-sm" disabled={saving}
                        onClick={() => updateStatus(row.id, 'contacted')}>Mark Contacted</button>
                    )}
                    {canEdit && type === 'enrolments' && row.status === 'pending' && (
                      <button type="button" className="btn btn-secondary btn-sm" disabled={saving}
                        onClick={() => updateStatus(row.id, 'contacted')}>Mark Contacted</button>
                    )}
                    {canEdit && type === 'enrolments' && row.status !== 'admitted' && (
                      <button type="button" className="btn btn-primary btn-sm" disabled={saving}
                        onClick={() => updateStatus(row.id, 'admitted')}>Mark Admitted</button>
                    )}
                    {canEdit && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(row)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{String(selected.full_name)}</h3>
              <button type="button" className="modal__close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal__body submission-detail">
              <p><strong>Email:</strong> {String(selected.email)}</p>
              <p><strong>Phone:</strong> {String(selected.phone ?? '—')}</p>
              <p><strong>Programme:</strong> {String(selected.programme ?? '—')}</p>
              {selected.message != null && String(selected.message) !== '' && (
                <p><strong>Message:</strong><br />{String(selected.message)}</p>
              )}
              {selected.education_level != null && String(selected.education_level) !== '' && (
                <p><strong>Education:</strong> {String(selected.education_level)}</p>
              )}
              <p><strong>Submitted:</strong> {new Date(String(selected.created_at)).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete submission?"
        message="This permanently removes the submission. This cannot be undone."
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
