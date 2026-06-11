'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminShell({
  children,
  email,
  title,
  subtitle
}: {
  children: React.ReactNode;
  email: string;
  title: string;
  subtitle: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
          <div className="topbar__title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="topbar__actions">
            <div className="topbar__user">
              <span>🛡️</span>
              <span>{email}</span>
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
