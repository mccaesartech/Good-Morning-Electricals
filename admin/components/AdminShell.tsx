'use client';

import { useState } from 'react';
import type { AdminProfile } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/ToastProvider';
import Sidebar from './Sidebar';
import TopbarTitle from './TopbarTitle';

export default function AdminShell({
  children,
  profile
}: {
  children: React.ReactNode;
  profile: AdminProfile;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="admin-app">
        <Sidebar profile={profile} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-shell">
          <header className="topbar">
            <button
              type="button"
              className="topbar__toggle"
              aria-label="Toggle menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <TopbarTitle />
            <div className="topbar__actions">
              <div className="topbar__user">
                <span>🛡️</span>
                <span>{profile.email}</span>
              </div>
            </div>
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
