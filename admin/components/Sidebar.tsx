'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
  active?: boolean;
};

const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [{ href: '/dashboard', label: 'Dashboard', active: true }] },
  {
    group: 'Content',
    items: [
      { href: '#', label: 'Hero Section', disabled: true },
      { href: '#', label: 'Programmes', disabled: true },
      { href: '#', label: 'Facilities', disabled: true },
      { href: '#', label: 'Staff', disabled: true },
      { href: '#', label: 'Gallery', disabled: true }
    ]
  },
  {
    group: 'Settings',
    items: [
      { href: '#', label: 'Site Settings', disabled: true },
      { href: '#', label: 'Contact Info', disabled: true }
    ]
  }
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="" width={40} height={40} style={{ borderRadius: 8 }} />
        <div>
          <strong>GME Admin</strong>
          <span>Content Manager</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="sidebar__group">{section.group}</p>
            {section.items.map((item) => (
              <Link
                key={item.label}
                href={item.disabled ? '#' : item.href}
                className={`nav-item${pathname === item.href ? ' active' : ''}${item.disabled ? ' disabled' : ''}`}
                aria-disabled={item.disabled || undefined}
                onClick={onClose}
              >
                {item.label}
                {item.disabled && <span className="badge-phase">Phase D</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <Link href="/" target="_blank" className="btn btn-ghost btn-sm" style={{ textAlign: 'center' }}>
          View Site
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
