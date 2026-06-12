'use client';

import { useCallback, useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/ToastProvider';
import { friendlyError } from '@/lib/errors';
import {
  PERMISSIONS,
  ROLE_LABELS,
  permissionLabel,
  type AdminRole,
  type Permission
} from '@/lib/permissions';

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  custom_permissions: Permission[] | null;
};

const ROLES: AdminRole[] = ['superadmin', 'content_manager', 'staff_manager', 'viewer'];

export default function UsersManager() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'content_manager' as AdminRole,
    custom_permissions: [] as Permission[]
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/admin/api/users');
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? 'Failed to load users');
      setUsers([]);
    } else {
      setUsers(json.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ email: '', password: '', full_name: '', role: 'content_manager', custom_permissions: [] });
    setModalOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      email: user.email,
      password: '',
      full_name: user.full_name ?? '',
      role: user.role,
      custom_permissions: user.custom_permissions ?? []
    });
    setModalOpen(true);
  }

  function togglePerm(perm: Permission) {
    setForm((f) => ({
      ...f,
      custom_permissions: f.custom_permissions.includes(perm)
        ? f.custom_permissions.filter((p) => p !== perm)
        : [...f.custom_permissions, perm]
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');

    let ok = false;
    if (editing) {
      const res = await fetch(`/admin/api/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          role: form.role,
          custom_permissions: form.custom_permissions.length ? form.custom_permissions : null
        })
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = friendlyError(json.error ?? 'Update failed', 'Failed to save content');
        setError(msg);
        toast.error(msg);
      } else {
        toast.success('User updated successfully');
        ok = true;
      }
    } else {
      const res = await fetch('/admin/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
          custom_permissions: form.custom_permissions.length ? form.custom_permissions : null
        })
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = friendlyError(json.error ?? 'Create failed', 'Failed to save content');
        setError(msg);
        toast.error(msg);
      } else {
        toast.success('User created successfully');
        ok = true;
      }
    }

    setSaving(false);
    if (ok) {
      setModalOpen(false);
      await load();
    }
  }

  async function toggleActive(user: AdminUser) {
    const res = await fetch(`/admin/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !user.active })
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = friendlyError(json.error, 'Failed to update user');
      setError(msg);
      toast.error(msg);
    } else {
      toast.success(user.active ? 'User deactivated successfully' : 'User activated successfully');
      await load();
    }
  }

  async function resetPassword(user: AdminUser) {
    const res = await fetch(`/admin/api/users/${user.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = friendlyError(json.error, 'Failed to send reset email');
      setError(msg);
      toast.error(msg);
    } else {
      toast.success(`Password reset email sent to ${user.email}`);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || saving) return;
    setSaving(true);
    const res = await fetch(`/admin/api/users/${deleteTarget.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) {
      const msg = friendlyError(json.error, 'Failed to delete user');
      setError(msg);
      toast.error(msg);
    } else {
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      await load();
    }
    setSaving(false);
  }

  return (
    <>
      <PageHeader
        title="User Management"
        description="Super Admin only — create users, assign roles and permissions."
        actions={<button type="button" className="btn btn-primary" onClick={openCreate}>+ Create Admin</button>}
      />

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      {loading ? (
        <div className="loading-state"><div className="spinner" /><p>Loading users…</p></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name ?? '—'}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td><span className={`status-badge status-badge--${u.active ? 'published' : 'draft'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  <td>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td>
                  <td className="data-table__actions">
                    <button type="button" className="btn btn-ghost-dark btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleActive(u)}>
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => resetPassword(u)}>Reset Password</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Admin' : 'Create Admin'} onClose={() => setModalOpen(false)} wide>
        <form onSubmit={handleSave}>
          {!editing && (
            <>
              <div className="form-field">
                <label>Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Password *</label>
                <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </>
          )}
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Custom permissions (optional overrides)</label>
            <div className="perm-grid">
              {PERMISSIONS.map((p) => (
                <label key={p} className="perm-check">
                  <input
                    type="checkbox"
                    checked={form.custom_permissions.includes(p)}
                    onChange={() => togglePerm(p)}
                  />
                  {permissionLabel(p)}
                </label>
              ))}
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete admin user?"
        message={`Permanently delete ${deleteTarget?.email}? This removes their auth account.`}
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
