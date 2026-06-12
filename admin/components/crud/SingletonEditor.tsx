'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/activity';
import { friendlyError } from '@/lib/errors';
import { notifyContentPublished } from '@/lib/notify';
import { STATUS_OPTIONS } from '@/lib/constants';
import Alert from '@/components/ui/Alert';
import PageHeader from '@/components/ui/PageHeader';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/ToastProvider';

export type SingletonField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'lines' | 'json-lines' | 'json';
  rows?: number;
  imageFolder?: string;
  col?: 'full' | 'half';
  placeholder?: string;
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

function jsonToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function parseJsonField(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return JSON.parse(trimmed);
}

export default function SingletonEditor({
  table,
  title,
  description,
  fields,
  entityLabel
}: SingletonEditorProps) {
  const toast = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        } else if (field.type === 'json') {
          initial[field.name] = jsonToString(val);
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

  async function saveRecord(publish: boolean) {
    if (saving) return;

    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form[field.name] ?? '';
      if (field.type === 'lines' || field.type === 'json-lines') {
        payload[field.name] = parseLines(raw);
      } else if (field.type === 'json') {
        try {
          payload[field.name] = parseJsonField(raw);
        } catch {
          const msg = `Invalid JSON in ${field.label}.`;
          setError(msg);
          toast.error(msg);
          setSaving(false);
          return;
        }
      } else {
        payload[field.name] = raw;
      }
    }

    if (publish) {
      payload.status = 'published';
      payload.published_at = new Date().toISOString();
    } else {
      payload.status = 'draft';
      payload.published_at = null;
    }

    const supabase = createClient();
    let savedId = recordId;

    if (recordId) {
      const { error: updateError } = await supabase.from(table).update(payload).eq('id', recordId);
      if (updateError) {
        const msg = friendlyError(updateError.message, 'Failed to save content');
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
      await logActivity('updated', table, `Updated ${entityLabel}`, recordId);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from(table)
        .insert(payload)
        .select('id')
        .single();
      if (insertError || !inserted) {
        const msg = friendlyError(insertError?.message ?? 'Insert failed', 'Failed to save content');
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
      savedId = inserted.id as string;
      setRecordId(savedId);
      await logActivity('created', table, `Created ${entityLabel}`, savedId);
    }

    if (publish) {
      notifyContentPublished();
      toast.success('Published — open the live site (or refresh) to see changes');
    } else {
      toast.success('Saved as draft — not visible on the live website until published');
    }

    setSaving(false);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    await saveRecord(true);
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    await saveRecord(false);
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
          <p className="field-hint">Published content appears on the live website.</p>
        </div>
      );
    }

    if (field.type === 'textarea' || field.type === 'lines' || field.type === 'json-lines' || field.type === 'json') {
      return (
        <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
          <label>{field.label}</label>
          <textarea
            rows={field.rows ?? (field.type === 'json' ? 6 : 3)}
            value={form[field.name] ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => setField(field.name, e.target.value)}
          />
          {field.type === 'json' && (
            <p className="field-hint">JSON array format, e.g. [{`{"number":"500+","label":"Students","count":500}`}]</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className={`form-field${field.col === 'half' ? ' form-field--half' : ''}`}>
        <label>{field.label}</label>
        <input
          type="text"
          value={form[field.name] ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      ) : (
        <form className="card singleton-form" onSubmit={handlePublish}>
          <div className="form-grid">{fields.map(renderField)}</div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Save & Publish'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={handleSaveDraft}
            >
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
