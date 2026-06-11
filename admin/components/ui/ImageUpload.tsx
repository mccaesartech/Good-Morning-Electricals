'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/storage';

type ImageUploadProps = {
  label: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
};

export default function ImageUpload({ label, value, folder, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const result = await uploadImage(file, folder);
    if ('error' in result) {
      setError(result.error);
    } else {
      onChange(result.url);
    }

    setUploading(false);
    e.target.value = '';
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
        />
        <label className="btn btn-secondary btn-sm image-upload-btn">
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFile} hidden disabled={uploading} />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
