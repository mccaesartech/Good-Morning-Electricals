'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LogoutButton from './LogoutButton';

type NavItem = { href: string; label: string };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/activity', label: 'Activity Log' }
    ]
  },
  {
    group: 'Content',
    items: [
      { href: '/hero', label: 'Hero Section' },
      { href: '/programmes', label: 'Programmes' },
      { href: '/facilities', label: 'Facilities' },
      { href: '/staff', label: 'Staff' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/testimonials', label: 'Testimonials' },
      { href: '/faq', label: 'FAQ' }
    ]
  },
  {
    group: 'Settings',
    items: [
      { href: '/settings', label: 'Site Settings' },
      { href: '/contact', label: 'Contact Info' }
    ]
  }
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar__brand">
        <Logo width={40} height={40} style={{ borderRadius: 8 }} alt="" />
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
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(pathname, item.href) ? ' active' : ''}`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <Link href="/" target="_blank" className="btn btn-ghost btn-sm sidebar-view-site">
          View Site
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
