'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/activity';
import { STATUS_OPTIONS } from '@/lib/constants';
import Alert from '@/components/ui/Alert';
import PageHeader from '@/components/ui/PageHeader';
import ImageUpload from '@/components/ui/ImageUpload';

export type SingletonField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'lines' | 'json-lines';
  rows?: number;
  imageFolder?: string;
  col?: 'full' | 'half';
};

type SingletonEditorProps = {
  table: string;
  title: string;
  description?: string;
  fields: SingletonField[];
  entityLabel: string;
};

function parseLines(value: string): string[] {
  return value.split('\n').map((s) => s.trim()).filter(Boolean);
}

function linesToString(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value.map(String).join('\n');
}

export default function SingletonEditor({
  table,
  title,
  description,
  fields,
  entityLabel
}: SingletonEditorProps) {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: fetchError } = await supabase.from(table).select('*').limit(1).maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setRecordId(data.id as string);
      const initial: Record<string, string> = {};
      for (const field of fields) {
        const val = data[field.name];
        if (field.type === 'lines' || field.type === 'json-lines') {
          initial[field.name] = linesToString(val);
        } else {
          initial[field.name] = val === null || val === undefined ? '' : String(val);
        }
      }
      setForm(initial);
    }
    setLoading(false);
  }, [table, fields]);

  useEffect(() => {
    load();
  }, [load]);

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recordId) {
      setError('No record found in database.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form[field.name] ?? '';
      if (field.type === 'lines') {
        payload[field.name] = parseLines(raw);
      } else if (field.type === 'json-lines') {
        payload[field.name] = parseLines(raw);
      } else {
        payload[field.name] = raw;
      }
    }

    if (payload.status === 'published') {
      payload.published_at = new Date().toISOString();
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.from(table).update(payload).eq('id', recordId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await logActivity('updated', table, `Updated ${entityLabel}`, recordId);
    setSuccess(`${entityLabel} saved successfully.`);
    setSaving(false);
  }

  function renderField(field: SingletonField) {
    if (field.type === 'image') {
      return (
        <ImageUpload
          key={field.name}
          label={field.label}
          value={form[field.name] ?? ''}
          folder={field.imageFolder ?? 'branding'}
          onChange={(url) => setField(field.name, url)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
          <label>{field.label}</label>
          <select value={form[field.name] ?? ''} onChange={(e) => setField(field.name, e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'textarea' || field.type === 'lines' || field.type === 'json-lines') {
      return (
        <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
          <label>{field.label}</label>
          <textarea
            rows={field.rows ?? 3}
            value={form[field.name] ?? ''}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        </div>
      );
    }

    return (
      <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
        <label>{field.label}</label>
        <input
          type="text"
          value={form[field.name] ?? ''}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      <Alert type="error" message={error} onDismiss={() => setError('')} />
      <Alert type="success" message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      ) : (
        <form className="card singleton-form" onSubmit={handleSubmit}>
          <div className="form-grid">{fields.map(renderField)}</div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
