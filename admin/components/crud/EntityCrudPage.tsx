'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/activity';
import { friendlyError } from '@/lib/errors';
import { notifyContentPublished } from '@/lib/notify';
import { publicSiteUrl } from '@/lib/constants';
import {
  type EntityConfig,
  deserializeFieldValue,
  serializeFieldValue
} from '@/lib/entity-config';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/ToastProvider';

type Row = Record<string, unknown> & { id: string };

type EntityCrudPageProps = {
  config: EntityConfig;
  description?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function EntityCrudPage({ config, description }: EntityCrudPageProps) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from(config.table)
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      const msg = friendlyError(fetchError.message, 'Failed to load content');
      setError(msg);
      toast.error(msg);
      setRows([]);
    } else {
      setRows((data as Row[]) ?? []);
    }
    setLoading(false);
  }, [config.table]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...(config.defaultValues ?? {}), status: 'published' });
    setModalOpen(true);
    setError('');
  }

  function openEdit(row: Row) {
    setEditing(row);
    const initial: Record<string, unknown> = {};
    for (const field of config.fields) {
      initial[field.name] = deserializeFieldValue(field, row[field.name]);
    }
    setForm(initial);
    setModalOpen(true);
    setError('');
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function setField(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    for (const field of config.fields) {
      if (field.name === 'status') continue;
      if (field.required && !form[field.name]) {
        const msg = field.type === 'image'
          ? `${field.label} is required — upload a photo or paste an image URL.`
          : `${field.label} is required.`;
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
    }

    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.name === 'status') continue;
      payload[field.name] = serializeFieldValue(field, form[field.name]);
    }

    if (config.table === 'programmes' && !payload.slug && payload.title) {
      payload.slug = slugify(String(payload.title));
    }

    payload.status = 'published';
    payload.published_at = new Date().toISOString();

    const supabase = createClient();

    if (editing) {
      const { data: updated, error: updateError } = await supabase
        .from(config.table)
        .update(payload)
        .eq('id', editing.id)
        .select('id')
        .maybeSingle();

      if (updateError) {
        const msg = friendlyError(updateError.message, 'Failed to save content');
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      if (!updated) {
        const msg = 'Save failed — check you are logged in and have permission to edit this content.';
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      await logActivity('updated', config.table, `Updated ${config.labelSingular}: ${payload.title ?? payload.full_name ?? payload.caption ?? payload.question ?? editing.id}`, editing.id);

      notifyContentPublished();
      toast.success('Published — open the live site to see your changes');
    } else {
      const { data, error: insertError } = await supabase
        .from(config.table)
        .insert(payload)
        .select('id')
        .maybeSingle();

      if (insertError) {
        const msg = friendlyError(insertError.message, 'Failed to save content');
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      if (!data) {
        const msg = 'Create failed — check you are logged in and have permission to add this content.';
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      await logActivity('created', config.table, `Created ${config.labelSingular}: ${payload.title ?? payload.full_name ?? payload.caption ?? payload.question ?? data.id}`, data.id);

      notifyContentPublished();
      toast.success('Published — open the live site to see your changes');
    }

    setSaving(false);
    closeModal();
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError('');

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from(config.table)
      .delete()
      .eq('id', deleteTarget.id);

    if (deleteError) {
      const msg = friendlyError(deleteError.message, 'Failed to delete content');
      setError(msg);
      toast.error(msg);
      setDeleting(false);
      return;
    }

    const label = String(
      deleteTarget.title ?? deleteTarget.full_name ?? deleteTarget.caption ?? deleteTarget.question ?? deleteTarget.id
    );
    await logActivity('deleted', config.table, `Deleted ${config.labelSingular}: ${label}`, deleteTarget.id);

    notifyContentPublished();
    toast.success(`${config.labelSingular} deleted successfully`);
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  async function togglePublish(row: Row) {
    const newStatus = row.status === 'published' ? 'draft' : 'published';
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from(config.table)
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null
      })
      .eq('id', row.id);

    if (updateError) {
      const msg = friendlyError(updateError.message, 'Failed to publish content');
      setError(msg);
      toast.error(msg);
      return;
    }

    const label = String(row.title ?? row.full_name ?? row.caption ?? row.question ?? row.id);
    await logActivity(
      newStatus === 'published' ? 'published' : 'unpublished',
      config.table,
      `${newStatus === 'published' ? 'Published' : 'Unpublished'} ${config.labelSingular}: ${label}`,
      row.id
    );

    if (newStatus === 'published') {
      notifyContentPublished();
      toast.success('Changes published successfully');
    } else {
      notifyContentPublished();
      toast.success(`${config.labelSingular} unpublished`);
    }

    await load();
  }

  const formFields = config.fields.filter((field) => field.name !== 'status');

  function renderField(field: (typeof config.fields)[number]) {
    const value = form[field.name] ?? '';

    if (field.type === 'image') {
      return (
        <ImageUpload
          key={field.name}
          label={field.label}
          value={String(value)}
          folder={field.imageFolder ?? config.imageFolder ?? 'gallery'}
          onChange={(url) => setField(field.name, url)}
        />
      );
    }

    if (field.type === 'textarea' || field.type === 'lines') {
      return (
        <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
          <label>{field.label}{field.required && ' *'}</label>
          <textarea
            rows={field.rows ?? (field.type === 'lines' ? 4 : 3)}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        </div>
      );
    }

    return (
      <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
        <label>{field.label}{field.required && ' *'}</label>
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={config.label}
        description={description ?? `Manage ${config.label.toLowerCase()} on the public website.`}
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Add {config.labelSingular}
          </button>
        }
      />

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading {config.label.toLowerCase()}…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <p>No {config.label.toLowerCase()} yet.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Create first {config.labelSingular.toLowerCase()}
          </button>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((col) => (
                    <td key={col.key}>
                      {col.key === 'status' ? (
                        <StatusBadge status={String(row[col.key])} />
                      ) : (
                        String(row[col.key] ?? '—')
                      )}
                    </td>
                  ))}
                  <td className="data-table__actions">
                    <button type="button" className="btn btn-ghost-dark btn-sm" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => togglePublish(row)}
                    >
                      {row.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(row)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${config.labelSingular}` : `Add ${config.labelSingular}`}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSave}>
          <p className="field-hint" style={{ marginBottom: '1rem' }}>
            Saving always publishes to the live website. Use <strong>Unpublish</strong> in the table to hide an item.
          </p>
          <div className="form-grid">{formFields.map(renderField)}</div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Save & Publish'}
            </button>
            <a
              href={publicSiteUrl(true)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-dark"
            >
              View Live Site
            </a>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${config.labelSingular}?`}
        message={`This will permanently delete "${String(deleteTarget?.title ?? deleteTarget?.full_name ?? deleteTarget?.caption ?? deleteTarget?.question ?? '')}". This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
