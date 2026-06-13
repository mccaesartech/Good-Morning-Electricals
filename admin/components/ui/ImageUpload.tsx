'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/storage';
import { friendlyError } from '@/lib/errors';
import { useToast } from '@/components/ui/ToastProvider';
import { adminPath } from '@/lib/constants';

type ImageUploadProps = {
  label: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
};

export default function ImageUpload({ label, value, folder, onChange }: ImageUploadProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [aiEditing, setAiEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploading || aiEditing) return;

    setUploading(true);
    setError('');

    const result = await uploadImage(file, folder);
    if ('error' in result) {
      const msg = friendlyError(result.error, 'Failed to upload image');
      setError(msg);
      toast.error(msg);
    } else {
      onChange(result.url);
      toast.success('Image uploaded — click Save & Publish to show on the live website');
    }

    setUploading(false);
    e.target.value = '';
  }

  async function handleAiEdit() {
    if (!value || !aiPrompt.trim() || aiEditing || uploading) return;

    setAiEditing(true);
    setError('');

    try {
      const res = await fetch(adminPath('/api/ai/edit-image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: value, prompt: aiPrompt.trim(), folder })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = friendlyError(data.error, 'AI image edit failed');
        setError(msg);
        toast.error(msg);
      } else {
        onChange(data.url);
        toast.success('AI edit applied — click Save & Publish to update the live website');
      }
    } catch {
      const msg = 'AI image edit failed. Please try again.';
      setError(msg);
      toast.error(msg);
    }

    setAiEditing(false);
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      {value && (
        <div className="image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" />
        </div>
      )}
      <div className="image-upload-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload below"
          disabled={uploading || aiEditing}
        />
        <label className={`btn btn-secondary btn-sm image-upload-btn${uploading ? ' btn--loading' : ''}`}>
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFile} hidden disabled={uploading || aiEditing} />
        </label>
      </div>
      <div className="image-ai-panel">
        <label className="image-ai-label">Edit with AI (describe your changes)</label>
        <textarea
          rows={3}
          value={aiPrompt}
          placeholder="e.g. Brighten the image, remove background clutter, make colours warmer, crop to center the person"
          onChange={(e) => setAiPrompt(e.target.value)}
          disabled={!value || uploading || aiEditing}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAiEdit}
          disabled={!value || !aiPrompt.trim() || uploading || aiEditing}
        >
          {aiEditing ? 'Editing with AI…' : 'Apply AI Edit'}
        </button>
        <p className="field-hint">Requires OPENAI_API_KEY in Vercel. Edited images are saved to your website storage — publish to go live.</p>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
